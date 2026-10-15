import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectSuperFinanceOfficers,
  selectCurrentFinanceOfficer,
  selectSuperFinanceOfficerLoading,
  selectSuperFinanceOfficerPagination,
  selectSuperFinanceOfficerStatus,
  fetchSuperFinanceOfficersThunk,
  fetchSuperFinanceOfficerThunk,
  registerSuperFinanceOfficerThunk,
  updateSuperFinanceOfficerStatusThunk,
  updateSuperFinanceOfficerThunk,
  deleteSuperFinanceOfficerThunk,
  resetCurrentOfficer as resetCurrentAction,
} from '../../store/slices/superadmin/financeOfficerSlice.js';

export const useSuperFinanceOfficer = () => {
  const dispatch = useAppDispatch();
  const financeOfficers = useAppSelector(selectSuperFinanceOfficers);
  const currentOfficer = useAppSelector(selectCurrentFinanceOfficer);
  const loading = useAppSelector(selectSuperFinanceOfficerLoading);
  const pagination = useAppSelector(selectSuperFinanceOfficerPagination);
  const status = useAppSelector(selectSuperFinanceOfficerStatus);

  const loadFinanceOfficers = useCallback(
    (params) => dispatch(fetchSuperFinanceOfficersThunk(params)).unwrap(),
    [dispatch]
  );

  const loadFinanceOfficer = useCallback(
    (id) => dispatch(fetchSuperFinanceOfficerThunk(id)).unwrap(),
    [dispatch]
  );

  const registerFinanceOfficer = useCallback(
    (data) => dispatch(registerSuperFinanceOfficerThunk(data)).unwrap(),
    [dispatch]
  );

  const updateStatus = useCallback(
    (id, status) =>
      dispatch(updateSuperFinanceOfficerStatusThunk({ id, status })).unwrap(),
    [dispatch]
  );

  const updateFinanceOfficer = useCallback(
    (id, data) =>
      dispatch(updateSuperFinanceOfficerThunk({ id, data })).unwrap(),
    [dispatch]
  );

  const deleteFinanceOfficer = useCallback(
    (id) => dispatch(deleteSuperFinanceOfficerThunk(id)).unwrap(),
    [dispatch]
  );

  const resetCurrentOfficer = useCallback(
    () => dispatch(resetCurrentAction()),
    [dispatch]
  );

  return {
    financeOfficers,
    currentOfficer,
    loading,
    pagination,
    status,
    loadFinanceOfficers,
    loadFinanceOfficer,
    registerFinanceOfficer,
    updateStatus,
    updateFinanceOfficer,
    deleteFinanceOfficer,
    resetCurrentOfficer,
  };
};

export default useSuperFinanceOfficer;
