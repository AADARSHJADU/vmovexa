import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNotificationLogs } from '../../hooks/useNotificationLogs';
import { Pagination } from '../../components/ui/Pagination';
import { FleetIcons } from '../../components/FleetIcons';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import toast from 'react-hot-toast';

export const NotificationDeliveryLogsPage = () => {
  const { t } = useTranslation();
  const { logs, pagination, stats, loading, isLiveConnected, fetchLogs, fetchStats, retryLog } = useNotificationLogs();

  const [channel, setChannel] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedErrorLog, setSelectedErrorLog] = useState(null);

  useEffect(() => {
    fetchLogs({ page: 1, limit: 10, channel, status, search });
    fetchStats();
  }, [channel, status, search, fetchLogs, fetchStats]);

  // Periodic background telemetry stats refresh
  useEffect(() => {
    const timer = setInterval(() => {
      fetchStats();
    }, 25000);
    return () => clearInterval(timer);
  }, [fetchStats]);

  const handlePageChange = (page) => {
    fetchLogs({ page, limit: pagination.pageSize, channel, status, search });
  };

  const handlePageSizeChange = (pageSize) => {
    fetchLogs({ page: 1, limit: pageSize, channel, status, search });
  };

  const handleRetry = async (logId) => {
    const tid = toast.loading('Retrying notification dispatch...');
    try {
      await retryLog(logId);
      toast.dismiss(tid);
      toast.success('Notification retry dispatched successfully!');
      fetchLogs({ page: pagination.currentPage, limit: pagination.pageSize, channel, status, search });
      fetchStats();
    } catch (err) {
      toast.dismiss(tid);
      toast.error(err?.message || 'Failed to retry notification.');
    }
  };

  const getChannelBadge = (ch) => {
    switch (ch) {
      case 'email':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"><FleetIcons.Mail className="w-3 h-3" />{t('common.channel_email', 'Email')}</span>;
      case 'sms':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300"><FleetIcons.Phone className="w-3 h-3" />{t('common.channel_sms', 'SMS')}</span>;
      case 'push':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"><FleetIcons.Bell className="w-3 h-3" />{t('common.channel_push', 'Push')}</span>;
      case 'whatsapp':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"><FleetIcons.Chat className="w-3 h-3" />{t('common.channel_whatsapp', 'WhatsApp')}</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"><FleetIcons.Terminal className="w-3 h-3" />{t('common.channel_in_app', 'In-App')}</span>;
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'delivered':
      case 'sent':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">{t('common.status_delivered', 'Delivered')}</span>;
      case 'failed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">{t('common.status_failed', 'Failed')}</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">{t('common.status_rejected', 'Rejected')}</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">{t('common.status_pending', 'Pending')}</span>;
    }
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-200">
      {/* Standard Reusable Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'SuperAdmin', path: '/superadmin/dashboard' },
          { label: t('common.settings', 'Settings'), path: '/superadmin/settings' },
          { label: t('superadmin.notification_logs.title', 'Notification Delivery Logs') },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 pb-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('superadmin.notification_logs.title', 'Notification Delivery Logs')}
            </h1>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{t('superadmin.notification_logs.live_stream', 'LIVE STREAM')}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            {t('superadmin.notification_logs.subtitle', 'SuperAdmin real-time telemetry console for Email, SMS, Push, WhatsApp & In-App delivery.')}
          </p>
        </div>
        <RefreshButton
          onClick={() => {
            fetchLogs({ page: 1, limit: pagination.pageSize, channel, status, search });
            fetchStats();
            toast.success('Logs refreshed!');
          }}
          loading={loading}
          label={t('superadmin.notification_logs.refresh_telemetry', 'Refresh Telemetry')}
        />
      </div>

      {/* Metrics Cards — Compact */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('superadmin.notification_logs.total_dispatched', 'Total Dispatched')}</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.total || 0}</span>
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">{t('superadmin.notification_logs.vol_100', '100% Vol')}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('superadmin.notification_logs.success_rate', 'Success Rate')}</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.deliveryRate || 100}%</span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{stats.delivered || 0} {t('superadmin.notification_logs.delivered_count_suffix', 'Delivered')}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('superadmin.notification_logs.failed_attempts', 'Failed Attempts')}</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{stats.failed || 0}</span>
            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">{t('superadmin.notification_logs.errors_suffix', 'Errors')}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('superadmin.notification_logs.rejected_skipped', 'Rejected / Skipped')}</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.rejected || 0}</span>
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">{t('superadmin.notification_logs.opt_outs', 'Opt-outs')}</span>
          </div>
        </div>
      </div>

      {/* Filters & Control Bar */}
      <div className="bg-white dark:bg-zinc-900 p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'delivered', 'failed', 'rejected', 'pending'].map((st) => (
            <button
              key={st}
              onClick={() => setStatus(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                status === st
                  ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Channel & Search */}
        <div className="flex items-center gap-2">
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="ALL">{t('superadmin.notification_logs.all_channels', 'All Channels')}</option>
            <option value="email">{t('common.channel_email', 'Email')}</option>
            <option value="sms">{t('common.channel_sms', 'SMS')}</option>
            <option value="push">{t('superadmin.notification_logs.ch_push', 'Push (FCM)')}</option>
            <option value="whatsapp">{t('common.channel_whatsapp', 'WhatsApp')}</option>
            <option value="in_app">{t('common.channel_in_app', 'In-App')}</option>
          </select>

          <input
            type="text"
            placeholder={t('superadmin.notification_logs.search_ph', 'Search recipient or title...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 w-44 sm:w-60"
          />
        </div>
      </div>

      {/* Logs Table — Compact & Full Width */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 dark:text-zinc-400 animate-pulse font-semibold text-xs">
            {t('superadmin.notification_logs.loading', 'Loading notification delivery telemetry...')}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 dark:text-zinc-500">
              <FleetIcons.Inbox className="w-6 h-6" />
            </div>
            <p className="text-slate-900 dark:text-white font-bold text-sm">{t('superadmin.notification_logs.no_logs_found', 'No delivery logs found')}</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              {t('superadmin.notification_logs.adjust_filters', 'Try adjusting your channel or status filters.')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full min-w-[700px] text-left text-xs text-slate-600 dark:text-zinc-400">
              <thead className="bg-slate-50 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 font-bold border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="px-3.5 py-2.5">{t('superadmin.notification_logs.th_recipient', 'Recipient')}</th>
                  <th className="px-3.5 py-2.5">{t('superadmin.notification_logs.th_channel', 'Channel')}</th>
                  <th className="px-3.5 py-2.5">{t('superadmin.notification_logs.th_event_title', 'Event Key & Title')}</th>
                  <th className="px-3.5 py-2.5">{t('common.status', 'Status')}</th>
                  <th className="px-3.5 py-2.5">{t('superadmin.notification_logs.th_provider_trace', 'Provider / Trace')}</th>
                  <th className="px-3.5 py-2.5">{t('common.time', 'Time')}</th>
                  <th className="px-3.5 py-2.5 text-right">{t('common.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className={`transition-colors duration-700 ${
                      log.isRealtimeNew
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border-l-4 border-l-blue-600'
                        : 'hover:bg-slate-50/50 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    <td className="px-3.5 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white">{log.recipient}</span>
                        {log.isRealtimeNew && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-blue-600 text-white uppercase tracking-wider animate-pulse">
                            NEW
                          </span>
                        )}
                      </div>
                      {log.user && (
                        <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                          {log.user.name} (ID: #{log.user.id})
                        </div>
                      )}
                    </td>

                    <td className="px-3.5 py-2.5 whitespace-nowrap">{getChannelBadge(log.channel)}</td>

                    <td className="px-3.5 py-2.5">
                      <div className="font-semibold text-slate-900 dark:text-white">{log.title}</div>
                      {log.event_key && (
                        <span className="inline-block mt-0.5 text-[10px] font-mono px-1 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                          {log.event_key}
                        </span>
                      )}
                    </td>

                    <td className="px-3.5 py-2.5 whitespace-nowrap">{getStatusBadge(log.status)}</td>

                    <td className="px-3.5 py-2.5">
                      <div className="text-slate-800 dark:text-zinc-200 font-semibold">{log.provider || 'system'}</div>
                      {log.error_message ? (
                        <button
                          onClick={() => setSelectedErrorLog(log)}
                          className="text-[10px] text-rose-600 dark:text-rose-400 underline font-semibold mt-0.5 cursor-pointer block"
                        >
                          Error: {log.error_code || 'Trace'}
                        </button>
                      ) : log.provider_message_id ? (
                        <div className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 truncate max-w-[150px]">
                          ID: {log.provider_message_id}
                        </div>
                      ) : null}
                    </td>

                    <td className="px-3.5 py-2.5 whitespace-nowrap text-slate-500 dark:text-zinc-400 text-[11px]">
                      {new Date(log.created_at || log.createdAt).toLocaleString()}
                    </td>

                    <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                      {log.status === 'failed' ? (
                        <button
                          onClick={() => handleRetry(log.id)}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-xs transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <FleetIcons.Refresh className="w-3 h-3" />
                          <span>{t('common.retry', 'Retry')}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 dark:text-zinc-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Global Pagination Component */}
        <div className="px-3 py-1 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            pageSize={pagination.pageSize}
            pageSizeOptions={[10, 20, 50, 100]}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      </div>

      {/* Error Details Modal */}
      {selectedErrorLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FleetIcons.Alert className="w-5 h-5 text-amber-500" />
                <span>{t('superadmin.notification_logs.provider_error_details', 'Provider Error Details')}</span>
              </h3>
              <button
                onClick={() => setSelectedErrorLog(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-500 dark:text-zinc-400">{t('superadmin.notification_logs.recipient_label', 'Recipient:')}</span>{' '}
                <span className="font-bold text-slate-900 dark:text-white">{selectedErrorLog.recipient}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 dark:text-zinc-400">{t('superadmin.notification_logs.channel_provider_label', 'Channel / Provider:')}</span>{' '}
                <span className="font-bold text-slate-900 dark:text-white">{selectedErrorLog.channel} ({selectedErrorLog.provider})</span>
              </div>
              {selectedErrorLog.error_code && (
                <div>
                  <span className="font-bold text-slate-500 dark:text-zinc-400">{t('superadmin.notification_logs.error_code_label', 'Error Code:')}</span>{' '}
                  <span className="font-bold text-rose-600 dark:text-rose-400">{selectedErrorLog.error_code}</span>
                </div>
              )}

              <div>
                <span className="font-bold text-slate-500 dark:text-zinc-400">{t('superadmin.notification_logs.error_trace_label', 'Full Error Trace:')}</span>
                <div className="mt-1.5 p-3 rounded-xl bg-slate-950 text-rose-400 font-mono text-[11px] overflow-x-auto border border-rose-900/40">
                  {selectedErrorLog.error_message || 'Unknown provider error'}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedErrorLog(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 cursor-pointer"
              >{t('common.close', 'Close')}</button>
              <button
                onClick={() => {
                  const id = selectedErrorLog.id;
                  setSelectedErrorLog(null);
                  handleRetry(id);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              >
                {t('superadmin.notification_logs.retry_now', 'Retry Notification Now')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDeliveryLogsPage;
