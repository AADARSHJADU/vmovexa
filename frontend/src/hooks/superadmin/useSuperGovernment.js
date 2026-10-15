import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectSuperAgencies,
  selectCurrentAgency,
  selectSuperAgencyLoading,
  selectSuperAgenciesPagination,
  fetchSuperGovernmentAgenciesThunk,
  fetchSuperGovernmentAgencyThunk,
  createSuperGovernmentAgencyThunk,
  updateSuperGovernmentAgencyThunk,
  deleteSuperGovernmentAgencyThunk,
  updateSuperAgencyStatusThunk,
  deleteSuperGovernmentDocumentThunk,
  resetCurrentAgency as resetCurrentAction,
} from '../../store/slices/superadmin/governmentSlice.js';

export const useSuperGovernment = () => {
  const dispatch = useAppDispatch();
  const agencies = useAppSelector(selectSuperAgencies);
  const currentAgency = useAppSelector(selectCurrentAgency);
  const loading = useAppSelector(selectSuperAgencyLoading);
  const pagination = useAppSelector(selectSuperAgenciesPagination);

  const loadAgencies = useCallback(
    (params) => dispatch(fetchSuperGovernmentAgenciesThunk(params)).unwrap(),
    [dispatch]
  );

  const loadAgency = useCallback(
    (id) => dispatch(fetchSuperGovernmentAgencyThunk(id)).unwrap(),
    [dispatch]
  );

  const createAgency = useCallback(
    (data) => dispatch(createSuperGovernmentAgencyThunk(data)).unwrap(),
    [dispatch]
  );

  const updateAgency = useCallback(
    (id, data) => dispatch(updateSuperGovernmentAgencyThunk({ id, data })).unwrap(),
    [dispatch]
  );

  const deleteAgency = useCallback(
    (id) => dispatch(deleteSuperGovernmentAgencyThunk(id)).unwrap(),
    [dispatch]
  );

  const updateStatus = useCallback(
    (id, status) => dispatch(updateSuperAgencyStatusThunk({ id, status })).unwrap(),
    [dispatch]
  );

  const deleteDocument = useCallback(
    (docId) => dispatch(deleteSuperGovernmentDocumentThunk(docId)).unwrap(),
    [dispatch]
  );

  const resetCurrentAgency = useCallback(
    () => dispatch(resetCurrentAction()),
    [dispatch]
  );

  return {
    agencies,
    currentAgency,
    loading,
    pagination,
    loadAgencies,
    loadAgency,
    createAgency,
    updateAgency,
    deleteAgency,
    updateStatus,
    deleteDocument,
    resetCurrentAgency,
  };
};

export default useSuperGovernment;
