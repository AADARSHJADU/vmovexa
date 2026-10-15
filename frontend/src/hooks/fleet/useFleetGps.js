import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectFleetGpsDevices,
  selectFleetGpsSelectedDevice,
  fetchGpsDevicesThunk,
  fetchGpsDeviceThunk,
  createGpsDeviceThunk,
  updateGpsDeviceThunk,
  assignGpsVehicleThunk,
  deleteGpsDeviceThunk,
  approveGpsDeviceThunk,
  rejectGpsDeviceThunk,
} from '../../store/slices/fleet/gpsSlice.js';

export const useFleetGps = () => {
  const dispatch = useAppDispatch();
  const devices = useAppSelector(selectFleetGpsDevices);
  const selectedDevice = useAppSelector(selectFleetGpsSelectedDevice);

  const loadDevices = useCallback((params) => dispatch(fetchGpsDevicesThunk(params)).unwrap(), [dispatch]);
  const loadDevice = useCallback((id) => dispatch(fetchGpsDeviceThunk(id)).unwrap(), [dispatch]);
  const createDevice = useCallback((data) => dispatch(createGpsDeviceThunk(data)).unwrap(), [dispatch]);
  const updateDevice = useCallback((id, data) => dispatch(updateGpsDeviceThunk({ id, data })).unwrap(), [dispatch]);
  const assignVehicle = useCallback((id, vehicleId) => dispatch(assignGpsVehicleThunk({ id, vehicleId })).unwrap(), [dispatch]);
  const deleteDevice = useCallback((id) => dispatch(deleteGpsDeviceThunk(id)).unwrap(), [dispatch]);
  const approveDevice = useCallback((id) => dispatch(approveGpsDeviceThunk(id)).unwrap(), [dispatch]);
  const rejectDevice = useCallback((id, reason) => dispatch(rejectGpsDeviceThunk({ id, reason })).unwrap(), [dispatch]);

  return {
    devices,
    selectedDevice,
    loadDevices,
    loadDevice,
    createDevice,
    updateDevice,
    assignVehicle,
    deleteDevice,
    approveDevice,
    rejectDevice,
  };
};

export default useFleetGps;
