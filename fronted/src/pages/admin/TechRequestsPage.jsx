import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useAdminTechnicianRequest } from '../../hooks/admin/useAdminTechnicianRequest';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import {
  getStatusConfig,
  getUrgencyConfig,
  formatDisplayValue,
  formatExactDateTime,
  formatWorkOrderCode,
} from '../../features/workOrders/workOrderPresentation';

export const TechRequestsPage = () => {
  const location = useLocation();
  const isFleetPortal = location.pathname.startsWith('/fleet-operator');
  const basePath = isFleetPortal ? '/fleet-operator/technician-requests' : '/admin/technician-requests';
  const { hasPermission } = useAuth();
  const { t } = useTranslation();
  const canView = hasPermission('work_orders.view');
  const canCreate = hasPermission('work_orders.create');

  const { workOrders, pagination, loading, error, loadWorkOrders } = useAdminTechnicianRequest();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return 'grid';
    const saved = localStorage.getItem('tech_req_view_mode');
    if (saved) return saved;
    return 'table';
  });

  const toggleViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('tech_req_view_mode', mode);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchOrders = useCallback(() => {
    if (!canView) return;
    const params = {
      page: currentPage,
      limit: pageSize,
    };
    if (debouncedSearch) params.search = debouncedSearch;
    if (statusFilter !== 'all') params.status = statusFilter;
    if (urgencyFilter !== 'all') params.urgency = urgencyFilter;
    loadWorkOrders(params).catch(() => {});
  }, [canView, currentPage, pageSize, debouncedSearch, statusFilter, urgencyFilter, loadWorkOrders]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const requestsList = Array.isArray(workOrders) ? workOrders : (workOrders?.items || workOrders?.rows || []);

  const totalWorkOrders = pagination?.total ?? requestsList.length;
  const hasActiveFilters = Boolean(searchQuery.trim() || statusFilter !== 'all' || urgencyFilter !== 'all');

  const resetFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setStatusFilter('all');
    setUrgencyFilter('all');
    setCurrentPage(1);
  };

  if (!canView) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
          <FleetIcons.Key className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('common.access_denied')}</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 font-medium">
          You do not have permission to view technician requests. Please contact your administrator.
        </p>
        <Link
          to={isFleetPortal ? '/fleet-operator/dashboard' : '/admin/dashboard'}
          className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl mt-4 shadow-sm transition-all"
        >
          Back to Dashboard
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
              { label: isFleetPortal ? 'Fleet Operator' : 'Tenant Admin', path: isFleetPortal ? '/fleet-operator/dashboard' : '/admin/dashboard' },
              { label: 'Technician Requests' },
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Technician Requests
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            {t('admin.tech_requests.desc', 'Review, track, and dispatch operational work orders for depot transit units.')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:flex items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          <RefreshButton
            onClick={fetchOrders}
            loading={loading}
          />
          {canCreate && (
            <Link
              to={`${basePath}/new`}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 flex-1 sm:flex-initial"
            >
              <FleetIcons.Plus className="w-4 h-4" />
              <span>{t('admin.tech_requests.new_request', 'New Request')}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Real Server Summary Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            {t('admin.tech_requests.total_requests', 'Total Work Orders')}
          </span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {totalWorkOrders}
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Current Page Results
          </span>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {requestsList.length}
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Active Filter Scope
          </span>
          <div className="text-xs font-bold text-slate-700 dark:text-zinc-300 mt-2 truncate">
            Status: {statusFilter.toUpperCase()} | Urgency: {urgencyFilter.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Filter and View Toggle Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0 sm:min-w-[200px] sm:max-w-xs">
            <FleetIcons.Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('admin.tech_requests.search_ph', 'Search by code, vehicle, category...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {searchQuery && (
              <button type="button" onClick={() => { setSearchQuery(''); setDebouncedSearch(''); setCurrentPage(1); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200" aria-label="Clear search">
                <FleetIcons.Close className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Pending Assignment</option>
            <option value="approved">Approved</option>
            <option value="dispatched">Dispatched</option>
            <option value="on_site">On Site</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Urgency Filter */}
          <select
            value={urgencyFilter}
            onChange={(e) => {
              setUrgencyFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">{t('admin.tech_requests.all_priorities', 'All Urgencies')}</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>

          {hasActiveFilters && (
            <button type="button" onClick={resetFilters} className="w-full sm:w-auto px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-xs font-bold inline-flex items-center justify-center gap-1.5">
              <FleetIcons.Close className="w-3.5 h-3.5" />
              Reset filters
            </button>
          )}
        </div>

        {/* View Toggle Buttons */}
        <ViewModeToggle
          viewMode={viewMode}
          onViewModeChange={toggleViewMode}
          tableValue="table"
          cardValue="grid"
        />
      </div>

      {/* Error state */}
      {error && !loading && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center justify-between gap-3 text-rose-700 dark:text-rose-300 text-xs">
          <div className="flex items-center gap-2">
            <FleetIcons.AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{typeof error === 'string' ? error : error.message || 'Failed to load technician requests.'}</span>
          </div>
          <button
            onClick={fetchOrders}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-sm animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-slate-100 dark:bg-zinc-800 rounded-xl w-full" />
          ))}
        </div>
      ) : requestsList.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center text-slate-400 dark:text-zinc-500 font-medium">
          <FleetIcons.Tools className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-zinc-600" />
          No technician work orders found matching the filter criteria.
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full min-w-[850px] text-left text-xs text-slate-700 dark:text-zinc-300">
              <thead className="bg-slate-50 dark:bg-zinc-900/80 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Issue</th>
                  <th className="py-3 px-4">Urgency</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Requested by</th>
                  <th className="py-3 px-4">Requested at</th>
                  <th className="py-3 px-4">Assigned technician</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
                {requestsList.map((req) => {
                  const code = formatWorkOrderCode(req.id, req.code);
                  const bus = formatDisplayValue(req.bus_number || req.vehicle?.bus_number || req.vehicle?.registration_number);
                  const depot = req.depot_name || req.depot?.name;
                  const issue = formatDisplayValue(req.issue_category || req.issueCategory || req.title);
                  const urgencyCfg = getUrgencyConfig(req.urgency);
                  const statusCfg = getStatusConfig(req.status);
                  const requestedByName = formatDisplayValue(req.requestedBy?.name || req.requested_by_name);
                  const reqDate = formatExactDateTime(req.created_at || req.requested_at);
                  const tech = req.assignedTechnician || req.technician;
                  const canEdit = Boolean(req.capabilities?.canEdit);

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                      {/* Code */}
                      <td className="py-3.5 px-4">
                        <Link
                          to={`${basePath}/${req.id}`}
                          className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800 hover:underline"
                        >
                          {code}
                        </Link>
                      </td>

                      {/* Vehicle */}
                      <td className="py-3.5 px-4 font-mono text-slate-800 dark:text-zinc-200 font-bold">
                        {bus}
                        {depot && (
                          <span className="text-slate-400 dark:text-zinc-500 font-sans font-normal ml-1">
                            ({depot})
                          </span>
                        )}
                      </td>

                      {/* Issue */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {issue}
                      </td>

                      {/* Urgency */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full border ${urgencyCfg.color}`}>
                          {urgencyCfg.badge}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 rounded-full border ${statusCfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                          {statusCfg.label}
                        </span>
                      </td>

                      {/* Requested by */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-300">
                        {requestedByName}
                      </td>

                      {/* Requested at */}
                      <td className="py-3.5 px-4 text-slate-500 dark:text-zinc-400 font-mono text-[11px]">
                        {reqDate}
                      </td>

                      {/* Assigned technician */}
                      <td className="py-3.5 px-4 font-bold">
                        {tech ? (
                          <span className="text-emerald-700 dark:text-emerald-400">
                            {formatDisplayValue(tech.name)}
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            Pending assignment
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`${basePath}/${req.id}`}
                            className="px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors inline-flex items-center gap-1.5 text-slate-600 dark:text-zinc-300 whitespace-nowrap"
                            title={t('admin.tech_requests.view_details', 'View details')}
                          >
                            <FleetIcons.Eye className="w-4 h-4" />
                            <span>View</span>
                          </Link>
                          {canEdit && (
                            <Link
                              to={`${basePath}/edit/${req.id}`}
                              className="px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 whitespace-nowrap"
                              title={t('admin.tech_requests.edit_request', 'Edit request')}
                            >
                              <FleetIcons.Edit className="w-4 h-4" />
                              <span>Edit</span>
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
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requestsList.map((req) => {
            const code = formatWorkOrderCode(req.id, req.code);
            const bus = formatDisplayValue(req.bus_number || req.vehicle?.bus_number || req.vehicle?.registration_number);
            const depot = req.depot_name || req.depot?.name;
            const issue = formatDisplayValue(req.issue_category || req.issueCategory || req.title);
            const urgencyCfg = getUrgencyConfig(req.urgency);
            const statusCfg = getStatusConfig(req.status);
            const requestedByName = formatDisplayValue(req.requestedBy?.name || req.requested_by_name);
            const reqDate = formatExactDateTime(req.created_at || req.requested_at);
            const tech = req.assignedTechnician || req.technician;
            const canEdit = Boolean(req.capabilities?.canEdit);

            return (
              <div key={req.id} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                      {code}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{issue}</h3>
                  </div>

                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border self-start sm:self-auto ${statusCfg.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                    {statusCfg.label}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-zinc-300 font-medium leading-relaxed">
                  {formatDisplayValue(req.description, 'No description provided')}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-100 dark:border-zinc-800 text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-zinc-500 text-[10px] block">Vehicle:</span>
                    <div className="font-mono font-bold text-slate-900 dark:text-white">
                      {bus} {depot ? `(${depot})` : ''}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-zinc-500 text-[10px] block">Urgency:</span>
                    <div className="font-bold text-slate-800 dark:text-zinc-200">{urgencyCfg.badge}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-zinc-500 text-[10px] block">Technician:</span>
                    <div className="font-bold text-emerald-700 dark:text-emerald-400">
                      {tech ? formatDisplayValue(tech.name) : 'Pending assignment'}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 dark:text-zinc-500 pt-1">
                  <span>By: {requestedByName} • {reqDate}</span>
                  <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    <Link
                      to={`${basePath}/${req.id}`}
                      className="flex-1 sm:flex-none px-3 py-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-slate-600 dark:text-zinc-300 inline-flex items-center justify-center gap-1.5 border border-slate-200 dark:border-zinc-800"
                      title={t('admin.tech_requests.view_details', 'View details')}
                    >
                      <FleetIcons.Eye className="w-4 h-4" />
                      <span>View details</span>
                    </Link>
                    {canEdit && (
                      <Link
                        to={`${basePath}/edit/${req.id}`}
                        className="flex-1 sm:flex-none px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors text-blue-600 dark:text-blue-400 inline-flex items-center justify-center gap-1.5 border border-blue-200 dark:border-blue-900"
                        title={t('admin.tech_requests.edit_request', 'Edit request')}
                      >
                        <FleetIcons.Edit className="w-4 h-4" />
                        <span>Edit</span>
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
      <div className="p-3 border border-slate-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm">
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

export default TechRequestsPage;
