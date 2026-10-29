import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FleetIcons } from '../FleetIcons';
import billingService from '../../api/services/billing.service';
import { storage } from '../../utils/storage';

/**
 * Reusable GST Tax Invoice Download & Print Action Component.
 * Can be embedded anywhere across Admin, SuperAdmin, Finance, and Advertiser portals.
 *
 * @param {object} props
 * @param {object|string|number} [props.invoice] - Invoice object (with id/code) or numeric/string ID
 * @param {string|number} [props.invoiceId] - Direct invoice ID fallback
 * @param {'button'|'compact'|'icon'|'link'} [props.variant='button'] - Button presentation style
 * @param {'blue'|'emerald'|'zinc'|'outline'} [props.color='blue'] - Color scheme
 * @param {string} [props.label] - Custom button label
 * @param {boolean} [props.directPrint=true] - Auto-open browser print dialog on load
 * @param {string} [props.className] - Additional Tailwind classes
 */
export const InvoiceDownloadButton = ({
  invoice,
  invoiceId,
  variant = 'button',
  color = 'blue',
  label,
  directPrint = true,
  className = '',
  title,
}) => {
  const [loading, setLoading] = useState(false);

  const resolvedId = invoice?.numericId || invoice?.poReference || invoice?.id || invoiceId;
  const invoiceCode = invoice?.code || invoice?.id || (resolvedId ? `#INV-${resolvedId}` : '');

  const handleDownload = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!resolvedId) {
      toast.error('Invalid invoice reference');
      return;
    }

    setLoading(true);
    try {
      await billingService.openInvoice(resolvedId, { print: directPrint });
      toast.success(
        directPrint
          ? `Opening ${invoiceCode || 'invoice'} print dialog...`
          : `Loading ${invoiceCode || 'invoice'}...`,
        { id: `inv-${resolvedId}`, duration: 2500 }
      );
    } catch (err) {
      try {
        const token = storage.getAccessToken();
        const url = billingService.getInvoiceHtmlUrl(resolvedId, { print: directPrint, token });
        window.open(url, '_blank', 'noopener,noreferrer');
      } catch (_) {
        toast.error(err?.message || 'Failed to open tax invoice');
      }
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  const getButtonColorClasses = () => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20';
      case 'zinc':
        return 'bg-zinc-800 hover:bg-zinc-900 text-white dark:bg-zinc-700 dark:hover:bg-zinc-600 shadow-sm';
      case 'outline':
        return 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 shadow-sm';
      case 'blue':
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20';
    }
  };

  const defaultLabel = label || 'Download PDF';

  // Variant: Icon Only (ideal for table rows)
  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleDownload}
        disabled={loading || !resolvedId}
        title={title || `Download & Print Tax Invoice ${invoiceCode}`}
        aria-label={title || `Download Tax Invoice ${invoiceCode}`}
        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-zinc-400 dark:hover:text-blue-400 dark:hover:bg-blue-950/40 border border-transparent hover:border-blue-200 dark:hover:border-blue-800/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        ) : (
          <FleetIcons.Download className="w-4 h-4" />
        )}
      </button>
    );
  }

  // Variant: Compact Pill (for lists or secondary cards)
  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleDownload}
        disabled={loading || !resolvedId}
        title={title || `Download GST Tax Invoice ${invoiceCode}`}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700/80 transition-all shadow-xs disabled:opacity-50 ${className}`}
      >
        {loading ? (
          <span className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        ) : (
          <FleetIcons.Printer className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        )}
        <span>{defaultLabel}</span>
      </button>
    );
  }

  // Variant: Inline Link
  if (variant === 'link') {
    return (
      <button
        type="button"
        onClick={handleDownload}
        disabled={loading || !resolvedId}
        className={`inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline disabled:opacity-50 ${className}`}
      >
        <FleetIcons.Download className="w-3.5 h-3.5" />
        <span>{defaultLabel}</span>
      </button>
    );
  }

  // Variant: Standard Button (default)
  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading || !resolvedId}
      title={title || `Download & Print Certified Tax Invoice ${invoiceCode}`}
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${getButtonColorClasses()} ${className}`}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <FleetIcons.Download className="w-3.5 h-3.5" />
      )}
      <span>{defaultLabel}</span>
    </button>
  );
};

export default InvoiceDownloadButton;
