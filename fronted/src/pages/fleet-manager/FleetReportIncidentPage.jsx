import { StandardReportIncidentPage } from '../../components/incident/StandardReportIncidentPage';

export const FleetReportIncidentPage = () => {
  return (
    <StandardReportIncidentPage
      roleTitle="Fleet Operator"
      roleScope="fleet"
      basePath="/fleet-operator"
    />
  );
};

export default FleetReportIncidentPage;
