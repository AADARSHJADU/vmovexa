import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons.jsx';
import { Breadcrumb } from '../../components/ui/Breadcrumb.jsx';
import { useWhatsappNotification } from '../../hooks/useWhatsappNotification.js';

const ToggleSwitch = ({ checked, onChange, disabled = false, id, label }) => (
  <button
    id={id}
    type="button"
    role="switch"
    aria-label={label}
    aria-checked={checked}
    disabled={disabled}
    onClick={() => !disabled && onChange(!checked)}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${
      checked ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-zinc-700'
    } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

export const SuperWhatsappSettingsPage = () => {
  const {
    config,
    loading,
    saving,
    testing,
    fetchConfig,
    updateConfig,
    sendTestMessage,
  } = useWhatsappNotification();

  const [formData, setFormData] = useState({
    provider: 'twilio',
    whatsapp_from_number: 'whatsapp:+14155238886',
    whatsapp_business_id: '',
    whatsapp_phone_number_id: '',
    whatsapp_api_token: '',
    whatsapp_webhook_secret: '',
    default_language: 'en',
    whatsapp_fallback_sms: true,
    critical_only: false,
    enabled: true,
  });

  const [testRecipient, setTestRecipient] = useState('');
  const [testMessage, setTestMessage] = useState('Hello from VMOVEXA! This is a test WhatsApp notification confirming your gateway setup.');

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    if (config) {
      setFormData({
        provider: config.provider || 'twilio',
        whatsapp_from_number: config.whatsapp_from_number || 'whatsapp:+14155238886',
        whatsapp_business_id: config.whatsapp_business_id || '',
        whatsapp_phone_number_id: config.whatsapp_phone_number_id || '',
        whatsapp_api_token: '',
        whatsapp_webhook_secret: '',
        default_language: config.default_language || 'en',
        whatsapp_fallback_sms: config.whatsapp_fallback_sms ?? true,
        critical_only: config.critical_only ?? false,
        enabled: config.enabled ?? true,
      });
    }
  }, [config]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateConfig(formData).unwrap();
      toast.success('WhatsApp Gateway settings saved successfully!');
    } catch (err) {
      toast.error(err?.message || 'Failed to save WhatsApp settings');
    }
  };

  const handleSendTest = async (e) => {
    e.preventDefault();
    if (!testRecipient.trim()) {
      toast.error('Please enter a recipient phone number (e.g. +919876543210)');
      return;
    }

    const tid = toast.loading('Sending test WhatsApp message...');
    try {
      const res = await sendTestMessage({ recipient: testRecipient, message: testMessage }).unwrap();
      toast.dismiss(tid);
      toast.success(res?.message || `Test WhatsApp message sent to ${testRecipient}`);
    } catch (err) {
      toast.dismiss(tid);
      toast.error(err?.message || 'Failed to send test message');
    }
  };

  if (loading && !config) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <FleetIcons.Spinner className="w-6 h-6 animate-spin text-emerald-600" />
          <span>Loading WhatsApp Gateway configuration...</span>
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
          { label: 'WhatsApp Business Gateway' },
        ]}
      />

      {/* Header & Sub-Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-1 flex items-center gap-2">
            <span>💬 WhatsApp Notification Gateway</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
              Meta & Twilio
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Configure WhatsApp Business API credentials, sender channels, SMS fallback, and test live dispatches.
          </p>
        </div>

        {/* Top Gateway Sub-Links Nav */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800/80 p-1.5 rounded-xl text-xs font-bold overflow-x-auto no-scrollbar">
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
          <Link to="/superadmin/settings/notifications/whatsapp" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm whitespace-nowrap flex-shrink-0">
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
        {/* Main Gateway Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 sm:p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100">
                    API Provider & Account Setup
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                    Select your WhatsApp service provider and configure API credentials.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Enable Channel</span>
                  <ToggleSwitch
                    id="whatsapp_enabled"
                    label="Enable WhatsApp"
                    checked={formData.enabled}
                    onChange={(val) => setFormData({ ...formData, enabled: val })}
                  />
                </div>
              </div>

              {/* Provider Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  WhatsApp Service Provider
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, provider: 'twilio' })}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      formData.provider === 'twilio'
                        ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30'
                        : 'border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">Twilio WhatsApp API</span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                      Uses Twilio Programmable Messaging & WhatsApp sandbox/approved sender.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, provider: 'meta' })}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      formData.provider === 'meta'
                        ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30'
                        : 'border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">Meta Cloud API (Official)</span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                      Direct connection with Meta WhatsApp Business Account (WABA).
                    </span>
                  </button>
                </div>
              </div>

              {/* Sender Phone Number */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  WhatsApp Sender Number
                </label>
                <input
                  type="text"
                  value={formData.whatsapp_from_number}
                  onChange={(e) => setFormData({ ...formData, whatsapp_from_number: e.target.value })}
                  placeholder="e.g. whatsapp:+14155238886 or +919876543210"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-mono font-medium text-slate-900 dark:text-zinc-100"
                />
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Format for Twilio: <code>whatsapp:+[CountryCode][Number]</code>. For Meta: <code>+[CountryCode][Number]</code>.
                </p>
              </div>

              {/* Meta specific fields */}
              {formData.provider === 'meta' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      WhatsApp Business Account ID (WABA)
                    </label>
                    <input
                      type="text"
                      value={formData.whatsapp_business_id}
                      onChange={(e) => setFormData({ ...formData, whatsapp_business_id: e.target.value })}
                      placeholder="e.g. 102938475610293"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-mono font-medium text-slate-900 dark:text-zinc-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Phone Number ID
                    </label>
                    <input
                      type="text"
                      value={formData.whatsapp_phone_number_id}
                      onChange={(e) => setFormData({ ...formData, whatsapp_phone_number_id: e.target.value })}
                      placeholder="e.g. 109283746501928"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-mono font-medium text-slate-900 dark:text-zinc-100"
                    />
                  </div>
                </div>
              )}

              {/* API Token & Secret */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    API Auth Token / Permanent Token
                  </label>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={formData.whatsapp_api_token}
                    onChange={(e) => setFormData({ ...formData, whatsapp_api_token: e.target.value })}
                    placeholder={config?.whatsapp_api_token ? '••••••••••••••••' : 'Enter API token'}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-mono font-medium text-slate-900 dark:text-zinc-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Webhook Verification Secret
                  </label>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={formData.whatsapp_webhook_secret}
                    onChange={(e) => setFormData({ ...formData, whatsapp_webhook_secret: e.target.value })}
                    placeholder={config?.whatsapp_webhook_secret ? '••••••••••••••••' : 'Enter webhook secret'}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-mono font-medium text-slate-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* Toggles: SMS Fallback & Critical Only */}
              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">SMS Fallback</span>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">If WhatsApp fails, dispatch via SMS</p>
                  </div>
                  <ToggleSwitch
                    id="whatsapp_fallback_sms"
                    label="SMS Fallback"
                    checked={formData.whatsapp_fallback_sms}
                    onChange={(val) => setFormData({ ...formData, whatsapp_fallback_sms: val })}
                  />
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">Critical Alerts Only</span>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">Restrict to SOS & high-priority triggers</p>
                  </div>
                  <ToggleSwitch
                    id="critical_only"
                    label="Critical Alerts Only"
                    checked={formData.critical_only}
                    onChange={(val) => setFormData({ ...formData, critical_only: val })}
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {saving ? <FleetIcons.Spinner className="w-4 h-4 animate-spin" /> : '💾 Save WhatsApp Settings'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Sidebar: Test Dispatcher & Gateway Status */}
        <div className="space-y-6">
          {/* Live Test Sender Widget */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <span>📲 Test WhatsApp Dispatch</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Send an immediate test alert to verify gateway delivery.
              </p>
            </div>

            <form onSubmit={handleSendTest} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Recipient Mobile Number
                </label>
                <input
                  type="text"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  placeholder="+919876543210"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-mono font-medium text-slate-900 dark:text-zinc-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Test Message Body
                </label>
                <textarea
                  rows={3}
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-medium text-slate-900 dark:text-zinc-100 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={testing}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 min-h-[38px]"
              >
                {testing ? <FleetIcons.Spinner className="w-4 h-4 animate-spin" /> : '🚀 Send Test Message'}
              </button>
            </form>
          </div>

          {/* Quick Info & Guidelines */}
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/70 dark:border-emerald-900/40 p-5 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <span>💡 WhatsApp Dispatch Rules</span>
            </h4>
            <ul className="text-xs text-emerald-900 dark:text-emerald-200/80 space-y-2 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span>•</span>
                <span><strong>Emergency SOS alerts</strong> bypass Quiet Hours (DND) and dispatch with highest priority.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span>•</span>
                <span><strong>Transactional alerts</strong> (passwords, invoices, approvals) use pre-approved Meta HSM templates.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span>•</span>
                <span><strong>SMS Fallback</strong> automatically triggers if a recipient's phone has no active WhatsApp account.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperWhatsappSettingsPage;
