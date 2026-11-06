import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectSuperAdminKpis,
  selectLiveSummary,
  selectSystemHealth,
  selectLiveTracking,
  selectTrackingRoutes,
  selectSuperDashboardLoading,
  fetchSuperAdminKpisThunk,
  fetchLiveSummaryThunk,
  fetchSystemHealthThunk,
  fetchLiveTrackingThunk,
  fetchTrackingRoutesThunk,
} from '../../store/slices/superadmin/dashboardSlice.js';

export const useDashboard = () => {
  const dispatch = useAppDispatch();
  
  const superAdminKpis = useAppSelector(selectSuperAdminKpis);
  const liveSummary = useAppSelector(selectLiveSummary);
  const systemHealth = useAppSelector(selectSystemHealth);
  const liveTracking = useAppSelector(selectLiveTracking);
  const trackingRoutes = useAppSelector(selectTrackingRoutes);
  const loading = useAppSelector(selectSuperDashboardLoading);

  const loadSuperAdminKpis = useCallback(() => dispatch(fetchSuperAdminKpisThunk()).unwrap(), [dispatch]);
  const loadLiveSummary = useCallback(() => dispatch(fetchLiveSummaryThunk()).unwrap(), [dispatch]);
  const loadSystemHealth = useCallback(() => dispatch(fetchSystemHealthThunk()).unwrap(), [dispatch]);
  const loadLiveTracking = useCallback((params) => dispatch(fetchLiveTrackingThunk(params)).unwrap(), [dispatch]);
  const loadTrackingRoutes = useCallback(() => dispatch(fetchTrackingRoutesThunk()).unwrap(), [dispatch]);

  return {
    superAdminKpis,
    liveSummary,
    systemHealth,
    liveTracking,
    trackingRoutes,
    loading,
    loadSuperAdminKpis,
    loadLiveSummary,
    loadSystemHealth,
    loadLiveTracking,
    loadTrackingRoutes,
  };
};

export default useDashboard;

