import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { useAuth } from '../../hooks/useAuth';
import { useAdvertiserRole } from '../../hooks/advertiser/useAdvertiserRole';
import { resolveFileUrl } from '../../api/services/upload.service';
import Breadcrumb from '../../components/ui/Breadcrumb';

export const AdvertiserProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { campaigns, wallet, loadCampaigns, loadWallet } = useAdvertiserRole();

  useEffect(() => {
    if (loadCampaigns) loadCampaigns({ page: 1, limit: 10 }).catch(() => {});
    if (loadWallet) loadWallet().catch(() => {});
  }, [loadCampaigns, loadWallet]);

  const campaignCount = Array.isArray(campaigns) ? campaigns.length : (campaigns?.rows?.length || campaigns?.total || 0);
  const walletBalance = wallet?.balance != null ? `₹${Number(wallet.balance).toLocaleString('en-IN')}` : '₹0';
  const activeCampaigns = Array.isArray(campaigns)
    ? campaigns.filter((c) => String(c.status).toLowerCase() === 'active').length
    : (campaignCount > 0 ? campaignCount : 0);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  const displayName = user?.name || user?.fullName || 'Advertiser Partner';
  const displayRole = user?.role?.name || user?.role || 'Media Advertiser';
  const orgName = user?.advertiser?.company_name || user?.advertiser?.name || user?.organization?.name || user?.company_name || user?.companyName || 'Corporate Transit Advertising';
  const advId = user?.advertiser?.code || user?.enrollment_no || user?.code || (user?.id ? `ADV-${user.id}` : 'ADV-001');
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
              { label: 'Dashboard', to: '/advertiser/dashboard' },
              { label: 'Advertiser Profile' }
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">Profile & Advertiser Account</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Manage advertiser credentials, media brand preferences, security, and billing support.</p>
        </div>

        <button
          onClick={handleLogout}
          className="px-5 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-all flex items-center gap-2"
        >
          <span>🚪</span>
          <span>Logout Account</span>
        </button>
      </div>

      {/* 2. Hero Profile Card matching Fleet Manager */}
      <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <img
              src={avatar}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0f172a&color=ffffff`;
              }}
              alt={displayName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md bg-slate-100"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"></span>
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-black text-slate-900">{displayName}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                {displayRole}
              </span>
            </div>
            <div className="text-xs text-slate-600 font-medium mt-1">{orgName}</div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">Advertiser ID: {advId}</div>
          </div>
        </div>

        {/* 3 Core Stat Pills matching Fleet Manager */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 px-5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Campaigns</div>
            <div className="font-black text-lg text-slate-900 mt-0.5">{campaignCount}</div>
          </div>
          <div className="p-3 px-5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Active</div>
            <div className="font-black text-lg text-emerald-600 mt-0.5">{activeCampaigns}</div>
          </div>
          <div className="p-3 px-5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Wallet Balance</div>
            <div className="font-black text-lg text-blue-700 mt-0.5">{walletBalance}</div>
          </div>
        </div>
      </div>

      {/* 3. Account & Settings Web Grid matching Fleet Manager */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account & Security Section */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Account & Security
          </h3>

          <div className="space-y-2.5">
            <div
              onClick={() => navigate('/advertiser/profile/account')}
              className="p-4 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-200 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
                  <FleetIcons.Driver className="w-5 h-5 text-slate-700" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Account Settings</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Corporate media details, business contacts, and GST info</p>
                </div>
              </div>
              <span className="text-slate-600 font-bold text-xs group-hover:translate-x-0.5 transition-transform">→</span>
            </div>

            <div
              onClick={() => navigate('/advertiser/profile/security')}
              className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-400 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
                  <FleetIcons.Key className="w-5 h-5 text-slate-700" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Security & Password</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Change password and corporate account security</p>
                </div>
              </div>
              <span className="text-slate-600 font-bold text-xs group-hover:translate-x-0.5 transition-transform">→</span>
            </div>

            <div
              onClick={() => navigate('/advertiser/profile/notifications')}
              className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-400 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
                  <FleetIcons.Bell className="w-5 h-5 text-slate-700" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Notification Settings</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Campaign approvals, proof-of-play alerts, and billing receipts</p>
                </div>
              </div>
              <span className="text-slate-600 font-bold text-xs group-hover:translate-x-0.5 transition-transform">→</span>
            </div>
          </div>
        </div>

        {/* Helpdesk & Legal Section */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Helpdesk & Legal
          </h3>

          <div className="space-y-2.5">
            <div
              onClick={() => navigate('/advertiser/help')}
              className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-400 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
                  <FleetIcons.Headset className="w-5 h-5 text-slate-700" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Help & Support</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Campaign FAQs, media guidelines, and advertiser support</p>
                </div>
              </div>
              <span className="text-slate-600 font-bold text-xs group-hover:translate-x-0.5 transition-transform">→</span>
            </div>

            <div
              onClick={() => navigate('/advertiser/privacy')}
              className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-400 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
                  <FleetIcons.Shield className="w-5 h-5 text-slate-700" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Privacy Policy</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Advertiser data security, analytics compliance, and privacy</p>
                </div>
              </div>
              <span className="text-slate-600 font-bold text-xs group-hover:translate-x-0.5 transition-transform">→</span>
            </div>

            <div
              onClick={() => navigate('/advertiser/terms')}
              className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-400 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
                  <FleetIcons.Document className="w-5 h-5 text-slate-700" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Terms & Conditions</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Proof-of-play SLA, advertising terms, and refund policy</p>
                </div>
              </div>
              <span className="text-slate-600 font-bold text-xs group-hover:translate-x-0.5 transition-transform">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvertiserProfilePage;
