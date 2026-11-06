import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFinanceRole } from '../../hooks/finance/useFinanceRole';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { FleetIcons } from '../../components/FleetIcons';

function currentMonthStr() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export const GstManagementPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/finance' : '/finance';
  const { gstSummary, loadGstSummary } = useFinanceRole();
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'gstin' | 'amounts'
  const [refreshing, setRefreshing] = useState(false);
  const [periodMonth, setPeriodMonth] = useState(currentMonthStr);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadGstSummary(periodMonth ? { periodMonth } : {});
      toast.success(t('finance.gst.refreshed_success', 'GST tax summaries refreshed!'));
    } catch {
      toast.error(t('finance.gst.refresh_failed', 'Failed to refresh GST summary.'));
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadGstSummary(periodMonth ? { periodMonth } : {}).catch(() => {});
  }, [loadGstSummary, periodMonth]);

  const breakup = Array.isArray(gstSummary?.breakup) ? gstSummary.breakup : [];

  const tabs = [
    { id: 'details', label: t('finance.gst.tab_overview', 'GST Overview') },
    { id: 'gstin', label: t('finance.gst.tab_gstin_info', 'GSTIN Information') },
    { id: 'amounts', label: t('finance.gst.tab_breakup', 'GST Amounts & Breakup') },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4 print:hidden">
        <div>
          <Breadcrumb
            items={[
              {
                label: basePath.startsWith('/superadmin')
                  ? t('nav.superadmin', 'Super Admin')
                  : t('nav.headers.finance_portal', 'Finance Portal'),
                path: `${basePath}/dashboard`,
              },
              { label: t('finance.gst_governance_title', 'GST & Tax Governance') },
            ]}
            className="mb-2"
          />
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('finance.gst_governance_title', 'GST & Tax Governance')}</h1>
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-md border ${gstSummary?.verificationStatus === 'configured'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'}`}>
              <FleetIcons.Check className="w-3.5 h-3.5" />
              {gstSummary?.verificationStatus === 'configured'
                ? t('finance.gst.gstin_configured', 'GSTIN Configured')
                : t('finance.gst.gstin_not_configured', 'GSTIN Not Configured')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            {t('finance.gst.subtitle_paid_basis', 'Output-tax summary computed from paid invoices (cash basis).')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <input
            type="month"
            value={periodMonth}
            onChange={(event) => setPeriodMonth(event.target.value)}
            className="flex-1 sm:flex-none px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
            aria-label={t('ag.finance.gstmanagementpage.gst_filing_month', 'GST filing month')}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPeriodMonth('')}
              className="flex-1 sm:flex-none px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer whitespace-nowrap"
            >
              {t('ag.finance.gstmanagementpage.all_time', 'All Time')}
            </button>
            <RefreshButton onClick={handleRefresh} loading={refreshing} className="flex-1 sm:flex-none justify-center" />
          </div>
        </div>
      </div>

      {/* 3 Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto no-scrollbar print:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white shadow-sm shadow-indigo-500/25'
                : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/20 px-4 py-3 text-xs">
        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold">
          <FleetIcons.Receipt className="w-4 h-4" />
          {t('ag.finance.gstmanagementpage.saved_invoice_breakdowns_are_the_source_of_t', 'Saved invoice breakdowns are the source of truth')}
        </div>
        <div className="text-slate-500 dark:text-zinc-400">
          {t('ag.finance.gstmanagementpage.period', 'Period:')} <strong>{periodMonth || t('ag.finance.gstmanagementpage.all_time', 'All time')}</strong>
          {Number(gstSummary?.repairedRecords || 0) > 0 && <> {t('ag.finance.gstmanagementpage.reconciled_records', '· Reconciled records:')} <strong>{gstSummary.repairedRecords}</strong></>}
        </div>
      </div>

      {/* TAB 1: GST DETAILS */}
      {activeTab === 'details' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Overview KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 print:hidden">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('finance.total_taxable_value', 'Total Taxable Value')}</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {gstSummary?.taxableValue ? (String(gstSummary.taxableValue).startsWith('₹') ? gstSummary.taxableValue : `₹${Number(gstSummary.taxableValue).toLocaleString('en-IN')}`) : '₹0'}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">{t('finance.billed_outward_sales', 'Billed on outward sales')}</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">{t('finance.gst.cgst')}</span>
              <div className="text-2xl font-black text-emerald-700 font-mono">
                {gstSummary?.cgst ? (String(gstSummary.cgst).startsWith('₹') ? gstSummary.cgst : `₹${Number(gstSummary.cgst).toLocaleString('en-IN')}`) : '₹0'}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">{t('finance.central_gst_accrued', 'Central GST accrued')}</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">{t('finance.gst.sgst')}</span>
              <div className="text-2xl font-black text-blue-700 font-mono">
                {gstSummary?.sgst ? (String(gstSummary.sgst).startsWith('₹') ? gstSummary.sgst : `₹${Number(gstSummary.sgst).toLocaleString('en-IN')}`) : '₹0'}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">{t('finance.state_gst_accrued', 'State GST accrued')}</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-violet-600">{t('finance.gst.igst')}</span>
              <div className="text-2xl font-black text-violet-700 dark:text-violet-400 font-mono">
                ₹{Number(gstSummary?.igst || 0).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">{t('ag.finance.gstmanagementpage.integrated_gst_from_saved_breakdowns', 'Integrated GST from saved breakdowns')}</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">{t('finance.gst.total_gst')}</span>
              <div className="text-2xl font-black text-purple-700 font-mono">
                {gstSummary?.totalGst ? (String(gstSummary.totalGst).startsWith('₹') ? gstSummary.totalGst : `₹${Number(gstSummary.totalGst).toLocaleString('en-IN')}`) : '₹0'}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">{t('finance.aggregate_gst_sub', 'Aggregate GST liability')}</p>
            </div>
          </div>

          {/* My GST Details Card */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5 print:border-none print:shadow-none">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">{t('finance.gst.corp_gst_reg')}</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{t('finance.verified_gst_id', 'Verified Goods & Services Tax Identification')}</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-full">
                {t('ag.finance.gstmanagementpage.configuration_record', 'Configuration Record')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1">
                <span className="text-slate-400">{t('finance.legal_entity_name', 'Legal Entity Name:')}</span>
                <div className="font-bold text-slate-900 dark:text-white">{gstSummary?.legalName || t('common.not_configured', 'Not configured')}</div>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1">
                <span className="text-slate-400">{t('finance.gstin_reg', 'GSTIN Registration:')}</span>
                <div className="font-mono font-bold text-blue-700 dark:text-blue-400">{gstSummary?.gstin || t('common.not_configured', 'Not configured')}</div>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1">
                <span className="text-slate-400">{t('finance.principal_place', 'Principal Place of Business:')}</span>
                <div className="font-medium text-slate-800 dark:text-zinc-200">{gstSummary?.state || t('common.not_configured', 'Not configured')}{gstSummary?.stateCode ? ` (GST state code: ${gstSummary.stateCode})` : ''}</div>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1">
                <span className="text-slate-400">{t('finance.filing_cycle', 'Filing Cycle:')}</span>
                <div className="font-bold text-slate-800 dark:text-zinc-200">{gstSummary?.filingFrequency ?? t('finance.gst.filing_monthly', 'Monthly (GSTR-1 & GSTR-3B)')}</div>
              </div>
              <div className="sm:col-span-2 p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1">
                <span className="text-slate-400">{t('finance.admin_jurisdiction', 'Administrative Jurisdiction:')}</span>
                <div className="font-medium text-slate-800 dark:text-zinc-200">{gstSummary?.jurisdiction || t('common.not_configured', 'Not configured')}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GSTIN INFORMATION */}
      {activeTab === 'gstin' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">{t('ag.finance.gstmanagementpage.customer_gstin_filing_summary', 'Customer GSTIN Filing Summary')}</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{t('ag.finance.gstmanagementpage.customer_gstins_recorded_on_invoices_for_the', 'Customer GSTINs recorded on invoices for the selected filing period. This is not a company-registration roster.')}</p>
          </div>

          <div className="space-y-3">
            {(!gstSummary?.customerGstinSummary || gstSummary.customerGstinSummary.length === 0) && (
              <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white font-mono text-sm">{t('ag.finance.gstmanagementpage.no_customer_gstin_records', 'No customer GSTIN records')}</h3>
                  <div className="text-slate-500 dark:text-zinc-400 text-[11px] mt-0.5">
                    {t('ag.finance.gstmanagementpage.the_selected_period_has_no_invoices_with_a_c', 'The selected period has no invoices with a customer GSTIN.')}
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-md self-start sm:self-center">
                  {t('ag.finance.gstmanagementpage.empty_period', 'Empty period')}
                </span>
              </div>
            )}
            {(gstSummary?.customerGstinSummary || []).map((reg, idx) => (
              <div key={idx} className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white font-mono text-sm">{reg.gstin}</h3>
                  <div className="text-slate-500 dark:text-zinc-400 text-[11px] mt-0.5">
                    {t('ag.finance.gstmanagementpage.billed_invoices', 'Billed Invoices:')} <strong className="text-slate-700 dark:text-zinc-300">{reg.invoicesCount}</strong> {t('ag.finance.gstmanagementpage.taxable_value', '· Taxable Value:')}{' '}
                    <strong className="text-slate-700 dark:text-zinc-300">₹{Number(reg.taxableAmount || 0).toLocaleString('en-IN')}</strong> {t('ag.finance.gstmanagementpage.total_tax', '· Total Tax:')}{' '}
                    <strong className="text-blue-700 dark:text-blue-400">₹{Number(reg.totalTax || 0).toLocaleString('en-IN')}</strong>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-md self-start sm:self-center">
                  {reg.status || t('finance.gst.status_recorded', 'Recorded')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: GST AMOUNTS & BREAKUP */}
      {activeTab === 'amounts' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('finance.total_taxable_value', 'Total Taxable Value')}</span>
              <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                {gstSummary?.taxableValue ? (String(gstSummary.taxableValue).startsWith('₹') ? gstSummary.taxableValue : `₹${Number(gstSummary.taxableValue).toLocaleString('en-IN')}`) : '₹0'}
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('finance.total_gst_liability', 'Total GST Liability')}</span>
              <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                {gstSummary?.totalGst ? (String(gstSummary.totalGst).startsWith('₹') ? gstSummary.totalGst : `₹${Number(gstSummary.totalGst).toLocaleString('en-IN')}`) : '₹0'}
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">{t('finance.gst.igst')}</span>
              <div className="text-xl font-black text-emerald-700 font-mono">
                {gstSummary?.igst ? (String(gstSummary.igst).startsWith('₹') ? gstSummary.igst : `₹${Number(gstSummary.igst).toLocaleString('en-IN')}`) : '₹0'}
              </div>
            </div>
          </div>

          {/* Detailed Tax Breakup Table */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">{t('finance.gst.headwise_breakup')}</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{t('finance.gst_head_sub', 'Computed across CGST, SGST, IGST and Compensation Cess')}</p>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">{t('finance.gst.tax_head')}</th>
                    <th className="py-3 px-4">{t('finance.gst.rate')}</th>
                    <th className="py-3 px-4">{t('ag.finance.gstmanagementpage.referenced_taxable_value', 'Referenced Taxable Value')}</th>
                    <th className="py-3 px-4 text-right">{t('finance.gst.output_tax')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium text-slate-700 dark:text-zinc-300">
                  {breakup.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400 font-medium">{t('finance.gst.no_records')}</td>
                    </tr>
                  )}
                  {breakup.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{row.taxHead ?? '—'}</td>
                      <td className="py-3.5 px-4">{row.rate ?? '—'}</td>
                      <td className="py-3.5 px-4 font-mono">
                        ₹{Number(String(row.taxable || 0).replace(/[^0-9.]/g, '')).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white text-right">
                        ₹{Number(String(row.amount || row.outputTax || 0).replace(/[^0-9.]/g, '')).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GstManagementPage;
