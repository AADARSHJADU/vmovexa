# SuperAdmin Sovereign Portal — API Documentation (Root Platform Administration)

> **Role:** `ROLE-SUPER-ADMIN` (Root Sovereign Platform Operator)  
> **Base Path:** `http://localhost:4000/api/v1`  
> **Auth:** All endpoints require `Authorization: Bearer <token>`  
> **Permission Bypass:** SuperAdmin bypasses ALL tenant scoping and RBAC restrictions. Full platform-wide visibility.

---

## 📋 Complete Endpoints Summary (38 APIs)

### 1. Platform Sovereign Dashboard (1 API)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/dashboard/superadmin/kpis` | Platform-wide macro KPIs (total revenue, active orgs, pending approvals, fleet health) |

### 2. Multi-Tenant Organizations (9 APIs)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/organizations` | List all tenant organizations with subscription status, fleet size & filters |
| `GET` | `/organizations/:id` | Get organization master record with profile, KYC docs, and plan limits |
| `POST` | `/organizations` | Directly provision a new tenant organization |
| `PATCH` | `/organizations/:id` | Update organization details or plan tier |
| `DELETE` | `/organizations/:id` | Hard delete / offboard organization |
| `POST` | `/organizations/:id/approve` | Approve pending tenant registration application |
| `POST` | `/organizations/:id/suspend` | Temporarily suspend tenant access due to non-payment or compliance |
| `POST` | `/organizations/:id/activate`| Restore suspended organization to active state |
| `POST` | `/organizations/:id/impersonate` | Issue temporary session token to log in as tenant admin |

### 3. Universal Approvals Hub (4 APIs)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/approvals` | Universal approval queue across all domains (New Tenants, Campaigns, Emergency, Fleets, Drivers) |
| `GET` | `/approvals/counts` | Badge counters of pending approvals by entity type |
| `POST` | `/approvals/:id/approve` | Approve selected request item |
| `POST` | `/approvals/:id/reject` | Reject request item with mandatory reason remarks |

### 4. Platform Users Management (7 APIs)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users` | List all platform users across all tenants with search & role filter |
| `GET` | `/users/:id` | Detailed user profile, linked organization & assigned permissions |
| `POST` | `/users` | Create / invite a platform user |
| `PATCH` | `/users/:id` | Update user details, role, or contact info |
| `DELETE` | `/users/:id` | Terminate user account |
| `PATCH` | `/users/:id/status` | Toggle user active/suspended status |
| `POST` | `/users/:id/resend-invite` | Re-send onboarding invitation email |

### 5. RBAC Roles & Permissions Catalog (6 APIs)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/roles` | List all system and custom roles |
| `GET` | `/roles/:id` | Role details with assigned granular permission list |
| `POST` | `/roles` | Create a custom role |
| `PATCH` | `/roles/:id` | Update role permissions matrix |
| `DELETE` | `/roles/:id` | Delete custom role (system roles protected) |
| `GET` | `/permissions` | Catalog of all 50+ system permission keys grouped by module |

### 6. Invitations Ledger (3 APIs)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/invitations` | List all pending, accepted, and expired staff invitations |
| `POST` | `/invitations` | Dispatch new email invitation |
| `DELETE` | `/invitations/:id` | Revoke invitation token |

### 7. System Health, Telemetry & Audit Logs (8 APIs)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/system/health` | Real-time health check (MySQL, Redis, MQTT broker, Disk, Uptime) |
| `GET` | `/system/metrics` | Server resource usage metrics (CPU, RAM, Event Loop lag) |
| `GET` | `/system/logs` | Real-time winston application error & access logs |
| `GET` | `/system/database` | Database connection pool stats & active query counts |
| `GET` | `/system/redis` | Redis cache hit/miss ratio & memory usage |
| `GET` | `/system/mqtt` | MQTT broker active client connections & packet throughput |
| `GET` | `/activity-logs` | Comprehensive cross-tenant audit trail with search & IP filter |
| `GET` | `/activity-logs/:id` | Single audit trail log detail with before/after state diff |

---

## 🏛️ SECTION 1: Multi-Tenant Approvals & Impersonation

### 1.1 POST `/organizations/:id/approve`
Approve a pending tenant registration application. Automatically provisions tenant database schemas, generates credentials, and sends approval SMS/Email.

#### Request Body
```json
{
  "approved_plan": "ENTERPRISE_FLEET",
  "notes": "Verified company registration MP04-REG-2026. Approved for onboarding."
}
```

#### Success Response `200`
```json
{
  "success": true,
  "message": "Organization approved successfully. Welcome credentials dispatched.",
  "data": {
    "organization_id": "org_01HX98...",
    "status": "active",
    "approved_at": "2026-10-10T06:00:00.000Z"
  }
}
```

---

### 1.2 POST `/organizations/:id/impersonate`
Generate temporary impersonation session token to debug issues from tenant's viewpoint.

