/* eslint-disable react-hooks/set-state-in-effect -- local uploader state must track refreshed API documents. */
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { MultipleDocumentUploader } from '../../components/ui/MultipleDocumentUploader';
import { useDriverApp } from '../../hooks/driver/useDriverApp';
import { useAuth } from '../../hooks/useAuth';
import Breadcrumb from '../../components/ui/Breadcrumb';

export const DriverDocumentsPage = () => {
  const { t } = useTranslation();
  const { hasPermission } = useAuth();
  const canManageDocuments = hasPermission('drivers.documents.manage');
  const { documents: documentsRaw, loadDocuments, uploadDocument, deleteDocument, profile, loadProfile } = useDriverApp();
  const [driverFiles, setDriverFiles] = useState([]);

  useEffect(() => {
    Promise.all([
      loadProfile().catch(() => {}),
      loadDocuments().catch(() => {}),
    ]);
  }, [loadProfile, loadDocuments]);

  const rawList = useMemo(() => {
    if (Array.isArray(documentsRaw)) return documentsRaw;
    return documentsRaw?.documents || documentsRaw?.items || documentsRaw?.rows || [];
  }, [documentsRaw]);

  // Sync raw document rows from Redux to state
  useEffect(() => {
    if (rawList.length > 0) {
      const formatted = rawList.map((d) => ({
        id: d.id,
        name: d.file_name || d.doc_name || 'Document',
        category: d.doc_name || d.doc_type || 'Identity & KYC',
        url: d.file_url || d.preview_url,
        size: d.file_size,
        type: d.file_type || 'application/pdf',
        verified: Boolean(d.verified),
        uploadedAt: d.uploaded_on || d.createdAt,
      }));
      setDriverFiles(formatted);
    } else {
      setDriverFiles([]);
    }
  }, [rawList]);

  const handleDocsChanged = async (newDocs) => {
    if (!canManageDocuments) {
      toast.error('Document-management permission is required.');
      return;
    }
    setDriverFiles(newDocs);

    // 1. Detect removed documents (in rawList but missing from newDocs)
    const removedDocs = rawList.filter(
      (od) => !newDocs.some((nd) => (nd.id && String(nd.id) === String(od.id)) || (nd.url && (nd.url === od.file_url || nd.url === od.preview_url)))
    );

    if (removedDocs.length > 0) {
      for (const item of removedDocs) {
        if (item.id) {
          try {
            await deleteDocument(item.id);
          } catch (err) {
            console.error('Failed to delete document from server:', err);
            toast.error(err?.message || `Failed to remove ${item.doc_name || 'document'}`);
          }
        }
      }
      loadDocuments().catch(() => {});
      loadProfile().catch(() => {});
    }

    // 2. Detect newly added documents (in newDocs but missing from rawList)
    const newlyAdded = newDocs.filter(
      (nd) => !rawList.some((od) => (od.id && String(od.id) === String(nd.id)) || ((od.file_url || od.preview_url) && (od.file_url === nd.url || od.preview_url === nd.url)))
    );

    if (newlyAdded.length > 0) {
      for (const item of newlyAdded) {
        try {
          const docType =
            (item.category || '').toLowerCase().includes('dl') ? 'dl' :
            (item.category || '').toLowerCase().includes('identity') ? 'aadhaar' :
            (item.category || '').toLowerCase().includes('medical') ? 'medical' :
            (item.category || '').toLowerCase().includes('contract') ? 'insurance' :
            (item.category || '').toLowerCase().includes('training') ? 'training' : 'other';

          await uploadDocument({
            docName: item.category || item.name || 'Document',
            docType,
            fileUrl: item.url,
            fileName: item.name,
            fileSize: String(item.size || ''),
            fileType: item.type,
          });
          toast.success(`"${item.category || item.name}" submitted for verification!`);
        } catch (err) {
          console.error('Failed to sync document:', err);
          toast.error(err?.message || `Failed to save ${item.category || 'document'}`);
        }
      }
      loadDocuments().catch(() => {});
      loadProfile().catch(() => {});
    }
  };

  const shift = profile?.active_shift || profile?.activeShift || profile?.shift || '—';
  const rejectionReason =
    profile?.rejection_reason ||
    profile?.rejectionReason ||
    (profile?.notes && profile?.notes.match(/\[Rejection Reason\]:\s*([^\n\r]+)/i)?.[1]?.trim()) ||
    null;
  const isRejected = Boolean(profile?.kyc_rejected || profile?.kycRejected || rejectionReason || (profile?.status || '').toLowerCase() === 'rejected');
  const isVerified = !isRejected && Boolean(profile?.documents_verified || profile?.aadhaar_verified);
  const dlNum = profile?.dl_number || profile?.dlNumber || '—';
  const dlExp = profile?.dl_expiry || profile?.dlExpiry || '—';
  const dlStat = profile?.dl_status || profile?.dlStatus || '—';
  const bus =
    profile?.assignedBus?.bus_number ||
    profile?.assigned_bus_number ||
    profile?.assignedBusNumber ||
    (profile?.assigned_bus_id ? `Bus #${profile?.assigned_bus_id}` : 'Unassigned');

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-zinc-800 pb-4">
        <Breadcrumb
          items={[
            { label: 'Driver', path: '/driver/dashboard' },
            { label: 'Driver Documents' },
          ]}
          className="mb-2"
        />
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span>{t('driver.docs.title')}</span>
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase border ${
                isRejected
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                  : isVerified
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
              }`}
            >
              {isRejected ? 'Verification Rejected' : isVerified ? 'Verified' : 'Verification Pending'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
            Manage commercial driving license, government verification, insurance, and medical clearances
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
        {/* Driver Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700 rounded-xl space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('driver.docs.dl_no')}</span>
            <div className="text-base font-mono font-bold text-slate-900 dark:text-white">{dlNum}</div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('driver.docs.dl_desc')}</p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700 rounded-xl space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{t('driver.docs.assigned_bus')}</span>
            <div className="text-base font-bold text-blue-700 dark:text-blue-400">{bus}</div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('driver.docs.assigned_bus_desc')}</p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700 rounded-xl space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{t('driver.docs.active_shift')}</span>
            <div className="text-base font-bold text-emerald-700 dark:text-emerald-400">{shift}</div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('driver.docs.shift_desc')}</p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700 rounded-xl space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">{t('driver.docs.dl_status')}</span>
            <div className="text-base font-bold text-amber-700 dark:text-amber-400 uppercase">{dlStat}</div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">Expires: {dlExp}</p>
          </div>
        </div>

        {/* Detailed Info Summary Banner */}
        <div className="border border-slate-200 dark:border-zinc-700 rounded-2xl p-5 space-y-3 bg-slate-50/50 dark:bg-zinc-800/30">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-zinc-700 pb-2">
            Commercial Heavy Vehicle Driving License & Verification Status
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase">{t('driver.docs.serial_no')}</span>
              <div className="font-mono font-bold text-slate-900 dark:text-white text-sm mt-0.5">{dlNum}</div>
            </div>
            <div>
              <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase">{t('driver.docs.dl_expiry')}</span>
              <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{dlExp}</div>
            </div>
            <div>
              <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase">{t('driver.docs.verification_status')}</span>
              <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 flex items-center gap-1.5">
                {isVerified ? (
                  <>
                    <FleetIcons.Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 inline" />
                    <span>{t('driver.docs.verified_compliance')}</span>
                  </>
                ) : (
                  <span>{t('driver.docs.pending_compliance')}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Rejection Notice Banner */}
        {isRejected && (
          <div className="p-4 sm:p-5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-start gap-3.5 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-800 mt-0.5">
              <FleetIcons.Close className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-rose-900 dark:text-rose-300">
                  Documents Verification Rejected
                </h3>
                <p className="text-xs text-rose-700 dark:text-rose-400 font-medium mt-0.5">
                  Your submitted KYC documents were rejected by the administrator. Please review the reason below, update your documents, and re-upload them.
                </p>
              </div>
              {rejectionReason && (
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-rose-200 dark:border-rose-900/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block">
                    Rejection Reason:
                  </span>
                  <p className="text-xs font-bold text-rose-950 dark:text-rose-200 mt-1 whitespace-pre-wrap font-mono">
                    {rejectionReason}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Multi-Document Attachments Component */}
        <MultipleDocumentUploader
          documents={driverFiles}
          onChange={handleDocsChanged}
          title={t('driver.docs.attachments_title')}
          purpose="driver_kyc"
          isLocked={isVerified || !canManageDocuments}
          allowToggleVerify={false}
          allowRemoveVerified={isRejected || !isVerified}
        />
      </div>
    </div>
  );
};

export default DriverDocumentsPage;

