/**
 * workOrderPresentation.js — Shared presentation mappings for Work Orders
 * Fully adheres to TECHNICIAN_WORK_ORDER_IMPLEMENTATION_PLAN.md:
 * - Exact status mappings (no substring matching, no defaulting unknown to submitted)
 * - Exact urgency mappings
 * - Strict non-invented display helpers
 */

export const WORK_ORDER_STATUS_MAP = {
  submitted: {
    label: 'Pending Assignment',
    key: 'submitted',
    color: 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-semibold',
    dot: 'bg-amber-500 animate-pulse',
  },
  approved: {
    label: 'Approved for Dispatch',
    key: 'approved',
    color: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    dot: 'bg-purple-500',
  },
  dispatched: {
    label: 'Dispatched to Depot',
    key: 'dispatched',
    color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    dot: 'bg-blue-500',
  },
  on_site: {
    label: 'On Site Troubleshooting',
    key: 'on_site',
    color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500 animate-pulse',
  },
  resolved: {
    label: 'Resolved & Tested',
    key: 'resolved',
    color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-semibold',
    dot: 'bg-emerald-500',
  },
  closed: {
    label: 'Closed & Archived',
    key: 'closed',
    color: 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-300 dark:border-zinc-700',
    dot: 'bg-slate-400',
  },
  rejected: {
    label: 'Rejected',
    key: 'rejected',
    color: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    dot: 'bg-red-500',
  },
};

export const UNKNOWN_STATUS_CONFIG = {
  label: 'Unknown status',
  key: 'unknown',
  color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
  dot: 'bg-zinc-400',
};

export function getStatusConfig(rawStatus) {
  if (!rawStatus) return UNKNOWN_STATUS_CONFIG;
  const key = String(rawStatus).toLowerCase().trim();
  return WORK_ORDER_STATUS_MAP[key] || UNKNOWN_STATUS_CONFIG;
}

export const WORK_ORDER_URGENCY_MAP = {
  critical: {
    label: 'Critical / Grounded Bus',
    badge: 'Critical',
    key: 'critical',
    color: 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 font-bold',
    pulse: true,
  },
  high: {
    label: 'High Priority',
    badge: 'High',
    key: 'high',
    color: 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 font-semibold',
    pulse: false,
  },
  normal: {
    label: 'Normal Maintenance',
    badge: 'Normal',
    key: 'normal',
    color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    pulse: false,
  },
  low: {
    label: 'Low Priority',
    badge: 'Low',
    key: 'low',
    color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
    pulse: false,
  },
};

export const UNKNOWN_URGENCY_CONFIG = {
  label: 'Unknown urgency',
  badge: 'Unknown',
  key: 'unknown',
  color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
  pulse: false,
};

export function getUrgencyConfig(rawUrgency) {
  if (!rawUrgency) return UNKNOWN_URGENCY_CONFIG;
  const key = String(rawUrgency).toLowerCase().trim();
  return WORK_ORDER_URGENCY_MAP[key] || UNKNOWN_URGENCY_CONFIG;
}

/**
 * Format any operational string strictly: never invent data.
 */
export function formatDisplayValue(val, fallback = '—') {
  if (val === null || val === undefined || val === '') return fallback;
  if (typeof val === 'object') {
    return val.name || val.code || val.bus_number || fallback;
  }
  return String(val);
}

export function formatExactDateTime(dateInput) {
  if (!dateInput) return '—';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatSlaCountdown(slaDueAt, status) {
  const st = (status || '').toLowerCase();
  if (['resolved', 'closed', 'rejected'].includes(st)) {
    return {
      text: 'Resolved',
      color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
    };
  }
  if (!slaDueAt) return null;
  const due = new Date(slaDueAt).getTime();
  if (isNaN(due)) return null;
  const now = Date.now();
  const diff = due - now;
  if (diff <= 0) {
    const overdueMins = Math.abs(Math.round(diff / (60 * 1000)));
    const h = Math.floor(overdueMins / 60);
    const m = overdueMins % 60;
    const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
    return {
      text: `Overdue ${timeStr}`,
      color: 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950/60 border-red-300 dark:border-red-800 font-bold animate-pulse',
    };
  }
  const remMins = Math.round(diff / (60 * 1000));
  const h = Math.floor(remMins / 60);
  const m = remMins % 60;
  const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
  return {
    text: `${timeStr} left`,
    color: diff < 3600 * 1000
      ? 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 font-bold'
      : 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
  };
}

export function formatWorkOrderCode(id, code) {
  if (code) return String(code);
  if (id) return `WO-${id}`;
  return 'WO-—';
}
