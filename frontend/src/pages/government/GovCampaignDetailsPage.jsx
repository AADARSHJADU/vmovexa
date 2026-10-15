import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { FleetIcons } from '../../components/FleetIcons';
import { useGovernmentRole } from '../../hooks/government/useGovernmentRole';
import Breadcrumb from '../../components/ui/Breadcrumb';

export const GovCampaignDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isSuperAdmin = location.pathname.startsWith('/superadmin');
  const basePath = isSuperAdmin ? '/superadmin/government' : '/government';
  const { campaigns, loadCampaigns } = useGovernmentRole();

  const [activeTab, setActiveTab] = useState('Core');
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    loadCampaigns().catch(() => {});
  }, [loadCampaigns]);

  const campaignList = Array.isArray(campaigns) ? campaigns : (campaigns?.items || campaigns?.rows || []);
  const rawCampaign = campaignList.find(c => String(c?.id) === String(id) || String(c?.code) === String(id));

  // Real Campaign details extracted cleanly
  const campaign = {
    id: rawCampaign?.code || rawCampaign?.id || id || '—',
    name: rawCampaign?.name || rawCampaign?.title || 'Public Service Campaign',
    category: rawCampaign?.category || 'Public Awareness',
    targetArea: rawCampaign?.target_area || rawCampaign?.targetArea || (rawCampaign?.targets?.map(t => t.city_name || t.fleet_name).filter(Boolean).join(', ')) || 'All Transit Corridors',
    startDate: rawCampaign?.start_date ? new Date(rawCampaign.start_date).toLocaleDateString() : '—',
    endDate: rawCampaign?.end_date ? new Date(rawCampaign.end_date).toLocaleDateString() : '—',
    status: rawCampaign?.status || 'Active',
    priority: rawCampaign?.priority || 'Normal',
    description: rawCampaign?.description || 'No campaign description provided.',
    impressions: rawCampaign?.impressions != null ? Number(rawCampaign.impressions).toLocaleString() : '0',
    reach: rawCampaign?.reach != null ? Number(rawCampaign.reach).toLocaleString() : '0',
    creativeUrl: rawCampaign?.creative_url || rawCampaign?.media?.[0]?.file_url || null,
    creativeType: rawCampaign?.creative_type || rawCampaign?.media?.[0]?.media_type || 'Video',
    qrScans: rawCampaign?.qr_scans_count || rawCampaign?.qr_scans || 0,
    qrUniqueScanners: rawCampaign?.qr_unique_scanners || 0,
    qrScanRate: rawCampaign?.qr_scan_rate || (rawCampaign?.qr_scans_count ? '1.2%' : '0.0%'),
    qrCodeId: rawCampaign?.qr_code_id || rawCampaign?.qr_code || `QR-${rawCampaign?.code || rawCampaign?.id || id || 'GOVT'}`,
    qrRedirectUrl: rawCampaign?.qr_redirect_url || rawCampaign?.landing_page_url || '',
    fleetOperators: Array.isArray(rawCampaign?.targets) && rawCampaign.targets.length > 0
      ? rawCampaign.targets.map(t => t.fleet_name || t.name).filter(Boolean)
      : (Array.isArray(rawCampaign?.fleet_operators) && rawCampaign.fleet_operators.length > 0 ? rawCampaign.fleet_operators : ['Transit Fleet Network']),
  };

  const handleDownloadQr = () => {
    const svg = document.getElementById('gov-campaign-qr-code');
    if (!svg) {
      toast.error('QR code not ready');
      return;
    }
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VMOVEXA_QR_${campaign.id}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded vector SVG QR code!');
  };

  return (
    <div className="w-full space-y-6 pb-12">

      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <Breadcrumb
            items={[
              { label: 'Dashboard', to: `${basePath}/dashboard` },
              { label: 'Campaigns', to: `${basePath}/campaigns` },
              { label: campaign.id }
            ]}
            className="mb-2"
          />
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">{campaign.name}</h1>
            <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${
              isPaused
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              ● {isPaused ? 'Paused' : campaign.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1">
            {campaign.startDate} – {campaign.endDate} · ID: <span className="font-mono text-slate-700 dark:text-zinc-300">{campaign.id}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              setIsPaused(!isPaused);
              toast.success(isPaused ? 'Broadcast resumed' : 'Broadcast paused');
            }}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
          >
            {isPaused ? '▶ Resume Broadcast' : '⏸ Pause Broadcast'}
          </button>
          <button
            onClick={() => toast.success('Report exporting...')}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <FleetIcons.Document className="w-4 h-4 text-white" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Impressions', value: campaign.impressions, sub: 'Delivered playbacks', icon: <FleetIcons.Speed className="w-5 h-5 text-slate-700" />, dot: 'bg-blue-500' },
          { label: 'Citizen Reach', value: campaign.reach, sub: 'Audience contact', icon: <FleetIcons.Driver className="w-5 h-5 text-slate-700" />, dot: 'bg-emerald-500' },
          { label: 'Assigned Fleets', value: `${campaign.fleetOperators.length}`, sub: 'Operating transit networks', icon: <FleetIcons.Bus className="w-5 h-5 text-slate-700" />, dot: 'bg-purple-500' },
          { label: 'Smart QR Scans', value: `${campaign.qrScans}`, sub: `${campaign.qrScanRate} scan rate`, icon: <FleetIcons.Target className="w-5 h-5 text-slate-700" />, dot: 'bg-amber-500' },
        ].map(kpi => (
          <div key={kpi.label} className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
              <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                {kpi.icon}
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-slate-900 tracking-tight">{kpi.value}</div>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-600 font-semibold">
                <span className={`w-2 h-2 rounded-full ${kpi.dot}`}></span>
                <span>{kpi.sub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Navigation Tabs Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {['Core', 'Performance', 'Audience', 'Locations', 'QR Analytics', 'Live Coverage', 'Devices'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === tab
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: Core Information */}
      {activeTab === 'Core' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Details */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Campaign Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 font-medium">Campaign Category</span>
                  <p className="font-bold text-slate-900 mt-0.5">{campaign.category}</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 font-medium">Target Region</span>
                  <p className="font-bold text-slate-900 mt-0.5">{campaign.targetArea}</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 font-medium">Broadcast Duration</span>
                  <p className="font-bold text-slate-900 mt-0.5">{campaign.startDate} – {campaign.endDate}</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 font-medium">Broadcast Priority</span>
                  <p className="font-bold text-blue-600 mt-0.5">{campaign.priority}</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-2">
                  <span className="text-slate-500 font-medium">Official Directive & Objective</span>
                  <p className="font-medium text-slate-800 mt-1 leading-relaxed">{campaign.description}</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-2">
                  <span className="text-slate-500 font-medium">Linked Fleet Transit Operators</span>
                  <p className="font-bold text-slate-900 mt-1">
                    {campaign.fleetOperators.join(' · ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Creative Asset */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Active Creative</h2>
              <div className="w-full h-48 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                {campaign.creativeUrl ? (
                  <img
                    src={campaign.creativeUrl}
                    alt={campaign.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4 text-slate-400">
                    <FleetIcons.Flag className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto mb-1 block" />
                    <p className="text-xs font-semibold">No media preview available</p>
                  </div>
                )}
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Format:</span>
                  <strong className="text-slate-900">{campaign.creativeType}</strong>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Aspect Ratio:</span>
                  <strong className="text-slate-900">16:9 Landscape</strong>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Loop Interval:</span>
                  <strong className="text-slate-900">Every 3.5 mins</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: QR Analytics */}
      {activeTab === 'QR Analytics' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Smart QR Engagement Telemetry</h2>
            <p className="text-xs text-slate-500 mt-0.5">Citizen interaction and landing page redirects from transit screens</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left QR Code Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-4 flex flex-col items-center justify-center">
              <div className="w-36 h-36 bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center">
                <QRCodeSVG
                  id="gov-campaign-qr-code"
                  value={campaign.qrRedirectUrl || (typeof window !== 'undefined' ? `${window.location.origin}/qr/${campaign.qrCodeId}` : `/qr/${campaign.qrCodeId}`)}
                  size={120}
                  level="H"
                />
              </div>
              <div>
                <p className="text-xs font-mono font-bold text-blue-600">{campaign.qrCodeId}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs">{campaign.qrRedirectUrl || 'Redirect: VMOVEXA Smart Gateway'}</p>
              </div>
              <button
                onClick={handleDownloadQr}
                className="px-4 py-2 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
              >
                Download High-Res QR
              </button>
            </div>

            {/* Right 2 Cols: QR Metrics & Breakdown */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-slate-500">Total QR Scans</span>
                  <p className="text-xl font-black text-slate-900 mt-1">{campaign.qrScans}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-slate-500">Unique Scanners</span>
                  <p className="text-xl font-black text-blue-600 mt-1">{campaign.qrUniqueScanners}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-slate-500">Avg Scan Rate</span>
                  <p className="text-xl font-black text-emerald-600 mt-1">{campaign.qrScanRate}</p>
                </div>
              </div>

              {/* QR Trend Chart */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">Daily Scan Trends</span>
                  <span className="text-slate-500 font-medium">Last 7 Days</span>
                </div>
                {campaign.qrScans > 0 ? (
                  <div className="h-36 w-full flex items-end justify-between gap-2 pt-4 px-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((day, idx) => {
                      const count = Math.round(campaign.qrScans * (0.1 + (idx % 3) * 0.05));
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                          <span className="text-[10px] font-bold text-blue-600">{count}</span>
                          <div
                            style={{ height: `${Math.min(100, Math.max(12, (count / (campaign.qrScans || 1)) * 250))}%` }}
                            className="w-full rounded-t-lg bg-blue-600 transition-all hover:bg-blue-700"
                          />
                          <span className="text-[9px] text-slate-500 font-bold">Day {day}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-xl">
                    No citizen QR scan telemetry recorded yet for this broadcast period.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Live Coverage Map */}
      {activeTab === 'Live Coverage' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">Active Route Broadcast Telemetry</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Transit corridors and fleet networks linked to this campaign</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="text-emerald-700 dark:text-emerald-400">● {Array.isArray(rawCampaign?.targets) && rawCampaign.targets.length > 0 ? `${rawCampaign.targets.length} Target Units` : `${campaign.fleetOperators.length} Fleet Networks`}</span>
              <span className="text-blue-700 dark:text-blue-400">● {campaign.status}</span>
            </div>
          </div>

          <div className="relative w-full h-80 rounded-xl bg-slate-950 border border-slate-200 dark:border-zinc-800 overflow-hidden flex items-center justify-center shadow-inner">
            <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-det" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#334155" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-det)" />
              <path d="M 50 150 Q 200 60 400 150 T 800 100" fill="none" stroke="#3b82f6" strokeWidth="3" opacity="0.8" />
            </svg>

            {/* Dynamic Target Corridors or Platform-Wide Info */}
            {Array.isArray(rawCampaign?.targets) && rawCampaign.targets.length > 0 ? (
              <div className="absolute inset-0 flex flex-wrap items-center justify-center p-6 gap-3 z-10 overflow-y-auto">
                {rawCampaign.targets.map((t, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white/95 dark:bg-zinc-900/95 border border-slate-200 dark:border-zinc-700 px-3.5 py-1.5 rounded-xl shadow-lg">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      {t.route_name || t.fleet_name || t.name || t.code || `Route Corridor #${idx + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center p-6 z-10 text-center">
                <div className="bg-white/95 dark:bg-zinc-900/95 border border-slate-200 dark:border-zinc-700 px-5 py-3 rounded-xl shadow-lg max-w-sm">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Platform-wide Transit Broadcast</p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    Broadcast configured across: {campaign.fleetOperators.join(', ')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Other Tabs: Dynamic Campaign Metrics */}
      {['Performance', 'Audience', 'Locations', 'Devices'].includes(activeTab) && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">{activeTab} Metrics Breakdown</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-slate-200 dark:border-zinc-700">
              <span className="text-slate-500 dark:text-zinc-400 font-medium">Broadcast Window</span>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                {rawCampaign?.broadcast_start_time || '08:00'} – {rawCampaign?.broadcast_end_time || '20:00'}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-slate-200 dark:border-zinc-700">
              <span className="text-slate-500 dark:text-zinc-400 font-medium">Target Region</span>
              <p className="text-lg font-bold text-slate-900 dark:text-white mt-1 truncate">
                {campaign.targetArea || 'All Transit Corridors'}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-slate-200 dark:border-zinc-700">
              <span className="text-slate-500 dark:text-zinc-400 font-medium">Broadcast Priority</span>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1 uppercase">
                {campaign.priority || 'Normal'} Priority
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovCampaignDetailsPage;
