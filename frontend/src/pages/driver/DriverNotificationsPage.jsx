import React from 'react';
import { SharedNotificationsView } from '../../components/SharedNotificationsView';

export const DriverNotificationsPage = () => {
  return (
    <SharedNotificationsView
      title="Driver Emergency Alerts & Messages"
      subtitle="Live route alerts, emergency acknowledgements, dispatch updates, and depot clearances"
      settingsPath="/driver/settings/notifications"
      dashboardPath="/driver/dashboard"
    />
  );
};

export default DriverNotificationsPage;
