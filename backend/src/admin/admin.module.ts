import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { WebsocketGateway } from 'src/utils/websocket.gateway';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AdminController],
  providers: [AdminService, WebsocketGateway],
})
export class AdminModule {}
