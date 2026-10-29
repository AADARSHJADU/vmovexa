import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useSearchParams, Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../hooks/useAuth';
import { QRCodeSVG } from 'qrcode.react';
import { useAdvertiserRole } from '../../hooks/advertiser/useAdvertiserRole';
import { useGovernmentRole } from '../../hooks/government/useGovernmentRole';
import { resolveFileUrl } from '../../api/services/upload.service.js';
import { extractYouTubeId, getYouTubeThumbnail } from '../../utils/mediaUtils';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { copyToClipboard } from '../../utils/clipboard';
import { FleetIcons } from '../../components/FleetIcons';
import { RecordOfflinePaymentModal } from '../../components/ui/RecordOfflinePaymentModal';
import {
  IconCheckCircle,
  IconPlay,
  IconPause,
  IconStop,
  IconCreditCard,
  IconShare,
  IconBarChart,
  IconInfo,
  IconUser,
  IconPhone,
  IconMail,
  IconVideo,
  IconDocument,
  IconLink,
  IconBus,
  IconLocation,
  IconCalendar,
  IconClock,
  IconGlobe,
  IconRupee,
  IconQrCode,
  IconDownload,
  IconMessage,
  IconWhatsApp,
  IconSearch,
  IconLightning,
  IconPaperAirplane,
  IconTrash,
  IconCopy,
  IconEdit,
} from '../../components/ui/CampaignIcons';

const statusColors = {
  Running: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 font-bold',
  live: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 font-bold',
  Approved: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 font-bold',
  approved: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 font-bold',
  'Under Review': 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 font-bold',
  pending_approval: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 font-bold',
  Scheduled: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/60 font-bold',
  Paused: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-900/60 font-bold',
  paused: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-900/60 font-bold',
  Completed: 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 font-bold',
  completed: 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 font-bold',
  Draft: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 font-bold',
  draft: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 font-bold',
  rejected: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 font-bold',
};

