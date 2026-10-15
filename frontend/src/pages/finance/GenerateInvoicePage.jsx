import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFinanceRole } from '../../hooks/finance/useFinanceRole';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';

export const GenerateInvoicePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/finance' : '/finance';
  const { generateInvoice, loadInvoices } = useFinanceRole();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    customerName: '',
    gstin: '',
    billingAddress: '',
    poReference: '',
    dueDate: '',
    placeOfSupply: '27-Maharashtra',
    deliveryTerms: '',
    items: [
      { id: 1, desc: '', qty: 1, rate: 0 },
    ],
  });

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { id: Date.now(), desc: '', qty: 1, rate: 0 }],
    });
  };

  const removeItem = (id) => {
    if (formData.items.length === 1) return;
    setFormData({
      ...formData,
      items: formData.items.filter((item) => item.id !== id),
    });
  };

  const updateItem = (id, field, value) => {
    setFormData({
      ...formData,
      items: formData.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    });
  };

  const subtotal = formData.items.reduce((acc, curr) => acc + (Number(curr.rate) * Number(curr.qty) || 0), 0);
  const cgst = subtotal * 0.09;
  const sgst = subtotal * 0.09;
  const grandTotal = subtotal + cgst + sgst;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerName.trim()) {
      toast.error('Customer name is required');
      setCurrentStep(1);
      return;
    }
    const items = formData.items
      .map((it) => ({ desc: String(it.desc || '').trim(), qty: Math.max(1, parseInt(it.qty, 10) || 1), rate: Number(it.rate) || 0 }))
      .filter((it) => it.desc);
    if (items.length === 0) {
      toast.error('Add at least one line item');
      setCurrentStep(2);
      return;
    }

    const payload = {
      customerName: formData.customerName.trim(),
      gstin: formData.gstin || undefined,
      billingAddress: formData.billingAddress || undefined,
      poReference: formData.poReference || undefined,
      dueDate: formData.dueDate || undefined,
      placeOfSupply: formData.placeOfSupply || undefined,
      deliveryTerms: formData.deliveryTerms || undefined,
      type: 'ad_spend',
      payerType: 'advertiser',
      items,
    };

    setSubmitting(true);
    try {
      const created = await toast.promise(generateInvoice(payload), {
        loading: 'Issuing invoice…',
        success: 'Invoice generated',
        error: (err) => err?.message || 'Failed to generate invoice',
      });
      await loadInvoices().catch(() => {});
      if (created?.id) {
        navigate(`${basePath}/invoices/${created.id}`);
      } else {
        navigate(`${basePath}/invoices`);
      }
    } catch {
      // toast already surfaced the error
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: basePath.startsWith('/superadmin') ? 'Super Admin' : 'Finance Portal', path: `${basePath}/dashboard` },
              { label: 'Tax Invoices', path: `${basePath}/invoices` },
              { label: 'Generate Invoice' },
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('finance.generate_tax_invoice', 'Generate Tax Invoice')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Create GST compliant corporate tax billing with automated tax calculations
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full self-start sm:self-auto">
          Step {currentStep} of 4
        </span>
      </div>

      {/* Stepper Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { step: 1, title: 'Customer Details', desc: 'Party Info' },
            { step: 2, title: 'Billed Line Items', desc: 'Itemization' },
            { step: 3, title: 'Taxes & Terms', desc: 'GST & Due Date' },
            { step: 4, title: 'Review & Issue', desc: 'Dispatch' },
          ].map((s) => (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              className={`p-2.5 rounded-xl text-left transition-all flex items-center gap-3 ${
                currentStep === s.step
                  ? 'bg-slate-900 text-white shadow-sm'
                  : currentStep > s.step
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  currentStep === s.step
                    ? 'bg-white text-slate-900'
                    : currentStep > s.step
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {currentStep > s.step ? <FleetIcons.Check className="w-3.5 h-3.5 text-white" /> : s.step}
              </div>
              <div className="min-w-0 truncate">
                <div className="text-xs font-bold truncate leading-tight">{s.title}</div>
                <div className="text-[10px] opacity-80 truncate hidden sm:block">{s.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: CUSTOMER DETAILS */}
      {currentStep === 1 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">1. Customer & Billed Party Info</h2>
            <p className="text-xs text-slate-500 font-medium">{t('finance.sec1_sub', 'Recipient advertiser corporate registration')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('finance.customer_company_name', 'Customer / Company Name *')}</label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('finance.client_gstin', 'Client GSTIN *')}</label>
              <input
                type="text"
                required
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('finance.po_wo_ref', 'PO / Work Order Ref')}</label>
              <input
                type="text"
                value={formData.poReference}
                onChange={(e) => setFormData({ ...formData, poReference: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('finance.billing_address_req', 'Billing Address *')}</label>
              <textarea
                rows={2}
                value={formData.billingAddress}
                onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Next: Add Line Items →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: LINE ITEMS */}
      {currentStep === 2 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">2. Billed Line Items</h2>
              <p className="text-xs text-slate-500 font-medium">{t('finance.sec2_sub', 'Specify campaign services and rates')}</p>
            </div>
            <button
              type="button"
              onClick={addItem}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold transition-colors"
            >
              + Add Item
            </button>
          </div>

          <div className="space-y-3">
            {formData.items.map((item, idx) => (
              <div key={item.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Item #{idx + 1}</span>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-xs text-red-600 hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <FleetIcons.Trash className="w-3.5 h-3.5 text-red-600" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Item Description</label>
                  <input
                    type="text"
                    value={item.desc}
                    onChange={(e) => updateItem(item.id, 'desc', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={item.qty}
                      onChange={(e) => updateItem(item.id, 'qty', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Unit Rate (₹)</label>
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) => updateItem(item.id, 'rate', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Total</label>
                    <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-black text-slate-900">
                      ₹{(Number(item.qty) * Number(item.rate) || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-100 rounded-xl text-right text-xs">
            <span className="text-slate-500 font-medium mr-2">{t('finance.taxable_subtotal', 'Taxable Subtotal:')}</span>
            <span className="text-base font-black text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Next: Taxes & Terms →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: TAXES & TERMS */}
      {currentStep === 3 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">3. Tax Governance & Terms of Delivery</h2>
            <p className="text-xs text-slate-500 font-medium">{t('finance.sec3_sub', 'State tax jurisdiction and settlement conditions')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('finance.place_of_supply', 'Place of Supply *')}</label>
              <select
                value={formData.placeOfSupply}
                onChange={(e) => setFormData({ ...formData, placeOfSupply: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value="27-Maharashtra">27 - Maharashtra (CGST 9% + SGST 9%)</option>
                <option value="23-Madhya Pradesh">23 - Madhya Pradesh (IGST 18%)</option>
                <option value="07-Delhi">07 - Delhi (IGST 18%)</option>
                <option value="29-Karnataka">29 - Karnataka (IGST 18%)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('finance.payment_terms_due', 'Payment Terms & Due Date *')}</label>
              <input
                type="text"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('finance.delivery_terms', 'Service Delivery / Provisioning Terms')}</label>
              <input
                type="text"
                value={formData.deliveryTerms}
                onChange={(e) => setFormData({ ...formData, deliveryTerms: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Tax Calculation Box */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">{t('finance.taxable_value', 'Taxable Value:')}</span>
              <span className="font-bold text-slate-800">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t('finance.cgst_9', 'CGST (9%):')}</span>
              <span className="font-bold text-slate-800">₹{cgst.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t('finance.sgst_9', 'SGST (9%):')}</span>
              <span className="font-bold text-slate-800">₹{sgst.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200">
              <span className="font-bold text-slate-900">{t('finance.grand_total_label', 'Grand Total:')}</span>
              <span className="font-black text-blue-700 text-sm">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Next: Review & Issue →
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & ISSUE */}
      {currentStep === 4 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">{t('finance.review_before_dispatch', 'Review Tax Invoice Before Dispatch')}</h2>
            <p className="text-xs text-slate-500 font-medium">{t('finance.review_sub', 'Verify bill amounts and party information')}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-400">{t('finance.recipient_party', 'Recipient Party:')}</span>
              <span className="font-bold text-slate-900">{formData.customerName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-400">GSTIN:</span>
              <span className="font-mono font-bold text-slate-900">{formData.gstin}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-400">Place of Supply:</span>
              <span className="font-bold text-slate-800">{formData.placeOfSupply}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-400">Payment Due:</span>
              <span className="font-bold text-slate-800">{formData.dueDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{t('finance.final_invoice_total', 'Final Invoice Total:')}</span>
              <span className="font-black text-blue-700 text-sm">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors text-center"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FleetIcons.Check className="w-4 h-4" />
              <span>{submitting ? 'Issuing…' : 'Issue & Dispatch Invoice'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
