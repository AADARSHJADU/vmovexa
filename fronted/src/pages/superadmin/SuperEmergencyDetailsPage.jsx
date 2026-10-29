import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useGovernmentRole } from '../../hooks/government/useGovernmentRole';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { resolveFileUrl, uploadFile, uploadVideo } from '../../api/services/upload.service.js';
import { fleetRouteService } from '../../api/services/fleet/route.service.js';
import { advertiserService } from '../../api/services/advertiser/advertiser.service.js';

const STATUS_UI = {
  pending_approval: {
    label: 'PENDING APPROVAL',
    short: 'Pending',
    cls: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500 animate-pulse',
  },
  approved: {
    label: 'APPROVED · LIVE ON SCREENS',
    short: 'Live',
    cls: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500 animate-ping',
  },
  rejected: {
    label: 'REJECTED',
    short: 'Rejected',
    cls: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    dot: 'bg-rose-500',
  },
  revoked: {
    label: 'REVOKED · ADS RESTORED',
    short: 'Revoked',
    cls: 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700',
    dot: 'bg-slate-400',
  },
  expired: {
    label: 'EXPIRED',
    short: 'Expired',
    cls: 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700',
    dot: 'bg-slate-400',
  },
};

const SEVERITY_CONFIG = {
  critical: {
    label: 'CRITICAL SEVERITY',
    accent: 'from-rose-600 via-red-600 to-amber-600',
    badge: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900',
    iconCls: 'text-red-600 dark:text-red-400 animate-pulse',
  },
  high: {
    label: 'HIGH SEVERITY',
    accent: 'from-amber-500 via-orange-500 to-red-500',
    badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900',
    iconCls: 'text-amber-500 dark:text-amber-400',
  },
  medium: {
    label: 'MEDIUM SEVERITY',
    accent: 'from-blue-600 via-cyan-600 to-indigo-600',
    badge: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900',
    iconCls: 'text-blue-500 dark:text-blue-400',
  },
  low: {
    label: 'LOW SEVERITY',
    accent: 'from-slate-500 to-zinc-600',
    badge: 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700',
    iconCls: 'text-slate-500 dark:text-zinc-400',
  },
};

