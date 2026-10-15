import React from 'react';
import { resolveFileUrl } from '../../api/services/upload.service';
import { FleetIcons } from '../FleetIcons';

export const DEFAULT_INVOICE_DESIGN = {
  template: 'modern', // 'modern' | 'classic' | 'corporate' | 'executive' | 'govt_gem' | 'minimal' | 'bold' | 'compact'
  primaryColor: '#0f172a',
  accentColor: '#2563eb',
  paperType: 'white', // 'white' | 'ivory' | 'natural'
  logoPosition: 'left', // 'left' | 'center' | 'right'
  logoSize: 'medium', // 'small' | 'medium' | 'large'
  showHsn: true,
  showTaxBreakup: true,
  showAmountInWords: true,
  showBankDetails: true,
  showQrCode: true,
  showBarcode: true,
  showIrn: true,
  showSignatory: true,
  showSignatureImage: true,
  showStamp: true,
  showWatermark: true,
  watermarkText: 'PAID', // 'PAID' | 'ORIGINAL' | 'TAX INVOICE' | 'NONE'
  showTerms: true,
  showRemittanceStub: true,
  invoiceTitle: 'TAX INVOICE',
  invoiceCopy: 'ORIGINAL FOR RECIPIENT', // 'ORIGINAL FOR RECIPIENT' | 'DUPLICATE FOR TRANSPORTER' | 'TRIPLICATE FOR SUPPLIER'
  invoicePrefix: 'VMX-INV-',
  footerNote: 'This is a computer-generated tax invoice under GST rules and requires no physical signature.',
};

/**
 * Converts numbers to Indian Currency in words (Legal Indian Statutory Requirement)
 */
export function numberToWordsIndian(num) {
  if (!num || isNaN(num)) return 'INR Zero Only';
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertNumber(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convertNumber(n % 100) : '');
    return '';
  }

  const integerPart = Math.floor(Math.abs(num));
  if (integerPart === 0) return 'INR Zero Only';

  const crore = Math.floor(integerPart / 10000000);
  const lakh = Math.floor((integerPart % 10000000) / 100000);
  const thousand = Math.floor((integerPart % 100000) / 1000);
  const hundred = integerPart % 1000;

  let str = '';
  if (crore > 0) str += convertNumber(crore) + ' Crore ';
  if (lakh > 0) str += convertNumber(lakh) + ' Lakh ';
  if (thousand > 0) str += convertNumber(thousand) + ' Thousand ';
  if (hundred > 0) str += convertNumber(hundred);

  return `INR ${str.trim()} Only`;
}

/**
 * Realistic Code-128 Barcode Generator Component (SVG)
 */
const Code128Barcode = ({ code, height = 32 }) => {
  const bars = [
    2, 1, 1, 2, 3, 1, 1, 3, 1, 2, 2, 1, 1, 1, 4, 1, 2, 1, 1, 3, 2, 2, 1, 1,
    1, 2, 2, 2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 1, 1, 2, 3, 2, 1, 1, 2, 1, 3, 1,
    2, 2, 1, 1, 3, 1, 1, 2, 2, 1, 3, 1, 2, 1, 1, 4, 1, 1, 2, 2, 3, 1, 1, 2
  ];

  let currentX = 0;
  return (
    <div className="inline-flex flex-col items-center">
      <svg
        width="150"
        height={height}
        viewBox="0 0 150 32"
        className="fill-current text-slate-900 overflow-visible"
      >
        {bars.map((barWidth, idx) => {
          const x = currentX;
          currentX += barWidth * 1.5;
          return idx % 2 === 0 ? (
            <rect key={idx} x={x} y="0" width={barWidth * 1.4} height={height} />
          ) : null;
        })}
      </svg>
      <span className="font-mono text-[9px] tracking-[0.25em] text-slate-700 font-bold mt-0.5 select-none">
        *{code}*
      </span>
    </div>
  );
};

/**
 * Digitized Executive Handwritten Ink Signature (SVG or Uploaded Image)
 */
const DigitizedSignature = ({ name = 'Rahul Sharma', signatureUrl }) => {
  if (signatureUrl) {
    const resolved = signatureUrl.startsWith('http') || signatureUrl.startsWith('data:')
      ? signatureUrl
      : resolveFileUrl(signatureUrl);
    return (
      <div className="h-11 flex items-center justify-center sm:justify-end select-none pointer-events-none">
        <img
          src={resolved}
          alt={`Signature of ${name}`}
          className="h-10 w-auto max-w-[140px] object-contain"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>
    );
  }

  return (
    <div className="relative inline-block select-none pointer-events-none text-center">
      <div className="text-blue-900 font-serif italic text-base leading-none tracking-tight select-none">
        {name}
      </div>
      <svg
        className="w-36 h-6 text-blue-900 fill-none stroke-current"
        viewBox="0 0 160 25"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10,12 C25,2 35,4 40,16 C45,20 50,6 58,10 C68,14 75,5 90,8 C105,11 115,3 125,12 C135,18 145,12 152,8 M15,18 Q80,24 148,16"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0.85 }}
        />
      </svg>
    </div>
  );
};

/**
 * Authentic Rubber Stamp / Official Accounts Seal (SVG or Uploaded Image)
 */