#### Success Response `200`
```json
{
  "success": true,
  "message": "Impersonation session established for Indore City Transport Ltd.",
  "data": {
    "impersonation_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "original_admin_id": "usr_01HX_SUPER...",
    "impersonated_tenant_id": "org_01HX...",
    "expires_in_minutes": 60
  }
}
```

---

## ⚖️ SECTION 2: Universal Approvals Hub

### 2.1 GET `/approvals`
Unified approval queue across all domains (New Tenants, Campaign Ads, Driver Onboarding, Vehicle Approvals).

#### Query Params
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | `1` | Page number |
| `limit` | number | `20` | Page size |
| `status` | string | `pending` | `pending`, `approved`, `rejected` |
| `entity_type` | string | — | `organization`, `campaign`, `vehicle`, `driver`, `emergency` |

#### Success Response `200`
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": "appr_01HX99...",
        "entity_type": "campaign",
        "entity_id": "cmp_01HX...",
        "entity_title": "Diwali Mega Sale 2026 - Sharma Electronics",
        "requester_name": "Sharma Electronics",
        "status": "pending",
        "created_at": "2026-10-10T06:00:00.000Z"
      }
    ],
    "count": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### 2.2 POST `/approvals/:id/approve`
Approve pending request.

#### Request Body
```json
{
  "notes": "All compliance checks passed."
}
```

### 2.3 POST `/approvals/:id/reject`
Reject pending request with mandatory remarks.

#### Request Body
```json
{
  "rejection_reason": "Creative banner aspect ratio does not match 16:9 screen standard."
}
```

---

## 👥 SECTION 3: Platform Users & RBAC

### 3.1 POST `/users`
Create / invite a new platform operator or staff.

#### Request Body
```json
{
  "name": "Vikram Sethi",
  "email": "vikram.sethi@vmovexa.com",
  "phone": "+919827011445",
  "role": "ROLE-CENTRAL-TECH",
  "organization_id": null
}
```

### 3.2 PATCH `/roles/:id`
Update permissions matrix for a role.

#### Request Body
```json
{
  "permissions": [
    "fleet.vehicles.view",
    "fleet.vehicles.create",
    "fleet.drivers.view"
  ]
}
```

---

## 💻 Standard Frontend Service Implementation

```javascript
// src/api/services/superadmin.service.js
import apiClient from '../client';

export const superadminService = {
  // Sovereign KPIs & Health
  getPlatformKpis: () => apiClient.get('/dashboard/superadmin/kpis'),
  getSystemHealth: () => apiClient.get('/system/health'),
  getSystemMetrics: () => apiClient.get('/system/metrics'),
  getActivityLogs: (params) => apiClient.get('/activity-logs', { params }),

  // Organizations
  getOrganizations: (params) => apiClient.get('/organizations', { params }),
  getOrgById: (id) => apiClient.get(`/organizations/${id}`),
  approveOrg: (id, data) => apiClient.post(`/organizations/${id}/approve`, data),
  suspendOrg: (id, data) => apiClient.post(`/organizations/${id}/suspend`, data),
  activateOrg: (id) => apiClient.post(`/organizations/${id}/activate`),
  impersonateOrg: (id) => apiClient.post(`/organizations/${id}/impersonate`),

  // Universal Approvals Hub
  getApprovals: (params) => apiClient.get('/approvals', { params }),
  getApprovalCounts: () => apiClient.get('/approvals/counts'),
  approveItem: (id, data) => apiClient.post(`/approvals/${id}/approve`, data),
  rejectItem: (id, data) => apiClient.post(`/approvals/${id}/reject`, data),

  // Users & RBAC
  getUsers: (params) => apiClient.get('/users', { params }),
  getRoles: () => apiClient.get('/roles'),
  getPermissions: () => apiClient.get('/permissions'),
  updateRole: (id, data) => apiClient.patch(`/roles/${id}`, data),
};
```

---

## 🔗 Frontend Architecture & File Reference
- **Services:** `src/api/services/superadmin/` (`superadmin.service.js`, `organization.service.js`)
- **Thunks:** `src/store/thunks/superadmin/` (`superadmin.thunks.js`, `organization.thunks.js`)
- **Slices:** `src/store/slices/superadmin/` (`superadminSlice.js`, `organizationSlice.js`)
- **Custom Hooks:** `src/hooks/superadmin/` (`useSuperadmin.js`, `useOrganization.js`)
- **Pages:** `src/pages/superadmin/` (`SuperadminDashboard.jsx`, `TenantsListPage.jsx`, `SuperRolesPermissionsPage.jsx`)
- **Pagination Component:** `src/components/ui/Pagination.jsx`
- **Integration Blueprint:** See [FRONTEND_INTEGRATION_GUIDE.md](file:///e:/vmovexa/application_api_doc/FRONTEND_INTEGRATION_GUIDE.md)

