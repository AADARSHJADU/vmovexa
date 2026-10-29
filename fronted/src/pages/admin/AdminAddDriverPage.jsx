import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { MultipleDocumentUploader } from '../../components/ui/MultipleDocumentUploader';
import { DriverAddressPicker } from '../../components/driver/DriverAddressPicker';
import { useAdminDriver } from '../../hooks/admin/useAdminDriver';
import { useAdminDepot } from '../../hooks/admin/useAdminDepot';
import { useAdminVehicle } from '../../hooks/admin/useAdminVehicle';
import { useAdminFleetOperator } from '../../hooks/admin/useAdminFleetOperator';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import { resolveFileUrl, uploadFile } from '../../api/services/upload.service';

const DRIVER_SHIFT_PRESETS = [
  { label: 'Morning Shift', iconType: 'Morning', start: '06:00', end: '14:00', desc: '06:00 AM - 02:00 PM' },
  { label: 'Evening Shift', iconType: 'Evening', start: '14:00', end: '22:00', desc: '02:00 PM - 10:00 PM' },
  { label: 'Night Shift', iconType: 'Night', start: '22:00', end: '06:00', desc: '10:00 PM - 06:00 AM' },
  { label: 'Split Shift', iconType: 'Split', start: '07:00', end: '19:00', desc: '07:00 AM - 07:00 PM' },
  { label: 'Custom Shift', iconType: 'Custom', start: null, end: null, desc: 'Custom Hours' },
];

