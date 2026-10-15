import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { FleetIcons } from '../FleetIcons';
import { useSupport } from '../../hooks/shared/useSupport';

const CATEGORIES = [
  'General',
  'Technical',
  'Fastag & Tolls',
  'Billing & Payouts',
  'Hardware & Telematics',
  'Driver & Fleet Roster',
  'Route & Schedule',
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-slate-100 text-slate-700' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-50 text-blue-700' },
  { value: 'high', label: 'High', color: 'bg-amber-50 text-amber-700' },
  { value: 'urgent', label: 'Urgent', color: 'bg-rose-50 text-rose-700' },
];

export const CreateTicketModal = ({ isOpen, onClose, onSuccess }) => {
  const { createTicket, uploadFile } = useSupport();

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState([]); // [{url, fileName, fileType, fileSize}]
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handlePickFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const meta = await uploadFile(file, 'support');
        setAttachments((prev) => [...prev, meta]);
      }
      toast.success('File attached successfully');
    } catch (err) {
      toast.error(err?.message || 'Failed to upload attachment');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim()) {
      toast.error('Ticket subject is required');
      return;
    }
    if (!description.trim()) {
      toast.error('Ticket description is required');
      return;
    }

    setSubmitting(true);
    const payload = {
      subject: subject.trim(),
      category,
      priority,
      description: description.trim(),
      attachments,
    };

    try {
      await toast.promise(createTicket(payload), {
        loading: 'Submitting support ticket...',
        success: 'Support ticket raised successfully!',
        error: (err) => err?.message || 'Failed to raise support ticket',
      });

      // Reset form
      setSubject('');
      setCategory('General');
      setPriority('medium');
      setDescription('');
      setAttachments([]);

      if (onSuccess) onSuccess();
      onClose();
    } catch (_) {
      /* handled by toast */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <FleetIcons.Ticket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Raise Support Ticket</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Submit an official query or incident ticket to VMOVEXA Platform Support
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ticket Subject <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. GPS Device telemetry signal loss on Vehicle #V-102"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all"
            />
          </div>

          {/* Category & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-300 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-300 focus:outline-none capitalize"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label} Priority
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Issue Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide full details regarding your request, error message, vehicle code, or driver phone number..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all resize-none"
            />
          </div>

          {/* File Attachments */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Attach Evidence / Documents</label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handlePickFiles}
              className="hidden"
            />

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                disabled={uploading}
                className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <FleetIcons.Plus className="w-3.5 h-3.5" />
                <span>{uploading ? 'Uploading...' : 'Add Attachment'}</span>
              </button>

              {attachments.map((att, idx) => (
                <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-[11px] font-bold">
                  <span className="truncate max-w-[140px]">{att.fileName || `File #${idx + 1}`}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(idx)}
                    className="text-blue-400 hover:text-rose-600 font-bold ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {submitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>{submitting ? 'Submitting Ticket...' : 'Submit Support Ticket'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
