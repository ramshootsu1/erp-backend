import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Ctx } from '../common/decorators/context.decorator';
import type { RequestContext } from '../common/types/request-context';
import { SignupDto } from './dto/signup.dto';
import { SelectTenantDto } from './dto/select-tenant.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

@Post('login')
async login(@Body() dto: LoginDto) {
  return this.authService.login(dto.email, dto.password);
}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Ctx() ctx: RequestContext) {
    return {
      userId: ctx.userId,
      tenantId: ctx.tenantId,
      role: ctx.role,
    };
  }

  @Post('signup')
  async signup(@Body() dto: SignupDto) {
  return this.authService.signup(dto);
}

@UseGuards(JwtAuthGuard)
@Post('select-tenant')
async selectTenant(
  @Ctx() ctx: RequestContext,
  @Body() dto: SelectTenantDto,
) {
  return this.authService.selectTenant(ctx.userId, dto.tenantId);
}
}