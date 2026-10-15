import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { FleetIcons } from '../../components/FleetIcons';
import { useAuth } from '../../hooks/useAuth';
import { useFleetManager } from '../../hooks/fleet/useFleetManager';
import { useFleetVehicle } from '../../hooks/fleet/useFleetVehicle';
import { useFleetDriver } from '../../hooks/fleet/useFleetDriver';
import { resolveFileUrl } from '../../api/services/upload.service';

export const ProfileSettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { fleets, loadFleets } = useFleetManager();
  const { vehicles, loadVehicles, pagination: vehiclePagination } = useFleetVehicle();
  const { drivers, loadDrivers } = useFleetDriver();

  useEffect(() => {
    loadFleets().catch(() => {});
    loadVehicles({ page: 1, limit: 1 }).catch(() => {});
    loadDrivers().catch(() => {});
  }, [loadFleets, loadVehicles, loadDrivers]);

  const fleetCount = Array.isArray(fleets) ? fleets.length : (fleets?.rows?.length || fleets?.total || 0);
  const vehicleCount = vehiclePagination?.total ?? (Array.isArray(vehicles) ? vehicles.length : 0);
  const driverCount = Array.isArray(drivers) ? drivers.length : (drivers?.rows?.length || drivers?.total || 0);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  const displayName = user?.name || user?.fullName || 'Fleet Manager';
  const displayRole = user?.role?.name || user?.role || 'Fleet Operator';
  const orgName = user?.organization?.name || user?.companyName || 'VMOVEXA Transport Solutions';
  const opId = user?.enrollment_no || user?.code || `OP-${user?.id || '987654'}`;
  const avatarRaw = user?.avatar_url || user?.avatarUrl;
  const avatar = avatarRaw
    ? resolveFileUrl(avatarRaw)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'Fleet Manager')}&background=0f172a&color=ffffff`;

  return (
    <div className="w-full space-y-6 pb-20">
      {/* 1. Global Standard Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Fleet Manager', path: '/fleet-manager/dashboard' },
          { label: 'Operator Profile' },
        ]}
        className="mb-2"
      />

      {/* Header Banner */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm transition-colors">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Profile & Fleet Account</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Manage operator credentials, enterprise preferences, security, and support.</p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <FleetIcons.LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
          <span>Logout Account</span>
        </button>
      </div>

      {/* 2. Hero Profile Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
        <div className="flex items-center gap-5">
          <div className="relative">
            <img
              src={avatar}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'Fleet Manager')}&background=0f172a&color=ffffff`;
              }}
              alt={displayName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-white dark:border-zinc-700 shadow-md bg-slate-100 dark:bg-zinc-800 shrink-0"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900"></span>
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{displayName}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold">
                {displayRole}
              </span>
            </div>
            <div className="text-xs text-slate-600 dark:text-zinc-400 font-medium mt-1">{orgName}</div>
            <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5">Operator ID: {opId}</div>
          </div>
        </div>

        {/* 3 Core Stat Pills */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 px-5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
            <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase">Fleets</div>
            <div className="font-black text-lg text-slate-900 dark:text-white mt-0.5">{fleetCount}</div>
          </div>
          <div className="p-3 px-5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
            <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase">Vehicles</div>
            <div className="font-black text-lg text-slate-900 dark:text-white mt-0.5">{vehicleCount}</div>
          </div>
          <div className="p-3 px-5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
            <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase">Drivers</div>
            <div className="font-black text-lg text-slate-900 dark:text-white mt-0.5">{driverCount}</div>
          </div>
        </div>
      </div>

      {/* 3. Account & Settings Web Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Account & Security Section */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4 transition-colors">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Account & Security
          </h3>

          <div className="space-y-2.5">
            <div
              onClick={() => navigate('/fleet-manager/profile/account')}
              className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 hover:bg-blue-50/60 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700/80 hover:border-blue-200 dark:hover:border-zinc-600 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-700/60 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
                  <FleetIcons.Driver className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Account Settings</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Personal details, role, and organization info</p>
                </div>
              </div>
              <FleetIcons.ArrowRight className="w-4 h-4 text-slate-400 dark:text-zinc-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
            </div>

            <div
              onClick={() => navigate('/fleet-manager/profile/security')}
              className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700/80 hover:border-slate-300 dark:hover:border-zinc-600 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-700/60 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
                  <FleetIcons.Key className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Security & Password</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Change password and security credentials</p>
                </div>
              </div>
              <FleetIcons.ArrowRight className="w-4 h-4 text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all" />
            </div>

            <div
              onClick={() => navigate('/fleet-manager/profile/notifications')}
              className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700/80 hover:border-slate-300 dark:hover:border-zinc-600 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-700/60 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
                  <FleetIcons.Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Notification Settings</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Push alerts, email reports, and SMS triggers</p>
                </div>
              </div>
              <FleetIcons.ArrowRight className="w-4 h-4 text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </div>

        {/* Support & Legal Information Section */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4 transition-colors">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Helpdesk & Legal
          </h3>

          <div className="space-y-2.5">
            <div
              onClick={() => navigate('/fleet-manager/help')}
              className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700/80 hover:border-slate-300 dark:hover:border-zinc-600 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-700/60 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
                  <FleetIcons.Headset className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Help & Support</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">FAQs, user guides, and direct support desk</p>
                </div>
              </div>
              <FleetIcons.ArrowRight className="w-4 h-4 text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all" />
            </div>

            <div
              onClick={() => navigate('/fleet-manager/privacy')}
              className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700/80 hover:border-slate-300 dark:hover:border-zinc-600 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-700/60 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
                  <FleetIcons.Shield className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Privacy Policy</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Data security, encryption, and privacy rights</p>
                </div>
              </div>
              <FleetIcons.ArrowRight className="w-4 h-4 text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all" />
            </div>

            <div
              onClick={() => navigate('/fleet-manager/terms')}
              className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700/80 hover:border-slate-300 dark:hover:border-zinc-600 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-700/60 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
                  <FleetIcons.FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Terms & Conditions</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Service level agreements and governing policies</p>
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

export default ProfileSettingsPage;
