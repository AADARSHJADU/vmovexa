import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useAdminTechnicianRequest } from '../../hooks/admin/useAdminTechnicianRequest';
import { useAdminVehicle } from '../../hooks/admin/useAdminVehicle';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';

const formatName = (v, fallback = '—') => {
  if (!v) return fallback;
  if (typeof v === 'object') return v.name || v.code || fallback;
  return String(v);
};

export const NewTechRequestPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const isFleetPortal = location.pathname.startsWith('/fleet-operator');
  const basePath = isFleetPortal ? '/fleet-operator/technician-requests' : '/admin/technician-requests';
  const { hasPermission } = useAuth();
  const { t } = useTranslation();

  const canCreate = hasPermission('work_orders.create');
  const hasEditPermission = hasPermission('work_orders.edit') || hasPermission('work_orders.update') || hasPermission('work_orders.create');
  const [serverCanEdit, setServerCanEdit] = useState(null);
  const canAccessForm = isEditMode ? (hasEditPermission && serverCanEdit !== false) : canCreate;

  const { createWorkOrder, updateWorkOrder, loadWorkOrderDetail } = useAdminTechnicianRequest();
  const { vehicles, pagination: vehiclePagination, loading: vehiclesLoading, loadVehicles } = useAdminVehicle();
  const vehiclesList = Array.isArray(vehicles) ? vehicles : (vehicles?.items || vehicles?.rows || []);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [debouncedVehicleSearch, setDebouncedVehicleSearch] = useState('');
  const [vehiclePage, setVehiclePage] = useState(1);

  const [formData, setFormData] = useState({
    vehicleId: '',
    busNumber: '',
    depotName: '',
    issueCategory: '',
    urgency: 'normal',
    description: '',
    instructions: '',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedVehicleSearch(vehicleSearch.trim());
      setVehiclePage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [vehicleSearch]);

  useEffect(() => {
    if (!canAccessForm) return;
    const params = { page: vehiclePage, limit: 10 };
    if (debouncedVehicleSearch) params.search = debouncedVehicleSearch;
    loadVehicles(params).catch(() => {});
  }, [canAccessForm, vehiclePage, debouncedVehicleSearch, loadVehicles]);

  useEffect(() => {
    if (!canAccessForm) return;
    if (isEditMode && id) {
      loadWorkOrderDetail(id)
        .then((found) => {
          if (found) {
            const allowed = found.capabilities?.canEdit === true;
            setServerCanEdit(allowed);
            if (!allowed) {
              toast.error('You cannot edit this technician request');
              navigate(basePath);
              return;
            }
            setFormData({
              vehicleId: String(found.vehicle_id || found.vehicle?.id || ''),
              busNumber: found.bus_number || found.busNumber || (found.vehicle?.bus_number) || '',
              depotName: found.depot_name || found.depot?.name || '',
              issueCategory: found.issue_category || '',
              urgency: found.urgency ? found.urgency.toLowerCase() : 'normal',
              description: found.description || found.issue_details || '',
              instructions: found.instructions || '',
            });
          }
        })
        .catch((err) => toast.error(err?.message || 'Failed to load request details'))
        .finally(() => setFetching(false));
    }
  }, [id, isEditMode, canAccessForm, loadWorkOrderDetail, navigate, basePath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vehicleId) {
      toast.error('Please select a bus number');
      return;
    }
    if (!formData.issueCategory.trim()) {
      toast.error('Please enter an issue category');
      return;
    }
    if (!formData.description?.trim()) {
      toast.error('Please enter a description of the issue');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        vehicleId: Number(formData.vehicleId),
        issueCategory: formData.issueCategory.trim(),
        urgency: formData.urgency.toLowerCase(),
        description: formData.description.trim(),
        instructions: formData.instructions?.trim() || null,
      };

      const actionPromise = isEditMode
        ? updateWorkOrder(id, payload)
        : createWorkOrder(payload);

      await toast.promise(actionPromise, {
        loading: isEditMode ? 'Updating request...' : 'Submitting request...',
        success: isEditMode ? 'Technician request updated' : 'Technician request submitted successfully',
        error: (err) => err?.message || 'Failed to submit request',
      });

      navigate(basePath);
    } catch {
      /* toast already surfaced error */
    } finally {
      setLoading(false);
    }
  };

  if (!canAccessForm) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-2">
          <FleetIcons.Key className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('common.access_denied')}</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">
          You do not have permission to {isEditMode ? 'edit' : 'create'} technician requests.
        </p>
        <Link
          to={basePath}
          className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
        >
          Back to Technician Requests
        </Link>
      </div>
    );
  }

  if (fetching) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm">
        <div className="text-slate-500 dark:text-zinc-400 font-bold text-sm">{t('admin.tech_requests.loading_details')}</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: isFleetPortal ? 'Fleet Operator' : 'Tenant Admin', path: isFleetPortal ? '/fleet-operator/dashboard' : '/admin/dashboard' },
              { label: 'Technician Requests', path: basePath },
              { label: isEditMode ? 'Edit Request' : 'New Request' },
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {isEditMode ? t('admin.tech_requests.edit_details_btn') : t('admin.tech_requests.new_ticket_title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
            {isEditMode ? 'Update request details and issue notes' : 'Request hardware repair or maintenance for a bus'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">{t('admin.tech_requests.vehicle_issue_details')}</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{t('admin.tech_requests.vehicle_issue_sub')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('admin.tech_requests.bus_number_req')}</label>
            <div className="relative mb-2">
              <FleetIcons.Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={vehicleSearch}
                onChange={(e) => setVehicleSearch(e.target.value)}
                placeholder="Search bus number, code, VIN or model..."
                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <select
              required
              value={formData.vehicleId}
              onChange={(e) => {
                const vehicleId = e.target.value;
                const v = vehiclesList.find((item) => String(item.id) === vehicleId);
                setFormData({
                  ...formData,
                  vehicleId,
                  busNumber: v?.bus_number || v?.busNumber || '',
                  depotName: v?.depot?.name || v?.depot_name || '',
                });
              }}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">{vehiclesLoading ? 'Loading vehicles...' : t('admin.tech_requests.select_bus_ph')}</option>
              {formData.vehicleId && !vehiclesList.some((v) => String(v.id) === String(formData.vehicleId)) && (
                <option value={formData.vehicleId}>{formData.busNumber || `Vehicle #${formData.vehicleId}`} ({formData.depotName || 'Depot'})</option>
              )}
              {vehiclesList.map((v) => {
                const busNum = v.bus_number || v.busNumber || v.code;
                return (
                  <option key={v.id} value={v.id}>
                    {busNum} ({formatName(v.depot)})
                  </option>
                );
              })}
            </select>
            <div className="flex items-center justify-between gap-2 mt-2 text-[10px] text-slate-500 dark:text-zinc-400">
              <span>
                Page {vehiclePagination?.page || vehiclePage} of {vehiclePagination?.totalPages || 1} · {vehiclePagination?.total || 0} vehicles
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setVehiclePage((page) => Math.max(1, page - 1))}
                  disabled={(vehiclePagination?.page || vehiclePage) <= 1 || vehiclesLoading}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 font-bold disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setVehiclePage((page) => page + 1)}
                  disabled={(vehiclePagination?.page || vehiclePage) >= (vehiclePagination?.totalPages || 1) || vehiclesLoading}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 font-bold disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('admin.tech_requests.depot_req')}</label>
            <div className="w-full px-3.5 py-2.5 min-h-10 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200">
              {formData.depotName || '—'}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('admin.tech_requests.issue_type_req')}</label>
            <input
              type="text"
              required
              value={formData.issueCategory}
              onChange={(e) => setFormData({ ...formData, issueCategory: e.target.value })}
              maxLength={160}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('admin.tech_requests.priority_req')}</label>
            <select
              required
              value={formData.urgency}
              onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="critical">{t('admin.tech_requests.priority_critical_bus')}</option>
              <option value="high">{t('admin.tech_requests.priority_high_badge')}</option>
              <option value="normal">{t('admin.tech_requests.priority_normal')}</option>
              <option value="low">{t('admin.tech_requests.priority_low')}</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('admin.tech_requests.issue_desc_req')}</label>
            <textarea
              rows={3}
              required
              placeholder={t('admin.tech_requests.issue_desc_ph')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('admin.tech_requests.tech_instructions_opt')}</label>
            <textarea
              rows={2}
              placeholder={t('admin.tech_requests.tech_instructions_ph')}
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
          <Link
            to={basePath}
            className="px-5 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-colors text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FleetIcons.Target className="w-4 h-4 text-white" />
            )}
            <span>{isEditMode ? t('common.update') : t('common.submit')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewTechRequestPage;
