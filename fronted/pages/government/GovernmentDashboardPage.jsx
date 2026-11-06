import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { useGovernmentRole } from '../../hooks/government/useGovernmentRole';
import { useAuth } from '../../hooks/useAuth';
import { governmentService } from '../../api/services/government/government.service';
import { resolveFileUrl } from '../../api/services/upload.service';
import { extractYouTubeId } from '../../utils/mediaUtils';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const getGovStatusBadge = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'live' || s === 'running') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
  }
  if (s === 'completed') {
    return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-800';
  }
  if (s === 'scheduled') {
    return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800';
  }
  if (s === 'approved') {
    return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800';
  }
  if (s === 'paused') {
    return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
  }
  if (s === 'pending_approval' || s === 'under review') {
    return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800';
  }
  return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-800';
};

const getCampaignThumbnail = (campaign) => {
  if (!campaign) return null;
  const mediaList = Array.isArray(campaign.media) ? campaign.media : [];

  // 1. Look for image file
  const imageItem = mediaList.find((m) => {
    const url = m.file_url || m.fileUrl || '';
    const type = String(m.media_type || '').toLowerCase();
    return type === 'image' || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url);
  });
  if (imageItem) {
    return {
      type: 'image',
      url: resolveFileUrl(imageItem.file_url || imageItem.fileUrl),
    };
  }

  // 2. YouTube URL
  const ytItem = mediaList.find((m) => {
    const url = m.file_url || m.fileUrl || '';
    return /youtube\.com|youtu\.be/i.test(url);
  });
  if (ytItem) {
    const ytId = extractYouTubeId(ytItem.file_url || ytItem.fileUrl);
    if (ytId) {
      return {
        type: 'youtube',
        url: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
      };
    }
  }

  // 3. Video file
  const videoItem = mediaList.find((m) => {
    const url = m.file_url || m.fileUrl || '';
    const type = String(m.media_type || '').toLowerCase();
    return type === 'video' || /\.(mp4|mov|webm)$/i.test(url);
  });
  if (videoItem) {
    return {
      type: 'video',
      url: resolveFileUrl(videoItem.file_url || videoItem.fileUrl),
    };
  }

  // 4. PDF Document
  const pdfItem = mediaList.find((m) => {
    const url = m.file_url || m.fileUrl || '';
    const type = String(m.media_type || '').toLowerCase();
    return type === 'pdf' || /\.pdf$/i.test(url);
  });
  if (pdfItem) {
    return {
      type: 'pdf',
      url: resolveFileUrl(pdfItem.file_url || pdfItem.fileUrl),
      filename: (pdfItem.file_url || pdfItem.fileUrl || '').split('/').pop(),
    };
  }

  // 5. Fallback properties
  if (campaign.thumbnail || campaign.image_url || campaign.media_url) {
    return {
      type: 'image',
      url: resolveFileUrl(campaign.thumbnail || campaign.image_url || campaign.media_url),
    };
  }

  return null;
};

