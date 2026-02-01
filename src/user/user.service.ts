import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantService as BaseTenantService } from '../common/base/tenant.service';
import { AuditService } from '../common/audit/audit.service';

@Injectable()
export class UserService extends BaseTenantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {
    super();
  }

  /**
   * Create a new user inside the current tenant
   */
  async createUser(
    ctx: any,
    data: { name: string; email: string; role: string },
  ) {
    const tenantId = this.getTenantId(ctx);

    const user = await this.prisma.user.create({
      data: {
        tenantId,
        name: data.name,
        email: data.email,
        role: data.role,
      },
    });

    // 🔒 Audit must never break the main flow
    this.audit
      .log({
        tenantId,
        userId: ctx.userId,
        action: 'USER_CREATED',
        entity: 'user',
        entityId: user.id,
        metadata: {
          email: user.email,
          role: user.role,
        },
      })
      .catch((err) => {
        console.error('Audit failed', err);
      });

    return user;
  }

  /**
   * List all active (non-deleted) users in the tenant
   */
  async listUsers(ctx: any) {
    const tenantId = this.getTenantId(ctx);

    return this.prisma.user.findMany({
      where: {
        tenantId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Soft delete a user
   */
  async deleteUser(ctx: any, userId: string) {
    const tenantId = this.getTenantId(ctx);

    const user = await this.prisma.user.update({
      where: {
        id: userId,
        tenantId,
      },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    // 🔒 Audit must never break the main flow
    this.audit
      .log({
        tenantId,
        userId: ctx.userId,
        action: 'USER_SOFT_DELETED',
        entity: 'user',
        entityId: user.id,
        metadata: {
          email: user.email,
        },
      })
      .catch((err) => {
        console.error('Audit failed', err);
      });

    return { success: true };
  }

  async restoreUser(ctx: any, userId: string) {
  const tenantId = this.getTenantId(ctx);

  const user = await this.prisma.user.findFirst({
    where: {
      id: userId,
      tenantId,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (!user.deletedAt) {
    throw new Error('User is not deleted');
  }

  const restoredUser = await this.prisma.user.update({
    where: {
      id: userId,
      tenantId,
    },
    data: {
      deletedAt: null,
      isActive: true,
    },
  });

  await this.audit.log({
    tenantId,
    userId: ctx.userId,
    action: 'USER_RESTORED',
    entity: 'user',
    entityId: restoredUser.id,
    metadata: {
      email: restoredUser.email,
    },
  });

  return { success: true };
}

}
