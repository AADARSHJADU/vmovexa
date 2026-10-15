import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import { UserPermissionSection } from '../../components/ui/UserPermissionSection';
import { useSuperUser } from '../../hooks/superadmin/useSuperUser';

export const SuperUserPermissionsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users, loadUsers, getUserPermissions, updateUserPermissions } = useSuperUser();
  const [targetUser, setTargetUser] = useState(null);

  useEffect(() => {
    if (!users || users.length === 0) {
      loadUsers().catch(() => {});
    }
  }, [loadUsers, users]);

  useEffect(() => {
    if (users && users.length > 0) {
      const found = users.find((u) => String(u.id) === String(id));
      if (found) {
        setTargetUser(found);
      }
    }
  }, [users, id]);

  const userName = targetUser?.name || `User #${id}`;
  const userEmail = targetUser?.email || '';
  const userRole = targetUser?.role?.code || targetUser?.role?.name || targetUser?.role || 'User';

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation with URL ID */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400">
        <Link to="/superadmin/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
          <FleetIcons.Dashboard className="w-3.5 h-3.5" />
          <span>Super Admin</span>
        </Link>
        <span className="text-slate-300 dark:text-zinc-600">/</span>
        <Link to="/superadmin/users" className="text-blue-600 dark:text-blue-400 hover:underline">
          Global Users Directory
        </Link>
        <span className="text-slate-300 dark:text-zinc-600">/</span>
        <span className="text-slate-900 dark:text-white font-bold">Permissions (ID: {id})</span>
      </nav>

      {/* Permissions Section Component */}
      <UserPermissionSection
        userId={id}
        userName={userName}
        userEmail={userEmail}
        userRole={userRole}
        fetchPermissionsFn={getUserPermissions}
        updatePermissionsFn={updateUserPermissions}
        isTenantAdmin={false}
        onBack={() => navigate('/superadmin/users')}
      />
    </div>
  );
};

export default SuperUserPermissionsPage;
