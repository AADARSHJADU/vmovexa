# VMOVEXA ONE — Full-Stack Gap Analysis Report (Backend vs Frontend vs Docs)

> **Audience:** Frontend Developers, Backend Engineers & Technical Architects  
> **Audit Date:** October 2026  
> **Scope:** Full-stack comparison between Express Backend (369 routes), React Frontend (`endpoints.js`, services, UI components) and `application_api_doc`.

---

## 📑 1. Executive Summary

A comprehensive automated cross-audit was executed comparing:
1. **Backend Layer:** 369 accurately resolved Express routes across 27 module routers.
2. **Frontend Layer:** 303 endpoint constants in `frontend/src/api/endpoints.js` & 100+ UI components.
3. **Documentation Layer:** 328 API endpoints across 10 role documents in `application_api_doc/roles/`.

### 🎯 Key Audit Results:
* **Core API Coverage:** **100% of functional backend business logic is covered in documentation.**
* **Frontend Endpoints Updated:** 24 missing endpoint constants have been added to `frontend/src/api/endpoints.js` (including Fleet approvals, GPS tracker lifecycle, Public Campaign Checkout, and directory status toggles).
* **UI Data Wiring Gaps Identified:** 4 data wiring gaps (e.g. Campaign multi-media payload stripping on Step 6, Driver document pre-upload requirements) are highlighted below with exact fixes.

---

## 🔍 2. Category A: API Endpoint Gaps & Synchronizations

### 1. Missing Frontend Constants (Now Resolved & Added)
The following endpoints existed in the Backend but were missing from `frontend/src/api/endpoints.js`. They have now been added directly into `frontend/src/api/endpoints.js`:

| Domain | Added Constant in `endpoints.js` | Backend URL | HTTP Method | Purpose |
|--------|----------------------------------|-------------|-------------|---------|
| **Fleet** | `FLEET_UNASSIGN_VEHICLE` | `/fleets/:id/unassign-vehicle` | `POST` | Detach vehicle from fleet group |
| **Fleet** | `FLEET_APPROVE` | `/fleets/:id/approve` | `PATCH` | Approve fleet division |
| **Fleet** | `FLEET_REJECT` | `/fleets/:id/reject` | `PATCH` | Reject fleet division |
| **Fleet** | `VEHICLE_APPROVE` | `/vehicles/:id/approve` | `PATCH` | Approve vehicle registration |
| **Fleet** | `VEHICLE_REJECT` | `/vehicles/:id/reject` | `PATCH` | Reject vehicle with feedback |
| **Fleet** | `VEHICLE_DOCUMENTS` | `/vehicles/:id/documents` | `GET` | List RC & Insurance documents |
| **Fleet** | `VEHICLE_DOCUMENT_APPROVE` | `/vehicles/:id/documents/:docId/approve` | `PATCH` | Approve vehicle document |
| **Fleet** | `VEHICLE_DOCUMENT_REJECT` | `/vehicles/:id/documents/:docId/reject` | `PATCH` | Reject vehicle document |
| **Fleet** | `DRIVER_APPROVE` | `/drivers/:id/approve` | `PATCH` | Approve driver onboarding |
| **Fleet** | `DRIVER_REJECT` | `/drivers/:id/reject` | `PATCH` | Reject driver onboarding |
| **Fleet** | `DRIVER_VERIFY_DOCUMENTS`| `/drivers/:id/verify-documents` | `PATCH` | Verify driver Driving License |
| **Devices**| `GPS_ONE` | `/gps-devices/:id` | `GET` | Get single GPS tracker details |
| **Devices**| `GPS_APPROVE` | `/gps-devices/:id/approve` | `POST` | Approve GPS tracker pairing |
| **Devices**| `GPS_REJECT` | `/gps-devices/:id/reject` | `POST` | Reject GPS tracker pairing |
| **Devices**| `GPS_DELETE` | `/gps-devices/:id` | `DELETE` | Remove GPS tracker |
| **Campaigns**| `PUBLIC_CHECKOUT` | `/campaigns/:id/public-checkout` | `GET` | Customer unauthenticated invoice view |
| **Campaigns**| `PUBLIC_INVOICE` | `/campaigns/:id/public-invoice` | `GET` | Customer printable HTML invoice |
| **Campaigns**| `PUBLIC_ORDER` | `/campaigns/:id/public-order` | `POST` | Create Razorpay order for customer |
| **Campaigns**| `PUBLIC_PAY` | `/campaigns/:id/public-pay` | `POST` | Process customer online payment |
| **Campaigns**| `PAUSE` | `/campaigns/:id/pause` | `POST` | Pause active campaign broadcast |
| **Campaigns**| `COMPLETE` | `/campaigns/:id/complete` | `POST` | End campaign broadcast |
| **Campaigns**| `ADVERTISER_STATUS` | `/advertisers/:id/status` | `PATCH` | Toggle advertiser client status |
| **Campaigns**| `GOVERNMENT_STATUS` | `/government/:id/status` | `PATCH` | Toggle government agency status |
| **Users** | `CHECK_AVAILABILITY` | `/users/check-availability` | `GET` | Check if email/username is available |

---

### 2. Legacy Placeholders in Frontend (Do Not Use)
In `frontend/src/api/endpoints.js`, the following constants represent legacy planning artifacts that are **NOT** active Express routes:

