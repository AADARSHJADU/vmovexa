# Driver Portal — API Documentation (Self-Service Reference)

> **Role:** `ROLE-DRIVER`  
> **Base Path:** `https://api.vmovexa.com/api/v1/me/driver` (Local: `http://localhost:4000/api/v1/me/driver`)  
> **Total Endpoints:** 13 APIs (All 100% verified against backend route manifests)  
> **Updated:** 2026-10-31  
> **Authentication:** All endpoints require `Authorization: Bearer <access_token>` with driver permissions  
> **Tenant Isolation:** Scoped automatically to driver's assigned organization

See [app developer guide](../APP_DEVELOPER_GUIDE.md) and [complete request reference](../API_REFERENCE.md). For realtime events see [REALTIME_AND_GPS.md](../REALTIME_AND_GPS.md).

---

## 📋 Complete Endpoints Summary (13 APIs)

| Method | Endpoint | Permissions | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/me/driver/active-route` | `drivers.portal.view` | Get currently active route path, waypoints & stops | [Reference](../API_REFERENCE.md#get-api-v1-me-driver-active-route) |
| `GET` | `/api/v1/me/driver/documents` | `drivers.portal.view` | List uploaded driver KYC documents | [Reference](../API_REFERENCE.md#get-api-v1-me-driver-documents) |
| `POST` | `/api/v1/me/driver/documents` | `drivers.documents.manage` | Upload driver compliance / license document | [Reference](../API_REFERENCE.md#post-api-v1-me-driver-documents) |
| `DELETE` | `/api/v1/me/driver/documents/:id` | `drivers.documents.manage` | Delete uploaded driver document | [Reference](../API_REFERENCE.md#delete-api-v1-me-driver-documents-id) |
| `PATCH` | `/api/v1/me/driver/duty-status` | `drivers.duty.manage` | Toggle duty status (on_duty, off_duty, on_break) | [Reference](../API_REFERENCE.md#patch-api-v1-me-driver-duty-status) |
| `GET` | `/api/v1/me/driver/incidents` | `drivers.portal.view` | List incidents logged by this driver | [Reference](../API_REFERENCE.md#get-api-v1-me-driver-incidents) |
| `POST` | `/api/v1/me/driver/incidents` | `drivers.incidents.report` | Report an urgent SOS transit incident | [Reference](../API_REFERENCE.md#post-api-v1-me-driver-incidents) |
| `GET` | `/api/v1/me/driver/incidents/:id` | `drivers.portal.view` | View detailed incident report by ID | [Reference](../API_REFERENCE.md#get-api-v1-me-driver-incidents-id) |
| `GET` | `/api/v1/me/driver/profile` | `drivers.portal.view` | Get driver profile, license info, rating & assigned bus | [Reference](../API_REFERENCE.md#get-api-v1-me-driver-profile) |
| `GET` | `/api/v1/me/driver/schedule` | `drivers.portal.view` | View driver assigned vehicle slots & shift schedules | [Reference](../API_REFERENCE.md#get-api-v1-me-driver-schedule) |
| `POST` | `/api/v1/me/driver/trip/end` | `drivers.duty.manage` | Complete transit trip with final odometer / covered km | [Reference](../API_REFERENCE.md#post-api-v1-me-driver-trip-end) |
| `POST` | `/api/v1/me/driver/trip/start` | `drivers.duty.manage` | Start transit trip for assigned slot | [Reference](../API_REFERENCE.md#post-api-v1-me-driver-trip-start) |
| `GET` | `/api/v1/me/driver/trips` | `drivers.portal.view` | List driver historical trips & performance | [Reference](../API_REFERENCE.md#get-api-v1-me-driver-trips) |

---

## 🚍 Key Driver Workflows

### 1. Shift & Trip Lifecycle
1. **Check Schedule:** `GET /api/v1/me/driver/schedule` to find assigned slots for today.
2. **Go On-Duty:** `PATCH /api/v1/me/driver/duty-status` with `{"status": "on_duty"}`.
3. **Start Trip:** `POST /api/v1/me/driver/trip/start` passing `{ "slotId": 12 }`. [Contract](../CONTROLLER_CONTRACTS.md#post-api-v1-me-driver-trip-start)
4. **End Trip:** `POST /api/v1/me/driver/trip/end` passing `{ "tripId": 105, "slotId": 12, "covered_km": 18.5 }`. [Contract](../CONTROLLER_CONTRACTS.md#post-api-v1-me-driver-trip-end)

### 2. Emergency & Incident Reporting
- `POST /api/v1/me/driver/incidents`: Validates full incident telemetry payload including coordinates, severity, casualties, audioNotes, and photo URLs. [Contract](../CONTROLLER_CONTRACTS.md#post-api-v1-me-driver-incidents)

