# fleet-manager API index

Updated: 2026-10-28. 79 route entries. This grouping is navigation only: access is determined by actual permissions and tenant/controller rules, not by this filename. Shared routes can be used by multiple roles.

See [app developer guide](../APP_DEVELOPER_GUIDE.md) and [complete request reference](../API_REFERENCE.md). For realtime events see [REALTIME_AND_GPS.md](../REALTIME_AND_GPS.md).

| Method | Path | Authentication | Request / access details |
|---|---|---|---|
| GET | `/api/v1/depots` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-depots) |
| POST | `/api/v1/depots` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-depots) |
| DELETE | `/api/v1/depots/:id` | Bearer | [Reference](../API_REFERENCE.md#delete-api-v1-depots-id) |
| GET | `/api/v1/depots/:id` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-depots-id) |
| PATCH | `/api/v1/depots/:id` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-depots-id) |
| PUT | `/api/v1/depots/:id` | Bearer | [Reference](../API_REFERENCE.md#put-api-v1-depots-id) |
| GET | `/api/v1/drivers` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-drivers) |
| POST | `/api/v1/drivers` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-drivers) |
| DELETE | `/api/v1/drivers/:id` | Bearer | [Reference](../API_REFERENCE.md#delete-api-v1-drivers-id) |
| GET | `/api/v1/drivers/:id` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-drivers-id) |
| PATCH | `/api/v1/drivers/:id` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-drivers-id) |
| PUT | `/api/v1/drivers/:id` | Bearer | [Reference](../API_REFERENCE.md#put-api-v1-drivers-id) |
| PATCH | `/api/v1/drivers/:id/approve` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-drivers-id-approve) |
| PATCH | `/api/v1/drivers/:id/assign-bus` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-drivers-id-assign-bus) |
| GET | `/api/v1/drivers/:id/documents` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-drivers-id-documents) |
| PATCH | `/api/v1/drivers/:id/reject` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-drivers-id-reject) |
| PATCH | `/api/v1/drivers/:id/status` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-drivers-id-status) |
| PATCH | `/api/v1/drivers/:id/verify-documents` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-drivers-id-verify-documents) |
| GET | `/api/v1/fleets` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-fleets) |
| POST | `/api/v1/fleets` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-fleets) |
| DELETE | `/api/v1/fleets/:id` | Bearer | [Reference](../API_REFERENCE.md#delete-api-v1-fleets-id) |
| GET | `/api/v1/fleets/:id` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-fleets-id) |
| PATCH | `/api/v1/fleets/:id` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-fleets-id) |
| PUT | `/api/v1/fleets/:id` | Bearer | [Reference](../API_REFERENCE.md#put-api-v1-fleets-id) |
| PATCH | `/api/v1/fleets/:id/approve` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-fleets-id-approve) |
| POST | `/api/v1/fleets/:id/assign-vehicle` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-fleets-id-assign-vehicle) |
| PATCH | `/api/v1/fleets/:id/reject` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-fleets-id-reject) |
| POST | `/api/v1/fleets/:id/unassign-vehicle` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-fleets-id-unassign-vehicle) |
| GET | `/api/v1/fleets/quotas` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-fleets-quotas) |
| GET | `/api/v1/incidents` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-incidents) |
| POST | `/api/v1/incidents` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-incidents) |
| DELETE | `/api/v1/incidents/:id` | Bearer | [Reference](../API_REFERENCE.md#delete-api-v1-incidents-id) |
| GET | `/api/v1/incidents/:id` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-incidents-id) |
| PATCH | `/api/v1/incidents/:id` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-incidents-id) |
| PUT | `/api/v1/incidents/:id` | Bearer | [Reference](../API_REFERENCE.md#put-api-v1-incidents-id) |
| PATCH | `/api/v1/incidents/:id/resolution` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-incidents-id-resolution) |
| PATCH | `/api/v1/incidents/:id/status` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-incidents-id-status) |
| GET | `/api/v1/routes` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-routes) |
| POST | `/api/v1/routes` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-routes) |
| DELETE | `/api/v1/routes/:id` | Bearer | [Reference](../API_REFERENCE.md#delete-api-v1-routes-id) |
| GET | `/api/v1/routes/:id` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-routes-id) |
| PATCH | `/api/v1/routes/:id` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-routes-id) |
| PUT | `/api/v1/routes/:id` | Bearer | [Reference](../API_REFERENCE.md#put-api-v1-routes-id) |
| POST | `/api/v1/routes/:id/approve` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-routes-id-approve) |
| POST | `/api/v1/routes/:id/assign-vehicle` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-routes-id-assign-vehicle) |
| POST | `/api/v1/routes/:id/reject` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-routes-id-reject) |
| GET | `/api/v1/routes/:id/vehicles` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-routes-id-vehicles) |
| DELETE | `/api/v1/routes/assignments/:id` | Bearer | [Reference](../API_REFERENCE.md#delete-api-v1-routes-assignments-id) |
| POST | `/api/v1/routes/assignments/:id/approve` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-routes-assignments-id-approve) |
| POST | `/api/v1/routes/assignments/:id/reject` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-routes-assignments-id-reject) |
| GET | `/api/v1/trips` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-trips) |
| POST | `/api/v1/trips` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-trips) |
| DELETE | `/api/v1/trips/:id` | Bearer | [Reference](../API_REFERENCE.md#delete-api-v1-trips-id) |
| GET | `/api/v1/trips/:id` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-trips-id) |
| PATCH | `/api/v1/trips/:id` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-trips-id) |
| PUT | `/api/v1/trips/:id` | Bearer | [Reference](../API_REFERENCE.md#put-api-v1-trips-id) |
| PATCH | `/api/v1/trips/:id/end` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-trips-id-end) |
| GET | `/api/v1/vehicle-slots` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-vehicle-slots) |
| POST | `/api/v1/vehicle-slots` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-vehicle-slots) |
| DELETE | `/api/v1/vehicle-slots/:id` | Bearer | [Reference](../API_REFERENCE.md#delete-api-v1-vehicle-slots-id) |
| GET | `/api/v1/vehicle-slots/:id` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-vehicle-slots-id) |
| PATCH | `/api/v1/vehicle-slots/:id` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-vehicle-slots-id) |
| PUT | `/api/v1/vehicle-slots/:id` | Bearer | [Reference](../API_REFERENCE.md#put-api-v1-vehicle-slots-id) |
| POST | `/api/v1/vehicle-slots/check-conflict` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-vehicle-slots-check-conflict) |
| GET | `/api/v1/vehicle-slots/timetable/grid` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-vehicle-slots-timetable-grid) |
| GET | `/api/v1/vehicles` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-vehicles) |
| POST | `/api/v1/vehicles` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-vehicles) |
| DELETE | `/api/v1/vehicles/:id` | Bearer | [Reference](../API_REFERENCE.md#delete-api-v1-vehicles-id) |
| GET | `/api/v1/vehicles/:id` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-vehicles-id) |
| PATCH | `/api/v1/vehicles/:id` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-vehicles-id) |
| PUT | `/api/v1/vehicles/:id` | Bearer | [Reference](../API_REFERENCE.md#put-api-v1-vehicles-id) |
| PATCH | `/api/v1/vehicles/:id/approve` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-vehicles-id-approve) |
| PATCH | `/api/v1/vehicles/:id/assign-driver` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-vehicles-id-assign-driver) |
| PATCH | `/api/v1/vehicles/:id/assign-gps` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-vehicles-id-assign-gps) |
| GET | `/api/v1/vehicles/:id/documents` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-vehicles-id-documents) |
| PATCH | `/api/v1/vehicles/:id/documents/:docId/approve` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-vehicles-id-documents-docid-approve) |
| PATCH | `/api/v1/vehicles/:id/documents/:docId/reject` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-vehicles-id-documents-docid-reject) |
| PATCH | `/api/v1/vehicles/:id/reject` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-vehicles-id-reject) |
| GET | `/api/v1/vehicles/:id/telemetry` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-vehicles-id-telemetry) |
