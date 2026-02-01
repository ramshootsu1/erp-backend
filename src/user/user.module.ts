import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuditModule } from '../common/audit/audit.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    AuditModule, // 🔑 THIS FIXES THE ERROR
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
