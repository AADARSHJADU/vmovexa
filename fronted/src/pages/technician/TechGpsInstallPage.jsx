import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useTechnicianApp } from '../../hooks/technician/useTechnicianApp';
import { useAuth } from '../../hooks/useAuth';

export const TechGpsInstallPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isSuperAdmin = window.location.pathname.startsWith('/superadmin');
  const basePath = isSuperAdmin ? '/superadmin/technician' : '/technician';
  const { user } = useAuth();
  const { vehicles, loadVehicles, registerGpsDevice, assignGps } = useTechnicianApp();

  useEffect(() => {
    loadVehicles().catch(() => {});
  }, [loadVehicles]);

  const vehicleList = useMemo(() => (Array.isArray(vehicles) ? vehicles : (vehicles?.rows || [])), [vehicles]);

  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [gpsDeviceId, setGpsDeviceId] = useState('');
  const [mountingPosition, setMountingPosition] = useState('Under Dashboard Harness');
  const [powerWire, setPowerWire] = useState('Continuous 24V + ACC Ignition Sense');
  const [simCardProvider, setSimCardProvider] = useState('Airtel M2M Corporate SIM (eSIM)');
  // Default the selection once vehicles load.
  useEffect(() => {
    if (selectedVehicleId == null && vehicleList.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedVehicleId(vehicleList[0].id);
    }
  }, [vehicleList, selectedVehicleId]);

  const selectedVehicle = vehicleList.find((v) => String(v.id) === String(selectedVehicleId)) || null;

  // No on-device camera scanner is wired in this environment. Rather than
  // fabricating a random serial, prompt the technician to scan/enter the
  // real code printed on the GPS unit's QR label.
  const handleScanQr = () => {
    const scanned = window.prompt('Scan or type the GPS unit serial / QR code printed on the device:');
    if (scanned && scanned.trim()) {
      setGpsDeviceId(scanned.trim());
    }
  };

  const handleInstall = async (e) => {
    e.preventDefault();
    if (!selectedVehicle) {
      toast.error('Select a vehicle first');
      return;
    }
    try {
      const gps = await toast.promise(
        registerGpsDevice({
          code: gpsDeviceId,
          type: 'external',
          sim: simCardProvider,
          serialNumber: gpsDeviceId,
          mountingPosition,
          powerWire,
          simProvider: simCardProvider,
          vehicleId: selectedVehicle.id,
          organizationId: selectedVehicle.organization_id,
        }),
        {
          loading: 'Registering GPS unit…',
          success: 'GPS unit registered',
          error: (err) => err?.message || 'Failed to register GPS unit',
        },
      );
      const gpsId = gps?.id ?? gps?.data?.id;
      if (gpsId != null) {
        await assignGps(gpsId, selectedVehicle.id).catch(() => {});
      }
      await loadVehicles().catch(() => {});
      navigate(`${basePath}/gps/success`, {
        state: {
          busNumber: selectedVehicle.bus_number ?? selectedVehicle.code ?? '—',
          depot: selectedVehicle.depot_id ?? '—',
          vehicleType: selectedVehicle.vehicle_type ?? '—',
          gpsDeviceId,
          assignedOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          assignedBy: user?.name ?? '—',
        },
      });
    } catch {
      /* toast surfaced the error */
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: isSuperAdmin ? 'Super Admin' : 'Technician', path: isSuperAdmin ? '/superadmin/dashboard' : '/technician/dashboard' },
              ...(isSuperAdmin ? [{ label: 'Technician', path: `${basePath}/gps` }] : []),
              { label: 'GPS Installation' }
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{t('technician.gps.install_title')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Install, calibrate, and bind a GPS telematics box to a transit fleet vehicle
          </p>
        </div>

        <Link
          to={`${basePath}/hardware-status`}
          className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors self-start sm:self-auto shadow-sm"
        >
          View Telematics Status
        </Link>
      </div>

      <form onSubmit={handleInstall} className="space-y-6">
        {/* Step 1: Vehicle Selector */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">{t('technician.gps.step1_title')}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('technician.gps.step1_desc')}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t('technician.gps.select_vehicle')}</label>
            <select
              value={selectedVehicleId ?? ''}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {vehicleList.length === 0 && <option value="">{t('technician.gps.no_vehicles')}</option>}
              {vehicleList.map((v) => (
                <option key={v.id} value={v.id}>
                  {(v.bus_number ?? v.code ?? v.id)} — {(v.vehicle_type ?? '—')} (Depot {v.depot_id ?? '—'})
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Information Box */}
          {selectedVehicle ? (
            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">{selectedVehicle.bus_number ?? selectedVehicle.code ?? '—'}</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700">
                    Vehicle #{selectedVehicle.id ?? '—'}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">{selectedVehicle.vehicle_type ?? '—'} · Depot {selectedVehicle.depot_id ?? '—'}</p>
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-medium text-[11px] pt-1">
                  <span>Code: {selectedVehicle.code ?? '—'}</span>
                  <span>·</span>
                  <span>Org: {selectedVehicle.organization_id ?? '—'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center text-xs text-slate-400 font-medium">
              Select a vehicle to view its details.
            </div>
          )}
        </div>

        {/* Step 2: GPS Unit Details & QR Scan */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">{t('technician.gps.step2_title')}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('technician.gps.step2_desc')}</p>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">{t('technician.gps.device_id_label')}</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={gpsDeviceId}
                onChange={(e) => setGpsDeviceId(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="e.g. GPS-MX-00123"
              />
              <button
                type="button"
                onClick={handleScanQr}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
              >
                <FleetIcons.Camera className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <span>{t('technician.gps.scan_qr')}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t('technician.gps.mount_pos')}</label>
              <select
                value={mountingPosition}
                onChange={(e) => setMountingPosition(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none"
              >
                <option value="Under Dashboard Harness">{t('technician.gps.pos_under_dash')}</option>
                <option value="Front Windshield Header">{t('technician.gps.pos_windshield')}</option>
                <option value="Roof Antenna Magnetic Mount">{t('technician.gps.pos_roof')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t('technician.gps.power_conn')}</label>
              <select
                value={powerWire}
                onChange={(e) => setPowerWire(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none"
              >
                <option value="Continuous 24V + ACC Ignition Sense">{t('technician.gps.pwr_continuous')}</option>
                <option value="CAN-bus J1939 Connector">{t('technician.gps.pwr_canbus')}</option>
                <option value="OBD-II Port Interface">{t('technician.gps.pwr_obd')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t('technician.gps.sim_cellular')}</label>
              <select
                value={simCardProvider}
                onChange={(e) => setSimCardProvider(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none"
              >
                <option value="Airtel M2M Corporate SIM (eSIM)">{t('technician.gps.sim_airtel')}</option>
                <option value="Jio Enterprise IoT SIM">{t('technician.gps.sim_jio')}</option>
                <option value="Vodafone Idea M2M Multi-Carrier">{t('technician.gps.sim_vi')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Installation Verification Status Card */}
        <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 rounded-2xl p-4 text-xs space-y-1.5">
          <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-bold">
            <FleetIcons.Gps className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span>{t('technician.gps.calibration_protocol')}</span>
          </div>
          <p className="text-blue-700 dark:text-blue-300">
            Once saved, the telematics unit will receive an over-the-air activation ping. Satellite lock will calibrate within 60 seconds after ignition cycle.
          </p>
        </div>

        {/* Submit CTA */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <Link
            to="/technician/dashboard"
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors text-center border border-slate-200 dark:border-slate-700"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 shadow-blue-600/20"
          >
            <FleetIcons.Check className="w-4 h-4 text-white" />
            <span>{t('technician.gps.install_assign_btn')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
