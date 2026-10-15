import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons.jsx';
import { Breadcrumb } from '../../components/ui/Breadcrumb.jsx';
import { useNotifications } from '../../hooks/shared/useNotifications.js';
import { useAuth } from '../../hooks/useAuth.js';

export const SuperSmtpSettingsPage = () => {
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
      .catch((err) => toast.error(`Failed to load SMTP config: ${err.message}`))
      .finally(() => setLoading(false));
  }, [loadSmtpConfig, user]);

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
      toast.success('SMTP email configuration saved successfully!');
      setSmtpForm((prev) => ({ ...prev, smtp_pass: '' }));
    } catch (err) {
      toast.error(err.message || 'Failed to save SMTP config');
    } finally {
      setSavingSmtp(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmailTo) {
      toast.error('Please enter a recipient email address');
      return;
    }
    setTestingEmail(true);
    const tid = toast.loading(`Sending test email to ${testEmailTo}...`);
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
      toast.success(`Test email dispatched successfully to ${testEmailTo}! Check inbox.`);
    } catch (err) {
      toast.dismiss(tid);
      toast.error(err.message || 'SMTP Test Email failed');
    } finally {
      setTestingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <FleetIcons.Spinner className="w-6 h-6 animate-spin text-blue-600" />
          <span>Loading SMTP configuration...</span>
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
          { label: 'Email (SMTP) Gateway' },
        ]}
      />

      {/* Header & Sub-Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-1">
            Email & SMTP Server Gateway
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Configure outgoing mail server host, authentication credentials, and dispatch live test emails.
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
          <Link to="/superadmin/settings/notifications/email" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm whitespace-nowrap flex-shrink-0">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveSmtp} className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100">
                  SMTP Server Credentials
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  Enter your mail server host, port, and authentication credentials.
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold">
                TLS / SSL Supported
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">SMTP Host Server</label>
                <input
                  type="text"
                  required
                  value={smtpForm.smtp_host}
                  onChange={(e) => setSmtpForm({ ...smtpForm, smtp_host: e.target.value })}
                  placeholder="smtp.gmail.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-mono font-bold text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Port (587 / 465)</label>
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
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Username / Auth Email</label>
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
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Password / App Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={smtpForm.smtp_pass}
                    onChange={(e) => setSmtpForm({ ...smtpForm, smtp_pass: e.target.value })}
                    placeholder="Leave blank to keep existing"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-mono font-bold text-slate-900 dark:text-zinc-100 pr-10 focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Sender "From" Email Header</label>
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
                <span>Enable SSL/TLS Security (Port 465 SSL, Port 587 STARTTLS)</span>
              </label>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="submit"
                disabled={savingSmtp}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-60"
              >
                {savingSmtp && <FleetIcons.Spinner className="w-4 h-4 animate-spin text-white" />}
                <span>{savingSmtp ? 'Saving SMTP Config...' : 'Save SMTP Credentials'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Handshake Test Box (1 col) */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-4 h-fit">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <span>Send Live Test Email</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
              Verify your SMTP connection by dispatching an instant test email.
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Recipient Email Address</label>
              <input
                type="email"
                required
                value={testEmailTo}
                onChange={(e) => setTestEmailTo(e.target.value)}
                placeholder="amarthpatel0511@gmail.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-mono font-bold text-slate-900 dark:text-zinc-100"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 text-xs space-y-1 text-slate-600 dark:text-zinc-400">
              <div className="font-bold text-slate-900 dark:text-zinc-200">Handshake Steps:</div>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                <li>TCP Socket connect to {smtpForm.smtp_host || 'Host'}:{smtpForm.smtp_port || 587}</li>
                <li>AUTH LOGIN for {smtpForm.smtp_user || 'User'}</li>
                <li>Delivery of VMOVEXA test HTML template</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={handleTestEmail}
              disabled={testingEmail || !testEmailTo}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <FleetIcons.Speed className="w-4 h-4 text-white" />
              <span>{testingEmail ? 'Sending Test Email...' : 'Send Live Test Email Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperSmtpSettingsPage;
