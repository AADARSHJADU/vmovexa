import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectSuperActivityLogs,
  selectSuperActivityPagination,
  selectSuperActivityCounts,
  selectSuperActivityCategories,
  selectSuperActivityLoading,
  fetchActivityLogsThunk,
  fetchLogCategoriesThunk,
  exportActivityLogsThunk,
} from '../../store/slices/superadmin/activitySlice.js';

export const useSuperActivity = () => {
  const dispatch = useAppDispatch();
  const activityLogs = useAppSelector(selectSuperActivityLogs);
  const pagination = useAppSelector(selectSuperActivityPagination);
  const counts = useAppSelector(selectSuperActivityCounts);
  const categories = useAppSelector(selectSuperActivityCategories);
  const loading = useAppSelector(selectSuperActivityLoading);

  const loadActivityLogs = useCallback((params) => dispatch(fetchActivityLogsThunk(params)).unwrap(), [dispatch]);
  const loadCategories = useCallback(() => dispatch(fetchLogCategoriesThunk()).unwrap(), [dispatch]);
  const exportActivityLogs = useCallback((params) => dispatch(exportActivityLogsThunk(params)).unwrap(), [dispatch]);

  return {
    activityLogs,
    pagination,
    counts,
    categories,
    loading,
    loadActivityLogs,
    loadCategories,
    exportActivityLogs,
  };
};

export default useSuperActivity;
