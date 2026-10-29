# technician API index

Updated: 2026-10-28. 42 route entries. This grouping is navigation only: access is determined by actual permissions and tenant/controller rules, not by this filename. Shared routes can be used by multiple roles.

See [app developer guide](../APP_DEVELOPER_GUIDE.md) and [complete request reference](../API_REFERENCE.md). For realtime events see [REALTIME_AND_GPS.md](../REALTIME_AND_GPS.md).

| Method | Path | Authentication | Request / access details |
|---|---|---|---|
| GET | `/api/v1/displays` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-displays) |
| POST | `/api/v1/displays` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-displays) |
| GET | `/api/v1/displays/:id/config` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-displays-id-config) |
| PATCH | `/api/v1/displays/:id/config` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-displays-id-config) |
| GET | `/api/v1/edge-devices` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-edge-devices) |
| POST | `/api/v1/edge-devices` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-edge-devices) |
| DELETE | `/api/v1/edge-devices/:id` | Bearer | [Reference](../API_REFERENCE.md#delete-api-v1-edge-devices-id) |
| GET | `/api/v1/edge-devices/:id` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-edge-devices-id) |
| PATCH | `/api/v1/edge-devices/:id` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-edge-devices-id) |
| POST | `/api/v1/edge-devices/:id/assign` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-edge-devices-id-assign) |
| GET | `/api/v1/edge-devices/:id/config` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-edge-devices-id-config) |
| POST | `/api/v1/edge-devices/:id/config` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-edge-devices-id-config) |
| GET | `/api/v1/edge-devices/:id/connectivity-tests` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-edge-devices-id-connectivity-tests) |
| POST | `/api/v1/edge-devices/:id/connectivity-tests` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-edge-devices-id-connectivity-tests) |
| POST | `/api/v1/edge-devices/:id/factory-reset` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-edge-devices-id-factory-reset) |
| POST | `/api/v1/edge-devices/:id/reboot` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-edge-devices-id-reboot) |
| GET | `/api/v1/edge-devices/:id/telemetry` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-edge-devices-id-telemetry) |
| PATCH | `/api/v1/edge-devices/:id/toggle` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-edge-devices-id-toggle) |
| GET | `/api/v1/edge-devices/handshake/:boxId` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-edge-devices-handshake-boxid) |
| GET | `/api/v1/edge-devices/package/download` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-edge-devices-package-download) |
| GET | `/api/v1/edge-devices/setup-script` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-edge-devices-setup-script) |
| GET | `/api/v1/gps-devices` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-gps-devices) |
| POST | `/api/v1/gps-devices` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-gps-devices) |
| DELETE | `/api/v1/gps-devices/:id` | Bearer | [Reference](../API_REFERENCE.md#delete-api-v1-gps-devices-id) |
| GET | `/api/v1/gps-devices/:id` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-gps-devices-id) |
| PATCH | `/api/v1/gps-devices/:id` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-gps-devices-id) |
| POST | `/api/v1/gps-devices/:id/approve` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-gps-devices-id-approve) |
| POST | `/api/v1/gps-devices/:id/assign` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-gps-devices-id-assign) |
| POST | `/api/v1/gps-devices/:id/reject` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-gps-devices-id-reject) |
| GET | `/api/v1/me/technician/stats` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-me-technician-stats) |
| GET | `/api/v1/me/technician/work-orders` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-me-technician-work-orders) |
| GET | `/api/v1/me/technician/work-orders/:id` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-me-technician-work-orders-id) |
| PATCH | `/api/v1/me/technician/work-orders/:id/status` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-me-technician-work-orders-id-status) |
| GET | `/api/v1/work-orders` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-work-orders) |
| POST | `/api/v1/work-orders` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-work-orders) |
| GET | `/api/v1/work-orders/:id` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-work-orders-id) |
| PATCH | `/api/v1/work-orders/:id` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-work-orders-id) |
| PATCH | `/api/v1/work-orders/:id/approve` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-work-orders-id-approve) |
| PATCH | `/api/v1/work-orders/:id/assign` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-work-orders-id-assign) |
| POST | `/api/v1/work-orders/:id/rate` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-work-orders-id-rate) |
| PATCH | `/api/v1/work-orders/:id/reject` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-work-orders-id-reject) |
| PATCH | `/api/v1/work-orders/:id/status` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-work-orders-id-status) |
