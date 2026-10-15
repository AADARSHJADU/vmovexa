import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchSmsTemplatesThunk,
  fetchSmsTemplateByIdThunk,
  updateSmsTemplateThunk,
  sendTestSmsThunk,
} from '../../store/thunks/superadmin/smsTemplate.thunks';
import {
  selectSmsTemplates,
  selectSelectedSmsTemplate,
  selectSmsTemplatesLoading,
  selectSmsTemplatesSaving,
  selectSmsTemplatesTesting,
  selectSmsTemplatesTestResult,
  selectSmsTemplatesError,
  selectSmsTemplateById,
  updateLocalSelectedSmsField,
  clearSmsTestResult,
  clearSmsError,
} from '../../store/slices/superadmin/smsTemplateSlice';

export function useSuperSmsTemplates() {
  const dispatch = useAppDispatch();

  const templates = useAppSelector(selectSmsTemplates);
  const selectedTemplate = useAppSelector(selectSelectedSmsTemplate);
  const loading = useAppSelector(selectSmsTemplatesLoading);
  const saving = useAppSelector(selectSmsTemplatesSaving);
  const testing = useAppSelector(selectSmsTemplatesTesting);
  const testResult = useAppSelector(selectSmsTemplatesTestResult);
  const error = useAppSelector(selectSmsTemplatesError);

  const fetchTemplates = useCallback(() => dispatch(fetchSmsTemplatesThunk()), [dispatch]);
  const fetchTemplateById = useCallback((id) => dispatch(fetchSmsTemplateByIdThunk(id)), [dispatch]);
  const updateTemplate = useCallback((id, data) => dispatch(updateSmsTemplateThunk({ id, data })), [dispatch]);
  const sendTestSms = useCallback((id, payload) => dispatch(sendTestSmsThunk({ id, ...payload })), [dispatch]);
  const setSelectedTemplate = useCallback((idOrCode) => dispatch(selectSmsTemplateById(idOrCode)), [dispatch]);
  const setLocalField = useCallback((field, value) => dispatch(updateLocalSelectedSmsField({ field, value })), [dispatch]);
  const resetTest = useCallback(() => dispatch(clearSmsTestResult()), [dispatch]);
  const resetError = useCallback(() => dispatch(clearSmsError()), [dispatch]);

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
    sendTestSms,
    setSelectedTemplate,
    setLocalField,
    resetTest,
    resetError,
  };
}

export default useSuperSmsTemplates;
