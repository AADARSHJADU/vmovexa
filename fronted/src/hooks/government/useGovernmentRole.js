import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectGovBroadcasts,
  selectGovCurrentBroadcast,
  selectGovCampaigns,
  selectGovCurrentCampaign,
  selectGovAnalytics,
  selectGovMqttStatus,
  selectGovMeta,
  selectGovBroadcastsMeta,
  selectGovLoading,
  selectGovError,
  fetchGovEmergencyBroadcastsThunk,
  fetchGovEmergencyBroadcastByIdThunk,
  createGovBroadcastThunk,
  updateGovBroadcastThunk,
  deleteGovBroadcastThunk,
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
  startGovCampaignThunk,
  stopGovCampaignThunk,
  endGovCampaignThunk,
  verifyGovCampaignThunk,
  fetchGovMqttStatusThunk,
  shareGovPaymentLinkThunk,
  recordGovOfflinePaymentThunk,
  fetchGovAnalyticsThunk,
} from '../../store/slices/government/governmentSlice.js';
import { useAuth } from '../useAuth.js';

export const useGovernmentRole = () => {
  const dispatch = useAppDispatch();
  const { hasPermission, user } = useAuth();

  const broadcasts = useAppSelector(selectGovBroadcasts);
  const currentBroadcast = useAppSelector(selectGovCurrentBroadcast);
  const campaigns = useAppSelector(selectGovCampaigns);
  const currentCampaign = useAppSelector(selectGovCurrentCampaign);
  const analytics = useAppSelector(selectGovAnalytics);
  const mqttStatus = useAppSelector(selectGovMqttStatus);
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
  const startCampaign = useCallback((id) => dispatch(startGovCampaignThunk(id)).unwrap(), [dispatch]);
  const stopCampaign = useCallback((id) => dispatch(stopGovCampaignThunk(id)).unwrap(), [dispatch]);
  const endCampaign = useCallback((id) => dispatch(endGovCampaignThunk(id)).unwrap(), [dispatch]);
  const verifyCampaign = useCallback((id) => dispatch(verifyGovCampaignThunk(id)).unwrap(), [dispatch]);
  const loadMqttStatus = useCallback(() => dispatch(fetchGovMqttStatusThunk()).unwrap(), [dispatch]);
  const sharePaymentLink = useCallback((id, data) => dispatch(shareGovPaymentLinkThunk({ id, data })).unwrap(), [dispatch]);
  const recordOfflinePayment = useCallback((id, data) => dispatch(recordGovOfflinePaymentThunk({ id, data })).unwrap(), [dispatch]);

  const loadBroadcasts = useCallback((params) => dispatch(fetchGovEmergencyBroadcastsThunk(params)).unwrap(), [dispatch]);
  const loadBroadcastById = useCallback((id) => dispatch(fetchGovEmergencyBroadcastByIdThunk(id)).unwrap(), [dispatch]);
  const createBroadcast = useCallback((data) => dispatch(createGovBroadcastThunk(data)).unwrap(), [dispatch]);
  const updateBroadcast = useCallback((id, data) => dispatch(updateGovBroadcastThunk({ id, data })).unwrap(), [dispatch]);
  const deleteBroadcast = useCallback((id) => dispatch(deleteGovBroadcastThunk(id)).unwrap(), [dispatch]);
  const revokeBroadcast = useCallback((id) => dispatch(revokeGovBroadcastThunk(id)).unwrap(), [dispatch]);
  const approveBroadcast = useCallback((id) => dispatch(approveGovBroadcastThunk(id)).unwrap(), [dispatch]);
  const rejectBroadcast = useCallback((id, reason) => dispatch(rejectGovBroadcastThunk({ id, reason })).unwrap(), [dispatch]);

  const loadAgencyAnalytics = useCallback(() => dispatch(fetchGovAnalyticsThunk()).unwrap(), [dispatch]);

  // Permission helpers
  const canCreateCampaign = hasPermission('campaigns.create') || hasPermission('government.campaigns.create');
  const canEditCampaign = hasPermission('campaigns.update') || hasPermission('government.campaigns.update');
  const canDeleteCampaign = hasPermission('campaigns.delete') || hasPermission('government.campaigns.delete');
  const canSubmitCampaign = hasPermission('campaigns.submit');
  const canVerifyCampaign = hasPermission('campaigns.verify') || hasPermission('campaigns.approve') || hasPermission('government.campaigns.approve');
  const canPayCampaign = hasPermission('campaigns.pay');

  return {
    user,
    broadcasts,
    currentBroadcast,
    campaigns,
    currentCampaign,
    analytics,
    mqttStatus,
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
    startCampaign,
    stopCampaign,
    endCampaign,
    verifyCampaign,
    loadMqttStatus,
    sharePaymentLink,
    recordOfflinePayment,
    loadBroadcasts,
    loadBroadcastById,
    createBroadcast,
    updateBroadcast,
    deleteBroadcast,
    revokeBroadcast,
    approveBroadcast,
    rejectBroadcast,
    loadAgencyAnalytics,
    canCreateCampaign,
    canEditCampaign,
    canDeleteCampaign,
    canSubmitCampaign,
    canVerifyCampaign,
    canPayCampaign,
  };
};

export default useGovernmentRole;
