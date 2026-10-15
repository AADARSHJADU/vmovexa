import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AssignDriverModal } from './AssignDriverModal';
import { Pagination } from '../../components/ui/Pagination';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ActionDropdown } from '../../components/ui/ActionDropdown';
import { useFleetDriver } from '../../hooks/fleet/useFleetDriver';
import { resolveFileUrl } from '../../api/services/upload.service';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FleetIcons from '../../components/FleetIcons';

export const DriversPage = () => {
  const navigate = useNavigate();
  const { drivers, loadDrivers } = useFleetDriver();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // All, Available, Assigned
  const [viewMode, setViewMode] = useState('table'); // Default view is 'table' (list)
  const [selectedDriverForAssign, setSelectedDriverForAssign] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [refreshing, setRefreshing] = useState(false);

  const dropdownRef = useRef(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadDrivers();
    } catch {
      // handled
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { loadDrivers().catch(() => {}); }, [loadDrivers]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const driverList = Array.isArray(drivers) ? drivers : (drivers?.items || drivers?.rows || []);

  const isAvailable = (status) => String(status || '').toLowerCase() === 'available';
  const isAssigned = (status) => String(status || '').toLowerCase() === 'assigned';

  const filteredDrivers = driverList.filter(d => {
    const q = search.toLowerCase();
    const matchesSearch = (d.name || '').toLowerCase().includes(q) ||
                          (d.emp_id || '').toLowerCase().includes(q) ||
                          (d.dl_number || '').toLowerCase().includes(q);
    let matchesTab = true;
    if (activeTab === 'Available') matchesTab = isAvailable(d.status);
    if (activeTab === 'Assigned') matchesTab = isAssigned(d.status);
    return matchesSearch && matchesTab;
  });

  const totalPages = Math.ceil(filteredDrivers.length / pageSize) || 1;
  const paginatedDrivers = filteredDrivers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const availableCount = driverList.filter(d => isAvailable(d.status)).length;
  const assignedCount = driverList.filter(d => isAssigned(d.status)).length;

  return (
    <div className="w-full space-y-6 pb-16 animate-in fade-in duration-200" ref={dropdownRef}>
      {/* 1. Web Header Banner & Breadcrumb */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Fleet Manager', path: '/fleet-manager/dashboard' },
            { label: 'Drivers' },
          ]}
          className="mb-2"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Driver Management</h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Manage commercial driver rosters, licensing compliance, and vehicle assignments</p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto w-full sm:w-auto">
            <RefreshButton onClick={handleRefresh} loading={refreshing} />
            <button 
              onClick={() => navigate('/fleet-manager/drivers/add')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <FleetIcons.Plus className="w-4 h-4 text-white" />
              <span>Add New Driver</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Search, Filter Bar & View Toggle */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-zinc-500">
            <FleetIcons.Search className="w-4 h-4" />
          </span>
          <input 
            placeholder="Search by name, employee ID, license..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end overflow-x-auto no-scrollbar">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setActiveTab('All'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'All' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}
            >
              All ({driverList.length})
            </button>
            <button
              onClick={() => { setActiveTab('Available'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'Available' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}
            >
              Available ({availableCount})
            </button>
            <button
              onClick={() => { setActiveTab('Assigned'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'Assigned' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}
            >
              Assigned ({assignedCount})
            </button>
          </div>

          {/* View Mode Toggle Switch */}
          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            tableValue="table"
            cardValue="grid"
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredDrivers.length === 0 && (
        <div className="p-12 rounded-2xl bg-white dark:bg-zinc-900 border border-dashed border-slate-200 dark:border-zinc-800 text-center text-xs text-slate-500 dark:text-zinc-400">
          No drivers match your criteria.
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === 'grid' && filteredDrivers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedDrivers.map((d) => (
            <div key={d.id} className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all flex flex-col justify-between shadow-sm group">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-md flex items-center justify-center text-sm font-bold text-slate-500 dark:text-zinc-400 overflow-hidden">
                      {d.avatar_url ? (
                        <img src={resolveFileUrl(d.avatar_url)} alt={d.name} className="w-full h-full object-cover" />
                      ) : (
                        (d.name || '?').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{d.name ?? '—'}</h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono">{d.emp_id ?? d.code ?? '—'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shrink-0 ${
                      isAvailable(d.status) ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      <span>{d.status ?? '—'}</span>
                    </span>

                    {/* 3-Dot Menu */}
                    <ActionDropdown menuWidth="w-48">
                      {({ close }) => (
                        <div className="py-1 space-y-0.5 text-xs font-semibold">
                          <button
                            type="button"
                            onClick={() => {
                              close();
                              setSelectedDriverForAssign(d);
                            }}
                            className="w-full px-3.5 py-2 text-left hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <FleetIcons.Fleets className="w-4 h-4 text-blue-500" />
                            <span>{isAvailable(d.status) ? 'Assign Vehicle' : 'Reassign Vehicle'}</span>
                          </button>
                        </div>
                      )}
                    </ActionDropdown>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 text-xs space-y-2 border border-slate-100 dark:border-zinc-750">
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-zinc-500">License No:</span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">{d.dl_number ?? '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-zinc-500">License Type:</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{d.license_type ?? '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-zinc-500">Phone:</span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">{d.phone ?? '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-zinc-500">Badge:</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200">{d.badge_id ?? '—'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">{d.email ?? '—'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && filteredDrivers.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Driver Name</th>
                  <th className="py-3.5 px-4 font-mono">Emp ID / Code</th>
                  <th className="py-3.5 px-4">License No & Type</th>
                  <th className="py-3.5 px-4">Contact Phone</th>
                  <th className="py-3.5 px-4">Badge</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium text-slate-800 dark:text-zinc-200">
                {paginatedDrivers.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                    {/* Driver Name & Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-zinc-300 shrink-0 overflow-hidden shadow-sm">
                          {d.avatar_url ? (
                            <img src={resolveFileUrl(d.avatar_url)} alt={d.name} className="w-full h-full object-cover" />
                          ) : (
                            (d.name || '?').charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs">{d.name ?? '—'}</div>
                          <div className="text-[11px] text-slate-400 dark:text-zinc-500">{d.email ?? '—'}</div>
                        </div>
                      </div>
                    </td>

                    {/* Emp ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-zinc-300">
                      {d.emp_id ?? d.code ?? '—'}
                    </td>

                    {/* License */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white font-mono">{d.dl_number ?? '—'}</div>
                      <div className="text-[11px] text-blue-600 dark:text-blue-400 font-bold font-mono">{d.license_type ?? 'Heavy Transit'}</div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-zinc-200">
                      {d.phone ?? '—'}
                    </td>

                    {/* Badge */}
                    <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-zinc-300">
                      {d.badge_id ?? '—'}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                        isAvailable(d.status) ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        <span>{d.status ?? 'Available'}</span>
                      </span>
                    </td>

                    {/* 3-Dot Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <ActionDropdown menuWidth="w-48">
                        {({ close }) => (
                          <div className="py-1 space-y-0.5 text-xs font-semibold text-left">
                            <button
                              type="button"
                              onClick={() => {
                                close();
                                setSelectedDriverForAssign(d);
                              }}
                              className="w-full px-3.5 py-2 text-left hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <FleetIcons.Fleets className="w-4 h-4 text-blue-500" />
                              <span>{isAvailable(d.status) ? 'Assign Vehicle' : 'Reassign Vehicle'}</span>
                            </button>
                          </div>
                        )}
                      </ActionDropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredDrivers.length}
        pageSize={pageSize}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        pageSizeOptions={[6, 10, 20, 50]}
      />

      <AssignDriverModal 
        isOpen={!!selectedDriverForAssign} 
        onClose={() => setSelectedDriverForAssign(null)} 
        driver={selectedDriverForAssign} 
      />
    </div>
  );
};
