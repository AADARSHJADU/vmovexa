# Common Shared Services — API Documentation (Uploads, Support, Reports & Geocoding)

> **Base Path:** `http://localhost:4000/api/v1`  
> **Auth:** All endpoints require `Authorization: Bearer <token>`  
> **Scope:** Shared cross-domain services utilized by multiple user roles.

---

## 📋 Complete Endpoints Summary (20 APIs)

### 1. File & Media Uploads (`/uploads`) (4 APIs)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/uploads/media` | Multipart upload for campaign ads (Videos, Banners, PDFs, Images). Max 500MB |
| `POST` | `/uploads/documents` | Upload compliance KYC docs (Driver license, Vehicle RC, Insurance) |
| `POST` | `/uploads/avatar` | Upload user profile picture |
| `DELETE`| `/uploads/:id` | Delete uploaded file |

### 2. Helpdesk & Support Tickets (`/support` & `/me/support`) (6 APIs)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/me/support/tickets` | List support tickets filed by current logged-in user |
| `POST` | `/me/support/tickets` | File a new support ticket |
| `GET` | `/me/support/tickets/:id` | Get ticket conversation & messages |
| `POST` | `/me/support/tickets/:id/reply`| Post reply in ticket thread |
| `GET` | `/support` | Platform support ticket queue (SuperAdmin & Support agents) |
| `PATCH`| `/support/:id/status` | Update ticket status (`open`, `in_progress`, `resolved`, `closed`) |

### 3. Reports & Data Exports (`/reports` & `/exports`) (4 APIs)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/reports` | List generated analytics reports |
| `POST` | `/reports/generate` | Request on-demand report generation |
| `GET` | `/exports` | List historical export jobs |
| `POST` | `/exports` | Trigger CSV / Excel / PDF data export |

### 4. Google Maps & Geocoding Telematics Proxy (`/google-apis`) (4 APIs)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/google-apis/geocode` | Address to GPS coordinates resolution |
| `GET` | `/google-apis/reverse-geocode`| GPS coordinates to physical address resolution |
| `GET` | `/google-apis/directions` | Compute shortest route path & travel time between stops |
| `GET` | `/google-apis/places-autocomplete`| Real-time search suggestions for transit depots and bus stops |

### 5. Multi-Language & i18n (`/i18n` & `/content`) (2 APIs)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/i18n/translations/:lang` | Fetch localized UI strings (supports 10 Indian languages) |
| `GET` | `/content/pages/:slug` | Fetch terms, privacy policy, or help guides |

---

## 📁 SECTION 1: File Uploads Integration

### 1.1 POST `/uploads/media`
Multipart upload endpoint for campaign ad creatives.

#### Request Headers
```http
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

#### FormData Payload
- `file`: Binary file (MP4, WEBM, JPG, PNG, PDF)
- `category`: `campaign_media` (or `avatar`, `kyc`)

#### Success Response `201`
```json
{
  "success": true,
  "message": "File uploaded successfully.",
  "data": {
    "file_id": "upl_01HX99...",
    "original_filename": "diwali_sale_spot.mp4",
    "mime_type": "video/mp4",
    "size_bytes": 14502000,
    "url": "http://localhost:4000/uploads/campaigns/diwali_sale_spot.mp4",
    "duration_seconds": 30,
    "resolution": "1920x1080"
  }
}
```

---

## 💻 Standard Frontend Service

```javascript
// src/api/services/common.service.js
import apiClient from '../client';

export const commonService = {
  // File Upload
  uploadMedia: (formData, onProgress) =>
    apiClient.post('/uploads/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }),

  // Support Tickets
  getMyTickets: (params) => apiClient.get('/me/support/tickets', { params }),
  createTicket: (data) => apiClient.post('/me/support/tickets', data),
  replyTicket: (id, data) => apiClient.post(`/me/support/tickets/${id}/reply`, data),

  // Google Maps
  getDirections: (origin, destination) =>
    apiClient.get('/google-apis/directions', { params: { origin, destination } }),
  placesAutocomplete: (input) =>
    apiClient.get('/google-apis/places-autocomplete', { params: { input } }),

  // i18n Translations
  getTranslations: (lang) => apiClient.get(`/i18n/translations/${lang}`),
};
```
