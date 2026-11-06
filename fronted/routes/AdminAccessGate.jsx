import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function AdminAccessGate() {
  const { user } = useAuth();
  const location = useLocation();
  const status = user?.status;
  const org = user?.organization;
  const orgStatus = org?.status;
  const sub = org?.subscription;

  // Tenant is pending approval if either user or their organization is in pending_approval
  const isPendingApproval = status === 'pending_approval' || orgStatus === 'pending_approval';

  // Tenant is awaiting subscription/payment if user is awaiting or organization is approved/awaiting_subscription
  const isAwaitingSubscription =
    status === 'awaiting_subscription' ||
    orgStatus === 'approved' ||
    orgStatus === 'awaiting_subscription';

  // Subscription is expired if status is 'expired', 'past_due', or current_period_end has passed
  const now = new Date();
  const isSubscriptionExpired = Boolean(
    sub && (
      sub.status === 'expired' ||
      sub.status === 'past_due' ||
      (sub.current_period_end && new Date(sub.current_period_end) <= now)
    )
  );

  const isPendingApprovalRoute = location.pathname === '/admin/pending-approval';
  const isSubscriptionRoute = location.pathname === '/admin/subscription';

  if (isPendingApproval && !isPendingApprovalRoute) {
    return <Navigate to="/admin/pending-approval" replace />;
  }

  // If tenant is awaiting initial subscription OR their subscription has expired:
  // Lock them strictly to /admin/subscription (the exact same plan purchase screen)!
  const requiresPlanPurchase = isAwaitingSubscription || isSubscriptionExpired;

  if (requiresPlanPurchase && !isSubscriptionRoute) {
    return <Navigate to={`/admin/subscription${location.search}`} replace />;
  }

  // If already approved, bounce away from pending-approval route
  if (!isPendingApproval && isPendingApprovalRoute) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Note: /admin/subscription is freely accessible to active admins for renewing or upgrading their plan.
  return <Outlet />;
}

export default AdminAccessGate;
