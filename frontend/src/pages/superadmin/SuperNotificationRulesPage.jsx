import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons.jsx';
import { Breadcrumb } from '../../components/ui/Breadcrumb.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
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

const PLATFORM_TRIGGERS_CATALOG = [
  // 1. Tenant & Fleet Onboarding
  { key: 'tenant_registration_superadmin', category: 'onboarding', categoryLabel: 'Tenant & Fleet Onboarding', title: 'New Tenant Self-Registration Applied', desc: 'Triggers when a fleet operator applies via the signup portal. Notifies Super Admin for review.', defaultChannels: { web: true, push: false, email: true, sms: false, whatsapp: true }, badge: 'High Priority' },
  { key: 'tenant_registration_welcome', category: 'onboarding', categoryLabel: 'Tenant & Fleet Onboarding', title: 'Applicant Welcome & Receipt', desc: 'Dispatches an automated confirmation email with enrollment ID upon form submission.', defaultChannels: { web: false, push: false, email: true, sms: false, whatsapp: true }, badge: 'Transactional' },
  { key: 'tenant_onboarding_approved', category: 'onboarding', categoryLabel: 'Tenant & Fleet Onboarding', title: 'Tenant Application Approved & Activated', desc: 'Sends credentials and account activation instructions upon Super Admin approval.', defaultChannels: { web: true, push: false, email: true, sms: false, whatsapp: true }, badge: 'Important' },
  { key: 'tenant_registration_rejected', category: 'onboarding', categoryLabel: 'Tenant & Fleet Onboarding', title: 'Tenant Registration Rejected', desc: 'Notifies applicant of rejection status and re-submission guidelines.', defaultChannels: { web: false, push: false, email: true, sms: false, whatsapp: false }, badge: 'Notice' },
  { key: 'online_onboarding_payment_required', category: 'onboarding', categoryLabel: 'Tenant & Fleet Onboarding', title: 'Online Onboarding Plan Checkout Notice', desc: 'Dispatches payment checkout link when online billing mode is provisioned.', defaultChannels: { web: false, push: false, email: true, sms: false, whatsapp: true }, badge: 'Billing Action' },

  // 2. User Credentials & Provisioning
  { key: 'user_welcome_credentials', category: 'users', categoryLabel: 'User Provisioning & Credentials', title: 'New User Created & Temporary Password Sent', desc: 'Sends temporary password and login instructions when a new user account is created.', defaultChannels: { web: false, push: false, email: true, sms: true, whatsapp: true }, badge: 'Security / Login' },
  { key: 'user_provisioned_superadmin', category: 'users', categoryLabel: 'User Provisioning & Credentials', title: 'Platform User Provisioning Audit Alert', desc: 'Logs security audit notification for Super Admin whenever a user is provisioned.', defaultChannels: { web: true, push: false, email: true, sms: false, whatsapp: false }, badge: 'Audit Trail' },
  { key: 'tenant_member_added', category: 'users', categoryLabel: 'User Provisioning & Credentials', title: 'New Member Added to Tenant Fleet Roster', desc: 'Dispatches alert to Organization Admin when a technician or driver is assigned.', defaultChannels: { web: true, push: false, email: true, sms: false, whatsapp: true }, badge: 'Team Notice' },
  { key: 'user_invitation', category: 'users', categoryLabel: 'User Provisioning & Credentials', title: 'Platform Member Invite Sent', desc: 'Dispatches direct email invite with secure link to join organization portal.', defaultChannels: { web: false, push: false, email: true, sms: false, whatsapp: true }, badge: 'Invite' },

  // 3. Subscriptions & Financial Billing
  { key: 'payment_received', category: 'billing', categoryLabel: 'Billing & Subscriptions', title: 'Subscription Payment Confirmed', desc: 'Confirmation alert dispatched upon payment gateway receipt.', defaultChannels: { web: true, push: false, email: true, sms: false, whatsapp: true }, badge: 'Payment' },
  { key: 'invoice_generated', category: 'billing', categoryLabel: 'Billing & Subscriptions', title: 'Monthly GST Tax Invoice Generated', desc: 'Dispatches PDF invoice receipt to tenant accounting team.', defaultChannels: { web: false, push: false, email: true, sms: false, whatsapp: true }, badge: 'Finance' },
  { key: 'subscription_expiring_soon', category: 'billing', categoryLabel: 'Billing & Subscriptions', title: 'Plan Expiry & Renewal Warning', desc: 'Dispatches reminder 7 days and 24 hours prior to plan expiration.', defaultChannels: { web: true, push: true, email: true, sms: false, whatsapp: true }, badge: 'Renewal Warning' },

  // 4. Advertising & Campaigns
  { key: 'campaign_review_requested', category: 'campaigns', categoryLabel: 'Advertising & Campaigns', title: 'New Campaign Creative Submitted', desc: 'Alerts Super Admin when an advertiser submits new ads for approval.', defaultChannels: { web: true, push: false, email: true, sms: false, whatsapp: true }, badge: 'Review Needed' },
  { key: 'campaign_approved', category: 'campaigns', categoryLabel: 'Advertising & Campaigns', title: 'Advertising Campaign Approved', desc: 'Notifies advertiser when creative is approved for screen playback.', defaultChannels: { web: true, push: true, email: true, sms: false, whatsapp: true }, badge: 'Approved' },
  { key: 'campaign_rejected', category: 'campaigns', categoryLabel: 'Advertising & Campaigns', title: 'Advertising Campaign Rejected', desc: 'Feedback email sent if creative does not meet display guidelines.', defaultChannels: { web: true, push: false, email: true, sms: false, whatsapp: false }, badge: 'Rejected' },
  { key: 'campaign_verified_payment_link', category: 'campaigns', categoryLabel: 'Advertising & Campaigns', title: 'Campaign Verified & Payment Link Sent', desc: 'Dispatches payment link token to advertiser after approval.', defaultChannels: { web: true, push: false, email: true, sms: false, whatsapp: true }, badge: 'Payment Link' },

  // 5. Hardware NOC & Operational Safety
  { key: 'emergency_broadcast', category: 'safety', categoryLabel: 'Safety & Emergency Overrides', title: 'Emergency Broadcast Override', desc: 'Critical SOS safety alert overriding screen playback and alerting all operators.', defaultChannels: { web: true, push: true, email: true, sms: true, whatsapp: true }, badge: 'CRITICAL / SOS' },
  { key: 'device_offline', category: 'hardware', categoryLabel: 'Hardware & NOC Telemetry', title: 'Edge Display Unit Offline Alert', desc: 'Instant NOC alert when an edge screen stops sending telemetry pings.', defaultChannels: { web: true, push: true, email: true, sms: false, whatsapp: true }, badge: 'NOC Warning' },
  { key: 'mqtt_cluster_alert', category: 'hardware', categoryLabel: 'Hardware & NOC Telemetry', title: 'MQTT Cluster Queue Latency Warning', desc: 'Real-time alert when message queue latency exceeds threshold.', defaultChannels: { web: true, push: false, email: true, sms: false, whatsapp: false }, badge: 'Infrastructure' },
  { key: 'technician_dispatched', category: 'support', categoryLabel: 'Support & Work Orders', title: 'Hardware Repair Ticket Assigned', desc: 'Alerts technician when a vehicle hardware repair work order is assigned.', defaultChannels: { web: true, push: true, email: true, sms: true, whatsapp: true }, badge: 'Dispatch' },
];

