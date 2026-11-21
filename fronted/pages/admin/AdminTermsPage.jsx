import { useTranslation } from '../../hooks/useTranslation';
import { RolePolicyPage } from '../../components/content/RolePolicyPage';

export const AdminTermsPage = () => {
  const { t } = useTranslation();

  const sections = [
    {
      id: 'term-ta-1',
      title: t('admin.terms.section1_title', '1. Organization Mandate & Multi-Depot Supervision'),
      content: t('admin.terms.section1_content', 'Tenant Administrators hold sovereign operational governance across all registered fleets, depots, assigned operators, and edge equipment registered under their corporate enterprise account.'),
    },
    {
      id: 'term-ta-2',
      title: t('admin.terms.section2_title', '2. Subscription Tier Entitlements & Capacity Limits'),
      content: t('admin.terms.section2_content', 'Platform utilization, concurrent active vehicles, and live telemetry throughput are governed by the subscribed enterprise tier. Upgrades or custom vehicle quotas take effect immediately upon settlement.'),
    },
    {
      id: 'term-ta-3',
      title: t('admin.terms.section3_title', '3. Fleet Telematics Ownership & Operational Sovereignty'),
      content: t('admin.terms.section3_content', 'Tenants retain complete and exclusive ownership of all fleet route schedules, driver assignments, depot configurations, and passenger travel patterns generated within their tenant sandbox.'),
    },
    {
      id: 'term-ta-4',
      title: t('admin.terms.section4_title', '4. Driver KYC & Regulatory Compliance Assurance'),
      content: t('admin.terms.section4_content', 'Tenant organizations are legally responsible for verifying all driver commercial licenses, background police verification records, and vehicle fitness certificates prior to vehicle dispatch.'),
    },
    {
      id: 'term-ta-5',
      title: t('admin.terms.section5_title', '5. Service Level Agreement & High-Availability Guarantee'),
      content: t('admin.terms.section5_content', 'VMOVEXA guarantees an enterprise service uptime of 99.9% for depot dispatch operations, vehicle assignment microservices, and live tracking map interfaces.'),
    },
  ];

  return (
    <RolePolicyPage
      type="terms"
      roleCode="ROLE-TENANT-ADMIN"
      titleFallback={t('ag.admin.admintermspage.organization_admin_terms_slas', 'Organization Admin Terms & SLAs')}
      subtitleFallback={t('ag.admin.admintermspage.enterprise_tenant_governance_multi_d', 'Enterprise tenant governance, multi-depot fleet management, and platform resource allocation rules')}
      searchPlaceholder={t('ag.admin.admintermspage.search_tenant_terms_slas_or_fleet_qu', 'Search tenant terms, SLAs or fleet quota clauses...')}
      fallbackSections={sections}
    />
  );
};

export default AdminTermsPage;
