import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useGovernmentRole } from '../../hooks/government/useGovernmentRole';
import { useAdvertiserRole } from '../../hooks/advertiser/useAdvertiserRole';
import { RouteVehicleScreenPicker } from '../../components/campaign/RouteVehicleScreenPicker';
import { uploadFile, uploadVideo, resolveFileUrl } from '../../api/services/upload.service.js';

const OFFICIAL_PRESETS = [
  {
    id: 'siren',
    title: 'Critical Siren Alert',
    badge: 'RED ALERT',
    desc: 'High-visibility red border with hazard triangle and civil defense alert banner.',
    svg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><rect width="1280" height="720" fill="%23b91c1c"/><rect x="24" y="24" width="1232" height="672" rx="20" fill="%2309090b" stroke="%23ef4444" stroke-width="8"/><polygon points="640,130 760,350 520,350" fill="%23ef4444" stroke="%23ffffff" stroke-width="6"/><rect x="630" y="210" width="20" height="70" rx="10" fill="%23ffffff"/><circle cx="640" cy="315" r="12" fill="%23ffffff"/><text x="640" y="440" font-family="system-ui,sans-serif" font-size="44" font-weight="900" fill="%23ffffff" text-anchor="middle" letter-spacing="4">CRITICAL EMERGENCY ADVISORY</text><text x="640" y="500" font-family="system-ui,sans-serif" font-size="28" font-weight="700" fill="%23fca5a5" text-anchor="middle">OFFICIAL CIVIL DEFENSE TRANSIT SCREEN OVERRIDE</text><rect x="160" y="560" width="960" height="64" rx="14" fill="%23dc2626"/><text x="640" y="602" font-family="monospace" font-size="22" font-weight="800" fill="%23ffffff" text-anchor="middle">ALL COMMUTERS · FOLLOW SAFETY GUIDELINES &amp; TRANSIT CREW</text></svg>',
  },
  {
    id: 'detour',
    title: 'Route Detour Alert',
    badge: 'ROUTE DETOUR',
    desc: 'Amber graphic informing passengers of corridor blockades and rerouted buses.',
    svg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><rect width="1280" height="720" fill="%23c2410c"/><rect x="24" y="24" width="1232" height="672" rx="20" fill="%2309090b" stroke="%23f97316" stroke-width="8"/><circle cx="640" cy="240" r="100" fill="%23ea580c"/><polygon points="610,180 670,180 670,250 710,250 640,320 570,250 610,250" fill="%23ffffff"/><text x="640" y="430" font-family="system-ui,sans-serif" font-size="42" font-weight="900" fill="%23ffffff" text-anchor="middle" letter-spacing="3">TRANSIT ROUTE DEVIATION ADVISORY</text><text x="640" y="490" font-family="system-ui,sans-serif" font-size="26" font-weight="700" fill="%23fed7aa" text-anchor="middle">MAJOR ROAD OBSTRUCTION &amp; TRANSIT DETOUR IN EFFECT</text><rect x="160" y="560" width="960" height="64" rx="14" fill="%23ea580c"/><text x="640" y="602" font-family="monospace" font-size="22" font-weight="800" fill="%23ffffff" text-anchor="middle">BUS SERVICES REROUTED · COMMUTERS EXPECT EXTRA TRAVEL TIME</text></svg>',
  },
  {
    id: 'weather',
    title: 'Severe Weather Warning',
    badge: 'WEATHER BULLETIN',
    desc: 'Disaster management graphic for storms, flood advisories or heatwaves.',
    svg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><rect width="1280" height="720" fill="%230369a1"/><rect x="24" y="24" width="1232" height="672" rx="20" fill="%2309090b" stroke="%2338bdf8" stroke-width="8"/><circle cx="640" cy="240" r="100" fill="%230284c7"/><path d="M640 170 Q690 230 690 270 A50 50 0 0 1 590 270 Q590 230 640 170 Z" fill="%23ffffff"/><text x="640" y="430" font-family="system-ui,sans-serif" font-size="42" font-weight="900" fill="%23ffffff" text-anchor="middle" letter-spacing="3">PUBLIC SAFETY WEATHER BULLETIN</text><text x="640" y="490" font-family="system-ui,sans-serif" font-size="26" font-weight="700" fill="%23bae6fd" text-anchor="middle">MUNICIPAL DISASTER MANAGEMENT AUTHORITY</text><rect x="160" y="560" width="960" height="64" rx="14" fill="%230284c7"/><text x="640" y="602" font-family="monospace" font-size="22" font-weight="800" fill="%23ffffff" text-anchor="middle">REMAIN CAUTIOUS · CITIZENS URGED TO MONITOR LOCAL UPDATES</text></svg>',
  },
];

