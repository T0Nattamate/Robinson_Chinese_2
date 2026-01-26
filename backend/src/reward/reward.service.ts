import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
    Inject,
    LoggerService,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedeemRewardDto, RewardType } from './dto/reward.dto';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as moment from 'moment-timezone';

@Injectable()
export class RewardService {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(WINSTON_MODULE_NEST_PROVIDER)
        private readonly logger: LoggerService,
    ) { }

    async getAvailableRewards(branchId: string) {
        // 1. Get Movie Stock (Branch specific)
        const movieStock = await this.prisma.branchStock.findFirst({
            where: { branchId, redeemId: RewardType.MOVIE, isEnable: true },
        });

        // 2. Get Gold Stock (Branch specific)
        const goldAStock = await this.prisma.branchStock.findFirst({
            where: { branchId, redeemId: RewardType.GOLD_A, isEnable: true },
        });

        const goldBStock = await this.prisma.branchStock.findFirst({
            where: { branchId, redeemId: RewardType.GOLD_B, isEnable: true },
        });

        return [
            {
                redeemId: RewardType.MOVIE,
                rewardName: 'บัตรชมภาพยนตร์ 2 ใบ',
                remainStock: movieStock?.amount || 0,
                isEnable: movieStock?.isEnable || false,
            },
            {
                redeemId: RewardType.GOLD_A,
                rewardName: 'ส่วนลดค่ากำเหน็จ 40%',
                remainStock: goldAStock?.amount || 0,
                isEnable: goldAStock?.isEnable || false,
            },
            {
                redeemId: RewardType.GOLD_B,
                rewardName: 'ส่วนลดค่ากำเหน็จ 500.-',
                remainStock: goldBStock?.amount || 0,
                isEnable: goldBStock?.isEnable || false,
            },
        ];
    }

    async redeemReward(data: RedeemRewardDto, lineId: string) {
        const { branchId, redeemId } = data;

        // 1. Validate User
        const user = await this.prisma.user.findUnique({ where: { lineId } });
        if (!user) {
            throw new NotFoundException('ไม่พบผู้ใช้งาน');
        }

        // 2. Validate Branch
        const branch = await this.prisma.branch.findUnique({ where: { branchId } });
        if (!branch) {
            throw new NotFoundException('ไม่พบสาขา');
        }

        // 3. Get Today's Rights
        const nowBkk = moment().tz('Asia/Bangkok');
        const todayStr = nowBkk.format('YYYY-MM-DD');
        const dateOnly = new Date(todayStr);

        const daily = await this.prisma.dailyRedemptionRight.findUnique({
            where: {
                unique_user_date: {
                    lineId,
                    dateEarned: dateOnly,
                },
            },
        });

        if (!daily) {
            throw new ConflictException('คุณยังไม่มีสิทธิ์แลกรางวัลในวันนี้');
        }

        if (daily.usedRights > 0) {
            throw new ConflictException('คุณได้ใช้สิทธิ์แลกของรางวัลประจำวันไปแล้ว');
        }

        // 4. Check Eligibility, History and Stock
        const isBoth = redeemId === RewardType.BOTH_GOLD;
        const targets = isBoth
            ? [RewardType.GOLD_A, RewardType.GOLD_B]
            : [redeemId];


        for (const target of targets) {
            let isEligible = false;
            const d = daily as any;
            if (target === RewardType.MOVIE) isEligible = d.eligibleMovie;
            else if (target === RewardType.GOLD_A) isEligible = d.eligibleGoldA;
            else if (target === RewardType.GOLD_B) isEligible = d.eligibleGoldB;

            if (!isEligible) {
                throw new ConflictException('คุณยังทำยอดสะสมไม่ถึงเกณฑ์สำหรับรางวัลนี้');
            }

            const stock = await this.prisma.branchStock.findFirst({
                where: { branchId, redeemId: target, isEnable: true, amount: { gt: 0 } },
            });

            if (!stock) {
                throw new ConflictException(`ของรางวัล ${target} หมดแล้ว`);
            }
        }

        // 5. Atomic Transaction
        return await this.prisma.$transaction(async (tx) => {
            for (const target of targets) {
                // Update Stock
                await tx.branchStock.update({
                    where: {
                        branchId_redeemId: {
                            branchId,
                            redeemId: target,
                        },
                    },
                    data: {
                        amount: { decrement: 1 },
                        gotRedeemded: { increment: 1 },
                        updatedAt: new Date(),
                    },
                });

                // Create History
                await tx.claimedHistory.create({
                    data: {
                        lineId,
                        branchId,
                        redeemId: target,
                        fullname: user.fullname,
                        phone: user.phone,
                        branchName: branch.branchName,
                        claimedAmount: 1,
                        claimedAt: new Date(),
                    },
                });
            }

            // Mark Daily Right as Used
            await tx.dailyRedemptionRight.update({
                where: { id: daily.id },
                data: {
                    usedRights: { increment: 1 },
                    updatedAt: new Date(),
                },
            });

            return { message: 'แลกรับรางวัลสำเร็จ' };
        });
    }
}
