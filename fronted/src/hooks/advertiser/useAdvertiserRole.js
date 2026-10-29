import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectAdvertiserCampaigns,
  selectAdvertiserFleetOptions,
  selectAdvertiserMeta,
  selectAdvertiserActiveCampaign,
  selectAdvertiserCampaignAnalytics,
  selectAdvertiserMqttStatus,
  selectAdvertiserWallet,
  selectAdvertiserInvoices,
  selectAdvertiserTransactions,
  selectAdvertiserReports,
  selectAdvertiserPaymentOrder,
  selectAdvertiserLoading,
  selectAdvertiserStatus,
  selectAdvertiserSlotAvailability,
  selectAdvertiserReviews,
  fetchAdvertiserCampaignsThunk,
  fetchFleetOptionsThunk,
  fetchAdvertiserCampaignDetailsThunk,
  fetchAdvertiserCampaignAnalyticsThunk,
  fetchMqttStatusThunk,
  createAdvertiserCampaignThunk,
  updateAdvertiserCampaignThunk,
  deleteAdvertiserCampaignThunk,
  submitAdvertiserCampaignThunk,
  verifyAdvertiserCampaignThunk,
  initiateCampaignPaymentThunk,
  confirmCampaignPaymentThunk,
  recordOfflinePaymentThunk,
  startAdvertiserCampaignThunk,
  stopAdvertiserCampaignThunk,
  endAdvertiserCampaignThunk,
  shareCampaignPaymentLinkThunk,
  fetchAdvertiserWalletThunk,
  fetchAdvertiserInvoicesThunk,
  fetchAdvertiserTransactionsThunk,
  fetchAdvertiserReportsThunk,
  generateAdvertiserReportThunk,
  fetchSlotAvailabilityThunk,
  fetchCampaignReviewsThunk,
  clearActiveCampaign,
} from '../../store/slices/advertiser/advertiserSlice.js';
import { useAuth } from '../useAuth.js';
import { advertiserService } from '../../api/services/advertiser/advertiser.service.js';

