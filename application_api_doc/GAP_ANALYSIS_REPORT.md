# Documentation audit — 28 October 2026

## Coverage

- Evaluated `backend/src/routes/index.js` with inert dependencies, preserving mounted router paths, registration order and middleware metadata.
- Included the app's webhook mount and three root/health operations separately.
- Extracted **430 unique method/path combinations**, including aliases. Implicit Express HEAD/OPTIONS and static-file mounts are not counted.
- **100 operations have route-attached Joi validation**. Requiredness, enums, defaults, nested fields and cross-field constraints come from `describe()`; several operations share schemas.
- All 10 role indexes and Postman requests use this same route set.
- Controller field reads and exact excerpts supplement schema information. Service rules and ownership checks remain runtime behavior.

## Corrections

| Earlier assumption | Current contract |
|---|---|
| Failure has an `error` field | Failure uses `code` |
| Validation always returns 400 | `VALIDATION_FAILED` maps to 422 |
| All lists have a nested rows shape | Standard paginated controllers return `data: []`, `meta.pagination`; other controllers vary |
| All lists accept arbitrary sort/search filters | Only parameters implemented by that operation are supported |
| Heartbeat establishes GPS lock | Fresh valid position and no later no-fix report are required |
| Reboot dispatch proves physical reboot | Current core handler logs a no-op |
| Generic upload maximum is 15 MB | Actual multer limit is 50 MiB; video is 500 MiB |

## Current implementation limitations

These are code observations, not changes made by this documentation task:

- Many operations have no Joi middleware or allow unknown keys. Services can enforce requirements beyond Joi. No-schema does not mean no parameters.
- Not every response has a declared JSON schema. Excerpts show envelope branches, but related models/service DTOs require test-server verification for critical screens.
- `backend/src/realtime/io.js` defaults missing position satellites to 12 and battery to 94; those values are not measurements.
- MQTT health passes `gpsConnected` to the realtime helper, but the helper does not serialize it. The telemetry model does not persist `gps_connected`; clients cannot rely on that field over REST/Socket.IO in this revision.
- Position/telemetry helpers also use `io.emit`. Room subscriptions alone do not establish tenant-only delivery; realtime authorization needs a separate server audit.
- Core reboot is a no-op. Factory-reset dispatch does not confirm physical completion.
- GPS serial reception, device assignment and satellite lock are independent states. An indoor receiver can report zero visible satellites while MQTT and serial input work.
- `/uploads`, `/storage`, `/logo` and their prefixed static mounts return files, not JSON envelopes.

## Verification boundary

Generation fails on unreviewed route dependencies and duplicate method/path pairs. Package checks cover JSON parsing, counts, relative links, regeneration and representative contracts. This documentation update does not execute production writes, payments, notification sends or a full live API acceptance test.
