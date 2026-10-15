import React from 'react';
import { RolePolicyPage } from '../../components/content/RolePolicyPage';

export const DriverPrivacyPolicyPage = () => {
  return (
    <RolePolicyPage
      type="privacy"
      roleCode="ROLE-DRIVER"
      titleFallback="Driver Privacy Policy"
      subtitleFallback="Telematics privacy, location data governance, and official document protection guidelines"
      searchPlaceholder="Search privacy clauses or data retention policies..."
      buttonLabel="Download Policy PDF"
    />
  );
};

export default DriverPrivacyPolicyPage;
