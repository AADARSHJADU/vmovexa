import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import { useSuperTechnician } from '../../hooks/superadmin/useSuperTechnician';
import { useOrganization } from '../../hooks/superadmin/useOrganization';
import { fleetManagerService } from '../../api/services/fleet/fleet.service';
import { fleetVehicleService } from '../../api/services/fleet/vehicle.service';
import { googleApisService } from '../../api/services/googleApis.service';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import toast from 'react-hot-toast';
import {
  formatDisplayValue,
} from '../../features/workOrders/workOrderPresentation';

const SLA_PRESETS = [
  { hours: 2, label: '2 Hours (Emergency Grounded Bus)' },
  { hours: 4, label: '4 Hours (Critical / Rapid Response)' },
  { hours: 24, label: '24 Hours (Standard Maintenance)' },
  { hours: 48, label: '48 Hours (Scheduled Maintenance)' },
];

const ETA_PRESETS = [
  'Within 1 Hour',
  'Within 2 Hours',
  'Today by 5:00 PM',
  'Tomorrow 10:00 AM',
];

const toCoordinate = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const haversineDistanceKm = (origin, destination) => {
  if (!origin || !destination) return null;
  const earthRadiusKm = 6371;
  const toRad = (degrees) => (degrees * Math.PI) / 180;
  const latDelta = toRad(destination.latitude - origin.latitude);
  const lngDelta = toRad(destination.longitude - origin.longitude);
  const a = Math.sin(latDelta / 2) ** 2
    + Math.cos(toRad(origin.latitude)) * Math.cos(toRad(destination.latitude))
    * Math.sin(lngDelta / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatAddress = (source, fallback = 'Address not saved') => {
  if (!source) return fallback;
  const parts = [source.address, source.city || source.base_city, source.state, source.pincode]
    .map((part) => String(part || '').trim())
    .filter(Boolean);
  return [...new Set(parts)].join(', ') || fallback;
};

export const AssignTechnicianPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const orderId = id || searchParams.get('workOrderId') || searchParams.get('orderId');
  const initialTechId = searchParams.get('technicianId') || searchParams.get('techId');

  const {
    centralTechnicians,
    loadCentralTechnicians,
    dispatchWorkOrder,
    assignWorkOrder,
    loadWorkOrderDetail,
  } = useSuperTechnician();
  const { organizations, loadOrganizations } = useOrganization();

  // Mode: Existing Work Order vs New Dispatch
  const [existingOrder, setExistingOrder] = useState(null);

  // Dependent Cascade Selections
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [fleetsList, setFleetsList] = useState([]);
  const [loadingFleets, setLoadingFleets] = useState(false);
  const [selectedFleetId, setSelectedFleetId] = useState('');

  const [vehiclesList, setVehiclesList] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  // Form Fields
  const [selectedTechId, setSelectedTechId] = useState(initialTechId ? String(initialTechId) : '');
  const [issueCategory, setIssueCategory] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [slaHours, setSlaHours] = useState(24);
  const [customSlaDate, setCustomSlaDate] = useState('');
  const [useCustomSla, setUseCustomSla] = useState(false);
  const [eta, setEta] = useState('Within 2 Hours');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [roadMetrics, setRoadMetrics] = useState({});
  const [loadingRoadMetrics, setLoadingRoadMetrics] = useState(false);

  // Initial Load: Organizations and Available Central Technicians
  useEffect(() => {
    loadOrganizations({ limit: 100 }).catch(() => {});
    loadCentralTechnicians({ limit: 100, status: 'active', profileStatus: 'available' }).catch(() => {});
  }, [loadOrganizations, loadCentralTechnicians]);

  // Load existing work order if orderId is present
  useEffect(() => {
    if (orderId) {
      loadWorkOrderDetail(orderId)
        .then((data) => {
          if (data) {
            setExistingOrder(data);
            if (data.organization_id) setSelectedOrgId(String(data.organization_id));
            if (data.vehicle_id) setSelectedVehicleId(String(data.vehicle_id));
            if (data.issue_category) setIssueCategory(data.issue_category);
            if (data.urgency) setUrgency(data.urgency);
            if (data.description) setDescription(data.description);
            if (data.instructions) setInstructions(data.instructions);
            if (data.assigned_technician_id) setSelectedTechId(String(data.assigned_technician_id));
            if (data.eta) setEta(data.eta);
          }
        })
        .catch(() => {
          toast.error('Failed to load existing work order details.');
        })
    }
  }, [orderId, loadWorkOrderDetail]);

  // Cascade Step 1: Organization selection changes -> clear fleet & vehicle, load fleets
  const handleOrgChange = useCallback((orgId) => {
    setSelectedOrgId(orgId);
    setSelectedFleetId('');
    setFleetsList([]);
    setSelectedVehicleId('');
    setVehiclesList([]);

    if (orgId) {
      setLoadingFleets(true);
      fleetManagerService
        .getFleets({ organizationId: orgId, limit: 100 })
        .then((res) => {
          const rows = Array.isArray(res) ? res : res?.rows || res?.data || [];
          setFleetsList(rows);
        })
        .catch(() => {
          setFleetsList([]);
        })
        .finally(() => setLoadingFleets(false));

      // Also load vehicles for this organization directly so user can choose even if no fleet filter
      setLoadingVehicles(true);
      fleetVehicleService
        .getVehicles({ organizationId: orgId, limit: 100 })
        .then((res) => {
          const rows = Array.isArray(res) ? res : res?.rows || res?.data || [];
          setVehiclesList(rows);
        })
        .catch(() => {
          setVehiclesList([]);
        })
        .finally(() => setLoadingVehicles(false));
    }
  }, []);

  // Cascade Step 2: Fleet selection changes -> filter vehicles by fleet
  const handleFleetChange = useCallback((fleetId) => {
    setSelectedFleetId(fleetId);
    setSelectedVehicleId('');

    if (selectedOrgId) {
      setLoadingVehicles(true);
      const params = { organizationId: selectedOrgId, limit: 100 };
      if (fleetId) params.fleetId = fleetId;

      fleetVehicleService
        .getVehicles(params)
        .then((res) => {
          const rows = Array.isArray(res) ? res : res?.rows || res?.data || [];
          setVehiclesList(rows);
        })
        .catch(() => {
          setVehiclesList([]);
        })
        .finally(() => setLoadingVehicles(false));
    }
  }, [selectedOrgId]);

  // Selected Vehicle Object
  const selectedVehicle = useMemo(() => {
    if (existingOrder?.vehicle && String(existingOrder.vehicle_id) === String(selectedVehicleId)) {
      return existingOrder.vehicle;
    }
    return vehiclesList.find((v) => String(v.id) === String(selectedVehicleId)) || null;
  }, [existingOrder, selectedVehicleId, vehiclesList]);

  const targetDepot = existingOrder?.depot || selectedVehicle?.depot || null;
  const targetLocation = useMemo(() => {
    const latitude = toCoordinate(targetDepot?.latitude);
    const longitude = toCoordinate(targetDepot?.longitude);
    if (latitude == null || longitude == null) return null;
    return { latitude, longitude };
  }, [targetDepot?.latitude, targetDepot?.longitude]);

  // Derived authoritative bus & depot
  const derivedBusNumber = formatDisplayValue(
    existingOrder?.bus_number ||
    existingOrder?.vehicle?.bus_number ||
    selectedVehicle?.bus_number ||
    selectedVehicle?.registration_number
  );
  const derivedDepotName = formatDisplayValue(
    existingOrder?.depot_name ||
    existingOrder?.depot?.name ||
    selectedVehicle?.depot?.name ||
    selectedVehicle?.depot_name
  );

  const orgsList = Array.isArray(organizations) ? organizations : (organizations?.rows || []);
  const techsList = useMemo(
    () => (Array.isArray(centralTechnicians) ? centralTechnicians : []),
    [centralTechnicians]
  );

  const rankedTechnicians = useMemo(() => techsList
    .map((technician) => {
      const profile = technician.technicianProfile || {};
      const latitude = toCoordinate(profile.latitude ?? technician.latitude);
      const longitude = toCoordinate(profile.longitude ?? technician.longitude);
      const coordinates = latitude != null && longitude != null ? { latitude, longitude } : null;
      return {
        technician,
        profile,
        coordinates,
        distanceKm: targetLocation && coordinates
          ? haversineDistanceKm(targetLocation, coordinates)
          : null,
        address: formatAddress({
          address: profile.address || technician.address,
          city: profile.city || technician.city,
          base_city: profile.base_city,
          state: profile.state || technician.state,
          pincode: profile.pincode || technician.pincode,
        }),
      };
    })
    .sort((a, b) => {
      if (a.distanceKm == null && b.distanceKm == null) return String(a.technician.name || '').localeCompare(String(b.technician.name || ''));
      if (a.distanceKm == null) return 1;
      if (b.distanceKm == null) return -1;
      return a.distanceKm - b.distanceKm;
    }), [techsList, targetLocation]);

  // Use inexpensive straight-line distance to rank everyone, then ask Google
  // Routes for traffic-aware road distance/ETA only for the nearest three.
  useEffect(() => {
    let cancelled = false;
    const nearest = rankedTechnicians.filter((item) => item.coordinates).slice(0, 3);
    if (!targetLocation || nearest.length === 0) {
      return () => { cancelled = true; };
    }

    const loadRoadMetrics = async () => {
      await Promise.resolve();
      if (!cancelled) setLoadingRoadMetrics(true);
      const entries = await Promise.all(nearest.map(async (item) => {
      try {
        const response = await googleApisService.demoRoutes({
          origin: item.coordinates,
          destination: targetLocation,
          travelMode: 'DRIVE',
        });
        const data = response?.data || response;
        if (!data?.distanceKm || Number(data.distanceKm) <= 0) return null;
        return [String(item.technician.id), {
          distanceKm: Number(data.distanceKm),
          durationMinutes: Number(data.durationMinutes) || null,
        }];
      } catch {
        return null;
      }
      }));
      if (!cancelled) setRoadMetrics(Object.fromEntries(entries.filter(Boolean)));
      if (!cancelled) setLoadingRoadMetrics(false);
    };
    loadRoadMetrics();

    return () => { cancelled = true; };
  }, [rankedTechnicians, targetLocation]);

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!orderId && !selectedOrgId) {
      toast.error('Please select an organization.');
      return;
    }
    if (!orderId && !selectedVehicleId) {
      toast.error('Please select a target transit vehicle.');
      return;
    }
    if (!selectedTechId) {
      toast.error('Please select an available central technician.');
      return;
    }
    if (!issueCategory.trim()) {
      toast.error('Please enter the issue category.');
      return;
    }

    // Calculate authoritative SLA timestamp
    let computedSlaDueAt;
    if (useCustomSla && customSlaDate) {
      computedSlaDueAt = new Date(customSlaDate).toISOString();
    } else {
      computedSlaDueAt = new Date(Date.now() + Number(slaHours) * 3600000).toISOString();
    }

    setSubmitting(true);
    try {
      if (orderId) {
        // Mode A: Assigning existing work order
        await toast.promise(
          assignWorkOrder(orderId, {
            technicianId: Number(selectedTechId),
            slaDueAt: computedSlaDueAt,
            eta: eta.trim() || undefined,
            instructions: instructions.trim() || undefined,
          }),
          {
            loading: 'Assigning technician to work order...',
            success: 'Technician successfully assigned!',
            error: (err) => err?.message || 'Assignment failed. Please try again.',
          }
        );
      } else {
        // Mode B: Atomic create and dispatch
        const payload = {
          organizationId: Number(selectedOrgId),
          fleetId: selectedFleetId ? Number(selectedFleetId) : undefined,
          vehicleId: Number(selectedVehicleId),
          issueCategory: issueCategory.trim(),
          urgency,
          description: description.trim() || undefined,
          instructions: instructions.trim() || undefined,
          technicianId: Number(selectedTechId),
          slaDueAt: computedSlaDueAt,
          eta: eta.trim() || undefined,
        };

        await toast.promise(
          dispatchWorkOrder(payload),
          {
            loading: 'Creating and atomically dispatching work order...',
            success: 'Work order successfully dispatched!',
            error: (err) => err?.message || 'Dispatch failed. Please check entity availability.',
          }
        );
      }

      navigate('/superadmin/technicians/assign?tab=work-orders');
    } catch {
      // Error handled by toast.promise
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-16 min-w-0 max-w-full">
      {/* 1. Header with Breadcrumb */}
      <div className="p-4 sm:p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
        <Breadcrumb
          items={[
            { label: 'SuperAdmin', path: '/superadmin/dashboard' },
            { label: 'Technician Assignments', path: '/superadmin/technicians/assign' },
            { label: orderId ? `Assign Order #${orderId}` : 'New Work Order Dispatch' },
          ]}
          className="mb-2"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {orderId ? `Assign Technician to Work Order #${orderId}` : 'Create & Dispatch Technician Work Order'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
              {orderId
                ? 'Assign an available central technician to this pending transit repair request.'
                : 'Atomic work order dispatch with server-derived vehicle and depot validation.'}
            </p>
          </div>

          <Link
            to="/superadmin/technicians/assign"
            className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl transition-all shadow-2xs inline-flex items-center gap-1.5 self-start sm:self-auto"
          >
            <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </Link>
        </div>
      </div>

      {/* 2. Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Entity Cascade (Organization -> Fleet -> Vehicle) */}
        <div className="p-5 sm:p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-200 dark:border-blue-800">
                1
              </span>
              <span>Target Transit Asset & Organization Scope</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Select tenant organization, optional fleet operator filter, and target vehicle.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Organization */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Organization <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedOrgId}
                onChange={(e) => handleOrgChange(e.target.value)}
                disabled={Boolean(orderId)}
                className="w-full px-3 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed"
                required
              >
                <option value="">-- Select Organization --</option>
                {existingOrder && existingOrder.organization_id && !orgsList.some(o => String(o.id) === String(existingOrder.organization_id)) && (
                  <option value={existingOrder.organization_id}>
                    {existingOrder.organization?.name || `Organization #${existingOrder.organization_id}`}
                  </option>
                )}
                {orgsList.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} (#{org.id})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Fleet (Optional Filter) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Fleet Filter <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <select
                value={selectedFleetId}
                onChange={(e) => handleFleetChange(e.target.value)}
                disabled={!selectedOrgId || Boolean(orderId) || loadingFleets}
                className="w-full px-3 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loadingFleets ? 'Loading fleets...' : '-- All Fleets in Org --'}
                </option>
                {fleetsList.map((fleet) => (
                  <option key={fleet.id} value={fleet.id}>
                    {fleet.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Vehicle */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Target Vehicle <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                disabled={!selectedOrgId || Boolean(orderId) || loadingVehicles}
                className="w-full px-3 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed"
                required
              >
                <option value="">
                  {loadingVehicles ? 'Loading vehicles...' : '-- Select Vehicle --'}
                </option>
                {existingOrder && existingOrder.vehicle_id && (
                  <option value={existingOrder.vehicle_id}>
                    {existingOrder.bus_number || existingOrder.vehicle?.bus_number || existingOrder.vehicle?.registration_number || `Vehicle #${existingOrder.vehicle_id}`}
                  </option>
                )}
                {vehiclesList.map((veh) => (
                  <option key={veh.id} value={veh.id}>
                    {veh.bus_number || veh.registration_number || `Vehicle #${veh.id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Authoritative Derived Card */}
          {selectedVehicleId && (
            <div className="p-4 bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 block">
                  Authoritative Bus Number
                </span>
                <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">
                  {derivedBusNumber}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 block">
                  Authoritative Depot Hub
                </span>
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {derivedDepotName}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 block">
                  Vehicle ID
                </span>
                <span className="font-mono text-slate-600 dark:text-zinc-400 font-bold">
                  #{selectedVehicleId}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Technician Selection */}
        <div className="p-5 sm:p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-200 dark:border-emerald-800">
                2
              </span>
              <span>Central Pool Field Technician</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Select an available technician with ROLE-CENTRAL-TECH credentials.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
              Technician <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedTechId}
              onChange={(e) => setSelectedTechId(e.target.value)}
              className="w-full px-3 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            >
              <option value="">-- Select Available Technician --</option>
              {rankedTechnicians.map(({ technician: t, profile }) => {
                const st = profile.status || t.status || 'available';
                const city = profile.city || profile.base_city || t.city;
                return (
                  <option key={t.id} value={t.id}>
                    {t.name} ({st.toUpperCase()}) — {city ? `${city}` : 'Central Pool'} (ID: #{t.id})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-3.5 bg-slate-50 dark:bg-zinc-950/60 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-black text-slate-400 dark:text-zinc-500">Work location</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{targetDepot?.name || derivedDepotName}</p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  {formatAddress(targetDepot, selectedVehicleId ? 'Depot address not saved' : 'Select a vehicle to calculate nearby technicians')}
                </p>
              </div>
              {targetLocation ? (
                <a href={`https://www.google.com/maps/search/?api=1&query=${targetLocation.latitude},${targetLocation.longitude}`} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap">
                  Open work location ↗
                </a>
              ) : selectedVehicleId ? (
                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">Depot GPS coordinates missing</span>
              ) : null}
            </div>

            <div className="p-3.5 space-y-2.5 bg-white dark:bg-zinc-900">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white">Nearest available technicians</h3>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">Sorted by saved GPS; Google road distance and ETA are checked for the nearest matches.</p>
                </div>
                {loadingRoadMetrics && <span className="text-[10px] font-bold text-blue-600 animate-pulse whitespace-nowrap">Checking routes…</span>}
              </div>

              {!selectedVehicleId ? (
                <p className="text-xs text-slate-500 dark:text-zinc-400 py-3">Select the target vehicle first to get location-based suggestions.</p>
              ) : rankedTechnicians.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-zinc-400 py-3">No active and available technicians found.</p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
                  {rankedTechnicians.map((item, index) => {
                    const tech = item.technician;
                    const road = targetLocation ? roadMetrics[String(tech.id)] : null;
                    const isSelected = String(selectedTechId) === String(tech.id);
                    const isRecommended = index === 0 && item.distanceKm != null;
                    return (
                      <button key={tech.id} type="button" onClick={() => setSelectedTechId(String(tech.id))} className={`p-3 rounded-xl border text-left transition-all ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-800 bg-white dark:bg-zinc-900'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-black text-slate-900 dark:text-white">{tech.name}</span>
                              {isRecommended && <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[9px] font-black uppercase">Nearest suggestion</span>}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2">{item.address}</p>
                            <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">{item.profile.cert_level || 'Central Technician'}</p>
                          </div>
                          <div className="text-right shrink-0">
                            {road ? (
                              <>
                                <div className="text-xs font-black text-blue-600 dark:text-blue-400">{road.distanceKm.toFixed(1)} km</div>
                                <div className="text-[10px] text-slate-500 dark:text-zinc-400">~{road.durationMinutes || '—'} min drive</div>
                              </>
                            ) : item.distanceKm != null ? (
                              <>
                                <div className="text-xs font-black text-slate-800 dark:text-zinc-200">{item.distanceKm.toFixed(1)} km</div>
                                <div className="text-[9px] text-slate-400">straight-line</div>
                              </>
                            ) : <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400">GPS missing</span>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 3: Work Order Details & SLA */}
        <div className="p-5 sm:p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs border border-purple-200 dark:border-purple-800">
                3
              </span>
              <span>Issue Classification, SLA & Instructions</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Issue Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Issue Category <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={issueCategory}
                onChange={(e) => setIssueCategory(e.target.value)}
                placeholder="e.g. GPS / Telematics Unit Offline"
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Urgency Level <span className="text-rose-500">*</span>
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              >
                <option value="critical">Critical / Grounded Bus</option>
                <option value="high">High Priority</option>
                <option value="normal">Normal Maintenance</option>
                <option value="low">Low Priority / Routine</option>
              </select>
            </div>

            {/* SLA Due */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  SLA Target Window <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setUseCustomSla(!useCustomSla)}
                  className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  {useCustomSla ? 'Use Presets' : 'Custom Date/Time'}
                </button>
              </div>

              {useCustomSla ? (
                <input
                  type="datetime-local"
                  value={customSlaDate}
                  onChange={(e) => setCustomSlaDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required={useCustomSla}
                />
              ) : (
                <select
                  value={slaHours}
                  onChange={(e) => setSlaHours(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {SLA_PRESETS.map((p) => (
                    <option key={p.hours} value={p.hours}>
                      {p.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Target ETA */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Target ETA / On-Site Window
              </label>
              <input
                type="text"
                list="etaList"
                value={eta}
                onChange={(e) => setEta(e.target.value)}
                placeholder="e.g. Within 2 Hours"
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <datalist id="etaList">
                {ETA_PRESETS.map((p, idx) => (
                  <option key={idx} value={p} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
              Issue Description <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe symptoms, vehicle status, error codes..."
              className="w-full p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
              Technician Field Instructions <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Special safety precautions, depot contact gate pass instructions..."
              className="w-full p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* 4. Action Buttons */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <Link
            to="/superadmin/technicians/assign"
            className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Assignments</span>
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <FleetIcons.Check className="w-4 h-4" />
            <span>{submitting ? 'Dispatching...' : orderId ? 'Assign Technician' : 'Dispatch Work Order'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignTechnicianPage;
