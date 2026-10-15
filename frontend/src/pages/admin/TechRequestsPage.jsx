import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useAdminTechnicianRequest } from '../../hooks/admin/useAdminTechnicianRequest';
import { useAuth } from '../../hooks/useAuth';

const formatName = (v, fallback = '—') => {
  if (!v) return fallback;
  if (typeof v === 'object') return v.name || v.code || fallback;
  return String(v);
};

export const TechRequestsPage = () => {
  const location = useLocation();
  const isFleetPortal = location.pathname.startsWith('/fleet-manager');
  const basePath = isFleetPortal ? '/fleet-manager/technician-requests' : '/admin/technician-requests';
  const { hasPermission } = useAuth();
  const canView = hasPermission('work_orders.view');
  const canCreate = hasPermission('work_orders.create');
  const canEdit = hasPermission('work_orders.edit') || hasPermission('work_orders.update') || canCreate;

  const { workOrders, pagination, loading, loadWorkOrders } = useAdminTechnicianRequest();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('tech_req_view_mode') || 'table');

  const toggleViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('tech_req_view_mode', mode);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!canView) return;
    const params = { page: currentPage, limit: pageSize };
    if (debouncedSearch) params.search = debouncedSearch;
    loadWorkOrders(params).catch(() => {});
  }, [canView, currentPage, pageSize, debouncedSearch, loadWorkOrders]);

  const requestsList = Array.isArray(workOrders) ? workOrders : (workOrders?.items || workOrders?.rows || []);
  const filteredRequests = requestsList.filter((req) => {
    if (urgencyFilter === 'all') return true;
    const u = (req.urgency || req.priority || 'normal').toLowerCase();
    return u === urgencyFilter.toLowerCase();
  });

  // Calculate Stat Metrics
  const totalWorkOrders = pagination?.total ?? requestsList.length;
  const criticalCount = requestsList.filter((r) => (r.urgency || r.priority || '').toLowerCase() === 'critical').length;
  const pendingDispatch = requestsList.filter((r) => {
    const s = (r.status || 'submitted').toLowerCase();
    return s.includes('submitted') || s.includes('pending');
  }).length;

  if (!canView) {
    return (
      <div className="w-full bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm">
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">Access Revoked</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 font-medium">
          Your administrator has revoked your permission to view technician work orders.
        </p>
        <Link
          to={isFleetPortal ? '/fleet-manager/dashboard' : '/admin/dashboard'}
          className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl mt-4 shadow-sm transition-all"
        >
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: isFleetPortal ? 'Fleet Operator' : 'Tenant Admin', path: isFleetPortal ? '/fleet-manager/dashboard' : '/admin/dashboard' },
              { label: 'Technician Requests' },
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Central Technician Work Orders Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Dispatch requests submitted to VMOVEXA Central Pool for hardware installation, screen repairs, and GPS calibration
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <RefreshButton
            onClick={() => loadWorkOrders({ page: currentPage, limit: pageSize })}
            loading={loading}
          />
          {canCreate && (
            <Link
              to={`${basePath}/new`}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 flex-1 sm:flex-initial"
            >
              <FleetIcons.Plus className="w-4 h-4" />
              <span>New Technician Request</span>
            </Link>
          )}
        </div>
      </div>

      {/* 3 Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Total Work Orders</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{totalWorkOrders} Requests</div>
        </div>
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Pending Dispatch</span>
          <div className="text-xl font-black text-amber-700 dark:text-amber-400 mt-1">{pendingDispatch} Awaiting Tech</div>
        </div>
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Critical Priority</span>
          <div className="text-xl font-black text-rose-700 dark:text-rose-400 mt-1">{criticalCount} High Urgency</div>
        </div>
      </div>

      {/* Filter and View Toggle Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-80">
            <FleetIcons.Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search work order code, issue, vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Urgency Filter */}
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical Only</option>
            <option value="high">High Priority</option>
            <option value="normal">Normal Priority</option>
          </select>
        </div>

        {/* View Toggle Buttons */}
        <ViewModeToggle
          viewMode={viewMode}
          onViewModeChange={toggleViewMode}
          tableValue="table"
          cardValue="grid"
        />
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-sm animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-100 dark:bg-zinc-800 rounded-xl w-full" />
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center text-slate-400 dark:text-zinc-500 font-medium">
          No technician work orders matching your criteria.
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto no-scrollbar">
            <table className="w-full min-w-[700px] text-left text-xs text-slate-700 dark:text-zinc-300">
              <thead className="bg-slate-50 dark:bg-zinc-900/80 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Work Order</th>
                  <th className="py-3 px-4">Target Bus & Depot</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Assigned Tech</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Requested At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
                {filteredRequests.map((req) => {
                  const code = req.code || `WO-${req.id}`;
                  const issue = req.issue_category || req.issueCategory || req.title || 'Work Order';
                  const bus = req.bus_number || req.busNumber || (req.vehicle?.bus_number) || '—';
                  const depot = req.depot_name || formatName(req.depot) || '—';
                  const urgency = (req.urgency || req.priority || 'normal').toUpperCase();
                  const reqDate = req.requested_at ? new Date(req.requested_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : (req.requestedAt || '—');
                  const status = (req.status || 'submitted').replace('_', ' ').toUpperCase();
                  const tech = req.assignedTech || req.technician;

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                            {code}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">{issue}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-zinc-200 font-bold">
                        {bus} <span className="text-slate-400 dark:text-zinc-500 font-sans font-normal">({depot})</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`font-bold ${
                          urgency === 'CRITICAL' ? 'text-rose-600 dark:text-rose-400' : urgency === 'HIGH' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-zinc-400'
                        }`}>
                          {urgency}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700 dark:text-emerald-400">
                        {tech ? formatName(tech) : <span className="text-amber-600 dark:text-amber-400 font-medium">Awaiting Dispatch</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            status.includes('RESOLVED') || status.includes('CLOSED')
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : status.includes('DISPATCHED') || status.includes('ON SITE')
                              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-500 dark:text-zinc-400 font-mono">
                        {reqDate}
                      </td>
                      <td className="py-3.5 px-4 text-right relative">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`${basePath}/${req.id}`}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors inline-block text-slate-600 dark:text-zinc-300"
                            title="View Details"
                          >
                            <FleetIcons.Eye className="w-4 h-4 text-slate-600 dark:text-zinc-300" />
                          </Link>
                          {canEdit && !['resolved', 'closed', 'rejected'].includes((req.status || '').toLowerCase()) && (
                            <Link
                              to={`${basePath}/edit/${req.id}`}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors inline-block text-blue-600 dark:text-blue-400"
                              title="Edit Work Order"
                            >
                              <FleetIcons.Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-zinc-800/80">
            {filteredRequests.map((req) => {
              const code = req.code || `WO-${req.id}`;
              const issue = req.issue_category || req.issueCategory || req.title || 'Work Order';
              const bus = req.bus_number || req.busNumber || (req.vehicle?.bus_number) || '—';
              const depot = req.depot_name || formatName(req.depot) || '—';
              const urgency = (req.urgency || req.priority || 'normal').toUpperCase();
              const reqDate = req.requested_at ? new Date(req.requested_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : (req.requestedAt || '—');
              const status = (req.status || 'submitted').replace('_', ' ').toUpperCase();
              const tech = req.assignedTech || req.technician;

              return (
                <div key={req.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <Link
                        to={`${basePath}/${req.id}`}
                        className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs hover:underline"
                      >
                        {code}
                      </Link>
                      <div className="text-[10px] text-slate-400 dark:text-zinc-500">{reqDate}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        urgency === 'CRITICAL' ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900' : urgency === 'HIGH' ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900' : 'text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700'
                      }`}>
                        {urgency}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        status.includes('RESOLVED') || status.includes('CLOSED')
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : status.includes('DISPATCHED') || status.includes('ON SITE')
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      }`}>
                        {status}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {issue}
                  </div>

                  <div className="p-2 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-100 dark:border-zinc-800 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Bus & Depot</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">{bus}</span>
                      <span className="text-slate-400 text-[11px] ml-1">({depot})</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Assigned Tech</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        {tech ? formatName(tech) : 'Awaiting Dispatch'}
                      </span>
                    </div>
                  </div>

                  {/* Actions for Mobile */}
                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      to={`${basePath}/${req.id}`}
                      className="flex-1 py-2 px-3 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-bold text-center inline-flex items-center justify-center gap-1.5 border border-slate-200 dark:border-zinc-700 shadow-2xs"
                    >
                      <FleetIcons.Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </Link>
                    {canEdit && !['resolved', 'closed', 'rejected'].includes((req.status || '').toLowerCase()) && (
                      <Link
                        to={`${basePath}/edit/${req.id}`}
                        className="py-2 px-3 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold text-center inline-flex items-center justify-center gap-1.5 border border-blue-200 dark:border-blue-800 shadow-2xs"
                      >
                        <FleetIcons.Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map((req) => {
            const code = req.code || `WO-${req.id}`;
            const issue = req.issue_category || req.issueCategory || req.title || 'Work Order';
            const bus = req.bus_number || req.busNumber || (req.vehicle?.bus_number) || '—';
            const depot = req.depot_name || formatName(req.depot) || '—';
            const urgency = (req.urgency || req.priority || 'normal').toUpperCase();
            const reqDate = req.requested_at ? new Date(req.requested_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : (req.requestedAt || '—');
            const status = (req.status || 'submitted').replace('_', ' ').toUpperCase();

            return (
              <div key={req.id} className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                      {code}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{issue}</h3>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border self-start sm:self-auto ${
                      status.includes('RESOLVED') || status.includes('CLOSED')
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : status.includes('DISPATCHED') || status.includes('ON SITE')
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    {status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-zinc-300 font-medium leading-relaxed">{req.description ?? '—'}</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-100 dark:border-zinc-800 text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-zinc-500 text-[10px]">Target Vehicle:</span>
                    <div className="font-mono font-bold text-slate-900 dark:text-white">{bus} ({depot})</div>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-zinc-500 text-[10px]">Priority Level:</span>
                    <div className="font-bold text-slate-800 dark:text-zinc-200">{urgency}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-zinc-500 text-[10px]">Assigned Engineer:</span>
                    <div className="font-bold text-emerald-700 dark:text-emerald-400">
                      {(() => {
                        const tech = req.assignedTech || req.technician;
                        if (!tech) return <span className="text-amber-600 dark:text-amber-400 font-medium">Awaiting Dispatch</span>;
                        return `${formatName(tech)} ${tech.phone ? `(${tech.phone})` : ''}`;
                      })()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500 pt-1">
                  <span>Requested: {reqDate}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-600 dark:text-zinc-400 mr-1">{req.eta ? `ETA: ${req.eta}` : 'SLA Target: 24h'}</span>
                    <Link
                      to={`${basePath}/${req.id}`}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-slate-600 dark:text-zinc-300"
                      title="View Details"
                    >
                      <FleetIcons.Eye className="w-4 h-4 text-slate-600 dark:text-zinc-300" />
                    </Link>
                    {canEdit && !['resolved', 'closed', 'rejected'].includes((req.status || '').toLowerCase()) && (
                      <Link
                        to={`${basePath}/edit/${req.id}`}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-blue-600 dark:text-blue-400"
                        title="Edit Work Order"
                      >
                        <FleetIcons.Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Global Pagination */}
      <div className="p-3 border border-slate-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-[#11141d] shadow-sm">
        <Pagination
          currentPage={pagination?.page || currentPage}
          totalPages={pagination?.totalPages || 1}
          totalItems={pagination?.total ?? requestsList.length}
          pageSize={pagination?.limit || pageSize}
          onPageChange={(p) => setCurrentPage(p)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          pageSizeOptions={[6, 10, 20, 50]}
        />
      </div>
    </div>
  );
};
