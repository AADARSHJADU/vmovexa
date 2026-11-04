import React from 'react';
import { StandardReportIncidentPage } from '../../components/incident/StandardReportIncidentPage';

export const AdminReportIncidentPage = () => {
  return (
    <StandardReportIncidentPage
      roleTitle="Tenant Admin"
      roleScope="admin"
      basePath="/admin"
    />
  );
};

export default AdminReportIncidentPage;
