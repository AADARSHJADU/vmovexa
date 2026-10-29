# notifications-websocket API index

Updated: 2026-10-28. 23 route entries. This grouping is navigation only: access is determined by actual permissions and tenant/controller rules, not by this filename. Shared routes can be used by multiple roles.

See [app developer guide](../APP_DEVELOPER_GUIDE.md) and [complete request reference](../API_REFERENCE.md). For realtime events see [REALTIME_AND_GPS.md](../REALTIME_AND_GPS.md).

| Method | Path | Authentication | Request / access details |
|---|---|---|---|
| DELETE | `/api/v1/notifications` | Bearer | [Reference](../API_REFERENCE.md#delete-api-v1-notifications) |
| GET | `/api/v1/notifications` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-notifications) |
| DELETE | `/api/v1/notifications/:id` | Bearer | [Reference](../API_REFERENCE.md#delete-api-v1-notifications-id) |
| POST | `/api/v1/notifications/:id/read` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-notifications-id-read) |
| GET | `/api/v1/notifications/delivery-logs` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-notifications-delivery-logs) |
| POST | `/api/v1/notifications/delivery-logs/:id/retry` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-notifications-delivery-logs-id-retry) |
| GET | `/api/v1/notifications/delivery-logs/stats` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-notifications-delivery-logs-stats) |
| POST | `/api/v1/notifications/read-all` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-notifications-read-all) |
| GET | `/api/v1/notifications/settings` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-notifications-settings) |
| PATCH | `/api/v1/notifications/settings` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-notifications-settings) |
| PATCH | `/api/v1/notifications/settings/preferences/:eventTypeId` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-notifications-settings-preferences-eventtypeid) |
| GET | `/api/v1/notifications/sms` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-notifications-sms) |
| PUT | `/api/v1/notifications/sms` | Bearer | [Reference](../API_REFERENCE.md#put-api-v1-notifications-sms) |
| GET | `/api/v1/notifications/smtp` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-notifications-smtp) |
| PUT | `/api/v1/notifications/smtp` | Bearer | [Reference](../API_REFERENCE.md#put-api-v1-notifications-smtp) |
| POST | `/api/v1/notifications/test-email` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-notifications-test-email) |
| POST | `/api/v1/notifications/test-push` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-notifications-test-push) |
| POST | `/api/v1/notifications/test-sms` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-notifications-test-sms) |
| POST | `/api/v1/notifications/test-whatsapp` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-notifications-test-whatsapp) |
| GET | `/api/v1/notifications/whatsapp` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-notifications-whatsapp) |
| PUT | `/api/v1/notifications/whatsapp` | Bearer | [Reference](../API_REFERENCE.md#put-api-v1-notifications-whatsapp) |
| POST | `/api/v1/push/register` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-push-register) |
| POST | `/api/v1/push/test` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-push-test) |
