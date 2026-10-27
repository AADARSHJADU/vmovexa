# Technician Portal — API Documentation (Hardware, Edge, GPS & Work Orders)

> **Role:** `ROLE-CENTRAL-TECH` / `ROLE-TECHNICIAN`  
> **Base Path:** `http://localhost:4000/api/v1`  
> **Auth:** All endpoints require `Authorization: Bearer <token>`  
> **Permissions:** `technician.*`, `devices.*`, `work_orders.*`

---

## 📋 Complete Endpoints Summary (42 APIs)

### 1. Technician Self-Service (4 APIs)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/me/technician/stats` | Technician task KPIs (assigned, in-progress, completed, average rating) |
| `GET` | `/me/technician/work-orders` | Technician's assigned work orders list (today's dispatch queue) |
| `GET` | `/me/technician/work-orders/:id` | Detailed view of a single assigned work order |
| `PATCH` | `/me/technician/work-orders/:id/status` | Update execution status (`in_progress`, `completed`, `on_hold`) |

### 2. Work Orders Management Lifecycle (9 APIs)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/work-orders` | List all organization hardware work orders with filters & pagination |
| `GET` | `/work-orders/:id` | Get work order details including vehicle, hardware items & history |
| `POST` | `/work-orders` | File a new hardware maintenance ticket / dispatch request |
| `PATCH` | `/work-orders/:id` | Update work order details, priority, or symptoms |
| `PATCH` | `/work-orders/:id/assign` | Assign / dispatch work order to a technician |
| `PATCH` | `/work-orders/:id/approve` | Supervisor approve work order completion |
| `PATCH` | `/work-orders/:id/reject` | Reject work order completion (re-open task) |
| `PATCH` | `/work-orders/:id/status` | Admin status override |
| `POST` | `/work-orders/:id/rate` | Submit performance star rating & feedback for completed maintenance |

### 3. Edge Computing Devices (17 APIs)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/edge-devices` | List all smart edge computing boxes installed on vehicles |
| `GET` | `/edge-devices/:id` | Edge device hardware details, firmware version & IP |
| `GET` | `/edge-devices/:id/telemetry` | Real-time sensor metrics (CPU, RAM, temp, MQTT heartbeat) |
| `POST` | `/edge-devices` | Register a new edge computing unit |
| `PATCH` | `/edge-devices/:id` | Update edge unit configuration, name, or vehicle assignment |
| `POST` | `/edge-devices/:id/assign` | Pair & mount edge unit to transit vehicle |
| `PATCH` | `/edge-devices/:id/toggle` | Toggle device active/inactive operational status |
| `DELETE` | `/edge-devices/:id` | De-register edge unit |
| `POST` | `/edge-devices/:id/reboot` | Remote reboot command via MQTT command channel |
| `GET` | `/edge-devices/:id/config` | Read edge runtime configuration JSON |
| `POST` | `/edge-devices/:id/config` | Over-the-air (OTA) push new configuration JSON |
| `POST` | `/edge-devices/:id/factory-reset` | Remote factory reset edge device |
| `GET` | `/edge-devices/:id/connectivity-tests` | Connectivity ping & telemetry test history |
| `POST` | `/edge-devices/:id/connectivity-tests` | Trigger instant cellular / WiFi connectivity diagnostic ping |
| `GET` | `/edge-devices/package/download` | Download edge daemon deployment package tarball |
| `GET` | `/edge-devices/setup-script` | Generate shell automated setup script for edge units |
| `GET` | `/edge-devices/handshake/:boxId` | Telemetry pre-flight handshake check |

### 4. Vehicle Transit Screen Displays (4 APIs)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/displays` | List all digital transit ad screens |
| `POST` | `/displays` | Register a new transit display screen |
| `GET` | `/displays/:id/config` | Read display resolution, brightness, orientation config |
| `PATCH` | `/displays/:id/config` | Update brightness schedule, resolution & audio volume |

### 5. GPS Hardware Trackers (8 APIs)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/gps-devices` | List all GPS telematics tracker units |
| `GET` | `/gps-devices/:id` | Tracker details, IMEI, SIM number, battery, satellite lock |
| `POST` | `/gps-devices` | Register a new GPS tracker unit |
| `PATCH` | `/gps-devices/:id` | Update GPS device info / SIM details |
| `POST` | `/gps-devices/:id/assign` | Pair & mount GPS device to a vehicle |
| `POST` | `/gps-devices/:id/approve` | Approve GPS hardware installation |
| `POST` | `/gps-devices/:id/reject` | Reject GPS installation with reason |
| `DELETE` | `/gps-devices/:id` | Unlink / remove GPS device from vehicle |

---

## 🛠️ SECTION 1: Technician Self-Service Work Orders

### 1.1 GET `/me/technician/work-orders`
List work orders assigned to currently logged-in technician.

#### Query Params
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | `1` | Pagination page |
| `limit` | number | `20` | Items per page |
| `status` | string | — | `pending`, `assigned`, `in_progress`, `completed`, `cancelled` |
| `priority` | string | — | `critical`, `high`, `medium`, `low` |
| `search` | string | — | Search by vehicle reg, ticket ID, or issue title |

#### Success Response `200`
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": "wo_01HX99AA...",
        "work_order_number": "WO-2026-0042",
        "title": "Screen 2 HDMI Signal Loss & GPS Glitch",
        "priority": "high",
        "status": "assigned",
        "vehicle_id": "veh_01HX...",
        "vehicle_registration": "MP09-CV-4421",
        "depot_name": "Vijay Nagar Depot - Bay 4",
        "assigned_at": "2026-10-10T08:00:00.000Z",
        "created_at": "2026-10-10T07:30:00.000Z"
      }
    ],
    "count": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### 1.2 PATCH `/me/technician/work-orders/:id/status`
Update status of work order with resolution remarks.

#### Request Body
```json
{
  "status": "completed",
  "resolution_notes": "Replaced HDMI ribbon cable and re-crimped GPS antenna lead. Signal lock restored at 14 satellites.",
  "parts_replaced": ["CAB-HDMI-1M", "ANT-GPS-ACTIVE"]
}
```

#### Success Response `200`
```json
{
  "success": true,
  "message": "Work order marked as completed. Awaiting supervisor approval.",
  "data": {
    "id": "wo_01HX99AA...",
    "status": "completed",
    "completed_at": "2026-10-10T10:15:00.000Z"
  }
}
```

---

## 📡 SECTION 2: Edge Devices & IoT Telemetry

### 2.1 GET `/edge-devices/:id/telemetry`
Live telematics heartbeat and system health of vehicle onboard computer.

#### Success Response `200`
```json
{
  "success": true,
  "data": {
    "device_id": "edge_01HX...",
    "serial_number": "VMX-EDGE-8841-A",
    "status": "online",
    "ip_address": "192.168.4.10",
    "cellular_signal_dbm": -68,
    "cellular_network": "Jio 5G",
    "cpu_usage_pct": 24.5,
    "ram_used_mb": 1820,
    "ram_total_mb": 4096,
    "disk_usage_pct": 42.1,
    "temperature_celsius": 48.2,
    "last_heartbeat": "2026-10-10T06:40:12.000Z",
    "active_screens_count": 2,
    "mqtt_connected": true
  }
}
```

---

### 2.2 POST `/edge-devices/:id/reboot`
Send remote command to restart onboard edge unit.

#### Request Body
```json
{
  "reason": "Firmware cache clear and screen restart"
}
```

#### Success Response `200`
```json
{
  "success": true,
  "message": "Reboot command dispatched via MQTT topic edge/VMX-EDGE-8841-A/cmd"
}
```

---

### 2.3 POST `/edge-devices/:id/connectivity-tests`
Test instant network ping latency and cloud connectivity.

#### Request Body
```json
{
  "test_type": "full_diagnostics"
}
```