export const GovEmergencyBroadcastPage = () => {
  const { t } = useTranslation();
  const { createBroadcast } = useGovernmentRole();
  const { fleetOptions, loadFleetOptions } = useAdvertiserRole();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  const isSuperAdmin = location.pathname.startsWith('/superadmin');
  const dashboardPath = isSuperAdmin ? '/superadmin/dashboard' : '/government/dashboard';
  const parentLabel = isSuperAdmin ? 'Super Admin' : 'Government';
  const listPath = isSuperAdmin ? '/superadmin/government/emergency' : '/government/emergency';

  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('Critical');
  const [targetArea, setTargetArea] = useState('');
  const [targetAllScreens, setTargetAllScreens] = useState(true);
  const [selectedTargets, setSelectedTargets] = useState([]);
  const [pushNotification, setPushNotification] = useState(true);
  const [autoExpire, setAutoExpire] = useState('6 Hours');

  // Media attachment (image/video) shown on screens during the override.
  const [media, setMedia] = useState(null); // { url, type, name, previewUrl }
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFleetOptions().catch(() => {});
  }, [loadFleetOptions]);

  const handleMediaSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate format & size
    const isVideo = file.type.startsWith('video/');
    const maxBytes = isVideo ? 500 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(`File is too large (${Math.round(file.size / (1024 * 1024))}MB). Maximum limit is ${isVideo ? '500MB' : '50MB'}.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const previewUrl = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : '';
    setUploadingMedia(true);
    try {
      const res = isVideo ? await uploadVideo(file) : await uploadFile(file, 'emergency');
      const rel = res?.url || res?.data?.url;
      const full = resolveFileUrl(rel) || rel;
      setMedia({ url: full, type: isVideo ? 'video' : 'image', name: file.name, previewUrl: previewUrl || full });
      toast.success(`Attached ${isVideo ? 'video' : 'image'}: ${file.name}`);
    } catch (err) {
      toast.error(err?.message || 'Upload failed');
    } finally {
      setUploadingMedia(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAttachCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    const url = customUrlInput.trim();
    const isVid = /\.(mp4|webm|mov|mkv)(\?.*)?$/i.test(url);
    setMedia({
      url,
      type: isVid ? 'video' : 'image',
      name: isVid ? 'Motion Video Feed' : 'Direct URL Graphic',
      previewUrl: url,
    });
    setCustomUrlInput('');
    setShowUrlInput(false);
    toast.success('Attached direct visual URL');
  };

  const handleApplyPreset = (preset) => {
    setMedia({
      url: preset.svg,
      type: 'image',
      name: preset.title,
      previewUrl: preset.svg,
    });
    toast.success(`Applied ${preset.title}`);
  };

  const handleRemoveMedia = () => {
    if (media?.previewUrl && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
      try { URL.revokeObjectURL(media.previewUrl); } catch {}
    }
    setMedia(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const expireToMinutes = (label) => {
    const map = { '2 Hours': 120, '6 Hours': 360, '12 Hours': 720, '24 Hours': 1440 };
    return map[label] || 360;
  };

  const handleBroadcast = async () => {
    if (!message.trim()) {
      toast.error('Please enter the emergency alert message.');
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
    const payload = {
      title: `${severity} Alert: Transit Override`,
      headline: `${severity} Alert`,
      severity,
      message,
      bodyText: message,
      tickerText: message,
      targetArea: targetArea || (targetAllScreens ? 'Entire Network' : (selectedTargets[0]?.city || null)),
      targetScope: targetAllScreens ? 'all' : 'partial',
      pushNotification,
      mediaUrl: media?.url || undefined,
      mediaType: media?.type || undefined,
      targets,
      autoExpireMinutes: expireToMinutes(autoExpire),
    };
    setSubmitting(true);
    try {
      await toast.promise(createBroadcast(payload), {
        loading: 'Submitting emergency broadcast override...',
        success: isSuperAdmin
          ? 'Emergency broadcast submitted!'
          : 'Submitted! Awaiting SuperAdmin verification before it goes live.',
        error: (e) => e?.message || 'Failed to submit emergency',
      });
      setMessage('');
      setMedia(null);
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
              { label: parentLabel, path: dashboardPath, icon: FleetIcons.Dashboard },
              { label: 'Emergency Broadcasts', path: listPath },
              { label: 'New Override Broadcast' },
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">{t('common.emergency_broadcast')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium">{t('gov.dashboard.channel_title')}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={listPath}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-zinc-700 cursor-pointer"
          >
            <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('gov.emergency.back_to_broadcasts')}</span>
          </Link>
          {isSuperAdmin && (
            <Link
              to="/superadmin/emergency-approvals"
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-zinc-700"
            >
              <FleetIcons.Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('gov.emergency.approvals')}</span>
            </Link>
          )}
          <span className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/60 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
            Broadcast Channel Active
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
            Submissions require <b className="text-red-950 dark:text-red-200">{t('gov.emergency.awaiting_superadmin')}</b>. Once approved, the advisory freezes current commercial ads and displays on all selected transit screens.
          </p>
        </div>
      </div>

      {/* 3. Form Controls */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
        {/* Alert Message */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              Alert Broadcast Message <span className="text-red-500">*</span>
            </label>
            <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">{message.length}/300 chars</span>
          </div>
          <textarea
            rows={3}
            maxLength={300}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={t('gov.emergency.type_message_ph')}
            className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:bg-white dark:focus:bg-zinc-800 focus:border-red-500 dark:focus:border-red-500 focus:outline-none leading-relaxed font-medium transition-colors"
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
                <p className="text-xs font-bold text-slate-900 dark:text-white">{item.level}</p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Media Attachment (image / video shown on screens) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FleetIcons.Image className="w-4 h-4 text-red-600 dark:text-red-400" />
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Emergency Visual Creative <span className="text-slate-400 font-normal">{t('gov.emergency.optional')}</span>
              </label>
            </div>
            {media ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                Active Visual ({media.type.toUpperCase()})
              </span>
            ) : (
              <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500">
                Text-only preemption mode if omitted
              </span>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onClick={(e) => { e.target.value = null; }}
            onChange={handleMediaSelect}
            className="hidden"
          />

          {media ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 flex flex-col sm:flex-row items-center gap-4">
                {media.type === 'image' ? (
                  <div className="w-full sm:w-36 h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 shrink-0 bg-zinc-950 flex items-center justify-center shadow-xs">
                    <img
                      src={media.previewUrl || media.url}
                      alt={media.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-full sm:w-36 h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 bg-black shrink-0 relative flex items-center justify-center shadow-xs">
                    <video
                      src={media.previewUrl || media.url}
                      className="w-full h-full object-contain"
                      muted
                      playsInline
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                      <FleetIcons.Video className="w-6 h-6 text-white drop-shadow" />
                    </div>
                  </div>
                )}

                <div className="min-w-0 flex-1 w-full space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{media.name}</p>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400">
                      {media.type}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 truncate">
                    {media.url.startsWith('data:') ? 'Official SVG Emergency Advisory Graphic' : media.url}
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Attached visual displays across all selected transit displays on broadcast activation.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingMedia}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Replace File
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveMedia}
                    className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 cursor-pointer transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Primary Upload Options Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingMedia}
                  className="p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-red-400 dark:hover:border-red-500 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer bg-slate-50/50 dark:bg-zinc-800/30 shadow-2xs"
                >
                  {uploadingMedia ? (
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FleetIcons.Image className="w-4 h-4 text-red-500" />
                  )}
                  <span>{uploadingMedia ? 'Uploading media asset (please wait)…' : 'Upload Image or Video (JPG, PNG, MP4)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="p-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/30 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <FleetIcons.Globe className="w-4 h-4 text-blue-500" />
                  <span>{showUrlInput ? 'Hide Direct URL Input' : 'Attach Direct HTTPS or Stream URL'}</span>
                </button>
              </div>

              {/* Direct URL Input Expandable Panel */}
              {showUrlInput && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder={t('gov.emergency.paste_media_url_ph')}
                    className="w-full flex-1 h-10 px-3.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-red-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAttachCustomUrl}
                    disabled={!customUrlInput.trim()}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-xs"
                  >
                    Attach URL
                  </button>
                </div>
              )}

              {/* 1-Click Instant Official Emergency Posters */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                    Instant Official Visual Presets (1-Click Apply)
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                    Verified Emergency Posters
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {OFFICIAL_PRESETS.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 hover:border-red-400 dark:hover:border-red-500 hover:bg-red-50/30 dark:hover:bg-red-950/20 transition-all cursor-pointer group flex flex-col justify-between space-y-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-red-600 text-white">
                            {preset.badge}
                          </span>
                          <FleetIcons.Siren className="w-3.5 h-3.5 text-red-600 group-hover:scale-110 transition-transform" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {preset.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-tight">
                          {preset.desc}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-red-600 dark:text-red-400 group-hover:underline flex items-center gap-1 pt-1">
                        <span>{t('gov.emergency.use_this_poster')}</span>
                        <FleetIcons.ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Target Area (free text label) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('gov.emergency.target_geo_area')}</label>
          <input
            type="text"
            value={targetArea}
            onChange={e => setTargetArea(e.target.value)}
            placeholder={t('gov.emergency.target_geo_ph')}
            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 font-medium focus:bg-white dark:focus:bg-zinc-800 focus:border-red-500 dark:focus:border-red-500 focus:outline-none transition-colors"
          />
        </div>

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
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-900 dark:text-white rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer"
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
            <span>{submitting ? 'TRANSMITTING OVERRIDE…' : isSuperAdmin ? 'SUBMIT EMERGENCY BROADCAST' : 'SUBMIT FOR SUPER ADMIN APPROVAL'}</span>
          </button>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 text-center mt-2">
            After {t('gov.emergency.awaiting_superadmin')}, this override takes precedence over all scheduled commercial ad loops.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GovEmergencyBroadcastPage;
