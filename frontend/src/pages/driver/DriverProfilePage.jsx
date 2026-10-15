import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import { useDriverApp } from '../../hooks/driver/useDriverApp';
import { useAuth } from '../../hooks/useAuth';
import { resolveFileUrl } from '../../api/services/upload.service';
import Breadcrumb from '../../components/ui/Breadcrumb';

export const DriverProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loadProfile } = useDriverApp();

  useEffect(() => {
    loadProfile().catch(() => {});
  }, [loadProfile]);

  const stats = profile?.stats ?? {};

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Driver', path: '/driver/dashboard' },
            { label: 'Profile' },
          ]}
          className="mb-2"
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Driver Profile</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
              Personal profile, vehicle assignment, license certification, and account preferences
            </p>
          </div>

          <Link
            to="/driver/settings"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all self-start sm:self-auto flex items-center gap-1.5"
          >
            <FleetIcons.Settings className="w-4 h-4" />
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>

      {/* Driver Hero Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-5">
        {(user?.avatar_url || user?.avatarUrl || user?.avatar || profile?.avatar) ? (
          <img
            src={resolveFileUrl(user?.avatar_url || user?.avatarUrl || user?.avatar || profile?.avatar)}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || profile?.name || 'Driver')}&background=0f172a&color=ffffff`;
            }}
            alt={user?.name ?? 'Driver'}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 dark:border-zinc-700 shadow-md shrink-0 bg-slate-100 dark:bg-zinc-800"
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 shadow-md shrink-0 flex items-center justify-center text-2xl font-black text-slate-400 dark:text-zinc-500">
            {(user?.name ?? profile?.name ?? 'D').charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">{profile?.name ?? user?.name ?? '—'}</h2>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-md">
              {profile?.badge_id || profile?.code || (profile?.id ? `DRV-${profile.id}` : '—')}
            </span>
            <span className="text-[11px] font-bold px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full">
              {profile?.status ? String(profile.status).replace('_', ' ').toUpperCase() : 'ACTIVE DRIVER'}
            </span>
          </div>

          <p className="text-xs font-medium text-slate-600 dark:text-zinc-400">
            {(typeof profile?.role === 'object' && profile?.role !== null ? (profile.role.name || profile.role.code || '—') : (profile?.role ?? 'Commercial Pilot'))} · {(typeof profile?.organization === 'object' && profile?.organization !== null ? (profile.organization.name || profile.organization.code || '—') : (profile?.organization ?? 'VMovexa Transit'))}
          </p>

          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-zinc-400 font-medium flex-wrap pt-1">
            <span>Primary Depot: <strong className="text-slate-800 dark:text-zinc-200">{typeof profile?.depot === 'object' && profile?.depot !== null ? (profile.depot.name || profile.depot.code || '—') : (profile?.depot ?? 'Central Depot')}</strong></span>
            <span>·</span>
            <span>Shift: <strong className="text-slate-800 dark:text-zinc-200 font-mono">{profile?.active_shift || profile?.activeShift || 'Morning'}</strong></span>
            <span>·</span>
            <span>License: <strong className="text-slate-800 dark:text-zinc-200 font-mono">{profile?.dl_number || profile?.licenseNumber || '—'}</strong></span>
          </div>
        </div>
      </div>

      {/* 4 Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Routes Completed</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{stats.routes ?? 0} Trips</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Active Schedules</span>
          <div className="text-xl font-black text-blue-700 dark:text-blue-400 mt-1">{stats.schedules ?? 0} Shifts</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Documents</span>
          <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{stats.documents ?? 0} Verified</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Safety Rating</span>
          <div className="text-xl font-black text-purple-700 dark:text-purple-400 mt-1">4.9 / 5.0</div>
        </div>
      </div>

      {/* Navigation Hub */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">Driver Account & Governance Hub</h3>

        {[
          { label: 'Personal & Duty Settings', path: '/driver/settings', icon: <FleetIcons.Settings className="w-4 h-4" /> },
          { label: 'Change Security Password', path: '/driver/settings/security', icon: <FleetIcons.Key className="w-4 h-4" /> },
          { label: 'Trip & Notification Preferences', path: '/driver/settings/notifications', icon: <FleetIcons.Bell className="w-4 h-4" /> },
          { label: 'Driver Help & Emergency Support', path: '/driver/help', icon: <FleetIcons.Help className="w-4 h-4" /> },
          { label: 'Incident & Support History', path: '/driver/help/history', icon: <FleetIcons.Ticket className="w-4 h-4" /> },
          { label: 'Driver Privacy & Telematics Policy', path: '/driver/privacy', icon: <FleetIcons.Shield className="w-4 h-4" /> },
          { label: 'Transit Terms & Driver SLA', path: '/driver/terms', icon: <FleetIcons.Document className="w-4 h-4" /> },
        ].map((item, idx) => (
          <Link
            key={idx}
            to={item.path}
            className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/80 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-zinc-200 group transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.icon}</span>
              <span>{item.label}</span>
            </div>
            <FleetIcons.ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        ))}
      </div>

      {/* Logout Row */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Session active on driver tablet</span>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          Logout Driver Session
        </button>
      </div>
    </div>
  );
};

export default DriverProfilePage;
