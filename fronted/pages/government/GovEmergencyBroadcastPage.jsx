// Vitest's JSX transform for this module expects React in module scope.
// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useGovernmentRole } from '../../hooks/government/useGovernmentRole';
import { useAdvertiserRole } from '../../hooks/advertiser/useAdvertiserRole';
import { RouteVehicleScreenPicker } from '../../components/campaign/RouteVehicleScreenPicker';
import { EmergencyCreativeEditor, uploadEmergencyMedia } from '../../components/campaign/EmergencyCreativeEditor';

export const GovEmergencyBroadcastPage = () => {
  const { t } = useTranslation();
  const { createBroadcast } = useGovernmentRole();
  const { fleetOptions, loadFleetOptions } = useAdvertiserRole();
  const navigate = useNavigate();
  const location = useLocation();

  const isSuperAdmin = location.pathname.startsWith('/superadmin');
  const dashboardPath = isSuperAdmin ? '/superadmin/dashboard' : '/government/dashboard';
  const parentLabel = isSuperAdmin ? 'Super Admin' : 'Government';
  const listPath = isSuperAdmin ? '/superadmin/government/emergency' : '/government/emergency';

  const [headline, setHeadline] = useState('');
  const [emergencyNumber, setEmergencyNumber] = useState('');
  const [severity, setSeverity] = useState('Critical');
  const [targetAllScreens, setTargetAllScreens] = useState(true);
  const [selectedTargets, setSelectedTargets] = useState([]);
  const [pushNotification, setPushNotification] = useState(true);
  const [autoExpire, setAutoExpire] = useState('6 Hours');

  // Media attachment (image/video) shown on screens during the override.
  const [mediaItems, setMediaItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFleetOptions().catch(() => {});
  }, [loadFleetOptions]);

  const expireToMinutes = (label) => {
    const map = { '2 Hours': 120, '6 Hours': 360, '12 Hours': 720, '24 Hours': 1440 };
    return map[label] || 360;
  };

  const handleBroadcast = async () => {
    if (!headline.trim()) {
      toast.error('Please enter the alert broadcast headline.');
      return;
    }
    if (!mediaItems.length) {
      toast.error('Please attach an emergency visual (image, video or PDF).');
      return;
    }
    if (!targetAllScreens && selectedTargets.length === 0) {
      toast.error('Select at least one route/vehicle, or choose "All Screens".');
      return;
    }
    const targets = targetAllScreens ? [] : selectedTargets.map((t) => ({
      routeId: t.routeId,
      organizationId: t.organizationId,
      vehicleIds: t.vehicleIds || [],
      routeName: t.routeName,
      city: t.city,
    }));
    const finalHeadline = headline.trim();
    const payload = {
      title: `${finalHeadline}: Transit Override`,
      headline: finalHeadline,
      severity,
      emergencyNumber: emergencyNumber.trim() || undefined,
      tickerText: null,
      targetArea: (targetAllScreens ? 'Entire Network' : (selectedTargets[0]?.city || null)),
      targetScope: targetAllScreens ? 'all' : 'partial',
      pushNotification,
      targets,
      autoExpireMinutes: expireToMinutes(autoExpire),
    };
    setSubmitting(true);
    try {
      const media = await toast.promise(uploadEmergencyMedia(mediaItems), { loading: 'Uploading creative assets...', success: 'Creative assets ready', error: e => e?.message || 'Media upload failed' });
      Object.assign(payload, { media, mediaUrl: media[0]?.mediaUrl || null, mediaType: media[0]?.mediaType || null });
      await toast.promise(createBroadcast(payload), {
        loading: 'Submitting emergency broadcast override...',
        success: isSuperAdmin
          ? 'Emergency broadcast submitted!'
          : 'Submitted! Awaiting SuperAdmin verification before it goes live.',
        error: (e) => e?.message || 'Failed to submit emergency',
      });
      setHeadline('');
      setEmergencyNumber('');
      setMediaItems([]);
      setSelectedTargets([]);
      navigate(listPath);
    } catch {
      /* toast surfaced the error */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">

      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <Breadcrumb
            items={[
              { label: isSuperAdmin ? t('nav.superadmin', 'Super Admin') : t('nav.government', 'Government'), path: dashboardPath, icon: FleetIcons.Dashboard },
              { label: t('gov.emergency.emergency_broadcasts', 'Emergency Broadcasts'), path: listPath },
              { label: t('gov.emergency.new_broadcast', 'New Override Broadcast') },
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">{t('common.emergency_broadcast')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium">{t('gov.dashboard.channel_title')}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={listPath}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-zinc-800 cursor-pointer"
          >
            <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('gov.emergency.back_to_broadcasts')}</span>
          </Link>
          {isSuperAdmin && (
            <Link
              to="/superadmin/emergency-approvals"
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-zinc-800"
            >
              <FleetIcons.Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('gov.emergency.approvals')}</span>
            </Link>
          )}
          <span className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/60 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
            {t('ag.government.govemergencybroadcastpage.broadcast_channel_active', 'Broadcast Channel Active')}
          </span>
        </div>
      </div>

      {/* 2. Top Hero Alert Warning Card (Fixed for Dark Mode) */}
      <div className="w-full bg-gradient-to-r from-red-50 via-rose-50/70 to-orange-50/60 dark:from-red-950/40 dark:via-rose-950/30 dark:to-zinc-900 border border-red-200 dark:border-red-900/60 rounded-2xl p-6 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 shadow-sm animate-pulse">
          <FleetIcons.Alert className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h2 className="text-sm sm:text-base font-black text-red-950 dark:text-red-300 tracking-tight">{t('gov.emergency.high_priority_transmitter')}</h2>
          <p className="text-xs text-red-800 dark:text-red-400 mt-0.5 leading-relaxed">
            {t('ag.government.govemergencybroadcastpage.submissions_require', 'Submissions require')} <b className="text-red-950 dark:text-red-200">{t('gov.emergency.awaiting_superadmin')}</b>{t('ag.government.govemergencybroadcastpage.once_approved_the_advisory_freezes_current_c', '. Once approved, the advisory freezes current commercial ads and displays on all selected transit screens.')}
          </p>
        </div>
      </div>

      {/* 3. Form Controls */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
        {/* Alert Headline */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              {t('ag.government.govemergencybroadcastpage.alert_broadcast_headline', 'Alert Broadcast Headline')} <span className="text-red-500">*</span>
            </label>
            <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">{headline.length}{t('ag.government.govemergencybroadcastpage.100_chars', '/100 chars')}</span>
          </div>
          <input
            type="text"
            maxLength={100}
            value={headline}
            onChange={e => setHeadline(e.target.value)}
            placeholder={t('ag.government.govemergencybroadcastpage.e_g_cyclone_warning_coastal_highway_route_pr', 'e.g. Cyclone Warning: Coastal Highway Route Precaution')}
            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/60 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 font-bold focus:bg-white dark:focus:bg-zinc-800 focus:border-red-500 dark:focus:border-red-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Emergency Contact Number (shown on screens) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
            {t('ag.government.govemergencybroadcastpage.emergency_number', 'Emergency Number')} <span className="text-slate-400 font-normal">{t('gov.emergency.optional')}</span>
          </label>
          <input
            type="text"
            maxLength={40}
            value={emergencyNumber}
            onChange={e => setEmergencyNumber(e.target.value)}
            placeholder={t('ag.government.govemergencybroadcastpage.emergency_number_ph', 'e.g. 112 / 1800-123-4567')}
            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/60 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 font-bold focus:bg-white dark:focus:bg-zinc-800 focus:border-red-500 dark:focus:border-red-500 focus:outline-none transition-colors"
          />
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
            {t('ag.government.govemergencybroadcastpage.emergency_number_hint', 'This helpline number is overlaid on the transit screen during the broadcast.')}
          </p>
        </div>

        {/* Severity Level */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('common.severity')}</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { level: 'Critical', desc: t('gov.emergency.full_screen_flash', 'Full Screen Flash'), icon: <FleetIcons.Siren className="w-5 h-5 text-red-600 animate-pulse mx-auto mb-1" /> },
              { level: 'High', desc: t('gov.emergency.top_banner_override', 'Top Banner Override'), icon: <FleetIcons.Alert className="w-5 h-5 text-amber-500 mx-auto mb-1" /> },
              { level: 'Medium', desc: t('gov.emergency.ticker_scroll', 'Ticker Scroll'), icon: <FleetIcons.Megaphone className="w-5 h-5 text-blue-500 mx-auto mb-1" /> },
              { level: 'Low', desc: t('gov.emergency.standard_loop', 'Standard Loop'), icon: <FleetIcons.Info className="w-5 h-5 text-slate-500 dark:text-zinc-400 mx-auto mb-1" /> },
            ].map(item => (
              <div
                key={item.level}
                onClick={() => setSeverity(item.level)}
                className={`p-3.5 rounded-xl border cursor-pointer text-center transition-all ${
                  severity === item.level
                    ? 'border-red-600 dark:border-red-500 bg-red-50/70 dark:bg-red-950/30 shadow-sm text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <div className="flex justify-center">{item.icon}</div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{t(`common.${item.level.toLowerCase()}`, item.level)}</p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <EmergencyCreativeEditor items={mediaItems} onChange={setMediaItems} emergencyNumber={emergencyNumber} disabled={submitting} />

        {/* Broadcast Target Scope: All screens OR specific routes/vehicles */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('gov.emergency.target_scope')}</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => setTargetAllScreens(true)}
              className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${targetAllScreens ? 'border-red-500 dark:border-red-500 bg-red-50/40 dark:bg-red-950/30' : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
            >
              <div className="flex items-center gap-3">
                <span className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400"><FleetIcons.Globe className="w-5 h-5" /></span>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{t('gov.emergency.all_screens_opt')}</p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('gov.emergency.all_screens_desc')}</p>
                </div>
              </div>
              <input type="radio" checked={targetAllScreens} readOnly className="accent-red-600 w-4 h-4 cursor-pointer" />
            </div>
            <div
              onClick={() => setTargetAllScreens(false)}
              className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${!targetAllScreens ? 'border-red-500 dark:border-red-500 bg-red-50/40 dark:bg-red-950/30' : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
            >
              <div className="flex items-center gap-3">
                <span className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400"><FleetIcons.Target className="w-5 h-5" /></span>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{t('gov.emergency.specific_routes_opt')}</p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('gov.emergency.specific_routes_desc')}</p>
                </div>
              </div>
              <input type="radio" checked={!targetAllScreens} readOnly className="accent-red-600 w-4 h-4 cursor-pointer" />
            </div>
          </div>

          {/* Route → Vehicle → Screen picker (real fleet data) */}
          {!targetAllScreens && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30">
              <RouteVehicleScreenPicker
                fleetOptions={fleetOptions}
                value={selectedTargets}
                onChange={setSelectedTargets}
              />
            </div>
          )}
        </div>

        {/* Toggles & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">{t('gov.emergency.send_push_notification')}</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('gov.emergency.notify_crew')}</p>
            </div>
            <button
              onClick={() => setPushNotification(!pushNotification)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${pushNotification ? 'bg-red-600' : 'bg-slate-300 dark:bg-zinc-700'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 left-1 ${pushNotification ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">{t('gov.emergency.auto_expire_alert')}</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('gov.emergency.resume_regular')}</p>
            </div>
            <select
              value={autoExpire}
              onChange={e => setAutoExpire(e.target.value)}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-900 dark:text-white rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="2 Hours">{t('gov.emergency.duration_2h')}</option>
              <option value="6 Hours">{t('gov.emergency.duration_6h')}</option>
              <option value="12 Hours">{t('gov.emergency.duration_12h')}</option>
              <option value="24 Hours">{t('gov.emergency.duration_24h')}</option>
            </select>
          </div>
        </div>

        {/* Big Broadcast CTA */}
        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
          <button
            onClick={handleBroadcast}
            disabled={submitting}
            className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 disabled:opacity-50 active:scale-[0.99] text-white text-sm font-black tracking-wide transition-all shadow-md shadow-red-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <FleetIcons.Siren className="w-5 h-5 animate-pulse text-white" />
            <span>{submitting ? t('gov.emergency.transmitting', 'TRANSMITTING OVERRIDE…') : isSuperAdmin ? t('gov.emergency.submit_broadcast', 'SUBMIT EMERGENCY BROADCAST') : t('gov.emergency.submit_for_superadmin', 'SUBMIT FOR SUPER ADMIN APPROVAL')}</span>
          </button>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 text-center mt-2">
            {t('ag.government.govemergencybroadcastpage.after', 'After')} {t('gov.emergency.awaiting_superadmin')}{t('ag.government.govemergencybroadcastpage.this_override_takes_precedence_over_all_sche', ', this override takes precedence over all scheduled commercial ad loops.')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GovEmergencyBroadcastPage;
