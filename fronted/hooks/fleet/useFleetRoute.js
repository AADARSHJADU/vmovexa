import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import { selectFleetRoutes, fetchRoutesThunk, createRouteThunk } from '../../store/slices/fleet/routeSlice.js';

export const useFleetRoute = () => {
  const dispatch = useAppDispatch();
  const routes = useAppSelector(selectFleetRoutes);

  const loadRoutes = useCallback((params) => dispatch(fetchRoutesThunk(params)).unwrap(), [dispatch]);
  const createRoute = useCallback((data) => dispatch(createRouteThunk(data)).unwrap(), [dispatch]);

  return { routes, loadRoutes, createRoute };
};

export default useFleetRoute;
