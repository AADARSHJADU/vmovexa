import { RolePolicyPage } from '../../components/content/RolePolicyPage';
import { useTranslation } from '../../hooks/useTranslation';

export const DriverPrivacyPolicyPage = () => {
  const { t } = useTranslation();
  return (
    <RolePolicyPage
      type="privacy"
      roleCode="ROLE-DRIVER"
      titleFallback={t('ag.driver.driverprivacypolicypage.driver_privacy_policy', 'Driver Privacy Policy')}
      subtitleFallback={t('ag.driver.driverprivacypolicypage.telematics_privacy_location_data_gov', 'Telematics privacy, location data governance, and official document protection guidelines')}
      searchPlaceholder={t('ag.driver.driverprivacypolicypage.search_privacy_clauses_or_data_reten', 'Search privacy clauses or data retention policies...')}
    />
  );
};

export default DriverPrivacyPolicyPage;
