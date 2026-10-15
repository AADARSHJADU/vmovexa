import React from 'react';
import { RoleHelpPage } from '../../components/content/RoleHelpPage';

export const GovHelpSupportPage = () => {
  return (
    <RoleHelpPage
      roleCode="ROLE-GOVT-AGENCY"
      defaultHistoryPath="/government/help/history"
    />
  );
};

export default GovHelpSupportPage;
