import { Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuditModule } from 'src/common/audit/audit.module';

@Module({
  imports: [
  PrismaModule,
  AuditModule,
],
  providers: [TenantService],
  controllers: [TenantController]
})
export class TenantModule {}
