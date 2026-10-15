import { createAsyncThunk } from '@reduxjs/toolkit';
import { i18nService } from '../../../api/services/i18n.service.js';

export const fetchLanguagesThunk = createAsyncThunk(
  'i18nAdmin/fetchLanguages',
  async (_, { rejectWithValue }) => {
    try { return await i18nService.getLanguages(); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchTranslationKeysThunk = createAsyncThunk(
  'i18nAdmin/fetchKeys',
  async (params, { rejectWithValue }) => {
    try { return await i18nService.getKeys(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const createLanguageThunk = createAsyncThunk(
  'i18nAdmin/createLanguage',
  async (data, { rejectWithValue }) => {
    try { return await i18nService.createLanguage(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateLanguageThunk = createAsyncThunk(
  'i18nAdmin/updateLanguage',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await i18nService.updateLanguage(id, data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const deleteLanguageThunk = createAsyncThunk(
  'i18nAdmin/deleteLanguage',
  async (id, { rejectWithValue }) => {
    try { await i18nService.deleteLanguage(id); return id; }
    catch (err) { return rejectWithValue(err); }
  }
);

export const autoTranslateThunk = createAsyncThunk(
  'i18nAdmin/autoTranslate',
  async (data, { rejectWithValue }) => {
    try { return await i18nService.autoTranslate(data); }
    catch (err) { return rejectWithValue(err); }
  }
);
