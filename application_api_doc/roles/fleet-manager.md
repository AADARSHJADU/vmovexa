# Fleet Manager Portal — API Documentation (Complete Fleet Operations Reference)

> **Role:** `ROLE-TENANT-ADMIN` / `ROLE-FLEET-OPERATOR`  
> **Base Path:** `http://localhost:4000/api/v1`  
> **Auth:** All endpoints require `Authorization: Bearer <token>`  
> **Tenant Scoped:** All queries are automatically isolated to the authenticated organization.

---

## 📋 Complete Endpoints Summary (65 APIs)

### 1. Depots & Maintenance Yards (5 APIs)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/depots` | List all depots with address, capacity & vehicle counts |
| `GET` | `/depots/:id` | Get single depot details |
| `POST` | `/depots` | Create a new transit depot |
| `PATCH` | `/depots/:id` | Update depot details (capacity, supervisor, phone) |
| `DELETE` | `/depots/:id` | Delete depot (fails if vehicles currently stationed) |

### 2. Fleet Groups & Sub-fleets (9 APIs)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/fleets` | List all fleet divisions (e.g. BRTS Corridor, City Feeder, AC Electric) |
| `GET` | `/fleets/:id` | Get fleet division details |
| `POST` | `/fleets` | Create new fleet division |
| `PATCH` | `/fleets/:id` | Update fleet division |
| `DELETE` | `/fleets/:id` | Delete fleet division |
| `POST` | `/fleets/:id/assign-vehicle` | Assign a vehicle to this fleet division |
| `POST` | `/fleets/:id/unassign-vehicle` | Detach a vehicle from fleet division |
| `PATCH` | `/fleets/:id/approve` | Approve fleet division |
| `PATCH` | `/fleets/:id/reject` | Reject fleet division |

### 3. Transit Vehicles & Buses (13 APIs)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/vehicles` | List all vehicles with filters, search & pagination |
| `GET` | `/vehicles/:id` | Detailed vehicle profile (model, registration, fuel, sensors, screen status) |
| `POST` | `/vehicles` | Add a new vehicle to organization |
| `PATCH` | `/vehicles/:id` | Update vehicle details |
| `DELETE` | `/vehicles/:id` | Remove vehicle |
| `PATCH` | `/vehicles/:id/approve` | Supervisor approve vehicle inspection |
| `PATCH` | `/vehicles/:id/reject` | Reject vehicle registration |
| `PATCH` | `/vehicles/:id/assign-driver` | Link a primary driver to this vehicle |
| `PATCH` | `/vehicles/:id/assign-gps` | Link a GPS hardware tracking unit |
| `GET` | `/vehicles/:id/telemetry` | Real-time GPS coordinates, speed, odometer, fuel & ignition |
| `GET` | `/vehicles/:id/documents` | List uploaded vehicle compliance docs (RC, Insurance, Fitness) |
| `PATCH` | `/vehicles/:id/documents/:docId/approve` | Approve vehicle compliance document |
| `PATCH` | `/vehicles/:id/documents/:docId/reject` | Reject compliance document with note |

### 4. Fleet Drivers Management (11 APIs)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/drivers` | List all drivers with duty status, license info & ratings |
| `GET` | `/drivers/:id` | Driver full profile, performance metrics, linked vehicle |
| `POST` | `/drivers` | Onboard a new driver (creates linked user account) |
| `PATCH` | `/drivers/:id` | Update driver details |
| `DELETE` | `/drivers/:id` | Terminate driver profile |
| `PATCH` | `/drivers/:id/assign-bus` | Assign designated bus to driver |
| `PATCH` | `/drivers/:id/status` | Change status (`active`, `suspended`, `on_leave`) |
| `PATCH` | `/drivers/:id/approve` | SuperAdmin/Operator approve driver onboarding |
| `PATCH` | `/drivers/:id/reject` | Reject driver onboarding |
| `PATCH` | `/drivers/:id/verify-documents`| Mark driver KYC & Driving License as verified |
| `GET` | `/drivers/:id/documents` | List driver uploaded KYC docs (DL, Aadhar, Medical) |

### 5. Transit Routes & Stops (12 APIs)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/routes` | List all transit routes with total distance, stops & scheduled buses |
| `GET` | `/routes/:id` | Route details with full GeoJSON path & stops array |
| `POST` | `/routes` | Create a new route with stops & GPS polyline |
| `PATCH` | `/routes/:id` | Update route stops, frequency, or schedule |
| `DELETE` | `/routes/:id` | Delete route |
| `POST` | `/routes/:id/approve` | Approve route activation |
| `POST` | `/routes/:id/reject` | Reject route with feedback |
| `POST` | `/routes/:id/assign-vehicle` | Deploy a vehicle onto this route schedule |
| `GET` | `/routes/:id/vehicles` | List all active vehicles running on this route |
| `POST` | `/routes/assignments/:id/approve` | Approve vehicle route schedule assignment |
| `POST` | `/routes/assignments/:id/reject` | Reject vehicle route assignment |
| `DELETE` | `/routes/assignments/:id` | Remove vehicle from route schedule |

