import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './utils/winston.config';
import { FirebaseModule } from './firebase/firebase.module';
import { UserModule } from './user/user.module';
import { BranchModule } from './Branch/branch.module';
import { ReceiptModule } from './receipt/receipt.module';
import { AdminModule } from './admin/admin.module';
//import { RedisService } from './redis/redis.service';
import { WebsocketGateway } from './utils/websocket.gateway';
import { ResetDailyRightsService } from './job/reset-daily-rights.service';
import { ScheduleModule } from '@nestjs/schedule'; 
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    UserModule,
    BranchModule,
    AuthModule,
    FirebaseModule,
    ReceiptModule,
    AdminModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    WinstonModule.forRoot(winstonConfig),
    PrismaModule, 
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, WebsocketGateway,ResetDailyRightsService,],
  //exports: [RedisService],
})
export class AppModule {}
