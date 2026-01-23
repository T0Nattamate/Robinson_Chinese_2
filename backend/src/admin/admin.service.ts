import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  LoggerService,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateAdminDto,
  CreateLuckyDto,
  UpdateAdminDto,
} from './dto/admin.dto';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import * as moment from 'moment';
import 'moment/locale/th';
import { Decimal } from '@prisma/client/runtime/library';
import * as XLSX from 'xlsx';
import { bagPoint, luckydrawPoint } from 'src/utils/variables';
import { WebsocketGateway } from 'src/utils/websocket.gateway';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly websocketGateway: WebsocketGateway,
  ) {}

  async createAdmin(data: CreateAdminDto) {
    // Check for duplicate username
    const existingUsername = await this.prisma.admin.findFirst({
      where: { username: data.username },
    });

    if (existingUsername) {
      this.logger.error(
        `This admin username "${data.username}" has already been used: createAdmin`,
      );

      throw new ConflictException('username นี้ได้ถูกใช้ไปแล้ว');
    }

    //if sent branchId -> check if existing branch

    if (data.branchId) {
      const existingBranch = await this.prisma.branch.findFirst({
        where: { branchId: data.branchId },
      });

      if (!existingBranch) {
        this.logger.error(
          `Not found branch with branchId "${data.branchId}": createAdmin`,
        );

        throw new ConflictException(`ไม่พบสาขาหมายเลข ${data.branchId}`);
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    //create admin by prisma
    const adminInput: Prisma.AdminCreateInput = {
      username: data.username,
      password: hashedPassword,
      isEnable:
        data.isEnable !== undefined && data.isEnable !== null
          ? data.isEnable
          : true,
      isMfa:
        data.isMfa !== undefined && data.isMfa !== null ? data.isMfa : false,
      role:
        data.role !== undefined && data.role !== null
          ? data.role
          : 'branchAdmin',
      branchId:
        data.branchId !== undefined && data.branchId !== null
          ? data.branchId
          : null,
    };

    const createdAdmin = await this.prisma.admin.create({
      data: adminInput,
    });

    this.logger.log(
      `Created admin success "${data.username}" role "${data.role || 'branchAdmin'}": createAdmin`,
    );

    return {
      adminData: createdAdmin,
      message: `สร้างแอดมิน ${data.username} สำเร็จ`,
    };
  }

  async adminLogin(username: string, inputPassword: string) {
    const admin = await this.prisma.admin.findFirst({
      where: { username },
    });

    if (!admin) {
      this.logger.error(`Not found admin username "${username}": adminLogin`);
      throw new NotFoundException(`ไม่พบแอดมินที่มีผู้ใช้เป็น ${username}`);
    }

    //Check if the admin is enabled
    if (!admin.isEnable) {
      this.logger.warn(`Admin username ${username} is disabled.`, 'adminLogin');
      throw new UnauthorizedException(`แอดมิน ${username} นี้ถูกปิดใช้งานแล้ว`);
    }

    //campare password
    const isPasswordValid = await bcrypt.compare(inputPassword, admin.password);
    if (!isPasswordValid) {
      this.logger.error(
        `Incorrect password for username "${username}": adminLogin`,
      );
      throw new UnauthorizedException('รหัสผ่านไม่ถูกต้อง');
    }

    //mfa generate code for google authen
    if (admin.isMfa === false) {
      //gen secretKey for each admin
      const secret = authenticator.generateSecret();
      await this.prisma.admin.update({
        where: { adminId: admin.adminId },
        data: { secretKey: secret },
      });
      this.logger.log(`Updated secret key to admin "${secret}": adminLogin`);

      //genrate to url
      const otpUrl = authenticator.keyuri(username, 'Robinson Celebration', secret);
      this.logger.log(`OTP URL: "${otpUrl}": adminLogin`);

      //convert url to qr code
      const qrUrl = await toDataURL(otpUrl);
      return {
        adminId: admin.adminId,
        username: admin.username,
        role: admin.role,
        branch: admin.branchId,
        isEnable: admin.isEnable,
        isMfa: admin.isMfa,
        otpUrl,
        qrCodeUrl: qrUrl,
        message:
          'แอดมินกรอก userrname และ password ถูกต้องและยังไม่เคยลงทะเบียน mfa',
      };
    }

    this.logger.log(`Admin login successfully "${username}": adminLogin`);

    return {
      adminId: admin.adminId,
      username: admin.username,
      role: admin.role,
      branch: admin.branchId,
      isEnable: admin.isEnable,
      isMfa: admin.isMfa,
      qrCodeUrl: undefined,
      message:
        'แอดมินกรอก userrname และ password ถูกต้องและเคยลงทะเบียน mfa แล้ว',
    };
  }

  async checkMfaAfterLogin(otpInput: string, adminId: string) {
    try {
      const admin = await this.prisma.admin.findFirst({
        where: { adminId },
      });

      if (!admin) {
        this.logger.error('not found admin id', adminId, ':checkMfaAfterLogin');
        throw new NotFoundException(`ไม่พบแอดมินที่มีผู้ใช้เป็น ${adminId}`);
      }
      let isValid = false;
      if (admin.secretKey !== null) {
        isValid = authenticator.check(otpInput, admin.secretKey);
      }

      if (isValid) {
        //generate jwt
        const jwt = await this.authService.generateAdminJwt(admin);
        this.logger.log('correct otp', otpInput, ':checkMfaAfterLogin');

        //change mfa to true
        const updatedMfaAdmin = await this.prisma.admin.update({
          where: { adminId },
          data: { isMfa: true },
        });
        if (updatedMfaAdmin) {
          this.logger.log('updated isMfa to true', ':checkMfaAfterLogin');
        }
        return {
          jwt,
          adminData: updatedMfaAdmin,
          message: `otp หมายเลข ${otpInput} ถูกต้อง`,
        };
      } else {
        this.logger.error('invalid otp', otpInput, ':checkMfaAfterLogin');
        throw new BadRequestException(`otp หมายเลข ${otpInput} ไม่ถูกต้อง`);
      }
    } catch (error) {
      this.logger.error('Somethin wrong', error, ':checkMfaAfterLogin');
      throw new InternalServerErrorException(error);
    }
  }

  async getReceiptAdmin(query: {
    branchId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    pageSize?: number;
    cursor?: number;
    phone?: string;
    receiptNo?: string;
  }) {
    try {
      // Check if branchId exists in the database
      if (query.branchId) {
        const existingBranch = await this.prisma.branch.findFirst({
          where: { branchId: query.branchId },
        });

        if (!existingBranch) {
          this.logger.error(
            'Not found branch with branchId',
            query.branchId,
            ':getReceiptAdmin',
          );
          throw new ConflictException(`ไม่พบสาขาหมายเลข ${query.branchId}`);
        }
      }

      // Build filters dynamically
      const filters: any = {};
      //filter branchId
      if (query.branchId) {
        filters.branchId = query.branchId;
      }
      //filter startDate&endDate
      if (query.startDate || query.endDate) {
        filters.uploadedAt = {};
        if (query.startDate) {
          //default let : start with 00:00:00
          filters.uploadedAt.gte = new Date(query.startDate);
        }
        if (query.endDate) {
          const endDate = new Date(query.endDate);
          endDate.setHours(23, 59, 59, 999); // Set time to the end of the day
          filters.uploadedAt.lte = endDate;
        }
      }
      //filter status
      if (query.status) {
        filters.status = query.status;
      }
      //filter phone
      if (query.phone) {
        filters.phone = { startsWith: query.phone };
      }
      //filter receiptNo insensitive
      if (query.receiptNo) {
        filters.receiptNo = {
          startsWith: query.receiptNo,
          mode: 'insensitive',
        };
      }
      this.logger.log(
        `Query received: ${JSON.stringify(query)}`,
        'getReceiptAdmin',
      );
      // Fetch receipts based on filters
      const receipts = await this.prisma.receipt.findMany({
        take: query.pageSize, // Limit number of receipts to `pageSize`
        where: filters,
        skip: query.cursor ? 1 : 0,
        cursor: query.cursor ? { receiptId: query.cursor } : undefined,
        orderBy: {
          uploadedAt: 'desc', // Sort by upload date in descending order
        },
      });

      //formatted return response
      const receiptHistory = receipts.map((receipt) => {
        return {
          receiptId: receipt.receiptId,
          receiptNo: receipt.receiptNo,
          receiptDate: moment(receipt.receiptDate).format(
            'DD MMM YYYY HH:mm น.',
          ),
          amount: receipt.amount,
          branchId: receipt.branchId,
          branchName: receipt.branchName,
          lineId: receipt.lineId,
          storeId: receipt.storeId,
          storeName: receipt.storeName,
          receiptImage: receipt.receiptImage,
          status: receipt.status,
          fullname: receipt.fullname,
          phone: receipt.phone,
          uploadedAt: receipt.uploadedAt,
          updatedAt: receipt.updatedAt,
        };
      });

      if (!receipts.length) {
        this.logger.warn(
          `No receipts found for the provided filters`,
          'getReceiptAdmin',
        );
        //throw new NotFoundException(`ไม่พบใบเสร็จตามตัวกรองที่กำหนด`);
      }

      //pagination additional info
      const totalCount = await this.prisma.receipt.count({ where: filters });
      if (receipts.length === 0) {
        return {
          message: 'No more receipt history available',
          data: [],
        };
      }

      const nextCursor =
        receipts.length === query.pageSize
          ? receipts[receipts.length - 1].receiptId // Use redemptionId as the cursor
          : null;

      const { pageSize } = query;

      return {
        message: 'Receipt history fetched successfully',
        receiptHistory,
        nextCursor,
        totalCount,
        pageSize,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch receipts`, error, 'getReceiptAdmin');
      throw new BadRequestException(
        `An error occurred while fetching receipts: ${error.message}`,
      );
    }
  }
  
  async approveStatus(
  receiptId: number,
  lineId: string,
  newStatus: string,
  receiptNo: string,
  branchName: string,
  storeName: string,
) {
  return await this.prisma.$transaction(async (prisma) => {
    try {
      // ---------------------------
      // Constants
      // ---------------------------
      const LUCKYDRAW_POINT_THRESHOLD = 1000; // accRights
      const PROMOTION_POINT_THRESHOLD = 3000; // DailyRedemptionRight / user.rights
      // Promotion periods in Bangkok time (inclusive)
      const TZ = 'Asia/Bangkok';
      const PROMOTION_PERIODS_BKK: Array<{ start: moment.Moment; end: moment.Moment }> = [
        { start: moment.tz('2025-10-23 00:00:00', TZ), end: moment.tz('2025-10-31 23:59:59', TZ) }, //prod
        //{ start: moment.tz('2025-10-13 00:00:00', TZ), end: moment.tz('2025-10-31 23:59:59', TZ) }, //test
        { start: moment.tz('2025-11-25 00:00:00', TZ), end: moment.tz('2025-12-03 23:59:59', TZ) },
      ];
      const toBkk = (d: Date | string | number) => moment(d).tz(TZ);
      const sameDayBkk = (a: Date, b: Date) => toBkk(a).isSame(toBkk(b), 'day');
      const dayKeyBkk = (d: Date) => toBkk(d).format('YYYY-MM-DD'); // e.g. "2025-10-10"
      const toPgDateFromBkk = (d: Date) => new Date(dayKeyBkk(d));  // safe for @db.Date
      const inAnyPromotionPeriodBkk = (d: Date) => {
        const m = toBkk(d).startOf('day');
        return PROMOTION_PERIODS_BKK.some(({ start, end }) =>
          m.isBetween(start, end, 'second', '[]'),
        );
      };
      // ---------------------------
      // 1) Validate Branch
      // ---------------------------
      const existingBranch = await prisma.branch.findFirst({ where: { branchName } });
      if (!existingBranch) {
        this.logger.error(`Not found branch with branchName "${branchName}": approveStatus`);
        throw new ConflictException(`ไม่พบสาขาหมายเลข ${branchName}`);
      }
      // ---------------------------
      // 2) Validate User
      // ---------------------------
      const user = await prisma.user.findFirst({ where: { lineId } });
      if (!user) {
        this.logger.error('Cant find lineId', lineId, ':approveStatus');
        throw new NotFoundException(`ไม่พบผู้ใช้หมายเลข ${lineId}`);
      }
      // ---------------------------
      // 3) Fetch group receipts
      // ---------------------------
      const receipts = await prisma.receipt.findMany({
        where: { receiptNo, branchName, storeName },
        orderBy: { uploadedAt: 'asc' },
      });
      if (!receipts.length) {
        this.logger.error(`No receipts found for receiptNo: ${receiptNo}`, 'approveStatus');
        throw new NotFoundException(`No receipts found for receiptNo: ${receiptNo}`);
      }
      const targetReceipt = receipts.find((r) => r.receiptId === receiptId);
      if (!targetReceipt) {
        throw new NotFoundException(
          `Receipt with ID ${receiptId} not found in the specified context.`,
        );
      }
      // ---------------------------
      // 4) Status change: APPROVE
      // ---------------------------
      if (newStatus === 'approved') {
        const previouslyApprovedReceipt = receipts.find((r) => r.status === 'approved');
        if (previouslyApprovedReceipt && previouslyApprovedReceipt.receiptId === receiptId) {
          this.logger.error(
            `Cannot approve again. Receipt: ${receiptNo} already approved.`,
            'approveStatus',
          );
          throw new ConflictException(
            `ไม่สามารถอัพเดทสถานะถูกต้องซ้ําให้กับใบเสร็จหมายเลข ${receiptNo} เนื่องจากใบเสร็จนี้ได้ถูกปรับสถานะเป็นถูกต้องไปแล้ว`,
          );
        }
        // Revert prior approved in group (if any)
        if (previouslyApprovedReceipt) {
          const revertAmount = Number(previouslyApprovedReceipt.amount);
          const revertAccRights = Math.floor(revertAmount / LUCKYDRAW_POINT_THRESHOLD);
          await prisma.user.update({
            where: { lineId: user.lineId },
            data: {
              accPoints: { decrement: revertAmount },
              accRights: { decrement: revertAccRights },
            },
          });
          await prisma.receipt.update({
            where: { receiptId: previouslyApprovedReceipt.receiptId },
            data: { status: 'duplicated', updatedAt: new Date() },
          });
          this.websocketGateway?.sendReceiptUpdate?.(lineId, {
            receiptId: previouslyApprovedReceipt.receiptId,
            status: 'duplicated',
          });
        }
        // Approve target: accumulate Top Spender + Lucky Draw
        const amount = Number(targetReceipt.amount);
        const luckyRightsInc = Math.floor(amount / LUCKYDRAW_POINT_THRESHOLD);
        await prisma.user.update({
          where: { lineId: user.lineId },
          data: {
            accPoints: { increment: amount },
            accRights: { increment: luckyRightsInc },
          },
        });
        await prisma.receipt.update({
          where: { receiptId: targetReceipt.receiptId },
          data: { status: 'approved', updatedAt: new Date() },
        });
        // Mark others as duplicated
        for (const r of receipts) {
          if (r.receiptId !== receiptId) {
            await prisma.receipt.update({
              where: { receiptId: r.receiptId },
              data: { status: 'duplicated', updatedAt: new Date() },
            });
            this.websocketGateway?.sendReceiptUpdate?.(lineId, {
              receiptId: r.receiptId,
              status: 'duplicated',
            });
          }
        }
        
        // PROMOTION LOGIC - MAX 1 RIGHT PER DAY
        const approveDate = new Date();
        const receiptDate = new Date(targetReceipt.receiptDate);
        const uploadedAt = new Date(targetReceipt.uploadedAt ?? targetReceipt.receiptDate);
        const sameDayAll =
          sameDayBkk(receiptDate, uploadedAt) &&
          sameDayBkk(receiptDate, approveDate);
        const promotionOk = sameDayAll && inAnyPromotionPeriodBkk(approveDate);
        const dateOnlyBkk = toPgDateFromBkk(approveDate);
        
        if (promotionOk) {
          const existingDaily = await prisma.dailyRedemptionRight.findFirst({
            where: { lineId, dateEarned: dateOnlyBkk },
          });
          
          const spent = amount;
          let gainedRights = 0;
          
          if (existingDaily) {
            // User already has a record for today - update totalSpent
            const prevTotal = Number(existingDaily.totalSpent ?? 0);
            const newTotal = prevTotal + spent;
            
            // Check current state
            const usedRights = existingDaily.usedRights ?? 0;
            const redeemRights = existingDaily.redeemRights ?? 0;
            
            // Logic: Only give right if both usedRights and redeemRights are 0 AND total >= 3000
            if (usedRights === 0 && redeemRights === 0 && newTotal >= PROMOTION_POINT_THRESHOLD) {
              gainedRights = 1;
            }
            // If usedRights = 1 OR redeemRights = 1, user already got their 1 right for today
            
            await prisma.dailyRedemptionRight.update({
              where: { id: existingDaily.id },
              data: {
                totalSpent: newTotal,
                ...(gainedRights > 0 && { redeemRights: 1 }),
                updatedAt: new Date(),
                receiptIds: existingDaily.receiptIds
                  ? `${existingDaily.receiptIds},${targetReceipt.receiptId}`
                  : `${targetReceipt.receiptId}`,
                branchId: existingBranch.branchId ?? existingDaily.branchId,
                branchName: existingBranch.branchName ?? existingDaily.branchName,
              },
            });
          } else {
            // First receipt of the day - create new record
            const qualifiesForRight = spent >= PROMOTION_POINT_THRESHOLD;
            const rights = qualifiesForRight ? 1 : 0;
            gainedRights = rights;
            
            await prisma.dailyRedemptionRight.create({
              data: {
                lineId,
                dateEarned: dateOnlyBkk,
                totalSpent: spent,
                redeemRights: rights,
                usedRights: 0,
                isExpired: false,
                receiptIds: `${targetReceipt.receiptId}`,
                branchId: existingBranch.branchId,
                branchName: existingBranch.branchName,
              },
            });
          }
          
          // Update user's total rights if they gained any
          if (gainedRights > 0) {
            await prisma.user.update({
              where: { lineId },
              data: { rights: { increment: gainedRights } },
            });
          }
        }
        
        // Most-branch info + WS updates
        const result = await prisma.receipt.groupBy({
          by: ['branchId', 'branchName', 'updatedAt'],
          where: { lineId, status: 'approved' },
          _count: { branchId: true },
          orderBy: { updatedAt: 'desc' },
          take: 1,
        });
        const mostFrequentBranchId = result.length > 0 ? (result[0] as any).branchId : null;
        const mostFrequentBranchName = result.length > 0 ? (result[0] as any).branchName : null;
        await prisma.user.update({
          where: { lineId },
          data: {
            mostBranchId: mostFrequentBranchId,
            mostBranchName: mostFrequentBranchName,
            updatedAt: new Date(),
          },
        });
        const updatedUser = await prisma.user.findFirst({ where: { lineId } });
        this.websocketGateway?.sendUserInfoUpdate?.(lineId, {
          user: updatedUser,
          message: 'User points updated after receipt approval',
        });
        this.websocketGateway?.sendReceiptUpdate?.(lineId, {
          receiptId: targetReceipt.receiptId,
          status: 'approved',
        });
        return {
          message: `อัพเดทสถานะใบเสร็จหมายเลข ${receiptNo} ให้เป็นสถานะ ${newStatus} เรียบร้อยแล้ว`,
          case: 'approved',
        };
      }
      // ---------------------------
      // 7) Change to non-approved when it was not approved already
      // ---------------------------
      if (targetReceipt.status !== 'approved') {
        await prisma.receipt.update({
          where: { receiptId: targetReceipt.receiptId },
          data: { status: newStatus, updatedAt: new Date() },
        });
        this.websocketGateway?.sendReceiptUpdate?.(lineId, {
          receiptId: targetReceipt.receiptId,
          status: newStatus,
        });
        return {
          message: `อัพเดทสถานะใบเสร็จหมายเลข ${receiptNo} ให้เป็นสถานะ ${newStatus} เรียบร้อยแล้ว`,
          case: 'non-approved change only',
        };
      }
      // ---------------------------
      // 8) Revert FROM approved → other
      // ---------------------------
      const revertAmount = Number(targetReceipt.amount);
      const revertAccRights = Math.floor(revertAmount / LUCKYDRAW_POINT_THRESHOLD);
      // 8.1 Subtract accumulative totals & lucky-draw rights
      await prisma.user.update({
        where: { lineId: user.lineId },
        data: {
          accPoints: { decrement: revertAmount },
          accRights: { decrement: revertAccRights },
        },
      });
      // 8.2 Change receipt status
      await prisma.receipt.update({
        where: { receiptId: targetReceipt.receiptId },
        data: { status: newStatus, updatedAt: new Date() },
      });
      
      // 8.3 Rollback DAILY promo rights if applicable
      const receiptBkkDay = toPgDateFromBkk(new Date(targetReceipt.receiptDate));
      if (inAnyPromotionPeriodBkk(new Date(targetReceipt.receiptDate))) {
        const daily = await prisma.dailyRedemptionRight.findFirst({
          where: { lineId, dateEarned: receiptBkkDay },
        });
        
        if (daily) {
          const prevTotal = Number(daily.totalSpent ?? 0);
          const newTotalRaw = prevTotal - revertAmount;
          const newTotal = newTotalRaw > 0 ? newTotalRaw : 0;
          
          // Check if user loses their right qualification
          const hadQualifyingAmount = prevTotal >= PROMOTION_POINT_THRESHOLD;
          const stillQualifies = newTotal >= PROMOTION_POINT_THRESHOLD;
          
          // If losing qualification and already used the right, can't revert
          if (hadQualifyingAmount && !stillQualifies && daily.usedRights > 0) {
            throw new ConflictException(
              'ไม่สามารถเปลี่ยนสถานะได้ เนื่องจากสิทธิ์พิเศษของวันนั้นถูกใช้งานแล้ว',
            );
          }
          
          // Update rights if losing qualification
          let newRedeemRights = daily.redeemRights ?? 0;
          let rightsDelta = 0;
          
          if (hadQualifyingAmount && !stillQualifies) {
            // Losing the right
            rightsDelta = -(daily.redeemRights ?? 0);
            newRedeemRights = 0;
          }
          
          // Remove receiptId from list
          let newReceiptIds = daily.receiptIds || '';
          if (newReceiptIds) {
            const parts = newReceiptIds.split(',').map((s) => s.trim()).filter(Boolean);
            const filtered = parts.filter((pid) => pid !== String(targetReceipt.receiptId));
            newReceiptIds = filtered.join(',');
          }
          
          // Update or delete the daily row
          if (newTotal === 0 && daily.usedRights === 0 && !newReceiptIds) {
            await prisma.dailyRedemptionRight.delete({ where: { id: daily.id } });
          } else {
            await prisma.dailyRedemptionRight.update({
              where: { id: daily.id },
              data: {
                totalSpent: newTotal,
                redeemRights: newRedeemRights,
                receiptIds: newReceiptIds || null,
                updatedAt: new Date(),
              },
            });
          }
          
          // Update user rights if removed
          if (rightsDelta < 0) {
            await prisma.user.update({
              where: { lineId },
              data: { rights: { decrement: Math.abs(rightsDelta) } },
            });
          }
        }
      }
      
      const updatedUserAfterRevert = await prisma.user.findFirst({ where: { lineId } });
      this.websocketGateway?.sendUserInfoUpdate?.(lineId, {
        user: updatedUserAfterRevert,
        message: 'User points updated after receipt revert',
      });
      this.websocketGateway?.sendReceiptUpdate?.(lineId, {
        receiptId: targetReceipt.receiptId,
        status: newStatus,
      });
      return {
        message: `อัพเดทสถานะใบเสร็จหมายเลข ${receiptNo} ให้เป็นสถานะ ${newStatus} เรียบร้อยแล้ว`,
        case: 'revert from approved (with daily rollback if applicable)',
      };
    } catch (error: any) {
      this.logger.error(`Fail to update status  ${error.message} :approveStatus`);
      throw new BadRequestException(`${error.message}`);
    }
  });
}


  async getBranchAdmin(query: { pageSize?: number; cursor?: string }) {
    try {
      // Fetch receipts based on filters
      const admins = await this.prisma.admin.findMany({
        where: {
          role: 'branchAdmin', // Filter admins with role = "branchAdmin"
        },
        take: query.pageSize, // Limit number of receipts to `pageSize`
        skip: query.cursor ? 1 : 0,
        cursor: query.cursor ? { adminId: query.cursor } : undefined,
        orderBy: {
          adminId: 'asc',
        },
      });

      if (!admins.length) {
        this.logger.warn(
          `No admin found for the provided filters`,
          'getBranchAdmin',
        );
        //throw new NotFoundException(`ไม่พบใบเสร็จตามตัวกรองที่กำหนด`);
      }

      //pagination additional info
      const totalCount = await this.prisma.admin.count();
      if (admins.length === 0) {
        return {
          message: 'No more receipt history available',
          data: [],
        };
      }

      const nextCursor =
        admins.length === query.pageSize
          ? admins[admins.length - 1].adminId // Use redemptionId as the cursor
          : null;

      const { pageSize } = query;

      return {
        message: 'branchAdmin list fetched successfully',
        admins,
        nextCursor,
        totalCount,
        pageSize,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch admins`, error, 'getBranchAdmin');
      throw new BadRequestException(
        `An error occurred while fetching admins: ${error.message}`,
      );
    }
  }

  async updateAdmin(data: UpdateAdminDto) {
    try {
      // Step 1: Check if the admin exists
      const existingAdmin = await this.prisma.admin.findUnique({
        where: { adminId: data.adminId },
      });

      if (!existingAdmin) {
        throw new NotFoundException(`Admin with ID ${data.adminId} not found.`);
      }

      // Step 2: Prepare update data dynamically
      const updateData: any = {};

      // Update branchId if provided
      if (data.branchId) {
        updateData.branchId = data.branchId;
      }

      // Update isEnable if provided
      if (data.isEnable !== undefined) {
        updateData.isEnable = data.isEnable;
      }

      // Update password if provided
      if (data.newPassword) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.newPassword, salt);
        updateData.password = hashedPassword;
      }

      // Step 3: Update the admin data
      const updatedAdmin = await this.prisma.admin.update({
        where: { adminId: data.adminId },
        data: updateData,
      });

      return {
        message: 'Admin updated successfully',
        data: updatedAdmin,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to update admin: ${error.message}`);
    }
  }

  
  async getCustomers(query: {
    startDate?: string;
    endDate?: string;
    pageSize?: number;
    cursor?: string;
    phone?: string;
    theOne?: boolean;
    orderBy?: 'allPoints' | 'accPoints' | 'desc'; // or undefined
    theOneId?: string;
  }) {
    try {
      // 1) Build a filters object
      const filters: Prisma.UserWhereInput = {};

      // 2) Date range
      if (query.startDate || query.endDate) {
        filters.updatedAt = {};
        if (query.startDate) {
          filters.updatedAt.gte = new Date(query.startDate);
        }
        if (query.endDate) {
          const endDate = new Date(query.endDate);
          endDate.setHours(23, 59, 59, 999);
          filters.updatedAt.lte = endDate;
        }
      }

      // 3) Phone filter
      if (query.phone) {
        filters.phone = { startsWith: query.phone };
      }

      // 4) The1 membership
      if (typeof query.theOne === 'boolean') {
        filters.isTheOne = query.theOne;
      }

      // 5) The1 Card
      if (query.theOneId) {
        filters.theOneId = { startsWith: query.theOneId };
      }

      // 6) Check if this is a Top Spender sort (orderBy=allPoints)
      if (query.orderBy === 'allPoints') {
        // For Top Spender, we need to:
        // 1. Get ALL matching users (no limit)
        // 2. Sort them manually by accPoints
        // 3. Apply pagination ourselves
        
        // Get ALL users that match the filters (removed take limit)
        const allMatchingUsers = await this.prisma.user.findMany({
          where: filters,
        });
        
        // Sort users by accPoints (numeric sort, descending)
        const sortedUsers = allMatchingUsers.sort((a, b) => {
          // Parse accPoints values as numbers for proper numeric sorting
          const aPoints = a.accPoints ? parseInt(a.accPoints.toString(), 10) : 0;
          const bPoints = b.accPoints ? parseInt(b.accPoints.toString(), 10) : 0;
          return bPoints - aPoints; // Descending order (highest first)
        });
        
        // Apply pagination manually
        const pageSize = query.pageSize || 10;
        let startIndex = 0;
        
        // Handle cursor-based pagination
        if (query.cursor && query.cursor !== '0') {
          const cursorIndex = sortedUsers.findIndex(user => user.lineId === query.cursor);
          if (cursorIndex !== -1) {
            startIndex = cursorIndex + 1; // Start after the cursor item
          }
        }
        
        const paginatedUsers = sortedUsers.slice(startIndex, startIndex + pageSize);
        
        // If no users after pagination
        if (!paginatedUsers.length) {
          return {
            message: 'No more customer available',
            data: [],
            totalCount: sortedUsers.length,
            pageSize
          };
        }
        
        // Calculate next cursor
        const hasMoreData = startIndex + pageSize < sortedUsers.length;
        const nextCursor = hasMoreData
          ? paginatedUsers[paginatedUsers.length - 1].lineId
          : null;
        
        // Return the paginated and sorted result
        return {
          message: 'customers fetched successfully',
          data: paginatedUsers,
          nextCursor,
          totalCount: sortedUsers.length,
          pageSize
        };
      }
      
      // For non-Top Spender sorts, use regular Prisma sorting
      
      // 7) Default sort is createdAt desc
      let orderClause: Prisma.UserOrderByWithRelationInput = {
        createdAt: 'desc',
      };
      
      // 8) Regular Prisma query with pagination
      const customers = await this.prisma.user.findMany({
        take: query.pageSize || 10,
        skip: query.cursor ? 1 : 0,
        cursor: query.cursor ? { lineId: query.cursor } : undefined,
        where: filters,
        orderBy: orderClause,
      });

      // 9) If no customers
      if (!customers.length) {
        this.logger.warn(
          'No users found for the provided filters',
          'getCustomers',
        );
        return {
          message: 'No more customer available',
          data: [],
        };
      }

      // 10) Count total items
      const totalCount = await this.prisma.user.count({ where: filters });

      // 11) nextCursor logic
      const nextCursor =
        customers.length === (query.pageSize || 10)
          ? customers[customers.length - 1].lineId
          : null;

      // 12) Return
      return {
        message: 'customers fetched successfully',
        data: customers,
        nextCursor,
        totalCount,
        pageSize: query.pageSize || 10,
      };
    } catch (error) {
      this.logger.error(`Failed to get customers admin`, error, 'getCustomers');
      throw new BadRequestException(error.message);
    }
  }

  async checkAdminPassword(adminId: string, inputPassword: string) {
    try {
      // Retrieve the admin by adminId
      const admin = await this.prisma.admin.findUnique({
        where: { adminId },
      });

      if (!admin) {
        throw new NotFoundException(`Admin with ID ${adminId} not found.`);
      }

      // Compare inputPassword with the hashed password
      const isPasswordValid = await bcrypt.compare(
        inputPassword,
        admin.password,
      );

      if (!isPasswordValid) {
        throw new BadRequestException('Invalid password provided.');
      }
      return {
        message: 'Password is valid.',
        data: {
          adminId: admin.adminId,
          username: admin.username,
          role: admin.role,
          isEnable: admin.isEnable,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to verify password:`,
        error.message,
        'checkAdminPassword',
      );
      throw new BadRequestException(` ${error.message}`);
    }
  }

  async getClaimedHistoryAdmin(query: {
    branchId?: string;
    startDate?: string;
    endDate?: string;
    pageSize?: number;
    cursor?: number;
    phone?: string;
  }) {
    try {
      // Check if branchId exists in the database
      if (query.branchId) {
        const existingBranch = await this.prisma.branch.findUnique({
          where: { branchId: query.branchId },
        });

        if (!existingBranch) {
          this.logger.error(
            'Not found branch with branchId',
            query.branchId,
            ':getClaimedHistoryAdmin',
          );
          throw new ConflictException(`ไม่พบสาขาหมายเลข ${query.branchId}`);
        }
      }

      // Build filters dynamically
      const filters: any = {};
      //filter branchId
      if (query.branchId) {
        filters.branchId = query.branchId;
      }
      //filter startDate&endDate
      if (query.startDate || query.endDate) {
        filters.claimedAt = {};
        if (query.startDate) {
          //default let : start with 00:00:00
          filters.claimedAt.gte = new Date(query.startDate);
        }
        if (query.endDate) {
          const endDate = new Date(query.endDate);
          endDate.setHours(23, 59, 59, 999); // Set time to the end of the day
          filters.claimedAt.lte = endDate;
        }
      }
      //filter phone
      if (query.phone) {
        filters.phone = { startsWith: query.phone };
      }

      this.logger.log(
        `Query received: ${JSON.stringify(query)}`,
        'getClaimedHistoryAdmin',
      );
      // Fetch receipts based on filters
      const histories = await this.prisma.claimedHistory.findMany({
        take: query.pageSize, // Limit number of receipts to `pageSize`
        where: filters,
        skip: query.cursor ? 1 : 0,
        cursor: query.cursor ? { claimId: query.cursor } : undefined,
        orderBy: {
          claimedAt: 'desc', // Sort by upload date in descending order
        },
      });

      //formatted return response
      const claimedHistory = histories.map((history) => {
        return {
          date: moment(history.claimedAt).format('DD MMM YYYY HH:mm น.'),
          branchId: history.branchId,
          redeemId: history.redeemId,
          branchName: history.branchName,
          fullname: history.fullname,
          phone: history.phone,
        };
      });

      if (!histories.length) {
        this.logger.warn(
          `No receipts found for the provided filters`,
          'getClaimedHistoryAdmin',
        );
        //throw new NotFoundException(`ไม่พบใบเสร็จตามตัวกรองที่กำหนด`);
      }

      //pagination additional info
      const totalCount = await this.prisma.claimedHistory.count({
        where: filters,
      });
      if (histories.length === 0) {
        return {
          message: 'No more claimed history available',
          data: [],
        };
      }

      const nextCursor =
        histories.length === query.pageSize
          ? histories[histories.length - 1].claimId // Use redemptionId as the cursor
          : null;

      const { pageSize } = query;

      return {
        message: 'Receipt history fetched successfully',
        claimedHistory,
        nextCursor,
        totalCount,
        pageSize,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get claimed history admin`,
        error,
        'getClaimedHistoryAdmin',
      );
      throw new BadRequestException(`${error.message}`);
    }
  }

  async getGotRedeemByredeemId(redeemId: string, branchId?: string) {
    try {
      if (branchId) {
        // Case 1: branchId is provided
        const branchStock = await this.prisma.branchStock.findUnique({
          where: {
            branchId_redeemId: {
              branchId: branchId,
              redeemId: redeemId,
            },
          },
          select: {
            gotRedeemded: true,
          },
        });

        if (!branchStock) {
          this.logger.error(
            `No branch stock found for branchId: ${branchId} and redeemId: ${redeemId}`,
            ':getgotRedeemdedByredeemId',
          );
          throw new NotFoundException(
            `No branch stock found for branchId: ${branchId} and redeemId: ${redeemId}`,
          );
        }

        return [
          {
            branchId,
            redeemId,
            gotRedeemded:
              branchStock.gotRedeemded !== undefined &&
              branchStock.gotRedeemded !== null
                ? branchStock.gotRedeemded
                : 0,
          },
        ];
      } else {
        // Case 2: No branchId is provided
        const branchStocks = await this.prisma.branchStock.groupBy({
          by: ['redeemId'],
          where: {
            redeemId: redeemId,
          },
          _sum: {
            gotRedeemded: true,
          },
        });

        if (!branchStocks.length) {
          this.logger.error(
            `No branch stock found for redeemId: ${redeemId}`,
            ':getgotRedeemdedByredeemId',
          );
          throw new NotFoundException(
            `No branch stock found for redeemId: ${redeemId}`,
          );
        }

        return branchStocks.map((stock) => ({
          redeemId: stock.redeemId,
          sumgotRedeemded:
            stock._sum.gotRedeemded !== undefined &&
            stock._sum.gotRedeemded !== null
              ? stock._sum.gotRedeemded
              : 0,
        }));
      }
    } catch (error) {
      this.logger.error(
        `Error in getgotRedeemdedByredeemId: ${error.message}`,
        ':getgotRedeemdedByredeemId',
      );
      throw error;
    }
  }

  async exportRceiptExcel(query: {
    branchId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    phone?: string;
    receiptNo?: string;
  }) {
    try {
      // Build filters dynamically
      const filters: any = {};
      //filter branchId
      if (query.branchId) {
        filters.branchId = query.branchId;
      }
      //filter startDate&endDate
      if (query.startDate || query.endDate) {
        filters.uploadedAt = {};
        if (query.startDate) {
          //default let : start with 00:00:00
          filters.uploadedAt.gte = new Date(query.startDate);
        }
        if (query.endDate) {
          const endDate = new Date(query.endDate);
          endDate.setHours(23, 59, 59, 999); // Set time to the end of the day
          filters.uploadedAt.lte = endDate;
        }
      }
      //filter status
      if (query.status) {
        filters.status = query.status;
      }
      //filter phone
      if (query.phone) {
        filters.phone = { startsWith: query.phone };
      }
      //filter receiptNo insensitive
      if (query.receiptNo) {
        filters.receiptNo = {
          startsWith: query.receiptNo,
          mode: 'insensitive',
        };
      }
      //fetch data from database
      const receipts = await this.prisma.receipt.findMany({
        select: {
          receiptNo: true,
          receiptDate: true,
          amount: true,
          receiptImage: true,
          status: true,
          receiptPoints: true,
          branchName: true,
          storeName: true,
          fullname: true,
          phone: true,
          updatedAt: true,
          uploadedAt: true,
        },
        where: filters,
        orderBy: {
          uploadedAt: 'desc',
        },
      });

      if (!receipts || receipts.length === 0) {
        this.logger.error(
          'No receipt found in the database.',
          ':exportRceiptExcel',
        );
        throw new NotFoundException('No receipt found in the database.');
      }

      // Define the status mapping
      const statusMapping = {
        approved: 'ถูกต้อง',
        pending: 'รอตรวจสอบ',
        rejected: 'เลขที่ใบเสร็จผิด',
        invalidImage: 'ภาพไม่ชัด / ภาพไม่ถูกต้อง',
        amountDontMatch: 'ยอดซื้อไม่ตรงกับใบเสร็จ',
        breakRules: 'ยอดสั่งซื้อไม่ตรงตามเงื่อนไข',
        duplicated: 'ใบเสร็จซ้ำกับใบที่อนุมัติแล้ว',
      };

      const formattedReceipt = receipts.map((receipt) => {
        const uploadedAt = receipt.uploadedAt
          ? new Date(receipt.uploadedAt).toLocaleString('th-TH', {
              timeZone: 'Asia/Bangkok',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            })
          : null;

        return {
          วันที่อัพโหลด: uploadedAt
            ? uploadedAt.replace(/\//g, '-')
            : 'ไม่มีข้อมูล',
          ชื่อนามสกุล: receipt.fullname,
          เบอร์โทรศัพท์: receipt.phone,
          หมายเลขใบเสร็จ: receipt.receiptNo,
          สถานะ: statusMapping[receipt.status] || 'ไม่ทราบสถานะ',
          สาขาโรบินสัน: receipt.branchName,
          ร้านค้า: receipt.storeName,
          จำนวนเงิน: receipt.amount.toString(),
          แต้มใบเสร็จ: receipt.receiptPoints?.toString(),
          ภาพใบเสร็จ: receipt.receiptImage,
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(formattedReceipt);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Receipts');

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      this.logger.log('export receipt success', 'exportRceiptExcel');
      return buffer;
    } catch (error) {
      this.logger.error(error, 'exportRceiptExcel');
    }
  }

  async exportCustomersExcel(query: {
    startDate?: string;
    endDate?: string;
    phone?: string;
    theOne?: boolean;
    orderBy?: 'desc' | 'allPoints' | 'accPoints';
    theOneId?: string;
  }) {
    try {
      // 1) Build filters dynamically
      const filters: any = {};

      // 2) Date range
      if (query.startDate || query.endDate) {
        filters.updatedAt = {};
        if (query.startDate) {
          filters.updatedAt.gte = new Date(query.startDate);
        }
        if (query.endDate) {
          const endDate = new Date(query.endDate);
          endDate.setHours(23, 59, 59, 999);
          filters.updatedAt.lte = endDate;
        }
      }

      // 3) Phone
      if (query.phone) {
        filters.phone = { startsWith: query.phone };
      }

      // 4) The1 membership
      if (query.theOne) {
        filters.isTheOne = query.theOne;
      }

      // 5) The1 Card
      if (query.theOneId) {
        filters.theOneId = { startsWith: query.theOneId };
      }

      // 6) Fetch ALL customers matching filters (no orderBy yet)
      const customers = await this.prisma.user.findMany({
        select: {
          fullname: true,
          phone: true,
          email: true,
          isTheOne: true,
          createdAt: true,
          updatedAt: true,
          accPoints: true,
          mostBranchName: true,
          accRights: true,
        },
        where: filters,
      });

      if (!customers || customers.length === 0) {
        this.logger.error(
          'No user found in the database.',
          ':exportCustomersExcel',
        );
        throw new NotFoundException('No user found in the database.');
      }

      // 7) Sort customers based on orderBy parameter
      let sortedCustomers = customers;
      
      if (query.orderBy === 'allPoints') {
        // Top Spender sort - sort by accPoints (numeric sort, descending)
        sortedCustomers = customers.sort((a, b) => {
          const aPoints = a.accPoints ? parseInt(a.accPoints.toString(), 10) : 0;
          const bPoints = b.accPoints ? parseInt(b.accPoints.toString(), 10) : 0;
          return bPoints - aPoints; // Descending order (highest first)
        });
      } else if (query.orderBy === 'accPoints') {
        // Sort by accPoints descending
        sortedCustomers = customers.sort((a, b) => {
          const aPoints = a.accPoints ? parseInt(a.accPoints.toString(), 10) : 0;
          const bPoints = b.accPoints ? parseInt(b.accPoints.toString(), 10) : 0;
          return bPoints - aPoints;
        });
      } else {
        // Default: sort by createdAt descending
        sortedCustomers = customers.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        });
      }

      // 8) Format data
      const formattedReceipt = sortedCustomers.map((customer) => {
        const formatDateTime = (date: Date | null) => {
          return date
            ? new Date(date)
                .toLocaleString('th-TH', {
                  timeZone: 'Asia/Bangkok',
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false,
                })
                .replace(/\//g, '-')
            : '';
        };

        return {
          วันที่ลงทะเบียน: formatDateTime(customer.createdAt),
          ชื่อนามสกุล: customer.fullname,
          เบอร์โทรศัพท์: customer.phone,
          อีเมล: customer.email,
          เป็นสมาชิกThe1: customer.isTheOne ? 'ใช่' : 'ไม่ใช่',
          สิทธิ์ในการลุ้นผู้โชคดี: customer.accRights?.toString(),
          ยอดซื้อทั้งหมด: customer.accPoints?.toString(),
          สาขาที่อัพโหลดบ่อยที่สุด: customer.mostBranchName,
          อัพเดตล่าสุดเมื่อ: formatDateTime(customer.updatedAt),
        };
      });

      // 9) Convert to Excel
      const worksheet = XLSX.utils.json_to_sheet(formattedReceipt);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

      // 10) Return the Excel buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      this.logger.log(
        'export customers success :exportCustomersExcel',
        ':exportCustomersExcel',
      );
      return buffer;
    } catch (error) {
      this.logger.error(error, ':exportCustomersExcel');
      throw error;
    }
  }

  async exportCustomersLuckyExcel(query: {
    startDate?: string;
    endDate?: string;
    phone?: string;
    theOne?: boolean;
    orderBy?: 'desc' | 'allPoints' | 'accPoints';
    theOneId?: string;
  }) {
    try {
      // Build filters dynamically
      const filters: any = {};

      if (query.startDate || query.endDate) {
        filters.updatedAt = {};
        if (query.startDate) {
          filters.updatedAt.gte = new Date(query.startDate);
        }
        if (query.endDate) {
          const endDate = new Date(query.endDate);
          endDate.setHours(23, 59, 59, 999);
          filters.updatedAt.lte = endDate;
        }
      }

      if (query.phone) {
        filters.phone = { startsWith: query.phone };
      }

      if (query.theOne !== undefined) {
        filters.isTheOne = query.theOne;
      }

      // The1 Card filter
      if (query.theOneId) {
        filters.theOneId = { startsWith: query.theOneId };
      }

      // Fetch ALL customers matching filters (no orderBy yet)
      const customers = await this.prisma.user.findMany({
        select: {
          fullname: true,
          phone: true,
          email: true,
          isTheOne: true,
          createdAt: true,
          updatedAt: true,
          accPoints: true,
          mostBranchName: true,
          accRights: true,
        },
        where: filters,
      });

      if (!customers || customers.length === 0) {
        this.logger.error(
          'No user found in the database.',
          ':exportCustomersLuckyExcel',
        );
        throw new NotFoundException('No users found in the database.');
      }

      // Sort customers if orderBy is specified
      let sortedCustomers = customers;
      
      if (query.orderBy === 'allPoints') {
        // Top Spender sort - sort by accPoints (numeric sort, descending)
        sortedCustomers = customers.sort((a, b) => {
          const aPoints = a.accPoints ? parseInt(a.accPoints.toString(), 10) : 0;
          const bPoints = b.accPoints ? parseInt(b.accPoints.toString(), 10) : 0;
          return bPoints - aPoints; // Descending order (highest first)
        });
      } else if (query.orderBy === 'accPoints') {
        // Sort by accPoints descending
        sortedCustomers = customers.sort((a, b) => {
          const aPoints = a.accPoints ? parseInt(a.accPoints.toString(), 10) : 0;
          const bPoints = b.accPoints ? parseInt(b.accPoints.toString(), 10) : 0;
          return bPoints - aPoints;
        });
      } else {
        // Default: sort by createdAt descending
        sortedCustomers = customers.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        });
      }

      // Duplicate rows based on `accRights`
      const formattedCustomers = sortedCustomers
        .map((customer) => {
          if (!customer.accRights || customer.accRights <= 0) return []; // Now TypeScript knows it's an array

          // Function to format date to Thailand timezone (GMT+7)
          const formatDateTime = (date: Date | null | undefined) =>
            date
              ? new Date(date)
                  .toLocaleString('th-TH', {
                    timeZone: 'Asia/Bangkok',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                  })
                  .replace(/\//g, '-')
              : '';

          return Array.from({ length: customer.accRights }, (_, index) => ({
            วันที่ลงทะเบียน: formatDateTime(customer.createdAt),
            ชื่อนามสกุล: customer.fullname,
            เบอร์โทรศัพท์: customer.phone,
            อีเมล: customer.email,
            เป็นสมาชิกThe1: customer.isTheOne ? 'ใช่' : 'ไม่ใช่',
            ยอดซื้อทั้งหมด: customer.accPoints?.toString(),
            สิทธิ์ในการลุ้นผู้โชคดี: customer.accRights?.toString(),
            สิทธิ์ที่: `สิทธิ์ที่ ${index + 1}`,
            สาขาที่อัพโหลดบ่อยที่สุด: customer.mostBranchName,
            อัพเดตล่าสุดเมื่อ: formatDateTime(customer.updatedAt),
          }));
        })
        .flat();

      if (formattedCustomers.length === 0) {
        this.logger.error(
          'No data available for export due to empty duplicates.',
          ':exportCustomersLuckyExcel',
        );
        throw new NotFoundException('No data available for export.');
      }

      // Generate Excel file
      const worksheet = XLSX.utils.json_to_sheet(formattedCustomers);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'UsersLucky');

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      this.logger.log(
        'export customer lucky success',
        ':exportCustomersLuckyExcel',
      );
      return buffer;
    } catch (error) {
      this.logger.error(error, ':exportCustomersLuckyExcel');
      throw error;
    }
  }

  async exportClaimedHist(query: {
    branchId?: string;
    startDate?: string;
    endDate?: string;
    phone?: string;
  }) {
    try {
      // Build filters dynamically
      const filters: any = {};

      if (query.startDate || query.endDate) {
        filters.claimedAt = {};
        if (query.startDate) {
          filters.claimedAt.gte = new Date(query.startDate);
        }
        if (query.endDate) {
          const endDate = new Date(query.endDate);
          endDate.setHours(23, 59, 59, 999);
          filters.claimedAt.lte = endDate;
        }
      }

      if (query.phone) {
        filters.phone = { startsWith: query.phone };
      }

      // Fetch data from database
      const claimedLists = await this.prisma.claimedHistory.findMany({
        select: {
          claimedAt: true,
          branchName: true,
          redeemId: true,
          fullname: true,
          phone: true,
        },
        where: filters,
        orderBy: {
          claimedAt: 'desc',
        },
      });

      if (!claimedLists || claimedLists.length === 0) {
        this.logger.error(
          'No claimed history found in the database.',
          ':exportClaimedHist',
        );
        throw new NotFoundException(
          'No claimed history found in the database.',
        );
      }

      const formattedClaimed = claimedLists.map((claimedList) => {
        const formatDateTime = (date) =>
          date
            ? new Date(date)
                .toLocaleString('th-TH', {
                  timeZone: 'Asia/Bangkok',
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false,
                })
                .replace(/\//g, '-')
            : '';

        // Map redeemId to product name
        let productName = '';
        if (claimedList.redeemId === 'redeem001') {
          productName = 'บัตรชมภายนต์';
        } else if (claimedList.redeemId === 'redeem002') {
          productName = 'Gift Voucher 100 Baht';
        } else {
          productName = claimedList.redeemId;
        }

        return {
          วันที่แลกสินค้าพรีเมียม: formatDateTime(claimedList.claimedAt),
          ชื่อนามสกุล: claimedList.fullname,
          สินค้าที่แลกรับ: productName,
          เบอร์โทรศัพท์: claimedList.phone,
          สาขาที่แลก: claimedList.branchName,
        };
      });

      // Generate Excel file
      const worksheet = XLSX.utils.json_to_sheet(formattedClaimed);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'ClaimedHistory');

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      this.logger.log('export claimed history success', ':exportClaimedHist');
      return buffer;
    } catch (error) {
      this.logger.error(error, ':exportClaimedHist');
    }
  }
}
