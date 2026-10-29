import { createSlice } from '@reduxjs/toolkit';
import {
  fetchEmailTemplatesThunk,
  fetchEmailTemplateByIdThunk,
  updateEmailTemplateThunk,
  sendTestEmailThunk,
} from '../../thunks/superadmin/emailTemplate.thunks';

const initialState = {
  templates: [],
  selectedTemplate: null,
  loading: false,
  saving: false,
  testing: false,
  testResult: null,
  error: null,
};

const emailTemplateSlice = createSlice({
  name: 'emailTemplates',
  initialState,
  reducers: {
    selectTemplateById: (state, action) => {
      const idOrCode = action.payload;
      const found = state.templates.find((t) => t.id === idOrCode || t.code === idOrCode);
      if (found) {
        state.selectedTemplate = JSON.parse(JSON.stringify(found));
      }
    },
    updateLocalSelectedField: (state, action) => {
      if (state.selectedTemplate) {
        const { field, value } = action.payload;
        state.selectedTemplate[field] = value;
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
      // Fetch all templates
      .addCase(fetchEmailTemplatesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmailTemplatesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload || [];
        if (!state.selectedTemplate && state.templates.length > 0) {
          // Default to master_layout if present, else first template
          const master = state.templates.find((t) => t.code === 'master_layout');
          state.selectedTemplate = JSON.parse(JSON.stringify(master || state.templates[0]));
        } else if (state.selectedTemplate) {
          // Keep selectedTemplate in sync with updated list
          const updated = state.templates.find((t) => t.id === state.selectedTemplate.id);
          if (updated) {
            state.selectedTemplate = JSON.parse(JSON.stringify(updated));
          }
        }
      })
      .addCase(fetchEmailTemplatesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load email templates';
      })

      // Fetch single template
      .addCase(fetchEmailTemplateByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmailTemplateByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTemplate = action.payload;
      })
      .addCase(fetchEmailTemplateByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch email template';
      })

      // Update template
      .addCase(updateEmailTemplateThunk.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateEmailTemplateThunk.fulfilled, (state, action) => {
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
      .addCase(updateEmailTemplateThunk.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload?.message || 'Failed to update email template';
      })

      // Send test email
      .addCase(sendTestEmailThunk.pending, (state) => {
        state.testing = true;
        state.testResult = null;
        state.error = null;
      })
      .addCase(sendTestEmailThunk.fulfilled, (state, action) => {
        state.testing = false;
        state.testResult = action.payload;
      })
      .addCase(sendTestEmailThunk.rejected, (state, action) => {
        state.testing = false;
        state.error = action.payload?.message || 'Failed to dispatch test email';
      });
  },
});

export const {
  selectTemplateById,
  updateLocalSelectedField,
  clearTestResult,
  clearError,
} = emailTemplateSlice.actions;

export const selectEmailTemplates = (state) => state.emailTemplates?.templates || [];
export const selectSelectedEmailTemplate = (state) => state.emailTemplates?.selectedTemplate;
export const selectEmailTemplatesLoading = (state) => state.emailTemplates?.loading;
export const selectEmailTemplatesSaving = (state) => state.emailTemplates?.saving;
export const selectEmailTemplatesTesting = (state) => state.emailTemplates?.testing;
export const selectEmailTemplatesTestResult = (state) => state.emailTemplates?.testResult;
export const selectEmailTemplatesError = (state) => state.emailTemplates?.error;

export default emailTemplateSlice.reducer;
