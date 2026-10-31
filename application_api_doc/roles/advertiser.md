# Advertiser Portal — API Documentation (Commercial Campaign Operations Reference)

> **Role:** `ROLE-ADVERTISER` (Internal VMOVEXA Campaign Manager)  
> **Base Path:** `https://api.vmovexa.com/api/v1` (Local: `http://localhost:4000/api/v1`)  
> **Total Endpoints:** 63 APIs (All 100% verified against backend route manifests)  
> **Updated:** 2026-10-31  
> **Public Routes:** Public checkout & dynamic QR scans require **no authentication**  
> **Protected Routes:** Campaign creation & management require `Authorization: Bearer <access_token>`

See [app developer guide](../APP_DEVELOPER_GUIDE.md) and [complete request reference](../API_REFERENCE.md). For realtime events see [REALTIME_AND_GPS.md](../REALTIME_AND_GPS.md).

---

## 📋 Complete Endpoints Summary (63 APIs)

### 1. Campaigns Lifecycle & Operations (33 APIs)
| Method | Endpoint | Auth | Permissions | Description | Reference |
|---|---|---|---|---|---|
| `GET` | `/api/v1/campaigns` | **Bearer** | `campaigns.view`, `government.campaigns.view` | List campaigns with status, client & type filters | [Reference](../API_REFERENCE.md#get-api-v1-campaigns) |
| `POST` | `/api/v1/campaigns` | **Bearer** | `campaigns.create`, `government.campaigns.create` | Create campaign with multi-media assets & client info | [Reference](../API_REFERENCE.md#post-api-v1-campaigns) |
| `DELETE` | `/api/v1/campaigns/:id` | **Bearer** | `campaigns.delete` | Delete draft or cancelled campaign | [Reference](../API_REFERENCE.md#delete-api-v1-campaigns-id) |
| `GET` | `/api/v1/campaigns/:id` | **Bearer** | `campaigns.view`, `government.campaigns.view` | Detailed campaign profile with media assets | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-id) |
| `PATCH` | `/api/v1/campaigns/:id` | **Bearer** | `campaigns.update` | Update campaign details, targeting or dates | [Reference](../API_REFERENCE.md#patch-api-v1-campaigns-id) |
| `PUT` | `/api/v1/campaigns/:id` | **Bearer** | `campaigns.update` | Full update of campaign record | [Reference](../API_REFERENCE.md#put-api-v1-campaigns-id) |
| `GET` | `/api/v1/campaigns/:id/analytics` | **Bearer** | `campaigns.analytics.view`, `government.analytics.view` | Single campaign impression telemetry | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-id-analytics) |
| `POST` | `/api/v1/campaigns/:id/approve` | **Bearer** | `campaigns.approve` | SuperAdmin approve campaign | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-id-approve) |
| `POST` | `/api/v1/campaigns/:id/complete` | **Bearer** | `campaigns.update` | Create campaign with multi-media assets & client info | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-id-complete) |
| `POST` | `/api/v1/campaigns/:id/confirm-payment` | **Bearer** | `campaigns.pay` | Create campaign with multi-media assets & client info | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-id-confirm-payment) |
| `POST` | `/api/v1/campaigns/:id/end` | **Bearer** | `campaigns.update` | End campaign broadcast permanently | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-id-end) |
| `POST` | `/api/v1/campaigns/:id/pause` | **Bearer** | `campaigns.update` | Pause broadcast playback | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-id-pause) |
| `POST` | `/api/v1/campaigns/:id/pay` | **Bearer** | `campaigns.pay` | Create campaign with multi-media assets & client info | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-id-pay) |
| `POST` | `/api/v1/campaigns/:id/pay/confirm` | **Bearer** | `campaigns.pay` | Create campaign with multi-media assets & client info | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-id-pay-confirm) |
| `GET` | `/api/v1/campaigns/:id/public-checkout` | No | None | Public checkout page data for brand client | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-id-public-checkout) |
| `GET` | `/api/v1/campaigns/:id/public-invoice` | No | None | Public invoice HTML / PDF for brand client | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-id-public-invoice) |
| `POST` | `/api/v1/campaigns/:id/public-order` | No | None | Create campaign with multi-media assets & client info | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-id-public-order) |
| `POST` | `/api/v1/campaigns/:id/public-pay` | No | None | Execute public payment confirmation | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-id-public-pay) |
| `POST` | `/api/v1/campaigns/:id/record-offline-payment` | **Bearer** | `campaigns.pay`, `campaigns.update`, `government.campaigns.update` | Record manual offline cheque / RTGS settlement | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-id-record-offline-payment) |
| `POST` | `/api/v1/campaigns/:id/reject` | **Bearer** | `campaigns.approve` | SuperAdmin reject campaign | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-id-reject) |
| `GET` | `/api/v1/campaigns/:id/reviews` | **Bearer** | `campaigns.view`, `government.campaigns.view` | Detailed campaign profile with media assets | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-id-reviews) |
| `POST` | `/api/v1/campaigns/:id/share-payment-link` | **Bearer** | `campaigns.update` | Email / SMS payment checkout link to customer | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-id-share-payment-link) |
| `POST` | `/api/v1/campaigns/:id/start` | **Bearer** | `campaigns.update` | Manually start broadcast to transit screens | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-id-start) |
| `POST` | `/api/v1/campaigns/:id/stop` | **Bearer** | `campaigns.update` | Halt broadcast playback | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-id-stop) |
| `POST` | `/api/v1/campaigns/:id/submit` | **Bearer** | `campaigns.submit` | Submit campaign for SuperAdmin review | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-id-submit) |
| `POST` | `/api/v1/campaigns/:id/verify` | **Bearer** | `campaigns.verify` | Compliance verify creative media checksums | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-id-verify) |
| `GET` | `/api/v1/campaigns/analytics` | **Bearer** | `campaigns.analytics.view`, `government.analytics.view` | Single campaign impression telemetry | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-analytics) |
| `GET` | `/api/v1/campaigns/analytics/overview` | **Bearer** | `campaigns.analytics.view`, `government.analytics.view` | High-level impressions & screen reach analytics | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-analytics-overview) |
| `GET` | `/api/v1/campaigns/fleet-options` | **Bearer** | `campaigns.view`, `government.campaigns.view` | Detailed campaign profile with media assets | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-fleet-options) |
| `GET` | `/api/v1/campaigns/mqtt-status` | **Bearer** | `campaigns.view`, `government.campaigns.view` | Check MQTT edge box sync status for campaign | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-mqtt-status) |
| `GET` | `/api/v1/campaigns/slots/availability` | **Bearer** | `campaigns.view`, `government.campaigns.view` | Query bus display hourly slot capacity | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-slots-availability) |
| `GET` | `/api/v1/campaigns/tracking/live` | **Bearer** | `fleet.tracking.view`, `government.tracking.view` | Live transit map of buses broadcasting this ad | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-tracking-live) |
| `GET` | `/api/v1/campaigns/tracking/routes` | **Bearer** | `fleet.tracking.view`, `government.tracking.view` | Corridor route paths active for this campaign | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-tracking-routes) |

