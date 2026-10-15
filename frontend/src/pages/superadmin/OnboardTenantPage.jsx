import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import { LocationAutocompleteInput } from '../../components/ui/LocationAutocompleteInput';
import { useOrganization } from '../../hooks/superadmin/useOrganization';
import { useAuth } from '../../hooks/useAuth';
import billingService from '../../api/services/billing.service';
import uploadService from '../../api/services/shared/upload.service';
import { getMediaUrl } from '../../utils/media';
import toast from 'react-hot-toast';
import { Breadcrumb } from '../../components/ui/Breadcrumb';

export const INDIAN_STATES_AND_UTS = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export const PRESET_AVATARS = [
  {
    id: 'transit_blue',
    title: 'Blue Bus Transit',
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='24' fill='%232563eb'/><path d='M25 32h50c3 0 5 2 5 5v26c0 3-2 5-5 5H25c-3 0-5-2-5-5V37c0-3 2-5 5-5z' fill='%23ffffff' opacity='0.9'/><rect x='28' y='37' width='20' height='14' rx='3' fill='%232563eb'/><rect x='52' y='37' width='20' height='14' rx='3' fill='%232563eb'/><circle cx='35' cy='74' r='7' fill='%23ffffff'/><circle cx='65' cy='74' r='7' fill='%23ffffff'/></svg>",
  },
  {
    id: 'city_emerald',
    title: 'Emerald City Corp',
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='24' fill='%23059669'/><path d='M28 24h44v56H28z' fill='%23ffffff'/><rect x='36' y='34' width='9' height='9' rx='2' fill='%23059669'/><rect x='55' y='34' width='9' height='9' rx='2' fill='%23059669'/><rect x='36' y='49' width='9' height='9' rx='2' fill='%23059669'/><rect x='55' y='49' width='9' height='9' rx='2' fill='%23059669'/></svg>",
  },
  {
    id: 'shield_indigo',
    title: 'Indigo Security Fleet',
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='24' fill='%234f46e5'/><path d='M50 20 L75 30 V55 C75 70 50 82 50 82 C50 82 25 70 25 55 V30 Z' fill='%23ffffff'/></svg>",
  },
  {
    id: 'express_amber',
    title: 'Amber Express Fleet',
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='24' fill='%23d97706'/><path d='M55 20 L25 55 H45 L40 80 L75 45 H55 Z' fill='%23ffffff'/></svg>",
  },
  {
    id: 'global_rose',
    title: 'Rose Global Mobility',
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='24' fill='%23e11d48'/><circle cx='50' cy='50' r='28' stroke='%23ffffff' stroke-width='6' fill='none'/><ellipse cx='50' cy='50' rx='14' ry='28' stroke='%23ffffff' stroke-width='4' fill='none'/><line x1='22' y1='50' x2='78' y2='50' stroke='%23ffffff' stroke-width='4'/></svg>",
  },
  {
    id: 'metro_violet',
    title: 'Violet Tech Transit',
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='24' fill='%237c3aed'/><circle cx='50' cy='30' r='10' fill='%23ffffff'/><circle cx='30' cy='70' r='10' fill='%23ffffff'/><circle cx='70' cy='70' r='10' fill='%23ffffff'/><line x1='50' y1='30' x2='30' y2='70' stroke='%23ffffff' stroke-width='4'/><line x1='50' y1='30' x2='70' y2='70' stroke='%23ffffff' stroke-width='4'/><line x1='30' y1='70' x2='70' y2='70' stroke='%23ffffff' stroke-width='4'/></svg>",
  },
  {
    id: 'cyan_logistics',
    title: 'Cyan Freight & Logistics',
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='24' fill='%230891b2'/><path d='M20 35h45v30H20z' fill='%23ffffff'/><path d='M65 45l15 5v15H65z' fill='%23ffffff' opacity='0.8'/><circle cx='35' cy='70' r='6' fill='%23ffffff'/><circle cx='70' cy='70' r='6' fill='%23ffffff'/></svg>",
  },
];

