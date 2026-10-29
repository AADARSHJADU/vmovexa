import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useContent } from '../../hooks/shared/useContent';
import { useTranslation } from '../../hooks/useTranslation';
import { ROLE_HELP_DEFAULTS } from '../../constants/roleHelpConstants';
import { VideoTutorialsModal } from '../../components/VideoTutorialsModal';
import { uploadFile, uploadVideo, resolveFileUrl } from '../../api/services/upload.service.js';
import { VIDEO_CATEGORIES, SKILL_LEVELS } from '../../constants/videoConstants.js';

const DOCUMENT_TYPES = [
  { key: 'terms', label: 'Terms & Conditions', icon: 'Document' },
  { key: 'privacy', label: 'Privacy Policy', icon: 'Shield' },
  { key: 'help', label: 'Help & Documentation', icon: 'Help' },
];

const ROLES = [
  { code: 'GLOBAL', label: 'Global (Platform Default)' },
  { code: 'ROLE-TENANT-ADMIN', label: 'Tenant Organization Admin' },
  { code: 'ROLE-FLEET-OPERATOR', label: 'Fleet Manager / Operator' },
  { code: 'ROLE-DRIVER', label: 'Transit Driver' },
  { code: 'ROLE-CENTRAL-TECH', label: 'Central Pool Technician' },
  { code: 'ROLE-ADVERTISER', label: 'Commercial Advertiser' },
  { code: 'ROLE-GOVT-AGENCY', label: 'Government Public Agency' },
  { code: 'ROLE-FINANCE-OFFICER', label: 'Corporate Finance Officer' },
  { code: 'ROLE-SUPER-ADMIN', label: 'Super Admin' },
];

const GUIDE_ICONS = ['Document', 'Car', 'Shield', 'Clock', 'Phone', 'Headset', 'Help'];

