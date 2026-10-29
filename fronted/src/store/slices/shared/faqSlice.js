import { createSlice } from '@reduxjs/toolkit';
import {
  fetchFaqsThunk,
  createFaqThunk,
  updateFaqThunk,
  deleteFaqThunk,
} from '../../thunks/shared/faq.thunks.js';

export { fetchFaqsThunk, createFaqThunk, updateFaqThunk, deleteFaqThunk };

const initialState = { items: [], status: 'idle', error: null };

const faqSlice = createSlice({
  name: 'faq',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFaqsThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchFaqsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      });
  },
});

export default faqSlice.reducer;
export const selectFaqs = (state) => state.faq.items;
