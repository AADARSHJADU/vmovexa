import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { useSuperGovernment } from '../../hooks/superadmin/useSuperGovernment';
import { getMediaUrl } from '../../utils/media';
import toast from 'react-hot-toast';

export const GovernmentDetailsPage = ({ agency: agencyProp = null, onClose = null, onStatusChange = null }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loadAgency, updateStatus, deleteAgency, deleteDocument } = useSuperGovernment();

  const [localAgency, setLocalAgency] = useState(agencyProp);
  const [documents, setDocuments] = useState(agencyProp?.documents || []);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [deleting, setDeleting] = useState(false);

  const agencyId = agencyProp?.id;

  const refreshAgency = useCallback(async () => {
    if (!agencyId) return;
    try {
      setFetchLoading(true);
      const res = await loadAgency(agencyId);
      if (res) {
        setLocalAgency((prev) => ({ ...prev, ...res }));
        if (Array.isArray(res.documents)) {
          setDocuments(res.documents);
        }
      }
    } catch (_) {
      // Keep localAgency fallback
    } finally {
      setFetchLoading(false);
    }
  }, [agencyId, loadAgency]);

  useEffect(() => {
    if (agencyProp) {
      setLocalAgency(agencyProp);
      if (Array.isArray(agencyProp.documents)) setDocuments(agencyProp.documents);
    }
    refreshAgency();
  }, [agencyProp, refreshAgency]);

  const agency = localAgency || {};
  const agencyName = agency.agency_name || agency.name || 'Government Agency';
  const dept = agency.department || '—';
  const officer = agency.contact_name || agency.user?.name || '—';
  const email = agency.email || agency.user?.email || '—';
  const phone = agency.phone || agency.user?.phone || '—';
  const code = agency.code || agency.user?.enrollment_no || `GOV-${agency.id || 'N/A'}`;
  const jurisdiction = agency.jurisdiction || agency.authorized_city || '—';
  const status = agency.status || agency.user?.status || 'active';
  const isAct = status.toLowerCase() === 'active';
  const broadcasts = agency.broadcasts || [];
  const campaigns = agency.campaigns || [];
  const emblemUrl = agency.user?.avatar_url || agency.avatar_url || agency.logo_url || agency.emblem_url || agency.user?.avatarUrl || agency.avatarUrl || agency.logoUrl || agency.emblemUrl;

  const handleToggleStatus = async () => {
    const nextStatus = isAct ? 'suspended' : 'active';
    try {
      await toast.promise(
        updateStatus(agency.id, nextStatus).then(() => {
          setLocalAgency((prev) => ({
            ...prev,
            status: nextStatus,
            user: prev.user ? { ...prev.user, status: nextStatus } : prev.user,
          }));
          if (onStatusChange) onStatusChange();
        }),
        {
          loading: 'Updating agency status...',
          success: `Agency marked as ${nextStatus}!`,
          error: (err) => err?.message || 'Failed to update agency status.',
        }
      );
    } catch (_) {}
  };

  const handleDeleteAgency = async () => {
    if (!window.confirm(`Are you sure you want to delete "${agencyName}"? All associated documents will also be removed.`)) {
      return;
    }

    try {
      setDeleting(true);
      await toast.promise(
        deleteAgency(agency.id),
        {
          loading: 'Deleting agency...',
          success: 'Agency deleted successfully.',
          error: (err) => err?.message || 'Failed to delete agency.',
        }
      );
      if (onClose) onClose();
      if (onStatusChange) onStatusChange();
    } catch (_) {
      // toast handles notification
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to remove this document?')) return;
    try {
      await toast.promise(
        deleteDocument(docId),
        {
          loading: 'Removing document...',
          success: 'Document removed!',
          error: (err) => err?.message || 'Failed to delete document.',
        }
      );
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (_) {}
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400">
        <Link to="/superadmin/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
          <FleetIcons.Dashboard className="w-3.5 h-3.5" />
          <span>Super Admin</span>
        </Link>
        <span className="text-slate-300 dark:text-zinc-600">/</span>
        <Link to="/superadmin/government" className="text-blue-600 dark:text-blue-400 hover:underline">
          Government Agencies
        </Link>
        <span className="text-slate-300 dark:text-zinc-600">/</span>
        <span className="text-slate-900 dark:text-white font-bold">{agency.name || 'Agency Details'}</span>
      </nav>

      {/* Top Bar with Back Button & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-all inline-flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <span>←</span>
            <span>{t('common.back', 'Back to Government Agencies')}</span>
          </button>
          <span className="text-slate-300 dark:text-zinc-700">|</span>
          <span className="text-xs font-mono text-slate-500 dark:text-zinc-400 font-semibold">
            {code}
          </span>
          {fetchLoading && (
            <span className="text-[10px] text-amber-600 dark:text-amber-400 animate-pulse font-medium">
              Syncing live data...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Edit Agency Button */}
          <button
            type="button"
            onClick={() => navigate(`/superadmin/government/${agency.id}/edit`)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FleetIcons.Edit className="w-3.5 h-3.5" />
            <span>Edit Agency</span>
          </button>

          {/* Suspend / Activate Button */}
          <button
            onClick={handleToggleStatus}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              isAct
                ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100'
                : 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100'
            }`}
          >
            {isAct ? 'Suspend Agency' : 'Activate Agency'}
          </button>

          {/* Delete Agency Button */}
          <button
            type="button"
            onClick={handleDeleteAgency}
            disabled={deleting}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <FleetIcons.Trash className="w-3.5 h-3.5" />
            <span>Delete Agency</span>
          </button>
        </div>
      </div>

      {/* Agency Banner / Header Card */}
      <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl border-2 border-amber-200 dark:border-amber-900/50 bg-gradient-to-tr from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 flex items-center justify-center font-black text-2xl shadow-md shrink-0 overflow-hidden text-amber-600 dark:text-amber-400">
              {emblemUrl ? (
                <img
                  src={getMediaUrl(emblemUrl)}
                  alt={agencyName}
                  className="w-full h-full object-contain p-1"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <FleetIcons.Building className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {agencyName}
                </h1>
                <span
                  className={`text-[11px] font-bold px-3 py-0.5 rounded-full border uppercase tracking-wider ${
                    isAct
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50'
                  }`}
                >
                  {status}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 whitespace-nowrap">
                  <FleetIcons.Shield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>{agency.clearance_level || 'Standard'}</span>
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                {dept} · Jurisdiction: <strong className="text-slate-700 dark:text-zinc-300">{jurisdiction}</strong> · Code: <span className="font-mono">{code}</span>
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-zinc-300 pt-1 flex-wrap">
                <span className="flex items-center gap-1"><FleetIcons.Profile className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Contact: <strong>{officer}</strong></span>
                <span className="flex items-center gap-1"><FleetIcons.Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {email}</span>
                <span className="flex items-center gap-1"><FleetIcons.Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Metric Strips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Clearance Level
          </span>
          <div className="text-sm font-black text-amber-600 dark:text-amber-400 mt-1 truncate">
            {agency.clearance_level || 'Standard'}
          </div>
        </div>
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            Jurisdiction
          </span>
          <div className="text-sm font-black text-slate-900 dark:text-white mt-1 truncate">
            {agency.jurisdiction || agency.authorized_city || '—'}
          </div>
        </div>
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Broadcasts
          </span>
          <div className="text-lg font-black text-rose-600 dark:text-rose-400 mt-1">
            {broadcasts.length}
          </div>
        </div>
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Documents
          </span>
          <div className="text-lg font-black text-blue-600 dark:text-blue-400 mt-1">
            {documents.length}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2">
        {[
          { key: 'overview', label: 'Agency Profile' },
          { key: 'documents', label: `Documents (${documents.length})` },
          { key: 'broadcasts', label: `Broadcasts (${broadcasts.length})` },
          { key: 'campaigns', label: `Campaigns (${campaigns.length})` },
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

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
              <FleetIcons.Building className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Agency Details
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                <span className="text-slate-400 dark:text-zinc-500">Agency Name</span>
                <span className="font-bold text-slate-900 dark:text-white">{agency.agency_name || agency.name || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                <span className="text-slate-400 dark:text-zinc-500">Department</span>
                <span className="font-semibold text-slate-900 dark:text-white">{dept}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                <span className="text-slate-400 dark:text-zinc-500">Agency Code</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">{code}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                <span className="text-slate-400 dark:text-zinc-500">Contact Person</span>
                <span className="font-semibold text-slate-900 dark:text-white">{officer}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                <span className="text-slate-400 dark:text-zinc-500">Email</span>
                <span className="font-medium text-slate-900 dark:text-white">{email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                <span className="text-slate-400 dark:text-zinc-500">Phone</span>
                <span className="font-mono font-medium text-slate-900 dark:text-white">{phone}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 dark:text-zinc-500">Enrollment ID</span>
                <span className="font-mono text-slate-600 dark:text-zinc-400">{agency.user?.enrollment_no || '—'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
              <span>🛡️</span> Jurisdiction & Status
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                <span className="text-slate-400 dark:text-zinc-500">Clearance Level</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{agency.clearance_level || 'Standard'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                <span className="text-slate-400 dark:text-zinc-500">Jurisdiction</span>
                <span className="font-semibold text-slate-900 dark:text-white">{agency.jurisdiction || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                <span className="text-slate-400 dark:text-zinc-500">City / State / PIN</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {[agency.city || agency.authorized_city, agency.state, agency.pincode].filter(Boolean).join(', ') || '—'}
                </span>
              </div>
              {agency.latitude && agency.longitude && (
                <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span className="text-slate-400 dark:text-zinc-500">HQ GPS Coordinates</span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${agency.latitude},${agency.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-mono text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    📍 {Number(agency.latitude).toFixed(5)}, {Number(agency.longitude).toFixed(5)} ↗
                  </a>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                <span className="text-slate-400 dark:text-zinc-500">Status</span>
                <span className="font-bold uppercase text-emerald-600 dark:text-emerald-400">{status}</span>
              </div>
              <div className="space-y-1 pt-1">
                <span className="text-slate-400 dark:text-zinc-500 block">Command Office Address</span>
                <p className="font-medium text-slate-800 dark:text-zinc-200 bg-slate-50 dark:bg-zinc-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800 leading-relaxed">
                  {agency.address || agency.office_address || 'No office address registered.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Legal Authorization Documents */}
      {activeTab === 'documents' && (
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>📑</span> Documents ({documents.length})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Official documents, authorization orders, and certificates.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/superadmin/government/${agency.id}/edit`)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 hover:bg-blue-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <FleetIcons.Plus className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </button>
          </div>

          {documents.length === 0 ? (
            <div className="p-12 text-center text-slate-400 dark:text-zinc-500">
              <span className="text-3xl">📄</span>
              <p className="text-xs font-semibold mt-2">No documents uploaded for this agency.</p>
              <button
                type="button"
                onClick={() => navigate(`/superadmin/government/${agency.id}/edit`)}
                className="mt-3 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Upload Document →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                      📄
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {doc.purpose || 'Document'}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {doc.storage_key || doc.file_name || `Document #${doc.id}`}
                      </p>
                      {doc.size && (
                        <p className="text-[10px] text-slate-400">
                          {(doc.size / 1024).toFixed(1)} KB
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {doc.url && (
                      <a
                        href={getMediaUrl(doc.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-blue-600 text-xs font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title="View / Download"
                      >
                        <FleetIcons.Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors cursor-pointer"
                      title="Delete Document"
                    >
                      <FleetIcons.Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Broadcasts */}
      {activeTab === 'broadcasts' && (
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Emergency Broadcasts</h3>
          {broadcasts.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-zinc-500 py-6 text-center">
              No emergency broadcasts issued by this agency.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {broadcasts.map((b) => (
                <div key={b.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{b.title || 'Emergency Alert'}</div>
                    <div className="text-[11px] text-slate-400">Severity: {b.severity || 'Medium'}</div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{b.created_at || '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Public PSAs */}
      {activeTab === 'campaigns' && (
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Public Safety Campaigns</h3>
          {campaigns.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-zinc-500 py-6 text-center">
              No public safety campaigns registered by this agency.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {campaigns.map((c) => (
                <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{c.name || 'Public Campaign'}</div>
                    <div className="text-[11px] text-slate-400">Status: {c.status}</div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{c.code}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GovernmentDetailsPage;
