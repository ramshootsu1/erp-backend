import { Permission } from './permissions';

export const RolePermissions: Record<string, Permission[]> = {
  OWNER: [

    Permission.USER_VIEW,
    Permission.USER_CREATE,
    Permission.TENANT_VIEW,
    Permission.TENANT_STATUS_CHANGE,
    Permission.TENANT_CREATE,
    ],

  ADMIN: [
    Permission.USER_VIEW,
    Permission.USER_CREATE,
    Permission.TENANT_VIEW,
  ],

  STAFF: [
    Permission.USER_VIEW,
  ],
};
