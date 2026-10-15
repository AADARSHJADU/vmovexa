import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import { useAuth } from '../useAuth.js';
import {
  selectSuperRoles,
  selectSuperPermissions,
  selectSuperPermModules,
  selectSuperRoleStatus,
  fetchRolesThunk,
  createRoleThunk,
  updateRoleThunk,
  deleteRoleThunk,
  updateRolePermissionsThunk,
  fetchPermissionsThunk,
  fetchPermissionModulesThunk,
} from '../../store/slices/superadmin/roleSlice.js';

export const useSuperRole = () => {
  const dispatch = useAppDispatch();
  const { hasPermission } = useAuth();

  const canViewRoles = hasPermission('rbac.roles.view');
  const canCreateRole = hasPermission('rbac.roles.create');
  const canUpdateRole = hasPermission('rbac.roles.update');
  const canDeleteRole = hasPermission('rbac.roles.delete');

  const roles             = useAppSelector(selectSuperRoles);
  const permissions       = useAppSelector(selectSuperPermissions);
  const permissionModules = useAppSelector(selectSuperPermModules);
  const status            = useAppSelector(selectSuperRoleStatus);
  const loading           = status === 'loading';

  const loadRoles             = useCallback(() => dispatch(fetchRolesThunk()).unwrap(),                                   [dispatch]);
  const createRole            = useCallback((data) => dispatch(createRoleThunk(data)).unwrap(),                           [dispatch]);
  const updateRole            = useCallback((id, data) => dispatch(updateRoleThunk({ id, data })).unwrap(),              [dispatch]);
  const deleteRole            = useCallback((id) => dispatch(deleteRoleThunk(id)).unwrap(),                               [dispatch]);
  const updateRolePermissions = useCallback((id, permissionIds) => dispatch(updateRolePermissionsThunk({ id, permissionIds })).unwrap(), [dispatch]);
  const loadPermissions       = useCallback(() => dispatch(fetchPermissionsThunk()).unwrap(),                              [dispatch]);
  const loadPermissionModules = useCallback(() => dispatch(fetchPermissionModulesThunk()).unwrap(),                        [dispatch]);

  return {
    roles,
    permissions,
    permissionModules,
    status,
    loading,
    loadRoles,
    createRole,
    updateRole,
    deleteRole,
    updateRolePermissions,
    loadPermissions,
    loadPermissionModules,
    canViewRoles,
    canCreateRole,
    canUpdateRole,
    canDeleteRole,
    can: hasPermission,
  };
};

export default useSuperRole;
