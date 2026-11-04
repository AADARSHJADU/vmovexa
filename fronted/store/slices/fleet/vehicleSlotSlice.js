import { createSlice } from '@reduxjs/toolkit';
import {
  fetchVehicleSlotsThunk,
  fetchVehicleSlotByIdThunk,
  createVehicleSlotThunk,
  updateVehicleSlotThunk,
  deleteVehicleSlotThunk,
  checkSlotConflictThunk,
  fetchSlotsTimetableThunk,
} from '../../thunks/fleet/vehicleSlot.thunks.js';

export {
  fetchVehicleSlotsThunk,
  fetchVehicleSlotByIdThunk,
  createVehicleSlotThunk,
  updateVehicleSlotThunk,
  deleteVehicleSlotThunk,
  checkSlotConflictThunk,
  fetchSlotsTimetableThunk,
};

const initialState = {
  slots: [],
  selectedSlot: null,
  timetable: { hours: [], routes: [], totalSlots: 0 },
  conflictCheckResult: null,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  actionStatus: 'idle', // for create/update/delete operations
  error: null,
};

const vehicleSlotSlice = createSlice({
  name: 'vehicleSlot',
  initialState,
  reducers: {
    clearSelectedSlot: (state) => {
      state.selectedSlot = null;
    },
    clearConflictCheck: (state) => {
      state.conflictCheckResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Slots List
      .addCase(fetchVehicleSlotsThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchVehicleSlotsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload && (action.payload.rows || action.payload.items)) {
          state.slots = action.payload.rows || action.payload.items;
          state.pagination = action.payload.meta || {
            page: action.payload.page || 1,
            limit: action.payload.limit || 10,
            total: action.payload.total || (action.payload.rows || []).length,
            totalPages: action.payload.totalPages || 1,
          };
        } else if (Array.isArray(action.payload)) {
          state.slots = action.payload;
        } else {
          state.slots = [];
        }
      })
      .addCase(fetchVehicleSlotsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Fetch Single Slot
      .addCase(fetchVehicleSlotByIdThunk.fulfilled, (state, action) => {
        state.selectedSlot = action.payload;
      })

      // Create Slot
      .addCase(createVehicleSlotThunk.pending, (state) => {
        state.actionStatus = 'loading';
      })
      .addCase(createVehicleSlotThunk.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        if (action.payload) {
          state.slots.unshift(action.payload);
        }
      })
      .addCase(createVehicleSlotThunk.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })

      // Update Slot
      .addCase(updateVehicleSlotThunk.pending, (state) => {
        state.actionStatus = 'loading';
      })
      .addCase(updateVehicleSlotThunk.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        if (action.payload) {
          const idx = state.slots.findIndex((s) => String(s.id) === String(action.payload.id));
          if (idx !== -1) {
            state.slots[idx] = action.payload;
          }
          if (String(state.selectedSlot?.id) === String(action.payload.id)) {
            state.selectedSlot = action.payload;
          }
        }
      })
      .addCase(updateVehicleSlotThunk.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })

      // Delete Slot
      .addCase(deleteVehicleSlotThunk.fulfilled, (state, action) => {
        state.slots = state.slots.filter((s) => String(s.id) !== String(action.payload));
      })

      // Conflict Check
      .addCase(checkSlotConflictThunk.fulfilled, (state, action) => {
        state.conflictCheckResult = action.payload;
      })

      // Timetable Matrix Grid
      .addCase(fetchSlotsTimetableThunk.fulfilled, (state, action) => {
        state.timetable = action.payload || { hours: [], routes: [], totalSlots: 0 };
      });
  },
});

export const { clearSelectedSlot, clearConflictCheck } = vehicleSlotSlice.actions;
export default vehicleSlotSlice.reducer;

// Selectors
export const selectVehicleSlots = (state) => state.vehicleSlot?.slots || [];
export const selectVehicleSlotPagination = (state) => state.vehicleSlot?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
export const selectSelectedVehicleSlot = (state) => state.vehicleSlot?.selectedSlot;
export const selectSlotsTimetable = (state) => state.vehicleSlot?.timetable || { hours: [], routes: [], totalSlots: 0 };
export const selectSlotConflictResult = (state) => state.vehicleSlot?.conflictCheckResult;
export const selectVehicleSlotStatus = (state) => state.vehicleSlot?.status || 'idle';
export const selectVehicleSlotActionStatus = (state) => state.vehicleSlot?.actionStatus || 'idle';
