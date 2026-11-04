import React from 'react';
import { FleetIcons } from '../FleetIcons';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Standardized RefreshButton component used across the entire application.
 * Matches the Tenants directory refresh button UI specification:
 * - White/dark pill container with border & shadow
 * - Vibrant blue refresh circular arrow icon (with animate-spin on loading)
 * - Bold text label
 */
export const RefreshButton = ({
  onClick,
  loading = false,
  disabled = false,
  label,
  loadingLabel,
  title,
  className = '',
  size = 'md', // 'sm' | 'md'
  hideLabelOnMobile = false,
}) => {
  const { t } = useTranslation();
  const isSpinning = Boolean(loading);

  const defaultLabel = t('common.refresh', 'Refresh');
  const defaultLoadingLabel = t('common.refreshing', 'Refreshing…');

  const resolvedLabel = (!label || label === 'Refresh')
    ? defaultLabel
    : (label === 'Refresh Status')
      ? t('admin.onboard.refresh_status', 'Refresh Status')
      : label;

  const resolvedLoadingLabel = (!loadingLabel || loadingLabel === 'Refreshing…')
    ? defaultLoadingLabel
    : (loadingLabel === 'Checking…' || loadingLabel === 'Checking Status…')
      ? t('admin.onboard.checking_status', 'Checking Status…')
      : loadingLabel;

  const sizeClasses = size === 'sm'
    ? (hideLabelOnMobile ? 'p-2 sm:px-3 sm:py-1.5 text-xs' : 'px-3 py-1.5 text-xs')
    : (hideLabelOnMobile ? 'p-2.5 sm:px-3.5 sm:py-2.5 text-xs' : 'px-3.5 py-2.5 text-xs');

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      title={title || (isSpinning ? resolvedLoadingLabel : resolvedLabel)}
      aria-label={typeof resolvedLabel === 'string' ? resolvedLabel : 'Refresh'}
      className={`bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold rounded-xl border border-slate-200 dark:border-zinc-700 shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none ${sizeClasses} ${className}`}
    >
      <FleetIcons.Refresh
        className={`w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 ${isSpinning ? 'animate-spin' : ''}`}
      />
      <span className={hideLabelOnMobile ? 'hidden sm:inline' : ''}>
        {isSpinning ? resolvedLoadingLabel : resolvedLabel}
      </span>
    </button>
  );
};

export default RefreshButton;
