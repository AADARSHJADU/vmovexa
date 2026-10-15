import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { FleetIcons } from '../../components/FleetIcons';
import { useNotifications } from '../../hooks/shared/useNotifications';

export const NotificationSettingsPage = () => {
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
      IconComp: FleetIcons.Bell,
      iconColor: 'text-blue-500 dark:text-blue-400',
      iconBg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
      enabled: webEnabled,
    },
    {
      id: 'channel_push',
      title: 'Push Notifications',
      desc: 'Mobile device push notifications and alerts',
      IconComp: FleetIcons.Phone,
      iconColor: 'text-purple-500 dark:text-purple-400',
      iconBg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
      enabled: pushEnabled,
    },
    {
      id: 'channel_sms',
      title: 'SMS Notifications',
      desc: 'Direct SMS text alerts on your registered mobile number',
      IconComp: FleetIcons.Message,
      iconColor: 'text-amber-500 dark:text-amber-400',
      iconBg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
      enabled: smsEnabled,
    },
    {
      id: 'channel_email',
      title: 'Mail Notifications',
      desc: 'Email summaries, reports, and critical system notices',
      IconComp: FleetIcons.Mail,
      iconColor: 'text-rose-500 dark:text-rose-400',
      iconBg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
      enabled: emailEnabled,
    },
    {
      id: 'channel_whatsapp',
      title: 'WhatsApp Notifications',
      desc: 'Instant WhatsApp message alerts and dispatch updates',
      IconComp: FleetIcons.Send,
      iconColor: 'text-emerald-500 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
      enabled: whatsappEnabled,
    },
  ];

  return (
    <div className="w-full space-y-6 pb-20 animate-in fade-in duration-200">
      {/* 1. Global Standard Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Fleet Manager', path: '/fleet-manager/dashboard' },
          { label: 'Profile', path: '/fleet-manager/profile' },
          { label: 'Notification Settings' },
        ]}
        className="mb-2"
      />

      {/* Header Banner */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/fleet-manager/profile')}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
            title="Back to Profile"
          >
            <FleetIcons.ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Notification Settings</h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
              Manage your delivery preferences across 5 notification channels
            </p>
          </div>
        </div>

        <Link
          to="/fleet-manager/profile"
          className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold rounded-xl transition-all self-start sm:self-auto hover:bg-slate-800 dark:hover:bg-zinc-100"
        >
          Done
        </Link>
      </div>

      {/* 5 Channels Settings Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5 transition-colors">
        <div className="pb-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Notification Delivery Channels</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Toggle channels on or off according to your preference</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-mono">
            5 Channels
          </span>
        </div>

        <div className="space-y-3.5">
          {channels.map((ch) => {
            const Icon = ch.IconComp;
            return (
              <div
                key={ch.id}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-50/70 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${ch.iconBg}`}>
                    <Icon className={`w-5 h-5 ${ch.iconColor}`} />
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
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
