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

  // Download state
  const [isDownloading, setIsDownloading] = useState(false);

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
      toast.loading('Preparing VMOVEXA Core package...', { id: 'pkg-dl' });
      const blob = await technicianSelfService.downloadCorePackage();
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/zip' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'vmovexa-edge-core-v1.0.zip');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Core package downloaded successfully!', { id: 'pkg-dl' });
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
        toast.error(`Device ${id} is not registered yet. Run the 1-command installer.`);
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
          { label: t('nav.dashboard', 'Dashboard'), path: `${basePath}/dashboard` },
          { label: t('nav.headers.device_ops', 'Device Operations'), path: `${basePath}/devices` },
          { label: t('technician.edge_setup', 'Edge Setup') },
        ]}
        className="mb-2"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0 mt-0.5">
            <FleetIcons.Terminal className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-zinc-900 via-indigo-950 to-blue-900 dark:from-white dark:via-zinc-100 dark:to-indigo-200 bg-clip-text text-transparent">
              {t('ag.technician.techedgesetuppage.edge_setup_one_command', 'Edge Device Setup (One Command)')}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              {t('ag.technician.techedgesetuppage.one_command_subtitle', 'Connect the edge box to the laptop via USB and run a single command. CORE, the Node runtime, auto-start and the kiosk player all install automatically.')}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          <RefreshButton
            onClick={() => {
              document.getElementById('handshake-monitor-section')?.scrollIntoView({ behavior: 'smooth' });
              handleVerifyHandshake(targetBoxId);
            }}
            isLoading={isVerifying}
            label={t('technician.edge_setup.verify_conn', 'Verify Connection')}
            className="w-full sm:w-auto justify-center text-xs sm:text-sm py-2.5"
          />
        </div>
      </div>

      {/* ONE-COMMAND INSTALL — the only setup step technicians need */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900/10 via-purple-900/5 to-blue-900/10 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-zinc-900 border border-indigo-500/20 dark:border-indigo-500/30 p-4 sm:p-6 lg:p-7">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 mb-4">
          <FleetIcons.Shield className="w-3.5 h-3.5" />
          <span>{t('ag.technician.techedgesetuppage.fully_automatic', 'Fully Automatic Installer')}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4 mb-5">
          {[
            ['1', t('ag.technician.techedgesetuppage.connect_usb', 'Connect USB'), t('ag.technician.techedgesetuppage.connect_usb_detail', 'Connect the edge box to the laptop with a USB Type-C / OTG cable and turn ON 12V power.')],
            ['2', t('ag.technician.techedgesetuppage.run_one_command', 'Run One Command'), t('ag.technician.techedgesetuppage.run_one_command_detail', 'Run the command below. Node runtime, CORE, auto-start and the kiosk player all install themselves.')],
            ['3', t('ag.technician.techedgesetuppage.verify_live', 'Verify Live'), t('ag.technician.techedgesetuppage.verify_live_detail', 'Use the Handshake Monitor below to confirm the device is ONLINE with GPS and telemetry. That\'s it.')],
          ].map(([n, title, detail]) => (
            <div key={n} className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-indigo-500/20 dark:border-indigo-500/30 space-y-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">{n}</span>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{title}</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">{detail}</p>
            </div>
          ))}
        </div>

        {/* The command */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            {t('ag.technician.techedgesetuppage.the_command', 'The command (run from project root on the Windows laptop):')}
          </span>
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <div className="flex-1 p-3 rounded-xl bg-zinc-900 text-emerald-300 font-mono text-xs sm:text-sm overflow-x-auto whitespace-pre flex items-center">
              deploy_edge.bat
            </div>
            <button
              onClick={() => copyCommand('deploy_edge.bat', 'Install command')}
              className="shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/25 transition-all active:scale-[0.98]"
            >
              <FleetIcons.Copy className="w-4 h-4 text-white" />
              <span>{t('technician.edge_setup.copy', 'Copy')}</span>
            </button>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {t('ag.technician.techedgesetuppage.command_note', 'The script auto-downloads ADB if missing, bundles a self-contained Node runtime (no Termux needed), installs CORE to /data/vmovexa-core, sets up the native Android boot service, and auto-installs + launches the kiosk browser. If no kiosk browser is present it installs the bundled APK.')}
          </p>
        </div>
      </div>

      {/* Optional: download the raw package (for remote/offline provisioning without the repo) */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 shadow-sm transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
            {t('ag.technician.techedgesetuppage.offline_package', 'Offline package download (optional)')}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed max-w-2xl">
            {t('ag.technician.techedgesetuppage.offline_package_detail', 'If you are provisioning from another laptop without the repo, download this ZIP. It bundles CORE, the Node runtime and the install scripts.')}
          </p>
        </div>
        <button
          onClick={handleDownloadZip}
          disabled={isDownloading}
          className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/25 transition-all disabled:opacity-50 active:scale-[0.98]"
        >
          {isDownloading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{t('technician.edge_setup.downloading', 'Downloading...')}</span>
            </>
          ) : (
            <>
              <FleetIcons.Download className="w-4 h-4 text-white" />
              <span>{t('technician.edge_setup.download_zip', 'Download ZIP')}</span>
            </>
          )}
        </button>
      </div>

      {/* Live Telemetry & Handshake Monitor Card */}
      <div id="handshake-monitor-section" className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-sm transition-colors space-y-4 sm:space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                {t('ag.technician.techedgesetuppage.live_telemetry_and_handshake_monitor', 'Live Telemetry & Handshake Monitor')}
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {t('ag.technician.techedgesetuppage.live_status_query_for_edge_box', 'Live status query for edge box')} <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{targetBoxId}</span>
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
                <option value="APC3588Q26360091">{t('ag.technician.techedgesetuppage.apc3588q26360091_simulated_bus_1', 'APC3588Q26360091 (Simulated Bus 1)')}</option>
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
              <span>{t('technician.edge_setup.refresh_status', 'Refresh Status')}</span>
            </button>
          </div>
        </div>

        {/* Live Search & Custom ID Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <input
            type="text"
            value={targetBoxId}
            onChange={(e) => setTargetBoxId(e.target.value)}
            placeholder={t('technician.edge_setup.serial_box_ph', 'Enter Box ID / Device Serial')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => handleVerifyHandshake(targetBoxId)}
            disabled={isVerifying}
            className="w-full sm:w-auto shrink-0 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-500/20 transition-all active:scale-[0.98]"
          >
            {isVerifying ? t('technician.edge_setup.verifying', 'Verifying...') : t('technician.edge_setup.check_status', 'Check Status')}
          </button>
        </div>

        {/* Handshake Status Tiles - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Tile 1: Backend Registration */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t('technician.edge_setup.db_registration', 'DB Registration')}</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                handshakeData?.isRegistered
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
              }`}>
                {handshakeData?.isRegistered ? t('common.registered', 'Registered') : t('common.pending', 'Pending')}
              </span>
            </div>
            <div className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white font-mono truncate">
              {handshakeData?.boxId || targetBoxId}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {handshakeData?.isRegistered ? t('technician.edge_setup.verified_db', 'Verified in edge_devices table') : t('technician.edge_setup.auto_reg', 'Auto-registered on first ping')}
            </p>
          </div>

          {/* Tile 2: MQTT Broker Status */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t('technician.edge_setup.broker_state', 'Broker State')}</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                handshakeData?.isOnline
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
              }`}>
                {handshakeData?.isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            <div className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
              {handshakeData?.isOnline ? t('technician.edge_setup.emqx_connected', 'EMQX Connected') : t('technician.edge_setup.no_heartbeat', 'No Heartbeat')}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
              {t('ag.technician.techedgesetuppage.last_seen', 'Last seen:')} {handshakeData?.lastSeen ? new Date(handshakeData.lastSeen).toLocaleTimeString() : '—'}
            </p>
          </div>

          {/* Tile 3: GPS Telemetry */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t('technician.edge_setup.gps_fix', 'GPS Fix')}</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                handshakeData?.gps?.locked
                  ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                  : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
              }`}>
                {handshakeData?.gps?.locked ? `${handshakeData.gps.satellites ?? 0} Sats` : t('technician.edge_setup.no_fix', 'No Fix')}
              </span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white font-mono truncate">
              {handshakeData?.gps?.locked && handshakeData.gps.lat != null && handshakeData.gps.lng != null
                ? `${Number(handshakeData.gps.lat).toFixed(6)}°, ${Number(handshakeData.gps.lng).toFixed(6)}°`
                : t('technician.edge_setup.awaiting_sat', 'Awaiting satellite fix')}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {handshakeData?.gps?.locked
                ? `Speed: ${handshakeData.gps.speed ?? 0} km/h • Lock Verified`
                : 'No valid GPS position received'}
            </p>
          </div>

          {/* Tile 4: Hardware Vitals */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t('technician.edge_setup.hw_vitals', 'HW Vitals')}</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                {t('ag.technician.techedgesetuppage.rk3588_soc', 'RK3588 SOC')}
              </span>
            </div>
            <div className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white truncate">
              {handshakeData?.telemetry?.socTemp || '42°C'} • {handshakeData?.telemetry?.cpuUsage || '18%'}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
              {t('ag.technician.techedgesetuppage.ram', 'RAM:')} {handshakeData?.telemetry?.ramUsage || '34%'} {t('ag.technician.techedgesetuppage.screen', '• Screen:')} {handshakeData?.telemetry?.connectedScreens || 1} {t('ag.technician.techedgesetuppage.connected', 'Connected')}
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
                  ? t('technician.edge_setup.prov_verified', 'Edge Box Provisioning Verified & Operational')
                  : t('technician.edge_setup.ready_prov', 'Ready for Provisioning')}
              </h4>
              <p className="text-[11px] sm:text-xs opacity-80 mt-0.5">
                {handshakeData?.message || 'Run the deploy_edge.bat command to start broadcasting live telemetry.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleVerifyHandshake(targetBoxId)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all text-center"
          >
            {t('ag.technician.techedgesetuppage.re_test_handshake', 'Re-test Handshake')}
          </button>
        </div>
      </div>

      {/* Compact diagnostics — only shown for troubleshooting, not required for setup */}
      <details className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 shadow-sm transition-colors group">
        <summary className="cursor-pointer list-none flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
              {t('ag.technician.techedgesetuppage.diagnostics_optional', 'Diagnostics (optional, for troubleshooting)')}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {t('ag.technician.techedgesetuppage.diagnostics_detail', 'If something goes wrong, use these ADB commands for manual checks.')}
            </p>
          </div>
          <FleetIcons.ChevronRight className="w-4 h-4 text-zinc-400 transition-transform group-open:rotate-90 shrink-0" />
        </summary>

        <div className="space-y-2.5 mt-4">
          {[
            { label: 'Check Connected USB Devices', cmd: 'adb devices' },
            { label: 'Read Hardware Serial Number', cmd: 'adb shell getprop ro.serialno' },
            { label: 'Stream Live CORE Log', cmd: 'adb shell "tail -f /data/vmovexa-core/core.log"' },
            { label: 'Manual CORE Recovery', cmd: 'adb shell "/data/vmovexa-core/run.sh"' },
            { label: 'Open Fully Kiosk Player Now', cmd: 'adb shell "am start --user 0 -n de.ozerov.fully/.MainActivity -a android.intent.action.VIEW -d http://127.0.0.1:8888"' },
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
                  <span>{t('technician.edge_setup.copy', 'Copy')}</span>
                </button>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-900 text-zinc-200 font-mono text-xs overflow-x-auto whitespace-pre">
                {item.cmd}
              </div>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
};

export default TechEdgeSetupPage;
