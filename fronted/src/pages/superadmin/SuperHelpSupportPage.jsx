import React from 'react';
import { RoleHelpPage } from '../../components/content/RoleHelpPage';

export const SuperHelpSupportPage = () => {
  return (
    <RoleHelpPage
      roleCode="ROLE-SUPER-ADMIN"
      defaultHistoryPath="/superadmin/help/history"
    />
  );
};

export default SuperHelpSupportPage;
