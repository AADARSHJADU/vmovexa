# Auth APIs — VMOVEXA ONE (Complete Identity Reference)

> **Base Path:** `http://localhost:4000/api/v1`  
> **Rate Limit:** Auth endpoints have stricter rate limiting (`authLimiter` — max 10 attempts per 15 mins)  
> **Headers:** Protected endpoints require `Authorization: Bearer <access_token>`

---

## 📋 Complete Endpoints Summary (35 APIs)

### 1. Traditional Auth & Registration (16 APIs)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | No | Organization tenant self-registration |
| `POST` | `/auth/request-signup-otp` | No | Request SMS/Email OTP for registration verification |
| `POST` | `/auth/verify-signup-otp` | No | Verify registration OTP |
| `POST` | `/auth/resubmit-registration` | No | Resubmit rejected tenant registration application |
| `POST` | `/auth/login-email` | No | Login with email + password (returns JWT or MFA challenge) |
| `POST` | `/auth/login-phone` | No | Request login OTP for phone number |
| `POST` | `/auth/verify-otp` | No | Verify phone login OTP or MFA challenge |
| `POST` | `/auth/forgot-password` | No | Send password reset link to email |
| `POST` | `/auth/reset-password` | No | Reset password using reset token |
| `POST` | `/auth/accept-invite` | No | Accept staff invitation and set password |
| `POST` | `/auth/refresh` | No | Rotate & refresh access token using refresh token |
| `POST` | `/auth/logout` | No | Invalidate refresh token session |
| `GET` | `/auth/me` | **Yes** | Current authenticated user profile, role & permissions |
| `PATCH` | `/auth/me` | **Yes** | Update personal profile details (name, avatar, phone) |
| `POST` | `/auth/change-password` | **Yes** | Change password with current & new password |
| `POST` | `/auth/complete-organization-profile` | **Yes** | Complete tenant profile after registration |

### 2. Social Authentication & OAuth (13 APIs)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/social/firebase/google` | No | Login existing user via Firebase Google ID Token |
| `POST` | `/auth/social/firebase/google/register` | No | Register new tenant org via Firebase Google ID Token |
| `GET` | `/auth/social/zoho/url` | No | Generate Zoho OAuth Authorization URL |
| `POST` | `/auth/social/zoho` | No | Authenticate or Register via Zoho OAuth authorization code |
| `GET` | `/auth/social/zoho/callback` | No | Zoho OAuth browser callback bridge redirect |
| `GET` | `/auth/social/apple/url` | No | Generate Apple OAuth Authorization URL |
| `POST` | `/auth/social/apple` | No | Authenticate or Register via Apple authorization code/token |
| `POST` | `/auth/social/apple/callback` | No | Apple OAuth POST callback bridge redirect |
| `GET` | `/auth/social/apple/callback` | No | Apple OAuth GET fallback redirect |
| `POST` | `/auth/social/firebase/apple` | No | Login existing user via Firebase Apple ID Token |
| `POST` | `/auth/social/firebase/apple/register` | No | Register new tenant org via Firebase Apple ID Token |
| `GET` | `/auth/social` | **Yes** | List all connected social providers for current user |
| `DELETE` | `/auth/social/:provider/unlink` | **Yes** | Unlink a connected social provider (`google`, `zoho`, `apple`) |

### 3. Staff Invitations & Utilities (6 APIs)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/invitations/validate/:token` | No | Validate staff invitation token before showing set password form |
| `POST` | `/invitations/:token/accept` | No | Accept staff invitation and activate account |
| `GET` | `/invitations` | **Yes** | SuperAdmin/Tenant list pending staff invitations |
| `POST` | `/invitations` | **Yes** | Send new staff invitation email |
| `DELETE` | `/invitations/:id` | **Yes** | Revoke pending staff invitation |
| `GET` | `/auth/test-send-sms` | No | Diagnostic test endpoint for SMS gateway delivery |

---

## 🔑 SECTION 1: Traditional Authentication Flow

### 1.1 POST `/auth/login-email`
Login with email address and password. Returns JWT tokens or triggers MFA challenge.

#### Request Body
```json
{
  "email": "admin@vmovexa.com",
  "password": "Password@123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Registered email address |
| `password` | string | Yes | Account password (min 6 chars) |

#### Success Response `200`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr_01HX87AB...",
      "name": "Fleet Administrator",
      "email": "admin@vmovexa.com",
      "phone": "+919876543210",
      "role": "ROLE-TENANT-ADMIN",
      "organization_id": "org_01HX...",
      "organization_name": "Indore City Transport Ltd",
      "permissions": [
        "fleet.vehicles.view", "fleet.vehicles.create", "fleet.vehicles.update",
        "fleet.drivers.view", "fleet.routes.view", "fleet.trips.view"
      ]
    }
  }
}
```

