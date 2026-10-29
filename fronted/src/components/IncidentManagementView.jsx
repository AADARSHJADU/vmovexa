import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import toast from 'react-hot-toast';
import { FleetIcons } from './FleetIcons';
import { Pagination } from './ui/Pagination';
import { RefreshButton } from './ui/RefreshButton';
import { Breadcrumb } from './ui/Breadcrumb';
import { resolveFileUrl, uploadFile } from '../api/services/upload.service';
import { useFleetIncident } from '../hooks/fleet/useFleetIncident';
import { fleetVehicleService } from '../api/services/fleet/vehicle.service';
import { fleetDriverService } from '../api/services/fleet/driver.service';
import { superOrganizationService } from '../api/services/superadmin/organization.service';
import { useAuth } from '../hooks/useAuth';

export const IncidentManagementView = ({ roleTitle = 'Fleet Manager', roleScope = 'fleet' }) => {
  const { t } = useTranslation();
  const { user, hasPermission } = useAuth();
  // Role check: Super Admin authority exclusivity
  const isSuperAdmin = useMemo(() => {
    const roleCode = typeof user?.role === 'string' ? user.role : (user?.role?.code || '');
    return (
      roleScope === 'superadmin' ||
      user?.clearance === 'ROOT' ||
      roleCode === 'ROLE-SUPER-ADMIN' ||
      roleCode === 'ROLE-PLATFORM-ADMIN' ||
      roleCode.toLowerCase().includes('super')
    );
  }, [roleScope, user]);

  const canView = isSuperAdmin || roleScope === 'superadmin' || hasPermission('fleet.incidents.view');

  // Redux Hook for incidents
  const {
    incidents,
    loading,
    loadIncidents,
    createIncident,
    updateResolution,
    fetchIncidentById,
  } = useFleetIncident();

  // View Navigation State ('list' | 'detail')
  const [activeView, setActiveView] = useState('list');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [orgFilter, setOrgFilter] = useState('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Media Lightbox Modal State ({ type: 'image' | 'video', url: string })
  const [activeMedia, setActiveMedia] = useState(null);

  // Resolution Form State
  const [resolutionForm, setResolutionForm] = useState({
    status: 'contacted',
    contactedDriver: true,
    contactNotes: '',
    recovered: false,
    resolutionNotes: '',
  });
  const [updating, setUpdating] = useState(false);

  // Report Incident Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [vehiclesList, setVehiclesList] = useState([]);
  const [driversList, setDriversList] = useState([]);
  const [organizationsList, setOrganizationsList] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const initialReportForm = {
    organization_id: '',
    vehicle_id: '',
    driver_id: '',
    incident_type: 'Accident',
    severity: 'high',
    description: '',
    location: '',
    landmark: '',
    latitude: '',
    longitude: '',
    weather_conditions: 'Clear',
    road_type: 'City Street',
    dead_casualty: 0,
    injured_count: 0,
    hospital_name: '',
    ambulance_assigned: false,
    ambulance_timing: '',
    police_notified: false,
    police_station_name: '',
    towing_requested: false,
    traffic_disruption_level: 'none',
    immediate_action: '',
    photos: [],
    videos: [],
  };

  const [reportForm, setReportForm] = useState(initialReportForm);

  useEffect(() => {
    if (canView) {
      loadIncidents().catch((err) => {
        toast.error(err?.message || 'Failed to load incident reports.');
      });
      if (isSuperAdmin) {
        superOrganizationService.getOrganizations({ limit: 100 }).then((res) => {
          const list = Array.isArray(res) ? res : (res?.rows || res?.items || res?.organizations || []);
          setOrganizationsList(list);
        }).catch(() => {});
      }
    }
  }, [canView, loadIncidents, isSuperAdmin]);

  // Fetch vehicles, drivers and organizations for the report modal
  const openReportModal = async () => {
    setIsReportModalOpen(true);
    setResourcesLoading(true);
    try {
      const promises = [
        fleetVehicleService.getVehicles({ limit: 100 }),
        fleetDriverService.getDrivers({ limit: 100 }),
      ];
      if (isSuperAdmin) {
        promises.push(superOrganizationService.getOrganizations({ limit: 100 }));
      }
      const results = await Promise.allSettled(promises);
      if (results[0].status === 'fulfilled') {
        const vList = Array.isArray(results[0].value)
          ? results[0].value
          : (results[0].value?.rows || results[0].value?.items || results[0].value?.vehicles || []);
        setVehiclesList(vList);
      }
      if (results[1].status === 'fulfilled') {
        const dList = Array.isArray(results[1].value)
          ? results[1].value
          : (results[1].value?.rows || results[1].value?.items || results[1].value?.drivers || []);
        setDriversList(dList);
      }
      if (results[2] && results[2].status === 'fulfilled') {
        const oList = Array.isArray(results[2].value)
          ? results[2].value
          : (results[2].value?.rows || results[2].value?.items || results[2].value?.organizations || []);
        setOrganizationsList(oList);
      }
    } catch (_) {
      // Non-critical, fall back to empty lists
    } finally {
      setResourcesLoading(false);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setReportForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        toast.success(`GPS Pin: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      },
      (err) => {
        toast.error('Could not obtain GPS location: ' + err.message);
      }
    );
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const res = await uploadFile(file, 'incident_photo');
      const url = res?.url || res?.path || res?.fileUrl || res?.filePath;
      if (url) {
        setReportForm((prev) => ({
          ...prev,
          photos: [...prev.photos, url],
        }));
        toast.success('Evidence photo uploaded successfully');
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportForm.description?.trim()) {
      toast.error('Please provide an incident description.');
      return;
    }

    setSubmittingReport(true);
    try {
      let orgId = reportForm.organization_id;
      if (!orgId) {
        if (reportForm.vehicle_id) {
          const v = vehiclesList.find((x) => String(x.id) === String(reportForm.vehicle_id));
          if (v && v.organization_id) orgId = v.organization_id;
        }
        if (!orgId && reportForm.driver_id) {
          const d = driversList.find((x) => String(x.id) === String(reportForm.driver_id));
          if (d && d.organization_id) orgId = d.organization_id;
        }
        if (!orgId && user?.organization_id) {
          orgId = user.organization_id;
        }
      }

      const payload = {
        ...reportForm,
        organization_id: orgId || undefined,
        organizationId: orgId || undefined,
        vehicle_id: reportForm.vehicle_id ? Number(reportForm.vehicle_id) : null,
        driver_id: reportForm.driver_id ? Number(reportForm.driver_id) : null,
        dead_casualty: Number(reportForm.dead_casualty) || 0,
        injured_count: Number(reportForm.injured_count) || 0,
        latitude: reportForm.latitude ? Number(reportForm.latitude) : null,
        longitude: reportForm.longitude ? Number(reportForm.longitude) : null,
      };

      await toast.promise(createIncident(payload), {
        loading: 'Broadcasting emergency incident report...',
        success: 'Incident reported successfully! All control rooms & teams notified.',
        error: (err) => err?.message || 'Failed to report incident.',
      });

      setIsReportModalOpen(false);
      setReportForm(initialReportForm);
      await loadIncidents();
    } catch (_) {
      /* toast handles error */
    } finally {
      setSubmittingReport(false);
    }
  };

  const openDetailView = async (inc, focusResolution = false) => {
    setSelectedIncident(inc);
    setResolutionForm({
      status: inc.status || 'contacted',
      contactedDriver: Boolean(inc.contacted_driver),
      contactNotes: inc.contact_notes || '',
      recovered: Boolean(inc.recovered_at),
      resolutionNotes: inc.resolution_notes || '',
    });
    setActiveView('detail');

    // Fetch full fresh details with activityLogs
    setDetailLoading(true);
    try {
      const fullInc = await fetchIncidentById(inc.id);
      if (fullInc) {
        setSelectedIncident(fullInc);
        setResolutionForm({
          status: fullInc.status || 'contacted',
          contactedDriver: Boolean(fullInc.contacted_driver),
          contactNotes: fullInc.contact_notes || '',
          recovered: Boolean(fullInc.recovered_at),
          resolutionNotes: fullInc.resolution_notes || '',
        });
      }
    } catch (err) {
      console.error('Failed to load incident detail with activity logs:', err);
    } finally {
      setDetailLoading(false);
    }

    if (focusResolution) {
      setTimeout(() => {
        const el = document.getElementById('resolution-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  };

  const handleSaveResolution = async (e) => {
    if (e) e.preventDefault();
    if (!selectedIncident || updating) return;

    setUpdating(true);
    try {
      // Enforce Super Admin exclusivity in payload:
      // If not Super Admin, we do NOT change status or recovered_at
      const payload = isSuperAdmin
        ? {
            status: resolutionForm.status,
            contactedDriver: resolutionForm.contactedDriver,
            contactNotes: resolutionForm.contactNotes,
            recovered: resolutionForm.recovered,
            resolutionNotes: resolutionForm.resolutionNotes,
          }
        : {
            contactedDriver: resolutionForm.contactedDriver,
            contactNotes: resolutionForm.contactNotes,
            resolutionNotes: resolutionForm.resolutionNotes,
          };

      await toast.promise(
        updateResolution(selectedIncident.id, payload),
        {
          loading: isSuperAdmin
            ? 'Super Admin applying status clearance & resolution...'
            : 'Saving driver voice contact & field notes...',
          success: isSuperAdmin
            ? 'Incident status & resolution cleared by Super Admin!'
            : 'Driver contact call & notes recorded successfully!',
          error: (err) => err?.message || 'Failed to update resolution',
        }
      );

      // Refresh list & current incident details (with updated activity logs)
      await loadIncidents();
      const fresh = await fetchIncidentById(selectedIncident.id);
      if (fresh) {
        setSelectedIncident(fresh);
        setResolutionForm({
          status: fresh.status || 'contacted',
          contactedDriver: Boolean(fresh.contacted_driver),
          contactNotes: fresh.contact_notes || '',
          recovered: Boolean(fresh.recovered_at),
          resolutionNotes: fresh.resolution_notes || '',
        });
      }
    } catch {
      /* toast handles error UI */
    } finally {
      setUpdating(false);
    }
  };

  // Helper to parse media arrays safely
  const getMediaArray = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        if (val.trim().length > 0) return val.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }
    return [];
  };

  // Filter Logic
  const filteredIncidents = useMemo(() => {
    const list = Array.isArray(incidents) ? incidents : [];
    return list.filter((inc) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        String(inc.id).toLowerCase().includes(q) ||
        String(inc.incident_type || inc.incidentType || inc.type || '').toLowerCase().includes(q) ||
        String(inc.description || '').toLowerCase().includes(q) ||
        String(inc.location || '').toLowerCase().includes(q) ||
        String(inc.landmark || '').toLowerCase().includes(q) ||
        String(inc.driver?.name || inc.driver?.user?.name || '').toLowerCase().includes(q) ||
        String(inc.vehicle?.code || inc.vehicle?.bus_number || '').toLowerCase().includes(q) ||
        String(inc.hospital_name || '').toLowerCase().includes(q) ||
        String(inc.police_station_name || '').toLowerCase().includes(q);

      const sev = (inc.severity || 'low').toLowerCase();
      const matchesSeverity = severityFilter === 'ALL' || sev === severityFilter.toLowerCase();

      const type = (inc.incident_type || inc.incidentType || inc.type || '').toLowerCase();
      const matchesType = typeFilter === 'ALL' || type.includes(typeFilter.toLowerCase());

      const st = (inc.status || 'open').toLowerCase();
      const matchesStatus = statusFilter === 'ALL' || st === statusFilter.toLowerCase();

      const matchesOrg =
        !isSuperAdmin ||
        orgFilter === 'ALL' ||
        String(inc.organization_id) === String(orgFilter);

      return matchesSearch && matchesSeverity && matchesType && matchesStatus && matchesOrg;
    });
  }, [incidents, searchQuery, severityFilter, typeFilter, statusFilter, orgFilter, isSuperAdmin]);

  // Pagination Logic
  const totalItems = filteredIncidents.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedIncidents = filteredIncidents.slice(startIndex, startIndex + pageSize);

  const resetFilters = () => {
    setSearchQuery('');
    setSeverityFilter('ALL');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setOrgFilter('ALL');
    setCurrentPage(1);
  };

  // Stats
  const listSafe = Array.isArray(incidents) ? incidents : [];
  const criticalCount = listSafe.filter((i) => (i.severity || '').toLowerCase() === 'critical').length;
  const contactedCount = listSafe.filter((i) => i.contacted_driver).length;
  const openCount = listSafe.filter((i) => !['resolved', 'closed'].includes((i.status || '').toLowerCase())).length;

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
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
      case 'in_progress':
      case 'investigating':
      case 'recovering':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
    }
  };

  const getActivityIcon = (event) => {
    switch (event) {
      case 'INCIDENT_REPORTED':
        return { icon: <FleetIcons.Alert className="w-3.5 h-3.5 text-red-600" />, bg: 'bg-red-50 dark:bg-red-950/60 text-red-600 border-red-200 dark:border-red-800' };
      case 'DRIVER_CONTACTED':
        return { icon: <FleetIcons.Phone className="w-3.5 h-3.5 text-blue-600" />, bg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 border-blue-200 dark:border-blue-800' };
      case 'STATUS_UPDATED':
        return { icon: <FleetIcons.Refresh className="w-3.5 h-3.5 text-amber-600" />, bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 border-amber-200 dark:border-amber-800' };
      case 'SITE_RECOVERED':
        return { icon: <FleetIcons.Wrench className="w-3.5 h-3.5 text-indigo-600" />, bg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 border-indigo-200 dark:border-indigo-800' };
      case 'INCIDENT_RESOLVED':
        return { icon: <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600" />, bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border-emerald-200 dark:border-emerald-800' };
      default:
        return { icon: <FleetIcons.Document className="w-3.5 h-3.5 text-slate-600" />, bg: 'bg-slate-50 dark:bg-zinc-800 text-slate-600 border-slate-200 dark:border-zinc-700' };
    }
  };

  if (!canView) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-red-600 mx-auto mb-4">
          <FleetIcons.Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('incident.access_revoked', 'Access Revoked')}</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 font-medium">
          {t('incident.access_revoked_desc', 'Your administrator has revoked your permission to view emergency incidents.')}
        </p>
      </div>
    );
  }

  // RENDER DETAIL VIEW SECTION
  if (activeView === 'detail' && selectedIncident) {
    const photosArr = getMediaArray(selectedIncident.photos);
    const videosArr = getMediaArray(selectedIncident.videos);
    const driverName =
      selectedIncident.driver?.name || selectedIncident.driver?.user?.name || `Driver #${selectedIncident.driver_id || '—'}`;
    const vehicleCode =
      selectedIncident.vehicle?.code || selectedIncident.vehicle?.bus_number || `Vehicle #${selectedIncident.vehicle_id || '—'}`;
    const activityLogs = selectedIncident.activityLogs || [];

    return (
      <div className="w-full space-y-6 animate-in fade-in duration-200 pb-20">
        {/* Standard Reusable Breadcrumb */}
        <Breadcrumb
          items={[
            {
              label: roleScope === 'superadmin' ? 'SuperAdmin' : roleScope === 'fleet' ? 'Fleet Operator' : 'Admin',
              to: roleScope === 'superadmin' ? '/superadmin/dashboard' : roleScope === 'fleet' ? '/fleet-operator/dashboard' : '/admin/dashboard',
            },
            {
              label: t('incident.cmd_center_title', 'Emergency Incidents'),
              onClick: () => setActiveView('list'),
            },
            {
              label: `Incident #${selectedIncident.id}`,
            },
          ]}
        />
        <div className="w-full p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 font-medium">
              <button
                type="button"
                onClick={() => setActiveView('list')}
                className="hover:text-blue-600 transition-colors"
              >
                {t('incident.console', 'Console')}
              </button>
              <span>/</span>
              <button
                type="button"
                onClick={() => setActiveView('list')}
                className="hover:text-blue-600 transition-colors"
              >
                {roleTitle}
              </button>
              <span>/</span>
              <button
                type="button"
                onClick={() => setActiveView('list')}
                className="hover:text-blue-600 transition-colors"
              >
                {t('incident.incidents_command', 'Incidents Command')}
              </button>
              <span>/</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                Incident #{selectedIncident.id}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setActiveView('list')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <span>←</span>
              <span>{t('incident.back_to_list', 'Back to Incidents List')}</span>
            </button>
          </div>

          <div className="border-t border-slate-100 dark:border-zinc-800 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">
                  #{selectedIncident.id}
                </span>
                <span className="text-slate-300 dark:text-zinc-700">•</span>
                <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  Reported: {selectedIncident.reported_at ? new Date(selectedIncident.reported_at).toLocaleString('en-GB') : (selectedIncident.createdAt || '—')}
                </span>
                {detailLoading && (
                  <span className="text-xs text-blue-500 animate-pulse font-medium">
                    {t('incident.syncing_logs', '(Syncing logs...)')}
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                {selectedIncident.incident_type || selectedIncident.incidentType || selectedIncident.type || 'Incident Details'}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getSeverityBadge(selectedIncident.severity)}`}>
                ● {selectedIncident.severity || 'low'} Severity
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusBadge(selectedIncident.status)}`}>
                {String(selectedIncident.status || 'open').replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Stakeholder & Ownership Audit Banner */}
        <div className={`p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 grid grid-cols-1 ${isSuperAdmin ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-3 text-xs`}>
          {isSuperAdmin && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{t('incident.tenant_org', 'Tenant Organization')}</span>
              <span className="inline-flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300 mt-0.5">
                <FleetIcons.Organization className="w-3.5 h-3.5" /> {selectedIncident.organization?.name || `Org #${selectedIncident.organization_id || '—'}`}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                {selectedIncident.organization?.code || 'Central Tenant Org'}
              </span>
            </div>
          )}

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{t('incident.created_reported_by', 'Created / Reported By')}</span>
            <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
              {selectedIncident.creator?.name || selectedIncident.driver?.name || 'Driver on Scene'}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
              {selectedIncident.creator?.email || 'Reported via Mobile App'}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{t('incident.last_field_update_by', 'Last Field Update By')}</span>
            <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
              {selectedIncident.updater?.name || '—'}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
              {selectedIncident.updater?.email || 'No updates logged yet'}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{t('incident.super_admin_officer', 'Super Admin Resolution Officer')}</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              {selectedIncident.resolver?.name || (['resolved', 'closed'].includes(selectedIncident.status) ? 'Root Super Admin' : 'Pending Super Admin Clearance')}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
              {selectedIncident.resolver?.email || 'Authorized Clearance Gate'}
            </span>
          </div>
        </div>

        {/* Incident Summary Banner */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-5 shadow-xl border border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs border-b border-slate-800 pb-4">
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase block">{t('incident.assigned_driver', 'Assigned Driver')}</span>
              <span className="font-bold text-slate-100 text-sm">{driverName}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase block">{t('incident.vehicle_unit', 'Vehicle Unit')}</span>
              <span className="font-bold text-slate-100 text-sm">{vehicleCode}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase block">{t('incident.driver_contact_status', 'Driver Contact Status')}</span>
              <span className={`font-bold flex items-center gap-1.5 mt-0.5 ${selectedIncident.contacted_driver ? 'text-blue-400' : 'text-amber-400'}`}>
                {selectedIncident.contacted_driver ? (
                  <>
                    <FleetIcons.Phone className="w-3.5 h-3.5" />
                    <span>Contacted & Acknowledged</span>
                  </>
                ) : (
                  <>
                    <FleetIcons.Clock className="w-3.5 h-3.5" />
                    <span>Pending Driver Contact</span>
                  </>
                )}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase block">{t('incident.site_recovery', 'Site Recovery')}</span>
              <span className={`font-bold flex items-center gap-1.5 mt-0.5 ${selectedIncident.recovered_at ? 'text-emerald-400' : 'text-slate-400'}`}>
                {selectedIncident.recovered_at ? (
                  <>
                    <FleetIcons.Check className="w-3.5 h-3.5" />
                    <span>Recovered ({new Date(selectedIncident.recovered_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })})</span>
                  </>
                ) : (
                  <>
                    <FleetIcons.Clock className="w-3.5 h-3.5" />
                    <span>Pending Recovery</span>
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase block">{t('incident.incident_location', 'Incident Location')}</span>
              <span className="font-bold text-slate-100 flex items-center gap-1 mt-0.5">
                <FleetIcons.Pin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{selectedIncident.location || 'Location Not Specified'}</span>
              </span>
              {selectedIncident.landmark && <p className="text-slate-300 text-[11px] mt-0.5 ml-4.5">Landmark: {selectedIncident.landmark}</p>}
            </div>
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase block">{t('incident.gps_pin', 'GPS Coordinates Pin')}</span>
              {selectedIncident.latitude && selectedIncident.longitude ? (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedIncident.latitude},${selectedIncident.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-emerald-400 font-bold hover:underline flex items-center gap-1.5 mt-0.5"
                >
                  <FleetIcons.Pin className="w-3.5 h-3.5 shrink-0" />
                  <span>Lat: {selectedIncident.latitude}, Lng: {selectedIncident.longitude}</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">{t('incident.view_map', 'View Map ↗')}</span>
                </a>
              ) : (
                <span className="text-slate-400">{t('incident.gps_not_recorded', 'GPS Coordinates Not Recorded')}</span>
              )}
            </div>
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase block">{t('incident.road_weather', 'Road & Weather')}</span>
              <span className="font-bold text-slate-100">
                {selectedIncident.weather_conditions || 'Clear'} · {selectedIncident.road_type || 'City Street'}
              </span>
            </div>
          </div>
        </div>

        {/* Emergency Medical & Police Audit Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Medical Box */}
          <div className="p-6 rounded-3xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-900 dark:text-red-300 flex items-center gap-2">
              <FleetIcons.Emergency className="w-4 h-4 text-red-600" />
              <span>{t('incident.medical_audit_title', 'Emergency Medical & Hospitalization Audit')}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-white dark:bg-zinc-800 rounded-2xl border border-red-100 dark:border-zinc-700">
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-bold uppercase">{t('incident.fatalities', 'Fatalities')}</span>
                <span className="text-xl font-black text-red-600">{selectedIncident.dead_casualty || 0}</span>
              </div>
              <div className="p-3.5 bg-white dark:bg-zinc-800 rounded-2xl border border-red-100 dark:border-zinc-700">
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-bold uppercase">{t('incident.injured_count', 'Injured Count')}</span>
                <span className="text-xl font-black text-amber-600">{selectedIncident.injured_count || 0}</span>
              </div>
              <div className="p-3.5 bg-white dark:bg-zinc-800 rounded-2xl border border-red-100 dark:border-zinc-700 col-span-2">
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-bold uppercase">{t('incident.hospital_ambulance', 'Hospital & Ambulance')}</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {t('incident.hospital_label', 'Hospital:')} <strong>{selectedIncident.hospital_name || 'None'}</strong>
                </p>
                <p className="text-[11px] text-slate-600 dark:text-zinc-300 mt-0.5">
                  Ambulance: {selectedIncident.ambulance_assigned ? `Assigned (${selectedIncident.ambulance_timing || 'Dispatched'})` : 'Not Assigned'}
                </p>
              </div>
            </div>
          </div>

          {/* Police & Towing Box */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-2">
              <FleetIcons.Shield className="w-4 h-4 text-blue-600" />
              <span>{t('incident.police_towing_title', 'Police & Towing Assistance')}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 col-span-2">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">{t('incident.police_fir', 'Police Jurisdiction & FIR')}</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedIncident.police_notified ? `Police Station: ${selectedIncident.police_station_name || 'FIR Registered'}` : 'No Police Dispatch Recorded'}
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">{t('incident.roadside_towing', 'Roadside Towing')}</span>
                <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                  {selectedIncident.towing_requested ? (
                    <>
                      <FleetIcons.Wrench className="w-3.5 h-3.5 text-amber-500" />
                      <span>Requested Towing</span>
                    </>
                  ) : (
                    <span>No Tow Requested</span>
                  )}
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">{t('incident.traffic_disruption', 'Traffic Disruption')}</span>
                <p className="font-bold text-slate-900 dark:text-white uppercase mt-0.5">
                  {String(selectedIncident.traffic_disruption_level || 'none').replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('incident.statement_desc', 'Incident Driver Statement & Description')}</h3>
          <p className="text-sm font-medium text-slate-800 dark:text-zinc-200 leading-relaxed">
            {selectedIncident.description || 'No detailed description provided.'}
          </p>
          {selectedIncident.immediate_action && (
            <div className="border-t border-slate-100 dark:border-zinc-800 pt-3 mt-3">
              <span className="text-[11px] font-bold uppercase text-slate-400 block">{t('incident.action_taken', 'Immediate Action Taken on Scene')}</span>
              <p className="text-xs font-medium text-slate-700 dark:text-zinc-300 mt-0.5">{selectedIncident.immediate_action}</p>
            </div>
          )}
        </div>

        {/* PHOTO & VIDEO EVIDENCE GALLERIES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Photo Gallery */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FleetIcons.Camera className="w-4 h-4 text-blue-500" />
                <span>Photo Evidence ({photosArr.length})</span>
              </h3>
              <span className="text-[11px] text-slate-400">{t('incident.click_photo_view', 'Click photo to view full size')}</span>
            </div>

            {photosArr.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-zinc-800/40 rounded-2xl text-xs text-slate-400">
                {t('incident.no_photos', 'No photos attached to this incident report.')}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {photosArr.map((photo, idx) => {
                  const resolvedUrl = resolveFileUrl(photo);
                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveMedia({ type: 'image', url: resolvedUrl })}
                      className="rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-700 h-36 bg-slate-900 cursor-pointer group relative shadow-xs"
                    >
                      <img
                        src={resolvedUrl}
                        alt={`Photo Evidence ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/90 text-slate-900 text-xs font-bold rounded-lg shadow-sm">
                          <FleetIcons.Search className="w-3 h-3" />
                          <span>{t('incident.view_photo', 'View Photo')}</span>
                        </span>
                      </div>
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 text-white text-[10px] font-bold rounded">
                        Photo #{idx + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Video Gallery */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FleetIcons.Video className="w-4 h-4 text-purple-500" />
                <span>Video Recordings ({videosArr.length})</span>
              </h3>
              <span className="text-[11px] text-slate-400">{t('incident.click_video_play', 'Click video to play fullscreen')}</span>
            </div>

            {videosArr.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-zinc-800/40 rounded-2xl text-xs text-slate-400">
                {t('incident.no_videos', 'No video recordings attached to this incident report.')}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {videosArr.map((vid, idx) => {
                  const resolvedUrl = resolveFileUrl(vid);
                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveMedia({ type: 'video', url: resolvedUrl })}
                      className="rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-700 h-44 bg-slate-950 cursor-pointer group relative shadow-xs"
                    >
                      <video src={resolvedUrl} className="w-full h-full object-cover pointer-events-none" />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/90 text-slate-900 flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                          ▶
                        </div>
                      </div>
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 text-white text-[10px] font-bold rounded">
                        Video #{idx + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* STEP-BY-STEP ACTIVITY LOGS & AUDIT TRAIL TIMELINE SECTION */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">
                {t('incident.audit_trail_title', 'Audit Trail & Event Log')}
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Step-by-Step Incident Activity & Action Logs ({activityLogs.length})
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {t('incident.audit_permanent_desc', 'Permanent chronological database audit trail')}
            </span>
          </div>

          {activityLogs.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-zinc-800/40 rounded-2xl text-xs text-slate-500">
              {t('incident.no_activity_yet', 'No previous activity recorded yet. New actions and driver contact will appear here.')}
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-zinc-800">
              {activityLogs.map((log, idx) => {
                const badgeInfo = getActivityIcon(log.properties?.action || log.event);
                const roleDisplay = log.actor_role || log.causer_role || 'System';
                const nameDisplay = log.actor_name || log.causer_name || 'System Operator';

                return (
                  <div key={log.id || idx} className="relative group">
                    {/* Circle Node on Timeline */}
                    <div
                      className={`absolute -left-6 top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${badgeInfo.bg} shadow-xs`}
                    >
                      {badgeInfo.icon}
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 space-y-2 text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-slate-900 dark:text-white">
                            {log.description || log.properties?.action || 'Action Executed'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                            {roleDisplay}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {log.createdAt ? new Date(log.createdAt).toLocaleString('en-GB') : '—'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
                        <span>{t('incident.action_performed_by', 'Action Performed By:')}</span>
                        <strong className="text-slate-800 dark:text-zinc-200">{nameDisplay}</strong>
                        {log.actor_email && <span className="text-slate-400">({log.actor_email})</span>}
                      </div>

                      {/* Status Transition Diff */}
                      {log.properties?.old_status && log.properties?.new_status && (
                        <div className="flex items-center gap-2 p-2 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 text-[11px]">
                          <span className="font-bold text-slate-400 uppercase text-[10px]">{t('incident.status_transition', 'Status Transition:')}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 font-mono line-through text-slate-500">
                            {log.properties.old_status}
                          </span>
                          <FleetIcons.ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono font-bold">
                            {log.properties.new_status}
                          </span>
                        </div>
                      )}

                      {/* Notes / Remarks block */}
                      {(log.properties?.notes || log.properties?.contact_notes || log.properties?.resolution_notes) && (
                        <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[11px] text-slate-700 dark:text-zinc-300 italic">
                          "{log.properties.notes || log.properties.contact_notes || log.properties.resolution_notes}"
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CONTROL ROOM RESOLUTION FORM SECTION (WITH SUPER ADMIN EXCLUSIVITY LOCKING) */}
        <div id="resolution-section" className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-blue-500/30 dark:border-blue-500/40 shadow-lg space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-blue-600 uppercase">{t('incident.dispatch_action_badge', 'Control Room Dispatch Action')}</span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>{t('incident.dispatch_report_title', 'Control Room Dispatch & Incident Resolution Report')}</span>
                {isSuperAdmin ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <FleetIcons.Shield className="w-3 h-3" />
                    <span>{t('incident.super_admin_authority', 'Super Admin Authority')}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    <FleetIcons.Lock className="w-3 h-3" />
                    <span>{t('incident.status_restricted', 'Status Clearance Restricted')}</span>
                  </span>
                )}
              </h2>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-lg self-start sm:self-auto">
              {roleTitle} {t('incident.action_portal', 'Action Portal')}
            </span>
          </div>

          {/* Super Admin Exclusivity Banner for non-SuperAdmin */}
          {!isSuperAdmin && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <div className="font-bold flex items-center gap-2">
                <FleetIcons.Lock className="w-4 h-4 text-amber-600" />
                <span>{t('incident.super_admin_policy', 'Super Admin Status Authority Policy Enforced')}</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Only Super Administrators possess platform authority to alter incident status or issue final resolution and recovery clearance.
                As {roleTitle}, you can record Driver Voice Contact calls and submit dispatch field notes below.
              </p>
            </div>
          )}

          <form onSubmit={handleSaveResolution} className="space-y-5 text-xs">
            {/* Status Selector */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
                <span>{t('incident.update_status_label', 'Update Incident Status')}</span>
                {!isSuperAdmin && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    <FleetIcons.Lock className="w-3 h-3" />
                    <span>{t('incident.locked_super_admin_only', 'Locked (Super Admin Authority Only)')}</span>
                  </span>
                )}
              </label>

              {isSuperAdmin ? (
                <select
                  value={resolutionForm.status}
                  onChange={(e) => setResolutionForm({ ...resolutionForm, status: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="contacted">{t('incident.opt_contacted', 'Contacted Driver & Dispatch Initiated')}</option>
                  <option value="investigating">{t('incident.opt_investigating', 'Investigating / On Site Control')}</option>
                  <option value="recovering">{t('incident.opt_recovering', 'Vehicle Recovery / Towing in Progress')}</option>
                  <option value="resolved">{t('incident.opt_resolved', 'Resolved & Route Cleared')}</option>
                  <option value="closed">{t('incident.opt_closed', 'Closed & Filed')}</option>
                </select>
              ) : (
                <div className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 flex items-center justify-between cursor-not-allowed">
                  <span>{t('incident.current_status', 'Current Status:')} {String(selectedIncident.status || 'open').toUpperCase()}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] bg-slate-200 dark:bg-zinc-700 px-2 py-0.5 rounded text-slate-600 dark:text-zinc-300">
                    <FleetIcons.Lock className="w-3 h-3" />
                    <span>{t('incident.super_admin_only', 'Super Admin Only')}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Driver Contact Call Checkbox & Notes (Available to all roles) */}
            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer font-bold text-blue-900 dark:text-blue-300">
                <input
                  type="checkbox"
                  checked={resolutionForm.contactedDriver}
                  onChange={(e) => setResolutionForm({ ...resolutionForm, contactedDriver: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                />
                <span>{t('incident.mark_driver_contacted', 'Mark Driver as Contacted (Voice Call Completed)')}</span>
              </label>

              {resolutionForm.contactedDriver && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                    {t('incident.driver_voice_notes', 'Driver Voice Contact Notes & Assessment')}
                  </label>
                  <input
                    type="text"
                    value={resolutionForm.contactNotes}
                    onChange={(e) => setResolutionForm({ ...resolutionForm, contactNotes: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder={t('incident.driver_notes_ph', 'e.g. Spoke with driver Ramesh at 18:15. Driver confirmed safe, roadside assistance dispatched.')}
                  />
                </div>
              )}
            </div>

            {/* Vehicle & Site Recovery Checkbox */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700">
              <label className={`flex items-center gap-2.5 font-bold ${isSuperAdmin ? 'cursor-pointer text-slate-800 dark:text-zinc-200' : 'cursor-not-allowed text-slate-400'}`}>
                <input
                  type="checkbox"
                  disabled={!isSuperAdmin}
                  checked={resolutionForm.recovered}
                  onChange={(e) => setResolutionForm({ ...resolutionForm, recovered: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600"
                />
                <span>{t('incident.vehicle_recovered_label', 'Vehicle & Site Recovered / Route Cleared (Timestamp Logged)')}</span>
                {!isSuperAdmin && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                    <FleetIcons.Lock className="w-3 h-3" />
                    <span>{t('incident.super_admin_only', 'Super Admin Only')}</span>
                  </span>
                )}
              </label>
            </div>

            {/* Final Resolution Report Textarea */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
                <span>{isSuperAdmin ? 'Final Super Admin Resolution Report *' : 'Field Remarks & Dispatch Notes'}</span>
                {!isSuperAdmin && <span className="text-[10px] text-slate-400">{t('incident.optional_field_update', 'Optional field update')}</span>}
              </label>
              <textarea
                rows={4}
                required={isSuperAdmin}
                value={resolutionForm.resolutionNotes}
                onChange={(e) => setResolutionForm({ ...resolutionForm, resolutionNotes: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder={
                  isSuperAdmin
                    ? 'Enter final resolution details, towing status, medical outcomes, and dispatch clearance summary...'
                    : 'Add field observations, police interaction details, or notes for the Super Admin...'
                }
              />
            </div>

            {/* Form Footer Controls */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveView('list')}
                className="px-5 py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl"
              >
                {t('incident.cancel_back', 'Cancel / Back')}
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <FleetIcons.Save className="w-3.5 h-3.5" />
                <span>
                  {updating
                    ? 'Saving...'
                    : isSuperAdmin
                    ? 'Save Super Admin Resolution & Notify'
                    : 'Save Driver Voice Contact & Notes'}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* MEDIA LIGHTBOX MODAL */}
        {activeMedia && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setActiveMedia(null)}
          >
            <div
              className="relative max-w-5xl max-h-[90vh] w-full overflow-hidden rounded-3xl bg-slate-950 p-3 border border-zinc-800 shadow-2xl flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full flex items-center justify-between px-3 py-2 border-b border-zinc-800 mb-2">
                <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  {activeMedia.type === 'image' ? (
                    <>
                      <FleetIcons.Camera className="w-4 h-4 text-blue-400" />
                      <span>High-Res Evidence Photo</span>
                    </>
                  ) : (
                    <>
                      <FleetIcons.Video className="w-4 h-4 text-purple-400" />
                      <span>Evidence Video Recording</span>
                    </>
                  )}
                </span>
                <div className="flex items-center gap-3">
                  <a
                    href={activeMedia.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-400 hover:underline font-bold"
                  >
                    {t('incident.open_orig_link', 'Open Original Link ↗')}
                  </a>
                  <button
                    type="button"
                    onClick={() => setActiveMedia(null)}
                    className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full font-bold text-xs"
                  >
                    <FleetIcons.Close className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="w-full flex-1 flex items-center justify-center max-h-[80vh] overflow-hidden p-2">
                {activeMedia.type === 'image' ? (
                  <img
                    src={activeMedia.url}
                    alt="Enlarged evidence"
                    className="max-h-[78vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl"
                  />
                ) : (
                  <video
                    src={activeMedia.url}
                    controls
                    autoPlay
                    className="max-h-[78vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // RENDER MAIN LIST VIEW SECTION
  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-20">
      {/* Standard Reusable Breadcrumb */}
      <Breadcrumb
        items={[
          {
            label: roleScope === 'superadmin' ? 'SuperAdmin' : roleScope === 'fleet' ? 'Fleet Operator' : 'Admin',
            to: roleScope === 'superadmin' ? '/superadmin/dashboard' : roleScope === 'fleet' ? '/fleet-operator/dashboard' : '/admin/dashboard',
          },
          {
            label: t('incident.cmd_center_title', 'Emergency Incidents Command Center'),
          },
        ]}
      />

      {/* Header Bar */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {roleTitle} Control Room
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <FleetIcons.Alert className="w-6 h-6 text-red-500" />
            <span>{t('incident.cmd_center_title', 'Emergency Incidents Command Center')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
            {t('incident.cmd_center_desc', 'Real-time incident dispatch, driver contact tracking, roadside recovery, and Super Admin resolution')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <RefreshButton
            onClick={() => loadIncidents()}
            loading={loading}
          />

          {/* REPORT INCIDENT BUTTON (Links directly to dedicated full-page wizard) */}
          <Link
            to={
              roleScope === 'superadmin'
                ? '/superadmin/incident-report'
                : roleScope === 'admin'
                ? '/admin/incident-report'
                : '/fleet-operator/incident-report'
            }
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <FleetIcons.Alert className="w-4 h-4 text-white" />
            <span>{t('incident.report_incident_btn', '+ Report Incident')}</span>
          </Link>
        </div>
      </div>

      {/* Control Room Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">{t('incident.metric_total_reports', 'Total Incident Reports')}</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{listSafe.length}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-red-500">{t('incident.metric_critical', 'Critical Disruptions')}</span>
          <div className="text-2xl font-black text-red-600 dark:text-red-400">{criticalCount}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-blue-500">{t('incident.metric_driver_contacted', 'Driver Contacted')}</span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{contactedCount}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-amber-500">{t('incident.metric_active_open', 'Active / Open Requests')}</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{openCount}</div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className={`grid grid-cols-1 ${isSuperAdmin ? 'sm:grid-cols-5' : 'sm:grid-cols-4'} gap-3`}>
          {/* Search Input */}
          <div className="sm:col-span-2 relative">
            <FleetIcons.Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('incident.search_placeholder', 'Search by Driver name, vehicle, location, or hospital...')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* Organization Dropdown for Super Admin */}
          {isSuperAdmin && (
            <div>
              <select
                value={orgFilter}
                onChange={(e) => {
                  setOrgFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none font-medium"
              >
                <option value="ALL">{t('incident.all_orgs', 'All Organizations')}</option>
                {organizationsList.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Severity Dropdown */}
          <div>
            <select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="ALL">{t('incident.all_severities', 'All Severities')}</option>
              <option value="Critical">{t('incident.sev_crit_badge', 'Critical Disruption')}</option>
              <option value="High">{t('incident.sev_high_badge', 'High Disruption')}</option>
              <option value="Medium">{t('incident.sev_med_badge', 'Medium Disruption')}</option>
              <option value="Low">{t('incident.sev_low_badge', 'Low Disruption')}</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="ALL">{t('incident.all_statuses', 'All Statuses')}</option>
              <option value="open">{t('incident.status_open', 'Open')}</option>
              <option value="contacted">{t('incident.status_contacted', 'Contacted')}</option>
              <option value="investigating">{t('incident.status_investigating', 'Investigating')}</option>
              <option value="recovering">{t('incident.status_recovering', 'Recovering')}</option>
              <option value="resolved">{t('incident.status_resolved', 'Resolved')}</option>
              <option value="closed">{t('incident.status_closed', 'Closed')}</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Category Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-zinc-800 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('incident.quick_category', 'Quick Category:')}</span>
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
              {t('incident.reset_filters', 'Reset All Filters')}
            </button>
          )}
        </div>
      </div>

      {/* Incidents Command Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
            <div className="w-7 h-7 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span>{t('incident.loading', 'Loading emergency incidents...')}</span>
          </div>
        ) : paginatedIncidents.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-3">
            <FleetIcons.Alert className="w-12 h-12 text-red-500 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-zinc-200">{t('incident.not_found_title', 'No Incidents Found')}</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {t('incident.not_found_desc', 'No emergency incidents match your search or filter criteria.')}
            </p>
          </div>
        ) : (
          paginatedIncidents.map((inc) => {
            const photosArr = getMediaArray(inc.photos);
            const videosArr = getMediaArray(inc.videos);
            const incType = inc.incident_type || inc.incidentType || inc.type || 'Incident';
            const driverName = inc.driver?.name || inc.driver?.user?.name || `Driver #${inc.driver_id || '—'}`;
            const vehicleCode = inc.vehicle?.code || inc.vehicle?.bus_number || `Vehicle #${inc.vehicle_id || '—'}`;

            return (
              <div
                key={inc.id}
                onClick={() => openDetailView(inc, false)}
                className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 shadow-sm space-y-4 cursor-pointer group transition-all"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 font-mono text-xs font-bold text-slate-700 dark:text-zinc-300">
                      #INC-{inc.id}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {incType}
                        </h3>
                        {isSuperAdmin && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold">
                            <FleetIcons.Organization className="w-3 h-3" />
                            <span>{inc.organization?.name || `Org #${inc.organization_id || '—'}`}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                        Driver: <strong>{driverName}</strong> | Vehicle: <strong>{vehicleCode}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getSeverityBadge(inc.severity)}`}>
                      ● {inc.severity || 'low'}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      inc.contacted_driver ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {inc.contacted_driver ? (
                        <>
                          <FleetIcons.Phone className="w-3 h-3" />
                          <span>Contacted</span>
                        </>
                      ) : (
                        <>
                          <FleetIcons.Clock className="w-3 h-3" />
                          <span>Pending Call</span>
                        </>
                      )}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusBadge(inc.status)}`}>
                      {String(inc.status || 'open').replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="sm:col-span-2 space-y-1">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">{t('incident.incident_location', 'Description & Location')}</span>
                    <p className="text-slate-800 dark:text-zinc-200 font-medium line-clamp-2">{inc.description || 'No detailed description.'}</p>
                    <div className="text-slate-500 font-medium pt-1 flex items-center gap-1">
                      <FleetIcons.Pin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span><strong>{inc.location || 'Location Not Specified'}</strong> {inc.landmark && `(${inc.landmark})`}</span>
                    </div>
                    {inc.latitude && inc.longitude && (
                      <div className="text-emerald-600 font-mono font-bold text-[11px] flex items-center gap-1">
                        <FleetIcons.Pin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>GPS Pin: {inc.latitude}, {inc.longitude}</span>
                      </div>
                    )}
                  </div>

                  {/* Medical Emergency Stats Pill */}
                  <div className="p-3.5 rounded-xl bg-red-50/70 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 space-y-1 text-[11px]">
                    <div className="font-bold text-red-900 dark:text-red-300 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <FleetIcons.Emergency className="w-3.5 h-3.5 text-red-600" />
                        <span>{t('incident.medical_status', 'Medical Status')}</span>
                      </span>
                      {inc.ambulance_assigned && <span className="text-[10px] font-extrabold bg-red-200 text-red-800 px-1.5 py-0.5 rounded">Ambulance</span>}
                    </div>
                    <div className="text-slate-700 dark:text-zinc-300 font-medium">
                      Fatalities: <strong className="text-red-600">{inc.dead_casualty || 0}</strong> | Injured: <strong className="text-amber-600">{inc.injured_count || 0}</strong>
                    </div>
                    {inc.hospital_name && <div className="text-slate-500 truncate">Hospital: {inc.hospital_name}</div>}
                  </div>
                </div>

                {/* Control Room Resolution Summary (if saved) */}
                {inc.resolution_notes && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs space-y-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                      <FleetIcons.Document className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('incident.final_resolution_report', 'Final Control Room Resolution Report')}</span>
                    </span>
                    <p className="text-slate-800 dark:text-zinc-200 font-medium line-clamp-2">{inc.resolution_notes}</p>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-zinc-800 pt-3 text-xs">
                  <div className="flex items-center gap-3 text-slate-500 font-medium">
                    {photosArr.length > 0 && (
                      <span className="flex items-center gap-1">
                        <FleetIcons.Camera className="w-3.5 h-3.5 text-blue-500" />
                        <span>{photosArr.length} Photos</span>
                      </span>
                    )}
                    {videosArr.length > 0 && (
                      <span className="flex items-center gap-1">
                        <FleetIcons.Video className="w-3.5 h-3.5 text-purple-500" />
                        <span>{videosArr.length} Videos</span>
                      </span>
                    )}
                    {inc.reported_at && (
                      <span className="text-[11px] text-slate-400">
                        {new Date(inc.reported_at).toLocaleString('en-GB')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetailView(inc, false);
                      }}
                      className="px-4 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-bold hover:bg-slate-100 text-xs"
                    >
                      {t('incident.view_details_arrow', 'View Details →')}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetailView(inc, true);
                      }}
                      className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      {isSuperAdmin ? (
                        <>
                          <FleetIcons.Shield className="w-3.5 h-3.5" />
                          <span>Clearance & Resolution</span>
                        </>
                      ) : (
                        <>
                          <FleetIcons.Phone className="w-3.5 h-3.5" />
                          <span>Voice Contact / Notes</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
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

      {/* REPORT INCIDENT MODAL (ADMIN, FLEET & DRIVER) */}
      {isReportModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto"
          onClick={() => setIsReportModalOpen(false)}
        >
          <div
            className="relative max-w-2xl w-full my-8 bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center text-xl">
                  <FleetIcons.Alert className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    {t('incident.report_road_incident_title', 'Report Emergency Road Incident')}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    {t('incident.report_road_incident_desc', 'File emergency report. Alerts will be broadcast immediately to Super Admin & Control Room.')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl text-lg font-bold"
              >
                <FleetIcons.Close className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
              {/* Organization selector for Super Admin */}
              {isSuperAdmin && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    {t('incident.select_tenant_req', 'Select Tenant Organization *')}
                  </label>
                  <select
                    value={reportForm.organization_id}
                    onChange={(e) => {
                      const orgId = e.target.value;
                      setReportForm((prev) => ({
                        ...prev,
                        organization_id: orgId,
                        vehicle_id: '',
                        driver_id: '',
                      }));
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">{t('incident.select_tenant_hint', 'Select Tenant Organization (or auto-detect from vehicle/driver)')}</option>
                    {organizationsList.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name} ({org.slug || `Org #${org.id}`})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Vehicle & Driver selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    {t('incident.vehicle_unit', 'Vehicle Unit')}
                  </label>
                  <select
                    value={reportForm.vehicle_id}
                    onChange={(e) => {
                      const vId = e.target.value;
                      const selV = vehiclesList.find((v) => String(v.id) === String(vId));
                      setReportForm((prev) => ({
                        ...prev,
                        vehicle_id: vId,
                        driver_id: prev.driver_id || (selV?.assigned_driver_id ? String(selV.assigned_driver_id) : ''),
                        organization_id: prev.organization_id || (selV?.organization_id ? String(selV.organization_id) : ''),
                      }));
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-medium focus:outline-none"
                  >
                    <option value="">{t('incident.select_vehicle_opt', 'Select Vehicle (Optional)')}</option>
                    {vehiclesList
                      .filter((v) => !reportForm.organization_id || String(v.organization_id) === String(reportForm.organization_id))
                      .map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.code || v.bus_number || `Vehicle #${v.id}`} ({v.model || v.type || 'Bus'})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    {t('incident.assigned_driver', 'Assigned Driver')}
                  </label>
                  <select
                    value={reportForm.driver_id}
                    onChange={(e) => {
                      const dId = e.target.value;
                      const selD = driversList.find((d) => String(d.id) === String(dId));
                      setReportForm((prev) => ({
                        ...prev,
                        driver_id: dId,
                        vehicle_id: prev.vehicle_id || (selD?.assigned_bus_id ? String(selD.assigned_bus_id) : ''),
                        organization_id: prev.organization_id || (selD?.organization_id ? String(selD.organization_id) : ''),
                      }));
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-medium focus:outline-none"
                  >
                    <option value="">{t('incident.select_driver_opt', 'Select Driver (Optional)')}</option>
                    {driversList
                      .filter((d) => !reportForm.organization_id || String(d.organization_id) === String(reportForm.organization_id))
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name || d.user?.name || `Driver #${d.id}`} ({d.phone || d.dl_number || 'Driver'})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Type and Severity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    {t('incident.incident_type_req', 'Incident Type *')}
                  </label>
                  <select
                    required
                    value={reportForm.incident_type}
                    onChange={(e) => setReportForm({ ...reportForm, incident_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Accident">{t('incident.type_accident', 'Accident / Collision')}</option>
                    <option value="Breakdown">{t('incident.type_breakdown', 'Mechanical Breakdown')}</option>
                    <option value="Medical">{t('incident.type_medical', 'Medical Emergency')}</option>
                    <option value="Security">{t('incident.type_security', 'Security / Passenger Incident')}</option>
                    <option value="Weather">{t('incident.type_weather', 'Weather / Road Obstacle')}</option>
                    <option value="Traffic">{t('incident.traffic_disruption', 'Traffic Disruption')}</option>
                    <option value="Other">{t('incident.type_other', 'Other Emergency')}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    {t('incident.severity_level_req', 'Severity Level *')}
                  </label>
                  <select
                    required
                    value={reportForm.severity}
                    onChange={(e) => setReportForm({ ...reportForm, severity: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="critical">{t('incident.sev_crit_opt', 'Critical — Immediate Threat to Life/Transit')}</option>
                    <option value="high">{t('incident.sev_high_opt', 'High — Significant Collision or Damage')}</option>
                    <option value="medium">{t('incident.sev_med_opt', 'Medium — Vehicle Disabled / Route Delayed')}</option>
                    <option value="low">{t('incident.sev_low_opt', 'Low — Minor Scrape / Delay')}</option>
                  </select>
                </div>
              </div>

              {/* Location & GPS */}
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                      {t('incident.location_address_label', 'Location / Street Address')}
                    </label>
                    <input
                      type="text"
                      value={reportForm.location}
                      onChange={(e) => setReportForm({ ...reportForm, location: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-medium focus:outline-none"
                      placeholder={t('incident.location_address_ph', 'e.g. Ring Road, Sector 18, Expressway Exit 4')}
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                      {t('incident.landmark_label', 'Prominent Landmark')}
                    </label>
                    <input
                      type="text"
                      value={reportForm.landmark}
                      onChange={(e) => setReportForm({ ...reportForm, landmark: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-medium focus:outline-none"
                      placeholder={t('incident.landmark_ph', 'e.g. Near Metro Pillar 142, Metro Hospital')}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={reportForm.latitude}
                    onChange={(e) => setReportForm({ ...reportForm, latitude: e.target.value })}
                    className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono text-xs"
                    placeholder={t('incident.lat_ph', 'Latitude (e.g. 28.5355)')}
                  />
                  <input
                    type="text"
                    value={reportForm.longitude}
                    onChange={(e) => setReportForm({ ...reportForm, longitude: e.target.value })}
                    className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono text-xs"
                    placeholder={t('incident.lng_ph', 'Longitude (e.g. 77.3910)')}
                  />
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    className="px-3 py-2 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl font-bold whitespace-nowrap hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                  >
                    <FleetIcons.Pin className="w-3.5 h-3.5" />
                    <span>{t('incident.detect_gps', 'Detect GPS')}</span>
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  {t('incident.situation_desc_req', 'Incident Description & Situation Assessment *')}
                </label>
                <textarea
                  rows={3}
                  required
                  value={reportForm.description}
                  onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-medium focus:outline-none"
                  placeholder={t('incident.situation_desc_ph', 'Describe what occurred, vehicle damage, passenger status, and immediate hazards...')}
                />
              </div>

              {/* Medical & Police Details Section */}
              <div className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-red-800 dark:text-red-300 block">
                  {t('incident.medical_police_title', 'Casualties, Medical & Police Dispatch')}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                      {t('incident.fatalities', 'Fatalities')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={reportForm.dead_casualty}
                      onChange={(e) => setReportForm({ ...reportForm, dead_casualty: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold text-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                      {t('incident.injured_count', 'Injured Count')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={reportForm.injured_count}
                      onChange={(e) => setReportForm({ ...reportForm, injured_count: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold text-amber-600"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                      {t('incident.hospital_name', 'Hospital Name')}
                    </label>
                    <input
                      type="text"
                      value={reportForm.hospital_name}
                      onChange={(e) => setReportForm({ ...reportForm, hospital_name: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-medium"
                      placeholder={t('incident.hospital_name_ph', 'e.g. City General Trauma Center')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={reportForm.ambulance_assigned}
                      onChange={(e) => setReportForm({ ...reportForm, ambulance_assigned: e.target.checked })}
                      className="w-3.5 h-3.5 rounded text-red-600"
                    />
                    <span>{t('incident.ambulance_dispatched', 'Ambulance Dispatched')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={reportForm.police_notified}
                      onChange={(e) => setReportForm({ ...reportForm, police_notified: e.target.checked })}
                      className="w-3.5 h-3.5 rounded text-blue-600"
                    />
                    <span>{t('incident.police_fir_notified', 'Police FIR Notified')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={reportForm.towing_requested}
                      onChange={(e) => setReportForm({ ...reportForm, towing_requested: e.target.checked })}
                      className="w-3.5 h-3.5 rounded text-emerald-600"
                    />
                    <span>{t('incident.towing_required', 'Towing Truck Required')}</span>
                  </label>
                </div>
              </div>

              {/* Traffic Disruption, Weather & Road Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    {t('incident.traffic_disruption_lvl', 'Traffic Disruption Level')}
                  </label>
                  <select
                    value={reportForm.traffic_disruption_level}
                    onChange={(e) => setReportForm({ ...reportForm, traffic_disruption_level: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-medium focus:outline-none"
                  >
                    <option value="none">{t('incident.traffic_normal', 'Normal Traffic (No Delay)')}</option>
                    <option value="minor_delay">{t('incident.traffic_minor', 'Minor Delay (< 10 mins)')}</option>
                    <option value="lane_blocked">{t('incident.traffic_mod', 'Moderate (Lane Blocked)')}</option>
                    <option value="total_gridlock">{t('incident.traffic_severe', 'Severe (Total Gridlock)')}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    {t('incident.weather_condition', 'Weather Condition')}
                  </label>
                  <select
                    value={reportForm.weather_conditions}
                    onChange={(e) => setReportForm({ ...reportForm, weather_conditions: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-medium focus:outline-none"
                  >
                    <option value="Clear">Clear / Normal</option>
                    <option value="Rainy / Wet">Rainy / Wet Roads</option>
                    <option value="Fog / Low Visibility">Fog / Low Visibility</option>
                    <option value="Storm / High Wind">Storm / High Wind</option>
                    <option value="Extreme Heat">Extreme Heat</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    {t('incident.road_type', 'Road Type')}
                  </label>
                  <select
                    value={reportForm.road_type}
                    onChange={(e) => setReportForm({ ...reportForm, road_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-medium focus:outline-none"
                  >
                    <option value="City Street">City Street</option>
                    <option value="Highway / Expressway">Highway / Expressway</option>
                    <option value="Transit Corridor / Bus Lane">Transit Corridor / Bus Lane</option>
                    <option value="Intersection / Junction">Intersection / Traffic Signal</option>
                    <option value="Bridge / Flyover">Bridge / Flyover</option>
                    <option value="Depot / Station Yard">Depot / Station Yard</option>
                  </select>
                </div>
              </div>

              {/* Photo Evidence Upload */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  {t('incident.upload_photos_label', 'Upload Photo Evidence')}
                </label>
                <div className="flex items-center gap-3">
                  <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl cursor-pointer font-bold transition-all flex items-center gap-1.5">
                    <FleetIcons.Camera className="w-4 h-4 text-blue-500" />
                    <span>{uploadingPhoto ? 'Uploading...' : 'Attach Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {reportForm.photos.length} {t('incident.photos_attached', 'photo(s) attached')}
                  </span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <FleetIcons.Alert className="w-4 h-4" />
                  <span>{submittingReport ? 'Broadcasting Report...' : 'Broadcast Emergency Report'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEDIA LIGHTBOX MODAL */}
      {activeMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActiveMedia(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] w-full overflow-hidden rounded-3xl bg-slate-950 p-3 border border-zinc-800 shadow-2xl flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between px-3 py-2 border-b border-zinc-800 mb-2">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                {activeMedia.type === 'image' ? (
                  <>
                    <FleetIcons.Camera className="w-4 h-4 text-blue-400" />
                    <span>High-Res Evidence Photo</span>
                  </>
                ) : (
                  <>
                    <FleetIcons.Video className="w-4 h-4 text-purple-400" />
                    <span>Evidence Video Recording</span>
                  </>
                )}
              </span>
              <div className="flex items-center gap-3">
                <a
                  href={activeMedia.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-400 hover:underline font-bold"
                >
                  {t('incident.open_orig_link', 'Open Original Link ↗')}
                </a>
                <button
                  type="button"
                  onClick={() => setActiveMedia(null)}
                  className="p-1.5 px-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full font-bold text-xs flex items-center gap-1"
                >
                  <FleetIcons.Close className="w-3 h-3" />
                  <span>{t('incident.close_btn', 'Close')}</span>
                </button>
              </div>
            </div>

            <div className="w-full flex-1 flex items-center justify-center max-h-[80vh] overflow-hidden p-2">
              {activeMedia.type === 'image' ? (
                <img
                  src={activeMedia.url}
                  alt="Enlarged evidence"
                  className="max-h-[78vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl"
                />
              ) : (
                <video
                  src={activeMedia.url}
                  controls
                  autoPlay
                  className="max-h-[78vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentManagementView;
