import { createSlice } from '@reduxjs/toolkit';
import {
  fetchTechStatsThunk,
  fetchMyWorkOrdersThunk,
  fetchWorkOrderDetailThunk,
  setWorkOrderStatusThunk,
  fetchEdgeDevicesThunk,
  registerEdgeDeviceThunk,
  updateEdgeDeviceThunk,
  deleteEdgeDeviceThunk,
  toggleEdgeDeviceActiveThunk,
  pushConfigThunk,
  fetchEdgeConfigThunk,
  fetchEdgeTelemetryThunk,
  factoryResetThunk,
  rebootDeviceThunk,
  fetchConnectivityTestsThunk,
  recordConnectivityTestThunk,
  registerGpsDeviceThunk,
  assignGpsThunk,
  fetchTechVehiclesThunk,
} from '../../thunks/technician/technician.thunks.js';

export {
  fetchTechStatsThunk,
  fetchMyWorkOrdersThunk,
  fetchWorkOrderDetailThunk,
  setWorkOrderStatusThunk,
  fetchEdgeDevicesThunk,
  registerEdgeDeviceThunk,
  updateEdgeDeviceThunk,
  deleteEdgeDeviceThunk,
  toggleEdgeDeviceActiveThunk,
  pushConfigThunk,
  fetchEdgeConfigThunk,
  fetchEdgeTelemetryThunk,
  factoryResetThunk,
  rebootDeviceThunk,
  fetchConnectivityTestsThunk,
  recordConnectivityTestThunk,
  registerGpsDeviceThunk,
  assignGpsThunk,
  fetchTechVehiclesThunk,
};

const initialState = {
  stats: null,
  workOrders: [],
  workOrdersPagination: null,
  selectedWorkOrder: null,
  workOrderDetailLoading: false,
  actionLoading: false,
  devices: [],
  vehicles: [],
  connectivityTests: [],
  edgeConfig: null,
  edgeConfigMeta: null,
  edgeConfigLoading: false,
  telemetry: [],
  telemetryLoading: false,
  status: 'idle',
  error: null,
};

const technicianAppSlice = createSlice({
  name: 'technicianApp',
  initialState,
  reducers: {
    clearSelectedWorkOrder: (state) => {
      state.selectedWorkOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTechStatsThunk.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchMyWorkOrdersThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMyWorkOrdersThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload && Array.isArray(action.payload.rows)) {
          state.workOrders = action.payload.rows;
          state.workOrdersPagination = action.payload.meta;
        } else if (Array.isArray(action.payload)) {
          state.workOrders = action.payload;
          state.workOrdersPagination = action.payload.meta || null;
        } else {
          state.workOrders = [];
          state.workOrdersPagination = null;
        }
      })
      .addCase(fetchMyWorkOrdersThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchWorkOrderDetailThunk.pending, (state) => {
        state.workOrderDetailLoading = true;
      })
      .addCase(fetchWorkOrderDetailThunk.fulfilled, (state, action) => {
        state.workOrderDetailLoading = false;
        state.selectedWorkOrder = action.payload;
      })
      .addCase(fetchWorkOrderDetailThunk.rejected, (state, action) => {
        state.workOrderDetailLoading = false;
        state.error = action.payload;
      })
      .addCase(setWorkOrderStatusThunk.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(setWorkOrderStatusThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updated = action.payload;
        if (updated && updated.id) {
          const idx = state.workOrders.findIndex((w) => w.id === updated.id);
          if (idx !== -1) {
            state.workOrders[idx] = { ...state.workOrders[idx], ...updated };
          }
          if (state.selectedWorkOrder && state.selectedWorkOrder.id === updated.id) {
            state.selectedWorkOrder = { ...state.selectedWorkOrder, ...updated };
          }
        }
      })
      .addCase(setWorkOrderStatusThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchEdgeDevicesThunk.fulfilled, (state, action) => {
        state.devices = Array.isArray(action.payload)
          ? action.payload
          : (action.payload?.rows || []);
      })
      .addCase(fetchTechVehiclesThunk.fulfilled, (state, action) => {
        state.vehicles = Array.isArray(action.payload)
          ? action.payload
          : (action.payload?.rows || []);
      })
      .addCase(fetchConnectivityTestsThunk.fulfilled, (state, action) => {
        state.connectivityTests = Array.isArray(action.payload)
          ? action.payload
          : (action.payload?.rows || []);
      })
      .addCase(recordConnectivityTestThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.connectivityTests = [action.payload, ...state.connectivityTests];
        }
      })
      .addCase(registerEdgeDeviceThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.devices = [action.payload, ...state.devices];
        }
      })
      .addCase(fetchEdgeConfigThunk.pending, (state) => {
        state.edgeConfigLoading = true;
      })
      .addCase(fetchEdgeConfigThunk.fulfilled, (state, action) => {
        state.edgeConfigLoading = false;
        state.edgeConfig = action.payload?.config || null;
        state.edgeConfigMeta = action.payload
          ? {
              config_updated_at: action.payload.config_updated_at || null,
              box_id: action.payload.box_id || null,
              sim_network: action.payload.sim_network || null,
              status: action.payload.status || null,
            }
          : null;
      })
      .addCase(fetchEdgeConfigThunk.rejected, (state, action) => {
        state.edgeConfigLoading = false;
        state.error = action.payload;
      })
      .addCase(factoryResetThunk.fulfilled, (state) => {
        state.edgeConfig = null;
      })
      .addCase(fetchEdgeTelemetryThunk.pending, (state) => {
        state.telemetryLoading = true;
      })
      .addCase(fetchEdgeTelemetryThunk.fulfilled, (state, action) => {
        state.telemetryLoading = false;
        state.telemetry = Array.isArray(action.payload)
          ? action.payload
          : (action.payload?.rows || []);
      })
      .addCase(fetchEdgeTelemetryThunk.rejected, (state, action) => {
        state.telemetryLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedWorkOrder } = technicianAppSlice.actions;
export default technicianAppSlice.reducer;

export const selectMyWorkOrders = (state) => state.technicianApp.workOrders;
export const selectWorkOrdersPagination = (state) => state.technicianApp.workOrdersPagination;
export const selectSelectedWorkOrder = (state) => state.technicianApp.selectedWorkOrder;
export const selectWorkOrderDetailLoading = (state) => state.technicianApp.workOrderDetailLoading;
export const selectWorkOrderActionLoading = (state) => state.technicianApp.actionLoading;
export const selectTechStatus = (state) => state.technicianApp.status;
export const selectTechDevices = (state) => {
  const d = state.technicianApp.devices;
  return Array.isArray(d) ? d : (d?.rows || []);
};
export const selectTechVehicles = (state) => {
  const v = state.technicianApp.vehicles;
  return Array.isArray(v) ? v : (v?.rows || []);
};
export const selectTechConnectivityTests = (state) => {
  const c = state.technicianApp.connectivityTests;
  return Array.isArray(c) ? c : (c?.rows || []);
};
export const selectTechEdgeConfig = (state) => state.technicianApp.edgeConfig;
export const selectTechEdgeConfigMeta = (state) => state.technicianApp.edgeConfigMeta;
export const selectTechEdgeConfigLoading = (state) => state.technicianApp.edgeConfigLoading;
export const selectTechTelemetry = (state) => {
  const t = state.technicianApp.telemetry;
  return Array.isArray(t) ? t : (t?.rows || []);
};
export const selectTechTelemetryLoading = (state) => state.technicianApp.telemetryLoading;
export const selectTechStats = (state) => state.technicianApp.stats;
