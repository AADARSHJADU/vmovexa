# Fleet Manager Portal — API Documentation (Complete Fleet Operations Reference)

> **Role:** `ROLE-TENANT-ADMIN` / `ROLE-FLEET-OPERATOR`  
> **Base Path:** `https://api.vmovexa.com/api/v1` (Local: `http://localhost:4000/api/v1`)  
> **Total Endpoints:** 79 APIs (All 100% verified against backend route manifests)  
> **Updated:** 2026-10-31  
> **Authentication:** All endpoints require `Authorization: Bearer <access_token>`  
> **Tenant Isolation:** Automatically scoped by organization ID via `tenantScope` & `accessGate`

See [app developer guide](../APP_DEVELOPER_GUIDE.md) and [complete request reference](../API_REFERENCE.md). For realtime events see [REALTIME_AND_GPS.md](../REALTIME_AND_GPS.md).

---

## 📋 Complete Endpoints Summary (79 APIs)

### 1. Depots & Maintenance Yards (6 APIs)
| Method | Endpoint | Permissions | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/depots` | `fleet.depots.view`, `technician.devices.view` | List all transit depots with address, capacity & vehicle counts | [Reference](../API_REFERENCE.md#get-api-v1-depots) |
| `POST` | `/api/v1/depots` | `fleet.depots.create` | Create a new transit depot | [Reference](../API_REFERENCE.md#post-api-v1-depots) |
| `DELETE` | `/api/v1/depots/:id` | `fleet.depots.delete` | Delete depot (blocked if vehicles stationed) | [Reference](../API_REFERENCE.md#delete-api-v1-depots-id) |
| `GET` | `/api/v1/depots/:id` | `fleet.depots.view`, `technician.devices.view` | Get single depot details by ID | [Reference](../API_REFERENCE.md#get-api-v1-depots-id) |
| `PATCH` | `/api/v1/depots/:id` | `fleet.depots.update` | Partially update depot details | [Reference](../API_REFERENCE.md#patch-api-v1-depots-id) |
| `PUT` | `/api/v1/depots/:id` | `fleet.depots.update` | Full update of depot record | [Reference](../API_REFERENCE.md#put-api-v1-depots-id) |

### 2. Fleet Groups & Sub-fleets (11 APIs)
| Method | Endpoint | Permissions | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/fleets` | `fleet.fleets.view`, `technician.devices.view` | List all fleet divisions | [Reference](../API_REFERENCE.md#get-api-v1-fleets) |
| `POST` | `/api/v1/fleets` | `fleet.fleets.create` | Create new fleet division | [Reference](../API_REFERENCE.md#post-api-v1-fleets) |
| `DELETE` | `/api/v1/fleets/:id` | `fleet.fleets.delete` | Delete fleet division | [Reference](../API_REFERENCE.md#delete-api-v1-fleets-id) |
| `GET` | `/api/v1/fleets/:id` | `fleet.fleets.view`, `technician.devices.view` | Get fleet division details | [Reference](../API_REFERENCE.md#get-api-v1-fleets-id) |
| `PATCH` | `/api/v1/fleets/:id` | `fleet.fleets.update` | Partially update fleet division | [Reference](../API_REFERENCE.md#patch-api-v1-fleets-id) |
| `PUT` | `/api/v1/fleets/:id` | `fleet.fleets.update` | Full update of fleet division | [Reference](../API_REFERENCE.md#put-api-v1-fleets-id) |
| `PATCH` | `/api/v1/fleets/:id/approve` | `fleet.fleets.update` | Approve fleet division | [Reference](../API_REFERENCE.md#patch-api-v1-fleets-id-approve) |
| `POST` | `/api/v1/fleets/:id/assign-vehicle` | `fleet.fleets.update` | Assign a vehicle to this fleet division | [Reference](../API_REFERENCE.md#post-api-v1-fleets-id-assign-vehicle) |
| `PATCH` | `/api/v1/fleets/:id/reject` | `fleet.fleets.update` | Reject fleet division | [Reference](../API_REFERENCE.md#patch-api-v1-fleets-id-reject) |
| `POST` | `/api/v1/fleets/:id/unassign-vehicle` | `fleet.fleets.update` | Detach a vehicle from fleet division | [Reference](../API_REFERENCE.md#post-api-v1-fleets-id-unassign-vehicle) |
| `GET` | `/api/v1/fleets/quotas` | `fleet.fleets.view`, `technician.devices.view` | Get organization fleet tier quotas & vehicle allocations | [Reference](../API_REFERENCE.md#get-api-v1-fleets-quotas) |

### 3. Transit Vehicles & Buses (14 APIs)
| Method | Endpoint | Permissions | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/vehicles` | `fleet.vehicles.view` | List all vehicles with filters, search & pagination | [Reference](../API_REFERENCE.md#get-api-v1-vehicles) |
| `POST` | `/api/v1/vehicles` | `fleet.vehicles.create` | Register a new vehicle to organization | [Reference](../API_REFERENCE.md#post-api-v1-vehicles) |
| `DELETE` | `/api/v1/vehicles/:id` | `fleet.vehicles.delete` | Remove vehicle | [Reference](../API_REFERENCE.md#delete-api-v1-vehicles-id) |
| `GET` | `/api/v1/vehicles/:id` | `fleet.vehicles.view` | Detailed vehicle profile (sensors, model, registration) | [Reference](../API_REFERENCE.md#get-api-v1-vehicles-id) |
| `PATCH` | `/api/v1/vehicles/:id` | `fleet.vehicles.update` | Partially update vehicle details | [Reference](../API_REFERENCE.md#patch-api-v1-vehicles-id) |
| `PUT` | `/api/v1/vehicles/:id` | `fleet.vehicles.update` | Full update of vehicle record | [Reference](../API_REFERENCE.md#put-api-v1-vehicles-id) |
| `PATCH` | `/api/v1/vehicles/:id/approve` | `fleet.vehicles.update` | Supervisor approve vehicle inspection | [Reference](../API_REFERENCE.md#patch-api-v1-vehicles-id-approve) |
| `PATCH` | `/api/v1/vehicles/:id/assign-driver` | `fleet.vehicles.update`, `fleet.drivers.assign` | Link a primary driver to this vehicle | [Reference](../API_REFERENCE.md#patch-api-v1-vehicles-id-assign-driver) |
| `PATCH` | `/api/v1/vehicles/:id/assign-gps` | `fleet.vehicles.update`, `fleet.devices.assign` | Link a GPS hardware tracking unit | [Reference](../API_REFERENCE.md#patch-api-v1-vehicles-id-assign-gps) |
| `GET` | `/api/v1/vehicles/:id/documents` | `fleet.vehicles.view` | List uploaded vehicle compliance docs (RC, Insurance, Fitness) | [Reference](../API_REFERENCE.md#get-api-v1-vehicles-id-documents) |
| `PATCH` | `/api/v1/vehicles/:id/documents/:docId/approve` | `fleet.vehicles.update` | Approve vehicle compliance document | [Reference](../API_REFERENCE.md#patch-api-v1-vehicles-id-documents-docid-approve) |
| `PATCH` | `/api/v1/vehicles/:id/documents/:docId/reject` | `fleet.vehicles.update` | Reject vehicle compliance document | [Reference](../API_REFERENCE.md#patch-api-v1-vehicles-id-documents-docid-reject) |
| `PATCH` | `/api/v1/vehicles/:id/reject` | `fleet.vehicles.update` | Reject vehicle registration | [Reference](../API_REFERENCE.md#patch-api-v1-vehicles-id-reject) |
| `GET` | `/api/v1/vehicles/:id/telemetry` | `fleet.vehicles.view` | Real-time GPS coordinates, speed, odometer & ignition | [Reference](../API_REFERENCE.md#get-api-v1-vehicles-id-telemetry) |

### 4. Fleet Drivers Management (12 APIs)
| Method | Endpoint | Permissions | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/drivers` | `fleet.drivers.view` | List all drivers with duty status, license & ratings | [Reference](../API_REFERENCE.md#get-api-v1-drivers) |
| `POST` | `/api/v1/drivers` | `fleet.drivers.create` | Onboard a new driver (creates linked user account) | [Reference](../API_REFERENCE.md#post-api-v1-drivers) |
| `DELETE` | `/api/v1/drivers/:id` | `fleet.drivers.delete` | Deactivate / terminate driver | [Reference](../API_REFERENCE.md#delete-api-v1-drivers-id) |
| `GET` | `/api/v1/drivers/:id` | `fleet.drivers.view` | Driver full profile, performance metrics & linked bus | [Reference](../API_REFERENCE.md#get-api-v1-drivers-id) |
| `PATCH` | `/api/v1/drivers/:id` | `fleet.drivers.update` | Partially update driver profile | [Reference](../API_REFERENCE.md#patch-api-v1-drivers-id) |
| `PUT` | `/api/v1/drivers/:id` | `fleet.drivers.update` | Full update of driver profile | [Reference](../API_REFERENCE.md#put-api-v1-drivers-id) |
| `PATCH` | `/api/v1/drivers/:id/approve` | `fleet.drivers.approve` | Operator/Admin approve driver onboarding | [Reference](../API_REFERENCE.md#patch-api-v1-drivers-id-approve) |
| `PATCH` | `/api/v1/drivers/:id/assign-bus` | `fleet.drivers.assign` | Assign designated bus to driver | [Reference](../API_REFERENCE.md#patch-api-v1-drivers-id-assign-bus) |
| `GET` | `/api/v1/drivers/:id/documents` | `fleet.drivers.view` | List driver uploaded KYC documents (DL, Aadhaar, Medical) | [Reference](../API_REFERENCE.md#get-api-v1-drivers-id-documents) |
| `PATCH` | `/api/v1/drivers/:id/reject` | `fleet.drivers.approve` | Reject driver onboarding | [Reference](../API_REFERENCE.md#patch-api-v1-drivers-id-reject) |
| `PATCH` | `/api/v1/drivers/:id/status` | `fleet.drivers.update` | Change driver status (active, suspended, on_leave) | [Reference](../API_REFERENCE.md#patch-api-v1-drivers-id-status) |
| `PATCH` | `/api/v1/drivers/:id/verify-documents` | `fleet.drivers.approve` | Mark driver KYC & Driving License as verified | [Reference](../API_REFERENCE.md#patch-api-v1-drivers-id-verify-documents) |

### 5. Transit Routes & Stops (13 APIs)
| Method | Endpoint | Permissions | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/routes` | `fleet.routes.view` | List all transit routes with stops, distance & geometry | [Reference](../API_REFERENCE.md#get-api-v1-routes) |
| `POST` | `/api/v1/routes` | `fleet.routes.create` | Create new route with stops and waypoints | [Reference](../API_REFERENCE.md#post-api-v1-routes) |
| `DELETE` | `/api/v1/routes/:id` | `fleet.routes.delete` | Delete route | [Reference](../API_REFERENCE.md#delete-api-v1-routes-id) |
| `GET` | `/api/v1/routes/:id` | `fleet.routes.view` | Route details with GeoJSON polyline and stops array | [Reference](../API_REFERENCE.md#get-api-v1-routes-id) |
| `PATCH` | `/api/v1/routes/:id` | `fleet.routes.update` | Partially update route properties | [Reference](../API_REFERENCE.md#patch-api-v1-routes-id) |
| `PUT` | `/api/v1/routes/:id` | `fleet.routes.update` | Full update of route record | [Reference](../API_REFERENCE.md#put-api-v1-routes-id) |
| `POST` | `/api/v1/routes/:id/approve` | `fleet.routes.approve` | Approve route activation | [Reference](../API_REFERENCE.md#post-api-v1-routes-id-approve) |
| `POST` | `/api/v1/routes/:id/assign-vehicle` | `fleet.routes.assign` | Assign vehicle to route corridor | [Reference](../API_REFERENCE.md#post-api-v1-routes-id-assign-vehicle) |
| `POST` | `/api/v1/routes/:id/reject` | `fleet.routes.approve` | Reject route with feedback | [Reference](../API_REFERENCE.md#post-api-v1-routes-id-reject) |
| `GET` | `/api/v1/routes/:id/vehicles` | `fleet.routes.view` | List all active vehicles assigned to this route | [Reference](../API_REFERENCE.md#get-api-v1-routes-id-vehicles) |
| `DELETE` | `/api/v1/routes/assignments/:id` | `fleet.routes.assign` | Remove vehicle from route assignment | [Reference](../API_REFERENCE.md#delete-api-v1-routes-assignments-id) |
| `POST` | `/api/v1/routes/assignments/:id/approve` | `fleet.routes.approve` | Approve vehicle route assignment | [Reference](../API_REFERENCE.md#post-api-v1-routes-assignments-id-approve) |
| `POST` | `/api/v1/routes/assignments/:id/reject` | `fleet.routes.approve` | Reject vehicle route assignment | [Reference](../API_REFERENCE.md#post-api-v1-routes-assignments-id-reject) |

### 6. Vehicle Slots & Timetable Scheduling (8 APIs)
| Method | Endpoint | Permissions | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/vehicle-slots` | `fleet.slots.view`, `fleet.vehicles.view`, `fleet.routes.view` | List vehicle slots with route, driver & time window filters | [Reference](../API_REFERENCE.md#get-api-v1-vehicle-slots) |
| `POST` | `/api/v1/vehicle-slots` | `fleet.slots.create`, `fleet.vehicles.create`, `fleet.routes.assign` | Create vehicle slot (validates overlap before saving) | [Reference](../API_REFERENCE.md#post-api-v1-vehicle-slots) |
| `DELETE` | `/api/v1/vehicle-slots/:id` | `fleet.slots.delete`, `fleet.vehicles.delete` | Cancel / delete vehicle slot | [Reference](../API_REFERENCE.md#delete-api-v1-vehicle-slots-id) |
| `GET` | `/api/v1/vehicle-slots/:id` | `fleet.slots.view`, `fleet.vehicles.view`, `fleet.routes.view` | Get single slot schedule details | [Reference](../API_REFERENCE.md#get-api-v1-vehicle-slots-id) |
| `PATCH` | `/api/v1/vehicle-slots/:id` | `fleet.slots.update`, `fleet.vehicles.update`, `fleet.routes.assign` | Update slot timing, driver, or shift | [Reference](../API_REFERENCE.md#patch-api-v1-vehicle-slots-id) |
| `PUT` | `/api/v1/vehicle-slots/:id` | `fleet.slots.update`, `fleet.vehicles.update`, `fleet.routes.assign` | Full replacement of slot schedule | [Reference](../API_REFERENCE.md#put-api-v1-vehicle-slots-id) |
| `POST` | `/api/v1/vehicle-slots/check-conflict` | `fleet.slots.view`, `fleet.vehicles.view`, `fleet.routes.view` | Live collision detection engine (checks overlapping shifts/buses) | [Reference](../API_REFERENCE.md#post-api-v1-vehicle-slots-check-conflict) |
| `GET` | `/api/v1/vehicle-slots/timetable/grid` | `fleet.slots.view`, `fleet.vehicles.view`, `fleet.routes.view` | Fetch weekly/daily schedule matrix grid | [Reference](../API_REFERENCE.md#get-api-v1-vehicle-slots-timetable-grid) |

### 7. Trips & Daily Dispatch (7 APIs)
| Method | Endpoint | Permissions | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/trips` | `fleet.trips.view` | List dispatched trips (scheduled, in_progress, completed) | [Reference](../API_REFERENCE.md#get-api-v1-trips) |
| `POST` | `/api/v1/trips` | `fleet.trips.create` | Dispatch new trip with assigned driver & bus | [Reference](../API_REFERENCE.md#post-api-v1-trips) |
| `DELETE` | `/api/v1/trips/:id` | `fleet.trips.delete` | Cancel trip | [Reference](../API_REFERENCE.md#delete-api-v1-trips-id) |
| `GET` | `/api/v1/trips/:id` | `fleet.trips.view` | Trip details with live driver GPS, speed & timeline | [Reference](../API_REFERENCE.md#get-api-v1-trips-id) |
| `PATCH` | `/api/v1/trips/:id` | `fleet.trips.update` | Partially update trip status / schedule | [Reference](../API_REFERENCE.md#patch-api-v1-trips-id) |
| `PUT` | `/api/v1/trips/:id` | `fleet.trips.update` | Full update of trip record | [Reference](../API_REFERENCE.md#put-api-v1-trips-id) |
| `PATCH` | `/api/v1/trips/:id/end` | `fleet.trips.update` | Complete / terminate active trip | [Reference](../API_REFERENCE.md#patch-api-v1-trips-id-end) |

### 8. Incidents & SOS Safety Reports (8 APIs)
| Method | Endpoint | Permissions | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/incidents` | `fleet.incidents.view` | List reported incidents (accidents, breakdowns, security) | [Reference](../API_REFERENCE.md#get-api-v1-incidents) |
| `POST` | `/api/v1/incidents` | `fleet.incidents.create` | Report a new safety / operational incident | [Reference](../API_REFERENCE.md#post-api-v1-incidents) |
| `DELETE` | `/api/v1/incidents/:id` | `fleet.incidents.delete` | Remove false incident report | [Reference](../API_REFERENCE.md#delete-api-v1-incidents-id) |
| `GET` | `/api/v1/incidents/:id` | `fleet.incidents.view` | Get incident details with GPS coordinates & attached evidence | [Reference](../API_REFERENCE.md#get-api-v1-incidents-id) |
| `PATCH` | `/api/v1/incidents/:id` | `fleet.incidents.update` | Partially update incident log | [Reference](../API_REFERENCE.md#patch-api-v1-incidents-id) |
| `PUT` | `/api/v1/incidents/:id` | `fleet.incidents.update` | Full update of incident report | [Reference](../API_REFERENCE.md#put-api-v1-incidents-id) |
| `PATCH` | `/api/v1/incidents/:id/resolution` | `fleet.incidents.update` | Record official investigation resolution & corrective actions | [Reference](../API_REFERENCE.md#patch-api-v1-incidents-id-resolution) |
| `PATCH` | `/api/v1/incidents/:id/status` | `fleet.incidents.update` | Update incident lifecycle status (reported, investigating, resolved) | [Reference](../API_REFERENCE.md#patch-api-v1-incidents-id-status) |

---

## 🚍 Core Fleet Sub-Domains In-Depth

### 1. Vehicle Slots & Timetable Conflict Prevention
VMOVEXA features an automated scheduling engine to prevent double-booking of buses and drivers across shifts.
- `POST /api/v1/vehicle-slots/check-conflict`: Evaluates `tenant_id`, `vehicle_id`, `slot_start_time`, `slot_end_time`, `days_of_week`. Returns `{ conflict: true/false, overlappingSlots: [...] }`. [Contract](../CONTROLLER_CONTRACTS.md#post-api-v1-vehicle-slots-check-conflict)
- `GET /api/v1/vehicle-slots/timetable/grid`: Generates a timetable matrix for UI scheduling calendars. [Contract](../CONTROLLER_CONTRACTS.md#get-api-v1-vehicle-slots-timetable-grid)

### 2. Live Telemetry & GPS Tracking
- `GET /api/v1/vehicles/:id/telemetry`: Retrieves latest real-time GPS telemetry from edge compute devices and GPS trackers. [Contract](../CONTROLLER_CONTRACTS.md#get-api-v1-vehicles-id-telemetry)

### 3. Compliance & Document Approvals
- Vehicles: `GET /api/v1/vehicles/:id/documents`, `PATCH /api/v1/vehicles/:id/documents/:docId/approve`, `PATCH /api/v1/vehicles/:id/documents/:docId/reject`.
- Drivers: `GET /api/v1/drivers/:id/documents`, `PATCH /api/v1/drivers/:id/verify-documents`.

