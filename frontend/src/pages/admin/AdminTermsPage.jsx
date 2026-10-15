import React from 'react';
import { RolePolicyPage } from '../../components/content/RolePolicyPage';

export const AdminTermsPage = () => {
  return (
    <RolePolicyPage
      type="terms"
      roleCode="ROLE-TENANT-ADMIN"
      titleFallback="Organization Admin Terms & SLAs"
      subtitleFallback="Enterprise tenant governance, multi-depot fleet management, and platform resource allocation rules"
      searchPlaceholder="Search tenant terms, SLAs or fleet quota clauses..."
      buttonLabel="Download SLA PDF"
    />
  );
};

export default AdminTermsPage;
