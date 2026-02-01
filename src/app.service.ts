import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getHello(ctx: any): Promise<string> {
    const count = await this.prisma.tenant.count();
    return `Tenant: ${ctx.tenantId} | Tenants in DB: ${count}`;
  }
}
