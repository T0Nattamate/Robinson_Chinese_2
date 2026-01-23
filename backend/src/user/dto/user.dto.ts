import {
  IsString,
  IsBoolean,
  IsOptional,
  IsEmail,
  Length,
  IsUUID,
  IsDateString,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';
export class RegisterUserDto {
  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกชื่อ-นามสกุล' })
  fullname: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกหมายเลขโทรศัพท์' })
  @Length(10, 10, { message: 'กรุณากรอกหมายเลขโทรศัพท์ให้ครบทั้ง 10 หลัก' })
  phone: string;

  @IsEmail({}, { message: 'กรุณากรอกอีเมลให้ถูกต้อง' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณาเข้าสู่ระบบด้วย Line ก่อนทำการลงทะเบียน' })
  lineId: string;

  @IsString()
  @IsOptional()
  lineProfilePic?: string;

  @IsBoolean()
  @IsOptional()
  isTheOne?: boolean = false;

  @IsString()
  @IsOptional()
  theOneId?: string;
}

export class ClaimedActionDto {
  @IsNotEmpty({ message: 'missing branchId' })
  @IsString()
  branchId: string;

  @IsNotEmpty({ message: 'missing lineId' })
  @IsString()
  lineId: string;

  @IsNotEmpty({ message: 'missing redeemId' })
  @IsString()
  redeemId: string;

  @IsNotEmpty({ message: 'missing claimedAmount' })
  @IsNumber()
  claimedAmount?: number;
}
