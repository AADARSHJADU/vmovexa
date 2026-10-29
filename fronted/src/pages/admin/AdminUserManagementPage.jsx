import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Pagination } from '../../components/ui/Pagination';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { ActionDropdown } from '../../components/ui/ActionDropdown';
import { useAdminUser } from '../../hooks/admin/useAdminUser';
import { useAdminRole } from '../../hooks/admin/useAdminRole';
import { useAdminDepot } from '../../hooks/admin/useAdminDepot';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import { UserPermissionSection } from '../../components/ui/UserPermissionSection';

const formatDepotName = (depotVal) => {
  if (!depotVal) return 'All Depots';
  if (typeof depotVal === 'object') return depotVal.name || depotVal.code || 'All Depots';
  return String(depotVal);
};

export const AdminUserManagementPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const canDeleteUser = hasPermission('users.delete');
  const {
    users,
    pagination,
    loading,
    loadUsers,
    updateStatus,
    deleteUser,
    getUserPermissions,
    updateUserPermissions,
  } = useAdminUser();
  const { roles, loadRoles } = useAdminRole();
  const { depots, loadDepots } = useAdminDepot();

  const [permissionUser, setPermissionUser] = useState(null);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [depotFilter, setDepotFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);



  useEffect(() => {
    loadUsers({ page: 1, limit: 100 }).catch(() => {});
    loadRoles().catch(() => {});
    loadDepots().catch(() => {});
  }, [loadUsers, loadRoles, loadDepots]);

  const usersList = useMemo(() => {
    return Array.isArray(users) ? users : (users?.items || users?.rows || []);
  }, [users]);

  // Dynamically derive unique roles from users list (with fallback to RBAC roles)
  const dynamicRoles = useMemo(() => {
    const roleMap = new Map();

    usersList.forEach((u) => {
      const roleObj = typeof u.role === 'object' && u.role !== null ? u.role : null;
      const roleName = (roleObj?.name || (typeof u.role === 'string' ? u.role : '') || '').trim();
      if (roleName && !roleMap.has(roleName.toLowerCase())) {
        roleMap.set(roleName.toLowerCase(), {
          id: roleObj?.id ? String(roleObj.id) : roleName,
          name: roleName,
        });
      }
    });

    if (roleMap.size === 0) {
      const apiRoles = Array.isArray(roles) ? roles : (roles?.items || roles?.rows || []);
      apiRoles.forEach((r) => {
        if (r?.name && !roleMap.has(r.name.toLowerCase())) {
          roleMap.set(r.name.toLowerCase(), {
            id: String(r.id || r.name),
            name: r.name,
          });
        }
      });
    }

    return Array.from(roleMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [usersList, roles]);

  const depotsList = useMemo(() => {
    return Array.isArray(depots) ? depots : (depots?.items || depots?.rows || []);
  }, [depots]);

  const orgName = user?.organization?.name || user?.org?.name || 'Organization';

  // Comprehensive UI Filter Logic
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const userName = String(u.name || '').toLowerCase();
      const userEmail = String(u.email || '').toLowerCase();
      const userPhone = String(u.phone || '').toLowerCase();
      const depotName = formatDepotName(u.depot).toLowerCase();

      const matchesSearch =
        !q ||
        userName.includes(q) ||
        userEmail.includes(q) ||
        userPhone.includes(q) ||
        depotName.includes(q) ||
        String(u.id).toLowerCase().includes(q);

      // Role Filter (matching dynamic role name, id, or code)
      const roleObj = typeof u.role === 'object' && u.role !== null ? u.role : null;
      const userRoleName = String(roleObj?.name || (typeof u.role === 'string' ? u.role : '') || '').toLowerCase().trim();
      const userRoleId = String(roleObj?.id || u.roleId || u.role_id || '');
      const userRoleCode = String(roleObj?.code || '').toLowerCase().trim();

      const matchesRole =
        roleFilter === 'All' ||
        userRoleName === roleFilter.toLowerCase() ||
        userRoleId === String(roleFilter) ||
        userRoleCode === roleFilter.toLowerCase();

      // Depot Filter
      const matchesDepot =
        depotFilter === 'All' ||
        depotName.includes(depotFilter.toLowerCase());

      // Status Filter
      const st = String(u.status || 'Active').toLowerCase();
      const matchesStatus =
        statusFilter === 'All' || st === statusFilter.toLowerCase();

      return matchesSearch && matchesRole && matchesDepot && matchesStatus;
    });
  }, [usersList, searchQuery, roleFilter, depotFilter, statusFilter]);

  // Client-Side Pagination Slicing for Smooth UI
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

  const resetFilters = () => {
    setSearchQuery('');
    setRoleFilter('All');
    setDepotFilter('All');
    setStatusFilter('All');
    setCurrentPage(1);
  };



  const handleToggleStatus = async (u) => {
    const isCurrentlyActive = String(u.status || '').toLowerCase() === 'active';
    const nextStatus = isCurrentlyActive ? 'suspended' : 'active';

    try {
      await toast.promise(updateStatus(u.id, nextStatus), {
        loading: 'Updating user status...',
        success: `User status changed to ${nextStatus}`,
        error: (err) => err?.message || 'Failed to update user status',
      });
      await loadUsers({ page: 1, limit: 100 }).catch(() => {});
    } catch {
      /* handled by toast */
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Are you sure you want to delete user ${u.name}?`)) return;
    try {
      await toast.promise(deleteUser(u.id), {
        loading: 'Deleting user...',
        success: 'User deleted successfully',
        error: (err) => err?.message || 'Failed to delete user',
      });
      await loadUsers({ page: 1, limit: 100 }).catch(() => {});
    } catch {
      /* handled by toast */
    }
  };

  if (permissionUser) {
    return (
      <UserPermissionSection
        userId={permissionUser.id}
        userName={permissionUser.name}
        userEmail={permissionUser.email}
        userRole={
          typeof permissionUser.role === 'object' && permissionUser.role !== null
            ? permissionUser.role.name || permissionUser.role.code
            : permissionUser.role || permissionUser.roleId
        }
        fetchPermissionsFn={getUserPermissions}
        updatePermissionsFn={updateUserPermissions}
        isTenantAdmin={true}
        onBack={() => setPermissionUser(null)}
      />
    );
  }

  // Count active users
  const activeCount = usersList.filter((u) => String(u.status || 'Active').toLowerCase() === 'active').length;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-20">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'Tenant Admin', path: '/admin/dashboard' },
              { label: t('admin.users.users_and_team') },
            ]}
            className="mb-2"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {orgName}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Users & Team
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
            {t('admin.users.desc')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            to="/admin/activity"
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
          >
            <FleetIcons.Clock className="w-4 h-4 text-slate-500" />
            <span>{t('admin.users.activity_logs')}</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('admin.users.total_users')}</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{usersList.length}</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{t('admin.users.active_users')}</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{activeCount}</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{t('admin.users.total_depots')}</span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{depotsList.length}</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">{t('admin.users.total_roles')}</span>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{dynamicRoles.length}</div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-1">
            <FleetIcons.Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('admin.users.search_ph')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* Dynamic Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="All">{t('admin.users.all_roles')}</option>
              {dynamicRoles.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Depot Filter */}
          <div>
            <select
              value={depotFilter}
              onChange={(e) => {
                setDepotFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="All">{t('admin.users.all_depots')}</option>
              {depotsList.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="All">{t('admin.users.all_statuses')}</option>
              <option value="active">{t('admin.users.status_active')}</option>
              <option value="suspended">{t('admin.users.status_suspended')}</option>
            </select>
          </div>
        </div>

        {/* Reset Filters Link */}
        {(searchQuery || roleFilter !== 'All' || depotFilter !== 'All' || statusFilter !== 'All') && (
          <div className="flex justify-end pt-1 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-red-600 dark:text-red-400 font-bold hover:underline cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full min-w-[700px] text-left text-xs text-slate-700 dark:text-zinc-300">
            <thead className="bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">{t('admin.users.th_user_details')}</th>
                <th className="py-3 px-4">{t('admin.users.th_role')}</th>
                <th className="py-3 px-4">{t('admin.users.th_depot_loc')}</th>
                <th className="py-3 px-4">{t('admin.users.th_status')}</th>
                <th className="py-3 px-4 text-right">{t('admin.users.th_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 dark:text-zinc-500 font-medium">
                    No users match your filters
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  const roleObj = typeof u.role === 'object' && u.role !== null ? u.role : null;
                  const roleName = roleObj?.name || u.role || 'Member';
                  const isSuspended = String(u.status || '').toLowerCase() === 'suspended';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{u.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                          {u.email} {u.phone ? `· ${u.phone}` : ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 dark:text-white block">{roleName}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 dark:text-zinc-200 block">
                          {formatDepotName(u.depot)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            !isSuspended
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                              : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800'
                          }`}
                        >
                          {!isSuspended ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end">
                          <ActionDropdown buttonTitle={`Actions for ${u.name}`}>
                            {({ close }) => (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    close();
                                    navigate(`/admin/users/${u.id}/permissions`);
                                  }}
                                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
                                >
                                  <FleetIcons.Settings className="w-3.5 h-3.5 text-blue-600" />
                                  <span>{t('admin.users.permissions')}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleToggleStatus(u);
                                    close();
                                  }}
                                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
                                >
                                  <FleetIcons.CheckCircle className="w-3.5 h-3.5 text-amber-600" />
                                  <span>{!isSuspended ? 'Suspend User' : 'Activate User'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    toast.success('Password reset instructions sent');
                                    close();
                                  }}
                                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
                                >
                                  <FleetIcons.Lock className="w-3.5 h-3.5 text-slate-500" />
                                  <span>{t('admin.users.reset_password')}</span>
                                </button>
                                <div className="border-t border-slate-100 dark:border-zinc-800 my-1" />
                                {canDeleteUser && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleDelete(u);
                                      close();
                                    }}
                                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                                  >
                                    <FleetIcons.Trash className="w-3.5 h-3.5 text-rose-500" />
                                    <span>{t('admin.users.delete_user')}</span>
                                  </button>
                                )}
                              </>
                            )}
                          </ActionDropdown>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Global Standard Pagination */}
        <div className="p-3 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            pageSizeOptions={[6, 10, 20, 50]}
          />
        </div>
      </div>

    </div>
  );
};

export default AdminUserManagementPage;
