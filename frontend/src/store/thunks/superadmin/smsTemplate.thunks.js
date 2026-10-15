import { createAsyncThunk } from '@reduxjs/toolkit';
import { smsTemplateService } from '../../../api/services/superadmin/smsTemplate.service';
import { normalizeError } from '../../../utils/apiResponse';

export const fetchSmsTemplatesThunk = createAsyncThunk(
  'smsTemplates/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await smsTemplateService.fetchTemplates();
      return res.data;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const fetchSmsTemplateByIdThunk = createAsyncThunk(
  'smsTemplates/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await smsTemplateService.getTemplateById(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const updateSmsTemplateThunk = createAsyncThunk(
  'smsTemplates/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await smsTemplateService.updateTemplate(id, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const sendTestSmsThunk = createAsyncThunk(
  'smsTemplates/sendTest',
  async ({ id, recipient, variables }, { rejectWithValue }) => {
    try {
      const res = await smsTemplateService.sendTestSms(id, { recipient, variables });
      return res.data;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);
