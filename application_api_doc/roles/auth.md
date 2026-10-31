# Auth APIs — VMOVEXA ONE (Complete Identity Reference)

> **Base Path:** `https://api.vmovexa.com/api/v1` (Local: `http://localhost:4000/api/v1`)  
> **Total Endpoints:** 35 APIs (All 100% verified against backend route manifests)  
> **Updated:** 2026-10-31  
> **Rate Limit:** Stricter limiter on credential endpoints (`authLimiter` — max 10 attempts per 15 mins)  
> **Authentication:** Protected endpoints require `Authorization: Bearer <access_token>`

See [app developer guide](../APP_DEVELOPER_GUIDE.md) and [complete request reference](../API_REFERENCE.md). For realtime events see [REALTIME_AND_GPS.md](../REALTIME_AND_GPS.md).

---

## 📋 Complete Endpoints Summary (35 APIs)

### 1. Traditional Auth & Registration (15 APIs)
| Method | Endpoint | Auth | Description | Reference |
|---|---|---|---|---|
| `POST` | `/api/v1/auth/accept-invite` | No | Accept staff invitation and set account password | [Reference](../API_REFERENCE.md#post-api-v1-auth-accept-invite) |
| `POST` | `/api/v1/auth/change-password` | **Bearer** | Change authenticated user password | [Reference](../API_REFERENCE.md#post-api-v1-auth-change-password) |
| `POST` | `/api/v1/auth/complete-organization-profile` | **Bearer** | Complete tenant organization details after initial approval | [Reference](../API_REFERENCE.md#post-api-v1-auth-complete-organization-profile) |
| `POST` | `/api/v1/auth/forgot-password` | No | Send password reset OTP / link to email | [Reference](../API_REFERENCE.md#post-api-v1-auth-forgot-password) |
| `POST` | `/api/v1/auth/login-email` | No | Login with email + password (returns JWT or MFA challenge) | [Reference](../API_REFERENCE.md#post-api-v1-auth-login-email) |
| `POST` | `/api/v1/auth/login-phone` | No | Request login OTP for phone number | [Reference](../API_REFERENCE.md#post-api-v1-auth-login-phone) |
| `POST` | `/api/v1/auth/logout` | No | Invalidate refresh token session and revoke access | [Reference](../API_REFERENCE.md#post-api-v1-auth-logout) |
| `POST` | `/api/v1/auth/refresh` | No | Rotate & refresh access token using valid refresh token | [Reference](../API_REFERENCE.md#post-api-v1-auth-refresh) |
| `POST` | `/api/v1/auth/register` | No | Organization tenant self-registration (status: pending_approval) | [Reference](../API_REFERENCE.md#post-api-v1-auth-register) |
| `POST` | `/api/v1/auth/request-signup-otp` | No | Request SMS/Email OTP for registration verification | [Reference](../API_REFERENCE.md#post-api-v1-auth-request-signup-otp) |
| `POST` | `/api/v1/auth/reset-password` | No | Reset password using reset token / code | [Reference](../API_REFERENCE.md#post-api-v1-auth-reset-password) |
| `POST` | `/api/v1/auth/resubmit-registration` | No | Resubmit rejected tenant registration application | [Reference](../API_REFERENCE.md#post-api-v1-auth-resubmit-registration) |
| `GET` | `/api/v1/auth/test-send-sms` | No | Diagnostic endpoint for SMS delivery verification | [Reference](../API_REFERENCE.md#get-api-v1-auth-test-send-sms) |
| `POST` | `/api/v1/auth/verify-otp` | No | Verify phone login OTP or MFA challenge code | [Reference](../API_REFERENCE.md#post-api-v1-auth-verify-otp) |
| `POST` | `/api/v1/auth/verify-signup-otp` | No | Verify registration OTP before submission | [Reference](../API_REFERENCE.md#post-api-v1-auth-verify-signup-otp) |

### 2. User Profile Management (3 APIs)
| Method | Endpoint | Auth | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/auth/me` | **Bearer** | Fetch current user identity, role, permissions, and tenant organization | [Reference](../API_REFERENCE.md#get-api-v1-auth-me) |
| `PATCH` | `/api/v1/auth/me` | **Bearer** | Partially update profile details (name, avatar, phone, preferences) | [Reference](../API_REFERENCE.md#patch-api-v1-auth-me) |
| `PUT` | `/api/v1/auth/me` | **Bearer** | Full profile update for current user | [Reference](../API_REFERENCE.md#put-api-v1-auth-me) |

### 3. Social Authentication & OAuth (13 APIs)
| Method | Endpoint | Auth | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/auth/social` | **Bearer** | List all connected social providers for current authenticated user | [Reference](../API_REFERENCE.md#get-api-v1-auth-social) |
| `DELETE` | `/api/v1/auth/social/:provider/unlink` | **Bearer** | Unlink a connected social provider from current account | [Reference](../API_REFERENCE.md#delete-api-v1-auth-social-provider-unlink) |
| `POST` | `/api/v1/auth/social/apple` | No | Authenticate or register via Apple authorization code/token | [Reference](../API_REFERENCE.md#post-api-v1-auth-social-apple) |
| `GET` | `/api/v1/auth/social/apple/callback` | No | Apple OAuth GET callback fallback | [Reference](../API_REFERENCE.md#get-api-v1-auth-social-apple-callback) |
| `POST` | `/api/v1/auth/social/apple/callback` | No | Apple OAuth form_post callback handler | [Reference](../API_REFERENCE.md#post-api-v1-auth-social-apple-callback) |
| `GET` | `/api/v1/auth/social/apple/url` | No | Generate Apple OAuth authorization URL | [Reference](../API_REFERENCE.md#get-api-v1-auth-social-apple-url) |
| `POST` | `/api/v1/auth/social/firebase/apple` | No | Authenticate existing user via Firebase Apple ID Token | [Reference](../API_REFERENCE.md#post-api-v1-auth-social-firebase-apple) |
| `POST` | `/api/v1/auth/social/firebase/apple/register` | No | Register new tenant organization via Firebase Apple ID Token | [Reference](../API_REFERENCE.md#post-api-v1-auth-social-firebase-apple-register) |
| `POST` | `/api/v1/auth/social/firebase/google` | No | Authenticate existing user via Firebase Google ID Token | [Reference](../API_REFERENCE.md#post-api-v1-auth-social-firebase-google) |
| `POST` | `/api/v1/auth/social/firebase/google/register` | No | Register new tenant organization via Firebase Google ID Token | [Reference](../API_REFERENCE.md#post-api-v1-auth-social-firebase-google-register) |
| `POST` | `/api/v1/auth/social/zoho` | No | Authenticate or register via Zoho OAuth authorization code | [Reference](../API_REFERENCE.md#post-api-v1-auth-social-zoho) |
| `GET` | `/api/v1/auth/social/zoho/callback` | No | Zoho OAuth browser redirect callback bridge | [Reference](../API_REFERENCE.md#get-api-v1-auth-social-zoho-callback) |
| `GET` | `/api/v1/auth/social/zoho/url` | No | Generate Zoho OAuth 2.0 authorization URL | [Reference](../API_REFERENCE.md#get-api-v1-auth-social-zoho-url) |

### 4. Staff Invitations (4 APIs)
| Method | Endpoint | Auth | Permissions | Description | Reference |
|---|---|---|---|---|---|
| `GET` | `/api/v1/invitations` | **Bearer** | `invitations.view` | List invitations for current tenant or platform scope | [Reference](../API_REFERENCE.md#get-api-v1-invitations) |
| `POST` | `/api/v1/invitations` | **Bearer** | `invitations.manage` | Send a new staff member invitation email / SMS | [Reference](../API_REFERENCE.md#post-api-v1-invitations) |
| `DELETE` | `/api/v1/invitations/:id` | **Bearer** | `invitations.manage` | Revoke a pending staff invitation by ID | [Reference](../API_REFERENCE.md#delete-api-v1-invitations-id) |
| `POST` | `/api/v1/invitations/:id/resend` | **Bearer** | `invitations.manage` | Resend invitation email and refresh expiration token | [Reference](../API_REFERENCE.md#post-api-v1-invitations-id-resend) |

---

## 🔑 SECTION 1: Traditional Authentication Flow

### 1.1 `POST /api/v1/auth/login-email`
Login with email address and password. Returns JWT tokens or triggers an MFA challenge.

**Security:** `authLimiter` (10 requests / 15 min). No token required.

**Request Body:**
```json
{
  "email": "admin@vmovexa.com",
  "password": "Password@123"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string (email) | Yes | Registered account email |
| `password` | string | Yes | Account password |

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Indore Fleet Admin",
      "email": "admin@vmovexa.com",
      "phone": "+919876543210",
      "role": "ROLE-TENANT-ADMIN",
      "organization_id": 1,
      "organization_name": "Indore City Transport",
      "permissions": [
        "fleet.vehicles.view",
        "fleet.drivers.view",
        "fleet.routes.view"
      ]
    }
  }
}
```

Controller Contract: [POST /api/v1/auth/login-email](../CONTROLLER_CONTRACTS.md#post-api-v1-auth-login-email)

### 1.2 `POST /api/v1/auth/login-phone`
Initiates phone-based login by sending an SMS OTP to the user.

**Request Body:**
```json
{
  "phone": "+919876543210",
  "password": "OptionalPassword123"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `phone` | string | Yes | E.164 phone number format |
| `password` | string | No | Account password if phone+password login is enabled |

Controller Contract: [POST /api/v1/auth/login-phone](../CONTROLLER_CONTRACTS.md#post-api-v1-auth-login-phone)

### 1.3 `POST /api/v1/auth/verify-otp`
Verifies phone login OTP or an MFA step-up security challenge.

**Request Body:**
```json
{
  "identifier": "+919876543210",
  "code": "849201"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `identifier` | string | Yes | Phone number or email identifier |
| `code` | string (6 chars) | Yes | 6-digit one-time numeric passcode |

Controller Contract: [POST /api/v1/auth/verify-otp](../CONTROLLER_CONTRACTS.md#post-api-v1-auth-verify-otp)

### 1.4 `POST /api/v1/auth/register`
Self-registration for new tenant organizations. Application status is initialized to `pending_approval` for SuperAdmin review.

**Request Body:**
```json
{
  "organizationName": "Shree Travels Indore",
  "name": "Ramesh Sharma",
  "email": "ramesh@shreetravels.com",
  "phone": "+919876543210",
  "password": "SecurePassword@123",
  "state": "Madhya Pradesh",
  "city": "Indore",
  "cin": "U60200MP2020PTC012345",
  "gstin": "23AAAAA0000A1Z5"
}
```

Controller Contract: [POST /api/v1/auth/register](../CONTROLLER_CONTRACTS.md#post-api-v1-auth-register)

### 1.5 `POST /api/v1/auth/resubmit-registration`
Allows rejected applicant organizations to correct business details and resubmit their tenant onboarding application.

Controller Contract: [POST /api/v1/auth/resubmit-registration](../CONTROLLER_CONTRACTS.md#post-api-v1-auth-resubmit-registration)

### 1.6 `POST /api/v1/auth/request-signup-otp` & 1.7 `POST /api/v1/auth/verify-signup-otp`
Verification flow during self-registration to validate phone/email ownership before submitting organization details.

Controller Contracts: [POST /api/v1/auth/request-signup-otp](../CONTROLLER_CONTRACTS.md#post-api-v1-auth-request-signup-otp) | [POST /api/v1/auth/verify-signup-otp](../CONTROLLER_CONTRACTS.md#post-api-v1-auth-verify-signup-otp)

### 1.8 `POST /api/v1/auth/forgot-password` & 1.9 `POST /api/v1/auth/reset-password`
Password recovery pipeline. Dispatches temporary 6-digit reset code via email/SMS; code is then verified with new password.

**Reset Request Body:**
```json
{
  "email": "user@vmovexa.com",
  "code": "849201",
  "newPassword": "NewStrongPassword@2026"
}
```

Controller Contracts: [POST /api/v1/auth/forgot-password](../CONTROLLER_CONTRACTS.md#post-api-v1-auth-forgot-password) | [POST /api/v1/auth/reset-password](../CONTROLLER_CONTRACTS.md#post-api-v1-auth-reset-password)

### 1.10 `POST /api/v1/auth/accept-invite`
Completes staff invitation onboarding. Validates cryptographic invitation token and establishes user password.

**Request Body:**
```json
{
  "token": "inv_tok_928dfa32b...",
  "password": "StaffPassword@123"
}
```

Controller Contract: [POST /api/v1/auth/accept-invite](../CONTROLLER_CONTRACTS.md#post-api-v1-auth-accept-invite)

### 1.11 `POST /api/v1/auth/refresh` & 1.12 `POST /api/v1/auth/logout`
Session token rotation and termination. Refresh returns a new short-lived access token; logout invalidates the token family.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Controller Contracts: [POST /api/v1/auth/refresh](../CONTROLLER_CONTRACTS.md#post-api-v1-auth-refresh) | [POST /api/v1/auth/logout](../CONTROLLER_CONTRACTS.md#post-api-v1-auth-logout)

### 1.13 `POST /api/v1/auth/change-password` & 1.14 `POST /api/v1/auth/complete-organization-profile`
Authenticated security and tenant profile management.

Controller Contracts: [POST /api/v1/auth/change-password](../CONTROLLER_CONTRACTS.md#post-api-v1-auth-change-password) | [POST /api/v1/auth/complete-organization-profile](../CONTROLLER_CONTRACTS.md#post-api-v1-auth-complete-organization-profile)

### 1.15 `GET /api/v1/auth/test-send-sms`
Gateway diagnostic route for Twilio SMS dispatch and configuration verification.

Controller Contract: [GET /api/v1/auth/test-send-sms](../CONTROLLER_CONTRACTS.md#get-api-v1-auth-test-send-sms)

---

## 👤 SECTION 2: Authenticated User Profile

### 2.1 `GET /api/v1/auth/me`
Fetches current authenticated session user, role object, permissions list, and tenant affiliation.

**Headers:** `Authorization: Bearer <access_token>`

Controller Contract: [GET /api/v1/auth/me](../CONTROLLER_CONTRACTS.md#get-api-v1-auth-me)

### 2.2 `PATCH /api/v1/auth/me` & 2.3 `PUT /api/v1/auth/me`
Updates user profile fields such as display name, avatar URL, phone, or UI preferences.

Controller Contracts: [PATCH /api/v1/auth/me](../CONTROLLER_CONTRACTS.md#patch-api-v1-auth-me) | [PUT /api/v1/auth/me](../CONTROLLER_CONTRACTS.md#put-api-v1-auth-me)

---

## 🌐 SECTION 3: Social Authentication & OAuth

VMOVEXA supports Firebase Google, Zoho OAuth 2.0, and Apple Sign-In for browser and mobile apps.

### 3.1 Firebase Google Login & Registration
- `POST /api/v1/auth/social/firebase/google`: Pass `{ idToken }` to authenticate existing user. [Contract](../CONTROLLER_CONTRACTS.md#post-api-v1-auth-social-firebase-google)
- `POST /api/v1/auth/social/firebase/google/register`: Submit tenant onboarding with `{ idToken, organizationName, phone, city, state }`. [Contract](../CONTROLLER_CONTRACTS.md#post-api-v1-auth-social-firebase-google-register)

### 3.2 Zoho OAuth 2.0 Integration
- `GET /api/v1/auth/social/zoho/url`: Generates authorization redirect URL. [Contract](../CONTROLLER_CONTRACTS.md#get-api-v1-auth-social-zoho-url)
- `POST /api/v1/auth/social/zoho`: Exchanges `{ code, redirectUri }` for tokens. [Contract](../CONTROLLER_CONTRACTS.md#post-api-v1-auth-social-zoho)
- `GET /api/v1/auth/social/zoho/callback`: Browser redirect fallback bridge. [Contract](../CONTROLLER_CONTRACTS.md#get-api-v1-auth-social-zoho-callback)

### 3.3 Apple Sign-In
- `GET /api/v1/auth/social/apple/url`: Generates Apple Sign-In redirect URL. [Contract](../CONTROLLER_CONTRACTS.md#get-api-v1-auth-social-apple-url)
- `POST /api/v1/auth/social/apple`: Exchanges `{ code, idToken, user }` for tokens. [Contract](../CONTROLLER_CONTRACTS.md#post-api-v1-auth-social-apple)
- `POST /api/v1/auth/social/apple/callback`: OAuth `form_post` browser bridge. [Contract](../CONTROLLER_CONTRACTS.md#post-api-v1-auth-social-apple-callback)
- `GET /api/v1/auth/social/apple/callback`: GET fallback redirect bridge. [Contract](../CONTROLLER_CONTRACTS.md#get-api-v1-auth-social-apple-callback)
- `POST /api/v1/auth/social/firebase/apple`: Mobile Firebase Apple token login. [Contract](../CONTROLLER_CONTRACTS.md#post-api-v1-auth-social-firebase-apple)
- `POST /api/v1/auth/social/firebase/apple/register`: Tenant registration via Apple ID token. [Contract](../CONTROLLER_CONTRACTS.md#post-api-v1-auth-social-firebase-apple-register)

### 3.4 Provider Links Management
- `GET /api/v1/auth/social`: Lists linked social identity providers. [Contract](../CONTROLLER_CONTRACTS.md#get-api-v1-auth-social)
- `DELETE /api/v1/auth/social/:provider/unlink`: Unlinks provider (`google`, `zoho`, `apple`). [Contract](../CONTROLLER_CONTRACTS.md#delete-api-v1-auth-social-provider-unlink)

---

## ✉️ SECTION 4: Staff Invitations Pipeline

Tenant Admins and SuperAdmins use these endpoints to invite internal personnel (Fleet Managers, Drivers, Technicians, Finance Officers).

### 4.1 `GET /api/v1/invitations`
Lists pending and historical invitations. Platform scope allows filtering across organizations.

**Permission Required:** `invitations.view`

Controller Contract: [GET /api/v1/invitations](../CONTROLLER_CONTRACTS.md#get-api-v1-invitations)

### 4.2 `POST /api/v1/invitations`
Creates and dispatches an invitation link to the recipient email or phone.

**Permission Required:** `invitations.manage`

**Request Body:**
```json
{
  "name": "Mohan Lal",
  "email": "mohan@indoretransit.com",
  "phone": "+919876543211",
  "roleId": 4,
  "organizationId": 1
}
```

Controller Contract: [POST /api/v1/invitations](../CONTROLLER_CONTRACTS.md#post-api-v1-invitations)

### 4.3 `POST /api/v1/invitations/:id/resend`
Re-dispatches the invitation with an extended expiration token.

**Permission Required:** `invitations.manage`

Controller Contract: [POST /api/v1/invitations/:id/resend](../CONTROLLER_CONTRACTS.md#post-api-v1-invitations-id-resend)

### 4.4 `DELETE /api/v1/invitations/:id`
Revokes an invitation, preventing the token from being accepted.

**Permission Required:** `invitations.manage`

Controller Contract: [DELETE /api/v1/invitations/:id](../CONTROLLER_CONTRACTS.md#delete-api-v1-invitations-id)

