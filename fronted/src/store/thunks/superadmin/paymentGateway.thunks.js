import { createAsyncThunk } from '@reduxjs/toolkit';
import { paymentGatewayService } from '../../../api/services/superadmin/paymentGateway.service';
import { normalizeError } from '../../../utils/apiResponse';

export const fetchPaymentGatewaysThunk = createAsyncThunk(
  'paymentGateways/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await paymentGatewayService.getGateways();
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.gateways)
        ? res.gateways
        : [];
      return list;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const updatePaymentGatewayThunk = createAsyncThunk(
  'paymentGateways/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await paymentGatewayService.updateGateway(id, data);
      return res.data || res;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const testPaymentGatewayThunk = createAsyncThunk(
  'paymentGateways/testConnection',
  async ({ id, data = {} }, { rejectWithValue }) => {
    try {
      const res = await paymentGatewayService.testGatewayConnection(id, data);
      return res.data || res;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const simulateOrderThunk = createAsyncThunk(
  'paymentGateways/simulateOrder',
  async ({ id, data = {} }, { rejectWithValue }) => {
    try {
      const res = await paymentGatewayService.simulateTestOrder(id, data);
      return res.data || res;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

