# superadmin API index

Updated: 2026-10-28. 53 route entries. This grouping is navigation only: access is determined by actual permissions and tenant/controller rules, not by this filename. Shared routes can be used by multiple roles.

See [app developer guide](../APP_DEVELOPER_GUIDE.md) and [complete request reference](../API_REFERENCE.md). For realtime events see [REALTIME_AND_GPS.md](../REALTIME_AND_GPS.md).

| Method | Path | Authentication | Request / access details |
|---|---|---|---|
| GET | `/api/v1/activity-logs` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-activity-logs) |
| GET | `/api/v1/activity-logs/:id` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-activity-logs-id) |
| GET | `/api/v1/activity-logs/categories` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-activity-logs-categories) |
| GET | `/api/v1/activity-logs/filters` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-activity-logs-filters) |
| POST | `/api/v1/admin/impersonate/:userId` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-admin-impersonate-userid) |
| POST | `/api/v1/admin/impersonate/advertiser/:advertiserId` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-admin-impersonate-advertiser-advertiserid) |
| POST | `/api/v1/admin/impersonate/stop` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-admin-impersonate-stop) |
| POST | `/api/v1/admin/impersonate/tenant/:organizationId` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-admin-impersonate-tenant-organizationid) |
| GET | `/api/v1/approvals` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-approvals) |
| GET | `/api/v1/approvals/:id` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-approvals-id) |
| POST | `/api/v1/approvals/:id/approve` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-approvals-id-approve) |
| POST | `/api/v1/approvals/:id/reject` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-approvals-id-reject) |
| GET | `/api/v1/dashboard/admin/kpis` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-dashboard-admin-kpis) |
| GET | `/api/v1/dashboard/live-summary` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-dashboard-live-summary) |
| GET | `/api/v1/dashboard/superadmin/kpis` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-dashboard-superadmin-kpis) |
| GET | `/api/v1/organizations` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-organizations) |
| POST | `/api/v1/organizations` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-organizations) |
| GET | `/api/v1/organizations/:id` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-organizations-id) |
| PATCH | `/api/v1/organizations/:id` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-organizations-id) |
| POST | `/api/v1/organizations/:id/approve` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-organizations-id-approve) |
| GET | `/api/v1/organizations/:id/features` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-organizations-id-features) |
| PATCH | `/api/v1/organizations/:id/features` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-organizations-id-features) |
| POST | `/api/v1/organizations/:id/reject` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-organizations-id-reject) |
| POST | `/api/v1/organizations/:id/reset-admin-password` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-organizations-id-reset-admin-password) |
| PATCH | `/api/v1/organizations/:id/status` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-organizations-id-status) |
| GET | `/api/v1/permissions` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-permissions) |
| GET | `/api/v1/permissions/modules` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-permissions-modules) |
| GET | `/api/v1/roles` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-roles) |
| POST | `/api/v1/roles` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-roles) |
| DELETE | `/api/v1/roles/:id` | Bearer | [Reference](../API_REFERENCE.md#delete-api-v1-roles-id) |
| GET | `/api/v1/roles/:id` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-roles-id) |
| PATCH | `/api/v1/roles/:id` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-roles-id) |
| PATCH | `/api/v1/roles/:id/permissions` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-roles-id-permissions) |
| POST | `/api/v1/system/cron/trigger` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-system-cron-trigger) |
| GET | `/api/v1/system/devices` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-system-devices) |
| DELETE | `/api/v1/system/disk-logs` | Bearer | [Reference](../API_REFERENCE.md#delete-api-v1-system-disk-logs) |
| GET | `/api/v1/system/disk-logs` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-system-disk-logs) |
| GET | `/api/v1/system/disk-logs/read` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-system-disk-logs-read) |
| GET | `/api/v1/system/health` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-system-health) |
| DELETE | `/api/v1/system/live-logs` | Bearer | [Reference](../API_REFERENCE.md#delete-api-v1-system-live-logs) |
| GET | `/api/v1/system/live-logs` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-system-live-logs) |
| GET | `/api/v1/system/server-status` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-system-server-status) |
| GET | `/api/v1/users` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-users) |
| POST | `/api/v1/users` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-users) |
| DELETE | `/api/v1/users/:id` | Bearer | [Reference](../API_REFERENCE.md#delete-api-v1-users-id) |
| GET | `/api/v1/users/:id` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-users-id) |
| PATCH | `/api/v1/users/:id` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-users-id) |
| GET | `/api/v1/users/:id/activity` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-users-id-activity) |
| GET | `/api/v1/users/:id/permissions` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-users-id-permissions) |
| PUT | `/api/v1/users/:id/permissions` | Bearer | [Reference](../API_REFERENCE.md#put-api-v1-users-id-permissions) |
| PATCH | `/api/v1/users/:id/status` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-users-id-status) |
| GET | `/api/v1/users/check-availability` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-users-check-availability) |
| GET | `/api/v1/users/quotas/fleet-operators` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-users-quotas-fleet-operators) |
