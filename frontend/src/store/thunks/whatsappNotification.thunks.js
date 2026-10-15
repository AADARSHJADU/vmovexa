import { createAsyncThunk } from '@reduxjs/toolkit';
import { whatsappNotificationService } from '../../api/services/whatsappNotification.service';
import { normalizeError } from '../../utils/apiResponse';

export const fetchWhatsappConfigThunk = createAsyncThunk(
  'whatsappNotification/fetchConfig',
  async (_, { rejectWithValue }) => {
    try {
      const data = await whatsappNotificationService.getWhatsappConfig();
      return data;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const updateWhatsappConfigThunk = createAsyncThunk(
  'whatsappNotification/updateConfig',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await whatsappNotificationService.updateWhatsappConfig(payload);
      return data;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const sendTestWhatsappThunk = createAsyncThunk(
  'whatsappNotification/sendTest',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await whatsappNotificationService.sendTestWhatsapp(payload);
      return data;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);
