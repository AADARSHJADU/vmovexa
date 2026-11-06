import { createAsyncThunk } from '@reduxjs/toolkit';
import { faqService } from '../../../api/services/shared/faq.service.js';

export const fetchFaqsThunk = createAsyncThunk(
  'faq/fetch',
  async (roleCode, { rejectWithValue }) => {
    try { return await faqService.list(roleCode); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const createFaqThunk = createAsyncThunk(
  'faq/create',
  async (data, { rejectWithValue }) => {
    try { return await faqService.create(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateFaqThunk = createAsyncThunk(
  'faq/update',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await faqService.update(id, data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const deleteFaqThunk = createAsyncThunk(
  'faq/delete',
  async (id, { rejectWithValue }) => {
    try { await faqService.remove(id); return id; }
    catch (err) { return rejectWithValue(err); }
  }
);
