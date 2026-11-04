import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
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
 * DriverWorkOrdersPage — list of technician work orders for the driver's fleet.
 * Driver can view existing ones AND create a new work order for their assigned bus.
 */
export const DriverWorkOrdersPage = () => {
  const { t } = useTranslation();

  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const loadWorkOrders = useCallback(async () => {
    try {
      const res = await driverSelfService.getWorkOrders({ limit: 100 });
      const rows = Array.isArray(res) ? res : (res?.rows || []);
      setWorkOrders(rows);
    } catch (err) {
      toast.error(err?.message || t('driver.work_orders.load_error', 'Could not load fleet work orders.'));
      setWorkOrders([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadWorkOrders();
  }, [loadWorkOrders]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadWorkOrders();
    } finally {
      setRefreshing(false);
    }
  };

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return workOrders.filter((wo) => {
      const matchesSearch =
        !q ||
        String(wo.code || '').toLowerCase().includes(q) ||
        String(wo.bus_number || '').toLowerCase().includes(q) ||
        String(wo.issue_category || '').toLowerCase().includes(q) ||
        String(wo.depot_name || wo.depot?.name || '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || String(wo.status || '').toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [workOrders, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filtered, currentPage, pageSize]
  );

  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter, pageSize]);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      <Breadcrumb
        items={[
          { label: t('nav.dashboard', 'Dashboard'), path: '/driver/dashboard' },
          { label: t('driver.work_orders.title', 'Fleet Work Orders') },
        ]}
        className="mb-1"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('driver.work_orders.title', 'Fleet Work Orders')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            {t('driver.work_orders.subtitle', 'Maintenance & technician requests raised for your fleet buses')}
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <RefreshButton
            onClick={handleRefresh}
            loading={refreshing}
            title={t('common.refresh', 'Refresh')}
            className="flex-1 sm:flex-initial justify-center"
          />
          <Link
            to="/driver/work-orders/new"
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <FleetIcons.Plus className="w-4 h-4" />
            <span>{t('ag.driver.driverworkorderspage.report_issue', 'Report Issue')}</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-3.5 sm:p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <FleetIcons.Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={t('driver.work_orders.search_placeholder', 'Search by code, bus number, issue...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-44 px-3 py-2 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-medium cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          >
            <option value="all">{t('driver.work_orders.all_statuses', 'All Statuses')}</option>
            <option value="submitted">{t('wo.status.submitted', 'Pending Assignment')}</option>
            <option value="approved">{t('wo.status.approved', 'Approved for Dispatch')}</option>
            <option value="dispatched">{t('wo.status.dispatched', 'Dispatched to Depot')}</option>
            <option value="on_site">{t('wo.status.on_site', 'On Site')}</option>
            <option value="resolved">{t('wo.status.resolved', 'Resolved')}</option>
            <option value="closed">{t('wo.status.closed', 'Closed')}</option>
            <option value="rejected">{t('wo.status.rejected', 'Rejected')}</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs text-slate-700 dark:text-zinc-300">
            <thead className="bg-slate-50 dark:bg-zinc-900/60 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">{t('driver.work_orders.col_code', 'Work Order')}</th>
                <th className="py-3 px-4">{t('driver.work_orders.col_bus', 'Bus / Depot')}</th>
                <th className="py-3 px-4">{t('driver.work_orders.col_issue', 'Issue')}</th>
                <th className="py-3 px-4">{t('driver.work_orders.col_urgency', 'Urgency')}</th>
                <th className="py-3 px-4">{t('driver.work_orders.col_status', 'Status')}</th>
                <th className="py-3 px-4 text-right">{t('driver.work_orders.col_raised', 'Raised')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-slate-400 dark:text-zinc-500">
                    {t('common.loading', 'Loading...')}
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <FleetIcons.Document className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-zinc-600" />
                    <p className="text-sm font-semibold text-slate-600 dark:text-zinc-400">
                      {searchQuery || statusFilter !== 'all'
                        ? t('ag.driver.driverworkorderspage.no_work_orders_matching_your_filters', 'No work orders matching your filters.')
                        : t('driver.work_orders.empty', 'No work orders found for your fleet.')}
                    </p>
                    {!searchQuery && statusFilter === 'all' && (
                      <Link
                        to="/driver/work-orders/new"
                        className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-bold rounded-xl transition-colors"
                      >
                        <FleetIcons.Plus className="w-3.5 h-3.5" />
                        <span>{t('ag.driver.driverworkorderspage.report_a_bus_issue', 'Report a Bus Issue')}</span>
                      </Link>
                    )}
                  </td>
                </tr>
              ) : (
                paginated.map((wo) => {
                  const status = getStatusConfig(wo.status);
                  const urgency = getUrgencyConfig(wo.urgency);
                  return (
                    <tr key={wo.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <Link
                          to={`/driver/work-orders/${wo.id}`}
                          className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {formatWorkOrderCode(wo.id, wo.code)}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 dark:text-white">{formatDisplayValue(wo.bus_number || wo.vehicle?.bus_number)}</p>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500">{formatDisplayValue(wo.depot_name || wo.depot?.name)}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 dark:text-zinc-200">{formatDisplayValue(wo.issue_category)}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${urgency.color}`}>
                          {urgency.badge}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${status.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-400 dark:text-zinc-500 font-mono text-[11px]">
                        {formatExactDateTime(wo.requested_at || wo.created_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 border-t border-slate-100 dark:border-zinc-800 rounded-b-2xl">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={pageSize}
              pageSizeOptions={[6, 10, 20, 50]}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverWorkOrdersPage;
