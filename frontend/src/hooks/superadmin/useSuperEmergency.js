import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectSuperEmergencyBroadcasts,
  fetchEmergencyBroadcastsThunk,
  createEmergencyBroadcastThunk,
  revokeEmergencyBroadcastThunk,
} from '../../store/slices/superadmin/emergencySlice.js';

export const useSuperEmergency = () => {
  const dispatch = useAppDispatch();
  const broadcasts = useAppSelector(selectSuperEmergencyBroadcasts);

  const loadBroadcasts = useCallback((params) => dispatch(fetchEmergencyBroadcastsThunk(params)).unwrap(), [dispatch]);
  const createBroadcast = useCallback((data) => dispatch(createEmergencyBroadcastThunk(data)).unwrap(), [dispatch]);
  const revokeBroadcast = useCallback((id) => dispatch(revokeEmergencyBroadcastThunk(id)).unwrap(), [dispatch]);

  return {
    broadcasts,
    loadBroadcasts,
    createBroadcast,
    revokeBroadcast,
  };
};

export default useSuperEmergency;
