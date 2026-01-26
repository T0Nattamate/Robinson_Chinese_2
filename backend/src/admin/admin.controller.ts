import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  AddStoresBulkDto,
  CreateAdminDto,
  CreateLuckyDto,
  UpdateAdminDto,
} from './dto/admin.dto';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role.decorator';
import { Role } from 'src/auth/role.enum';
import { Response } from 'express';

@Controller('/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Post('/create')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles(Role.superAdmin)
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.createAdmin(createAdminDto);
  }

  @Post('/login')
  async adminLogin(@Body() postData: { username: string; password: string }) {
    return this.adminService.adminLogin(postData.username, postData.password);
  }

  @Post('/checkmfa')
  async checkMfa(@Body() postData: { otpInput: string; adminId: string }) {
    return this.adminService.checkMfaAfterLogin(
      postData.otpInput,
      postData.adminId,
    );
  }

  @Get('/receipt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.branchAdmin, Role.superAdmin)
  async getReceiptAdmin(
    @Query()
    query: {
      branchId?: string;
      startDate?: string;
      endDate?: string;
      status?: string;
      pageSize?: string;
      cursor?: string;
      phone?: string;
      receiptNo?: string;
    },
  ) {
    const size = query.pageSize ? parseInt(query.pageSize) : 10; // Default to 10

    if (isNaN(size)) {
      throw new BadRequestException('Invalid pageSize, must be a number.');
    }

    let cursorNumber: number | undefined;
    if (query.cursor) {
      cursorNumber = parseInt(query.cursor);
      if (isNaN(cursorNumber)) {
        throw new BadRequestException('Invalid cursor, must be a number.');
      }
    }

    return this.adminService.getReceiptAdmin({
      ...query,
      pageSize: size,
      cursor: cursorNumber,
    });
  }

  @Post('/status')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles(Role.branchAdmin)
  async approveStatus(
    @Body()
    postData: {
      receiptId: number;
      lineId: string;
      newStatus: string;
      receiptNo: string;
      branchName: string;
      storeName: string;
    },
  ) {
    const { receiptId, lineId, newStatus, receiptNo, branchName, storeName } =
      postData;
    return this.adminService.approveStatus(
      receiptId,
      lineId,
      newStatus,
      receiptNo,
      branchName,
      storeName,
    );
  }

  @Get('/list')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.superAdmin)
  async getBranchAdmin(
    @Query()
    query: {
      pageSize?: string;
      cursor?: string;
    },
  ) {
    const size = query.pageSize ? parseInt(query.pageSize) : 10; // Default to 10

    if (isNaN(size)) {
      throw new BadRequestException('Invalid pageSize, must be a number.');
    }

    return this.adminService.getBranchAdmin({
      ...query,
      pageSize: size,
    });
  }

  @Patch('/update')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.superAdmin)
  async updateAdmin(@Body() updateAdminDto: UpdateAdminDto) {
    return this.adminService.updateAdmin(updateAdminDto);
  }

  @Get('/customer')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.superAdmin)
  async getCustomers(
    @Query()
    query: {
      startDate?: string;
      endDate?: string;
      pageSize?: string;
      cursor?: string;
      phone?: string;
      theOne?: string;    // "true" or "false" or undefined
      orderBy?: string;   // "top", "vip", "desc", or undefined
      theOneId?: string;
    },
  ) {
    // 1) Parse pageSize from string to number
    const size = query.pageSize ? parseInt(query.pageSize, 10) : 10;
    if (isNaN(size)) {
      throw new BadRequestException('Invalid pageSize, must be a number.');
    }

    // 2) Parse "theOne" from string → boolean or undefined
    let theOneBoolean: boolean | undefined;
    if (query.theOne === 'true') theOneBoolean = true;
    else if (query.theOne === 'false') theOneBoolean = false;

    // 3) Validate orderBy to be "top", "vip", or "desc" (else undefined → default)
    let orderByValue: 'allPoints' | 'accPoints' | 'desc' | undefined;
    if (query.orderBy === 'allPoints' || query.orderBy === 'accPoints' || query.orderBy === 'desc') {
      orderByValue = query.orderBy as 'allPoints' | 'accPoints' | 'desc';
    }

    // 4) Pass to your service
    return this.adminService.getCustomers({
      startDate: query.startDate,
      endDate: query.endDate,
      pageSize: size,
      cursor: query.cursor,
      phone: query.phone,
      theOne: theOneBoolean,
      orderBy: orderByValue,   // "top", "vip", "desc", or undefined
      theOneId: query.theOneId,
    });
  }



  @Post('/check')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.superAdmin)
  async checkAdminPassword(
    @Body() postData: { adminId: string; inputPassword: string },
  ) {
    return this.adminService.checkAdminPassword(
      postData.adminId,
      postData.inputPassword,
    );
  }

  @Get('/got-redeem')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.superAdmin, Role.branchAdmin)
  async getGotRedeem(
    @Query('redeemId') redeemId: string,
    @Query('branchId') branchId?: string,
  ) {
    if (!redeemId) {
      throw new BadRequestException('redeemId is required');
    }

    // Convert redeemId to number

    const gotRedeem = await this.adminService.getGotRedeemByredeemId(
      redeemId,
      branchId,
    );

    return gotRedeem;
  }

  @Get('/claimed')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.branchAdmin, Role.superAdmin)
  async getClaimedHistoryAdmin(
    @Query()
    query: {
      branchId?: string;
      startDate?: string;
      endDate?: string;
      pageSize?: string;
      cursor?: string;
      phone?: string;
    },
  ) {
    const size = query.pageSize ? parseInt(query.pageSize) : 10; // Default to 10

    if (isNaN(size)) {
      throw new BadRequestException('Invalid pageSize, must be a number.');
    }

    let cursorNumber: number | undefined;
    if (query.cursor) {
      cursorNumber = parseInt(query.cursor);
      if (isNaN(cursorNumber)) {
        throw new BadRequestException('Invalid cursor, must be a number.');
      }
    }

    return this.adminService.getClaimedHistoryAdmin({
      ...query,
      pageSize: size,
      cursor: cursorNumber,
    });
  }

  @Get('/download/receipts')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.superAdmin)
  async exportRceipt(
    @Res() res: Response,
    @Query()
    query: {
      branchId?: string;
      startDate?: string;
      endDate?: string;
      status?: string;
      phone?: string;
      receiptNo?: string;
    },
  ) {
    try {
      const excelBuffer = await this.adminService.exportRceiptExcel(query);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=receipts.xlsx',
      );
      res.send(excelBuffer);
    } catch (error) {
      res.status(500).json({
        message: 'Failed to export receipt to Excel',
        error: error.message,
      });
    }
  }

  @Get('/download/customers')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.superAdmin)
  async exportCustomers(
    @Res() res: Response,
    @Query()
    query: {
      startDate?: string;
      endDate?: string;
      phone?: string;
      theOne?: string;     // "true" or "false" or undefined
      orderBy?: string;    // "asc" | "desc" | "vip" or undefined
      theOneId?: string;
    },
  ) {
    try {
      // Convert "theOne" from string to boolean (true/false) or undefined
      let processedTheOne: boolean | undefined = undefined;
      if (query.theOne === 'true') {
        processedTheOne = true;
      } else if (query.theOne === 'false') {
        processedTheOne = false;
      }

      // Convert "orderBy" from string to "asc" | "desc" | "vip" or undefined
      let processedOrderBy: 'allPoints' | 'accPoints' | 'desc' | undefined;
      if (query.orderBy === 'allPoints' || query.orderBy === 'accPoints' || query.orderBy === 'desc') {
        processedOrderBy = query.orderBy as 'allPoints' | 'accPoints' | 'desc';
      }


      // Call your service function
      const excelBuffer = await this.adminService.exportCustomersExcel({
        startDate: query.startDate,
        endDate: query.endDate,
        phone: query.phone,
        theOne: processedTheOne,   // boolean or undefined
        orderBy: processedOrderBy, // "asc", "desc", "vip", or undefined
        theOneId: query.theOneId,
      });

      // Set headers for Excel file
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=customers.xlsx',
      );

      // Send the Excel buffer
      res.send(excelBuffer);
    } catch (error) {
      res.status(500).json({
        message: 'Failed to export customers to Excel',
        error: error.message,
      });
    }
  }


  @Get('/download/luckydraw')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.superAdmin)
  async exportCustomersLucky(
    @Res() res: Response,
    @Query()
    query: {
      startDate?: string;
      endDate?: string;
      phone?: string;
      theOne?: string;
      orderBy?: string;
    },
  ) {
    try {
      const processedTheOne =
        query.theOne === 'true'
          ? true
          : query.theOne === 'false'
            ? false
            : undefined;

      const processedOrderBy =
        query.orderBy === 'allPoints' || query.orderBy === 'accPoints' || query.orderBy === 'desc'
          ? query.orderBy
          : undefined;

      const excelBuffer = await this.adminService.exportCustomersLuckyExcel({
        ...query,
        theOne: processedTheOne, // Pass the converted boolean
        orderBy: processedOrderBy, // Pass validated orderBy
      });

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=customersLucky.xlsx',
      );
      res.send(excelBuffer);
    } catch (error) {
      res.status(500).json({
        message: 'Failed to export customersLucky to Excel',
        error: error.message,
      });
    }
  }

  @Get('/download/claimed')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.superAdmin, Role.branchAdmin)
  async exportClaimed(
    @Req() req: any,
    @Res() res: Response,
    @Query()
    query: {
      branchId?: string;
      rewardId?: string;
      startDate?: string;
      endDate?: string;
      phone?: string;
    },
  ) {
    try {
      const admin = req.user;
      // If branchAdmin, force their branchId to ensure they only see their branch's data
      if (admin.role === Role.branchAdmin) {
        query.branchId = admin.branchId;
      }

      const excelBuffer = await this.adminService.exportClaimedHist(query);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=claimedHistory.xlsx',
      );
      res.send(excelBuffer);
    } catch (error) {
      res.status(500).json({
        message: 'Failed to export claimedHistory to Excel',
        error: error.message,
      });
    }
  }

  @Post('/store/add')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.branchAdmin, Role.superAdmin)
  async addStoresBulk(@Body() dto: AddStoresBulkDto) {
    return this.adminService.addStoresBulk(dto.branchId, dto.stores);
  }

  @Post('/store/upload')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.branchAdmin, Role.superAdmin)
  @UseInterceptors(FileInterceptor('file'))
  async uploadStoresExcel(
    @Query('branchId') branchId: string,
    @UploadedFile() file: any,
  ) {
    if (!branchId) {
      throw new BadRequestException('branchId is required');
    }
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.adminService.uploadStoresExcel(branchId, file);
  }
}
