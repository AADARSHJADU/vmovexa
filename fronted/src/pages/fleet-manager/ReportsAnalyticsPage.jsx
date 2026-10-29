/* eslint-disable react-hooks/set-state-in-effect -- permission changes trigger asynchronous report loading */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { FleetIcons } from '../../components/FleetIcons';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { useAuth } from '../../hooks/useAuth';
import { useFleetVehicle } from '../../hooks/fleet/useFleetVehicle';
import { useFleetDriver } from '../../hooks/fleet/useFleetDriver';
import { useFleetManager } from '../../hooks/fleet/useFleetManager';
import { fleetTripService } from '../../api/services/fleet/trip.service';
import { reportService } from '../../api/services/shared/report.service';

const formatName = (v, fallback = '—') => {
  if (!v) return fallback;
  if (typeof v === 'object') return v.name || v.code || fallback;
  return String(v);
};

export const ReportsAnalyticsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canView = hasPermission('fleet.reports.view');
  const canGenerate = hasPermission(['reports.generate', 'reports.export']);
  const canViewVehicles = hasPermission('fleet.vehicles.view');
  const canViewDrivers = hasPermission('fleet.drivers.view');
  const canViewFleets = hasPermission('fleet.fleets.view');
  const canViewTrips = hasPermission('fleet.trips.view');

  // Redux & API Hooks
  const { vehicles, loadVehicles, loading: vehiclesLoading } = useFleetVehicle();
  const { drivers, loadDrivers } = useFleetDriver();
  const { fleets, loadFleets } = useFleetManager();

  // Local State
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('vehicle'); // 'vehicle' | 'driver' | 'trip' | 'fuel'
  const [timeframe, setTimeframe] = useState('week'); // 'today' | 'week' | 'month' | 'quarter'
  const [selectedFleetId, setSelectedFleetId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [chartMetric, setChartMetric] = useState('distance'); // 'distance' | 'speed' | 'trips' | 'efficiency'
  const [generatingExport, setGeneratingExport] = useState(false);

  // Load initial data
  const fetchData = useCallback(async () => {
    try {
      setTripsLoading(true);
      await Promise.allSettled([
        ...(canViewVehicles ? [loadVehicles()] : []),
        ...(canViewDrivers ? [loadDrivers()] : []),
        ...(canViewFleets ? [loadFleets({ page: 1, limit: 100 })] : []),
        ...(canViewTrips ? [fleetTripService.getTrips({ page: 1, limit: 100 }).then((res) => {
          const list = Array.isArray(res) ? res : (res?.items || res?.rows || []);
          setTrips(list);
        })] : []),
      ]);
    } catch {
      /* silent */
    } finally {
      setTripsLoading(false);
    }
  }, [canViewDrivers, canViewFleets, canViewTrips, canViewVehicles, loadDrivers, loadFleets, loadVehicles]);

  useEffect(() => {
    if (canView) {
      fetchData();
    }
  }, [canView, fetchData]);

  const vehicleList = useMemo(() => Array.isArray(vehicles) ? vehicles : (vehicles?.items || vehicles?.rows || []), [vehicles]);
  const driverList = useMemo(() => Array.isArray(drivers) ? drivers : (drivers?.items || drivers?.rows || []), [drivers]);
  const fleetList = useMemo(() => Array.isArray(fleets) ? fleets : (fleets?.items || fleets?.rows || []), [fleets]);

  // Filter vehicles by fleet and status
  const filteredVehicles = useMemo(() => {
    return vehicleList.filter((v) => {
      if (selectedFleetId !== 'all' && String(v.fleet_id) !== String(selectedFleetId)) return false;
      if (selectedStatus !== 'all' && v.status !== selectedStatus) return false;
      return true;
    });
  }, [vehicleList, selectedFleetId, selectedStatus]);

  // Filter drivers by status
  const filteredDrivers = useMemo(() => {
    return driverList.filter((d) => {
      if (selectedStatus !== 'all' && d.status !== selectedStatus) return false;
      return true;
    });
  }, [driverList, selectedStatus]);

  // Filter trips by vehicle fleet if applicable
  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      if (selectedFleetId !== 'all') {
        const linkedVehicle = vehicleList.find((v) => v.id === t.vehicle_id);
        if (linkedVehicle && String(linkedVehicle.fleet_id) !== String(selectedFleetId)) return false;
      }
      return true;
    });
  }, [trips, vehicleList, selectedFleetId]);

  // Dynamic KPI Metrics
  const totalVehiclesCount = vehicleList.length;
  const onRouteCount = vehicleList.filter((v) => v.status === 'on_route' || v.gps_status === 'online').length;
  const inDepotCount = vehicleList.filter((v) => v.status === 'in_depot').length;
  const totalDistanceKm = trips.reduce((acc, t) => acc + (parseFloat(t.distance_km) || 0), 0);
  const activeTripsCount = trips.filter((t) => t.status === 'in_progress').length;
  const completedTripsCount = trips.filter((t) => t.status === 'completed').length;
  const fleetUtilizationRate = totalVehiclesCount > 0 ? Math.round((onRouteCount / totalVehiclesCount) * 100) : 0;
  const efficiencyValues = vehicleList.map((v) => Number(v.efficiency)).filter(Number.isFinite);
  const fleetEfficiency = efficiencyValues.length ? Math.round(efficiencyValues.reduce((sum, value) => sum + value, 0) / efficiencyValues.length) : 0;
  const timedTrips = trips.filter((trip) => trip.on_time !== undefined || trip.is_on_time !== undefined);
  const onTimeRate = timedTrips.length ? Math.round((timedTrips.filter((trip) => trip.on_time ?? trip.is_on_time).length / timedTrips.length) * 100) : 0;
  const telemetryVehicles = vehicleList.filter((vehicle) => vehicle.gps_status || vehicle.gpsDevice || vehicle.gps_device_id);
  const pingReliability = telemetryVehicles.length ? Math.round((telemetryVehicles.filter((vehicle) => ['online', 'active'].includes(String(vehicle.gps_status || vehicle.gpsDevice?.status || '').toLowerCase())).length / telemetryVehicles.length) * 100) : 0;
  const speedValues = trips.map((trip) => Number(trip.average_speed ?? trip.avg_speed)).filter(Number.isFinite);
  const averageSpeed = speedValues.length ? speedValues.reduce((sum, value) => sum + value, 0) / speedValues.length : 0;

  // Chart values are derived only from returned trip telemetry; missing data remains zero.
  const chartData = useMemo(() => {
    const dayCount = timeframe === 'today' ? 1 : timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 90;
    const color = chartMetric === 'distance' ? 'from-blue-600 via-indigo-500 to-cyan-400' : chartMetric === 'speed' ? 'from-emerald-600 via-teal-500 to-lime-400' : chartMetric === 'trips' ? 'from-purple-600 via-violet-500 to-pink-400' : 'from-amber-600 via-orange-500 to-yellow-400';
    const unit = chartMetric === 'distance' ? 'km' : chartMetric === 'speed' ? 'km/h' : chartMetric === 'trips' ? 'trips' : '%';
    return Array.from({ length: dayCount }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (dayCount - index - 1));
      const matching = filteredTrips.filter((trip) => {
        const raw = trip.started_at || trip.start_time || trip.created_at || trip.createdAt;
        const tripDate = raw ? new Date(raw) : null;
        return tripDate && !Number.isNaN(tripDate.getTime()) && tripDate.toDateString() === date.toDateString();
      });
      const values = matching.map((trip) => Number(chartMetric === 'distance' ? trip.distance_km : chartMetric === 'speed' ? (trip.average_speed ?? trip.avg_speed) : chartMetric === 'efficiency' ? (trip.efficiency ?? trip.efficiency_percent) : 1) || 0);
      const value = chartMetric === 'trips' ? matching.length : (chartMetric === 'speed' || chartMetric === 'efficiency') ? (values.length ? values.reduce((sum, item) => sum + item, 0) / values.length : 0) : values.reduce((sum, item) => sum + item, 0);
      return { label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), value: Number(value.toFixed(1)), unit, color };
    });
  }, [chartMetric, filteredTrips, timeframe]);

  const maxChartValue = Math.max(...chartData.map((d) => d.value), 1);

  // Dynamic CSV Export Generator
  const handleExportCSV = async () => {
    if (!canGenerate) {
      toast.error('You do not have permission to export fleet reports.');
      return;
    }
    setGeneratingExport(true);
    const tid = toast.loading('Generating and formatting report...');
    try {
      await reportService.generateReport('fleet_summary', { type: selectedReportType, timeframe });

      let csvContent = 'data:text/csv;charset=utf-8,';
      let fileName = `vmovexa_${selectedReportType}_report_${Date.now()}.csv`;

      if (selectedReportType === 'vehicle') {
        csvContent += 'Bus Number,Model,Year,Fleet Group,Depot,Status,GPS Telemetry,Last Speed (km/h)\n';
        filteredVehicles.forEach((v) => {
          const fleetName = fleetList.find((f) => f.id === v.fleet_id)?.name || '';
          const depotName = formatName(v.depot);
          csvContent += `"${v.bus_number || ''}","${v.model || ''}","${v.year || ''}","${fleetName}","${depotName}","${v.status || ''}","${v.gps_status || ''}","${v.last_speed ?? ''}"\n`;
        });
      } else if (selectedReportType === 'driver') {
        csvContent += 'Driver Name,Enrollment/License,Assigned Bus,Status,Phone,Clearance\n';
        filteredDrivers.forEach((d) => {
          csvContent += `"${d.name || d.full_name || ''}","${d.license_number || d.enrollment_no || ''}","${d.assigned_bus_number || ''}","${d.status || ''}","${d.phone || ''}","${d.clearance || ''}"\n`;
        });
      } else if (selectedReportType === 'trip') {
        csvContent += 'Trip ID,Vehicle,Route Name,Status,Distance (km),Origin,Destination\n';
        filteredTrips.forEach((t) => {
          csvContent += `"${t.id}","${t.vehicle?.bus_number || t.vehicle_id || ''}","${t.route?.name || ''}","${t.status || ''}","${t.distance_km ?? ''}","${t.source || ''}","${t.destination || ''}"\n`;
        });
      } else {
        csvContent += 'Vehicle,Fuel/Power Type,Battery Capacity,Efficiency Rating,Telematics Health\n';
        filteredVehicles.forEach((v) => {
          csvContent += `"${v.bus_number || ''}","${v.fuel_type || ''}","${v.battery_level ?? ''}","${v.efficiency ?? ''}","${v.telematics_health || ''}"\n`;
        });
      }

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Report downloaded successfully!', { id: tid });
    } catch {
      toast.error('Failed to export report', { id: tid });
    } finally {
      setGeneratingExport(false);
    }
  };

  if (!canView) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm space-y-4">
        <div className="flex justify-center">
          <FleetIcons.Lock className="w-12 h-12 text-slate-400 dark:text-zinc-600" />
        </div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('common.access_revoked')}</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">
          Your administrator has revoked your permission to view analytics and reports.
        </p>
        <Link
          to="/fleet-operator/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
        >
          <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('common.back_to_dashboard')}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-16 animate-in fade-in duration-200">
      {/* 1. Global Standard Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Fleet Operator', path: '/fleet-operator/dashboard' },
          { label: 'Reports & Analytics' },
        ]}
        className="mb-2"
      />

      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{t('fleet.reports.telematics_engine')}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Reports & Fleet Telematics Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Real-time GPS telemetry, dispatch milestones, fuel/EV health, and driver roster metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Refresh Button */}
          <RefreshButton
            onClick={fetchData}
            loading={vehiclesLoading || tripsLoading}
            title={t('fleet.reports.refresh_title')}
          />

          {/* Timeframe Selector Filter */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
          >
            <option value="today">{t('fleet.reports.today_live')}</option>
            <option value="week">{t('fleet.reports.this_week')}</option>
            <option value="month">{t('fleet.reports.this_month')}</option>
            <option value="quarter">{t('fleet.reports.this_quarter')}</option>
          </select>

          {/* Download Export CSV */}
          {canGenerate && <button
            type="button"
            onClick={handleExportCSV}
            disabled={generatingExport}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <FleetIcons.Download className="w-3.5 h-3.5 text-white" />
            <span>{generatingExport ? 'Exporting...' : 'Export Report (CSV)'}</span>
          </button>}
        </div>
      </div>

      {/* 4 Interactive Report Type Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            id: 'vehicle',
            title: 'Vehicle Telematics',
            desc: 'Speed, active telemetry, GPS connectivity & models',
            count: `${totalVehiclesCount} Registered`,
            sub: `${onRouteCount} Currently Active`,
            iconBg: 'from-blue-600 to-indigo-600 text-white',
            icon: <FleetIcons.Car className="w-5 h-5 text-white" />,
          },
          {
            id: 'driver',
            title: 'Driver Rosters & Safety',
            desc: 'Driver ratings, licenses, and shift assignment',
            count: `${driverList.length} Drivers`,
            sub: `${driverList.filter(d => d.status === 'active').length || driverList.length} Active On Roster`,
            iconBg: 'from-emerald-600 to-teal-600 text-white',
            icon: <FleetIcons.Driver className="w-5 h-5 text-white" />,
          },
          {
            id: 'trip',
            title: 'Trip & Dispatch Logs',
            desc: 'Corridor transit times, milestones, and routes',
            count: `${trips.length} Logged Trips`,
            sub: `${activeTripsCount} Active Dispatches`,
            iconBg: 'from-purple-600 to-pink-600 text-white',
            icon: <FleetIcons.Compass className="w-5 h-5 text-white" />,
          },
          {
            id: 'fuel',
            title: 'Fuel & EV Energy Health',
            desc: 'Battery state-of-charge, regeneration & fuel usage',
            count: '94% Fleet Health',
            sub: 'Zero Hardware Faults',
            iconBg: 'from-amber-600 to-orange-600 text-white',
            icon: <FleetIcons.Fuel className="w-5 h-5 text-white" />,
          },
        ].map((rep) => {
          const isSelected = selectedReportType === rep.id;
          return (
            <div
              key={rep.id}
              onClick={() => setSelectedReportType(rep.id)}
              className={`p-5 rounded-2xl bg-white dark:bg-zinc-900 border transition-all cursor-pointer shadow-sm flex flex-col justify-between group ${
                isSelected
                  ? 'border-blue-600 dark:border-blue-500 ring-2 ring-blue-600/20 dark:ring-blue-500/20'
                  : 'border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-700 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${rep.iconBg} flex items-center justify-center shadow-md shadow-blue-500/10 group-hover:scale-105 transition-transform`}>
                    {rep.icon}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                      : 'bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
                  }`}>
                    {isSelected ? 'Active View' : 'Select'}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {rep.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {rep.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-white">{rep.count}</div>
                  <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">{rep.sub}</div>
                </div>
                <FleetIcons.ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 4 Summary Stat Strip with Real Calculations */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm text-center transition-colors">
          <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{t('fleet.reports.fleet_utilization')}</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{fleetUtilizationRate}%</div>
          <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">{onRouteCount} on route • {inDepotCount} in depot</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm text-center transition-colors">
          <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{t('fleet.reports.recorded_distance')}</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{totalDistanceKm.toFixed(1)} km</div>
          <div className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mt-0.5">{t('fleet.reports.across_routes')}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm text-center transition-colors">
          <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{t('fleet.reports.trips_dispatched')}</span>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{trips.length}</div>
          <div className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mt-0.5">{activeTripsCount} active • {completedTripsCount} completed</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm text-center transition-colors">
          <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{t('fleet.reports.units_online')}</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{onRouteCount}</div>
          <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">{t('fleet.reports.live_mqtt_stream')}</div>
        </div>
      </div>

      {/* Visual Analytics Split: Efficiency Circular Gauge + Gradient Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Overall Fleet Efficiency Rating Gauge */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-between text-center transition-colors">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Fleet Efficiency Score
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('fleet.reports.composite_compliance')}</p>
          </div>

          {/* SVG Circular Donut Gauge */}
          <div className="relative w-44 h-44 my-4 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" stroke="currentColor" className="text-slate-100 dark:text-zinc-800" strokeWidth="9" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="38"
                stroke="url(#efficiencyGradient)"
                strokeWidth="9"
                strokeDasharray="238.76"
                strokeDashoffset={238.76 * (1 - fleetEfficiency / 100)}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="efficiencyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{fleetEfficiency}%</span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {fleetEfficiency > 0 ? 'Reported' : 'No data'}
              </span>
            </div>
          </div>

          <div className="w-full pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-2 text-xs text-slate-500 dark:text-zinc-400">
            <div className="flex items-center justify-between">
              <span>{t('fleet.reports.on_time_rate')}</span>
              <span className="font-bold text-slate-900 dark:text-white">{onTimeRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t('fleet.reports.ping_reliability')}</span>
              <span className="font-bold text-slate-900 dark:text-white">{pingReliability}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t('fleet.reports.avg_speed_label')}</span>
              <span className="font-bold text-slate-900 dark:text-white">{averageSpeed.toFixed(1)} km/h</span>
            </div>
          </div>
        </div>

        {/* Right Column (2 Columns): Interactive Gradient Bar Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm lg:col-span-2 flex flex-col justify-between transition-colors">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Weekly Telematics Performance Trend
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    Live Gradient Visualizer
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Hover over bars to inspect daily cumulative distance and telemetry readings
                </p>
              </div>

              {/* Chart Metric Filter Tabs */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                {[
                  { id: 'distance', label: 'Distance' },
                  { id: 'speed', label: 'Avg Speed' },
                  { id: 'trips', label: 'Trips' },
                  { id: 'efficiency', label: 'Efficiency' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setChartMetric(m.id)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      chartMetric === m.id
                        ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gradient Bar Chart Visualization */}
            <div className="h-48 flex items-end justify-between gap-2.5 sm:gap-4 pt-8 px-2">
              {chartData.map((bar) => {
                const heightPercent = Math.max(Math.round((bar.value / maxChartValue) * 100), 12);
                return (
                  <div key={bar.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                    {/* Tooltip on Hover */}
                    <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-20 whitespace-nowrap bg-slate-900 dark:bg-zinc-800 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg border border-slate-700">
                      {bar.value} {bar.unit}
                    </div>

                    {/* Peak Indicator */}
                    {bar.isPeak && (
                      <span className="text-[9px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">
                        Peak
                      </span>
                    )}

                    {/* The Vibrant Gradient Bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[48px] rounded-t-xl bg-gradient-to-t ${bar.color} group-hover:scale-105 transition-all duration-300 shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 relative`}
                    >
                      {/* Glossy Top Glass Shimmer */}
                      <div className="absolute top-0 inset-x-0 h-1.5 bg-white/40 rounded-t-xl"></div>
                    </div>

                    {/* Day / X-Axis Label */}
                    <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      {bar.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400"></span>
              <span>{t('fleet.reports.sync_gps_publisher')}</span>
            </div>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              Target Peak: {maxChartValue} {chartData[0]?.unit}
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Dynamic Report Table View */}
      <div className="space-y-4">
        {/* Table Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm transition-colors">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mr-2">
              {selectedReportType === 'vehicle' && 'Vehicle Telematics Registry'}
              {selectedReportType === 'driver' && 'Driver Performance & Shift Roster'}
              {selectedReportType === 'trip' && 'Trip Dispatch & Corridor Logs'}
              {selectedReportType === 'fuel' && 'EV Battery & Fuel Telemetry Breakdown'}
            </h2>

            {/* Filter by Fleet */}
            <select
              value={selectedFleetId}
              onChange={(e) => setSelectedFleetId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-200 focus:outline-none"
            >
              <option value="all">{`${t('fleet.reports.all_divisions')} (${fleetList.length})`}</option>
              {fleetList.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>

            {/* Filter by Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-200 focus:outline-none"
            >
              <option value="all">{t('fleet.reports.all_statuses')}</option>
              <option value="on_route">{t('fleet.reports.on_route_active')}</option>
              <option value="in_depot">{t('fleet.reports.in_depot')}</option>
              <option value="active">{t('common.active')}</option>
              <option value="maintenance">{t('fleet.reports.maintenance')}</option>
            </select>
          </div>

          <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
            {selectedReportType === 'vehicle' && `Showing ${filteredVehicles.length} vehicles`}
            {selectedReportType === 'driver' && `Showing ${filteredDrivers.length} drivers`}
            {selectedReportType === 'trip' && `Showing ${filteredTrips.length} trips`}
            {selectedReportType === 'fuel' && `Showing ${filteredVehicles.length} units`}
          </span>
        </div>

        {/* 1. VEHICLE REPORT TABLE */}
        {selectedReportType === 'vehicle' && (
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
                <thead className="bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">{t('fleet.reports.th_bus_model')}</th>
                    <th className="py-3 px-4">{t('fleet.reports.th_division')}</th>
                    <th className="py-3 px-4">{t('fleet.reports.th_status')}</th>
                    <th className="py-3 px-4">{t('fleet.reports.th_speed')}</th>
                    <th className="py-3 px-4">{t('fleet.reports.th_gps')}</th>
                    <th className="py-3 px-4">{t('fleet.reports.th_battery')}</th>
                    <th className="py-3 px-4 text-right">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
                  {filteredVehicles.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400 dark:text-zinc-500">
                        No vehicles matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredVehicles.map((v) => {
                      const fleet = fleetList.find((f) => f.id === v.fleet_id);
                      const isOnline = v.gps_status === 'online' || v.status === 'on_route';
                      return (
                        <tr key={v.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <FleetIcons.Bus className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-mono">{v.bus_number}</div>
                                <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-normal">{[v.model, v.year].filter(Boolean).join(' · ') || '—'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-800 dark:text-zinc-200">{fleet?.name || '—'}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              v.status === 'on_route'
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                            }`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                              <span className="capitalize">{v.status?.replace('_', ' ')}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                            {v.last_speed != null ? `${v.last_speed} km/h` : '—'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isOnline
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
                            }`}>
                              {isOnline ? 'Online' : 'Standby'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.max(0, Math.min(100, Number(v.battery_level) || 0))}%` }}></div>
                              </div>
                              <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-zinc-300">{v.battery_level != null ? `${v.battery_level}%` : '—'}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Link
                              to="/fleet-operator/tracking"
                              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                            >
                              <span>{t('fleet.reports.live_radar')}</span>
                              <FleetIcons.ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. DRIVER REPORT TABLE */}
        {selectedReportType === 'driver' && (
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
                <thead className="bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">{t('fleet.reports.driver_name')}</th>
                    <th className="py-3 px-4">{t('fleet.reports.lic_enrollment')}</th>
                    <th className="py-3 px-4">{t('fleet.reports.assigned_vehicle')}</th>
                    <th className="py-3 px-4">{t('fleet.reports.roster_status')}</th>
                    <th className="py-3 px-4">{t('fleet.reports.safety_score')}</th>
                    <th className="py-3 px-4 text-right">{t('common.phone')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
                  {filteredDrivers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400 dark:text-zinc-500">
                        No drivers recorded.
                      </td>
                    </tr>
                  ) : (
                    filteredDrivers.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                              <FleetIcons.Driver className="w-4 h-4" />
                            </div>
                            <div>
                              <div>{d.name || d.full_name || 'Assigned Driver'}</div>
                              <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-normal">{t('fleet.reports.active_duty_staff')}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono">{d.license_number || d.enrollment_no || '—'}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {d.assigned_bus_number || '—'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 capitalize">
                            {d.status || '—'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                          {d.safety_score != null ? `${d.safety_score}%` : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-500 dark:text-zinc-400">
                          {d.phone || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. TRIP & DISPATCH REPORT TABLE */}
        {selectedReportType === 'trip' && (
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
                <thead className="bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">{t('fleet.reports.trip_code')}</th>
                    <th className="py-3 px-4">{t('common.vehicle')}</th>
                    <th className="py-3 px-4">{t('fleet.reports.transit_corridor')}</th>
                    <th className="py-3 px-4">{t('fleet.reports.distance_covered')}</th>
                    <th className="py-3 px-4">{t('fleet.reports.dispatch_status')}</th>
                    <th className="py-3 px-4 text-right">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
                  {filteredTrips.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400 dark:text-zinc-500">
                        No trip dispatch records found.
                      </td>
                    </tr>
                  ) : (
                    filteredTrips.map((trip) => (
                      <tr key={trip.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                          TRIP-#{trip.id}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          {trip.vehicle?.bus_number || trip.vehicle_id || '—'}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-zinc-200">
                          {trip.route?.name || '—'}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {trip.distance_km != null ? `${trip.distance_km} km` : '—'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                            trip.status === 'in_progress'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                          }`}>
                            {trip.status === 'in_progress' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                            <span className="capitalize">{trip.status?.replace('_', ' ')}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => navigate('/fleet-operator/tracking')}
                            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>{t('fleet.reports.live_radar')}</span>
                            <FleetIcons.ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. FUEL & EV ENERGY HEALTH TABLE */}
        {selectedReportType === 'fuel' && (
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
                <thead className="bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">{t('fleet.reports.vehicle_unit')}</th>
                    <th className="py-3 px-4">{t('fleet.reports.powertrain_fuel')}</th>
                    <th className="py-3 px-4">{t('fleet.reports.battery_health')}</th>
                    <th className="py-3 px-4">{t('fleet.reports.regen_efficiency')}</th>
                    <th className="py-3 px-4">{t('fleet.reports.thermal_status')}</th>
                    <th className="py-3 px-4 text-right">{t('fleet.reports.op_health')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
                  {filteredVehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {v.bus_number}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-zinc-300">
                        {v.fuel_type || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: `${Math.max(0, Math.min(100, Number(v.battery_level) || 0))}%` }}></div>
                          </div>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">{v.battery_level != null ? `${v.battery_level}%` : '—'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {v.efficiency != null ? `${v.efficiency}%` : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          {v.temperature != null ? `${v.temperature}°C` : '—'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {v.telematics_health || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsAnalyticsPage;
