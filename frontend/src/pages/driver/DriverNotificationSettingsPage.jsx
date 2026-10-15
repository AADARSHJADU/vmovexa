import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { useNotifications } from '../../hooks/shared/useNotifications';

export const DriverNotificationSettingsPage = () => {
  const navigate = useNavigate();
  const { settings: remoteSettings, loadSettings, updateSettings } = useNotifications();

  useEffect(() => {
    loadSettings().catch(() => {});
  }, [loadSettings]);

  const settingsObj = remoteSettings?.settings || remoteSettings;
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
      id: 'channel_in_app',
      title: 'Web Notifications',
      desc: 'Real-time browser popups and in-app dashboard notifications',
      icon: <FleetIcons.Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      enabled: webEnabled,
    },
    {
      id: 'channel_push',
      title: 'Push Notifications',
      desc: 'Mobile device push notifications and alerts',
      icon: <FleetIcons.Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      enabled: pushEnabled,
    },
    {
      id: 'channel_sms',
      title: 'SMS Notifications',
      desc: 'Direct SMS text alerts on your registered mobile number',
      icon: <FleetIcons.Document className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      enabled: smsEnabled,
    },
    {
      id: 'channel_email',
      title: 'Mail Notifications',
      desc: 'Email summaries, reports, and critical system notices',
      icon: <FleetIcons.Help className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      enabled: emailEnabled,
    },
    {
      id: 'channel_whatsapp',
      title: 'WhatsApp Notifications',
      desc: 'Instant WhatsApp message alerts and dispatch updates',
      icon: <FleetIcons.Check className="w-5 h-5 text-teal-600 dark:text-teal-400" />,
      enabled: whatsappEnabled,
    },
  ];

  return (
    <div className="w-full space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Driver', path: '/driver/dashboard' },
            { label: 'Profile', path: '/driver/profile' },
            { label: 'Notification Settings' },
          ]}
          className="mb-2"
        />
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/driver/profile')}
              className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors font-bold text-xs"
              title="Back to Profile"
            >
              <FleetIcons.ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Driver Notification Settings</h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                Manage your delivery preferences across 5 notification channels
              </p>
            </div>
          </div>

          <Link
            to="/driver/profile"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all self-start sm:self-auto text-center"
          >
            Done
          </Link>
        </div>
      </div>

      {/* 5 Channels Settings Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
        <div className="pb-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Notification Delivery Channels</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Toggle channels on or off according to your preference</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-mono">
            5 Channels
          </span>
        </div>

        <div className="space-y-3.5">
          {channels.map((ch) => (
            <div
              key={ch.id}
              className="flex items-center justify-between p-4 rounded-xl bg-slate-50/70 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shrink-0">
                  {ch.icon}
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
                <div className="w-11 h-6 bg-slate-200 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DriverNotificationSettingsPage;

