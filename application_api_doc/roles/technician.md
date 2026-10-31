# Technician & Hardware NOC Portal — API Documentation

> **Role:** `ROLE-TECHNICIAN` / `ROLE-SUPERADMIN`  
> **Base Path:** `https://api.vmovexa.com/api/v1` (Local: `http://localhost:4000/api/v1`)  
> **Total Endpoints:** 43 APIs (All 100% verified against backend route manifests)  
> **Updated:** 2026-10-31  
> **Hardware Supported:** Edge Compute Boxes (Geniatech APC3588Q / RK3588), GPS Trackers, Bus Displays

See [app developer guide](../APP_DEVELOPER_GUIDE.md) and [complete request reference](../API_REFERENCE.md). For realtime events see [REALTIME_AND_GPS.md](../REALTIME_AND_GPS.md).

---

## 📋 Complete Endpoints Summary (43 APIs)

### 1. Edge Compute Box Hardware (17 APIs)
| Method | Endpoint | Permissions | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/edge-devices` | `devices.view`, `fleet.devices.read`, `devices.gps.manage`, `technician.devices.view`, `technician.hardware-status.view`, `devices.displays.view` | List all edge compute boxes with NOC status | [Reference](../API_REFERENCE.md#get-api-v1-edge-devices) |
| `POST` | `/api/v1/edge-devices` | `devices.register`, `fleet.devices.create` | Register a new edge compute box | [Reference](../API_REFERENCE.md#post-api-v1-edge-devices) |
| `DELETE` | `/api/v1/edge-devices/:id` | `devices.configure`, `fleet.devices.update`, `fleet.devices.assign`, `technician.hardware-config.manage` | Decommission edge compute device | [Reference](../API_REFERENCE.md#delete-api-v1-edge-devices-id) |
| `GET` | `/api/v1/edge-devices/:id` | `devices.view`, `fleet.devices.read`, `devices.gps.manage`, `technician.devices.view`, `technician.hardware-status.view`, `devices.displays.view` | Get single edge box profile | [Reference](../API_REFERENCE.md#get-api-v1-edge-devices-id) |
| `PATCH` | `/api/v1/edge-devices/:id` | `devices.configure`, `fleet.devices.update`, `fleet.devices.assign`, `technician.hardware-config.manage` | Update box metadata, SIM network, or agent version | [Reference](../API_REFERENCE.md#patch-api-v1-edge-devices-id) |
| `POST` | `/api/v1/edge-devices/:id/assign` | `devices.configure`, `fleet.devices.update`, `fleet.devices.assign`, `technician.hardware-config.manage` | Assign edge box to vehicle & depot | [Reference](../API_REFERENCE.md#post-api-v1-edge-devices-id-assign) |
| `GET` | `/api/v1/edge-devices/:id/config` | `devices.view`, `fleet.devices.read`, `devices.gps.manage`, `technician.devices.view`, `technician.hardware-status.view`, `devices.displays.view` | Download display layout & sync schedules for box | [Reference](../API_REFERENCE.md#get-api-v1-edge-devices-id-config) |
| `POST` | `/api/v1/edge-devices/:id/config` | `devices.configure`, `fleet.devices.update`, `fleet.devices.assign`, `technician.hardware-config.manage` | Push updated configuration payload to edge box | [Reference](../API_REFERENCE.md#post-api-v1-edge-devices-id-config) |
| `GET` | `/api/v1/edge-devices/:id/connectivity-tests` | `devices.diagnose`, `devices.configure`, `fleet.devices.update`, `technician.diagnostics.manage`, `technician.connectivity.view` | Fetch historical network connectivity telemetry | [Reference](../API_REFERENCE.md#get-api-v1-edge-devices-id-connectivity-tests) |
| `POST` | `/api/v1/edge-devices/:id/connectivity-tests` | `devices.diagnose`, `devices.configure`, `fleet.devices.update`, `technician.diagnostics.manage`, `technician.connectivity.view` | Run remote latency, RSSI & packet loss probe | [Reference](../API_REFERENCE.md#post-api-v1-edge-devices-id-connectivity-tests) |
| `POST` | `/api/v1/edge-devices/:id/factory-reset` | `devices.diagnose`, `devices.configure`, `fleet.devices.update`, `technician.diagnostics.manage`, `technician.connectivity.view` | Purge cache and factory reset edge box configuration | [Reference](../API_REFERENCE.md#post-api-v1-edge-devices-id-factory-reset) |
| `POST` | `/api/v1/edge-devices/:id/reboot` | `devices.diagnose`, `devices.configure`, `fleet.devices.update`, `technician.diagnostics.manage`, `technician.connectivity.view` | Send remote reboot signal via MQTT command | [Reference](../API_REFERENCE.md#post-api-v1-edge-devices-id-reboot) |
| `GET` | `/api/v1/edge-devices/:id/telemetry` | `devices.view`, `fleet.devices.read`, `devices.gps.manage`, `technician.devices.view`, `technician.hardware-status.view`, `devices.displays.view` | Live CPU, RAM, temperature & storage telemetry | [Reference](../API_REFERENCE.md#get-api-v1-edge-devices-id-telemetry) |
| `PATCH` | `/api/v1/edge-devices/:id/toggle` | `devices.configure`, `fleet.devices.update`, `fleet.devices.assign`, `technician.hardware-config.manage` | Toggle box activation status | [Reference](../API_REFERENCE.md#patch-api-v1-edge-devices-id-toggle) |
| `GET` | `/api/v1/edge-devices/handshake/:boxId` | `devices.view`, `fleet.devices.read`, `devices.gps.manage`, `technician.devices.view`, `technician.hardware-status.view`, `devices.displays.view` | Hardware bootup mutual auth handshake | [Reference](../API_REFERENCE.md#get-api-v1-edge-devices-handshake-boxid) |
| `GET` | `/api/v1/edge-devices/package/download` | `devices.view`, `fleet.devices.read`, `devices.gps.manage`, `technician.devices.view`, `technician.hardware-status.view`, `devices.displays.view` | Download edge agent APK / binary update package | [Reference](../API_REFERENCE.md#get-api-v1-edge-devices-package-download) |
| `GET` | `/api/v1/edge-devices/setup-script` | `devices.view`, `fleet.devices.read`, `devices.gps.manage`, `technician.devices.view`, `technician.hardware-status.view`, `devices.displays.view` | Download shell bootstrap setup script | [Reference](../API_REFERENCE.md#get-api-v1-edge-devices-setup-script) |

### 2. GPS Hardware Tracking Devices (8 APIs)
| Method | Endpoint | Permissions | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/gps-devices` | `devices.view`, `fleet.devices.read`, `devices.gps.manage`, `technician.devices.view`, `technician.hardware-status.view`, `devices.displays.view` | List all GPS devices with network, battery & status | [Reference](../API_REFERENCE.md#get-api-v1-gps-devices) |
| `POST` | `/api/v1/gps-devices` | `fleet.devices.read`, `fleet.devices.create`, `fleet.devices.update`, `fleet.devices.delete`, `fleet.devices.assign`, `devices.register`, `devices.configure`, `devices.gps.manage`, `fleet.gps.manage`, `devices.view`, `technician.gps.manage` | Register a new GPS hardware tracking unit | [Reference](../API_REFERENCE.md#post-api-v1-gps-devices) |
| `DELETE` | `/api/v1/gps-devices/:id` | `fleet.devices.read`, `fleet.devices.create`, `fleet.devices.update`, `fleet.devices.delete`, `fleet.devices.assign`, `devices.register`, `devices.configure`, `devices.gps.manage`, `fleet.gps.manage`, `devices.view`, `technician.gps.manage` | Decommission GPS device | [Reference](../API_REFERENCE.md#delete-api-v1-gps-devices-id) |
| `GET` | `/api/v1/gps-devices/:id` | `devices.view`, `fleet.devices.read`, `devices.gps.manage`, `technician.devices.view`, `technician.hardware-status.view`, `devices.displays.view` | Get GPS unit details & calibration specs | [Reference](../API_REFERENCE.md#get-api-v1-gps-devices-id) |
| `PATCH` | `/api/v1/gps-devices/:id` | `fleet.devices.read`, `fleet.devices.create`, `fleet.devices.update`, `fleet.devices.delete`, `fleet.devices.assign`, `devices.register`, `devices.configure`, `devices.gps.manage`, `fleet.gps.manage`, `devices.view`, `technician.gps.manage` | Update GPS device telemetry settings, SIM or model | [Reference](../API_REFERENCE.md#patch-api-v1-gps-devices-id) |
| `POST` | `/api/v1/gps-devices/:id/approve` | `fleet.devices.read`, `fleet.devices.create`, `fleet.devices.update`, `fleet.devices.delete`, `fleet.devices.assign`, `devices.register`, `devices.configure`, `devices.gps.manage`, `fleet.gps.manage`, `devices.view`, `technician.gps.manage` | Approve GPS hardware installation inspection | [Reference](../API_REFERENCE.md#post-api-v1-gps-devices-id-approve) |
| `POST` | `/api/v1/gps-devices/:id/assign` | `fleet.devices.read`, `fleet.devices.create`, `fleet.devices.update`, `fleet.devices.delete`, `fleet.devices.assign`, `devices.register`, `devices.configure`, `devices.gps.manage`, `fleet.gps.manage`, `devices.view`, `technician.gps.manage` | Assign GPS tracker unit to vehicle | [Reference](../API_REFERENCE.md#post-api-v1-gps-devices-id-assign) |
| `POST` | `/api/v1/gps-devices/:id/reject` | `fleet.devices.read`, `fleet.devices.create`, `fleet.devices.update`, `fleet.devices.delete`, `fleet.devices.assign`, `devices.register`, `devices.configure`, `devices.gps.manage`, `fleet.gps.manage`, `devices.view`, `technician.gps.manage` | Reject GPS hardware installation | [Reference](../API_REFERENCE.md#post-api-v1-gps-devices-id-reject) |

### 3. Bus Screens & Digital Displays (4 APIs)
| Method | Endpoint | Permissions | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/displays` | `devices.view`, `fleet.devices.read`, `devices.gps.manage`, `technician.devices.view`, `technician.hardware-status.view`, `devices.displays.view` | List installed bus screens & HDMI panel health | [Reference](../API_REFERENCE.md#get-api-v1-displays) |
| `POST` | `/api/v1/displays` | `devices.register`, `fleet.devices.create` | Register display screen attached to edge box | [Reference](../API_REFERENCE.md#post-api-v1-displays) |
| `GET` | `/api/v1/displays/:id/config` | `devices.view`, `fleet.devices.read`, `devices.gps.manage`, `technician.devices.view`, `technician.hardware-status.view`, `devices.displays.view` | Get screen resolution & aspect ratio configuration | [Reference](../API_REFERENCE.md#get-api-v1-displays-id-config) |
| `PATCH` | `/api/v1/displays/:id/config` | `devices.displays.manage`, `fleet.devices.update` | Update display layout, rotation & zones | [Reference](../API_REFERENCE.md#patch-api-v1-displays-id-config) |

### 4. Technician Self-Service Portal (4 APIs)
| Method | Endpoint | Permissions | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/me/technician/stats` | `work_orders.view`, `technician.devices.view` | Field metrics (assigned, resolved, pending tickets) | [Reference](../API_REFERENCE.md#get-api-v1-me-technician-stats) |
| `GET` | `/api/v1/me/technician/work-orders` | `work_orders.view`, `technician.devices.view` | List tickets assigned to logged-in technician | [Reference](../API_REFERENCE.md#get-api-v1-me-technician-work-orders) |
| `GET` | `/api/v1/me/technician/work-orders/:id` | `work_orders.view`, `technician.devices.view` | Get ticket details with vehicle & hardware location | [Reference](../API_REFERENCE.md#get-api-v1-me-technician-work-orders-id) |
| `PATCH` | `/api/v1/me/technician/work-orders/:id/status` | `work_orders.update`, `technician.devices.view` | Update field maintenance ticket status with resolution notes | [Reference](../API_REFERENCE.md#patch-api-v1-me-technician-work-orders-id-status) |

### 5. Maintenance Tickets & Work Orders (10 APIs)
| Method | Endpoint | Permissions | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/work-orders` | `work_orders.view` | List maintenance tickets across fleet | [Reference](../API_REFERENCE.md#get-api-v1-work-orders) |
| `POST` | `/api/v1/work-orders` | `work_orders.create`, `work_orders.assign` | Create new maintenance work order | [Reference](../API_REFERENCE.md#post-api-v1-work-orders) |
| `GET` | `/api/v1/work-orders/:id` | `work_orders.view` | Get ticket details with diagnosed faults | [Reference](../API_REFERENCE.md#get-api-v1-work-orders-id) |
| `PATCH` | `/api/v1/work-orders/:id` | `work_orders.create`, `work_orders.edit`, `work_orders.update`, `work_orders.assign` | Update ticket priority, vehicle, or description | [Reference](../API_REFERENCE.md#patch-api-v1-work-orders-id) |
| `PATCH` | `/api/v1/work-orders/:id/approve` | `work_orders.assign` | Supervisor approve completed maintenance | [Reference](../API_REFERENCE.md#patch-api-v1-work-orders-id-approve) |
| `PATCH` | `/api/v1/work-orders/:id/assign` | `work_orders.assign` | Assign field technician to maintenance ticket | [Reference](../API_REFERENCE.md#patch-api-v1-work-orders-id-assign) |
| `POST` | `/api/v1/work-orders/:id/rate` | `work_orders.view` | Rate technician repair quality & add feedback tags | [Reference](../API_REFERENCE.md#post-api-v1-work-orders-id-rate) |
| `PATCH` | `/api/v1/work-orders/:id/reject` | `work_orders.assign` | Supervisor reject repair with remediation notes | [Reference](../API_REFERENCE.md#patch-api-v1-work-orders-id-reject) |
| `PATCH` | `/api/v1/work-orders/:id/status` | `work_orders.update`, `work_orders.assign` | Transition ticket status (in_progress, on_hold, completed) | [Reference](../API_REFERENCE.md#patch-api-v1-work-orders-id-status) |
| `POST` | `/api/v1/work-orders/dispatch` | `work_orders.assign` | Atomic create + assign work order with SLA & technician | [Reference](../API_REFERENCE.md#post-api-v1-work-orders-dispatch) |

---

## 🔧 Hardware NOC Telemetry & Protocols

### 1. Edge Box MQTT Architecture
- Geniatech APC3588Q edge compute boxes connect over MQTT broker with mutual TLS.
- Remote commands (`reboot`, `factory-reset`, `config-push`) are published directly to the device topic.

### 2. Work Order Dispatch Pipeline
- `POST /api/v1/work-orders/dispatch`: Creates and assigns a repair task in a single atomic transaction with SLA hours and ETA. [Contract](../CONTROLLER_CONTRACTS.md#post-api-v1-work-orders-dispatch)

