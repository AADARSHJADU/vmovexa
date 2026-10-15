import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useTechnicianApp } from '../../hooks/technician/useTechnicianApp';

export const TechHardwareConfigPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { devices, edgeConfig, edgeConfigMeta, edgeConfigLoading, loadDevices, loadEdgeConfig, pushConfig, factoryReset, rebootDevice } = useTechnicianApp();

  useEffect(() => {
    loadDevices().catch(() => {});
  }, [loadDevices]);

  const deviceList = Array.isArray(devices) ? devices : (devices?.rows || []);
  const [selectedDeviceId, setSelectedDeviceId] = useState(id || null);

  useEffect(() => {
    if (id) {
      setSelectedDeviceId(id);
    } else if (deviceList.length > 0 && !selectedDeviceId) {
      setSelectedDeviceId(deviceList[0].id);
    }
  }, [id, deviceList, selectedDeviceId]);

  const device = deviceList.find((d) => String(d.id) === String(selectedDeviceId || id)) || (deviceList.length > 0 ? deviceList[0] : null);

  const [activeTab, setActiveTab] = useState('device'); // 'device' | 'network' | 'system'

  // Settings State — hydrated from the backend's last-applied config.
  const EMPTY_CONFIG = {
    brightness: 80,
    screenTimeout: 'Never',
    autoBrightness: true,
    displayMode: 'Full Screen',
    screenOrientation: 'Landscape',
    audioVolume: 70,
    isMuted: false,
    audioSource: 'Internal Speaker',
    powerMode: 'Normal Operational Mode',
    autoPowerOn: '06:00 AM',
    autoPowerOff: '11:00 PM',
    networkType: 'Wi-Fi',
    ssid: '',
    ipAddress: '',
    peerProxy: false,
    proxyType: 'HTTP',
    proxyHost: '',
    proxyPort: '',
    autoTime: true,
  };
  const [config, setConfig] = useState(EMPTY_CONFIG);

  const [showResetModal, setShowResetModal] = useState(false);

  // Fetch the real last-applied config when the active device changes.
  const activeDeviceId = device?.id;
  useEffect(() => {
    if (activeDeviceId != null) {
      loadEdgeConfig(activeDeviceId).catch(() => {});
    }
  }, [activeDeviceId, loadEdgeConfig]);

  // Hydrate the local form whenever the backend config arrives.
  useEffect(() => {
    if (edgeConfig && typeof edgeConfig === 'object') {
      setConfig({ ...EMPTY_CONFIG, ...edgeConfig });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edgeConfig]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!device) return;
    try {
      await toast.promise(pushConfig(device.id, config), {
        loading: 'Pushing configuration…',
        success: 'Configuration pushed',
        error: (err) => err?.message || 'Failed to push config',
      });
      await loadDevices().catch(() => {});
      navigate(`/technician/devices/${device.id}/config/saved`, {
        state: {
          device,
          updatedFieldsCount: Object.keys(config).length,
          version: device.agent_version || 'latest',
        },
      });
    } catch {
      /* toast surfaced the error */
    }
  };

  const handleReboot = async () => {
    if (!device) return;
    try {
      await toast.promise(rebootDevice(device.id), {
        loading: 'Sending reboot signal…',
        success: 'Reboot signal dispatched',
        error: (err) => err?.message || 'Failed to reboot device',
      });
    } catch {
      /* toast surfaced the error */
    }
  };

  if (!device) {
    return (
      <div className="w-full py-20 text-center animate-in fade-in duration-200">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <FleetIcons.Settings className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900">Device not found or still loading…</h3>
        <p className="text-xs text-slate-500 font-medium mt-1">
          The requested device could not be located.
        </p>
        <Link
          to="/technician/devices"
          className="inline-block mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
        >
          ← Back to Devices
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
              { label: 'Technician', path: '/technician/dashboard' },
              { label: 'Display Devices', path: '/technician/devices' },
              { label: 'Hardware Configuration' }
            ]}
            className="mb-2"
          />
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Hardware Configuration</h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              {device.box_id ?? device.id ?? '—'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
            {device.box_id ?? '—'} · Vehicle {device.vehicle_id ?? '—'} (Org {device.organization_id ?? '—'})
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-start sm:self-auto">
          {deviceList.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">Switch Device:</span>
              <select
                value={device?.id ?? ''}
                onChange={(e) => {
                  setSelectedDeviceId(e.target.value);
                  navigate(`/technician/devices/${e.target.value}/config`);
                }}
                className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 shadow-sm focus:outline-none"
              >
                {deviceList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.box_id ?? d.id} (Vehicle {d.vehicle_id ?? '—'})
                  </option>
                ))}
              </select>
            </div>
          )}
          {(() => {
            const st = (device.status || '').toLowerCase();
            const online = st === 'online';
            return (
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border ${online ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : st === 'warning' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'}`}>
                <span className={`w-2 h-2 rounded-full ${online ? 'bg-emerald-500 animate-pulse' : st === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                <span>{device.status ?? 'offline'}{online ? ' · Configurable' : ''}</span>
              </span>
            );
          })()}
        </div>
      </div>

      {/* 3 Sub-tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'device', label: 'Device Settings', icon: <FleetIcons.Settings className="w-4 h-4" /> },
          { id: 'network', label: 'Network Settings', icon: <FleetIcons.Speed className="w-4 h-4" /> },
          { id: 'system', label: 'System & Firmware', icon: <FleetIcons.Layers className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: DEVICE SETTINGS */}
      {activeTab === 'device' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Display Settings Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Display Settings</h2>
              <p className="text-xs text-slate-500 font-medium">Control screen illumination, screen timeouts, and display aspect</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Screen Brightness</label>
                  <span className="text-xs font-mono font-bold text-slate-900">{config.brightness}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={config.brightness}
                  onChange={(e) => setConfig({ ...config, brightness: Number(e.target.value) })}
                  className="w-full accent-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Screen Timeout</label>
                <select
                  value={config.screenTimeout}
                  onChange={(e) => setConfig({ ...config, screenTimeout: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-slate-300 focus:outline-none"
                >
                  <option value="5 Minutes">5 Minutes</option>
                  <option value="15 Minutes">15 Minutes</option>
                  <option value="30 Minutes">30 Minutes</option>
                  <option value="Never">Never (Always On During Route)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Display Mode</label>
                <select
                  value={config.displayMode}
                  onChange={(e) => setConfig({ ...config, displayMode: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-slate-300 focus:outline-none"
                >
                  <option value="Full Screen">Full Screen (16:9 Standard)</option>
                  <option value="Split Screen">Split Screen (70% Ad / 30% Transit Info)</option>
                  <option value="Picture-in-Picture">Picture-in-Picture Mode</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Screen Orientation</label>
                <select
                  value={config.screenOrientation}
                  onChange={(e) => setConfig({ ...config, screenOrientation: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-slate-300 focus:outline-none"
                >
                  <option value="Landscape">Landscape (0° Standard)</option>
                  <option value="Landscape Flipped">Landscape Flipped (180° Inverted)</option>
                  <option value="Portrait">Portrait (90° Vertical)</option>
                </select>
              </div>

              <div className="sm:col-span-2 flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <div className="text-xs font-bold text-slate-900">Auto Ambient Light Sensor</div>
                  <div className="text-[11px] text-slate-500 font-medium">Dynamically adjust illumination for sunny mornings & tunnel transits</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.autoBrightness}
                  onChange={(e) => setConfig({ ...config, autoBrightness: e.target.checked })}
                  className="w-4 h-4 accent-slate-900 rounded"
                />
              </div>
            </div>
          </div>

          {/* Audio Settings Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Audio & Sound Settings</h2>
              <p className="text-xs text-slate-500 font-medium">Configure speaker output, volume decibel limits, and mute schedules</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Volume Level</label>
                  <span className="text-xs font-mono font-bold text-slate-900">{config.isMuted ? 'Muted' : `${config.audioVolume}%`}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  disabled={config.isMuted}
                  value={config.isMuted ? 0 : config.audioVolume}
                  onChange={(e) => setConfig({ ...config, audioVolume: Number(e.target.value) })}
                  className="w-full accent-slate-900 disabled:opacity-40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Audio Output Source</label>
                <select
                  value={config.audioSource}
                  onChange={(e) => setConfig({ ...config, audioSource: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-slate-300 focus:outline-none"
                >
                  <option value="Internal Speaker">Internal Speaker (Dual 5W Front)</option>
                  <option value="Vehicle PA System">Vehicle PA Amplifier Line Out</option>
                  <option value="Bluetooth Audio DAC">Bluetooth Audio DAC Transmitter</option>
                </select>
              </div>

              <div className="sm:col-span-2 flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <div className="text-xs font-bold text-slate-900">Master Hardware Mute</div>
                  <div className="text-[11px] text-slate-500 font-medium">Completely mute all video sound tracks and keep visual captions only</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.isMuted}
                  onChange={(e) => setConfig({ ...config, isMuted: e.target.checked })}
                  className="w-4 h-4 accent-slate-900 rounded"
                />
              </div>
            </div>
          </div>

          {/* Power Settings Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Power Management</h2>
              <p className="text-xs text-slate-500 font-medium">Automatic operating schedules and low battery voltage protections</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Power Profile Mode</label>
                <select
                  value={config.powerMode}
                  onChange={(e) => setConfig({ ...config, powerMode: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-slate-300 focus:outline-none"
                >
                  <option value="Normal Operational Mode">Normal Operational Mode</option>
                  <option value="Eco Battery Saver">Eco Battery Saver (Dimmed)</option>
                  <option value="Aggressive Low Power">Aggressive Low Power (Ignition-Triggered)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Auto Power On</label>
                  <input
                    type="text"
                    value={config.autoPowerOn}
                    onChange={(e) => setConfig({ ...config, autoPowerOn: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Auto Power Off</label>
                  <input
                    type="text"
                    value={config.autoPowerOff}
                    onChange={(e) => setConfig({ ...config, autoPowerOff: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NETWORK SETTINGS */}
      {activeTab === 'network' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Network Status Live Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Current Network Status</h2>
                <p className="text-xs text-slate-500 font-medium">Real-time connection telemetry and IP addressing</p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${(device.status || '').toLowerCase() === 'online' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                {(device.status || '').toLowerCase() === 'online' ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 text-[11px]">Connection Type:</span>
                <div className="font-bold text-slate-900 mt-0.5">{config.networkType}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">SSID Network:</span>
                <div className="font-bold text-slate-900 mt-0.5">{config.ssid}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Local IP Address:</span>
                <div className="font-bold text-blue-700 font-mono mt-0.5">{config.ipAddress}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">SIM Network:</span>
                <div className="font-bold text-emerald-700 mt-0.5">{device.sim_network ?? '—'}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Network Interface *</label>
                <select
                  value={config.networkType}
                  onChange={(e) => setConfig({ ...config, networkType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-slate-300 focus:outline-none"
                >
                  <option value="Wi-Fi">Wi-Fi (802.11ac 5GHz Depot AP)</option>
                  <option value="LTE 4G Cellular">LTE 4G Cellular (M2M APN)</option>
                  <option value="Ethernet LAN">Ethernet RJ45 Bus Bridge</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Wi-Fi SSID</label>
                <input
                  type="text"
                  value={config.ssid}
                  onChange={(e) => setConfig({ ...config, ssid: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-slate-300 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Privacy & Enterprise Proxy Settings */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Privacy & Enterprise Proxy</h2>
              <p className="text-xs text-slate-500 font-medium">Route media downloads and telemetry through corporate proxies</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <div className="text-xs font-bold text-slate-900">Enable Corporate Peer Proxy</div>
                  <div className="text-[11px] text-slate-500 font-medium">Use encrypted transit VPN tunnels for all outbound requests</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.peerProxy}
                  onChange={(e) => setConfig({ ...config, peerProxy: e.target.checked })}
                  className="w-4 h-4 accent-slate-900 rounded"
                />
              </div>

              {config.peerProxy && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Proxy Protocol</label>
                    <select
                      value={config.proxyType}
                      onChange={(e) => setConfig({ ...config, proxyType: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                    >
                      <option value="HTTP">HTTP Proxy</option>
                      <option value="HTTPS">HTTPS / SSL Proxy</option>
                      <option value="SOCKS5">SOCKS5 Secure Tunnel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Proxy Host</label>
                    <input
                      type="text"
                      value={config.proxyHost}
                      onChange={(e) => setConfig({ ...config, proxyHost: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Port</label>
                    <input
                      type="text"
                      value={config.proxyPort}
                      onChange={(e) => setConfig({ ...config, proxyPort: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM SETTINGS */}
      {activeTab === 'system' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Device Telemetry Specs */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Device Hardware Information</h2>
              <p className="text-xs text-slate-500 font-medium">Cryptographic identifiers and ledger serial keys</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[11px]">MAC Address:</span>
                <div className="font-mono font-bold text-slate-900 mt-1 break-all">{device.mac ?? '—'}</div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[11px]">Box ID:</span>
                <div className="font-bold text-slate-900 mt-1">{device.box_id ?? '—'}</div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[11px]">Status:</span>
                <div className="font-bold text-slate-900 mt-1">{device.status ?? '—'}</div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[11px]">Edge Agent Engine:</span>
                <div className="font-bold text-slate-900 mt-1">{device.agent_version ?? '—'} · {device.sim_network ?? '—'}</div>
              </div>
            </div>
          </div>

          {/* Remote Device Management Actions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Remote Device Operations</h2>
              <p className="text-xs text-slate-500 font-medium">Perform software restarts and factory provisioning wipes</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleReboot}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <FleetIcons.Settings className="w-4 h-4" />
                <span>Reboot Display Controller</span>
              </button>

              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="w-full sm:w-auto px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <FleetIcons.Alert className="w-4 h-4 text-red-600" />
                <span>Remote Factory Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <Link
          to="/technician/devices"
          className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl transition-colors text-center"
        >
          ← Back to Devices
        </Link>
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <FleetIcons.Check className="w-4 h-4" />
          <span>Save Configuration</span>
        </button>
      </div>

      {/* Factory Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <FleetIcons.Alert className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Confirm Factory Reset?</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1">
                This will wipe local cached campaigns, stored offline logs, and reset network credentials on device{' '}
                <span className="font-mono font-bold text-slate-900 dark:text-white">{device.box_id ?? device.id ?? '—'}</span>.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowResetModal(false);
                  try {
                    await toast.promise(factoryReset(device.id), {
                      loading: 'Dispatching factory reset…',
                      success: 'Factory reset dispatched',
                      error: (err) => err?.message || 'Failed to reset device',
                    });
                    await loadEdgeConfig(device.id).catch(() => {});
                  } catch {
                    /* toast surfaced the error */
                  }
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                Proceed Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
