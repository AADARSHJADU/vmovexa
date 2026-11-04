import { RolePolicyPage } from '../../components/content/RolePolicyPage';
import { useTranslation } from '../../hooks/useTranslation';

export const DriverTermsPage = () => {
  const { t } = useTranslation();
  return (
    <RolePolicyPage
      type="terms"
      roleCode="ROLE-DRIVER"
      titleFallback={t('ag.driver.drivertermspage.driver_terms_conditions', 'Driver Terms & Conditions')}
      subtitleFallback={t('ag.driver.drivertermspage.commercial_road_safety_regulations_r', 'Commercial road safety regulations, route punctuality SLAs, and transit driver conduct rules')}
      searchPlaceholder={t('ag.driver.drivertermspage.search_terms_driver_rules_or_speed_r', 'Search terms, driver rules or speed regulations...')}
    />
  );
};

export default DriverTermsPage;
