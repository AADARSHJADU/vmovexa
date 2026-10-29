import { createAsyncThunk } from '@reduxjs/toolkit';
import { contentService } from '../../../api/services/shared/content.service.js';

export const fetchContentPageThunk = createAsyncThunk(
  'content/fetchPage',
  async (arg, { rejectWithValue }) => {
    const type = typeof arg === 'string' ? arg : arg?.type;
    const params = typeof arg === 'object' && arg?.role ? { role: arg.role } : {};
    try { return { type, role: arg?.role || 'GLOBAL', page: await contentService.getPage(type, params) }; }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchContentListThunk = createAsyncThunk(
  'content/fetchList',
  async (params = {}, { rejectWithValue }) => {
    try { return await contentService.listPages(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const createContentPageThunk = createAsyncThunk(
  'content/createPage',
  async (data, { rejectWithValue }) => {
    try { return await contentService.createPage(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateContentPageThunk = createAsyncThunk(
  'content/updatePage',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await contentService.updatePage(id, data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const publishContentPageThunk = createAsyncThunk(
  'content/publishPage',
  async (id, { rejectWithValue }) => {
    try { return await contentService.publishPage(id); }
    catch (err) { return rejectWithValue(err); }
  }
);
