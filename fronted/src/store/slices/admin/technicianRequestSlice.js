import { createSlice } from '@reduxjs/toolkit';
import {
  fetchWorkOrdersThunk,
  fetchWorkOrderDetailThunk,
  createWorkOrderThunk,
  updateWorkOrderThunk,
  rateTechnicianThunk,
} from '../../thunks/admin/technicianRequest.thunks.js';

export {
  fetchWorkOrdersThunk,
  fetchWorkOrderDetailThunk,
  createWorkOrderThunk,
  updateWorkOrderThunk,
  rateTechnicianThunk,
};

const initialState = {
  workOrders: [],
  currentWorkOrder: null,
  currentWorkOrderLoading: false,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  status: 'idle',
  listRequestId: null,
  error: null,
};

function upsertWorkOrder(state, updated) {
  if (!updated || !updated.id) return;
  const idx = state.workOrders.findIndex((w) => w.id === updated.id);
  if (idx !== -1) {
    state.workOrders[idx] = { ...state.workOrders[idx], ...updated };
  } else {
    state.workOrders = [updated, ...(state.workOrders || [])];
  }
  if (state.currentWorkOrder && state.currentWorkOrder.id === updated.id) {
    state.currentWorkOrder = { ...state.currentWorkOrder, ...updated };
  }
}

const adminTechnicianRequestSlice = createSlice({
  name: 'adminTechnicianRequest',
  initialState,
  reducers: {
    clearCurrentWorkOrder: (state) => {
      state.currentWorkOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkOrdersThunk.pending, (state, action) => {
        state.status = 'loading';
        state.listRequestId = action.meta.requestId;
        state.error = null;
      })
      .addCase(fetchWorkOrdersThunk.fulfilled, (state, action) => {
        if (state.listRequestId !== action.meta.requestId) return;
        state.status = 'succeeded';
        state.listRequestId = null;
        state.error = null;
        if (action.payload && action.payload.rows) {
          state.workOrders = action.payload.rows;
          state.pagination = action.payload.meta || state.pagination;
        } else if (Array.isArray(action.payload)) {
          state.workOrders = action.payload;
        } else {
          state.workOrders = [];
        }
      })
      .addCase(fetchWorkOrdersThunk.rejected, (state, action) => {
        if (state.listRequestId !== action.meta.requestId) return;
        state.status = 'failed';
        state.listRequestId = null;
        state.error = action.payload;
        state.workOrders = [];
      })
      .addCase(fetchWorkOrderDetailThunk.pending, (state) => {
        state.currentWorkOrderLoading = true;
      })
      .addCase(fetchWorkOrderDetailThunk.fulfilled, (state, action) => {
        state.currentWorkOrderLoading = false;
        state.currentWorkOrder = action.payload;
        upsertWorkOrder(state, action.payload);
      })
      .addCase(fetchWorkOrderDetailThunk.rejected, (state) => {
        state.currentWorkOrderLoading = false;
      })
      .addCase(createWorkOrderThunk.fulfilled, (state, action) => {
        upsertWorkOrder(state, action.payload);
      })
      .addCase(updateWorkOrderThunk.fulfilled, (state, action) => {
        upsertWorkOrder(state, action.payload);
      })
      .addCase(rateTechnicianThunk.fulfilled, (state, action) => {
        upsertWorkOrder(state, action.payload);
      });
  },
});

export const { clearCurrentWorkOrder } = adminTechnicianRequestSlice.actions;
export default adminTechnicianRequestSlice.reducer;
export const selectAdminWorkOrders = (state) => state.adminTechnicianRequest.workOrders;
export const selectAdminWorkOrdersLoading = (state) => state.adminTechnicianRequest.status === 'loading';
export const selectAdminWorkOrdersError = (state) => state.adminTechnicianRequest.error;
export const selectAdminWorkOrdersPagination = (state) => state.adminTechnicianRequest.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
export const selectCurrentAdminWorkOrder = (state) => state.adminTechnicianRequest.currentWorkOrder;
export const selectCurrentAdminWorkOrderLoading = (state) => state.adminTechnicianRequest.currentWorkOrderLoading;
