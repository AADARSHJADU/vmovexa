import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { useSupport } from '../../hooks/shared/useSupport';
import { useAuth } from '../../hooks/useAuth';

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
  { value: 'low', label: 'Low Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'high', label: 'High Priority' },
  { value: 'urgent', label: 'Urgent Priority' },
];

export const CreateSupportTicketPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { createTicket, uploadFile } = useSupport();

  // Detect portal base path & role title from location
  const path = location.pathname;
  let roleTitle = 'Organization Admin';
  let helpPath = '/admin/help';
  let historyPath = '/admin/help/history';

  if (path.startsWith('/fleet-operator') || path.startsWith('/fleet-manager')) {
    roleTitle = 'Fleet Operator';
    helpPath = '/fleet-operator/help';
    historyPath = '/fleet-operator/help/history';
  } else if (path.startsWith('/driver')) {
    roleTitle = 'Driver Console';
    helpPath = '/driver/help';
    historyPath = '/driver/help/history';
  } else if (path.startsWith('/superadmin')) {
    roleTitle = 'SuperAdmin Console';
    helpPath = '/superadmin/help';
    historyPath = '/superadmin/help/history';
  } else if (path.startsWith('/government')) {
    roleTitle = 'Government Desk';
    helpPath = '/government/help';
    historyPath = '/government/help/history';
  } else if (path.startsWith('/advertiser')) {
    roleTitle = 'Advertiser Console';
    helpPath = '/advertiser/help';
    historyPath = '/advertiser/help/history';
  } else if (path.startsWith('/technician')) {
    roleTitle = 'Technician Pool';
    helpPath = '/technician/help';
    historyPath = '/technician/help/history';
  } else if (path.startsWith('/finance')) {
    roleTitle = 'Finance Portal';
    helpPath = '/finance/help';
    historyPath = '/finance/help/history';
  }

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  const handlePickFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const meta = await uploadFile(file, 'support');
        setAttachments((prev) => [...prev, meta]);
      }
      toast.success('Attachment added successfully');
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
      navigate(historyPath);
    } catch (_) {
      /* handled */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-16 animate-in fade-in duration-200">
      {/* 1. Breadcrumb Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <Link to={helpPath} className="hover:text-slate-900 transition-colors">
              Console
            </Link>
            <span>/</span>
            <span className="text-slate-700 font-semibold">{roleTitle}</span>
            <span>/</span>
            <Link to={helpPath} className="hover:text-slate-900 transition-colors">
              Help & Support
            </Link>
            <span>/</span>
            <span className="text-blue-600 font-bold">Raise Support Ticket</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Raise Support Ticket
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Submit a formal query or operational request to VMOVEXA Central Support Desk
          </p>
        </div>

        <Link
          to={historyPath}
          className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <span>← Back to Ticket History</span>
        </Link>
      </div>

      {/* 2. Full-Page Ticket Form Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
          {/* Subject Line */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Ticket Subject <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Telemetry GPS ping delay on Vehicle #V-102"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all"
            />
          </div>

          {/* Grid: Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-300 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-300 focus:outline-none capitalize"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Issue Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Issue Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide complete context, error messages, vehicle plate number, or driver details..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all resize-none"
            />
          </div>

          {/* File Attachments Section */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700">Attach Evidence Files / Documents</label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handlePickFiles}
              className="hidden"
            />

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                disabled={uploading}
                className="px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <FleetIcons.Plus className="w-4 h-4" />
                <span>{uploading ? 'Uploading...' : 'Choose File / Photo'}</span>
              </button>

              {attachments.map((att, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs font-bold">
                  <span className="truncate max-w-[180px]">{att.fileName || `Attachment #${idx + 1}`}</span>
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

          {/* Submit Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => navigate(historyPath)}
              disabled={submitting}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>{submitting ? 'Submitting Ticket...' : 'Submit Support Ticket'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSupportTicketPage;
