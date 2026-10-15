import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { UserPermissionSection } from '../../components/ui/UserPermissionSection';
import { useAdminUser } from '../../hooks/admin/useAdminUser';

export const AdminUserPermissionsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users, loadUsers, getUserPermissions, updateUserPermissions } = useAdminUser();
  const [targetUser, setTargetUser] = useState(null);

  useEffect(() => {
    if (!users || users.length === 0) {
      loadUsers().catch(() => {});
    }
  }, [loadUsers, users]);

  useEffect(() => {
    const userList = Array.isArray(users) ? users : (users?.items || users?.rows || []);
    if (userList.length > 0) {
      const found = userList.find((u) => String(u.id) === String(id));
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
      <Breadcrumb
        items={[
          { label: 'Tenant Admin', path: '/admin/dashboard' },
          { label: 'Users & Team', path: '/admin/users' },
          { label: `Permissions (${userName})` },
        ]}
      />

      {/* Permissions Section Component */}
      <UserPermissionSection
        userId={id}
        userName={userName}
        userEmail={userEmail}
        userRole={userRole}
        fetchPermissionsFn={getUserPermissions}
        updatePermissionsFn={updateUserPermissions}
        isTenantAdmin={true}
        onBack={() => navigate('/admin/users')}
      />
    </div>
  );
};

export default AdminUserPermissionsPage;
