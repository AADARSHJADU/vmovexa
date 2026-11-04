import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
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
  fallbackSections = [],
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const { loadPage, getPage, status } = useContent();

  useEffect(() => {
    loadPage(type, roleCode);
  }, [loadPage, type, roleCode]);

  const page = getPage(type, roleCode);
  const isLoading = status === 'loading' && !page;

  // Normalize sections from JSON array or string, with fallback support
  const sections = useMemo(() => {
    if (page?.sections) {
      if (Array.isArray(page.sections) && page.sections.length > 0) return page.sections;
      if (typeof page.sections === 'string') {
        try {
          const parsed = JSON.parse(page.sections);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    return Array.isArray(fallbackSections) ? fallbackSections : [];
  }, [page, fallbackSections]);

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

  const getBreadcrumbs = () => {
    const path = location.pathname;
    let portal = { label: t('roles.admin', 'Admin'), to: '/admin/dashboard', icon: FleetIcons.Dashboard };
    if (path.startsWith('/superadmin')) {
      portal = { label: t('roles.superadmin', 'Super Admin'), to: '/superadmin/dashboard', icon: FleetIcons.Dashboard };
    } else if (path.startsWith('/fleet-operator') || path.startsWith('/fleet-manager')) {
      portal = { label: t('roles.fleet_operator', 'Fleet Operator'), to: '/fleet-operator/dashboard', icon: FleetIcons.Dashboard };
    } else if (path.startsWith('/driver')) {
      portal = { label: t('roles.driver', 'Driver'), to: '/driver/dashboard', icon: FleetIcons.Dashboard };
    } else if (path.startsWith('/advertiser')) {
      portal = { label: t('roles.advertiser', 'Advertiser'), to: '/advertiser/dashboard', icon: FleetIcons.Dashboard };
    } else if (path.startsWith('/government')) {
      portal = { label: t('roles.government', 'Government'), to: '/government/dashboard', icon: FleetIcons.Dashboard };
    } else if (path.startsWith('/technician')) {
      portal = { label: t('roles.technician', 'Technician'), to: '/technician/dashboard', icon: FleetIcons.Dashboard };
    } else if (path.startsWith('/finance')) {
      portal = { label: t('nav.headers.finance_portal', 'Finance Portal'), to: '/finance/dashboard', icon: FleetIcons.Dashboard };
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4 print:border-b-2 print:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {page?.title || titleFallback}
            </h1>
            {page?.version && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded-full border border-slate-200 dark:border-zinc-800 print:hidden">
                v{page.version}.0
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            {page?.summary || subtitleFallback}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm print:hidden">
        <div className="relative">
          <FleetIcons.Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
            >
              <FleetIcons.Close className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Accordions / Content */}
      {isLoading ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 animate-pulse space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-zinc-700 rounded w-1/3" />
              <div className="h-3 bg-slate-100 dark:bg-zinc-800 rounded w-full" />
              <div className="h-3 bg-slate-100 dark:bg-zinc-800 rounded w-4/5" />
            </div>
          ))}
        </div>
      ) : sections.length > 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-3">
          {filteredSections.length > 0 ? (
            filteredSections.map((sec, idx) => {
              const itemTitle = sec.title || sec.question || `Section ${idx + 1}`;
              const itemContent = sec.content || sec.answer || '';
              return (
                <details
                  key={sec.id || `sec-${idx}`}
                  open
                  className="group p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 open:bg-white dark:open:bg-zinc-800/90 open:border-slate-200 dark:open:border-zinc-700 transition-all"
                >
                  <summary className="text-xs font-bold text-slate-900 dark:text-white cursor-pointer list-none flex items-center justify-between select-none">
                    <span>{itemTitle}</span>
                    <FleetIcons.ChevronDown className="w-4 h-4 text-slate-400 dark:text-zinc-500 group-open:rotate-180 transition-transform print:hidden" />
                  </summary>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 font-medium mt-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800 leading-relaxed whitespace-pre-line">
                    {itemContent}
                  </p>
                </details>
              );
            })
          ) : (
            <div className="text-center py-10">
              <FleetIcons.Search className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('ag.shared.rolepolicypage.no_matching_sections_found', 'No matching sections found')}</p>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">{t('ag.shared.rolepolicypage.try_searching_with_a_different_keyword_or_cl', 'Try searching with a different keyword or clause name.')}</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 px-3 py-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
              >
                {t('ag.shared.rolepolicypage.clear_search', 'Clear Search')}
              </button>
            </div>
          )}
        </div>
      ) : page?.body_html ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <div
            className="prose prose-sm max-w-none text-slate-700 dark:text-zinc-300 text-xs leading-relaxed"
            dangerouslySetInnerHTML={{ __html: page.body_html }}
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm">
          <FleetIcons.Document className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('ag.shared.rolepolicypage.content_not_published_yet', 'Content Not Published Yet')}</p>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 max-w-sm mx-auto">
            {t('ag.shared.rolepolicypage.the_platform_administrator_is_currently_revi', 'The platform administrator is currently reviewing the policies for this portal. They will appear here once published.')}
          </p>
        </div>
      )}

      {/* Footer Audit Notice */}
      <div className="text-center text-[11px] text-slate-400 dark:text-zinc-500 font-medium pt-2 print:text-slate-600">
        {t('ag.shared.rolepolicypage.official_vmovexa_platform_document_effective', 'Official VMOVEXA Platform Document · Effective as of')} {page?.effective_from ? new Date(page.effective_from).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : t('common.current_platform_release', 'Current Platform Release')}
      </div>
    </div>
  );
};

export default RolePolicyPage;
