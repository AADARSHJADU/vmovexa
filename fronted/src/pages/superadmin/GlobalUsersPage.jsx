import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { useSuperUser } from '../../hooks/superadmin/useSuperUser';
import { useSuperRole } from '../../hooks/superadmin/useSuperRole';
import { useOrganization } from '../../hooks/superadmin/useOrganization';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { UserPermissionSection } from '../../components/ui/UserPermissionSection';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ActionDropdown } from '../../components/ui/ActionDropdown';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const isActive = (status) => String(status || '').toLowerCase() === 'active';

export const formatRoleName = (role) => {
  if (!role) return 'No Role';
  const code = typeof role === 'object' ? (role.code || '') : String(role);
  const name = typeof role === 'object' ? (role.name || '') : String(role);
  const upperCode = code.toUpperCase();
  
  if (upperCode === 'ROLE-SUPER-ADMIN') return 'Super Admin';
  if (upperCode === 'ROLE-TENANT-ADMIN' || upperCode === 'TROLE-ADMIN') return 'Tenant Admin';
  if (upperCode === 'ROLE-FLEET-OPERATOR' || upperCode.includes('DEPOT-MANAGER')) return 'Fleet Operator';
  if (upperCode === 'ROLE-DRIVER') return 'Driver';
  if (upperCode === 'ROLE-CENTRAL-TECH') return 'Technician';
  if (upperCode === 'ROLE-ADVERTISER') return 'Advertiser';
  if (upperCode === 'ROLE-GOVT-AGENCY') return 'Government';
  if (upperCode === 'ROLE-FINANCE-OFFICER' || upperCode.includes('ACCOUNTANT')) return 'Finance Officer';
  
  return name.replace(/\s*\([^)]*\)/g, '').trim() || code;
};