#### MFA Required Response `200`
```json
{
  "success": true,
  "message": "MFA verification required. OTP sent to registered phone.",
  "data": {
    "mfa_required": true,
    "mfa_token": "mfa_temp_token_01HX...",
    "phone_masked": "+91 ******3210"
  }
}
```

#### Error Responses
```json
// 401 Unauthorized
{ "success": false, "message": "Invalid email or password", "error": "UNAUTHORIZED" }

// 403 Account Inactive / Pending Approval
{ "success": false, "message": "Tenant registration pending SuperAdmin approval", "error": "ACCOUNT_PENDING" }

// 429 Too Many Requests
{ "success": false, "message": "Too many failed attempts. Please retry after 15 minutes.", "error": "RATE_LIMIT_EXCEEDED" }
```

---

### 1.2 POST `/auth/login-phone`
Send SMS OTP for phone-based login.

#### Request Body
```json
{
  "phone": "9876543210"
}
```

#### Success Response `200`
```json
{
  "success": true,
  "message": "OTP sent successfully to +919876543210",
  "data": {
    "phone": "9876543210",
    "expires_in_seconds": 300
  }
}
```

---

### 1.3 POST `/auth/verify-otp`
Verify SMS OTP for phone login or MFA challenge.

#### Request Body
```json
{
  "phone": "9876543210",
  "otp": "849201",
  "mfa_token": "optional_if_mfa_flow"
}
```

#### Success Response `200`
Returns access token, refresh token, and user object identical to `/auth/login-email`.

---

### 1.4 POST `/auth/register` (Tenant Self-Registration)
Public registration form for new transport operators / fleet organizations.

#### Request Body
```json
{
  "organization_name": "Bhopal Metro Transit Services",
  "business_type": "fleet_operator",
  "registration_number": "MP04-REG-2026-9901",
  "tax_id": "23AAAAA0000A1Z5",
  "contact_name": "Rajesh Verma",
  "email": "rajesh@bhopaltransit.in",
  "phone": "9826012345",
  "password": "Password@123",
  "address": "Transit Complex, Hoshangabad Road",
  "city": "Bhopal",
  "state": "Madhya Pradesh",
  "pincode": "462001"
}
```

#### Success Response `201`
```json
{
  "success": true,
  "message": "Registration application submitted. Awaiting SuperAdmin verification.",
  "data": {
    "organization_id": "org_01HX98...",
    "status": "pending_approval",
    "submitted_at": "2026-10-10T06:00:00.000Z"
  }
}
```

---

### 1.5 POST `/auth/refresh`
Silent refresh token rotation to obtain a fresh access token without user interruption.

#### Request Body
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Success Response `200`
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 1.6 GET `/auth/me`
Fetch current authenticated user profile, tenant organization, and permission list.

**Headers:** `Authorization: Bearer <access_token>`

#### Success Response `200`
```json
{
  "success": true,
  "data": {
    "id": "usr_01HX87AB...",
    "name": "Fleet Administrator",
    "email": "admin@vmovexa.com",
    "phone": "+919876543210",
    "avatar_url": "http://localhost:4000/uploads/avatars/user-123.jpg",
    "role": "ROLE-TENANT-ADMIN",
    "organization_id": "org_01HX...",
    "organization": {
      "id": "org_01HX...",
      "name": "Indore City Transport Ltd",
      "status": "active",
      "plan": "ENTERPRISE_FLEET"
    },
    "permissions": [
      "fleet.vehicles.view", "fleet.vehicles.create", "fleet.vehicles.update",
      "fleet.drivers.view", "fleet.routes.view", "fleet.trips.view"
    ]
  }
}
```

---

### 1.7 POST `/auth/change-password`
Change password for authenticated user.

**Headers:** `Authorization: Bearer <access_token>`

#### Request Body
```json
{
  "current_password": "OldPassword@123",
  "new_password": "NewPassword@456"
}
```

#### Success Response `200`
```json
{
  "success": true,
  "message": "Password updated successfully."
}
```

---

## 🌐 SECTION 2: Social & OAuth Authentication

### 2.1 POST `/auth/social/firebase/google`
Authenticate an existing user using Google ID token issued by Firebase SDK on client.

#### Request Body
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjFkZj..."
}
```

#### Success Response `200`
```json
{
  "success": true,
  "message": "Google login successful.",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr_01HX...",
      "name": "Amit Sharma",
      "email": "amit.sharma@gmail.com",
      "role": "ROLE-ADVERTISER"
    }
  }
}
```

---

### 2.2 GET `/auth/social/zoho/url`
Generate Zoho OAuth login/registration consent URL.

#### Query Params
- `redirectUri` (optional): `http://localhost:5173/auth/zoho/callback`

