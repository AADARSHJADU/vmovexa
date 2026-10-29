import React from 'react';
import { SharedNotificationsView } from '../../components/SharedNotificationsView';
import { useTranslation } from '../../hooks/useTranslation';

export const AdminNotificationsPage = () => {
  const { t } = useTranslation();

  return (
    <SharedNotificationsView
      title={t('admin.notifications.alerts_title')}
      subtitle={t('admin.notifications.alerts_subtitle')}
      settingsPath="/admin/settings/notifications"
      dashboardPath="/admin/dashboard"
    />
  );
};

export default AdminNotificationsPage;
