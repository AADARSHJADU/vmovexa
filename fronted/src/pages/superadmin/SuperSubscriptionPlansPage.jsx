import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import billingService from '../../api/services/billing.service';
import { RefreshButton } from '../../components/ui/RefreshButton';
import toast from 'react-hot-toast';
import {
  STANDARD_BREAKDOWN_KEYS,
  STANDARD_BREAKDOWN_KEY_MAP,
  isTaxKey,
} from '../../constants/breakdownKeys';

// Helper to safely parse features whether JSON string or object
const parseFeatures = (raw) => {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch (_) {
      return {};
    }
  }
  return {};
};

const parseBreakdown = (raw) => {
  if (!raw) return [];
  let parsed = raw;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch (_) {
      return [];
    }
  }
  if (Array.isArray(parsed)) {
    return parsed.map((item) => {
      const k = item?.key != null ? String(item.key).trim() : (item?.label != null ? String(item.label).trim() : '');
      const meta = STANDARD_BREAKDOWN_KEY_MAP[k] || {};
      const resolvedLabel = (item?.label && String(item.label).trim() !== k)
        ? String(item.label).trim()
        : (meta.label || item?.label || k || 'Component');
      return {
        key: k || 'CUSTOM',
        label: resolvedLabel,
        type: item?.type || (isTaxKey(k) ? 'tax' : 'fee'),
        value: item?.value != null ? String(item.value) : (item?.amount != null ? String(item.amount) : ''),
      };
    });
  }
  if (typeof parsed === 'object' && parsed !== null) {
    return Object.entries(parsed).map(([key, value]) => ({
      key: String(key),
      label: STANDARD_BREAKDOWN_KEY_MAP[key]?.label || String(key),
      type: isTaxKey(key) ? 'tax' : 'fee',
      value: String(value ?? ''),
    }));
  }
  return [];
};

const defaultPlanForm = () => ({
  code: `PLAN-${Date.now().toString(36).toUpperCase()}`,
  name: '',
  billing_cycle: 'monthly', // 'monthly' | 'annually'
  monthly_price: '',
  yearly_price: '',
  price_breakdown: [],
  buses_limit: '',
  drivers_limit: '',
  depots_limit: '',
  fleet_operators_limit: '',
  badge: '',
  support_sla: '24h',
  emergency_broadcast: true,
  custom_branding: false,
  api_webhooks: false,
  is_active: true,
});

