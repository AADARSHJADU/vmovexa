import { createSlice } from '@reduxjs/toolkit';
import {
  fetchPaymentGatewaysThunk,
  updatePaymentGatewayThunk,
  testPaymentGatewayThunk,
  simulateOrderThunk,
} from '../../thunks/superadmin/paymentGateway.thunks';

const initialState = {
  gateways: [],
  selectedGateway: null,
  loading: false,
  saving: false,
  testing: false,
  testResult: null,
  simulating: false,
  simulationResult: null,
  error: null,
};

const paymentGatewaySlice = createSlice({
  name: 'paymentGateways',
  initialState,
  reducers: {
    selectGatewayByProvider: (state, action) => {
      const providerOrId = action.payload;
      const found = state.gateways.find(
        (g) => g.provider_type === providerOrId || g.id === providerOrId || g.code === providerOrId
      );
      if (found) {
        state.selectedGateway = JSON.parse(JSON.stringify(found));
        state.testResult = null;
      }
    },
    updateLocalSelectedField: (state, action) => {
      if (state.selectedGateway) {
        const { field, value } = action.payload;
        state.selectedGateway[field] = value;
      }
    },
    clearTestResult: (state) => {
      state.testResult = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all gateways
      .addCase(fetchPaymentGatewaysThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentGatewaysThunk.fulfilled, (state, action) => {
        state.loading = false;
        const list = Array.isArray(action.payload)
          ? action.payload
          : Array.isArray(action.payload?.data)
          ? action.payload.data
          : Array.isArray(action.payload?.gateways)
          ? action.payload.gateways
          : [];
        state.gateways = list;
        if (!state.selectedGateway && list.length > 0) {
          // Default to razorpay or first gateway
          const defaultGw = list.find((g) => g.is_default) || list[0];
          state.selectedGateway = JSON.parse(JSON.stringify(defaultGw));
        } else if (state.selectedGateway) {
          const updated = list.find((g) => g.id === state.selectedGateway.id);
          if (updated) {
            state.selectedGateway = JSON.parse(JSON.stringify(updated));
          }
        }
      })
      .addCase(fetchPaymentGatewaysThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load payment gateways';
      })

      // Update gateway
      .addCase(updatePaymentGatewayThunk.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updatePaymentGatewayThunk.fulfilled, (state, action) => {
        state.saving = false;
        const updated = action.payload;
        if (updated) {
          const idx = state.gateways.findIndex((g) => g.id === updated.id);
          if (idx !== -1) {
            state.gateways[idx] = updated;
          }
          state.selectedGateway = JSON.parse(JSON.stringify(updated));
        }
      })
      .addCase(updatePaymentGatewayThunk.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload?.message || 'Failed to update payment gateway';
      })

      // Test gateway connection
      .addCase(testPaymentGatewayThunk.pending, (state) => {
        state.testing = true;
        state.testResult = null;
        state.error = null;
      })
      .addCase(testPaymentGatewayThunk.fulfilled, (state, action) => {
        state.testing = false;
        state.testResult = action.payload;
      })
      .addCase(testPaymentGatewayThunk.rejected, (state, action) => {
        state.testing = false;
        state.testResult = { ok: false, error: action.payload?.message || 'Connection test failed' };
        state.error = action.payload?.message || 'Connection test failed';
      })

      // Simulate test order
      .addCase(simulateOrderThunk.pending, (state) => {
        state.simulating = true;
        state.simulationResult = null;
        state.error = null;
      })
      .addCase(simulateOrderThunk.fulfilled, (state, action) => {
        state.simulating = false;
        state.simulationResult = action.payload;
      })
      .addCase(simulateOrderThunk.rejected, (state, action) => {
        state.simulating = false;
        state.simulationResult = { ok: false, error: action.payload?.message || 'Order simulation failed' };
        state.error = action.payload?.message || 'Order simulation failed';
      });
  },
});

export const {
  selectGatewayByProvider,
  updateLocalSelectedField,
  clearTestResult,
  clearSimulationResult,
  clearError,
} = paymentGatewaySlice.actions;

export const selectPaymentGateways = (state) => (Array.isArray(state.paymentGateways?.gateways) ? state.paymentGateways.gateways : []);
export const selectSelectedPaymentGateway = (state) => state.paymentGateways?.selectedGateway;
export const selectPaymentGatewaysLoading = (state) => state.paymentGateways?.loading;
export const selectPaymentGatewaysSaving = (state) => state.paymentGateways?.saving;
export const selectPaymentGatewaysTesting = (state) => state.paymentGateways?.testing;
export const selectPaymentGatewaysTestResult = (state) => state.paymentGateways?.testResult;
export const selectPaymentGatewaysSimulating = (state) => state.paymentGateways?.simulating;
export const selectPaymentGatewaysSimulationResult = (state) => state.paymentGateways?.simulationResult;
export const selectPaymentGatewaysError = (state) => state.paymentGateways?.error;

export default paymentGatewaySlice.reducer;
