import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectFleetDrivers,
  fetchFleetDriversThunk,
  createFleetDriverThunk,
  assignDriverBusThunk,
} from '../../store/slices/fleet/driverSlice.js';

export const useFleetDriver = () => {
  const dispatch = useAppDispatch();
  const drivers = useAppSelector(selectFleetDrivers);

  const loadDrivers = useCallback((params) => dispatch(fetchFleetDriversThunk(params)).unwrap(), [dispatch]);
  const createDriver = useCallback((data) => dispatch(createFleetDriverThunk(data)).unwrap(), [dispatch]);
  const assignBus = useCallback((id, vehicleId) => dispatch(assignDriverBusThunk({ id, vehicleId })).unwrap(), [dispatch]);

  return { drivers, loadDrivers, createDriver, assignBus };
};

export default useFleetDriver;
