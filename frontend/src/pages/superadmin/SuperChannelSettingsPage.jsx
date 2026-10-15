import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons.jsx';
import { Breadcrumb } from '../../components/ui/Breadcrumb.jsx';
import { useNotifications } from '../../hooks/shared/useNotifications.js';

const ToggleSwitch = ({ checked, onChange, disabled = false, id, label }) => (
  <button
    id={id}
    type="button"
    role="switch"
    aria-label={label}
    aria-checked={checked}
    disabled={disabled}
    onClick={() => !disabled && onChange(!checked)}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${
      checked ? 'bg-blue-600' : 'bg-slate-300 dark:bg-zinc-700'
    } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

export const SuperChannelSettingsPage = () => {
  const { loadSettings, updateSettings } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [channels, setChannels] = useState({
    master_push: true,
    channel_in_app: true,
    channel_email: true,
    channel_push: true,
    channel_sms: true,
    channel_whatsapp: true,
    quiet_hours_start: '',
    quiet_hours_end: '',
  });

  useEffect(() => {
    loadSettings()
      .then((res) => {
        if (res?.settings) {
          setChannels({
            master_push: res.settings.master_push ?? true,
            channel_in_app: res.settings.channel_in_app ?? true,
            channel_email: res.settings.channel_email ?? true,
            channel_push: res.settings.channel_push ?? true,
            channel_sms: res.settings.channel_sms ?? true,
            channel_whatsapp: res.settings.channel_whatsapp ?? true,
            quiet_hours_start: res.settings.quiet_hours_start ? String(res.settings.quiet_hours_start).slice(0, 5) : '',
            quiet_hours_end: res.settings.quiet_hours_end ? String(res.settings.quiet_hours_end).slice(0, 5) : '',
          });
        }
      })
      .catch((err) => toast.error(`Failed loading channel settings: ${err.message}`))
      .finally(() => setLoading(false));
  }, [loadSettings]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(channels);
      toast.success('Channel master controls & Quiet Hours saved!');
    } catch (err) {
      toast.error(err.message || 'Failed to save channel settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <FleetIcons.Spinner className="w-6 h-6 animate-spin text-blue-600" />
          <span>Loading master channel settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-200">
      {/* Standard Reusable Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'SuperAdmin', to: '/superadmin/dashboard' },
          { label: 'Settings', to: '/superadmin/settings' },
          { label: 'Master Notification Channels' },
        ]}
      />

      {/* Header & Sub-Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-1">
            Master Notification Channels
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Configure global master switches for In-App, Email, Push, and SMS dispatch channels & Quiet Hours window.
          </p>
        </div>

        {/* Top Gateway Sub-Links Nav */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-800/80 p-1.5 rounded-xl text-xs font-bold overflow-x-auto no-scrollbar">
          <Link to="/superadmin/settings/notifications/channels" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm whitespace-nowrap flex-shrink-0">
            <FleetIcons.Sliders className="w-3.5 h-3.5" />
            <span>Master Channels</span>
          </Link>
          <Link to="/superadmin/settings/notifications/rules" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 whitespace-nowrap flex-shrink-0">
            <FleetIcons.FileText className="w-3.5 h-3.5" />
            <span>Event Rules</span>
          </Link>
          <Link to="/superadmin/settings/notifications/email" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 whitespace-nowrap flex-shrink-0">
            <FleetIcons.Mail className="w-3.5 h-3.5" />
            <span>Email (SMTP)</span>
          </Link>
          <Link to="/superadmin/settings/notifications/sms" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 whitespace-nowrap flex-shrink-0">
            <FleetIcons.Phone className="w-3.5 h-3.5" />
            <span>SMS & Twilio</span>
          </Link>
          <Link to="/superadmin/settings/notifications/whatsapp" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 whitespace-nowrap flex-shrink-0">
            <FleetIcons.Chat className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </Link>
          <Link to="/superadmin/settings/notifications/push" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 whitespace-nowrap flex-shrink-0">
            <FleetIcons.Bell className="w-3.5 h-3.5" />
            <span>Push (Firebase)</span>
          </Link>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Master Channel Switches */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Channel Master Toggles</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                Disable an entire channel globally across all platform event dispatches.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">In-App Alerts</span>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">Header bell notifications</p>
              </div>
              <ToggleSwitch
                id="channel_in_app"
                label="In-App Notifications"
                checked={channels.channel_in_app}
                onChange={(val) => setChannels({ ...channels, channel_in_app: val })}
              />
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">Email Dispatches</span>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">Transactional emails</p>
              </div>
              <ToggleSwitch
                id="channel_email"
                label="Email Dispatches"
                checked={channels.channel_email}
                onChange={(val) => setChannels({ ...channels, channel_email: val })}
              />
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">FCM Push Alerts</span>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">Mobile & Web banners</p>
              </div>
              <ToggleSwitch
                id="channel_push"
                label="Push Alerts"
                checked={channels.channel_push}
                onChange={(val) => setChannels({ ...channels, channel_push: val })}
              />
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">SMS Texts</span>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">Twilio & DLT SMS</p>
              </div>
              <ToggleSwitch
                id="channel_sms"
                label="SMS Alerts"
                checked={channels.channel_sms}
                onChange={(val) => setChannels({ ...channels, channel_sms: val })}
              />
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center justify-between border-emerald-200 dark:border-emerald-800/50">
              <div>
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">WhatsApp Alerts</span>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">Meta & Twilio WhatsApp</p>
              </div>
              <ToggleSwitch
                id="channel_whatsapp"
                label="WhatsApp Alerts"
                checked={channels.channel_whatsapp}
                onChange={(val) => setChannels({ ...channels, channel_whatsapp: val })}
              />
            </div>
          </div>
        </div>

        {/* Quiet Hours / DND Schedule Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <FleetIcons.Moon className="w-4 h-4 text-indigo-500" />
              <span>Quiet Hours (Do Not Disturb Window)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
              Routine non-critical push and email notifications will be held back during these hours. Emergency SOS alerts bypass quiet hours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Quiet Hours Start Time</label>
              <input
                type="time"
                value={channels.quiet_hours_start}
                onChange={(e) => setChannels({ ...channels, quiet_hours_start: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-bold text-slate-900 dark:text-zinc-100"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Quiet Hours End Time</label>
              <input
                type="time"
                value={channels.quiet_hours_end}
                onChange={(e) => setChannels({ ...channels, quiet_hours_end: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-bold text-slate-900 dark:text-zinc-100"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-60"
          >
            {saving && <FleetIcons.Spinner className="w-4 h-4 animate-spin text-white" />}
            <span>{saving ? 'Saving Settings...' : 'Save Channel Master Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SuperChannelSettingsPage;
