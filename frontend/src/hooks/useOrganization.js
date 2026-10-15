import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks.js';
import {
  selectOrganizations,
  selectCurrentOrganization,
  selectCurrentFeatures,
  selectOrganizationLoading,
  selectOrganizationError,
  selectOrganizationActionStatus,
  selectOrganizationActionError,
  fetchOrganizationsThunk,
  fetchOrganizationThunk,
  createOrganizationThunk,
  updateOrganizationThunk,
  updateOrganizationStatusThunk,
  fetchOrganizationFeaturesThunk,
  updateOrganizationFeaturesThunk,
  clearOrganizationError,
  clearCurrentOrganization,
} from '../store/slices/organizationSlice.js';

export const useOrganization = () => {
  const dispatch = useAppDispatch();
  
  const organizations = useAppSelector(selectOrganizations);
  const currentOrganization = useAppSelector(selectCurrentOrganization);
  const currentFeatures = useAppSelector(selectCurrentFeatures);
  const loading = useAppSelector(selectOrganizationLoading);
  const error = useAppSelector(selectOrganizationError);
  const actionStatus = useAppSelector(selectOrganizationActionStatus);
  const actionError = useAppSelector(selectOrganizationActionError);

  const loadOrganizations = useCallback((params) => dispatch(fetchOrganizationsThunk(params)).unwrap(), [dispatch]);
  const loadOrganization = useCallback((id) => dispatch(fetchOrganizationThunk(id)).unwrap(), [dispatch]);
  const createOrganization = useCallback((data) => dispatch(createOrganizationThunk(data)).unwrap(), [dispatch]);
  const updateOrganization = useCallback((id, data) => dispatch(updateOrganizationThunk({ id, data })).unwrap(), [dispatch]);
  const updateStatus = useCallback((id, status) => dispatch(updateOrganizationStatusThunk({ id, status })).unwrap(), [dispatch]);
  const loadFeatures = useCallback((id) => dispatch(fetchOrganizationFeaturesThunk(id)).unwrap(), [dispatch]);
  const updateFeatures = useCallback((id, features) => dispatch(updateOrganizationFeaturesThunk({ id, features })).unwrap(), [dispatch]);
  
  const clearError = useCallback(() => dispatch(clearOrganizationError()), [dispatch]);
  const clearCurrent = useCallback(() => dispatch(clearCurrentOrganization()), [dispatch]);

  return {
    organizations,
    currentOrganization,
    currentFeatures,
    loading,
    error,
    actionStatus,
    actionError,
    loadOrganizations,
    loadOrganization,
    createOrganization,
    updateOrganization,
    updateStatus,
    loadFeatures,
    updateFeatures,
    clearError,
    clearCurrent,
  };
};

export default useOrganization;
