import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BranchService } from './branch.service';
import { Module } from '@nestjs/common';
import { BranchController } from './branch.controller';
//import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [BranchController],
  providers: [BranchService],
})
export class BranchModule {}
