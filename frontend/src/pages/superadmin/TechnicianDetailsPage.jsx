import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { useSuperTechnician } from '../../hooks/superadmin/useSuperTechnician';
import { superTechnicianService } from '../../api/services/superadmin/technician.service';
import { getMediaUrl } from '../../utils/media';
import toast from 'react-hot-toast';

export const TechnicianDetailsPage = ({ tech: techProp = null, onClose = null }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const { deleteTechnician } = useSuperTechnician();

  const techId = techProp?.id || paramId;
  const [localTech, setLocalTech] = useState(techProp);
  const [workOrders, setWorkOrders] = useState([]);
  const [documents, setDocuments] = useState(techProp?.documents || []);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [deleting, setDeleting] = useState(false);

  const refreshTech = useCallback(async () => {
    if (!techId) return;
    try {
      setFetchLoading(true);
      const [userRes, woRes] = await Promise.allSettled([
        superTechnicianService.getTechnician(techId),
        superTechnicianService.getWorkOrders({ technicianId: techId }),
      ]);

      if (userRes.status === 'fulfilled' && userRes.value) {
        setLocalTech((prev) => ({ ...prev, ...userRes.value }));
        if (Array.isArray(userRes.value.documents)) {
          setDocuments(userRes.value.documents);
        }
      }

      if (woRes.status === 'fulfilled' && woRes.value) {
        const rows = woRes.value.rows || (Array.isArray(woRes.value) ? woRes.value : []);
        setWorkOrders(rows);
      }
    } catch (_) {
      // Keep localTech fallback
    } finally {
      setFetchLoading(false);
    }
  }, [techId]);

  useEffect(() => {
    if (techProp) {
      setLocalTech(techProp);
      if (Array.isArray(techProp.documents)) setDocuments(techProp.documents);
    }
    refreshTech();
  }, [techProp, refreshTech]);

  const tech = localTech || {};
  const profile = tech.technicianProfile || {};
  const isAvailable = (profile.status || tech.status || '').toLowerCase() === 'available' || (tech.status === 'active' && !profile.status);
  const isAssigned = (profile.status || '').toLowerCase() === 'assigned' || workOrders.some(w => ['dispatched', 'on_site'].includes(w.status));
  const isSuspended = (tech.status || '').toLowerCase() === 'suspended';

  // Extract skills dynamically
  let skillsList = [];
  if (Array.isArray(profile.skills)) {
    skillsList = profile.skills;
  } else if (typeof profile.skills === 'string') {
    try {
      const parsed = JSON.parse(profile.skills);
      skillsList = Array.isArray(parsed) ? parsed : [profile.skills];
    } catch {
      skillsList = profile.skills.split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  // Work orders list (either from API or embedded assignedWorkOrders)
  const allWorkOrders = workOrders.length > 0 ? workOrders : (tech.assignedWorkOrders || []);

  const handleToggleStatus = async () => {
    const nextStatus = tech.status === 'active' ? 'suspended' : 'active';
    try {
      await toast.promise(
        superTechnicianService.updateStatus(tech.id, nextStatus).then(() => {
          setLocalTech((prev) => ({ ...prev, status: nextStatus }));
        }),
        {
          loading: 'Updating technician status...',
          success: `Technician status marked as ${nextStatus}!`,
          error: (err) => err?.message || 'Failed to update technician status.',
        }
      );
    } catch (_) {}
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete technician "${tech.name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      setDeleting(true);
      await toast.promise(
        deleteTechnician(tech.id),
        {
          loading: 'Deleting technician...',
          success: 'Technician deleted successfully!',
          error: (err) => err?.message || 'Failed to delete technician.',
        }
      );
      if (onClose) onClose();
    } catch (_) {
      // Toast handled
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to remove this document?')) return;
    try {
      await toast.promise(
        superTechnicianService.deleteDocument(docId),
        {
          loading: 'Removing document...',
          success: 'Document deleted!',
          error: (err) => err?.message || 'Failed to delete document.',
        }
      );
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (_) {}
  };

  const code = tech.enrollment_no || tech.code || `TECH-${tech.id || 'N/A'}`;
  const baseCity = profile.base_city || tech.baseCity || tech.city || tech.organization?.city || '—';
  const certLevel = profile.cert_level || tech.certLevel || tech.role?.name || 'Central Technician';
  const avatarUrl = tech.avatar_url || tech.avatarUrl || tech.user?.avatar_url || tech.technicianProfile?.avatar_url;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400">
        <Link to="/superadmin/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
          <FleetIcons.Dashboard className="w-3.5 h-3.5" />
          <span>Super Admin</span>
        </Link>
        <span className="text-slate-300 dark:text-zinc-600">/</span>
        <Link to="/superadmin/technicians" className="text-blue-600 dark:text-blue-400 hover:underline">
          Central Technicians
        </Link>
        <span className="text-slate-300 dark:text-zinc-600">/</span>
        <span className="text-slate-900 dark:text-white font-bold">{tech.name || 'Technician Details'}</span>
      </nav>

      {/* Top Bar with Back Button & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose || (() => navigate('/superadmin/technicians'))}
            className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-all inline-flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <span>←</span>
            <span>{t('common.back', 'Back to Technicians')}</span>
          </button>
          <span className="text-slate-300 dark:text-zinc-700">|</span>
          <span className="text-xs font-mono text-slate-500 dark:text-zinc-400 font-semibold">
            {code}
          </span>
          {fetchLoading && (
            <span className="text-[10px] text-blue-600 dark:text-blue-400 animate-pulse font-medium">
              Syncing live data...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Edit Technician */}
          <button
            type="button"
            onClick={() => navigate(`/superadmin/technicians/${tech.id}/edit`)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FleetIcons.Edit className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>

          {/* Delete Technician */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <FleetIcons.Trash className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          {/* Suspend / Activate */}
          <button
            onClick={handleToggleStatus}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              !isSuspended
                ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100'
                : 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100'
            }`}
          >
            {!isSuspended ? 'Suspend Account' : 'Activate Account'}
          </button>

          <Link
            to={`/superadmin/technicians/assign?techId=${tech.id}`}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <span>Assign Work Order</span>
          </Link>
        </div>
      </div>

      {/* Engineer Banner / Header Card */}
      <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {/* Avatar or Initials */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0 overflow-hidden border-2 border-blue-500">
              {avatarUrl ? (
                <img
                  src={getMediaUrl(avatarUrl)}
                  alt={tech.name || 'Technician'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.parentElement) {
                      e.currentTarget.parentElement.innerText = String(tech.name || 'T').charAt(0).toUpperCase();
                    }
                  }}
                />
              ) : (
                String(tech.name || 'T').charAt(0).toUpperCase()
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {tech.name || 'Technician'}
                </h1>
                <span
                  className={`text-[11px] font-bold px-3 py-0.5 rounded-full border uppercase tracking-wider ${
                    isSuspended
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50'
                      : isAssigned
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50'
                  }`}
                >
                  {isSuspended ? 'Suspended' : isAssigned ? 'Assigned' : profile.status || 'Available'}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50">
                  {certLevel}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                {tech.organization?.name || 'Central Pool'} · City: <strong className="text-slate-700 dark:text-zinc-300">{baseCity}</strong> · Code: <span className="font-mono">{code}</span>
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-zinc-300 pt-1 flex-wrap">
                <span>📧 {tech.email || '—'}</span>
                <span>📞 {tech.phone || '—'}</span>
                <span>🆔 <span className="font-mono text-[11px]">{code}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Metric Strips (Real DB Values) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            Skill / Role
          </span>
          <div className="text-lg font-black text-slate-900 dark:text-white mt-1 truncate">
            {certLevel}
          </div>
        </div>
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            City
          </span>
          <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1 truncate">
            {baseCity}
          </div>
        </div>
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Jobs Completed
          </span>
          <div className="text-lg font-black text-blue-600 dark:text-blue-400 mt-1">
            {profile.jobs_completed ?? 0}
          </div>
        </div>
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Rating
          </span>
          <div className="text-lg font-black text-purple-600 dark:text-purple-400 mt-1">
            {profile.rating != null && Number(profile.rating) > 0 ? `${parseFloat(profile.rating).toFixed(1)} ★` : '—'}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2">
        {[
          { key: 'overview', label: 'Profile & Skills' },
          { key: 'workorders', label: `Work Orders (${allWorkOrders.length})` },
          { key: 'documents', label: `Documents (${documents.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.key
                ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Profile & Skills */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
                <span>👤</span> Personal Information
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span className="text-slate-400 dark:text-zinc-500">Full Name</span>
                  <span className="font-bold text-slate-900 dark:text-white">{tech.name || '—'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span className="text-slate-400 dark:text-zinc-500">Staff Code</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">{code}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span className="text-slate-400 dark:text-zinc-500">Email</span>
                  <span className="font-medium text-slate-900 dark:text-white">{tech.email || '—'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span className="text-slate-400 dark:text-zinc-500">Phone</span>
                  <span className="font-mono font-medium text-slate-900 dark:text-white">{tech.phone || '—'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span className="text-slate-400 dark:text-zinc-500">Organization</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{tech.organization?.name || 'Central Pool'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span className="text-slate-400 dark:text-zinc-500">City / State</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    📍 {profile.city || baseCity}{profile.state ? `, ${profile.state}` : ''}
                  </span>
                </div>
                {profile.address && (
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                    <span className="text-slate-400 dark:text-zinc-500">Base Address</span>
                    <span className="font-medium text-slate-900 dark:text-white text-right max-w-[200px] truncate" title={profile.address}>
                      {profile.address}
                    </span>
                  </div>
                )}
                {profile.latitude != null && profile.longitude != null && (
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400 dark:text-zinc-500">GPS Coordinates</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                      🎯 {Number(profile.latitude).toFixed(4)}, {Number(profile.longitude).toFixed(4)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
                <span>🛡️</span> Role & Status
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span className="text-slate-400 dark:text-zinc-500">Skill / Role</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">{certLevel}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span className="text-slate-400 dark:text-zinc-500">Availability</span>
                  <span className="font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    {profile.status || tech.status || 'available'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span className="text-slate-400 dark:text-zinc-500">Jobs Completed</span>
                  <span className="font-bold text-slate-900 dark:text-white">{profile.jobs_completed ?? 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span className="text-slate-400 dark:text-zinc-500">Rating</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {profile.rating != null && Number(profile.rating) > 0 ? `${parseFloat(profile.rating).toFixed(1)} / 5.0 ★` : 'Unrated'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span className="text-slate-400 dark:text-zinc-500">Account Status</span>
                  <span className="font-bold uppercase tracking-wider text-slate-900 dark:text-white">{tech.status || 'active'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400 dark:text-zinc-500">Joined</span>
                  <span className="font-mono text-slate-600 dark:text-zinc-400">
                    {tech.createdAt || tech.created_at ? new Date(tech.createdAt || tech.created_at).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Skills Card (Real DB Skills) */}
          <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
              <span>🛠️</span> Technical Skills
            </h3>
            {skillsList.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {skillsList.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50"
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 dark:text-zinc-500 py-2">
                No specific technical skill tags recorded.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Work Orders (Real DB Data) */}
      {activeTab === 'workorders' && (
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Assigned Work Orders</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Work orders and maintenance tasks assigned to this technician</p>
            </div>
            <Link
              to={`/superadmin/technicians/assign?techId=${tech.id}`}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
            >
              <span>+ Assign Work Order</span>
            </Link>
          </div>

          {allWorkOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-zinc-300">
                <thead className="bg-slate-50 dark:bg-zinc-900/60 text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Vehicle & Depot</th>
                    <th className="py-3 px-4">Category & Details</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">ETA</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                  {allWorkOrders.map((wo) => (
                    <tr key={wo.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">{wo.code}</div>
                        <div className="text-[10px] text-slate-400">
                          {wo.createdAt ? new Date(wo.createdAt).toLocaleDateString() : '—'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {wo.bus_number ? `Bus #${wo.bus_number}` : 'Fleet Equipment'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {wo.depot_name || wo.depot?.name || wo.organization?.name || 'Main Depot'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 dark:text-zinc-200">{wo.issue_category || 'Hardware Maintenance'}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">{wo.description || '—'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          wo.urgency === 'critical'
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50'
                            : wo.urgency === 'high'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                        }`}>
                          {wo.urgency || 'normal'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[11px] font-mono">
                        <div>{wo.eta || 'En Route'}</div>
                        <div className="text-[10px] text-slate-400">
                          {wo.sla_due_at ? new Date(wo.sla_due_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          wo.status === 'resolved' || wo.status === 'closed'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50'
                            : wo.status === 'on_site' || wo.status === 'dispatched'
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50'
                        }`}>
                          {wo.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 dark:text-zinc-500 space-y-2">
              <span className="text-3xl">🛠️</span>
              <p className="text-xs font-medium">No work orders assigned to this technician yet.</p>
              <div className="pt-2">
                <Link
                  to={`/superadmin/technicians/assign?techId=${tech.id}`}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-xs transition-colors inline-block"
                >
                  Assign Work Order
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Verification & KYC Documents (Real DB Data from media_assets) */}
      {activeTab === 'documents' && (
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Documents ({documents.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Official documents, identity proof, and compliance certificates
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/superadmin/technicians/${tech.id}/edit`)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>+ Upload Document</span>
            </button>
          </div>

          {documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc) => {
                const docUrl = getMediaUrl(doc.url);
                const docName = doc.file_name || doc.fileName || doc.storage_key?.split('/')?.pop() || `Document #${doc.id}`;
                return (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center justify-center font-bold text-lg shrink-0">
                        📄
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {docName}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            {doc.purpose || 'Verification Doc'}
                          </span>
                          {doc.size && (
                            <span className="text-[10px] text-slate-400">
                              {(Number(doc.size) / 1024).toFixed(0)} KB
                            </span>
                          )}
                          {doc.createdAt && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(doc.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-slate-200 dark:border-zinc-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                      >
                        <FleetIcons.Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/50 cursor-pointer transition-colors"
                        title="Delete Document"
                      >
                        <FleetIcons.Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 dark:text-zinc-500 space-y-2">
              <span className="text-3xl">📁</span>
              <p className="text-xs font-medium">No verified documents or KYC records uploaded for this technician yet.</p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate(`/superadmin/technicians/${tech.id}/edit`)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-block cursor-pointer"
                >
                  Upload Documents Now
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TechnicianDetailsPage;
