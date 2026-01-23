import {
  IsString,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBranchDto {
  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอก branchId' })
  branchId: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอก branchName' })
  branchName: string;

  @IsBoolean()
  @IsOptional()
  isBranchEnable?: boolean;

  @IsBoolean()
  @IsOptional()
  canVip?: boolean;

  @IsNumber()
  @IsOptional()
  vipPoint?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStoreDto)
  stores: CreateStoreDto[];
}

class CreateStoreDto {
  @IsString()
  storeName: string;

  @IsBoolean()
  @IsOptional()
  isStoreEnable?: boolean;

  @IsBoolean()
  @IsOptional()
  canLuckydraw?: boolean;

  @IsBoolean()
  @IsOptional()
  canBag?: boolean;
}

export class CreateBranchStockDto {
  @IsNotEmpty()
  @IsString()
  adminId: string;

  @IsNotEmpty()
  @IsString()
  branchId: string;

  @IsNotEmpty()
  @IsString()
  redeemId: string;

  @IsOptional()
  @IsNumber()
  amount?: number = 0;

  @IsOptional()
  @IsBoolean()
  isEnable?: boolean = true;
}
