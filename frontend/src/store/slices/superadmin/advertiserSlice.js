import { createSlice } from '@reduxjs/toolkit';
import {
  fetchSuperAdvertisersThunk,
  fetchSuperAdvertiserThunk,
  createSuperAdvertiserThunk,
  updateSuperAdvertiserThunk,
  deleteSuperAdvertiserThunk,
  updateSuperAdvertiserStatusThunk,
} from '../../thunks/superadmin/advertiser.thunks.js';

export {
  fetchSuperAdvertisersThunk,
  fetchSuperAdvertiserThunk,
  createSuperAdvertiserThunk,
  updateSuperAdvertiserThunk,
  deleteSuperAdvertiserThunk,
  updateSuperAdvertiserStatusThunk,
};

const initialState = {
  advertisers: [],
  currentAdvertiser: null,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  status: 'idle',
  error: null,
};

const superAdvertiserSlice = createSlice({
  name: 'superAdvertiser',
  initialState,
  reducers: {
    clearCurrentAdvertiser: (state) => {
      state.currentAdvertiser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuperAdvertisersThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSuperAdvertisersThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload && action.payload.rows) {
          state.advertisers = action.payload.rows;
          state.pagination = action.payload.meta || state.pagination;
        } else if (Array.isArray(action.payload)) {
          state.advertisers = action.payload;
        } else {
          state.advertisers = [];
        }
      })
      .addCase(fetchSuperAdvertisersThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchSuperAdvertiserThunk.fulfilled, (state, action) => {
        state.currentAdvertiser = action.payload;
      })
      .addCase(createSuperAdvertiserThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.advertisers = [action.payload, ...(state.advertisers || [])];
        }
      })
      .addCase(updateSuperAdvertiserThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated?.id) {
          state.currentAdvertiser = updated;
          state.advertisers = (state.advertisers || []).map((adv) =>
            adv.id === updated.id ? { ...adv, ...updated } : adv
          );
        }
      })
      .addCase(deleteSuperAdvertiserThunk.fulfilled, (state, action) => {
        const id = action.meta?.arg;
        if (id) {
          state.advertisers = (state.advertisers || []).filter(
            (adv) => adv.id !== Number(id) && adv.id !== id
          );
          if (state.currentAdvertiser?.id === id || state.currentAdvertiser?.id === Number(id)) {
            state.currentAdvertiser = null;
          }
        }
      })
      .addCase(updateSuperAdvertiserStatusThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated?.id) {
          state.advertisers = (state.advertisers || []).map((adv) =>
            adv.id === updated.id || adv.user_id === updated.id || adv.user?.id === updated.id
              ? { ...adv, status: updated.status, ...(adv.user ? { user: { ...adv.user, status: updated.status } } : {}) }
              : adv
          );
          if (state.currentAdvertiser?.id === updated.id) {
            state.currentAdvertiser = { ...state.currentAdvertiser, status: updated.status };
          }
        }
      });
  },
});

export const { clearCurrentAdvertiser } = superAdvertiserSlice.actions;
export default superAdvertiserSlice.reducer;
export const selectSuperAdvertisers = (state) => state.superAdvertiser?.advertisers || [];
export const selectCurrentAdvertiser = (state) => state.superAdvertiser?.currentAdvertiser;
export const selectSuperAdvertiserLoading = (state) => state.superAdvertiser?.status === 'loading';
export const selectSuperAdvertisersPagination = (state) => state.superAdvertiser?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
