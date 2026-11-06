import React from 'react';
import { CreateCampaignPage } from '../advertiser/CreateCampaignPage';

/**
 * GovCreateCampaignPage — reuses the full-featured advertiser campaign wizard in
 * "government" mode (ownerType=government). Same UI, same working logic, same flow:
 * multi-creative upload + per-creative display config, route/vehicle targeting,
 * slot availability, QR, schedule, budget, review & submit — all wired to the real
 * backend. The backend routes government-owned campaigns to the Government Agency.
 */
export const GovCreateCampaignPage = () => {
  return <CreateCampaignPage ownerType="government" />;
};

export default GovCreateCampaignPage;
