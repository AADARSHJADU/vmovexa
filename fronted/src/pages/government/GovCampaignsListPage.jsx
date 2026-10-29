import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from '../../hooks/useTranslation';
import { useGovernmentRole } from '../../hooks/government/useGovernmentRole';
import { resolveFileUrl } from '../../api/services/upload.service';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { FleetIcons } from '../../components/FleetIcons';
import {
  IconEye,
  IconEdit,
  IconCheckCircle,
  IconPlay,
  IconPause,
  IconStop,
  IconBarChart,
  IconUser,
  IconVideo,
  IconDocument,
  IconImage,
  IconLink,
  IconQrCode,
  IconScreen,
  IconMegaphone,
  IconTrash,
  IconPhone,
  IconMail,
} from '../../components/ui/CampaignIcons';

const statusColors = {
  Running: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold',
  live: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold',
  Approved: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold',
  approved: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold',
  'Under Review': 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold',
  pending_approval: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold',
  Scheduled: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold',
  Paused: 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 font-bold',
  paused: 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 font-bold',
  Completed: 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 font-bold',
  completed: 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 font-bold',
  Draft: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 font-bold',
  draft: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 font-bold',
  Rejected: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold',
  rejected: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold',
};

const tabs = ['All', 'Approved', 'Running', 'Under Review', 'Scheduled', 'Draft', 'Completed', 'Paused', 'Rejected'];