export const GlobalUsersPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { hasPermission } = useAuth();
  const canDeleteUser = hasPermission('users.delete');
  const { users, pagination, loading, loadUsers, createUser, inviteUser, updateStatus, deleteUser, getUserPermissions, updateUserPermissions } = useSuperUser();
  const { roles, loadRoles } = useSuperRole();
  const { organizations, loadOrganizations } = useOrganization();
  const [permissionUser, setPermissionUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [refreshing, setRefreshing] = useState(false);

  const [roleFilter, setRoleFilter] = useState('All');
  const [tenantFilter, setTenantFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');

  const userList = users || [];
  const roleList = roles || [];
  const tenantList = organizations || [];

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [provisionMode, setProvisionMode] = useState('direct'); // 'direct' or 'invite'
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    roleId: '',
    tenantId: 'GLOBAL_PLATFORM',
    city: 'Bhopal Central Hub',
    certLevel: 'Level 2 Senior Diagnostic',
    companyName: '',
    agencyName: '',
    department: 'Urban Transit & Traffic Safety',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const getQueryParams = useCallback(() => {
    const params = { page: currentPage, limit: pageSize };
    if (debouncedSearch) params.search = debouncedSearch;
    if (statusFilter && statusFilter !== 'All') params.status = statusFilter;
    if (tenantFilter && tenantFilter !== 'All') params.organizationId = tenantFilter;
    if (roleFilter && roleFilter !== 'All') {
      if (roleFilter === 'FLEET_ALL') {
        params.roleCode = 'FLEET_ALL';
      } else if (!isNaN(Number(roleFilter))) {
        params.role_id = Number(roleFilter);
      } else {
        params.roleCode = roleFilter;
      }
    }
    return params;
  }, [currentPage, pageSize, debouncedSearch, statusFilter, tenantFilter, roleFilter]);

  useEffect(() => {
    const params = getQueryParams();
    loadUsers(params).catch(() => {});
  }, [getQueryParams, loadUsers]);

  useEffect(() => {
    loadRoles().catch(() => {});
    loadOrganizations().catch(() => {});
  }, [loadRoles, loadOrganizations]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadUsers(getQueryParams()),
        loadRoles(),
        loadOrganizations(),
      ]);
      toast.success('Users refreshed!');
    } catch (err) {
      toast.error('Failed to refresh users.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleRoleFilterChange = (role) => {
    setRoleFilter(role);
    setCurrentPage(1);
  };

  const handleTenantFilterChange = (tenant) => {
    setTenantFilter(tenant);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleCityFilterChange = (city) => {
    setCityFilter(city);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setRoleFilter('All');
    setTenantFilter('All');
    setStatusFilter('All');
    setCityFilter('All');
    setCurrentPage(1);
  };

  const availableCities = useMemo(() => {
    const set = new Set();
    userList.forEach((u) => {
      if (u.city) set.add(u.city);
    });
    return Array.from(set);
  }, [userList]);

  const filteredUsers = useMemo(() => {
    return userList.filter((u) => {
      // 1. City Filter
      if (cityFilter !== 'All') {
        if (String(u.city || '') !== cityFilter) return false;
      }
      return true;
    });
  }, [userList, cityFilter]);

  const activeFilterCount = (roleFilter !== 'All' ? 1 : 0) + 
    (tenantFilter !== 'All' ? 1 : 0) + 
    (statusFilter !== 'All' ? 1 : 0) + 
    (cityFilter !== 'All' ? 1 : 0) + 
    (searchQuery ? 1 : 0);

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = isActive(currentStatus) ? 'suspended' : 'active';
    try {
      await toast.promise(
        updateStatus(id, nextStatus).then(() => loadUsers(getQueryParams())),
        { loading: t('superadmin.users.toast_status_updating', 'Updating status...'), success: t('superadmin.users.toast_status_updated', 'User status updated!'), error: (e) => e.message || t('superadmin.users.toast_status_err', 'Failed to update status.') }
      );
    } catch (err) {}
  };

  const handleDeleteUser = async (id, name) => {
    if (!confirm(t('superadmin.users.confirm_delete_user', 'Are you sure you want to delete user {name}?', { name }))) return;
    try {
      await toast.promise(
        deleteUser(id).then(() => loadUsers(getQueryParams())),
        { loading: t('superadmin.users.toast_deleting_user', 'Deleting user...'), success: t('superadmin.users.toast_user_deleted', 'User deleted!'), error: (e) => e.message || t('superadmin.users.toast_delete_err', 'Failed to delete user.') }
      );
    } catch (err) {}
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    const effectiveRoleId = newUser.roleId ? Number(newUser.roleId) : roleList[0]?.id;
    const orgId = newUser.tenantId === 'GLOBAL_PLATFORM' ? null : Number(newUser.tenantId);

    try {
      if (provisionMode === 'direct') {
        const payload = {
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          password: newUser.password || 'Test@12345',
          roleId: effectiveRoleId,
          organizationId: orgId,
          city: newUser.city,
          certLevel: newUser.certLevel,
          companyName: newUser.companyName,
          agencyName: newUser.agencyName,
          department: newUser.department,
        };
        await toast.promise(
          createUser(payload).then(() => loadUsers(getQueryParams())),
          { loading: t('superadmin.users.toast_creating_user', 'Creating user account...'), success: t('superadmin.users.toast_user_created', 'User account created and active!'), error: (e) => e.message || t('superadmin.users.toast_create_err', 'Failed to create user.') }
        );
      } else {
        const payload = {
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          roleId: effectiveRoleId,
          organizationId: orgId,
        };
        await toast.promise(
          inviteUser(payload).then(() => loadUsers(getQueryParams())),
          { loading: t('superadmin.users.toast_sending_invite', 'Sending Invitation...'), success: t('superadmin.users.toast_invite_sent', 'Invitation link dispatched!'), error: (e) => e.message || t('superadmin.users.toast_invite_err', 'Failed to invite user.') }
        );
      }
      setShowInviteModal(false);
      setNewUser({
        name: '', email: '', phone: '', password: '', roleId: '', tenantId: 'GLOBAL_PLATFORM',
        city: 'Bhopal Central Hub', certLevel: 'Level 2 Senior Diagnostic', companyName: '',
        agencyName: '', department: 'Urban Transit & Traffic Safety',
      });
    } catch (err) {}
  };

  if (permissionUser) {
    return (
      <UserPermissionSection
        userId={permissionUser.id}
        userName={permissionUser.name}
        userEmail={permissionUser.email}
        userRole={permissionUser.role?.code || permissionUser.role?.name}
        fetchPermissionsFn={getUserPermissions}
        updatePermissionsFn={updateUserPermissions}
        isTenantAdmin={false}
        onBack={() => setPermissionUser(null)}
      />
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: t('nav.superadmin_dashboard', 'Super Admin'), path: '/superadmin/dashboard', icon: FleetIcons.Dashboard },
          { label: t('superadmin.users.title', 'Users') },
        ]}
        className="mb-1"
      />

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('superadmin.users.title', 'Users')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            {t('superadmin.users.subtitle', 'Manage user accounts, roles, organizations, and permissions.')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <RefreshButton
            onClick={handleRefresh}
            loading={loading || refreshing}
            title={t('superadmin.users.refresh_users_tooltip', 'Refresh users list')}
          />

          <Link
            to="/superadmin/roles"
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <FleetIcons.Shield className="w-4 h-4" />
            <span>{t('superadmin.users.roles_permissions_btn', 'Roles & Permissions')}</span>
          </Link>

          <Link
            to="/superadmin/activity"
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <FleetIcons.Clock className="w-4 h-4" />
            <span>{t('superadmin.users.activity_log_btn', 'Activity Log')}</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('superadmin.users.stat_total_users', 'Total Users')}</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {pagination?.total ?? userList.length} {t('superadmin.users.users_suffix', 'Users')}
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">{t('superadmin.users.stat_active_users', 'Active Users')}</span>
          <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
            {userList.filter((u) => isActive(u.status)).length} {t('common.active', 'Active')}
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">{t('superadmin.users.stat_total_roles', 'Total Roles')}</span>
          <div className="text-xl font-black text-blue-700 dark:text-blue-400 mt-1">
            {roleList.length || 8} {t('superadmin.users.roles_suffix', 'Roles')}
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">{t('superadmin.users.stat_security', 'Security')}</span>
          <div className="text-xl font-black text-purple-700 dark:text-purple-400 mt-1">
            {t('superadmin.users.stat_protected', 'Protected')}
          </div>
        </div>
      </div>

      {/* Quick Role Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider shrink-0 mr-1">
          Filters:
        </span>
        <button
          type="button"
          onClick={() => handleRoleFilterChange('All')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 border cursor-pointer ${
            roleFilter === 'All'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm dark:bg-white dark:text-slate-900'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
          }`}
        >
          {t('superadmin.users.filter_all_users', 'All Users')}
        </button>
        <button
          type="button"
          onClick={() => handleRoleFilterChange('ROLE-SUPER-ADMIN')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 border flex items-center gap-1.5 cursor-pointer ${
            roleFilter === 'ROLE-SUPER-ADMIN'
              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
          }`}
        >
          <span className="flex items-center gap-1.5"><FleetIcons.Crown className="w-3.5 h-3.5" /> {t('superadmin.users.chip_super_admin', 'Super Admin')}</span>
        </button>
        <button
          type="button"
          onClick={() => handleRoleFilterChange('ROLE-TENANT-ADMIN')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 border flex items-center gap-1.5 cursor-pointer ${
            roleFilter === 'ROLE-TENANT-ADMIN'
              ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
              : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800'
          }`}
        >
          <span className="flex items-center gap-1.5"><FleetIcons.Building className="w-3.5 h-3.5" /> {t('superadmin.users.chip_tenant_admins', 'Tenant Admins')}</span>
        </button>
        <button
          type="button"
          onClick={() => handleRoleFilterChange('ROLE-FLEET-OPERATOR')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 border flex items-center gap-1.5 cursor-pointer ${
            roleFilter === 'ROLE-FLEET-OPERATOR'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
              : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800'
          }`}
        >
          <span className="flex items-center gap-1.5"><FleetIcons.Package className="w-3.5 h-3.5" /> {t('superadmin.users.chip_fleet_operators', 'Fleet Operators')}</span>
        </button>
        <button
          type="button"
          onClick={() => handleRoleFilterChange('ROLE-DRIVER')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 border flex items-center gap-1.5 cursor-pointer ${
            roleFilter === 'ROLE-DRIVER'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
          }`}
        >
          <span className="flex items-center gap-1.5"><FleetIcons.Driver className="w-3.5 h-3.5" /> {t('superadmin.users.chip_drivers', 'Drivers')}</span>
        </button>
        <button
          type="button"
          onClick={() => handleRoleFilterChange('ROLE-CENTRAL-TECH')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 border flex items-center gap-1.5 cursor-pointer ${
            roleFilter === 'ROLE-CENTRAL-TECH'
              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
          }`}
        >
          <span className="flex items-center gap-1.5"><FleetIcons.Wrench className="w-3.5 h-3.5" /> {t('superadmin.users.chip_technicians', 'Technicians')}</span>
        </button>
        <button
          type="button"
          onClick={() => handleRoleFilterChange('ROLE-ADVERTISER')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 border flex items-center gap-1.5 cursor-pointer ${
            roleFilter === 'ROLE-ADVERTISER'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
          }`}
        >
          <span className="flex items-center gap-1.5"><FleetIcons.Megaphone className="w-3.5 h-3.5" /> {t('superadmin.users.chip_advertisers', 'Advertisers')}</span>
        </button>
        <button
          type="button"
          onClick={() => handleRoleFilterChange('ROLE-GOVT-AGENCY')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 border flex items-center gap-1.5 cursor-pointer ${
            roleFilter === 'ROLE-GOVT-AGENCY'
              ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
              : 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800'
          }`}
        >
          <span className="flex items-center gap-1.5"><FleetIcons.Landmark className="w-3.5 h-3.5" /> {t('superadmin.users.chip_government', 'Government')}</span>
        </button>
        <button
          type="button"
          onClick={() => handleRoleFilterChange('ROLE-FINANCE-OFFICER')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 border flex items-center gap-1.5 cursor-pointer ${
            roleFilter === 'ROLE-FINANCE-OFFICER'
              ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
              : 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800'
          }`}
        >
          <span className="flex items-center gap-1.5"><FleetIcons.CreditCard className="w-3.5 h-3.5" /> {t('superadmin.users.chip_finance', 'Finance')}</span>
        </button>
      </div>

      {/* Multi-Filter Toolbar Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm space-y-3">
        {/* Responsive Grid for Search + Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          
          {/* Search Box */}
          <div className="relative sm:col-span-2 lg:col-span-4">
            <FleetIcons.Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('superadmin.users.ph_search', 'Search name, email, phone...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/80 rounded-xl text-xs font-medium text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* 1. Organization Filter */}
          <div className="relative sm:col-span-1 lg:col-span-3">
            <select
              value={tenantFilter}
              onChange={(e) => handleTenantFilterChange(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/80 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="All">{t('superadmin.users.opt_all_orgs', 'All Organizations')}</option>
              <option value="GLOBAL_PLATFORM">{t('superadmin.users.opt_global_platform', 'Global (No Organization)')}</option>
              {tenantList.map((tItem) => (
                <option key={tItem.id} value={tItem.id}>{tItem.name}</option>
              ))}
            </select>
          </div>

          {/* 2. Role Filter */}
          <div className="relative sm:col-span-1 lg:col-span-3">
            <select
              value={roleFilter}
              onChange={(e) => handleRoleFilterChange(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/80 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="All">{t('superadmin.users.opt_all_roles', 'All Roles')}</option>
              <option value="ROLE-SUPER-ADMIN">{t('superadmin.users.role_super_admin', 'Super Admin')}</option>
              <option value="ROLE-TENANT-ADMIN">{t('superadmin.users.role_tenant_admin', 'Tenant Admin')}</option>
              <option value="ROLE-FLEET-OPERATOR">{t('superadmin.users.role_fleet_operator', 'Fleet Operator')}</option>
              <option value="ROLE-DRIVER">{t('superadmin.users.role_driver', 'Driver')}</option>
              <option value="ROLE-CENTRAL-TECH">{t('superadmin.users.role_technician', 'Technician')}</option>
              <option value="ROLE-ADVERTISER">{t('superadmin.users.role_advertiser', 'Advertiser')}</option>
              <option value="ROLE-GOVT-AGENCY">{t('superadmin.users.role_government', 'Government')}</option>
              <option value="ROLE-FINANCE-OFFICER">{t('superadmin.users.role_finance_officer', 'Finance Officer')}</option>
              {roleList
                .filter((r) => ![
                  'ROLE-SUPER-ADMIN', 'ROLE-TENANT-ADMIN', 'ROLE-FLEET-OPERATOR',
                  'ROLE-DRIVER', 'ROLE-CENTRAL-TECH', 'ROLE-ADVERTISER',
                  'ROLE-GOVT-AGENCY', 'ROLE-FINANCE-OFFICER'
                ].includes(r.code))
                .map((r) => (
                  <option key={r.id} value={r.code || r.id}>{formatRoleName(r)}</option>
                ))}
            </select>
          </div>

          {/* 3. Account Status Filter */}
          <div className="relative sm:col-span-1 lg:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/80 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="All">{t('superadmin.users.opt_all_statuses', 'All Statuses')}</option>
              <option value="active">{t('common.active', 'Active')}</option>
              <option value="suspended">{t('common.suspended', 'Suspended')}</option>
              <option value="pending_approval">{t('common.pending_approval', 'Pending Approval')}</option>
              <option value="awaiting_subscription">{t('common.awaiting_subscription', 'Awaiting Subscription')}</option>
            </select>
          </div>

        </div>

        {/* Second Row if City Filter or Reset Filters is Active */}
        {(availableCities.length > 0 || activeFilterCount > 0) && (
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-3 flex-wrap text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              {availableCities.length > 0 && (
                <div className="flex items-center gap-1.5 min-w-[160px]">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{t('superadmin.users.lbl_city', 'City:')}</span>
                  <select
                    value={cityFilter}
                    onChange={(e) => handleCityFilterChange(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/80 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
                  >
                    <option value="All">{t('superadmin.users.opt_all_cities', 'All Cities')}</option>
                    {availableCities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer"
              >
                <span>{t('superadmin.users.btn_clear_filters', 'Clear All Filters ({count})', { count: activeFilterCount })}</span>
              </button>
            )}
          </div>
        )}

        {/* Active Filters Summary Strip */}
        {activeFilterCount > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">{t('superadmin.users.lbl_active_filters', 'Active Filters:')}</span>
              
              {tenantFilter !== 'All' && (
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 text-[11px] font-bold flex items-center gap-1">
                  <span>{t('superadmin.users.filter_org_prefix', 'Org:')} {tenantFilter === 'GLOBAL_PLATFORM' ? t('common.global', 'Global') : (tenantList.find(t => String(t.id) === String(tenantFilter))?.name || tenantFilter)}</span>
                  <button type="button" onClick={() => handleTenantFilterChange('All')} className="hover:text-blue-900 dark:hover:text-blue-200 cursor-pointer"><FleetIcons.Close className="w-2.5 h-2.5" /></button>
                </span>
              )}

              {roleFilter !== 'All' && (
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50 text-[11px] font-bold flex items-center gap-1">
                  <span>{t('superadmin.users.filter_role_prefix', 'Role:')} {formatRoleName(roleList.find(r => r.code === roleFilter || String(r.id) === String(roleFilter)) || roleFilter, t)}</span>
                  <button type="button" onClick={() => handleRoleFilterChange('All')} className="hover:text-purple-900 dark:hover:text-purple-200 cursor-pointer"><FleetIcons.Close className="w-2.5 h-2.5" /></button>
                </span>
              )}

              {statusFilter !== 'All' && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 text-[11px] font-bold flex items-center gap-1">
                  <span className="capitalize">{t('superadmin.users.filter_status_prefix', 'Status:')} {statusFilter}</span>
                  <button type="button" onClick={() => handleStatusFilterChange('All')} className="hover:text-emerald-900 dark:hover:text-emerald-200 cursor-pointer"><FleetIcons.Close className="w-2.5 h-2.5" /></button>
                </span>
              )}

              {cityFilter !== 'All' && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 text-[11px] font-bold flex items-center gap-1">
                  <span>{t('superadmin.users.filter_city_prefix', 'City:')} {cityFilter}</span>
                  <button type="button" onClick={() => handleCityFilterChange('All')} className="hover:text-amber-900 dark:hover:text-amber-200 cursor-pointer"><FleetIcons.Close className="w-2.5 h-2.5" /></button>
                </span>
              )}

              {searchQuery && (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[11px] font-bold flex items-center gap-1">
                  <span>{t('superadmin.users.filter_search_prefix', 'Search:')} "{searchQuery}"</span>
                  <button type="button" onClick={() => setSearchQuery('')} className="hover:text-slate-900 dark:hover:text-white cursor-pointer"><FleetIcons.Close className="w-2.5 h-2.5" /></button>
                </span>
              )}
            </div>

            <span className="text-slate-500 dark:text-zinc-400 font-bold text-xs">
              {t('superadmin.users.showing_users_count', 'Showing {filtered} of {total} Users', { filtered: filteredUsers.length, total: pagination?.total ?? userList.length })}
            </span>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full min-w-[750px] text-left text-xs text-slate-700 dark:text-zinc-300">
            <thead className="bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">{t('superadmin.users.th_user', 'User')}</th>
                <th className="py-3 px-4">{t('superadmin.users.th_role', 'Role')}</th>
                <th className="py-3 px-4">{t('superadmin.users.th_organization', 'Organization')}</th>
                <th className="py-3 px-4">{t('superadmin.users.th_status', 'Status')}</th>
                <th className="py-3 px-4 text-right">{t('superadmin.users.th_actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 px-4 text-center text-slate-400 dark:text-zinc-500 font-medium">
                    {loading ? t('superadmin.users.loading_users', 'Loading users…') : t('superadmin.users.no_users_found', 'No users found.')}
                  </td>
                </tr>
              )}
              {filteredUsers.map((u) => {
                const roleName = formatRoleName(u.role, t);
                const roleCode = typeof u.role === 'object' && u.role !== null ? (u.role.code || '') : (u.roleCode || '');
                const tenantName = typeof u.organization === 'object' && u.organization !== null
                  ? (u.organization.name || u.organization.code)
                  : typeof u.tenantName === 'object' && u.tenantName !== null
                  ? (u.tenantName.name || u.tenantName.id)
                  : (u.tenantName || u.organization_name || 'Global (VMOVEXA)');
                const tenantId = typeof u.organization === 'object' && u.organization !== null
                  ? (u.organization.code || u.organization.id)
                  : (u.tenantId || u.organization_id || 'Platform');

                return (
                  <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                      <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                        {u.email || t('superadmin.users.no_email', 'No email')} {u.phone ? `· ${u.phone}` : ''}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-zinc-100 block">{roleName}</span>
                      {roleCode && (
                        <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400">{roleCode}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 dark:text-zinc-200 block truncate max-w-xs">{tenantName}</span>
                      {tenantId && tenantId !== 'Platform' && (
                        <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">{tenantId}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border capitalize ${
                          isActive(u.status)
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800'
                            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-400 dark:border-red-800'
                        }`}
                      >
                        {u.status || 'inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end">
                        <ActionDropdown buttonTitle={`Actions for ${u.name}`} menuWidth="w-48">
                          {({ close }) => (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  close();
                                  navigate(`/superadmin/users/${u.id}/permissions`);
                                }}
                                className="w-full px-3.5 py-2 text-left text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <FleetIcons.Shield className="w-4 h-4 text-slate-500" />
                                <span>{t('superadmin.users.action_permissions', 'Permissions')}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  close();
                                  toast.success(t('superadmin.users.toast_password_reset_sent', 'Password reset link dispatched to {email}', { email: u.email }));
                                }}
                                className="w-full px-3.5 py-2 text-left text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <FleetIcons.Key className="w-4 h-4 text-slate-500" />
                                <span>{t('superadmin.users.action_reset_password', 'Reset Password')}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  close();
                                  handleToggleStatus(u.id, u.status);
                                }}
                                className={`w-full px-3.5 py-2 text-left text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                                  isActive(u.status)
                                    ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                    : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                }`}
                              >
                                {isActive(u.status) ? (
                                  <FleetIcons.Ban className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                ) : (
                                  <FleetIcons.Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                )}
                                <span>{isActive(u.status) ? t('superadmin.users.action_suspend', 'Suspend User') : t('superadmin.users.action_activate', 'Activate User')}</span>
                              </button>

                              <div className="my-1 border-t border-slate-100 dark:border-zinc-800" />

                              {canDeleteUser && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    close();
                                    handleDeleteUser(u.id, u.name);
                                  }}
                                  className="w-full px-3.5 py-2 text-left text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 transition-colors cursor-pointer"
                                >
                                  <FleetIcons.Trash className="w-4 h-4 text-rose-500" />
                                  <span>{t('superadmin.users.action_delete', 'Delete User')}</span>
                                </button>
                              )}
                            </>
                          )}
                        </ActionDropdown>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Global Pagination */}
        <div className="p-3 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <Pagination
            currentPage={pagination?.page || currentPage}
            totalPages={pagination?.totalPages || 1}
            totalItems={pagination?.total ?? userList.length}
            pageSize={pagination?.limit || pageSize}
            onPageChange={(p) => setCurrentPage(p)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            pageSizeOptions={[6, 10, 20, 50]}
          />
        </div>
      </div>

      {/* Add New User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('superadmin.users.modal_add_title', 'Add New User')}</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 font-bold cursor-pointer">
                ✕
              </button>
            </div>

            {/* Mode Selector Tabs */}
            <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setProvisionMode('direct')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  provisionMode === 'direct'
                    ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                <span className="flex items-center justify-center gap-1.5"><FleetIcons.Zap className="w-3.5 h-3.5 text-amber-500" /> {t('superadmin.users.tab_direct_add', 'Direct Add (Instant Active)')}</span>
              </button>
              <button
                type="button"
                onClick={() => setProvisionMode('invite')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  provisionMode === 'invite'
                    ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                <span className="flex items-center justify-center gap-1.5"><FleetIcons.Mail className="w-3.5 h-3.5 text-indigo-500" /> {t('superadmin.users.tab_send_invite', 'Send Invite Link')}</span>
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('superadmin.users.lbl_full_name', 'Full Name *')}</label>
                  <input
                    type="text"
                    required
                    placeholder={t('superadmin.users.ph_full_name', 'e.g. Anand Sharma')}
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('superadmin.users.lbl_email', 'Email Address *')}</label>
                  <input
                    type="email"
                    required
                    placeholder="user@vmovexa.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('superadmin.users.lbl_phone', 'Phone Number *')}</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98200 00000"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none"
                  />
                </div>

                {provisionMode === 'direct' && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('superadmin.users.lbl_password', 'Password (Default: Test@12345)')}</label>
                    <input
                      type="text"
                      placeholder={t('superadmin.users.ph_password', 'Leave blank for default password')}
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('superadmin.users.lbl_role', 'Role *')}</label>
                  <select
                    value={newUser.roleId}
                    onChange={(e) => setNewUser({ ...newUser, roleId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none cursor-pointer"
                  >
                    {roleList.map((r) => (
                      <option key={r.id} value={r.id}>{formatRoleName(r)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('superadmin.users.lbl_organization', 'Organization *')}</label>
                  <select
                    value={newUser.tenantId}
                    onChange={(e) => setNewUser({ ...newUser, tenantId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none cursor-pointer"
                  >
                    <option value="GLOBAL_PLATFORM">{t('superadmin.users.opt_global_platform', 'Global (No Organization)')}</option>
                    {tenantList.map((tenant) => (
                      <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                    ))}
                  </select>
                </div>

                {/* Role Specific Dynamic Fields */}
                {(() => {
                  const selRole = roleList.find((r) => String(r.id) === String(newUser.roleId)) || roleList[0];
                  const code = String(selRole?.code || '').toUpperCase();
                  if (code.includes('TECH')) {
                    return (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('superadmin.users.lbl_base_city', 'Base City')}</label>
                          <input
                            type="text"
                            placeholder={t('superadmin.users.ph_base_city', 'e.g. Bhopal Central Hub')}
                            value={newUser.city}
                            onChange={(e) => setNewUser({ ...newUser, city: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-zinc-100 focus:bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('superadmin.users.lbl_cert_tier', 'Certification Tier')}</label>
                          <select
                            value={newUser.certLevel}
                            onChange={(e) => setNewUser({ ...newUser, certLevel: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 focus:bg-white focus:outline-none cursor-pointer"
                          >
                            <option value="Level 1 Field Assistant">{t('superadmin.users.cert_level_1', 'Level 1 Field Assistant')}</option>
                            <option value="Level 2 Senior Diagnostic">{t('superadmin.users.cert_level_2', 'Level 2 Senior Diagnostic')}</option>
                            <option value="Level 3 Master Specialist">{t('superadmin.users.cert_level_3', 'Level 3 Master Specialist')}</option>
                          </select>
                        </div>
                      </>
                    );
                  }
                  if (code.includes('ADVERTISER')) {
                    return (
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('superadmin.users.lbl_company_name', 'Company / Brand Name')}</label>
                        <input
                          type="text"
                          placeholder={t('superadmin.users.ph_company_name', 'e.g. Tata Motors / Airtel')}
                          value={newUser.companyName}
                          onChange={(e) => setNewUser({ ...newUser, companyName: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-zinc-100 focus:bg-white focus:outline-none"
                        />
                      </div>
                    );
                  }
                  if (code.includes('GOVT')) {
                    return (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('superadmin.users.lbl_agency_name', 'Agency Name')}</label>
                          <input
                            type="text"
                            placeholder={t('superadmin.users.ph_agency_name', 'e.g. Bhopal Smart City Authority')}
                            value={newUser.agencyName}
                            onChange={(e) => setNewUser({ ...newUser, agencyName: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-zinc-100 focus:bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('superadmin.users.lbl_department', 'Department')}</label>
                          <input
                            type="text"
                            placeholder={t('superadmin.users.ph_department', 'e.g. Traffic & Transit Safety')}
                            value={newUser.department}
                            onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-zinc-100 focus:bg-white focus:outline-none"
                          />
                        </div>
                      </>
                    );
                  }
                  return null;
                })()}
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-xl text-xs text-blue-900 dark:text-blue-300">
                {provisionMode === 'direct'
                  ? t('superadmin.users.direct_provision_hint', 'Account will be created immediately with active status and password.')
                  : t('superadmin.users.invite_provision_hint', 'An invitation link will be sent to the user to set up their password.')}
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl text-center cursor-pointer"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm text-center cursor-pointer"
                >
                  {provisionMode === 'direct' ? t('superadmin.users.btn_create_user', 'Create User') : t('superadmin.users.btn_send_invitation', 'Send Invitation')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
