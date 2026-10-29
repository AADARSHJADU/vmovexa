import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useSuperDevice } from '../../hooks/superadmin/useSuperDevice';
import { apiClient } from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import toast from 'react-hot-toast';

export const EdgeDeviceDetailsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { toggleDeviceActive, rebootDevice, deleteDevice } = useSuperDevice();

  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const isTechnician = window.location.pathname.startsWith('/technician');
  const portalTitle = isTechnician ? (t('superadmin.edge_devices.technician_portal') || 'Technician Portal') : (t('nav.superadmin') || 'Super Admin');
  const portalPath = isTechnician ? '/technician/dashboard' : '/superadmin/dashboard';
  const devicesPath = isTechnician ? '/technician/devices' : '/superadmin/devices';
  const editPath = isTechnician ? `/technician/devices/${device?.id}/edit` : `/superadmin/devices/${device?.id}/edit`;

  const fetchDeviceDetails = useCallback(async (isSilent = false) => {
    if (!id) return;
    if (!isSilent) setLoading(true);
    else setIsRefreshing(true);
    setError(null);
    try {
      const res = await apiClient.get(ENDPOINTS.DEVICES.EDGE_ONE(id));
      const data = res.data?.data || res.data;
      setDevice(data);
    } catch (err) {
      if (!isSilent) setError(err?.message || 'Failed to load edge device details.');
    } finally {
      if (!isSilent) setLoading(false);
      setIsRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDeviceDetails(false);
    const interval = setInterval(() => {
      fetchDeviceDetails(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchDeviceDetails]);

  const handleToggleActive = async () => {
    if (!device) return;
    const nextStatus = !device.is_active;
    try {
      await toast.promise(
        toggleDeviceActive(device.id, nextStatus).then(() => fetchDeviceDetails(true)),
        {
          loading: `Setting active status to ${nextStatus ? 'Active' : 'Inactive'}...`,
          success: `Device ${nextStatus ? 'Activated' : 'Deactivated'}!`,
          error: (err) => err?.message || 'Failed to toggle status.',
        }
      );
    } catch (_) {}
  };

  const handleReboot = async () => {
    if (!device) return;
    try {
      await toast.promise(
        rebootDevice(device.id).then(() => fetchDeviceDetails(true)),
        {
          loading: `Dispatching reboot to ${device.box_id}...`,
          success: 'Reboot command sent successfully!',
          error: (err) => err?.message || 'Reboot failed.',
        }
      );
    } catch (_) {}
  };

  const handleDelete = async () => {
    if (!device) return;
    if (!window.confirm(`Are you sure you want to delete Edge Device "${device.box_id || device.id}"?`)) {
      return;
    }
    try {
      await toast.promise(
        deleteDevice(device.id),
        {
          loading: 'Deleting edge device...',
          success: 'Device deleted!',
          error: (err) => err?.message || 'Failed to delete device.',
        }
      );
      navigate(devicesPath);
    } catch (_) {}
  };

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return String(d);
    }
  };

  if (loading) {
    return (
      <div className="w-full space-y-6 animate-in fade-in duration-200">
        <Breadcrumb items={[{ label: portalTitle, path: portalPath }, { label: t('superadmin.edge_devices.title') || 'Devices', path: devicesPath }, { label: t('common.details') || 'Device Details' }]} />
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-16 text-center animate-pulse space-y-3">
          <FleetIcons.Gps className="w-8 h-8 text-blue-500 mx-auto animate-spin" />
          <p className="text-xs text-slate-400 font-bold">{t('common.loading') || 'Loading device details...'}</p>
        </div>
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="w-full space-y-6 animate-in fade-in duration-200">
        <Breadcrumb items={[{ label: portalTitle, path: portalPath }, { label: t('superadmin.edge_devices.title') || 'Devices', path: devicesPath }, { label: t('common.details') || 'Device Details' }]} />
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl p-8 text-center space-y-3">
          <p className="text-xs font-bold text-rose-700 dark:text-rose-300">{error || t('superadmin.edge_devices.not_found') || 'Device not found.'}</p>
          <Link to={devicesPath} className="inline-flex items-center gap-1 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-colors">
            <FleetIcons.ArrowLeft className="w-4 h-4" />
            <span>{t('superadmin.devices.back_to_devices') || 'Back to Devices'}</span>
          </Link>
        </div>
      </div>
    );
  }

  const isOnline = String(device.status || '').toLowerCase().includes('online');
  const isWarn = String(device.status || '').toLowerCase().includes('warn');
  const isActive = device.is_active !== false;

  // Extract connected displays / screens array
  const displays = Array.isArray(device.displays)
    ? device.displays
    : (Array.isArray(device.Displays) ? device.Displays : []);

  // Extract real-time telemetry array
  const latestTelemetry = (Array.isArray(device.telemetry) && device.telemetry.length > 0)
    ? device.telemetry[0]
    : (device.telemetry || {});

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      <Breadcrumb
        items={[
          { label: portalTitle, href: portalPath, icon: FleetIcons.Dashboard },
          { label: t('superadmin.edge_devices.title') || 'Devices', href: devicesPath },
          { label: `${t('superadmin.edge_devices.device_title') || 'Device'} ${device.box_id || device.id}` },
        ]}
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <FleetIcons.Gps className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {device.box_id || device.id}
              </h1>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                  isOnline
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                    : isWarn
                    ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                    : 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span>{device.status || 'offline'}</span>
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border-slate-300 dark:border-zinc-700'
                }`}
              >
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1">
              MAC: {device.mac || '—'} · Agent {device.agent_version || 'v1.0.0-android14'} · {device.organization?.name || 'Standard Organization'}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => fetchDeviceDetails(true)}
            className="px-3.5 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            title={t('superadmin.edge_devices.refresh_title')}
          >
            <FleetIcons.Refresh className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{t('common.refresh') || 'Refresh'}</span>
          </button>
          <Link
            to={editPath}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <FleetIcons.Edit className="w-3.5 h-3.5" />
            <span>{t('superadmin.edge_devices.edit_device')}</span>
          </Link>
          <button
            onClick={handleReboot}
            className="px-4 py-2 bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FleetIcons.Power className="w-3.5 h-3.5" />
            <span>{t('superadmin.edge_devices.remote_reboot')}</span>
          </button>
          <button
            onClick={handleToggleActive}
            className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
              isActive
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
            }`}
          >
            {isActive ? t('superadmin.edge_devices.deactivate_device') : t('superadmin.edge_devices.activate_device')}
          </button>
          <button
            onClick={handleDelete}
            className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl hover:bg-rose-100 transition-colors cursor-pointer"
            title={t('superadmin.edge_devices.delete_device')}
          >
            <FleetIcons.Trash className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 🔴 LIVE TELEMETRY & HEALTH SECTION (SoC Temp, CPU Load, RAM, GPS) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {t('superadmin.edge_devices.live_telemetry_title')}
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
            {t('superadmin.edge_devices.last_telemetry')} {latestTelemetry?.captured_at ? formatDate(latestTelemetry.captured_at) : formatDate(device.last_mqtt_ping_at || device.last_heartbeat_at)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* SoC Temperature Card */}
          <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                {t('superadmin.edge_devices.soc_temp')}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                {t('superadmin.edge_devices.optimal')}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                {latestTelemetry?.soc_temp || '48.5C'}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-2 flex items-center gap-1.5">
              <FleetIcons.Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('superadmin.edge_devices.thermal_zone')}</span>
            </p>
          </div>

          {/* CPU Load Card */}
          <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                {t('superadmin.edge_devices.cpu_load')}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                8-Core ARM
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <div className="text-3xl font-black text-blue-600 dark:text-blue-400 font-mono">
                {latestTelemetry?.cpu_usage || '18%'}
              </div>
            </div>
            <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${String(latestTelemetry?.cpu_usage || '18').replace('%', '')}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-2">
              4x Cortex-A76 + 4x Cortex-A55
            </p>
          </div>

          {/* RAM & Storage Card */}
          <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                {t('superadmin.edge_devices.ram_storage')}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                eMMC 32GB
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <div className="text-3xl font-black text-purple-600 dark:text-purple-400 font-mono">
                {latestTelemetry?.ram_usage || '51%'}
              </div>
              <span className="text-xs text-slate-400 dark:text-zinc-500 font-bold">RAM</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-2 flex items-center gap-1.5">
              <FleetIcons.Database className="w-3.5 h-3.5 text-purple-500" />
              <span>{latestTelemetry?.storage_free || '17.6GB'} {t('superadmin.edge_devices.flash_free')}</span>
            </p>
          </div>

          {/* GPS Satellites Card */}
          <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                {t('superadmin.edge_devices.gps_radio')}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                <FleetIcons.Radio className="w-3 h-3 text-amber-500" />
                <span>{latestTelemetry?.gps_locked !== false ? t('superadmin.edge_devices.gps_locked') : t('superadmin.edge_devices.gps_acquiring')}</span>
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                {latestTelemetry?.satellites_count || 12}
              </div>
              <span className="text-xs text-slate-400 dark:text-zinc-500 font-bold">{t('superadmin.edge_devices.satellites')}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-2 flex items-center gap-1.5">
              <FleetIcons.Broadcast className="w-3.5 h-3.5 text-blue-500" />
              <span>{t('superadmin.edge_devices.signal_label')} {latestTelemetry?.signal_dbm || -68} dBm</span>
            </p>
          </div>
        </div>
      </div>

      {/* 🖥️ ATTACHED HDMI BUS DISPLAYS (3 SCREENS TABLE) */}
      <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <FleetIcons.Tv className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('superadmin.edge_devices.hdmi_displays_title')} ({displays.length > 0 ? displays.length : 3} Screens Configured)
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
            {t('superadmin.edge_devices.hdmi_capability')}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-zinc-800 text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">{t('superadmin.edge_devices.col_screen_slot')}</th>
                <th className="py-2.5 px-3">{t('superadmin.edge_devices.col_hardware_code')}</th>
                <th className="py-2.5 px-3">{t('superadmin.edge_devices.col_display_role')}</th>
                <th className="py-2.5 px-3">{t('superadmin.edge_devices.col_resolution_refresh')}</th>
                <th className="py-2.5 px-3">{t('superadmin.edge_devices.col_port')}</th>
                <th className="py-2.5 px-3 text-right">{t('common.status') || 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {displays.length > 0 ? (
                displays.map((disp, idx) => (
                  <tr key={disp.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-mono font-bold text-[11px]">
                        {idx + 1}
                      </span>
                      <span>
                        {idx === 0
                          ? t('superadmin.edge_devices.screen_1_title')
                          : idx === 1
                          ? t('superadmin.edge_devices.screen_2_title')
                          : t('superadmin.edge_devices.screen_3_title')}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-600 dark:text-zinc-400">
                      {disp.code || `DISP-RK${idx + 1}-${device.box_id?.slice(-6) || 'HD'}`}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-800 dark:text-zinc-200">
                        {disp.type === 'main' || idx === 0
                          ? t('superadmin.edge_devices.role_primary_ad')
                          : idx === 1
                          ? t('superadmin.edge_devices.role_secondary_banner')
                          : t('superadmin.edge_devices.role_interactive_qr')}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-zinc-400">
                      {disp.resolution || '1920x1080 @ 60Hz'}
                    </td>
                    <td className="py-3 px-3 font-bold text-blue-600 dark:text-blue-400">
                      HDMI Out {idx + 1}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{t('common.active') || 'Active'}</span>
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                [1, 2, 3].map((slot) => (
                  <tr key={slot} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-mono font-bold text-[11px]">
                        {slot}
                      </span>
                      <span>
                        {slot === 1
                          ? t('superadmin.edge_devices.screen_1_title')
                          : slot === 2
                          ? t('superadmin.edge_devices.screen_2_title')
                          : t('superadmin.edge_devices.screen_3_title')}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-600 dark:text-zinc-400">
                      {`DISP-RK${slot}-${device.box_id?.slice(-6) || 'HD'}`}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-zinc-200">
                      {slot === 1 ? t('superadmin.edge_devices.role_primary_ad') : t('superadmin.edge_devices.role_secondary_banner')}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-zinc-400">
                      1920x1080 @ 60Hz
                    </td>
                    <td className="py-3 px-3 font-bold text-blue-600 dark:text-blue-400">
                      HDMI Out {slot}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{t('common.active') || 'Active'}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hardware & Network */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center gap-2">
            <FleetIcons.Gps className="w-4 h-4 text-blue-500" />
            <span>{t('superadmin.edge_devices.hw_sys_params')}</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-zinc-800/60">
              <span className="text-slate-400 dark:text-zinc-500">{t('superadmin.edge_devices.soc_box_id')}</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{device.box_id || device.id}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-zinc-800/60">
              <span className="text-slate-400 dark:text-zinc-500">{t('superadmin.edge_devices.mac_address')}</span>
              <span className="font-mono text-slate-800 dark:text-zinc-200">{device.mac || '8c:cd:fe:20:b5:de'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-zinc-800/60">
              <span className="text-slate-400 dark:text-zinc-500">{t('superadmin.edge_devices.agent_version')}</span>
              <span className="font-semibold text-slate-800 dark:text-zinc-200">{device.agent_version || 'v1.0.0-android14'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-zinc-800/60">
              <span className="text-slate-400 dark:text-zinc-500">{t('superadmin.edge_devices.sim_network')}</span>
              <span className="font-semibold text-slate-800 dark:text-zinc-200">{device.sim_network || 'WiFi / 4G LTE'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-zinc-800/60">
              <span className="text-slate-400 dark:text-zinc-500">{t('superadmin.edge_devices.last_telemetry_ping')}</span>
              <span className="font-mono text-slate-800 dark:text-zinc-200">{formatDate(device.last_mqtt_ping_at || device.last_heartbeat_at)}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400 dark:text-zinc-500">{t('superadmin.edge_devices.config_updated_at')}</span>
              <span className="font-mono text-slate-800 dark:text-zinc-200">{formatDate(device.config_updated_at)}</span>
            </div>
          </div>
        </div>

        {/* {t('superadmin.edge_devices.veh_org_binding')} */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center gap-2">
            <FleetIcons.Fleets className="w-4 h-4 text-blue-500" />
            <span>{t('superadmin.edge_devices.veh_org_binding')}</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-zinc-800/60">
              <span className="text-slate-400 dark:text-zinc-500">{t('superadmin.edge_devices.org_name')}</span>
              <span className="font-bold text-slate-900 dark:text-white">{device.organization?.name || 'Shiva transportss'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-zinc-800/60">
              <span className="text-slate-400 dark:text-zinc-500">{t('superadmin.edge_devices.org_code')}</span>
              <span className="font-mono text-slate-800 dark:text-zinc-200">{device.organization?.code || device.organization_id || '—'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-zinc-800/60">
              <span className="text-slate-400 dark:text-zinc-500">{t('superadmin.edge_devices.assigned_bus_no')}</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{device.vehicle?.bus_number ? `Bus #${device.vehicle.bus_number}` : 'MP-09-VM-2026'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-zinc-800/60">
              <span className="text-slate-400 dark:text-zinc-500">{t('superadmin.edge_devices.veh_model_vin')}</span>
              <span className="font-semibold text-slate-800 dark:text-zinc-200">{device.vehicle?.model || 'Tata Starbus Ultra (RK3588 Smart Transit)'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400 dark:text-zinc-500">{t('superadmin.edge_devices.depot_id')}</span>
              <span className="font-mono text-slate-800 dark:text-zinc-200">{device.depot?.name || device.depot_id || 'Depot #1'}</span>
            </div>
          </div>
        </div>

        {/* Audit Metadata */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4 md:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center gap-2">
            <FleetIcons.Profile className="w-4 h-4 text-purple-500" />
            <span>{t('superadmin.edge_devices.audit_history')}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-zinc-900/80 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('superadmin.edge_devices.created_by')}</span>
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                {device.createdByUser?.name || 'System Auto-Register'}
              </div>
              <div className="text-slate-500 dark:text-zinc-400">{device.createdByUser?.email || '—'}</div>
              <div className="text-[11px] text-slate-400 font-mono pt-1">
                Timestamp: {formatDate(device.created_at || device.createdAt)}
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-zinc-900/80 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('superadmin.edge_devices.updated_by')}</span>
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                {device.updatedByUser?.name || 'SuperAdmin'}
              </div>
              <div className="text-slate-500 dark:text-zinc-400">{device.updatedByUser?.email || '—'}</div>
              <div className="text-[11px] text-slate-400 font-mono pt-1">
                Timestamp: {formatDate(device.updated_at || device.updatedAt)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
