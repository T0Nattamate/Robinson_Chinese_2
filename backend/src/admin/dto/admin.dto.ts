import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateAdminDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsOptional()
  branchId?: string;

  @IsOptional()
  @IsBoolean()
  isMfa?: boolean;

  @IsOptional()
  @IsBoolean()
  isEnable?: boolean;

  @IsOptional()
  @IsString()
  role?: string;
}

export class CreateLuckyDto {
  @IsInt()
  @IsNotEmpty()
  week: number;

  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class UpdateAdminDto {
  @IsUUID()
  adminId: string;

  @IsOptional()
  branchId?: string;

  @IsOptional()
  @IsString()
  newPassword?: string;

  @IsOptional()
  @IsBoolean()
  isEnable?: boolean;
}
