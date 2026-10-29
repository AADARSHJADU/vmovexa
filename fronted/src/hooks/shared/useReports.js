import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectSharedReports,
  selectSharedReportsPagination,
  selectSharedCurrentReport,
  selectSharedExports,
  fetchReportsThunk,
  fetchReportByIdThunk,
  generateReportThunk,
  deleteReportThunk,
  fetchExportsThunk,
  createExportThunk,
  clearCurrentReport,
} from '../../store/slices/shared/reportSlice.js';

/** Shared reports + exports hook — used by role Reports/Analytics pages and export buttons. */
export const useReports = () => {
  const dispatch = useAppDispatch();
  const reports = useAppSelector(selectSharedReports);
  const reportsPagination = useAppSelector(selectSharedReportsPagination);
  const currentReport = useAppSelector(selectSharedCurrentReport);
  const exports = useAppSelector(selectSharedExports);

  const loadReports = useCallback((params) => dispatch(fetchReportsThunk(params)).unwrap(), [dispatch]);
  const loadReportById = useCallback((id) => dispatch(fetchReportByIdThunk(id)).unwrap(), [dispatch]);
  const generateReport = useCallback((reportType, params) => dispatch(generateReportThunk({ reportType, params })).unwrap(), [dispatch]);
  const deleteReport = useCallback((id) => dispatch(deleteReportThunk(id)).unwrap(), [dispatch]);
  const loadExports = useCallback((params) => dispatch(fetchExportsThunk(params)).unwrap(), [dispatch]);
  const createExport = useCallback((data) => dispatch(createExportThunk(data)).unwrap(), [dispatch]);
  const resetCurrentReport = useCallback(() => dispatch(clearCurrentReport()), [dispatch]);

  return { reports, reportsPagination, currentReport, exports, loadReports, loadReportById, generateReport, deleteReport, loadExports, createExport, resetCurrentReport };
};

export default useReports;
