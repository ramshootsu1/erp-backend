import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: {
    tenantId: string;
    userId: string;
    action: string;
    entity: string;
    entityId?: string;
    metadata?: any;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          tenantId: params.tenantId,
          userId: params.userId,
          action: params.action,
          entity: params.entity,
          entityId: params.entityId,
          metadata: params.metadata,
        },
      });
    } catch (err) {
      // 🚨 Audit logging must NEVER break business logic
      console.error('Audit log failed', err);
    }
  }
}
