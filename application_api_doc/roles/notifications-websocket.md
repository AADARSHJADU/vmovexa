# Notifications & WebSocket — API Documentation (Real-Time Telemetry & Alert Engine)

> **REST Base Path:** `http://localhost:4000/api/v1`  
> **WebSocket Engine:** `ws://localhost:4000` (Socket.IO v4, path: `/socket.io`)  
> **Auth:** REST endpoints require `Authorization: Bearer <token>`. WebSocket requires JWT token during handshake `auth: { token }` or query `?token=...`.

---

## 📋 Complete Endpoints Summary (23 REST APIs + WebSocket)

### 1. In-App Notifications (5 APIs)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/notifications` | Yes | List user notifications with unread filter, category, severity & pagination |
| `POST` | `/notifications/:id/read` | Yes | Mark a single notification as read |
| `POST` | `/notifications/read-all` | Yes | Mark all notifications as read for current user |
| `DELETE` | `/notifications/:id` | Yes | Delete single notification record |
| `DELETE` | `/notifications` | Yes | Clear / delete all notifications for current user |

### 2. Notification Settings & Channel Preferences (3 APIs)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/notifications/settings` | Yes | Get user alert preferences across Email, SMS, WhatsApp, In-App, Push |
| `PATCH` | `/notifications/settings` | Yes | Update master channel toggles (enable/disable SMS, Email, etc.) |
| `PATCH` | `/notifications/settings/preferences/:eventTypeId` | Yes | Toggle specific event alert channel (`PAYMENT_RECEIVED`, `TRIP_SOS`) |

### 3. Delivery Telemetry Logs & Retry (3 APIs)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/notifications/delivery-logs` | Yes | Real-time delivery logs for all dispatched SMS, Emails, WhatsApp alerts |
| `GET` | `/notifications/delivery-logs/stats`| Yes | Global dispatch stats (total sent, failed, success percentage) |
| `POST` | `/notifications/delivery-logs/:id/retry` | Yes | Retry a failed notification dispatch |

### 4. Channel Gateway Configuration (SuperAdmin) (10 APIs)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/notifications/smtp` | Yes | Read platform SMTP email configuration |
| `PUT` | `/notifications/smtp` | Yes | Update SMTP host, port, credentials & sender name |
| `GET` | `/notifications/sms` | Yes | Read Twilio SMS gateway configuration |
| `PUT` | `/notifications/sms` | Yes | Update Twilio Account SID, Auth Token & From Number |
| `GET` | `/notifications/whatsapp` | Yes | Read WhatsApp Business API gateway configuration |
| `PUT` | `/notifications/whatsapp` | Yes | Update WhatsApp API key & Phone Number ID |
| `POST` | `/notifications/test-email` | Yes | Test send sample email to specified address |
| `POST` | `/notifications/test-sms` | Yes | Test send sample SMS to specified mobile |
| `POST` | `/notifications/test-whatsapp` | Yes | Test send sample WhatsApp template |
| `POST` | `/notifications/test-push` | Yes | Test send FCM push notification |

### 5. FCM Push Notifications (2 APIs)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/push/register` | Yes | Register Firebase Cloud Messaging (FCM) device push token |
| `POST` | `/push/test` | Yes | Dispatch test push alert to registered device |

---

## ⚡ PART 1: In-App Notifications API

### 1.1 GET `/notifications`
Fetch paginated alerts for bell icon and notification drawer.

#### Query Params
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | `1` | Page number |
| `limit` | number | `20` | Page size |
| `unread_only` | boolean | `false` | When `true`, returns only unread items |
| `category` | string | — | `campaign`, `payment`, `fleet`, `system`, `alert` |
| `severity` | string | — | `info`, `warning`, `critical` |
| `search` | string | — | Search title or message |

