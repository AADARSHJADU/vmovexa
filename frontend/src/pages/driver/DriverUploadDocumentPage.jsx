import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { MultipleDocumentUploader } from '../../components/ui/MultipleDocumentUploader';
import { useDriverApp } from '../../hooks/driver/useDriverApp';
import { uploadFile, resolveFileUrl } from '../../api/services/upload.service';
import Breadcrumb from '../../components/ui/Breadcrumb';

const guessDocType = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('driving') || n.includes('license') || n.includes('licence') || n.includes('dl')) return 'dl';
  if (n.includes('aadhaar') || n.includes('aadhar') || n.includes('pan') || n.includes('kyc') || n.includes('id')) return 'aadhaar';
  if (n.includes('medical') || n.includes('fitness')) return 'medical';
  if (n.includes('insurance')) return 'insurance';
  if (n.includes('training') || n.includes('certificate')) return 'training';
  return 'other';
};

export const DriverUploadDocumentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { uploadDocument } = useDriverApp();

  const initialDocName = location.state?.docName || 'Driving License';

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingSingle, setUploadingSingle] = useState(false);
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    name: initialDocName,
    documentNumber: '',
    expiryDate: '',
    issuingAuthority: '',
    fileName: '',
    fileSize: '',
    fileType: '',
    previewUrl: '',
    documents: [], // Multiple uploaded documents array
  });

  const [confirmed, setConfirmed] = useState(false);

  // Handle single file upload
  const handleSingleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSingle(true);
    const toastId = toast.loading('Uploading document file...');

    try {
      const res = await uploadFile(file, 'driver_document');
      const url = res?.url || res?.filePath || res;
      setFormData((prev) => ({
        ...prev,
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(1) + ' KB',
        fileType: file.type || 'PDF/Scan',
        previewUrl: url,
        documents: [
          ...prev.documents,
          {
            id: Date.now(),
            name: file.name,
            url,
            category: formData.name,
            size: (file.size / 1024).toFixed(1) + ' KB',
            uploadedAt: new Date().toISOString(),
          },
        ],
      }));
      toast.success('File uploaded successfully!', { id: toastId });
    } catch (err) {
      toast.error(err?.message || 'Failed to upload file', { id: toastId });
    } finally {
      setUploadingSingle(false);
    }
  };

  const handleFinish = async (e) => {
    e.preventDefault();
    if (!confirmed || submitting) return;

    const payload = {
      docName: formData.name,
      docType: guessDocType(formData.name),
      documentNumber: formData.documentNumber,
      issuingAuthority: formData.issuingAuthority,
      expiryDate: formData.expiryDate,
      ...(formData.previewUrl ? { previewUrl: formData.previewUrl } : {}),
      ...(formData.fileName ? { fileName: formData.fileName } : {}),
      ...(formData.fileSize ? { fileSize: formData.fileSize } : {}),
      ...(formData.fileType ? { fileType: formData.fileType } : {}),
      documents: formData.documents,
    };

    setSubmitting(true);
    try {
      await toast.promise(uploadDocument(payload), {
        loading: 'Submitting driver document(s)...',
        success: 'Driver document submitted for compliance verification!',
        error: (err) => err?.message || 'Failed to submit document',
      });
      navigate('/driver/documents/upload/success', {
        state: {
          docName: formData.name,
          fileName: formData.fileName || `${formData.documents.length} File(s)`,
          fileSize: formData.fileSize || 'Attached',
          validTill: formData.expiryDate || 'Verified',
        },
      });
    } catch {
      /* handled by toast */
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
              { label: 'Driver', path: '/driver/dashboard' },
              { label: 'Documents', path: '/driver/documents' },
              { label: 'Upload Document' },
            ]}
            className="mb-2"
          />
          <div className="flex items-center gap-3 mt-1">
            <Link
              to="/driver/documents"
              className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors"
              title="Back to Documents"
            >
              <FleetIcons.ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Upload Driver Document & Attachments
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                Submit verified official paperwork for compliance verification and audit renewal
              </p>
            </div>
          </div>
        </div>

        <span className="text-xs font-bold px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-full self-start sm:self-auto">
          Step {currentStep} of 4
        </span>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { step: 1, title: 'Document Type', desc: 'Select Category' },
            { step: 2, title: 'File Upload', desc: 'Attach Documents' },
            { step: 3, title: 'Validity Info', desc: 'Expiry & Serial' },
            { step: 4, title: 'Review & Submit', desc: 'Verification' },
          ].map((s) => (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              className={`p-2.5 rounded-xl text-left transition-all flex items-center gap-3 cursor-pointer ${
                currentStep === s.step
                  ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-sm'
                  : currentStep > s.step
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-50 dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  currentStep === s.step
                    ? 'bg-white text-slate-900 dark:text-blue-600'
                    : currentStep > s.step
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300'
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

      {/* STEP 1: DOCUMENT TYPE */}
      {currentStep === 1 && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">1. Select Document Category *</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Choose which document record you are uploading</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Document Name *</label>
              <select
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Driving License" className="dark:bg-zinc-900">Commercial Driving License (HMV)</option>
                <option value="ID Proof (Aadhaar / PAN)" className="dark:bg-zinc-900">ID Proof (Aadhaar / PAN Card)</option>
                <option value="Insurance Document" className="dark:bg-zinc-900">Commercial Driver Group Insurance</option>
                <option value="Medical Fitness Certificate" className="dark:bg-zinc-900">Medical & Eye Fitness Certificate</option>
                <option value="Other Training Certificate" className="dark:bg-zinc-900">Defensive Driving & EV Safety Certificate</option>
              </select>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs space-y-1">
              <span className="font-bold text-slate-900 dark:text-white">Compliance Requirement:</span>
              <p className="text-slate-500 dark:text-zinc-400">
                Please make sure the official document is clearly visible, untruncated, and bears the official government seal or certified medical stamp.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Next: Attach File →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: MULTIPLE FILE ATTACHMENT */}
      {currentStep === 2 && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">2. File Upload & Multiple Attachments</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Upload single or multiple document files (PDF, PNG, JPG, WEBP)</p>
          </div>

          <div className="space-y-5">
            {/* Quick Upload Button */}
            <div className="p-6 border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-slate-400 dark:hover:border-zinc-600 rounded-2xl text-center space-y-3 bg-slate-50/50 dark:bg-zinc-800/30 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                <FleetIcons.Document className="w-6 h-6" />
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingSingle}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {uploadingSingle ? 'Uploading File...' : 'Select File to Upload'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleSingleFileUpload}
                  className="hidden"
                />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">Supports JPG, PNG, PDF formats up to 10 MB</p>
            </div>

            {/* Multiple Document Uploader Widget */}
            <MultipleDocumentUploader
              documents={formData.documents}
              onChange={(docs) => setFormData((prev) => ({ ...prev, documents: docs }))}
              title="Driver Document Files & Attachments"
              purpose="driver_document"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Next: Validity & Details →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: VALIDITY & ISSUING DETAILS */}
      {currentStep === 3 && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">3. Document Validity & Serial Info</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Enter document serial numbers and expiration dates</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Document Registration Serial No. *</label>
              <input
                type="text"
                required
                placeholder="e.g. MH-04-2023-0091823"
                value={formData.documentNumber}
                onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Expiry / Validity Date *</label>
              <input
                type="date"
                required
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Issuing Authority / RTO Office</label>
              <input
                type="text"
                placeholder="e.g. RTO Mumbai West / UIDAI Government of India"
                value={formData.issuingAuthority}
                onChange={(e) => setFormData({ ...formData, issuingAuthority: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Next: Review & Submit →
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & SUBMIT */}
      {currentStep === 4 && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Review & Confirm Document Submission</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Verify your document details before sending for compliance approval</p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-200/60 dark:border-zinc-700/60 pb-2">
              <span className="text-slate-400 dark:text-zinc-500">Document Name:</span>
              <span className="font-bold text-slate-900 dark:text-white">{formData.name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 dark:border-zinc-700/60 pb-2">
              <span className="text-slate-400 dark:text-zinc-500">Document No:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{formData.documentNumber || '—'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 dark:border-zinc-700/60 pb-2">
              <span className="text-slate-400 dark:text-zinc-500">Files Attached:</span>
              <span className="font-mono text-slate-800 dark:text-zinc-200">{formData.documents.length} File(s)</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 dark:border-zinc-700/60 pb-2">
              <span className="text-slate-400 dark:text-zinc-500">Valid Till:</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">{formData.expiryDate || 'Permanent'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 dark:text-zinc-500">Issuing Authority:</span>
              <span className="font-medium text-slate-800 dark:text-zinc-200 text-right">{formData.issuingAuthority || '—'}</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-xl">
            <input
              type="checkbox"
              id="confirmDoc"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
            <label htmlFor="confirmDoc" className="text-xs font-bold text-blue-900 dark:text-blue-300 cursor-pointer">
              By uploading this document, you confirm that the information provided is authentic, valid, and unmodified.
            </label>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleFinish}
              disabled={!confirmed || submitting}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <FleetIcons.Check className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Submit for Verification'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverUploadDocumentPage;
