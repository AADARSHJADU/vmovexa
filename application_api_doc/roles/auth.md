# auth API index

Updated: 2026-10-28. 35 route entries. This grouping is navigation only: access is determined by actual permissions and tenant/controller rules, not by this filename. Shared routes can be used by multiple roles.

See [app developer guide](../APP_DEVELOPER_GUIDE.md) and [complete request reference](../API_REFERENCE.md). For realtime events see [REALTIME_AND_GPS.md](../REALTIME_AND_GPS.md).

| Method | Path | Authentication | Request / access details |
|---|---|---|---|
| POST | `/api/v1/auth/accept-invite` | No requireAuth guard | [Reference](../API_REFERENCE.md#post-api-v1-auth-accept-invite) |
| POST | `/api/v1/auth/change-password` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-auth-change-password) |
| POST | `/api/v1/auth/complete-organization-profile` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-auth-complete-organization-profile) |
| POST | `/api/v1/auth/forgot-password` | No requireAuth guard | [Reference](../API_REFERENCE.md#post-api-v1-auth-forgot-password) |
| POST | `/api/v1/auth/login-email` | No requireAuth guard | [Reference](../API_REFERENCE.md#post-api-v1-auth-login-email) |
| POST | `/api/v1/auth/login-phone` | No requireAuth guard | [Reference](../API_REFERENCE.md#post-api-v1-auth-login-phone) |
| POST | `/api/v1/auth/logout` | No requireAuth guard | [Reference](../API_REFERENCE.md#post-api-v1-auth-logout) |
| GET | `/api/v1/auth/me` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-auth-me) |
| PATCH | `/api/v1/auth/me` | Bearer | [Reference](../API_REFERENCE.md#patch-api-v1-auth-me) |
| PUT | `/api/v1/auth/me` | Bearer | [Reference](../API_REFERENCE.md#put-api-v1-auth-me) |
| POST | `/api/v1/auth/refresh` | No requireAuth guard | [Reference](../API_REFERENCE.md#post-api-v1-auth-refresh) |
| POST | `/api/v1/auth/register` | No requireAuth guard | [Reference](../API_REFERENCE.md#post-api-v1-auth-register) |
| POST | `/api/v1/auth/request-signup-otp` | No requireAuth guard | [Reference](../API_REFERENCE.md#post-api-v1-auth-request-signup-otp) |
| POST | `/api/v1/auth/reset-password` | No requireAuth guard | [Reference](../API_REFERENCE.md#post-api-v1-auth-reset-password) |
| POST | `/api/v1/auth/resubmit-registration` | No requireAuth guard | [Reference](../API_REFERENCE.md#post-api-v1-auth-resubmit-registration) |
| GET | `/api/v1/auth/social` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-auth-social) |
| DELETE | `/api/v1/auth/social/:provider/unlink` | Bearer | [Reference](../API_REFERENCE.md#delete-api-v1-auth-social-provider-unlink) |
| POST | `/api/v1/auth/social/apple` | No requireAuth guard | [Reference](../API_REFERENCE.md#post-api-v1-auth-social-apple) |
| GET | `/api/v1/auth/social/apple/callback` | No requireAuth guard | [Reference](../API_REFERENCE.md#get-api-v1-auth-social-apple-callback) |
| POST | `/api/v1/auth/social/apple/callback` | No requireAuth guard | [Reference](../API_REFERENCE.md#post-api-v1-auth-social-apple-callback) |
| GET | `/api/v1/auth/social/apple/url` | No requireAuth guard | [Reference](../API_REFERENCE.md#get-api-v1-auth-social-apple-url) |
| POST | `/api/v1/auth/social/firebase/apple` | No requireAuth guard | [Reference](../API_REFERENCE.md#post-api-v1-auth-social-firebase-apple) |
| POST | `/api/v1/auth/social/firebase/apple/register` | No requireAuth guard | [Reference](../API_REFERENCE.md#post-api-v1-auth-social-firebase-apple-register) |
| POST | `/api/v1/auth/social/firebase/google` | No requireAuth guard | [Reference](../API_REFERENCE.md#post-api-v1-auth-social-firebase-google) |
| POST | `/api/v1/auth/social/firebase/google/register` | No requireAuth guard | [Reference](../API_REFERENCE.md#post-api-v1-auth-social-firebase-google-register) |
| POST | `/api/v1/auth/social/zoho` | No requireAuth guard | [Reference](../API_REFERENCE.md#post-api-v1-auth-social-zoho) |
| GET | `/api/v1/auth/social/zoho/callback` | No requireAuth guard | [Reference](../API_REFERENCE.md#get-api-v1-auth-social-zoho-callback) |
| GET | `/api/v1/auth/social/zoho/url` | No requireAuth guard | [Reference](../API_REFERENCE.md#get-api-v1-auth-social-zoho-url) |
| GET | `/api/v1/auth/test-send-sms` | No requireAuth guard | [Reference](../API_REFERENCE.md#get-api-v1-auth-test-send-sms) |
| POST | `/api/v1/auth/verify-otp` | No requireAuth guard | [Reference](../API_REFERENCE.md#post-api-v1-auth-verify-otp) |
| POST | `/api/v1/auth/verify-signup-otp` | No requireAuth guard | [Reference](../API_REFERENCE.md#post-api-v1-auth-verify-signup-otp) |
| GET | `/api/v1/invitations` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-invitations) |
| POST | `/api/v1/invitations` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-invitations) |
| DELETE | `/api/v1/invitations/:id` | Bearer | [Reference](../API_REFERENCE.md#delete-api-v1-invitations-id) |
| POST | `/api/v1/invitations/:id/resend` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-invitations-id-resend) |
