import { StandardIncidentSuccessPage } from '../../components/incident/StandardIncidentSuccessPage';

export const FleetIncidentSuccessPage = () => {
  return (
    <StandardIncidentSuccessPage
      roleTitle="Fleet Operator"
      roleScope="fleet"
      basePath="/fleet-operator"
    />
  );
};

export default FleetIncidentSuccessPage;
