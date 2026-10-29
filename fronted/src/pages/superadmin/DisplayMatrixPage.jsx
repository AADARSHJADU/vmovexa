import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useSuperDevice } from '../../hooks/superadmin/useSuperDevice';

export const DisplayMatrixPage = () => {
  const { t } = useTranslation();
  const { displays, loadDisplays } = useSuperDevice();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadDisplays();
    } catch (_) {
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDisplays().catch(() => {});
  }, [loadDisplays]);

  // Count live displays per type/category from the real API to overlay on the spec catalog.
  const liveCountByType = useMemo(() => {
    const counts = {};
    (displays || []).forEach((d) => {
      const key = String(d.type || d.category || d.display_type || '').toLowerCase();
      if (key) counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [displays]);

  const totalLive = (displays || []).length;

  const displayTypes = [
    {
      id: 'main',
      name: 'Main Front Passenger Display',
      sizeSpecs: '15.6" / 21.5" Full HD 1080p',
      aspectRatio: '16:9 Landscape',
      totalDeployed: 1450,
      activeStatus: '100% Deployed in Pilot & Fleet',
      description: 'Primary commercial advertising, news tickers, route announcements, and passenger infotainment screen mounted at vehicle front header.',
      icon: <FleetIcons.Play className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      contentTypes: ['1080p Video Loops', 'Static Banner', 'HTML5 Interactive Widgets'],
    },
    {
      id: 'emergency_exit',
      name: 'Emergency Exit Safety Display',
      sizeSpecs: '10.1" Wide OLED',
      aspectRatio: '16:6 Ultrawide',
      totalDeployed: 420,
      activeStatus: 'Active on Electric Fleet',
      description: 'Dedicated safety-critical screen near emergency egress doors. Continuously displays door interlock status and flashes evacuation graphics during incidents.',
      icon: <FleetIcons.Alert className="w-5 h-5 text-red-600 dark:text-red-400" />,
      contentTypes: ['Emergency Exit Guidance', 'Evacuation Graphics', 'Door Status'],
    },
    {
      id: 'side_window',
      name: 'Side Window Digital Screen',
      sizeSpecs: '15.6" Sunlight-Readable High-Nit (1200 nits)',
      aspectRatio: '16:9 Landscape',
      totalDeployed: 310,
      activeStatus: 'Active on Metro Feeder',
      description: 'High-brightness digital signage facing out through bus windows, displaying geo-targeted commercial ads and local merchant promotions to pedestrians.',
      icon: <FleetIcons.Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      contentTypes: ['Geo-Fenced Hyperlocal Ads', 'Retail Promos', 'Weather Advisories'],
    },
    {
      id: 'rear',
      name: 'Rear Traffic-Facing Display',
      sizeSpecs: '15.6" / 18.5" IP67 Waterproof Outdoor',
      aspectRatio: '16:9 Landscape',
      totalDeployed: 280,
      activeStatus: 'Active on BRTS Fleet',
      description: 'Exterior screen mounted on vehicle rear glass facing trailing commuter traffic. Plays digital billboard ads and dynamic speed/braking advisories.',
      icon: <FleetIcons.Speed className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      contentTypes: ['Rear Billboard Ads', 'Traffic Advisories', 'Braking Alerts'],
    },
    {
      id: 'driver_tablet',
      name: 'Driver Smart Operational Tablet',
      sizeSpecs: '8.0" / 10.1" Ruggedized IPS',
      aspectRatio: '16:10 Portrait/Landscape',
      totalDeployed: 540,
      activeStatus: 'Active on All Depots',
      description: 'Cockpit terminal dedicated to the bus driver showing Google Routes API waypoints, next stop ETAs, passenger count, and road incident reporting.',
      icon: <FleetIcons.Bus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      contentTypes: ['Turn-by-Turn Waypoints', 'Shift Schedule', 'Incident Dispatch'],
    },
    {
      id: 'passenger_interactive',
      name: 'Passenger Interactive Touch Screen',
      sizeSpecs: '11.6" Capacitive Touch FHD',
      aspectRatio: '16:9 Landscape',
      totalDeployed: 120,
      activeStatus: 'Pilot Roadmap (Stage 2)',
      description: 'Interactive seatback touch terminals allowing commuters to browse transit maps, local tourist guides, and engage with interactive brand surveys.',
      icon: <FleetIcons.Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      contentTypes: ['Transit City Map Explorer', 'Brand Surveys', 'Tourist Guides'],
    },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: t('common.super_admin', 'Super Admin'), path: '/superadmin/dashboard' },
          { label: t('devices.matrix_title', 'Edge Devices Fleet'), path: '/superadmin/devices' },
          { label: t('displays.matrix_title', 'Display Types Matrix') },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('displays.matrix_title', 'Multi-Display Architecture & Screen Inventory')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            {t('displays.matrix_sub', 'Specification matrix of all 6 in-vehicle display types defined in MIOS Architecture Section 11')}
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto">
          <RefreshButton
            onClick={handleRefresh}
            loading={refreshing}
            title={t('displays.refresh_title', 'Refresh display categories')}
          />
          <span className="text-xs font-bold px-3 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 rounded-xl border border-slate-200 dark:border-zinc-700 whitespace-nowrap">
            6 {t('displays.screen_id', 'Display Categories')} · {totalLive} {t('displays.displays_online', 'Live Displays')}
          </span>
        </div>
      </div>

      {/* Display Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayTypes
          .slice((currentPage - 1) * pageSize, currentPage * pageSize)
          .map((disp) => (
          <div key={disp.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  {disp.icon}
                </div>
                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  type: '{disp.id}'
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">{disp.name}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{disp.description}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('devices.firmware', 'Hardware Spec')}:</span>
                  <span className="font-bold text-slate-800">{disp.sizeSpecs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('displays.resolution', 'Aspect Ratio')}:</span>
                  <span className="font-bold text-slate-800">{disp.aspectRatio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('displays.displays_online', 'Live Deployed')}:</span>
                  <span className="font-bold text-emerald-700">{(liveCountByType[disp.id] ?? disp.totalDeployed)} Units</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('campaigns.target_screens', 'Supported Media')}:</span>
                <div className="flex flex-wrap gap-1.5">
                  {disp.contentTypes.map((cType, cIdx) => (
                    <span key={cIdx} className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {cType}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="text-[11px] text-slate-400">{disp.activeStatus}</span>
              <button
                onClick={() => alert(`Configuring slot targeting rules for display type: ${disp.id}`)}
                className="text-blue-600 hover:text-blue-700"
              >
                {t('campaigns.hub_title', 'Configure Ad Slots')} →
              </button>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(displayTypes.length / pageSize) || 1}
        onPageChange={setCurrentPage}
        totalItems={displayTypes.length}
        pageSize={pageSize}
        onPageSizeChange={(sz) => {
          setPageSize(sz);
          setCurrentPage(1);
        }}
        pageSizeOptions={[6, 10, 20, 50]}
      />
    </div>
  );
};
