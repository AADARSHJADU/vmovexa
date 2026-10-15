/**
 * Pagination.jsx — Global reusable pagination component.
 * Use on EVERY list, table, or grid in the app.
 *
 * Props:
 *   currentPage      {number}   — 1-indexed current page
 *   totalPages       {number}   — total number of pages
 *   totalItems       {number}   — total record count
 *   pageSize         {number}   — current items per page
 *   pageSizeOptions  {number[]} — dropdown options (default: [10, 20, 50, 100])
 *   onPageChange     {fn}       — called with new page number
 *   onPageSizeChange {fn}       — called with new page size
 */
import React from 'react';

const DEFAULT_PAGE_SIZE_OPTIONS = [6, 10, 20, 50];

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 6,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageChange,
  onPageSizeChange,
}) => {
  if (totalItems <= 0) return null;

  const from = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const to   = Math.min(currentPage * pageSize, totalItems);

  // Generate visible page numbers with ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-3 border-t border-slate-100 dark:border-zinc-800">

      {/* Left: item count + page size selector */}
      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400">
        <span>
          Showing <span className="font-bold text-slate-900 dark:text-white">{from}–{to}</span> of{' '}
          <span className="font-bold text-slate-900 dark:text-white">{totalItems}</span>
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
              className="text-xs font-semibold border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white rounded-lg px-2 py-1 cursor-pointer outline-none focus:ring-2 focus:ring-blue-500"
            >
              {pageSizeOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span>per page</span>
          </div>
        )}
      </div>

      {/* Right: page buttons */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ←
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-xs text-slate-400 dark:text-zinc-500 select-none">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-lg text-xs font-bold border transition-colors ${
                p === currentPage
                  ? 'bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-600'
                  : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700'
              }`}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          →
        </button>
      </div>
    </div>
  );
};

export default Pagination;
