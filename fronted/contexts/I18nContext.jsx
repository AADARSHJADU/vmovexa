/**
 * I18nContext.jsx — language state provider.
 * API calls now go through i18nService (not directly via apiClient).
 * Pattern: Context → i18nService → apiClient → backend.
 */
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { i18nService } from '../api/services/i18n.service.js';
import { LOCAL_TRANSLATIONS } from '../constants/translations.js';
import { useAuth } from '../hooks/useAuth.js';


const I18nContext = createContext(null);

const containsUnexpectedEnglishScript = (value) => {
  if (typeof value !== 'string') return false;
  return /[\u0900-\u0D7F]|à¤|à¥|à²|à³|à°|à±|à®|à¯|à´|àµ|àª|à«|à¦|à§|à¨|à©/u.test(value);
};

// Fallback starter languages while API loads
const DEFAULT_LANGUAGES = [
  { id: 1, code: 'en', name: 'English',  native_name: 'English', direction: 'ltr', is_default: true },
  { id: 2, code: 'hi', name: 'Hindi',    native_name: 'हिन्दी', direction: 'ltr', is_default: false },
  { id: 3, code: 'mr', name: 'Marathi',  native_name: 'मराठी',   direction: 'ltr', is_default: false },
  { id: 4, code: 'kn', name: 'Kannada',  native_name: 'ಕನ್ನಡ',   direction: 'ltr', is_default: false },
  { id: 5, code: 'te', name: 'Telugu',   native_name: 'తెలుగు',  direction: 'ltr', is_default: false },
  { id: 6, code: 'ta', name: 'Tamil',    native_name: 'தமிழ்',   direction: 'ltr', is_default: false },
  { id: 7, code: 'ml', name: 'Malayalam',native_name: 'മലയാളം',  direction: 'ltr', is_default: false },
  { id: 8, code: 'gu', name: 'Gujarati', native_name: 'ગુજરાતી', direction: 'ltr', is_default: false },
  { id: 9, code: 'bn', name: 'Bengali',  native_name: 'বাংলা',   direction: 'ltr', is_default: false },
  { id: 10,code: 'pa', name: 'Punjabi',  native_name: 'ਪੰਜਾਬੀ',  direction: 'ltr', is_default: false },
];

const getInitialLanguage = () => {
  const saved = localStorage.getItem('vmovexa_lang');
  const userSelected = localStorage.getItem('vmovexa_lang_user_selected') === 'true';

  // If user explicitly picked a language via the language switcher, preserve it
  if (saved && userSelected) {
    return saved;
  }
  // If saved is 'en', keep it
  if (saved === 'en') {
    return 'en';
  }
  // If legacy default 'hi' was saved without explicit user selection, migrate to 'en'
  if (saved === 'hi' && !userSelected) {
    localStorage.setItem('vmovexa_lang', 'en');
    return 'en';
  }
  return saved || 'en';
};

