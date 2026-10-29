import React from 'react';
import { BillingPaymentsPage } from '../advertiser/BillingPaymentsPage';

/**
 * GovBillingPaymentsPage — reuses the master Billing & Invoices component in
 * "government" mode (ownerType="government").
 * Displays department sanction billing, clearance receipts, and transaction history.
 */
export const GovBillingPaymentsPage = () => {
  return <BillingPaymentsPage ownerType="government" />;
};

export default GovBillingPaymentsPage;
