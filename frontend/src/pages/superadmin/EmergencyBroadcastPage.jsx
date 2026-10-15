import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { useSuperEmergency } from '../../hooks/superadmin/useSuperEmergency';
import { useOrganization } from '../../hooks/superadmin/useOrganization';
import toast from 'react-hot-toast';

export const EmergencyBroadcastPage = () => {
  const { t } = useTranslation();
  const { broadcasts, loadBroadcasts, createBroadcast, revokeBroadcast } = useSuperEmergency();
  const { organizations, loadOrganizations } = useOrganization();

  useEffect(() => {
    loadBroadcasts().catch(() => {});
    loadOrganizations().catch(() => {});
  }, [loadBroadcasts, loadOrganizations]);

  const broadcastsList = Array.isArray(broadcasts)
    ? broadcasts
    : (Array.isArray(broadcasts?.rows)
        ? broadcasts.rows
        : (Array.isArray(broadcasts?.items)
            ? broadcasts.items
            : (Array.isArray(broadcasts?.broadcasts)
                ? broadcasts.broadcasts
                : [])));
  const tenantsList = Array.isArray(organizations)
    ? organizations
    : (Array.isArray(organizations?.rows) ? organizations.rows : []);

  const [title, setTitle] = useState('');
  const [authority, setAuthority] = useState('National Disaster Management Authority (NDMA)');
  const [severity, setSeverity] = useState('Critical - Level 1 (Instant Ad Preemption)');
  const [targetScope, setTargetScope] = useState('ALL_MULTI_TENANT_FLEETS');
  const [headline, setHeadline] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [sirenSound, setSirenSound] = useState(true);

  const handleLaunch = async (e) => {
    e.preventDefault();
    const payload = {
      title: title || headline,
      authority,
      severity,
      targetScope,
      headline,
      bodyText,
      sirenSound,
    };
    try {
      await toast.promise(
        createBroadcast(payload).then(() => loadBroadcasts()),
        { loading: t('emergency.broadcast_now', 'Publishing Emergency Override...'), success: t('common.success', 'Emergency Override Active!'), error: (e) => e.message || 'Failed to broadcast.' }
      );
      setTitle('');
      setHeadline('');
      setBodyText('');
    } catch (err) {}
  };

  const handleStopBroadcast = async (id) => {
    try {
      await toast.promise(
        revokeBroadcast(id).then(() => loadBroadcasts()),
        { loading: t('emergency.revoke_alert', 'Revoking Broadcast...'), success: t('common.success', 'Broadcast Revoked!'), error: (e) => e.message || 'Failed to revoke.' }
      );
    } catch (err) {}
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400">
        <Link to="/superadmin/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
          <FleetIcons.Dashboard className="w-3.5 h-3.5" />
          <span>Super Admin</span>
        </Link>
        <span className="text-slate-300 dark:text-zinc-600">/</span>
        <Link to="/superadmin/campaigns" className="text-blue-600 dark:text-blue-400 hover:underline">
          Campaigns Hub
        </Link>
        <span className="text-slate-300 dark:text-zinc-600">/</span>
        <span className="text-red-600 dark:text-red-400 font-bold">Emergency Broadcast</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              to="/superadmin/campaigns"
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            >
              ←
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-red-600 tracking-tight flex items-center gap-2">
              <FleetIcons.Siren className="w-6 h-6 text-red-600 animate-pulse shrink-0" />
              <span>{t('emergency.console_title', 'Sovereign Emergency Broadcast Override')}</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            {t('emergency.console_sub', 'Preempt all commercial ad loops instantly across RK3588 display players with public safety notices')}
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full self-start sm:self-auto">
          {broadcastsList.length} {t('emergency.active_overrides', 'Active Overrides Live')}
        </span>
      </div>

      {/* Active Broadcasts Panel */}
      {broadcastsList.length > 0 && (
        <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-5 shadow-md space-y-3 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-ping"></span>
              <h2 className="text-sm font-black text-red-900 uppercase tracking-wider">
                {t('emergency.preempting_desc', 'Currently Live On Displays')}
              </h2>
            </div>
          </div>

          <div className="divide-y divide-red-200/80">
            {broadcastsList.map((b) => (
              <div key={b.id} className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-red-700">{b.id}</span>
                    <h3 className="text-sm font-bold text-red-950">{b.title || b.headline}</h3>
                  </div>
                  <p className="text-xs text-red-800 font-medium mt-0.5">{b.bodyText}</p>
                  <div className="text-[11px] text-red-600 font-bold mt-1">
                    Issued by: {b.authority || '—'} · Dispatched at {b.createdAt || b.created_at || 'now'}
                  </div>
                </div>

                <button
                  onClick={() => handleStopBroadcast(b.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all self-start sm:self-auto shrink-0 flex items-center gap-1.5"
                >
                  <FleetIcons.Stop className="w-3.5 h-3.5 text-white" />
                  <span>{t('emergency.revoke_alert', 'Stop & Resume Ads')}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trigger New Override Form */}
      <form onSubmit={handleLaunch} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            {t('emergency.issue_alert', 'Compose Safety Notice / High-Priority Override')}
          </h2>
          <p className="text-xs text-slate-500 font-medium">{t('emergency.console_sub', 'Broadcasted via MQTT QoS 1 to all connected RK3588 Edge boxes')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('emergency.alert_type', 'Issuing Sovereign Authority')} *</label>
            <select
              value={authority}
              onChange={(e) => setAuthority(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="National Disaster Management Authority (NDMA)">National Disaster Management Authority (NDMA)</option>
              <option value="State Traffic Police & Home Department">State Traffic Police & Home Department</option>
              <option value="India Meteorological Department (IMD Cyclone / Flood Warning)">India Meteorological Department (IMD)</option>
              <option value="Municipal Transit Safety Directorate">Municipal Transit Safety Directorate</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('emergency.affected_screens', 'Target Fleets & Depots Scope')} *</label>
            <select
              value={targetScope}
              onChange={(e) => setTargetScope(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="ALL_MULTI_TENANT_FLEETS">ALL Fleets & Multi-Tenant Networks (National/Citywide)</option>
              {tenantsList.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} Only ({t.city} - {t.buses_quota ?? t.busesCount ?? 0} Buses)
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('emergency.broadcast_title', 'Screen Display Headline (Fullscreen Alert)')} *</label>
            <input
              type="text"
              required
              placeholder="e.g. FLASH FLOOD ADVISORY: HEAVY RAINFALL IN ANDHERI-BANDRA CORRIDOR"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-red-600 focus:ring-2 focus:ring-red-300 focus:outline-none uppercase"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('common.description', 'Detailed Passenger Safety Instructions')} *</label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Commuters are advised to stay inside vehicle until further notice. Bus is operating on restricted speed. Emergency helpline: 112."
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-red-300 focus:outline-none"
            />
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="sirenAudio"
              checked={sirenSound}
              onChange={(e) => setSirenSound(e.target.checked)}
              className="w-4 h-4 accent-red-600 rounded"
            />
            <label htmlFor="sirenAudio" className="text-xs font-bold text-slate-800 cursor-pointer">
              Play In-Vehicle Chime / Audio Siren Tone on Edge Boxes
            </label>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">85dB Safety Audio Pulse</span>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3">
          <Link
            to="/superadmin/campaigns"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors text-center"
          >
            {t('common.cancel', 'Cancel')}
          </Link>
          <button
            type="submit"
            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <FleetIcons.Alert className="w-4 h-4 text-white" />
            <span>{t('emergency.broadcast_now', 'Launch Immediate Emergency Override')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
