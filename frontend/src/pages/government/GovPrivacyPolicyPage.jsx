import React from 'react';
import { RolePolicyPage } from '../../components/content/RolePolicyPage';

export const GovPrivacyPolicyPage = () => {
  return (
    <RolePolicyPage
      type="privacy"
      roleCode="ROLE-GOVT-AGENCY"
      titleFallback="Government Agency Privacy & Data Governance"
      subtitleFallback="Public transit telematics anonymization, statutory data governance, and civic safety protocols"
      searchPlaceholder="Search citizen data anonymization, emergency logs, or data residency..."
      buttonLabel="Download Policy PDF"
    />
  );
};

export default GovPrivacyPolicyPage;
