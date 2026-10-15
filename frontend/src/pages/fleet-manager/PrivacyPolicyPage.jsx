import React from 'react';
import { RolePolicyPage } from '../../components/content/RolePolicyPage';

export const PrivacyPolicyPage = () => {
  return (
    <RolePolicyPage
      type="privacy"
      roleCode="ROLE-FLEET-OPERATOR"
      titleFallback="Fleet Operations Privacy Policy"
      subtitleFallback="Depot telematics monitoring, shift log privacy, and vehicle tracking data governance"
      searchPlaceholder="Search fleet privacy, shift logs or telemetry governance..."
      buttonLabel="Download Policy PDF"
    />
  );
};

export default PrivacyPolicyPage;