#### Success Response `200`
```json
{
  "success": true,
  "data": {
    "url": "https://accounts.zoho.com/oauth/v2/auth?scope=ZohoCRM.users.READ&client_id=1000...&response_type=code&redirect_uri=..."
  }
}
```

---

### 2.3 POST `/auth/social/zoho`
Exchange authorization code received from Zoho redirect.

#### Request Body
```json
{
  "code": "1000.74b34f89d...",
  "redirectUri": "http://localhost:5173/auth/zoho/callback",
  "mode": "login" // or "register"
}
```

---

### 2.4 GET `/auth/social`
List linked social identities for authenticated user profile.

**Headers:** `Authorization: Bearer <access_token>`

#### Success Response `200`
```json
{
  "success": true,
  "data": [
    { "provider": "google", "email": "admin@vmovexa.com", "linked_at": "2026-05-10T11:00:00.000Z" },
    { "provider": "zoho", "email": "admin@zoho.com", "linked_at": "2026-06-12T14:30:00.000Z" }
  ]
}
```

---

### 2.5 DELETE `/auth/social/:provider/unlink`
Unlink third-party provider account (`google`, `zoho`, `apple`).

**Headers:** `Authorization: Bearer <access_token>`

---

## 📩 SECTION 3: Staff Invitations Flow

### 3.1 GET `/invitations/validate/:token`
Public verification endpoint when a invited staff clicks the link in invitation email.

#### Success Response `200`
```json
{
  "success": true,
  "data": {
    "valid": true,
    "email": "driver.manager@vmovexa.com",
    "organization_name": "Indore City Transport Ltd",
    "role": "ROLE-FLEET-OPERATOR",
    "expires_at": "2026-10-17T06:00:00.000Z"
  }
}
```

---

### 3.2 POST `/invitations/:token/accept`
Set password and activate staff account.

#### Request Body
```json
{
  "password": "Password@2026",
  "name": "Kavita Rao",
  "phone": "9827011223"
}
```

#### Success Response `200`
```json
{
  "success": true,
  "message": "Invitation accepted. Account activated.",
  "data": {
    "access_token": "eyJhbGci...",
    "refresh_token": "eyJhbGci...",
    "user": { ... }
  }
}
```

---

## 💻 Standard Frontend Architecture (`apiClient` + Hook)

```javascript
// src/api/services/auth.service.js
import apiClient from '../client';
import ENDPOINTS from '../endpoints';

export const authService = {
  loginEmail: (creds) => apiClient.post(ENDPOINTS.AUTH.LOGIN_EMAIL, creds),
  loginPhone: (data) => apiClient.post(ENDPOINTS.AUTH.LOGIN_PHONE, data),
  verifyOtp: (data) => apiClient.post(ENDPOINTS.AUTH.VERIFY_OTP, data),
  register: (data) => apiClient.post(ENDPOINTS.AUTH.REGISTER, data),
  getMe: () => apiClient.get(ENDPOINTS.AUTH.ME),
  updateMe: (data) => apiClient.patch(ENDPOINTS.AUTH.ME, data),
  changePassword: (data) => apiClient.post(ENDPOINTS.AUTH.CHANGE_PASSWORD, data),
  refreshToken: (token) => apiClient.post(ENDPOINTS.AUTH.REFRESH, { refresh_token: token }),
  logout: () => apiClient.post(ENDPOINTS.AUTH.LOGOUT),
  
  // Social
  googleLogin: (idToken) => apiClient.post('/auth/social/firebase/google', { idToken }),
  getZohoAuthUrl: () => apiClient.get('/auth/social/zoho/url'),
  zohoExchange: (code, mode) => apiClient.post('/auth/social/zoho', { code, mode }),
};
```

---

## 🔗 Frontend Architecture & File Reference
- **Services:** `src/api/services/auth.service.js`
- **Thunks:** `src/store/thunks/auth.thunks.js` (`loginEmailThunk`, `loginPhoneThunk`, `fetchMeThunk`, `logoutThunk`)
- **Slices:** `src/store/slices/authSlice.js` (`selectCurrentUser`, `selectIsAuthenticated`, `selectAuthLoading`)
- **Custom Hook:** `src/hooks/useAuth.js`
- **Token Persistence:** `src/utils/storage.js` (`storage.getAccessToken()`, `storage.setTokens()`)
- **Pages:** `src/pages/auth/` (`LoginPage.jsx`, `RegisterPage.jsx`, `ForgotPasswordPage.jsx`, `ResetPasswordPage.jsx`, `AcceptInvitePage.jsx`)
- **Integration Blueprint:** See [FRONTEND_INTEGRATION_GUIDE.md](file:///e:/vmovexa/application_api_doc/FRONTEND_INTEGRATION_GUIDE.md)

