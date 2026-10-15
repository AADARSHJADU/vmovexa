import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useTechnicianApp } from '../../hooks/technician/useTechnicianApp';

export const TechHardwareStatusPage = () => {
  const navigate = useNavigate();
  const { vehicles, devices, loadVehicles, loadDevices } = useTechnicianApp();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.allSettled([loadVehicles(), loadDevices()]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadVehicles().catch(() => {});
    loadDevices().catch(() => {});
  }, [loadVehicles, loadDevices]);

  const vehicleList = Array.isArray(vehicles) ? vehicles : (vehicles?.rows || []);
  const deviceList = Array.isArray(devices) ? devices : (devices?.rows || []);

  const kpis = useMemo(() => {
    const online = deviceList.filter((d) => (d.status || '').toLowerCase() === 'online').length;
    const offline = deviceList.filter((d) => (d.status || '').toLowerCase() === 'offline').length;
    return {
      totalDevices: deviceList.length,
      onlineDevices: online,
      offlineDevices: offline,
      brokenWithIssues: Math.max(deviceList.length - online - offline, 0),
    };
  }, [deviceList]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'card'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const vehicleStatusMap = useMemo(() => {
    const map = {};
    deviceList.forEach((d) => {
      if (d.vehicle_id) {
        map[d.vehicle_id] = d;
      }
    });
    return map;
  }, [deviceList]);

  const categorizedVehicles = useMemo(() => {
    let healthy = 0;
    let warnings = 0;
    let critical = 0;

    vehicleList.forEach((v) => {
      const dev = vehicleStatusMap[v.id];
      const st = (dev?.status || '').toLowerCase();
      if (st === 'online') {
        healthy++;
      } else if (st === 'offline') {
        critical++;
      } else {
        warnings++;
      }
    });

    return { healthy, warnings, critical };
  }, [vehicleList, vehicleStatusMap]);

  const filterTabs = [
    { label: 'All', count: vehicleList.length },
    { label: 'Healthy', count: categorizedVehicles.healthy },
    { label: 'Warnings', count: categorizedVehicles.warnings },
    { label: 'Critical / Offline', count: categorizedVehicles.critical },
  ];

  const filteredVehicles = useMemo(() => {
    return vehicleList.filter((v) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        String(v.bus_number ?? '').toLowerCase().includes(q) ||
        String(v.vehicle_type ?? '').toLowerCase().includes(q) ||
        String(v.code ?? '').toLowerCase().includes(q) ||
        String(v.depot_id ?? '').toLowerCase().includes(q);

      if (!matchesSearch) return false;

      const dev = vehicleStatusMap[v.id];
      const st = (dev?.status || '').toLowerCase();

      if (activeFilter === 'Healthy') return st === 'online';
      if (activeFilter === 'Critical / Offline') return st === 'offline';
      if (activeFilter === 'Warnings') return st !== 'online' && st !== 'offline';
      return true;
    });
  }, [vehicleList, searchQuery, activeFilter, vehicleStatusMap]);

  // Pagination calculation
  const totalItems = filteredVehicles.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentVehicles = filteredVehicles.slice(startIndex, startIndex + itemsPerPage);

  const getSubsystemPill = (rawStatus) => {
    const status = rawStatus ?? '—';
    if (status === 'Online' || status === 'Good Signal' || status === 'Connected (4G LTE)' || status === 'Connected (Wi-Fi)' || status === 'Healthy') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>{status}</span>
        </span>
      );
    }
    if (status === 'Not Installed' || status === '—') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-zinc-500"></span>
          <span>{status}</span>
        </span>
      );
    }
    if (status === 'Maintenance' || status === 'Weak Signal' || status === 'Connected (3G Fallback)' || status.includes('Degraded') || status.includes('High Temp')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          <span>{status}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 text-[11px] font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
        <span>{status}</span>
      </span>
    );
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'Technician', path: '/technician/dashboard' },
              { label: 'Hardware Subsystems' }
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Hardware Subsystems Status</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Real-time multi-subsystem telemetry matrix across GPS, Displays, Network, and Core Hardware
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <RefreshButton onClick={handleRefresh} loading={refreshing} />
          <Link
            to="/technician/diagnostics"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <FleetIcons.Target className="w-4 h-4" />
            <span>Run All Diagnostics</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Total Monitored</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{vehicleList.length} Fleets</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Online Devices</span>
          <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{kpis.onlineDevices} Systems</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">With Issues</span>
          <div className="text-xl font-black text-amber-700 dark:text-amber-400 mt-1">{kpis.brokenWithIssues} Issues</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">Offline / Faults</span>
          <div className="text-xl font-black text-red-700 dark:text-red-400 mt-1">{kpis.offlineDevices} Offline</div>
        </div>
      </div>

      {/* Toolbar & Filter Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => {
                setActiveFilter(tab.label);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeFilter === tab.label
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                  : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  activeFilter === tab.label ? 'bg-slate-700 dark:bg-zinc-200 text-white dark:text-zinc-900' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <FleetIcons.Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Device ID, Bus or Depot..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-700 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">View:</span>
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              tableValue="table"
              cardValue="card"
            />
          </div>
        </div>
      </div>

      {/* Main Table / Grid Content */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Vehicle / Fleet</th>
                  <th className="py-3 px-4">Depot</th>
                  <th className="py-3 px-4">GPS Telematics</th>
                  <th className="py-3 px-4">Display Screen</th>
                  <th className="py-3 px-4">Network Telemetry</th>
                  <th className="py-3 px-4">Hardware Health</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium text-slate-700 dark:text-zinc-300">
                {currentVehicles.map((v) => {
                  const dev = vehicleStatusMap[v.id];
                  const isDevOnline = (dev?.status || '').toLowerCase() === 'online';
                  const isDevOffline = (dev?.status || '').toLowerCase() === 'offline';
                  const displayStatus = dev ? (isDevOnline ? 'Online' : 'Offline') : (v.display_status || 'Not Installed');
                  const gpsStatus = v.gps_status || (v.gps_device_id ? 'Online' : 'Not Installed');
                  const netStatus = dev ? (isDevOnline && dev.sim_network ? `Connected (${dev.sim_network})` : 'Offline') : (v.network_status || 'Not Installed');
                  const hwHealth = isDevOnline ? 'Healthy' : (isDevOffline ? 'Degraded / Offline' : 'Maintenance');
                  const diagLink = dev?.id ? `/technician/diagnostics?device=${dev.id}` : '/technician/diagnostics';
                  const connLink = dev?.id ? `/technician/connectivity?device=${dev.id}` : '/technician/connectivity';

                  return (
                    <tr key={v.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">{v.bus_number ?? '—'}</div>
                        <div className="text-[11px] text-slate-400 dark:text-zinc-500">{v.vehicle_type ?? '—'}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-zinc-400">{v.depot_id ?? '—'}</td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div>{getSubsystemPill(gpsStatus)}</div>
                          <div className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">{v.code ?? '—'}</div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div>{getSubsystemPill(displayStatus)}</div>
                          <div className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">{dev?.box_id ?? dev?.id ?? '—'}</div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">{getSubsystemPill(netStatus)}</td>
                      <td className="py-3.5 px-4">{getSubsystemPill(hwHealth)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={diagLink}
                            className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold rounded-lg transition-colors"
                          >
                            Test
                          </Link>
                          <Link
                            to={connLink}
                            className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 font-bold rounded-lg transition-colors"
                          >
                            Fix
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {currentVehicles.map((v) => {
            const dev = vehicleStatusMap[v.id];
            const isDevOnline = (dev?.status || '').toLowerCase() === 'online';
            const isDevOffline = (dev?.status || '').toLowerCase() === 'offline';
            const displayStatus = dev ? (isDevOnline ? 'Online' : 'Offline') : (v.display_status || 'Not Installed');
            const gpsStatus = v.gps_status || (v.gps_device_id ? 'Online' : 'Not Installed');
            const netStatus = dev ? (isDevOnline && dev.sim_network ? `Connected (${dev.sim_network})` : 'Offline') : (v.network_status || 'Not Installed');
            const hwHealth = isDevOnline ? 'Healthy' : (isDevOffline ? 'Degraded / Offline' : 'Maintenance');
            const diagLink = dev?.id ? `/technician/diagnostics?device=${dev.id}` : '/technician/diagnostics';
            const connLink = dev?.id ? `/technician/connectivity?device=${dev.id}` : '/technician/connectivity';

            return (
              <div key={v.id} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{v.bus_number ?? '—'}</span>
                    <div className="text-xs text-slate-400 dark:text-zinc-500">{v.vehicle_type ?? '—'} · Depot {v.depot_id ?? '—'}</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 dark:text-zinc-500">GPS Telematics:</span>
                    {getSubsystemPill(gpsStatus)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 dark:text-zinc-500">Display Screen:</span>
                    {getSubsystemPill(displayStatus)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 dark:text-zinc-500">Network:</span>
                    {getSubsystemPill(netStatus)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 dark:text-zinc-500">Hardware Health:</span>
                    {getSubsystemPill(hwHealth)}
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <Link
                    to={diagLink}
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white text-xs font-bold rounded-xl text-center transition-colors"
                  >
                    Run Diagnostics
                  </Link>
                  <Link
                    to={connLink}
                    className="px-3 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold rounded-xl transition-colors"
                  >
                    Resolve
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
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
