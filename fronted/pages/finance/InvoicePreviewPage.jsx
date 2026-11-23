import { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFinanceRole } from '../../hooks/finance/useFinanceRole';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { InvoiceSheet } from '../../components/finance/InvoiceSheet';

export const InvoicePreviewPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/finance' : '/finance';
  const { id } = useParams();
  const {
    currentInvoice,
    loadInvoice,
    loadInvoiceHtml,
    loadInvoices,
    resetCurrentInvoice,
    markInvoicePaid,
    settings,
    loadSettings,
    canManageInvoices,
    canUpdateInvoices,
  } = useFinanceRole();
  const canMarkPaid = canManageInvoices || canUpdateInvoices;

  const [loadedId, setLoadedId] = useState(null);
  const [invoiceHtml, setInvoiceHtml] = useState('');
  const [htmlFailed, setHtmlFailed] = useState(false);
  const [iframeHeight, setIframeHeight] = useState(1120);
  const [containerWidth, setContainerWidth] = useState(860);
  const [mobileZoom, setMobileZoom] = useState('fit'); // 'fit' | '75' | '100'
  const [openingPdf, setOpeningPdf] = useState(false);
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
  const [paidPaymentMethod, setPaidPaymentMethod] = useState('bank_transfer');
  const [paidUtr, setPaidUtr] = useState('');
  const [markingPaid, setMarkingPaid] = useState(false);
  const iframeRef = useRef(null);
  const previewContainerRef = useRef(null);

  const DESKTOP_DOC_WIDTH = 860;

  useEffect(() => {
    loadSettings().catch(() => {});
  }, [loadSettings]);

  const fetchDocument = useCallback(
    async (targetId) => {
      if (!targetId) return;
      const [invRes, htmlRes] = await Promise.allSettled([
        loadInvoice(targetId),
        loadInvoiceHtml(targetId, { print: 'false', embed: 'true' }),
      ]);
      if (htmlRes.status === 'fulfilled' && htmlRes.value && htmlRes.value.trim()) {
        setInvoiceHtml(htmlRes.value);
        setHtmlFailed(false);
      } else {
        setInvoiceHtml('');
        setHtmlFailed(true);
      }
      return invRes;
    },
    [loadInvoice, loadInvoiceHtml]
  );

  useEffect(() => {
    let mounted = true;
    resetCurrentInvoice();
    if (id) {
      Promise.allSettled([
        loadInvoice(id),
        loadInvoiceHtml(id, { print: 'false', embed: 'true' }),
      ])
        .then(([, htmlRes]) => {
          if (!mounted) return;
          if (htmlRes.status === 'fulfilled' && htmlRes.value && htmlRes.value.trim()) {
            setInvoiceHtml(htmlRes.value);
            setHtmlFailed(false);
          } else {
            setInvoiceHtml('');
            setHtmlFailed(true);
          }
        })
        .finally(() => {
          if (mounted) setLoadedId(String(id));
        });
    }
    return () => {
      mounted = false;
      resetCurrentInvoice();
    };
  }, [id, loadInvoice, loadInvoiceHtml, resetCurrentInvoice]);

  const loading = Boolean(id) && loadedId !== String(id);

  const inv =
    currentInvoice &&
    (String(currentInvoice.id) === String(id) || String(currentInvoice.code) === String(id))
      ? currentInvoice
      : null;

  const syncIframeHeight = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc || !doc.body) return;
      const cardEl = doc.querySelector('.invoice-card');
      const measured = cardEl
        ? Math.ceil(cardEl.getBoundingClientRect().height) + 20
        : Math.ceil(doc.body.offsetHeight) + 20;
      const nextHeight = Math.max(measured, 700);
      setIframeHeight((prev) => (Math.abs(prev - nextHeight) > 2 ? nextHeight : prev));
    } catch {
      // ignore cross-origin restrictions
    }
  }, []);

  useEffect(() => {
    const updateWidth = () => {
      const el = previewContainerRef.current;
      const nextWidth = el ? (el.clientWidth || window.innerWidth) : (typeof window !== 'undefined' ? window.innerWidth : 860);
      setContainerWidth((prev) => (prev !== nextWidth ? nextWidth : prev));
    };
    updateWidth();
    let observer = null;
    if (typeof ResizeObserver !== 'undefined' && previewContainerRef.current) {
      observer = new ResizeObserver(updateWidth);
      observer.observe(previewContainerRef.current);
    }
    window.addEventListener('resize', updateWidth);
    return () => {
      window.removeEventListener('resize', updateWidth);
      if (observer) observer.disconnect();
    };
  }, [invoiceHtml]);

  const openPrintableInvoice = async () => {
    if (!inv?.id) {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.focus();
        iframeRef.current.contentWindow.print();
      } else {
        window.print();
      }
      return;
    }

    setOpeningPdf(true);
    const win = typeof window !== 'undefined' ? window.open('', '_blank') : null;
    try {
      const html = await loadInvoiceHtml(inv.id, { print: 'true' });
      if (win && html && html.trim()) {
        win.document.open();
        win.document.write(html);
        win.document.close();
        win.focus();
      } else {
        if (win) win.close();
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.focus();
          iframeRef.current.contentWindow.print();
        } else {
          window.print();
        }
      }
    } catch (err) {
      if (win) win.close();
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.focus();
        iframeRef.current.contentWindow.print();
      } else {
        toast.error(err?.message || 'Failed to open tax invoice PDF');
      }
    } finally {
      setOpeningPdf(false);
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
      await fetchDocument(inv.id).catch(() => {});
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
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 h-96"></div>
      </div>
    );
  }

  if (!inv) {
    return (
      <div className="w-full space-y-6 animate-in fade-in duration-200">
        <Breadcrumb
          items={[
            { label: basePath.startsWith('/superadmin') ? 'Super Admin' : 'Finance Portal', path: `${basePath}/dashboard` },
            { label: 'Tax Invoices', path: `${basePath}/invoices` },
            { label: `#${id}` },
          ]}
        />
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm space-y-3">
          <FleetIcons.Document className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {t('ag.finance.invoicepreviewpage.invoice', 'Invoice #')}{id} {t('ag.finance.invoicepreviewpage.not_found', 'Not Found')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
            {t('ag.finance.invoicepreviewpage.this_invoice_could_not_be_located_in_the_led', 'This invoice could not be located in the ledger. It may have been archived or removed.')}
          </p>
          <div className="pt-2">
            <Link
              to={`${basePath}/invoices`}
              className="px-4 py-2 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm inline-block"
            >
              {t('ag.finance.invoicepreviewpage.return_to_invoices_list', 'Return to Invoices List')}
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

  const recipientLabel = inv.customer_name || inv.organization?.name || '—';

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
      <div
        id="invoice-preview-action-bar"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4 print:hidden print-hidden no-print"
      >
        <div>
          <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {inv.code ?? '—'}
              </h1>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-md border capitalize ${
                  String(inv.status).toLowerCase() === 'paid'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                    : String(inv.status).toLowerCase() === 'overdue'
                    ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                }`}
              >
                {String(inv.status).toLowerCase() === 'issued' ? t('common.unpaid', 'Unpaid') : (inv.status ?? '—')}
              </span>
              {inv.type && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                    inv.type === 'ad_spend'
                      ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800'
                      : inv.type === 'saas_subscription'
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                  }`}
                >
                  {inv.type === 'ad_spend'
                    ? 'Ad Campaign'
                    : inv.type === 'saas_subscription'
                    ? 'SaaS Subscription'
                    : inv.type === 'psa_spend'
                    ? 'Government PSA'
                    : String(inv.type).replace(/_/g, ' ')}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
              {t('ag.finance.invoicepreviewpage.issued_to', 'Issued to')}{' '}
              <strong className="text-slate-800 dark:text-zinc-200">{recipientLabel}</strong>{' '}
              {t('ag.finance.invoicepreviewpage.on', 'on')} {formattedIssuedDate}
            </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
          {canMarkPaid && String(inv.status).toLowerCase() !== 'paid' && (
            <button
              type="button"
              onClick={() => setShowMarkPaidModal(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-initial"
            >
              <FleetIcons.Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{t('finance.invoice_preview.mark_as_paid')}</span>
            </button>
          )}
          <button
            type="button"
            disabled={openingPdf}
            onClick={openPrintableInvoice}
            title={`Print Certified Tax Invoice ${inv.code || ''}`}
            className="px-3.5 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 flex-1 sm:flex-initial"
          >
            <FleetIcons.Printer className="w-3.5 h-3.5 text-slate-600 dark:text-zinc-300" />
            <span>{t('common.print')}</span>
          </button>
          <button
            type="button"
            disabled={openingPdf}
            onClick={openPrintableInvoice}
            title={`Download & Generate PDF Tax Invoice ${inv.code || ''}`}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 flex-1 sm:flex-initial"
          >
            <FleetIcons.Download className="w-4 h-4" />
            <span>{t('common.download_pdf')}</span>
          </button>
        </div>
      </div>

      {/* Exact Same Certified GST Tax Invoice Document as /admin/billing PDF (proportionally scaled & scrollable on mobile) */}
      {invoiceHtml && !htmlFailed ? (
        (() => {
          const isCompactViewport = containerWidth > 0 && containerWidth < DESKTOP_DOC_WIDTH;
          const fitScale = isCompactViewport ? Math.min(1, Math.max(0.32, (containerWidth - 4) / DESKTOP_DOC_WIDTH)) : 1;
          const activeScale = !isCompactViewport
            ? 1
            : mobileZoom === '100'
            ? 1
            : mobileZoom === '75'
            ? 0.75
            : fitScale;
          const scaledWidth = Math.ceil(DESKTOP_DOC_WIDTH * activeScale);
          const scaledHeight = Math.ceil(iframeHeight * activeScale);

          return (
            <div ref={previewContainerRef} className="w-full py-2 space-y-2.5">
              {isCompactViewport && (
                <div className="flex items-center justify-between gap-2 px-1 print:hidden no-print">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                    {mobileZoom === 'fit'
                      ? 'Fitted to screen · Scroll vertically'
                      : 'Scroll horizontally & vertically to inspect'}
                  </span>
                  <div className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-zinc-800 rounded-lg border border-slate-200 dark:border-zinc-700">
                    {[
                      { id: 'fit', label: 'Fit' },
                      { id: '75', label: '75%' },
                      { id: '100', label: '100%' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setMobileZoom(opt.id)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                          mobileZoom === opt.id
                            ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div
                className="w-full overflow-x-auto overflow-y-auto rounded-2xl"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                <div
                  className="mx-auto relative"
                  style={{
                    width: `${scaledWidth}px`,
                    height: `${scaledHeight}px`,
                  }}
                >
                  <iframe
                    ref={iframeRef}
                    title={`Tax Invoice ${inv.code || inv.id}`}
                    srcDoc={invoiceHtml}
                    onLoad={() => {
                      syncIframeHeight();
                      setTimeout(syncIframeHeight, 300);
                    }}
                    style={{
                      width: `${DESKTOP_DOC_WIDTH}px`,
                      height: `${iframeHeight}px`,
                      transform: activeScale < 1 ? `scale(${activeScale})` : 'none',
                      transformOrigin: 'top left',
                    }}
                    className="border-0 bg-transparent block overflow-hidden"
                    scrolling="no"
                  />
                </div>
              </div>
            </div>
          );
        })()
      ) : (
        <InvoiceSheet invoice={inv} settings={settings} />
      )}

      {/* Mark Paid Modal */}
      {showMarkPaidModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 print:hidden print-hidden no-print">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {t('ag.finance.invoicepreviewpage.record_payment_for', 'Record Payment for')} {inv.code}
              </h3>
              <button
                type="button"
                onClick={() => setShowMarkPaidModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <FleetIcons.Close className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleConfirmMarkPaid} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">
                  {t('finance.invoice_preview.invoice_amount')}
                </label>
                <div className="text-lg font-black text-slate-900 dark:text-white font-mono">
                  ₹{Number(inv.total || 0).toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">
                  {t('finance.invoice_preview.payment_method')}
                </label>
                <select
                  value={paidPaymentMethod}
                  onChange={(e) => setPaidPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-medium focus:bg-white dark:focus:bg-zinc-800 focus:outline-blue-600"
                >
                  <option value="bank_transfer">{t('finance.invoice_preview.bank_transfer')}</option>
                  <option value="upi">{t('finance.invoice_preview.upi_qr')}</option>
                  <option value="cheque">{t('finance.invoice_preview.cheque')}</option>
                  <option value="cash">{t('finance.invoice_preview.cash_petty')}</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">
                  {t('finance.invoice_preview.utr_optional')}
                </label>
                <input
                  type="text"
                  placeholder={t('finance.invoice_preview.ph_utr')}
                  value={paidUtr}
                  onChange={(e) => setPaidUtr(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-medium focus:bg-white dark:focus:bg-zinc-800 focus:outline-blue-600"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMarkPaidModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {t('ag.finance.invoicepreviewpage.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={markingPaid}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
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
