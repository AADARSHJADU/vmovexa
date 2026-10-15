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
import { useAuth } from '../../hooks/useAuth';
import { resolveFileUrl, uploadFile } from '../../api/services/upload.service';

const DRIVER_SHIFT_PRESETS = [
  { label: 'Morning Shift', icon: '🌅', start: '06:00', end: '14:00', desc: '06:00 AM - 02:00 PM' },
  { label: 'Evening Shift', icon: '🌇', start: '14:00', end: '22:00', desc: '02:00 PM - 10:00 PM' },
  { label: 'Night Feeder', icon: '🌙', start: '22:00', end: '06:00', desc: '10:00 PM - 06:00 AM' },
  { label: 'Split Roster', icon: '⏱️', start: '07:00', end: '19:00', desc: '07:00 AM - 07:00 PM' },
  { label: 'Custom Shift', icon: '⚡', start: null, end: null, desc: 'Custom Hours' },
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
  if (/night/i.test(shiftStr)) return { start: '22:00', end: '06:00', preset: 'Night Feeder' };
  if (/split/i.test(shiftStr)) return { start: '07:00', end: '19:00', preset: 'Split Roster' };

  return { start: '06:00', end: '14:00', preset: 'Morning Shift' };
}

export const AdminAddDriverPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const location = useLocation();

  // Detect if rendered inside Fleet Portal (/fleet-manager/*)
  const isFleetPortal = location.pathname.startsWith('/fleet-manager');
  const basePath = isFleetPortal ? '/fleet-manager/drivers' : '/admin/drivers';
  const dashboardLink = isFleetPortal ? '/fleet-manager/dashboard' : '/admin/dashboard';

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
  const driversList = Array.isArray(drivers) ? drivers : (drivers?.items || drivers?.rows || []);
  const depotsList = Array.isArray(depots) ? depots : (depots?.items || depots?.rows || []);
  const vehiclesList = Array.isArray(vehicles) ? vehicles : (vehicles?.items || vehicles?.rows || []);

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
    depot: '',
    depotName: '',
    assignedBus: '',
    assignedBusName: '',
    activeShift: '06:00 AM - 02:00 PM (8h)',
    joiningDate: '',
    experienceYears: '5 Years',
    notes: '',
    avatarUrl: '',
    documents: [],
  });

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
    if (canViewVehicles) loadVehicles().catch(() => {});
  }, [canAccessForm, canViewDepots, canViewVehicles, loadDepots, loadVehicles]);

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
      clientErrors.name = 'Driver Full Name is required.';
    } else if (formData.name.trim().length < 3) {
      clientErrors.name = 'Driver Full Name must be at least 3 characters.';
    } else if (!/^[a-zA-Z\s.'-]+$/.test(formData.name.trim())) {
      clientErrors.name = 'Driver Full Name can only contain letters, spaces, dots, and hyphens.';
    }

    // 2. Mobile Phone (Indian 10-digit number)
    const cleanPhone = (formData.phone || '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
    if (!formData.phone || !formData.phone.trim()) {
      clientErrors.phone = 'Mobile Phone number is required.';
    } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      clientErrors.phone = 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.';
    }

    // 3. Email (optional, but if provided must be valid)
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        clientErrors.email = 'Please enter a valid email address (e.g. driver@vmovexa.com).';
      }
    }

    // 4. Password
    if (!isEditMode) {
      if (!formData.password) {
        clientErrors.password = 'Driver App login password is required.';
      } else if (formData.password.length < 8) {
        clientErrors.password = 'Password must be at least 8 characters long.';
      } else if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
        clientErrors.password = 'Password must contain at least one letter and one number.';
      }
    } else if (formData.password) {
      if (formData.password.length < 8) {
        clientErrors.password = 'New password must be at least 8 characters long.';
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
        clientErrors.dob = 'Date of birth cannot be today or in the future.';
      } else {
        const ageYears = (today - dobDate) / (365.25 * 24 * 3600 * 1000);
        if (ageYears < 18) {
          clientErrors.dob = 'Driver must be at least 18 years old to be licensed.';
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
        clientErrors.badgeId = 'Depot Badge ID must be at least 2 characters.';
      } else if (!/^[A-Za-z0-9-_/]+$/.test(formData.badgeId.trim())) {
        clientErrors.badgeId = 'Depot Badge ID can only contain letters, numbers, hyphens, and slashes.';
      }
    }

    // 8. Commercial Driving License (DL) Number (Must be Unique)
    const cleanDL = (formData.dlNumber || '').trim();
    if (!cleanDL) {
      clientErrors.dlNumber = 'Commercial Driving License (DL) number is required.';
    } else if (cleanDL.length < 8) {
      clientErrors.dlNumber = 'Commercial DL number must be at least 8 characters.';
    } else if (!/^[A-Za-z0-9- ]{8,30}$/.test(cleanDL)) {
      clientErrors.dlNumber = 'Commercial DL number contains invalid characters.';
    } else if (driversList.length > 0) {
      const isDuplicate = driversList.some(
        (d) =>
          String(d.id) !== String(id) &&
          (d.dl_number || d.dlNumber || '').trim().toUpperCase() === cleanDL.toUpperCase()
      );
      if (isDuplicate) {
        clientErrors.dlNumber = 'This Commercial Driving License (DL) number is already registered to another driver.';
      }
    }

    // 9. DL Expiry Date (MUST be a future date!)
    if (!formData.dlExpiry) {
      clientErrors.dlExpiry = 'DL Expiry Date is required.';
    } else {
      const expDate = new Date(formData.dlExpiry);
      const todayZero = new Date();
      todayZero.setHours(0, 0, 0, 0);
      if (isNaN(expDate.getTime())) {
        clientErrors.dlExpiry = 'Please enter a valid DL expiry date.';
      } else if (expDate <= todayZero) {
        clientErrors.dlExpiry = 'Driving License has expired. Expiry date must be a future date.';
      }
    }

    // 10. DL Issue Date (optional, but cannot be in future or after expiry)
    if (formData.issueDate) {
      const issueDate = new Date(formData.issueDate);
      if (issueDate > new Date()) {
        clientErrors.issueDate = 'DL issue date cannot be in the future.';
      } else if (formData.dlExpiry && issueDate >= new Date(formData.dlExpiry)) {
        clientErrors.issueDate = 'DL issue date must be before the expiry date.';
      }
    }

    // 11. Issuing RTO Authority
    if (!formData.issuingAuthority || !formData.issuingAuthority.trim()) {
      clientErrors.issuingAuthority = 'RTO Issuing Authority is required (e.g. RTO Pune).';
    } else if (formData.issuingAuthority.trim().length < 2) {
      clientErrors.issuingAuthority = 'RTO Issuing Authority must be at least 2 characters.';
    }

    // 12. Medical Certificate Validity (cannot be expired)
    if (!formData.medicalFitnessValidUntil) {
      clientErrors.medicalFitnessValidUntil = 'Medical Certificate validity date is required.';
    } else {
      const medDate = new Date(formData.medicalFitnessValidUntil);
      const todayZero = new Date();
      todayZero.setHours(0, 0, 0, 0);
      if (isNaN(medDate.getTime())) {
        clientErrors.medicalFitnessValidUntil = 'Please enter a valid date.';
      } else if (medDate < todayZero) {
        clientErrors.medicalFitnessValidUntil = 'Medical fitness certificate has expired. Please provide a valid future date.';
      }
    }

    // 13. Residential Address, City, State, Pincode
    if (!formData.address || !formData.address.trim()) {
      clientErrors.address = 'Driver residence address is required.';
    } else if (formData.address.trim().length < 5) {
      clientErrors.address = 'Residence address must be at least 5 characters.';
    }

    if (!formData.city || !formData.city.trim()) {
      clientErrors.city = 'City / District is required.';
    } else if (formData.city.trim().length < 2) {
      clientErrors.city = 'City / District must be at least 2 characters.';
    }

    if (!formData.state || !formData.state.trim()) {
      clientErrors.state = 'State is required.';
    } else if (formData.state.trim().length < 2) {
      clientErrors.state = 'State must be at least 2 characters.';
    }

    const cleanPincode = (formData.pincode || '').replace(/\D/g, '');
    if (!formData.pincode || !formData.pincode.trim()) {
      clientErrors.pincode = 'Pincode / Postal Code is required.';
    } else if (!/^\d{6}$/.test(cleanPincode)) {
      clientErrors.pincode = 'Please enter a valid 6-digit Indian PIN code.';
    }

    // 14. Emergency Contact Details
    if (!formData.emergencyContactName || !formData.emergencyContactName.trim()) {
      clientErrors.emergencyContactName = 'Emergency contact person name is required.';
    } else if (formData.emergencyContactName.trim().length < 3) {
      clientErrors.emergencyContactName = 'Emergency contact name must be at least 3 characters.';
    }

    if (!formData.emergencyContactRelation) {
      clientErrors.emergencyContactRelation = 'Please select relationship to emergency contact.';
    }

    const cleanEmgPhone = (formData.emergencyContact || '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
    if (!formData.emergencyContact || !formData.emergencyContact.trim()) {
      clientErrors.emergencyContact = 'Emergency phone number is required.';
    } else if (!/^[6-9]\d{9}$/.test(cleanEmgPhone)) {
      clientErrors.emergencyContact = 'Please enter a valid 10-digit Indian emergency phone number.';
    } else if (cleanEmgPhone === cleanPhone) {
      clientErrors.emergencyContact = "Emergency phone cannot be the same as the driver's own mobile phone.";
    }

    // 15. Assigned Home Depot
    if (!formData.depot) {
      clientErrors.depot = 'Assigned Home Depot is required.';
    }

    // 16. Experience
    if (!formData.experienceYears || !formData.experienceYears.trim()) {
      clientErrors.experienceYears = 'Driving experience details are required.';
    }

    // 17. Compliance Documents
    if (!formData.documents || formData.documents.length === 0) {
      clientErrors.documents = 'Please upload at least one compliance document (Driving License or Aadhaar KYC).';
    }

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setFormError('Please resolve the highlighted validation errors below before submitting.');
      toast.error('Validation error: Please complete and correct all required driver details');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);

    // Process pending document uploads on submit
    const pendingDocs = (formData.documents || []).filter((d) => d.isPendingUpload && d.file);
    const submitDocuments = [];
    let docToastId = null;
    if (pendingDocs.length > 0) {
      docToastId = toast.loading(`Uploading ${pendingDocs.length} driver compliance document(s)...`);
    }

    for (const doc of formData.documents || []) {
      if (doc.isPendingUpload && doc.file) {
        try {
          const res = await uploadFile(doc.file, 'driver_kyc');
          const fileUrl = res?.url || res?.filePath || res;
          submitDocuments.push({
            category: doc.category || doc.purpose || 'Driver Compliance Document',
            purpose: doc.category || doc.purpose || 'Driver Compliance Document',
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

    // Fleet portal drivers go to pending_approval; Admin drivers go to available
    const submitData = {
      organizationId: user?.organizationId || user?.organization_id || undefined,
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
      depot: formData.depot ? Number(formData.depot) : null,
      depotId: formData.depot ? Number(formData.depot) : null,
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
        loading: isEditMode ? 'Updating driver roster details...' : 'Onboarding driver & registering documents...',
        success: isEditMode
          ? `Driver ${formData.name} details updated successfully!`
          : isFleetPortal
            ? `Driver ${formData.name} submitted for Admin approval!`
            : `Driver ${formData.name} onboarded successfully!`,
        error: (err) => {
          if (typeof err === 'string') return err;
          if (err?.message) return err.message;
          return isEditMode ? 'Failed to update driver' : 'Failed to onboard driver';
        },
      });
      navigate(basePath);
    } catch (err) {
      console.error('Driver save error:', err);
      let errorMsg = 'Failed to save driver details. Please check the highlighted fields below.';
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
            serverFieldErrors.phone = 'A user with this mobile phone number already exists.';
            errorMsg = 'This phone number is already registered to an existing account.';
          } else if (msgLower.includes('email')) {
            serverFieldErrors.email = 'A user with this email address already exists.';
            errorMsg = 'This email address is already registered.';
          } else if (msgLower.includes('badge')) {
            serverFieldErrors.badgeId = 'This Depot Badge ID is already assigned to another driver.';
            errorMsg = 'This Depot Badge ID is already in use.';
          } else if (msgLower.includes('dl') || msgLower.includes('license')) {
            serverFieldErrors.dlNumber = 'A driver with this Driving License (DL) number already exists.';
            errorMsg = 'This Driving License (DL) number is already registered.';
          } else {
            errorMsg = 'A driver with these unique identification details already exists.';
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
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm space-y-4">
        <div className="text-4xl">🔒</div>
        <h2 className="text-lg font-black text-slate-900">Access Revoked</h2>
        <p className="text-sm text-slate-500 font-medium">
          Your administrator has revoked your permission to {isEditMode ? 'edit' : 'create'} drivers.
        </p>
        <Link
          to={basePath}
          className="inline-block px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
        >
          ← Back to Drivers
        </Link>
      </div>
    );
  }

  if (fetchingDriver) {
    return (
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
        <div className="text-slate-500 font-bold text-sm">Loading driver roster details...</div>
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
              { label: isFleetPortal ? 'Fleet Operator' : 'Tenant Admin', path: dashboardLink },
              { label: 'Drivers Roster', path: basePath },
              { label: isEditMode ? `Edit: ${formData.name || 'Driver'}` : 'Onboard Driver' },
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
            {isEditMode ? `Edit Driver: ${formData.name}` : 'Onboard New Transit Driver'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Register commercial driving license, residential address with Google Places, emergency contacts, depot assignment, and KYC documents.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={() => navigate(basePath)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer text-center justify-center flex items-center"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="text-sm font-black">+</span>
            )}
            <span>
              {loading
                ? 'Saving...'
                : isEditMode
                  ? 'Update Driver Profile'
                  : isFleetPortal
                    ? 'Submit Driver for Approval'
                    : 'Onboard Driver'}
            </span>
          </button>
        </div>
      </div>

      {/* Fleet Portal Pending-Approval Notice */}
      {isFleetPortal && !isEditMode && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
          <span className="text-xl">⏳</span>
          <div>
            <p className="font-bold">Pending Admin Approval Required</p>
            <p className="text-amber-700 text-[11px] mt-0.5">
              Drivers onboarded by Fleet Operators require Organization Admin verification before receiving active trip schedules.
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
                  Validation & Submission Error
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
              title="Dismiss error"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Section 1: Photo Avatar & Account Credentials */}
        <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5 min-w-0 overflow-hidden">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold text-sm shrink-0">
                🔐
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  1. Driver Account & Profile Photo
                </h2>
                <p className="text-xs text-slate-500">Official avatar photo and mobile app login credentials.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-stretch lg:items-start gap-5 sm:gap-6 pt-1 min-w-0">
            {/* Driver Avatar */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl shrink-0 w-full lg:w-80 min-w-0">
              <div className="relative group shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-slate-600 font-black text-xl">
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
                <h4 className="font-bold text-slate-900 text-xs truncate">Driver Photo Badge</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                  Identity badge verification photo
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer"
                  >
                    {uploadingAvatar ? 'Uploading...' : 'Choose Photo'}
                  </button>
                  {formData.avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, avatarUrl: '' }))}
                      className="text-xs font-bold text-red-600 hover:text-red-700 underline cursor-pointer"
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
                <label className="text-xs font-bold text-slate-700">Driver Login Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. driver@vmovexa.com"
                  value={formData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value.toLowerCase())}
                  className={`w-full h-11 px-3.5 rounded-xl border text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
                    fieldErrors.email
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white'
                  }`}
                />
                {fieldErrors.email && (
                  <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                    <span>⚠️</span> {fieldErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Driver App Password {!isEditMode ? '*' : '(Optional on Edit)'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={isEditMode ? 'Leave blank to keep existing password' : 'Enter login password (e.g. Test@12345)'}
                    value={formData.password}
                    onChange={(e) => handleFieldChange('password', e.target.value)}
                    className={`w-full h-11 pl-3.5 pr-10 rounded-xl border text-xs text-slate-900 focus:outline-none transition-all font-mono ${
                      fieldErrors.password
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                        : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                    <span>⚠️</span> {fieldErrors.password}
                  </p>
                )}
                {isEditMode && !fieldErrors.password && (
                  <p className="text-[10px] text-slate-400 font-medium">
                    Enter a new password only if you wish to reset or change the driver's password.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Personal Identification & KYC */}
        <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5 min-w-0 overflow-hidden">
          <div className="pb-4 border-b border-slate-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center font-bold text-sm">
              👤
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                2. Personal Identification
              </h2>
              <p className="text-xs text-slate-500">Legal personal demographics, blood group, and contact information.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Full Name * */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Driver Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Rameshwar D. Pawar"
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
                  fieldErrors.name
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white'
                }`}
              />
              {fieldErrors.name && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <span>⚠️</span> {fieldErrors.name}
                </p>
              )}
            </div>

            {/* Mobile Phone * */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Mobile Phone *</label>
              <input
                type="tel"
                placeholder="+91 98765 00000"
                value={formData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
                  fieldErrors.phone
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white'
                }`}
              />
              {fieldErrors.phone && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <span>⚠️</span> {fieldErrors.phone}
                </p>
              )}
            </div>

            {/* Blood Group */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Blood Group *</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => handleFieldChange('bloodGroup', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs font-bold text-slate-900 focus:outline-none transition-all ${
                  fieldErrors.bloodGroup
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white'
                }`}
              >
                <option value="">Select Blood Group</option>
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
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <span>⚠️</span> {fieldErrors.bloodGroup}
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Date of Birth (Age 18–70) *</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => handleFieldChange('dob', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs font-medium text-slate-900 focus:outline-none transition-all ${
                  fieldErrors.dob
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white'
                }`}
              />
              {fieldErrors.dob && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <span>⚠️</span> {fieldErrors.dob}
                </p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => handleFieldChange('gender', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs font-medium text-slate-900 focus:outline-none transition-all ${
                  fieldErrors.gender
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white'
                }`}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {fieldErrors.gender && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <span>⚠️</span> {fieldErrors.gender}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Commercial License & Medical Compliance */}
        <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5 min-w-0 overflow-hidden">
          <div className="pb-4 border-b border-slate-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold text-sm">
              🪪
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                3. Commercial Driving License & Medical Compliance
              </h2>
              <p className="text-xs text-slate-500">Official RTO commercial heavy transport authorization and fitness certificate validity.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Depot Badge ID (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Depot Badge ID <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. MCTA-BDG-8840 (Optional)"
                value={formData.badgeId}
                onChange={(e) => handleFieldChange('badgeId', e.target.value.toUpperCase())}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
                  fieldErrors.badgeId
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white'
                }`}
              />
              {fieldErrors.badgeId && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <span>⚠️</span> {fieldErrors.badgeId}
                </p>
              )}
            </div>

            {/* Employee / Staff ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Staff / Employee ID (Optional)</label>
              <input
                type="text"
                placeholder="e.g. EMP-9021"
                value={formData.empId}
                onChange={(e) => handleFieldChange('empId', e.target.value.toUpperCase())}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            {/* DL Number * (Unique) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Commercial License (DL) * <span className="text-blue-600 font-semibold text-[10px]">(Unique)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. MH-12-20150099881"
                value={formData.dlNumber}
                onChange={(e) => handleFieldChange('dlNumber', e.target.value.toUpperCase())}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
                  fieldErrors.dlNumber
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white'
                }`}
              />
              {fieldErrors.dlNumber && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <span>⚠️</span> {fieldErrors.dlNumber}
                </p>
              )}
            </div>

            {/* License Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">License Classification Type</label>
              <select
                value={formData.licenseType}
                onChange={(e) => handleFieldChange('licenseType', e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="Commercial Heavy (HMV)">Commercial Heavy (HMV / Bus Pilot)</option>
                <option value="Transport Commercial (TRANS)">Transport Commercial (TRANS)</option>
                <option value="Commercial Light (LMV-TR)">Commercial Light (LMV-TR)</option>
                <option value="Electric Transit Special">Electric Transit Special Pilot</option>
              </select>
            </div>

            {/* DL Issue Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">DL Issue Date (Optional)</label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => handleFieldChange('issueDate', e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            {/* DL Expiry Date * */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">DL Validity Expiry Date *</label>
              <input
                type="date"
                value={formData.dlExpiry}
                onChange={(e) => handleFieldChange('dlExpiry', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs font-bold text-slate-800 focus:outline-none transition-all ${
                  fieldErrors.dlExpiry
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white'
                }`}
              />
              {fieldErrors.dlExpiry && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <span>⚠️</span> {fieldErrors.dlExpiry}
                </p>
              )}
            </div>

            {/* Issuing Authority */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">RTO Issuing Authority *</label>
              <input
                type="text"
                placeholder="e.g. RTO Pune (MH-12)"
                value={formData.issuingAuthority}
                onChange={(e) => handleFieldChange('issuingAuthority', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
                  fieldErrors.issuingAuthority
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white'
                }`}
              />
              {fieldErrors.issuingAuthority && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <span>⚠️</span> {fieldErrors.issuingAuthority}
                </p>
              )}
            </div>

            {/* Medical Fitness Valid Until */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Medical Certificate Valid Until *</label>
              <input
                type="date"
                value={formData.medicalFitnessValidUntil}
                onChange={(e) => handleFieldChange('medicalFitnessValidUntil', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs font-medium text-slate-800 focus:outline-none transition-all ${
                  fieldErrors.medicalFitnessValidUntil
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white'
                }`}
              />
              {fieldErrors.medicalFitnessValidUntil && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <span>⚠️</span> {fieldErrors.medicalFitnessValidUntil}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Residential Address & Google Places Autocomplete Search */}
        <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5 min-w-0 overflow-hidden">
          <div className="pb-4 border-b border-slate-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold text-sm">
              📍
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                4. Residential Address & Google Places Location
              </h2>
              <p className="text-xs text-slate-500">Live search residence via Google Maps Places API and adjust exact home location pin.</p>
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
          />
        </div>

        {/* Section 5: Emergency Contact Person */}
        <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5 min-w-0 overflow-hidden">
          <div className="pb-4 border-b border-slate-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center font-bold text-sm">
              🚨
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                5. Emergency Contact Person
              </h2>
              <p className="text-xs text-slate-500">Designated immediate family contact for transit safety or medical emergencies.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Contact Person Name *</label>
              <input
                type="text"
                placeholder="e.g. Sunita Pawar"
                value={formData.emergencyContactName}
                onChange={(e) => handleFieldChange('emergencyContactName', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
                  fieldErrors.emergencyContactName
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 bg-slate-50 focus:border-rose-500 focus:bg-white'
                }`}
              />
              {fieldErrors.emergencyContactName && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <span>⚠️</span> {fieldErrors.emergencyContactName}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Relationship to Driver *</label>
              <select
                value={formData.emergencyContactRelation}
                onChange={(e) => handleFieldChange('emergencyContactRelation', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs font-medium text-slate-900 focus:outline-none transition-all ${
                  fieldErrors.emergencyContactRelation
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 bg-slate-50 focus:border-rose-500 focus:bg-white'
                }`}
              >
                <option value="Spouse">Spouse / Wife / Husband</option>
                <option value="Parent">Father / Mother</option>
                <option value="Child">Son / Daughter</option>
                <option value="Sibling">Brother / Sister</option>
                <option value="Guardian">Legal Guardian / Next of Kin</option>
              </select>
              {fieldErrors.emergencyContactRelation && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <span>⚠️</span> {fieldErrors.emergencyContactRelation}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Emergency Phone Number *</label>
              <input
                type="tel"
                placeholder="+91 98220 00000"
                value={formData.emergencyContact}
                onChange={(e) => handleFieldChange('emergencyContact', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
                  fieldErrors.emergencyContact
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 bg-slate-50 focus:border-rose-500 focus:bg-white'
                }`}
              />
              {fieldErrors.emergencyContact && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <span>⚠️</span> {fieldErrors.emergencyContact}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 6: Depot & Operational Schedule */}
        <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5 min-w-0 overflow-hidden">
          <div className="pb-4 border-b border-slate-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center font-bold text-sm">
              🚌
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                6. Depot Assignment & Shift Schedule
              </h2>
              <p className="text-xs text-slate-500">Operational home terminal, designated transit bus, and roster shift timings.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Assigned Home Depot * */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Assigned Home Depot *</label>
              <select
                value={formData.depot}
                onChange={(e) => handleFieldChange('depot', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs font-bold text-slate-800 focus:outline-none transition-all ${
                  fieldErrors.depot
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white'
                }`}
              >
                <option value="">Select a depot</option>
                {formData.depot && !depotsList.some((d) => String(d.id) === String(formData.depot)) && (
                  <option value={formData.depot}>{formData.depotName || `Depot #${formData.depot}`}</option>
                )}
                {depotsList.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              {fieldErrors.depot && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <span>⚠️</span> {fieldErrors.depot}
                </p>
              )}
            </div>

            {/* Assigned Vehicle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Assigned Vehicle / Bus</label>
              <select
                value={formData.assignedBus}
                onChange={(e) => {
                  const val = e.target.value;
                  const vMatch = vehiclesList.find((v) => String(v.id) === String(val));
                  setFormData((prev) => ({
                    ...prev,
                    assignedBus: val,
                    assignedBusName: vMatch?.busNumber || vMatch?.bus_number || '',
                  }));
                }}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="">Unassigned (Flexible Roster)</option>
                {formData.assignedBus && !vehiclesList.some((v) => String(v.id) === String(formData.assignedBus)) && (
                  <option value={formData.assignedBus}>{formData.assignedBusName || `Bus #${formData.assignedBus}`}</option>
                )}
                {vehiclesList.map((v) => (
                  <option key={v.id} value={v.id}>{v.busNumber || v.bus_number || `Bus #${v.id}`} — {v.vehicleType || v.vehicle_type || 'Bus'}</option>
                ))}
              </select>
            </div>

            {/* Date of Joining */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Date of Joining</label>
              <input
                type="date"
                value={formData.joiningDate}
                onChange={(e) => handleFieldChange('joiningDate', e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            {/* Divided Initial Shift Schedule Section (Spanning full width) */}
            <div className="space-y-3 col-span-full pt-2 pb-3 border-y border-slate-100">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>⏱️</span> Initial Shift Schedule & Working Hours
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Set shift start & end times with AM/PM support. Duration calculates automatically.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Roster: <strong className="font-mono text-blue-700">{formData.activeShift}</strong>
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
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <span>{preset.icon}</span>
                      <span>{preset.label}</span>
                      {preset.desc && preset.label !== 'Custom Shift' && (
                        <span className={`text-[10px] font-normal ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                          ({preset.desc})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Divided Shift Timing & Calculated Duration Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                {/* 1. Shift Start Time */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      Shift Start Time
                    </label>
                    <button
                      type="button"
                      onClick={handleToggleStartAmPm}
                      className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer flex items-center gap-1"
                      title="Click to toggle AM / PM"
                    >
                      <span>{getPeriod(shiftStartTime)}</span>
                      <span className="text-[10px] text-slate-400">⇄</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="time"
                      value={shiftStartTime}
                      onChange={(e) => handleStartTimeChange(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
                    <span>12-Hour Time:</span>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                      {formatTime12Hour(shiftStartTime)}
                    </span>
                  </div>
                </div>

                {/* 2. Shift End Time */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                      Shift End Time
                    </label>
                    <button
                      type="button"
                      onClick={handleToggleEndAmPm}
                      className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer flex items-center gap-1"
                      title="Click to toggle AM / PM"
                    >
                      <span>{getPeriod(shiftEndTime)}</span>
                      <span className="text-[10px] text-slate-400">⇄</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="time"
                      value={shiftEndTime}
                      onChange={(e) => handleEndTimeChange(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
                    <span>12-Hour Time:</span>
                    <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200/60">
                      {formatTime12Hour(shiftEndTime)}
                    </span>
                  </div>
                </div>

                {/* 3. Calculated Duration Container */}
                <div className="p-3.5 rounded-xl bg-linear-to-br from-blue-50/90 via-indigo-50/50 to-slate-50 border border-blue-200/80 flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1">
                      <span>⏱️</span> Calculated Shift Duration
                    </span>
                    {shiftDuration?.isOvernight && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                        Overnight (+1d)
                      </span>
                    )}
                  </div>
                  <div className="my-1">
                    <div className="text-xl font-black text-blue-900 font-mono tracking-tight">
                      {shiftDuration ? shiftDuration.label : '--'}
                    </div>
                  </div>
                  <div className="text-[11px] font-medium text-blue-700/80 flex items-center justify-between pt-1 border-t border-blue-100">
                    <span>Duty Span:</span>
                    <span className="font-bold font-mono text-blue-950">
                      {formatTime12Hour(shiftStartTime)} → {formatTime12Hour(shiftEndTime)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Experience in Years */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Driving Experience *</label>
              <input
                type="text"
                placeholder="e.g. 7 Years (City Transit)"
                value={formData.experienceYears}
                onChange={(e) => handleFieldChange('experienceYears', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
                  fieldErrors.experienceYears
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white'
                }`}
              />
              {fieldErrors.experienceYears && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <span>⚠️</span> {fieldErrors.experienceYears}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700">Operational Notes</label>
              <input
                type="text"
                placeholder="Special route qualifications, accolades..."
                value={formData.notes}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 7: Driver Compliance Documents */}
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
            title="Upload Driver Compliance Documents (DL, Aadhaar, Medical Certificate, Police Verification)"
            purpose="driver_kyc"
            deferUpload={true}
          />
          {fieldErrors.documents && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2 mt-2">
              <span className="text-base">⚠️</span>
              <span>{fieldErrors.documents}</span>
            </div>
          )}
        </div>

        {/* Section 8: Audit & Record Information (Visible in Edit Mode) */}
        {isEditMode && (
          <div className="p-4 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2 min-w-0 overflow-hidden">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span>📋</span>
              <span>Audit & Record Information</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1 min-w-0">
              <div className="min-w-0">
                <span className="text-slate-400 block text-[10px]">Created By:</span>
                <span className="font-bold text-slate-800 break-all block">
                  {driverAudit.creator?.name || driverAudit.creator?.email || 'System Admin'}
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-slate-400 block text-[10px]">Created At:</span>
                <span className="font-medium text-slate-700 break-all block">
                  {driverAudit.createdAt ? new Date(driverAudit.createdAt).toLocaleString('en-IN') : '—'}
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-slate-400 block text-[10px]">Last Updated By:</span>
                <span className="font-bold text-slate-800 break-all block">
                  {driverAudit.updater?.name || driverAudit.updater?.email || '—'}
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-slate-400 block text-[10px]">Last Updated At:</span>
                <span className="font-medium text-slate-700 break-all block">
                  {driverAudit.updatedAt ? new Date(driverAudit.updatedAt).toLocaleString('en-IN') : '—'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 min-w-0">
          <button
            type="button"
            onClick={() => navigate(basePath)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer text-center justify-center flex items-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FleetIcons.Check className="w-4 h-4" />
            )}
            <span>
              {loading
                ? 'Saving...'
                : isEditMode
                  ? 'Update Driver Profile'
                  : isFleetPortal
                    ? 'Submit Driver for Approval'
                    : 'Onboard Driver to Fleet'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminAddDriverPage;
