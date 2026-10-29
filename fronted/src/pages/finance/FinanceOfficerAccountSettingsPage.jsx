/* Local form state is intentionally synchronized from authenticated user data. */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { resolveFileUrl, uploadFile } from '../../api/services/upload.service';

export const FinanceOfficerAccountSettingsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/finance' : '/finance';
  const { user, updateProfile, fetchMe } = useAuth();

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
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      const userLangCode = user.language?.code || (user.language_id === 2 ? 'hi' : user.language_id === 4 ? 'kn' : user.language_id === 3 ? 'mr' : 'en');
      setFormData({
        fullName: user.name || user.fullName || '',
        email: user.email || '',
        mobile: user.phone || user.mobile || '',
        empId: user.enrollment_no || user.code || (user.id ? `FIN-${user.id}` : 'FIN-101'),
        role: user.role?.name || user.role || 'Finance Officer',
        companyName: user.organization?.name || user.company_name || user.companyName || 'VMOVEXA Private Limited',
        branch: user.branch || user.division || 'Corporate Finance & Accounts Wing',
        address: user.organization?.office_address || user.office_address || user.address || '101, Business Hub, Bandra Kurla Complex, Mumbai, Maharashtra - 400051',
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
      toast.error('Please select an image file (PNG, JPG, SVG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Profile image size must be under 5MB');
      return;
    }

    setUploadingPhoto(true);
    const toastId = toast.loading('Uploading profile photo...');
    try {
      const uploaded = await uploadFile(file, 'avatar');
      const url = uploaded?.url || uploaded?.file_url || (typeof uploaded === 'string' ? uploaded : null);
      if (url) {
        await updateProfile({ avatar_url: url, avatarUrl: url });
        setAvatarUrl(url);
        if (fetchMe) await fetchMe().catch(() => {});
        toast.success('Profile photo updated!', { id: toastId });
      } else {
        toast.error('Upload succeeded but no image URL was returned.', { id: toastId });
      }
    } catch {
      toast.error('Failed to upload profile photo.', { id: toastId });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemoveAvatar = async () => {
    const toastId = toast.loading('Removing profile photo...');
    try {
      await updateProfile({ avatar_url: null, avatarUrl: null });
      setAvatarUrl('');
      if (fetchMe) await fetchMe().catch(() => {});
      toast.success('Profile photo removed!', { id: toastId });
    } catch (error) {
      toast.error(error?.message || 'Failed to remove profile photo.', { id: toastId });
    }
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error('Full Name is required');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    setSaving(true);
    try {
      await toast.promise(
        updateProfile({
          name: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.mobile.trim() || null,
          avatar_url: avatarUrl || null,
          avatarUrl: avatarUrl || null,
          companyName: formData.companyName || null,
          branch: formData.branch || null,
          address: formData.address || null,
          language: formData.language,
          timeZone: formData.timeZone,
        }),
        {
          loading: 'Saving profile changes...',
          success: 'Finance profile updated successfully!',
          error: (err) => err?.message || 'Failed to update profile',
        }
      );

      if (fetchMe) await fetchMe().catch(() => {});
      setSaved(true);
      setTimeout(() => navigate(`${basePath}/profile`), 800);
    } catch {
      /* Handled by toast.promise */
    } finally {
      setSaving(false);
    }
  };

  const currentAvatarSrc = avatarUrl
    ? resolveFileUrl(avatarUrl)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName || 'Finance Officer')}&background=0f172a&color=ffffff`;

  return (
    <div className="w-full space-y-6 pb-20 animate-in fade-in duration-200">
      {/* 1. Breadcrumb Header */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <Breadcrumb
            items={[
              { label: basePath.startsWith('/superadmin') ? 'Super Admin' : 'Finance Portal', path: `${basePath}/dashboard` },
              { label: 'Finance Profile', path: `${basePath}/profile` },
              { label: 'Account Settings' },
            ]}
            className="mb-2"
          />

          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={() => navigate(`${basePath}/profile`)}
              className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              title={t('common.back_to_profile')}
            >
              <FleetIcons.ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('finance.officer.title')}</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">{t('finance.officer.subtitle')}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`${basePath}/profile`)}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center gap-2"
          >
            {saving ? (
              <>
                <FleetIcons.Spinner className="w-3.5 h-3.5 animate-spin" />
                <span>{t('common.saving')}</span>
              </>
            ) : saved ? (
              <span className="flex items-center gap-1.5"><FleetIcons.Check className="w-3.5 h-3.5 text-white" /><span>{t('finance.officer.saved')}</span></span>
            ) : (
              <span className="flex items-center gap-1.5"><FleetIcons.Save className="w-3.5 h-3.5 text-white" /><span>{t('common.save_changes')}</span></span>
            )}
          </button>
        </div>
      </div>

      {/* 2. Photo Upload Section */}
      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={currentAvatarSrc}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName || 'Finance Officer')}&background=0f172a&color=ffffff`;
              }}
              alt={formData.fullName || 'User'}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 dark:border-zinc-700 shadow-md bg-slate-100 dark:bg-zinc-800"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900"></span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('finance.officer.avatar_title')}</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{t('finance.officer.avatar_desc')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {avatarUrl && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className="px-3.5 py-2 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold transition-colors cursor-pointer"
            >
              Remove Photo
            </button>
          )}
          <label className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={uploadingPhoto}
            />
            <FleetIcons.Camera className="w-3.5 h-3.5 text-slate-600 dark:text-zinc-300" />
            <span>{uploadingPhoto ? 'Uploading...' : 'Change Photo'}</span>
          </label>
        </div>
      </div>

      {/* Quick Nav to Corporate Settings */}
      <div className="p-4 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/80 dark:border-blue-900/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-900 dark:text-blue-200">
        <div className="flex items-center gap-2.5">
          <FleetIcons.Building className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <div>
            <span className="font-bold text-slate-900 dark:text-white">{t('finance.officer.corp_q')}</span>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('finance.officer.corp_desc')}</p>
          </div>
        </div>
        <Link
          to={`${basePath}/settings`}
          className="px-3.5 py-1.5 bg-white dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-zinc-700 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-zinc-700 rounded-xl transition-colors shrink-0 text-center shadow-2xs flex items-center gap-1.5"
        >
          <span>{t('finance.officer.open_corp')}</span>
          <FleetIcons.ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 3. Form Sections */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Personal Information */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                1. Officer Personal Information
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Officer Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder={t('finance.officer.ph_name')}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Corporate Finance Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t('finance.officer.ph_email')}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('finance.officer.direct_mobile')}</label>
              <input
                type="text"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder={t('finance.officer.ph_phone')}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('finance.officer.badge_id')}</label>
              <input
                type="text"
                disabled
                value={formData.empId}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-500 dark:text-zinc-400 font-mono font-bold cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Department & Corporate Role */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                2. Corporate Department & Role
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('finance.officer.legal_entity')}</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder={t('finance.officer.ph_entity')}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('finance.officer.assigned_branch')}</label>
              <input
                type="text"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                placeholder={t('finance.officer.ph_branch')}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('finance.officer.office_address')}</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder={t('finance.officer.ph_address')}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Regional & Preferences */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                3. System Language & Regional Preferences
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('finance.officer.interface_lang')}</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="en">English (Default)</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="bn">বাংলা (Bengali)</option>
                <option value="gu">ગુજરાતી (Gujarati)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('finance.officer.tz_clock')}</label>
              <select
                value={formData.timeZone}
                onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST +05:30)</option>
                <option value="UTC">UTC (Universal Time Coordinated)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST +04:00)</option>
                <option value="Asia/Singapore">Asia/Singapore (SGT +08:00)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(`${basePath}/profile`)}
            className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center gap-2"
          >
            {saving ? (
              <>
                <FleetIcons.Spinner className="w-3.5 h-3.5 animate-spin" />
                <span>{t('common.saving')}</span>
              </>
            ) : saved ? (
              <span className="flex items-center gap-1.5"><FleetIcons.Check className="w-3.5 h-3.5 text-white" /><span>{t('finance.officer.saved_success')}</span></span>
            ) : (
              <span className="flex items-center gap-1.5"><FleetIcons.Save className="w-3.5 h-3.5 text-white" /><span>{t('finance.officer.save_changes_btn')}</span></span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FinanceOfficerAccountSettingsPage;
