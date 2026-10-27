# Government Agency Portal — API Documentation (Public Transit Authority, PSAs & SOS Alerts)

> **Role:** `ROLE-GOVT-AGENCY` (State Transport Authority / Municipal Corporation)  
> **Base Path:** `http://localhost:4000/api/v1`  
> **Auth:** All endpoints require `Authorization: Bearer <token>`  
> **Scope:** Public service announcements (PSAs), transit compliance monitoring, and high-priority Emergency SOS screen broadcasts.

---

## 📋 Complete Endpoints Summary (17 APIs)

### 1. Agency Reach & Transit Analytics (1 API)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/government/analytics` | Public transit footprint, total citizens reached, PSA impressions, and active city routes |

### 2. Government Agency Directory & Meta (11 APIs)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/government` | List registered government agencies & municipal departments |
| `GET` | `/government/:id` | Detailed agency profile (department, nodal officer, jurisdiction) |
| `POST` | `/government` | Register a new government agency department |
| `PATCH` | `/government/:id` | Update department contact info or nodal officer |
| `PUT` | `/government/:id` | Full agency update |
| `PATCH` | `/government/:id/status` | Activate/Deactivate agency account (`active`, `inactive`) |
| `DELETE` | `/government/:id` | Remove agency record |
| `GET` | `/government/meta/options` | Combined directory dropdown options (categories, jurisdictions, clearances) |
| `GET` | `/government/department-categories` | State & municipal department taxonomy |
| `GET` | `/government/jurisdictions` | Authorized regional jurisdiction boundaries |
| `GET` | `/government/clearance-levels` | Executive security clearance levels |

### 3. Emergency SOS Broadcasts (Real-Time Transit Overrides) (5 APIs)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/emergency-broadcasts` | List past and active emergency SOS broadcasts with status |
| `POST` | `/emergency-broadcasts` | Create & issue instant emergency broadcast (overrides all commercial ads) |
| `POST` | `/emergency-broadcasts/:id/approve` | SuperAdmin / Authority approve emergency broadcast |
| `POST` | `/emergency-broadcasts/:id/reject` | Reject emergency broadcast request |
| `POST` | `/emergency-broadcasts/:id/revoke` | **Revoke Broadcast:** Immediately stops SOS alert and resumes normal ads |

---

## 🚨 EMERGENCY SOS BROADCAST RULES

> [!IMPORTANT]
> 1. **Highest Priority:** When an Emergency SOS Broadcast is active, the onboard edge screen software pauses ALL commercial ad reels and displays the full-screen emergency alert immediately.
> 2. **Instant Revocation:** Clicking **"Revoke"** (`POST /:id/revoke`) issues an immediate MQTT broker command to all transit buses to terminate the alert display and return to the commercial playlist.

```
[Agency Creates Emergency SOS] 
       ↓
[SuperAdmin / Designated Authority Approves] 
       ↓
[MQTT Broadcast Topic: broadcast/emergency/all] 
       ↓
[All Transit Screens Display Alert Immediately] 
       ↓
[Agency / SuperAdmin clicks Revoke] → Normal Ads Resume
```

---

## 🏛️ SECTION 1: Agency Analytics & Public Reach

### 1.1 GET `/government/analytics`
Fetch government agency transit reach and public announcement statistics.

#### Success Response `200`
```json
{
  "success": true,
  "data": {
    "total_agencies_active": 6,
    "active_psa_campaigns": 4,
    "total_citizen_impressions": 3840000,
    "active_routes_covered": 18,
    "total_transit_buses": 340,
    "emergency_broadcasts_active": 0,
    "cities": ["Indore", "Bhopal", "Ujjain"]
  }
}
```

---

## 📢 SECTION 2: Emergency SOS Broadcast API

### 2.1 POST `/emergency-broadcasts`
Create a high-priority emergency alert.

#### Request Body
```json
{
  "title": "FLASH FLOOD WARNING - AVOID BADA GANPATI UNDERPASS",
  "message": "Heavy rainfall alert issued by IMD. Transit routes diverting from low-lying underpasses. Follow traffic police guidelines.",
  "severity": "critical", // "critical", "warning", "info"
  "target_city": "Indore",
  "target_routes": ["all"], // or array of route IDs
  "audio_alert_enabled": true,
  "display_duration_minutes": 120,
  "banner_image_url": "http://localhost:4000/uploads/emergency/flood-warning.png"
}
```

