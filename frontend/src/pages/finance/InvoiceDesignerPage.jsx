import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from '../../hooks/useTranslation';
import { useFinanceRole } from '../../hooks/finance/useFinanceRole';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { InvoiceSheet, DEFAULT_INVOICE_DESIGN } from '../../components/finance/InvoiceSheet';

const COLOR_PRESETS = [
  { name: 'Slate Navy', primary: '#0f172a', accent: '#2563eb' },
  { name: 'Royal Indigo', primary: '#1e1b4b', accent: '#6366f1' },
  { name: 'Emerald Forest', primary: '#064e3b', accent: '#059669' },
  { name: 'Deep Wine', primary: '#4c0519', accent: '#e11d48' },
  { name: 'Charcoal Gold', primary: '#18181b', accent: '#d97706' },
  { name: 'Ocean Cyan', primary: '#083344', accent: '#0284c7' },
];

const TEMPLATES = [
  {
    id: 'modern',
    name: 'Modern Transit DOOH',
    desc: 'Contemporary layout with crisp badges and clean lines',
    iconKey: 'Dashboard',
    badge: 'Popular',
  },
  {
    id: 'classic',
    name: 'Classic GST Statutory',
    desc: 'Rule 48 compliant boxed Indian GST format with double black rules',
    iconKey: 'Building',
    badge: 'Govt Legal',
  },
  {
    id: 'corporate',
    name: 'Corporate Bluechip / Tech',
    desc: 'Razorpay / Stripe enterprise design with modern status pills and soft lines',
    iconKey: 'CreditCard',
    badge: 'New',
  },
  {
    id: 'executive',
    name: 'Executive Luxury DOOH',
    desc: 'Deep Navy & Gold double rule headers for high-ticket agency billing',
    iconKey: 'Shield',
    badge: 'Premium',
  },
  {
    id: 'govt_gem',
    name: 'Govt / PSU GeM Standard',
    desc: 'Bilingual कर बीजक / TAX INVOICE format with GeM contract references',
    iconKey: 'Document',
    badge: 'Bilingual',
  },
  {
    id: 'minimal',
    name: 'Minimalist Swiss',
    desc: 'Clean typography with hairline borders and maximum whitespace',
    iconKey: 'FileText',
    badge: 'Clean',
  },
  {
    id: 'bold',
    name: 'Bold Network',
    desc: 'Solid brand header bar, high-contrast and prominent grand total',
    iconKey: 'Target',
    badge: 'Vibrant',
  },
  {
    id: 'compact',
    name: 'Compact Dense Ledger',
    desc: 'Single-sheet dense layout for multi-vehicle campaign itemizations',
    iconKey: 'List',
    badge: 'Dense',
  },
];

const PAPER_TONES = [
  { id: 'white', name: 'Bright Pure White', desc: '80 GSM standard laser bond paper' },
  { id: 'ivory', name: 'Warm Ivory Bond', desc: '90 GSM executive stationery' },
  { id: 'natural', name: 'Natural Recycled', desc: '100 GSM matte offset stock' },
];

