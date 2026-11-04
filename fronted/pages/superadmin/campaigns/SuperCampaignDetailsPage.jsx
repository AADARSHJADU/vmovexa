import React, { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from '../../../hooks/useTranslation';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import { useSuperCampaign } from '../../../hooks/superadmin/useSuperCampaign';
import { resolveFileUrl } from '../../../api/services/upload.service';
import { extractYouTubeId } from '../../../utils/mediaUtils';
import { FleetIcons } from '../../../components/FleetIcons';
import {
  IconVideo,
  IconDocument,
  IconImage,
  IconLink,
  IconCalendar,
  IconClock,
  IconMegaphone,
  IconScreen,
  IconPhone,
  IconMail,
  IconCreditCard,
  IconPlay,
  IconCheckCircle,
} from '../../../components/ui/CampaignIcons';

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

const formatTime12h = (timeStr) => {
  if (!timeStr) return '—';
  const clean = String(timeStr).slice(0, 5);
  const parts = clean.split(':');
  if (parts.length < 2) return timeStr;
  const h = parseInt(parts[0], 10);
  const m = parts[1];
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
};

const formatDateNice = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
  } catch (_) {
    return dateStr;
  }
};

const getStatusBadge = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'live') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
  }
  if (s === 'completed') {
    return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
  }
  if (s === 'paused') {
    return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
  }
  if (s === 'approved') {
    return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800';
  }
  if (s === 'rejected') {
    return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800';
  }
  return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
};

