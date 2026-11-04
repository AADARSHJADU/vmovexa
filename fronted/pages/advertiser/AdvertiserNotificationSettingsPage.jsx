import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import React, { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useNotifications } from '../../hooks/shared/useNotifications';
import Breadcrumb from '../../components/ui/Breadcrumb';

export const AdvertiserNotificationSettingsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isSuperAdmin = location.pathname.startsWith('/superadmin');
  const basePath = isSuperAdmin ? '/superadmin/advertiser' : '/advertiser';
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
      icon: FleetIcons.Bell,
      iconColor: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
      enabled: masterEnabled,
    },
    {
      id: 'channel_in_app',
      title: 'Web Notifications',
      desc: 'Real-time browser popups and in-app dashboard notifications',
      icon: FleetIcons.Globe,
      iconColor: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/60',
      enabled: webEnabled,
    },
    {
      id: 'channel_push',
      title: 'Push Notifications',
      desc: 'Mobile device push notifications and alerts',
      icon: FleetIcons.Smartphone,
      iconColor: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60',
      enabled: pushEnabled,
    },
    {
      id: 'channel_sms',
      title: 'SMS Notifications',
      desc: 'Direct SMS text alerts on your registered mobile number',
      icon: FleetIcons.Chat,
      iconColor: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800/60',
      enabled: smsEnabled,
    },
    {
      id: 'channel_email',
      title: 'Mail Notifications',
      desc: 'Email summaries, reports, and critical system notices',
      icon: FleetIcons.Mail,
      iconColor: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/60',
      enabled: emailEnabled,
    },
    {
      id: 'channel_whatsapp',
      title: 'WhatsApp Notifications',
      desc: 'Instant WhatsApp message alerts and dispatch updates',
      icon: FleetIcons.Phone,
      iconColor: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
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
              { label: isSuperAdmin ? t('nav.superadmin', 'SuperAdmin') : t('roles.advertiser', 'Advertiser'), path: `${basePath}/dashboard`, icon: FleetIcons.Dashboard },
              { label: t('advertiser.profile.breadcrumb', 'Profile'), path: `${basePath}/profile` },
              { label: t('advertiser.notifications.settings_title', 'Notification Settings') }
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">{t('advertiser.notifications.settings_title')}</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
            {t('ag.advertiser.advertisernotificationsettingspage.manage_all_notifications_and_five_delivery_c', 'Manage all notifications and five delivery channels')}
          </p>
        </div>

        <Link
          to={`${basePath}/profile`}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-bold rounded-xl transition-all self-start sm:self-auto cursor-pointer"
        >
          {t('ag.advertiser.advertisernotificationsettingspage.done', 'Done')}
        </Link>
      </div>

      {/* 5 Channels Settings Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
        <div className="pb-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t('advertiser.notifications.channels_title')}</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{t('advertiser.notifications.channels_desc')}</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 font-mono">
            {t('ag.advertiser.advertisernotificationsettingspage.master_5_channels', 'Master + 5 Channels')}
          </span>
        </div>

        <div className="space-y-3.5">
          {channels.map((ch) => {
            const IconComponent = ch.icon;
            return (
              <div
                key={ch.id}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-50/70 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${ch.iconColor}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{ch.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium mt-0.5">{ch.desc}</p>
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
                  <div className="w-11 h-6 bg-slate-200 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-zinc-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdvertiserNotificationSettingsPage;
