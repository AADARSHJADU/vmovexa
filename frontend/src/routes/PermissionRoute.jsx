import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UnauthorizedPage } from '../pages/shared/UnauthorizedPage';

export function PermissionRoute({ permission }) {
  const { hasPermission, bootstrapped } = useAuth();

  if (!bootstrapped) {
    return null;
  }

  if (permission && !hasPermission(permission)) {
    return <UnauthorizedPage permission={permission} />;
  }

  return <Outlet />;
}

export default PermissionRoute;
