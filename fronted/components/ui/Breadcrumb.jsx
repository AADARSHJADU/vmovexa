import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { FleetIcons } from '../FleetIcons';

/**
 * Standard Global Breadcrumb UI matching TenantsListPage.jsx style.
 *
 * Example usage:
 * <Breadcrumb
 *   items={[
 *     { label: 'Super Admin', path: '/superadmin/dashboard', icon: FleetIcons.Dashboard },
 *     { label: 'Tenants Directory', path: '/superadmin/tenants' },
 *     { label: 'Tenant Details' }, // current active page (no path)
 *   ]}
 * />
 */
export const Breadcrumb = ({ items = [], className = '' }) => {
  const { t } = useTranslation();
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label={t('ag.shared.breadcrumb.breadcrumb', 'Breadcrumb')}
      className={`flex items-center flex-wrap gap-1.5 sm:gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400 ${className}`}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const IconComponent = item.icon || (index === 0 ? FleetIcons.Dashboard : null);

        const targetPath = item.path || item.to || item.href;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <span className="text-slate-300 dark:text-zinc-600 select-none">/</span>
            )}

            {isLast || (!targetPath && !item.onClick) ? (
              <span className="text-slate-900 dark:text-white font-bold truncate max-w-[200px] sm:max-w-none">
                {item.label}
              </span>
            ) : targetPath ? (
              <Link
                to={targetPath}
                onClick={item.onClick}
                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 transition-colors cursor-pointer"
              >
                {IconComponent && <IconComponent className="w-3.5 h-3.5 shrink-0" />}
                <span className="truncate max-w-[140px] sm:max-w-none">{item.label}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={item.onClick}
                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 transition-colors cursor-pointer bg-transparent border-0 p-0 font-semibold text-xs text-left"
              >
                {IconComponent && <IconComponent className="w-3.5 h-3.5 shrink-0" />}
                <span className="truncate max-w-[140px] sm:max-w-none">{item.label}</span>
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
