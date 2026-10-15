import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from '../../hooks/useTranslation';
import { QRCodeSVG } from 'qrcode.react';
import { useAdvertiserRole } from '../../hooks/advertiser/useAdvertiserRole';
import { extractYouTubeId, getYouTubeThumbnail } from '../../utils/mediaUtils';
import { uploadFile, uploadVideo, resolveFileUrl } from '../../api/services/upload.service.js';
import { DriverAddressPicker } from '../../components/driver/DriverAddressPicker';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { CampaignSuccessModal } from './CampaignSuccessPage';
import {
  IconEye, IconEdit, IconCheckCircle, IconCreditCard, IconRocket,
  IconPlay, IconPause, IconStop, IconBarChart, IconUser,
  IconVideo, IconDocument, IconImage, IconLink, IconQrCode,
  IconScreen, IconPhone, IconMail, IconLocation, IconCalendar,
  IconClock, IconGlobe, IconDownload, IconShare, IconMessage,
  IconWhatsApp, IconMegaphone, IconBus, IconRupee, IconInfo,
  IconSearch, IconLightning, IconPaperAirplane, IconSave, IconRefresh,
  IconPlus, IconWarning, IconTag, IconBriefcase, IconShoppingBag,
  IconSun, IconMoon, IconFlag, IconChevronDown, IconChevronUp,
  IconLock, IconFolder, IconBox
} from '../../components/ui/CampaignIcons';


// Date utility helpers for smart schedule defaults
export const getFormattedDate = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    }
    return dateStr;
  } catch (_) {
    return dateStr;
  }
};

export const getQrTrackingUrl = (code) => {
  if (!code) return '';
  const envUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').trim();
  let base = '';
  if (envUrl) {
    base = envUrl;
    if (base.includes('localhost') && typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost') {
      base = base.replace('localhost', window.location.hostname);
    }
  } else {
    const hostname = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
    base = `http://${hostname}:4000/api/v1`;
  }
  base = base.replace(/\/$/, '');
  return `${base}/qr/${encodeURIComponent(code)}`;
};

