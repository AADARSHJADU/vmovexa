import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons.jsx';
import { Breadcrumb } from '../../components/ui/Breadcrumb.jsx';
import apiClient from '../../api/client.js';

const ToggleSwitch = ({ checked, onChange, disabled = false, id, label }) => (
  <button
    id={id}
    type="button"
    role="switch"
    aria-label={label}
    aria-checked={checked}
    disabled={disabled}
    onClick={() => !disabled && onChange(!checked)}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${
      checked ? 'bg-purple-600' : 'bg-slate-300 dark:bg-zinc-700'
    } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

export const SuperSmsSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testRecipient, setTestRecipient] = useState('8827079303');
  const [testMessage, setTestMessage] = useState(
    'Hello from VMOVEXA! This is a test SMS confirming your Twilio gateway configuration.'
  );
  const [testResult, setTestResult] = useState(null);

  const [smsForm, setSmsForm] = useState({
    twilio_account_sid: '',
    twilio_auth_token: '',
    twilio_from_number: '+15739834630',
    sender_id: 'VMVEXA',
    dlt_entity_id: '1101552340000021',
    critical_only: false,
    whatsapp_fallback: true,
  });

  useEffect(() => {
    apiClient.get('/notifications/sms')
      .then((res) => {
        const d = res.data?.data || res.data;
        if (d) {
          setSmsForm({
            twilio_account_sid: d.twilio_account_sid || '',
            twilio_auth_token: '',
            twilio_from_number: d.twilio_from_number || '+15739834630',
            sender_id: d.sender_id || 'VMVEXA',
            dlt_entity_id: d.dlt_entity_id || '1101552340000021',
            critical_only: d.critical_only ?? false,
            whatsapp_fallback: d.whatsapp_fallback ?? true,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put('/notifications/sms', smsForm);
      toast.success('Twilio & SMS Gateway settings saved successfully!');
      setSmsForm((prev) => ({ ...prev, twilio_auth_token: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save SMS settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async (e) => {
    e?.preventDefault();
    if (!testRecipient) {
      toast.error('Please enter a recipient mobile number (e.g. 8827079303)');
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await apiClient.post('/notifications/test-sms', {
        recipient: testRecipient,
        message: testMessage,
      });
      const d = res.data?.data || res.data;
      setTestResult(d);
      toast.success(`Test SMS dispatched to ${d.to || testRecipient}!`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to dispatch test SMS');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <FleetIcons.Spinner className="w-6 h-6 animate-spin text-purple-600" />
          <span>Loading Twilio & SMS gateway config...</span>
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
          { label: 'SMS & Twilio Gateway' },
        ]}
      />

      {/* Header & Sub-Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-1">
            SMS & Twilio Gateway Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Manage Twilio API credentials, virtual sender number, Indian Telecom DLT headers, and real-time SMS testing.
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
          <Link to="/superadmin/settings/notifications/sms" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-sm whitespace-nowrap flex-shrink-0">
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

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Configuration Forms (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Twilio Credentials Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <span>Twilio API Credentials</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                    Account SID and secret Auth Token for SMS & WhatsApp dispatch.
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold">
                  Twilio Cloud Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Twilio Account SID</label>
                  <input
                    type="text"
                    required
                    value={smsForm.twilio_account_sid}
                    onChange={(e) => setSmsForm({ ...smsForm, twilio_account_sid: e.target.value })}
                    placeholder="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-mono font-bold text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Twilio Auth Token</label>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={smsForm.twilio_auth_token}
                    onChange={(e) => setSmsForm({ ...smsForm, twilio_auth_token: e.target.value })}
                    placeholder="••••••••••••••••"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-mono font-bold text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Twilio Sender Number</label>
                  <input
                    type="text"
                    value={smsForm.twilio_from_number}
                    onChange={(e) => setSmsForm({ ...smsForm, twilio_from_number: e.target.value })}
                    placeholder="+15739834630"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-mono font-bold text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5">
                    Assigned: +1 (573) 983-4630
                  </p>
                </div>
              </div>
            </div>

            {/* DLT Operator Compliance Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100">
                  Indian Telecom DLT Compliance & Options
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  Specify registered DLT Sender ID headers and emergency dispatch rules.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 space-y-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">DLT Sender Header</span>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">6-character header</p>
                  <input
                    type="text"
                    maxLength={6}
                    value={smsForm.sender_id}
                    onChange={(e) => setSmsForm({ ...smsForm, sender_id: e.target.value.toUpperCase() })}
                    placeholder="VMVEXA"
                    className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono font-bold text-slate-900 dark:text-zinc-100"
                  />
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 space-y-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">DLT Entity ID</span>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">TRAI operator ID</p>
                  <input
                    type="text"
                    value={smsForm.dlt_entity_id}
                    onChange={(e) => setSmsForm({ ...smsForm, dlt_entity_id: e.target.value })}
                    placeholder="1101552340000021"
                    className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono font-bold text-slate-900 dark:text-zinc-100"
                  />
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">Critical / SOS Only</span>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">Save costs on routine alerts</p>
                  </div>
                  <ToggleSwitch
                    id="sms_critical"
                    label="Critical Only"
                    checked={smsForm.critical_only}
                    onChange={(val) => setSmsForm({ ...smsForm, critical_only: val })}
                  />
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">WhatsApp Fallback</span>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">Fallback if SMS delivery fails</p>
                  </div>
                  <ToggleSwitch
                    id="sms_wa_fallback"
                    label="WhatsApp Fallback"
                    checked={smsForm.whatsapp_fallback}
                    onChange={(val) => setSmsForm({ ...smsForm, whatsapp_fallback: val })}
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {saving && <FleetIcons.Spinner className="w-4 h-4 animate-spin text-white" />}
                <span>{saving ? 'Saving Credentials...' : 'Save Twilio & SMS Gateway Settings'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Interactive SMS Dispatcher & Account Overview */}
        <div className="space-y-6">
          {/* Live Test SMS Dispatcher */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <FleetIcons.Phone className="w-4 h-4 text-purple-600" />
                <span>Test SMS Dispatch</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Send an immediate test SMS to verify live Twilio delivery.
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
                  placeholder="8827079303 or +918827079303"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-mono font-medium text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                  Indian 10-digit numbers automatically formatted as +91.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Test SMS Body
                </label>
                <textarea
                  rows={3}
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-medium text-slate-900 dark:text-zinc-100 resize-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={testing}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {testing ? (
                  <FleetIcons.Spinner className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <FleetIcons.Rocket className="w-3.5 h-3.5 mr-1" />
                    <span>Send Test SMS</span>
                  </>
                )}
              </button>
            </form>

            {/* Test Result Display */}
            {testResult && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <FleetIcons.CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Message Dispatched</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-[10px] font-mono font-bold uppercase">
                    {testResult.status || 'Delivered'}
                  </span>
                </div>
                <div className="text-emerald-700 dark:text-emerald-300/90 text-[11px] font-mono space-y-0.5">
                  <p>To: <strong>{testResult.to}</strong></p>
                  <p>SID: <code className="bg-white/60 dark:bg-black/30 px-1 py-0.5 rounded">{testResult.sid}</code></p>
                </div>
              </div>
            )}
          </div>

          {/* Twilio Active Number Overview Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <FleetIcons.Smartphone className="w-3.5 h-3.5 text-purple-600" />
                <span>Active Twilio Number</span>
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                Active
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-zinc-400">Phone Number:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-zinc-100">+1 (573) 983-4630</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-zinc-400">Location:</span>
                <span className="text-slate-700 dark:text-zinc-300 font-medium">MO, United States (US1)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-zinc-400">Phone SID:</span>
                <span className="font-mono text-[10px] text-slate-600 dark:text-zinc-400">PN9725c7...0729</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-zinc-700">
                <span className="text-slate-500 dark:text-zinc-400">Capabilities:</span>
                <div className="flex items-center gap-1">
                  <span className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold">SMS</span>
                  <span className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold">MMS</span>
                  <span className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold">Voice</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperSmsSettingsPage;
