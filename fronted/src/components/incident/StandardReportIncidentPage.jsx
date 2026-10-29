import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../FleetIcons';
import Breadcrumb from '../ui/Breadcrumb';
import { DriverAddressPicker } from '../driver/DriverAddressPicker';
import { uploadFile, uploadVideo, resolveFileUrl } from '../../api/services/upload.service';
import { fleetIncidentService } from '../../api/services/fleet/incident.service';
import { fleetVehicleService } from '../../api/services/fleet/vehicle.service';
import { fleetDriverService } from '../../api/services/fleet/driver.service';
import { superOrganizationService } from '../../api/services/superadmin/organization.service';
import { useAuth } from '../../hooks/useAuth';
import { reverseGeocodeCoords } from '../../utils/geolocation';

export const StandardReportIncidentPage = ({
  roleTitle = 'Fleet Operator',
  roleScope = 'fleet', // 'fleet' | 'admin' | 'superadmin' | 'driver'
  basePath = '/fleet-operator',
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);

  // Scoped Dropdown Resources
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState(
    roleScope === 'superadmin' ? '' : String(user?.organization_id || user?.organizationId || '')
  );
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    organizationId: roleScope === 'superadmin' ? '' : (user?.organization_id || ''),
    vehicleId: '',
    driverId: '',
    incidentType: 'Road Condition',
    description: '',
    location: '',
    landmark: '',
    latitude: null,
    longitude: null,
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    placeId: '',
    dateTime:
      new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' · ' +
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    photos: [],
    videos: [],
    severity: 'low',
    affectedParties: ['Vehicle'],
    immediateAction: '',
    contactPreference: 'Yes',
    contactNumber: user?.phone || '',
    // Emergency & Medical Fields
    deadCasualty: 0,
    injuredCount: 0,
    hospitalName: '',
    ambulanceAssigned: false,
    ambulanceTiming: '',
    // Context Fields
    policeNotified: false,
    policeStationName: '',
    towingRequested: false,
    weatherConditions: 'Clear',
    roadType: 'City Street',
    trafficDisruptionLevel: 'none',
  });

  // Helper to resolve the driver assigned to a vehicle
  const getVehicleAssignedDriver = (v) => {
    if (!v) return null;
    const assignedId = v.assigned_driver_id || v.driver?.id;
    if (assignedId) {
      const match = drivers.find((d) => String(d.id) === String(assignedId));
      if (match) return match;
      if (v.driver) return { id: v.driver.id, name: v.driver.name, emp_id: v.driver.emp_id };
      return { id: assignedId, name: `Driver #${assignedId}` };
    }
    const matching = drivers.find((d) => Number(d.assigned_bus_id) === Number(v.id));
    return matching || null;
  };

  const selectedVehicle = useMemo(() => {
    return vehicles.find((v) => String(v.id) === String(formData.vehicleId)) || null;
  }, [vehicles, formData.vehicleId]);

  const assignedDriverForSelectedVeh = useMemo(() => {
    return getVehicleAssignedDriver(selectedVehicle);
  }, [selectedVehicle, drivers]);

  // Load organizations for SuperAdmin
  useEffect(() => {
    if (roleScope === 'superadmin') {
      superOrganizationService
        .getOrganizations({ limit: 100 })
        .then((res) => {
          const list = Array.isArray(res) ? res : res?.rows || res?.items || res?.organizations || [];
          setOrganizations(list);
          if (list.length > 0 && !selectedOrgId) {
            setSelectedOrgId(String(list[0].id));
            setFormData((prev) => ({ ...prev, organizationId: list[0].id }));
          }
        })
        .catch(() => {});
    }
  }, [roleScope]);

  // Load Vehicles & Drivers based on roleScope and selectedOrgId
  useEffect(() => {
    if (roleScope === 'superadmin' && !selectedOrgId) {
      setVehicles([]);
      setDrivers([]);
      return;
    }

    let isMounted = true;
    setResourcesLoading(true);

    const queryParams = { limit: 100 };
    if (roleScope === 'superadmin' && selectedOrgId) {
      queryParams.organization_id = selectedOrgId;
    }

    Promise.allSettled([
      fleetVehicleService.getVehicles(queryParams),
      fleetDriverService.getDrivers(queryParams),
    ])
      .then(([vehResult, drvResult]) => {
        if (!isMounted) return;
        if (vehResult.status === 'fulfilled') {
          const vList = Array.isArray(vehResult.value)
            ? vehResult.value
            : vehResult.value?.rows || vehResult.value?.items || vehResult.value?.vehicles || [];
          setVehicles(vList);
        }
        if (drvResult.status === 'fulfilled') {
          const dList = Array.isArray(drvResult.value)
            ? drvResult.value
            : drvResult.value?.rows || drvResult.value?.items || drvResult.value?.drivers || [];
          setDrivers(dList);
        }
      })
      .finally(() => {
        if (isMounted) setResourcesLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [roleScope, selectedOrgId]);

  // When Tenant Organization changes (SuperAdmin)
  const handleOrgChange = (newOrgId) => {
    setSelectedOrgId(newOrgId);
    setVehicles([]);
    setDrivers([]);
    setFormData((prev) => ({
      ...prev,
      organizationId: newOrgId,
      vehicleId: '',
      driverId: '',
    }));
  };

  // When Vehicle is picked, auto-select the driver assigned to that bus
  const handleVehicleChange = (vId) => {
    if (!vId) {
      setFormData((prev) => ({ ...prev, vehicleId: '', driverId: '' }));
      return;
    }

    const foundVeh = vehicles.find((v) => String(v.id) === String(vId));
    let autoDriverId = '';
    let autoDriverName = '';

    if (foundVeh) {
      const assigned = getVehicleAssignedDriver(foundVeh);
      if (assigned) {
        autoDriverId = String(assigned.id);
        autoDriverName = assigned.name || assigned.user?.name || `Driver #${assigned.id}`;
      }
    }

    setFormData((prev) => ({
      ...prev,
      vehicleId: String(vId),
      driverId: autoDriverId,
    }));

    if (autoDriverId && autoDriverName) {
      toast.success(
        `Driver "${autoDriverName}" auto-selected for Bus ${foundVeh?.bus_number || vId}`,
        {
          id: 'driver-auto-assigned',
          icon: '🚌',
        }
      );
    }
  };

  // When Driver is picked, auto-suggest vehicle if driver has assigned_bus_id
  const handleDriverChange = (dId) => {
    setFormData((prev) => {
      const updated = { ...prev, driverId: dId };
      if (dId && !prev.vehicleId) {
        const foundDriver = drivers.find((d) => String(d.id) === String(dId));
        const busId = foundDriver?.assigned_bus_id || foundDriver?.assignedBus?.id;
        if (busId) {
          const foundVeh = vehicles.find((v) => Number(v.id) === Number(busId));
          if (foundVeh) {
            updated.vehicleId = String(foundVeh.id);
            toast.success(
              `Bus "${foundVeh.bus_number}" auto-selected for Driver ${foundDriver.name}`,
              { id: 'veh-auto-assigned', icon: '🚌' }
            );
          }
        }
      }
      return updated;
    });
  };

  const incidentTypes = [
    { id: 'Accident', label: 'Accident', desc: 'Road accident or collision', icon: <FleetIcons.Alert className="w-5 h-5 text-red-600" /> },
    { id: 'Breakdown', label: 'Breakdown', desc: 'Mechanical / engine fault', icon: <FleetIcons.Settings className="w-5 h-5 text-amber-600" /> },
    { id: 'Road Condition', label: 'Road Condition', desc: 'Damaged road, potholes, blockage', icon: <FleetIcons.Speed className="w-5 h-5 text-blue-600" /> },
    { id: 'Traffic Issue', label: 'Traffic Issue', desc: 'Traffic congestion or diversion', icon: <FleetIcons.Traffic className="w-5 h-5 text-purple-600" /> },
    { id: 'Passenger Issue', label: 'Passenger Issue', desc: 'Medical or onboard emergency', icon: <FleetIcons.Driver className="w-5 h-5 text-indigo-600" /> },
    { id: 'Infrastructure', label: 'Infrastructure', desc: 'Bus shelter or display unit fault', icon: <FleetIcons.Layers className="w-5 h-5 text-teal-600" /> },
    { id: 'Safety Concern', label: 'Safety Concern', desc: 'Hazardous route obstacle', icon: <FleetIcons.Shield className="w-5 h-5 text-rose-600" /> },
    { id: 'Other', label: 'Other', desc: 'Any other transit incident', icon: <FleetIcons.Document className="w-5 h-5 text-slate-600" /> },
  ];

  const severityOptions = [
    { id: 'low', label: 'Low', desc: 'Minor issue, no transit stoppage', color: 'emerald' },
    { id: 'medium', label: 'Medium', desc: 'Moderate issue, minor route delay', color: 'amber' },
    { id: 'high', label: 'High', desc: 'Major issue, schedule impacted', color: 'orange' },
    { id: 'critical', label: 'Critical', desc: 'Severe emergency, transit halted', color: 'red' },
  ];

  const affectedOptions = ['Passengers', 'Driver', 'Vehicle', 'Infrastructure', 'Other'];

  const toggleAffected = (option) => {
    if (formData.affectedParties.includes(option)) {
      setFormData({ ...formData, affectedParties: formData.affectedParties.filter((p) => p !== option) });
    } else {
      setFormData({ ...formData, affectedParties: [...formData.affectedParties, option] });
    }
  };

  // Browser Geolocation Detection with Reverse Geocoding
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    setDetectingGps(true);
    const toastId = toast.loading('Acquiring GPS location & resolving address...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        try {
          const geo = await reverseGeocodeCoords(lat, lng);
          handleAddressPickerChange(geo);
          toast.dismiss(toastId);
          toast.success(`GPS Location & Address locked: ${geo.city || geo.state || geo.address}`);
        } catch {
          const fallback = `GPS Location (${lat}, ${lng})`;
          handleAddressPickerChange({
            address: fallback,
            location: fallback,
            latitude: lat,
            longitude: lng,
          });
          toast.dismiss(toastId);
          toast.success(`GPS Coordinates captured (${lat}, ${lng})`);
        } finally {
          setDetectingGps(false);
        }
      },
      (err) => {
        setDetectingGps(false);
        toast.dismiss(toastId);
        toast.error('Could not detect GPS location: ' + err.message);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Address picker change
  const handleAddressPickerChange = (addr) => {
    const finalAddr = addr.address || addr.location || '';
    setFormData((prev) => ({
      ...prev,
      address: finalAddr || prev.address,
      location:
        finalAddr ||
        prev.location ||
        (addr.latitude != null ? `GPS Location (${addr.latitude}, ${addr.longitude})` : prev.location),
      city: addr.city !== undefined ? addr.city : prev.city,
      state: addr.state !== undefined ? addr.state : prev.state,
      pincode: addr.pincode !== undefined ? addr.pincode : prev.pincode,
      country: addr.country !== undefined ? addr.country : prev.country,
      placeId: addr.placeId !== undefined ? addr.placeId : prev.placeId,
      latitude: addr.latitude != null ? addr.latitude : prev.latitude,
      longitude: addr.longitude != null ? addr.longitude : prev.longitude,
    }));
  };

  // Photo Upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await uploadFile(file, 'incident_photo');
      const url = res?.url || res?.path || res?.fileUrl || res?.filePath;
      if (url) {
        setFormData((prev) => ({ ...prev, photos: [...prev.photos, url] }));
        toast.success('Incident photo evidence uploaded');
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to upload photo');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  // Video Upload
  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    try {
      const res = await uploadVideo(file, 'incident_video');
      const url = res?.url || res?.path || res?.fileUrl || res?.filePath;
      if (url) {
        setFormData((prev) => ({ ...prev, videos: [...prev.videos, url] }));
        toast.success('Incident video recording uploaded');
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to upload video');
    } finally {
      setUploadingVideo(false);
      e.target.value = '';
    }
  };

  // Step 1 -> Step 2 validation
  const handleContinueToStep2 = () => {
    if (roleScope === 'superadmin' && !selectedOrgId) {
      toast.error('Please select a Tenant Organization before continuing.');
      return;
    }
    setCurrentStep(2);
  };

  // Submit Handler
  const handleSubmitReport = async (e) => {
    if (e) e.preventDefault();
    if (submitting) return;

    if (roleScope === 'superadmin' && !selectedOrgId) {
      toast.error('Please select a Tenant Organization.');
      setCurrentStep(1);
      return;
    }

    if (!formData.description?.trim()) {
      toast.error('Please provide a brief incident description.');
      setCurrentStep(1);
      return;
    }

    const payload = {
      organizationId: formData.organizationId || (roleScope === 'superadmin' ? selectedOrgId : user?.organization_id),
      vehicleId: formData.vehicleId ? Number(formData.vehicleId) : null,
      driverId: formData.driverId ? Number(formData.driverId) : null,
      incidentType: formData.incidentType,
      description: formData.description,
      location: formData.location || formData.address || (formData.city ? `${formData.city}, ${formData.state || ''}`.trim() : 'Incident Scene'),
      landmark: formData.landmark,
      latitude: formData.latitude ? Number(formData.latitude) : null,
      longitude: formData.longitude ? Number(formData.longitude) : null,
      severity: (formData.severity || 'low').toLowerCase(),
      affectedParties: formData.affectedParties,
      immediateAction: formData.immediateAction,
      contactPreference: formData.contactPreference,
      contactNumber: formData.contactNumber,
      photos: formData.photos,
      videos: formData.videos,
      deadCasualty: Number(formData.deadCasualty) || 0,
      injuredCount: Number(formData.injuredCount) || 0,
      hospitalName: formData.hospitalName,
      ambulanceAssigned: Boolean(formData.ambulanceAssigned),
      ambulanceTiming: formData.ambulanceTiming,
      policeNotified: Boolean(formData.policeNotified),
      policeStationName: formData.policeStationName,
      towingRequested: Boolean(formData.towingRequested),
      weatherConditions: formData.weatherConditions,
      roadType: formData.roadType,
      trafficDisruptionLevel: formData.trafficDisruptionLevel,
    };

    setSubmitting(true);
    try {
      const created = await toast.promise(fleetIncidentService.createIncident(payload), {
        loading: 'Broadcasting emergency incident report & notifying dispatch...',
        success: 'Incident report submitted successfully to Central Dispatch!',
        error: (err) => err?.message || 'Failed to submit incident report',
      });

      navigate(`${basePath}/incident-report/success`, {
        state: { incident: created || payload },
      });
    } catch (_) {
      /* toast handles error UI */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: roleTitle, to: `${basePath}/dashboard` },
              { label: 'Incidents Log', to: `${basePath}/incidents` },
              { label: 'Report Incident' },
            ]}
            className="mb-2"
          />
          <div className="mt-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('incident.report_incident_title', 'Report Emergency Incident')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
              Standardized transit road incident reporting system for immediate dispatch and management oversight.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            to={`${basePath}/incidents`}
            className="px-3.5 py-2 bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm border border-transparent dark:border-zinc-700"
          >
            <FleetIcons.Alert className="w-4 h-4 text-red-400" />
            <span>View Incidents Log</span>
          </Link>
          <span className="text-xs font-bold px-3 py-1 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-full">
            Step {currentStep} of 4
          </span>
        </div>
      </div>

      {/* Stepper Navigation Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { step: 1, title: 'Type & Resources', desc: 'Category, Bus & Driver' },
            { step: 2, title: 'GPS Location', desc: 'Address & Coordinates' },
            { step: 3, title: 'Medical & Severity', desc: 'Casualties & Assistance' },
            { step: 4, title: 'Media & Submit', desc: 'Evidence & Confirmation' },
          ].map((s) => (
            <button
              key={s.step}
              type="button"
              onClick={() => setCurrentStep(s.step)}
              className={`p-2.5 rounded-xl text-left transition-all flex items-center gap-3 cursor-pointer ${
                currentStep === s.step
                  ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-sm'
                  : currentStep > s.step
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-50 dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                  currentStep === s.step
                    ? 'bg-white/20 text-white'
                    : currentStep > s.step
                    ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                    : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300'
                }`}
              >
                {currentStep > s.step ? '✓' : s.step}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold truncate">{s.title}</div>
                <div className="text-[10px] opacity-75 truncate">{s.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* FORM BODY */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        {/* STEP 1: TYPE & TARGET RESOURCES */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Step 1: Incident Category & Target Vehicle / Staff
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Select the affected unit and categorize the emergency event.
              </p>
            </div>

            {/* Target Scoping Dropdowns */}
            <div
              className={`p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 grid grid-cols-1 ${
                roleScope === 'superadmin' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
              } gap-4 text-xs`}
            >
              {/* Organization Picker (SuperAdmin only) */}
              {roleScope === 'superadmin' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 dark:text-zinc-300">
                      Tenant Organization *
                    </label>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      Step 1 (Tenant)
                    </span>
                  </div>
                  <select
                    value={selectedOrgId}
                    onChange={(e) => handleOrgChange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Tenant Organization</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name} ({org.code || `Org #${org.id}`})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Vehicle Picker */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">
                    Involved Vehicle (Bus) {resourcesLoading && <span className="text-blue-500 font-normal">Loading...</span>}
                  </label>
                  {roleScope === 'superadmin' && (
                    <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500">
                      Step 2 (Bus)
                    </span>
                  )}
                </div>
                <select
                  value={formData.vehicleId}
                  onChange={(e) => handleVehicleChange(e.target.value)}
                  disabled={roleScope === 'superadmin' && !selectedOrgId}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {roleScope === 'superadmin' && !selectedOrgId
                      ? 'Select Tenant Organization first'
                      : 'Unassigned / General Incident'}
                  </option>
                  {vehicles.map((v) => {
                    const drv = getVehicleAssignedDriver(v);
                    const drvName = drv ? (drv.name || drv.user?.name) : null;
                    return (
                      <option key={v.id} value={v.id}>
                        {v.bus_number || v.code || `Vehicle #${v.id}`} — {v.model || v.vehicle_type || 'Bus'}
                        {drvName ? ` (Driver: ${drvName})` : ' (No assigned driver)'}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Driver Picker */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">
                    Assigned Driver {resourcesLoading && <span className="text-blue-500 font-normal">Loading...</span>}
                  </label>
                  {roleScope === 'superadmin' && (
                    <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500">
                      Step 3 (Driver)
                    </span>
                  )}
                </div>
                <select
                  value={formData.driverId}
                  onChange={(e) => handleDriverChange(e.target.value)}
                  disabled={roleScope === 'superadmin' && !selectedOrgId}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {roleScope === 'superadmin' && !selectedOrgId
                      ? 'Select Tenant Organization first'
                      : 'Unassigned / Outside Driver'}
                  </option>

                  {/* Highlight the driver assigned to the selected bus */}
                  {assignedDriverForSelectedVeh && (
                    <optgroup label={`⭐ Assigned Driver for Bus ${selectedVehicle?.bus_number || ''}`}>
                      <option value={assignedDriverForSelectedVeh.id}>
                        ⭐ {assignedDriverForSelectedVeh.name || assignedDriverForSelectedVeh.user?.name}
                        {assignedDriverForSelectedVeh.emp_id ? ` (${assignedDriverForSelectedVeh.emp_id})` : ''} [Auto-Linked]
                      </option>
                    </optgroup>
                  )}

                  <optgroup label={assignedDriverForSelectedVeh ? 'Other Drivers in Organization' : 'All Drivers'}>
                    {drivers
                      .filter(
                        (d) =>
                          !assignedDriverForSelectedVeh ||
                          String(d.id) !== String(assignedDriverForSelectedVeh.id)
                      )
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name || d.user?.name || `Driver #${d.id}`} {d.emp_id ? `(${d.emp_id})` : ''}
                          {d.assigned_bus_number ? ` (Bus: ${d.assigned_bus_number})` : ''}
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              {/* Dynamic Cascading Confirmation Pill */}
              {selectedVehicle && (
                <div
                  className={`col-span-1 ${
                    roleScope === 'superadmin' ? 'sm:col-span-3' : 'sm:col-span-2'
                  } p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs ${
                    assignedDriverForSelectedVeh
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300'
                      : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {assignedDriverForSelectedVeh ? (
                      <FleetIcons.Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    ) : (
                      <FleetIcons.Alert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    )}
                    <div>
                      {assignedDriverForSelectedVeh ? (
                        <span>
                          <strong>Auto-Linked:</strong> Bus{' '}
                          <span className="font-black underline">{selectedVehicle.bus_number}</span> is
                          regularly operated by{' '}
                          <span className="font-black underline">
                            {assignedDriverForSelectedVeh.name || assignedDriverForSelectedVeh.user?.name}
                          </span>
                          {assignedDriverForSelectedVeh.emp_id ? ` (${assignedDriverForSelectedVeh.emp_id})` : ''}.
                          Driver has been automatically pre-selected.
                        </span>
                      ) : (
                        <span>
                          <strong>No Primary Driver:</strong> Bus{' '}
                          <span className="font-black">{selectedVehicle.bus_number}</span> has no permanent driver
                          assigned in the fleet roster. You can pick an operating driver from the dropdown or leave
                          as Unassigned.
                        </span>
                      )}
                    </div>
                  </div>

                  {assignedDriverForSelectedVeh &&
                    formData.driverId &&
                    String(formData.driverId) !== String(assignedDriverForSelectedVeh.id) && (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-[10px] font-black uppercase tracking-wider self-start sm:self-auto border border-amber-200 dark:border-amber-800">
                        Relief Driver Overridden
                      </span>
                    )}
                </div>
              )}
            </div>

            {/* Category Grid */}
            <div>
              <label className="block font-bold text-xs text-slate-700 dark:text-zinc-300 mb-2">
                Incident Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {incidentTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, incidentType: type.id })}
                    className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                      formData.incidentType === type.id
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 hover:bg-slate-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-900 shadow-xs flex items-center justify-center mb-2">
                      {type.icon}
                    </div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">{type.label}</div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                      {type.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-bold text-xs text-slate-700 dark:text-zinc-300 mb-1.5">
                Incident Description *
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what occurred, immediate hazards, vehicle condition, or road blockages..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Affected Parties */}
            <div>
              <label className="block font-bold text-xs text-slate-700 dark:text-zinc-300 mb-2">
                Affected Entities / Parties
              </label>
              <div className="flex flex-wrap gap-2">
                {affectedOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleAffected(opt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      formData.affectedParties.includes(opt)
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {formData.affectedParties.includes(opt) ? '✓ ' : '+ '}
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Next Button */}
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={handleContinueToStep2}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                Continue to GPS Location →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: GPS LOCATION & MAP PICKER */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  Step 2: Incident Scene Location & Map Pin
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Pinpoint exact coordinates for recovery vehicles and emergency dispatch.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDetectGps}
                disabled={detectingGps}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto"
              >
                <FleetIcons.Speed className="w-4 h-4" />
                <span>{detectingGps ? 'Detecting GPS...' : 'Auto-Detect Current GPS'}</span>
              </button>
            </div>

            {/* Interactive Address Picker Component */}
            <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-zinc-800/30">
              <DriverAddressPicker
                addressData={formData}
                onChange={handleAddressPickerChange}
                searchLabel="Search Scene Location or Route Landmark"
                searchPlaceholder="Search road, junction, depot or highway milestone..."
              />
            </div>

            {/* Landmark & Manual Coordinates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Prominent Landmark
                </label>
                <input
                  type="text"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  placeholder="e.g. Near Metro Pillar #42, Toll Plaza"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Latitude
                </label>
                <input
                  type="text"
                  value={formData.latitude || ''}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  placeholder="e.g. 19.0760"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Longitude
                </label>
                <input
                  type="text"
                  value={formData.longitude || ''}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  placeholder="e.g. 72.8777"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            {/* Stepper Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold text-xs rounded-xl transition-all"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                Continue to Medical & Severity →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: MEDICAL, CASUALTIES & SEVERITY */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Step 3: Medical Emergency, Casualties & Road Condition
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Report critical casualty counts and emergency assistance dispatch needs.
              </p>
            </div>

            {/* Severity Radio Options */}
            <div>
              <label className="block font-bold text-xs text-slate-700 dark:text-zinc-300 mb-2">
                Emergency Severity Level *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {severityOptions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, severity: s.id })}
                    className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                      formData.severity === s.id
                        ? 'border-red-500 bg-red-50/50 dark:bg-red-950/30 ring-2 ring-red-500/20'
                        : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 hover:bg-slate-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs uppercase text-slate-900 dark:text-white">
                        {s.label}
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                      {s.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Casualties Block */}
            <div className="p-4 rounded-2xl bg-red-50/40 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-red-900 dark:text-red-300 mb-1">
                  Fatalities / Dead Casualties
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.deadCasualty}
                  onChange={(e) => setFormData({ ...formData, deadCasualty: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-800 text-xs font-black text-red-700 dark:text-red-400"
                />
              </div>

              <div>
                <label className="block font-bold text-amber-900 dark:text-amber-300 mb-1">
                  Injured Persons Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.injuredCount}
                  onChange={(e) => setFormData({ ...formData, injuredCount: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-800 text-xs font-black text-amber-700 dark:text-amber-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Admitted Hospital Name (If Any)
                </label>
                <input
                  type="text"
                  value={formData.hospitalName}
                  onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                  placeholder="e.g. City Civil Hospital"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Emergency Services Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Ambulance */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 space-y-2">
                <label className="flex items-center gap-2 font-bold cursor-pointer text-slate-900 dark:text-white">
                  <input
                    type="checkbox"
                    checked={formData.ambulanceAssigned}
                    onChange={(e) => setFormData({ ...formData, ambulanceAssigned: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>Ambulance Dispatched</span>
                </label>
                {formData.ambulanceAssigned && (
                  <input
                    type="text"
                    value={formData.ambulanceTiming}
                    onChange={(e) => setFormData({ ...formData, ambulanceTiming: e.target.value })}
                    placeholder="Timing / ETA (e.g. 10 mins)"
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs"
                  />
                )}
              </div>

              {/* Police */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 space-y-2">
                <label className="flex items-center gap-2 font-bold cursor-pointer text-slate-900 dark:text-white">
                  <input
                    type="checkbox"
                    checked={formData.policeNotified}
                    onChange={(e) => setFormData({ ...formData, policeNotified: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>Police Notified</span>
                </label>
                {formData.policeNotified && (
                  <input
                    type="text"
                    value={formData.policeStationName}
                    onChange={(e) => setFormData({ ...formData, policeStationName: e.target.value })}
                    placeholder="Police Station Name / Chowki"
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs"
                  />
                )}
              </div>

              {/* Towing / Crane */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 space-y-2">
                <label className="flex items-center gap-2 font-bold cursor-pointer text-slate-900 dark:text-white">
                  <input
                    type="checkbox"
                    checked={formData.towingRequested}
                    onChange={(e) => setFormData({ ...formData, towingRequested: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>Towing / Crane Requested</span>
                </label>
                <p className="text-[11px] text-slate-500">
                  Requests breakdown crane assistance from nearest depot.
                </p>
              </div>
            </div>

            {/* Stepper Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold text-xs rounded-xl transition-all"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                Continue to Media & Submit →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: MEDIA EVIDENCE, CONTACT & SUBMIT */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Step 4: Media Evidence & Incident Confirmation
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Attach photo/video evidence from the scene and submit emergency broadcast.
              </p>
            </div>

            {/* Media Uploaders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Photo Evidence */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FleetIcons.Image className="w-4 h-4 text-blue-500" />
                    <span>Photo Evidence ({formData.photos.length})</span>
                  </label>
                  <label className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-all">
                    {uploadingImage ? 'Uploading...' : '+ Add Photo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>

                {formData.photos.length === 0 ? (
                  <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-zinc-700 rounded-xl text-slate-400 text-xs">
                    No scene photos uploaded yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {formData.photos.map((url, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden h-20 bg-slate-200 dark:bg-zinc-800">
                        <img src={resolveFileUrl(url)} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, photos: formData.photos.filter((_, i) => i !== idx) })}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Video Evidence */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FleetIcons.Video className="w-4 h-4 text-purple-500" />
                    <span>Video Recording ({formData.videos.length})</span>
                  </label>
                  <label className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-all">
                    {uploadingVideo ? 'Uploading...' : '+ Add Video'}
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      disabled={uploadingVideo}
                      className="hidden"
                    />
                  </label>
                </div>

                {formData.videos.length === 0 ? (
                  <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-zinc-700 rounded-xl text-slate-400 text-xs">
                    No video evidence attached.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {formData.videos.map((url, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden h-20 bg-slate-950 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">▶ Video #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, videos: formData.videos.filter((_, i) => i !== idx) })}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Immediate Action & On-Scene Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Immediate Action Taken on Scene
                </label>
                <input
                  type="text"
                  value={formData.immediateAction}
                  onChange={(e) => setFormData({ ...formData, immediateAction: e.target.value })}
                  placeholder="e.g. Passengers safely evacuated to sidewalk"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  On-Scene Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Summary Review Card */}
            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 space-y-2 text-xs">
              <span className="font-bold text-blue-900 dark:text-blue-300 uppercase text-[10px] tracking-wider block">
                Dispatch Broadcast Summary
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700 dark:text-zinc-300 font-medium">
                <div>Category: <strong className="text-slate-900 dark:text-white">{formData.incidentType}</strong></div>
                <div>Severity: <strong className="text-red-600 dark:text-red-400 uppercase">{formData.severity}</strong></div>
                <div>Casualties: <strong className="text-slate-900 dark:text-white">{formData.deadCasualty} Dead, {formData.injuredCount} Injured</strong></div>
                <div>Scene: <strong className="text-slate-900 dark:text-white truncate block">{formData.location || formData.landmark || 'GPS Coordinated'}</strong></div>
              </div>
            </div>

            {/* Stepper Navigation & Submit */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold text-xs rounded-xl transition-all"
              >
                ← Back
              </button>

              <button
                type="button"
                onClick={handleSubmitReport}
                disabled={submitting}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/20 transition-all flex items-center gap-2"
              >
                <FleetIcons.Alert className="w-4 h-4 text-white" />
                <span>{submitting ? 'Broadcasting Report...' : 'Broadcast Emergency Report'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StandardReportIncidentPage;
