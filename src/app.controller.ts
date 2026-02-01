import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Ctx } from './common/decorators/context.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(@Ctx() ctx: any) {
    return this.appService.getHello(ctx);
  }
}