export const SuperCampaignDetailsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { selectedCampaign: campaign, loadCampaign } = useSuperCampaign();

  useEffect(() => {
    loadCampaign(id).catch(() => {});
  }, [id, loadCampaign]);

  const scheduleMetrics = useMemo(() => {
    if (!campaign) return null;
    const startStr = campaign.start_date || '';
    const endStr = campaign.end_date || '';
    let durationDays = Number(campaign.duration_days) || 1;
    if (!campaign.duration_days && startStr && endStr) {
      try {
        const d1 = new Date(startStr);
        const d2 = new Date(endStr);
        const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
        if (diff > 0) durationDays = diff;
      } catch (_) {}
    }

    const startTimeRaw = String(campaign.broadcast_start_time || '08:00:00').slice(0, 5);
    const endTimeRaw = String(campaign.broadcast_end_time || '22:00:00').slice(0, 5);
    const startParts = startTimeRaw.split(':').map((v) => parseInt(v, 10) || 0);
    const endParts = endTimeRaw.split(':').map((v) => parseInt(v, 10) || 0);
    const startMinutes = (startParts[0] || 0) * 60 + (startParts[1] || 0);
    const endMinutes = (endParts[0] || 0) * 60 + (endParts[1] || 0);
    const diffMinutes = Math.max(1, endMinutes - startMinutes);
    const diffHours = (diffMinutes / 60).toFixed(1);

    const activeDaysFormatted = formatDays(campaign.active_days, 'Every day');

    return {
      durationDays,
      startFormatted: formatDateNice(startStr),
      endFormatted: formatDateNice(endStr),
      startTimeDisplay: formatTime12h(campaign.broadcast_start_time),
      endTimeDisplay: formatTime12h(campaign.broadcast_end_time),
      startTimeRaw,
      endTimeRaw,
      diffMinutes,
      diffHours,
      startMinutes,
      activeDaysFormatted,
    };
  }, [campaign]);

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
      {/* Header & Breadcrumb */}
      <div>
        <Breadcrumb
          items={[
            { label: t('common.super_admin', 'Super Admin'), path: '/superadmin/dashboard' },
            { label: t('superadmin.campaigns.title', 'Campaigns'), path: '/superadmin/campaigns' },
            { label: campaign.code },
          ]}
          className="mb-2"
        />
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{campaign.title}</h1>
              <span className={`px-2.5 py-1 text-xs font-black uppercase rounded-full border shadow-2xs ${getStatusBadge(campaign.status)}`}>
                {campaign.status}
              </span>
              <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                {campaign.campaign_type || (government ? t('ag.superadmin.supercampaigndetailspage.government_psa', 'Government PSA') : t('ag.superadmin.supercampaigndetailspage.commercial_ad', 'Commercial Ad'))}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1.5 flex items-center gap-2 flex-wrap font-medium">
              <span className="font-mono font-bold text-slate-700 dark:text-zinc-300">{campaign.code}</span>
              <span>·</span>
              <span>{government ? t('superadmin.campaign_details.govt_campaign', 'Government Campaign') : t('superadmin.campaign_details.advertiser_campaign', 'Advertiser Campaign')}</span>
              {campaign.brand_name && (
                <>
                  <span>·</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">{campaign.brand_name}</span>
                </>
              )}
            </p>
          </div>
          <Link
            to="/superadmin/campaigns"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 shadow-2xs transition-colors shrink-0"
          >
            <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('superadmin.campaign_details.back_to_campaigns', 'Back to campaigns')}</span>
          </Link>
        </div>
      </div>

      {/* Top Key Metrics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">{t('common.status', 'Campaign Status')}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2.5 h-2.5 rounded-full ${campaign.status === 'live' ? 'bg-emerald-500 animate-pulse' : campaign.status === 'completed' ? 'bg-slate-400' : 'bg-amber-500'}`} />
            <p className="text-sm font-black text-slate-900 dark:text-white uppercase">{campaign.status}</p>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1 capitalize font-medium">
            {t('ag.superadmin.supercampaigndetailspage.schedule', 'Schedule:')} {campaign.schedule_status || 'scheduled'}
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">{t('superadmin.campaign_details.payment_sanction', 'Payment / Sanction')}</p>
          <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1 uppercase">{campaign.payment_status}</p>
          <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1 font-medium">
            ₹{Number(campaign.budget || 0).toLocaleString('en-IN')} {t('ag.superadmin.supercampaigndetailspage.total_budget', 'total budget')}
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">{t('common.duration', 'Flight Duration')}</p>
          <p className="text-sm font-black text-slate-900 dark:text-white mt-1">
            {scheduleMetrics?.durationDays} {scheduleMetrics?.durationDays === 1 ? t('ag.superadmin.supercampaigndetailspage.day', 'Day') : t('ag.superadmin.supercampaigndetailspage.days', 'Days')}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1 font-medium">
            {scheduleMetrics?.startFormatted}
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">{t('superadmin.campaign_details.last_dispatch', 'Edge Dispatch')}</p>
          <p className="text-sm font-black text-slate-900 dark:text-white mt-1">
            {campaign.last_dispatch_count || 0} {t('superadmin.campaign_details.devices_count', 'device(s)')}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1 font-medium capitalize">
            {campaign.dispatch_status || 'normal'}
          </p>
        </div>
      </div>

      {/* HIGHLIGHTED SECTION: Campaign Flight Schedule, Dates & Timing Window */}
      <section className="rounded-2xl border-2 border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 dark:from-zinc-900 dark:via-zinc-900 dark:to-indigo-950/30 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs">
              <IconCalendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {t('campaign_details.broadcast_schedule', 'Campaign Flight Schedule & Broadcast Window')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                {t('ag.superadmin.supercampaigndetailspage.exact_duration_timing_daily_broadcast_hours_', 'Exact duration timing, daily broadcast hours, active calendar dates and transit airtime')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <IconClock className="w-3.5 h-3.5" />
              <span>{scheduleMetrics?.durationDays} {scheduleMetrics?.durationDays === 1 ? t('ag.superadmin.supercampaigndetailspage.day_total', 'Day Total') : t('ag.superadmin.supercampaigndetailspage.days_flight', 'Days Flight')}</span>
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${getStatusBadge(campaign.status)}`}>
              {campaign.status === 'completed' ? t('ag.superadmin.supercampaigndetailspage.flight_ended_completed', '✓ Flight Ended (Completed)') : campaign.status === 'live' ? t('ag.superadmin.supercampaigndetailspage.broadcasting_live', '● Broadcasting Live') : t('ag.superadmin.supercampaigndetailspage.waiting_for_window', 'Waiting for Window')}
            </span>
          </div>
        </div>

        {/* 4 Highlight Stat Cards for Timing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Flight Dates */}
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-800/80 border border-indigo-100 dark:border-zinc-700/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">{t('ag.superadmin.supercampaigndetailspage.flight_dates', 'Flight Dates')}</span>
              <IconCalendar className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-sm font-black text-slate-900 dark:text-white mt-1">
              {scheduleMetrics?.startFormatted}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              {t('ag.superadmin.supercampaigndetailspage.to', 'to')} <strong className="text-slate-800 dark:text-zinc-200">{scheduleMetrics?.endFormatted}</strong>
            </p>
            <div className="pt-1.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
              {t('ag.superadmin.supercampaigndetailspage.total', 'Total:')} {scheduleMetrics?.durationDays} {scheduleMetrics?.durationDays === 1 ? t('ag.superadmin.supercampaigndetailspage.day', 'Day') : t('ag.superadmin.supercampaigndetailspage.days', 'Days')}
            </div>
          </div>

          {/* Card 2: Daily Broadcast Window */}
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-800/80 border border-indigo-100 dark:border-zinc-700/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{t('ag.superadmin.supercampaigndetailspage.daily_window', 'Daily Window')}</span>
              <IconClock className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-sm font-black text-slate-900 dark:text-white mt-1">
              {scheduleMetrics?.startTimeDisplay} – {scheduleMetrics?.endTimeDisplay}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              {t('ag.superadmin.supercampaigndetailspage.timezone', 'Timezone:')} <strong className="text-slate-800 dark:text-zinc-200">{t('ag.superadmin.supercampaigndetailspage.ist_05_30', 'IST (+05:30)')}</strong>
            </p>
            <div className="pt-1.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
              {t('ag.superadmin.supercampaigndetailspage.airtime', 'Airtime: ~')}{scheduleMetrics?.diffMinutes} {t('ag.superadmin.supercampaigndetailspage.mins_day', 'mins / day (')}{scheduleMetrics?.diffHours} {t('ag.superadmin.supercampaigndetailspage.hrs', 'hrs)')}
            </div>
          </div>

          {/* Card 3: Creative Per-Play Duration */}
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-800/80 border border-indigo-100 dark:border-zinc-700/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{t('ag.superadmin.supercampaigndetailspage.slot_playtime', 'Slot Playtime')}</span>
              <IconPlay className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-sm font-black text-slate-900 dark:text-white mt-1">
              {campaign.duration_per_play_sec || 15}{t('ag.superadmin.supercampaigndetailspage.s_per_play', 's Per Play')}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              {t('ag.superadmin.supercampaigndetailspage.slot_type', 'Slot type:')} <strong className="text-slate-800 dark:text-zinc-200 capitalize">{campaign.slot_type || 'exclusive'}</strong>
            </p>
            <div className="pt-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
              {t('ag.superadmin.supercampaigndetailspage.frequency', 'Frequency:')} {campaign.frequency || 'Daily loop'}
            </div>
          </div>

          {/* Card 4: Active Days & Auto-Schedule */}
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-800/80 border border-indigo-100 dark:border-zinc-700/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">{t('ag.superadmin.supercampaigndetailspage.active_days', 'Active Days')}</span>
              <FleetIcons.Check className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-sm font-black text-slate-900 dark:text-white mt-1 truncate" title={scheduleMetrics?.activeDaysFormatted}>
              {scheduleMetrics?.activeDaysFormatted}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              {t('ag.superadmin.supercampaigndetailspage.auto_schedule', 'Auto Schedule:')} <strong className={campaign.auto_schedule_enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}>{campaign.auto_schedule_enabled ? t('ag.superadmin.supercampaigndetailspage.enabled', 'Enabled') : t('ag.superadmin.supercampaigndetailspage.manual', 'Manual')}</strong>
            </p>
            <div className="pt-1.5 text-[10px] font-bold text-purple-700 dark:text-purple-300">
              {t('ag.superadmin.supercampaigndetailspage.manual_pause', 'Manual Pause:')} {campaign.manual_pause ? t('ag.superadmin.supercampaigndetailspage.yes_paused', 'Yes (Paused)') : t('ag.superadmin.supercampaigndetailspage.no', 'No')}
            </div>
          </div>
        </div>

        {/* 24-Hour Visual Airtime Bar */}
        <div className="p-4 bg-white dark:bg-zinc-800/70 border border-indigo-100 dark:border-zinc-700/80 rounded-xl space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-zinc-300">
            <span>{t('ag.superadmin.supercampaigndetailspage.00_00_midnight', '00:00 (Midnight)')}</span>
            <span className="text-indigo-700 dark:text-indigo-400 font-black">
              {t('ag.superadmin.supercampaigndetailspage.active_broadcast_flight', '★ Active Broadcast Flight:')} {scheduleMetrics?.startTimeDisplay} {t('ag.superadmin.supercampaigndetailspage.to', 'to')} {scheduleMetrics?.endTimeDisplay} ({scheduleMetrics?.diffMinutes} {t('ag.superadmin.supercampaigndetailspage.mins_daily', 'mins daily)')}
            </span>
            <span>{t('ag.superadmin.supercampaigndetailspage.24_00_midnight', '24:00 (Midnight)')}</span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-zinc-700/80 rounded-full overflow-hidden flex relative border border-slate-200 dark:border-zinc-600">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full shadow-inner"
              style={{
                marginLeft: `${Math.max(0, ((scheduleMetrics?.startMinutes || 0) / 1440) * 100)}%`,
                width: `${Math.max(2, Math.min(100, ((scheduleMetrics?.diffMinutes || 15) / 1440) * 100))}%`,
              }}
            />
          </div>
          <p className="text-[10px] text-slate-500 dark:text-zinc-400 text-center font-medium">
            {t('ag.superadmin.supercampaigndetailspage.displays_on_connected_edge_devices_only_duri', 'Displays on connected edge devices only during the highlighted time window. Once this flight duration finishes, status automatically transitions to Completed.')}
          </p>
        </div>
      </section>

      {/* Client & Commercial Overview */}
      {(campaign.client_name || campaign.client_company || campaign.client_phone) && (
        <section className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-2xs">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <IconMegaphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{t('ag.superadmin.supercampaigndetailspage.client_and_advertiser_profile', 'Client & Advertiser Profile')}</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700">
              <span className="text-slate-400 dark:text-zinc-500 font-medium">{t('ag.superadmin.supercampaigndetailspage.client_contact', 'Client / Contact')}</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">{campaign.client_name || '—'}</p>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">{campaign.client_company || '—'}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700">
              <span className="text-slate-400 dark:text-zinc-500 font-medium">{t('ag.superadmin.supercampaigndetailspage.contact_details', 'Contact Details')}</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">{campaign.client_phone || '—'}</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">{campaign.client_email || '—'}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700">
              <span className="text-slate-400 dark:text-zinc-500 font-medium">{t('ag.superadmin.supercampaigndetailspage.location', 'Location')}</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">{campaign.client_city || 'Indore'}, {campaign.client_state || 'MP'}</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">{campaign.client_address || 'Transit Corridor'}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700">
              <span className="text-slate-400 dark:text-zinc-500 font-medium">{t('ag.superadmin.supercampaigndetailspage.targeting_and_placement', 'Targeting & Placement')}</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">{campaign.targeting_mode || 'All Screens'}</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">{campaign.placement || 'Rear Screen'}</p>
            </div>
          </div>
        </section>
      )}

      {/* MEDIA CREATIVES SECTION — ALL MEDIA TYPES RENDERED CLEANLY (Video, Image, PDF, YouTube/URL) */}
      <section className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <IconVideo className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
              {t('superadmin.campaign_details.media_creatives', 'Campaign Media Creatives')}
            </h2>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            {(campaign.media || []).length} {t('campaign_details.attached_assets', 'Creative Asset(s)')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {(campaign.media || []).map((media, idx) => {
            const rawUrl = media.file_url || media.fileUrl || '';
            const resolved = resolveFileUrl(rawUrl);
            const rawType = String(media.media_type || media.mediaType || '').toLowerCase();
            const isVideo = rawType === 'video' || /\.(mp4|mov|webm)$/i.test(rawUrl);
            const isPdf = rawType === 'pdf' || /\.pdf$/i.test(rawUrl);
            const isUrl = rawType === 'url' || /youtube\.com|youtu\.be/i.test(rawUrl);
            const ytId = isUrl ? extractYouTubeId(rawUrl) : null;
            const durationSec = media.display_duration_sec || media.duration_sec || campaign.duration_per_play_sec || 15;
            const filename = rawUrl.split('/').pop() || `${t('ag.superadmin.supercampaigndetailspage.creative_num', 'Creative #')}${idx + 1}`;

            return (
              <div
                key={media.id || idx}
                className="flex flex-col justify-between rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-700/80 bg-slate-50 dark:bg-zinc-800/60 shadow-2xs transition-all hover:shadow-md"
              >
                {/* Header Badge Row */}
                <div className="p-3 bg-white dark:bg-zinc-800 border-b border-slate-100 dark:border-zinc-700 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-zinc-950 text-white flex items-center justify-center text-[10px] font-black">
                      #{idx + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {isVideo ? t('ag.superadmin.supercampaigndetailspage.video', 'Video') : isPdf ? t('ag.superadmin.supercampaigndetailspage.pdf_vector', 'PDF Vector') : ytId ? t('ag.superadmin.supercampaigndetailspage.youtube', 'YouTube') : isUrl ? t('ag.superadmin.supercampaigndetailspage.cloud_stream', 'Cloud Stream') : t('ag.superadmin.supercampaigndetailspage.image', 'Image')}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-700/80 px-2 py-0.5 rounded-md">
                    ⏱ {durationSec}{t('ag.superadmin.supercampaigndetailspage.s_airtime', 's airtime')}
                  </span>
                </div>

                {/* Media Preview Box */}
                <div className="p-3 flex-1 flex flex-col justify-center">
                  {/* Case 1: Video File */}
                  {isVideo && (
                    <div className="rounded-xl overflow-hidden bg-black border border-slate-200 dark:border-zinc-700">
                      <video
                        controls
                        preload="metadata"
                        playsInline
                        src={resolved}
                        className="w-full aspect-video object-contain bg-black"
                      />
                    </div>
                  )}

                  {/* Case 2: Image File */}
                  {!isVideo && !isPdf && !isUrl && (
                    <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-zinc-700 flex items-center justify-center">
                      <img
                        src={resolved}
                        alt={`${t('ag.superadmin.supercampaigndetailspage.creative', 'Creative #') + ' '}${idx + 1}`}
                        className="w-full aspect-video object-contain"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/600x400/1e293b/white?text=Creative+Preview';
                        }}
                      />
                    </div>
                  )}

                  {/* Case 3: PDF Document (Displays clean Vector PDF card with interactive embed and external button) */}
                  {isPdf && (
                    <div className="p-4 bg-white dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto">
                        <IconDocument className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-white break-all">{filename}</p>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                          {media.file_size || 'Vector'} {t('ag.superadmin.supercampaigndetailspage.vector_document_for_transit_displays', '· Vector Document for Transit Displays')}
                        </p>
                      </div>
                      <a
                        href={resolved}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        <span>{t('ag.superadmin.supercampaigndetailspage.open_pdf_in_new_tab', 'Open PDF in New Tab')}</span>
                        <FleetIcons.ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}

                  {/* Case 4: YouTube Stream Video (Responsive Embedded Player) */}
                  {isUrl && ytId && (
                    <div className="rounded-xl overflow-hidden bg-black border border-slate-200 dark:border-zinc-700">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${ytId}`}
                        title={t('ag.superadmin.supercampaigndetailspage.youtube_creative_player', 'YouTube Creative Player')}
                        className="w-full aspect-video border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}

                  {/* Case 5: External Streaming Link (Generic URL) */}
                  {isUrl && !ytId && (
                    <div className="p-4 bg-white dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-2 text-center">
                      <IconLink className="w-8 h-8 text-blue-500 mx-auto" />
                      <p className="text-xs font-bold text-slate-900 dark:text-white break-all">{filename}</p>
                      <p className="text-[11px] text-blue-600 dark:text-blue-400 font-mono break-all">{rawUrl}</p>
                      <a
                        href={rawUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-200 text-center"
                      >
                        <span>{t('ag.superadmin.supercampaigndetailspage.visit_stream_link', 'Visit Stream Link')}</span>
                        <FleetIcons.ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Footer Metadata */}
                <div className="p-3 bg-white dark:bg-zinc-800 border-t border-slate-100 dark:border-zinc-700 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                  <span>{media.resolution || '1080p Stream'}</span>
                  <span>{media.file_size || 'Available'}</span>
                  {rawUrl.startsWith('http') && (
                    <a
                      href={resolved}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <span>{t('ag.superadmin.supercampaigndetailspage.view', 'View')}</span>
                      <FleetIcons.ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}

          {!(campaign.media || []).length && (
            <div className="col-span-full p-8 text-center bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-200 dark:border-zinc-800">
              <IconVideo className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                {t('superadmin.campaign_details.no_media', 'No media attached.')}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Routes, Screens & Fleet Hardware Section */}
      <section className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-2xs">
        <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
          <IconScreen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>{t('superadmin.campaign_details.routes_screens_title', 'Routes, buses, screens & edge devices')}</span>
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
                        {t('ag.superadmin.supercampaigndetailspage.edge', 'Edge:')} {vehicle.edgeDevice?.box_id || 'Not linked'} · {vehicle.edgeDevice?.status || 'offline'}
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

      {/* Booked Slots Table */}
      <section className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-2xs">
        <h2 className="font-black text-slate-900 dark:text-white">
          {t('superadmin.campaign_details.booked_slots', 'Booked slots')}
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
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
                    {String(slot.start_time || '').slice(0, 5)}-{String(slot.end_time || '').slice(0, 5)} {t('ag.superadmin.supercampaigndetailspage.ist', 'IST')}
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
    </div>
  );
};

export default SuperCampaignDetailsPage;
