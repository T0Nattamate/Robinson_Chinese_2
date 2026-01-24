import { Controller, Get, Post, Body, Param, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { RewardService } from './reward.service';
import { RedeemRewardDto } from './dto/reward.dto';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser } from '../user/dto/request.interface';

@Controller('reward')
export class RewardController {
    constructor(private readonly rewardService: RewardService) { }

    @Get('available/:branchId')
    @UseGuards(AuthGuard('jwt'))
    async getAvailableRewards(@Param('branchId') branchId: string) {
        return this.rewardService.getAvailableRewards(branchId);
    }

    @Post('redeem')
    @UseGuards(AuthGuard('jwt'))
    async redeemReward(
        @Body() data: RedeemRewardDto,
        @Req() req: RequestWithUser,
    ) {
        const lineId = req.user?.lineId;
        if (!lineId) {
            throw new BadRequestException('User information not found in token.');
        }
        return this.rewardService.redeemReward(data, lineId);
    }
}
