import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectSharedReports,
  selectSharedExports,
  fetchReportsThunk,
  generateReportThunk,
  fetchExportsThunk,
  createExportThunk,
} from '../../store/slices/shared/reportSlice.js';

/** Shared reports + exports hook — used by role Reports/Analytics pages and export buttons. */
export const useReports = () => {
  const dispatch = useAppDispatch();
  const reports = useAppSelector(selectSharedReports);
  const exports = useAppSelector(selectSharedExports);

  const loadReports = useCallback((params) => dispatch(fetchReportsThunk(params)).unwrap(), [dispatch]);
  const generateReport = useCallback((reportType, params) => dispatch(generateReportThunk({ reportType, params })).unwrap(), [dispatch]);
  const loadExports = useCallback((params) => dispatch(fetchExportsThunk(params)).unwrap(), [dispatch]);
  const createExport = useCallback((data) => dispatch(createExportThunk(data)).unwrap(), [dispatch]);

  return { reports, exports, loadReports, generateReport, loadExports, createExport };
};

export default useReports;
