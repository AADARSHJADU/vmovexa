import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import { selectAdminRevenueSummary, fetchAdminRevenueSummaryThunk } from '../../store/slices/admin/revenueSlice.js';

export const useAdminRevenue = () => {
  const dispatch = useAppDispatch();
  const revenueSummary = useAppSelector(selectAdminRevenueSummary);

  const loadRevenueSummary = useCallback((params) => dispatch(fetchAdminRevenueSummaryThunk(params)).unwrap(), [dispatch]);

  return { revenueSummary, loadRevenueSummary };
};

export default useAdminRevenue;
