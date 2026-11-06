import { RolePolicyPage } from '../../components/content/RolePolicyPage';
import { useTranslation } from '../../hooks/useTranslation';

export const TermsPage = () => {
  const { t } = useTranslation();
  return (
    <RolePolicyPage
      type="terms"
      roleCode="ROLE-FLEET-OPERATOR"
      titleFallback={t('ag.fleet.termspage.fleet_manager_terms_operational_rule', 'Fleet Manager Terms & Operational Rules')}
      subtitleFallback={t('ag.fleet.termspage.depot_dispatch_standards_vehicle_roa', 'Depot dispatch standards, vehicle roadworthiness inspection SLAs, and route punctuality governance')}
      searchPlaceholder={t('ag.fleet.termspage.search_fleet_terms_depot_dispatch_ru', 'Search fleet terms, depot dispatch rules or vehicle SLAs...')}
    />
  );
};

export default TermsPage;
