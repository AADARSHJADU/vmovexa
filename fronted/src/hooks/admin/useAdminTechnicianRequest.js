import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectAdminWorkOrders,
  selectAdminWorkOrdersPagination,
  selectAdminWorkOrdersLoading,
  selectAdminWorkOrdersError,
  selectCurrentAdminWorkOrder,
  selectCurrentAdminWorkOrderLoading,
  fetchWorkOrdersThunk,
  fetchWorkOrderDetailThunk,
  createWorkOrderThunk,
  updateWorkOrderThunk,
  rateTechnicianThunk,
  clearCurrentWorkOrder,
} from '../../store/slices/admin/technicianRequestSlice.js';

export const useAdminTechnicianRequest = () => {
  const dispatch = useAppDispatch();
  const workOrders = useAppSelector(selectAdminWorkOrders);
  const pagination = useAppSelector(selectAdminWorkOrdersPagination);
  const loading = useAppSelector(selectAdminWorkOrdersLoading);
  const error = useAppSelector(selectAdminWorkOrdersError);
  const currentWorkOrder = useAppSelector(selectCurrentAdminWorkOrder);
  const currentWorkOrderLoading = useAppSelector(selectCurrentAdminWorkOrderLoading);

  const loadWorkOrders = useCallback((params) => dispatch(fetchWorkOrdersThunk(params)).unwrap(), [dispatch]);
  const loadWorkOrderDetail = useCallback((id) => dispatch(fetchWorkOrderDetailThunk(id)).unwrap(), [dispatch]);
  const createWorkOrder = useCallback((data) => dispatch(createWorkOrderThunk(data)).unwrap(), [dispatch]);
  const updateWorkOrder = useCallback((id, data) => dispatch(updateWorkOrderThunk({ id, data })).unwrap(), [dispatch]);
  const rateTechnician = useCallback((id, data) => dispatch(rateTechnicianThunk({ id, data })).unwrap(), [dispatch]);
  const resetCurrentWorkOrder = useCallback(() => dispatch(clearCurrentWorkOrder()), [dispatch]);

  return {
    workOrders,
    pagination,
    loading,
    error,
    currentWorkOrder,
    currentWorkOrderLoading,
    loadWorkOrders,
    loadWorkOrderDetail,
    createWorkOrder,
    updateWorkOrder,
    rateTechnician,
    resetCurrentWorkOrder,
  };
};

export default useAdminTechnicianRequest;
