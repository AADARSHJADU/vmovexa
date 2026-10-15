import { createSlice } from '@reduxjs/toolkit';
import {
  fetchLanguagesThunk,
  fetchTranslationKeysThunk,
  createLanguageThunk,
  updateLanguageThunk,
  deleteLanguageThunk,
  autoTranslateThunk,
} from '../../thunks/shared/i18nAdmin.thunks.js';

export {
  fetchLanguagesThunk,
  fetchTranslationKeysThunk,
  createLanguageThunk,
  updateLanguageThunk,
  deleteLanguageThunk,
  autoTranslateThunk,
};

const initialState = {
  languages: [],
  keys: [],
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
      .addCase(fetchTranslationKeysThunk.fulfilled, (state, action) => { state.keys = action.payload; });
  },
});

export default i18nAdminSlice.reducer;
export const selectLanguages = (state) => state.i18nAdmin.languages;
export const selectTranslationKeys = (state) => state.i18nAdmin.keys;
