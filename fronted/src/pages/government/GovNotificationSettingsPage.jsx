import React, { useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useNotifications } from '../../hooks/shared/useNotifications';

export const GovNotificationSettingsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { settings: remoteSettings, loadSettings, updateSettings } = useNotifications();

  useEffect(() => {
    loadSettings().catch(() => {});
  }, [loadSettings]);

  const settingsObj = remoteSettings?.settings || remoteSettings;
  const masterEnabled = settingsObj?.master_push ?? true;
  const webEnabled = settingsObj?.channel_in_app ?? true;
  const pushEnabled = settingsObj?.channel_push ?? true;
  const smsEnabled = settingsObj?.channel_sms ?? false;
  const emailEnabled = settingsObj?.channel_email ?? true;
  const whatsappEnabled = settingsObj?.channel_whatsapp ?? false;

  const toggleChannel = async (field, currentValue) => {
    toast.promise(
      updateSettings({ [field]: !currentValue }),
      {
        loading: 'Saving setting...',
        success: 'Notification preference updated!',
        error: (err) => err?.message || 'Failed to update setting',
      }
    );
  };

  const channels = [
    {
      id: 'master_push',
      title: 'All Notifications',
      desc: 'Master switch for every notification delivery channel',
      icon: '🔔',
      enabled: masterEnabled,
    },
    {
      id: 'channel_in_app',
      title: 'Web Notifications',
      desc: 'Real-time browser popups and in-app dashboard notifications',
      icon: <FleetIcons.Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/40',
      enabled: webEnabled,
    },
    {
      id: 'channel_push',
      title: 'Push Notifications',
      desc: 'Mobile device push notifications and alerts',
      icon: <FleetIcons.Phone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/40',
      enabled: pushEnabled,
    },
    {
      id: 'channel_sms',
      title: 'SMS Notifications',
      desc: 'Direct SMS text alerts on your registered mobile number',
      icon: <FleetIcons.Chat className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/40',
      enabled: smsEnabled,
    },
    {
      id: 'channel_email',
      title: 'Mail Notifications',
      desc: 'Email summaries, reports, and critical system notices',
      icon: <FleetIcons.Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-100 dark:border-purple-900/40',
      enabled: emailEnabled,
    },
    {
      id: 'channel_whatsapp',
      title: 'WhatsApp Notifications',
      desc: 'Instant WhatsApp message alerts and dispatch updates',
      icon: <FleetIcons.ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/40',
      enabled: whatsappEnabled,
    },
  ];

  return (
    <div className="w-full space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Header */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/government/profile')}
            className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors font-bold text-xs"
          >
            <FleetIcons.ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <Breadcrumb
              items={[
                { label: 'Government', path: '/government/dashboard' },
                { label: 'Profile', path: '/government/profile' },
                { label: 'Notification Settings' },
              ]}
              className="mb-2"
            />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">{t('gov.notifications.title')}</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
              Manage all notifications and five delivery channels
            </p>
          </div>
        </div>

        <Link
          to="/government/profile"
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all self-start sm:self-auto"
        >
          Done
        </Link>
      </div>

      {/* 5 Channels Settings Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
        <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{t('driver.notifications.channels_title')}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{t('driver.notifications.channels_desc')}</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
            Master + 5 Channels
          </span>
        </div>

        <div className="space-y-3.5">
          {channels.map((ch) => (
            <div
              key={ch.id}
              className="flex items-center justify-between p-4 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition-all"
            >
              <div className="flex items-center gap-3.5">
                <span className="text-2xl">{ch.icon}</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{ch.title}</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">{ch.desc}</p>
                </div>
              </div>

              {/* Custom Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={ch.enabled}
                  onChange={() => toggleChannel(ch.id, ch.enabled)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GovNotificationSettingsPage;

