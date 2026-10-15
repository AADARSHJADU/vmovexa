import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import { useAuth } from '../useAuth.js';
import {
  selectSuperOrganizations,
  selectSuperCurrentOrganization,
  selectSuperOrganizationLoading,
  selectSuperOrganizationPagination,
  selectSuperOrganizationCounts,
  fetchOrganizationsThunk,
  fetchOrganizationThunk,
  createOrganizationThunk,
  updateOrganizationThunk,
  updateOrganizationStatusThunk,
} from '../../store/slices/superadmin/organizationSlice.js';

export const useOrganization = () => {
  const dispatch = useAppDispatch();
  const { hasPermission } = useAuth();

  const canViewOrgs = hasPermission('orgs.view');
  const canCreateOrg = hasPermission('orgs.create');
  const canUpdateOrg = hasPermission('orgs.update');
  const canDeleteOrg = hasPermission('orgs.delete') || hasPermission('orgs.suspend');
  
  const organizations = useAppSelector(selectSuperOrganizations);
  const currentOrganization = useAppSelector(selectSuperCurrentOrganization);
  const loading = useAppSelector(selectSuperOrganizationLoading);
  const pagination = useAppSelector(selectSuperOrganizationPagination);
  const counts = useAppSelector(selectSuperOrganizationCounts);

  const loadOrganizations = useCallback((params) => dispatch(fetchOrganizationsThunk(params)).unwrap(), [dispatch]);
  const loadOrganization = useCallback((id) => dispatch(fetchOrganizationThunk(id)).unwrap(), [dispatch]);
  const createOrganization = useCallback((data) => dispatch(createOrganizationThunk(data)).unwrap(), [dispatch]);
  const updateOrganization = useCallback((id, data) => dispatch(updateOrganizationThunk({ id, data })).unwrap(), [dispatch]);
  const updateStatus = useCallback((id, status) => dispatch(updateOrganizationStatusThunk({ id, status })).unwrap(), [dispatch]);

  return {
    organizations,
    currentOrganization,
    loading,
    pagination,
    counts,
    loadOrganizations,
    loadOrganization,
    createOrganization,
    updateOrganization,
    updateStatus,
    canViewOrgs,
    canCreateOrg,
    canUpdateOrg,
    canDeleteOrg,
    can: hasPermission,
  };
};

export default useOrganization;
