import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { useAuth } from '../../hooks/useAuth';
import { useAdminDashboard } from '../../hooks/admin/useAdminDashboard';
import { uploadFile, resolveFileUrl } from '../../api/services/upload.service';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useTranslation } from '../../hooks/useTranslation';

export const AdminProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { user, updateProfile, fetchMe, logout } = useAuth();
  const { kpis, loadKpis } = useAdminDashboard();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    loadKpis().catch(() => {});
  }, [loadKpis]);

  const orgName = user?.organization?.name || user?.org?.name || '';
  const rawAvatarUrl = user?.avatar_url || user?.avatarUrl || user?.avatar;
  const avatarSrc = rawAvatarUrl
    ? resolveFileUrl(rawAvatarUrl)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=0f172a&color=ffffff`;

  const handleLogout = async () => {
    try { await logout(); } catch { /* ignore */ }
    navigate('/login');
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be under 5MB.');
      return;
    }

    setUploadingAvatar(true);
    const toastId = toast.loading('Uploading photo...');

    try {
      const uploadRes = await uploadFile(file, 'profile_avatar');
      const avatarUrl = uploadRes?.url || uploadRes?.fileUrl || uploadRes?.path || uploadRes;

      if (!avatarUrl) {
        throw new Error('Upload succeeded but no image URL was returned.');
      }

      await updateProfile({
        avatar_url: avatarUrl,
        avatarUrl: avatarUrl,
      });

      if (fetchMe) await fetchMe();
      toast.success('Photo updated successfully!', { id: toastId });
    } catch (err) {
      toast.error(err?.message || 'Failed to upload photo.', { id: toastId });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    setUploadingAvatar(true);
    const toastId = toast.loading('Removing photo...');
    try {
      await updateProfile({
        avatar_url: null,
        avatarUrl: null,
      });
      if (fetchMe) await fetchMe();
      toast.success('Photo removed!', { id: toastId });
    } catch (err) {
      toast.error(err?.message || 'Failed to remove photo.', { id: toastId });
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: t('nav.admin') || 'Admin', path: '/admin/dashboard' },
              { label: t('admin.profile.title') }
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('admin.profile.title')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            {t('admin.profile.desc')}
          </p>
        </div>

        <Link
          to="/admin/settings"
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-slate-900 text-xs font-bold rounded-xl shadow-sm transition-all self-start sm:self-auto flex items-center gap-1.5 cursor-pointer"
        >
          <FleetIcons.Settings className="w-4 h-4" />
          <span>{t('admin.profile.edit_profile')}</span>
        </Link>
      </div>

      {/* Hero Profile Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="relative group shrink-0">
          <img
            src={avatarSrc}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=0f172a&color=ffffff`;
            }}
            alt={user?.name ?? ''}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 dark:border-zinc-700 shadow-md bg-slate-100 dark:bg-zinc-800"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute inset-0 bg-slate-900/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold gap-1 backdrop-blur-xs disabled:opacity-50 cursor-pointer"
            title={t('admin.profile.change_photo')}
          >
            <FleetIcons.Camera className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">{user?.name ?? ''}</h2>
            <span className="text-[11px] font-bold px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full">
              {user?.status ?? 'Active'}
            </span>
          </div>

          <p className="text-xs font-medium text-slate-600 dark:text-zinc-400">
            {orgName || '—'}
          </p>

          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-zinc-400 font-medium flex-wrap pt-1">
            <span>{t('admin.profile.email_label')} <strong className="font-mono text-slate-800 dark:text-zinc-200">{user?.email ?? ''}</strong></span>
            <span>·</span>
            <span>{t('admin.profile.phone_label')} <strong className="text-slate-800 dark:text-zinc-200">{user?.phone ?? '—'}</strong></span>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <FleetIcons.Camera className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{rawAvatarUrl ? t('admin.profile.change_photo') : t('admin.profile.upload_photo')}</span>
            </button>

            {rawAvatarUrl && (
              <button
                onClick={handleRemoveAvatar}
                disabled={uploadingAvatar}
                className="text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:underline cursor-pointer"
              >
                {t('admin.profile.remove_photo')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Stat Strip — Dynamic from Real KPI Endpoint */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('admin.profile.total_buses')}</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {kpis?.totalBuses !== undefined ? `${kpis.totalBuses} Buses` : '—'}
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{t('admin.profile.active_screens')}</span>
          <div className="text-xl font-black text-blue-700 dark:text-blue-400 mt-1">
            {kpis?.activeDisplays !== undefined ? `${kpis.activeDisplays} Screens` : '—'}
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{t('admin.profile.ad_revenue_share')}</span>
          <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
            {kpis?.tenantMonthlyRevenueShare !== undefined
              ? `₹ ${Number(kpis.tenantMonthlyRevenueShare || 0).toLocaleString('en-IN')}`
              : '₹ 0'}
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">{t('admin.profile.total_drivers')}</span>
          <div className="text-xl font-black text-purple-700 dark:text-purple-400 mt-1">
            {kpis?.totalDrivers !== undefined ? `${kpis.totalDrivers} Drivers` : '—'}
          </div>
        </div>
      </div>

      {/* Navigation Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">{t('admin.profile.company_info')}</h3>
          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 flex justify-between items-center">
              <span className="text-slate-400 dark:text-zinc-500">{t('admin.profile.company_label')}</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200 text-right">{orgName || '—'}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 flex justify-between items-center">
              <span className="text-slate-400 dark:text-zinc-500">{t('admin.profile.admin_label')}</span>
              <span className="font-medium text-slate-800 dark:text-zinc-200 text-right">{user?.name ?? '—'}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 flex justify-between items-center">
              <span className="text-slate-400 dark:text-zinc-500">{t('admin.profile.email_label')}</span>
              <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">{user?.email ?? '—'}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 flex justify-between items-center">
              <span className="text-slate-400 dark:text-zinc-500">{t('admin.profile.role_label')}</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200">{typeof user?.role === 'object' ? (user?.role?.name ?? '—') : (user?.role ?? '—')}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">{t('admin.profile.settings_links')}</h3>
          {[
            { label: 'General Settings', path: '/admin/settings', icon: <FleetIcons.Settings className="w-4 h-4" /> },
            { label: 'Password & Security', path: '/admin/settings/security', icon: <FleetIcons.Key className="w-4 h-4" /> },
            { label: 'Notification Settings', path: '/admin/settings/notifications', icon: <FleetIcons.Bell className="w-4 h-4" /> },
            { label: 'Help & Support', path: '/admin/help', icon: <FleetIcons.Help className="w-4 h-4" /> },
            { label: 'Support Tickets', path: '/admin/help/history', icon: <FleetIcons.Ticket className="w-4 h-4" /> },
            { label: 'Privacy Policy', path: '/admin/privacy', icon: <FleetIcons.Shield className="w-4 h-4" /> },
            { label: 'Terms of Service', path: '/admin/terms', icon: <FleetIcons.Document className="w-4 h-4" /> },
          ].map((item, idx) => (
            <Link
              key={idx}
              to={item.path}
              className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/60 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-zinc-200 group transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-slate-400 dark:text-zinc-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              <FleetIcons.ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-300 group-hover:translate-x-1 transition-transform" />
            </Link>
          ))}
        </div>
      </div>

      {/* {t('common.logout')} Row */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium text-center sm:text-left">
          {t('admin.profile.logged_in_as')}
        </span>
        <button
          onClick={handleLogout}
          className="px-4 py-2.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-bold rounded-xl transition-colors text-center cursor-pointer"
        >
          {t('common.logout')}
        </button>
      </div>
    </div>
  );
};

export default AdminProfilePage;
