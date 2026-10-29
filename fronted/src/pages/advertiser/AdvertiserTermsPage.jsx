import React from 'react';
import { RolePolicyPage } from '../../components/content/RolePolicyPage';

export const AdvertiserTermsPage = () => {
  return (
    <RolePolicyPage
      type="terms"
      roleCode="ROLE-ADVERTISER"
      titleFallback="Advertiser Terms & Campaign SLA"
      subtitleFallback="Ad creative specifications, impression verification guarantees, and playback compliance rules"
      searchPlaceholder="Search campaign terms, impression proof SLAs or playback rules..."
    />
  );
};

export default AdvertiserTermsPage;
