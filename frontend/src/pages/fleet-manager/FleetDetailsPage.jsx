import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { useFleetManager } from '../../hooks/fleet/useFleetManager';
import { useFleetVehicle } from '../../hooks/fleet/useFleetVehicle';
import { useAuth } from '../../hooks/useAuth';
import { resolveFileUrl } from '../../api/services/upload.service';
import { AssignVehicleToFleetModal } from './AssignVehicleToFleetModal';
import Breadcrumb from '../../components/ui/Breadcrumb';

const formatName = (v, fallback = '—') => {
  if (!v) return fallback;
  if (typeof v === 'object') return v.name || v.code || fallback;
  return String(v);
};

export const FleetDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    selectedFleet,
    loadFleet,
    updateFleet,
    approveFleet,
    rejectFleet,
  } = useFleetManager();

  const { vehicles, loadVehicles } = useFleetVehicle();
  const { user, hasPermission } = useAuth();

  const isPlatformAdmin = Boolean(
    user && (user.role === 'ROLE-SUPER-ADMIN' || user.role === 'ROLE-ADMIN' || user.clearance === 'ROOT')
  );
  const canUpdate = hasPermission('fleet.fleets.update');
  const canAssignVehicles = hasPermission('fleet.vehicles.update');

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'vehicles' | 'activity'
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isAssignVehicleOpen, setIsAssignVehicleOpen] = useState(false);

  const fetchDetails = () => {
    if (id) {
      setLoading(true);
      loadFleet(id)
        .catch((err) => {
          toast.error(err?.message || 'Failed to load fleet details');
          navigate('/fleet-manager/fleets');
        })
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  useEffect(() => {
    loadVehicles({ limit: 50 }).catch(() => {});
  }, [loadVehicles]);

  const fleet = selectedFleet;

  const handleToggleStatus = async (newStatus) => {
    if (!fleet) return;
    setUpdatingStatus(true);
    try {
      await toast.promise(
        updateFleet(fleet.id, { status: newStatus }),
        {
          loading: 'Updating fleet operation status...',
          success: `Fleet operation set to ${newStatus}!`,
          error: (err) => err?.message || 'Failed to update status',
        }
      );
      fetchDetails();
    } catch {
      /* handled by toast */
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleApprove = async () => {
    if (!fleet) return;
    setUpdatingStatus(true);
    try {
      await toast.promise(
        approveFleet(fleet.id),
        {
          loading: 'Approving fleet operation...',
          success: 'Fleet approved and activated!',
          error: (err) => err?.message || 'Failed to approve fleet',
        }
      );
      fetchDetails();
    } catch {
      /* handled */
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleReject = async () => {
    if (!fleet) return;
    const reason = window.prompt('Enter rejection reason for this fleet:', 'Requirements not fulfilled');
    if (!reason) return;
    setUpdatingStatus(true);
    try {
      await toast.promise(
        rejectFleet(fleet.id, reason),
        {
          loading: 'Rejecting fleet operation...',
          success: 'Fleet operation rejected.',
          error: (err) => err?.message || 'Failed to reject fleet',
        }
      );
      fetchDetails();
    } catch {
      /* handled */
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <div className="text-slate-600 dark:text-zinc-400 font-bold text-sm">Loading complete fleet profile & asset records...</div>
        </div>
      </div>
    );
  }

  if (!fleet) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm space-y-4">
        <div className="text-slate-500 dark:text-zinc-400 font-bold text-base">Fleet operation record not found.</div>
        <Link
          to="/fleet-manager/fleets"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-slate-800 dark:hover:bg-blue-500 transition-colors"
        >
          <FleetIcons.ArrowLeft className="w-4 h-4" />
          <span>Back to Fleets List</span>
        </Link>
      </div>
    );
  }

  const avatar = fleet.logo_url || fleet.logoUrl || fleet.avatarUrl || fleet.avatar_url;
  const code = fleet.code || `FLT-${fleet.id}`;
  const depot = fleet.depot?.name || fleet.depot_name || formatName(fleet.depot, 'Unassigned Central Base');
  const buses = fleet.assigned_buses ?? fleet.assignedBuses ?? '0';
  const drivers = fleet.active_drivers_count ?? fleet.activeDriversCount ?? fleet.drivers_count ?? '0';
  const status = (fleet.status || 'active').toLowerCase();
  const designation = fleet.designation || 'Fleet Operator Lead';
  const department = fleet.department || 'Transit Operations';
  const timezone = fleet.time_zone || fleet.timezone || 'Asia/Kolkata';
  const baseCity = fleet.location || fleet.city || 'Bangalore Central Hub';
  const docsList = Array.isArray(fleet.documents) ? fleet.documents : [];
  const createdAt = fleet.created_at || fleet.createdAt
    ? new Date(fleet.created_at || fleet.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';
  const fleetType = fleet.fleet_type || fleet.fleetType || 'Intracity Transit';

  // Vehicles matching this fleet
  const vehicleList = Array.isArray(vehicles) ? vehicles : (vehicles?.items || vehicles?.rows || []);
  const fleetVehicles = vehicleList.filter(
    (v) => String(v.fleet_id) === String(fleet.id) || String(v.fleet?.id) === String(fleet.id)
  );

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-16">
      {/* Top Breadcrumb & Header Action Bar */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Fleet Manager', path: '/fleet-manager/dashboard' },
            { label: 'Fleet Operators', path: '/fleet-manager/fleets' },
            { label: fleet.name || `Fleet #${fleet.id}` },
          ]}
          className="mb-2"
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <Link
              to="/fleet-manager/fleets"
              className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              title="Back to Fleets"
            >
              <FleetIcons.ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3 flex-wrap">
                <span>{fleet.name}</span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                    status === 'active'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                      : status === 'pending_approval'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                  }`}
                >
                  {status}
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
                Code: <strong className="text-slate-800 dark:text-zinc-200">{code}</strong> · Type: <strong className="text-blue-700 dark:text-blue-400">{fleetType}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Admin Approval / Rejection buttons */}
            {status === 'pending_approval' && isPlatformAdmin && (
              <>
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={handleApprove}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <FleetIcons.Check className="w-3.5 h-3.5" />
                  <span>Approve Fleet</span>
                </button>
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={handleReject}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <FleetIcons.Alert className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              </>
            )}

            {status === 'pending_approval' && !isPlatformAdmin && (
              <div className="px-3.5 py-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold rounded-xl flex items-center gap-2">
                <FleetIcons.Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Pending Platform Review</span>
              </div>
            )}

            {/* Activate / Suspend Toggle */}
            {status !== 'pending_approval' && canUpdate && (
              <button
                type="button"
                disabled={updatingStatus}
                onClick={() => handleToggleStatus(status === 'active' ? 'suspended' : 'active')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl border shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                  status === 'active'
                    ? 'bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                }`}
              >
                {status === 'active' ? <FleetIcons.Settings className="w-3.5 h-3.5" /> : <FleetIcons.Speed className="w-3.5 h-3.5" />}
                <span>{status === 'active' ? 'Suspend Fleet' : 'Activate Fleet'}</span>
              </button>
            )}

            {/* Edit Fleet Profile */}
            {canUpdate && (
              <Link
                to={`/fleet-manager/fleets/edit/${fleet.id}`}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <FleetIcons.Edit className="w-4 h-4 text-white" />
                <span>Edit Fleet Profile</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Tab Selection Bar */}
        <div className="px-6 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/50 flex gap-6 text-xs font-bold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-slate-900 dark:border-blue-500 text-slate-900 dark:text-white'
                : 'border-transparent text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'
            }`}
          >
            <FleetIcons.Profile className="w-4 h-4" />
            <span>Overview & Profile Details</span>
          </button>
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`py-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'vehicles'
                ? 'border-slate-900 dark:border-blue-500 text-slate-900 dark:text-white'
                : 'border-transparent text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'
            }`}
          >
            <FleetIcons.Bus className="w-4 h-4" />
            <span>Assigned Vehicles & Transit Assets</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-black">
              {fleetVehicles.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'activity'
                ? 'border-slate-900 dark:border-blue-500 text-slate-900 dark:text-white'
                : 'border-transparent text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'
            }`}
          >
            <FleetIcons.Settings className="w-4 h-4" />
            <span>Audit & Activity Logs</span>
          </button>
        </div>

        {/* Tab 1: OVERVIEW & PROFILE DETAILS */}
        {activeTab === 'overview' && (
          <div className="p-6 space-y-6">
            {/* Profile Card Banner */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 p-6 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 shadow-sm flex items-center justify-center text-slate-800 dark:text-white font-black text-2xl overflow-hidden shrink-0">
                  {avatar ? (
                    <img src={resolveFileUrl(avatar)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    fleet.name?.charAt(0).toUpperCase() || 'F'
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">{fleet.name}</h3>
                  <div className="text-xs text-slate-600 dark:text-zinc-400 font-medium flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-zinc-200 bg-slate-200/70 dark:bg-zinc-700 px-2 py-0.5 rounded-md">
                      {designation}
                    </span>
                    <span>·</span>
                    <span>{department}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-zinc-400 pt-1 font-mono">
                    <span className="flex items-center gap-1.5">
                      <FleetIcons.Mail className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                      <span>{fleet.email || '—'}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <FleetIcons.Phone className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                      <span>{fleet.phone || '—'}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start md:items-end text-xs text-slate-500 dark:text-zinc-400 space-y-1 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200 dark:border-zinc-800 w-full md:w-auto">
                <div>
                  Status: <strong className="text-slate-900 dark:text-white uppercase font-mono">{status}</strong>
                </div>
                <div>
                  Fleet Code: <strong className="text-slate-900 dark:text-white font-mono">{code}</strong>
                </div>
                <div>
                  Registered Date: <strong className="text-slate-800 dark:text-zinc-300">{createdAt}</strong>
                </div>
              </div>
            </div>

            {/* 4 Stat Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-1 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Assigned Depot</span>
                <div className="text-base font-black text-slate-900 dark:text-white truncate">{depot}</div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">{baseCity}</p>
              </div>
              <div className="p-4 bg-white dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-1 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Bus Fleet Quota</span>
                <div className="text-base font-black text-blue-700 dark:text-blue-400">{buses} Vehicles</div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">Allocated transit assets</p>
              </div>
              <div className="p-4 bg-white dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-1 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Driver Shift Team</span>
                <div className="text-base font-black text-emerald-700 dark:text-emerald-400">{drivers} Active Drivers</div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">Managed crew personnel</p>
              </div>
              <div className="p-4 bg-white dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-1 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">KYC Verification</span>
                <div className="text-base font-black text-purple-700 dark:text-purple-400">{docsList.length} Uploaded Docs</div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">Legal & identity proofs</p>
              </div>
            </div>

            {/* Fleet Operational Scope & Description */}
            <div className="p-4 sm:p-5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl space-y-2 shadow-2xs min-w-0 overflow-hidden">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                  <FleetIcons.Document className="w-3.5 h-3.5 text-white" />
                </div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Fleet Operational Description & Scope
                </h4>
              </div>
              <div className="bg-white/80 dark:bg-zinc-800/80 border border-blue-100/80 dark:border-zinc-700/60 rounded-xl p-3.5 text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-medium break-words break-all whitespace-pre-wrap min-w-0 max-w-full overflow-hidden">
                {fleet.description || 'No operational description provided.'}
              </div>
            </div>

            {/* Information Field Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal & Account Information */}
              <div className="bg-slate-50/60 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 min-w-0 overflow-hidden">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                  <FleetIcons.Profile className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                  <span>Contact Person & Lead Operator</span>
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs font-medium divide-y divide-slate-100 dark:divide-zinc-800">
                  <div className="space-y-0.5 pt-2 min-w-0">
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">Contact Person</span>
                    <div className="text-slate-900 dark:text-white font-bold truncate">{fleet.contact_person || fleet.contactPerson || fleet.name}</div>
                  </div>
                  <div className="space-y-0.5 pt-2 min-w-0">
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">Email Address</span>
                    <div className="text-slate-900 dark:text-white font-mono truncate">{fleet.email || '—'}</div>
                  </div>
                  <div className="space-y-0.5 pt-2 min-w-0">
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">Phone Number</span>
                    <div className="text-slate-900 dark:text-white font-mono">{fleet.phone || '—'}</div>
                  </div>
                  <div className="space-y-0.5 pt-2 min-w-0">
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">Classification</span>
                    <div className="text-blue-700 dark:text-blue-400 font-bold">{fleetType}</div>
                  </div>
                  <div className="space-y-0.5 pt-2 min-w-0">
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">Designation</span>
                    <div className="text-slate-900 dark:text-white font-bold">{designation}</div>
                  </div>
                  <div className="space-y-0.5 pt-2 min-w-0">
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">Department</span>
                    <div className="text-slate-900 dark:text-white font-bold">{department}</div>
                  </div>
                  <div className="space-y-0.5 pt-2 min-w-0">
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">Timezone</span>
                    <div className="text-slate-900 dark:text-white font-mono">{timezone}</div>
                  </div>
                  <div className="space-y-0.5 pt-2 min-w-0">
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">Primary Hub Base</span>
                    <div className="text-slate-900 dark:text-white font-bold">{baseCity}</div>
                  </div>
                </div>
              </div>

              {/* Operations & Depot Scope */}
              <div className="bg-slate-50/60 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 min-w-0 overflow-hidden">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                  <FleetIcons.Bus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Depot & Vehicle Operations Scope</span>
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs font-medium divide-y divide-slate-100 dark:divide-zinc-800">
                  <div className="space-y-0.5 pt-2 min-w-0">
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">Assigned Depot Base</span>
                    <div className="text-slate-900 dark:text-white font-bold truncate">{depot}</div>
                  </div>
                  <div className="space-y-0.5 pt-2 min-w-0">
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">Fleet Category</span>
                    <div className="text-slate-900 dark:text-white font-bold">{fleetType}</div>
                  </div>
                  <div className="space-y-0.5 pt-2 min-w-0">
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">Assigned Buses</span>
                    <div className="text-blue-700 dark:text-blue-400 font-black text-sm">{buses} Buses</div>
                  </div>
                  <div className="space-y-0.5 pt-2 min-w-0">
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">Active Drivers</span>
                    <div className="text-emerald-700 dark:text-emerald-400 font-black text-sm">{drivers} Drivers</div>
                  </div>
                  <div className="space-y-0.5 pt-2 min-w-0">
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">Working Shift Hours</span>
                    <div className="text-slate-900 dark:text-white font-mono">{fleet.working_hours || fleet.workingHours || '05:00 AM - 11:30 PM'}</div>
                  </div>
                  <div className="space-y-0.5 pt-2 min-w-0">
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">Account Status</span>
                    <div className="font-bold uppercase text-slate-900 dark:text-white">{status}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Uploaded Verification & KYC Documents Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <FleetIcons.Document className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Verification & Legal KYC Documents</span>
                </h4>
                <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">{docsList.length} files attached</span>
              </div>

              {docsList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {docsList.map((doc, idx) => {
                    const docUrl = doc.url || doc.file_url || doc.filePath || (typeof doc === 'string' ? doc : null);
                    const title = doc.category || doc.purpose || doc.name || `Legal Document #${idx + 1}`;
                    return (
                      <div
                        key={idx}
                        className="p-4 bg-white dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 rounded-xl flex items-center justify-between shadow-2xs transition-all group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-800 flex items-center justify-center shrink-0">
                            <FleetIcons.Document className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400 truncate">
                              {title}
                            </div>
                            <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5 flex items-center gap-2">
                              <span>KYC Attached</span>
                              <span>•</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Uploaded</span>
                            </div>
                          </div>
                        </div>

                        {docUrl && (
                          <a
                            href={resolveFileUrl(docUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-[11px] font-bold text-blue-600 dark:text-blue-400 transition-colors shrink-0"
                          >
                            View File ↗
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 text-center text-xs text-slate-500 dark:text-zinc-400">
                  No legal compliance or KYC documents uploaded for this fleet yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: ASSIGNED VEHICLES & TRANSIT ASSETS */}
        {activeTab === 'vehicles' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Assigned Transit Units ({fleetVehicles.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Commercial buses and EV units actively operating under this fleet allocation.
                </p>
              </div>

              {canAssignVehicles && (
                <button
                  type="button"
                  onClick={() => setIsAssignVehicleOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                >
                  <FleetIcons.Plus className="w-3.5 h-3.5 text-white" />
                  <span>Allocate Vehicle Unit</span>
                </button>
              )}
            </div>

            {fleetVehicles.length === 0 ? (
              <div className="p-12 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shadow-xs">
                  <FleetIcons.Bus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">No Vehicles Bound to this Fleet Yet</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm">
                  Allocate and bind a vehicle unit along with an authorized driver and IoT GPS hardware to complete this fleet.
                </p>
                {canAssignVehicles && (
                  <button
                    type="button"
                    onClick={() => setIsAssignVehicleOpen(true)}
                    className="mt-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <FleetIcons.Plus className="w-4 h-4 text-white" />
                    <span>Allocate Vehicle Unit</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fleetVehicles.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => navigate(`/fleet-manager/vehicles/${v.id}`)}
                    className="p-5 rounded-2xl bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all cursor-pointer shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                            {v.bus_number ?? v.code ?? `Vehicle #${v.id}`}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-zinc-400">{v.vehicle_type ?? v.model ?? 'Commercial Transit'}</p>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                            v.status === 'Moving' || v.status === 'active'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          <span>{v.status ?? 'Active'}</span>
                        </span>
                      </div>

                      <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800/80 p-3 rounded-xl border border-slate-100 dark:border-zinc-700/60">
                        <div className="flex justify-between">
                          <span className="text-slate-400 dark:text-zinc-500">Driver:</span>
                          <span className="text-slate-900 dark:text-white font-semibold">{v.assigned_driver_id ?? 'Unassigned'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 dark:text-zinc-500">VIN:</span>
                          <span className="text-slate-900 dark:text-white font-semibold font-mono">{v.vin ?? '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 dark:text-zinc-500">Route:</span>
                          <span className="text-blue-600 dark:text-blue-400 font-semibold truncate max-w-[140px]">
                            {v.assigned_route ?? v.route_id ?? 'None'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-zinc-400 font-medium">{v.fuel_type || 'EV Battery'}</span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                        <span>View Specs</span>
                        <FleetIcons.ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: AUDIT & ACTIVITY LOGS */}
        {activeTab === 'activity' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <FleetIcons.Settings className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Operational Audit Trail</span>
              </h4>
              <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">Fleet ID: {fleet.id}</span>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  <FleetIcons.Document className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Fleet Operation Initialized</div>
                  <div className="text-[11px] text-slate-600 dark:text-zinc-400">
                    Registered under code <strong>{code}</strong> at {depot} with target quota of {buses} buses.
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">{createdAt}</div>
                </div>
              </div>

              {status === 'active' && (
                <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    <FleetIcons.Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-emerald-950 dark:text-emerald-200">Fleet Operation Active</div>
                    <div className="text-[11px] text-emerald-800 dark:text-emerald-300">
                      Approved and live across transit dispatching network.
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Current Status</div>
                  </div>
                </div>
              )}

              {status === 'pending_approval' && (
                <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    <FleetIcons.Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-amber-950 dark:text-amber-200">Approval Pending Review</div>
                    <div className="text-[11px] text-amber-800 dark:text-amber-300">
                      Fleet registration has been submitted to platform administrators for verification.
                    </div>
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">In Review</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Assign Vehicle Modal */}
      <AssignVehicleToFleetModal
        isOpen={isAssignVehicleOpen}
        onClose={() => {
          setIsAssignVehicleOpen(false);
          loadVehicles({ limit: 50 }).catch(() => {});
        }}
        fleet={fleet}
      />
    </div>
  );
};

export default FleetDetailsPage;
