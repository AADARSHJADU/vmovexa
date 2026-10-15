import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectAdminWorkOrders,
  selectAdminWorkOrdersPagination,
  selectAdminWorkOrdersLoading,
  selectCurrentAdminWorkOrder,
  selectCurrentAdminWorkOrderLoading,
  fetchWorkOrdersThunk,
  fetchWorkOrderDetailThunk,
  createWorkOrderThunk,
  updateWorkOrderThunk,
  clearCurrentWorkOrder,
} from '../../store/slices/admin/technicianRequestSlice.js';

export const useAdminTechnicianRequest = () => {
  const dispatch = useAppDispatch();
  const workOrders = useAppSelector(selectAdminWorkOrders);
  const pagination = useAppSelector(selectAdminWorkOrdersPagination);
  const loading = useAppSelector(selectAdminWorkOrdersLoading);
  const currentWorkOrder = useAppSelector(selectCurrentAdminWorkOrder);
  const currentWorkOrderLoading = useAppSelector(selectCurrentAdminWorkOrderLoading);

  const loadWorkOrders = useCallback((params) => dispatch(fetchWorkOrdersThunk(params)).unwrap(), [dispatch]);
  const loadWorkOrderDetail = useCallback((id) => dispatch(fetchWorkOrderDetailThunk(id)).unwrap(), [dispatch]);
  const createWorkOrder = useCallback((data) => dispatch(createWorkOrderThunk(data)).unwrap(), [dispatch]);
  const updateWorkOrder = useCallback((id, data) => dispatch(updateWorkOrderThunk({ id, data })).unwrap(), [dispatch]);
  const resetCurrentWorkOrder = useCallback(() => dispatch(clearCurrentWorkOrder()), [dispatch]);

  return {
    workOrders,
    pagination,
    loading,
    currentWorkOrder,
    currentWorkOrderLoading,
    loadWorkOrders,
    loadWorkOrderDetail,
    createWorkOrder,
    updateWorkOrder,
    resetCurrentWorkOrder,
  };
};

export default useAdminTechnicianRequest;
