import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit/audit.service';
import { TenantService } from '../common/base/tenant.service';
import { RequestContext } from '../common/types/request-context';

@Injectable()
export class CustomersService extends TenantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {
    super();
  }

  async createCustomer(
    ctx: RequestContext,
    data: {
      name: string;
      code?: string;
      email?: string;
      phone?: string;
      notes?: string;
    },
  ) {
    const tenantId = this.getTenantId(ctx);
    const userId = this.getUserId(ctx);

    const customer = await this.prisma.customer.create({
      data: {
        tenantId,
        ...data,
      },
    });

    await this.auditService.log({
      tenantId,
      userId,
      action: 'CUSTOMER_CREATE',
      entity: 'Customer',
      entityId: customer.id,
      metadata: {
        name: customer.name,
      },
    });

    return customer;
  }

  async listCustomers(ctx: RequestContext) {
    const tenantId = this.getTenantId(ctx);

    return this.prisma.customer.findMany({
      where: {
        tenantId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getCustomerById(ctx: RequestContext, customerId: string) {
    const tenantId = this.getTenantId(ctx);

    const customer = await this.prisma.customer.findFirst({
      where: {
        id: customerId,
        tenantId,
        deletedAt: null,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async updateCustomer(
    ctx: RequestContext,
    customerId: string,
    data: {
      name?: string;
      code?: string;
      email?: string;
      phone?: string;
      notes?: string;
    },
  ) {
    const tenantId = this.getTenantId(ctx);
    const userId = this.getUserId(ctx);

    const existing = await this.prisma.customer.findFirst({
      where: {
        id: customerId,
        tenantId,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException('Customer not found');
    }

    const updated = await this.prisma.customer.update({
      where: { id: customerId },
      data,
    });

    await this.auditService.log({
      tenantId,
      userId,
      action: 'CUSTOMER_UPDATE',
      entity: 'Customer',
      entityId: customerId,
    });

    return updated;
  }

  async deleteCustomer(ctx: RequestContext, customerId: string) {
    const tenantId = this.getTenantId(ctx);
    const userId = this.getUserId(ctx);

    const existing = await this.prisma.customer.findFirst({
      where: {
        id: customerId,
        tenantId,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException('Customer not found or already deleted');
    }

    await this.prisma.customer.update({
      where: { id: customerId },
      data: {
        deletedAt: new Date(),
      },
    });

    await this.auditService.log({
      tenantId,
      userId,
      action: 'CUSTOMER_DELETE',
      entity: 'Customer',
      entityId: customerId,
    });
  }

  async restoreCustomer(ctx: RequestContext, customerId: string) {
    const tenantId = this.getTenantId(ctx);
    const userId = this.getUserId(ctx);

    const existing = await this.prisma.customer.findFirst({
      where: {
        id: customerId,
        tenantId,
        deletedAt: { not: null },
      },
    });

    if (!existing) {
      throw new NotFoundException('Customer not found or not deleted');
    }

    await this.prisma.customer.update({
      where: { id: customerId },
      data: {
        deletedAt: null,
      },
    });

    await this.auditService.log({
      tenantId,
      userId,
      action: 'CUSTOMER_RESTORE',
      entity: 'Customer',
      entityId: customerId,
    });
  }
}
