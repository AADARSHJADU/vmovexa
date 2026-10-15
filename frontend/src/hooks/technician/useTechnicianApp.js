import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectMyWorkOrders,
  selectWorkOrdersPagination,
  selectSelectedWorkOrder,
  selectWorkOrderDetailLoading,
  selectWorkOrderActionLoading,
  selectTechStatus,
  selectTechDevices,
  selectTechVehicles,
  selectTechConnectivityTests,
  selectTechEdgeConfig,
  selectTechEdgeConfigMeta,
  selectTechEdgeConfigLoading,
  selectTechTelemetry,
  selectTechTelemetryLoading,
  fetchMyWorkOrdersThunk,
  fetchWorkOrderDetailThunk,
  setWorkOrderStatusThunk,
  clearSelectedWorkOrder,
  fetchEdgeDevicesThunk,
  registerEdgeDeviceThunk,
  updateEdgeDeviceThunk,
  deleteEdgeDeviceThunk,
  toggleEdgeDeviceActiveThunk,
  pushConfigThunk,
  fetchEdgeConfigThunk,
  fetchEdgeTelemetryThunk,
  factoryResetThunk,
  rebootDeviceThunk,
  fetchConnectivityTestsThunk,
  recordConnectivityTestThunk,
  registerGpsDeviceThunk,
  assignGpsThunk,
  fetchTechVehiclesThunk,
} from '../../store/slices/technician/technicianSlice.js';

export const useTechnicianApp = () => {
  const dispatch = useAppDispatch();

  const workOrders = useAppSelector(selectMyWorkOrders);
  const workOrdersPagination = useAppSelector(selectWorkOrdersPagination);
  const selectedWorkOrder = useAppSelector(selectSelectedWorkOrder);
  const workOrderDetailLoading = useAppSelector(selectWorkOrderDetailLoading);
  const actionLoading = useAppSelector(selectWorkOrderActionLoading);
  const status = useAppSelector(selectTechStatus);
  const devices = useAppSelector(selectTechDevices);
  const vehicles = useAppSelector(selectTechVehicles);
  const connectivityTests = useAppSelector(selectTechConnectivityTests);
  const edgeConfig = useAppSelector(selectTechEdgeConfig);
  const edgeConfigMeta = useAppSelector(selectTechEdgeConfigMeta);
  const edgeConfigLoading = useAppSelector(selectTechEdgeConfigLoading);
  const telemetry = useAppSelector(selectTechTelemetry);
  const telemetryLoading = useAppSelector(selectTechTelemetryLoading);

  const loadWorkOrders = useCallback((params) => dispatch(fetchMyWorkOrdersThunk(params)).unwrap(), [dispatch]);
  const loadWorkOrderDetail = useCallback((id) => dispatch(fetchWorkOrderDetailThunk(id)).unwrap(), [dispatch]);
  const clearWorkOrderDetail = useCallback(() => dispatch(clearSelectedWorkOrder()), [dispatch]);
  const setWorkOrderStatus = useCallback((id, status, resolutionNotes) => dispatch(setWorkOrderStatusThunk({ id, status, resolutionNotes })).unwrap(), [dispatch]);
  const loadDevices = useCallback((params) => dispatch(fetchEdgeDevicesThunk(params)).unwrap(), [dispatch]);
  const registerDevice = useCallback((data) => dispatch(registerEdgeDeviceThunk(data)).unwrap(), [dispatch]);
  const updateDevice = useCallback((id, data) => dispatch(updateEdgeDeviceThunk({ id, data })).unwrap(), [dispatch]);
  const deleteDevice = useCallback((id) => dispatch(deleteEdgeDeviceThunk(id)).unwrap(), [dispatch]);
  const toggleDeviceActive = useCallback((id, isActive) => dispatch(toggleEdgeDeviceActiveThunk({ id, isActive })).unwrap(), [dispatch]);
  const pushConfig = useCallback((id, config) => dispatch(pushConfigThunk({ id, config })).unwrap(), [dispatch]);
  const loadEdgeConfig = useCallback((id) => dispatch(fetchEdgeConfigThunk(id)).unwrap(), [dispatch]);
  const loadTelemetry = useCallback((id, params) => dispatch(fetchEdgeTelemetryThunk({ id, params })).unwrap(), [dispatch]);
  const factoryReset = useCallback((id) => dispatch(factoryResetThunk(id)).unwrap(), [dispatch]);
  const rebootDevice = useCallback((id) => dispatch(rebootDeviceThunk(id)).unwrap(), [dispatch]);
  const loadConnectivityTests = useCallback((id) => dispatch(fetchConnectivityTestsThunk(id)).unwrap(), [dispatch]);
  const recordConnectivityTest = useCallback((id, data) => dispatch(recordConnectivityTestThunk({ id, data })).unwrap(), [dispatch]);
  const registerGpsDevice = useCallback((data) => dispatch(registerGpsDeviceThunk(data)).unwrap(), [dispatch]);
  const assignGps = useCallback((id, vehicleId) => dispatch(assignGpsThunk({ id, vehicleId })).unwrap(), [dispatch]);
  const loadVehicles = useCallback((params) => dispatch(fetchTechVehiclesThunk(params)).unwrap(), [dispatch]);

  return {
    workOrders,
    workOrdersPagination,
    selectedWorkOrder,
    workOrderDetailLoading,
    actionLoading,
    status,
    devices,
    vehicles,
    connectivityTests,
    edgeConfig,
    edgeConfigMeta,
    edgeConfigLoading,
    telemetry,
    telemetryLoading,
    loadWorkOrders,
    loadWorkOrderDetail,
    clearWorkOrderDetail,
    setWorkOrderStatus,
    loadDevices,
    registerDevice,
    updateDevice,
    deleteDevice,
    toggleDeviceActive,
    pushConfig,
    loadEdgeConfig,
    loadTelemetry,
    factoryReset,
    rebootDevice,
    loadConnectivityTests,
    recordConnectivityTest,
    registerGpsDevice,
    assignGps,
    loadVehicles,
  };
};

export default useTechnicianApp;
