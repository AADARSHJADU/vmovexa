import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { useSuperTechnician } from '../../hooks/superadmin/useSuperTechnician';
import { useOrganization } from '../../hooks/superadmin/useOrganization';
import toast from 'react-hot-toast';

const STATUS_BADGES = {
  dispatched: {
    label: 'Dispatched to Depot',
    color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    dot: 'bg-blue-500',
  },
  on_site: {
    label: 'On Site Troubleshooting',
    color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500 animate-pulse',
  },
  resolved: {
    label: 'Resolved & Tested',
    color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  submitted: {
    label: 'Pending Assignment',
    color: 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-semibold',
    dot: 'bg-amber-500 animate-ping',
  },
  approved: {
    label: 'Approved for Dispatch',
    color: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    dot: 'bg-purple-500',
  },
  closed: {
    label: 'Closed & Archived',
    color: 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-300 dark:border-zinc-700',
    dot: 'bg-slate-400',
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    dot: 'bg-red-500',
  },
};

const URGENCY_BADGES = {
  critical: {
    label: 'Critical / Grounded Bus',
    badge: 'Critical',
    color: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900',
    pulse: true,
  },
  high: {
    label: 'High Priority',
    badge: 'High',
    color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900',
    pulse: false,
  },
  normal: {
    label: 'Normal Maintenance',
    badge: 'Normal',
    color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    pulse: false,
  },
  low: {
    label: 'Low Priority / Provisioning',
    badge: 'Low',
    color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
    pulse: false,
  },
};

const techCity = (t) => t?.baseCity || t?.city || t?.organization?.city || '';
const techCert = (t) => t?.certLevel || t?.role?.name || 'Central Field Technician';
const techStatus = (t) => String(t?.status || 'active');
const isAvailable = (t) => {
  const s = techStatus(t).toLowerCase();
  return s.includes('avail') || s === 'active';
};

const QUICK_DEPOTS = [
  'Central Maintenance Depot',
  'North Terminal Hub',
  'South Yard Facility',
  'Airport Express Depot',
];

const ETA_PRESETS = [
  'Within 1 Hour (Emergency)',
  'Within 2 Hours (Rapid)',
  'Today by 5:00 PM',
  'Tomorrow Morning (09:00 AM)',
];

const WORK_CATEGORIES = [
  'RK3588 Edge Box Initial Flash & Provisioning',
  'GPS Telematics Built-in Chip Calibration',
  'Main Screen HDMI Driver Blank Display',
  'Multi-Display Sync (Front + Window + Rear)',
  'CAN-bus J1939 Wiring Harness Troubleshooting',
  'Audio PA & Mic Amplifier Circuitry',
  'Emergency SOS Panic Trigger Fault',
];

const SLA_OPTIONS = [
  {
    value: '2 Hours (Emergency)',
    hours: 2,
    label: '2 Hours — Emergency Grounded Bus',
    badge: 'Critical 2h',
    color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900',
  },
  {
    value: '4 Hours (Critical)',
    hours: 4,
    label: '4 Hours — Critical Display / GPS Fault',
    badge: 'High 4h',
    color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
  },
  {
    value: '24 Hours (Standard)',
    hours: 24,
    label: '24 Hours — Standard Maintenance',
    badge: 'Standard 24h',
    color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
  },
  {
    value: '48 Hours (New Provisioning)',
    hours: 48,
    label: '48 Hours — New Fleet Provisioning',
    badge: 'Low 48h',
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
  },
];

export const AssignTechnicianPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const orderId = id || searchParams.get('orderId');

  const {
    centralTechnicians,
    loadCentralTechnicians,
    assignWorkOrder,
    loadWorkOrderDetail,
  } = useSuperTechnician();
  const { organizations, loadOrganizations } = useOrganization();

  const [existingOrder, setExistingOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [selectedTechId, setSelectedTechId] = useState('');
  const [depotName, setDepotName] = useState('');
  const [targetBusId, setTargetBusId] = useState('');
  const [jobType, setJobType] = useState('Main Screen HDMI Driver Blank Display');
  const [slaHours, setSlaHours] = useState('4 Hours (Critical)');
  const [eta, setEta] = useState('Within 2 hours');
  const [instructions, setInstructions] = useState('');
  const [techSearch, setTechSearch] = useState('');
  const [techFilterTier, setTechFilterTier] = useState('all'); // all, available, tier1, tier2, tier3
  const [submitting, setSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Pre-dispatch safety checks
  const [checks, setChecks] = useState({
    sparesAllocated: true,
    depotNotified: true,
    safetyAcknowledged: true,
  });

  useEffect(() => {
    loadCentralTechnicians().catch(() => {});
    loadOrganizations().catch(() => {});
  }, [loadCentralTechnicians, loadOrganizations]);

  // Load existing work order if assigning a specific order
  useEffect(() => {
    if (orderId) {
      setLoadingOrder(true);
      loadWorkOrderDetail(orderId)
        .then((data) => {
          if (data) {
            setExistingOrder(data);
            if (data.organization_id) setSelectedTenantId(String(data.organization_id));
            if (data.depot_name || data.depot?.name) setDepotName(data.depot_name || data.depot?.name);
            if (data.bus_number) setTargetBusId(data.bus_number);
            if (data.issue_category) setJobType(data.issue_category);
            if (data.instructions) setInstructions(data.instructions);
            else if (data.description) setInstructions(data.description);
            if (data.assigned_technician_id) setSelectedTechId(String(data.assigned_technician_id));
            if (data.eta) setEta(data.eta);
            if (data.urgency === 'critical') setSlaHours('2 Hours (Emergency)');
            else if (data.urgency === 'high') setSlaHours('4 Hours (Critical)');
            else if (data.urgency === 'low') setSlaHours('48 Hours (New Provisioning)');
            else setSlaHours('24 Hours (Standard)');
          }
        })
        .catch(() => {
          toast.error('Failed to load work order context.');
        })
        .finally(() => setLoadingOrder(false));
    }
  }, [orderId, loadWorkOrderDetail]);

  const tenants = organizations || [];
  const techsList = centralTechnicians || [];

  // Default selections once data loads if not in existing order mode
  useEffect(() => {
    if (!orderId && !selectedTenantId && tenants.length > 0) {
      setSelectedTenantId(String(tenants[0].id));
    }
  }, [tenants, selectedTenantId, orderId]);

  useEffect(() => {
    if (!selectedTechId && techsList.length > 0) {
      const firstAvail = techsList.find(isAvailable) || techsList[0];
      if (firstAvail) setSelectedTechId(String(firstAvail.id));
    }
  }, [techsList, selectedTechId]);

  const selectedTenant =
    tenants.find((item) => String(item.id) === String(selectedTenantId)) ||
    existingOrder?.organization;
  const selectedTech = techsList.find((item) => String(item.id) === String(selectedTechId));
  const selectedSla = SLA_OPTIONS.find((s) => s.value === slaHours) || SLA_OPTIONS[1];

  const handleCopyCode = () => {
    if (!existingOrder?.code) return;
    navigator.clipboard.writeText(existingOrder.code);
    setCopiedCode(true);
    toast.success('Ticket code copied to clipboard!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const filteredTechs = useMemo(() => {
    let list = techsList;
    if (techFilterTier === 'available') {
      list = list.filter(isAvailable);
    } else if (techFilterTier === 'tier1') {
      list = list.filter((t) => techCert(t).toLowerCase().includes('1'));
    } else if (techFilterTier === 'tier2') {
      list = list.filter((t) => techCert(t).toLowerCase().includes('2'));
    } else if (techFilterTier === 'tier3') {
      list = list.filter((t) => techCert(t).toLowerCase().includes('3') || techCert(t).toLowerCase().includes('master'));
    }

    const q = techSearch.toLowerCase().trim();
    if (!q) return list;
    return list.filter((tech) => {
      const name = String(tech.name || '').toLowerCase();
      const code = String(tech.code || tech.id || '').toLowerCase();
      const city = techCity(tech).toLowerCase();
      const cert = techCert(tech).toLowerCase();
      return name.includes(q) || code.includes(q) || city.includes(q) || cert.includes(q);
    });
  }, [techsList, techSearch, techFilterTier]);

  const handleDispatch = async (e) => {
    e.preventDefault();
    if (!selectedTechId) {
      toast.error(t('technician.select_tech_err', 'Please select a central pool technician to dispatch.'));
      return;
    }
    if (!depotName.trim()) {
      toast.error(t('technician.depot_err', 'Please enter destination depot facility name.'));
      return;
    }

    const slaHoursNum = selectedSla.hours || 4;
    const finalEta = eta.trim() || `Within ${slaHoursNum} hours`;

    setSubmitting(true);
    try {
      if (orderId) {
        // Direct assignment to existing work order
        await toast.promise(
          assignWorkOrder(orderId, {
            technicianId: Number(selectedTechId),
            slaHours: slaHoursNum,
            eta: finalEta,
            instructions: instructions.trim(),
          }),
          {
            loading: `Dispatching technician ${selectedTech?.name || ''} to ${existingOrder?.code || 'work order'}...`,
            success: `Work order ${existingOrder?.code || ''} successfully dispatched to ${selectedTech?.name || 'Technician'}!`,
            error: (err) => err?.message || 'Dispatch failed. Please try again.',
          }
        );
      } else {
        // Create new work order dispatch
        const payload = {
          technicianId: selectedTechId,
          tenantId: selectedTenantId,
          depot: depotName.trim(),
          busId: targetBusId.trim(),
          jobType,
          slaDue: slaHours,
          eta: finalEta,
          instructions: instructions.trim(),
        };
        await toast.promise(
          assignWorkOrder(payload),
          {
            loading: t('technician.dispatching', 'Dispatching Work Order & Routing Central Engineer...'),
            success: `Work Order Dispatched to ${selectedTech?.name || 'Technician'}!`,
            error: (err) => err?.message || 'Dispatch Failed. Please try again.',
          }
        );
      }
      navigate('/superadmin/technicians/assign');
    } catch (_) {
      // toast handles error
    } finally {
      setSubmitting(false);
    }
  };

  const statusKey = (existingOrder?.status || 'submitted').toLowerCase();
  const statusBadge = STATUS_BADGES[statusKey] || {
    label: statusKey,
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  };
  const urgencyKey = (existingOrder?.urgency || 'normal').toLowerCase();
  const urgencyBadge = URGENCY_BADGES[urgencyKey] || URGENCY_BADGES.normal;

  return (
    <div className="w-full space-y-6 pb-20 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* 1. BREADCRUMB NAVIGATION HEADER BANNER                                    */}
      {/* ========================================================================= */}
      <div className="w-full p-6 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 shadow-sm transition-all">
        {/* Breadcrumb Navigation Line */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400 flex-wrap">
          <Link
            to="/superadmin/dashboard"
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
          >
            <FleetIcons.Dashboard className="w-3.5 h-3.5" />
            <span>Super Admin</span>
          </Link>
          <span className="text-slate-300 dark:text-zinc-600">/</span>
          <Link
            to="/superadmin/technicians/assign"
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <FleetIcons.Fleets className="w-3.5 h-3.5" />
            <span>Work Orders</span>
          </Link>
          <span className="text-slate-300 dark:text-zinc-600">/</span>

          {orderId ? (
            <>
              {loadingOrder ? (
                <span className="w-24 h-4 bg-slate-200 dark:bg-zinc-800 rounded animate-pulse inline-block" />
              ) : existingOrder ? (
                <Link
                  to={`/superadmin/technicians/assign/${existingOrder.id}`}
                  className="font-mono text-blue-600 dark:text-blue-400 hover:underline font-bold"
                  title="View Work Order Details"
                >
                  {existingOrder.code}
                </Link>
              ) : (
                <span className="font-mono text-slate-700 dark:text-zinc-300 font-bold">
                  Order #{orderId}
                </span>
              )}
              <span className="text-slate-300 dark:text-zinc-600">/</span>
              <span className="text-slate-900 dark:text-white font-bold px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                ⚡ Assign Technician
              </span>
            </>
          ) : (
            <span className="text-slate-900 dark:text-white font-bold px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              ⚡ Initiate New Dispatch
            </span>
          )}
        </nav>

        {/* Page Title & Back Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => navigate('/superadmin/technicians/assign')}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-700 transition-all shadow-xs shrink-0 cursor-pointer"
              title="Return to Work Orders List"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {existingOrder
                    ? `Assign Central Engineer: ${existingOrder.code}`
                    : orderId
                    ? `Assign Technician to Order #${orderId}`
                    : t('technician.assign_title', 'Dispatch Central Technician Work Order')}
                </h1>
                {existingOrder?.urgency && (
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${urgencyBadge.color}`}
                  >
                    {urgencyBadge.pulse && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>}
                    <span>{urgencyBadge.badge}</span>
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 font-medium">
                {existingOrder
                  ? 'Review target vehicle fault context and dispatch an authorized nationwide pool technician.'
                  : t(
                      'technician.assign_sub',
                      'Dynamically match an authorized Level 1-3 central pool engineer with an incoming tenant fleet work order.'
                    )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-2 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span>{techsList.length} Central Engineers Registered</span>
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DEDICATED NEW SECTION: TARGET WORK ORDER CONTEXT & FIELD SUMMARY CARD */}
      {/* ========================================================================= */}
      {orderId && (
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#11141d] border-2 border-blue-500/30 dark:border-blue-500/20 shadow-md shadow-blue-500/5">
          {/* Accent top gradient bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

          <div className="p-6 space-y-5">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-blue-600 text-white shadow-xs">
                  ⚡ Target Work Order
                </span>
                {existingOrder ? (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-wide">
                      {existingOrder.code}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="p-1 rounded-md text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                      title="Copy Ticket Code"
                    >
                      {copiedCode ? (
                        <span className="text-xs text-emerald-600 font-bold">Copied!</span>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 font-medium animate-pulse">Loading ticket code…</span>
                )}

                {existingOrder && (
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusBadge.color}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`}></span>
                    <span>{statusBadge.label}</span>
                  </span>
                )}
              </div>

              {/* View Full Ticket Link */}
              {existingOrder && (
                <Link
                  to={`/superadmin/technicians/assign/${existingOrder.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900 transition-colors shrink-0"
                >
                  <FleetIcons.Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>View Full Ticket & Audit Trail ↗</span>
                </Link>
              )}
            </div>

            {loadingOrder ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-slate-400 font-medium">Fetching work order telemetry and depot context…</p>
              </div>
            ) : existingOrder ? (
              <>
                {/* 4 Context Grid Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Fleet Operator & Depot */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-slate-400 dark:text-zinc-500">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Fleet & Depot</span>
                      <FleetIcons.Fleets className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {existingOrder.organization?.name || selectedTenant?.name || 'Operator Fleet'}
                      </p>
                      <p className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 truncate mt-0.5">
                        📍 {existingOrder.depot_name || existingOrder.depot?.name || depotName || 'Central Maintenance Depot'}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
                        {existingOrder.organization?.city || selectedTenant?.city || 'Regional Depot'}
                      </p>
                    </div>
                  </div>

                  {/* Card 2: Target Vehicle */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-slate-400 dark:text-zinc-500">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Target Vehicle</span>
                      <FleetIcons.Bus className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-mono text-xs font-black text-blue-600 dark:text-blue-400">
                        {existingOrder.bus_number || existingOrder.vehicle?.bus_number || targetBusId || 'Bus N/A'}
                      </p>
                      <p className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 truncate mt-0.5">
                        {existingOrder.vehicle?.model || 'Smart Transit RK3588 Edge'}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
                        Chassis / VIN: {existingOrder.vehicle?.vin || 'Telematic Unit'}
                      </p>
                    </div>
                  </div>

                  {/* Card 3: Issue Category & Severity */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-slate-400 dark:text-zinc-500">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Issue Subsystem</span>
                      <FleetIcons.Target className="w-4 h-4 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2" title={existingOrder.issue_category}>
                        {existingOrder.issue_category || jobType}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">
                        Reported: {existingOrder.created_at ? new Date(existingOrder.created_at).toLocaleDateString() : 'Recent'}
                      </p>
                    </div>
                  </div>

                  {/* Card 4: Current Engineer Allocation */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-slate-400 dark:text-zinc-500">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Current Assignment</span>
                      <FleetIcons.Driver className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      {existingOrder.assigned_technician_id && existingOrder.technician ? (
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {existingOrder.technician.name}
                          </p>
                          <span className="inline-block text-[10px] font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                            ⚡ Reassigning will replace engineer
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                            <span>Unassigned</span>
                          </span>
                          <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                            Awaiting Central Engineer Allocation
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Problem Description & Symptoms Box */}
                {(existingOrder.description || existingOrder.instructions) && (
                  <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-xs">
                    <span className="font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider text-[10px] block mb-1">
                      Reported Fault Symptoms & Diagnostics
                    </span>
                    <p className="text-slate-700 dark:text-zinc-300 font-medium italic">
                      "{existingOrder.description || existingOrder.instructions}"
                    </p>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MAIN ASSIGNMENT FORM GRID                                              */}
      {/* ========================================================================= */}
      <form onSubmit={handleDispatch} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Dispatch Configuration & Engineer Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Target Fleet & Location (Pre-filled for existing order, editable for new) */}
          <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">
                    1
                  </span>
                  <span>{t('technician.target_depot', 'Target Depot Facility & Fleet Details')}</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                  {existingOrder
                    ? 'Target vehicle & yard verified from work order ticket.'
                    : 'Select destination fleet operator and physical yard where hardware work is required.'}
                </p>
              </div>
              {existingOrder && (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  ✓ Ticket Verified
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  {t('tenants.organization', 'Fleet Organization')} *
                </label>
                <select
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  disabled={!!orderId}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-80 disabled:bg-slate-50 dark:disabled:bg-zinc-800/60"
                >
                  {tenants.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.city || 'Regional'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  {t('technician.target_vehicle', 'Target Vehicle / Bus Number')}
                </label>
                <input
                  type="text"
                  value={targetBusId}
                  onChange={(e) => setTargetBusId(e.target.value)}
                  disabled={!!orderId}
                  placeholder="e.g. MH-02-CW-1004"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-80 disabled:bg-slate-50 dark:disabled:bg-zinc-800/60"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                    {t('fleet.depot_name', 'Depot / Maintenance Yard Location')} *
                  </label>
                  {!orderId && (
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
                      Quick Suggestions:
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={depotName}
                  onChange={(e) => setDepotName(e.target.value)}
                  placeholder="e.g. Central Maintenance Depot, Terminal 2 Yard"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {!orderId && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {QUICK_DEPOTS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDepotName(d)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-zinc-700 transition-colors"
                      >
                        + {d}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* SLA Target Selection */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  {t('technician.sla_priority', 'Resolution SLA Target & Severity')} *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SLA_OPTIONS.map((sla) => {
                    const isSelected = slaHours === sla.value;
                    return (
                      <div
                        key={sla.value}
                        onClick={() => setSlaHours(sla.value)}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-blue-600 dark:border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 shadow-xs'
                            : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-600'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {sla.label.split('—')[0]}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                            {sla.label.split('—')[1] || ''}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${sla.color}`}>
                          {sla.badge}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Expected Arrival (ETA) Field */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Estimated Time of Arrival (ETA) at Depot
                  </label>
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
                    Presets:
                  </span>
                </div>
                <input
                  type="text"
                  value={eta}
                  onChange={(e) => setEta(e.target.value)}
                  placeholder="e.g. Within 2 hours, Today by 4:00 PM"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {ETA_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setEta(preset)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-zinc-700 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Central Pool Engineer Selection */}
          <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">
                    2
                  </span>
                  <span>{t('technician.select_tech', 'Select Central Pool Engineer')}</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                  Select available certified field engineer from nationwide VMOVEXA pool
                </p>
              </div>

              {/* Search Filter */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={techSearch}
                  onChange={(e) => setTechSearch(e.target.value)}
                  placeholder="Filter engineer by name, city..."
                  className="w-full px-3 py-1.5 pl-8 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg
                  className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-2.5 top-2.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { key: 'all', label: `All (${techsList.length})` },
                { key: 'available', label: `Available Now (${techsList.filter(isAvailable).length})` },
                { key: 'tier1', label: 'Tier 1' },
                { key: 'tier2', label: 'Tier 2' },
                { key: 'tier3', label: 'Tier 3 / Master' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setTechFilterTier(tab.key)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    techFilterTier === tab.key
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {techsList.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium">
                  No central technicians registered in system yet.
                </p>
                <Link
                  to="/superadmin/technicians/new"
                  className="inline-block px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg"
                >
                  + Register Technician First
                </Link>
              </div>
            ) : filteredTechs.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-zinc-500 text-center py-8">
                No technicians matching "{techSearch}".
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredTechs.map((tech) => {
                  const isSelected = String(tech.id) === String(selectedTechId);
                  const avail = isAvailable(tech);
                  return (
                    <div
                      key={tech.id}
                      onClick={() => setSelectedTechId(String(tech.id))}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2.5 relative ${
                        isSelected
                          ? 'border-blue-600 dark:border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 shadow-sm'
                          : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-black shadow">
                          ✓
                        </div>
                      )}

                      <div className="flex items-center justify-between pr-6">
                        <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400">
                          {tech.code || `TECH-${tech.id}`}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            avail
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {avail ? '● Available' : '● On Assignment'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shrink-0 text-slate-700 dark:text-zinc-300 font-black text-sm">
                          {String(tech.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{tech.name}</h4>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                            {techCity(tech)}
                            {techCity(tech) ? ' · ' : ''}
                            {techCert(tech)}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400">
                        <span>★ {tech.rating ? parseFloat(tech.rating).toFixed(1) : 'Unrated'}</span>
                        <span>{tech.jobsCompleted ?? tech.jobs_completed ?? 0} Orders Resolved</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card 3: Field Technical Instructions & Protocols */}
          <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">
                    3
                  </span>
                  <span>{t('technician.issue_type', 'Technician Field Notes & Spares Checklist')}</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                  Provide diagnostic steps, spare parts required, and safety instructions
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {!orderId && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                    {t('technician.issue_type', 'Work Order Category')} *
                  </label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {WORK_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Dispatch Notes & Spares Requirements
                </label>
                <textarea
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Bring replacement RK3588 HDMI board, verify 24V bus power supply, check antenna wiring..."
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Mandatory Dispatch Protocols */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                  Mandatory Dispatch Protocols
                </h4>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={checks.sparesAllocated}
                    onChange={(e) => setChecks((p) => ({ ...p, sparesAllocated: e.target.checked }))}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-600"
                  />
                  <span>Diagnostic tools & replacement spares allocated from central inventory</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={checks.depotNotified}
                    onChange={(e) => setChecks((p) => ({ ...p, depotNotified: e.target.checked }))}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-600"
                  />
                  <span>Depot Manager contact notification generated for gate entry authorization</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={checks.safetyAcknowledged}
                    onChange={(e) => setChecks((p) => ({ ...p, safetyAcknowledged: e.target.checked }))}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-600"
                  />
                  <span>24V automotive electrical safety protocol & anti-static grounding observed</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Dispatch Summary Card */}
        <div className="space-y-6">
          <div className="sticky top-6 bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Review & Dispatch
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                Work Order Summary
              </h3>
            </div>

            <div className="space-y-3.5 text-xs">
              {existingOrder && (
                <div className="flex items-start justify-between gap-3">
                  <span className="text-slate-400 dark:text-zinc-500">Ticket Code:</span>
                  <span className="font-mono font-black text-slate-900 dark:text-white text-right">
                    {existingOrder.code}
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <span className="text-slate-400 dark:text-zinc-500">Destination Fleet:</span>
                <span className="font-bold text-slate-900 dark:text-white text-right">
                  {selectedTenant?.name || existingOrder?.organization?.name || 'Selected Fleet'}
                </span>
              </div>

              <div className="flex items-start justify-between gap-3">
                <span className="text-slate-400 dark:text-zinc-500">Depot Facility:</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200 text-right">
                  {depotName || '—'}
                </span>
              </div>

              <div className="flex items-start justify-between gap-3">
                <span className="text-slate-400 dark:text-zinc-500">Target Bus:</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-right">
                  {targetBusId || 'General Depot Roster'}
                </span>
              </div>

              <div className="flex items-start justify-between gap-3">
                <span className="text-slate-400 dark:text-zinc-500">Category:</span>
                <span
                  className="font-semibold text-slate-800 dark:text-zinc-200 text-right max-w-[180px] truncate"
                  title={existingOrder?.issue_category || jobType}
                >
                  {existingOrder?.issue_category || jobType}
                </span>
              </div>

              <div className="flex items-start justify-between gap-3">
                <span className="text-slate-400 dark:text-zinc-500">SLA Target:</span>
                <span className={`font-bold text-right text-[11px] px-2 py-0.5 rounded border ${selectedSla.color}`}>
                  {selectedSla.badge}
                </span>
              </div>

              <div className="flex items-start justify-between gap-3">
                <span className="text-slate-400 dark:text-zinc-500">Estimated Arrival:</span>
                <span className="font-medium text-slate-800 dark:text-zinc-200 text-right">
                  {eta || 'Within SLA'}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Assigned Engineer:
                </span>
                {selectedTech ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800">
                    <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {String(selectedTech.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{selectedTech.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                        {techCert(selectedTech)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 dark:text-zinc-500 italic">No engineer selected</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                disabled={submitting || !selectedTechId}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <FleetIcons.Target className="w-4 h-4 text-white" />
                )}
                <span>
                  {submitting
                    ? 'Dispatching…'
                    : existingOrder?.assigned_technician_id
                    ? '⚡ Confirm & Reassign Technician'
                    : existingOrder
                    ? '⚡ Confirm & Dispatch Technician'
                    : t('technician.dispatch_btn', 'Confirm & Dispatch Central Technician')}
                </span>
              </button>

              <Link
                to="/superadmin/technicians/assign"
                className="block w-full py-2.5 px-4 text-center rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-colors"
              >
                {t('common.cancel', 'Cancel & Return to Work Orders')}
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AssignTechnicianPage;
