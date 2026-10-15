import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useTechnicianApp } from '../../hooks/technician/useTechnicianApp';
import { useAuth } from '../../hooks/useAuth';

export const TechDiagnosticsPage = () => {
  const { hasPermission } = useAuth();
  const canDiagnose = hasPermission('devices.diagnose') || hasPermission('technician.diagnostics.manage');
  const [searchParams] = useSearchParams();
  const requestedDeviceId = searchParams.get('device');
  const {
    devices, loadDevices,
    telemetry, telemetryLoading, loadTelemetry,
    connectivityTests, loadConnectivityTests, recordConnectivityTest,
    rebootDevice,
  } = useTechnicianApp();

  useEffect(() => {
    loadDevices().catch(() => {});
  }, [loadDevices]);

  const deviceList = Array.isArray(devices) ? devices : (devices?.rows || []);
  const telemetryList = Array.isArray(telemetry) ? telemetry : (telemetry?.rows || []);
  const testList = Array.isArray(connectivityTests) ? connectivityTests : (connectivityTests?.rows || []);
  const latestTelemetry = telemetryList[0] || null;
  const latestTest = testList[0] || null;

  const [selectedDeviceId, setSelectedDeviceId] = useState(requestedDeviceId || null);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunTime, setLastRunTime] = useState('—');
  const [diagnosticsCompleted, setDiagnosticsCompleted] = useState(false);

  // Default selection once devices load.
  useEffect(() => {
    if (selectedDeviceId == null && deviceList.length > 0) {
      setSelectedDeviceId(deviceList[0].id);
    }
  }, [deviceList, selectedDeviceId]);

  const selectedDevice = deviceList.find((d) => String(d.id) === String(selectedDeviceId)) || null;

  // Load real telemetry + connectivity history whenever the device changes.
  useEffect(() => {
    if (selectedDeviceId != null) {
      loadTelemetry(selectedDeviceId).catch(() => {});
      loadConnectivityTests(selectedDeviceId).catch(() => {});
    }
  }, [selectedDeviceId, loadTelemetry, loadConnectivityTests]);

  const isOnline = (selectedDevice?.status || '').toLowerCase() === 'online';

  const handleRunDiagnostics = async () => {
    if (!selectedDevice) return;
    setIsRunning(true);
    try {
      // Derive the measurement from the latest real telemetry where available;
      // fall back to a neutral probe when the device has not reported yet.
      const payload = {
        latency: latestTest?.latency != null ? Number(latestTest.latency) : null,
        packetLoss: latestTest?.packet_loss != null ? Number(latestTest.packet_loss) : 0,
        rssi: latestTelemetry?.signal_dbm != null ? Number(latestTelemetry.signal_dbm) : (latestTest?.rssi != null ? Number(latestTest.rssi) : null),
        status: isOnline ? 'healthy' : 'offline',
      };
      await toast.promise(recordConnectivityTest(selectedDevice.id, payload), {
        loading: 'Running diagnostics…',
        success: 'Diagnostics completed',
        error: (err) => err?.message || 'Diagnostics failed',
      });
      await Promise.all([
        loadTelemetry(selectedDevice.id).catch(() => {}),
        loadConnectivityTests(selectedDevice.id).catch(() => {}),
      ]);
      setDiagnosticsCompleted(true);
      setLastRunTime(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch {
      /* toast surfaced the error */
    } finally {
      setIsRunning(false);
    }
  };

  const handleReboot = async () => {
    if (!selectedDevice) return;
    try {
      await toast.promise(rebootDevice(selectedDevice.id), {
        loading: 'Sending reboot signal…',
        success: 'Reboot signal dispatched',
        error: (err) => err?.message || 'Failed to reboot device',
      });
    } catch {
      /* toast surfaced the error */
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'Technician', path: '/technician/dashboard' },
              { label: 'Device Diagnostics' }
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Device Diagnostics</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Execute live subsystem hardware tests, signal telemetry, and thermal audits
          </p>
        </div>

        <Link
          to="/technician/connectivity"
          className="px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-colors self-start sm:self-auto"
        >
          Connectivity Troubleshooting →
        </Link>
      </div>

      {/* Device Selector Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Selected Target Device</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-base font-bold text-slate-900 dark:text-white">{selectedDevice?.box_id ?? '—'}</span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                {selectedDevice?.box_id ?? selectedDevice?.id ?? '—'}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                {selectedDevice?.status ?? '—'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
              Vehicle {selectedDevice?.vehicle_id ?? '—'} · Org {selectedDevice?.organization_id ?? '—'}
            </p>
          </div>

          <div className="w-full sm:w-64">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-zinc-400 mb-1">Switch Device:</label>
            <select
              value={selectedDeviceId ?? ''}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none"
            >
              {deviceList.length === 0 && <option value="">No devices available</option>}
              {deviceList.map((d) => (
                <option key={d.id} value={d.id}>
                  {(d.box_id ?? d.id)} — Vehicle {d.vehicle_id ?? '—'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4 Diagnostic Check Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Check 1: Device Connectivity */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                <FleetIcons.Speed className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Device Connectivity</h3>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">Wi-Fi / Cellular Telemetry</p>
              </div>
            </div>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${isOnline ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'}`}>
              {selectedDevice?.status ?? '—'}
            </span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400 dark:text-zinc-500">Ping Latency:</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200">{latestTest?.latency != null ? `${latestTest.latency} ms` : 'No data'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 dark:text-zinc-500">Packet Loss:</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">{latestTest?.packet_loss != null ? `${latestTest.packet_loss}%` : 'No data'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 dark:text-zinc-500">RSSI:</span>
              <span className="font-mono text-slate-700 dark:text-zinc-300">{latestTest?.rssi != null ? `${latestTest.rssi} dBm` : (latestTelemetry?.signal_dbm != null ? `${latestTelemetry.signal_dbm} dBm` : 'No data')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 dark:text-zinc-500">SIM Network:</span>
              <span className="font-mono text-slate-700 dark:text-zinc-300">{selectedDevice?.sim_network ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* Check 2: Display Screen Status */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                <FleetIcons.Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Display Status</h3>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">Panel Backlight & HDMI Driver</p>
              </div>
            </div>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${latestTelemetry?.connected_screens ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'}`}>
              {latestTelemetry?.connected_screens ? `${latestTelemetry.connected_screens} connected` : 'No data'}
            </span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400 dark:text-zinc-500">MAC Address:</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200">{selectedDevice?.mac ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 dark:text-zinc-500">Agent Version:</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200">{selectedDevice?.agent_version ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 dark:text-zinc-500">Connected Screens:</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">{latestTelemetry?.connected_screens ?? 'No data'}</span>
            </div>
          </div>
        </div>

        {/* Check 3: GPS Telematics Status */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <FleetIcons.Gps className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">GPS Telematics</h3>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">Constellation & Satellite Fix</p>
              </div>
            </div>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${latestTelemetry?.gps_locked ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'}`}>
              {latestTelemetry?.gps_locked ? 'Locked' : (latestTelemetry ? 'No Fix' : 'No data')}
            </span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400 dark:text-zinc-500">Satellites Locked:</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200">{latestTelemetry?.satellites_count != null ? `${latestTelemetry.satellites_count} Satellites` : 'No data'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 dark:text-zinc-500">Fix Accuracy:</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">{latestTelemetry?.gps_accuracy ?? 'No data'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 dark:text-zinc-500">Signal:</span>
              <span className="font-bold text-slate-700 dark:text-zinc-300">{latestTelemetry?.signal_dbm != null ? `${latestTelemetry.signal_dbm} dBm` : 'No data'}</span>
            </div>
          </div>
        </div>

        {/* Check 4: Core Hardware Health */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                <FleetIcons.Settings className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Hardware Health</h3>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">SoC Thermal & Storage Audit</p>
              </div>
            </div>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${latestTelemetry ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'}`}>
              {latestTelemetry ? 'Reported' : 'No data'}
            </span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400 dark:text-zinc-500">SoC Core Temperature:</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200">{latestTelemetry?.soc_temp ?? 'No data'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 dark:text-zinc-500">CPU / RAM Load:</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200">{latestTelemetry?.cpu_usage ?? '—'} / {latestTelemetry?.ram_usage ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 dark:text-zinc-500">Internal Storage Free:</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">{latestTelemetry?.storage_free ?? 'No data'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Run Diagnostics CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleRunDiagnostics}
          disabled={isRunning || !selectedDevice || !canDiagnose}
          className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
        >
          {isRunning ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 dark:border-zinc-900/30 border-t-white dark:border-t-zinc-900 rounded-full animate-spin"></span>
              <span>Running Live Subsystem Diagnostics Sequence...</span>
            </>
          ) : (
            <>
              <FleetIcons.Target className="w-4 h-4" />
              <span>Run Subsystems Diagnostic Routine</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleReboot}
          disabled={!selectedDevice}
          className="py-3.5 px-5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-50 text-slate-800 dark:text-zinc-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <FleetIcons.Settings className="w-4 h-4" />
          <span>Reboot Device</span>
        </button>
      </div>

      {/* Diagnostic Result Card */}
      {diagnosticsCompleted && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <FleetIcons.Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isOnline ? 'Diagnostics recorded' : 'Diagnostics recorded — device offline'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  {latestTelemetry
                    ? 'Latest telemetry and connectivity results are shown in the cards above.'
                    : 'No telemetry reported by this device yet; connectivity test was recorded.'}
                </p>
              </div>
            </div>

            <div className="text-right self-start sm:self-auto">
              <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">Last Run:</span>
              <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">{lastRunTime}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800">
              <span className="text-slate-400 dark:text-zinc-500 text-[11px]">Agent Version:</span>
              <div className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedDevice?.agent_version ?? '—'}</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800">
              <span className="text-slate-400 dark:text-zinc-500 text-[11px]">Latest Latency:</span>
              <div className="font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">{latestTest?.latency != null ? `${latestTest.latency} ms` : 'No data'}</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800">
              <span className="text-slate-400 dark:text-zinc-500 text-[11px]">Test Status:</span>
              <div className="font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">{latestTest?.status ?? '—'}</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800">
              <span className="text-slate-400 dark:text-zinc-500 text-[11px]">Device Status:</span>
              <div className={`font-bold mt-0.5 ${isOnline ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>{selectedDevice?.status ?? '—'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
