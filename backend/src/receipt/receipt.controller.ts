// src/receipt/receipt.controller.ts
import { Controller, Post, Body, BadRequestException, UseGuards, Get, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ReceiptService } from './receipt.service';
import { CreateReceiptDto } from './dto/receipt.dto';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('receipt')
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Post("upload")
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file')) 
  async createReceipt(
      @Body('receipt') receipt:string,
     @UploadedFile() file: Express.Multer.File) {
    try {
         // Parse the receipt to check if JSON is correct
         const parsedReceipt = JSON.parse(receipt);
         // Pass parsedReceipt through validation using DTO
         const validatedReceipt = new CreateReceiptDto();
         Object.assign(validatedReceipt, parsedReceipt);
      const receiptRes = await this.receiptService.createReceipt(validatedReceipt,file);
      return {
        message: 'Receipt created successfully',
        receiptRes,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  async getAllReceipts() {
    return await this.receiptService.getAllReceipts();
  }


}
