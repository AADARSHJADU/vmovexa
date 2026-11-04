import { useTranslation } from '../../hooks/useTranslation';
import { RolePolicyPage } from '../../components/content/RolePolicyPage';

export const TechPrivacyPolicyPage = () => {
  const { t } = useTranslation();
  return (
    <RolePolicyPage
      type="privacy"
      roleCode="ROLE-CENTRAL-TECH"
      titleFallback={t('technician.privacy.title', 'Technician Telemetry Privacy Policy')}
      subtitleFallback={t('technician.privacy.subtitle', 'Diagnostic sensor isolation, technician geolocation handling, and hardware log security')}
      searchPlaceholder={t('technician.privacy.search_ph', 'Search diagnostic data privacy, sensor telemetry or hardware security...')}
    />
  );
};

export default TechPrivacyPolicyPage;
