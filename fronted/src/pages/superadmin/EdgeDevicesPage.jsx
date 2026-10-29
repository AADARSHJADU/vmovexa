import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { useSuperDevice } from '../../hooks/superadmin/useSuperDevice';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import toast from 'react-hot-toast';

const statusIs = (b, kind) => String(b?.status || '').toLowerCase().includes(kind);

export const EdgeDevicesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    edgeDevices,
    loadEdgeDevices,
    deleteDevice,
    toggleDeviceActive,
    rebootDevice,
  } = useSuperDevice();

  const isSuperAdminTechnician = window.location.pathname.startsWith('/superadmin/technician');
  const isTechnician = window.location.pathname.startsWith('/technician') && !isSuperAdminTechnician;
  const portalTitle = isTechnician ? 'Technician Portal' : t('nav.superadmin');
  const portalPath = isTechnician ? '/technician/dashboard' : '/superadmin/dashboard';
  const devicesPath = isSuperAdminTechnician ? '/superadmin/technician/devices' : (isTechnician ? '/technician/devices' : '/superadmin/devices');
  const addPath = isSuperAdminTechnician ? '/superadmin/technician/devices/new' : (isTechnician ? '/technician/devices/new' : '/superadmin/devices/new');

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'card'

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchData = useCallback(async () => {
    setFetchError(null);
    setLoading(true);
    try {
      await loadEdgeDevices({ limit: 100 });
    } catch (err) {
      setFetchError(err?.message || t('superadmin.edge_devices.toast_refresh_err'));
    } finally {
      setLoading(false);
    }
  }, [loadEdgeDevices, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchData();
      toast.success(t('superadmin.edge_devices.toast_refreshed'));
    } catch {
      toast.error(t('superadmin.edge_devices.toast_refresh_err'));
    } finally {
      setRefreshing(false);
    }
  };

  // Close 3-dot dropdown menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('[data-actions-menu]')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const rawList = useMemo(() => {
    if (Array.isArray(edgeDevices)) return edgeDevices;
    if (edgeDevices && Array.isArray(edgeDevices.rows)) return edgeDevices.rows;
    return [];
  }, [edgeDevices]);

  // Stat metrics
  const totalCount = rawList.length;
  const onlineCount = rawList.filter((b) => statusIs(b, 'online')).length;
  const warningCount = rawList.filter((b) => statusIs(b, 'warn')).length;
  const offlineCount = rawList.filter((b) => statusIs(b, 'offline')).length;
  const activeCount = rawList.filter((b) => b.is_active !== false).length;
  const inactiveCount = rawList.filter((b) => b.is_active === false).length;

  const filterTabs = [
    { key: 'All', label: t('common.all', 'All'), count: totalCount },
    { key: 'Online', label: t('common.online', 'Online'), count: onlineCount },
    { key: 'Warning', label: t('common.warning', 'Warning'), count: warningCount },
    { key: 'Offline', label: t('common.offline', 'Offline'), count: offlineCount },
    { key: 'Active', label: t('common.active', 'Active'), count: activeCount },
    { key: 'Inactive', label: t('common.inactive', 'Inactive'), count: inactiveCount },
  ];

  const filteredDevices = useMemo(() => {
    return rawList.filter((b) => {
      const boxId = String(b.box_id || b.boxId || '').toLowerCase();
      const mac = String(b.mac || '').toLowerCase();
      const orgName = String(b.organization?.name || b.tenantName || '').toLowerCase();
      const busNum = String(b.vehicle?.bus_number || b.busReg || '').toLowerCase();
      const search = debouncedSearch.toLowerCase();

      const matchesSearch =
        !search ||
        boxId.includes(search) ||
        mac.includes(search) ||
        orgName.includes(search) ||
        busNum.includes(search);

      const st = String(b.status || '').toLowerCase();
      const isActive = b.is_active !== false;

      if (!matchesSearch) return false;
      if (activeTab === 'All') return true;
      if (activeTab === 'Online') return st.includes('online');
      if (activeTab === 'Warning') return st.includes('warn');
      if (activeTab === 'Offline') return st.includes('offline');
      if (activeTab === 'Active') return isActive;
      if (activeTab === 'Inactive') return !isActive;
      return true;
    });
  }, [rawList, debouncedSearch, activeTab]);

  const totalPages = Math.ceil(filteredDevices.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentDevices = filteredDevices.slice(startIndex, startIndex + pageSize);

  const handleToggleActive = async (device) => {
    const nextStatus = !device.is_active;
    try {
      await toast.promise(
        toggleDeviceActive(device.id, nextStatus).then(() => fetchData()),
        {
          loading: t('superadmin.edge_devices.toast_active_updated').replace('{status}', nextStatus ? 'Active' : 'Inactive'),
          success: t('superadmin.edge_devices.toast_active_updated').replace('{status}', nextStatus ? 'Activated' : 'Deactivated'),
          error: (err) => err?.message || t('superadmin.edge_devices.toast_del_err'),
        }
      );
    } catch (_) {}
  };

  const handleDelete = async (device) => {
    const msg = t('superadmin.edge_devices.confirm_delete').replace('{id}', device.box_id || device.id);
    if (!window.confirm(msg)) {
      return;
    }
    try {
      await toast.promise(
        deleteDevice(device.id).then(() => fetchData()),
        {
          loading: t('superadmin.edge_devices.toast_deleting'),
          success: t('superadmin.edge_devices.toast_deleted'),
          error: (err) => err?.message || t('superadmin.edge_devices.toast_del_err'),
        }
      );
    } catch (_) {}
  };

  const handleReboot = async (device) => {
    try {
      await toast.promise(
        rebootDevice(device.id).then(() => fetchData()),
        {
          loading: t('superadmin.edge_devices.toast_rebooting'),
          success: t('superadmin.edge_devices.toast_reboot_success').replace('{id}', device.box_id || device.id),
          error: (e) => e?.message || t('superadmin.edge_devices.toast_reboot_err'),
        }
      );
    } catch (_) {}
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: portalTitle, to: portalPath },
          ...(isSuperAdminTechnician ? [{ label: 'Technician', to: '/superadmin/technician/devices' }] : []),
          { label: t('superadmin.edge_devices.title') },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('superadmin.edge_devices.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            {t('superadmin.edge_devices.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <RefreshButton
            onClick={handleRefresh}
            loading={refreshing || loading}
            title={t('superadmin.edge_devices.refresh_title')}
          />

          <Link
            to={addPath}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 flex-1 sm:flex-initial cursor-pointer"
          >
            <FleetIcons.Plus className="w-4 h-4" />
            <span>{t('superadmin.edge_devices.add_device')}</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Strip Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('superadmin.edge_devices.total_devices')}</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{totalCount}</div>
        </div>
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{t('superadmin.edge_devices.online_synced')}</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{onlineCount}</div>
        </div>
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{t('superadmin.edge_devices.active_status')}</span>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">{activeCount}</div>
        </div>
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">{t('superadmin.edge_devices.offline_warning')}</span>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">{offlineCount + warningCount}</div>
        </div>
      </div>

      {/* Filter Tabs & Search & View Toggle */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    activeTab === tab.key ? 'bg-slate-700 dark:bg-blue-700 text-white' : 'bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <FleetIcons.Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t('superadmin.edge_devices.search_ph')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
        </div>
      </div>

      {/* Error State */}
      {fetchError && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center space-y-2">
          <p className="text-xs text-red-700 dark:text-red-300 font-bold">{fetchError}</p>
          <button
            onClick={fetchData}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            {t('common.retry', 'Retry')}
          </button>
        </div>
      )}

      {/* Edge Devices Table / Grid View */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto min-h-[320px]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-900/80 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">{t('superadmin.edge_devices.th_device_id_mac')}</th>
                  <th className="py-3 px-4">{t('superadmin.edge_devices.th_org_bus')}</th>
                  <th className="py-3 px-4">{t('superadmin.edge_devices.th_network_version')}</th>
                  <th className="py-3 px-4">{t('superadmin.edge_devices.th_status')}</th>
                  <th className="py-3 px-4">{t('superadmin.edge_devices.th_active')}</th>
                  <th className="py-3 px-4 text-right">{t('superadmin.edge_devices.th_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                {loading ? (
                  Array.from({ length: pageSize }).map((_, i) => (
                    <tr key={`skel-d-row-${i}`} className="animate-pulse">
                      <td className="py-3.5 px-4"><div className="h-4 w-28 bg-slate-200 dark:bg-zinc-800 rounded"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 w-32 bg-slate-200 dark:bg-zinc-800 rounded"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 w-24 bg-slate-200 dark:bg-zinc-800 rounded"></div></td>
                      <td className="py-3.5 px-4"><div className="h-5 w-16 bg-slate-200 dark:bg-zinc-800 rounded-full"></div></td>
                      <td className="py-3.5 px-4"><div className="h-5 w-16 bg-slate-200 dark:bg-zinc-800 rounded-full"></div></td>
                      <td className="py-3.5 px-4 text-right"><div className="h-6 w-12 bg-slate-200 dark:bg-zinc-800 rounded ml-auto"></div></td>
                    </tr>
                  ))
                ) : currentDevices.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400 dark:text-zinc-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FleetIcons.Gps className="w-8 h-8 text-slate-400" />
                        <span>{t('superadmin.edge_devices.no_devices')}</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentDevices.map((device, idx) => {
                    const isNearBottom = idx >= Math.max(0, currentDevices.length - 2) && currentDevices.length > 2;
                    const isOnline = statusIs(device, 'online');
                    const isWarn = statusIs(device, 'warn');
                    const isActive = device.is_active !== false;

                    return (
                      <tr key={device.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                        {/* Box ID & MAC */}
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-bold text-slate-900 dark:text-white">
                            {device.box_id || device.boxId}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {device.mac || 'MAC: Unassigned'}
                          </div>
                        </td>

                        {/* Organization & Vehicle */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800 dark:text-zinc-200">
                            {device.organization?.name || device.tenantName || 'Standard Fleet'}
                          </div>
                          <div className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                            {device.vehicle?.bus_number ? `Bus #${device.vehicle.bus_number}` : (device.busReg || 'No Vehicle Assigned')}
                          </div>
                        </td>

                        {/* Network & Agent */}
                        <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-300">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {device.sim_network || device.simNetwork || '4G LTE'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Agent {device.agent_version || device.agentVersion || 'v2.4.1'}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              isOnline
                                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                : isWarn
                                ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                : 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                            }`}
                          >
                            {device.status || 'offline'}
                          </span>
                        </td>

                        {/* Active State */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(device)}
                            title={t('superadmin.edge_devices.toggle_active_title')}
                            className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border cursor-pointer transition-all ${
                              isActive
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-100'
                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border-slate-300 dark:border-zinc-700 hover:bg-slate-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'}`}></span>
                            <span>{isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}</span>
                          </button>
                        </td>

                        {/* Actions 3-dot dropdown */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Eye button for View Details */}
                            <button
                              type="button"
                              onClick={() => navigate(`${devicesPath}/${device.id}`)}
                              title={t('superadmin.edge_devices.view_details_title')}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-zinc-700 transition-colors inline-flex items-center justify-center cursor-pointer"
                            >
                              <FleetIcons.Eye className="w-4 h-4" />
                            </button>

                            <div className="relative inline-block text-left" data-actions-menu>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(activeMenuId === device.id ? null : device.id);
                                }}
                                title={t('superadmin.edge_devices.more_actions_title')}
                                className={`p-1.5 rounded-lg border transition-colors inline-flex items-center justify-center cursor-pointer ${
                                  activeMenuId === device.id
                                    ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800'
                                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 border-slate-200 dark:border-zinc-700'
                                }`}
                              >
                                <FleetIcons.MoreVertical className="w-4 h-4" />
                              </button>

                              {activeMenuId === device.id && (
                                <div
                                  className={`absolute right-0 ${
                                    isNearBottom ? 'bottom-full mb-1.5 origin-bottom-right' : 'top-full mt-1.5 origin-top-right'
                                  } w-48 rounded-xl bg-white dark:bg-[#181b24] border border-slate-200 dark:border-zinc-700 shadow-xl py-1 z-50 text-left divide-y divide-slate-100 dark:divide-zinc-800 animate-in fade-in zoom-in-95 duration-100`}
                                >
                                  <div className="py-1">
                                    {/* View Details */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuId(null);
                                        navigate(`${devicesPath}/${device.id}`);
                                      }}
                                      className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                                    >
                                      <FleetIcons.Eye className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                      <span>{t('superadmin.edge_devices.view_details')}</span>
                                    </button>

                                    {/* Edit Device */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuId(null);
                                        navigate(`${devicesPath}/${device.id}/edit`);
                                      }}
                                      className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                                    >
                                      <FleetIcons.Edit className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                      <span>{t('superadmin.edge_devices.edit_device')}</span>
                                    </button>

                                    {/* Remote Reboot */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuId(null);
                                        handleReboot(device);
                                      }}
                                      className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-2.5 transition-colors cursor-pointer"
                                    >
                                      <FleetIcons.Gps className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                      <span>{t('superadmin.edge_devices.remote_reboot')}</span>
                                    </button>
                                  </div>

                                  <div className="py-1">
                                    {/* Toggle Active / Inactive */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuId(null);
                                        handleToggleActive(device);
                                      }}
                                      className={`w-full px-3 py-2 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                                        isActive
                                          ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                          : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                                      }`}
                                    >
                                      {isActive ? (
                                        <FleetIcons.Close className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                      ) : (
                                        <FleetIcons.Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                      )}
                                      <span>{isActive ? t('superadmin.edge_devices.deactivate_device') : t('superadmin.edge_devices.activate_device')}</span>
                                    </button>

                                    {/* Delete Device */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuId(null);
                                        handleDelete(device);
                                      }}
                                      className="w-full px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 transition-colors cursor-pointer"
                                    >
                                      <FleetIcons.Trash className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                      <span>{t('superadmin.edge_devices.delete_device')}</span>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: pageSize }).map((_, i) => (
            <div key={`skel-d-card-${i}`} className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-zinc-800"></div>
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-3/4"></div>
                  <div className="h-2.5 bg-slate-200 dark:bg-zinc-800 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : currentDevices.length === 0 ? (
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center text-slate-400 dark:text-zinc-500 font-medium">
          <div className="flex flex-col items-center justify-center gap-2">
            <FleetIcons.Gps className="w-8 h-8 text-slate-400" />
            <span>{t('superadmin.edge_devices.no_devices')}</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentDevices.map((device) => {
            const isOnline = statusIs(device, 'online');
            const isWarn = statusIs(device, 'warn');
            const isActive = device.is_active !== false;

            return (
              <div key={device.id} className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                      {device.box_id || device.boxId}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {device.vehicle?.bus_number ? `Bus #${device.vehicle.bus_number}` : (device.busReg || 'Unassigned')}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                      {device.organization?.name || device.tenantName || 'Standard Organization'}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isOnline
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          : isWarn
                          ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                          : 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {device.status || 'offline'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded-md ${
                        isActive ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-zinc-800 text-slate-400'
                      }`}
                    >
                      {isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-zinc-900/80 rounded-xl border border-slate-100 dark:border-zinc-800 text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-zinc-500 text-[10px]">{t('superadmin.edge_devices.mac_address')}</span>
                    <div className="font-mono font-bold text-slate-900 dark:text-white text-[11px] truncate">{device.mac || '—'}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-zinc-500 text-[10px]">{t('superadmin.edge_devices.sim_network')}</span>
                    <div className="font-bold text-slate-900 dark:text-white text-[11px] truncate">{device.sim_network || device.simNetwork || '4G LTE'}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`${devicesPath}/${device.id}`)}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1.5 cursor-pointer"
                      title={t('superadmin.edge_devices.view_details_title')}
                    >
                      <FleetIcons.Eye className="w-3.5 h-3.5" />
                      <span>{t('superadmin.edge_devices.btn_details')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`${devicesPath}/${device.id}/edit`)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <FleetIcons.Edit className="w-3.5 h-3.5 text-blue-500" />
                      <span>{t('superadmin.edge_devices.btn_edit')}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleReboot(device)}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100 cursor-pointer"
                    >
                      {t('superadmin.edge_devices.btn_reboot')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(device)}
                      className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 cursor-pointer"
                      title={t('superadmin.edge_devices.delete_device')}
                    >
                      <FleetIcons.Trash className="w-4 h-4" />
                    </button>
                  </div>
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
        onPageChange={setCurrentPage}
        totalItems={filteredDevices.length}
        pageSize={pageSize}
        onPageSizeChange={(sz) => {
          setPageSize(sz);
          setCurrentPage(1);
        }}
        pageSizeOptions={[10, 20, 50, 100]}
      />
    </div>
  );
};

export default EdgeDevicesPage;
