import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { useSuperBilling } from '../../hooks/superadmin/useSuperBilling';
import toast from 'react-hot-toast';

export const SuperBillingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    revenueSummary,
    settlements,
    topTenants,
    loadRevenueSummary,
    loadSettlements,
    loadTopTenants,
  } = useSuperBilling();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('settlements'); // 'settlements' | 'top_tenants'

  useEffect(() => {
    loadRevenueSummary().catch(() => {});
    loadSettlements().catch(() => {});
    if (loadTopTenants) loadTopTenants().catch(() => {});
  }, [loadRevenueSummary, loadSettlements, loadTopTenants]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadRevenueSummary(),
        loadSettlements(),
        loadTopTenants ? loadTopTenants() : Promise.resolve(),
      ]);
      toast.success('Billing metrics refreshed!');
    } catch {
      toast.error('Failed to refresh billing data.');
    } finally {
      setRefreshing(false);
    }
  };

  const billingData = revenueSummary || {};
  const gateways = Array.isArray(billingData?.gateways) ? billingData.gateways : [];
  const settlementList = Array.isArray(settlements)
    ? settlements
    : (Array.isArray(settlements?.rows) ? settlements.rows : (Array.isArray(settlements?.data) ? settlements.data : []));

  const topTenantList = Array.isArray(topTenants)
    ? topTenants
    : (Array.isArray(topTenants?.rows) ? topTenants.rows : (Array.isArray(topTenants?.data) ? topTenants.data : []));

  // Indian Currency Formatter with precise 2 decimals for paise
  const formatCurrency = (val) => {
    if (val == null || isNaN(Number(val))) return '₹0';
    const num = Number(val);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: num % 1 === 0 ? 0 : 2,
      minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    }).format(num);
  };

  // Helper for Gateway brand badges
  const getGatewayIcon = (provider) => {
    const p = String(provider || '').toLowerCase();
    if (p.includes('stripe')) {
      return (
        <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.462 5.76 6.467 7.152 2.766.963 3.659 1.687 3.659 2.767 0 1.026-.893 1.542-2.327 1.542-2.585 0-5.384-1.258-7.399-2.396L3.25 21.933C4.854 22.82 8.01 24 11.455 24c2.616 0 4.79-.683 6.33-1.931 1.635-1.325 2.457-3.23 2.457-5.594 0-4.329-2.614-6.071-6.266-7.325z" />
          </svg>
        </div>
      );
    }
    if (p.includes('razorpay')) {
      return (
        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
      </div>
    );
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
        <span className="text-slate-900 dark:text-white font-bold">Billing & Revenue Console</span>
      </nav>

      {/* Header with Title and Unified Responsive Action Buttons (Strictly One Single Line) */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Billing & Revenue Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Platform GTV revenue analytics, retained platform commissions, gateway rails, and tenant ad settlements
          </p>
        </div>

        {/* Action Controls — strictly in ONE line with overflow-x-auto for smaller screens */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full shrink-0 pb-1 xl:pb-0">
          {/* Refresh Button */}
          <RefreshButton
            onClick={handleRefresh}
            loading={refreshing}
            title="Refresh billing data"
          />

          {/* Action 1: Subscription Plans */}
          <button
            type="button"
            onClick={() => navigate('/superadmin/plans')}
            className="px-3 sm:px-3.5 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap cursor-pointer"
          >
            <FleetIcons.Ticket className="w-4 h-4 shrink-0" />
            <span>Subscription Plans</span>
          </button>

          {/* Action 2: Manage Gateways */}
          <button
            type="button"
            onClick={() => navigate('/superadmin/settings/payment-gateways')}
            className="px-3 sm:px-3.5 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Payment Gateways</span>
          </button>

          {/* Action 3: Transactions Ledger */}
          <button
            type="button"
            onClick={() => navigate('/superadmin/transactions')}
            className="px-3 sm:px-3.5 py-2 sm:py-2.5 bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 sm:gap-2 border border-slate-700 dark:border-zinc-700 shrink-0 whitespace-nowrap cursor-pointer"
          >
            <FleetIcons.Analytics className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Transactions Ledger</span>
          </button>
        </div>
      </div>

      {/* 4 Financial Stat Cards (Mobile Optimized with Clean Number Formatting) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Platform GTV */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 hover:border-blue-300 dark:hover:border-blue-900/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Total Platform GTV</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FleetIcons.Analytics className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(billingData?.totalGtv)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Gross advertising + SaaS billings</p>
        </div>

        {/* Card 2: VMOVEXA Net Retained */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 hover:border-emerald-300 dark:hover:border-emerald-900/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">VMOVEXA Net Retained</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FleetIcons.Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            {formatCurrency(billingData?.platformShare)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Platform software & NOC operations</p>
        </div>

        {/* Card 3: Tenant Payouts Due */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 hover:border-blue-300 dark:hover:border-blue-900/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Tenant Payouts Due</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FleetIcons.Fleets className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
            {formatCurrency(billingData?.tenantPayoutsDue)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Distributed across transit operators</p>
        </div>

        {/* Card 4: GST Output Tax (18%) — Formatted with 2 Decimals */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 hover:border-purple-300 dark:hover:border-purple-900/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">GST Output Tax (18%)</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <FleetIcons.Reports className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
            {formatCurrency(billingData?.gstCollected)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">HSN 997331 (CGST 9% + SGST 9%)</p>
        </div>
      </div>

      {/* Main Content Grid: Payment Gateways & Tenant Ad Settlements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 Cols): Configured Payment Rails */}
        <div className="lg:col-span-4 bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between gap-2 flex-wrap">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <FleetIcons.Ticket className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Configured Payment Rails</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                Stripe, Razorpay, Cashfree & Treasury Wire
              </p>
            </div>
            <Link
              to="/superadmin/settings/payment-gateways"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Configure Keys</span>
              <span>→</span>
            </Link>
          </div>

          <div className="space-y-3">
            {gateways.length === 0 ? (
              <div className="p-6 text-center text-slate-400 dark:text-zinc-500 text-xs font-medium rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
                No payment gateway metrics recorded yet.
              </div>
            ) : (
              gateways.map((gw, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50/80 dark:bg-zinc-900/60 rounded-xl border border-slate-100 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {getGatewayIcon(gw.provider || gw.name)}
                      <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                        {gw.name}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>{gw.status}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-200/50 dark:border-zinc-800/60">
                    <span className="text-[11px]">
                      Reliability: <strong className="text-slate-800 dark:text-zinc-200 font-bold">{gw.successRate}</strong>
                    </span>
                    <span className="text-[11px]">
                      Processed: <strong className="text-blue-600 dark:text-blue-400 font-bold">{gw.volumeToday}</strong>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column (8 Cols): Tenant Settlements & Top Operators */}
        <div className="lg:col-span-8 bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('settlements')}
                  className={`text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 pb-0.5 transition-colors cursor-pointer ${
                    activeTab === 'settlements'
                      ? 'text-slate-900 dark:text-white border-b-2 border-emerald-500'
                      : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
                  }`}
                >
                  <FleetIcons.Analytics className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Ad Commission Settlements</span>
                </button>

                <span className="text-slate-300 dark:text-zinc-700">|</span>

                <button
                  type="button"
                  onClick={() => setActiveTab('top_tenants')}
                  className={`text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 pb-0.5 transition-colors cursor-pointer ${
                    activeTab === 'top_tenants'
                      ? 'text-slate-900 dark:text-white border-b-2 border-blue-500'
                      : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
                  }`}
                >
                  <FleetIcons.Fleets className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Top Transit Tenants</span>
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1">
                {activeTab === 'settlements'
                  ? 'Automated bank disbursements for display screen playtime'
                  : 'Highest revenue-generating transit operators & public transport fleets'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800/80 px-3 py-1 rounded-full border border-slate-200 dark:border-zinc-700">
                Auto-Disbursed on 20th
              </span>
            </div>
          </div>

          {/* TAB 1: Ad Commission Settlements */}
          {activeTab === 'settlements' && (
            <div>
              {/* Desktop Table View (Hidden on Mobile) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
                  <thead className="bg-slate-50 dark:bg-zinc-900/60 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Settlement Ref</th>
                      <th className="py-3 px-4">Fleet Tenant</th>
                      <th className="py-3 px-4">Net Payout</th>
                      <th className="py-3 px-4">Disbursement Status</th>
                      <th className="py-3 px-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 font-medium">
                    {!settlementList || settlementList.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-12 text-center text-slate-400 dark:text-zinc-500">
                          <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 dark:text-zinc-500">
                            <FleetIcons.Reports className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">No tenant ad commission settlements recorded yet.</p>
                          <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                            Commission payouts are computed and scheduled on monthly settlement cycles.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      settlementList.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{s.code || `SET-${s.id}`}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{s.organization?.name || 'Transit Authority'}</td>
                          <td className="py-3.5 px-4 font-black text-emerald-600 dark:text-emerald-400">₹{Number(s.amount || 0).toLocaleString('en-IN')}</td>
                          <td className="py-3.5 px-4">
                            <span className={`text-[11px] font-bold ${s.status === 'settled' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                              {s.status === 'settled' ? `Settled (UTR: ${s.utr_ref || 'Verified'})` : (s.status || 'Pending')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-slate-400 dark:text-zinc-500">
                            {s.settled_at
                              ? new Date(s.settled_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                              : (s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN') : 'N/A')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View (Visible on Mobile Only) */}
              <div className="block md:hidden space-y-3">
                {!settlementList || settlementList.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 dark:text-zinc-500 bg-slate-50 dark:bg-zinc-900/50 rounded-xl p-4 border border-dashed border-slate-200 dark:border-zinc-800">
                    <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-slate-200/60 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
                      <FleetIcons.Reports className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">No settlements recorded yet</p>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                      Disbursed on the 20th of each month.
                    </p>
                  </div>
                ) : (
                  settlementList.map((s) => (
                    <div
                      key={s.id}
                      className="p-3.5 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                          {s.code || `SET-${s.id}`}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                          {s.settled_at
                            ? new Date(s.settled_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                            : (s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN') : '')}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {s.organization?.name || 'Transit Authority'}
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-zinc-800">
                        <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                          ₹{Number(s.amount || 0).toLocaleString('en-IN')}
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          s.status === 'settled'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-200 dark:border-amber-800'
                        }`}>
                          {s.status === 'settled' ? 'Settled' : (s.status || 'Pending')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Top Transit Tenants */}
          {activeTab === 'top_tenants' && (
            <div>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
                  <thead className="bg-slate-50 dark:bg-zinc-900/60 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Transit Organization</th>
                      <th className="py-3 px-4">Org Code</th>
                      <th className="py-3 px-4 text-right">Total Billing Volume</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 font-medium">
                    {!topTenantList || topTenantList.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="py-10 text-center text-slate-400 dark:text-zinc-500 text-xs font-medium">
                          No tenant billing activity recorded yet.
                        </td>
                      </tr>
                    ) : (
                      topTenantList.map((tItem, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                            {tItem.organization?.name || 'Commercial Tenant / Direct Billing'}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-zinc-400">
                            {tItem.organization?.code || `ORG-${tItem.organization_id || 'PLATFORM'}`}
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-blue-600 dark:text-blue-400">
                            ₹{Number(tItem.total_paid || 0).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="block md:hidden space-y-2.5">
                {!topTenantList || topTenantList.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    No tenant billing activity recorded yet.
                  </div>
                ) : (
                  topTenantList.map((tItem, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {tItem.organization?.name || 'Commercial Tenant'}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                          {tItem.organization?.code || `ORG-${tItem.organization_id || 'PLATFORM'}`}
                        </div>
                      </div>
                      <div className="text-sm font-black text-blue-600 dark:text-blue-400">
                        ₹{Number(tItem.total_paid || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperBillingPage;
