import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from '../../hooks/useTranslation';
import { PermissionMatrix } from '../rbac/PermissionMatrix';

/**
 * UserPermissionSection — per-user permissions, revoke-only.
 *
 * The user automatically has every permission of their role. This screen shows exactly those
 * permissions, all ticked. Un-tick one to revoke it for this user only; "Reset" restores the role default.
 *
 * Props are functions so the same screen serves Super Admin and Tenant Admin:
 *   fetchPermissionsFn(userId)          -> { role, wildcard, rolePermissions, denied, effective }
 *   updatePermissionsFn(userId, denied) -> same payload
 *   resetPermissionsFn(userId)          -> same payload
 *   loadRegistryFn()                    -> GET /permissions/registry
 */
export const UserPermissionSection = ({
  userId,
  userName,
  userEmail,
  fetchPermissionsFn,
  updatePermissionsFn,
  resetPermissionsFn,
  loadRegistryFn,
  onBack,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [registry, setRegistry] = useState(null);
  const [data, setData] = useState(null);
  const [granted, setGranted] = useState([]);

  const applyPayload = useCallback((payload) => {
    setData(payload);
    const denied = new Set(payload?.denied || []);
    setGranted((payload?.rolePermissions || []).filter((k) => !denied.has(k)));
  }, []);

  useEffect(() => {
    if (!userId) return undefined;
    let alive = true;
    setLoading(true);
    Promise.all([fetchPermissionsFn(userId), loadRegistryFn()])
      .then(([payload, reg]) => {
        if (!alive) return;
        setRegistry(reg);
        applyPayload(payload);
      })
      .catch((err) => toast.error(err?.message || t('rbac.user.load_failed', 'Failed to load user permissions')))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const rolePermissions = useMemo(() => data?.rolePermissions || [], [data]);
  const deniedDraft = useMemo(() => {
    const g = new Set(granted);
    return rolePermissions.filter((k) => !g.has(k));
  }, [granted, rolePermissions]);
  const savedDenied = useMemo(() => data?.denied || [], [data]);
  const dirty = useMemo(() => {
    const a = [...deniedDraft].sort().join('|');
    const b = [...savedDenied].sort().join('|');
    return a !== b;
  }, [deniedDraft, savedDenied]);

  const handleSave = async () => {
    setSaving(true);
    try {
      applyPayload(await updatePermissionsFn(userId, deniedDraft));
      toast.success(t('rbac.user.saved', 'Permissions updated'));
    } catch (err) {
      toast.error(err?.message || t('rbac.user.save_failed', 'Failed to update permissions'));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      applyPayload(await resetPermissionsFn(userId));
      toast.success(t('rbac.user.reset_done', 'Restored the role default permissions'));
    } catch (err) {
      toast.error(err?.message || t('rbac.user.save_failed', 'Failed to update permissions'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-sm text-slate-500" role="status">{t('rbac.user.loading', 'Loading permissions...')}</div>;
  }
  if (!data) {
    return <div className="p-8 text-sm text-red-600" role="alert">{t('rbac.user.load_failed', 'Failed to load user permissions')}</div>;
  }

  const portal = data.role?.portal;
  const roleName = data.role?.name || '';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{userName}</h1>
          <p className="text-sm text-slate-500">{userEmail}</p>
          <p className="mt-1 text-sm text-slate-600">
            {t('rbac.user.role', 'Role')}: <strong>{roleName}</strong>
          </p>
        </div>
        <div className="flex gap-2">
          {onBack && (
            <button type="button" onClick={onBack} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
              {t('common.back', 'Back')}
            </button>
          )}
          {!data.wildcard && (
            <>
              <button
                type="button"
                onClick={handleReset}
                disabled={saving || (savedDenied.length === 0 && !dirty)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {t('rbac.user.reset', 'Reset to role default')}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !dirty}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? t('common.saving', 'Saving...') : t('common.save_changes', 'Save changes')}
              </button>
            </>
          )}
        </div>
      </div>

      {data.wildcard ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800" role="note">
          {t('rbac.user.super_admin_note', 'Super Admin has access to everything. Permissions cannot be restricted for this role.')}
        </div>
      ) : (
        <>
          <dl className="grid grid-cols-3 gap-3" aria-label={t('rbac.user.summary', 'Permission summary')}>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <dt className="text-xs uppercase text-slate-500">{t('rbac.user.role_default', 'Role default')}</dt>
              <dd className="text-2xl font-bold text-slate-900">{rolePermissions.length}</dd>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <dt className="text-xs uppercase text-slate-500">{t('rbac.user.revoked', 'Revoked')}</dt>
              <dd className="text-2xl font-bold text-red-600">{deniedDraft.length}</dd>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <dt className="text-xs uppercase text-slate-500">{t('rbac.user.effective', 'Effective')}</dt>
              <dd className="text-2xl font-bold text-emerald-600">{granted.length}</dd>
            </div>
          </dl>
          <p className="text-sm text-slate-600">
            {t('rbac.user.hint', 'This user automatically gets all permissions of their role. Un-tick a permission to revoke it for this user only.')}
          </p>
          <PermissionMatrix
            portal={portal}
            registry={registry}
            granted={granted}
            allowed={rolePermissions}
            baseline={rolePermissions}
            onChange={setGranted}
          />
        </>
      )}
    </div>
  );
};

export default UserPermissionSection;
