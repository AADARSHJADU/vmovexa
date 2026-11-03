# Finance & Billing Portal — API Documentation (Accounting & Subscriptions Reference)

> **Role:** `ROLE-FINANCE` / `ROLE-FINANCE-OFFICER` & `ROLE-SUPERADMIN`  
> **Base Path:** `https://api.vmovexa.com/api/v1` (Local: `http://localhost:4000/api/v1`)  
> **Total Endpoints:** 66 APIs (All 100% verified against backend route manifests & frontend services)  
> **Updated:** 2026-11-03  
> **Authentication:** Standard API calls require `Authorization: Bearer <access_token>`  
> **Webhooks:** Payment webhooks (`/webhooks/:gateway`) verify raw HMAC request body signatures without auth tokens  
> **Portal Scope:** Platform-wide general ledger, transit ad campaign revenue collections, automated bank reconciliation (BRS), GST compliance (GSTR-1), SaaS operator subscription billing, and revenue share distributions.

See [app developer guide](../APP_DEVELOPER_GUIDE.md) and [complete request reference](../API_REFERENCE.md). For realtime events see [REALTIME_AND_GPS.md](../REALTIME_AND_GPS.md).

---

## 📋 Complete Endpoints Summary (66 APIs)

### 1. General Ledger, GST & Finance Operations (22 APIs)
Mounted at `/api/v1/finance` — provides cross-tenant financial auditing, campaign collections, bank feeds reconciliation, tax liabilities, and corporate invoicing.

