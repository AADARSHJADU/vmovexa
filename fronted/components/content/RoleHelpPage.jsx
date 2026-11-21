import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../FleetIcons';
import { VideoTutorialsModal } from '../VideoTutorialsModal';
import { useContent } from '../../hooks/shared/useContent';
import { ROLE_HELP_DEFAULTS } from '../../constants/roleHelpConstants';
import { resolveFileUrl } from '../../api/services/upload.service.js';
import { Breadcrumb } from '../ui/Breadcrumb';

export const RoleHelpPage = ({ roleCode, defaultHistoryPath, showContactCta = true }) => {
  const { t } = useTranslation();
  const { loadPage, getPage } = useContent();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

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

    const isTech = roleCode === 'ROLE-CENTRAL-TECH';
    const isFinance = roleCode === 'ROLE-FINANCE-OFFICER';
    const isGov = roleCode === 'ROLE-GOVT-AGENCY';
    const defaultTitle = isTech
      ? t('technician.help.title', roleDefault.title)
      : isFinance
        ? t('finance.help.title', roleDefault.title)
        : roleDefault.title;

    const defaultSummary = isTech
      ? t('technician.help.summary', roleDefault.summary)
      : isFinance
        ? t('finance.help.summary', roleDefault.summary)
        : roleDefault.summary;

    const defaultContact = isTech ? {
      ...roleDefault.contact,
      badge: t('technician.help.noc_badge', roleDefault.contact?.badge),
      description: t('technician.help.noc_desc', roleDefault.contact?.description),
    } : isFinance ? {
      ...roleDefault.contact,
      badge: t('finance.help.desk_badge', roleDefault.contact?.badge),
      description: t('finance.help.desk_desc', roleDefault.contact?.description),
    } : roleDefault.contact;

    const defaultGuides = isTech ? [
      { title: t('technician.help.guide1_title', 'Display Mounting Guide'), desc: t('technician.help.guide1_desc', 'Commercial 15.6" screen installation'), icon: 'Document' },
      { title: t('technician.help.guide2_title', 'CAN-bus J1939 Pinouts'), desc: t('technician.help.guide2_desc', 'OBD-II baud rates & telemetry binding'), icon: 'Car' },
      { title: t('technician.help.guide3_title', 'Firmware Recovery Runbook'), desc: t('technician.help.guide3_desc', 'RK3588 recovery & cache wipe SOP'), icon: 'Shield' },
      { title: t('technician.help.guide4_title', 'Depot Spares RMA'), desc: t('technician.help.guide4_desc', 'Warranty replacement & parts inventory'), icon: 'Clock' },
    ] : isFinance ? [
      { title: t('finance.help.guide1_title', 'GSTR-1 Filing SOP'), desc: t('finance.help.guide1_desc', 'Tax invoice export & HSN/SAC breakdown'), icon: 'Document' },
      { title: t('finance.help.guide2_title', 'Gateway Reconciliation'), desc: t('finance.help.guide2_desc', 'Razorpay / Cashfree settlement matching'), icon: 'Clock' },
      { title: t('finance.help.guide3_title', 'Wallet Escrow Rules'), desc: t('finance.help.guide3_desc', 'Advertiser deposit handling & auto-reload'), icon: 'Shield' },
      { title: t('finance.help.guide4_title', 'Credit Notes & Disputes'), desc: t('finance.help.guide4_desc', 'Screen downtime SLA rebates'), icon: 'Car' },
    ] : roleDefault.guides;

    const defaultFaqs = isFinance ? [
      {
        q: t('finance.help.faq1_q', 'When are daily advertiser billing deductions processed?'),
        a: t('finance.help.faq1_a', 'Daily ad campaign spend is settled from advertiser wallet balances at 23:59:59 IST based on verified impression telemetry logs.'),
      },
      {
        q: t('finance.help.faq2_q', 'How are HSN/SAC codes applied for transit advertising?'),
        a: t('finance.help.faq2_a', 'Transit digital advertising is classified under SAC 998363 (Sale of advertising space or time on transit media) at 18% GST.'),
      },
      {
        q: t('finance.help.faq3_q', 'How to resolve bank reconciliation mismatches?'),
        a: t('finance.help.faq3_a', 'Upload the monthly bank statement CSV in Financial Reconciliation. The engine automatically matches UTR numbers against payment gateway deposits.'),
      },
      {
        q: t('finance.help.faq4_q', 'What is the procedure for issuing screen outage credit notes?'),
        a: t('finance.help.faq4_a', 'When an advertiser files an SLA dispute verified by NOC telemetry, finance officers can issue a credit note credited directly back to the advertiser wallet.'),
      },
    ] : isGov ? [
      {
        q: t('gov.help.faq1_q', 'How do I trigger an emergency public notice across all city transit displays?'),
        a: t('gov.help.faq1_a', 'Go to Broadcast Announcements, select "Emergency Alert", define the geographic zones or routes, set the alert duration, and confirm with your dual-factor authentication PIN.'),
      },
      {
        q: t('gov.help.faq2_q', 'How frequently is passenger density telemetry updated?'),
        a: t('gov.help.faq2_a', 'Commuter load telemetry is aggregated from GPS, smart ticketing, and stop camera sensors every 60 seconds across all active municipal routes.'),
      },
      {
        q: t('gov.help.faq3_q', 'How to export statutory compliance logs for state audits?'),
        a: t('gov.help.faq3_a', 'Navigate to Compliance Reports, select the audit date range, and export tamper-proof SHA-256 signed CSV or PDF audit bundles.'),
      },
      {
        q: t('gov.help.faq4_q', 'What are the safety standards required for commercial ad displays?'),
        a: t('gov.help.faq4_a', 'All transit displays adhere to automotive vibration (ISO 16750) and flame-retardant safety standards with mandatory auto-dimming during night transit.'),
      },
    ] : roleDefault.faqs;

    return {
      title: current?.title || defaultTitle,
      summary: current?.summary || defaultSummary,
      contact: parsedSections?.contact || defaultContact,
      guides: (parsedSections?.guides && parsedSections.guides.length > 0)
        ? parsedSections.guides
        : defaultGuides,
      faqs: (parsedSections?.faqs && parsedSections.faqs.length > 0)
        ? parsedSections.faqs
        : (Array.isArray(parsedSections) && parsedSections.length > 0)
          ? parsedSections.map((s) => ({ q: s.title || s.q, a: s.content || s.a }))
          : defaultFaqs,
      videoAcademy: parsedSections?.videoAcademy || null,
      historyPath: defaultHistoryPath || roleDefault.historyPath,
    };
  }, [current, roleDefault, defaultHistoryPath, roleCode, t]);

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
  const isSuperAdmin = location.pathname.startsWith('/superadmin');
  const rawHistory = pageData.historyPath || defaultHistoryPath || '/admin/help/history';
  const resolvedHistoryPath = isSuperAdmin && !rawHistory.startsWith('/superadmin')
    ? `/superadmin${rawHistory}`
    : rawHistory;
  const newPath = resolvedHistoryPath.replace('/history', '/new');

  const getBreadcrumbs = () => {
    const path = location.pathname;
    let portal = { label: t('ag.admin.admin_operations', 'Admin Operations'), to: '/admin/dashboard' };
    if (path.startsWith('/superadmin')) {
      portal = { label: t('roles.superadmin', 'Super Admin'), to: '/superadmin/dashboard' };
    } else if (path.startsWith('/fleet-operator') || path.startsWith('/fleet-manager')) {
      portal = { label: t('roles.fleet_operator', 'Fleet Operator'), to: '/fleet-operator/dashboard' };
    } else if (path.startsWith('/driver')) {
      portal = { label: t('roles.driver', 'Driver'), to: '/driver/dashboard' };
    } else if (path.startsWith('/advertiser')) {
      portal = { label: t('roles.advertiser', 'Advertiser'), to: '/advertiser/dashboard' };
    } else if (path.startsWith('/government')) {
      portal = { label: t('roles.government', 'Government'), to: '/government/dashboard' };
    } else if (path.startsWith('/technician')) {
      portal = { label: t('roles.technician', 'Technician'), to: '/technician/dashboard' };
    } else if (path.startsWith('/finance')) {
      portal = { label: t('nav.headers.finance_portal', 'Finance Portal'), to: '/finance/dashboard' };
    }
    return [
      portal,
      { label: pageData.title || t('common.help_support', 'Help & Support') },
    ];
  };

  return (
    <div className="w-full space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Standard Reusable Breadcrumb */}
      <Breadcrumb items={getBreadcrumbs()} />

      {/* 1. Header with Breadcrumbs & Ticket History */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {pageData.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            {pageData.summary}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-nowrap">
          <Link
            to={newPath}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <FleetIcons.Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
            <span>{t('ag.shared.rolehelppage.raise_ticket', 'Raise Ticket')}</span>
          </Link>
          {pageData.historyPath && (
            <Link
              to={resolvedHistoryPath}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <FleetIcons.Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 dark:text-slate-400 shrink-0" />
              <span>{t('ag.shared.rolehelppage.ticket_history', 'Ticket History')}</span>
            </Link>
          )}
        </div>
      </div>

      {/* 2. Contact / Emergency Hotline Hero Banner — Gradient for all portals */}
      {isRedTheme ? (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 border border-violet-500/30 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl shadow-violet-500/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner backdrop-blur-md">
              <FleetIcons.Phone className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-white uppercase tracking-wider">
                {pageData.contact.badge}
              </div>
              <h2 className="text-lg font-black text-white tracking-tight">
                {pageData.contact.title}
              </h2>
              <p className="text-xs text-white mt-0.5 max-w-lg leading-relaxed">
                {pageData.contact.description}
              </p>
            </div>
          </div>
          {showContactCta && normalizedKey !== 'ROLE-DRIVER' && pageData.contact?.ctaText && pageData.contact.ctaText.trim() ? (
            <button
              type="button"
              onClick={() => alert(pageData.contact.actionAlert || 'Calling control room...')}
              className="px-6 py-2.5 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-bold rounded-xl shadow-sm transition-all shrink-0 w-full sm:w-auto cursor-pointer"
            >
              {pageData.contact.ctaText}
            </button>
          ) : null}
        </div>
      ) : isDarkTheme ? (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 border border-violet-500/30 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl shadow-violet-500/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner backdrop-blur-md">
              <FleetIcons.Headset className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-white uppercase tracking-wider">
                {pageData.contact.badge}
              </div>
              <h2 className="text-lg font-black text-white tracking-tight">
                {pageData.contact.title}
              </h2>
              <p className="text-xs text-white mt-0.5 max-w-lg leading-relaxed">
                {pageData.contact.description}
              </p>
            </div>
          </div>
          {showContactCta && pageData.contact?.ctaText && pageData.contact.ctaText.trim() && pageData.contact.ctaText !== 'Access NOC Bridge' && normalizedKey !== 'ROLE-SUPER-ADMIN' && normalizedKey !== 'ROLE-FLEET-OPERATOR' ? (
            <button
              type="button"
              onClick={() => alert(pageData.contact.actionAlert || 'Connecting to support desk...')}
              className="px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer"
            >
              {pageData.contact.ctaText}
            </button>
          ) : null}
        </div>
      ) : isBlueTheme ? (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 border border-violet-500/30 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl shadow-violet-500/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner backdrop-blur-md">
              <FleetIcons.Phone className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-white uppercase tracking-wider">
                {pageData.contact.badge}
              </div>
              <h2 className="text-lg font-black text-white">
                {pageData.contact.title}
              </h2>
              <p className="text-xs text-white mt-0.5 max-w-lg leading-relaxed">
                {pageData.contact.description}
              </p>
            </div>
          </div>
          {showContactCta && pageData.contact?.ctaText && pageData.contact.ctaText.trim() ? (
            <button
              type="button"
              onClick={() => alert(pageData.contact.actionAlert || 'Connecting to support line...')}
              className="px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer"
            >
              {pageData.contact.ctaText}
            </button>
          ) : null}
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 border border-violet-500/30 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl shadow-violet-500/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner backdrop-blur-md">
              <FleetIcons.Headset className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-white uppercase tracking-wider">
                {pageData.contact.badge}
              </div>
              <h2 className="text-base font-black text-white">
                {pageData.contact.title}
              </h2>
              <p className="text-xs text-white mt-0.5 max-w-lg leading-relaxed">
                {pageData.contact.description}
              </p>
            </div>
          </div>
          {showContactCta && pageData.contact?.ctaText && pageData.contact.ctaText.trim() ? (
            <button
              type="button"
              onClick={() => alert(pageData.contact.actionAlert || 'Initiating support request...')}
              className="px-5 py-2.5 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer"
            >
              {pageData.contact.ctaText}
            </button>
          ) : null}
        </div>
      )}

      {/* 3. Quick Help Tiles (3 Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          {
            label: t('common.faqs', 'FAQs'),
            sub: t('ag.shared.rolehelppage.faqs_sub', 'Common questions & solutions'),
            Icon: FleetIcons.HelpCircle,
            action: () => document.querySelector('#role-faqs-section')?.scrollIntoView({ behavior: 'smooth' }),
          },
          {
            label: t('common.user_guides', 'User Guides'),
            sub: t('ag.shared.rolehelppage.user_guides_sub', 'Step-by-step SOP manuals'),
            Icon: FleetIcons.Book,
            action: () => document.querySelector('#role-guides-section')?.scrollIntoView({ behavior: 'smooth' }),
          },
          {
            label: t('common.video_tutorials', 'Video Tutorials'),
            sub: Array.isArray(pageData.videoAcademy?.videos) && pageData.videoAcademy.videos.length > 0
              ? `${pageData.videoAcademy.videos.length} ${t('common.video_tutorials', 'Video Tutorials')}`
              : t('ag.shared.rolehelppage.video_tutorials_sub', 'Interactive walkthroughs'),
            Icon: FleetIcons.Video,
            action: () => setShowVideoModal(true),
          },
        ].map((tile) => (
          <div
            key={tile.label}
            onClick={tile.action}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 text-center hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all cursor-pointer group flex flex-col items-center justify-center"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <tile.Icon className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">{tile.label}</p>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">{tile.sub}</p>
          </div>
        ))}
      </div>

      {/* 4. Quick Help Guides (4 Grid Cards) */}
      <div id="role-guides-section" className="space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {t('ag.shared.rolehelppage.standard_operating_procedures_and_guides', 'Standard Operating Procedures & Guides')}
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
                toast.error(t(
                  'ag.shared.rolehelppage.no_pdf_document_attached',
                  'No PDF document is attached for "{{title}}". Please contact your administrator.',
                  { title: guide.title }
                ));
              }
            };

            return (
              <div
                key={idx}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                onClick={handleGuideClick}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-100 dark:border-zinc-800 group-hover:bg-slate-100 dark:group-hover:bg-zinc-800 transition-colors">
                      <IconComp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    {hasPdf && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                        {t('ag.shared.rolehelppage.pdf', 'PDF')}
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
                  <span>{hasPdf ? t('common.download_read_sop', 'Download / Read SOP') : t('common.no_pdf_attached', 'No PDF attached')}</span>
                  {hasPdf && <FleetIcons.ChevronRight className="w-3.5 h-3.5" />}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Support FAQs Accordion with Live Search */}
      <div id="role-faqs-section" className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              {t('ag.shared.rolehelppage.frequently_asked_questions_faqs', 'Frequently Asked Questions (FAQs)')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              {t('ag.shared.rolehelppage.common_solutions_operational_guidelines_and_', 'Common solutions, operational guidelines, and troubleshooting instructions')}
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <FleetIcons.Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('ag.shared.rolehelppage.search_help_topics', 'Search help topics...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
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
                  className="group min-w-0 overflow-hidden p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-100 dark:border-zinc-800/60 open:bg-white dark:open:bg-zinc-900 open:border-slate-200 dark:open:border-zinc-700 transition-all"
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenFaq(isOpen ? null : idx);
                  }}
                >
                  <summary className="min-w-0 text-xs font-bold text-slate-900 dark:text-white cursor-pointer list-none flex items-start justify-between gap-3">
                    <span className="min-w-0 flex-1 whitespace-normal break-words [overflow-wrap:anywhere]">{faq.q}</span>
                    <FleetIcons.ChevronDown className={`w-4 h-4 shrink-0 text-slate-400 dark:text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </summary>
                  {isOpen && (
                    <p className="min-w-0 text-xs text-slate-600 dark:text-zinc-300 font-medium mt-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800 leading-relaxed whitespace-pre-line break-words [overflow-wrap:anywhere]">
                      {faq.a}
                    </p>
                  )}
                </details>
              );
            })
          ) : (
            <div className="text-center py-6 text-slate-400 dark:text-zinc-500 text-xs">
              {t('ag.shared.rolehelppage.no_help_topics_match_your_search_try_differe', 'No help topics match your search. Try different keywords.')}
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