### 6. Trips & Daily Schedules (6 APIs)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/trips` | List all dispatched trips (scheduled, in-transit, completed) |
| `GET` | `/trips/:id` | Detailed trip timeline, start/end stops, delays & live driver GPS |
| `POST` | `/trips` | Dispatch a new trip |
| `PATCH` | `/trips/:id` | Edit trip schedule |
| `DELETE` | `/trips/:id` | Cancel trip |
| `PATCH` | `/trips/:id/end` | Manually mark trip as completed |

### 7. Incidents & SOS Safety Reports (7 APIs)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/incidents` | List all reported transit incidents (breakdown, accident, delay) |
| `GET` | `/incidents/:id` | Detailed incident log with driver notes & GPS pin |
| `POST` | `/incidents` | Log a new incident |
| `PATCH` | `/incidents/:id` | Update incident log |
| `DELETE` | `/incidents/:id` | Delete false alarm incident |
| `PATCH` | `/incidents/:id/status` | Update incident status (`reported`, `investigating`, `resolved`) |
| `PATCH` | `/incidents/:id/resolution` | Submit incident investigation resolution & root cause |

### 8. Dashboard & Live Monitoring (2 APIs)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/dashboard/admin/kpis` | Organization KPI counters (vehicles, drivers, live trips, open incidents) |
| `GET` | `/dashboard/live-summary` | Real-time map telemetry summary for all active fleet buses |

---

## 🔍 STANDARD QUERY FILTERS & PAGINATION

All list endpoints (`/fleets`, `/vehicles`, `/drivers`, `/routes`, `/trips`, `/incidents`, `/depots`) support:

