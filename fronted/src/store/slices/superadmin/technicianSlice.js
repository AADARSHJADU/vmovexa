import { createSlice } from '@reduxjs/toolkit';
import {
  fetchCentralTechniciansThunk,
  fetchTechnicianThunk,
  fetchWorkOrdersThunk,
  fetchWorkOrderDetailThunk,
  assignTechnicianWorkOrderThunk,
  dispatchWorkOrderThunk,
  approveWorkOrderThunk,
  rejectWorkOrderThunk,
  updateWorkOrderStatusThunk,
  registerTechnicianThunk,
  updateTechnicianThunk,
  deleteTechnicianThunk,
  updateTechnicianStatusThunk,
} from '../../thunks/superadmin/technician.thunks.js';

export {
  fetchCentralTechniciansThunk,
  fetchTechnicianThunk,
  fetchWorkOrdersThunk,
  fetchWorkOrderDetailThunk,
  assignTechnicianWorkOrderThunk,
  dispatchWorkOrderThunk,
  approveWorkOrderThunk,
  rejectWorkOrderThunk,
  updateWorkOrderStatusThunk,
  registerTechnicianThunk,
  updateTechnicianThunk,
  deleteTechnicianThunk,
  updateTechnicianStatusThunk,
};

const initialState = {
  centralTechnicians: [],
  currentTechnician: null,
  workOrders: [],
  selectedWorkOrder: null,
  selectedWorkOrderLoading: false,
  technicianPagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  workOrderPagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  technicianStatus: 'idle',
  workOrderStatus: 'idle',
  // Backward compatibility aliases
  pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  status: 'idle',
  workOrdersStatus: 'idle',
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
  if (state.selectedWorkOrder && state.selectedWorkOrder.id === updated.id) {
    state.selectedWorkOrder = { ...state.selectedWorkOrder, ...updated };
  }
}

