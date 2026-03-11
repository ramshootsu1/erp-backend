import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { Ctx } from '../common/decorators/context.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/auth/permissions';
import { Role } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Permissions(Permission.USER_VIEW)
  list(@Ctx() ctx: any) {
    return this.userService.listUsers(ctx);
  }

  @Delete(':id')
  @Permissions(Permission.USER_CREATE)
  delete(@Ctx() ctx: any, @Param('id') id: string) {
    return this.userService.deleteUser(ctx, id);
  }

  @Post()
  @Permissions(Permission.USER_CREATE)
  createUser(@Ctx() ctx: any, @Body() dto: CreateUserDto) {
  return this.userService.createUser(ctx, dto);
}

  @Permissions(Permission.USER_CREATE) // reuse for now
  @Post(':id/restore')
  restore(@Ctx() ctx: any, @Param('id') id: string) {
  return this.userService.restoreUser(ctx, id);
  }
}
