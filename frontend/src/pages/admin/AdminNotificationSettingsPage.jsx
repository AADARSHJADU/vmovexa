import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { useNotifications } from '../../hooks/shared/useNotifications';
import Breadcrumb from '../../components/ui/Breadcrumb';

export const AdminNotificationSettingsPage = () => {
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
  const masterEnabled = settingsObj?.master_push ?? true;

  // Each toggle persists immediately to the backend (user_notification_settings),
  // which the dispatch engine honors — turning a channel OFF stops delivery.
  const toggleChannel = (field, currentValue) => {
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
    { id: 'master_push', title: 'Master Notifications Switch', desc: 'Global on/off for all non-critical notifications across every channel', icon: '🔔', enabled: masterEnabled },
    { id: 'channel_in_app', title: 'Web / In-App Notifications', desc: 'Real-time browser popups and in-app dashboard notifications', icon: '🌐', enabled: webEnabled },
    { id: 'channel_push', title: 'Push Notifications', desc: 'Mobile device push notifications and alerts', icon: '📱', enabled: pushEnabled },
    { id: 'channel_sms', title: 'SMS Notifications', desc: 'Direct SMS text alerts on your registered mobile number', icon: '💬', enabled: smsEnabled },
    { id: 'channel_email', title: 'Email Notifications', desc: 'Email summaries, reports, and critical system notices', icon: '✉️', enabled: emailEnabled },
    { id: 'channel_whatsapp', title: 'WhatsApp Notifications', desc: 'Instant WhatsApp message alerts and dispatch updates', icon: '💚', enabled: whatsappEnabled },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'Dashboard', to: '/admin/dashboard' },
              { label: 'Admin Profile', to: '/admin/profile' },
              { label: 'Notification Settings' }
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">Notification Settings</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
            Control which channels deliver your alerts. Turning a channel off stops those notifications immediately.
          </p>
        </div>
      </div>

      {/* Delivery Channels — real, backend-persisted toggles */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Delivery Channels</h2>
          <p className="text-xs text-slate-500 font-medium">Each toggle saves instantly and is honored by the notification engine</p>
        </div>

        <div className="space-y-3">
          {channels.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <div>
                  <div className="text-xs font-bold text-slate-900">{item.title}</div>
                  <div className="text-[11px] text-slate-500 font-medium">{item.desc}</div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={item.enabled}
                onClick={() => toggleChannel(item.id, item.enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${item.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
          <FleetIcons.Bell className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <p className="text-[11px] text-blue-800 font-medium">
            Critical emergency safety alerts may still be delivered in-app even when a channel is off, so you never miss a life-safety broadcast.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => navigate('/admin/profile')}
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default AdminNotificationSettingsPage;
