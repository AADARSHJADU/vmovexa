import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectFleetTrips,
  selectFleetTripsPagination,
  selectFleetTripsStatus,
  fetchTripsThunk,
} from '../../store/slices/fleet/tripSlice.js';

export const useFleetTrip = () => {
  const dispatch = useAppDispatch();
  const trips = useAppSelector(selectFleetTrips);
  const pagination = useAppSelector(selectFleetTripsPagination);
  const status = useAppSelector(selectFleetTripsStatus);

  const loadTrips = useCallback((params) => dispatch(fetchTripsThunk(params)).unwrap(), [dispatch]);

  return { trips, pagination, status, loadTrips };
};

export default useFleetTrip;
