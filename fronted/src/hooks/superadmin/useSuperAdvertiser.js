import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectSuperAdvertisers,
  selectCurrentAdvertiser,
  selectSuperAdvertiserLoading,
  selectSuperAdvertisersPagination,
  fetchSuperAdvertisersThunk,
  fetchSuperAdvertiserThunk,
  createSuperAdvertiserThunk,
  updateSuperAdvertiserThunk,
  deleteSuperAdvertiserThunk,
  updateSuperAdvertiserStatusThunk,
  clearCurrentAdvertiser,
} from '../../store/slices/superadmin/advertiserSlice.js';

export const useSuperAdvertiser = () => {
  const dispatch = useAppDispatch();
  const advertisers = useAppSelector(selectSuperAdvertisers);
  const currentAdvertiser = useAppSelector(selectCurrentAdvertiser);
  const loading = useAppSelector(selectSuperAdvertiserLoading);
  const pagination = useAppSelector(selectSuperAdvertisersPagination);

  const loadAdvertisers = useCallback(
    (params) => dispatch(fetchSuperAdvertisersThunk(params)).unwrap(),
    [dispatch]
  );
  const loadAdvertiser = useCallback(
    (id) => dispatch(fetchSuperAdvertiserThunk(id)).unwrap(),
    [dispatch]
  );
  const createAdvertiser = useCallback(
    (data) => dispatch(createSuperAdvertiserThunk(data)).unwrap(),
    [dispatch]
  );
  const updateAdvertiser = useCallback(
    (id, data) => dispatch(updateSuperAdvertiserThunk({ id, data })).unwrap(),
    [dispatch]
  );
  const deleteAdvertiser = useCallback(
    (id) => dispatch(deleteSuperAdvertiserThunk(id)).unwrap(),
    [dispatch]
  );
  const updateStatus = useCallback(
    (id, status) => dispatch(updateSuperAdvertiserStatusThunk({ id, status })).unwrap(),
    [dispatch]
  );
  const resetCurrentAdvertiser = useCallback(
    () => dispatch(clearCurrentAdvertiser()),
    [dispatch]
  );

  return {
    advertisers,
    currentAdvertiser,
    loading,
    pagination,
    loadAdvertisers,
    loadAdvertiser,
    createAdvertiser,
    updateAdvertiser,
    deleteAdvertiser,
    updateStatus,
    resetCurrentAdvertiser,
  };
};

export default useSuperAdvertiser;
