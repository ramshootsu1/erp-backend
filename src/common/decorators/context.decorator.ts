import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestContext } from '../types/request-context';

export const Ctx = createParamDecorator(
  (_: unknown, context: ExecutionContext): RequestContext => {
    const request = context.switchToHttp().getRequest();
    return request.context;
  },
);
