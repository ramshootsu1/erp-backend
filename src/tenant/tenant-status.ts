export const TenantStatus = {
  TRIAL: 'trial',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  CLOSED: 'closed',
} as const;

export type TenantStatusType =
  typeof TenantStatus[keyof typeof TenantStatus];
