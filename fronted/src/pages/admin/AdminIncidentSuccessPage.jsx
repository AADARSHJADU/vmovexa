import React from 'react';
import { StandardIncidentSuccessPage } from '../../components/incident/StandardIncidentSuccessPage';

export const AdminIncidentSuccessPage = () => {
  return (
    <StandardIncidentSuccessPage
      roleTitle="Tenant Admin"
      roleScope="admin"
      basePath="/admin"
    />
  );
};

export default AdminIncidentSuccessPage;
