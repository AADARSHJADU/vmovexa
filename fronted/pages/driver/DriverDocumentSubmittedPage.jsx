import { useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useLocation } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { useDriverApp } from '../../hooks/driver/useDriverApp';

export const DriverDocumentSubmittedPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { documents: documentsRaw, loadDocuments } = useDriverApp();

  useEffect(() => {
    loadDocuments().catch(() => {});
  }, [loadDocuments]);

  const rawList = Array.isArray(documentsRaw)
    ? documentsRaw
    : (documentsRaw?.documents || documentsRaw?.items || documentsRaw?.rows || []);

  const latestDoc = rawList.length > 0 ? rawList[0] : null;

  const data = location.state || (latestDoc ? {
    docName: latestDoc.doc_name || latestDoc.name || 'Submitted Document',
    fileName: latestDoc.file_name || latestDoc.fileName || 'Attached File',
    fileSize: latestDoc.file_size || latestDoc.fileSize || '—',
    validTill: latestDoc.valid_until || latestDoc.validTill || '—',
  } : null);

  return (
    <div className="w-full max-w-xl mx-auto py-8 sm:py-12 space-y-6 animate-in fade-in zoom-in-95 duration-200 text-center">
      <div className="flex justify-start">
        <Breadcrumb
          items={[
            { label: t('ag.driver.driverdocumentsubmittedpage.driver', 'Driver'), path: '/driver/dashboard' },
            { label: t('ag.driver.driverdocumentsubmittedpage.documents', 'Documents'), path: '/driver/documents' },
            { label: t('ag.driver.driverdocumentsubmittedpage.document_submission', 'Document Submission') },
          ]}
          className="mb-2"
        />
      </div>

      {/* Green Checkmark */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
        <FleetIcons.Check className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2.5]" />
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {t('driver.docs.uploaded_success', 'Document Received')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1.5 max-w-sm mx-auto">
          {t('ag.driver.driverdocumentsubmittedpage.your_document_has_been_received_and_queued_f', 'Your document has been received and queued for compliance officer verification.')}
        </p>
      </div>

      {/* Summary Card if real data exists */}
      {data ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm text-left space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                {t('driver.docs.type_label', 'Document Category')}
              </span>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {data.docName || '—'}
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-lg">
              {t('ag.driver.driverdocumentsubmittedpage.under_review', 'Under Review')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 dark:text-zinc-500 text-[11px] font-medium">{t('driver.docs.attached_file', 'Attached File')}</span>
              <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 truncate" title={data.fileName || ''}>
                {data.fileName || '—'}
              </div>
            </div>
            <div>
              <span className="text-slate-400 dark:text-zinc-500 text-[11px] font-medium">{t('driver.docs.file_size', 'File Size')}</span>
              <div className="font-bold text-slate-800 dark:text-zinc-200 mt-0.5">{data.fileSize || '—'}</div>
            </div>
            <div>
              <span className="text-slate-400 dark:text-zinc-500 text-[11px] font-medium">{t('driver.docs.valid_until', 'Valid Until')}</span>
              <div className="font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">{data.validTill || '—'}</div>
            </div>
            <div>
              <span className="text-slate-400 dark:text-zinc-500 text-[11px] font-medium">{t('driver.docs.submitted_on', 'Submission Date')}</span>
              <div className="font-bold text-slate-800 dark:text-zinc-200 mt-0.5">
                {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs text-slate-500 dark:text-zinc-400">
          {t('ag.driver.driverdocumentsubmittedpage.no_active_document_submission_details_found', 'No active document submission details found.')}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <Link
          to="/driver/documents"
          className="w-full py-3 bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-[#1C68FD]/25 transition-all block text-center active:scale-[0.99]"
        >
          {t('ag.driver.driverdocumentsubmittedpage.go_to_documents_roster', 'Go to Documents Roster')}
        </Link>
        <Link
          to="/driver/dashboard"
          className="w-full py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-all block text-center active:scale-[0.99]"
        >
          {t('ag.driver.driverdocumentsubmittedpage.go_to_dashboard', 'Go to Dashboard')}
        </Link>
      </div>
    </div>
  );
};

export default DriverDocumentSubmittedPage;
