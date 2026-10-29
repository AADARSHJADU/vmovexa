import { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { technicianSelfService } from '../../api/services/technician/technician.service';
import { useTechnicianApp } from '../../hooks/technician/useTechnicianApp';
import { useTranslation } from '../../hooks/useTranslation';
import { copyToClipboard } from '../../utils/clipboard';

export const TechEdgeSetupPage = () => {
  const { t } = useTranslation();
  const isSuperAdmin = window.location.pathname.startsWith('/superadmin');
  const basePath = isSuperAdmin ? '/superadmin/technician' : '/technician';

  const { devices, loadDevices } = useTechnicianApp();

  // Wizard active step
  const [activeStep, setActiveStep] = useState(1);

  // Download state
  const [isDownloading, setIsDownloading] = useState(false);

  // Active cheatsheet tab
  const [activeCheatTab, setActiveCheatTab] = useState('adb');

  // Live Handshake verification state
  const [targetBoxId, setTargetBoxId] = useState('APC3588Q26360091');
  const [isVerifying, setIsVerifying] = useState(false);
  const [handshakeData, setHandshakeData] = useState(null);
  const [lastCheckTime, setLastCheckTime] = useState(null);

  // Load devices list for dropdown
  useEffect(() => {
    loadDevices().catch(() => {});
  }, [loadDevices]);

  const deviceList = useMemo(() => {
    return Array.isArray(devices) ? devices : (devices?.rows || []);
  }, [devices]);

  // Handle Download Core ZIP
  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      toast.loading('Preparing VMOVEXA Core USB package...', { id: 'pkg-dl' });
      const blob = await technicianSelfService.downloadCorePackage();
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/zip' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'vmovexa-edge-core-v1.0.zip');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Core USB Package downloaded successfully!', { id: 'pkg-dl' });
    } catch (err) {
      toast.error(err?.message || 'Failed to download package.', { id: 'pkg-dl' });
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle Live Handshake Verification
  const handleVerifyHandshake = useCallback(async (boxIdToTest) => {
    const id = boxIdToTest || targetBoxId;
    if (!id || !id.trim()) {
      toast.error('Please enter a Box ID or Device Serial.');
      return;
    }

    try {
      setIsVerifying(true);
      const res = await technicianSelfService.verifyLiveHandshake(id.trim());
      setHandshakeData(res);
      setLastCheckTime(new Date().toLocaleTimeString());
      if (res?.isOnline) {
        toast.success(`Device ${id} is ONLINE & transmitting live telemetry!`);
      } else if (res?.isRegistered) {
        toast.success(`Device ${id} is registered in backend.`);
      } else {
        toast.error(`Device ${id} is not registered yet. Run the 1-click installer.`);
      }
    } catch (err) {
      toast.error(err?.message || 'Handshake check failed.');
    } finally {
      setIsVerifying(false);
    }
  }, [targetBoxId]);

  // Initial check on mount
  useEffect(() => {
    if (!targetBoxId) return undefined;
    const timer = window.setTimeout(() => handleVerifyHandshake(targetBoxId), 0);
    return () => window.clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Copy to clipboard helper
  const copyCommand = async (cmd, label = 'Command') => {
    try {
      const ok = await copyToClipboard(cmd);
      if (!ok) {
        toast.error(`Failed to copy ${label}`);
        return;
      }
    } catch {
      toast.error(`Failed to copy ${label}`);
      return;
    }
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 px-1 sm:px-0">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', path: `${basePath}/dashboard` },
          { label: 'Device Operations', path: `${basePath}/devices` },
          { label: 'Edge USB Setup & Provisioning' },
        ]}
        className="mb-2"
      />

      {/* Header Container - Fully Responsive */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0 mt-0.5">
            <FleetIcons.Terminal className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-zinc-900 via-indigo-950 to-blue-900 dark:from-white dark:via-zinc-100 dark:to-indigo-200 bg-clip-text text-transparent">
              Android Edge Installation, Cloud Setup & Auto-Start
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              One-time USB installation, Wi-Fi/4G cloud connection, HDMI player and automatic startup explained step by step.
            </p>
          </div>
        </div>

        {/* Action Buttons - Stack on mobile, inline on desktop */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={handleDownloadZip}
            disabled={isDownloading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/25 transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {isDownloading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t('technician.edge_setup.downloading')}</span>
              </>
            ) : (
              <>
                <FleetIcons.Download className="w-4 h-4 text-white" />
                <span>{t('technician.edge_setup.download_zip')}</span>
              </>
            )}
          </button>
          <RefreshButton
            onClick={() => {
              document.getElementById('handshake-monitor-section')?.scrollIntoView({ behavior: 'smooth' });
              handleVerifyHandshake(targetBoxId);
            }}
            isLoading={isVerifying}
            label="Verify Connection"
            className="w-full sm:w-auto justify-center text-xs sm:text-sm py-2.5"
          />
        </div>
      </div>

      {/* What actually runs on the Android box */}
      <div className="rounded-2xl border border-cyan-200 dark:border-cyan-900/60 bg-cyan-50/70 dark:bg-cyan-950/20 p-4 sm:p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center shrink-0">
            <FleetIcons.Screen className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">Android box mein browser aur CORE kaise chalte hain?</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 mt-1 leading-relaxed">
              APC3588Q mein <strong>Fully Kiosk Browser</strong> primary fullscreen player hai aur <strong>Chromium WebView Shell</strong> fallback browser hai. CORE ka Node process local player
              <code className="mx-1 font-mono text-cyan-700 dark:text-cyan-300">http://127.0.0.1:8888</code>
              serve karta hai. Boot service CORE start karti hai aur isi local URL ko HDMI screen par fullscreen kholti hai.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 text-xs">
          {[
            ['1', 'Power ON', 'Android boot hota hai'],
            ['2', 'CORE auto-start', '/system/etc/init/vmovexa-core.rc'],
            ['3', 'Cloud connect', 'MQTT over Wi-Fi / 4G'],
            ['4', 'TV playback', 'Fully Kiosk / WebView → HDMI'],
          ].map(([number, title, detail]) => (
            <div key={number} className="rounded-xl bg-white dark:bg-zinc-900 border border-cyan-100 dark:border-cyan-900/50 p-3">
              <span className="text-[10px] font-black text-cyan-600">STEP {number}</span>
              <p className="font-bold text-slate-900 dark:text-white mt-1">{title}</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 break-all">{detail}</p>
            </div>
          ))}
        </div>
        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl px-3 py-2.5">
          Normal use mein technician ko <code className="font-mono">/data/vmovexa-core/run.sh</code> baar-baar nahi chalana hai. Yeh sirf manual recovery command hai; boot service aur watchdog daily operation automatically handle karte hain.
        </p>
      </div>

      {/* 3-Step Simple Visual Workflow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Step 1 Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-transparent dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-zinc-900 border border-blue-500/20 dark:border-blue-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
              1
            </span>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Physical Plug
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{t('technician.edge_setup.connect_usb')}</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
              Connect standard USB Type-C cable from laptop to Edge Box debug port. Turn ON vehicle power or 12V switch.
            </p>
          </div>
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 bg-white/70 dark:bg-zinc-800/70 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <FleetIcons.Check className="w-3.5 h-3.5 text-blue-500" />
              Green Power LED ON
            </span>
          </div>
        </div>

        {/* Step 2 Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-zinc-900 border border-indigo-500/20 dark:border-indigo-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
              2
            </span>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              1-Click Setup
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{t('technician.edge_setup.run_installer')}</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
              Extract downloaded ZIP and double-click <code className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">install-usb.bat</code> on the Windows technician laptop. This one-time setup installs CORE and Android auto-start.
            </p>
          </div>
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 bg-white/70 dark:bg-zinc-800/70 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <FleetIcons.Check className="w-3.5 h-3.5 text-indigo-500" />
              One-time Auto-start Setup
            </span>
          </div>
        </div>

        {/* Step 3 Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-transparent dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-zinc-900 border border-emerald-500/20 dark:border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
              3
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Live Transit
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{t('technician.edge_setup.live_handshake')}</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
              Box chip serial is automatically registered. Real-time GPS, broker telemetry, and display channels go live instantly.
            </p>
          </div>
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 bg-white/70 dark:bg-zinc-800/70 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-500" />
              Autostarts on Every Boot
            </span>
          </div>
        </div>
      </div>

      {/* Main Download & Package Card - Mobile Optimized */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900/10 via-purple-900/5 to-blue-900/10 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-zinc-900 border border-indigo-500/20 dark:border-indigo-500/30 p-4 sm:p-6 lg:p-7 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400">
              <FleetIcons.Shield className="w-3.5 h-3.5" />
              <span>{t('technician.edge_setup.field_pkg_title')}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
              VMOVEXA Core USB Bundle (Complete Ready-to-Run Package)
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Everything required for transit box setup is pre-bundled inside this ZIP. Includes automatic ADB scripts, Rockchip RK3588 native hardware chip detection, pre-configured EMQX broker settings, and vehicle ignition auto-start service.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                <FleetIcons.Check className="w-3 h-3 text-emerald-500" />
                Windows 1-Click .BAT
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                <FleetIcons.Check className="w-3 h-3 text-indigo-500" />
                Linux / Mac .SH
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                <FleetIcons.Check className="w-3 h-3 text-purple-500" />
                Auto-Detect Chip Serial
              </span>
            </div>
          </div>

          {/* Download & Copy Buttons Container */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto shrink-0">
            <button
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 transition-all active:scale-[0.98]"
            >
              <FleetIcons.Download className="w-4 h-4 text-white" />
              <span>{t('technician.edge_setup.download_pkg')}</span>
            </button>
            <button
              onClick={() => {
                const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
                copyCommand(`curl -sSL http://${host}:4000/api/v1/edge-devices/setup-script | bash`, 'Network 1-Liner');
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 border border-zinc-200 dark:border-zinc-700 shadow-sm transition-all"
            >
              <FleetIcons.Copy className="w-3.5 h-3.5 text-zinc-500" />
              <span>{t('technician.edge_setup.copy_command')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Telemetry & Handshake Monitor Card */}
      <div id="handshake-monitor-section" className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-sm transition-colors space-y-4 sm:space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                Live Telemetry & Handshake Monitor
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Live status query for edge box <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{targetBoxId}</span>
              {lastCheckTime && ` • Checked at ${lastCheckTime}`}
            </p>
          </div>

          {/* Quick Select & Refresh Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {deviceList.length > 0 && (
              <select
                onChange={(e) => {
                  setTargetBoxId(e.target.value);
                  handleVerifyHandshake(e.target.value);
                }}
                value={targetBoxId}
                className="w-full sm:w-auto px-3 py-2 rounded-xl text-xs font-medium border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="APC3588Q26360091">APC3588Q26360091 (Simulated Bus 1)</option>
                {deviceList.map((d) => (
                  <option key={d.id} value={d.box_id}>
                    {d.box_id} {d.vehicle ? `(${d.vehicle.bus_number})` : ''}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() => handleVerifyHandshake(targetBoxId)}
              disabled={isVerifying}
              className="w-full sm:w-auto justify-center px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-all flex items-center gap-1.5"
            >
              <FleetIcons.Refresh className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>{t('technician.edge_setup.refresh_status')}</span>
            </button>
          </div>
        </div>

        {/* Live Search & Custom ID Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <input
            type="text"
            value={targetBoxId}
            onChange={(e) => setTargetBoxId(e.target.value)}
            placeholder={t('technician.edge_setup.serial_box_ph')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => handleVerifyHandshake(targetBoxId)}
            disabled={isVerifying}
            className="w-full sm:w-auto shrink-0 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-500/20 transition-all active:scale-[0.98]"
          >
            {isVerifying ? 'Verifying...' : 'Check Status'}
          </button>
        </div>

        {/* Handshake Status Tiles - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Tile 1: Backend Registration */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t('technician.edge_setup.db_registration')}</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                handshakeData?.isRegistered
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
              }`}>
                {handshakeData?.isRegistered ? 'Registered' : 'Pending'}
              </span>
            </div>
            <div className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white font-mono truncate">
              {handshakeData?.boxId || targetBoxId}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {handshakeData?.isRegistered ? 'Verified in edge_devices table' : 'Auto-registered on first ping'}
            </p>
          </div>

          {/* Tile 2: MQTT Broker Status */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t('technician.edge_setup.broker_state')}</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                handshakeData?.isOnline
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
              }`}>
                {handshakeData?.isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            <div className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
              {handshakeData?.isOnline ? 'EMQX Connected' : 'No Heartbeat'}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
              Last seen: {handshakeData?.lastSeen ? new Date(handshakeData.lastSeen).toLocaleTimeString() : '—'}
            </p>
          </div>

          {/* Tile 3: GPS Telemetry */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t('technician.edge_setup.gps_fix')}</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                handshakeData?.gps?.locked
                  ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                  : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
              }`}>
                {handshakeData?.gps?.locked ? `${handshakeData.gps.satellites ?? 0} Sats` : 'No Fix'}
              </span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white font-mono truncate">
              {handshakeData?.gps?.locked && handshakeData.gps.lat != null && handshakeData.gps.lng != null
                ? `${Number(handshakeData.gps.lat).toFixed(6)}°, ${Number(handshakeData.gps.lng).toFixed(6)}°`
                : 'Awaiting satellite fix'}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {handshakeData?.gps?.locked
                ? `Speed: ${handshakeData.gps.speed ?? 0} km/h • Lock Verified`
                : 'No valid GPS position received'}
            </p>
          </div>

          {/* Tile 4: {t('technician.edge_setup.hw_vitals')} */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t('technician.edge_setup.hw_vitals')}</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                RK3588 SOC
              </span>
            </div>
            <div className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white truncate">
              {handshakeData?.telemetry?.socTemp || '42°C'} • {handshakeData?.telemetry?.cpuUsage || '18%'}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
              RAM: {handshakeData?.telemetry?.ramUsage || '34%'} • Screen: {handshakeData?.telemetry?.connectedScreens || 1} Connected
            </p>
          </div>
        </div>

        {/* Handshake Result Summary Banner */}
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          handshakeData?.isOnline
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200'
            : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 ${
              handshakeData?.isOnline ? 'bg-emerald-600' : 'bg-zinc-600'
            }`}>
              <FleetIcons.Check className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold">
                {handshakeData?.isOnline
                  ? 'Edge Box Provisioning Verified & Operational'
                  : 'Ready for USB Provisioning'}
              </h4>
              <p className="text-[11px] sm:text-xs opacity-80 mt-0.5">
                {handshakeData?.message || 'Device configured. Run 1-click installer to start broadcasting live telemetry.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleVerifyHandshake(targetBoxId)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all text-center"
          >
            Re-test Handshake
          </button>
        </div>
      </div>

      {/* Interactive Step-by-Step Guidance */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-sm transition-colors space-y-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
              i
            </span>
            <span>{t('technician.edge_setup.step_details')}</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Click on any step below to view exact commands and instructions.
          </p>
        </div>

        {/* Step Tabs Grid - Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { step: 1, label: '1. Register' },
            { step: 2, label: '2. Install' },
            { step: 3, label: '3. Cloud URL' },
            { step: 4, label: '4. Auto Boot' },
            { step: 5, label: '5. HDMI TV' },
            { step: 6, label: '6. Verify' },
          ].map((item) => (
            <button
              key={item.step}
              onClick={() => setActiveStep(item.step)}
              className={`py-2 px-3 rounded-xl text-xs font-semibold text-center transition-all ${
                activeStep === item.step
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Selected Step Explanation Card */}
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
          {activeStep === 1 && (
            <div className="space-y-2">
              <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                Step 1: Backend mein device register aur assign karein
              </h4>
              <ul className="text-xs text-zinc-600 dark:text-zinc-300 space-y-1.5 list-disc list-inside">
                <li>Box ID hardware serial ke exactly same rakhein, jaise <code className="font-mono">APC3588Q26360091</code>.</li>
                <li>Device ko organization, vehicle, route aur required screens ke saath assign karein.</li>
                <li>Device enabled hona chahiye; campaign targeting isi mapping se edge box tak pahunchti hai.</li>
              </ul>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-3">
              <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                Step 2: One-time USB installation
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Windows (1-Click)</span>
                  <div className="p-2 rounded bg-zinc-900 text-zinc-200 font-mono text-xs overflow-x-auto">
                    install-usb.bat
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Downloaded ZIP extract karke <code className="font-mono text-indigo-500">install-usb.bat</code> run karein. Developer repo se setup kar rahe hon to root ka <code className="font-mono">deploy_edge.bat</code> use kar sakte hain. CORE <code className="font-mono">/data/vmovexa-core</code> mein copy hoga.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Linux / Mac (Terminal)</span>
                  <div className="p-2 rounded bg-zinc-900 text-zinc-200 font-mono text-xs overflow-x-auto">
                    adb push core /data/vmovexa-core
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Linux/macOS par ADB se package copy karein, executable permission dein aur Android autostart installer run karein.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-2">
              <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                Step 3: Wi-Fi/4G aur production MQTT URL
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                USB sirf installation ke liye hai. Bus mein box Wi-Fi/4G se chalega. Downloaded package mein default
                <code className="mx-1 font-mono text-indigo-500">MQTT_URL=mqtt://api.vmovexa.com:1883</code> aur
                <code className="font-mono">SIMULATE=false</code> milta hai. Server firewall/load balancer par TCP 1883 broker tak open hona chahiye. <code className="font-mono">https://api.vmovexa.com</code> REST API URL hai, ise MQTT_URL mein use na karein. TLS configure hone par <code className="font-mono">mqtts://api.vmovexa.com:8883</code> use karein.
              </p>
            </div>
          )}

          {activeStep === 4 && (
            <div className="space-y-2">
              <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                Step 4: Automatic boot service
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Installer native Android service <code className="font-mono">/system/etc/init/vmovexa-core.rc</code> banata hai. First installation ke baad box ko ek baar reboot karein. Uske baad har Power ON/reboot par service CORE start karti hai, kiosk player kholti hai aur watchdog se crashed Node process restart karti hai. <code className="font-mono">run.sh</code> sirf manual recovery ke liye hai.
              </p>
            </div>
          )}

          {activeStep === 5 && (
            <div className="space-y-2">
              <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">Step 5: HDMI TV aur fullscreen player</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                TV ko HDMI se connect karke correct HDMI input select karein. Boot service Fully Kiosk mein local URL <code className="font-mono">http://127.0.0.1:8888</code> kholti hai; Fully unavailable ho to Chromium WebView Shell fallback hota hai. Internet band ho tab cached campaign media continue ho sakti hai; naya campaign internet aane par sync hoga.
              </p>
            </div>
          )}

          {activeStep === 6 && (
            <div className="space-y-2">
              <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">Step 6: Live handshake aur campaign test</h4>
              <ul className="text-xs text-zinc-600 dark:text-zinc-300 space-y-1.5 list-disc list-inside">
                <li>Upar <strong>Check Status</strong> se device ONLINE, heartbeat, GPS aur telemetry timestamp verify karein.</li>
                <li>Paid/cleared test campaign ko current slot mein target vehicle/screen par schedule karein.</li>
                <li>TV par media aur backend mein proof-of-play confirm karke USB cable remove karein.</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Field Commands & Reference Tabs - Mobile Optimized */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-sm transition-colors space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
              Field Cheatsheet & Terminal Commands
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Copy-paste commands for manual diagnostics or verification.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-x-auto w-full sm:w-auto">
            {[
              { id: 'adb', label: 'ADB Tools' },
              { id: 'android', label: 'Android Boot' },
              { id: 'hardware', label: 'Pinouts' },
              { id: 'faq', label: 'Field FAQs' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCheatTab(tab.id)}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-center whitespace-nowrap ${
                  activeCheatTab === tab.id
                    ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeCheatTab === 'adb' && (
          <div className="space-y-2.5">
            {[
              { label: 'Check Connected USB Devices', cmd: 'adb devices' },
              { label: 'Read Hardware Serial Number', cmd: 'adb shell getprop ro.serialno' },
              { label: 'Stream Live CORE Log', cmd: 'adb shell "tail -f /data/vmovexa-core/core.log"' },
              { label: 'Stream Boot Service Log', cmd: 'adb shell "tail -f /data/vmovexa-core/boot.log"' },
              { label: 'Reboot Edge Box', cmd: 'adb reboot' },
            ].map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{item.label}</span>
                  <button
                    onClick={() => copyCommand(item.cmd, item.label)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 shrink-0 ml-2 cursor-pointer"
                  >
                    <FleetIcons.Copy className="w-3 h-3" />
                    <span>{t('technician.edge_setup.copy')}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900 text-zinc-200 font-mono text-xs overflow-x-auto whitespace-pre">
                  {item.cmd}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeCheatTab === 'android' && (
          <div className="space-y-2.5">
            {[
              { label: 'Check Native Boot Service', cmd: 'adb shell "ls -l /system/etc/init/vmovexa-core.rc"' },
              { label: 'Check Running Android Service', cmd: 'adb shell "getprop init.svc.vmovexa_core"' },
              { label: 'Manual CORE Recovery', cmd: 'adb shell "/data/vmovexa-core/run.sh"' },
              { label: 'Open Fully Kiosk Player Now', cmd: 'adb shell "am start --user 0 -n de.ozerov.fully/.MainActivity -a android.intent.action.VIEW -d http://127.0.0.1:8888"' },
              { label: 'Open Chromium Fallback', cmd: 'adb shell "am start --user 0 -n org.chromium.webview_shell/.WebViewBrowserActivity -a android.intent.action.VIEW -d http://127.0.0.1:8888"' },
            ].map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{item.label}</span>
                  <button
                    onClick={() => copyCommand(item.cmd, item.label)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 shrink-0 ml-2 cursor-pointer"
                  >
                    <FleetIcons.Copy className="w-3 h-3" />
                    <span>{t('technician.edge_setup.copy')}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900 text-zinc-200 font-mono text-xs overflow-x-auto whitespace-pre">
                  {item.cmd}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeCheatTab === 'hardware' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="font-bold text-zinc-900 dark:text-white">{t('technician.edge_setup.power_supply_title')}</span>
              <p className="text-zinc-500 dark:text-zinc-400">9V to 36V DC wide-voltage Phoenix terminal with ignition pin</p>
            </div>
            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="font-bold text-zinc-900 dark:text-white">{t('technician.edge_setup.debug_otg_title')}</span>
              <p className="text-zinc-500 dark:text-zinc-400">Type-C USB 3.0 OTG port (supports direct ADB provisioning)</p>
            </div>
            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="font-bold text-zinc-900 dark:text-white">{t('technician.edge_setup.display_outputs_title')}</span>
              <p className="text-zinc-500 dark:text-zinc-400">Dual HDMI 2.1 outputs (supports dual 4K transit ad screens)</p>
            </div>
          </div>
        )}

        {activeCheatTab === 'faq' && (
          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="font-bold text-zinc-900 dark:text-white">What if the laptop says &quot;No device detected&quot;?</span>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Verify the USB cable supports data transfer (not charge-only). Check that the green power LED is ON and USB debugging is enabled.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="font-bold text-zinc-900 dark:text-white">What if the bus is inside a depot workshop without GPS fix?</span>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                The daemon automatically buffers last-known coordinates. As soon as the bus exits into open sky, GPS lock engages within 15 seconds.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechEdgeSetupPage;