#### Success Response `201`
```json
{
  "success": true,
  "message": "Emergency broadcast created. Awaiting supervisor approval.",
  "data": {
    "id": "emg_01HX...",
    "title": "FLASH FLOOD WARNING - AVOID BADA GANPATI UNDERPASS",
    "severity": "critical",
    "status": "pending_approval",
    "created_at": "2026-10-10T07:00:00.000Z"
  }
}
```

---

### 2.2 POST `/emergency-broadcasts/:id/revoke`
Immediately stop active emergency broadcast across all vehicle screens.

#### Request Body
```json
{
  "reason": "Weather warning cleared by district administration."
}
```

#### Success Response `200`
```json
{
  "success": true,
  "message": "Emergency broadcast revoked. Screens resumed commercial playlist.",
  "data": {
    "id": "emg_01HX...",
    "status": "revoked",
    "revoked_at": "2026-10-10T08:30:00.000Z"
  }
}
```

---

## 🏛️ SECTION 3: Government Agency Directory & Provisioning

### 3.1 GET `/government`
Fetch paginated list of authorized government agencies, municipal corporations, and transit authorities with real-time stats.

#### Query Parameters
- `page` (integer, default `1`)
- `limit` (integer, default `10` or `20`)
- `search` (string, searches across agency name, nodal officer, code, department, email, phone, city, state)
- `status` (string, `'All' | 'active' | 'suspended' | 'pending_approval'`)

#### Success Response `200`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "GOV-M3K2-91B",
      "name": "Indore Municipal Corporation - Urban Transit Cell",
      "agency_name": "Indore Municipal Corporation - Urban Transit Cell",
      "department": "Urban Transit & Traffic Safety",
      "contact_name": "Rajesh Verma",
      "email": "transport@imcindore.mp.gov.in",
      "phone": "+919876543210",
      "office_address": "Palika Bhawan, Nagar Nigam Indore",
      "city": "Indore",
      "state": "Madhya Pradesh",
      "jurisdiction": "Indore Urban & BRTS Transit Corridor",
      "authorized_city": "Indore",
      "clearance_level": "Level 3 Direct Override",
      "status": "active",
      "user_id": 42,
      "user": {
        "id": 42,
        "name": "Rajesh Verma",
        "email": "transport@imcindore.mp.gov.in",
        "phone": "+919876543210",
        "enrollment_no": "GOV-2026-0042",
        "status": "active",
        "avatar_url": "http://localhost:4000/uploads/emblems/imc-seal.png"
      },
      "avatar_url": "http://localhost:4000/uploads/emblems/imc-seal.png",
      "logo_url": "http://localhost:4000/uploads/emblems/imc-seal.png",
      "emblem_url": "http://localhost:4000/uploads/emblems/imc-seal.png"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 6,
    "totalPages": 1,
    "stats": {
      "total": 6,
      "active": 5,
      "suspended": 1,
      "pending": 0,
      "emergency": 2
    }
  }
}
```

---

### 3.2 GET `/government/:id`
Fetch single government agency profile, including linked nodal officer credentials, emergency broadcast history, and verified authorization documents.

#### Success Response `200`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "GOV-M3K2-91B",
    "name": "Indore Municipal Corporation - Urban Transit Cell",
    "agency_name": "Indore Municipal Corporation - Urban Transit Cell",
    "department": "Urban Transit & Traffic Safety",
    "contact_name": "Rajesh Verma",
    "email": "transport@imcindore.mp.gov.in",
    "phone": "+919876543210",
    "office_address": "Palika Bhawan, Nagar Nigam Indore",
    "city": "Indore",
    "state": "Madhya Pradesh",
    "jurisdiction": "Indore Urban & BRTS Transit Corridor",
    "authorized_city": "Indore",
    "clearance_level": "Level 3 Direct Override",
    "status": "active",
    "user": {
      "id": 42,
      "name": "Rajesh Verma",
      "email": "transport@imcindore.mp.gov.in",
      "enrollment_no": "GOV-2026-0042",
      "status": "active",
      "avatar_url": "http://localhost:4000/uploads/emblems/imc-seal.png"
    },
    "documents": [
      {
        "id": 108,
        "purpose": "Official State Gazetted Authorization",
        "url": "http://localhost:4000/uploads/gov-docs/gazette-authorization.pdf",
        "mime": "application/pdf",
        "size": 1540000,
        "status": "available"
      }
    ]
  }
}
```

