import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import { useAuth } from '../useAuth.js';
import {
  selectSuperRoles,
  selectSuperRegistry,
  selectSuperRoleStatus,
  fetchRolesThunk,
  updateRolePermissionsThunk,
  fetchRegistryThunk,
} from '../../store/slices/superadmin/roleSlice.js';

/** Super Admin: the 8 fixed roles + permission registry. Roles cannot be created or deleted. */
export const useSuperRole = () => {
  const dispatch = useAppDispatch();
  const { isSuperAdmin } = useAuth();

  const roles = useAppSelector(selectSuperRoles);
  const registry = useAppSelector(selectSuperRegistry);
  const status = useAppSelector(selectSuperRoleStatus);
  const loading = status === 'loading';

  const loadRoles = useCallback(() => dispatch(fetchRolesThunk()).unwrap(), [dispatch]);
  const loadRegistry = useCallback(() => dispatch(fetchRegistryThunk()).unwrap(), [dispatch]);
  const updateRolePermissions = useCallback(
    (id, permissions) => dispatch(updateRolePermissionsThunk({ id, permissions })).unwrap(),
    [dispatch],
  );

  return {
    roles,
    registry,
    status,
    loading,
    loadRoles,
    loadRegistry,
    updateRolePermissions,
    canViewRoles: isSuperAdmin,
    canUpdateRole: isSuperAdmin,
  };
};

export default useSuperRole;