export const SuperNotificationRulesPage = () => {
  const { loadSettings, togglePreference } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [savingRules, setSavingRules] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [eventTypeMap, setEventTypeMap] = useState({});

  const [ruleToggles, setRuleToggles] = useState(() => {
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

  useEffect(() => {
    loadSettings()
      .then((res) => {
        if (Array.isArray(res?.events)) {
          const map = {};
          res.events.forEach((ev) => { map[ev.key] = ev.id; });
          setEventTypeMap(map);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [loadSettings]);

  const handleRuleToggle = (eventKey, channel, val) => {
    const next = {
      ...ruleToggles,
      [eventKey]: {
        ...(ruleToggles[eventKey] || { web: false, push: false, email: false, sms: false, whatsapp: false }),
        [channel]: val,
      },
    };
    setRuleToggles(next);
    localStorage.setItem('vmovexa_channel_event_rules', JSON.stringify(next));

    // Async backend toggle sync if eventTypeId exists
    const evId = eventTypeMap[eventKey];
    if (evId && togglePreference) {
      togglePreference(evId, val).catch(() => {});
    }
  };

  const handleSaveAllRules = async () => {
    setSavingRules(true);
    try {
      localStorage.setItem('vmovexa_channel_event_rules', JSON.stringify(ruleToggles));
      toast.success('All notification rules & channel matrix updated successfully!');
    } catch (err) {
      toast.error('Failed to save rules: ' + err.message);
    } finally {
      setSavingRules(false);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const filteredTriggers = useMemo(() => {
    return PLATFORM_TRIGGERS_CATALOG.filter((item) => {
      const matchesCat = activeCategory === 'all' || item.category === activeCategory;
      const matchesSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.key.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  const totalItems = filteredTriggers.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedTriggers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTriggers.slice(startIndex, startIndex + pageSize);
  }, [filteredTriggers, currentPage, pageSize]);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <FleetIcons.Spinner className="w-6 h-6 animate-spin text-blue-600" />
          <span>Loading event trigger rules catalog...</span>
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
          { label: 'Notification Event Rules' },
        ]}
      />

      {/* Header & Sub-Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-1">
            Platform Event Dispatch Rules
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Configure channel dispatch toggles (Web, Push, Email, SMS, WhatsApp) for each platform event rule.
          </p>
        </div>

        {/* Top Gateway Sub-Links Nav */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-800/80 p-1.5 rounded-xl text-xs font-bold overflow-x-auto no-scrollbar">
          <Link to="/superadmin/settings/notifications/channels" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 whitespace-nowrap flex-shrink-0">
            <FleetIcons.Sliders className="w-3.5 h-3.5" />
            <span>Master Channels</span>
          </Link>
          <Link to="/superadmin/settings/notifications/rules" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm whitespace-nowrap flex-shrink-0">
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

      {/* Toolbar: Search + Category Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search notification triggers by title or event key..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-medium text-slate-900 dark:text-zinc-100"
          />
          <FleetIcons.Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
          {['all', 'onboarding', 'users', 'billing', 'campaigns', 'safety', 'hardware'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Event Rules List with Channel Grid Toggles */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100">
            Event Catalog ({filteredTriggers.length} Triggers)
          </h2>
          <button
            type="button"
            onClick={handleSaveAllRules}
            disabled={savingRules}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
          >
            <span>{savingRules ? 'Saving Rules...' : 'Save All Event Rules'}</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
          {paginatedTriggers.map((item) => {
            const toggles = ruleToggles[item.key] || { web: false, push: false, email: false, sms: false };
            return (
              <div key={item.key} className="py-4 first:pt-1 last:pb-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                      {item.title}
                    </span>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                    {item.desc}
                  </p>
                  <code className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono mt-1 inline-block">
                    key: {item.key}
                  </code>
                </div>

                {/* Channel Toggles Grid */}
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-zinc-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800/80 flex-shrink-0">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400">Web</span>
                    <ToggleSwitch
                      id={`rule_${item.key}_web`}
                      label="Web Channel"
                      checked={toggles.web}
                      onChange={(val) => handleRuleToggle(item.key, 'web', val)}
                    />
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400">Push</span>
                    <ToggleSwitch
                      id={`rule_${item.key}_push`}
                      label="Push Channel"
                      checked={toggles.push}
                      onChange={(val) => handleRuleToggle(item.key, 'push', val)}
                    />
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400">Email</span>
                    <ToggleSwitch
                      id={`rule_${item.key}_email`}
                      label="Email Channel"
                      checked={toggles.email}
                      onChange={(val) => handleRuleToggle(item.key, 'email', val)}
                    />
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400">SMS</span>
                    <ToggleSwitch
                      id={`rule_${item.key}_sms`}
                      label="SMS Channel"
                      checked={toggles.sms}
                      onChange={(val) => handleRuleToggle(item.key, 'sms', val)}
                    />
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">WhatsApp</span>
                    <ToggleSwitch
                      id={`rule_${item.key}_whatsapp`}
                      label="WhatsApp Channel"
                      checked={toggles.whatsapp}
                      onChange={(val) => handleRuleToggle(item.key, 'whatsapp', val)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Pagination */}
        {totalItems > 0 && (
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[6, 12, 24]}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperNotificationRulesPage;