---

### 3.3 POST `/government`
Authorize and provision a new Government Agency & Nodal Officer account (Requires `users.create` permission or SuperAdmin).

#### Request Body
```json
{
  "agencyName": "Bhopal Smart City Development Corporation",
  "name": "Dr. Sunita Sharma", // Nodal Officer Name
  "email": "smartcity@bhopal.gov.in",
  "phone": "+919826012345",
  "password": "Gov@SecurePass2026",
  "department": "Intelligent Transit Management",
  "clearanceLevel": "Level 3 Direct Override",
  "officeAddress": "Smart City Office, Berkheda, TT Nagar",
  "city": "Bhopal",
  "state": "Madhya Pradesh",
  "pincode": "462003",
  "jurisdiction": "Bhopal Metro & Smart Bus Corridor",
  "authorizedCity": "Bhopal",
  "avatar_url": "http://localhost:4000/uploads/emblems/bhopal-seal.png",
  "documents": [
    {
      "category": "Official Nodal Authorization Letter",
      "url": "http://localhost:4000/uploads/gov-docs/nodal-letter.pdf",
      "size": "1.2MB",
      "mime": "application/pdf"
    }
  ]
}
```

#### Success Response `201`
```json
{
  "success": true,
  "message": "Government agency authorized successfully.",
  "data": {
    "id": 7,
    "code": "GOV-M4T9-12A",
    "name": "Bhopal Smart City Development Corporation",
    "department": "Intelligent Transit Management",
    "contact_name": "Dr. Sunita Sharma",
    "email": "smartcity@bhopal.gov.in",
    "phone": "+919826012345",
    "status": "active"
  }
}
```

---

### 3.4 PATCH `/government/:id/status`
Suspend or re-activate a Government Agency account. Suspending immediately revokes active JWT bearer tokens.

#### Request Body
```json
{
  "status": "suspended" // "active" | "suspended" | "inactive"
}
```

#### Success Response `200`
```json
{
  "success": true,
  "message": "Government agency status updated successfully.",
  "data": {
    "id": 7,
    "status": "suspended"
  }
}
```

---

## 💻 Standard Frontend Service Implementation

```javascript
// src/api/services/government.service.js
import apiClient from '../client';

export const governmentService = {
  // Reach & Directory
  getAnalytics: () => apiClient.get('/government/analytics'),
  getAgencies: (params) => apiClient.get('/government', { params }),
  getAgencyById: (id) => apiClient.get(`/government/${id}`),
  createAgency: (data) => apiClient.post('/government', data),
  updateAgencyStatus: (id, status) => apiClient.patch(`/government/${id}/status`, { status }),

  // Emergency SOS Broadcasts
  getEmergencyBroadcasts: (params) => apiClient.get('/emergency-broadcasts', { params }),
  createEmergencyBroadcast: (data) => apiClient.post('/emergency-broadcasts', data),
  approveEmergencyBroadcast: (id) => apiClient.post(`/emergency-broadcasts/${id}/approve`),
  rejectEmergencyBroadcast: (id) => apiClient.post(`/emergency-broadcasts/${id}/reject`),
  revokeEmergencyBroadcast: (id, data) => apiClient.post(`/emergency-broadcasts/${id}/revoke`, data),
};
```

---

## 🔗 Frontend Architecture & File Reference
- **Services:** `src/api/services/government/` (`government.service.js`)
- **Thunks:** `src/store/thunks/government/` (`government.thunks.js`)
- **Slices:** `src/store/slices/government/` (`governmentSlice.js`)
- **Custom Hooks:** `src/hooks/government/` (`useGovernment.js`)
- **Pages:** `src/pages/government/` (`GovDashboard.jsx`, `GovEmergencyBroadcastPage.jsx`, `GovAgencyDirectoryPage.jsx`)
- **Pagination Component:** `src/components/ui/Pagination.jsx`
- **Integration Blueprint:** See [FRONTEND_INTEGRATION_GUIDE.md](../FRONTEND_INTEGRATION_GUIDE.md)

