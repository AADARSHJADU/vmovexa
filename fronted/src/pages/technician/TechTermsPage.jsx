import { RolePolicyPage } from '../../components/content/RolePolicyPage';

export const TechTermsPage = () => {
  return (
    <RolePolicyPage
      type="terms"
      roleCode="ROLE-CENTRAL-TECH"
      titleFallback="Central Technician Terms & SLA"
      subtitleFallback="Hardware installation protocols, CAN-bus calibration, and depot maintenance standards"
      searchPlaceholder="Search engineering clauses, wiring safety rules, or spares SLAs..."
    />
  );
};

export default TechTermsPage;
