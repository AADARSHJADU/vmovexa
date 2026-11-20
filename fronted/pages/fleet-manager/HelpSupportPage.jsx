import { RoleHelpPage } from '../../components/content/RoleHelpPage';

export const HelpSupportPage = () => {
  return (
    <RoleHelpPage
      roleCode="ROLE-FLEET-OPERATOR"
      defaultHistoryPath="/fleet-operator/help/history"
      showContactCta={false}
    />
  );
};

export default HelpSupportPage;
