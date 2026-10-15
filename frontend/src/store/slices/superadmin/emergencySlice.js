import { createSlice } from '@reduxjs/toolkit';
import {
  fetchEmergencyBroadcastsThunk,
  createEmergencyBroadcastThunk,
  revokeEmergencyBroadcastThunk,
} from '../../thunks/superadmin/emergency.thunks.js';

export {
  fetchEmergencyBroadcastsThunk,
  createEmergencyBroadcastThunk,
  revokeEmergencyBroadcastThunk,
};

const initialState = {
  broadcasts: [],
  meta: null,
  status: 'idle',
  error: null,
};

const superEmergencySlice = createSlice({
  name: 'superEmergency',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmergencyBroadcastsThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchEmergencyBroadcastsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const p = action.payload;
        if (Array.isArray(p)) {
          state.broadcasts = p;
        } else if (Array.isArray(p?.rows)) {
          state.broadcasts = p.rows;
          state.meta = p.meta || null;
        } else if (Array.isArray(p?.items)) {
          state.broadcasts = p.items;
          state.meta = p.meta || null;
        } else if (Array.isArray(p?.broadcasts)) {
          state.broadcasts = p.broadcasts;
        } else if (Array.isArray(p?.data)) {
          state.broadcasts = p.data;
        } else {
          state.broadcasts = [];
        }
      })
      .addCase(fetchEmergencyBroadcastsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        if (!Array.isArray(state.broadcasts)) {
          state.broadcasts = [];
        }
      })
      .addCase(createEmergencyBroadcastThunk.fulfilled, (state, action) => {
        if (!Array.isArray(state.broadcasts)) {
          state.broadcasts = [];
        }
        if (action.payload) {
          state.broadcasts.unshift(action.payload);
        }
      })
      .addCase(revokeEmergencyBroadcastThunk.fulfilled, (state, action) => {
        const id = action.meta?.arg;
        if (id && Array.isArray(state.broadcasts)) {
          state.broadcasts = state.broadcasts.map((b) => (b.id === id ? { ...b, status: 'revoked', active: false } : b));
        }
      });
  },
});

export default superEmergencySlice.reducer;
export const selectSuperEmergencyBroadcasts = (state) => {
  const b = state.superEmergency?.broadcasts;
  if (Array.isArray(b)) return b;
  if (Array.isArray(b?.rows)) return b.rows;
  if (Array.isArray(b?.items)) return b.items;
  if (Array.isArray(b?.broadcasts)) return b.broadcasts;
  return [];
};
