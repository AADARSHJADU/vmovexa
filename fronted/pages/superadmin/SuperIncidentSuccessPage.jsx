import React from 'react';
import { StandardIncidentSuccessPage } from '../../components/incident/StandardIncidentSuccessPage';

export const SuperIncidentSuccessPage = () => {
  return (
    <StandardIncidentSuccessPage
      roleTitle="Super Admin"
      roleScope="superadmin"
      basePath="/superadmin"
    />
  );
};

export default SuperIncidentSuccessPage;