export const GovCampaignsListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    user,
    campaigns: rtkCampaigns,
    loadCampaigns,
    approveCampaign,
    rejectCampaign,
    startCampaign,
    stopCampaign,
    endCampaign,
    deleteCampaign,
    canCreateCampaign,
    canEditCampaign,
    canDeleteCampaign,
    canVerifyCampaign,
    loading,
  } = useGovernmentRole();

  const isSuperAdmin = user?.role === 'ROLE-SUPER-ADMIN' || user?.role?.code === 'ROLE-SUPER-ADMIN' || user?.clearance === 'ROOT' || location.pathname.startsWith('/superadmin');
  const basePath = isSuperAdmin ? '/superadmin/government' : '/government';

  const [refreshing, setRefreshing] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadCampaigns();
      toast.success('Government campaigns list refreshed');
    } catch (err) {
      toast.error(err?.message || 'Failed to refresh campaigns');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCampaigns().catch(() => {});
  }, [loadCampaigns]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = () => setOpenMenuId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleStart = async (campId) => {
    try {
      const res = await startCampaign(campId);
      const count = res?.mqttDispatched ?? res?.dataValues?.mqttDispatched;
      if (typeof count === 'number') {
        toast.success(`Campaign broadcast started! Dispatched to ${count} device(s) via MQTT`);
      } else {
        toast.success('Campaign broadcast started! Ad is live on transit screens');
      }
      await loadCampaigns().catch(() => {});
    } catch (e) {
      toast.error(e?.message || 'Failed to start campaign');
    }
  };

  const handlePause = async (campId) => {
    try {
      await toast.promise(stopCampaign(campId), {
        loading: 'Pausing transit broadcast...',
        success: 'Campaign broadcast paused',
        error: (e) => e?.message || 'Failed to pause campaign',
      });
      await loadCampaigns().catch(() => {});
    } catch (_) {}
  };

  const handleEnd = async (campId) => {
    if (!window.confirm('Are you sure you want to end this campaign? Broadcast will be permanently stopped.')) return;
    try {
      await toast.promise(endCampaign(campId), {
        loading: 'Ending campaign broadcast...',
        success: 'Campaign ended successfully',
        error: (e) => e?.message || 'Failed to end campaign',
      });
      await loadCampaigns().catch(() => {});
    } catch (_) {}
  };

  const handleApprove = async (campId) => {
    if (verifyingId) return;
    setVerifyingId(campId);
    try {
      await toast.promise(approveCampaign(campId), {
        loading: 'Approving government broadcast & issuing clearance...',
        success: 'Campaign approved! Public service broadcast cleared for transit screens.',
        error: (e) => e?.message || 'Approval failed',
      });
      await loadCampaigns().catch(() => {});
    } catch (_) {
    } finally {
      setVerifyingId(null);
    }
  };

  const handleReject = async (campId) => {
    const reason = window.prompt('Enter rejection / revision remarks for department:', 'Creative specifications incomplete');
    if (reason === null) return;
    try {
      await toast.promise(rejectCampaign(campId, reason), {
        loading: 'Submitting revision remarks...',
        success: 'Campaign rejected with remarks',
        error: (e) => e?.message || 'Failed to reject campaign',
      });
      await loadCampaigns().catch(() => {});
    } catch (_) {}
  };

  const handleDelete = async (campaign) => {
    if (!window.confirm(`Are you sure you want to delete campaign "${campaign.name}"? This action cannot be undone.`)) return;
    try {
      await toast.promise(deleteCampaign(campaign.dbId || campaign.id), {
        loading: 'Deleting campaign...',
        success: 'Campaign deleted successfully',
        error: (e) => e?.message || 'Failed to delete campaign',
      });
      await loadCampaigns().catch(() => {});
    } catch (_) {}
  };

  // Map real backend RTK campaigns to standard view model
  const campaigns = useMemo(() => {
    const list = Array.isArray(rtkCampaigns) ? rtkCampaigns : (rtkCampaigns?.items || rtkCampaigns?.rows || []);
    if (list.length > 0) {
      return list
        .filter((c) => {
          // Strictly show only government campaigns in government portal
          if (c.owner_type === 'advertiser' && c.type === 'commercial_ad' && !c.government_agency_id) {
            return false;
          }
          return c.owner_type === 'government' || c.type === 'government_psa' || Boolean(c.government_agency_id) || Boolean(c.agency) || String(c.code || '').includes('GOV');
        })
        .map((c) => {
        let pb = null;
        if (c.payment_breakdown) {
          pb = typeof c.payment_breakdown === 'string'
            ? (() => { try { return JSON.parse(c.payment_breakdown); } catch (_) { return null; } })()
            : c.payment_breakdown;
        }
        const totalAmount = Number(pb?.totalAmount ?? c.budget ?? 0);
        const totalScreens = c.targets?.reduce((acc, t) => acc + (t.screens_count || 0), 0) || 0;

        const mappedStatus = c.status === 'live' ? 'Running'
          : c.status === 'paused' ? 'Paused'
          : c.status === 'pending_approval' ? 'Under Review'
          : c.status === 'approved' ? 'Approved'
          : c.status === 'rejected' ? 'Rejected'
          : c.status === 'completed' ? 'Completed'
          : 'Draft';

        const rawThumb = c.media?.[0]?.file_url || null;
        const resolvedThumb = rawThumb ? resolveFileUrl(rawThumb) : null;
        const primaryMediaType = c.media?.[0]?.media_type || (c.video_url ? 'video' : 'image');

        return {
          id: c.code || `CMP-${c.id}`,
          dbId: c.id,
          name: c.title || c.name || 'Public Awareness Campaign',
          brandName: c.client_company || c.brand_name || c.agency?.agency_name || c.agency?.name || 'Department of Public Safety',
          clientName: c.client_name || c.agency?.contact_name || '',
          clientCompany: c.client_company || c.agency?.agency_name || '',
          clientPhone: c.client_phone || '',
          clientEmail: c.client_email || '',
          category: c.category || 'Public Awareness',
          status: mappedStatus,
          rawStatus: c.status,
          startDate: c.start_date || '—',
          endDate: c.end_date || '—',
          budget: totalAmount,
          totalAmount: totalAmount,
          totalScreens,
          impressions: c.impressions_delivered || c.impressions || (c.status === 'live' ? 14200 : 0),
          cities: c.targets?.length || (c.targets?.[0]?.city ? 1 : 0),
          thumbnail: resolvedThumb,
          mediaType: primaryMediaType,
          qrCode: c.qrCodes?.[0]?.code || '',
          fleetOperators: c.targets?.map(t => t.fleet_name || t.city).filter(Boolean) || [],
          paymentStatus: c.payment?.payment_mode === 'offline'
            ? 'Treasury Paid'
            : c.payment?.payment_mode === 'online'
            ? 'Online Paid'
            : c.payment_status === 'paid'
            ? 'Gov Cleared'
            : 'Pending Sanction',
          paymentToken: c.payment_token || c.id,
          priority: c.priority || 'Normal',
          paymentMode: c.payment?.payment_mode || null,
          offlineMethod: c.payment?.offline_method || null,
          payment: c.payment || null,
          raw: c,
        };
      });
    }
    return [];
  }, [rtkCampaigns]);

  // Filters & State
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('Recent');
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'table'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const tabCounts = useMemo(() => {
    return tabs.reduce((acc, tab) => {
      acc[tab] = tab === 'All' ? campaigns.length : campaigns.filter(c => c.status === tab).length;
      return acc;
    }, {});
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    let list = campaigns.filter(c => {
      const q = search.toLowerCase();
      const matchSearch =
        String(c.name || '').toLowerCase().includes(q) ||
        String(c.brandName || '').toLowerCase().includes(q) ||
        String(c.clientName || '').toLowerCase().includes(q) ||
        String(c.clientCompany || '').toLowerCase().includes(q) ||
        String(c.clientPhone || '').toLowerCase().includes(q) ||
        String(c.clientEmail || '').toLowerCase().includes(q) ||
        String(c.category || '').toLowerCase().includes(q) ||
        String(c.id || '').toLowerCase().includes(q);
      const matchTab = activeTab === 'All' || c.status === activeTab;
      return matchSearch && matchTab;
    });

    if (sortBy === 'Name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'Budget-High') {
      list.sort((a, b) => b.budget - a.budget);
    } else if (sortBy === 'Budget-Low') {
      list.sort((a, b) => a.budget - b.budget);
    } else if (sortBy === 'Screens') {
      list.sort((a, b) => b.totalScreens - a.totalScreens);
    } else {
      list.sort((a, b) => String(b.dbId || b.id).localeCompare(String(a.dbId || a.id)));
    }
    return list;
  }, [campaigns, search, activeTab, sortBy]);

  // Pagination Math
  const totalItems = filteredCampaigns.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedCampaigns = filteredCampaigns.slice(startIndex, endIndex);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="w-full space-y-6 pb-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'Dashboard', to: `${basePath}/dashboard` },
              { label: 'Campaigns' }
            ]}
            className="mb-2"
          />
          <h1 className="text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
            {t('gov_campaigns.title', 'Government Campaigns')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
            {t('gov_campaigns.subtitle', 'Manage, track, and monitor public welfare communication across transit fleets.')}
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <RefreshButton onClick={handleRefresh} loading={refreshing || loading} />

          {(canCreateCampaign || isSuperAdmin) && (
            <Link
              to={`${basePath}/campaigns/create`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-bold active:scale-[0.99] transition-all shadow-sm shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>{t('gov_campaigns.create_btn', 'Create Campaign')}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Controls Bar: Search + Sort + View Switch */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder={t('gov_campaigns.search_placeholder', 'Search by campaign name, department, contact, or ID...')}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-700 transition-all shadow-sm"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setCurrentPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 px-1.5 py-0.5 rounded-md"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters and View Mode Switch */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs sm:text-sm text-slate-700 dark:text-zinc-300 font-semibold focus:outline-none focus:ring-2 focus:ring-slate-300 shadow-sm cursor-pointer"
          >
            <option value="Recent">{t('gov.campaigns.sort_recent')}</option>
            <option value="Name">{t('gov.campaigns.sort_name')}</option>
            <option value="Budget-High">{t('gov.campaigns.sort_budget_high')}</option>
            <option value="Budget-Low">{t('gov.campaigns.sort_budget_low')}</option>
            <option value="Screens">{t('gov.campaigns.sort_screens')}</option>
          </select>

          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            tableValue="table"
            cardValue="card"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800/80 p-1.5 rounded-2xl w-full sm:w-fit overflow-x-auto no-scrollbar border border-slate-200/60 dark:border-zinc-700/60">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === tab
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm border border-slate-200/60 dark:border-zinc-700'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            {tab}
            <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
              activeTab === tab ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white' : 'bg-slate-200/70 dark:bg-zinc-700/50 text-slate-500 dark:text-zinc-400'
            }`}>
              {tabCounts[tab] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* VIEW 1: CARD GRID VIEW (Ditto Advertiser Layout) */}
      {viewMode === 'card' && paginatedCampaigns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {paginatedCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-zinc-700 transition-all flex flex-col group relative"
            >
              {/* Top Accent Gradient Line */}
              <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-t-2xl" />

              {/* Card Header & Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  {/* Top Meta Row: ID + Status + 3-Dots */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-[11px] font-mono font-bold border border-slate-200 dark:border-zinc-700">
                      {campaign.id}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-2xs ${statusColors[campaign.status] || 'bg-slate-100 dark:bg-zinc-800 text-slate-600'}`}>
                        {campaign.status}
                      </span>

                      {/* 3-DOTS CONTEXT MENU BUTTON */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === campaign.id ? null : campaign.id);
                          }}
                          className="p-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 transition-colors border border-slate-200 dark:border-zinc-700 shadow-2xs"
                          title={t('common.options')}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                          </svg>
                        </button>

                        {/* 3-DOTS DROPDOWN MENU */}
                        {openMenuId === campaign.id && (
                          <div
                            className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-2xl py-1.5 text-left text-xs font-semibold text-slate-700 dark:text-zinc-300 animate-in fade-in zoom-in-95"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                navigate(`${basePath}/campaigns/${campaign.id}`);
                              }}
                              className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-900 dark:text-white font-bold"
                            >
                              <IconEye className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
                              <span>{t('common.view_details')}</span>
                            </button>

                            {/* Edit Campaign */}
                            {(canEditCampaign || isSuperAdmin) && ['draft', 'pending_approval', 'rejected'].includes(campaign.rawStatus || campaign.status?.toLowerCase()) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  navigate(`${basePath}/campaigns/create?edit=${campaign.dbId || campaign.id}`);
                                }}
                                className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-medium"
                              >
                                <IconEdit className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
                                <span>{t('common.edit_campaign')}</span>
                              </button>
                            )}

                            {/* Approve Campaign (SuperAdmin or Authority) */}
                            {(canVerifyCampaign || isSuperAdmin) && (campaign.rawStatus === 'pending_approval' || campaign.status === 'Under Review') && (
                              <button
                                type="button"
                                disabled={verifyingId === (campaign.dbId || campaign.id)}
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleApprove(campaign.dbId || campaign.id);
                                }}
                                className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold disabled:opacity-50"
                              >
                                {verifyingId === (campaign.dbId || campaign.id) ? (
                                  <>
                                    <span className="w-3.5 h-3.5 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin shrink-0" />
                                    <span>{t('gov.campaigns.approving')}</span>
                                  </>
                                ) : (
                                  <>
                                    <IconCheckCircle className="w-4 h-4 text-emerald-600" />
                                    <span>{t('gov.campaigns.approve_broadcast')}</span>
                                  </>
                                )}
                              </button>
                            )}

                            {/* Start Broadcast - When Approved & Paid */}
                            {(campaign.paymentStatus === 'Paid' || campaign.rawPaymentStatus === 'paid') && (campaign.status === 'Approved' || campaign.rawStatus === 'approved') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleStart(campaign.dbId || campaign.id);
                                }}
                                className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold"
                              >
                                <IconPlay className="w-4 h-4 text-emerald-600" />
                                <span>{t('gov.campaigns.start_broadcast')}</span>
                              </button>
                            )}

                            {/* Pause Ad */}
                            {campaign.status === 'Running' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handlePause(campaign.dbId || campaign.id);
                                }}
                                className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold"
                              >
                                <IconPause className="w-4 h-4 text-amber-600" />
                                <span>{t('gov.campaigns.pause_broadcast')}</span>
                              </button>
                            )}

                            {/* Resume Ad */}
                            {campaign.status === 'Paused' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleStart(campaign.dbId || campaign.id);
                                }}
                                className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold"
                              >
                                <IconPlay className="w-4 h-4 text-emerald-600" />
                                <span>{t('gov.campaigns.resume_broadcast')}</span>
                              </button>
                            )}

                            {/* End Campaign */}
                            {(campaign.status === 'Running' || campaign.status === 'Paused') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleEnd(campaign.dbId || campaign.id);
                                }}
                                className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-bold"
                              >
                                <IconStop className="w-4 h-4 text-rose-600" />
                                <span>{t('gov.campaigns.end_campaign')}</span>
                              </button>
                            )}

                            {/* Reject Campaign */}
                            {(campaign.rawStatus === 'pending_approval' || campaign.status === 'Under Review') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleReject(campaign.dbId || campaign.id);
                                }}
                                className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-bold"
                              >
                                <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>{t('gov.campaigns.reject_broadcast')}</span>
                              </button>
                            )}

                            <div className="my-1 border-t border-slate-100 dark:border-zinc-800" />

                            {/* Delete Campaign */}
                            {(canDeleteCampaign || isSuperAdmin) && ['draft', 'pending_approval', 'rejected', 'completed'].includes(campaign.rawStatus || campaign.status?.toLowerCase()) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleDelete(campaign);
                                }}
                                className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-bold"
                              >
                                <IconTrash className="w-4 h-4 text-rose-600" />
                                <span>{t('gov.campaigns.delete_campaign')}</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Campaign Title & Department Info */}
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-zinc-100 tracking-tight leading-snug line-clamp-1" title={campaign.name}>
                      {campaign.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-zinc-400 font-medium">
                      <span className="font-bold text-slate-700 dark:text-zinc-300">{campaign.brandName}</span>
                      {campaign.clientName && (
                        <>
                          <span className="text-slate-300 dark:text-zinc-600">·</span>
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-semibold border border-blue-100 dark:border-blue-900 text-[11px]">
                            <IconUser className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            <span>{t('gov.campaigns.contact_label')}</span>
                            <span className="font-bold">{campaign.clientName}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Badges Row: Format, QR, Priority */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {campaign.mediaType && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[10px] font-bold uppercase tracking-wider border border-slate-200 dark:border-zinc-700">
                        {campaign.mediaType === 'video' ? (
                          <>
                            <IconVideo className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                            <span>{t('gov.campaigns.video')}</span>
                          </>
                        ) : campaign.mediaType === 'pdf' ? (
                          <>
                            <IconDocument className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                            <span>{t('gov.campaigns.pdf')}</span>
                          </>
                        ) : campaign.mediaType === 'url' ? (
                          <>
                            <IconLink className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            <span>URL</span>
                          </>
                        ) : (
                          <>
                            <IconImage className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>{t('gov.campaigns.image')}</span>
                          </>
                        )}
                      </span>
                    )}
                    {campaign.qrCode && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200/80 dark:border-emerald-800 font-mono">
                        <IconQrCode className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>{campaign.qrCode}</span>
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold border border-indigo-100 dark:border-indigo-800">
                      Payment: {campaign.paymentStatus}
                    </span>
                    {(campaign.paymentMode === 'offline' || campaign.raw?.payment?.payment_mode === 'offline') && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold border border-amber-200 dark:border-amber-800">
                        TREASURY OFFLINE
                      </span>
                    )}
                    {(campaign.paymentMode === 'online' || campaign.raw?.payment?.payment_mode === 'online') && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                        ONLINE PAID
                      </span>
                    )}
                  </div>
                </div>

                {/* Schedule & Budget Bar */}
                <div className="flex items-center justify-between text-xs pt-3 pb-2 border-t border-slate-100 dark:border-zinc-800">
                  <div>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">{t('gov.campaigns.flight_duration')}</p>
                    <p className="font-bold text-slate-700 dark:text-zinc-300 mt-0.5">{campaign.startDate} – {campaign.endDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">{t('gov.campaigns.budget_grant')}</p>
                    <p className="font-black text-slate-900 dark:text-white text-sm mt-0.5">
                      {campaign.totalAmount > 0 ? `₹ ${campaign.totalAmount.toLocaleString('en-IN')}` : 'Public Welfare (PSA)'}
                    </p>
                  </div>
                </div>

                {/* Target Screens Pill */}
                <div className="bg-slate-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800 text-center text-xs">
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider">{t('gov.campaigns.target_screens')}</p>
                  <p className="font-black text-blue-700 dark:text-blue-400 text-sm mt-0.5 flex items-center justify-center gap-1.5">
                    <IconScreen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{campaign.totalScreens.toLocaleString()} Screens</span>
                  </p>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-medium">
                      {campaign.cities} {campaign.cities === 1 ? 'City' : 'Cities'}
                      {campaign.fleetOperators?.[0] ? ` · ${campaign.fleetOperators[0]}` : ''}
                    </span>
                  </div>

                  <Link
                    to={`${basePath}/campaigns/${campaign.id}`}
                    className="inline-flex items-center gap-1 text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors group-hover:translate-x-0.5 duration-200"
                  >
                    <span>{t('common.view_details')}</span>
                    <span><FleetIcons.ArrowRight className="w-3.5 h-3.5 inline-block" /></span>
                  </Link>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: TABLE VIEW */}
      {viewMode === 'table' && paginatedCampaigns.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-visible relative min-h-[320px]">
          <div className="overflow-x-auto pb-28 pt-1 no-scrollbar overflow-y-visible">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-950/60 text-[11px] font-black uppercase text-slate-500 dark:text-zinc-400 tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">{t('common.campaign')}</th>
                  <th className="py-3.5 px-4">{t('common.status')}</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">{t('common.duration')}</th>
                  <th className="py-3.5 px-4 hidden lg:table-cell">{t('gov.campaigns.target_screens')}</th>
                  <th className="py-3.5 px-4">{t('gov.campaigns.budget_grant')}</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">{t('common.impressions')}</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                {paginatedCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors group">
                    {/* Campaign Info + Icon Box */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-800 dark:to-zinc-800/80 border border-blue-200/80 dark:border-zinc-700 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                          {campaign.mediaType === 'video' ? (
                            <IconVideo className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          ) : campaign.mediaType === 'pdf' ? (
                            <IconDocument className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                          ) : campaign.mediaType === 'url' ? (
                            <IconLink className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <IconMegaphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            to={`${basePath}/campaigns/${campaign.id}`}
                            className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate block text-sm"
                          >
                            {campaign.name}
                          </Link>
                          <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium truncate mt-0.5">
                            {campaign.brandName} · <span className="font-mono text-slate-500 dark:text-zinc-400">{campaign.id}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status & Payment Mode Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${statusColors[campaign.status] || 'bg-slate-100 dark:bg-zinc-800 text-slate-600'}`}>
                          {campaign.status}
                        </span>
                        {(campaign.paymentMode === 'offline' || campaign.raw?.payment?.payment_mode === 'offline') && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[9px] font-bold border border-amber-200 dark:border-amber-800">
                            TREASURY
                          </span>
                        )}
                        {(campaign.paymentMode === 'online' || campaign.raw?.payment?.payment_mode === 'online') && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold border border-emerald-200 dark:border-emerald-800">
                            ONLINE PAID
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="py-4 px-4 whitespace-nowrap text-slate-600 dark:text-zinc-400 font-medium hidden md:table-cell">
                      {campaign.startDate} – {campaign.endDate}
                    </td>

                    {/* Target Screens */}
                    <td className="py-4 px-4 whitespace-nowrap hidden lg:table-cell">
                      <p className="font-bold text-slate-900 dark:text-white">{campaign.totalScreens.toLocaleString()} Screens</p>
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500">{campaign.cities} Cities</p>
                    </td>

                    {/* Budget / Grant */}
                    <td className="py-4 px-4 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                      {campaign.totalAmount > 0 ? `₹ ${campaign.totalAmount.toLocaleString('en-IN')}` : 'Public Welfare'}
                    </td>

                    {/* Impressions */}
                    <td className="py-4 px-4 whitespace-nowrap hidden sm:table-cell text-slate-700 dark:text-zinc-300 font-medium">
                      {campaign.impressions.toLocaleString()}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`${basePath}/campaigns/${campaign.id}`}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700 font-bold text-xs transition-colors flex items-center gap-1"
                        >
                          <IconEye className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                          <span>{t('common.view')}</span>
                        </Link>

                        {(canVerifyCampaign || isSuperAdmin) && (campaign.rawStatus === 'pending_approval' || campaign.status === 'Under Review') && (
                          <button
                            type="button"
                            onClick={() => handleApprove(campaign.dbId || campaign.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-xs"
                          >
                            <IconCheckCircle className="w-3.5 h-3.5 text-white" />
                            <span>{t('common.approve')}</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {paginatedCampaigns.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-400 flex items-center justify-center mx-auto">
            <IconMegaphone className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
            {search ? 'No matching campaigns found' : 'No government campaigns yet'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
            {search ? 'Try adjusting your search query or switching filter tabs.' : 'Create your first public service announcement or emergency awareness campaign.'}
          </p>
          {!search && (
            <Link
              to={`${basePath}/campaigns/create`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>{t('gov.dashboard.create_campaign')}</span>
            </Link>
          )}
        </div>
      )}

      {/* Global Pagination */}
      {filteredCampaigns.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={itemsPerPage}
          pageSizeOptions={[6, 12, 24, 48]}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setItemsPerPage(newSize);
            setCurrentPage(1);
          }}
        />
      )}

    </div>
  );
};

export default GovCampaignsListPage;
