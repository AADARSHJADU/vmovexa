import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectAdminRoles,
  selectAdminPermissions,
  fetchRolesThunk,
  createRoleThunk,
  deleteRoleThunk,
  updateRoleThunk,
  fetchPermissionsThunk,
} from '../../store/slices/admin/roleSlice.js';

export const useAdminRole = () => {
  const dispatch    = useAppDispatch();
  const roles       = useAppSelector(selectAdminRoles);
  const permissions = useAppSelector(selectAdminPermissions);

  const loadRoles       = useCallback(() => dispatch(fetchRolesThunk()).unwrap(),                                [dispatch]);
  const createRole      = useCallback((data) => dispatch(createRoleThunk(data)).unwrap(),                       [dispatch]);
  const deleteRole      = useCallback((id) => dispatch(deleteRoleThunk(id)).unwrap(),                           [dispatch]);
  const updateRole      = useCallback((id, permissionIds) => dispatch(updateRoleThunk({ id, permissionIds })).unwrap(), [dispatch]);
  const loadPermissions = useCallback(() => dispatch(fetchPermissionsThunk()).unwrap(),                          [dispatch]);

  return { roles, permissions, loadRoles, createRole, deleteRole, updateRole, loadPermissions };
};

export default useAdminRole;
