import React from 'react';
import { RoleHelpPage } from '../../components/content/RoleHelpPage';

export const TechHelpSupportPage = () => {
  return (
    <RoleHelpPage
      roleCode="ROLE-CENTRAL-TECH"
      defaultHistoryPath="/technician/help/history"
    />
  );
};

export default TechHelpSupportPage;
