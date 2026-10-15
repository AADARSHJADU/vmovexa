import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';

// Flag & Icon helper by language code
const getLanguageFlag = (code) => {
  const map = {
    hi: '🇮🇳',
    en: '🇬🇧',
    mr: '🇮🇳',
    kn: '🇮🇳',
    ta: '🇮🇳',
    te: '🇮🇳',
    bn: '🇮🇳',
    gu: '🇮🇳',
    pa: '🇮🇳',
    ur: '🇵🇰',
    es: '🇪🇸',
    fr: '🇫🇷',
    de: '🇩🇪',
    ar: '🇸🇦',
    zh: '🇨🇳',
    ja: '🇯🇵',
    ru: '🇷🇺',
  };
  return map[code?.toLowerCase()] || '🌐';
};

export const LanguageSwitcher = ({ className = '', compact = false }) => {
  const { currentLanguage, activeLanguage, languages, changeLanguage, loading } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeLanguages = languages.filter((l) => l.is_active !== false);
  const filteredLanguages = activeLanguages.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      (l.native_name && l.native_name.toLowerCase().includes(q)) ||
      l.code.toLowerCase().includes(q)
    );
  });

  const handleSelect = (code) => {
    changeLanguage(code);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/90 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-semibold transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        title="Change Language / भाषा बदलें"
        aria-label="Language selector"
      >
        <span className="text-sm shrink-0 leading-none">{getLanguageFlag(currentLanguage)}</span>
        {!compact && (
          <span className="font-bold tracking-tight text-[11px] truncate max-w-[80px]">
            {activeLanguage.native_name || activeLanguage.name || currentLanguage.toUpperCase()}
          </span>
        )}
        <svg
          className={`w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Select Language
              </span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
              {activeLanguages.length} Available
            </span>
          </div>

          {/* Search Box (if more than 4 languages) */}
          {activeLanguages.length > 4 && (
            <div className="p-2 border-b border-slate-100 dark:border-zinc-800/60">
              <input
                type="text"
                placeholder="Search language..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-zinc-800/80 border border-transparent focus:border-blue-500 text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none"
                autoFocus
              />
            </div>
          )}

          {/* Languages List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 no-scrollbar">
            {filteredLanguages.map((lang) => {
              const isSelected = lang.code === currentLanguage;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                      : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800/70 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base shrink-0 leading-none">{getLanguageFlag(lang.code)}</span>
                    <div className="truncate">
                      <p className="truncate font-semibold leading-tight">
                        {lang.native_name || lang.name}
                      </p>
                      <p
                        className={`text-[10px] truncate leading-tight mt-0.5 ${
                          isSelected ? 'text-blue-100' : 'text-slate-400 dark:text-zinc-500'
                        }`}
                      >
                        {lang.name} ({lang.code.toUpperCase()})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {lang.direction === 'rtl' && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                        }`}
                      >
                        RTL
                      </span>
                    )}
                    {isSelected && (
                      <svg className="w-4 h-4 text-white shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}

            {filteredLanguages.length === 0 && (
              <div className="py-4 text-center text-xs text-slate-400 dark:text-zinc-500">
                No language found matching "{search}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
