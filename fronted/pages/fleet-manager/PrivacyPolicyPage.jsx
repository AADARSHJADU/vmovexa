import { RolePolicyPage } from '../../components/content/RolePolicyPage';
import { useTranslation } from '../../hooks/useTranslation';

export const PrivacyPolicyPage = () => {
  const { t } = useTranslation();
  return (
    <RolePolicyPage
      type="privacy"
      roleCode="ROLE-FLEET-OPERATOR"
      titleFallback={t('ag.fleet.privacypolicypage.fleet_operations_privacy_policy', 'Fleet Operations Privacy Policy')}
      subtitleFallback={t('ag.fleet.privacypolicypage.depot_telematics_monitoring_shift_lo', 'Depot telematics monitoring, shift log privacy, and vehicle tracking data governance')}
      searchPlaceholder={t('ag.fleet.privacypolicypage.search_fleet_privacy_shift_logs_or_t', 'Search fleet privacy, shift logs or telemetry governance...')}
    />
  );
};

export default PrivacyPolicyPage;