const superTechnicianSlice = createSlice({
  name: 'superTechnician',
  initialState,
  reducers: {
    clearCurrentTechnician: (state) => {
      state.currentTechnician = null;
    },
    clearSelectedWorkOrder: (state) => {
      state.selectedWorkOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCentralTechniciansThunk.pending, (state) => {
        state.technicianStatus = 'loading';
        state.status = 'loading';
      })
      .addCase(fetchCentralTechniciansThunk.fulfilled, (state, action) => {
        state.technicianStatus = 'succeeded';
        state.status = 'succeeded';
        if (action.payload && action.payload.rows) {
          state.centralTechnicians = action.payload.rows;
          const meta = action.payload.meta || { page: 1, limit: 10, total: action.payload.rows.length, totalPages: 1 };
          state.technicianPagination = meta;
          state.pagination = meta;
        } else if (Array.isArray(action.payload)) {
          state.centralTechnicians = action.payload;
          const meta = { page: 1, limit: action.payload.length, total: action.payload.length, totalPages: 1 };
          state.technicianPagination = meta;
          state.pagination = meta;
        } else {
          state.centralTechnicians = [];
        }
      })
      .addCase(fetchCentralTechniciansThunk.rejected, (state, action) => {
        state.technicianStatus = 'failed';
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchTechnicianThunk.fulfilled, (state, action) => {
        state.currentTechnician = action.payload;
      })
      .addCase(fetchWorkOrdersThunk.pending, (state) => {
        state.workOrderStatus = 'loading';
        state.workOrdersStatus = 'loading';
      })
      .addCase(fetchWorkOrdersThunk.fulfilled, (state, action) => {
        state.workOrderStatus = 'succeeded';
        state.workOrdersStatus = 'succeeded';
        if (action.payload && action.payload.rows) {
          state.workOrders = action.payload.rows;
          state.workOrderPagination = action.payload.meta || state.workOrderPagination;
        } else {
          const list = Array.isArray(action.payload)
            ? action.payload
            : action.payload?.data || [];
          state.workOrders = list;
          state.workOrderPagination = { page: 1, limit: list.length, total: list.length, totalPages: 1 };
        }
      })
      .addCase(fetchWorkOrdersThunk.rejected, (state, action) => {
        state.workOrderStatus = 'failed';
        state.workOrdersStatus = 'failed';
        state.error = action.payload;
        state.workOrders = [];
      })
      .addCase(fetchWorkOrderDetailThunk.pending, (state) => {
        state.selectedWorkOrderLoading = true;
      })
      .addCase(fetchWorkOrderDetailThunk.fulfilled, (state, action) => {
        state.selectedWorkOrderLoading = false;
        state.selectedWorkOrder = action.payload;
        upsertWorkOrder(state, action.payload);
      })
      .addCase(fetchWorkOrderDetailThunk.rejected, (state) => {
        state.selectedWorkOrderLoading = false;
      })
      .addCase(assignTechnicianWorkOrderThunk.fulfilled, (state, action) => {
        upsertWorkOrder(state, action.payload);
      })
      .addCase(dispatchWorkOrderThunk.fulfilled, (state, action) => {
        upsertWorkOrder(state, action.payload);
      })
      .addCase(approveWorkOrderThunk.fulfilled, (state, action) => {
        upsertWorkOrder(state, action.payload);
      })
      .addCase(rejectWorkOrderThunk.fulfilled, (state, action) => {
        upsertWorkOrder(state, action.payload);
      })
      .addCase(updateWorkOrderStatusThunk.fulfilled, (state, action) => {
        upsertWorkOrder(state, action.payload);
      })
      .addCase(registerTechnicianThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.centralTechnicians = [action.payload, ...(state.centralTechnicians || [])];
        }
      })
      .addCase(updateTechnicianThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated && updated.id) {
          state.currentTechnician = updated;
          const idx = state.centralTechnicians.findIndex((t) => t.id === updated.id);
          if (idx !== -1) {
            state.centralTechnicians[idx] = { ...state.centralTechnicians[idx], ...updated };
          }
        }
      })
      .addCase(deleteTechnicianThunk.fulfilled, (state, action) => {
        const id = action.meta?.arg;
        if (id) {
          state.centralTechnicians = state.centralTechnicians.filter((t) => t.id !== Number(id) && t.id !== id);
        }
      })
      .addCase(updateTechnicianStatusThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated && updated.id) {
          const idx = state.centralTechnicians.findIndex((t) => t.id === updated.id);
          if (idx !== -1) {
            state.centralTechnicians[idx] = { ...state.centralTechnicians[idx], ...updated };
          }
          if (state.currentTechnician && state.currentTechnician.id === updated.id) {
            state.currentTechnician = { ...state.currentTechnician, ...updated };
          }
        }
      });
  },
});

export const { clearCurrentTechnician, clearSelectedWorkOrder } = superTechnicianSlice.actions;
export default superTechnicianSlice.reducer;

export const selectCentralTechnicians = (state) => state.superTechnician.centralTechnicians;
export const selectCurrentTechnician = (state) => state.superTechnician.currentTechnician;
export const selectCentralTechniciansLoading = (state) => state.superTechnician.technicianStatus === 'loading' || state.superTechnician.status === 'loading';
export const selectCentralTechniciansPagination = (state) => state.superTechnician.technicianPagination || state.superTechnician.pagination;
export const selectTechnicianPagination = (state) => state.superTechnician.technicianPagination;
export const selectTechnicianStatus = (state) => state.superTechnician.technicianStatus;

export const selectWorkOrders = (state) => state.superTechnician.workOrders;
export const selectWorkOrdersStatus = (state) => state.superTechnician.workOrderStatus || state.superTechnician.workOrdersStatus;
export const selectWorkOrderStatus = (state) => state.superTechnician.workOrderStatus;
export const selectWorkOrderPagination = (state) => state.superTechnician.workOrderPagination;
export const selectSelectedWorkOrder = (state) => state.superTechnician.selectedWorkOrder;
export const selectSelectedWorkOrderLoading = (state) => state.superTechnician.selectedWorkOrderLoading;
