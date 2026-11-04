import React, { useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { RolePolicyPage } from '../../components/content/RolePolicyPage';

export const AdvertiserPrivacyPolicyPage = () => {
  const { t } = useTranslation();

  const fallbackSections = useMemo(() => [
    {
      id: 'sec-adv-priv-1',
      title: t('advertiser.privacy.sec1_title', '1. Audience Analytics Privacy & Aggregated Impression Metrics'),
      content: t('advertiser.privacy.sec1_desc', 'All impressions and crowd density metrics reported on VMOVEXA transit displays are derived from aggregated sensor feeds without facial recognition, biometric storage, or commuter PII.'),
    },
    {
      id: 'sec-adv-priv-2',
      title: t('advertiser.privacy.sec2_title', '2. Dynamic QR Attribution & Lead Data Privacy'),
      content: t('advertiser.privacy.sec2_desc', 'When commuters scan dynamic campaign QR codes, lead data is collected under strict privacy regulations and routed directly to the verified advertiser without intermediary brokering.'),
    },
    {
      id: 'sec-adv-priv-3',
      title: t('advertiser.privacy.sec3_title', '3. Commercial Confidentiality of Campaign Strategy'),
      content: t('advertiser.privacy.sec3_desc', 'All advertiser campaign details, creative media files, target transit routes, scheduled flight dates, and budget allocations are treated as confidential commercial information protected by strict RBAC.'),
    },
    {
      id: 'sec-adv-priv-4',
      title: t('advertiser.privacy.sec4_title', '4. Proof-of-Play Telemetry Audit & Verification Records'),
      content: t('advertiser.privacy.sec4_desc', 'Cryptographically signed edge telemetry logs recorded by on-vehicle displays verify that creatives were played for the exact contracted duration and frequency.'),
    },
    {
      id: 'sec-adv-priv-5',
      title: t('advertiser.privacy.sec5_title', '5. Data Security, Cloud Residency & SOC-2 Compliance'),
      content: t('advertiser.privacy.sec5_desc', 'Campaign media files and telemetry logs are stored in secure cloud infrastructure within national borders, encrypted at rest (AES-256) and in transit (TLS 1.3).'),
    },
  ], [t]);

  return (
    <RolePolicyPage
      type="privacy"
      roleCode="ROLE-ADVERTISER"
      titleFallback={t('advertiser.privacy.title', 'Advertiser Privacy & Data Policy')}
      subtitleFallback={t('advertiser.privacy.subtitle', 'Audience analytics privacy, aggregated impression metrics, and campaign commercial confidentiality')}
      searchPlaceholder={t('advertiser.privacy.search_ph', 'Search audience analytics privacy or proof-of-play security...')}
      fallbackSections={fallbackSections}
    />
  );
};

export default AdvertiserPrivacyPolicyPage;
