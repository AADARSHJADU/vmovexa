import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectAdminVehicles,
  selectSelectedVehicle,
  selectVehicleTelemetry,
  selectAdminVehiclePagination,
  selectAdminVehicleLoading,
  clearSelectedVehicle,
  fetchVehiclesThunk,
  createVehicleThunk,
  updateVehicleThunk,
  deleteVehicleThunk,
  assignDriverThunk,
  assignGpsThunk,
  fetchVehicleTelemetryThunk,
  updateVehicleStatusThunk,
  approveVehicleThunk,
  rejectVehicleThunk,
} from '../../store/slices/admin/vehicleSlice.js';

export const useAdminVehicle = () => {
  const dispatch = useAppDispatch();
  const vehicles = useAppSelector(selectAdminVehicles);
  const selectedVehicle = useAppSelector(selectSelectedVehicle);
  const telemetry = useAppSelector(selectVehicleTelemetry);
  const pagination = useAppSelector(selectAdminVehiclePagination);
  const loading = useAppSelector(selectAdminVehicleLoading);

  const loadVehicles = useCallback((params) => dispatch(fetchVehiclesThunk(params)).unwrap(), [dispatch]);
  const createVehicle = useCallback((data) => dispatch(createVehicleThunk(data)).unwrap(), [dispatch]);
  const updateVehicle = useCallback((id, data) => dispatch(updateVehicleThunk({ id, data })).unwrap(), [dispatch]);
  const deleteVehicle = useCallback((id) => dispatch(deleteVehicleThunk(id)).unwrap(), [dispatch]);
  const assignDriver = useCallback((id, driverId) => dispatch(assignDriverThunk({ id, driverId })).unwrap(), [dispatch]);
  const assignGps = useCallback((id, gpsDeviceId) => dispatch(assignGpsThunk({ id, gpsDeviceId })).unwrap(), [dispatch]);
  const loadTelemetry = useCallback((id) => dispatch(fetchVehicleTelemetryThunk(id)).unwrap(), [dispatch]);
  const updateVehicleStatus = useCallback((id, status) => dispatch(updateVehicleStatusThunk({ id, status })).unwrap(), [dispatch]);
  const approveVehicle = useCallback((id) => dispatch(approveVehicleThunk(id)).unwrap(), [dispatch]);
  const rejectVehicle = useCallback((id, reason) => dispatch(rejectVehicleThunk({ id, reason })).unwrap(), [dispatch]);
  const resetSelectedVehicle = useCallback(() => dispatch(clearSelectedVehicle()), [dispatch]);

  return {
    vehicles,
    selectedVehicle,
    telemetry,
    pagination,
    loading,
    loadVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    assignDriver,
    assignGps,
    loadTelemetry,
    updateVehicleStatus,
    approveVehicle,
    rejectVehicle,
    resetSelectedVehicle,
  };
};

export default useAdminVehicle;
