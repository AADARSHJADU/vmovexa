import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Pagination } from '../../components/ui/Pagination';
import { useGovernmentRole } from '../../hooks/government/useGovernmentRole';
import { useAdvertiserRole } from '../../hooks/advertiser/useAdvertiserRole';
import { RouteVehicleScreenPicker } from '../../components/campaign/RouteVehicleScreenPicker';
import { uploadFile, uploadVideo, resolveFileUrl } from '../../api/services/upload.service.js';

export const GovEmergencyBroadcastPage = () => {
  const { broadcasts, loadBroadcasts, createBroadcast, revokeBroadcast } = useGovernmentRole();
  const { fleetOptions, loadFleetOptions } = useAdvertiserRole();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  const isSuperAdmin = location.pathname.startsWith('/superadmin');
  const dashboardPath = isSuperAdmin ? '/superadmin/dashboard' : '/government/dashboard';
  const parentLabel = isSuperAdmin ? 'Super Admin' : 'Government';

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

  // Pagination for broadcast history
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(5);

  useEffect(() => {
    loadBroadcasts().catch(() => {});
    loadFleetOptions().catch(() => {});
  }, [loadBroadcasts, loadFleetOptions]);

  const handleMediaSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const previewUrl = URL.createObjectURL(file);
    setUploadingMedia(true);
    try {
      const res = isVideo ? await uploadVideo(file) : await uploadFile(file, 'emergency');
      const rel = res?.url || res?.data?.url;
      const full = resolveFileUrl(rel) || rel;
      setMedia({ url: full, type: isVideo ? 'video' : 'image', name: file.name, previewUrl });
      toast.success(`Attached: ${file.name}`);
    } catch (err) {
      toast.error(err?.message || 'Upload failed');
    } finally {
      setUploadingMedia(false);
    }
  };

  const broadcastList = Array.isArray(broadcasts) ? broadcasts : (broadcasts?.items || broadcasts?.rows || []);

  const totalHistoryItems = broadcastList.length;
  const totalHistoryPages = Math.ceil(totalHistoryItems / historyPageSize) || 1;
  const paginatedBroadcasts = useMemo(() => {
    const startIndex = (historyPage - 1) * historyPageSize;
    return broadcastList.slice(startIndex, startIndex + historyPageSize);
  }, [broadcastList, historyPage, historyPageSize]);

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
    try {
      await toast.promise(createBroadcast(payload), {
        loading: 'Submitting emergency for Super Admin approval...',
        success: 'Submitted! Awaiting Super Admin approval before it goes live.',
        error: (e) => e?.message || 'Failed to submit emergency',
      });
      setMessage('');
      await loadBroadcasts().catch(() => {});
    } catch {
      /* toast surfaced the error */
    }
  };

  const handleRevoke = async (broadcastId) => {
    try {
      await toast.promise(revokeBroadcast(broadcastId), {
        loading: 'Revoking broadcast...',
        success: 'Broadcast revoked!',
        error: (e) => e?.message || 'Failed to revoke',
      });
      await loadBroadcasts().catch(() => {});
    } catch {
      /* toast surfaced the error */
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">

      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(dashboardPath)}
            className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            <FleetIcons.ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <Breadcrumb
              items={[
                { label: parentLabel, path: dashboardPath, icon: FleetIcons.Dashboard },
                { label: 'Emergency Broadcast' },
              ]}
              className="mb-2"
            />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">Emergency Broadcast</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium">Send immediate high-priority override advisories across all transit displays</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
          <h2 className="text-sm sm:text-base font-black text-red-950 dark:text-red-300 tracking-tight">HIGH-PRIORITY OVERRIDE TRANSMITTER</h2>
          <p className="text-xs text-red-800 dark:text-red-400 mt-0.5 leading-relaxed">
            Submissions require <b className="text-red-950 dark:text-red-200">Super Admin approval</b>. Once approved, the advisory freezes current commercial ads and displays on all selected transit screens.
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
            placeholder="Type emergency alert message..."
            className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:bg-white dark:focus:bg-zinc-800 focus:border-red-500 dark:focus:border-red-500 focus:outline-none leading-relaxed font-medium transition-colors"
          />
        </div>

        {/* Severity Level */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Severity Level</label>
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
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Emergency Visual (optional)</label>
          <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleMediaSelect} className="hidden" />
          {media ? (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60">
              {media.type === 'image' ? (
                <img src={media.previewUrl || media.url} alt={media.name} className="w-16 h-12 rounded-lg object-cover border border-slate-200 dark:border-zinc-700" />
              ) : (
                <div className="w-16 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
                  <FleetIcons.Video className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{media.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">{media.type === 'image' ? 'Image' : 'Video'} attached · shows on screens</p>
              </div>
              <button type="button" onClick={() => setMedia(null)} className="text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 cursor-pointer">Remove</button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingMedia}
              className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-red-400 dark:hover:border-red-500 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              <FleetIcons.Image className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
              <span>{uploadingMedia ? 'Uploading…' : 'Attach Image or Video'}</span>
            </button>
          )}
        </div>

        {/* Target Area (free text label) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Target Geographic Area (label)</label>
          <input
            type="text"
            value={targetArea}
            onChange={e => setTargetArea(e.target.value)}
            placeholder="e.g. Central Corridor, Flood Zones (optional label)"
            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 font-medium focus:bg-white dark:focus:bg-zinc-800 focus:border-red-500 dark:focus:border-red-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Broadcast Target Scope: All screens OR specific routes/vehicles */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Broadcast Target Scope</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => setTargetAllScreens(true)}
              className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${targetAllScreens ? 'border-red-500 dark:border-red-500 bg-red-50/40 dark:bg-red-950/30' : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
            >
              <div className="flex items-center gap-3">
                <span className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400"><FleetIcons.Globe className="w-5 h-5" /></span>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">All Screens (Entire Network)</p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">Override every online transit display</p>
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
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Specific Routes / Vehicles</p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">Choose transit routes, buses & screens</p>
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
              <p className="text-xs font-bold text-slate-900 dark:text-white">Send Push Notification</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">Notify fleet managers and drivers</p>
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
              <p className="text-xs font-bold text-slate-900 dark:text-white">Auto Expire Alert</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">Resume regular broadcasts after</p>
            </div>
            <select
              value={autoExpire}
              onChange={e => setAutoExpire(e.target.value)}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-900 dark:text-white rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="2 Hours">2 Hours</option>
              <option value="6 Hours">6 Hours</option>
              <option value="12 Hours">12 Hours</option>
              <option value="24 Hours">24 Hours</option>
            </select>
          </div>
        </div>

        {/* Big Broadcast CTA */}
        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
          <button
            onClick={handleBroadcast}
            className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white text-sm font-black tracking-wide transition-all shadow-md shadow-red-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <FleetIcons.Siren className="w-5 h-5 animate-pulse text-white" />
            <span>SUBMIT FOR SUPER ADMIN APPROVAL</span>
          </button>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 text-center mt-2">
            After Super Admin approval, this override takes precedence over all scheduled commercial ad loops.
          </p>
        </div>
      </div>

      {/* 4. Broadcast History Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Active & Recent Broadcast History</h2>
        <div className="divide-y divide-slate-100 dark:divide-zinc-800">
          {paginatedBroadcasts.map(alert => {
            const status = alert?.status || (alert?.active ? 'approved' : 'pending_approval');
            const STATUS_UI = {
              pending_approval: { label: 'PENDING APPROVAL', cls: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60' },
              approved: { label: 'APPROVED · LIVE', cls: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60' },
              rejected: { label: 'REJECTED', cls: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60' },
              revoked: { label: 'REVOKED', cls: 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700' },
              expired: { label: 'EXPIRED', cls: 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700' },
            };
            const ui = STATUS_UI[status] || STATUS_UI.pending_approval;
            const isLive = status === 'approved' && (alert?.active === true || alert?.active === 1);

            return (
              <div key={alert?.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 px-2 py-0.5 rounded">
                      {alert?.code || `EMG-${alert?.id}`}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{alert?.headline || alert?.title || 'Emergency Advisory'}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${ui.cls}`}>
                      ● {ui.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">{alert?.body_text || alert?.message || '—'}</p>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                    Scope: {alert?.target_scope || 'All'} · Area: {alert?.target_area || 'Platform-wide'} · Issued: {alert?.issued_by || 'Authority'}
                    {status === 'rejected' && alert?.rejection_reason ? ` · Reason: ${alert.rejection_reason}` : ''}
                  </p>
                </div>
                {isLive ? (
                  <button
                    onClick={() => handleRevoke(alert?.id)}
                    className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shrink-0 self-start sm:self-center transition-colors shadow-sm cursor-pointer"
                  >
                    Revoke
                  </button>
                ) : (
                  <span className={`px-3 py-1 rounded-xl text-xs font-bold border shrink-0 self-start sm:self-center ${ui.cls}`}>
                    {ui.label}
                  </span>
                )}
              </div>
            );
          })}

          {broadcastList.length === 0 && (
            <div className="py-12 text-center text-slate-500 dark:text-zinc-400 text-xs">
              No emergency broadcasts have been dispatched yet.
            </div>
          )}
        </div>

        {/* Global Pagination */}
        {totalHistoryItems > 0 && (
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800">
            <Pagination
              currentPage={historyPage}
              totalPages={totalHistoryPages}
              totalItems={totalHistoryItems}
              pageSize={historyPageSize}
              onPageChange={setHistoryPage}
              onPageSizeChange={setHistoryPageSize}
              pageSizeOptions={[5, 10, 20]}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GovEmergencyBroadcastPage;
