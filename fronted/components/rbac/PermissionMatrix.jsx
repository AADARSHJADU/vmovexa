import React, { useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * PermissionMatrix — one portal's permissions as  feature x action  checkboxes.
 *
 *  - portal:    'technician' | 'fleet' | ...  (key of registry.portals)
 *  - registry:  response of GET /permissions/registry
 *  - granted:   permission keys currently ticked
 *  - allowed:   optional whitelist; actions outside it are not rendered (user screen: only the role's permissions)
 *  - onChange:  (nextGrantedKeys: string[]) => void
 *  - readOnly:  render without the ability to change anything
 *  - baseline:  optional keys that are the "default"; ticked-off baseline keys get a "revoked" marker
 */
export function PermissionMatrix({ portal, registry, granted = [], allowed = null, onChange, readOnly = false, baseline = null }) {
  const { t, currentLanguage } = useTranslation();
  const hi = currentLanguage === 'hi';
  const grantedSet = useMemo(() => new Set(granted), [granted]);
  const allowedSet = useMemo(() => (allowed ? new Set(allowed) : null), [allowed]);
  const baselineSet = useMemo(() => (baseline ? new Set(baseline) : null), [baseline]);

  const sections = useMemo(() => {
    const def = registry?.portals?.[portal];
    if (!def) return [];
    const bySection = new Map();
    for (const ft of def.features) {
      const actions = ft.actions.filter((a) => !allowedSet || allowedSet.has(a.permission));
      if (!actions.length) continue;
      if (!bySection.has(ft.section)) bySection.set(ft.section, []);
      bySection.get(ft.section).push({ ...ft, actions });
    }
    return Array.from(bySection.entries());
  }, [registry, portal, allowedSet]);

  const emit = (set) => onChange && onChange(Array.from(set));
  const toggle = (key) => {
    if (readOnly) return;
    const next = new Set(grantedSet);
    if (next.has(key)) next.delete(key); else next.add(key);
    emit(next);
  };
  const setMany = (keys, on) => {
    if (readOnly) return;
    const next = new Set(grantedSet);
    keys.forEach((k) => (on ? next.add(k) : next.delete(k)));
    emit(next);
  };

  if (!sections.length) {
    return (
      <p className="text-sm text-slate-500" role="status">
        {t('rbac.matrix.empty', 'No permissions available for this portal.')}
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {sections.map(([section, features]) => {
        const sectionKeys = features.flatMap((f) => f.actions.map((a) => a.permission));
        const sectionOn = sectionKeys.filter((k) => grantedSet.has(k)).length;
        return (
          <section key={section} className="rounded-xl border border-slate-200 bg-white" aria-label={section}>
            <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-800">
                {t(`rbac.section.${section.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`, section)}
                <span className="ml-2 text-xs font-normal text-slate-500">{sectionOn}/{sectionKeys.length}</span>
              </h3>
              {!readOnly && (
                <div className="flex gap-3 text-xs">
                  <button type="button" className="text-blue-600 hover:underline" onClick={() => setMany(sectionKeys, true)}>
                    {t('rbac.matrix.select_all', 'Select all')}
                  </button>
                  <button type="button" className="text-slate-500 hover:underline" onClick={() => setMany(sectionKeys, false)}>
                    {t('rbac.matrix.clear', 'Clear')}
                  </button>
                </div>
              )}
            </header>
            <ul className="divide-y divide-slate-100">
              {features.map((ft) => {
                const keys = ft.actions.map((a) => a.permission);
                const allOn = keys.every((k) => grantedSet.has(k));
                const label = t(`rbac.feature.${portal}.${ft.key}`, hi && ft.labelHi ? ft.labelHi : ft.label);
                return (
                  <li key={ft.key} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
                    <label className="flex w-56 items-center gap-2 text-sm font-medium text-slate-800">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300"
                        checked={allOn}
                        disabled={readOnly}
                        onChange={() => setMany(keys, !allOn)}
                        aria-label={`${label} - ${t('rbac.matrix.all_actions', 'all actions')}`}
                      />
                      {label}
                    </label>
                    <div className="flex flex-1 flex-wrap gap-x-5 gap-y-1">
                      {ft.actions.map((a) => {
                        const on = grantedSet.has(a.permission);
                        const revoked = !!baselineSet && baselineSet.has(a.permission) && !on;
                        const aLabel = t(`rbac.action.${a.key}`, hi && a.labelHi ? a.labelHi : a.label);
                        return (
                          <label
                            key={a.permission}
                            className={`flex items-center gap-1.5 text-sm ${revoked ? 'text-red-600' : 'text-slate-700'}`}
                            title={a.permission}
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-slate-300"
                              checked={on}
                              disabled={readOnly}
                              onChange={() => toggle(a.permission)}
                            />
                            <span className={revoked ? 'line-through' : ''}>{aLabel}</span>
                            {revoked && (
                              <span className="rounded bg-red-50 px-1.5 text-[10px] font-semibold uppercase text-red-600">
                                {t('rbac.revoked', 'Revoked')}
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export default PermissionMatrix;
