import { PrismaService } from 'src/prisma/prisma.service';
import { ClaimedActionDto, RegisterUserDto } from './dto/user.dto';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import * as moment from 'moment';
import 'moment/locale/th';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { bagPoint, luckydrawPoint } from 'src/utils/variables';
//import { RedisService } from 'src/redis/redis.service';
import { WebsocketGateway } from 'src/utils/websocket.gateway';


export type AccPointsByBranch = {
  accPointsByBranchID: number;
  branchId: string | null;
  branchName: string | null;
  lineId: string | null;
  fullname: string;
  point: number | null;
};

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    //private readonly redisService: RedisService,
    private readonly websocketGateway: WebsocketGateway,
  ) { }

  async createUser(data: RegisterUserDto) {
    // Check for duplicate phone number
    const existingPhoneUser = await this.prisma.user.findUnique({
      where: { phone: data.phone },
    });

    if (existingPhoneUser) {
      this.logger.error(`this phone has already used ${data.phone}`);
      throw new ConflictException('หมายเลขโทรศัพท์นี้ถูกใช้งานแล้ว');
    }

    // Check for duplicate lineId
    const existingLineIdUser = await this.prisma.user.findUnique({
      where: { lineId: data.lineId },
    });

    if (existingLineIdUser) {
      this.logger.error(`this LINE ID has already used ${data.lineId}`);
      throw new ConflictException('Line ID นี้ถูกใช้งานแล้ว');
    }

    const userInput: Prisma.UserCreateInput = {
      ...data,
      isTheOne:
        data.isTheOne !== undefined && data.isTheOne !== null
          ? data.isTheOne
          : false,
      createdAt: new Date(),
      updatedAt: new Date(),
      accPoints: 0,
      rights: 0,
      accRights: 0,
      mostBranchId: null,
      mostBranchName: null,
    };

    const createdUser = await this.prisma.user.create({
      data: userInput,
    });
    const jwt = await this.authService.generateUserJwt(userInput);
    this.logger.log(`new user registered with LINE ID ${data.lineId}`);

    return {
      user: createdUser,
      jwt,
    };
  }

  async loginWithLineId(lineId: string, lineProfilePic?: string) {
    // 1️⃣ Try fetching from Redis first
    // const cachedUser = await this.redisService.get(`user:${lineId}`);

    // if (cachedUser) {
    //   this.logger.log(`User found in Redis cache: ${lineId}`);
    //   const jwt = await this.authService.generateUserJwt(cachedUser);
    //   return {
    //     ...cachedUser,
    //     jwt,
    //     message: 'เข้าสู่ระบบสำเร็จ (จาก Redis Cache)',
    //   };
    // }
    // Find the user by lineId
    const user = await this.prisma.user.findUnique({
      where: { lineId },
    });

    if (!user) {
      this.logger.error(
        `Not found user with this LINE ID: ${lineId} :loginWithLineId`,
      );

      throw new NotFoundException('ไม่พบผู้ใช้ที่เข้าสู่ระบบด้วย Line ID นี้');
    }

    const jwt = await this.authService.generateUserJwt(user);

    // Update lineProfilePic if it has a different value
    if (lineProfilePic && user.lineProfilePic !== lineProfilePic) {
      const updatedUser = await this.prisma.user.update({
        where: { lineId },
        data: { lineProfilePic },
      });

      this.logger.log(
        `This user has updated new lineProfilePic: ${lineId} :loginWithLineId`,
      );

      // 4️⃣ Update Redis Cache
      //await this.redisService.set(`user:${lineId}`, updatedUser, 3600);

      return {
        user: updatedUser,
        jwt,
        message: 'เข้าสู่ระบบสำเร็จและข้อมูลรูปโปรไฟล์ของคุณได้รับการอัปเดต',
      };
    }
    this.logger.log(`User logged in with lineId: ${lineId} :loginWithLineId`);

    // 5️⃣ Cache the user in Redis
    //await this.redisService.set(`user:${lineId}`, user, 3600); // Cache for 1 hour

    return {
      ...user,
      jwt,
      message: 'เข้าสู่ระบบสำเร็จ',
    };
  }

  async getUserInfo(lineId: string) {
    const user = await this.prisma.user.findUnique({ where: { lineId } });
    if (!user) {
      this.logger.error(`Not found this user id: ${lineId} :getUserInfo`);
      throw new NotFoundException('ไม่พบผู้ใช้หมายเลขนี้');
    }

    const nowBkk = moment().tz('Asia/Bangkok');
    const todayStr = nowBkk.format('YYYY-MM-DD');
    const dateOnly = new Date(todayStr);

    // Get today's daily row (if any)
    const daily = await this.prisma.dailyRedemptionRight.findFirst({
      where: { lineId, dateEarned: dateOnly, isExpired: false },
    });

    // We treat redeemRights as today's remaining
    const todaysRemaining = daily ? Math.max(0, (daily.redeemRights ?? 0) - (daily.usedRights ?? 0)) : 0;

    // accRights is still derived from accPoints/luckydrawPoint, if you want to keep that behavior:
    const accPoints = Number(user.accPoints ?? 0);
    const accRights = Math.floor(accPoints / 1000); // lucky draw rule

    // Sync user.rights to today's remaining (optional but keeps it consistent with your UI)
    const updatedUser = await this.prisma.user.update({
      where: { lineId },
      data: {
        rights: todaysRemaining,
        accRights, // keep in sync with accPoints if desired
      },
    });

    // Get today's claimed history to check what's already used
    const todayClaims = await this.prisma.claimedHistory.findMany({
      where: {
        lineId,
        claimedAt: {
          gte: dateOnly,
          lte: moment(dateOnly).endOf('day').toDate(),
        },
      },
    });

    const usedMovie = todayClaims.some(c => c.redeemId === 'redeem001');
    const usedGold = todayClaims.some(c => c.redeemId === 'redeem003' || c.redeemId === 'redeem004');

    this.websocketGateway.sendUserInfoUpdate(lineId, {
      user: updatedUser,
      message: 'User info updated in real-time',
    });

    return {
      user: {
        ...updatedUser,
        eligibleMovie: (daily as any)?.eligibleMovie || false,
        eligibleGoldA: (daily as any)?.eligibleGoldA || false,
        eligibleGoldB: (daily as any)?.eligibleGoldB || false,
        usedMovie,
        usedGold,
      },
      message: 'success fetch user info',
    };
  }


  async getReceiptHistory(lineId: string, pageSize: number, cursor?: number) {
    //find user
    const user = await this.prisma.user.findUnique({
      where: { lineId },
    });

    if (!user) {
      this.logger.error('Not found this user id', lineId, ':getReceiptHistory');
      throw new NotFoundException('ไม่พบผู้ใช้หมายเลขนี้');
    }

    //find user's receipt History
    const receipts = await this.prisma.receipt.findMany({
      take: pageSize, // Limit number of receipts to `pageSize`
      skip: cursor ? 1 : 0,
      cursor: cursor ? { receiptId: cursor } : undefined,
      where: { lineId },
      orderBy: {
        uploadedAt: 'desc', // Optional: Sort by receiptDate in descending order
      },
    });

    const totalCount = await this.prisma.receipt.count({ where: { lineId } });
    if (receipts.length === 0) {
      return {
        message: 'No more receipt history available',
        receiptHistory: [],
      };
    }

    moment.locale('th');

    const receiptHistory = receipts.map((receipt) => {
      return {
        receiptId: receipt.receiptId,
        receiptNo: receipt.receiptNo,
        receiptDate: moment(receipt.receiptDate).format('DD MMM YYYY HH:mm น.'),
        amount: receipt.amount,
        branchId: receipt.branchId,
        branchName: receipt.branchName,
        storeId: receipt.storeId,
        storeName: receipt.storeName,
        receiptImage: receipt.receiptImage,
        status: receipt.status,
        uploadedAt: receipt.uploadedAt,
        updatedAt: receipt.updatedAt,
      };
    });

    const nextCursor =
      receipts.length === pageSize
        ? receipts[receipts.length - 1].receiptId // Use redemptionId as the cursor
        : null;

    this.logger.log(
      `Fetch user receipt history lineId: ${lineId} :getReceiptHistory`,
    );
    return {
      message: 'Receipt history fetched successfully',
      receiptHistory,
      nextCursor,
      totalCount,
      pageSize,
    };
  }

  // async getVipLists() {
  //   const vipList = await this.prisma.$queryRaw<AccPointsByBranch[]>`
  //   SELECT DISTINCT ON (apb."branchId", apb."lineId") apb.*
  //   FROM "accPointsByBranch" apb
  //   JOIN "Branch" b On apb."branchId" = b."branchId"
  //   WHERE apb."point" >= b."vipPoint" AND b."isBranchEnable" = true AND b."canVip" = true
  //   ORDER BY apb."branchId", apb."lineId", apb."point" DESC;
  // `;

  //   const vipLists = vipList.map((list: any) => {
  //     return {
  //       accPointsByBranchID: list.accPointsByBranchID,
  //       branchId: list.branchId,
  //       branchName: list.branchName,
  //       lineId: list.lineId,
  //       fullname: list.fullname,
  //       phone: list.phone,
  //       point: list.point,
  //     };
  //   });

  //   this.logger.log(`Fetch VIP list: getVipLists`);
  //   return vipLists;
  // }
  // Get top spenders
  async getTopSpender() {
    try {
      // Fetch top 15 users ordered by accumulatedAmount
      const topUsers = await this.prisma.user.findMany({
        where: {
          accPoints: {
            gte: 20000,
          },
        },
        take: 15,
        orderBy: {
          accPoints: 'desc',
        },
        select: {
          lineId: true,
          fullname: true,
          accPoints: true,
          phone: true,
        },
      });

      this.logger.log(`getTopSpender : Found ${topUsers.length} top spenders`);

      // Iterate through each top user to fetch their most frequent branch
      const rankedUsers = await Promise.all(
        topUsers.map(async (user, index) => {
          // Fetch user's receipts and group by branchId, counting frequency
          const receiptData = await this.prisma.receipt.groupBy({
            by: ['branchId'],
            where: {
              lineId: user.lineId,
            },
            _count: {
              branchId: true,
            },
            orderBy: {
              _count: {
                branchId: 'desc', // Order by frequency of branchId
              },
            },
          });

          if (receiptData.length === 0) {
            // If no receipts found for the user, return with no branch info
            return {
              rank: index + 1,
              fullname: user.fullname,
              accPoints: user.accPoints,
              phone: user.phone,
              mostFrequentBranch: null,
            };
          }

          // Get the highest frequency branchIds
          const maxFrequency = receiptData[0]._count.branchId;
          const frequentBranches = receiptData.filter(
            (branch) => branch._count.branchId === maxFrequency
          );

          let mostFrequentBranch;

          if (frequentBranches.length > 1) {
            // If there are multiple branches with the same frequency,
            // fetch the most recent receipt for each branchId and sort by uploadDate
            const recentBranches = await Promise.all(
              frequentBranches.map(async (branch) => {
                const recentReceipt = await this.prisma.receipt.findFirst({
                  where: {
                    lineId: user.lineId,
                    branchId: branch.branchId,
                  },
                  orderBy: {
                    uploadedAt: 'desc',
                  },
                });
                return {
                  branchId: branch.branchId,
                  uploadedAt: recentReceipt?.uploadedAt,
                };
              })
            );

            // Sort by uploadedAt (descending) and get the most recent branch
            mostFrequentBranch = recentBranches.sort(
              (a, b) => (b.uploadedAt as any) - (a.uploadedAt as any)
            )[0];
          } else {
            // If only one branch has the max frequency
            mostFrequentBranch = frequentBranches[0];
          }

          // Fetch the branch name using the branchId
          const branchInfo = await this.prisma.branch.findUnique({
            where: { branchId: mostFrequentBranch.branchId },
            select: { branchName: true },
          });

          // Add rank and branch information to each user
          return {
            rank: index + 1, // Rank starts at 1
            fullname: user.fullname,
            accPoints: user.accPoints,
            phone: user.phone,
            mostFrequentBranch: branchInfo?.branchName || null, // Transform branchId to branchName
          };
        })
      );

      this.logger.log('getTopSpender : Returning ranked top spenders');
      return rankedUsers;
    } catch (error) {
      this.logger.error(`getTopSpender : Error occurred while fetching top spenders: ${error.message}`);
      throw new Error('เกิดข้อผิดพลาดระหว่างการแสดงรายชื่อผู้ที่มียอดซื้อสูงสุด');
    }
  }

  async getClaimedHistory(lineId: string, pageSize: number, cursor?: number) {
    //find user
    const user = await this.prisma.user.findUnique({
      where: { lineId },
    });

    if (!user) {
      this.logger.error(
        `Not found user lineId: ${lineId} list  :getClaimedHistory`,
      );
      throw new NotFoundException('ไม่พบผู้ใช้หมายเลขนี้');
    }

    const ClaimedHistoryList = await this.prisma.claimedHistory.findMany({
      take: pageSize, // Limit number of receipts to `pageSize`
      skip: cursor ? 1 : 0,
      cursor: cursor ? { claimId: cursor } : undefined,
      where: { lineId },
      orderBy: {
        claimedAt: 'desc',
      },
    });

    const totalCount = await this.prisma.claimedHistory.count({
      where: { lineId },
    });
    if (ClaimedHistoryList.length === 0) {
      return {
        message: 'No more claimed history available',
        receiptHistory: [],
      };
    }

    const formattedList = ClaimedHistoryList.map((claimed) => ({
      ...claimed,
      date: moment(claimed.claimedAt).format('DD MMM YYYY HH:mm น.'), // Format date with time
    }));

    const nextCursor =
      ClaimedHistoryList.length === pageSize
        ? ClaimedHistoryList[ClaimedHistoryList.length - 1].claimId // Use redemptionId as the cursor
        : null;

    this.logger.log(
      `Fetch claimedHistory user lineId: ${lineId} list  :getClaimedHistory`,
    );

    return {
      message: 'Claimed history fetched successfully',
      ClaimedHistoryList: formattedList,
      totalCount,
      nextCursor,
      pageSize,
    };
  }


  async claimAction(data: ClaimedActionDto) {
    const { lineId, branchId, redeemId } = data;

    this.logger.log(`claimAction,${lineId},${branchId},${redeemId}`);

    // 1) Validate user
    const user = await this.prisma.user.findUnique({ where: { lineId } });
    if (!user) {
      this.logger.error(`Not found user with this LINE ID: ${lineId} :claimAction`);
      throw new NotFoundException('ไม่พบผู้ใช้ที่เข้าสู่ระบบด้วย Line ID นี้');
    }

    // 2) Validate branch
    const existingBranch = await this.prisma.branch.findUnique({ where: { branchId } });
    if (!existingBranch) {
      throw new NotFoundException(`Branch with ID ${branchId} not found.`);
    }

    // 3) Today's DailyRedemptionRight
    const nowBkk = moment().tz('Asia/Bangkok');
    const todayStr = nowBkk.format('YYYY-MM-DD');
    const dateOnly = new Date(todayStr);

    const daily: any = await this.prisma.dailyRedemptionRight.findFirst({
      where: {
        lineId,
        dateEarned: dateOnly,
      },
    });

    if (!daily) {
      throw new ConflictException('วันนี้คุณไม่มีสิทธิ์พิเศษสำหรับการแลกของรางวัล');
    }

    // 4) Check One Reward Per Day
    if (daily.usedRights && daily.usedRights > 0) {
      throw new ConflictException('คุณได้ใช้สิทธิ์แลกของรางวัลประจำวันไปแล้ว');
    }

    // 5) Check Eligibility Flag
    let isEligible = false;
    if (redeemId === 'redeem001') isEligible = daily.eligibleMovie === true;
    else if (redeemId === 'redeem003') isEligible = (daily as any).eligibleGoldA === true;
    else if (redeemId === 'redeem004') isEligible = (daily as any).eligibleGoldB === true;

    if (!isEligible) {
      throw new ConflictException('คุณยังยอดสะสมไม่เพียงพอสำหรับของรางวัลชิ้นนี้');
    }

    // 6) Check Stock
    let stock;
    if (redeemId === 'redeem001') {
      // Movie is branch-specific
      stock = await this.prisma.branchStock.findFirst({
        where: { branchId, redeemId, isEnable: true, amount: { gt: 0 } },
      });
    } else if (redeemId === 'redeem003' || redeemId === 'redeem004') {
      // Gold is Global
      // We assume global stock is in a special row with branchId = 'GLOBAL' or similar
      // Or we can just sum but it's better to have a dedicated row for atomic decrement
      stock = await this.prisma.branchStock.findFirst({
        where: { branchId: 'GLOBAL', redeemId, isEnable: true, amount: { gt: 0 } },
      });
    }

    if (!stock) {
      throw new ConflictException('ของรางวัลนี้หมดแล้ว');
    }

    const amountToClaim = 1;

    // 7) Transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // 7.1 Update stock
      const updatedStock = await tx.branchStock.update({
        where: { branchStockId: stock.branchStockId },
        data: {
          amount: { decrement: amountToClaim },
          gotRedeemded: { increment: amountToClaim },
          updatedAt: new Date(),
        },
      });

      // 7.2 Mark as used today:
      const updatedDaily = await tx.dailyRedemptionRight.update({
        where: { id: daily.id },
        data: {
          usedRights: { increment: amountToClaim },
          updatedAt: new Date(),
        },
      });

      // 7.3 We don't necessarily need to decrement user.rights for this campaign
      // since it's based on eligibility flags, but we keep it for audit if rights was 0 initially

      // 7.4 History
      const claimedHistory = await tx.claimedHistory.create({
        data: {
          lineId,
          branchId,
          redeemId,
          phone: user.phone,
          claimedAmount: amountToClaim,
          fullname: user.fullname,
          branchName: existingBranch.branchName,
          claimedAt: new Date(),
        },
      });

      return { updatedStock, updatedDaily, claimedHistory };
    });

    return result;
  }



  async updateMostFrequentBranchId(lineId: string) {
    const result = await this.prisma.receipt.groupBy({
      by: ['branchId'],
      where: {
        lineId: lineId,
        status: 'approved',
      },
      _count: {
        branchId: true,
      },
      orderBy: {
        _count: {
          branchId: 'desc',
        },
      },
      take: 1,
    });

    const mostFrequentBranchId = result.length > 0 ? result[0].branchId : null;

    const updatedUser = await this.prisma.user.update({
      where: { lineId },
      data: {
        mostBranchId: mostFrequentBranchId,
      },
    });

    this.logger.log(
      `update mostbranchId in lineId: ${lineId} :updateMostFrequentBranchId`,
    );

    return {
      message: 'updated most frequency branch successfully',
      updatedUser,
    };
  }
}
