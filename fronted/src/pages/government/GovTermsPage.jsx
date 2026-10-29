import React from 'react';
import { RolePolicyPage } from '../../components/content/RolePolicyPage';

export const GovTermsPage = () => {
  return (
    <RolePolicyPage
      type="terms"
      roleCode="ROLE-GOVT-AGENCY"
      titleFallback="Government Authority Terms & Regulations"
      subtitleFallback="Municipal transit corridor oversight, public safety emergency broadcasts, and GTFS transit feeds"
      searchPlaceholder="Search municipal regulations, emergency broadcast rules, or GTFS standards..."
    />
  );
};

export default GovTermsPage;
