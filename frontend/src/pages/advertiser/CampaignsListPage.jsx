import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from '../../hooks/useTranslation';
import { useAdvertiserRole } from '../../hooks/advertiser/useAdvertiserRole';
import { PaymentProcessingModal } from '../../components/PaymentProcessingModal';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import Breadcrumb from '../../components/ui/Breadcrumb';
import {
  IconEye,
  IconEdit,
  IconCheckCircle,
  IconCreditCard,
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
  Running: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Approved: 'bg-blue-50 text-blue-700 border border-blue-200 font-bold',
  'Under Review': 'bg-amber-50 text-amber-700 border border-amber-200',
  Scheduled: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  Paused: 'bg-orange-50 text-orange-700 border border-orange-200',
  Completed: 'bg-slate-100 text-slate-600 border border-slate-200',
  Draft: 'bg-zinc-100 text-zinc-600 border border-zinc-200',
};

const tabs = ['All', 'Approved', 'Running', 'Scheduled', 'Draft', 'Completed', 'Paused'];

export const CampaignsListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    user,
    campaigns: rtkCampaigns,
    loadCampaigns,
    startCampaign,
    stopCampaign,
    endCampaign,
    deleteCampaign,
    verifyCampaign,
    confirmPayment,
    canCreateCampaign,
    canEditCampaign,
    canDeleteCampaign,
    canVerifyCampaign,
    canPayCampaign,
  } = useAdvertiserRole();

  const isSuperAdmin = user?.role === 'ROLE-SUPER-ADMIN' || user?.role?.code === 'ROLE-SUPER-ADMIN' || user?.clearance === 'ROOT';
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/advertiser' : '/advertiser';

  const [refreshing, setRefreshing] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadCampaigns();
      toast.success('Campaigns list refreshed');
    } catch (err) {
      toast.error(err?.message || 'Failed to refresh campaigns');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCampaigns().catch(() => {});
  }, [loadCampaigns]);

  const handleStart = async (campId) => {
    try {
      const res = await startCampaign(campId);
      const count = res?.mqttDispatched ?? res?.dataValues?.mqttDispatched;
      if (typeof count === 'number') {
        toast.success(`Campaign started! Dispatched to ${count} device(s) via MQTT`);
      } else {
        toast.success('Campaign started! Ad is live on screens');
      }
      await loadCampaigns().catch(() => {});
    } catch (e) {
      toast.error(e?.message || 'Failed to start campaign');
    }
  };

  const handlePause = async (campId) => {
    try {
      await toast.promise(stopCampaign(campId), {
        loading: 'Pausing broadcast...',
        success: 'Campaign paused',
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
        success: 'Campaign ended',
        error: (e) => e?.message || 'Failed to end campaign',
      });
      await loadCampaigns().catch(() => {});
    } catch (_) {}
  };

  // Map real backend RTK campaigns to view model (empty if none exist in DB)
  const campaigns = useMemo(() => {
    if (Array.isArray(rtkCampaigns) && rtkCampaigns.length > 0) {
      return rtkCampaigns.map((c) => {
        let pb = null;
        if (c.payment_breakdown) {
          pb = typeof c.payment_breakdown === 'string'
            ? (() => { try { return JSON.parse(c.payment_breakdown); } catch (_) { return null; } })()
            : c.payment_breakdown;
        }
        const totalAmount = Number(pb?.totalAmount ?? c.budget ?? 0);

        return {
          id: c.code || `CMP-${c.id}`,
          dbId: c.id,
          name: c.title || c.name || 'Untitled Campaign',
          brandName: c.brand_name || c.advertiser?.company_name || c.category || 'Commercial Ad',
          clientName: c.client_name || '',
          clientCompany: c.client_company || '',
          clientPhone: c.client_phone || '',
          clientEmail: c.client_email || '',
          status: c.status === 'live' ? 'Running' : c.status === 'paused' ? 'Paused' : c.status === 'pending_approval' ? 'Under Review' : c.status === 'approved' ? 'Approved' : (c.status === 'rejected' ? 'Rejected' : c.status === 'completed' ? 'Completed' : 'Draft'),
          rawStatus: c.status,
          startDate: c.start_date || '—',
          endDate: c.end_date || '—',
          budget: totalAmount,
          totalAmount: totalAmount,
          totalScreens: c.targets?.reduce((acc, t) => acc + (t.screens_count || 0), 0) || 0,
        impressions: c.impressions_delivered || 0,
        cities: c.targets?.length || (c.targets?.[0]?.city ? 1 : 0),
        thumbnail: c.media?.[0]?.file_url || '',
        mediaType: c.media?.[0]?.media_type || '',
        qrCode: c.qrCodes?.[0]?.code || '',
        fleetOperators: c.targets?.map(t => t.fleet_name).filter(Boolean) || [],
        paymentStatus: c.payment_status === 'paid' ? 'Paid' : (c.payment_status === 'pending' ? 'Processing' : 'Unpaid'),
        paymentToken: c.payment_token || c.id,
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
  const [selectedCampaignForPayment, setSelectedCampaignForPayment] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = () => setOpenMenuId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

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

  const handleVerify = async (campId) => {
    if (verifyingId) return;
    setVerifyingId(campId);
    try {
      await toast.promise(verifyCampaign(campId), {
        loading: 'Verifying campaign & issuing checkout token...',
        success: 'Campaign approved! Payment link queued in cron job for customer delivery.',
        error: (e) => e?.message || 'Verification failed',
      });
      await loadCampaigns().catch(() => {});
    } catch (_) {
    } finally {
      setVerifyingId(null);
    }
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
          <h1 className="text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">{t('campaigns_list.title', 'Campaigns')}</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">{t('campaigns_list.subtitle', 'Manage, track, and monitor all your transit advertising campaigns.')}</p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <RefreshButton onClick={handleRefresh} loading={refreshing} />

          {(canCreateCampaign || isSuperAdmin) && (
            <Link
              to={`${basePath}/campaigns/create`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-bold active:scale-[0.99] transition-all shadow-sm shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>{t('campaigns_list.create_btn', 'Create Campaign')}</span>
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
            placeholder={t('campaigns_list.search_placeholder', 'Search by campaign name, brand, or ID...')}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all shadow-sm"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setCurrentPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded-md"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters and View Mode Switch */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          
          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-slate-300 shadow-sm cursor-pointer"
          >
            <option value="Recent">{t('campaigns_list.sort_recent', 'Sort: Recent First')}</option>
            <option value="Name">{t('campaigns_list.sort_name', 'Sort: Name (A-Z)')}</option>
            <option value="Budget-High">{t('campaigns_list.sort_budget_high', 'Sort: Budget (High to Low)')}</option>
            <option value="Budget-Low">{t('campaigns_list.sort_budget_low', 'Sort: Budget (Low to High)')}</option>
            <option value="Screens">{t('campaigns_list.sort_screens', 'Sort: Most Screens')}</option>
          </select>

          {/* View Mode Toggle */}
          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            tableValue="table"
            cardValue="card"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl w-full sm:w-fit overflow-x-auto no-scrollbar border border-slate-200/60">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === tab
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
            <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
              activeTab === tab ? 'bg-slate-100 text-slate-900' : 'bg-slate-200/70 text-slate-500'
            }`}>
              {tabCounts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* VIEW 1: CARD GRID VIEW (Clean modern card design, unclipped popup) */}
      {viewMode === 'card' && paginatedCampaigns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {paginatedCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col group relative"
            >
              {/* Top Accent Gradient Line */}
              <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-t-2xl" />

              {/* Card Header & Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">

                <div className="space-y-3">
                  {/* Top Meta Row: ID + Status + 3-Dots */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-mono font-bold border border-slate-200">
                      {campaign.id}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-2xs ${statusColors[campaign.status] || 'bg-slate-100 text-slate-600'}`}>
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
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors border border-slate-200 shadow-2xs"
                          title="Options"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                          </svg>
                        </button>

                        {/* 3-DOTS DROPDOWN MENU POPOVER */}
                        {openMenuId === campaign.id && (
                          <div
                            className="absolute right-0 top-9 z-50 w-48 bg-white border border-slate-200 rounded-2xl shadow-2xl py-1.5 text-left text-xs font-semibold text-slate-700 animate-in fade-in zoom-in-95"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                navigate(`${basePath}/campaigns/${campaign.id}`);
                              }}
                              className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-50 text-slate-900 font-bold"
                            >
                              <IconEye className="w-4 h-4 text-slate-600" />
                              <span>{t('campaigns_list.view_details', 'View Details')}</span>
                            </button>

                            {/* Edit Campaign - Only if editable status & user has edit permission */}
                            {(canEditCampaign || isSuperAdmin) && ['draft', 'pending_approval', 'rejected'].includes(campaign.rawStatus || campaign.status?.toLowerCase()) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  navigate(`${basePath}/campaigns/create?edit=${campaign.dbId || campaign.id}`);
                                }}
                                className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-50 text-slate-700 font-medium"
                              >
                                <IconEdit className="w-4 h-4 text-slate-600" />
                                <span>{t('campaigns_list.edit_campaign', 'Edit Campaign')}</span>
                              </button>
                            )}

                            {/* Verify Campaign - STRICT: Only if user has verify permission AND campaign is in pending approval */}
                            {(canVerifyCampaign || isSuperAdmin) && (campaign.rawStatus === 'pending_approval' || campaign.status === 'Under Review' || campaign.status === 'Pending Approval') && (
                              <button
                                type="button"
                                disabled={verifyingId === (campaign.dbId || campaign.id)}
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleVerify(campaign.dbId || campaign.id);
                                }}
                                className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-emerald-50 text-emerald-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {verifyingId === (campaign.dbId || campaign.id) ? (
                                  <>
                                    <span className="w-3.5 h-3.5 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin shrink-0" />
                                    <span>{t('campaigns_list.verifying', 'Verifying...')}</span>
                                  </>
                                ) : (
                                  <>
                                    <IconCheckCircle className="w-4 h-4 text-emerald-600" />
                                    <span>{t('campaigns_list.verify_campaign', 'Verify Campaign')}</span>
                                  </>
                                )}
                              </button>
                            )}

                            {/* Pay Directly - Only if approved, unpaid & user has pay permission */}
                            {(canPayCampaign || isSuperAdmin) && (campaign.status === 'Approved' || campaign.rawStatus === 'approved') && campaign.paymentStatus !== 'Paid' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setSelectedCampaignForPayment(campaign);
                                }}
                                className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-emerald-50 text-emerald-700 font-bold"
                              >
                                <IconCreditCard className="w-4 h-4 text-emerald-600" />
                                <span>{t('campaigns_list.pay_directly', 'Pay Directly')}</span>
                              </button>
                            )}

                            {/* Start Broadcast - When Paid & Approved */}
                            {campaign.paymentStatus === 'Paid' && (campaign.status === 'Approved' || campaign.rawStatus === 'approved') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleStart(campaign.dbId || campaign.id);
                                }}
                                className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-emerald-50 text-emerald-700 font-bold"
                              >
                                <IconPlay className="w-4 h-4 text-emerald-600" />
                                <span>{t('campaigns_list.start_broadcast', 'Start Broadcast')}</span>
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
                                className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-amber-50 text-amber-700 font-bold"
                              >
                                <IconPause className="w-4 h-4 text-amber-600" />
                                <span>{t('campaigns_list.pause_ad', 'Pause Ad')}</span>
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
                                className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-emerald-50 text-emerald-700 font-bold"
                              >
                                <IconPlay className="w-4 h-4 text-emerald-600" />
                                <span>{t('campaigns_list.resume_ad', 'Resume Ad')}</span>
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
                                className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-rose-50 text-rose-700 font-bold"
                              >
                                <IconStop className="w-4 h-4 text-rose-600" />
                                <span>{t('campaigns_list.end_campaign', 'End Campaign')}</span>
                              </button>
                            )}

                            <div className="my-1 border-t border-slate-100" />

                            {/* View Analytics */}
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                navigate(`${basePath}/campaigns/${campaign.id}/analytics`);
                              }}
                              className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-50 text-slate-700 font-medium"
                            >
                              <IconBarChart className="w-4 h-4 text-slate-600" />
                              <span>{t('campaigns_list.view_analytics', 'View Analytics')}</span>
                            </button>

                            {/* Delete Campaign - Only if draft/pending/rejected & user has delete permission */}
                            {(canDeleteCampaign || isSuperAdmin) && ['draft', 'pending_approval', 'rejected'].includes(campaign.rawStatus || campaign.status?.toLowerCase()) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleDelete(campaign);
                                }}
                                className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-rose-50 text-rose-700 font-bold"
                              >
                                <IconTrash className="w-4 h-4 text-rose-600" />
                                <span>{t('campaigns_list.delete_campaign', 'Delete Campaign')}</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Campaign Title & Customer Info */}
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight leading-snug line-clamp-1" title={campaign.name}>
                      {campaign.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-slate-500 font-medium">
                      <span className="font-bold text-slate-700">{campaign.brandName}</span>
                      {campaign.clientName && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-semibold border border-blue-100 text-[11px]">
                            <IconUser className="w-3 h-3 text-blue-600" />
                            <span>{t('campaigns_list.client_prefix', 'Client:')}</span>
                            <span className="font-bold">{campaign.clientName}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Badges Row: Format, QR, Payment */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {campaign.mediaType && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                        {campaign.mediaType === 'video' ? (
                          <>
                            <IconVideo className="w-3 h-3 text-indigo-600" />
                            <span>Video</span>
                          </>
                        ) : campaign.mediaType === 'pdf' ? (
                          <>
                            <IconDocument className="w-3 h-3 text-rose-600" />
                            <span>PDF</span>
                          </>
                        ) : campaign.mediaType === 'url' ? (
                          <>
                            <IconLink className="w-3 h-3 text-blue-600" />
                            <span>URL</span>
                          </>
                        ) : (
                          <>
                            <IconImage className="w-3 h-3 text-emerald-600" />
                            <span>Image</span>
                          </>
                        )}
                      </span>
                    )}
                    {campaign.qrCode && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200/80 font-mono">
                        <IconQrCode className="w-3 h-3 text-emerald-600" />
                        <span>{campaign.qrCode}</span>
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                      {t('campaigns_list.payment_prefix', 'Payment:')} {campaign.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Schedule & Budget Bar */}
                <div className="flex items-center justify-between text-xs pt-3 pb-2 border-t border-slate-100">
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium">{t('campaigns_list.flight_duration', 'Flight Duration')}</p>
                    <p className="font-bold text-slate-700 mt-0.5">{campaign.startDate} – {campaign.endDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-slate-400 font-medium">{t('campaigns_list.total_amount', 'Total Amount')}</p>
                    <p className="font-black text-slate-900 text-sm mt-0.5">
                      ₹ {campaign.totalAmount > 0 ? campaign.totalAmount.toLocaleString('en-IN') : '0'}
                    </p>
                  </div>
                </div>

                {/* Target Screens Pill */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center text-xs">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t('campaigns_list.target_screens', 'Target Screens')}</p>
                  <p className="font-black text-blue-700 text-sm mt-0.5 flex items-center justify-center gap-1.5">
                    <IconScreen className="w-3.5 h-3.5 text-blue-600" />
                    <span>{campaign.totalScreens.toLocaleString()}</span>
                  </p>
                </div>

                {/* Quick Action: Pay Direct for Approved campaigns */}
                {(campaign.status === 'Approved' || campaign.rawStatus === 'approved') && campaign.paymentStatus !== 'Paid' && (canPayCampaign || isSuperAdmin) && (
                  <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCampaignForPayment(campaign);
                      }}
                      className="w-full py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <IconCreditCard className="w-3.5 h-3.5 text-white" />
                      <span>{t('campaigns_list.pay_direct_short', 'Pay Direct')}</span>
                    </button>
                  </div>
                )}

                {/* Bottom Action Footer */}
                <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] text-slate-600 font-medium">
                      {campaign.cities} {campaign.cities === 1 ? 'City' : 'Cities'}
                      {campaign.fleetOperators?.[0] ? ` · ${campaign.fleetOperators[0]}` : ''}
                    </span>
                  </div>

                  <Link
                    to={`${basePath}/campaigns/${campaign.id}`}
                    className="inline-flex items-center gap-1 text-xs font-extrabold text-blue-600 hover:text-blue-800 transition-colors group-hover:translate-x-0.5 duration-200"
                  >
                    <span>{t('campaigns_list.view_details', 'View Details')}</span>
                    <span>→</span>
                  </Link>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: TABLE / LIST VIEW (UNCLIPPED POPUP DROPDOWN) */}
      {viewMode === 'table' && paginatedCampaigns.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-visible relative min-h-[320px]">
          <div className="overflow-x-auto pb-28 pt-1 no-scrollbar overflow-y-visible">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">{t('campaigns_list.table_campaign', 'Campaign')}</th>
                  <th className="py-3.5 px-4">{t('campaigns_list.table_status', 'Status')}</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">{t('campaigns_list.table_duration', 'Duration')}</th>
                  <th className="py-3.5 px-4 hidden lg:table-cell">{t('campaigns_list.table_target_screens', 'Target Screens')}</th>
                  <th className="py-3.5 px-4">{t('campaigns_list.table_total_amount', 'Total Amount')}</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">{t('campaigns_list.table_impressions', 'Impressions')}</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">{t('campaigns_list.table_actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-slate-50/80 transition-colors group">
                    
                    {/* Campaign Info + Icon Box */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200/80 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                          {campaign.mediaType === 'video' ? (
                            <IconVideo className="w-5 h-5 text-indigo-600" />
                          ) : campaign.mediaType === 'pdf' ? (
                            <IconDocument className="w-5 h-5 text-rose-600" />
                          ) : campaign.mediaType === 'url' ? (
                            <IconLink className="w-5 h-5 text-blue-600" />
                          ) : (
                            <IconMegaphone className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            to={`${basePath}/campaigns/${campaign.id}`}
                            className="font-bold text-slate-900 group-hover:text-slate-700 truncate block text-sm"
                          >
                            {campaign.name}
                          </Link>
                          <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                            {campaign.brandName} {campaign.clientName ? `· Client: ${campaign.clientName}` : ''} · <span className="font-mono text-slate-500">{campaign.id}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${statusColors[campaign.status] || 'bg-slate-100 text-slate-600'}`}>
                        {campaign.status}
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="py-4 px-4 whitespace-nowrap text-slate-600 font-medium hidden md:table-cell">
                      {campaign.startDate} – {campaign.endDate}
                    </td>

                    {/* Target Screens */}
                    <td className="py-4 px-4 whitespace-nowrap hidden lg:table-cell">
                      <p className="font-bold text-slate-900">{campaign.totalScreens.toLocaleString()} Screens</p>
                      <p className="text-[10px] text-slate-400">{campaign.cities} Cities</p>
                    </td>

                    {/* Total Amount */}
                    <td className="py-4 px-4 whitespace-nowrap font-black text-slate-900">
                      ₹ {campaign.totalAmount > 0 ? campaign.totalAmount.toLocaleString('en-IN') : '0'}
                    </td>

                    {/* Impressions */}
                    <td className="py-4 px-4 whitespace-nowrap text-slate-600 font-bold hidden sm:table-cell">
                      {campaign.impressions > 0 ? (campaign.impressions / 1000000).toFixed(1) + 'M' : '–'}
                    </td>

                    {/* Actions — EXCLUSIVELY 3-DOTS BUTTON WITH HIGHEST Z-INDEX */}
                    <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap relative">
                      <div className="flex items-center justify-end relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === campaign.id ? null : campaign.id);
                          }}
                          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors shadow-sm"
                          title="Campaign Actions"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                          </svg>
                        </button>

                        {/* UNCLIPPED POPUP DROPDOWN MENU */}
                        {openMenuId === campaign.id && (
                          <div
                            className="absolute right-0 top-full mt-1 z-50 w-48 bg-white border border-slate-200 rounded-2xl shadow-2xl py-1.5 text-left text-xs font-semibold text-slate-700 animate-in fade-in zoom-in-95"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                navigate(`${basePath}/campaigns/${campaign.id}`);
                              }}
                              className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-50 text-slate-900 font-bold"
                            >
                              <IconEye className="w-4 h-4 text-slate-600" />
                              <span>{t('campaigns_list.view_details', 'View Details')}</span>
                            </button>

                            {/* Edit Campaign - Only if editable status & user has edit permission */}
                            {(canEditCampaign || isSuperAdmin) && ['draft', 'pending_approval', 'rejected'].includes(campaign.rawStatus || campaign.status?.toLowerCase()) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  navigate(`${basePath}/campaigns/create?edit=${campaign.dbId || campaign.id}`);
                                }}
                                className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-50 text-slate-700 font-medium"
                              >
                                <IconEdit className="w-4 h-4 text-slate-600" />
                                <span>{t('campaigns_list.edit_campaign', 'Edit Campaign')}</span>
                              </button>
                            )}

                            {/* Verify Campaign - STRICT: Only if user has verify permission AND campaign is in pending approval */}
                            {(canVerifyCampaign || isSuperAdmin) && (campaign.rawStatus === 'pending_approval' || campaign.status === 'Under Review' || campaign.status === 'Pending Approval') && (
                              <button
                                type="button"
                                disabled={verifyingId === (campaign.dbId || campaign.id)}
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleVerify(campaign.dbId || campaign.id);
                                }}
                                className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-emerald-50 text-emerald-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {verifyingId === (campaign.dbId || campaign.id) ? (
                                  <>
                                    <span className="w-3.5 h-3.5 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin shrink-0" />
                                    <span>{t('campaigns_list.verifying', 'Verifying...')}</span>
                                  </>
                                ) : (
                                  <>
                                    <IconCheckCircle className="w-4 h-4 text-emerald-600" />
                                    <span>{t('campaigns_list.verify_campaign', 'Verify Campaign')}</span>
                                  </>
                                )}
                              </button>
                            )}

                            {/* Pay Directly - Only if approved, unpaid & user has pay permission */}
                            {(canPayCampaign || isSuperAdmin) && (campaign.status === 'Approved' || campaign.rawStatus === 'approved') && campaign.paymentStatus !== 'Paid' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setSelectedCampaignForPayment(campaign);
                                }}
                                className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-emerald-50 text-emerald-700 font-bold"
                              >
                                <IconCreditCard className="w-4 h-4 text-emerald-600" />
                                <span>{t('campaigns_list.pay_directly', 'Pay Directly')}</span>
                              </button>
                            )}

                            {/* Start Broadcast - When Paid & Approved */}
                            {campaign.paymentStatus === 'Paid' && (campaign.status === 'Approved' || campaign.rawStatus === 'approved') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleStart(campaign.dbId || campaign.id);
                                }}
                                className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-emerald-50 text-emerald-700 font-bold"
                              >
                                <IconPlay className="w-4 h-4 text-emerald-600" />
                                <span>{t('campaigns_list.start_broadcast', 'Start Broadcast')}</span>
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
                                className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-amber-50 text-amber-700 font-bold"
                              >
                                <IconPause className="w-4 h-4 text-amber-600" />
                                <span>{t('campaigns_list.pause_ad', 'Pause Ad')}</span>
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
                                className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-emerald-50 text-emerald-700 font-bold"
                              >
                                <IconPlay className="w-4 h-4 text-emerald-600" />
                                <span>{t('campaigns_list.resume_ad', 'Resume Ad')}</span>
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
                                className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-rose-50 text-rose-700 font-bold"
                              >
                                <IconStop className="w-4 h-4 text-rose-600" />
                                <span>{t('campaigns_list.end_campaign', 'End Campaign')}</span>
                              </button>
                            )}

                            <div className="my-1 border-t border-slate-100" />

                            {/* View Analytics */}
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                navigate(`${basePath}/campaigns/${campaign.id}/analytics`);
                              }}
                              className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-50 text-slate-700 font-medium"
                            >
                              <IconBarChart className="w-4 h-4 text-slate-600" />
                              <span>{t('campaigns_list.view_analytics', 'View Analytics')}</span>
                            </button>

                            {/* Delete Campaign - Only if draft/pending/rejected & user has delete permission */}
                            {(canDeleteCampaign || isSuperAdmin) && ['draft', 'pending_approval', 'rejected'].includes(campaign.rawStatus || campaign.status?.toLowerCase()) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleDelete(campaign);
                                }}
                                className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-rose-50 text-rose-700 font-bold"
                              >
                                <IconTrash className="w-4 h-4 text-rose-600" />
                                <span>{t('campaigns_list.delete_campaign', 'Delete Campaign')}</span>
                              </button>
                            )}
                          </div>
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

      {/* Global Standard Pagination Component */}
      {totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={itemsPerPage}
          pageSizeOptions={[6, 10, 20, 50]}
          onPageChange={(page) => {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onPageSizeChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
        />
      )}

      {/* Empty State */}
      {paginatedCampaigns.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{t('campaigns_list.no_campaigns_found', 'No campaigns found')}</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {t('campaigns_list.no_campaigns_sub', 'Try clearing your search terms or filter criteria to see available transit campaigns.')}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => { setSearch(''); handleTabChange('All'); }}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs"
            >
              Clear Filters
            </button>
            <RefreshButton onClick={handleRefresh} loading={refreshing} label={t('campaigns_list.refresh_list', 'Refresh List')} />
          </div>
        </div>
      )}

      {/* Payment Processing Modal */}
      {selectedCampaignForPayment && (
        <PaymentProcessingModal
          isOpen={!!selectedCampaignForPayment}
          onClose={() => setSelectedCampaignForPayment(null)}
          data={{
            id: selectedCampaignForPayment.id,
            title: `${selectedCampaignForPayment.name} — Live Ad Broadcast Clearance`,
            customerName: selectedCampaignForPayment.brandName || 'VMOVEXA Advertiser',
            amount: Math.round(selectedCampaignForPayment.budget * 1.18),
            type: 'campaign',
          }}
          onPaymentSuccess={async (result) => {
            try {
              await confirmPayment(selectedCampaignForPayment.dbId || selectedCampaignForPayment.id, {
                paymentMethod: result?.method || 'upi',
                razorpayPaymentId: result?.transactionId || `tx_${Date.now()}`,
              });
              toast.success('Payment successfully cleared! Campaign is ready to launch');
              await loadCampaigns().catch(() => {});
            } catch (err) {
              toast.error(err?.message || 'Payment recording failed');
            } finally {
              setSelectedCampaignForPayment(null);
            }
          }}
        />
      )}
    </div>
  );
};
