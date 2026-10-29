# App developer integration guide

Contract snapshot: 28 October 2026. Use [API_REFERENCE.md](API_REFERENCE.md) for exact methods, permissions and validation. All IDs below are illustrative; obtain actual IDs from the appropriate list/detail API.

## Origin, headers and data representation

Default server origin is `http://localhost:4000`, and `API_PREFIX` defaults to `/api/v1`. Configure the origin per environment. On a physical mobile device, `localhost` addresses that phone, so use the reachable backend host. The UI development port `5173` is not the API origin.

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
X-Client-Type: app
```

Send the client-type header on login, refresh and session-related operations; controller session context treats only the exact value `app` as an app client. Omit JSON content type for multipart and let the HTTP library add the boundary. Use the server's configured HTTPS origin in production.

Request field casing is endpoint-specific. Some endpoints accept camelCase and snake_case aliases; others do not. Database response fields often use snake_case, while websocket payloads use camelCase. DECIMAL database columns may serialize as strings: explicitly parse numeric values without converting `null` or `""` into zero. UTC ISO timestamps should be converted only for display. Do not substitute the phone's clock for a position's recorded timestamp.

## Authentication, MFA and refresh

Email login:

```http
POST /api/v1/auth/login-email
```

```json
{"email":"developer@example.com","password":"<actual account password>"}
```

Phone login uses `POST /auth/login-phone` with `phone` and `password`. See the exact Indian phone validator in the reference.

Login may return either a normal result containing `tokens` or an MFA challenge in `data`:

```json
{"mfaRequired":true,"identifier":"<server-provided identifier>"}
```

If challenged, call `POST /auth/verify-otp` with `{"identifier":"...","code":"123456"}`. Preserve OTP as a string. Do not treat the MFA challenge as an authenticated session. Development responses can include `devCode`; this is not a production OTP acquisition mechanism.

Token-pair fields from the token service:

```json
{
  "accessToken":"<JWT>",
  "refreshToken":"<opaque refresh token>",
  "tokenType":"Bearer",
  "accessTokenExpiresIn":900,
  "refreshTokenExpiresAt":"2026-11-04T00:00:00.000Z"
}
```

The example lifetime is the default: access TTL defaults to 15 minutes and refresh TTL to 7 days; deployment settings can override both. Login result contains `data.tokens`; inspect the login controller/service result for other user/role fields. Fetch `GET /auth/me` to hydrate the current profile, role and permissions.

Refresh:

```http
POST /api/v1/auth/refresh
```

```json
{"refreshToken":"<current refresh token>"}
```

Response is the normal success envelope with `data.tokens`. Refresh rotates the opaque refresh token. Replace both stored tokens atomically. Use one in-flight refresh request: reuse of a revoked token revokes its token family. On failed refresh, return to login. Do not automatically retry non-idempotent writes after a network timeout without establishing whether they succeeded.

`POST /auth/logout` accepts an optional `refreshToken` and revokes it if supplied. Logout has no requireAuth guard in current wiring; local app session data must also be cleared. Password reset uses `email`, six-character `code` and `newPassword`; new-password policy is at least eight characters with an uppercase letter, digit and special character.

## Standard responses

Success (normally 200, create helper 201):

```json
{
  "success":true,
  "message":"OK",
  "data":{"id":1},
  "meta":{"requestId":"<request correlation id>"}
}
```

Failure:

```json
{
  "success":false,
  "code":"VALIDATION_FAILED",
  "message":"Validation failed.",
  "errors":[{"in":"body","field":"boxId","message":"\"boxId\" is required"}],
  "meta":{"requestId":"<request correlation id>"}
}
```

Use `code` for stable application branching and `message` for display. Joi middleware uses `abortEarly:false`, `convert:true`, `stripUnknown:true`. A schema's `.unknown(true)` explicitly permits additional keys, but does not promise they are saved. Schema defaults and allowed nulls are recorded in the reference/manifest. Service checks can impose additional constraints.

| HTTP | Common codes / app behavior |
|---|---|
| 401 | Invalid credentials, invalid/expired token, invalid OTP; refresh only when appropriate |
| 402 | Subscription/payment required; display the returned code/message |
| 403 | Permission, tenant, onboarding or subscription restriction; do not retry as a network error |
| 404 | Record not found or hidden by scope |
| 409 | Duplicate/conflicting state; reload affected data |
| 422 | Validation failed; associate `errors[].field` with inputs |
| 423 | Account locked |
| 429 | Rate/quota limited; respect retry/rate-limit headers |
| 500/502/503/504 | Server/gateway failure; preserve requestId for support |

See [ERROR_CODES.json](ERROR_CODES.json) for the exact code/status catalog.

## Pagination and query filters

The shared pagination helper defaults to `page=1`, `limit=20`, maximum `limit=100`.

```http
GET /api/v1/edge-devices?page=1&limit=20
```

Standard `apiResponse.paginated` shape:

```json
{
  "success":true,
  "message":"OK",
  "data":[{"id":1}],
  "meta":{
    "requestId":"<id>",
    "pagination":{"page":1,"limit":20,"total":1,"totalPages":1}
  }
}
```

Some controllers use `success` around a service object instead. Check controller excerpts before choosing a decoder. `search`, `status`, `sortBy`, organization filters and date filters are not universal; only send fields supported by that module. Do not infer requiredness from an observed controller read alone.

## Roles, tenancy and ownership

Protected endpoints require Bearer authentication. The reference lists route-level permission conditions as `any one` or `all`. Additional controller/service ownership restrictions can still apply. Backend middleware currently bypasses permission checks for administrative roles and, on scoped routes, `req.isPlatformScope`; this is backend behavior, not a client-side authorization substitute.

Tenant scope derives from JWT organization context. Explicit organization filters do not grant cross-tenant access. Driver self-service resolves a linked driver; technician self-service resolves assigned work orders. Hide actions using resolved permissions, but still handle server 403s.

## Device workflow and examples

Register an edge box using the physical serial as `boxId`:

```http
POST /api/v1/edge-devices
```

```json
{"boxId":"<physical hardware serial>","vehicleId":1,"mac":"<device MAC>"}
```

Then retrieve `GET /edge-devices/:id`, telemetry at `GET /edge-devices/:id/telemetry`, and the provisioning monitor at `GET /edge-devices/handshake/:boxId`. The handshake response can return `isRegistered:false` for an unknown box, rather than treating it as a transport error.

```http
POST /api/v1/edge-devices/1/assign
```

```json
{"vehicleId":2}
```

Assignment accepts `vehicleId` or `vehicle_id`. Toggle uses `PATCH /edge-devices/:id/toggle` with `isActive` or `is_active`. Configuration is wrapped:

```http
POST /api/v1/edge-devices/1/config
```

```json
{"config":{"brightness":55,"isMuted":true}}
```

Fetch persisted/default config with `GET /edge-devices/:id/config`. Reboot and factory reset are `POST /edge-devices/:id/reboot` and `POST /edge-devices/:id/factory-reset`; they take no required Joi body in current routing. Their success indicates server dispatch, not physical completion. The current core reboot branch logs a no-op.

GPS-device record management uses `/gps-devices`; approval and rejection use **POST**, while vehicle GPS assignment uses **PATCH** `/vehicles/:id/assign-gps` with `gpsDeviceId`. Tracker registration/approval is independent of whether the receiver has a valid fix. See [REALTIME_AND_GPS.md](REALTIME_AND_GPS.md).

## Driver and technician app flows

Driver entry points are `/me/driver/profile`, `/schedule`, `/active-route`, `/trips`, `/documents` and `/incidents`. Use `/me/driver/duty-status` with `{"status":"on_duty"}`, `off_duty` or `available`. Trip start is `POST /me/driver/trip/start` with optional `slotId`/`forceNew`; trip end is `POST /me/driver/trip/end` with optional `tripId`, `slotId`, `covered_km` as specified in the schema. Services decide whether the selected slot/trip is actionable.

Incident creation requires `incidentType`; supports description, severity, media URL arrays, casualty fields and latitude/longitude aliases as shown in its schema. Upload media first; do not embed binary files in the JSON incident payload.

Technicians use `/me/technician/stats`, `/me/technician/work-orders` and `/me/technician/work-orders/:id`. Status updates use PATCH on `.../:id/status` with `status` and optional `resolutionNotes`. Valid status values include submitted, approved, dispatched, on_site, resolved, closed and rejected; service transition/ownership checks still apply.

## Campaigns, payments and emergency flow

Create/update schemas include media arrays, multiple targets/slots, dates, active days, broadcast windows, targeting, payment breakdown and owner type. See the current schema rather than an older minimal campaign payload. Some fields are optional in Joi but constrained further in services.

Available action endpoints include submit, approve, reject, verify, pay, pay/confirm, record-offline-payment, start, stop, pause, end and complete. Use action routes and returned state; do not assume that sending a free-form `status` skips approval/payment checks. `pause` currently delegates to the stop handler and `complete` to the end handler. Payment confirmation also has `/confirm-payment` alias.

Public checkout endpoints have no Bearer requirement but use a secret payment link token. In particular, `/campaigns/:id/public-checkout` reads query `token`; preserve server-issued payment URLs. Inspect each public handler for token placement instead of treating these operations as unrestricted. Public invoice returns HTML. Gateway webhooks are server-to-server and require the exact raw body for signature validation; mobile clients should not call webhooks to claim payment success.

Emergency submission/manage permission differs from live approval permission: approval/rejection requires `campaigns.approve` or `platform.broadcast` in route wiring. A submitted broadcast is not automatically live.

## Uploads, downloads and non-JSON endpoints

| Operation | Request/response |
|---|---|
| POST `/uploads` | multipart `file`; optional `purpose`; maximum 50 MiB |
| POST `/uploads/document` | multipart `file`, optional `entityType`, `entityId`, `purpose`; maximum 50 MiB |
| POST `/uploads/video` | multipart `video`; maximum 500 MiB; MP4, WebM, Ogg, QuickTime, AVI, Matroska MIME types |
| DELETE `/uploads/document/:id` | `uploads.manage`; removes the asset/storage record where implemented |
| GET `/edge-devices/package/download` | ZIP binary; download to file, not a JSON decoder |
| GET `/edge-devices/setup-script` | `text/x-shellscript`; text download |
| GET `/campaigns/:id/public-invoice` | HTML invoice |
| POST `/webhooks/:gateway` | raw gateway payload and signature verification |

For generic upload, `data` includes `url`, `key`, `fileName`, `fileType`, `fileSize`, `checksum`; document response also includes `id`, `purpose`, `entityType` and is not guaranteed to include checksum. Store the returned URL/asset ID appropriate to the target entity.

Static paths `/uploads`, `/storage`, `/logo` and prefixed aliases serve content. Resolve relative URLs against the API origin. Proxy/body-size limits may be lower than application upload limits.

## Rates, health and Postman

JSON parser limit is 2 MB. General versioned API limiter is 300 requests/minute. Auth limiter is 10/minute outside `NODE_ENV=development` and 1000/minute in development. Gateway webhooks and root health endpoints are mounted before the general limiter. Quotas and gateway limits are separate.

`GET /health` is liveness. `GET /health/ready` is 200 when DB readiness succeeds or 503 when it fails; Redis is reported but optional for readiness. The readiness handler still uses a success envelope even at HTTP 503: inspect HTTP status and `data.ready`. Swagger UI `/api/docs` and spec `/api/docs.json` exist only when enabled and may not cover every current route.

Import `VMOVEXA.postman_collection.json`. `baseUrl` is origin only (no `/api/v1` suffix), because paths already include the prefix. Set `accessToken` without `Bearer`. Set `id`, `boxId`, `code` and other placeholder variables when needed. Generated bodies include required schema fields only and can contain `<replace>`; add other service-required fields using the reference/excerpts. The collection is a template, not an automatic test suite.
