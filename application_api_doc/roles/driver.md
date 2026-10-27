# Driver Portal — API Documentation

> **Role:** `ROLE-DRIVER`  
> **Base Path:** `http://localhost:4000/api/v1/me/driver`  
> **Auth:** All endpoints require `Authorization: Bearer <token>`  
> **Note:** These are self-service endpoints — driver sees only their own data. No admin permission needed.

---

## 📋 Endpoints Summary (15 APIs)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/me/driver/profile` | My driver profile |
| `GET` | `/me/driver/schedule` | My today's schedule |
| `GET` | `/me/driver/active-route` | Currently active route |
| `GET` | `/me/driver/trips` | My trip history |
| `GET` | `/me/driver/documents` | My uploaded documents |
| `POST` | `/me/driver/documents` | Upload/update a document |
| `DELETE` | `/me/driver/documents/:id` | Delete a document |
| `GET` | `/me/driver/incidents` | My reported incidents |
| `GET` | `/me/driver/incidents/:id` | Single incident detail |
| `POST` | `/me/driver/incidents` | Report a new incident |
| `PATCH` | `/me/driver/duty-status` | Toggle on-duty / off-duty |
| `POST` | `/me/driver/trip/start` | Start current assigned route trip |
| `POST` | `/me/driver/trip/end` | Finish & log current assigned route trip |
| `POST` | `/me/driver/trips/:id/start` | Start scheduled trip by ID |
| `POST` | `/me/driver/trips/:id/end` | Finish scheduled trip by ID |

---

## 1. GET `/me/driver/profile`

Get the full profile of the currently logged-in driver.

### Success Response `200`
```json
{
  "success": true,
  "data": {
    "id": "drv_01HX...",
    "name": "Ramesh Kumar",
    "phone": "+919876543210",
    "email": "ramesh@example.com",
    "license_number": "MP09 20190001234",
    "license_expiry": "2028-06-30",
    "license_type": "Heavy Motor Vehicle",
    "address": "23 Gandhi Nagar, Indore",
    "emergency_contact_name": "Priya Kumar",
    "emergency_contact_phone": "+919988776655",
    "duty_status": "on_duty",
    "status": "active",
    "assigned_vehicle": {
      "id": "veh_01HX...",
      "registration_number": "MP09AB1234",
      "make": "Tata",
      "model": "Starbus Ultra"
    },
    "organization": {
      "id": "org_01HX...",
      "name": "VMOVEXA Transit"
    },
    "joined_at": "2025-03-01T00:00:00.000Z"
  }
}
```

### Frontend Integration
```js
// services/driver/driverPortal.service.js
export const getDriverProfile = () =>
  apiClient.get(ENDPOINTS.ME.DRIVER.PROFILE);

// In component:
const { profile, loading } = useDriver();
```

---

## 2. GET `/me/driver/schedule`

Get today's schedule for the driver — assigned trips, route, shifts.

### Success Response `200`
```json
{
  "success": true,
  "data": {
    "date": "2026-10-10",
    "shift": {
      "start_time": "07:00",
      "end_time": "15:00",
      "shift_type": "morning"
    },
    "assigned_route": {
      "id": "rte_01HX...",
      "name": "Vijay Nagar ⇄ Rau Corridor",
      "route_number": "R-12",
      "from_stop": "Vijay Nagar",
      "to_stop": "Rau"
    },
    "upcoming_trips": [
      {
        "id": "trp_01HX...",
        "scheduled_departure": "2026-10-10T08:00:00.000Z",
        "from_stop": "Vijay Nagar",
        "to_stop": "Rau",
        "status": "pending"
      }
    ]
  }
}
```

---

## 3. GET `/me/driver/active-route`

Get the currently active route the driver is on.

### Success Response `200`
```json
{
  "success": true,
  "data": {
    "trip_id": "trp_01HX...",
    "route": {
      "id": "rte_01HX...",
      "name": "Vijay Nagar ⇄ Rau",
      "route_number": "R-12",
      "stops": [
        { "name": "Vijay Nagar", "lat": 22.7558, "lng": 75.8816, "order": 1 },
        { "name": "Palasia", "lat": 22.7336, "lng": 75.8823, "order": 2 },
        { "name": "Rau", "lat": 22.6929, "lng": 75.8166, "order": 3 }
      ]
    },
    "current_stop_index": 1,
    "trip_started_at": "2026-10-10T08:05:00.000Z",
    "passengers_onboard": 32
  }
}
```

### Error Response `404`
```json
{
  "success": false,
  "message": "No active trip found"
}
```

---

## 4. GET `/me/driver/trips`

Get the driver's trip history with pagination.

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |
| `status` | string | `in_progress`, `completed`, `cancelled` |
| `date_from` | string | Start date (ISO 8601, e.g. `2026-10-01`) |
| `date_to` | string | End date |

