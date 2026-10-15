import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectSuperActivityLogs,
  selectSuperActivityPagination,
  selectSuperActivityCategories,
  fetchActivityLogsThunk,
  fetchLogCategoriesThunk,
} from '../../store/slices/superadmin/activitySlice.js';

export const useSuperActivity = () => {
  const dispatch = useAppDispatch();
  const activityLogs = useAppSelector(selectSuperActivityLogs);
  const pagination = useAppSelector(selectSuperActivityPagination);
  const categories = useAppSelector(selectSuperActivityCategories);

  const loadActivityLogs = useCallback((params) => dispatch(fetchActivityLogsThunk(params)).unwrap(), [dispatch]);
  const loadCategories = useCallback(() => dispatch(fetchLogCategoriesThunk()).unwrap(), [dispatch]);

  return {
    activityLogs,
    pagination,
    categories,
    loadActivityLogs,
    loadCategories,
  };
};

export default useSuperActivity;
