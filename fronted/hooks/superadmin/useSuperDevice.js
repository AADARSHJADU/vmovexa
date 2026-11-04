import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectSuperEdgeDevices,
  selectSuperDisplays,
  fetchEdgeDevicesThunk,
  createEdgeDeviceThunk,
  updateEdgeDeviceThunk,
  deleteEdgeDeviceThunk,
  toggleEdgeDeviceActiveThunk,
  rebootEdgeDeviceThunk,
  fetchDisplaysThunk,
} from '../../store/slices/superadmin/deviceSlice.js';

export const useSuperDevice = () => {
  const dispatch = useAppDispatch();
  const edgeDevices = useAppSelector(selectSuperEdgeDevices);
  const displays = useAppSelector(selectSuperDisplays);

  const loadEdgeDevices = useCallback((params) => dispatch(fetchEdgeDevicesThunk(params)).unwrap(), [dispatch]);
  const createDevice = useCallback((data) => dispatch(createEdgeDeviceThunk(data)).unwrap(), [dispatch]);
  const updateDevice = useCallback((id, data) => dispatch(updateEdgeDeviceThunk({ id, data })).unwrap(), [dispatch]);
  const deleteDevice = useCallback((id) => dispatch(deleteEdgeDeviceThunk(id)).unwrap(), [dispatch]);
  const toggleDeviceActive = useCallback((id, isActive) => dispatch(toggleEdgeDeviceActiveThunk({ id, isActive })).unwrap(), [dispatch]);
  const rebootDevice = useCallback((id) => dispatch(rebootEdgeDeviceThunk(id)).unwrap(), [dispatch]);
  const loadDisplays = useCallback((params) => dispatch(fetchDisplaysThunk(params)).unwrap(), [dispatch]);

  return {
    edgeDevices,
    displays,
    loadEdgeDevices,
    createDevice,
    updateDevice,
    deleteDevice,
    toggleDeviceActive,
    rebootDevice,
    loadDisplays,
  };
};

export default useSuperDevice;
