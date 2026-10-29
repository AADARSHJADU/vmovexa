import { createSlice } from '@reduxjs/toolkit';
import {
  fetchFleetsThunk,
  fetchFleetThunk,
  createFleetThunk,
  updateFleetThunk,
  deleteFleetThunk,
  approveFleetThunk,
  rejectFleetThunk,
} from '../../thunks/fleet/fleet.thunks.js';

export {
  fetchFleetsThunk,
  fetchFleetThunk,
  createFleetThunk,
  updateFleetThunk,
  deleteFleetThunk,
  approveFleetThunk,
  rejectFleetThunk,
};

const initialState = {
  fleets: [],
  selectedFleet: null,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  status: 'idle',
  error: null,
};

const fleetManagerSlice = createSlice({
  name: 'fleetManager',
  initialState,
  reducers: {
    clearSelectedFleet: (state) => {
      state.selectedFleet = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch List
      .addCase(fetchFleetsThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchFleetsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload && action.payload.rows) {
          state.fleets = action.payload.rows;
          state.pagination = action.payload.meta || state.pagination;
        } else if (Array.isArray(action.payload)) {
          state.fleets = action.payload;
        } else {
          state.fleets = [];
        }
      })
      .addCase(fetchFleetsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Fetch Single Fleet
      .addCase(fetchFleetThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchFleetThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedFleet = action.payload;
      })
      .addCase(fetchFleetThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Update Fleet
      .addCase(updateFleetThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.selectedFleet = action.payload;
          state.fleets = state.fleets.map((f) => (f.id === action.payload.id ? action.payload : f));
        }
      })

      // Delete Fleet
      .addCase(deleteFleetThunk.fulfilled, (state, action) => {
        state.fleets = state.fleets.filter((f) => f.id !== action.payload);
      });
  },
});

export const { clearSelectedFleet } = fleetManagerSlice.actions;
export default fleetManagerSlice.reducer;
export const selectFleetsData = (state) => state.fleetManager.fleets;
export const selectSelectedFleet = (state) => state.fleetManager.selectedFleet;
export const selectFleetsPagination = (state) => state.fleetManager.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
export const selectFleetManagerLoading = (state) => state.fleetManager.status === 'loading';
