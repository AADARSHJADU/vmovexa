import React from 'react';
import { resolveFileUrl } from '../../api/services/upload.service';

export const DEFAULT_INVOICE_DESIGN = {
  template: 'standard',
  primaryColor: '#0f172a',
  accentColor: '#2563eb',
  invoiceTitle: 'TAX INVOICE',
  invoiceCopy: 'ORIGINAL FOR RECIPIENT',
  invoicePrefix: 'INV-',
  footerNote: 'This is a computer-generated tax invoice under GST rules and requires no physical signature.',
};

/**
 * Converts numbers to Indian Currency in words (Legal Indian Statutory Requirement)
 */
export function amountInWords(num) {
  const n = Math.round(Number(num) || 0);
  if (n === 0) return 'Zero Rupees Only';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  function inWords(val) {
    if (val < 20) return a[val];
    if (val < 100) return b[Math.floor(val / 10)] + (val % 10 !== 0 ? ' ' + a[val % 10] : '');
    if (val < 1000) return a[Math.floor(val / 100)] + ' Hundred' + (val % 100 !== 0 ? ' and ' + inWords(val % 100) : '');
    if (val < 100000) return inWords(Math.floor(val / 1000)) + ' Thousand' + (val % 1000 !== 0 ? ' ' + inWords(val % 1000) : '');
    if (val < 10000000) return inWords(Math.floor(val / 100000)) + ' Lakh' + (val % 100000 !== 0 ? ' ' + inWords(val % 100000) : '');
    return inWords(Math.floor(val / 10000000)) + ' Crore' + (val % 10000000 !== 0 ? ' ' + inWords(val % 10000000) : '');
  }
  return inWords(n).trim() + ' Rupees Only';
}

export const numberToWordsIndian = amountInWords;

const GST_STATE_CODE_MAP = {
  '01': { code: 'JK', name: 'Jammu and Kashmir' },
  '02': { code: 'HP', name: 'Himachal Pradesh' },
  '03': { code: 'PB', name: 'Punjab' },
  '04': { code: 'CH', name: 'Chandigarh' },
  '05': { code: 'UT', name: 'Uttarakhand' },
  '06': { code: 'HR', name: 'Haryana' },
  '07': { code: 'DL', name: 'Delhi' },
  '08': { code: 'RJ', name: 'Rajasthan' },
  '09': { code: 'UP', name: 'Uttar Pradesh' },
  '10': { code: 'BR', name: 'Bihar' },
  '11': { code: 'SK', name: 'Sikkim' },
  '12': { code: 'AR', name: 'Arunachal Pradesh' },
  '13': { code: 'NL', name: 'Nagaland' },
  '14': { code: 'MN', name: 'Manipur' },
  '15': { code: 'MZ', name: 'Mizoram' },
  '16': { code: 'TR', name: 'Tripura' },
  '17': { code: 'ML', name: 'Meghalaya' },
  '18': { code: 'AS', name: 'Assam' },
  '19': { code: 'WB', name: 'West Bengal' },
  '20': { code: 'JH', name: 'Jharkhand' },
  '21': { code: 'OR', name: 'Odisha' },
  '22': { code: 'CT', name: 'Chhattisgarh' },
  '23': { code: 'MP', name: 'Madhya Pradesh' },
  '24': { code: 'GJ', name: 'Gujarat' },
  '26': { code: 'DD', name: 'Dadra and Nagar Haveli and Daman and Diu' },
  '27': { code: 'MH', name: 'Maharashtra' },
  '29': { code: 'KA', name: 'Karnataka' },
  '30': { code: 'GA', name: 'Goa' },
  '31': { code: 'LD', name: 'Lakshadweep' },
  '32': { code: 'KL', name: 'Kerala' },
  '33': { code: 'TN', name: 'Tamil Nadu' },
  '34': { code: 'PY', name: 'Puducherry' },
  '35': { code: 'AN', name: 'Andaman and Nicobar Islands' },
  '36': { code: 'TS', name: 'Telangana' },
  '37': { code: 'AP', name: 'Andhra Pradesh' },
  '38': { code: 'LA', name: 'Ladakh' },
};

/**
 * High-fidelity, certified GST Tax Invoice Component.
 * Identical 1:1 match with the backend-rendered HTML invoice (/api/v1/billing/invoices/:id/html).
 */
