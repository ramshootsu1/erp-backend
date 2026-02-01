import { Controller, Get, Post, Body, BadRequestException } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { Ctx } from '../common/decorators/context.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/auth/permissions';
import { TenantStatus } from '@prisma/client';

@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Permissions(Permission.TENANT_VIEW)
  @Get()
  getCurrent(@Ctx() ctx: any) {
    return this.tenantService.getCurrentTenant(ctx);
  }

  @Permissions(Permission.TENANT_STATUS_CHANGE)
  @Post('status')
  changeStatus(
    @Ctx() ctx: any,
    @Body('status') status: string,
  ) {
    const parsedStatus = this.parseTenantStatus(status);
    return this.tenantService.changeStatus(ctx, parsedStatus);
  }

  private parseTenantStatus(status: string): TenantStatus {
    switch (status) {
      case TenantStatus.ACTIVE:
        return TenantStatus.ACTIVE;
      case TenantStatus.SUSPENDED:
        return TenantStatus.SUSPENDED;
      case TenantStatus.CLOSED:
        return TenantStatus.CLOSED;
      default:
        throw new BadRequestException(
          `Invalid tenant status: ${status}`,
        );
    }
  }
}
