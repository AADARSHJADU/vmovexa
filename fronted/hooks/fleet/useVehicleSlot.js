import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectVehicleSlots,
  selectVehicleSlotPagination,
  selectSelectedVehicleSlot,
  selectSlotsTimetable,
  selectSlotConflictResult,
  selectVehicleSlotStatus,
  selectVehicleSlotActionStatus,
  fetchVehicleSlotsThunk,
  fetchVehicleSlotByIdThunk,
  createVehicleSlotThunk,
  updateVehicleSlotThunk,
  deleteVehicleSlotThunk,
  checkSlotConflictThunk,
  fetchSlotsTimetableThunk,
  clearSelectedSlot,
  clearConflictCheck,
} from '../../store/slices/fleet/vehicleSlotSlice.js';

export const useVehicleSlot = () => {
  const dispatch = useAppDispatch();

  const slots = useAppSelector(selectVehicleSlots);
  const pagination = useAppSelector(selectVehicleSlotPagination);
  const selectedSlot = useAppSelector(selectSelectedVehicleSlot);
  const timetable = useAppSelector(selectSlotsTimetable);
  const conflictResult = useAppSelector(selectSlotConflictResult);
  const status = useAppSelector(selectVehicleSlotStatus);
  const actionStatus = useAppSelector(selectVehicleSlotActionStatus);

  const loadSlots = useCallback(
    (params) => dispatch(fetchVehicleSlotsThunk(params)).unwrap(),
    [dispatch]
  );

  const loadSlotById = useCallback(
    (id) => dispatch(fetchVehicleSlotByIdThunk(id)).unwrap(),
    [dispatch]
  );

  const createSlot = useCallback(
    (data) => dispatch(createVehicleSlotThunk(data)).unwrap(),
    [dispatch]
  );

  const updateSlot = useCallback(
    (id, data) => dispatch(updateVehicleSlotThunk({ id, data })).unwrap(),
    [dispatch]
  );

  const deleteSlot = useCallback(
    (id) => dispatch(deleteVehicleSlotThunk(id)).unwrap(),
    [dispatch]
  );

  const checkConflict = useCallback(
    (payload) => dispatch(checkSlotConflictThunk(payload)).unwrap(),
    [dispatch]
  );

  const loadTimetable = useCallback(
    (params) => dispatch(fetchSlotsTimetableThunk(params)).unwrap(),
    [dispatch]
  );

  const resetSelectedSlot = useCallback(
    () => dispatch(clearSelectedSlot()),
    [dispatch]
  );

  const resetConflictCheck = useCallback(
    () => dispatch(clearConflictCheck()),
    [dispatch]
  );

  return {
    slots,
    pagination,
    selectedSlot,
    timetable,
    conflictResult,
    status,
    actionStatus,
    loading: status === 'loading',
    saving: actionStatus === 'loading',
    loadSlots,
    loadSlotById,
    getSlotById: loadSlotById,
    createSlot,
    updateSlot,
    deleteSlot,
    checkConflict,
    loadTimetable,
    resetSelectedSlot,
    resetConflictCheck,
  };
};

export default useVehicleSlot;
