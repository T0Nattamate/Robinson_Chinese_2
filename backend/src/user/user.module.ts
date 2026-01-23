import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from 'src/auth/auth.module';
//import { RedisService } from 'src/redis/redis.service';
import { WebsocketGateway } from 'src/utils/websocket.gateway';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UserController],
  providers: [UserService, WebsocketGateway],
})
export class UserModule {}
