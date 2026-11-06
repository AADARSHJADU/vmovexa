import { createSlice } from '@reduxjs/toolkit';
import {
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
} from '../../thunks/shared/i18nAdmin.thunks.js';

export {
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
};

const initialState = {
  languages: [],
  keys: [],
  totalKeys: 0,
  namespaces: [],
  status: 'idle',
  error: null,
};

const i18nAdminSlice = createSlice({
  name: 'i18nAdmin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLanguagesThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchLanguagesThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.languages = action.payload;
      })
      .addCase(fetchTranslationKeysThunk.fulfilled, (state, action) => {
        state.keys = action.payload?.keys || [];
        state.totalKeys = action.payload?.total || 0;
        state.namespaces = action.payload?.namespaces || [];
      });
  },
});

export default i18nAdminSlice.reducer;
export const selectLanguages = (state) => state.i18nAdmin.languages;
export const selectTranslationKeys = (state) => state.i18nAdmin.keys;