export const CreateCampaignPage = ({ ownerType = 'advertiser' }) => {
  const isGov = ownerType === 'government';
  const portalSegment = isGov ? 'government' : 'advertiser';
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    createCampaign,
    updateCampaign,
    loadCampaignDetails,
    loadCampaigns,
    loadFleetOptions,
    fleetOptions,
    loadSlotAvailability,
    user,
    canCreateCampaign: advCanCreate,
    canEditCampaign: advCanEdit,
    canSubmitCampaign: advCanSubmit,
    can,
  } = useAdvertiserRole();

  // Owner-aware permissions: government uses government.campaigns.* keys.
  const canCreateCampaign = isGov ? (can?.('government.campaigns.create') ?? true) : advCanCreate;
  const canEditCampaign = isGov ? (can?.('government.campaigns.update') ?? true) : advCanEdit;
  const canSubmitCampaign = isGov ? true : advCanSubmit;

  // Slot availability state for the Schedule step.
  const [slotCheck, setSlotCheck] = useState({ loading: false, data: null, error: null });

  const isSuperAdmin = user?.role === 'ROLE-SUPER-ADMIN' || user?.role?.code === 'ROLE-SUPER-ADMIN' || user?.clearance === 'ROOT';
  const basePath = location.pathname.startsWith('/superadmin') ? `/superadmin/${portalSegment}` : `/${portalSegment}`;

  const editId = useMemo(() => new URLSearchParams(location.search).get('edit'), [location.search]);
  const fileInputRef = useRef(null);
  const topRef = useRef(null);

  const [submitting, setSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const isSubmittedRef = useRef(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  const scrollToTop = () => {
    try {
      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      const scrollableParent = topRef.current?.closest('main') || document.querySelector('main');
      if (scrollableParent) {
        scrollableParent.scrollTo({ top: 0, behavior: 'smooth' });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (_) {}
  };

  // Scroll to top of container whenever currentStep changes
  useEffect(() => {
    scrollToTop();
  }, [currentStep]);

  // Permission guard on mount
  useEffect(() => {
    if (!editId && !canCreateCampaign && !isSuperAdmin) {
      toast.error('Access Denied: You do not have permission to create campaigns.');
      navigate(`${basePath}/campaigns`, { replace: true });
    }
    if (editId && !canEditCampaign && !isSuperAdmin) {
      toast.error('Access Denied: You do not have permission to edit campaigns.');
      navigate(`${basePath}/campaigns`, { replace: true });
    }
  }, [editId, canCreateCampaign, canEditCampaign, isSuperAdmin, navigate, basePath]);

  // Multi-creative list state (No immediate upload, stored locally until final submit)
  const [creativeItems, setCreativeItems] = useState([]);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);

  // Step 3 Route-First state: search, city filter, and optional bus expansion
  const [routeSearch, setRouteSearch] = useState('');
  const [routeCityFilter, setRouteCityFilter] = useState('All');
  const [expandedRoute, setExpandedRoute] = useState({});

  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [draftInfo, setDraftInfo] = useState(null);
  const [draftSavedAt, setDraftSavedAt] = useState(null);
  const [successModalData, setSuccessModalData] = useState(null);

  // Dynamic Fleets from MySQL via Redux & Draft Check
  useEffect(() => {
    loadFleetOptions().catch(() => {});
    if (!editId) {
      try {
        const saved = localStorage.getItem('vmovexa_draft_campaign');
        if (saved) {
          const parsed = JSON.parse(saved);
          setHasSavedDraft(true);
          setDraftInfo({
            name: parsed.name || 'Untitled Campaign',
            savedTime: parsed.savedAt ? new Date(parsed.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recently',
            step: parsed.savedStep || 1,
          });
        }
      } catch (_) {}
    }
  }, [loadFleetOptions, editId]);

  // Edit Mode: Pre-populate existing campaign data
  useEffect(() => {
    if (editId) {
      loadCampaignDetails(editId).then((c) => {
        if (c) {
          const mappedTargets = Array.isArray(c.targets) ? c.targets.map(tg => ({
            fleetId: tg.fleet_id || tg.fleetId || null,
            fleetName: tg.fleet_name || tg.fleetName || 'Transit Network',
            organizationId: tg.organization_id || tg.organizationId || null,
            routeId: tg.route_id || tg.routeId || (tg.route ? tg.route.id : null),
            routeName: tg.route?.name || tg.route_name || tg.routeName || `Route #${tg.route_id || tg.routeId}`,
            routeCode: tg.route?.code || tg.route_code || tg.routeCode || '',
            routeKey: `route-${tg.route_id || tg.routeId}`,
            city: tg.city || 'Transit Network',
            vehicleIds: Array.isArray(tg.vehicle_ids)
              ? tg.vehicle_ids
              : (typeof tg.vehicle_ids === 'string'
                  ? (() => { try { const p = JSON.parse(tg.vehicle_ids); return Array.isArray(p) ? p : []; } catch (_) { return []; } })()
                  : (Array.isArray(tg.vehicleIds) ? tg.vehicleIds : [])),
            screensPerVehicle: Number(tg.screens_per_vehicle || tg.screensPerVehicle) || 1,
            totalScreens: Number(tg.screens_count || tg.screensCount) || 0,
            vehicleCount: Number(tg.vehicles_count || tg.vehiclesCount) || (Array.isArray(tg.vehicle_ids) ? tg.vehicle_ids.length : 0),
          })) : [];

          let parsedBreakdown = c.payment_breakdown;
          if (typeof parsedBreakdown === 'string') {
            try {
              parsedBreakdown = JSON.parse(parsedBreakdown);
            } catch (_) {}
          }

          let parsedActiveDays = c.active_days;
          if (typeof parsedActiveDays === 'string') {
            try {
              parsedActiveDays = JSON.parse(parsedActiveDays);
            } catch (_) {}
          }

          const savedBreakdownItems = Array.isArray(parsedBreakdown?.items)
            ? parsedBreakdown.items.filter(it => it.type !== 'base' && it.key !== 'base_amount').map((it, idx) => ({
                id: it.id || `item_${Date.now()}_${idx}`,
                label: it.label || '',
                amount: Math.abs(Number(it.amount) || 0),
                type: it.type || (it.amount < 0 ? 'discount' : 'charge'),
              }))
            : [];

          setFormData(prev => ({
            ...prev,
            name: c.title || c.name || '',
            brandName: c.brand_name || '',
            type: c.campaign_type || c.type || 'Brand Awareness',
            objective: c.objective || 'Increase Brand Awareness',
            category: c.category || 'Retail',
            description: c.description || '',
            clientName: c.client_name || '',
            clientCompany: c.client_company || '',
            clientPhone: c.client_phone || '',
            clientEmail: c.client_email || '',
            clientCity: c.client_city || '',
            clientState: c.client_state || '',
            clientPincode: c.client_pincode || '',
            clientCountry: 'India',
            clientAddress: c.client_address || '',
            clientLatitude: c.client_latitude != null ? Number(c.client_latitude) : null,
            clientLongitude: c.client_longitude != null ? Number(c.client_longitude) : null,
            clientPlaceId: '',
            startDate: c.start_date || getFormattedDate(0),
            endDate: c.end_date || getFormattedDate(13),
            dailySlotStart: c.broadcast_start_time ? String(c.broadcast_start_time).slice(0, 5) : '08:00',
            dailySlotEnd: c.broadcast_end_time ? String(c.broadcast_end_time).slice(0, 5) : '22:00',
            repeat: c.frequency || 'Daily',
            selectedDays: Array.isArray(parsedActiveDays) && parsedActiveDays.length > 0 ? parsedActiveDays : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            budget: c.budget ? String(c.budget) : '',
            baseAmount: parsedBreakdown?.baseAmount ? String(parsedBreakdown.baseAmount) : (c.budget ? String(c.budget) : ''),
            breakdownItems: savedBreakdownItems,
            budgetType: c.budget_type || 'Total Budget',
            promoCode: c.promo_code || '',
            promoApplied: Boolean(c.promo_code),
            qrCode: c.qr_code || (c.qrCodes && c.qrCodes[0]?.code) || `VMX-QR-${c.code || c.id}`,
            qrRedirectUrl: c.qr_redirect_url || (c.qrCodes && c.qrCodes[0]?.redirect_url) || '',
            videoUrl: c.media_url || c.video_url || '',
            targetingMode: c.targeting_mode || 'All Screens',
            timezone: c.timezone || 'GMT +05:30 India Standard Time',
            selectedTargets: mappedTargets,
            selectedRoutes: mappedTargets.map(t => t.routeId).filter(Boolean),
            selectedFleets: [...new Set(mappedTargets.map(t => t.fleetName).filter(Boolean))],
            totalScreens: mappedTargets.reduce((sum, t) => sum + (Number(t.totalScreens) || 0), 0),
            vehicles: mappedTargets.reduce((sum, t) => sum + (Number(t.vehicleCount) || 0), 0),
          }));

          if (Array.isArray(c.media) && c.media.length > 0) {
            setCreativeItems(c.media.map((m, idx) => ({
              id: m.id || `edit_media_${idx}`,
              name: m.file_url ? m.file_url.split('/').pop() : `Asset #${idx + 1}`,
              type: m.media_type === 'video' ? 'Video' : (m.media_type === 'pdf' ? 'PDF' : (m.media_type === 'url' ? 'URL' : 'Image')),
              size: m.file_size ? `${(Number(m.file_size) / (1024 * 1024)).toFixed(1)} MB` : 'Attached',
              resolution: m.resolution || '1920 × 1080',
              duration: `${m.duration_sec || 15} sec`,
              durationSec: m.duration_sec || 15,
              previewUrl: resolveFileUrl(m.file_url) || m.file_url,
              videoUrl: m.file_url,
            })));
          }
        }
      }).catch(() => {});
    }
  }, [editId, loadCampaignDetails]);

  // Available Fleets directly from MySQL via Redux (Zero Dummy Data)
  const availableFleets = useMemo(() => {
    return Array.isArray(fleetOptions) ? fleetOptions : [];
  }, [fleetOptions]);

  // Flatten and normalize all available Transit Routes directly from MySQL fleetOptions
  // Deduplicate strictly by Route ID so each transit corridor is listed once across all fleets
  const allTransitRoutes = useMemo(() => {
    const routeMap = new Map();

    // Dynamic routes from MySQL fleetOptions
    if (Array.isArray(fleetOptions)) {
      fleetOptions.forEach(fleet => {
        if (Array.isArray(fleet.routes) && fleet.routes.length > 0) {
          fleet.routes.forEach(r => {
            const rid = r.id;
            const routeKey = `route-${rid}`;
            const busCount = r.vehicleCount || r.vehicles?.length || 0;
            const displaysPerBus = r.vehicles?.[0]?.displaysCount || (busCount > 0 ? Math.round((r.totalScreens || 0) / busCount) : 0);
            const screensCount = r.totalScreens || (busCount * (displaysPerBus || 1));

            if (!routeMap.has(rid)) {
              routeMap.set(rid, {
                id: r.id,
                routeKey: routeKey,
                code: r.code || `RTE-${r.id}`,
                name: r.name ? (r.name.includes('⇄') || r.name.toLowerCase().includes('corridor') ? r.name : `${r.name} Corridor`) : `Route ${r.id}`,
                startPoint: r.startPoint || r.start_point || 'Station A',
                endPoint: r.endPoint || r.end_point || 'Station B',
                city: r.start_city || r.city || fleet.cities || 'Transit Network',
                fleetId: fleet.id,
                fleetName: fleet.name,
                organizationId: fleet.organization_id || fleet.organizationId || null,
                fleetType: fleet.fleetType || 'Transit',
                vehicleCount: busCount,
                totalScreens: screensCount,
                screensPerVehicle: displaysPerBus,
                vehicles: Array.isArray(r.vehicles) ? [...r.vehicles] : [],
                hasVehicles: busCount > 0,
              });
            } else {
              // Route already seen across another fleet - merge any vehicles and screens
              const existing = routeMap.get(rid);
              const newVehicles = Array.isArray(r.vehicles) ? r.vehicles : [];
              if (newVehicles.length > 0) {
                const existingVehicleIds = new Set(existing.vehicles.map(v => v.id));
                newVehicles.forEach(v => {
                  if (!existingVehicleIds.has(v.id)) {
                    existing.vehicles.push(v);
                    existingVehicleIds.add(v.id);
                  }
                });
                existing.vehicleCount = existing.vehicles.length;
                existing.totalScreens = existing.vehicles.reduce((acc, v) => acc + (v.displaysCount || 1), 0);
                if (existing.screensPerVehicle === 0 && displaysPerBus > 0) {
                  existing.screensPerVehicle = displaysPerBus;
                }
                // If this fleet actually has vehicles assigned, update operator info
                if (!existing.hasVehicles && busCount > 0) {
                  existing.fleetId = fleet.id;
                  existing.fleetName = fleet.name;
                  existing.fleetType = fleet.fleetType || existing.fleetType;
                  existing.hasVehicles = true;
                }
              }
            }
          });
        }
      });
    }

    return Array.from(routeMap.values());
  }, [fleetOptions]);

  // Unique list of cities from transit routes for quick filtering
  const availableRouteCities = useMemo(() => {
    const cities = new Set();
    allTransitRoutes.forEach(r => {
      if (r.city) {
        const primary = r.city.split(/[,/(&]/)[0].trim();
        if (primary) cities.add(primary);
      }
    });
    return ['All', ...Array.from(cities)];
  }, [allTransitRoutes]);

  // Filtered transit routes based on user search and city tab
  const filteredTransitRoutes = useMemo(() => {
    return allTransitRoutes.filter(r => {
      if (routeCityFilter !== 'All') {
        const cityMatch = (r.city && r.city.toLowerCase().includes(routeCityFilter.toLowerCase())) ||
                          (r.name && r.name.toLowerCase().includes(routeCityFilter.toLowerCase()));
        if (!cityMatch) return false;
      }

      if (routeSearch.trim()) {
        const q = routeSearch.toLowerCase();
        const matchesQuery =
          (r.name && r.name.toLowerCase().includes(q)) ||
          (r.code && r.code.toLowerCase().includes(q)) ||
          (r.startPoint && r.startPoint.toLowerCase().includes(q)) ||
          (r.endPoint && r.endPoint.toLowerCase().includes(q)) ||
          (r.city && r.city.toLowerCase().includes(q)) ||
          (r.fleetName && r.fleetName.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [allTransitRoutes, routeCityFilter, routeSearch]);

  // Clean Form State with ZERO hardcoded dummy data
  const [formData, setFormData] = useState({
    name: '',
    brandName: '',
    type: 'Brand Awareness',
    description: '',
    objective: 'Increase Brand Awareness',
    category: 'Retail',
    // Customer / Client Details (External client on whose behalf the campaign is created)
    clientName: '',
    clientCompany: '',
    clientEmail: '',
    clientPhone: '',
    clientCity: '',
    clientState: '',
    clientPincode: '',
    clientCountry: 'India',
    clientAddress: '',
    clientLatitude: null,
    clientLongitude: null,
    clientPlaceId: '',
    // Creative
    creativeType: 'Video',
    fileName: '',
    fileSize: '',
    resolution: '',
    duration: '',
    previewUrl: '',
    videoUrl: '',
    // Fleets & Screens
    selectedFleets: [],
    selectedTargets: [],      // new: [{ fleetId, fleetName, organizationId, routeId, routeName, vehicleIds, screensPerVehicle, totalScreens, vehicleCount }]
    targetingMode: 'All Screens',
    selectedLocations: [],
    selectedRoutes: [],
    selectedDisplayTypes: ['Main Passenger Saloon Display'],
    customScreenCap: '',
    totalScreens: 0,
    vehicles: 0,
    cities: 0,
    // Schedule (Default 14-day standard campaign window)
    startDate: getFormattedDate(0),
    startTime: '08:00',
    endDate: getFormattedDate(13),
    endTime: '22:00',
    repeat: 'Daily',
    selectedDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    dailySlotStart: '08:00',
    dailySlotEnd: '22:00',
    timezone: 'GMT +05:30 India Standard Time',
    // Budget & Dynamic Payment Breakdown (Default 0, no static discounts)
    budgetType: 'Total Budget',
    budget: 0,
    baseAmount: 0,
    breakdownItems: [],
    paymentMethod: 'UPI / Wallet',
    promoCode: '',
    promoApplied: false,
    // QR Identity
    qrCode: `VMX-QR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    qrPlacement: 'Rear Screen',
    qrRedirectUrl: '',
  });

  const handleUrlChange = (url) => {
    const trimmed = url.trim();
    const detectedYtId = extractYouTubeId(trimmed);
    const thumb = detectedYtId ? getYouTubeThumbnail(detectedYtId) : (trimmed ? trimmed : '');

    setFormData(prev => ({
      ...prev,
      videoUrl: url,
      fileName: detectedYtId ? `YouTube Video (${detectedYtId})` : (trimmed ? 'Online Video Stream' : ''),
      resolution: trimmed ? '1080p Stream' : '',
      fileSize: trimmed ? 'Cloud Stream' : '',
      duration: trimmed ? 'Adaptive' : '',
      previewUrl: thumb,
    }));
  };

  const handleFilesSelect = (e) => {
    const rawFiles = Array.from(e.target.files || []);
    if (!rawFiles.length) return;

    const newItems = rawFiles.map((file) => {
      const isVideo = file.type.startsWith('video');
      const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
      const detectedType = isVideo ? 'Video' : isPdf ? 'PDF' : 'Image';
      const objectUrl = URL.createObjectURL(file);
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);

      return {
        id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        file, // Local File reference, NOT uploaded immediately!
        name: file.name,
        type: detectedType,
        size: `${sizeInMb} MB`,
        previewUrl: objectUrl,
        resolution: isPdf ? 'Vector Document (PDF)' : (isVideo ? 'HD Video' : 'High-Res Display'),
        duration: isPdf ? 'Static Display' : (isVideo ? '15 sec' : 'Static Image'),
        durationSec: isVideo ? 15 : 10,
      };
    });

    // Detect resolutions and durations asynchronously
    newItems.forEach((item) => {
      if (item.type === 'Video') {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = item.previewUrl;
        video.onloadedmetadata = () => {
          const width = video.videoWidth;
          const height = video.videoHeight;
          const dur = Math.round(video.duration) || 15;
          setCreativeItems(prev => prev.map(it => it.id === item.id ? {
            ...it,
            resolution: width && height ? `${width} × ${height}` : 'HD Video',
            duration: `${dur} sec`,
            durationSec: dur,
          } : it));
        };
      } else if (item.type === 'Image') {
        const img = new Image();
        img.src = item.previewUrl;
        img.onload = () => {
          const width = img.naturalWidth;
          const height = img.naturalHeight;
          setCreativeItems(prev => prev.map(it => it.id === item.id ? {
            ...it,
            resolution: width && height ? `${width} × ${height}` : 'High-Res Display',
          } : it));
        };
      }
    });

    setCreativeItems(prev => {
      const updated = [...prev, ...newItems];
      const primary = updated[0];
      if (primary) {
        setFormData(f => ({
          ...f,
          creativeType: primary.type,
          fileName: primary.name,
          fileSize: primary.size,
          previewUrl: primary.previewUrl,
          resolution: primary.resolution,
          duration: primary.duration,
        }));
      }
      return updated;
    });

    toast.success(`${newItems.length} creative file(s) attached! Preview is ready.`);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddVideoUrl = () => {
    const trimmed = formData.videoUrl.trim();
    if (!trimmed) {
      toast.error('Please enter a YouTube or streaming video URL');
      return;
    }
    const detectedId = extractYouTubeId(trimmed);
    const thumb = detectedId ? getYouTubeThumbnail(detectedId) : '';
    const item = {
      id: `media_url_${Date.now()}`,
      file: null, // Streaming link, no file upload
      name: detectedId ? `YouTube Video (${detectedId})` : 'Online Video Stream',
      type: 'URL',
      size: 'Cloud Stream',
      previewUrl: thumb || trimmed,
      videoUrl: trimmed,
      resolution: '1080p Stream',
      duration: 'Adaptive',
      durationSec: 15,
    };

    setCreativeItems(prev => {
      const updated = [...prev, item];
      setFormData(f => ({
        ...f,
        creativeType: 'URL',
        fileName: item.name,
        fileSize: item.size,
        previewUrl: item.previewUrl,
        resolution: item.resolution,
        duration: item.duration,
      }));
      return updated;
    });

    toast.success('Online video URL added to creative assets!');
  };

  // Per-creative display duration (seconds on screen). Digits-only, clamped to 1..300.
  const handleCreativeDurationChange = (id, raw) => {
    const digits = String(raw || '').replace(/\D/g, '');
    const val = digits === '' ? '' : Math.max(1, Math.min(300, parseInt(digits, 10) || 1));
    setCreativeItems(prev => prev.map(it => it.id === id ? { ...it, displayDurationSec: val } : it));
  };

  const handleRemoveCreativeItem = (id) => {
    setCreativeItems(prev => {
      const remaining = prev.filter(it => it.id !== id);
      if (remaining.length === 0) {
        setFormData(f => ({
          ...f,
          fileName: '',
          fileSize: '',
          previewUrl: '',
          resolution: '',
          duration: '',
        }));
        setSelectedPreviewIndex(0);
      } else {
        const primary = remaining[0];
        setFormData(f => ({
          ...f,
          creativeType: primary.type,
          fileName: primary.name,
          fileSize: primary.size,
          previewUrl: primary.previewUrl,
          resolution: primary.resolution,
          duration: primary.duration,
        }));
        setSelectedPreviewIndex(idx => Math.min(idx, remaining.length - 1));
      }
      return remaining;
    });
  };

  const handleSelectPreviewItem = (index) => {
    setSelectedPreviewIndex(index);
    const item = creativeItems[index];
    if (item) {
      setFormData(f => ({
        ...f,
        creativeType: item.type,
        fileName: item.name,
        fileSize: item.size,
        previewUrl: item.previewUrl,
        resolution: item.resolution,
        duration: item.duration,
        videoUrl: item.type === 'URL' ? (item.videoUrl || item.previewUrl) : f.videoUrl,
      }));
    }
  };

  const handleRemoveMedia = () => {
    setCreativeItems([]);
    setFormData(prev => ({
      ...prev,
      fileName: '',
      fileSize: '',
      previewUrl: '',
      resolution: '',
      duration: '',
      videoUrl: '',
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClientAddressChange = (addressPayload) => {
    setFormData(prev => ({
      ...prev,
      clientAddress: addressPayload.address != null ? addressPayload.address : prev.clientAddress,
      clientCity: addressPayload.city != null ? addressPayload.city : prev.clientCity,
      clientState: addressPayload.state != null ? addressPayload.state : prev.clientState,
      clientPincode: addressPayload.pincode != null ? addressPayload.pincode : prev.clientPincode,
      clientCountry: addressPayload.country != null ? addressPayload.country : prev.clientCountry,
      clientPlaceId: addressPayload.placeId != null ? addressPayload.placeId : prev.clientPlaceId,
      clientLatitude: addressPayload.latitude != null ? addressPayload.latitude : prev.clientLatitude,
      clientLongitude: addressPayload.longitude != null ? addressPayload.longitude : prev.clientLongitude,
    }));
  };

  const ALL_DAYS_LIST = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const WEEKDAYS_LIST = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const WEEKENDS_LIST = ['Sat', 'Sun'];

  const toggleDay = (day) => {
    setFormData(prev => {
      const exists = prev.selectedDays.includes(day);
      const nextDays = exists
        ? prev.selectedDays.filter(d => d !== day)
        : [...prev.selectedDays, day];
      let nextRepeat = 'Custom';
      if (nextDays.length === 7) nextRepeat = 'Daily';
      else if (nextDays.length === 5 && WEEKDAYS_LIST.every(d => nextDays.includes(d))) nextRepeat = 'Weekdays';
      else if (nextDays.length === 2 && WEEKENDS_LIST.every(d => nextDays.includes(d))) nextRepeat = 'Weekends';
      return {
        ...prev,
        selectedDays: nextDays,
        repeat: nextRepeat,
      };
    });
  };

  const handleStartDateChange = (val) => {
    setFormData(prev => {
      const updates = { ...prev, startDate: val };
      if (prev.endDate && prev.endDate < val) {
        const parts = val.split('-');
        const s = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        s.setDate(s.getDate() + 13);
        const year = s.getFullYear();
        const month = String(s.getMonth() + 1).padStart(2, '0');
        const day = String(s.getDate()).padStart(2, '0');
        updates.endDate = `${year}-${month}-${day}`;
      }
      return updates;
    });
  };

  const handleEndDateChange = (val) => {
    setFormData(prev => ({ ...prev, endDate: val }));
  };

  const handleDurationPreset = (days) => {
    const baseStr = formData.startDate || getFormattedDate(0);
    const parts = baseStr.split('-');
    const baseDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    baseDate.setDate(baseDate.getDate() + (days - 1));
    const year = baseDate.getFullYear();
    const month = String(baseDate.getMonth() + 1).padStart(2, '0');
    const day = String(baseDate.getDate()).padStart(2, '0');
    setFormData(prev => ({
      ...prev,
      startDate: baseStr,
      endDate: `${year}-${month}-${day}`
    }));
  };

  const handleRepeatPreset = (repeatType) => {
    if (repeatType === 'Daily') {
      setFormData(prev => ({ ...prev, repeat: 'Daily', selectedDays: ALL_DAYS_LIST }));
    } else if (repeatType === 'Weekdays') {
      setFormData(prev => ({ ...prev, repeat: 'Weekdays', selectedDays: WEEKDAYS_LIST }));
    } else if (repeatType === 'Weekends') {
      setFormData(prev => ({ ...prev, repeat: 'Weekends', selectedDays: WEEKENDS_LIST }));
    } else if (repeatType === 'Custom') {
      setFormData(prev => ({ ...prev, repeat: 'Custom' }));
    } else if (repeatType === 'One Time') {
      setFormData(prev => ({ ...prev, repeat: 'One Time', selectedDays: ALL_DAYS_LIST }));
    }
  };

  const handleTimeSlotPreset = (start, end) => {
    setFormData(prev => ({
      ...prev,
      dailySlotStart: start,
      dailySlotEnd: end,
    }));
  };

  // ---- Step 3 Route-First multi-route selection helpers ----
  // selectedTargets: [{ fleetId, fleetName, organizationId, routeId, routeName, routeCode, routeKey, city, vehicleIds, screensPerVehicle, totalScreens, vehicleCount }]

  const toggleRouteSelection = useCallback((route) => {
    setFormData(prev => {
      const targets = [...(prev.selectedTargets || [])];
      const routeKey = route.routeKey || `route-${route.id}`;
      const routeId = route.id;
      const routeCode = route.code;
      const existingIdx = targets.findIndex(t =>
        (t.routeKey && t.routeKey === routeKey) ||
        (routeId != null && t.routeId != null && String(t.routeId) === String(routeId)) ||
        (routeCode && t.routeCode && String(t.routeCode).toLowerCase() === String(routeCode).toLowerCase())
      );
      if (existingIdx >= 0) {
        targets.splice(existingIdx, 1);
      } else {
        targets.push({
          fleetId: route.fleetId,
          fleetName: route.fleetName || 'Transit Network',
          organizationId: route.organizationId || null,
          routeId: route.id,
          routeName: route.name,
          routeCode: route.code,
          routeKey: routeKey,
          city: route.city,
          vehicleIds: route.vehicles?.map(v => v.id) || [],
          screensPerVehicle: route.screensPerVehicle || 0,
          totalScreens: route.totalScreens || 0,
          vehicleCount: route.vehicleCount || 0,
        });
      }
      const totalScreens = targets.reduce((s, t) => s + (t.totalScreens || 0), 0);
      const vehicles = targets.reduce((s, t) => s + (t.vehicleCount || 0), 0);
      const selectedFleets = Array.from(new Set(targets.map(t => t.fleetName).filter(Boolean)));
      return { ...prev, selectedTargets: targets, totalScreens, vehicles, selectedFleets };
    });
  }, []);

  const toggleVehicleInRoute = useCallback((route, vehicleId) => {
    setFormData(prev => {
      const targets = [...(prev.selectedTargets || [])];
      const routeKey = route.routeKey || `route-${route.id}`;
      const routeId = route.id;
      const routeCode = route.code;
      const existingIdx = targets.findIndex(t =>
        (t.routeKey && t.routeKey === routeKey) ||
        (routeId != null && t.routeId != null && String(t.routeId) === String(routeId)) ||
        (routeCode && t.routeCode && String(t.routeCode).toLowerCase() === String(routeCode).toLowerCase())
      );
      if (existingIdx < 0) return prev;
      const t = { ...targets[existingIdx] };
      const ids = [...(t.vehicleIds || [])];
      const vidx = ids.findIndex(vid => String(vid) === String(vehicleId));
      if (vidx >= 0) ids.splice(vidx, 1); else ids.push(vehicleId);
      t.vehicleIds = ids;
      t.vehicleCount = ids.length;
      t.totalScreens = ids.length * (t.screensPerVehicle || 2);
      targets[existingIdx] = t;
      const totalScreens = targets.reduce((s, tt) => s + (tt.totalScreens || 0), 0);
      const vehicles = targets.reduce((s, tt) => s + (tt.vehicleCount || 0), 0);
      return { ...prev, selectedTargets: targets, totalScreens, vehicles };
    });
  }, []);

  const isRouteSelected = useCallback((route) => {
    if (!route) return false;
    const routeKey = typeof route === 'object' ? (route.routeKey || `route-${route.id}`) : route;
    const routeId = typeof route === 'object' ? route.id : null;
    const routeCode = typeof route === 'object' ? route.code : null;
    const routeName = typeof route === 'object' ? route.name : null;
    return (formData.selectedTargets || []).some(t => {
      if (t.routeKey && t.routeKey === routeKey) return true;
      if (routeId != null && t.routeId != null && String(t.routeId) === String(routeId)) return true;
      if (routeCode && t.routeCode && String(t.routeCode).toLowerCase() === String(routeCode).toLowerCase()) return true;
      if (routeName && t.routeName && String(t.routeName).trim().toLowerCase() === String(routeName).trim().toLowerCase()) return true;
      return false;
    });
  }, [formData.selectedTargets]);

  const isVehicleSelected = useCallback((route, vehicleId) => {
    if (!route) return false;
    const routeKey = typeof route === 'object' ? (route.routeKey || `route-${route.id}`) : route;
    const routeId = typeof route === 'object' ? route.id : null;
    const routeCode = typeof route === 'object' ? route.code : null;
    const t = (formData.selectedTargets || []).find(t =>
      (t.routeKey && t.routeKey === routeKey) ||
      (routeId != null && t.routeId != null && String(t.routeId) === String(routeId)) ||
      (routeCode && t.routeCode && String(t.routeCode).toLowerCase() === String(routeCode).toLowerCase())
    );
    return t ? (t.vehicleIds || []).some(vid => String(vid) === String(vehicleId)) : false;
  }, [formData.selectedTargets]);

  const handleSelectAllRoutes = useCallback(() => {
    const targets = filteredTransitRoutes.map(r => ({
      fleetId: r.fleetId,
      fleetName: r.fleetName || 'Transit Network',
      organizationId: r.organizationId || null,
      routeId: r.id,
      routeName: r.name,
      routeCode: r.code,
      routeKey: r.routeKey || `route-${r.id}`,
      city: r.city,
      vehicleIds: r.vehicles?.map(v => v.id) || [],
      screensPerVehicle: r.screensPerVehicle || 2,
      totalScreens: r.totalScreens || (r.vehicleCount * (r.screensPerVehicle || 2)),
      vehicleCount: r.vehicleCount || r.vehicles?.length || 1,
    }));
    const totalScreens = targets.reduce((s, t) => s + (t.totalScreens || 0), 0);
    const vehicles = targets.reduce((s, t) => s + (t.vehicleCount || 0), 0);
    const selectedFleets = Array.from(new Set(targets.map(t => t.fleetName).filter(Boolean)));
    setFormData(prev => ({ ...prev, selectedTargets: targets, totalScreens, vehicles, selectedFleets }));
  }, [filteredTransitRoutes]);

  const handleClearAllRoutes = useCallback(() => {
    setFormData(prev => ({ ...prev, selectedTargets: [], selectedFleets: [], totalScreens: 0, vehicles: 0 }));
  }, []);

  // Legacy fleet toggle for backward compat (kept for 'All Screens' targeting summary)
  const toggleFleet = (fleetName) => {
    setFormData(prev => {
      const exists = prev.selectedFleets.includes(fleetName);
      const updatedFleets = exists
        ? prev.selectedFleets.filter(f => f !== fleetName)
        : [...prev.selectedFleets, fleetName];
      const selectedObjs = availableFleets.filter(f => updatedFleets.includes(f.name));
      const totalScreens = selectedObjs.reduce((acc, f) => acc + (f.screens || 0), 0);
      const vehicles = selectedObjs.reduce((acc, f) => acc + (f.vehicles || 0), 0);
      return { ...prev, selectedFleets: updatedFleets, totalScreens, vehicles };
    });
  };

  const handleSelectAllFleets = () => {
    const allNames = filteredFleets.map(f => f.name);
    const selectedObjs = availableFleets.filter(f => allNames.includes(f.name));
    const totalScreens = selectedObjs.reduce((acc, f) => acc + (f.screens || 0), 0);
    const vehicles = selectedObjs.reduce((acc, f) => acc + (f.vehicles || 0), 0);
    setFormData(prev => ({ ...prev, selectedFleets: allNames, totalScreens, vehicles }));
  };

  const handleClearAllFleets = () => {
    setFormData(prev => ({ ...prev, selectedFleets: [], selectedTargets: [], totalScreens: 0, vehicles: 0 }));
  };

  const toggleLocation = (loc) => {
    setFormData(prev => ({
      ...prev,
      selectedLocations: prev.selectedLocations.includes(loc)
        ? prev.selectedLocations.filter(l => l !== loc)
        : [...prev.selectedLocations, loc]
    }));
  };

  const toggleRoute = (routeId) => {
    setFormData(prev => ({
      ...prev,
      selectedRoutes: prev.selectedRoutes.includes(routeId)
        ? prev.selectedRoutes.filter(r => r !== routeId)
        : [...prev.selectedRoutes, routeId]
    }));
  };

  const toggleDisplayType = (dt) => {
    setFormData(prev => {
      const exists = prev.selectedDisplayTypes.includes(dt);
      const updated = exists
        ? prev.selectedDisplayTypes.filter(d => d !== dt)
        : [...prev.selectedDisplayTypes, dt];
      return {
        ...prev,
        selectedDisplayTypes: updated.length > 0 ? updated : [dt]
      };
    });
  };

  const handleSaveDraft = () => {
    if (submitting || isSubmittingRef.current || isSubmittedRef.current) return;
    try {
      const draftPayload = {
        ...formData,
        savedStep: currentStep,
        creativeMeta: creativeItems.map(c => ({
          name: c.name,
          type: c.type,
          size: c.size,
          resolution: c.resolution,
          duration: c.duration,
          videoUrl: c.videoUrl || '',
        })),
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem('vmovexa_draft_campaign', JSON.stringify(draftPayload));
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setHasSavedDraft(true);
      setDraftSavedAt(nowStr);
      setDraftInfo({
        name: formData.name || 'Untitled Campaign',
        savedTime: nowStr,
        step: currentStep,
      });
      toast.success(`Campaign draft saved! (Step ${currentStep} of ${totalSteps})`);
    } catch (_) {
      toast.error('Failed to save draft');
    }
  };

  const handleRestoreDraft = () => {
    if (submitting || isSubmittingRef.current || isSubmittedRef.current) return;
    try {
      const raw = localStorage.getItem('vmovexa_draft_campaign');
      if (!raw) {
        toast.error('No saved draft found');
        return;
      }
      const parsed = JSON.parse(raw);
      setFormData(prev => ({ ...prev, ...parsed }));

      if (parsed.savedStep && parsed.savedStep >= 1 && parsed.savedStep <= totalSteps) {
        setCurrentStep(parsed.savedStep);
      }

      if (Array.isArray(parsed.creativeMeta) && parsed.creativeMeta.length > 0) {
        setCreativeItems(parsed.creativeMeta.map(c => ({
          id: `restored_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: c.name,
          type: c.type,
          size: c.size,
          resolution: c.resolution,
          duration: c.duration,
          previewUrl: c.videoUrl || '',
          videoUrl: c.videoUrl || '',
        })));
      }

      toast.success(`Restored draft: "${parsed.name || 'Campaign'}" (Jumped to Step ${parsed.savedStep || 1})`);
    } catch (_) {
      toast.error('Failed to restore draft');
    }
  };

  const handleDiscardDraft = () => {
    if (submitting || isSubmittingRef.current || isSubmittedRef.current) return;
    try {
      localStorage.removeItem('vmovexa_draft_campaign');
      setHasSavedDraft(false);
      setDraftInfo(null);
      setDraftSavedAt(null);
      toast.success('Saved draft discarded');
    } catch (_) {
      toast.error('Failed to clear draft');
    }
  };

  const handleCloseWizard = () => {
    if (submitting || isSubmittingRef.current || isSubmittedRef.current) return;
    const hasData = Boolean(
      formData.name.trim() ||
      formData.brandName.trim() ||
      formData.clientName.trim() ||
      (formData.selectedTargets && formData.selectedTargets.length > 0)
    );

    if (hasData) {
      try {
        localStorage.setItem('vmovexa_draft_campaign', JSON.stringify({
          ...formData,
          savedStep: currentStep,
          creativeMeta: creativeItems.map(c => ({
            name: c.name,
            type: c.type,
            size: c.size,
            resolution: c.resolution,
            duration: c.duration,
            videoUrl: c.videoUrl || '',
          })),
          savedAt: new Date().toISOString(),
        }));
        toast.success('Campaign draft saved before closing');
      } catch (_) {}
    }
    navigate(`${basePath}/campaigns`);
  };

  const handleDownloadSvg = () => {
    const svg = document.getElementById('campaign-qr-code-svg');
    if (!svg) {
      toast.error('QR code element not found');
      return;
    }
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.name ? formData.name.replace(/[^a-z0-9]/gi, '_') : 'campaign'}_QR.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded dynamic QR Code vector asset');
  };

  const handleShareQr = async () => {
    const destination = getQrTrackingUrl(formData.qrCode);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(destination);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = destination;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      toast.success(`QR URL copied to clipboard: ${destination}`);

      // Native mobile share if supported
      if (navigator.share && /mobile|android|iphone/i.test(navigator.userAgent)) {
        navigator.share({
          title: `${formData.name || 'Transit Campaign'} QR Code`,
          text: `Scan or visit campaign destination: ${destination}`,
          url: destination,
        }).catch(() => {});
      }
    } catch (_) {
      toast.error('Failed to copy QR URL to clipboard');
    }
  };

  const stepLabels = [
    'Information',
    'Creative',
    'Routes & Screens',
    'Schedule',
    'Budget & QR',
    'Review & Submit'
  ];

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        toast.error('Please enter a Campaign Name');
        return;
      }
      if (!formData.brandName.trim()) {
        toast.error('Please enter a Brand / Product Name');
        return;
      }
      if (!formData.clientName.trim()) {
        toast.error('Please enter Customer / Client Contact Name');
        return;
      }
      if (!formData.clientPhone.trim()) {
        toast.error('Please enter Customer Mobile Number (required for SMS payment link)');
        return;
      }
      if (!formData.clientEmail.trim()) {
        toast.error('Please enter Customer Email Address (required for invoice & payment link)');
        return;
      }
    }

    if (currentStep === 2) {
      const hasCreativeList = creativeItems.length > 0;
      const hasSingle = Boolean(formData.previewUrl || formData.fileName || formData.videoUrl.trim());
      if (!hasCreativeList && !hasSingle) {
        toast.error('Please attach at least one creative file (Image, Video, PDF) or enter a Video URL');
        return;
      }
    }

    if (currentStep === 3) {
      const targets = formData.selectedTargets || [];
      const hasRoutes = targets.length > 0;
      const hasLegacyFleets = formData.selectedFleets.length > 0;
      if (!hasRoutes && !hasLegacyFleets) {
        toast.error('Please select at least one transit route for your campaign');
        return;
      }
    }

    if (currentStep === 4) {
      if (!formData.startDate) {
        toast.error('Please choose a Start Date');
        return;
      }
      if (!formData.endDate) {
        toast.error('Please choose an End Date');
        return;
      }
      if (formData.endDate < formData.startDate) {
        toast.error('End Date cannot be before Start Date');
        return;
      }
      if (!formData.selectedDays || formData.selectedDays.length === 0) {
        toast.error('Please select at least one active broadcast day of the week');
        return;
      }
      if (formData.dailySlotStart && formData.dailySlotEnd && formData.dailySlotStart >= formData.dailySlotEnd) {
        toast.error('Daily Broadcast End Time must be later than Start Time');
        return;
      }
      if (slotCheck.data?.conflict) {
        toast.error('The selected route slot is already booked for this time window. Please pick a different time or route before proceeding.');
        return;
      }
    }

    if (currentStep === 5) {
      const effectiveBase = formData.baseAmount !== '' && formData.baseAmount !== undefined
        ? Number(formData.baseAmount)
        : (Number(formData.budget) || 0);
      const effectiveTotal = breakdownCalc.finalTotal;
      if (effectiveBase <= 0 && effectiveTotal <= 0) {
        toast.error('Please enter a valid Campaign Budget (greater than ₹0)');
        return;
      }
      if (!formData.budget && effectiveBase > 0) {
        setFormData(prev => ({ ...prev, budget: effectiveBase, baseAmount: effectiveBase }));
      }
    }

    if (submitting || isSubmittingRef.current || isSubmittedRef.current) return;

    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      scrollToTop();
    } else {
      handleSubmitCampaign();
    }
  };

  const handleBack = () => {
    if (submitting || isSubmittingRef.current || isSubmittedRef.current) return;
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      scrollToTop();
    } else {
      navigate(`${basePath}/campaigns`);
    }
  };

  const handleSubmitCampaign = async () => {
    if (submitting || isSubmittingRef.current || isSubmittedRef.current) {
      return;
    }
    if (!canSubmitCampaign && !isSuperAdmin) {
      toast.error('Permission denied: campaigns.submit is required to submit campaigns.');
      return;
    }
    if (!formData.name.trim()) {
      toast.error('Please enter a Campaign Name');
      return;
    }
    // Government PSA campaigns have no external brand/customer; only commercial ads require these.
    if (!isGov) {
      if (!formData.brandName.trim()) {
        toast.error('Please enter Brand Name');
        return;
      }
      if (!formData.clientName.trim()) {
        toast.error('Please enter Customer / Client Contact Name');
        return;
      }
      if (!formData.clientPhone.trim()) {
        toast.error('Please enter Customer Mobile Number');
        return;
      }
      if (!formData.clientEmail.trim()) {
        toast.error('Please enter Customer Email Address');
        return;
      }
    }
    const hasTargets = (formData.selectedTargets && formData.selectedTargets.length > 0);
    const hasFleets = (formData.selectedFleets && formData.selectedFleets.length > 0);
    if (!hasTargets && !hasFleets) {
      toast.error('Please select at least one route or fleet operator');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      toast.error('Please specify valid campaign schedule dates');
      return;
    }
    // Government PSA campaigns are publicly funded (no paid budget required).
    const effectiveBudget = breakdownCalc.finalTotal || Number(formData.baseAmount) || Number(formData.budget) || 0;
    if (!isGov && effectiveBudget <= 0) {
      toast.error('Please enter a valid Campaign Budget (greater than ₹0)');
      return;
    }

    isSubmittingRef.current = true;
    setSubmitting(true);

    try {
      // 1. Upload creative files at final submit time only (as requested by user)
      let uploadedMediaList = [];

      if (creativeItems.length > 0) {
        const uploadToastId = toast.loading(`Uploading creative assets (0/${creativeItems.length})...`);
        for (let i = 0; i < creativeItems.length; i++) {
          const item = creativeItems[i];
          if (item.file) {
            toast.loading(`Uploading asset (${i + 1}/${creativeItems.length}): ${item.name}...`, { id: uploadToastId });
            let uploadRes;
            if (item.type === 'Video') {
              uploadRes = await uploadVideo(item.file);
            } else {
              uploadRes = await uploadFile(item.file, 'campaigns');
            }
            const relativeUrl = uploadRes?.url || uploadRes?.data?.url;
            const fullUrl = resolveFileUrl(relativeUrl);

            uploadedMediaList.push({
              file_url: fullUrl || relativeUrl,
              media_type: item.type === 'Video' ? 'video' : (item.type === 'PDF' ? 'pdf' : 'image'),
              resolution: item.resolution || '1920 × 1080',
              duration_sec: item.durationSec || 15,
              file_size: item.size || null,
              checksum: uploadRes?.checksum || null,
              sequence_order: i + 1,
              display_duration_sec: item.displayDurationSec || item.durationSec || 15,
              is_enabled: true,
            });
          } else if (item.type === 'URL' || item.videoUrl) {
            uploadedMediaList.push({
              file_url: item.videoUrl || item.previewUrl,
              media_type: 'url',
              resolution: '1080p Stream',
              duration_sec: 15,
              file_size: 'Cloud Stream',
            });
          } else if (item.previewUrl) {
            uploadedMediaList.push({
              file_url: item.previewUrl,
              media_type: item.type?.toLowerCase() || 'image',
              resolution: item.resolution || '1920 × 1080',
              duration_sec: item.durationSec || 15,
              file_size: item.size || null,
            });
          }
        }
        toast.dismiss(uploadToastId);
      } else if (formData.videoUrl && formData.videoUrl.trim()) {
        uploadedMediaList.push({
          file_url: formData.videoUrl.trim(),
          media_type: 'url',
          resolution: '1080p Stream',
          duration_sec: 15,
          file_size: 'Cloud Stream',
        });
      }

      const primaryMedia = uploadedMediaList[0];
      const isUrlType = (primaryMedia?.media_type === 'url') || (formData.creativeType === 'URL');
      const mediaUrlVal = primaryMedia?.file_url || (isUrlType ? formData.videoUrl.trim() : (formData.mediaServerUrl || formData.previewUrl || undefined));
      const mediaTypeVal = primaryMedia?.media_type || (isUrlType ? 'url' : (formData.creativeType.toLowerCase() === 'video' ? 'video' : (formData.creativeType.toLowerCase() === 'pdf' ? 'pdf' : 'image')));

      const finalBudgetAmt = breakdownCalc.finalTotal || Number(formData.baseAmount) || Number(formData.budget) || 0;
      const dailyBudgetNum = formData.budgetType === 'Daily Budget'
        ? finalBudgetAmt
        : Math.max(1, Math.round(finalBudgetAmt / 20));

      // Build targets: prefer new selectedTargets (Route+Vehicle level), fallback to selectedFleets
      let targets = [];
      const selectedTargetsArr = formData.selectedTargets || [];
      if (selectedTargetsArr.length > 0) {
        targets = selectedTargetsArr.map(t => ({
          organizationId: t.organizationId || undefined,
          fleet_name: t.fleetName,
          route_id: t.routeId,
          vehicle_ids: t.vehicleIds || [],
          screens_per_vehicle: t.screensPerVehicle || 1,
          screens_count: t.totalScreens || 0,
          vehicles_count: t.vehicleCount || 0,
          city: t.city || 'Transit Network',
        }));
      } else {
        // Fallback to old fleet-name-only targets
        targets = formData.selectedFleets.map(fleetName => {
          const fleetObj = availableFleets.find(f => f.name === fleetName || f.id === fleetName);
          return {
            organizationId: fleetObj ? fleetObj.organization_id || undefined : undefined,
            fleet_name: fleetName,
            screens_count: fleetObj ? fleetObj.screens : 0,
            vehicles_count: fleetObj ? fleetObj.vehicles : 0,
            city: fleetObj ? fleetObj.cities : 'Transit Network',
          };
        });
      }

      const payload = {
        title: formData.name.trim(),
        brand_name: formData.brandName.trim() || undefined,
        campaign_type: formData.type,
        // Owner type drives the government PSA vs commercial ad path on the backend.
        ownerType,
        owner_type: ownerType,
        type: isGov ? 'government_psa' : (formData.type || 'commercial_ad'),
        description: formData.description.trim() || undefined,
        objective: formData.objective || undefined,
        category: formData.category || undefined,
        // External Client / Customer Information
        client_name: formData.clientName.trim(),
        client_company: formData.clientCompany.trim() || undefined,
        client_email: formData.clientEmail.trim(),
        client_phone: formData.clientPhone.trim(),
        client_city: formData.clientCity.trim() || undefined,
        client_state: formData.clientState?.trim() || undefined,
        client_pincode: formData.clientPincode?.trim() || undefined,
        client_latitude: formData.clientLatitude !== null && formData.clientLatitude !== '' && !isNaN(Number(formData.clientLatitude)) ? Number(formData.clientLatitude) : null,
        client_longitude: formData.clientLongitude !== null && formData.clientLongitude !== '' && !isNaN(Number(formData.clientLongitude)) ? Number(formData.clientLongitude) : null,
        client_address: formData.clientAddress.trim() || undefined,
        targeting_mode: formData.targetingMode,
        placement: 'Rear Screen',
        timezone: formData.timezone,
        promo_code: formData.promoApplied && formData.promoCode ? formData.promoCode.trim() : undefined,
        qr_redirect_url: formData.qrRedirectUrl ? formData.qrRedirectUrl.trim() : undefined,
        qrRedirectUrl: formData.qrRedirectUrl ? formData.qrRedirectUrl.trim() : undefined,
        qr_code: formData.qrCode,
        media_url: mediaUrlVal,
        media_type: mediaTypeVal,
        media: uploadedMediaList,
        media_assets: uploadedMediaList,
        resolution: isUrlType ? '1080p Stream' : (primaryMedia?.resolution || formData.resolution || undefined),
        file_size: isUrlType ? 'Cloud Stream' : (primaryMedia?.file_size || formData.fileSize || undefined),
        duration_per_play_sec: primaryMedia?.duration_sec || parseInt(formData.duration, 10) || 15,
        duration_days: durationDaysNumber,
        durationDays: durationDaysNumber,
        start_date: formData.startDate,
        startDate: formData.startDate,
        end_date: formData.endDate,
        endDate: formData.endDate,
        budget: breakdownCalc.finalTotal,
        daily_budget: dailyBudgetNum,
        dailyBudget: dailyBudgetNum,
        payment_breakdown: breakdownCalc.payload,
        paymentBreakdown: breakdownCalc.payload,
        budget_type: formData.budgetType,
        slot_type: 'exclusive',
        frequency: formData.repeat || 'Daily',
        active_days: formData.selectedDays,
        activeDays: formData.selectedDays,
        broadcast_start_time: formData.dailySlotStart || '08:00',
        broadcastStartTime: formData.dailySlotStart || '08:00',
        broadcast_end_time: formData.dailySlotEnd || '22:00',
        broadcastEndTime: formData.dailySlotEnd || '22:00',
        targets,
      };

      // Explicit slot booking for all targeted routes (double-booking prevention).
      const routeTargets = (targets || []).filter(t => t.route_id);
      if (routeTargets.length > 0 && formData.startDate && formData.endDate) {
        payload.slots = routeTargets.map(rt => ({
          routeId: rt.route_id,
          startDate: formData.startDate,
          endDate: formData.endDate,
          startTime: formData.dailySlotStart || '08:00',
          endTime: formData.dailySlotEnd || '22:00',
        }));
        payload.slot = payload.slots[0];
      }

      if (editId) {
        await toast.promise(updateCampaign(editId, payload), {
          loading: 'Updating campaign configurations...',
          success: 'Campaign updated successfully!',
          error: (e) => e?.message || 'Failed to update campaign',
        });
        await loadCampaigns().catch(() => {});
        isSubmittedRef.current = true;
        navigate(`${basePath}/campaigns/${editId}`);
        return;
      }

      const created = await toast.promise(createCampaign(payload), {
        loading: 'Publishing campaign to DOOH network...',
        success: 'Campaign created successfully!',
        error: (e) => e?.message || 'Failed to create campaign',
      });
      await loadCampaigns().catch(() => {});
      try {
        localStorage.removeItem('vmovexa_draft_campaign');
        setHasSavedDraft(false);
        setDraftInfo(null);
        setDraftSavedAt(null);
      } catch (_) {}
      isSubmittedRef.current = true;
      setSubmitting(false);
      isSubmittingRef.current = false;
      setSuccessModalData({
        campaignId: created?.code || created?.id || 'CMP-NEW',
        campaignCode: created?.code,
        dbId: created?.id,
        campaignName: formData.name,
        budget: breakdownCalc.finalTotal,
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        clientEmail: formData.clientEmail,
        startDate: formData.startDate,
        endDate: formData.endDate,
        durationDays: durationDaysNumber,
        totalScreens: formData.totalScreens,
      });
    } catch (err) {
      isSubmittingRef.current = false;
      setSubmitting(false);
      toast.error(err?.message || 'Failed to upload assets or create campaign');
    }
  };

  // Dynamic Payment Breakdown Calculation Engine (Defaults to 0, no hardcoded fallbacks)
  const baseAmountNum = useMemo(() => {
    if (formData.baseAmount !== undefined && formData.baseAmount !== '') {
      return Math.max(0, Number(formData.baseAmount) || 0);
    }
    return Math.max(0, Number(formData.budget) || 0);
  }, [formData.baseAmount, formData.budget]);

  const breakdownItems = useMemo(() => {
    if (Array.isArray(formData.breakdownItems)) {
      return formData.breakdownItems;
    }
    return [];
  }, [formData.breakdownItems]);

  const breakdownCalc = useMemo(() => {
    let charges = 0;
    let discounts = 0;
    let taxes = 0;

    breakdownItems.forEach(item => {
      const val = Math.abs(Number(item.amount) || 0);
      if (item.type === 'discount') {
        discounts += val;
      } else if (item.type === 'tax') {
        taxes += val;
      } else {
        charges += val;
      }
    });

    const subtotal = Math.max(0, baseAmountNum + charges - discounts);
    const finalTotal = subtotal + taxes;

    const formattedItems = [
      { key: 'base_amount', label: 'Base Airtime Broadcast Fee', amount: baseAmountNum, type: 'base' },
      ...breakdownItems.map(item => ({
        key: (item.label || 'item').toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        label: item.label || 'Line Item',
        amount: item.type === 'discount' ? -Math.abs(Number(item.amount || 0)) : Math.abs(Number(item.amount || 0)),
        type: item.type || 'charge',
      }))
    ];

    return {
      baseAmount: baseAmountNum,
      charges,
      discounts,
      taxes,
      subtotal,
      finalTotal,
      formattedItems,
      payload: {
        currency: 'INR',
        baseAmount: baseAmountNum,
        subtotal: subtotal,
        gstAmount: taxes,
        totalAmount: finalTotal,
        items: formattedItems,
      }
    };
  }, [baseAmountNum, breakdownItems]);

  const budgetNum = breakdownCalc.finalTotal;
  const gstAmount = breakdownCalc.taxes;
  const totalAmount = breakdownCalc.finalTotal;

  const handleAddBreakdownItem = () => {
    const newItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      label: '',
      amount: 0,
      type: 'charge',
    };
    setFormData(prev => ({
      ...prev,
      breakdownItems: [...breakdownItems, newItem],
    }));
  };

  const handleUpdateBreakdownItem = (id, field, value) => {
    const updated = breakdownItems.map(item => {
      if (item.id === id) {
        return {
          ...item,
          [field]: field === 'amount' ? (value === '' ? '' : Math.max(0, Number(value) || 0)) : value,
        };
      }
      return item;
    });
    setFormData(prev => ({ ...prev, breakdownItems: updated }));
  };

  const handleRemoveBreakdownItem = (id) => {
    const updated = breakdownItems.filter(item => item.id !== id);
    setFormData(prev => ({ ...prev, breakdownItems: updated }));
  };

  const durationDaysNumber = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return 14;
    const [sy, sm, sd] = formData.startDate.split('-').map(Number);
    const [ey, em, ed] = formData.endDate.split('-').map(Number);
    if (!sy || !ey) return 14;
    const s = new Date(sy, sm - 1, sd);
    const e = new Date(ey, em - 1, ed);
    const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  }, [formData.startDate, formData.endDate]);

  // Real-world DOOH: Exact count of active broadcast days matching selected days of week
  const activeBroadcastDaysCount = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return durationDaysNumber;
    const selected = Array.isArray(formData.selectedDays) && formData.selectedDays.length > 0
      ? formData.selectedDays
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const [sy, sm, sd] = formData.startDate.split('-').map(Number);
    const [ey, em, ed] = formData.endDate.split('-').map(Number);
    if (!sy || !ey) return durationDaysNumber;

    const DAY_MAP = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let count = 0;
    const cur = new Date(sy, sm - 1, sd);
    const end = new Date(ey, em - 1, ed);

    let safety = 0;
    while (cur <= end && safety < 1000) {
      if (selected.includes(DAY_MAP[cur.getDay()])) {
        count++;
      }
      cur.setDate(cur.getDate() + 1);
      safety++;
    }
    return count > 0 ? count : 1;
  }, [formData.startDate, formData.endDate, formData.selectedDays, durationDaysNumber]);

  // Check route slot availability for all chosen routes in the schedule window.
  const handleCheckSlotAvailability = useCallback(async (isManual = false) => {
    const targetsWithRoutes = (formData.selectedTargets || []).filter(t => t.routeId);
    if (!targetsWithRoutes.length) {
      if (isManual) toast.error('Select at least one route in the Fleet & Screens step first.');
      setSlotCheck({ loading: false, data: null, error: null });
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      if (isManual) toast.error('Set the campaign start and end dates first.');
      setSlotCheck({ loading: false, data: null, error: null });
      return;
    }
    setSlotCheck(prev => ({ ...prev, loading: true, error: null }));
    try {
      const uniqueRoutes = [];
      const seenRids = new Set();
      targetsWithRoutes.forEach(t => {
        const rid = String(t.routeId);
        if (!seenRids.has(rid)) {
          seenRids.add(rid);
          uniqueRoutes.push(t);
        }
      });

      const start = formData.dailySlotStart || '08:00';
      const end = formData.dailySlotEnd || '22:00';

      const results = await Promise.all(
        uniqueRoutes.map(async (rt) => {
          const res = await loadSlotAvailability({
            routeId: rt.routeId,
            startDate: formData.startDate,
            endDate: formData.endDate,
            excludeCampaignId: editId || undefined,
          });
          const booked = res?.booked || [];
          const conflictingSlots = booked.filter(b => {
            if (editId && (String(b.campaignId) === String(editId) || Number(b.campaignId) === Number(editId))) return false;
            const bs = String(b.startTime).slice(0, 5);
            const be = String(b.endTime).slice(0, 5);
            return start < be && bs < end;
          });
          return {
            routeId: rt.routeId,
            routeName: rt.routeName || `Route #${rt.routeId}`,
            booked,
            hasConflict: conflictingSlots.length > 0,
            conflictingSlots,
          };
        })
      );

      const hasAnyConflict = results.some(r => r.hasConflict);
      const conflictingRoutes = results.filter(r => r.hasConflict);
      const allBooked = results.flatMap(r => r.booked);

      setSlotCheck({
        loading: false,
        data: {
          conflict: hasAnyConflict,
          conflictingRoutes,
          results,
          booked: allBooked,
          chosen: { start, end },
        },
        error: null,
      });

      if (isManual) {
        if (hasAnyConflict) {
          const names = conflictingRoutes.map(r => r.routeName).join(', ');
          toast.error(`Slot already booked on: ${names}. Pick another time or route.`);
        } else {
          toast.success(uniqueRoutes.length > 1
            ? `All ${uniqueRoutes.length} selected routes are available for this time window!`
            : 'Slot is available for your route and time.');
        }
      }
    } catch (err) {
      setSlotCheck({ loading: false, data: null, error: err?.message || 'Could not check availability' });
      if (isManual) toast.error(err?.message || 'Could not check slot availability');
    }
  }, [formData.selectedTargets, formData.startDate, formData.endDate, formData.dailySlotStart, formData.dailySlotEnd, loadSlotAvailability]);

  // Debounced auto-check: runs automatically when schedule or targets change
  useEffect(() => {
    const targetsWithRoutes = (formData.selectedTargets || []).filter(t => t.routeId);
    if (!targetsWithRoutes.length || !formData.startDate || !formData.endDate) {
      setSlotCheck({ loading: false, data: null, error: null });
      return;
    }
    const timer = setTimeout(() => {
      handleCheckSlotAvailability(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.startDate, formData.endDate, formData.dailySlotStart, formData.dailySlotEnd, formData.selectedTargets, handleCheckSlotAvailability]);

  const dailyOperatingHours = useMemo(() => {
    if (!formData.dailySlotStart || !formData.dailySlotEnd) return 14;
    const [sh, sm] = (formData.dailySlotStart || '08:00').split(':').map(Number);
    const [eh, em] = (formData.dailySlotEnd || '22:00').split(':').map(Number);
    const diff = (eh * 60 + (em || 0)) - (sh * 60 + (sm || 0));
    return diff > 0 ? Number((diff / 60).toFixed(1)) : 0;
  }, [formData.dailySlotStart, formData.dailySlotEnd]);

  // Total airtime per display = Active broadcast days * daily operating hours
  const totalAirtimeHours = useMemo(() => {
    const val = activeBroadcastDaysCount * dailyOperatingHours;
    return Number.isInteger(val) ? val : Number(val.toFixed(1));
  }, [activeBroadcastDaysCount, dailyOperatingHours]);

  // Industry Standard DOOH Transit Screen Loop:
  // Standard transit screen playlist loop = 120 seconds (2 minutes).
  // 3600 seconds / 120 seconds = 30 loop cycles per hour.
  // Daily Loop Plays per Display = dailyOperatingHours * 30 plays/day.
  const estimatedLoopsPerDay = useMemo(() => {
    return Math.round(dailyOperatingHours * 30);
  }, [dailyOperatingHours]);

  const calcDurationDays = () => {
    return `${durationDaysNumber} Days (${activeBroadcastDaysCount} Active)`;
  };

  const effectiveScreens = useMemo(() => {
    if (formData.targetingMode === 'By Screen ID' && formData.customScreenCap) {
      const cap = Number(formData.customScreenCap);
      if (cap > 0 && formData.totalScreens > 0) return Math.min(cap, formData.totalScreens);
    }
    return formData.totalScreens;
  }, [formData.targetingMode, formData.customScreenCap, formData.totalScreens]);

  const effectiveReach = effectiveScreens * 1200;
  const effectiveReachFormatted = effectiveReach > 0
    ? (effectiveReach >= 1000000
        ? `${(effectiveReach / 1000000).toFixed(1)} Million Commuters`
        : `${effectiveReach.toLocaleString()} Commuters`)
    : '0 Commuters';

  const costPerScreenFormatted = effectiveScreens > 0 && budgetNum > 0
    ? `₹ ${Math.round(budgetNum / effectiveScreens).toLocaleString()}`
    : '–';

  // Fallback filtered fleets
  const filteredFleets = useMemo(() => {
    if (!routeSearch.trim()) return availableFleets;
    const q = routeSearch.toLowerCase();
    return availableFleets.filter(f =>
      String(f.name || '').toLowerCase().includes(q) ||
      String(f.sub || '').toLowerCase().includes(q) ||
      String(f.cities || '').toLowerCase().includes(q) ||
      String(f.locationMatch || '').toLowerCase().includes(q)
    );
  }, [routeSearch, availableFleets]);

  const ytId = extractYouTubeId(formData.videoUrl);

  return (
    <div ref={topRef} className="w-full space-y-6 pb-16">

      {/* Hidden File Input for Real Media Picking */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFilesSelect}
        multiple
        accept="image/*,video/*,application/pdf,.pdf"
        className="hidden"
      />

      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'Dashboard', to: `${basePath}/dashboard` },
              { label: 'Campaigns', to: `${basePath}/campaigns` },
              { label: editId ? t('campaign.edit_campaign', 'Edit Campaign') : t('campaign.create_campaign', 'Create Campaign') }
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
            {editId ? t('campaign.edit_campaign', 'Edit Campaign') : t('campaign.create_campaign', 'Create Campaign')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
            {t('common.step', 'Step')} <span className="font-bold text-slate-900 dark:text-zinc-100">{currentStep}</span> {t('common.of', 'of')} {totalSteps}: <span className="font-semibold text-slate-700 dark:text-zinc-300">{stepLabels[currentStep - 1]}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
          <Link
            to={`${basePath}/campaigns/flow`}
            className="text-xs text-slate-700 dark:text-zinc-200 font-bold border border-slate-200 dark:border-zinc-700 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <IconRocket className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{t('campaign_create.lifecycle_flow', 'Lifecycle Flow')}</span>
          </Link>
          {hasSavedDraft && (
            <button
              type="button"
              disabled={submitting}
              onClick={handleRestoreDraft}
              className="text-xs text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800/80 bg-blue-50 dark:bg-blue-950/50 px-3 py-2 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              title={t('campaign_create.restore_draft_title', 'Restore your previously saved draft')}
            >
              <IconRefresh className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{t('common.restore', 'Restore')}</span>
            </button>
          )}
          <button
            type="button"
            disabled={submitting}
            onClick={handleSaveDraft}
            className={`text-xs font-bold border px-3 sm:px-4 py-2 rounded-xl transition-all shadow-sm text-center flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
              draftSavedAt
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                : 'border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800'
            }`}
          >
            {draftSavedAt ? (
              <>
                <IconCheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{t('common.saved', 'Saved')} ({draftSavedAt})</span>
              </>
            ) : (
              <>
                <IconSave className="w-3.5 h-3.5" />
                <span>{t('campaign_create.save_draft', 'Save Draft')}</span>
              </>
            )}
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleCloseWizard}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shrink-0 transition-colors shadow-sm ml-auto sm:ml-0 disabled:opacity-50 disabled:cursor-not-allowed"
            title={t('campaign_create.save_close_wizard', 'Save & Close Wizard')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Persistent Saved Draft Notice Banner */}
      {hasSavedDraft && draftInfo && (
        <div className="p-3.5 bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-white dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900 dark:bg-zinc-900 border border-blue-200/80 dark:border-zinc-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              <IconSave className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {t('campaign_create.saved_draft_avail', 'Saved Draft Available:')} <span className="text-blue-700 dark:text-blue-400 font-extrabold">{draftInfo.name || 'Untitled Campaign'}</span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                {t('campaign_create.last_saved_at', 'Last saved at')} {draftInfo.savedTime} · {t('campaign_create.ready_resume_step', 'Ready to resume from Step')} {draftInfo.step || 1}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={handleRestoreDraft}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
            >
              <IconRefresh className="w-3.5 h-3.5" />
              <span>{t('campaign_create.restore_draft', 'Restore Draft')}</span>
            </button>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-xs font-semibold transition-colors"
              title={t('campaign_create.discard_draft_title', 'Discard saved draft and start fresh')}
            >
              {t('common.discard', 'Discard')}
            </button>
          </div>
        </div>
      )}

      {/* Stepper Progress Bar with Modern Vibrant Gradient */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden">
        {/* Top Gradient Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

        {/* Header Progress Counter & Status */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-900 dark:text-white tracking-tight">{t('campaign_create.wizard_title', 'Campaign Creation Wizard')}</span>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-indigo-950/80 dark:via-indigo-950/80 dark:to-indigo-950/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
              {t('common.step', 'Step')} {currentStep} {t('common.of', 'of')} {totalSteps}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
              {Math.round(((currentStep - 1) / (totalSteps - 1)) * 100)}% {t('common.complete', 'Complete')}
            </span>
            <div className="w-24 h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full transition-all duration-500 shadow-xs"
                style={{ width: `${Math.max(10, Math.round(((currentStep - 1) / (totalSteps - 1)) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar pt-2 pb-1">
          <div className="flex items-center justify-between min-w-[560px] sm:min-w-0 relative px-4">
            {/* Background Base Track */}
            <div className="absolute left-7 right-7 top-[18px] -translate-y-1/2 h-1 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden -z-0">
              {/* Dynamic Active Gradient Connecting Line */}
              <div
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full transition-all duration-500 ease-out shadow-xs"
                style={{
                  width: `${((currentStep - 1) / (stepLabels.length - 1)) * 100}%`
                }}
              />
            </div>

            {stepLabels.map((label, index) => {
              const stepNum = index + 1;
              const isCompleted = stepNum < currentStep;
              const isCurrent = stepNum === currentStep;

              return (
                <div
                  key={label}
                  className={`relative z-10 flex flex-col items-center group select-none transition-transform ${
                    submitting ? 'cursor-not-allowed opacity-60 pointer-events-none' : 'cursor-pointer'
                  }`}
                  onClick={() => !submitting && !isSubmittingRef.current && !isSubmittedRef.current && setCurrentStep(stepNum)}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                      isCompleted
                        ? 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 ring-2 ring-white dark:ring-zinc-800 hover:scale-105'
                        : isCurrent
                        ? 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/35 ring-4 ring-indigo-100 dark:ring-indigo-900/60 scale-110'
                        : 'bg-white dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 text-slate-400 dark:text-zinc-500 group-hover:border-indigo-300 dark:group-hover:border-indigo-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      stepNum
                    )}
                  </div>
                  <span
                    className={`text-[11px] mt-2 whitespace-nowrap transition-colors duration-200 ${
                      isCurrent
                        ? 'font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 tracking-tight'
                        : isCompleted
                        ? 'font-bold text-slate-800 dark:text-zinc-200'
                        : 'font-medium text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-300'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step Content Container */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm">

        {/* STEP 1: Campaign Information */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{t('campaign_create.info_heading', 'Campaign Information')}</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{t('campaign_create.info_sub', 'Provide essential metadata and classification for your transit ad campaign.')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('campaign_create.campaign_name', 'Campaign Name')}<span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('campaign_create.name_placeholder', 'e.g. Summer Special Promotion 2026')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 bg-white dark:bg-zinc-800/80 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-600"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  {t('campaign_create.brand_company_name', 'Brand / Company Name')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={e => setFormData({ ...formData, brandName: e.target.value })}
                  placeholder={t('campaign_create.brand_placeholder', 'e.g. Acme Corp / Your Brand Name')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 bg-white dark:bg-zinc-800/80 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-600"
                />
              </div>

              {/* Campaign Type Selector Tiles */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('campaign_create.campaign_type', 'Campaign Type')}</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Brand Awareness', icon: IconMegaphone },
                    { label: 'Product Promotion', icon: IconBox },
                    { label: 'Event', icon: IconCalendar },
                    { label: 'Offer / Promotion', icon: IconTag },
                  ].map(type => {
                    const TypeIcon = type.icon;
                    return (
                      <button
                        key={type.label}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type.label })}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all ${
                          formData.type === type.label
                            ? 'border-slate-900 bg-slate-900 text-white shadow-sm ring-2 ring-slate-800 dark:border-blue-500 dark:bg-blue-600 dark:ring-blue-500/30'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <TypeIcon className={`w-6 h-6 mb-2 ${formData.type === type.label ? 'text-white' : 'text-slate-600 dark:text-zinc-400'}`} />
                        <span className="text-xs font-bold">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('campaign_create.campaign_description', 'Campaign Description')}</label>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">{formData.description.length}/500</span>
                </div>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('campaign_create.desc_placeholder', 'Describe your target commuters, key messaging, and campaign objectives...')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 bg-white dark:bg-zinc-800/80 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-600 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('campaign_create.objective', 'Objective')}<span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.objective}
                  onChange={e => setFormData({ ...formData, objective: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-600 bg-white dark:bg-zinc-800/80"
                >
                  <option value="Increase Brand Awareness">{t('campaign_create.obj_brand_awareness', 'Increase Brand Awareness')}</option>
                  <option value="Drive Sales">{t('campaign_create.obj_drive_sales', 'Drive Sales')}</option>
                  <option value="Store Footfall">{t('campaign_create.obj_store_footfall', 'Store Footfall')}</option>
                  <option value="Product Launch">{t('campaign_create.obj_product_launch', 'Product Launch')}</option>
                  <option value="Lead Generation">{t('campaign_create.obj_lead_gen', 'Lead Generation')}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('campaign_create.category', 'Category')}<span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-600 bg-white dark:bg-zinc-800/80"
                >
                  <option value="Retail">{t('campaign_create.cat_retail', 'Retail')}</option>
                  <option value="Technology">{t('campaign_create.cat_technology', 'Technology')}</option>
                  <option value="Fashion">{t('campaign_create.cat_fashion', 'Fashion')}</option>
                  <option value="Automotive">{t('campaign_create.cat_automotive', 'Automotive')}</option>
                  <option value="FMCG / Grocery">{t('campaign_create.cat_fmcg', 'FMCG / Grocery')}</option>
                  <option value="Real Estate">{t('campaign_create.cat_real_estate', 'Real Estate')}</option>
                  <option value="Entertainment">{t('campaign_create.cat_entertainment', 'Entertainment')}</option>
                  <option value="Healthcare">{t('campaign_create.cat_healthcare', 'Healthcare')}</option>
                  <option value="Education">{t('campaign_create.cat_education', 'Education')}</option>
                </select>
              </div>
            </div>

            {/* Customer / Client Contact & Link Recipient Section */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-zinc-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900 dark:bg-zinc-900 border border-blue-200/80 dark:border-zinc-800 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <IconUser className="w-5 h-5 text-white" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{t('campaign_create.customer_info', 'Customer / Client Details')}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80">
                        {t('campaign_create.sms_email_recipient_badge', 'SMS & Email Recipient')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5 font-medium">
                      {t('campaign_create.as_vmovexa_rep_desc', "As a VMOVEXA representative, enter the customer's details. Official invoice and payment links will be dispatched directly to this customer.")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    {t('campaign_create.customer_contact_name', 'Customer Contact Name')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder={t('campaign_create.customer_contact_ph', 'e.g. Rajesh Sharma / Business Owner')}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 bg-white dark:bg-zinc-800/80 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    {t('campaign_create.customer_company_name', 'Customer Company / Brand Name')}
                  </label>
                  <input
                    type="text"
                    value={formData.clientCompany}
                    onChange={e => setFormData({ ...formData, clientCompany: e.target.value })}
                    placeholder={t('campaign_create.customer_company_ph', 'e.g. Sharma Traders Pvt Ltd')}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 bg-white dark:bg-zinc-800/80 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      {t('campaign_create.customer_mobile_number', 'Customer Mobile Number')} <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/50 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                      <IconPhone className="w-3 h-3" /> {t('campaign_create.sms_payment_link_badge', 'SMS Payment Link')}
                    </span>
                  </div>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={formData.clientPhone}
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9+\s-]/g, '');
                      setFormData({ ...formData, clientPhone: val });
                    }}
                    placeholder={t('campaign_create.customer_mobile_ph', 'e.g. +91 98765 43210')}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 bg-white dark:bg-zinc-800/80 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-600"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500">{t('campaign_create.sms_hint', 'Payment checkout SMS link will be sent directly to this number.')}</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      {t('campaign_create.customer_email_address', 'Customer Email Address')} <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/50 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                      <IconMail className="w-3 h-3" /> {t('campaign_create.email_invoice_link_badge', 'Email Invoice & Link')}
                    </span>
                  </div>
                  <input
                    type="email"
                    value={formData.clientEmail}
                    onChange={e => setFormData({ ...formData, clientEmail: e.target.value })}
                    placeholder={t('campaign_create.customer_email_ph', 'e.g. rajesh@sharmatraders.in')}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 bg-white dark:bg-zinc-800/80 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-600"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500">{t('campaign_create.email_hint', 'Official GST invoice and payment link will be sent to this email.')}</p>
                </div>

                {/* Customer Business Location & Address Picker - Takes full space (100% width) */}
                <div className="col-span-full pt-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <IconLocation className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-800 dark:text-zinc-200 uppercase tracking-wider block">
                          {t('campaign_create.customer_business_location', 'Customer Business Location & Geocoding')}
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                          {t('campaign_create.customer_business_location_sub', 'Set client headquarters or store location for geo-targeted reporting, checkout SMS and billing invoice.')}
                        </p>
                      </div>
                    </div>
                    {formData.clientCity && (
                      <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 px-2.5 py-0.5 rounded-md self-start sm:self-auto flex items-center gap-1">
                        <IconLocation className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        <span>{formData.clientCity}{formData.clientState ? `, ${formData.clientState}` : ''}</span>
                      </span>
                    )}
                  </div>
                  <DriverAddressPicker
                    addressData={{
                      address: formData.clientAddress,
                      city: formData.clientCity,
                      state: formData.clientState,
                      pincode: formData.clientPincode,
                      country: formData.clientCountry,
                      placeId: formData.clientPlaceId,
                      latitude: formData.clientLatitude,
                      longitude: formData.clientLongitude,
                    }}
                    onChange={handleClientAddressChange}
                    disabled={submitting}
                    searchLabel="Search Client / Business Location / Landmark"
                    searchPlaceholder="Search client office, shop, landmark, colony, or town in India..."
                    searchHint="Search any business address, shop, or landmark in India — or drag the pin on the map to set exact coordinates."
                    pinEmoji="🏢"
                    pinColor="#2563eb"
                    pinLabel="Client Business"
                    addressLabel="Client Full Street Address / Building"
                    addressPlaceholder="Flat/Office No, Building Name, Street, Landmark"
                  />
                </div>
              </div>
            </div>
          </div>
        )}


        {/* STEP 2: Upload Creative or Video URL */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{t('campaign_create.upload_title', 'Upload Creative Assets or Video URL')}</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{t('campaign_create.upload_sub', 'Attach multiple images, videos, PDF documents, or streaming URLs. Files are stored locally and will only be uploaded when you submit the campaign.')}</p>
            </div>

            {/* Creative Type Selector Pills */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3 overflow-x-auto no-scrollbar">
              {[
                { type: 'All', label: 'All Creatives', icon: IconFolder },
                { type: 'Image', label: 'Image', icon: IconImage },
                { type: 'Video', label: 'Video', icon: IconVideo },
                { type: 'PDF', label: 'PDF Document', icon: IconDocument },
                { type: 'URL', label: 'URL (YouTube / Web)', icon: IconLink },
              ].map(item => {
                const ItemIcon = item.icon;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        creativeType: item.type,
                      }));
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                      formData.creativeType === item.type
                        ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-sm ring-2 ring-slate-800 dark:ring-blue-500/30'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    <ItemIcon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* URL Input Section (If URL tab is selected) */}
            {formData.creativeType === 'URL' ? (
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        <IconPlay className="w-4 h-4 text-white" />
                      </span>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t('campaign_create.yt_url_title', 'YouTube / Web Video URL')}</h3>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('campaign_create.yt_url_sub', 'Provide a YouTube video or online media stream to broadcast across transit screens')}</p>
                      </div>
                    </div>

                    {ytId ? (
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
                        <IconCheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> {t('campaign_create.yt_video_detected', 'YouTube Video Detected')} ({ytId})
                      </span>
                    ) : formData.videoUrl.trim() ? (
                      <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
                        <IconCheckCircle className="w-3 h-3 text-blue-600 dark:text-blue-400" /> {t('campaign_create.video_url_provided', 'Video URL Provided')}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
                        <IconWarning className="w-3 h-3 text-amber-600 dark:text-amber-400" /> {t('campaign_create.enter_video_url_below', 'Enter Video URL Below')}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      {t('campaign_create.yt_video_link', 'YouTube / Video Link')} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-red-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </div>
                      <input
                        type="url"
                        value={formData.videoUrl}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        placeholder={t('campaign_create.paste_yt_link_ph', 'Paste YouTube link (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)')}
                        className="w-full pl-10 pr-24 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 text-sm font-medium text-slate-900 dark:text-white bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-600"
                      />
                      {formData.videoUrl && (
                        <button
                          type="button"
                          onClick={() => handleUrlChange('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 bg-slate-100 dark:bg-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-600 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          {t('common.clear', 'Clear')}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        {t('campaign_create.supports_yt_stream', 'Supports YouTube, Shorts, youtu.be, or direct online streaming MP4 links.')}
                      </p>
                      {formData.videoUrl.trim() && (
                        <button
                          type="button"
                          onClick={handleAddVideoUrl}
                          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                        >
                          <IconPlus className="w-3.5 h-3.5" /> <span>{t('campaign_create.add_to_creatives', 'Add to Creatives List')}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Drag and Drop Box for Multi-File Selection (Images, Videos, PDFs) */
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleFilesSelect({ target: { files: e.dataTransfer.files } });
                  }
                }}
                className="border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-slate-500 dark:hover:border-zinc-500 rounded-2xl p-8 text-center bg-slate-50/60 dark:bg-zinc-800/40 hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-all cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-sm flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform text-slate-700 dark:text-zinc-200">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-sm font-black text-slate-900 dark:text-white">{t('campaign_create.upload_box_title', 'Upload Creative Assets (Select Multiple Files)')}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{t('campaign_create.drag_drop_hint', 'Drag & drop files here, or click anywhere to browse from your device')}</p>
                <div className="mt-3.5 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-bold hover:bg-slate-800 dark:hover:bg-blue-500 shadow-sm transition-colors"
                  >
                    {t('campaign_create.select_images_videos_pdfs', 'Select Images, Videos, or PDFs')}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-3 font-medium">
                  {t('campaign_create.supported_formats_note', 'Supported Formats: JPG, PNG, WEBP, MP4, MOV, PDF · Up to 50 MB each · Held locally until submit')}
                </p>
              </div>
            )}

            {/* Attached Creative Assets Gallery */}
            {creativeItems.length > 0 && (
              <div className="space-y-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      {t('campaign_create.attached_creative_assets', 'Attached Creative Assets')} ({creativeItems.length})
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                      {t('campaign_create.preview_ready_badge', 'Preview Ready (Uploads on Submit)')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-200 transition-colors shadow-2xs flex items-center gap-1.5"
                    >
                      <IconPlus className="w-3.5 h-3.5" /> <span>{t('campaign_create.add_more_files', 'Add More Files')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveMedia}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-bold text-rose-700 dark:text-rose-400 transition-colors shadow-2xs"
                    >
                      {t('common.clear_all', 'Clear All')}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {creativeItems.map((item, idx) => {
                    const isSelected = selectedPreviewIndex === idx;
                    return (
                      <div
                        key={item.id || idx}
                        className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                            : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Thumbnail */}
                          {item.type === 'Image' ? (
                            <img
                              src={item.previewUrl}
                              alt={item.name}
                              className="w-14 h-12 rounded-lg object-cover border border-slate-200 shrink-0 bg-white"
                            />
                          ) : item.type === 'Video' ? (
                            <div className="w-14 h-12 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex flex-col items-center justify-center shrink-0">
                              <IconVideo className="w-5 h-5 text-indigo-600" />
                              <span className="text-[9px] font-black uppercase mt-1">{t('common.video', 'Video')}</span>
                            </div>
                          ) : item.type === 'PDF' ? (
                            <div className="w-14 h-12 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex flex-col items-center justify-center shrink-0">
                              <IconDocument className="w-5 h-5 text-rose-600" />
                              <span className="text-[9px] font-black uppercase mt-1">{t('common.pdf', 'PDF')}</span>
                            </div>
                          ) : (
                            <div className="w-14 h-12 rounded-lg bg-red-50 border border-red-200 text-red-700 flex flex-col items-center justify-center shrink-0">
                              <IconLink className="w-5 h-5 text-red-600" />
                              <span className="text-[9px] font-black uppercase mt-1">{t('common.url', 'URL')}</span>
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate" title={item.name}>
                              {item.name}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                              <span className="font-semibold text-slate-700">{item.type}</span> · {item.size} · {item.resolution}
                              {item.duration ? ` · ${item.duration}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1" title="Seconds this creative plays on screen">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Seq {idx + 1}</span>
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={item.displayDurationSec !== undefined ? item.displayDurationSec : (item.durationSec || 15)}
                              onChange={(e) => {
                                const digitsOnly = e.target.value.replace(/\D/g, '');
                                handleCreativeDurationChange(item.id, digitsOnly);
                              }}
                              onBlur={() => {
                                if (!item.displayDurationSec) {
                                  handleCreativeDurationChange(item.id, '15');
                                }
                              }}
                              className="w-14 px-1.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 text-center"
                              aria-label={`Display seconds for ${item.name}`}
                            />
                            <span className="text-[10px] font-bold text-slate-500">sec</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSelectPreviewItem(idx)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {isSelected && <IconCheckCircle className="w-3 h-3 text-white" />}
                            <span>{isSelected ? 'Viewing' : 'Preview'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveCreativeItem(item.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title={t('common.remove_asset', 'Remove asset')}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Creative Specifications Table */}
            {(() => {
              const activeCreative = creativeItems[selectedPreviewIndex] || creativeItems[0] || null;
              const isUrlMode = formData.creativeType === 'URL' && !activeCreative;

              return (
                <div className="bg-white border border-slate-200 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {t('campaign_create.creative_specifications', 'Creative Specifications')} {activeCreative ? `(${activeCreative.name})` : ''}
                    </h3>
                    {activeCreative && (
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {t('campaign_create.selected_for_preview', 'Selected for Preview')}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      {
                        label: 'Resolution',
                        value: activeCreative?.resolution || (isUrlMode ? (formData.videoUrl.trim() ? '1080p Stream' : '–') : (formData.resolution || '–')),
                      },
                      { label: 'Aspect Ratio', value: '16:9' },
                      {
                        label: 'Duration',
                        value: activeCreative?.duration || (isUrlMode ? 'Adaptive' : (formData.duration || '–')),
                      },
                      {
                        label: 'Format',
                        value: activeCreative
                          ? (activeCreative.type === 'Video'
                              ? 'MP4 / Video'
                              : activeCreative.type === 'PDF'
                              ? 'PDF Document'
                              : activeCreative.type === 'URL'
                              ? 'Online Stream'
                              : 'PNG / JPG Image')
                          : (isUrlMode ? (ytId ? 'YouTube Stream' : 'Web Stream') : '–'),
                      },
                    ].map(spec => (
                      <div key={spec.label} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                        <p className="text-xs font-black text-slate-900">{spec.value}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">{spec.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Display Mockup Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">{t('campaign_create.mockup_preview', 'Display Mockup Preview')}</label>
                {(() => {
                  const active = creativeItems[selectedPreviewIndex] || creativeItems[0];
                  if (active) {
                    return (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                        ● {t('campaign_create.previewing', 'Previewing')} {active.name} ({active.type})
                      </span>
                    );
                  }
                  if (formData.creativeType === 'URL' && ytId) {
                    return (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                        ● {t('campaign_create.live_yt_stream_player', 'Live YouTube Stream Player')}
                      </span>
                    );
                  }
                  return (
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {t('campaign_create.standby_mockup', 'Standby Mockup')}
                    </span>
                  );
                })()}
              </div>

              <div className="relative rounded-2xl bg-slate-950 p-4 border-4 border-slate-800 shadow-xl overflow-hidden aspect-video flex items-center justify-center max-h-96">
                {(() => {
                  const active = creativeItems[selectedPreviewIndex] || creativeItems[0];

                  if (active) {
                    if (active.type === 'Video') {
                      return (
                        <video
                          key={active.previewUrl}
                          src={active.previewUrl}
                          controls
                          autoPlay
                          muted
                          loop
                          className="w-full h-full object-contain rounded-lg"
                        />
                      );
                    }
                    if (active.type === 'PDF') {
                      return (
                        <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
                          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shadow-inner">
                            <IconDocument className="w-8 h-8 text-rose-400" />
                          </div>
                          <div>
                            <p className="text-base font-black text-white">{active.name}</p>
                            <p className="text-xs text-slate-400 mt-1 font-medium">{t('campaign_create.vector_pdf_doc', 'Vector PDF Creative Document')} · {active.size}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={active.previewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition-colors shadow-sm flex items-center gap-1.5"
                            >
                              <span>{t('campaign_create.view_pdf_tab', 'View PDF in New Tab')}</span>
                            </a>
                          </div>
                          <p className="text-[11px] text-slate-500">{t('campaign_create.pdf_broadcast_hint', 'PDF pages will be broadcast across transit digital screens as high-definition posters.')}</p>
                        </div>
                      );
                    }
                    if (active.type === 'URL') {
                      const detectedId = extractYouTubeId(active.videoUrl || active.previewUrl);
                      if (detectedId) {
                        return (
                          <iframe
                            className="w-full h-full rounded-lg"
                            src={`https://www.youtube.com/embed/${detectedId}?rel=0&modestbranding=1`}
                            title={t('campaign_create.yt_screen_mockup', 'YouTube Screen Mockup')}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        );
                      }
                      return (
                        <div className="flex flex-col items-center justify-center text-center p-6 space-y-2">
                          <IconLink className="w-10 h-10 text-blue-400" />
                          <p className="text-sm font-bold text-white">{t('campaign_create.ext_video_configured', 'External Video Stream Configured')}</p>
                          <p className="text-xs text-slate-400 font-mono max-w-md truncate">{active.videoUrl || active.previewUrl}</p>
                        </div>
                      );
                    }
                    // Default: Image
                    return (
                      <img
                        key={active.previewUrl}
                        src={active.previewUrl}
                        alt={active.name}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    );
                  }

                  // Fallback: URL mode
                  if (formData.creativeType === 'URL') {
                    if (ytId) {
                      return (
                        <iframe
                          className="w-full h-full rounded-lg"
                          src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
                          title={t('campaign_create.yt_screen_mockup', 'YouTube Screen Mockup')}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      );
                    }
                    if (formData.videoUrl.trim()) {
                      return (
                        <div className="flex flex-col items-center justify-center text-center p-6 space-y-2">
                          <IconLink className="w-10 h-10 text-blue-400" />
                          <p className="text-sm font-bold text-white">{t('campaign_create.ext_video_configured', 'External Video Stream Configured')}</p>
                          <p className="text-xs text-slate-400 font-mono max-w-md truncate">{formData.videoUrl}</p>
                        </div>
                      );
                    }
                    return (
                      <div className="flex flex-col items-center justify-center text-center p-6 space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center border border-slate-700">
                          <IconPlay className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-sm font-bold text-slate-300">{t('campaign_create.enter_yt_above', 'Enter YouTube URL Above')}</p>
                        <p className="text-xs text-slate-500">{t('campaign_create.live_video_hint', 'Live video preview will stream inside this transit screen frame')}</p>
                      </div>
                    );
                  }

                  // Default standby
                  return (
                    <div className="flex flex-col items-center justify-center text-center p-6 space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center border border-slate-700">
                        <IconScreen className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-sm font-bold text-slate-300">{t('campaign_create.screen_standby', 'Transit Screen Standby')}</p>
                      <p className="text-xs text-slate-500">{t('campaign_create.screen_standby_sub', 'Select or drop image, video, or PDF files above to see live in-cab screen preview')}</p>
                    </div>
                  );
                })()}

                <div className="absolute top-6 left-6 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white tracking-widest uppercase border border-white/10 pointer-events-none">
                  VMOVEXA Screen Preview
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Select Transit Routes & Screens */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header & Quick Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">{t('campaign_create.select_routes_screens', 'Select Transit Routes & Screens')}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('campaign_create.choose_routes_desc', 'Choose transit routes for campaign broadcast. Each route displays active buses and onboard digital screens. You can select multiple routes.')}
                </p>
              </div>
              {(formData.selectedTargets || []).length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 shadow-sm flex items-center gap-1.5">
                    <IconLocation className="w-3.5 h-3.5" />
                    <span>{(formData.selectedTargets || []).length} {t('campaign_create.routes_selected', 'Route(s) Selected')}</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleClearAllRoutes}
                    className="text-xs font-bold text-slate-500 hover:text-red-600 px-2 py-1 transition-colors"
                  >
                    {t('common.clear_all', 'Clear All')}
                  </button>
                </div>
              )}
            </div>

            {/* Search & City Filter Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={routeSearch}
                    onChange={e => setRouteSearch(e.target.value)}
                    placeholder={t('campaign_create.search_routes_ph', 'Search transit routes, corridors, stations, or cities (e.g. Vijay nagar, Rau, Bhopal)...')}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all bg-slate-50/50"
                  />
                  {routeSearch && (
                    <button
                      type="button"
                      onClick={() => setRouteSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Bulk Action Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleSelectAllRoutes}
                    className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <IconCheckCircle className="w-3.5 h-3.5" />
                    <span>{t('campaign_create.select_all', 'Select All')} ({filteredTransitRoutes.length})</span>
                  </button>
                  {(formData.selectedTargets || []).length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllRoutes}
                      className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
                    >
                      {t('campaign_create.deselect_all', 'Deselect All')}
                    </button>
                  )}
                </div>
              </div>

              {/* City Filter Pills */}
              {availableRouteCities.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                  <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1">{t('campaign_create.city_filter', 'City Filter:')}</span>
                  {availableRouteCities.map(city => {
                    const isCurrent = routeCityFilter === city;
                    return (
                      <button
                        key={city}
                        type="button"
                        onClick={() => setRouteCityFilter(city)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                          isCurrent
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {city}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Route Cards Grid */}
            {filteredTransitRoutes.length === 0 ? (
              <div className="p-10 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <IconLocation className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-700">
                  {routeSearch ? `No transit routes matching "${routeSearch}"` : 'No transit routes found'}
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {t('campaign_create.no_routes_matching_hint', 'Try clearing the search query or selecting "All" cities to see all available transit routes and digital screen inventory.')}
                </p>
                {(routeSearch || routeCityFilter !== 'All') && (
                  <button
                    type="button"
                    onClick={() => { setRouteSearch(''); setRouteCityFilter('All'); }}
                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-100 shadow-sm"
                  >
                    {t('campaign_create.reset_route_filters', 'Reset Route Filters')}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTransitRoutes.map(route => {
                  const selected = isRouteSelected(route);
                  const routeKey = route.routeKey || `route-${route.id}`;
                  const isExpanded = Boolean(expandedRoute[routeKey]);

                  return (
                    <div
                      key={routeKey}
                      className={`relative rounded-2xl border-2 transition-all overflow-hidden flex flex-col justify-between ${
                        selected
                          ? 'border-blue-600 bg-blue-50/30 shadow-md ring-1 ring-blue-600/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      {/* Top Bar with Route Code, City, and Selection Checkbox */}
                      <div className="p-4 sm:p-5 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-900 text-white font-mono shadow-sm">
                              {route.code || `RTE-${route.id}`}
                            </span>
                            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                              <IconLocation className="w-3 h-3 text-slate-500" />
                              <span>{route.city || 'Transit Corridor'}</span>
                            </span>
                          </div>

                          {/* Checkbox selector */}
                          <button
                            type="button"
                            onClick={() => toggleRouteSelection(route)}
                            aria-label={`Select ${route.name}`}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 shrink-0 transition-all ${
                              selected
                                ? 'bg-blue-600 border-blue-600 text-white shadow-sm scale-105'
                                : 'border-slate-300 bg-white hover:border-blue-500'
                            }`}
                          >
                            {selected && (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        </div>

                        {/* Route Title & Corridor Origin ➔ Destination */}
                        <div
                          className="cursor-pointer"
                          onClick={() => toggleRouteSelection(route)}
                        >
                          <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug tracking-tight">
                            {route.name}
                          </h3>
                          <div className="mt-1.5 flex items-center gap-2 text-xs font-semibold text-slate-500 flex-wrap">
                            <span className="text-slate-800">{route.startPoint || 'Origin Station'}</span>
                            <span className="text-blue-600 font-black">➔</span>
                            <span className="text-slate-800">{route.endPoint || 'Destination Terminus'}</span>
                          </div>
                        </div>

                        {/* Inventory Metrics Row: Buses & Screens */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                          {/* Buses Count */}
                          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('campaign_create.active_buses', 'Active Buses')}</p>
                            <p className="text-sm font-black text-blue-700 mt-0.5 flex items-center gap-1.5">
                              <IconBus className="w-3.5 h-3.5 text-blue-600" />
                              <span>{route.vehicleCount ?? 0} {t('common.buses', 'Buses')}</span>
                            </p>
                          </div>

                          {/* Digital Screens Count */}
                          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('campaign_create.dooh_screens', 'DOOH Screens')}</p>
                            <p className="text-sm font-black text-purple-700 mt-0.5 flex items-center gap-1.5">
                              <IconScreen className="w-3.5 h-3.5 text-purple-600" />
                              <span>{route.totalScreens ?? 0} {t('common.screens', 'Screens')}</span>
                            </p>
                          </div>

                          {/* Screens Per Bus */}
                          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('campaign_create.displays_per_bus', 'Displays / Bus')}</p>
                            <p className="text-xs font-black text-slate-800 mt-0.5">
                              {route.screensPerVehicle ?? 0} {t('campaign_create.onboard', 'Onboard')}
                            </p>
                          </div>
                        </div>

                        {/* Fleet Operator Info Badge (Subtle Metadata) */}
                        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 border-t border-slate-100">
                          <span className="flex items-center gap-1">
                            <span className="text-slate-400">{t('campaign_create.operator', 'Operator:')}</span>
                            <span className="font-bold text-slate-700">{route.fleetName}</span>
                            {route.fleetType && (
                              <span className="text-[10px] text-slate-400">({route.fleetType})</span>
                            )}
                          </span>

                          {route.vehicles && route.vehicles.length > 0 ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedRoute(prev => ({ ...prev, [routeKey]: !isExpanded }));
                              }}
                              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 underline flex items-center gap-1"
                            >
                              <span>{isExpanded ? 'Hide Bus IDs' : `View ${route.vehicles.length} Bus IDs`}</span>
                              {isExpanded ? <IconChevronUp className="w-3 h-3" /> : <IconChevronDown className="w-3 h-3" />}
                            </button>
                          ) : (
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md">
                              {t('campaign_create.no_vehicles_assigned', 'No vehicles assigned yet')}
                            </span>
                          )}
                        </div>

                        {/* Optional Individual Buses Drill-Down */}
                        {isExpanded && route.vehicles && route.vehicles.length > 0 && (
                          <div className="mt-2 p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-slate-700">{t('campaign_create.assigned_vehicles', 'Assigned Transit Vehicles')}</span>
                              <span className="text-slate-400">{t('campaign_create.toggle_bus_hint', 'Tap to toggle specific bus (optional)')}</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto pr-1">
                              {route.vehicles.map(v => {
                                const vSelected = isVehicleSelected(route, v.id);
                                return (
                                  <button
                                    key={v.id}
                                    type="button"
                                    onClick={() => selected ? toggleVehicleInRoute(route, v.id) : toggleRouteSelection(route)}
                                    className={`flex items-center justify-between p-2 rounded-lg border text-[11px] font-bold transition-all ${
                                      !selected
                                        ? 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
                                        : vSelected
                                        ? 'border-blue-600 bg-blue-100 text-blue-900 shadow-2xs'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'
                                    }`}
                                  >
                                    <span className="truncate">{v.busNumber || `Bus #${v.id}`}</span>
                                    <span className="text-[10px] text-slate-500 shrink-0 ml-1">
                                      {v.displaysCount || route.screensPerVehicle || 2}S
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Bottom Selection Action Bar */}
                      <div
                        onClick={() => toggleRouteSelection(route)}
                        className={`px-4 py-2.5 text-xs font-bold cursor-pointer transition-colors border-t flex items-center justify-between ${
                          selected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          {selected ? (
                            <span className="flex items-center gap-1.5">
                              <IconCheckCircle className="w-3.5 h-3.5" /> {t('campaign_create.route_added_to_campaign', 'Route Added to Campaign')}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <IconPlus className="w-3.5 h-3.5" /> {t('campaign_create.click_select_route', 'Click to Select This Route')}
                            </span>
                          )}
                        </span>
                        <span className="text-[11px] font-medium opacity-90">
                          {selected ? `${route.vehicleCount ?? 0} ${t('common.buses', 'Buses')} · ${route.totalScreens ?? 0} ${t('common.screens', 'Screens')}` : t('campaign_create.book_route', 'Book Route')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Campaign DOOH Live Targeting Summary Card */}
            {(formData.selectedTargets || []).length > 0 && (
              <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('campaign_create.booking_summary', 'DOOH Live Booking Summary')}</p>
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-white mt-1">
                      {(formData.selectedTargets || []).length} {t('campaign_create.transit_routes_selected_across', 'Transit Route(s) Selected across')} {new Set((formData.selectedTargets || []).map(t => t.fleetName)).size} {t('campaign_create.fleet_operators', 'Fleet Operator(s)')}
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {t('campaign_create.selected_corridors', 'Selected Corridors:')} {(formData.selectedTargets || []).map(t => t.routeName).slice(0, 3).join(', ')}
                      {(formData.selectedTargets || []).length > 3 && ` +${(formData.selectedTargets || []).length - 3} more`}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                    <div className="bg-white/10 rounded-xl px-3.5 py-2 text-center min-w-[70px]">
                      <p className="text-lg font-black text-white">{formData.vehicles || 0}</p>
                      <p className="text-[11px] text-slate-300 font-medium">{t('campaign_create.buses_label', 'Buses')}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl px-3.5 py-2 text-center min-w-[70px]">
                      <p className="text-lg font-black text-white">{formData.totalScreens || 0}</p>
                      <p className="text-[11px] text-slate-300 font-medium">{t('campaign_create.screens_label', 'Screens')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Schedule Campaign */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <IconCalendar className="w-5 h-5 text-blue-600" />
                  <span>{t('campaign_create.schedule_title', 'Campaign Schedule & Broadcast Airtime')}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('campaign_create.flight_calendar_desc', 'Configure campaign flight calendar dates, repeat frequency, active weekly days, and daily bus screen operating hours.')}
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1.5">
                  <IconClock className="w-3.5 h-3.5" />
                  <span>{durationDaysNumber} {t('common.days_flight', 'Days Flight')} ({activeBroadcastDaysCount} {t('common.active_days', 'Active Days')})</span>
                </span>
              </div>
            </div>

            {/* Quick Duration Presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <IconLightning className="w-4 h-4 text-amber-500" />
                  <span>{t('campaign_create.quick_presets', 'Quick Duration Presets')}</span>
                </label>
                <span className="text-[11px] text-slate-400 font-medium">{t('campaign_create.set_flight_hint', 'Click to set flight window instantly')}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { days: 7, label: '7 Days', sub: '1 Week Flight' },
                  { days: 14, label: '14 Days', sub: '2 Weeks (Standard)' },
                  { days: 30, label: '30 Days', sub: '1 Month Full Run' },
                  { days: 60, label: '60 Days', sub: '2 Months Extended' },
                  { days: 90, label: '90 Days', sub: 'Quarterly Campaign' },
                ].map(p => {
                  const isActive = durationDaysNumber === p.days;
                  return (
                    <button
                      key={p.days}
                      type="button"
                      onClick={() => handleDurationPreset(p.days)}
                      className={`p-2.5 rounded-xl border text-left transition-all relative ${
                        isActive
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/30 scale-[1.01]'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-black flex items-center justify-between">
                        <span>{p.label}</span>
                        {isActive && <IconCheckCircle className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div className={`text-[10px] mt-0.5 font-medium ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                        {p.sub}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Start Date & End Date Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date Card */}
              <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 hover:border-slate-300 transition-all space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <IconRocket className="w-4 h-4 text-blue-600" />
                    <span>{t('campaign_create.start_datetime', 'Broadcast Start Date & Time')}</span>
                  </span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                    {t('campaign_create.launch_date_badge', 'Launch Date')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    min={getFormattedDate(0)}
                    value={formData.startDate}
                    onChange={e => handleStartDateChange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                  <IconCalendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDisplayDate(formData.startDate) || 'Choose start date'} · {formData.startTime}</span>
                </p>
              </div>

              {/* End Date Card */}
              <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 hover:border-slate-300 transition-all space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <IconFlag className="w-4 h-4 text-indigo-600" />
                    <span>{t('campaign_create.end_datetime', 'Broadcast End Date & Time')}</span>
                  </span>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                    {t('campaign_create.expiry_date_badge', 'Expiry Date')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    min={formData.startDate || getFormattedDate(0)}
                    value={formData.endDate}
                    onChange={e => handleEndDateChange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                  <IconFlag className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDisplayDate(formData.endDate) || 'Choose end date'} · {formData.endTime}</span>
                </p>
              </div>
            </div>

            {/* Repeat Frequency & Active Days */}
            <div className="space-y-4 pt-1">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <IconRefresh className="w-4 h-4 text-blue-600" />
                  <span>{t('campaign_create.repeat_freq', 'Repeat Frequency')}</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { key: 'Daily', title: 'Daily (Everyday)', sub: 'Mon–Sun (All 7 Days)', icon: IconRefresh },
                    { key: 'Weekdays', title: 'Weekdays Only', sub: 'Mon–Fri (Work Rush)', icon: IconBriefcase },
                    { key: 'Weekends', title: 'Weekends Only', sub: 'Sat–Sun (Leisure)', icon: IconShoppingBag },
                    { key: 'Custom', title: 'Custom Days', sub: 'Handpick Days', icon: IconCalendar },
                  ].map(f => {
                    const isActive = formData.repeat === f.key;
                    const FIcon = f.icon;
                    return (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => handleRepeatPreset(f.key)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isActive
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-800'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-black text-xs">
                          <FIcon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                          <span>{f.title}</span>
                        </div>
                        <div className={`text-[10px] mt-1 font-medium ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                          {f.sub}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Day of Week Selector */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <IconCalendar className="w-4 h-4 text-blue-600" />
                    <span>{t('campaign_create.active_broadcast_days_count', 'Active Broadcast Days')} ({formData.selectedDays.length} {t('campaign_create.of_7_days', 'of 7 days active')})</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRepeatPreset('Daily')}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 underline"
                    >
                      {t('campaign_create.all_7_days', 'All 7 Days')}
                    </button>
                    <span className="text-slate-300">·</span>
                    <button
                      type="button"
                      onClick={() => handleRepeatPreset('Weekdays')}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 underline"
                    >
                      {t('campaign_create.mon_fri', 'Mon–Fri')}
                    </button>
                    <span className="text-slate-300">·</span>
                    <button
                      type="button"
                      onClick={() => handleRepeatPreset('Weekends')}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 underline"
                    >
                      {t('campaign_create.sat_sun', 'Sat–Sun')}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {[
                    { id: 'Sun', name: 'Sunday' },
                    { id: 'Mon', name: 'Monday' },
                    { id: 'Tue', name: 'Tuesday' },
                    { id: 'Wed', name: 'Wednesday' },
                    { id: 'Thu', name: 'Thursday' },
                    { id: 'Fri', name: 'Friday' },
                    { id: 'Sat', name: 'Saturday' },
                  ].map(day => {
                    const isSelected = formData.selectedDays.includes(day.id);
                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => toggleDay(day.id)}
                        className={`py-2.5 sm:py-3 px-1 rounded-xl text-center border transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 font-black shadow-sm scale-[1.02]'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100 font-bold'
                        }`}
                      >
                        <div className="text-xs uppercase tracking-wider">{day.id}</div>
                        <div className={`text-[9px] mt-0.5 truncate hidden sm:block ${isSelected ? 'text-blue-100 font-semibold' : 'text-slate-400'}`}>
                          {isSelected ? 'On' : 'Off'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Daily Broadcast Operating Hours */}
            <div className="space-y-4 pt-1">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <IconClock className="w-4 h-4 text-blue-600" />
                    <span>{t('campaign_create.daily_airtime_window', 'Daily Display Airtime Window')}</span>
                  </label>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                    <IconClock className="w-3 h-3" />
                    <span>{dailyOperatingHours} {t('campaign_create.hours_day_active', 'Hours / Day Active')}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {t('campaign_create.daily_airtime_desc', 'Select the daily transit broadcast window during which onboard screens actively loop your ad.')}
                </p>

                {/* Time Slot Presets */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { start: '08:00', end: '22:00', label: 'Prime Transit', sub: '08:00 – 22:00 (14h)', rec: true },
                    { start: '06:00', end: '23:00', label: 'Full Day', sub: '06:00 – 23:00 (17h)' },
                    { start: '07:00', end: '12:00', label: 'Morning Rush', sub: '07:00 – 12:00 (5h)' },
                    { start: '16:00', end: '22:00', label: 'Evening Rush', sub: '16:00 – 22:00 (6h)' },
                  ].map(slot => {
                    const isActive = formData.dailySlotStart === slot.start && formData.dailySlotEnd === slot.end;
                    return (
                      <button
                        key={slot.label}
                        type="button"
                        onClick={() => handleTimeSlotPreset(slot.start, slot.end)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isActive
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-slate-800'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold flex items-center justify-between">
                          <span>{slot.label}</span>
                          {slot.rec && (
                            <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded">
                              {t('common.best', 'Best')}
                            </span>
                          )}
                        </div>
                        <div className={`text-[10px] mt-0.5 ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                          {slot.sub}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Time Slot Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-600 font-bold flex items-center gap-1.5">
                    <IconSun className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t('campaign_create.airtime_start', 'Airtime Start Time')}</span>
                  </span>
                  <input
                    type="time"
                    value={formData.dailySlotStart}
                    onChange={e => setFormData({ ...formData, dailySlotStart: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-slate-600 font-bold flex items-center gap-1.5">
                    <IconMoon className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{t('campaign_create.airtime_end', 'Airtime End Time')}</span>
                  </span>
                  <input
                    type="time"
                    value={formData.dailySlotEnd}
                    onChange={e => setFormData({ ...formData, dailySlotEnd: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Route Slot Availability Checker (double-booking prevention) */}
              <div className="p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wide">
                      {t('campaign_create.slot_availability', 'Route Slot Availability')}
                    </span>
                    <span className="text-[10px] text-blue-700 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      <span>{slotCheck.loading ? t('common.checking', 'Checking…') : t('campaign_create.auto_checking_live', 'Auto-Checked Live')}</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCheckSlotAvailability(true)}
                    disabled={slotCheck.loading}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-60 transition-colors"
                  >
                    {slotCheck.loading ? t('common.checking', 'Checking…') : t('campaign_create.recheck_slot', 'Re-check Availability')}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {t('campaign_create.slot_hint', 'Confirm your route + time window is not already booked by another campaign.')}
                </p>
                {slotCheck.error && (
                  <div className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5">{slotCheck.error}</div>
                )}
                {slotCheck.data && (
                  <div className={`text-[11px] font-semibold rounded-lg px-2.5 py-1.5 border ${slotCheck.data.conflict ? 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300' : 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'}`}>
                    {slotCheck.data.conflict
                      ? (slotCheck.data.conflictingRoutes?.length > 0
                          ? `⛔ Slot already booked on: ${slotCheck.data.conflictingRoutes.map(r => r.routeName).join(', ')}. Please choose another time or route.`
                          : t('campaign_create.slot_conflict', '⛔ This route + time window is already booked. Please choose a different time or route.'))
                      : t('campaign_create.slot_free', '✅ Slot available for your selected route(s) and time window.')}
                    {Array.isArray(slotCheck.data.booked) && slotCheck.data.booked.length > 0 && (
                      <div className="mt-1 text-slate-600 dark:text-zinc-400 font-medium">
                        {t('campaign_create.already_booked', 'Already booked:')}{' '}
                        {slotCheck.data.booked.slice(0, 5).map((b, bi) => (
                          <span key={bi}>{String(b.startTime).slice(0, 5)}–{String(b.endTime).slice(0, 5)}{bi < Math.min(slotCheck.data.booked.length, 5) - 1 ? ', ' : ''}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Visual Airtime 24h Progress Indicator */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                  <span>00:00 ({t('common.night', 'Night')})</span>
                  <span className="text-blue-700 font-bold">
                    {t('campaign_create.active_airtime', 'Active Airtime:')} {formData.dailySlotStart} {t('common.to', 'to')} {formData.dailySlotEnd} ({dailyOperatingHours} {t('common.hours', 'Hours')})
                  </span>
                  <span>24:00 ({t('common.midnight', 'Midnight')})</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex relative">
                  <div
                    className="h-full bg-blue-600 transition-all rounded-full"
                    style={{
                      marginLeft: `${Math.max(0, (((parseInt((formData.dailySlotStart || '08:00').split(':')[0], 10) + ((parseInt((formData.dailySlotStart || '08:00').split(':')[1], 10) || 0) / 60))) / 24) * 100)}%`,
                      width: `${Math.min(100, (dailyOperatingHours / 24) * 100)}%`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Timezone */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <IconGlobe className="w-4 h-4 text-blue-600" />
                <div>
                  <span className="font-bold text-slate-900">{formData.timezone}</span>
                  <p className="text-[10px] text-slate-500">{t('campaign_create.sync_iot_hint', 'Edge devices will automatically synchronize playback timing with vehicle IoT hardware')}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                <IconCheckCircle className="w-3 h-3 text-emerald-600" /> {t('campaign_create.gps_synced_badge', 'GPS Synced')}
              </span>
            </div>

            {/* Live DOOH Airtime Intelligence Card */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-5 shadow-lg border border-slate-800">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      {t('campaign_create.live_broadcast_intel', 'Live Broadcast Intelligence')}
                    </span>
                  </div>
                  <p className="text-base font-black text-white mt-1">
                    {durationDaysNumber} {t('common.days_flight', 'Days Flight')} · {formData.repeat} {t('campaign_create.broadcast_schedule', 'Broadcast Schedule')}
                  </p>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {formatDisplayDate(formData.startDate)} ➔ {formatDisplayDate(formData.endDate)} ({activeBroadcastDaysCount} {t('campaign_create.active_broadcast_days', 'Active Broadcast Days')})
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                    <p className="text-[10px] uppercase font-bold text-slate-300">{t('campaign_create.active_days_wk', 'Active Days / Wk')}</p>
                    <p className="text-sm font-black text-white mt-0.5">{formData.selectedDays.length} {t('common.days', 'Days')}</p>
                    <p className="text-[10px] text-slate-300 capitalize">{formData.repeat}</p>
                  </div>

                  <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                    <p className="text-[10px] uppercase font-bold text-slate-300">{t('campaign_create.daily_airtime', 'Daily Airtime')}</p>
                    <p className="text-sm font-black text-blue-300 mt-0.5">{dailyOperatingHours} {t('common.hours', 'Hours')}</p>
                    <p className="text-[10px] text-slate-300">{formData.dailySlotStart}–{formData.dailySlotEnd}</p>
                  </div>

                  <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                    <p className="text-[10px] uppercase font-bold text-slate-300">{t('campaign_create.total_airtime', 'Total Airtime')}</p>
                    <p className="text-sm font-black text-purple-300 mt-0.5">~{totalAirtimeHours} {t('common.hours', 'Hours')}</p>
                    <p className="text-[10px] text-slate-300">{activeBroadcastDaysCount} {t('campaign_create.active_days_per_screen', 'active days / screen')}</p>
                  </div>

                  <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                    <p className="text-[10px] uppercase font-bold text-emerald-300">{t('campaign_create.est_loop_cycles', 'Est. Loop Cycles')}</p>
                    <p className="text-sm font-black text-emerald-400 mt-0.5">~{estimatedLoopsPerDay} {t('common.per_day', '/ Day')}</p>
                    <p className="text-[10px] text-emerald-200">{t('campaign_create.plays_per_hr', '30 plays/hr (120s loop)')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Dynamic Payment Breakdown & QR Identity */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">{t('campaign_create.budget_qr_title', 'Dynamic Payment Breakdown & Budget Setup')}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{t('campaign_create.budget_qr_sub', 'Customize base broadcast fee, add custom line items (charges, discounts, taxes), and configure QR attribution.')}</p>
            </div>

            {/* Budget & Dynamic Breakdown Configuration */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (Span 7): Base Amount & Dynamic Line Items */}
              <div className="lg:col-span-7 space-y-5">
                {/* Base Broadcast Fee Input */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">{t('campaign_create.base_airtime_fee', 'Base Airtime Broadcast Fee (₹)')}</label>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md">{t('campaign_create.base_flight_budget', 'Base Flight Investment')}</span>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="0"
                    value={formData.baseAmount !== undefined && formData.baseAmount !== '' ? formData.baseAmount : (formData.budget !== undefined && formData.budget !== '' ? formData.budget : '')}
                    onChange={e => {
                      const digitsOnly = e.target.value.replace(/\D/g, '');
                      const val = digitsOnly === '' ? '' : Number(digitsOnly);
                      setFormData(prev => ({
                        ...prev,
                        baseAmount: val,
                        budget: val,
                      }));
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 text-xl font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 bg-slate-50/50 dark:bg-zinc-800"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500">{t('campaign_create.base_budget_desc', 'Enter standard base broadcast rate before custom surcharges and taxes.')}</p>
                </div>

                {/* Dynamic Payment Breakdown Item Builder */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">{t('campaign_create.itemized_breakdown_builder', 'Itemized Payment Breakdown')}</h3>
                      <p className="text-[11px] text-slate-500">{t('campaign_create.add_custom_key_values', 'Add dynamic custom charges, discounts, and taxes.')}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddBreakdownItem}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs"
                    >
                      <IconPlus className="w-3.5 h-3.5" />
                      <span>{t('campaign_create.add_line_item', '+ Add Line Item')}</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {breakdownItems.map((item, index) => (
                      <div key={item.id || index} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 sm:space-y-0 sm:flex sm:items-center sm:gap-3 transition-all hover:border-slate-300">
                        {/* Label/Key Input */}
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Item Label / Description
                          </label>
                          <input
                            type="text"
                            value={item.label}
                            placeholder="e.g. Peak Hour Surcharge"
                            onChange={e => handleUpdateBreakdownItem(item.id, 'label', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                          />
                        </div>

                        {/* Amount Input */}
                        <div className="w-full sm:w-32">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Amount (₹)
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="0"
                            value={item.amount !== undefined ? item.amount : ''}
                            onChange={e => {
                              const digitsOnly = e.target.value.replace(/\D/g, '');
                              handleUpdateBreakdownItem(item.id, 'amount', digitsOnly === '' ? '' : Number(digitsOnly));
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                          />
                        </div>

                        {/* Type Select */}
                        <div className="w-full sm:w-36">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Type
                          </label>
                          <select
                            value={item.type || 'charge'}
                            onChange={e => handleUpdateBreakdownItem(item.id, 'type', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                          >
                            <option value="charge">Charge (+)</option>
                            <option value="discount">Discount (-)</option>
                            <option value="tax">Tax (+)</option>
                          </select>
                        </div>

                        {/* Action Delete */}
                        <div className="pt-2 sm:pt-4 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveBreakdownItem(item.id)}
                            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove Line Item"
                          >
                            <span className="text-sm font-bold">✕</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column (Span 5): Live Summary Card & QR Config */}
              <div className="lg:col-span-5 space-y-5">
                {/* Cost Breakdown Live Summary Card */}
                <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3.5 shadow-md border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">{t('campaign_create.final_invoice_summary', 'Payment Invoice Summary')}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Live Calculation
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300">
                    {/* Render each dynamic breakdown line item by its exact user-entered label & key */}
                    {breakdownCalc.formattedItems.map((item, idx) => {
                      const amountVal = Number(item.amount || 0);
                      const isBase = item.type === 'base';
                      const isDiscount = item.type === 'discount' || amountVal < 0;
                      const isTax = item.type === 'tax';

                      let textColor = 'text-white';
                      let signPrefix = '';
                      if (isDiscount) {
                        textColor = 'text-emerald-400 font-semibold';
                        signPrefix = '- ';
                      } else if (isTax) {
                        textColor = 'text-amber-300 font-semibold';
                        signPrefix = '+ ';
                      } else if (!isBase) {
                        textColor = 'text-blue-300 font-semibold';
                        signPrefix = '+ ';
                      }

                      return (
                        <div key={item.key || idx} className={`flex justify-between items-center ${textColor}`}>
                          <span className="truncate pr-2" title={item.label}>
                            {item.label}
                          </span>
                          <span className="font-bold shrink-0 font-mono">
                            {signPrefix}₹ {Math.abs(amountVal).toLocaleString()}
                          </span>
                        </div>
                      );
                    })}

                    <div className="flex justify-between items-center text-slate-400 pt-1.5 border-t border-slate-800/80">
                      <span>Subtotal (Net Airtime)</span>
                      <span className="font-bold text-white font-mono">₹ {breakdownCalc.subtotal.toLocaleString()}</span>
                    </div>

                    {/* Final Highlighted Payable Amount */}
                    <div className="border-t-2 border-slate-700 pt-3 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">Total Payable Amount</span>
                        <span className="text-[10px] text-slate-400">Customer checkout link amount</span>
                      </div>
                      <span className="text-2xl font-black text-emerald-400 font-mono">
                        ₹ {breakdownCalc.finalTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50 leading-relaxed">
                    💡 <strong>Notice:</strong> This exact breakdown total of <strong>₹ {breakdownCalc.finalTotal.toLocaleString()}</strong> will be saved to the campaign and charged to the customer upon payment checkout link generation.
                  </p>
                </div>

              </div>
            </div>

              {/* QR Identity Card — Clean White Modern Theme */}
              <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 flex flex-col justify-between space-y-5 shadow-sm hover:border-slate-300 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{t('campaign_create.active_dynamic_qr', 'Active Dynamic QR')}</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {formData.qrCode}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">{t('campaign_create.qr_identity', 'Dynamic QR Code Identity')}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {t('campaign_create.qr_auto_generated_desc', 'Automatically generated for this campaign. Commuters scanning this QR code from bus displays will be tracked in real-time transit analytics.')}
                  </p>
                </div>

                {/* Target Redirect URL Input */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <IconLink className="w-3.5 h-3.5 text-blue-600" />
                      <span>Commuter Landing URL (Target Website / Review Link)</span>
                    </label>
                    {formData.qrRedirectUrl && (
                      <a
                        href={formData.qrRedirectUrl.startsWith('http') ? formData.qrRedirectUrl : `https://${formData.qrRedirectUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                      >
                        Test Link ↗
                      </a>
                    )}
                  </div>
                  <input
                    type="url"
                    placeholder="https://sharmatraders.com/sale or https://g.page/r/your-review"
                    value={formData.qrRedirectUrl}
                    onChange={e => setFormData({ ...formData, qrRedirectUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Quick Presets:</span>
                    <button
                      type="button"
                      onClick={() => setFormData(f => ({ ...f, qrRedirectUrl: 'https://' }))}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-600 transition-colors"
                    >
                      🌐 Website
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(f => ({ ...f, qrRedirectUrl: 'https://g.page/r/review' }))}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-600 transition-colors"
                    >
                      ⭐ Google Review
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(f => ({ ...f, qrRedirectUrl: 'https://wa.me/91' }))}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-600 transition-colors"
                    >
                      💬 WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(f => ({ ...f, qrRedirectUrl: 'https://youtube.com/' }))}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-600 transition-colors"
                    >
                      ▶️ YouTube
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    When commuters scan the QR code from the bus screen, VMOVEXA IoT analytics logs the scan timestamp, vehicle ID &amp; GPS, then immediately redirects the commuter to this target URL.
                  </p>
                </div>

                {/* White QR Code Display Frame */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 w-fit mx-auto shadow-2xs flex flex-col items-center justify-center space-y-2">
                  <div className="p-2.5 bg-white rounded-xl shadow-xs border border-slate-200/80">
                    <QRCodeSVG
                      id="campaign-qr-code-svg"
                      value={getQrTrackingUrl(formData.qrCode)}
                      size={140}
                      level="H"
                      includeMargin={true}
                      className="w-36 h-36"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                    {t('campaign_create.scan_camera_track_lead', 'Scan with camera to track lead')}
                  </span>
                </div>

                {/* Gateway & Destination Summary */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-[11px] space-y-1">
                  <div className="flex justify-between items-center text-slate-500 gap-2">
                    <span className="font-semibold shrink-0">Tracking Gateway:</span>
                    <span className="font-mono text-blue-600 font-bold truncate text-right" title={getQrTrackingUrl(formData.qrCode)}>
                      {getQrTrackingUrl(formData.qrCode)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500 gap-2">
                    <span className="font-semibold shrink-0">Landing Target:</span>
                    <span className="font-mono text-emerald-700 font-bold truncate text-right" title={formData.qrRedirectUrl || 'Default Promo Page'}>
                      {formData.qrRedirectUrl || 'Default Promo Page'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleShareQr}
                    className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs flex items-center justify-center gap-1.5"
                  >
                    <IconShare className="w-3.5 h-3.5" />
                    <span>{t('campaign_create.share_qr', 'Share QR')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadSvg}
                    className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white transition-colors shadow-2xs flex items-center justify-center gap-1.5"
                  >
                    <IconDownload className="w-3.5 h-3.5" />
                    <span>{t('campaign_create.download_svg', 'Download SVG')}</span>
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* STEP 6: Review & Submit */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <IconDocument className="w-5 h-5 text-blue-600" />
                  <span>{t('campaign_create.review_submit_title', 'Review & Submit Campaign')}</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{t('campaign_create.review_submit_sub', 'Please review all parameters and configurations before submitting for SuperAdmin verification.')}</p>
              </div>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 self-start sm:self-center inline-flex items-center gap-1">
                <IconCheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> {t('campaign_create.ready_final_sub', 'Ready for Final Submission')}
              </span>
            </div>

            <div className="space-y-5">
              {/* 1. Campaign Information & Metadata */}
              <div className="bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5">
                  <h3 className="text-xs font-black text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-black text-xs flex items-center justify-center">1</span>
                    <span>{t('campaign_create.overview_meta', 'Campaign Overview & Metadata')}</span>
                  </h3>
                  <button type="button" disabled={submitting} onClick={() => !submitting && setCurrentStep(1)} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline disabled:opacity-50 disabled:pointer-events-none">
                    {t('campaign_create.edit_step_1', 'Edit Step 1')}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-700 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-400">{t('campaign_create.campaign_name', 'Campaign Name')}</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-1 break-words">{formData.name || 'Not specified'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-700 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-400">{t('campaign_create.brand_product', 'Brand / Product')}</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-1 break-words">{formData.brandName || '–'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-700 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-400">{t('campaign_create.campaign_type', 'Campaign Type')}</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-1">{formData.type}</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-700 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-400">{t('campaign_create.objective', 'Objective')}</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-1">{formData.objective}</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-700 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-400">{t('campaign_create.category', 'Category')}</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-1">{formData.category}</p>
                  </div>
                </div>

                {formData.description && (
                  <div className="pt-1 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-400">{t('campaign_create.brief_desc', 'Campaign Brief / Description:')}</span>
                    <p className="text-slate-700 dark:text-zinc-300 font-medium mt-1 bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-100 dark:border-zinc-700 leading-relaxed break-words">
                      {formData.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Customer / Client Contact & Payment Link Recipient (100% Un-truncated & Responsive) */}
              <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-white dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900 dark:bg-zinc-900 border-2 border-blue-200/90 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 dark:border-zinc-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <IconUser className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-blue-950 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                        <span>{t('campaign_create.customer_info', 'Customer / Client Information')}</span>
                      </h3>
                      <p className="text-[11px] text-blue-800/80 dark:text-zinc-400 font-medium">
                        {t('campaign_create.payment_checkout_dispatched_desc', 'Payment checkout link and official GST invoice will be automatically dispatched to this client.')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                      {t('campaign_create.payment_link_recipient', 'Payment Link Recipient')}
                    </span>
                    <button type="button" disabled={submitting} onClick={() => !submitting && setCurrentStep(1)} className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 hover:underline disabled:opacity-50 disabled:pointer-events-none">
                      {t('campaign_create.edit_client', 'Edit Client')}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                  {/* Card 1: Contact Person & Company */}
                  <div className="p-3.5 bg-white dark:bg-zinc-900 border border-blue-100 dark:border-zinc-800 rounded-xl shadow-2xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 tracking-wider">{t('campaign_create.contact_company', 'Contact Person & Company')}</span>
                    <p className="font-black text-slate-900 dark:text-white text-sm break-words">
                      {formData.clientName || '–'}
                    </p>
                    <p className="text-xs font-bold text-blue-700 dark:text-blue-400 break-words flex items-center gap-1 pt-0.5">
                      <IconBriefcase className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{formData.clientCompany || 'Direct Business / Client'}</span>
                    </p>
                  </div>

                  {/* Card 2: Mobile Number (SMS Checkout Link) */}
                  <div className="p-3.5 bg-white dark:bg-zinc-900 border border-blue-100 dark:border-zinc-800 rounded-xl shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 tracking-wider">{t('campaign_create.mobile_sms_checkout', 'Mobile (SMS Checkout)')}</span>
                      <span className="text-[9px] font-extrabold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800/80">
                        {t('campaign_create.sms_recipient_badge', 'SMS Recipient')}
                      </span>
                    </div>
                    <p className="font-mono font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5 pt-0.5">
                      <IconPhone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{formData.clientPhone || '–'}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">{t('campaign_create.checkout_sms_dispatched', 'Checkout link SMS is dispatched to this mobile')}</p>
                  </div>

                  {/* Card 3: Email Address (Invoice & Payment Link) */}
                  <div className="p-3.5 bg-white dark:bg-zinc-900 border border-blue-100 dark:border-zinc-800 rounded-xl shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 tracking-wider">{t('campaign_create.email_invoice_link', 'Email (Invoice Link)')}</span>
                      <span className="text-[9px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/80">
                        {t('campaign_create.email_recipient_badge', 'Email Recipient')}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white text-xs break-all flex items-center gap-1.5 pt-0.5" title={formData.clientEmail}>
                      <IconMail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{formData.clientEmail || '–'}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">{t('campaign_create.invoice_emailed_direct', 'GST invoice & payment link emailed directly')}</p>
                  </div>

                  {/* Card 4: City, State & Pincode */}
                  <div className="p-3.5 bg-white dark:bg-zinc-900 border border-blue-100 dark:border-zinc-800 rounded-xl shadow-2xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 tracking-wider">{t('campaign_create.city_region', 'City & Region')}</span>
                    <p className="font-bold text-slate-900 dark:text-white text-xs break-words pt-0.5">
                      {[formData.clientCity, formData.clientState].filter(Boolean).join(', ') || 'Not specified'}
                    </p>
                    <p className="text-[11px] font-mono text-slate-600 dark:text-zinc-400 font-semibold">
                      {formData.clientPincode ? `Postal PIN: ${formData.clientPincode}` : (formData.clientCountry || 'India')}
                    </p>
                  </div>

                  {/* Card 5: Full Billing Street Address */}
                  <div className="p-3.5 bg-white dark:bg-zinc-900 border border-blue-100 dark:border-zinc-800 rounded-xl shadow-2xs space-y-1 sm:col-span-2 lg:col-span-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 tracking-wider">{t('campaign_create.billing_street', 'Billing Street Address')}</span>
                    <p className="font-medium text-slate-900 dark:text-white text-xs break-words leading-relaxed pt-0.5">
                      {formData.clientAddress || 'No full street address entered'}
                    </p>
                  </div>

                  {/* Card 6: Geocoding & GPS Coordinates */}
                  <div className="p-3.5 bg-white dark:bg-zinc-900 border border-blue-100 dark:border-zinc-800 rounded-xl shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 tracking-wider">{t('campaign_create.geocoded_location', 'Geocoded Location')}</span>
                      {formData.clientLatitude && formData.clientLongitude ? (
                        <span className="text-[9px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/80">
                          {t('campaign_create.verified_gps_badge', 'Verified GPS')}
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                          {t('campaign_create.standard_badge', 'Standard')}
                        </span>
                      )}
                    </div>
                    {formData.clientLatitude && formData.clientLongitude ? (
                      <div className="pt-0.5">
                        <p className="font-mono font-bold text-blue-700 dark:text-blue-400 text-xs flex items-center gap-1">
                          <IconLocation className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{Number(formData.clientLatitude).toFixed(5)}, {Number(formData.clientLongitude).toFixed(5)}</span>
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium mt-0.5">{t('campaign_create.synced_google_places', 'Synced with Google Places / Map Pin')}</p>
                      </div>
                    ) : (
                      <p className="text-slate-400 dark:text-zinc-500 font-medium italic pt-0.5">{t('campaign_create.coords_not_captured', 'Coordinates not captured')}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Advertisement Creative Assets */}
              <div className="bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-black text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-black text-xs flex items-center justify-center">2</span>
                      <span>{t('campaign_create.creative_assets', 'Advertisement Creative Assets')}</span>
                    </h3>
                    {creativeItems.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                        {creativeItems.length} {t('campaign_create.assets_attached_count', 'Asset(s) Attached')}
                      </span>
                    )}
                  </div>
                  <button type="button" disabled={submitting} onClick={() => !submitting && setCurrentStep(2)} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline disabled:opacity-50 disabled:pointer-events-none">
                    {t('campaign_create.edit_step_2', 'Edit Step 2')}
                  </button>
                </div>

                {creativeItems.length > 0 ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {creativeItems.map((item, idx) => (
                        <div key={item.id || idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700">
                          {item.type === 'Image' ? (
                            <img src={item.previewUrl} alt={item.name} className="w-14 h-12 rounded-lg object-cover border border-slate-200 dark:border-zinc-700 shrink-0" />
                          ) : item.type === 'Video' ? (
                            <div className="w-14 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
                              <IconVideo className="w-5 h-5 text-indigo-700 dark:text-indigo-300" />
                            </div>
                          ) : item.type === 'PDF' ? (
                            <div className="w-14 h-12 rounded-lg bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0">
                              <IconDocument className="w-5 h-5 text-rose-700 dark:text-rose-300" />
                            </div>
                          ) : (
                            <div className="w-14 h-12 rounded-lg bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-800/80 text-red-700 dark:text-red-300 flex items-center justify-center shrink-0">
                              <IconLink className="w-5 h-5 text-red-700 dark:text-red-300" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 dark:text-white break-words line-clamp-2 leading-snug" title={item.name}>{item.name}</p>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium mt-1 flex flex-wrap items-center gap-1.5">
                              <span className="font-extrabold text-slate-800 dark:text-zinc-200 bg-slate-200/70 dark:bg-zinc-700 px-1.5 py-0.5 rounded text-[10px]">{item.type}</span>
                              <span>·</span>
                              <span>{item.size}</span>
                              <span>·</span>
                              <span>{item.resolution}</span>
                              {item.duration ? <><span>·</span><span>{item.duration}</span></> : null}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium flex items-center gap-1.5">
                      <IconLock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                      <span>{t('campaign_create.submit_upload_notice', 'Attached files will be uploaded securely to the transit DOOH network servers when you click "Submit Campaign" below.')}</span>
                    </p>
                  </div>
                ) : (
                  formData.videoUrl.trim() ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700">
                      {ytId ? (
                        <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-700 shrink-0">
                          <img src={getYouTubeThumbnail(ytId)} alt="thumb" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                            <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center">
                              <IconPlay className="w-2.5 h-2.5 text-white" />
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-16 h-12 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800/80 flex items-center justify-center shrink-0">
                          <IconLink className="w-5 h-5 text-red-600 dark:text-red-300" />
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs flex-1 w-full">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-400">{t('campaign_create.format_type', 'Format / Type')}</span>
                          <p className="font-bold text-slate-900 dark:text-white mt-0.5">{ytId ? 'YouTube Stream' : 'Video URL'}</p>
                        </div>
                        <div className="sm:col-span-2 lg:col-span-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-400">{t('campaign_create.source_asset_url', 'Source Asset URL')}</span>
                          <p className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5 break-all" title={formData.videoUrl}>{formData.videoUrl}</p>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-400">{t('campaign_create.resolution', 'Resolution')}</span>
                          <p className="font-bold text-slate-900 dark:text-white mt-0.5">{t('campaign_create.stream_1080p', '1080p Stream')}</p>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-400">{t('campaign_create.duration', 'Duration')}</span>
                          <p className="font-bold text-slate-900 dark:text-white mt-0.5">{t('campaign_create.adaptive_stream', 'Adaptive Stream')}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 dark:text-zinc-500 italic">{t('campaign_create.no_creative_attached', 'No creative asset attached yet.')}</div>
                  )
                )}
              </div>

              {/* 3. Transit Routes & Screen Inventory */}
              <div className="bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-black text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-black text-xs flex items-center justify-center">3</span>
                      <span>{t('campaign_create.transit_routes_inventory', 'Transit Routes & Screen Inventory')}</span>
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
                      {formData.vehicles || 0} {t('common.buses', 'Buses')} · {formData.totalScreens || 0} {t('common.screens', 'Screens')}
                    </span>
                  </div>
                  <button type="button" disabled={submitting} onClick={() => !submitting && setCurrentStep(3)} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline disabled:opacity-50 disabled:pointer-events-none">
                    {t('campaign_create.edit_step_3', 'Edit Step 3')}
                  </button>
                </div>

                {/* Aggregate Inventory Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-400">{t('campaign_create.selected_routes', 'Selected Routes')}</span>
                    <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                      {(formData.selectedTargets || []).length || (formData.selectedFleets || []).length} {t('common.corridors', 'Corridors')}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-400">{t('campaign_create.transit_buses', 'Transit Buses')}</span>
                    <p className="text-sm font-black text-blue-700 dark:text-blue-400 mt-0.5 flex items-center gap-1.5">
                      <IconBus className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{formData.vehicles || 0} {t('common.buses', 'Buses')}</span>
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-400">{t('campaign_create.total_dooh_displays', 'Total DOOH Displays')}</span>
                    <p className="text-sm font-black text-purple-700 dark:text-purple-400 mt-0.5 flex items-center gap-1.5">
                      <IconScreen className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>{formData.totalScreens || 0} {t('common.screens', 'Screens')}</span>
                    </p>
                  </div>
                </div>

                {/* Detailed Selected Route Cards */}
                {(formData.selectedTargets || []).length > 0 ? (
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{t('campaign_create.booked_corridors', 'Booked Transit Corridors:')}</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {formData.selectedTargets.map((target, idx) => (
                        <div key={target.routeKey || idx} className="p-3 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl flex items-center justify-between text-xs">
                          <div className="min-w-0 flex-1 mr-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-900 dark:bg-zinc-950 text-white shrink-0 border border-transparent dark:border-zinc-700">
                                {target.routeCode || `RTE-${target.routeId}`}
                              </span>
                              <span className="font-bold text-slate-900 dark:text-white break-words">{target.routeName}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 flex flex-wrap items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 font-medium">
                                <IconLocation className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{target.city || 'Transit Line'}</span>
                              </span>
                              <span>·</span>
                              <span>{t('campaign_create.operator', 'Operator:')}<strong className="text-slate-700 dark:text-zinc-200">{target.fleetName}</strong></span>
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-black text-blue-700 dark:text-blue-400 text-xs block">
                              {target.vehicleCount || target.vehicleIds?.length || 0} {t('common.buses', 'Buses')}
                            </span>
                            <p className="text-[10px] text-purple-700 dark:text-purple-400 font-bold">
                              {target.totalScreens || 0} {t('common.screens', 'Screens')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 dark:text-zinc-500 italic">{t('campaign_create.no_routes_selected', 'No routes selected yet.')}</div>
                )}
              </div>

              {/* 4. Broadcast Schedule & Airtime Operating Window */}
              <div className="bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-black text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-black text-xs flex items-center justify-center">4</span>
                      <span>{t('campaign_create.broadcast_schedule_airtime', 'Broadcast Schedule & Operating Airtime')}</span>
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 inline-flex items-center gap-1">
                      <IconClock className="w-3 h-3 shrink-0" />
                      <span>{durationDaysNumber} {t('common.days_flight', 'Days Flight')} ({dailyOperatingHours}{t('common.h_per_day', 'h / day')})</span>
                    </span>
                  </div>
                  <button type="button" disabled={submitting} onClick={() => !submitting && setCurrentStep(4)} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline disabled:opacity-50 disabled:pointer-events-none">
                    {t('campaign_create.edit_step_4', 'Edit Step 4')}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-400">{t('campaign_create.broadcast_start', 'Broadcast Start')}</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">{formatDisplayDate(formData.startDate) || 'Start Date'}</p>
                    <p className="text-[10px] text-blue-700 dark:text-blue-400 font-bold mt-0.5">{formData.startTime} {t('common.launch', 'Launch')}</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-400">{t('campaign_create.broadcast_end', 'Broadcast End')}</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">{formatDisplayDate(formData.endDate) || 'End Date'}</p>
                    <p className="text-[10px] text-indigo-700 dark:text-indigo-400 font-bold mt-0.5">{formData.endTime} {t('common.expiry', 'Expiry')}</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-400">{t('campaign_create.repeat_active_days', 'Repeat & Active Days')}</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">{formData.repeat}</p>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                      {(formData.selectedDays || []).length} {t('common.days_per_wk', 'Days/Wk')} ({formData.selectedDays?.join(', ')})
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-400">{t('campaign_create.daily_operating_window', 'Daily Operating Window')}</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">{formData.dailySlotStart} – {formData.dailySlotEnd}</p>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold mt-0.5">{dailyOperatingHours} {t('common.hours_per_day', 'Hours / Day')}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs">
                  <span className="text-slate-600 dark:text-zinc-300 font-medium flex items-center gap-1.5">
                    <IconGlobe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>{t('campaign_create.timezone', 'Timezone:')}<strong className="text-slate-900 dark:text-white"> {formData.timezone}</strong></span>
                  </span>
                  <span className="text-slate-600 dark:text-zinc-300 font-medium">
                    {t('common.total_airtime', 'Total Airtime:')} <strong className="text-slate-900 dark:text-white">~{totalAirtimeHours} {t('common.hours', 'Hours')}</strong> ({activeBroadcastDaysCount} {t('campaign_create.active_days', 'active days')}) · {t('campaign_create.est_loop_cycles_short', 'Est. Loop Cycles:')} <strong className="text-slate-900 dark:text-white">~{estimatedLoopsPerDay} {t('common.plays_per_day', 'Plays / Day')}</strong> ({t('campaign_create.30_plays_hr', '30 plays/hr')})
                  </span>
                </div>
              </div>

              {/* 5. Financial Investment & Budget Breakdown */}
              <div className="bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-black text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-black text-xs flex items-center justify-center">5</span>
                      <span>{t('campaign_create.budget_breakdown', 'Campaign Budget & Tax Invoice Breakdown')}</span>
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                      {t('campaign_create.total_payable', 'Total Payable:')} ₹ {totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <button type="button" disabled={submitting} onClick={() => !submitting && setCurrentStep(5)} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline disabled:opacity-50 disabled:pointer-events-none">
                    {t('campaign_create.edit_step_5', 'Edit Step 5')}
                  </button>
                </div>

                <div className={`grid grid-cols-1 sm:grid-cols-2 ${breakdownItems.length === 1 ? 'lg:grid-cols-3' : (breakdownItems.length === 2 ? 'lg:grid-cols-4' : (breakdownItems.length > 2 ? 'md:grid-cols-3 lg:grid-cols-4' : ''))} gap-3 text-xs`}>
                  <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-400">{t('campaign_create.base_budget', 'Campaign Base Fee')}</span>
                    <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                      ₹ {breakdownCalc.baseAmount.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">{t('campaign_create.total_flight_investment', 'Base Airtime Broadcast')}</p>
                  </div>
                  {breakdownItems.map((item, idx) => {
                    const amountVal = Number(item.amount || 0);
                    const isDiscount = item.type === 'discount' || amountVal < 0;
                    const sign = isDiscount ? '- ' : '+ ';
                    return (
                      <div key={item.id || idx} className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-400 truncate block" title={item.label}>
                          {item.label}
                        </span>
                        <p className={`text-base sm:text-lg font-black mt-0.5 font-mono ${isDiscount ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                          {sign}₹ {Math.abs(amountVal).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                          {item.type === 'discount' ? 'Special Discount / Waiver' : (item.type === 'tax' ? 'Statutory Tax / Surcharge' : 'Addon & Service Fee')}
                        </p>
                      </div>
                    );
                  })}
                  {breakdownItems.length === 0 && Math.abs(breakdownCalc.finalTotal - breakdownCalc.baseAmount) > 0 && (
                    <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-400">Taxes & Surcharges</span>
                      <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                        + ₹ {(breakdownCalc.finalTotal - breakdownCalc.baseAmount).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">Addons, Discounts & Taxes</p>
                    </div>
                  )}
                  <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-800/80 rounded-xl">
                    <span className="text-emerald-700 dark:text-emerald-400 font-black uppercase text-[10px]">{t('campaign_create.total_payable', 'Total Payable (Final Checkout)')}</span>
                    <p className="text-base sm:text-xl font-black text-emerald-800 dark:text-emerald-300 mt-0.5 font-mono">
                      ₹ {breakdownCalc.finalTotal.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">{t('campaign_create.client_checkout_amount', 'Client Checkout Amount')}</p>
                  </div>
                </div>

                {/* Itemized Billing Ledger Table in Review Step */}
                <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl p-3.5 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 tracking-wider block">Itemized Billing Ledger:</span>
                  <div className="space-y-1.5 text-xs">
                    {breakdownCalc.formattedItems.map((item, idx) => {
                      const amountVal = Number(item.amount || 0);
                      const isBase = item.type === 'base';
                      const isDiscount = item.type === 'discount' || amountVal < 0;
                      const isTax = item.type === 'tax';
                      const signPrefix = isDiscount ? '- ' : (isBase ? '' : '+ ');
                      const colorClass = isDiscount ? 'text-emerald-700 dark:text-emerald-400' : (isTax ? 'text-amber-700 dark:text-amber-400' : 'text-slate-800 dark:text-zinc-200');
                      return (
                        <div key={idx} className={`flex justify-between items-center ${colorClass}`}>
                          <span>{item.label}</span>
                          <span className="font-mono font-bold">{signPrefix}₹ {Math.abs(amountVal).toLocaleString()}</span>
                        </div>
                      );
                    })}
                    <div className="border-t border-slate-200 dark:border-zinc-700 pt-2 flex justify-between font-black text-slate-900 dark:text-white text-sm">
                      <span>Grand Total (Customer Checkout Amount)</span>
                      <span className="font-mono text-emerald-700 dark:text-emerald-400 text-base">₹ {breakdownCalc.finalTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. Dynamic QR Code Identity & Attribution */}
              <div className="bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-black text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                      <IconQrCode className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                      <span>{t('campaign_create.qr_commuter_attribution', 'Dynamic QR Code & Commuter Attribution')}</span>
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80">
                      ● {t('campaign_create.active_qr_engine', 'Active QR Engine')}
                    </span>
                  </div>
                  <button type="button" disabled={submitting} onClick={() => !submitting && setCurrentStep(5)} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline disabled:opacity-50 disabled:pointer-events-none">
                    {t('campaign_create.edit_qr', 'Edit QR')}
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl">
                  <div className="p-2.5 bg-white dark:bg-zinc-900 rounded-xl shadow-xs border border-slate-200 dark:border-zinc-700 shrink-0">
                    <QRCodeSVG
                      value={getQrTrackingUrl(formData.qrCode)}
                      size={110}
                      level="H"
                      includeMargin={true}
                      className="w-28 h-28"
                    />
                  </div>
                  <div className="space-y-1.5 text-xs flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black text-slate-900 dark:text-white bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-2.5 py-0.5 rounded-md">
                        {formData.qrCode}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 px-2.5 py-0.5 rounded-md">
                        {t('campaign_create.gps_transit_synced', 'GPS & Transit Synced')}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-zinc-300 font-medium leading-relaxed">
                      {t('campaign_create.qr_commuters_scanning_desc', 'Commuters scanning this dynamic QR from bus displays are redirected to the campaign portal. Each scan logs timestamp, transit vehicle ID, device type, and GPS metadata into your live campaign analytics.')}
                    </p>
                    <p className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-semibold break-all">
                      <span className="block text-slate-500 dark:text-zinc-400 font-sans">Tracking Gateway: <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{getQrTrackingUrl(formData.qrCode)}</span></span>
                      <span className="block text-slate-500 dark:text-zinc-400 font-sans mt-0.5">Landing Target: <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">{formData.qrRedirectUrl || 'Default Campaign Promo Gateway'}</span></span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Approval Notice */}
            <div className="p-4 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900 dark:bg-zinc-900 border-2 border-blue-200 dark:border-zinc-800 rounded-2xl flex items-start gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-blue-950 dark:text-blue-300 uppercase tracking-wider">{t('campaign_create.verification_payment_workflow', 'Verification & Payment Workflow')}</p>
                <p className="text-xs text-blue-900 dark:text-zinc-300 mt-1 leading-relaxed break-words">
                  {t('campaign_create.checkout_workflow_prefix', 'Upon submission, your campaign will be reviewed by SuperAdmin. Once approved, the customer')} <strong className="text-slate-900 dark:text-white font-black">{formData.clientName || 'Client'}</strong> {t('campaign_create.checkout_sms_prefix', 'will receive a secure checkout payment link via SMS (')} <span className="font-mono font-bold text-blue-800 dark:text-blue-400">{formData.clientPhone || 'Mobile'}</span> {t('campaign_create.checkout_email_infix', ') and Email (')} <span className="font-mono font-bold text-blue-800 dark:text-blue-400 break-all">{formData.clientEmail || 'Email'}</span> {t('campaign_create.checkout_after_pay', '). After payment of')} <strong className="text-emerald-700 dark:text-emerald-400 font-black">₹{totalAmount.toLocaleString()}</strong> {t('campaign_create.checkout_launch_suffix', 'is settled, you can manually launch the live broadcast on transit displays.')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-6 border-t border-slate-200 dark:border-zinc-800 mt-6">
          <button
            type="button"
            disabled={submitting}
            onClick={handleBack}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-[0.99] transition-all text-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
          >
            {currentStep === 1 ? 'Cancel' : '← Back'}
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={handleNext}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-bold hover:bg-slate-800 dark:hover:bg-blue-500 active:scale-[0.99] transition-all shadow-sm inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
          >
            {currentStep === totalSteps ? (
              submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                  <span>{editId ? 'Updating Campaign...' : 'Submitting Campaign...'}</span>
                </>
              ) : (
                <>
                  <span>{editId ? 'Update Campaign' : 'Submit Campaign'}</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </>
              )
            ) : (
              <>
                <span>{t('campaign_create.next_step', 'Next Step')}</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Campaign Submitted Success Popup Modal */}
      {successModalData && (
        <CampaignSuccessModal
          isOpen={Boolean(successModalData)}
          data={successModalData}
          basePath={basePath}
          onClose={() => {
            setSuccessModalData(null);
            navigate(`${basePath}/campaigns`);
          }}
          onReset={() => {
            setSuccessModalData(null);
            setCurrentStep(1);
            setCreativeItems([]);
            setSelectedPreviewIndex(0);
            setFormData({
              name: '',
              brandName: '',
              objective: 'Brand Awareness',
              type: 'Commercial Ad',
              category: 'Retail & FMCG',
              description: '',
              clientName: '',
              clientCompany: '',
              clientPhone: '',
              clientEmail: '',
              clientCity: '',
              clientState: '',
              clientPincode: '',
              clientLatitude: null,
              clientLongitude: null,
              clientAddress: '',
              creativeType: 'Image',
              fileName: '',
              fileSize: '',
              previewUrl: '',
              resolution: '',
              duration: '',
              mediaServerUrl: '',
              videoUrl: '',
              selectedFleets: [],
              selectedTargets: [],
              vehicles: 0,
              totalScreens: 0,
              targetingMode: 'Network-wide',
              startDate: getFormattedDate(0),
              startTime: '08:00',
              endDate: getFormattedDate(13),
              endTime: '22:00',
              repeat: 'Daily',
              selectedDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
              dailySlotStart: '08:00',
              dailySlotEnd: '22:00',
              timezone: 'GMT +05:30 India Standard Time',
              budgetType: 'Total Budget',
              budget: 0,
              baseAmount: 0,
              breakdownItems: [],
              paymentMethod: 'UPI / Wallet',
              promoCode: '',
              promoApplied: false,
              qrCode: `VMX-QR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
              qrPlacement: 'Rear Screen',
              qrRedirectUrl: '',
            });
            isSubmittedRef.current = false;
            isSubmittingRef.current = false;
            setSubmitting(false);
            scrollToTop();
          }}
        />
      )}
    </div>
  );
};

export default CreateCampaignPage;
