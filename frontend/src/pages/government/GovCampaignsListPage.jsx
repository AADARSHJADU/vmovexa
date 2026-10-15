import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { useGovernmentRole } from '../../hooks/government/useGovernmentRole';
import Breadcrumb from '../../components/ui/Breadcrumb';

export const GovCampaignsListPage = () => {
  const { campaigns, loadCampaigns, approveCampaign, rejectCampaign, loading } = useGovernmentRole();
  const navigate = useNavigate();
  const location = useLocation();
  const isSuperAdmin = location.pathname.startsWith('/superadmin');
  const basePath = isSuperAdmin ? '/superadmin/government' : '/government';

  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'table'
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    loadCampaigns().catch(() => {});
  }, [loadCampaigns]);

  const campaignList = Array.isArray(campaigns) ? campaigns : (campaigns?.items || campaigns?.rows || []);

  // Derived KPI counts
  const statusOf = (c) => String(c?.status || '').toLowerCase();
  const kpis = {
    activeCampaigns: campaignList.filter(c => statusOf(c) === 'live' || statusOf(c) === 'active').length,
    pendingCampaigns: campaignList.filter(c => statusOf(c) === 'pending_approval').length,
    approvedCampaigns: campaignList.filter(c => statusOf(c) === 'approved').length,
    completedCampaigns: campaignList.filter(c => statusOf(c) === 'completed').length,
  };

  // Filter logic
  const filtered = campaignList.filter(camp => {
    const status = statusOf(camp);
    const matchesTab =
      activeTab === 'All'
        ? true
        : activeTab === 'Active'
        ? status === 'live' || status === 'active'
        : activeTab === 'Pending'
        ? status === 'pending_approval'
        : activeTab === 'Approved'
        ? status === 'approved'
        : activeTab === 'Completed'
        ? status === 'completed'
        : activeTab === 'Rejected'
        ? status === 'rejected'
        : true;

    const titleStr = String(camp?.title || camp?.name || '').toLowerCase();
    const codeStr = String(camp?.code || camp?.id || '').toLowerCase();
    const catStr = String(camp?.category || '').toLowerCase();

    const matchesSearch =
      titleStr.includes(searchQuery.toLowerCase()) ||
      codeStr.includes(searchQuery.toLowerCase()) ||
      catStr.includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Sort logic
  const sorted = [...filtered].sort((a, b) => {
    const aId = String(a?.id ?? '');
    const bId = String(b?.id ?? '');
    if (sortBy === 'latest') return bId.localeCompare(aId);
    if (sortBy === 'oldest') return aId.localeCompare(bId);
    return 0;
  });

  // Pagination logic
  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const paginatedItems = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadge = (status) => {
    switch (String(status || '').toLowerCase()) {
      case 'live':
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'approved':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending_approval':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'completed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleApprove = async (e, id) => {
    e.stopPropagation();
    try {
      await toast.promise(approveCampaign(id), {
        loading: 'Approving campaign...',
        success: 'Campaign approved & broadcast live!',
        error: (err) => err?.message || 'Failed to approve',
      });
      loadCampaigns().catch(() => {});
    } catch (_) {}
  };

  const handleReject = async (e, id) => {
    e.stopPropagation();
    const reason = window.prompt('Enter rejection reason:', 'Creative specifications incomplete');
    if (reason === null) return;
    try {
      await toast.promise(rejectCampaign(id, reason), {
        loading: 'Rejecting campaign...',
        success: 'Campaign rejected.',
        error: (err) => err?.message || 'Failed to reject',
      });
      loadCampaigns().catch(() => {});
    } catch (_) {}
  };

  return (
    <div className="w-full space-y-6 pb-12">

      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <Breadcrumb
            items={[
              { label: 'Dashboard', to: `${basePath}/dashboard` },
              { label: 'Campaigns' }
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">Government Campaigns</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Manage and monitor public welfare communication across transit fleets</p>
        </div>

        <div className="flex items-center gap-3">
          <RefreshButton onClick={() => loadCampaigns()} loading={loading} />
          <button
            onClick={() => navigate(`${basePath}/campaigns/create`)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm shrink-0"
          >
            <FleetIcons.Plus className="w-4 h-4 text-white" />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Summary Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Active (Live)', count: kpis.activeCampaigns, color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
          { label: 'Pending Approval', count: kpis.pendingCampaigns, color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
          { label: 'Approved', count: kpis.approvedCampaigns, color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
          { label: 'Completed', count: kpis.completedCampaigns, color: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-500' },
        ].map(item => (
          <div key={item.label} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${item.dot}`}></span>
              <span className="text-xs font-bold text-slate-600">{item.label}</span>
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">{item.count}</span>
          </div>
        ))}
      </div>

      {/* 3. Search, Filter & View Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        {/* Search Bar */}
        <div className="relative w-full lg:w-96">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <FleetIcons.Search className="w-4 h-4 text-slate-400" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search campaigns by title, category, code..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Tabs & Toggle */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {['All', 'Active', 'Pending', 'Approved', 'Completed', 'Rejected'].map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Sort Select */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-slate-500"
          >
            <option value="latest">Sort: Latest</option>
            <option value="oldest">Sort: Oldest</option>
          </select>

          {/* View Mode Toggle Switch */}
          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            tableValue="table"
            cardValue="card"
          />
        </div>
      </div>

      {/* 4. Main Content: Card View or Table View */}
      {viewMode === 'card' ? (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedItems.map(camp => {
            const mediaUrl = camp?.media?.[0]?.file_url;
            const scansCount = camp?.qrCodes?.[0]?.scan_count || 0;
            const isPending = String(camp?.status).toLowerCase() === 'pending_approval';

            return (
              <div
                key={camp.id}
                onClick={() => navigate(`${basePath}/campaigns/${camp.id}`)}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all cursor-pointer shadow-sm flex flex-col justify-between group"
              >
                <div>
                  <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-950 border border-slate-100 flex items-center justify-center">
                    {mediaUrl ? (
                      <img src={mediaUrl} alt={camp.title} className="w-full h-full object-cover" />
                    ) : (
                      <FleetIcons.Flag className="w-10 h-10 text-slate-600" />
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-bold border border-slate-200 shadow-sm">
                        {camp?.category || 'Public PSA'}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold backdrop-blur-sm ${getStatusBadge(camp?.status)}`}>
                        ● {camp?.status ? camp.status.toUpperCase().replace('_', ' ') : 'DRAFT'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3.5">
                    <h2 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {camp?.title || camp?.name || 'Untitled Campaign'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {camp?.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* 3 Metric counters */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Priority</div>
                      <div className="font-bold text-xs text-slate-900 mt-0.5 uppercase">{camp?.priority || 'NORMAL'}</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Impressions</div>
                      <div className="font-bold text-xs text-slate-900 mt-0.5">{camp?.impressions_delivered || 0}</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Scans</div>
                      <div className="font-bold text-xs text-emerald-600 mt-0.5">{scansCount}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate max-w-[170px] inline-flex items-center gap-1.5"><FleetIcons.Landmark className="w-3.5 h-3.5 text-slate-400 shrink-0" /> <span>{camp?.agency?.agency_name || 'Gov Agency'}</span></span>
                  {isSuperAdmin && isPending ? (
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleApprove(e, camp.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors inline-flex items-center gap-1"
                      >
                        <FleetIcons.Check className="w-3 h-3 text-white" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={(e) => handleReject(e, camp.id)}
                        className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] transition-colors inline-flex items-center gap-1"
                      >
                        <FleetIcons.X className="w-3 h-3 text-white" />
                        <span>Reject</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-blue-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Details</span>
                      <span>→</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Enterprise Table View */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <tr>
                  <th className="py-3.5 px-4">Campaign Title & Code</th>
                  <th className="py-3.5 px-4">Agency</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Impressions</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedItems.map(camp => {
                  const isPending = String(camp?.status).toLowerCase() === 'pending_approval';

                  return (
                    <tr
                      key={camp.id}
                      onClick={() => navigate(`${basePath}/campaigns/${camp.id}`)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{camp?.title || camp?.name || '—'}</div>
                        <div className="font-mono text-[10px] text-slate-400">{camp?.code || camp?.id}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-medium">
                        {camp?.agency?.agency_name || 'Government'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px] border border-slate-200">
                          {camp?.category || 'General'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {camp?.start_date || '—'} – {camp?.end_date || '—'}
                      </td>
                      <td className="py-3.5 px-4 uppercase font-bold text-slate-700">
                        {camp?.priority || 'NORMAL'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-900 font-bold">
                        {camp?.impressions_delivered || 0}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${getStatusBadge(camp?.status)}`}>
                          ● {camp?.status ? camp.status.toUpperCase().replace('_', ' ') : 'DRAFT'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isSuperAdmin && isPending ? (
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => handleApprove(e, camp.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={(e) => handleReject(e, camp.id)}
                              className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`${basePath}/campaigns/${camp.id}`); }}
                            className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors border border-slate-200"
                          >
                            Manage →
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {paginatedItems.length === 0 && (
        <div className="w-full bg-white border border-slate-200 rounded-2xl py-16 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto border border-slate-200">
            <FleetIcons.Search className="w-6 h-6 text-slate-600" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No campaigns found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords or switch to a different status filter tab.
          </p>
        </div>
      )}

      {/* 5. Full Responsive Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={(size) => {
          setItemsPerPage(size);
          setCurrentPage(1);
        }}
        pageSizeOptions={[6, 10, 20, 50]}
      />
    </div>
  );
};
