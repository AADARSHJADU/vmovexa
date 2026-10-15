import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import billingService from '../../api/services/billing.service';
import { RefreshButton } from '../../components/ui/RefreshButton';
import toast from 'react-hot-toast';

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

const defaultPlanForm = () => ({
  code: `PLAN-${Date.now().toString(36).toUpperCase()}`,
  name: '',
  monthly_price: '',
  buses_limit: '',
  ad_revenue_share_rate: '',
  badge: '',
  depots_limit: '',
  displays_per_bus: '',
  users_limit: '',
  gps_ping_interval: '5s',
  data_retention_days: '',
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
      toast.error(err?.message || 'Failed to load subscription plans.');
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
    setPlanForm({
      code: p.code || '',
      name: p.name || '',
      monthly_price: p.monthly_price != null ? String(Math.round(Number(p.monthly_price))) : '',
      buses_limit: p.buses_limit != null ? String(p.buses_limit) : '',
      ad_revenue_share_rate: p.ad_revenue_share_rate != null ? String(Number(p.ad_revenue_share_rate)) : '',
      badge: f.badge || '',
      depots_limit: f.depots_limit != null ? String(f.depots_limit) : '',
      displays_per_bus: f.displays_per_bus != null ? String(f.displays_per_bus) : '',
      users_limit: f.users_limit != null ? String(f.users_limit) : '',
      gps_ping_interval: f.gps_ping_interval || '5s',
      data_retention_days: (f.data_retention_days != null && f.data_retention_days !== '')
        ? String(f.data_retention_days)
        : ((f.data_retention != null && f.data_retention !== '') ? String(f.data_retention) : ''),
      support_sla: f.support_sla || '24h',
      emergency_broadcast: f.emergency_broadcast !== false,
      custom_branding: Boolean(f.custom_branding),
      api_webhooks: Boolean(f.api_webhooks),
      is_active: p.is_active !== false,
    });
    setCurrentView('edit-plan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (shouldNavigate) {
      navigate(`/superadmin/plans/${p.id}/edit`);
    }
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

    const priceStr = String(planForm.monthly_price ?? '').trim();
    if (priceStr === '' || !/^\d+$/.test(priceStr) || Number(priceStr) < 0) {
      newErrors.monthly_price = 'Please enter a valid monthly price (min ₹0)';
    }

    const busesStr = String(planForm.buses_limit ?? '').trim();
    if (busesStr === '' || !/^\d+$/.test(busesStr) || Number(busesStr) < 1) {
      newErrors.buses_limit = 'Bus fleet limit must be at least 1';
    }

    const depotsStr = String(planForm.depots_limit ?? '').trim();
    if (depotsStr !== '' && (!/^\d+$/.test(depotsStr) || Number(depotsStr) < 0)) {
      newErrors.depots_limit = 'Depot limit cannot be negative';
    }

    const displaysStr = String(planForm.displays_per_bus ?? '').trim();
    if (displaysStr !== '' && (!/^\d+$/.test(displaysStr) || Number(displaysStr) < 0)) {
      newErrors.displays_per_bus = 'Displays per bus cannot be negative';
    }

    const usersStr = String(planForm.users_limit ?? '').trim();
    if (usersStr !== '' && (!/^\d+$/.test(usersStr) || Number(usersStr) < 0)) {
      newErrors.users_limit = 'Staff limit cannot be negative';
    }

    const revStr = String(planForm.ad_revenue_share_rate ?? '').trim();
    if (revStr !== '' && (!/^\d+$/.test(revStr) || Number(revStr) < 0 || Number(revStr) > 100)) {
      newErrors.ad_revenue_share_rate = 'Percentage must be between 0 and 100';
    }

    const retStr = String(planForm.data_retention_days ?? '').trim();
    if (retStr !== '' && (!/^\d+$/.test(retStr) || Number(retStr) < 1)) {
      newErrors.data_retention_days = 'Retention must be at least 1 day';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the highlighted errors before saving.');
      return;
    }

    try {
      setSavingPlan(true);
      const payload = {
        code: planForm.code,
        name: planForm.name,
        monthly_price: Number(planForm.monthly_price),
        buses_limit: Number(planForm.buses_limit),
        ad_revenue_share_rate: Number(planForm.ad_revenue_share_rate || 65),
        is_active: planForm.is_active,
        features: {
          badge: planForm.badge?.trim() || '',
          depots_limit: planForm.depots_limit !== '' ? Number(planForm.depots_limit) : null,
          displays_per_bus: planForm.displays_per_bus !== '' ? Number(planForm.displays_per_bus) : null,
          users_limit: planForm.users_limit !== '' ? Number(planForm.users_limit) : null,
          gps_ping_interval: planForm.gps_ping_interval || '5s',
          data_retention_days: planForm.data_retention_days !== '' ? Number(planForm.data_retention_days) : null,
          support_sla: planForm.support_sla || '24h',
          emergency_broadcast: Boolean(planForm.emergency_broadcast),
          custom_branding: Boolean(planForm.custom_branding),
          api_webhooks: Boolean(planForm.api_webhooks),
        },
      };

      if (editingPlan) {
        await billingService.updatePlan(editingPlan.id, payload);
        toast.success(`Plan "${planForm.name}" updated successfully!`);
      } else {
        await billingService.createPlan(payload);
        toast.success(`Plan "${planForm.name}" published successfully!`);
      }
      handleBackToMain();
      loadPlans();
    } catch (err) {
      toast.error(err.message || 'Failed to save plan.');
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
      toast.success(`Plan "${p.name}" ${nextStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (err) {
      // Revert optimistic update on failure
      setPlans((prev) =>
        prev.map((item) => (item.id === p.id ? { ...item, is_active: p.is_active } : item))
      );
      toast.error(err.message || 'Failed to toggle plan status.');
    }
  };

  const planList = Array.isArray(plans) ? plans : [];

  // VIEW: CREATE / EDIT PLAN
  if (currentView === 'create-plan' || currentView === 'edit-plan') {
    const isEditing = currentView === 'edit-plan';

    return (
      <div className="w-full space-y-6 animate-in fade-in duration-200">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400">
          <Link to="/superadmin/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            <FleetIcons.Dashboard className="w-3.5 h-3.5" />
            <span>Super Admin</span>
          </Link>
          <span className="text-slate-300 dark:text-zinc-600">/</span>
          <button
            type="button"
            onClick={handleBackToMain}
            className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer bg-transparent border-none p-0 text-xs font-semibold"
          >
            Subscription Plans
          </button>
          <span className="text-slate-300 dark:text-zinc-600">/</span>
          <span className="text-slate-900 dark:text-white font-bold">
            {isEditing ? `Edit: ${editingPlan?.name || planForm.name}` : 'Create Plan'}
          </span>
        </nav>

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {isEditing ? `Edit Plan: ${editingPlan?.name || planForm.name}` : 'Create Plan'}
              </h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                Monthly Plan
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
              Configure monthly pricing and operational fleet quotas
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleBackToMain}
              className="px-4 py-2.5 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 flex-1 sm:flex-initial cursor-pointer"
            >
              <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
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
              <span>{isEditing ? 'Save Changes' : 'Create Plan'}</span>
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form Fields */}
          <form onSubmit={handleSavePlan} className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    1. Plan Details & Pricing
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                    Plan name, code, monthly rate, and badge
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  Monthly
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">Plan Tier Name *</label>
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
                    placeholder="e.g. Sovereign Transit Enterprise"
                    className={`w-full px-3.5 py-2.5 border bg-white dark:bg-zinc-900 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:outline-none ${
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

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">Plan Code *</label>
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
                    placeholder="e.g. PLAN-SOVEREIGN"
                    className={`w-full px-3.5 py-2.5 border bg-white dark:bg-zinc-900 rounded-xl text-xs font-mono font-bold text-blue-600 dark:text-blue-400 focus:ring-2 focus:outline-none disabled:bg-slate-100 dark:disabled:bg-zinc-800 ${
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

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center justify-between mb-1">
                    <span>Monthly Price (INR) *</span>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">Billed Per Month (₹ / mo)</span>
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
                      placeholder="e.g. 25000"
                      className={`w-full pl-8 pr-3.5 py-2.5 border bg-white dark:bg-zinc-900 rounded-xl text-xs font-black text-slate-900 dark:text-white focus:ring-2 focus:outline-none ${
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
                      <span>Tax inclusive (GST included in price)</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">Monthly Recurring Cycle</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">Badge Tag Label</label>
                  <input
                    type="text"
                    value={planForm.badge}
                    onChange={(e) => setPlanForm({ ...planForm, badge: e.target.value })}
                    placeholder="e.g. Most Popular / State PSU"
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 block">Plan Availability Status</span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">Active plans appear on public tenant checkout and self-service registration</span>
                </div>
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
            </div>

            {/* Hardware Quotas */}
            <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  2. Fleet Capacity & Quotas
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                  Bus limits, depots, displays, and data retention
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">Bus Fleet Limit *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    value={planForm.buses_limit}
                    onChange={(e) => handleNumericChange('buses_limit', e.target.value, { min: 1, required: true, fieldName: 'Bus fleet limit' })}
                    placeholder="e.g. 50"
                    className={`w-full px-3 py-2 border bg-white dark:bg-zinc-900 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:outline-none ${
                      errors.buses_limit
                        ? 'border-rose-500 dark:border-rose-500 focus:ring-rose-500'
                        : 'border-slate-200 dark:border-zinc-700 focus:ring-blue-500'
                    }`}
                  />
                  {errors.buses_limit && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 flex items-center gap-1">
                      <FleetIcons.Alert className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.buses_limit}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">Depot Terminals Limit</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={planForm.depots_limit}
                    onChange={(e) => handleNumericChange('depots_limit', e.target.value, { min: 0, fieldName: 'Depot limit' })}
                    placeholder="e.g. 3"
                    className={`w-full px-3 py-2 border bg-white dark:bg-zinc-900 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:outline-none ${
                      errors.depots_limit
                        ? 'border-rose-500 dark:border-rose-500 focus:ring-rose-500'
                        : 'border-slate-200 dark:border-zinc-700 focus:ring-blue-500'
                    }`}
                  />
                  {errors.depots_limit && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 flex items-center gap-1">
                      <FleetIcons.Alert className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.depots_limit}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">Displays per Bus</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={planForm.displays_per_bus}
                    onChange={(e) => handleNumericChange('displays_per_bus', e.target.value, { min: 0, fieldName: 'Displays per bus' })}
                    placeholder="e.g. 2"
                    className={`w-full px-3 py-2 border bg-white dark:bg-zinc-900 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:outline-none ${
                      errors.displays_per_bus
                        ? 'border-rose-500 dark:border-rose-500 focus:ring-rose-500'
                        : 'border-slate-200 dark:border-zinc-700 focus:ring-blue-500'
                    }`}
                  />
                  {errors.displays_per_bus && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 flex items-center gap-1">
                      <FleetIcons.Alert className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.displays_per_bus}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">Staff Operators Limit</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={planForm.users_limit}
                    onChange={(e) => handleNumericChange('users_limit', e.target.value, { min: 0, fieldName: 'Staff limit' })}
                    placeholder="e.g. 15"
                    className={`w-full px-3 py-2 border bg-white dark:bg-zinc-900 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:outline-none ${
                      errors.users_limit
                        ? 'border-rose-500 dark:border-rose-500 focus:ring-rose-500'
                        : 'border-slate-200 dark:border-zinc-700 focus:ring-blue-500'
                    }`}
                  />
                  {errors.users_limit && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 flex items-center gap-1">
                      <FleetIcons.Alert className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.users_limit}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">Ad Revenue Cut (%)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={planForm.ad_revenue_share_rate}
                    onChange={(e) => handleNumericChange('ad_revenue_share_rate', e.target.value, { min: 0, max: 100, fieldName: 'Ad revenue share' })}
                    placeholder="e.g. 65"
                    className={`w-full px-3 py-2 border bg-white dark:bg-zinc-900 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:outline-none ${
                      errors.ad_revenue_share_rate
                        ? 'border-rose-500 dark:border-rose-500 focus:ring-rose-500'
                        : 'border-slate-200 dark:border-zinc-700 focus:ring-blue-500'
                    }`}
                  />
                  {errors.ad_revenue_share_rate && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 flex items-center gap-1">
                      <FleetIcons.Alert className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.ad_revenue_share_rate}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">Data Retention (Days)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={planForm.data_retention_days}
                    onChange={(e) => handleNumericChange('data_retention_days', e.target.value, { min: 1, fieldName: 'Data retention' })}
                    placeholder="e.g. 90"
                    className={`w-full px-3 py-2 border bg-white dark:bg-zinc-900 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:outline-none ${
                      errors.data_retention_days
                        ? 'border-rose-500 dark:border-rose-500 focus:ring-rose-500'
                        : 'border-slate-200 dark:border-zinc-700 focus:ring-blue-500'
                    }`}
                  />
                  {errors.data_retention_days && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 flex items-center gap-1">
                      <FleetIcons.Alert className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.data_retention_days}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleBackToMain}
                className="w-full sm:w-auto px-5 py-2.5 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
              >
                Cancel
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
                <span>{isEditing ? 'Save Changes' : 'Create Plan'}</span>
              </button>
            </div>
          </form>

          {/* Right Column: Live Plan Card Preview */}
          <div className="space-y-4">
            <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <span className="text-xs font-bold tracking-wide uppercase text-slate-300">Live Tenant Card Preview</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Preview
              </span>
            </div>

            <div className="bg-white dark:bg-[#11141d] border-2 border-blue-600/30 ring-2 ring-blue-500/10 rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">{planForm.name || 'Tier Name Preview'}</h3>
                  <p className="text-xs text-slate-400 dark:text-zinc-500 font-mono mt-0.5">{planForm.code || 'PLAN-CODE'}</p>
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-blue-600 text-white uppercase tracking-wider">
                  {planForm.badge || 'Tier Badge'}
                </span>
              </div>

              <div className="border-b border-slate-100 dark:border-zinc-800 pb-4">
                <div className="text-3xl font-black text-slate-900 dark:text-white">
                  ₹{Number(planForm.monthly_price || 0).toLocaleString('en-IN')}
                  <span className="text-xs font-normal text-slate-400"> / month</span>
                </div>
                <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1.5">
                  <FleetIcons.Clock className="w-3 h-3 shrink-0" />
                  <span>Monthly Recurring Subscription Plan</span>
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-zinc-300 font-medium">
                <li className="flex items-center gap-2">
                  <FleetIcons.Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span><strong>{planForm.buses_limit ? `${planForm.buses_limit} Buses` : 'Custom'}</strong> Fleet Capacity</span>
                </li>
                <li className="flex items-center gap-2">
                  <FleetIcons.Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span><strong>{planForm.depots_limit ? `${planForm.depots_limit} Depot Terminals` : 'Custom Depots'}</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <FleetIcons.Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Screens: <strong>{planForm.displays_per_bus ? `${planForm.displays_per_bus} Displays/Bus` : 'Custom Displays'}</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <FleetIcons.Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Staff Limit: <strong>{planForm.users_limit ? `${planForm.users_limit} Operators` : 'Custom Staff'}</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <FleetIcons.Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Data Retention: <strong>{planForm.data_retention_days ? `${planForm.data_retention_days} Days` : 'Custom Days'}</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <FleetIcons.Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Ad Revenue Share to Org: <strong>{planForm.ad_revenue_share_rate ? `${planForm.ad_revenue_share_rate}%` : '0%'}</strong></span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MAIN VIEW: PLANS DIRECTORY GRID
  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400">
        <Link to="/superadmin/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
          <FleetIcons.Dashboard className="w-3.5 h-3.5" />
          <span>Super Admin</span>
        </Link>
        <span className="text-slate-300 dark:text-zinc-600">/</span>
        <span className="text-slate-900 dark:text-white font-bold">SaaS Subscription Plans</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Subscription Plans
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Configure SaaS pricing tiers, fleet bus quotas, and ad revenue share rates
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <RefreshButton
            onClick={async () => {
              await loadPlans(true);
              toast.success('Subscription plans refreshed!');
            }}
            loading={loadingPlans}
            title="Refresh subscription plans"
          />

          <button
            type="button"
            onClick={handleOpenCreatePlan}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 flex-1 sm:flex-initial cursor-pointer"
          >
            <FleetIcons.Plus className="w-4 h-4" />
            <span>Create Plan</span>
          </button>
        </div>
      </div>

      {/* Grid of Plans */}
      {loadingPlans ? (
        <div className="py-12 text-center text-xs text-slate-400 dark:text-zinc-500">
          Loading subscription plans...
        </div>
      ) : planList.length === 0 ? (
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center space-y-3">
          <FleetIcons.Ticket className="w-12 h-12 text-slate-300 dark:text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Subscription Plans Found</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">Create your first SaaS operating tier to allow transit organizations to register and subscribe.</p>
          <button
            type="button"
            onClick={handleOpenCreatePlan}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <FleetIcons.Plus className="w-4 h-4" />
            <span>Create Plan</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {planList.map((p) => {
            const f = parseFeatures(p.features);
            const retentionDays = f.data_retention_days ?? f.data_retention ?? p.data_retention_days;
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
                        {f.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
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
                          : 'bg-rose-50 dark:rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {p.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="py-2 border-y border-slate-100 dark:border-zinc-800/80">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        ₹{Number(p.monthly_price).toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">/ month</span>
                    </div>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                      Ad Revenue Cut to Org: {p.ad_revenue_share_rate != null ? p.ad_revenue_share_rate : 0}%
                    </p>
                  </div>

                  {/* Quota Limits Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-slate-100 dark:border-zinc-800">
                    <div>
                      <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold">Bus Limit</span>
                      <p className="font-bold text-slate-900 dark:text-white">{p.buses_limit ? `${p.buses_limit} Buses` : 'Unlimited'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold">Depots Limit</span>
                      <p className="font-bold text-slate-900 dark:text-white">{f.depots_limit != null && f.depots_limit !== '' ? `${f.depots_limit} Depots` : 'Unlimited'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold">Screens/Bus</span>
                      <p className="font-bold text-slate-900 dark:text-white">{f.displays_per_bus != null && f.displays_per_bus !== '' ? `${f.displays_per_bus} Displays` : '1 Display'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold">Staff Limit</span>
                      <p className="font-bold text-slate-900 dark:text-white">{f.users_limit != null && f.users_limit !== '' ? `${f.users_limit} Users` : 'Unlimited'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold">Data Retention</span>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {retentionDays != null && retentionDays !== '' ? `${retentionDays} Days` : '—'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold">Telemetry Ping</span>
                      <p className="font-bold text-slate-900 dark:text-white">{f.gps_ping_interval || '5s'}</p>
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
                    Edit Plan
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTogglePlanActive(p)}
                    className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      p.is_active
                        ? 'border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                        : 'border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                    }`}
                  >
                    {p.is_active ? 'Deactivate' : 'Enable'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SuperSubscriptionPlansPage;
