import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Query,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { BranchService } from './branch.service';
import { CreateBranchDto, CreateBranchStockDto } from './dto/branch.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role.decorator';
import { Role } from 'src/auth/role.enum';

@Controller('branch')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post('/create')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.secretAdmin)
  async createBranch(@Body() createBranchDto: CreateBranchDto) {
    return this.branchService.createBranch(createBranchDto);
  }

  @Post('/add-store')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.secretAdmin)
  async updateStoresInBranch(
    @Body()
    postData: {
      branchId: string;
      stores: {
        storeId?: string;
        storeName: string;
        isStoreEnable: boolean;
        canLuckydraw: boolean;
        canBag: boolean;
      }[];
    },
  ) {
    if (!postData.branchId || !postData.stores || !postData.stores.length) {
      throw new BadRequestException('branchId and stores data are required.');
    }

    return this.branchService.updateStoresInBranch(
      postData.branchId,
      postData.stores,
    );
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.secretAdmin)
  async getAllBranches() {
    return this.branchService.getAllBranches();
  }

  @Get('/available')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.secretAdmin, Role.branchAdmin, Role.superAdmin)
  async getAvailableBranchesAndStores() {
    return this.branchService.getAvailableBranchesAndStores();
  }
  @Get('/stock/hist/:branchId')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.secretAdmin, Role.branchAdmin, Role.superAdmin)
  async getBranchStockHist(@Param('branchId') branchId: string) {
    return this.branchService.getBranchStockHist(branchId);
  }
  
  @Get('/stock/:branchId')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.secretAdmin, Role.branchAdmin, Role.superAdmin)
  async getBranchStockAll(@Param('branchId') branchId: string) {
    return this.branchService.getBranchStockAll(branchId);
  }

  @Get('/stock/:branchId/:redeemId')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.secretAdmin, Role.branchAdmin, Role.superAdmin)
  async getBranchStockRedeem(@Param('branchId') branchId: string, @Param("redeemId") redeemId: string) {
    return this.branchService.getBranchStockRedeem(branchId,redeemId);
  }

  @Post('/stock/update')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.branchAdmin)
  updateBranchStock(@Body() postData: CreateBranchStockDto) {
    return this.branchService.updateBranchStock(postData);
  }

  @Patch('/status/:branchId/:storeId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.secretAdmin)
  async updateStoreStatus(
    @Param('branchId') branchId: string,
    @Param('storeId') storeId: string,
    @Body() body: { isStoreEnable: boolean },
  ) {
    const { isStoreEnable } = body;
    return this.branchService.updateStoreStatus(
      branchId,
      storeId,
      isStoreEnable,
    );
  }

  @Patch('/status/:branchId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.secretAdmin)
  async updateBranchStatus(
    @Param('branchId') branchId: string,
    @Body() body: { isBranchEnable: boolean },
  ) {
    const { isBranchEnable } = body;
    return this.branchService.updateBranchStatus(branchId, isBranchEnable);
  }
}
