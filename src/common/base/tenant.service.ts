export abstract class TenantService {
  protected getTenantId(ctx: any): string {
    if (!ctx?.tenantId) {
      throw new Error('Tenant context missing');
    }
    return ctx.tenantId;
  }

  protected getUserId(ctx: any): string {
    return ctx?.userId;
  }

  protected getUserRole(ctx: any): string {
    return ctx?.role;
  }
}
