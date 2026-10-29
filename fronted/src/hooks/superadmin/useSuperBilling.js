import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import { useAuth } from '../useAuth.js';
import {
  selectSuperRevenueSummary,
  selectSuperSettlements,
  selectSuperTopTenants,
  fetchRevenueSummaryThunk,
  fetchSettlementsThunk,
  fetchTopTenantsThunk,
} from '../../store/slices/superadmin/billingSlice.js';

export const useSuperBilling = () => {
  const dispatch = useAppDispatch();
  const { hasPermission } = useAuth();

  const canViewPlans = hasPermission('billing.plans.view');
  const canManagePlans = hasPermission('billing.plans.manage');
  const canViewSubscriptions = hasPermission('billing.subscriptions.view');
  const canManageSubscriptions = hasPermission('billing.subscriptions.manage');
  const canViewTransactions = hasPermission('billing.transactions.view');

  const revenueSummary = useAppSelector(selectSuperRevenueSummary);
  const settlements = useAppSelector(selectSuperSettlements);
  const topTenants = useAppSelector(selectSuperTopTenants);

  const loadRevenueSummary = useCallback((params) => dispatch(fetchRevenueSummaryThunk(params)).unwrap(), [dispatch]);
  const loadSettlements = useCallback((params) => dispatch(fetchSettlementsThunk(params)).unwrap(), [dispatch]);
  const loadTopTenants = useCallback((params) => dispatch(fetchTopTenantsThunk(params)).unwrap(), [dispatch]);

  return {
    revenueSummary,
    settlements,
    topTenants,
    loadRevenueSummary,
    loadSettlements,
    loadTopTenants,
    canViewPlans,
    canManagePlans,
    canViewSubscriptions,
    canManageSubscriptions,
    canViewTransactions,
    can: hasPermission,
  };
};

export default useSuperBilling;