export const SuperSubscriptionPlansPage = ({ isAddMode = false, isEditMode = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { id: planIdParam } = useParams();

  const isAddRoute = isAddMode || location.pathname.endsWith('/plans/add') || location.pathname === '/superadmin/plans/add';
  const isEditRoute = isEditMode || location.pathname.includes('/plans/edit') || (location.pathname.includes('/plans/') && location.pathname.endsWith('/edit'));

  // View Mode: 'main' | 'create-plan' | 'edit-plan'
  const [currentView, setCurrentView] = useState(
    isAddRoute ? 'create-plan' : isEditRoute ? 'edit-plan' : 'main'
  );

  // Plans State
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [savingPlan, setSavingPlan] = useState(false);
  const [errors, setErrors] = useState({});
  const [directoryFilter, setDirectoryFilter] = useState('all'); // 'all' | 'monthly' | 'annually'
  const [previewBillingCycle, setPreviewBillingCycle] = useState('monthly');

  const [planForm, setPlanForm] = useState(defaultPlanForm);

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    setErrors({});
    if (isAddRoute) {
      setCurrentView('create-plan');
      setEditingPlan(null);
    } else if (isEditRoute) {
      setCurrentView('edit-plan');
    } else {
      setCurrentView('main');
      setEditingPlan(null);
    }
  }, [isAddRoute, isEditRoute]);

  useEffect(() => {
    if (isEditRoute && planIdParam && plans.length > 0 && currentView === 'edit-plan') {
      const found = plans.find((p) => String(p.id) === String(planIdParam) || p.code === planIdParam);
      if (found && (!editingPlan || editingPlan.id !== found.id)) {
        handleOpenEditPlan(found, false);
      }
    }
  }, [isEditRoute, planIdParam, plans, currentView]);

  const loadPlans = async (showLoader = false) => {
    try {
      if (showLoader || plans.length === 0) {
        setLoadingPlans(true);
      }
      const res = await billingService.getAllPlans();
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.rows)
        ? res.rows
        : Array.isArray(res?.plans)
        ? res.plans
        : [];
      setPlans(list);
    } catch (err) {
      toast.error(err?.message || t('superadmin.sub_plans.toast_load_err', 'Failed to load subscription plans.'));
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleBackToMain = () => {
    setEditingPlan(null);
    setErrors({});
    setCurrentView('main');
    if (location.pathname !== '/superadmin/plans') {
      navigate('/superadmin/plans');
    }
  };

  const handleOpenCreatePlan = () => {
    setEditingPlan(null);
    setErrors({});
    setPlanForm(defaultPlanForm());
    setCurrentView('create-plan');
    if (location.pathname !== '/superadmin/plans/add') {
      navigate('/superadmin/plans/add');
    }
  };

  const handleOpenEditPlan = (p, shouldNavigate = true) => {
    setEditingPlan(p);
    setErrors({});
    const f = parseFeatures(p.features);
    const breakdown = parseBreakdown(p.price_breakdown || f.price_breakdown);
    const cycle = (p.billing_cycle || f.billing_cycle || (p.yearly_price && !Number(p.monthly_price) ? 'annually' : 'monthly')).toLowerCase() === 'annually' ? 'annually' : 'monthly';
    setPlanForm({
      code: p.code || '',
      name: p.name || '',
      billing_cycle: cycle,
      monthly_price: p.monthly_price != null ? String(Math.round(Number(p.monthly_price))) : '',
      yearly_price: p.yearly_price != null ? String(Math.round(Number(p.yearly_price))) : (p.annual_price != null ? String(Math.round(Number(p.annual_price))) : (f.yearly_price != null ? String(Math.round(Number(f.yearly_price))) : '')),
      price_breakdown: breakdown,
      buses_limit: p.buses_limit != null ? String(p.buses_limit) : (f.buses_limit != null ? String(f.buses_limit) : ''),
      drivers_limit: p.drivers_limit != null ? String(p.drivers_limit) : (f.drivers_limit != null ? String(f.drivers_limit) : ''),
      depots_limit: p.depots_limit != null ? String(p.depots_limit) : (f.depots_limit != null ? String(f.depots_limit) : ''),
      fleet_operators_limit: p.fleet_operators_limit != null ? String(p.fleet_operators_limit) : (f.fleet_operators_limit != null ? String(f.fleet_operators_limit) : ''),
      badge: f.badge || '',
      support_sla: f.support_sla || '24h',
      emergency_broadcast: f.emergency_broadcast !== false,
      custom_branding: Boolean(f.custom_branding),
      api_webhooks: Boolean(f.api_webhooks),
      is_active: p.is_active !== false,
    });
    setPreviewBillingCycle(cycle);
    setCurrentView('edit-plan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (shouldNavigate) {
      navigate(`/superadmin/plans/${p.id}/edit`);
    }
  };

  const handleAddBreakdownItem = () => {
    setPlanForm((prev) => ({
      ...prev,
      price_breakdown: [
        ...(prev.price_breakdown || []),
        { key: 'FEE_BASE_PLAN', label: 'Base Subscription / License Fee', type: 'fee', value: '' },
      ],
    }));
  };

  const handleSelectBreakdownPreset = (index, presetKey) => {
    const meta = STANDARD_BREAKDOWN_KEY_MAP[presetKey];
    setPlanForm((prev) => {
      const list = [...(prev.price_breakdown || [])];
      list[index] = {
        ...list[index],
        key: presetKey,
        label: meta ? meta.label : (list[index].label || presetKey),
        type: isTaxKey(presetKey) ? 'tax' : 'fee',
      };
      return { ...prev, price_breakdown: list };
    });
  };

  const handleUpdateBreakdownItem = (index, field, val) => {
    setPlanForm((prev) => {
      const list = [...(prev.price_breakdown || [])];
      list[index] = { ...list[index], [field]: val };
      return { ...prev, price_breakdown: list };
    });
  };

  const handleRemoveBreakdownItem = (index) => {
    setPlanForm((prev) => {
      const list = (prev.price_breakdown || []).filter((_, i) => i !== index);
      return { ...prev, price_breakdown: list };
    });
  };

  const handleNumericChange = (field, rawValue, options = {}) => {
    const { min = 0, max = null, required = false, fieldName = 'Value' } = options;
    // Allow only numeric digits
    const cleaned = rawValue.replace(/[^0-9]/g, '');

    setPlanForm((prev) => ({ ...prev, [field]: cleaned }));

    let err = '';
    if (cleaned === '') {
      if (required) {
        err = `${fieldName} is required`;
      }
    } else {
      const valNum = Number(cleaned);
      if (min !== null && valNum < min) {
        err = `${fieldName} must be at least ${min}`;
      } else if (max !== null && valNum > max) {
        err = `${fieldName} cannot exceed ${max}`;
      }
    }

    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!planForm.name?.trim()) newErrors.name = 'Plan Tier Name is required';
    if (!planForm.code?.trim()) newErrors.code = 'Plan Code is required';

    const isAnnual = planForm.billing_cycle === 'annually';

    if (isAnnual) {
      const yearlyStr = String(planForm.yearly_price ?? '').trim();
      if (yearlyStr === '' || !/^\d+$/.test(yearlyStr) || Number(yearlyStr) < 0) {
        newErrors.yearly_price = 'Please enter a valid annual price (min ₹0)';
      }
    } else {
      const priceStr = String(planForm.monthly_price ?? '').trim();
      if (priceStr === '' || !/^\d+$/.test(priceStr) || Number(priceStr) < 0) {
        newErrors.monthly_price = 'Please enter a valid monthly price (min ₹0)';
      }
    }

    const busesStr = String(planForm.buses_limit ?? '').trim();
    if (busesStr === '' || !/^\d+$/.test(busesStr) || Number(busesStr) < 1) {
      newErrors.buses_limit = 'Bus fleet limit must be at least 1';
    }

    const driversStr = String(planForm.drivers_limit ?? '').trim();
    if (driversStr !== '' && (!/^\d+$/.test(driversStr) || Number(driversStr) < 0)) {
      newErrors.drivers_limit = 'Driver limit cannot be negative';
    }

    const depotsStr = String(planForm.depots_limit ?? '').trim();
    if (depotsStr !== '' && (!/^\d+$/.test(depotsStr) || Number(depotsStr) < 0)) {
      newErrors.depots_limit = 'Depot limit cannot be negative';
    }

    const foStr = String(planForm.fleet_operators_limit ?? '').trim();
    if (foStr !== '' && (!/^\d+$/.test(foStr) || Number(foStr) < 0)) {
      newErrors.fleet_operators_limit = 'Fleet operator limit cannot be negative';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error(t('superadmin.sub_plans.toast_fix_errors', 'Please fix the highlighted errors before saving.'));
      return;
    }

    try {
      setSavingPlan(true);
      const cleanedBreakdown = (planForm.price_breakdown || [])
        .filter((item) => (item.key?.trim() || item.label?.trim()) && String(item.value).trim() !== '')
        .map((item) => {
          const k = item.key?.trim() || 'FEE_BASE_PLAN';
          const meta = STANDARD_BREAKDOWN_KEY_MAP[k] || {};
          const resolvedLabel = (item.label?.trim() && item.label.trim() !== k)
            ? item.label.trim()
            : (meta.label || item.label?.trim() || k);
          return {
            key: k,
            label: resolvedLabel,
            type: item.type || (isTaxKey(k) ? 'tax' : 'fee'),
            value: String(item.value || '0').trim(),
            amount: Number(item.value || 0),
          };
        });

      const numMonthly = isAnnual
        ? (planForm.monthly_price !== '' ? Number(planForm.monthly_price) : Math.round(Number(planForm.yearly_price) / 12))
        : Number(planForm.monthly_price);
      const numYearly = isAnnual
        ? Number(planForm.yearly_price)
        : (planForm.yearly_price !== '' ? Number(planForm.yearly_price) : numMonthly * 12);

      const payload = {
        code: planForm.code,
        name: planForm.name,
        billing_cycle: planForm.billing_cycle,
        monthly_price: numMonthly,
        yearly_price: numYearly,
        annual_price: numYearly,
        price_breakdown: cleanedBreakdown,
        buses_limit: Number(planForm.buses_limit),
        drivers_limit: planForm.drivers_limit !== '' ? Number(planForm.drivers_limit) : null,
        depots_limit: planForm.depots_limit !== '' ? Number(planForm.depots_limit) : null,
        fleet_operators_limit: planForm.fleet_operators_limit !== '' ? Number(planForm.fleet_operators_limit) : null,
        is_active: planForm.is_active,
        features: {
          badge: planForm.badge?.trim() || '',
          billing_cycle: planForm.billing_cycle,
          buses_limit: Number(planForm.buses_limit),
          drivers_limit: planForm.drivers_limit !== '' ? Number(planForm.drivers_limit) : null,
          depots_limit: planForm.depots_limit !== '' ? Number(planForm.depots_limit) : null,
          fleet_operators_limit: planForm.fleet_operators_limit !== '' ? Number(planForm.fleet_operators_limit) : null,
          yearly_price: numYearly,
          annual_price: numYearly,
          price_breakdown: cleanedBreakdown,
          support_sla: planForm.support_sla || '24h',
          emergency_broadcast: Boolean(planForm.emergency_broadcast),
          custom_branding: Boolean(planForm.custom_branding),
          api_webhooks: Boolean(planForm.api_webhooks),
        },
      };

      if (editingPlan) {
        await billingService.updatePlan(editingPlan.id, payload);
        toast.success(t('superadmin.sub_plans.toast_updated_success', 'Plan "{name}" updated successfully!', { name: planForm.name }));
      } else {
        await billingService.createPlan(payload);
        toast.success(t('superadmin.sub_plans.toast_published_success', 'Plan "{name}" published successfully!', { name: planForm.name }));
      }
      handleBackToMain();
      loadPlans();
    } catch (err) {
      toast.error(err.message || t('superadmin.sub_plans.toast_save_err', 'Failed to save plan.'));
    } finally {
      setSavingPlan(false);
    }
  };

  const handleTogglePlanActive = async (p) => {
    const nextStatus = !p.is_active;

    // Optimistically update local list so the card updates immediately
    setPlans((prev) =>
      prev.map((item) => (item.id === p.id ? { ...item, is_active: nextStatus } : item))
    );

    // Ensure user stays on the list screen without any navigation jump
    setCurrentView('main');
    if (location.pathname !== '/superadmin/plans') {
      navigate('/superadmin/plans', { replace: true });
    }

    try {
      await billingService.updatePlan(p.id, { is_active: nextStatus });
      toast.success(t(nextStatus ? 'superadmin.sub_plans.toast_activated_success' : 'superadmin.sub_plans.toast_deactivated_success', 'Plan "{name}" {status} successfully!', { name: p.name, status: nextStatus ? 'activated' : 'deactivated' }));
    } catch (err) {
      // Revert optimistic update on failure
      setPlans((prev) =>
        prev.map((item) => (item.id === p.id ? { ...item, is_active: p.is_active } : item))
      );
      toast.error(err.message || t('superadmin.sub_plans.toast_toggle_err', 'Failed to toggle plan status.'));
    }
  };

  const handleDeletePlan = async (p) => {
    if (!window.confirm(t('superadmin.sub_plans.confirm_delete_plan', 'Are you sure you want to delete plan "{name}" ({code})? If any organizations are currently subscribed, it will be safely deactivated.', { name: p.name, code: p.code }))) {
      return;
    }

    try {
      const res = await billingService.deletePlan(p.id);
      toast.success(res?.message || t('superadmin.sub_plans.toast_deleted_success', 'Plan "{name}" deleted successfully.', { name: p.name }));
      loadPlans();
    } catch (err) {
      toast.error(err.message || t('superadmin.sub_plans.toast_delete_err', 'Failed to delete plan.'));
    }
  };

  const planList = Array.isArray(plans) ? plans : [];

  // VIEW: CREATE / EDIT PLAN
  if (currentView === 'create-plan' || currentView === 'edit-plan') {
    const isEditing = currentView === 'edit-plan';
    const isAnnual = planForm.billing_cycle === 'annually';

    return (
      <div className="w-full space-y-5 animate-in fade-in duration-200">
        {/* Standard Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: t('nav.superadmin_dashboard', 'Super Admin'), path: '/superadmin/dashboard', icon: FleetIcons.Dashboard },
            {
              label: t('superadmin.sub_plans.breadcrumb_plans', 'Subscription Plans'),
              path: '/superadmin/plans',
              onClick: (e) => {
                e.preventDefault();
                handleBackToMain();
              },
            },
            {
              label: isEditing
                ? t('superadmin.sub_plans.breadcrumb_edit', 'Edit: {name}', { name: editingPlan?.name || planForm.name || 'Tier' })
                : t('superadmin.sub_plans.breadcrumb_create', 'Create Subscription Plan'),
            },
          ]}
          className="mb-1"
        />

        {/* Responsive Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {isEditing ? t('superadmin.sub_plans.title_edit', 'Edit Plan: {name}', { name: editingPlan?.name || planForm.name }) : t('superadmin.sub_plans.title_create', 'Create Subscription Plan')}
              </h1>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                  isAnnual
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                    : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                }`}
              >
                {isAnnual ? t('superadmin.sub_plans.badge_annual_plan', 'Annual Plan (₹ / yr)') : t('superadmin.sub_plans.badge_monthly_plan', 'Monthly Plan (₹ / mo)')}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
              {isAnnual ? t('superadmin.sub_plans.subtitle_annual', 'Configure annual pricing, fleet quotas, and price breakdown') : t('superadmin.sub_plans.subtitle_monthly', 'Configure monthly pricing, fleet quotas, and price breakdown')}
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleBackToMain}
              className="px-4 py-2.5 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 flex-1 sm:flex-initial cursor-pointer"
            >
              <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('common.back', 'Back')}</span>
            </button>
            <button
              type="button"
              onClick={handleSavePlan}
              disabled={savingPlan}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 flex-1 sm:flex-initial disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              {savingPlan ? (
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <FleetIcons.Check className="w-4 h-4" />
              )}
              <span>{savingPlan ? t('common.saving', 'Saving...') : (isEditing ? t('superadmin.sub_plans.btn_save_changes', 'Save Changes') : t('superadmin.sub_plans.btn_create_plan', 'Create Plan'))}</span>
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Layout with Sticky Preview on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Form Fields */}
          <form onSubmit={handleSavePlan} className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* Section 1: Core Plan Details */}
            <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <FleetIcons.Settings className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>{t('superadmin.sub_plans.sec_core_details', '1. Core Plan Details')}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                    {t('superadmin.sub_plans.sec_core_desc', 'Configure tier identity, unique plan code, promotional badge, and visibility')}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border self-start sm:self-auto ${
                    planForm.is_active
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700'
                  }`}
                >
                  {planForm.is_active ? t('superadmin.sub_plans.active_tier', 'Active Tier') : t('superadmin.sub_plans.inactive_tier', 'Inactive Tier')}
                </span>
              </div>

              {/* Core Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* {t('superadmin.sub_plans.plan_tier_name', 'Plan Tier Name *')}/}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    {t('superadmin.sub_plans.plan_tier_name', 'Plan Tier Name *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={planForm.name}
                    onChange={(e) => {
                      setPlanForm({ ...planForm, name: e.target.value });
                      if (errors.name && e.target.value.trim()) {
                        setErrors((prev) => ({ ...prev, name: '' }));
                      }
                    }}
                    placeholder={t('superadmin.sub_plans.placeholder_plan_name', 'e.g. Sovereign Transit Gold')}
                    className={`w-full px-3.5 py-2.5 border bg-white dark:bg-zinc-900 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:outline-none transition-all ${
                      errors.name
                        ? 'border-rose-500 dark:border-rose-500 focus:ring-rose-500'
                        : 'border-slate-200 dark:border-zinc-700 focus:ring-blue-500'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 flex items-center gap-1">
                      <FleetIcons.Alert className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                {/* Plan Code */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center justify-between mb-1">
                    <span>{t('superadmin.sub_plans.plan_code', 'Plan Code *')}</span>
                    <span className="text-[10px] text-slate-400">{t('superadmin.sub_plans.uppercase_identifier', 'Uppercase Identifier')}</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isEditing}
                    value={planForm.code}
                    onChange={(e) => {
                      setPlanForm({ ...planForm, code: e.target.value.toUpperCase() });
                      if (errors.code && e.target.value.trim()) {
                        setErrors((prev) => ({ ...prev, code: '' }));
                      }
                    }}
                    placeholder={t('superadmin.sub_plans.placeholder_plan_code', 'e.g. PLAN-GOLD')}
                    className={`w-full px-3.5 py-2.5 border bg-white dark:bg-zinc-900 rounded-xl text-xs font-mono font-bold text-blue-600 dark:text-blue-400 focus:ring-2 focus:outline-none disabled:bg-slate-100 dark:disabled:bg-zinc-800 disabled:opacity-75 transition-all ${
                      errors.code
                        ? 'border-rose-500 dark:border-rose-500 focus:ring-rose-500'
                        : 'border-slate-200 dark:border-zinc-700 focus:ring-blue-500'
                    }`}
                  />
                  {errors.code && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 flex items-center gap-1">
                      <FleetIcons.Alert className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.code}</span>
                    </p>
                  )}
                </div>

                {/* Badge Tag */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    {t('superadmin.sub_plans.badge_tag_label', 'Badge Tag Label (Optional)')}
                  </label>
                  <input
                    type="text"
                    value={planForm.badge}
                    onChange={(e) => setPlanForm({ ...planForm, badge: e.target.value })}
                    placeholder={t('superadmin.sub_plans.placeholder_badge', 'e.g. Most Popular / State PSU')}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">{t('superadmin.sub_plans.badge_hint', 'Highlighted tag badge shown on tenant pricing cards')}</p>
                </div>

                {/* {t('superadmin.sub_plans.plan_availability', 'Plan Availability')} Switch */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    {t('superadmin.sub_plans.plan_availability', 'Plan Availability')}
                  </label>
                  <div className="flex items-center justify-between p-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                    <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                      {planForm.is_active ? t('superadmin.sub_plans.active_live', 'Active & Live') : t('superadmin.sub_plans.disabled_hidden', 'Disabled / Hidden')}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={planForm.is_active}
                        onChange={(e) => setPlanForm({ ...planForm, is_active: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">{t('superadmin.sub_plans.visibility_hint', 'Toggle visibility on tenant registration and checkout')}</p>
                </div>
              </div>
            </div>

            {/* Section 2: Fleet Capacity & Quotas */}
            <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <FleetIcons.Bus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>{t('superadmin.sub_plans.sec_quotas', '2. Fleet Capacity & Quotas')}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                  {t('superadmin.sub_plans.sec_quotas_desc', 'Bus fleet capacity, driver headcount, depot terminals, and operator logins allowed for this tier')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Bus fleet limit */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    {t('superadmin.sub_plans.bus_fleet_limit', 'Bus Fleet Limit *')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required
                      value={planForm.buses_limit}
                      onChange={(e) => handleNumericChange('buses_limit', e.target.value, { min: 1, required: true, fieldName: 'Bus fleet limit' })}
                      placeholder={t('superadmin.sub_plans.placeholder_buses', 'e.g. 50')}
                      className={`w-full pl-3 pr-14 py-2.5 border bg-white dark:bg-zinc-900 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:outline-none transition-all ${
                        errors.buses_limit
                          ? 'border-rose-500 dark:border-rose-500 focus:ring-rose-500'
                          : 'border-slate-200 dark:border-zinc-700 focus:ring-blue-500'
                      }`}
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-400 uppercase">{t('superadmin.sub_plans.buses', 'Buses')}</span>
                  </div>
                  {errors.buses_limit ? (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 flex items-center gap-1">
                      <FleetIcons.Alert className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.buses_limit}</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">{t('superadmin.sub_plans.min_1_bus', 'Minimum 1 active bus')}</p>
                  )}
                </div>

                {/* Driver limit */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    {t('superadmin.sub_plans.driver_limit', 'Driver Limit')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={planForm.drivers_limit}
                      onChange={(e) => handleNumericChange('drivers_limit', e.target.value, { min: 0, fieldName: 'Driver limit' })}
                      placeholder={t('superadmin.sub_plans.placeholder_drivers', 'e.g. 75')}
                      className={`w-full pl-3 pr-16 py-2.5 border bg-white dark:bg-zinc-900 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:outline-none transition-all ${
                        errors.drivers_limit
                          ? 'border-rose-500 dark:border-rose-500 focus:ring-rose-500'
                          : 'border-slate-200 dark:border-zinc-700 focus:ring-blue-500'
                      }`}
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-400 uppercase">{t('superadmin.sub_plans.drivers', 'Drivers')}</span>
                  </div>
                  {errors.drivers_limit ? (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 flex items-center gap-1">
                      <FleetIcons.Alert className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.drivers_limit}</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">{t('superadmin.sub_plans.empty_unlimited', 'Leave empty for unlimited')}</p>
                  )}
                </div>

                {/* Depot terminals limit */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    {t('superadmin.sub_plans.depot_terminals', 'Depot Terminals')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={planForm.depots_limit}
                      onChange={(e) => handleNumericChange('depots_limit', e.target.value, { min: 0, fieldName: 'Depot limit' })}
                      placeholder={t('superadmin.sub_plans.placeholder_depots', 'e.g. 5')}
                      className={`w-full pl-3 pr-16 py-2.5 border bg-white dark:bg-zinc-900 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:outline-none transition-all ${
                        errors.depots_limit
                          ? 'border-rose-500 dark:border-rose-500 focus:ring-rose-500'
                          : 'border-slate-200 dark:border-zinc-700 focus:ring-blue-500'
                      }`}
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-400 uppercase">{t('superadmin.sub_plans.depots', 'Depots')}</span>
                  </div>
                  {errors.depots_limit ? (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 flex items-center gap-1">
                      <FleetIcons.Alert className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.depots_limit}</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">{t('superadmin.sub_plans.empty_unlimited', 'Leave empty for unlimited')}</p>
                  )}
                </div>

                {/* Fleet operators limit */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    {t('superadmin.sub_plans.fleet_operators', 'Fleet Operators')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={planForm.fleet_operators_limit}
                      onChange={(e) => handleNumericChange('fleet_operators_limit', e.target.value, { min: 0, fieldName: 'Fleet operator limit' })}
                      placeholder={t('superadmin.sub_plans.placeholder_logins', 'e.g. 10')}
                      className={`w-full pl-3 pr-16 py-2.5 border bg-white dark:bg-zinc-900 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:outline-none transition-all ${
                        errors.fleet_operators_limit
                          ? 'border-rose-500 dark:border-rose-500 focus:ring-rose-500'
                          : 'border-slate-200 dark:border-zinc-700 focus:ring-blue-500'
                      }`}
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-400 uppercase">{t('superadmin.sub_plans.logins', 'Logins')}</span>
                  </div>
                  {errors.fleet_operators_limit ? (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 flex items-center gap-1">
                      <FleetIcons.Alert className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.fleet_operators_limit}</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">{t('superadmin.sub_plans.empty_unlimited', 'Leave empty for unlimited')}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Plan Pricing & Cost Breakdown */}
            <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <FleetIcons.Ticket className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{t('superadmin.sub_plans.sec_pricing', '3. Plan Pricing & Cost Breakdown')}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                    {t('superadmin.sub_plans.sec_pricing_desc', 'Configure billing frequency, main subscription price, and optional itemized tax components')}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border self-start sm:self-auto ${
                    isAnnual
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                      : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                  }`}
                >
                  {isAnnual ? t('superadmin.sub_plans.annual_plan', 'Annual Plan') : t('superadmin.sub_plans.monthly_plan', 'Monthly Plan')}
                </span>
              </div>

              {/* Responsive Billing Cycle Toggle */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <FleetIcons.Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{t('superadmin.sub_plans.billing_frequency', 'Plan Billing Frequency *')}</span>
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mt-0.5">
                    {t('superadmin.sub_plans.billing_frequency_desc', 'Select whether this plan is billed Monthly or Annually')}
                  </span>
                </div>

                <div className="grid grid-cols-2 w-full sm:w-auto p-1 bg-slate-200/70 dark:bg-zinc-900/90 rounded-xl border border-slate-200 dark:border-zinc-700 gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPlanForm((prev) => ({ ...prev, billing_cycle: 'monthly' }));
                      setPreviewBillingCycle('monthly');
                    }}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      planForm.billing_cycle === 'monthly'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <FleetIcons.Clock className="w-3.5 h-3.5" />
                    <span>{t('superadmin.sub_plans.monthly_plan', 'Monthly Plan')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPlanForm((prev) => ({ ...prev, billing_cycle: 'annually' }));
                      setPreviewBillingCycle('annually');
                    }}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      planForm.billing_cycle === 'annually'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <FleetIcons.Check className="w-3.5 h-3.5" />
                    <span>{t('superadmin.sub_plans.annual_plan', 'Annual Plan')}</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Single Price Input based on toggle */}
              {isAnnual ? (
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center justify-between mb-1">
                    <span>{t('superadmin.sub_plans.annual_price_inr', 'Annual / Yearly Price (INR) *')}</span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{t('superadmin.sub_plans.per_yr_symbol', '₹ / yr')}</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required
                      value={planForm.yearly_price}
                      onChange={(e) => handleNumericChange('yearly_price', e.target.value, { min: 0, required: true, fieldName: 'Annual price' })}
                      placeholder={t('superadmin.sub_plans.placeholder_annual_price', 'e.g. 150000')}
                      className={`w-full pl-8 pr-3.5 py-2.5 border bg-white dark:bg-zinc-900 rounded-xl text-xs font-black text-slate-900 dark:text-white focus:ring-2 focus:outline-none transition-all ${
                        errors.yearly_price
                          ? 'border-rose-500 dark:border-rose-500 focus:ring-rose-500'
                          : 'border-slate-200 dark:border-zinc-700 focus:ring-emerald-500'
                      }`}
                    />
                  </div>
                  {errors.yearly_price ? (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 flex items-center gap-1">
                      <FleetIcons.Alert className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.yearly_price}</span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 flex items-center justify-between">
                      <span>{t('superadmin.sub_plans.tax_inclusive_hint', 'Tax inclusive (GST included)')}</span>
                      {planForm.yearly_price && Number(planForm.yearly_price) > 0 && (
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          ≈ ₹{Math.round(Number(planForm.yearly_price) / 12).toLocaleString('en-IN')} / mo
                        </span>
                      )}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center justify-between mb-1">
                    <span>{t('superadmin.sub_plans.monthly_price_inr', 'Monthly Price (INR) *')}</span>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{t('superadmin.sub_plans.per_mo_symbol', '₹ / mo')}</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required
                      value={planForm.monthly_price}
                      onChange={(e) => handleNumericChange('monthly_price', e.target.value, { min: 0, required: true, fieldName: 'Monthly price' })}
                      placeholder={t('superadmin.sub_plans.placeholder_monthly_price', 'e.g. 15000')}
                      className={`w-full pl-8 pr-3.5 py-2.5 border bg-white dark:bg-zinc-900 rounded-xl text-xs font-black text-slate-900 dark:text-white focus:ring-2 focus:outline-none transition-all ${
                        errors.monthly_price
                          ? 'border-rose-500 dark:border-rose-500 focus:ring-rose-500'
                          : 'border-slate-200 dark:border-zinc-700 focus:ring-blue-500'
                      }`}
                    />
                  </div>
                  {errors.monthly_price ? (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 flex items-center gap-1">
                      <FleetIcons.Alert className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.monthly_price}</span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 flex items-center justify-between">
                      <span>{t('superadmin.sub_plans.tax_inclusive_hint', 'Tax inclusive (GST included)')}</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{t('superadmin.sub_plans.monthly_plan', 'Monthly Plan')}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Itemized Price Breakdown Sub-Section */}
              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <span>{t('superadmin.sub_plans.itemized_breakdown', 'Itemized Cost & Tax Breakdown (Optional)')}</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                      {t('superadmin.sub_plans.itemized_breakdown_desc', 'Add itemized components (e.g. Base Price, CGST, SGST). Total plan price: ₹{total}.', { total: Number((isAnnual ? planForm.yearly_price : planForm.monthly_price) || 0).toLocaleString('en-IN') })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddBreakdownItem}
                    className="shrink-0 whitespace-nowrap px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-xl border border-blue-200 dark:border-blue-800/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
                  >
                    <FleetIcons.Plus className="w-3.5 h-3.5" />
                    <span>{t('superadmin.sub_plans.add_breakdown_item', 'Add Breakdown Item')}</span>
                  </button>
                </div>

              {(!planForm.price_breakdown || planForm.price_breakdown.length === 0) ? (
                <div className="py-6 px-4 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 text-center space-y-2">
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                    {t('superadmin.sub_plans.no_breakdown_yet', 'No price breakdown added yet. (Optional)')}
                  </p>
                  <button
                    type="button"
                    onClick={handleAddBreakdownItem}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <FleetIcons.Plus className="w-3.5 h-3.5" />
                    <span>{t('superadmin.sub_plans.add_item_title', 'Add Item (Base Price, CGST, SGST)')}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Table Header for Desktop */}
                  <div className="hidden sm:grid sm:grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-1">
                    <div className="sm:col-span-4">{t('superadmin.sub_plans.standard_key_catalog', 'Standard Key (Catalog)')}</div>
                    <div className="sm:col-span-4">{t('superadmin.sub_plans.custom_label_desc', 'Custom Label / Description')}</div>
                    <div className="sm:col-span-3">{t('superadmin.sub_plans.amount_inr', 'Amount (₹)')}</div>
                    <div className="sm:col-span-1 text-center">{t('superadmin.sub_plans.action', 'Action')}</div>
                  </div>

                  {/* Responsive Row Items */}
                  {planForm.price_breakdown.map((item, idx) => {
                    const isTax = isTaxKey(item.key) || item.type === 'tax';
                    return (
                      <div
                        key={idx}
                        className="flex flex-col sm:grid sm:grid-cols-12 gap-2 p-3 sm:p-0 rounded-xl bg-slate-50/70 sm:bg-transparent dark:bg-zinc-800/40 sm:dark:bg-transparent border sm:border-0 border-slate-200/80 dark:border-zinc-800"
                      >
                        {/* Standard Key Preset Dropdown */}
                        <div className="sm:col-span-4">
                          <span className="sm:hidden text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-1">
                            Standard Key #{idx + 1}
                          </span>
                          <select
                            value={item.key || 'CUSTOM'}
                            onChange={(e) => handleSelectBreakdownPreset(idx, e.target.value)}
                            className="w-full px-2.5 py-2 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                          >
                            <optgroup label={t('superadmin.sub_plans.optgroup_statutory_gst', '── Statutory GST Taxes ──')}>
                              <option value="GST_CGST">{t('superadmin.sub_plans.cgst_label', 'CGST (Central GST)')}</option>
                              <option value="GST_SGST">{t('superadmin.sub_plans.sgst_label', 'SGST (State GST)')}</option>
                              <option value="GST_IGST">{t('superadmin.sub_plans.igst_label', 'IGST (Integrated GST)')}</option>
                              <option value="GST_CESS">{t('superadmin.sub_plans.gst_cess_label', 'GST Cess')}</option>
                            </optgroup>
                            <optgroup label={t('superadmin.sub_plans.optgroup_commercial_items', '── Commercial Line Items (Taxable) ──')}>
                              <option value="FEE_BASE_PLAN">{t('superadmin.sub_plans.base_license_fee', 'Base Subscription / License Fee')}</option>
                              <option value="FEE_AIRTIME_BROADCAST">{t('superadmin.sub_plans.transit_screen_airtime', 'Transit Screen Airtime Broadcast')}</option>
                              <option value="FEE_HARDWARE_RENTAL">{t('superadmin.sub_plans.gps_screen_rental', 'GPS & Screen Hardware Rental')}</option>
                              <option value="FEE_TELEMETRY_DATA">{t('superadmin.sub_plans.iot_sim_data', '4G IoT Telemetry & SIM Data')}</option>
                              <option value="FEE_ONBOARDING_SETUP">{t('superadmin.sub_plans.onboarding_setup_charge', 'Onboarding & Setup Charge')}</option>
                              <option value="FEE_CREATIVE_DESIGN">{t('superadmin.sub_plans.creative_review_transcoding', 'Creative Review & Transcoding')}</option>
                            </optgroup>
                            <optgroup label={t('superadmin.sub_plans.optgroup_custom', '── Custom ──')}>
                              <option value="CUSTOM">{t('superadmin.sub_plans.custom_key_item', 'Custom Key / Custom Item')}</option>
                            </optgroup>
                          </select>
                        </div>

                        {/* Label Input */}
                        <div className="sm:col-span-4 relative">
                          <span className="sm:hidden text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-1">
                            {t('superadmin.sub_plans.component_label', 'Component Label')}
                          </span>
                          <input
                            type="text"
                            value={item.label || ''}
                            onChange={(e) => handleUpdateBreakdownItem(idx, 'label', e.target.value)}
                            placeholder={t('superadmin.sub_plans.placeholder_item_desc', 'e.g. Enterprise Base Access')}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                          />
                          <span className={`absolute right-2.5 top-2.5 text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${
                            isTax
                              ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800'
                              : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                          }`}>
                            {isTax ? t('superadmin.sub_plans.tax_badge', 'Tax') : t('superadmin.sub_plans.fee_badge', 'Fee')}
                          </span>
                        </div>

                        {/* Amount Input */}
                        <div className="sm:col-span-3 flex items-center gap-2">
                          <div className="relative flex-1">
                            <span className="sm:hidden text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-1">
                              Amount (₹)
                            </span>
                            <div className="relative">
                              <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={item.value}
                                onChange={(e) => handleUpdateBreakdownItem(idx, 'value', e.target.value.replace(/[^0-9.]/g, ''))}
                                placeholder="0"
                                className="w-full pl-7 pr-3 py-2 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                              />
                            </div>
                          </div>

                          {/* Mobile Delete Button */}
                          <div className="sm:hidden pt-4">
                            <button
                              type="button"
                              onClick={() => handleRemoveBreakdownItem(idx)}
                              title={t('superadmin.sub_plans.remove_component', 'Remove component')}
                              className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl border border-rose-200/60 dark:border-rose-900/40 transition-all cursor-pointer"
                            >
                              <FleetIcons.Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Desktop Delete Button */}
                        <div className="hidden sm:flex sm:col-span-1 justify-center items-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveBreakdownItem(idx)}
                            title={t('superadmin.sub_plans.remove_component', 'Remove component')}
                            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all cursor-pointer"
                          >
                            <FleetIcons.Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Breakdown Total & Summary Check */}
                  {(() => {
                    const taxableBase = planForm.price_breakdown
                      .filter((curr) => !isTaxKey(curr.key) && curr.type !== 'tax')
                      .reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
                    const taxTotal = planForm.price_breakdown
                      .filter((curr) => isTaxKey(curr.key) || curr.type === 'tax')
                      .reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
                    const breakdownSum = taxableBase + taxTotal;
                    const targetPrice = isAnnual ? Number(planForm.yearly_price || 0) : Number(planForm.monthly_price || 0);
                    const matches = breakdownSum === targetPrice && targetPrice > 0;
                    const diff = targetPrice - breakdownSum;

                    return (
                      <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
                            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400">{t('superadmin.sub_plans.taxable_base', 'Taxable Base:')}</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">₹{taxableBase.toLocaleString('en-IN')}</span>
                          </div>
                          {taxTotal > 0 && (
                            <div className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800">
                              <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-300">{t('superadmin.sub_plans.gst_taxes', 'GST Taxes:')}</span>
                              <span className="font-mono font-bold text-purple-700 dark:text-purple-300">₹{taxTotal.toLocaleString('en-IN')}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500 dark:text-zinc-400 font-medium">{t('superadmin.sub_plans.total_colon', 'Total:')}</span>
                            <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
                              ₹{breakdownSum.toLocaleString('en-IN')}
                            </span>
                          </div>
                          {matches ? (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                              <FleetIcons.Check className="w-3 h-3" />
                              <span>{t('superadmin.sub_plans.matches_target', 'Matches {cycle} Target (₹{amount})', { cycle: isAnnual ? 'Annual' : 'Monthly', amount: targetPrice.toLocaleString('en-IN') })}</span>
                            </span>
                          ) : targetPrice > 0 ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                {diff > 0 ? t('superadmin.sub_plans.target_diff_remaining', 'Target Price is ₹{target} ({diff} remaining)', { target: targetPrice.toLocaleString('en-IN'), diff: '₹' + diff.toLocaleString('en-IN') }) : t('superadmin.sub_plans.target_diff_over', 'Target Price is ₹{target} ({diff} over)', { target: targetPrice.toLocaleString('en-IN'), diff: '₹' + Math.abs(diff).toLocaleString('en-IN') })}
                              </span>
                              {breakdownSum > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const field = isAnnual ? 'yearly_price' : 'monthly_price';
                                    setPlanForm((prev) => ({ ...prev, [field]: String(breakdownSum) }));
                                    setErrors((prev) => ({ ...prev, [field]: '' }));
                                    toast.success(t('superadmin.sub_plans.toast_price_updated', 'Plan price updated to ₹{amount}', { amount: breakdownSum.toLocaleString('en-IN') }));
                                  }}
                                  className="text-[10px] font-bold px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg border border-blue-200 dark:border-blue-800 transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <FleetIcons.Check className="w-3 h-3" />
                                  <span>{t('superadmin.sub_plans.use_breakdown_total', 'Use Breakdown Total (₹{amount})', { amount: breakdownSum.toLocaleString('en-IN') })}</span>
                                </button>
                              )}
                            </div>
                          ) : breakdownSum > 0 ? (
                            <button
                              type="button"
                              onClick={() => {
                                const field = isAnnual ? 'yearly_price' : 'monthly_price';
                                setPlanForm((prev) => ({ ...prev, [field]: String(breakdownSum) }));
                                setErrors((prev) => ({ ...prev, [field]: '' }));
                                toast.success(t('superadmin.sub_plans.toast_price_set', 'Plan price set to ₹{amount}', { amount: breakdownSum.toLocaleString('en-IN') }));
                              }}
                              className="text-[10px] font-bold px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg border border-blue-200 dark:border-blue-800 transition-all cursor-pointer flex items-center gap-1"
                            >
                              <FleetIcons.Check className="w-3 h-3" />
                              <span>{t('superadmin.sub_plans.set_price_from_breakdown', 'Set Price from Breakdown (₹{amount})', { amount: breakdownSum.toLocaleString('en-IN') })}</span>
                            </button>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={handleAddBreakdownItem}
                          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                        >
                          <FleetIcons.Plus className="w-3.5 h-3.5" />
                          <span>{t('superadmin.sub_plans.add_another_item', 'Add Another Item')}</span>
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleBackToMain}
                className="w-full sm:w-auto px-5 py-2.5 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                disabled={savingPlan}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {savingPlan ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <FleetIcons.Check className="w-4 h-4" />
                )}
                <span>{savingPlan ? t('common.saving', 'Saving...') : (isEditing ? t('superadmin.sub_plans.btn_save_changes', 'Save Changes') : t('superadmin.sub_plans.btn_create_plan', 'Create Plan'))}</span>
              </button>
            </div>
          </form>

          {/* Right Column: Live Plan Card Preview (Sticky on Desktop) */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-6 space-y-4">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white rounded-2xl p-4 flex items-center justify-between shadow-md shadow-blue-500/15 border border-blue-400/30">
              <div className="flex items-center gap-2">
                <FleetIcons.Dashboard className="w-4 h-4 text-blue-100" />
                <span className="text-xs font-bold tracking-wider uppercase text-white drop-shadow-xs">{t('superadmin.sub_plans.preview_title', 'Live Tenant Card Preview')}</span>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30 backdrop-blur-xs">
                {t('superadmin.sub_plans.interactive_badge', 'Interactive')}
              </span>
            </div>

            <div className="bg-white dark:bg-[#11141d] border-2 border-blue-600/30 ring-2 ring-blue-500/10 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
              {/* Cadence Header Pill */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200/80 dark:border-zinc-700/80">
                <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">{t('superadmin.sub_plans.plan_cadence', 'Plan Cadence')}</span>
                <span
                  className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                    isAnnual
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                  }`}
                >
                  {isAnnual ? t('superadmin.sub_plans.annual_plan', 'Annual Plan') : t('superadmin.sub_plans.monthly_plan', 'Monthly Plan')}
                </span>
              </div>

              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white break-words">
                    {planForm.name || t('superadmin.sub_plans.tier_preview_name', 'Tier Name Preview')}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-zinc-500 font-mono mt-0.5">{planForm.code || 'PLAN-CODE'}</p>
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-blue-600 text-white uppercase tracking-wider shrink-0">
                  {planForm.badge || t('superadmin.sub_plans.tier_badge_preview', 'Tier Badge')}
                </span>
              </div>

              <div className="border-b border-slate-100 dark:border-zinc-800 pb-4 space-y-2">
                {isAnnual ? (
                  <div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">
                      ₹{Number(planForm.yearly_price || 0).toLocaleString('en-IN')}
                      <span className="text-xs font-normal text-slate-400"> {t('superadmin.sub_plans.per_year', '/ year')}</span>
                    </div>
                    <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
                      <FleetIcons.Clock className="w-3 h-3 shrink-0" />
                      <span>{t('superadmin.sub_plans.annual_contract_equiv', 'Annual Contract • Equivalent to ₹{amount} / month', { amount: Math.round(Number(planForm.yearly_price || 0) / 12).toLocaleString('en-IN') })}</span>
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">
                      ₹{Number(planForm.monthly_price || 0).toLocaleString('en-IN')}
                      <span className="text-xs font-normal text-slate-400"> {t('superadmin.sub_plans.per_month', '/ month')}</span>
                    </div>
                    <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1.5">
                      <FleetIcons.Clock className="w-3 h-3 shrink-0" />
                      <span>{t('superadmin.sub_plans.monthly_sub_plan', 'Monthly Subscription Plan')}</span>
                    </p>
                  </div>
                )}

                {/* Itemized Price Breakdown Preview */}
                {Array.isArray(planForm.price_breakdown) && planForm.price_breakdown.some((it) => it.key?.trim() || it.value?.trim()) && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800 space-y-1.5 text-xs mt-2">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      <span>{t('superadmin.sub_plans.price_breakdown', 'Price Breakdown')}</span>
                      <span className="font-mono text-blue-600 dark:text-blue-400">
                        {t('superadmin.sub_plans.total_prefix', 'Total')} ₹{Number((isAnnual ? planForm.yearly_price : planForm.monthly_price) || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                      {planForm.price_breakdown
                        .filter((it) => it.key?.trim() || it.label?.trim() || it.value?.trim())
                        .map((item, i) => {
                          const displayLabel = item.label?.trim() || STANDARD_BREAKDOWN_KEY_MAP[item.key]?.label || item.key || `Component ${i + 1}`;
                          return (
                            <div key={i} className="flex items-center justify-between py-1 text-slate-700 dark:text-zinc-300 text-[11px]">
                              <span className="truncate pr-2 font-medium">{displayLabel}</span>
                              <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0">
                                ₹{Number(item.value || 0).toLocaleString('en-IN')}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-zinc-300 font-medium">
                <li className="flex items-center gap-2">
                  <FleetIcons.Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span><strong>{planForm.buses_limit ? `${planForm.buses_limit} ${t('superadmin.sub_plans.buses', 'Buses')}` : t('common.custom', 'Custom')}</strong> {t('superadmin.sub_plans.fleet_capacity', 'Fleet Capacity')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <FleetIcons.Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span><strong>{planForm.drivers_limit ? `${planForm.drivers_limit} ${t('superadmin.sub_plans.drivers', 'Drivers')}` : t('common.custom', 'Custom')}</strong> {t('superadmin.sub_plans.driver_headcount', 'Driver Headcount')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <FleetIcons.Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span><strong>{planForm.depots_limit ? `${planForm.depots_limit} ${t('superadmin.sub_plans.depot_terminals', 'Depot Terminals')}` : t('superadmin.sub_plans.custom_depots', 'Custom Depots')}</strong> {t('superadmin.sub_plans.depot_capacity', 'Depot Capacity')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <FleetIcons.Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span><strong>{planForm.fleet_operators_limit ? `${planForm.fleet_operators_limit} ${t('superadmin.sub_plans.fleet_operators', 'Fleet Operators')}` : t('superadmin.sub_plans.custom_operators', 'Custom Operators')}</strong> {t('superadmin.sub_plans.operator_accounts', 'Operator Accounts')}</span>
                </li>
              </ul>

              {/* Dummy Subscribe Button preview */}
              <div className="pt-2">
                <div className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white text-center font-bold text-xs shadow-md shadow-blue-500/25 select-none tracking-wide">
                  {t('superadmin.sub_plans.subscribe_to', 'Subscribe to {tier}', { tier: planForm.name || 'Tier' })}
                </div>
                <p className="text-[10px] text-center text-slate-400 dark:text-zinc-500 mt-1.5">
                  {t('superadmin.sub_plans.checkout_preview_hint', 'Tenant checkout perspective preview')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MAIN VIEW: PLANS DIRECTORY GRID
  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Standard Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: t('nav.superadmin_dashboard', 'Super Admin'), path: '/superadmin/dashboard', icon: FleetIcons.Dashboard },
          { label: t('superadmin.sub_plans.saas_subscription_plans', 'SaaS Subscription Plans') },
        ]}
        className="mb-1"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('superadmin.sub_plans.main_title', 'Subscription Plans')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            {t('superadmin.sub_plans.main_subtitle', 'Configure SaaS pricing tiers and fleet bus quotas')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <RefreshButton
            onClick={async () => {
              await loadPlans(true);
              toast.success(t('superadmin.sub_plans.toast_refreshed_success', 'Subscription plans refreshed!'));
            }}
            loading={loadingPlans}
            title={t('superadmin.sub_plans.refresh_plans_tooltip', 'Refresh subscription plans')}
          />

          <button
            type="button"
            onClick={handleOpenCreatePlan}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 flex-1 sm:flex-initial cursor-pointer"
          >
            <FleetIcons.Plus className="w-4 h-4" />
            <span>{t('superadmin.sub_plans.create_plan', 'Create Plan')}</span>
          </button>
        </div>
      </div>

      {/* Directory Filter Tabs */}
      {plans.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#11141d] p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-800/80 rounded-xl">
            <button
              type="button"
              onClick={() => setDirectoryFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                directoryFilter === 'all'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('superadmin.sub_plans.tab_all_plans', 'All Plans')} ({plans.length})
            </button>
            <button
              type="button"
              onClick={() => setDirectoryFilter('monthly')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                directoryFilter === 'monthly'
                  ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{t('superadmin.sub_plans.tab_monthly', 'Monthly')}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-bold">
                {plans.filter((p) => {
                  const f = parseFeatures(p.features);
                  return (p.billing_cycle || f.billing_cycle || 'monthly').toLowerCase() !== 'annually';
                }).length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setDirectoryFilter('annually')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                directoryFilter === 'annually'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{t('superadmin.sub_plans.tab_annually', 'Annually')}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold">
                {plans.filter((p) => {
                  const f = parseFeatures(p.features);
                  return (p.billing_cycle || f.billing_cycle || '').toLowerCase() === 'annually';
                }).length}
              </span>
            </button>
          </div>

          {(() => {
            const filteredCount = plans.filter((p) => {
              if (directoryFilter === 'all') return true;
              const f = parseFeatures(p.features);
              const cycle = (p.billing_cycle || f.billing_cycle || (p.yearly_price && !Number(p.monthly_price) ? 'annually' : 'monthly')).toLowerCase();
              return cycle === directoryFilter;
            }).length;
            return (
              <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium px-2">
                {t('superadmin.sub_plans.showing_plans_count', 'Showing {filtered} of {total} total plans', { filtered: filteredCount, total: plans.length })}
              </div>
            );
          })()}
        </div>
      )}

      {/* Grid of Plans */}
      {loadingPlans ? (
        <div className="py-12 text-center text-xs text-slate-400 dark:text-zinc-500">
          {t('superadmin.sub_plans.loading_plans', 'Loading subscription plans...')}
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center space-y-3">
          <FleetIcons.Ticket className="w-12 h-12 text-slate-300 dark:text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('superadmin.sub_plans.empty_title', 'No Subscription Plans Found')}</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">{t('superadmin.sub_plans.empty_desc', 'Create your first SaaS operating tier to allow transit organizations to register and subscribe.')}</p>
          <button
            type="button"
            onClick={handleOpenCreatePlan}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <FleetIcons.Plus className="w-4 h-4" />
            <span>{t('superadmin.sub_plans.create_plan', 'Create Plan')}</span>
          </button>
        </div>
      ) : (() => {
        const filteredList = plans.filter((p) => {
          if (directoryFilter === 'all') return true;
          const f = parseFeatures(p.features);
          const cycle = (p.billing_cycle || f.billing_cycle || (p.yearly_price && !Number(p.monthly_price) ? 'annually' : 'monthly')).toLowerCase();
          return cycle === directoryFilter;
        });

        if (filteredList.length === 0) {
          return (
            <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-10 text-center space-y-3">
              <FleetIcons.Ticket className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {directoryFilter === 'annually' ? t('superadmin.sub_plans.no_annual_plans', 'No Annual Plans Found') : t('superadmin.sub_plans.no_monthly_plans', 'No Monthly Plans Found')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                {t('superadmin.sub_plans.no_plans_freq_desc', 'No subscription plans configured for this billing frequency yet.')}
              </p>
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setDirectoryFilter('all')}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  {t('superadmin.sub_plans.view_all_plans', 'View All Plans')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenCreatePlan();
                    setPlanForm((prev) => ({ ...prev, billing_cycle: directoryFilter }));
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <FleetIcons.Plus className="w-3.5 h-3.5" />
                  <span>{directoryFilter === 'annually' ? t('superadmin.sub_plans.create_annual_plan', 'Create Annual Plan') : t('superadmin.sub_plans.create_monthly_plan', 'Create Monthly Plan')}</span>
                </button>
              </div>
            </div>
          );
        }

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredList.map((p) => {
              const f = parseFeatures(p.features);
              const isAnnual = (p.billing_cycle || f.billing_cycle || (p.yearly_price && !Number(p.monthly_price) ? 'annually' : 'monthly')).toLowerCase() === 'annually';
              return (
                <div
                  key={p.id}
                  className={`bg-white dark:bg-[#11141d] border rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-all ${
                    p.is_active
                      ? 'border-slate-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-600'
                      : 'border-slate-200 dark:border-zinc-800 opacity-60 bg-slate-50 dark:bg-zinc-900/40'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-black text-slate-900 dark:text-white">{p.name}</h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isAnnual
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                            }`}
                          >
                            {isAnnual ? t('superadmin.sub_plans.annual_plan', 'Annual Plan') : t('superadmin.sub_plans.monthly_plan', 'Monthly Plan')}
                          </span>
                          {f.badge && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                              {f.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 dark:text-zinc-500 font-mono mt-0.5">{p.code}</p>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                          p.is_active
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {p.is_active ? t('common.active', 'Active') : t('common.disabled', 'Disabled')}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="py-2 border-y border-slate-100 dark:border-zinc-800/80 space-y-1.5">
                      {isAnnual ? (
                        <div className="flex items-baseline justify-between gap-1 flex-wrap">
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">
                              ₹{Number(p.yearly_price || p.annual_price || f.yearly_price || 0).toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">{t('superadmin.sub_plans.per_year', '/ year')}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                              ≈ ₹{Math.round(Number(p.yearly_price || p.annual_price || f.yearly_price || 0) / 12).toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium"> {t('superadmin.sub_plans.per_mo_symbol', '/ mo')}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-baseline justify-between gap-1 flex-wrap">
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">
                              ₹{Number(p.monthly_price || 0).toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">{t('superadmin.sub_plans.per_month', '/ month')}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-slate-500 dark:text-zinc-400">
                              {t('superadmin.sub_plans.monthly_plan', 'Monthly Plan')}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Dynamic Breakdown Pills in Directory Card */}
                      {(() => {
                        const breakdown = parseBreakdown(p.price_breakdown || f.price_breakdown);
                        if (!breakdown || breakdown.length === 0) return null;
                        return (
                          <div className="pt-1.5 border-t border-slate-100 dark:border-zinc-800/60">
                            <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                              {t('superadmin.sub_plans.itemized_breakdown_label', 'Itemized Breakdown')}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {breakdown.map((item, idx) => {
                                const displayLabel = item.label?.trim() || STANDARD_BREAKDOWN_KEY_MAP[item.key]?.label || item.key;
                                return (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800/80 text-[10px] text-slate-600 dark:text-zinc-300 font-medium"
                                  >
                                    <span>{displayLabel}:</span>
                                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                                      ₹{Number(item.value || 0).toLocaleString('en-IN')}
                                    </span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Quota Limits Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-slate-100 dark:border-zinc-800">
                      <div>
                        <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold">{t('superadmin.sub_plans.bus_limit', 'Bus Limit')}</span>
                        <p className="font-bold text-slate-900 dark:text-white">{p.buses_limit ? `${p.buses_limit} ${t('superadmin.sub_plans.buses', 'Buses')}` : t('superadmin.sub_plans.unlimited', 'Unlimited')}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold">{t('superadmin.sub_plans.driver_limit', 'Driver Limit')}</span>
                        <p className="font-bold text-slate-900 dark:text-white">{p.drivers_limit != null || f.drivers_limit != null ? `${p.drivers_limit ?? f.drivers_limit} ${t('superadmin.sub_plans.drivers', 'Drivers')}` : t('superadmin.sub_plans.unlimited', 'Unlimited')}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold">{t('superadmin.sub_plans.depots_limit', 'Depots Limit')}</span>
                        <p className="font-bold text-slate-900 dark:text-white">{p.depots_limit != null || f.depots_limit != null ? `${p.depots_limit ?? f.depots_limit} ${t('superadmin.sub_plans.depots', 'Depots')}` : t('superadmin.sub_plans.unlimited', 'Unlimited')}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold">{t('superadmin.sub_plans.fleet_operators', 'Fleet Operators')}</span>
                        <p className="font-bold text-slate-900 dark:text-white">{p.fleet_operators_limit != null || f.fleet_operators_limit != null ? `${p.fleet_operators_limit ?? f.fleet_operators_limit} ${t('superadmin.sub_plans.operators', 'Operators')}` : t('superadmin.sub_plans.unlimited', 'Unlimited')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-zinc-800 mt-4">
                    <button
                      type="button"
                      onClick={() => handleOpenEditPlan(p)}
                      className="flex-1 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      {t('superadmin.sub_plans.edit_plan_btn', 'Edit Plan')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTogglePlanActive(p)}
                      className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        p.is_active
                          ? 'border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                          : 'border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                      }`}
                    >
                      {p.is_active ? t('common.deactivate', 'Deactivate') : t('common.enable', 'Enable')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePlan(p)}
                      title={t('superadmin.sub_plans.delete_plan', 'Delete plan')}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all cursor-pointer"
                    >
                      <FleetIcons.Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
};

export default SuperSubscriptionPlansPage;
