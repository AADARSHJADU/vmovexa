import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks.js';
import {
  selectSuperAdminKpis,
  selectAdminKpis,
  selectLiveSummary,
  selectSystemHealth,
  selectDashboardLoading,
  selectDashboardError,
  fetchSuperAdminKpisThunk,
  fetchAdminKpisThunk,
  fetchLiveSummaryThunk,
  fetchSystemHealthThunk,
  clearDashboardError,
} from '../store/slices/dashboardSlice.js';

export const useDashboard = () => {
  const dispatch = useAppDispatch();
  
  const superAdminKpis = useAppSelector(selectSuperAdminKpis);
  const adminKpis = useAppSelector(selectAdminKpis);
  const liveSummary = useAppSelector(selectLiveSummary);
  const systemHealth = useAppSelector(selectSystemHealth);
  const loading = useAppSelector(selectDashboardLoading);
  const error = useAppSelector(selectDashboardError);

  const loadSuperAdminKpis = useCallback(() => dispatch(fetchSuperAdminKpisThunk()).unwrap(), [dispatch]);
  const loadAdminKpis = useCallback((params) => dispatch(fetchAdminKpisThunk(params)).unwrap(), [dispatch]);
  const loadLiveSummary = useCallback(() => dispatch(fetchLiveSummaryThunk()).unwrap(), [dispatch]);
  const loadSystemHealth = useCallback(() => dispatch(fetchSystemHealthThunk()).unwrap(), [dispatch]);
  const clearError = useCallback(() => dispatch(clearDashboardError()), [dispatch]);

  return {
    superAdminKpis,
    adminKpis,
    liveSummary,
    systemHealth,
    loading,
    error,
    loadSuperAdminKpis,
    loadAdminKpis,
    loadLiveSummary,
    loadSystemHealth,
    clearError,
  };
};

export default useDashboard;