#### Success Response `200`
```json
{
  "success": true,
  "data": {
    "dns_resolved": true,
    "ping_latency_ms": 32,
    "mqtt_latency_ms": 48,
    "api_ping_ms": 54,
    "packet_loss_pct": 0.0,
    "timestamp": "2026-10-10T06:42:00.000Z"
  }
}
```

---

## 🛰️ SECTION 3: GPS Trackers & Pairing

### 3.1 POST `/gps-devices/:id/assign`
Pair a GPS telematics tracker to a transit vehicle.

#### Request Body
```json
{
  "vehicle_id": "veh_01HX...",
  "mount_location": "Front Dashboard Antenna Mast",
  "installed_by_technician_id": "usr_01HX..."
}
```

#### Success Response `200`
```json
{
  "success": true,
  "message": "GPS device assigned to vehicle MP09-CV-4421. Pending admin approval.",
  "data": {
    "gps_id": "gps_01HX...",
    "vehicle_id": "veh_01HX...",
    "status": "pending_approval"
  }
}
```

### 3.2 POST `/gps-devices`
Register a new GPS telematics hardware unit.

#### Request Body
```json
{
  "device_id": "VMX-GPS-9901",
  "imei": "860123045678901",
  "sim_number": "+919827011999",
  "model": "Teltonika FMB920",
  "device_type": "wired",
  "status": "in_stock"
}
```

---

## 📺 SECTION 4: Digital Transit Displays

### 4.1 GET `/displays/:id/config`
Read screen display configuration, resolution, and brightness schedule.

#### Success Response `200`
```json
{
  "success": true,
  "data": {
    "display_id": "disp_01HX...",
    "resolution": "1920x1080",
    "orientation": "landscape",
    "brightness_day_pct": 95,
    "brightness_night_pct": 50,
    "volume_day_pct": 70,
    "volume_night_pct": 30,
    "screen_position": "behind_driver_partition"
  }
}
```

### 4.2 PATCH `/displays/:id/config`
Update display brightness, audio levels, or schedule.

#### Request Body
```json
{
  "brightness_day_pct": 90,
  "brightness_night_pct": 40,
  "volume_day_pct": 65
}
```

---

## 💻 Standard Frontend Integration

```javascript
// src/api/services/technician.service.js
import apiClient from '../client';

export const technicianService = {
  // My work orders
  getMyWorkOrders: (params) => apiClient.get('/me/technician/work-orders', { params }),
  getMyWorkOrderById: (id) => apiClient.get(`/me/technician/work-orders/${id}`),
  updateMyWorkOrderStatus: (id, data) => apiClient.patch(`/me/technician/work-orders/${id}/status`, data),

  // Edge & Hardware
  getEdgeDevices: (params) => apiClient.get('/edge-devices', { params }),
  getEdgeTelemetry: (id) => apiClient.get(`/edge-devices/${id}/telemetry`),
  rebootEdgeDevice: (id, data) => apiClient.post(`/edge-devices/${id}/reboot`, data),
  testConnectivity: (id, data) => apiClient.post(`/edge-devices/${id}/connectivity-tests`, data),

  // GPS
  getGpsDevices: (params) => apiClient.get('/gps-devices', { params }),
  assignGpsToVehicle: (id, data) => apiClient.post(`/gps-devices/${id}/assign`, data),
};
```

---

## 🔗 Frontend Architecture & File Reference
- **Services:** `src/api/services/technician/` (`technician.service.js`, `device.service.js`)
- **Thunks:** `src/store/thunks/technician/` (`technician.thunks.js`)
- **Slices:** `src/store/slices/technician/` (`technicianSlice.js`)
- **Custom Hooks:** `src/hooks/technician/` (`useTechnician.js`)
- **Pages:** `src/pages/technician/` (`TechnicianDashboard.jsx`, `TechDevicesPage.jsx`, `TechHardwareStatusPage.jsx`, `TechDiagnosticsPage.jsx`)
- **Pagination Component:** `src/components/ui/Pagination.jsx`
- **Integration Blueprint:** See [FRONTEND_INTEGRATION_GUIDE.md](../FRONTEND_INTEGRATION_GUIDE.md)

