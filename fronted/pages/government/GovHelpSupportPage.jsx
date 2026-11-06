import React from 'react';
import { useLocation } from 'react-router-dom';
import { RoleHelpPage } from '../../components/content/RoleHelpPage';

export const GovHelpSupportPage = () => {
  const location = useLocation();
  const isSuperAdmin = location.pathname.startsWith('/superadmin');
  const defaultHistoryPath = isSuperAdmin ? '/superadmin/government/help/history' : '/government/help/history';

  return (
    <RoleHelpPage
      roleCode="ROLE-GOVT-AGENCY"
      defaultHistoryPath={defaultHistoryPath}
      showContactCta={false}
    />
  );
};

export default GovHelpSupportPage;
