import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { useTranslation } from '../../hooks/useTranslation';
import { Pagination } from '../../components/ui/Pagination';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useLanguages } from '../../hooks/shared/useLanguages';

// Language flag helper
const getFlag = (code) => {
  const map = {
    hi: '🇮🇳', en: '🇬🇧', mr: '🇮🇳', kn: '🇮🇳', te: '🇮🇳', ta: '🇮🇳',
    ml: '🇮🇳', gu: '🇮🇳', bn: '🇮🇳', pa: '🇮🇳', ur: '🇵🇰', es: '🇪🇸',
    fr: '🇫🇷', de: '🇩🇪', ar: '🇸🇦', zh: '🇨🇳', ja: '🇯🇵', ru: '🇷🇺',
  };
  return map[code?.toLowerCase()] || '';
};

const BASE_NAMESPACES = [
  'all', 'common', 'nav', 'auth', 'dashboard', 'fleet',
  'campaigns', 'technician', 'finance', 'driver', 'government', 'i18n',
];
const errorMessage = (error, fallback) => error?.message || error?.response?.data?.message || fallback;

export const SuperLanguagesPage = () => {
  const { t, refreshLanguages, refreshBundle } = useTranslation();
  const {
    loadLanguages, loadKeys, createLanguage, updateLanguage, deleteLanguage,
    createKey, saveTranslation, translateSingle,
  } = useLanguages();

  // Tab State
  const [activeTab, setActiveTab] = useState('languages'); // 'languages' | 'keys'
  const [languagesList, setLanguagesList] = useState([]);
  const [keysList, setKeysList] = useState([]);
  const [totalKeys, setTotalKeys] = useState(0);
  const [masterKeyCount, setMasterKeyCount] = useState(0);
  const [namespaces, setNamespaces] = useState(BASE_NAMESPACES.filter((item) => item !== 'all'));
  const [loading, setLoading] = useState(true);

  // Per-action loading states for every button
  const [settingDefaultLangId, setSettingDefaultLangId] = useState(null);
  const [deletingLangId, setDeletingLangId] = useState(null);
  const [isSubmittingLang, setIsSubmittingLang] = useState(false);
  const [isSubmittingKey, setIsSubmittingKey] = useState(false);
  const [singleTranslatingKeyId, setSingleTranslatingKeyId] = useState(null);
  const [savingKeyId, setSavingKeyId] = useState(null);

  // Bulk Auto-Translate state with live key-by-key progress
  const [translatingState, setTranslatingState] = useState({
    loading: false,
    progress: 0,
    completed: 0,
    total: 0,
    currentKey: '',
    currentKeyIndex: 0,
    lastTranslated: '', // last translated value to show preview
    result: null,
    error: null,
  });
  const abortTranslateRef = useRef(false);

  // Filters & Pagination
  const [selectedNamespace, setSelectedNamespace] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedPreviewLang, setSelectedPreviewLang] = useState('hi');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Modals
  const [isAddLangOpen, setIsAddLangOpen] = useState(false);
  const [isEditLangOpen, setIsEditLangOpen] = useState(false);
  const [editingLang, setEditingLang] = useState(null);
  const [isAddKeyOpen, setIsAddKeyOpen] = useState(false);
  const [isAutoTranslateOpen, setIsAutoTranslateOpen] = useState(false);

  // Forms
  const [langForm, setLangForm] = useState({
    code: '',
    name: '',
    native_name: '',
    direction: 'ltr',
    is_active: true,
    is_default: false,
    sort_order: 0,
  });

  const [keyForm, setKeyForm] = useState({
    key: '',
    namespace: 'common',
    description: '',
    en: '',
    target: '',
  });

  const [autoTranslateForm, setAutoTranslateForm] = useState({
    targetLangCode: 'mr',
    sourceLangCode: 'en',
    namespace: 'all',
    overwriteExisting: false,
  });

  // 1. Fetch languages list
  const fetchLanguagesData = useCallback(async () => {
    try {
      setLoading(true);
      const list = await loadLanguages();
      setLanguagesList(Array.isArray(list) ? list : []);
      setSelectedPreviewLang((current) => (
        list?.some((lang) => lang.code === current && lang.code !== 'en')
          ? current
          : (list?.find((lang) => lang.is_active && lang.code !== 'en')?.code || 'hi')
      ));
      const summary = await loadKeys({ page: 1, limit: 1 });
      setTotalKeys(summary?.total || 0);
      setMasterKeyCount(summary?.total || 0);
      if (Array.isArray(summary?.namespaces)) setNamespaces(summary.namespaces);
    } catch {
      toast.error(t('ag.superadmin.superlanguagespage.failed_to_load_languages_list', 'Failed to load languages list'));
    } finally {
      setLoading(false);
    }
  }, [loadLanguages, loadKeys]);

  // 2. Fetch keys list
  const fetchKeysData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        namespace: selectedNamespace !== 'all' ? selectedNamespace : undefined,
        search: debouncedSearch || undefined,
        page: currentPage,
        limit: pageSize,
      };
      const data = await loadKeys(params);
      if (data?.keys) {
        setKeysList(data.keys);
        setTotalKeys(data.total || 0);
        if (Array.isArray(data.namespaces)) setNamespaces(data.namespaces);
      }
    } catch {
      toast.error(t('ag.superadmin.superlanguagespage.failed_to_load_translation_keys', 'Failed to load translation keys'));
    } finally {
      setLoading(false);
    }
  }, [selectedNamespace, debouncedSearch, currentPage, pageSize, loadKeys]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const timer = window.setTimeout(fetchLanguagesData, 0);
    return () => window.clearTimeout(timer);
  }, [fetchLanguagesData]);

  useEffect(() => {
    if (activeTab !== 'keys') return undefined;
    const timer = window.setTimeout(fetchKeysData, 0);
    return () => window.clearTimeout(timer);
  }, [activeTab, fetchKeysData]);

  const totalPages = Math.ceil(totalKeys / pageSize) || 1;
  const paginatedKeys = keysList;
  const availableNamespaces = useMemo(() => ['all', ...new Set(namespaces)], [namespaces]);
  const defaultLanguage = languagesList.find((lang) => lang.is_default) || languagesList[0] || null;

  // Handle Add Language Submit
  const handleAddLanguage = async (e) => {
    e.preventDefault();
    setIsSubmittingLang(true);
    try {
      await createLanguage(langForm);
      toast.success(`Language "${langForm.name}" created successfully!`);
      setIsAddLangOpen(false);
      setLangForm({ code: '', name: '', native_name: '', direction: 'ltr', is_active: true, is_default: false, sort_order: 0 });
      fetchLanguagesData();
      refreshLanguages();
    } catch (err) {
      toast.error(errorMessage(err, 'Error creating language'));
    } finally {
      setIsSubmittingLang(false);
    }
  };

  // Handle Edit Language Submit
  const handleEditLanguage = async (e) => {
    e.preventDefault();
    setIsSubmittingLang(true);
    try {
      await updateLanguage(editingLang.id, editingLang);
      toast.success(`Language "${editingLang.name}" updated!`);
      setIsEditLangOpen(false);
      setEditingLang(null);
      fetchLanguagesData();
      refreshLanguages();
    } catch (err) {
      toast.error(errorMessage(err, 'Error updating language'));
    } finally {
      setIsSubmittingLang(false);
    }
  };

  // Handle Delete Language
  const handleDeleteLanguage = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete language "${name}"?`)) return;
    setDeletingLangId(id);
    try {
      await deleteLanguage(id);
      toast.success(`Language "${name}" deleted.`);
      fetchLanguagesData();
      refreshLanguages();
    } catch (err) {
      toast.error(errorMessage(err, 'Error deleting language'));
    } finally {
      setDeletingLangId(null);
    }
  };

  // Handle Set Default Language
  const handleSetDefault = async (lang) => {
    setSettingDefaultLangId(lang.id);
    try {
      await updateLanguage(lang.id, { is_default: true });
      toast.success(`Set "${lang.name}" as primary default language!`);
      fetchLanguagesData();
      refreshLanguages();
    } catch (err) {
      toast.error(errorMessage(err, 'Error setting default language'));
    } finally {
      setSettingDefaultLangId(null);
    }
  };

  // Handle Add Translation Key Submit
  const handleAddKey = async (e) => {
    e.preventDefault();
    setIsSubmittingKey(true);
    try {
      const payload = {
        key: keyForm.key,
        namespace: keyForm.namespace,
        description: keyForm.description,
        translations: {
          en: keyForm.en.trim(),
          ...(selectedPreviewLang !== 'en' && keyForm.target.trim()
            ? { [selectedPreviewLang]: keyForm.target.trim() }
            : {}),
        },
      };
      await createKey(payload);
      toast.success(`Key "${keyForm.key}" created!`);
      setMasterKeyCount((count) => count + 1);
      setIsAddKeyOpen(false);
      setKeyForm({ key: '', namespace: 'common', description: '', en: '', target: '' });
      fetchKeysData();
    } catch (err) {
      toast.error(errorMessage(err, 'Error creating key'));
    } finally {
      setIsSubmittingKey(false);
    }
  };

  // Handle Save Single Translation Value Inline
  const handleSaveTranslationValue = async (keyItem, langCode, newValue) => {
    try {
      setSavingKeyId(keyItem.id);
      await saveTranslation({
        key: keyItem.key,
        namespace: keyItem.namespace,
        langCode,
        value: newValue,
      });
      toast.success(`Saved translation for "${keyItem.key}"`);
      fetchKeysData();
      refreshBundle();
    } catch (err) {
      toast.error(errorMessage(err, 'Error saving translation'));
    } finally {
      setSavingKeyId(null);
    }
  };

  // Handle Individual Translate Button (Single Key Auto-Translate)
  const handleTranslateSingleKey = async (keyItem) => {
    const enVal = keyItem.translations?.find((t) => t.language?.code === 'en')?.value || keyItem.description || keyItem.key;
    try {
      setSingleTranslatingKeyId(keyItem.id);
      const res = await translateSingle({
        text: enVal,
        targetLangCode: selectedPreviewLang,
        sourceLangCode: 'en',
        keyId: keyItem.id,
      });
      const translated = res?.translated;
      toast.success(`Translated "${keyItem.key}" → ${translated}`);
      fetchKeysData();
      refreshBundle();
    } catch (err) {
      toast.error(errorMessage(err, 'Single translate error'));
    } finally {
      setSingleTranslatingKeyId(null);
    }
  };

  // KEY-BY-KEY Auto-Translate: frontend loop, one key at a time, live % progress
  const handleRunAutoTranslate = async (targetCodeOverride = null) => {
    const targetCode = targetCodeOverride || autoTranslateForm.targetLangCode;
    abortTranslateRef.current = false;
    setIsAutoTranslateOpen(true);

    try {
      // Step 1: Fetch ALL keys (respecting namespace filter)
      setTranslatingState({
        loading: true,
        progress: 0,
        completed: 0,
        total: 0,
        currentKey: 'Fetching keys from server...',
        currentKeyIndex: 0,
        lastTranslated: '',
        result: null,
        error: null,
      });

      const params = {
        limit: 200,
        namespace: autoTranslateForm.namespace !== 'all' ? autoTranslateForm.namespace : undefined,
      };
      const firstPage = await loadKeys({ ...params, page: 1 });
      const allKeys = [...(firstPage?.keys || [])];
      const pageCount = Math.ceil((firstPage?.total || allKeys.length) / params.limit);
      for (let page = 2; page <= pageCount; page += 1) {
        if (abortTranslateRef.current) break;
        const nextPage = await loadKeys({ ...params, page });
        allKeys.push(...(nextPage?.keys || []));
      }

      // Step 2: Filter only keys that need translation
      const keysToTranslate = allKeys.filter((k) => {
        const hasTarget = k.translations?.find(
          (t) => t.language?.code === targetCode && t.value && t.value.trim() !== ''
        );
        return autoTranslateForm.overwriteExisting ? true : !hasTarget;
      });

      const total = keysToTranslate.length;

      if (total === 0) {
        setTranslatingState({
          loading: false,
          progress: 100,
          completed: 0,
          total: 0,
          currentKey: '',
          currentKeyIndex: 0,
          lastTranslated: '',
          result: { translatedCount: 0, targetLanguage: targetCode },
          error: null,
        });
        toast.success(`All keys already translated for ${targetCode.toUpperCase()}!`);
        return;
      }

      // Step 3: Translate KEY-BY-KEY with THROTTLED UI updates (every 3 keys)
      // Use a ref to hold current values without triggering re-renders every key
      let completed = 0;
      let successCount = 0;
      const UPDATE_EVERY = 3; // update React state every N keys to prevent header flicker
      let lastTranslatedVal = '';

      for (let i = 0; i < keysToTranslate.length; i++) {
        if (abortTranslateRef.current) break;

        const keyItem = keysToTranslate[i];
        const sourceText =
          keyItem.translations?.find((t) => t.language?.code === (autoTranslateForm.sourceLangCode || 'en'))?.value ||
          keyItem.description ||
          keyItem.key;

        try {
          const res = await translateSingle({
            text: sourceText,
            targetLangCode: targetCode,
            sourceLangCode: autoTranslateForm.sourceLangCode || 'en',
            keyId: keyItem.id,
          });
          lastTranslatedVal = res?.translated || '';
          successCount++;
          completed = i + 1;
        } catch {
          // Silent fail — continue to next key
          completed = i + 1;
        }

        // Only update React state every UPDATE_EVERY keys OR on the last key
        // This prevents header from flickering due to too many re-renders
        const isLast = i === keysToTranslate.length - 1;
        if ((i + 1) % UPDATE_EVERY === 0 || isLast) {
          const pct = Math.round((completed / total) * 100);
          setTranslatingState({
            loading: true,
            progress: pct,
            completed,
            total,
            currentKey: isLast ? '' : keyItem.key,
            currentKeyIndex: i + 1,
            lastTranslated: lastTranslatedVal,
            result: null,
            error: null,
          });
          // Yield to browser paint — let modal UI update without blocking layout
          await new Promise((r) => requestAnimationFrame(r));
        }
      }

      // Step 4: Done
      if (abortTranslateRef.current) {
        const pct = Math.round((completed / total) * 100);
        setTranslatingState((prev) => ({
          ...prev,
          loading: false,
          progress: pct,
          completed,
          currentKey: '',
          lastTranslated: '',
        }));
        toast(`Paused at ${pct}% — ${completed} of ${total} keys translated.`);
      } else {
        setTranslatingState({
          loading: false,
          progress: 100,
          completed: total,
          total,
          currentKey: '',
          currentKeyIndex: total,
          lastTranslated: '',
          result: { translatedCount: successCount, targetLanguage: targetCode },
          error: null,
        });
        toast.success(`${successCount} keys translated into ${targetCode.toUpperCase()}!`);
      }

      // Refresh table data so translations show immediately
      fetchKeysData();
      refreshBundle();
    } catch (err) {
      const errMsg = errorMessage(err, 'Auto-translation failed');
      setTranslatingState({
        loading: false,
        progress: 0,
        completed: 0,
        total: 0,
        currentKey: '',
        currentKeyIndex: 0,
        lastTranslated: '',
        result: null,
        error: errMsg,
      });
      toast.error(errMsg);
    }
  };

  const selectedTargetLangObj = languagesList.find((l) => l.code === selectedPreviewLang) || {
    name: selectedPreviewLang.toUpperCase(),
    code: selectedPreviewLang,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* ═══════════════════════════════════════════════════════════════
           AUTO-TRANSLATE FULL-PAGE VIEW (replaces page when open)
      ═══════════════════════════════════════════════════════════════ */}
      {isAutoTranslateOpen && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Back Button & Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-100/80 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 backdrop-blur-md">
            <div className="flex items-center gap-3.5">
              <button
                disabled={translatingState.loading}
                onClick={() => {
                  if (translatingState.loading) {
                    if (!window.confirm('Translation is still running. Are you sure you want to go back?')) return;
                    abortTranslateRef.current = true;
                  }
                  setIsAutoTranslateOpen(false);
                  setTranslatingState({ loading: false, progress: 0, completed: 0, total: 0, currentKey: '', currentKeyIndex: 0, lastTranslated: '', result: null, error: null });
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-100 text-sm font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                <FleetIcons.ArrowLeft className="w-4 h-4" />
                <span>{t('i18n.back_to_languages', 'Back to Languages')}</span>
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <FleetIcons.Rocket className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    {t('ag.superadmin.superlanguagespage.google_auto_translate_engine', 'Google Auto-Translate Engine')}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  {t('ag.superadmin.superlanguagespage.key_by_key_real_time_neural_translation_with', 'Key-by-key real-time neural translation with live progress tracking')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {translatingState.loading ? (
                <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-500/40 text-purple-700 dark:text-purple-300 text-xs font-bold animate-pulse">
                  <FleetIcons.Spinner className="w-3.5 h-3.5 animate-spin text-purple-600 dark:text-purple-400" />
                  {t('ag.superadmin.superlanguagespage.in_progress', 'In Progress (')}{translatingState.progress}%)
                </span>
              ) : translatingState.result ? (
                <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                  <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t('i18n.finished', 'Finished')}</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-200/70 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> {t('i18n.engine_ready', 'Engine Ready')}
                </span>
              )}
            </div>
          </div>

          {/* Main Auto-Translate Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* LEFT: Settings Panel */}
            <div className="rounded-3xl bg-white dark:bg-[#111420] border border-slate-200 dark:border-zinc-800 p-6 sm:p-7 shadow-sm dark:shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <FleetIcons.Settings className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">{t('i18n.translation_settings', 'Translation Settings')}</h3>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  {t('ag.superadmin.superlanguagespage.target_language_translate_to', 'Target Language (Translate To)')}
                </label>
                <select
                  disabled={translatingState.loading}
                  value={autoTranslateForm.targetLangCode}
                  onChange={(e) => setAutoTranslateForm({ ...autoTranslateForm, targetLangCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 disabled:opacity-60 transition-all cursor-pointer"
                >
                  {languagesList.filter((l) => l.is_active && l.code !== autoTranslateForm.sourceLangCode).map((l) => (
                    <option key={l.code} value={l.code} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">
                      {getFlag(l.code)} {l.name} ({l.code}) — {l.native_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  {t('ag.superadmin.superlanguagespage.source_reference_language', 'Source Reference Language')}
                </label>
                <select
                  disabled={translatingState.loading}
                  value={autoTranslateForm.sourceLangCode}
                  onChange={(e) => setAutoTranslateForm({ ...autoTranslateForm, sourceLangCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 disabled:opacity-60 transition-all cursor-pointer"
                >
                  <option value="en" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">{'🇬🇧 English (en)'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  {t('ag.superadmin.superlanguagespage.namespace_scope', 'Namespace Scope')}
                </label>
                <select
                  disabled={translatingState.loading}
                  value={autoTranslateForm.namespace}
                  onChange={(e) => setAutoTranslateForm({ ...autoTranslateForm, namespace: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 disabled:opacity-60 transition-all cursor-pointer"
                >
                  {availableNamespaces.map((ns) => (
                    <option key={ns} value={ns} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">
                      {ns === 'all' ? t('ag.superadmin.superlanguagespage.all_namespaces_entire_system', 'All Namespaces (Entire System)') : `Namespace: ${ns}`}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors">
                <input
                  type="checkbox"
                  disabled={translatingState.loading}
                  checked={autoTranslateForm.overwriteExisting}
                  onChange={(e) => setAutoTranslateForm({ ...autoTranslateForm, overwriteExisting: e.target.checked })}
                  className="w-4 h-4 rounded text-purple-600 accent-purple-600 disabled:opacity-60 cursor-pointer"
                />
                <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-zinc-200">
                  {t('ag.superadmin.superlanguagespage.overwrite_already_translated_keys', 'Overwrite already translated keys')} <span className="text-slate-400 dark:text-zinc-500">{t('i18n.retranslate_all', '(re-translate all)')}</span>
                </span>
              </label>

              {/* Info box */}
              <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 text-xs text-blue-700 dark:text-blue-300 leading-relaxed flex items-start gap-2.5">
                <FleetIcons.Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>
                  <strong>{t('i18n.how_it_works', 'How it works:')}</strong> {t('i18n.how_it_works_desc', 'The engine fetches all keys, then calls Google Translate one-by-one with real-time UI streaming.')}
                </span>
              </div>

              {/* Start / Abort buttons */}
              <div className="pt-1">
                {!translatingState.loading ? (
                  <button
                    type="button"
                    onClick={() => handleRunAutoTranslate()}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FleetIcons.Rocket className="w-4 h-4" />
                    <span>{t('i18n.start_auto_translation', 'Start Auto-Translation')}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { abortTranslateRef.current = true; }}
                    className="w-full py-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/70 border border-red-200 dark:border-red-500/40 text-red-600 dark:text-red-400 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FleetIcons.Stop className="w-4 h-4" />
                    <span>{t('i18n.pause_stop_translation', 'Pause / Stop Translation')}</span>
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT: {t('i18n.live_progress', 'Live Progress')} Panel */}
            <div className="rounded-3xl bg-white dark:bg-[#111420] border border-slate-200 dark:border-purple-500/30 p-6 sm:p-7 shadow-sm dark:shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <FleetIcons.BarChart className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">{t('i18n.live_progress', 'Live Progress')}</h3>
                </div>
                {translatingState.loading && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-500/40 text-purple-700 dark:text-purple-300 text-xs font-bold animate-pulse">
                    <FleetIcons.Spinner className="w-3 h-3 animate-spin text-purple-600 dark:text-purple-400" />
                    {t('ag.superadmin.superlanguagespage.running', 'Running')}
                  </span>
                )}
                {!translatingState.loading && translatingState.result && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                    <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{t('i18n.stat_done', 'Done')}</span>
                  </span>
                )}
                {!translatingState.loading && !translatingState.result && translatingState.progress === 0 && (
                  <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 text-xs font-bold">
                    {t('ag.superadmin.superlanguagespage.idle', 'Idle')}
                  </span>
                )}
              </div>

              {/* Big % display */}
              <div className="flex items-center justify-center py-2">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  {/* Circular progress ring via SVG */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 144 144">
                    <circle
                      cx="72" cy="72" r="60" fill="none"
                      strokeWidth="10"
                      className="stroke-slate-100 dark:stroke-zinc-800"
                    />
                    <circle
                      cx="72" cy="72" r="60" fill="none"
                      stroke="url(#progressGrad)" strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 60}`}
                      strokeDashoffset={`${2 * Math.PI * 60 * (1 - (translatingState.progress || 0) / 100)}`}
                      style={{ transition: 'stroke-dashoffset 0.4s ease-out' }}
                    />
                    <defs>
                      <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="relative text-center">
                    <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                      {translatingState.progress || 0}<span className="text-2xl font-bold text-purple-600 dark:text-purple-400">%</span>
                    </p>
                    <p className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mt-0.5">
                      {translatingState.loading ? t('ag.superadmin.superlanguagespage.translating', 'Translating') : translatingState.result ? t('ag.superadmin.superlanguagespage.completed', 'Completed') : t('ag.superadmin.superlanguagespage.complete', 'Complete')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 text-center transition-all">
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider">{t('i18n.stat_done', 'Done')}</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">{translatingState.completed}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 text-center transition-all">
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider">{t('i18n.stat_total', 'Total')}</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">{translatingState.total || '—'}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 text-center transition-all">
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider">{t('i18n.stat_left', 'Left')}</p>
                  <p className="text-2xl font-black text-purple-600 dark:text-amber-400 mt-1 tabular-nums">
                    {translatingState.total ? Math.max(0, translatingState.total - translatingState.completed) : '—'}
                  </p>
                </div>
              </div>

              {/* Linear progress bar */}
              {translatingState.total > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                    <span>{t('i18n.progress', 'Progress')}</span>
                    <span>{translatingState.progress || 0}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${Math.max(1, translatingState.progress)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Current key translating */}
              {translatingState.currentKey && (
                <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[11px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <FleetIcons.Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>{t('i18n.translating_now', 'Translating Now')}</span>
                    </p>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                      {t('ag.superadmin.superlanguagespage.key', 'Key #')}{translatingState.currentKeyIndex} {t('ag.superadmin.superlanguagespage.of', 'of')} {translatingState.total}
                    </span>
                  </div>
                  <p className="text-sm font-mono font-bold text-slate-900 dark:text-blue-200 break-all select-all">
                    {translatingState.currentKey}
                  </p>
                </div>
              )}

              {/* Last translated */}
              {translatingState.lastTranslated && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 transition-all">
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t('i18n.last_result', 'Last Result')}</span>
                  </p>
                  <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-200 break-words">
                    {translatingState.lastTranslated}
                  </p>
                </div>
              )}

              {/* Success result */}
              {translatingState.result && !translatingState.loading && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-sm text-emerald-900 dark:text-emerald-200 space-y-2.5 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <FleetIcons.Sparkles className="w-6 h-6 text-emerald-500" />
                    <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-base">{t('i18n.translation_complete', 'Translation Complete!')}</h4>
                  </div>
                  <p className="text-xs leading-relaxed text-emerald-800 dark:text-emerald-300">
                    {t('ag.superadmin.superlanguagespage.successfully_translated', 'Successfully translated')} <strong>{translatingState.result.translatedCount}</strong> {t('ag.superadmin.superlanguagespage.keys_into', 'keys into')}{' '}
                    <strong>{getFlag(translatingState.result.targetLanguage)} {translatingState.result.targetLanguage?.toUpperCase()}</strong> {t('ag.superadmin.superlanguagespage.and_persisted_to_mysql', 'and persisted to MySQL.')}
                  </p>
                  <button
                    onClick={() => {
                      setIsAutoTranslateOpen(false);
                      setTranslatingState({ loading: false, progress: 0, completed: 0, total: 0, currentKey: '', currentKeyIndex: 0, lastTranslated: '', result: null, error: null });
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    {t('ag.superadmin.superlanguagespage.return_to_languages_hub', '← Return to Languages Hub')}
                  </button>
                </div>
              )}

              {/* Error */}
              {translatingState.error && !translatingState.loading && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/40 text-sm text-red-900 dark:text-red-200 space-y-1 animate-in fade-in">
                  <p className="font-bold flex items-center gap-2 text-red-700 dark:text-red-400">
                    <FleetIcons.Alert className="w-4 h-4 text-rose-500" />
                    <span>{t('i18n.translation_error', 'Translation Error')}</span>
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-300 leading-relaxed">{translatingState.error}</p>
                </div>
              )}

              {/* Idle placeholder */}
              {!translatingState.loading && !translatingState.result && !translatingState.error && translatingState.progress === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-2.5">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                    <FleetIcons.Globe className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">{t('i18n.engine_ready', 'Engine Ready')}</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs">
                    {t('ag.superadmin.superlanguagespage.configure_settings_on_the_left_and_click', 'Configure settings on the left and click')} <strong className="text-purple-600 dark:text-purple-400 font-bold">{t('i18n.start_auto_translation', 'Start Auto-Translation')}</strong> {t('ag.superadmin.superlanguagespage.to_begin', 'to begin.')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* NORMAL PAGE — hidden when auto-translate view is open */}
      {!isAutoTranslateOpen && (
        <>
          <Breadcrumb
            items={[
              { label: t('ag.superadmin.superlanguagespage.super_admin', 'Super Admin'), path: '/superadmin/dashboard', icon: FleetIcons.Dashboard },
              { label: t('ag.superadmin.superlanguagespage.languages_i18n_hub', 'Languages & i18n Hub') },
            ]}
            className="mb-2"
          />

      {/* Page Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50/90 via-blue-50/50 to-purple-50/70 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950 border border-indigo-100/80 dark:border-zinc-800 p-6 sm:p-8 shadow-sm">
        {/* Subtle Ambient Decorative Glow Blobs */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 text-[11px] font-bold tracking-wider uppercase shadow-2xs">
                {t('ag.superadmin.superlanguagespage.global_i18n_engine', 'Global i18n Engine')}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold shadow-2xs">
                {t('ag.superadmin.superlanguagespage.primary_default_hindi', '🇮🇳 Primary Default: हिन्दी (Hindi)')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <span>{t('i18n.title', 'Languages & Translations Hub')}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
              {t('i18n.subtitle', 'Manage international languages, translation keys, and 1-click Google auto-translation across the entire VMOVEXA ecosystem.')}
            </p>
          </div>

          {/* Header Action Buttons with Loading States */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              disabled={translatingState.loading}
              onClick={() => {
                setAutoTranslateForm((prev) => ({ ...prev, targetLangCode: selectedPreviewLang }));
                setIsAutoTranslateOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/25 hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer active:scale-98"
            >
              {translatingState.loading ? (
                <>
                  <FleetIcons.Spinner className="w-4 h-4 animate-spin text-white" />
                  <span>{t('ag.superadmin.superlanguagespage.translating', 'Translating (')}{translatingState.progress}%)</span>
                </>
              ) : (
                <>
                  <FleetIcons.Rocket className="w-4 h-4" />
                  <span>{t('i18n.auto_translate_btn', '1-Click Google Auto-Translate')}</span>
                </>
              )}
            </button>
            <button
              onClick={() => setIsAddLangOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <FleetIcons.Plus className="w-3.5 h-3.5" />
              <span>{t('i18n.add_language', 'Add Language')}</span>
            </button>
            <button
              onClick={() => setIsAddKeyOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-white text-xs font-bold shadow-2xs hover:shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <FleetIcons.Plus className="w-3.5 h-3.5" />
              <span>{t('i18n.add_key', 'Add Key')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{t('i18n.installed_languages', 'Installed Languages')}</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{languagesList.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{t('i18n.total_master_keys', 'Total Master Keys')}</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{masterKeyCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{t('i18n.primary_lang', 'Primary Active Language')}</p>
          <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1.5">
            <span>{getFlag(defaultLanguage?.code) || defaultLanguage?.code?.toUpperCase()}</span>
            <span>{defaultLanguage ? `${defaultLanguage.native_name || defaultLanguage.name} (${defaultLanguage.name})` : t('ag.superadmin.superlanguagespage.not_configured', 'Not configured')}</span>
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{t('i18n.google_status', 'Google Engine Status')}</p>
          <p className="text-sm font-black text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{t('i18n.translation_engine_ready', 'Available on demand')}</span>
          </p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('languages')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'languages'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FleetIcons.Globe className="w-4 h-4" />
          <span>{t('i18n.languages_tab', 'Installed Languages')} ({languagesList.length})</span>
          {loading && activeTab === 'languages' && <FleetIcons.Spinner className="w-3.5 h-3.5 animate-spin text-blue-500" />}
        </button>
        <button
          onClick={() => setActiveTab('keys')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'keys'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FleetIcons.Key className="w-4 h-4" />
          <span>{t('i18n.keys_tab', 'Translation Matrix & Keys')} ({totalKeys})</span>
          {loading && activeTab === 'keys' && <FleetIcons.Spinner className="w-3.5 h-3.5 animate-spin text-blue-500" />}
        </button>
      </div>

      {/* TAB 1: INSTALLED LANGUAGES */}
      {activeTab === 'languages' && (
        <div className="space-y-4">
          {loading && languagesList.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <FleetIcons.Spinner className="w-8 h-8 animate-spin text-blue-600" />
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">{t('i18n.loading_languages', 'Loading languages...')}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {languagesList.map((lang) => (
                <div
                  key={lang.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    lang.is_default
                      ? 'bg-blue-50/70 dark:bg-blue-950/20 border-blue-300 dark:border-blue-500/40 shadow-sm'
                      : 'bg-white dark:bg-[#11141d] border-slate-200 dark:border-zinc-800 shadow-sm hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-800 dark:to-zinc-700/80 border border-blue-100 dark:border-zinc-700 flex items-center justify-center text-lg font-bold text-blue-700 dark:text-blue-300 shrink-0 shadow-2xs">
                        {getFlag(lang.code) || lang.code.toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-slate-900 dark:text-white">
                            {lang.name}
                          </h3>
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-mono text-[10px] font-bold uppercase">
                            {lang.code}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                          {lang.native_name || lang.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {lang.is_default ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-[10px] font-bold">
                          {t('ag.superadmin.superlanguagespage.primary_default', 'Primary Default')}
                        </span>
                      ) : (
                        <button
                          disabled={settingDefaultLangId === lang.id}
                          onClick={() => handleSetDefault(lang)}
                          className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                        >
                          {settingDefaultLangId === lang.id && <FleetIcons.Spinner className="w-3 h-3 animate-spin text-blue-500" />}
                          <span>{settingDefaultLangId === lang.id ? t('ag.superadmin.superlanguagespage.setting', 'Setting...') : t('ag.superadmin.superlanguagespage.set_as_default', 'Set as Default')}</span>
                        </button>
                      )}
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-bold ${
                          lang.direction === 'rtl'
                            ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                        }`}
                      >
                        {lang.direction.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          lang.is_active ? 'bg-emerald-500' : 'bg-red-500'
                        }`}
                      ></span>
                      <span className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                        {lang.is_active ? t('ag.superadmin.superlanguagespage.active', 'Active') : t('ag.superadmin.superlanguagespage.disabled', 'Disabled')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedPreviewLang(lang.code);
                          setActiveTab('keys');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold transition-colors cursor-pointer"
                      >
                        {t('ag.superadmin.superlanguagespage.manage_keys', 'Manage Keys')}
                      </button>
                      <button
                        onClick={() => {
                          setEditingLang(lang);
                          setIsEditLangOpen(true);
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-xs transition-colors cursor-pointer"
                        title={t('i18n.title_edit_language', 'Edit Language')}
                      >
                        <FleetIcons.Edit className="w-3.5 h-3.5" />
                      </button>
                      {!lang.is_default && (
                        <button
                          disabled={deletingLangId === lang.id}
                          onClick={() => handleDeleteLanguage(lang.id, lang.name)}
                          className="p-1.5 rounded-lg border border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 text-xs disabled:opacity-50 transition-colors cursor-pointer"
                          title={t('i18n.title_delete_language', 'Delete Language')}
                        >
                          {deletingLangId === lang.id ? (
                            <FleetIcons.Spinner className="w-3.5 h-3.5 animate-spin text-red-400" />
                          ) : (
                            <FleetIcons.Trash className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TRANSLATION KEYS MATRIX WITH PAGINATION & INDIVIDUAL / BULK TRANSLATE */}
      {activeTab === 'keys' && (
        <div className="space-y-4">
          {/* Top Controls Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 space-y-3 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder={t('i18n.ph_search_keys', 'Search key identifier or text...')}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
                <FleetIcons.Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              </div>

              {/* Target Language Selector & Bulk Translate Button */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                    {t('ag.superadmin.superlanguagespage.target_lang', 'Target Lang:')}
                  </span>
                  <select
                    value={selectedPreviewLang}
                    onChange={(e) => setSelectedPreviewLang(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none"
                  >
                    {languagesList.filter((l) => l.is_active && l.code !== 'en').map((l) => (
                      <option key={l.code} value={l.code}>
                        {getFlag(l.code)} {l.name} ({l.code}) - {l.native_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bulk Translate All for This Language */}
                <button
                  disabled={translatingState.loading}
                  onClick={() => {
                    setAutoTranslateForm((prev) => ({ ...prev, targetLangCode: selectedPreviewLang }));
                    handleRunAutoTranslate(selectedPreviewLang);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5 disabled:opacity-60"
                  title={t('i18n.title_translate_missing', 'Translate all missing keys for this language')}
                >
                  {translatingState.loading ? (
                    <>
                      <FleetIcons.Spinner className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>{t('ag.superadmin.superlanguagespage.translating_2', 'Translating...')} {translatingState.progress}%</span>
                    </>
                  ) : (
                    <>
                      <FleetIcons.Zap className="w-3.5 h-3.5" />
                      <span>{t('ag.superadmin.superlanguagespage.auto_translate_all_to', 'Auto-Translate All to')} {selectedTargetLangObj.name}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Namespaces Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              {availableNamespaces.map((ns) => (
                <button
                  key={ns}
                  onClick={() => {
                    setSelectedNamespace(ns);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold capitalize whitespace-nowrap transition-all ${
                    selectedNamespace === ns
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {ns}
                </button>
              ))}
            </div>
          </div>

          {/* Keys Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#11141d] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead className="bg-slate-50 dark:bg-zinc-900/60 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">{t('i18n.th_key_id', 'Key Identifier')}</th>
                    <th className="px-3 py-3">{t('i18n.th_namespace', 'Namespace')}</th>
                    <th className="px-4 py-3">{t('i18n.th_en_ref', 'English Reference')}</th>
                    <th className="px-4 py-3">
                      {selectedTargetLangObj.name} ({selectedTargetLangObj.code.toUpperCase()}{t('ag.superadmin.superlanguagespage.translation', ') Translation')}
                    </th>
                    <th className="px-3 py-3 text-center">{t('i18n.th_auto_translate', 'Auto-Translate')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-slate-800 dark:text-zinc-200">
                  {loading && keysList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <FleetIcons.Spinner className="w-6 h-6 animate-spin text-blue-600" />
                          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">{t('i18n.loading_keys', 'Loading translation keys...')}</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedKeys.map((k) => {
                    const enTrans = k.translations?.find((t) => t.language?.code === 'en')?.value || '';
                    const targetTrans = k.translations?.find((t) => t.language?.code === selectedPreviewLang)?.value || '';

                    return (
                      <tr key={k.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-[11px] text-blue-600 dark:text-blue-400">
                          {k.key}
                          {k.description && (
                            <p className="text-[10px] font-sans text-slate-400 dark:text-zinc-500 font-normal mt-0.5">
                              {k.description}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-semibold text-[10px]">
                            {k.namespace || 'common'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700 dark:text-zinc-300 max-w-xs truncate">
                          {enTrans || '—'}
                        </td>
                        <td className="px-4 py-3 relative">
                          <input
                            type="text"
                            defaultValue={targetTrans}
                            key={`${k.id}-${selectedPreviewLang}-${targetTrans}`}
                            onBlur={(e) => {
                              if (e.target.value !== targetTrans) {
                                handleSaveTranslationValue(k, selectedPreviewLang, e.target.value);
                              }
                            }}
                            placeholder={`Enter ${selectedTargetLangObj.name} text...`}
                            className="w-full pr-8 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                          />
                          {savingKeyId === k.id && (
                            <span className="absolute right-6 top-5 text-blue-500">
                              <FleetIcons.Spinner className="w-3.5 h-3.5 animate-spin" />
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {/* Individual Key Translate Button with loading state */}
                          <button
                            type="button"
                            onClick={() => handleTranslateSingleKey(k)}
                            disabled={singleTranslatingKeyId === k.id}
                            className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-500/10 dark:hover:bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 text-[11px] font-bold transition-all inline-flex items-center gap-1.5 shadow-2xs disabled:opacity-60 cursor-pointer"
                            title={t('i18n.title_translate_single', 'Auto-translate this specific key using Google Translate')}
                          >
                            {singleTranslatingKeyId === k.id ? (
                              <>
                                <FleetIcons.Spinner className="w-3.5 h-3.5 animate-spin text-purple-500" />
                                <span>{t('i18n.lbl_translating', 'Translating...')}</span>
                              </>
                            ) : (
                              <>
                                <FleetIcons.Zap className="w-3.5 h-3.5" />
                                <span>{t('i18n.lbl_translate', 'Translate')}</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {!loading && paginatedKeys.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-slate-400 dark:text-zinc-500">
                        {t('ag.superadmin.superlanguagespage.no_translation_keys_found_matching_your_filt', 'No translation keys found matching your filters.')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Standard Global Pagination Component */}
            <div className="px-4 py-2 border-t border-slate-200 dark:border-zinc-800">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalKeys}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
                pageSizeOptions={[10, 20, 50, 100]}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD LANGUAGE */}
      {isAddLangOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {t('i18n.add_new_language_title', 'Add New Language')}
              </h3>
              <button disabled={isSubmittingLang} onClick={() => setIsAddLangOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"><FleetIcons.Close className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleAddLanguage} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  {t('i18n.field_lang_code', 'Language Code (ISO 639-1) *')}
                </label>
                <input
                  type="text"
                  placeholder={t('i18n.ph_lang_code', 'e.g. fr, es, de, ar, ta, bn')}
                  required
                  value={langForm.code}
                  onChange={(e) => setLangForm({ ...langForm, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  {t('i18n.field_en_name', 'English Name *')}
                </label>
                <input
                  type="text"
                  placeholder={t('i18n.ph_lang_name', 'e.g. French, Spanish, Tamil')}
                  required
                  value={langForm.name}
                  onChange={(e) => setLangForm({ ...langForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  {t('i18n.field_native_name', 'Native Script Name')}
                </label>
                <input
                  type="text"
                  placeholder={t('i18n.ph_native_name', 'e.g. Français, Español, தமிழ்')}
                  value={langForm.native_name}
                  onChange={(e) => setLangForm({ ...langForm, native_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  {t('i18n.field_text_direction', 'Text Direction')}
                </label>
                <select
                  value={langForm.direction}
                  onChange={(e) => setLangForm({ ...langForm, direction: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="ltr">{t('i18n.opt_ltr', 'Left-to-Right (LTR)')}</option>
                  <option value="rtl">{t('i18n.opt_rtl', 'Right-to-Left (RTL - Arabic, Hebrew, Urdu)')}</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isSubmittingLang}
                  onClick={() => setIsAddLangOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-50"
                >
                  {t('ag.superadmin.superlanguagespage.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLang}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isSubmittingLang && <FleetIcons.Spinner className="w-3.5 h-3.5 animate-spin text-white" />}
                  <span>{isSubmittingLang ? t('i18n.creating_language', 'Creating Language...') : t('i18n.create_language', 'Create Language')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT LANGUAGE */}
      {isEditLangOpen && editingLang && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {t('i18n.edit_language_title', 'Edit Language')}: {editingLang.name} ({editingLang.code})
              </h3>
              <button disabled={isSubmittingLang} onClick={() => setIsEditLangOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"><FleetIcons.Close className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleEditLanguage} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  {t('i18n.field_language_name', 'Language Name')}
                </label>
                <input
                  type="text"
                  required
                  value={editingLang.name}
                  onChange={(e) => setEditingLang({ ...editingLang, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  {t('i18n.field_native_name', 'Native Script Name')}
                </label>
                <input
                  type="text"
                  value={editingLang.native_name || ''}
                  onChange={(e) => setEditingLang({ ...editingLang, native_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  {t('i18n.field_text_direction', 'Text Direction')}
                </label>
                <select
                  value={editingLang.direction}
                  onChange={(e) => setEditingLang({ ...editingLang, direction: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="ltr">{t('i18n.opt_ltr', 'Left-to-Right (LTR)')}</option>
                  <option value="rtl">{t('i18n.opt_rtl', 'Right-to-Left (RTL - Arabic, Hebrew, Urdu)')}</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingLang.is_active}
                    onChange={(e) => setEditingLang({ ...editingLang, is_active: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>{t('i18n.active_and_enabled', 'Active & Enabled')}</span>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isSubmittingLang}
                  onClick={() => setIsEditLangOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-600 dark:text-zinc-400 disabled:opacity-50"
                >
                  {t('ag.superadmin.superlanguagespage.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLang}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isSubmittingLang && <FleetIcons.Spinner className="w-3.5 h-3.5 animate-spin text-white" />}
                  <span>{isSubmittingLang ? t('i18n.saving_changes', 'Saving Changes...') : t('common.save_changes', 'Save Changes')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD TRANSLATION KEY */}
      {isAddKeyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {t('i18n.add_key_title', 'Add Translation Key')}
              </h3>
              <button disabled={isSubmittingKey} onClick={() => setIsAddKeyOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"><FleetIcons.Close className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleAddKey} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  {t('i18n.field_key_identifier', 'Key Identifier *')}
                </label>
                <input
                  type="text"
                  placeholder={t('i18n.ph_key_identifier', 'e.g. common.export_pdf, fleet.fuel_alert')}
                  required
                  pattern="[a-z0-9]+([._-][a-z0-9]+)*"
                  title={t('ag.superadmin.superlanguagespage.use_lowercase_letters_numbers_dots_underscor', 'Use lowercase letters, numbers, dots, underscores, or hyphens.')}
                  value={keyForm.key}
                  onChange={(e) => setKeyForm({ ...keyForm, key: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  {t('i18n.field_namespace', 'Namespace')}
                </label>
                <select
                  value={keyForm.namespace}
                  onChange={(e) => setKeyForm({ ...keyForm, namespace: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  {availableNamespaces.filter((n) => n !== 'all').map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  {t('i18n.field_en_val', 'English Value')}
                </label>
                <input
                  type="text"
                  placeholder={t('i18n.ph_en_text', 'e.g. Export as PDF')}
                  value={keyForm.en}
                  required
                  onChange={(e) => setKeyForm({ ...keyForm, en: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  {selectedTargetLangObj.name} {t('ag.superadmin.superlanguagespage.value_optional', 'Value (optional)')}
                </label>
                <input
                  type="text"
                  placeholder={`Enter ${selectedTargetLangObj.name} translation`}
                  value={keyForm.target}
                  onChange={(e) => setKeyForm({ ...keyForm, target: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isSubmittingKey}
                  onClick={() => setIsAddKeyOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-600 dark:text-zinc-400 disabled:opacity-50"
                >
                  {t('ag.superadmin.superlanguagespage.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingKey}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isSubmittingKey && <FleetIcons.Spinner className="w-3.5 h-3.5 animate-spin text-white" />}
                  <span>{isSubmittingKey ? t('i18n.saving_key', 'Saving Key...') : t('i18n.save_key', 'Save Key')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4 is now replaced by inline full-page view above */}
    </>
    )}
    </div>
  );
};

export default SuperLanguagesPage;
