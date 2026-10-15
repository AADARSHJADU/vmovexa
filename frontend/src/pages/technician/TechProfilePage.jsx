import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useAuth } from '../../hooks/useAuth';
import { useTechnicianApp } from '../../hooks/technician/useTechnicianApp';
import { resolveFileUrl } from '../../api/services/upload.service';

export const TechProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { devices, workOrders, vehicles, loadDevices, loadWorkOrders, loadVehicles } = useTechnicianApp();

  useEffect(() => {
    if (loadDevices) loadDevices().catch(() => {});
    if (loadWorkOrders) loadWorkOrders().catch(() => {});
    if (loadVehicles) loadVehicles().catch(() => {});
  }, [loadDevices, loadWorkOrders, loadVehicles]);

  const deviceCount = Array.isArray(devices) ? devices.length : (devices?.rows?.length || devices?.total || 0);
  const orderCount = Array.isArray(workOrders) ? workOrders.length : (workOrders?.rows?.length || workOrders?.total || 0);
  const busCount = Array.isArray(vehicles) ? vehicles.length : (vehicles?.rows?.length || vehicles?.total || 0);

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
              { label: 'Technician', path: '/technician/dashboard' },
              { label: 'Profile' }
            ]}
            className="mb-2"
          />
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">Profile & Technician Account</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Manage field technician credentials, depot assignment, security, and engineering support.</p>
        </div>

        <button
          onClick={handleLogout}
          className="px-5 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <FleetIcons.Logout className="w-4 h-4" />
          <span>Logout Account</span>
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
            <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5">Technician ID: {techId}</div>
          </div>
        </div>

        {/* 3 Core Stat Pills matching Fleet Manager */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 px-5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
            <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase">Devices</div>
            <div className="font-black text-lg text-slate-900 dark:text-white mt-0.5">{deviceCount}</div>
          </div>
          <div className="p-3 px-5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
            <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase">Work Orders</div>
            <div className="font-black text-lg text-blue-700 dark:text-blue-400 mt-0.5">{orderCount}</div>
          </div>
          <div className="p-3 px-5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
            <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase">Vehicles Serviced</div>
            <div className="font-black text-lg text-emerald-600 dark:text-emerald-400 mt-0.5">{busCount}</div>
          </div>
        </div>
      </div>

      {/* 3. Account & Settings Web Grid matching Fleet Manager */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account & Security Section */}
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
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Account Settings</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Hardware field credentials, assigned depot, and contact info</p>
                </div>
              </div>
              <span className="text-slate-600 dark:text-zinc-400 font-bold text-xs group-hover:translate-x-0.5 transition-transform">→</span>
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
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Security & Password</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Change technician password and device diagnostic access</p>
                </div>
              </div>
              <span className="text-slate-600 dark:text-zinc-400 font-bold text-xs group-hover:translate-x-0.5 transition-transform">→</span>
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
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Notification Settings</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Urgent fault dispatches, work order requests, and alerts</p>
                </div>
              </div>
              <span className="text-slate-600 dark:text-zinc-400 font-bold text-xs group-hover:translate-x-0.5 transition-transform">→</span>
            </div>
          </div>
        </div>

        {/* Helpdesk & Legal Section */}
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
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Help & Support</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Wiring schematics, installation manuals, and field support</p>
                </div>
              </div>
              <span className="text-slate-600 dark:text-zinc-400 font-bold text-xs group-hover:translate-x-0.5 transition-transform">→</span>
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
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Privacy Policy</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Hardware telemetry confidentiality and data protection</p>
                </div>
              </div>
              <span className="text-slate-600 dark:text-zinc-400 font-bold text-xs group-hover:translate-x-0.5 transition-transform">→</span>
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
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Terms & Conditions</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Field service protocols, warranty, and technician guidelines</p>
                </div>
              </div>
              <span className="text-slate-600 dark:text-zinc-400 font-bold text-xs group-hover:translate-x-0.5 transition-transform">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechProfilePage;
