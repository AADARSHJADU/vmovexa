/* Local loading/form state is intentionally synchronized from remote route data. */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFinanceRole } from '../../hooks/finance/useFinanceRole';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { InvoiceSheet } from '../../components/finance/InvoiceSheet';
import billingService from '../../api/services/billing.service';

export const InvoicePreviewPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/finance' : '/finance';
  const { id } = useParams();
  const { invoices, currentInvoice, loadInvoice, loadInvoices, markInvoicePaid, settings, loadSettings, canManageInvoices, canUpdateInvoices } = useFinanceRole();
  const canMarkPaid = canManageInvoices || canUpdateInvoices;

  const [loading, setLoading] = useState(false);
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
  const [paidPaymentMethod, setPaidPaymentMethod] = useState('bank_transfer');
  const [paidUtr, setPaidUtr] = useState('');
  const [markingPaid, setMarkingPaid] = useState(false);

  useEffect(() => {
    loadSettings().catch(() => {});
  }, [loadSettings]);

  useEffect(() => {
    let mounted = true;
    if (id) {
      setLoading(true);
      loadInvoice(id)
        .catch(() => {})
        .finally(() => {
          if (mounted) setLoading(false);
        });
    }
    return () => {
      mounted = false;
    };
  }, [id, loadInvoice]);

  const invoiceList = Array.isArray(invoices) ? invoices : (invoices?.items || invoices?.rows || []);
  const inv = currentInvoice || invoiceList.find((i) => String(i.id) === String(id) || String(i.code) === String(id));

  const handlePrint = async () => {
    if (inv?.id) {
      await billingService.openInvoice(inv.id, { print: true });
    } else {
      window.print();
    }
  };

  const handleDownloadPdf = async () => {
    if (inv?.id) {
      await billingService.openInvoice(inv.id, { print: true });
    } else {
      window.print();
    }
  };

  const handleConfirmMarkPaid = async (e) => {
    e.preventDefault();
    if (!inv?.id) return;
    setMarkingPaid(true);
    try {
      await toast.promise(
        markInvoicePaid(inv.id, {
          paymentMethod: paidPaymentMethod,
          transactionRef: paidUtr.trim() || undefined,
        }),
        {
          loading: 'Recording payment...',
          success: 'Invoice marked as paid!',
          error: (err) => err?.message || 'Failed to mark invoice as paid',
        }
      );
      setShowMarkPaidModal(false);
      await loadInvoice(inv.id).catch(() => {});
      await loadInvoices().catch(() => {});
    } catch {
      // toast already alerted
    } finally {
      setMarkingPaid(false);
    }
  };

  if (loading && !inv) {
    return (
      <div className="w-full space-y-6 animate-pulse p-2">
        <div className="flex items-center gap-3">
          <div className="w-28 h-9 rounded-xl bg-slate-200 dark:bg-zinc-800"></div>
          <div className="w-48 h-8 rounded-xl bg-slate-200 dark:bg-zinc-800"></div>
        </div>
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 h-96"></div>
      </div>
    );
  }

  if (!inv) {
    return (
      <div className="w-full space-y-6 animate-in fade-in duration-200">
        <div className="flex items-center gap-2">
          <Link
            to={`${basePath}/invoices`}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
          >
            ← Back to Invoices
          </Link>
        </div>
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm space-y-3">
          <FleetIcons.Document className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">Invoice #{id} Not Found</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
            This invoice could not be located in the ledger. It may have been archived or removed.
          </p>
          <div className="pt-2">
            <Link
              to={`${basePath}/invoices`}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm inline-block"
            >
              Return to Invoices List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formattedIssuedDate = inv.issued_at
    ? new Date(inv.issued_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : inv.created_at
    ? new Date(inv.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: basePath.startsWith('/superadmin') ? 'Super Admin' : 'Finance Portal', path: `${basePath}/dashboard` },
          { label: 'Tax Invoices', path: `${basePath}/invoices` },
          { label: inv.code ?? `Invoice #${id}` },
        ]}
        className="print:hidden print-hidden no-print"
      />

      {/* Header & Actions Bar */}
      <div id="invoice-preview-action-bar" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4 print:hidden print-hidden no-print">
        <div className="flex items-start sm:items-center gap-3">
          {/* Prominent Back Button */}
          <Link
            to={`${basePath}/invoices`}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 transition-all font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 shadow-2xs hover:shadow-xs active:scale-98"
            title={t('finance.invoice_preview.back_to_invoices')}
          >
            <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('finance.invoice_preview.back_to_invoices')}</span>
          </Link>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">{inv.code ?? '—'}</h1>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${
                  String(inv.status).toLowerCase() === 'paid'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : String(inv.status).toLowerCase() === 'overdue'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {inv.status ?? '—'}
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                inv.type === 'ad_spend'
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : inv.type === 'saas_subscription'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {inv.type === 'ad_spend' ? 'Ad Campaign' : inv.type === 'saas_subscription' ? 'SaaS Subscription' : (inv.type || 'Standard')}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
              Issued to <strong className="text-slate-800 dark:text-zinc-200">{inv.customer_name || inv.organization?.name || 'Client / Business Entity'}</strong> on {formattedIssuedDate}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
          {canMarkPaid && String(inv.status).toLowerCase() !== 'paid' && (
            <button
              onClick={() => setShowMarkPaidModal(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FleetIcons.Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{t('finance.invoice_preview.mark_as_paid')}</span>
            </button>
          )}
          <button
            onClick={handlePrint}
            title={`Print Certified Tax Invoice ${inv.code || ''}`}
            className="px-3.5 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FleetIcons.Printer className="w-3.5 h-3.5 text-slate-600 dark:text-zinc-300" />
            <span>{t('common.print')}</span>
          </button>
          <button
            onClick={handleDownloadPdf}
            title={`Download & Generate PDF Tax Invoice ${inv.code || ''}`}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <FleetIcons.Download className="w-4 h-4" />
            <span>{t('common.download_pdf')}</span>
          </button>
        </div>
      </div>

      {/* Official Tax Invoice Sheet rendered via dynamic designer template */}
      <InvoiceSheet invoice={inv} settings={settings} />

      {/* Mark Paid Modal */}
      {showMarkPaidModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 print:hidden print-hidden no-print">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Record Payment for {inv.code}</h3>
              <button
                onClick={() => setShowMarkPaidModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <FleetIcons.Close className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleConfirmMarkPaid} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">{t('finance.invoice_preview.invoice_amount')}</label>
                <div className="text-lg font-black text-slate-900 font-mono">
                  ₹{Number(inv.total || 0).toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">{t('finance.invoice_preview.payment_method')}</label>
                <select
                  value={paidPaymentMethod}
                  onChange={(e) => setPaidPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-medium focus:bg-white focus:outline-blue-600"
                >
                  <option value="bank_transfer">{t('finance.invoice_preview.bank_transfer')}</option>
                  <option value="upi">{t('finance.invoice_preview.upi_qr')}</option>
                  <option value="cheque">{t('finance.invoice_preview.cheque')}</option>
                  <option value="cash">{t('finance.invoice_preview.cash_petty')}</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">{t('finance.invoice_preview.utr_optional')}</label>
                <input
                  type="text"
                  placeholder={t('finance.invoice_preview.ph_utr')}
                  value={paidUtr}
                  onChange={(e) => setPaidUtr(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-medium focus:bg-white focus:outline-blue-600"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMarkPaidModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={markingPaid}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  {markingPaid ? 'Recording…' : 'Confirm Payment Received'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
