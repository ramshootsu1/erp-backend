import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import type { RequestContext } from '../types/request-context';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const user = req.user as any;

    if (!user) {
      return next();
    }

    const context: RequestContext = {
      tenantId: user.tenantId,
      userId: user.userId,
      role: user.role,
      membershipId: user.membershipId,
    };

    req.context = context;

    next();
  }
}