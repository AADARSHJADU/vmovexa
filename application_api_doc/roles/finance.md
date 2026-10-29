# finance API index

Updated: 2026-10-28. 50 route entries. This grouping is navigation only: access is determined by actual permissions and tenant/controller rules, not by this filename. Shared routes can be used by multiple roles.

See [app developer guide](../APP_DEVELOPER_GUIDE.md) and [complete request reference](../API_REFERENCE.md). For realtime events see [REALTIME_AND_GPS.md](../REALTIME_AND_GPS.md).

| Method | Path | Authentication | Request / access details |
|---|---|---|---|
| POST | `/api/v1/billing/cron/check-expiries` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-billing-cron-check-expiries) |
| GET | `/api/v1/billing/gateways` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-billing-gateways) |
| PUT | `/api/v1/billing/gateways/:id` | Bearer | [Reference](../API_REFERENCE.md#put-api-v1-billing-gateways-id) |
| POST | `/api/v1/billing/gateways/:id/simulate-order` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-billing-gateways-id-simulate-order) |
| POST | `/api/v1/billing/gateways/:id/test` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-billing-gateways-id-test) |
| POST | `/api/v1/billing/gateways/:id/test-connection` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-billing-gateways-id-test-connection) |
| GET | `/api/v1/billing/invoices` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-billing-invoices) |
| GET | `/api/v1/billing/invoices/:id` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-billing-invoices-id) |
| GET | `/api/v1/billing/invoices/:id/html` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-billing-invoices-id-html) |
| POST | `/api/v1/billing/invoices/:id/pay` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-billing-invoices-id-pay) |
| GET | `/api/v1/billing/plans` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-billing-plans) |
| POST | `/api/v1/billing/plans` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-billing-plans) |
| DELETE | `/api/v1/billing/plans/:id` | Bearer | [Reference](../API_REFERENCE.md#delete-api-v1-billing-plans-id) |
| PUT | `/api/v1/billing/plans/:id` | Bearer | [Reference](../API_REFERENCE.md#put-api-v1-billing-plans-id) |
| GET | `/api/v1/billing/revenue/settlements` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-billing-revenue-settlements) |
| GET | `/api/v1/billing/revenue/shares` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-billing-revenue-shares) |
| GET | `/api/v1/billing/revenue/summary` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-billing-revenue-summary) |
| GET | `/api/v1/billing/revenue/top-tenants` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-billing-revenue-top-tenants) |
| GET | `/api/v1/billing/subscription` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-billing-subscription) |
| GET | `/api/v1/billing/subscription/check-status` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-billing-subscription-check-status) |
| POST | `/api/v1/billing/subscription/check-status` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-billing-subscription-check-status) |
| POST | `/api/v1/billing/subscription/confirm` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-billing-subscription-confirm) |
| POST | `/api/v1/billing/subscription/order` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-billing-subscription-order) |
| POST | `/api/v1/billing/subscription/verify-session` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-billing-subscription-verify-session) |
| GET | `/api/v1/billing/transactions` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-billing-transactions) |
| POST | `/api/v1/billing/transactions/manual-offline` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-billing-transactions-manual-offline) |
| GET | `/api/v1/billing/wallet` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-billing-wallet) |
| GET | `/api/v1/finance/campaign-payments` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-finance-campaign-payments) |
| POST | `/api/v1/finance/campaign-payments/:id/manual-pay` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-finance-campaign-payments-id-manual-pay) |
| POST | `/api/v1/finance/campaign-payments/:id/share-link` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-finance-campaign-payments-id-share-link) |
| GET | `/api/v1/finance/gst/gstr1-json` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-finance-gst-gstr1-json) |
| GET | `/api/v1/finance/gst/summary` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-finance-gst-summary) |
| GET | `/api/v1/finance/invoices` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-finance-invoices) |
| POST | `/api/v1/finance/invoices` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-finance-invoices) |
| GET | `/api/v1/finance/invoices/:id` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-finance-invoices-id) |
| POST | `/api/v1/finance/invoices/:id/mark-paid` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-finance-invoices-id-mark-paid) |
| GET | `/api/v1/finance/kpis` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-finance-kpis) |
| GET | `/api/v1/finance/payments` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-finance-payments) |
| GET | `/api/v1/finance/payments/:id` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-finance-payments-id) |
| POST | `/api/v1/finance/payments/:id/send-reminder` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-finance-payments-id-send-reminder) |
| POST | `/api/v1/finance/reconciliation/auto-match` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-finance-reconciliation-auto-match) |
| POST | `/api/v1/finance/reconciliation/finalize` | Bearer | [Reference](../API_REFERENCE.md#post-api-v1-finance-reconciliation-finalize) |
| GET | `/api/v1/finance/reconciliation/summary` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-finance-reconciliation-summary) |
| GET | `/api/v1/finance/reconciliation/transactions` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-finance-reconciliation-transactions) |
| GET | `/api/v1/finance/report-summary` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-finance-report-summary) |
| GET | `/api/v1/finance/settings` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-finance-settings) |
| PUT | `/api/v1/finance/settings` | Bearer | [Reference](../API_REFERENCE.md#put-api-v1-finance-settings) |
| GET | `/api/v1/finance/subscriptions` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-finance-subscriptions) |
| GET | `/api/v1/finance/subscriptions/:id` | Bearer | [Reference](../API_REFERENCE.md#get-api-v1-finance-subscriptions-id) |
| POST | `/api/v1/webhooks/:gateway` | No requireAuth guard | [Reference](../API_REFERENCE.md#post-api-v1-webhooks-gateway) |
