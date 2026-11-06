import React, { useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { RolePolicyPage } from '../../components/content/RolePolicyPage';

export const GovPrivacyPolicyPage = () => {
  const { t } = useTranslation();

  const fallbackSections = useMemo(() => [
    {
      id: 'sec-gov-1',
      title: t('gov.privacy.sec1_title', '1. Citizen Privacy & Public Data Anonymization'),
      content: t('gov.privacy.sec1_desc', 'Transit data monitored by government agencies consists solely of anonymized vehicle positions, corridor crowd density estimates, and schedule adherence metrics. No citizen personal data is stored.'),
    },
    {
      id: 'sec-gov-2',
      title: t('gov.privacy.sec2_title', '2. Emergency Broadcast Audit Records'),
      content: t('gov.privacy.sec2_desc', 'All emergency civic broadcast dispatches are permanently stamped with the authorizing officer ID, message content, and target geo-corridor in an immutable statutory log.'),
    },
    {
      id: 'sec-gov-3',
      title: t('gov.privacy.sec3_title', '3. Non-Commercialization Guarantee'),
      content: t('gov.privacy.sec3_desc', 'Data provided through municipal transit feeds is dedicated solely to urban traffic engineering and public transport optimization, and is never commercialized.'),
    },
    {
      id: 'sec-gov-4',
      title: t('gov.privacy.sec4_title', '4. Sovereign Data Residency & Cloud Security'),
      content: t('gov.privacy.sec4_desc', 'All public transit records, route topologies, and emergency broadcast systems are hosted in sovereign data centers located physically within national borders.'),
    },
    {
      id: 'sec-gov-5',
      title: t('gov.privacy.sec5_title', '5. Inter-Departmental Access Permissions'),
      content: t('gov.privacy.sec5_desc', 'Agency user accounts are governed by strict multi-factor authentication and role-based permissions preventing unauthorized cross-departmental data access.'),
    },
  ], [t]);

  return (
    <RolePolicyPage
      type="privacy"
      roleCode="ROLE-GOVT-AGENCY"
      titleFallback={t('gov.privacy.title', 'Government Agency Privacy & Data Governance')}
      subtitleFallback={t('gov.privacy.subtitle', 'Public transit telematics anonymization, statutory data governance, and civic safety protocols')}
      searchPlaceholder={t('gov.privacy.search_ph', 'Search citizen data anonymization, emergency logs, or data residency...')}
      fallbackSections={fallbackSections}
    />
  );
};

export default GovPrivacyPolicyPage;
