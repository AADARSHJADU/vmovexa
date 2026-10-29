/**
 * ProtectedRoute — gate for any authenticated area.
 * Waits for the initial /me bootstrap, then: no user → redirect to /login (remembering where).
 * Renders nested routes via <Outlet/>.
 */
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute() {
  const { isAuthenticated, bootstrapped } = useAuth();
  const location = useLocation();

  // Still checking the session (initial /me) — avoid a flash of /login.
  if (!bootstrapped) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0d14] text-slate-300 text-sm">
        Loading session…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
