import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectGovBroadcasts,
  selectGovCampaigns,
  selectGovCurrentCampaign,
  selectGovAnalytics,
  selectGovMeta,
  selectGovBroadcastsMeta,
  selectGovLoading,
  selectGovError,
  fetchGovEmergencyBroadcastsThunk,
  createGovBroadcastThunk,
  revokeGovBroadcastThunk,
  approveGovBroadcastThunk,
  rejectGovBroadcastThunk,
  fetchGovCampaignsThunk,
  fetchGovCampaignByIdThunk,
  createGovCampaignThunk,
  updateGovCampaignThunk,
  deleteGovCampaignThunk,
  approveGovCampaignThunk,
  rejectGovCampaignThunk,
  fetchGovAnalyticsThunk,
} from '../../store/slices/government/governmentSlice.js';

export const useGovernmentRole = () => {
  const dispatch = useAppDispatch();

  const broadcasts = useAppSelector(selectGovBroadcasts);
  const campaigns = useAppSelector(selectGovCampaigns);
  const currentCampaign = useAppSelector(selectGovCurrentCampaign);
  const analytics = useAppSelector(selectGovAnalytics);
  const meta = useAppSelector(selectGovMeta);
  const broadcastsMeta = useAppSelector(selectGovBroadcastsMeta);
  const loading = useAppSelector(selectGovLoading);
  const error = useAppSelector(selectGovError);

  const loadCampaigns = useCallback((params) => dispatch(fetchGovCampaignsThunk(params)).unwrap(), [dispatch]);
  const loadCampaignById = useCallback((id) => dispatch(fetchGovCampaignByIdThunk(id)).unwrap(), [dispatch]);
  const createCampaign = useCallback((data) => dispatch(createGovCampaignThunk(data)).unwrap(), [dispatch]);
  const updateCampaign = useCallback((id, data) => dispatch(updateGovCampaignThunk({ id, data })).unwrap(), [dispatch]);
  const deleteCampaign = useCallback((id) => dispatch(deleteGovCampaignThunk(id)).unwrap(), [dispatch]);
  const approveCampaign = useCallback((id) => dispatch(approveGovCampaignThunk(id)).unwrap(), [dispatch]);
  const rejectCampaign = useCallback((id, reason) => dispatch(rejectGovCampaignThunk({ id, reason })).unwrap(), [dispatch]);

  const loadBroadcasts = useCallback((params) => dispatch(fetchGovEmergencyBroadcastsThunk(params)).unwrap(), [dispatch]);
  const createBroadcast = useCallback((data) => dispatch(createGovBroadcastThunk(data)).unwrap(), [dispatch]);
  const revokeBroadcast = useCallback((id) => dispatch(revokeGovBroadcastThunk(id)).unwrap(), [dispatch]);
  const approveBroadcast = useCallback((id) => dispatch(approveGovBroadcastThunk(id)).unwrap(), [dispatch]);
  const rejectBroadcast = useCallback((id, reason) => dispatch(rejectGovBroadcastThunk({ id, reason })).unwrap(), [dispatch]);

  const loadAgencyAnalytics = useCallback(() => dispatch(fetchGovAnalyticsThunk()).unwrap(), [dispatch]);

  return {
    broadcasts,
    campaigns,
    currentCampaign,
    analytics,
    meta,
    broadcastsMeta,
    loading,
    error,
    loadCampaigns,
    loadCampaignById,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    approveCampaign,
    rejectCampaign,
    loadBroadcasts,
    createBroadcast,
    revokeBroadcast,
    approveBroadcast,
    rejectBroadcast,
    loadAgencyAnalytics,
  };
};

export default useGovernmentRole;