const getQrTrackingUrl = (code) => {
  if (!code) return '';
  const hostname = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
  return `http://${hostname}:4000/api/v1/qr/${code}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '–';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      const parts = String(dateStr).split('-');
      if (parts.length === 3) {
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric'
        });
      }
      return String(dateStr);
    }
    return d.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  } catch (_) {
    return String(dateStr);
  }
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '–';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  } catch (_) {
    return String(dateStr);
  }
};

export const CampaignDetailsPage = ({ ownerType = 'advertiser' }) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isGov = ownerType === 'government' || location.pathname.includes('/government');

  const adv = useAdvertiserRole();
  const gov = useGovernmentRole();

  const auth = useAuth?.() || {};
  const user = auth.user || adv.user || gov.user;

  const rawCampaigns = isGov ? gov.campaigns : adv.campaigns;
  const rtkActiveCampaign = isGov ? gov.currentCampaign : adv.activeCampaign;
  const mqttStatus = isGov ? gov.mqttStatus : adv.mqttStatus;

  const loadCampaignDetails = isGov ? gov.loadCampaignById : adv.loadCampaignDetails;
  const loadCampaigns = isGov ? gov.loadCampaigns : adv.loadCampaigns;
  const loadMqttStatus = isGov ? gov.loadMqttStatus : adv.loadMqttStatus;

  const submitCampaign = isGov ? gov.updateCampaign : adv.submitCampaign;
  const verifyCampaign = isGov ? (gov.approveCampaign || gov.verifyCampaign) : adv.verifyCampaign;
  const deleteCampaign = isGov ? gov.deleteCampaign : adv.deleteCampaign;
  const startCampaign = isGov ? gov.startCampaign : adv.startCampaign;
  const stopCampaign = isGov ? gov.stopCampaign : adv.stopCampaign;
  const endCampaign = isGov ? gov.endCampaign : adv.endCampaign;
  const sharePaymentLink = isGov ? gov.sharePaymentLink : adv.sharePaymentLink;

  const canSubmitCampaign = isGov ? gov.canSubmitCampaign : adv.canSubmitCampaign;
  const canVerifyCampaign = isGov ? (gov.canVerifyCampaign || gov.canApproveCampaign) : adv.canVerifyCampaign;
  const canPayCampaign = isGov ? gov.canPayCampaign : adv.canPayCampaign;
  const canEditCampaign = isGov ? gov.canEditCampaign : adv.canEditCampaign;
  const canDeleteCampaign = isGov ? gov.canDeleteCampaign : adv.canDeleteCampaign;

  const isSuperAdmin = location.pathname.startsWith('/superadmin') || user?.role === 'ROLE-SUPER-ADMIN' || user?.role?.code === 'ROLE-SUPER-ADMIN' || user?.clearance === 'ROOT';
  const basePath = isSuperAdmin
    ? (isGov ? '/superadmin/government' : '/superadmin/advertiser')
    : (isGov ? '/government' : '/advertiser');

  // Section Tab State from URL query (?tab=...)
  const activeSectionTab = searchParams.get('tab') || 'all';
  const tabsScrollRef = useRef(null);
  const pageTopRef = useRef(null);
  const tabControllerRef = useRef(null);

  const scrollToPageTop = () => {
    try {
      if (pageTopRef.current) {
        pageTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      const scrollableParent = pageTopRef.current?.closest('main') || document.querySelector('main');
      if (scrollableParent) {
        scrollableParent.scrollTo({ top: 0, behavior: 'smooth' });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (_) {}
  };

  const scrollToSectionTop = () => {
    try {
      if (tabControllerRef.current) {
        tabControllerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      const scrollableParent = tabControllerRef.current?.closest('main') || document.querySelector('main');
      if (scrollableParent && tabControllerRef.current) {
        const parentRect = scrollableParent.getBoundingClientRect();
        const targetRect = tabControllerRef.current.getBoundingClientRect();
        const targetScrollTop = scrollableParent.scrollTop + (targetRect.top - parentRect.top) - 8;
        scrollableParent.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' });
      }
    } catch (_) {}
  };

  const setActiveSectionTab = (tabKey) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tabKey === 'all') {
        next.delete('tab');
      } else {
        next.set('tab', tabKey);
      }
      return next;
    }, { replace: true });
  };

  // Scroll to page top on mount or id change
  useEffect(() => {
    scrollToPageTop();
  }, [id]);

  // Scroll to section tabs on activeSectionTab change
  const isFirstTabRender = useRef(true);
  useEffect(() => {
    if (isFirstTabRender.current) {
      isFirstTabRender.current = false;
      return;
    }
    scrollToSectionTop();

    // Center active tab in horizontal scroll
    if (tabsScrollRef.current) {
      const activeBtn = tabsScrollRef.current.querySelector('[data-active="true"]');
      if (activeBtn && typeof activeBtn.scrollIntoView === 'function') {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeSectionTab]);

  const [showShareModal, setShowShareModal] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [sendingSms, setSendingSms] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const isVerifyingRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (id && typeof loadCampaignDetails === 'function') {
      loadCampaignDetails(id).catch(() => {});
    }
    if (typeof loadCampaigns === 'function') {
      loadCampaigns().catch(() => {});
    }
    if (typeof loadMqttStatus === 'function') {
      loadMqttStatus().catch(() => {});
    }
  }, [id, loadCampaignDetails, loadCampaigns, loadMqttStatus]);

  // Determine active campaign source
  const rawCampaign = useMemo(() => {
    if (rtkActiveCampaign && (
      String(rtkActiveCampaign.id) === String(id) ||
      String(rtkActiveCampaign.code).toLowerCase() === String(id).toLowerCase() ||
      String(rtkActiveCampaign.code || '').replace(/[^a-z0-9]/gi, '').toLowerCase() === String(id).replace(/[^a-z0-9]/gi, '').toLowerCase()
    )) {
      return rtkActiveCampaign;
    }
    const rtkList = Array.isArray(rawCampaigns) ? rawCampaigns : (rawCampaigns?.items || rawCampaigns?.rows || []);
    return rtkList.find(c =>
      String(c.id) === String(id) ||
      String(c.code).toLowerCase() === String(id).toLowerCase() ||
      String(c.code || '').replace(/[^a-z0-9]/gi, '').toLowerCase() === String(id).replace(/[^a-z0-9]/gi, '').toLowerCase()
    ) || null;
  }, [rtkActiveCampaign, rawCampaigns, id]);

  const campaign = useMemo(() => {
    if (!rawCampaign) return null;
    const c = rawCampaign;

    let pb = null;
    if (c.payment_breakdown) {
      pb = typeof c.payment_breakdown === 'string'
        ? (() => { try { return JSON.parse(c.payment_breakdown); } catch (_) { return null; } })()
        : c.payment_breakdown;
    }

    const hasPb = Boolean(pb && (pb.totalAmount !== undefined || (Array.isArray(pb.items) && pb.items.length > 0)));
    const baseBudget = hasPb ? (Number(pb.baseAmount ?? c.budget) || 0) : (Number(c.budget) || 0);
    const subtotal = hasPb ? (Number(pb.subtotal ?? pb.baseAmount ?? c.budget) || 0) : baseBudget;
    const gstAmount = hasPb ? (Number(pb.gstAmount ?? 0) || 0) : 0;
    const totalAmount = hasPb ? (Number(pb.totalAmount ?? c.budget) || 0) : (Number(c.budget) || 0);
    const breakdownItems = hasPb && Array.isArray(pb.items) && pb.items.length > 0
      ? pb.items
      : [{ key: 'base_amount', label: 'Base Airtime Broadcast Fee', amount: baseBudget, type: 'base' }];

    // QR details
    const qrObj = (Array.isArray(c.qrCodes) && c.qrCodes[0]) || c.CampaignQrCode || {};
    const qrCode = qrObj.code || c.qr_code || `VMX-QR-${c.code || c.id}`;
    const rawQrRedirect = (qrObj.redirect_url || c.qr_redirect_url || '').trim();
    const isStaticPlaceholder = !rawQrRedirect || /vmovexa\.com\/(promo|c\/)/i.test(rawQrRedirect);
    const qrRedirectUrl = isStaticPlaceholder ? null : rawQrRedirect;
    const qrScans = Number(qrObj.scan_count || c.qr_scans_count || 0);

    // Targets & Routes
    const targetsList = Array.isArray(c.targets) ? c.targets : [];
    const totalScreens = targetsList.reduce((acc, t) => acc + (Number(t.screens_count) || 0), 0);
    const totalVehicles = targetsList.reduce((acc, t) => acc + (Number(t.vehicles_count) || (Array.isArray(t.vehicle_ids) ? t.vehicle_ids.length : 0) || 0), 0);

    // Media assets
    let mediaList = Array.isArray(c.media) && c.media.length > 0
      ? c.media
      : (Array.isArray(c.media_assets) && c.media_assets.length > 0 ? c.media_assets : []);

    if (mediaList.length === 0 && (c.media_url || c.video_url)) {
      mediaList = [{
        file_url: c.media_url || c.video_url,
        media_type: c.media_type || (c.video_url ? 'video' : 'image'),
        resolution: c.resolution || '1080p',
        duration_sec: c.duration_per_play_sec || 15,
      }];
    }

    const normalizedMedia = mediaList.map((m, idx) => {
      const url = m.file_url || m.fileUrl || m.url || '';
      const fullUrl = resolveFileUrl(url);
      const rawType = String(m.media_type || m.mediaType || 'image').toLowerCase();
      const isVideo = rawType === 'video' || /\.(mp4|mov|webm)$/i.test(url);
      const isPdf = rawType === 'pdf' || /\.pdf$/i.test(url);
      const isUrl = rawType === 'url' || /youtube\.com|youtu\.be/i.test(url);
      const type = isVideo ? 'Video' : isPdf ? 'PDF' : isUrl ? 'URL' : 'Image';
      const ytId = isUrl ? extractYouTubeId(url) : null;

      return {
        id: m.id || idx,
        type,
        url: fullUrl || url,
        rawUrl: url,
        name: url.split('/').pop() || `Asset #${idx + 1}`,
        size: m.file_size ? `${(Number(m.file_size) / (1024 * 1024)).toFixed(1)} MB` : (m.fileSize || 'Standard'),
        resolution: m.resolution || '1920 × 1080',
        duration: isVideo ? `${m.duration_sec || 15} sec` : (isPdf ? 'Static PDF' : 'Static Image'),
        durationSec: m.duration_sec || 15,
        ytId,
        thumb: ytId ? getYouTubeThumbnail(ytId) : (type === 'Image' ? (fullUrl || url) : ''),
      };
    });

    const startStr = c.start_date || '';
    const endStr = c.end_date || '';
    let durationDays = Number(c.duration_days) || 14;
    if (!c.duration_days && startStr && endStr) {
      const s = new Date(startStr);
      const e = new Date(endStr);
      const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
      if (diff > 0) durationDays = diff;
    }

    const slotStart = c.broadcast_start_time ? String(c.broadcast_start_time).slice(0, 5) : '08:00';
    const slotEnd = c.broadcast_end_time ? String(c.broadcast_end_time).slice(0, 5) : '22:00';

    const parseMinutes = (t) => {
      if (!t) return 0;
      const parts = String(t).split(':');
      const h = parseInt(parts[0], 10) || 0;
      const m = parseInt(parts[1], 10) || 0;
      return h * 60 + m;
    };

    const startMinutes = parseMinutes(slotStart);
    const endMinutes = parseMinutes(slotEnd);
    let diffMinutes = endMinutes - startMinutes;
    if (diffMinutes <= 0) diffMinutes = 60;

    const dailyHoursNum = +(diffMinutes / 60).toFixed(2);
    const dailyOperatingHoursDisplay = diffMinutes < 60
      ? `${+(diffMinutes / 60).toFixed(1)} Hours / Day (${diffMinutes} Mins)`
      : (diffMinutes % 60 === 0
          ? `${diffMinutes / 60} Hours / Day`
          : `${+(diffMinutes / 60).toFixed(1)} Hours / Day (${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}m)`);

    let activeDays = c.active_days;
    if (typeof activeDays === 'string') {
      try {
        activeDays = JSON.parse(activeDays);
      } catch (_) {}
    }
    if (!Array.isArray(activeDays) || activeDays.length === 0) {
      activeDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    }

    let activeBroadcastDays = durationDays;
    if (startStr && endStr) {
      const [sy, sm, sd] = startStr.split('-').map(Number);
      const [ey, em, ed] = endStr.split('-').map(Number);
      if (sy && ey) {
        const DAY_MAP = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        let count = 0;
        const cur = new Date(sy, sm - 1, sd);
        const end = new Date(ey, em - 1, ed);
        let safety = 0;
        while (cur <= end && safety < 1000) {
          if (activeDays.includes(DAY_MAP[cur.getDay()])) {
            count++;
          }
          cur.setDate(cur.getDate() + 1);
          safety++;
        }
        if (count > 0) activeBroadcastDays = count;
      }
    }

    return {
      raw: c,
      id: c.code || `CMP-${c.id}`,
      rawId: c.id,
      code: c.code || `CMP-${c.id}`,
      name: c.title || c.name || 'Untitled Campaign',
      brandName: c.client_company || c.advertiser?.company_name || c.brand_name || (isGov ? (c.client_name || 'Government Department') : 'Advertiser'),
      status: c.status === 'live' ? 'Running' : c.status === 'pending_approval' ? 'Under Review' : c.status === 'approved' ? 'Approved' : c.status === 'paused' ? 'Paused' : (c.status === 'rejected' ? 'Rejected' : c.status === 'completed' ? 'Completed' : 'Draft'),
      rawStatus: c.status,
      paymentStatus: c.payment_status === 'paid' ? 'Paid' : (c.payment_status === 'pending' ? 'Processing' : 'Unpaid'),
      rawPaymentStatus: c.payment_status,
      paymentToken: c.payment_token || c.id,
      type: c.campaign_type || c.type || 'Commercial DOOH',
      objective: c.objective || 'Brand Awareness & High Reach',
      category: c.category || 'Retail',
      description: c.description || '',
      submittedAt: (c.created_at || c.createdAt) ? formatDateTime(c.created_at || c.createdAt) : '–',
      verifiedAt: (c.verified_at || c.verifiedAt) ? formatDateTime(c.verified_at || c.verifiedAt) : null,
      approvedAt: (c.approved_at || c.approvedAt) ? formatDateTime(c.approved_at || c.approvedAt) : null,
      rejectedAt: (c.rejected_at || c.rejectedAt) ? formatDateTime(c.rejected_at || c.rejectedAt) : null,
      submittedBy: c.creator?.name || c.creator?.email || c.advertiser?.user?.email || c.advertiser?.user?.name || c.created_by_user?.email || 'Operations Staff',
      // Client Details
      clientName: c.client_name || '',
      clientCompany: c.client_company || '',
      clientEmail: c.client_email || '',
      clientPhone: c.client_phone || '',
      clientCity: c.client_city || '',
      clientState: c.client_state || '',
      clientPincode: c.client_pincode || '',
      clientLatitude: c.client_latitude != null ? Number(c.client_latitude) : null,
      clientLongitude: c.client_longitude != null ? Number(c.client_longitude) : null,
      clientAddress: c.client_address || '',
      // Budget & Exact Payment Breakdown
      budget: baseBudget,
      baseBudget,
      subtotal,
      gstAmount,
      totalAmount,
      breakdownItems,
      hasPaymentBreakdown: hasPb,
      budgetType: c.budget_type || 'Total Budget',
      promoCode: c.promo_code || null,
      // Schedule
      startDate: c.start_date || '',
      endDate: c.end_date || '',
      startTime: slotStart,
      endTime: slotEnd,
      startMinutes,
      diffMinutes,
      durationDays,
      activeBroadcastDays,
      repeat: c.frequency || (activeDays.length === 7 ? 'Daily' : (activeDays.length === 2 && activeDays.includes('Sat') && activeDays.includes('Sun') ? 'Weekends' : 'Custom')),
      selectedDays: activeDays,
      dailyOperatingHours: dailyHoursNum,
      dailyOperatingHoursDisplay,
      totalAirtimeHours: Math.round(activeBroadcastDays * dailyHoursNum * 10) / 10,
      timezone: c.timezone || 'GMT +05:30 India Standard Time',
      autoScheduleEnabled: c.auto_schedule_enabled !== false,
      manualPause: Boolean(c.manual_pause),
      scheduleStatus: c.schedule_status || 'awaiting_clearance',
      nextRunAt: c.next_run_at || null,
      dispatchStatus: c.dispatch_status || 'pending',
      lastDispatchCount: Number(c.last_dispatch_count || 0),
      // Targets
      targets: targetsList,
      totalScreens,
      totalVehicles,
      estimatedCommuters: totalScreens * 1200,
      // Creatives
      mediaList: normalizedMedia,
      // QR Code
      qrCode,
      qrRedirectUrl,
      qrScans,
      payment: c.payment || null,
      paymentMode: c.payment?.payment_mode || (c.payment ? 'online' : null),
    };
  }, [rawCampaign]);

  useEffect(() => {
    if (campaign) {
      if (campaign.clientEmail) setClientEmail(campaign.clientEmail);
      if (campaign.clientPhone) setClientPhone(campaign.clientPhone);
    }
  }, [campaign]);

  const isPaymentPending = (campaign?.status === 'Approved' || campaign?.rawStatus === 'approved') && (campaign?.paymentStatus === 'Unpaid' || campaign?.paymentStatus === 'Processing');
  const isPaymentPaid = campaign?.paymentStatus === 'Paid' || campaign?.rawPaymentStatus === 'paid';
  const isLive = campaign?.status === 'Running' || campaign?.rawStatus === 'live';
  const isPaused = campaign?.status === 'Paused' || campaign?.rawStatus === 'paused';
  const isApproved = campaign?.status === 'Approved' || campaign?.rawStatus === 'approved' || isLive || isPaused || isPaymentPaid;
  const totalAmount = campaign?.totalAmount || 0;
  const canSubmit = campaign?.rawStatus === 'draft' && canSubmitCampaign;

  const paymentUrl = campaign ? `${window.location.origin}/campaigns/${campaign.rawId}/pay?token=${campaign.paymentToken || 'token'}` : '';
  const cleanPhoneForWhatsApp = (clientPhone || campaign?.clientPhone || '').replace(/[^0-9]/g, '');
  const formattedWhatsAppPhone = cleanPhoneForWhatsApp.length === 10 ? `91${cleanPhoneForWhatsApp}` : cleanPhoneForWhatsApp;
  const whatsappShareText = encodeURIComponent(
    `Hello ${campaign?.clientName || 'Customer'}, please complete payment of ₹${totalAmount.toLocaleString('en-IN')} for VMOVEXA transit ad campaign "${campaign?.name || 'DOOH Campaign'}". Click here to pay securely: ${paymentUrl}`
  );
  const whatsappShareUrl = formattedWhatsAppPhone
    ? `https://api.whatsapp.com/send?phone=${formattedWhatsAppPhone}&text=${whatsappShareText}`
    : `https://api.whatsapp.com/send?text=${whatsappShareText}`;

  const handleStartCampaign = async () => {
    if (!campaign) return;
    try {
      const res = await startCampaign(campaign.rawId || campaign.id);
      const count = res?.mqttDispatched ?? res?.dataValues?.mqttDispatched;
      if (typeof count === 'number') {
        toast.success(`Campaign started! Dispatched to ${count} device(s) via MQTT`);
      } else {
        toast.success('Campaign started! Ad is now playing on transit fleet displays');
      }
      await loadCampaignDetails(id).catch(() => {});
      await loadCampaigns().catch(() => {});
    } catch (e) {
      toast.error(e?.message || 'Failed to start campaign');
    }
  };

  const handleStopCampaign = async () => {
    if (!campaign) return;
    try {
      await toast.promise(stopCampaign(campaign.rawId || campaign.id), {
        loading: 'Pausing broadcast on transit screens...',
        success: 'Campaign paused! Ad playback halted',
        error: (e) => e?.message || 'Failed to pause campaign',
      });
      await loadCampaignDetails(id).catch(() => {});
      await loadCampaigns().catch(() => {});
    } catch (_) {}
  };

  const handleEndCampaign = async () => {
    if (!campaign) return;
    if (!window.confirm('Are you sure you want to end this campaign? Broadcast will be permanently stopped.')) return;
    try {
      await toast.promise(endCampaign(campaign.rawId || campaign.id), {
        loading: 'Ending campaign broadcast...',
        success: 'Campaign completed and broadcast ended',
        error: (e) => e?.message || 'Failed to end campaign',
      });
      await loadCampaignDetails(id).catch(() => {});
      await loadCampaigns().catch(() => {});
    } catch (_) {}
  };

  const handleDeleteCampaign = async () => {
    if (!campaign) return;
    if (!window.confirm(`Are you sure you want to delete campaign "${campaign.name}"? This action cannot be undone.`)) return;
    try {
      await toast.promise(deleteCampaign(campaign.rawId || campaign.id), {
        loading: 'Deleting campaign...',
        success: 'Campaign deleted successfully',
        error: (e) => e?.message || 'Failed to delete campaign',
      });
      navigate(`${basePath}/campaigns`);
    } catch (_) {}
  };

  const handleSendSms = async () => {
    if (!campaign) return;
    if (!isApproved) {
      toast.error('Campaign must be approved before payment checkout link can be sent.');
      return;
    }
    const phoneToUse = (clientPhone || '').trim();
    if (!phoneToUse) {
      toast.error('Please enter a recipient phone number for SMS.');
      return;
    }
    if (sendingSms) return;
    setSendingSms(true);
    try {
      const res = await sharePaymentLink(campaign.rawId || campaign.id, {
        recipientPhone: phoneToUse,
        channel: 'sms',
      });
      toast.success(res?.message || 'SMS payment checkout link queued in cron job!');
    } catch (e) {
      toast.error(e?.message || 'Failed to queue SMS payment link');
    } finally {
      setSendingSms(false);
    }
  };

  const handleSendEmail = async () => {
    if (!campaign) return;
    if (!isApproved) {
      toast.error('Campaign must be approved before payment invoice can be sent.');
      return;
    }
    const emailToUse = (clientEmail || '').trim();
    if (!emailToUse) {
      toast.error('Please enter a recipient email address.');
      return;
    }
    if (sendingEmail) return;
    setSendingEmail(true);
    try {
      const res = await sharePaymentLink(campaign.rawId || campaign.id, {
        recipientEmail: emailToUse,
        channel: 'email',
      });
      toast.success(res?.message || 'Email invoice & checkout link queued in cron job!');
    } catch (e) {
      toast.error(e?.message || 'Failed to queue Email payment link');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSharePaymentLink = async (channel) => {
    if (channel === 'sms') {
      await handleSendSms();
    } else if (channel === 'email') {
      await handleSendEmail();
    }
  };

  const handleVerifyCampaign = async () => {
    if (!campaign) return;
    if (verifying || isVerifyingRef.current) return;
    isVerifyingRef.current = true;
    setVerifying(true);
    try {
      await toast.promise(verifyCampaign(campaign.rawId || campaign.id), {
        loading: 'Verifying campaign & queuing notifications in background cron...',
        success: 'Campaign approved! Payment link queued in cron job for customer delivery.',
        error: (e) => e?.message || 'Verification failed',
      });
      await Promise.all([
        loadCampaignDetails(id).catch(() => {}),
        loadCampaigns().catch(() => {}),
      ]);
    } catch (_) {
    } finally {
      isVerifyingRef.current = false;
      setVerifying(false);
    }
  };

  const handleSubmit = async () => {
    if (!campaign) return;
    if (submitting || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setSubmitting(true);
    try {
      await toast.promise(submitCampaign(campaign.rawId || campaign.id), {
        loading: 'Submitting campaign for review...',
        success: 'Campaign submitted for review',
        error: (e) => e?.message || 'Failed to submit campaign',
      });
      await Promise.all([
        loadCampaignDetails(id).catch(() => {}),
        loadCampaigns().catch(() => {}),
      ]);
    } catch (_) {
    } finally {
      isSubmittingRef.current = false;
      setSubmitting(false);
    }
  };

  const handleDownloadSvg = () => {
    const svg = document.getElementById('details-campaign-qr-svg');
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
    a.download = `${(campaign.name || 'campaign').replace(/[^a-z0-9]/gi, '_')}_QR.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded dynamic QR Code vector asset');
  };

  const handleShareQr = async () => {
    const destination = getQrTrackingUrl(campaign.qrCode);
    if (navigator.share && window.isSecureContext) {
      navigator.share({
        title: `${campaign.name} QR Code`,
        text: `Scan or visit campaign destination: ${destination}`,
        url: destination,
      }).catch(() => {});
    } else {
      const ok = await copyToClipboard(destination);
      if (ok) {
        toast.success('Campaign QR URL copied to clipboard');
      } else {
        toast.error('Failed to copy QR URL to clipboard');
      }
    }
  };

  // CONSOLIDATED 4 CORE SECTIONS (+ All Details)
  const SECTION_TABS = useMemo(() => {
    if (!campaign) return [];
    return [
      { id: 'all', label: 'All Details', icon: IconInfo, count: null },
      { id: 'overview', label: isGov ? 'Overview & Department' : 'Overview & Client', icon: IconUser, count: campaign.clientName ? (isGov ? 'Dept' : 'Client') : null },
      { id: 'media_fleet', label: 'Creatives & Fleet', icon: IconVideo, count: campaign.totalScreens > 0 ? `${campaign.totalScreens} Displays` : null },
      { id: 'schedule_budget', label: 'Schedule & Budget', icon: IconRupee, count: `₹${Math.round(totalAmount).toLocaleString('en-IN')}` },
      { id: 'payment_qr', label: isGov ? 'Clearance & QR Code' : 'Payment & QR Code', icon: IconCreditCard, count: isPaymentPaid ? 'Paid' : (isGov ? 'Sanction' : 'Checkout') },
    ];
  }, [campaign, isPaymentPaid, totalAmount, isGov]);

  const TAB_KEYS = useMemo(() => ['overview', 'media_fleet', 'schedule_budget', 'payment_qr'], []);
  const currentTabIdx = TAB_KEYS.indexOf(activeSectionTab);
  const prevTabKey = currentTabIdx > 0 ? TAB_KEYS[currentTabIdx - 1] : null;
  const nextTabKey = currentTabIdx >= 0 && currentTabIdx < TAB_KEYS.length - 1 ? TAB_KEYS[currentTabIdx + 1] : null;

  const prevTabObj = SECTION_TABS.find(t => t.id === prevTabKey);
  const nextTabObj = SECTION_TABS.find(t => t.id === nextTabKey);

  if (!campaign) {
    return (
      <div className="w-full max-w-md mx-auto py-20 text-center space-y-4 px-4">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
          <IconSearch className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">{t('campaign_details.not_found_title', 'Campaign Not Found')}</h2>
        <p className="text-sm text-slate-500">{t('campaign_details.not_found_sub', 'The requested campaign does not exist or you do not have permission to view it.')}</p>
        <button
          onClick={() => navigate(`${basePath}/campaigns`)}
          className="mt-4 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs"
        >
          {t('campaign_details.back_to_campaigns', 'Back to Campaigns')}
        </button>
      </div>
    );
  }

  /* ------------------------------------------------------------- */
  /* CONSOLIDATED 4 SECTION MODULES                                */
  /* ------------------------------------------------------------- */

  // 1. Overview & Client Details
  const renderOverviewClientSection = () => (
    <div id="section-overview" className="space-y-5">
      {/* 1A. Campaign Overview & Metadata */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <IconInfo className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">{t('campaign_details.overview_meta', 'Campaign Overview & Metadata')}</h2>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
            {t('campaign_details.step_1_info', 'Step 1 Info')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 text-xs">
          <div>
            <span className="text-slate-400 dark:text-zinc-500 font-medium">{t('campaign_details.campaign_name', 'Campaign Name')}</span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5 break-words">{campaign.name}</p>
          </div>
          <div>
            <span className="text-slate-400 dark:text-zinc-500 font-medium">{t('campaign_details.brand_product', 'Brand / Product')}</span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5 break-words">{campaign.brandName}</p>
          </div>
          <div>
            <span className="text-slate-400 dark:text-zinc-500 font-medium">{t('campaign_details.campaign_type', 'Campaign Type')}</span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5">{campaign.type}</p>
          </div>
          <div>
            <span className="text-slate-400 dark:text-zinc-500 font-medium">{t('campaign_details.strategic_objective', 'Strategic Objective')}</span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5 break-words">{campaign.objective}</p>
          </div>
          <div>
            <span className="text-slate-400 dark:text-zinc-500 font-medium">{t('campaign_details.industry_category', 'Industry Category')}</span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5">{campaign.category}</p>
          </div>
          <div>
            <span className="text-slate-400 dark:text-zinc-500 font-medium">{t('campaign_details.submitted_on', 'Submitted On')}</span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5">{campaign.submittedAt}</p>
          </div>
          <div>
            <span className="text-slate-400 dark:text-zinc-500 font-medium">{t('campaign_details.submitted_by', 'Submitted By')}</span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5 break-words">{campaign.submittedBy}</p>
          </div>
        </div>

        {campaign.description && (
          <div className="pt-2 text-xs">
            <span className="text-slate-400 dark:text-zinc-500 font-medium">{t('campaign_details.brief_desc', 'Campaign Brief / Description:')}</span>
            <p className="text-slate-700 dark:text-zinc-300 font-medium mt-1 bg-slate-50 dark:bg-zinc-800/60 p-3 sm:p-4 rounded-xl border border-slate-100 dark:border-zinc-800 leading-relaxed break-words whitespace-pre-line">
              {campaign.description}
            </p>
          </div>
        )}
      </div>

      {/* 1B. Customer / Client Information */}
      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-white dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900 border border-blue-200/90 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-blue-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <IconUser className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <h2 className="text-xs sm:text-sm font-black text-blue-950 dark:text-white uppercase tracking-wider">{t('campaign_details.customer_info', 'Customer / Client Information')}</h2>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60">
            {t('campaign_details.payment_link_recipient', 'Payment Link Recipient')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 text-xs">
          <div>
            <span className="text-slate-500 dark:text-zinc-400 font-medium">{t('campaign_details.contact_person', 'Contact Person')}</span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5 break-words">{campaign.clientName || '–'}</p>
          </div>
          <div>
            <span className="text-slate-500 dark:text-zinc-400 font-medium">{t('campaign_details.company_name', 'Company Name')}</span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5 break-words">{campaign.clientCompany || '–'}</p>
          </div>
          <div>
            <span className="text-slate-500 dark:text-zinc-400 font-medium">{t('campaign_details.mobile_sms', 'Mobile Phone (SMS Checkout)')}</span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5 flex-wrap">
              <IconPhone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              {campaign.clientPhone ? (
                <a href={`tel:${campaign.clientPhone}`} className="text-blue-700 dark:text-blue-400 hover:underline break-all">
                  {campaign.clientPhone}
                </a>
              ) : '–'}
            </p>
          </div>
          <div>
            <span className="text-slate-500 dark:text-zinc-400 font-medium">{t('campaign_details.email_invoice', 'Email Address (Invoice)')}</span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5 flex-wrap">
              <IconMail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              {campaign.clientEmail ? (
                <a href={`mailto:${campaign.clientEmail}`} className="text-blue-700 dark:text-blue-400 hover:underline break-all" title={campaign.clientEmail}>
                  {campaign.clientEmail}
                </a>
              ) : '–'}
            </p>
          </div>
          <div>
            <span className="text-slate-500 dark:text-zinc-400 font-medium">{t('campaign_details.city_state', 'City & State')}</span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5 break-words">
              {[campaign.clientCity, campaign.clientState].filter(Boolean).join(', ') || '–'}
              {campaign.clientPincode ? ` (${campaign.clientPincode})` : ''}
            </p>
          </div>
          <div>
            <span className="text-slate-500 dark:text-zinc-400 font-medium">{t('campaign_details.billing_gps', 'Billing Address & GPS')}</span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5 break-words leading-relaxed" title={campaign.clientAddress}>
              {campaign.clientAddress || '–'}
            </p>
            {campaign.clientLatitude && campaign.clientLongitude && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${campaign.clientLatitude},${campaign.clientLongitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold mt-1"
              >
                <IconLocation className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>{t('campaign_details.view_map_pin', 'View Map Pin')} ({Number(campaign.clientLatitude).toFixed(4)}, {Number(campaign.clientLongitude).toFixed(4)})</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // 2. Creatives & Fleet Targeting
  const renderMediaFleetSection = () => (
    <div id="section-media-fleet" className="space-y-5">
      {/* 2A. Creative Assets Gallery */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <IconVideo className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">{t('campaign_details.creative_assets', 'Advertisement Creative Assets')}</h2>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/60">
            {campaign.mediaList.length} {t('campaign_details.attached_assets', 'Attached Asset(s)')}
          </span>
        </div>

        {campaign.mediaList.length > 0 ? (
          <div className="space-y-4">
            {campaign.mediaList.map((item, idx) => (
              <div key={item.id || idx} className="p-3.5 sm:p-4 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-white break-all">{item.name}</span>
                    <span className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase">
                      {item.type}
                    </span>
                  </div>
                  <span className="text-slate-500 dark:text-zinc-400 font-medium text-[11px]">
                    {item.resolution} · {item.duration} · {item.size}
                  </span>
                </div>

                {item.type === 'Image' && (
                  <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-zinc-700 flex items-center justify-center p-1">
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full max-h-72 sm:max-h-96 object-contain rounded-lg"
                    />
                  </div>
                )}

                {item.type === 'Video' && (
                  <div className="rounded-xl overflow-hidden bg-black border border-slate-200 dark:border-zinc-700">
                    <video
                      controls
                      className="w-full max-h-72 sm:max-h-96"
                      src={item.url}
                    />
                  </div>
                )}

                {item.type === 'PDF' && (
                  <div className="p-6 bg-white dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700 flex flex-col items-center justify-center text-center space-y-2">
                    <IconDocument className="w-12 h-12 text-rose-500 mx-auto" />
                    <p className="text-xs font-bold text-slate-800 dark:text-white break-all">{item.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">{item.size} {t('campaign_details.vector_doc_displays', '· Vector Document for Transit Displays')}</p>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      <span>{t('campaign_details.open_pdf', 'Open PDF in New Tab')}</span>
                      <FleetIcons.ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {item.type === 'URL' && (
                  <div className="p-4 bg-white dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <IconLink className="w-6 h-6 text-blue-500 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</p>
                        <p className="text-[11px] text-blue-600 dark:text-blue-400 font-mono break-all">{item.rawUrl}</p>
                      </div>
                    </div>
                    <a
                      href={item.rawUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-300 text-center shrink-0"
                    >
                      {t('campaign_details.visit_link', 'Visit Link ↗')}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-center text-xs text-slate-500 dark:text-zinc-400">
            {t('campaign_details.no_assets_attached', 'No creative assets attached for this campaign.')}
          </div>
        )}
      </div>

      {/* 2B. Transit Corridors & Screen Inventory */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <IconBus className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">{t('campaign_details.transit_routes', 'Booked Transit Routes & Screen Inventory')}</h2>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/60">
            {campaign.totalVehicles} {t('common.buses', 'Buses')} · {campaign.totalScreens} {t('common.screens', 'Screens')}
          </span>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center">
          <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-200 dark:border-zinc-700">
            <p className="text-sm font-black text-slate-900 dark:text-white">{campaign.targets.length} {t('common.corridors', 'Corridors')}</p>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase mt-0.5">{t('campaign_details.selected_routes', 'Selected Routes')}</p>
          </div>
          <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-200 dark:border-zinc-700">
            <p className="text-sm font-black text-blue-700 dark:text-blue-400">{campaign.totalVehicles} {t('common.buses', 'Buses')}</p>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase mt-0.5">{t('campaign_details.transit_fleet', 'Transit Fleet')}</p>
          </div>
          <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-200 dark:border-zinc-700">
            <p className="text-sm font-black text-purple-700 dark:text-purple-400">{campaign.totalScreens} {t('campaign_details.displays', 'Displays')}</p>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase mt-0.5">{t('campaign_details.dooh_screens', 'DOOH Screens')}</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
            <p className="text-sm font-black text-emerald-700 dark:text-emerald-400">~{campaign.estimatedCommuters.toLocaleString()}</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase mt-0.5">{t('campaign_details.daily_commuters', 'Daily Commuters')}</p>
          </div>
        </div>

        {/* Live MQTT Transit Network Status */}
        {mqttStatus && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-900 dark:bg-zinc-950 text-white rounded-xl text-xs border dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${(mqttStatus.mqttConnected ?? mqttStatus.brokerConnected) ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="font-bold">
                {t('campaign_details.transit_telemetry_net', 'Transit Telemetry Network:')} {(mqttStatus.mqttConnected ?? mqttStatus.brokerConnected) ? 'Active & Ready' : 'Connecting...'}
              </span>
              <span className="text-slate-500 dark:text-zinc-600">|</span>
              <span className="text-slate-300 dark:text-zinc-400">
                {t('campaign_details.connected_bus_displays', 'Connected Bus Displays:')} <strong className="text-emerald-300 dark:text-emerald-400">{mqttStatus.onlineEdgeDevices ?? mqttStatus.onlineDevices ?? 0}</strong> / {mqttStatus.totalEdgeDevices ?? mqttStatus.totalDevices ?? 0}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono self-start sm:self-auto">
              {t('campaign_details.broker', 'Broker:')} {mqttStatus.brokerUrl || 'mqtt://127.0.0.1:1883'}
            </span>
          </div>
        )}

        {/* Booked Routes */}
        {campaign.targets.length > 0 ? (
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{t('campaign_details.assigned_corridors', 'Assigned Corridors:')}</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
              {campaign.targets.map((target, idx) => (
                <details key={target.id || idx} className="p-3 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-900 dark:bg-zinc-950 text-white shrink-0 border dark:border-zinc-800">
                        {target.route?.code || `RTE-${target.route_id || idx + 1}`}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white truncate">
                        {target.route?.name || target.route_name || target.fleet_name || 'City Route'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 flex items-center gap-1.5 flex-wrap">
                      <IconLocation className="w-3 h-3 text-slate-400 dark:text-zinc-500 shrink-0" />
                      <span>{target.city || target.route?.start_point || 'Transit Route'}</span>
                      <span>·</span>
                      <span>{t('campaign_details.operator', 'Operator:')} <strong className="text-slate-700 dark:text-zinc-300">{target.fleet_name}</strong></span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-black text-blue-700 dark:text-blue-400 text-xs">
                      {target.vehicles_count || (Array.isArray(target.vehicle_ids) ? target.vehicle_ids.length : 0) || 1} {t('common.buses', 'Buses')}
                    </span>
                    <p className="text-[10px] text-purple-700 dark:text-purple-400 font-bold">
                      {target.screens_count || 1} {t('common.screens', 'Screens')}
                    </p>
                  </div>
                  </summary>
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-zinc-700 space-y-2">
                    {(target.vehicles || []).map((vehicle) => {
                      const screens = (target.screens || []).filter((screen) => Number(screen.vehicle_id) === Number(vehicle.id) || Number(screen.edge_device_id) === Number(vehicle.edge_device_id));
                      return (
                        <div key={vehicle.id} className="rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 p-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-black text-slate-900 dark:text-white">{vehicle.bus_number || `Bus #${vehicle.id}`}</span>
                            <span className={`text-[10px] font-bold ${vehicle.edgeDevice?.status === 'online' ? 'text-emerald-600' : 'text-slate-500'}`}>Edge: {vehicle.edgeDevice?.box_id || 'Not linked'} · {vehicle.edgeDevice?.status || 'offline'}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {screens.map((screen) => <span key={screen.id} className="px-2 py-1 rounded-md bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[10px] font-bold">{screen.code} · {screen.type} · {screen.status}</span>)}
                            {screens.length === 0 && <span className="text-[10px] text-amber-600 dark:text-amber-400">{t('advertiser.campaigns.whole_bus_note')}</span>}
                          </div>
                        </div>
                      );
                    })}
                    {!(target.vehicles || []).length && <span className="text-[10px] text-slate-500">{t('advertiser.campaigns.vehicle_details_unavailable')}</span>}
                  </div>
                </details>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 dark:text-zinc-500 italic">{t('campaign_details.no_routes', 'No specific route targets recorded.')}</p>
        )}
      </div>
    </div>
  );

  // 3. Schedule, Airtime & Budget Invoice
  const renderScheduleBudgetSection = () => (
    <div id="section-schedule-budget" className="space-y-5">
      {/* 3A. Broadcast Schedule & Airtime Operating Window */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <IconCalendar className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">{t('campaign_details.broadcast_schedule', 'Broadcast Schedule & Airtime Operating Window')}</h2>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/60">
            <IconClock className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>{campaign.durationDays} {t('common.days', 'Days')} ({campaign.dailyOperatingHoursDisplay})</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
          <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-200 dark:border-zinc-700">
            <span className="text-slate-400 dark:text-zinc-500 font-medium">{t('campaign_details.broadcast_start', 'Broadcast Start')}</span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5">{formatDate(campaign.startDate)}</p>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">{campaign.startTime}</p>
          </div>
          <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-200 dark:border-zinc-700">
            <span className="text-slate-400 dark:text-zinc-500 font-medium">{t('campaign_details.broadcast_end', 'Broadcast End')}</span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5">{formatDate(campaign.endDate)}</p>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">{campaign.endTime}</p>
          </div>
          <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-200 dark:border-zinc-700">
            <span className="text-slate-400 dark:text-zinc-500 font-medium">{t('campaign_details.repeat_days', 'Repeat & Active Days')}</span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5">{campaign.repeat}</p>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium truncate" title={campaign.selectedDays.join(', ')}>
              {campaign.selectedDays.join(', ')} ({campaign.selectedDays.length} of 7 days)
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-200 dark:border-zinc-700">
            <span className="text-slate-400 dark:text-zinc-500 font-medium">{t('campaign_details.daily_slot_hours', 'Daily Slot Hours')}</span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5">{campaign.startTime} – {campaign.endTime}</p>
            <p className="text-[10px] text-blue-700 dark:text-blue-400 font-bold">{campaign.dailyOperatingHoursDisplay}</p>
          </div>
        </div>

        {/* 24-Hour Visual Airtime Bar */}
        <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-zinc-400">
            <span>00:00 ({t('common.night', 'Night')})</span>
            <span className="text-blue-700 dark:text-blue-400 font-bold text-center">{t('campaign_details.active_slot', 'Active Slot:')} {campaign.startTime} {t('common.to', 'to')} {campaign.endTime} ({campaign.dailyOperatingHoursDisplay})</span>
            <span>24:00 ({t('common.midnight', 'Midnight')})</span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden flex relative">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full"
              style={{
                marginLeft: `${Math.max(0, (campaign.startMinutes / 1440) * 100)}%`,
                width: `${Math.max(1, Math.min(100, (campaign.diffMinutes / 1440) * 100))}%`
              }}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs">
          <span className="text-slate-600 dark:text-zinc-300 font-medium flex items-center gap-1.5">
            <IconGlobe className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 shrink-0" />
            <span>{t('campaign_details.timezone', 'Timezone:')} <strong className="text-slate-800 dark:text-white">{campaign.timezone}</strong></span>
          </span>
          <span className="text-slate-600 dark:text-zinc-300 font-medium">
            {t('common.total_airtime', 'Total Airtime:')} <strong className="text-slate-800 dark:text-white">~{campaign.totalAirtimeHours} {t('common.hours', 'Hours')}</strong> ({campaign.activeBroadcastDays} {t('campaign_create.active_days', 'active days')})
          </span>
        </div>
      </div>

      {/* 3B. Budget & Tax Invoice Breakdown */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <IconRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">{t('campaign_details.budget_breakdown', 'Campaign Budget & Tax Invoice Breakdown')}</h2>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60">
            {t('campaign_create.total_payable', 'Total Payable:')} ₹ {campaign.totalAmount.toLocaleString('en-IN')}
          </span>
        </div>

        {(() => {
          const baseItem = campaign.breakdownItems?.find(it => it.type === 'base' || it.key === 'base_amount');
          const nonBaseItems = (campaign.breakdownItems || []).filter(it => it !== baseItem && it.key !== 'base_amount' && it.type !== 'base');

          return (
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${nonBaseItems.length === 1 ? 'lg:grid-cols-3' : (nonBaseItems.length === 2 ? 'lg:grid-cols-4' : (nonBaseItems.length > 2 ? 'md:grid-cols-3 lg:grid-cols-4' : ''))} gap-2.5 sm:gap-3 text-xs`}>
              {/* Card 1: Base Fee / Campaign Base Budget */}
              <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-zinc-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-400 truncate block" title={baseItem?.label || 'Campaign Base Budget'}>
                  {baseItem?.label || t('campaign_create.base_budget', 'Campaign Base Budget')}
                </span>
                <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                  ₹ {campaign.baseBudget.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">{t('advertiser.campaigns.total_flight_investment')}</p>
              </div>

              {/* Dynamic Non-Base Item Cards from DB (e.g. 30 min tax, addons, discounts) */}
              {nonBaseItems.map((item, idx) => {
                const amountVal = Number(item.amount || 0);
                const isDiscount = item.type === 'discount' || amountVal < 0;
                const sign = isDiscount ? '- ' : '+ ';
                return (
                  <div key={item.key || item.id || idx} className="bg-slate-50 dark:bg-zinc-800/60 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-zinc-700">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-400 truncate block" title={item.label}>
                      {item.label}
                    </span>
                    <p className={`text-base sm:text-lg font-black mt-0.5 font-mono ${isDiscount ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                      {sign}₹ {Math.abs(amountVal).toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                      {item.type === 'discount' ? 'Special Discount / Waiver' : (item.type === 'tax' ? 'Statutory Tax / Surcharge' : 'Addon & Service Fee')}
                    </p>
                  </div>
                );
              })}

              {/* Fallback Taxes Card if no itemized list but positive difference exists */}
              {nonBaseItems.length === 0 && Math.abs(campaign.totalAmount - campaign.baseBudget) > 0 && (
                <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-zinc-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-400">
                    Taxes & Surcharges
                  </span>
                  <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                    + ₹ {(campaign.totalAmount - campaign.baseBudget).toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">{t('advertiser.campaigns.addons_gst')}</p>
                </div>
              )}

              {/* Final Card: Total Payable */}
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 sm:p-4 rounded-xl border-2 border-emerald-300 dark:border-emerald-800/80">
                <span className="text-emerald-700 dark:text-emerald-400 font-black uppercase text-[10px]">{t('campaign_create.total_payable', 'Total Payable')}</span>
                <p className="text-base sm:text-xl font-black text-emerald-800 dark:text-emerald-300 mt-0.5 font-mono">
                  ₹ {campaign.totalAmount.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">{t('campaign_create.client_checkout_amount', 'Client Checkout Amount')}</p>
              </div>
            </div>
          );
        })()}

        {/* Itemized Billing Ledger Table from saved payment breakdown */}
        <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl p-3.5 space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 tracking-wider block">{t('advertiser.campaigns.itemized_billing_ledger')}</span>
          <div className="space-y-1.5 text-xs">
            {campaign.breakdownItems.map((item, idx) => {
              const amountVal = Number(item.amount || 0);
              const isBase = item.type === 'base';
              const isDiscount = item.type === 'discount' || amountVal < 0;
              const isTax = item.type === 'tax';
              const signPrefix = isDiscount ? '- ' : (isBase ? '' : '+ ');
              const colorClass = isDiscount ? 'text-emerald-700 dark:text-emerald-400' : (isTax ? 'text-amber-700 dark:text-amber-400' : 'text-slate-800 dark:text-zinc-200');
              return (
                <div key={idx} className={`flex justify-between items-center ${colorClass}`}>
                  <span>{item.label}</span>
                  <span className="font-mono font-bold">{signPrefix}₹ {Math.abs(amountVal).toLocaleString('en-IN')}</span>
                </div>
              );
            })}
            <div className="border-t border-slate-200 dark:border-zinc-700 pt-2 flex justify-between font-black text-slate-900 dark:text-white text-sm">
              <span>{t('advertiser.campaigns.grand_total_checkout')}</span>
              <span className="font-mono text-emerald-700 dark:text-emerald-400 text-base">₹ {campaign.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 4. Payment Checkout, QR Code & Lifecycle
  const renderPaymentQrSection = () => (
    <div id="section-payment-qr" className="space-y-5">
      {/* 4A. {t('campaign_details.customer_payment_checkout_title', 'Customer Payment Checkout & Link Dispatch')} */}
      <div className="bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900 border-2 border-indigo-200/80 dark:border-zinc-700 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 dark:bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <IconShare className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{t('campaign_details.customer_payment_checkout_title', 'Customer Payment Checkout & Link Dispatch')}</h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                {t('campaign_details.send_secure_direct_checkout_desc', 'Send secure direct checkout link to client without requiring account login')}
              </p>
            </div>
          </div>

          <span
            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border self-start sm:self-auto ${
              isPaymentPaid
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60'
                : !isApproved
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/60'
                : isPaymentPending
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/60 animate-pulse'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
            }`}
          >
            {isPaymentPaid
              ? t('campaign_details.payment_settled_badge', '● Payment Settled')
              : !isApproved
              ? '● Approval Pending (Payment Locked)'
              : `${t('campaign_details.awaiting_payment_badge', 'Awaiting Payment:')} ₹${totalAmount.toLocaleString('en-IN')}`}
          </span>
        </div>

        {isPaymentPaid ? (
          <div className="space-y-3">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-emerald-900 dark:text-emerald-300 font-bold">
                <IconCheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{t('campaign_details.payment_of_prefix', 'Payment of')} ₹{totalAmount.toLocaleString('en-IN')} {t('campaign_details.payment_cleared_ready', 'has been cleared. Campaign is ready for transit broadcast launch!')}</span>
              </div>
              {!isLive && !isPaused && (
                <button
                  type="button"
                  onClick={handleStartCampaign}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-2xs shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <IconPlay className="w-3.5 h-3.5 text-white" />
                  <span>{t('campaign_details.launch_live', 'Launch Live')}</span>
                </button>
              )}
            </div>

            {/* Offline Settlement Details Card */}
            {(campaign.payment?.payment_mode === 'offline' || campaign.paymentMode === 'offline') && (
              <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-xs space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 dark:border-amber-900/40 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="font-bold text-amber-950 dark:text-amber-200">
                      Settled via Offline Mode: <span className="uppercase text-amber-700 dark:text-amber-300">{campaign.payment?.offline_method || 'Manual Instrument'}</span>
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-amber-900 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-900/40 px-2 py-0.5 rounded">
                    Ref: {campaign.payment?.reference_number || campaign.payment?.cheque_number || campaign.payment?.utr_number || 'N/A'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 dark:text-zinc-400 pt-1">
                  {campaign.payment?.bank_name && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('advertiser.campaigns.bank')}</span>
                      <span className="font-semibold text-slate-800 dark:text-zinc-200">{campaign.payment.bank_name}</span>
                    </div>
                  )}
                  {campaign.payment?.cheque_date && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('advertiser.campaigns.cheque_date')}</span>
                      <span className="font-semibold text-slate-800 dark:text-zinc-200">{formatDate(campaign.payment.cheque_date)}</span>
                    </div>
                  )}
                  {campaign.payment?.collector?.name && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('advertiser.campaigns.collected_by')}</span>
                      <span className="font-semibold text-slate-800 dark:text-zinc-200">{campaign.payment.collector.name}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('advertiser.campaigns.settled_on')}</span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">{formatDateTime(campaign.payment?.paid_at || campaign.payment?.collected_at)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : !isApproved ? (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3 text-xs text-amber-800 dark:text-amber-200">
            <IconInfo className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-amber-900 dark:text-amber-100 uppercase tracking-wider">{t('advertiser.campaigns.approval_required')}</h4>
              <p className="leading-relaxed">
                This campaign is currently <strong className="uppercase font-bold">{campaign?.rawStatus?.replace('_', ' ') || 'Pending Approval'}</strong>. Customer payment checkout links and payment processing are locked until the campaign is reviewed and approved by Super Admin.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Public Checkout Link Box with 1-Click Copy */}
            <div className="space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <span className="font-bold text-slate-700 dark:text-zinc-300">{t('campaign_details.public_checkout_url', 'Public Customer Checkout URL:')}</span>
                <span className="text-[10px] text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/60 font-medium self-start sm:self-auto">
                  {t('campaign_details.public_access_token_badge', 'Public Access · Secured by Token')}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 bg-white dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700 shadow-2xs">
                <input
                  type="text"
                  readOnly
                  value={paymentUrl}
                  className="flex-1 min-w-0 bg-transparent border-none text-[11px] font-mono text-blue-700 dark:text-blue-400 focus:outline-none break-all select-all px-1 py-1"
                />
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await copyToClipboard(paymentUrl);
                    if (ok) {
                      toast.success('Payment checkout link copied to clipboard!');
                    } else {
                      toast.error('Failed to copy link to clipboard');
                    }
                  }}
                  className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-2xs cursor-pointer active:scale-[0.98]"
                >
                  <IconCopy className="w-3.5 h-3.5 text-white shrink-0" />
                  <span className="whitespace-nowrap">{t('campaign_details.copy_link', 'Copy Link')}</span>
                </button>
              </div>
            </div>

            {/* Interactive Quick Dispatch Rows */}
            {!isPaymentPaid ? (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {/* SMS Dispatch */}
                  <div className="p-3.5 bg-white dark:bg-zinc-800/80 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5">
                        <IconPhone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{t('campaign_details.send_sms_checkout', 'Send SMS Checkout Link')}</span>
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="tel"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        disabled={sendingSms || !clientPhone}
                        onClick={handleSendSms}
                        className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        {sendingSms ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                            <span>{t('campaign_details.sending_sms', 'Sending SMS...')}</span>
                          </>
                        ) : (
                          <>
                            <IconMessage className="w-3.5 h-3.5 text-white" />
                            <span>{t('campaign_details.send_sms_btn', 'Send SMS')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Email Dispatch */}
                  <div className="p-3.5 bg-white dark:bg-zinc-800/80 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5">
                        <IconMail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>{t('campaign_details.send_email_invoice', 'Send Email Invoice & Link')}</span>
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="client@company.com"
                        className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        disabled={sendingEmail || !clientEmail}
                        onClick={handleSendEmail}
                        className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        {sendingEmail ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                            <span>{t('campaign_details.sending_email', 'Sending Email...')}</span>
                          </>
                        ) : (
                          <>
                            <IconMail className="w-3.5 h-3.5 text-white" />
                            <span>{t('campaign_details.send_email_btn', 'Send Email')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-2.5 pt-2">
                  <a
                    href={whatsappShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-xs transition-colors text-center cursor-pointer"
                  >
                    <IconWhatsApp className="w-4 h-4 text-white" />
                    <span>{t('campaign_details.share_whatsapp', 'Share Directly via WhatsApp')}</span>
                  </a>
                </div>

                {/* Offline Payment Recording Section */}
                <div className="pt-4 mt-3 border-t border-slate-100 dark:border-zinc-800">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 overflow-hidden">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-amber-950 dark:text-amber-200">
                          Received payment via Cash, Cheque, or Direct Bank Transfer?
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
                          OFFLINE MODE
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1 break-words">
                        Record instrument reference (Cheque No, UTR, DD, Cash receipt) to mark campaign paid and issue official invoice.
                      </p>
                    </div>
                    <Link
                      to={`${basePath}/campaigns/${campaign.rawId || campaign.id}/record-payment`}
                      className="w-full sm:w-auto lg:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer text-center active:scale-[0.98]"
                    >
                      <FleetIcons.Money className="w-4 h-4 text-white shrink-0" />
                      <span className="whitespace-nowrap">{isGov ? 'Record Treasury / Sanction' : 'Record Offline Payment'}</span>
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* 4B. Dynamic QR Code Identity */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <IconQrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">{t('campaign_details.qr_identity', 'Dynamic QR Code Identity')}</h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 text-[10px] font-bold">
            ● {t('campaign_details.live_attribution_engine', 'Live Attribution Engine')}
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-5 p-4 sm:p-5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700 rounded-2xl overflow-hidden">
          <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl shadow-xs border border-slate-200 dark:border-zinc-700 shrink-0">
            <QRCodeSVG
              id="details-campaign-qr-svg"
              value={getQrTrackingUrl(campaign.qrCode)}
              size={130}
              level="H"
              includeMargin={true}
              className="w-32 h-32"
            />
          </div>

          <div className="space-y-2 text-xs flex-1 text-center md:text-left w-full min-w-0">
            <div>
              <span className="text-slate-400 dark:text-zinc-500 font-medium">{t('campaign_details.qr_code_id', 'Unique QR Code ID:')}</span>
              <div className="font-mono text-sm font-black text-slate-900 dark:text-white mt-0.5 break-all">
                {campaign.qrCode}
              </div>
            </div>

            <div>
              <span className="text-slate-400 dark:text-zinc-500 font-medium">{t('campaign_details.gateway_redirect', 'Gateway Redirect Link:')}</span>
              <p className="font-mono text-blue-600 dark:text-blue-400 font-semibold break-all mt-0.5" title={campaign.qrRedirectUrl}>
                {getQrTrackingUrl(campaign.qrCode)}
              </p>
            </div>

            {campaign.qrRedirectUrl && (
              <div>
                <span className="text-slate-400 dark:text-zinc-500 font-medium">{t('advertiser.campaigns.destination_link')}</span>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap justify-center sm:justify-start">
                  <span className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold break-all bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    {campaign.qrRedirectUrl}
                  </span>
                  <a
                    href={campaign.qrRedirectUrl.startsWith('http') ? campaign.qrRedirectUrl : `https://${campaign.qrRedirectUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline inline-flex items-center gap-1"
                  >
                    Test Link ↗
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
              <div className="p-2 px-3 bg-white dark:bg-zinc-800 rounded-lg border border-slate-200 dark:border-zinc-700 text-center">
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium uppercase">{t('campaign_details.total_scans', 'Total Scans')}</span>
                <p className="text-base font-black text-emerald-700 dark:text-emerald-400">{campaign.qrScans.toLocaleString()}</p>
              </div>
              <div className="p-2 px-3 bg-white dark:bg-zinc-800 rounded-lg border border-slate-200 dark:border-zinc-700 text-center">
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium uppercase">{t('campaign_details.attribution_status', 'Attribution Status')}</span>
                <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">{t('campaign_details.gps_iot_active', 'GPS & IoT Active')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleShareQr}
            className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-300 transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <IconShare className="w-3.5 h-3.5 text-slate-600 dark:text-zinc-400 shrink-0" />
            <span>{t('campaign_details.share_qr_link', 'Share QR Link')}</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadSvg}
            className="py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-xs font-bold text-white transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <IconDownload className="w-3.5 h-3.5 text-white shrink-0" />
            <span>{t('campaign_details.download_svg', 'Download SVG')}</span>
          </button>
        </div>
      </div>

      {/* 4C. {t('campaign_details.campaign_lifecycle_track', 'Campaign Lifecycle & Verification Track')} */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-zinc-800 pb-3">
          {t('campaign_details.campaign_lifecycle_track', 'Campaign Lifecycle & Verification Track')}
        </h2>
        <div className="overflow-x-auto pb-4 pt-1">
          <div className="min-w-[550px] flex items-center justify-between text-center relative px-4">
            <div className="absolute left-6 right-6 top-3 h-0.5 bg-slate-200 dark:bg-zinc-800 -z-0" />
            {[
              { label: 'Submitted', date: campaign.submittedAt, done: true },
              {
                label: 'Under Review',
                date: campaign.verifiedAt || (campaign.status === 'Under Review' ? 'In Progress' : 'Completed'),
                done: campaign.status !== 'Draft',
                isCurrent: campaign.status === 'Under Review',
              },
              {
                label: 'Approved',
                date: campaign.approvedAt || (['Approved', 'Running', 'Paused', 'Completed'].includes(campaign.status) ? 'Passed' : 'Pending'),
                done: ['Approved', 'Running', 'Paused', 'Completed'].includes(campaign.status),
              },
              {
                label: 'Payment',
                date: campaign.paymentStatus === 'Paid' ? 'Settled' : 'Pending',
                done: campaign.paymentStatus === 'Paid',
                isCurrent: campaign.status === 'Approved' && campaign.paymentStatus !== 'Paid',
              },
              {
                label: 'Live Broadcast',
                date: campaign.status === 'Running' ? 'Active' : (campaign.status === 'Completed' ? 'Finished' : 'Waiting Launch'),
                done: ['Running', 'Completed'].includes(campaign.status),
                isCurrent: campaign.status === 'Running',
              },
              {
                label: 'Completed',
                date: campaign.status === 'Completed' ? 'Finished' : 'Future',
                done: campaign.status === 'Completed',
              },
            ].map(step => (
              <div key={step.label} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    step.done
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : step.isCurrent
                      ? 'bg-amber-500 text-white ring-4 ring-amber-100 dark:ring-amber-950 animate-pulse'
                      : 'bg-white dark:bg-zinc-900 border-2 border-slate-300 dark:border-zinc-700 text-slate-400 dark:text-zinc-500'
                  }`}
                >
                  {step.done ? <IconCheckCircle className="w-3.5 h-3.5 text-white" /> : step.isCurrent ? <IconLightning className="w-3 h-3 text-white" /> : ''}
                </div>
                <span className={`text-[11px] font-bold mt-1.5 ${step.isCurrent ? 'text-amber-700 dark:text-amber-400 font-black' : (step.done ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-zinc-500')}`}>
                  {step.label}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium max-w-[80px] truncate" title={step.date}>
                  {step.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div ref={pageTopRef} className="w-full space-y-4 sm:space-y-6 pb-16 px-1 sm:px-0">

      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        {/* Left: Breadcrumb + Title + Badges */}
        <div className="min-w-0">
          <Breadcrumb
            items={[
              { label: 'Dashboard', to: `${basePath}/dashboard` },
              { label: 'Campaigns', to: `${basePath}/campaigns` },
              { label: campaign.code || campaign.name }
            ]}
            className="mb-2"
          />
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-zinc-100 tracking-tight break-words">{campaign.name}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${statusColors[campaign.status] || 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
              {campaign.status}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-mono text-xs font-bold border border-slate-200 dark:border-zinc-700 shrink-0">
              {campaign.code}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1 truncate max-w-2xl">
            {isGov ? 'Department / Ministry:' : t('campaign_details.brand_label', 'Brand:')} <strong className="text-slate-800 dark:text-zinc-200">{campaign.brandName}</strong>
            {campaign.clientName ? ` · ${isGov ? 'Nodal Contact' : 'Client'}: ${campaign.clientName} (${campaign.clientCompany || (isGov ? 'Government Department' : 'External')})` : ''}
          </p>
        </div>

        {/* Right: Responsive Action Buttons */}
        <div className="w-full lg:w-auto shrink-0 flex flex-wrap items-center gap-2">
          {/* Prominent Primary Call-to-Action */}
          {(canVerifyCampaign || isSuperAdmin) && (campaign.rawStatus === 'pending_approval' || campaign.rawStatus === 'draft') && (
            <button
              type="button"
              disabled={verifying}
              onClick={handleVerifyCampaign}
              className="h-10 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98] cursor-pointer"
            >
              {verifying ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                  <span>{t('campaign_details.verifying_approving', 'Verifying & Approving...')}</span>
                </>
              ) : (
                <>
                  <IconCheckCircle className="w-4 h-4 text-white shrink-0" />
                  <span>{isGov ? t('campaign_details.approve_broadcast', 'Approve Broadcast') : t('campaign_details.verify_approve', 'Verify & Approve Campaign')}</span>
                </>
              )}
            </button>
          )}

          {canSubmit && (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98] cursor-pointer"
            >
              {submitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                  <span>{t('campaign_details.submitting', 'Submitting...')}</span>
                </>
              ) : (
                <>
                  <IconPaperAirplane className="w-4 h-4 text-white shrink-0" />
                  <span>{t('campaign_details.submit_review', 'Submit for Review')}</span>
                </>
              )}
            </button>
          )}

          {isLive && (
            <button
              type="button"
              onClick={handleStopCampaign}
              className="h-10 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-all inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 active:scale-[0.98] cursor-pointer"
            >
              <IconPause className="w-4 h-4 text-white shrink-0" />
              <span>{t('campaign_details.pause_broadcast', 'Pause Ad Broadcast')}</span>
            </button>
          )}

          {isPaused && (
            <button
              type="button"
              onClick={handleStartCampaign}
              className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 active:scale-[0.98] cursor-pointer"
            >
              <IconPlay className="w-4 h-4 text-white shrink-0" />
              <span>{t('campaign_details.resume_broadcast', 'Resume Automatic Schedule')}</span>
            </button>
          )}

          {isPaymentPaid && !isLive && !isPaused && (
            <div className="h-10 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold inline-flex items-center gap-2">
              <IconClock className="w-4 h-4" />
              <span>Automatic schedule: {campaign.scheduleStatus}{campaign.nextRunAt ? ` · Next ${new Date(campaign.nextRunAt).toLocaleString()}` : ''}</span>
            </div>
          )}

          {isPaymentPending && (
            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="h-10 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 active:scale-[0.98] cursor-pointer"
            >
              <IconShare className="w-3.5 h-3.5 text-white shrink-0" />
              <span>{t('campaign_details.share_link', 'Share Link')}</span>
            </button>
          )}

          {(isLive || isPaused) && (
            <button
              type="button"
              onClick={handleEndCampaign}
              className="h-10 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-xs transition-all inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 active:scale-[0.98] cursor-pointer"
            >
              <IconStop className="w-3.5 h-3.5 text-white shrink-0" />
              <span>{t('campaign_details.end_ad', 'End Ad')}</span>
            </button>
          )}

          {(canEditCampaign || isSuperAdmin) && ['draft', 'pending_approval', 'rejected'].includes(campaign.rawStatus) && (
            <button
              type="button"
              onClick={() => navigate(`${basePath}/campaigns/create?edit=${campaign.rawId || campaign.id}`)}
              className="h-10 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold shadow-xs transition-all inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 active:scale-[0.98] cursor-pointer"
            >
              <IconEdit className="w-3.5 h-3.5 text-slate-600 dark:text-zinc-400 shrink-0" />
              <span>{t('common.edit', 'Edit')}</span>
            </button>
          )}

          {(canDeleteCampaign || isSuperAdmin) && ['draft', 'pending_approval', 'rejected'].includes(campaign.rawStatus) && (
            <button
              type="button"
              onClick={handleDeleteCampaign}
              className="h-10 px-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-xs font-bold shadow-xs transition-all inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 active:scale-[0.98] cursor-pointer"
            >
              <IconTrash className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{t('common.delete', 'Delete')}</span>
            </button>
          )}

          <Link
            to={`${basePath}/campaigns/${campaign.id}/analytics`}
            className="h-10 px-3.5 rounded-xl bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white text-xs font-bold border border-transparent dark:border-zinc-700 shadow-xs transition-all inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 active:scale-[0.98]"
          >
            <IconBarChart className="w-3.5 h-3.5 text-white shrink-0" />
            <span>{t('common.analytics', 'Analytics')}</span>
          </Link>
        </div>
      </div>

      {/* Dynamic Status & Approval Banner */}
      {isPaymentPending ? (
        <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-emerald-500/10 border-2 border-emerald-500/30 dark:border-emerald-500/40 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4 overflow-hidden">
          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5 sm:mt-0">
              <IconCheckCircle className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-black text-slate-900 dark:text-white break-words">{t('campaign_details.approved_compliance', 'Campaign Approved by VMOVEXA Compliance')}</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-300 font-medium mt-0.5 break-words">
                {t('campaign_details.digital_screen_slots_reserved', 'Digital screen slots reserved across')} {campaign.totalScreens.toLocaleString()} {t('campaign_details.awaiting_customer_payment_of', 'displays. Awaiting customer payment of')} ₹{totalAmount.toLocaleString('en-IN')} {t('campaign_details.to_clear_campaign_broadcast', 'to clear campaign for broadcast launch.')}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 w-full xl:w-auto shrink-0 justify-start xl:justify-end">
            <Link
              to={`${basePath}/campaigns/${campaign.rawId || campaign.id}/record-payment`}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer text-center active:scale-[0.98]"
            >
              <FleetIcons.Money className="w-4 h-4 text-white shrink-0" />
              <span className="whitespace-nowrap">{isGov ? 'Record Treasury / Sanction' : 'Record Offline Payment'}</span>
            </Link>
            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-[0.98]"
            >
              <IconShare className="w-4 h-4 text-white shrink-0" />
              <span className="whitespace-nowrap">{t('campaign_details.share_link', 'Share Payment Link')}</span>
            </button>
          </div>
        </div>
      ) : isLive ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs overflow-hidden">
          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0 mt-1 sm:mt-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-emerald-900 dark:text-emerald-300 break-words">{t('campaign_details.broadcasting_live_msg', 'Ad is currently Broadcasting LIVE on Transit Fleet Displays')}</p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5 break-words">{t('campaign_details.operating_slot_label', 'Operating slot:')} {campaign.startTime} – {campaign.endTime} IST · {campaign.totalScreens} {t('campaign_details.active_screens_label', 'active screens')}</p>
            </div>
          </div>
          <button
            onClick={handleStopCampaign}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer active:scale-[0.98]"
          >
            {t('campaign_details.pause_ad_btn', 'Pause Ad')}
          </button>
        </div>
      ) : null}

      {/* ------------------------------------------------------------- */}
      {/* COMPACT 5-TAB HORIZONTAL SECTION CONTROLLER                   */}
      {/* ------------------------------------------------------------- */}
      <div ref={tabControllerRef} className="sticky top-0 z-20 bg-slate-50/95 dark:bg-zinc-950/95 backdrop-blur-md -mx-3 sm:-mx-6 md:-mx-8 px-3 sm:px-6 md:px-8 py-2 border-y border-slate-200/90 dark:border-zinc-800 shadow-2xs">
        <div ref={tabsScrollRef} className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
          {SECTION_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSectionTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                data-active={isActive ? 'true' : 'false'}
                onClick={() => {
                  setActiveSectionTab(tab.id);
                  scrollToSectionTop();
                }}
                className={`shrink-0 text-xs font-bold px-3 sm:px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 shadow-2xs cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 dark:bg-zinc-800 text-white shadow-xs ring-2 ring-slate-900/20 dark:ring-zinc-700/50 border dark:border-zinc-700'
                    : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-200 border border-slate-200 dark:border-zinc-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-zinc-400'}`} />
                <span className="whitespace-nowrap">{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ACTIVE SECTION CONTENT                                         */}
      {/* ------------------------------------------------------------- */}

      {/* Single Section View */}
      {activeSectionTab !== 'all' ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {activeSectionTab === 'overview' && renderOverviewClientSection()}
          {activeSectionTab === 'media_fleet' && renderMediaFleetSection()}
          {activeSectionTab === 'schedule_budget' && renderScheduleBudgetSection()}
          {activeSectionTab === 'payment_qr' && renderPaymentQrSection()}

          {/* Clean Previous / View All / Next Footer Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-200 dark:border-zinc-800">
            {prevTabObj ? (
              <button
                type="button"
                onClick={() => {
                  setActiveSectionTab(prevTabObj.id);
                  scrollToSectionTop();
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>{t('campaign_details.previous_label', '← Previous:')} {prevTabObj.label}</span>
              </button>
            ) : <div className="hidden sm:block" />}

            <button
              type="button"
              onClick={() => {
                setActiveSectionTab('all');
                scrollToSectionTop();
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{t('campaign_details.view_all_details', 'View All Details')}</span>
            </button>

            {nextTabObj ? (
              <button
                type="button"
                onClick={() => {
                  setActiveSectionTab(nextTabObj.id);
                  scrollToSectionTop();
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-zinc-700 hover:bg-slate-800 dark:hover:bg-zinc-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>{t('campaign_details.next_label', 'Next:')} {nextTabObj.label} →</span>
              </button>
            ) : <div className="hidden sm:block" />}
          </div>
        </div>
      ) : (
        /* All Details Mode (Chronological, Clean 4-Section Flow) */
        <div className="space-y-8 animate-in fade-in duration-200">
          {renderOverviewClientSection()}
          {renderMediaFleetSection()}
          {renderScheduleBudgetSection()}
          {renderPaymentQrSection()}
        </div>
      )}



      {/* Share Payment Link to Customer Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg shrink-0">
                  <IconShare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">{t('campaign_details.send_pay_link_title', 'Send Payment Link to Customer')}</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">{t('campaign_details.customer_will_receive_direct_link', 'Customer will receive direct checkout link to pay')} ₹{totalAmount.toLocaleString('en-IN')}</p>
                </div>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-500 dark:text-zinc-400 font-bold shrink-0 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200 dark:border-zinc-700 text-xs space-y-1">
                <p className="font-bold text-slate-800 dark:text-white">{t('campaign_details.payment_summary', 'Payment Summary')}</p>
                <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                  <span>{t('campaign.customer_label', 'Customer:')}</span>
                  <span className="font-semibold text-slate-900 dark:text-zinc-200 break-words">{campaign.clientName || 'Valued Client'}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                  <span>{t('campaign_details.total_payable_label', 'Total Payable Amount:')}</span>
                  <span className="font-black text-emerald-700 dark:text-emerald-400">₹ {totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('campaign_details.recipient_email_inv', 'Recipient Email (for Invoice & Payment Link)')}</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="customer@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('campaign_details.recipient_mobile_sms', 'Recipient Mobile Phone (for SMS Checkout Link)')}</label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs space-y-1">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">{t('campaign_details.checkout_link_url', 'Checkout Link URL:')}</span>
                <p className="font-mono text-[11px] text-blue-700 dark:text-blue-400 break-all bg-white dark:bg-zinc-900 p-2 rounded-lg border border-slate-200 dark:border-zinc-700 select-all">
                  {paymentUrl}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={sendingEmail || !clientEmail}
                  onClick={handleSendEmail}
                  className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {sendingEmail ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                      <span>{t('campaign_details.sending_email', 'Sending Email...')}</span>
                    </>
                  ) : (
                    <>
                      <IconMail className="w-3.5 h-3.5 text-white shrink-0" />
                      <span>{t('campaign_details.send_email_btn', 'Send Email')}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={sendingSms || !clientPhone}
                  onClick={handleSendSms}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {sendingSms ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                      <span>{t('campaign_details.sending_sms', 'Sending SMS...')}</span>
                    </>
                  ) : (
                    <>
                      <IconMessage className="w-3.5 h-3.5 text-white shrink-0" />
                      <span>{t('campaign_details.send_sms_btn', 'Send SMS')}</span>
                    </>
                  )}
                </button>

                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 text-center cursor-pointer"
                >
                  <IconWhatsApp className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>{t('common.whatsapp', 'WhatsApp')}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Offline Payment Modal */}
      <RecordOfflinePaymentModal
        isOpen={showOfflineModal}
        onClose={() => setShowOfflineModal(false)}
        campaign={campaign?.raw || campaign}
        isGov={isGov}
        onSuccess={() => {
          if (id) loadCampaignDetails(id).catch(() => {});
          loadCampaigns().catch(() => {});
        }}
      />
    </div>
  );
};

export default CampaignDetailsPage;