function formatTime12Hour(time24) {
  if (!time24) return '';
  const parts = time24.split(':');
  let h = parseInt(parts[0], 10);
  const m = parts[1] || '00';
  if (isNaN(h)) return '';
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${m} ${period}`;
}

function getPeriod(time24) {
  if (!time24) return 'AM';
  const h = parseInt(time24.split(':')[0], 10);
  return h >= 12 ? 'PM' : 'AM';
}

function toggleAmPm(time24) {
  if (!time24) return '06:00';
  const parts = time24.split(':');
  let h = parseInt(parts[0], 10);
  const m = parts[1] || '00';
  if (isNaN(h)) return '06:00';
  if (h >= 12) {
    h -= 12;
  } else {
    h += 12;
  }
  return `${String(h).padStart(2, '0')}:${m}`;
}

function calculateShiftDuration(start24, end24) {
  if (!start24 || !end24) return null;
  const [sH, sM] = start24.split(':').map(Number);
  const [eH, eM] = end24.split(':').map(Number);
  if (isNaN(sH) || isNaN(sM) || isNaN(eH) || isNaN(eM)) return null;

  const startMinutes = sH * 60 + sM;
  let endMinutes = eH * 60 + eM;

  let isOvernight = false;
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
    isOvernight = true;
  } else if (endMinutes === startMinutes) {
    return {
      hours: 24,
      minutes: 0,
      totalMinutes: 1440,
      isOvernight: false,
      label: '24 hrs 00 mins',
      shortLabel: '24h',
    };
  }

  const diff = endMinutes - startMinutes;
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;

  const hoursStr = `${hours} hr${hours !== 1 ? 's' : ''}`;
  const minsStr = minutes > 0 ? ` ${String(minutes).padStart(2, '0')} min${minutes !== 1 ? 's' : ''}` : ' 00 mins';

  return {
    hours,
    minutes,
    totalMinutes: diff,
    isOvernight,
    label: `${hoursStr}${minsStr}`,
    shortLabel: `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`,
  };
}

function parseShiftStringToTimes(shiftStr) {
  if (!shiftStr) return { start: '06:00', end: '14:00', preset: 'Morning Shift' };

  const match12 = shiftStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*[-–to ]+\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (match12) {
    let sH = parseInt(match12[1], 10);
    const sM = match12[2];
    const sP = match12[3].toUpperCase();
    if (sP === 'PM' && sH < 12) sH += 12;
    if (sP === 'AM' && sH === 12) sH = 0;

    let eH = parseInt(match12[4], 10);
    const eM = match12[5];
    const eP = match12[6].toUpperCase();
    if (eP === 'PM' && eH < 12) eH += 12;
    if (eP === 'AM' && eH === 12) eH = 0;

    const start = `${String(sH).padStart(2, '0')}:${sM}`;
    const end = `${String(eH).padStart(2, '0')}:${eM}`;
    const matchedPreset = DRIVER_SHIFT_PRESETS.find((p) => p.start === start && p.end === end);
    return { start, end, preset: matchedPreset ? matchedPreset.label : 'Custom Shift' };
  }

  const match24 = shiftStr.match(/(\d{1,2}):(\d{2})\s*[-–to ]+\s*(\d{1,2}):(\d{2})/);
  if (match24) {
    const start = `${match24[1].padStart(2, '0')}:${match24[2]}`;
    const end = `${match24[3].padStart(2, '0')}:${match24[4]}`;
    const matchedPreset = DRIVER_SHIFT_PRESETS.find((p) => p.start === start && p.end === end);
    return { start, end, preset: matchedPreset ? matchedPreset.label : 'Custom Shift' };
  }

  if (/evening/i.test(shiftStr)) return { start: '14:00', end: '22:00', preset: 'Evening Shift' };
  if (/night/i.test(shiftStr)) return { start: '22:00', end: '06:00', preset: 'Night Shift' };
  if (/split/i.test(shiftStr)) return { start: '07:00', end: '19:00', preset: 'Split Shift' };

  return { start: '06:00', end: '14:00', preset: 'Morning Shift' };
}

export const AdminAddDriverPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const location = useLocation();

  // Detect if rendered inside Fleet Portal (/fleet-operator/*)
  const isFleetPortal = (location.pathname.startsWith('/fleet-operator') || location.pathname.startsWith('/fleet-operator'));
  const basePath = isFleetPortal ? '/fleet-operator/drivers' : '/admin/drivers';
  const dashboardLink = isFleetPortal ? '/fleet-operator/dashboard' : '/admin/dashboard';

  const { user, hasPermission } = useAuth();
  // RBAC permission gates (always true for Admin portal)
  const canCreate = !isFleetPortal || hasPermission('fleet.drivers.create');
  const canUpdate = !isFleetPortal || hasPermission('fleet.drivers.update');
  const canViewDrivers = !isFleetPortal || hasPermission('fleet.drivers.view');
  const canViewDepots = !isFleetPortal || hasPermission('fleet.depots.view');
  const canViewVehicles = !isFleetPortal || hasPermission('fleet.vehicles.view');
  const canAccessForm = isEditMode ? canUpdate : canCreate;

  const { drivers, createDriver, updateDriver, loadDriver, loadDrivers, uploadAvatar } = useAdminDriver();
  const { depots, loadDepots } = useAdminDepot();
  const { vehicles, loadVehicles } = useAdminVehicle();
  const { fleetOperators, loadFleetOperators } = useAdminFleetOperator();
  const driversList = Array.isArray(drivers) ? drivers : (drivers?.items || drivers?.rows || []);
  const depotsList = Array.isArray(depots) ? depots : (depots?.items || depots?.rows || []);
  const vehiclesList = Array.isArray(vehicles) ? vehicles : (vehicles?.items || vehicles?.rows || []);
  const fleetOperatorsList = Array.isArray(fleetOperators) ? fleetOperators : (fleetOperators?.items || fleetOperators?.rows || []);

  const queryFleetId = new URLSearchParams(location.search).get('fleetId') || new URLSearchParams(location.search).get('fleet_id');

  // For Fleet Portal: auto-detect operator's fleet and assigned depot
  const myFleet = isFleetPortal
    ? (fleetOperatorsList.find((f) => String(f.id) === String(user?.id) || (f.email && f.email === user?.email) || f.name === user?.name) || {
        id: user?.fleet_id || user?.id,
        name: user?.fleet_name || user?.name || 'My Fleet',
      })
    : null;

  // Auto-detect operator's assigned depot from profile, user or single-depot list
  const operatorDepot = useMemo(() => {
    const rawDepotId =
      user?.fleetOperatorProfile?.depot_id ||
      user?.fleetOperatorProfile?.depot?.id ||
      user?.depot_id ||
      user?.depotId ||
      user?.assignedDepot?.id ||
      (isFleetPortal && depotsList.length === 1 ? depotsList[0]?.id : null);

    if (rawDepotId) {
      const match = depotsList.find((d) => String(d.id) === String(rawDepotId));
      if (match) return match;
      if (user?.fleetOperatorProfile?.depot) return user.fleetOperatorProfile.depot;
      return { id: rawDepotId, name: `Depot #${rawDepotId}` };
    }

    if (isFleetPortal && depotsList.length > 0) {
      return depotsList[0];
    }

    return null;
  }, [user, depotsList, isFleetPortal]);

  const [loading, setLoading] = useState(false);
  const [fetchingDriver, setFetchingDriver] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Audit info stored for edit mode
  const [driverAudit, setDriverAudit] = useState({
    createdAt: null,
    updatedAt: null,
    creator: null,
    updater: null,
  });

  const [formData, setFormData] = useState({
    name: '',
    empId: '',
    badgeId: '',
    phone: '',
    email: '',
    password: '',
    dob: '',
    gender: 'Male',
    bloodGroup: 'B+',
    // Address & Geolocation fields
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    placeId: '',
    latitude: '',
    longitude: '',
    // Emergency Contact fields
    emergencyContactName: '',
    emergencyContactRelation: 'Spouse',
    emergencyContact: '',
    // License & Compliance fields
    dlNumber: '',
    licenseType: 'Commercial Heavy (HMV)',
    issueDate: '',
    dlExpiry: '2029-12-31',
    issuingAuthority: '',
    medicalFitnessValidUntil: '2028-06-30',
    aadhaarVerified: false,
    // Operations & Assignments
    fleetId: queryFleetId || '',
    fleetName: '',
    depot: !isEditMode && operatorDepot?.id ? String(operatorDepot.id) : '',
    depotName: !isEditMode && operatorDepot?.name ? operatorDepot.name : '',
    assignedBus: '',
    assignedBusName: '',
    activeShift: '06:00 AM - 02:00 PM (8h)',
    joiningDate: '',
    experienceYears: '5 Years',
    notes: '',
    avatarUrl: '',
    documents: [],
  });

  const nonPendingVehicles = useMemo(() => {
    return vehiclesList.filter((v) => {
      const st = String(v?.status || '').toLowerCase().trim();
      return st !== 'pending_approval' && st !== 'pending' && st !== 'rejected';
    });
  }, [vehiclesList]);

  const filteredVehicles = useMemo(() => {
    if (!formData.fleetId && !formData.depot) return nonPendingVehicles;
    const scoped = nonPendingVehicles.filter((v) => {
      const matchFleet = formData.fleetId ? String(v.fleet_id || v.fleetId) === String(formData.fleetId) : false;
      const matchDepot = formData.depot ? String(v.depot_id || v.depotId) === String(formData.depot) : false;
      return matchFleet || matchDepot;
    });
    return scoped.length > 0 ? scoped : nonPendingVehicles;
  }, [nonPendingVehicles, formData.fleetId, formData.depot]);

  // Shift Schedule state
  const [shiftStartTime, setShiftStartTime] = useState('06:00');
  const [shiftEndTime, setShiftEndTime] = useState('14:00');
  const [selectedShiftPreset, setSelectedShiftPreset] = useState('Morning Shift');

  const shiftDuration = useMemo(() => {
    return calculateShiftDuration(shiftStartTime, shiftEndTime);
  }, [shiftStartTime, shiftEndTime]);

  const updateShiftSchedule = (start, end, presetName = null) => {
    setShiftStartTime(start);
    setShiftEndTime(end);

    const matchedPreset = presetName || (DRIVER_SHIFT_PRESETS.find((p) => p.start === start && p.end === end)?.label || 'Custom Shift');
    setSelectedShiftPreset(matchedPreset);

    const duration = calculateShiftDuration(start, end);
    const start12 = formatTime12Hour(start);
    const end12 = formatTime12Hour(end);

    let formattedString = `${start12} - ${end12}`;
    if (duration?.shortLabel) {
      formattedString += ` (${duration.shortLabel})`;
    }
    if (formattedString.length > 40) {
      formattedString = `${start12} - ${end12}`;
    }

    handleFieldChange('activeShift', formattedString);
  };

  const handleSelectShiftPreset = (preset) => {
    if (preset.start && preset.end) {
      updateShiftSchedule(preset.start, preset.end, preset.label);
    } else {
      setSelectedShiftPreset('Custom Shift');
    }
  };

  const handleToggleStartAmPm = () => {
    const updated = toggleAmPm(shiftStartTime);
    updateShiftSchedule(updated, shiftEndTime, 'Custom Shift');
  };

  const handleToggleEndAmPm = () => {
    const updated = toggleAmPm(shiftEndTime);
    updateShiftSchedule(shiftStartTime, updated, 'Custom Shift');
  };

  const handleStartTimeChange = (val) => {
    updateShiftSchedule(val, shiftEndTime, 'Custom Shift');
  };

  const handleEndTimeChange = (val) => {
    updateShiftSchedule(shiftStartTime, val, 'Custom Shift');
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
    if (formError) {
      setFormError(null);
    }
  };

  const handleAddressChange = (addressPayload) => {
    setFormData((prev) => ({
      ...prev,
      address: addressPayload.address || prev.address,
      city: addressPayload.city || prev.city,
      state: addressPayload.state || prev.state,
      pincode: addressPayload.pincode || prev.pincode,
      country: addressPayload.country || prev.country,
      placeId: addressPayload.placeId || prev.placeId,
      latitude: addressPayload.latitude != null ? addressPayload.latitude : prev.latitude,
      longitude: addressPayload.longitude != null ? addressPayload.longitude : prev.longitude,
    }));

    // Clear field errors for address inputs if they are now populated
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (addressPayload.address) delete next.address;
      if (addressPayload.city) delete next.city;
      if (addressPayload.state) delete next.state;
      if (addressPayload.pincode) delete next.pincode;
      return next;
    });
  };

  useEffect(() => {
    if (!canAccessForm) return;
    if (canViewDepots) loadDepots().catch(() => {});
    if (canViewVehicles) {
      loadVehicles({ exclude_status: 'pending_approval,pending,rejected', limit: 100 }).catch(() => {});
    }
    loadFleetOperators({ limit: 100 }).catch(() => {});
  }, [canAccessForm, canViewDepots, canViewVehicles, loadDepots, loadVehicles, loadFleetOperators]);

  // Handle queryFleetId pre-selection
  useEffect(() => {
    if (queryFleetId && fleetOperatorsList.length > 0 && !formData.fleetId) {
      const matched = fleetOperatorsList.find((f) => String(f.id) === String(queryFleetId));
      if (matched) {
        const targetDepotId = matched.fleetOperatorProfile?.depot_id || matched.depot_id;
        const dMatch = targetDepotId ? depotsList.find((d) => String(d.id) === String(targetDepotId)) : null;
        setFormData((prev) => ({
          ...prev,
          fleetId: String(matched.id),
          fleetName: matched.name || '',
          ...(targetDepotId && !prev.depot ? { depot: String(targetDepotId), depotName: dMatch?.name || '' } : {}),
        }));
      }
    }
  }, [queryFleetId, fleetOperatorsList, depotsList, formData.fleetId, formData.depot]);

  const handleFleetChange = (val) => {
    handleFieldChange('fleetId', val);
    const foundOpr = fleetOperatorsList.find((f) => String(f.id) === String(val));
    if (foundOpr) {
      const targetDepotId = foundOpr.fleetOperatorProfile?.depot_id || foundOpr.depot_id;
      if (targetDepotId) {
        const dMatch = depotsList.find((d) => String(d.id) === String(targetDepotId));
        setFormData((prev) => ({
          ...prev,
          fleetId: val,
          fleetName: foundOpr.name || '',
          depot: String(targetDepotId),
          depotName: dMatch?.name || '',
        }));
        if (fieldErrors.depot) {
          setFieldErrors((prev) => {
            const next = { ...prev };
            delete next.depot;
            return next;
          });
        }
      } else {
        setFormData((prev) => ({
          ...prev,
          fleetId: val,
          fleetName: foundOpr.name || '',
        }));
      }
    }
  };

  // Auto-select assigned depot for Fleet Operator when creating a new driver
  useEffect(() => {
    if (isEditMode) return;
    if (operatorDepot?.id && (!formData.depot || !formData.depotName)) {
      setFormData((prev) => {
        if (prev.depot && prev.depot === String(operatorDepot.id)) return prev;
        return {
          ...prev,
          depot: String(operatorDepot.id),
          depotName: operatorDepot.name || (operatorDepot.code ? `${operatorDepot.name || 'Depot'} (${operatorDepot.code})` : ''),
        };
      });
      setFieldErrors((prev) => {
        if (!prev.depot) return prev;
        const next = { ...prev };
        delete next.depot;
        return next;
      });
    }
  }, [isEditMode, operatorDepot, formData.depot, formData.depotName]);

  useEffect(() => {
    if (!canAccessForm) return;
    if (isEditMode) {
      setFetchingDriver(true);
      loadDriver(id)
        .catch(() => {
          if (canViewDrivers) return loadDrivers({ page: 1, limit: 100 });
          return null;
        })
        .then((res) => {
          let found = null;
          if (res && res.id) {
            found = res;
          } else if (res) {
            const list = Array.isArray(res) ? res : (res?.items || res?.rows || []);
            found = list.find((d) => String(d.id) === String(id));
          }

          if (found) {
            const rawAvatar = found.avatarUrl || found.avatar_url || found.avatar || found.profile_picture || found.profilePicture || found.user?.avatar_url || found.user?.avatarUrl || found.user?.avatar || '';
            const rawDocs = found.documents || found.docs || found.mediaAssets || [];
            const normalizedDocs = Array.isArray(rawDocs)
              ? rawDocs.map((d) => ({
                  id: d.id || d.url || d.file_url || Date.now() + Math.random(),
                  name: d.name || d.doc_name || d.file_name || d.originalName || d.purpose || 'Attached Document',
                  category: d.category || d.doc_subtype || d.doc_type || d.purpose || 'Driving License & KYC',
                  url: d.url || d.file_url || d.filePath || (typeof d === 'string' ? d : ''),
                  size: d.size ?? (d.file_size ? Number(d.file_size) : null),
                  formattedSize: d.formattedSize || (d.size ? (typeof d.size === 'number' ? `${(d.size / 1024).toFixed(1)} KB` : d.size) : (d.file_size ? `${(Number(d.file_size) / 1024).toFixed(1)} KB` : 'PDF / File')),
                  uploadedAt: d.uploadedAt || d.uploaded_on || d.created_at || new Date().toISOString(),
                  verified: d.verified ?? true,
                }))
              : [];

            setFormData({
              name: found.name || '',
              empId: found.emp_id || found.empId || '',
              badgeId: found.badge_id || found.badgeId || '',
              phone: found.phone || found.user?.phone || '',
              email: found.email || found.user?.email || '',
              password: '',
              dob: found.dob || '',
              gender: found.gender || 'Male',
              bloodGroup: found.blood_group || found.bloodGroup || 'B+',
              address: found.address || '',
              city: found.city || '',
              state: found.state || '',
              pincode: found.pincode || '',
              country: found.country || 'India',
              placeId: found.place_id || found.placeId || '',
              latitude: found.latitude != null ? found.latitude : '',
              longitude: found.longitude != null ? found.longitude : '',
              emergencyContactName: found.emergency_contact_name || found.emergencyContactName || '',
              emergencyContactRelation: found.emergency_contact_relation || found.emergencyContactRelation || 'Spouse',
              emergencyContact: found.emergency_contact || found.emergencyContact || '',
              dlNumber: found.dl_number || found.dlNumber || '',
              licenseType: found.license_type || found.licenseType || 'Commercial Heavy (HMV)',
              issueDate: found.issue_date || found.issueDate || '',
              dlExpiry: found.dl_expiry || found.dlExpiry || '2029-12-31',
              issuingAuthority: found.issuing_authority || found.issuingAuthority || '',
              medicalFitnessValidUntil: found.medical_fitness_valid_until || found.medicalFitnessValidUntil || '2028-06-30',
              aadhaarVerified: Boolean(found.aadhaar_verified ?? found.aadhaarVerified),
              depot: found.depot_id || found.depotId || (typeof found.depot === 'object' ? (found.depot?.id || found.depot?.name) : found.depot) || '',
              depotName: (typeof found.depot === 'object' ? found.depot?.name : found.depot_name) || '',
              assignedBus: found.assigned_bus_id || found.assignedBusId || (typeof found.assignedBus === 'object' ? found.assignedBus?.id : found.assignedBus) || '',
              assignedBusName: found.assignedBus?.bus_number || found.assigned_bus_number || found.assignedBusNumber || '',
              activeShift: found.active_shift || found.activeShift || '06:00 AM - 02:00 PM (8h)',
              joiningDate: found.joining_date || found.joiningDate || '',
              experienceYears: found.experience_years || found.experienceYears || '5 Years',
              notes: found.notes || '',
              avatarUrl: rawAvatar,
              documents: normalizedDocs,
              fleetId: found.created_by ? String(found.created_by) : (found.creator?.id ? String(found.creator.id) : ''),
              fleetName: found.creator?.name || '',
            });

            const parsedShift = parseShiftStringToTimes(found.active_shift || found.activeShift);
            setShiftStartTime(parsedShift.start);
            setShiftEndTime(parsedShift.end);
            setSelectedShiftPreset(parsedShift.preset);

            setDriverAudit({
              createdAt: found.created_at || found.createdAt,
              updatedAt: found.updated_at || found.updatedAt,
              creator: found.creator || null,
              updater: found.updater || null,
            });
          }
        })
        .catch((err) => toast.error(err?.message || 'Failed to load driver details'))
        .finally(() => setFetchingDriver(false));
    }
  }, [id, isEditMode, canAccessForm, canViewDrivers, loadDriver, loadDrivers]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const toastId = toast.loading('Uploading driver photo...');
    try {
      const res = await uploadAvatar(file);
      const url = res?.url || res?.filePath || res;
      setFormData((prev) => ({ ...prev, avatarUrl: url }));
      toast.success('Driver photo uploaded successfully!', { id: toastId });
    } catch (err) {
      toast.error(err?.message || 'Failed to upload photo', { id: toastId });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    // Client-side comprehensive field validations
    const clientErrors = {};

    // 1. Full Name
    if (!formData.name || !formData.name.trim()) {
      clientErrors.name = 'Full name is required.';
    } else if (formData.name.trim().length < 3) {
      clientErrors.name = 'Full name must be at least 3 characters.';
    } else if (!/^[a-zA-Z\s.'-]+$/.test(formData.name.trim())) {
      clientErrors.name = 'Full name can only contain letters, spaces, dots, and hyphens.';
    }

    // 2. Mobile Phone (Indian 10-digit number)
    const cleanPhone = (formData.phone || '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
    if (!formData.phone || !formData.phone.trim()) {
      clientErrors.phone = 'Phone number is required.';
    } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      clientErrors.phone = 'Please enter a valid 10-digit mobile number.';
    }

    // 3. Email (optional, but if provided must be valid)
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        clientErrors.email = 'Please enter a valid email address.';
      }
    }

    // 4. Password
    if (!isEditMode) {
      if (!formData.password) {
        clientErrors.password = 'Password is required.';
      } else if (formData.password.length < 8) {
        clientErrors.password = 'Password must be at least 8 characters.';
      } else if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
        clientErrors.password = 'Password must contain at least one letter and one number.';
      }
    } else if (formData.password) {
      if (formData.password.length < 8) {
        clientErrors.password = 'New password must be at least 8 characters.';
      } else if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
        clientErrors.password = 'New password must contain at least one letter and one number.';
      }
    }

    // 5. Date of Birth (Age between 18 and 70 years)
    if (!formData.dob) {
      clientErrors.dob = 'Date of birth is required.';
    } else {
      const dobDate = new Date(formData.dob);
      const today = new Date();
      if (isNaN(dobDate.getTime())) {
        clientErrors.dob = 'Please enter a valid date of birth.';
      } else if (dobDate >= today) {
        clientErrors.dob = 'Date of birth cannot be in the future.';
      } else {
        const ageYears = (today - dobDate) / (365.25 * 24 * 3600 * 1000);
        if (ageYears < 18) {
          clientErrors.dob = 'Driver must be at least 18 years old.';
        } else if (ageYears > 70) {
          clientErrors.dob = 'Driver age cannot exceed 70 years.';
        }
      }
    }

    // 6. Gender & Blood Group
    if (!formData.gender) {
      clientErrors.gender = 'Please select a gender.';
    }
    if (!formData.bloodGroup) {
      clientErrors.bloodGroup = 'Please select a blood group.';
    }

    // 7. Depot Badge ID (Optional)
    if (formData.badgeId && formData.badgeId.trim()) {
      if (formData.badgeId.trim().length < 2) {
        clientErrors.badgeId = 'Badge ID must be at least 2 characters.';
      } else if (!/^[A-Za-z0-9-_/]+$/.test(formData.badgeId.trim())) {
        clientErrors.badgeId = 'Badge ID can only contain letters, numbers, hyphens, and slashes.';
      }
    }

    // 8. License Number (Must be Unique)
    const cleanDL = (formData.dlNumber || '').trim();
    if (!cleanDL) {
      clientErrors.dlNumber = 'License number is required.';
    } else if (cleanDL.length < 8) {
      clientErrors.dlNumber = 'License number must be at least 8 characters.';
    } else if (!/^[A-Za-z0-9- ]{8,30}$/.test(cleanDL)) {
      clientErrors.dlNumber = 'License number contains invalid characters.';
    } else if (driversList.length > 0) {
      const isDuplicate = driversList.some(
        (d) =>
          String(d.id) !== String(id) &&
          (d.dl_number || d.dlNumber || '').trim().toUpperCase() === cleanDL.toUpperCase()
      );
      if (isDuplicate) {
        clientErrors.dlNumber = 'This license number is already registered to another driver.';
      }
    }

    // 9. DL Expiry Date (MUST be a future date!)
    if (!formData.dlExpiry) {
      clientErrors.dlExpiry = 'Expiry date is required.';
    } else {
      const expDate = new Date(formData.dlExpiry);
      const todayZero = new Date();
      todayZero.setHours(0, 0, 0, 0);
      if (isNaN(expDate.getTime())) {
        clientErrors.dlExpiry = 'Please enter a valid expiry date.';
      } else if (expDate <= todayZero) {
        clientErrors.dlExpiry = 'License has expired. Expiry date must be in the future.';
      }
    }

    // 10. DL Issue Date (optional)
    if (formData.issueDate) {
      const issueDate = new Date(formData.issueDate);
      if (issueDate > new Date()) {
        clientErrors.issueDate = 'Issue date cannot be in the future.';
      } else if (formData.dlExpiry && issueDate >= new Date(formData.dlExpiry)) {
        clientErrors.issueDate = 'Issue date must be before expiry date.';
      }
    }

    // 11. Issuing RTO Authority
    if (!formData.issuingAuthority || !formData.issuingAuthority.trim()) {
      clientErrors.issuingAuthority = 'Issuing RTO is required (e.g. Pune RTO).';
    } else if (formData.issuingAuthority.trim().length < 2) {
      clientErrors.issuingAuthority = 'Issuing RTO must be at least 2 characters.';
    }

    // 12. Medical Certificate Validity
    if (!formData.medicalFitnessValidUntil) {
      clientErrors.medicalFitnessValidUntil = 'Medical validity date is required.';
    } else {
      const medDate = new Date(formData.medicalFitnessValidUntil);
      const todayZero = new Date();
      todayZero.setHours(0, 0, 0, 0);
      if (isNaN(medDate.getTime())) {
        clientErrors.medicalFitnessValidUntil = 'Please enter a valid date.';
      } else if (medDate < todayZero) {
        clientErrors.medicalFitnessValidUntil = 'Medical certificate has expired. Please enter a future date.';
      }
    }

    // 13. Address, City, State, Pincode
    if (!formData.address || !formData.address.trim()) {
      clientErrors.address = 'Address is required.';
    } else if (formData.address.trim().length < 5) {
      clientErrors.address = 'Address must be at least 5 characters.';
    }

    if (!formData.city || !formData.city.trim()) {
      clientErrors.city = 'City is required.';
    } else if (formData.city.trim().length < 2) {
      clientErrors.city = 'City must be at least 2 characters.';
    }

    if (!formData.state || !formData.state.trim()) {
      clientErrors.state = 'State is required.';
    } else if (formData.state.trim().length < 2) {
      clientErrors.state = 'State must be at least 2 characters.';
    }

    const cleanPincode = (formData.pincode || '').replace(/\D/g, '');
    if (!formData.pincode || !formData.pincode.trim()) {
      clientErrors.pincode = 'Pincode is required.';
    } else if (!/^\d{6}$/.test(cleanPincode)) {
      clientErrors.pincode = 'Please enter a valid 6-digit PIN code.';
    }

    // 14. Emergency Contact Details
    if (!formData.emergencyContactName || !formData.emergencyContactName.trim()) {
      clientErrors.emergencyContactName = 'Emergency contact name is required.';
    } else if (formData.emergencyContactName.trim().length < 3) {
      clientErrors.emergencyContactName = 'Emergency contact name must be at least 3 characters.';
    }

    if (!formData.emergencyContactRelation) {
      clientErrors.emergencyContactRelation = 'Please select relationship.';
    }

    const cleanEmgPhone = (formData.emergencyContact || '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
    if (!formData.emergencyContact || !formData.emergencyContact.trim()) {
      clientErrors.emergencyContact = 'Emergency phone number is required.';
    } else if (!/^[6-9]\d{9}$/.test(cleanEmgPhone)) {
      clientErrors.emergencyContact = 'Please enter a valid 10-digit phone number.';
    } else if (cleanEmgPhone === cleanPhone) {
      clientErrors.emergencyContact = "Emergency phone cannot be the same as driver's mobile phone.";
    }

    // 14. Fleet Operator (Required for Admin when creating driver)
    if (!isFleetPortal && !isEditMode && !formData.fleetId) {
      clientErrors.fleetId = 'Please select which Fleet Operator this driver belongs to.';
    }

    // 15. Depot
    const effectiveDepot = formData.depot || (isFleetPortal && operatorDepot?.id ? String(operatorDepot.id) : '');
    if (!effectiveDepot) {
      clientErrors.depot = 'Please select a depot.';
    }

    // 16. Experience
    if (!formData.experienceYears || !formData.experienceYears.trim()) {
      clientErrors.experienceYears = 'Experience details are required.';
    }

    // 17. Documents
    if (!formData.documents || formData.documents.length === 0) {
      clientErrors.documents = 'Please upload at least one document (Driving License or Aadhaar).';
    }

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setFormError('Please resolve the highlighted errors below before saving.');
      toast.error('Please fill in all required fields');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);

    // Process pending document uploads on submit
    const pendingDocs = (formData.documents || []).filter((d) => d.isPendingUpload && d.file);
    const submitDocuments = [];
    let docToastId = null;
    if (pendingDocs.length > 0) {
      docToastId = toast.loading(`Uploading ${pendingDocs.length} document(s)...`);
    }

    for (const doc of formData.documents || []) {
      if (doc.isPendingUpload && doc.file) {
        try {
          const res = await uploadFile(doc.file, 'driver_kyc');
          const fileUrl = res?.url || res?.filePath || res;
          submitDocuments.push({
            category: doc.category || doc.purpose || 'Driver Document',
            purpose: doc.category || doc.purpose || 'Driver Document',
            name: doc.name || doc.file.name,
            url: fileUrl,
            size: doc.file.size,
            type: doc.file.type || 'application/pdf',
          });
        } catch (docErr) {
          if (docToastId) toast.dismiss(docToastId);
          toast.error(`Failed to upload document: ${doc.name}`);
          setLoading(false);
          return;
        }
      } else {
        submitDocuments.push(doc);
      }
    }
    if (docToastId) toast.dismiss(docToastId);

    const selectedOperator = !isFleetPortal && formData.fleetId
      ? fleetOperatorsList.find((f) => String(f.id) === String(formData.fleetId))
      : null;

    const targetOrgId = selectedOperator?.organization_id
      || (isFleetPortal ? (user?.organizationId || user?.organization_id) : undefined);

    const targetCreatorId = formData.fleetId
      ? Number(formData.fleetId)
      : (isFleetPortal ? user?.id : undefined);

    // Fleet portal drivers go to pending_approval; Admin drivers go to available
    const submitData = {
      organizationId: targetOrgId || user?.organizationId || user?.organization_id || undefined,
      createdBy: targetCreatorId,
      created_by: targetCreatorId,
      fleetId: formData.fleetId ? Number(formData.fleetId) : undefined,
      fleet_id: formData.fleetId ? Number(formData.fleetId) : undefined,
      name: formData.name.trim(),
      empId: formData.empId ? formData.empId.trim() : null,
      badgeId: formData.badgeId?.trim() ? formData.badgeId.trim() : null,
      badge_id: formData.badgeId?.trim() ? formData.badgeId.trim() : null,
      phone: formData.phone.trim(),
      email: formData.email ? formData.email.trim() : null,
      password: formData.password || undefined,
      dob: formData.dob || null,
      gender: formData.gender || 'Male',
      bloodGroup: formData.bloodGroup || 'B+',
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      pincode: formData.pincode.trim(),
      country: formData.country || 'India',
      placeId: formData.placeId || null,
      latitude: formData.latitude !== '' && !isNaN(Number(formData.latitude)) ? Number(formData.latitude) : null,
      longitude: formData.longitude !== '' && !isNaN(Number(formData.longitude)) ? Number(formData.longitude) : null,
      emergencyContactName: formData.emergencyContactName ? formData.emergencyContactName.trim() : null,
      emergencyContactRelation: formData.emergencyContactRelation || null,
      emergencyContact: formData.emergencyContact ? formData.emergencyContact.trim() : null,
      dlNumber: formData.dlNumber.trim(),
      licenseType: formData.licenseType || 'Commercial Heavy (HMV)',
      issueDate: formData.issueDate || null,
      dlExpiry: formData.dlExpiry,
      issuingAuthority: formData.issuingAuthority ? formData.issuingAuthority.trim() : null,
      medicalFitnessValidUntil: formData.medicalFitnessValidUntil || null,
      aadhaarVerified: formData.aadhaarVerified,
      depot: effectiveDepot ? Number(effectiveDepot) : null,
      depotId: effectiveDepot ? Number(effectiveDepot) : null,
      assignedBus: formData.assignedBus ? Number(formData.assignedBus) : null,
      assignedBusId: formData.assignedBus ? Number(formData.assignedBus) : null,
      activeShift: formData.activeShift,
      joiningDate: formData.joiningDate || null,
      experienceYears: formData.experienceYears || null,
      notes: formData.notes ? formData.notes.trim() : null,
      avatarUrl: formData.avatarUrl || null,
      documents: submitDocuments,
      status: isFleetPortal ? 'pending_approval' : 'available',
    };

    const actionPromise = isEditMode
      ? updateDriver(id, submitData)
      : createDriver(submitData);

    try {
      await toast.promise(actionPromise, {
        loading: isEditMode ? 'Updating driver...' : 'Saving driver...',
        success: isEditMode
          ? `Driver ${formData.name} updated successfully!`
          : isFleetPortal
            ? `Driver ${formData.name} submitted for approval!`
            : `Driver ${formData.name} saved successfully!`,
        error: (err) => {
          if (typeof err === 'string') return err;
          if (err?.message) return err.message;
          return isEditMode ? 'Failed to update driver' : 'Failed to save driver';
        },
      });
      navigate(basePath);
    } catch (err) {
      console.error('Driver save error:', err);
      let errorMsg = 'Failed to save driver. Please check the fields below.';
      const serverFieldErrors = {};

      if (err) {
        if (typeof err === 'string') {
          errorMsg = err;
        } else if (err.message) {
          errorMsg = err.message;
        }

        const msgLower = (errorMsg || '').toLowerCase();
        if (
          err.code === 'DUPLICATE' ||
          msgLower.includes('unique') ||
          msgLower.includes('already exists') ||
          msgLower.includes('duplicate entry')
        ) {
          if (msgLower.includes('phone')) {
            serverFieldErrors.phone = 'This phone number is already registered.';
            errorMsg = 'This phone number is already in use.';
          } else if (msgLower.includes('email')) {
            serverFieldErrors.email = 'This email address is already registered.';
            errorMsg = 'This email address is already in use.';
          } else if (msgLower.includes('badge')) {
            serverFieldErrors.badgeId = 'This Badge ID is already assigned to another driver.';
            errorMsg = 'This Badge ID is already in use.';
          } else if (msgLower.includes('dl') || msgLower.includes('license')) {
            serverFieldErrors.dlNumber = 'This license number is already registered.';
            errorMsg = 'This license number is already in use.';
          } else {
            errorMsg = 'A driver with these details already exists.';
          }
        }

        if (Array.isArray(err.details)) {
          err.details.forEach((item) => {
            const field = item.field;
            const msg = item.message || 'Invalid value';
            if (field === 'name') serverFieldErrors.name = msg;
            else if (field === 'badge_id' || field === 'badgeId') serverFieldErrors.badgeId = msg;
            else if (field === 'phone') serverFieldErrors.phone = msg;
            else if (field === 'email') serverFieldErrors.email = msg;
            else if (field === 'dl_number' || field === 'dlNumber') serverFieldErrors.dlNumber = msg;
            else if (field === 'depot_id' || field === 'depot') serverFieldErrors.depot = msg;
            else if (field === 'address') serverFieldErrors.address = msg;
            else if (field === 'city') serverFieldErrors.city = msg;
            else if (field === 'state') serverFieldErrors.state = msg;
            else if (field === 'pincode') serverFieldErrors.pincode = msg;
            else if (field) serverFieldErrors[field] = msg;
          });
        }
      }

      setFormError(errorMsg);
      setFieldErrors(serverFieldErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  // Access revoked screen
  if (!canAccessForm) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-slate-500">
          <FleetIcons.Lock className="w-8 h-8 text-slate-700 dark:text-zinc-300" />
        </div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('common.access_revoked') || 'Access Revoked'}</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">
          Your administrator has revoked your permission to {isEditMode ? 'edit' : 'create'} drivers.
        </p>
        <Link
          to={basePath}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-blue-700 transition-all"
        >
          <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('admin.drivers.back_to_drivers') || 'Back to Drivers'}</span>
        </Link>
      </div>
    );
  }

  if (fetchingDriver) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm">
        <div className="text-slate-500 dark:text-zinc-400 font-bold text-sm">{t('admin.drivers.loading_roster') || 'Loading driver roster details...'}</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-20">
      {/* 1. Breadcrumb Banner & Action Header */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm min-w-0">
        <div className="min-w-0">
          <Breadcrumb
            items={[
              { label: isFleetPortal ? 'Fleet Operator' : 'Admin', path: dashboardLink },
              { label: 'Drivers', path: basePath },
              { label: isEditMode ? 'Edit Driver' : 'Add Driver' },
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
            {isEditMode ? `${t('admin.drivers.btn_edit_driver') || 'Edit Driver'}: ${formData.name}` : (t('admin.drivers.add_driver') || 'Add Driver')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Enter driver details, license, address, and depot.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={() => navigate(basePath)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer text-center justify-center flex items-center"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isEditMode ? (
              <FleetIcons.Check className="w-4 h-4 text-white shrink-0" />
            ) : (
              <FleetIcons.Plus className="w-4 h-4 text-white shrink-0" />
            )}
            <span>
              {loading
                ? 'Saving...'
                : isEditMode
                  ? 'Save Changes'
                  : isFleetPortal
                    ? 'Submit Driver'
                    : 'Save Driver'}
            </span>
          </button>
        </div>
      </div>

      {/* Fleet Portal Pending-Approval Notice */}
      {isFleetPortal && !isEditMode && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <FleetIcons.Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="font-bold">{t('admin.drivers.admin_approval_required') || 'Admin Approval Required'}</p>
            <p className="text-amber-700 dark:text-amber-400 text-[11px] mt-0.5">
              Drivers added by Fleet Operators require Admin approval before trips can be assigned.
            </p>
          </div>
        </div>
      )}

      {/* Validation & Error Alert Banner */}
      {formError && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 shadow-sm transition-all animate-in fade-in">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-600 font-bold shrink-0 mt-0.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-rose-900">
                  Please check the form
                </h3>
                <p className="text-xs text-rose-800 font-medium">
                  {formError}
                </p>
                {Object.keys(fieldErrors).length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-rose-700 list-disc list-inside font-medium bg-white/70 p-3 rounded-xl border border-rose-200/60">
                    {Object.entries(fieldErrors).map(([key, msg]) => (
                      <li key={key}>
                        <strong className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</strong> {msg}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setFormError(null); setFieldErrors({}); }}
              className="text-rose-500 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
              title={t('admin.drivers.dismiss_error') || "Dismiss error"}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Fleet & Operator Assignment Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center font-bold shrink-0">
            <FleetIcons.Bus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              Fleet Assignment
              <span className="text-[10px] lowercase font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/40">
                {isFleetPortal ? 'operator portal' : 'admin portal'}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400">
              {isFleetPortal
                ? 'Driver will be registered under your fleet profile'
                : 'Select which Fleet Operator / Fleet company this driver is registered under'}
            </div>
          </div>
        </div>

        {isFleetPortal ? (
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">{t('admin.drivers.my_fleet') || 'My Fleet:'}</span>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {myFleet?.name || user?.name || 'Fleet Operator'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 inline-flex items-center gap-1">
                <FleetIcons.Check className="w-2.5 h-2.5" /> {t('admin.drivers.auto_assigned') || 'Auto-Assigned'}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 whitespace-nowrap">
                  Fleet / Operator <span className="text-rose-500">*</span>:
                </span>
                <select
                  value={formData.fleetId}
                  onChange={(e) => handleFleetChange(e.target.value)}
                  className={`h-9 px-3 rounded-xl border text-xs font-bold text-slate-900 dark:text-white dark:bg-zinc-800 focus:outline-none transition-all ${
                    fieldErrors.fleetId
                      ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                      : 'border-slate-200 dark:border-zinc-700 bg-slate-50 focus:border-blue-500 focus:bg-white'
                  }`}
                >
                  <option value="">{t('admin.drivers.select_fleet_operator') || 'Select Fleet Operator...'}</option>
                  {fleetOperatorsList.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} {f.code ? `(${f.code})` : ''} {f.organization?.name ? `— ${f.organization.name}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              {fieldErrors.fleetId && (
                <p className="text-[10px] font-semibold text-rose-600 flex items-center gap-1">
                  <FleetIcons.Alert className="w-3 h-3 text-rose-500 shrink-0" /> {fieldErrors.fleetId}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Section 1: Photo Avatar & Account Credentials */}
        <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5 min-w-0 overflow-hidden">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center font-bold text-sm shrink-0">
                <FleetIcons.Key className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  1. Account & Photo
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">{t('admin.drivers.sec_profile_desc') || 'Profile photo and mobile login credentials.'}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-stretch lg:items-start gap-5 sm:gap-6 pt-1 min-w-0">
            {/* Driver Avatar */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-2xl shrink-0 w-full lg:w-80 min-w-0">
              <div className="relative group shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-200 dark:bg-zinc-700 border-2 border-white dark:border-zinc-600 shadow-sm flex items-center justify-center text-slate-600 dark:text-zinc-300 font-black text-xl">
                  <img
                    src={
                      formData.avatarUrl
                        ? resolveFileUrl(formData.avatarUrl)
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'Driver')}&background=0f172a&color=ffffff`
                    }
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'Driver')}&background=0f172a&color=ffffff`;
                    }}
                    alt="Driver Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 rounded-full bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold cursor-pointer"
                >
                  {uploadingAvatar ? '...' : 'Upload'}
                </button>
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">{t('admin.drivers.driver_photo') || 'Driver Photo'}</h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                  Upload a clear profile photo
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    {uploadingAvatar ? 'Uploading...' : 'Choose Photo'}
                  </button>
                  {formData.avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, avatarUrl: '' }))}
                      className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Account Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 w-full min-w-0">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('admin.drivers.email_address') || 'Email Address *'}</label>
                <input
                  type="email"
                  placeholder="driver@example.com"
                  value={formData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value.toLowerCase())}
                  className={`w-full h-11 px-3.5 rounded-xl border text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all ${
                    fieldErrors.email
                      ? 'border-rose-400 dark:border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-500'
                      : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/70 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900'
                  }`}
                />
                {fieldErrors.email && (
                  <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1">
                    <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{fieldErrors.email}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Password {!isEditMode ? '*' : '(Optional)'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={isEditMode ? 'Leave blank to keep existing password' : 'Enter password (min 6 characters)'}
                    value={formData.password}
                    onChange={(e) => handleFieldChange('password', e.target.value)}
                    className={`w-full h-11 pl-3.5 pr-10 rounded-xl border text-xs text-slate-900 dark:text-white focus:outline-none transition-all font-mono ${
                      fieldErrors.password
                        ? 'border-rose-400 dark:border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                        : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/70 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 text-xs font-bold cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <FleetIcons.EyeOff className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                    ) : (
                      <FleetIcons.Eye className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                    )}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1">
                    <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{fieldErrors.password}</span>
                  </p>
                )}
                {isEditMode && !fieldErrors.password && (
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                    Leave blank to keep the current password.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Personal Identification & KYC */}
        <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5 min-w-0 overflow-hidden">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center font-bold text-sm">
              <FleetIcons.Profile className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                2. Personal Details
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">{t('admin.drivers.sec_basic_desc') || 'Basic information about the driver.'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Full Name * */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('admin.drivers.full_name') || 'Full Name *'}</label>
              <input
                type="text"
                placeholder={t('admin.drivers.full_name_ph') || 'Enter full name'}
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all ${
                  fieldErrors.name
                    ? 'border-rose-400 dark:border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/70 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900'
                }`}
              />
              {fieldErrors.name && (
                <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{fieldErrors.name}</span>
                </p>
              )}
            </div>

            {/* Mobile Phone * */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('admin.drivers.phone_number') || 'Phone Number *'}</label>
              <input
                type="tel"
                placeholder={t('admin.drivers.phone_ph') || 'Enter 10-digit mobile number'}
                value={formData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all ${
                  fieldErrors.phone
                    ? 'border-rose-400 dark:border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/70 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900'
                }`}
              />
              {fieldErrors.phone && (
                <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{fieldErrors.phone}</span>
                </p>
              )}
            </div>

            {/* Blood Group */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('admin.drivers.blood_group') || 'Blood Group *'}</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => handleFieldChange('bloodGroup', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs font-bold text-slate-900 dark:text-white focus:outline-none transition-all ${
                  fieldErrors.bloodGroup
                    ? 'border-rose-400 dark:border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/70 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900'
                }`}
              >
                <option value="">{t('admin.drivers.select_blood_group') || 'Select Blood Group'}</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
              {fieldErrors.bloodGroup && (
                <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{fieldErrors.bloodGroup}</span>
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('admin.drivers.dob') || 'Date of Birth *'}</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => handleFieldChange('dob', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs font-medium text-slate-900 dark:text-white focus:outline-none transition-all ${
                  fieldErrors.dob
                    ? 'border-rose-400 dark:border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/70 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900'
                }`}
              />
              {fieldErrors.dob && (
                <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{fieldErrors.dob}</span>
                </p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('admin.drivers.gender') || 'Gender *'}</label>
              <select
                value={formData.gender}
                onChange={(e) => handleFieldChange('gender', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs font-medium text-slate-900 dark:text-white focus:outline-none transition-all ${
                  fieldErrors.gender
                    ? 'border-rose-400 dark:border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/70 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900'
                }`}
              >
                <option value="Male">{t('admin.drivers.gender_male') || 'Male'}</option>
                <option value="Female">{t('admin.drivers.gender_female') || 'Female'}</option>
                <option value="Other">{t('admin.drivers.gender_other') || 'Other'}</option>
              </select>
              {fieldErrors.gender && (
                <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{fieldErrors.gender}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Commercial License & Medical Compliance */}
        <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5 min-w-0 overflow-hidden">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center font-bold text-sm">
              <FleetIcons.Document className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                3. License & Medical Details
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">{t('admin.drivers.sec_compliance_desc') || 'Driving license and medical fitness details.'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Depot Badge ID (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Badge ID <span className="text-slate-400 dark:text-zinc-500 font-normal">({t('common.optional')})</span>
              </label>
              <input
                type="text"
                placeholder={t('admin.drivers.badge_id_ph') || 'Enter badge ID'}
                value={formData.badgeId}
                onChange={(e) => handleFieldChange('badgeId', e.target.value.toUpperCase())}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all ${
                  fieldErrors.badgeId
                    ? 'border-rose-400 dark:border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/70 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900'
                }`}
              />
              {fieldErrors.badgeId && (
                <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{fieldErrors.badgeId}</span>
                </p>
              )}
            </div>

            {/* Employee / Staff ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('admin.drivers.employee_id') || 'Employee ID (Optional)'}</label>
              <input
                type="text"
                placeholder="e.g. EMP-9021"
                value={formData.empId}
                onChange={(e) => handleFieldChange('empId', e.target.value.toUpperCase())}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/70 text-xs font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 transition-all"
              />
            </div>

            {/* DL Number * (Unique) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                License Number (DL) *
              </label>
              <input
                type="text"
                placeholder="e.g. MH-12-20150099881"
                value={formData.dlNumber}
                onChange={(e) => handleFieldChange('dlNumber', e.target.value.toUpperCase())}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all ${
                  fieldErrors.dlNumber
                    ? 'border-rose-400 dark:border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/70 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900'
                }`}
              />
              {fieldErrors.dlNumber && (
                <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{fieldErrors.dlNumber}</span>
                </p>
              )}
            </div>

            {/* License Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('admin.drivers.license_type') || 'License Type'}</label>
              <select
                value={formData.licenseType}
                onChange={(e) => handleFieldChange('licenseType', e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/70 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900"
              >
                <option value="Commercial Heavy (HMV)">{t('admin.drivers.lic_hmv') || 'Commercial Heavy (HMV)'}</option>
                <option value="Transport Commercial (TRANS)">{t('admin.drivers.lic_trans') || 'Commercial Transport (TRANS)'}</option>
                <option value="Commercial Light (LMV-TR)">{t('admin.drivers.lic_lmv') || 'Commercial Light (LMV-TR)'}</option>
                <option value="Electric Transit Special">{t('admin.drivers.lic_ev') || 'Electric Bus (EV)'}</option>
              </select>
            </div>

            {/* DL Issue Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('admin.drivers.issue_date') || 'Issue Date (Optional)'}</label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => handleFieldChange('issueDate', e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/70 text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900"
              />
            </div>

            {/* DL Expiry Date * */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('admin.drivers.expiry_date') || 'Expiry Date *'}</label>
              <input
                type="date"
                value={formData.dlExpiry}
                onChange={(e) => handleFieldChange('dlExpiry', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs font-bold text-slate-800 dark:text-white focus:outline-none transition-all ${
                  fieldErrors.dlExpiry
                    ? 'border-rose-400 dark:border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/70 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900'
                }`}
              />
              {fieldErrors.dlExpiry && (
                <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{fieldErrors.dlExpiry}</span>
                </p>
              )}
            </div>

            {/* Issuing Authority */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('admin.drivers.issuing_rto') || 'Issuing RTO *'}</label>
              <input
                type="text"
                placeholder="e.g. Pune RTO (MH-12)"
                value={formData.issuingAuthority}
                onChange={(e) => handleFieldChange('issuingAuthority', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all ${
                  fieldErrors.issuingAuthority
                    ? 'border-rose-400 dark:border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/70 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900'
                }`}
              />
              {fieldErrors.issuingAuthority && (
                <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{fieldErrors.issuingAuthority}</span>
                </p>
              )}
            </div>

            {/* Medical Fitness Valid Until */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('admin.drivers.medical_fitness_valid') || 'Medical Fitness Valid Till *'}</label>
              <input
                type="date"
                value={formData.medicalFitnessValidUntil}
                onChange={(e) => handleFieldChange('medicalFitnessValidUntil', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs font-medium text-slate-800 dark:text-white focus:outline-none transition-all ${
                  fieldErrors.medicalFitnessValidUntil
                    ? 'border-rose-400 dark:border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/70 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900'
                }`}
              />
              {fieldErrors.medicalFitnessValidUntil && (
                <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{fieldErrors.medicalFitnessValidUntil}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Address */}
        <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5 min-w-0 overflow-hidden">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center font-bold text-sm">
              <FleetIcons.Pin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                4. Address
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">{t('admin.drivers.sec_address_desc') || 'Driver home address and map location.'}</p>
            </div>
          </div>

          <DriverAddressPicker
            addressData={{
              address: formData.address,
              city: formData.city,
              state: formData.state,
              pincode: formData.pincode,
              country: formData.country,
              placeId: formData.placeId,
              latitude: formData.latitude,
              longitude: formData.longitude,
            }}
            onChange={handleAddressChange}
            fieldErrors={fieldErrors}
            disabled={loading}
            searchLabel="Search Address"
            searchPlaceholder="Search street, area, or city..."
            searchHint="Search an address or click anywhere on the map to set location."
            addressLabel="Street Address *"
            addressPlaceholder="House/Flat No, Building, Street, Area"
            pinLabel="Residence"
          />
        </div>

        {/* Section 5: Emergency Contact */}
        <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5 min-w-0 overflow-hidden">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center font-bold text-sm">
              <FleetIcons.Emergency className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                5. Emergency Contact
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">{t('admin.drivers.sec_emergency_desc') || 'Contact person in case of emergency.'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('admin.drivers.emergency_contact_name') || 'Contact Name *'}</label>
              <input
                type="text"
                placeholder={t('admin.drivers.emergency_contact_name_ph') || 'e.g. Sunita Pawar'}
                value={formData.emergencyContactName}
                onChange={(e) => handleFieldChange('emergencyContactName', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all ${
                  fieldErrors.emergencyContactName
                    ? 'border-rose-400 dark:border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/70 focus:border-rose-500 focus:bg-white dark:focus:bg-zinc-900'
                }`}
              />
              {fieldErrors.emergencyContactName && (
                <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{fieldErrors.emergencyContactName}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('admin.drivers.emergency_relationship') || 'Relationship *'}</label>
              <select
                value={formData.emergencyContactRelation}
                onChange={(e) => handleFieldChange('emergencyContactRelation', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs font-medium text-slate-900 dark:text-white focus:outline-none transition-all ${
                  fieldErrors.emergencyContactRelation
                    ? 'border-rose-400 dark:border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/70 focus:border-rose-500 focus:bg-white dark:focus:bg-zinc-900'
                }`}
              >
                <option value="Spouse">{t('admin.drivers.rel_spouse') || 'Spouse'}</option>
                <option value="Parent">{t('admin.drivers.rel_parent') || 'Parent'}</option>
                <option value="Child">{t('admin.drivers.rel_child') || 'Child'}</option>
                <option value="Sibling">{t('admin.drivers.rel_sibling') || 'Sibling'}</option>
                <option value="Guardian">{t('admin.drivers.rel_guardian') || 'Guardian'}</option>
              </select>
              {fieldErrors.emergencyContactRelation && (
                <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{fieldErrors.emergencyContactRelation}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('admin.drivers.phone_number') || 'Phone Number *'}</label>
              <input
                type="tel"
                placeholder="+91 98220 00000"
                value={formData.emergencyContact}
                onChange={(e) => handleFieldChange('emergencyContact', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all ${
                  fieldErrors.emergencyContact
                    ? 'border-rose-400 dark:border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/70 focus:border-rose-500 focus:bg-white dark:focus:bg-zinc-900'
                }`}
              />
              {fieldErrors.emergencyContact && (
                <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{fieldErrors.emergencyContact}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 6: Fleet, Depot & Shift */}
        <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5 min-w-0 overflow-hidden">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center font-bold text-sm">
              <FleetIcons.Bus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                6. Fleet, Depot & Shift
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">{t('admin.drivers.sec_fleet_ops_desc') || 'Assign fleet operator, operational depot, bus, and shift timings.'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Fleet Operator / Fleet */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Fleet / Operator <span className="text-rose-500">*</span>
                </label>
                {isFleetPortal ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 inline-flex items-center gap-1">
                    <FleetIcons.Check className="w-2.5 h-2.5" /> Auto-Assigned
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
                    Required
                  </span>
                )}
              </div>

              {isFleetPortal ? (
                <div className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800/80 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-zinc-200">
                  <span>{myFleet?.name || user?.name || 'My Fleet Operator'}</span>
                  <FleetIcons.Lock className="w-3.5 h-3.5 text-slate-400" />
                </div>
              ) : (
                <select
                  value={formData.fleetId}
                  onChange={(e) => handleFleetChange(e.target.value)}
                  className={`w-full h-11 px-3.5 rounded-xl border text-xs font-bold text-slate-800 dark:text-white focus:outline-none transition-all ${
                    fieldErrors.fleetId
                      ? 'border-rose-400 dark:border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-500'
                      : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/70 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900'
                  }`}
                >
                  <option value="">{t('admin.drivers.select_fleet_operator') || 'Select Fleet Operator...'}</option>
                  {fleetOperatorsList.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} {f.code ? `(${f.code})` : ''} {f.organization?.name ? `— ${f.organization.name}` : ''}
                    </option>
                  ))}
                </select>
              )}
              {fieldErrors.fleetId && (
                <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{fieldErrors.fleetId}</span>
                </p>
              )}
            </div>
            {/* Assigned Depot * */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Assigned Depot <span className="text-rose-500">*</span>
                </label>
                {isFleetPortal && operatorDepot && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 inline-flex items-center gap-1">
                    <FleetIcons.Check className="w-2.5 h-2.5" /> Auto-Assigned
                  </span>
                )}
              </div>
              <select
                value={formData.depot || (isFleetPortal && operatorDepot?.id ? String(operatorDepot.id) : '')}
                onChange={(e) => handleFieldChange('depot', e.target.value)}
                disabled={isFleetPortal && Boolean(user?.fleetOperatorProfile?.depot_id)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs font-bold text-slate-800 dark:text-white focus:outline-none transition-all ${
                  isFleetPortal && user?.fleetOperatorProfile?.depot_id
                    ? 'bg-slate-100 dark:bg-zinc-800/80 cursor-not-allowed border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200'
                    : fieldErrors.depot
                    ? 'border-rose-400 dark:border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/70 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900'
                }`}
              >
                {!formData.depot && !operatorDepot?.id && <option value="">{t('admin.drivers.select_depot') || 'Select a depot'}</option>}
                {formData.depot && !depotsList.some((d) => String(d.id) === String(formData.depot)) && (
                  <option value={formData.depot}>{formData.depotName || `Depot #${formData.depot}`}</option>
                )}
                {depotsList.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} {d.code ? `(${d.code})` : ''}</option>
                ))}
              </select>
              {isFleetPortal && user?.fleetOperatorProfile?.depot_id ? (
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1 mt-1">
                  <FleetIcons.Pin className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span>{t('admin.drivers.depot_fixed_hint') || 'Depot is fixed to your assigned operational facility.'}</span>
                </p>
              ) : null}
              {fieldErrors.depot && (
                <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{fieldErrors.depot}</span>
                </p>
              )}
            </div>

            {/* Assigned Bus (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('admin.drivers.assigned_bus') || 'Assigned Bus (Optional)'}</label>
              <select
                value={formData.assignedBus}
                onChange={(e) => {
                  const val = e.target.value;
                  const vMatch = filteredVehicles.find((v) => String(v.id) === String(val)) || nonPendingVehicles.find((v) => String(v.id) === String(val));
                  setFormData((prev) => ({
                    ...prev,
                    assignedBus: val,
                    assignedBusName: vMatch?.busNumber || vMatch?.bus_number || '',
                  }));
                }}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/70 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900"
              >
                <option value="">{t('admin.drivers.bus_not_assigned') || 'Not Assigned (Flexible)'}</option>
                {formData.assignedBus && !filteredVehicles.some((v) => String(v.id) === String(formData.assignedBus)) && (() => {
                  const currentBus = vehiclesList.find((v) => String(v.id) === String(formData.assignedBus));
                  const currentStatus = String(currentBus?.status || '').toLowerCase().trim();
                  if (currentStatus === 'pending_approval' || currentStatus === 'pending' || currentStatus === 'rejected') {
                    return null;
                  }
                  return (
                    <option value={formData.assignedBus}>{formData.assignedBusName || `Bus #${formData.assignedBus}`}</option>
                  );
                })()}
                {filteredVehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.busNumber || v.bus_number || `Bus #${v.id}`} — {v.vehicleType || v.vehicle_type || 'Bus'}</option>
                ))}
              </select>
            </div>

            {/* Joining Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('admin.drivers.joining_date') || 'Joining Date'}</label>
              <input
                type="date"
                value={formData.joiningDate}
                onChange={(e) => handleFieldChange('joiningDate', e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/70 text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900"
              />
            </div>

            {/* Shift Schedule Section */}
            <div className="space-y-3 col-span-full pt-2 pb-3 border-y border-slate-100 dark:border-zinc-800">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <FleetIcons.Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 inline-block mr-1" />
                    <span>{t('admin.drivers.shift_schedule') || 'Shift Schedule'}</span>
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    {t('admin.drivers.shift_schedule_desc') || 'Select a preset or set custom shift timings.'}
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Shift: <strong className="font-mono text-blue-700 dark:text-blue-400">{formData.activeShift}</strong>
                </span>
              </div>

              {/* Quick Shift Presets */}
              <div className="flex flex-wrap gap-2 pt-0.5">
                {DRIVER_SHIFT_PRESETS.map((preset) => {
                  const isSelected = selectedShiftPreset === preset.label;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleSelectShiftPreset(preset)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/25 ring-2 ring-blue-500/20'
                          : 'bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
                      }`}
                    >
                      {preset.iconType === 'Night' ? (
                        <FleetIcons.Moon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-indigo-400'}`} />
                      ) : preset.iconType === 'Custom' ? (
                        <FleetIcons.Settings className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-amber-500'}`} />
                      ) : preset.iconType === 'Split' ? (
                        <FleetIcons.Refresh className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-emerald-500'}`} />
                      ) : preset.iconType === 'Evening' ? (
                        <FleetIcons.Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-orange-500'}`} />
                      ) : (
                        <FleetIcons.Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-sky-500'}`} />
                      )}
                      <span>{preset.label}</span>
                      {preset.desc && preset.label !== 'Custom Shift' && (
                        <span className={`text-[10px] font-normal ${isSelected ? 'text-blue-100' : 'text-slate-400 dark:text-zinc-500'}`}>
                          ({preset.desc})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Shift Timing & Duration Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                {/* 1. Start Time */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      Start Time
                    </label>
                    <button
                      type="button"
                      onClick={handleToggleStartAmPm}
                      className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-zinc-800 text-blue-700 dark:text-blue-400 border border-slate-200 dark:border-zinc-700 hover:border-blue-300 transition-colors cursor-pointer flex items-center gap-1"
                      title={t('admin.drivers.toggle_ampm') || "Click to toggle AM / PM"}
                    >
                      <span>{getPeriod(shiftStartTime)}</span>
                      <FleetIcons.Refresh className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="time"
                      value={shiftStartTime}
                      onChange={(e) => handleStartTimeChange(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 flex items-center justify-between">
                    <span>{t('admin.drivers.time_12hr') || '12-Hour Time:'}</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800/60">
                      {formatTime12Hour(shiftStartTime)}
                    </span>
                  </div>
                </div>

                {/* 2. End Time */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                      End Time
                    </label>
                    <button
                      type="button"
                      onClick={handleToggleEndAmPm}
                      className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-zinc-800 text-blue-700 dark:text-blue-400 border border-slate-200 dark:border-zinc-700 hover:border-blue-300 transition-colors cursor-pointer flex items-center gap-1"
                      title={t('admin.drivers.toggle_ampm') || "Click to toggle AM / PM"}
                    >
                      <span>{getPeriod(shiftEndTime)}</span>
                      <FleetIcons.Refresh className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="time"
                      value={shiftEndTime}
                      onChange={(e) => handleEndTimeChange(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 flex items-center justify-between">
                    <span>{t('admin.drivers.time_12hr') || '12-Hour Time:'}</span>
                    <span className="font-mono font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200/60 dark:border-rose-800/60">
                      {formatTime12Hour(shiftEndTime)}
                    </span>
                  </div>
                </div>

                {/* 3. Duration Container */}
                <div className="p-3.5 rounded-xl bg-linear-to-br from-blue-50/90 via-indigo-50/50 to-slate-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900 border border-blue-200/80 dark:border-zinc-700 flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1">
                      <FleetIcons.Clock className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                      <span>{t('admin.drivers.duration') || 'Duration'}</span>
                    </span>
                    {shiftDuration?.isOvernight && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60">
                        Overnight (+1d)
                      </span>
                    )}
                  </div>
                  <div className="my-1">
                    <div className="text-xl font-black text-blue-900 dark:text-blue-300 font-mono tracking-tight">
                      {shiftDuration ? shiftDuration.label : '--'}
                    </div>
                  </div>
                  <div className="text-[11px] font-medium text-blue-700/80 dark:text-zinc-400 flex items-center justify-between pt-1 border-t border-blue-100 dark:border-zinc-800">
                    <span>{t('admin.drivers.working_hours') || 'Working Hours:'}</span>
                    <div className="font-bold font-mono text-blue-950 dark:text-white flex items-center gap-1">
                      <span>{formatTime12Hour(shiftStartTime)}</span>
                      <FleetIcons.ArrowLeft className="w-3 h-3 rotate-180 text-blue-500" />
                      <span>{formatTime12Hour(shiftEndTime)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Experience */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('admin.drivers.experience') || 'Experience *'}</label>
              <input
                type="text"
                placeholder={t('admin.drivers.experience_ph') || 'e.g. 5 Years'}
                value={formData.experienceYears}
                onChange={(e) => handleFieldChange('experienceYears', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all ${
                  fieldErrors.experienceYears
                    ? 'border-rose-400 dark:border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/70 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900'
                }`}
              />
              {fieldErrors.experienceYears && (
                <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{fieldErrors.experienceYears}</span>
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('admin.drivers.notes') || 'Notes (Optional)'}</label>
              <input
                type="text"
                placeholder={t('admin.drivers.notes_ph') || 'Any additional notes...'}
                value={formData.notes}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/70 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900"
              />
            </div>
          </div>
        </div>

        {/* Section 7: Documents */}
        <div>
          <MultipleDocumentUploader
            documents={formData.documents}
            onChange={(docs) => {
              setFormData((prev) => ({ ...prev, documents: docs }));
              if (fieldErrors.documents) {
                setFieldErrors((prev) => {
                  const updated = { ...prev };
                  delete updated.documents;
                  return updated;
                });
              }
            }}
            title={t('admin.drivers.upload_docs_title') || "Upload Documents (License, Aadhaar, Medical Certificate)"}
            purpose="driver_kyc"
            deferUpload={true}
          />
          {fieldErrors.documents && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2 mt-2">
              <FleetIcons.Alert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{fieldErrors.documents}</span>
            </div>
          )}
        </div>

        {/* Section 8: Record Info (Visible in Edit Mode) */}
        {isEditMode && (
          <div className="p-4 sm:p-6 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 space-y-2 min-w-0 overflow-hidden">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <FleetIcons.FileText className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
              <span>{t('admin.drivers.record_info') || 'Record Information'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1 min-w-0">
              <div className="min-w-0">
                <span className="text-slate-400 dark:text-zinc-500 block text-[10px]">{t('admin.drivers.created_by') || 'Created By:'}</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200 break-all block">
                  {driverAudit.creator?.name || driverAudit.creator?.email || 'System Admin'}
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-slate-400 dark:text-zinc-500 block text-[10px]">{t('admin.drivers.created_at') || 'Created At:'}</span>
                <span className="font-medium text-slate-700 dark:text-zinc-300 break-all block">
                  {driverAudit.createdAt ? new Date(driverAudit.createdAt).toLocaleString('en-IN') : '—'}
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-slate-400 dark:text-zinc-500 block text-[10px]">{t('admin.drivers.updated_by') || 'Updated By:'}</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200 break-all block">
                  {driverAudit.updater?.name || driverAudit.updater?.email || '—'}
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-slate-400 dark:text-zinc-500 block text-[10px]">{t('admin.drivers.updated_at') || 'Updated At:'}</span>
                <span className="font-medium text-slate-700 dark:text-zinc-300 break-all block">
                  {driverAudit.updatedAt ? new Date(driverAudit.updatedAt).toLocaleString('en-IN') : '—'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 min-w-0">
          <button
            type="button"
            onClick={() => navigate(basePath)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer text-center justify-center flex items-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isEditMode ? (
              <FleetIcons.Check className="w-4 h-4 text-white shrink-0" />
            ) : (
              <FleetIcons.Plus className="w-4 h-4 text-white shrink-0" />
            )}
            <span>
              {loading
                ? 'Saving...'
                : isEditMode
                  ? 'Save Changes'
                  : isFleetPortal
                    ? 'Submit Driver'
                    : 'Save Driver'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminAddDriverPage;
