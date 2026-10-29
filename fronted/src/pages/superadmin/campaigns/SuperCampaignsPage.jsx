import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../../hooks/useTranslation';
import { useSuperCampaign } from '../../../hooks/superadmin/useSuperCampaign';
import { Pagination } from '../../../components/ui/Pagination';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import { FleetIcons } from '../../../components/FleetIcons';

const statusClass = (status) =>
  status === 'live'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : status === 'rejected'
    ? 'bg-red-50 text-red-700 border-red-200'
    : 'bg-amber-50 text-amber-700 border-amber-200';

export const SuperCampaignsPage = () => {
  const { t } = useTranslation();
  const { campaigns, loadCampaigns } = useSuperCampaign();
  const [filters, setFilters] = useState({
    search: '',
    ownerType: 'all',
    status: 'all',
    paymentStatus: 'all',
    routeId: 'all',
    fleetId: 'all',
    organizationId: 'all',
    dateFrom: '',
    dateTo: '',
    autoScheduled: 'all',
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      loadCampaigns({
        page,
        limit,
        includeFilterOptions: true,
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.ownerType !== 'all' ? { ownerType: filters.ownerType } : {}),
        ...(filters.status !== 'all' ? { status: filters.status } : {}),
        ...(filters.paymentStatus !== 'all' ? { paymentStatus: filters.paymentStatus } : {}),
        ...(filters.routeId !== 'all' ? { routeId: filters.routeId } : {}),
        ...(filters.fleetId !== 'all' ? { fleetId: filters.fleetId } : {}),
        ...(filters.organizationId !== 'all' ? { organizationId: filters.organizationId } : {}),
        ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
        ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
        ...(filters.autoScheduled !== 'all' ? { autoScheduled: filters.autoScheduled } : {}),
      }).finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [filters, page, limit, loadCampaigns, refreshKey]);

  const rows = Array.isArray(campaigns) ? campaigns : (campaigns?.rows || []);
  const meta = campaigns?.meta || {};

  const routes = useMemo(() => {
    if (Array.isArray(campaigns?.filterOptions?.routes)) return campaigns.filterOptions.routes.map((item) => [String(item.id), item.name]);
    const map = new Map();
    rows.flatMap((campaign) => campaign.targets || []).forEach((target) => {
      if (target.route_id) map.set(String(target.route_id), target.route?.name || `Route #${target.route_id}`);
    });
    return [...map.entries()];
  }, [rows, campaigns]);

  const fleets = useMemo(() => {
    if (Array.isArray(campaigns?.filterOptions?.fleets)) return campaigns.filterOptions.fleets.map((item) => [String(item.id), item.name]);
    const map = new Map();
    rows.flatMap((campaign) => campaign.targets || []).forEach((target) => {
      if (target.fleet_id) map.set(String(target.fleet_id), target.fleet?.name || target.fleet_name || `Fleet #${target.fleet_id}`);
    });
    return [...map.entries()];
  }, [rows, campaigns]);

  const organizations = useMemo(() => {
    if (Array.isArray(campaigns?.filterOptions?.organizations)) return campaigns.filterOptions.organizations.map((item) => [String(item.id), item.name]);
    const map = new Map();
    rows.flatMap((campaign) => campaign.targets || []).forEach((target) => {
      if (target.organization_id) map.set(String(target.organization_id), target.organization?.name || `Tenant #${target.organization_id}`);
    });
    return [...map.entries()];
  }, [rows, campaigns]);

  const update = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <Breadcrumb
          items={[
            { label: 'Super Admin', path: '/superadmin/dashboard' },
            { label: t('superadmin.campaigns.title', 'Global Campaign Control') },
          ]}
          className="mb-2"
        />
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {t('superadmin.campaigns.title', 'Global Campaign Control')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
              {t('superadmin.campaigns.subtitle', 'Advertiser and Government campaigns, automatic schedules and screen dispatch health.')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRefreshKey((value) => value + 1)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-60 cursor-pointer"
          >
            <FleetIcons.RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? t('common.refreshing', 'Refreshing...') : t('common.refresh', 'Refresh')}</span>
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
        <label className="relative sm:col-span-2 xl:col-span-1">
          <FleetIcons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
            placeholder={t('superadmin.campaigns.search_ph', 'Search campaign or client')}
            className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-white"
          />
        </label>

        <select
          value={filters.ownerType}
          onChange={(e) => update('ownerType', e.target.value)}
          className="px-3 py-2.5 text-xs rounded-xl border dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        >
          <option value="all">{t('superadmin.campaigns.all_owners', 'All owners')}</option>
          <option value="advertiser">{t('superadmin.campaigns.advertiser', 'Advertiser')}</option>
          <option value="government">{t('superadmin.campaigns.government', 'Government')}</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => update('status', e.target.value)}
          className="px-3 py-2.5 text-xs rounded-xl border dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        >
          <option value="all">{t('superadmin.campaigns.all_statuses', 'All statuses')}</option>
          {['pending_approval', 'approved', 'live', 'paused', 'completed', 'rejected'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={filters.paymentStatus}
          onChange={(e) => update('paymentStatus', e.target.value)}
          className="px-3 py-2.5 text-xs rounded-xl border dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        >
          <option value="all">{t('superadmin.campaigns.all_payments', 'All payments')}</option>
          <option value="paid">{t('superadmin.campaigns.paid_cleared', 'Paid / cleared')}</option>
          <option value="unpaid">{t('superadmin.campaigns.unpaid', 'Unpaid')}</option>
          <option value="pending">{t('superadmin.campaigns.pending', 'Pending')}</option>
        </select>

        <select
          value={filters.routeId}
          onChange={(e) => update('routeId', e.target.value)}
          className="px-3 py-2.5 text-xs rounded-xl border dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        >
          <option value="all">{t('superadmin.campaigns.all_routes', 'All routes')}</option>
          {routes.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>

        <select
          value={filters.fleetId}
          onChange={(e) => update('fleetId', e.target.value)}
          className="px-3 py-2.5 text-xs rounded-xl border dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        >
          <option value="all">{t('superadmin.campaigns.all_fleets', 'All fleet operators')}</option>
          {fleets.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>

        <select
          value={filters.organizationId}
          onChange={(e) => update('organizationId', e.target.value)}
          className="px-3 py-2.5 text-xs rounded-xl border dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        >
          <option value="all">{t('superadmin.campaigns.all_tenants', 'All tenants')}</option>
          {organizations.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>

        <select
          value={filters.autoScheduled}
          onChange={(e) => update('autoScheduled', e.target.value)}
          className="px-3 py-2.5 text-xs rounded-xl border dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        >
          <option value="all">{t('superadmin.campaigns.all_schedule_modes', 'All schedule modes')}</option>
          <option value="true">{t('superadmin.campaigns.automatic', 'Automatic')}</option>
          <option value="false">{t('superadmin.campaigns.manual_override', 'Manual override')}</option>
        </select>

        <label className="text-[10px] font-bold uppercase text-slate-500">
          {t('superadmin.campaigns.running_from', 'Running from')}
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => update('dateFrom', e.target.value)}
            className="mt-1 w-full px-3 py-2 text-xs rounded-xl border dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </label>

        <label className="text-[10px] font-bold uppercase text-slate-500">
          {t('superadmin.campaigns.running_until', 'Running until')}
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => update('dateTo', e.target.value)}
            className="mt-1 w-full px-3 py-2 text-xs rounded-xl border dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </label>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 uppercase">
            <tr>
              <th className="p-3">{t('superadmin.campaigns.th_campaign', 'Campaign')}</th>
              <th className="p-3">{t('superadmin.campaigns.th_owner', 'Owner')}</th>
              <th className="p-3">{t('superadmin.campaigns.th_inventory', 'Inventory')}</th>
              <th className="p-3">{t('superadmin.campaigns.th_slot_state', 'Slot / next state')}</th>
              <th className="p-3">{t('superadmin.campaigns.th_payment', 'Payment')}</th>
              <th className="p-3">{t('common.status', 'Status')}</th>
              <th className="p-3 text-right">{t('common.actions', 'Action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
            {rows.map((campaign) => {
              const targets = campaign.targets || [];
              const buses = targets.reduce((sum, trg) => sum + Number(trg.vehicles_count || 0), 0);
              const screens = targets.reduce((sum, trg) => sum + Number(trg.screens_count || 0), 0);
              const government = campaign.owner_type === 'government' || campaign.type === 'government_psa';
              return (
                <tr key={campaign.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                  <td className="p-3">
                    <strong className="block text-slate-900 dark:text-white">{campaign.title}</strong>
                    <span className="font-mono text-slate-500">{campaign.code}</span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-lg font-bold ${government ? 'bg-indigo-50 text-indigo-700' : 'bg-blue-50 text-blue-700'}`}>
                      {government ? t('superadmin.campaigns.government', 'Government') : t('superadmin.campaigns.advertiser', 'Advertiser')}
                    </span>
                    <span className="block mt-1 text-slate-500">
                      {campaign.agency?.name || campaign.advertiser?.name || campaign.client_company || '—'}
                    </span>
                  </td>
                  <td className="p-3">
                    <strong className="dark:text-white">
                      {targets.length} {t('superadmin.campaigns.routes_suffix', 'routes')}
                    </strong>
                    <span className="block text-slate-500">
                      {buses} {t('superadmin.campaigns.buses_suffix', 'buses')} · {screens} {t('superadmin.campaigns.screens_suffix', 'screens')}
                    </span>
                  </td>
                  <td className="p-3">
                    <strong className="dark:text-white">
                      {String(campaign.broadcast_start_time || '').slice(0, 5)}–{String(campaign.broadcast_end_time || '').slice(0, 5)}
                    </strong>
                    <span className="block text-slate-500">{campaign.schedule_status || 'awaiting_clearance'}</span>
                  </td>
                  <td className="p-3 font-bold dark:text-white">{campaign.payment_status}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 border rounded-lg font-bold ${statusClass(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Link to={`/superadmin/campaigns/${campaign.id}`} className="text-blue-600 dark:text-blue-400 font-bold">
                      {t('common.view_details', 'View details')}
                    </Link>
                  </td>
                </tr>
              );
            })}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan="7" className="p-10 text-center text-slate-500">
                  {t('superadmin.campaigns.no_campaigns_matched', 'No campaigns matched these filters.')}
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan="7" className="p-10 text-center text-slate-500">
                  {t('superadmin.campaigns.loading_campaigns', 'Loading campaigns...')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalPages={meta.totalPages || 1}
        onPageChange={setPage}
        totalItems={meta.total || rows.length}
        pageSize={limit}
        onPageSizeChange={(value) => {
          setLimit(value);
          setPage(1);
        }}
        pageSizeOptions={[10, 20, 50, 100]}
      />
    </div>
  );
};

export default SuperCampaignsPage;
