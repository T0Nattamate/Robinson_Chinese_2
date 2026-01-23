import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Module({
  providers: [FirebaseService],
  exports: [FirebaseService], // ต้อง export เพื่อให้นำไปใช้ใน module อื่นได้
})
export class FirebaseModule {}