export const InvoiceSheet = ({ invoice, settings, design: propDesign }) => {
  const financeSettings = settings || {};
  let design = { ...DEFAULT_INVOICE_DESIGN };
  if (financeSettings.invoice_design) {
    try {
      const parsed = typeof financeSettings.invoice_design === 'string'
        ? JSON.parse(financeSettings.invoice_design)
        : (financeSettings.invoice_design || {});
      design = { ...design, ...parsed };
    } catch (_) {}
  }
  if (propDesign) {
    design = { ...design, ...propDesign };
  }

  const inv = invoice || {};
  const org = inv.organization || {};

  // Supplier details
  const supplierGstin = (financeSettings.gstin || '27M4BCY934D12S').trim();
  const supplierStateCode = supplierGstin.slice(0, 2);
  let supplierStateName = GST_STATE_CODE_MAP[supplierStateCode]?.name;
  if (!supplierStateName && financeSettings.address) {
    const addr = financeSettings.address.toUpperCase();
    for (const [, info] of Object.entries(GST_STATE_CODE_MAP)) {
      if (addr.includes(info.name.toUpperCase())) {
        supplierStateName = info.name;
        break;
      }
    }
  }
  const supplierStateDisplay = supplierStateName
    ? `${supplierStateName} (Code: ${supplierStateCode || 'N/A'})`
    : (financeSettings.address ? 'Registered Entity' : 'Maharashtra (Code: 27)');

  // Buyer & state details
  const buyerState = inv.place_of_supply || org.state || 'N/A';
  const isIntra = !inv.place_of_supply || inv.place_of_supply.includes(supplierStateCode) || (supplierStateName && inv.place_of_supply.toLowerCase().includes(supplierStateName.toLowerCase()));

  const issueDate = inv.issued_at
    ? new Date(inv.issued_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : (inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A');

  const paidDate = inv.paid_at
    ? new Date(inv.paid_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : (String(inv.status).toLowerCase() === 'paid' ? issueDate : 'N/A');

  // Keep invoice branding identical to the collapsed sidebar mark.
  const logoUrl = financeSettings.logo_url ? resolveFileUrl(financeSettings.logo_url) : '/logo/logo.png';
  const signatureUrl = financeSettings.signatory_signature_url
    ? resolveFileUrl(financeSettings.signatory_signature_url)
    : (design.signatureUrl ? resolveFileUrl(design.signatureUrl) : null);
  const sealUrl = financeSettings.signatory_seal_url
    ? resolveFileUrl(financeSettings.signatory_seal_url)
    : (design.sealUrl ? resolveFileUrl(design.sealUrl) : null);

  // Bank & Remittance
  const bankName = financeSettings.bank_name || 'HDFC Bank Ltd';
  const accountName = financeSettings.account_name || financeSettings.company_name || 'VMOVEXA PRIVATE LIMITED';
  const accountNumber = financeSettings.account_number || '50200088219012';
  const ifscCode = financeSettings.ifsc_code || 'HDFC0000123';
  const branch = financeSettings.branch || 'BKC Corporate Branch, Mumbai';
  const upiId = design.upiId || design.upi_id || financeSettings.upi_id || 'vmovexa@hdfcbank';

  // Signatory
  const signatoryName = financeSettings.signatory_name || 'Rahul nayak';
  const signatoryDesignation = financeSettings.signatory_designation || 'Finance Officer';
  const signatoryEmpId = financeSettings.signatory_emp_id ? `Emp ID: ${financeSettings.signatory_emp_id}` : (financeSettings.signatoryEmpId ? `Emp ID: ${financeSettings.signatoryEmpId}` : 'Emp ID: FIN-101');

  // Terms & Conditions
  const rawTerms = financeSettings.terms_and_conditions || '';
  const termLines = rawTerms
    ? rawTerms.split('\n').map((l) => l.trim()).filter(Boolean)
    : [
        '1. Payment is due within 15 days of invoice issue date.',
        '2. Overdue payments incur interest at 18% p.a.',
        '3. Subject to Mumbai Jurisdiction only.',
        '4. Computer generated invoice under GST rules, signature not required.',
      ];

  const footerNote = design.footerNote || design.footer_note || financeSettings.footer_note || 'This is a computer-generated tax invoice under GST rules and requires no physical signature.';

  // Tax calculations
  const isTaxExempt = inv.gst_type === null || inv.gst_type === 'exempt' || (inv.tax_amount !== null && inv.tax_amount !== undefined && Number(inv.tax_amount) === 0);
  const subtotalNum = Number(inv.subtotal) || 0;
  const taxAmountNum = isTaxExempt ? 0 : (inv.tax_amount !== null && inv.tax_amount !== undefined ? Number(inv.tax_amount) : +(subtotalNum * 0.18).toFixed(2));
  const totalNum = Number(inv.total) || +(subtotalNum + taxAmountNum).toFixed(2);
  const halfTax = +(taxAmountNum / 2).toFixed(2);
  const cgstVal = isTaxExempt ? 0 : (isIntra ? halfTax : 0);
  const sgstVal = isTaxExempt ? 0 : (isIntra ? +(taxAmountNum - halfTax).toFixed(2) : 0);
  const igstVal = isTaxExempt ? 0 : (!isIntra ? taxAmountNum : 0);

  const rawItems = Array.isArray(inv.items) && inv.items.length > 0
    ? inv.items
    : (Array.isArray(inv.InvoiceItems) && inv.InvoiceItems.length > 0 ? inv.InvoiceItems : null);

  const lineItems = rawItems || [{
    description: inv.po_reference ? `VMOVEXA SaaS Subscription — ${inv.po_reference}` : 'VMOVEXA SaaS Telematics & Edge Fleet Subscription',
    qty: 1,
    rate: inv.subtotal || inv.total || 0,
    amount: inv.subtotal || inv.total || 0,
    hsn: inv.type === 'ad_spend' ? '998363' : '997331',
  }];

  const statusStr = String(inv.status || 'PAID').toUpperCase();
  const isPaid = statusStr === 'PAID';
  const isOverdue = statusStr === 'OVERDUE';

  return (
    <div className="w-full py-4 print:py-0 print:text-[10px] select-text font-sans">
      <div
        id="invoice-card"
        className="max-w-[840px] mx-auto bg-white border border-slate-200 rounded-2xl p-7 sm:p-11 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)] print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none print:rounded-none text-slate-800"
      >
        {/* ========================================================================= */}
        {/* HEADER: LOGO, TRADE NAME, TITLE, CODE, BADGE */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-slate-900 dark:border-zinc-700 pb-5">
          <div>
            {logoUrl && (
              <img
                src={logoUrl}
                alt="Logo"
                className="max-h-11 max-w-[180px] object-contain mb-1.5"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 m-0 font-sans">
              VMOVEXA PRIVATE LIMITED
            </h1>
          </div>

          <div className="text-left sm:text-right w-full sm:w-auto">
            <span
              className={`inline-block px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider uppercase border ${
                isPaid
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  : isOverdue
                  ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                  : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
              }`}
            >
              {statusStr}
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-1.5 tracking-tight">
              {design.invoiceTitle || 'TAX INVOICE'}
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mt-0.5">
              {design.invoiceCopy || 'ORIGINAL FOR RECIPIENT'}
            </p>
            <p className="font-mono text-[13px] text-blue-600 dark:text-blue-400 font-bold mt-1">
              #{inv.code || 'INV-000000'}
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2-COLUMN GRID: BILLED BY (SUPPLIER) vs BILLED TO (RECIPIENT) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-1">
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
              Billed By (Supplier)
            </h4>
            <p className="text-xs text-slate-700 dark:text-zinc-300">
              <strong className="text-slate-900 dark:text-white font-bold">{financeSettings.company_name || 'VMOVEXA PRIVATE LIMITED'}</strong>
              {financeSettings.trade_name && (
                <span className="text-slate-500 dark:text-zinc-400 font-normal"> ({financeSettings.trade_name})</span>
              )}
            </p>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              {financeSettings.address || '101, Business Hub, Bandra Kurla Complex, Mumbai, Maharashtra - 400051'}
            </p>
            <p className="text-xs text-slate-700 dark:text-zinc-300">
              GSTIN: <strong className="text-slate-900 dark:text-white font-bold">{financeSettings.gstin || '27M4BCY934D12S'}</strong> &bull; PAN: <strong className="text-slate-900 dark:text-white font-bold">{financeSettings.pan || 'AACCV1234F'}</strong>
            </p>
            <p className="text-xs text-slate-700 dark:text-zinc-300">
              State: <strong className="text-slate-900 dark:text-white font-bold">{supplierStateDisplay}</strong>
            </p>
            <p className="text-xs text-slate-700 dark:text-zinc-300">
              Email: {financeSettings.billing_email || 'billing@vmovexa.com'} &bull; Tel: {financeSettings.billing_phone || '+91 98765 88990'}
            </p>
            {financeSettings.website && (
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Web: <a href={financeSettings.website} target="_blank" rel="noreferrer" className="hover:underline">{financeSettings.website}</a>
              </p>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-1">
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
              Billed To (Recipient / Customer)
            </h4>
            <p className="text-xs text-slate-700 dark:text-zinc-300">
              <strong className="text-slate-900 dark:text-white font-bold">{org.name || inv.customer_name || 'Customer / Fleet Operator'}</strong>
            </p>
            {(org.office_address || inv.billing_address) && (
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                {org.office_address || inv.billing_address}
              </p>
            )}
            <p className="text-xs text-slate-700 dark:text-zinc-300">
              State / UT: <strong className="text-slate-900 dark:text-white font-bold">{buyerState}</strong>{org.pincode ? ` - ${org.pincode}` : ''}
            </p>
            <p className="text-xs text-slate-700 dark:text-zinc-300">
              GSTIN: <strong className="text-slate-900 dark:text-white font-bold">{inv.gstin || org.gstin || 'Unregistered (Consumer / B2C)'}</strong>
            </p>
            {org.cin && (
              <p className="text-xs text-slate-600 dark:text-zinc-400">
                CIN / Reg: {org.cin}
              </p>
            )}
            <p className="text-xs text-slate-700 dark:text-zinc-300 pt-1">
              Issue Date: <strong className="text-slate-900 dark:text-white font-bold">{issueDate}</strong> &bull; Paid: <strong className="text-slate-900 dark:text-white font-bold">{paidDate}</strong>
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LINE ITEMS TABLE */}
        {/* ========================================================================= */}
        <div className="overflow-x-auto my-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] font-extrabold border-t border-slate-300 border-b-2 border-slate-400">
                <th className="py-2.5 px-3 w-10">#</th>
                <th className="py-2.5 px-3">Description of Services</th>
                <th className="py-2.5 px-3 w-24">SAC Code</th>
                <th className="py-2.5 px-3 w-16 text-center">Qty</th>
                <th className="py-2.5 px-3 w-32 text-right">Taxable Rate (₹)</th>
                <th className="py-2.5 px-3 w-32 text-right">Taxable Value (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {lineItems.map((it, idx) => {
                const itemRate = Number(it.rate || it.amount || inv.subtotal || 0);
                const itemAmount = Number(it.amount || it.rate || inv.subtotal || 0);
                const sacCode = it.hsn || (inv.type === 'ad_spend' ? '998363' : '997331');
                return (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                    <td className="py-3 px-3 text-slate-500 dark:text-zinc-400">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <strong className="text-slate-900 dark:text-white font-bold">
                        {it.description || (inv.type === 'ad_spend' ? 'Transit Digital DOOH Ad Broadcast Services' : 'VMOVEXA SaaS Subscription Plan')}
                      </strong>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-zinc-400">{sacCode}</td>
                    <td className="py-3 px-3 text-center text-slate-700 dark:text-zinc-300">{it.qty || 1}</td>
                    <td className="py-3 px-3 text-right font-mono font-medium text-slate-800 dark:text-zinc-200">
                      ₹{itemRate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      ₹{itemAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ========================================================================= */}
        {/* TOTALS & AMOUNT IN WORDS SECTION */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-slate-200 dark:border-zinc-800">
          <div className="w-full sm:flex-1 bg-white p-3.5 sm:p-4 rounded-xl border border-dashed border-slate-300 text-xs">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400 m-0">
              Invoice Amount in Words
            </p>
            <p className="font-bold text-slate-900 dark:text-white text-[13px] mt-1 mb-0">
              {amountInWords(totalNum)}
            </p>
            <p className="text-[10.5px] text-slate-500 dark:text-zinc-400 mt-2 mb-0">
              Tax Classification: <strong className="text-slate-700 dark:text-zinc-300 font-semibold">{isTaxExempt ? 'Plan Price Breakdown (Inclusive / Flat)' : (isIntra ? 'Intra-State Supply (CGST 9% + SGST 9%)' : 'Inter-State Supply (IGST 18%)')}</strong>
            </p>
          </div>

          <table className="w-full sm:w-[330px] text-xs border-collapse shrink-0">
            <tbody>
              <tr>
                <td className="py-1.5 px-2 font-semibold text-slate-500 dark:text-zinc-400">
                  {isTaxExempt ? 'Subtotal' : 'Taxable Subtotal'}
                </td>
                <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-800 dark:text-zinc-200">
                  ₹{subtotalNum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
              {!isTaxExempt && isIntra && (
                <>
                  <tr>
                    <td className="py-1.5 px-2 font-semibold text-slate-500 dark:text-zinc-400">CGST (9%)</td>
                    <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-800 dark:text-zinc-200">
                      ₹{cgstVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 font-semibold text-slate-500 dark:text-zinc-400">SGST (9%)</td>
                    <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-800 dark:text-zinc-200">
                      ₹{sgstVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </>
              )}
              {!isTaxExempt && !isIntra && (
                <tr>
                  <td className="py-1.5 px-2 font-semibold text-slate-500 dark:text-zinc-400">IGST (18%)</td>
                  <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-800 dark:text-zinc-200">
                    ₹{igstVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              )}
              <tr className="border-t-2 border-slate-900 dark:border-white">
                <td className="pt-2.5 pb-1 px-2 text-sm font-black text-slate-900 dark:text-white">
                  Total Amount (INR)
                </td>
                <td className="pt-2.5 pb-1 px-2 text-right text-base font-black font-mono text-slate-900 dark:text-white">
                  ₹{totalNum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ========================================================================= */}
        {/* BANK SETTLEMENT & AUTHORIZED SIGNATORY GRID */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_0.8fr] gap-6 mt-7 pt-5 border-t border-slate-200 dark:border-zinc-800">
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-1">
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
              Bank Settlement & Remittance
            </h4>
            <p className="text-[11.5px] text-slate-700 dark:text-zinc-300">Bank Name: <strong className="text-slate-900 dark:text-white font-bold">{bankName}</strong></p>
            <p className="text-[11.5px] text-slate-700 dark:text-zinc-300">Account Name: <strong className="text-slate-900 dark:text-white font-bold">{accountName}</strong></p>
            <p className="text-[11.5px] text-slate-700 dark:text-zinc-300">Account Number: <strong className="font-mono text-slate-900 dark:text-white font-bold">{accountNumber}</strong></p>
            <p className="text-[11.5px] text-slate-700 dark:text-zinc-300">IFSC Code: <strong className="font-mono text-slate-900 dark:text-white font-bold">{ifscCode}</strong></p>
            <p className="text-[11.5px] text-slate-700 dark:text-zinc-300">Branch: {branch}</p>
            <p className="text-[11.5px] text-slate-700 dark:text-zinc-300">UPI VPA: <strong className="text-slate-900 dark:text-white font-bold">{upiId}</strong></p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
              Authorized Signatory
            </h4>

            <div className="my-2 flex items-center gap-3">
              {sealUrl && (
                <img
                  src={sealUrl}
                  alt="Seal"
                  className="max-h-16 max-w-[80px] object-contain -rotate-[8deg]"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              {signatureUrl && (
                <img
                  src={signatureUrl}
                  alt="Signature"
                  className="max-h-10 max-w-[130px] object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white m-0">{signatoryName}</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 mb-0">
                {signatoryDesignation} {signatoryEmpId}
              </p>
              <p className="text-[10.5px] font-semibold text-slate-800 dark:text-zinc-200 mt-0.5 mb-0">
                For {financeSettings.company_name || 'VMOVEXA PRIVATE LIMITED'}
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TERMS & CONDITIONS */}
        {/* ========================================================================= */}
        <div className="mt-6 p-4 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-500 leading-relaxed">
          <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
            Terms & Conditions
          </h4>
          <ul className="list-disc pl-4 space-y-0.5 m-0">
            {termLines.map((t, idx) => (
              <li key={idx}>{t}</li>
            ))}
          </ul>
        </div>

        {/* ========================================================================= */}
        {/* FOOTER STATUTORY DISCLAIMER */}
        {/* ========================================================================= */}
        <div className="mt-7 pt-4 border-t border-slate-200 dark:border-zinc-800 text-[11px] text-slate-400 dark:text-zinc-500 text-center leading-relaxed">
          <p className="m-0">{footerNote}</p>
          <p className="mt-1 mb-0">
            SAC Code: {inv.type === 'ad_spend' ? '998363' : '997331'} &mdash; {inv.type === 'ad_spend' ? 'Sale of advertising space in commercial passenger transit displays.' : 'Licensing services for the right to use computer software & IoT telematics systems.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSheet;