### 2. Advertiser CRM Accounts (7 APIs)
| Method | Endpoint | Auth | Permissions | Description | Reference |
|---|---|---|---|---|---|
| `GET` | `/api/v1/advertisers` | **Bearer** | `campaigns.view`, `users.view` | List registered advertiser brand profiles | [Reference](../API_REFERENCE.md#get-api-v1-advertisers) |
| `POST` | `/api/v1/advertisers` | **Bearer** | `users.create` | Register a new commercial advertiser brand | [Reference](../API_REFERENCE.md#post-api-v1-advertisers) |
| `DELETE` | `/api/v1/advertisers/:id` | **Bearer** | None | Remove advertiser account | [Reference](../API_REFERENCE.md#delete-api-v1-advertisers-id) |
| `GET` | `/api/v1/advertisers/:id` | **Bearer** | `campaigns.view`, `users.view` | Get advertiser brand profile details | [Reference](../API_REFERENCE.md#get-api-v1-advertisers-id) |
| `PATCH` | `/api/v1/advertisers/:id` | **Bearer** | `users.update` | Update brand details, GSTIN, and wallet | [Reference](../API_REFERENCE.md#patch-api-v1-advertisers-id) |
| `PUT` | `/api/v1/advertisers/:id` | **Bearer** | `users.update` | Full update of brand account | [Reference](../API_REFERENCE.md#put-api-v1-advertisers-id) |
| `PATCH` | `/api/v1/advertisers/:id/status` | **Bearer** | None | Update advertiser account status | [Reference](../API_REFERENCE.md#patch-api-v1-advertisers-id-status) |

### 3. Dynamic QR Codes & Commuter Reviews (4 APIs)
| Method | Endpoint | Auth | Permissions | Description | Reference |
|---|---|---|---|---|---|
| `GET` | `/api/v1/qr/:code` | No | None | Resolve QR code destination URL | [Reference](../API_REFERENCE.md#get-api-v1-qr-code) |
| `POST` | `/api/v1/qr/:code/review` | No | None | Submit commuter trip rating & review | [Reference](../API_REFERENCE.md#post-api-v1-qr-code-review) |
| `GET` | `/api/v1/qr/scan/:code` | No | None | Track dynamic scan hit & redirect to target URL | [Reference](../API_REFERENCE.md#get-api-v1-qr-scan-code) |
| `GET` | `/api/v1/qr/scan/:code/landing` | No | None | Interactive consumer landing page for scanned ad | [Reference](../API_REFERENCE.md#get-api-v1-qr-scan-code-landing) |

### 4. Router Sub-Mounts (19 APIs)
| Method | Endpoint | Auth | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/campaigns/advertisers` | **Bearer** | Secondary router alias for campaigns | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-advertisers) |
| `POST` | `/api/v1/campaigns/advertisers` | **Bearer** | Secondary router alias for campaigns | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-advertisers) |
| `DELETE` | `/api/v1/campaigns/advertisers/:id` | **Bearer** | Secondary router alias for campaigns | [Reference](../API_REFERENCE.md#delete-api-v1-campaigns-advertisers-id) |
| `GET` | `/api/v1/campaigns/advertisers/:id` | **Bearer** | Secondary router alias for campaigns | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-advertisers-id) |
| `PATCH` | `/api/v1/campaigns/advertisers/:id` | **Bearer** | Secondary router alias for campaigns | [Reference](../API_REFERENCE.md#patch-api-v1-campaigns-advertisers-id) |
| `PUT` | `/api/v1/campaigns/advertisers/:id` | **Bearer** | Secondary router alias for campaigns | [Reference](../API_REFERENCE.md#put-api-v1-campaigns-advertisers-id) |
| `PATCH` | `/api/v1/campaigns/advertisers/:id/status` | **Bearer** | Secondary router alias for campaigns | [Reference](../API_REFERENCE.md#patch-api-v1-campaigns-advertisers-id-status) |
| `GET` | `/api/v1/campaigns/government` | **Bearer** | Secondary router alias for campaigns | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-government) |
| `POST` | `/api/v1/campaigns/government` | **Bearer** | Secondary router alias for campaigns | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-government) |
| `DELETE` | `/api/v1/campaigns/government/:id` | **Bearer** | Secondary router alias for campaigns | [Reference](../API_REFERENCE.md#delete-api-v1-campaigns-government-id) |
| `GET` | `/api/v1/campaigns/government/:id` | **Bearer** | Secondary router alias for campaigns | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-government-id) |
| `PATCH` | `/api/v1/campaigns/government/:id` | **Bearer** | Secondary router alias for campaigns | [Reference](../API_REFERENCE.md#patch-api-v1-campaigns-government-id) |
| `PUT` | `/api/v1/campaigns/government/:id` | **Bearer** | Secondary router alias for campaigns | [Reference](../API_REFERENCE.md#put-api-v1-campaigns-government-id) |
| `PATCH` | `/api/v1/campaigns/government/:id/status` | **Bearer** | Secondary router alias for campaigns | [Reference](../API_REFERENCE.md#patch-api-v1-campaigns-government-id-status) |
| `GET` | `/api/v1/campaigns/government/analytics` | **Bearer** | Secondary router alias for campaigns | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-government-analytics) |
| `GET` | `/api/v1/campaigns/government/clearance-levels` | **Bearer** | Secondary router alias for campaigns | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-government-clearance-levels) |
| `GET` | `/api/v1/campaigns/government/department-categories` | **Bearer** | Secondary router alias for campaigns | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-government-department-categories) |
| `GET` | `/api/v1/campaigns/government/jurisdictions` | **Bearer** | Secondary router alias for campaigns | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-government-jurisdictions) |
| `GET` | `/api/v1/campaigns/government/meta/options` | **Bearer** | Secondary router alias for campaigns | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-government-meta-options) |

---

## 🎯 VMOVEXA Campaign Operations Architecture

### 1. Distinction: Advertiser vs Client
- **Advertiser:** Internal VMOVEXA employee / campaign operator who configures ads, routes, and schedules.
- **Client (Customer):** The brand or business paying for the broadcast (e.g. Sharma Traders). Client receives payment link via email/SMS.

### 2. Multi-Media Creative Assets
- Multiple files (`media: [{ media_url, media_type, duration_sec }]`) are supported per campaign.
- File uploads are staged client-side via Blob previews and submitted at final Step 6 to `POST /api/v1/campaigns`. [Contract](../CONTROLLER_CONTRACTS.md#post-api-v1-campaigns)

### 3. Public Payment Link Flow
1. SuperAdmin approves campaign (`POST /api/v1/campaigns/:id/approve`).
2. System or Advertiser triggers `POST /api/v1/campaigns/:id/share-payment-link`.
3. Client opens public checkout page (`GET /api/v1/campaigns/:id/public-checkout`) without login.
4. Client pays (`POST /api/v1/campaigns/:id/public-pay`). Status transitions to `paid`.
5. Advertiser manually clicks `POST /api/v1/campaigns/:id/start` to push campaign to transit edge devices.

