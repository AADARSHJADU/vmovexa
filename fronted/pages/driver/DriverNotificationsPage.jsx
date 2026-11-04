import { useTranslation } from '../../hooks/useTranslation';
import { SharedNotificationsView } from '../../components/SharedNotificationsView';

export const DriverNotificationsPage = () => {
  const { t } = useTranslation();
  return (
    <SharedNotificationsView
      title={t('driver.notifications.alerts_title')}
      subtitle={t('driver.notifications.alerts_sub')}
      settingsPath="/driver/settings/notifications"
      dashboardPath="/driver/dashboard"
    />
  );
};

export default DriverNotificationsPage;
