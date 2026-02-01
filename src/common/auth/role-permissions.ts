import { Permission } from './permissions';

export const RolePermissions: Record<string, Permission[]> = {
  OWNER: [

    Permission.USER_VIEW,
    Permission.USER_CREATE,
    Permission.TENANT_VIEW,
    Permission.TENANT_STATUS_CHANGE,
    Permission.TENANT_CREATE,

    Permission.CUSTOMER_CREATE,
    Permission.CUSTOMER_VIEW,
    Permission.CUSTOMER_UPDATE,
    Permission.CUSTOMER_DELETE,
    Permission.CUSTOMER_RESTORE,
    ],

  ADMIN: [
    Permission.USER_VIEW,
    Permission.USER_CREATE,
    Permission.TENANT_VIEW,

    Permission.CUSTOMER_CREATE,
    Permission.CUSTOMER_VIEW,
    Permission.CUSTOMER_UPDATE,
  ],

  STAFF: [

    Permission.CUSTOMER_VIEW,
    Permission.USER_VIEW,
  ],
};
