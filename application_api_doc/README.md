# VMOVEXA ONE — Master Role-Based API & Frontend Integration Documentation

Welcome to the **VMOVEXA ONE** Master Technical Documentation package.  
This package is structured strictly by **user roles & portals** and includes a complete **Frontend UI Integration Blueprint** so that frontend engineers and AI assistants can seamlessly build, connect, and maintain every portal without ambiguity.

---

## 📘 Quick Navigation

1. 🚀 **[Frontend UI Integration Guide (Master Blueprint)](./FRONTEND_INTEGRATION_GUIDE.md)**  
   *Step-by-step code tutorial: Services → Redux Thunks → Slices → Hooks → React UI Tables with `<Pagination />`, Breadcrumbs, Responsive Headers, Dark Mode, Modals & Toast alerts.*

2. 📊 **[Full-Stack Gap Analysis Report](./GAP_ANALYSIS_REPORT.md)**  
   *Audit results: Backend vs Frontend endpoints, resolved missing routes in `endpoints.js`, Vehicle Slots collision engine, payload wiring fixes & status lifecycle diagrams.*

3. 🏛️ **Role-Based Portals & API Specifications:**
   - 🔑 **[auth.md](./roles/auth.md)** — **35 APIs** (Identity, OTP, Org Self-Registration, Social OAuth Google/Zoho/Apple, Sessions)
   - 🚌 **[fleet-manager.md](./roles/fleet-manager.md)** — **74 APIs** (Depots, Fleets, Vehicles, Drivers, Routes, Trips, Telemetry, Docs, **Vehicle Slots & Timetables Grid**, Quotas)
   - 👨‍✈️ **[driver.md](./roles/driver.md)** — **15 APIs** (Self-service Driver Portal, Schedules, Routes, Duty Status, Incidents, Route Trip Start/End)
   - 📢 **[advertiser.md](./roles/advertiser.md)** — **40 APIs** (Campaigns, Approvals, Public Customer Checkout, QR Passenger Scans, Manual Ad Broadcast Start/Pause/Stop, Offline Payments)
   - 💰 **[finance.md](./roles/finance.md)** — **49 APIs** (Invoices, Ledger, Campaign Settlements, Bank Auto-Match, GST GSTR-1, Gateways)
   - 🔧 **[technician.md](./roles/technician.md)** — **42 APIs** (Work Orders Queue, Technician Stats & Rating, Smart Edge Remote Reboot/Config/Packages, Displays, GPS Pairing)
   - 🏛️ **[government.md](./roles/government.md)** — **17 APIs** (Transit Footprint Analytics, Directory & Metadata Taxonomy, Emergency SOS Broadcast Overrides)
   - 🔔 **[notifications-websocket.md](./roles/notifications-websocket.md)** — **23 REST + WS** (In-app Alerts, Delivery Logs & Retry, FCM Push, Socket.IO Live Telemetry)
   - 👑 **[superadmin.md](./roles/superadmin.md)** — **44 APIs** (Sovereign KPIs, Multi-Tenant Approvals & Impersonation, RBAC, Health, System Logs, Activity Logs)
   - 📁 **[common-services.md](./roles/common-services.md)** — **23 APIs** (Multipart Media Uploads, Helpdesk Support Tickets & Threads, Dynamic Help/FAQs, Geocoding & Directions, i18n)

> **Total Endpoints Documented:** **362 Comprehensive APIs & WebSocket Protocols**

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
1. **Component never calls Axios directly:** Components only consume custom hooks (e.g., `useFleetVehicle()`, `useCampaign()`, `useVehicleSlot()`).
2. **Hook wraps Redux:** State reads use `useAppSelector` and mutations use `useAppDispatch(thunk).unwrap()`.
3. **Thunk delegates to Service:** Thunks handle async operations and format errors via `rejectWithValue(normalizeError(err))`.
4. **Service calls `apiClient`:** Direct `fetch` or custom Axios instances are forbidden. All HTTP goes through `src/api/client.js`.

---

## 🧭 Subpage Navigation & UI Design Standards

1. **Breadcrumbs:** Every subpage must include standard `<Breadcrumb items={[...]} className="mb-2" />`.
   - Root Portal Landing Dashboards (e.g. `/admin/dashboard`, `/fleet-manager/dashboard`) do **NOT** take breadcrumbs.
   - All nested subpages (e.g. `/admin/slots`, `/fleet-manager/fleets`, `/admin/users/activity`) require breadcrumb hierarchy.
2. **Icons:** Strict usage of SVG `FleetIcons` (`Bus`, `Plus`, `Search`, `Check`, `Key`, `Speed`, `Pin`, `Profile`, `Trash`, `Clock`, `ArrowLeft`). Unicode emojis are prohibited.
3. **Mobile-Responsive Headers:** Header container: `flex flex-col sm:flex-row sm:items-center justify-between gap-4`. Buttons and inputs: `w-full sm:w-auto`.
4. **Dark Mode Tokens:** `dark:bg-zinc-900`, `dark:bg-zinc-800`, `dark:border-zinc-800`, `dark:text-white`, `dark:text-zinc-400`.

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
