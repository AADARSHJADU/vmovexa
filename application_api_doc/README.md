# VMOVEXA ONE — Master Role-Based API & Frontend Integration Documentation

Welcome to the **VMOVEXA ONE** Master Technical Documentation package.  
This package is structured strictly by **user roles & portals** and includes a complete **Frontend UI Integration Blueprint** so that frontend engineers and AI assistants can seamlessly build and connect every portal without ambiguity.

---

## 📘 Quick Navigation

1. 🚀 **[Frontend UI Integration Guide (Master Blueprint)](file:///e:/vmovexa/application_api_doc/FRONTEND_INTEGRATION_GUIDE.md)**  
   *Step-by-step code tutorial: Services → Redux Thunks → Slices → Hooks → React UI Tables with `<Pagination />`, Search Debounce, Modals & Toast alerts.*

2. 📊 **[Full-Stack Gap Analysis Report](file:///e:/vmovexa/application_api_doc/GAP_ANALYSIS_REPORT.md)**  
   *Audit results: Backend vs Frontend endpoints, resolved missing routes in `endpoints.js`, payload wiring fixes & status lifecycle diagrams.*

3. 🏛️ **Role-Based Portals & API Specifications:**
   - 🔑 **[auth.md](file:///e:/vmovexa/application_api_doc/roles/auth.md)** — **35 APIs** (Identity, OTP, Org Self-Registration, Social OAuth Google/Zoho/Apple, Sessions)
   - 🚌 **[fleet-manager.md](file:///e:/vmovexa/application_api_doc/roles/fleet-manager.md)** — **65 APIs** (Depots, Fleets, Vehicles, Drivers, Routes, Trips, Telemetry, Docs)
   - 👨‍✈️ **[driver.md](file:///e:/vmovexa/application_api_doc/roles/driver.md)** — **11 APIs** (Self-service Driver Portal, Schedules, Routes, Duty Status, Incidents)
   - 📢 **[advertiser.md](file:///e:/vmovexa/application_api_doc/roles/advertiser.md)** — **38 APIs** (Campaigns, Approvals, Public Customer Checkout, QR Passenger Scans)
   - 💰 **[finance.md](file:///e:/vmovexa/application_api_doc/roles/finance.md)** — **49 APIs** (Invoices, Ledger, Campaign Settlements, Bank Auto-Match, GST GSTR-1, Gateways)
   - 🔧 **[technician.md](file:///e:/vmovexa/application_api_doc/roles/technician.md)** — **36 APIs** (Work Orders Queue, Smart Edge Remote Reboot/Config, Displays, GPS Pairing)
   - 🏛️ **[government.md](file:///e:/vmovexa/application_api_doc/roles/government.md)** — **13 APIs** (Transit Footprint Analytics, Directory, Emergency SOS Broadcast Overrides)
   - 🔔 **[notifications-websocket.md](file:///e:/vmovexa/application_api_doc/roles/notifications-websocket.md)** — **23 REST + WS** (In-app Alerts, Delivery Logs & Retry, FCM Push, Socket.IO Live Telemetry)
   - 👑 **[superadmin.md](file:///e:/vmovexa/application_api_doc/roles/superadmin.md)** — **38 APIs** (Sovereign KPIs, Multi-Tenant Approvals & Impersonation, RBAC, Health)
   - 📁 **[common-services.md](file:///e:/vmovexa/application_api_doc/roles/common-services.md)** — **20 APIs** (Multipart Media Uploads, Helpdesk Support Tickets, Geocoding & Directions, i18n)

> **Total Endpoints Documented:** **328 Comprehensive APIs & WebSocket Protocols**

---

## ⚡ The Frontend Architecture Standard (Golden Rules)

All frontend components strictly adhere to the following 5-layer separation:

```
Component
  └── use[Domain]() hook                  ← ONLY hook is called by UI
        ├── useAppSelector(select[Domain]) ← Reads state reactively
        └── dispatch(fetch[Domain]Thunk()) ← Dispatches action
                  │
                  ▼
      store/thunks/[domain].thunks.js     ← Handles async logic & normalizeError
                  │
                  ▼
      api/services/[domain].service.js    ← Calls apiClient with endpoint & params
                  │
                  ▼
      api/client.js (axios instance)      ← Injects Bearer token & handles 401 refresh
                  │
                  ▼
      Backend Express API (`/api/v1/...`) ← Processes request & queries MySQL
```

### 🚨 4 Golden Rules:
1. **Component never calls Axios directly:** Components only consume custom hooks (e.g., `useFleetVehicle()`, `useCampaign()`).
2. **Hook wraps Redux:** State reads use `useAppSelector` and mutations use `useAppDispatch(thunk).unwrap()`.
3. **Thunk delegates to Service:** Thunks handle async operations and format errors via `rejectWithValue(normalizeError(err))`.
4. **Service calls `apiClient`:** Direct `fetch` or custom Axios instances are forbidden. All HTTP goes through `src/api/client.js`.

---

## 📑 Global Pagination & Query Standard

Every entity list, table, or grid must implement pagination using the global reusable component: `src/components/ui/Pagination.jsx`.

```jsx
<Pagination
  currentPage={currentPage}
  totalPages={pagination?.totalPages || 1}
  totalItems={pagination?.total || 0}
  pageSize={pageSize}
  pageSizeOptions={[10, 20, 50, 100]}
  onPageChange={setCurrentPage}
  onPageSizeChange={(newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  }}
/>
```

Backend expects query parameters:
```http
GET /api/v1/<entity>?page=1&limit=20&search=keyword&status=active&sortBy=created_at&sortOrder=DESC
```

---

## 🔔 Global Notification System (`react-hot-toast`)

Never write inline status alert boxes. Use `react-hot-toast` (already mounted in `App.jsx`):

```javascript
import toast from 'react-hot-toast';

toast.success('Record created successfully!');
toast.error(err.message || 'Operation failed');

// Best Pattern for Async Actions:
toast.promise(
  saveOperation(data),
  {
    loading: 'Processing request...',
    success: 'Saved successfully!',
    error: (err) => err.message || 'Error occurred.',
  }
);
```

---

## 🔒 Unified Response Envelope

Every endpoint in the system strictly returns:

### Success (`200` / `201`)
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error (`400` / `401` / `403` / `404` / `500`)
```json
{
  "success": false,
  "message": "Human readable error description",
  "error": "ERROR_CODE",
  "errors": [
    { "field": "field_name", "message": "Field validation failure" }
  ]
}
```
Client errors are normalized by `src/utils/apiResponse.js` into `{ code, message, status, details }`.
