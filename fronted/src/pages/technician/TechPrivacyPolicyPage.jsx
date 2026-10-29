import { RolePolicyPage } from '../../components/content/RolePolicyPage';

export const TechPrivacyPolicyPage = () => {
  return (
    <RolePolicyPage
      type="privacy"
      roleCode="ROLE-CENTRAL-TECH"
      titleFallback="Technician Telemetry Privacy Policy"
      subtitleFallback="Diagnostic sensor isolation, technician geolocation handling, and hardware log security"
      searchPlaceholder="Search diagnostic data privacy, sensor telemetry or hardware security..."
    />
  );
};

export default TechPrivacyPolicyPage;
