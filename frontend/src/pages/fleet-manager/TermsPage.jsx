import React from 'react';
import { RolePolicyPage } from '../../components/content/RolePolicyPage';

export const TermsPage = () => {
  return (
    <RolePolicyPage
      type="terms"
      roleCode="ROLE-FLEET-OPERATOR"
      titleFallback="Fleet Manager Terms & Operational Rules"
      subtitleFallback="Depot dispatch standards, vehicle roadworthiness inspection SLAs, and route punctuality governance"
      searchPlaceholder="Search fleet terms, depot dispatch rules or vehicle SLAs..."
      buttonLabel="Download SLA PDF"
    />
  );
};

export default TermsPage;
