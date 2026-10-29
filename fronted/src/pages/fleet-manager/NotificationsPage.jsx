import { useTranslation } from '../../hooks/useTranslation';
import { SharedNotificationsView } from '../../components/SharedNotificationsView';

export const NotificationsPage = () => {
  const { t } = useTranslation();
  return (
    <SharedNotificationsView
      title={t('fleet.notifications.title')}
      subtitle={t('fleet.notifications.subtitle')}
      settingsPath="/fleet-operator/profile/notifications"
      dashboardPath="/fleet-operator/dashboard"
    />
  );
};

export default NotificationsPage;
