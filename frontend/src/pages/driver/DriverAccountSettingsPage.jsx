import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { useAuth } from '../../hooks/useAuth';
import { useDriverApp } from '../../hooks/driver/useDriverApp';
import Breadcrumb from '../../components/ui/Breadcrumb';

export const DriverAccountSettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const { profile, loadProfile } = useDriverApp();

  useEffect(() => {
    loadProfile().catch(() => {});
  }, [loadProfile]);

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

  useEffect(() => {
    if (user || profile) {
      const driverObj = user?.driver || profile;
      const depotName = driverObj?.depot?.name || (typeof driverObj?.depot === 'string' ? driverObj.depot : null) || 'Central Depot';
      const busNo =
        driverObj?.assignedBus?.bus_number ||
        driverObj?.assigned_bus_number ||
        driverObj?.assignedBusNumber ||
        driverObj?.assignedVehicle?.registration_number ||
        driverObj?.assigned_bus_no ||
        (typeof driverObj?.assignedBus === 'string' && isNaN(Number(driverObj.assignedBus)) ? driverObj.assignedBus : null) ||
        (driverObj?.assigned_bus_id ? `Bus #${driverObj.assigned_bus_id}` : 'Unassigned');
      const driverBadge = driverObj?.badge_id || driverObj?.code || driverObj?.emp_id || user?.enrollment_no || user?.code || (driverObj?.id ? `DRV-${driverObj.id}` : '—');
      const userLangCode = user?.language?.code || (user?.language_id === 2 ? 'hi' : user?.language_id === 3 ? 'mr' : 'en');

      setFormData({
        name: user?.name || user?.fullName || '',
        driverId: driverBadge,
        email: user?.email || '',
        phone: user?.phone || user?.mobile || '',
        emergencyPhone: driverObj?.emergency_contact || driverObj?.emergencyPhone || '',
        depot: depotName,
        assignedBus: busNo,
        licenseNumber: driverObj?.dl_number || driverObj?.licenseNumber || '',
        language: userLangCode,
        timezone: user?.timezone || 'Asia/Kolkata',
      });
    }
  }, [user, profile]);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await toast.promise(
        updateProfile({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          emergencyPhone: formData.emergencyPhone,
          language: formData.language,
          timezone: formData.timezone,
        }),
        {
          loading: 'Saving driver settings...',
          success: 'Driver settings updated successfully!',
          error: (err) => err?.message || 'Failed to save settings',
        }
      );
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      /* toast handles error */
    }
  };

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
              title="Back to Profile"
            >
              <FleetIcons.ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Driver Account Settings</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
                Update personal contact information, SOS numbers, and workstation preferences
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
          <span>Driver profile updated successfully across the VMOVEXA transit fleet ledger!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Personal Information</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Your verified name, email, and direct contact numbers</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Driver ID</label>
              <input
                type="text"
                readOnly
                value={formData.driverId}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-slate-600 dark:text-zinc-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Corporate Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Primary Mobile *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Emergency SOS Phone</label>
              <input
                type="text"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                placeholder="Enter SOS emergency contact number"
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Commercial Driving License (HMV)</label>
              <input
                type="text"
                readOnly
                value={formData.licenseNumber || 'Verified HMV License'}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-slate-600 dark:text-zinc-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Depot & Vehicle Assignment (Read-Only for Drivers) */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Depot & Vehicle Assignment</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">Assigned by Fleet Manager (Read-Only for Drivers)</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
              <FleetIcons.Shield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Fleet Managed</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Assigned Home Depot</label>
              <input
                type="text"
                readOnly
                value={formData.depot}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-300 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Current Assigned Bus</label>
              <input
                type="text"
                readOnly
                value={formData.assignedBus}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-slate-700 dark:text-zinc-300 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">App Preferred Language</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-600"
              >
                <option value="en">English (India)</option>
                <option value="hi">Hindi (हिंदी)</option>
                <option value="mr">Marathi (मराठी)</option>
                <option value="kn">Kannada (ಕನ್ನಡ)</option>
                <option value="te">Telugu (తెలుగు)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Time Zone</label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-600"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST +05:30)</option>
                <option value="UTC">UTC (GMT +00:00)</option>
                <option value="America/New_York">America/New_York (EST -05:00)</option>
                <option value="Europe/London">Europe/London (BST +01:00)</option>
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
            <span>Save Account Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default DriverAccountSettingsPage;

