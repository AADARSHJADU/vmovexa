import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { SharePaymentLinkModal } from '../../components/SharePaymentLinkModal';
import { useSuperCampaign } from '../../hooks/superadmin/useSuperCampaign';
import toast from 'react-hot-toast';

const statusStr = (c) => String(c?.status || '').toLowerCase();
const isPending = (c) => statusStr(c).includes('pending');
const isLive = (c) => statusStr(c).includes('live') || statusStr(c).includes('active') || statusStr(c).includes('approved');
const isRejected = (c) => statusStr(c).includes('reject');

export const GlobalCampaignsPage = () => {
  const { t } = useTranslation();
  const { campaigns, approvals, loadCampaigns, loadApprovals, approveCampaign, rejectCampaign, sharePaymentLink } = useSuperCampaign();

  useEffect(() => {
    loadCampaigns().catch(() => {});
    loadApprovals().catch(() => {});
  }, [loadCampaigns, loadApprovals]);

  const campaignsList = campaigns || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [selectedCampaignForShare, setSelectedCampaignForShare] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [refreshing, setRefreshing] = useState(false);

  // Map campaign -> its pending approval_request id (approvals feed approve/reject).
  const approvalForCampaign = (camp) => {
    const list = approvals || [];
    return list.find(
      (a) => String(a.entity_id ?? a.entityId) === String(camp.id) ||
             String(a.entity_id ?? a.entityId) === String(camp.code),
    );
  };

  const isGov = (c) => String(c.category || c.type || '').toLowerCase().includes('gov');

  const filterTabs = [
    { key: 'All', label: t('common.all', 'All'), count: campaignsList.length },
    { key: 'Pending Approval', label: t('campaigns.pending_tab', 'Pending Approval'), count: campaignsList.filter(isPending).length },
    { key: 'Live on Screens', label: t('campaigns.active_tab', 'Live on Screens'), count: campaignsList.filter(isLive).length },
    { key: 'Government PSA', label: t('campaigns.gov_psa', 'Government PSA'), count: campaignsList.filter(isGov).length },
    { key: 'Rejected', label: t('campaigns.rejected_tab', 'Rejected'), count: campaignsList.filter(isRejected).length },
  ];

  const filteredCampaigns = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return campaignsList.filter((c) => {
      const title = String(c.title || '');
      const advertiser = String(c.advertiser?.name || c.advertiser || '');
      const id = String(c.id || c.code || '');
      const category = String(c.category || '');

      const matchesSearch =
        title.toLowerCase().includes(q) ||
        advertiser.toLowerCase().includes(q) ||
        id.toLowerCase().includes(q) ||
        category.toLowerCase().includes(q);

      if (activeTab === 'All') return matchesSearch;
      if (activeTab === 'Pending Approval') return matchesSearch && isPending(c);
      if (activeTab === 'Live on Screens') return matchesSearch && isLive(c);
      if (activeTab === 'Government PSA') return matchesSearch && isGov(c);
      if (activeTab === 'Rejected') return matchesSearch && isRejected(c);
      return matchesSearch;
    });
  }, [campaignsList, searchQuery, activeTab, approvals]);

  const refresh = () => Promise.all([loadCampaigns(), loadApprovals()]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const handleApprove = async (camp) => {
    const approval = approvalForCampaign(camp);
    try {
      await toast.promise(
        approveCampaign(approval?.id, 'Approved by SuperAdmin', camp.id).then(refresh),
        { loading: 'Verifying & Approving Campaign...', success: 'Campaign Approved & Payment Link Dispatched to Customer!', error: (e) => e.message || 'Approval Failed.' }
      );
    } catch (err) {}
  };

  const handleOpenReject = (campaign) => {
    setSelectedCampaign(campaign);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedCampaign) return;
    const approval = approvalForCampaign(selectedCampaign);
    try {
      await toast.promise(
        rejectCampaign(approval?.id, rejectReason || 'Content policy violation', selectedCampaign.id).then(refresh),
        { loading: 'Rejecting Campaign...', success: 'Campaign Rejected.', error: (e) => e.message || 'Rejection Failed.' }
      );
      setShowRejectModal(false);
    } catch (err) {}
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
        <span className="text-slate-900 dark:text-white font-bold">Campaigns Hub</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('campaigns.hub_title', 'Cross-Tenant Digital Screen Ad Campaigns')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            {t('campaigns.hub_sub', 'Review, approve, and manage passenger media creatives scheduled across multi-tenant RK3588 display matrices')}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <RefreshButton
            onClick={handleManualRefresh}
            loading={refreshing}
            title="Refresh campaigns list"
          />
          <Link
            to="/superadmin/campaigns/emergency"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <FleetIcons.Emergency className="w-4 h-4" />
            <span>{t('emergency.broadcast_title', 'Emergency Broadcast Override')}</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  activeTab === tab.key ? 'bg-slate-700 dark:bg-blue-700 text-white' : 'bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder={t('common.search', 'Search by campaign title, advertiser, or ID...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
          />
          <FleetIcons.Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Campaigns Grid */}
      {filteredCampaigns.length === 0 && (
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-10 text-center text-slate-400 dark:text-zinc-500 font-medium">
          {t('common.no_data', 'No campaigns found.')}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredCampaigns
          .slice((currentPage - 1) * pageSize, currentPage * pageSize)
          .map((camp) => {
          const advertiser = camp.advertiser?.name || camp.advertiser || camp.organization?.name || '—';
          const budget = camp.budget != null ? (typeof camp.budget === 'number' ? `₹${camp.budget.toLocaleString('en-IN')}` : camp.budget) : '—';
          return (
          <div key={camp.id} className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                    {camp.code || camp.id}
                  </span>
                  {camp.category && (
                    <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                      {camp.category}
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      isLive(camp)
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : isRejected(camp)
                        ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                        : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    {camp.status}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      camp.payment_status === 'paid'
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                    }`}
                  >
                    Payment: {camp.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2 leading-snug">{camp.title}</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Advertiser: <strong className="text-slate-800 dark:text-zinc-200 font-semibold">{advertiser}</strong></p>
                {(camp.client_name || camp.client_company) && (
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>Customer: <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">{camp.client_name || camp.client_company}</strong></span>
                    {camp.client_phone && (
                      <span className="inline-flex items-center gap-1 text-slate-600 dark:text-zinc-300">
                        <FleetIcons.Phone className="w-3 h-3 text-slate-400" />
                        <span>{camp.client_phone}</span>
                      </span>
                    )}
                    {camp.client_email && (
                      <span className="inline-flex items-center gap-1 text-slate-600 dark:text-zinc-300">
                        <FleetIcons.Mail className="w-3 h-3 text-slate-400" />
                        <span>{camp.client_email}</span>
                      </span>
                    )}
                  </p>
                )}
              </div>

              <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2.5 py-1 rounded-xl border border-purple-200 dark:border-purple-800 shrink-0">
                {budget}
              </span>
            </div>

            {/* Campaign Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 text-xs">
              <div>
                <span className="text-slate-400 dark:text-zinc-500 text-[10px] block">{t('common.category', 'Category')}</span>
                <span className="font-bold text-slate-900 dark:text-white">{camp.category || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-zinc-500 text-[10px] block">{t('campaigns.target_screens', 'Active Screens')}</span>
                <span className="font-bold text-slate-900 dark:text-white">{camp.assignedScreensCount ?? camp.assigned_screens_count ?? 0} Screens</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-zinc-500 text-[10px] block">{t('tenants.organization', 'Tenants Reach')}</span>
                <span className="font-bold text-slate-900 dark:text-white">{camp.assignedTenantsCount ?? camp.assigned_tenants_count ?? 0} Orgs</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-zinc-500 text-[10px] block">{t('campaigns.impressions', 'Impressions')}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{camp.impressionsDelivered ?? camp.impressions_delivered ?? 0}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-zinc-800 flex-wrap">
              <Link
                to={`/superadmin/advertiser/campaigns/${camp.id}`}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors inline-flex items-center gap-1"
              >
                <span>View Details</span>
                <span>&rarr;</span>
              </Link>

              <div className="flex items-center gap-2">
                {/* Send Payment Link - Available when approved/active and unpaid */}
                {(statusStr(camp).includes('approved') || statusStr(camp).includes('live') || isPending(camp)) && camp.payment_status !== 'paid' && (
                  <button
                    type="button"
                    onClick={() => setSelectedCampaignForShare(camp)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <FleetIcons.Mail className="w-3.5 h-3.5 text-white" />
                    <span>Send Payment Link</span>
                  </button>
                )}

                {isPending(camp) && (
                  <>
                    <button
                      onClick={() => handleOpenReject(camp)}
                      className="px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                    >
                      {t('campaigns.reject_btn', 'Reject')}
                    </button>
                    <button
                      onClick={() => handleApprove(camp)}
                      className="px-4 py-1.5 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                    >
                      <span>✓</span>
                      <span>Verify & Approve Campaign</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          );
        })}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredCampaigns.length / pageSize) || 1}
        onPageChange={setCurrentPage}
        totalItems={filteredCampaigns.length}
        pageSize={pageSize}
        onPageSizeChange={(sz) => {
          setPageSize(sz);
          setCurrentPage(1);
        }}
        pageSizeOptions={[6, 10, 20, 50]}
      />

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Reject Campaign: {selectedCampaign?.title}
            </h3>
            <textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
              rows={3}
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl"
              >
                {t('campaigns.reject_btn', 'Confirm Reject')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Payment Link Modal */}
      {selectedCampaignForShare && (
        <SharePaymentLinkModal
          isOpen={Boolean(selectedCampaignForShare)}
          onClose={() => setSelectedCampaignForShare(null)}
          campaign={{
            ...selectedCampaignForShare,
            dbId: selectedCampaignForShare.id,
            name: selectedCampaignForShare.title || selectedCampaignForShare.name,
            clientName: selectedCampaignForShare.client_name,
            clientCompany: selectedCampaignForShare.client_company,
            clientEmail: selectedCampaignForShare.client_email,
            clientPhone: selectedCampaignForShare.client_phone,
            budget: selectedCampaignForShare.budget,
            paymentToken: selectedCampaignForShare.payment_token || selectedCampaignForShare.id,
          }}
          onShare={sharePaymentLink}
        />
      )}
    </div>
  );
};

export default GlobalCampaignsPage;
