import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { useNotifications } from '../../hooks/shared/useNotifications';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useTranslation } from '../../hooks/useTranslation';

export const AdminNotificationSettingsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { settings: remoteSettings, loadSettings, updateSettings } = useNotifications();

  useEffect(() => {
    loadSettings().catch(() => {});
  }, [loadSettings]);

  const [savingField, setSavingField] = React.useState(null);
  const settingsObj = remoteSettings?.settings || remoteSettings;
  const webEnabled = Boolean(settingsObj?.channel_in_app ?? true);
  const pushEnabled = Boolean(settingsObj?.channel_push ?? true);
  const smsEnabled = Boolean(settingsObj?.channel_sms ?? true);
  const emailEnabled = Boolean(settingsObj?.channel_email ?? true);
  const whatsappEnabled = Boolean(settingsObj?.channel_whatsapp ?? true);
  const masterEnabled = Boolean(settingsObj?.master_push ?? true);

  // Each toggle persists immediately to the backend (user_notification_settings),
  // which the dispatch engine honors — turning a channel OFF stops delivery.
  const toggleChannel = async (field, currentValue) => {
    if (savingField) return;
    setSavingField(field);
    try {
      await toast.promise(
        updateSettings({ [field]: !currentValue }),
        {
          loading: 'Saving setting...',
          success: 'Notification preference updated!',
          error: (err) => err?.message || 'Failed to update setting',
        }
      );
    } finally {
      setSavingField(null);
    }
  };

  const channels = [
    {
      id: 'master_push',
      title: 'Master Notifications Switch',
      desc: 'Global on/off for all non-critical notifications across every channel',
      icon: <FleetIcons.Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      badgeBg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
      enabled: masterEnabled,
    },
    {
      id: 'channel_in_app',
      title: 'Web / In-App Notifications',
      desc: 'Real-time browser popups and in-app dashboard notifications',
      icon: <FleetIcons.Broadcast className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      badgeBg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
      enabled: webEnabled,
    },
    {
      id: 'channel_push',
      title: 'Push Notifications',
      desc: 'Mobile device push notifications and alerts',
      icon: <FleetIcons.Speed className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
      badgeBg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
      enabled: pushEnabled,
    },
    {
      id: 'channel_sms',
      title: 'SMS Notifications',
      desc: 'Direct SMS text alerts on your registered mobile number',
      icon: <FleetIcons.Phone className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
      badgeBg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
      enabled: smsEnabled,
    },
    {
      id: 'channel_email',
      title: 'Email Notifications',
      desc: 'Email summaries, reports, and critical system notices',
      icon: <FleetIcons.Mail className="w-4 h-4 text-sky-600 dark:text-sky-400" />,
      badgeBg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800',
      enabled: emailEnabled,
    },
    {
      id: 'channel_whatsapp',
      title: 'WhatsApp Notifications',
      desc: 'Instant WhatsApp message alerts and dispatch updates',
      icon: <FleetIcons.Chat className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
      enabled: whatsappEnabled,
    },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: t('nav.admin') || 'Admin', path: '/admin/dashboard' },
              { label: t('admin.profile.title') || 'Profile', path: '/admin/profile' },
              { label: t('admin.notifications.settings_title') }
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('admin.notifications.settings_title')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
            Control which channels deliver your alerts. Turning a channel off stops those notifications immediately.
          </p>
        </div>
      </div>

      {/* Delivery Channels */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">{t('admin.notifications.delivery_channels')}</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{t('admin.notifications.channels_desc')}</p>
        </div>

        <div className="space-y-3">
          {channels.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 hover:border-slate-200 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${item.badgeBg}`}>
                  {item.icon}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</div>
                    {item.id !== 'master_push' && !masterEnabled && (
                      <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                        Muted by Master
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">{item.desc}</div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                disabled={Boolean(savingField)}
                aria-checked={item.enabled}
                onClick={() => toggleChannel(item.id, item.enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 disabled:opacity-60 disabled:cursor-wait ${item.enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-zinc-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
          <FleetIcons.Bell className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <p className="text-[11px] text-blue-800 dark:text-blue-300 font-medium">
            Critical emergency safety alerts may still be delivered in-app even when a channel is off, so you never miss a life-safety broadcast.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => navigate('/admin/profile')}
          className="px-6 py-2.5 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-slate-900 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default AdminNotificationSettingsPage;
