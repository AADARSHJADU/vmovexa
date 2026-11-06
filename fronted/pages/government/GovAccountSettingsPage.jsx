import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useAuth } from '../../hooks/useAuth';
import { resolveFileUrl, uploadFile } from '../../api/services/upload.service';

export const GovAccountSettingsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isSuperAdmin = location.pathname.startsWith('/superadmin');
  const basePath = isSuperAdmin ? '/superadmin/government' : '/government';
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    empId: '',
    role: '',
    companyName: '',
    branch: '',
    address: '',
    language: 'en',
    timeZone: 'Asia/Kolkata',
  });

  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      const userLangCode = user.language?.code || (user.language_id === 2 ? 'hi' : user.language_id === 4 ? 'kn' : user.language_id === 3 ? 'mr' : 'en');
      setFormData({
        fullName: user.name || user.fullName || '',
        email: user.email || '',
        mobile: user.phone || user.mobile || '',
        empId: user.enrollment_no || user.code || (user.id ? `GOV-${user.id}` : '—'),
        role: user.role?.name || user.role || 'Government Officer',
        companyName: user.organization?.name || user.agency || user.department || 'State Transport Authority',
        branch: user.branch || user.city || user.organization?.branch || '',
        address: user.organization?.office_address || user.office_address || user.address || '',
        language: userLangCode,
        timeZone: user.timezone || 'Asia/Kolkata',
      });
      setAvatarUrl(user.avatar_url || user.avatarUrl || '');
    }
  }, [user]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('gov.account.select_image_err', 'Please select an image file (PNG, JPG, SVG, WebP)'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('gov.account.image_size_err', 'Profile image size must be under 5MB'));
      return;
    }

    try {
      setUploadingPhoto(true);
      const uploaded = await uploadFile(file, 'avatar');
      const url = uploaded?.url || uploaded?.file_url || (typeof uploaded === 'string' ? uploaded : null);
      if (url) {
        setAvatarUrl(url);
        toast.success(t('gov.account.photo_uploaded', 'Photo uploaded! Click "Save Changes" to save profile.'));
      }
    } catch {
      toast.error(t('gov.account.upload_failed', 'Failed to upload photo'));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
    toast.success(t('gov.account.photo_removed', 'Photo removed! Click "Save Changes" to save profile.'));
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      await toast.promise(
        updateProfile({
          name: formData.fullName,
          email: formData.email,
          phone: formData.mobile,
          avatar_url: avatarUrl,
          companyName: formData.companyName,
          branch: formData.branch,
          address: formData.address,
          language: formData.language,
          timeZone: formData.timeZone,
        }),
        {
          loading: t('gov.account.saving', 'Saving profile changes...'),
          success: t('gov.account.saved_success', 'Profile updated successfully!'),
          error: (err) => err?.message || t('gov.account.save_failed', 'Failed to update profile'),
        }
      );
      setSaved(true);
      setTimeout(() => navigate(`${basePath}/profile`), 1000);
    } catch {
      /* toast handles error */
    }
  };

  const currentAvatarSrc = avatarUrl
    ? resolveFileUrl(avatarUrl)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName || 'Officer')}&background=0f172a&color=ffffff`;

  return (
    <div className="w-full space-y-6 pb-20">
      {/* 1. Breadcrumb Header matching modern subpage standard */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <Breadcrumb
            items={[
              {
                label: isSuperAdmin ? t('nav.superadmin', 'SuperAdmin') : t('nav.headers.government_portal', 'Government'),
                path: `${basePath}/dashboard`,
                icon: FleetIcons.Dashboard,
              },
              { label: t('gov.profile.breadcrumb', 'Officer Profile'), path: `${basePath}/profile` },
              { label: t('gov.account.title', 'Account Settings') },
            ]}
            className="mb-2"
          />

          <div className="flex items-center gap-3 mt-1">
            <button
              type="button"
              onClick={() => navigate(`${basePath}/profile`)}
              className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title={t('gov.account.back_profile')}
            >
              <FleetIcons.ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('gov.account.title')}</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">{t('gov.account.desc')}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`${basePath}/profile`)}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer"
          >
            {t('common.cancel', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FleetIcons.Check className="w-4 h-4 text-white" />
            <span>{saved ? t('common.saved', 'Saved!') : t('common.save_changes', 'Save Changes')}</span>
          </button>
        </div>
      </div>

      {/* 2. Photo Upload Section */}
      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentAvatarSrc}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName || 'Officer')}&background=0f172a&color=ffffff`;
            }}
            alt={formData.fullName || 'User'}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 dark:border-zinc-800 shadow-md bg-slate-100 dark:bg-zinc-800"
          />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('gov.account.avatar_title')}</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{t('gov.account.avatar_desc')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {avatarUrl && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FleetIcons.Trash className="w-3.5 h-3.5" />
              <span>{t('gov.account.remove_photo')}</span>
            </button>
          )}
          <label className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={uploadingPhoto}
            />
            {uploadingPhoto ? (
              <FleetIcons.Refresh className="w-4 h-4 text-slate-500 dark:text-zinc-400 animate-spin" />
            ) : (
              <FleetIcons.Camera className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
            )}
            <span>{uploadingPhoto ? t('gov.profile.uploading', 'Uploading...') : t('gov.profile.change', 'Change Photo')}</span>
          </label>
        </div>
      </div>

      {/* 3. Form Containers */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Personal Information */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {t('gov.account.sec1_title', '1. Officer Personal Information')}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('gov.account.officer_name')}</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('gov.account.dept_email')}</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('gov.account.contact_num')}</label>
              <input
                type="text"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('gov.account.badge_id')}</label>
              <input
                type="text"
                disabled
                value={formData.empId}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400 font-mono font-bold cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Organization Information */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {t('gov.account.sec2_title', '2. Department & Jurisdiction Information')}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('gov.account.dept_name')}</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('gov.account.secretarial_div')}</label>
              <input
                type="text"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('gov.account.ministry_address')}</label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Preferences */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {t('gov.account.sec3_title', '3. Regional Preferences & Dispatch Timezone')}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('common.language', 'Language')}</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
              >
                <option value="en">{t('common.lang_en', 'English')}</option>
                <option value="hi">{t('common.lang_hi', 'Hindi')}</option>
                <option value="kn">{t('common.lang_kn', 'Kannada')}</option>
                <option value="mr">{t('common.lang_mr', 'Marathi')}</option>
                <option value="te">{t('common.lang_te', 'Telugu')}</option>
                <option value="ta">{t('common.lang_ta', 'Tamil')}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('common.timezone', 'Timezone')}</label>
              <select
                value={formData.timeZone}
                onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
              >
                <option value="Asia/Kolkata">{t('common.tz_kolkata', 'Kolkata (IST +5:30)')}</option>
                <option value="UTC">{t('common.tz_utc', 'UTC (+0:00)')}</option>
                <option value="America/New_York">{t('common.tz_ny', 'New York (EST -5:00)')}</option>
                <option value="Europe/London">{t('common.tz_london', 'London (GMT +0:00)')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate(`${basePath}/profile`)}
            className="px-6 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer"
          >
            {t('common.cancel', 'Cancel')}
          </button>
          <button
            type="submit"
            className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FleetIcons.Check className="w-4 h-4 text-white" />
            <span>{saved ? t('common.saved', 'Saved!') : t('gov.account.save_btn', 'Save Account Changes')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default GovAccountSettingsPage;
