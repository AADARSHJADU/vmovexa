import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectFleetIncidents,
  selectSelectedIncident,
  selectIncidentLoading,
  selectSelectedIncidentLoading,
  fetchIncidentsThunk,
  createIncidentThunk,
  setIncidentStatusThunk,
  updateIncidentResolutionThunk,
  fetchIncidentByIdThunk,
  clearSelectedIncident,
} from '../../store/slices/fleet/incidentSlice.js';

export const useFleetIncident = () => {
  const dispatch = useAppDispatch();
  const incidents = useAppSelector(selectFleetIncidents);
  const selectedIncident = useAppSelector(selectSelectedIncident);
  const loading = useAppSelector(selectIncidentLoading);
  const selectedIncidentLoading = useAppSelector(selectSelectedIncidentLoading);

  const loadIncidents = useCallback((params) => dispatch(fetchIncidentsThunk(params)).unwrap(), [dispatch]);
  const createIncident = useCallback((data) => dispatch(createIncidentThunk(data)).unwrap(), [dispatch]);
  const setStatus = useCallback((id, status) => dispatch(setIncidentStatusThunk({ id, status })).unwrap(), [dispatch]);
  const updateResolution = useCallback((id, data) => dispatch(updateIncidentResolutionThunk({ id, data })).unwrap(), [dispatch]);
  const fetchIncidentById = useCallback((id) => dispatch(fetchIncidentByIdThunk(id)).unwrap(), [dispatch]);
  const clearSelected = useCallback(() => dispatch(clearSelectedIncident()), [dispatch]);

  return {
    incidents,
    selectedIncident,
    loading,
    selectedIncidentLoading,
    loadIncidents,
    createIncident,
    setStatus,
    updateResolution,
    fetchIncidentById,
    clearSelected,
  };
};

export default useFleetIncident;