const AccountsRubberStamp = ({ company, tradeName, address, sealUrl }) => {
  if (sealUrl) {
    const resolved = sealUrl.startsWith('http') || sealUrl.startsWith('data:')
      ? sealUrl
      : resolveFileUrl(sealUrl);
    return (
      <div className="w-24 h-24 flex items-center justify-center rotate-[-9deg] select-none pointer-events-none">
        <img
          src={resolved}
          alt="Company Seal"
          className="max-w-full max-h-full object-contain filter drop-shadow-xs"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>
    );
  }

  const displayName = tradeName || company || 'VMOVEXA';
  const locationText = address ? address.split(',')[0].trim().toUpperCase() : 'MUMBAI';

  return (
    <div className="w-24 h-24 rounded-full border-2 border-dashed border-indigo-900/50 p-1 flex flex-col items-center justify-center text-center text-indigo-950 font-black tracking-tight select-none pointer-events-none rotate-[-9deg] shadow-2xs backdrop-blur-[0.5px]">
      <div className="w-full h-full rounded-full border border-indigo-900/40 p-1 flex flex-col items-center justify-center overflow-hidden">
        <span className="text-[6.5px] uppercase tracking-wider text-indigo-900 font-extrabold truncate max-w-[75px]">
          ★ {displayName} ★
        </span>
        <span className="text-[6px] tracking-widest text-indigo-800 font-black my-0.5">ACCOUNTS DEPT</span>
        <span className="text-[7.5px] font-mono font-black text-indigo-950 bg-indigo-50/60 px-1 rounded border border-indigo-200/60">
          VERIFIED & PASSED
        </span>
        <span className="text-[5.5px] font-mono text-indigo-800/80 mt-0.5">GST RECONCILED</span>
        <span className="text-[5px] text-indigo-700 truncate max-w-[75px]">{locationText}</span>
      </div>
    </div>
  );
};

