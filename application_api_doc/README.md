# VMOVEXA ONE — App Developer API Handoff

Updated: **28 October 2026**. Source: current backend working tree, including recent GPS changes. This package replaces the earlier role documents and their endpoint counts.

## Start here

1. [App developer guide](APP_DEVELOPER_GUIDE.md): API origin, authentication, token refresh, response formats, uploads and request examples.
2. [Complete API reference](API_REFERENCE.md): **430 method/path entries**, including aliases, gateway webhook and health routes; access guards and all **100 route-attached Joi validation schemas**.
3. [Realtime and GPS contract](REALTIME_AND_GPS.md): Socket.IO, MQTT, lock/staleness, hardware configuration and current limitations.
4. [Postman collection](VMOVEXA.postman_collection.json): importable templates for all 430 entries. Set `baseUrl`, `accessToken` and route ID variables. Templates require real payload values before execution.
5. [Controller contract excerpts](CONTROLLER_CONTRACTS.md): exact handler code for field spelling, service forwarding and response branches where available.
6. [Audit and limitations](GAP_ANALYSIS_REPORT.md) and [change notes](CHANGELOG.md).

## Role/module indexes

| Area | Index |
|---|---|
| Authentication and invitations | [auth](roles/auth.md) |
| Fleet, vehicles, drivers, routes, slots and trips | [fleet-manager](roles/fleet-manager.md) |
| Driver self-service | [driver](roles/driver.md) |
| Campaigns, advertiser directory and QR | [advertiser](roles/advertiser.md) |
| Finance, billing and gateway webhook | [finance](roles/finance.md) |
| Devices, GPS trackers, displays and work orders | [technician](roles/technician.md) |
| Government and emergency broadcasts | [government](roles/government.md) |
| Notifications and push | [notifications-websocket](roles/notifications-websocket.md) |
| Users, organizations, approvals, RBAC and administration | [superadmin](roles/superadmin.md) |
| Uploads, content, support, reports, exports and maps | [common-services](roles/common-services.md) |

These are navigation groups. Actual permission middleware and tenant/service checks determine access; a filename does not grant access.

## Integration corrections

- Default origin: `http://localhost:4000`; API prefix: `/api/v1`. A phone must use the actual reachable API origin. Port `5173` serves the frontend development app.
- Errors use `code`, not `error`. Joi validation failures return **422**.
- Standard paginated controllers return `data: []` plus `meta.pagination`; other controllers can wrap nested service results.
- GPS absence means unavailable/searching, never hardcoded coordinates. Edge online status does not establish satellite lock.
- Reboot success acknowledges dispatch; the current core reboot handler logs a no-op and does not reboot Android.
- Permissive/absent schemas and unverified response DTOs are identified explicitly. The package does not invent guarantees that the backend does not enforce.

## Regeneration

From the repository root:

```powershell
node backend/scripts/generate-app-api-docs.js
node backend/scripts/verify-app-api-docs.js
```

The generator evaluates route wiring with inert controller/middleware substitutes and reads real Joi descriptions. It does not start the API, access the database or import `.env` values. Generated files: reference, excerpts, role indexes, Postman, [manifest](route-manifest.json) and [source hashes](source-snapshot.json). Human integration guides require review when behavior changes.

This is a working-tree contract snapshot, not proof that a separate deployed server runs the same code.
