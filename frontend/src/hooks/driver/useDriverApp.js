import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectDriverProfile,
  selectDriverSchedule,
  selectDriverActiveRoute,
  selectDriverTrips,
  selectDriverDocuments,
  selectDriverIncidents,
  fetchDriverProfileThunk,
  fetchDriverScheduleThunk,
  fetchDriverActiveRouteThunk,
  fetchDriverTripsThunk,
  fetchDriverDocumentsThunk,
  uploadDriverDocumentThunk,
  deleteDriverDocumentThunk,
  fetchDriverIncidentsThunk,
  fetchDriverIncidentByIdThunk,
  reportDriverIncidentThunk,
  updateDriverDutyStatusThunk,
} from '../../store/slices/driver/driverSlice.js';

export const useDriverApp = () => {
  const dispatch = useAppDispatch();

  const profile = useAppSelector(selectDriverProfile);
  const schedule = useAppSelector(selectDriverSchedule);
  const activeRoute = useAppSelector(selectDriverActiveRoute);
  const trips = useAppSelector(selectDriverTrips);
  const documents = useAppSelector(selectDriverDocuments);
  const incidents = useAppSelector(selectDriverIncidents);

  const loadProfile = useCallback(() => dispatch(fetchDriverProfileThunk()).unwrap(), [dispatch]);
  const loadSchedule = useCallback(() => dispatch(fetchDriverScheduleThunk()).unwrap(), [dispatch]);
  const loadActiveRoute = useCallback(() => dispatch(fetchDriverActiveRouteThunk()).unwrap(), [dispatch]);
  const loadTrips = useCallback(() => dispatch(fetchDriverTripsThunk()).unwrap(), [dispatch]);
  const loadDocuments = useCallback(() => dispatch(fetchDriverDocumentsThunk()).unwrap(), [dispatch]);
  const uploadDocument = useCallback((data) => dispatch(uploadDriverDocumentThunk(data)).unwrap(), [dispatch]);
  const deleteDocument = useCallback((id) => dispatch(deleteDriverDocumentThunk(id)).unwrap(), [dispatch]);
  const loadIncidents = useCallback(() => dispatch(fetchDriverIncidentsThunk()).unwrap(), [dispatch]);
  const loadIncidentById = useCallback((id) => dispatch(fetchDriverIncidentByIdThunk(id)).unwrap(), [dispatch]);
  const reportIncident = useCallback((data) => dispatch(reportDriverIncidentThunk(data)).unwrap(), [dispatch]);
  const setDutyStatus = useCallback((status) => dispatch(updateDriverDutyStatusThunk(status)).unwrap(), [dispatch]);

  return {
    profile, schedule, activeRoute, trips, documents, incidents,
    loadProfile, loadSchedule, loadActiveRoute, loadTrips, loadDocuments,
    uploadDocument, deleteDocument, loadIncidents, loadIncidentById, reportIncident, setDutyStatus,
  };
};

export default useDriverApp;
