import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useParams, Link } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { driverSelfService } from '../../api/services/driver/driver.service';
import {
  getStatusConfig,
  getUrgencyConfig,
  formatDisplayValue,
  formatExactDateTime,
  formatWorkOrderCode,
} from '../../features/workOrders/workOrderPresentation';
import toast from 'react-hot-toast';

/**
 * DriverWorkOrderDetailPage — read-only detail view of a single fleet work order.
 * Accessible only if the work order belongs to the driver's fleet (enforced server-side).
 */
export const DriverWorkOrderDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  const [workOrder, setWorkOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await driverSelfService.getWorkOrder(id);
      setWorkOrder(res);
    } catch (err) {
      setError(err?.message || t('driver.work_orders.detail_error', 'Could not load this work order.'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="w-full py-20 text-center text-slate-400 dark:text-zinc-500 text-sm font-medium animate-in fade-in">
        {t('common.loading', 'Loading...')}
      </div>
    );
  }

  if (error || !workOrder) {
    return (
      <div className="w-full space-y-6 animate-in fade-in duration-200">
        <Breadcrumb
          items={[
            { label: t('nav.dashboard', 'Dashboard'), path: '/driver/dashboard' },
            { label: t('driver.work_orders.title', 'Fleet Work Orders'), path: '/driver/work-orders' },
            { label: t('common.details', 'Details') },
          ]}
        />
        <div className="p-10 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">
          <p className="text-sm font-bold text-slate-700 dark:text-zinc-200">
            {error || t('driver.work_orders.not_found', 'Work order not available.')}
          </p>
          <Link
            to="/driver/work-orders"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl transition-colors"
          >
            <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('driver.work_orders.back', 'Back to Work Orders')}</span>
          </Link>
        </div>
      </div>
    );
  }

  const status = getStatusConfig(workOrder.status);
  const urgency = getUrgencyConfig(workOrder.urgency);

  const Row = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-2.5 border-b border-slate-100 dark:border-zinc-800 last:border-0">
      <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 dark:text-zinc-500">{label}</span>
      <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 sm:text-right">{value}</span>
    </div>
  );

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      <Breadcrumb
        items={[
          { label: t('nav.dashboard', 'Dashboard'), path: '/driver/dashboard' },
          { label: t('driver.work_orders.title', 'Fleet Work Orders'), path: '/driver/work-orders' },
          { label: formatWorkOrderCode(workOrder.id, workOrder.code) },
        ]}
        className="mb-1"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div className="flex items-start gap-3">
          <Link
            to="/driver/work-orders"
            className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors shrink-0"
            title={t('driver.work_orders.back', 'Back to Work Orders')}
          >
            <FleetIcons.ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
              {formatWorkOrderCode(workOrder.id, workOrder.code)}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
              {t('driver.work_orders.detail_subtitle', 'Maintenance request for your fleet bus')}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${urgency.color}`}>{urgency.label}</span>
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${status.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details card */}
        <div className="lg:col-span-2 bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-3 mb-2">
            {t('driver.work_orders.section_details', 'Request Details')}
          </h3>
          <Row label={t('driver.work_orders.col_bus', 'Bus Number')} value={formatDisplayValue(workOrder.bus_number || workOrder.vehicle?.bus_number)} />
          <Row label={t('driver.work_orders.depot', 'Depot')} value={formatDisplayValue(workOrder.depot_name || workOrder.depot?.name)} />
          <Row label={t('driver.work_orders.col_issue', 'Issue Category')} value={formatDisplayValue(workOrder.issue_category)} />
          <Row label={t('driver.work_orders.technician', 'Assigned Technician')} value={formatDisplayValue(workOrder.technician?.name, t('driver.work_orders.not_assigned', 'Not assigned yet'))} />
          <Row label={t('driver.work_orders.raised_by', 'Raised By')} value={formatDisplayValue(workOrder.requestedBy?.name)} />
          <Row label={t('driver.work_orders.col_raised', 'Raised At')} value={formatExactDateTime(workOrder.requested_at || workOrder.created_at)} />
          {workOrder.description && (
            <div className="pt-3">
              <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 dark:text-zinc-500 block mb-1">
                {t('driver.work_orders.description', 'Description')}
              </span>
              <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">{workOrder.description}</p>
            </div>
          )}
          {workOrder.resolution_notes && (
            <div className="pt-3">
              <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 dark:text-zinc-500 block mb-1">
                {t('driver.work_orders.resolution', 'Resolution Notes')}
              </span>
              <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">{workOrder.resolution_notes}</p>
            </div>
          )}
        </div>

        {/* Lifecycle card */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs h-fit">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-3 mb-2">
            {t('driver.work_orders.section_timeline', 'Lifecycle')}
          </h3>
          <Row label={t('wo.status.submitted', 'Submitted')} value={formatExactDateTime(workOrder.requested_at || workOrder.created_at)} />
          <Row label={t('wo.status.dispatched', 'Dispatched')} value={formatExactDateTime(workOrder.dispatched_at)} />
          <Row label={t('wo.status.on_site', 'On Site')} value={formatExactDateTime(workOrder.on_site_at)} />
          <Row label={t('wo.status.resolved', 'Resolved')} value={formatExactDateTime(workOrder.resolved_at)} />
        </div>
      </div>

      {/* Read-only footer note */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 text-[11px] font-medium">
        <FleetIcons.Info className="w-4 h-4 shrink-0 mt-0.5" />
        <span>{t('driver.work_orders.readonly_note', 'You can view maintenance requests for your fleet. Assignment and status updates are handled by fleet operators and technicians.')}</span>
      </div>
    </div>
  );
};

export default DriverWorkOrderDetailPage;
