import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as moment from 'moment-timezone';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ResetDailyRightsService {
  private readonly logger = new Logger(ResetDailyRightsService.name);
  private readonly TZ = 'Asia/Bangkok';

  // promotion perioods
  private readonly PROMOTION_PERIODS_BKK: Array<{ start: moment.Moment; end: moment.Moment }> = [
    { start: moment.tz('2025-10-23 00:00:00', this.TZ), end: moment.tz('2025-10-31 23:59:59', this.TZ) }, //prod
    //{ start: moment.tz('2025-10-13 00:00:00', this.TZ), end: moment.tz('2025-10-31 23:59:59', this.TZ) }, //test
    { start: moment.tz('2025-11-25 00:00:00', this.TZ), end: moment.tz('2025-12-03 23:59:59', this.TZ) },
  ];

  constructor(private readonly prisma: PrismaService) {}

  private isInPromotionBkk(d: moment.Moment): boolean {
    // compare using full seconds (inclusive)
    return this.PROMOTION_PERIODS_BKK.some(({ start, end }) =>
      d.isBetween(start, end, 'second', '[]'),
    );
  }

  /**
   * Midnight (Asia/Bangkok):
   * - If today is in promo OR yesterday was in promo:
   *     • Expire all DailyRedemptionRight for dates < today (isExpired=true)
   *     • Reset user.rights = 0   (same-day mirror)
   * - Otherwise skip (do nothing)
   */
  @Cron('0 0 * * *', { timeZone: 'Asia/Bangkok' })
  async expireAndResetDailyRights() {
    const nowBkk = moment().tz(this.TZ);
    const todayKey = nowBkk.format('YYYY-MM-DD');               // "YYYY-MM-DD" in BKK
    const todayDate = new Date(todayKey);                       // safe for @db.Date
    const yesterdayBkk = nowBkk.clone().subtract(1, 'day');

    const inPromoToday = this.isInPromotionBkk(nowBkk);
    const inPromoYesterday = this.isInPromotionBkk(yesterdayBkk);

    // If we’re not in a promo and yesterday wasn’t promo either, skip to avoid doing work outside campaign windows.
    if (!inPromoToday && !inPromoYesterday) {
      this.logger.log(`[CRON] skip: ${todayKey} is outside promotion and so was yesterday.`);
      return;
    }

    this.logger.log(`[CRON] expire/reset start for ${todayKey} (promoToday=${inPromoToday}, promoYesterday=${inPromoYesterday})`);

    await this.prisma.$transaction(async (tx) => {
      // 1) Always expire past rows (this will close the last promo day at the next midnight)
      const expireRes = await tx.dailyRedemptionRight.updateMany({
        where: {
          isExpired: false,
          dateEarned: { lt: todayDate },
        },
        data: {
          isExpired: true,
          updatedAt: new Date(),
        },
      });

      // 2) Reset user.rights if:
      //    - Today is promo (normal daily reset), OR
      //    - Yesterday was promo (rollover after last promo day)
      let resetUsersCount = 0;
      if (inPromoToday || inPromoYesterday) {
        const reset = await tx.user.updateMany({
          where: { rights: { gt: 0 } },   // only users who actually have rights
          data: { rights: 0, updatedAt: new Date() },
        });
        resetUsersCount = reset.count;
      }

      this.logger.log(
        `[CRON] expired rows=${expireRes.count}, reset user.rights=${resetUsersCount}`,
      );
    });

    this.logger.log('[CRON] expire/reset finished');
  }

  /**
   * Optional housekeeping (e.g. weekly): delete very old expired rows
   */
//   @Cron('0 3 * * 0', { timeZone: 'Asia/Bangkok' })
//   async cleanupOldExpiredDailyRights() {
//     const cutoff = moment().tz(this.TZ).subtract(60, 'days').startOf('day');
//     const cutoffDate = new Date(cutoff.format('YYYY-MM-DD'));
//     const delRes = await this.prisma.dailyRedemptionRight.deleteMany({
//       where: { isExpired: true, dateEarned: { lt: cutoffDate } },
//     });
//     this.logger.log(`[CRON] cleanup removed ${delRes.count} old expired rows`);
//   }
}
