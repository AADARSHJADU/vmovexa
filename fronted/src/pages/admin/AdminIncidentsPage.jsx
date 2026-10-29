import React from 'react';
import { IncidentManagementView } from '../../components/IncidentManagementView';

export const AdminIncidentsPage = () => {
  return <IncidentManagementView roleTitle="Tenant Admin" roleScope="admin" />;
};

export default AdminIncidentsPage;
