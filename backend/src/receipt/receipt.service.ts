// src/receipt/receipt.service.ts
import {
  BadRequestException,
  Inject,
  Injectable,
  LoggerService,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReceiptDto } from './dto/receipt.dto';
import * as moment from 'moment-timezone';
import { FirebaseService } from 'src/firebase/firebase.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
@Injectable()
export class ReceiptService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  async createReceipt(data: CreateReceiptDto, file: Express.Multer.File) {
    const parsedDate = new Date(data.receiptDate);
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Invalid receiptDate provided');
    }

    // 1) Check user exists
    const user = await this.prisma.user.findUnique({
      where: { lineId: data.lineId },
    });
    if (!user) {
      this.logger.error('Not found this user', data.lineId, ':createReceipt');
      throw new BadRequestException(`ไม่พบผู้ใช้งาน: ${data.lineId}`);
    }

    // 2) Validate branch (must be enabled)
    const existingBranch = await this.prisma.branch.findFirst({
      where: { branchName: data.branchName, isBranchEnable: true },
    });
    if (!existingBranch || !existingBranch.isBranchEnable) {
      this.logger.error('Not found Robinson branch name', data.branchName, ':createReceipt');
      throw new BadRequestException(`ไม่พบโรบินสันสาขา: ${data.branchName}`);
    }

    // 3) Validate store (optional), must belong to branch & enabled
    let storeId: string | null = null;
    const existingStore = await this.prisma.store.findFirst({
      where: {
        storeName: data.storeName,
        isStoreEnable: true,
        branchId: existingBranch.branchId,
      },
    });
    storeId = existingStore ? existingStore.storeId : null;

    // 4) Normalize receipt date (Asia/Bangkok)
    const isoReceiptDate = parsedDate.toISOString();
    const receiptDate = moment(isoReceiptDate).tz('Asia/Bangkok');

    // 5) Points (you currently mirror amount)
    const receiptPoints = data.amount;

    // 6) Check if there is an already-approved receipt in the same group (receiptNo+branch+store)
    const existingApproved = await this.prisma.receipt.findFirst({
      where: {
        receiptNo: data.receiptNo,
        branchName: data.branchName,
        storeName: data.storeName,
        status: 'approved',
      },
    });

    // 7) Upload image to Firebase
    let receiptImageUrl = '';
    if (file) {
      try {
        receiptImageUrl = await this.firebaseService.uploadFile(
          file,
          'receiptsCelebration',
          `${Date.now()}-${data.lineId}`,
        );
      } catch (error) {
        this.logger.error(
          'Failed to upload receipt image to Firebase to receiptsCelebration',
          ':createReceipt',
        );
        throw new BadRequestException(
          'Failed to upload receipt image to Firebase to receiptsCelebration',
        );
      }
    }

    // 8) Decide initial status
    //    - If any same-group receipt is already approved => mark this new upload as 'duplicated'
    //    - Else use provided status or default to 'pending'
    const initialStatus =
      existingApproved
        ? 'duplicated'
        : (data.status !== undefined && data.status !== null ? data.status : 'pending');

    // 9) Create the receipt (allowing duplicates, but auto-marked)
    const receipt = await this.prisma.receipt.create({
      data: {
        receiptNo: data.receiptNo,
        receiptDate: receiptDate.toDate(),
        lineId: data.lineId,
        fullname: user.fullname,
        phone: user.phone,
        branchId: existingBranch.branchId,
        branchName: data.branchName,
        storeId,
        storeName: data.storeName,
        amount: data.amount,
        receiptImage: receiptImageUrl,
        status: initialStatus,
        receiptPoints,
      },
    });

    this.logger.log(
      `Created receipt success lineId: ${data.lineId} receiptNo: ${data.receiptNo} status: ${initialStatus} (createReceipt)`,
    );

    return receipt;
  }


  async getAllReceipts() {
    moment.locale('th');
    const receipts = await this.prisma.receipt.findMany();

    const formattedReceipts = receipts.map((receipt) => ({
      ...receipt,
      receiptDate: moment(receipt.receiptDate).format('DD MMM YYYY HH:mm น.'),
    }));

    return formattedReceipts;
  }
}
