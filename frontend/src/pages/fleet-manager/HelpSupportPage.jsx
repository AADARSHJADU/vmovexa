import React from 'react';
import { RoleHelpPage } from '../../components/content/RoleHelpPage';

export const HelpSupportPage = () => {
  return (
    <RoleHelpPage
      roleCode="ROLE-FLEET-OPERATOR"
      defaultHistoryPath="/fleet-manager/help/history"
    />
  );
};

export default HelpSupportPage;
