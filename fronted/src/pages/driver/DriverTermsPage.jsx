import { RolePolicyPage } from '../../components/content/RolePolicyPage';

export const DriverTermsPage = () => {
  return (
    <RolePolicyPage
      type="terms"
      roleCode="ROLE-DRIVER"
      titleFallback="Driver Terms & Conditions"
      subtitleFallback="Commercial road safety regulations, route punctuality SLAs, and transit driver conduct rules"
      searchPlaceholder="Search terms, driver rules or speed regulations..."
    />
  );
};

export default DriverTermsPage;