```http
GET /vehicles?page=1&limit=20&search=MP09&status=active&sortBy=created_at&sortOrder=DESC
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | `1` | Page number (1-indexed) |
| `limit` | number | `20` | Page size (10, 20, 50, 100) |
| `search` | string | `""` | Search text across entity fields |
| `status` | string | `""` | Filter by status (`active`, `inactive`, `pending`, etc.) |
| `sortBy` | string | `created_at` | Sort column |
| `sortOrder` | string | `DESC` | `ASC` or `DESC` |

---

## 🏬 SECTION 1: Depots Integration Details

### 1.1 GET `/depots`
List depots for current organization.

#### Success Response `200`
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": "dep_01HX99...",
        "name": "North Depot - Vijay Nagar",
        "code": "DEP-VN-01",
        "address": "Scheme 54, Vijay Nagar, Indore",
        "city": "Indore",
        "state": "Madhya Pradesh",
        "capacity": 50,
        "contact_name": "Ramesh Patel",
        "contact_phone": "+919827011223",
        "vehicle_count": 34,
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

### 1.2 POST `/depots`
Create a new maintenance depot / terminal.

#### Request Body
```json
{
  "name": "East Ring Road Depot",
  "code": "DEP-ERR-02",
  "address": "Bicholi Mardana, Bypass Road, Indore",
  "city": "Indore",
  "state": "Madhya Pradesh",
  "capacity": 40,
  "contact_name": "Sunil Sharma",
  "contact_phone": "+919827099887"
}
```

---

## 🏢 SECTION 2: Fleet Divisions Details

### 2.1 POST `/fleets`
Create a sub-fleet division.

#### Request Body
```json
{
  "name": "BRTS Corridor High-Speed Electric",
  "description": "Dedicated iBus electric fleet running on AB Road corridor",
  "depot_id": "dep_01HX99...",
  "status": "active"
}
```

### 2.2 POST `/fleets/:id/assign-vehicle`
Link a vehicle to this fleet division.

#### Request Body
```json
{
  "vehicle_id": "veh_01HX9821"
}
```

---

## 🚌 SECTION 3: Vehicles Integration Details

### 3.1 POST `/vehicles`
Add a new transit bus to the organization.

#### Request Body
```json
{
  "registration_number": "MP09-CV-9821",
  "vin": "MB1AA456789012345",
  "make": "Tata Motors",
  "model": "Starbus Ultra EV",
  "year": 2025,
  "capacity": 42,
  "fuel_type": "electric", // "diesel", "cng", "electric"
  "depot_id": "dep_01HX99...",
  "fleet_id": "flt_01HX...",
  "status": "active"
}
```

#### Success Response `201`
```json
{
  "success": true,
  "message": "Vehicle added successfully",
  "data": {
    "id": "veh_01HX9821",
    "registration_number": "MP09-CV-9821",
    "status": "active",
    "created_at": "2026-10-10T06:00:00.000Z"
  }
}
```

### 3.2 PATCH `/vehicles/:id/assign-driver`
Assign a designated driver to a vehicle.

#### Request Body
```json
{
  "driver_id": "drv_01HX...",
  "shift": "morning"
}
```

### 3.3 GET `/vehicles/:id/telemetry`
Live telematics feed from IoT sensors.

#### Success Response `200`
```json
{
  "success": true,
  "data": {
    "vehicle_id": "veh_01HX9821",
    "latitude": 22.7196,
    "longitude": 75.8577,
    "speed_kmh": 34.5,
    "ignition_status": "ON",
    "battery_soc_pct": 78,
    "odometer_km": 14280.5,
    "updated_at": "2026-10-10T06:45:10.000Z"
  }
}
```

---

## 👨‍✈️ SECTION 4: Drivers Management Details

### 4.1 POST `/drivers`
Onboard a new driver.

#### Request Body
```json
{
  "name": "Ramesh Kumar Verma",
  "phone": "+919876543210",
  "email": "ramesh.verma@transit.in",
  "license_number": "MP09-2019-009124",
  "license_expiry": "2029-08-30",
  "address": "23 Gandhi Nagar, Indore",
  "depot_id": "dep_01HX99...",
  "status": "active"
}
```

### 4.2 PATCH `/drivers/:id/assign-bus`
Assign dedicated transit bus to driver.

#### Request Body
```json
{
  "vehicle_id": "veh_01HX9821"
}
```

---

## 🗺️ SECTION 5: Transit Routes Details

### 5.1 POST `/routes`
Create transit route with stops.

#### Request Body
```json
{
  "name": "Route 7A: Rajwada to Vijay Nagar Square",
  "code": "R-7A",
  "origin": "Rajwada Palace",
  "destination": "Vijay Nagar Square",
  "total_distance_km": 12.8,
  "stops": [
    { "name": "Rajwada", "sequence": 1, "latitude": 22.7188, "longitude": 75.8560 },
    { "name": "Palasia Square", "sequence": 2, "latitude": 22.7244, "longitude": 75.8839 },
    { "name": "Vijay Nagar Square", "sequence": 3, "latitude": 22.7533, "longitude": 75.8937 }
  ]
}
```

### 5.2 POST `/routes/:id/assign-vehicle`
Deploy bus onto route schedule.

#### Request Body
```json
{
  "vehicle_id": "veh_01HX9821",
  "shift": "morning"
}
```

---

## ⏱️ SECTION 6: Trips & Dispatch Details

### 6.1 POST `/trips`
Dispatch a new live trip.

#### Request Body
```json
{
  "vehicle_id": "veh_01HX9821",
  "driver_id": "drv_01HX...",
  "route_id": "rt_01HX...",
  "start_time": "2026-10-10T08:00:00.000Z",
  "end_time": "2026-10-10T09:30:00.000Z"
}
```

### 6.2 PATCH `/trips/:id/end`
Complete trip.

#### Success Response `200`
```json
{
  "success": true,
  "message": "Trip marked as completed.",
  "data": {
    "trip_id": "trp_01HX...",
    "status": "completed",
    "completed_at": "2026-10-10T09:28:00.000Z"
  }
}
```

---

## 🚨 SECTION 7: Incidents & Safety Logs

### 7.1 POST `/incidents`
Log a transit incident or mechanical breakdown.

#### Request Body
```json
{
  "vehicle_id": "veh_01HX9821",
  "driver_id": "drv_01HX...",
  "incident_type": "mechanical_breakdown", // "accident", "mechanical_breakdown", "passenger_issue", "traffic_delay"
  "severity": "medium", // "low", "medium", "high", "critical"
  "description": "Coolant temperature spike warning at Palasia square.",
  "latitude": 22.7244,
  "longitude": 75.8839,
  "location": "Palasia Square Bus Stop"
}
```

### 7.2 PATCH `/incidents/:id/resolution`
Close and resolve incident report.

#### Request Body
```json
{
  "status": "resolved",
  "recovered": true,
  "contactedDriver": true,
  "contactNotes": "Instructed driver to park at Palasia bay. Backup bus dispatched.",
  "resolutionNotes": "Coolant refilled by mobile maintenance unit. Vehicle returned to depot."
}
```

---

## 💻 Standard Frontend Service Implementation

```javascript
// src/api/services/fleet/fleet.service.js
import apiClient from '../client';
import ENDPOINTS from '../endpoints';

