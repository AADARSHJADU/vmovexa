import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectCentralTechnicians,
  selectCurrentTechnician,
  selectCentralTechniciansLoading,
  selectCentralTechniciansPagination,
  selectTechnicianPagination,
  selectTechnicianStatus,
  selectWorkOrders,
  selectWorkOrdersStatus,
  selectWorkOrderStatus,
  selectWorkOrderPagination,
  selectSelectedWorkOrder,
  selectSelectedWorkOrderLoading,
  fetchCentralTechniciansThunk,
  fetchTechnicianThunk,
  fetchWorkOrdersThunk,
  fetchWorkOrderDetailThunk,
  assignTechnicianWorkOrderThunk,
  dispatchWorkOrderThunk,
  approveWorkOrderThunk,
  rejectWorkOrderThunk,
  updateWorkOrderStatusThunk,
  registerTechnicianThunk,
  updateTechnicianThunk,
  deleteTechnicianThunk,
  updateTechnicianStatusThunk,
  clearCurrentTechnician,
  clearSelectedWorkOrder,
} from '../../store/slices/superadmin/technicianSlice.js';

export const useSuperTechnician = () => {
  const dispatch = useAppDispatch();
  const centralTechnicians = useAppSelector(selectCentralTechnicians);
  const currentTechnician = useAppSelector(selectCurrentTechnician);
  const loading = useAppSelector(selectCentralTechniciansLoading);
  const pagination = useAppSelector(selectCentralTechniciansPagination);
  const technicianPagination = useAppSelector(selectTechnicianPagination);
  const technicianStatus = useAppSelector(selectTechnicianStatus);
  const workOrders = useAppSelector(selectWorkOrders);
  const workOrdersStatus = useAppSelector(selectWorkOrdersStatus);
  const workOrderStatus = useAppSelector(selectWorkOrderStatus);
  const workOrderPagination = useAppSelector(selectWorkOrderPagination);
  const selectedWorkOrder = useAppSelector(selectSelectedWorkOrder);
  const selectedWorkOrderLoading = useAppSelector(selectSelectedWorkOrderLoading);

  const loadCentralTechnicians = useCallback((params) => dispatch(fetchCentralTechniciansThunk(params)).unwrap(), [dispatch]);
  const loadTechnician = useCallback((id) => dispatch(fetchTechnicianThunk(id)).unwrap(), [dispatch]);
  const loadWorkOrders = useCallback((params) => dispatch(fetchWorkOrdersThunk(params)).unwrap(), [dispatch]);
  const loadWorkOrderDetail = useCallback((id) => dispatch(fetchWorkOrderDetailThunk(id)).unwrap(), [dispatch]);
  const assignWorkOrder = useCallback((arg1, arg2) => {
    const payload = arg2 !== undefined ? { id: arg1, data: arg2 } : arg1;
    return dispatch(assignTechnicianWorkOrderThunk(payload)).unwrap();
  }, [dispatch]);
  const dispatchWorkOrder = useCallback((payload) => dispatch(dispatchWorkOrderThunk(payload)).unwrap(), [dispatch]);
  const approveWorkOrder = useCallback((id) => dispatch(approveWorkOrderThunk(id)).unwrap(), [dispatch]);
  const rejectWorkOrder = useCallback((id, reason) => dispatch(rejectWorkOrderThunk({ id, reason })).unwrap(), [dispatch]);
  const updateWorkOrderStatus = useCallback((id, status, resolutionNotes) => {
    return dispatch(updateWorkOrderStatusThunk({ id, status, resolutionNotes })).unwrap();
  }, [dispatch]);
  const registerTechnician = useCallback((data) => dispatch(registerTechnicianThunk(data)).unwrap(), [dispatch]);
  const updateTechnician = useCallback((id, data) => dispatch(updateTechnicianThunk({ id, data })).unwrap(), [dispatch]);
  const deleteTechnician = useCallback((id) => dispatch(deleteTechnicianThunk(id)).unwrap(), [dispatch]);
  const updateStatus = useCallback((id, status) => dispatch(updateTechnicianStatusThunk({ id, status })).unwrap(), [dispatch]);
  const resetCurrentTechnician = useCallback(() => dispatch(clearCurrentTechnician()), [dispatch]);
  const resetSelectedWorkOrder = useCallback(() => dispatch(clearSelectedWorkOrder()), [dispatch]);

  return {
    centralTechnicians,
    currentTechnician,
    loading,
    pagination,
    technicianPagination,
    technicianStatus,
    workOrders,
    workOrdersStatus,
    workOrderStatus,
    workOrderPagination,
    selectedWorkOrder,
    selectedWorkOrderLoading,
    loadCentralTechnicians,
    loadTechnician,
    loadWorkOrders,
    loadWorkOrderDetail,
    assignWorkOrder,
    dispatchWorkOrder,
    approveWorkOrder,
    rejectWorkOrder,
    updateWorkOrderStatus,
    registerTechnician,
    updateTechnician,
    deleteTechnician,
    updateStatus,
    resetCurrentTechnician,
    resetSelectedWorkOrder,
  };
};

export default useSuperTechnician;
