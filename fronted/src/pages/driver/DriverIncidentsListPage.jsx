import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useNavigate } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { useDriverApp } from '../../hooks/driver/useDriverApp';
import { resolveFileUrl } from '../../api/services/upload.service';
import { useAuth } from '../../hooks/useAuth';
import Breadcrumb from '../../components/ui/Breadcrumb';

export const DriverIncidentsListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { incidents: incidentsRaw, loadIncidents } = useDriverApp();

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadIncidents();
    } finally {
      setRefreshing(false);
    }
  };

  // Selected Incident Details Modal State
  const [selectedIncident, setSelectedIncident] = useState(null);

  useEffect(() => {
    loadIncidents().catch(() => {});
  }, [loadIncidents]);

  const rawList = useMemo(() => {
    const raw = incidentsRaw;
    return Array.isArray(raw) ? raw : (raw?.incidents || raw?.items || raw?.rows || []);
  }, [incidentsRaw]);

  // Filtering Logic
  const filteredIncidents = useMemo(() => {
    return rawList.filter((inc) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        String(inc.id).toLowerCase().includes(q) ||
        String(inc.incident_type || inc.incidentType || inc.type || '').toLowerCase().includes(q) ||
        String(inc.description || '').toLowerCase().includes(q) ||
        String(inc.location || '').toLowerCase().includes(q) ||
        String(inc.landmark || '').toLowerCase().includes(q) ||
        String(inc.hospital_name || '').toLowerCase().includes(q) ||
        String(inc.police_station_name || '').toLowerCase().includes(q);

      const sev = (inc.severity || 'low').toLowerCase();
      const matchesSeverity = severityFilter === 'ALL' || sev === severityFilter.toLowerCase();

      const type = (inc.incident_type || inc.incidentType || inc.type || '').toLowerCase();
      const matchesType = typeFilter === 'ALL' || type.includes(typeFilter.toLowerCase());

      const status = (inc.status || 'open').toLowerCase();
      const matchesStatus = statusFilter === 'ALL' || status === statusFilter.toLowerCase();

      return matchesSearch && matchesSeverity && matchesType && matchesStatus;
    });
  }, [rawList, searchQuery, severityFilter, typeFilter, statusFilter]);

  // Pagination Slice Logic
  const totalItems = filteredIncidents.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedIncidents = filteredIncidents.slice(startIndex, startIndex + pageSize);

  const resetFilters = () => {
    setSearchQuery('');
    setSeverityFilter('ALL');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setCurrentPage(1);
  };

  const getSeverityBadge = (sev) => {
    const s = (sev || 'low').toLowerCase();
    switch (s) {
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/60';
      case 'high':
        return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800/60';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60';
    }
  };

  const getStatusBadge = (st) => {
    const s = (st || 'open').toLowerCase();
    switch (s) {
      case 'resolved':
      case 'closed':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
      case 'in_progress':
      case 'investigating':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-20">
      {/* Header Bar */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <Breadcrumb
            items={[
              { label: 'Driver', path: '/driver/dashboard' },
              { label: 'Incident Log' },
            ]}
            className="mb-2"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <FleetIcons.Alert className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span>{t('driver.incidents.title')}</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
              Comprehensive audit log of all driver road incidents, medical dispatches, and emergency records
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          <RefreshButton
            onClick={handleRefresh}
            loading={refreshing}
            title={t('driver.incidents.refresh')}
          />
          {hasPermission('drivers.incidents.report') && (
            <Link
              to="/driver/incident-report"
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2"
            >
              <FleetIcons.Alert className="w-4 h-4 text-white" />
              <span>{t('driver.incidents.report_new')}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search Bar */}
          <div className="sm:col-span-2 relative">
            <FleetIcons.Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('driver.incidents.search_ph')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="ALL">{t('driver.incidents.all_severities')}</option>
              <option value="Critical">{t('driver.incidents.sev_critical')}</option>
              <option value="High">{t('driver.incidents.sev_high')}</option>
              <option value="Medium">{t('driver.incidents.sev_medium')}</option>
              <option value="Low">{t('driver.incidents.sev_low')}</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="ALL">{t('driver.incidents.all_statuses')}</option>
              <option value="open">{t('driver.incidents.stat_review')}</option>
              <option value="in_progress">{t('driver.incidents.stat_in_progress')}</option>
              <option value="resolved">{t('driver.incidents.stat_resolved')}</option>
              <option value="closed">{t('driver.incidents.stat_closed')}</option>
            </select>
          </div>
        </div>

        {/* Filter Pills & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-zinc-800 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('driver.incidents.quick_filter')}</span>
            {['ALL', 'Accident', 'Breakdown', 'Road Condition', 'Traffic Issue', 'Safety Concern'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setTypeFilter(cat);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                  typeFilter === cat
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-blue-600 dark:border-blue-600'
                    : 'bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {(searchQuery || severityFilter !== 'ALL' || typeFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-red-600 hover:text-red-700 font-bold underline cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Incidents Cards Grid */}
      <div className="space-y-3">
        {paginatedIncidents.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-3">
            <FleetIcons.Alert className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('driver.incidents.no_match')}</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">{t('driver.incidents.no_match_desc')}</p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          paginatedIncidents.map((inc) => {
            const photosArr = Array.isArray(inc.photos) ? inc.photos : [];
            const videosArr = Array.isArray(inc.videos) ? inc.videos : [];
            const incType = inc.incident_type || inc.incidentType || inc.type || 'Incident';
            const incSeverity = inc.severity || 'low';

            return (
              <div
                key={inc.id}
                onClick={() => navigate(`/driver/incidents/${inc.id}`)}
                className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-md transition-all cursor-pointer space-y-3.5 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-mono text-xs font-bold">
                      #{inc.id}
                    </span>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {incType}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                        Reported: {inc.reported_at ? new Date(inc.reported_at).toLocaleString('en-GB') : (inc.createdAt || '—')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getSeverityBadge(incSeverity)}`}>
                      ● {incSeverity}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusBadge(inc.status)}`}>
                      {String(inc.status || 'open').replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="sm:col-span-2 space-y-1">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">{t('driver.incidents.desc_loc')}</span>
                    <p className="text-slate-800 dark:text-zinc-200 font-medium line-clamp-2">{inc.description || 'No detailed description provided.'}</p>
                    <div className="text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-1.5 pt-1">
                      <FleetIcons.Pin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{inc.location || 'Location Not Specified'}</span>
                      {inc.landmark && <span>({inc.landmark})</span>}
                    </div>
                  </div>

                  {/* Medical & Assistance Summary Pill */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 space-y-1 text-[11px]">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{t('driver.incidents.medical')}</span>
                      </span>
                      {(inc.dead_casualty > 0 || inc.injured_count > 0) && (
                        <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-extrabold text-[10px]">{t('driver.incidents.casualties')}</span>
                      )}
                    </div>
                    <div className="text-slate-600 dark:text-zinc-300">
                      Fatalities: <strong className="text-red-600">{inc.dead_casualty || 0}</strong> {t('driver.incidents.injured')} <strong className="text-amber-600">{inc.injured_count || 0}</strong>
                    </div>
                    {inc.hospital_name && (
                      <div className="text-slate-500 truncate">{t('driver.incidents.hospital')} <strong>{inc.hospital_name}</strong></div>
                    )}
                  </div>
                </div>

                {/* Footer Media & Details Link */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-zinc-800 pt-3 text-xs">
                  <div className="flex items-center gap-3 text-slate-500 dark:text-zinc-400 font-medium">
                    {photosArr.length > 0 && (
                      <span className="flex items-center gap-1">
                        <FleetIcons.Camera className="w-3.5 h-3.5 text-slate-400" />
                        <span>{photosArr.length} Photos</span>
                      </span>
                    )}
                    {videosArr.length > 0 && (
                      <span className="flex items-center gap-1">
                        <FleetIcons.Video className="w-3.5 h-3.5 text-purple-500" />
                        <span>{videosArr.length} Videos</span>
                      </span>
                    )}
                    {inc.latitude && inc.longitude && (
                      <span className="flex items-center gap-1 text-emerald-600 font-mono font-bold">
                        <FleetIcons.Pin className="w-3.5 h-3.5" />
                        <span>{t('driver.incidents.gps_recorded')}</span>
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/driver/incidents/${inc.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="px-4 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-bold group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-blue-600 transition-colors text-xs"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Global Standard Pagination */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-2 shadow-sm">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          pageSizeOptions={[6, 10, 20, 50]}
          onPageChange={(p) => setCurrentPage(p)}
          onPageSizeChange={(s) => setPageSize(s)}
        />
      </div>

      {/* DETAILED INCIDENT DRAWER / MODAL */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/80 dark:bg-zinc-800/80">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 uppercase">Incident #{selectedIncident.id}</span>
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  {selectedIncident.incident_type || selectedIncident.incidentType || selectedIncident.type || 'Incident Details'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIncident(null)}
                className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-500 hover:text-slate-800 transition-colors"
                title={t('common.close')}
              >
                <FleetIcons.Close className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Header Status Box */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">{t('driver.incidents.reported_time')}</span>
                    <div className="text-xs font-bold text-slate-200">
                      {selectedIncident.reported_at ? new Date(selectedIncident.reported_at).toLocaleString('en-GB') : (selectedIncident.createdAt || '—')}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getSeverityBadge(selectedIncident.severity)}`}>
                    ● {selectedIncident.severity || 'low'} Disruption
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">{t('driver.incidents.loc_addr')}</span>
                    <span className="font-bold text-slate-100">{selectedIncident.location || 'Location Not Recorded'}</span>
                    {selectedIncident.landmark && <p className="text-slate-300 text-[11px] mt-0.5">Landmark: {selectedIncident.landmark}</p>}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">{t('driver.incidents.gps_coords')}</span>
                    <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                      {selectedIncident.latitude && selectedIncident.longitude ? (
                        <>
                          <FleetIcons.Pin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Lat: {selectedIncident.latitude}, Lng: {selectedIncident.longitude}</span>
                        </>
                      ) : (
                        'GPS Coordinates Not Captured'
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description & Action Taken */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">{t('driver.incidents.inc_desc')}</h4>
                  <p className="text-slate-700 dark:text-zinc-300 font-medium leading-relaxed">
                    {selectedIncident.description || 'No description entered.'}
                  </p>
                </div>
                {selectedIncident.immediate_action && (
                  <div className="border-t border-slate-200 dark:border-zinc-700 pt-2">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">{t('driver.incidents.action_taken')}</h4>
                    <p className="text-slate-700 dark:text-zinc-300 font-medium">{selectedIncident.immediate_action}</p>
                  </div>
                )}
              </div>

              {/* Emergency Medical Box */}
              <div className="p-4 rounded-2xl bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 space-y-3">
                <h4 className="font-bold text-red-900 dark:text-red-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <FleetIcons.Alert className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span>{t('driver.incidents.medical')}</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-red-100 dark:border-zinc-700">
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-bold">{t('driver.incidents.fatalities')}</span>
                    <span className="text-base font-black text-red-600">{selectedIncident.dead_casualty || 0}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-red-100 dark:border-zinc-700">
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-bold">{t('driver.incidents.injured_count')}</span>
                    <span className="text-base font-black text-amber-600">{selectedIncident.injured_count || 0}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-red-100 dark:border-zinc-700">
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-bold">{t('driver.incidents.hospital')}</span>
                    <span className="font-bold text-slate-900 dark:text-white truncate block">{selectedIncident.hospital_name || 'None'}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-red-100 dark:border-zinc-700">
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-bold">{t('driver.incidents.ambulance')}</span>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {selectedIncident.ambulance_assigned ? `Yes (${selectedIncident.ambulance_timing || 'Assigned'})` : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Police & Assistance */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">{t('driver.incidents.police')}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedIncident.police_notified ? `Yes (${selectedIncident.police_station_name || 'Police FIR'})` : 'No'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">{t('driver.incidents.towing')}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedIncident.towing_requested ? 'Requested' : 'Not Requested'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">{t('driver.incidents.weather_road')}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedIncident.weather_conditions || 'Clear'} · {selectedIncident.road_type || 'City Street'}
                  </span>
                </div>
              </div>

              {/* Photos Evidence */}
              {Array.isArray(selectedIncident.photos) && selectedIncident.photos.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">Photo Evidence ({selectedIncident.photos.length})</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {selectedIncident.photos.map((p, idx) => (
                      <a key={idx} href={resolveFileUrl(p)} target="_blank" rel="noreferrer" className="block rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 h-28 bg-black">
                        <img src={resolveFileUrl(p)} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos Evidence */}
              {Array.isArray(selectedIncident.videos) && selectedIncident.videos.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">Video Evidence ({selectedIncident.videos.length})</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedIncident.videos.map((v, idx) => (
                      <div key={idx} className="rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 h-36 bg-black">
                        <video src={resolveFileUrl(v)} controls className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedIncident(null)}
                className="px-6 py-2 bg-slate-900 dark:bg-blue-600 text-white text-xs font-bold rounded-xl"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverIncidentsListPage;
