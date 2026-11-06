import React from 'react';
import { IncidentManagementView } from '../../components/IncidentManagementView';

export const SuperIncidentsPage = () => {
  return <IncidentManagementView roleTitle="Super Admin" roleScope="superadmin" />;
};

export default SuperIncidentsPage;
