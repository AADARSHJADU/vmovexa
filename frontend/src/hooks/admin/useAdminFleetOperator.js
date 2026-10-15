import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectAdminFleetOperators,
  selectSelectedFleetOperator,
  selectFleetOperatorActivity,
  selectFleetOperatorActivityPagination,
  selectFleetOperatorPermissions,
  selectAdminFleetOperatorPagination,
  selectAdminFleetOperatorLoading,
  clearSelectedOperator,
  fetchFleetOperatorsThunk,
  fetchFleetOperatorThunk,
  createFleetOperatorThunk,
  updateFleetOperatorThunk,
  updateOperatorStatusThunk,
  deleteFleetOperatorThunk,
  fetchOperatorActivityThunk,
  fetchOperatorPermissionsThunk,
  updateOperatorPermissionsThunk,
} from '../../store/slices/admin/fleetOperatorSlice.js';
import adminFleetOperatorService from '../../api/services/admin/fleetOperator.service.js';

export const useAdminFleetOperator = () => {
  const dispatch = useAppDispatch();
  const fleetOperators = useAppSelector(selectAdminFleetOperators);
  const selectedOperator = useAppSelector(selectSelectedFleetOperator);
  const operatorActivity = useAppSelector(selectFleetOperatorActivity);
  const activityPagination = useAppSelector(selectFleetOperatorActivityPagination);
  const operatorPermissions = useAppSelector(selectFleetOperatorPermissions);
  const pagination = useAppSelector(selectAdminFleetOperatorPagination);
  const loading = useAppSelector(selectAdminFleetOperatorLoading);

  const loadFleetOperators = useCallback((params) => dispatch(fetchFleetOperatorsThunk(params)).unwrap(), [dispatch]);
  const loadFleetOperator = useCallback((id) => dispatch(fetchFleetOperatorThunk(id)).unwrap(), [dispatch]);
  const createFleetOperator = useCallback((data) => dispatch(createFleetOperatorThunk(data)).unwrap(), [dispatch]);
  const updateFleetOperator = useCallback((id, data) => dispatch(updateFleetOperatorThunk({ id, data })).unwrap(), [dispatch]);
  const updateOperatorStatus = useCallback((id, status) => dispatch(updateOperatorStatusThunk({ id, status })).unwrap(), [dispatch]);
  const deleteFleetOperator = useCallback((id) => dispatch(deleteFleetOperatorThunk(id)).unwrap(), [dispatch]);
  const loadOperatorActivity = useCallback((id, params) => dispatch(fetchOperatorActivityThunk({ id, params })).unwrap(), [dispatch]);
  const loadOperatorPermissions = useCallback((id) => dispatch(fetchOperatorPermissionsThunk(id)).unwrap(), [dispatch]);
  const updateOperatorPermissions = useCallback((id, permissions) => dispatch(updateOperatorPermissionsThunk({ id, permissions })).unwrap(), [dispatch]);
  const uploadAvatar = useCallback((file) => adminFleetOperatorService.uploadAvatar(file), []);
  const resetSelectedOperator = useCallback(() => dispatch(clearSelectedOperator()), [dispatch]);

  return {
    fleetOperators,
    selectedOperator,
    operatorActivity,
    activityPagination,
    operatorPermissions,
    pagination,
    loading,
    loadFleetOperators,
    loadFleetOperator,
    createFleetOperator,
    updateFleetOperator,
    updateOperatorStatus,
    deleteFleetOperator,
    loadOperatorActivity,
    loadOperatorPermissions,
    updateOperatorPermissions,
    uploadAvatar,
    resetSelectedOperator,
  };
};

export default useAdminFleetOperator;

