import { createAsyncThunk } from '@reduxjs/toolkit';
import { adminTechnicianRequestService } from '../../../api/services/admin/technicianRequest.service.js';

export const fetchWorkOrdersThunk = createAsyncThunk(
  'admin/technicianRequest/fetchWorkOrders',
  async (params, { rejectWithValue }) => {
    try { return await adminTechnicianRequestService.getWorkOrders(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchWorkOrderDetailThunk = createAsyncThunk(
  'admin/technicianRequest/fetchWorkOrderDetail',
  async (id, { rejectWithValue }) => {
    try { return await adminTechnicianRequestService.getWorkOrder(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const createWorkOrderThunk = createAsyncThunk(
  'admin/technicianRequest/createWorkOrder',
  async (data, { rejectWithValue }) => {
    try { return await adminTechnicianRequestService.createWorkOrder(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateWorkOrderThunk = createAsyncThunk(
  'admin/technicianRequest/updateWorkOrder',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await adminTechnicianRequestService.updateWorkOrder(id, data); }
    catch (err) { return rejectWithValue(err); }
  }
);
