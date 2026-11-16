import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import toast from 'react-hot-toast';
import { FleetIcons } from '../FleetIcons';
import { resolveFileUrl, uploadFile } from '../../api/services/upload.service';

export const MultipleDocumentUploader = ({
  documents = [],
  onChange,
  purpose = 'document',
  title = 'Uploaded Documents & Attachments',
  maxSizeMB = 10,
  readOnly = false,
  isLocked = false,
  allowToggleVerify = true,
  allowRemoveVerified = false,
  showVerifyStatus = true,
  categories: customCategories,
  categoryLabels = {},
  deferUpload = false,
}) => {
  const { t } = useTranslation();
  const categoryKeys = {"Identity & KYC":"superadmin.assignment_finance.identity_kyc","Driving License":"admin.drivers.driving_license","Depot Agreement & Contract":"superadmin.assignment_finance.depot_agreement_contract","Medical Certificate":"superadmin.assignment_finance.medical_certificate","Training & Safety":"superadmin.assignment_finance.training_safety","Other Certificate":"superadmin.assignment_finance.other_certificate"};
  const categoryLabel = value => categoryLabels[value] || (categoryKeys[value] ? t(categoryKeys[value], value) : value);
  const [uploading, setUploading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  const defaultCategories = [
    'Identity & KYC',
    'Driving License',
    'Depot Agreement & Contract',
    'Medical Certificate',
    'Training & Safety',
    'Other Certificate',
  ];

  const categories = customCategories && customCategories.length > 0 ? customCategories : defaultCategories;

  const [docCategory, setDocCategory] = useState(categories[0] || 'Identity & KYC');
  const fileInputRef = useRef(null);

  const isFullyLocked = readOnly || isLocked;

  const normalizeCategory = (cat) => {
    if (!cat) return '';
    const str = String(cat).toLowerCase().replace(/[^a-z0-9]/g, '');
    const matched = categories.find((c) => c.toLowerCase().replace(/[^a-z0-9]/g, '') === str);
    if (matched) return matched;
    const partialMatch = categories.find((c) => {
      const cStr = c.toLowerCase().replace(/[^a-z0-9]/g, '');
      return cStr.length > 3 && (cStr.includes(str) || str.includes(cStr));
    });
    if (partialMatch) return partialMatch;
    if (str.includes('driving') || str.includes('license') || str === 'dl') return 'Driving License';
    if (str.includes('identity') || str.includes('kyc') || str.includes('aadhaar')) return 'Identity & KYC';
    if (str.includes('gst')) return 'GST Registration Certificate';
    if (str.includes('pan')) return 'PAN Card Copy';
    if (str.includes('msa') || str.includes('agreement') || str.includes('contract')) return 'Master Services Agreement (MSA)';
    if (str.includes('depot')) return 'Depot Agreement & Contract';
    if (str.includes('medical')) return 'Medical Certificate';
    if (str.includes('training') || str.includes('safety')) return 'Training & Safety';
    if (str.includes('other')) return categories.find((c) => c.toLowerCase().includes('other')) || 'Other Certificate';
    return cat;
  };

  const existingCategorySet = useMemo(() => {
    const set = new Set();
    (documents || []).forEach((d) => {
      const cat = d.category || d.doc_name || d.doc_type || d.type || d.name || d.purpose || '';
      const normalized = normalizeCategory(cat);
      if (normalized) set.add(normalized);
    });
    return set;
  }, [documents, categories]);

  useEffect(() => {
    if (categories.length > 0 && !categories.includes(docCategory)) {
      setDocCategory(categories[0]);
    }
  }, [categories]);

  useEffect(() => {
    if (existingCategorySet.has(normalizeCategory(docCategory))) {
      const firstAvailable = categories.find((c) => !existingCategorySet.has(normalizeCategory(c)));
      if (firstAvailable) {
        setDocCategory(firstAvailable);
      }
    }
  }, [existingCategorySet, docCategory, categories]);

  const handleFilesSelected = async (e) => {
    if (isFullyLocked) {
      toast.error(t('ag.shared.multipledocumentuploader.documents_locked', 'Documents are verified and locked. Edits are disabled.'));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (existingCategorySet.has(normalizeCategory(docCategory))) {
      toast.error(t("superadmin.assignment_finance.category_is_already_uploaded_remove_the_existing_file_first_to_replace_it", "\"{{category}}\" is already uploaded. Remove the existing file first to replace it.", { category: categoryLabel(docCategory) }));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (deferUpload) {
      const localList = [];
      for (const file of files) {
        if (file.size > maxSizeMB * 1024 * 1024) {
          toast.error(t("superadmin.assignment_finance.file_name_exceeds_maximum_size_of_size_mb", "File \"{{name}}\" exceeds maximum size of {{size}}MB", { name: file.name, size: maxSizeMB }));
          continue;
        }

        const localUrl = URL.createObjectURL(file);
        localList.push({
          id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          category: docCategory,
          url: localUrl,
          file,
          size: file.size,
          formattedSize: (file.size / 1024).toFixed(1) + ' KB',
          type: file.type || 'application/pdf',
          uploadedAt: new Date().toISOString(),
          verified: false,
          isPendingUpload: true,
        });
      }

      if (localList.length > 0) {
        onChange([...documents, ...localList]);
        toast.success(t("superadmin.assignment_finance.attached_name_for_category_will_upload_on_submit", "Attached \"{{name}}\" for {{category}} (will upload on submit)", { name: localList[0].name, category: categoryLabel(docCategory) }));
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);
    const toastId = toast.loading(t("superadmin.assignment_finance.uploading_count_document_s", "Uploading {{count}} document(s)...", { count: files.length }));

    try {
      const uploadedList = [];
      for (const file of files) {
        if (file.size > maxSizeMB * 1024 * 1024) {
          toast.error(t("superadmin.assignment_finance.file_name_exceeds_maximum_size_of_size_mb", "File \"{{name}}\" exceeds maximum size of {{size}}MB", { name: file.name, size: maxSizeMB }));
          continue;
        }

        const res = await uploadFile(file, purpose);
        const fileUrl = res?.url || res?.filePath || res;
        uploadedList.push({
          id: Date.now() + Math.random(),
          name: file.name,
          category: docCategory,
          url: fileUrl,
          size: file.size,
          formattedSize: (file.size / 1024).toFixed(1) + ' KB',
          type: file.type || 'application/pdf',
          uploadedAt: new Date().toISOString(),
          verified: false,
        });
      }

      if (uploadedList.length > 0) {
        const nextDocs = [...documents, ...uploadedList];
        onChange(nextDocs);
        toast.success(t("superadmin.assignment_finance.successfully_uploaded_count_document_s", "Successfully uploaded {{count}} document(s)!", { count: uploadedList.length }), { id: toastId });
      } else {
        toast.dismiss(toastId);
      }
    } catch (err) {
      toast.error(err?.message || t("superadmin.assignment_finance.failed_to_upload_document_s", "Failed to upload document(s)"), { id: toastId });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = (docId) => {
    const targetDoc = documents.find((d) => (d.id || d.url) === docId);
    if ((targetDoc?.verified && !allowRemoveVerified) || isFullyLocked) {
      toast.error(t("superadmin.assignment_finance.verified_documents_are_locked_and_cannot_be_removed", "Verified documents are locked and cannot be removed."));
      return;
    }

    const updated = documents.filter((d) => (d.id || d.url) !== docId);
    onChange(updated);
    toast.success(t("ag.superadmin.onboardadvertiserpage.document_removed", "Document removed"));
  };

  const handleToggleVerified = (docId) => {
    if (!allowToggleVerify) return;
    const updated = documents.map((d) => {
      if ((d.id || d.url) === docId) {
        return { ...d, verified: !d.verified };
      }
      return d;
    });
    onChange(updated);
    toast.success(t("superadmin.assignment_finance.document_verification_status_updated", "Document verification status updated"));
  };

  const isSelectedCategoryUploaded = existingCategorySet.has(normalizeCategory(docCategory));
  const allCategoriesUploaded = categories.every((c) => existingCategorySet.has(c));

  return (
    <div className="space-y-3.5 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3.5 sm:p-5 bg-slate-50/60 dark:bg-zinc-900/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 pb-3.5">
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="flex items-center gap-1.5 min-w-0">
              <FleetIcons.Paperclip className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 shrink-0" />
              <span className="truncate">{title === 'Uploaded Documents & Attachments' ? t("superadmin.assignment_finance.uploaded_documents_attachments", "Uploaded Documents & Attachments") : title}</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-mono font-bold shrink-0">
              {documents.length} {t('ag.shared.multipledocumentuploader.file_s', 'File(s)')}
            </span>
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
            {isFullyLocked
              ? t("superadmin.assignment_finance.all_compliance_documents_are_verified_and_locked_from_edits", "All compliance documents are verified and locked from edits.")
              : t("superadmin.assignment_finance.attach_supporting_compliance_documents_only_1_file_per_document_category_is_allowed", "Attach supporting compliance documents. Only 1 file per document category is allowed.")}
          </p>
        </div>

        {/* Upload Controls */}
        {isFullyLocked ? (
          <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1.5 w-full sm:w-auto shrink-0">
            <FleetIcons.Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t('ag.shared.multipledocumentuploader.documents_verified_and_locked', 'Documents Verified & Locked')}</span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0">
            <select
              value={docCategory}
              onChange={(e) => setDocCategory(e.target.value)}
              className="w-full sm:w-auto h-9 sm:h-8 px-2.5 sm:px-2 py-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs sm:text-[11px] font-bold text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 max-w-none sm:max-w-[220px] md:max-w-[260px] truncate cursor-pointer shadow-2xs"
            >
              {categories.map((c) => {
                const isUploaded = existingCategorySet.has(normalizeCategory(c));
                return (
                  <option key={c} value={c} disabled={isUploaded} className={isUploaded ? 'text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-800 font-normal' : ''}>
                    {categoryLabel(c)} {isUploaded ? t("superadmin.assignment_finance.already_uploaded", "(Already Uploaded)") : ''}
                  </option>
                );
              })}
            </select>

            <button
              type="button"
              onClick={() => {
                if (isSelectedCategoryUploaded) {
                  toast.error(t("superadmin.assignment_finance.category_is_already_uploaded_remove_the_existing_file_first_to_replace_it", "\"{{category}}\" is already uploaded. Remove the existing file first to replace it.", { category: categoryLabel(docCategory) }));
                  return;
                }
                fileInputRef.current?.click();
              }}
              disabled={uploading || allCategoriesUploaded}
              title={allCategoriesUploaded ? t("superadmin.assignment_finance.all_document_categories_have_already_been_uploaded", "All document categories have already been uploaded") : t("ag.driver.driveruploaddocumentpage.upload_document", "Upload Document")}
              className="w-full sm:w-auto h-9 sm:h-8 px-3.5 sm:px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shrink-0 whitespace-nowrap active:scale-[0.98]"
            >
              {uploading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FleetIcons.Plus className="w-3.5 h-3.5" />
              )}
              <span>{deferUpload ? t("superadmin.advertisers.attach_doc", "Attach Document") : t("ag.driver.driveruploaddocumentpage.upload_document", "Upload Document")}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple={false}
              accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
              onChange={handleFilesSelected}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Document List */}
      {documents.length === 0 ? (
        <div className="py-6 text-center text-slate-400 dark:text-zinc-500 font-medium text-xs bg-white dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800 border-dashed">
          {t('ag.shared.multipledocumentuploader.no_documents_attached_yet_click_upload_docum', 'No documents attached yet. Click "Upload Document" to attach files.')}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {documents.map((doc) => {
            const docId = doc.id || doc.url;
            const fullUrl = resolveFileUrl(doc.url || doc.file_url);
            const isDocVerified = Boolean((doc.verified && !allowRemoveVerified) || isFullyLocked);

            return (
              <div
                key={docId}
                className="bg-white dark:bg-zinc-900 p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-start justify-between gap-2.5 sm:gap-3 shadow-2xs hover:border-slate-300 dark:hover:border-zinc-700 transition-colors min-w-0"
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center font-bold text-slate-600 dark:text-zinc-300 text-xs shrink-0 mt-0.5">
                    <FleetIcons.FileText className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 dark:text-white text-xs truncate break-all sm:break-normal" title={doc.name || t("superadmin.assignment_finance.document", "Document")}>
                      {doc.name || doc.file_name || t("superadmin.assignment_finance.document", "Document")}
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-1 flex-wrap">
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 truncate max-w-[140px] sm:max-w-none">
                        {categoryLabel(doc.category || doc.doc_type) || t("superadmin.assignment_finance.general", "General")}
                      </span>
                      {(doc.formattedSize || (typeof doc.size === 'number' ? `${(doc.size / 1024).toFixed(1)} KB` : doc.size)) && (
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono shrink-0">
                          {doc.formattedSize || (typeof doc.size === 'number' ? `${(doc.size / 1024).toFixed(1)} KB` : doc.size)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-2 flex-wrap">
                      <a
                        href={fullUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:underline inline-flex items-center gap-1 shrink-0 py-0.5"
                        title={t('ag.shared.multipledocumentuploader.open_file_in_new_tab_or_download', 'Open file in new tab or download')}
                      >
                        <span>{t('ag.shared.multipledocumentuploader.open_save', 'Open / Save')}</span>
                        <FleetIcons.ExternalLink className="w-2.5 h-2.5" />
                      </a>
                      {doc.isPendingUpload && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 inline-flex items-center gap-1 shrink-0">
                          <span>{t('ag.shared.multipledocumentuploader.pending_submit', 'Pending Submit')}</span>
                          <FleetIcons.Clock className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                        </span>
                      )}
                      {showVerifyStatus && !doc.isPendingUpload && (
                        <button
                          type="button"
                          onClick={() => allowToggleVerify && handleToggleVerified(docId)}
                          disabled={!allowToggleVerify}
                          aria-disabled={!allowToggleVerify}
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border transition-colors shrink-0 ${
                            allowToggleVerify ? 'cursor-pointer' : 'cursor-default'
                          } ${
                            isDocVerified
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {isDocVerified ? (
                            <span className="inline-flex items-center gap-1">
                              <FleetIcons.Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                              {t('ag.shared.multipledocumentuploader.verified', 'Verified')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1">
                              <FleetIcons.Clock className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                              {t('ag.shared.multipledocumentuploader.unverified', 'Unverified')}
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {isDocVerified ? (
                  <div
                    className="w-7 h-7 sm:w-6 sm:h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0"
                    title={t('ag.shared.multipledocumentuploader.verified_document_locked_from_deletion', 'Verified document — locked from deletion')}
                  >
                    <FleetIcons.Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRemove(docId)}
                    className="w-7 h-7 sm:w-6 sm:h-6 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition-colors shrink-0 cursor-pointer touch-manipulation"
                    title={t('ag.shared.multipledocumentuploader.remove_document', 'Remove document')}
                    aria-label={t('ag.shared.multipledocumentuploader.remove_document', 'Remove document')}
                  >
                    <FleetIcons.Close className="w-3.5 h-3.5 text-slate-400 hover:text-rose-600" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-3 sm:p-4 px-4 sm:px-6 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 dark:bg-zinc-900/80">
              <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
                <FleetIcons.FileText className="w-5 h-5 text-blue-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {previewDoc.name || previewDoc.file_name || t('ag.shared.multipledocumentuploader.document_preview', 'Document Preview')}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                    <span className="font-semibold uppercase truncate">{categoryLabel(previewDoc.category || previewDoc.doc_type) || t("superadmin.assignment_finance.general", "General")}</span>
                    <span>•</span>
                    <span className="shrink-0">{previewDoc.formattedSize || (typeof previewDoc.size === 'number' ? `${(previewDoc.size / 1024).toFixed(1)} KB` : previewDoc.size || '')}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <a
                  href={resolveFileUrl(previewDoc.url || previewDoc.file_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <span>{t('ag.shared.multipledocumentuploader.open_in_tab', 'Open in Tab')}</span>
                  <FleetIcons.ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 flex items-center justify-center transition-colors cursor-pointer"
                  title={t('ag.shared.multipledocumentuploader.close_preview', 'Close Preview')}
                >
                  <FleetIcons.Close className="w-4 h-4 text-slate-600 dark:text-zinc-300" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-auto flex-1 flex items-center justify-center bg-slate-100/60 dark:bg-zinc-950/40 min-h-[360px]">
              {(() => {
                const url = resolveFileUrl(previewDoc.url || previewDoc.file_url);
                const isImg = previewDoc.type?.startsWith('image') || /\.(png|jpe?g|webp|gif|svg)$/i.test(url) || /\.(png|jpe?g|webp|gif|svg)$/i.test(previewDoc.name || '');
                const isPdf = previewDoc.type === 'application/pdf' || /\.pdf$/i.test(url) || /\.pdf$/i.test(previewDoc.name || '');

                if (isImg) {
                  return (
                    <img
                      src={url}
                      alt={previewDoc.name || t("superadmin.assignment_finance.document", "Document")}
                      className="max-h-[68vh] max-w-full object-contain rounded-xl shadow-xs border border-slate-200 dark:border-zinc-800 bg-white"
                    />
                  );
                }
                if (isPdf) {
                  return (
                    <iframe
                      src={url}
                      title={previewDoc.name || t('ag.shared.multipledocumentuploader.pdf_document', 'PDF Document')}
                      className="w-full h-[68vh] rounded-xl border border-slate-200 dark:border-zinc-800 bg-white"
                    />
                  );
                }
                return (
                  <div className="text-center p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3 max-w-md">
                    <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400">
                      <FleetIcons.Paperclip className="w-6 h-6" />
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {previewDoc.name || t('ag.shared.multipledocumentuploader.attached_document', 'Attached Document')}
                    </div>
                    <p className="text-xs text-slate-500">
                      {t('ag.shared.multipledocumentuploader.direct_in_browser_visual_preview_not_availab', 'Direct in-browser visual preview not available for this file extension. Click below to view or download directly.')}
                    </p>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
                    >
                      <span>{t('ag.shared.multipledocumentuploader.download_open_file', 'Download / Open File')}</span>
                    </a>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultipleDocumentUploader;

