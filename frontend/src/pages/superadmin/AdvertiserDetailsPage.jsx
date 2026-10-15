import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useSuperAdvertiser } from '../../hooks/superadmin/useSuperAdvertiser';
import { superAdvertiserService } from '../../api/services/superadmin/advertiser.service';
import { getMediaUrl } from '../../utils/media';
import toast from 'react-hot-toast';

export const AdvertiserDetailsPage = ({ advertiser: advProp = null, onClose = null, onStatusChange = null }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const { deleteAdvertiser } = useSuperAdvertiser();

  const advId = advProp?.id || paramId;

  const [localAdv, setLocalAdv] = useState(advProp);
  const [documents, setDocuments] = useState(advProp?.documents || []);
  const [campaigns, setCampaigns] = useState(advProp?.campaigns || []);
  const [fetchLoading, setFetchLoading] = useState(!advProp && !!advId);
  const [fetchError, setFetchError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [deleting, setDeleting] = useState(false);

  const refreshAdvertiser = useCallback(async () => {
    if (!advId) return;
    try {
      setFetchLoading(true);
      setFetchError(null);
      const res = await superAdvertiserService.getAdvertiser(advId);
      if (res) {
        setLocalAdv(res);
        if (Array.isArray(res.documents)) {
          setDocuments(res.documents);
        }
        if (Array.isArray(res.campaigns)) {
          setCampaigns(res.campaigns);
        }
      }
    } catch (err) {
      console.error('Failed to load advertiser details:', err);
      setFetchError(err?.message || 'Advertiser not found or failed to load.');
    } finally {
      setFetchLoading(false);
    }
  }, [advId]);

  useEffect(() => {
    if (advProp) {
      setLocalAdv(advProp);
      if (Array.isArray(advProp.documents)) setDocuments(advProp.documents);
      if (Array.isArray(advProp.campaigns)) setCampaigns(advProp.campaigns);
    }
    refreshAdvertiser();
  }, [advProp, refreshAdvertiser]);

  const adv = localAdv || {};
  const company = adv.company_name || adv.name || '—';
  const contact = adv.contact_name || adv.user?.name || '—';
  const email = adv.email || adv.user?.email || '—';
  const phone = adv.phone || adv.user?.phone || '—';
  const code = adv.code || adv.user?.enrollment_no || `ADV-${adv.id || 'N/A'}`;
  const status = adv.status || adv.user?.status || 'pending_approval';
  const isAct = status.toLowerCase() === 'active' || status.toLowerCase() === 'approved';
  const logoUrl = adv.user?.avatar_url || adv.avatar_url || adv.logo_url || adv.user?.avatarUrl || adv.avatarUrl || adv.logoUrl;

  const handleToggleStatus = async () => {
    const nextStatus = isAct ? 'suspended' : 'active';
    try {
      await toast.promise(
        superAdvertiserService.updateStatus(adv.id, nextStatus).then(() => {
          setLocalAdv((prev) => ({
            ...prev,
            status: nextStatus,
            user: prev.user ? { ...prev.user, status: nextStatus } : prev.user,
          }));
          if (onStatusChange) onStatusChange();
        }),
        {
          loading: isAct ? 'Deactivating advertiser...' : 'Activating advertiser...',
          success: `Advertiser successfully ${isAct ? 'deactivated' : 'activated'}!`,
          error: (err) => err?.message || 'Failed to update advertiser status.',
        }
      );
    } catch (_) {}
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete advertiser "${company}"? All campaigns and records will be deleted.`)) {
      return;
    }
    try {
      setDeleting(true);
      await toast.promise(
        deleteAdvertiser(adv.id),
        {
          loading: 'Deleting advertiser...',
          success: 'Advertiser deleted successfully!',
          error: (err) => err?.message || 'Failed to delete advertiser.',
        }
      );
      if (onClose) {
        onClose();
      } else {
        navigate('/superadmin/advertisers');
      }
      if (onStatusChange) onStatusChange();
    } catch (_) {
      // Handled by toast
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to remove this document?')) return;
    try {
      await toast.promise(
        superAdvertiserService.deleteDocument(docId),
        {
          loading: 'Removing document...',
          success: 'Document deleted!',
          error: (err) => err?.message || 'Failed to delete document.',
        }
      );
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (_) {}
  };

  if (fetchLoading && !localAdv) {
    return (
      <div className="w-full space-y-6 animate-in fade-in duration-200">
        <Breadcrumb
          items={[
            { label: 'Super Admin', path: '/superadmin/dashboard', icon: FleetIcons.Dashboard },
            { label: 'Advertisers', path: '/superadmin/advertisers' },
            { label: 'Loading Details...' },
          ]}
        />
        <div className="min-h-[400px] flex flex-col items-center justify-center p-12 bg-white dark:bg-[#11141d] rounded-2xl border border-slate-200 dark:border-zinc-800">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold text-slate-600 dark:text-zinc-300">Loading advertiser profile...</p>
        </div>
      </div>
    );
  }

  if (!fetchLoading && !localAdv) {
    return (
      <div className="w-full space-y-6 animate-in fade-in duration-200">
        <Breadcrumb
          items={[
            { label: 'Super Admin', path: '/superadmin/dashboard', icon: FleetIcons.Dashboard },
            { label: 'Advertisers', path: '/superadmin/advertisers' },
            { label: 'Not Found' },
          ]}
        />
        <div className="min-h-[360px] flex flex-col items-center justify-center p-12 bg-white dark:bg-[#11141d] rounded-2xl border border-slate-200 dark:border-zinc-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto">
            <FleetIcons.Building className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Advertiser Not Found</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm">
              {fetchError || `Could not find an advertiser with ID "${advId}".`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onClose) onClose();
              else navigate('/superadmin/advertisers');
            }}
            className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-500 transition-colors cursor-pointer shadow-xs inline-flex items-center gap-2"
          >
            <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Advertisers</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Super Admin', path: '/superadmin/dashboard', icon: FleetIcons.Dashboard },
          { label: 'Advertisers', path: '/superadmin/advertisers' },
          { label: adv.company_name || adv.name || 'Advertiser Details' },
        ]}
      />

      {/* Top Bar with Back Button & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (onClose) onClose();
              else navigate('/superadmin/advertisers');
            }}
            className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-all inline-flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Advertisers</span>
          </button>
          <span className="text-slate-300 dark:text-zinc-700">|</span>
          <span className="text-xs font-mono text-slate-500 dark:text-zinc-400 font-semibold">
            {code}
          </span>
          {fetchLoading && (
            <span className="text-[10px] text-blue-600 dark:text-blue-400 animate-pulse font-medium">
              Syncing...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Edit Button */}
          <button
            type="button"
            onClick={() => navigate(`/superadmin/advertisers/${adv.id}/edit`)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FleetIcons.Edit className="w-3.5 h-3.5 text-blue-500" />
            <span>Edit Advertiser</span>
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <FleetIcons.Trash className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          {/* Deactivate / Activate */}
          <button
            onClick={handleToggleStatus}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              isAct
                ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100'
                : 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100'
            }`}
          >
            {isAct ? 'Deactivate Account' : 'Activate Account'}
          </button>
        </div>
      </div>

      {/* Brand Header Banner */}
      <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {/* Logo or Initials */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-700 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0 overflow-hidden border-2 border-blue-500">
              {logoUrl ? (
                <img
                  src={getMediaUrl(logoUrl)}
                  alt={company}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.parentElement) {
                      e.currentTarget.parentElement.innerText = company.charAt(0).toUpperCase();
                    }
                  }}
                />
              ) : (
                company.charAt(0).toUpperCase()
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {company}
                </h1>
                <span
                  className={`text-[11px] font-bold px-3 py-0.5 rounded-full border uppercase tracking-wider ${
                    isAct
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50'
                      : status === 'pending_approval'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50'
                  }`}
                >
                  {isAct ? 'Active' : (status === 'pending_approval' ? 'Pending' : 'Deactivated')}
                </span>
                {adv.verified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                    <FleetIcons.Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                    Unverified
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                Business Type: <strong className="text-slate-700 dark:text-zinc-300">{adv.business_type || '—'}</strong> · Code: <span className="font-mono">{code}</span>
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-zinc-300 pt-1 flex-wrap">
                <span className="flex items-center gap-1"><FleetIcons.Driver className="w-3.5 h-3.5 text-slate-500 shrink-0" /> Contact: <strong>{contact}</strong></span>
                <span className="flex items-center gap-1"><FleetIcons.Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" /> {email}</span>
                <span className="flex items-center gap-1"><FleetIcons.Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" /> {phone}</span>
                {adv.website && (
                  <a href={adv.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                    <FleetIcons.Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" /> {adv.website}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2">
        {[
          { key: 'overview', label: 'Company Profile' },
          { key: 'campaigns', label: `Campaigns (${campaigns.length})` },
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

      {/* Tab 1: Profile & Commercials */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
              <FleetIcons.Building className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Company Details
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                <span className="text-slate-400 dark:text-zinc-500">Company Name</span>
                <span className="font-bold text-slate-900 dark:text-white">{company}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                <span className="text-slate-400 dark:text-zinc-500">Account Code</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">{code}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                <span className="text-slate-400 dark:text-zinc-500">Business Type</span>
                <span className="font-semibold text-purple-600 dark:text-purple-400">{adv.business_type || 'Commercial'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                <span className="text-slate-400 dark:text-zinc-500">Website</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">{adv.website || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                <span className="text-slate-400 dark:text-zinc-500">Address</span>
                <span className="font-medium text-slate-800 dark:text-zinc-200 text-right max-w-xs truncate">{adv.address || '—'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 dark:text-zinc-500">Created On</span>
                <span className="font-mono text-slate-600 dark:text-zinc-400">
                  {adv.createdAt || adv.created_at ? new Date(adv.createdAt || adv.created_at).toLocaleString() : '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
              <FleetIcons.CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Billing & Tax Details
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                <span className="text-slate-400 dark:text-zinc-500">Contact Person</span>
                <span className="font-bold text-slate-900 dark:text-white">{contact}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                <span className="text-slate-400 dark:text-zinc-500">GSTIN</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">{adv.gstin || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                <span className="text-slate-400 dark:text-zinc-500">PAN Number</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">{adv.pan || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                <span className="text-slate-400 dark:text-zinc-500">Billing Email</span>
                <span className="font-medium text-slate-900 dark:text-white">{adv.billing_email || email}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 dark:text-zinc-500">Payment Terms</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{adv.payment_terms || 'Prepaid'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Campaigns */}
      {activeTab === 'campaigns' && (
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-3">
            Campaigns ({campaigns.length})
          </h3>
          {campaigns.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {campaigns.map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{c.title}</div>
                    <div className="text-[11px] text-slate-400">Budget: ₹{parseFloat(c.budget || 0).toLocaleString()}</div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
                    {c.status || 'Active'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 dark:text-zinc-500 space-y-2">
              <FleetIcons.Broadcast className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto" />
              <p className="text-xs font-medium">No campaigns found for this advertiser.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Legal Documents */}
      {activeTab === 'documents' && (
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Documents ({documents.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                View uploaded business documents and certificates.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/superadmin/advertisers/${adv.id}/edit`)}
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
                        <FleetIcons.Document className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {docName}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            {doc.purpose || 'Document'}
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
              <FleetIcons.Folder className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto" />
              <p className="text-xs font-medium">No documents uploaded for this advertiser yet.</p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate(`/superadmin/advertisers/${adv.id}/edit`)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-block cursor-pointer"
                >
                  Upload Document
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvertiserDetailsPage;
