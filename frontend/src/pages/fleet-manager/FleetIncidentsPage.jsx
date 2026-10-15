import React from 'react';
import { IncidentManagementView } from '../../components/IncidentManagementView';

export const FleetIncidentsPage = () => {
  return <IncidentManagementView roleTitle="Fleet Manager" roleScope="fleet" />;
};

export default FleetIncidentsPage;
