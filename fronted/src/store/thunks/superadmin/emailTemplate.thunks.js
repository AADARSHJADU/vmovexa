import { createAsyncThunk } from '@reduxjs/toolkit';
import { emailTemplateService } from '../../../api/services/superadmin/emailTemplate.service';
import { normalizeError } from '../../../utils/apiResponse';

export const fetchEmailTemplatesThunk = createAsyncThunk(
  'emailTemplates/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await emailTemplateService.fetchTemplates();
      return res.data;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const fetchEmailTemplateByIdThunk = createAsyncThunk(
  'emailTemplates/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await emailTemplateService.getTemplateById(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const updateEmailTemplateThunk = createAsyncThunk(
  'emailTemplates/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await emailTemplateService.updateTemplate(id, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const sendTestEmailThunk = createAsyncThunk(
  'emailTemplates/sendTest',
  async ({ id, recipient, variables }, { rejectWithValue }) => {
    try {
      const res = await emailTemplateService.sendTestEmail(id, { recipient, variables });
      return res.data;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);