export const fleetService = {
  // Depots
  getDepots: (params) => apiClient.get(ENDPOINTS.FLEET.DEPOTS, { params }),
  createDepot: (data) => apiClient.post(ENDPOINTS.FLEET.DEPOTS, data),

  // Fleets
  getFleets: (params) => apiClient.get(ENDPOINTS.FLEET.FLEETS, { params }),
  createFleet: (data) => apiClient.post(ENDPOINTS.FLEET.FLEETS, data),
  assignVehicleToFleet: (id, vehicleId) => apiClient.post(ENDPOINTS.FLEET.FLEET_ASSIGN_VEHICLE(id), { vehicleId }),

  // Vehicles
  getVehicles: (params) => apiClient.get(ENDPOINTS.FLEET.VEHICLES, { params }),
  getVehicleById: (id) => apiClient.get(ENDPOINTS.FLEET.VEHICLE_ONE(id)),
  addVehicle: (data) => apiClient.post(ENDPOINTS.FLEET.VEHICLES, data),
  updateVehicle: (id, data) => apiClient.patch(ENDPOINTS.FLEET.VEHICLE_ONE(id), data),
  deleteVehicle: (id) => apiClient.delete(ENDPOINTS.FLEET.VEHICLE_ONE(id)),
  assignDriver: (id, driverId) => apiClient.patch(ENDPOINTS.FLEET.VEHICLE_ASSIGN_DRIVER(id), { driverId }),
  assignGps: (id, gpsDeviceId) => apiClient.patch(ENDPOINTS.FLEET.VEHICLE_ASSIGN_GPS(id), { gpsDeviceId }),
  getVehicleTelemetry: (id) => apiClient.get(ENDPOINTS.FLEET.VEHICLE_TELEMETRY(id)),

  // Drivers
  getDrivers: (params) => apiClient.get(ENDPOINTS.FLEET.DRIVERS, { params }),
  addDriver: (data) => apiClient.post(ENDPOINTS.FLEET.DRIVERS, data),
  assignBusToDriver: (id, vehicleId) => apiClient.patch(ENDPOINTS.FLEET.DRIVER_ASSIGN_BUS(id), { vehicleId }),
  updateDriverStatus: (id, status) => apiClient.patch(ENDPOINTS.FLEET.DRIVER_STATUS(id), { status }),

  // Routes
  getRoutes: (params) => apiClient.get(ENDPOINTS.FLEET.ROUTES, { params }),
  addRoute: (data) => apiClient.post(ENDPOINTS.FLEET.ROUTES, data),
  assignVehicleToRoute: (id, vehicleId) => apiClient.post(ENDPOINTS.FLEET.ROUTE_ASSIGN_VEHICLE(id), { vehicleId }),

  // Trips & Incidents
  getTrips: (params) => apiClient.get(ENDPOINTS.FLEET.TRIPS, { params }),
  dispatchTrip: (data) => apiClient.post(ENDPOINTS.FLEET.TRIPS, data),
  endTrip: (id) => apiClient.patch(ENDPOINTS.FLEET.TRIP_END(id)),
  getIncidents: (params) => apiClient.get(ENDPOINTS.FLEET.INCIDENTS, { params }),
  logIncident: (data) => apiClient.post(ENDPOINTS.FLEET.INCIDENTS, data),
  resolveIncident: (id, data) => apiClient.patch(ENDPOINTS.FLEET.INCIDENT_RESOLUTION(id), data),

  // Dashboard & KPIs
  getAdminKpis: () => apiClient.get(ENDPOINTS.DASHBOARD.ADMIN_KPIS),
  getLiveSummary: () => apiClient.get(ENDPOINTS.DASHBOARD.LIVE_SUMMARY),
};
```

---

## 🔗 Frontend Architecture & File Reference
- **Services:** `src/api/services/fleet/` (`vehicle.service.js`, `driver.service.js`, `route.service.js`, `trip.service.js`, `fleet.service.js`, `gps.service.js`)
- **Thunks:** `src/store/thunks/fleet/` (`vehicle.thunks.js`, `driver.thunks.js`, `route.thunks.js`, `trip.thunks.js`, `incident.thunks.js`)
- **Slices:** `src/store/slices/fleet/` (`vehicleSlice.js`, `driverSlice.js`, `routeSlice.js`, `tripSlice.js`, `incidentSlice.js`)
- **Custom Hooks:** `src/hooks/fleet/` (`useFleetVehicle.js`, `useFleetDriver.js`, `useFleetRoute.js`, `useFleetTrip.js`, `useFleetIncident.js`)
- **Pages:** `src/pages/fleet-manager/` (`VehiclesPage.jsx`, `DriversPage.jsx`, `FleetsPage.jsx`, `RoutesPage.jsx`, `TripsPage.jsx`, `LiveTrackingPage.jsx`, `IncidentsPage.jsx`)
- **Pagination Component:** `src/components/ui/Pagination.jsx`
- **Integration Blueprint:** See [FRONTEND_INTEGRATION_GUIDE.md](file:///e:/vmovexa/application_api_doc/FRONTEND_INTEGRATION_GUIDE.md)
