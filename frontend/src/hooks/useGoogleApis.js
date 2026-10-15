import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchGoogleApiSettingsThunk,
  updateGoogleApiSettingsThunk,
  testGoogleApisThunk,
} from '../store/thunks/googleApis.thunks';
import {
  selectGoogleApiSettings,
  selectGoogleApiLoading,
  selectGoogleApiSaving,
  selectGoogleApiTesting,
  selectGoogleApiTestResults,
  selectGoogleApiError,
  setLocalField,
  resetTestResults,
} from '../store/slices/googleApisSlice';

export const useGoogleApis = () => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectGoogleApiSettings);
  const loading = useAppSelector(selectGoogleApiLoading);
  const saving = useAppSelector(selectGoogleApiSaving);
  const testing = useAppSelector(selectGoogleApiTesting);
  const testResults = useAppSelector(selectGoogleApiTestResults);
  const error = useAppSelector(selectGoogleApiError);

  const fetchSettings = useCallback(() => {
    return dispatch(fetchGoogleApiSettingsThunk());
  }, [dispatch]);

  const updateSettings = useCallback(
    (payload) => {
      return dispatch(updateGoogleApiSettingsThunk(payload));
    },
    [dispatch]
  );

  const testApis = useCallback(
    (apiKey) => {
      return dispatch(testGoogleApisThunk(apiKey));
    },
    [dispatch]
  );

  const updateLocalField = useCallback(
    (field, value) => {
      dispatch(setLocalField({ field, value }));
    },
    [dispatch]
  );

  const clearTestResults = useCallback(() => {
    dispatch(resetTestResults());
  }, [dispatch]);

  return {
    settings,
    loading,
    saving,
    testing,
    testResults,
    error,
    fetchSettings,
    updateSettings,
    testApis,
    updateLocalField,
    clearTestResults,
  };
};

export default useGoogleApis;
