import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchPaymentGatewaysThunk,
  updatePaymentGatewayThunk,
  testPaymentGatewayThunk,
  simulateOrderThunk,
} from '../../store/thunks/superadmin/paymentGateway.thunks';
import {
  selectPaymentGateways,
  selectSelectedPaymentGateway,
  selectPaymentGatewaysLoading,
  selectPaymentGatewaysSaving,
  selectPaymentGatewaysTesting,
  selectPaymentGatewaysTestResult,
  selectPaymentGatewaysSimulating,
  selectPaymentGatewaysSimulationResult,
  selectPaymentGatewaysError,
  selectGatewayByProvider,
  updateLocalSelectedField,
  clearTestResult,
  clearSimulationResult,
  clearError,
} from '../../store/slices/superadmin/paymentGatewaySlice';

export function usePaymentGateways() {
  const dispatch = useAppDispatch();

  const gateways = useAppSelector(selectPaymentGateways);
  const selectedGateway = useAppSelector(selectSelectedPaymentGateway);
  const loading = useAppSelector(selectPaymentGatewaysLoading);
  const saving = useAppSelector(selectPaymentGatewaysSaving);
  const testing = useAppSelector(selectPaymentGatewaysTesting);
  const testResult = useAppSelector(selectPaymentGatewaysTestResult);
  const simulating = useAppSelector(selectPaymentGatewaysSimulating);
  const simulationResult = useAppSelector(selectPaymentGatewaysSimulationResult);
  const error = useAppSelector(selectPaymentGatewaysError);

  const fetchGateways = useCallback(
    () => dispatch(fetchPaymentGatewaysThunk()),
    [dispatch]
  );

  const updateGateway = useCallback(
    (id, data) => dispatch(updatePaymentGatewayThunk({ id, data })),
    [dispatch]
  );

  const testConnection = useCallback(
    (id, data = {}) => dispatch(testPaymentGatewayThunk({ id, data })),
    [dispatch]
  );

  const simulateOrder = useCallback(
    (id, data = {}) => dispatch(simulateOrderThunk({ id, data })),
    [dispatch]
  );

  const setSelectedGateway = useCallback(
    (providerOrId) => dispatch(selectGatewayByProvider(providerOrId)),
    [dispatch]
  );

  const setLocalField = useCallback(
    (field, value) => dispatch(updateLocalSelectedField({ field, value })),
    [dispatch]
  );

  const resetTestResult = useCallback(
    () => dispatch(clearTestResult()),
    [dispatch]
  );

  const resetSimulationResult = useCallback(
    () => dispatch(clearSimulationResult()),
    [dispatch]
  );

  const resetError = useCallback(
    () => dispatch(clearError()),
    [dispatch]
  );

  return {
    gateways,
    selectedGateway,
    loading,
    saving,
    testing,
    testResult,
    simulating,
    simulationResult,
    error,
    fetchGateways,
    updateGateway,
    testConnection,
    simulateOrder,
    setSelectedGateway,
    setLocalField,
    resetTestResult,
    resetSimulationResult,
    resetError,
  };
}

export default usePaymentGateways;
