import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useNotifications } from '../../hooks/shared/useNotifications';
import Breadcrumb from '../../components/ui/Breadcrumb';

export const AdvertiserNotificationSettingsPage = () => {
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
      icon: '🌐',
      enabled: webEnabled,
    },
    {
      id: 'channel_push',
      title: 'Push Notifications',
      desc: 'Mobile device push notifications and alerts',
      icon: '📱',
      enabled: pushEnabled,
    },
    {
      id: 'channel_sms',
      title: 'SMS Notifications',
      desc: 'Direct SMS text alerts on your registered mobile number',
      icon: '💬',
      enabled: smsEnabled,
    },
    {
      id: 'channel_email',
      title: 'Mail Notifications',
      desc: 'Email summaries, reports, and critical system notices',
      icon: '✉️',
      enabled: emailEnabled,
    },
    {
      id: 'channel_whatsapp',
      title: 'WhatsApp Notifications',
      desc: 'Instant WhatsApp message alerts and dispatch updates',
      icon: '💚',
      enabled: whatsappEnabled,
    },
  ];

  return (
    <div className="w-full space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Header */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <Breadcrumb
            items={[
              { label: t('nav.dashboard', 'Dashboard'), to: '/advertiser/dashboard' },
              { label: t('nav.profile', 'Profile'), to: '/advertiser/profile' },
              { label: t('advertiser.notifications.settings_title') }
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">{t('advertiser.notifications.settings_title')}</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
            Manage all notifications and five delivery channels
          </p>
        </div>

        <Link
          to="/advertiser/profile"
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all self-start sm:self-auto"
        >
          Done
        </Link>
      </div>

      {/* 5 Channels Settings Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
        <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t('advertiser.notifications.channels_title')}</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{t('advertiser.notifications.channels_desc')}</p>
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

export default AdvertiserNotificationSettingsPage;

