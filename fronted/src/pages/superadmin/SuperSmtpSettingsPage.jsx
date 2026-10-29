import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons.jsx';
import { Breadcrumb } from '../../components/ui/Breadcrumb.jsx';
import { useNotifications } from '../../hooks/shared/useNotifications.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useTranslation } from '../../hooks/useTranslation.js';

export const SuperSmtpSettingsPage = () => {
  const { t } = useTranslation();
  const { loadSmtpConfig, saveSmtpConfig, sendTestEmail } = useNotifications();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testEmailTo, setTestEmailTo] = useState('');

  const [smtpForm, setSmtpForm] = useState({
    smtp_host: '',
    smtp_port: 465,
    smtp_user: '',
    smtp_pass: '',
    smtp_from: '',
    smtp_secure: true,
  });

  useEffect(() => {
    if (user?.email) {
      setTestEmailTo(user.email);
    }

    loadSmtpConfig()
      .then((s) => {
        if (s) {
          const host = s.host || s.smtp_host || 'smtp.gmail.com';
          const port = s.port !== undefined ? Number(s.port) : (s.smtp_port !== undefined ? Number(s.smtp_port) : 465);
          const user = s.user || s.smtp_user || '';
          const from = s.from || s.smtp_from || '';
          const secure = s.secure !== undefined ? Boolean(s.secure) : (s.smtp_secure !== undefined ? Boolean(s.smtp_secure) : (Number(port) === 465));

          setSmtpForm({
            smtp_host: host,
            smtp_port: port,
            smtp_user: user,
            smtp_pass: '',
            smtp_from: from,
            smtp_secure: secure,
          });
        }
      })
      .catch((err) => toast.error(t('superadmin.smtp.toast_save_err') + `: ${err.message}`))
      .finally(() => setLoading(false));
  }, [loadSmtpConfig, user, t]);

  const handleSaveSmtp = async (e) => {
    e.preventDefault();
    setSavingSmtp(true);
    try {
      await saveSmtpConfig({
        host: smtpForm.smtp_host,
        port: smtpForm.smtp_port,
        user: smtpForm.smtp_user,
        pass: smtpForm.smtp_pass,
        from: smtpForm.smtp_from,
        secure: smtpForm.smtp_secure,
        smtp_host: smtpForm.smtp_host,
        smtp_port: smtpForm.smtp_port,
        smtp_user: smtpForm.smtp_user,
        smtp_from: smtpForm.smtp_from,
        smtp_secure: smtpForm.smtp_secure,
      });
      toast.success(t('superadmin.smtp.toast_saved'));
      setSmtpForm((prev) => ({ ...prev, smtp_pass: '' }));
    } catch (err) {
      toast.error(err.message || t('superadmin.smtp.toast_save_err'));
    } finally {
      setSavingSmtp(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmailTo) {
      toast.error(t('superadmin.smtp.toast_enter_email'));
      return;
    }
    setTestingEmail(true);
    const tid = toast.loading(t('superadmin.smtp.toast_sending_test').replace('{email}', testEmailTo));
    try {
      await sendTestEmail({
        to: testEmailTo,
        host: smtpForm.smtp_host,
        port: smtpForm.smtp_port,
        user: smtpForm.smtp_user,
        pass: smtpForm.smtp_pass,
        secure: smtpForm.smtp_secure,
      });
      toast.dismiss(tid);
      toast.success(t('superadmin.smtp.toast_test_dispatched').replace('{email}', testEmailTo));
    } catch (err) {
      toast.dismiss(tid);
      toast.error(err.message || t('superadmin.smtp.toast_test_failed'));
    } finally {
      setTestingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <FleetIcons.Spinner className="w-6 h-6 animate-spin text-blue-600" />
          <span>{t('superadmin.smtp.loading')}</span>
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
          { label: t('superadmin.smtp.breadcrumb_gateway') },
        ]}
      />

      {/* Header & Sub-Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-1">
            {t('superadmin.smtp.title')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            {t('superadmin.smtp.subtitle')}
          </p>
        </div>

        {/* Top Gateway Sub-Links Nav */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-800/80 p-1.5 rounded-xl text-xs font-bold overflow-x-auto no-scrollbar">
          <Link to="/superadmin/settings/notifications/channels" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 whitespace-nowrap flex-shrink-0">
            <FleetIcons.Sliders className="w-3.5 h-3.5" />
            <span>{t('superadmin.notifications.tab_master_channels')}</span>
          </Link>
          <Link to="/superadmin/settings/notifications/rules" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 whitespace-nowrap flex-shrink-0">
            <FleetIcons.FileText className="w-3.5 h-3.5" />
            <span>{t('superadmin.notifications.tab_event_rules')}</span>
          </Link>
          <Link to="/superadmin/settings/notifications/email" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm whitespace-nowrap flex-shrink-0">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveSmtp} className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100">
                  {t('superadmin.smtp.server_credentials')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  {t('superadmin.smtp.server_credentials_desc')}
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold">
                {t('superadmin.smtp.tls_ssl_supported')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  {t('superadmin.smtp.host_server')}
                </label>
                <input
                  type="text"
                  required
                  value={smtpForm.smtp_host}
                  onChange={(e) => setSmtpForm({ ...smtpForm, smtp_host: e.target.value })}
                  placeholder={t('superadmin.smtp.ph_host')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-mono font-bold text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  {t('superadmin.smtp.port')}
                </label>
                <input
                  type="number"
                  required
                  value={smtpForm.smtp_port}
                  onChange={(e) => setSmtpForm({ ...smtpForm, smtp_port: Number(e.target.value) })}
                  placeholder="587"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-mono font-bold text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  {t('superadmin.smtp.username')}
                </label>
                <input
                  type="text"
                  required
                  value={smtpForm.smtp_user}
                  onChange={(e) => setSmtpForm({ ...smtpForm, smtp_user: e.target.value })}
                  placeholder="alerts@vmovexa.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-mono font-bold text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  {t('superadmin.smtp.password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={smtpForm.smtp_pass}
                    onChange={(e) => setSmtpForm({ ...smtpForm, smtp_pass: e.target.value })}
                    placeholder={t('superadmin.smtp.ph_password')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-mono font-bold text-slate-900 dark:text-zinc-100 pr-10 focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    {showPassword ? t('superadmin.smtp.hide') : t('superadmin.smtp.show')}
                  </button>
                </div>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  {t('superadmin.smtp.from_header')}
                </label>
                <input
                  type="text"
                  value={smtpForm.smtp_from}
                  onChange={(e) => setSmtpForm({ ...smtpForm, smtp_from: e.target.value })}
                  placeholder='"VMOVEXA Platform" <alerts@vmovexa.com>'
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-mono font-bold text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={smtpForm.smtp_secure}
                  onChange={(e) => setSmtpForm({ ...smtpForm, smtp_secure: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>{t('superadmin.smtp.ssl_security')}</span>
              </label>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="submit"
                disabled={savingSmtp}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-60"
              >
                {savingSmtp && <FleetIcons.Spinner className="w-4 h-4 animate-spin text-white" />}
                <span>{savingSmtp ? t('superadmin.smtp.saving_btn') : t('superadmin.smtp.save_btn')}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Handshake Test Box (1 col) */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-4 h-fit">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <span>{t('superadmin.smtp.send_live_test')}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
              {t('superadmin.smtp.test_box_desc')}
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                {t('superadmin.smtp.recipient_email')}
              </label>
              <input
                type="email"
                required
                value={testEmailTo}
                onChange={(e) => setTestEmailTo(e.target.value)}
                placeholder="alerts@vmovexa.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-mono font-bold text-slate-900 dark:text-zinc-100"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 text-xs space-y-1 text-slate-600 dark:text-zinc-400">
              <div className="font-bold text-slate-900 dark:text-zinc-200">{t('superadmin.smtp.handshake_steps')}</div>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                <li>{t('superadmin.smtp.step_tcp').replace('{host}', smtpForm.smtp_host || 'Host').replace('{port}', String(smtpForm.smtp_port || 587))}</li>
                <li>{t('superadmin.smtp.step_auth').replace('{user}', smtpForm.smtp_user || 'User')}</li>
                <li>{t('superadmin.smtp.delivery_template')}</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={handleTestEmail}
              disabled={testingEmail || !testEmailTo}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <FleetIcons.Speed className="w-4 h-4 text-white" />
              <span>{testingEmail ? t('superadmin.smtp.sending_test_btn') : t('superadmin.smtp.test_btn')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperSmtpSettingsPage;
