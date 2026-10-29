import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFinanceRole } from '../../hooks/finance/useFinanceRole';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { Breadcrumb } from '../../components/ui/Breadcrumb';

export const GstManagementPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/finance' : '/finance';
  const { gstSummary, loadGstSummary } = useFinanceRole();
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'gstin' | 'amounts'
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadGstSummary();
      toast.success('GST tax summaries refreshed!');
    } catch {
      toast.error('Failed to refresh GST summary.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadGstSummary().catch(() => {});
  }, [loadGstSummary]);

  const breakup = Array.isArray(gstSummary?.breakup) ? gstSummary.breakup : [];

  const tabs = [
    { id: 'details', label: 'GST Overview' },
    { id: 'gstin', label: 'GSTIN Information' },
    { id: 'amounts', label: 'GST Amounts & Breakup' },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4 print:hidden">
        <div>
          <Breadcrumb
            items={[
              { label: basePath.startsWith('/superadmin') ? 'Super Admin' : 'Finance Portal', path: `${basePath}/dashboard` },
              { label: 'GST Management' },
            ]}
            className="mb-2"
          />
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('finance.gst_governance_title', 'GST & Tax Governance')}</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-md">
              ● GST Verified
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Manage enterprise GSTIN registrations, input tax credit (ITC) ledgers, and return filings
          </p>
        </div>

        <div className="flex items-center gap-2">
          <RefreshButton onClick={handleRefresh} loading={refreshing} />
        </div>
      </div>

      {/* 4 Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto no-scrollbar print:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:bg-zinc-800/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: GST DETAILS */}
      {activeTab === 'details' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Overview KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
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
              <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                Active Regular Taxpayer
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1">
                <span className="text-slate-400">{t('finance.legal_entity_name', 'Legal Entity Name:')}</span>
                <div className="font-bold text-slate-900 dark:text-white">{gstSummary?.legalName ?? 'VMOVEXA PRIVATE LIMITED'}</div>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1">
                <span className="text-slate-400">{t('finance.gstin_reg', 'GSTIN Registration:')}</span>
                <div className="font-mono font-bold text-blue-700">{gstSummary?.gstin ?? '27M4BCY934D12S'}</div>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1">
                <span className="text-slate-400">{t('finance.principal_place', 'Principal Place of Business:')}</span>
                <div className="font-medium text-slate-800 dark:text-zinc-200">{gstSummary?.state ?? 'Maharashtra (State Code: 27)'}</div>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1">
                <span className="text-slate-400">{t('finance.filing_cycle', 'Filing Cycle:')}</span>
                <div className="font-bold text-slate-800 dark:text-zinc-200">{gstSummary?.filingFrequency ?? 'Monthly (GSTR-1 & GSTR-3B)'}</div>
              </div>
              <div className="sm:col-span-2 p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1">
                <span className="text-slate-400">{t('finance.admin_jurisdiction', 'Administrative Jurisdiction:')}</span>
                <div className="font-medium text-slate-800 dark:text-zinc-200">{gstSummary?.jurisdiction ?? 'Commissionerate: Mumbai East, Division: BKC'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GSTIN INFORMATION */}
      {activeTab === 'gstin' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">{t('finance.gst.multi_state_roster')}</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{t('finance.multistate_sub', 'State-wise transit licenses and GST registrations')}</p>
          </div>

          <div className="space-y-3">
            {(!gstSummary?.gstinList || gstSummary.gstinList.length === 0) && (
              <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white font-mono text-sm">{gstSummary?.gstin || '27M4BCY934D12S'}</h3>
                  <div className="text-slate-500 dark:text-zinc-400 text-[11px] mt-0.5">
                    {t('common.state')}: <strong>Maharashtra (27)</strong> · {t('common.status')}: <strong className="text-emerald-700">{t('common.active')}</strong>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md self-start sm:self-center">
                  ● {t('common.verified')}
                </span>
              </div>
            )}
            {(gstSummary?.gstinList || []).map((reg, idx) => (
              <div key={idx} className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white font-mono text-sm">{reg.gstin}</h3>
                  <div className="text-slate-500 dark:text-zinc-400 text-[11px] mt-0.5">
                    Billed Invoices: <strong className="text-slate-700 dark:text-zinc-300">{reg.invoicesCount}</strong> · Taxable Value:{' '}
                    <strong className="text-slate-700 dark:text-zinc-300">₹{Number(reg.taxableAmount || 0).toLocaleString('en-IN')}</strong> · Total Tax:{' '}
                    <strong className="text-blue-700">₹{Number(reg.totalTax || 0).toLocaleString('en-IN')}</strong>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md self-start sm:self-center">
                  ● {reg.status || 'Active'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: GST AMOUNTS & BREAKUP */}
      {activeTab === 'amounts' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">{t('finance.net_cash_payable', 'Net Cash Payable')}</span>
              <div className="text-xl font-black text-blue-700 font-mono">
                {gstSummary?.totalGst ? (String(gstSummary.totalGst).startsWith('₹') ? gstSummary.totalGst : `₹${Number(gstSummary.totalGst).toLocaleString('en-IN')}`) : '₹0'}
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
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">{t('finance.gst.tax_head')}</th>
                    <th className="py-3 px-4">{t('finance.gst.rate')}</th>
                    <th className="py-3 px-4">{t('finance.gst.taxable_value')}</th>
                    <th className="py-3 px-4">{t('finance.gst.output_tax')}</th>
                    <th className="py-3 px-4">{t('finance.gst.itc_available')}</th>
                    <th className="py-3 px-4 text-right">{t('finance.net_cash_payable', 'Net Cash Payable')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700 dark:text-zinc-300">
                  {breakup.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400 font-medium">{t('finance.gst.no_records')}</td>
                    </tr>
                  )}
                  {breakup.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{row.taxHead ?? '—'}</td>
                      <td className="py-3.5 px-4">{row.rate ?? '—'}</td>
                      <td className="py-3.5 px-4 font-mono">
                        ₹{Number(String(row.taxable || 0).replace(/[^0-9.]/g, '')).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        ₹{Number(String(row.amount || row.outputTax || 0).replace(/[^0-9.]/g, '')).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-emerald-700">
                        ₹{Number(String(row.itc || 0).replace(/[^0-9.]/g, '')).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-black text-blue-700 text-right">
                        ₹{Number(String(row.amount || row.netPayable || 0).replace(/[^0-9.]/g, '')).toLocaleString('en-IN')}
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
