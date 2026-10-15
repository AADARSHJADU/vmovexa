import React from 'react';
import { RoleHelpPage } from '../../components/content/RoleHelpPage';

export const AdminHelpSupportPage = () => {
  return (
    <RoleHelpPage
      roleCode="ROLE-TENANT-ADMIN"
      defaultHistoryPath="/admin/help/history"
    />
  );
};

export default AdminHelpSupportPage;