export const InvoiceSheet = ({ invoice, settings, design: propDesign }) => {
  const design = {
    ...DEFAULT_INVOICE_DESIGN,
    ...(settings?.invoice_design || settings?.invoiceDesign || {}),
    ...(propDesign || {}),
  };

  // Corporate & Entity settings extracted dynamically from settings prop
  const companyName = settings?.company_name || settings?.companyName || 'VMOVEXA PRIVATE LIMITED';
  const tradeName = settings?.trade_name || settings?.tradeName || 'VMOVEXA';
  const companyGstin = settings?.gstin || '27M4BCY934D12S';
  const companyPan = settings?.pan || 'AACCV1234F';
  const companyEmail = settings?.billing_email || settings?.email || 'billing@vmovexa.com';
  const companyPhone = settings?.billing_phone || settings?.phone || '+91 98765 88990';
  const companyWebsite = settings?.website || 'https://vmovexa.com';
  const companyAddress = settings?.address || '101, Business Hub, Bandra Kurla Complex, Mumbai, Maharashtra - 400051';

  // Indian State Code & Name extracted from GSTIN (first 2 digits)
  const stateCode = companyGstin?.slice(0, 2) || '27';
  const stateMap = {
    '27': 'Maharashtra',
    '07': 'Delhi',
    '29': 'Karnataka',
    '33': 'Tamil Nadu',
    '24': 'Gujarat',
    '09': 'Uttar Pradesh',
    '19': 'West Bengal',
    '06': 'Haryana',
    '08': 'Rajasthan',
    '36': 'Telangana',
  };
  const stateName = stateMap[stateCode] || `State (${stateCode})`;

  // Bank & Settlement settings
  const bankName = settings?.bank_name || settings?.bankName || 'HDFC Bank Ltd';
  const accountName = settings?.account_name || settings?.accountName || companyName;
  const accountNumber = settings?.account_number || settings?.accountNumber || '50200088219012';
  const ifscCode = settings?.ifsc_code || settings?.ifscCode || 'HDFC0000123';
  const branch = settings?.branch || 'BKC Corporate Branch, Mumbai';
  const companyUpiId = settings?.upi_id || settings?.upiId || design?.upiId || design?.upi_id || 'vmovexa@hdfcbank';

  // Terms and legal notes
  const rawTerms = settings?.terms_and_conditions || settings?.termsAndConditions || design?.termsAndConditions;
  const termLines = rawTerms
    ? rawTerms.split('\n').filter((l) => l.trim().length > 0)
    : [
        '1. Payment is strictly due within 15 days of invoice date. Overdue accounts bear interest at 18% p.a.',
        '2. Transit advertising telematics logs & GPS broadcast verification are certified under SLA terms.',
        '3. All disputes subject to Mumbai Judicial Jurisdiction only.',
      ];
  const footerDisclaimer =
    design.footerNote ||
    settings?.footer_note ||
    settings?.footerNote ||
    settings?.invoice_footer_note ||
    'This is a computer-generated tax invoice under GST rules and requires no physical signature.';

  // Signatory & Seal settings
  const signatoryName = settings?.signatory_name || settings?.signatoryName || 'Rahul Sharma';
  const signatoryDesignation = settings?.signatory_designation || settings?.signatoryDesignation || 'Authorized Signatory (Finance)';
  const signatoryEmpId = settings?.signatory_emp_id || settings?.signatoryEmpId || '';
  const signatorySignatureUrl =
    settings?.signatory_signature_url ||
    settings?.signatorySignatureUrl ||
    design?.signatureUrl ||
    design?.signatory_signature_url ||
    null;
  const signatorySealUrl =
    settings?.signatory_seal_url ||
    settings?.signatorySealUrl ||
    design?.sealUrl ||
    design?.signatory_seal_url ||
    null;

  // Sample fallback data if rendered in designer without an invoice
  const inv = invoice || {
    id: 'sample',
    code: `${design.invoicePrefix || 'VMX-INV-'}2026-0042`,
    irn: '4f9810a9c2b4898114092bdf7812903e198fa490c210981bce9872910fae1204',
    ack_no: '112410887329',
    ack_date: '29/09/2026 14:22:10',
    customer_name: 'Sharma Mobility & Retail Pvt Ltd',
    billing_address: '402, Express Towers, Nariman Point, Mumbai, MH - 400021',
    customer_phone: '+91 98200 12345',
    customer_email: 'finance@sharmaretail.com',
    gstin: '27AABCS1429B1Z8',
    pan: 'AABCS1429B',
    issued_at: new Date().toISOString(),
    due_at: new Date(Date.now() + 15 * 86400000).toISOString(),
    place_of_supply: `${stateCode} - ${stateName}`,
    status: 'paid',
    subtotal: 150000,
    cgst_rate: 9,
    cgst_amount: 13500,
    sgst_rate: 9,
    sgst_amount: 13500,
    igst_rate: 0,
    igst_amount: 0,
    total: 177000,
    items: [
      {
        id: 1,
        description: 'Transit Bus DOOH Video Broadcast — Route 415 (Andheri West to BKC Complex)',
        hsn: '998311',
        qty: 10,
        unit: 'Displays',
        rate: 10000,
        amount: 100000,
      },
      {
        id: 2,
        description: 'Prime Time Rush-Hour Broadcast Multiplier (08:00 - 11:00 AM & 05:00 - 09:00 PM)',
        hsn: '998311',
        qty: 1,
        unit: 'Package',
        rate: 35000,
        amount: 35000,
      },
      {
        id: 3,
        description: 'Campaign Dynamic Route Telemetry, GPS Logs & Verified Impression Reporting',
        hsn: '998313',
        qty: 1,
        unit: 'SLA Report',
        rate: 15000,
        amount: 15000,
      },
    ],
  };

  const rawItems = Array.isArray(inv.items) ? inv.items : (Array.isArray(inv.InvoiceItems) ? inv.InvoiceItems : []);
  const items = rawItems.length > 0 ? rawItems : [
    {
      id: 1,
      description: inv.type === 'ad_spend'
        ? `Transit DOOH Digital Ad Broadcast: ${inv.po_reference || inv.code} - Multi-Screen Display Slots`
        : inv.type === 'saas_subscription'
        ? `VMOVEXA SaaS Platform Transit Fleet Management Subscription (${inv.customer_name || 'Tenant'})`
        : `VMOVEXA Platform Transit & Display Telematics Services (${inv.code})`,
      hsn: inv.type === 'ad_spend' ? '998311' : '997331',
      qty: 1,
      unit: 'Service',
      rate: Number(inv.subtotal || inv.total || 0),
      amount: Number(inv.subtotal || inv.total || 0),
    }
  ];
  const formattedIssuedDate = inv.issued_at
    ? new Date(inv.issued_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';
  const formattedDueDate = inv.due_at
    ? new Date(inv.due_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Immediate';

  const rawLogo = settings?.logo_url || settings?.logoUrl || '/logo/logo_clinet.png';
  const resolvedLogo = rawLogo.startsWith('http') || rawLogo.startsWith('/logo/') || rawLogo.startsWith('data:')
    ? rawLogo
    : resolveFileUrl(rawLogo);

  // Logo sizing class
  const logoHeightClass =
    design.logoSize === 'small' ? 'h-8' : design.logoSize === 'large' ? 'h-16' : 'h-12';

  // Primary color style helpers
  const primaryBgStyle = { backgroundColor: design.primaryColor };
  const primaryTextStyle = { color: design.primaryColor };

  const subtotal = Number(inv.subtotal || 0);
  const cgstAmount = Number(inv.cgst_amount || (subtotal * 0.09));
  const sgstAmount = Number(inv.sgst_amount || (subtotal * 0.09));
  const igstAmount = Number(inv.igst_amount || 0);
  const totalAmount = Number(inv.total || (subtotal + cgstAmount + sgstAmount + igstAmount));

  // Amount in words string
  const amountInWords = numberToWordsIndian(totalAmount);

  // Paper background tone
  const paperToneClass =
    design.paperType === 'ivory'
      ? 'bg-[#faf8f3]'
      : design.paperType === 'natural'
      ? 'bg-[#fcfbf9]'
      : 'bg-[#ffffff]';

  return (
    <div
      id="invoice-a4-sheet"
      className={`invoice-sheet ${paperToneClass} text-slate-800 transition-all font-sans relative w-full max-w-[800px] min-h-[1120px] mx-auto text-[11px] leading-normal shadow-[0_1px_3px_rgba(0,0,0,0.06),0_12px_28px_-4px_rgba(0,0,0,0.12),0_25px_50px_-12px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.04)] border border-slate-200/90 print:shadow-none print:border-none print:m-0 print:p-0 print:w-full print:max-w-none print:min-h-0 print:bg-white select-text ${
        design.template === 'classic'
          ? 'border-2 border-slate-900 p-7 sm:p-9'
          : design.template === 'executive'
          ? 'border-t-[10px] border-slate-900 p-8 sm:p-10'
          : design.template === 'govt_gem'
          ? 'border-2 border-slate-800 p-6 sm:p-8'
          : design.template === 'corporate'
          ? 'rounded-xl p-8 sm:p-10 border border-slate-200'
          : design.template === 'minimal'
          ? 'p-8 sm:p-10 border border-slate-200'
          : design.template === 'compact'
          ? 'p-5 sm:p-7 border border-slate-300'
          : design.template === 'bold'
          ? 'rounded-2xl overflow-hidden border border-slate-200'
          : 'rounded-xl border border-slate-200 p-8 sm:p-10 shadow-xs space-y-5'
      }`}
      style={{
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {/* ========================================================================= */}
      {/* BACKGROUND SECURITY WATERMARK (AUTHENTIC LEGAL PAPER FEEL) */}
      {/* ========================================================================= */}
      {design.showWatermark && design.watermarkText && design.watermarkText !== 'NONE' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
          <span
            className="text-slate-900/[0.035] text-8xl sm:text-9xl font-black uppercase tracking-widest rotate-[-30deg] transform scale-110"
            style={{ letterSpacing: '0.15em' }}
          >
            {design.watermarkText}
          </span>
        </div>
      )}

      {/* Relative wrapper for sheet content */}
      <div className="relative z-10 space-y-5">
        {/* ========================================================================= */}
        {/* STATUTORY E-INVOICE IRN & BARCODE HEADER BAR (REAL GST ENTERPRISE) */}
        {/* ========================================================================= */}
        {design.showIrn && (
          <div className="pb-3 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-slate-500 font-mono">
            <div className="truncate max-w-lg">
              <span className="font-bold text-slate-700">IRN: </span>
              <span className="text-slate-600 truncate">{inv.irn || '4f9810a9c2b4898114092bdf7812903e198fa490c210981bce9872910fae1204'}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span>Ack No: <strong className="text-slate-700">{inv.ack_no || '112410887329'}</strong></span>
              <span>Ack Date: <strong className="text-slate-700">{inv.ack_date || '29/09/2026'}</strong></span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. BOLD NETWORK TEMPLATE HEADER */}
        {/* ========================================================================= */}
        {design.template === 'bold' && (
          <div style={primaryBgStyle} className="-mx-8 -mt-8 p-6 sm:p-8 text-white mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {resolvedLogo && (
                  <div className="p-2 bg-white/10 backdrop-blur-xs rounded-xl shrink-0">
                    <img src={resolvedLogo} alt="Logo" className={`${logoHeightClass} w-auto object-contain filter brightness-0 invert`} />
                  </div>
                )}
                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                    {companyName}
                  </h2>
                  <p className="text-xs text-white/80 font-medium mt-0.5">
                    {tradeName}
                  </p>
                  <p className="text-[10px] text-white/70 mt-1 max-w-sm">
                    {companyAddress}
                  </p>
                  <div className="text-[10px] text-white/60 pt-0.5 flex flex-wrap gap-x-3">
                    <span>GSTIN: {companyGstin}</span>
                    <span>PAN: {companyPan}</span>
                    <span>Tel: {companyPhone}</span>
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded bg-white/20 text-white inline-block">
                  {design.invoiceTitle || 'TAX INVOICE'}
                </span>
                <p className="text-base font-mono font-black mt-2 text-white">{inv.code}</p>
                <span className="text-[10px] text-white/80 font-semibold block mt-1">
                  {design.invoiceCopy || 'ORIGINAL FOR RECIPIENT'}
                </span>
                {design.showBarcode && (
                  <div className="mt-2 bg-white p-1 rounded inline-block">
                    <Code128Barcode code={inv.code} height={24} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. CORPORATE BLUECHIP / TECH TEMPLATE HEADER */}
        {/* ========================================================================= */}
        {design.template === 'corporate' && (
          <div className="pb-6 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {resolvedLogo && (
                  <div className="p-2 bg-slate-900 rounded-xl shrink-0 shadow-xs">
                    <img src={resolvedLogo} alt="Corporate Logo" className={`${logoHeightClass} w-auto object-contain`} />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                      {companyName}
                    </h1>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                      Tax Compliant
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    {tradeName}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
                    {companyAddress}
                  </p>
                  <div className="text-[10.5px] font-mono text-slate-600 pt-0.5 flex flex-wrap gap-x-3">
                    <span>GSTIN: <strong>{companyGstin}</strong></span>
                    <span>PAN: <strong>{companyPan}</strong></span>
                    <span>Tel: {companyPhone}</span>
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  {design.invoiceCopy || 'ORIGINAL FOR RECIPIENT'}
                </span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {design.invoiceTitle || 'TAX INVOICE'}
                </h2>
                <div className="text-sm font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg inline-block">
                  {inv.code}
                </div>
                {design.showBarcode && (
                  <div className="pt-1">
                    <Code128Barcode code={inv.code} height={24} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. GOVT / PSU GeM STANDARD TEMPLATE HEADER */}
        {/* ========================================================================= */}
        {design.template === 'govt_gem' && (
          <div className="border-b-2 border-slate-900 pb-4 mb-4">
            <div className="text-center pb-2.5 border-b border-slate-300">
              <div className="flex items-center justify-center gap-2">
                <span className="text-base font-black tracking-wide text-slate-900">
                  कर बीजक / {design.invoiceTitle || 'TAX INVOICE'}
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-600 mt-0.5">
                (Issued in compliance with Rule 48 of CGST Rules 2017 & GeM GTC Guidelines)
              </p>
              <div className="flex items-center justify-center gap-3 mt-1.5 font-mono text-[10px]">
                <span className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded font-bold text-slate-800">
                  {design.invoiceCopy || 'ORIGINAL FOR RECIPIENT'}
                </span>
                <span className="text-slate-500">Contract Ref: <strong>{inv.contract_no || 'GEMC-51168772901'}</strong></span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3">
              <div className="flex items-center gap-3">
                {resolvedLogo && (
                  <div className="p-1 border border-slate-400 rounded bg-white shrink-0">
                    <img src={resolvedLogo} alt="Logo" className="h-10 w-auto object-contain" />
                  </div>
                )}
                <div>
                  <h2 className="text-sm font-black text-slate-900">
                    {companyName}
                  </h2>
                  <p className="text-[11px] text-slate-600">{companyAddress}</p>
                  <p className="text-[10px] font-mono font-bold text-slate-800 pt-0.5">
                    GSTIN: {companyGstin} | PAN: {companyPan} | Tel: {companyPhone}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right text-xs space-y-1">
                <div>Invoice No: <strong className="font-mono text-slate-900">{inv.code}</strong></div>
                <div>Invoice Date: <strong className="text-slate-900">{formattedIssuedDate}</strong></div>
                <div>Place of Supply: <strong>{stateName} ({stateCode})</strong></div>
                {design.showBarcode && <Code128Barcode code={inv.code} height={20} />}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. EXECUTIVE LUXURY TEMPLATE HEADER */}
        {/* ========================================================================= */}
        {design.template === 'executive' && (
          <div className="pb-6 border-b-2 border-slate-900 mb-6">
            <div className="flex items-center justify-between mb-3 border-b border-amber-600/30 pb-2">
              <span className="text-[10px] font-mono tracking-widest text-amber-800 uppercase font-black">
                PREMIER TRANSIT BROADCAST • {design.invoiceCopy || 'ORIGINAL FOR RECIPIENT'}
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                STATE CODE: {stateCode} | REVERSE CHARGE: NO
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
              <div className="flex items-start gap-4">
                {resolvedLogo && (
                  <div className="p-2 bg-slate-900 rounded-xl shrink-0">
                    <img src={resolvedLogo} alt="Logo" className={`${logoHeightClass} w-auto object-contain`} />
                  </div>
                )}
                <div className="space-y-1">
                  <h1 className="text-2xl font-black tracking-tight text-slate-900 font-serif">
                    {companyName}
                  </h1>
                  <p className="text-xs font-bold text-amber-700 tracking-wider uppercase">
                    {tradeName}
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm">
                    {companyAddress}
                  </p>
                  <div className="font-mono text-xs font-bold text-slate-800 pt-1 flex flex-wrap gap-x-3">
                    <span>GSTIN: {companyGstin}</span>
                    <span>PAN: {companyPan}</span>
                    <span>Tel: {companyPhone}</span>
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right space-y-1 self-start sm:self-auto">
                <h2 className="text-2xl font-black tracking-widest text-slate-900 uppercase font-serif">
                  {design.invoiceTitle || 'TAX INVOICE'}
                </h2>
                <div className="text-sm font-mono font-bold text-slate-900">{inv.code}</div>
                <div className="text-xs text-slate-500">Issued: <strong className="text-slate-800">{formattedIssuedDate}</strong></div>
                <div className="text-xs text-slate-500">Due: <strong className="text-slate-800">{formattedDueDate}</strong></div>
                {design.showBarcode && <Code128Barcode code={inv.code} height={22} />}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. CLASSIC GST STATUTORY HEADER */}
        {/* ========================================================================= */}
        {design.template === 'classic' && (
          <div className="border-b-2 border-slate-900 pb-4 mb-4">
            <div className="text-center pb-3 border-b border-slate-300">
              <h1 className="text-xl font-black uppercase tracking-wider text-slate-900">
                {design.invoiceTitle || 'TAX INVOICE'}
              </h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                (Issued Under Section 31 of the Central Goods & Services Tax Act, 2017)
              </p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-700">
                  {design.invoiceCopy || 'ORIGINAL FOR RECIPIENT'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3">
              <div className="flex items-center gap-3">
                {resolvedLogo && (
                  <div className="p-1 bg-white border border-slate-400 rounded shrink-0">
                    <img src={resolvedLogo} alt="Logo" className="h-10 w-auto object-contain" />
                  </div>
                )}
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    {companyName}
                  </h2>
                  <p className="text-xs text-slate-600">
                    {companyAddress}
                  </p>
                  <p className="text-xs font-mono font-bold text-slate-800">
                    GSTIN: {companyGstin} | PAN: {companyPan} | Email: {companyEmail}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right text-xs space-y-1">
                <div>Invoice No: <strong className="font-mono text-slate-900">{inv.code}</strong></div>
                <div>Invoice Date: <strong className="text-slate-900">{formattedIssuedDate}</strong></div>
                <div>State & Code: <strong>{stateName} ({stateCode})</strong></div>
                {design.showBarcode && <Code128Barcode code={inv.code} height={20} />}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 6. MODERN & MINIMAL & COMPACT HEADERS */}
        {/* ========================================================================= */}
        {['modern', 'minimal', 'compact'].includes(design.template) && (
          <div
            className={`flex flex-col ${
              design.logoPosition === 'center'
                ? 'items-center text-center'
                : design.logoPosition === 'right'
                ? 'sm:flex-row-reverse sm:items-start justify-between'
                : 'sm:flex-row sm:items-start justify-between'
            } gap-5 pb-5 border-b border-slate-200`}
          >
            {/* Company Brand Block */}
            <div className={`space-y-1 ${design.logoPosition === 'center' ? 'max-w-md mx-auto' : 'max-w-md'}`}>
              <div className={`flex items-center gap-3 ${design.logoPosition === 'center' ? 'justify-center' : ''}`}>
                {resolvedLogo && (
                  <div className="p-1.5 bg-slate-900 rounded-xl shrink-0">
                    <img src={resolvedLogo} alt="Corporate Logo" className={`${logoHeightClass} w-auto object-contain`} />
                  </div>
                )}
                <div>
                  <h2 style={design.template === 'modern' ? primaryTextStyle : {}} className="text-lg sm:text-xl font-black tracking-tight text-slate-900 leading-snug">
                    {companyName}
                  </h2>
                  <p className="text-xs font-semibold text-slate-500">
                    {tradeName}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed pt-1">
                {companyAddress}
              </p>

              <div className="text-xs font-mono font-bold text-slate-700 pt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                <span>GSTIN: <strong>{companyGstin}</strong></span>
                <span>PAN: <strong>{companyPan}</strong></span>
                <span>Tel: <strong>{companyPhone}</strong></span>
              </div>
            </div>

            {/* Invoice Title & Status */}
            <div className={design.logoPosition === 'center' ? 'text-center' : 'text-left sm:text-right'}>
              <span
                style={design.template === 'modern' ? primaryTextStyle : {}}
                className="text-[10px] font-black tracking-widest uppercase"
              >
                {design.invoiceCopy || 'ORIGINAL FOR RECIPIENT'}
              </span>
              <h1
                style={design.template === 'modern' ? primaryTextStyle : {}}
                className="text-2xl sm:text-3xl font-black tracking-tight mt-0.5"
              >
                {design.invoiceTitle || 'TAX INVOICE'}
              </h1>
              <div className="flex items-center gap-2 mt-1 sm:justify-end">
                <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  {inv.code}
                </span>
              </div>
              {design.showBarcode && (
                <div className="pt-2 flex sm:justify-end">
                  <Code128Barcode code={inv.code} height={22} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* METADATA SECTION: BILLED TO (CUSTOMER) & INVOICE DETAILS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Billed To Box */}
          <div
            className={`p-3.5 rounded-xl space-y-1 ${
              design.template === 'classic' || design.template === 'govt_gem'
                ? 'border border-slate-900 bg-white'
                : 'bg-slate-50/90 border border-slate-200/90'
            }`}
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Details of Receiver (Billed To):
            </span>
            <p className="font-bold text-slate-900 text-sm">
              {inv.customer_name || inv.organization?.name || 'Client / Business Entity'}
            </p>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              {inv.billing_address || inv.place_of_supply || 'Registered Business Address, India'}
            </p>
            <div className="pt-1 font-mono font-bold text-slate-800 text-[11px] flex flex-wrap gap-x-3">
              <span>GSTIN: {inv.gstin || 'Unregistered'}</span>
              <span>PAN: {inv.pan || '—'}</span>
            </div>
            {(inv.customer_phone || inv.customer_email) && (
              <p className="text-[10px] text-slate-500">Contact: {[inv.customer_phone, inv.customer_email].filter(Boolean).join(' | ')}</p>
            )}
          </div>

          {/* Invoice Particulars Box */}
          <div
            className={`p-3.5 rounded-xl space-y-1.5 ${
              design.template === 'classic' || design.template === 'govt_gem'
                ? 'border border-slate-900 bg-white'
                : 'bg-slate-50/90 border border-slate-200/90'
            }`}
          >
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="text-slate-500">Invoice Number:</span>
              <span className="font-mono font-bold text-slate-900">{inv.code}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="text-slate-500">Invoice Date:</span>
              <span className="font-bold text-slate-800">{formattedIssuedDate}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="text-slate-500">Due Date:</span>
              <span className="font-bold text-slate-800">{formattedDueDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Place of Supply:</span>
              <span className="font-bold text-slate-800">{inv.place_of_supply || `${stateCode} - ${stateName}`}</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LINE ITEMS TABLE (WITH REAL DOOH TRANSIT AD SERVICES) */}
        {/* ========================================================================= */}
        <div
          className={`overflow-x-auto ${
            design.template === 'classic' || design.template === 'govt_gem'
              ? 'border-2 border-slate-900'
              : 'border border-slate-200 rounded-xl'
          }`}
        >
          <table className="w-full text-left text-xs border-collapse">
            <thead
              style={design.template === 'bold' ? primaryBgStyle : {}}
              className={`border-b ${
                design.template === 'bold'
                  ? 'text-white'
                  : 'bg-slate-100/80 border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider'
              }`}
            >
              <tr>
                <th className="py-2.5 px-3 w-8 text-center border-r border-slate-200">#</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Description of Service & Campaign Specification</th>
                {design.showHsn && <th className="py-2.5 px-2.5 text-center border-r border-slate-200 w-20">HSN/SAC</th>}
                <th className="py-2.5 px-2 text-center border-r border-slate-200 w-12">Qty</th>
                <th className="py-2.5 px-3 text-right border-r border-slate-200 w-24">Rate (₹)</th>
                <th className="py-2.5 px-3 text-right w-28">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {items.map((item, idx) => {
                const qty = Number(item.qty || 1);
                const rate = Number(item.rate || 0);
                const lineTotal = Number(item.amount || qty * rate);

                return (
                  <tr key={item.id ?? idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono border-r border-slate-100">{idx + 1}</td>
                    <td className="py-2.5 px-3 border-r border-slate-100">
                      <p className="font-bold text-slate-900 leading-snug">{item.description || item.desc}</p>
                      {item.unit && <p className="text-[10px] text-slate-500 font-medium mt-0.5">{item.unit}</p>}
                    </td>
                    {design.showHsn && (
                      <td className="py-2.5 px-2.5 text-center font-mono font-bold text-slate-600 border-r border-slate-100">
                        {item.hsn || '998311'}
                      </td>
                    )}
                    <td className="py-2.5 px-2 text-center font-bold text-slate-800 border-r border-slate-100">{qty}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-800 border-r border-slate-100">
                      ₹{rate.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{lineTotal.toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ========================================================================= */}
        {/* DETAILED GST TAX BREAKUP TABLE (MANDATORY INDIAN COMPLIANCE) */}
        {/* ========================================================================= */}
        {design.showTaxBreakup && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              GST Tax Calculation Breakup:
            </span>
            <div className="border border-slate-200 rounded-lg overflow-x-auto text-[10px]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-1.5 px-2.5">HSN/SAC</th>
                    <th className="py-1.5 px-2.5 text-right">Taxable Value (₹)</th>
                    <th className="py-1.5 px-2.5 text-right">CGST Rate</th>
                    <th className="py-1.5 px-2.5 text-right">CGST Amt (₹)</th>
                    <th className="py-1.5 px-2.5 text-right">SGST Rate</th>
                    <th className="py-1.5 px-2.5 text-right">SGST Amt (₹)</th>
                    <th className="py-1.5 px-2.5 text-right">Total Tax (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr>
                    <td className="py-1.5 px-2.5 font-bold text-slate-800">998311 (Ad Services)</td>
                    <td className="py-1.5 px-2.5 text-right text-slate-800">₹{subtotal.toLocaleString('en-IN')}</td>
                    <td className="py-1.5 px-2.5 text-right text-slate-600">9%</td>
                    <td className="py-1.5 px-2.5 text-right text-slate-800">₹{cgstAmount.toLocaleString('en-IN')}</td>
                    <td className="py-1.5 px-2.5 text-right text-slate-600">9%</td>
                    <td className="py-1.5 px-2.5 text-right text-slate-800">₹{sgstAmount.toLocaleString('en-IN')}</td>
                    <td className="py-1.5 px-2.5 text-right font-bold text-slate-900">
                      ₹{(cgstAmount + sgstAmount).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* AMOUNT IN WORDS (LEGAL MANDATE) */}
        {/* ========================================================================= */}
        {design.showAmountInWords && (
          <div className="p-2.5 bg-slate-50/80 border border-slate-200/90 rounded-lg flex items-center justify-between gap-2 text-xs">
            <span className="text-[10px] font-black uppercase text-slate-400 shrink-0">
              Amount Chargeable in Words:
            </span>
            <span className="font-bold text-slate-900 text-right truncate">
              {amountInWords}
            </span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FINANCIAL TOTALS & PAYMENT DETAILS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
          {/* Left: Bank Wire & Instant UPI QR */}
          <div className="space-y-3">
            {design.showBankDetails && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
                <span className="font-black uppercase tracking-wider text-slate-400 text-[10px]">
                  Bank Wire Settlement Instructions (NEFT / RTGS / IMPS)
                </span>
                <div className="text-slate-700">Bank: <strong className="text-slate-900">{bankName}</strong></div>
                <div className="text-slate-700">Beneficiary: <strong className="text-slate-900">{accountName}</strong></div>
                <div className="text-slate-700">Account No: <strong className="font-mono text-slate-900">{accountNumber}</strong></div>
                <div className="text-slate-700">IFSC Code: <strong className="font-mono text-slate-900 uppercase">{ifscCode}</strong></div>
                <div className="text-slate-500 text-[10px]">Branch: {branch}</div>
              </div>
            )}

            {design.showQrCode && (
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3">
                {/* Visual Realistic UPI QR Code */}
                <div className="w-16 h-16 bg-slate-900 p-1 rounded-lg shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full text-white" viewBox="0 0 100 100" fill="currentColor">
                    <rect x="5" y="5" width="30" height="30" rx="4" />
                    <rect x="10" y="10" width="20" height="20" fill="black" />
                    <rect x="15" y="15" width="10" height="10" fill="white" />
                    <rect x="65" y="5" width="30" height="30" rx="4" />
                    <rect x="70" y="10" width="20" height="20" fill="black" />
                    <rect x="75" y="15" width="10" height="10" fill="white" />
                    <rect x="5" y="65" width="30" height="30" rx="4" />
                    <rect x="10" y="70" width="20" height="20" fill="black" />
                    <rect x="15" y="75" width="10" height="10" fill="white" />
                    <rect x="42" y="10" width="8" height="8" />
                    <rect x="42" y="24" width="8" height="8" />
                    <rect x="10" y="42" width="8" height="8" />
                    <rect x="24" y="42" width="8" height="8" />
                    <rect x="42" y="42" width="16" height="16" rx="2" fill="#2563eb" />
                    <rect x="65" y="42" width="8" height="8" />
                    <rect x="82" y="42" width="8" height="8" />
                    <rect x="42" y="65" width="8" height="8" />
                    <rect x="55" y="78" width="8" height="8" />
                    <rect x="75" y="68" width="16" height="8" />
                    <rect x="68" y="82" width="8" height="8" />
                  </svg>
                </div>
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    Instant UPI Settlement
                  </span>
                  <p className="text-xs font-bold text-slate-900 mt-1 truncate">
                    UPI: <span className="font-mono text-indigo-700">{companyUpiId}</span>
                  </p>
                  <p className="text-[10px] text-slate-500">Google Pay • PhonePe • Paytm • BHIM</p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Subtotal, Taxes & Grand Total Block */}
          <div className="space-y-2 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/90 space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200/80">
                <span className="text-slate-600 font-medium">Taxable Subtotal:</span>
                <span className="font-mono font-bold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/80">
                <span className="text-slate-600 font-medium">Central GST (CGST @ 9%):</span>
                <span className="font-mono font-bold text-slate-800">₹{cgstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/80">
                <span className="text-slate-600 font-medium">State GST (SGST @ 9%):</span>
                <span className="font-mono font-bold text-slate-800">₹{sgstAmount.toLocaleString('en-IN')}</span>
              </div>
              {igstAmount > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-200/80">
                  <span className="text-slate-600 font-medium">Integrated GST (IGST @ 18%):</span>
                  <span className="font-mono font-bold text-slate-800">₹{igstAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div
                style={design.template === 'bold' ? primaryBgStyle : {}}
                className={`flex justify-between items-center py-2.5 px-3 rounded-lg mt-2 ${
                  design.template === 'bold'
                    ? 'text-white'
                    : 'bg-slate-900 text-white shadow-xs'
                }`}
              >
                <div>
                  <span className="text-xs font-black uppercase tracking-wider">Grand Total (INR):</span>
                  <span className="block text-[10px] text-white/70 font-normal">Inclusive of all applicable GST taxes</span>
                </div>
                <span className="text-lg font-black font-mono">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TERMS & CONDITIONS AND OFFICIAL SIGNATORY & STAMP SEAL */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 pt-3 border-t border-slate-200 items-end">
          {/* Terms & Conditions (7 cols) */}
          <div className="sm:col-span-7 space-y-1.5">
            {design.showTerms && (
              <div className="text-[10px] text-slate-500 leading-relaxed space-y-1">
                <span className="font-black uppercase text-slate-700 tracking-wider block">
                  Terms & Conditions:
                </span>
                {termLines.map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>
            )}
            <p className="text-[10px] text-slate-400 pt-1 italic">
              {footerDisclaimer}
            </p>
          </div>

          {/* Authorized Signatory & Official Stamp (5 cols) */}
          {design.showSignatory && (
            <div className="sm:col-span-5 text-center sm:text-right relative space-y-1">
              <div className="flex items-end justify-center sm:justify-end gap-3">
                {/* Official Circular Rubber Stamp Overlay */}
                {design.showStamp && (
                  <div className="shrink-0 mb-1">
                    <AccountsRubberStamp
                      company={companyName}
                      tradeName={tradeName}
                      address={companyAddress}
                      sealUrl={signatorySealUrl}
                    />
                  </div>
                )}

                <div className="text-center sm:text-right">
                  <p className="text-[10px] font-black uppercase text-slate-700 tracking-wider">
                    For {companyName}
                  </p>

                  {/* Digitized Ink Signature */}
                  {design.showSignatureImage && (
                    <div className="py-0.5 flex justify-center sm:justify-end">
                      <DigitizedSignature
                        name={signatoryName}
                        signatureUrl={signatorySignatureUrl}
                      />
                    </div>
                  )}

                  <div className="pt-1">
                    <span className="inline-block border-b border-slate-400 w-36 mb-1"></span>
                    <p className="font-bold text-slate-900 text-xs">{signatoryName}</p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {signatoryDesignation}
                      {signatoryEmpId ? ` (${signatoryEmpId})` : ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* PERFORATED REMITTANCE ADVICE TEAR-OFF STUB (AUTHENTIC ENTERPRISE SLIP) */}
        {/* ========================================================================= */}
        {design.showRemittanceStub && (
          <div className="pt-4 mt-6 border-t-2 border-dashed border-slate-300 relative">
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pb-2">
              <span className="flex items-center gap-1.5 font-bold">
                <FleetIcons.Scissors className="w-3.5 h-3.5 inline text-slate-400" />
                <span>TEAR ALONG PERFORATION FOR PAYMENT STUB / REMITTANCE SLIP</span>
              </span>
              <span>PLEASE RETURN THIS PORTION WITH CHEQUE OR WIRE ADVICE</span>
            </div>

            <div className="bg-slate-50/90 border border-slate-200/90 rounded-lg p-3 text-[10px] grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-400 uppercase font-bold block text-[9px]">Invoice No</span>
                <span className="font-mono font-bold text-slate-900">{inv.code}</span>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold block text-[9px]">Customer Name</span>
                <span className="font-bold text-slate-800 truncate block">{inv.customer_name}</span>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold block text-[9px]">Due Date</span>
                <span className="font-bold text-slate-800">{formattedDueDate}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 uppercase font-bold block text-[9px]">Remittance Amount</span>
                <span className="font-mono font-black text-slate-900 text-xs">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceSheet;
