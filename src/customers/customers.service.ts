import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit/audit.service';
import { TenantService } from '../common/base/tenant.service';
import { RequestContext } from '../common/types/request-context';
import { Prisma } from '@prisma/client';
import { CreateCustomerAddressDto } from './dto/create-customer-address.dto';
import { CreateCustomerContactDto } from './dto/create-customer-contact.dto';

@Injectable()
export class CustomersService extends TenantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {
    super();
  }

  async createCustomer(
    ctx: RequestContext,
    data: {
      name: string;
      code?: string;
      email?: string;
      phone?: string;
      notes?: string;
    },
  ) {
    const tenantId = this.getTenantId(ctx);
    const userId = this.getUserId(ctx);

    try {
      const customer = await this.prisma.customer.create({
        data: {
          tenantId,
          ...data,
        },
      });

      await this.auditService.log({
        tenantId,
        userId,
        action: 'CUSTOMER_CREATE',
        entity: 'Customer',
        entityId: customer.id,
        metadata: { name: customer.name },
      });

      return customer;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Customer code already exists for this tenant',
        );
      }
      throw error;
    }
  }

  async listCustomers(
    ctx: RequestContext,
    options?: { skip?: number; take?: number },
  ) {
    const tenantId = this.getTenantId(ctx);

    return this.prisma.customer.findMany({
      where: {
        tenantId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: options?.skip ?? 0,
      take: options?.take ?? 50,
    });
  }

  async getCustomerById(ctx: RequestContext, customerId: string) {
    const tenantId = this.getTenantId(ctx);

    const customer = await this.prisma.customer.findFirst({
      where: {
        id: customerId,
        tenantId,
        deletedAt: null,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async updateCustomer(
    ctx: RequestContext,
    customerId: string,
    data: {
      name?: string;
      code?: string;
      email?: string;
      phone?: string;
      notes?: string;
    },
  ) {
    const tenantId = this.getTenantId(ctx);
    const userId = this.getUserId(ctx);

    const existing = await this.prisma.customer.findFirst({
      where: {
        id: customerId,
        tenantId,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException('Customer not found');
    }

    try {
      const updated = await this.prisma.customer.update({
        where: { id: customerId },
        data,
      });

      await this.auditService.log({
        tenantId,
        userId,
        action: 'CUSTOMER_UPDATE',
        entity: 'Customer',
        entityId: customerId,
      });

      return updated;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Customer code already exists for this tenant',
        );
      }
      throw error;
    }
  }

  async deleteCustomer(ctx: RequestContext, customerId: string) {
    const tenantId = this.getTenantId(ctx);
    const userId = this.getUserId(ctx);

    const existing = await this.prisma.customer.findFirst({
      where: {
        id: customerId,
        tenantId,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException('Customer not found or already deleted');
    }

    await this.prisma.customer.update({
      where: { id: customerId },
      data: {
        deletedAt: new Date(),
      },
    });

    await this.auditService.log({
      tenantId,
      userId,
      action: 'CUSTOMER_DELETE',
      entity: 'Customer',
      entityId: customerId,
    });
  }

  async restoreCustomer(ctx: RequestContext, customerId: string) {
    const tenantId = this.getTenantId(ctx);
    const userId = this.getUserId(ctx);

    const existing = await this.prisma.customer.findFirst({
      where: {
        id: customerId,
        tenantId,
        deletedAt: { not: null },
      },
    });

    if (!existing) {
      throw new NotFoundException('Customer not found or not deleted');
    }

    // ✅ Safe restore: codes are non-reusable by design
    await this.prisma.customer.update({
      where: { id: customerId },
      data: {
        deletedAt: null,
      },
    });

    await this.auditService.log({
      tenantId,
      userId,
      action: 'CUSTOMER_RESTORE',
      entity: 'Customer',
      entityId: customerId,
    });
  }
//--------------customer addresses---------
  async addCustomerAddress(
    ctx: RequestContext,
    customerId: string,
    data: CreateCustomerAddressDto,
  ) {
    const tenantId = this.getTenantId(ctx);
    const userId = this.getUserId(ctx);

    const customer = await this.prisma.customer.findFirst({
      where: {
        id: customerId,
        tenantId,
        deletedAt: null,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Enforce single default per customer
    if (data.isDefault) {
      await this.prisma.customerAddress.updateMany({
        where: {
          tenantId,
          customerId,
          deletedAt: null,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const address = await this.prisma.customerAddress.create({
      data: {
        tenantId,
        customerId,
        ...data,
      },
    });

    await this.auditService.log({
      tenantId,
      userId,
      action: 'CUSTOMER_ADDRESS_CREATE',
      entity: 'CustomerAddress',
      entityId: address.id,
    });

    return address;
  }

  async listCustomerAddresses(
    ctx: RequestContext,
    customerId: string,
  ) {
    const tenantId = this.getTenantId(ctx);

    return this.prisma.customerAddress.findMany({
      where: {
        tenantId,
        customerId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async deleteCustomerAddress(
    ctx: RequestContext,
    addressId: string,
  ) {
    const tenantId = this.getTenantId(ctx);
    const userId = this.getUserId(ctx);

    const address = await this.prisma.customerAddress.findFirst({
      where: {
        id: addressId,
        tenantId,
        deletedAt: null,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    await this.prisma.customerAddress.update({
      where: { id: addressId },
      data: {
        deletedAt: new Date(),
      },
    });

    await this.auditService.log({
      tenantId,
      userId,
      action: 'CUSTOMER_ADDRESS_DELETE',
      entity: 'CustomerAddress',
      entityId: addressId,
    });
  }

//customer contacts methods ------------
  async addCustomerContact(
    ctx: RequestContext,
    customerId: string,
    data: CreateCustomerContactDto,
  ) {
    const tenantId = this.getTenantId(ctx);
    const userId = this.getUserId(ctx);

    // Ensure customer exists & active
    const customer = await this.prisma.customer.findFirst({
      where: {
        id: customerId,
        tenantId,
        deletedAt: null,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Enforce single primary contact
    if (data.isPrimary) {
      await this.prisma.customerContact.updateMany({
        where: {
          tenantId,
          customerId,
          deletedAt: null,
        },
        data: { isPrimary: false },
      });
    }

    const contact = await this.prisma.customerContact.create({
      data: {
        tenantId,
        customerId,
        ...data,
      },
    });

    await this.auditService.log({
      tenantId,
      userId,
      action: 'CUSTOMER_CONTACT_CREATE',
      entity: 'CustomerContact',
      entityId: contact.id,
    });

    return contact;
  }

  async listCustomerContacts(
    ctx: RequestContext,
    customerId: string,
  ) {
    const tenantId = this.getTenantId(ctx);

    return this.prisma.customerContact.findMany({
      where: {
        tenantId,
        customerId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async deleteCustomerContact(
    ctx: RequestContext,
    contactId: string,
  ) {
    const tenantId = this.getTenantId(ctx);
    const userId = this.getUserId(ctx);

    const contact = await this.prisma.customerContact.findFirst({
      where: {
        id: contactId,
        tenantId,
        deletedAt: null,
      },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    await this.prisma.customerContact.update({
      where: { id: contactId },
      data: {
        deletedAt: new Date(),
      },
    });

    await this.auditService.log({
      tenantId,
      userId,
      action: 'CUSTOMER_CONTACT_DELETE',
      entity: 'CustomerContact',
      entityId: contactId,
    });
  }


}
