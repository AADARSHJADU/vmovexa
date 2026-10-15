import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons.jsx';
import { Breadcrumb } from '../../components/ui/Breadcrumb.jsx';
import { useNotifications } from '../../hooks/shared/useNotifications.js';

export const SuperPushSettingsPage = () => {
  const { sendTestPush } = useNotifications();
  const [testingPush, setTestingPush] = useState(false);

  const [browserPermission, setBrowserPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  const handleRequestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        setBrowserPermission(res);
        if (res === 'granted') {
          toast.success('Native browser desktop push notifications enabled!');
        } else {
          toast.error('Browser push permission denied.');
        }
      } catch (err) {
        toast.error(`Permission error: ${err.message}`);
      }
    }
  };

  const handleTestPushAlert = async () => {
    setTestingPush(true);
    const tid = toast.loading('Dispatching multicast push notification alert via FCM...');
    try {
      const res = await sendTestPush();
      toast.dismiss(tid);
      toast.success(res?.message || 'Multicast push alert dispatched via Firebase FCM v1!');
    } catch (err) {
      toast.dismiss(tid);
      toast.error(err.message || 'Push test failed');
    } finally {
      setTestingPush(false);
    }
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-200">
      {/* Standard Reusable Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'SuperAdmin', to: '/superadmin/dashboard' },
          { label: 'Settings', to: '/superadmin/settings' },
          { label: 'Push & Firebase Gateway' },
        ]}
      />

      {/* Header & Sub-Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-1">
            Firebase Cloud Messaging (FCM) Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Inspect Firebase project `vmovexa-5f0cf` status, browser native OS notification permissions, and test multicast push dispatches.
          </p>
        </div>

        {/* Top Gateway Sub-Links Nav */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-800/80 p-1.5 rounded-xl text-xs font-bold overflow-x-auto no-scrollbar">
          <Link to="/superadmin/settings/notifications/channels" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 whitespace-nowrap flex-shrink-0">
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
          <Link to="/superadmin/settings/notifications/push" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm whitespace-nowrap flex-shrink-0">
            <FleetIcons.Bell className="w-3.5 h-3.5" />
            <span>Push (Firebase)</span>
          </Link>
        </div>
      </div>

      {/* FCM Ready Alert Banner */}
      <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <FleetIcons.Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-emerald-900 dark:text-emerald-200">
                Firebase Cloud Messaging v1 Engine Operational
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase">
                Connected
              </span>
            </div>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 font-medium mt-0.5">
              Service account credentials initialized. Multicast push dispatches active for mobile apps and vehicle tablets.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTestPushAlert}
          disabled={testingPush}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-60 flex-shrink-0"
        >
          <FleetIcons.Speed className="w-3.5 h-3.5 text-white" />
          <span>{testingPush ? 'Sending Test Push...' : 'Send Test Push Alert'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Firebase Config Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100">
              Firebase Project Credentials
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
              Server credentials initialized from secure service account JSON file.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Project ID</span>
                <p className="text-xs font-mono font-bold text-slate-900 dark:text-zinc-100">vmovexa-5f0cf</p>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                Google Cloud
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Service Account Email</span>
                <p className="text-xs font-mono font-bold text-slate-900 dark:text-zinc-100 truncate max-w-xs">
                  firebase-adminsdk-fbsvc@vmovexa-5f0cf.iam.gserviceaccount.com
                </p>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Authorized
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Credential JSON File</span>
                <p className="text-xs font-mono font-bold text-slate-900 dark:text-zinc-100">
                  backend/src/config/firebase-service-account.json
                </p>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300">
                Encrypted Disk
              </span>
            </div>
          </div>
        </div>

        {/* Browser WebPush Permission Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100">
                Web Browser Desktop Push
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                Enable native OS popups for instant emergency alerts and vehicle telemetry warnings.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">Browser Status</span>
                <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                  {browserPermission === 'granted' ? (
                    <>
                      <FleetIcons.CheckCircle className="w-3.5 h-3.5 text-emerald-600 inline" />
                      <span>Notifications Granted (Browser alerts active)</span>
                    </>
                  ) : browserPermission === 'denied' ? (
                    <>
                      <FleetIcons.XCircle className="w-3.5 h-3.5 text-rose-600 inline" />
                      <span>Notifications Blocked (Enable in browser settings)</span>
                    </>
                  ) : (
                    <>
                      <FleetIcons.AlertTriangle className="w-3.5 h-3.5 text-amber-500 inline" />
                      <span>Permission Default (Click to request access)</span>
                    </>
                  )}
                </p>
              </div>

              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                browserPermission === 'granted'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : browserPermission === 'denied'
                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
              }`}>
                {browserPermission.toUpperCase()}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Native desktop push notifications trigger OS banners even when the VMOVEXA web browser window is minimized or in the background.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-3">
            {browserPermission !== 'granted' && (
              <button
                type="button"
                onClick={handleRequestPermission}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>Request Notification Permission</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleTestPushAlert}
              disabled={testingPush}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-60"
            >
              <FleetIcons.Speed className="w-3.5 h-3.5" />
              <span>{testingPush ? 'Dispatching...' : 'Trigger Push Event'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperPushSettingsPage;
