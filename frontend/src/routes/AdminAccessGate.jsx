import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function AdminAccessGate() {
  const { user } = useAuth();
  const location = useLocation();
  const status = user?.status;
  const org = user?.organization;
  const orgStatus = org?.status;

  // Tenant is pending approval if either user or their organization is in pending_approval
  const isPendingApproval = status === 'pending_approval' || orgStatus === 'pending_approval';

  // Tenant is awaiting subscription/payment if user is awaiting or organization is approved/awaiting_subscription
  const isAwaitingSubscription =
    status === 'awaiting_subscription' ||
    orgStatus === 'approved' ||
    orgStatus === 'awaiting_subscription';

  const isPendingApprovalRoute = location.pathname === '/admin/pending-approval';
  const isSubscriptionRoute = location.pathname === '/admin/subscription';

  if (isPendingApproval && !isPendingApprovalRoute) {
    return <Navigate to="/admin/pending-approval" replace />;
  }

  if (isAwaitingSubscription && !isSubscriptionRoute) {
    return <Navigate to={`/admin/subscription${location.search}`} replace />;
  }

  if (!isPendingApproval && !isAwaitingSubscription) {
    if (isPendingApprovalRoute || isSubscriptionRoute) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return <Outlet />;
}

export default AdminAccessGate;