export const useAdvertiserRole = () => {
  const dispatch = useAppDispatch();
  const { hasPermission, user } = useAuth();

  const campaigns = useAppSelector(selectAdvertiserCampaigns);
  const fleetOptions = useAppSelector(selectAdvertiserFleetOptions);
  const meta = useAppSelector(selectAdvertiserMeta);
  const activeCampaign = useAppSelector(selectAdvertiserActiveCampaign);
  const campaignAnalytics = useAppSelector(selectAdvertiserCampaignAnalytics);
  const mqttStatus = useAppSelector(selectAdvertiserMqttStatus);
  const wallet = useAppSelector(selectAdvertiserWallet);
  const invoices = useAppSelector(selectAdvertiserInvoices);
  const transactions = useAppSelector(selectAdvertiserTransactions);
  const reports = useAppSelector(selectAdvertiserReports);
  const paymentOrder = useAppSelector(selectAdvertiserPaymentOrder);
  const loading = useAppSelector(selectAdvertiserLoading);
  const status = useAppSelector(selectAdvertiserStatus);
  const slotAvailability = useAppSelector(selectAdvertiserSlotAvailability);
  const reviews = useAppSelector(selectAdvertiserReviews);

  const loadCampaigns = useCallback((params) => dispatch(fetchAdvertiserCampaignsThunk(params)).unwrap(), [dispatch]);
  const loadFleetOptions = useCallback(() => dispatch(fetchFleetOptionsThunk()).unwrap(), [dispatch]);
  const loadCampaignDetails = useCallback((id) => dispatch(fetchAdvertiserCampaignDetailsThunk(id)).unwrap(), [dispatch]);
  const loadCampaignAnalytics = useCallback((id) => dispatch(fetchAdvertiserCampaignAnalyticsThunk(id)).unwrap(), [dispatch]);
  const loadMqttStatus = useCallback(() => dispatch(fetchMqttStatusThunk()).unwrap(), [dispatch]);
  const createCampaign = useCallback((data) => dispatch(createAdvertiserCampaignThunk(data)).unwrap(), [dispatch]);
  const updateCampaign = useCallback((id, data) => dispatch(updateAdvertiserCampaignThunk({ id, data })).unwrap(), [dispatch]);
  const deleteCampaign = useCallback((id) => dispatch(deleteAdvertiserCampaignThunk(id)).unwrap(), [dispatch]);
  const submitCampaign = useCallback((id) => dispatch(submitAdvertiserCampaignThunk(id)).unwrap(), [dispatch]);
  const verifyCampaign = useCallback((id) => dispatch(verifyAdvertiserCampaignThunk(id)).unwrap(), [dispatch]);
  const initiatePayment = useCallback((id) => dispatch(initiateCampaignPaymentThunk(id)).unwrap(), [dispatch]);
  const confirmPayment = useCallback((id, paymentData) => dispatch(confirmCampaignPaymentThunk({ id, paymentData })).unwrap(), [dispatch]);
  const recordOfflinePayment = useCallback((id, data) => dispatch(recordOfflinePaymentThunk({ id, data })).unwrap(), [dispatch]);
  const startCampaign = useCallback((id) => dispatch(startAdvertiserCampaignThunk(id)).unwrap(), [dispatch]);
  const stopCampaign = useCallback((id) => dispatch(stopAdvertiserCampaignThunk(id)).unwrap(), [dispatch]);
  const endCampaign = useCallback((id) => dispatch(endAdvertiserCampaignThunk(id)).unwrap(), [dispatch]);
  const sharePaymentLink = useCallback((id, data) => dispatch(shareCampaignPaymentLinkThunk({ id, data })).unwrap(), [dispatch]);

  const loadWallet = useCallback(() => dispatch(fetchAdvertiserWalletThunk()).unwrap(), [dispatch]);
  const loadInvoices = useCallback(() => dispatch(fetchAdvertiserInvoicesThunk()).unwrap(), [dispatch]);
  const loadTransactions = useCallback((params) => dispatch(fetchAdvertiserTransactionsThunk(params)).unwrap(), [dispatch]);
  const loadReports = useCallback(() => dispatch(fetchAdvertiserReportsThunk()).unwrap(), [dispatch]);
  const generateReport = useCallback((data) => dispatch(generateAdvertiserReportThunk(data)).unwrap(), [dispatch]);
  const loadSlotAvailability = useCallback((params) => dispatch(fetchSlotAvailabilityThunk(params)).unwrap(), [dispatch]);
  const loadCampaignReviews = useCallback((id) => dispatch(fetchCampaignReviewsThunk(id)).unwrap(), [dispatch]);
  const resetActiveCampaign = useCallback(() => dispatch(clearActiveCampaign()), [dispatch]);

  // Permission helpers
  const canCreateCampaign = hasPermission('campaigns.create');
  const canEditCampaign = hasPermission('campaigns.update');
  const canDeleteCampaign = hasPermission('campaigns.delete');
  const canSubmitCampaign = hasPermission('campaigns.submit');
  const canVerifyCampaign = hasPermission('campaigns.verify') || hasPermission('campaigns.approve');
  const canPayCampaign = hasPermission('campaigns.pay');

  return {
    user,
    campaigns,
    fleetOptions,
    meta,
    activeCampaign,
    campaignAnalytics,
    mqttStatus,
    wallet,
    invoices,
    transactions,
    reports,
    paymentOrder,
    slotAvailability,
    reviews,
    loading,
    status,
    loadCampaigns,
    loadFleetOptions,
    loadCampaignDetails,
    loadCampaignAnalytics,
    loadMqttStatus,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    submitCampaign,
    verifyCampaign,
    initiatePayment,
    confirmPayment,
    recordOfflinePayment,
    payInvoice: useCallback((id, data) => advertiserService.payInvoice(id, data), []),
    startCampaign,
    stopCampaign,
    endCampaign,
    sharePaymentLink,
    loadWallet,
    loadInvoices,
    loadTransactions,
    loadReports,
    generateReport,
    loadSlotAvailability,
    loadCampaignReviews,
    resetActiveCampaign,
    canCreateCampaign,
    canEditCampaign,
    canDeleteCampaign,
    canSubmitCampaign,
    canVerifyCampaign,
    canPayCampaign,
    can: hasPermission,
  };
};

export default useAdvertiserRole;
