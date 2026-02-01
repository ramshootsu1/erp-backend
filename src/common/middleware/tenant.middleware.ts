import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: any, _res: any, next: () => void) {
    req.context = {
      tenantId: 'demo-tenant-id',
      userId: 'demo-user-id',
      role: 'OWNER', // 👈 MUST be OWNER or ADMIN
    };

    next();
  }
}
