import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiClient } from '../../api/client.js';
import { ENDPOINTS } from '../../api/endpoints.js';
import { unwrap } from '../../utils/apiResponse.js';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { RefreshButton } from '../../components/ui/RefreshButton.jsx';
import { FleetIcons } from '../../components/FleetIcons.jsx';
import { Breadcrumb } from '../../components/ui/Breadcrumb.jsx';
import { useTranslation } from '../../hooks/useTranslation';

export const AdminCampaignMappingPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/admin' : '/admin';

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'live' | 'paused'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [syncingId, setSyncingId] = useState(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(ENDPOINTS.CAMPAIGNS.LIST, {
        params: { limit: 100, page: 1 },
      });
      const data = unwrap(res.data);
      const rows = Array.isArray(data) ? data : (data?.rows || data?.items || []);
      // Filter out drafts and rejected campaigns
      setCampaigns(rows.filter((c) => c.status !== 'draft' && c.status !== 'rejected'));
    } catch (err) {
      toast.error('Failed to load campaign route mappings: ' + (err?.message || 'Server error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Flatten campaigns with their targets for row-level inspection
  const flattenedDeployments = useMemo(() => {
    const list = [];
    campaigns.forEach((c) => {
      const targets = c.targets || [];
      if (targets.length === 0) {
        list.push({
          campaign: c,
          target: null,
          fleetName: 'Transit Fleet',
          routeName: 'All Fleet Routes',
          startPoint: '',
          endPoint: '',
          vehicleIds: [],
          screensCount: 0,
          vehiclesCount: 0,
          screensPerVehicle: 1,
        });
      } else {
        targets.forEach((tg) => {
          const route = tg.route;
          list.push({
            campaign: c,
            target: tg,
            fleetName: tg.fleet_name || 'Transit Fleet',
            routeName: route ? route.name : (tg.route_id ? `Route #${tg.route_id}` : 'General Route'),
            startPoint: route?.start_point || '',
            endPoint: route?.end_point || '',
            vehicleIds: tg.vehicle_ids || [],
            screensCount: tg.screens_count || 0,
            vehiclesCount: tg.vehicles_count || (tg.vehicle_ids?.length || 0),
            screensPerVehicle: tg.screens_per_vehicle || 1,
          });
        });
      }
    });
    return list;
  }, [campaigns]);

  // Search & Status filter (Only All, Live, Paused)
  const filteredDeployments = useMemo(() => {
    return flattenedDeployments.filter((item) => {
      const c = item.campaign;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        String(c.title || '').toLowerCase().includes(q) ||
        String(c.code || '').toLowerCase().includes(q) ||
        String(c.brand_name || '').toLowerCase().includes(q) ||
        String(c.client_name || '').toLowerCase().includes(q) ||
        String(item.fleetName || '').toLowerCase().includes(q) ||
        String(item.routeName || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (statusFilter === 'live') return c.status === 'live';
      if (statusFilter === 'paused') return c.status === 'paused' || c.status === 'stopped';
      return true;
    });
  }, [flattenedDeployments, searchQuery, statusFilter]);

  // Clean KPIs
  const kpis = useMemo(() => {
    const liveCampaigns = campaigns.filter((c) => c.status === 'live');
    const totalBuses = flattenedDeployments.reduce((sum, d) => sum + (d.vehiclesCount || 0), 0);
    const totalScreens = flattenedDeployments.reduce((sum, d) => sum + (d.screensCount || 0), 0);
    const uniqueRoutes = new Set(flattenedDeployments.map((d) => d.routeName).filter(Boolean)).size;

    return {
      liveCount: liveCampaigns.length,
      totalDeployments: flattenedDeployments.length,
      totalBuses,
      totalScreens,
      uniqueRoutes,
    };
  }, [campaigns, flattenedDeployments]);

  // Pagination Slice
  const totalItems = filteredDeployments.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const pagedDeployments = filteredDeployments.slice(startIndex, startIndex + pageSize);

  const handleTriggerDispatch = async (campaignId, code) => {
    setSyncingId(campaignId);
    try {
      await apiClient.post(ENDPOINTS.CAMPAIGNS.START(campaignId));
      toast.success(`Screen broadcast re-synced for ${code}!`);
      await fetchCampaigns();
    } catch (err) {
      toast.error('Re-sync failed: ' + (err?.message || 'Server error'));
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <Breadcrumb
            items={[
              { label: 'Admin', path: `${basePath}/dashboard` },
              { label: t('admin.campaign_mapping.title') },
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Campaign Mapping
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
            {t('admin.campaign_mapping.desc')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <RefreshButton
            onClick={fetchCampaigns}
            loading={loading}
          />
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{t('admin.campaign_mapping.live_ads')}</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <FleetIcons.Broadcast className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{kpis.liveCount}</p>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">{t('admin.campaign_mapping.live_ads_desc')}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{t('admin.campaign_mapping.active_routes')}</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <FleetIcons.Trips className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{kpis.uniqueRoutes}</p>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">{t('admin.campaign_mapping.active_routes_desc')}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{t('admin.campaign_mapping.active_screens')}</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <FleetIcons.Monitor className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{kpis.totalScreens}</p>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">Screens across {kpis.totalBuses} buses</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All', count: flattenedDeployments.length },
            { id: 'live', label: 'Live on Buses', count: flattenedDeployments.filter((d) => d.campaign.status === 'live').length },
            { id: 'paused', label: 'Paused', count: flattenedDeployments.filter((d) => d.campaign.status === 'paused' || d.campaign.status === 'stopped').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-700'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                statusFilter === tab.id
                  ? 'bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900'
                  : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative sm:w-80">
          <FleetIcons.Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={t('admin.campaign_mapping.search_ph')}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
          />
        </div>
      </div>

      {/* Main Deployment Matrix Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-slate-300 border-t-slate-900 rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500 dark:text-zinc-400">{t('admin.campaign_mapping.loading')}</p>
          </div>
        ) : pagedDeployments.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FleetIcons.Bus className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">{t('admin.campaign_mapping.no_mappings')}</p>
            <p className="text-xs text-slate-400 dark:text-zinc-500">
              {searchQuery ? `No results matching "${searchQuery}".` : 'No active ad campaigns mapped to routes.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-bold uppercase text-slate-500 dark:text-zinc-400 tracking-wider">
                  <th className="py-3.5 px-4">{t('admin.campaign_mapping.th_campaign')}</th>
                  <th className="py-3.5 px-4">{t('admin.campaign_mapping.th_fleet')}</th>
                  <th className="py-3.5 px-4">{t('admin.campaign_mapping.th_route')}</th>
                  <th className="py-3.5 px-4 text-center">{t('admin.campaign_mapping.th_buses_screens')}</th>
                  <th className="py-3.5 px-4 text-center">{t('admin.campaign_mapping.th_status')}</th>
                  <th className="py-3.5 px-4 text-right">{t('admin.campaign_mapping.th_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                {pagedDeployments.map((item, idx) => {
                  const c = item.campaign;
                  const isLive = c.status === 'live';
                  const vehicleIds = item.vehicleIds || [];

                  return (
                    <tr key={`${c.id}-${idx}`} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                      {/* Campaign */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
                            {c.media?.[0]?.media_type === 'video' ? (
                              <FleetIcons.Video className="w-4 h-4" />
                            ) : (
                              <FleetIcons.Image className="w-4 h-4" />
                            )}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate">{c.title}</p>
                            <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5">
                              {c.code} · <span className="font-sans font-medium text-slate-600 dark:text-zinc-400">{c.client_name ? `Client: ${c.client_name}` : (c.brand_name || 'Brand Ad')}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Fleet Operator */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800 dark:text-zinc-200">{item.fleetName}</p>
                        <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">{t('admin.campaign_mapping.transit_fleet')}</p>
                      </td>

                      {/* Route */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 dark:text-white">{item.routeName}</p>
                          {item.startPoint && item.endPoint ? (
                            <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                              <span>{item.startPoint}</span> <FleetIcons.ArrowRight className="w-3 h-3 text-slate-400 inline mx-1" /> <span>{item.endPoint}</span>
                            </p>
                          ) : (
                            <p className="text-[11px] text-slate-400 dark:text-zinc-500">{t('admin.campaign_mapping.corridor_route')}</p>
                          )}
                        </div>
                      </td>

                      {/* Buses & Screens */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-black text-slate-900 dark:text-white text-xs">
                            {vehicleIds.length > 0 ? `${vehicleIds.length} Buses` : (item.vehiclesCount > 0 ? `${item.vehiclesCount} Buses` : 'All Buses')}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
                            {item.screensCount || (vehicleIds.length * item.screensPerVehicle) || 3} Screens
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {isLive ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live on Screens
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700">
                            {c.status === 'paused' || c.status === 'stopped' ? 'Paused' : 'Scheduled'}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isLive && (
                            <button
                              onClick={() => handleTriggerDispatch(c.id, c.code)}
                              disabled={syncingId === c.id}
                              title={t('admin.campaign_mapping.resync_broadcast')}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold text-[11px] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                            >
                              <FleetIcons.Refresh className={`w-3 h-3 ${syncingId === c.id ? 'animate-spin' : ''}`} />
                              <span>{syncingId === c.id ? t('common.syncing') : t('common.resync')}</span>
                            </button>
                          )}
                          <Link
                            to={`/advertiser/campaigns/${c.id}`}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-slate-900 font-bold text-[11px] transition-colors shadow-sm"
                          >
                            Details
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Global Pagination Component */}
        <div className="p-3 border-t border-slate-200 dark:border-zinc-800">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 20, 50, 100]}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminCampaignMappingPage;
