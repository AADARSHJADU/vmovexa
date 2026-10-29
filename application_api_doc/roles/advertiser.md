# advertiser API index

Updated: 2026-10-28. 63 route entries. This grouping is navigation only: access is determined by actual permissions and tenant/controller rules, not by this filename. Shared routes can be used by multiple roles.

See [app developer guide](../APP_DEVELOPER_GUIDE.md) and [complete request reference](../API_REFERENCE.md). For realtime events see [REALTIME_AND_GPS.md](../REALTIME_AND_GPS.md).

| Method | Path | Authentication | Request / access details |
|---|---|---|---|
| GET | `/api/v1/advertisers` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-advertisers) |
| POST | `/api/v1/advertisers` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-advertisers) |
| DELETE | `/api/v1/advertisers/:id` | Bearer | [Reference](../API_REFERENCE.md#delete-api-v1-advertisers-id) |
| GET | `/api/v1/advertisers/:id` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-advertisers-id) |
| PATCH | `/api/v1/advertisers/:id` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-advertisers-id) |
| PUT | `/api/v1/advertisers/:id` | Bearer | [Reference](../API_REFERENCE.md#put-api-v1-advertisers-id) |
| PATCH | `/api/v1/advertisers/:id/status` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-advertisers-id-status) |
| GET | `/api/v1/campaigns` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-campaigns) |
| POST | `/api/v1/campaigns` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-campaigns) |
| DELETE | `/api/v1/campaigns/:id` | Bearer | [Reference](../API_REFERENCE.md#delete-api-v1-campaigns-id) |
| GET | `/api/v1/campaigns/:id` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-id) |
| PATCH | `/api/v1/campaigns/:id` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-campaigns-id) |
| PUT | `/api/v1/campaigns/:id` | Bearer | [Reference](../API_REFERENCE.md#put-api-v1-campaigns-id) |
| GET | `/api/v1/campaigns/:id/analytics` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-id-analytics) |
| POST | `/api/v1/campaigns/:id/approve` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-id-approve) |
| POST | `/api/v1/campaigns/:id/complete` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-id-complete) |
| POST | `/api/v1/campaigns/:id/confirm-payment` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-id-confirm-payment) |
| POST | `/api/v1/campaigns/:id/end` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-id-end) |
| POST | `/api/v1/campaigns/:id/pause` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-id-pause) |
| POST | `/api/v1/campaigns/:id/pay` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-id-pay) |
| POST | `/api/v1/campaigns/:id/pay/confirm` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-id-pay-confirm) |
| GET | `/api/v1/campaigns/:id/public-checkout` | No requireAuth guard | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-id-public-checkout) |
| GET | `/api/v1/campaigns/:id/public-invoice` | No requireAuth guard | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-id-public-invoice) |
| POST | `/api/v1/campaigns/:id/public-order` | No requireAuth guard | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-id-public-order) |
| POST | `/api/v1/campaigns/:id/public-pay` | No requireAuth guard | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-id-public-pay) |
| POST | `/api/v1/campaigns/:id/record-offline-payment` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-id-record-offline-payment) |
| POST | `/api/v1/campaigns/:id/reject` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-id-reject) |
| GET | `/api/v1/campaigns/:id/reviews` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-id-reviews) |
| POST | `/api/v1/campaigns/:id/share-payment-link` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-id-share-payment-link) |
| POST | `/api/v1/campaigns/:id/start` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-id-start) |
| POST | `/api/v1/campaigns/:id/stop` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-id-stop) |
| POST | `/api/v1/campaigns/:id/submit` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-id-submit) |
| POST | `/api/v1/campaigns/:id/verify` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-id-verify) |
| GET | `/api/v1/campaigns/advertisers` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-advertisers) |
| POST | `/api/v1/campaigns/advertisers` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-advertisers) |
| DELETE | `/api/v1/campaigns/advertisers/:id` | Bearer | [Reference](../API_REFERENCE.md#delete-api-v1-campaigns-advertisers-id) |
| GET | `/api/v1/campaigns/advertisers/:id` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-advertisers-id) |
| PATCH | `/api/v1/campaigns/advertisers/:id` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-campaigns-advertisers-id) |
| PUT | `/api/v1/campaigns/advertisers/:id` | Bearer | [Reference](../API_REFERENCE.md#put-api-v1-campaigns-advertisers-id) |
| PATCH | `/api/v1/campaigns/advertisers/:id/status` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-campaigns-advertisers-id-status) |
| GET | `/api/v1/campaigns/analytics` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-analytics) |
| GET | `/api/v1/campaigns/analytics/overview` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-analytics-overview) |
| GET | `/api/v1/campaigns/fleet-options` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-fleet-options) |
| GET | `/api/v1/campaigns/government` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-government) |
| POST | `/api/v1/campaigns/government` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-campaigns-government) |
| DELETE | `/api/v1/campaigns/government/:id` | Bearer | [Reference](../API_REFERENCE.md#delete-api-v1-campaigns-government-id) |
| GET | `/api/v1/campaigns/government/:id` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-government-id) |
| PATCH | `/api/v1/campaigns/government/:id` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-campaigns-government-id) |
| PUT | `/api/v1/campaigns/government/:id` | Bearer | [Reference](../API_REFERENCE.md#put-api-v1-campaigns-government-id) |
| PATCH | `/api/v1/campaigns/government/:id/status` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-campaigns-government-id-status) |
| GET | `/api/v1/campaigns/government/analytics` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-government-analytics) |
| GET | `/api/v1/campaigns/government/clearance-levels` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-government-clearance-levels) |
| GET | `/api/v1/campaigns/government/department-categories` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-government-department-categories) |
| GET | `/api/v1/campaigns/government/jurisdictions` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-government-jurisdictions) |
| GET | `/api/v1/campaigns/government/meta/options` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-government-meta-options) |
| GET | `/api/v1/campaigns/mqtt-status` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-mqtt-status) |
| GET | `/api/v1/campaigns/slots/availability` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-slots-availability) |
| GET | `/api/v1/campaigns/tracking/live` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-tracking-live) |
| GET | `/api/v1/campaigns/tracking/routes` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-campaigns-tracking-routes) |
| GET | `/api/v1/qr/:code` | No requireAuth guard | [Reference](../API_REFERENCE.md#get-api-v1-qr-code) |
| POST | `/api/v1/qr/:code/review` | No requireAuth guard | [Reference](../API_REFERENCE.md#post-api-v1-qr-code-review) |
| GET | `/api/v1/qr/scan/:code` | No requireAuth guard | [Reference](../API_REFERENCE.md#get-api-v1-qr-scan-code) |
| GET | `/api/v1/qr/scan/:code/landing` | No requireAuth guard | [Reference](../API_REFERENCE.md#get-api-v1-qr-scan-code-landing) |
