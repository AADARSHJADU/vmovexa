import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAdminRoute } from '../../../hooks/admin/useAdminRoute';
import { LocationAutocompleteInput } from '../../../components/ui/LocationAutocompleteInput';
import { RouteMapViewer } from '../../../components/maps/RouteMapViewer';
import { Breadcrumb } from '../../../components/ui/Breadcrumb';
import { googleApisService } from '../../../api/services/googleApis.service';
import { FleetIcons } from '../../../components/FleetIcons';

export const AddRoutePage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { t } = useTranslation();
  const { createRoute, updateRoute, loadRouteDetails, selectedRoute } = useAdminRoute();

  const isEditing = Boolean(id);
  const isFleetPortal = (location.pathname.startsWith('/fleet-operator') || location.pathname.startsWith('/fleet-operator'));
  const basePath = isFleetPortal ? '/fleet-operator/routes' : '/admin/routes';

  const canCreate = hasPermission('fleet.routes.create');
  const canUpdate = hasPermission('fleet.routes.update');
  const canApprove = hasPermission('fleet.routes.approve');

  // RBAC guard
  useEffect(() => {
    if (isEditing && !canUpdate) {
      toast.error('You do not have permission to edit routes.');
      navigate(basePath);
    } else if (!isEditing && !canCreate) {
      toast.error('You do not have permission to create routes.');
      navigate(basePath);
    }
  }, [isEditing, canCreate, canUpdate, navigate, basePath]);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [totalDurationMin, setTotalDurationMin] = useState('');
  const [polyline, setPolyline] = useState('');
  const [status, setStatus] = useState('active');

  // Origin & Destination
  const [startPoint, setStartPoint] = useState({ name: '', lat: null, lng: null, address: '', city: null, state: null, pincode: null, country: null, full_address: null, place_id: null });
  const [endPoint, setEndPoint] = useState({ name: '', lat: null, lng: null, address: '', city: null, state: null, pincode: null, country: null, full_address: null, place_id: null });

  // Dynamic Stops
  const [stops, setStops] = useState([]);

  const [saving, setSaving] = useState(false);
  const [computingRoute, setComputingRoute] = useState(false);

  // Auto-generate code on create
  useEffect(() => {
    if (!isEditing && !code) {
      const rand = Math.floor(1000 + Math.random() * 9000);
      setCode(`RTE-${rand}`);
    }
  }, [isEditing]);

  // Load route details on edit
  useEffect(() => {
    if (isEditing) {
      loadRouteDetails(id).then((r) => {
        if (!r) return;
        setName(r.name || '');
        setCode(r.code || '');
        setDistanceKm(r.distance_km || '');
        setTotalDurationMin(r.total_duration_min || '');
        setPolyline(r.polyline || '');
        setStatus(r.status === 'pending_approval' ? 'active' : (r.status || 'active'));

        setStartPoint({
          name: r.start_point || '',
          lat: r.start_latitude ? Number(r.start_latitude) : null,
          lng: r.start_longitude ? Number(r.start_longitude) : null,
          address: r.start_full_address || r.start_point || '',
          city: r.start_city || null,
          state: r.start_state || null,
          pincode: r.start_pincode || null,
          country: r.start_country || null,
          full_address: r.start_full_address || null,
          place_id: null,
        });

        setEndPoint({
          name: r.end_point || '',
          lat: r.end_latitude ? Number(r.end_latitude) : null,
          lng: r.end_longitude ? Number(r.end_longitude) : null,
          address: r.end_full_address || r.end_point || '',
          city: r.end_city || null,
          state: r.end_state || null,
          pincode: r.end_pincode || null,
          country: r.end_country || null,
          full_address: r.end_full_address || null,
          place_id: null,
        });

        if (Array.isArray(r.stops)) {
          setStops(
            r.stops.map((s, idx) => ({
              id: s.id || `stop-${idx}`,
              name: s.name || '',
              address: s.full_address || s.address || '',
              lat: s.latitude ? Number(s.latitude) : null,
              lng: s.longitude ? Number(s.longitude) : null,
              sequence: s.sequence ?? idx + 1,
              eta: s.eta || '',
              distance_km: s.distance_km || '',
              geofence_radius: s.geofence_radius || 50,
              halt_reason: s.halt_reason || '',
              city: s.city || null,
              state: s.state || null,
              pincode: s.pincode || null,
              country: s.country || null,
              full_address: s.full_address || s.address || null,
              place_id: s.place_id || null,
            }))
          );
        }
      }).catch((err) => {
        toast.error(err?.message || 'Failed to load route details.');
        navigate(basePath);
      });
    }
  }, [isEditing, id]);

  // Stops handlers
  const handleAddStop = () => {
    setStops([
      ...stops,
      {
        id: `temp-${Date.now()}`,
        name: '',
        address: '',
        lat: null,
        lng: null,
        sequence: stops.length + 1,
        eta: '',
        distance_km: '',
        geofence_radius: 50,
        halt_reason: '',
        city: null,
        state: null,
        pincode: null,
        country: null,
        full_address: null,
        place_id: null,
      },
    ]);
  };

  const handleDistanceChange = (val) => {
    // Only allow positive numbers and optional single decimal point
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setDistanceKm(val);
    }
  };

  const handleDurationChange = (val) => {
    // Only allow whole digits
    if (val === '' || /^\d*$/.test(val)) {
      setTotalDurationMin(val);
    }
  };

  const handleUpdateStop = (idx, field, value) => {
    if (field === 'distance_km') {
      if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;
    }
    if (field === 'geofence_radius') {
      if (value !== '' && !/^\d*$/.test(value)) return;
    }
    const updated = [...stops];
    updated[idx] = { ...updated[idx], [field]: value };
    setStops(updated);
  };

  const handleStopLocationSelect = (idx, nameVal, latVal, lngVal, addressVal, parsedAddr) => {
    const updated = [...stops];
    updated[idx] = {
      ...updated[idx],
      name: nameVal,
      address: parsedAddr?.full_address || addressVal,
      lat: latVal,
      lng: lngVal,
      city: parsedAddr?.city || null,
      state: parsedAddr?.state || null,
      pincode: parsedAddr?.pincode || null,
      country: parsedAddr?.country || null,
      full_address: parsedAddr?.full_address || addressVal || null,
      place_id: parsedAddr?.place_id || null,
    };
    setStops(updated);
  };

  const handleRemoveStop = (idx) => {
    const filtered = stops.filter((_, i) => i !== idx).map((s, i) => ({ ...s, sequence: i + 1 }));
    setStops(filtered);
  };

  const handleMoveStop = (idx, direction) => {
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === stops.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const reordered = [...stops];
    const temp = reordered[idx];
    reordered[idx] = reordered[targetIdx];
    reordered[targetIdx] = temp;

    setStops(reordered.map((s, i) => ({ ...s, sequence: i + 1 })));
  };

  // ── Map drag / click-to-place callbacks ──────────────────────────────────
  // Called when the user drags the A pin or clicks "Set A" then taps the map.
  const handleMapStartChange = (data) => {
    setStartPoint((prev) => ({
      ...prev,
      lat: data.lat,
      lng: data.lng,
      name: data.name || prev.name,
      address: data.full_address || data.name || prev.address,
      city: data.city ?? prev.city,
      state: data.state ?? prev.state,
      pincode: data.pincode ?? prev.pincode,
      country: data.country ?? prev.country,
      full_address: data.full_address ?? prev.full_address,
    }));
  };

  const handleMapEndChange = (data) => {
    setEndPoint((prev) => ({
      ...prev,
      lat: data.lat,
      lng: data.lng,
      name: data.name || prev.name,
      address: data.full_address || data.name || prev.address,
      city: data.city ?? prev.city,
      state: data.state ?? prev.state,
      pincode: data.pincode ?? prev.pincode,
      country: data.country ?? prev.country,
      full_address: data.full_address ?? prev.full_address,
    }));
  };

  const handleMapStopChange = (idx, data) => {
    const updated = [...stops];
    if (!updated[idx]) return;
    updated[idx] = {
      ...updated[idx],
      lat: data.lat,
      lng: data.lng,
      name: data.name && data.name !== updated[idx].name && data.name !== `${data.lat?.toFixed(5)}, ${data.lng?.toFixed(5)}` ? data.name : updated[idx].name,
      address: data.full_address || updated[idx].address,
      city: data.city ?? updated[idx].city,
      state: data.state ?? updated[idx].state,
      pincode: data.pincode ?? updated[idx].pincode,
      country: data.country ?? updated[idx].country,
      full_address: data.full_address ?? updated[idx].full_address,
    };
    setStops(updated);
  };

  // Google Routes API computation (By Road with intermediate waypoints)
  const handleComputeRoute = async (isManual = true) => {
    if (!startPoint.lat || !startPoint.lng || !endPoint.lat || !endPoint.lng) {
      if (isManual) {
        toast.error('Please specify valid GPS coordinates or search locations for both Origin and Destination first.');
      }
      return;
    }

    try {
      setComputingRoute(true);

      // Collect all valid intermediate stops with GPS coordinates
      const validIntermediates = stops
        .filter((s) => s.lat != null && s.lng != null && !isNaN(Number(s.lat)) && !isNaN(Number(s.lng)))
        .map((s) => ({ lat: Number(s.lat), lng: Number(s.lng) }));

      const res = await googleApisService.demoRoutes({
        origin: `${startPoint.lat},${startPoint.lng}`,
        destination: `${endPoint.lat},${endPoint.lng}`,
        intermediates: validIntermediates,
      });

      const data = res?.data || res;
      if (data?.distanceKm) {
        setDistanceKm(data.distanceKm);
      }
      if (data?.durationMinutes) {
        setTotalDurationMin(data.durationMinutes);
      }
      if (data?.polyline) {
        setPolyline(data.polyline);
      }

      // If Google Routes returned leg details, update intermediate stops' distance & ETA
      if (Array.isArray(data?.legs) && data.legs.length > 0) {
        let accumulatedMinutes = 0;
        let accumulatedKm = 0;
        const updatedStops = stops.map((s, idx) => {
          if (idx < data.legs.length - 1) {
            const leg = data.legs[idx];
            accumulatedKm += parseFloat(leg.distanceKm || 0);
            accumulatedMinutes += leg.durationMinutes || 0;
            return {
              ...s,
              distance_km: s.distance_km || accumulatedKm.toFixed(1),
              eta: s.eta || `+${accumulatedMinutes} mins`,
            };
          }
          return s;
        });
        setStops(updatedStops);
      }

      if (isManual) {
        toast.success(`Driving route computed via Google Routes API: ${data?.distanceKm || 0} km, ~${data?.durationMinutes || 0} mins`);
      }
    } catch (err) {
      if (isManual) {
        toast.error(err?.message || 'Failed to compute route via Google Routes API.');
      }
    } finally {
      setComputingRoute(false);
    }
  };

  // Debounced auto-computation: automatically compute road polyline when coordinates change
  useEffect(() => {
    if (!startPoint.lat || !startPoint.lng || !endPoint.lat || !endPoint.lng) return;

    const timer = setTimeout(() => {
      handleComputeRoute(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [
    startPoint.lat,
    startPoint.lng,
    endPoint.lat,
    endPoint.lng,
    stops.length,
    stops.map((s) => `${s.lat},${s.lng}`).join('|'),
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Route name is required.');
      return;
    }
    if (!startPoint.name.trim()) {
      toast.error('Origin station name is required.');
      return;
    }
    if (!endPoint.name.trim()) {
      toast.error('Destination station name is required.');
      return;
    }

    if (distanceKm && isNaN(Number(distanceKm))) {
      toast.error('Distance must be a valid number.');
      return;
    }
    if (totalDurationMin && isNaN(Number(totalDurationMin))) {
      toast.error('Duration must be a valid number.');
      return;
    }

    const payload = {
      name: name.trim(),
      ...(code ? { code: code.trim() } : {}),
      start_point: startPoint.name.trim(),
      start_latitude: startPoint.lat,
      start_longitude: startPoint.lng,
      start_city: startPoint.city || null,
      start_state: startPoint.state || null,
      start_pincode: startPoint.pincode || null,
      start_country: startPoint.country || null,
      start_full_address: startPoint.full_address || startPoint.address || null,
      end_point: endPoint.name.trim(),
      end_latitude: endPoint.lat,
      end_longitude: endPoint.lng,
      end_city: endPoint.city || null,
      end_state: endPoint.state || null,
      end_pincode: endPoint.pincode || null,
      end_country: endPoint.country || null,
      end_full_address: endPoint.full_address || endPoint.address || null,
      distance_km: distanceKm ? parseFloat(distanceKm) : null,
      total_duration_min: totalDurationMin ? parseInt(totalDurationMin, 10) : 0,
      polyline: polyline || null,
      status: canApprove ? status : 'active',
      stops: stops.map((s, idx) => ({
        name: s.name.trim() || `Stop ${idx + 1}`,
        address: s.full_address || s.address || null,
        full_address: s.full_address || s.address || null,
        city: s.city || null,
        state: s.state || null,
        pincode: s.pincode || null,
        country: s.country || null,
        place_id: s.place_id || null,
        type: 'waypoint',
        latitude: s.lat,
        longitude: s.lng,
        sequence: s.sequence || idx + 1,
        eta: s.eta || null,
        distance_km: s.distance_km ? parseFloat(s.distance_km) : null,
        geofence_radius: s.geofence_radius ? parseInt(s.geofence_radius, 10) : 50,
        halt_reason: s.halt_reason ? s.halt_reason.trim() : null,
      })),
    };

    try {
      setSaving(true);
      if (isEditing) {
        await updateRoute(id, payload);
        toast.success('Route updated successfully.');
      } else {
        await createRoute(payload);
        toast.success(
          canApprove
            ? 'Route created and activated!'
            : 'Route submitted for Admin review & approval.'
        );
      }
      navigate(basePath);
    } catch (err) {
      toast.error(err?.message || 'Failed to save route.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Breadcrumb
            items={[
              { label: isFleetPortal ? 'Fleet' : 'Admin', to: basePath },
              { label: 'Routes', to: basePath },
              { label: isEditing ? 'Edit Route' : 'Add Route' },
            ]}
            className="mb-2"
          />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isEditing ? `${t('admin.routes.edit_route')}: ${name || code}` : t('admin.routes.add_route')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Configure route corridor, origin station, destination, and intermediate stops.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(basePath)}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{t('common.saving')}</span>
              </>
            ) : (
              <>
                <FleetIcons.Plus className="w-4 h-4 text-white" />
                <span>{isEditing ? t('admin.routes.save_changes') : canApprove ? t('admin.routes.save_route') : t('admin.routes.submit_approval')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Operator Banner if not admin */}
      {!canApprove && (
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-3 text-xs text-amber-800 dark:text-amber-300">
          <FleetIcons.Alert className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            <strong>{t('common.notice')}:</strong> {t('admin.routes.operator_notice')}
          </span>
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Card 1: Basic Identifiers */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t('admin.routes.sec_route_details')}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={canApprove ? "sm:col-span-1" : "sm:col-span-2"}>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    {t('admin.routes.route_name_label')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('admin.routes.route_name_ph')}
                    className="w-full px-3.5 py-2 text-sm bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {canApprove && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">{t('common.active')}</option>
                      <option value="inactive">{t('common.inactive')}</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: Origin & Destination */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t('admin.routes.sec_origin_dest')}</h2>
                </div>

                <button
                  type="button"
                  onClick={() => handleComputeRoute(true)}
                  disabled={computingRoute}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900/60 transition-colors cursor-pointer"
                >
                  {computingRoute ? (
                    <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FleetIcons.Speed className="w-3.5 h-3.5" />
                  )}
                  <span>{t('admin.routes.calculate_route_btn')}</span>
                </button>
              </div>

              <div className="space-y-4">
                {/* Origin Input */}
                <div className="p-3.5 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl">
                  <LocationAutocompleteInput
                    label="Origin / Start Station"
                    value={startPoint.name}
                    coords={startPoint}
                    required
                    placeholder={t('admin.routes.origin_station_ph')}
                    onChange={(nameVal, latVal, lngVal, addressVal, parsedAddr) => {
                      setStartPoint({
                        name: nameVal,
                        lat: latVal,
                        lng: lngVal,
                        address: parsedAddr?.full_address || addressVal,
                        city: parsedAddr?.city || null,
                        state: parsedAddr?.state || null,
                        pincode: parsedAddr?.pincode || null,
                        country: parsedAddr?.country || null,
                        full_address: parsedAddr?.full_address || addressVal || null,
                        place_id: parsedAddr?.place_id || null,
                      });
                    }}
                  />
                  {/* Address detail chips for Origin */}
                  {(startPoint.city || startPoint.state || startPoint.pincode) && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {startPoint.city && <span className="text-[11px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-medium">{startPoint.city}</span>}
                      {startPoint.state && <span className="text-[11px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">{startPoint.state}</span>}
                      {startPoint.pincode && <span className="text-[11px] bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-full font-mono">{startPoint.pincode}</span>}
                      {startPoint.country && <span className="text-[11px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 px-2 py-0.5 rounded-full font-medium">{startPoint.country}</span>}
                    </div>
                  )}
                  {startPoint.full_address && startPoint.full_address !== startPoint.name && (
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed pl-1">{startPoint.full_address}</p>
                  )}
                </div>

                {/* Destination Input */}
                <div className="p-3.5 bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-xl">
                  <LocationAutocompleteInput
                    label="Destination / End Station"
                    value={endPoint.name}
                    coords={endPoint}
                    required
                    placeholder={t('admin.routes.dest_station_ph')}
                    onChange={(nameVal, latVal, lngVal, addressVal, parsedAddr) => {
                      setEndPoint({
                        name: nameVal,
                        lat: latVal,
                        lng: lngVal,
                        address: parsedAddr?.full_address || addressVal,
                        city: parsedAddr?.city || null,
                        state: parsedAddr?.state || null,
                        pincode: parsedAddr?.pincode || null,
                        country: parsedAddr?.country || null,
                        full_address: parsedAddr?.full_address || addressVal || null,
                        place_id: parsedAddr?.place_id || null,
                      });
                    }}
                  />
                  {/* Address detail chips for Destination */}
                  {(endPoint.city || endPoint.state || endPoint.pincode) && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {endPoint.city && <span className="text-[11px] bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full font-medium">{endPoint.city}</span>}
                      {endPoint.state && <span className="text-[11px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">{endPoint.state}</span>}
                      {endPoint.pincode && <span className="text-[11px] bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-full font-mono">{endPoint.pincode}</span>}
                      {endPoint.country && <span className="text-[11px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 px-2 py-0.5 rounded-full font-medium">{endPoint.country}</span>}
                    </div>
                  )}
                  {endPoint.full_address && endPoint.full_address !== endPoint.name && (
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed pl-1">{endPoint.full_address}</p>
                  )}
                </div>

                {/* Distance & Duration Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-zinc-800">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Distance (km)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={distanceKm}
                        onChange={(e) => handleDistanceChange(e.target.value)}
                        placeholder={t('routes.add.distance_ph')}
                        className="w-full px-3.5 py-2 text-sm bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 dark:text-zinc-500 pointer-events-none">
                        km
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Duration (minutes)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={totalDurationMin}
                        onChange={(e) => handleDurationChange(e.target.value)}
                        placeholder={t('routes.add.duration_ph')}
                        className="w-full px-3.5 py-2 text-sm bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-14"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 dark:text-zinc-500 pointer-events-none">
                        mins
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Dynamic Multiple Stops with Halt Reasons */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t('admin.routes.sec_stops')}</h2>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Add passenger stops and order them along the route.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddStop}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors cursor-pointer"
                >
                  <FleetIcons.Plus className="w-3.5 h-3.5" />
                  <span>{t('admin.routes.add_stop_btn')}</span>
                </button>
              </div>

              {stops.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
                  <div className="text-xs font-semibold text-slate-700 dark:text-zinc-300">{t('admin.routes.no_stops_added')}</div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    Click "+ Add Stop" to add stations along this route.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stops.map((stop, idx) => (
                    <div
                      key={stop.id}
                      className="p-4 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/80 rounded-xl space-y-3 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-white">
                            Stop #{idx + 1}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveStop(idx, 'up')}
                            disabled={idx === 0}
                            title={t('admin.routes.move_up')}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 disabled:opacity-30 rounded cursor-pointer"
                          >
                            <FleetIcons.ArrowLeft className="w-3.5 h-3.5 rotate-90" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveStop(idx, 'down')}
                            disabled={idx === stops.length - 1}
                            title={t('admin.routes.move_down')}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 disabled:opacity-30 rounded cursor-pointer"
                          >
                            <FleetIcons.ArrowLeft className="w-3.5 h-3.5 -rotate-90" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveStop(idx)}
                            title={t('admin.routes.remove_stop')}
                            className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors ml-1 cursor-pointer"
                          >
                            <FleetIcons.Trash className="w-3.5 h-3.5 text-rose-500" />
                          </button>
                        </div>
                      </div>

                      {/* Station Autocomplete */}
                      <LocationAutocompleteInput
                        value={stop.name}
                        coords={stop}
                        placeholder={t('admin.routes.stop_name_ph')}
                        onChange={(n, lat, lng, addr, parsedAddr) => handleStopLocationSelect(idx, n, lat, lng, addr, parsedAddr)}
                      />
                      {/* Address chips for Stop */}
                      {(stop.city || stop.state || stop.pincode) && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {stop.city && <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded-full font-medium">{stop.city}</span>}
                          {stop.state && <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full font-medium">{stop.state}</span>}
                          {stop.pincode && <span className="text-[10px] bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 px-1.5 py-0.5 rounded-full font-mono">{stop.pincode}</span>}
                        </div>
                      )}
                      {stop.full_address && stop.full_address !== stop.name && (
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 leading-relaxed pl-0.5">{stop.full_address}</p>
                      )}

                      {/* Halt Reason / Stop Purpose Field */}
                      <div className="pt-1">
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] uppercase font-bold text-slate-600 dark:text-zinc-400">
                            {t('admin.routes.stop_purpose')}
                          </label>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500">{t('admin.routes.why_stop_here')}</span>
                        </div>

                        {/* Quick Selection Badges */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {[
                            'Commercial Hub',
                            'Transit Hub',
                            'Passenger Stop',
                            'School / College',
                            'Hospital',
                            'IT Park',
                            'Depot',
                          ].map((reasonText) => (
                            <button
                              key={reasonText}
                              type="button"
                              onClick={() => handleUpdateStop(idx, 'halt_reason', reasonText)}
                              className={`px-2 py-0.5 text-[10px] rounded-md border transition-all cursor-pointer ${
                                stop.halt_reason === reasonText
                                  ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-xs'
                                  : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-blue-400'
                              }`}
                            >
                              {reasonText}
                            </button>
                          ))}
                        </div>

                        <input
                          type="text"
                          value={stop.halt_reason || ''}
                          onChange={(e) => handleUpdateStop(idx, 'halt_reason', e.target.value)}
                          placeholder={t('admin.routes.halt_reason_ph')}
                          className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      {/* Leg ETA, Distance, Geofence */}
                      <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                        <div>
                          <label className="block text-[10px] uppercase font-semibold text-slate-500 dark:text-zinc-400 mb-1">
                            ETA
                          </label>
                          <input
                            type="text"
                            value={stop.eta}
                            onChange={(e) => handleUpdateStop(idx, 'eta', e.target.value)}
                            placeholder={t('routes.add.time_offset_ph')}
                            className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-semibold text-slate-500 dark:text-zinc-400 mb-1">
                            Distance (km)
                          </label>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={stop.distance_km}
                            onChange={(e) => handleUpdateStop(idx, 'distance_km', e.target.value)}
                            placeholder={t('routes.add.km_marker_ph')}
                            className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-semibold text-slate-500 dark:text-zinc-400 mb-1">
                            Geofence (m)
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={stop.geofence_radius}
                            onChange={(e) => handleUpdateStop(idx, 'geofence_radius', e.target.value)}
                            placeholder="50"
                            className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Route Map & Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                    Route Map
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                  {stops.length + (startPoint.lat ? 1 : 0) + (endPoint.lat ? 1 : 0)} Points
                </span>
              </div>

              {/* Embed Map Viewer — editMode enables drag + click-to-place */}
              <RouteMapViewer
                start={startPoint}
                end={endPoint}
                stops={stops}
                polyline={polyline}
                height="450px"
                editMode
                onStartChange={handleMapStartChange}
                onEndChange={handleMapEndChange}
                onStopChange={handleMapStopChange}
              />

              <div className="mt-4 p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-700/60 text-xs space-y-2">
                <div className="font-semibold text-slate-800 dark:text-white flex items-center justify-between">
                  <span>{t('admin.routes.summary_checklist')}</span>
                  <span className="text-[11px] font-medium flex items-center gap-1">
                    {polyline ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                        <FleetIcons.Check className="w-3.5 h-3.5 inline" /> Road Path Active
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-zinc-500">{t('admin.routes.realtime_sync')}</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-zinc-400">
                  <span>{t('common.origin')}:</span>
                  <span className={startPoint.lat ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400 dark:text-zinc-500'}>
                    {startPoint.lat ? 'Ready' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-zinc-400">
                  <span>{t('common.destination')}:</span>
                  <span className={endPoint.lat ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400 dark:text-zinc-500'}>
                    {endPoint.lat ? 'Ready' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-zinc-400">
                  <span>{t('admin.routes.th_stops')}:</span>
                  <span className="font-semibold text-slate-800 dark:text-white">{stops.length} Stops</span>
                </div>
                {polyline && (
                  <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-zinc-400 pt-1 border-t border-slate-200 dark:border-zinc-700">
                    <span>{t('admin.routes.road_path')}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">{t('admin.routes.calc_by_road')}</span>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="mt-5 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t('admin.routes.saving_route')}</span>
                    </>
                  ) : (
                    <>
                      <FleetIcons.Plus className="w-4 h-4 text-white" />
                      <span>{isEditing ? t('admin.routes.save_changes') : canApprove ? t('admin.routes.save_route') : t('admin.routes.submit_approval')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddRoutePage;
