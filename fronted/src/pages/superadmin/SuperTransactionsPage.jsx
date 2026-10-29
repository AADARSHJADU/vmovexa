import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import billingService from '../../api/services/billing.service';
import organizationService from '../../api/services/organization.service';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { storage } from '../../utils/storage';
import toast from 'react-hot-toast';
import { InvoiceDownloadButton } from '../../components/billing/InvoiceDownloadButton';

export const SuperTransactionsPage = () => {
  const { t } = useTranslation();

  // View Mode: 'main' | 'record-wire' | 'preview-invoice'
  const [currentView, setCurrentView] = useState('main');

  // Master Ledger State
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [txMeta, setTxMeta] = useState({ total: 0, page: 1, limit: 15 });
  const [txSearch, setTxSearch] = useState('');
  const [txStatusFilter, setTxStatusFilter] = useState('');
  const [txRailFilter, setTxRailFilter] = useState('');

  // Offline Wire State
  const [submittingOffline, setSubmittingOffline] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [plans, setPlans] = useState([]);
  const [offlineForm, setOfflineForm] = useState({
    organizationId: '',
    planId: '',
    amount: '',
    bankRef: '',
    bankName: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Invoice Inspection State
  const [previewInvoiceId, setPreviewInvoiceId] = useState(null);

  const loadTransactionsData = useCallback(async (page = 1, limit = txMeta.limit || 15) => {
    try {
      setLoadingTx(true);
      const res = await billingService.getTransactions({
        page,
        limit,
        search: txSearch,
        status: txStatusFilter,
        gateway: txRailFilter,
      });
      const items = res?.rows || (Array.isArray(res) ? res : []);
      setTransactions(items);
      if (res?.meta) {
        setTxMeta(res.meta);
      } else {
        setTxMeta({ total: items.length, page, limit, totalPages: Math.ceil(items.length / limit) || 1 });
      }
    } catch (err) {
      toast.error('Failed to load transaction ledger.');
    } finally {
      setLoadingTx(false);
    }
  }, [txSearch, txStatusFilter, txRailFilter, txMeta.limit]);

  const loadOrgsAndPlans = async () => {
    try {
      const [orgRes, planRes] = await Promise.all([
        organizationService.getOrganizations(),
        billingService.getAllPlans(),
      ]);
      setOrganizations(Array.isArray(orgRes) ? orgRes : orgRes?.rows || []);
      setPlans(planRes || []);
    } catch (_) {}
  };

  useEffect(() => {
    loadTransactionsData(1);
    loadOrgsAndPlans();
  }, [loadTransactionsData]);

  const handleOpenRecordWire = () => {
    setOfflineForm({
      organizationId: organizations[0]?.id || '',
      planId: plans[0]?.id || '',
      amount: plans[0]?.monthly_price || '',
      bankRef: '',
      bankName: '',
      paymentDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setCurrentView('record-wire');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPreviewInvoice = (invoiceId) => {
    setPreviewInvoiceId(invoiceId);
    setCurrentView('preview-invoice');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitOfflineWire = async (e) => {
    e.preventDefault();
    if (!offlineForm.organizationId || !offlineForm.planId || !offlineForm.bankRef) {
      toast.error('Please select Organization, Plan, and enter Bank UTR reference.');
      return;
    }
    try {
      setSubmittingOffline(true);
      await billingService.recordOfflinePayment({
        organizationId: offlineForm.organizationId,
        planId: offlineForm.planId,
        amount: offlineForm.amount ? Number(offlineForm.amount) : undefined,
        bankRef: offlineForm.bankRef,
        bankName: offlineForm.bankName,
        paymentDate: offlineForm.paymentDate,
        notes: offlineForm.notes,
      });
      toast.success('Bank Wire verified! Subscription activated & GST Tax invoice issued.');
      setCurrentView('main');
      loadTransactionsData(1);
    } catch (err) {
      toast.error(err.message || 'Failed to record offline payment.');
    } finally {
      setSubmittingOffline(false);
    }
  };

  const handleExportLedgerCSV = () => {
    if (!transactions || transactions.length === 0) {
      toast.error('No transactions available to export.');
      return;
    }
    const headers = 'Transaction Code,Organization,Plan,Base Amount (INR),Tax Amount (INR),Total Amount (INR),Payment Rail,Reference,Status,Date\n';
    const rows = transactions.map((t) => [
      t.code,
      `"${t.organization?.name || 'Platform Tenant'}"`,
      `"${t.plan?.name || 'SaaS Plan'}"`,
      t.invoice?.subtotal || t.amount,
      t.invoice?.tax_amount || 0,
      t.amount,
      t.method || 'card',
      `"${t.gateway_ref || t.gateway_order_id || 'N/A'}"`,
      t.status || 'success',
      t.created_at ? new Date(t.created_at).toISOString().split('T')[0] : 'N/A',
    ].join(',')).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `vmovexa_transactions_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Master Transaction Ledger exported to CSV!');
  };

  const handlePrintInvoice = (id) => {
    const token = storage.getAccessToken();
    const url = `${billingService.getInvoiceHtmlUrl(id)}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    window.open(url, '_blank');
  };

  const selectedPlan = plans.find((p) => String(p.id) === String(offlineForm.planId));
  const wireBaseAmount = Number(offlineForm.amount) || Number(selectedPlan?.monthly_price) || 0;
  const wireGst = Math.round(wireBaseAmount * 0.18);
  const wireTotal = wireBaseAmount + wireGst;
  const txList = Array.isArray(transactions) ? transactions : [];

  // VIEW: RECORD OFFLINE BANK WIRE
  if (currentView === 'record-wire') {
    return (
      <div className="w-full space-y-6 animate-in fade-in duration-200">
        <Breadcrumb
          items={[
            { label: t('common.super_admin', 'Super Admin'), path: '/superadmin/dashboard' },
            { label: t('transactions.title', 'Subscription Transactions & Ledger'), path: '#', onClick: () => setCurrentView('main') },
            { label: t('transactions.record_wire_crumb', 'Record Bank Wire (RTGS)') },
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentView('main')}
              className="w-fit px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
            >
              <FleetIcons.ArrowLeft className="w-3.5 h-3.5 shrink-0" />
              <span>{t('transactions.back_to_ledger', 'Back to Master Ledger')}</span>
            </button>
            <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800 hidden sm:block" />
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {t('transactions.record_wire_title', 'Record Offline Bank Wire (RTGS / Treasury Settlement)')}
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                {t('transactions.record_wire_sub', 'Verify government treasury or direct wire transfer to instantly activate tenant subscription')}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleSubmitOfflineWire} className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  {t('transactions.section_tenant', '1. Tenant Organization & Operating Tier')}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">{t('transactions.select_tenant', 'Select Tenant Organization *')}</label>
                  <select
                    required
                    value={offlineForm.organizationId}
                    onChange={(e) => setOfflineForm({ ...offlineForm, organizationId: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="">{t('transactions.choose_tenant', '-- Choose Tenant --')}</option>
                    {organizations.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.code || `ID: ${o.id}`}) — {o.state || 'India'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">{t('transactions.select_plan', 'Select SaaS Plan Tier *')}</label>
                  <select
                    required
                    value={offlineForm.planId}
                    onChange={(e) => {
                      const p = plans.find((item) => String(item.id) === e.target.value);
                      setOfflineForm({
                        ...offlineForm,
                        planId: e.target.value,
                        amount: p ? p.monthly_price : '',
                      });
                    }}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="">{t('transactions.choose_plan', '-- Choose Plan Tier --')}</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ₹{Number(p.monthly_price).toLocaleString('en-IN')}/mo ({p.buses_limit} Buses)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  {t('transactions.section_bank', '2. Bank Wire / Treasury Challan Particulars')}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">{t('transactions.utr_label', 'Bank UTR / Transaction Ref *')}</label>
                  <input
                    type="text"
                    required
                    placeholder={t('transactions.utr_placeholder', 'e.g. SBIN202609071239')}
                    value={offlineForm.bankRef}
                    onChange={(e) => setOfflineForm({ ...offlineForm, bankRef: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">{t('transactions.base_amount', 'Base Subscription Amount (INR)')}</label>
                  <input
                    type="number"
                    placeholder={t('transactions.base_amount_ph', 'Base Amount')}
                    value={offlineForm.amount}
                    onChange={(e) => setOfflineForm({ ...offlineForm, amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">{t('transactions.bank_branch', 'Bank / Treasury Branch Name')}</label>
                  <input
                    type="text"
                    placeholder={t('transactions.bank_branch_placeholder', 'e.g. State Bank of India, Mumbai Main Treasury Branch')}
                    value={offlineForm.bankName}
                    onChange={(e) => setOfflineForm({ ...offlineForm, bankName: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">{t('transactions.settlement_date', 'Settlement Date')}</label>
                  <input
                    type="date"
                    value={offlineForm.paymentDate}
                    onChange={(e) => setOfflineForm({ ...offlineForm, paymentDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">{t('transactions.notes_label', 'Government Sanction Order / Notes')}</label>
                <textarea
                  rows="3"
                  placeholder={t('transactions.notes_placeholder', 'e.g. Approved under Ministry Transit Grant #491/2026.')}
                  value={offlineForm.notes}
                  onChange={(e) => setOfflineForm({ ...offlineForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentView('main')}
                className="px-5 py-2.5 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                disabled={submittingOffline}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {submittingOffline && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                <span>{t('transactions.verify_wire_btn', 'Verify Wire & Activate Tenant')}</span>
              </button>
            </div>
          </form>

          <div className="space-y-4">
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-4">
              <span className="text-xs font-bold tracking-wide uppercase text-slate-400 block">
                {t('transactions.tax_breakdown', 'Accounting & Tax Breakdown')}
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>{t('transactions.selected_tier', 'Selected Tier:')}</span>
                  <strong className="text-white">{selectedPlan?.name || 'None Selected'}</strong>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>{t('transactions.base_sub', 'Base Subscription:')}</span>
                  <span className="font-mono text-white">₹{wireBaseAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>{t('transactions.gst_tax', 'GST (18% SAC 997331):')}</span>
                  <span className="font-mono text-white">₹{wireGst.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-sm font-black text-white">
                  <span>{t('transactions.total_credited', 'Total Credited:')}</span>
                  <span className="font-mono text-emerald-400">₹{wireTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // VIEW: PREVIEW INVOICE
  if (currentView === 'preview-invoice' && previewInvoiceId) {
    return (
      <div className="w-full space-y-6 animate-in fade-in duration-200">
        <Breadcrumb
          items={[
            { label: t('common.super_admin', 'Super Admin'), path: '/superadmin/dashboard' },
            { label: t('transactions.title', 'Subscription Transactions & Ledger'), path: '#', onClick: () => setCurrentView('main') },
            { label: t('transactions.invoice_inspection', 'Official GST Tax Invoice Inspection') },
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentView('main')}
              className="w-fit px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
            >
              <FleetIcons.ArrowLeft className="w-3.5 h-3.5 shrink-0" />
              <span>{t('transactions.back_to_ledger', 'Back to Master Ledger')}</span>
            </button>
            <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800 hidden sm:block" />
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {t('transactions.invoice_inspection', 'Official GST Tax Invoice Inspection')}
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                {t('transactions.invoice_inspection_sub', 'SAC Code 997331 — Computer-generated certified tax invoice under GST Rules, 2017')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handlePrintInvoice(previewInvoiceId)}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white text-xs font-bold rounded-xl shadow-xs border border-transparent dark:border-zinc-700 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
          >
            <FleetIcons.Document className="w-4 h-4 shrink-0" />
            <span>{t('transactions.open_printable', 'Open Printable Window / Download PDF')}</span>
          </button>
        </div>

        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden h-[80vh] flex flex-col">
          <iframe
            src={`${billingService.getInvoiceHtmlUrl(previewInvoiceId)}?token=${encodeURIComponent(storage.getAccessToken() || '')}`}
            className="w-full flex-1 border-0"
            title={t('transactions.invoice_inspection', 'Official GST Tax Invoice Inspection')}
          />
        </div>
      </div>
    );
  }

  // MAIN VIEW: TRANSACTIONS LEDGER TABLE
  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: t('common.super_admin', 'Super Admin'), path: '/superadmin/dashboard' },
          { label: t('transactions.title', 'Subscription Transactions & Ledger') },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('transactions.title', 'Subscription Transactions & Ledger')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium">
            {t('transactions.subtitle', 'Master transaction history, online payments, RTGS bank wire verification, and GST invoices')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:self-start xl:self-auto shrink-0">
          <button
            type="button"
            onClick={handleExportLedgerCSV}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white text-xs font-bold rounded-xl shadow-xs border border-transparent dark:border-zinc-700 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap active:scale-[0.98]"
          >
            <FleetIcons.Document className="w-4 h-4 shrink-0" />
            <span>{t('transactions.export_csv', 'Export Ledger (CSV)')}</span>
          </button>

          <RefreshButton
            onClick={() => loadTransactionsData(txMeta.page, txMeta.limit)}
            loading={loadingTx}
            title={t('common.refresh', 'Refresh')}
            className="w-full sm:w-auto justify-center"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-3.5 sm:p-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
            <div className="relative flex-1 sm:max-w-xs md:max-w-sm">
              <FleetIcons.Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder={t('transactions.search_placeholder', 'Search by ID, UTR, Org Name...')}
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadTransactionsData(1)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
            </div>

            <select
              value={txStatusFilter}
              onChange={(e) => {
                setTxStatusFilter(e.target.value);
                loadTransactionsData(1);
              }}
              className="w-full sm:w-36 px-3 py-2 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-medium cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            >
              <option value="">{t('transactions.all_statuses', 'All Statuses')}</option>
              <option value="success">{t('common.success', 'Success')}</option>
              <option value="pending">{t('common.pending', 'Pending')}</option>
              <option value="failed">{t('common.failed', 'Failed')}</option>
            </select>

            <select
              value={txRailFilter}
              onChange={(e) => {
                setTxRailFilter(e.target.value);
                loadTransactionsData(1);
              }}
              className="w-full sm:w-44 px-3 py-2 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-medium cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            >
              <option value="">{t('transactions.all_rails', 'All Rails')}</option>
              <option value="stripe">{t('transactions.rail_stripe', 'Stripe')}</option>
              <option value="razorpay">{t('transactions.rail_razorpay', 'Razorpay')}</option>
              <option value="bank_wire">{t('transactions.rail_bank_wire', 'Bank Wire (RTGS)')}</option>
            </select>
          </div>

          {(txSearch || txStatusFilter || txRailFilter) && (
            <button
              type="button"
              onClick={() => {
                setTxSearch('');
                setTxStatusFilter('');
                setTxRailFilter('');
                loadTransactionsData(1);
              }}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center justify-center gap-1.5 cursor-pointer py-1.5 px-3 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all self-center md:self-auto shrink-0"
            >
              <FleetIcons.Close className="w-3.5 h-3.5 shrink-0" />
              <span>{t('common.clear_filters', 'Clear Filters')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Master Transactions Ledger Table */}
      <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs text-slate-700 dark:text-zinc-300">
            <thead className="bg-slate-50 dark:bg-zinc-900/60 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">{t('transactions.col_code', 'Transaction Code')}</th>
                <th className="py-3 px-4">{t('transactions.col_org', 'Organization / Tenant')}</th>
                <th className="py-3 px-4">{t('transactions.col_purpose', 'Plan / Purpose')}</th>
                <th className="py-3 px-4">{t('transactions.col_amount', 'Amount')}</th>
                <th className="py-3 px-4">{t('transactions.col_rail', 'Rail & Reference')}</th>
                <th className="py-3 px-4">{t('transactions.col_status', 'Status')}</th>
                <th className="py-3 px-4 text-right">{t('transactions.col_action', 'Date & Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 font-medium">
              {loadingTx ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 dark:text-zinc-500">{t('transactions.loading', 'Loading transaction ledger records...')}</td>
                </tr>
              ) : txList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 dark:text-zinc-500">{t('transactions.no_records', 'No transaction records found matching filters.')}</td>
                </tr>
              ) : (
                txList.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{tx.code}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {tx.campaign?.client_name || tx.campaign?.client_company || tx.organization?.name || 'Platform Payer'}
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                        {tx.campaign?.code || tx.organization?.code || 'TXN'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800 dark:text-zinc-200">
                        {tx.campaign?.title ? `DOOH: ${tx.campaign.title}` : tx.plan?.name || (tx.purpose === 'ad_spend' ? 'DOOH Transit Advertising' : 'SaaS Subscription')}
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                        {tx.purpose === 'ad_spend' ? 'SAC: 998363 (Transit DOOH)' : 'HSN: 997331'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-black text-slate-900 dark:text-white">₹{Number(tx.amount).toLocaleString('en-IN')}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                          {tx.method || 'card'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 block mt-0.5">
                        {tx.gateway_ref || tx.gateway_order_id || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          tx.status === 'success'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : tx.status === 'pending'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {(tx.status || 'success').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="text-slate-400 dark:text-zinc-500 font-mono text-[11px] mb-1">
                        {tx.created_at ? new Date(tx.created_at).toLocaleDateString('en-IN') : 'N/A'}
                      </div>
                      {tx.invoice && (
                        <InvoiceDownloadButton
                          invoice={tx.invoice}
                          variant="compact"
                          color="outline"
                          label={t('transactions.inspect_invoice', 'Tax Invoice')}
                        />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {txMeta.total > 0 && (
          <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 border-t border-slate-100 dark:border-zinc-800 rounded-b-2xl">
            <Pagination
              currentPage={txMeta.page || 1}
              totalPages={txMeta.totalPages || 1}
              totalItems={txMeta.total || 0}
              pageSize={txMeta.limit || 15}
              pageSizeOptions={[6, 10, 20, 50]}
              onPageChange={(p) => loadTransactionsData(p, txMeta.limit)}
              onPageSizeChange={(sz) => loadTransactionsData(1, sz)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperTransactionsPage;
