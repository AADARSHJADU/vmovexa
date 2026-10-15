/**
 * roles.js — backend role code ↔ frontend route prefix + label.
 * Used for post-login redirect and RBAC route guarding.
 */
export const ROLE = {
  SUPER_ADMIN: 'ROLE-SUPER-ADMIN',
  TENANT_ADMIN: 'ROLE-TENANT-ADMIN',
  FLEET_OPERATOR: 'ROLE-FLEET-OPERATOR',
  DRIVER: 'ROLE-DRIVER',
  CENTRAL_TECH: 'ROLE-CENTRAL-TECH',
  ADVERTISER: 'ROLE-ADVERTISER',
  GOVT_AGENCY: 'ROLE-GOVT-AGENCY',
  FINANCE_OFFICER: 'ROLE-FINANCE-OFFICER',
};

/** Role code → the route prefix its portal is mounted at (see AppRoutes). */
export const ROLE_HOME = {
  [ROLE.SUPER_ADMIN]: '/superadmin/dashboard',
  [ROLE.TENANT_ADMIN]: '/admin/dashboard',
  [ROLE.FLEET_OPERATOR]: '/fleet-manager/dashboard',
  [ROLE.DRIVER]: '/driver/dashboard',
  [ROLE.CENTRAL_TECH]: '/technician/dashboard',
  [ROLE.ADVERTISER]: '/advertiser/dashboard',
  [ROLE.GOVT_AGENCY]: '/government/dashboard',
  [ROLE.FINANCE_OFFICER]: '/finance/dashboard',
};

/** Route prefix → the role code(s) allowed to enter it (RBAC guard). */
export const PREFIX_ROLES = {
  superadmin: [ROLE.SUPER_ADMIN],
  admin: [ROLE.TENANT_ADMIN],
  'fleet-manager': [ROLE.FLEET_OPERATOR],
  driver: [ROLE.DRIVER],
  technician: [ROLE.CENTRAL_TECH],
  advertiser: [ROLE.ADVERTISER],
  government: [ROLE.GOVT_AGENCY],
  finance: [ROLE.FINANCE_OFFICER],
};

/** Where to send a user after login (falls back to /login if role unknown). */
export function homeForRole(roleCode, user = null) {
  if (roleCode === ROLE.TENANT_ADMIN && user) {
    const status = user.status;
    if (status === 'pending_approval') return '/admin/pending-approval';
    if (status === 'awaiting_subscription') return '/admin/subscription';
  }
  return ROLE_HOME[roleCode] || '/login';
}

export default { ROLE, ROLE_HOME, PREFIX_ROLES, homeForRole };
