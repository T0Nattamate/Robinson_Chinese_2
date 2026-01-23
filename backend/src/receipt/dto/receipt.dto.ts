import {
  IsString,
  IsUUID,
  IsDateString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateReceiptDto {
  @IsString()
  @IsNotEmpty({ message: 'ReceiptNo is required' })
  receiptNo?: string;

  @IsDateString()
  @IsNotEmpty({ message: 'Receipt date is required' })
  receiptDate: string;

  @IsUUID()
  @IsNotEmpty({ message: 'User ID is required' })
  lineId: string;

  @IsString()
  branchName: string;

  @IsString()
  storeName: string;

  @IsNumber()
  @Min(0, { message: 'Amount must be greater than or equal to 0' })
  amount: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  receiptPoints?: number;
}
