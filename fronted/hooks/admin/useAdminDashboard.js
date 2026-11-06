import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectAdminKpisData,
  selectAdminDashboardLoading,
  fetchAdminKpisThunk,
} from '../../store/slices/admin/dashboardSlice.js';

export const useAdminDashboard = () => {
  const dispatch = useAppDispatch();
  const kpis = useAppSelector(selectAdminKpisData);
  const loading = useAppSelector(selectAdminDashboardLoading);

  const loadKpis = useCallback((params) => dispatch(fetchAdminKpisThunk(params)).unwrap(), [dispatch]);

  return { kpis, loading, loadKpis };
};

export default useAdminDashboard;
