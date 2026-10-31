# Notifications & WebSocket Telemetry — API Documentation

> **Base Path:** `https://api.vmovexa.com/api/v1` (Local: `http://localhost:4000/api/v1`)  
> **Total Endpoints:** 23 APIs (All 100% verified against backend route manifests)  
> **Updated:** 2026-10-31  
> **Channels:** In-App UI, WebSocket Realtime, Push (FCM), SMS (Twilio), Email (SMTP), WhatsApp Business

See [app developer guide](../APP_DEVELOPER_GUIDE.md) and [complete request reference](../API_REFERENCE.md). For realtime events see [REALTIME_AND_GPS.md](../REALTIME_AND_GPS.md).

---

## 📋 Complete Endpoints Summary (23 APIs)

### 1. User In-App Notifications (5 APIs)
| Method | Endpoint | Description | Reference |
|---|---|---|---|
| `DELETE` | `/api/v1/notifications` | Clear all user notifications | [Reference](../API_REFERENCE.md#delete-api-v1-notifications) |
| `GET` | `/api/v1/notifications` | List logged-in user notifications with unread counts | [Reference](../API_REFERENCE.md#get-api-v1-notifications) |
| `DELETE` | `/api/v1/notifications/:id` | Delete single notification item | [Reference](../API_REFERENCE.md#delete-api-v1-notifications-id) |
| `POST` | `/api/v1/notifications/:id/read` | Mark single notification as read | [Reference](../API_REFERENCE.md#post-api-v1-notifications-id-read) |
| `POST` | `/api/v1/notifications/read-all` | Mark all user notifications as read | [Reference](../API_REFERENCE.md#post-api-v1-notifications-read-all) |

### 2. User Notification Preferences (3 APIs)
| Method | Endpoint | Description | Reference |
|---|---|---|---|
| `GET` | `/api/v1/notifications/settings` | Get user channel toggles & quiet hours | [Reference](../API_REFERENCE.md#get-api-v1-notifications-settings) |
| `PATCH` | `/api/v1/notifications/settings` | Update user push/SMS/email toggles and quiet hours | [Reference](../API_REFERENCE.md#patch-api-v1-notifications-settings) |
| `PATCH` | `/api/v1/notifications/settings/preferences/:eventTypeId` | Toggle specific event notification category on/off | [Reference](../API_REFERENCE.md#patch-api-v1-notifications-settings-preferences-eventtypeid) |

### 3. Platform Notification Gateways (6 APIs)
| Method | Endpoint | Permissions | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/notifications/sms` | `platform.keys`, `platform.settings` | Fetch Twilio SMS gateway API keys & sender phone | [Reference](../API_REFERENCE.md#get-api-v1-notifications-sms) |
| `PUT` | `/api/v1/notifications/sms` | `platform.keys`, `platform.settings` | Update Twilio SMS gateway API keys & sender phone | [Reference](../API_REFERENCE.md#put-api-v1-notifications-sms) |
| `GET` | `/api/v1/notifications/smtp` | `platform.keys`, `platform.settings` | Fetch SMTP host, port, TLS & credentials | [Reference](../API_REFERENCE.md#get-api-v1-notifications-smtp) |
| `PUT` | `/api/v1/notifications/smtp` | `platform.keys`, `platform.settings` | Update SMTP host, port, TLS & credentials | [Reference](../API_REFERENCE.md#put-api-v1-notifications-smtp) |
| `GET` | `/api/v1/notifications/whatsapp` | `platform.keys`, `platform.settings` | Fetch WhatsApp Business Cloud API token & phone number ID | [Reference](../API_REFERENCE.md#get-api-v1-notifications-whatsapp) |
| `PUT` | `/api/v1/notifications/whatsapp` | `platform.keys`, `platform.settings` | Update WhatsApp Business Cloud API token & phone number ID | [Reference](../API_REFERENCE.md#put-api-v1-notifications-whatsapp) |

### 4. Gateway Diagnostic Tests (4 APIs)
| Method | Endpoint | Permissions | Description | Reference |
|---|---|---|---|---|
| `POST` | `/api/v1/notifications/test-email` | `platform.keys`, `platform.settings` | Dispatch test message over email | [Reference](../API_REFERENCE.md#post-api-v1-notifications-test-email) |
| `POST` | `/api/v1/notifications/test-push` | `platform.keys`, `platform.settings` | Dispatch test message over push | [Reference](../API_REFERENCE.md#post-api-v1-notifications-test-push) |
| `POST` | `/api/v1/notifications/test-sms` | `platform.keys`, `platform.settings` | Dispatch test message over sms | [Reference](../API_REFERENCE.md#post-api-v1-notifications-test-sms) |
| `POST` | `/api/v1/notifications/test-whatsapp` | `platform.keys`, `platform.settings` | Dispatch test message over whatsapp | [Reference](../API_REFERENCE.md#post-api-v1-notifications-test-whatsapp) |

### 5. Delivery Logs & Telemetry (3 APIs)
| Method | Endpoint | Permissions | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/notifications/delivery-logs` | `platform.audit`, `platform.settings` | Searchable delivery audit log across all channels | [Reference](../API_REFERENCE.md#get-api-v1-notifications-delivery-logs) |
| `POST` | `/api/v1/notifications/delivery-logs/:id/retry` | `platform.audit`, `platform.settings` | Retry failed notification dispatch | [Reference](../API_REFERENCE.md#post-api-v1-notifications-delivery-logs-id-retry) |
| `GET` | `/api/v1/notifications/delivery-logs/stats` | `platform.audit`, `platform.settings` | Aggregate channel delivery rates (sent, delivered, failed) | [Reference](../API_REFERENCE.md#get-api-v1-notifications-delivery-logs-stats) |

### 6. Mobile Push Tokens (2 APIs)
| Method | Endpoint | Description | Reference |
|---|---|---|---|
| `POST` | `/api/v1/push/register` | Register FCM device push token | [Reference](../API_REFERENCE.md#post-api-v1-push-register) |
| `POST` | `/api/v1/push/test` | Send test push notification to caller | [Reference](../API_REFERENCE.md#post-api-v1-push-test) |

---