export const I18nProvider = ({ children }) => {
  const { user, updateProfile } = useAuth();
  // Initial language: English ('en') is primary default
  const [currentLanguage, setCurrentLanguage] = useState(getInitialLanguage);
  const pendingLanguageRef = useRef(null);

  const [languages, setLanguages]     = useState(DEFAULT_LANGUAGES);
  const [translations, setTranslations] = useState(() => LOCAL_TRANSLATIONS[getInitialLanguage()] || {});
  const [loading, setLoading]         = useState(true);

  // Fetch all installed languages via service
  const fetchLanguages = useCallback(async () => {
    try {
      const data = await i18nService.getLanguages();
      const list = Array.isArray(data) ? data : (data?.languages || []);
      if (list.length > 0) setLanguages(list);
    } catch {
      // Keep fallback languages on error
    }
  }, []);

  // Fetch translation bundle for a language via service
  const fetchBundle = useCallback(async (langCode) => {
    try {
      setLoading(true);
      const localFallback = LOCAL_TRANSLATIONS[langCode] || {};
      const data = await i18nService.getBundle(langCode);
      const remoteKeys = data?.keys || {};
      const safeRemoteKeys = langCode === 'en'
        ? Object.fromEntries(
            Object.entries(remoteKeys).filter(([, value]) => !containsUnexpectedEnglishScript(value))
          )
        : remoteKeys;
      const merged = { ...localFallback, ...safeRemoteKeys };
      setTranslations(merged);
      const dir = data?.direction || 'ltr';
      document.documentElement.dir  = dir;
      document.documentElement.lang = langCode;
    } catch {
      // Keep local fallback on network error
      const localFallback = LOCAL_TRANSLATIONS[langCode] || {};
      setTranslations(localFallback);
    } finally {
      setLoading(false);
    }
  }, []);

  // Bootstrap on mount
  useEffect(() => {
    const bootstrapTimer = window.setTimeout(() => {
      fetchLanguages();
      fetchBundle(currentLanguage);
    }, 0);
    return () => window.clearTimeout(bootstrapTimer);
  }, [fetchLanguages, fetchBundle, currentLanguage]);

  const applyLanguage = useCallback((langCode, markUserSelected = true) => {
    if (!langCode) return;
    setCurrentLanguage(langCode);
    localStorage.setItem('vmovexa_lang', langCode);
    if (markUserSelected) {
      localStorage.setItem('vmovexa_lang_user_selected', 'true');
    }
    if (LOCAL_TRANSLATIONS[langCode]) {
      setTranslations((prev) => ({ ...prev, ...LOCAL_TRANSLATIONS[langCode] }));
    }
  }, []);

  // The authenticated user's DB preference is authoritative on every portal.
  const savedUserLanguage = user?.language?.code
    || user?.settings?.locale
    || languages.find((language) => Number(language.id) === Number(user?.language_id))?.code;

  useEffect(() => {
    if (!user?.id || pendingLanguageRef.current || !savedUserLanguage) return;
    if (savedUserLanguage !== currentLanguage) {
      const syncTimer = window.setTimeout(() => applyLanguage(savedUserLanguage, false), 0);
      return () => window.clearTimeout(syncTimer);
    }
    return undefined;
  }, [user?.id, savedUserLanguage, currentLanguage, applyLanguage]);

  // Header selections are persisted to DB. Settings pages may pass
  // { persist: false } after their own profile update to avoid a duplicate call.
  const changeLanguage = useCallback(async (langCode, { persist = true } = {}) => {
    if (!langCode) return;
    const previousLanguage = currentLanguage;
    applyLanguage(langCode);

    if (!persist || !user?.id || langCode === savedUserLanguage) return;

    pendingLanguageRef.current = langCode;
    try {
      await updateProfile({ language: langCode });
    } catch (error) {
      applyLanguage(previousLanguage);
      throw error;
    } finally {
      pendingLanguageRef.current = null;
    }
  }, [applyLanguage, currentLanguage, savedUserLanguage, updateProfile, user?.id]);

  // t('key', 'Fallback text', { param: value })
  const t = useCallback((key, defaultText = '', params = {}) => {
    if (!key) return '';
    let text = translations[key];
    if (text === undefined) {
      const localVal = LOCAL_TRANSLATIONS[currentLanguage]?.[key];
      text = localVal !== undefined ? localVal : (defaultText || key);
    }
    if (params && typeof params === 'object' && Object.keys(params).length > 0) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{{1,2}\\s*${k}\\s*\\}{1,2}`, 'g'), String(v));
      });
    }
    return text;
  }, [translations, currentLanguage]);

  const activeLangObj = languages.find((l) => l.code === currentLanguage) || {
    code: currentLanguage,
    name: currentLanguage.toUpperCase(),
    native_name: currentLanguage.toUpperCase(),
    direction: 'ltr',
  };

  const isRtl = activeLangObj.direction === 'rtl';

  const value = {
    currentLanguage,
    activeLanguage: activeLangObj,
    languages,
    translations,
    loading,
    changeLanguage,
    t,
    isRtl,
    refreshLanguages: fetchLanguages,
    refreshBundle: () => fetchBundle(currentLanguage),
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

// The provider and its matching hook intentionally share this context module.
// eslint-disable-next-line react-refresh/only-export-components
export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    return {
      t: (key, fallback, params) => {
        let text = fallback || key;
        if (params && typeof params === 'object') {
          Object.entries(params).forEach(([k, v]) => {
            text = text.replace(new RegExp(`\\{{1,2}\\s*${k}\\s*\\}{1,2}`, 'g'), String(v));
          });
        }
        return text;
      },
      currentLanguage: 'en',
      languages: DEFAULT_LANGUAGES,
      changeLanguage: () => {},
      isRtl: false,
      loading: false,
    };
  }
  return context;
};

export default I18nContext;
