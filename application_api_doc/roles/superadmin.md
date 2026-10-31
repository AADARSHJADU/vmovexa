# SuperAdmin Platform Portal — API Documentation

> **Role:** `ROLE-SUPERADMIN`  
> **Base Path:** `https://api.vmovexa.com/api/v1` (Local: `http://localhost:4000/api/v1`)  
> **Total Endpoints:** 53 APIs (All 100% verified against backend route manifests)  
> **Updated:** 2026-10-31  
> **Platform Scope:** SuperAdmin has cross-tenant platform visibility and impersonation capabilities

See [app developer guide](../APP_DEVELOPER_GUIDE.md) and [complete request reference](../API_REFERENCE.md). For realtime events see [REALTIME_AND_GPS.md](../REALTIME_AND_GPS.md).

---

## 📋 Complete Endpoints Summary (53 APIs)

### 1. Tenant Organizations Management (10 APIs)
| Method | Endpoint | Permissions | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/organizations` | `orgs.view`, `technician.devices.view`, `finance.subscriptions.view` | List all tenant organizations across platform | [Reference](../API_REFERENCE.md#get-api-v1-organizations) |
| `POST` | `/api/v1/organizations` | `orgs.create`, `finance.subscriptions.create`, `finance.subscriptions.manage` | Direct provision of new tenant organization | [Reference](../API_REFERENCE.md#post-api-v1-organizations) |
| `GET` | `/api/v1/organizations/:id` | `orgs.view`, `technician.devices.view`, `finance.subscriptions.view` | Get organization profile & fleet quotas | [Reference](../API_REFERENCE.md#get-api-v1-organizations-id) |
| `PATCH` | `/api/v1/organizations/:id` | `orgs.update`, `finance.subscriptions.update`, `finance.subscriptions.manage` | Update organization quotas, address, or plan tier | [Reference](../API_REFERENCE.md#patch-api-v1-organizations-id) |
| `POST` | `/api/v1/organizations/:id/approve` | `orgs.approve` | Approve pending tenant self-registration | [Reference](../API_REFERENCE.md#post-api-v1-organizations-id-approve) |
| `GET` | `/api/v1/organizations/:id/features` | `orgs.view`, `technician.devices.view`, `finance.subscriptions.view` | List enabled feature flags for tenant | [Reference](../API_REFERENCE.md#get-api-v1-organizations-id-features) |
| `PATCH` | `/api/v1/organizations/:id/features` | `orgs.update`, `finance.subscriptions.update`, `finance.subscriptions.manage` | Toggle modular feature flags (GPS, AI Camera, In-bus TV) | [Reference](../API_REFERENCE.md#patch-api-v1-organizations-id-features) |
| `POST` | `/api/v1/organizations/:id/reject` | `orgs.approve` | Reject tenant registration application | [Reference](../API_REFERENCE.md#post-api-v1-organizations-id-reject) |
| `POST` | `/api/v1/organizations/:id/reset-admin-password` | `orgs.update`, `finance.subscriptions.update`, `finance.subscriptions.manage` | Emergency reset of tenant primary admin credentials | [Reference](../API_REFERENCE.md#post-api-v1-organizations-id-reset-admin-password) |
| `PATCH` | `/api/v1/organizations/:id/status` | `orgs.suspend`, `orgs.delete` | Suspend, deactivate, or activate tenant organization | [Reference](../API_REFERENCE.md#patch-api-v1-organizations-id-status) |

### 2. Global Users & Staff (11 APIs)
| Method | Endpoint | Permissions | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/users` | `users.view`, `fleet.fleets.view` | List all platform users with filtering & search | [Reference](../API_REFERENCE.md#get-api-v1-users) |
| `POST` | `/api/v1/users` | `users.create`, `fleet.fleets.create` | Create new staff user | [Reference](../API_REFERENCE.md#post-api-v1-users) |
| `DELETE` | `/api/v1/users/:id` | `users.delete`, `fleet.fleets.delete` | Delete / soft-delete user account | [Reference](../API_REFERENCE.md#delete-api-v1-users-id) |
| `GET` | `/api/v1/users/:id` | `users.view`, `fleet.fleets.view` | Get user details | [Reference](../API_REFERENCE.md#get-api-v1-users-id) |
| `PATCH` | `/api/v1/users/:id` | `users.update`, `fleet.fleets.update` | Update user profile details | [Reference](../API_REFERENCE.md#patch-api-v1-users-id) |
| `GET` | `/api/v1/users/:id/activity` | `users.view`, `fleet.fleets.view` | User security audit and login session history | [Reference](../API_REFERENCE.md#get-api-v1-users-id-activity) |
| `GET` | `/api/v1/users/:id/permissions` | `users.view`, `fleet.fleets.view` | Get effective user permissions | [Reference](../API_REFERENCE.md#get-api-v1-users-id-permissions) |
| `PUT` | `/api/v1/users/:id/permissions` | `users.permissions.manage` | Override user specific permission grants | [Reference](../API_REFERENCE.md#put-api-v1-users-id-permissions) |
| `PATCH` | `/api/v1/users/:id/status` | `users.update`, `fleet.fleets.update` | Lock, unlock, suspend, or activate user account | [Reference](../API_REFERENCE.md#patch-api-v1-users-id-status) |
| `GET` | `/api/v1/users/check-availability` | None | Check email / phone collision before user creation | [Reference](../API_REFERENCE.md#get-api-v1-users-check-availability) |
| `GET` | `/api/v1/users/quotas/fleet-operators` | `users.view`, `fleet.fleets.view` | Check remaining operator seats in tenant tier | [Reference](../API_REFERENCE.md#get-api-v1-users-quotas-fleet-operators) |

### 3. SuperAdmin Impersonation (4 APIs)
| Method | Endpoint | Permissions | Description | Reference |
|---|---|---|---|---|
| `POST` | `/api/v1/admin/impersonate/:userId` | `platform.impersonate` | Impersonate any specific user ID | [Reference](../API_REFERENCE.md#post-api-v1-admin-impersonate-userid) |
| `POST` | `/api/v1/admin/impersonate/advertiser/:advertiserId` | `platform.impersonate` | Impersonate an advertiser brand account | [Reference](../API_REFERENCE.md#post-api-v1-admin-impersonate-advertiser-advertiserid) |
| `POST` | `/api/v1/admin/impersonate/stop` | None | Exit impersonation mode and return to SuperAdmin session | [Reference](../API_REFERENCE.md#post-api-v1-admin-impersonate-stop) |
| `POST` | `/api/v1/admin/impersonate/tenant/:organizationId` | `platform.impersonate` | Impersonate a tenant organization admin | [Reference](../API_REFERENCE.md#post-api-v1-admin-impersonate-tenant-organizationid) |

### 4. Global Approvals Workflow (4 APIs)
| Method | Endpoint | Permissions | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/approvals` | `orgs.view`, `orgs.approve`, `fleet.fleets.view` | List all pending approval queues across domains | [Reference](../API_REFERENCE.md#get-api-v1-approvals) |
| `GET` | `/api/v1/approvals/:id` | `orgs.view`, `orgs.approve`, `fleet.fleets.view` | Get approval item details | [Reference](../API_REFERENCE.md#get-api-v1-approvals-id) |
| `POST` | `/api/v1/approvals/:id/approve` | `orgs.approve`, `fleet.fleets.update` | Approve pending registration / route / compliance item | [Reference](../API_REFERENCE.md#post-api-v1-approvals-id-approve) |
| `POST` | `/api/v1/approvals/:id/reject` | `orgs.approve`, `fleet.fleets.update` | Reject pending item with feedback | [Reference](../API_REFERENCE.md#post-api-v1-approvals-id-reject) |

### 5. RBAC Roles & Permissions Catalog (8 APIs)
| Method | Endpoint | Permissions | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/permissions` | None | List master platform permissions | [Reference](../API_REFERENCE.md#get-api-v1-permissions) |
| `GET` | `/api/v1/permissions/modules` | None | Grouped permissions matrix by feature module | [Reference](../API_REFERENCE.md#get-api-v1-permissions-modules) |
| `GET` | `/api/v1/roles` | `rbac.roles.view` | List custom and system RBAC roles | [Reference](../API_REFERENCE.md#get-api-v1-roles) |
| `POST` | `/api/v1/roles` | `rbac.roles.create` | Create new custom role | [Reference](../API_REFERENCE.md#post-api-v1-roles) |
| `DELETE` | `/api/v1/roles/:id` | `rbac.roles.delete` | Delete custom role | [Reference](../API_REFERENCE.md#delete-api-v1-roles-id) |
| `GET` | `/api/v1/roles/:id` | `rbac.roles.view` | Get role details | [Reference](../API_REFERENCE.md#get-api-v1-roles-id) |
| `PATCH` | `/api/v1/roles/:id` | `rbac.roles.update` | Update role description & category | [Reference](../API_REFERENCE.md#patch-api-v1-roles-id) |
| `PATCH` | `/api/v1/roles/:id/permissions` | `rbac.roles.update` | Update role permission assignments | [Reference](../API_REFERENCE.md#patch-api-v1-roles-id-permissions) |

### 6. System NOC, Diagnostics & Audit Logs (16 APIs)
| Method | Endpoint | Permissions | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/dashboard/admin/kpis` | `dashboard.view`, `fleet.dashboard.view`, `orgs.view`, `billing.revenue.view`, `advertiser.dashboard.view`, `drivers.dashboard.view`, `technician.dashboard.view`, `government.dashboard.view`, `finance.dashboard.view` | Executive KPI counters & realtime live summary | [Reference](../API_REFERENCE.md#get-api-v1-dashboard-admin-kpis) |
| `GET` | `/api/v1/dashboard/live-summary` | `dashboard.view`, `fleet.dashboard.view`, `orgs.view`, `billing.revenue.view`, `advertiser.dashboard.view`, `drivers.dashboard.view`, `technician.dashboard.view`, `government.dashboard.view`, `finance.dashboard.view` | Executive KPI counters & realtime live summary | [Reference](../API_REFERENCE.md#get-api-v1-dashboard-live-summary) |
| `GET` | `/api/v1/dashboard/superadmin/kpis` | `dashboard.view`, `fleet.dashboard.view`, `orgs.view`, `billing.revenue.view`, `advertiser.dashboard.view`, `drivers.dashboard.view`, `technician.dashboard.view`, `government.dashboard.view`, `finance.dashboard.view` | Executive KPI counters & realtime live summary | [Reference](../API_REFERENCE.md#get-api-v1-dashboard-superadmin-kpis) |
| `POST` | `/api/v1/system/cron/trigger` | `platform.mqtt`, `platform.audit` | Manually trigger scheduled backend background job | [Reference](../API_REFERENCE.md#post-api-v1-system-cron-trigger) |
| `GET` | `/api/v1/system/devices` | `platform.mqtt`, `platform.audit` | NOC global hardware connectivity status | [Reference](../API_REFERENCE.md#get-api-v1-system-devices) |
| `DELETE` | `/api/v1/system/disk-logs` | `platform.mqtt`, `platform.audit` | Read or clear application disk logs | [Reference](../API_REFERENCE.md#delete-api-v1-system-disk-logs) |
| `GET` | `/api/v1/system/disk-logs` | `platform.mqtt`, `platform.audit` | Read or clear application disk logs | [Reference](../API_REFERENCE.md#get-api-v1-system-disk-logs) |
| `GET` | `/api/v1/system/disk-logs/read` | `platform.mqtt`, `platform.audit` | Read or clear application disk logs | [Reference](../API_REFERENCE.md#get-api-v1-system-disk-logs-read) |
| `GET` | `/api/v1/system/health` | `platform.mqtt`, `platform.audit` | System memory, database, Redis & MQTT health probe | [Reference](../API_REFERENCE.md#get-api-v1-system-health) |
| `DELETE` | `/api/v1/system/live-logs` | `platform.mqtt`, `platform.audit` | Real-time stdout/stderr log stream | [Reference](../API_REFERENCE.md#delete-api-v1-system-live-logs) |
| `GET` | `/api/v1/system/live-logs` | `platform.mqtt`, `platform.audit` | Real-time stdout/stderr log stream | [Reference](../API_REFERENCE.md#get-api-v1-system-live-logs) |
| `GET` | `/api/v1/system/server-status` | `platform.mqtt`, `platform.audit` | Server CPU, load average, uptime & process state | [Reference](../API_REFERENCE.md#get-api-v1-system-server-status) |
| `GET` | `/api/v1/activity-logs` | `platform.audit`, `activity.view` | Searchable immutable platform audit trail | [Reference](../API_REFERENCE.md#get-api-v1-activity-logs) |
| `GET` | `/api/v1/activity-logs/:id` | `platform.audit`, `activity.view` | Searchable immutable platform audit trail | [Reference](../API_REFERENCE.md#get-api-v1-activity-logs-id) |
| `GET` | `/api/v1/activity-logs/categories` | `platform.audit`, `activity.view` | Audit log categories filter | [Reference](../API_REFERENCE.md#get-api-v1-activity-logs-categories) |
| `GET` | `/api/v1/activity-logs/filters` | `platform.audit`, `activity.view` | Audit log dynamic filter options | [Reference](../API_REFERENCE.md#get-api-v1-activity-logs-filters) |

---

