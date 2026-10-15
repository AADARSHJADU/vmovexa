import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Pagination } from '../../components/ui/Pagination';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useFleetGps } from '../../hooks/fleet/useFleetGps';
import { useAuth } from '../../hooks/useAuth';
import { resolveFileUrl } from '../../api/services/upload.service';
import { ActionDropdown } from '../../components/ui/ActionDropdown';

/** Status badge component */
const StatusBadge = ({ status }) => {
  const s = String(status || '').toLowerCase();
  let cls = 'bg-slate-100 text-slate-600 border-slate-200';
  let label = status || '—';
  if (s === 'available' || s === 'online') {
    cls = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    label = 'Available';
  } else if (s === 'assigned') {
    cls = 'bg-blue-50 text-blue-700 border-blue-200';
    label = 'Assigned';
  } else if (s === 'pending_approval') {
    cls = 'bg-amber-50 text-amber-700 border-amber-200';
    label = 'Pending Approval';
  } else if (s === 'rejected') {
    cls = 'bg-red-50 text-red-700 border-red-200';
    label = 'Rejected';
  }
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border shrink-0 ${cls}`}>
      {label}
    </span>
  );
};

export const AdminGpsDevicesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasPermission } = useAuth();

  const roleCode = typeof user?.role === 'string' ? user.role : (user?.role?.code || '');
  const isFleetPortal = location.pathname.startsWith('/fleet-manager');
  const basePath = isFleetPortal ? '/fleet-manager/gps' : '/admin/gps';
  const isAdmin =
    roleCode === 'ROLE-TENANT-ADMIN' ||
    roleCode === 'TROLE-ADMIN' ||
    roleCode === 'ROLE-ADMIN' ||
    roleCode === 'ROLE-SUPER-ADMIN' ||
    !isFleetPortal;

  const canView = isAdmin || hasPermission('fleet.devices.read');
  const canCreate = isAdmin || hasPermission('fleet.devices.create');
  const canUpdate = isAdmin || hasPermission('fleet.devices.update');
  const canDelete = isAdmin || hasPermission('fleet.devices.delete');
  const canAssign = isAdmin || hasPermission('fleet.devices.assign');

  const { devices, loadDevices, deleteDevice, approveDevice, rejectDevice } = useFleetGps();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [viewMode, setViewMode] = useState('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rejectingDevice, setRejectingDevice] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isFleetPortal && !canView) return;
    loadDevices().catch(() => {});
  }, [loadDevices, isFleetPortal, canView]);

  const gpsList = Array.isArray(devices) ? devices : (devices?.items || devices?.rows || []);

  const isAvailable = (s) => ['available', 'online'].includes(String(s || '').toLowerCase());
  const isAssigned = (s) => String(s || '').toLowerCase() === 'assigned';
  const isPending = (s) => String(s || '').toLowerCase() === 'pending_approval';
  const isRejected = (s) => String(s || '').toLowerCase() === 'rejected';

  const filteredGps = gpsList.filter((g) => {
    const q = search.toLowerCase();
    const matchesSearch =
      String(g.code || g.id || '').toLowerCase().includes(q) ||
      String(g.imei || '').toLowerCase().includes(q) ||
      String(g.vendor || '').toLowerCase().includes(q) ||
      String(g.model || '').toLowerCase().includes(q) ||
      String(g.serial_number || '').toLowerCase().includes(q) ||
      String(g.vehicle?.bus_number || '').toLowerCase().includes(q) ||
      String(g.vehicle?.model || '').toLowerCase().includes(q) ||
      String(g.vehicle_id || '').includes(q);

    let matchesTab = true;
    if (activeTab === 'Available') matchesTab = isAvailable(g.status);
    if (activeTab === 'Assigned') matchesTab = isAssigned(g.status);
    if (activeTab === 'Pending') matchesTab = isPending(g.status);
    if (activeTab === 'Rejected') matchesTab = isRejected(g.status);

    return matchesSearch && matchesTab;
  });

  const totalPages = Math.ceil(filteredGps.length / pageSize) || 1;
  const paginatedGps = filteredGps.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const availableCount = gpsList.filter((g) => isAvailable(g.status)).length;
  const assignedCount = gpsList.filter((g) => isAssigned(g.status)).length;
  const pendingCount = gpsList.filter((g) => isPending(g.status)).length;
  const rejectedCount = gpsList.filter((g) => isRejected(g.status)).length;

  const handleDelete = async (gpsDevice) => {
    if (gpsDevice.vehicle_id) {
      toast.error('Cannot delete a GPS device that is currently assigned to a vehicle.');
      return;
    }
    if (!window.confirm(`Delete GPS Device ${gpsDevice.code || gpsDevice.imei}?`)) return;

    try {
      await toast.promise(deleteDevice(gpsDevice.id), {
        loading: 'Deleting GPS Device...',
        success: 'GPS device deleted successfully',
        error: (err) => err?.message || 'Failed to delete GPS device',
      });
      loadDevices().catch(() => {});
    } catch (_) {}
  };

  const handleApprove = async (gpsDevice) => {
    try {
      await toast.promise(approveDevice(gpsDevice.id), {
        loading: 'Approving GPS Device...',
        success: 'GPS Device approved successfully!',
        error: (err) => err?.message || 'Failed to approve GPS device',
      });
      loadDevices().catch(() => {});
    } catch (_) {}
  };

  const handleConfirmReject = async () => {
    if (!rejectingDevice) return;
    try {
      await toast.promise(rejectDevice(rejectingDevice.id, rejectionReason), {
        loading: 'Rejecting GPS Device...',
        success: 'GPS Device rejected.',
        error: (err) => err?.message || 'Failed to reject GPS device',
      });
      setRejectingDevice(null);
      setRejectionReason('');
      loadDevices().catch(() => {});
    } catch (_) {}
  };

  if (isFleetPortal && !canView) {
    return (
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="text-lg font-black text-slate-900">Access Revoked</h2>
        <p className="text-sm text-slate-500 mt-2 font-medium">
          Your administrator has revoked your permission to view GPS devices. Please contact your admin.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-16" ref={dropdownRef}>
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <Breadcrumb
            items={[
              { label: isFleetPortal ? 'Fleet Operator' : 'Tenant Admin', path: isFleetPortal ? '/fleet-manager/dashboard' : '/admin/dashboard' },
              { label: 'GPS & Telematics Hardware' },
            ]}
            className="mb-2"
          />
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">GPS & Telematics Hardware</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Manage IoT telematics devices, signal pings, hardware binding & approval status
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <RefreshButton
            onClick={() => {
              setIsRefreshing(true);
              loadDevices().finally(() => setIsRefreshing(false));
            }}
            loading={isRefreshing}
          />
          {canCreate && (
            <button
              onClick={() => navigate(`${basePath}/add`)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer"
            >
              <FleetIcons.Plus className="w-4 h-4" />
              <span>Register New GPS Device</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Stat Cards Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Units</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <FleetIcons.Gps className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{gpsList.length}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available / Active</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <FleetIcons.Check className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{availableCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Approval</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <FleetIcons.Refresh className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">{pendingCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned / In-Use</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <FleetIcons.Bus className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-600 mt-2">{assignedCount}</p>
        </div>
      </div>

      {/* 3. Filters & Views Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <FleetIcons.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Code, IMEI, Vendor, Model..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold w-full md:w-auto overflow-x-auto">
          {['All', 'Available', 'Assigned', 'Pending', 'Rejected'].map((tab) => {
            const countMap = {
              All: gpsList.length,
              Available: availableCount,
              Assigned: assignedCount,
              Pending: pendingCount,
              Rejected: rejectedCount,
            };
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
                  activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab} ({countMap[tab] || 0})
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle */}
        <ViewModeToggle
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          tableValue="table"
          cardValue="grid"
          tableTitle="List Table View"
          cardTitle="Grid Cards View"
        />
      </div>

      {/* 4. Main List / Grid Display */}
      {paginatedGps.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <FleetIcons.Gps className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No GPS Devices Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {search ? 'No device matching your search parameters.' : 'No devices registered in this category yet.'}
          </p>
          {canCreate && (
            <button
              onClick={() => navigate(`${basePath}/add`)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
            >
              <FleetIcons.Plus className="w-4 h-4" />
              <span>Register First GPS Unit</span>
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Hardware Unit / Photo</th>
                  <th className="py-3.5 px-4">IMEI / Serial</th>
                  <th className="py-3.5 px-4">Vendor & Model</th>
                  <th className="py-3.5 px-4">Assigned Bus</th>
                  <th className="py-3.5 px-4">SIM Network</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedGps.map((g) => {
                  const photoUrl = g.image_url ? resolveFileUrl(g.image_url) : null;
                  return (
                    <tr key={g.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={g.code}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold text-xs shrink-0">
                              GPS
                            </div>
                          )}
                          <div>
                            <Link
                              to={`${basePath}/${g.id}`}
                              className="font-bold text-slate-900 hover:text-blue-600 transition-colors block"
                            >
                              {g.code || `GPS-${g.id}`}
                            </Link>
                            <span className="text-[11px] text-slate-400 font-mono block">
                              {g.alias_name || 'Telematics Unit'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-slate-700 font-bold block">{g.imei || '—'}</span>
                        <span className="text-[11px] text-slate-400 font-mono block">
                          S/N: {g.serial_number || 'N/A'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 block">{g.model || 'External Tracker'}</span>
                        <span className="text-[11px] text-slate-400 block">{g.vendor || 'Teltonika'}</span>
                      </td>

                      <td className="py-3 px-4">
                        {g.vehicle ? (
                          <div>
                            <Link
                              to={isFleetPortal ? `/fleet-manager/vehicles/${g.vehicle.id}` : `/admin/vehicles/${g.vehicle.id}`}
                              className="font-bold text-slate-900 hover:text-blue-600 transition-colors flex items-center gap-1.5"
                            >
                              <FleetIcons.Bus className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>{g.vehicle.bus_number}</span>
                            </Link>
                            <span className="text-[11px] text-slate-400 block truncate max-w-[150px]">
                              {g.vehicle.model || 'Transit Bus'}
                            </span>
                          </div>
                        ) : g.vehicle_id ? (
                          <span className="font-mono text-slate-700 font-bold">Bus #{g.vehicle_id}</span>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Unassigned (In Stock)</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-slate-700 font-medium block">{g.sim || '—'}</span>
                        <span className="text-[11px] text-slate-400 block">{g.network || 'Cellular IoT'}</span>
                      </td>

                      <td className="py-3 px-4">
                        <StatusBadge status={g.status} />
                      </td>

                      <td className="py-3 px-4 text-right">
                        <ActionDropdown
                          items={[
                            {
                              label: 'View Device Details',
                              icon: <FleetIcons.Eye className="w-4 h-4" />,
                              onClick: () => navigate(`${basePath}/${g.id}`),
                            },
                            ...(canUpdate
                              ? [
                                  {
                                    label: 'Edit Device Config',
                                    icon: <FleetIcons.Edit className="w-4 h-4" />,
                                    onClick: () => navigate(`${basePath}/edit/${g.id}`),
                                  },
                                ]
                              : []),
                            ...(canAssign
                              ? [
                                  {
                                    label: 'Assign to Bus Vehicle',
                                    icon: <FleetIcons.Bus className="w-4 h-4" />,
                                    onClick: () => navigate(`${basePath}/${g.id}/assign`),
                                  },
                                ]
                              : []),
                            ...(isAdmin && isPending(g.status)
                              ? [
                                  {
                                    label: 'Approve Device',
                                    icon: <FleetIcons.Check className="w-4 h-4 text-emerald-600" />,
                                    onClick: () => handleApprove(g),
                                  },
                                  {
                                    label: 'Reject Device',
                                    icon: <FleetIcons.Cross className="w-4 h-4 text-red-600" />,
                                    onClick: () => setRejectingDevice(g),
                                  },
                                ]
                              : []),
                            ...(canDelete
                              ? [
                                  {
                                    label: 'Delete Device',
                                    icon: <FleetIcons.Trash className="w-4 h-4 text-red-500" />,
                                    onClick: () => handleDelete(g),
                                    danger: true,
                                  },
                                ]
                              : []),
                          ]}
                        />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedGps.map((g) => {
            const photoUrl = g.image_url ? resolveFileUrl(g.image_url) : null;
            return (
              <div
                key={g.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={g.code}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold text-sm shrink-0">
                          GPS
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{g.code || `GPS-${g.id}`}</h4>
                        <p className="text-xs text-slate-400">{g.vendor || 'Teltonika'} {g.model || ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={g.status} />
                      <ActionDropdown
                        items={[
                          {
                            label: 'View Device Details',
                            icon: <FleetIcons.Eye className="w-4 h-4" />,
                            onClick: () => navigate(`${basePath}/${g.id}`),
                          },
                          ...(canUpdate
                            ? [
                                {
                                  label: 'Edit Device Config',
                                  icon: <FleetIcons.Edit className="w-4 h-4" />,
                                  onClick: () => navigate(`${basePath}/edit/${g.id}`),
                                },
                              ]
                            : []),
                          ...(canAssign
                            ? [
                                {
                                  label: 'Assign to Bus Vehicle',
                                  icon: <FleetIcons.Bus className="w-4 h-4" />,
                                  onClick: () => navigate(`${basePath}/${g.id}/assign`),
                                },
                              ]
                            : []),
                          ...(isAdmin && isPending(g.status)
                            ? [
                                {
                                  label: 'Approve Device',
                                  icon: <FleetIcons.Check className="w-4 h-4 text-emerald-600" />,
                                  onClick: () => handleApprove(g),
                                },
                                {
                                  label: 'Reject Device',
                                  icon: <FleetIcons.Cross className="w-4 h-4 text-red-600" />,
                                  onClick: () => setRejectingDevice(g),
                                },
                              ]
                            : []),
                          ...(canDelete
                            ? [
                                {
                                  label: 'Delete Device',
                                  icon: <FleetIcons.Trash className="w-4 h-4 text-red-500" />,
                                  onClick: () => handleDelete(g),
                                  danger: true,
                                },
                              ]
                            : []),
                        ]}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-blue-50/70 border border-blue-100">
                      <span className="text-[11px] font-bold text-blue-700 flex items-center gap-1">
                        <FleetIcons.Bus className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Bound Bus:</span>
                      </span>
                      {g.vehicle ? (
                        <Link
                          to={isFleetPortal ? `/fleet-manager/vehicles/${g.vehicle.id}` : `/admin/vehicles/${g.vehicle.id}`}
                          className="font-black text-blue-900 hover:underline text-xs"
                        >
                          {g.vehicle.bus_number}
                        </Link>
                      ) : (
                        <span className="font-semibold text-slate-500 text-xs">
                          {g.vehicle_id ? `Bus #${g.vehicle_id}` : 'Unassigned'}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">IMEI:</span>
                      <span className="font-mono font-bold text-slate-800">{g.imei || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Serial No:</span>
                      <span className="font-mono text-slate-700">{g.serial_number || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">SIM Line:</span>
                      <span className="font-mono text-slate-700">{g.sim || 'Unassigned'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => navigate(`${basePath}/${g.id}`)}
                    className="w-full py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all text-center"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Pagination */}
      {filteredGps.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredGps.length}
          pageSize={pageSize}
          onPageSizeChange={(sz) => {
            setPageSize(sz);
            setCurrentPage(1);
          }}
          pageSizeOptions={[10, 20, 50]}
        />
      )}

      {/* Rejection Modal */}
      {rejectingDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Reject GPS Device</h3>
              <button
                onClick={() => setRejectingDevice(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Please state the reason for rejecting GPS device{' '}
              <span className="font-bold text-slate-900">{rejectingDevice.code || rejectingDevice.imei}</span>.
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Serial number hardware mismatch, invalid SIM provider info..."
              className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingDevice(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGpsDevicesPage;
