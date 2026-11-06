import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useAuth } from '../../hooks/useAuth';
import { resolveFileUrl, uploadFile } from '../../api/services/upload.service';

export const GovProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isSuperAdmin = location.pathname.startsWith('/superadmin');
  const basePath = isSuperAdmin ? '/superadmin/government' : '/government';
  const { user, updateProfile, fetchMe, logout } = useAuth();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success(t('gov.profile.logged_out_success', 'Logged out successfully'));
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('finance.settings.select_image_err', 'Please select an image file (PNG, JPG, SVG, WebP)'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('gov.profile.image_size_err', 'Profile image size must be under 5MB'));
      return;
    }

    setUploadingAvatar(true);
    const toastId = toast.loading(t('gov.profile.uploading_pic', 'Uploading profile picture...'));
    try {
      const uploaded = await uploadFile(file, 'avatar');
      const url = uploaded?.url || uploaded?.file_url || (typeof uploaded === 'string' ? uploaded : null);
      if (url) {
        await updateProfile({
          avatar_url: url,
          avatarUrl: url,
        });
        if (fetchMe) await fetchMe().catch(() => {});
        toast.success(t('gov.profile.pic_updated', 'Profile picture updated successfully!'), { id: toastId });
      } else {
        toast.error(t('gov.profile.pic_no_url', 'Upload succeeded but no image URL was returned.'), { id: toastId });
      }
    } catch {
      toast.error(t('gov.profile.pic_upload_failed', 'Failed to upload profile picture.'), { id: toastId });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarRemove = async () => {
    if (!avatarRaw || uploadingAvatar) return;
    setUploadingAvatar(true);
    const toastId = toast.loading(t('gov.profile.removing_pic', 'Removing profile picture...'));
    try {
      await updateProfile({ avatar_url: null, avatarUrl: null });
      if (fetchMe) await fetchMe().catch(() => {});
      toast.success(t('gov.profile.pic_removed', 'Profile picture removed.'), { id: toastId });
    } catch (error) {
      toast.error(error?.message || t('gov.profile.pic_remove_failed', 'Failed to remove profile picture.'), { id: toastId });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const displayName = user?.name || user?.fullName || 'Government Officer';
  const displayRole = user?.role?.name || user?.role || 'Authority Officer';
  const orgName = user?.organization?.name || user?.agency || user?.department || 'State Transport Authority';
  const officerId = user?.enrollment_no || user?.code || (user?.id ? `GOV-${user.id}` : '—');
  const avatarRaw = user?.avatar_url || user?.avatarUrl;
  const avatar = avatarRaw
    ? resolveFileUrl(avatarRaw)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0f172a&color=ffffff`;

  return (
    <div className="w-full space-y-6 pb-20">
      {/* 1. Header Banner */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <Breadcrumb
            items={[
              {
                label: isSuperAdmin ? t('nav.superadmin', 'SuperAdmin') : t('nav.headers.government_portal', 'Government'),
                path: `${basePath}/dashboard`,
                icon: FleetIcons.Dashboard,
              },
              { label: t('gov.profile.breadcrumb', 'Officer Profile') },
            ]}
            className="mb-2"
          />

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight mt-1">{t('gov.profile.title')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">{t('gov.profile.desc')}</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`${basePath}/profile/account`}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-indigo-500/20 active:scale-95 cursor-pointer"
          >
            <FleetIcons.Edit className="w-4 h-4 text-white" />
            <span>{t('gov.profile.edit_profile')}</span>
          </Link>

          <button
            onClick={handleLogout}
            className="px-5 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <FleetIcons.Logout className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            <span>{t('gov.profile.logout')}</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Profile Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-colors">
        <div className="flex items-center gap-5">
          <div className="relative group shrink-0">
            <img
              src={avatar}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0f172a&color=ffffff`;
              }}
              alt={displayName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 dark:border-zinc-700 shadow-md bg-slate-100 dark:bg-zinc-800"
            />
            <label
              title={t('gov.profile.change')}
              className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer transition-opacity"
            >
              {uploadingAvatar ? (
                <FleetIcons.Refresh className="w-4 h-4 text-white animate-spin mb-0.5" />
              ) : (
                <FleetIcons.Camera className="w-4 h-4 text-white mb-0.5" />
              )}
              <span>{uploadingAvatar ? t('gov.profile.uploading') : t('gov.profile.change')}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
              />
            </label>
            {avatarRaw && (
              <button
                type="button"
                onClick={handleAvatarRemove}
                disabled={uploadingAvatar}
                title={t('ag.finance.financeprofilepage.remove_profile_picture', 'Remove profile picture')}
                className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white border-2 border-white dark:border-zinc-900 shadow-sm flex items-center justify-center disabled:opacity-60 cursor-pointer"
              >
                <FleetIcons.Close className="w-3.5 h-3.5 text-white" />
              </button>
            )}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900"></span>
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{displayName}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold">
                {displayRole}
              </span>
            </div>
            <div className="text-xs text-slate-600 dark:text-zinc-400 font-medium mt-1">{orgName}</div>
            <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5">{t('gov.profile.badge_id', 'Officer Badge ID:')} {officerId}</div>
          </div>
        </div>

        {/* Gradient Edit Action Button in Hero Card */}
        <Link
          to={`${basePath}/profile/account`}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 active:scale-95 cursor-pointer self-start sm:self-center"
        >
          <FleetIcons.Edit className="w-4 h-4 text-white" />
          <span>{t('gov.profile.edit_profile')}</span>
        </Link>
      </div>

      {/* 3. Account & Settings Web Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account & Security Section */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            {t('gov.profile.account_security', 'Account & Security')}
          </h3>

          <div className="space-y-2.5">
            <div
              onClick={() => navigate(`${basePath}/profile/account`)}
              className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 hover:bg-blue-50/60 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-100/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                  <FleetIcons.User className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{t('gov.profile.account_settings')}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('gov.profile.account_desc')}</p>
                </div>
              </div>
              <FleetIcons.ArrowRight className="w-4 h-4 text-slate-400 dark:text-zinc-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
            </div>

            <div
              onClick={() => navigate(`${basePath}/profile/security`)}
              className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-100/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
                  <FleetIcons.Key className="w-5 h-5 text-indigo-700 dark:text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{t('gov.profile.security_password')}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('gov.profile.security_desc')}</p>
                </div>
              </div>
              <FleetIcons.ArrowRight className="w-4 h-4 text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all" />
            </div>

            <div
              onClick={() => navigate(`${basePath}/profile/notifications`)}
              className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-100/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50 text-purple-700 dark:text-purple-400 flex items-center justify-center">
                  <FleetIcons.Bell className="w-5 h-5 text-purple-700 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{t('gov.profile.notification_settings')}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('gov.profile.notification_desc')}</p>
                </div>
              </div>
              <FleetIcons.ArrowRight className="w-4 h-4 text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </div>

        {/* Helpdesk & Legal Section */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            {t('gov.profile.helpdesk_legal', 'Helpdesk & Legal')}
          </h3>

          <div className="space-y-2.5">
            <div
              onClick={() => navigate(`${basePath}/help`)}
              className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <FleetIcons.Headset className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{t('gov.profile.help_support')}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('gov.profile.help_desc')}</p>
                </div>
              </div>
              <FleetIcons.ArrowRight className="w-4 h-4 text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all" />
            </div>

            <div
              onClick={() => navigate(`${basePath}/privacy`)}
              className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-100/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/50 text-sky-700 dark:text-sky-400 flex items-center justify-center">
                  <FleetIcons.Shield className="w-5 h-5 text-sky-700 dark:text-sky-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">{t('gov.profile.privacy_policy')}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('gov.profile.privacy_desc')}</p>
                </div>
              </div>
              <FleetIcons.ArrowRight className="w-4 h-4 text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all" />
            </div>

            <div
              onClick={() => navigate(`${basePath}/terms`)}
              className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  <FleetIcons.Document className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{t('gov.profile.terms_conditions')}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('gov.profile.terms_desc')}</p>
                </div>
              </div>
              <FleetIcons.ArrowRight className="w-4 h-4 text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovProfilePage;
