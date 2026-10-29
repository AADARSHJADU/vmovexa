import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function VerifiedDriverRoute() {
  const { user, bootstrapped } = useAuth();

  if (!bootstrapped) {
    return null;
  }

  const isDriverRole = user?.role?.code === 'ROLE-DRIVER' || user?.role === 'ROLE-DRIVER';
  if (!isDriverRole) {
    return <Outlet />;
  }

  const isPending = Boolean(
    user?.driver
      ? (!user.driver.documents_verified || user.driver.status === 'pending_approval' || user.driver.status === 'rejected' || user.driver.status === 'compliance_blocked')
      : (user?.status === 'pending_approval')
  );

  if (isPending) {
    return <Navigate to="/driver/dashboard" replace />;
  }

  return <Outlet />;
}

export default VerifiedDriverRoute;
