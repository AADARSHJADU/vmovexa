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
  [ROLE.FLEET_OPERATOR]: '/fleet-operator/dashboard',
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
  'fleet-operator': [ROLE.FLEET_OPERATOR],
  'fleet-manager': [ROLE.FLEET_OPERATOR],
  driver: [ROLE.DRIVER],
  technician: [ROLE.CENTRAL_TECH],
  advertiser: [ROLE.ADVERTISER],
  government: [ROLE.GOVT_AGENCY],
  finance: [ROLE.FINANCE_OFFICER],
};

/** Permission wildcard held only by Super Admin. */
export const WILDCARD_PERMISSION = '*';

/** Role code → portal (permission key prefix). Mirrors backend config/permissionRegistry.js. */
export const ROLE_PORTAL = {
  [ROLE.SUPER_ADMIN]: 'superadmin',
  [ROLE.TENANT_ADMIN]: 'admin',
  [ROLE.FLEET_OPERATOR]: 'fleet',
  [ROLE.DRIVER]: 'driver',
  [ROLE.CENTRAL_TECH]: 'technician',
  [ROLE.ADVERTISER]: 'advertiser',
  [ROLE.GOVT_AGENCY]: 'government',
  [ROLE.FINANCE_OFFICER]: 'finance',
};

/** Features that are named differently between portals (shared pages ask for the generic name). */
const FEATURE_ALIASES = {
  admin: { devices: 'edge_devices', fleets: 'fleet_operators' },
  fleet: { fleets: 'vehicles' },
};

/**
 * 'vehicles.view' (or an array of them) → full keys for the given role's portal.
 * Used by shared pages that are mounted under several portals.
 */
export function toPortalKeys(roleCode, rel) {
  const portal = ROLE_PORTAL[roleCode];
  const list = Array.isArray(rel) ? rel : [rel];
  if (!portal) return list.map(() => '__no_portal__');
  const aliases = FEATURE_ALIASES[portal] || {};
  return list.map((r) => {
    const [feature, ...rest] = String(r).split('.');
    return `${portal}.${aliases[feature] || feature}.${rest.join('.')}`;
  });
}

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
