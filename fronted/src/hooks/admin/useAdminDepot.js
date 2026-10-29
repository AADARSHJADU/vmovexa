import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectAdminDepots,
  selectSelectedDepot,
  selectAdminDepotPagination,
  selectAdminDepotLoading,
  clearSelectedDepot,
  fetchDepotsThunk,
  createDepotThunk,
  updateDepotThunk,
  deleteDepotThunk,
  updateDepotStatusThunk,
} from '../../store/slices/admin/depotSlice.js';

export const useAdminDepot = () => {
  const dispatch = useAppDispatch();
  const depots = useAppSelector(selectAdminDepots);
  const selectedDepot = useAppSelector(selectSelectedDepot);
  const pagination = useAppSelector(selectAdminDepotPagination);
  const loading = useAppSelector(selectAdminDepotLoading);

  const loadDepots = useCallback((params) => dispatch(fetchDepotsThunk(params)).unwrap(), [dispatch]);
  const createDepot = useCallback((data) => dispatch(createDepotThunk(data)).unwrap(), [dispatch]);
  const updateDepot = useCallback((id, data) => dispatch(updateDepotThunk({ id, data })).unwrap(), [dispatch]);
  const deleteDepot = useCallback((id) => dispatch(deleteDepotThunk(id)).unwrap(), [dispatch]);
  const updateDepotStatus = useCallback((id, status) => dispatch(updateDepotStatusThunk({ id, status })).unwrap(), [dispatch]);
  const resetSelectedDepot = useCallback(() => dispatch(clearSelectedDepot()), [dispatch]);

  return {
    depots,
    selectedDepot,
    pagination,
    loading,
    loadDepots,
    createDepot,
    updateDepot,
    deleteDepot,
    updateDepotStatus,
    resetSelectedDepot,
  };
};

export default useAdminDepot;
