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
  createTranslationKeyThunk,
  updateTranslationKeyThunk,
  deleteTranslationKeyThunk,
  upsertTranslationThunk,
  translateSingleThunk,
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
  const createKey = useCallback((data) => dispatch(createTranslationKeyThunk(data)).unwrap(), [dispatch]);
  const updateKey = useCallback((id, data) => dispatch(updateTranslationKeyThunk({ id, data })).unwrap(), [dispatch]);
  const deleteKey = useCallback((id) => dispatch(deleteTranslationKeyThunk(id)).unwrap(), [dispatch]);
  const saveTranslation = useCallback((data) => dispatch(upsertTranslationThunk(data)).unwrap(), [dispatch]);
  const translateSingle = useCallback((data) => dispatch(translateSingleThunk(data)).unwrap(), [dispatch]);

  return {
    languages, keys, loadLanguages, loadKeys, createLanguage, updateLanguage, deleteLanguage,
    autoTranslate, createKey, updateKey, deleteKey, saveTranslation, translateSingle,
  };
};

export default useLanguages;
