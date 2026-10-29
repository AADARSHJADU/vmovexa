# common-services API index

Updated: 2026-10-28. 47 route entries. This grouping is navigation only: access is determined by actual permissions and tenant/controller rules, not by this filename. Shared routes can be used by multiple roles.

See [app developer guide](../APP_DEVELOPER_GUIDE.md) and [complete request reference](../API_REFERENCE.md). For realtime events see [REALTIME_AND_GPS.md](../REALTIME_AND_GPS.md).

| Method | Path | Authentication | Request / access details |
|---|---|---|---|
| GET | `/api/v1/content` | No requireAuth guard | [Reference](../API_REFERENCE.md#get-api-v1-content) |
| POST | `/api/v1/content` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-content) |
| DELETE | `/api/v1/content/:id` | Bearer | [Reference](../API_REFERENCE.md#delete-api-v1-content-id) |
| PATCH | `/api/v1/content/:id` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-content-id) |
| POST | `/api/v1/content/:id/publish` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-content-id-publish) |
| GET | `/api/v1/content/:type` | No requireAuth guard | [Reference](../API_REFERENCE.md#get-api-v1-content-type) |
| GET | `/api/v1/content/faqs` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-content-faqs) |
| POST | `/api/v1/content/faqs` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-content-faqs) |
| DELETE | `/api/v1/content/faqs/:id` | Bearer | [Reference](../API_REFERENCE.md#delete-api-v1-content-faqs-id) |
| PATCH | `/api/v1/content/faqs/:id` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-content-faqs-id) |
| GET | `/api/v1/exports` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-exports) |
| POST | `/api/v1/exports` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-exports) |
| GET | `/api/v1/google-apis` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-google-apis) |
| PUT | `/api/v1/google-apis` | Bearer | [Reference](../API_REFERENCE.md#put-api-v1-google-apis) |
| POST | `/api/v1/google-apis/demo/geocode` | No requireAuth guard | [Reference](../API_REFERENCE.md#post-api-v1-google-apis-demo-geocode) |
| POST | `/api/v1/google-apis/demo/places` | No requireAuth guard | [Reference](../API_REFERENCE.md#post-api-v1-google-apis-demo-places) |
| POST | `/api/v1/google-apis/demo/roads` | No requireAuth guard | [Reference](../API_REFERENCE.md#post-api-v1-google-apis-demo-roads) |
| POST | `/api/v1/google-apis/demo/routes` | No requireAuth guard | [Reference](../API_REFERENCE.md#post-api-v1-google-apis-demo-routes) |
| GET | `/api/v1/google-apis/demo/static-map` | No requireAuth guard | [Reference](../API_REFERENCE.md#get-api-v1-google-apis-demo-static-map) |
| POST | `/api/v1/google-apis/test` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-google-apis-test) |
| POST | `/api/v1/i18n` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-i18n) |
| GET | `/api/v1/i18n/:lang` | No requireAuth guard | [Reference](../API_REFERENCE.md#get-api-v1-i18n-lang) |
| POST | `/api/v1/i18n/auto-translate` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-i18n-auto-translate) |
| POST | `/api/v1/i18n/bulk` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-i18n-bulk) |
| GET | `/api/v1/i18n/keys` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-i18n-keys) |
| POST | `/api/v1/i18n/keys` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-i18n-keys) |
| DELETE | `/api/v1/i18n/keys/:id` | Bearer | [Reference](../API_REFERENCE.md#delete-api-v1-i18n-keys-id) |
| PUT | `/api/v1/i18n/keys/:id` | Bearer | [Reference](../API_REFERENCE.md#put-api-v1-i18n-keys-id) |
| GET | `/api/v1/i18n/languages` | No requireAuth guard | [Reference](../API_REFERENCE.md#get-api-v1-i18n-languages) |
| POST | `/api/v1/i18n/languages` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-i18n-languages) |
| DELETE | `/api/v1/i18n/languages/:id` | Bearer | [Reference](../API_REFERENCE.md#delete-api-v1-i18n-languages-id) |
| PUT | `/api/v1/i18n/languages/:id` | Bearer | [Reference](../API_REFERENCE.md#put-api-v1-i18n-languages-id) |
| POST | `/api/v1/i18n/translate-single` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-i18n-translate-single) |
| GET | `/api/v1/me/support/tickets` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-me-support-tickets) |
| GET | `/api/v1/reports` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-reports) |
| DELETE | `/api/v1/reports/:id` | Bearer | [Reference](../API_REFERENCE.md#delete-api-v1-reports-id) |
| GET | `/api/v1/reports/:id` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-reports-id) |
| POST | `/api/v1/reports/generate` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-reports-generate) |
| GET | `/api/v1/support/tickets` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-support-tickets) |
| POST | `/api/v1/support/tickets` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-support-tickets) |
| GET | `/api/v1/support/tickets/:id` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-support-tickets-id) |
| POST | `/api/v1/support/tickets/:id/messages` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-support-tickets-id-messages) |
| PATCH | `/api/v1/support/tickets/:id/status` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-support-tickets-id-status) |
| POST | `/api/v1/uploads` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-uploads) |
| POST | `/api/v1/uploads/document` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-uploads-document) |
| DELETE | `/api/v1/uploads/document/:id` | Bearer | [Reference](../API_REFERENCE.md#delete-api-v1-uploads-document-id) |
| POST | `/api/v1/uploads/video` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-uploads-video) |
