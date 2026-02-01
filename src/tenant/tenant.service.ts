import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantService as BaseTenantService } from '../common/base/tenant.service';
import { TenantStatus } from '@prisma/client';
import { AuditService } from '../common/audit/audit.service';

@Injectable()
export class TenantService extends BaseTenantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {
    super();
  }

  async getCurrentTenant(ctx: any) {
    const tenantId = this.getTenantId(ctx);

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async changeStatus(ctx: any, newStatus: TenantStatus) {
    const tenantId = this.getTenantId(ctx);

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new BadRequestException('Tenant not found');
    }

    if (tenant.status === TenantStatus.CLOSED) {
      throw new BadRequestException(
        'Closed tenant cannot change status',
      );
    }

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { status: newStatus },
    });

    await this.audit.log({
      tenantId,
      userId: ctx.userId,
      action: 'TENANT_STATUS_CHANGED',
      entity: 'tenant',
      entityId: tenantId,
      metadata: {
        oldStatus: tenant.status,
        newStatus,
      },
    });

    return updated;
  }
}
