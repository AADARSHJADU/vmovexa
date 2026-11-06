// Vitest's JSX transform for this module expects React in module scope.
// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useGovernmentRole } from '../../hooks/government/useGovernmentRole';
import { useAdvertiserRole } from '../../hooks/advertiser/useAdvertiserRole';
import { RouteVehicleScreenPicker } from '../../components/campaign/RouteVehicleScreenPicker';
import { EmergencyCreativeEditor, uploadEmergencyMedia, readEmergencyMedia } from '../../components/campaign/EmergencyCreativeEditor';

export const GovEditEmergencyBroadcastPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isSuperAdmin = location.pathname.startsWith('/superadmin');
  const dashboardPath = isSuperAdmin ? '/superadmin/dashboard' : '/government/dashboard';
  const parentLabel = isSuperAdmin ? 'Super Admin' : 'Government';
  const listPath = isSuperAdmin ? '/superadmin/government/emergency' : '/government/emergency';
  const detailsPath = `${listPath}/${id}`;

  const { loadBroadcastById, updateBroadcast } = useGovernmentRole();
  const { fleetOptions, loadFleetOptions } = useAdvertiserRole();

  const [broadcast, setBroadcast] = useState(null);
  const [loadingBroadcast, setLoadingBroadcast] = useState(true);

  const [headline, setHeadline] = useState('');
  const [emergencyNumber, setEmergencyNumber] = useState('');
  const [severity, setSeverity] = useState('Critical');
  const [targetAllScreens, setTargetAllScreens] = useState(true);
  const [selectedTargets, setSelectedTargets] = useState([]);
  const [pushNotification, setPushNotification] = useState(true);
  const [autoExpire, setAutoExpire] = useState('6 Hours');

  const [mediaItems, setMediaItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFleetOptions().catch(() => {});
  }, [loadFleetOptions]);

  // Load existing broadcast data
  useEffect(() => {
    if (!id) return;
    loadBroadcastById(id)
      .then((data) => {
        setBroadcast(data);
        if (data) {
          setHeadline(data.headline || data.title || '');
          setEmergencyNumber(data.emergency_number || data.emergencyNumber || '');
          if (data.severity) {
            const formattedSev = data.severity.charAt(0).toUpperCase() + data.severity.slice(1).toLowerCase();
            setSeverity(['Critical', 'High', 'Medium', 'Low'].includes(formattedSev) ? formattedSev : 'Critical');
          }
          setTargetAllScreens(data.target_scope === 'all');
          if (Array.isArray(data.target_routes) && data.target_routes.length > 0) {
            setSelectedTargets(data.target_routes);
          }
          setPushNotification(data.push_notification !== false);

          if (data.auto_expire) {
            const minMap = { '120m': '2 Hours', '360m': '6 Hours', '720m': '12 Hours', '1440m': '24 Hours' };
            setAutoExpire(minMap[data.auto_expire] || data.auto_expire);
          }

          setMediaItems(readEmergencyMedia(data));
        }
      })
      .catch((err) => {
        toast.error(err?.message || 'Failed to load broadcast for editing.');
      })
      .finally(() => {
        setLoadingBroadcast(false);
      });
  }, [id, loadBroadcastById]);

  const expireToMinutes = (label) => {
    const map = { '2 Hours': 120, '6 Hours': 360, '12 Hours': 720, '24 Hours': 1440 };
    return map[label] || 360;
  };

  const handleSaveUpdate = async () => {
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
      emergencyNumber: emergencyNumber.trim() || null,
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
      await toast.promise(updateBroadcast(id, payload), {
        loading: 'Updating emergency broadcast advisory…',
        success: 'Emergency broadcast updated successfully!',
        error: (e) => e?.message || 'Failed to update broadcast.',
      });
      navigate(detailsPath);
    } catch {
      /* toast.promise displays the update error */
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingBroadcast) {
    return (
      <div className="w-full space-y-6 pb-12 animate-pulse">
        <div className="h-6 w-48 bg-slate-200 dark:bg-zinc-800 rounded"></div>
        <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl h-36"></div>
        <div className="h-96 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl"></div>
      </div>
    );
  }

  const isAct = broadcast?.active === true || broadcast?.active === 1 || String(broadcast?.active) === 'true';
  const st = String(broadcast?.status || '').toLowerCase();
  const isApproved = st === 'approved';
  const isLocked = isApproved || isAct || st === 'revoked' || st === 'expired';

  // CRUCIAL RULE: If already approved or active, EDIT IS BLOCKED
  if (isLocked) {
    return (
      <div className="w-full space-y-6 pb-12 animate-in fade-in duration-200">
        <Breadcrumb
          items={[
            { label: isSuperAdmin ? t('nav.superadmin', 'Super Admin') : t('nav.government', 'Government'), path: dashboardPath, icon: FleetIcons.Dashboard },
            { label: t('gov.emergency.emergency_broadcasts', 'Emergency Broadcasts'), path: listPath },
            { label: broadcast?.code || `${t('gov.emergency.alert_number', 'Alert #')}${id}`, path: detailsPath },
            { label: t('gov.emergency.edit_locked', 'Edit Locked') },
          ]}
          className="mb-1"
        />

        <div className="p-8 sm:p-12 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
            <FleetIcons.Lock className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('ag.government.goveditemergencybroadcastpage.modification_locked', 'Modification Locked')}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
            {t('ag.government.goveditemergencybroadcastpage.this_emergency_broadcast_has_already_been', 'This emergency broadcast has already been')} <b>{isApproved ? 'Approved' : isAct ? 'Activated' : 'Finalized'}</b>{t('ag.government.goveditemergencybroadcastpage.for_public_safety_and_regulatory_compliance_', '. For public safety and regulatory compliance, live transit override broadcasts cannot be modified after approval.')}
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              to={detailsPath}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              {t('ag.government.goveditemergencybroadcastpage.view_broadcast_details', 'View Broadcast Details')}
            </Link>
            <Link
              to={listPath}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-colors cursor-pointer border border-slate-200 dark:border-zinc-800"
            >
              {t('ag.government.goveditemergencybroadcastpage.back_to_list', 'Back to List')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <Breadcrumb
            items={[
              { label: isSuperAdmin ? t('nav.superadmin', 'Super Admin') : t('nav.government', 'Government'), path: dashboardPath, icon: FleetIcons.Dashboard },
              { label: t('gov.emergency.emergency_broadcasts', 'Emergency Broadcasts'), path: listPath },
              { label: broadcast?.code || `${t('gov.emergency.alert_number', 'Alert #')}${id}`, path: detailsPath },
              { label: t('gov.emergency.edit_broadcast', 'Edit Broadcast') },
            ]}
            className="mb-2"
          />
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('ag.government.goveditemergencybroadcastpage.edit_emergency_broadcast', 'Edit Emergency Broadcast')}
            </h1>
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60">
              {t('ag.government.goveditemergencybroadcastpage.pending_approval', 'PENDING APPROVAL')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium">
            {t('ag.government.goveditemergencybroadcastpage.update_alert_message_visual_creative_and_rou', 'Update alert message, visual creative, and route preemption targets before Super Admin verification')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={detailsPath}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-zinc-800 cursor-pointer"
          >
            <FleetIcons.Eye className="w-3.5 h-3.5 text-blue-500" />
            <span>{t('gov.emergency.view_current_details')}</span>
          </Link>
          <Link
            to={listPath}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-zinc-800 cursor-pointer"
          >
            <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('common.back')}</span>
          </Link>
        </div>
      </div>

      {/* 2. Notice Card */}
      <div className="w-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-5 flex items-center gap-3.5 text-amber-900 dark:text-amber-200 text-xs">
        <FleetIcons.Info className="w-5 h-5 text-amber-600 shrink-0" />
        <div>
          <span className="font-bold">{t('common.pending_review')}:</span>
          <span className="ml-1">{t('gov.emergency.pending_mode_desc')}</span>
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
            onChange={(e) => setHeadline(e.target.value)}
            placeholder={t('ag.government.govemergencybroadcastpage.e_g_cyclone_warning_coastal_highway_route_pr', 'e.g. Cyclone Warning: Coastal Highway Route Precaution')}
            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/60 text-xs text-slate-900 dark:text-white placeholder-slate-400 font-bold focus:bg-white dark:focus:bg-zinc-800 focus:border-red-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Emergency Contact Number */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
            {t('ag.government.govemergencybroadcastpage.emergency_number', 'Emergency Number')} <span className="text-slate-400 font-normal">{t('gov.emergency.optional')}</span>
          </label>
          <input
            type="text"
            maxLength={40}
            value={emergencyNumber}
            onChange={(e) => setEmergencyNumber(e.target.value)}
            placeholder={t('ag.government.govemergencybroadcastpage.emergency_number_ph', 'e.g. 112 / 1800-123-4567')}
            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/60 text-xs text-slate-900 dark:text-white placeholder-slate-400 font-bold focus:bg-white dark:focus:bg-zinc-800 focus:border-red-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Severity Level */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('common.severity')}</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { level: 'Critical', desc: 'Full Screen Flash', icon: <FleetIcons.Siren className="w-5 h-5 text-red-600 animate-pulse mx-auto mb-1" /> },
              { level: 'High', desc: 'Top Banner Override', icon: <FleetIcons.Alert className="w-5 h-5 text-amber-500 mx-auto mb-1" /> },
              { level: 'Medium', desc: 'Ticker Scroll', icon: <FleetIcons.Megaphone className="w-5 h-5 text-blue-500 mx-auto mb-1" /> },
              { level: 'Low', desc: 'Standard Loop', icon: <FleetIcons.Info className="w-5 h-5 text-slate-500 dark:text-zinc-400 mx-auto mb-1" /> },
            ].map((item) => (
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
                <p className="text-xs font-bold text-slate-900 dark:text-white">{item.level}</p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <EmergencyCreativeEditor items={mediaItems} onChange={setMediaItems} emergencyNumber={emergencyNumber} disabled={submitting} />

        {/* Preemption Scope Selection */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('gov.emergency.target_network_scope')}</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => setTargetAllScreens(true)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                targetAllScreens
                  ? 'border-red-600 dark:border-red-500 bg-red-50/60 dark:bg-red-950/30 text-slate-900 dark:text-white'
                  : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40 text-slate-600 dark:text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <FleetIcons.Megaphone className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-xs font-bold">{t('gov.emergency.entire_transit_network')}</p>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">{t('gov.emergency.all_screens_desc')}</p>
                </div>
              </div>
              <input type="radio" checked={targetAllScreens} readOnly className="accent-red-600 w-4 h-4 cursor-pointer" />
            </div>

            <div
              onClick={() => setTargetAllScreens(false)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                !targetAllScreens
                  ? 'border-red-600 dark:border-red-500 bg-red-50/60 dark:bg-red-950/30 text-slate-900 dark:text-white'
                  : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40 text-slate-600 dark:text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <FleetIcons.Target className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xs font-bold">{t('gov.emergency.specific_routes_fleets')}</p>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">{t('gov.emergency.target_corridors_desc')}</p>
                </div>
              </div>
              <input type="radio" checked={!targetAllScreens} readOnly className="accent-red-600 w-4 h-4 cursor-pointer" />
            </div>
          </div>

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
              type="button"
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
              onChange={(e) => setAutoExpire(e.target.value)}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-900 dark:text-white rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="2 Hours">{t('gov.emergency.duration_2h')}</option>
              <option value="6 Hours">{t('gov.emergency.duration_6h')}</option>
              <option value="12 Hours">{t('gov.emergency.duration_12h')}</option>
              <option value="24 Hours">{t('gov.emergency.duration_24h')}</option>
            </select>
          </div>
        </div>

        {/* Save & Cancel CTA */}
        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-3">
          <Link
            to={detailsPath}
            className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-colors cursor-pointer border border-slate-200 dark:border-zinc-800"
          >
            {t('ag.government.goveditemergencybroadcastpage.cancel_and_keep_original', 'Cancel & Keep Original')}
          </Link>

          <button
            type="button"
            onClick={handleSaveUpdate}
            disabled={submitting}
            className="flex-1 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.99] disabled:opacity-50 text-white text-xs sm:text-sm font-black tracking-wide transition-all shadow-md shadow-red-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <FleetIcons.Check className="w-4 h-4 text-white" />
            <span>{submitting ? 'SAVING MODIFICATIONS…' : 'SAVE BROADCAST MODIFICATIONS'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GovEditEmergencyBroadcastPage;
