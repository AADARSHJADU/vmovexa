import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { copyToClipboard } from '../../utils/clipboard';
import { IconCheckCircle, IconDocument, IconCalendar, IconScreen, IconUser, IconRupee } from '../../components/ui/CampaignIcons';

export const CampaignSuccessModal = ({
  isOpen = true,
  onClose,
  data,
  basePath = '/advertiser',
  onReset,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow || 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !data) return null;

  const campaignId = data.campaignCode || data.campaignId || 'CMP-NEW';
  const dbId = data.dbId || (typeof data.campaignId === 'number' ? data.campaignId : null);
  const campaignName = data.campaignName || 'Campaign';
  const clientName = data.clientName || '';
  const clientPhone = data.clientPhone || '';
  const budget = data.budget;
  const durationDays = data.durationDays || (data.startDate && data.endDate ? Math.max(1, Math.round((new Date(data.endDate) - new Date(data.startDate)) / (1000 * 60 * 60 * 24)) + 1) : null);
  const startDate = data.startDate || '';
  const endDate = data.endDate || '';
  const totalScreens = data.totalScreens || 0;

  const submittedAt = data.submittedAt || new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleCopy = async () => {
    const ok = await copyToClipboard(String(campaignId));
    if (ok) {
      setCopied(true);
      toast.success('Campaign code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy code');
    }
  };

  const modalMarkup = (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950/80 dark:bg-black/85 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="min-h-full flex items-center justify-center">
        {/* Modal Popup Window — Fully Responsive, Centered, Scrollable Standard Modal */}
        <div
          className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] max-h-[90dvh] my-auto animate-in zoom-in-95 duration-200 overflow-hidden text-left"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Dismiss / Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Scrollable Body Container */}
          <div className="overflow-y-auto min-h-0 flex-1 p-5 sm:p-6 space-y-4 text-center overscroll-contain scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-zinc-700">
            {/* Animated Checkmark Icon */}
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 shadow-xs">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Heading */}
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Campaign Submitted Successfully!
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Your DOOH transit campaign has been registered and submitted for SuperAdmin verification review.
              </p>
            </div>

            {/* Details Box */}
            <div className="bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 sm:p-4 text-left space-y-2.5 text-xs">
              {/* Campaign ID */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Campaign Code</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-black text-blue-700 dark:text-blue-400">{campaignId}</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="text-[10px] font-bold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-700 px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <IconCheckCircle className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <IconDocument className="w-2.5 h-2.5 text-slate-500 dark:text-zinc-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Campaign Title */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Campaign Title</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[240px]" title={campaignName}>
                  {campaignName}
                </span>
              </div>

              {/* Client / Brand */}
              {clientName && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-1">
                    <IconUser className="w-3 h-3 text-slate-400" />
                    <span>Customer / Brand</span>
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate max-w-[240px]">
                    {clientName} {clientPhone ? `(${clientPhone})` : ''}
                  </span>
                </div>
              )}

              {/* Flight Schedule */}
              {startDate && endDate && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-1">
                    <IconCalendar className="w-3 h-3 text-slate-400" />
                    <span>Flight Schedule</span>
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                    {durationDays ? `${durationDays} Days · ` : ''}{startDate} ➔ {endDate}
                  </span>
                </div>
              )}

              {/* DOOH Screens */}
              {totalScreens > 0 && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-1">
                    <IconScreen className="w-3 h-3 text-slate-400" />
                    <span>DOOH Screens</span>
                  </span>
                  <span className="text-xs font-bold text-purple-700 dark:text-purple-400">
                    {totalScreens} Transit Screens Booked
                  </span>
                </div>
              )}

              {/* Flight Investment */}
              {budget !== undefined && budget !== null && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-1">
                    <IconRupee className="w-3 h-3 text-slate-400" />
                    <span>Flight Investment</span>
                  </span>
                  <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400">
                    ₹ {Number(budget).toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              {/* Submitted On */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Submitted On</span>
                <span className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">{submittedAt}</span>
              </div>

              {/* Current Status */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-zinc-800/60">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Current Status</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 text-[10px] font-bold uppercase tracking-wider">
                  ● SuperAdmin Review
                </span>
              </div>
            </div>

            {/* Guidance Notice Box */}
            <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 text-left">
              <p className="text-xs text-blue-950 dark:text-blue-300 leading-relaxed font-medium">
                💡 <strong className="font-bold">Next Step:</strong> Upon SuperAdmin compliance approval, the secure payment checkout link will be automatically dispatched to the customer via SMS &amp; Email.
              </p>
            </div>
          </div>

          {/* Action CTAs (Sticky Footer Bar) */}
          <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-zinc-900/90 border-t border-slate-100 dark:border-zinc-800 shrink-0 flex flex-col sm:flex-row items-center gap-2">
            {dbId ? (
              <Link
                to={`${basePath}/campaigns/${dbId}`}
                className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View Campaign Details</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            ) : null}

            <Link
              to={`${basePath}/campaigns`}
              className={`w-full ${dbId ? 'sm:w-auto' : 'sm:flex-1'} py-2.5 px-3.5 rounded-xl bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer`}
            >
              <span>All Campaigns</span>
            </Link>

            <button
              type="button"
              onClick={onReset || onClose}
              className="w-full sm:w-auto py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
            >
              + New Campaign
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalMarkup, document.body) : null;
};

export const CampaignSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isSuperAdmin = location.pathname.startsWith('/superadmin');
  const portalSegment = location.pathname.includes('/government/') ? 'government' : 'advertiser';
  const basePath = isSuperAdmin ? `/superadmin/${portalSegment}` : `/${portalSegment}`;

  const data = {
    campaignId: location.state?.campaignCode || location.state?.campaignId || 'CMP-NEW',
    campaignCode: location.state?.campaignCode,
    dbId: location.state?.id || location.state?.dbId,
    campaignName: location.state?.campaignName || 'Campaign',
    clientName: location.state?.clientName || '',
    clientPhone: location.state?.clientPhone || '',
    budget: location.state?.budget,
    startDate: location.state?.startDate,
    endDate: location.state?.endDate,
    durationDays: location.state?.durationDays,
    totalScreens: location.state?.totalScreens,
  };

  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center">
      <CampaignSuccessModal
        isOpen={true}
        data={data}
        basePath={basePath}
        onClose={() => navigate(`${basePath}/campaigns`)}
        onReset={() => navigate(`${basePath}/campaigns/create`)}
      />
    </div>
  );
};

export default CampaignSuccessPage;