export const InvoiceDesignerPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/finance' : '/finance';

  const { settings, loadSettings, updateSettings, invoices, loadInvoices } = useFinanceRole();

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('template'); // 'template' | 'branding' | 'sections' | 'text'
  const [mobileView, setMobileView] = useState('controls'); // 'controls' | 'preview'
  const [zoomLevel, setZoomLevel] = useState(window.innerWidth < 768 ? 65 : 85);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('sample');

  const [design, setDesign] = useState(DEFAULT_INVOICE_DESIGN);

  // Initialize design from backend settings
  useEffect(() => {
    loadSettings().catch(() => {});
    loadInvoices().catch(() => {});
  }, [loadSettings, loadInvoices]);

  useEffect(() => {
    if (settings) {
      const savedDesign = settings.invoice_design || settings.invoiceDesign;
      if (savedDesign && typeof savedDesign === 'object') {
        setDesign((prev) => ({
          ...DEFAULT_INVOICE_DESIGN,
          ...savedDesign,
        }));
      }
    }
  }, [settings]);

  const invoiceList = Array.isArray(invoices) ? invoices : (invoices?.items || invoices?.rows || []);

  const selectedInvoice =
    selectedInvoiceId === 'sample'
      ? null
      : invoiceList.find((i) => String(i.id) === String(selectedInvoiceId));

  const handleSave = async () => {
    setSaving(true);
    try {
      await toast.promise(
        updateSettings({
          invoiceDesign: design,
        }),
        {
          loading: 'Saving design settings…',
          success: 'Invoice design saved successfully!',
          error: (err) => err?.message || 'Failed to save invoice design',
        }
      );
    } catch {
      // toast handles error
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset design to default settings?')) {
      setDesign(DEFAULT_INVOICE_DESIGN);
      toast.success('Reset to default values. Click Save to persist.');
    }
  };

  const handlePrintTest = () => {
    window.print();
  };

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-200">
      {/* Top Header & Responsive Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4 print:hidden">
        <div>
          <Breadcrumb
            items={[
              { label: basePath.startsWith('/superadmin') ? 'Super Admin' : 'Finance Portal', path: `${basePath}/dashboard` },
              { label: 'Tax Invoices', path: `${basePath}/invoices` },
              { label: 'Invoice Designer' },
            ]}
            className="mb-2"
          />
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
              Invoice Designer & Print Studio
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Real Physical A4 Print (WYSIWYG)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Exact physical laser print replica with statutory GST, IRN headers, digital signatures, and accounts seal
          </p>
        </div>

        {/* Buttons (Responsive Grid on Mobile, Flex Row on Desktop) */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
          <Link
            to={`${basePath}/invoices`}
            className="px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-1.5"
          >
            <FleetIcons.Document className="w-3.5 h-3.5" />
            <span>Invoices</span>
          </Link>

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-1"
          >
            <FleetIcons.Refresh className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handlePrintTest}
            className="px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-1.5"
          >
            <FleetIcons.Print className="w-3.5 h-3.5" />
            <span>Print A4</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="col-span-2 sm:col-span-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer"
          >
            <FleetIcons.Check className="w-4 h-4" />
            <span>{saving ? 'Saving…' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Switcher (Controls vs Live Preview) - Visible only on mobile/tablet (< lg) */}
      <div className="flex lg:hidden bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-slate-200 dark:border-zinc-700 gap-1 print:hidden">
        <button
          type="button"
          onClick={() => setMobileView('controls')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mobileView === 'controls'
              ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 shadow-sm'
              : 'text-slate-600 dark:text-zinc-400'
          }`}
        >
          <FleetIcons.Settings className="w-3.5 h-3.5" />
          <span>Customize Settings</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileView('preview')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mobileView === 'preview'
              ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 shadow-sm'
              : 'text-slate-600 dark:text-zinc-400'
          }`}
        >
          <FleetIcons.Eye className="w-3.5 h-3.5" />
          <span>Live A4 Preview</span>
        </button>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Controls Panel (5 cols) */}
        <div
          className={`${
            mobileView === 'controls' ? 'block' : 'hidden lg:block'
          } lg:col-span-5 space-y-4 print:hidden`}
        >
          {/* Tab Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-slate-200 dark:border-zinc-700">
            {[
              { id: 'template', label: 'Template', icon: <FleetIcons.Layers className="w-3.5 h-3.5 shrink-0" /> },
              { id: 'branding', label: 'Paper & Color', icon: <FleetIcons.Eye className="w-3.5 h-3.5 shrink-0" /> },
              { id: 'sections', label: 'Sections', icon: <FleetIcons.List className="w-3.5 h-3.5 shrink-0" /> },
              { id: 'text', label: 'Text & Legal', icon: <FleetIcons.Edit className="w-3.5 h-3.5 shrink-0" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-2 text-xs font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1.5 truncate ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 shadow-sm'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* TAB 1: Template Selection (8 Styles) */}
          {activeTab === 'template' && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100">
                  Select Template Design ({TEMPLATES.length} Styles)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                  Switch between statutory Indian GST formats, corporate SaaS, and premier transit media layouts
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {TEMPLATES.map((tmpl) => {
                  const isSelected = design.template === tmpl.id;
                  const IconComp = FleetIcons[tmpl.iconKey] || FleetIcons.Document;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => setDesign((prev) => ({ ...prev, template: tmpl.id }))}
                      className={`text-left p-3 rounded-xl border-2 transition-all relative ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-sm'
                          : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                          {tmpl.badge}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-zinc-100">{tmpl.name}</div>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium mt-0.5 leading-snug">
                        {tmpl.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Colors, Paper & Logo */}
          {activeTab === 'branding' && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100">Paper Tone & Theme Colors</h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                  Set paper grain, corporate brand colors, and header logo alignment
                </p>
              </div>

              {/* Paper Material Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">A4 Print Paper Stock</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {PAPER_TONES.map((pt) => {
                    const isSelected = (design.paperType || 'white') === pt.id;
                    return (
                      <button
                        key={pt.id}
                        type="button"
                        onClick={() => setDesign((prev) => ({ ...prev, paperType: pt.id }))}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-2xs'
                            : 'border-slate-200 dark:border-zinc-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-900 dark:text-zinc-100">{pt.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">{pt.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Presets */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">Color Presets</label>
                <div className="grid grid-cols-3 gap-2">
                  {COLOR_PRESETS.map((p) => {
                    const isCurrent = design.primaryColor === p.primary && design.accentColor === p.accent;
                    return (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() =>
                          setDesign((prev) => ({
                            ...prev,
                            primaryColor: p.primary,
                            accentColor: p.accent,
                          }))
                        }
                        className={`p-2 rounded-xl border text-left transition-all ${
                          isCurrent
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20'
                            : 'border-slate-200 dark:border-zinc-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className="w-3 h-3 rounded-full border border-black/10 inline-block shrink-0"
                            style={{ backgroundColor: p.primary }}
                          />
                          <span
                            className="w-3 h-3 rounded-full border border-black/10 inline-block shrink-0"
                            style={{ backgroundColor: p.accent }}
                          />
                        </div>
                        <div className="text-[10px] font-bold text-slate-800 dark:text-zinc-200 truncate">
                          {p.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Colors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">Primary Header Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={design.primaryColor || '#0f172a'}
                      onChange={(e) => setDesign((prev) => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5 shrink-0"
                    />
                    <input
                      type="text"
                      value={design.primaryColor || '#0f172a'}
                      onChange={(e) => setDesign((prev) => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-full text-xs font-mono font-bold px-2 py-1.5 border border-slate-200 dark:border-zinc-700 rounded-lg bg-slate-50 dark:bg-zinc-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={design.accentColor || '#2563eb'}
                      onChange={(e) => setDesign((prev) => ({ ...prev, accentColor: e.target.value }))}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5 shrink-0"
                    />
                    <input
                      type="text"
                      value={design.accentColor || '#2563eb'}
                      onChange={(e) => setDesign((prev) => ({ ...prev, accentColor: e.target.value }))}
                      className="w-full text-xs font-mono font-bold px-2 py-1.5 border border-slate-200 dark:border-zinc-700 rounded-lg bg-slate-50 dark:bg-zinc-800"
                    />
                  </div>
                </div>
              </div>

              {/* Logo Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">Logo Alignment</label>
                  <select
                    value={design.logoPosition || 'left'}
                    onChange={(e) => setDesign((prev) => ({ ...prev, logoPosition: e.target.value }))}
                    className="w-full text-xs font-semibold px-2.5 py-2 border border-slate-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200"
                  >
                    <option value="left">Left Aligned</option>
                    <option value="center">Centered</option>
                    <option value="right">Right Aligned</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">Logo Size</label>
                  <select
                    value={design.logoSize || 'medium'}
                    onChange={(e) => setDesign((prev) => ({ ...prev, logoSize: e.target.value }))}
                    className="w-full text-xs font-semibold px-2.5 py-2 border border-slate-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200"
                  >
                    <option value="small">Small (Compact)</option>
                    <option value="medium">Medium (Standard)</option>
                    <option value="large">Large (Prominent)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Section Visibility Toggles */}
          {activeTab === 'sections' && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100">Section Toggles</h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                  Enable or disable physical print and legal compliance components
                </p>
              </div>

              <div className="space-y-2">
                {[
                  {
                    key: 'showIrn',
                    title: 'E-Invoice IRN & Ack Header',
                    desc: 'Statutory 64-char hash and acknowledgement date for B2B GST compliance',
                  },
                  {
                    key: 'showBarcode',
                    title: 'Code-128 Barcode',
                    desc: 'Print-ready machine-scannable barcode of the invoice code',
                  },
                  {
                    key: 'showHsn',
                    title: 'HSN / SAC Code Column',
                    desc: 'Required under GST for advertising services (998311)',
                  },
                  {
                    key: 'showTaxBreakup',
                    title: 'GST Tax Breakup Table',
                    desc: 'Detailed CGST (9%) + SGST (9%) or IGST (18%) table',
                  },
                  {
                    key: 'showAmountInWords',
                    title: 'Amount in Words (INR)',
                    desc: 'Legal Indian statutory requirement on tax invoices',
                  },
                  {
                    key: 'showBankDetails',
                    title: 'Bank Wire Details',
                    desc: 'Bank account, IFSC code and wire settlement info',
                  },
                  {
                    key: 'showQrCode',
                    title: 'UPI Payment QR Code',
                    desc: 'Scan-and-pay code for instant mobile app payment',
                  },
                  {
                    key: 'showSignatory',
                    title: 'Authorized Signatory Block',
                    desc: 'Finance officer signatory block and signature line',
                  },
                  {
                    key: 'showSignatureImage',
                    title: 'Digitized Ink Fountain Signature',
                    desc: 'Realistic cursive pen stroke signature above the signatory line',
                  },
                  {
                    key: 'showStamp',
                    title: 'Accounts Rubber Stamp / Seal',
                    desc: 'Authentic dual-ring verified accounts stamp overlay',
                  },
                  {
                    key: 'showWatermark',
                    title: 'Security Watermark',
                    desc: 'Faint translucent security watermark across page center',
                  },
                  {
                    key: 'showRemittanceStub',
                    title: 'Perforated Remittance Tear-off Slip',
                    desc: 'Detachable payment advice slip at bottom with scissor cuts',
                  },
                  {
                    key: 'showTerms',
                    title: 'Terms & Conditions',
                    desc: 'Payment due terms and legal jurisdiction',
                  },
                ].map((item) => {
                  const isChecked = design[item.key] !== false;
                  return (
                    <div
                      key={item.key}
                      onClick={() => setDesign((prev) => ({ ...prev, [item.key]: !isChecked }))}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/60 cursor-pointer transition-all"
                    >
                      <div className="pr-2 min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">{item.title}</div>
                        <div className="text-[10px] text-slate-400 dark:text-zinc-400 font-medium truncate">{item.desc}</div>
                      </div>
                      <button
                        type="button"
                        aria-pressed={isChecked}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isChecked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-zinc-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            isChecked ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: Text & Labels */}
          {activeTab === 'text' && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100">Labels & Legal Text</h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                  Custom document headings, watermark text, and compliance disclaimer
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">Document Title</label>
                  <input
                    type="text"
                    value={design.invoiceTitle || 'TAX INVOICE'}
                    onChange={(e) => setDesign((prev) => ({ ...prev, invoiceTitle: e.target.value }))}
                    placeholder="TAX INVOICE"
                    className="w-full mt-1 text-xs font-bold px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">Invoice Copy Marking</label>
                  <select
                    value={design.invoiceCopy || 'ORIGINAL FOR RECIPIENT'}
                    onChange={(e) => setDesign((prev) => ({ ...prev, invoiceCopy: e.target.value }))}
                    className="w-full mt-1 text-xs font-bold px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  >
                    <option value="ORIGINAL FOR RECIPIENT">ORIGINAL FOR RECIPIENT</option>
                    <option value="DUPLICATE FOR TRANSPORTER">DUPLICATE FOR TRANSPORTER</option>
                    <option value="TRIPLICATE FOR SUPPLIER">TRIPLICATE FOR SUPPLIER</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">Security Watermark Text</label>
                  <select
                    value={design.watermarkText || 'PAID'}
                    onChange={(e) => setDesign((prev) => ({ ...prev, watermarkText: e.target.value }))}
                    className="w-full mt-1 text-xs font-bold px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  >
                    <option value="PAID">PAID</option>
                    <option value="ORIGINAL">ORIGINAL</option>
                    <option value="TAX INVOICE">TAX INVOICE</option>
                    <option value="DUPLICATE">DUPLICATE</option>
                    <option value="NONE">NO WATERMARK</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">Invoice Number Prefix</label>
                  <input
                    type="text"
                    value={design.invoicePrefix || 'VMX-INV-'}
                    onChange={(e) => setDesign((prev) => ({ ...prev, invoicePrefix: e.target.value }))}
                    placeholder="VMX-INV-"
                    className="w-full mt-1 text-xs font-mono font-bold px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">Footer Disclaimer</label>
                  <textarea
                    rows={3}
                    value={design.footerNote || ''}
                    onChange={(e) => setDesign((prev) => ({ ...prev, footerNote: e.target.value }))}
                    placeholder="This is a computer-generated tax invoice under GST rules and requires no physical signature."
                    className="w-full mt-1 text-xs font-medium px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Realistic Physical A4 Print Sheet Preview (7 cols) */}
        <div
          className={`${
            mobileView === 'preview' ? 'block' : 'hidden lg:block'
          } lg:col-span-7 space-y-3 w-full min-w-0`}
        >
          {/* Top Paper Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 px-3.5 shadow-sm print:hidden">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">Live Physical A4 Printout</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                210 × 297 mm • 300 DPI
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* Invoice Data Source Selector */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-400 font-medium text-[11px]">Data:</span>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => setSelectedInvoiceId(e.target.value)}
                  className="text-xs font-bold px-2 py-1 border border-slate-200 dark:border-zinc-700 rounded-lg bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 max-w-[150px] truncate"
                >
                  <option value="sample">Sample Transit Ad</option>
                  {invoiceList.slice(0, 10).map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.code}
                    </option>
                  ))}
                </select>
              </div>

              {/* Zoom Buttons */}
              <div className="flex items-center gap-1 border-l border-slate-200 dark:border-zinc-700 pl-2">
                {[65, 80, 100].map((z) => (
                  <button
                    key={z}
                    type="button"
                    onClick={() => setZoomLevel(z)}
                    className={`px-2 py-1 text-[11px] font-bold rounded ${
                      zoomLevel === z
                        ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {z}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Desk Surface & Realistic A4 Paper Sheet Simulation */}
          <div className="bg-[#e4e7eb] dark:bg-[#0c0d0e] p-3 sm:p-8 rounded-2xl border border-slate-300 dark:border-zinc-800 overflow-x-auto shadow-inner flex justify-center items-start min-h-[920px] relative">
            <div
              style={{
                width: '100%',
                maxWidth: '800px',
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
                marginBottom: zoomLevel < 100 ? `-${(100 - zoomLevel) * 9}px` : '0px',
              }}
              className="origin-top relative"
            >
              {/* Millimeter Pre-Press Ruler Across Top */}
              <div className="flex items-center justify-between text-[9px] text-slate-500 dark:text-zinc-500 font-mono pb-2 px-1 print:hidden select-none border-b border-dashed border-slate-400/40 mb-2">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 border-l border-t border-slate-600 inline-block" />
                  0 mm
                </span>
                <span className="hidden sm:inline">50 mm</span>
                <span>105 mm (A4 CENTER)</span>
                <span className="hidden sm:inline">160 mm</span>
                <span className="flex items-center gap-1">
                  210 mm
                  <span className="w-2 h-2 border-r border-t border-slate-600 inline-block" />
                </span>
              </div>

              {/* Pre-press crop marks at top corners */}
              <div className="relative">
                <div className="absolute -top-3 -left-3 text-slate-400 font-mono text-[10px] select-none print:hidden">┌</div>
                <div className="absolute -top-3 -right-3 text-slate-400 font-mono text-[10px] select-none print:hidden">┐</div>

                {/* The Actual Real Printable Sheet */}
                <InvoiceSheet
                  invoice={selectedInvoice}
                  settings={settings}
                  design={design}
                />

                <div className="absolute -bottom-3 -left-3 text-slate-400 font-mono text-[10px] select-none print:hidden">└</div>
                <div className="absolute -bottom-3 -right-3 text-slate-400 font-mono text-[10px] select-none print:hidden">┘</div>
              </div>

              {/* Bottom Paper Info & Color Calibration Bars */}
              <div className="pt-3 px-1 flex flex-col sm:flex-row items-center justify-between gap-2 text-[9px] text-slate-500 dark:text-zinc-500 font-mono print:hidden select-none">
                <div className="flex items-center gap-1">
                  <span>CMYK CALIBRATION:</span>
                  <div className="flex gap-0.5">
                    <span className="w-2.5 h-2.5 bg-cyan-500 inline-block" />
                    <span className="w-2.5 h-2.5 bg-pink-500 inline-block" />
                    <span className="w-2.5 h-2.5 bg-yellow-400 inline-block" />
                    <span className="w-2.5 h-2.5 bg-black inline-block" />
                  </div>
                </div>

                <span>ISO 216 STANDARD A4 (210 × 297 mm) • VMOVEXA DOOH BILLING</span>

                <span>+ 297 mm</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDesignerPage;
