import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useAdminReport } from '../../hooks/admin/useAdminReport';
import { useAdminDashboard } from '../../hooks/admin/useAdminDashboard';
import { useAuth } from '../../hooks/useAuth';

export const AdminReportsPage = () => {
  const { user } = useAuth();
  const { loadReports, generateReport } = useAdminReport();
  const { loadKpis } = useAdminDashboard();
  const orgName = user?.organization?.name || user?.org?.name || '';

  useEffect(() => {
    loadReports().catch(() => {});
    loadKpis().catch(() => {});
  }, [loadReports, loadKpis]);

  const handleGenerate = async (rep) => {
    try {
      await toast.promise(generateReport({ type: rep.type, title: rep.title }), {
        loading: 'Generating report...',
        success: 'Report generated',
        error: (err) => err?.message || 'Failed to generate report',
      });
      await loadReports().catch(() => {});
    } catch {
      /* handled by toast */
    }
  };

  const reports = [
    { type: 'punctuality', title: 'Daily Schedule Adherence & Punctuality', desc: 'On-time departure vs arrival delay analysis across all depots', format: 'PDF / Excel', lastGen: '—' },
    { type: 'driver_safety', title: 'Driver Shift Compliance & Safety Scorecard', desc: 'Rash driving, harsh braking, speed violations, and attendance', format: 'PDF / Excel', lastGen: '—' },
    { type: 'fleet_efficiency', title: 'Fleet Fuel Economy & EV Battery Efficiency', desc: 'Kilowatt-hour / Diesel consumption per bus kilometer', format: 'PDF / Excel', lastGen: '—' },
    { type: 'proof_of_play', title: 'Digital Screen Playback & Ad Proof of Play', desc: 'Audit log of verified campaign impressions delivered on screens', format: 'PDF / CSV', lastGen: '—' },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'Tenant Admin', path: '/admin/dashboard' },
              { label: 'Reports & Intelligence' },
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Tenant Operational Reports & Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Download verified operational logs, punctuality metrics, and fleet efficiency digests for {orgName || 'your organization'}
          </p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((rep, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <FleetIcons.Document className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  {rep.format}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{rep.title}</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">{rep.desc}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400">Generated: {rep.lastGen}</span>
              <button
                onClick={() => handleGenerate(rep)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all w-full sm:w-auto text-center"
              >
                Generate Report ↓
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
