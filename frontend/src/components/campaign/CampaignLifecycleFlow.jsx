import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../FleetIcons';
import {
  IconRocket,
  IconCheckCircle,
  IconCreditCard,
  IconPlay,
  IconPause,
  IconUser,
  IconDocument,
} from '../ui/CampaignIcons';

export const CampaignLifecycleFlow = ({ currentStage = 1, showDetails = true, onSelectStage }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'roles' | 'matrix'
  const [selectedStep, setSelectedStep] = useState(currentStage);

  const steps = [
    {
      id: 1,
      title: '1. Advertiser Creates Campaign',
      role: 'Commercial Advertiser',
      roleBadge: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      action: 'Configures Creative, Target Screens & Budget',
      status: 'pending_approval',
      paymentStatus: 'unpaid',
      iconComponent: (cls = 'w-5 h-5') => <FleetIcons.Fleets className={cls} />,
      gradient: 'from-blue-600 via-indigo-600 to-purple-600',
      tagColor: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      bgTint: 'from-blue-50/80 via-indigo-50/40 to-white dark:from-blue-950/50 dark:via-indigo-950/30 dark:to-zinc-900',
      accentBorder: 'border-blue-500 dark:border-blue-500',
      accentText: 'text-blue-600 dark:text-blue-400',
      details: [
        'Uploads 1080p/4K video creative (MP4/PNG) or live YouTube demo URL.',
        'Selects target transit fleets (e.g., City Ride, Metro Connect) and cities.',
        'Defines broadcast schedule (active days, operating hours 08:00–22:00).',
        'Submits campaign to the DOOH network for administrative compliance review.'
      ],
      apiEndpoint: 'POST /campaigns',
      notification: 'SuperAdmin receives: "New DOOH Ad Campaign Submitted for Review"'
    },
    {
      id: 2,
      title: '2. Super Admin Verification',
      role: 'Platform Super Admin',
      roleBadge: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      action: 'Reviews Content Compliance & Approves',
      status: 'approved',
      paymentStatus: 'unpaid',
      iconComponent: (cls = 'w-5 h-5') => <FleetIcons.Shield className={cls} />,
      gradient: 'from-purple-600 via-pink-600 to-rose-600',
      tagColor: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      bgTint: 'from-purple-50/80 via-pink-50/40 to-white dark:from-purple-950/50 dark:via-pink-950/30 dark:to-zinc-900',
      accentBorder: 'border-purple-500 dark:border-purple-500',
      accentText: 'text-purple-600 dark:text-purple-400',
      details: [
        'SuperAdmin audits video content against safety, resolution & regulatory standards.',
        'If compliant, SuperAdmin verifies the campaign (decision: "approved").',
        'Backend generates a secure cryptographic payment_token.',
        'Automatic email & in-app alert dispatched to advertiser with direct payment link.'
      ],
      apiEndpoint: 'POST /campaigns/:id/verify',
      notification: 'Advertiser receives: "Campaign Verified — Payment Required to Launch"'
    },
    {
      id: 3,
      title: '3. Pay Directly or Send Link to Customer',
      role: 'Advertiser / Customer',
      roleBadge: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      action: 'Direct Pay OR Share Payment Link via SMS / Email / WhatsApp',
      status: 'approved',
      paymentStatus: 'unpaid → paid',
      iconComponent: (cls = 'w-5 h-5') => <IconCreditCard className={cls} />,
      gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
      tagColor: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      bgTint: 'from-emerald-50/80 via-teal-50/40 to-white dark:from-emerald-950/50 dark:via-teal-950/30 dark:to-zinc-900',
      accentBorder: 'border-emerald-500 dark:border-emerald-500',
      accentText: 'text-emerald-600 dark:text-emerald-400',
      details: [
        'Option A: Advertiser pays ad spend directly via Razorpay / UPI / NetBanking.',
        'Option B: Advertiser generates payment link and sends to Client/Customer via SMS, Email, or WhatsApp.',
        'Customer opens link in browser, completes checkout (with 18% GST invoice).',
        'System verifies transaction and marks payment as approved/paid.'
      ],
      apiEndpoint: 'POST /campaigns/:id/share-payment-link',
      notification: 'Customer receives: "Payment request for DOOH Campaign via SMS/Email"'
    },
    {
      id: 4,
      title: '4. Payment Approved & Ready',
      role: 'Platform & Billing Gateway',
      roleBadge: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      action: 'Payment Confirmed, QR Generated & Ready to Launch',
      status: 'approved',
      paymentStatus: 'paid',
      iconComponent: (cls = 'w-5 h-5') => <IconCheckCircle className={cls} />,
      gradient: 'from-amber-500 via-orange-500 to-rose-500',
      tagColor: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      bgTint: 'from-amber-50/80 via-orange-50/40 to-white dark:from-amber-950/50 dark:via-orange-950/30 dark:to-zinc-900',
      accentBorder: 'border-amber-500 dark:border-amber-500',
      accentText: 'text-amber-600 dark:text-amber-400',
      details: [
        'Razorpay callback confirms funds received; payment ledger entry created.',
        'Dynamic Campaign QR code automatically generated for passenger scan tracking.',
        'Campaign moves to "Ready" state — Advertiser now has full control to Start.',
        'GST invoice automatically issued to payer.'
      ],
      apiEndpoint: 'POST /campaigns/:id/confirm-payment',
      notification: 'Advertiser receives: "Payment Confirmed! Your campaign is ready to Start."'
    },
    {
      id: 5,
      title: '5. Advertiser Controls Ad: Start & Stop',
      role: 'Advertiser & IoT Fleet Screens',
      roleBadge: 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
      action: 'Manual Start / Stop Control with Real-Time MQTT Sync',
      status: 'live ⟷ paused',
      paymentStatus: 'paid',
      iconComponent: (cls = 'w-5 h-5') => <IconPlay className={cls} />,
      gradient: 'from-blue-600 via-indigo-600 to-violet-600',
      tagColor: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
      bgTint: 'from-cyan-50/80 via-blue-50/40 to-white dark:from-cyan-950/50 dark:via-blue-950/30 dark:to-zinc-900',
      accentBorder: 'border-cyan-500 dark:border-cyan-500',
      accentText: 'text-cyan-600 dark:text-cyan-400',
      details: [
        'Advertiser clicks "Start Ad" anytime to launch broadcast on targeted transit buses.',
        'MQTT broker dispatches PLAY_CAMPAIGN message to online Android display boxes.',
        'Advertiser can click "Stop / Pause Ad" anytime to immediately halt screen playback.',
        'Passengers scan on-screen QR code; real-time impressions & telemetry update live.'
      ],
      apiEndpoint: 'POST /campaigns/:id/start  &  POST /campaigns/:id/stop',
      notification: 'Transit Displays: PLAY_CAMPAIGN / STOP_CAMPAIGN dispatched via MQTT'
    }
  ];

  return (
    <div className="w-full bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 rounded-3xl p-4 sm:p-7 lg:p-8 shadow-sm border border-slate-200/90 dark:border-zinc-800 space-y-6 relative overflow-hidden transition-colors">
      
      {/* Top Ambient Gradient Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/70 dark:border-blue-850 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase tracking-wider shadow-2xs">
              {t('lifecycle.engine_title', 'VMOVEXA DOOH Engine')}
            </span>
            <span className="text-xs text-slate-400 dark:text-zinc-500 font-semibold">• {t('lifecycle.engine_sub', 'End-to-End Campaign Flow')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-1.5">
            {t('lifecycle.pipeline_title', 'Campaign Approval & Broadcast Lifecycle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
            {t('lifecycle.engine_sub', 'Understand every stage from draft creation to digital bus screen playback.')}
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100/90 dark:bg-zinc-800/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-zinc-700/80 self-start sm:self-auto text-xs font-bold overflow-x-auto no-scrollbar max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab('pipeline')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'pipeline'
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-zinc-700/50'
            }`}
          >
            <IconRocket className="w-3.5 h-3.5" />
            <span>{t('lifecycle.visual_pipeline', 'Visual Pipeline')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('roles')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'roles'
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-zinc-700/50'
            }`}
          >
            <IconUser className="w-3.5 h-3.5" />
            <span>{t('lifecycle.roles_tab', 'Roles & Actions')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-zinc-700/50'
            }`}
          >
            <IconDocument className="w-3.5 h-3.5" />
            <span>{t('lifecycle.status_matrix', 'Status Matrix')}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: VISUAL PIPELINE */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Horizontal Step Sequence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 relative">
            {steps.map((step) => {
              const isCurrent = step.id === currentStage;
              const isPast = step.id < currentStage;
              const isSelected = step.id === selectedStep;

              return (
                <div
                  key={step.id}
                  onClick={() => {
                    setSelectedStep(step.id);
                    if (onSelectStage) onSelectStage(step.id);
                  }}
                  className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? `bg-gradient-to-br ${step.bgTint} border-indigo-600 dark:border-indigo-500 shadow-lg shadow-indigo-500/10 ring-4 ring-indigo-100/80 dark:ring-indigo-900/50 scale-[1.02]`
                      : isCurrent
                      ? 'bg-blue-50/40 dark:bg-blue-950/30 border-blue-500 dark:border-blue-500 shadow-sm'
                      : isPast
                      ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80'
                      : 'bg-white dark:bg-zinc-850/60 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-xs'
                  }`}
                >
                  {/* Top indicator & icon */}
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/80 flex items-center justify-center">
                      {step.iconComponent(`w-4 h-4 ${step.accentText}`)}
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      isPast
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : isCurrent
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent animate-pulse shadow-xs'
                        : isSelected
                        ? 'bg-indigo-600 text-white border-transparent shadow-xs'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
                    }`}>
                      {isPast ? '✓ Completed' : isCurrent ? '● Active Step' : `Step ${step.id}`}
                    </span>
                  </div>

                  {/* Title & Role */}
                  <div className="mt-3.5 space-y-1">
                    <h4 className="text-xs font-black text-slate-900 dark:text-zinc-100 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug line-clamp-2">
                      {step.action}
                    </p>
                  </div>

                  {/* Bottom Role Tag */}
                  <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[10px]">
                    <span className="text-slate-600 dark:text-zinc-400 font-bold truncate">{step.role}</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-black group-hover:translate-x-1 transition-transform">➔</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expanded Selected Step Details Card */}
          {selectedStep && (
            <div className="bg-gradient-to-br from-slate-50/90 via-indigo-50/30 to-purple-50/20 dark:from-zinc-900 dark:via-zinc-850 dark:to-zinc-900 border-2 border-slate-200/90 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 space-y-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-zinc-800 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${steps[selectedStep - 1].gradient} text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0`}>
                    {steps[selectedStep - 1].iconComponent('w-6 h-6 text-white')}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      Stage {selectedStep}: {steps[selectedStep - 1].title}
                    </h3>
                    <p className="text-xs text-indigo-700 dark:text-indigo-400 font-bold mt-0.5">
                      Primary Actor: {steps[selectedStep - 1].role}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                  <span className="text-[11px] font-mono px-3 py-1 rounded-xl bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 shadow-2xs">
                    Status: <span className="text-amber-700 dark:text-amber-400 font-black uppercase">{steps[selectedStep - 1].status}</span>
                  </span>
                  <span className="text-[11px] font-mono px-3 py-1 rounded-xl bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 shadow-2xs">
                    Payment: <span className="text-emerald-700 dark:text-emerald-400 font-black uppercase">{steps[selectedStep - 1].paymentStatus}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                {/* Workflow Checklist */}
                <div className="space-y-3">
                  <p className="font-black text-slate-900 dark:text-zinc-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                    <span>System Workflow Highlights:</span>
                  </p>
                  <ul className="space-y-2">
                    {steps[selectedStep - 1].details.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 bg-white dark:bg-zinc-800/90 p-2.5 rounded-xl border border-slate-200/70 dark:border-zinc-700/80 shadow-2xs">
                        <span className="w-5 h-5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                          ✓
                        </span>
                        <span className="text-slate-700 dark:text-zinc-300 font-medium leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Technical Triggers & Protocols Box */}
                <div className="bg-white dark:bg-zinc-800/90 rounded-2xl p-5 border border-slate-200/90 dark:border-zinc-700/80 shadow-2xs space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-black text-slate-400 dark:text-zinc-400 tracking-wider block">Triggered API Endpoint / Protocol:</span>
                    <div className="mt-1.5 inline-flex items-center gap-2 bg-slate-900 dark:bg-zinc-950 text-emerald-400 font-mono font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs border border-slate-800 dark:border-zinc-800">
                      <span className="text-amber-400">⚡</span>
                      <span>{steps[selectedStep - 1].apiEndpoint}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-black text-slate-400 dark:text-zinc-400 tracking-wider block">Automated Dispatch Notification:</span>
                    <div className="mt-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-zinc-900/90 dark:to-zinc-900/90 border border-blue-100 dark:border-zinc-700 p-3 rounded-xl text-slate-800 dark:text-zinc-200 text-xs font-semibold leading-relaxed flex items-start gap-2 shadow-inner">
                      <FleetIcons.Megaphone className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <span>{steps[selectedStep - 1].notification}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-700/80 text-[11px] text-slate-500 dark:text-zinc-400 font-medium flex items-center justify-between">
                    <span>Audit Logged & Event Dispatched</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Active Real-Time Synced ✓</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ROLES & RESPONSIBILITIES */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-in fade-in duration-200">
          
          {/* Card 1: Advertiser */}
          <div className="bg-white dark:bg-zinc-800/80 border border-slate-200/90 dark:border-zinc-800 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all space-y-4 relative overflow-hidden group">
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-600 absolute top-0 left-0 right-0" />
            
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xl shadow-md shadow-blue-500/20 shrink-0">
                <FleetIcons.Fleets className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Commercial Advertiser</h3>
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                  Primary Creator & Manager
                </span>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-zinc-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span>Configures creative video (1080p/4K MP4) & live stream links.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span>Chooses target transit bus operators, routes, and screen densities.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span>Submits campaign for administrative compliance approval.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span><strong className="text-slate-900 dark:text-white">Payment Options:</strong> Pays directly OR sends payment link to Client via SMS, Email, or WhatsApp.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span><strong className="text-slate-900 dark:text-white">Full Control:</strong> Clicks <strong className="text-emerald-700 dark:text-emerald-400">"▶️ Start Ad"</strong> to broadcast on bus screens or <strong className="text-amber-700 dark:text-amber-400">"⏸️ Stop Ad"</strong> to pause playback anytime.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span>Monitors passenger QR scans and live Proof-of-Play analytics.</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Super Admin */}
          <div className="bg-white dark:bg-zinc-800/80 border border-slate-200/90 dark:border-zinc-800 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all space-y-4 relative overflow-hidden group">
            <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 to-pink-600 absolute top-0 left-0 right-0" />

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white flex items-center justify-center text-xl shadow-md shadow-purple-500/20 shrink-0">
                <FleetIcons.Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Platform Super Admin</h3>
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
                  Compliance Authority
                </span>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-zinc-300">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400 font-bold">•</span>
                <span>Reviews pending queue in SuperAdmin Dashboard.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400 font-bold">•</span>
                <span>Checks video creative against DOOH community guidelines.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400 font-bold">•</span>
                <span>Approves campaign & triggers secure cryptographic payment token.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400 font-bold">•</span>
                <span>Or rejects with custom feedback if guidelines are violated.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400 font-bold">•</span>
                <span>Retains emergency authority to pause or revoke any active ad broadcast.</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Screen IoT Node */}
          <div className="bg-white dark:bg-zinc-800/80 border border-slate-200/90 dark:border-zinc-800 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all space-y-4 relative overflow-hidden group">
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 to-emerald-500 absolute top-0 left-0 right-0" />

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-emerald-500 text-white flex items-center justify-center text-xl shadow-md shadow-emerald-500/20 shrink-0">
                <FleetIcons.Bus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Transit Screen & IoT Node</h3>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  Edge Display Player
                </span>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-zinc-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                <span>Subscribes to MQTT topic <code className="bg-slate-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded text-[11px] font-mono text-slate-800 dark:text-zinc-200 border dark:border-zinc-700">vehicle/{'{box_id}'}/campaign</code>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                <span>Downloads creative file, verifies checksum & caches locally.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                <span>Plays ad video upon PLAY_CAMPAIGN; pauses immediately upon STOP_CAMPAIGN.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                <span>Renders dynamic QR code & streams telemetry logs back to server.</span>
              </li>
            </ul>
          </div>

        </div>
      )}

      {/* TAB 3: STATUS STATE MACHINE MATRIX */}
      {activeTab === 'matrix' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs animate-in fade-in duration-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 dark:bg-zinc-800/90 text-slate-600 dark:text-zinc-400 font-black uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">{t('lifecycle.stage', 'Stage')}</th>
                <th className="py-3.5 px-4">{t('lifecycle.campaign_status', 'Campaign status')}</th>
                <th className="py-3.5 px-4">{t('tenants.payment_status', 'Payment Status')}</th>
                <th className="py-3.5 px-4">{t('lifecycle.primary_actor', 'Primary Actor')}</th>
                <th className="py-3.5 px-4 sm:px-6">{t('lifecycle.trigger_action', 'Trigger Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium text-slate-700 dark:text-zinc-300">
              <tr className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900 dark:text-white">{t('lifecycle.stage1_title', '1. Creation')}</td>
                <td className="py-3.5 px-4"><span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-mono font-bold">pending_approval</span></td>
                <td className="py-3.5 px-4"><span className="px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[10px] font-mono font-bold">unpaid</span></td>
                <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-zinc-200">{t('lifecycle.actor_advertiser', 'Commercial Advertiser')}</td>
                <td className="py-3.5 px-4 sm:px-6 font-mono text-[11px] text-blue-700 dark:text-blue-400 font-semibold">Submits 6-Step Form (POST /campaigns)</td>
              </tr>
              <tr className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900 dark:text-white">{t('lifecycle.stage2_title', '2. Admin Approval')}</td>
                <td className="py-3.5 px-4"><span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-mono font-bold">approved</span></td>
                <td className="py-3.5 px-4"><span className="px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[10px] font-mono font-bold">unpaid</span></td>
                <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-zinc-200">{t('lifecycle.actor_superadmin', 'Platform Super Admin')}</td>
                <td className="py-3.5 px-4 sm:px-6 font-mono text-[11px] text-blue-700 dark:text-blue-400 font-semibold">Verifies Creative (POST /campaigns/:id/verify)</td>
              </tr>
              <tr className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900 dark:text-white">{t('lifecycle.stage3_title', '3. Customer/Direct Payment')}</td>
                <td className="py-3.5 px-4"><span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-mono font-bold">approved</span></td>
                <td className="py-3.5 px-4"><span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-mono font-bold">paid</span></td>
                <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-zinc-200">Advertiser or Client via SMS/Email link</td>
                <td className="py-3.5 px-4 sm:px-6 font-mono text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">Payment Cleared (POST /campaigns/:id/confirm-payment)</td>
              </tr>
              <tr className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900 dark:text-white">{t('lifecycle.stage4_title', '4. Manual Start (Live)')}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-mono font-bold inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>live</span>
                  </span>
                </td>
                <td className="py-3.5 px-4"><span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-mono font-bold">paid</span></td>
                <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-zinc-200">{t('lifecycle.actor_advertiser', 'Commercial Advertiser')}</td>
                <td className="py-3.5 px-4 sm:px-6 font-mono text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">Clicks "Start Ad" (POST /campaigns/:id/start)</td>
              </tr>
              <tr className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900 dark:text-white">{t('lifecycle.stage5_title', '5. Manual Stop (Paused)')}</td>
                <td className="py-3.5 px-4"><span className="px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 text-[10px] font-mono font-bold">paused</span></td>
                <td className="py-3.5 px-4"><span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-mono font-bold">paid</span></td>
                <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-zinc-200">{t('lifecycle.actor_advertiser', 'Commercial Advertiser')}</td>
                <td className="py-3.5 px-4 sm:px-6 font-mono text-[11px] text-amber-700 dark:text-amber-400 font-semibold">Clicks "Stop Ad" (POST /campaigns/:id/stop)</td>
              </tr>
              <tr className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900 dark:text-white">{t('lifecycle.stage6_title', '6. Schedule End')}</td>
                <td className="py-3.5 px-4"><span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 text-[10px] font-mono font-bold">completed</span></td>
                <td className="py-3.5 px-4"><span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-mono font-bold">paid</span></td>
                <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-zinc-200">Automated Schedule</td>
                <td className="py-3.5 px-4 sm:px-6 font-mono text-[11px] text-slate-600 dark:text-zinc-400">End date reached; final proof-of-play generated</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default CampaignLifecycleFlow;
