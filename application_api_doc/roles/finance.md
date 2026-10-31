# Finance & Billing Portal — API Documentation (Accounting & Subscriptions Reference)

> **Role:** `ROLE-FINANCE` / `ROLE-SUPERADMIN`  
> **Base Path:** `https://api.vmovexa.com/api/v1` (Local: `http://localhost:4000/api/v1`)  
> **Total Endpoints:** 50 APIs (All 100% verified against backend route manifests)  
> **Updated:** 2026-10-31  
> **Authentication:** Standard API calls require `Authorization: Bearer <access_token>`  
> **Webhooks:** Payment webhooks (`/webhooks/:gateway`) verify raw HMAC request body signatures without auth tokens

See [app developer guide](../APP_DEVELOPER_GUIDE.md) and [complete request reference](../API_REFERENCE.md). For realtime events see [REALTIME_AND_GPS.md](../REALTIME_AND_GPS.md).

---

## 📋 Complete Endpoints Summary (50 APIs)

### 1. Billing & Subscriptions (27 APIs)
| Method | Endpoint | Permissions | Description | Reference |
|---|---|---|---|---|
| `POST` | `/api/v1/billing/cron/check-expiries` | `billing.subscriptions.manage`, `finance.subscriptions.manage` | Trigger automated subscription renewal & expiry cron | [Reference](../API_REFERENCE.md#post-api-v1-billing-cron-check-expiries) |
| `GET` | `/api/v1/billing/gateways` | `billing.plans.manage`, `billing.plans.view`, `platform.settings` | Payment gateway integration configuration & simulation | [Reference](../API_REFERENCE.md#get-api-v1-billing-gateways) |
| `PUT` | `/api/v1/billing/gateways/:id` | `billing.plans.manage`, `billing.plans.view`, `platform.settings` | Payment gateway integration configuration & simulation | [Reference](../API_REFERENCE.md#put-api-v1-billing-gateways-id) |
| `POST` | `/api/v1/billing/gateways/:id/simulate-order` | `billing.plans.manage`, `billing.plans.view`, `platform.settings` | Payment gateway integration configuration & simulation | [Reference](../API_REFERENCE.md#post-api-v1-billing-gateways-id-simulate-order) |
| `POST` | `/api/v1/billing/gateways/:id/test` | `billing.plans.manage`, `billing.plans.view`, `platform.settings` | Payment gateway integration configuration & simulation | [Reference](../API_REFERENCE.md#post-api-v1-billing-gateways-id-test) |
| `POST` | `/api/v1/billing/gateways/:id/test-connection` | `billing.plans.manage`, `billing.plans.view`, `platform.settings` | Payment gateway integration configuration & simulation | [Reference](../API_REFERENCE.md#post-api-v1-billing-gateways-id-test-connection) |
| `GET` | `/api/v1/billing/invoices` | `billing.subscriptions.view`, `billing.invoices.view`, `finance.invoices.view`, `billing.transactions.view`, `billing.view` | Platform & tenant invoice ledger management | [Reference](../API_REFERENCE.md#get-api-v1-billing-invoices) |
| `GET` | `/api/v1/billing/invoices/:id` | `billing.subscriptions.view`, `billing.invoices.view`, `finance.invoices.view`, `billing.transactions.view`, `billing.view` | Platform & tenant invoice ledger management | [Reference](../API_REFERENCE.md#get-api-v1-billing-invoices-id) |
| `GET` | `/api/v1/billing/invoices/:id/html` | `billing.subscriptions.view`, `billing.invoices.view`, `finance.invoices.view`, `billing.transactions.view`, `billing.view` | Render printable tax invoice HTML / PDF receipt | [Reference](../API_REFERENCE.md#get-api-v1-billing-invoices-id-html) |
| `POST` | `/api/v1/billing/invoices/:id/pay` | `billing.subscriptions.view`, `billing.invoices.view`, `finance.invoices.view`, `billing.transactions.view`, `billing.view` | Initiate gateway checkout for subscription invoice | [Reference](../API_REFERENCE.md#post-api-v1-billing-invoices-id-pay) |
| `GET` | `/api/v1/billing/plans` | None | Platform SaaS tier subscription plans CRUD | [Reference](../API_REFERENCE.md#get-api-v1-billing-plans) |
| `POST` | `/api/v1/billing/plans` | `billing.plans.manage`, `billing.plans.view`, `platform.settings` | Platform SaaS tier subscription plans CRUD | [Reference](../API_REFERENCE.md#post-api-v1-billing-plans) |
| `DELETE` | `/api/v1/billing/plans/:id` | `billing.plans.manage`, `billing.plans.view`, `platform.settings` | Platform SaaS tier subscription plans CRUD | [Reference](../API_REFERENCE.md#delete-api-v1-billing-plans-id) |
| `PUT` | `/api/v1/billing/plans/:id` | `billing.plans.manage`, `billing.plans.view`, `platform.settings` | Platform SaaS tier subscription plans CRUD | [Reference](../API_REFERENCE.md#put-api-v1-billing-plans-id) |
| `GET` | `/api/v1/billing/revenue/settlements` | `billing.revenue.view`, `finance.settlements.view` | Revenue split analytics, operator shares & platform earnings | [Reference](../API_REFERENCE.md#get-api-v1-billing-revenue-settlements) |
| `GET` | `/api/v1/billing/revenue/shares` | `billing.revenue.view`, `finance.settlements.view` | Revenue split analytics, operator shares & platform earnings | [Reference](../API_REFERENCE.md#get-api-v1-billing-revenue-shares) |
| `GET` | `/api/v1/billing/revenue/summary` | `billing.revenue.view`, `finance.settlements.view` | Revenue split analytics, operator shares & platform earnings | [Reference](../API_REFERENCE.md#get-api-v1-billing-revenue-summary) |
| `GET` | `/api/v1/billing/revenue/top-tenants` | `billing.revenue.view`, `finance.settlements.view` | Revenue split analytics, operator shares & platform earnings | [Reference](../API_REFERENCE.md#get-api-v1-billing-revenue-top-tenants) |
| `GET` | `/api/v1/billing/subscription` | `billing.subscriptions.view`, `billing.invoices.view`, `finance.invoices.view`, `billing.transactions.view`, `billing.view` | Tenant active subscription status & tier entitlement | [Reference](../API_REFERENCE.md#get-api-v1-billing-subscription) |
| `GET` | `/api/v1/billing/subscription/check-status` | None | Tenant active subscription status & tier entitlement | [Reference](../API_REFERENCE.md#get-api-v1-billing-subscription-check-status) |
| `POST` | `/api/v1/billing/subscription/check-status` | None | Tenant active subscription status & tier entitlement | [Reference](../API_REFERENCE.md#post-api-v1-billing-subscription-check-status) |
| `POST` | `/api/v1/billing/subscription/confirm` | None | Verify payment signature & activate subscription tier | [Reference](../API_REFERENCE.md#post-api-v1-billing-subscription-confirm) |
| `POST` | `/api/v1/billing/subscription/order` | None | Create Cashfree / Razorpay subscription order | [Reference](../API_REFERENCE.md#post-api-v1-billing-subscription-order) |
| `POST` | `/api/v1/billing/subscription/verify-session` | None | Tenant active subscription status & tier entitlement | [Reference](../API_REFERENCE.md#post-api-v1-billing-subscription-verify-session) |
| `GET` | `/api/v1/billing/transactions` | `billing.subscriptions.view`, `billing.invoices.view`, `finance.invoices.view`, `billing.transactions.view`, `billing.view` | Payment transaction audit log | [Reference](../API_REFERENCE.md#get-api-v1-billing-transactions) |
| `POST` | `/api/v1/billing/transactions/manual-offline` | `billing.subscriptions.manage`, `finance.subscriptions.manage` | Record manual offline bank wire / RTGS transaction | [Reference](../API_REFERENCE.md#post-api-v1-billing-transactions-manual-offline) |
| `GET` | `/api/v1/billing/wallet` | None | Tenant prepaid wallet balance & credits | [Reference](../API_REFERENCE.md#get-api-v1-billing-wallet) |

### 2. General Ledger, GST & Reconciliation (22 APIs)
| Method | Endpoint | Permissions | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/finance/campaign-payments` | `finance.payments.view` | Transit ad campaign client payment records & offline settlement | [Reference](../API_REFERENCE.md#get-api-v1-finance-campaign-payments) |
| `POST` | `/api/v1/finance/campaign-payments/:id/manual-pay` | `finance.payments.manage`, `finance.payments.create`, `finance.payments.update` | Transit ad campaign client payment records & offline settlement | [Reference](../API_REFERENCE.md#post-api-v1-finance-campaign-payments-id-manual-pay) |
| `POST` | `/api/v1/finance/campaign-payments/:id/share-link` | `finance.payments.manage`, `finance.payments.create`, `finance.payments.update` | Transit ad campaign client payment records & offline settlement | [Reference](../API_REFERENCE.md#post-api-v1-finance-campaign-payments-id-share-link) |
| `GET` | `/api/v1/finance/gst/gstr1-json` | `finance.gst.view`, `finance.gst.manage`, `finance.gst.create`, `finance.gst.update` | Export government compliant GSTR-1 JSON return payload | [Reference](../API_REFERENCE.md#get-api-v1-finance-gst-gstr1-json) |
| `GET` | `/api/v1/finance/gst/summary` | `finance.gst.view`, `finance.gst.manage`, `finance.gst.create`, `finance.gst.update` | Monthly GST tax liability overview (CGST, SGST, IGST) | [Reference](../API_REFERENCE.md#get-api-v1-finance-gst-summary) |
| `GET` | `/api/v1/finance/invoices` | `finance.invoices.view` | Generate and view tax invoices for ad campaigns | [Reference](../API_REFERENCE.md#get-api-v1-finance-invoices) |
| `POST` | `/api/v1/finance/invoices` | `finance.invoices.create`, `finance.invoices.manage` | Generate and view tax invoices for ad campaigns | [Reference](../API_REFERENCE.md#post-api-v1-finance-invoices) |
| `GET` | `/api/v1/finance/invoices/:id` | `finance.invoices.view` | Generate and view tax invoices for ad campaigns | [Reference](../API_REFERENCE.md#get-api-v1-finance-invoices-id) |
| `POST` | `/api/v1/finance/invoices/:id/mark-paid` | `finance.invoices.update`, `finance.invoices.manage` | Record manual cheque / UTR payment for ad invoice | [Reference](../API_REFERENCE.md#post-api-v1-finance-invoices-id-mark-paid) |
| `GET` | `/api/v1/finance/kpis` | `finance.dashboard.view` | Finance executive dashboard KPIs (ARR, MRR, DDO, Aging) | [Reference](../API_REFERENCE.md#get-api-v1-finance-kpis) |
| `GET` | `/api/v1/finance/payments` | `finance.payments.view` | Payment collection ledger & transaction receipts | [Reference](../API_REFERENCE.md#get-api-v1-finance-payments) |
| `GET` | `/api/v1/finance/payments/:id` | `finance.payments.view` | Payment collection ledger & transaction receipts | [Reference](../API_REFERENCE.md#get-api-v1-finance-payments-id) |
| `POST` | `/api/v1/finance/payments/:id/send-reminder` | `finance.payments.manage`, `finance.payments.create`, `finance.payments.update` | Send overdue payment reminder via WhatsApp / Email | [Reference](../API_REFERENCE.md#post-api-v1-finance-payments-id-send-reminder) |
| `POST` | `/api/v1/finance/reconciliation/auto-match` | `finance.reconciliation.manage`, `finance.reconciliation.create`, `finance.reconciliation.update`, `finance.settlements.create`, `finance.settlements.update`, `finance.settlements.manage` | Run automated bank statement vs ledger matching engine | [Reference](../API_REFERENCE.md#post-api-v1-finance-reconciliation-auto-match) |
| `POST` | `/api/v1/finance/reconciliation/finalize` | `finance.reconciliation.manage`, `finance.reconciliation.create`, `finance.reconciliation.update`, `finance.settlements.create`, `finance.settlements.update`, `finance.settlements.manage` | Lock and finalize accounting period reconciliation | [Reference](../API_REFERENCE.md#post-api-v1-finance-reconciliation-finalize) |
| `GET` | `/api/v1/finance/reconciliation/summary` | `finance.reconciliation.view`, `finance.reconciliation.manage`, `finance.settlements.view`, `finance.settlements.manage` | Bank reconciliation transaction logs & variances | [Reference](../API_REFERENCE.md#get-api-v1-finance-reconciliation-summary) |
| `GET` | `/api/v1/finance/reconciliation/transactions` | `finance.reconciliation.view`, `finance.reconciliation.manage`, `finance.settlements.view`, `finance.settlements.manage` | Bank reconciliation transaction logs & variances | [Reference](../API_REFERENCE.md#get-api-v1-finance-reconciliation-transactions) |
| `GET` | `/api/v1/finance/report-summary` | `finance.reports.view` | Consolidated financial balance sheet summary | [Reference](../API_REFERENCE.md#get-api-v1-finance-report-summary) |
| `GET` | `/api/v1/finance/settings` | `finance.invoices.view`, `finance.invoices.manage` | Organization legal invoice settings, bank accounts & signatory | [Reference](../API_REFERENCE.md#get-api-v1-finance-settings) |
| `PUT` | `/api/v1/finance/settings` | `finance.invoices.manage`, `finance.invoices.update` | Organization legal invoice settings, bank accounts & signatory | [Reference](../API_REFERENCE.md#put-api-v1-finance-settings) |
| `GET` | `/api/v1/finance/subscriptions` | `finance.subscriptions.view` | SaaS subscription billing accounts overview | [Reference](../API_REFERENCE.md#get-api-v1-finance-subscriptions) |
| `GET` | `/api/v1/finance/subscriptions/:id` | `finance.subscriptions.view` | SaaS subscription billing accounts overview | [Reference](../API_REFERENCE.md#get-api-v1-finance-subscriptions-id) |

### 3. Payment Gateway Webhooks (1 APIs)
| Method | Endpoint | Auth | Description | Reference |
|---|---|---|---|---|
| `POST` | `/api/v1/webhooks/:gateway` | No (HMAC) | Raw webhook handler for Cashfree / Razorpay / Stripe signatures | [Reference](../API_REFERENCE.md#post-api-v1-webhooks-gateway) |

---

## 💰 Key Financial Workflows

### 1. GSTR-1 Export Compliance
- `GET /api/v1/finance/gst/gstr1-json`: Compiles B2B and B2C invoice tables into official GSTN filing schema. [Contract](../CONTROLLER_CONTRACTS.md#get-api-v1-finance-gst-gstr1-json)

### 2. Bank Reconciliation & Settlement
- `POST /api/v1/finance/reconciliation/auto-match`: Reconciles bank statements against recorded invoices by UTR numbers and transaction timestamps.

### 3. Payment Webhook Signature Security
- `POST /api/v1/webhooks/:gateway`: Body is parsed as raw bytes to compute HMAC-SHA256 signature against webhook secret.

