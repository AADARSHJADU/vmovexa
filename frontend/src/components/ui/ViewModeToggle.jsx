import React from 'react';
import { FleetIcons } from '../FleetIcons';

/**
 * Standardized ViewModeToggle component for switching between List/Table and Grid/Card view.
 * Matches the Tenants directory specification with:
 * - Pill container with border and background
 * - Table / List view icon (FleetIcons.TableView)
 * - Grid / Card view icon (FleetIcons.CardView)
 * - Gradient active state (bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs)
 * - Subtle hover state on inactive button
 */
export const ViewModeToggle = ({
  viewMode, // 'table' | 'card' or 'list' | 'grid'
  onViewModeChange,
  tableTitle = 'Table View',
  cardTitle = 'Grid View',
  tableValue = 'table', // or 'list'
  cardValue = 'card',   // or 'grid'
  className = '',
}) => {
  const isTableActive =
    viewMode === tableValue ||
    (tableValue === 'table' && viewMode === 'list') ||
    (tableValue === 'list' && viewMode === 'table');

  const isCardActive =
    viewMode === cardValue ||
    (cardValue === 'card' && viewMode === 'grid') ||
    (cardValue === 'grid' && viewMode === 'card');

  return (
    <div
      className={`flex items-center bg-white dark:bg-zinc-900 p-0.5 sm:p-1 rounded-xl border border-slate-200 dark:border-zinc-700 shadow-xs select-none ${className}`}
    >
      <button
        type="button"
        onClick={() => onViewModeChange(tableValue)}
        className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
          isTableActive
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
            : 'text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800'
        }`}
        title={tableTitle}
        aria-label={tableTitle}
      >
        <FleetIcons.TableView className={`w-4 h-4 ${isTableActive ? 'text-white' : ''}`} />
      </button>
      <button
        type="button"
        onClick={() => onViewModeChange(cardValue)}
        className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
          isCardActive
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
            : 'text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800'
        }`}
        title={cardTitle}
        aria-label={cardTitle}
      >
        <FleetIcons.CardView className={`w-4 h-4 ${isCardActive ? 'text-white' : ''}`} />
      </button>
    </div>
  );
};

export default ViewModeToggle;
