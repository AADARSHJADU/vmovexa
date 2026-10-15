/**
 * videoConstants.js
 * Single source of truth for Video Tutorial Categories, Skill Levels,
 * and unified badge styling across SuperAdmin Content Manager,
 * Video Tutorials Modal, and Role Portals.
 */

export const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export const VIDEO_CATEGORIES = [
  'Getting Started',
  'Optimization',
  'Analytics',
  'Billing',
  'Hardware',
  'Monitoring',
  'Reports',
  'Emergency SOS',
  'Compliance',
  'Fleet Ops',
  'Installation',
  'Telematics',
  'Diagnostics',
  'Spares',
  'Navigation',
  'Shift End',
  'GST & Tax',
  'Reconciliation',
  'Disputes',
  'Architecture',
  'Tenancy',
  'Firmware',
  'Support',
  'General',
];

/**
 * Returns consistent Tailwind CSS classes for Skill Level badges.
 */
export const getSkillLevelBadgeClass = (level) => {
  const norm = String(level || '').trim().toLowerCase();
  switch (norm) {
    case 'beginner':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'intermediate':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'advanced':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

/**
 * Returns consistent Tailwind CSS classes for Category badges.
 */
export const getCategoryBadgeClass = () => {
  return 'bg-blue-50 text-blue-700 border-blue-200';
};
