import { useEffect, useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useAuth } from '../../hooks/useAuth';
import { useTechnicianApp } from '../../hooks/technician/useTechnicianApp';
import { resolveFileUrl } from '../../api/services/upload.service';

export const TechProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { devices, workOrders, stats, loadDevices, loadWorkOrders, loadStats } = useTechnicianApp();

  useEffect(() => {
    if (loadStats) loadStats().catch(() => {});
    if (loadDevices) loadDevices().catch(() => {});
    if (loadWorkOrders) loadWorkOrders().catch(() => {});
  }, [loadStats, loadDevices, loadWorkOrders]);

  const orderList = useMemo(() => (Array.isArray(workOrders) ? workOrders : (workOrders?.rows || [])), [workOrders]);

  // Distinct vehicles serviced (work order status is resolved, closed, or completed)
  const fallbackServicedVehiclesCount = useMemo(() => {
    const set = new Set();
    orderList.forEach((wo) => {
      const st = (wo.status || '').toLowerCase();
      if (['resolved', 'closed', 'completed'].includes(st)) {
        const idOrPlate = wo.vehicle_id || wo.bus_number;
        if (idOrPlate) set.add(String(idOrPlate));
      }
    });
    return set.size;
  }, [orderList]);

  const deviceCount = stats?.totalDevices ?? (Array.isArray(devices) ? devices.length : (devices?.rows?.length || devices?.total || 0));
  const orderCount = stats?.totalWorkOrders ?? (Array.isArray(workOrders) ? workOrders.length : (workOrders?.rows?.length || workOrders?.total || 0));
  const vehiclesServicedCount = stats?.vehiclesServiced ?? fallbackServicedVehiclesCount;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  const displayName = user?.name || user?.fullName || 'Hardware Technician';
  const displayRole = user?.role?.name || user?.role || 'Field Engineer';
  const orgName = user?.organization?.name || user?.agency || 'Central Fleet Engineering Depot';
  const techId = user?.enrollment_no || user?.code || (user?.id ? `TECH-${user.id}` : 'TECH-501');
  const avatarRaw = user?.avatar_url || user?.avatarUrl;
  const avatar = avatarRaw
    ? resolveFileUrl(avatarRaw)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0f172a&color=ffffff`;

  return (
    <div className="w-full space-y-6 pb-20">
      {/* 1. Web Header matching Fleet Manager */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <Breadcrumb
            items={[
              { label: t('nav.technician'), path: '/technician/dashboard' },
              { label: t('nav.profile') }
            ]}
            className="mb-2"
          />
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">{t('technician.profile.title')}</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{t('technician.profile.subtitle')}</p>
        </div>

        <button
          onClick={handleLogout}
          className="px-5 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <FleetIcons.Logout className="w-4 h-4" />
          <span>{t('auth.logout')}</span>
        </button>
      </div>

      {/* 2. Hero Profile Card matching Fleet Manager */}
      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <img
              src={avatar}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0f172a&color=ffffff`;
              }}
              alt={displayName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-white dark:border-zinc-800 shadow-md bg-slate-100 dark:bg-zinc-800"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900"></span>
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{displayName}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-bold">
                {displayRole}
              </span>
            </div>
            <div className="text-xs text-slate-600 dark:text-zinc-300 font-medium mt-1">{orgName}</div>
            <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5">{t('technician.profile.tech_id_label')} {techId}</div>
          </div>
        </div>

        {/* 3 Core Stat Pills matching Fleet Manager */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 px-5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
            <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase">{t('technician.profile.devices')}</div>
            <div className="font-black text-lg text-slate-900 dark:text-white mt-0.5">{deviceCount}</div>
          </div>
          <div className="p-3 px-5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
            <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase">{t('technician.profile.work_orders')}</div>
            <div className="font-black text-lg text-blue-700 dark:text-blue-400 mt-0.5">{orderCount}</div>
          </div>
          <div className="p-3 px-5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
            <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase">{t('technician.profile.vehicles_serviced')}</div>
            <div className="font-black text-lg text-emerald-600 dark:text-emerald-400 mt-0.5">{vehiclesServicedCount}</div>
          </div>
        </div>
      </div>

      {/* 3. Account & Settings Web Grid matching Fleet Manager */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* {t('technician.profile.account_security')} Section */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Account & Security
          </h3>

          <div className="space-y-2.5">
            <div
              onClick={() => navigate('/technician/profile/account')}
              className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 hover:bg-blue-50/60 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center justify-center">
                  <FleetIcons.Driver className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t('technician.account.title')}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('technician.profile.account_desc')}</p>
                </div>
              </div>
              <FleetIcons.ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-transform" />
            </div>

            <div
              onClick={() => navigate('/technician/profile/security')}
              className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center justify-center">
                  <FleetIcons.Key className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t('technician.password.title')}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('technician.profile.security_desc')}</p>
                </div>
              </div>
              <FleetIcons.ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-transform" />
            </div>

            <div
              onClick={() => navigate('/technician/profile/notifications')}
              className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center justify-center">
                  <FleetIcons.Bell className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t('technician.notifications.settings_title')}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('technician.profile.notif_desc')}</p>
                </div>
              </div>
              <FleetIcons.ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* {t('technician.profile.helpdesk_legal')} Section */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Helpdesk & Legal
          </h3>

          <div className="space-y-2.5">
            <div
              onClick={() => navigate('/technician/help')}
              className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center justify-center">
                  <FleetIcons.Headset className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t('common.help_and_support')}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('technician.profile.support_desc')}</p>
                </div>
              </div>
              <FleetIcons.ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-transform" />
            </div>

            <div
              onClick={() => navigate('/technician/privacy')}
              className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center justify-center">
                  <FleetIcons.Shield className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t('common.privacy_policy')}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('technician.profile.privacy_desc')}</p>
                </div>
              </div>
              <FleetIcons.ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-transform" />
            </div>

            <div
              onClick={() => navigate('/technician/terms')}
              className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center justify-center">
                  <FleetIcons.Document className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t('common.terms_conditions')}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('technician.profile.terms_desc')}</p>
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

export default TechProfilePage;
