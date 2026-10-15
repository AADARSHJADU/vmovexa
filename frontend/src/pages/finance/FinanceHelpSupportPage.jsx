import React from 'react';
import { RoleHelpPage } from '../../components/content/RoleHelpPage';

export const FinanceHelpSupportPage = () => {
  return (
    <RoleHelpPage
      roleCode="ROLE-FINANCE-OFFICER"
      defaultHistoryPath="/finance/help/history"
    />
  );
};

export default FinanceHelpSupportPage;
