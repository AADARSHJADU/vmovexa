import { createAsyncThunk } from '@reduxjs/toolkit';
import { superTechnicianService } from '../../../api/services/superadmin/technician.service.js';

export const fetchCentralTechniciansThunk = createAsyncThunk(
  'superadmin/technician/fetchCentralTechnicians',
  async (params, { rejectWithValue }) => {
    try { return await superTechnicianService.getCentralTechnicians(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchWorkOrdersThunk = createAsyncThunk(
  'superadmin/technician/fetchWorkOrders',
  async (params, { rejectWithValue }) => {
    try { return await superTechnicianService.getWorkOrders(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const assignTechnicianWorkOrderThunk = createAsyncThunk(
  'superadmin/technician/assignWorkOrder',
  async (payload, { rejectWithValue }) => {
    try {
      if (payload?.id && payload?.data) {
        return await superTechnicianService.assignTechnician(payload.id, payload.data);
      }
      return await superTechnicianService.dispatchWorkOrder(payload);
    }
    catch (err) { return rejectWithValue(err); }
  }
);

export const dispatchWorkOrderThunk = createAsyncThunk(
  'superadmin/technician/dispatchWorkOrder',
  async (payload, { rejectWithValue }) => {
    try {
      return await superTechnicianService.dispatchWorkOrder(payload);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchWorkOrderDetailThunk = createAsyncThunk(
  'superadmin/technician/fetchWorkOrderDetail',
  async (id, { rejectWithValue }) => {
    try { return await superTechnicianService.getWorkOrder(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const approveWorkOrderThunk = createAsyncThunk(
  'superadmin/technician/approveWorkOrder',
  async (id, { rejectWithValue }) => {
    try { return await superTechnicianService.approveWorkOrder(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const rejectWorkOrderThunk = createAsyncThunk(
  'superadmin/technician/rejectWorkOrder',
  async ({ id, reason }, { rejectWithValue }) => {
    try { return await superTechnicianService.rejectWorkOrder(id, reason); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateWorkOrderStatusThunk = createAsyncThunk(
  'superadmin/technician/updateWorkOrderStatus',
  async ({ id, status, resolutionNotes }, { rejectWithValue }) => {
    try { return await superTechnicianService.updateWorkOrderStatus(id, status, resolutionNotes); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const registerTechnicianThunk = createAsyncThunk(
  'superadmin/technician/registerTechnician',
  async (data, { rejectWithValue }) => {
    try { return await superTechnicianService.registerTechnician(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchTechnicianThunk = createAsyncThunk(
  'superadmin/technician/fetchTechnician',
  async (id, { rejectWithValue }) => {
    try { return await superTechnicianService.getTechnician(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateTechnicianThunk = createAsyncThunk(
  'superadmin/technician/updateTechnician',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await superTechnicianService.updateTechnician(id, data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const deleteTechnicianThunk = createAsyncThunk(
  'superadmin/technician/deleteTechnician',
  async (id, { rejectWithValue }) => {
    try { return await superTechnicianService.deleteTechnician(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateTechnicianStatusThunk = createAsyncThunk(
  'superadmin/technician/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try { return await superTechnicianService.updateStatus(id, status); }
    catch (err) { return rejectWithValue(err); }
  }
);


