# Realtime, MQTT and GPS contract

Updated 28 October 2026. Sources: `backend/src/realtime/index.js`, `realtime/io.js`, `mqtt/handlers.js`, device service, and current core GPS reader.

## Socket.IO connection

Use a Socket.IO client compatible with server v4, not a raw WebSocket JSON client. Origin is the backend origin, path `/socket.io` (outside `/api/v1`). Handshake accepts `auth.token`, with query-token fallback in current implementation.

```javascript
const socket = io(API_ORIGIN, {
  path: '/socket.io',
  auth: { token: accessToken }
});
socket.on('connect_error', handleConnectionError);
socket.emit('subscribe:vehicle', vehicleId);
socket.on('vehicle:position', handlePosition);
socket.on('device:telemetry', handleTelemetry);
// On cleanup:
socket.emit('unsubscribe:vehicle', vehicleId);
socket.off('vehicle:position', handlePosition);
socket.off('device:telemetry', handleTelemetry);
```

On connect the server joins user, organization or platform rooms according to JWT context. Vehicle and ticket subscribe/unsubscribe handlers take an ID directly. The current implementation also broadcasts position/telemetry globally; room membership alone is not an isolation guarantee. Reconnect with the updated token after token refresh.

## GPS position event

`vehicle:position` payload:

```json
{
  "boxId":"<hardware serial>",
  "vehicleId":1,
  "lat":22.7,
  "lng":75.8,
  "speed":0,
  "heading":0,
  "satellites":8,
  "battery":94,
  "at":"2026-10-28T10:00:00.000Z"
}
```

Coordinates above are illustrative, not a device's measured location. Speed is km/h and heading degrees. `at` is serialized by the helper from `recordedAt`. Server throttle is approximately one event/second per box/vehicle key. Current missing-value fallbacks are satellites 12 and battery 94; do not treat fallback battery/satellite data as measurement. Hardware core also currently supplies constant battery 100 on GPS location objects.

Handlers may receive the same position through global and room delivery. Deduplicate by boxId/vehicleId plus timestamp and coordinates. Match the selected edge box first; do not mix telemetry between different devices assigned to one vehicle.

## Device health event

`device:telemetry` fields: `boxId`, `deviceId`, `socTemp`, `cpuUsage`, `ramUsage`, `storageFree`, `connectedScreens`, `gpsLocked`, `satellitesCount`, `signalDbm`, `ts`. Some fields may be absent/null in hardware mode; core does not fabricate unavailable thermals in that mode.

The handler currently passes `gpsConnected`, but `emitDeviceTelemetry` does not accept/serialize it. The telemetry model does not persist `gps_connected`. App logic must work without that field until the backend contract is extended.

## REST GPS state

`GET /api/v1/edge-devices/:id` includes `telemetry` (at most the latest associated record) and `latestGps`. Historical coordinates may remain in the database. `latestGps.is_stale=true` or `latestGps.gps_locked=false` means they must not appear as a live fix.

Device service default GPS freshness window is 30 seconds, configurable with `GPS_STALE_AFTER_MS`. A no-fix telemetry packet at/after the stored GPS record invalidates that fix. The detail query currently can match by edge ID or assigned vehicle ID; `latestGps` may therefore represent another source for that vehicle. Validate source IDs if the screen needs hardware-specific diagnostics.

`GET /edge-devices/handshake/:boxId` returns `isRegistered`, `isOnline`, `lastSeen`, device/vehicle data, `gps`, and `telemetry`. A valid fresh fix returns GPS coordinates and `locked:true`; no current fix can produce `gps:null`. Do not substitute hardcoded coordinates or unconditional “Lock Verified”.

App rules:

1. Show edge connection independently from GPS lock.
2. Use only fresh valid coordinates; `null`/missing fields mean unavailable, not `(0,0)`.
3. When current telemetry reports `gpsLocked:false`, invalidate the previous fix. A subsequent newer valid position can reestablish it.
4. Expire displayed positions locally as well, so missing events cannot keep a lock alive indefinitely. Preserve the GPS timestamp.
5. Label historical coordinates explicitly as “Last known”, if a historical display is needed.

## MQTT topics

Base: `vehicle/<hardwareSerial>/<channel>`.

| Direction | Channels |
|---|---|
| Core to backend | `location`, `health`, `status`, `campaign-ack`, `qr-scan` |
| Backend to core | `campaign`, `emergency`, `config`, `reboot` |

Core location payload: `lat`, `lng`, `speed`, `heading`, `satellites`, `battery`, `source:"hardware_gps"`, `ts`. No location is published without a valid fresh fix in hardware mode.

Core health payload in hardware mode includes `ramUsage`, `cpuUsage`, `gpsConnected`, `gpsStatus`, `gpsPort`, `gpsLocked`, `satellites`, `gpsLastFixAt`, `agentVersion`. GPS connection details are currently not all persisted/bridged by the backend. `status` announces edge online/offline separately.

Native mobile apps should use REST/Socket.IO unless explicitly provisioned for MQTT; do not embed broker credentials from an edge installation.

## Current core configuration and diagnostics

```dotenv
SIMULATE=false
GPS_PORT=/dev/ttyUSB0
GPS_FIX_MAX_AGE_MS=15000
LOCATION_INTERVAL_MS=5000
HEALTH_INTERVAL_MS=10000
```

These interval values are source defaults; installed `.env` can override them. Hardware mode is the default. `SIMULATE=true` intentionally publishes route simulation and fabricated health, so reserve it for explicit simulation environments.

The serial reader configures raw mode with echo/software flow control disabled while retaining the current baud setting. NMEA checksums, coordinate bounds, hemispheres and fix status are checked. RMC `A` or GGA positive quality can establish a fix; RMC `V`/GGA quality zero clears it. Stale fixes expire after 15 seconds by default. On missing input for twice that window, the status polling path reopens the stream. Stream errors/close trigger retries.

Core logs every status transition and every 30 seconds: `[GPS] status=locked|no_fix|disconnected`, port, used satellites, per-talker GSV satellites in view and raw antenna report. `no_fix` means NMEA is arriving but no current position is valid; `disconnected` means no recent valid NMEA. Raw antenna codes are logged without guessing their vendor-specific interpretation.

## Other emitted events

Current source emits `notification:new`, `notification:log:new`, `notification:log:updated`, `support:created`, `support:message`, `support:status`, `work_order:created`, `work_order:assigned`, `work_order:updated`, `work_order:rated`, `INCIDENT_REPORTED`, `INCIDENT_STATUS_UPDATED`. Treat these as refresh hints unless the corresponding service payload is explicitly modeled. Fetch the REST detail to synchronize state; event payloads differ by operation.

Support ticket rooms use `subscribe:ticket` and `unsubscribe:ticket` with ticket ID. Service-side ownership/authorization and realtime room authorization must be evaluated separately.
