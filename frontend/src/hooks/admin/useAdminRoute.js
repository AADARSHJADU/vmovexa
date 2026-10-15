import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectAdminRoutes,
  selectSelectedRoute,
  selectRouteVehicles,
  selectAdminRouteLoading,
  selectAdminRoutePagination,
  selectAdminRouteError,
  clearSelectedRoute,
  setSelectedRoute,
  fetchRoutesThunk,
  fetchRouteDetailsThunk,
  createRouteThunk,
  updateRouteThunk,
  deleteRouteThunk,
  approveRouteThunk,
  rejectRouteThunk,
  assignVehicleRouteThunk,
  fetchRouteVehiclesThunk,
  approveAssignmentThunk,
  rejectAssignmentThunk,
  deleteAssignmentThunk,
} from '../../store/slices/admin/routeSlice.js';

export const useAdminRoute = () => {
  const dispatch = useAppDispatch();
  const routes = useAppSelector(selectAdminRoutes);
  const selectedRoute = useAppSelector(selectSelectedRoute);
  const routeVehicles = useAppSelector(selectRouteVehicles);
  const pagination = useAppSelector(selectAdminRoutePagination);
  const loading = useAppSelector(selectAdminRouteLoading);
  const error = useAppSelector(selectAdminRouteError);

  const loadRoutes = useCallback((params) => dispatch(fetchRoutesThunk(params)).unwrap(), [dispatch]);
  const loadRouteDetails = useCallback((id) => dispatch(fetchRouteDetailsThunk(id)).unwrap(), [dispatch]);
  const createRoute = useCallback((data) => dispatch(createRouteThunk(data)).unwrap(), [dispatch]);
  const updateRoute = useCallback((id, data) => dispatch(updateRouteThunk({ id, data })).unwrap(), [dispatch]);
  const deleteRoute = useCallback((id) => dispatch(deleteRouteThunk(id)).unwrap(), [dispatch]);
  const approveRoute = useCallback((id) => dispatch(approveRouteThunk(id)).unwrap(), [dispatch]);
  const rejectRoute = useCallback((id, reason) => dispatch(rejectRouteThunk({ id, reason })).unwrap(), [dispatch]);
  const assignVehicle = useCallback((id, data) => dispatch(assignVehicleRouteThunk({ id, data })).unwrap(), [dispatch]);
  const loadRouteVehicles = useCallback((id) => dispatch(fetchRouteVehiclesThunk(id)).unwrap(), [dispatch]);
  const approveAssignment = useCallback((id) => dispatch(approveAssignmentThunk(id)).unwrap(), [dispatch]);
  const rejectAssignment = useCallback((id, reason) => dispatch(rejectAssignmentThunk({ id, reason })).unwrap(), [dispatch]);
  const deleteAssignment = useCallback((id) => dispatch(deleteAssignmentThunk(id)).unwrap(), [dispatch]);
  const resetSelectedRoute = useCallback(() => dispatch(clearSelectedRoute()), [dispatch]);
  const setRoute = useCallback((route) => dispatch(setSelectedRoute(route)), [dispatch]);

  return {
    routes,
    selectedRoute,
    routeVehicles,
    pagination,
    loading,
    error,
    loadRoutes,
    loadRouteDetails,
    createRoute,
    updateRoute,
    deleteRoute,
    approveRoute,
    rejectRoute,
    assignVehicle,
    loadRouteVehicles,
    approveAssignment,
    rejectAssignment,
    deleteAssignment,
    resetSelectedRoute,
    setRoute,
  };
};

export default useAdminRoute;
