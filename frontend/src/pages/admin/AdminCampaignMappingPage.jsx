import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiClient } from '../../api/client.js';
import { ENDPOINTS } from '../../api/endpoints.js';
import { unwrap } from '../../utils/apiResponse.js';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { RefreshButton } from '../../components/ui/RefreshButton.jsx';
import { FleetIcons } from '../../components/FleetIcons.jsx';
import Breadcrumb from '../../components/ui/Breadcrumb.jsx';

export const AdminCampaignMappingPage = () => {
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/admin' : '/admin';

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'live' | 'approved' | 'paused'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [syncingId, setSyncingId] = useState(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(ENDPOINTS.CAMPAIGNS.LIST, {
        params: { limit: 100, page: 1 }
      });
      const data = unwrap(res.data);
      const rows = Array.isArray(data) ? data : (data?.rows || data?.items || []);
      // Filter out drafts or rejected campaigns
      setCampaigns(rows.filter(c => c.status !== 'draft' && c.status !== 'rejected'));
    } catch (err) {
      toast.error('Failed to load campaign deployment mappings: ' + (err?.message || 'Server error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Flatten campaigns with their targets for granular row-level inspection
  const flattenedDeployments = useMemo(() => {
    const list = [];
    campaigns.forEach(c => {
      const targets = c.targets || [];
      if (targets.length === 0) {
        list.push({
          campaign: c,
          target: null,
          fleetName: 'Transit Network',
          routeName: 'All Fleet Routes',
          startPoint: '',
          endPoint: '',
          buses: [],
          screensCount: 0,
          screensPerVehicle: 1,
        });
      } else {
        targets.forEach(tg => {
          const route = tg.route;
          list.push({
            campaign: c,
            target: tg,
            fleetName: tg.fleet_name || 'Transit Network',
            routeName: route ? route.name : (tg.route_id ? `Route #${tg.route_id}` : 'General Fleet Route'),
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

  // Search & Status filter
  const filteredDeployments = useMemo(() => {
    return flattenedDeployments.filter(item => {
      const c = item.campaign;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        String(c.title || '').toLowerCase().includes(q) ||
        String(c.code || '').toLowerCase().includes(q) ||
        String(c.brand_name || '').toLowerCase().includes(q) ||
        String(c.client_name || '').toLowerCase().includes(q) ||
        String(c.client_company || '').toLowerCase().includes(q) ||
        String(item.fleetName || '').toLowerCase().includes(q) ||
        String(item.routeName || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (statusFilter === 'live') return c.status === 'live';
      if (statusFilter === 'approved') return c.status === 'approved' && c.payment_status !== 'paid';
      if (statusFilter === 'paused') return c.status === 'paused' || c.status === 'stopped';
      return true;
    });
  }, [flattenedDeployments, searchQuery, statusFilter]);

  // KPIs
  const kpis = useMemo(() => {
    const liveCampaigns = campaigns.filter(c => c.status === 'live');
    const totalBuses = flattenedDeployments.reduce((sum, d) => sum + (d.vehiclesCount || 0), 0);
    const totalScreens = flattenedDeployments.reduce((sum, d) => sum + (d.screensCount || 0), 0);
    const uniqueRoutes = new Set(flattenedDeployments.map(d => d.routeName).filter(Boolean)).size;

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
      toast.success(`✓ MQTT broadcast re-dispatched for ${code}!`);
      await fetchCampaigns();
    } catch (err) {
      toast.error('Dispatch trigger failed: ' + (err?.message || 'Server error'));
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'Dashboard', to: `${basePath}/dashboard` },
              { label: 'Campaign Mapping' }
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
            Campaign Transit Fleet & Route Mapping
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Active DOOH broadcast deployment matrix: which campaigns are assigned to which routes, buses, and digital display screens
          </p>
        </div>

        <div className="flex items-center gap-2">
          <RefreshButton
            onClick={fetchCampaigns}
            loading={loading}
            label="Refresh Status"
          />
          <Link
            to={`${basePath}/routes`}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <FleetIcons.Trips className="w-3.5 h-3.5" />
            <span>Manage Transit Routes</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Ad Broadcasts</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-emerald-600">{kpis.liveCount}</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Broadcasting
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">Campaigns actively displaying on buses</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Covered Transit Routes</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-slate-900">{kpis.uniqueRoutes}</span>
            <span className="text-[10px] font-bold text-slate-500">Transit Corridors</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">Distinct bus routes targeted by DOOH ads</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vehicles with Active Ads</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-blue-600">{kpis.totalBuses}</span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              Buses Assigned
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">Buses running targeted DOOH media</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total DOOH Display Screens</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-slate-900">{kpis.totalScreens}</span>
            <span className="text-[10px] font-bold text-slate-500">Displays</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">Passenger saloon and rear display panels</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Deployments', count: flattenedDeployments.length },
            { id: 'live', label: 'Live on Screens', count: flattenedDeployments.filter(d => d.campaign.status === 'live').length },
            { id: 'approved', label: 'Awaiting Payment', count: flattenedDeployments.filter(d => d.campaign.status === 'approved' && d.campaign.payment_status !== 'paid').length },
            { id: 'paused', label: 'Paused', count: flattenedDeployments.filter(d => d.campaign.status === 'paused' || d.campaign.status === 'stopped').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setStatusFilter(tab.id); setCurrentPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative sm:w-80">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search campaign, route, fleet, or bus..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>
      </div>

      {/* Main Deployment Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-slate-300 border-t-slate-900 rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">Querying DOOH transit deployment matrix...</p>
          </div>
        ) : pagedDeployments.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FleetIcons.Bus className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No campaign deployments found</p>
            <p className="text-xs text-slate-400">
              {searchQuery ? `No results match "${searchQuery}" in this filter.` : 'No campaigns mapped to routes yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                  <th className="py-3 px-4">Campaign & Advertiser</th>
                  <th className="py-3 px-4">Fleet Operator</th>
                  <th className="py-3 px-4">Assigned Route</th>
                  <th className="py-3 px-4 text-center">Buses & Screens</th>
                  <th className="py-3 px-4 text-center">Broadcast Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {pagedDeployments.map((item, idx) => {
                  const c = item.campaign;
                  const isLive = c.status === 'live';
                  const isAwaitingPay = c.status === 'approved' && c.payment_status !== 'paid';
                  const vehicleIds = item.vehicleIds || [];

                  return (
                    <tr key={`${c.id}-${idx}`} className="hover:bg-slate-50/60 transition-colors">
                      {/* Campaign */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            {c.media?.[0]?.media_type === 'video' ? (
                              <FleetIcons.Video className="w-4 h-4 text-indigo-500" />
                            ) : (
                              <FleetIcons.Image className="w-4 h-4 text-sky-500" />
                            )}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{c.title}</p>
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                              {c.code} · <span className="font-sans font-medium text-slate-700">{c.client_name ? `Client: ${c.client_name}` : (c.brand_name || 'Brand Ad')}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Fleet Operator */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800">{item.fleetName}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Transit Operator</p>
                      </td>

                      {/* Route */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900">{item.routeName}</p>
                          {item.startPoint && item.endPoint ? (
                            <p className="text-[11px] text-slate-500">
                              {item.startPoint} → {item.endPoint}
                            </p>
                          ) : (
                            <p className="text-[11px] text-slate-400">Entire transit corridor</p>
                          )}
                        </div>
                      </td>

                      {/* Buses & Screens */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-black text-slate-900 text-xs">
                            {vehicleIds.length > 0 ? `${vehicleIds.length} Buses` : (item.vehiclesCount > 0 ? `${item.vehiclesCount} Buses` : 'All Buses on Route')}
                          </span>
                          <span className="text-[10px] text-slate-500 mt-0.5">
                            {item.screensCount || (vehicleIds.length * item.screensPerVehicle) || 3} Screens
                          </span>
                        </div>
                      </td>

                      {/* Broadcast Status */}
                      <td className="py-3.5 px-4 text-center">
                        {isLive ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Broadcasting Live
                          </span>
                        ) : isAwaitingPay ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            <FleetIcons.Hourglass className="w-3 h-3 text-amber-500" /> Awaiting Client Payment
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {c.status}
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
                              title="Re-send MQTT dispatch signal to all edge boxes"
                              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-[11px] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                            >
                              {syncingId === c.id ? (
                                <FleetIcons.Spinner className="w-3 h-3 animate-spin" />
                              ) : (
                                <FleetIcons.Signal className="w-3 h-3 text-slate-600" />
                              )}
                              <span>{syncingId === c.id ? 'Syncing...' : 'Re-sync MQTT'}</span>
                            </button>
                          )}
                          <Link
                            to={`/advertiser/campaigns/${c.id}`}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition-colors shadow-sm"
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
        <div className="p-3 border-t border-slate-200">
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