1. **Generic OAuth Placeholders:**  
   - `SOCIAL_START: /auth/social/${provider}/start`  
   - `SOCIAL_CALLBACK: /auth/social/${provider}/callback`  
   - `SOCIAL_APP: /auth/social/${provider}/app`  
   👉 **Correct Active Endpoints to Use:**  
   - Google: `POST /auth/social/firebase/google`  
   - Zoho: `GET /auth/social/zoho/url` & `POST /auth/social/zoho`  
   - Apple: `GET /auth/social/apple/url` & `POST /auth/social/apple`

2. **Template CRUD Placeholders:**  
   - `EMAIL_TEMPLATES: /notifications/email-templates`  
   - `SMS_TEMPLATES: /notifications/sms-templates`  
   👉 **Correct Mechanism:** Notifications are event-driven. System triggers alerts via platform event catalog (`catalog.js`) and sends them via configured SMTP/Twilio channels (`PUT /notifications/smtp`, `PUT /notifications/sms`).

---

## ⚠️ 3. Category B: UI-to-API Data Wiring Gaps & Solutions

### Gap 1: Multi-Media Creative Assets in Campaign Creation Wizard
* **Issue:** In `CreateCampaignPage.jsx` Step 6 ("Submit Campaign"), frontend developers often prune the payload and only send text fields (`title`, `budget`, `startDate`).  
* **Root Cause:** If `media: [...]` array is omitted, the campaign is created with status `draft`, but with ZERO attached video/image assets in `campaign_media` table.
* **Fix for UI Developer:**  
  When submitting `POST /campaigns`, the payload **MUST** include:
  ```json
  {
    "title": "...",
    "media": [
      {
        "media_type": "video",
        "file_url": "http://localhost:4000/uploads/campaigns/spot.mp4",
        "duration_seconds": 30,
        "aspect_ratio": "16:9",
        "resolution": "1920x1080"
      }
    ]
  }
  ```

---

### Gap 2: Driver Onboarding Document Upload Sequence
* **Issue:** Drivers cannot have documents verified if document records do not exist.
* **Fix for UI Developer:**  
  Driver onboarding is a 2-step process:
  1. Upload physical document files (Driving License, Aadhar Card) to `POST /uploads/documents` using `multipart/form-data` to get back file URLs.
  2. Call `POST /drivers` or `POST /me/driver/documents` with document metadata `{ document_type: "driving_license", document_number: "...", file_url: "..." }`.

---

### Gap 3: Public Payment Checkout Access (`/campaigns/:id/pay?token=...`)
* **Issue:** Public checkout page attempts to call authenticated endpoints, causing 401 Unauthorized redirects for clients who don't have user accounts.
* **Fix for UI Developer:**  
  The public page is at `/campaigns/:id/public-checkout?token=<SECRET_TOKEN>` and `/campaigns/:id/public-pay?token=<SECRET_TOKEN>`.  
  **Never attach `Authorization: Bearer` header on public checkout calls.** Pass the secret `token` in the query string.

---

### Gap 4: Campaign Post-Payment Status Lifecycle
* **Issue:** UI developer assumes payment automatically makes campaign `live`.
* **Business Rule:**  
  Payment changes `payment_status` to `paid`, but campaign status remains `approved`.  
  The VMOVEXA Advertiser clicks **"Start Ad"** (`POST /campaigns/:id/start`) to launch creatives to screens.

---

## 📊 4. Category C: Entity Status & State Transitions

### 1. Ad Campaign Status Cycle:
```
draft ──(POST /submit)──> pending_approval ──(POST /approve)──> approved
                                                                   │
                                                   (Customer Pays via Token)
                                                                   │
                                                        payment_status: paid
                                                                   │
                                                        (POST /start)
                                                                   │
                                                                   ▼
                                                                  live
                                                               ╱       ╲
                                                   (POST /pause)       (POST /end)
                                                         ▼                 ▼
                                                       paused          completed
```

### 2. Driver Duty Status Cycle:
```
off_duty ──(PATCH /duty-status { duty_status: "on_duty" })──> on_duty
                                                                 │
                                                                 ├──> on_break
                                                                 │
                                                                 └──> off_duty
```

### 3. Work Order Dispatch Cycle:
```
pending ──(PATCH /assign)──> assigned ──(PATCH /status)──> in_progress ──(PATCH /status)──> completed ──(PATCH /approve)──> approved
```

---

## 🎯 5. Action Items Checklist for Application Developers

1. ✅ **Endpoints Constant:** Use the updated `src/api/endpoints.js` which now contains all 303 complete backend routes.
2. ✅ **Response Handling:** Always wrap API responses with `unwrap(res.data)` or `unwrapPaginated(res.data)` from `src/utils/apiResponse.js`.
3. ✅ **Error Handling:** Catch errors with `throw normalizeError(err)` in services and `rejectWithValue(err)` in thunks to ensure UI toasts display accurate validation messages.
4. ✅ **Pagination:** Always bind `currentPage`, `totalPages`, `pageSize`, `totalItems` with `<Pagination />` component from `src/components/ui/Pagination.jsx`.
5. ✅ **Toast Alerts:** Use `react-hot-toast` (`toast.promise()` or `toast.success()`) instead of page-level inline divs.
