import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useAuth } from '../../hooks/useAuth';
import { useFinanceRole } from '../../hooks/finance/useFinanceRole';
import { resolveFileUrl, uploadFile } from '../../api/services/upload.service';

export const FinanceProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/finance' : '/finance';
  const { user, updateProfile, fetchMe, logout } = useAuth();
  const { kpis, invoices, payments, loadKpis, loadInvoices, loadPayments } = useFinanceRole();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (loadKpis) loadKpis().catch(() => {});
    if (loadInvoices) loadInvoices().catch(() => {});
    if (loadPayments) loadPayments().catch(() => {});
  }, [loadKpis, loadInvoices, loadPayments]);

  const totalRev = kpis?.totalRevenue != null ? `₹${Number(kpis.totalRevenue).toLocaleString('en-IN')}` : '—';
  const invoiceCount = kpis?.totalInvoices != null ? kpis.totalInvoices : (Array.isArray(invoices) ? invoices.length : 0);
  const paymentCount = kpis?.totalPayments != null ? `₹${Number(kpis.totalPayments).toLocaleString('en-IN')}` : (Array.isArray(payments) ? payments.length : 0);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  const handleAvatarUpload = async (e) => {
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

    setUploadingAvatar(true);
    const toastId = toast.loading('Uploading profile picture...');
    try {
      const uploaded = await uploadFile(file, 'avatar');
      const url = uploaded?.url || uploaded?.file_url || (typeof uploaded === 'string' ? uploaded : null);
      if (url) {
        await updateProfile({
          avatar_url: url,
          avatarUrl: url,
        });
        if (fetchMe) await fetchMe().catch(() => {});
        toast.success('Profile picture updated successfully!', { id: toastId });
      } else {
        toast.error('Upload succeeded but no image URL was returned.', { id: toastId });
      }
    } catch {
      toast.error('Failed to upload profile picture.', { id: toastId });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarRemove = async () => {
    if (!avatarRaw || uploadingAvatar) return;
    setUploadingAvatar(true);
    const toastId = toast.loading('Removing profile picture...');
    try {
      await updateProfile({ avatar_url: null, avatarUrl: null });
      if (fetchMe) await fetchMe().catch(() => {});
      toast.success('Profile picture removed.', { id: toastId });
    } catch (error) {
      toast.error(error?.message || 'Failed to remove profile picture.', { id: toastId });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const displayName = user?.name || user?.fullName || 'Finance Officer';
  const displayRole = user?.role?.name || user?.role || 'Finance Officer';
  const orgName = user?.organization?.name || user?.company_name || 'VMOVEXA Private Limited';
  const finId = user?.enrollment_no || user?.code || (user?.id ? `FIN-${user.id}` : 'FIN-101');
  const avatarRaw = user?.avatar_url || user?.avatarUrl;
  const avatar = avatarRaw
    ? resolveFileUrl(avatarRaw)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0f172a&color=ffffff`;

  return (
    <div className="w-full space-y-6 pb-20">
      {/* 1. Web Header */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <Breadcrumb
            items={[
              { label: basePath.startsWith('/superadmin') ? 'Super Admin' : 'Finance Portal', path: `${basePath}/dashboard` },
              { label: 'Finance Profile' },
            ]}
            className="mb-2"
          />

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight mt-1">{t('finance.profile.title')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">{t('finance.profile.subtitle')}</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`${basePath}/profile/account`}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <FleetIcons.Settings className="w-4 h-4" />
            <span>{t('finance.profile.edit_profile')}</span>
          </Link>

          <button
            onClick={handleLogout}
            className="px-5 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <FleetIcons.Logout className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            <span>{t('finance.profile.logout')}</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Profile Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
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
              title={t('finance.profile.pic_title')}
              className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer transition-opacity"
            >
              {uploadingAvatar ? (
                <FleetIcons.Refresh className="w-4 h-4 text-white animate-spin mb-0.5" />
              ) : (
                <FleetIcons.Camera className="w-4 h-4 text-white mb-0.5" />
              )}
              <span>{uploadingAvatar ? t('finance.profile.uploading') : t('finance.profile.change')}</span>
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
                title="Remove profile picture"
                aria-label="Remove profile picture"
                className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white border-2 border-white dark:border-zinc-900 shadow-sm flex items-center justify-center disabled:opacity-60"
              >
                <FleetIcons.Close className="w-3.5 h-3.5 text-white" />
              </button>
            )}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900"></span>
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{displayName}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 text-xs font-bold">
                {displayRole}
              </span>
              <Link
                to={`${basePath}/profile/account`}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold flex items-center gap-1 bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100/70 dark:hover:bg-blue-900/50 px-2 py-0.5 rounded-md transition-colors"
                title={t('finance.profile.edit_personal_title')}
              >
                <FleetIcons.Edit className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span>{t('common.edit')}</span>
              </Link>
            </div>
            <div className="text-xs text-slate-600 dark:text-zinc-400 font-medium mt-1">{orgName}</div>
            <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5">Finance ID: {finId}</div>
          </div>
        </div>

        {/* 3 Core Stat Pills */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 px-5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
            <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase">{t('finance.profile.revenue')}</div>
            <div className="font-black text-lg text-slate-900 dark:text-white mt-0.5">{totalRev}</div>
          </div>
          <div className="p-3 px-5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
            <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase">{t('finance.profile.invoices')}</div>
            <div className="font-black text-lg text-blue-700 dark:text-blue-400 mt-0.5">{invoiceCount}</div>
          </div>
          <div className="p-3 px-5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
            <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase">{t('finance.profile.settled')}</div>
            <div className="font-black text-lg text-emerald-600 dark:text-emerald-400 mt-0.5">{paymentCount}</div>
          </div>
        </div>
      </div>

      {/* 3. Account & Settings Web Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* {t('finance.profile.account_security')} Section */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Account & Security
          </h3>

          <div className="space-y-2.5">
            {/* 1. {t('finance.profile.personal_settings')} */}
            <div
              onClick={() => navigate(`${basePath}/profile/account`)}
              className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 hover:bg-blue-50/70 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-100/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                  <FleetIcons.User className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                    Personal Profile Settings
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    {t('finance.profile.personal_settings_desc')}
                  </p>
                </div>
              </div>
              <FleetIcons.ArrowRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform" />
            </div>

            {/* 2. {t('finance.profile.corp_settings')} */}
            <div
              onClick={() => navigate(`${basePath}/settings`)}
              className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 hover:bg-indigo-50/60 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-100/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
                  <FleetIcons.Building className="w-5 h-5 text-indigo-700 dark:text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                    Corporate & Invoicing Settings
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    {t('finance.profile.corp_settings_desc')}
                  </p>
                </div>
              </div>
              <FleetIcons.ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-transform" />
            </div>

            {/* 3. Security & Password */}
            <div
              onClick={() => navigate(`${basePath}/settings/security`)}
              className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center justify-center">
                  <FleetIcons.Key className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t('common.security_password')}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('finance.profile.security_desc')}</p>
                </div>
              </div>
              <FleetIcons.ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-transform" />
            </div>

            {/* 4. Notification Settings */}
            <div
              onClick={() => navigate(`${basePath}/settings/notifications`)}
              className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center justify-center">
                  <FleetIcons.Bell className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t('common.notification_settings')}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('finance.profile.notif_desc')}</p>
                </div>
              </div>
              <FleetIcons.ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* {t('finance.profile.helpdesk_legal')} Section */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Helpdesk & Legal
          </h3>

          <div className="space-y-2.5">
            <div
              onClick={() => navigate(`${basePath}/help`)}
              className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center justify-center">
                  <FleetIcons.Headset className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t('common.help_and_support')}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('finance.profile.support_desc')}</p>
                </div>
              </div>
              <FleetIcons.ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-transform" />
            </div>

            <div
              onClick={() => navigate(`${basePath}/privacy`)}
              className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center justify-center">
                  <FleetIcons.Shield className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t('common.privacy_policy')}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('finance.profile.privacy_desc')}</p>
                </div>
              </div>
              <FleetIcons.ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-transform" />
            </div>

            <div
              onClick={() => navigate(`${basePath}/terms`)}
              className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center justify-center">
                  <FleetIcons.Document className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t('common.terms_conditions')}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('finance.profile.terms_desc')}</p>
                </div>
              </div>
              <FleetIcons.ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceProfilePage;
