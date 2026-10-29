import { createAsyncThunk } from '@reduxjs/toolkit';
import { adminRouteService } from '../../../api/services/admin/route.service.js';

export const fetchRoutesThunk = createAsyncThunk(
  'admin/route/fetchRoutes',
  async (params, { rejectWithValue }) => {
    try {
      return await adminRouteService.getRoutes(params);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchRouteDetailsThunk = createAsyncThunk(
  'admin/route/fetchRouteDetails',
  async (id, { rejectWithValue }) => {
    try {
      return await adminRouteService.getRoute(id);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const createRouteThunk = createAsyncThunk(
  'admin/route/createRoute',
  async (data, { rejectWithValue }) => {
    try {
      return await adminRouteService.createRoute(data);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateRouteThunk = createAsyncThunk(
  'admin/route/updateRoute',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await adminRouteService.updateRoute(id, data);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const deleteRouteThunk = createAsyncThunk(
  'admin/route/deleteRoute',
  async (id, { rejectWithValue }) => {
    try {
      await adminRouteService.deleteRoute(id);
      return id;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const approveRouteThunk = createAsyncThunk(
  'admin/route/approveRoute',
  async (id, { rejectWithValue }) => {
    try {
      return await adminRouteService.approveRoute(id);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const rejectRouteThunk = createAsyncThunk(
  'admin/route/rejectRoute',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      return await adminRouteService.rejectRoute(id, reason);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const assignVehicleRouteThunk = createAsyncThunk(
  'admin/route/assignVehicle',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await adminRouteService.assignVehicle(id, data);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchRouteVehiclesThunk = createAsyncThunk(
  'admin/route/fetchRouteVehicles',
  async (id, { rejectWithValue }) => {
    try {
      return await adminRouteService.getRouteVehicles(id);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const approveAssignmentThunk = createAsyncThunk(
  'admin/route/approveAssignment',
  async (id, { rejectWithValue }) => {
    try {
      return await adminRouteService.approveAssignment(id);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const rejectAssignmentThunk = createAsyncThunk(
  'admin/route/rejectAssignment',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      return await adminRouteService.rejectAssignment(id, reason);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const deleteAssignmentThunk = createAsyncThunk(
  'admin/route/deleteAssignment',
  async (id, { rejectWithValue }) => {
    try {
      await adminRouteService.deleteAssignment(id);
      return id;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);
