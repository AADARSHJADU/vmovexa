import React from 'react';
import { RoleHelpPage } from '../../components/content/RoleHelpPage';

export const DriverHelpSupportPage = () => {
  return (
    <RoleHelpPage
      roleCode="ROLE-DRIVER"
      defaultHistoryPath="/driver/help/history"
    />
  );
};

export default DriverHelpSupportPage;
