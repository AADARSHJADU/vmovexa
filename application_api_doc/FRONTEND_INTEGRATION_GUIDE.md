# Frontend and mobile integration

Updated 28 October 2026. Read [APP_DEVELOPER_GUIDE.md](APP_DEVELOPER_GUIDE.md), [API_REFERENCE.md](API_REFERENCE.md) and [REALTIME_AND_GPS.md](REALTIME_AND_GPS.md) for the backend contract. React conventions below do not apply as requirements on native mobile clients.

## Existing React app

```text
Page -> domain hook -> Redux thunk -> API service -> apiClient -> backend
```

Use `frontend/src/api/client.js` and endpoint builders in `frontend/src/api/endpoints.js`. Services extract envelopes, thunks manage async state, and hooks expose actions to pages. Reuse shared pagination, loading/empty/error states and existing UI components. Avoid adding a competing refresh mechanism.

## Envelope handling

```javascript
// apiResponse.paginated:
const rows = response.data.data;
const pagination = response.data.meta.pagination;

// Standard error:
const code = error.response?.data?.code;
const message = error.response?.data?.message;
const fields = error.response?.data?.errors ?? [];
```

Some `apiResponse.success` handlers return a service object such as `{ rows, meta }`; do not apply array extraction to every operation. Downloads, invoice HTML and shell scripts require the correct response type.

## Native mobile app

Use one configurable API origin and prefix. Send `X-Client-Type: app` for authentication/session operations. Store token pairs securely and serialize refresh calls. Model nullable telemetry explicitly; UI defaults must not manufacture GPS values.

Use the documented HTTP verb: reboot is `POST /edge-devices/:id/reboot`, config is `POST /edge-devices/:id/config`, GPS approval is `POST /gps-devices/:id/approve` (all under `/api/v1`).

Keep one complete `DEVICES` object in endpoint configuration. A duplicate object previously overwrote action builders including `EDGE_REBOOT`.

## Developer acceptance checks

Against a test environment and intended role, verify login/MFA, refresh rotation, 401/403/422 handling, pagination, create/update, file upload and GPS no-fix behavior. A successful queued command does not prove the hardware action completed.
