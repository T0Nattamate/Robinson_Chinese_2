// src/receipt/receipt.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ReceiptController } from './receipt.controller';
import { ReceiptService } from './receipt.service';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [PrismaModule,FirebaseModule],
  controllers: [ReceiptController],
  providers: [ReceiptService],
})
export class ReceiptModule {}
