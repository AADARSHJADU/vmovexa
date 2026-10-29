import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectLanguages,
  selectTranslationKeys,
  fetchLanguagesThunk,
  fetchTranslationKeysThunk,
  createLanguageThunk,
  updateLanguageThunk,
  deleteLanguageThunk,
  autoTranslateThunk,
} from '../../store/slices/shared/i18nAdminSlice.js';

/** Languages & translation management — used by SuperAdmin Languages page. */
export const useLanguages = () => {
  const dispatch = useAppDispatch();
  const languages = useAppSelector(selectLanguages);
  const keys = useAppSelector(selectTranslationKeys);

  const loadLanguages = useCallback(() => dispatch(fetchLanguagesThunk()).unwrap(), [dispatch]);
  const loadKeys = useCallback((params) => dispatch(fetchTranslationKeysThunk(params)).unwrap(), [dispatch]);
  const createLanguage = useCallback((data) => dispatch(createLanguageThunk(data)).unwrap(), [dispatch]);
  const updateLanguage = useCallback((id, data) => dispatch(updateLanguageThunk({ id, data })).unwrap(), [dispatch]);
  const deleteLanguage = useCallback((id) => dispatch(deleteLanguageThunk(id)).unwrap(), [dispatch]);
  const autoTranslate = useCallback((data) => dispatch(autoTranslateThunk(data)).unwrap(), [dispatch]);

  return { languages, keys, loadLanguages, loadKeys, createLanguage, updateLanguage, deleteLanguage, autoTranslate };
};

export default useLanguages;