#### Success Response `200`
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": "ntf_01HX98...",
        "title": "Campaign Payment Received",
        "message": "Sharma Electronics has completed payment of ₹1,00,300 for 'Diwali Mega Sale'. Ready to launch.",
        "category": "payment",
        "severity": "info",
        "is_read": false,
        "action_url": "/advertiser/campaigns/cmp_01HX",
        "metadata": {
          "campaign_id": "cmp_01HX...",
          "amount": 100300
        },
        "created_at": "2026-10-10T06:30:00.000Z"
      }
    ],
    "count": 18,
    "unread_count": 4,
    "totalPages": 1,
    "currentPage": 1,
    "pageSize": 20
  }
}
```

---

### 1.2 POST `/notifications/read-all`
Mark all unread notifications as read.

#### Success Response `200`
```json
{
  "success": true,
  "message": "All notifications marked as read."
}
```

---

## 🌐 PART 2: WebSocket Real-Time Telemetry & Events (Socket.IO)

### 2.1 Connection Handshake

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000', {
  path: '/socket.io',
  auth: {
    token: localStorage.getItem('access_token'),
  },
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  console.log('Connected to VMOVEXA Real-Time Engine, Socket ID:', socket.id);
});
```

---

### 2.2 Standard Channels & Rooms

| Room Name | Who Joins Automatically? | Purpose |
|-----------|--------------------------|---------|
| `platform` | SuperAdmin, Platform Roles | Cross-tenant alerts, NOC anomalies, system health |
| `org:<organizationId>` | Tenant Staff (Fleet Manager, Operators) | Tenant-specific trips, incidents, driver status |
| `user:<userId>` | The logged-in user | Personal bell icon alerts, ticket replies, approvals |
| `vehicle:<vehicleId>` | Client subscribes on demand | High-frequency live GPS telematics (1s updates) |
| `ticket:<ticketId>` | Client subscribes on demand | Live support chat messaging |

---

### 2.3 Client Subscriptions

```javascript
// Subscribe to live GPS telemetry of Bus MP09-CV-4421
socket.emit('subscribe:vehicle', 'veh_01HX9821');

// Listen for telemetry updates
socket.on('vehicle:telemetry', (data) => {
  console.log('Live Bus Position:', data.lat, data.lng, data.speed_kmh);
});

// Unsubscribe when leaving live tracking page
socket.emit('unsubscribe:vehicle', 'veh_01HX9821');
```

---

### 2.4 Server-to-Client Inbound Event Types

| Event Name | Payload Sample | UI Reaction |
|------------|----------------|-------------|
| `notification:new` | `{ id, title, message, category, severity }` | Increment bell counter badge + trigger toast alert |
| `vehicle:telemetry` | `{ vehicle_id, lat, lng, speed, ignition, battery }` | Move bus marker smoothly on map |
| `emergency:alert` | `{ broadcast_id, title, message, severity: "critical" }` | Flash full-screen red warning modal |
| `ticket:reply` | `{ ticket_id, message, sender_name, timestamp }` | Append message in chat window |

---

## 💻 Standard Frontend Service & Hook

```javascript
// src/api/services/notification.service.js
import apiClient from '../client';

export const notificationService = {
  getNotifications: (params) => apiClient.get('/notifications', { params }),
  markRead: (id) => apiClient.post(`/notifications/${id}/read`),
  markAllRead: () => apiClient.post('/notifications/read-all'),
  clearAll: () => apiClient.delete('/notifications'),
  getSettings: () => apiClient.get('/notifications/settings'),
  updateSettings: (data) => apiClient.patch('/notifications/settings', data),
  getDeliveryLogs: (params) => apiClient.get('/notifications/delivery-logs', { params }),
  retryDelivery: (id) => apiClient.post(`/notifications/delivery-logs/${id}/retry`),
  registerPushToken: (token) => apiClient.post('/push/register', { token, platform: 'web' }),
};
```

---

## 🔗 Frontend Architecture & File Reference
- **Services:** `src/api/services/notificationLog.service.js`, `src/api/socket.js`
- **Thunks:** `src/store/thunks/notificationLog.thunks.js`
- **Slices:** `src/store/slices/notificationLogSlice.js`
- **Custom Hooks:** `src/hooks/useNotificationLogs.js`
- **Socket Client:** `src/api/socket.js` (`getSocket()`, `disconnectSocket()`)
- **Shared Notification UI:** `src/pages/admin/SharedNotificationsView.jsx` (Powers all portal notification pages with `<Pagination />`)
- **Integration Blueprint:** See [FRONTEND_INTEGRATION_GUIDE.md](../FRONTEND_INTEGRATION_GUIDE.md)

