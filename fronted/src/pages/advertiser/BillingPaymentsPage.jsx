import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../hooks/useAuth';
import { useAdvertiserRole } from '../../hooks/advertiser/useAdvertiserRole';
import { useGovernmentRole } from '../../hooks/government/useGovernmentRole';
import { storage } from '../../utils/storage';
import { apiClient } from '../../api/client';
import { FleetIcons } from '../../components/FleetIcons';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { Pagination } from '../../components/ui/Pagination';
import billingService from '../../api/services/billing.service';
import { InvoiceDownloadButton } from '../../components/billing/InvoiceDownloadButton';

export const BillingPaymentsPage = ({ ownerType = 'advertiser' }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const isGov = ownerType === 'government' || location.pathname.includes('/government');
  const isSuperAdmin = location.pathname.startsWith('/superadmin');
  const basePath = isSuperAdmin
    ? (isGov ? '/superadmin/government' : '/superadmin/advertiser')
    : (isGov ? '/government' : '/advertiser');
  const { user } = useAuth();
  const {
    campaigns: advCampaigns,
    loadCampaigns: loadAdvCampaigns,
    invoices: rtkInvoices,
    transactions: rtkTransactions,
    loadWallet,
    loadInvoices,
    loadTransactions,
  } = useAdvertiserRole();

  const {
    campaigns: govCampaigns,
    loadCampaigns: loadGovCampaigns,
  } = useGovernmentRole();

  const rtkCampaigns = isGov ? govCampaigns : advCampaigns;

  useEffect(() => {
    if (isGov) {
      loadGovCampaigns?.().catch(() => {});
    } else {
      loadAdvCampaigns?.().catch(() => {});
      loadWallet?.().catch(() => {});
    }
    loadInvoices?.().catch(() => {});
    loadTransactions?.().catch(() => {});
  }, [isGov, loadGovCampaigns, loadAdvCampaigns, loadWallet, loadInvoices, loadTransactions]);

  const [refreshing, setRefreshing] = useState(false);

  // Invoices & Tax Receipts: Filtering & Pagination State
  const [invoiceFilter, setInvoiceFilter] = useState('all'); // 'all' | 'pending' | 'paid'
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoicePage, setInvoicePage] = useState(1);
  const [invoicePageSize, setInvoicePageSize] = useState(10);

  // Transactions Ledger: View Mode, Search & Pagination State
  const [viewMode, setViewMode] = useState('table');
  const [txSearch, setTxSearch] = useState('');
  const [txPage, setTxPage] = useState(1);
  const [txPageSize, setTxPageSize] = useState(10);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (isGov) {
        await Promise.allSettled([
          loadGovCampaigns?.(),
          loadInvoices?.(),
          loadTransactions?.(),
        ]);
      } else {
        await Promise.allSettled([
          loadAdvCampaigns?.(),
          loadWallet?.(),
          loadInvoices?.(),
          loadTransactions?.(),
        ]);
      }
    } finally {
      setRefreshing(false);
    }
  };

  // Normalized campaigns list
  const campaigns = useMemo(() => {
    if (Array.isArray(rtkCampaigns) && rtkCampaigns.length > 0) {
      return rtkCampaigns.map((c) => {
        let breakdown = c.payment_breakdown || {};
        if (typeof breakdown === 'string') {
          try { breakdown = JSON.parse(breakdown); } catch (_) { breakdown = {}; }
        }
        const baseBudget = breakdown.baseAmount != null ? Number(breakdown.baseAmount) : Number(c.budget || 0);
        const gstAmount = breakdown.gstAmount != null ? Number(breakdown.gstAmount) : (breakdown.items ? 0 : Math.round(baseBudget * 0.18));
        const totalAmount = breakdown.totalAmount != null ? Number(breakdown.totalAmount) : (baseBudget + gstAmount);
        const isPaid = String(c.payment_status).toLowerCase() === 'paid';

        return {
          id: c.code || `CMP-${c.id}`,
          campaignNumericId: c.id,
          code: c.code || `CMP-${c.id}`,
          name: c.title || c.name || 'Untitled Campaign',
          brandName: c.client_company || c.advertiser?.company_name || c.brand_name || (isGov ? (c.client_name || 'Government Agency') : '—'),
          status: c.status === 'live' ? 'Running' : c.status === 'approved' ? 'Approved' : (c.status || 'Draft'),
          rawStatus: c.status,
          budget: baseBudget,
          gstAmount,
          totalBill: totalAmount,
          paymentBreakdown: breakdown,
          paymentToken: c.payment_token || '',
          totalScreens: c.targets?.reduce((acc, t) => acc + (t.screens_count || 0), 0) || 0,
          cities: c.targets?.length || 0,
          placement: c.placement || 'Transit Screen',
          thumbnail: c.media?.[0]?.file_url || null,
          created_at: c.created_at,
          isPaid,
          paymentStatus: isPaid ? 'Paid' : 'Pending',
        };
      });
    }
    return [];
  }, [rtkCampaigns, isGov]);

  // Approved Campaigns Only
  const approvedCampaigns = useMemo(() => {
    return campaigns.filter(c =>
      c.rawStatus === 'approved' ||
      c.rawStatus === 'live' ||
      c.rawStatus === 'completed' ||
      c.status === 'Approved' ||
      c.status === 'Running' ||
      c.status === 'Completed' ||
      c.isPaid
    );
  }, [campaigns]);

  const pendingCampaigns = useMemo(() => {
    return approvedCampaigns.filter(c => !c.isPaid);
  }, [approvedCampaigns]);

  const paidCampaigns = useMemo(() => {
    return approvedCampaigns.filter(c => c.isPaid);
  }, [approvedCampaigns]);

  const pendingTotal = useMemo(() => {
    return pendingCampaigns.reduce((acc, c) => acc + (c.totalBill || 0), 0);
  }, [pendingCampaigns]);

  const paidTotal = useMemo(() => {
    return paidCampaigns.reduce((acc, c) => acc + (c.totalBill || 0), 0);
  }, [paidCampaigns]);

  // Master Invoices List: Consolidates both Redux invoices and approved campaigns seamlessly
  const allInvoices = useMemo(() => {
    const list = [];
    const seenCampaignCodes = new Set();

    // 1. Invoices from Redux store (Invoice DB records)
    if (Array.isArray(rtkInvoices) && rtkInvoices.length > 0) {
      rtkInvoices.forEach((inv) => {
        const invPo = String(inv.po_reference || '').trim();

        const matchedCamp = campaigns.find(c => {
          if (!c) return false;
          const campCode = String(c.code || '').trim();
          const campId = String(c.campaignNumericId || c.id || '').trim();
          if (!invPo) return false;
          return (
            campCode.toLowerCase() === invPo.toLowerCase() ||
            campId === invPo ||
            `CMP-${campId}`.toLowerCase() === invPo.toLowerCase() ||
            invPo.toLowerCase() === `CMP-${campCode}`.toLowerCase()
          );
        });

        const resolvedCode = matchedCamp?.code ||
          (invPo.startsWith('CMP-') ? invPo : null) ||
          (matchedCamp?.campaignNumericId ? `CMP-${matchedCamp.campaignNumericId}` : null);

        // Only include invoices related to campaigns of current portal
        const isCampaignRelated = Boolean(
          matchedCamp ||
          (invPo && invPo.startsWith('CMP-')) ||
          (inv.type === 'ad_spend' && resolvedCode) ||
          (isGov && (inv.payer_type === 'government' || invPo.startsWith('GOV-'))) ||
          (!isGov && inv.payer_type === 'advertiser')
        );

        if (!isCampaignRelated) {
          // Exclude non-campaign tenant SaaS subscription invoices
          return;
        }

        if (isGov && !matchedCamp && inv.payer_type === 'advertiser') {
          return;
        }
        if (!isGov && !matchedCamp && inv.payer_type === 'government') {
          return;
        }

        if (resolvedCode) {
          seenCampaignCodes.add(resolvedCode.toLowerCase());
        }
        if (matchedCamp?.id) {
          seenCampaignCodes.add(String(matchedCamp.id).toLowerCase());
        }
        if (matchedCamp?.campaignNumericId) {
          seenCampaignCodes.add(String(matchedCamp.campaignNumericId).toLowerCase());
        }

        const isPaid = inv.status === 'paid' || matchedCamp?.isPaid;
        list.push({
          id: inv.code || `INV-${inv.id}`,
          numericId: inv.id,
          date: inv.issued_at ? new Date(inv.issued_at).toLocaleDateString() : '—',
          campaign: matchedCamp?.name || inv.customer_name || resolvedCode || 'Campaign Ad',
          campaignCode: resolvedCode || '—',
          clientBrand: matchedCamp?.brandName || inv.customer_name || '—',
          poReference: inv.po_reference,
          campCode: resolvedCode,
          matchedCamp,
          amount: matchedCamp ? matchedCamp.totalBill : (Number(inv.total) || 0),
          status: isPaid ? 'Paid' : 'Pending',
          isPaid,
          dueDate: inv.due_at ? new Date(inv.due_at).toLocaleDateString() : null,
          paymentToken: matchedCamp?.paymentToken,
        });
      });
    }

    // 2. Approved & Live campaigns that aren't yet recorded as separate Invoice entities
    approvedCampaigns.forEach((camp) => {
      const campCodeKey = String(camp.code || '').toLowerCase();
      const campIdKey = String(camp.id || '').toLowerCase();
      const campNumKey = String(camp.campaignNumericId || '').toLowerCase();

      if (!seenCampaignCodes.has(campCodeKey) && !seenCampaignCodes.has(campIdKey) && !seenCampaignCodes.has(campNumKey)) {
        const resolvedCode = camp.code || `CMP-${camp.campaignNumericId || camp.id}`;
        list.push({
          id: `INV-${camp.campaignNumericId || camp.id}`,
          numericId: camp.campaignNumericId || camp.id,
          date: camp.created_at ? new Date(camp.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
          campaign: camp.name,
          campaignCode: resolvedCode,
          clientBrand: camp.brandName,
          poReference: camp.code,
          campCode: resolvedCode,
          matchedCamp: camp,
          amount: camp.totalBill,
          status: camp.isPaid ? 'Paid' : 'Pending',
          isPaid: camp.isPaid,
          dueDate: null,
          paymentToken: camp.paymentToken,
        });
      }
    });

    return list;
  }, [rtkInvoices, campaigns, approvedCampaigns]);

  // Filtered & Paginated Invoices
  const filteredInvoices = useMemo(() => {
    return allInvoices.filter((inv) => {
      if (invoiceFilter === 'pending' && inv.isPaid) return false;
      if (invoiceFilter === 'paid' && !inv.isPaid) return false;

      if (invoiceSearch.trim()) {
        const query = invoiceSearch.toLowerCase().trim();
        const matchId = inv.id?.toLowerCase().includes(query);
        const matchCamp = inv.campaign?.toLowerCase().includes(query);
        const matchCode = inv.campaignCode?.toLowerCase().includes(query);
        const matchBrand = inv.clientBrand?.toLowerCase().includes(query);
        if (!matchId && !matchCamp && !matchCode && !matchBrand) return false;
      }
      return true;
    });
  }, [allInvoices, invoiceFilter, invoiceSearch]);

  const totalInvoicePages = Math.max(1, Math.ceil(filteredInvoices.length / invoicePageSize));
  const paginatedInvoices = useMemo(() => {
    const from = (invoicePage - 1) * invoicePageSize;
    return filteredInvoices.slice(from, from + invoicePageSize);
  }, [filteredInvoices, invoicePage, invoicePageSize]);

  const invoicePendingCount = useMemo(() => allInvoices.filter(i => !i.isPaid).length, [allInvoices]);
  const invoicePaidCount = useMemo(() => allInvoices.filter(i => i.isPaid).length, [allInvoices]);

  // Transactions list from Redux
  const transactions = useMemo(() => {
    if (Array.isArray(rtkTransactions) && rtkTransactions.length > 0) {
      let list = rtkTransactions;
      if (isGov) {
        const govCodes = new Set(
          campaigns
            .flatMap((c) => [String(c.code).toLowerCase(), String(c.id).toLowerCase(), String(c.campaignNumericId).toLowerCase()])
            .filter(Boolean)
        );
        list = rtkTransactions.filter((tx) => {
          const ref = String(tx.invoice?.code || tx.gateway_ref || tx.description || tx.po_reference || '').toLowerCase();
          return Array.from(govCodes).some((code) => ref.includes(code)) || tx.payer_type === 'government';
        });
      } else {
        list = rtkTransactions.filter((tx) => tx.payer_type !== 'government');
      }

      return list.map((tx) => ({
        id: tx.code || `TXN-${tx.id}`,
        date: tx.created_at ? new Date(tx.created_at).toLocaleDateString() : '—',
        description: tx.description || `Settlement (${tx.method || 'wire'})`,
        campaign: tx.invoice?.code || tx.gateway_ref || '—',
        amount: Number(tx.amount) || 0,
        type: Number(tx.amount) >= 0 ? 'Debit' : 'Credit',
        status: tx.status === 'completed' || tx.status === 'success' ? 'Completed' : 'Pending',
      }));
    }
    return [];
  }, [rtkTransactions, isGov, campaigns]);

  const filteredTransactions = useMemo(() => {
    if (!txSearch.trim()) return transactions;
    const query = txSearch.toLowerCase().trim();
    return transactions.filter(t =>
      t.id?.toLowerCase().includes(query) ||
      t.description?.toLowerCase().includes(query) ||
      t.campaign?.toLowerCase().includes(query)
    );
  }, [transactions, txSearch]);

  const totalTxPages = Math.max(1, Math.ceil(filteredTransactions.length / txPageSize));
  const paginatedTransactions = useMemo(() => {
    const from = (txPage - 1) * txPageSize;
    return filteredTransactions.slice(from, from + txPageSize);
  }, [filteredTransactions, txPage, txPageSize]);

  // Invoice view / print handlers
  const handleOpenCampaignInvoice = (camp, autoPrint = false) => {
    const numericId = camp.campaignNumericId || camp.id;
    const token = camp.paymentToken || '';
    const apiBase = apiClient.defaults?.baseURL || (window.location.origin ? `${window.location.origin.replace(':5173', ':4000')}/api/v1` : 'http://localhost:4000/api/v1');
    const printParam = autoPrint ? '&print=true' : '';
    const tokenParam = token ? `token=${encodeURIComponent(token)}` : '';
    const query = [tokenParam, printParam.replace('&', '')].filter(Boolean).join('&');
    const url = `${apiBase}/campaigns/${numericId}/public-invoice${query ? `?${query}` : ''}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenInvoice = async (inv, autoPrint = false) => {
    const invId = typeof inv === 'object' ? (inv.numericId || inv.poReference || inv.campCode || inv.id) : inv;
    try {
      await billingService.openInvoice(invId, { print: autoPrint });
    } catch (err) {
      const matchedCamp = typeof inv === 'object' && inv.matchedCamp
        ? inv.matchedCamp
        : campaigns.find(c =>
            c.code === (inv?.poReference || invId) ||
            c.id === invId ||
            String(c.campaignNumericId) === String(invId) ||
            inv?.poReference === `CMP-${c.campaignNumericId}`
          );

      if (matchedCamp) {
        return handleOpenCampaignInvoice(matchedCamp, autoPrint);
      }

      const token = storage.getAccessToken();
      const apiBase = apiClient.defaults?.baseURL || (window.location.origin ? `${window.location.origin.replace(':5173', ':4000')}/api/v1` : 'http://localhost:4000/api/v1');
      const tokenParam = token ? `?token=${encodeURIComponent(token)}` : '';
      const printParam = autoPrint ? (tokenParam ? '&print=true' : '?print=true') : '';
      window.open(`${apiBase}/billing/invoices/${invId}/html${tokenParam}${printParam}`, '_blank', 'noopener,noreferrer');
    }
  };


  return (
    <div className="w-full space-y-6 pb-12 animate-in fade-in duration-200">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'Dashboard', to: `${basePath}/dashboard` },
              { label: 'Campaigns', to: `${basePath}/campaigns` },
              { label: 'Billing & Invoices' }
            ]}
            className="mb-2"
          />
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {isGov ? 'Government Invoices & Sanction Billing' : t('advertiser_billing.title', 'Campaign Billing & Invoices')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {isGov ? 'Approved Sanctions Only' : t('advertiser_billing.approved_only', 'Approved Campaigns Only')}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {isGov
              ? 'Official department billing, clearance sanction orders, and GST receipts for public transit campaigns.'
              : t('advertiser_billing.subtitle', 'Official GST tax billing for campaigns approved by VMOVEXA Admin. Invoices are cleared via secured payment gateway.')}
          </p>
        </div>
        <div className="shrink-0">
          <RefreshButton onClick={handleRefresh} loading={refreshing} />
        </div>
      </div>

      {/* 3 Summary KPI Cards for Campaign Billing & Settlement */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 hover:border-blue-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isGov ? 'Total Invoices & Sanctions' : t('advertiser_billing.total_invoices_tab', 'Total Invoices & Bills')}
            </span>
            <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-black">
              ✓
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {allInvoices.length}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {invoicePaidCount} Paid · {invoicePendingCount} Pending
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isGov ? 'Sanction Pending' : t('advertiser_billing.payment_pending', 'Payment Pending')}
            </span>
            <span className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FleetIcons.CreditCard className="w-4 h-4 text-amber-500" />
            </span>
          </div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
            ₹ {pendingTotal.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {pendingCampaigns.length} {t('common.pending', 'Pending Clearance')}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 hover:border-emerald-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isGov ? 'Paid & Disbursed' : t('advertiser_billing.paid_live', 'Paid & Cleared')}
            </span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FleetIcons.Tv className="w-4 h-4 text-emerald-500" />
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            ₹ {paidTotal.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {paidCampaigns.length} {t('common.paid', 'Settled Invoices')}
          </p>
        </div>
      </div>

      {/* Invoices & Tax Receipts Ledger with Search, Status Tabs & Pagination */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        
        {/* Section Header with Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900 dark:text-slate-100">
                {isGov ? 'Department Invoices & Clearance Receipts' : t('advertiser_billing.invoices_tab', 'Invoices & Tax Receipts')}
              </h2>
              <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-md">
                Official GST Receipts
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isGov
                ? 'Download, print, or review clearance sanction orders and GST tax invoices for approved government flights.'
                : t('advertiser_billing.download_invoices_sub', 'Download, print, or clear GST tax invoices for approved campaigns and media flights.')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => { setInvoiceFilter('all'); setInvoicePage(1); }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  invoiceFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                All ({allInvoices.length})
              </button>
              <button
                type="button"
                onClick={() => { setInvoiceFilter('pending'); setInvoicePage(1); }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  invoiceFilter === 'pending'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400'
                }`}
              >
                Awaiting ({invoicePendingCount})
              </button>
              <button
                type="button"
                onClick={() => { setInvoiceFilter('paid'); setInvoicePage(1); }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  invoiceFilter === 'paid'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
              >
                Paid ({invoicePaidCount})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <FleetIcons.Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('advertiser.billing.search_invoice_ph')}
                value={invoiceSearch}
                onChange={(e) => {
                  setInvoiceSearch(e.target.value);
                  setInvoicePage(1);
                }}
                className="w-full sm:w-56 pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Invoices Master Table */}
        <div className="overflow-x-auto no-scrollbar">
          {paginatedInvoices.length === 0 ? (
            <div className="p-10 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-1.5">
              <FleetIcons.FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t('advertiser_billing.no_invoices', 'No Matching Invoices Found')}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {invoiceSearch
                  ? 'Try adjusting your search criteria or filter options.'
                  : isGov
                    ? 'Official department invoices and clearance sanctions will appear here once campaigns are approved by VMOVEXA Admin.'
                    : 'Official GST tax invoices will appear here once campaigns are approved by VMOVEXA Admin.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">{t('advertiser.billing.th_invoice')}</th>
                  <th className="py-3 px-4">{isGov ? 'Campaign / Department' : 'Campaign / Brand'}</th>
                  <th className="py-3 px-4">{t('advertiser.billing.th_issue_date')}</th>
                  <th className="py-3 px-4">{t('advertiser.billing.th_total')}</th>
                  <th className="py-3 px-4">{t('advertiser.billing.th_status')}</th>
                  <th className="py-3 px-4 text-right">{t('advertiser.billing.th_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                {paginatedInvoices.map((inv) => {
                  const isPending = !inv.isPaid;
                  const targetCampCode = (
                    (inv.campCode && inv.campCode !== '—') ? inv.campCode :
                    (inv.matchedCamp?.code && inv.matchedCamp.code !== '—') ? inv.matchedCamp.code :
                    (inv.poReference && inv.poReference.startsWith('CMP-')) ? inv.poReference :
                    (inv.campaignCode && inv.campaignCode !== '—' && inv.campaignCode.startsWith('CMP-')) ? inv.campaignCode :
                    (inv.matchedCamp?.campaignNumericId ? `CMP-${inv.matchedCamp.campaignNumericId}` : null)
                  );

                  const hasValidCampaign = Boolean(targetCampCode && targetCampCode.startsWith('CMP-'));
                  const detailsUrl = hasValidCampaign ? `${basePath}/campaigns/${targetCampCode}` : null;

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4">
                        {detailsUrl ? (
                          <Link
                            to={detailsUrl}
                            className="font-mono font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title={t('advertiser.billing.open_details')}
                          >
                            {inv.id}
                          </Link>
                        ) : (
                          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                            {inv.id}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {detailsUrl ? (
                              <Link
                                to={detailsUrl}
                                className="font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate max-w-xs"
                                title={t('advertiser.billing.open_details')}
                              >
                                {inv.campaign}
                              </Link>
                            ) : (
                              <span className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-xs">
                                {inv.campaign}
                              </span>
                            )}
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {inv.campaignCode}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{inv.clientBrand}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                        {inv.date}
                        {inv.dueDate && (
                          <span className="block text-[10px] text-amber-500">Due: {inv.dueDate}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-black text-slate-900 dark:text-slate-100 text-sm">
                          ₹ {inv.amount.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            ● Awaiting Payment
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            ✓ Paid & Cleared
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {isPending ? (
                            <>
                              {detailsUrl && (
                                <Link
                                  to={detailsUrl}
                                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-xs active:scale-[0.99] transition-all flex items-center gap-1.5 cursor-pointer"
                                  title={t('advertiser.billing.open_campaign_billing', 'Pay or View Details')}
                                >
                                  <FleetIcons.Eye className="w-3.5 h-3.5 text-white" />
                                  <span>{t('advertiser_billing.view_details', 'View Details')}</span>
                                </Link>
                              )}
                              <button
                                type="button"
                                onClick={() => handleOpenInvoice(inv, false)}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                                title={t('advertiser.billing.view_invoice', 'View Tax Invoice')}
                              >
                                <FleetIcons.FileText className="w-3.5 h-3.5 text-blue-500" />
                                <span>{t('advertiser.billing.btn_tax_invoice', 'Tax Invoice')}</span>
                              </button>
                              <InvoiceDownloadButton
                                invoice={inv}
                                invoiceId={inv.numericId || inv.poReference || inv.campCode || inv.id}
                                variant="compact"
                                color="outline"
                                label="Download PDF"
                                directPrint={true}
                              />
                            </>
                          ) : (
                            <>
                              {detailsUrl && (
                                <Link
                                  to={detailsUrl}
                                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                                  title={t('advertiser.billing.open_details')}
                                >
                                  <FleetIcons.Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                  <span>{t('advertiser.billing.details', 'Details')}</span>
                                </Link>
                              )}
                              <button
                                type="button"
                                onClick={() => handleOpenInvoice(inv, false)}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                                title={t('advertiser.billing.view_invoice', 'View Certified Tax Invoice')}
                              >
                                <FleetIcons.FileText className="w-3.5 h-3.5 text-blue-500" />
                                <span>{t('advertiser.billing.btn_tax_invoice', 'Tax Invoice')}</span>
                              </button>
                              <InvoiceDownloadButton
                                invoice={inv}
                                invoiceId={inv.numericId || inv.poReference || inv.campCode || inv.id}
                                variant="compact"
                                color="outline"
                                label="Download PDF"
                                directPrint={true}
                              />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Global Pagination for Invoices */}
        <Pagination
          currentPage={invoicePage}
          totalPages={totalInvoicePages}
          totalItems={filteredInvoices.length}
          pageSize={invoicePageSize}
          pageSizeOptions={[5, 10, 20, 50]}
          onPageChange={setInvoicePage}
          onPageSizeChange={(newSize) => {
            setInvoicePageSize(newSize);
            setInvoicePage(1);
          }}
        />
      </div>

      {/* Transaction History Ledger with View Mode Toggle, Search & Global Pagination */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Table Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {t('advertiser_billing.history_tab', 'Transaction History')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isGov
                ? 'Public campaign disbursements, treasury wire settlements, and clearance logs.'
                : t('advertiser_billing.history_sub', 'Live ad spend debits, gateway settlements, and payment clearing logs.')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <FleetIcons.Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('advertiser.billing.search_tx_ph')}
                value={txSearch}
                onChange={(e) => {
                  setTxSearch(e.target.value);
                  setTxPage(1);
                }}
                className="w-40 sm:w-52 pl-8 pr-3 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              tableValue="table"
              cardValue="card"
            />
          </div>
        </div>

        {/* View Mode: Table */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto no-scrollbar">
            {paginatedTransactions.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-xs font-medium space-y-1.5">
                <FleetIcons.CreditCard className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  {t('advertiser_billing.no_history', 'No Transaction Records')}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('advertiser_billing.no_history_sub', 'Campaign billing debits and payment receipts will be recorded here.')}
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4 sm:px-6">{t('transactions.col_code', 'Transaction ID')}</th>
                    <th className="py-3.5 px-4">{t('common.date', 'Date')}</th>
                    <th className="py-3.5 px-4">{t('common.description', 'Description')}</th>
                    <th className="py-3.5 px-4 hidden md:table-cell">{t('nav.campaigns', 'Campaign')}</th>
                    <th className="py-3.5 px-4 text-right">{t('common.amount', 'Amount')}</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">{t('common.status', 'Status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                  {paginatedTransactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-slate-900 dark:text-slate-100">{txn.id}</td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">{txn.date}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">{txn.description}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 hidden md:table-cell">{txn.campaign}</td>
                      <td className={`py-3.5 px-4 text-right font-black ${txn.type === 'Credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}`}>
                        {txn.type === 'Credit' ? '+' : '-'} ₹ {txn.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {txn.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* View Mode: Cards */}
        {viewMode === 'card' && (
          <div className="p-4 sm:p-6">
            {paginatedTransactions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-medium space-y-1.5">
                <FleetIcons.CreditCard className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="font-bold text-slate-700 dark:text-slate-300">{t('advertiser.billing.no_records')}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('advertiser.billing.no_records_desc')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedTransactions.map((txn) => (
                  <div key={txn.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">{txn.id}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {txn.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{txn.description}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span>{txn.date} · {txn.campaign}</span>
                      <span className={`font-black text-sm ${txn.type === 'Credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}`}>
                        {txn.type === 'Credit' ? '+' : '-'} ₹ {txn.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Global Pagination for Transactions */}
        <div className="px-5 sm:px-6">
          <Pagination
            currentPage={txPage}
            totalPages={totalTxPages}
            totalItems={filteredTransactions.length}
            pageSize={txPageSize}
            pageSizeOptions={[5, 10, 20, 50]}
            onPageChange={setTxPage}
            onPageSizeChange={(newSize) => {
              setTxPageSize(newSize);
              setTxPage(1);
            }}
          />
        </div>
      </div>


    </div>
  );
};

export default BillingPaymentsPage;
