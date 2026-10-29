import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Pagination } from '../../components/ui/Pagination';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useFleetGps } from '../../hooks/fleet/useFleetGps';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import { ActionDropdown } from '../../components/ui/ActionDropdown';

/** Assignment Status Badge */
const AssignmentBadge = ({ isAssigned }) => {
  const { t } = useTranslation();
  if (isAssigned) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 shrink-0">
        <FleetIcons.Check className="w-3.5 h-3.5" />
        <span>{t('admin.gps.status_assigned')}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 shrink-0">
      <FleetIcons.Cross className="w-3.5 h-3.5" />
      <span>{t('admin.gps.status_spare')}</span>
    </span>
  );
};

/** Hardware Online/Offline Status Badge */
const DeviceStatusBadge = ({ status }) => {
  const { t } = useTranslation();
  const isOnline = String(status || '').toLowerCase() === 'online';
  if (isOnline) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>{t('admin.gps.status_online')}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 shrink-0">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
      <span>{status || 'Standby'}</span>
    </span>
  );
};

export const AdminGpsDevicesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasPermission } = useAuth();

  const roleCode = typeof user?.role === 'string' ? user.role : (user?.role?.code || '');
  const isFleetPortal = location.pathname.startsWith('/fleet-operator');
  const basePath = isFleetPortal ? '/fleet-operator/edge-devices' : '/admin/edge-devices';
  const isAdmin =
    roleCode === 'ROLE-TENANT-ADMIN' ||
    roleCode === 'TROLE-ADMIN' ||
    roleCode === 'ROLE-ADMIN' ||
    roleCode === 'ROLE-SUPER-ADMIN' ||
    !isFleetPortal;

  const canView = isAdmin || hasPermission('fleet.devices.read');
  const canAssign = isAdmin || hasPermission('fleet.devices.assign');

  const { devices, loadDevices, assignVehicle } = useFleetGps();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [selectedFleet, setSelectedFleet] = useState('All');
  const [viewMode, setViewMode] = useState('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isFleetPortal && !canView) return;
    loadDevices().catch(() => {});
  }, [loadDevices, isFleetPortal, canView]);

  const deviceList = useMemo(() => Array.isArray(devices) ? devices : (devices?.items || devices?.rows || []), [devices]);

  const isAssigned = (g) => Boolean(g.vehicle_id || g.vehicle);

  // Extract unique fleets for filtering (especially for Tenant Admin)
  const uniqueFleets = useMemo(() => {
    const map = new Map();
    deviceList.forEach((g) => {
      const fl = g.vehicle?.fleet;
      if (fl && fl.id && !map.has(fl.id)) {
        map.set(fl.id, fl);
      }
    });
    return Array.from(map.values());
  }, [deviceList]);

  const filteredDevices = deviceList.filter((g) => {
    const q = search.toLowerCase();
    const assigned = isAssigned(g);

    const matchesSearch =
      String(g.box_id || g.code || g.id || '').toLowerCase().includes(q) ||
      String(g.mac || '').toLowerCase().includes(q) ||
      String(g.imei || '').toLowerCase().includes(q) ||
      String(g.vendor || '').toLowerCase().includes(q) ||
      String(g.model || '').toLowerCase().includes(q) ||
      String(g.agent_version || '').toLowerCase().includes(q) ||
      String(g.sim_network || g.sim || '').toLowerCase().includes(q) ||
      String(g.serial_number || '').toLowerCase().includes(q) ||
      String(g.vehicle?.bus_number || '').toLowerCase().includes(q) ||
      String(g.vehicle?.model || '').toLowerCase().includes(q) ||
      String(g.vehicle?.vin || '').toLowerCase().includes(q) ||
      String(g.vehicle?.fleet?.name || g.vehicle?.fleet?.code || '').toLowerCase().includes(q) ||
      String(g.vehicle?.organization?.name || g.organization?.name || '').toLowerCase().includes(q) ||
      String(g.vehicle?.depot?.name || '').toLowerCase().includes(q) ||
      String(g.vehicle_id || '').includes(q);

    let matchesTab = true;
    if (activeTab === 'Assigned') matchesTab = assigned;
    if (activeTab === 'Unassigned') matchesTab = !assigned;

    let matchesFleet = true;
    if (selectedFleet !== 'All') {
      matchesFleet = String(g.vehicle?.fleet?.id || g.vehicle?.fleet_id || '') === String(selectedFleet);
    }

    return matchesSearch && matchesTab && matchesFleet;
  });

  const totalPages = Math.ceil(filteredDevices.length / pageSize) || 1;
  const paginatedDevices = filteredDevices.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const assignedCount = deviceList.filter(isAssigned).length;
  const availableCount = deviceList.length - assignedCount;

  const handleUnlink = async (device) => {
    if (!canAssign) {
      toast.error('You do not have permission to change device assignments.');
      return;
    }
    const busLabel = device.vehicle?.bus_number || (device.vehicle_id ? `Bus #${device.vehicle_id}` : 'assigned vehicle');
    const deviceLabel = device.box_id || device.code || device.mac || `Edge Box #${device.id}`;
    if (!window.confirm(`Unlink Edge Device ${deviceLabel} from ${busLabel}? (GPS receiver will also be unlinked)`)) return;

    try {
      await toast.promise(assignVehicle(device.id, null), {
        loading: 'Unlinking Edge Device & GPS from bus...',
        success: 'Edge Device unlinked successfully!',
        error: (err) => err?.message || 'Failed to unlink Edge Device',
      });
      loadDevices().catch(() => {});
    } catch {
      // toast.promise reports the API error.
    }
  };

  if (isFleetPortal && !canView) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
          <FleetIcons.Key className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('admin.gps.access_restricted')}</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 font-medium">
          You do not have permission to view Edge Devices. Please contact your administrator.
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
              { label: isFleetPortal ? 'Fleet Operator' : 'Tenant Admin', path: isFleetPortal ? '/fleet-operator/dashboard' : '/admin/dashboard' },
              { label: t('admin.gps.title') },
            ]}
            className="mb-2"
          />
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <span>{t('admin.gps.title')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            {t('admin.gps.subtitle')}
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
        </div>
      </div>

      {/* 2. Stat Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{t('admin.gps.stat_total')}</span>
            <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400">
              <FleetIcons.EdgeDevice className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{deviceList.length}</p>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
            {isFleetPortal ? 'Edge boxes allocated to your fleet' : 'Total IoT edge compute units across tenant'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{t('admin.gps.stat_connected')}</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <FleetIcons.Bus className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{assignedCount}</p>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
            {isFleetPortal ? 'Active buses with live edge & GPS link' : 'Buses equipped with edge boxes across all fleets'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{t('admin.gps.status_spare')}</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <FleetIcons.Refresh className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">{availableCount}</p>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">{t('admin.gps.stat_spare_desc')}</p>
        </div>
      </div>

      {/* 3. Filters & Views Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto flex-1">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <FleetIcons.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={t('admin.gps.search_placeholder')}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500"
            />
          </div>

          {/* Fleet Filter Dropdown (shown when multiple fleets exist) */}
          {!isFleetPortal && uniqueFleets.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 whitespace-nowrap">{t('admin.gps.fleet_filter_label')}</span>
              <select
                value={selectedFleet}
                onChange={(e) => {
                  setSelectedFleet(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white cursor-pointer"
              >
                <option value="All">{t('admin.gps.all_fleets')} ({deviceList.length})</option>
                {uniqueFleets.map((fl) => (
                  <option key={fl.id} value={fl.id}>
                    Fleet: {fl.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap justify-between lg:justify-end">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold overflow-x-auto">
            {[
              { id: 'All', label: 'All Edge Units', count: deviceList.length },
              { id: 'Assigned', label: 'Assigned to Bus', count: assignedCount },
              { id: 'Unassigned', label: 'Spare Units', count: availableCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
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
      </div>

      {/* 4. Main List / Grid Display */}
      {paginatedDevices.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 flex items-center justify-center mx-auto mb-3">
            <FleetIcons.EdgeDevice className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('admin.gps.no_devices_found')}</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            {search || selectedFleet !== 'All'
              ? 'No bus or Edge Device matched your filter criteria.'
              : 'No Edge Devices currently available in this category.'}
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">{t('admin.gps.col_bus_vehicle')}</th>
                  <th className="py-3.5 px-4">{t('admin.gps.col_fleet_tenant')}</th>
                  <th className="py-3.5 px-4">{t('admin.gps.col_box_id')}</th>
                  <th className="py-3.5 px-4">{t('admin.gps.col_hardware_mac')}</th>
                  <th className="py-3.5 px-4">{t('admin.gps.col_sim_telematics')}</th>
                  <th className="py-3.5 px-4">{t('admin.gps.col_assignment_status')}</th>
                  <th className="py-3.5 px-4 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                {paginatedDevices.map((g) => {
                  const assigned = isAssigned(g);
                  const fleetName = g.vehicle?.fleet?.name;
                  const orgName = g.vehicle?.organization?.name || g.organization?.name;
                  const depotName = g.vehicle?.depot?.name;
                  const boxId = g.box_id || g.code || `EDGE-${g.id}`;

                  return (
                    <tr key={g.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                      {/* Column 1: Bus / Vehicle */}
                      <td className="py-3 px-4">
                        {g.vehicle ? (
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
                              <FleetIcons.Bus className="w-4 h-4" />
                            </div>
                            <div>
                              <Link
                                to={isFleetPortal ? `/fleet-operator/vehicles/${g.vehicle.id}` : `/admin/vehicles/${g.vehicle.id}`}
                                className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors block"
                              >
                                {g.vehicle.bus_number}
                              </Link>
                              <span className="text-[11px] text-slate-400 dark:text-zinc-500 block">
                                {g.vehicle.model || 'Transit Bus'} {g.vehicle.vin ? `• ${g.vehicle.vin}` : ''}
                              </span>
                            </div>
                          </div>
                        ) : g.vehicle_id ? (
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
                              <FleetIcons.Bus className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white">Bus #{g.vehicle_id}</span>
                              <span className="text-[11px] text-slate-400 dark:text-zinc-500 block">{t('admin.gps.linked_vehicle')}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
                              <FleetIcons.Bus className="w-4 h-4" />
                            </div>
                            <span className="text-slate-400 dark:text-zinc-500 italic text-[11px]">
                              Not assigned to any bus
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Column 2: Fleet & Tenant (Hierarchy) */}
                      <td className="py-3 px-4">
                        {fleetName ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                              <span className="truncate max-w-[170px]">{fleetName}</span>
                            </div>
                            {orgName && (
                              <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                                <FleetIcons.Depot className="w-3 h-3 text-slate-400 dark:text-zinc-500 shrink-0" />
                                <span className="truncate max-w-[170px]">{orgName}</span>
                              </div>
                            )}
                            {depotName && (
                              <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">
                                Depot: {depotName}
                              </span>
                            )}
                          </div>
                        ) : g.vehicle ? (
                          <div className="space-y-1">
                            <span className="text-slate-500 dark:text-zinc-400 text-xs font-semibold">{t('admin.gps.general_fleet')}</span>
                            {orgName && (
                              <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                                <FleetIcons.Depot className="w-3 h-3 text-slate-400 dark:text-zinc-500 shrink-0" />
                                <span className="truncate max-w-[170px]">{orgName}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="text-slate-400 dark:text-zinc-500 italic text-[11px]">{t('admin.gps.spare_hardware')}</span>
                            {orgName && (
                              <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                                <FleetIcons.Depot className="w-3 h-3 text-slate-400 dark:text-zinc-500 shrink-0" />
                                <span className="truncate max-w-[170px]">{orgName}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Column 3: Edge Device (Box ID & Model) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                            <FleetIcons.EdgeDevice className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 dark:text-white font-mono block">
                                {boxId}
                              </span>
                              <DeviceStatusBadge status={g.status} />
                            </div>
                            <span className="text-[11px] text-slate-400 dark:text-zinc-500 block">
                              {g.model || 'EdgeBox-500'} {g.agent_version ? `• v${g.agent_version}` : ''}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 4: MAC & Hardware Specs */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-slate-800 dark:text-zinc-200 font-bold block">{g.mac || g.imei || '—'}</span>
                        <span className="text-[11px] text-slate-400 dark:text-zinc-500 block">
                          Storage: {g.storage_used_gb || 0} / {g.storage_total_gb || 64} GB
                        </span>
                      </td>

                      {/* Column 5: SIM & Telematics (GPS Connected) */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800 dark:text-zinc-200 block">
                          {g.sim_network || g.sim || '4G Cellular IoT'}
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <FleetIcons.Gps className="w-3 h-3 text-amber-500" />
                          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                            {assigned ? 'GPS Stream Active' : 'GPS Receiver Ready'}
                          </span>
                        </div>
                      </td>

                      {/* Column 6: Status */}
                      <td className="py-3 px-4">
                        <AssignmentBadge isAssigned={assigned} />
                      </td>

                      {/* Column 7: Actions */}
                      <td className="py-3 px-4 text-right">
                        <ActionDropdown
                          items={[
                            ...(canAssign && assigned
                              ? [
                                  {
                                    label: 'Reassign to Another Bus',
                                    icon: <FleetIcons.Edit className="w-4 h-4 text-blue-600" />,
                                    onClick: () => navigate(`${basePath}/${g.id}/assign`),
                                  },
                                  {
                                    label: 'Unlink from Bus',
                                    icon: <FleetIcons.Cross className="w-4 h-4 text-red-500" />,
                                    onClick: () => handleUnlink(g),
                                    danger: true,
                                  },
                                  ...(g.vehicle
                                    ? [
                                        {
                                          label: 'View Bus Profile',
                                          icon: <FleetIcons.Bus className="w-4 h-4" />,
                                          onClick: () =>
                                            navigate(
                                              isFleetPortal
                                                ? `/fleet-operator/vehicles/${g.vehicle.id}`
                                                : `/admin/vehicles/${g.vehicle.id}`
                                            ),
                                        },
                                      ]
                                    : []),
                                ]
                              : canAssign ? [
                                  {
                                    label: 'Assign to Bus',
                                    icon: <FleetIcons.Bus className="w-4 h-4 text-emerald-600" />,
                                    onClick: () => navigate(`${basePath}/${g.id}/assign`),
                                  },
                                ] : []),
                            {
                              label: 'View Edge Device Details',
                              icon: <FleetIcons.Eye className="w-4 h-4" />,
                              onClick: () => navigate(`${basePath}/${g.id}`),
                            },
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
          {paginatedDevices.map((g) => {
            const assigned = isAssigned(g);
            const fleetName = g.vehicle?.fleet?.name;
            const orgName = g.vehicle?.organization?.name || g.organization?.name;
            const depotName = g.vehicle?.depot?.name;
            const boxId = g.box_id || g.code || `EDGE-${g.id}`;

            return (
              <div
                key={g.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Bus & Status */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                        assigned
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 border-slate-200 dark:border-zinc-700'
                      }`}>
                        <FleetIcons.Bus className="w-5 h-5" />
                      </div>
                      <div>
                        {g.vehicle ? (
                          <Link
                            to={isFleetPortal ? `/fleet-operator/vehicles/${g.vehicle.id}` : `/admin/vehicles/${g.vehicle.id}`}
                            className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 text-sm block"
                          >
                            {g.vehicle.bus_number}
                          </Link>
                        ) : g.vehicle_id ? (
                          <span className="font-bold text-slate-900 dark:text-white text-sm block">Bus #{g.vehicle_id}</span>
                        ) : (
                          <span className="font-bold text-slate-400 dark:text-zinc-500 text-sm block">{t('admin.gps.unassigned_bus')}</span>
                        )}
                        <span className="text-xs text-slate-400 dark:text-zinc-500">
                          {g.vehicle?.model || (assigned ? t('admin.gps.linked_vehicle') : t('admin.gps.spare_edge_unit'))}
                        </span>
                      </div>
                    </div>
                    <AssignmentBadge isAssigned={assigned} />
                  </div>

                  {/* Card Fleet & Tenant Details Block */}
                  <div className="mb-3 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 text-xs space-y-1.5 border border-blue-100 dark:border-blue-900/40">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{t('admin.gps.tenant_org_label')}</span>
                      <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate max-w-[170px]">
                        {orgName || 'Tenant Organization'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{t('admin.gps.fleet_filter_label')}</span>
                      <span className="font-bold text-slate-900 dark:text-white truncate max-w-[170px]">
                        {fleetName || (assigned ? t('admin.gps.general_fleet') : '—')}
                      </span>
                    </div>
                    {depotName && (
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{t('admin.gps.depot_label')}</span>
                        <span className="text-slate-600 dark:text-zinc-300 font-medium truncate max-w-[170px]">
                          {depotName}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Hardware Details */}
                  <div className="space-y-2 text-xs bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-100 dark:border-zinc-800">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 dark:text-zinc-400 font-medium">{t('admin.gps.box_id_label')}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{boxId}</span>
                        <DeviceStatusBadge status={g.status} />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 dark:text-zinc-400 font-medium">{t('admin.gps.mac_address_label')}</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">{g.mac || g.imei || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 dark:text-zinc-400 font-medium">{t('admin.gps.model_agent_label')}</span>
                      <span className="font-medium text-slate-700 dark:text-zinc-300">{g.model || 'EdgeBox'} (v{g.agent_version || '1.0'})</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 dark:text-zinc-400 font-medium">{t('admin.gps.sim_network_label')}</span>
                      <span className="font-medium text-slate-700 dark:text-zinc-300">{g.sim_network || g.sim || '4G IoT'}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 dark:border-zinc-700/60">
                      <span className="text-slate-400 dark:text-zinc-400 font-medium">{t('admin.gps.connected_gps_label')}</span>
                      <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                        <FleetIcons.Gps className="w-3 h-3" />
                        <span>{assigned ? 'Streaming Telemetry' : 'Receiver Linked'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                  {canAssign && (assigned ? (
                    <>
                      <button
                        onClick={() => navigate(`${basePath}/${g.id}/assign`)}
                        className="flex-1 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-all text-center cursor-pointer"
                      >
                        Reassign Bus
                      </button>
                      <button
                        onClick={() => handleUnlink(g)}
                        className="py-1.5 px-3 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 text-xs font-bold transition-all cursor-pointer"
                        title={t('admin.gps.unlink_from_bus')}
                      >
                        Unlink
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => navigate(`${basePath}/${g.id}/assign`)}
                      className="w-full py-1.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-slate-900 text-xs font-bold transition-all text-center cursor-pointer"
                    >
                      Assign to Bus
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Pagination */}
      {filteredDevices.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredDevices.length}
          pageSize={pageSize}
          onPageSizeChange={(sz) => {
            setPageSize(sz);
            setCurrentPage(1);
          }}
          pageSizeOptions={[10, 20, 50]}
        />
      )}
    </div>
  );
};

export default AdminGpsDevicesPage;
