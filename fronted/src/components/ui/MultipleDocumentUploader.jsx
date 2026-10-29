import React, { useState, useRef, useMemo, useEffect } from 'react';
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
  categories: customCategories,
  deferUpload = false,
}) => {
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
      toast.error('Documents are verified and locked. Edits are disabled.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (existingCategorySet.has(normalizeCategory(docCategory))) {
      toast.error(`"${docCategory}" is already uploaded. Remove existing document first to upload a new one.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (deferUpload) {
      const localList = [];
      for (const file of files) {
        if (file.size > maxSizeMB * 1024 * 1024) {
          toast.error(`File "${file.name}" exceeds maximum size of ${maxSizeMB}MB`);
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
        toast.success(`Attached "${localList[0].name}" for ${docCategory} (will upload on submit)`);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);
    const toastId = toast.loading(`Uploading ${files.length} document(s)...`);

    try {
      const uploadedList = [];
      for (const file of files) {
        if (file.size > maxSizeMB * 1024 * 1024) {
          toast.error(`File "${file.name}" exceeds maximum size of ${maxSizeMB}MB`);
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
        toast.success(`Successfully uploaded ${uploadedList.length} document(s)!`, { id: toastId });
      } else {
        toast.dismiss(toastId);
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to upload document(s)', { id: toastId });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = (docId) => {
    const targetDoc = documents.find((d) => (d.id || d.url) === docId);
    if ((targetDoc?.verified && !allowRemoveVerified) || isFullyLocked) {
      toast.error('Verified documents are locked and cannot be removed.');
      return;
    }

    const updated = documents.filter((d) => (d.id || d.url) !== docId);
    onChange(updated);
    toast.success('Document removed');
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
    toast.success('Document verification status updated');
  };

  const isSelectedCategoryUploaded = existingCategorySet.has(normalizeCategory(docCategory));
  const allCategoriesUploaded = categories.every((c) => existingCategorySet.has(c));

  return (
    <div className="space-y-3.5 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 bg-slate-50/60 dark:bg-zinc-900/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 pb-3.5">
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
            <span className="flex items-center gap-1.5">
              <FleetIcons.Paperclip className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
              <span>{title}</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-mono font-bold">
              {documents.length} File(s)
            </span>
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
            {isFullyLocked
              ? 'All compliance documents are verified and locked from edits.'
              : 'Attach supporting compliance documents. Only 1 file per document category is allowed.'}
          </p>
        </div>

        {/* Upload Controls */}
        {isFullyLocked ? (
          <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <FleetIcons.Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Documents Verified & Locked</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={docCategory}
              onChange={(e) => setDocCategory(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-[11px] font-bold text-slate-700 dark:text-zinc-200 focus:outline-none"
            >
              {categories.map((c) => {
                const isUploaded = existingCategorySet.has(normalizeCategory(c));
                return (
                  <option key={c} value={c} disabled={isUploaded} className={isUploaded ? 'text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-800 font-normal' : ''}>
                    {c} {isUploaded ? '(Already Uploaded)' : ''}
                  </option>
                );
              })}
            </select>

            <button
              type="button"
              onClick={() => {
                if (isSelectedCategoryUploaded) {
                  toast.error(`"${docCategory}" is already uploaded. Remove the existing file first to replace it.`);
                  return;
                }
                fileInputRef.current?.click();
              }}
              disabled={uploading || allCategoriesUploaded}
              title={allCategoriesUploaded ? 'All document categories have already been uploaded' : 'Upload Document'}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {uploading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FleetIcons.Plus className="w-3.5 h-3.5" />
              )}
              <span>{deferUpload ? 'Attach Document' : 'Upload Document'}</span>
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
          No documents attached yet. Click "Upload Document" to attach files.
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
                className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-start justify-between gap-3 shadow-2xs hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center font-bold text-slate-600 dark:text-zinc-300 text-xs shrink-0 mt-0.5">
                    <FleetIcons.FileText className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 dark:text-white text-xs truncate" title={doc.name || 'Document'}>
                      {doc.name || doc.file_name || 'Document'}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                        {doc.category || doc.doc_type || 'General'}
                      </span>
                      {(doc.formattedSize || (typeof doc.size === 'number' ? `${(doc.size / 1024).toFixed(1)} KB` : doc.size)) && (
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                          {doc.formattedSize || (typeof doc.size === 'number' ? `${(doc.size / 1024).toFixed(1)} KB` : doc.size)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <a
                        href={fullUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:underline flex items-center gap-1"
                        title="Open file in new tab or download"
                      >
                        <span>Open / Save</span>
                        <FleetIcons.ExternalLink className="w-2.5 h-2.5" />
                      </a>
                      {doc.isPendingUpload && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                          <span>Pending Submit</span>
                          <FleetIcons.Clock className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => allowToggleVerify && handleToggleVerified(docId)}
                        disabled={!allowToggleVerify}
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded border transition-colors cursor-pointer ${
                          isDocVerified
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {isDocVerified ? (
                          <span className="inline-flex items-center gap-1">
                            <FleetIcons.Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <FleetIcons.Clock className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                            Unverified
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {isDocVerified ? (
                  <div
                    className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0"
                    title="Verified document — locked from deletion"
                  >
                    <FleetIcons.Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRemove(docId)}
                    className="w-6 h-6 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                    title="Remove document"
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
            <div className="p-4 px-6 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-900/80">
              <div className="flex items-center gap-2.5 min-w-0">
                <FleetIcons.FileText className="w-5 h-5 text-blue-500 shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {previewDoc.name || previewDoc.file_name || 'Document Preview'}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-zinc-400">
                    <span className="font-semibold uppercase">{previewDoc.category || previewDoc.doc_type || 'General'}</span>
                    <span>•</span>
                    <span>{previewDoc.formattedSize || (typeof previewDoc.size === 'number' ? `${(previewDoc.size / 1024).toFixed(1)} KB` : previewDoc.size || '')}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={resolveFileUrl(previewDoc.url || previewDoc.file_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <span>Open in Tab</span>
                  <FleetIcons.ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 flex items-center justify-center transition-colors cursor-pointer"
                  title="Close Preview"
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
                      alt={previewDoc.name || 'Document'}
                      className="max-h-[68vh] max-w-full object-contain rounded-xl shadow-xs border border-slate-200 dark:border-zinc-800 bg-white"
                    />
                  );
                }
                if (isPdf) {
                  return (
                    <iframe
                      src={url}
                      title={previewDoc.name || 'PDF Document'}
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
                      {previewDoc.name || 'Attached Document'}
                    </div>
                    <p className="text-xs text-slate-500">
                      Direct in-browser visual preview not available for this file extension. Click below to view or download directly.
                    </p>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
                    >
                      <span>Download / Open File</span>
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

