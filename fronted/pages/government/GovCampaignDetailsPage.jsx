import React from 'react';
import { CampaignDetailsPage } from '../advertiser/CampaignDetailsPage';

/**
 * GovCampaignDetailsPage — reuses the master Campaign Details component in
 * "government" mode (ownerType="government").
 * Displays department overview, media preview, corridor/fleet targeting,
 * offline clearance & online payment receipts, QR code tracking, and MQTT broadcast controls.
 */
export const GovCampaignDetailsPage = () => {
  return <CampaignDetailsPage ownerType="government" />;
};

export default GovCampaignDetailsPage;
