import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export enum RewardType {
    MOVIE = 'redeem001',
    GOLD_A = 'redeem003',
    GOLD_B = 'redeem004',
    BOTH_GOLD = 'GOLD_BOTH',
}

export class RedeemRewardDto {
    @IsString()
    @IsNotEmpty()
    branchId: string;

    @IsString()
    @IsNotEmpty()
    redeemId: string; // Movie, Gold A, Gold B, or BOTH_GOLD

    @IsOptional()
    @IsString()
    lineId?: string; // Will be extracted from JWT but can be provided for admin/testing
}