export const SuperContentManagerPage = () => {
  const { t } = useTranslation();
  const { loadList, createPage, updatePage, publishPage } = useContent();

  const [activeType, setActiveType] = useState('terms');
  const [activeRole, setActiveRole] = useState('GLOBAL');
  const [currentId, setCurrentId] = useState(null);
  const [status, setStatus] = useState('published');
  const [version, setVersion] = useState(1);
  const [saving, setSaving] = useState(false);

  // Common Form Fields
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');

  // Policy Q&A Sections (for Terms & Privacy)
  const [sections, setSections] = useState([
    { id: 'sec-1', title: '', content: '' },
  ]);

  // Help & Documentation Studio Fields
  const [helpSubTab, setHelpSubTab] = useState('contact'); // 'contact' | 'guides' | 'faqs' | 'videos'
  const [helpContact, setHelpContact] = useState({
    theme: 'dark',
    badge: 'Helpdesk 24/7',
    title: 'support@vmovexa.com / 1800-VMOVEXA',
    description: 'Direct assistance for platform operations, device pairing, and dispatch.',
    ctaText: 'Open Priority Ticket',
  });
  const [helpGuides, setHelpGuides] = useState([
    { title: 'User Guide', desc: 'Step-by-step instructions', icon: 'Document', docUrl: '' },
    { title: 'Hardware SOP', desc: 'Hardware & GPS device setup', icon: 'Car', docUrl: '' },
    { title: 'Safety Protocols', desc: 'Transit emergency SOP', icon: 'Shield', docUrl: '' },
    { title: 'Operations Timetable', desc: 'Roster & shift schedules', icon: 'Clock', docUrl: '' },
  ]);
  const [helpFaqs, setHelpFaqs] = useState([
    { q: 'How do I submit an emergency ticket?', a: 'Click the Contact Helpdesk button or call the direct support hotline.' },
  ]);
  const [helpVideoAcademy, setHelpVideoAcademy] = useState({
    badge: 'Video Academy',
    title: 'Interactive Video Tutorials & Walkthroughs',
    description: 'Learn step-by-step with practical video lessons and system runbooks.',
    videos: [],
  });

  // Modal test state in Preview
  const [showPreviewVideoModal, setShowPreviewVideoModal] = useState(false);

  // Preview Search
  const [previewSearch, setPreviewSearch] = useState('');

  // Per-video upload state: { [idx]: { progress: 0-100, uploading: bool, mode: 'url'|'upload' } }
  const [videoUploadStates, setVideoUploadStates] = useState({});
  const videoFileInputRefs = useRef({});

  // Per-guide PDF upload state: { [idx]: { uploading: bool, progress: 0-100 } }
  const [guideUploadStates, setGuideUploadStates] = useState({});
  const guideFileInputRefs = useRef({});
  // Per-guide PENDING file (File object) — selected but not yet uploaded to server
  // Upload only happens when user clicks "Save & Publish Live"
  const [guidePendingFiles, setGuidePendingFiles] = useState({});

  const getVideoState = (idx) => videoUploadStates[idx] || { progress: 0, uploading: false, mode: 'url' };

  const setVideoState = (idx, patch) => {
    setVideoUploadStates((prev) => ({ ...prev, [idx]: { ...getVideoState(idx), ...patch } }));
  };

  // Handle server-side video file upload for a lesson slot
  const handleVideoFileUpload = async (idx, file) => {
    if (!file) return;
    const MAX = 500 * 1024 * 1024;
    if (file.size > MAX) {
      toast.error('Video file too large. Maximum allowed size is 500 MB.');
      return;
    }
    setVideoState(idx, { uploading: true, progress: 0 });
    try {
      const result = await uploadVideo(file, (pct) => setVideoState(idx, { progress: pct }));
      handleUpdateVideo(idx, 'url', result.url);
      handleUpdateVideo(idx, 'fileName', result.fileName);
      toast.success(`Video "${result.fileName}" uploaded successfully!`);
      setVideoState(idx, { uploading: false, progress: 100, mode: 'upload' });
    } catch (err) {
      toast.error(err?.message || 'Video upload failed. Please try again.');
      setVideoState(idx, { uploading: false, progress: 0 });
    }
  };

  // Handle PDF file selection — store File object locally, DO NOT upload yet
  // Upload happens only when user clicks "Save & Publish Live"
  const handleGuideFileSelect = (idx, file) => {
    if (!file) return;
    const MAX = 50 * 1024 * 1024;
    if (file.size > MAX) {
      toast.error('Document too large. Maximum size is 50 MB.');
      return;
    }
    setGuidePendingFiles((prev) => ({ ...prev, [idx]: file }));
    // Clear any previously saved URL for this slot so UI shows pending state
    handleUpdateGuide(idx, 'docUrl', '');
    handleUpdateGuide(idx, 'fileName', '');
  };

  // Remove a pending (unsaved) file selection
  const handleRemoveGuidePending = (idx) => {
    setGuidePendingFiles((prev) => { const n = { ...prev }; delete n[idx]; return n; });
    // Reset the file input so the same file can be re-selected
    if (guideFileInputRefs.current[idx]) guideFileInputRefs.current[idx].value = '';
  };

  // Load content for active (type, role)
  const loadActiveContent = useCallback(async () => {
    try {
      const roleParam = activeRole === 'GLOBAL' ? 'GLOBAL' : activeRole;
      const res = await loadList({ type: activeType, role: roleParam });
      const items = Array.isArray(res) ? res : (res?.rows || res?.items || []);

      // Filter exact role match
      const matching = items.filter((p) => {
        if (activeRole === 'GLOBAL') return !p.role_code || p.role_code === 'GLOBAL' || p.is_global;
        return p.role_code === activeRole;
      });

      // Prefer published, else highest version
      const chosen = matching.find((p) => p.status === 'published')
        || matching.sort((a, b) => (b.version || 0) - (a.version || 0))[0];

      const roleDefaults = ROLE_HELP_DEFAULTS[activeRole] || ROLE_HELP_DEFAULTS['GLOBAL'] || ROLE_HELP_DEFAULTS['ROLE-DRIVER'];

      if (chosen) {
        setCurrentId(chosen.id);
        setTitle(chosen.title || '');
        setSummary(chosen.summary || '');
        setStatus(chosen.status || 'published');
        setVersion(chosen.version || 1);

        // Parse sections
        let parsed = chosen.sections;
        if (typeof parsed === 'string') {
          try {
            parsed = JSON.parse(parsed);
          } catch {
            parsed = null;
          }
        }

        if (activeType === 'help') {
          // Structured Help Object
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            setHelpContact(parsed.contact || roleDefaults.contact);
            setHelpGuides(parsed.guides && parsed.guides.length > 0 ? parsed.guides : roleDefaults.guides);
            setHelpFaqs(parsed.faqs && parsed.faqs.length > 0 ? parsed.faqs : roleDefaults.faqs);
            setHelpVideoAcademy(parsed.videoAcademy || {
              badge: `${roleDefaults.title.split(' ')[0]} Academy`,
              title: `${roleDefaults.title} Video Tutorials`,
              description: 'Step-by-step video guides and interactive walkthroughs.',
              videos: [],
            });
          } else {
            // Fallback from defaults
            setHelpContact(roleDefaults.contact);
            setHelpGuides(roleDefaults.guides);
            setHelpFaqs(roleDefaults.faqs);
            setHelpVideoAcademy({
              badge: `${roleDefaults.title.split(' ')[0]} Academy`,
              title: `${roleDefaults.title} Video Tutorials`,
              description: 'Step-by-step video guides and interactive walkthroughs.',
              videos: [],
            });
          }
        } else {
          // Terms / Privacy Q&A Array
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSections(parsed);
          } else if (chosen.body_html) {
            setSections([
              {
                id: 'sec-1',
                title: chosen.title || 'General Clause',
                content: chosen.body_html.replace(/<[^>]*>?/gm, '').trim(),
              },
            ]);
          } else {
            setSections([{ id: 'sec-1', title: '', content: '' }]);
          }
        }
      } else {
        // New empty configuration for this role & type
        setCurrentId(null);
        setStatus('published');
        setVersion(1);
        const roleObj = ROLES.find((r) => r.code === activeRole);
        const typeObj = DOCUMENT_TYPES.find((t) => t.key === activeType);
        setTitle(activeRole === 'GLOBAL' ? `Platform ${typeObj?.label}` : `${roleObj?.label} ${typeObj?.label}`);
        setSummary(`Official ${typeObj?.label.toLowerCase()} framework for ${roleObj?.label.toLowerCase()}.`);

        if (activeType === 'help') {
          setHelpContact(roleDefaults.contact);
          setHelpGuides(roleDefaults.guides);
          setHelpFaqs(roleDefaults.faqs);
          setHelpVideoAcademy({
            badge: `${roleDefaults.title.split(' ')[0]} Academy`,
            title: `${roleDefaults.title} Video Tutorials`,
            description: 'Step-by-step video guides and interactive walkthroughs.',
            videos: [],
          });
        } else {
          setSections([
            { id: 'sec-1', title: '1. General Terms & Operating Principles', content: 'Standard platform policy guidelines and regulatory compliance terms.' },
          ]);
        }
      }
    } catch {
      // Handled
    }
  }, [activeType, activeRole, loadList]);

  useEffect(() => {
    // Clear pending file selections when switching role or content type
    setGuidePendingFiles({});
    setGuideUploadStates({});
    loadActiveContent();
  }, [loadActiveContent]);

  // Construct current payload based on activeType
  // guidesOverride: pass updated guides array directly when PDFs have just been uploaded
  // (React setState is async so helpGuides might still be stale at call time)
  const constructPayload = (guidesOverride = null) => {
    const guidesToUse = guidesOverride || helpGuides;
    const payloadSections = activeType === 'help'
      ? {
          contact: helpContact,
          guides: guidesToUse,
          faqs: helpFaqs.filter((f) => f.q.trim() || f.a.trim()),
          videoAcademy: helpVideoAcademy,
        }
      : sections.filter((s) => s.title.trim() || s.content.trim());

    return {
      type: activeType,
      role_code: activeRole === 'GLOBAL' ? null : activeRole,
      title,
      summary,
      sections: payloadSections,
    };
  };

  // Single Action: Save & Publish Live
  // Step 1: Upload any pending guide PDF files first
  // Step 2: Save page content to DB
  // Step 3: Publish live
  const handlePublish = async () => {
    setSaving(true);
    try {
      // ── Step 1: Upload pending PDF files ──────────────────────────────────────
      const pendingEntries = Object.entries(guidePendingFiles);
      let updatedGuides = [...helpGuides]; // hoisted: updated in-place if PDFs are pending
      if (pendingEntries.length > 0) {
        toast.loading(`Uploading ${pendingEntries.length} SOP document(s)...`, { id: 'pdf-upload' });
        for (const [idxStr, file] of pendingEntries) {
          const idx = Number(idxStr);
          setGuideUploadStates((prev) => ({ ...prev, [idx]: { uploading: true, progress: 0 } }));
          try {
            const result = await uploadFile(
              file,
              'sop_document',
              (pct) => setGuideUploadStates((prev) => ({ ...prev, [idx]: { uploading: true, progress: pct } }))
            );
            const rawUrl = result.url || result.path || result.fileUrl || (typeof result === 'string' ? result : '');
            const absoluteUrl = resolveFileUrl(rawUrl);
            const fileName = result.fileName || result.originalname || file.name;
            updatedGuides[idx] = { ...updatedGuides[idx], docUrl: absoluteUrl, fileName };
          } catch (uploadErr) {
            toast.dismiss('pdf-upload');
            toast.error(`Failed to upload "${file.name}": ${uploadErr?.message || 'Unknown error'}`);
            setGuideUploadStates((prev) => ({ ...prev, [idx]: { uploading: false, progress: 0 } }));
            return; // Abort save if any upload fails
          } finally {
            setGuideUploadStates((prev) => ({ ...prev, [idx]: { uploading: false, progress: 0 } }));
          }
        }
        // Commit uploaded URLs into guide state
        setHelpGuides(updatedGuides);
        setGuidePendingFiles({});
        toast.dismiss('pdf-upload');
        toast.success(`${pendingEntries.length} SOP document(s) uploaded!`);
      }

      // ── Step 2 & 3: Save + Publish to DB ──────────────────────────────────────
      let pageIdToPublish = currentId;
      // IMPORTANT: pass updatedGuides directly — React setState is async so
      // helpGuides state may still be stale with empty docUrls at this point
      const payload = constructPayload(pendingEntries.length > 0 ? updatedGuides : null);


      if (currentId) {
        await updatePage(currentId, payload);
      } else {
        const created = await createPage({ ...payload, status: 'published' });
        pageIdToPublish = created?.id;
        setCurrentId(created?.id);
      }

      if (!pageIdToPublish) {
        throw new Error('No page ID found to publish.');
      }

      await toast.promise(publishPage(pageIdToPublish), {
        loading: 'Publishing content live to portal...',
        success: `Published live for ${ROLES.find((r) => r.code === activeRole)?.label}!`,
        error: (e) => e?.message || 'Publish failed',
      });

      await loadActiveContent();
    } catch {
      // toast handled
    } finally {
      setSaving(false);
    }
  };

  // Section Manipulations for Terms / Privacy
  const handleAddSection = () => {
    setSections([...sections, { id: `sec-${Date.now()}`, title: '', content: '' }]);
  };

  const handleUpdateSection = (idx, field, value) => {
    const updated = [...sections];
    updated[idx] = { ...updated[idx], [field]: value };
    setSections(updated);
  };

  const handleRemoveSection = (idx) => {
    if (sections.length <= 1) return;
    setSections(sections.filter((_, i) => i !== idx));
  };

  const handleMoveSection = (idx, dir) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= sections.length) return;
    const updated = [...sections];
    const temp = updated[idx];
    updated[idx] = updated[newIdx];
    updated[newIdx] = temp;
    setSections(updated);
  };

  // Help Studio FAQ Manipulations
  const handleAddFaq = () => {
    setHelpFaqs([...helpFaqs, { q: '', a: '' }]);
  };

  const handleUpdateFaq = (idx, field, value) => {
    const updated = [...helpFaqs];
    updated[idx] = { ...updated[idx], [field]: value };
    setHelpFaqs(updated);
  };

  const handleRemoveFaq = (idx) => {
    setHelpFaqs(helpFaqs.filter((_, i) => i !== idx));
  };

  // Help Studio Guides Manipulations
  const handleUpdateGuide = (idx, field, value) => {
    const updated = [...helpGuides];
    updated[idx] = { ...updated[idx], [field]: value };
    setHelpGuides(updated);
  };

  // Help Studio Video Manipulations
  const handleAddVideo = () => {
    const newVid = {
      id: `vid-${Date.now()}`,
      title: '',
      duration: '3:00 min',
      category: 'Getting Started',
      level: 'Beginner',
      url: '',
      desc: '',
      chapters: ['00:00 Introduction', '01:00 Setup'],
    };
    setHelpVideoAcademy({
      ...helpVideoAcademy,
      videos: [...helpVideoAcademy.videos, newVid],
    });
  };

  const handleUpdateVideo = (idx, field, value) => {
    const updatedVids = [...helpVideoAcademy.videos];
    updatedVids[idx] = { ...updatedVids[idx], [field]: value };
    setHelpVideoAcademy({ ...helpVideoAcademy, videos: updatedVids });
  };

  const handleRemoveVideo = (idx) => {
    const updatedVids = helpVideoAcademy.videos.filter((_, i) => i !== idx);
    setHelpVideoAcademy({ ...helpVideoAcademy, videos: updatedVids });
  };

  // Live preview filter for FAQs / Clauses
  const filteredPreviewFaqs = useMemo(() => {
    if (!previewSearch.trim()) return helpFaqs;
    const q = previewSearch.toLowerCase();
    return helpFaqs.filter((f) => (f.q && f.q.toLowerCase().includes(q)) || (f.a && f.a.toLowerCase().includes(q)));
  }, [helpFaqs, previewSearch]);

  const filteredPreviewSections = useMemo(() => {
    if (!previewSearch.trim()) return sections;
    const q = previewSearch.toLowerCase();
    return sections.filter((s) => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q));
  }, [sections, previewSearch]);

  const activeRoleName = ROLES.find((r) => r.code === activeRole)?.label;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Standard Reusable Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'SuperAdmin', to: '/superadmin/dashboard' },
          { label: 'Settings', to: '/superadmin/settings' },
          { label: 'Role Policy & Content Manager' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t('superadmin.content_manager.title', 'Role Policy & Content Manager')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            {t('superadmin.content_manager.subtitle', 'Configure Terms & Conditions, Privacy Policies, and Help Documentation per user role.')}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-end">
          {/* Pending PDF indicator */}
          {Object.keys(guidePendingFiles).length > 0 && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50 flex items-center gap-1.5">
              <FleetIcons.Document className="w-3.5 h-3.5" />
              <span>{t('superadmin.content_manager.pdfs_pending_save', '{count} PDF pending save', { count: Object.keys(guidePendingFiles).length })}</span>
            </span>
          )}

          <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50">
            ● {t('superadmin.content_manager.live_badge', 'Live v{version}.0', { version })}
          </span>

          <button
            onClick={handlePublish}
            disabled={saving}
            type="button"
            className="px-4.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <FleetIcons.Check className="w-4 h-4" />
            <span>
              {saving
                ? t('superadmin.content_manager.saving', 'Saving...')
                : Object.keys(guidePendingFiles).length > 0
                ? t('superadmin.content_manager.save_upload_pdfs', 'Save & Upload {count} PDF(s)', { count: Object.keys(guidePendingFiles).length })
                : t('superadmin.content_manager.save_publish_live', 'Save & Publish Live')}
            </span>
          </button>
        </div>
      </div>

      {/* Control Bar: Document Type Tabs & Role Dropdown */}
      <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Type Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800/80 p-1.5 rounded-xl self-start md:self-auto no-scrollbar overflow-x-auto">
          {DOCUMENT_TYPES.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveType(item.key)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeType === item.key
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>
                {item.key === 'terms'
                  ? t('superadmin.content_manager.tab_terms', 'Terms & Conditions')
                  : item.key === 'privacy'
                  ? t('superadmin.content_manager.tab_privacy', 'Privacy Policy')
                  : t('superadmin.content_manager.tab_help', 'Help & Documentation')}
              </span>
            </button>
          ))}
        </div>

        {/* Role Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 whitespace-nowrap">
            {t('superadmin.content_manager.lbl_target_role', 'Target Role Portal:')}
          </label>
          <select
            value={activeRole}
            onChange={(e) => setActiveRole(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          >
            {ROLES.map((r) => (
              <option key={r.code} value={r.code}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Left Editor & Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: EDITOR FORM */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-5">
          {/* Metadata Card */}
          <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                {activeType === 'help' ? t('superadmin.content_manager.help_doc_details', 'Help & Documentation Details') : t('superadmin.content_manager.doc_details', 'Document Details')} ({activeRoleName})
              </h2>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
                {activeType.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">{t('superadmin.content_manager.lbl_portal_title', 'Page / Portal Title')}</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('superadmin.content_manager.ph_portal_title', 'e.g. Driver Help & Documentation')}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">{t('superadmin.content_manager.lbl_subtitle_desc', 'Subtitle Description')}</label>
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder={t('superadmin.content_manager.ph_subtitle_desc', 'e.g. 24/7 Transit dispatch helpline, emergency road assistance, and operating manuals')}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* HELP & VIDEO STUDIO (when activeType === 'help') */}
          {/* ========================================================================= */}
          {activeType === 'help' ? (
            <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
              {/* Studio Sub-Navigation Tabs */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3 flex-wrap gap-2">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    {t('superadmin.content_manager.help_video_studio', 'Help & Video Studio')}
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                    {t('superadmin.content_manager.help_studio_desc', 'Configure contact hotline banner, SOP guides, FAQs, and video tutorials.')}
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl no-scrollbar overflow-x-auto">
                  {[
                    { key: 'contact', label: '📞 Contact Banner' },
                    { key: 'guides', label: '📖 4 SOP Guides' },
                    { key: 'faqs', label: `💬 FAQs (${helpFaqs.length})` },
                    { key: 'videos', label: `🎥 Videos (${helpVideoAcademy.videos.length})` },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setHelpSubTab(tab.key)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        helpSubTab === tab.key
                          ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-Tab 1: Contact Banner */}
              {helpSubTab === 'contact' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        Banner Theme Color
                      </label>
                      <select
                        value={helpContact.theme || 'dark'}
                        onChange={(e) => setHelpContact({ ...helpContact, theme: e.target.value })}
                        className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="red">{t('superadmin.content_manager.theme_emergency_sos', 'Emergency SOS (Red)')}</option>
                        <option value="dark">{t('superadmin.content_manager.theme_support_desk', 'Support Desk (Dark)')}</option>
                        <option value="blue">{t('superadmin.content_manager.theme_direct_channel', 'Direct Channel (Blue)')}</option>
                        <option value="slate">{t('superadmin.content_manager.theme_technical_support', 'Technical Support (Slate)')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        Top Badge Label
                      </label>
                      <input
                        type="text"
                        value={helpContact.badge || ''}
                        onChange={(e) => setHelpContact({ ...helpContact, badge: e.target.value })}
                        placeholder={t('superadmin.content_manager.ph_support_hours', 'e.g. Support Hours: 24/7')}
                        className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        Hotline / Contact Heading
                      </label>
                      <input
                        type="text"
                        value={helpContact.title || ''}
                        onChange={(e) => setHelpContact({ ...helpContact, title: e.target.value })}
                        placeholder={t('superadmin.content_manager.ph_support_hotline', 'e.g. 1800-VMOVEXA / support@vmovexa.com')}
                        className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        Banner Description
                      </label>
                      <textarea
                        rows={2}
                        value={helpContact.description || ''}
                        onChange={(e) => setHelpContact({ ...helpContact, description: e.target.value })}
                        placeholder={t('superadmin.content_manager.ph_support_desc', 'e.g. Direct line to operations & technical support...')}
                        className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        Button Label (CTA)
                      </label>
                      <input
                        type="text"
                        value={helpContact.ctaText || ''}
                        onChange={(e) => setHelpContact({ ...helpContact, ctaText: e.target.value })}
                        placeholder={t('superadmin.content_manager.ph_cta_ticket', 'e.g. Open Support Ticket')}
                        className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Tab 2: 4 SOP Guides */}
              {helpSubTab === 'guides' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {helpGuides.map((guide, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                            GUIDE CARD #{idx + 1}
                          </span>
                          <select
                            value={guide.icon || 'Document'}
                            onChange={(e) => handleUpdateGuide(idx, 'icon', e.target.value)}
                            className="text-[10px] font-semibold px-2 py-0.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-700 dark:text-zinc-300"
                          >
                            {GUIDE_ICONS.map((ic) => (
                              <option key={ic} value={ic}>{ic}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400">{t('superadmin.content_manager.lbl_title', 'Title')}</label>
                          <input
                            type="text"
                            value={guide.title}
                            onChange={(e) => handleUpdateGuide(idx, 'title', e.target.value)}
                            placeholder={t('superadmin.content_manager.ph_driver_handbook', 'e.g. Driver Handbook')}
                            className="mt-0.5 w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400">{t('superadmin.content_manager.lbl_subtitle', 'Subtitle')}</label>
                          <input
                            type="text"
                            value={guide.desc}
                            onChange={(e) => handleUpdateGuide(idx, 'desc', e.target.value)}
                            placeholder={t('superadmin.content_manager.ph_sop_route', 'e.g. SOP & Route regulations')}
                            className="mt-0.5 w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-[11px] font-medium text-slate-700 dark:text-zinc-300 focus:outline-none"
                          />
                        </div>

                        {/* SOP PDF Document Attachment */}
                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 block mb-1">
                            SOP Document (PDF / Doc)
                          </label>

                          {/* ── STATE A: Saved PDF (from DB) ─────────────────── */}
                          {guide.docUrl && !guidePendingFiles[idx] && (
                            <div className="flex items-center gap-2 mb-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
                              <FleetIcons.Document className="w-5 h-5 text-emerald-600 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 truncate">
                                  {guide.fileName || 'SOP Document'}
                                </p>
                                <a
                                  href={guide.docUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 mt-0.5"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span>{t('superadmin.content_manager.btn_view_download', 'View / Download')}</span>
                                  <FleetIcons.ExternalLink className="w-3 h-3 ml-0.5 inline" />
                                </a>
                              </div>
                              <button
                                type="button"
                                title={t('superadmin.content_manager.title_remove_pdf', 'Remove PDF')}
                                onClick={() => {
                                  handleUpdateGuide(idx, 'docUrl', '');
                                  handleUpdateGuide(idx, 'fileName', '');
                                }}
                                className="text-rose-500 hover:text-rose-600 text-sm font-bold cursor-pointer shrink-0 leading-none"
                              >
                                ✕
                              </button>
                            </div>
                          )}

                          {/* ── STATE B: Pending file selected (not yet saved) ── */}
                          {guidePendingFiles[idx] && !guideUploadStates[idx]?.uploading && (
                            <div className="flex items-center gap-2 mb-2 p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/50 rounded-xl">
                              <FleetIcons.Document className="w-5 h-5 text-amber-600 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-amber-800 dark:text-amber-300 truncate">
                                  {guidePendingFiles[idx].name}
                                </p>
                                <p className="text-[9px] text-amber-600 dark:text-amber-500 mt-0.5">
                                  {(guidePendingFiles[idx].size / 1024).toFixed(0)} KB · Will upload on Save
                                </p>
                              </div>
                              <button
                                type="button"
                                title={t('superadmin.content_manager.title_cancel_selection', 'Cancel selection')}
                                onClick={() => handleRemoveGuidePending(idx)}
                                className="text-rose-500 hover:text-rose-600 text-sm font-bold cursor-pointer shrink-0 leading-none"
                              >
                                ✕
                              </button>
                            </div>
                          )}

                          {/* ── STATE C: Upload in progress (during Save) ───── */}
                          {guideUploadStates[idx]?.uploading && (
                            <div className="mb-2 p-2.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-xl space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                                  Uploading to server...
                                </span>
                                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300">
                                  {guideUploadStates[idx]?.progress || 0}%
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                  style={{ width: `${guideUploadStates[idx]?.progress || 0}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* ── STATE D: No PDF yet — URL input + Upload button ── */}
                          {!guide.docUrl && !guidePendingFiles[idx] && (
                            <div className="mb-1.5">
                              <input
                                type="text"
                                value={guide.docUrl || ''}
                                onChange={(e) => handleUpdateGuide(idx, 'docUrl', e.target.value)}
                                placeholder={t('superadmin.content_manager.ph_paste_pdf_url', 'Or paste a URL (https://...sop.pdf)')}
                                className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 mb-1.5"
                              />
                            </div>
                          )}

                          {/* ── Upload / Replace button ─────────────────────── */}
                          <input
                            type="file"
                            accept="application/pdf,.pdf,.doc,.docx"
                            className="hidden"
                            ref={(el) => { guideFileInputRefs.current[idx] = el; }}
                            onChange={(e) => handleGuideFileSelect(idx, e.target.files?.[0])}
                          />
                          {!guideUploadStates[idx]?.uploading && (
                            <button
                              type="button"
                              onClick={() => guideFileInputRefs.current[idx]?.click()}
                              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-zinc-800/60 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-dashed border-slate-300 dark:border-zinc-700 hover:border-blue-400 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors"
                            >
                              <FleetIcons.Upload className="w-3.5 h-3.5" />
                              <span>
                                {guidePendingFiles[idx]
                                  ? t('superadmin.content_manager.change_file', 'Change File')
                                  : guide.docUrl
                                  ? 'Replace PDF / Doc'
                                  : 'Choose PDF / Doc File'}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-Tab 3: FAQs Repeater */}
              {helpSubTab === 'faqs' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                      Frequently Asked Questions ({helpFaqs.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddFaq}
                      className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      + Add FAQ
                    </button>
                  </div>

                  <div className="space-y-3">
                    {helpFaqs.map((faq, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-2 relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                            FAQ #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFaq(idx)}
                            className="text-rose-500 hover:text-rose-600 text-xs font-bold cursor-pointer"
                            title={t('superadmin.content_manager.title_remove_faq', 'Remove FAQ')}
                          >
                            ✕
                          </button>
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400">{t('superadmin.content_manager.lbl_question', 'Question')}</label>
                          <input
                            type="text"
                            value={faq.q}
                            onChange={(e) => handleUpdateFaq(idx, 'q', e.target.value)}
                            placeholder={t('superadmin.content_manager.ph_question', 'e.g. What should I do in case of vehicle breakdown?')}
                            className="mt-0.5 w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400">{t('superadmin.content_manager.lbl_answer_solution', 'Answer / Solution')}</label>
                          <textarea
                            rows={2}
                            value={faq.a}
                            onChange={(e) => handleUpdateFaq(idx, 'a', e.target.value)}
                            placeholder={t('superadmin.content_manager.ph_answer_steps', 'Detailed resolution steps...')}
                            className="mt-0.5 w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-none leading-relaxed"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddFaq}
                    className="w-full py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold rounded-xl transition-colors border border-dashed border-slate-300 dark:border-zinc-700 cursor-pointer"
                  >
                    {t('superadmin.content_manager.add_another_faq', '+ Add Another FAQ')}
                  </button>
                </div>
              )}

              {/* Sub-Tab 4: Video Tutorials Academy */}
              {helpSubTab === 'videos' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-3.5 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-2.5">
                    <div className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                      Academy Branding & Header
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400">{t('superadmin.content_manager.lbl_badge_label', 'Badge Label')}</label>
                        <input
                          type="text"
                          value={helpVideoAcademy.badge || ''}
                          onChange={(e) => setHelpVideoAcademy({ ...helpVideoAcademy, badge: e.target.value })}
                          placeholder={t('superadmin.content_manager.ph_badge_label', 'e.g. Driver Academy')}
                          className="mt-0.5 w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400">{t('superadmin.content_manager.lbl_modal_title', 'Modal Title')}</label>
                        <input
                          type="text"
                          value={helpVideoAcademy.title || ''}
                          onChange={(e) => setHelpVideoAcademy({ ...helpVideoAcademy, title: e.target.value })}
                          placeholder={t('superadmin.content_manager.ph_modal_title', 'e.g. Video Tutorials & Walkthroughs')}
                          className="mt-0.5 w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400">{t('superadmin.content_manager.lbl_description', 'Description')}</label>
                        <input
                          type="text"
                          value={helpVideoAcademy.description || ''}
                          onChange={(e) => setHelpVideoAcademy({ ...helpVideoAcademy, description: e.target.value })}
                          placeholder={t('superadmin.content_manager.ph_video_academy_desc', 'e.g. Practical video guides for daily shift starts...')}
                          className="mt-0.5 w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                      Video Lessons ({helpVideoAcademy.videos.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddVideo}
                      className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      + Add Video Lesson
                    </button>
                  </div>

                  {helpVideoAcademy.videos.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 dark:bg-zinc-900/40 border border-dashed border-slate-300 dark:border-zinc-800 rounded-xl space-y-2">
                      <FleetIcons.Video className="w-8 h-8 text-slate-400 mx-auto" />
                      <div className="text-xs font-semibold text-slate-700 dark:text-zinc-300">{t('superadmin.content_manager.no_videos_added', 'No Video Lessons Added')}</div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                        Add step-by-step video tutorials for this role portal. Upload video files or provide YouTube links.
                      </p>
                      <button
                        type="button"
                        onClick={handleAddVideo}
                        className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        {t('superadmin.content_manager.add_first_video', '+ Add First Video Lesson')}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {helpVideoAcademy.videos.map((vid, idx) => (
                        <div
                          key={vid.id || idx}
                          className="p-3.5 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-2.5 relative"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                              LESSON #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveVideo(idx)}
                              className="text-rose-500 hover:text-rose-600 text-xs font-bold cursor-pointer"
                              title={t('superadmin.content_manager.title_remove_video', 'Remove Video')}
                            >
                              ✕
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="sm:col-span-2">
                              <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400">{t('superadmin.content_manager.lbl_video_title', 'Video Title')}</label>
                              <input
                                type="text"
                                value={vid.title}
                                onChange={(e) => handleUpdateVideo(idx, 'title', e.target.value)}
                                placeholder={t('superadmin.content_manager.ph_video_title', 'e.g. Driver App Shift Start')}
                                className="mt-0.5 w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400">{t('superadmin.content_manager.lbl_duration', 'Duration')}</label>
                              <input
                                type="text"
                                value={vid.duration}
                                onChange={(e) => handleUpdateVideo(idx, 'duration', e.target.value)}
                                placeholder={t('superadmin.content_manager.ph_duration', 'e.g. 4:10 min')}
                                className="mt-0.5 w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-mono font-medium text-slate-800 dark:text-zinc-200 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400">{t('superadmin.content_manager.lbl_category', 'Category')}</label>
                              <select
                                value={vid.category || 'Getting Started'}
                                onChange={(e) => handleUpdateVideo(idx, 'category', e.target.value)}
                                className="mt-0.5 w-full px-2 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none"
                              >
                                {VIDEO_CATEGORIES.map((c) => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400">{t('superadmin.content_manager.lbl_skill_level', 'Skill Level')}</label>
                              <select
                                value={vid.level || 'Beginner'}
                                onChange={(e) => handleUpdateVideo(idx, 'level', e.target.value)}
                                className="mt-0.5 w-full px-2 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none"
                              >
                                {SKILL_LEVELS.map((lvl) => (
                                  <option key={lvl} value={lvl}>{lvl}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Video Source */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400">{t('superadmin.content_manager.lbl_video_source', 'Video Source')}</label>
                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-lg w-fit">
                              {[
                                { key: 'upload', label: '⬆️ Upload File' },
                                { key: 'url', label: '🔗 YouTube / URL' },
                              ].map((m) => (
                                <button
                                  key={m.key}
                                  type="button"
                                  onClick={() => setVideoState(idx, { mode: m.key })}
                                  className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${
                                    getVideoState(idx).mode === m.key
                                      ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
                                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                                  }`}
                                >
                                  {m.label}
                                </button>
                              ))}
                            </div>

                            {getVideoState(idx).mode === 'upload' ? (
                              <div className="space-y-2">
                                {vid.url && /^http/.test(vid.url) && !/youtube|youtu\.be/.test(vid.url) && (
                                  <div className="flex items-center gap-2 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-lg">
                                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400"><FleetIcons.Check className="w-3 h-3 inline text-emerald-500 mr-1" />{t('superadmin.content_manager.video_linked', 'Video linked:')}</span>
                                    <span className="text-[10px] font-mono text-emerald-900 dark:text-emerald-200 truncate max-w-[180px]">{vid.fileName || vid.url}</span>
                                    <button
                                      type="button"
                                      onClick={() => { handleUpdateVideo(idx, 'url', ''); handleUpdateVideo(idx, 'fileName', ''); }}
                                      className="text-rose-500 hover:text-rose-600 text-xs ml-auto cursor-pointer"
                                    ><FleetIcons.Close className="w-3 h-3" /></button>
                                  </div>
                                )}
                                {getVideoState(idx).uploading && (
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-zinc-400">
                                      <span>Uploading... {getVideoState(idx).progress}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                                        style={{ width: `${getVideoState(idx).progress}%` }}
                                      />
                                    </div>
                                  </div>
                                )}
                                <input
                                  type="file"
                                  accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,video/x-matroska"
                                  className="hidden"
                                  ref={(el) => { videoFileInputRefs.current[idx] = el; }}
                                  onChange={(e) => handleVideoFileUpload(idx, e.target.files?.[0])}
                                />
                                <button
                                  type="button"
                                  disabled={getVideoState(idx).uploading}
                                  onClick={() => videoFileInputRefs.current[idx]?.click()}
                                  className="w-full py-2.5 border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-blue-500 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-300 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                  <FleetIcons.Upload className="w-3.5 h-3.5" />
                                  <span>{getVideoState(idx).uploading ? t('superadmin.content_manager.uploading_to_server', 'Uploading...') : t('superadmin.content_manager.choose_video_file', 'Choose Video File (mp4, webm — max 500MB)')}</span>
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-1.5">
                                <input
                                  type="text"
                                  value={vid.url || ''}
                                  onChange={(e) => handleUpdateVideo(idx, 'url', e.target.value)}
                                  placeholder={t('superadmin.content_manager.ph_video_url', 'e.g. https://www.youtube.com/watch?v=xxxxx')}
                                  className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-mono text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-blue-500"
                                />
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400">{t('superadmin.content_manager.lbl_description', 'Description')}</label>
                            <textarea
                              rows={2}
                              value={vid.desc || ''}
                              onChange={(e) => handleUpdateVideo(idx, 'desc', e.target.value)}
                              placeholder={t('superadmin.content_manager.ph_video_desc', 'Explanation of what this video demonstrates...')}
                              className="mt-0.5 w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-none leading-relaxed"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {helpVideoAcademy.videos.length > 0 && (
                    <button
                      type="button"
                      onClick={handleAddVideo}
                      className="w-full py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold rounded-xl transition-colors border border-dashed border-slate-300 dark:border-zinc-700 cursor-pointer"
                    >
                      {t('superadmin.content_manager.add_another_video', '+ Add Another Video Lesson')}
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* TERMS & PRIVACY Q&A REPEATER */
            <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Policy Clauses ({sections.length})
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                    Add, edit, or reorder policy clauses for this document.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddSection}
                  className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>{t('superadmin.content_manager.btn_add_clause', '+ Add Clause')}</span>
                </button>
              </div>

              {/* List of Section Cards */}
              <div className="space-y-4">
                {sections.map((sec, idx) => (
                  <div
                    key={sec.id || idx}
                    className="p-4 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-3 relative group transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 tracking-wider">
                        SECTION #{idx + 1}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveSection(idx, -1)}
                          disabled={idx === 0}
                          title={t('superadmin.content_manager.title_move_up', 'Move Up')}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 disabled:opacity-30 cursor-pointer"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveSection(idx, 1)}
                          disabled={idx === sections.length - 1}
                          title={t('superadmin.content_manager.title_move_down', 'Move Down')}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 disabled:opacity-30 cursor-pointer"
                        >
                          ▼
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveSection(idx)}
                          title={t('superadmin.content_manager.title_remove_section', 'Remove Section')}
                          className="p-1 text-rose-500 hover:text-rose-600 cursor-pointer ml-1"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        Section Heading
                      </label>
                      <input
                        type="text"
                        value={sec.title}
                        onChange={(e) => handleUpdateSection(idx, 'title', e.target.value)}
                        placeholder={`e.g. ${idx + 1}. Operational Guidelines`}
                        className="mt-1 w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        Policy Clause Details
                      </label>
                      <textarea
                        rows={3}
                        value={sec.content}
                        onChange={(e) => handleUpdateSection(idx, 'content', e.target.value)}
                        placeholder={t('superadmin.content_manager.ph_full_policy_details', 'Enter the full description or policy details...')}
                        className="mt-1 w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddSection}
                className="w-full py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold rounded-xl transition-colors border border-dashed border-slate-300 dark:border-zinc-700 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{t('superadmin.content_manager.btn_add_another_section', '+ Add Another Section')}</span>
              </button>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: REALISTIC LIVE PREVIEW */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-6">
            <div className="bg-slate-900 dark:bg-zinc-950 text-white rounded-t-2xl px-5 py-3 flex items-center justify-between border-t border-x border-slate-800 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold tracking-wide">{t('superadmin.content_manager.live_portal_preview', 'Live Portal Preview')}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-semibold">
                {activeRoleName}
              </span>
            </div>

            <div className="bg-slate-100 dark:bg-[#151923] border border-slate-200 dark:border-zinc-800 border-t-0 rounded-b-2xl p-4 sm:p-5 space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar">
              {activeType === 'help' ? (
                <div className="space-y-4">
                  {/* Header preview */}
                  <div className="border-b border-slate-200 dark:border-zinc-800 pb-3 flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                        {title || 'Help & Documentation'}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                        {summary || 'Knowledge base, emergency hotlines and tutorials'}
                      </p>
                    </div>
                  </div>

                  {/* Contact Hero Banner Preview */}
                  {helpContact.theme === 'red' ? (
                    <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl space-y-1.5 text-rose-950 dark:text-rose-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                          {helpContact.badge || 'Transit Emergency SOS'}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-rose-900 dark:text-rose-100">
                        {helpContact.title || '1800-VMOVEXA'}
                      </div>
                      <p className="text-[10px] text-rose-800 dark:text-rose-300">
                        {helpContact.description || 'Direct emergency dispatch line.'}
                      </p>
                    </div>
                  ) : helpContact.theme === 'blue' ? (
                    <div className="p-3.5 bg-blue-600 text-white rounded-xl space-y-1.5 shadow-xs">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-blue-200">
                        {helpContact.badge || 'Dedicated Desk'}
                      </span>
                      <div className="text-xs font-bold">
                        {helpContact.title || '+91 98765 43210'}
                      </div>
                      <p className="text-[10px] text-blue-100">
                        {helpContact.description || 'Support specialist hotline.'}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-slate-900 dark:bg-zinc-900 text-white rounded-xl space-y-1.5 shadow-xs">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-blue-400">
                        {helpContact.badge || 'Support Desk: 24/7'}
                      </span>
                      <div className="text-xs font-bold">
                        {helpContact.title || 'Support Desk'}
                      </div>
                      <p className="text-[10px] text-slate-300">
                        {helpContact.description || '24/7 assistance for platform operations.'}
                      </p>
                    </div>
                  )}

                  {/* 4 Quick Action Tiles Preview */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { icon: '💬', label: 'FAQs' },
                      { icon: '📖', label: 'Guides' },
                      { icon: '🎥', label: 'Videos' },
                      { icon: '💡', label: 'Safety' },
                    ].map((t) => (
                      <div
                        key={t.label}
                        onClick={() => t.label === 'Videos' && setShowPreviewVideoModal(true)}
                        className="p-2 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 text-center hover:border-blue-500 cursor-pointer transition-all"
                      >
                        <span className="text-sm">{t.icon}</span>
                        <span className="text-[9px] font-semibold text-slate-800 dark:text-zinc-200 block mt-0.5">{t.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* 4 Guides Cards Preview */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                      Standard Operating Procedures ({helpGuides.length})
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {helpGuides.map((g, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            const url = g.docUrl || g.pdfUrl;
                            if (url) window.open(url, '_blank', 'noopener,noreferrer');
                            else toast.error(`No PDF document attached to "${g.title}"`);
                          }}
                          className="p-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-0.5 cursor-pointer hover:border-blue-500 transition-all"
                        >
                          <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate">{g.title}</div>
                          <div className="text-[9px] text-slate-500 dark:text-zinc-400 line-clamp-1">{g.desc}</div>
                          <div className="text-[9px] font-semibold text-blue-600 dark:text-blue-400 pt-1">
                            {g.docUrl ? '📥 Download SOP →' : 'Read SOP →'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* FAQs Accordion Preview */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                        FAQs Preview ({filteredPreviewFaqs.length})
                      </span>
                    </div>

                    <div className="relative">
                      <FleetIcons.Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder={t('superadmin.content_manager.ph_search_faqs', 'Search preview FAQs...')}
                        value={previewSearch}
                        onChange={(e) => setPreviewSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-[10px] font-medium text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      {filteredPreviewFaqs.map((f, i) => (
                        <details key={i} open className="p-2 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800">
                          <summary className="text-[10px] font-bold text-slate-900 dark:text-white cursor-pointer list-none flex items-center justify-between">
                            <span>{f.q || `FAQ ${i + 1}`}</span>
                            <FleetIcons.ChevronDown className="w-3 h-3 text-slate-400" />
                          </summary>
                          <p className="text-[9px] text-slate-600 dark:text-zinc-300 mt-1 pt-1 border-t border-slate-100 dark:border-zinc-800 whitespace-pre-line leading-relaxed">
                            {f.a || 'Answer will appear here...'}
                          </p>
                        </details>
                      ))}
                    </div>
                  </div>

                  {/* Video Modal Trigger Test Button */}
                  <div className="pt-2 border-t border-slate-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setShowPreviewVideoModal(true)}
                      className="w-full py-2 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>🎥 Test Video Academy Modal ({helpVideoAcademy.videos.length} videos)</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* TERMS & PRIVACY PREVIEW */
                <div className="space-y-4">
                  {/* Header preview */}
                  <div className="border-b border-slate-200 dark:border-zinc-800 pb-3 flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                        {title || 'Document Title'}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                        {summary || 'Policy summary...'}
                      </p>
                    </div>
                  </div>

                  {/* Search input preview */}
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 shadow-2xs">
                    <div className="relative">
                      <FleetIcons.Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder={t('superadmin.content_manager.ph_search_clauses', 'Search preview clauses...')}
                        value={previewSearch}
                        onChange={(e) => setPreviewSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-[11px] font-medium text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Accordions preview */}
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 shadow-2xs space-y-2">
                    {filteredPreviewSections.length > 0 ? (
                      filteredPreviewSections.map((sec, idx) => (
                        <details
                          key={sec.id || idx}
                          open
                          className="group p-2.5 bg-slate-50 dark:bg-zinc-800/60 rounded-lg border border-slate-100 dark:border-zinc-800 transition-all"
                        >
                          <summary className="text-[11px] font-bold text-slate-900 dark:text-white cursor-pointer list-none flex items-center justify-between">
                            <span>{sec.title || `Section ${idx + 1}`}</span>
                            <span className="text-slate-400 text-[10px] group-open:rotate-180 transition-transform">
                              ▼
                            </span>
                          </summary>
                          <p className="text-[10px] text-slate-600 dark:text-zinc-300 font-medium mt-1.5 pt-1.5 border-t border-slate-100 dark:border-zinc-800 leading-relaxed whitespace-pre-line">
                            {sec.content || 'Clause text will appear here...'}
                          </p>
                        </details>
                      ))
                    ) : (
                      <p className="text-[11px] text-slate-400 dark:text-zinc-500 text-center py-4">
                        No clauses matching preview search.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <p className="text-[10px] text-center text-slate-400 dark:text-zinc-500 pt-1">
                Live rendering matches the target role portal layout 1:1.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Video Academy Modal */}
      <VideoTutorialsModal
        isOpen={showPreviewVideoModal}
        onClose={() => setShowPreviewVideoModal(false)}
        role={activeRole}
        academyData={helpVideoAcademy}
      />
    </div>
  );
};

export default SuperContentManagerPage;
