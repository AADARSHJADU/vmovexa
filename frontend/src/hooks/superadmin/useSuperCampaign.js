import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectSuperCampaigns,
  selectSuperApprovals,
  fetchCampaignsThunk,
  fetchApprovalsThunk,
  approveCampaignThunk,
  rejectCampaignThunk,
  shareSuperCampaignPaymentLinkThunk,
} from '../../store/slices/superadmin/campaignSlice.js';

export const useSuperCampaign = () => {
  const dispatch = useAppDispatch();
  const campaigns = useAppSelector(selectSuperCampaigns);
  const approvals = useAppSelector(selectSuperApprovals);

  const loadCampaigns = useCallback((params) => dispatch(fetchCampaignsThunk(params)).unwrap(), [dispatch]);
  const loadApprovals = useCallback((params) => dispatch(fetchApprovalsThunk(params)).unwrap(), [dispatch]);
  const approveCampaign = useCallback((approvalId, reason, campaignId) => dispatch(approveCampaignThunk({ approvalId, reason, campaignId })).unwrap(), [dispatch]);
  const rejectCampaign = useCallback((approvalId, reason, campaignId) => dispatch(rejectCampaignThunk({ approvalId, reason, campaignId })).unwrap(), [dispatch]);
  const sharePaymentLink = useCallback((id, data) => dispatch(shareSuperCampaignPaymentLinkThunk({ id, data })).unwrap(), [dispatch]);

  return {
    campaigns,
    approvals,
    loadCampaigns,
    loadApprovals,
    approveCampaign,
    rejectCampaign,
    sharePaymentLink,
  };
};

export default useSuperCampaign;
