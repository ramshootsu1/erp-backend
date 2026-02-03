import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Ctx } from '../common/decorators/context.decorator';
import * as requestContext from '../common/types/request-context';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/auth/permissions';
import { CreateCustomerAddressDto } from './dto/create-customer-address.dto';


@Controller('customers')
@Roles(Role.OWNER, Role.ADMIN, Role.STAFF)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Permissions(Permission.CUSTOMER_CREATE)
  create(
    @Ctx() ctx: requestContext.RequestContext,
    @Body() dto: CreateCustomerDto,
  ) {
    return this.customersService.createCustomer(ctx, dto);
  }

  @Get()
  @Permissions(Permission.CUSTOMER_VIEW)
  findAll(@Ctx() ctx: requestContext.RequestContext) {
    return this.customersService.listCustomers(ctx);
  }

  @Get(':id')
  @Permissions(Permission.CUSTOMER_VIEW)
  findOne(
    @Ctx() ctx: requestContext.RequestContext,
    @Param('id') id: string,
  ) {
    return this.customersService.getCustomerById(ctx, id);
  }

  @Patch(':id')
  @Permissions(Permission.CUSTOMER_UPDATE)
  update(
    @Ctx() ctx: requestContext.RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.updateCustomer(ctx, id, dto);
  }

  @Delete(':id')
  @Permissions(Permission.CUSTOMER_DELETE)
  remove(
    @Ctx() ctx: requestContext.RequestContext,
    @Param('id') id: string,
  ) {
    return this.customersService.deleteCustomer(ctx, id);
  }

  @Post(':id/restore')
  @Permissions(Permission.CUSTOMER_RESTORE)
  restore(
    @Ctx() ctx: requestContext.RequestContext,
    @Param('id') id: string,
  ) {
    return this.customersService.restoreCustomer(ctx, id);
  }

  @Post(':id/addresses')
@Permissions(Permission.CUSTOMER_UPDATE)
addAddress(
  @Ctx() ctx: requestContext.RequestContext,
  @Param('id') customerId: string,
  @Body() dto: CreateCustomerAddressDto,
) {
  return this.customersService.addCustomerAddress(
    ctx,
    customerId,
    dto,
  );
}

@Get(':id/addresses')
@Permissions(Permission.CUSTOMER_VIEW)
listAddresses(
  @Ctx() ctx: requestContext.RequestContext,
  @Param('id') customerId: string,
) {
  return this.customersService.listCustomerAddresses(
    ctx,
    customerId,
  );
}

@Delete('addresses/:addressId')
@Permissions(Permission.CUSTOMER_UPDATE)
deleteAddress(
  @Ctx() ctx: requestContext.RequestContext,
  @Param('addressId') addressId: string,
) {
  return this.customersService.deleteCustomerAddress(
    ctx,
    addressId,
  );
}

}
