import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { AuditModule } from '../common/audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}
