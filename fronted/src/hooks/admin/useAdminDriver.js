import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectAdminDrivers,
  selectAdminDriverPagination,
  selectAdminDriverLoading,
  fetchDriversThunk,
  createDriverThunk,
  updateDriverThunk,
  verifyDriverThunk,
  approveDriverThunk,
  rejectDriverThunk,
  verifyDriverDocumentsThunk,
  updateDriverStatusThunk,
  deleteDriverThunk,
} from '../../store/slices/admin/driverSlice.js';
import adminDriverService from '../../api/services/admin/driver.service.js';

export const useAdminDriver = () => {
  const dispatch = useAppDispatch();
  const drivers = useAppSelector(selectAdminDrivers);
  const pagination = useAppSelector(selectAdminDriverPagination);
  const loading = useAppSelector(selectAdminDriverLoading);

  const loadDrivers = useCallback((params) => dispatch(fetchDriversThunk(params)).unwrap(), [dispatch]);
  const loadDriver = useCallback((id) => adminDriverService.getDriver(id), []);
  const createDriver = useCallback((data) => dispatch(createDriverThunk(data)).unwrap(), [dispatch]);
  const updateDriver = useCallback((id, data) => dispatch(updateDriverThunk({ id, data })).unwrap(), [dispatch]);
  const updateDriverStatus = useCallback((id, status) => dispatch(updateDriverStatusThunk({ id, status })).unwrap(), [dispatch]);
  const deleteDriver = useCallback((id) => dispatch(deleteDriverThunk(id)).unwrap(), [dispatch]);
  const verifyDriver = useCallback((id, payload) => dispatch(verifyDriverThunk({ id, payload })).unwrap(), [dispatch]);
  const approveDriver = useCallback((id) => dispatch(approveDriverThunk(id)).unwrap(), [dispatch]);
  const rejectDriver = useCallback((id, reason) => dispatch(rejectDriverThunk({ id, reason })).unwrap(), [dispatch]);
  const verifyDriverDocuments = useCallback((id, verified = true) => dispatch(verifyDriverDocumentsThunk({ id, verified })).unwrap(), [dispatch]);
  const uploadDocument = useCallback((file, purpose) => adminDriverService.uploadDocument(file, purpose), []);
  const uploadAvatar = useCallback((file) => adminDriverService.uploadAvatar(file), []);

  return {
    drivers,
    pagination,
    loading,
    loadDrivers,
    loadDriver,
    createDriver,
    updateDriver,
    updateDriverStatus,
    deleteDriver,
    verifyDriver,
    approveDriver,
    rejectDriver,
    verifyDriverDocuments,
    uploadDocument,
    uploadAvatar,
  };
};

export default useAdminDriver;

