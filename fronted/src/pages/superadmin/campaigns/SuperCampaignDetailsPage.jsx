import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from '../../../hooks/useTranslation';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import { useSuperCampaign } from '../../../hooks/superadmin/useSuperCampaign';
import { resolveFileUrl } from '../../../api/services/upload.service';

const formatDays = (days, defaultText = 'Every day') => {
  if (!days) return defaultText;
  if (Array.isArray(days)) return days.length > 0 ? days.join(', ') : defaultText;
  if (typeof days === 'string') {
    const trimmed = days.trim();
    if (!trimmed) return defaultText;
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.length > 0 ? parsed.join(', ') : defaultText;
    } catch (_) {}
    return trimmed;
  }
  return defaultText;
};

export const SuperCampaignDetailsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { selectedCampaign: campaign, loadCampaign } = useSuperCampaign();

  useEffect(() => {
    loadCampaign(id).catch(() => {});
  }, [id, loadCampaign]);

  if (!campaign || String(campaign.id) !== String(id)) {
    return (
      <div className="p-10 text-center text-slate-500 dark:text-zinc-400">
        {t('superadmin.campaign_details.loading', 'Loading campaign details...')}
      </div>
    );
  }

  const government = campaign.owner_type === 'government' || campaign.type === 'government_psa';

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div>
        <Breadcrumb
          items={[
            { label: t('common.super_admin', 'Super Admin'), path: '/superadmin/dashboard' },
            { label: t('superadmin.campaigns.title', 'Campaigns'), path: '/superadmin/campaigns' },
            { label: campaign.code },
          ]}
          className="mb-2"
        />
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">{campaign.title}</h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
              {campaign.code} · {government ? t('superadmin.campaign_details.govt_campaign', 'Government Campaign') : t('superadmin.campaign_details.advertiser_campaign', 'Advertiser Campaign')}
            </p>
          </div>
          <Link to="/superadmin/campaigns" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
            {t('superadmin.campaign_details.back_to_campaigns', 'Back to campaigns')}
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          [t('common.status', 'Status'), campaign.status],
          [t('superadmin.campaign_details.payment_sanction', 'Payment / Sanction'), campaign.payment_status],
          [t('superadmin.campaign_details.schedule', 'Schedule'), campaign.schedule_status],
          [t('superadmin.campaign_details.last_dispatch', 'Last dispatch'), `${campaign.last_dispatch_count || 0} ${t('superadmin.campaign_details.devices_count', 'device(s)')}`],
        ].map(([label, value]) => (
          <div key={label} className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400">{label}</p>
            <p className="text-sm font-black text-slate-900 dark:text-white mt-1">{value || '—'}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
        <h2 className="font-black text-slate-900 dark:text-white">
          {t('superadmin.campaign_details.media_creatives', 'Media creatives')}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {(campaign.media || []).map((media) => (
            <div key={media.id} className="rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 bg-slate-950">
              {media.media_type === 'video' ? (
                <video controls src={resolveFileUrl(media.file_url)} className="w-full aspect-video" />
              ) : (
                <img src={resolveFileUrl(media.file_url)} alt="Campaign creative" className="w-full aspect-video object-contain" />
              )}
              <div className="p-2 text-[11px] text-white">
                {media.media_type} · {media.display_duration_sec || media.duration_sec || 15}s
              </div>
            </div>
          ))}
          {!(campaign.media || []).length && (
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {t('superadmin.campaign_details.no_media', 'No media attached.')}
            </p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
        <h2 className="font-black text-slate-900 dark:text-white">
          {t('superadmin.campaign_details.routes_screens_title', 'Routes, buses, screens & edge devices')}
        </h2>
        <div className="space-y-3 mt-4">
          {(campaign.targets || []).map((target) => (
            <details key={target.id} open className="rounded-xl border border-slate-200 dark:border-zinc-700 p-3">
              <summary className="cursor-pointer font-bold text-sm text-slate-900 dark:text-white">
                {target.route?.name || `Route #${target.route_id}`} · {target.vehicles_count || 0} {t('common.buses', 'buses')} · {target.screens_count || 0} {t('common.screens', 'screens')}
              </summary>
              <div className="mt-3 grid lg:grid-cols-2 gap-3">
                {(target.vehicles || []).map((vehicle) => {
                  const screens = (target.screens || []).filter(
                    (screen) => Number(screen.vehicle_id) === Number(vehicle.id) || Number(screen.edge_device_id) === Number(vehicle.edge_device_id)
                  );
                  return (
                    <div key={vehicle.id} className="rounded-lg bg-slate-50 dark:bg-zinc-800 p-3">
                      <strong className="text-xs dark:text-white">{vehicle.bus_number}</strong>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Edge: {vehicle.edgeDevice?.box_id || 'Not linked'} · {vehicle.edgeDevice?.status || 'offline'}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {screens.map((screen) => (
                          <span key={screen.id} className="px-2 py-1 text-[10px] font-bold rounded bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            {screen.code} · {screen.status}
                          </span>
                        ))}
                        {screens.length === 0 && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400">
                            {t('superadmin.campaign_details.no_individual_screens', 'No individually selected screens')}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </details>
          ))}
          {!(campaign.targets || []).length && (
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {t('superadmin.campaign_details.no_targeting', 'No targeting records.')}
            </p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
        <h2 className="font-black text-slate-900 dark:text-white">
          {t('superadmin.campaign_details.booked_slots', 'Booked slots')}
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-500 dark:text-zinc-400 uppercase">
              <tr>
                <th className="py-2 pr-4">{t('superadmin.campaign_details.th_resource', 'Resource')}</th>
                <th className="py-2 pr-4">{t('common.dates', 'Dates')}</th>
                <th className="py-2 pr-4">{t('common.time', 'Time')}</th>
                <th className="py-2 pr-4">{t('common.days', 'Days')}</th>
                <th className="py-2">{t('common.status', 'Status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {(campaign.slots || []).map((slot) => (
                <tr key={slot.id}>
                  <td className="py-2.5 pr-4 font-bold text-slate-800 dark:text-zinc-200">
                    {slot.screen?.code ? `Screen ${slot.screen.code}` : slot.vehicle?.bus_number ? `Bus ${slot.vehicle.bus_number}` : `Route #${slot.route_id}`}
                  </td>
                  <td className="py-2.5 pr-4 text-slate-500 dark:text-zinc-400">
                    {slot.start_date} {t('common.to', 'to')} {slot.end_date}
                  </td>
                  <td className="py-2.5 pr-4 text-slate-500 dark:text-zinc-400">
                    {String(slot.start_time || '').slice(0, 5)}-{String(slot.end_time || '').slice(0, 5)} IST
                  </td>
                  <td className="py-2.5 pr-4 text-slate-500 dark:text-zinc-400">
                    {formatDays(slot.active_days, t('common.every_day', 'Every day'))}
                  </td>
                  <td className="py-2.5">
                    <span className={`px-2 py-1 rounded-lg font-bold ${slot.status === 'active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                      {slot.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!(campaign.slots || []).length && (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-slate-500 dark:text-zinc-400">
                    {t('superadmin.campaign_details.no_slots', 'No slot records.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
        <h2 className="font-black text-slate-900 dark:text-white">
          {t('superadmin.campaign_details.auto_flight_schedule', 'Automatic flight schedule')}
        </h2>
        <p className="text-sm text-slate-600 dark:text-zinc-300 mt-3">
          {campaign.start_date} {t('common.to', 'to')} {campaign.end_date} · {String(campaign.broadcast_start_time || '').slice(0, 5)}–{String(campaign.broadcast_end_time || '').slice(0, 5)} IST
        </p>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          {t('superadmin.campaign_details.active_days', 'Active days:')} {formatDays(campaign.active_days, t('common.every_day', 'Every day'))} · {t('superadmin.campaign_details.auto_schedule', 'Auto schedule:')} {campaign.auto_schedule_enabled ? t('common.enabled', 'Enabled') : t('common.disabled', 'Disabled')} · {t('superadmin.campaign_details.manual_pause', 'Manual pause:')} {campaign.manual_pause ? t('common.yes', 'Yes') : t('common.no', 'No')}
        </p>
      </section>
    </div>
  );
};

export default SuperCampaignDetailsPage;