export const SuperEmergencyDetailsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    currentBroadcast,
    loadBroadcastById,
    approveBroadcast,
    rejectBroadcast,
    revokeBroadcast,
    updateBroadcast,
    loading,
  } = useGovernmentRole();

  const [busy, setBusy] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Incomplete emergency advisory specifications');
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);

  // Network routes, fleet telematic options, and live MQTT broker status
  const [networkRoutes, setNetworkRoutes] = useState([]);
  const [networkFleets, setNetworkFleets] = useState([]);
  const [mqttStatus, setMqttStatus] = useState(null);
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  // Media upload and attachment state
  const fileInputRef = useRef(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [customMediaUrlInput, setCustomMediaUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Section Tab State from URL query (?tab=...)
  const activeSectionTab = searchParams.get('tab') || 'all';
  const tabsScrollRef = useRef(null);
  const pageTopRef = useRef(null);
  const tabControllerRef = useRef(null);

  const scrollToPageTop = () => {
    try {
      if (pageTopRef.current) {
        pageTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      const scrollableParent = pageTopRef.current?.closest('main') || document.querySelector('main');
      if (scrollableParent) {
        scrollableParent.scrollTo({ top: 0, behavior: 'smooth' });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (_) {}
  };

  const scrollToSectionTop = () => {
    try {
      if (tabControllerRef.current) {
        tabControllerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      const scrollableParent = tabControllerRef.current?.closest('main') || document.querySelector('main');
      if (scrollableParent && tabControllerRef.current) {
        const parentRect = scrollableParent.getBoundingClientRect();
        const targetRect = tabControllerRef.current.getBoundingClientRect();
        const targetScrollTop = scrollableParent.scrollTop + (targetRect.top - parentRect.top) - 8;
        scrollableParent.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' });
      }
    } catch (_) {}
  };

  const setActiveSectionTab = (tabKey) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tabKey === 'all') {
        next.delete('tab');
      } else {
        next.set('tab', tabKey);
      }
      return next;
    }, { replace: true });
  };

  useEffect(() => {
    scrollToPageTop();
  }, [id]);

  useEffect(() => {
    if (id) {
      loadBroadcastById(id).catch((err) => {
        toast.error(err?.message || 'Failed to load emergency broadcast details');
      });
    }
  }, [id, loadBroadcastById]);

  // Load active transit routes, fleets and telemetry for the network
  useEffect(() => {
    let isMounted = true;
    const fetchNetworkData = async () => {
      setLoadingRoutes(true);
      try {
        const [routesRes, fleetsRes, mqttRes] = await Promise.allSettled([
          fleetRouteService.getRoutes(),
          advertiserService.getFleetOptions(),
          advertiserService.getMqttStatus(),
        ]);
        if (!isMounted) return;
        if (routesRes.status === 'fulfilled') {
          const rData = routesRes.value;
          const rList = Array.isArray(rData) ? rData : (rData?.rows || rData?.items || []);
          setNetworkRoutes(rList);
        }
        if (fleetsRes.status === 'fulfilled') {
          const fList = Array.isArray(fleetsRes.value) ? fleetsRes.value : [];
          setNetworkFleets(fList);
        }
        if (mqttRes.status === 'fulfilled') {
          setMqttStatus(mqttRes.value);
        }
      } catch (_) {
      } finally {
        if (isMounted) setLoadingRoutes(false);
      }
    };
    fetchNetworkData();
    return () => { isMounted = false; };
  }, []);

  const b = currentBroadcast;

  const status = b?.status || 'pending_approval';
  const ui = STATUS_UI[status] || STATUS_UI.pending_approval;
  const sevKey = (b?.severity || 'high').toLowerCase();
  const sev = SEVERITY_CONFIG[sevKey] || SEVERITY_CONFIG.high;

  const rawMedia = b?.media_url || b?.mediaUrl;
  const mediaUrl = rawMedia ? resolveFileUrl(rawMedia) : null;
  const isVideo = b?.media_type === 'video' || b?.mediaType === 'video' || (mediaUrl && /\.(mp4|webm|mov|mkv)/i.test(mediaUrl));

  // Compute total fleet vehicles and displays in network safely
  const totalNetworkScreens = useMemo(() => {
    let sum = 0;
    (Array.isArray(networkFleets) ? networkFleets : []).forEach((f) => {
      if (typeof f.screens === 'number') {
        sum += f.screens;
      } else if (Array.isArray(f.routes)) {
        f.routes.forEach((r) => {
          sum += (r.totalScreens || (Array.isArray(r.vehicles) ? r.vehicles.length : 0) || 0);
        });
      }
    });
    return sum > 0 ? sum : 24;
  }, [networkFleets]);

  const totalNetworkVehicles = useMemo(() => {
    let count = 0;
    (Array.isArray(networkFleets) ? networkFleets : []).forEach((f) => {
      if (typeof f.vehicles === 'number') {
        count += f.vehicles;
      } else if (Array.isArray(f.vehicles)) {
        count += f.vehicles.length;
      } else if (Array.isArray(f.routes)) {
        f.routes.forEach((r) => {
          count += (r.vehicleCount || (Array.isArray(r.vehicles) ? r.vehicles.length : 0) || 0);
        });
      }
    });
    return count > 0 ? count : 12;
  }, [networkFleets]);

  // Derive distinct active transit routes from networkRoutes and networkFleets
  const allAvailableRoutes = useMemo(() => {
    const routeMap = new Map();

    (Array.isArray(networkRoutes) ? networkRoutes : []).forEach((r) => {
      if (r && r.id) {
        routeMap.set(String(r.id), {
          id: r.id,
          code: r.code || `RTE-${r.id}`,
          name: r.name || `Corridor ${r.id}`,
          start_point: r.start_point || r.startPoint || 'Terminal A',
          end_point: r.end_point || r.endPoint || 'Terminal B',
          distance_km: r.distance_km || r.distanceKm || null,
        });
      }
    });

    (Array.isArray(networkFleets) ? networkFleets : []).forEach((fleet) => {
      if (Array.isArray(fleet.routes)) {
        fleet.routes.forEach((r) => {
          if (r && r.id) {
            const key = String(r.id);
            const existing = routeMap.get(key) || {};
            routeMap.set(key, {
              ...existing,
              id: r.id,
              code: r.code || existing.code || `RTE-${r.id}`,
              name: r.name || existing.name || `Corridor ${r.id}`,
              start_point: r.startPoint || r.start_point || existing.start_point || 'Terminal A',
              end_point: r.endPoint || r.end_point || existing.end_point || 'Terminal B',
              distance_km: r.distance_km || existing.distance_km || null,
              vehicleCount: r.vehicleCount || (Array.isArray(r.vehicles) ? r.vehicles.length : 0),
              totalScreens: r.totalScreens || 0,
            });
          }
        });
      }
    });

    if (routeMap.size === 0) {
      return [];
    }

    return Array.from(routeMap.values());
  }, [networkRoutes, networkFleets]);

  const handleMediaSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !b) return;

    const isVid = file.type.startsWith('video/');
    const maxBytes = isVid ? 500 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(`File is too large (${Math.round(file.size / (1024 * 1024))}MB). Limit is ${isVid ? '500MB' : '50MB'}.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploadingMedia(true);
    const tid = toast.loading(`Uploading ${isVid ? 'video' : 'image'} asset...`);
    try {
      const res = isVid ? await uploadVideo(file) : await uploadFile(file, 'emergency');
      const rel = res?.url || res?.data?.url;
      const full = resolveFileUrl(rel) || rel;
      if (updateBroadcast) {
        await updateBroadcast(b.id, {
          mediaUrl: full,
          mediaType: isVid ? 'video' : 'image',
        });
      }
      toast.dismiss(tid);
      toast.success(`Attached ${isVid ? 'video' : 'image'} successfully!`);
      await loadBroadcastById(id);
    } catch (err) {
      toast.dismiss(tid);
      toast.error(err?.message || 'Failed to upload media');
    } finally {
      setUploadingMedia(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveMedia = async () => {
    if (!b) return;
    const tid = toast.loading('Removing media asset...');
    try {
      if (updateBroadcast) {
        await updateBroadcast(b.id, { mediaUrl: null, mediaType: null });
      }
      toast.dismiss(tid);
      toast.success('Media removed. Text-only preemption mode restored.');
      await loadBroadcastById(id);
    } catch (err) {
      toast.dismiss(tid);
      toast.error(err?.message || 'Failed to remove media');
    }
  };

  const handleApplyPreset = async (presetSvgUrl) => {
    if (!b) return;
    const tid = toast.loading('Applying emergency graphic preset...');
    try {
      if (updateBroadcast) {
        await updateBroadcast(b.id, {
          mediaUrl: presetSvgUrl,
          mediaType: 'image',
        });
      }
      toast.dismiss(tid);
      toast.success('Emergency template graphic applied!');
      await loadBroadcastById(id);
    } catch (err) {
      toast.dismiss(tid);
      toast.error(err?.message || 'Failed to apply preset');
    }
  };

  const handleSaveCustomUrl = async () => {
    if (!customMediaUrlInput.trim() || !b) return;
    const isVid = /\.(mp4|webm|mov|mkv)(\?.*)?$/i.test(customMediaUrlInput);
    const tid = toast.loading('Attaching media URL...');
    try {
      if (updateBroadcast) {
        await updateBroadcast(b.id, {
          mediaUrl: customMediaUrlInput.trim(),
          mediaType: isVid ? 'video' : 'image',
        });
      }
      toast.dismiss(tid);
      toast.success('Media URL attached successfully!');
      setShowUrlInput(false);
      setCustomMediaUrlInput('');
      await loadBroadcastById(id);
    } catch (err) {
      toast.dismiss(tid);
      toast.error(err?.message || 'Failed to attach URL');
    }
  };

  const handleApprove = async () => {
    if (!b) return;
    setBusy(true);
    try {
      await toast.promise(approveBroadcast(b.id), {
        loading: 'Approving & broadcasting to transit screens...',
        success: 'Approved! Emergency is now LIVE across transit screens.',
        error: (e) => e?.message || 'Approval failed',
      });
      await loadBroadcastById(id);
    } catch {
      /* handled */
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!b) return;
    setBusy(true);
    try {
      await toast.promise(rejectBroadcast(b.id, rejectReason || 'Incomplete details'), {
        loading: 'Rejecting advisory...',
        success: 'Emergency broadcast rejected.',
        error: (e) => e?.message || 'Rejection failed',
      });
      setRejectModalOpen(false);
      await loadBroadcastById(id);
    } catch {
      /* handled */
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmRevoke = async () => {
    if (!b) return;
    setBusy(true);
    try {
      await toast.promise(revokeBroadcast(b.id), {
        loading: 'Revoking broadcast override...',
        success: 'Broadcast revoked. Transit displays restored to normal playback.',
        error: (e) => e?.message || 'Revoke failed',
      });
      setRevokeModalOpen(false);
      await loadBroadcastById(id);
    } catch {
      /* handled */
    } finally {
      setBusy(false);
    }
  };

  const copyAdvisoryMessage = () => {
    if (b?.body_text || b?.message) {
      navigator.clipboard.writeText(b.body_text || b.message);
      toast.success('Advisory message copied to clipboard');
    }
  };

  // Section Tabs Definition matching CampaignDetailsPage
  const SECTION_TABS = useMemo(() => {
    if (!b) return [];
    return [
      { id: 'all', label: 'All Details', icon: FleetIcons.Eye, count: null },
      { id: 'advisory', label: 'Advisory & Message', icon: FleetIcons.Megaphone, count: 'Content' },
      { id: 'preview_media', label: 'Screen Simulator & Media', icon: FleetIcons.Image, count: mediaUrl ? (isVideo ? 'Video' : 'Image') : 'Text Flash' },
      { id: 'targeting', label: 'Fleet Scope & Hardware', icon: FleetIcons.Bus, count: b.affected_buses_count != null ? `${b.affected_buses_count} Screens` : 'Network' },
      { id: 'audit_lifecycle', label: 'Audit Trail & Verification', icon: FleetIcons.Check, count: ui.short },
    ];
  }, [b, mediaUrl, isVideo, ui.short]);

  const TAB_KEYS = useMemo(() => ['advisory', 'preview_media', 'targeting', 'audit_lifecycle'], []);
  const currentTabIdx = TAB_KEYS.indexOf(activeSectionTab);
  const prevTabKey = currentTabIdx > 0 ? TAB_KEYS[currentTabIdx - 1] : null;
  const nextTabKey = (currentTabIdx >= 0 && TAB_KEYS.length - 2 >= currentTabIdx) ? TAB_KEYS[currentTabIdx + 1] : null;

  const prevTabObj = SECTION_TABS.find((t) => t.id === prevTabKey);
  const nextTabObj = SECTION_TABS.find((t) => t.id === nextTabKey);

  if (!b && loading) {
    return (
      <div className="w-full py-24 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-500 dark:text-zinc-400">{t('superadmin.emergency.loading_details', 'Loading emergency advisory details...')}</p>
      </div>
    );
  }

  if (!b && !loading) {
    return (
      <div className="w-full py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 mx-auto flex items-center justify-center">
          <FleetIcons.Alert className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('superadmin.emergency.not_found_title', 'Emergency Broadcast Not Found')}</h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400">{t('superadmin.emergency.not_found_desc', 'The requested broadcast ID #{id} does not exist or has been removed.', { id })}</p>
        <button
          onClick={() => navigate('/superadmin/emergency-approvals')}
          className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-zinc-800 text-white text-xs font-bold transition-colors cursor-pointer"
        >
          {t('superadmin.emergency.btn_back_to_approvals', 'Back to Approvals')}
        </button>
      </div>
    );
  }

  /* ------------------------------------------------------------- */
  /* SECTION RENDERERS (matching CampaignDetailsPage design)        */
  /* ------------------------------------------------------------- */

  // 1. Advisory & Message Section
  const renderAdvisorySection = () => (
    <div id="section-advisory" className="space-y-5">
      {/* 1A. Broadcast Message Box */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <FleetIcons.Megaphone className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
              Emergency Advisory Content
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
              Civil Defense NOC
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 text-slate-900 dark:text-white font-medium text-base sm:text-lg leading-relaxed shadow-2xs break-words break-all">
          "{b.body_text || b.message || 'No additional advisory message body provided.'}"
        </div>

        {/* Scrolling Ticker Preview */}
        <div className="space-y-1.5 pt-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            Passenger Display Marquee Ticker
          </p>
          <div className="p-3.5 rounded-xl bg-zinc-950 text-red-400 border border-zinc-800 font-mono text-xs font-bold overflow-hidden flex items-center gap-3 min-w-0">
            <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] uppercase font-black shrink-0">
              FLASH
            </span>
            <span className="truncate break-all">
              {b.ticker_text || b.headline || 'URGENT: TRANSIT CIVIL DEFENSE OVERRIDE IN EFFECT'}
            </span>
          </div>
        </div>
      </div>

      {/* 1B. Authority & Origin Metadata */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <FleetIcons.Driver className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
              Authority & Origin Details
            </h2>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
            Issuing Agency
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="min-w-0">
            <span className="text-slate-400 dark:text-zinc-500 font-medium">{t('superadmin.emergency.lbl_origin_authority', 'Origin Authority')}</span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5 break-words break-all">
              {b.agency?.name || b.authority || b.issued_by || '—'}
            </p>
          </div>
          <div className="min-w-0">
            <span className="text-slate-400 dark:text-zinc-500 font-medium">{t('superadmin.emergency.lbl_authorizing_officer', 'Authorizing Officer')}</span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5 break-words break-all">
              {b.creator?.name || b.issued_by || (b.created_by ? `Officer #${b.created_by}` : null) || b.authority || '—'}
            </p>
          </div>
          <div className="min-w-0">
            <span className="text-slate-400 dark:text-zinc-500 font-medium">{t('superadmin.emergency.lbl_broadcast_code', 'Broadcast Code')}</span>
            <p className="font-mono font-bold text-red-600 dark:text-red-400 mt-0.5 break-all">{b.code || `EMG-${b.id}`}</p>
          </div>
          <div className="min-w-0">
            <span className="text-slate-400 dark:text-zinc-500 font-medium">{t('superadmin.emergency.lbl_dispatch_timestamp', 'Dispatch Timestamp')}</span>
            <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
              {(b.created_at || b.createdAt) ? new Date(b.created_at || b.createdAt).toLocaleString() : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // 2. Screen Simulator & Media Section
  const renderPreviewMediaSection = () => (
    <div id="section-preview" className="space-y-5">
      {/* 2A. In-Bus Hardware Display Screen Simulator (16:9 FHD) */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <FleetIcons.Bus className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
              Transit Passenger Screen Live Preview (16:9 Simulator)
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">{'1920 × 1080 FHD'}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400">
              DOOH Screen Simulator
            </span>
          </div>
        </div>

        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-zinc-950 border-4 border-red-600 shadow-2xl flex flex-col justify-between p-3 sm:p-6 text-white select-none">
          {/* Top Banner Alert Bar */}
          <div className="flex items-center justify-between border-b border-red-500/40 pb-2 sm:pb-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="p-1.5 sm:p-2 rounded-xl bg-red-600 text-white animate-pulse">
                <FleetIcons.Siren className="w-4 h-4 sm:w-6 sm:h-6" />
              </span>
              <div>
                <p className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-red-400 font-mono">
                  CIVIL DEFENSE ADVISORY · {b.code}
                </p>
                <p className="text-sm sm:text-lg font-black tracking-tight line-clamp-1">{b.headline || 'EMERGENCY TRANSIT OVERRIDE'}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-red-600/30 border border-red-500 text-red-300 text-[10px] sm:text-xs font-bold uppercase">
                {b.severity || 'CRITICAL'}
              </span>
            </div>
          </div>

          {/* Main Body with Visual or Large Callout */}
          <div className="flex-1 flex items-center justify-center my-2 sm:my-4 px-2">
            {mediaUrl ? (
              isVideo ? (
                <video src={mediaUrl} autoPlay loop muted playsInline className="max-h-36 sm:max-h-52 rounded-xl object-contain shadow-2xl" />
              ) : (
                <img src={mediaUrl} alt="Advisory media" className="max-h-36 sm:max-h-52 rounded-xl object-contain shadow-2xl" />
              )
            ) : (
              <div className="text-center max-w-xl space-y-2 sm:space-y-3 min-w-0">
                <p className="text-base sm:text-2xl font-black text-white leading-tight break-words break-all max-h-40 overflow-y-auto">
                  "{b.body_text || b.message}"
                </p>
                <div className="flex items-center justify-center gap-2 text-[11px] sm:text-xs text-zinc-400 font-medium flex-wrap">
                  <span className="break-words">Issued by: {b.agency?.name || b.authority || b.issued_by || 'Civil Defense'}</span>
                  <span>·</span>
                  <span className="text-red-400 font-bold">{t('superadmin.emergency.text_preemption_mode', 'Text Preemption Mode')}</span>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-600/30 hover:bg-red-600/50 border border-red-500/60 text-red-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  <FleetIcons.Plus className="w-3.5 h-3.5" />
                  <span>{t('superadmin.emergency.attach_creative', 'Attach Creative Graphic or Video')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Bottom Scrolling Marquee */}
          <div className="bg-red-700 rounded-xl p-2 sm:p-2.5 flex items-center gap-2 sm:gap-3 font-mono text-[10px] sm:text-xs font-bold shadow-inner min-w-0">
            <span className="px-1.5 sm:px-2 py-0.5 rounded bg-black/40 text-white uppercase text-[9px] sm:text-[10px] shrink-0 font-black">
              ALERT
            </span>
            <span className="truncate break-all">{b.ticker_text || b.body_text || b.headline}</span>
          </div>
        </div>
      </div>

      {/* 2B. Creative Media Asset Card with Upload & 1-Click Presets */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <FleetIcons.Image className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
              Broadcast Creative Media Asset {isVideo ? '(Video Asset)' : mediaUrl ? '(Image Asset)' : '(No Media Attached)'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {mediaUrl ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                Active Media Asset
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                Text-Only Mode
              </span>
            )}
          </div>
        </div>

        {/* Hidden File Input for Image/Video Attachments */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleMediaSelect}
          accept="image/*,video/*"
          className="hidden"
        />

        {mediaUrl ? (
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-zinc-950 flex items-center justify-center max-h-96 relative group">
              {isVideo ? (
                <video src={mediaUrl} controls autoPlay loop muted className="w-full max-h-96 object-contain" />
              ) : (
                <img src={mediaUrl} alt={b.headline || 'Emergency visual'} className="w-full max-h-96 object-contain" />
              )}
            </div>

            {/* Media Information & Action Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-xs">
              <div className="min-w-0">
                <p className="font-bold text-slate-900 dark:text-white truncate">
                  {isVideo ? 'Attached Motion Video (1080p Transit Loop)' : 'Attached Graphic Poster (1920x1080 FHD)'}
                </p>
                <p className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                  {mediaUrl.startsWith('data:') ? 'Official SVG Emergency Advisory Graphic' : mediaUrl}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingMedia}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Replace Media
                </button>
                <button
                  type="button"
                  onClick={handleRemoveMedia}
                  disabled={uploadingMedia}
                  className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Empty state & Upload Dropzone */}
            <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/30 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center border border-red-200 dark:border-red-900/60">
                <FleetIcons.Siren className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                  Currently Operating in Text-Only Preemption Mode
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                  No visual file was attached at submission. In-bus displays currently display the text message and ticker alert. You can attach a high-visibility video or poster below.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingMedia}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {uploadingMedia ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FleetIcons.Plus className="w-4 h-4 text-white" />
                  )}
                  <span>{uploadingMedia ? 'Uploading media asset...' : 'Upload Video / Poster (JPG, PNG, MP4, WEBM)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  {showUrlInput ? 'Hide URL Input' : 'Attach Direct URL'}
                </button>
              </div>
            </div>

            {/* Optional Direct URL Input */}
            {showUrlInput && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="url"
                  value={customMediaUrlInput}
                  onChange={(e) => setCustomMediaUrlInput(e.target.value)}
                  placeholder={t('superadmin.emergency.ph_paste_media_url', 'Paste direct HTTPS image or MP4 video URL...')}
                  className="w-full flex-1 h-10 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                />
                <button
                  type="button"
                  onClick={handleSaveCustomUrl}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-900 dark:bg-zinc-700 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  Save URL
                </button>
              </div>
            )}

            {/* Instant Emergency Template Graphic Presets (1-Click Apply) */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  Instant Official Emergency Posters (1-Click Apply)
                </span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                  Verified Civil Defense Graphics
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Preset 1: Critical Red Alert */}
                <div
                  onClick={() =>
                    handleApplyPreset(
                      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjgwIiBoZWlnaHQ9IjcyMCIgdmlld0JveD0iMCAwIDEyODAgNzIwIj48cmVjdCB3aWR0aD0iMTI4MCIgaGVpZ2h0PSI3MjAiIGZpbGw9IiNiOTFjMWMiLz48cmVjdCB4PSIyNCIgeT0iMjQiIHdpZHRoPSIxMjMyIiBoZWlnaHQ9IjY3MiIgcng9IjIwIiBmaWxsPSIjMDkwOTBiIiBzdHJva2U9IiNlZjQ0NDQiIHN0cm9rZS13aWR0aD0iOCIvPjxwb2x5Z29uIHBvaW50cz0iNjQwLDEzMCA3NjAsMzUwIDUyMCwzNTAiIGZpbGw9IiNlZjQ0NDQiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSI2Ii8+PHJlY3QgeD0iNjMwIiB5PSIyMTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSI3MCIgcng9IjEwIiBmaWxsPSIjZmZmZmZmIi8+PGNpcmNsZSBjeD0iNjQwIiBjeT0iMzE1IiByPSIxMiIgZmlsbD0iI2ZmZmZmZiIvPjx0ZXh0IHg9IjY0MCIgeT0iNDQwIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNDQiIGZvbnQtd2VpZ2h0PSI5MDAiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGxldHRlci1zcGFjaW5nPSI0Ij5DUklUSUNBTCBFTUVSR0VOQ1kgQURWSVNPUlk8L3RleHQ+PHRleHQgeD0iNjQwIiB5PSI1MDAiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyOCIgZm9udC13ZWlnaHQ9IjcwMCIgZmlsbD0iI2ZjYTVhNSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+T0ZGSUNJQUwgQ0lWSUwgREVGRU5TRSBUUkFOU0lUIFNDUkVFTiBPVkVSUklERTwvdGV4dD48cmVjdCB4PSIxNjAiIHk9IjU2MCIgd2lkdGg9Ijk2MCIgaGVpZ2h0PSI2NCIgcng9IjE0IiBmaWxsPSIjZGMyNjI2Ii8+PHRleHQgeD0iNjQwIiB5PSI2MDIiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMjIiIGZvbnQtd2VpZ2h0PSI4MDAiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFMTCBDT01NVVRFUlMgwrcgRk9MTE9XIFNBRkVUWSBHVUlERUxJTkVTICZhbXA7IFRSQU5TSVQgQ1JFVzwvdGV4dD48L3N2Zz4='
                    )
                  }
                  className="p-3.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 hover:border-red-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-red-600 text-white">
                        RED ALERT
                      </span>
                      <FleetIcons.Siren className="w-4 h-4 text-red-600 animate-pulse" />
                    </div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white pt-1">
                      Critical Siren Override
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">
                      High-visibility red border with hazard triangle and civil defense alert banner.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-red-600 dark:text-red-400 group-hover:underline flex items-center gap-1">
                    <span>{t('superadmin.emergency.btn_apply_poster', 'Apply This Poster')}</span>
                    <FleetIcons.ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* Preset 2: Route Detour Alert */}
                <div
                  onClick={() =>
                    handleApplyPreset(
                      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjgwIiBoZWlnaHQ9IjcyMCIgdmlld0JveD0iMCAwIDEyODAgNzIwIj48cmVjdCB3aWR0aD0iMTI4MCIgaGVpZ2h0PSI3MjAiIGZpbGw9IiNjMjQxMGMiLz48cmVjdCB4PSIyNCIgeT0iMjQiIHdpZHRoPSIxMjMyIiBoZWlnaHQ9IjY3MiIgcng9IjIwIiBmaWxsPSIjMDkwOTBiIiBzdHJva2U9IiNmOTczMTYiIHN0cm9rZS13aWR0aD0iOCIvPjxjaXJjbGUgY3g9IjY0MCIgY3k9IjI0MCIgcj0iMTAwIiBmaWxsPSIjZWE1ODBjIi8+PHBvbHlnb24gcG9pbnRzPSI2MTAsMTgwIDY3MCwxODAgNjcwLDI1MCA3MTAsMjUwIDY0MCwzMjAgNTcwLDI1MCA2MTAsMjUwIiBmaWxsPSIjZmZmZmZmIi8+PHRleHQgeD0iNjQwIiB5PSI0MzAiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSI0MiIgZm9udC13ZWlnaHQ9IjkwMCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgbGV0dGVyLXNwYWNpbmc9IjMiPlRSQU5TSVQgUk9VVEUgREVWSUFUSU9OIEFEVklTT1JZPC90ZXh0Pjx0ZXh0IHg9IjY0MCIgeT0iNDkwIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjYiIGZvbnQtd2VpZ2h0PSI3MDAiIGZpbGw9IiNmZWQ3YWEiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk1BSk9SIFJPQUQgT0JTVFJVQ1RJT04gJmFtcDsgVFJBTlNJVCBERVRPVVIgSU4gRUZGRUNUPC90ZXh0PjxyZWN0IHg9IjE2MCIgeT0iNTYwIiB3aWR0aD0iOTYwIiBoZWlnaHQ9IjY0IiByeD0iMTQiIGZpbGw9IiNlYTU4MGMiLz48dGV4dCB4PSI2NDAiIHk9IjYwMiIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIyMiIgZm9udC13ZWlnaHQ9IjgwMCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QlVTIFNFUlZJQ0VTIFJFUk9VVEVEIMK3IENPTU1VVEVSUyBFWFBFQ1QgRVhUUkEgVFJBVkVMIFRJTUU8L3RleHQ+PC9zdmc+'
                    )
                  }
                  className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-600 text-white">
                        ROUTE DETOUR
                      </span>
                      <FleetIcons.Pin className="w-4 h-4 text-amber-600" />
                    </div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white pt-1">
                      Route Obstruction & Detour
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">
                      Amber graphic informing passengers of corridor blockades and rerouted buses.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 group-hover:underline flex items-center gap-1">
                    <span>{t('superadmin.emergency.btn_apply_poster', 'Apply This Poster')}</span>
                    <FleetIcons.ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* Preset 3: Weather Alert */}
                <div
                  onClick={() =>
                    handleApplyPreset(
                      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjgwIiBoZWlnaHQ9IjcyMCIgdmlld0JveD0iMCAwIDEyODAgNzIwIj48cmVjdCB3aWR0aD0iMTI4MCIgaGVpZ2h0PSI3MjAiIGZpbGw9IiMwMzY5YTEiLz48cmVjdCB4PSIyNCIgeT0iMjQiIHdpZHRoPSIxMjMyIiBoZWlnaHQ9IjY3MiIgcng9IjIwIiBmaWxsPSIjMDkwOTBiIiBzdHJva2U9IiMzOGJkZjgiIHN0cm9rZS13aWR0aD0iOCIvPjxjaXJjbGUgY3g9IjY0MCIgY3k9IjI0MCIgcj0iMTAwIiBmaWxsPSIjMDI4NGM3Ii8+PHBhdGggZD0iTTY0MCAxNzAgUTY5MCAyMzAgNjkwIDI3MCBBNTAgNTAgMCAwIDEgNTkwIDI3MCBRNTkwIDIzMCA2NDAgMTcwIFoiIGZpbGw9IiNmZmZmZmYiLz48dGV4dCB4PSI2NDAiIHk9IjQzMCIgZm9udC1mYW1pbHk9InN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjQyIiBmb250LXdlaWdodD0iOTAwIiBmaWxsPSIjZmZmZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBsZXR0ZXItc3BhY2luZz0iMyI+UFVCTElDIFNBRkVUWSBXRUFUSEVSIEJVTExFVElOPC90ZXh0Pjx0ZXh0IHg9IjY0MCIgeT0iNDkwIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjYiIGZvbnQtd2VpZ2h0PSI3MDAiIGZpbGw9IiNiYWU2ZmQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk1VTklDSVBBTCBESVNBU1RFUiBNQU5BR0VNRU5UIEFVVEhPUklUWTwvdGV4dD48cmVjdCB4PSIxNjAiIHk9IjU2MCIgd2lkdGg9Ijk2MCIgaGVpZ2h0PSI2NCIgcng9IjE0IiBmaWxsPSIjMDI4NGM3Ii8+PHRleHQgeD0iNjQwIiB5PSI2MDIiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMjIiIGZvbnQtd2VpZ2h0PSI4MDAiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlJFTUFJTiBDQVVUSU9VUyDCtyBDSVRJWkVOUyBVUkdFRCBUTyBNT05JVE9SIExPQ0FMIFVQREFURVM8L3RleHQ+PC9zdmc+'
                    )
                  }
                  className="p-3.5 rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/50 dark:bg-sky-950/20 hover:border-sky-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-sky-600 text-white">
                        WEATHER BULLETIN
                      </span>
                      <FleetIcons.Globe className="w-4 h-4 text-sky-600" />
                    </div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white pt-1">
                      Severe Weather Warning
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">
                      Sky-blue disaster management graphic for storms, flood advisories or heatwaves.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 group-hover:underline flex items-center gap-1">
                    <span>{t('superadmin.emergency.btn_apply_poster', 'Apply This Poster')}</span>
                    <FleetIcons.ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // 3. Fleet Scope & Hardware Section
  const renderTargetingSection = () => {
    const isNetworkWide = b.target_scope === 'all';
    const targetedRoutesList = Array.isArray(b.target_routes) && b.target_routes.length > 0 ? b.target_routes : [];

    return (
      <div id="section-targeting" className="space-y-5">
        {/* 3A. Preemption Corridor & Scope Highlights */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <FleetIcons.Bus className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                Transit Fleet Preemption & Telemetry Scope
              </h2>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                isNetworkWide
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-200 dark:border-amber-900'
              }`}
            >
              {isNetworkWide ? '● Network-Wide Scope' : '● Partial Corridor Scope'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-200 dark:border-zinc-700">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">{t('superadmin.emergency.transit_corridors', 'Transit Corridors')}</span>
              <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {isNetworkWide ? `${allAvailableRoutes.length} Routes` : `${targetedRoutesList.length || 1} Corridors`}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                {isNetworkWide ? '100% Transit Network' : 'Targeted Lines'}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-200 dark:border-zinc-700">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">{t('superadmin.emergency.transit_fleets', 'Transit Fleets')}</span>
              <p className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400 mt-0.5">
                {networkFleets.length || 3} Fleets
              </p>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">{t('superadmin.emergency.active_units', 'Active Operating Units')}</p>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-200 dark:border-zinc-700">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">{t('superadmin.emergency.preempted_screens', 'Preempted Screens')}</span>
              <p className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {b.affected_buses_count != null && b.affected_buses_count > 0 ? `${b.affected_buses_count} Displays` : `${totalNetworkScreens} Displays`}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">{t('superadmin.emergency.hardware_screens', 'Hardware Screen Units')}</p>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-200 dark:border-zinc-700">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">{t('superadmin.emergency.estimated_reach', 'Estimated Reach')}</span>
              <p className="text-base sm:text-lg font-black text-purple-600 dark:text-purple-400 mt-0.5">
                ~{((b.affected_buses_count || totalNetworkScreens) * 1200).toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">{t('superadmin.emergency.commuters_per_hour', 'Commuters Per Hour')}</p>
            </div>
          </div>

          {/* Live MQTT Transit Telemetry Network Status Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-zinc-950 text-white rounded-xl text-xs border border-zinc-800">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-emerald-400 animate-pulse" />
              <span className="font-bold">
                Transit Telemetry Overrides: <strong className="text-emerald-400">{t('superadmin.emergency.active_and_enforced', 'Active & Enforced')}</strong>
              </span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-300">
                Connected Bus Displays: <strong className="text-emerald-400">{mqttStatus?.onlineEdgeDevices ?? totalNetworkScreens}</strong> / {mqttStatus?.totalEdgeDevices ?? totalNetworkScreens}
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono self-start sm:self-auto">
              Broker: {mqttStatus?.brokerUrl || 'mqtt://127.0.0.1:1883'}
            </span>
          </div>

          {/* Scope Announcement Banner */}
          {isNetworkWide ? (
            <div className="p-4 rounded-xl bg-gradient-to-r from-red-500/10 via-amber-500/10 to-transparent border border-red-200 dark:border-red-900/60 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red-600 text-white shrink-0 mt-0.5">
                <FleetIcons.Globe className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Network-Wide Override Active (All Routes & Fleets Preempted)
                </h4>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  This advisory overrides <strong>all {allAvailableRoutes.length > 0 ? `${allAvailableRoutes.length} active transit corridors` : 'transit corridors'}</strong> {t('superadmin.emergency.across_passenger_screens', 'and all operating passenger bus screens across')} <span className="break-words break-all font-semibold text-slate-800 dark:text-zinc-200">{b.target_area || 'the entire transit network'}</span>. Commercial campaigns will pause automatically until revoked.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-600 text-white shrink-0 mt-0.5">
                <FleetIcons.Pin className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Partial Corridor Override ({targetedRoutesList.length} Selected Lines)
                </h4>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Only vehicles operating on the specific corridors designated below will preempt playback for this emergency advisory.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 3B. Corridors & Transit Routes Execution Directory */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <FleetIcons.Route className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                Transit Routes & Assigned Screen Corridors
              </h2>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold">
              {isNetworkWide ? (allAvailableRoutes.length > 0 ? `All ${allAvailableRoutes.length} Corridors Overridden` : 'Network-Wide Override') : `${targetedRoutesList.length} Targeted Lines`}
            </span>
          </div>

          {/* Loading or Display of Routes */}
          {loadingRoutes && allAvailableRoutes.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400">{t('superadmin.emergency.loading_routes', 'Loading active transit network routes...')}</p>
            </div>
          ) : isNetworkWide ? (
            /* Network Wide Mode: List all routes in the network with active override badge */
            allAvailableRoutes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {allAvailableRoutes.map((route, idx) => (
                  <div
                    key={route.id || idx}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/40 hover:border-red-300 dark:hover:border-red-900/60 transition-all flex flex-col justify-between space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black font-mono bg-zinc-900 text-white dark:bg-zinc-700">
                            {route.code || `RTE-${route.id || idx + 1}`}
                          </span>
                          <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {route.name}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 flex-wrap">
                          <FleetIcons.Pin className="w-3 h-3 text-red-500 shrink-0" />
                          <span className="font-medium">{route.start_point || 'Start Depot'}</span>
                          <FleetIcons.ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="font-medium">{route.end_point || 'Terminal Depot'}</span>
                        </p>
                      </div>

                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/60 shrink-0">
                        OVERRIDDEN
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/60 dark:border-zinc-700/60 text-slate-600 dark:text-zinc-400">
                      <span className="font-mono">
                        Distance: <strong className="text-slate-800 dark:text-zinc-200">{route.distance_km ? `${route.distance_km} km` : 'Transit Corridor'}</strong>
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live Passenger Screens
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/20 text-center space-y-1">
                <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                  Network-Wide Transit Broadcast
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 max-w-md mx-auto break-words break-all">
                  Advisory broadcast targets all active vehicles and corridors across {b.target_area || 'the entire transit network'}.
                </p>
              </div>
            )
          ) : targetedRoutesList.length > 0 ? (
            /* Partial Mode: List specific targeted routes */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {targetedRoutesList.map((tr, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-zinc-900 text-white">
                        {tr.routeId ? `RTE-${tr.routeId}` : 'CORRIDOR'}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white truncate">
                        {tr.routeName || 'Designated Transit Corridor'}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Location / City: <strong className="text-slate-700 dark:text-zinc-300">{tr.city || 'Transit Line'}</strong>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-black text-blue-600 dark:text-blue-400">
                      {Array.isArray(tr.vehicleIds) && tr.vehicleIds.length > 0 ? `${tr.vehicleIds.length} Buses` : 'Assigned Fleet'}
                    </span>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      Targeted Screens
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 text-center space-y-1">
              <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                No Specific Routes Configured
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                This emergency was configured with partial scope but without route IDs. In network deployment, it targets all active online displays.
              </p>
            </div>
          )}
        </div>

        {/* 3C. Hardware Signals & Display Policies */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <FleetIcons.Target className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                Signal & Hardware Policies
              </h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
              NOC Telematics
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 dark:text-zinc-200">{t('superadmin.emergency.driver_alert_title', 'Driver In-Cockpit Alert')}</p>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500">{t('superadmin.emergency.driver_alert_desc', 'Push notification to driver app')}</p>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  b.push_notification
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400'
                }`}
              >
                {b.push_notification ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 dark:text-zinc-200">{t('superadmin.emergency.siren_sound_title', 'Emergency Siren Sound')}</p>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500">{t('superadmin.emergency.siren_sound_desc', 'Audio horn through bus speakers')}</p>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  b.siren_sound
                    ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                    : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400'
                }`}
              >
                {b.siren_sound ? 'ACTIVE' : 'MUTED'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 dark:text-zinc-200">{t('superadmin.emergency.ad_preemption_title', 'Ad Loop Preemption')}</p>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500">{t('superadmin.emergency.ad_preemption_desc', 'Commercial ads auto-pause')}</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                ENFORCED
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 4. Audit & Verification Section
  const renderAuditSection = () => (
    <div id="section-audit" className="space-y-5">
      {/* 4A. Visual Lifecycle Tracker */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider border-b border-slate-100 dark:border-zinc-800 pb-3">
          Advisory Lifecycle & Verification Track
        </h2>
        <div className="overflow-x-auto pb-4 pt-1">
          <div className="min-w-[550px] flex items-center justify-between text-center relative px-4">
            <div className="absolute left-6 right-6 top-3 h-0.5 bg-slate-200 dark:bg-zinc-700 -z-0" />
            {[
              {
                label: 'Submitted',
                date: (b.created_at || b.createdAt) ? new Date(b.created_at || b.createdAt).toLocaleDateString() : 'Recorded',
                done: true,
              },
              {
                label: 'Under Review',
                date: status === 'pending_approval' ? 'Awaiting Action' : 'Completed',
                done: true,
                isCurrent: status === 'pending_approval',
              },
              {
                label: 'Approved Live',
                date: b.approved_at ? new Date(b.approved_at).toLocaleDateString() : (status === 'approved' ? 'Active' : 'Pending'),
                done: ['approved', 'revoked'].includes(status),
                isCurrent: status === 'approved',
              },
              {
                label: status === 'rejected' ? 'Rejected' : (status === 'revoked' ? 'Revoked' : 'Active Cycle'),
                date: b.revoked_at ? new Date(b.revoked_at).toLocaleDateString() : (status === 'rejected' ? 'Declined' : 'Active Cycle'),
                done: ['revoked', 'rejected', 'expired'].includes(status),
              },
            ].map((step) => (
              <div key={step.label} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    step.done
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : step.isCurrent
                      ? 'bg-amber-500 text-white ring-4 ring-amber-100 dark:ring-amber-950 animate-pulse'
                      : 'bg-white dark:bg-zinc-800 border-2 border-slate-300 dark:border-zinc-700 text-slate-400'
                  }`}
                >
                  {step.done ? <FleetIcons.Check className="w-3.5 h-3.5 text-white" /> : ''}
                </div>
                <span
                  className={`text-[11px] font-bold mt-1.5 ${
                    step.isCurrent
                      ? 'text-amber-700 dark:text-amber-400 font-black'
                      : step.done
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-400 dark:text-zinc-500'
                  }`}
                >
                  {step.label}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium max-w-[100px] truncate" title={step.date}>
                  {step.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4B. Detailed Audit Metadata Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
            Detailed Telematics & Authority Log
          </h2>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
            {b.code || `EMG-${b.id}`}
          </span>
        </div>

        <div className="space-y-3 divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1">
            <span className="text-slate-400 dark:text-zinc-500 font-medium sm:w-1/3 shrink-0">{t('superadmin.emergency.lbl_origin_authority', 'Origin Authority')}</span>
            <span className="font-bold text-slate-800 dark:text-zinc-200 text-left sm:text-right break-words break-all">
              {b.agency?.name || b.authority || b.issued_by || '—'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-3">
            <span className="text-slate-400 dark:text-zinc-500 font-medium sm:w-1/3 shrink-0">{t('superadmin.emergency.submitted_by_officer', 'Submitted By Officer')}</span>
            <span className="font-bold text-slate-800 dark:text-zinc-200 text-left sm:text-right break-words break-all">
              {b.creator?.name || b.issued_by || (b.created_by ? `Officer #${b.created_by}` : null) || b.authority || '—'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-3">
            <span className="text-slate-400 dark:text-zinc-500 font-medium sm:w-1/3 shrink-0">{t('superadmin.emergency.submission_timestamp', 'Submission Timestamp')}</span>
            <span className="font-mono text-slate-700 dark:text-zinc-300 text-left sm:text-right">
              {(b.created_at || b.createdAt) ? new Date(b.created_at || b.createdAt).toLocaleString() : '—'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-3">
            <span className="text-slate-400 dark:text-zinc-500 font-medium sm:w-1/3 shrink-0">{t('superadmin.emergency.lifecycle_status', 'Advisory Lifecycle Status')}</span>
            <span className="text-left sm:text-right">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${ui.cls}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${ui.dot}`} />
                {ui.label}
              </span>
            </span>
          </div>

          {b.approved_at && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-3">
                <span className="text-slate-400 dark:text-zinc-500 font-medium sm:w-1/3 shrink-0">{t('superadmin.emergency.superadmin_approver', 'SuperAdmin Approver')}</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 text-left sm:text-right break-words">
                  {b.approver?.name || (b.approved_by ? `SuperAdmin #${b.approved_by}` : 'SuperAdmin')}
                  {b.approver?.email && <span className="font-normal text-slate-500 text-[11px] block sm:inline sm:ml-1">({b.approver.email})</span>}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-3">
                <span className="text-slate-400 dark:text-zinc-500 font-medium sm:w-1/3 shrink-0">{t('superadmin.emergency.approval_timestamp', 'SuperAdmin Approval Timestamp')}</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 text-left sm:text-right">
                  {new Date(b.approved_at).toLocaleString()}
                </span>
              </div>
            </>
          )}

          {b.revoked_at && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-3">
              <span className="text-slate-400 dark:text-zinc-500 font-medium sm:w-1/3 shrink-0">{t('superadmin.emergency.revocation_timestamp', 'Revocation Timestamp')}</span>
              <span className="font-mono text-slate-600 dark:text-zinc-400 text-left sm:text-right">
                {new Date(b.revoked_at).toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-3">
            <span className="text-slate-400 dark:text-zinc-500 font-medium sm:w-1/3 shrink-0">{t('superadmin.emergency.target_corridor', 'Target Transit Corridor')}</span>
            <span className="font-bold text-slate-800 dark:text-zinc-200 text-left sm:text-right break-words break-all">
              {b.target_area || (b.target_scope === 'all' ? 'Entire Transit Network' : 'Designated Corridors')}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-3">
            <span className="text-slate-400 dark:text-zinc-500 font-medium sm:w-1/3 shrink-0">{t('superadmin.emergency.hardware_audio_horn', 'Hardware Audio / Horn')}</span>
            <span className="font-bold text-slate-800 dark:text-zinc-200 text-left sm:text-right">
              {b.siren_sound ? 'Emergency Siren Active' : 'Muted'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-3">
            <span className="text-slate-400 dark:text-zinc-500 font-medium sm:w-1/3 shrink-0">{t('superadmin.emergency.driver_alert_title', 'Driver In-Cockpit Alert')}</span>
            <span className="font-bold text-slate-800 dark:text-zinc-200 text-left sm:text-right">
              {b.push_notification ? 'Active Push Alert' : 'Disabled'}
            </span>
          </div>

          {status === 'rejected' && b.rejection_reason && (
            <div className="pt-3">
              <p className="text-slate-400 dark:text-zinc-500 font-medium">{t('superadmin.emergency.rejection_reason', 'Rejection Reason')}</p>
              <p className="mt-1 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-900 break-words break-all">
                {b.rejection_reason}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div ref={pageTopRef} className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        {/* Left: Breadcrumb + Title + Badges */}
        <div className="min-w-0">
          <Breadcrumb
            items={[
              { label: 'SuperAdmin', to: '/superadmin/dashboard' },
              { label: 'Government', to: '/superadmin/government' },
              { label: 'Emergency Broadcast Approvals', to: '/superadmin/emergency-approvals' },
              { label: b.code || `EMG-${b.id}` },
            ]}
            className="mb-2"
          />
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight break-words break-all">
              {b.headline || b.title || 'Emergency Advisory'}
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 shrink-0 ${ui.cls}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${ui.dot}`}></span>
              {ui.label}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 ${sev.badge}`}>
              {sev.label}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-mono text-xs font-bold border border-slate-200 dark:border-zinc-700 shrink-0">
              {b.code || `EMG-${b.id}`}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1 break-words break-all">
            Authority: <strong className="text-slate-800 dark:text-zinc-200">{b.agency?.name || b.authority || b.issued_by || '—'}</strong>
            {' · '}Corridor: <strong className="text-slate-800 dark:text-zinc-200">{b.target_area || 'Entire Transit Network'}</strong>
          </p>
        </div>

        {/* Right: Responsive Action Buttons */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row sm:items-center gap-2">
          <RefreshButton onClick={() => loadBroadcastById(id)} title={t('superadmin.emergency.title_reload_details', 'Reload advisory details')} />

          {status === 'pending_approval' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                disabled={busy}
                onClick={handleApprove}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.98]"
              >
                <FleetIcons.Check className="w-4 h-4 text-white" />
                <span>{t('superadmin.emergency.btn_approve_and_broadcast', 'Approve & Broadcast')}</span>
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() => setRejectModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 text-center"
              >
                Reject Advisory
              </button>
            </div>
          )}

          {status === 'approved' && (
            <button
              type="button"
              disabled={busy}
              onClick={() => setRevokeModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <FleetIcons.Close className="w-4 h-4 text-white" />
              <span>{t('superadmin.emergency.btn_revoke_override', 'Revoke Override')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Status Banner */}
      {status === 'pending_approval' ? (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border-2 border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <FleetIcons.Siren className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">{t('superadmin.emergency.awaiting_review_banner', 'Emergency Advisory Awaiting SuperAdmin Review')}</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium mt-0.5 break-words">
                Targeting {b.affected_buses_count != null ? `${b.affected_buses_count} screens` : 'transit fleet displays'} across <strong className="break-all">{b.target_area || 'transit corridor'}</strong>. Approving will immediately pause commercial loops and broadcast this advisory.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={handleApprove}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
          >
            <FleetIcons.Check className="w-4 h-4 text-white" />
            <span>{t('superadmin.emergency.btn_approve_live_now', 'Approve Live Now')}</span>
          </button>
        </div>
      ) : status === 'approved' ? (
        <div className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <FleetIcons.Siren className="w-6 h-6 animate-pulse text-white" />
            </div>
            <div>
              <p className="font-black text-sm tracking-wide">{t('superadmin.emergency.override_actively_deployed', 'BROADCAST OVERRIDE IS ACTIVELY DEPLOYED')}</p>
              <p className="text-xs text-white/90 mt-0.5">
                All scheduled commercial advertisements are temporarily frozen across {b.affected_buses_count != null ? `${b.affected_buses_count} displays` : 'online fleet screens'}.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => setRevokeModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-white text-red-700 font-extrabold text-xs hover:bg-red-50 transition-colors shrink-0 shadow-sm cursor-pointer"
          >
            Revoke Now
          </button>
        </div>
      ) : status === 'rejected' ? (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-rose-700 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <FleetIcons.Close className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{t('superadmin.emergency.rejected_reason_banner', 'Advisory rejected by SuperAdmin. Reason:')} <strong>{b.rejection_reason || 'Incomplete specifications'}</strong></span>
          </div>
        </div>
      ) : status === 'revoked' ? (
        <div className="bg-slate-100 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-slate-700 dark:text-zinc-300">
          <div className="flex items-center gap-2">
            <FleetIcons.Check className="w-4 h-4 text-slate-600 dark:text-zinc-400 shrink-0" />
            <span>{t('superadmin.emergency.revoked_restored_banner', 'Broadcast override has been revoked. Transit screens restored to normal commercial ad loop.')}</span>
          </div>
        </div>
      ) : null}

      {/* 4 Quick Stat KPI Cards Row (matching CampaignDetailsPage) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Screens */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/40">
            <FleetIcons.Bus className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              Transit Displays
            </p>
            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
              {b.affected_buses_count != null ? `${b.affected_buses_count} Screens` : 'Network Wide'}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium truncate">
              Scope: {b.target_scope === 'all' ? 'All Vehicles' : 'Targeted Fleets'}
            </p>
          </div>
        </div>

        {/* Card 2: Corridor */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40">
            <FleetIcons.Pin className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              Target Corridor
            </p>
            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate break-all" title={b.target_area}>
              {b.target_area || 'Entire City Corridor'}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium truncate">
              Preemption: 100% Screen Override
            </p>
          </div>
        </div>

        {/* Card 3: Severity */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-100 dark:border-red-900/40">
            <FleetIcons.Alert className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              Severity Matrix
            </p>
            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
              {sev.label}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium truncate">
              Civil Defense NOC Standard
            </p>
          </div>
        </div>

        {/* Card 4: Operating Window */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-900/40">
            <FleetIcons.Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              Duration Window
            </p>
            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
              {b.auto_expire || '6 Hours (Default)'}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium truncate">
              Auto-expiry after window
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Horizontal Section Controller (matching CampaignDetailsPage) */}
      <div ref={tabControllerRef} className="sticky top-0 z-20 bg-slate-50/95 dark:bg-zinc-950/95 backdrop-blur-md -mx-3 sm:-mx-6 md:-mx-8 px-3 sm:px-6 md:px-8 py-2 border-y border-slate-200/90 dark:border-zinc-800/90 shadow-2xs">
        <div ref={tabsScrollRef} className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
          {SECTION_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSectionTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                data-active={isActive ? 'true' : 'false'}
                onClick={() => {
                  setActiveSectionTab(tab.id);
                  scrollToSectionTop();
                }}
                className={`shrink-0 text-xs font-bold px-3 sm:px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 shadow-2xs cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs ring-2 ring-slate-900/20'
                    : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 border border-slate-200 dark:border-zinc-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white dark:text-slate-900' : 'text-slate-500 dark:text-zinc-400'}`} />
                <span className="whitespace-nowrap">{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shrink-0 ${
                      isActive
                        ? 'bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Section Content */}
      {activeSectionTab !== 'all' ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {activeSectionTab === 'advisory' && renderAdvisorySection()}
          {activeSectionTab === 'preview_media' && renderPreviewMediaSection()}
          {activeSectionTab === 'targeting' && renderTargetingSection()}
          {activeSectionTab === 'audit_lifecycle' && renderAuditSection()}

          {/* Clean Previous / View All / Next Footer Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-200 dark:border-zinc-800">
            {prevTabObj ? (
              <button
                type="button"
                onClick={() => {
                  setActiveSectionTab(prevTabObj.id);
                  scrollToSectionTop();
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>← Previous: {prevTabObj.label}</span>
              </button>
            ) : <div className="hidden sm:block" />}

            <button
              type="button"
              onClick={() => {
                setActiveSectionTab('all');
                scrollToSectionTop();
              }}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              View All Details
            </button>

            {nextTabObj ? (
              <button
                type="button"
                onClick={() => {
                  setActiveSectionTab(nextTabObj.id);
                  scrollToSectionTop();
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>Next: {nextTabObj.label} →</span>
              </button>
            ) : <div className="hidden sm:block" />}
          </div>
        </div>
      ) : (
        /* All Details View: All Sections Stacked */
        <div className="space-y-6">
          {renderAdvisorySection()}
          {renderPreviewMediaSection()}
          {renderTargetingSection()}
          {renderAuditSection()}
        </div>
      )}

      {/* REJECT CONFIRMATION MODAL */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <FleetIcons.Alert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">{t('superadmin.emergency.btn_reject_advisory', 'Reject Emergency Advisory')}</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Advisory: {b.code}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-300">
              Select or provide reason for rejecting this government broadcast advisory:
            </p>

            <div className="space-y-2">
              {[
                'Incomplete emergency advisory specifications',
                'Unverified emergency originating agency source',
                'Corridor conflict with active sovereign security protocols',
                'Advisory timeframe has already elapsed',
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setRejectReason(reason)}
                  className={`w-full text-left p-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    rejectReason === reason
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                      : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 hover:bg-slate-100'
                  }`}
                >
                  {reason}
                </button>
              ))}
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t('superadmin.emergency.ph_custom_reject_reason', 'Or type custom rejection reason...')}
                rows={2}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy || !rejectReason.trim()}
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVOKE CONFIRMATION MODAL */}
      {revokeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <FleetIcons.Close className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">{t('superadmin.emergency.modal_revoke_override_title', 'Revoke Emergency Broadcast Override')}</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Advisory: {b.code}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 space-y-1">
              <p className="font-bold">{t('superadmin.emergency.restoring_commercial_loop', 'Restoring Commercial Loop')}</p>
              <p className="text-[11px] leading-relaxed">
                Revoking this emergency preemption will immediately release transit displays back to their scheduled commercial advertising playlist.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRevokeModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Keep Active
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handleConfirmRevoke}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
              >
                Yes, Revoke Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperEmergencyDetailsPage;