export const GovernmentDashboardPage = () => {
  const { t } = useTranslation();
  const { broadcasts, campaigns, analytics, loadBroadcasts, loadCampaigns, loadAgencyAnalytics } = useGovernmentRole();
  const { user, hasPermission } = useAuth();
  const canView = hasPermission('government.dashboard.view');
  const navigate = useNavigate();
  const location = useLocation();
  const isSuperAdmin = location.pathname.startsWith('/superadmin');
  const basePath = isSuperAdmin ? '/superadmin/government' : '/government';

  const [tracking, setTracking] = useState({ vehicles: [], stats: { total: 0, broadcasting: 0, withGps: 0 } });

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    if (canView) {
      loadBroadcasts().catch(() => {});
      loadCampaigns().catch(() => {});
      loadAgencyAnalytics().catch(() => {});
      governmentService.getLiveTracking({ routeId: 'all' })
        .then((res) => setTracking({ vehicles: res?.vehicles || [], stats: res?.stats || { total: 0, broadcasting: 0, withGps: 0 } }))
        .catch(() => {});
    }
  }, [canView, loadBroadcasts, loadCampaigns, loadAgencyAnalytics]);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.allSettled([
        loadBroadcasts(),
        loadCampaigns(),
        loadAgencyAnalytics(),
        governmentService.getLiveTracking({ routeId: 'all' })
          .then((res) => setTracking({ vehicles: res?.vehicles || [], stats: res?.stats || { total: 0, broadcasting: 0, withGps: 0 } })),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const profile = { name: user?.name ?? t('gov.dashboard.authority', 'Government Authority') };
  const campaignList = Array.isArray(campaigns) ? campaigns : (campaigns?.items || campaigns?.rows || []);
  const broadcastList = Array.isArray(broadcasts) ? broadcasts : (broadcasts?.items || broadcasts?.rows || []);

  // Real KPIs — prefer the agency analytics endpoint, fall back to list-derived counts.
  const kpis = useMemo(() => {
    const a = analytics?.kpis || {};
    const statusOf = (c) => String(c?.status || '').toLowerCase();
    const activeFromList = campaignList.filter((c) => ['live', 'active', 'approved'].includes(statusOf(c))).length;
    const scheduledFromList = campaignList.filter((c) => ['pending_approval', 'scheduled', 'draft'].includes(statusOf(c))).length;
    const activeAlerts = broadcastList.filter((b) => (b.status || '') === 'approved' || b.active === true).length;
    return {
      activeCampaigns: a.activeCampaigns ?? activeFromList,
      scheduledCampaigns: a.pendingApprovals ?? scheduledFromList,
      emergencyAlerts: activeAlerts || broadcastList.length,
      onlineVehicles: tracking.stats.withGps || 0,
      broadcastingVehicles: tracking.stats.broadcasting || 0,
      totalVehicles: tracking.stats.total || 0,
      totalImpressions: a.totalImpressions ?? 0,
    };
  }, [analytics, campaignList, broadcastList, tracking]);

  // Recent campaigns (real) — any non-draft campaign, newest first.
  const recentCampaigns = useMemo(() => {
    return campaignList
      .filter((c) => String(c.status || '').toLowerCase() !== 'draft')
      .slice(0, 3);
  }, [campaignList]);

  // Init Leaflet + Google Maps tiles once.
  useEffect(() => {
    if (!canView || !mapContainerRef.current || mapInstanceRef.current) return;
    const map = L.map(mapContainerRef.current, {
      center: [23.2380, 77.4180], zoom: 11, zoomControl: false, attributionControl: false,
    });
    L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(map);
    mapInstanceRef.current = map;
    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  }, [canView]);

  // Plot real vehicle GPS markers.
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};
    const gps = (tracking.vehicles || []).filter((v) => v.lat != null && v.lng != null);
    gps.forEach((v) => {
      const color = v.screenStatus === 'Broadcasting' ? '#10b981' : v.screenStatus === 'Standby' ? '#f59e0b' : '#64748b';
      const icon = L.divIcon({
        className: 'gov-dash-node',
        html: `<div style="display:flex;flex-direction:column;align-items:center;">
          <div style="position:relative;width:20px;height:20px;display:flex;align-items:center;justify-content:center;">
            <div style="position:absolute;width:20px;height:20px;background:${color}40;border-radius:50%;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="width:12px;height:12px;background:${color};border:2px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>
          </div>
          <div style="background:rgba(15,23,42,0.92);padding:1px 6px;border-radius:5px;margin-top:2px;"><span style="font-size:9px;font-weight:800;color:#fff;font-family:monospace;">${v.id}</span></div>
        </div>`,
        iconSize: [110, 40], iconAnchor: [55, 20],
      });
      markersRef.current[v.id] = L.marker([v.lat, v.lng], { icon }).addTo(map);
    });
    if (gps.length > 0) {
      try { map.fitBounds(L.latLngBounds(gps.map((v) => [v.lat, v.lng])), { padding: [40, 40], maxZoom: 13 }); } catch (_) {}
    }
  }, [tracking]);

  if (!canView) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm space-y-3">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center">
          <FleetIcons.Key className="w-6 h-6 text-amber-600 dark:text-amber-400" />
        </div>
        <h2 className="text-lg font-black text-slate-900 dark:text-zinc-100">{t('gov.dashboard.access_revoked')}</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
          {t('gov.dashboard.revoked_perm_desc')} (<strong className="font-mono text-xs">{t('ag.government.governmentdashboardpage.government_dashboard_view', 'government.dashboard.view')}</strong>)
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-12 animate-in fade-in duration-200">

      {/* 1. Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="min-w-0 max-w-2xl">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-bold">
              {t('ag.government.governmentdashboardpage.official_state_agency', 'Official State Agency')}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-zinc-100">
            {profile.name} {t('ag.government.governmentdashboardpage.public_transit_communication_console', '— Public Transit Communication Console')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            {t('ag.government.governmentdashboardpage.monitor_and_manage_state_public_welfare_camp', 'Monitor and manage state public welfare campaigns, transit broadcasts & emergency advisories.')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full xl:w-auto shrink-0">
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <RefreshButton
              onClick={handleRefresh}
              loading={refreshing}
              title={t('gov.dashboard.refresh')}
              className="flex-1 sm:flex-none h-10"
            />
            <button
              type="button"
              onClick={() => navigate(`${basePath}/emergency`)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 text-xs font-bold transition-all shadow-sm shrink-0 whitespace-nowrap cursor-pointer active:scale-98"
            >
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping shrink-0"></span>
              <FleetIcons.Alert className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
              <span>{t('gov.dashboard.emergency_alert')}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate(`${basePath}/campaigns/create`)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 shrink-0 whitespace-nowrap cursor-pointer active:scale-98"
          >
            <FleetIcons.Plus className="w-4 h-4 text-white shrink-0" />
            <span>{t('gov.dashboard.create_campaign')}</span>
          </button>
        </div>
      </div>

      {/* 2. Real KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div onClick={() => navigate(`${basePath}/campaigns`)} className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{t('gov.dashboard.active_campaigns')}</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center"><FleetIcons.Flag className="w-5 h-5 text-amber-600 dark:text-amber-400" /></div>
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">{kpis.activeCampaigns}</div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 font-semibold">{t('gov.dashboard.live_screens')}</p>
          </div>
        </div>

        <div onClick={() => navigate(`${basePath}/campaigns`)} className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-sky-400 hover:shadow-md transition-all cursor-pointer shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{t('common.pending_scheduled')}</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 flex items-center justify-center"><FleetIcons.Clock className="w-5 h-5 text-sky-600 dark:text-sky-400" /></div>
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">{kpis.scheduledCampaigns}</div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 font-semibold">{t('gov.dashboard.awaiting_approval')}</p>
          </div>
        </div>

        <div onClick={() => navigate(`${basePath}/tracking`)} className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{t('gov.dashboard.vehicles_gps')}</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center"><FleetIcons.Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /></div>
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">{kpis.onlineVehicles}</div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 font-semibold">{kpis.broadcastingVehicles} {t('ag.government.governmentdashboardpage.broadcasting', 'broadcasting ·')} {kpis.totalVehicles} {t('ag.government.governmentdashboardpage.total', 'total')}</p>
          </div>
        </div>

        <div onClick={() => navigate(`${basePath}/emergency`)} className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-red-400 hover:shadow-md transition-all cursor-pointer shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{t('gov.dashboard.active_alerts')}</span>
            <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 flex items-center justify-center"><FleetIcons.Alert className="w-5 h-5 text-red-600 dark:text-rose-400 animate-pulse" /></div>
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400 tracking-tight">{kpis.emergencyAlerts}</div>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1.5 font-semibold">{t('gov.dashboard.active_alerts')}</p>
          </div>
        </div>
      </div>

      {/* 3. Emergency hero */}
      <div className="w-full bg-gradient-to-r from-red-50 via-rose-50 to-orange-50 dark:from-red-950/40 dark:via-rose-950/40 dark:to-orange-950/40 border border-red-200 dark:border-red-800/80 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-red-100 dark:bg-red-900/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <FleetIcons.Alert className="w-6 h-6 text-red-600 dark:text-red-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100">{t('gov.dashboard.channel_title')}</h2>
            <p className="text-xs text-slate-600 dark:text-zinc-300 mt-0.5 leading-relaxed">
              {t('ag.government.governmentdashboardpage.submit_high_priority_override_alerts_super_a', 'Submit high-priority override alerts (Super Admin approves before going live on all transit screens).')}
            </p>
          </div>
        </div>
        <button onClick={() => navigate(`${basePath}/emergency`)} className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm shrink-0 flex items-center justify-center gap-1.5 shadow-red-600/20 cursor-pointer active:scale-98">
          <span>{t('gov.dashboard.dispatch_alert')}</span>
          <FleetIcons.ArrowLeft className="w-3.5 h-3.5 rotate-180" />
        </button>
      </div>

      {/* 4. Live transit map (real GPS) */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">{t('gov.dashboard.maps_coverage')}</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{t('gov.dashboard.maps_sub')}</p>
          </div>
          <Link to={`${basePath}/tracking`} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 self-start sm:self-auto">
            <span>{t('gov.dashboard.view_full_map')}</span>
            <FleetIcons.ArrowLeft className="w-3.5 h-3.5 rotate-180" />
          </Link>
        </div>

        <div className="relative w-full h-72 sm:h-88 rounded-2xl bg-slate-950 border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-inner">
          <div ref={mapContainerRef} className="w-full h-full z-10" />
          {tracking.stats.withGps === 0 && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
              <div className="bg-white/95 dark:bg-zinc-900/95 px-4 py-3 rounded-xl text-center shadow-lg border border-slate-200 dark:border-zinc-800">
                <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">{t('gov.dashboard.no_gps_positions')}</p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('gov.dashboard.gps_appear_desc')}</p>
              </div>
            </div>
          )}
          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 flex flex-wrap items-center gap-2">
            <div className="bg-white/95 dark:bg-zinc-900/95 border border-slate-200 dark:border-zinc-800 backdrop-blur-md px-3.5 py-1.5 rounded-xl flex items-center gap-2 shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-black text-slate-900 dark:text-zinc-100">{kpis.onlineVehicles}</span>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">{t('gov.dashboard.vehicles_gps')}</span>
            </div>
            <div className="bg-white/95 dark:bg-zinc-900/95 border border-slate-200 dark:border-zinc-800 backdrop-blur-md px-3.5 py-1.5 rounded-xl flex items-center gap-2 shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className="text-xs font-black text-slate-900 dark:text-zinc-100">{kpis.broadcastingVehicles}</span>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">{t('gov.tracking.broadcasting_live')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Recent Broadcast Campaigns (List Format) */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <FleetIcons.Megaphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{t('gov.dashboard.recent_campaigns', 'Recent Broadcast Campaigns')}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{t('gov.dashboard.recent_sub', 'Public welfare and awareness announcements across transit displays')}</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              to={`${basePath}/campaigns/create`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-98 transition-all"
            >
              <FleetIcons.Plus className="w-3.5 h-3.5 text-white" />
              <span>{t('campaign_create.create_button', 'New Campaign')}</span>
            </Link>
            <Link
              to={`${basePath}/campaigns`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 transition-colors"
            >
              <span>{t('ag.government.governmentdashboardpage.view_all', 'View All (')}{campaignList.length})</span>
              <FleetIcons.ArrowLeft className="w-3 h-3 rotate-180" />
            </Link>
          </div>
        </div>

        {recentCampaigns.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 dark:text-zinc-500 mx-auto">
              <FleetIcons.Megaphone className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">{t('gov.dashboard.no_campaigns', 'No broadcast campaigns found')}</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">{t('gov.dashboard.create_first_campaign', 'Create and broadcast public welfare messages across bus display nodes.')}</p>
            <Link
              to={`${basePath}/campaigns/create`}
              className="inline-flex items-center gap-1.5 px-4 py-2 mt-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-98 transition-all"
            >
              <FleetIcons.Plus className="w-3.5 h-3.5" />
              <span>{t('ag.government.governmentdashboardpage.create_first_broadcast', 'Create First Broadcast')}</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
            {recentCampaigns.map((camp) => {
              const thumb = getCampaignThumbnail(camp);
              const totalScreens = (camp.targets || []).reduce((acc, t) => acc + (t.screens_count || 0), 0);
              const totalBuses = (camp.targets || []).reduce((acc, t) => acc + (t.vehicles_count || (Array.isArray(t.vehicle_ids) ? t.vehicle_ids.length : 0) || 1), 0);
              const timeDisplay = camp.broadcast_start_time && camp.broadcast_end_time
                ? `${String(camp.broadcast_start_time).slice(0, 5)} – ${String(camp.broadcast_end_time).slice(0, 5)} IST`
                : null;

              return (
                <div
                  key={camp.id}
                  onClick={() => navigate(`${basePath}/campaigns/${camp.id}`)}
                  className="py-3.5 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 px-2 sm:px-3 rounded-xl transition-all cursor-pointer group"
                >
                  {/* Left: Thumbnail & Main Info */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                    {/* Creative Thumbnail Box */}
                    <div className="relative w-20 sm:w-24 h-16 sm:h-18 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 flex items-center justify-center shadow-2xs">
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500">
                        <FleetIcons.Megaphone className="w-6 h-6" />
                      </div>
                      {thumb?.url && (
                        <img
                          src={thumb.url}
                          alt={camp.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}

                      {/* Small Category Pill Overlay */}
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-xs z-10">
                        {camp.category || t('gov.dashboard.psa', 'PSA')}
                      </span>
                    </div>

                    {/* Meta & Title */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-zinc-800">
                          {camp.code || `CMP-${camp.id}`}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                          {camp.client_company || camp.brand_name || camp.agency?.name || t('gov.dashboard.dept_safety', 'Department of Public Safety')}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {camp.title || camp.name || '—'}
                      </h3>

                      <div className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-3 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <FleetIcons.Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                          <span>{camp.start_date || '—'} {t('ag.government.governmentdashboardpage.to', 'to')} {camp.end_date || '—'}</span>
                        </span>
                        {timeDisplay && (
                          <span className="inline-flex items-center gap-1">
                            <FleetIcons.Clock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                            <span>{timeDisplay}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Metrics, Status & View Action */}
                  <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-0 border-slate-100 dark:border-zinc-800">
                    {/* Reach */}
                    <div className="text-left md:text-right">
                      <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                        {totalBuses} {t('common.buses', 'Buses')} · {totalScreens || 1} {t('common.screens', 'Screens')}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                        {Number(camp.impressions_delivered || 0).toLocaleString()} {t('ag.government.governmentdashboardpage.impressions', 'Impressions')}
                      </p>
                    </div>

                    {/* Status Pill */}
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs inline-flex items-center gap-1.5 ${getGovStatusBadge(camp.status)}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      <span>{camp.status ? t(`common.status_${camp.status.toLowerCase()}`, camp.status) : '—'}</span>
                    </span>

                    {/* Arrow Action */}
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-600 text-slate-600 dark:text-zinc-400 flex items-center justify-center transition-all shrink-0">
                      <FleetIcons.ArrowLeft className="w-3.5 h-3.5 rotate-180 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GovernmentDashboardPage;
