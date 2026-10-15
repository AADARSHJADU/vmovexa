import React from 'react';
import { SharedNotificationsView } from '../../components/SharedNotificationsView';

export const AdminNotificationsPage = () => {
  return (
    <SharedNotificationsView
      title="Organization Alerts & Notifications"
      subtitle="Real-time audit log of emergency incidents, driver license alerts, and system notifications"
      settingsPath="/admin/settings/notifications"
      dashboardPath="/admin/dashboard"
    />
  );
};

export default AdminNotificationsPage;
