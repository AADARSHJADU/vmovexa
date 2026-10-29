import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons.jsx';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useNotifications } from '../../hooks/shared/useNotifications.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useTranslation } from '../../hooks/useTranslation.js';

/**
 * Modern iOS / Tailwind Toggle Switch
 */
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

// Predefined catalog of all platform notification rules with channel defaults
const PLATFORM_TRIGGERS_CATALOG = [
  // 1. Tenant & Fleet Onboarding
  {
    key: 'tenant_registration_superadmin',
    category: 'onboarding',
    categoryLabel: 'Tenant & Fleet Onboarding',
    title: 'New Tenant Self-Registration Applied',
    desc: 'Triggers when a fleet operator applies via the signup portal. Notifies Super Admin for review.',
    defaultChannels: { web: true, push: false, email: true, sms: false },
    badge: 'High Priority',
  },
  {
    key: 'tenant_registration_welcome',
    category: 'onboarding',
    categoryLabel: 'Tenant & Fleet Onboarding',
    title: 'Applicant Welcome & Receipt',
    desc: 'Dispatches an automated confirmation email with enrollment ID upon form submission.',
    defaultChannels: { web: false, push: false, email: true, sms: false },
    badge: 'Transactional',
  },
  {
    key: 'tenant_onboarding_approved',
    category: 'onboarding',
    categoryLabel: 'Tenant & Fleet Onboarding',
    title: 'Tenant Application Approved & Activated',
    desc: 'Sends credentials and account activation instructions upon Super Admin approval.',
    defaultChannels: { web: true, push: false, email: true, sms: false },
    badge: 'Important',
  },
  {
    key: 'tenant_registration_rejected',
    category: 'onboarding',
    categoryLabel: 'Tenant & Fleet Onboarding',
    title: 'Tenant Registration Rejected',
    desc: 'Notifies applicant of rejection status and re-submission guidelines.',
    defaultChannels: { web: false, push: false, email: true, sms: false },
    badge: 'Notice',
  },
  {
    key: 'online_onboarding_payment_required',
    category: 'onboarding',
    categoryLabel: 'Tenant & Fleet Onboarding',
    title: 'Online Onboarding Plan Checkout Notice',
    desc: 'Dispatches payment checkout link when online billing mode is provisioned.',
    defaultChannels: { web: false, push: false, email: true, sms: false },
    badge: 'Billing Action',
  },

  // 2. User Credentials & Provisioning
  {
    key: 'user_welcome_credentials',
    category: 'users',
    categoryLabel: 'User Provisioning & Credentials',
    title: 'New User Created & Temporary Password Sent',
    desc: 'Sends temporary password and login instructions when a new user account is created.',
    defaultChannels: { web: false, push: false, email: true, sms: true },
    badge: 'Security / Login',
  },
  {
    key: 'user_provisioned_superadmin',
    category: 'users',
    categoryLabel: 'User Provisioning & Credentials',
    title: 'Platform User Provisioning Audit Alert',
    desc: 'Logs security audit notification for Super Admin whenever a user is provisioned.',
    defaultChannels: { web: true, push: false, email: true, sms: false },
    badge: 'Audit Trail',
  },
  {
    key: 'password_reset_requested',
    category: 'users',
    categoryLabel: 'User Provisioning & Credentials',
    title: 'Password Reset & OTP Token',
    desc: 'Sends time-sensitive password reset token or OTP upon user request.',
    defaultChannels: { web: false, push: false, email: true, sms: true },
    badge: 'Urgent / Auth',
  },

  // 3. Billing, Subscriptions & Invoices
  {
    key: 'invoice_generated_tenant',
    category: 'billing',
    categoryLabel: 'Billing, Invoices & Subscriptions',
    title: 'Monthly Subscription Invoice Generated',
    desc: 'Sends automated GST breakdown and invoice PDF upon billing cycle renewal.',
    defaultChannels: { web: true, push: false, email: true, sms: false },
    badge: 'Financial',
  },
  {
    key: 'payment_success_tenant',
    category: 'billing',
    categoryLabel: 'Billing, Invoices & Subscriptions',
    title: 'Razorpay / Stripe Payment Confirmation Receipt',
    desc: 'Sends instant transaction receipt confirmation upon successful online payment.',
    defaultChannels: { web: true, push: true, email: true, sms: true },
    badge: 'Transactional',
  },
  {
    key: 'subscription_expiry_warning',
    category: 'billing',
    categoryLabel: 'Billing, Invoices & Subscriptions',
    title: 'Subscription Expiring Warning (7-day / 3-day)',
    desc: 'Sends renewal reminders 7 days and 3 days prior to subscription expiration.',
    defaultChannels: { web: true, push: true, email: true, sms: true },
    badge: 'Action Required',
  },

  // 4. Advertising Campaigns & Proof-of-Play
  {
    key: 'campaign_submitted_superadmin',
    category: 'campaigns',
    categoryLabel: 'Ad Campaigns & Approvals',
    title: 'New DOOH Ad Campaign Submitted for Review',
    desc: 'Alerts Super Admin when a new DOOH video campaign is submitted for review.',
    defaultChannels: { web: true, push: false, email: true, sms: false },
    badge: 'Approval Needed',
  },
  {
    key: 'campaign_approved_advertiser',
    category: 'campaigns',
    categoryLabel: 'Ad Campaigns & Approvals',
    title: 'Ad Campaign Approved & Slot Scheduled',
    desc: 'Notifies advertiser when campaign creative is approved and scheduled on bus displays.',
    defaultChannels: { web: true, push: false, email: true, sms: false },
    badge: 'Status Update',
  },

  // 5. Emergency, Safety & Edge Hardware
  {
    key: 'sos_panic_driver',
    category: 'safety',
    categoryLabel: 'Emergency & Safety Alerts',
    title: 'Driver Cabin SOS Panic Button Activated',
    desc: 'Triggers real-time emergency alert to Central Command when driver panic switch is activated.',
    defaultChannels: { web: true, push: true, email: true, sms: true },
    badge: 'CRITICAL / SOS',
  },
  {
    key: 'vehicle_collision_detected',
    category: 'safety',
    categoryLabel: 'Emergency & Safety Alerts',
    title: 'Heavy Impact / Collision Telemetry Detected',
    desc: 'Dispatches urgent broadcast when vehicle telemetry detects excessive G-force impact.',
    defaultChannels: { web: true, push: true, email: true, sms: true },
    badge: 'CRITICAL / Safety',
  },
  {
    key: 'edge_device_offline',
    category: 'hardware',
    categoryLabel: 'Edge Hardware & Telematics',
    title: 'Bus Smart Box / GPS Offline Alert',
    desc: 'Notifies technical team when telemetry heartbeat is missing for over 10 minutes.',
    defaultChannels: { web: true, push: true, email: false, sms: false },
    badge: 'Hardware Health',
  },
];

