import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useTechnicianApp } from '../../hooks/technician/useTechnicianApp';
import toast from 'react-hot-toast';

const statusIs = (d, kind) => String(d?.status || '').toLowerCase().includes(kind);

export const TechDevicesPage = () => {
  const navigate = useNavigate();
  const {
    devices,
    vehicles,
    loadDevices,
    loadVehicles,
    registerDevice,
    updateDevice,
    deleteDevice,
    toggleDeviceActive,
    rebootDevice,
  } = useTechnicianApp();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Modal state for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [formData, setFormData] = useState({
    box_id: '',
    mac: '',
    vehicle_id: '',
    depot_id: '',
    agent_version: 'v2.4.1',
    sim_network: 'Airtel 4G IoT',
    is_active: true,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'table'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    loadVehicles().catch(() => {});
  }, [loadVehicles]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      await loadDevices();
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, [loadDevices]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchData();
      toast.success('Edge devices refreshed!');
    } catch {
      toast.error('Failed to refresh edge devices.');
    } finally {
      setRefreshing(false);
    }
  };

  // Close 3-dot actions menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('[data-actions-menu]')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const deviceList = useMemo(() => {
    if (Array.isArray(devices)) return devices;
    if (devices && Array.isArray(devices.rows)) return devices.rows;
    return [];
  }, [devices]);

  const vehicleList = useMemo(() => {
    if (Array.isArray(vehicles)) return vehicles;
    if (vehicles && Array.isArray(vehicles.rows)) return vehicles.rows;
    return [];
  }, [vehicles]);

  const kpis = useMemo(() => {
    const online = deviceList.filter((d) => statusIs(d, 'online')).length;
    const offline = deviceList.filter((d) => statusIs(d, 'offline')).length;
    const active = deviceList.filter((d) => d.is_active !== false).length;
    return {
      totalDevices: deviceList.length,
      onlineDevices: online,
      activeDevices: active,
      offlineDevices: offline,
    };
  }, [deviceList]);

  const filterTabs = [
    { label: 'All', count: deviceList.length },
    { label: 'Online', count: deviceList.filter((d) => statusIs(d, 'online')).length },
    { label: 'Offline', count: deviceList.filter((d) => statusIs(d, 'offline')).length },
    { label: 'Active', count: deviceList.filter((d) => d.is_active !== false).length },
    { label: 'Inactive', count: deviceList.filter((d) => d.is_active === false).length },
  ];

  const filteredDevices = useMemo(() => {
    return deviceList.filter((device) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        String(device.id ?? '').toLowerCase().includes(q) ||
        String(device.box_id ?? '').toLowerCase().includes(q) ||
        String(device.mac ?? '').toLowerCase().includes(q) ||
        String(device.vehicle?.bus_number ?? device.vehicle_id ?? '').toLowerCase().includes(q) ||
        String(device.sim_network ?? '').toLowerCase().includes(q);

      const isActive = device.is_active !== false;

      if (!matchesSearch) return false;
      if (activeTab === 'All') return true;
      if (activeTab === 'Online') return statusIs(device, 'online');
      if (activeTab === 'Offline') return statusIs(device, 'offline');
      if (activeTab === 'Active') return isActive;
      if (activeTab === 'Inactive') return !isActive;
      return true;
    });
  }, [deviceList, searchQuery, activeTab]);

  const totalItems = filteredDevices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDevices = filteredDevices.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status) => {
    if (statusIs({ status }, 'online')) return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
    if (statusIs({ status }, 'warn')) return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
    return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800';
  };

  // Modal Handlers
  const handleOpenAddModal = () => {
    setEditingDevice(null);
    setFormData({
      box_id: '',
      mac: '',
      vehicle_id: '',
      depot_id: '',
      agent_version: 'v2.4.1',
      sim_network: 'Airtel 4G IoT',
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (device) => {
    setEditingDevice(device);
    setFormData({
      box_id: device.box_id || device.boxId || '',
      mac: device.mac || '',
      vehicle_id: device.vehicle_id || device.vehicle?.id || '',
      depot_id: device.depot_id || '',
      agent_version: device.agent_version || device.agentVersion || 'v2.4.1',
      sim_network: device.sim_network || device.simNetwork || 'Airtel 4G IoT',
      is_active: device.is_active !== undefined ? device.is_active : true,
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.box_id) {
      toast.error('Box ID is required!');
      return;
    }

    setFormSubmitting(true);
    const payload = {
      boxId: formData.box_id,
      mac: formData.mac || null,
      vehicleId: formData.vehicle_id ? Number(formData.vehicle_id) : null,
      depotId: formData.depot_id ? Number(formData.depot_id) : null,
      agentVersion: formData.agent_version || null,
      simNetwork: formData.sim_network || null,
      is_active: formData.is_active,
    };

    try {
      if (editingDevice) {
        await toast.promise(
          updateDevice(editingDevice.id, payload).then(() => fetchData()),
          {
            loading: 'Updating device details...',
            success: 'Edge device updated!',
            error: (err) => err?.message || 'Failed to update edge device.',
          }
        );
      } else {
        await toast.promise(
          registerDevice(payload).then(() => fetchData()),
          {
            loading: 'Registering edge device...',
            success: 'Edge device registered!',
            error: (err) => err?.message || 'Failed to register edge device.',
          }
        );
      }
      setIsModalOpen(false);
    } catch (_) {
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleActive = async (device) => {
    const nextStatus = !device.is_active;
    try {
      await toast.promise(
        toggleDeviceActive(device.id, nextStatus).then(() => fetchData()),
        {
          loading: `Setting edge device status to ${nextStatus ? 'Active' : 'Inactive'}...`,
          success: `Device ${nextStatus ? 'Activated' : 'Deactivated'}!`,
          error: (err) => err?.message || 'Failed to toggle status.',
        }
      );
    } catch (_) {}
  };

  const handleDelete = async (device) => {
    if (!window.confirm(`Are you sure you want to delete Edge Device "${device.box_id || device.id}"?`)) {
      return;
    }
    try {
      await toast.promise(
        deleteDevice(device.id).then(() => fetchData()),
        {
          loading: 'Deleting edge device...',
          success: 'Edge device deleted!',
          error: (err) => err?.message || 'Failed to delete device.',
        }
      );
    } catch (_) {}
  };

  const handleReboot = async (device) => {
    try {
      await toast.promise(
        rebootDevice(device.id).then(() => fetchData()),
        {
          loading: `Sending reboot command to ${device.box_id}...`,
          success: 'Reboot command dispatched!',
          error: (e) => e?.message || 'Reboot failed.',
        }
      );
    } catch (_) {}
  };

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return String(d);
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'Technician', path: '/technician/dashboard' },
              { label: 'Edge Devices' }
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Edge Devices</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Register, configure hardware, toggle active status, and maintain RK3588 edge player boxes
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
          <RefreshButton onClick={handleRefresh} loading={refreshing || loading} />
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all w-full sm:w-auto cursor-pointer"
          >
            <FleetIcons.Plus className="w-4 h-4" />
            <span>Add Edge Device</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Pills Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Total Devices</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{kpis.totalDevices} Units</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Online</span>
          <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">+{kpis.onlineDevices} Online</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Active</span>
          <div className="text-xl font-black text-blue-700 dark:text-blue-400 mt-1">{kpis.activeDevices} Active</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Offline</span>
          <div className="text-xl font-black text-rose-700 dark:text-rose-400 mt-1">{kpis.offlineDevices} Offline</div>
        </div>
      </div>

      {/* Filter Tabs & Toolbar */}
      <div className="space-y-4">
        {/* Horizontal Tab Bar */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => {
                setActiveTab(tab.label);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.label
                  ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white shadow-sm'
                  : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  activeTab === tab.label ? 'bg-slate-700 dark:bg-blue-700 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar & View Mode Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <FleetIcons.Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Box ID, MAC, or bus..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">View Mode:</span>
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              tableValue="table"
              cardValue="card"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {currentDevices.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 flex items-center justify-center mx-auto mb-3">
            <FleetIcons.Gps className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No edge devices found</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Try adjusting your search criteria or register a new edge device.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveTab('All');
            }}
            className="mt-4 px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'card' ? (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {currentDevices.map((device) => {
            const isActive = device.is_active !== false;
            return (
              <div
                key={device.id}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                      {device.box_id ?? device.id ?? '—'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getStatusBadge(device.status)}`}>
                        {device.status ?? '—'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(device)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border cursor-pointer ${
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 border-slate-300 dark:border-zinc-700'
                        }`}
                      >
                        {isActive ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{device.box_id ?? '—'}</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">MAC: {device.mac ?? '—'}</p>
                  </div>

                  <div className="mt-4 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 dark:text-zinc-500">Assigned Vehicle:</span>
                      <span className="font-bold text-slate-800 dark:text-zinc-200">
                        {device.vehicle?.bus_number ? `Bus #${device.vehicle.bus_number}` : (device.vehicle_id ?? 'Unassigned')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 dark:text-zinc-500">SIM Network:</span>
                      <span className="font-medium text-slate-700 dark:text-zinc-300">{device.sim_network ?? '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 dark:text-zinc-500">Agent Version:</span>
                      <span className="font-medium text-slate-700 dark:text-zinc-300">{device.agent_version ?? '—'}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60 dark:border-zinc-700/60">
                      <span className="text-slate-400 dark:text-zinc-500">Created:</span>
                      <span className="text-slate-600 dark:text-zinc-400">{device.createdByUser?.name || 'System'} ({formatDate(device.created_at || device.createdAt)})</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                  <Link
                    to={`/technician/devices/${device.id}/config`}
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold rounded-xl text-center transition-colors"
                  >
                    Configure Hardware
                  </Link>

                  <button
                    type="button"
                    onClick={() => navigate(`/technician/devices/${device.id}`)}
                    className="p-2 border border-slate-200 dark:border-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-xl text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
                    title="View Details"
                  >
                    <FleetIcons.Eye className="w-4 h-4 text-blue-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(device)}
                    className="p-2 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
                    title="Edit Device"
                  >
                    <FleetIcons.Edit className="w-4 h-4 text-blue-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReboot(device)}
                    className="p-2 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl text-blue-600 dark:text-blue-400 transition-colors cursor-pointer"
                    title="Reboot Device"
                  >
                    ↺
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(device)}
                    className="p-2 border border-slate-200 dark:border-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                    title="Delete Device"
                  >
                    <FleetIcons.Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Box ID / MAC</th>
                  <th className="py-3 px-4">Assigned Vehicle</th>
                  <th className="py-3 px-4">Network & Version</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Active State</th>
                  <th className="py-3 px-4">Created By</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium text-slate-700 dark:text-zinc-300">
                {currentDevices.map((device, idx) => {
                  const isNearBottom = idx >= Math.max(0, currentDevices.length - 2) && currentDevices.length > 2;
                  const isActive = device.is_active !== false;

                  return (
                    <tr key={device.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700 dark:text-blue-400">
                        <div>{device.box_id ?? device.id ?? '—'}</div>
                        <div className="text-[10px] text-slate-400 font-normal">MAC: {device.mac || '—'}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {device.vehicle?.bus_number ? `Bus #${device.vehicle.bus_number}` : (device.vehicle_id ?? 'Unassigned')}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-400">
                        <div>{device.sim_network ?? '—'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">v{device.agent_version || '2.4.1'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] border ${getStatusBadge(device.status)}`}>
                          {device.status ?? '—'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(device)}
                          className={`px-2 py-0.5 rounded-md font-bold text-[11px] border cursor-pointer ${
                            isActive
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200'
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 border-slate-200'
                          }`}
                        >
                          {isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-zinc-400">
                        <div>{device.createdByUser?.name || 'System'}</div>
                        <div className="text-[10px] text-slate-400">{formatDate(device.created_at || device.createdAt)}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/technician/devices/${device.id}`)}
                            title="View Details"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-zinc-700 transition-colors inline-flex items-center justify-center cursor-pointer"
                          >
                            <FleetIcons.Eye className="w-4 h-4" />
                          </button>

                          <Link
                            to={`/technician/devices/${device.id}/config`}
                            className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold rounded-lg transition-colors"
                          >
                            Config
                          </Link>
                          
                          {/* 3 dots menu */}
                          <div className="relative inline-block text-left" data-actions-menu>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === device.id ? null : device.id);
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 cursor-pointer"
                            >
                              <FleetIcons.MoreVertical className="w-4 h-4" />
                            </button>

                            {activeMenuId === device.id && (
                              <div
                                className={`absolute right-0 ${
                                  isNearBottom ? 'bottom-full mb-1.5 origin-bottom-right' : 'top-full mt-1.5 origin-top-right'
                                } w-44 rounded-xl bg-white dark:bg-[#181b24] border border-slate-200 dark:border-zinc-700 shadow-xl py-1 z-50 text-left divide-y divide-slate-100 dark:divide-zinc-800 animate-in fade-in zoom-in-95 duration-100`}
                              >
                                <div className="py-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      navigate(`/technician/devices/${device.id}`);
                                    }}
                                    className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
                                  >
                                    <FleetIcons.Eye className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                    <span>View Details</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      handleOpenEditModal(device);
                                    }}
                                    className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
                                  >
                                    <FleetIcons.Edit className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                    <span>Edit Device</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      handleReboot(device);
                                    }}
                                    className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
                                  >
                                    <span>↺ Remote Reboot</span>
                                  </button>
                                </div>
                                <div className="py-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      handleToggleActive(device);
                                    }}
                                    className="w-full px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-2 cursor-pointer"
                                  >
                                    <span>{isActive ? 'Deactivate' : 'Activate'}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      handleDelete(device);
                                    }}
                                    className="w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                                  >
                                    <FleetIcons.Trash className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                    <span>Delete Device</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
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

      {/* Pagination Bar */}
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

      {/* Add / Edit Device Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden space-y-0">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {editingDevice ? 'Edit Edge Device' : 'Add Edge Device'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  {editingDevice ? `Update configuration for ${editingDevice.box_id}` : 'Register a new edge box.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Box ID */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Box ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingDevice}
                    placeholder="e.g. BOX-RK3588-099"
                    value={formData.box_id}
                    onChange={(e) => setFormData({ ...formData, box_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500 disabled:opacity-60"
                  />
                </div>

                {/* MAC Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    MAC Address
                  </label>
                  <input
                    type="text"
                    placeholder="AA:BB:CC:DD:EE:FF"
                    value={formData.mac}
                    onChange={(e) => setFormData({ ...formData, mac: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Vehicle Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Assigned Vehicle / Bus
                  </label>
                  <select
                    value={formData.vehicle_id}
                    onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {vehicleList.map((v) => (
                      <option key={v.id} value={v.id}>
                        Bus #{v.bus_number || v.busNumber || v.id} ({v.model || v.plate_number || 'Vehicle'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Agent Version */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Agent Version
                  </label>
                  <input
                    type="text"
                    placeholder="v2.4.1"
                    value={formData.agent_version}
                    onChange={(e) => setFormData({ ...formData, agent_version: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* SIM Network */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    SIM Network Provider
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Airtel 4G IoT"
                    value={formData.sim_network}
                    onChange={(e) => setFormData({ ...formData, sim_network: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Active Checkbox */}
                <div className="sm:col-span-2 flex items-center gap-3 pt-1">
                  <input
                    type="checkbox"
                    id="tech_modal_is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="tech_modal_is_active" className="text-xs font-bold text-slate-700 dark:text-zinc-300 cursor-pointer select-none">
                    Device Active Status
                  </label>
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-60"
                >
                  {formSubmitting ? 'Saving...' : editingDevice ? 'Update Device' : 'Register Device'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
