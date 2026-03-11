import { RequestContext } from '../common/types/request-context';

declare global {
  namespace Express {
    interface UserPayload {
      userId: string;
      tenantId: string;
      role: string;
    }

    interface Request {
      user?: UserPayload;
      context?: RequestContext;
    }
  }
}