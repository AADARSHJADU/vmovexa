import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectFleetVehicles,
  selectFleetVehiclePagination,
  selectFleetVehicleTelemetry,
  fetchFleetVehiclesThunk,
  createFleetVehicleThunk,
  updateFleetVehicleThunk,
  assignVehicleDriverThunk,
  assignVehicleGpsThunk,
  fetchFleetVehicleTelemetryThunk,
} from '../../store/slices/fleet/vehicleSlice.js';

export const useFleetVehicle = () => {
  const dispatch = useAppDispatch();
  const vehicles = useAppSelector(selectFleetVehicles);
  const pagination = useAppSelector(selectFleetVehiclePagination);
  const telemetry = useAppSelector(selectFleetVehicleTelemetry);

  const loadVehicles = useCallback((params) => dispatch(fetchFleetVehiclesThunk(params)).unwrap(), [dispatch]);
  const loadTelemetry = useCallback((id) => dispatch(fetchFleetVehicleTelemetryThunk(id)).unwrap(), [dispatch]);
  const createVehicle = useCallback((data) => dispatch(createFleetVehicleThunk(data)).unwrap(), [dispatch]);
  const updateVehicle = useCallback((id, data) => dispatch(updateFleetVehicleThunk({ id, data })).unwrap(), [dispatch]);
  const assignDriver = useCallback((id, driverId) => dispatch(assignVehicleDriverThunk({ id, driverId })).unwrap(), [dispatch]);
  const assignGps = useCallback((id, gpsDeviceId) => dispatch(assignVehicleGpsThunk({ id, gpsDeviceId })).unwrap(), [dispatch]);

  return { vehicles, pagination, telemetry, loadVehicles, loadTelemetry, createVehicle, updateVehicle, assignDriver, assignGps };
};

export default useFleetVehicle;
