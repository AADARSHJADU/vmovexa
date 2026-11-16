import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectAdminRoles,
  selectAdminRegistry,
  fetchRolesThunk,
  fetchRegistryThunk,
} from '../../store/slices/admin/roleSlice.js';

/** Tenant Admin: read-only list of assignable roles + the permission registry. */
export const useAdminRole = () => {
  const dispatch = useAppDispatch();
  const roles = useAppSelector(selectAdminRoles);
  const registry = useAppSelector(selectAdminRegistry);

  const loadRoles = useCallback(() => dispatch(fetchRolesThunk()).unwrap(), [dispatch]);
  const loadRegistry = useCallback(() => dispatch(fetchRegistryThunk()).unwrap(), [dispatch]);

  return { roles, registry, loadRoles, loadRegistry };
};

export default useAdminRole;
