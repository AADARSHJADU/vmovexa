import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectFleetsData,
  selectSelectedFleet,
  selectFleetsPagination,
  selectFleetManagerLoading,
  fetchFleetsThunk,
  fetchFleetThunk,
  createFleetThunk,
  updateFleetThunk,
  deleteFleetThunk,
  approveFleetThunk,
  rejectFleetThunk,
  clearSelectedFleet,
} from '../../store/slices/fleet/fleetSlice.js';

export const useFleetManager = () => {
  const dispatch = useAppDispatch();
  const fleets = useAppSelector(selectFleetsData);
  const selectedFleet = useAppSelector(selectSelectedFleet);
  const pagination = useAppSelector(selectFleetsPagination);
  const loading = useAppSelector(selectFleetManagerLoading);

  const loadFleets = useCallback((params) => dispatch(fetchFleetsThunk(params)).unwrap(), [dispatch]);
  const loadFleet = useCallback((id) => dispatch(fetchFleetThunk(id)).unwrap(), [dispatch]);
  const createFleet = useCallback((data) => dispatch(createFleetThunk(data)).unwrap(), [dispatch]);
  const updateFleet = useCallback((id, data) => dispatch(updateFleetThunk({ id, data })).unwrap(), [dispatch]);
  const deleteFleet = useCallback((id) => dispatch(deleteFleetThunk(id)).unwrap(), [dispatch]);
  const approveFleet = useCallback((id) => dispatch(approveFleetThunk(id)).unwrap(), [dispatch]);
  const rejectFleet = useCallback((id, reason) => dispatch(rejectFleetThunk({ id, reason })).unwrap(), [dispatch]);
  const resetSelectedFleet = useCallback(() => dispatch(clearSelectedFleet()), [dispatch]);

  return {
    fleets,
    selectedFleet,
    pagination,
    loading,
    loadFleets,
    loadFleet,
    createFleet,
    updateFleet,
    deleteFleet,
    approveFleet,
    rejectFleet,
    resetSelectedFleet,
  };
};

export default useFleetManager;
