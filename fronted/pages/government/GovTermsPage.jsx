import React, { useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { RolePolicyPage } from '../../components/content/RolePolicyPage';

export const GovTermsPage = () => {
  const { t } = useTranslation();

  const fallbackSections = useMemo(() => [
    {
      id: 'term-gov-1',
      title: t('gov.terms.sec1_title', '1. Transit Network Oversight & Municipal Integration'),
      content: t('gov.terms.sec1_desc', 'Government transit regulatory agencies are granted sovereign oversight of city public transport corridors, depot licensing status, and fleet environmental safety compliance.'),
    },
    {
      id: 'term-gov-2',
      title: t('gov.terms.sec2_title', '2. Sovereign Emergency Broadcast Override'),
      content: t('gov.terms.sec2_desc', 'Authorized government agency dispatchers possess priority override privileges to broadcast critical civic advisories, disaster alerts, and amber warnings across all in-transit screens within 10 seconds.'),
    },
    {
      id: 'term-gov-3',
      title: t('gov.terms.sec3_title', '3. Open Transit Data & GTFS Standardization'),
      content: t('gov.terms.sec3_desc', 'All municipal route paths, stop coordinates, and live vehicle arrival estimates are structured according to GTFS (General Transit Feed Specification) standards for public integration.'),
    },
    {
      id: 'term-gov-4',
      title: t('gov.terms.sec4_title', '4. Road Safety Audits & Environmental Compliance'),
      content: t('gov.terms.sec4_desc', 'Government authorities may access aggregated fleet speed compliance, emissions inspection logs, and vehicle maintenance status for statutory transit safety audits.'),
    },
    {
      id: 'term-gov-5',
      title: t('gov.terms.sec5_title', '5. Inter-Agency Coordination & Incident Escalation'),
      content: t('gov.terms.sec5_desc', 'In cases of critical urban transit incidents or traffic blockages, the system provides automated synchronization with municipal emergency services.'),
    },
  ], [t]);

  return (
    <RolePolicyPage
      type="terms"
      roleCode="ROLE-GOVT-AGENCY"
      titleFallback={t('gov.terms.title', 'Government Authority Terms & Regulations')}
      subtitleFallback={t('gov.terms.subtitle', 'Municipal transit corridor oversight, public safety emergency broadcasts, and GTFS transit feeds')}
      searchPlaceholder={t('gov.terms.search_ph', 'Search municipal regulations, emergency broadcast rules, or GTFS standards...')}
      fallbackSections={fallbackSections}
    />
  );
};

export default GovTermsPage;
