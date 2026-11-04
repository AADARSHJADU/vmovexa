import { useLocation } from 'react-router-dom';
import { RoleHelpPage } from '../../components/content/RoleHelpPage';

export const FinanceHelpSupportPage = () => {
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/finance' : '/finance';

  return (
    <RoleHelpPage
      roleCode="ROLE-FINANCE-OFFICER"
      defaultHistoryPath={`${basePath}/help/history`}
      showContactCta={false}
    />
  );
};

export default FinanceHelpSupportPage;