export const SuperNotificationSettingsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    loadSettings,
    updateSettings,
    togglePreference,
    loadSmtpConfig,
    saveSmtpConfig,
    sendTestEmail,
    sendTestPush,
  } = useNotifications();

  // Active Main Tab: 'smtp' | 'push' | 'rules'
  const [activeMainTab, setActiveMainTab] = useState('rules');

  // Active Channel Sub-Tab in Rules: 'web' | 'push' | 'email' | 'sms' | 'matrix'
  const [activeChannelTab, setActiveChannelTab] = useState('web');

  // Loading states
  const [loading, setLoading] = useState(true);
  const [savingRules, setSavingRules] = useState(false);
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingPush, setTestingPush] = useState(false);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Channel Master & Quiet Hours state (saved to backend UserNotificationSetting)
  const [channels, setChannels] = useState({
    master_push: true,
    channel_in_app: true,
    channel_email: true,
    channel_push: true,
    channel_sms: false,
    channel_whatsapp: false,
    quiet_hours_start: '',
    quiet_hours_end: '',
  });

  // 2. Channel-Specific Detailed Settings
  // Web Settings
  const [webSettings, setWebSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('vmovexa_web_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      sound_alert: true,
      toast_popup: true,
      toast_duration: 5,
      badge_count: true,
      auto_mark_read: false,
    };
  });

  // Push Settings
  const [pushSettings, setPushSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('vmovexa_push_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      high_priority: true,
      vibrate: true,
      sound: 'default',
      collapse_key: true,
      ttl_hours: 24,
    };
  });

  // Email Settings
  const [emailSettings, setEmailSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('vmovexa_email_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      dispatch_mode: 'instant',
      include_gst: true,
      bcc_admin: 'audit@vmovexa.com',
      attach_pdf: true,
      footer_branding: true,
    };
  });

  // SMS & Twilio Gateway Settings
  const [smsSettings, setSmsSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('vmovexa_sms_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      twilio_account_sid: 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      twilio_auth_token: '',
      twilio_from_number: '+18005550199',
      sender_id: 'VMVEXA',
      dlt_entity_id: '1101552340000021',
      critical_only: true,
      whatsapp_fallback: false,
      gateway_provider: 'twilio',
    };
  });

  // 3. Rule Channel-wise Toggles: { [ruleKey]: { web: bool, push: bool, email: bool, sms: bool } }
  const [ruleChannelToggles, setRuleChannelToggles] = useState(() => {
    const init = {};
    PLATFORM_TRIGGERS_CATALOG.forEach((item) => {
      init[item.key] = { ...item.defaultChannels };
    });
    try {
      const saved = localStorage.getItem('vmovexa_channel_event_rules');
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.keys(parsed).forEach((k) => {
          if (init[k]) init[k] = { ...init[k], ...parsed[k] };
        });
      }
    } catch {}
    return init;
  });

  // SMTP form state
  const [smtpForm, setSmtpForm] = useState({
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_pass: '',
    smtp_from: '',
    smtp_secure: false,
    is_custom: false,
    has_pass: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [testEmailTo, setTestEmailTo] = useState('');

  // Event type ID mapping from backend for sync
  const [eventTypeIdMap, setEventTypeIdMap] = useState({});

  // Browser push notification permission state
  const [browserPermission, setBrowserPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  // Bootstrap data on mount
  useEffect(() => {
    if (user?.email) {
      setTestEmailTo(user.email);
    }

    Promise.allSettled([loadSettings(), loadSmtpConfig()])
      .then(([settingsRes, smtpRes]) => {
        if (settingsRes.status === 'fulfilled' && settingsRes.value) {
          const res = settingsRes.value;
          if (res?.settings) {
            setChannels((prev) => ({
              ...prev,
              master_push: res.settings.master_push ?? true,
              channel_in_app: res.settings.channel_in_app ?? true,
              channel_email: res.settings.channel_email ?? true,
              channel_push: res.settings.channel_push ?? true,
              channel_sms: res.settings.channel_sms ?? false,
              channel_whatsapp: res.settings.channel_whatsapp ?? false,
              quiet_hours_start: res.settings.quiet_hours_start ? String(res.settings.quiet_hours_start).slice(0, 5) : '',
              quiet_hours_end: res.settings.quiet_hours_end ? String(res.settings.quiet_hours_end).slice(0, 5) : '',
            }));
          }
          if (Array.isArray(res?.events)) {
            const idMap = {};
            res.events.forEach((ev) => {
              idMap[ev.key] = ev.id;
            });
            setEventTypeIdMap(idMap);
          }
        }

        if (smtpRes.status === 'fulfilled' && smtpRes.value) {
          const s = smtpRes.value;
          setSmtpForm({
            smtp_host: s.smtp_host || '',
            smtp_port: s.smtp_port ? Number(s.smtp_port) : 587,
            smtp_user: s.smtp_user || '',
            smtp_pass: '',
            smtp_from: s.smtp_from || '',
            smtp_secure: Boolean(s.smtp_secure),
            is_custom: Boolean(s.is_custom),
            has_pass: Boolean(s.has_pass),
          });
        }
      })
      .finally(() => setLoading(false));
  }, [loadSettings, loadSmtpConfig, user]);

  // Request browser notification permission
  const handleRequestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setBrowserPermission(perm);
      if (perm === 'granted') {
        toast.success('Browser notification permission granted!');
      } else {
        toast.error('Permission denied. Please enable in your browser settings.');
      }
    } else {
      toast.error('Browser notifications are not supported on this device.');
    }
  };

  // Quick SMTP presets
  const applySmtpPreset = (preset) => {
    if (preset === 'gmail') {
      setSmtpForm((prev) => ({
        ...prev,
        smtp_host: 'smtp.gmail.com',
        smtp_port: 587,
        smtp_secure: false,
        smtp_from: prev.smtp_from || '"VMOVEXA Platform" <alerts@gmail.com>',
      }));
      toast.success('Applied Gmail SMTP preset (Use Google App Password)');
    } else if (preset === 'brevo') {
      setSmtpForm((prev) => ({
        ...prev,
        smtp_host: 'smtp-relay.brevo.com',
        smtp_port: 587,
        smtp_secure: false,
        smtp_from: prev.smtp_from || '"VMOVEXA Platform" <alerts@vmovexa.com>',
      }));
      toast.success('Applied Brevo / Sendinblue SMTP preset');
    } else if (preset === 'aws') {
      setSmtpForm((prev) => ({
        ...prev,
        smtp_host: 'email-smtp.us-east-1.amazonaws.com',
        smtp_port: 587,
        smtp_secure: false,
      }));
      toast.success('Applied AWS SES SMTP preset');
    }
  };

  // Save SMTP Settings
  const handleSaveSmtp = async (e) => {
    if (e) e.preventDefault();
    if (!smtpForm.smtp_host || !smtpForm.smtp_user) {
      toast.error('Please provide at least SMTP Host and Username/Email.');
      return;
    }
    setSavingSmtp(true);
    try {
      const payload = {
        smtp_host: smtpForm.smtp_host,
        smtp_port: Number(smtpForm.smtp_port) || 587,
        smtp_user: smtpForm.smtp_user,
        smtp_from: smtpForm.smtp_from,
        smtp_secure: Boolean(smtpForm.smtp_secure),
      };
      if (smtpForm.smtp_pass) {
        payload.smtp_pass = smtpForm.smtp_pass;
      }
      await saveSmtpConfig(payload);
      setSmtpForm((prev) => ({
        ...prev,
        is_custom: true,
        has_pass: prev.has_pass || Boolean(smtpForm.smtp_pass),
        smtp_pass: '',
      }));
      toast.success(t('superadmin.notifications.toast_smtp_saved', 'SMTP Configuration saved and transporter reloaded!'));
    } catch (err) {
      toast.error(err?.message || t('superadmin.notifications.toast_smtp_save_err', 'Failed to save SMTP settings'));
    } finally {
      setSavingSmtp(false);
    }
  };

  // Test Email
  const handleTestEmail = async (e) => {
    if (e) e.preventDefault();
    if (!testEmailTo) {
      toast.error(t('superadmin.notifications.toast_enter_email', 'Please enter a recipient email for testing.'));
      return;
    }
    setTestingEmail(true);
    const tid = toast.loading(t('superadmin.notifications.toast_sending_test_email', 'Connecting to SMTP server & sending test email...'));
    try {
      const res = await sendTestEmail({ to: testEmailTo });
      toast.dismiss(tid);
      toast.success(t('superadmin.notifications.toast_test_email_sent', 'Test email sent successfully! Message ID: {id}', { id: res?.messageId || 'Sent' }));
    } catch (err) {
      toast.dismiss(tid);
      toast.error(err?.message || t('superadmin.notifications.toast_test_email_err', 'Failed to send test email. Check SMTP credentials.'));
    } finally {
      setTestingEmail(false);
    }
  };

  // Test Push
  const handleTestPush = async () => {
    setTestingPush(true);
    const tid = toast.loading(t('superadmin.notifications.toast_dispatching_push', 'Dispatching Firebase Push notification...'));
    try {
      const res = await sendTestPush();
      toast.dismiss(tid);
      toast.success(res?.message || t('superadmin.notifications.toast_push_dispatched', 'Test push notification dispatched!'));
    } catch (err) {
      toast.dismiss(tid);
      toast.error(err?.message || t('superadmin.notifications.toast_push_err', 'Failed to dispatch test push'));
    } finally {
      setTestingPush(false);
    }
  };

  // Individual toggle for a rule on a specific channel: 'web' | 'push' | 'email' | 'sms'
  const handleToggleRuleChannel = (ruleKey, channel, nextVal) => {
    setRuleChannelToggles((prev) => {
      const currentRule = prev[ruleKey] || { web: false, push: false, email: false, sms: false };
      const updatedRule = { ...currentRule, [channel]: nextVal };
      const updatedAll = { ...prev, [ruleKey]: updatedRule };
      try {
        localStorage.setItem('vmovexa_channel_event_rules', JSON.stringify(updatedAll));
      } catch {}
      return updatedAll;
    });

    // If at least one channel is active, event is enabled in backend preference
    const currentRule = ruleChannelToggles[ruleKey] || {};
    const willHaveActiveChannel = channel === 'web' ? nextVal : currentRule.web
      || channel === 'push' ? nextVal : currentRule.push
      || channel === 'email' ? nextVal : currentRule.email
      || channel === 'sms' ? nextVal : currentRule.sms;

    const eventTypeId = eventTypeIdMap[ruleKey];
    if (eventTypeId) {
      togglePreference(eventTypeId, Boolean(willHaveActiveChannel)).catch(() => {});
    }
  };

  // Bulk enable / disable all rules for a specific channel
  const handleBulkToggleChannel = (channel, targetState) => {
    setRuleChannelToggles((prev) => {
      const updated = { ...prev };
      PLATFORM_TRIGGERS_CATALOG.forEach((item) => {
        const currentRule = updated[item.key] || { ...item.defaultChannels };
        updated[item.key] = { ...currentRule, [channel]: targetState };
      });
      try {
        localStorage.setItem('vmovexa_channel_event_rules', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    toast.success(`${targetState ? 'Enabled' : 'Disabled'} all ${channel.toUpperCase()} alerts`);
  };

  // Save all channel settings and rules
  const handleSaveAllPreferences = async () => {
    setSavingRules(true);
    try {
      await updateSettings({
        master_push: channels.master_push,
        channel_in_app: channels.channel_in_app,
        channel_email: channels.channel_email,
        channel_push: channels.channel_push,
        channel_sms: channels.channel_sms,
        channel_whatsapp: channels.channel_whatsapp,
        quiet_hours_start: channels.quiet_hours_start || null,
        quiet_hours_end: channels.quiet_hours_end || null,
      });

      // Save channel-specific detailed configs
      localStorage.setItem('vmovexa_web_settings', JSON.stringify(webSettings));
      localStorage.setItem('vmovexa_push_settings', JSON.stringify(pushSettings));
      localStorage.setItem('vmovexa_email_settings', JSON.stringify(emailSettings));
      localStorage.setItem('vmovexa_sms_settings', JSON.stringify(smsSettings));
      localStorage.setItem('vmovexa_channel_event_rules', JSON.stringify(ruleChannelToggles));

      toast.success(t('superadmin.notifications.toast_all_saved', 'All notification rules and channel settings saved successfully!'));
    } catch (err) {
      toast.error(err?.message || t('superadmin.notifications.toast_save_err', 'Failed to save settings'));
    } finally {
      setSavingRules(false);
    }
  };

  // Filtered triggers based on search
  const filteredTriggers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return PLATFORM_TRIGGERS_CATALOG;
    return PLATFORM_TRIGGERS_CATALOG.filter(
      (it) =>
        it.title.toLowerCase().includes(q) ||
        it.desc.toLowerCase().includes(q) ||
        it.categoryLabel.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Channel-specific active rule counts
  const webActiveCount = PLATFORM_TRIGGERS_CATALOG.filter((it) => ruleChannelToggles[it.key]?.web).length;
  const pushActiveCount = PLATFORM_TRIGGERS_CATALOG.filter((it) => ruleChannelToggles[it.key]?.push).length;
  const emailActiveCount = PLATFORM_TRIGGERS_CATALOG.filter((it) => ruleChannelToggles[it.key]?.email).length;
  const smsActiveCount = PLATFORM_TRIGGERS_CATALOG.filter((it) => ruleChannelToggles[it.key]?.sms).length;

  return (
    <div className="w-full space-y-6 pb-20 animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <Breadcrumb
            items={[
              { label: t('nav.superadmin_dashboard', 'Super Admin'), path: '/superadmin/dashboard', icon: FleetIcons.Dashboard },
              { label: t('nav.settings', 'Settings') },
              { label: t('superadmin.notifications.title', 'Notifications & Channels') },
            ]}
            className="mb-1"
          />

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
              {t('superadmin.notifications.header_title', 'Notification & Dispatch Center')}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {t('superadmin.notifications.ws_active_badge', 'Real-Time WebSockets Active')}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 text-xs font-bold">
                {t('superadmin.notifications.rules_ready_badge', '16 Platform Rules Ready')}
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            {t('superadmin.notifications.header_subtitle', 'Separately manage Web, Push, Email, and SMS notification settings and individual alert rules.')}
          </p>
        </div>

        {/* Header Quick Action */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/60">
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">All Notifications</span>
            <ToggleSwitch
              id="master_notifications_switch"
              label="All Notifications"
              checked={channels.master_push}
              onChange={(val) => setChannels({ ...channels, master_push: val })}
            />
          </div>
          <Link
            to="/superadmin/notifications"
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <FleetIcons.Bell className="w-3.5 h-3.5 text-blue-500" />
            <span>{t('superadmin.notifications.view_live_alerts_btn', 'View Live Alerts')}</span>
          </Link>
        </div>
      </div>

      {/* 2. Primary Navigation Tabs: Rules | SMTP Server | Firebase FCM */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-zinc-800/80 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60">
        <button
          type="button"
          onClick={() => setActiveMainTab('rules')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            activeMainTab === 'rules'
              ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/60 dark:border-zinc-800'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
          }`}
        >
          <FleetIcons.Bell className="w-4 h-4 text-blue-500" />
          <span>{t('superadmin.notifications.tab_channel_rules', 'Channel Rules & Settings')}</span>
          <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400">
            {t('superadmin.notifications.tab_divided_channel', 'Divided by Channel')}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('smtp')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            activeMainTab === 'smtp'
              ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/60 dark:border-zinc-800'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
          }`}
        >
          <FleetIcons.Mail className="w-4 h-4 text-indigo-500" />
          <span>{t('superadmin.notifications.tab_smtp_server', 'SMTP Email Server & Test')}</span>
          {smtpForm.is_custom && (
            <span className="w-2 h-2 rounded-full bg-emerald-500" title={t('superadmin.notifications.custom_smtp_configured', 'Custom SMTP Configured')} />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('push')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            activeMainTab === 'push'
              ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/60 dark:border-zinc-800'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
          }`}
        >
          <FleetIcons.Phone className="w-4 h-4 text-amber-500" />
          <span>{t('superadmin.notifications.tab_firebase_fcm', 'Firebase Push (FCM) & Device Test')}</span>
          <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
            FCM v1
          </span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB: CHANNEL RULES & CUSTOM SETTINGS (DIVIDED UI)         */}
      {/* ========================================================= */}
      {activeMainTab === 'rules' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Channel Selector Pills (Web, Push, Email, SMS, All Matrix) */}
          <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {/* 1. Web Notification Channel */}
              <button
                type="button"
                onClick={() => setActiveChannelTab('web')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeChannelTab === 'web'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                }`}
              >
                <span className="flex items-center gap-1.5"><FleetIcons.Globe className="w-3.5 h-3.5" /> {t('superadmin.notifications.channel_web', 'Web (In-App)')}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeChannelTab === 'web' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-zinc-700 text-slate-800 dark:text-zinc-200'
                }`}>
                  {webActiveCount} Active
                </span>
              </button>

              {/* 2. Mobile Push Notification Channel */}
              <button
                type="button"
                onClick={() => setActiveChannelTab('push')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeChannelTab === 'push'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                }`}
              >
                <span className="flex items-center gap-1.5"><FleetIcons.Phone className="w-3.5 h-3.5" /> {t('superadmin.notifications.channel_push', 'Push (Mobile)')}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeChannelTab === 'push' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-zinc-700 text-slate-800 dark:text-zinc-200'
                }`}>
                  {pushActiveCount} Active
                </span>
              </button>

              {/* 3. Mail Notification Channel */}
              <button
                type="button"
                onClick={() => setActiveChannelTab('email')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeChannelTab === 'email'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                }`}
              >
                <span className="flex items-center gap-1.5"><FleetIcons.Mail className="w-3.5 h-3.5" /> {t('superadmin.notifications.channel_mail', 'Mail (Email)')}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeChannelTab === 'email' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-zinc-700 text-slate-800 dark:text-zinc-200'
                }`}>
                  {emailActiveCount} Active
                </span>
              </button>

              {/* 4. SMS Notification Channel */}
              <button
                type="button"
                onClick={() => setActiveChannelTab('sms')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeChannelTab === 'sms'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                }`}
              >
                <span className="flex items-center gap-1.5"><FleetIcons.Chat className="w-3.5 h-3.5" /> {t('superadmin.notifications.channel_sms', 'SMS / WhatsApp')}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeChannelTab === 'sms' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-zinc-700 text-slate-800 dark:text-zinc-200'
                }`}>
                  {smsActiveCount} Active
                </span>
              </button>

              {/* 5. All Channels Matrix View */}
              <button
                type="button"
                onClick={() => setActiveChannelTab('matrix')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap border ${
                  activeChannelTab === 'matrix'
                    ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-slate-900 border-slate-900 dark:border-zinc-100 shadow-md'
                    : 'border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span className="flex items-center gap-1.5"><FleetIcons.Activity className="w-3.5 h-3.5" /> {t('superadmin.notifications.channel_all_matrix', 'All Channels Matrix')}</span>
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative min-w-[220px]">
              <FleetIcons.Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('superadmin.notifications.ph_filter_rules', 'Filter rules...')}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* SECTION 1: WEB / IN-APP NOTIFICATION SETTINGS & RULES          */}
          {/* ------------------------------------------------------------- */}
          {activeChannelTab === 'web' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Web Channel Dedicated Settings Card */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-5">
                <div className="border-b border-slate-100 dark:border-zinc-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl">
                      🌐
                    </div>
                    <div>
                      <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100">
                        {t('superadmin.notifications.web_settings_title', 'Web & In-App Real-Time Notification Settings')}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                        {t('superadmin.notifications.web_settings_desc', 'Controls browser WebSockets, header notification dropdown, sound chime, and floating toasts.')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('superadmin.notifications.master_web_switch', 'Master Web Switch:')}</span>
                    <ToggleSwitch
                      id="master_web_switch"
                      label="Master Web In-App Notifications"
                      checked={channels.channel_in_app}
                      onChange={(val) => setChannels({ ...channels, channel_in_app: val })}
                    />
                  </div>
                </div>

                {/* Web Dedicated Setting Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">{t('superadmin.notifications.lbl_audio_chime', 'Audio Chime Alert')}</span>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('superadmin.notifications.desc_audio_chime', 'Play subtle sound on incoming event')}</p>
                    </div>
                    <ToggleSwitch
                      id="web_sound"
                      label="Audio Chime"
                      checked={webSettings.sound_alert}
                      onChange={(val) => setWebSettings({ ...webSettings, sound_alert: val })}
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">{t('superadmin.notifications.lbl_screen_toast', 'Floating Screen Toast')}</span>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('superadmin.notifications.desc_screen_toast', 'Show top-right popover banner')}</p>
                    </div>
                    <ToggleSwitch
                      id="web_toast"
                      label="Floating Toast"
                      checked={webSettings.toast_popup}
                      onChange={(val) => setWebSettings({ ...webSettings, toast_popup: val })}
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">{t('superadmin.notifications.lbl_bell_badge', 'Header Bell Badge')}</span>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('superadmin.notifications.desc_bell_badge', 'Live unread red pill counter')}</p>
                    </div>
                    <ToggleSwitch
                      id="web_badge"
                      label="Header Badge Counter"
                      checked={webSettings.badge_count}
                      onChange={(val) => setWebSettings({ ...webSettings, badge_count: val })}
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">{t('superadmin.notifications.lbl_auto_dismiss', 'Auto Dismiss')}</span>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">Toast closes in {webSettings.toast_duration}s</p>
                    </div>
                    <select
                      value={webSettings.toast_duration}
                      onChange={(e) => setWebSettings({ ...webSettings, toast_duration: Number(e.target.value) })}
                      className="px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold text-slate-800 dark:text-zinc-100"
                    >
                      <option value={3}>{t('superadmin.notifications.dismiss_3s', '3 sec')}</option>
                      <option value={5}>{t('superadmin.notifications.dismiss_5s', '5 sec')}</option>
                      <option value={8}>{t('superadmin.notifications.dismiss_8s', '8 sec')}</option>
                      <option value={0}>{t('superadmin.notifications.dismiss_manual', 'Manual')}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Web Notification Rules List */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
                <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                      <span>{t('superadmin.notifications.web_rules_title', 'Web Notification Dispatch Rules')}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        {webActiveCount} of {filteredTriggers.length} Active
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                      Toggle whether each specific platform event pops up as a real-time Web / In-App alert.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleBulkToggleChannel('web', true)}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      Enable All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => handleBulkToggleChannel('web', false)}
                      className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
                    >
                      Disable All
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                  {filteredTriggers.map((item) => {
                    const isEnabled = Boolean(ruleChannelToggles[item.key]?.web);
                    return (
                      <div key={item.key} className="py-3.5 first:pt-1 last:pb-1 flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100">
                              {item.title}
                            </span>
                            {item.badge && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                                {item.badge}
                              </span>
                            )}
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/50">
                              🌐 Web Center
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>

                        <div className="flex-shrink-0 pt-0.5">
                          <ToggleSwitch
                            id={`toggle-web-${item.key}`}
                            label={item.title}
                            checked={isEnabled}
                            onChange={(nextVal) => handleToggleRuleChannel(item.key, 'web', nextVal)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* SECTION 2: MOBILE PUSH NOTIFICATION SETTINGS & RULES (FCM)     */}
          {/* ------------------------------------------------------------- */}
          {activeChannelTab === 'push' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Push Channel Dedicated Settings Card */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-5">
                <div className="border-b border-slate-100 dark:border-zinc-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl">
                      📱
                    </div>
                    <div>
                      <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100">
                        Mobile Push (FCM) Notification Settings
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                        Controls Firebase Cloud Messaging delivery to driver tablets, conductor devices, and mobile apps.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('superadmin.notifications.master_push_switch', 'Master Push Switch:')}</span>
                    <ToggleSwitch
                      id="master_push_switch"
                      label="Master Mobile Push"
                      checked={channels.channel_push}
                      onChange={(val) => setChannels({ ...channels, channel_push: val })}
                    />
                  </div>
                </div>

                {/* Push Dedicated Setting Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">{t('superadmin.notifications.lbl_high_priority_wakeup', 'High Priority Wakeup')}</span>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('superadmin.notifications.desc_high_priority_wakeup', 'Bypass device battery sleep')}</p>
                    </div>
                    <ToggleSwitch
                      id="push_priority"
                      label="High Priority Wakeup"
                      checked={pushSettings.high_priority}
                      onChange={(val) => setPushSettings({ ...pushSettings, high_priority: val })}
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">{t('superadmin.notifications.lbl_device_vibration', 'Device Vibration')}</span>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('superadmin.notifications.desc_device_vibration', 'Vibrate driver device on SOS')}</p>
                    </div>
                    <ToggleSwitch
                      id="push_vibrate"
                      label="Vibration"
                      checked={pushSettings.vibrate}
                      onChange={(val) => setPushSettings({ ...pushSettings, vibrate: val })}
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">{t('superadmin.notifications.lbl_collapse_dups', 'Collapse Duplicates')}</span>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('superadmin.notifications.desc_collapse_dups', 'Group repeated GPS/speed warnings')}</p>
                    </div>
                    <ToggleSwitch
                      id="push_collapse"
                      label="Collapse Duplicates"
                      checked={pushSettings.collapse_key}
                      onChange={(val) => setPushSettings({ ...pushSettings, collapse_key: val })}
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">{t('superadmin.notifications.lbl_fcm_engine', 'FCM Engine')}</span>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">{'vmovexa-5f0cf'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleTestPush}
                      disabled={testingPush}
                      className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
                    >
                      {testingPush ? 'Testing...' : 'Test FCM'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Push Notification Rules List */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
                <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                      <span>{t('superadmin.notifications.push_rules_title', 'Mobile Push Dispatch Rules')}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                        {pushActiveCount} of {filteredTriggers.length} Active
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                      Toggle whether each specific platform event triggers a mobile FCM push notification to phones & terminals.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleBulkToggleChannel('push', true)}
                      className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      Enable All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => handleBulkToggleChannel('push', false)}
                      className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
                    >
                      Disable All
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                  {filteredTriggers.map((item) => {
                    const isEnabled = Boolean(ruleChannelToggles[item.key]?.push);
                    return (
                      <div key={item.key} className="py-3.5 first:pt-1 last:pb-1 flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100">
                              {item.title}
                            </span>
                            {item.badge && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                                {item.badge}
                              </span>
                            )}
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/50">
                              📱 Push FCM
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>

                        <div className="flex-shrink-0 pt-0.5">
                          <ToggleSwitch
                            id={`toggle-push-${item.key}`}
                            label={item.title}
                            checked={isEnabled}
                            onChange={(nextVal) => handleToggleRuleChannel(item.key, 'push', nextVal)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* SECTION 3: MAIL / EMAIL NOTIFICATION SETTINGS & RULES          */}
          {/* ------------------------------------------------------------- */}
          {activeChannelTab === 'email' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Email Channel Dedicated Settings Card */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-5">
                <div className="border-b border-slate-100 dark:border-zinc-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl">
                      ✉️
                    </div>
                    <div>
                      <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100">
                        Mail / Email Notification Settings
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                        Controls transactional emails, PDF invoices, credentials dispatch, and audit logs.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('superadmin.notifications.master_email_switch', 'Master Email Switch:')}</span>
                    <ToggleSwitch
                      id="master_email_switch"
                      label="Master Transactional Email"
                      checked={channels.channel_email}
                      onChange={(val) => setChannels({ ...channels, channel_email: val })}
                    />
                  </div>
                </div>

                {/* Email Dedicated Setting Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">{t('superadmin.notifications.lbl_attach_pdf', 'Attach PDF Invoice')}</span>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('superadmin.notifications.desc_attach_pdf', 'Include downloadable PDF')}</p>
                    </div>
                    <ToggleSwitch
                      id="email_pdf"
                      label="Attach PDF"
                      checked={emailSettings.attach_pdf}
                      onChange={(val) => setEmailSettings({ ...emailSettings, attach_pdf: val })}
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">{t('superadmin.notifications.lbl_gst_breakdown', 'Include GST Breakdown')}</span>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('superadmin.notifications.desc_gst_breakdown', 'CGST/SGST/IGST tax summary')}</p>
                    </div>
                    <ToggleSwitch
                      id="email_gst"
                      label="GST Breakdown"
                      checked={emailSettings.include_gst}
                      onChange={(val) => setEmailSettings({ ...emailSettings, include_gst: val })}
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">{t('superadmin.notifications.lbl_dispatch_speed', 'Dispatch Speed')}</span>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('superadmin.notifications.desc_dispatch_speed', 'Delivery timing queue')}</p>
                    </div>
                    <select
                      value={emailSettings.dispatch_mode}
                      onChange={(e) => setEmailSettings({ ...emailSettings, dispatch_mode: e.target.value })}
                      className="px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold text-slate-800 dark:text-zinc-100"
                    >
                      <option value="instant">{t('superadmin.notifications.speed_instant', 'Instant')}</option>
                      <option value="5min_digest">{t('superadmin.notifications.speed_5m_digest', '5m Digest')}</option>
                    </select>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">{t('superadmin.notifications.lbl_audit_bcc', 'Audit BCC Email')}</span>
                      <input
                        type="email"
                        value={emailSettings.bcc_admin}
                        onChange={(e) => setEmailSettings({ ...emailSettings, bcc_admin: e.target.value })}
                        placeholder={'audit@vmovexa.com'}
                        className="mt-1 w-full px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[11px] text-slate-900 dark:text-zinc-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Notification Rules List */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
                <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                      <span>{t('superadmin.notifications.email_rules_title', 'Mail / Email Dispatch Rules')}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        {emailActiveCount} of {filteredTriggers.length} Active
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                      Toggle whether each specific platform event generates an automated transactional email.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleBulkToggleChannel('email', true)}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Enable All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => handleBulkToggleChannel('email', false)}
                      className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
                    >
                      Disable All
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                  {filteredTriggers.map((item) => {
                    const isEnabled = Boolean(ruleChannelToggles[item.key]?.email);
                    return (
                      <div key={item.key} className="py-3.5 first:pt-1 last:pb-1 flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100">
                              {item.title}
                            </span>
                            {item.badge && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                                {item.badge}
                              </span>
                            )}
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50">
                              ✉️ Email
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>

                        <div className="flex-shrink-0 pt-0.5">
                          <ToggleSwitch
                            id={`toggle-email-${item.key}`}
                            label={item.title}
                            checked={isEnabled}
                            onChange={(nextVal) => handleToggleRuleChannel(item.key, 'email', nextVal)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* SECTION 4: SMS / WHATSAPP NOTIFICATION SETTINGS & RULES        */}
          {/* ------------------------------------------------------------- */}
          {activeChannelTab === 'sms' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* SMS Channel Dedicated Settings Card */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-5">
                <div className="border-b border-slate-100 dark:border-zinc-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl">
                      💬
                    </div>
                    <div>
                      <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100">
                        SMS & WhatsApp Gateway Settings
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                        Controls Indian Telecom DLT entity headers, SMS templates, and WhatsApp business API alerts.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('superadmin.notifications.master_sms_switch', 'Master SMS Switch:')}</span>
                    <ToggleSwitch
                      id="master_sms_switch"
                      label="Master SMS Notifications"
                      checked={channels.channel_sms && channels.channel_whatsapp}
                      onChange={(val) => setChannels({ ...channels, channel_sms: val, channel_whatsapp: val })}
                    />
                  </div>
                </div>

                {/* SMS Dedicated Setting Fields & Twilio Credentials */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 space-y-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center justify-between">
                      <span>{t('superadmin.notifications.lbl_twilio_sid', 'Twilio Account SID')}</span>
                      <span className="text-[10px] text-blue-600 font-extrabold uppercase">{t('superadmin.notifications.lbl_live_creds', 'Live Credentials')}</span>
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('superadmin.notifications.desc_twilio_sid', 'Account SID from Twilio Console')}</p>
                    <input
                      type="text"
                      value={smsSettings.twilio_account_sid || ''}
                      onChange={(e) => setSmsSettings({ ...smsSettings, twilio_account_sid: e.target.value })}
                      placeholder={'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'}
                      className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono font-bold text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 space-y-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center justify-between">
                      <span>{t('superadmin.notifications.lbl_twilio_auth_token', 'Twilio Auth Token')}</span>
                      <span className="text-[10px] text-emerald-600 font-extrabold uppercase">{t('superadmin.notifications.lbl_encrypted', 'Encrypted')}</span>
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('superadmin.notifications.desc_twilio_token', 'API secret token for SMS requests')}</p>
                    <input
                      type="password"
                      value={smsSettings.twilio_auth_token || ''}
                      onChange={(e) => setSmsSettings({ ...smsSettings, twilio_auth_token: e.target.value })}
                      placeholder={''}
                      className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono font-bold text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 space-y-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">{t('superadmin.notifications.lbl_twilio_sender_number', 'Twilio Sender Number')}</span>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('superadmin.notifications.desc_twilio_number', 'Twilio virtual phone number')}</p>
                    <input
                      type="text"
                      value={smsSettings.twilio_from_number || ''}
                      onChange={(e) => setSmsSettings({ ...smsSettings, twilio_from_number: e.target.value })}
                      placeholder="+18005550199"
                      className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono font-bold text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 space-y-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">{t('superadmin.notifications.lbl_dlt_sender_header', 'DLT Sender Header')}</span>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('superadmin.notifications.desc_dlt_header', '6-character approved header')}</p>
                    <input
                      type="text"
                      maxLength={6}
                      value={smsSettings.sender_id || 'VMVEXA'}
                      onChange={(e) => setSmsSettings({ ...smsSettings, sender_id: e.target.value.toUpperCase() })}
                      placeholder={'VMVEXA'}
                      className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono font-bold text-slate-900 dark:text-zinc-100"
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 space-y-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">{t('superadmin.notifications.lbl_dlt_entity_id', 'DLT Entity ID')}</span>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('superadmin.notifications.desc_dlt_entity', 'TRAI / Operator registration ID')}</p>
                    <input
                      type="text"
                      value={smsSettings.dlt_entity_id || ''}
                      onChange={(e) => setSmsSettings({ ...smsSettings, dlt_entity_id: e.target.value })}
                      placeholder="1101552340000021"
                      className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono font-bold text-slate-900 dark:text-zinc-100"
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">{t('superadmin.notifications.lbl_critical_sos_only', 'Critical / SOS Only')}</span>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('superadmin.notifications.desc_critical_sos', 'Save SMS cost on routine alerts')}</p>
                    </div>
                    <ToggleSwitch
                      id="sms_critical"
                      label="Critical Only"
                      checked={smsSettings.critical_only}
                      onChange={(val) => setSmsSettings({ ...smsSettings, critical_only: val })}
                    />
                  </div>
                </div>
              </div>

              {/* SMS Notification Rules List */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
                <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                      <span>{t('superadmin.notifications.sms_rules_title', 'SMS / WhatsApp Dispatch Rules')}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                        {smsActiveCount} of {filteredTriggers.length} Active
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                      Toggle whether each specific platform event triggers an SMS text or WhatsApp broadcast message.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleBulkToggleChannel('sms', true)}
                      className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      Enable All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => handleBulkToggleChannel('sms', false)}
                      className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
                    >
                      Disable All
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                  {filteredTriggers.map((item) => {
                    const isEnabled = Boolean(ruleChannelToggles[item.key]?.sms);
                    return (
                      <div key={item.key} className="py-3.5 first:pt-1 last:pb-1 flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100">
                              {item.title}
                            </span>
                            {item.badge && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                                {item.badge}
                              </span>
                            )}
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/50">
                              💬 SMS Alert
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>

                        <div className="flex-shrink-0 pt-0.5">
                          <ToggleSwitch
                            id={`toggle-sms-${item.key}`}
                            label={item.title}
                            checked={isEnabled}
                            onChange={(nextVal) => handleToggleRuleChannel(item.key, 'sms', nextVal)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* SECTION 5: ALL CHANNELS COMPARISON MATRIX TABLE                */}
          {/* ------------------------------------------------------------- */}
          {activeChannelTab === 'matrix' && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-4 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <span>{t('superadmin.notifications.matrix_title', 'Multi-Channel Rule Comparison Matrix')}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                    Compare and configure all 4 delivery channels (Web, Push, Email, SMS) side by side for every rule.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-zinc-700/80 bg-slate-50/70 dark:bg-zinc-800/50 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                      <th className="py-3 px-4">{t('superadmin.notifications.th_event_trigger', 'Event Trigger & Condition')}</th>
                      <th className="py-3 px-3 text-center"><span className="inline-flex items-center gap-1 justify-center"><FleetIcons.Globe className="w-3.5 h-3.5" /> {t('superadmin.notifications.th_web_center', 'Web Center')}</span></th>
                      <th className="py-3 px-3 text-center"><span className="inline-flex items-center gap-1 justify-center"><FleetIcons.Phone className="w-3.5 h-3.5" /> {t('superadmin.notifications.th_mobile_push', 'Mobile Push')}</span></th>
                      <th className="py-3 px-3 text-center"><span className="inline-flex items-center gap-1 justify-center"><FleetIcons.Mail className="w-3.5 h-3.5" /> {t('superadmin.notifications.th_email', 'Mail (Email)')}</span></th>
                      <th className="py-3 px-3 text-center"><span className="inline-flex items-center gap-1 justify-center"><FleetIcons.Chat className="w-3.5 h-3.5" /> {t('superadmin.notifications.th_sms_wa', 'SMS / WA')}</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                    {filteredTriggers.map((item) => {
                      const webOn = Boolean(ruleChannelToggles[item.key]?.web);
                      const pushOn = Boolean(ruleChannelToggles[item.key]?.push);
                      const emailOn = Boolean(ruleChannelToggles[item.key]?.email);
                      const smsOn = Boolean(ruleChannelToggles[item.key]?.sms);

                      return (
                        <tr key={item.key} className="hover:bg-slate-50/40 dark:hover:bg-zinc-800/30 transition-colors">
                          <td className="py-3.5 px-4 pr-6">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900 dark:text-zinc-100">{item.title}</span>
                              {item.badge && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium mt-0.5 line-clamp-1">
                              {item.desc}
                            </p>
                          </td>

                          {/* Column 1: Web Toggle */}
                          <td className="py-3.5 px-3 text-center align-middle">
                            <ToggleSwitch
                              id={`matrix-web-${item.key}`}
                              label={`Web for ${item.title}`}
                              checked={webOn}
                              onChange={(val) => handleToggleRuleChannel(item.key, 'web', val)}
                            />
                          </td>

                          {/* Column 2: Push Toggle */}
                          <td className="py-3.5 px-3 text-center align-middle">
                            <ToggleSwitch
                              id={`matrix-push-${item.key}`}
                              label={`Push for ${item.title}`}
                              checked={pushOn}
                              onChange={(val) => handleToggleRuleChannel(item.key, 'push', val)}
                            />
                          </td>

                          {/* Column 3: Email Toggle */}
                          <td className="py-3.5 px-3 text-center align-middle">
                            <ToggleSwitch
                              id={`matrix-email-${item.key}`}
                              label={`Email for ${item.title}`}
                              checked={emailOn}
                              onChange={(val) => handleToggleRuleChannel(item.key, 'email', val)}
                            />
                          </td>

                          {/* Column 4: SMS Toggle */}
                          <td className="py-3.5 px-3 text-center align-middle">
                            <ToggleSwitch
                              id={`matrix-sms-${item.key}`}
                              label={`SMS for ${item.title}`}
                              checked={smsOn}
                              onChange={(val) => handleToggleRuleChannel(item.key, 'sms', val)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Quiet Hours (DND) Global Setting */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div>
              <span className="font-bold text-slate-800 dark:text-zinc-200"><FleetIcons.Clock className="w-4 h-4 text-purple-500 inline mr-1" /> {t('superadmin.notifications.quiet_hours_label', 'Global Quiet Hours (Do Not Disturb):')}</span>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Non-critical notifications across all channels will be silenced during these hours. SOS and collision emergency alerts will always bypass.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={channels.quiet_hours_start}
                onChange={(e) => setChannels({ ...channels, quiet_hours_start: e.target.value })}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs text-slate-800 dark:text-zinc-100 font-mono"
              />
              <span className="text-slate-400 font-medium">{t('superadmin.notifications.to_label', 'to')}</span>
              <input
                type="time"
                value={channels.quiet_hours_end}
                onChange={(e) => setChannels({ ...channels, quiet_hours_end: e.target.value })}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs text-slate-800 dark:text-zinc-100 font-mono"
              />
            </div>
          </div>

          {/* Sticky Bottom Save Bar */}
          <div className="sticky bottom-4 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 sm:gap-3 text-xs font-semibold text-slate-700 dark:text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="truncate">
                Active: <strong className="text-emerald-600 dark:text-emerald-400">{webActiveCount} Web</strong>, <strong className="text-amber-600 dark:text-amber-400">{pushActiveCount} Push</strong>, <strong className="text-blue-600 dark:text-blue-400">{emailActiveCount} Email</strong>, <strong className="text-purple-600 dark:text-purple-400">{smsActiveCount} SMS</strong>
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSaveAllPreferences}
                disabled={savingRules}
                className="w-full sm:w-auto px-6 py-2.5 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <FleetIcons.Check className="w-4 h-4" />
                <span>{savingRules ? 'Saving Settings...' : 'Save All Channel Settings'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB: SMTP EMAIL SERVER CONFIGURATION & TESTING            */}
      {/* ========================================================= */}
      {activeMainTab === 'smtp' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className={`p-4 rounded-2xl border flex items-start justify-between gap-4 ${
            smtpForm.is_custom
              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200'
              : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200'
          }`}>
            <div className="flex items-start gap-3">
              <span className="text-xl">{smtpForm.is_custom ? '✅' : '⚙️'}</span>
              <div>
                <h3 className="text-xs sm:text-sm font-black tracking-tight">
                  {smtpForm.is_custom
                    ? 'Platform Database SMTP Active'
                    : 'System Default Environment Fallback Active'}
                </h3>
                <p className="text-xs opacity-80 mt-0.5">
                  {smtpForm.is_custom
                    ? `Emails are dispatched using the custom database SMTP host (${smtpForm.smtp_host || 'Configured'}). Changes take effect immediately without restarting the server.`
                    : 'No custom SMTP credentials stored in database yet. Currently using environment variable defaults.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 hidden md:inline">{t('superadmin.notifications.quick_presets', 'Quick Presets:')}</span>
              <button
                type="button"
                onClick={() => applySmtpPreset('gmail')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold hover:bg-slate-50 dark:hover:bg-zinc-700 shadow-sm transition-colors text-slate-700 dark:text-zinc-200"
              >
                Gmail
              </button>
              <button
                type="button"
                onClick={() => applySmtpPreset('brevo')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold hover:bg-slate-50 dark:hover:bg-zinc-700 shadow-sm transition-colors text-slate-700 dark:text-zinc-200"
              >
                Brevo
              </button>
              <button
                type="button"
                onClick={() => applySmtpPreset('aws')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold hover:bg-slate-50 dark:hover:bg-zinc-700 shadow-sm transition-colors text-slate-700 dark:text-zinc-200"
              >
                AWS SES
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100">
                  SMTP Server Credentials
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                  Configure your outgoing mail transport for verification codes, invitations, and alerts.
                </p>
              </div>

              <form onSubmit={handleSaveSmtp} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      SMTP Host / Server <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t('superadmin.notifications.ph_smtp_host', 'e.g. smtp.gmail.com or smtp.resend.com')}
                      value={smtpForm.smtp_host}
                      onChange={(e) => setSmtpForm({ ...smtpForm, smtp_host: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-xl text-xs font-medium text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Port <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      placeholder={t('superadmin.notifications.ph_smtp_port', '587 or 465')}
                      value={smtpForm.smtp_port}
                      onChange={(e) => setSmtpForm({ ...smtpForm, smtp_port: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-xl text-xs font-medium text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Username / Auth Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t('superadmin.notifications.ph_smtp_from', 'e.g. alerts@vmovexa.com')}
                      value={smtpForm.smtp_user}
                      onChange={(e) => setSmtpForm({ ...smtpForm, smtp_user: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-xl text-xs font-medium text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                        Password / App Password
                      </label>
                      {smtpForm.has_pass && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                          ✓ Stored in Database
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={smtpForm.has_pass ? '•••••••••••• (Leave blank to keep current)' : 'Enter SMTP password'}
                        value={smtpForm.smtp_pass}
                        onChange={(e) => setSmtpForm({ ...smtpForm, smtp_pass: e.target.value })}
                        className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-xl text-xs font-medium text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 text-xs font-bold"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Sender "From" Header
                    </label>
                    <input
                      type="text"
                      placeholder='"VMOVEXA Fleet" <alerts@vmovexa.com>'
                      value={smtpForm.smtp_from}
                      onChange={(e) => setSmtpForm({ ...smtpForm, smtp_from: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-xl text-xs font-medium text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40">
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">{t('superadmin.notifications.ssl_tls_secure', 'SSL / TLS Secure')}</span>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Enable for Port 465 (Direct SSL). Keep OFF for Port 587 (STARTTLS).
                      </p>
                    </div>
                    <ToggleSwitch
                      id="smtp_secure"
                      label="SSL/TLS Secure"
                      checked={smtpForm.smtp_secure}
                      onChange={(val) => setSmtpForm({ ...smtpForm, smtp_secure: val })}
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-zinc-800">
                  <button
                    type="submit"
                    disabled={savingSmtp}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-60"
                  >
                    <FleetIcons.Check className="w-3.5 h-3.5 text-white" />
                    <span>{savingSmtp ? 'Saving Configuration...' : 'Save SMTP Settings'}</span>
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <span className="flex items-center gap-1.5"><FleetIcons.Activity className="w-3.5 h-3.5 text-emerald-500" /> {t('superadmin.notifications.live_conn_test', 'Live Connection Test')}</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                    Send a test email to verify host handshake and credentials.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Recipient Email Address
                  </label>
                  <input
                    type="email"
                    placeholder={t('superadmin.notifications.ph_test_email', 'Enter email to receive test message')}
                    value={testEmailTo}
                    onChange={(e) => setTestEmailTo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-xl text-xs font-medium text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 text-xs space-y-1.5 text-slate-600 dark:text-zinc-400">
                  <div className="font-bold text-slate-900 dark:text-zinc-200">{t('superadmin.notifications.test_handshake', 'Test Handshake:')}</div>
                  <ul className="list-disc pl-4 space-y-1 text-[11px]">
                    <li>Socket to {smtpForm.smtp_host || 'Host'}:{smtpForm.smtp_port || 587}</li>
                    <li>Auth with {smtpForm.smtp_user || 'User'}</li>
                    <li>{t('superadmin.notifications.test_handshake_desc', 'Delivery of test HTML notification message')}</li>
                  </ul>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTestEmail}
                disabled={testingEmail || !testEmailTo}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <FleetIcons.Speed className="w-4 h-4" />
                <span>{testingEmail ? 'Sending Test Email...' : 'Send Test Email Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB: FIREBASE PUSH (FCM) & DEVICE TEST                    */}
      {/* ========================================================= */}
      {activeMainTab === 'push' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <FleetIcons.Zap className="w-6 h-6 text-amber-500 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-emerald-900 dark:text-emerald-200">
                    Firebase Cloud Messaging v1 Engine Ready
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase">
                    Connected
                  </span>
                </div>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 font-medium mt-0.5">
                  FCM Service Account is loaded. Multicast push notifications are dispatched to mobile apps and driver tablets.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestPush}
              disabled={testingPush}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-60 flex-shrink-0"
            >
              <FleetIcons.Speed className="w-3.5 h-3.5 text-white" />
              <span>{testingPush ? 'Sending Test Push...' : 'Send Test Push Alert'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>{t('superadmin.notifications.firebase_config_title', 'Firebase Project Configuration')}</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                  Server credentials initialized from secure service account file.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">{t('superadmin.notifications.lbl_project_id', 'Project ID')}</span>
                    <p className="text-xs font-mono font-bold text-slate-900 dark:text-zinc-100">{'vmovexa-5f0cf'}</p>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    Google Cloud
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">{t('superadmin.notifications.lbl_client_email', 'Client Email')}</span>
                    <p className="text-xs font-mono font-bold text-slate-900 dark:text-zinc-100 truncate max-w-xs">
                      firebase-adminsdk-fbsvc@vmovexa-5f0cf.iam.gserviceaccount.com
                    </p>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    Authorized
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">{t('superadmin.notifications.lbl_credential_storage', 'Credential Storage')}</span>
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

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <span>{t('superadmin.notifications.browser_push_perm_title', 'Web Browser Push Permission')}</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                    Allow browser desktop notifications for instant background vehicle & SOS alerts.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">{t('superadmin.notifications.lbl_browser_status', 'Browser Status')}</span>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      {browserPermission === 'granted'
                        ? 'Notifications Granted ✅ (Browser alerts enabled)'
                        : browserPermission === 'denied'
                        ? 'Notifications Blocked ❌ (Enable in browser settings)'
                        : 'Permission Default ⚠️ (Click to enable browser push)'}
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
                  When enabled, critical vehicle alerts and emergency broadcasts will pop up as native operating system notifications.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-3">
                {browserPermission !== 'granted' && (
                  <button
                    type="button"
                    onClick={handleRequestPermission}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <span>{t('superadmin.notifications.btn_req_permission', 'Request Notification Permission')}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleTestPush}
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
      )}
    </div>
  );
};

export default SuperNotificationSettingsPage;
