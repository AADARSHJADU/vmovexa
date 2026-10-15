import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import Breadcrumb from '../../components/ui/Breadcrumb';

export const DriverDocumentSubmittedPage = () => {
  const location = useLocation();
  const data = location.state || {
    docName: 'Driving License',
    fileName: 'DL_Rohan_Kumar_2025.jpg',
    fileSize: '1.24 MB',
    validTill: '18 May 2028',
  };

  return (
    <div className="w-full max-w-xl mx-auto py-8 sm:py-12 space-y-6 animate-in fade-in zoom-in-95 duration-200 text-center">
      <div className="flex justify-start">
        <Breadcrumb
          items={[
            { label: 'Driver', path: '/driver/dashboard' },
            { label: 'Documents', path: '/driver/documents' },
            { label: 'Document Submitted' },
          ]}
          className="mb-2"
        />
      </div>

      {/* Green Checkmark */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
        <FleetIcons.Check className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2.5]" />
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Document Uploaded Successfully!</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1.5 max-w-sm mx-auto">
          Your document has been received and queued for compliance officer verification.
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm text-left space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Document Type</span>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{data.docName}</div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-lg">
            Under Review
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 dark:text-zinc-500 text-[11px] font-medium">Attached File:</span>
            <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 truncate">{data.fileName}</div>
          </div>
          <div>
            <span className="text-slate-400 dark:text-zinc-500 text-[11px] font-medium">File Size:</span>
            <div className="font-bold text-slate-800 dark:text-zinc-200 mt-0.5">{data.fileSize}</div>
          </div>
          <div>
            <span className="text-slate-400 dark:text-zinc-500 text-[11px] font-medium">Valid Until:</span>
            <div className="font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">{data.validTill}</div>
          </div>
          <div>
            <span className="text-slate-400 dark:text-zinc-500 text-[11px] font-medium">Submitted On:</span>
            <div className="font-bold text-slate-800 dark:text-zinc-200 mt-0.5">
              {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <Link
          to="/driver/documents"
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all block text-center"
        >
          Go to Documents Roster
        </Link>
        <Link
          to="/driver/dashboard"
          className="w-full py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-all block text-center"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

