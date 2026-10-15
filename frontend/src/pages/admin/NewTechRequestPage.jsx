import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useAdminTechnicianRequest } from '../../hooks/admin/useAdminTechnicianRequest';
import { useAdminDepot } from '../../hooks/admin/useAdminDepot';
import { useAdminVehicle } from '../../hooks/admin/useAdminVehicle';
import { useAuth } from '../../hooks/useAuth';

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
  const isFleetPortal = location.pathname.startsWith('/fleet-manager');
  const basePath = isFleetPortal ? '/fleet-manager/technician-requests' : '/admin/technician-requests';
  const { hasPermission } = useAuth();

  const canCreate = hasPermission('work_orders.create');
  const canEdit = hasPermission('work_orders.edit') || hasPermission('work_orders.update') || hasPermission('work_orders.create');
  const canAccessForm = isEditMode ? canEdit : canCreate;

  const { createWorkOrder, updateWorkOrder, loadWorkOrderDetail } = useAdminTechnicianRequest();
  const { depots, loadDepots } = useAdminDepot();
  const { vehicles, loadVehicles } = useAdminVehicle();
  const depotsList = Array.isArray(depots) ? depots : (depots?.items || depots?.rows || []);
  const vehiclesList = Array.isArray(vehicles) ? vehicles : (vehicles?.items || vehicles?.rows || []);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [formData, setFormData] = useState({
    busNumber: '',
    depot: '',
    issueCategory: 'Display Screen Glitch / HDMI Telemetry Sync',
    urgency: 'critical',
    description: '',
    instructions: '',
  });

  useEffect(() => {
    if (!canAccessForm) return;
    loadDepots().catch(() => {});
    loadVehicles().catch(() => {});
  }, [canAccessForm, loadDepots, loadVehicles]);

  useEffect(() => {
    if (!canAccessForm) return;
    if (isEditMode && id) {
      setFetching(true);
      loadWorkOrderDetail(id)
        .then((found) => {
          if (found) {
            const statusKey = (found.status || '').toLowerCase();
            if (['resolved', 'closed', 'rejected'].includes(statusKey)) {
              toast.error(`Cannot edit finalized work order (${statusKey})`);
              navigate(basePath);
              return;
            }
            setFormData({
              busNumber: found.bus_number || found.busNumber || (found.vehicle?.bus_number) || '',
              depot: found.depot_name || formatName(found.depot) || '',
              issueCategory: found.issue_category || found.issueCategory || found.title || 'Display Screen Glitch / HDMI Telemetry Sync',
              urgency: (found.urgency || found.priority || 'critical').toLowerCase(),
              description: found.description || found.issue_details || '',
              instructions: found.instructions || '',
            });
          }
        })
        .catch((err) => toast.error(err?.message || 'Failed to load work order'))
        .finally(() => setFetching(false));
    }
  }, [id, isEditMode, canAccessForm, loadWorkOrderDetail, navigate, basePath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.busNumber) {
      toast.error('Please select a target bus number');
      return;
    }
    if (!formData.depot) {
      toast.error('Please select a depot location');
      return;
    }
    if (!formData.description?.trim()) {
      toast.error('Please describe the detailed symptoms');
      return;
    }

    setLoading(true);
    try {
      const selectedVehicle = vehiclesList.find(
        (v) => (v.bus_number || v.busNumber) === formData.busNumber
      );
      const selectedDepot = depotsList.find(
        (d) => d.name === formData.depot
      );

      const payload = {
        busNumber: formData.busNumber,
        vehicleId: selectedVehicle?.id || null,
        depotName: formData.depot,
        depotId: selectedDepot?.id || null,
        issueCategory: formData.issueCategory,
        urgency: formData.urgency.toLowerCase(),
        description: formData.description.trim(),
        instructions: formData.instructions?.trim() || null,
      };

      const actionPromise = isEditMode
        ? updateWorkOrder(id, payload)
        : createWorkOrder(payload);

      await toast.promise(actionPromise, {
        loading: isEditMode ? 'Updating request details...' : 'Submitting request...',
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
      <div className="w-full bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm space-y-4">
        <div className="text-4xl">🔒</div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">Access Revoked</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">
          Your administrator has revoked your permission to {isEditMode ? 'edit' : 'create'} technician work orders.
        </p>
        <Link
          to={basePath}
          className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
        >
          ← Back to Technician Requests
        </Link>
      </div>
    );
  }

  if (fetching) {
    return (
      <div className="w-full bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm">
        <div className="text-slate-500 dark:text-zinc-400 font-bold text-sm">Loading technician work order details...</div>
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
              { label: isFleetPortal ? 'Fleet Operator' : 'Tenant Admin', path: isFleetPortal ? '/fleet-manager/dashboard' : '/admin/dashboard' },
              { label: 'Technician Requests', path: basePath },
              { label: isEditMode ? 'Edit Request' : 'New Request' },
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {isEditMode ? 'Edit Technician Work Order' : 'Submit Central Technician Request'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
            {isEditMode ? 'Update vehicle telemetry problem scope and depot gate notes' : 'Request a certified Level 1-3 engineer from VMOVEXA Central Pool for depot hardware troubleshooting'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Vehicle & Hardware Problem Scope</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Select target vehicle, depot gate, and describe hardware/telematics symptoms</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Target Bus Number *</label>
            <select
              required
              value={formData.busNumber}
              onChange={(e) => {
                const bNum = e.target.value;
                const v = vehiclesList.find((item) => (item.bus_number || item.busNumber) === bNum);
                const depName = v ? (v.depot?.name || formatName(v.depot) || '') : '';
                setFormData({
                  ...formData,
                  busNumber: bNum,
                  ...(depName ? { depot: depName } : {}),
                });
              }}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">Select a bus</option>
              {vehiclesList.map((v) => {
                const busNum = v.bus_number || v.busNumber || v.code;
                return (
                  <option key={v.id} value={busNum}>
                    {busNum} ({formatName(v.depot)})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Depot Location *</label>
            <select
              required
              value={formData.depot}
              onChange={(e) => setFormData({ ...formData, depot: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">Select a depot</option>
              {depotsList.map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Issue Classification *</label>
            <select
              required
              value={formData.issueCategory}
              onChange={(e) => setFormData({ ...formData, issueCategory: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="Display Screen Glitch / HDMI Telemetry Sync">Display Screen Glitch / HDMI Telemetry Sync</option>
              <option value="GPS Tracker Recalibration">GPS Tracker Recalibration</option>
              <option value="RK3588 Edge Box Power Cut / No Boot">RK3588 Edge Box Power Cut / No Boot</option>
              <option value="Multi-Display Sync Failure">Multi-Display Sync Failure</option>
              <option value="CAN-bus Diagnostic Harness Calibration">CAN-bus Diagnostic Harness Calibration</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Urgency Level *</label>
            <select
              required
              value={formData.urgency}
              onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="critical">Critical - Bus Grounded (2-4 Hour SLA)</option>
              <option value="high">High Urgency - Route Operating (12 Hour SLA)</option>
              <option value="normal">Normal - Scheduled Maintenance (24 Hour SLA)</option>
              <option value="low">Low - General Equipment Check (48 Hour SLA)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Detailed Symptoms & Depot Gate Notes *</label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Display backlight flickers when bus accelerates. Depot bay 4 access available from 08:00 AM."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Special Dispatch / Technician Instructions</label>
            <textarea
              rows={2}
              placeholder="e.g. Carry spare HDMI splitter and 12V harness. Report to Depot Master on arrival."
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
            <span>{isEditMode ? 'Update Work Order' : 'Submit Ticket to Super Admin Pool'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewTechRequestPage;
