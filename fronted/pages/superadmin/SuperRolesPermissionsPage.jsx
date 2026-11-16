import { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from '../../hooks/useTranslation';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { PermissionMatrix } from '../../components/rbac/PermissionMatrix';
import { useSuperRole } from '../../hooks/superadmin/useSuperRole';

/**
 * Roles & Permissions — exactly 8 fixed roles. One portal each. Pick a role, tick what it may do, save.
 * Every user of the role gets the change immediately. Super Admin is read-only (full access).
 */
export const SuperRolesPermissionsPage = () => {
  const { t } = useTranslation();
  const { roles, registry, loading, loadRoles, loadRegistry, updateRolePermissions, canUpdateRole } = useSuperRole();
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState([]);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    loadRoles().catch((e) => toast.error(e?.message || t('rbac.roles.load_failed', 'Failed to load roles')));
    loadRegistry().catch((e) => toast.error(e?.message || t('rbac.roles.load_failed', 'Failed to load roles')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = useMemo(() => roles.find((r) => r.id === selectedId) || null, [roles, selectedId]);

  useEffect(() => {
    if (!selectedId && roles.length) setSelectedId(roles[0].id);
  }, [roles, selectedId]);

  useEffect(() => {
    setDraft(selected && !selected.wildcard ? selected.permissions || [] : []);
    setConfirming(false);
  }, [selected]);

  const dirty = useMemo(() => {
    if (!selected || selected.wildcard) return false;
    return [...draft].sort().join('|') !== [...(selected.permissions || [])].sort().join('|');
  }, [draft, selected]);

  const handleSave = useCallback(async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await updateRolePermissions(selected.id, draft);
      toast.success(t('rbac.roles.saved', 'Role permissions updated'));
      setConfirming(false);
    } catch (e) {
      toast.error(e?.message || t('rbac.roles.save_failed', 'Failed to update role permissions'));
    } finally {
      setSaving(false);
    }
  }, [selected, draft, updateRolePermissions, t]);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      <Breadcrumb
        items={[
          { label: t('ag.superadmin.superuserpermissionspage.super_admin', 'Super Admin'), path: '/superadmin/dashboard' },
          { label: t('nav.roles_permissions', 'Roles & Permissions') },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('nav.roles_permissions', 'Roles & Permissions')}</h1>
        <p className="text-sm text-slate-500">
          {t('rbac.roles.subtitle', 'The platform has 8 fixed roles. Each role gets the permissions of its own portal. Changes apply to every user of the role.')}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <nav aria-label={t('rbac.roles.list', 'Roles')} className="space-y-2">
          {loading && !roles.length && <p className="text-sm text-slate-500" role="status">{t('common.loading', 'Loading...')}</p>}
          {roles.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedId(r.id)}
              aria-current={r.id === selectedId ? 'true' : undefined}
              className={`w-full rounded-xl border p-3 text-left transition ${r.id === selectedId ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-900">{r.name}</span>
                <span className="text-xs text-slate-500">{r.userCount} {t('rbac.roles.users', 'users')}</span>
              </div>
              <div className="mt-0.5 text-xs text-slate-500">
                {r.wildcard
                  ? t('rbac.roles.full_access', 'Full access')
                  : `${r.permissionCount} ${t('rbac.roles.permissions', 'permissions')} · ${r.portal}`}
              </div>
            </button>
          ))}
        </nav>

        <div className="space-y-4">
          {selected && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{selected.name}</h2>
                  <p className="text-xs text-slate-500">{selected.description}</p>
                </div>
                {!selected.wildcard && canUpdateRole && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={!dirty || saving}
                      onClick={() => setDraft(selected.permissions || [])}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      {t('common.discard', 'Discard')}
                    </button>
                    <button
                      type="button"
                      disabled={!dirty || saving}
                      onClick={() => setConfirming(true)}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {t('common.save_changes', 'Save changes')}
                    </button>
                  </div>
                )}
              </div>

              {confirming && (
                <div role="alertdialog" aria-live="polite" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                  <p>
                    {t('rbac.roles.confirm_prefix', 'This changes access for')} <strong>{selected.userCount}</strong>{' '}
                    {t('rbac.roles.confirm_suffix', 'user(s) with this role. Continue?')}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button type="button" disabled={saving} onClick={handleSave} className="rounded-lg bg-amber-600 px-3 py-1.5 text-white disabled:opacity-50">
                      {saving ? t('common.saving', 'Saving...') : t('common.confirm', 'Confirm')}
                    </button>
                    <button type="button" disabled={saving} onClick={() => setConfirming(false)} className="rounded-lg border border-amber-400 px-3 py-1.5">
                      {t('common.cancel', 'Cancel')}
                    </button>
                  </div>
                </div>
              )}

              {selected.wildcard ? (
                <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-700" role="note">
                  {t('rbac.roles.super_admin_note', 'Super Admin has access to everything and cannot be edited.')}
                </div>
              ) : (
                <PermissionMatrix
                  portal={selected.portal}
                  registry={registry}
                  granted={draft}
                  onChange={setDraft}
                  readOnly={!canUpdateRole}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperRolesPermissionsPage;