export const OnboardTenantPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { createOrganization } = useOrganization();

  const isFinance = location.pathname.startsWith('/finance') || location.pathname.startsWith('/superadmin/finance');
  const basePath = location.pathname.startsWith('/finance/subscriptions')
    ? '/finance/subscriptions'
    : location.pathname.startsWith('/superadmin/finance/subscriptions')
    ? '/superadmin/finance/subscriptions'
    : '/superadmin/tenants';

  const [currentStep, setCurrentStep] = useState(1);
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [successModalData, setSuccessModalData] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const fileInputRef = useRef(null);

  // Revoke object URL on unmount or when preview changes
  useEffect(() => {
    return () => {
      if (logoPreview && logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const [formData, setFormData] = useState({
    name: '',
    logoUrl: '',
    state: 'Maharashtra',
    city: 'Mumbai',
    cin: '',
    gstin: '',
    officeAddress: '',
    pincode: '',
    latitude: null,
    longitude: null,
    placeId: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    adminPassword: '',
    planId: null,
    planName: 'Starter Tier',
    busesCount: '25',
    depotsCount: '2',
    adRevenueShareRate: '65',
    paymentMode: 'online', // 'online' | 'offline'
    bankRef: '',
    bankName: 'State Bank of India',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: '',
    acceptContract: false,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showReviewPassword, setShowReviewPassword] = useState(false);

  // Load active subscription plans from backend
  useEffect(() => {
    let ignore = false;
    const fetchPlans = async () => {
      try {
        const res = await billingService.getPlans();
        const data = Array.isArray(res) ? res : (Array.isArray(res?.rows) ? res.rows : (Array.isArray(res?.data) ? res.data : []));
        if (!ignore && data && data.length > 0) {
          setPlans(data);
          const defaultPlan = data[0];
          const basePrice = Number(defaultPlan.monthly_price) || 0;
          setFormData((prev) => ({
            ...prev,
            planId: defaultPlan.id,
            planName: defaultPlan.name,
            busesCount: String(defaultPlan.buses_limit || 25),
            depotsCount: String(defaultPlan.features?.depots_limit || 2),
            adRevenueShareRate: String(defaultPlan.ad_revenue_share_rate || 65),
            amount: String(basePrice),
          }));
        }
      } catch (err) {
        console.warn('Failed to load subscription plans:', err?.message);
      } finally {
        if (!ignore) setLoadingPlans(false);
      }
    };

    fetchPlans();
    return () => {
      ignore = true;
    };
  }, []);

  // Field validation engine
  const validateField = (field, value, values = formData) => {
    switch (field) {
      case 'name':
        if (!value || !String(value).trim()) return 'Company name is required';
        if (String(value).trim().length < 2) return 'Company name must be at least 2 characters';
        return '';

      case 'city':
        if (!value || !String(value).trim()) return 'City is required';
        if (String(value).trim().length < 2) return 'City must be at least 2 characters';
        return '';

      case 'state':
        if (!value || !String(value).trim()) return 'Please select a state / UT';
        return '';

      case 'cin':
        if (value && String(value).trim()) {
          const cleanCin = String(value).trim().toUpperCase();
          if (!/^[A-Z0-9]{21}$/.test(cleanCin)) {
            return 'CIN must be exactly 21 alphanumeric characters (e.g. U60200MH2021PTC109921)';
          }
        }
        return '';

      case 'gstin':
        if (value && String(value).trim()) {
          const cleanGstin = String(value).trim().toUpperCase();
          if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(cleanGstin)) {
            return 'Invalid GSTIN format (e.g. 27AAACM1234F1Z8)';
          }
        }
        return '';

      case 'pincode':
        if (value && String(value).trim()) {
          const cleanPin = String(value).trim();
          if (!/^\d{6}$/.test(cleanPin)) {
            return 'Pincode must be exactly 6 digits (e.g. 400001)';
          }
        }
        return '';

      case 'adminName':
        if (!value || !String(value).trim()) return 'Admin full name is required';
        if (String(value).trim().length < 2) return 'Admin name must be at least 2 characters';
        return '';

      case 'adminEmail':
        if (!value || !String(value).trim()) return 'Admin email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim())) {
          return 'Enter a valid email address (e.g. admin@company.com)';
        }
        return '';

      case 'adminPhone':
        if (!value || !String(value).trim()) return 'Mobile phone number is required';
        if (!/^[6-9]\d{9}$/.test(String(value).trim())) {
          return 'Enter a valid 10-digit Indian mobile number (starts with 6-9)';
        }
        return '';

      case 'adminPassword':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(value)) return 'Password must contain at least 1 uppercase letter (A-Z)';
        if (!/[0-9]/.test(value)) return 'Password must contain at least 1 number (0-9)';
        if (!/[^A-Za-z0-9]/.test(value)) return 'Password must contain at least 1 special character (!@#$%^&*)';
        return '';

      case 'bankName':
        if (values.paymentMode === 'offline') {
          if (!value || !String(value).trim()) return 'Bank name is required for offline settlement';
        }
        return '';

      case 'bankRef':
        if (values.paymentMode === 'offline') {
          if (!value || !String(value).trim()) return 'Bank reference / UTR is required';
          if (String(value).trim().length < 4) return 'UTR / Reference must be at least 4 characters';
        }
        return '';

      case 'paymentDate':
        if (values.paymentMode === 'offline') {
          if (!value) return 'Payment date is required';
        }
        return '';

      default:
        return '';
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      const err = validateField(field, value, updated);
      setErrors((prevErr) => ({ ...prevErr, [field]: err }));
      return updated;
    });
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handlePhoneChange = (value) => {
    const cleanDigits = value.replace(/\D/g, '').slice(0, 10);
    handleFieldChange('adminPhone', cleanDigits);
  };

  const handleGstinChange = (value) => {
    const cleanGstin = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
    handleFieldChange('gstin', cleanGstin);
  };

  const handleCinChange = (value) => {
    const cleanCin = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 21);
    handleFieldChange('cin', cleanCin);
  };

  const handlePincodeChange = (value) => {
    const cleanDigits = value.replace(/\D/g, '').slice(0, 6);
    handleFieldChange('pincode', cleanDigits);
  };

  const handleLocationSelect = (displayName, lat, lng, fullAddress, parsed) => {
    const targetAddress = fullAddress || displayName || '';

    setFormData((prev) => {
      const updated = {
        ...prev,
        officeAddress: targetAddress,
      };

      // Only auto-fill city, state, pincode, GPS if user selected a place from Google suggestions
      if (parsed) {
        if (parsed.city) updated.city = parsed.city;
        if (parsed.state) {
          const matched = INDIAN_STATES_AND_UTS.find(
            (s) => s.toLowerCase() === parsed.state.toLowerCase()
          );
          updated.state = matched || parsed.state;
        }
        if (parsed.pincode) {
          updated.pincode = String(parsed.pincode).replace(/\D/g, '').slice(0, 6);
        }
        if (parsed.place_id) updated.placeId = parsed.place_id;
        if (lat != null) updated.latitude = Number(lat);
        if (lng != null) updated.longitude = Number(lng);
      } else {
        if (lat != null) updated.latitude = Number(lat);
        if (lng != null) updated.longitude = Number(lng);
      }
      return updated;
    });

    if (parsed) {
      if (parsed.city) setErrors((prev) => ({ ...prev, city: '' }));
      if (parsed.state) setErrors((prev) => ({ ...prev, state: '' }));
      if (parsed.pincode) setErrors((prev) => ({ ...prev, pincode: '' }));
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, WebP, SVG).');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size exceeds 5MB limit.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Clean up previous blob preview if any
    if (logoPreview && logoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setLogoFile(file);
    setLogoPreview(previewUrl);
    setFormData((prev) => ({ ...prev, logoUrl: '' }));
    toast.success('Image selected! It will be uploaded upon submitting the form.');
  };

  const handleSelectPresetAvatar = (avatarUrl) => {
    if (logoPreview && logoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoFile(null);
    setLogoPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setFormData((prev) => ({ ...prev, logoUrl: avatarUrl }));
  };

  const handleRemoveLogo = () => {
    if (logoPreview && logoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoFile(null);
    setLogoPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setFormData((prev) => ({ ...prev, logoUrl: '' }));
  };

  const generateRandomPassword = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    const alpha = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const randLetter = alpha[Math.floor(Math.random() * alpha.length)];
    const generated = `Vmovexa#${num}${randLetter}`;
    setFormData((prev) => ({ ...prev, adminPassword: generated }));
    setErrors((prev) => ({ ...prev, adminPassword: '' }));
    setTouched((prev) => ({ ...prev, adminPassword: true }));
    toast.success('Generated password: ' + generated);
  };

  const handleSelectPlan = (p) => {
    const basePrice = Number(p.monthly_price) || 0;
    setFormData((prev) => ({
      ...prev,
      planId: p.id,
      planName: p.name,
      busesCount: String(p.buses_limit || 25),
      depotsCount: String(p.features?.depots_limit || 2),
      adRevenueShareRate: String(p.ad_revenue_share_rate || 65),
      amount: String(basePrice),
    }));
  };

  const validateStep = (step, currentValues = formData) => {
    const stepErrors = {};
    if (step === 1) {
      stepErrors.name = validateField('name', currentValues.name, currentValues);
      stepErrors.state = validateField('state', currentValues.state, currentValues);
      stepErrors.city = validateField('city', currentValues.city, currentValues);
      if (currentValues.cin) stepErrors.cin = validateField('cin', currentValues.cin, currentValues);
      if (currentValues.gstin) stepErrors.gstin = validateField('gstin', currentValues.gstin, currentValues);
      if (currentValues.pincode) stepErrors.pincode = validateField('pincode', currentValues.pincode, currentValues);
    } else if (step === 2) {
      stepErrors.adminName = validateField('adminName', currentValues.adminName, currentValues);
      stepErrors.adminEmail = validateField('adminEmail', currentValues.adminEmail, currentValues);
      stepErrors.adminPhone = validateField('adminPhone', currentValues.adminPhone, currentValues);
      stepErrors.adminPassword = validateField('adminPassword', currentValues.adminPassword, currentValues);
    } else if (step === 3) {
      if (currentValues.paymentMode === 'offline') {
        stepErrors.bankName = validateField('bankName', currentValues.bankName, currentValues);
        stepErrors.bankRef = validateField('bankRef', currentValues.bankRef, currentValues);
        stepErrors.paymentDate = validateField('paymentDate', currentValues.paymentDate, currentValues);
      }
    }

    const filtered = Object.fromEntries(Object.entries(stepErrors).filter(([, err]) => Boolean(err)));
    return filtered;
  };

  const handleNext = (e) => {
    e.preventDefault();
    let currentData = { ...formData };
    if (currentStep === 2 && !currentData.adminPassword) {
      const num = Math.floor(1000 + Math.random() * 9000);
      const alpha = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
      const randLetter = alpha[Math.floor(Math.random() * alpha.length)];
      const generated = `Vmovexa#${num}${randLetter}`;
      currentData.adminPassword = generated;
      setFormData(currentData);
      setErrors((prev) => ({ ...prev, adminPassword: '' }));
      toast.success('Generated password: ' + generated);
    }

    const stepErrors = validateStep(currentStep, currentData);
    if (Object.keys(stepErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...stepErrors }));
      setTouched((prev) => ({
        ...prev,
        ...Object.keys(stepErrors).reduce((acc, k) => ({ ...acc, [k]: true }), {}),
      }));
      toast.error('Please fix the highlighted errors before proceeding.');
      return;
    }

    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleFinish = async (e) => {
    e.preventDefault();
    if (!formData.acceptContract) return;

    let finalLogoUrl = formData.logoUrl || undefined;

    // Upload custom image if user selected a file
    if (logoFile) {
      const uploadToastId = toast.loading('Uploading company logo...');
      try {
        setUploadingLogo(true);
        const res = await uploadService.uploadFile(logoFile, 'logos');
        if (res?.url) {
          finalLogoUrl = res.url;
          setFormData((prev) => ({ ...prev, logoUrl: res.url }));
        }
        toast.dismiss(uploadToastId);
      } catch (err) {
        toast.dismiss(uploadToastId);
        setUploadingLogo(false);
        toast.error('Failed to upload logo: ' + (err?.message || 'Upload error'));
        return;
      } finally {
        setUploadingLogo(false);
      }
    }

    const payload = {
      name: formData.name ? formData.name.trim() : '',
      logoUrl: finalLogoUrl,
      logo_url: finalLogoUrl,
      state: formData.state || undefined,
      city: formData.city || undefined,
      cin: formData.cin ? formData.cin.trim() : undefined,
      gstin: formData.gstin ? formData.gstin.trim() : undefined,
      officeAddress: formData.officeAddress ? formData.officeAddress.trim() : undefined,
      office_address: formData.officeAddress ? formData.officeAddress.trim() : undefined,
      pincode: formData.pincode ? formData.pincode.trim() : undefined,
      latitude: formData.latitude != null && formData.latitude !== '' ? Number(formData.latitude) : undefined,
      longitude: formData.longitude != null && formData.longitude !== '' ? Number(formData.longitude) : undefined,
      placeId: formData.placeId || undefined,
      place_id: formData.placeId || undefined,
      adminName: formData.adminName ? formData.adminName.trim() : undefined,
      adminEmail: formData.adminEmail ? formData.adminEmail.trim() : undefined,
      adminPhone: formData.adminPhone ? formData.adminPhone.trim() : undefined,
      adminPassword: formData.adminPassword ? formData.adminPassword.trim() : undefined,
      planId: formData.planId != null && formData.planId !== '' ? Number(formData.planId) : undefined,
      paymentMode: formData.paymentMode || 'online',
      busesQuota: formData.busesCount !== '' ? Number(formData.busesCount) : undefined,
      busesCount: formData.busesCount !== '' ? Number(formData.busesCount) : undefined,
      depotsQuota: formData.depotsCount !== '' ? Number(formData.depotsCount) : undefined,
      depotsCount: formData.depotsCount !== '' ? Number(formData.depotsCount) : undefined,
      adRevenueShareRate: formData.adRevenueShareRate !== '' ? Number(formData.adRevenueShareRate) : undefined,
      bankRef: formData.paymentMode === 'offline' ? (formData.bankRef ? formData.bankRef.trim() : undefined) : undefined,
      bankName: formData.paymentMode === 'offline' ? (formData.bankName ? formData.bankName.trim() : undefined) : undefined,
      amount: formData.paymentMode === 'offline' ? (formData.amount !== '' ? Number(formData.amount) : undefined) : undefined,
      paymentDate: formData.paymentMode === 'offline' ? (formData.paymentDate || undefined) : undefined,
      notes: formData.notes ? formData.notes.trim() : undefined,
      created_by_role: isFinance ? 'ROLE-FINANCE-OFFICER' : undefined,
    };

    try {
      const data = await toast.promise(
        createOrganization(payload),
        {
          loading: 'Creating tenant account...',
          success: isFinance ? 'Tenant provisioned & submitted for Super Admin approval!' : 'Tenant added successfully!',
          error: (err) => err?.message || 'Failed to add tenant.',
        }
      );

      setSuccessModalData({
        org: data?.organization || data?.org || {},
        adminUser: data?.adminUser || {},
        credentials: data?.credentials || {
          email: formData.adminEmail,
          temporaryPassword: formData.adminPassword,
        },
        invoice: data?.invoice || null,
        paymentMode: formData.paymentMode,
      });
    } catch (err) {
      console.error('Failed to create organization:', err);
    }
  };

  const displayLogoUrl = logoPreview || (formData.logoUrl ? getMediaUrl(formData.logoUrl) : '');

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Standard Reusable Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'SuperAdmin', to: '/superadmin/dashboard' },
          { label: 'Tenants', to: '/superadmin/tenants' },
          { label: 'Add New Tenant' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Add New Tenant
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Register a new company, set plan details, and assign admin account
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-full self-start sm:self-auto">
          Step {currentStep} of 4
        </span>
      </div>

      {/* 4-Step Stepper Progress Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { step: 1, title: 'Company Info', desc: 'Name, Logo & Address' },
            { step: 2, title: 'Admin Account', desc: 'Admin User & Password' },
            { step: 3, title: 'Plan & Billing', desc: 'Select Plan & Payment' },
            { step: 4, title: 'Review & Save', desc: 'Confirm Details' },
          ].map((s) => (
            <button
              key={s.step}
              type="button"
              onClick={() => setCurrentStep(s.step)}
              className={`p-2.5 rounded-xl text-left transition-all flex items-center gap-3 ${
                currentStep === s.step
                  ? 'bg-slate-900 text-white dark:bg-blue-600 shadow-sm'
                  : currentStep > s.step
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  currentStep === s.step
                    ? 'bg-white text-slate-900 dark:bg-white dark:text-blue-600'
                    : currentStep > s.step
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {currentStep > s.step ? '✓' : s.step}
              </div>
              <div className="min-w-0 truncate">
                <div className="text-xs font-bold truncate leading-tight">{s.title}</div>
                <div className="text-[10px] opacity-80 truncate hidden sm:block">{s.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: COMPANY INFO */}
      {currentStep === 1 && (
        <form onSubmit={handleNext} className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              1. Organization Details
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              Company profile, logo, location, and tax registration numbers
            </p>
          </div>

          {/* Logo Upload & Avatar Picker Section */}
          <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200">Company Logo / Profile Avatar</label>
              <span className="text-[10px] text-slate-400 font-medium">Select custom image or preset avatar</span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Main Avatar Preview */}
              <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 flex items-center justify-center overflow-hidden shrink-0 shadow-sm relative group">
                {displayLogoUrl ? (
                  <img
                    src={displayLogoUrl}
                    alt="Tenant Logo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-inner">
                    {formData.name ? formData.name.charAt(0).toUpperCase() : '🏢'}
                  </div>
                )}
              </div>

              {/* Upload & Action Controls */}
              <div className="space-y-1.5 flex-1 min-w-[200px]">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors inline-flex items-center gap-1.5">
                    <FleetIcons.Plus className="w-3.5 h-3.5" />
                    {displayLogoUrl ? 'Change Image' : 'Select Image'}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>

                  {displayLogoUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg font-medium border border-red-200 dark:border-red-800 transition-colors"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>

                {logoFile ? (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                    <span className="truncate max-w-[200px]" title={logoFile.name}>
                      {logoFile.name}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      ({(logoFile.size / 1024).toFixed(0)} KB) — Ready to upload on submit
                    </span>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400">PNG, JPG, WebP or SVG images allowed (Max 5MB)</p>
                )}
              </div>
            </div>

            {/* Quick Pick Preset Avatars */}
            <div className="pt-3 border-t border-slate-200/70 dark:border-zinc-700/70 space-y-2">
              <div className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                Quick Select Preset Avatar:
              </div>
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((avatar) => {
                  const isSelected = !logoFile && formData.logoUrl === avatar.url;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => handleSelectPresetAvatar(avatar.url)}
                      title={avatar.title}
                      className={`w-9 h-9 rounded-xl border-2 transition-all shrink-0 overflow-hidden flex items-center justify-center ${
                        isSelected
                          ? 'border-blue-600 ring-2 ring-blue-400/50 scale-105 shadow-sm'
                          : 'border-slate-200 dark:border-zinc-700 hover:border-blue-300 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img src={avatar.url} alt={avatar.title} className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Company Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Maharashtra State Road Transport Corp"
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs font-medium text-slate-900 transition-colors focus:outline-none ${
                  errors.name && touched.name
                    ? 'border-red-500 ring-1 ring-red-400 focus:ring-red-300 bg-red-50/20'
                    : 'border-slate-200 focus:ring-2 focus:ring-slate-300'
                }`}
              />
              {errors.name && touched.name && (
                <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <LocationAutocompleteInput
                label="Office Address"
                value={formData.officeAddress}
                coords={{ lat: formData.latitude, lng: formData.longitude }}
                placeholder="Search headquarters, depot, station, or enter address manually..."
                onChange={handleLocationSelect}
              />
              <p className="text-[10px] text-slate-400 mt-1 flex flex-wrap items-center justify-between gap-1">
                <span>Search via Google Maps or enter address manually. Selecting an address auto-fills City, State, and Pincode below.</span>
                {formData.latitude && formData.longitude && (
                  <span className="font-mono text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                    GPS: {Number(formData.latitude).toFixed(4)}, {Number(formData.longitude).toFixed(4)}
                  </span>
                )}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">City *</label>
              <input
                type="text"
                required
                placeholder="e.g. Mumbai"
                value={formData.city}
                onChange={(e) => handleFieldChange('city', e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs font-medium text-slate-900 transition-colors focus:outline-none ${
                  errors.city && touched.city
                    ? 'border-red-500 ring-1 ring-red-400 focus:ring-red-300 bg-red-50/20'
                    : 'border-slate-200 focus:ring-2 focus:ring-slate-300'
                }`}
              />
              {errors.city && touched.city && (
                <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{errors.city}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">State / Union Territory *</label>
              <select
                value={formData.state}
                onChange={(e) => handleFieldChange('state', e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs font-bold text-slate-800 transition-colors focus:outline-none ${
                  errors.state && touched.state
                    ? 'border-red-500 ring-1 ring-red-400 focus:ring-red-300 bg-red-50/20'
                    : 'border-slate-200 focus:ring-2 focus:ring-slate-300'
                }`}
              >
                {INDIAN_STATES_AND_UTS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              {errors.state && touched.state && (
                <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{errors.state}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Pincode (6 Digits)</label>
              <input
                type="text"
                maxLength={6}
                placeholder="e.g. 400001"
                value={formData.pincode}
                onChange={(e) => handlePincodeChange(e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs font-mono font-bold text-slate-900 transition-colors focus:outline-none ${
                  errors.pincode && touched.pincode
                    ? 'border-red-500 ring-1 ring-red-400 focus:ring-red-300 bg-red-50/20'
                    : 'border-slate-200 focus:ring-2 focus:ring-slate-300'
                }`}
              />
              {errors.pincode && touched.pincode ? (
                <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{errors.pincode}</span>
                </p>
              ) : (
                <p className="text-[10px] text-slate-400 mt-1">6-digit postal area code (auto-filled or manual)</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">CIN Number (Optional)</label>
              <input
                type="text"
                maxLength={21}
                placeholder="e.g. U60200MH2021PTC109921 (21 alphanumeric)"
                value={formData.cin}
                onChange={(e) => handleCinChange(e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs font-mono font-bold text-slate-900 uppercase transition-colors focus:outline-none ${
                  errors.cin && touched.cin
                    ? 'border-red-500 ring-1 ring-red-400 focus:ring-red-300 bg-red-50/20'
                    : 'border-slate-200 focus:ring-2 focus:ring-slate-300'
                }`}
              />
              {errors.cin && touched.cin ? (
                <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{errors.cin}</span>
                </p>
              ) : (
                <p className="text-[10px] text-slate-400 mt-1">21 characters (Leave empty if unassigned)</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">GSTIN (15 Digits - Optional)</label>
              <input
                type="text"
                maxLength={15}
                placeholder="e.g. 27AAACM1234F1Z8"
                value={formData.gstin}
                onChange={(e) => handleGstinChange(e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs font-mono font-bold text-slate-900 uppercase transition-colors focus:outline-none ${
                  errors.gstin && touched.gstin
                    ? 'border-red-500 ring-1 ring-red-400 focus:ring-red-300 bg-red-50/20'
                    : 'border-slate-200 focus:ring-2 focus:ring-slate-300'
                }`}
              />
              {errors.gstin && touched.gstin ? (
                <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{errors.gstin}</span>
                </p>
              ) : (
                <p className="text-[10px] text-slate-400 mt-1">15 alphanumeric characters (e.g. 27AAACM1234F1Z8)</p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <span>Next Step: Admin Account</span>
              <span>→</span>
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: ADMIN ACCOUNT */}
      {currentStep === 2 && (
        <form onSubmit={handleNext} className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              2. Admin User Account
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              Create the initial primary admin user who will log in to manage this company
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Admin Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kulkarni"
                value={formData.adminName}
                onChange={(e) => handleFieldChange('adminName', e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs font-medium text-slate-900 transition-colors focus:outline-none ${
                  errors.adminName && touched.adminName
                    ? 'border-red-500 ring-1 ring-red-400 focus:ring-red-300 bg-red-50/20'
                    : 'border-slate-200 focus:ring-2 focus:ring-slate-300'
                }`}
              />
              {errors.adminName && touched.adminName && (
                <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{errors.adminName}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Admin Email (Login ID) *</label>
              <input
                type="email"
                required
                placeholder="e.g. admin@company.com"
                value={formData.adminEmail}
                onChange={(e) => handleFieldChange('adminEmail', e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs font-medium text-slate-900 transition-colors focus:outline-none ${
                  errors.adminEmail && touched.adminEmail
                    ? 'border-red-500 ring-1 ring-red-400 focus:ring-red-300 bg-red-50/20'
                    : 'border-slate-200 focus:ring-2 focus:ring-slate-300'
                }`}
              />
              {errors.adminEmail && touched.adminEmail && (
                <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{errors.adminEmail}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Mobile Phone (10 Digits) *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 select-none">
                  +91
                </span>
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="9820012345"
                  value={formData.adminPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className={`w-full pl-12 pr-3.5 py-2.5 bg-white border rounded-xl text-xs font-medium text-slate-900 transition-colors focus:outline-none ${
                    errors.adminPhone && touched.adminPhone
                      ? 'border-red-500 ring-1 ring-red-400 focus:ring-red-300 bg-red-50/20'
                      : 'border-slate-200 focus:ring-2 focus:ring-slate-300'
                  }`}
                />
              </div>
              {errors.adminPhone && touched.adminPhone ? (
                <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{errors.adminPhone}</span>
                </p>
              ) : (
                <p className="text-[10px] text-slate-400 mt-1">10-digit number starting with 6, 7, 8, or 9</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">Password *</label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline"
                >
                  Generate Strong Password
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Set password"
                  value={formData.adminPassword}
                  onChange={(e) => handleFieldChange('adminPassword', e.target.value)}
                  className={`w-full pl-3.5 pr-14 py-2.5 bg-white border rounded-xl text-xs font-mono font-bold text-slate-900 transition-colors focus:outline-none ${
                    errors.adminPassword && touched.adminPassword
                      ? 'border-red-500 ring-1 ring-red-400 focus:ring-red-300 bg-red-50/20'
                      : 'border-slate-200 focus:ring-2 focus:ring-slate-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 text-xs font-bold px-1.5 py-0.5 rounded"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.adminPassword && touched.adminPassword ? (
                <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{errors.adminPassword}</span>
                </p>
              ) : (
                <p className="text-[10px] text-slate-400 mt-1">Min 8 chars: 1 uppercase (A-Z), 1 number (0-9), 1 special (!@#$)</p>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors text-center w-full sm:w-auto"
            >
              ← Back
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto"
            >
              <span>Next Step: Plan & Payment</span>
              <span>→</span>
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: PLAN & BILLING */}
      {currentStep === 3 && (
        <form onSubmit={handleNext} className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              3. Subscription Plan & Payment Details
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              Select plan tier and payment mode (GST included in plan price)
            </p>
          </div>

          {/* Plan Selection Cards */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Select Plan Tier *</label>
            {loadingPlans ? (
              <div className="p-8 text-center text-xs text-slate-400 font-medium">Loading plans...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((p) => {
                  const isSelected = formData.planId === p.id;
                  const f = p.features || {};
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPlan(p)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2.5 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/30 ring-2 ring-blue-100 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-900">{p.name}</span>
                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                        </span>
                      </div>
                      <div className="text-xl font-black text-slate-900">
                        ₹{Number(p.monthly_price).toLocaleString('en-IN')}{' '}
                        <span className="text-[10px] text-slate-500 font-normal">(GST Included)</span>
                      </div>
                      <div className="text-xs space-y-1 text-slate-600 pt-1 border-t border-slate-100">
                        <p><strong>{p.buses_limit ? `${p.buses_limit} Buses` : 'Unlimited Buses'}</strong> Quota</p>
                        <p>{f.depots_limit || 2} Depots</p>
                        <p>Ad Rev Share: <strong>{p.ad_revenue_share_rate || 65}%</strong></p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quotas & Revenue Share Specs (Locked to chosen plan) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <span>🛡️</span>
                <span>Plan Tier Quota Specifications (Locked to {formData.planName})</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full flex items-center gap-1">
                <span>🔒</span> Locked by Tier
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Buses Quota</span>
                <div className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                  {formData.busesCount ? `${formData.busesCount} Buses` : 'Unlimited'}
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Included fleet capacity</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Depots Limit</span>
                <div className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                  {formData.depotsCount} Depots
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Included terminal capacity</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Ad Rev Share Rate</span>
                <div className="text-sm sm:text-base font-black text-emerald-600 mt-0.5">
                  {formData.adRevenueShareRate}% Share
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Contracted revenue rate</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-medium italic">
              * Quota parameters are automatically bound to the selected plan tier to prevent pricing discrepancies.
            </p>
          </div>

          {/* Payment Mode Selector */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Payment Mode *
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Choose offline bank transfer or online client checkout
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setFormData({ ...formData, paymentMode: 'offline' })}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all space-y-1.5 ${
                  formData.paymentMode === 'offline'
                    ? 'border-emerald-600 bg-white ring-2 ring-emerald-100 shadow-sm'
                    : 'border-slate-200 bg-white/60 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <span>🟢</span>
                    <span>Offline Bank Transfer / Cheque</span>
                  </span>
                  <input
                    type="radio"
                    name="paymentMode"
                    checked={formData.paymentMode === 'offline'}
                    onChange={() => setFormData({ ...formData, paymentMode: 'offline' })}
                    className="accent-emerald-600"
                  />
                </div>
                <p className="text-[11px] text-slate-600">
                  Instant activation with recorded payment & tax invoice.
                </p>
              </div>

              <div
                onClick={() => setFormData({ ...formData, paymentMode: 'online' })}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all space-y-1.5 ${
                  formData.paymentMode === 'online'
                    ? 'border-blue-600 bg-white ring-2 ring-blue-100 shadow-sm'
                    : 'border-slate-200 bg-white/60 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <span>🔵</span>
                    <span>Online Checkout (Pay Later)</span>
                  </span>
                  <input
                    type="radio"
                    name="paymentMode"
                    checked={formData.paymentMode === 'online'}
                    onChange={() => setFormData({ ...formData, paymentMode: 'online' })}
                    className="accent-blue-600"
                  />
                </div>
                <p className="text-[11px] text-slate-600">
                  Client logs in and completes payment online.
                </p>
              </div>
            </div>

            {/* Offline Settlement Fields */}
            {formData.paymentMode === 'offline' && (
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                  <span>🏛️</span>
                  <span>Payment Record Details</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Bank Name *</label>
                    <input
                      type="text"
                      required={formData.paymentMode === 'offline'}
                      placeholder="State Bank of India"
                      value={formData.bankName}
                      onChange={(e) => handleFieldChange('bankName', e.target.value)}
                      className={`w-full px-3 py-2 bg-white border rounded-lg text-xs font-medium text-slate-900 transition-colors focus:outline-none ${
                        errors.bankName && touched.bankName
                          ? 'border-red-500 ring-1 ring-red-400 focus:ring-red-300 bg-red-50/20'
                          : 'border-slate-200 focus:ring-2 focus:ring-slate-300'
                      }`}
                    />
                    {errors.bankName && touched.bankName && (
                      <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                        <span>⚠️</span>
                        <span>{errors.bankName}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Bank Reference / UTR *</label>
                    <input
                      type="text"
                      required={formData.paymentMode === 'offline'}
                      placeholder="e.g. UTR123456789"
                      value={formData.bankRef}
                      onChange={(e) => handleFieldChange('bankRef', e.target.value)}
                      className={`w-full px-3 py-2 bg-white border rounded-lg text-xs font-mono font-bold text-slate-900 transition-colors focus:outline-none ${
                        errors.bankRef && touched.bankRef
                          ? 'border-red-500 ring-1 ring-red-400 focus:ring-red-300 bg-red-50/20'
                          : 'border-slate-200 focus:ring-2 focus:ring-slate-300'
                      }`}
                    />
                    {errors.bankRef && touched.bankRef && (
                      <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                        <span>⚠️</span>
                        <span>{errors.bankRef}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-700">Amount Paid (₹ - GST Included) *</label>
                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                        <span>🔒</span> Fixed from Plan
                      </span>
                    </div>
                    <input
                      type="text"
                      disabled
                      readOnly
                      value={formData.amount ? `₹ ${Number(formData.amount).toLocaleString('en-IN')}` : '₹ 0'}
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-black text-slate-700 cursor-not-allowed focus:outline-none select-none shadow-inner"
                    />
                    <p className="text-[10px] text-slate-500 mt-1 font-medium">
                      Auto-locked to selected {formData.planName} tier rate (amount cannot be edited).
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Payment Date *</label>
                    <input
                      type="date"
                      required={formData.paymentMode === 'offline'}
                      value={formData.paymentDate}
                      onChange={(e) => handleFieldChange('paymentDate', e.target.value)}
                      className={`w-full px-3 py-2 bg-white border rounded-lg text-xs font-medium text-slate-900 transition-colors focus:outline-none ${
                        errors.paymentDate && touched.paymentDate
                          ? 'border-red-500 ring-1 ring-red-400 focus:ring-red-300 bg-red-50/20'
                          : 'border-slate-200 focus:ring-2 focus:ring-slate-300'
                      }`}
                    />
                    {errors.paymentDate && touched.paymentDate && (
                      <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                        <span>⚠️</span>
                        <span>{errors.paymentDate}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors text-center w-full sm:w-auto"
            >
              ← Back
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto"
            >
              <span>Next Step: Review & Confirm</span>
              <span>→</span>
            </button>
          </div>
        </form>
      )}

      {/* STEP 4: REVIEW & CONFIRM */}
      {currentStep === 4 && (
        <form onSubmit={handleFinish} className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              4. Review All Details & Create Tenant
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              Please review all information from Step 1, Step 2, and Step 3 before finalizing account creation
            </p>
          </div>

          {/* Section 1: Company Profile Info */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-sm">🏢</span>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  1. Organization & Identity
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
              >
                <span>✏️</span>
                <span>Edit Info</span>
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Logo / Avatar Preview */}
              <div className="flex items-center gap-3 pb-2 border-b border-slate-200/60">
                <div className="w-11 h-11 rounded-xl border border-slate-200 bg-white overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
                  {displayLogoUrl ? (
                    <img src={displayLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-black text-slate-400 text-base">
                      {formData.name ? formData.name.charAt(0).toUpperCase() : '🏢'}
                    </span>
                  )}
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">
                    {displayLogoUrl ? (logoFile ? 'Custom Logo Upload' : 'Preset Avatar') : 'Default Monogram'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {logoFile
                      ? `${logoFile.name} (${(logoFile.size / 1024).toFixed(0)} KB) — will upload on creation`
                      : displayLogoUrl
                      ? 'Pre-configured company graphic avatar'
                      : 'No custom image attached'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Company Name:</span>
                  <span className="font-bold text-slate-900 text-right">{formData.name || '—'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Location:</span>
                  <span className="font-bold text-slate-900 text-right">{formData.city}, {formData.state}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Pincode:</span>
                  <span className="font-mono font-bold text-slate-900 text-right">{formData.pincode || 'Not provided'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">CIN Number:</span>
                  <span className="font-mono font-bold text-slate-800 text-right">{formData.cin || 'Not provided'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">GSTIN:</span>
                  <span className="font-mono font-bold text-slate-800 text-right">{formData.gstin || 'Not provided'}</span>
                </div>
                {formData.latitude && formData.longitude && (
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">GPS Coordinates:</span>
                    <span className="font-mono font-bold text-blue-700 text-right">
                      {Number(formData.latitude).toFixed(4)}, {Number(formData.longitude).toFixed(4)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between py-1">
                <span className="text-slate-500 shrink-0">Office Address:</span>
                <span className="font-medium text-slate-900 sm:text-right mt-0.5 sm:mt-0">
                  {formData.officeAddress || 'Not provided'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Admin Credentials */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-sm">👤</span>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  2. Primary Administrator Account
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
              >
                <span>✏️</span>
                <span>Edit Admin</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Admin Name:</span>
                <span className="font-bold text-slate-900">{formData.adminName || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Login Email:</span>
                <span className="font-mono font-bold text-blue-700">{formData.adminEmail || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Mobile Phone:</span>
                <span className="font-mono font-bold text-slate-900">+91 {formData.adminPhone || '—'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Temporary Password:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {showReviewPassword ? formData.adminPassword : '••••••••'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowReviewPassword(!showReviewPassword)}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-800"
                  >
                    {showReviewPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Subscription Plan & Billing */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-sm">💳</span>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  3. Subscription Plan & Billing Settlement
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
              >
                <span>✏️</span>
                <span>Edit Plan</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Selected Plan Tier:</span>
                <span className="font-bold text-slate-900">{formData.planName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Plan Rate (GST Included):</span>
                <span className="font-black text-slate-900">
                  ₹ {formData.amount ? Number(formData.amount).toLocaleString('en-IN') : '0'} / month
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Buses Quota:</span>
                <span className="font-bold text-slate-900">{formData.busesCount} Buses Quota</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Depots & Rev Share:</span>
                <span className="font-bold text-slate-900">
                  {formData.depotsCount} Depots | {formData.adRevenueShareRate}% Share
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Payment Mode:</span>
                <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                  formData.paymentMode === 'offline' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {formData.paymentMode === 'offline' ? '🟢 Offline Bank Settlement' : '🔵 Online Client Checkout'}
                </span>
              </div>

              {formData.paymentMode === 'offline' && (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Settlement Bank:</span>
                    <span className="font-bold text-slate-900">{formData.bankName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">UTR / Reference No:</span>
                    <span className="font-mono font-bold text-slate-900">{formData.bankRef || 'Auto-generated'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Amount Paid:</span>
                    <span className="font-mono font-black text-emerald-700">
                      ₹ {formData.amount ? Number(formData.amount).toLocaleString('en-IN') : '0'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Payment Date:</span>
                    <span className="font-medium text-slate-900">{formData.paymentDate}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
            <input
              type="checkbox"
              id="contractAgree"
              checked={formData.acceptContract}
              onChange={(e) => setFormData({ ...formData, acceptContract: e.target.checked })}
              className="w-4 h-4 accent-slate-900 rounded mt-0.5 cursor-pointer"
            />
            <label htmlFor="contractAgree" className="text-xs text-blue-900 leading-snug cursor-pointer font-medium">
              I confirm that all provided tenant details, admin credentials, and subscription payment records are accurate and approved for onboarding.
            </label>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors text-center"
            >
              ← Back to Plan
            </button>
            <button
              type="submit"
              disabled={!formData.acceptContract || uploadingLogo}
              className="px-8 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <FleetIcons.Check className="w-4 h-4" />
              <span>{uploadingLogo ? 'Uploading Logo & Provisioning...' : 'Create Tenant Account'}</span>
            </button>
          </div>
        </form>
      )}

      {/* PROVISIONED SUCCESS MODAL */}
      {successModalData && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#11141d] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-100 dark:border-zinc-800">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 mx-auto flex items-center justify-center text-2xl">
                ✓
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {successModalData.org?.status === 'pending_approval'
                  ? 'Tenant Provisioned for Approval!'
                  : 'Tenant Account Created!'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {successModalData.org?.status === 'pending_approval'
                  ? `${formData.name} has been provisioned and submitted to Super Admin for review & approval.`
                  : `${formData.name} has been successfully added to the platform.`}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-zinc-800">
                <span className="text-slate-500 dark:text-zinc-400">Login URL:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{window.location.origin}/login</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-zinc-800">
                <span className="text-slate-500 dark:text-zinc-400">Admin Email:</span>
                <span className="font-mono font-bold text-blue-700 dark:text-blue-400">{successModalData.credentials?.email}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-zinc-800">
                <span className="text-slate-500 dark:text-zinc-400">Password:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white bg-white dark:bg-zinc-800 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700">
                  {successModalData.credentials?.temporaryPassword}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 dark:text-zinc-400">Tenant Status:</span>
                <span className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                  successModalData.org?.status === 'pending_approval'
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                }`}>
                  {successModalData.org?.status === 'pending_approval'
                    ? 'PENDING SUPER ADMIN APPROVAL'
                    : successModalData.paymentMode === 'offline'
                    ? 'ACTIVE & PAID'
                    : 'APPROVED'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => navigate(basePath)}
                className="flex-1 py-3 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
              >
                Back to Tenants List
              </button>
              <button
                type="button"
                onClick={() => navigate(`${basePath}/${successModalData.org?.id || ''}`)}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-600 hover:from-blue-700 hover:via-indigo-700 hover:to-fuchsia-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-1.5 active:scale-[0.99] cursor-pointer"
              >
                <span>View Tenant Details</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardTenantPage;
