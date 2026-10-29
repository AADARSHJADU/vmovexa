import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../FleetIcons';
import { VideoTutorialsModal } from '../VideoTutorialsModal';
import { useContent } from '../../hooks/shared/useContent';
import { ROLE_HELP_DEFAULTS } from '../../constants/roleHelpConstants';
import { resolveFileUrl } from '../../api/services/upload.service.js';
import { Breadcrumb } from '../ui/Breadcrumb';
import { CreateTicketModal } from '../ui/CreateTicketModal';

export const RoleHelpPage = ({ roleCode, defaultHistoryPath, showContactCta = true }) => {
  const { loadPage, getPage } = useContent();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Normalize role code
  const normalizedKey = useMemo(() => {
    if (!roleCode || roleCode === 'GLOBAL') return 'GLOBAL';
    const upper = roleCode.toUpperCase();
    if (ROLE_HELP_DEFAULTS[upper]) return upper;
    if (upper === 'GLOBAL') return 'GLOBAL';
    if (upper.includes('DRIVER')) return 'ROLE-DRIVER';
    if (upper.includes('FLEET')) return 'ROLE-FLEET-OPERATOR';
    if (upper.includes('ADVERTISER')) return 'ROLE-ADVERTISER';
    if (upper.includes('TENANT') || upper === 'ROLE-ADMIN' || upper === 'ADMIN') return 'ROLE-TENANT-ADMIN';
    if (upper.includes('TECH')) return 'ROLE-CENTRAL-TECH';
    if (upper.includes('GOVT') || upper.includes('GOVERNMENT')) return 'ROLE-GOVT-AGENCY';
    if (upper.includes('FINANCE')) return 'ROLE-FINANCE-OFFICER';
    if (upper.includes('SUPER')) return 'ROLE-SUPER-ADMIN';
    return 'GLOBAL';
  }, [roleCode]);

  const roleDefault = ROLE_HELP_DEFAULTS[normalizedKey] || ROLE_HELP_DEFAULTS['GLOBAL'] || ROLE_HELP_DEFAULTS['ROLE-DRIVER'];

  // Load dynamic content from database
  useEffect(() => {
    loadPage('help', roleCode || normalizedKey);
  }, [roleCode, normalizedKey, loadPage]);

  const current = getPage('help', roleCode || normalizedKey);

  // Merge DB data with role defaults
  const pageData = useMemo(() => {
    const rawSections = current?.sections;
    let parsedSections = null;
    if (rawSections) {
      if (typeof rawSections === 'object') {
        parsedSections = rawSections;
      } else if (typeof rawSections === 'string') {
        try {
          parsedSections = JSON.parse(rawSections);
        } catch {
          parsedSections = null;
        }
      }
    }

    return {
      title: current?.title || roleDefault.title,
      summary: current?.summary || roleDefault.summary,
      contact: parsedSections?.contact || roleDefault.contact,
      guides: (parsedSections?.guides && parsedSections.guides.length > 0)
        ? parsedSections.guides
        : roleDefault.guides,
      faqs: (parsedSections?.faqs && parsedSections.faqs.length > 0)
        ? parsedSections.faqs
        : (Array.isArray(parsedSections) && parsedSections.length > 0)
          ? parsedSections.map((s) => ({ q: s.title || s.q, a: s.content || s.a }))
          : roleDefault.faqs,
      videoAcademy: parsedSections?.videoAcademy || null,
      historyPath: defaultHistoryPath || roleDefault.historyPath,
    };
  }, [current, roleDefault, defaultHistoryPath]);

  // Filter FAQs with live search
  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return pageData.faqs;
    const q = searchQuery.toLowerCase();
    return pageData.faqs.filter(
      (f) => (f.q && f.q.toLowerCase().includes(q)) || (f.a && f.a.toLowerCase().includes(q))
    );
  }, [pageData.faqs, searchQuery]);

  // Contact banner styling based on theme
  const contactTheme = pageData.contact?.theme || 'slate';
  const isRedTheme = contactTheme === 'red';
  const isDarkTheme = contactTheme === 'dark';
  const isBlueTheme = contactTheme === 'blue';

  const location = useLocation();
  const newPath = (pageData.historyPath || defaultHistoryPath || '/admin/help/history').replace('/history', '/new');

  const getBreadcrumbs = () => {
    const path = location.pathname;
    let portal = { label: 'Admin', to: '/admin/dashboard' };
    if (path.startsWith('/superadmin')) {
      portal = { label: 'SuperAdmin', to: '/superadmin/dashboard' };
    } else if (path.startsWith('/fleet-operator') || path.startsWith('/fleet-manager')) {
      portal = { label: 'Fleet Operator', to: '/fleet-operator/dashboard' };
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
      { label: pageData.title || 'Help & Support' },
    ];
  };

  return (
    <div className="w-full space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Standard Reusable Breadcrumb */}
      <Breadcrumb items={getBreadcrumbs()} />

      {/* 1. Header with Breadcrumbs & Ticket History */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {pageData.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            {pageData.summary}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap w-full sm:w-auto">
          <Link
            to={newPath}
            className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <FleetIcons.Plus className="w-4 h-4 text-white shrink-0" />
            <span>Raise Support Ticket</span>
          </Link>
          {pageData.historyPath && (
            <Link
              to={pageData.historyPath}
              className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <FleetIcons.Ticket className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>View Ticket History</span>
            </Link>
          )}
        </div>
      </div>

      {/* 2. Contact / Emergency Hotline Hero Banner */}
      {isRedTheme ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <FleetIcons.Phone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-700">
                {pageData.contact.badge || 'Transit Emergency SOS'}
              </span>
              <h2 className="text-lg font-black text-red-950">
                {pageData.contact.title}
              </h2>
              <p className="text-xs text-red-800 font-medium">
                {pageData.contact.description}
              </p>
            </div>
          </div>

          {showContactCta && normalizedKey !== 'ROLE-DRIVER' && pageData.contact?.ctaText && pageData.contact.ctaText.trim() ? (
            <button
              type="button"
              onClick={() => alert(pageData.contact.actionAlert || 'Calling control room...')}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all shrink-0 w-full sm:w-auto cursor-pointer"
            >
              {pageData.contact.ctaText}
            </button>
          ) : null}
        </div>
      ) : isDarkTheme ? (
        <div className="p-6 rounded-2xl bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
              <FleetIcons.Headset className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                {pageData.contact.badge || 'Dedicated Helpdesk'}
              </div>
              <h2 className="text-lg font-black text-white">
                {pageData.contact.title}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5 max-w-lg leading-relaxed">
                {pageData.contact.description}
              </p>
            </div>
          </div>

          {showContactCta && pageData.contact?.ctaText && pageData.contact.ctaText.trim() && pageData.contact.ctaText !== 'Access NOC Bridge' && normalizedKey !== 'ROLE-SUPER-ADMIN' ? (
            <button
              type="button"
              onClick={() => alert(pageData.contact.actionAlert || 'Connecting to support desk...')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer"
            >
              {pageData.contact.ctaText}
            </button>
          ) : null}
        </div>
      ) : isBlueTheme ? (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0">
              <FleetIcons.Phone className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-blue-200 uppercase tracking-wider">
                {pageData.contact.badge || 'Direct Support Line'}
              </div>
              <h2 className="text-lg font-black text-white">
                {pageData.contact.title}
              </h2>
              <p className="text-xs text-blue-100 mt-0.5 max-w-lg leading-relaxed">
                {pageData.contact.description}
              </p>
            </div>
          </div>

          {showContactCta && pageData.contact?.ctaText && pageData.contact.ctaText.trim() ? (
            <button
              type="button"
              onClick={() => alert(pageData.contact.actionAlert || 'Connecting to support line...')}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-blue-50 text-blue-900 text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer"
            >
              {pageData.contact.ctaText}
            </button>
          ) : null}
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <FleetIcons.Headset className="w-6 h-6 text-slate-700" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {pageData.contact.badge || 'Helpdesk'}
              </span>
              <h2 className="text-base font-black text-slate-900">
                {pageData.contact.title}
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                {pageData.contact.description}
              </p>
            </div>
          </div>

          {showContactCta && pageData.contact?.ctaText && pageData.contact.ctaText.trim() ? (
            <button
              type="button"
              onClick={() => alert(pageData.contact.actionAlert || 'Initiating support request...')}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
            >
              {pageData.contact.ctaText}
            </button>
          ) : null}
        </div>
      )}

      {/* 3. Quick Help Tiles (4 Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: 'FAQs',
            sub: 'Common questions & solutions',
            Icon: FleetIcons.HelpCircle,
            action: () => document.querySelector('#role-faqs-section')?.scrollIntoView({ behavior: 'smooth' }),
          },
          {
            label: 'User Guides',
            sub: 'Step-by-step SOP manuals',
            Icon: FleetIcons.Book,
            action: () => document.querySelector('#role-guides-section')?.scrollIntoView({ behavior: 'smooth' }),
          },
          {
            label: 'Video Tutorials',
            sub: Array.isArray(pageData.videoAcademy?.videos) && pageData.videoAcademy.videos.length > 0
              ? `${pageData.videoAcademy.videos.length} video guide${pageData.videoAcademy.videos.length > 1 ? 's' : ''}`
              : 'Interactive walkthroughs',
            Icon: FleetIcons.Video,
            action: () => setShowVideoModal(true),
          },
          {
            label: 'Best Practices',
            sub: 'Safety, compliance & uptime',
            Icon: FleetIcons.Sparkles,
            action: () => alert('Viewing Recommended Best Practices & Safety SOPs'),
          },
        ].map((tile) => (
          <div
            key={tile.label}
            onClick={tile.action}
            className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 text-center hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group flex flex-col items-center justify-center"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <tile.Icon className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-900 mt-1">{tile.label}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{tile.sub}</p>
          </div>
        ))}
      </div>

      {/* 4. Quick Help Guides (4 Grid Cards) */}
      <div id="role-guides-section" className="space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Standard Operating Procedures & Guides
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pageData.guides.map((guide, idx) => {
            const IconComp = FleetIcons[guide.icon] || FleetIcons.Document;
            const rawDocUrl = guide.docUrl || guide.pdfUrl || guide.url;
            // Resolve to absolute URL — handles /uploads/... relative paths
            const docUrl = rawDocUrl ? resolveFileUrl(rawDocUrl) : null;
            const hasPdf = Boolean(docUrl);

            const handleGuideClick = () => {
              if (docUrl) {
                window.open(docUrl, '_blank', 'noopener,noreferrer');
              } else {
                toast.error(`No PDF document attached for "${guide.title}". Please contact your administrator.`);
              }
            };

            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                onClick={handleGuideClick}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-100 dark:border-zinc-800 group-hover:bg-slate-100 dark:group-hover:bg-zinc-800 transition-colors">
                      <IconComp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    {hasPdf && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                        PDF
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {guide.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5 leading-relaxed">
                    {guide.desc}
                  </p>
                </div>
                <span className={`text-xs font-bold mt-4 flex items-center gap-1.5 ${
                  hasPdf ? 'text-blue-600 dark:text-blue-400 group-hover:underline' : 'text-slate-400 dark:text-zinc-500'
                }`}>
                  {hasPdf && <FleetIcons.Download className="w-3.5 h-3.5" />}
                  <span>{hasPdf ? 'Download / Read SOP' : 'No PDF attached'}</span>
                  {hasPdf && <FleetIcons.ChevronRight className="w-3.5 h-3.5" />}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Support FAQs Accordion with Live Search */}
      <div id="role-faqs-section" className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Frequently Asked Questions (FAQs)
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Common solutions, operational guidelines, and troubleshooting instructions
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <FleetIcons.Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            />
          </div>
        </div>

        {/* FAQs List */}
        <div className="space-y-3">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <details
                  key={idx}
                  open={isOpen}
                  className="group p-4 bg-slate-50 rounded-xl border border-slate-100 open:bg-white open:border-slate-200 transition-all"
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenFaq(isOpen ? null : idx);
                  }}
                >
                  <summary className="text-xs font-bold text-slate-900 cursor-pointer list-none flex items-center justify-between">
                    <span>{faq.q}</span>
                    <span className={`text-slate-400 text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </summary>
                  {isOpen && (
                    <p className="text-xs text-slate-600 font-medium mt-2.5 pt-2 border-t border-slate-100 leading-relaxed whitespace-pre-line">
                      {faq.a}
                    </p>
                  )}
                </details>
              );
            })
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs">
              No help topics match your search. Try different keywords.
            </div>
          )}
        </div>
      </div>

      {/* 6. Video Tutorials Interactive Modal */}
      <VideoTutorialsModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        role={roleCode}
        academyData={pageData.videoAcademy}
      />
    </div>
  );
};

export default RoleHelpPage;
