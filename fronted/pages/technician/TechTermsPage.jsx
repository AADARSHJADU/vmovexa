import { useTranslation } from '../../hooks/useTranslation';
import { RolePolicyPage } from '../../components/content/RolePolicyPage';

export const TechTermsPage = () => {
  const { t } = useTranslation();
  return (
    <RolePolicyPage
      type="terms"
      roleCode="ROLE-CENTRAL-TECH"
      titleFallback={t('technician.terms.title', 'Central Technician Terms & SLA')}
      subtitleFallback={t('technician.terms.subtitle', 'Hardware installation protocols, CAN-bus calibration, and depot maintenance standards')}
      searchPlaceholder={t('technician.terms.search_ph', 'Search engineering clauses, wiring safety rules, or spares SLAs...')}
    />
  );
};

export default TechTermsPage;
