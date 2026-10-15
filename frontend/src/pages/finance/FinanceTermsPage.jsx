import React from 'react';
import { RolePolicyPage } from '../../components/content/RolePolicyPage';

export const FinanceTermsPage = () => {
  return (
    <RolePolicyPage
      type="terms"
      roleCode="ROLE-FINANCE-OFFICER"
      titleFallback="Finance Officer Terms & Reconciliation Rules"
      subtitleFallback="Revenue ledger standards, payment gateway settlements, and statutory GST reconciliation"
      searchPlaceholder="Search billing terms, payment rules, GSTIN, or settlement clauses..."
      buttonLabel="Download Terms PDF"
    />
  );
};

export default FinanceTermsPage;
