/**
 * I18nContext.jsx — language state provider.
 * API calls now go through i18nService (not directly via apiClient).
 * Pattern: Context → i18nService → apiClient → backend.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { i18nService } from '../api/services/i18n.service.js';
import { LOCAL_TRANSLATIONS } from '../constants/translations.js';


const I18nContext = createContext(null);

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
  // Initial language: English ('en') is primary default
  const [currentLanguage, setCurrentLanguage] = useState(getInitialLanguage);

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
      const merged = { ...localFallback, ...(data?.keys || {}) };
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
    fetchLanguages();
    fetchBundle(currentLanguage);
  }, [fetchLanguages, fetchBundle, currentLanguage]);

  // Switch active language
  const changeLanguage = useCallback((langCode) => {
    if (!langCode || langCode === currentLanguage) return;
    setCurrentLanguage(langCode);
    localStorage.setItem('vmovexa_lang', langCode);
    localStorage.setItem('vmovexa_lang_user_selected', 'true');
    if (LOCAL_TRANSLATIONS[langCode]) {
      setTranslations((prev) => ({ ...prev, ...LOCAL_TRANSLATIONS[langCode] }));
    }
    fetchBundle(langCode);
  }, [currentLanguage, fetchBundle]);

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
        text = text.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), String(v));
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

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    return {
      t: (key, fallback) => fallback || key,
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
