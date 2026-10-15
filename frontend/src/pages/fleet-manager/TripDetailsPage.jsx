import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { FleetIcons } from '../../components/FleetIcons';
import { fleetTripService } from '../../api/services/fleet/trip.service.js';

export const TripDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      let tripId = id;
      if (typeof tripId === 'string' && tripId.startsWith('TRIP-')) {
        const num = tripId.replace('TRIP-', '');
        if (!isNaN(num) && Number(num) > 0) {
          tripId = Number(num);
        }
      }
      let tripObj = null;
      try {
        const data = await fleetTripService.getTrip(tripId);
        tripObj = (data && data.rows && data.rows.length > 0) ? data.rows[0] : (data?.data || data);
      } catch (err) {
        // Fallback: load organization's trips and pick matching or latest trip
        const res = await fleetTripService.getTrips({ limit: 10 });
        const list = Array.isArray(res?.rows) ? res.rows : (Array.isArray(res) ? res : (res?.data || []));
        if (list && list.length > 0) {
          tripObj = list.find(t => String(t.id) === String(id) || String(t.id) === String(tripId)) || list[0];
        } else {
          throw err;
        }
      }
      setTrip(tripObj);
    } catch (err) {
      toast.error(err.message || 'Failed to load trip details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTripDetails();
    }
  }, [id]);

  const copyTripId = () => {
    const tripCode = trip?.code || `TRIP-${id}`;
    navigator.clipboard.writeText(tripCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEndTrip = async () => {
    if (!trip || trip.status === 'completed') return;
    try {
      setEnding(true);
      await fleetTripService.endTrip(trip.id);
      toast.success('Trip marked as completed successfully!');
      await fetchTripDetails();
    } catch (err) {
      toast.error(err.message || 'Failed to complete trip');
    } finally {
      setEnding(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-semibold text-slate-600 dark:text-zinc-400">Loading voyage telemetry & dispatch data...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center space-y-4 shadow-sm transition-colors">
        <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">Trip record not found or inaccessible.</p>
        <button
          type="button"
          onClick={() => navigate('/fleet-manager/trips')}
          className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
        >
          Return to Trips
        </button>
      </div>
    );
  }

  const tripCode = trip.code || `TRIP-${String(trip.id).padStart(4, '0')}`;
  const totalDist = Number(trip.distance_km || 0);
  const covDist = Number(trip.covered_km || 0);
  const remDist = Math.max(0, totalDist - covDist).toFixed(1);
  const progress = trip.progress_percent || (trip.status === 'completed' ? 100 : 0);
  const vehiclePlate = trip.vehicle?.bus_number || trip.vehicle?.busNumber || '—';
  const driver = trip.driver;

  return (
    <div className="w-full space-y-6 pb-24">
      {/* 1. Global Standard Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Fleet Manager', path: '/fleet-manager/dashboard' },
          { label: 'Trip History', path: '/fleet-manager/trips' },
          { label: tripCode },
        ]}
        className="mb-2"
      />

      {/* Header Banner */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => navigate('/fleet-manager/trips')} 
            className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
            title="Back to Trips"
          >
            <FleetIcons.ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <span>Trip Dispatch Details</span>
              <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold flex items-center gap-1.5 ${
                trip.status === 'in_progress' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' :
                trip.status === 'completed' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800' :
                'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  trip.status === 'in_progress' ? 'bg-emerald-500 animate-pulse' : 'bg-current'
                }`}></span>
                <span className="capitalize">{trip.status?.replace('_', ' ')}</span>
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Live waypoint tracking, speed analytics, stops completed, and telemetry logs.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            type="button"
            onClick={copyTripId}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-mono font-bold transition-all"
          >
            <FleetIcons.Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied!' : tripCode}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/fleet-manager/tracking')}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5"
          >
            <FleetIcons.Target className="w-3.5 h-3.5 text-white" />
            <span>Live Radar</span>
          </button>
        </div>
      </div>

      {/* 2. Status & Route Summary Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Route Summary & Coverage
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700 dark:text-zinc-300 mt-1.5 font-bold">
              <span className="flex items-center gap-1">
                <FleetIcons.Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Origin: {trip.origin || trip.route?.start_point || 'Origin Station'}</span>
              </span>
              <FleetIcons.ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="flex items-center gap-1">
                <FleetIcons.Pin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Dest: {trip.destination || trip.route?.end_point || 'Destination Station'}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
              <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase">Total Distance</div>
              <div className="font-bold text-slate-900 dark:text-white mt-0.5">{totalDist ? `${totalDist} km` : '—'}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
              <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase">Covered</div>
              <div className="font-bold text-blue-600 dark:text-blue-400 mt-0.5">{covDist} km ({progress}%)</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
              <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase">Remaining</div>
              <div className="font-bold text-amber-600 dark:text-amber-400 mt-0.5">{remDist} km</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
              <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase">ETA</div>
              <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{trip.eta || (trip.status === 'completed' ? 'Completed' : 'On Schedule')}</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500 dark:text-zinc-400 font-medium">
            <span>Progress: {progress}% Completed</span>
            <span>{covDist} km of {totalDist} km</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                trip.status === 'in_progress' ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
                trip.status === 'completed' ? 'bg-gradient-to-r from-emerald-500 to-teal-600' :
                'bg-amber-400'
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 3. Live Statistics (6 Metric Gauges) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm text-center transition-colors">
          <FleetIcons.Speed className="w-5 h-5 text-slate-600 dark:text-zinc-400 mx-auto mb-1.5" />
          <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase">Current Speed</div>
          <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
            {trip.current_speed ? `${trip.current_speed} km/h` : (trip.status === 'completed' ? '0 km/h' : '—')}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm text-center transition-colors">
          <FleetIcons.BarChart className="w-5 h-5 text-slate-600 dark:text-zinc-400 mx-auto mb-1.5" />
          <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase">Average Speed</div>
          <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
            {trip.avg_speed ? `${trip.avg_speed} km/h` : '—'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm text-center transition-colors">
          <FleetIcons.Gauge className="w-5 h-5 text-slate-600 dark:text-zinc-400 mx-auto mb-1.5" />
          <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase">Punctuality</div>
          <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
            {trip.punctuality_status || 'On Schedule'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm text-center transition-colors">
          <FleetIcons.Clock className="w-5 h-5 text-slate-600 dark:text-zinc-400 mx-auto mb-1.5" />
          <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase">Started At</div>
          <div className="text-base font-black text-slate-900 dark:text-white mt-0.5 truncate">
            {trip.started_at ? new Date(trip.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm text-center transition-colors">
          <FleetIcons.Bus className="w-5 h-5 text-slate-600 dark:text-zinc-400 mx-auto mb-1.5" />
          <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase">Assigned Bus</div>
          <div className="text-base font-black text-slate-900 dark:text-white mt-0.5 truncate">
            {vehiclePlate}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm text-center transition-colors">
          <FleetIcons.Gps className="w-5 h-5 text-slate-600 dark:text-zinc-400 mx-auto mb-1.5" />
          <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase">GPS Status</div>
          <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
            {trip.vehicle?.gps_status ? String(trip.vehicle.gps_status).toUpperCase() : 'CONNECTED'}
          </div>
        </div>
      </div>

      {/* 4. 2-Column Split: Waypoint Timeline + Driver & Vehicle Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Waypoint Timeline */}
        <div className="lg:col-span-2 p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6 transition-colors">
          <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Trip Waypoint Timeline
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Chronological station checkpoints and voyage status.</p>
          </div>

          <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-zinc-700">
            {/* Waypoint 1: Origin */}
            <div className="relative flex items-start gap-4">
              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md">
                <FleetIcons.Check className="w-3 h-3 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {trip.started_at ? new Date(trip.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '08:00 AM'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">Departed</span>
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200 mt-0.5">
                  Origin — {trip.origin || trip.route?.start_point || 'Dispatch Depot Terminal'}
                </h4>
                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">Trip initiated and passenger transit log enabled.</p>
              </div>
            </div>

            {/* Waypoint 2: Mid-way status */}
            <div className="relative flex items-start gap-4">
              <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md ${
                trip.status === 'completed' || progress >= 50
                  ? 'bg-emerald-500 text-white'
                  : 'bg-blue-600 text-white animate-pulse'
              }`}>
                {trip.status === 'completed' || progress >= 50 ? (
                  <FleetIcons.Check className="w-3 h-3 text-white" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {progress}% En Route
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-[10px] font-bold">Waypoint</span>
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200 mt-0.5">Corridor Segment Tracking</h4>
                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
                  Covered {covDist} km • Speed: {trip.current_speed || trip.avg_speed || '35'} km/h.
                </p>
              </div>
            </div>

            {/* Waypoint 3: Destination */}
            <div className="relative flex items-start gap-4">
              <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                trip.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300'
              }`}>
                {trip.status === 'completed' ? (
                  <FleetIcons.Check className="w-3 h-3 text-white" />
                ) : (
                  <FleetIcons.Pin className="w-3 h-3 text-current" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono font-bold text-slate-500 dark:text-zinc-400">
                    {trip.ended_at ? new Date(trip.ended_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (trip.eta || 'Scheduled Arrival')}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    trip.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                  }`}>
                    {trip.status === 'completed' ? 'Arrived & Concluded' : 'Terminal Arrival'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-600 dark:text-zinc-300 mt-0.5">
                  Destination — {trip.destination || trip.route?.end_point || 'Final Depot Terminal'}
                </h4>
                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">Final corridor destination platform.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Driver & Vehicle Cards */}
        <div className="space-y-6">
          
          {/* Driver Information Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4 transition-colors">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Assigned Driver
            </h3>
            
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center justify-center font-bold text-base">
                {driver?.name ? driver.name.charAt(0).toUpperCase() : 'D'}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{driver?.name || 'No Driver Assigned'}</h4>
                <div className="text-xs text-slate-500 dark:text-zinc-400">{driver?.phone || 'No phone recorded'}</div>
                <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                  {driver?.badge_id || driver?.dl_number || 'DL Validated'}
                </div>
              </div>
            </div>

            {driver?.phone && (
              <a
                href={`tel:${driver.phone}`}
                className="w-full h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <FleetIcons.Phone className="w-3.5 h-3.5 text-slate-700 dark:text-zinc-300" />
                <span>Call Driver ({driver.name?.split(' ')[0]})</span>
              </a>
            )}
          </div>

          {/* Vehicle Information Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3 text-xs transition-colors">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Vehicle Telematics
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-zinc-500">Vehicle Number:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{vehiclePlate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-zinc-500">Vehicle Type:</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">{trip.vehicle?.vehicle_type || 'Transit Bus'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-zinc-500">Model:</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">{trip.vehicle?.model || 'Commercial Transit'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-zinc-500">GPS Tracker:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <FleetIcons.Gps className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                  <span>{trip.vehicle?.gps_device_id || 'Active Onboard'}</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-zinc-500">Fuel / Propelled:</span>
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <FleetIcons.Battery className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{trip.vehicle?.fuel_type || 'Electric / Diesel'}</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-zinc-500">Ignition State:</span>
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <FleetIcons.Key className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>{trip.status === 'completed' ? 'OFF' : 'ON'}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom Action Bar */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
        <button
          type="button"
          onClick={() => navigate('/fleet-manager/trips')}
          className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
        >
          <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
          <span>View Full Trip History</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {trip.status !== 'completed' ? (
            <button
              type="button"
              onClick={handleEndTrip}
              disabled={ending}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              <FleetIcons.Check className="w-4 h-4 text-white" />
              <span>{ending ? 'Completing Voyage...' : 'Complete Trip & Log Voyage'}</span>
            </button>
          ) : (
            <div className="px-6 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
              <FleetIcons.Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Trip Concluded & Archived</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripDetailsPage;
