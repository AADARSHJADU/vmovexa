# government API index

Updated: 2026-10-28. 21 route entries. This grouping is navigation only: access is determined by actual permissions and tenant/controller rules, not by this filename. Shared routes can be used by multiple roles.

See [app developer guide](../APP_DEVELOPER_GUIDE.md) and [complete request reference](../API_REFERENCE.md). For realtime events see [REALTIME_AND_GPS.md](../REALTIME_AND_GPS.md).

| Method | Path | Authentication | Request / access details |
|---|---|---|---|
| GET | `/api/v1/emergency-broadcasts` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-emergency-broadcasts) |
| POST | `/api/v1/emergency-broadcasts` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-emergency-broadcasts) |
| DELETE | `/api/v1/emergency-broadcasts/:id` | Bearer | [Reference](../API_REFERENCE.md#delete-api-v1-emergency-broadcasts-id) |
| GET | `/api/v1/emergency-broadcasts/:id` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-emergency-broadcasts-id) |
| PATCH | `/api/v1/emergency-broadcasts/:id` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-emergency-broadcasts-id) |
| PUT | `/api/v1/emergency-broadcasts/:id` | Bearer | [Reference](../API_REFERENCE.md#put-api-v1-emergency-broadcasts-id) |
| POST | `/api/v1/emergency-broadcasts/:id/approve` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-emergency-broadcasts-id-approve) |
| POST | `/api/v1/emergency-broadcasts/:id/reject` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-emergency-broadcasts-id-reject) |
| POST | `/api/v1/emergency-broadcasts/:id/revoke` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-emergency-broadcasts-id-revoke) |
| GET | `/api/v1/government` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-government) |
| POST | `/api/v1/government` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-government) |
| DELETE | `/api/v1/government/:id` | Bearer | [Reference](../API_REFERENCE.md#delete-api-v1-government-id) |
| GET | `/api/v1/government/:id` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-government-id) |
| PATCH | `/api/v1/government/:id` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-government-id) |
| PUT | `/api/v1/government/:id` | Bearer | [Reference](../API_REFERENCE.md#put-api-v1-government-id) |
| PATCH | `/api/v1/government/:id/status` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-government-id-status) |
| GET | `/api/v1/government/analytics` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-government-analytics) |
| GET | `/api/v1/government/clearance-levels` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-government-clearance-levels) |
| GET | `/api/v1/government/department-categories` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-government-department-categories) |
| GET | `/api/v1/government/jurisdictions` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-government-jurisdictions) |
| GET | `/api/v1/government/meta/options` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-government-meta-options) |
