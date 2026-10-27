# Finance Portal — API Documentation (Corporate Treasury, Invoices, GST & Billing)

> **Role:** `ROLE-FINANCE-OFFICER`  
> **Base Path:** `http://localhost:4000/api/v1`  
> **Auth:** All endpoints require `Authorization: Bearer <token>`  
> **Permissions:** `finance.*`, `billing.*`

---

## 📋 Complete Endpoints Summary (49 APIs)

### 1. Corporate Finance Operations (`/finance`) (22 APIs)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/finance/kpis` | Finance dashboard KPIs (revenue, outstanding receivables, GST collected, MRR) |
| `GET` | `/finance/report-summary` | Monthly financial breakdown & P&L summary |
| `GET` | `/finance/subscriptions` | Cross-tenant active subscription list |
| `GET` | `/finance/subscriptions/:id` | Subscription plan billing contract details |
| `GET` | `/finance/invoices` | List invoices with status, customer & tax filters |
| `GET` | `/finance/invoices/:id` | Invoice details with line items, HSN/SAC codes & tax breakup |
| `POST` | `/finance/invoices` | Manually generate corporate tax invoice |
| `POST` | `/finance/invoices/:id/mark-paid` | Manually record invoice payment receipt (bank transfer, cheque) |
| `GET` | `/finance/payments` | Ledger of all incoming payments & receipts |
| `GET` | `/finance/payments/:id` | Single transaction ledger entry |
| `POST` | `/finance/payments/:id/send-reminder`| Send overdue invoice payment reminder SMS/Email |
| `GET` | `/finance/campaign-payments` | Approved ad campaigns awaiting settlement or link dispatch |
| `POST` | `/finance/campaign-payments/:id/share-link`| Re-dispatch payment link for approved campaign |
| `POST` | `/finance/campaign-payments/:id/manual-pay`| Record manual bank wire/cheque receipt for campaign ad |
| `GET` | `/finance/reconciliation/summary` | Bank reconciliation match status summary |
| `GET` | `/finance/reconciliation/transactions` | Unmatched vs matched bank transactions |
| `POST` | `/finance/reconciliation/auto-match` | AI/rule-based auto-matching of bank statements to invoices |
| `POST` | `/finance/reconciliation/finalize` | Finalize reconciliation batch |
| `GET` | `/finance/gst/summary` | Monthly GST return summary (IGST, CGST, SGST, turnover) |
| `GET` | `/finance/gst/gstr1-json` | Export GSTR-1 compliant JSON file for Government GST portal |
| `GET` | `/finance/settings` | Corporate finance settings (bank details, GSTIN, invoice prefix) |
| `PUT` | `/finance/settings` | Update finance settings & bank accounts |

### 2. Platform Billing, Subscriptions & Gateways (`/billing`) (27 APIs)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/billing/plans` | List available subscription tiers (Free, Pro, Enterprise) |
| `POST` | `/billing/plans` | Create a new subscription tier |
| `PUT` | `/billing/plans/:id` | Edit plan pricing, quotas, features |
| `DELETE` | `/billing/plans/:id` | Archive plan tier |
| `POST` | `/billing/subscription/order` | Create gateway order for tenant subscription renewal |
| `POST` | `/billing/subscription/confirm` | Confirm Razorpay/Stripe subscription payment |
| `POST` | `/billing/subscription/verify-session` | Verify checkout redirect session |
| `GET` | `/billing/subscription/check-status` | Poll payment status of pending subscription |
| `POST` | `/billing/subscription/check-status` | Status check alias |
| `GET` | `/billing/subscription` | Current tenant subscription & quota usage |
| `GET` | `/billing/transactions` | Tenant billing transactions ledger |
| `GET` | `/billing/wallet` | Organization prepaid credits / wallet balance |
| `POST` | `/billing/transactions/manual-offline` | Record offline manual credit/adjustment |
| `POST` | `/billing/cron/check-expiries` | Trigger manual scan for expired subscriptions |
| `GET` | `/billing/invoices` | List tenant subscription invoices |
| `GET` | `/billing/invoices/:id` | Get subscription invoice details |
| `GET` | `/billing/invoices/:id/html` | Printable invoice HTML view |
| `POST` | `/billing/invoices/:id/pay` | Pay open subscription invoice |
| `GET` | `/billing/revenue/summary` | Platform gross merchandise value (GMV) & net revenue |
| `GET` | `/billing/revenue/settlements` | Platform settlements history |
| `GET` | `/billing/revenue/shares` | Revenue share payout records (Fleet operators & VMOVEXA) |
| `GET` | `/billing/revenue/top-tenants` | Highest revenue generating tenants |
| `GET` | `/billing/gateways` | Configured payment gateways (Razorpay, Stripe, PayU) |
| `PUT` | `/billing/gateways/:id` | Update gateway API keys & merchant settings |
| `POST` | `/billing/gateways/:id/test-connection` | Test gateway API credentials |
| `POST` | `/billing/gateways/:id/test` | Test connection alias |
| `POST` | `/billing/gateways/:id/simulate-order` | Sandbox simulated payment order |

---

## 📊 SECTION 1: Finance KPIs & Overview

### 1.1 GET `/finance/kpis`
Dashboard counters and revenue telemetry.

