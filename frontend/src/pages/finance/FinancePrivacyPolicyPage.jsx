import React from 'react';
import { RolePolicyPage } from '../../components/content/RolePolicyPage';

export const FinancePrivacyPolicyPage = () => {
  return (
    <RolePolicyPage
      type="privacy"
      roleCode="ROLE-FINANCE-OFFICER"
      titleFallback="Financial Data & Ledger Privacy Policy"
      subtitleFallback="Banking credential security, PCI-DSS compliance, and statutory financial record retention"
      searchPlaceholder="Search banking encryption, PCI-DSS data isolation, or audit retention..."
      buttonLabel="Download Policy PDF"
    />
  );
};

export default FinancePrivacyPolicyPage;
