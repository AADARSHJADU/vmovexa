import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchEmailTemplatesThunk,
  fetchEmailTemplateByIdThunk,
  updateEmailTemplateThunk,
  sendTestEmailThunk,
} from '../../store/thunks/superadmin/emailTemplate.thunks';
import {
  selectEmailTemplates,
  selectSelectedEmailTemplate,
  selectEmailTemplatesLoading,
  selectEmailTemplatesSaving,
  selectEmailTemplatesTesting,
  selectEmailTemplatesTestResult,
  selectEmailTemplatesError,
  selectTemplateById,
  updateLocalSelectedField,
  clearTestResult,
  clearError,
} from '../../store/slices/superadmin/emailTemplateSlice';

export function useSuperEmailTemplates() {
  const dispatch = useAppDispatch();

  const templates = useAppSelector(selectEmailTemplates);
  const selectedTemplate = useAppSelector(selectSelectedEmailTemplate);
  const loading = useAppSelector(selectEmailTemplatesLoading);
  const saving = useAppSelector(selectEmailTemplatesSaving);
  const testing = useAppSelector(selectEmailTemplatesTesting);
  const testResult = useAppSelector(selectEmailTemplatesTestResult);
  const error = useAppSelector(selectEmailTemplatesError);

  const fetchTemplates = useCallback(
    () => dispatch(fetchEmailTemplatesThunk()),
    [dispatch]
  );

  const fetchTemplateById = useCallback(
    (id) => dispatch(fetchEmailTemplateByIdThunk(id)),
    [dispatch]
  );

  const updateTemplate = useCallback(
    (id, data) => dispatch(updateEmailTemplateThunk({ id, data })),
    [dispatch]
  );

  const sendTestEmail = useCallback(
    (id, payload) => dispatch(sendTestEmailThunk({ id, ...payload })),
    [dispatch]
  );

  const setSelectedTemplate = useCallback(
    (idOrCode) => dispatch(selectTemplateById(idOrCode)),
    [dispatch]
  );

  const setLocalField = useCallback(
    (field, value) => dispatch(updateLocalSelectedField({ field, value })),
    [dispatch]
  );

  const resetTest = useCallback(
    () => dispatch(clearTestResult()),
    [dispatch]
  );

  const resetError = useCallback(
    () => dispatch(clearError()),
    [dispatch]
  );

  return {
    templates,
    selectedTemplate,
    loading,
    saving,
    testing,
    testResult,
    error,
    fetchTemplates,
    fetchTemplateById,
    updateTemplate,
    sendTestEmail,
    setSelectedTemplate,
    setLocalField,
    resetTest,
    resetError,
  };
}

export default useSuperEmailTemplates;
