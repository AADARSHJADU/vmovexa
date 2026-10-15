import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useAdminDepot } from '../../hooks/admin/useAdminDepot';
import { useAuth } from '../../hooks/useAuth';
import { ActionDropdown } from '../../components/ui/ActionDropdown';

export const AdminDepotsPage = () => {
  const location = useLocation();
  const isFleetPortal = location.pathname.startsWith('/fleet-manager');
  const basePath = isFleetPortal ? '/fleet-manager/depots' : '/admin/depots';

  const {
    depots,
    pagination,
    loading,
    loadDepots,
    createDepot,
    updateDepot,
    deleteDepot,
    updateDepotStatus,
  } = useAdminDepot();
  const { hasPermission } = useAuth();

  const canView = hasPermission('fleet.depots.view');
  const canCreate = hasPermission('fleet.depots.create');
  const canUpdate = hasPermission('fleet.depots.update');
  const canDelete = hasPermission('fleet.depots.delete');

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('depot_view_mode') || 'grid');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepot, setSelectedDepot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    capacity: 25,
    evChargers: 4,
    contactPhone: '',
    status: 'operational',
  });

  const toggleViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('depot_view_mode', mode);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const refreshDepots = () => {
    if (!canView) return;
    const params = { page: currentPage, limit: pageSize };
    if (debouncedSearch) params.search = debouncedSearch;
    if (statusFilter !== 'all') params.status = statusFilter;
    loadDepots(params).catch(() => {});
  };

  useEffect(() => {
    if (!canView) return;
    refreshDepots();
  }, [canView, currentPage, pageSize, debouncedSearch, statusFilter, loadDepots]);

  const rawDepotsList = Array.isArray(depots) ? depots : (depots?.items || depots?.rows || []);
  const depotsList = rawDepotsList.filter((dep) => {
    if (statusFilter === 'all') return true;
    return (dep.status || 'operational') === statusFilter;
  });

  // Calculate Stat Metrics
  const totalDepotsCount = pagination?.total ?? rawDepotsList.length;
  const operationalCount = rawDepotsList.filter((d) => (d.status || 'operational') === 'operational').length;
  const totalEvChargers = rawDepotsList.reduce((acc, d) => acc + Number(d.ev_chargers ?? d.evChargers ?? 0), 0);

  const openCreateModal = () => {
    setSelectedDepot(null);
    setFormData({
      name: '',
      address: '',
      capacity: 25,
      evChargers: 4,
      contactPhone: '',
      status: 'operational',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (dep) => {
    setSelectedDepot(dep);
    setFormData({
      name: dep.name || '',
      address: dep.address || '',
      capacity: dep.capacity ?? 25,
      evChargers: dep.ev_chargers ?? dep.evChargers ?? 4,
      contactPhone: dep.contact_phone ?? dep.contactPhone ?? '',
      status: dep.status || 'operational',
    });
    setIsModalOpen(true);
  };

  const handleSaveDepot = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Depot facility name is required.');
      return;
    }

    setSubmitting(true);
    const payload = {
      name: formData.name.trim(),
      address: formData.address.trim(),
      capacity: Number(formData.capacity) || 20,
      ev_chargers: Number(formData.evChargers) || 0,
      contact_phone: formData.contactPhone.trim(),
      status: formData.status,
    };

    const actionPromise = selectedDepot
      ? updateDepot(selectedDepot.id, payload)
      : createDepot(payload);

    toast.promise(actionPromise, {
      loading: selectedDepot ? 'Saving depot changes...' : 'Creating depot facility base...',
      success: () => {
        setIsModalOpen(false);
        refreshDepots();
        return selectedDepot ? 'Depot updated successfully!' : 'Depot facility created successfully!';
      },
      error: (err) => err?.message || 'Failed to save depot',
    }).finally(() => setSubmitting(false));
  };

  const handleToggleStatus = (dep) => {
    const newStatus = dep.status === 'operational' ? 'closed' : 'operational';
    setUpdatingStatusId(dep.id);
    toast.promise(
      updateDepotStatus(dep.id, newStatus),
      {
        loading: `Updating status for ${dep.name}...`,
        success: () => {
          refreshDepots();
          return `Depot status changed to ${newStatus}!`;
        },
        error: (err) => err?.message || 'Failed to update status',
      }
    ).finally(() => setUpdatingStatusId(null));
  };

  const handleDelete = (dep) => {
    if (!window.confirm(`Are you sure you want to delete depot base "${dep.name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(dep.id);
    toast.promise(
      deleteDepot(dep.id),
      {
        loading: `Deleting depot ${dep.name}...`,
        success: () => {
          refreshDepots();
          return 'Depot facility deleted successfully!';
        },
        error: (err) => err?.message || 'Failed to delete depot',
      }
    ).finally(() => setDeletingId(null));
  };

  if (!canView) {
    return (
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm space-y-4">
        <div className="text-4xl">🔒</div>
        <h2 className="text-lg font-black text-slate-900">Access Revoked</h2>
        <p className="text-sm text-slate-500 font-medium">
          Your administrator has revoked your permission to view depot facilities.
        </p>
        <Link
          to={isFleetPortal ? '/fleet-manager/dashboard' : '/admin/dashboard'}
          className="inline-block px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
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
              { label: 'Depot Facilities' },
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Depot Facilities & Maintenance Garages
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Operating terminal bases, vehicle parking capacity, and EV charging infrastructure
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <RefreshButton
            onClick={refreshDepots}
            loading={loading}
            title="Refresh depots directory"
          />
          {canCreate && (
            <Link
              to={`${basePath}/add`}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 flex-1 sm:flex-initial"
            >
              <FleetIcons.Plus className="w-4 h-4" />
              <span>Add New Depot</span>
            </Link>
          )}
        </div>
      </div>

      {/* 3 Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Depots</span>
          <div className="text-xl font-black text-slate-900 mt-1">{totalDepotsCount} Facilities</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Operational Status</span>
          <div className="text-xl font-black text-emerald-700 mt-1">{operationalCount} Active</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">EV Fast Charging</span>
          <div className="text-xl font-black text-blue-700 mt-1">{totalEvChargers} Stations</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-80">
            <FleetIcons.Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search depot name, code or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-slate-300 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-slate-300 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="operational">Operational Only</option>
            <option value="closed">Closed Only</option>
          </select>
        </div>

        <ViewModeToggle
          viewMode={viewMode}
          onViewModeChange={toggleViewMode}
          tableValue="table"
          cardValue="grid"
          className="self-end sm:self-auto"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-xl w-full" />
          ))}
        </div>
      ) : depotsList.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 font-medium">
          No depot facilities registered matching your criteria.
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {depotsList.map((dep) => {
            const code = dep.code || `DEP-${dep.id}`;
            const capacity = dep.capacity ?? 20;
            const currentParked = dep.current_parked ?? dep.currentParked ?? 0;
            const evChargers = dep.ev_chargers ?? dep.evChargers ?? 0;
            const contact = dep.contact_phone ?? dep.contactPhone ?? '—';
            const status = dep.status ?? 'operational';
            const fillPct = Math.min(100, Math.round((currentParked / (capacity || 1)) * 100));

            return (
              <div key={dep.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        {code}
                      </span>
                      {dep.city && (
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200">
                          {dep.city}
                        </span>
                      )}
                      {(dep.depot_type || dep.depotType) && (
                        <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-md uppercase">
                          {(dep.depot_type || dep.depotType).replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{dep.name}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{dep.address ?? '—'}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border ${
                      status === 'operational'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {status}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-500">Depot Capacity:</span>
                    <span className="text-slate-900">{capacity} Bays</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        fillPct > 90 ? 'bg-rose-500' : fillPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px]">Total Bays:</span>
                    <div className="font-bold text-slate-900">{capacity} Bays</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Parked Buses:</span>
                    <div className="font-bold text-blue-700">{currentParked} Buses</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">EV Chargers:</span>
                    <div className="font-bold text-emerald-700">{evChargers} Stations</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                  <span className="font-mono">Contact: {contact}</span>
                  
                  {/* 3-Dot Action Menu */}
                  <ActionDropdown buttonTitle={`Actions for ${dep.name}`}>
                    {({ close }) => (
                      <>
                        <Link
                          to={`${basePath}/${dep.id}`}
                          onClick={close}
                          className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <FleetIcons.Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>View Details</span>
                        </Link>
                        {canUpdate && (
                          <Link
                            to={`${basePath}/edit/${dep.id}`}
                            onClick={close}
                            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <FleetIcons.Edit className="w-3.5 h-3.5 text-blue-600" />
                            <span>Edit Facility</span>
                          </Link>
                        )}
                        {canUpdate && (
                          <button
                            type="button"
                            disabled={updatingStatusId === dep.id}
                            onClick={() => {
                              handleToggleStatus(dep);
                              close();
                            }}
                            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                          >
                            <FleetIcons.CheckCircle className="w-3.5 h-3.5 text-amber-600" />
                            <span>{updatingStatusId === dep.id ? '...' : status === 'operational' ? 'Close Facility' : 'Reopen Facility'}</span>
                          </button>
                        )}
                        {canDelete && (
                          <>
                            <div className="border-t border-slate-100 my-1" />
                            <button
                              type="button"
                              disabled={deletingId === dep.id}
                              onClick={() => {
                                handleDelete(dep);
                                close();
                              }}
                              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                              <FleetIcons.Trash className="w-3.5 h-3.5 text-rose-500" />
                              <span>{deletingId === dep.id ? 'Deleting...' : 'Delete Facility'}</span>
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </ActionDropdown>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Depot Base & Code</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4">Capacity</th>
                  <th className="py-3 px-4">EV Chargers</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {depotsList.map((dep) => {
                  const code = dep.code || `DEP-${dep.id}`;
                  const capacity = dep.capacity ?? 20;
                  const currentParked = dep.current_parked ?? dep.currentParked ?? 0;
                  const evChargers = dep.ev_chargers ?? dep.evChargers ?? 0;
                  const status = dep.status ?? 'operational';

                  return (
                    <tr key={dep.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                          <span>{dep.name}</span>
                          {dep.city && (
                            <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                              {dep.city}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{code}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{dep.address || '—'}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{capacity} Bays</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700">{evChargers} EV Fast Chargers</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border ${
                            status === 'operational'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end">
                          <ActionDropdown buttonTitle={`Actions for ${dep.name}`}>
                            {({ close }) => (
                              <>
                                <Link
                                  to={`${basePath}/${dep.id}`}
                                  onClick={close}
                                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <FleetIcons.Eye className="w-3.5 h-3.5 text-slate-500" />
                                  <span>View Details</span>
                                </Link>
                                {canUpdate && (
                                  <Link
                                    to={`${basePath}/edit/${dep.id}`}
                                    onClick={close}
                                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <FleetIcons.Edit className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Edit Facility</span>
                                  </Link>
                                )}
                                {canUpdate && (
                                  <button
                                    type="button"
                                    disabled={updatingStatusId === dep.id}
                                    onClick={() => {
                                      handleToggleStatus(dep);
                                      close();
                                    }}
                                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                  >
                                    <FleetIcons.CheckCircle className="w-3.5 h-3.5 text-amber-600" />
                                    <span>{updatingStatusId === dep.id ? '...' : status === 'operational' ? 'Close Facility' : 'Reopen Facility'}</span>
                                  </button>
                                )}
                                {canDelete && (
                                  <>
                                    <div className="border-t border-slate-100 my-1" />
                                    <button
                                      type="button"
                                      disabled={deletingId === dep.id}
                                      onClick={() => {
                                        handleDelete(dep);
                                        close();
                                      }}
                                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                    >
                                      <FleetIcons.Trash className="w-3.5 h-3.5 text-rose-500" />
                                      <span>{deletingId === dep.id ? 'Deleting...' : 'Delete Facility'}</span>
                                    </button>
                                  </>
                                )}
                              </>
                            )}
                          </ActionDropdown>
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

      {/* Pagination */}
      <div className="p-3 border border-slate-200 rounded-2xl bg-white shadow-sm">
        <Pagination
          currentPage={pagination?.page || currentPage}
          totalPages={pagination?.totalPages || 1}
          totalItems={pagination?.total ?? depotsList.length}
          pageSize={pagination?.limit || pageSize}
          onPageChange={(p) => setCurrentPage(p)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          pageSizeOptions={[6, 10, 20, 50]}
        />
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {selectedDepot ? 'Edit Operating Depot Base' : 'Add Operating Depot Base'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">Register or update maintenance & parking facility</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDepot} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Facility Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarwate Central Depot Terminal 3"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  placeholder="e.g. Ring Road Sector C, Indore"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Parking Bays Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">EV Fast Chargers</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.evChargers}
                    onChange={(e) => setFormData({ ...formData, evChargers: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Gate / Contact Phone</label>
                <input
                  type="text"
                  placeholder="e.g. 0731-2521199"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-500 font-mono font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Operating Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-500"
                >
                  <option value="operational">Operational</option>
                  <option value="closed">Closed / Under Renovation</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {submitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>{selectedDepot ? 'Save Depot Changes' : 'Save Depot Base'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
