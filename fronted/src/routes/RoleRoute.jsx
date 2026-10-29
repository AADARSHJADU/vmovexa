/**
 * RoleRoute — RBAC gate. Wrap a role's portal with <RoleRoute allow={[ROLE.X]}>.
 * If the logged-in user's role isn't allowed, redirect them to THEIR own dashboard.
 * Assumes it renders inside a ProtectedRoute (user already present).
 */
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLE, homeForRole } from '../constants/roles';

export function RoleRoute({ allow = [] }) {
  const { role } = useAuth();

  if (!role) return <Navigate to="/login" replace />;
  if (!allow.includes(role) && role !== ROLE.SUPER_ADMIN) {
    // Wrong portal for this role — send them home.
    return <Navigate to={homeForRole(role)} replace />;
  }
  return <Outlet />;
}

export default RoleRoute;
