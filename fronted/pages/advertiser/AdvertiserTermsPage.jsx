import React, { useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { RolePolicyPage } from '../../components/content/RolePolicyPage';

export const AdvertiserTermsPage = () => {
  const { t } = useTranslation();

  const fallbackSections = useMemo(() => [
    {
      id: 'sec-adv-term-1',
      title: t('advertiser.terms.sec1_title', '1. Campaign Compliance & SuperAdmin Review SLA'),
      content: t('advertiser.terms.sec1_desc', 'All submitted commercial campaigns undergo review by VMOVEXA SuperAdmin for legal compliance, broadcast quality, and decency standards within 4 business hours.'),
    },
    {
      id: 'sec-adv-term-2',
      title: t('advertiser.terms.sec2_title', '2. Airtime Delivery Commitment & Playback Frequency'),
      content: t('advertiser.terms.sec2_desc', 'Approved campaigns are scheduled across contracted transit screen loops at the agreed slot duration (10s, 15s, or 30s) and cycle frequency across designated routes.'),
    },
    {
      id: 'sec-adv-term-3',
      title: t('advertiser.terms.sec3_title', '3. Billing, Payment Clearance & Taxes'),
      content: t('advertiser.terms.sec3_desc', 'Campaigns must be funded prior to broadcast deployment. Official GST tax invoices (HSN/SAC 998363) are generated automatically upon payment clearance.'),
    },
    {
      id: 'sec-adv-term-4',
      title: t('advertiser.terms.sec4_title', '4. Intellectual Property & Creative Asset Indemnity'),
      content: t('advertiser.terms.sec4_desc', 'The advertiser warrants that all creative media (video, audio, graphics, trademarks) supplied are legally licensed and do not infringe on third-party rights.'),
    },
    {
      id: 'sec-adv-term-5',
      title: t('advertiser.terms.sec5_title', '5. Screen Outage SLA & Pro-Rata Credit Rebates'),
      content: t('advertiser.terms.sec5_desc', 'In the event of hardware failure or transit route cancellation exceeding contracted SLA tolerances, verified downtime is automatically compensated with pro-rata airtime extensions or wallet credit notes.'),
    },
  ], [t]);

  return (
    <RolePolicyPage
      type="terms"
      roleCode="ROLE-ADVERTISER"
      titleFallback={t('advertiser.terms.title', 'Advertiser Terms & Campaign SLA')}
      subtitleFallback={t('advertiser.terms.subtitle', 'Ad creative specifications, impression verification guarantees, and playback compliance rules')}
      searchPlaceholder={t('advertiser.terms.search_ph', 'Search campaign terms, impression proof SLAs or playback rules...')}
      fallbackSections={fallbackSections}
    />
  );
};

export default AdvertiserTermsPage;
