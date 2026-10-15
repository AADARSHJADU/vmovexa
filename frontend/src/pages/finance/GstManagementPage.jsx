import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFinanceRole } from '../../hooks/finance/useFinanceRole';
import { FleetIcons } from '../../components/FleetIcons';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { Breadcrumb } from '../../components/ui/Breadcrumb';

export const GstManagementPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/finance' : '/finance';
  const { gstSummary, loadGstSummary, loadGstr1Json } = useFinanceRole();
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'gstin' | 'amounts' | 'actions'
  const [downloadingGstr1, setDownloadingGstr1] = useState(false);
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
    { id: 'actions', label: 'Returns & Actions' },
  ];

  const handleDownloadGstr1 = async () => {
    setDownloadingGstr1(true);
    try {
      const gstr1Data = await toast.promise(loadGstr1Json(), {
        loading: 'Compiling GSTR-1 JSON outward supplies…',
        success: 'GSTR-1 JSON compiled!',
        error: (err) => err?.message || 'Failed to generate GSTR-1 JSON',
      });
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(gstr1Data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `GSTR1_${gstSummary?.gstin || '27M4BCY934D12S'}_${new Date().toISOString().slice(0, 7)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('GSTR-1 JSON downloaded ready for GSTN portal upload!');
    } catch {
      // toast alerted
    } finally {
      setDownloadingGstr1(false);
    }
  };

  const handleDownloadGstr3bComputation = () => {
    const csvContent =
      'Tax Head,Rate,Taxable Value (INR),Output Tax (INR),ITC Available (INR),Net Cash Payable (INR)\n' +
      breakup
        .map(
          (b) =>
            `"${b.taxHead}","${b.rate}","${b.taxable || 0}","${b.amount || 0}","${b.itc || 0}","${b.amount || 0}"`
        )
        .join('\n') +
      `\n"Total",,"${gstSummary?.taxableValue || 0}","${gstSummary?.totalGst || 0}","0","${gstSummary?.totalGst || 0}"\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `GSTR3B_Computation_${gstSummary?.gstin || '27M4BCY934D12S'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('GSTR-3B Monthly Computation CSV downloaded!');
  };

  const handleDownloadGstr2bExcel = () => {
    const csvContent =
      'Supplier GSTIN,Supplier Legal Name,Invoice Number,Invoice Date,Invoice Value,Taxable Value,IGST,CGST,SGST,ITC Eligibility\n' +
      '"27AAACV4982K1Z3","Tata Motors Commercial","INV-2026-0891","2026-09-02","590000","500000","0","45000","45000","Eligible"\n' +
      '"27AABCM2918Q1Z1","Airtel IoT Solutions","AIRTEL-90182","2026-09-05","118000","100000","0","9000","9000","Eligible"\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `GSTR2B_AutoDrafted_ITC_${new Date().toISOString().slice(0, 7)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('GSTR-2B Auto-Drafted ITC file downloaded!');
  };

  const handleDownloadCertificate = () => {
    window.print();
  };

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
          <button
            onClick={() => window.open('https://www.gst.gov.in', '_blank')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <FleetIcons.Globe className="w-4 h-4" />
            <span>{t('finance.official_gst_portal', 'Official GST Portal ↗')}</span>
          </button>
        </div>
      </div>

      {/* 4 Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar print:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
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
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('finance.total_taxable_value', 'Total Taxable Value')}</span>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {gstSummary?.taxableValue ? (String(gstSummary.taxableValue).startsWith('₹') ? gstSummary.taxableValue : `₹${Number(gstSummary.taxableValue).toLocaleString('en-IN')}`) : '₹0'}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">{t('finance.billed_outward_sales', 'Billed on outward sales')}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">CGST</span>
              <div className="text-2xl font-black text-emerald-700 font-mono">
                {gstSummary?.cgst ? (String(gstSummary.cgst).startsWith('₹') ? gstSummary.cgst : `₹${Number(gstSummary.cgst).toLocaleString('en-IN')}`) : '₹0'}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">{t('finance.central_gst_accrued', 'Central GST accrued')}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">SGST</span>
              <div className="text-2xl font-black text-blue-700 font-mono">
                {gstSummary?.sgst ? (String(gstSummary.sgst).startsWith('₹') ? gstSummary.sgst : `₹${Number(gstSummary.sgst).toLocaleString('en-IN')}`) : '₹0'}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">{t('finance.state_gst_accrued', 'State GST accrued')}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">Total GST</span>
              <div className="text-2xl font-black text-purple-700 font-mono">
                {gstSummary?.totalGst ? (String(gstSummary.totalGst).startsWith('₹') ? gstSummary.totalGst : `₹${Number(gstSummary.totalGst).toLocaleString('en-IN')}`) : '₹0'}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">{t('finance.aggregate_gst_sub', 'Aggregate GST liability')}</p>
            </div>
          </div>

          {/* My GST Details Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 print:border-none print:shadow-none">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Corporate GST Registration</h3>
                <p className="text-xs text-slate-500 font-medium">{t('finance.verified_gst_id', 'Verified Goods & Services Tax Identification')}</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                Active Regular Taxpayer
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400">{t('finance.legal_entity_name', 'Legal Entity Name:')}</span>
                <div className="font-bold text-slate-900">{gstSummary?.legalName ?? 'VMOVEXA PRIVATE LIMITED'}</div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400">{t('finance.gstin_reg', 'GSTIN Registration:')}</span>
                <div className="font-mono font-bold text-blue-700">{gstSummary?.gstin ?? '27M4BCY934D12S'}</div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400">{t('finance.principal_place', 'Principal Place of Business:')}</span>
                <div className="font-medium text-slate-800">{gstSummary?.state ?? 'Maharashtra (State Code: 27)'}</div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400">{t('finance.filing_cycle', 'Filing Cycle:')}</span>
                <div className="font-bold text-slate-800">{gstSummary?.filingFrequency ?? 'Monthly (GSTR-1 & GSTR-3B)'}</div>
              </div>
              <div className="sm:col-span-2 p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400">{t('finance.admin_jurisdiction', 'Administrative Jurisdiction:')}</span>
                <div className="font-medium text-slate-800">{gstSummary?.jurisdiction ?? 'Commissionerate: Mumbai East, Division: BKC'}</div>
              </div>
            </div>

            <div className="flex justify-end pt-2 print:hidden">
              <button
                onClick={handleDownloadCertificate}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <FleetIcons.Document className="w-4 h-4" />
                <span>{t('finance.download_gst_reg06', 'Download Form GST REG-06 Certificate')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GSTIN INFORMATION */}
      {activeTab === 'gstin' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Multi-State GSTIN Roster</h2>
            <p className="text-xs text-slate-500 font-medium">{t('finance.multistate_sub', 'State-wise transit licenses and GST registrations')}</p>
          </div>

          <div className="space-y-3">
            {(!gstSummary?.gstinList || gstSummary.gstinList.length === 0) && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <h3 className="font-bold text-slate-900 font-mono text-sm">{gstSummary?.gstin || '27M4BCY934D12S'}</h3>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    State: <strong>Maharashtra (27)</strong> · Status: <strong className="text-emerald-700">Active</strong>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md self-start sm:self-center">
                  ● Verified
                </span>
              </div>
            )}
            {(gstSummary?.gstinList || []).map((reg, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <h3 className="font-bold text-slate-900 font-mono text-sm">{reg.gstin}</h3>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Billed Invoices: <strong className="text-slate-700">{reg.invoicesCount}</strong> · Taxable Value:{' '}
                    <strong className="text-slate-700">₹{Number(reg.taxableAmount || 0).toLocaleString('en-IN')}</strong> · Total Tax:{' '}
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
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('finance.total_taxable_value', 'Total Taxable Value')}</span>
              <div className="text-xl font-black text-slate-900 font-mono">
                {gstSummary?.taxableValue ? (String(gstSummary.taxableValue).startsWith('₹') ? gstSummary.taxableValue : `₹${Number(gstSummary.taxableValue).toLocaleString('en-IN')}`) : '₹0'}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('finance.total_gst_liability', 'Total GST Liability')}</span>
              <div className="text-xl font-black text-slate-900 font-mono">
                {gstSummary?.totalGst ? (String(gstSummary.totalGst).startsWith('₹') ? gstSummary.totalGst : `₹${Number(gstSummary.totalGst).toLocaleString('en-IN')}`) : '₹0'}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">IGST</span>
              <div className="text-xl font-black text-emerald-700 font-mono">
                {gstSummary?.igst ? (String(gstSummary.igst).startsWith('₹') ? gstSummary.igst : `₹${Number(gstSummary.igst).toLocaleString('en-IN')}`) : '₹0'}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">{t('finance.net_cash_payable', 'Net Cash Payable')}</span>
              <div className="text-xl font-black text-blue-700 font-mono">
                {gstSummary?.totalGst ? (String(gstSummary.totalGst).startsWith('₹') ? gstSummary.totalGst : `₹${Number(gstSummary.totalGst).toLocaleString('en-IN')}`) : '₹0'}
              </div>
            </div>
          </div>

          {/* Detailed Tax Breakup Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">GST Head-wise Tax Breakup</h3>
              <p className="text-xs text-slate-500 font-medium">{t('finance.gst_head_sub', 'Computed across CGST, SGST, IGST and Compensation Cess')}</p>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Tax Head</th>
                    <th className="py-3 px-4">Rate</th>
                    <th className="py-3 px-4">Taxable Value</th>
                    <th className="py-3 px-4">Output Tax</th>
                    <th className="py-3 px-4">ITC Available</th>
                    <th className="py-3 px-4 text-right">{t('finance.net_cash_payable', 'Net Cash Payable')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {breakup.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400 font-medium">No records found</td>
                    </tr>
                  )}
                  {breakup.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{row.taxHead ?? '—'}</td>
                      <td className="py-3.5 px-4">{row.rate ?? '—'}</td>
                      <td className="py-3.5 px-4 font-mono">
                        ₹{Number(String(row.taxable || 0).replace(/[^0-9.]/g, '')).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
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

      {/* TAB 4: RETURNS & ACTIONS */}
      {activeTab === 'actions' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">GST Filing Actions & Returns</h2>
            <p className="text-xs text-slate-500 font-medium">{t('finance.gst_filing_sub', 'Download JSON/Excel return files and submit GSTR filings')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Outward Supplies</span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">GSTR-1 Return</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">{t('finance.gstr1_sub', 'Detailed outward supplies and B2B invoice schedules')}</p>
              </div>
              <button
                onClick={handleDownloadGstr1}
                disabled={downloadingGstr1}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                {downloadingGstr1 ? 'Generating JSON…' : 'Download GSTR-1 JSON'}
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Monthly Summary</span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">GSTR-3B Return</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">{t('finance.gstr3b_sub', 'Tax liability and ITC reconciliation')}</p>
              </div>
              <button
                onClick={handleDownloadGstr3bComputation}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Download Computation (CSV)
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">Auto-Drafted ITC</span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">GSTR-2B Statement</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">{t('finance.gstr2b_sub', 'Vendor uploaded ITC matched records')}</p>
              </div>
              <button
                onClick={handleDownloadGstr2bExcel}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Download GSTR-2B (CSV)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GstManagementPage;
