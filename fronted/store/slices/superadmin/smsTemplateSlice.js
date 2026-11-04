import { createSlice } from '@reduxjs/toolkit';
import {
  fetchSmsTemplatesThunk,
  fetchSmsTemplateByIdThunk,
  updateSmsTemplateThunk,
  sendTestSmsThunk,
} from '../../thunks/superadmin/smsTemplate.thunks';

const initialState = {
  templates: [],
  selectedTemplate: null,
  loading: false,
  saving: false,
  testing: false,
  testResult: null,
  error: null,
};

const smsTemplateSlice = createSlice({
  name: 'smsTemplates',
  initialState,
  reducers: {
    selectSmsTemplateById: (state, action) => {
      const idOrCode = action.payload;
      const found = state.templates.find((t) => t.id === idOrCode || t.code === idOrCode);
      if (found) {
        state.selectedTemplate = JSON.parse(JSON.stringify(found));
      }
    },
    updateLocalSelectedSmsField: (state, action) => {
      if (state.selectedTemplate) {
        const { field, value } = action.payload;
        state.selectedTemplate[field] = value;
      }
    },
    clearSmsTestResult: (state) => {
      state.testResult = null;
    },
    clearSmsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSmsTemplatesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSmsTemplatesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload || [];
        if (!state.selectedTemplate && state.templates.length > 0) {
          const generic = state.templates.find((t) => t.code === 'generic_notification');
          state.selectedTemplate = JSON.parse(JSON.stringify(generic || state.templates[0]));
        } else if (state.selectedTemplate) {
          const updated = state.templates.find((t) => t.id === state.selectedTemplate.id);
          if (updated) {
            state.selectedTemplate = JSON.parse(JSON.stringify(updated));
          }
        }
      })
      .addCase(fetchSmsTemplatesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load SMS templates';
      })

      .addCase(fetchSmsTemplateByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSmsTemplateByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTemplate = action.payload;
      })
      .addCase(fetchSmsTemplateByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch SMS template';
      })

      .addCase(updateSmsTemplateThunk.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateSmsTemplateThunk.fulfilled, (state, action) => {
        state.saving = false;
        const updated = action.payload;
        if (updated) {
          const idx = state.templates.findIndex((t) => t.id === updated.id);
          if (idx !== -1) {
            state.templates[idx] = updated;
          }
          state.selectedTemplate = JSON.parse(JSON.stringify(updated));
        }
      })
      .addCase(updateSmsTemplateThunk.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload?.message || 'Failed to update SMS template';
      })

      .addCase(sendTestSmsThunk.pending, (state) => {
        state.testing = true;
        state.testResult = null;
        state.error = null;
      })
      .addCase(sendTestSmsThunk.fulfilled, (state, action) => {
        state.testing = false;
        state.testResult = action.payload;
      })
      .addCase(sendTestSmsThunk.rejected, (state, action) => {
        state.testing = false;
        state.error = action.payload?.message || 'Failed to dispatch test SMS';
      });
  },
});

export const {
  selectSmsTemplateById,
  updateLocalSelectedSmsField,
  clearSmsTestResult,
  clearSmsError,
} = smsTemplateSlice.actions;

export const selectSmsTemplates = (state) => state.smsTemplates?.templates || [];
export const selectSelectedSmsTemplate = (state) => state.smsTemplates?.selectedTemplate;
export const selectSmsTemplatesLoading = (state) => state.smsTemplates?.loading;
export const selectSmsTemplatesSaving = (state) => state.smsTemplates?.saving;
export const selectSmsTemplatesTesting = (state) => state.smsTemplates?.testing;
export const selectSmsTemplatesTestResult = (state) => state.smsTemplates?.testResult;
export const selectSmsTemplatesError = (state) => state.smsTemplates?.error;

export default smsTemplateSlice.reducer;
