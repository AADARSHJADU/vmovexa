import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useTechnicianApp } from '../../hooks/technician/useTechnicianApp';

export const TechConnectivityPage = () => {
  const { t } = useTranslation();
  const isSuperAdmin = window.location.pathname.startsWith('/superadmin');
  const basePath = isSuperAdmin ? '/superadmin/technician' : '/technician';
  const [searchParams] = useSearchParams();
  const requestedDeviceId = searchParams.get('device');
  const { devices, connectivityTests, loadDevices, loadConnectivityTests, recordConnectivityTest, telemetry, loadTelemetry, rebootDevice } = useTechnicianApp();

  useEffect(() => {
    loadDevices().catch(() => {});
  }, [loadDevices]);

  const deviceList = useMemo(() => (Array.isArray(devices) ? devices : (devices?.rows || [])), [devices]);
  const testList = useMemo(() => (Array.isArray(connectivityTests) ? connectivityTests : (connectivityTests?.rows || [])), [connectivityTests]);

  const [selectedDeviceId, setSelectedDeviceId] = useState(requestedDeviceId || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Default selection once devices load.
  useEffect(() => {
    if (selectedDeviceId == null && deviceList.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedDeviceId(deviceList[0].id);
    }
  }, [deviceList, selectedDeviceId]);

  // Load connectivity tests + telemetry whenever the selected device changes.
  useEffect(() => {
    if (selectedDeviceId != null) {
      loadConnectivityTests(selectedDeviceId).catch(() => {});
      loadTelemetry(selectedDeviceId).catch(() => {});
    }
  }, [selectedDeviceId, loadConnectivityTests, loadTelemetry]);

  const selectedDevice = deviceList.find((d) => String(d.id) === String(selectedDeviceId)) || null;
  const latestTest = testList[0] ?? null;
  const telemetryList = Array.isArray(telemetry) ? telemetry : (telemetry?.rows || []);
  const latestTelemetry = telemetryList[0] ?? null;
  const isOnline = (selectedDevice?.status || '').toLowerCase() === 'online';

  const handleTestConnection = async () => {
    if (!selectedDevice) return;
    setIsTesting(true);
    try {
      const payload = {
        latency: latestTest?.latency != null ? Number(latestTest.latency) : null,
        packetLoss: latestTest?.packet_loss != null ? Number(latestTest.packet_loss) : 0,
        rssi: latestTelemetry?.signal_dbm != null ? Number(latestTelemetry.signal_dbm) : (latestTest?.rssi != null ? Number(latestTest.rssi) : null),
        status: isOnline ? 'healthy' : 'offline',
      };
      await toast.promise(recordConnectivityTest(selectedDevice.id, payload), {
        loading: 'Running connectivity test…',
        success: 'Connectivity test recorded',
        error: (err) => err?.message || 'Failed to run test',
      });
      await loadConnectivityTests(selectedDevice.id).catch(() => {});
      await loadTelemetry(selectedDevice.id).catch(() => {});
    } catch {
      /* toast surfaced the error */
    } finally {
      setIsTesting(false);
    }
  };

  const handleReconnect = async () => {
    if (!selectedDevice) return;
    setIsReconnecting(true);
    try {
      // A remote reconnect is dispatched as a device reboot command over MQTT,
      // which cycles the network interface on the edge box.
      await toast.promise(rebootDevice(selectedDevice.id), {
        loading: 'Dispatching network reconnect…',
        success: 'Reconnect command dispatched',
        error: (err) => err?.message || 'Failed to dispatch reconnect',
      });
      await loadConnectivityTests(selectedDevice.id).catch(() => {});
    } catch {
      /* toast surfaced the error */
    } finally {
      setIsReconnecting(false);
    }
  };

  const filteredDevicesList = deviceList.filter(
    (d) =>
      String(d.id ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(d.box_id ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(d.vehicle_id ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: isSuperAdmin ? 'Super Admin' : 'Technician', path: isSuperAdmin ? '/superadmin/dashboard' : '/technician/dashboard' },
              ...(isSuperAdmin ? [{ label: 'Technician', path: `${basePath}/connectivity` }] : []),
              { label: 'Connectivity Troubleshooting' }
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('technician.connectivity.title')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Isolate network drops, ping latency issues, and perform remote network hardware reconnects
          </p>
        </div>

        <Link
          to={`${basePath}/diagnostics`}
          className="px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-colors self-start sm:self-auto"
        >
          Run Full Diagnostics →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Device Selector Sidebar */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">{t('technician.connectivity.select_target_step')}</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{t('technician.connectivity.select_target_desc')}</p>
          </div>

          <div className="relative">
            <FleetIcons.Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('technician.connectivity.filter_ph')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2 max-h-[480px] overflow-y-auto no-scrollbar">
            {filteredDevicesList.length === 0 && (
              <div className="py-6 text-center text-xs text-slate-400 dark:text-zinc-500 font-medium">{t('technician.connectivity.no_devices')}</div>
            )}
            {filteredDevicesList.map((d) => {
              const isSelected = String(d.id) === String(selectedDeviceId);
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDeviceId(d.id)}
                  className={`w-full p-3 rounded-xl text-left transition-all border ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900 border-slate-900 dark:border-white shadow-sm'
                      : 'bg-slate-50/70 dark:bg-zinc-800/60 border-slate-100 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold ${isSelected ? 'text-blue-300 dark:text-blue-600' : 'text-blue-700 dark:text-blue-400'}`}>
                      {d.box_id ?? d.id ?? '—'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded-md ${
                        isSelected
                          ? 'bg-white/20 dark:bg-zinc-900/10 text-white dark:text-zinc-900'
                          : (d.status || '').toLowerCase() === 'online'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                      }`}
                    >
                      {d.status ?? '—'}
                    </span>
                  </div>
                  <div className="text-xs font-bold mt-1 truncate">{d.box_id ?? '—'}</div>
                  <div className={`text-[11px] mt-0.5 truncate ${isSelected ? 'text-slate-300 dark:text-zinc-600' : 'text-slate-500 dark:text-zinc-400'}`}>
                    Vehicle {d.vehicle_id ?? '—'} · Org {d.organization_id ?? '—'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Connection Checks & Troubleshooting Controls */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedDevice ? (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('technician.connectivity.select_device_title')}</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1">{t('technician.connectivity.select_device_desc')}</p>
          </div>
          ) : (
          <>
          {/* Target Info Banner */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">{selectedDevice.box_id ?? '—'}</h2>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-md">
                  {selectedDevice.box_id ?? selectedDevice.id ?? '—'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1">
                Vehicle {selectedDevice.vehicle_id ?? '—'} (Org {selectedDevice.organization_id ?? '—'}) · MAC: {selectedDevice.mac ?? '—'}
              </p>
            </div>

            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                (selectedDevice.status || '').toLowerCase() === 'online'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
              }`}
            >
              ● {selectedDevice.status ?? '—'}
            </span>
          </div>

          {/* 4 Connection Checks Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('technician.connectivity.device_connectivity')}</span>
                <span className={`text-xs font-bold flex items-center gap-1 ${isOnline ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                  <span>{isOnline ? '✓' : '✕'}</span> {selectedDevice.status ?? '—'}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {selectedDevice.last_heartbeat_at ? 'Heartbeat received' : 'No heartbeat yet'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                Last heartbeat: {selectedDevice.last_heartbeat_at ? new Date(selectedDevice.last_heartbeat_at).toLocaleString() : '—'}
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('technician.connectivity.network_status')}</span>
                <span className={`text-xs font-bold flex items-center gap-1 ${isOnline ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                  <span>{isOnline ? '✓' : '✕'}</span> {isOnline ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">{selectedDevice.sim_network ?? '—'}</div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Agent: {selectedDevice.agent_version ?? '—'}</div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('technician.connectivity.gps_connection')}</span>
                <span className={`text-xs font-bold flex items-center gap-1 ${latestTelemetry?.gps_locked ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-zinc-400'}`}>
                  <span>{latestTelemetry?.gps_locked ? '✓' : '•'}</span> {latestTelemetry?.gps_locked ? 'Locked' : (latestTelemetry ? 'No Fix' : 'No data')}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {latestTelemetry?.satellites_count != null ? `${latestTelemetry.satellites_count} satellites` : 'No telemetry'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Accuracy: {latestTelemetry?.gps_accuracy ?? '—'}</div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('technician.connectivity.last_test')}</span>
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400">{latestTest?.status ?? '—'}</span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {latestTest?.tested_at ? new Date(latestTest.tested_at).toLocaleString() : (latestTest?.created_at ? new Date(latestTest.created_at).toLocaleString() : 'No tests yet')}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                {latestTest?.latency != null ? `${latestTest.latency} ms · ${latestTest.packet_loss ?? 0}% loss` : '—'}
              </div>
            </div>
          </div>

          {/* Troubleshooting Action Buttons */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">{t('technician.connectivity.troubleshooting_actions')}</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">{t('technician.connectivity.actions_desc')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="py-3 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {isTesting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 dark:border-zinc-900/30 border-t-white dark:border-t-zinc-900 rounded-full animate-spin"></span>
                    <span>{t('technician.connectivity.pinging_host')}</span>
                  </>
                ) : (
                  <>
                    <FleetIcons.Speed className="w-4 h-4" />
                    <span>{t('technician.connectivity.test_latency')}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReconnect}
                disabled={isReconnecting}
                className="py-3 px-4 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-50 text-slate-800 dark:text-zinc-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isReconnecting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-800/30 dark:border-zinc-400/30 border-t-slate-800 dark:border-t-zinc-400 rounded-full animate-spin"></span>
                    <span>{t('technician.connectivity.cycling_modem')}</span>
                  </>
                ) : (
                  <>
                    <FleetIcons.Settings className="w-4 h-4" />
                    <span>{t('technician.connectivity.force_reconnect')}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Resolution Result Card */}
          {latestTest ? (
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold text-sm">
                <FleetIcons.Check className="w-4 h-4" />
                <span>{t('technician.connectivity.latest_test')}</span>
              </div>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                Ping latency is{' '}
                <span className="font-bold">{latestTest.latency ?? '—'} ms</span> with{' '}
                <span className="font-bold">{latestTest.packet_loss ?? latestTest.packetLoss ?? '—'}%</span> packet loss. RSSI{' '}
                <span className="font-bold">{latestTest.rssi ?? '—'} dBm</span> · Status {latestTest.status ?? '—'}.
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 text-xs text-slate-400 dark:text-zinc-500 font-medium text-center">
              No connectivity tests recorded yet for this device.
            </div>
          )}
          </>
          )}
        </div>
      </div>
    </div>
  );
};
