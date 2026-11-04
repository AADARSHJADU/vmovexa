import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { driverSelfService } from '../../api/services/driver/driver.service';
import toast from 'react-hot-toast';

const ISSUE_CATEGORIES = [
  'Engine / Mechanical',
  'Brakes / Steering',
  'Electrical / Battery',
  'Tyres / Wheels',
  'Body / Exterior Damage',
  'Air Conditioning / HVAC',
  'GPS / Tracking Device',
  'Display Screen / Media',
  'Fuel System',
  'Lights / Signals',
  'Doors / Windows',
  'Seats / Interior',
  'Other',
];

const URGENCY_OPTIONS = [
  { value: 'critical', label: 'Critical — Bus cannot operate', color: 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 ring-red-400' },
  { value: 'high',     label: 'High — Needs repair soon',     color: 'bg-orange-50 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800 text-orange-700 dark:text-orange-400 ring-orange-400' },
  { value: 'normal',   label: 'Normal — Schedule repair',     color: 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-400 ring-blue-400' },
  { value: 'low',      label: 'Low — Minor / cosmetic issue', color: 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 ring-slate-300' },
];

/**
 * DriverCreateWorkOrderPage — Driver apni fleet ki bus ke liye maintenance request file karta hai.
 * Bus auto-detected hoti hai assigned bus se. Driver sirf issue details bharta hai.
 */
export const DriverCreateWorkOrderPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    issueCategory: '',
    urgency: 'normal',
    description: '',
    instructions: '',
  });
  const [errors, setErrors] = useState({});

  // Load driver profile to get assigned bus info
  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const res = await driverSelfService.getProfile();
      setProfile(res);
    } catch {
      toast.error(t('ag.driver.drivercreateworkorderpage.could_not_load_your_profile_please_t', 'Could not load your profile. Please try again.'));
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const assignedBus = profile?.assignedBus || profile?.assigned_bus || null;
  const busNumber = assignedBus?.bus_number || assignedBus?.registration_number || null;
  const depotName = assignedBus?.depot?.name || profile?.depot?.name || null;
  const fleetName = assignedBus?.fleet?.name || null;

  const validate = () => {
    const e = {};
    if (!formData.issueCategory) e.issueCategory = 'Please select an issue category.';
    if (!formData.urgency) e.urgency = 'Please select urgency level.';
    if (!formData.description.trim()) e.description = 'Please describe the issue briefly.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (!assignedBus) {
      toast.error(t('ag.driver.drivercreateworkorderpage.you_are_not_assigned_to_any_bus_ask_', 'You are not assigned to any bus. Ask your fleet manager to assign you a bus.'));
      return;
    }

    setSubmitting(true);
    try {
      await toast.promise(
        driverSelfService.createWorkOrder({
          issueCategory: formData.issueCategory,
          urgency: formData.urgency,
          description: formData.description.trim() || null,
          instructions: formData.instructions.trim() || null,
          // vehicleId not needed — backend auto-resolves from assigned bus
        }),
        {
          loading: 'Submitting work order...',
          success: 'Work order submitted! Fleet manager will be notified.',
          error: (err) => err?.message || 'Failed to submit work order.',
        }
      );
      navigate('/driver/work-orders');
    } catch {
      /* toast already surfaced */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('nav.dashboard', 'Dashboard'), path: '/driver/dashboard' },
          { label: t('ag.driver.drivercreateworkorderpage.fleet_work_orders', 'Fleet Work Orders'), path: '/driver/work-orders' },
          { label: t('ag.driver.drivercreateworkorderpage.report_issue', 'Report Issue') },
        ]}
        className="mb-1"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/driver/work-orders')}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
          >
            <FleetIcons.ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('ag.driver.drivercreateworkorderpage.report_bus_issue', 'Report Bus Issue')}</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-0.5">{t('ag.driver.drivercreateworkorderpage.submit_a_maintenance_or_technician_r', 'Submit a maintenance or technician request for your assigned bus')}</p>
          </div>
        </div>
      </div>

      {/* Bus Info Banner */}
      {profileLoading ? (
        <div className="h-20 rounded-2xl bg-slate-100 dark:bg-zinc-800 animate-pulse" />
      ) : assignedBus ? (
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <FleetIcons.Bus className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-bold tracking-wider text-blue-500 dark:text-blue-400">{t('ag.driver.drivercreateworkorderpage.your_assigned_bus', 'Your Assigned Bus')}</div>
            <div className="text-sm font-black text-slate-900 dark:text-white font-mono">{busNumber || 'Bus #—'}</div>
            {(depotName || fleetName) && (
              <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium truncate">
                {[fleetName, depotName].filter(Boolean).join(' · ')}
              </div>
            )}
          </div>
          <div className="ml-auto">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">{t('ag.driver.drivercreateworkorderpage.active', 'Active')}</span>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <FleetIcons.Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800 dark:text-amber-300">{t('ag.driver.drivercreateworkorderpage.no_bus_assigned', 'No Bus Assigned')}</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">{t('ag.driver.drivercreateworkorderpage.you_are_not_assigned_to_any_bus_plea', 'You are not assigned to any bus. Please ask your fleet manager to assign you a bus before filing a work order.')}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Issue Category */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t('ag.driver.drivercreateworkorderpage.1_issue_category', '1. Issue Category')}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ISSUE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => { setFormData((f) => ({ ...f, issueCategory: cat })); setErrors((e) => ({ ...e, issueCategory: '' })); }}
                className={`px-3 py-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                  formData.issueCategory === cat
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:border-blue-400 dark:hover:border-blue-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {errors.issueCategory && (
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">{errors.issueCategory}</p>
          )}
        </div>

        {/* Urgency Level */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t('ag.driver.drivercreateworkorderpage.2_urgency_level', '2. Urgency Level')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {URGENCY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setFormData((f) => ({ ...f, urgency: opt.value })); setErrors((e) => ({ ...e, urgency: '' })); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all cursor-pointer ${
                  formData.urgency === opt.value
                    ? `${opt.color} ring-2 shadow-sm font-bold`
                    : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800/80 font-medium'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  formData.urgency === opt.value ? 'border-current' : 'border-slate-300 dark:border-zinc-600'
                }`}>
                  {formData.urgency === opt.value && <div className="w-2 h-2 rounded-full bg-current" />}
                </div>
                <span className="text-xs">{opt.label}</span>
              </button>
            ))}
          </div>
          {errors.urgency && <p className="text-xs text-red-600 dark:text-red-400 font-medium">{errors.urgency}</p>}
        </div>

        {/* Description & Instructions */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t('ag.driver.drivercreateworkorderpage.3_issue_details', '3. Issue Details')}</h2>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('ag.driver.drivercreateworkorderpage.description', 'Description')}<span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder={t('ag.driver.drivercreateworkorderpage.describe_what_is_wrong_with_the_bus_', 'Describe what is wrong with the bus in detail. E.g. — \'Left rear tyre flat, cannot continue route\' or \'GPS device not showing signal since morning shift.\'')}
              value={formData.description}
              onChange={(e) => { setFormData((f) => ({ ...f, description: e.target.value })); setErrors((er) => ({ ...er, description: '' })); }}
              className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
            />
            {errors.description && <p className="text-xs text-red-600 dark:text-red-400 font-medium">{errors.description}</p>}
          </div>

          {/* Instructions (optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('ag.driver.drivercreateworkorderpage.special_instructions', 'Special Instructions')}<span className="text-slate-400 dark:text-zinc-500 font-medium">{t('ag.driver.drivercreateworkorderpage.optional', '(optional)')}</span>
            </label>
            <textarea
              rows={2}
              placeholder={t('ag.driver.drivercreateworkorderpage.any_additional_info_for_the_technici', 'Any additional info for the technician — e.g. location, access notes, etc.')}
              value={formData.instructions}
              onChange={(e) => setFormData((f) => ({ ...f, instructions: e.target.value }))}
              className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
            />
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
          <button
            type="button"
            onClick={() => navigate('/driver/work-orders')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer text-center"
          >{t('ag.driver.drivercreateworkorderpage.cancel', 'Cancel')}</button>
          <button
            type="submit"
            disabled={submitting || !assignedBus || profileLoading}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t('ag.driver.drivercreateworkorderpage.submitting', 'Submitting...')}</span>
              </>
            ) : (
              <>
                <FleetIcons.Plus className="w-4 h-4" />
                <span>{t('ag.driver.drivercreateworkorderpage.submit_work_order', 'Submit Work Order')}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DriverCreateWorkOrderPage;

