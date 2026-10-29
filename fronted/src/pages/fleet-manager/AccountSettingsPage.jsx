/* eslint-disable react-hooks/set-state-in-effect -- authenticated profile hydrates this editable form */
import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { FleetIcons } from '../../components/FleetIcons';
import { useAuth } from '../../hooks/useAuth';
import { resolveFileUrl, uploadFile } from '../../api/services/upload.service';

export const AccountSettingsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      const userLangCode = user.language?.code || (user.language_id === 2 ? 'hi' : user.language_id === 4 ? 'kn' : user.language_id === 3 ? 'mr' : 'en');
      setFormData({
        fullName: user.name || user.fullName || '',
        email: user.email || '',
        mobile: user.phone || user.mobile || '',
        empId: user.enrollment_no || user.code || (user.id ? `OP-${user.id}` : '—'),
        role: user.role?.name || user.role || 'Fleet Operator',
        companyName: user.organization?.name || '',
        branch: user.fleetOperatorProfile?.location || '',
        address: user.organization?.office_address || '',
        language: userLangCode,
        timeZone: user.timezone || 'Asia/Kolkata',
      });
      setAvatarUrl(user.avatar_url || user.avatarUrl || '');
    }
  }, [user]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPhoto(true);
      const uploaded = await uploadFile(file, 'avatar');
      const url = uploaded?.url || uploaded?.file_url || (typeof uploaded === 'string' ? uploaded : null);
      if (url) {
        await updateProfile({ avatar_url: url, avatarUrl: url });
        await fetchMe?.();
        setAvatarUrl(url);
        toast.success('Photo updated successfully.');
      }
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await updateProfile({ avatar_url: null, avatarUrl: null });
      await fetchMe?.();
      setAvatarUrl('');
      toast.success('Photo removed successfully.');
    } catch (err) {
      toast.error(err?.message || 'Failed to remove photo');
    }
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
          loading: 'Saving profile changes...',
          success: 'Profile updated successfully!',
          error: (err) => err?.message || 'Failed to update profile',
        }
      );
      setSaved(true);
      setTimeout(() => navigate('/fleet-operator/profile'), 1000);
    } catch {
      /* toast handles error */
    }
  };

  const currentAvatarSrc = avatarUrl
    ? resolveFileUrl(avatarUrl)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName || 'Fleet Manager')}&background=0f172a&color=ffffff`;

  return (
    <div className="w-full space-y-6 pb-20">
      {/* 1. Global Standard Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Fleet Operator', path: '/fleet-operator/dashboard' },
          { label: 'Profile', path: '/fleet-operator/profile' },
          { label: 'Account Settings' },
        ]}
        className="mb-2"
      />

      {/* Header Banner */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => navigate('/fleet-operator/profile')} 
            className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
            title={t('common.back_to_profile')}
          >
            <FleetIcons.ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('fleet.profile.account_settings')}</h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{t('fleet.account.subtitle')}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => navigate('/fleet-operator/profile')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FleetIcons.Check className="w-4 h-4 text-white" />
            <span>{saved ? 'Saved!' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* 2. Photo Upload Section */}
      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-4">
          <img
            src={currentAvatarSrc}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName || 'Fleet Manager')}&background=0f172a&color=ffffff`;
            }}
            alt={formData.fullName || 'User'}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 dark:border-zinc-700 shadow-md bg-slate-100 dark:bg-zinc-800 shrink-0"
          />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('fleet.account.avatar_photo')}</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{t('fleet.account.avatar_desc')}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {avatarUrl && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer w-full sm:w-auto"
            >
              <FleetIcons.Trash className="w-3.5 h-3.5" />
              <span>{t('fleet.account.remove_photo')}</span>
            </button>
          )}
          <label className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer w-full sm:w-auto">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={uploadingPhoto}
            />
            <FleetIcons.Camera className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
            <span>{uploadingPhoto ? 'Uploading...' : 'Change Photo'}</span>
          </label>
        </div>
      </div>

      {/* 3. Form Containers */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: Personal Information */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5 transition-colors">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                1. Personal Information
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('common.full_name')}</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('common.email')}</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.details.phone_number')}</label>
              <input
                type="text"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.account.operator_id')}</label>
              <input
                type="text"
                disabled
                value={formData.empId}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-100 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-xs text-slate-500 dark:text-zinc-400 font-mono font-bold cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Organization Information */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5 transition-colors">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                2. Organization Information
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.account.company_name')}</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.account.branch_office')}</label>
              <input
                type="text"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.account.office_address')}</label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Preferences */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5 transition-colors">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                3. Regional Preferences & Security
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('common.language', 'Language')}</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
              >
                <option value="en">{t('common.lang_en')}</option>
                <option value="hi">{t('common.lang_hi')}</option>
                <option value="kn">{t('common.lang_kn')}</option>
                <option value="mr">{t('common.lang_mr')}</option>
                <option value="te">{t('common.lang_te')}</option>
                <option value="ta">{t('common.lang_ta')}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.settings.time_zone')}</label>
              <select
                value={formData.timeZone}
                onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
              >
                <option value="Asia/Kolkata">{t('fleet.settings.tz_kolkata')}</option>
                <option value="UTC">{t('fleet.settings.tz_utc')}</option>
                <option value="America/New_York">{t('fleet.settings.tz_new_york')}</option>
                <option value="Europe/London">{t('fleet.settings.tz_london')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
          <button
            type="button"
            onClick={() => navigate('/fleet-operator/profile')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <FleetIcons.Check className="w-4 h-4 text-white" />
            <span>{saved ? 'Saved!' : 'Save Account Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountSettingsPage;
