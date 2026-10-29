import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons.jsx';
import { Breadcrumb } from '../../components/ui/Breadcrumb.jsx';
import { useNotifications } from '../../hooks/shared/useNotifications.js';
import { useTranslation } from '../../hooks/useTranslation.js';

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
  const { t } = useTranslation();
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
      .catch((err) => toast.error(t('superadmin.channels.toast_load_err') + `: ${err.message}`))
      .finally(() => setLoading(false));
  }, [loadSettings, t]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(channels);
      toast.success(t('superadmin.channels.toast_saved'));
    } catch (err) {
      toast.error(err.message || t('superadmin.channels.toast_save_err'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <FleetIcons.Spinner className="w-6 h-6 animate-spin text-blue-600" />
          <span>{t('superadmin.channels.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-200">
      {/* Standard Reusable Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('nav.superadmin'), to: '/superadmin/dashboard' },
          { label: t('superadmin.settings.title'), to: '/superadmin/settings' },
          { label: t('superadmin.channels.title') },
        ]}
      />

      {/* Header & Sub-Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-1">
            {t('superadmin.channels.title')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            {t('superadmin.channels.subtitle')}
          </p>
        </div>

        {/* Top Gateway Sub-Links Nav */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-800/80 p-1.5 rounded-xl text-xs font-bold overflow-x-auto no-scrollbar">
          <Link to="/superadmin/settings/notifications/channels" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm whitespace-nowrap flex-shrink-0">
            <FleetIcons.Sliders className="w-3.5 h-3.5" />
            <span>{t('superadmin.notifications.tab_master_channels')}</span>
          </Link>
          <Link to="/superadmin/settings/notifications/rules" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 whitespace-nowrap flex-shrink-0">
            <FleetIcons.FileText className="w-3.5 h-3.5" />
            <span>{t('superadmin.notifications.tab_event_rules')}</span>
          </Link>
          <Link to="/superadmin/settings/notifications/email" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 whitespace-nowrap flex-shrink-0">
            <FleetIcons.Mail className="w-3.5 h-3.5" />
            <span>{t('superadmin.notifications.tab_smtp')}</span>
          </Link>
          <Link to="/superadmin/settings/notifications/sms" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 whitespace-nowrap flex-shrink-0">
            <FleetIcons.Phone className="w-3.5 h-3.5" />
            <span>{t('superadmin.notifications.tab_sms')}</span>
          </Link>
          <Link to="/superadmin/settings/notifications/whatsapp" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 whitespace-nowrap flex-shrink-0">
            <FleetIcons.Chat className="w-3.5 h-3.5" />
            <span>{t('superadmin.notifications.tab_whatsapp')}</span>
          </Link>
          <Link to="/superadmin/settings/notifications/push" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 whitespace-nowrap flex-shrink-0">
            <FleetIcons.Bell className="w-3.5 h-3.5" />
            <span>{t('superadmin.notifications.tab_push')}</span>
          </Link>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Master Channel Switches */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <span>{t('superadmin.channels.master_toggles')}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                {t('superadmin.channels.master_toggles_desc')}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              {t('superadmin.channels.active_badge')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">{t('superadmin.channels.in_app_alerts')}</span>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('superadmin.channels.header_bell')}</p>
              </div>
              <ToggleSwitch
                id="channel_in_app"
                label={t('superadmin.channels.lbl_in_app')}
                checked={channels.channel_in_app}
                onChange={(val) => setChannels({ ...channels, channel_in_app: val })}
              />
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">{t('superadmin.channels.email_dispatches')}</span>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('superadmin.channels.transactional_emails')}</p>
              </div>
              <ToggleSwitch
                id="channel_email"
                label={t('superadmin.channels.lbl_email')}
                checked={channels.channel_email}
                onChange={(val) => setChannels({ ...channels, channel_email: val })}
              />
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">{t('superadmin.channels.fcm_push')}</span>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('superadmin.channels.mobile_web_banners')}</p>
              </div>
              <ToggleSwitch
                id="channel_push"
                label={t('superadmin.channels.lbl_push')}
                checked={channels.channel_push}
                onChange={(val) => setChannels({ ...channels, channel_push: val })}
              />
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">{t('superadmin.channels.sms_texts')}</span>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('superadmin.channels.twilio_dlt')}</p>
              </div>
              <ToggleSwitch
                id="channel_sms"
                label={t('superadmin.channels.lbl_sms')}
                checked={channels.channel_sms}
                onChange={(val) => setChannels({ ...channels, channel_sms: val })}
              />
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center justify-between border-emerald-200 dark:border-emerald-800/50">
              <div>
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">{t('superadmin.channels.whatsapp_alerts')}</span>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('superadmin.channels.meta_twilio_whatsapp')}</p>
              </div>
              <ToggleSwitch
                id="channel_whatsapp"
                label={t('superadmin.channels.lbl_whatsapp')}
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
              <span>{t('superadmin.channels.quiet_hours_title')}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
              {t('superadmin.channels.quiet_hours_desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                {t('superadmin.channels.quiet_start')}
              </label>
              <input
                type="time"
                value={channels.quiet_hours_start}
                onChange={(e) => setChannels({ ...channels, quiet_hours_start: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-bold text-slate-900 dark:text-zinc-100"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                {t('superadmin.channels.quiet_end')}
              </label>
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
            <span>{saving ? t('superadmin.channels.saving_btn') : t('superadmin.channels.save_btn')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SuperChannelSettingsPage;
