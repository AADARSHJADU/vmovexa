import { createAsyncThunk } from '@reduxjs/toolkit';
import { vehicleSlotService } from '../../../api/services/fleet/vehicleSlot.service.js';

export const fetchVehicleSlotsThunk = createAsyncThunk(
  'fleet/slots/fetchSlots',
  async (params, { rejectWithValue }) => {
    try {
      return await vehicleSlotService.getSlots(params);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchVehicleSlotByIdThunk = createAsyncThunk(
  'fleet/slots/fetchSlotById',
  async (id, { rejectWithValue }) => {
    try {
      return await vehicleSlotService.getSlot(id);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const createVehicleSlotThunk = createAsyncThunk(
  'fleet/slots/createSlot',
  async (data, { rejectWithValue }) => {
    try {
      return await vehicleSlotService.createSlot(data);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateVehicleSlotThunk = createAsyncThunk(
  'fleet/slots/updateSlot',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await vehicleSlotService.updateSlot(id, data);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const deleteVehicleSlotThunk = createAsyncThunk(
  'fleet/slots/deleteSlot',
  async (id, { rejectWithValue }) => {
    try {
      await vehicleSlotService.deleteSlot(id);
      return id;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const checkSlotConflictThunk = createAsyncThunk(
  'fleet/slots/checkConflict',
  async (payload, { rejectWithValue }) => {
    try {
      return await vehicleSlotService.checkConflict(payload);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchSlotsTimetableThunk = createAsyncThunk(
  'fleet/slots/fetchTimetable',
  async (params, { rejectWithValue }) => {
    try {
      return await vehicleSlotService.getTimetable(params);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);
