import React from 'react';
import { BillingPaymentsPage } from '../advertiser/BillingPaymentsPage';

/**
 * GovBillingPaymentsPage — reuses the master Billing & Invoices component in
 * "government" mode (ownerType="government").
 * Displays department sanction billing and clearance receipts.
 */
export const GovBillingPaymentsPage = () => {
  return (
    <BillingPaymentsPage
      ownerType="government"
      showTransactions={false}
      showPendingCard={false}
    />
  );
};

export default GovBillingPaymentsPage;