#### Success Response `200`
```json
{
  "success": true,
  "data": {
    "total_revenue_ytd": 24850000.00,
    "revenue_this_month": 4850000.00,
    "revenue_growth_pct": 14.8,
    "outstanding_invoices_amount": 620000.00,
    "overdue_invoices_count": 4,
    "gst_collected_this_month": 873000.00,
    "active_subscriptions_count": 22,
    "average_revenue_per_bus": 11500.00
  }
}
```

---

## 🧾 SECTION 2: Corporate Invoicing & Manual Receipts

### 2.1 POST `/finance/invoices`
Create manual corporate tax invoice.

#### Request Body
```json
{
  "customer_id": "usr_01HX...",
  "organization_id": "org_01HX...",
  "billing_name": "Sharma Electronics Pvt Ltd",
  "billing_address": "45 M.G. Road, Indore, MP 452001",
  "gstin": "23AAAAA0000A1Z5",
  "due_date": "2026-10-25",
  "line_items": [
    {
      "description": "Transit Digital Video Spot (15 Days - 25 Buses)",
      "hsn_sac": "998363",
      "quantity": 1,
      "unit_price": 85000.00,
      "tax_rate": 18
    }
  ]
}
```

#### Success Response `201`
```json
{
  "success": true,
  "message": "Tax invoice generated successfully.",
  "data": {
    "id": "inv_01HX...",
    "invoice_number": "INV-2026-1042",
    "subtotal": 85000.00,
    "tax_amount": 15300.00,
    "total_amount": 100300.00,
    "status": "unpaid",
    "created_at": "2026-10-10T06:00:00.000Z"
  }
}
```

---

### 2.2 POST `/finance/invoices/:id/mark-paid`
Record manual payment receipt for invoice.

#### Request Body
```json
{
  "payment_method": "bank_transfer", // "bank_transfer", "cheque", "neft", "rtgs"
  "reference_number": "UTR-ICICI-20261010-0091",
  "amount_paid": 100300.00,
  "paid_at": "2026-10-10T11:00:00.000Z",
  "notes": "Full payment received via ICICI corporate wire."
}
```

#### Success Response `200`
```json
{
  "success": true,
  "message": "Invoice marked as paid and receipt generated.",
  "data": {
    "invoice_id": "inv_01HX...",
    "status": "paid",
    "paid_at": "2026-10-10T11:00:00.000Z"
  }
}
```

---

## 🏦 SECTION 3: Reconciliation & GST Compliance

### 3.1 POST `/finance/reconciliation/auto-match`
Runs matching engine between uploaded bank statements and outstanding invoices.

#### Success Response `200`
```json
{
  "success": true,
  "data": {
    "total_unreconciled": 18,
    "auto_matched_count": 15,
    "unmatched_count": 3,
    "matched_total_amount": 1420500.00
  }
}
```

---

### 3.2 GET `/finance/gst/gstr1-json`
Export GSTR-1 JSON file for Government GST Portal upload.

#### Query Params
- `month`: `10`
- `year`: `2026`

#### Success Response `200`
Returns standard GSTN-compliant JSON payload containing B2B, B2C, HSN summary, and tax totals.

---

## 💻 Standard Frontend Service Implementation

```javascript
// src/api/services/finance.service.js
import apiClient from '../client';

export const financeService = {
  // KPIs
  getKpis: () => apiClient.get('/finance/kpis'),
  getReportSummary: (params) => apiClient.get('/finance/report-summary', { params }),

  // Invoices & Payments
  getInvoices: (params) => apiClient.get('/finance/invoices', { params }),
  getInvoiceById: (id) => apiClient.get(`/finance/invoices/${id}`),
  generateInvoice: (data) => apiClient.post('/finance/invoices', data),
  markInvoicePaid: (id, data) => apiClient.post(`/finance/invoices/${id}/mark-paid`, data),
  getPayments: (params) => apiClient.get('/finance/payments', { params }),

  // Reconciliation
  getReconciliationSummary: () => apiClient.get('/finance/reconciliation/summary'),
  autoMatchReconciliation: () => apiClient.post('/finance/reconciliation/auto-match'),

  // GST
  getGstSummary: (params) => apiClient.get('/finance/gst/summary', { params }),
  downloadGstr1: (params) => apiClient.get('/finance/gst/gstr1-json', { params }),

  // Platform Billing
  getPlans: () => apiClient.get('/billing/plans'),
  getRevenueSummary: () => apiClient.get('/billing/revenue/summary'),
  getGateways: () => apiClient.get('/billing/gateways'),
};
```

---

## 🔗 Frontend Architecture & File Reference
- **Services:** `src/api/services/finance/` (`finance.service.js`, `billing.service.js`)
- **Thunks:** `src/store/thunks/finance/` (`finance.thunks.js`)
- **Slices:** `src/store/slices/finance/` (`financeSlice.js`)
- **Custom Hooks:** `src/hooks/finance/` (`useFinance.js`, `useSubscription.js`)
- **Pages:** `src/pages/finance/` (`FinanceDashboard.jsx`, `InvoicesPage.jsx`, `PaymentsLedgerPage.jsx`, `ReconciliationPage.jsx`, `GstCompliancePage.jsx`)
- **Pagination Component:** `src/components/ui/Pagination.jsx`
- **Integration Blueprint:** See [FRONTEND_INTEGRATION_GUIDE.md](../FRONTEND_INTEGRATION_GUIDE.md)

