import { useTranslation } from '../../hooks/useTranslation';
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CampaignLifecycleFlow } from '../../components/campaign/CampaignLifecycleFlow';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { useAdvertiserRole } from '../../hooks/advertiser/useAdvertiserRole';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { FleetIcons } from '../../components/FleetIcons';
import {
  IconShare, IconPlay, IconPause, IconStop, IconRocket, IconEye, IconBarChart, IconCreditCard, IconClock,
} from '../../components/ui/CampaignIcons';

const STAGES = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'pending_approval', label: 'Pending Approval' },
  { key: 'approved', label: 'Approved' },
  { key: 'paid', label: 'Paid (Ready)' },
  { key: 'live', label: 'Live' },
  { key: 'paused', label: 'Paused' },
  { key: 'completed', label: 'Completed' },
  { key: 'rejected', label: 'Rejected' },
];

const STATUS_STYLE = {
  draft: 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700',
  pending_approval: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  approved: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  live: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  paused: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  completed: 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700',
  rejected: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
};

export const CampaignLifecyclePage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isSuperAdmin = location.pathname.startsWith('/superadmin');
  const basePath = isSuperAdmin ? '/superadmin/advertiser' : '/advertiser';

  const {
    campaigns: rawCampaigns,
    loadCampaigns,
    startCampaign,
    stopCampaign,
    endCampaign,
    sharePaymentLink,
  } = useAdvertiserRole();

  const [activeStage, setActiveStage] = useState('all');
  const [busyId, setBusyId] = useState(null);
  const [showDiagram, setShowDiagram] = useState(true);

  useEffect(() => {
    loadCampaigns().catch(() => {});
  }, [loadCampaigns]);

  const campaigns = useMemo(() => {
    const list = Array.isArray(rawCampaigns) ? rawCampaigns : (rawCampaigns?.items || rawCampaigns?.rows || []);
    return list;
  }, [rawCampaigns]);

  // Treat a paid+approved campaign as the "Paid (Ready)" bucket.
  const stageOf = (c) => {
    if (c.status === 'approved' && c.payment_status === 'paid') return 'paid';
    return c.status;
  };

  const getCampTotal = (c) => {
    if (!c) return 0;
    const pb = typeof c.payment_breakdown === 'string'
      ? (() => { try { return JSON.parse(c.payment_breakdown); } catch (_) { return null; } })()
      : c.payment_breakdown;
    return Number(pb?.totalAmount ?? c.budget ?? 0);
  };

  const counts = useMemo(() => {
    const map = { all: campaigns.length };
    for (const s of STAGES) if (s.key !== 'all') map[s.key] = 0;
    for (const c of campaigns) {
      const st = stageOf(c);
      map[st] = (map[st] || 0) + 1;
    }
    return map;
  }, [campaigns]);

  const filtered = useMemo(() => {
    if (activeStage === 'all') return campaigns;
    return campaigns.filter((c) => stageOf(c) === activeStage);
  }, [campaigns, activeStage]);

  const refresh = () => loadCampaigns().catch(() => {});

  const runAction = async (fn, id, successMsg) => {
    setBusyId(id);
    try {
      await fn(id);
      toast.success(successMsg);
      await refresh();
    } catch (err) {
      toast.error(err?.message || 'Action failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleShareLink = async (c) => {
    setBusyId(c.id);
    try {
      await sharePaymentLink(c.id, { channel: 'all' });
      toast.success('Payment link dispatched to the customer.');
    } catch (err) {
      toast.error(err?.message || 'Could not send payment link');
    } finally {
      setBusyId(null);
    }
  };

  const renderActions = (c) => {
    const st = c.status;
    const paid = c.payment_status === 'paid';
    const busy = busyId === c.id;
    const btn = 'px-3 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 disabled:opacity-50 active:scale-95 cursor-pointer';
    return (
      <div className="flex flex-wrap items-center gap-2">
        {/* Send payment link when approved but unpaid */}
        {st === 'approved' && !paid && (
          <button disabled={busy} onClick={() => handleShareLink(c)} className={`${btn} bg-blue-600 text-white hover:bg-blue-700`}>
            <IconShare className="w-3.5 h-3.5" /> Send Payment Link
          </button>
        )}
        {/* Start when paid+approved or paused→resume */}
        {((st === 'approved' && paid)) && (
          <span className={`${btn} bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800`}>
            <IconClock className="w-3.5 h-3.5" /> Scheduled automatically
          </span>
        )}
        {st === 'live' && (
          <button disabled={busy} onClick={() => runAction(stopCampaign, c.id, 'Campaign paused.')} className={`${btn} bg-orange-500 text-white hover:bg-orange-600`}>
            <IconPause className="w-3.5 h-3.5" /> Pause Ad
          </button>
        )}
        {st === 'paused' && c.manual_pause && (
          <button disabled={busy} onClick={() => runAction(startCampaign, c.id, 'Campaign resumed — LIVE.')} className={`${btn} bg-emerald-600 text-white hover:bg-emerald-700`}>
            <IconPlay className="w-3.5 h-3.5" /> Resume Schedule
          </button>
        )}
        {st === 'paused' && !c.manual_pause && (
          <span className={`${btn} bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300`}><IconClock className="w-3.5 h-3.5" /> {t('advertiser.campaigns.outside_window')}</span>
        )}
        {(st === 'live' || st === 'paused') && (
          <button disabled={busy} onClick={() => runAction(endCampaign, c.id, 'Campaign ended.')} className={`${btn} bg-rose-600 text-white hover:bg-rose-700`}>
            <IconStop className="w-3.5 h-3.5" /> End
          </button>
        )}
        <Link to={`${basePath}/campaigns/${c.id}`} className={`${btn} border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700`}>
          <IconEye className="w-3.5 h-3.5" /> View
        </Link>
        <Link to={`${basePath}/campaigns/${c.id}/analytics`} className={`${btn} border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700`}>
          <IconBarChart className="w-3.5 h-3.5" /> Analytics
        </Link>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-16 animate-in fade-in duration-200">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-5">
        <div>
          <Breadcrumb
            items={[
              { label: t('nav.dashboard', 'Dashboard'), to: `${basePath}/dashboard` },
              { label: t('advertiser.profile.campaigns', 'Campaigns'), to: `${basePath}/campaigns` },
              { label: t('advertiser.campaigns.lifecycle_title') }
            ]}
            className="mb-2"
          />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t('advertiser.campaigns.lifecycle_title')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Live board of every campaign by stage. Send payment links, start/pause/resume/end broadcast — all in one place.
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <RefreshButton onClick={refresh} />
          <Link to={`${basePath}/campaigns/create`} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer">
            <FleetIcons.Plus className="w-3.5 h-3.5" />
            <span>{t('advertiser.dashboard.create_campaign')}</span>
          </Link>
        </div>
      </div>

      {/* Lifecycle diagram reference (Featured prominently at top) */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setShowDiagram((v) => !v)}
          className="w-full flex items-center justify-between px-5 sm:px-6 py-4 text-left hover:bg-slate-50 dark:hover:bg-zinc-850/60 transition-colors cursor-pointer border-b border-slate-100 dark:border-zinc-800"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center">
              <FleetIcons.Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <span className="text-sm font-black text-slate-900 dark:text-white block">{t('advertiser.campaigns.pipeline_title')}</span>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">{t('advertiser.campaigns.pipeline_sub')}</span>
            </div>
          </div>
          <span className="text-slate-400 dark:text-zinc-500 text-xs font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800">
            {showDiagram ? 'Hide Pipeline ▲' : 'Show Pipeline ▼'}
          </span>
        </button>
        {showDiagram && (
          <div className="p-3 sm:p-5">
            <CampaignLifecycleFlow currentStage={1} />
          </div>
        )}
      </div>

      {/* Stage filter buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {STAGES.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveStage(s.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
              activeStage === s.key
                ? 'bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-600 shadow-sm'
                : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800'
            }`}
          >
            {s.label}
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${activeStage === s.key ? 'bg-white/20' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'}`}>
              {counts[s.key] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Campaign board */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center mx-auto mb-4">
            <IconRocket className="w-6 h-6 text-slate-400 dark:text-zinc-400" />
          </div>
          <p className="text-base font-black text-slate-900 dark:text-white">{t('advertiser.campaigns.no_campaigns_stage')}</p>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{t('advertiser.campaigns.no_campaigns_stage_sub')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div key={c.id} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">{c.title || c.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${STATUS_STYLE[c.status] || STATUS_STYLE.draft}`}>
                      {stageOf(c).replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${c.payment_status === 'paid' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'}`}>
                      {c.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">{c.code}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-zinc-400 font-medium flex-wrap">
                    <span className="inline-flex items-center gap-1"><IconCreditCard className="w-3 h-3 text-slate-400 dark:text-zinc-500" /> ₹{getCampTotal(c).toLocaleString()}</span>
                    <span>Spent ₹{Number(c.spent || 0).toLocaleString()}</span>
                    <span>{Number(c.impressions_delivered || 0).toLocaleString()} impressions</span>
                  </div>
                </div>
                {renderActions(c)}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default CampaignLifecyclePage;
