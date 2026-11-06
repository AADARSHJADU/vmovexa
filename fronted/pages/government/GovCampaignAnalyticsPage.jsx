import React from 'react';
import { CampaignAnalyticsPage } from '../advertiser/CampaignAnalyticsPage';

/**
 * GovCampaignAnalyticsPage — reuses CampaignAnalyticsPage in "government" mode (ownerType="government").
 * Displays single-campaign telemetry, reach, playbacks, corridor breakdown, and QR analytics for Government.
 */
export const GovCampaignAnalyticsPage = () => {
  return <CampaignAnalyticsPage ownerType="government" />;
};

export default GovCampaignAnalyticsPage;

