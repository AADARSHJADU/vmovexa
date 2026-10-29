# Handoff changes — 28 October 2026

Compared with the earlier hand-maintained package:

- Rebuilt route coverage from current mounted backend routers; 430 unique method/path combinations including aliases, webhooks and health. Replaced stale role endpoint counts with generated indexes.
- Added exact request validation descriptions and permission guard conditions. Added root cross-field constraints and explicit notes for operations without a Joi schema.
- Added a machine-readable route manifest, source hashes, controller excerpts and an importable Postman collection.
- Corrected error envelope (`code`), validation status (422), pagination format and upload sizes.
- Added mobile `X-Client-Type: app`, refresh rotation, MFA branching, token pair fields and nullable numeric data guidance.
- Included current multi-media/target campaign schema, payment aliases, government directory/metadata and emergency approval distinctions via the generated reference.
- Included current device config, assignments, connectivity tests, downloads, provisioning handshake, driver self-service and work-order routes.
- Documented real hardware GPS defaults, raw/no-echo serial initialization, invalid/stale fix handling, 30-second core diagnostic logs and the distinction between device online and GPS fix.
- Documented actual websocket fields, current defaults/missing bridges, global broadcasts, and the current core reboot no-op rather than promising unsupported physical behavior.
- Replaced React-only handoff assumptions with a mobile-friendly guide; kept a concise guide for the existing React application.

No backend business logic or live data was changed by this documentation task. Generated artifacts reflect the current working tree, including uncommitted implementation changes from earlier work in this session.
