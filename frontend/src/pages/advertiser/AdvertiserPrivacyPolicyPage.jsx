import React from 'react';
import { RolePolicyPage } from '../../components/content/RolePolicyPage';

export const AdvertiserPrivacyPolicyPage = () => {
  return (
    <RolePolicyPage
      type="privacy"
      roleCode="ROLE-ADVERTISER"
      titleFallback="Advertiser Privacy & Data Policy"
      subtitleFallback="Audience analytics privacy, aggregated impression metrics, and campaign commercial confidentiality"
      searchPlaceholder="Search audience analytics privacy or proof-of-play security..."
      buttonLabel="Download Policy PDF"
    />
  );
};

export default AdvertiserPrivacyPolicyPage;
