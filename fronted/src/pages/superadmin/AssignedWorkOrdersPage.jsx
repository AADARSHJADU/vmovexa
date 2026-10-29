import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import { useSuperTechnician } from '../../hooks/superadmin/useSuperTechnician';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import {
  getStatusConfig,
  getUrgencyConfig,
  formatDisplayValue,
  formatExactDateTime,
  formatSlaCountdown,
  formatWorkOrderCode,
} from '../../features/workOrders/workOrderPresentation';

export const AssignedWorkOrdersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'technicians'; // 'technicians' | 'work-orders'

  const {
    centralTechnicians,
    technicianPagination,
    technicianStatus,
    workOrders,
    workOrderPagination,
    workOrderStatus,
    loadCentralTechnicians,
    loadWorkOrders,
  } = useSuperTechnician();

  // Technician Tab State
  const [techSearch, setTechSearch] = useState('');
  const [debouncedTechSearch, setDebouncedTechSearch] = useState('');
  const [techStatusFilter, setTechStatusFilter] = useState('all');
  const [techPage, setTechPage] = useState(1);
  const [techPageSize, setTechPageSize] = useState(10);

  // Work Orders Tab State
  const [woSearch, setWoSearch] = useState('');
  const [debouncedWoSearch, setDebouncedWoSearch] = useState('');
  const [woStatusFilter, setWoStatusFilter] = useState('all');
  const [woUrgencyFilter, setWoUrgencyFilter] = useState('all');
  const [woPage, setWoPage] = useState(1);
  const [woPageSize, setWoPageSize] = useState(10);

  // Debounce technician search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTechSearch(techSearch.trim());
      setTechPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [techSearch]);

  // Debounce work orders search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedWoSearch(woSearch.trim());
      setWoPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [woSearch]);

  // Fetch Central Technicians
  const fetchTechnicians = useCallback(() => {
    const params = {
      page: techPage,
      limit: techPageSize,
    };
    if (debouncedTechSearch) params.search = debouncedTechSearch;
    if (techStatusFilter !== 'all') params.profileStatus = techStatusFilter;
    loadCentralTechnicians(params).catch(() => {});
  }, [techPage, techPageSize, debouncedTechSearch, techStatusFilter, loadCentralTechnicians]);

  // Fetch Work Orders
  const fetchWorkOrders = useCallback(() => {
    const params = {
      page: woPage,
      limit: woPageSize,
    };
    if (debouncedWoSearch) params.search = debouncedWoSearch;
    if (woStatusFilter !== 'all') params.status = woStatusFilter;
    if (woUrgencyFilter !== 'all') params.urgency = woUrgencyFilter;
    loadWorkOrders(params).catch(() => {});
  }, [woPage, woPageSize, debouncedWoSearch, woStatusFilter, woUrgencyFilter, loadWorkOrders]);

  useEffect(() => {
    if (activeTab === 'technicians') {
      fetchTechnicians();
    } else {
      fetchWorkOrders();
    }
  }, [activeTab, fetchTechnicians, fetchWorkOrders]);

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  const handleRefresh = () => {
    if (activeTab === 'technicians') {
      fetchTechnicians();
    } else {
      fetchWorkOrders();
    }
  };

  const techsList = Array.isArray(centralTechnicians) ? centralTechnicians : [];
  const ordersList = Array.isArray(workOrders) ? workOrders : [];
  const isTechLoading = technicianStatus === 'loading';
  const isWoLoading = workOrderStatus === 'loading';

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* 1. Header with Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'SuperAdmin', path: '/superadmin/dashboard' },
              { label: 'Technicians', path: '/superadmin/technicians' },
              { label: 'Technician Assignments' },
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Central Technician Assignments & Work Orders
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Dispatch central pool technicians, track fleet hardware repairs, and oversee tenant service SLAs.
          </p>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          <RefreshButton
            onClick={handleRefresh}
            loading={activeTab === 'technicians' ? isTechLoading : isWoLoading}
          />
          <Link
            to="/superadmin/technicians/assign/new"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 flex-1 sm:flex-initial"
          >
            <FleetIcons.Plus className="w-4 h-4" />
            <span>Create & Dispatch Work Order</span>
          </Link>
        </div>
      </div>

      {/* 2. Top Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => handleTabChange('technicians')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
            activeTab === 'technicians'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <FleetIcons.Tools className="w-4 h-4" />
          <span>Central Technicians</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
              activeTab === 'technicians'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300'
            }`}
          >
            {technicianPagination?.total ?? techsList.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('work-orders')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
            activeTab === 'work-orders'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <FleetIcons.Document className="w-4 h-4" />
          <span>Work Orders & Dispatch Queue</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
              activeTab === 'work-orders'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300'
            }`}
          >
            {workOrderPagination?.total ?? ordersList.length}
          </span>
        </button>
      </div>

      {/* 3. TAB 1: CENTRAL TECHNICIANS TABLE (Primary Content) */}
      {activeTab === 'technicians' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
                <FleetIcons.Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search technicians by name, email, city..."
                  value={techSearch}
                  onChange={(e) => setTechSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {techSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setTechSearch('');
                      setDebouncedTechSearch('');
                      setTechPage(1);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
                    title="Clear search"
                  >
                    <FleetIcons.Close className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <select
                value={techStatusFilter}
                onChange={(e) => {
                  setTechStatusFilter(e.target.value);
                  setTechPage(1);
                }}
                className="w-full sm:w-auto px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="available">Available</option>
                <option value="assigned">Assigned</option>
                <option value="off_duty">Off Duty</option>
              </select>

              {(techSearch.trim() || techStatusFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setTechSearch('');
                    setDebouncedTechSearch('');
                    setTechStatusFilter('all');
                    setTechPage(1);
                  }}
                  className="px-3 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <FleetIcons.Close className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>

          {/* Technicians Table */}
          {isTechLoading ? (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-sm animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-slate-100 dark:bg-zinc-800 rounded-xl w-full" />
              ))}
            </div>
          ) : techsList.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center text-slate-400 dark:text-zinc-500 font-medium">
              <FleetIcons.Tools className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-zinc-600" />
              No central pool technicians found matching the search criteria.
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full min-w-[850px] text-left text-xs text-slate-700 dark:text-zinc-300">
                  <thead className="bg-slate-50 dark:bg-zinc-900/80 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Technician</th>
                      <th className="py-3 px-4">Contact / ID</th>
                      <th className="py-3 px-4">Skills / Certification</th>
                      <th className="py-3 px-4">City</th>
                      <th className="py-3 px-4">Availability</th>
                      <th className="py-3 px-4">Jobs Completed</th>
                      <th className="py-3 px-4">Last Active</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
                    {techsList.map((tech) => {
                      const profile = tech.technicianProfile || {};
                      const availStatus = String(profile.status || tech.status || 'available').toLowerCase();
                      const isAvail = availStatus === 'available' || availStatus === 'active';
                      const isAssigned = availStatus === 'assigned';
                      const certLevel = formatDisplayValue(profile.cert_level, 'Standard Tech');
                      const city = formatDisplayValue(profile.city || profile.base_city || tech.city);
                      const jobsCount = profile.jobs_completed ?? 0;
                      const skills = Array.isArray(profile.skills) ? profile.skills : [];
                      const initial = (tech.name?.charAt(0) || 'T').toUpperCase();

                      return (
                        <tr key={tech.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                          {/* Technician */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 uppercase">
                                {initial}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 dark:text-white truncate">
                                  {tech.name}
                                </div>
                                <div className="text-[11px] text-slate-400 dark:text-zinc-500 truncate">
                                  {tech.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Contact / ID */}
                          <td className="py-3 px-4">
                            <div className="font-mono text-slate-800 dark:text-zinc-200">
                              {formatDisplayValue(tech.phone)}
                            </div>
                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                              ID: #{tech.id}
                            </span>
                          </td>

                          {/* Skills / Certification */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-800 dark:text-zinc-200">
                              {certLevel}
                            </div>
                            {skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {skills.slice(0, 2).map((s, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                                  >
                                    {s}
                                  </span>
                                ))}
                                {skills.length > 2 && (
                                  <span className="text-[9px] text-slate-400">+{skills.length - 2}</span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* City */}
                          <td className="py-3 px-4 text-slate-700 dark:text-zinc-300">
                            {city}
                          </td>

                          {/* Availability Badge */}
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                isAvail
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                  : isAssigned
                                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isAvail
                                    ? 'bg-emerald-500'
                                    : isAssigned
                                    ? 'bg-blue-500'
                                    : 'bg-zinc-400'
                                }`}
                              />
                              {isAvail ? 'Available' : isAssigned ? 'Assigned' : 'Off Duty'}
                            </span>
                          </td>

                          {/* Jobs Completed */}
                          <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-zinc-200">
                            {jobsCount}
                          </td>

                          {/* Last Active */}
                          <td className="py-3 px-4 text-slate-500 dark:text-zinc-400 font-mono text-[11px]">
                            {formatExactDateTime(profile.updated_at || tech.updated_at)}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                to={`/superadmin/technicians/assign/new?technicianId=${tech.id}`}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
                              >
                                <FleetIcons.Plus className="w-3.5 h-3.5" />
                                <span>Assign work</span>
                              </Link>
                              <Link
                                to={`/superadmin/technicians/${tech.id}`}
                                className="px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-slate-600 dark:text-zinc-300 inline-flex items-center gap-1.5 whitespace-nowrap"
                                title="View technician details"
                              >
                                <FleetIcons.Eye className="w-4 h-4" />
                                <span>View details</span>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Technician Pagination */}
          <div className="p-3 border border-slate-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm">
            <Pagination
              currentPage={technicianPagination?.page || techPage}
              totalPages={technicianPagination?.totalPages || 1}
              totalItems={technicianPagination?.total ?? techsList.length}
              pageSize={technicianPagination?.limit || techPageSize}
              onPageChange={(p) => setTechPage(p)}
              onPageSizeChange={(size) => {
                setTechPageSize(size);
                setTechPage(1);
              }}
              pageSizeOptions={[10, 20, 50]}
            />
          </div>
        </div>
      )}

      {/* 4. TAB 2: WORK ORDERS QUEUE TABLE (Secondary Content) */}
      {activeTab === 'work-orders' && (
        <div className="space-y-4">
          {/* Quick Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Orders', status: 'all', urgency: 'all' },
              { id: 'pending', label: 'Pending Assignment', status: 'submitted', urgency: 'all' },
              { id: 'dispatched', label: 'Dispatched', status: 'dispatched', urgency: 'all' },
              { id: 'on_site', label: 'On Site', status: 'on_site', urgency: 'all' },
              { id: 'resolved', label: 'Resolved', status: 'resolved', urgency: 'all' },
              { id: 'critical', label: 'Critical Only', status: 'all', urgency: 'critical' },
            ].map((chip) => {
              const isActive =
                chip.id === 'critical'
                  ? woUrgencyFilter === 'critical'
                  : chip.id === 'all'
                  ? woStatusFilter === 'all' && woUrgencyFilter === 'all'
                  : woStatusFilter === chip.status;

              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => {
                    if (chip.id === 'critical') {
                      setWoUrgencyFilter(woUrgencyFilter === 'critical' ? 'all' : 'critical');
                    } else if (chip.id === 'all') {
                      setWoStatusFilter('all');
                      setWoUrgencyFilter('all');
                    } else {
                      setWoStatusFilter(chip.status);
                    }
                    setWoPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/20'
                      : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Work Orders Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
                <FleetIcons.Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search code, vehicle, depot, issue..."
                  value={woSearch}
                  onChange={(e) => setWoSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {woSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setWoSearch('');
                      setDebouncedWoSearch('');
                      setWoPage(1);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
                    title="Clear search"
                  >
                    <FleetIcons.Close className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <select
                value={woStatusFilter}
                onChange={(e) => {
                  setWoStatusFilter(e.target.value);
                  setWoPage(1);
                }}
                className="px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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

              <select
                value={woUrgencyFilter}
                onChange={(e) => {
                  setWoUrgencyFilter(e.target.value);
                  setWoPage(1);
                }}
                className="px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">All Urgencies</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>

              {(woSearch.trim() || woStatusFilter !== 'all' || woUrgencyFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setWoSearch('');
                    setDebouncedWoSearch('');
                    setWoStatusFilter('all');
                    setWoUrgencyFilter('all');
                    setWoPage(1);
                  }}
                  className="px-3 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <FleetIcons.Close className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>

          {/* Work Orders Table */}
          {isWoLoading ? (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-sm animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-slate-100 dark:bg-zinc-800 rounded-xl w-full" />
              ))}
            </div>
          ) : ordersList.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center text-slate-400 dark:text-zinc-500 font-medium">
              <FleetIcons.Document className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-zinc-600" />
              <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                {woSearch.trim() || woStatusFilter !== 'all' || woUrgencyFilter !== 'all'
                  ? 'No work orders matching your filters.'
                  : 'No work orders found in the queue.'}
              </p>
              {(woSearch.trim() || woStatusFilter !== 'all' || woUrgencyFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setWoSearch('');
                    setDebouncedWoSearch('');
                    setWoStatusFilter('all');
                    setWoUrgencyFilter('all');
                    setWoPage(1);
                  }}
                  className="mt-3 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full min-w-[760px] text-left text-xs text-slate-700 dark:text-zinc-300">
                  <thead className="bg-slate-50 dark:bg-zinc-900/80 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Work Order & Tenant</th>
                      <th className="py-3 px-4">Asset & Depot</th>
                      <th className="py-3 px-4">Issue Details</th>
                      <th className="py-3 px-4">Status & Urgency</th>
                      <th className="py-3 px-4">Technician & SLA</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
                    {ordersList.map((wo) => {
                      const code = formatWorkOrderCode(wo.id, wo.code);
                      const orgName = formatDisplayValue(wo.organization?.name);
                      const bus = formatDisplayValue(wo.bus_number || wo.vehicle?.bus_number || wo.vehicle?.registration_number);
                      const depot = formatDisplayValue(wo.depot_name || wo.depot?.name);
                      const issue = formatDisplayValue(wo.issue_category);
                      const urgencyCfg = getUrgencyConfig(wo.urgency);
                      const statusCfg = getStatusConfig(wo.status);
                      const tech = wo.assignedTechnician || wo.technician;
                      const slaCountdown = formatSlaCountdown(wo.sla_due_at, wo.status);
                      const isUnassigned = !wo.assigned_technician_id && !tech;

                      return (
                        <tr key={wo.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                          {/* Col 1: Work Order & Tenant */}
                          <td className="py-3.5 px-4 align-top">
                            <Link
                              to={`/superadmin/technicians/assign/${wo.id}`}
                              className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap block"
                            >
                              {code}
                            </Link>
                            <span
                              className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium truncate max-w-[170px] block mt-0.5"
                              title={orgName}
                            >
                              {orgName}
                            </span>
                          </td>

                          {/* Col 2: Asset & Depot */}
                          <td className="py-3.5 px-4 align-top">
                            <div className="font-mono font-bold text-xs text-slate-800 dark:text-zinc-200 whitespace-nowrap">
                              {bus}
                            </div>
                            <span
                              className="text-[11px] text-slate-500 dark:text-zinc-400 truncate max-w-[160px] block mt-0.5"
                              title={depot}
                            >
                              {depot}
                            </span>
                          </td>

                          {/* Col 3: Issue Details */}
                          <td className="py-3.5 px-4 align-top">
                            <div
                              className="font-semibold text-xs text-slate-900 dark:text-white truncate max-w-[220px]"
                              title={issue}
                            >
                              {issue}
                            </div>
                            {wo.description && (
                              <span
                                className="text-[11px] text-slate-400 dark:text-zinc-500 truncate max-w-[220px] block mt-0.5"
                                title={wo.description}
                              >
                                {wo.description}
                              </span>
                            )}
                          </td>

                          {/* Col 4: Status & Urgency */}
                          <td className="py-3.5 px-4 align-top">
                            <div className="flex flex-col gap-1 items-start">
                              <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${statusCfg.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                                {statusCfg.label}
                              </span>
                              <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${urgencyCfg.color}`}>
                                {urgencyCfg.badge}
                              </span>
                            </div>
                          </td>

                          {/* Col 5: Technician & SLA */}
                          <td className="py-3.5 px-4 align-top">
                            <div>
                              {tech ? (
                                <span
                                  className="font-bold text-xs text-emerald-700 dark:text-emerald-400 truncate max-w-[150px] block whitespace-nowrap"
                                  title={formatDisplayValue(tech.name)}
                                >
                                  {formatDisplayValue(tech.name)}
                                </span>
                              ) : (
                                <span className="inline-flex text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md whitespace-nowrap">
                                  Unassigned
                                </span>
                              )}
                            </div>
                            <div className="mt-1">
                              {slaCountdown ? (
                                <span className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded-md border whitespace-nowrap ${slaCountdown.color}`}>
                                  {slaCountdown.text}
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-400 font-mono block">—</span>
                              )}
                            </div>
                          </td>

                          {/* Col 6: Action */}
                          <td className="py-3.5 px-4 align-top text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isUnassigned && (
                                <Link
                                  to={`/superadmin/technicians/assign/${wo.id}/assign`}
                                  className="px-2.5 py-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white rounded-lg text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                  title="Dispatch technician to this work order"
                                >
                                  <FleetIcons.Tools className="w-3.5 h-3.5 text-white" />
                                  <span>Dispatch</span>
                                </Link>
                              )}
                              <Link
                                to={`/superadmin/technicians/assign/${wo.id}`}
                                className="px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-slate-600 dark:text-zinc-300 inline-flex items-center gap-1.5 whitespace-nowrap"
                                title="View work order details"
                              >
                                <FleetIcons.Eye className="w-4 h-4" />
                                <span>View details</span>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Work Orders Pagination */}
          <div className="p-3 border border-slate-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm">
            <Pagination
              currentPage={workOrderPagination?.page || woPage}
              totalPages={workOrderPagination?.totalPages || 1}
              totalItems={workOrderPagination?.total ?? ordersList.length}
              pageSize={workOrderPagination?.limit || woPageSize}
              onPageChange={(p) => setWoPage(p)}
              onPageSizeChange={(size) => {
                setWoPageSize(size);
                setWoPage(1);
              }}
              pageSizeOptions={[10, 20, 50]}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedWorkOrdersPage;
