import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { FleetIcons } from '../FleetIcons';
import { Breadcrumb } from '../ui/Breadcrumb';
import { useContent } from '../../hooks/shared/useContent';

/**
 * Universal dynamic RolePolicyPage component.
 * Replicates the ui_only_ design pattern with dynamic backend data fetching,
 * live keyword search, accordion sections, and print/export actions.
 */
export const RolePolicyPage = ({
  type = 'terms',
  roleCode = null,
  titleFallback = 'Terms & Conditions',
  subtitleFallback = 'Official regulatory framework and platform policies.',
  searchPlaceholder = 'Search clauses, regulatory rules or policies...',
  buttonLabel = null,
}) => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const { loadPage, getPage, status } = useContent();

  useEffect(() => {
    loadPage(type, roleCode);
  }, [loadPage, type, roleCode]);

  const page = getPage(type, roleCode);
  const isLoading = status === 'loading' && !page;

  // Normalize sections from JSON array or string
  const sections = useMemo(() => {
    if (!page?.sections) return [];
    if (Array.isArray(page.sections)) return page.sections;
    if (typeof page.sections === 'string') {
      try {
        const parsed = JSON.parse(page.sections);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }, [page]);

  // Search filter
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase().trim();
    return sections.filter((s) => {
      const t = (s.title || s.question || '').toLowerCase();
      const c = (s.content || s.answer || '').toLowerCase();
      return t.includes(q) || c.includes(q);
    });
  }, [sections, searchQuery]);

  const handlePrint = () => {
    window.print();
  };

  const actionButtonText = buttonLabel || (type === 'terms' ? 'Download SLA PDF' : 'Download Policy PDF');

  const getBreadcrumbs = () => {
    const path = location.pathname;
    let portal = { label: 'Admin', to: '/admin/dashboard' };
    if (path.startsWith('/superadmin')) {
      portal = { label: 'SuperAdmin', to: '/superadmin/dashboard' };
    } else if (path.startsWith('/fleet-manager')) {
      portal = { label: 'Fleet Manager', to: '/fleet-manager/dashboard' };
    } else if (path.startsWith('/driver')) {
      portal = { label: 'Driver', to: '/driver/dashboard' };
    } else if (path.startsWith('/advertiser')) {
      portal = { label: 'Advertiser', to: '/advertiser/dashboard' };
    } else if (path.startsWith('/government')) {
      portal = { label: 'Government', to: '/government/dashboard' };
    } else if (path.startsWith('/technician')) {
      portal = { label: 'Technician', to: '/technician/dashboard' };
    } else if (path.startsWith('/finance')) {
      portal = { label: 'Finance', to: '/finance/dashboard' };
    }
    return [
      portal,
      { label: page?.title || titleFallback },
    ];
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 print:p-0">
      {/* Standard Reusable Breadcrumb */}
      <div className="print:hidden">
        <Breadcrumb items={getBreadcrumbs()} />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 print:border-b-2 print:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {page?.title || titleFallback}
            </h1>
            {page?.version && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700 print:hidden">
                v{page.version}.0
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            {page?.summary || subtitleFallback}
          </p>
        </div>

        <button
          onClick={handlePrint}
          type="button"
          className="px-4 py-2 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all w-full sm:w-auto flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 print:hidden"
        >
          <FleetIcons.Document className="w-4 h-4" />
          <span>{actionButtonText}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm print:hidden">
        <div className="relative">
          <FleetIcons.Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Accordions / Content */}
      {isLoading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 animate-pulse space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-full" />
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-4/5" />
            </div>
          ))}
        </div>
      ) : sections.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
          {filteredSections.length > 0 ? (
            filteredSections.map((sec, idx) => {
              const itemTitle = sec.title || sec.question || `Section ${idx + 1}`;
              const itemContent = sec.content || sec.answer || '';
              return (
                <details
                  key={sec.id || `sec-${idx}`}
                  open
                  className="group p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 open:bg-white dark:open:bg-slate-800/90 open:border-slate-200 dark:open:border-slate-700 transition-all"
                >
                  <summary className="text-xs font-bold text-slate-900 dark:text-white cursor-pointer list-none flex items-center justify-between select-none">
                    <span>{itemTitle}</span>
                    <span className="text-slate-400 group-open:rotate-180 transition-transform print:hidden">▼</span>
                  </summary>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700 leading-relaxed whitespace-pre-line">
                    {itemContent}
                  </p>
                </details>
              );
            })
          ) : (
            <div className="text-center py-10">
              <FleetIcons.Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No matching sections found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Try searching with a different keyword or clause name.</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 px-3 py-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      ) : page?.body_html ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div
            className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300 text-xs leading-relaxed"
            dangerouslySetInnerHTML={{ __html: page.body_html }}
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
          <FleetIcons.Document className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Content Not Published Yet</p>
          <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
            The platform administrator is currently reviewing the policies for this portal. They will appear here once published.
          </p>
        </div>
      )}

      {/* Footer Audit Notice */}
      <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 font-medium pt-2 print:text-slate-600">
        Official VMOVEXA Platform Document • Effective as of {page?.effective_from ? new Date(page.effective_from).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Current Platform Release'}
      </div>
    </div>
  );
};

export default RolePolicyPage;
