import { createSlice } from '@reduxjs/toolkit';
import {
  fetchContentPageThunk,
  fetchContentListThunk,
  createContentPageThunk,
  updateContentPageThunk,
  publishContentPageThunk,
} from '../../thunks/shared/content.thunks.js';

export {
  fetchContentPageThunk,
  fetchContentListThunk,
  createContentPageThunk,
  updateContentPageThunk,
  publishContentPageThunk,
};

const initialState = {
  pages: {},   // { terms: {...}, privacy: {...}, help: {...} }
  list: [],    // all pages (management)
  status: 'idle',
  error: null,
};

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchContentPageThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchContentPageThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.pages[action.payload.type] = action.payload.page;
        if (action.payload.role) {
          state.pages[`${action.payload.type}_${action.payload.role}`] = action.payload.page;
        }
      })
      .addCase(fetchContentPageThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch content';
      })
      .addCase(fetchContentListThunk.fulfilled, (state, action) => {
        state.list = action.payload;
      });
  },
});

export default contentSlice.reducer;
export const selectContentPages = (state) => state.content.pages;
export const selectContentList = (state) => state.content.list;
