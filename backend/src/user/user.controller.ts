import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ClaimedActionDto, RegisterUserDto } from './dto/user.dto';
import { AuthGuard } from '@nestjs/passport';
import { validate as isUuid } from 'uuid';
import { RequestWithUser } from './dto/request.interface';

@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/register')
  async registerUser(@Body() postData: RegisterUserDto) {
    try {
      const response = await this.userService.createUser(postData);
      return {
        response,
        message: 'ลงทะเบียนผู้ใช้สำเร็จ',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('/login')
  async logInUser(
    @Body() postData: { lineId: string; lineProfilePic?: string },
  ) {
    const { lineId, lineProfilePic } = postData;

    if (!lineId) {
      throw new BadRequestException('กรุณาระบุ Line ID');
    }

    try {
      const response = await this.userService.loginWithLineId(
        lineId,
        lineProfilePic,
      );
      return {
        response,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('/info')
  @UseGuards(AuthGuard('jwt'))
  async getUserInfo(@Req() req: RequestWithUser) {
    const payload = req.user; // Extract the JWT payload from the request

    if (!payload?.lineId) {
      throw new BadRequestException(
        'Invalid token payload: lineId is missing.',
      );
    }

    return this.userService.getUserInfo(payload.lineId);
  }

  @Get('/receiptHistory/:userId')
  @UseGuards(AuthGuard('jwt'))
  async getReceiptHistory(
    @Req() req: RequestWithUser,
    @Query('pageSize') pageSize: string = '10',
    @Query('cursor') cursor?: string,
  ) {
    const payload = req.user;
    if (!payload?.lineId) {
      throw new BadRequestException(
        'Invalid token payload: lineId is missing.',
      );
    }

    const size = parseInt(pageSize);
    if (isNaN(size)) {
      throw new BadRequestException('Invalid pageSize, must be a number.');
    }

    const parsedCursor = cursor ? parseInt(cursor) : undefined;

    return this.userService.getReceiptHistory(
      payload.lineId,
      size,
      parsedCursor,
    );
  }

  // @Get('vip')
  // @UseGuards(AuthGuard('jwt'))
  // async getVipLists() {
  //   const topSpenders = await this.userService.getVipLists();
  //   return {
  //     message: 'Vip listed fetched successfully',
  //     topSpenders,
  //   };
  // }
  @Get('top-spender')
  @UseGuards(AuthGuard('jwt'))
  async getTopSpender() {
    const topSpenders = await this.userService.getTopSpender();
    return {
      message: 'top-spender listed fetched successfully',
      topSpenders,
    };
  }

  @Post('/claimed')
  @UseGuards(AuthGuard('jwt'))
  async claimAction(@Body() postData: ClaimedActionDto) {
    try {
      const response = await this.userService.claimAction(postData);
      return {
        response,
        message: 'แลกซื้อสำเร็จ',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('/claimed/hist')
  @UseGuards(AuthGuard('jwt'))
  async getClaimedHistory(
    @Req() req: RequestWithUser,
    @Query('pageSize') pageSize: string = '10',
    @Query('cursor') cursor?: string,
  ) {
    const size = parseInt(pageSize);
    const payload = req.user; // Extract the JWT payload from the request

    if (!payload?.lineId) {
      throw new BadRequestException(
        'Invalid token payload: lineId is missing.',
      );
    }

    if (isNaN(size)) {
      throw new BadRequestException('Invalid pageSize, must be a number.');
    }
    let cursorNumber: number | undefined;
    if (cursor) {
      cursorNumber = parseInt(cursor);
      if (isNaN(cursorNumber)) {
        throw new BadRequestException('Invalid cursor, must be a number.');
      }
    }
    return this.userService.getClaimedHistory(
      payload.lineId,
      size,
      cursorNumber,
    );
  }

  @Get('mostBranch')
  @UseGuards(AuthGuard('jwt'))
  async updateMostFrequentBranchId(@Req() req: RequestWithUser) {
    const payload = req.user; // Extract the JWT payload from the request

    if (!payload?.lineId) {
      throw new BadRequestException(
        'Invalid token payload: lineId is missing.',
      );
    }
    return await this.userService.updateMostFrequentBranchId(payload.lineId);
  }
}
