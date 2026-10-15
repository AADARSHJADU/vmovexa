import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectAdminReports,
  fetchReportsThunk,
  generateReportThunk,
} from '../../store/slices/admin/reportSlice.js';

export const useAdminReport = () => {
  const dispatch = useAppDispatch();
  const reports = useAppSelector(selectAdminReports);

  const loadReports = useCallback((params) => dispatch(fetchReportsThunk(params)).unwrap(), [dispatch]);
  const generateReport = useCallback((data) => dispatch(generateReportThunk(data)).unwrap(), [dispatch]);

  return { reports, loadReports, generateReport };
};

export default useAdminReport;
