import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchWhatsappConfigThunk,
  updateWhatsappConfigThunk,
  sendTestWhatsappThunk,
} from '../store/thunks/whatsappNotification.thunks';
import {
  selectWhatsappConfig,
  selectWhatsappLoading,
  selectWhatsappSaving,
  selectWhatsappTesting,
  selectWhatsappTestResult,
  selectWhatsappError,
  clearTestResult,
  clearError,
} from '../store/slices/whatsappNotificationSlice';

export function useWhatsappNotification() {
  const dispatch = useAppDispatch();

  const config = useAppSelector(selectWhatsappConfig);
  const loading = useAppSelector(selectWhatsappLoading);
  const saving = useAppSelector(selectWhatsappSaving);
  const testing = useAppSelector(selectWhatsappTesting);
  const testResult = useAppSelector(selectWhatsappTestResult);
  const error = useAppSelector(selectWhatsappError);

  const fetchConfig = useCallback(
    () => dispatch(fetchWhatsappConfigThunk()),
    [dispatch]
  );

  const updateConfig = useCallback(
    (payload) => dispatch(updateWhatsappConfigThunk(payload)),
    [dispatch]
  );

  const sendTestMessage = useCallback(
    (payload) => dispatch(sendTestWhatsappThunk(payload)),
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
    config,
    loading,
    saving,
    testing,
    testResult,
    error,
    fetchConfig,
    updateConfig,
    sendTestMessage,
    resetTest,
    resetError,
  };
}

export default useWhatsappNotification;
