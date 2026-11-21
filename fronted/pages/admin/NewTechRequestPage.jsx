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

const APPROVED_VEHICLE_STATUSES = new Set(['on_route', 'in_depot', 'maintenance', 'offline']);

export const NewTechRequestPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const isFleetPortal = location.pathname.startsWith('/fleet-operator');
  const basePath = isFleetPortal ? '/fleet-operator/technician-requests' : '/admin/technician-requests';
  const { can } = useAuth();
  const { t } = useTranslation();

  const canCreate = can('work_orders.create');
  const hasEditPermission = can(['work_orders.update', 'work_orders.create']);
  const [serverCanEdit, setServerCanEdit] = useState(null);
  const canAccessForm = isEditMode ? (hasEditPermission && serverCanEdit !== false) : canCreate;

  const { createWorkOrder, updateWorkOrder, loadWorkOrderDetail } = useAdminTechnicianRequest();
  const { vehicles, loading: vehiclesLoading, loadVehicles } = useAdminVehicle();
  const vehiclesList = Array.isArray(vehicles) ? vehicles : (vehicles?.items || vehicles?.rows || []);
  const approvedVehiclesList = vehiclesList.filter((vehicle) =>
    APPROVED_VEHICLE_STATUSES.has(String(vehicle.status || '').toLowerCase())
  );

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [debouncedVehicleSearch, setDebouncedVehicleSearch] = useState('');
  const [isVehicleDropdownOpen, setIsVehicleDropdownOpen] = useState(false);

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
    }, 350);
    return () => clearTimeout(timer);
  }, [vehicleSearch]);

  useEffect(() => {
    if (!canAccessForm) return;
    const params = { limit: 100, exclude_pending: true };
    if (debouncedVehicleSearch) params.search = debouncedVehicleSearch;
    loadVehicles(params).catch(() => {});
  }, [canAccessForm, debouncedVehicleSearch, loadVehicles]);

  useEffect(() => {
    if (!canAccessForm) return;
    if (isEditMode && id) {
      loadWorkOrderDetail(id)
        .then((found) => {
          if (found) {
            const allowed = found.capabilities?.canEdit === true;
            setServerCanEdit(allowed);
            if (!allowed) {
              toast.error(t('ag.admin.newtechrequestpage.you_cannot_edit_this_technician_requ', 'You cannot edit this technician request'));
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
            setVehicleSearch(found.bus_number || found.busNumber || found.vehicle?.bus_number || '');
          }
        })
        .catch((err) => toast.error(err?.message || 'Failed to load request details'))
        .finally(() => setFetching(false));
    }
  }, [id, isEditMode, canAccessForm, loadWorkOrderDetail, navigate, basePath]);

  const handleVehicleSelect = (vehicle) => {
    const busNumber = vehicle?.bus_number || vehicle?.busNumber || vehicle?.code || '';
    setFormData((prev) => ({
      ...prev,
      vehicleId: vehicle ? String(vehicle.id) : '',
      busNumber,
      depotName: vehicle?.depot?.name || vehicle?.depot_name || '',
    }));
    setVehicleSearch(busNumber);
    setIsVehicleDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vehicleId) {
      toast.error(t('ag.admin.newtechrequestpage.please_select_a_bus_number', 'Please select a bus number'));
      return;
    }
    if (!formData.issueCategory.trim()) {
      toast.error(t('ag.admin.newtechrequestpage.please_enter_an_issue_category', 'Please enter an issue category'));
      return;
    }
    if (!formData.description?.trim()) {
      toast.error(t('ag.admin.newtechrequestpage.please_enter_a_description_of_the_is', 'Please enter a description of the issue'));
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
          {t('ag.admin.newtechrequestpage.you_do_not_have_permission_to', 'You do not have permission to')} {isEditMode ? t('ag.admin.newtechrequestpage.edit', 'edit') : t('ag.admin.newtechrequestpage.create', 'create')} {t('ag.admin.newtechrequestpage.technician_requests', 'technician requests.')}
        </p>
        <Link
          to={basePath}
          className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
        >
          {t('ag.admin.newtechrequestpage.back_to_technician_requests', 'Back to Technician Requests')}
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
              { label: isFleetPortal ? t('ag.admin.newtechrequestpage.fleet_operator', 'Fleet Operator') : t('ag.admin.admin_operations', 'Admin Operations'), path: isFleetPortal ? '/fleet-operator/dashboard' : '/admin/dashboard' },
              { label: t('ag.admin.newtechrequestpage.technician_requests', 'Technician Requests'), path: basePath },
              { label: isEditMode ? t('ag.admin.newtechrequestpage.edit_request', 'Edit Request') : t('ag.admin.newtechrequestpage.new_request', 'New Request') },
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {isEditMode ? t('admin.tech_requests.edit_details_btn') : t('admin.tech_requests.new_ticket_title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
            {isEditMode ? t('ag.admin.newtechrequestpage.update_request_details_and_issue_not', 'Update request details and issue notes') : t('ag.admin.newtechrequestpage.request_hardware_repair_or_maintenan', 'Request hardware repair or maintenance for a bus')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-5">
        <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">{t('admin.tech_requests.vehicle_issue_details')}</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{t('admin.tech_requests.vehicle_issue_sub')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('admin.tech_requests.bus_number_req')}</label>
            <div
              className="relative"
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setIsVehicleDropdownOpen(false);
              }}
            >
              <FleetIcons.Search className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                role="combobox"
                aria-expanded={isVehicleDropdownOpen}
                aria-controls="technician-vehicle-options"
                autoComplete="off"
                value={vehicleSearch}
                onFocus={() => setIsVehicleDropdownOpen(true)}
                onChange={(e) => {
                  setVehicleSearch(e.target.value);
                  setIsVehicleDropdownOpen(true);
                  if (formData.vehicleId) {
                    setFormData((prev) => ({ ...prev, vehicleId: '', busNumber: '', depotName: '' }));
                  }
                }}
                placeholder={t('ag.admin.newtechrequestpage.search_bus_number_code_vin_or_model', 'Search bus number, code, VIN or model...')}
                className={`h-11 w-full rounded-xl border bg-white pl-10 pr-10 text-xs font-bold text-slate-900 shadow-sm transition-all placeholder:font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 ${
                  formData.vehicleId
                    ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/15'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/15 dark:border-zinc-700'
                }`}
              />

              {(vehicleSearch || formData.vehicleId) && (
                <button
                  type="button"
                  onClick={() => handleVehicleSelect(null)}
                  className="absolute right-3 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                  title={t('common.clear', 'Clear')}
                >
                  <FleetIcons.Close className="h-3.5 w-3.5" />
                </button>
              )}

              {isVehicleDropdownOpen && (
                <div
                  id="technician-vehicle-options"
                  role="listbox"
                  className="absolute z-40 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-black/30"
                >
                  {vehiclesLoading ? (
                    <div className="flex items-center gap-2 px-3 py-3 text-xs font-semibold text-slate-500 dark:text-zinc-400">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                      {t('ag.admin.newtechrequestpage.loading_vehicles', 'Loading vehicles...')}
                    </div>
                  ) : approvedVehiclesList.length === 0 ? (
                    <div className="px-3 py-3 text-xs font-semibold text-slate-500 dark:text-zinc-400">
                      {t('admin.tech_requests.no_matching_bus', 'No matching active bus found')}
                    </div>
                  ) : (
                    approvedVehiclesList.map((vehicle) => {
                      const busNumber = vehicle.bus_number || vehicle.busNumber || vehicle.code || `Vehicle #${vehicle.id}`;
                      const isSelected = String(formData.vehicleId) === String(vehicle.id);
                      return (
                        <button
                          key={vehicle.id}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => handleVehicleSelect(vehicle)}
                          className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                            isSelected
                              ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
                              : 'text-slate-700 hover:bg-slate-50 dark:text-zinc-300 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-mono text-xs font-black text-slate-900 dark:text-white">{busNumber}</span>
                            <span className="mt-0.5 block truncate text-[10px] font-medium text-slate-500 dark:text-zinc-400">
                              {vehicle.model || vehicle.vehicle_type || 'Bus'} · {formatName(vehicle.depot, 'Depot not assigned')}
                            </span>
                          </span>
                          {isSelected && <FleetIcons.Check className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
            <p className="mt-1.5 text-[10px] font-medium text-slate-500 dark:text-zinc-400">
              {formData.vehicleId
                ? t('admin.tech_requests.bus_selected', 'Bus selected. Type again to change it.')
                : t('admin.tech_requests.search_bus_hint', 'Type a bus number, code, VIN, or model to search.')}
            </p>
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

          <div className="flex min-w-0 flex-col sm:col-span-2 lg:col-span-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('admin.tech_requests.issue_desc_req')}</label>
            <textarea
              rows={5}
              required
              placeholder={t('admin.tech_requests.issue_desc_ph')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-32 w-full flex-1 resize-y px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex min-w-0 flex-col sm:col-span-2 lg:col-span-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('admin.tech_requests.tech_instructions_opt')}</label>
            <textarea
              rows={5}
              placeholder={t('admin.tech_requests.tech_instructions_ph')}
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              className="min-h-32 w-full flex-1 resize-y px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
          <Link
            to={basePath}
            className="px-5 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-colors text-center"
          >
            {t('ag.admin.newtechrequestpage.cancel', 'Cancel')}
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
