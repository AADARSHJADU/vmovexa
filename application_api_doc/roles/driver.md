# driver API index

Updated: 2026-10-28. 13 route entries. This grouping is navigation only: access is determined by actual permissions and tenant/controller rules, not by this filename. Shared routes can be used by multiple roles.

See [app developer guide](../APP_DEVELOPER_GUIDE.md) and [complete request reference](../API_REFERENCE.md). For realtime events see [REALTIME_AND_GPS.md](../REALTIME_AND_GPS.md).

| Method | Path | Authentication | Request / access details |
|---|---|---|---|
| GET | `/api/v1/me/driver/active-route` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-me-driver-active-route) |
| GET | `/api/v1/me/driver/documents` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-me-driver-documents) |
| POST | `/api/v1/me/driver/documents` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-me-driver-documents) |
| DELETE | `/api/v1/me/driver/documents/:id` | Bearer | [Reference](../API_REFERENCE.md#delete-api-v1-me-driver-documents-id) |
| PATCH | `/api/v1/me/driver/duty-status` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-me-driver-duty-status) |
| GET | `/api/v1/me/driver/incidents` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-me-driver-incidents) |
| POST | `/api/v1/me/driver/incidents` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-me-driver-incidents) |
| GET | `/api/v1/me/driver/incidents/:id` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-me-driver-incidents-id) |
| GET | `/api/v1/me/driver/profile` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-me-driver-profile) |
| GET | `/api/v1/me/driver/schedule` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-me-driver-schedule) |
| POST | `/api/v1/me/driver/trip/end` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-me-driver-trip-end) |
| POST | `/api/v1/me/driver/trip/start` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-me-driver-trip-start) |
| GET | `/api/v1/me/driver/trips` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-me-driver-trips) |
