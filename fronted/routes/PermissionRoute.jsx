import { Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UnauthorizedPage } from '../pages/shared/UnauthorizedPage';

export function PermissionRoute({ permission }) {
  const { hasPermission, bootstrapped } = useAuth();

  if (!bootstrapped) {
    return null;
  }

  const allowed = Array.isArray(permission)
    ? permission.some((code) => hasPermission(code))
    : !permission || hasPermission(permission);

  if (!allowed) {
    return <UnauthorizedPage permission={permission} />;
  }

  return <Outlet />;
}

export default PermissionRoute;
