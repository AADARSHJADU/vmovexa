import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useAdminDepot } from '../../hooks/admin/useAdminDepot';
import { useAuth } from '../../hooks/useAuth';
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
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const isFleetPortal = location.pathname.startsWith('/fleet-manager');
  const basePath = isFleetPortal ? '/fleet-manager/depots' : '/admin/depots';
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
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm space-y-4">
        <div className="text-4xl">🔒</div>
        <h2 className="text-lg font-black text-slate-900">Access Revoked</h2>
        <p className="text-sm text-slate-500 font-medium">
          Your administrator has revoked your permission to {isEditMode ? 'edit' : 'create'} depots.
        </p>
        <Link
          to={basePath}
          className="inline-block px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
        >
          ← Back to Depots
        </Link>
      </div>
    );
  }

  if (fetching) {
    return (
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm space-y-3">
        <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
        <div className="text-slate-600 font-bold text-sm">Loading depot facility metrics & location...</div>
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
              { label: isFleetPortal ? 'Fleet Operator' : 'Tenant Admin', path: isFleetPortal ? '/fleet-manager/dashboard' : '/admin/dashboard' },
              { label: 'Depot Facilities', path: basePath },
              { label: isEditMode ? 'Edit Depot Facility' : 'Register New Depot' },
            ]}
            className="mb-2"
          />
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {isEditMode ? 'Edit Depot Facility' : 'Register New Depot Facility'}
            </h1>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-md font-bold">
              {isFleetPortal ? 'Fleet Manager Portal' : 'Admin Operations'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
            Establish home operating depot, Google Maps GPS coordinates, parking bays, and EV charging infrastructure
          </p>
        </div>

        {/* Audit Meta in Edit Mode */}
        {isEditMode && auditMeta && (
          <div className="text-right text-[11px] text-slate-400 font-mono bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <div>Created: {auditMeta.createdAt ? new Date(auditMeta.createdAt).toLocaleDateString() : 'N/A'} {auditMeta.creator?.name ? `by ${auditMeta.creator.name}` : ''}</div>
            {auditMeta.updatedAt && (
              <div className="text-slate-500">Updated: {new Date(auditMeta.updatedAt).toLocaleDateString()} {auditMeta.updater?.name ? `by ${auditMeta.updater.name}` : ''}</div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: Facility Basics & Classification */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <span>🏢 1. Facility Basics & Classification</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">Depot identity, operational category, and status</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Depot Facility Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Central Majestic Transit Terminal"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Facility Code <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. DEP-BLR-01"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 shadow-xs uppercase"
              />
              <p className="text-[10px] text-slate-400 mt-1">Leave empty for auto DEP-XXXX</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Operational Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 shadow-xs"
              >
                <option value="operational">🟢 Operational</option>
                <option value="maintenance">🟡 Maintenance</option>
                <option value="closed">🔴 Closed / Inactive</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Depot Classification / Type</label>
              <select
                value={formData.depotType}
                onChange={(e) => setFormData({ ...formData, depotType: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 shadow-xs"
              >
                <option value="main_terminal">Main Transit Terminal (Central Hub)</option>
                <option value="sub_depot">Sub-Depot / Satellite Yard</option>
                <option value="workshop">Heavy Maintenance & Workshop Depot</option>
                <option value="charging_hub">EV Fast-Charging & Overnight Hub</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Operating Hours</label>
              <input
                type="text"
                placeholder="e.g. 24x7 or 05:00 AM - 11:30 PM"
                value={formData.operatingHours}
                onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Google Maps Location & Geofencing */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <span>📍 2. Geospatial Location & Geofencing (Google Maps)</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Real-time Google Maps search, draggable gate coordinates, and automated yard entry perimeter
            </p>
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

        {/* SECTION 3: Capacity, Maintenance & Fuel Infrastructure */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <span>⚡ 3. Capacity, Maintenance & Energy Infrastructure</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">Configure vehicle bay quotas, EV chargers, and maintenance pits</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Bus Parking Capacity *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 shadow-xs"
              />
              <p className="text-[10px] text-slate-400 mt-1">Total parking slots</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">EV Fast Chargers</label>
              <input
                type="number"
                min="0"
                value={formData.evChargers}
                onChange={(e) => setFormData({ ...formData, evChargers: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-emerald-700 focus:outline-none focus:ring-2 focus:ring-slate-300 shadow-xs"
              />
              <p className="text-[10px] text-slate-400 mt-1">DC fast charging ports</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Maintenance Bays / Pits</label>
              <input
                type="number"
                min="0"
                value={formData.maintenanceBays}
                onChange={(e) => setFormData({ ...formData, maintenanceBays: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-blue-700 focus:outline-none focus:ring-2 focus:ring-slate-300 shadow-xs"
              />
              <p className="text-[10px] text-slate-400 mt-1">Service & inspection pits</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Automated Wash Bays</label>
              <input
                type="number"
                min="0"
                value={formData.washingBays}
                onChange={(e) => setFormData({ ...formData, washingBays: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 shadow-xs"
              />
              <p className="text-[10px] text-slate-400 mt-1">Bus washing bays</p>
            </div>
          </div>

          {/* Fuel Types Available */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-slate-700">Fuel & Energy Types Supported</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AVAILABLE_FUEL_TYPES.map((fuel) => {
                const checked = formData.fuelTypes.includes(fuel);
                return (
                  <button
                    key={fuel}
                    type="button"
                    onClick={() => handleToggleFuel(fuel)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border text-left flex items-center gap-2 transition-all ${
                      checked
                        ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] text-white ${checked ? 'bg-blue-600' : 'border border-slate-300'}`}>
                      {checked && '✓'}
                    </span>
                    <span className="truncate">{fuel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Depot Amenities */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-slate-700">On-Site Amenities & Security</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {AVAILABLE_AMENITIES.map((amenity) => {
                const checked = formData.amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleToggleAmenity(amenity)}
                    className={`px-3 py-2 rounded-xl text-[11px] font-bold border text-left flex items-center gap-2 transition-all ${
                      checked
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] text-white ${checked ? 'bg-emerald-600' : 'border border-slate-300'}`}>
                      {checked && '✓'}
                    </span>
                    <span className="truncate">{amenity}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 4: Personnel & Operations Management */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <span>👤 4. Management & Operational Control Desk</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">Assign depot superintendent and helpline contacts</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Depot Manager / Operator In-Charge</label>
              <select
                value={formData.assignedOperatorId}
                onChange={(e) => setFormData({ ...formData, assignedOperatorId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 shadow-xs"
              >
                <option value="">-- Select Manager / Operator from this Organization --</option>
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
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Contact Person Name</label>
              <input
                type="text"
                placeholder="e.g. Ramesh Sharma (Superintendent)"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Official Depot Email</label>
              <input
                type="email"
                placeholder="e.g. depot.majestic@vmovexa.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Facility Helpline Phone</label>
              <input
                type="tel"
                placeholder="+91 98200 00000"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Emergency / Control Desk Phone</label>
              <input
                type="tel"
                placeholder="+91 98200 99999"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Form Actions Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-200">
          <Link
            to={basePath}
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FleetIcons.Check className="w-4 h-4" />
            )}
            <span>{isEditMode ? 'Update Depot Facility Details' : 'Register Depot Facility'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDepotPage;
