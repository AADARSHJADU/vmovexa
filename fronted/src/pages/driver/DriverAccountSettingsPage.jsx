/* eslint-disable react-hooks/set-state-in-effect -- authenticated profile data initializes this editable form. */
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { useAuth } from '../../hooks/useAuth';
import { useDriverApp } from '../../hooks/driver/useDriverApp';
import { resolveFileUrl, uploadFile } from '../../api/services/upload.service';
import Breadcrumb from '../../components/ui/Breadcrumb';

export const DriverAccountSettingsPage = () => {
  const { t } = useTranslation();
  const { user, updateProfile, fetchMe } = useAuth();
  const { profile, activeRoute, loadProfile, loadActiveRoute } = useDriverApp();
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadProfile().catch(() => {});
    if (loadActiveRoute) loadActiveRoute().catch(() => {});
  }, [loadProfile, loadActiveRoute]);

  const [formData, setFormData] = useState({
    name: '',
    driverId: '—',
    email: '',
    phone: '',
    emergencyPhone: '',
    depot: '',
    assignedBus: '',
    licenseNumber: '',
    language: 'en',
    timezone: 'Asia/Kolkata',
  });

  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user || profile || activeRoute) {
      const driverObj = profile || user?.driver;
      const depotName =
        profile?.depot?.name ||
        user?.driver?.depot?.name ||
        profile?.assignedBus?.depot?.name ||
        user?.driver?.assignedBus?.depot?.name ||
        activeRoute?.assignedBus?.depot?.name ||
        (typeof profile?.depot === 'string' ? profile.depot : null) ||
        (typeof user?.driver?.depot === 'string' ? user.driver.depot : null) ||
        profile?.home_depot ||
        profile?.homeDepot ||
        '—';

      const busNo =
        profile?.assignedBus?.bus_number ||
        user?.driver?.assignedBus?.bus_number ||
        activeRoute?.assignedBus?.bus_number ||
        activeRoute?.vehicle?.bus_number ||
        profile?.assignedBus?.registration_number ||
        user?.driver?.assignedBus?.registration_number ||
        profile?.assigned_bus_number ||
        profile?.assignedBusNumber ||
        user?.driver?.assigned_bus_number ||
        user?.driver?.assignedBusNumber ||
        profile?.assignedVehicle?.registration_number ||
        user?.driver?.assignedVehicle?.registration_number ||
        profile?.assigned_bus_no ||
        (typeof profile?.assignedBus === 'string' && isNaN(Number(profile.assignedBus)) ? profile.assignedBus : null) ||
        (typeof user?.driver?.assignedBus === 'string' && isNaN(Number(user.driver.assignedBus)) ? user.driver.assignedBus : null) ||
        (profile?.assigned_bus_id ? `Bus #${profile.assigned_bus_id}` : null) ||
        (user?.driver?.assigned_bus_id ? `Bus #${user.driver.assigned_bus_id}` : null) ||
        'Unassigned';

      const driverBadge =
        profile?.badge_id ||
        profile?.code ||
        profile?.emp_id ||
        user?.driver?.badge_id ||
        user?.driver?.code ||
        user?.driver?.emp_id ||
        user?.enrollment_no ||
        user?.code ||
        (profile?.id ? `DRV-${profile.id}` : user?.driver?.id ? `DRV-${user.driver.id}` : '—');

      const userLangCode = user?.language?.code || (user?.language_id === 2 ? 'hi' : user?.language_id === 3 ? 'mr' : 'en');

      setFormData({
        name: user?.name || user?.fullName || profile?.name || '',
        driverId: driverBadge,
        email: user?.email || profile?.email || '',
        phone: user?.phone || user?.mobile || profile?.phone || '',
        emergencyPhone: driverObj?.emergency_contact || driverObj?.emergencyPhone || profile?.emergency_contact || '',
        depot: depotName,
        assignedBus: busNo,
        licenseNumber: driverObj?.dl_number || driverObj?.licenseNumber || profile?.dl_number || '',
        language: userLangCode,
        timezone: user?.timezone || 'Asia/Kolkata',
      });
      setAvatarUrl(user?.avatar_url || user?.avatarUrl || user?.avatar || profile?.avatar || '');
    }
  }, [user, profile, activeRoute]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPhoto(true);
      const uploaded = await uploadFile(file, 'avatar');
      const url = uploaded?.url || uploaded?.file_url || (typeof uploaded === 'string' ? uploaded : null);
      if (url) {
        await updateProfile({ avatar_url: url, avatarUrl: url });
        setAvatarUrl(url);
        if (fetchMe) await fetchMe().catch(() => {});
        toast.success('Profile photo updated successfully.');
      }
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setUploadingPhoto(true);
      await updateProfile({ avatar_url: null, avatarUrl: null });
      setAvatarUrl('');
      if (fetchMe) await fetchMe().catch(() => {});
      toast.success('Profile photo removed successfully.');
    } catch (err) {
      toast.error(err?.message || 'Failed to remove profile photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await toast.promise(
        updateProfile({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          emergencyPhone: formData.emergencyPhone,
          avatar_url: avatarUrl || null,
          avatarUrl: avatarUrl || null,
          language: formData.language,
          timezone: formData.timezone,
        }),
        {
          loading: 'Saving driver settings...',
          success: 'Driver settings updated successfully!',
          error: (err) => err?.message || 'Failed to save settings',
        }
      );
      if (fetchMe) await fetchMe().catch(() => {});
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      /* toast handles error */
    }
  };

  const currentAvatarSrc = avatarUrl
    ? resolveFileUrl(avatarUrl)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'Driver')}&background=0f172a&color=ffffff`;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-20">
      {/* Header */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Driver', path: '/driver/dashboard' },
            { label: 'Profile', path: '/driver/profile' },
            { label: 'Account Settings' },
          ]}
          className="mb-2"
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <Link
              to="/driver/profile"
              className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors"
              title={t('driver.account.back_profile')}
            >
              <FleetIcons.ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('driver.account.title')}</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
                {t('driver.account.subtitle')}
              </p>
            </div>
          </div>

          <Link
            to="/driver/profile"
            className="px-4 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl transition-colors self-start sm:self-auto"
          >
            View Profile
          </Link>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-900 dark:text-emerald-300 text-xs font-bold animate-in fade-in">
          <FleetIcons.Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{t('driver.account.updated_success')}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload Section */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-4">
            <img
              src={currentAvatarSrc}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'Driver')}&background=0f172a&color=ffffff`;
              }}
              alt={formData.name || 'Driver'}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 dark:border-zinc-700 shadow-md bg-slate-100 dark:bg-zinc-800 shrink-0"
            />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('driver.account.photo_title')}</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{t('driver.account.photo_desc')}</p>
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
                <span>{t('driver.account.remove_photo')}</span>
              </button>
            )}
            <label className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer w-full sm:w-auto">
              <input
                type="file"
                ref={fileInputRef}
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

        {/* Personal Details */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">{t('driver.account.personal_info')}</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{t('driver.account.personal_desc')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('common.full_name')} *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('driver.account.driver_id')}</label>
              <input
                type="text"
                readOnly
                value={formData.driverId}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-slate-600 dark:text-zinc-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('driver.account.corporate_email')}</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('driver.account.primary_mobile')}</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('driver.account.emergency_sos')}</label>
              <input
                type="text"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                placeholder={t('driver.account.sos_placeholder')}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('driver.account.hmv_license')}</label>
              <input
                type="text"
                readOnly
                value={formData.licenseNumber || '—'}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-slate-600 dark:text-zinc-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Depot & Vehicle Assignment (Read-Only for Drivers) */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">{t('driver.account.depot_assignment')}</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">{t('driver.account.depot_desc')}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
              <FleetIcons.Shield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{t('driver.account.fleet_managed')}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('driver.account.home_depot')}</label>
              <input
                type="text"
                readOnly
                value={formData.depot}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-300 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('driver.account.assigned_bus')}</label>
              <input
                type="text"
                readOnly
                value={formData.assignedBus}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-slate-700 dark:text-zinc-300 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('driver.account.app_language')}</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-600"
              >
                <option value="en">{t('common.lang_en')}</option>
                <option value="hi">{t('common.lang_hi')}</option>
                <option value="mr">{t('common.lang_mr')}</option>
                <option value="kn">{t('common.lang_kn')}</option>
                <option value="te">{t('common.lang_te')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('driver.account.timezone')}</label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-600"
              >
                <option value="Asia/Kolkata">{t('common.tz_kolkata')}</option>
                <option value="UTC">{t('common.tz_utc')}</option>
                <option value="America/New_York">{t('common.tz_ny')}</option>
                <option value="Europe/London">{t('common.tz_london')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <Link
            to="/driver/profile"
            className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-colors text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <FleetIcons.Check className="w-4 h-4" />
            <span>{t('driver.account.save_btn')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default DriverAccountSettingsPage;

