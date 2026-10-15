import { createSlice } from '@reduxjs/toolkit';
import {
  fetchFleetOperatorsThunk,
  fetchFleetOperatorThunk,
  createFleetOperatorThunk,
  updateFleetOperatorThunk,
  updateOperatorStatusThunk,
  deleteFleetOperatorThunk,
  fetchOperatorActivityThunk,
  fetchOperatorPermissionsThunk,
  updateOperatorPermissionsThunk,
} from '../../thunks/admin/fleetOperator.thunks.js';

export {
  fetchFleetOperatorsThunk,
  fetchFleetOperatorThunk,
  createFleetOperatorThunk,
  updateFleetOperatorThunk,
  updateOperatorStatusThunk,
  deleteFleetOperatorThunk,
  fetchOperatorActivityThunk,
  fetchOperatorPermissionsThunk,
  updateOperatorPermissionsThunk,
};

const initialState = {
  fleetOperators: [],
  selectedOperator: null,
  operatorActivity: [],
  activityPagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  operatorPermissions: null,
  pagination: { page: 1, limit: 6, total: 0, totalPages: 1 },
  status: 'idle',
  error: null,
};

const adminFleetOperatorSlice = createSlice({
  name: 'adminFleetOperator',
  initialState,
  reducers: {
    clearSelectedOperator: (state) => {
      state.selectedOperator = null;
      state.operatorActivity = [];
      state.operatorPermissions = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch List
      .addCase(fetchFleetOperatorsThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchFleetOperatorsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload && action.payload.rows) {
          state.fleetOperators = action.payload.rows;
          state.pagination = action.payload.meta || state.pagination;
        } else if (Array.isArray(action.payload)) {
          state.fleetOperators = action.payload;
        } else {
          state.fleetOperators = [];
        }
      })
      .addCase(fetchFleetOperatorsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Fetch Single
      .addCase(fetchFleetOperatorThunk.fulfilled, (state, action) => {
        state.selectedOperator = action.payload;
      })

      // Create
      .addCase(createFleetOperatorThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.fleetOperators.unshift(action.payload);
        }
      })

      // Update
      .addCase(updateFleetOperatorThunk.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.fleetOperators.findIndex((o) => o.id === action.payload.id);
          if (index !== -1) {
            state.fleetOperators[index] = { ...state.fleetOperators[index], ...action.payload };
          }
          if (state.selectedOperator?.id === action.payload.id) {
            state.selectedOperator = { ...state.selectedOperator, ...action.payload };
          }
        }
      })

      // Update Status
      .addCase(updateOperatorStatusThunk.fulfilled, (state, action) => {
        const { id, status } = action.meta.arg;
        const target = state.fleetOperators.find((o) => o.id === id);
        if (target) target.status = status;
        if (state.selectedOperator?.id === id) state.selectedOperator.status = status;
      })

      // Delete
      .addCase(deleteFleetOperatorThunk.fulfilled, (state, action) => {
        const id = action.meta.arg;
        if (Array.isArray(state.fleetOperators)) {
          state.fleetOperators = state.fleetOperators.filter((o) => String(o.id) !== String(id));
        } else if (state.fleetOperators?.rows) {
          state.fleetOperators.rows = state.fleetOperators.rows.filter((o) => String(o.id) !== String(id));
        } else if (state.fleetOperators?.items) {
          state.fleetOperators.items = state.fleetOperators.items.filter((o) => String(o.id) !== String(id));
        }
        if (String(state.selectedOperator?.id) === String(id)) state.selectedOperator = null;
      })

      // Activity
      .addCase(fetchOperatorActivityThunk.fulfilled, (state, action) => {
        if (action.payload && action.payload.rows) {
          state.operatorActivity = action.payload.rows;
          state.activityPagination = action.payload.meta || state.activityPagination;
        } else if (Array.isArray(action.payload)) {
          state.operatorActivity = action.payload;
        } else {
          state.operatorActivity = [];
        }
      })

      // Permissions
      .addCase(fetchOperatorPermissionsThunk.fulfilled, (state, action) => {
        state.operatorPermissions = action.payload;
      })
      .addCase(updateOperatorPermissionsThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.operatorPermissions = action.payload;
        }
      });
  },
});

export const { clearSelectedOperator } = adminFleetOperatorSlice.actions;

export default adminFleetOperatorSlice.reducer;
export const selectAdminFleetOperators = (state) => state.adminFleetOperator.fleetOperators;
export const selectSelectedFleetOperator = (state) => state.adminFleetOperator.selectedOperator;
export const selectFleetOperatorActivity = (state) => state.adminFleetOperator.operatorActivity;
export const selectFleetOperatorActivityPagination = (state) => state.adminFleetOperator.activityPagination;
export const selectFleetOperatorPermissions = (state) => state.adminFleetOperator.operatorPermissions;
export const selectAdminFleetOperatorLoading = (state) => state.adminFleetOperator.status === 'loading';
export const selectAdminFleetOperatorPagination = (state) => state.adminFleetOperator.pagination || { page: 1, limit: 6, total: 0, totalPages: 1 };

