import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
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

export const GovEditEmergencyBroadcastPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  const isSuperAdmin = location.pathname.startsWith('/superadmin');
  const dashboardPath = isSuperAdmin ? '/superadmin/dashboard' : '/government/dashboard';
  const parentLabel = isSuperAdmin ? 'Super Admin' : 'Government';
  const listPath = isSuperAdmin ? '/superadmin/government/emergency' : '/government/emergency';
  const detailsPath = `${listPath}/${id}`;

  const { loadBroadcastById, updateBroadcast } = useGovernmentRole();
  const { fleetOptions, loadFleetOptions } = useAdvertiserRole();

  const [broadcast, setBroadcast] = useState(null);
  const [loadingBroadcast, setLoadingBroadcast] = useState(true);

  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('Critical');
  const [targetArea, setTargetArea] = useState('');
  const [targetAllScreens, setTargetAllScreens] = useState(true);
  const [selectedTargets, setSelectedTargets] = useState([]);
  const [pushNotification, setPushNotification] = useState(true);
  const [autoExpire, setAutoExpire] = useState('6 Hours');

  const [media, setMedia] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFleetOptions().catch(() => {});
  }, [loadFleetOptions]);

  // Load existing broadcast data
  useEffect(() => {
    if (!id) return;
    setLoadingBroadcast(true);
    loadBroadcastById(id)
      .then((data) => {
        setBroadcast(data);
        if (data) {
          setMessage(data.message || data.body_text || '');
          if (data.severity) {
            const formattedSev = data.severity.charAt(0).toUpperCase() + data.severity.slice(1).toLowerCase();
            setSeverity(['Critical', 'High', 'Medium', 'Low'].includes(formattedSev) ? formattedSev : 'Critical');
          }
          setTargetArea(data.target_area || '');
          setTargetAllScreens(data.target_scope === 'all');
          if (Array.isArray(data.target_routes) && data.target_routes.length > 0) {
            setSelectedTargets(data.target_routes);
          }
          setPushNotification(data.push_notification !== false);

          if (data.auto_expire) {
            const minMap = { '120m': '2 Hours', '360m': '6 Hours', '720m': '12 Hours', '1440m': '24 Hours' };
            setAutoExpire(minMap[data.auto_expire] || data.auto_expire);
          }

          if (data.media_url) {
            setMedia({
              url: data.media_url,
              type: data.media_type || 'image',
              name: 'Attached Media Creative',
              previewUrl: resolveFileUrl(data.media_url) || data.media_url,
            });
          }
        }
      })
      .catch((err) => {
        toast.error(err?.message || 'Failed to load broadcast for editing.');
      })
      .finally(() => {
        setLoadingBroadcast(false);
      });
  }, [id, loadBroadcastById]);

  const handleMediaSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const expireToMinutes = (label) => {
    const map = { '2 Hours': 120, '6 Hours': 360, '12 Hours': 720, '24 Hours': 1440 };
    return map[label] || 360;
  };

  const handleSaveUpdate = async () => {
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
      mediaUrl: media?.url || null,
      mediaType: media?.type || null,
      targets,
      autoExpireMinutes: expireToMinutes(autoExpire),
    };

    setSubmitting(true);
    try {
      await toast.promise(updateBroadcast(id, payload), {
        loading: 'Updating emergency broadcast advisory…',
        success: 'Emergency broadcast updated successfully!',
        error: (e) => e?.message || 'Failed to update broadcast.',
      });
      navigate(detailsPath);
    } catch {
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
            { label: parentLabel, path: dashboardPath, icon: FleetIcons.Dashboard },
            { label: 'Emergency Broadcasts', path: listPath },
            { label: broadcast?.code || `Alert #${id}`, path: detailsPath },
            { label: 'Edit Locked' },
          ]}
          className="mb-1"
        />

        <div className="p-8 sm:p-12 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
            <FleetIcons.Lock className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Modification Locked
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
            This emergency broadcast has already been <b>{isApproved ? 'Approved' : isAct ? 'Activated' : 'Finalized'}</b>.
            For public safety and regulatory compliance, live transit override broadcasts cannot be modified after approval.
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              to={detailsPath}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              View Broadcast Details
            </Link>
            <Link
              to={listPath}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-colors cursor-pointer border border-slate-200 dark:border-zinc-700"
            >
              Back to List
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
              { label: parentLabel, path: dashboardPath, icon: FleetIcons.Dashboard },
              { label: 'Emergency Broadcasts', path: listPath },
              { label: broadcast?.code || `Alert #${id}`, path: detailsPath },
              { label: 'Edit Broadcast' },
            ]}
            className="mb-2"
          />
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Edit Emergency Broadcast
            </h1>
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60">
              PENDING APPROVAL
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium">
            Update alert message, visual creative, and route preemption targets before Super Admin verification
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={detailsPath}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-zinc-700 cursor-pointer"
          >
            <FleetIcons.Eye className="w-3.5 h-3.5 text-blue-500" />
            <span>{t('gov.emergency.view_current_details')}</span>
          </Link>
          <Link
            to={listPath}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-zinc-700 cursor-pointer"
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
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('gov.emergency.type_message_ph')}
            className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-zinc-800 focus:border-red-500 focus:outline-none leading-relaxed font-medium transition-colors"
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

          {/* Active media preview card */}
          {media && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 w-full sm:w-auto">
                <div className="w-16 h-16 rounded-xl bg-black overflow-hidden flex items-center justify-center shrink-0 border border-slate-300 dark:border-zinc-700">
                  {media.type === 'video' ? (
                    <video src={media.previewUrl} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={media.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-xs">{media.name}</p>
                  <p className="text-[10px] font-mono text-slate-400 uppercase mt-0.5">Format: {media.type}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveMedia}
                className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-bold border border-red-200 dark:border-red-900/50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <FleetIcons.Close className="w-3.5 h-3.5" />
                <span>{t('gov.emergency.remove_visual')}</span>
              </button>
            </div>
          )}

          {/* Upload Controls */}
          {!media && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaSelect}
                className="hidden"
                id="edit-gov-media-upload"
              />
              <label
                htmlFor="edit-gov-media-upload"
                className="p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-red-500 dark:hover:border-red-500 bg-slate-50 dark:bg-zinc-800/40 cursor-pointer flex items-center justify-center gap-2.5 transition-colors text-slate-700 dark:text-zinc-300 text-xs font-bold"
              >
                <FleetIcons.Upload className="w-4 h-4 text-red-500" />
                <span>{uploadingMedia ? 'Uploading Asset…' : 'Upload Image or Video (up to 500MB)'}</span>
              </label>

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="p-4 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 text-xs font-bold text-slate-700 dark:text-zinc-300 cursor-pointer"
              >
                <FleetIcons.Link className="w-4 h-4 text-slate-400" />
                <span>{t('gov.emergency.attach_direct_url')}</span>
              </button>
            </div>
          )}

          {/* URL Input Box */}
          {showUrlInput && !media && (
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/alert-graphic.jpg or video.mp4"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
              />
              <button
                type="button"
                onClick={handleAttachCustomUrl}
                className="px-4 py-2 bg-slate-900 dark:bg-zinc-700 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Attach
              </button>
            </div>
          )}

          {/* Instant Official Visual Presets */}
          {!media && (
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Or Apply Instant Official Visual Presets:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {OFFICIAL_PRESETS.map((pst) => (
                  <div
                    key={pst.id}
                    onClick={() => handleApplyPreset(pst)}
                    className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-red-500 bg-slate-50/50 dark:bg-zinc-800/30 cursor-pointer transition-colors space-y-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-red-500">{pst.title}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 font-mono">{pst.badge}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{pst.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

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
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-900 dark:text-white rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer"
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
            className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-colors cursor-pointer border border-slate-200 dark:border-zinc-700"
          >
            Cancel & Keep Original
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
