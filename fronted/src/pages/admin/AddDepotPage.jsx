import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useAdminDepot } from '../../hooks/admin/useAdminDepot';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import { adminDepotService } from '../../api/services/admin/depot.service';
import { adminUserService } from '../../api/services/admin/user.service';
import { DepotLocationPicker } from '../../components/depot/DepotLocationPicker';

const AVAILABLE_FUEL_TYPES = [
  'EV Charging (DC Fast)',
  'Diesel',
  'CNG (Compressed Natural Gas)',
  'Hydrogen / LNG',
];

const AVAILABLE_AMENITIES = [
  'Driver Rest Lounge',
  '24/7 CCTV & Security Gate',
  'Canteen / Cafeteria',
  'Spare Parts & Tool Store',
  'First Aid / Medical Desk',
  'Automated Washing Station',
  'Solar PV Rooftop Generation',
];

export const AddDepotPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const isFleetPortal = (location.pathname.startsWith('/fleet-operator') || location.pathname.startsWith('/fleet-operator'));
  const basePath = isFleetPortal ? '/fleet-operator/depots' : '/admin/depots';
  const { user, hasPermission } = useAuth();
  const currentOrgId = user?.organizationId ?? user?.organization_id;

  const canCreate = hasPermission('fleet.depots.create');
  const canUpdate = hasPermission('fleet.depots.update');
  const canAccessForm = isEditMode ? canUpdate : canCreate;

  const { createDepot, updateDepot } = useAdminDepot();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [operatorsList, setOperatorsList] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    depotType: 'main_terminal',
    status: 'operational',
    capacity: 35,
    evChargers: 6,
    maintenanceBays: 2,
    washingBays: 1,
    fuelTypes: ['EV Charging (DC Fast)', 'Diesel'],
    amenities: ['Driver Rest Lounge', '24/7 CCTV & Security Gate'],
    // Location & Geospatial
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    latitude: 12.9716,
    longitude: 77.5946,
    placeId: '',
    geofenceRadius: 300,
    // Operations & Contact
    assignedOperatorId: '',
    contactPerson: '',
    email: '',
    contactPhone: '',
    emergencyPhone: '',
    operatingHours: '24x7',
  });

  const [auditMeta, setAuditMeta] = useState(null);

  // 1. Fetch operators/users strictly scoped to this organization
  useEffect(() => {
    let active = true;
    const params = { limit: 100 };
    if (currentOrgId) {
      params.organizationId = currentOrgId;
    }
    adminUserService
      .getUsers(params)
      .then((res) => {
        const rawUsers = Array.isArray(res) ? res : (res?.rows || res?.items || res?.data || []);
        // SaaS Multi-tenancy filter: strictly only users of the current organization
        const tenantUsers = currentOrgId
          ? rawUsers.filter((u) => Number(u.organization_id || u.organizationId) === Number(currentOrgId))
          : rawUsers;

        // Filter for eligible manager/operator roles (exclude Drivers, Technicians, Advertisers, Govt)
        const eligible = tenantUsers.filter((u) => {
          const roleCode = String(u.role?.code || u.roleCode || (typeof u.role === 'string' ? u.role : '')).toUpperCase();
          if (roleCode.includes('DRIVER') || roleCode.includes('TECH') || roleCode.includes('ADVERTISER') || roleCode.includes('GOVT')) {
            return false;
          }
          return true;
        });

        if (active) setOperatorsList(eligible);
      })
      .catch(() => {
        /* fallback empty */
      });
    return () => { active = false; };
  }, [currentOrgId]);

  // 2. Fetch depot in edit mode
  useEffect(() => {
    if (!canAccessForm) return;
    if (isEditMode) {
      setFetching(true);
      adminDepotService
        .getDepot(id)
        .then((dep) => {
          if (!dep) return;

          let parsedAmenities = [];
          if (Array.isArray(dep.amenities)) {
            parsedAmenities = dep.amenities;
          } else if (typeof dep.amenities === 'string') {
            try {
              parsedAmenities = JSON.parse(dep.amenities);
            } catch {
              parsedAmenities = dep.amenities.split(',').map((s) => s.trim()).filter(Boolean);
            }
          }

          let parsedFuel = ['EV Charging (DC Fast)', 'Diesel'];
          if (Array.isArray(dep.fuel_types || dep.fuelTypes)) {
            parsedFuel = dep.fuel_types || dep.fuelTypes;
          } else if (typeof (dep.fuel_types || dep.fuelTypes) === 'string') {
            parsedFuel = (dep.fuel_types || dep.fuelTypes).split(',').map((s) => s.trim()).filter(Boolean);
          }

          setFormData({
            name: dep.name || '',
            code: dep.code || '',
            depotType: dep.depot_type || dep.depotType || 'main_terminal',
            status: dep.status || 'operational',
            capacity: dep.capacity ?? 35,
            evChargers: dep.ev_chargers ?? dep.evChargers ?? 6,
            maintenanceBays: dep.maintenance_bays ?? dep.maintenanceBays ?? 2,
            washingBays: dep.washing_bays ?? dep.washingBays ?? 1,
            fuelTypes: parsedFuel,
            amenities: parsedAmenities,
            address: dep.address || '',
            city: dep.city || '',
            state: dep.state || '',
            pincode: dep.pincode || '',
            country: dep.country || 'India',
            latitude: dep.latitude != null ? Number(dep.latitude) : 12.9716,
            longitude: dep.longitude != null ? Number(dep.longitude) : 77.5946,
            placeId: dep.place_id || dep.placeId || '',
            geofenceRadius: dep.geofence_radius ?? dep.geofenceRadius ?? 300,
            assignedOperatorId: dep.assigned_operator_id ?? dep.assignedOperatorId ?? dep.assignedOperator?.id ?? '',
            contactPerson: dep.contact_person ?? dep.contactPerson ?? '',
            email: dep.email || '',
            contactPhone: dep.contact_phone ?? dep.contactPhone ?? '',
            emergencyPhone: dep.emergency_phone ?? dep.emergencyPhone ?? '',
            operatingHours: dep.operating_hours ?? dep.operatingHours ?? '24x7',
          });

          setAuditMeta({
            createdAt: dep.created_at || dep.createdAt,
            creator: dep.creator,
            updatedAt: dep.updated_at || dep.updatedAt,
            updater: dep.updater,
          });
        })
        .catch((err) => toast.error(err?.message || 'Failed to load depot details'))
        .finally(() => setFetching(false));
    }
  }, [id, isEditMode, canAccessForm]);

  // Handle location update from DepotLocationPicker
  const handleLocationChange = (updatedLoc) => {
    setFormData((prev) => ({
      ...prev,
      address: updatedLoc.address ?? prev.address,
      city: updatedLoc.city ?? prev.city,
      state: updatedLoc.state ?? prev.state,
      pincode: updatedLoc.pincode ?? prev.pincode,
      country: updatedLoc.country ?? prev.country,
      latitude: updatedLoc.latitude ?? prev.latitude,
      longitude: updatedLoc.longitude ?? prev.longitude,
      placeId: updatedLoc.placeId ?? prev.placeId,
      geofenceRadius: updatedLoc.geofenceRadius ?? prev.geofenceRadius,
    }));
  };

  // Toggle Fuel types
  const handleToggleFuel = (fuel) => {
    setFormData((prev) => {
      const exists = prev.fuelTypes.includes(fuel);
      return {
        ...prev,
        fuelTypes: exists ? prev.fuelTypes.filter((f) => f !== fuel) : [...prev.fuelTypes, fuel],
      };
    });
  };

  // Toggle Amenities
  const handleToggleAmenity = (amenity) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists ? prev.amenities.filter((a) => a !== amenity) : [...prev.amenities, amenity],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Depot Facility Name is required.');
      return;
    }
    if (!formData.address.trim()) {
      toast.error('Depot Address is required.');
      return;
    }

    setLoading(true);

    const payload = {
      name: formData.name.trim(),
      code: formData.code.trim() || undefined,
      depot_type: formData.depotType,
      status: formData.status,
      capacity: Number(formData.capacity) || 0,
      ev_chargers: Number(formData.evChargers) || 0,
      maintenance_bays: Number(formData.maintenanceBays) || 0,
      washing_bays: Number(formData.washingBays) || 0,
      fuel_types: formData.fuelTypes.join(', '),
      amenities: formData.amenities,
      // Location
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      pincode: formData.pincode.trim(),
      country: formData.country.trim() || 'India',
      latitude: formData.latitude != null ? Number(formData.latitude) : null,
      longitude: formData.longitude != null ? Number(formData.longitude) : null,
      place_id: formData.placeId || null,
      geofence_radius: Number(formData.geofenceRadius) || 300,
      // Personnel & Operations
      assigned_operator_id: formData.assignedOperatorId ? Number(formData.assignedOperatorId) : null,
      contact_person: formData.contactPerson.trim() || null,
      email: formData.email.trim() || null,
      contact_phone: formData.contactPhone.trim() || null,
      emergency_phone: formData.emergencyPhone.trim() || null,
      operating_hours: formData.operatingHours.trim() || '24x7',
    };

    const actionPromise = isEditMode
      ? updateDepot(id, payload)
      : createDepot(payload);

    try {
      await toast.promise(actionPromise, {
        loading: isEditMode ? 'Updating depot facility...' : 'Registering new depot facility...',
        success: isEditMode
          ? `Depot ${formData.name} updated successfully!`
          : `Depot ${formData.name} registered successfully!`,
        error: (err) => err?.message || (isEditMode ? 'Failed to update depot' : 'Failed to create depot'),
      });
      navigate(basePath);
    } catch {
      /* toast already caught */
    } finally {
      setLoading(false);
    }
  };

  if (!canAccessForm) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400">
          <FleetIcons.Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('common.access_denied')}</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">
          You do not have permission to {isEditMode ? 'edit' : 'create'} depots.
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

  if (fetching) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm space-y-3">
        <div className="w-6 h-6 border-2 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin mx-auto" />
        <div className="text-slate-600 dark:text-zinc-400 font-bold text-sm">{t('admin.depots.loading_details_form')}</div>
      </div>
    );
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
              { label: isEditMode ? t('admin.depots.edit_depot') : t('admin.depots.add_depot') },
            ]}
            className="mb-2"
          />
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {isEditMode ? t('admin.depots.edit_depot') : t('admin.depots.add_depot')}
            </h1>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-md font-bold">
              {isFleetPortal ? 'Fleet Manager Portal' : 'Admin Operations'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
            Configure depot location, parking capacity, charging facilities, and operations team
          </p>
        </div>

        {/* Audit Meta in Edit Mode */}
        {isEditMode && auditMeta && (
          <div className="text-right text-[11px] text-slate-400 dark:text-zinc-400 font-mono bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 px-3 py-1.5 rounded-xl">
            <div>Created: {auditMeta.createdAt ? new Date(auditMeta.createdAt).toLocaleDateString() : 'N/A'} {auditMeta.creator?.name ? `by ${auditMeta.creator.name}` : ''}</div>
            {auditMeta.updatedAt && (
              <div className="text-slate-500 dark:text-zinc-400">Updated: {new Date(auditMeta.updatedAt).toLocaleDateString()} {auditMeta.updater?.name ? `by ${auditMeta.updater.name}` : ''}</div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: Basic Details */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <FleetIcons.Depot className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  1. Basic Details
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">{t('admin.depots.form_section_basic_desc')}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('admin.depots.name_label')}</label>
              <input
                type="text"
                required
                placeholder={t('admin.depots.name_placeholder')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Depot Code <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-normal">({t('common.optional')})</span>
              </label>
              <input
                type="text"
                placeholder={t('admin.depots.code_placeholder')}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs uppercase"
              />
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">{t('admin.depots.code_hint')}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('common.status')}</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              >
                <option value="operational">{t('admin.depots.stat_operational')}</option>
                <option value="maintenance">{t('common.maintenance')}</option>
                <option value="closed">{t('common.closed_inactive')}</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('admin.depots.type_label')}</label>
              <select
                value={formData.depotType}
                onChange={(e) => setFormData({ ...formData, depotType: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              >
                <option value="main_terminal">{t('admin.depots.type_main_terminal')}</option>
                <option value="sub_depot">{t('admin.depots.type_sub_depot')}</option>
                <option value="workshop">{t('admin.depots.type_workshop')}</option>
                <option value="charging_hub">{t('admin.depots.type_ev_hub')}</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('admin.depots.operating_hours')}</label>
              <input
                type="text"
                placeholder={t('admin.depots.operating_hours_placeholder')}
                value={formData.operatingHours}
                onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Location & Geofencing */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <FleetIcons.Pin className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  2. Location & Geofence
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Search address, position depot gate on map, and configure geofence radius
                </p>
              </div>
            </div>
          </div>

          <DepotLocationPicker
            locationData={{
              address: formData.address,
              city: formData.city,
              state: formData.state,
              pincode: formData.pincode,
              country: formData.country,
              latitude: formData.latitude,
              longitude: formData.longitude,
              placeId: formData.placeId,
              geofenceRadius: formData.geofenceRadius,
            }}
            onChange={handleLocationChange}
          />
        </div>

        {/* SECTION 3: Capacity & Facilities */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <FleetIcons.Zap className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  3. Capacity & Facilities
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">{t('admin.depots.form_section_capacity_desc')}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('admin.depots.parking_capacity_label')}</label>
              <input
                type="number"
                required
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">{t('admin.depots.kpi_parking_desc')}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('admin.depots.ev_chargers_label')}</label>
              <input
                type="number"
                min="0"
                value={formData.evChargers}
                onChange={(e) => setFormData({ ...formData, evChargers: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-black text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">{t('admin.depots.fast_charging_ports_hint')}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('admin.depots.maintenance_bays_label')}</label>
              <input
                type="number"
                min="0"
                value={formData.maintenanceBays}
                onChange={(e) => setFormData({ ...formData, maintenanceBays: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-black text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">{t('admin.depots.inspection_pits_hint')}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('admin.depots.washing_bays_label')}</label>
              <input
                type="number"
                min="0"
                value={formData.washingBays}
                onChange={(e) => setFormData({ ...formData, washingBays: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">{t('admin.depots.bus_washing_hint')}</p>
            </div>
          </div>

          {/* Fuel Types Available */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">{t('admin.depots.supported_fuel_types')}</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AVAILABLE_FUEL_TYPES.map((fuel) => {
                const checked = formData.fuelTypes.includes(fuel);
                return (
                  <button
                    key={fuel}
                    type="button"
                    onClick={() => handleToggleFuel(fuel)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      checked
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-200 shadow-xs'
                        : 'bg-slate-50 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-white ${checked ? 'bg-blue-600' : 'border border-slate-300 dark:border-zinc-600'}`}>
                      {checked && <FleetIcons.Check className="w-2.5 h-2.5 text-white" />}
                    </span>
                    <span className="truncate">{fuel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Depot Amenities */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">{t('admin.depots.depot_amenities')}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {AVAILABLE_AMENITIES.map((amenity) => {
                const checked = formData.amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleToggleAmenity(amenity)}
                    className={`px-3 py-2 rounded-xl text-[11px] font-bold border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      checked
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 shadow-xs'
                        : 'bg-slate-50 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-white ${checked ? 'bg-emerald-600' : 'border border-slate-300 dark:border-zinc-600'}`}>
                      {checked && <FleetIcons.Check className="w-2.5 h-2.5 text-white" />}
                    </span>
                    <span className="truncate">{amenity}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 4: Operations & Contact */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <FleetIcons.User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  4. Operations & Contact
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">{t('admin.depots.form_section_contact_desc')}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('admin.depots.assigned_manager')}</label>
              <select
                value={formData.assignedOperatorId}
                onChange={(e) => setFormData({ ...formData, assignedOperatorId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              >
                <option value="">{t('admin.depots.select_manager_placeholder')}</option>
                {operatorsList.map((op) => {
                  const roleLabel = typeof op.role === 'object' && op.role !== null
                    ? (op.role.name || op.role.code || '')
                    : (typeof op.role === 'string' ? op.role : '');
                  const subtitle = op.department || roleLabel || 'Operator';
                  return (
                    <option key={op.id} value={op.id}>
                      {op.name || op.email} ({subtitle})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('admin.depots.contact_person')}</label>
              <input
                type="text"
                placeholder={t('admin.depots.contact_person_placeholder')}
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('common.email_address')}</label>
              <input
                type="email"
                placeholder={t('admin.depots.email_placeholder')}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('common.phone_number')}</label>
              <input
                type="tel"
                placeholder="+91 98200 00000"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('admin.depots.emergency_phone_label')}</label>
              <input
                type="tel"
                placeholder="+91 98200 99999"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Form Actions Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-zinc-800">
          <Link
            to={basePath}
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-colors text-center"
          >
            {t('common.cancel')}
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FleetIcons.Check className="w-4 h-4 text-white" />
            )}
            <span>{isEditMode ? t('common.save') : t('admin.depots.add_depot')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDepotPage;
