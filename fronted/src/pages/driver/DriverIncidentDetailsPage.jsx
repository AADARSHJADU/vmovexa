/* eslint-disable react-hooks/set-state-in-effect -- route changes intentionally reset detail loading state. */
import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { useDriverApp } from '../../hooks/driver/useDriverApp';
import { resolveFileUrl } from '../../api/services/upload.service';
import Breadcrumb from '../../components/ui/Breadcrumb';

export const DriverIncidentDetailsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { loadIncidentById, incidents } = useDriverApp();

  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMedia, setActiveMedia] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    // Try finding in existing store list first for instant render
    const existing = Array.isArray(incidents)
      ? incidents.find((i) => String(i.id) === String(id))
      : null;

    if (existing) {
      setIncident(existing);
      setLoading(false);
    }

    // Always fetch fresh details from API
    loadIncidentById(id)
      .then((data) => {
        if (mounted) {
          setIncident(data?.incident || data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted && !existing) {
          toast.error(err?.message || 'Failed to load incident details.');
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [id, loadIncidentById, incidents]);

  if (loading) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-4 border-slate-200 dark:border-zinc-700 border-t-slate-900 dark:border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-500 dark:text-zinc-400">Loading Incident Details #{id}...</p>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="w-full py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-slate-400">
          <FleetIcons.Search className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('driver.incidents.not_found')}</h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400">The requested incident #{id} does not exist or you do not have permission to view it.</p>
        <Link
          to="/driver/incidents"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white text-xs font-bold rounded-xl"
        >
          <FleetIcons.ArrowLeft className="w-4 h-4" />
          <span>{t('driver.incidents.back_to_log')}</span>
        </Link>
      </div>
    );
  }

  const photos = Array.isArray(incident.photos) ? incident.photos : [];
  const videos = Array.isArray(incident.videos) ? incident.videos : [];
  const severityLower = (incident.severity || 'low').toLowerCase();

  const getSeverityBadge = (s) => {
    switch (s) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border border-red-500/40';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border border-orange-500/40';
      case 'medium':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-20">
      {/* Header & Navigation */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Driver', path: '/driver/dashboard' },
            { label: 'Incidents', path: '/driver/incidents' },
            { label: `Incident #${incident.id}` },
          ]}
          className="mb-2"
        />
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              to="/driver/incidents"
              className="p-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors font-bold text-xs"
              title={t('driver.incidents.back_to_log')}
            >
              <FleetIcons.ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">Incident #{incident.id}</span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                  {incident.reported_at ? new Date(incident.reported_at).toLocaleString('en-GB') : 'Recorded'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {incident.incident_type || incident.incidentType || 'Incident Audit Record'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <FleetIcons.Document className="w-3.5 h-3.5" />
              <span>{t('driver.incidents.print_report')}</span>
            </button>
            <Link
              to="/driver/incident-report"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <FleetIcons.Alert className="w-3.5 h-3.5" />
              <span>{t('driver.incidents.report_new')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Banner Card */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">{t('driver.incidents.cat_sev')}</span>
            <h2 className="text-2xl font-black">{incident.incident_type || 'Road Emergency'}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${getSeverityBadge(severityLower)}`}>
              ● {incident.severity || 'low'} Severity
            </span>
            <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40">
              {String(incident.status || 'open').replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Location & GPS Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 text-[10px] font-bold uppercase block">{t('driver.incidents.loc_addr')}</span>
            <span className="font-bold text-slate-100">{incident.location || 'Location Not Recorded'}</span>
            {incident.landmark && <p className="text-slate-300 text-[11px] mt-0.5">Landmark: {incident.landmark}</p>}
          </div>

          <div>
            <span className="text-slate-400 text-[10px] font-bold uppercase block">{t('driver.incidents.gps_coords')}</span>
            {incident.latitude && incident.longitude ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${incident.latitude},${incident.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-emerald-400 font-bold hover:underline flex items-center gap-1.5 mt-0.5"
                title={t('driver.incidents.maps_title')}
              >
                <FleetIcons.Location className="w-3.5 h-3.5 shrink-0" />
                <span>Lat: {incident.latitude}, Lng: {incident.longitude}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">{t('driver.incidents.view_link')} <FleetIcons.ExternalLink className="w-3 h-3 inline-block ml-1" /></span>
              </a>
            ) : (
              <span className="text-slate-400 text-xs">{t('driver.incidents.no_coords')}</span>
            )}
          </div>

          <div>
            <span className="text-slate-400 text-[10px] font-bold uppercase block">{t('driver.incidents.env_context')}</span>
            <span className="font-bold text-slate-100">
              {incident.weather_conditions || 'Clear'} · {incident.road_type || 'City Street'}
            </span>
          </div>
        </div>
      </div>

      {/* Emergency Medical & Casualty Box */}
      <div className="p-6 rounded-3xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-red-900 dark:text-red-300 flex items-center gap-2">
          <FleetIcons.Alert className="w-4 h-4 text-red-600 dark:text-red-400" />
          <span>{t('driver.incidents.medical')}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-zinc-800 rounded-2xl border border-red-100 dark:border-zinc-700 shadow-xs">
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-bold uppercase">{t('driver.incidents.fatalities')}</span>
            <span className="text-2xl font-black text-red-600">{incident.dead_casualty || 0}</span>
          </div>

          <div className="p-4 bg-white dark:bg-zinc-800 rounded-2xl border border-red-100 dark:border-zinc-700 shadow-xs">
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-bold uppercase">{t('driver.incidents.injured_count')}</span>
            <span className="text-2xl font-black text-amber-600">{incident.injured_count || 0}</span>
          </div>

          <div className="p-4 bg-white dark:bg-zinc-800 rounded-2xl border border-red-100 dark:border-zinc-700 shadow-xs">
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-bold uppercase">{t('driver.incidents.hospital')}</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate block mt-1">
              {incident.hospital_name || 'None Specified'}
            </span>
          </div>

          <div className="p-4 bg-white dark:bg-zinc-800 rounded-2xl border border-red-100 dark:border-zinc-700 shadow-xs">
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-bold uppercase">{t('driver.incidents.ambulance')}</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white block mt-1">
              {incident.ambulance_assigned ? `Assigned (${incident.ambulance_timing || 'Dispatched'})` : 'Not Assigned'}
            </span>
          </div>
        </div>
      </div>

      {/* Police & Towing Assistance Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">{t('driver.incidents.police')}</span>
          <p className="text-xs font-bold text-slate-900 dark:text-white">
            {incident.police_notified ? `Yes (${incident.police_station_name || 'FIR Lodged'})` : 'No Police Dispatch'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">{t('driver.incidents.towing')}</span>
          <p className="text-xs font-bold text-slate-900 dark:text-white">
            {incident.towing_requested ? 'Requested Tow Truck' : 'No Towing Requested'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">{t('driver.incidents.traffic_level')}</span>
          <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">
            {String(incident.traffic_disruption_level || 'none').replace('_', ' ')}
          </p>
        </div>
      </div>

      {/* Incident Description & Action Taken */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{t('driver.incidents.inc_desc')}</h3>
          <p className="text-sm font-medium text-slate-800 dark:text-zinc-200 leading-relaxed">
            {incident.description || 'No detailed description provided.'}
          </p>
        </div>

        {incident.immediate_action && (
          <div className="border-t border-slate-100 dark:border-zinc-800 pt-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{t('driver.incidents.action_taken')}</h3>
            <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">{incident.immediate_action}</p>
          </div>
        )}
      </div>

      {/* Photos Evidence Gallery */}
      {photos.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FleetIcons.Camera className="w-4 h-4 text-slate-500" />
              <span>Photo Evidence ({photos.length})</span>
            </span>
            <span className="text-xs text-slate-400 font-normal">{t('driver.incidents.click_enlarge')}</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {photos.map((photo, idx) => (
              <div
                key={idx}
                onClick={() => setActiveMedia({ type: 'image', url: resolveFileUrl(photo) })}
                className="rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-700 h-36 bg-black cursor-pointer group relative"
              >
                <img src={resolveFileUrl(photo)} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 text-white text-[10px] font-bold rounded">
                  Photo #{idx + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Videos Evidence Gallery */}
      {videos.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FleetIcons.Layers className="w-4 h-4 text-slate-500" />
            <span>Video Recordings ({videos.length})</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {videos.map((vid, idx) => (
              <div key={idx} className="rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-700 h-60 bg-black">
                <video src={resolveFileUrl(vid)} controls className="w-full h-full object-contain" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Control Room Dispatch & Super Admin Resolution Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Control Room & Super Admin Clearance
            </span>
            <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
              Incident Resolution & Dispatch Audit
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 self-start sm:self-auto">
            Status: {String(incident.status || 'open').replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">{t('driver.incidents.voice_contact')}</span>
            <p className={`font-bold ${incident.contacted_driver ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600'}`}>
              {incident.contacted_driver ? 'Contacted & Verified' : 'Awaiting Contact Call'}
            </p>
            {incident.contact_notes && (
              <p className="text-[11px] text-slate-600 dark:text-zinc-300 italic pt-1 border-t border-slate-200 dark:border-zinc-700">
                "{incident.contact_notes}"
              </p>
            )}
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">{t('driver.incidents.recovery_status')}</span>
            <p className={`font-bold ${incident.recovered_at ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
              {incident.recovered_at ? `Site Recovered (${new Date(incident.recovered_at).toLocaleTimeString('en-GB')})` : 'Pending Site Recovery'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">{t('driver.incidents.clearance_officer')}</span>
            <p className="font-bold text-slate-900 dark:text-white">
              {incident.resolver?.name || (['resolved', 'closed'].includes(incident.status) ? 'Platform Super Admin' : 'Super Admin Clearance Pending')}
            </p>
            {incident.resolver?.email && (
              <p className="text-[11px] text-slate-400">{incident.resolver.email}</p>
            )}
          </div>
        </div>

        {incident.resolution_notes && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-xs space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
              Super Admin Final Resolution Report
            </span>
            <p className="text-slate-800 dark:text-zinc-200 leading-relaxed font-medium">
              {incident.resolution_notes}
            </p>
          </div>
        )}
      </div>

      {/* Step-by-Step Activity & Audit Trail Timeline */}
      {Array.isArray(incident.activityLogs) && incident.activityLogs.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">{t('driver.incidents.chronological_trail')}</span>
            <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
              Action Timeline & Step-by-Step History ({incident.activityLogs.length})
            </h3>
          </div>

          <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-zinc-800">
            {incident.activityLogs.map((log, idx) => (
              <div key={log.id || idx} className="relative">
                <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 border border-blue-400 dark:border-blue-600 flex items-center justify-center text-[10px]">
                  <FleetIcons.Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {log.description || log.properties?.action || 'Action Logged'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString('en-GB') : '—'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
                    <span>{t('driver.incidents.by')} <strong>{log.actor_name || log.causer_name || 'System Operator'}</strong></span>
                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-zinc-700 text-[10px] font-bold uppercase">
                      {log.actor_role || log.causer_role || 'Staff'}
                    </span>
                  </div>
                  {log.properties?.old_status && log.properties?.new_status && (
                    <div className="text-[11px] text-slate-600 dark:text-zinc-300">
                      Status changed: <span className="line-through">{log.properties.old_status}</span> <FleetIcons.ArrowRight className="w-3 h-3 inline-block mx-1" /> <strong className="text-emerald-600">{log.properties.new_status}</strong>
                    </div>
                  )}
                  {(log.properties?.notes || log.properties?.contact_notes || log.properties?.resolution_notes) && (
                    <p className="text-[11px] text-slate-600 dark:text-zinc-300 italic pt-1 border-t border-slate-200 dark:border-zinc-700">
                      "{log.properties.notes || log.properties.contact_notes || log.properties.resolution_notes}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Media Zoom Modal */}
      {activeMedia && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setActiveMedia(null)}>
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-black">
            <button
              type="button"
              onClick={() => setActiveMedia(null)}
              className="absolute top-3 right-3 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors z-10"
              title={t('common.close')}
            >
              <FleetIcons.Close className="w-4 h-4 text-white" />
            </button>
            <img src={activeMedia.url} alt="Enlarged evidence" className="w-full h-full object-contain max-h-[85vh]" />
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverIncidentDetailsPage;