### Success Response `200`
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": "trp_01HX...",
        "route": { "name": "Vijay Nagar ⇄ Rau", "route_number": "R-12" },
        "vehicle": { "registration_number": "MP09AB1234" },
        "status": "completed",
        "start_time": "2026-10-09T08:05:00.000Z",
        "end_time": "2026-10-09T08:52:00.000Z",
        "distance_km": 18.5,
        "passengers_counted": 48
      }
    ],
    "count": 230,
    "totalPages": 12,
    "currentPage": 1,
    "pageSize": 20
  }
}
```

---

## 5. GET `/me/driver/documents`

List all documents uploaded by the driver.

### Success Response `200`
```json
{
  "success": true,
  "data": [
    {
      "id": "doc_01HX...",
      "type": "license",
      "type_label": "Driving License",
      "url": "/uploads/documents/license_ramesh.jpg",
      "status": "verified",
      "uploaded_at": "2025-03-01T10:00:00.000Z",
      "verified_at": "2025-03-02T09:00:00.000Z",
      "expiry_date": "2028-06-30"
    },
    {
      "id": "doc_02HX...",
      "type": "aadhaar",
      "type_label": "Aadhaar Card",
      "url": "/uploads/documents/aadhaar_ramesh.jpg",
      "status": "pending",
      "uploaded_at": "2025-03-01T10:05:00.000Z"
    }
  ]
}
```

---

## 6. POST `/me/driver/documents`

Upload or update a driver document.

### Request Body (`multipart/form-data` via upload, or JSON with url)
```json
{
  "type": "license",
  "url": "/uploads/documents/license_updated.jpg",
  "expiry_date": "2032-06-30"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | `license`, `aadhaar`, `pan`, `medical`, `badge` |
| `url` | string | Yes | Uploaded file URL (from `/uploads` API first) |
| `expiry_date` | string | No | Document expiry (ISO 8601) |

### Success Response `201`
```json
{
  "success": true,
  "message": "Document uploaded. Pending verification.",
  "data": {
    "id": "doc_03HX...",
    "type": "license",
    "status": "pending"
  }
}
```

### Upload Flow
```
Step 1: Upload file → POST /uploads → get file_url
Step 2: Save document → POST /me/driver/documents → { type, url: file_url }
```

---

## 7. DELETE `/me/driver/documents/:id`

Delete a specific document.

### Success Response `200`
```json
{ "success": true, "message": "Document removed" }
```

---

## 8. GET `/me/driver/incidents`

List incidents reported by the driver.

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number |
| `limit` | number | Items per page |
| `status` | string | `open`, `in_progress`, `resolved` |

### Success Response `200`
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": "inc_01HX...",
        "title": "Tyre puncture near Vijay Nagar",
        "severity": "medium",
        "status": "resolved",
        "reported_at": "2026-10-08T11:15:00.000Z",
        "resolved_at": "2026-10-08T12:30:00.000Z"
      }
    ],
    "count": 3,
    "totalPages": 1,
    "currentPage": 1,
    "pageSize": 20
  }
}
```

---

## 9. GET `/me/driver/incidents/:id`

Get details of a specific incident.

### Success Response `200`
```json
{
  "success": true,
  "data": {
    "id": "inc_01HX...",
    "title": "Tyre puncture near Vijay Nagar",
    "description": "Front left tyre burst near stop 3 on route R-12",
    "severity": "medium",
    "status": "resolved",
    "location": { "lat": 22.7558, "lng": 75.8816 },
    "media_urls": ["/uploads/incidents/photo1.jpg"],
    "resolution": "Spare tyre fitted by roadside crew",
    "reported_at": "2026-10-08T11:15:00.000Z",
    "resolved_at": "2026-10-08T12:30:00.000Z"
  }
}
```

---

## 10. POST `/me/driver/incidents`

Report a new incident from the driver's app.

### Request Body
```json
{
  "title": "Engine overheating warning",
  "description": "Dashboard shows engine temp warning on NH-3 near toll gate",
  "severity": "high",
  "location": {
    "lat": 22.6929,
    "lng": 75.8166
  },
  "media_urls": ["/uploads/incidents/engine_warning.jpg"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Short incident title |
| `description` | string | Yes | Detailed description |
| `severity` | string | Yes | `low`, `medium`, `high`, `critical` |
| `location` | object | No | `{ lat, lng }` GPS coordinates |
| `media_urls` | array | No | Photos/videos URLs |

### Success Response `201`
```json
{
  "success": true,
  "message": "Incident reported successfully",
  "data": {
    "id": "inc_02HX...",
    "status": "open",
    "ticket_number": "INC-2026-0042"
  }
}
```

---

## 11. PATCH `/me/driver/duty-status`

Toggle driver duty status (on-duty / off-duty). Used at start/end of shift.

### Request Body
```json
{
  "duty_status": "on_duty",
  "location": {
    "lat": 22.7196,
    "lng": 75.8577
  }
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `duty_status` | string | Yes | `on_duty`, `off_duty`, `on_break` |
| `location` | object | No | GPS coordinates at duty start |

### Success Response `200`
```json
{
  "success": true,
  "message": "Duty status updated to on_duty",
  "data": {
    "duty_status": "on_duty",
    "duty_started_at": "2026-10-10T07:58:00.000Z"
  }
}
```

---

## 🔗 Frontend Architecture & File Reference
- **Services:** `src/api/services/driver/driverPortal.service.js`
- **Thunks:** `src/store/thunks/driver.thunks.js`
- **Slices:** `src/store/slices/driverSlice.js`
- **Custom Hooks:** `src/hooks/useDriver.js`
- **Pages:** `src/pages/driver/` (`DriverDashboard.jsx`, `DriverSchedulePage.jsx`, `DriverTripsPage.jsx`, `DriverIncidentsListPage.jsx`, `DriverDocumentsPage.jsx`)
- **Pagination Component:** `src/components/ui/Pagination.jsx`
- **Integration Blueprint:** See [FRONTEND_INTEGRATION_GUIDE.md](../FRONTEND_INTEGRATION_GUIDE.md)
