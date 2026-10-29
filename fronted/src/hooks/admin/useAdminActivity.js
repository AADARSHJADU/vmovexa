import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectAdminActivityLogs,
  selectAdminActivityCategories,
  selectAdminActivityFilters,
  selectAdminActivityPagination,
  selectAdminActivityLoading,
  fetchActivityLogsThunk,
  fetchCategoriesThunk,
  fetchFiltersThunk,
} from '../../store/slices/admin/activitySlice.js';

export const useAdminActivity = () => {
  const dispatch = useAppDispatch();
  const logs = useAppSelector(selectAdminActivityLogs);
  const categories = useAppSelector(selectAdminActivityCategories);
  const filters = useAppSelector(selectAdminActivityFilters);
  const pagination = useAppSelector(selectAdminActivityPagination);
  const loading = useAppSelector(selectAdminActivityLoading);

  const loadLogs = useCallback((params) => dispatch(fetchActivityLogsThunk(params)).unwrap(), [dispatch]);
  const loadCategories = useCallback(() => dispatch(fetchCategoriesThunk()).unwrap(), [dispatch]);
  const loadFilters = useCallback(() => dispatch(fetchFiltersThunk()).unwrap(), [dispatch]);

  return { logs, categories, filters, pagination, loading, loadLogs, loadCategories, loadFilters };
};

export default useAdminActivity;
