import React from 'react';
import { SharedNotificationsView } from '../../components/SharedNotificationsView';

export const NotificationsPage = () => {
  return (
    <SharedNotificationsView
      title="Operational Alerts & Notifications"
      subtitle="Real-time fleet telematics exceptions, driver emergency alerts, and dispatch updates"
      settingsPath="/fleet-manager/profile/notifications"
      dashboardPath="/fleet-manager/dashboard"
    />
  );
};

export default NotificationsPage;
