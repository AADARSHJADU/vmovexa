import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useAdminDepot } from '../../hooks/admin/useAdminDepot';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import { adminDepotService } from '../../api/services/admin/depot.service';

export const AdminDepotDetailsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isFleetPortal = (location.pathname.startsWith('/fleet-operator') || location.pathname.startsWith('/fleet-operator'));
  const basePath = isFleetPortal ? '/fleet-operator/depots' : '/admin/depots';
  const { hasPermission } = useAuth();

  const canView = hasPermission('fleet.depots.view');
  const canUpdate = hasPermission('fleet.depots.update');

  const { updateDepotStatus } = useAdminDepot();
  const [depot, setDepot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!canView) return;
    if (id) {
      setLoading(true);
      adminDepotService
        .getDepot(id)
        .then((res) => {
          if (res) {
            setDepot(res);
          } else {
            toast.error('Depot facility profile not found');
            navigate(basePath);
          }
        })
        .catch((err) => {
          toast.error(err?.message || 'Failed to load depot details');
          navigate(basePath);
        })
        .finally(() => setLoading(false));
    }
  }, [id, canView, navigate, basePath]);

  // Initialize Map for viewing
  useEffect(() => {
    if (!depot || !mapContainerRef.current) return;

    const lat = depot.latitude != null ? Number(depot.latitude) : 12.9716;
    const lng = depot.longitude != null ? Number(depot.longitude) : 77.5946;
    const radius = Number(depot.geofence_radius || depot.geofenceRadius) || 300;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }).addTo(map);

      // Geofence circle
      L.circle([lat, lng], {
        radius: radius,
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.18,
        weight: 2,
        dashArray: '5, 5',
      }).addTo(map);

      // Pin
      const icon = L.divIcon({
        className: 'depot-detail-pin',
        html: `
          <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 42px; height: 42px; background: rgba(37, 99, 235, 0.25); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: absolute; width: 34px; height: 34px; background: #2563eb; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: #ffffff;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            </div>
            <div style="position: absolute; bottom: -6px; width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid #2563eb;"></div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 44],
        popupAnchor: [0, -40],
      });

      L.marker([lat, lng], { icon })
        .addTo(map)
        .bindPopup(`<b>${depot.name}</b><br/>${depot.address || ''}`);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [depot]);

  const handleStatusToggle = () => {
    if (!depot) return;
    const newStatus = depot.status === 'operational' ? 'maintenance' : 'operational';
    setUpdatingStatus(true);
    toast.promise(
      updateDepotStatus(depot.id, newStatus),
      {
        loading: `Updating depot status...`,
        success: () => {
          setDepot((prev) => (prev ? { ...prev, status: newStatus } : null));
          return `Depot status updated to ${newStatus}!`;
        },
        error: (err) => err?.message || 'Failed to update status',
      }
    ).finally(() => setUpdatingStatus(false));
  };

  if (!canView) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400">
          <FleetIcons.Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('common.access_denied')}</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">
          You do not have permission to view depot facilities.
        </p>
        <Link
          to={basePath}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white text-xs font-bold rounded-xl transition-colors"
        >
          <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('admin.depots.back_to_depots')}</span>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm space-y-3">
        <div className="w-6 h-6 border-2 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin mx-auto" />
        <div className="text-slate-500 dark:text-zinc-400 font-bold text-sm">{t('admin.depots.loading_details')}</div>
      </div>
    );
  }

  if (!depot) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm space-y-4">
        <div className="text-slate-400 dark:text-zinc-500 font-bold text-sm">{t('admin.depots.not_found')}</div>
        <Link
          to={basePath}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white font-bold text-xs rounded-xl"
        >
          <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('admin.depots.back_to_depots')}</span>
        </Link>
      </div>
    );
  }

  const code = depot.code || `DEP-${depot.id}`;
  const status = depot.status || 'operational';
  const depotType = depot.depot_type || depot.depotType || 'main_terminal';
  const manager = depot.assignedOperator || depot.assigned_operator;
  const creator = depot.creator;
  const updater = depot.updater;

  let amenitiesList = [];
  if (Array.isArray(depot.amenities)) {
    amenitiesList = depot.amenities;
  } else if (typeof depot.amenities === 'string') {
    try {
      amenitiesList = JSON.parse(depot.amenities);
    } catch {
      amenitiesList = depot.amenities.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 max-w-5xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: isFleetPortal ? 'Fleet Operator' : 'Admin Operations', path: isFleetPortal ? '/fleet-operator/dashboard' : '/admin/dashboard' },
              { label: t('admin.depots.title'), path: basePath },
              { label: depot.name },
            ]}
            className="mb-2"
          />
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {depot.name}
            </h1>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border ${
                status === 'operational'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
                  : status === 'maintenance'
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900'
              }`}
            >
              {status}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900 font-mono">
              {depotType.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono mt-1">
            Code: <span className="font-bold text-slate-700 dark:text-zinc-300">{code}</span> · {depot.city ? `${depot.city}, ` : ''}{depot.state || 'India'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {canUpdate && (
            <>
              <Link
                to={`${basePath}/edit/${depot.id}`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <FleetIcons.Edit className="w-3.5 h-3.5 text-white" />
                <span>{t('admin.depots.edit_depot')}</span>
              </Link>
              <button
                type="button"
                disabled={updatingStatus}
                onClick={handleStatusToggle}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {updatingStatus ? (
                  <div className="w-3.5 h-3.5 border-2 border-slate-800 dark:border-zinc-200 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FleetIcons.Refresh className="w-3.5 h-3.5" />
                )}
                <span>{t('admin.depots.toggle_status')}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('admin.depots.kpi_parking_capacity')}</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">{depot.capacity ?? 35} Bays</div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('admin.depots.kpi_parking_desc')}</p>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{t('admin.depots.kpi_ev_chargers')}</span>
          <div className="text-xl font-black text-emerald-700 dark:text-emerald-400">{depot.ev_chargers ?? depot.evChargers ?? 0} Ports</div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('admin.depots.kpi_ev_desc')}</p>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{t('admin.depots.kpi_maintenance_bays')}</span>
          <div className="text-xl font-black text-blue-700 dark:text-blue-400">{depot.maintenance_bays ?? depot.maintenanceBays ?? 2} Pits</div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('admin.depots.kpi_maintenance_desc')}</p>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">{t('admin.depots.kpi_washing_bays')}</span>
          <div className="text-xl font-black text-purple-700 dark:text-purple-400">{depot.washing_bays ?? depot.washingBays ?? 1} Bays</div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('admin.depots.kpi_washing_desc')}</p>
        </div>
      </div>

      {/* Main Details Grid: Location & Operations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Google Map & Structured Location */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <FleetIcons.Pin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Location & Geofence Perimeter
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{t('admin.depots.gps_boundary_desc')}</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900">
                Radius: {depot.geofence_radius ?? depot.geofenceRadius ?? 300}m
              </span>
            </div>

            {/* Map Container */}
            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 h-64 shadow-inner">
              <div ref={mapContainerRef} className="w-full h-full z-10" />
            </div>

            {/* Address Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="sm:col-span-2 p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">{t('admin.depots.complete_address')}</span>
                <div className="text-xs font-medium text-slate-800 dark:text-zinc-200 mt-0.5">{depot.address || 'Address not specified'}</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">{t('admin.depots.city_state')}</span>
                <div className="text-xs font-medium text-slate-800 dark:text-zinc-200 mt-0.5">
                  {depot.city || '—'}, {depot.state || '—'} {depot.pincode ? `(${depot.pincode})` : ''}
                </div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">{t('admin.depots.gps_coordinates')}</span>
                <div className="text-xs font-mono font-bold text-slate-800 dark:text-zinc-200 mt-0.5">
                  {depot.latitude != null ? Number(depot.latitude).toFixed(6) : 'N/A'}, {depot.longitude != null ? Number(depot.longitude).toFixed(6) : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Amenities & Fuel Support Card */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center gap-2">
              <FleetIcons.Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">{t('admin.depots.energy_amenities')}</h3>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase block mb-1.5">{t('admin.depots.supported_fuel_types')}</span>
                <div className="flex flex-wrap gap-2">
                  {(depot.fuel_types || depot.fuelTypes || 'EV Charging, Diesel')
                    .split(',')
                    .map((f, i) => (
                      <span key={i} className="text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-3 py-1 rounded-xl flex items-center gap-1.5">
                        <FleetIcons.Fuel className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>{f.trim()}</span>
                      </span>
                    ))}
                </div>
              </div>

              {amenitiesList.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase block mb-1.5">{t('admin.depots.depot_amenities')}</span>
                  <div className="flex flex-wrap gap-2">
                    {amenitiesList.map((a, i) => (
                      <span key={i} className="text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-xl flex items-center gap-1.5">
                        <FleetIcons.Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>{a}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Personnel, Contact Desk & Audit Info */}
        <div className="space-y-6">
          {/* Management & Contact Card */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center gap-2">
              <FleetIcons.User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">{t('admin.depots.manager_contact')}</h3>
            </div>

            {/* Manager In-Charge */}
            <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">{t('admin.depots.assigned_manager')}</span>
              {manager ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    {manager.name ? manager.name.charAt(0).toUpperCase() : 'M'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{manager.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">{manager.email}</div>
                  </div>
                </div>
              ) : (
                <div className="text-xs font-medium text-slate-500 dark:text-zinc-400 italic">{t('admin.depots.no_manager_assigned')}</div>
              )}
            </div>

            {/* Contact Details */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-slate-500 dark:text-zinc-400">{t('admin.depots.contact_person')}</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">{depot.contact_person || depot.contactPerson || '—'}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-slate-500 dark:text-zinc-400">{t('admin.depots.helpline_phone')}</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{depot.contact_phone || depot.contactPhone || '—'}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-slate-500 dark:text-zinc-400">{t('admin.depots.emergency_desk')}</span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{depot.emergency_phone || depot.emergencyPhone || '—'}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-slate-500 dark:text-zinc-400">{t('admin.depots.depot_email')}</span>
                <span className="font-medium text-slate-800 dark:text-zinc-200 truncate max-w-[150px]">{depot.email || '—'}</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-500 dark:text-zinc-400">{t('admin.depots.operating_hours')}</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">{depot.operating_hours || depot.operatingHours || '24x7'}</span>
              </div>
            </div>
          </div>

          {/* Audit Trail Card */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
              <FleetIcons.Clock className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">{t('admin.depots.audit_history')}</h3>
            </div>
            <div className="space-y-2 text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
              <div>
                <span className="text-slate-400 dark:text-zinc-500 block">{t('admin.depots.created_label')}</span>
                <span className="font-bold text-slate-700 dark:text-zinc-300">
                  {depot.created_at || depot.createdAt ? new Date(depot.created_at || depot.createdAt).toLocaleString() : 'N/A'}
                </span>
                {creator?.name && <span className="block text-slate-500 dark:text-zinc-400">by {creator.name} ({creator.email})</span>}
              </div>
              <div className="pt-1">
                <span className="text-slate-400 dark:text-zinc-500 block">{t('admin.depots.last_modified_label')}</span>
                <span className="font-bold text-slate-700 dark:text-zinc-300">
                  {depot.updated_at || depot.updatedAt ? new Date(depot.updated_at || depot.updatedAt).toLocaleString() : 'N/A'}
                </span>
                {updater?.name && <span className="block text-slate-500 dark:text-zinc-400">by {updater.name} ({updater.email})</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDepotDetailsPage;