| Method | Endpoint | Permissions | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/finance/kpis` | `finance.dashboard.view` | Executive financial overview (MRR, ARR, collections, aging dues, receivables) | [Reference](../API_REFERENCE.md#get-api-v1-finance-kpis) |
| `GET` | `/api/v1/finance/report-summary` | `finance.reports.view` | Consolidated balance sheet telemetry and period revenue statements | [Reference](../API_REFERENCE.md#get-api-v1-finance-report-summary) |
| `GET` | `/api/v1/finance/campaign-payments` | `finance.payments.view` | Approved transit ad campaign payments ledger awaiting client settlement | [Reference](../API_REFERENCE.md#get-api-v1-finance-campaign-payments) |
| `POST` | `/api/v1/finance/campaign-payments/:id/share-link` | `finance.payments.manage`, `finance.payments.create`, `finance.payments.update` | Dispatch instant public payment checkout link to customer via SMS and Email | [Reference](../API_REFERENCE.md#post-api-v1-finance-campaign-payments-id-share-link) |
| `POST` | `/api/v1/finance/campaign-payments/:id/manual-pay` | `finance.payments.manage`, `finance.payments.create`, `finance.payments.update` | Record offline client settlement (Cheque, Bank Wire, RTGS/NEFT, or Cash) | [Reference](../API_REFERENCE.md#post-api-v1-finance-campaign-payments-id-manual-pay) |
| `GET` | `/api/v1/finance/reconciliation/summary` | `finance.reconciliation.view`, `finance.reconciliation.manage`, `finance.settlements.view`, `finance.settlements.manage` | Real bank account balances, active feeds, and reconciliation discrepancy summary | [Reference](../API_REFERENCE.md#get-api-v1-finance-reconciliation-summary) |
| `GET` | `/api/v1/finance/reconciliation/transactions` | `finance.reconciliation.view`, `finance.reconciliation.manage`, `finance.settlements.view`, `finance.settlements.manage` | Audit roster of bank statements vs internal ledger transaction records | [Reference](../API_REFERENCE.md#get-api-v1-finance-reconciliation-transactions) |
| `POST` | `/api/v1/finance/reconciliation/auto-match` | `finance.reconciliation.manage`, `finance.reconciliation.create`, `finance.reconciliation.update`, `finance.settlements.create`, `finance.settlements.update`, `finance.settlements.manage` | Execute rule-based matching engine comparing bank feeds against VMOVEXA ledger | [Reference](../API_REFERENCE.md#post-api-v1-finance-reconciliation-auto-match) |
| `POST` | `/api/v1/finance/reconciliation/finalize` | `finance.reconciliation.manage`, `finance.reconciliation.create`, `finance.reconciliation.update`, `finance.settlements.create`, `finance.settlements.update`, `finance.settlements.manage` | Seal and finalize period reconciliation; generate tamper-proof BRS certificate | [Reference](../API_REFERENCE.md#post-api-v1-finance-reconciliation-finalize) |
| `GET` | `/api/v1/finance/gst/summary` | `finance.gst.view`, `finance.gst.manage`, `finance.gst.create`, `finance.gst.update` | Monthly GST tax liability overview with CGST, SGST, IGST, and taxable turnover | [Reference](../API_REFERENCE.md#get-api-v1-finance-gst-summary) |
| `GET` | `/api/v1/finance/gst/gstr1-json` | `finance.gst.view`, `finance.gst.manage`, `finance.gst.create`, `finance.gst.update` | Export government-compliant GSTR-1 JSON return payload ready for GSTN portal | [Reference](../API_REFERENCE.md#get-api-v1-finance-gst-gstr1-json) |
| `GET` | `/api/v1/finance/invoices` | `finance.invoices.view` | List generated ad campaign and commercial tax invoices with payment states | [Reference](../API_REFERENCE.md#get-api-v1-finance-invoices) |
| `GET` | `/api/v1/finance/invoices/:id` | `finance.invoices.view` | Detailed tax invoice record with itemized line items, GST breakdown and payer info | [Reference](../API_REFERENCE.md#get-api-v1-finance-invoices-id) |
| `POST` | `/api/v1/finance/invoices` | `finance.invoices.create`, `finance.invoices.manage` | Generate a new commercial tax invoice for campaign broadcast or services | [Reference](../API_REFERENCE.md#post-api-v1-finance-invoices) |
| `POST` | `/api/v1/finance/invoices/:id/mark-paid` | `finance.invoices.update`, `finance.invoices.manage` | Record manual UTR, cheque, or bank reference marking invoice as fully settled | [Reference](../API_REFERENCE.md#post-api-v1-finance-invoices-id-mark-paid) |
| `GET` | `/api/v1/finance/payments` | `finance.payments.view` | Payment collection audit trail with gateway UTR IDs, timestamps and methods | [Reference](../API_REFERENCE.md#get-api-v1-finance-payments) |
| `GET` | `/api/v1/finance/payments/:id` | `finance.payments.view` | Individual payment collection receipt and gateway verification metadata | [Reference](../API_REFERENCE.md#get-api-v1-finance-payments-id) |
| `POST` | `/api/v1/finance/payments/:id/send-reminder` | `finance.payments.manage`, `finance.payments.create`, `finance.payments.update` | Send automated overdue payment dunning reminder via Email / SMS / WhatsApp | [Reference](../API_REFERENCE.md#post-api-v1-finance-payments-id-send-reminder) |
| `GET` | `/api/v1/finance/subscriptions` | `finance.subscriptions.view` | Overview of all tenant SaaS subscription billing accounts across the platform | [Reference](../API_REFERENCE.md#get-api-v1-finance-subscriptions) |
| `GET` | `/api/v1/finance/subscriptions/:id` | `finance.subscriptions.view` | Single tenant subscription account profile, plan billing cycle and renewal logs | [Reference](../API_REFERENCE.md#get-api-v1-finance-subscriptions-id) |
| `GET` | `/api/v1/finance/settings` | `finance.invoices.view`, `finance.invoices.manage` | Corporate billing profile, GSTIN, legal company name, bank accounts, signature | [Reference](../API_REFERENCE.md#get-api-v1-finance-settings) |
| `PUT` | `/api/v1/finance/settings` | `finance.invoices.manage`, `finance.invoices.update` | Update corporate invoicing rules, bank accounts, authorized signatory & terms | [Reference](../API_REFERENCE.md#put-api-v1-finance-settings) |

---

### 2. Platform SaaS Billing, Plans & Revenue Splits (27 APIs)
Mounted at `/api/v1/billing` — manages operator subscription plans, self-service checkouts, payment gateway integrations, and fleet operator revenue share splits.

| Method | Endpoint | Permissions | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/billing/revenue/summary` | `billing.revenue.view`, `finance.settlements.view` | High-level platform SaaS earnings, ad revenue splits, and operator disbursements | [Reference](../API_REFERENCE.md#get-api-v1-billing-revenue-summary) |
| `GET` | `/api/v1/billing/revenue/settlements` | `billing.revenue.view`, `finance.settlements.view` | Fleet operator settlement payout ledger and disbursement records | [Reference](../API_REFERENCE.md#get-api-v1-billing-revenue-settlements) |
| `GET` | `/api/v1/billing/revenue/shares` | `billing.revenue.view`, `finance.settlements.view` | Granular revenue split percentages between platform, transit operators, and agencies | [Reference](../API_REFERENCE.md#get-api-v1-billing-revenue-shares) |
| `GET` | `/api/v1/billing/revenue/top-tenants` | `billing.revenue.view`, `finance.settlements.view` | Top revenue-generating tenant organizations by transit screen volume | [Reference](../API_REFERENCE.md#get-api-v1-billing-revenue-top-tenants) |
| `GET` | `/api/v1/billing/invoices` | `billing.subscriptions.view`, `billing.invoices.view`, `finance.invoices.view`, `billing.transactions.view`, `billing.view` | Tenant organization subscription billing invoices | [Reference](../API_REFERENCE.md#get-api-v1-billing-invoices) |
| `GET` | `/api/v1/billing/invoices/:id` | `billing.subscriptions.view`, `billing.invoices.view`, `finance.invoices.view`, `billing.transactions.view`, `billing.view` | Subscription billing invoice details and tax breakdown | [Reference](../API_REFERENCE.md#get-api-v1-billing-invoices-id) |
| `GET` | `/api/v1/billing/invoices/:id/html` | `billing.subscriptions.view`, `billing.invoices.view`, `finance.invoices.view`, `billing.transactions.view`, `billing.view` | Render printable HTML / PDF receipt for tenant subscription invoice | [Reference](../API_REFERENCE.md#get-api-v1-billing-invoices-id-html) |
| `POST` | `/api/v1/billing/invoices/:id/pay` | `billing.subscriptions.view`, `billing.invoices.view`, `finance.invoices.view`, `billing.transactions.view`, `billing.view` | Initiate online gateway checkout session for outstanding subscription invoice | [Reference](../API_REFERENCE.md#post-api-v1-billing-invoices-id-pay) |
| `GET` | `/api/v1/billing/subscription` | `billing.subscriptions.view`, `billing.invoices.view`, `finance.invoices.view`, `billing.transactions.view`, `billing.view` | Current tenant subscription status, active tier, and resource quotas | [Reference](../API_REFERENCE.md#get-api-v1-billing-subscription) |
| `GET` | `/api/v1/billing/subscription/check-status` | None | Query payment provider status for pending subscription checkout | [Reference](../API_REFERENCE.md#get-api-v1-billing-subscription-check-status) |
| `POST` | `/api/v1/billing/subscription/check-status` | None | Verify order settlement status directly with Cashfree / Razorpay APIs | [Reference](../API_REFERENCE.md#post-api-v1-billing-subscription-check-status) |
| `POST` | `/api/v1/billing/subscription/order` | None | Create gateway checkout session order for tenant subscription tier | [Reference](../API_REFERENCE.md#post-api-v1-billing-subscription-order) |
| `POST` | `/api/v1/billing/subscription/confirm` | None | Verify webhook/gateway payment signature and activate tenant plan | [Reference](../API_REFERENCE.md#post-api-v1-billing-subscription-confirm) |
| `POST` | `/api/v1/billing/subscription/verify-session` | None | Validate tenant checkout session token post-redirection | [Reference](../API_REFERENCE.md#post-api-v1-billing-subscription-verify-session) |
| `GET` | `/api/v1/billing/transactions` | `billing.subscriptions.view`, `billing.invoices.view`, `finance.invoices.view`, `billing.transactions.view`, `billing.view` | Complete payment transactions ledger across all tenants | [Reference](../API_REFERENCE.md#get-api-v1-billing-transactions) |
| `POST` | `/api/v1/billing/transactions/manual-offline` | `billing.subscriptions.manage`, `finance.subscriptions.manage` | Record manual offline wire / RTGS settlement for tenant subscription | [Reference](../API_REFERENCE.md#post-api-v1-billing-transactions-manual-offline) |
| `GET` | `/api/v1/billing/wallet` | None | Tenant prepaid credits and transit advertising wallet balance | [Reference](../API_REFERENCE.md#get-api-v1-billing-wallet) |
| `POST` | `/api/v1/billing/cron/check-expiries` | `billing.subscriptions.manage`, `finance.subscriptions.manage` | Trigger automated subscription renewal, grace period, and expiration scanner | [Reference](../API_REFERENCE.md#post-api-v1-billing-cron-check-expiries) |
| `GET` | `/api/v1/billing/plans` | None | List available SaaS subscription tiers (Starter, Growth, State Sovereign) | [Reference](../API_REFERENCE.md#get-api-v1-billing-plans) |
| `POST` | `/api/v1/billing/plans` | `billing.plans.manage`, `billing.plans.view`, `platform.settings` | Create a new subscription tier with bus quotas and display limits | [Reference](../API_REFERENCE.md#post-api-v1-billing-plans) |
| `PUT` | `/api/v1/billing/plans/:id` | `billing.plans.manage`, `billing.plans.view`, `platform.settings` | Update tier pricing, feature entitlements, bus/driver quotas | [Reference](../API_REFERENCE.md#put-api-v1-billing-plans-id) |
| `DELETE` | `/api/v1/billing/plans/:id` | `billing.plans.manage`, `billing.plans.view`, `platform.settings` | Archive or deactivate subscription plan tier | [Reference](../API_REFERENCE.md#delete-api-v1-billing-plans-id) |
| `GET` | `/api/v1/billing/gateways` | `billing.plans.manage`, `billing.plans.view`, `platform.settings` | List configured payment gateways (Cashfree, Razorpay, Stripe) | [Reference](../API_REFERENCE.md#get-api-v1-billing-gateways) |
| `PUT` | `/api/v1/billing/gateways/:id` | `billing.plans.manage`, `billing.plans.view`, `platform.settings` | Update payment gateway credentials, webhook secrets, and sandbox mode | [Reference](../API_REFERENCE.md#put-api-v1-billing-gateways-id) |
| `POST` | `/api/v1/billing/gateways/:id/test-connection` | `billing.plans.manage`, `billing.plans.view`, `platform.settings` | Live test gateway API authentication and ping provider endpoints | [Reference](../API_REFERENCE.md#post-api-v1-billing-gateways-id-test-connection) |
| `POST` | `/api/v1/billing/gateways/:id/test` | `billing.plans.manage`, `billing.plans.view`, `platform.settings` | Secondary alias for gateway connection diagnostics | [Reference](../API_REFERENCE.md#post-api-v1-billing-gateways-id-test) |
| `POST` | `/api/v1/billing/gateways/:id/simulate-order` | `billing.plans.manage`, `billing.plans.view`, `platform.settings` | Simulate test sandbox checkout order to verify end-to-end payment callbacks | [Reference](../API_REFERENCE.md#post-api-v1-billing-gateways-id-simulate-order) |

---

### 3. Financial Statements & Reporting Engine (4 APIs)
Mounted at `/api/v1/reports` — powers the Financial Revenue Reporting Hub (`/finance/reports`), compiling certified statements and exporting auditable CSV packages.

| Method | Endpoint | Permissions | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/reports` | `finance.reports.view`, `reports.view` | List archived financial statements, revenue summaries, and audit exports | [Reference](../API_REFERENCE.md#get-api-v1-reports) |
| `GET` | `/api/v1/reports/:id` | `finance.reports.view`, `reports.view` | Retrieve single compiled financial report metadata, KPI summary and CSV payload | [Reference](../API_REFERENCE.md#get-api-v1-reports-id) |
| `POST` | `/api/v1/reports/generate` | `finance.reports.create`, `finance.reports.export`, `finance.reports.manage` | Compile new financial statement (`campaign_revenue`, `subscription_revenue`, or `gst_summary`) | [Reference](../API_REFERENCE.md#post-api-v1-reports-generate) |
| `DELETE` | `/api/v1/reports/:id` | `finance.reports.create`, `finance.reports.export`, `finance.reports.manage` | Permanently remove or archive financial report record from repository | [Reference](../API_REFERENCE.md#delete-api-v1-reports-id) |

---

### 4. Tenant Bus Operators & Subscription Onboarding (4 APIs)
Mounted at `/api/v1/organizations` — powers the Finance Portal's Tenants & Subscriptions roster (`/finance/subscriptions`) for onboarding and quota reviews.

| Method | Endpoint | Permissions | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/organizations` | `finance.subscriptions.view`, `orgs.view` | List all tenant bus operators, active subscription plans, and billing statuses | [Reference](../API_REFERENCE.md#get-api-v1-organizations) |
| `GET` | `/api/v1/organizations/:id` | `finance.subscriptions.view`, `orgs.view` | Detailed organization profile with fleet size, billing contacts and active tier | [Reference](../API_REFERENCE.md#get-api-v1-organizations-id) |
| `POST` | `/api/v1/organizations` | `finance.subscriptions.create`, `finance.subscriptions.manage`, `orgs.create` | Onboard and provision a new tenant fleet operator with designated subscription tier | [Reference](../API_REFERENCE.md#post-api-v1-organizations) |
| `PATCH` | `/api/v1/organizations/:id/status` | `finance.subscriptions.update`, `finance.subscriptions.manage`, `orgs.suspend` | Suspend, reactivate or lock tenant operator billing and account privileges | [Reference](../API_REFERENCE.md#patch-api-v1-organizations-id-status) |

---

### 5. SuperAdmin Finance Personnel Governance (8 APIs)
Mounted at `/api/v1/users` & `/api/v1/uploads` — powers SuperAdmin's Finance Officers management portal (`/superadmin/finance`), credential dispatch, and compliance documents.

| Method | Endpoint | Permissions | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/users?roleCode=ROLE-FINANCE-OFFICER` | `users.view` | List all platform Finance Officers, delegations, and access statuses | [Reference](../API_REFERENCE.md#get-api-v1-users) |
| `GET` | `/api/v1/users/:id` | `users.view` | Retrieve Finance Officer profile details, contact info, and activity log | [Reference](../API_REFERENCE.md#get-api-v1-users-id) |
| `POST` | `/api/v1/users` | `users.create` | Register new Finance Officer; triggers automated background SMS & Email credential dispatch | [Reference](../API_REFERENCE.md#post-api-v1-users) |
| `PATCH` | `/api/v1/users/:id` | `users.update` | Update officer profile details, phone, department, or assigned organizational scope | [Reference](../API_REFERENCE.md#patch-api-v1-users-id) |
| `PATCH` | `/api/v1/users/:id/status` | `users.update` | Suspend or reactivate Finance Officer login and authorization privileges | [Reference](../API_REFERENCE.md#patch-api-v1-users-id-status) |
| `DELETE` | `/api/v1/users/:id` | `users.delete` | Revoke and soft-delete Finance Officer account from platform | [Reference](../API_REFERENCE.md#delete-api-v1-users-id) |
| `GET` | `/api/v1/users/:id/permissions` | `users.view` | View effective granular financial permissions assigned to the officer | [Reference](../API_REFERENCE.md#get-api-v1-users-id-permissions) |
| `PUT` | `/api/v1/users/:id/permissions` | `users.permissions.manage` | Update granular financial authority overrides (e.g. GST filings, settlement approvals) | [Reference](../API_REFERENCE.md#put-api-v1-users-id-permissions) |

---

### 6. Payment Gateway Webhooks (1 API)
Mounted at `/api/v1/webhooks` — receives asynchronous payment notifications without standard bearer tokens.

| Method | Endpoint | Auth | Description | Reference |
|---|---|---|---|---|
| `POST` | `/api/v1/webhooks/:gateway` | **No (HMAC-SHA256)** | Gateway webhook handler verifying raw request body bytes for Cashfree, Razorpay & Stripe | [Reference](../API_REFERENCE.md#post-api-v1-webhooks-gateway) |

---

## 💰 Key Financial Workflows & Architectural Blueprint

### 1. Bank Reconciliation & Digital BRS Certification
- **Workflow Route:** `/finance/reconciliation` ➔ `/finance/reconciliation/start` ➔ `/finance/reconciliation/success`
- **Mechanism:**
  1. Operating corporate bank account configurations are loaded dynamically from `FinanceSetting` via `GET /api/v1/finance/reconciliation/summary`.
  2. Unreconciled bank feeds are retrieved via `GET /api/v1/finance/reconciliation/transactions`.
  3. Finance Officer triggers rule-based auto-matching via `POST /api/v1/finance/reconciliation/auto-match`, which compares bank statement UTR numbers, amounts, and dates against recorded gateway orders and settlements.
  4. Once all records are cleared, the officer clicks **Finalize & Confirm Reconciliation** (`POST /api/v1/finance/reconciliation/finalize`).
  5. The system transitions to the **Reconciliation Completed Page** (`ReconciliationCompletePage.jsx`), displaying:
     - 4 KPI cards: Account Audited, Audit Period, Closing Ledger Balance, and Zero Net Variance.
     - Official Bank Reconciliation Statement (BRS) Certificate with cryptographic seal (`BRS-YYYYMM-XXXX-OK`).
     - Standard printable and PDF-exportable A4 layout (`window.print()`).

---

### 2. Transit Ad Campaign Payments & Client Checkout
- **Workflow Route:** `/finance/campaign-payments`
- **Distinction (VMOVEXA Business Model):**
  - **Advertiser:** Internal VMOVEXA employee who manages campaign creative assets, transit screens, and routes.
  - **Client / Customer:** External brand or commercial business (e.g. Sharma Traders) responsible for paying the campaign fee.
- **Payment Link Dispatch:**
  1. Once SuperAdmin approves a campaign, it surfaces in the **Campaign Payments Hub** (`GET /api/v1/finance/campaign-payments`).
  2. Finance Officer dispatches the public checkout link to the client via SMS and Email (`POST /api/v1/finance/campaign-payments/:id/share-link`).
  3. Client opens the unauthenticated checkout link (`/campaigns/:id/pay?token=...`) to complete payment online.
- **Manual Settlement:**
  - If client pays via physical cheque, direct NEFT/RTGS wire, or corporate bank transfer, Finance Officer records manual settlement via `POST /api/v1/finance/campaign-payments/:id/manual-pay` with UTR number and receipt notes.

---

### 3. GSTR-1 Tax Return Filing & Statutory Compliance
- **Workflow Route:** `/finance/gst`
- **Mechanism:**
  1. Platform aggregates taxable value, CGST (9%), SGST (9%), and IGST (18%) across transit ad campaigns and SaaS subscription invoices via `GET /api/v1/finance/gst/summary`.
  2. Finance Officer downloads the government-compliant JSON return payload via `GET /api/v1/finance/gst/gstr1-json`.
  3. The JSON structure strictly conforms to the official GSTN schema (sections `b2b`, `b2cl`, `b2cs`, `exp`, `hsn`, and `doc_issue`), allowing one-click upload to the government GST Portal (`gst.gov.in`).

---

### 4. SaaS Subscription Billing & Revenue Share Distribution
- **Workflow Route:** `/finance/subscriptions` and `/finance/reports`
- **Operator Billing:**
  1. Bus operators subscribe to SaaS tiers (`GET /api/v1/billing/plans`): *Starter*, *Growth Enterprise*, or *State Sovereign Enterprise*.
  2. Monthly invoices are generated and tracked in the invoice ledger (`GET /api/v1/billing/invoices`).
  3. Background worker executes nightly expiry scans (`POST /api/v1/billing/cron/check-expiries`) to flag expiring tiers and issue automated dunning notifications.
- **Revenue Share Settlements:**
  - Ad revenues generated on transit screens are split between VMOVEXA platform and transit operators based on contractual ratios (`GET /api/v1/billing/revenue/shares`).
  - Monthly disbursement batches are audited and processed through `GET /api/v1/billing/revenue/settlements`.

---

### 5. Automated Credential Dispatch for Finance Personnel
- **SuperAdmin Route:** `/superadmin/finance/new`
- **Mechanism:**
  1. When SuperAdmin registers a new Finance Officer (`POST /api/v1/users`), secure temporary login credentials (email and password) are generated.
  2. Notifications are queued in the background (`NotificationLog`) using non-blocking asynchronous dispatch.
  3. The background cron worker (`runNotificationQueue`) delivers both:
     - **Email Notification:** Includes official portal login URL (`/finance/dashboard`) and credentials formatted from `finance/created` template.
     - **SMS Alert:** Dispatched via verified transactional SMS route to officer's registered mobile number with login details.
