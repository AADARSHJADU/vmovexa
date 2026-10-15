import React from 'react';
import { RolePolicyPage } from '../../components/content/RolePolicyPage';

export const AdminPrivacyPolicyPage = () => {
  return (
    <RolePolicyPage
      type="privacy"
      roleCode="ROLE-TENANT-ADMIN"
      titleFallback="Tenant Organization Privacy Policy"
      subtitleFallback="Enterprise data isolation, employee KYC confidentiality, and multi-tenant security safeguards"
      searchPlaceholder="Search enterprise privacy, data vault or purge policies..."
      buttonLabel="Download Policy PDF"
    />
  );
};

export default AdminPrivacyPolicyPage;
