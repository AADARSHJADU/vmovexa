# Common Platform Services — API Documentation

> **Scope:** Shared Utility Services (Uploads, i18n, CMS, Google Maps, Reports, Support)  
> **Base Path:** `https://api.vmovexa.com/api/v1` (Local: `http://localhost:4000/api/v1`)  
> **Total Endpoints:** 47 APIs (All 100% verified against backend route manifests)  
> **Updated:** 2026-10-31  
> **Public Routes:** Certain CMS (`/content/:type`), i18n language bundles (`/i18n/:lang`), and Google Maps demo proxies require no auth

See [app developer guide](../APP_DEVELOPER_GUIDE.md) and [complete request reference](../API_REFERENCE.md). For realtime events see [REALTIME_AND_GPS.md](../REALTIME_AND_GPS.md).

---

## 📋 Complete Endpoints Summary (47 APIs)

### 1. Multipart Media & File Uploads (4 APIs)
| Method | Endpoint | Auth | Description | Reference |
|---|---|---|---|---|
| `POST` | `/api/v1/uploads` | **Bearer** | Upload standard image asset (PNG, JPG, WebP) | [Reference](../API_REFERENCE.md#post-api-v1-uploads) |
| `POST` | `/api/v1/uploads/document` | **Bearer** | Upload PDF / image compliance document | [Reference](../API_REFERENCE.md#post-api-v1-uploads-document) |
| `DELETE` | `/api/v1/uploads/document/:id` | **Bearer** | Delete uploaded document asset | [Reference](../API_REFERENCE.md#delete-api-v1-uploads-document-id) |
| `POST` | `/api/v1/uploads/video` | **Bearer** | Upload commercial MP4 video creative (Max: 100MB) | [Reference](../API_REFERENCE.md#post-api-v1-uploads-video) |

### 2. Internationalization (i18n) Engine (13 APIs)
| Method | Endpoint | Auth | Description | Reference |
|---|---|---|---|---|
| `POST` | `/api/v1/i18n` | **Bearer** | Set single translation value | [Reference](../API_REFERENCE.md#post-api-v1-i18n) |
| `GET` | `/api/v1/i18n/:lang` | No | Fetch compiled JSON dictionary for language code (e.g. `en`, `hi`, `mr`) | [Reference](../API_REFERENCE.md#get-api-v1-i18n-lang) |
| `POST` | `/api/v1/i18n/auto-translate` | **Bearer** | Auto-translate missing localization keys via AI / Google Translate | [Reference](../API_REFERENCE.md#post-api-v1-i18n-auto-translate) |
| `POST` | `/api/v1/i18n/bulk` | **Bearer** | Bulk update translated strings for language | [Reference](../API_REFERENCE.md#post-api-v1-i18n-bulk) |
| `GET` | `/api/v1/i18n/keys` | **Bearer** | Master localization keys dictionary | [Reference](../API_REFERENCE.md#get-api-v1-i18n-keys) |
| `POST` | `/api/v1/i18n/keys` | **Bearer** | Master localization keys dictionary | [Reference](../API_REFERENCE.md#post-api-v1-i18n-keys) |
| `DELETE` | `/api/v1/i18n/keys/:id` | **Bearer** | Master localization keys dictionary | [Reference](../API_REFERENCE.md#delete-api-v1-i18n-keys-id) |
| `PUT` | `/api/v1/i18n/keys/:id` | **Bearer** | Master localization keys dictionary | [Reference](../API_REFERENCE.md#put-api-v1-i18n-keys-id) |
| `GET` | `/api/v1/i18n/languages` | No | List active supported languages (10 Indian languages seeded) | [Reference](../API_REFERENCE.md#get-api-v1-i18n-languages) |
| `POST` | `/api/v1/i18n/languages` | **Bearer** | Language CRUD management | [Reference](../API_REFERENCE.md#post-api-v1-i18n-languages) |
| `DELETE` | `/api/v1/i18n/languages/:id` | **Bearer** | Language CRUD management | [Reference](../API_REFERENCE.md#delete-api-v1-i18n-languages-id) |
| `PUT` | `/api/v1/i18n/languages/:id` | **Bearer** | Language CRUD management | [Reference](../API_REFERENCE.md#put-api-v1-i18n-languages-id) |
| `POST` | `/api/v1/i18n/translate-single` | **Bearer** | Translate a single string on the fly | [Reference](../API_REFERENCE.md#post-api-v1-i18n-translate-single) |

### 3. Google Maps & Geocoding Integrations (8 APIs)
| Method | Endpoint | Auth | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/google-apis` | **Bearer** | Fetch Google Maps integration configuration | [Reference](../API_REFERENCE.md#get-api-v1-google-apis) |
| `PUT` | `/api/v1/google-apis` | **Bearer** | Update Google Maps API key | [Reference](../API_REFERENCE.md#put-api-v1-google-apis) |
| `POST` | `/api/v1/google-apis/demo/geocode` | No | Forward/Reverse geocoding proxy | [Reference](../API_REFERENCE.md#post-api-v1-google-apis-demo-geocode) |
| `POST` | `/api/v1/google-apis/demo/places` | No | Autocomplete place search proxy | [Reference](../API_REFERENCE.md#post-api-v1-google-apis-demo-places) |
| `POST` | `/api/v1/google-apis/demo/roads` | No | Snap-to-roads route optimization | [Reference](../API_REFERENCE.md#post-api-v1-google-apis-demo-roads) |
| `POST` | `/api/v1/google-apis/demo/routes` | No | Calculate transit route polyline & duration | [Reference](../API_REFERENCE.md#post-api-v1-google-apis-demo-routes) |
| `GET` | `/api/v1/google-apis/demo/static-map` | No | Generate static preview map image | [Reference](../API_REFERENCE.md#get-api-v1-google-apis-demo-static-map) |
| `POST` | `/api/v1/google-apis/test` | **Bearer** | Test validity of configured Google API keys | [Reference](../API_REFERENCE.md#post-api-v1-google-apis-test) |

### 4. Content Management & FAQs (10 APIs)
| Method | Endpoint | Auth | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/content` | No | Platform CMS articles and announcements | [Reference](../API_REFERENCE.md#get-api-v1-content) |
| `POST` | `/api/v1/content` | **Bearer** | Platform CMS articles and announcements | [Reference](../API_REFERENCE.md#post-api-v1-content) |
| `DELETE` | `/api/v1/content/:id` | **Bearer** | Platform CMS articles and announcements | [Reference](../API_REFERENCE.md#delete-api-v1-content-id) |
| `PATCH` | `/api/v1/content/:id` | **Bearer** | Platform CMS articles and announcements | [Reference](../API_REFERENCE.md#patch-api-v1-content-id) |
| `POST` | `/api/v1/content/:id/publish` | **Bearer** | Publish draft CMS page | [Reference](../API_REFERENCE.md#post-api-v1-content-id-publish) |
| `GET` | `/api/v1/content/:type` | No | Fetch public legal terms, privacy policy, or help document | [Reference](../API_REFERENCE.md#get-api-v1-content-type) |
| `GET` | `/api/v1/content/faqs` | **Bearer** | Help center FAQ questions & answers | [Reference](../API_REFERENCE.md#get-api-v1-content-faqs) |
| `POST` | `/api/v1/content/faqs` | **Bearer** | Help center FAQ questions & answers | [Reference](../API_REFERENCE.md#post-api-v1-content-faqs) |
| `DELETE` | `/api/v1/content/faqs/:id` | **Bearer** | Help center FAQ questions & answers | [Reference](../API_REFERENCE.md#delete-api-v1-content-faqs-id) |
| `PATCH` | `/api/v1/content/faqs/:id` | **Bearer** | Help center FAQ questions & answers | [Reference](../API_REFERENCE.md#patch-api-v1-content-faqs-id) |

### 5. Helpdesk & Support Tickets (6 APIs)
| Method | Endpoint | Auth | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/me/support/tickets` | **Bearer** | List tickets opened by logged-in user | [Reference](../API_REFERENCE.md#get-api-v1-me-support-tickets) |
| `GET` | `/api/v1/support/tickets` | **Bearer** | List all tenant / platform support tickets | [Reference](../API_REFERENCE.md#get-api-v1-support-tickets) |
| `POST` | `/api/v1/support/tickets` | **Bearer** | Open a new customer support ticket | [Reference](../API_REFERENCE.md#post-api-v1-support-tickets) |
| `GET` | `/api/v1/support/tickets/:id` | **Bearer** | Get single ticket conversation thread | [Reference](../API_REFERENCE.md#get-api-v1-support-tickets-id) |
| `POST` | `/api/v1/support/tickets/:id/messages` | **Bearer** | Post reply message to support conversation | [Reference](../API_REFERENCE.md#post-api-v1-support-tickets-id-messages) |
| `PATCH` | `/api/v1/support/tickets/:id/status` | **Bearer** | Update ticket lifecycle status (open, pending, closed) | [Reference](../API_REFERENCE.md#patch-api-v1-support-tickets-id-status) |

### 6. Reports & Data Exports (6 APIs)
| Method | Endpoint | Auth | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/reports` | **Bearer** | Platform analytics & scheduled reporting | [Reference](../API_REFERENCE.md#get-api-v1-reports) |
| `DELETE` | `/api/v1/reports/:id` | **Bearer** | Platform analytics & scheduled reporting | [Reference](../API_REFERENCE.md#delete-api-v1-reports-id) |
| `GET` | `/api/v1/reports/:id` | **Bearer** | Platform analytics & scheduled reporting | [Reference](../API_REFERENCE.md#get-api-v1-reports-id) |
| `POST` | `/api/v1/reports/generate` | **Bearer** | Generate asynchronous CSV / PDF report job | [Reference](../API_REFERENCE.md#post-api-v1-reports-generate) |
| `GET` | `/api/v1/exports` | **Bearer** | List GDPR / organizational bulk data export | [Reference](../API_REFERENCE.md#get-api-v1-exports) |
| `POST` | `/api/v1/exports` | **Bearer** | Request GDPR / organizational bulk data export | [Reference](../API_REFERENCE.md#post-api-v1-exports) |

---

