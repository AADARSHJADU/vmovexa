import React from 'react';
import { StandardReportIncidentPage } from '../../components/incident/StandardReportIncidentPage';

export const SuperReportIncidentPage = () => {
  return (
    <StandardReportIncidentPage
      roleTitle="Super Admin"
      roleScope="superadmin"
      basePath="/superadmin"
    />
  );
};

export default SuperReportIncidentPage;
