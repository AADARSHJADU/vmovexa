import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { UserPermissionSection } from '../../components/ui/UserPermissionSection';
import { useSuperUser } from '../../hooks/superadmin/useSuperUser';
import { useTranslation } from '../../hooks/useTranslation';

export const SuperUserPermissionsPage = () => {
  const { t } = useTranslation();
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
      {/* Standard Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: t('ag.superadmin.superuserpermissionspage.super_admin', 'Super Admin'), path: '/superadmin/dashboard' },
          { label: t('ag.superadmin.superuserpermissionspage.global_users_directory', 'Global Users Directory'), path: '/superadmin/users' },
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
        isTenantAdmin={false}
        onBack={() => navigate('/superadmin/users')}
      />
    </div>
  );
};

export default SuperUserPermissionsPage;
