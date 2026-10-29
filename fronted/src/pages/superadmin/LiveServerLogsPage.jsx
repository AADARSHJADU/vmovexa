import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useSystemLogs } from '../../hooks/useSystemLogs';
import { FleetIcons } from '../../components/FleetIcons';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import toast from 'react-hot-toast';

export const LiveServerLogsPage = () => {
  const { t } = useTranslation();
  const {
    serverStatus = {},
    liveLogs = [],
    loading,
    triggerLoading,
    deleteLoading,
    diskLogsData = {},
    diskLogsLoading,
    activeLogPreview,
    previewLoading,
    diskActionLoading,
    fetchServerStatus,
    fetchLiveLogs,
    triggerCronJob,
    deleteLiveLogs,
    fetchDiskLogs,
    readDiskLogFile,
    deleteDiskLogs,
    closeLogPreview,
    resetLogs,
  } = useSystemLogs();

  // Tab State: 'live' or 'disk'
  const [activeTab, setActiveTab] = useState('live');

  // Live Stream & Filter States
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [isLive, setIsLive] = useState(false);
  const [autoScrollTerminal, setAutoScrollTerminal] = useState(true);
  const [selectedLogIds, setSelectedLogIds] = useState(new Set());
  const terminalContainerRef = useRef(null);
  const isUserScrolledUp = useRef(false);

  // Disk Logs Management States
  const [selectedDiskFiles, setSelectedDiskFiles] = useState(new Set());
  const [expandedFolders, setExpandedFolders] = useState(new Set(['combined', 'error', 'http', 'cron']));
  const [previewSearch, setPreviewSearch] = useState('');
  const [diskFolderFilter, setDiskFolderFilter] = useState('ALL');

  // Initial fetch on mount
  useEffect(() => {
    fetchServerStatus();
    fetchLiveLogs({ channel: channelFilter, level: levelFilter, limit: 150 });
    fetchDiskLogs();
  }, [fetchServerStatus, fetchLiveLogs, fetchDiskLogs]);

  // Filter change
  useEffect(() => {
    fetchLiveLogs({ channel: channelFilter, level: levelFilter, limit: 150 });
  }, [channelFilter, levelFilter, fetchLiveLogs]);

  // Live streaming interval
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      if (document.hidden) return;
      fetchServerStatus();
      fetchLiveLogs({ channel: channelFilter, level: levelFilter, limit: 150 });
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive, channelFilter, levelFilter, fetchServerStatus, fetchLiveLogs]);

  // Track terminal scrolling
  const handleTerminalScroll = () => {
    if (!terminalContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = terminalContainerRef.current;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    isUserScrolledUp.current = distanceFromBottom > 40;
  };

  // Scroll terminal container
  useEffect(() => {
    if (!autoScrollTerminal || isUserScrolledUp.current) return;
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [liveLogs, autoScrollTerminal]);

  const handleManualCron = async (jobKey, jobName) => {
    const tid = toast.loading(`Running '${jobName}'...`);
    try {
      const res = await triggerCronJob(jobKey);
      toast.dismiss(tid);
      toast.success(res?.result?.message || `'${jobName}' completed!`);
      fetchServerStatus();
      fetchLiveLogs({ channel: channelFilter, level: levelFilter, limit: 150 });
    } catch (err) {
      toast.dismiss(tid);
      toast.error(err?.message || 'Task failed to run.');
    }
  };

  const logsList = Array.isArray(liveLogs) ? liveLogs : [];

  const handleToggleSelect = (id) => {
    setSelectedLogIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedLogIds.size === logsList.length && logsList.length > 0) {
      setSelectedLogIds(new Set());
    } else {
      setSelectedLogIds(new Set(logsList.map((l) => l.id)));
    }
  };

  const handleDeselectAll = () => {
    setSelectedLogIds(new Set());
  };

  const handleDeleteSingle = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await deleteLiveLogs({ ids: [id] });
      setSelectedLogIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.success('Log deleted');
    } catch (err) {
      toast.error(err?.message || 'Failed to delete');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedLogIds.size === 0) return;
    const ids = Array.from(selectedLogIds);
    const count = ids.length;
    const tid = toast.loading(`Deleting ${count} log(s)...`);
    try {
      await deleteLiveLogs({ ids });
      setSelectedLogIds(new Set());
      toast.dismiss(tid);
      toast.success(`Deleted ${count} log(s)`);
    } catch (err) {
      toast.dismiss(tid);
      toast.error(err?.message || 'Failed to delete');
    }
  };

  const handleClearAllLogs = async () => {
    if (logsList.length === 0) return;
    if (!window.confirm('Clear all logs from the live console?')) return;
    const tid = toast.loading('Clearing...');
    try {
      await deleteLiveLogs({ all: true });
      setSelectedLogIds(new Set());
      toast.dismiss(tid);
      toast.success('Live console cleared');
    } catch (err) {
      toast.dismiss(tid);
      toast.error(err?.message || 'Failed to clear');
    }
  };

  // Disk log functions
  const toggleFolderExpand = (folderName) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderName)) next.delete(folderName);
      else next.add(folderName);
      return next;
    });
  };

  const handleViewDiskLog = async (channel, filename) => {
    const tid = toast.loading(`Loading ${filename}...`);
    try {
      await readDiskLogFile({ channel, filename, lines: 300 });
      toast.dismiss(tid);
    } catch (err) {
      toast.dismiss(tid);
      toast.error(err?.message || 'Failed to read log file');
    }
  };

  const handleDeleteSingleDiskFile = async (channel, filename, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Delete '${filename}' from '${channel}'?`)) return;
    const tid = toast.loading(`Deleting ${filename}...`);
    try {
      await deleteDiskLogs({ channel, filename });
      setSelectedDiskFiles((prev) => {
        const next = new Set(prev);
        next.delete(`${channel}/${filename}`);
        return next;
      });
      if (activeLogPreview?.filename === filename) {
        closeLogPreview();
      }
      toast.dismiss(tid);
      toast.success(`File deleted`);
    } catch (err) {
      toast.dismiss(tid);
      toast.error(err?.message || 'Failed to delete');
    }
  };

  const handlePurgeFolderSamet = async (channel, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Delete all log files inside '${channel}' folder?`)) return;
    const tid = toast.loading(`Clearing '${channel}'...`);
    try {
      await deleteDiskLogs({ channel, folderAll: true });
      setSelectedDiskFiles((prev) => {
        const next = new Set();
        for (const item of prev) {
          if (!item.startsWith(`${channel}/`)) next.add(item);
        }
        return next;
      });
      if (activeLogPreview?.channel === channel) {
        closeLogPreview();
      }
      toast.dismiss(tid);
      toast.success(`Folder '${channel}' cleared!`);
    } catch (err) {
      toast.dismiss(tid);
      toast.error(err?.message || 'Failed to clear folder');
    }
  };

  const handlePurgeAllFoldersSamet = async () => {
    if (!window.confirm('Delete ALL log files from ALL folders on the server?')) return;
    const tid = toast.loading('Clearing all log files from disk...');
    try {
      await deleteDiskLogs({ purgeAll: true });
      setSelectedDiskFiles(new Set());
      closeLogPreview();
      toast.dismiss(tid);
      toast.success('All log files deleted from server!');
    } catch (err) {
      toast.dismiss(tid);
      toast.error(err?.message || 'Failed to delete all');
    }
  };

  const handleToggleDiskFileSelect = (channel, filename) => {
    const key = `${channel}/${filename}`;
    setSelectedDiskFiles((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleDeleteSelectedDiskFiles = async () => {
    if (selectedDiskFiles.size === 0) return;
    const count = selectedDiskFiles.size;
    if (!window.confirm(`Delete ${count} selected log file(s)?`)) return;

    const tid = toast.loading(`Deleting ${count} file(s)...`);
    try {
      const byChannel = {};
      for (const item of selectedDiskFiles) {
        const [ch, fn] = item.split('/');
        if (!byChannel[ch]) byChannel[ch] = [];
        byChannel[ch].push(fn);
      }

      for (const [ch, files] of Object.entries(byChannel)) {
        await deleteDiskLogs({ channel: ch, filenames: files });
      }

      setSelectedDiskFiles(new Set());
      toast.dismiss(tid);
      toast.success(`Deleted ${count} file(s)`);
    } catch (err) {
      toast.dismiss(tid);
      toast.error(err?.message || 'Failed to delete');
    }
  };

  const handleDownloadLogFile = (logData) => {
    if (!logData || !logData.rawText) return;
    const blob = new Blob([logData.rawText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = logData.filename || 'server.log';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${logData.filename}`);
  };

  const handleCopyLogContent = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getLogColor = (level, channel) => {
    if (level === 'error' || channel === 'error') return 'text-rose-400 font-bold';
    if (level === 'warn') return 'text-amber-400 font-semibold';
    if (channel === 'cron') return 'text-purple-400 font-semibold';
    if (channel === 'notification') return 'text-cyan-400';
    if (channel === 'http') return 'text-blue-400';
    if (channel === 'mqtt') return 'text-emerald-400';
    return 'text-zinc-200';
  };

  const getChannelBadgeColor = (channel) => {
    switch (channel) {
      case 'error':
        return 'bg-rose-500/15 text-rose-500 border-rose-500/30';
      case 'cron':
        return 'bg-purple-500/15 text-purple-500 border-purple-500/30';
      case 'http':
        return 'bg-blue-500/15 text-blue-500 border-blue-500/30';
      case 'mqtt':
        return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30';
      case 'notification':
        return 'bg-cyan-500/15 text-cyan-500 border-cyan-500/30';
      case 'success':
        return 'bg-teal-500/15 text-teal-500 border-teal-500/30';
      default:
        return 'bg-zinc-700/20 text-zinc-400 border-zinc-700';
    }
  };

  const allSelected = logsList.length > 0 && selectedLogIds.size === logsList.length;

  const diskFolders = useMemo(() => {
    const folders = diskLogsData?.folders || [];
    if (diskFolderFilter === 'ALL') return folders;
    return folders.filter((f) => f.channel.toLowerCase() === diskFolderFilter.toLowerCase());
  }, [diskLogsData, diskFolderFilter]);

  const filteredPreviewEntries = useMemo(() => {
    if (!activeLogPreview?.entries) return [];
    if (!previewSearch.trim()) return activeLogPreview.entries;
    const query = previewSearch.toLowerCase();
    return activeLogPreview.entries.filter(
      (e) =>
        e.message?.toLowerCase().includes(query) ||
        e.raw?.toLowerCase().includes(query) ||
        e.level?.toLowerCase().includes(query)
    );
  }, [activeLogPreview, previewSearch]);

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Super Admin', path: '/superadmin/dashboard' },
          { label: t('superadmin.server_logs.title', 'Server Logs & Status') },
        ]}
      />

      {/* Header - Fully Mobile Responsive with Simple Wording */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <FleetIcons.Terminal className="w-6 h-6 text-slate-700 dark:text-zinc-300" />
              <span>{t('superadmin.server_logs.title', 'Server Logs & Status')}</span>
            </h1>
            {isLive && (
              <span className="flex h-2.5 w-2.5 relative" title={t('superadmin.server_logs.live_stream_active', 'Live stream active')}>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
            {t('superadmin.server_logs.subtitle', 'Monitor live server activity and manage saved log files.')}
          </p>
        </div>

        {/* Action Buttons - Horizontal & Touch Friendly */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {activeTab === 'live' ? (
            <>
              <button
                type="button"
                onClick={() => {
                  const next = !isLive;
                  setIsLive(next);
                  if (next) toast.success('Live stream started');
                  else toast('Live stream paused');
                }}
                className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[38px] ${
                  isLive
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white font-black'
                }`}
              >
                {isLive ? (
                  <span className="flex items-center gap-1.5"><FleetIcons.Pause className="w-3.5 h-3.5" />{t('common.pause', 'Pause')}</span>
                ) : (
                  <span className="flex items-center gap-1.5"><FleetIcons.Play className="w-3.5 h-3.5" />{t('superadmin.server_logs.live_stream', 'Live Stream')}</span>
                )}
              </button>

              <RefreshButton
                onClick={() => {
                  fetchServerStatus();
                  fetchLiveLogs({ channel: channelFilter, level: levelFilter, limit: 150 });
                  toast.success('Refreshed');
                }}
                loading={loading}
              />
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handlePurgeAllFoldersSamet}
                disabled={diskActionLoading || (diskLogsData?.totalFilesCount || 0) === 0}
                className="flex-1 sm:flex-none px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 min-h-[38px]"
                title={t('superadmin.server_logs.delete_all_files_title', 'Delete all log files')}
              >
                <span className="flex items-center gap-1.5"><FleetIcons.Trash className="w-3.5 h-3.5" />{t('common.delete_all', 'Delete All')}</span>
              </button>

              <RefreshButton
                onClick={() => {
                  fetchDiskLogs();
                  toast.success('Refreshed');
                }}
                loading={diskLogsLoading}
              />
            </>
          )}
        </div>
      </div>

      {/* Main Tabs Switcher - 2 Clean Buttons, Mobile Friendly */}
      <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveTab('live')}
          className={`py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 cursor-pointer ${
            activeTab === 'live'
              ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/60 dark:border-zinc-700'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <FleetIcons.Terminal className="w-4 h-4" />
            <span>{t('superadmin.server_logs.live_console', 'Live Console')}</span>
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-mono">
            {logsList.length} {t('superadmin.server_logs.logs_count_suffix', 'logs')}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('disk');
            fetchDiskLogs();
          }}
          className={`py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 cursor-pointer ${
            activeTab === 'disk'
              ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/60 dark:border-zinc-700'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <FleetIcons.Folder className="w-4 h-4" />
            <span>{t('superadmin.server_logs.saved_logs', 'Saved Logs')}</span>
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-mono font-bold truncate max-w-[130px]">
            {diskLogsData?.totalStorageFormatted || '0 B'}
          </span>
        </button>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* TAB 1: LIVE CONSOLE & METRICS */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'live' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Server Status Cards - Mobile Responsive Grid, Fixed PID Overlap */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {/* Status Card */}
            <div className="bg-white dark:bg-zinc-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-zinc-400">{t('superadmin.server_logs.server_status', 'Server Status')}</p>
              <div className="mt-2">
                <div className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="text-base sm:text-lg">●</span>
                  <span>{serverStatus?.status || 'ONLINE'}</span>
                </div>
                <div className="text-[10px] sm:text-xs font-mono text-slate-400 dark:text-zinc-500 mt-0.5">
                  PID: {serverStatus?.pid ?? 0} ({serverStatus?.nodeVersion || 'v20'})
                </div>
              </div>
            </div>

            {/* Uptime Card */}
            <div className="bg-white dark:bg-zinc-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-zinc-400">{t('superadmin.server_logs.uptime', 'Uptime')}</p>
              <div className="mt-2">
                <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white truncate">
                  {serverStatus?.uptimeFormatted || '0s'}
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                  {t('superadmin.server_logs.process_running', 'Process Running')}
                </div>
              </div>
            </div>

            {/* Memory Card */}
            <div className="bg-white dark:bg-zinc-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-zinc-400">{t('superadmin.server_logs.memory', 'Memory')}</p>
                <span className="text-[10px] sm:text-xs font-bold text-purple-600 dark:text-purple-400">
                  {serverStatus?.memory?.heapUsagePct || 0}%
                </span>
              </div>
              <div className="mt-2 space-y-1.5">
                <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  {serverStatus?.memory?.heapUsedMb || 0} / {serverStatus?.memory?.heapTotalMb || 0} MB
                </div>
                <div className="w-full h-1.5 sm:h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 dark:bg-purple-500 transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(0, parseFloat(serverStatus?.memory?.heapUsagePct || 0) || 0))}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Cron Tasks Card */}
            <div className="bg-white dark:bg-zinc-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-zinc-400">{t('superadmin.server_logs.cron_tasks', 'Cron Tasks')}</p>
              <div className="mt-2">
                <div className="text-lg sm:text-2xl font-black text-purple-600 dark:text-purple-400">
                  {serverStatus?.cronJobs?.length || 4} {t('superadmin.server_logs.tasks_suffix', 'Tasks')}
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {t('superadmin.server_logs.scheduler_active', 'Scheduler Active')}
                </div>
              </div>
            </div>
          </div>

          {/* Cron Trigger Panel - Simple Clean Cards */}
          <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-3">
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <FleetIcons.Zap className="w-4 h-4 text-amber-500" />
                <span>{t('superadmin.server_logs.bg_cron_tasks', 'Background Cron Tasks')}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                {t('superadmin.server_logs.cron_desc', 'Click Run Now to execute any task immediately.')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {(serverStatus?.cronJobs || []).map((job) => (
                <div
                  key={job.key}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-700/60 flex flex-col justify-between space-y-2.5"
                >
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40">
                      {job.interval}
                    </span>
                    <p className="text-xs font-bold text-slate-900 dark:text-white mt-1.5 truncate">
                      {job.name}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleManualCron(job.key, job.name)}
                    disabled={triggerLoading}
                    className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all cursor-pointer disabled:opacity-50 min-h-[34px]"
                  >{t('superadmin.server_logs.run_now', 'Run Now')}</button>
                </div>
              ))}
            </div>
          </div>

          {/* Live Terminal Console */}
          <div className="bg-slate-950 rounded-2xl border border-zinc-800 shadow-xl overflow-hidden flex flex-col">
            {/* Top Control Bar - Responsive */}
            <div className="bg-zinc-900/90 px-3 py-2.5 sm:px-4 sm:py-3 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="font-mono text-xs font-bold text-zinc-300 ml-1">
                  {t('superadmin.server_logs.console_output', 'Console Output')}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                  {logsList.length}
                </span>
              </div>

              {/* Filters & Actions Bar */}
              <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
                {/* Auto Scroll Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    const next = !autoScrollTerminal;
                    setAutoScrollTerminal(next);
                    if (next && terminalContainerRef.current) {
                      isUserScrolledUp.current = false;
                      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
                    }
                  }}
                  className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    autoScrollTerminal
                      ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${autoScrollTerminal ? 'bg-blue-400 animate-pulse' : 'bg-zinc-500'}`} />
                  <span className="text-[11px]">{autoScrollTerminal ? t('superadmin.server_logs.auto_scroll_on', 'Auto Scroll: ON') : t('superadmin.server_logs.auto_scroll_off', 'Auto Scroll: OFF')}</span>
                </button>

                {/* Channel / Type Dropdown */}
                <select
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value)}
                  className="bg-zinc-800 text-zinc-200 text-[11px] font-mono font-semibold rounded-lg px-2 py-1 border border-zinc-700 outline-none cursor-pointer"
                >
                  <option value="ALL">{t('common.all_types', 'All Types')}</option>
                  <option value="cron">CRON</option>
                  <option value="notification">NOTIFY</option>
                  <option value="http">HTTP</option>
                  <option value="mqtt">MQTT</option>
                  <option value="success">SUCCESS</option>
                  <option value="error">ERROR</option>
                </select>

                {/* Level Dropdown */}
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="bg-zinc-800 text-zinc-200 text-[11px] font-mono font-semibold rounded-lg px-2 py-1 border border-zinc-700 outline-none cursor-pointer"
                >
                  <option value="ALL">{t('common.all_levels', 'All Levels')}</option>
                  <option value="info">INFO</option>
                  <option value="warn">WARN</option>
                  <option value="error">ERROR</option>
                </select>

                {/* Clear Terminal Button */}
                <button
                  type="button"
                  onClick={handleClearAllLogs}
                  disabled={deleteLoading || logsList.length === 0}
                  className="bg-zinc-800 hover:bg-rose-950/60 hover:text-rose-300 text-zinc-300 text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border border-zinc-700 cursor-pointer transition-all disabled:opacity-40"
                  title={t('superadmin.server_logs.clear_console_title', 'Clear all live console logs')}
                >{t('common.clear', 'Clear')}</button>
              </div>
            </div>

            {/* Selection Bar */}
            <div className="bg-zinc-900/60 px-3 py-1.5 sm:px-4 border-b border-zinc-800/80 flex items-center justify-between text-xs font-mono">
              <label className="flex items-center gap-2 cursor-pointer select-none text-zinc-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  disabled={logsList.length === 0}
                  className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-0 cursor-pointer disabled:opacity-40"
                />
                <span className="text-[11px]">{t('common.select_all', 'Select All')} ({logsList.length})</span>
              </label>

              {selectedLogIds.size > 0 && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-zinc-400 hover:text-white text-[11px] px-1.5 py-0.5 cursor-pointer"
                  >{t('common.deselect', 'Deselect')}</button>

                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    disabled={deleteLoading}
                    className="bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {t('common.delete', 'Delete')} ({selectedLogIds.size})
                  </button>
                </div>
              )}
            </div>

            {/* Terminal Body with Localized Scroll */}
            <div className="relative">
              <div
                ref={terminalContainerRef}
                onScroll={handleTerminalScroll}
                className="p-2.5 sm:p-4 font-mono text-[11px] sm:text-xs h-[360px] sm:h-[460px] overflow-y-auto space-y-1 select-text bg-[#090d16]"
              >
                {logsList.length === 0 ? (
                  <div className="text-zinc-600 text-center py-20 italic">
                    {t('superadmin.server_logs.no_logs_buffered', 'No logs buffered yet. Start live stream or click refresh to load logs.')}
                  </div>
                ) : (
                  logsList.map((log) => {
                    const isSelected = selectedLogIds.has(log.id);
                    return (
                      <div
                        key={log.id}
                        className={`group p-1 rounded-lg transition-colors flex items-start gap-2 ${
                          isSelected
                            ? 'bg-blue-950/40 border border-blue-800/60 text-white'
                            : 'hover:bg-zinc-900/70 border border-transparent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(log.id)}
                          className="mt-0.5 w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-0 cursor-pointer shrink-0"
                        />

                        <span className="text-zinc-500 shrink-0 text-[10px] sm:text-[11px]">
                          [{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'now'}]
                        </span>

                        <span className="font-bold text-zinc-400 uppercase shrink-0 text-[10px] sm:text-[11px]">
                          [{log.channel || 'system'}]
                        </span>

                        <span className={`flex-1 break-words ${getLogColor(log.level, log.channel)}`}>
                          {typeof log.message === 'object' ? JSON.stringify(log.message) : String(log.message || '')}
                          {log.error && (
                            <span className="block text-rose-400 text-[10px] sm:text-[11px] ml-2 mt-0.5 font-normal">
                              {typeof log.error === 'object'
                                ? log.error?.message || JSON.stringify(log.error)
                                : String(log.error)}
                            </span>
                          )}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteSingle(log.id, e)}
                          disabled={deleteLoading}
                          className="opacity-70 sm:opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 p-1 rounded transition-all shrink-0 cursor-pointer"
                          title={t('common.delete', 'Delete')}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {isUserScrolledUp.current && autoScrollTerminal && (
                <button
                  type="button"
                  onClick={() => {
                    isUserScrolledUp.current = false;
                    if (terminalContainerRef.current) {
                      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
                    }
                  }}
                  className="absolute bottom-3 right-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold px-3 py-1 rounded-full shadow-lg transition-all flex items-center gap-1 cursor-pointer z-10"
                >
                  <span>{t('superadmin.server_logs.jump_latest', '↓ Jump to latest')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 2: DISK LOGS & STORAGE MANAGER */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'disk' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Disk Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="bg-white dark:bg-zinc-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-zinc-400">{t('superadmin.server_logs.total_storage', 'Total Storage Size')}</p>
              <div className="mt-2 text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 truncate">
                {diskLogsData?.totalStorageFormatted || '0 B'}
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-zinc-400">{t('superadmin.server_logs.total_log_files', 'Total Log Files')}</p>
              <div className="mt-2 text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
                {diskLogsData?.totalFilesCount || 0} {t('superadmin.server_logs.files_suffix', 'Files')}
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-zinc-400">{t('superadmin.server_logs.subsystem_folders', 'Subsystem Folders')}</p>
              <div className="mt-2 text-lg sm:text-2xl font-black text-purple-600 dark:text-purple-400">
                {(diskLogsData?.folders || []).length} {t('superadmin.server_logs.folders_suffix', 'Folders')}
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-3.5 sm:p-4 rounded-2xl border border-rose-200 dark:border-rose-900/40 shadow-sm flex flex-col justify-between">
              <p className="text-[11px] sm:text-xs font-bold text-rose-600 dark:text-rose-400">{t('superadmin.server_logs.clean_storage', 'Clean Storage')}</p>
              <button
                type="button"
                onClick={handlePurgeAllFoldersSamet}
                disabled={diskActionLoading || (diskLogsData?.totalFilesCount || 0) === 0}
                className="mt-2 w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 min-h-[34px]"
              >
                <FleetIcons.Trash className="w-3.5 h-3.5" />
                <span>{t('superadmin.server_logs.delete_all_files', 'Delete All Files')}</span>
              </button>
            </div>
          </div>

          {/* Folder Filter & Selected Actions */}
          <div className="bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('superadmin.server_logs.filter_folder', 'Filter Folder:')}</span>
              <select
                value={diskFolderFilter}
                onChange={(e) => setDiskFolderFilter(e.target.value)}
                className="bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-slate-200 dark:border-zinc-700 outline-none cursor-pointer"
              >
                <option value="ALL">{t('common.all_folders', 'All Folders')} ({(diskLogsData?.folders || []).length})</option>
                {(diskLogsData?.folders || []).map((f) => (
                  <option key={f.channel} value={f.channel}>
                    {f.channel} ({f.fileCount} files)
                  </option>
                ))}
              </select>

              {selectedDiskFiles.size > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold">
                  {selectedDiskFiles.size} {t('common.selected', 'selected')}
                </span>
              )}
            </div>

            {selectedDiskFiles.size > 0 && (
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setSelectedDiskFiles(new Set())}
                  className="text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white px-2 py-1 cursor-pointer"
                >{t('common.deselect', 'Deselect')}</button>

                <button
                  type="button"
                  onClick={handleDeleteSelectedDiskFiles}
                  disabled={diskActionLoading}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <span>{t('common.delete_selected', 'Delete Selected')} ({selectedDiskFiles.size})</span>
                </button>
              </div>
            )}
          </div>

          {/* Folder Breakdown List */}
          {diskLogsLoading ? (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
              <div className="inline-block animate-spin rounded-full h-7 w-7 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-2 text-xs font-bold text-slate-500 dark:text-zinc-400">{t('superadmin.server_logs.loading_folders', 'Loading disk folders...')}</p>
            </div>
          ) : diskFolders.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 italic text-xs">
              {t('superadmin.server_logs.no_folders_found', 'No log folders found.')}
            </div>
          ) : (
            <div className="space-y-3">
              {diskFolders.map((folder) => {
                const isExpanded = expandedFolders.has(folder.channel);
                const hasFiles = folder.files && folder.files.length > 0;

                return (
                  <div
                    key={folder.channel}
                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm overflow-hidden"
                  >
                    {/* Folder Header */}
                    <div
                      onClick={() => toggleFolderExpand(folder.channel)}
                      className="p-3 sm:p-4 bg-slate-50/60 dark:bg-zinc-800/40 hover:bg-slate-100/70 dark:hover:bg-zinc-800/70 transition-colors flex items-center justify-between gap-2 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                          <FleetIcons.Folder className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                              {folder.channel}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${getChannelBadgeColor(
                                folder.channel
                              )}`}
                            >
                              {folder.channel}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                            {folder.fileCount} files • {folder.totalFormatted}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handlePurgeFolderSamet(folder.channel, e)}
                          disabled={diskActionLoading || !hasFiles}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40"
                          title={t('superadmin.server_logs.delete_folder_title', 'Delete all files in this folder')}
                        >
                          <FleetIcons.Trash className="w-3.5 h-3.5" />
                          <span>{t('superadmin.server_logs.delete_folder', 'Delete Folder')}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleFolderExpand(folder.channel)}
                          className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white"
                        >
                          <svg
                            className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Files List inside Folder */}
                    {isExpanded && (
                      <div className="divide-y divide-slate-100 dark:divide-zinc-800/70">
                        {!hasFiles ? (
                          <div className="p-4 text-center text-xs text-slate-400 dark:text-zinc-500 italic">
                            {t('superadmin.server_logs.folder_empty', 'Folder is empty.')}
                          </div>
                        ) : (
                          folder.files.map((file) => {
                            const fileKey = `${folder.channel}/${file.filename}`;
                            const isSelected = selectedDiskFiles.has(fileKey);

                            return (
                              <div
                                key={file.filename}
                                className={`p-2.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors ${
                                  isSelected
                                    ? 'bg-blue-50/50 dark:bg-blue-950/20'
                                    : 'hover:bg-slate-50 dark:hover:bg-zinc-800/40'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleToggleDiskFileSelect(folder.channel, file.filename)}
                                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-blue-600 focus:ring-0 cursor-pointer"
                                  />
                                  <FleetIcons.FileText className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
                                  <div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white break-all">
                                        {file.filename}
                                      </span>
                                      {file.isAuditFile && (
                                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-bold border border-amber-300 dark:border-amber-800">
                                          AUDIT
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 font-mono">
                                      <span>{file.sizeFormatted}</span>
                                      <span className="mx-1">•</span>
                                      <span>{new Date(file.updatedAt).toLocaleDateString()} {new Date(file.updatedAt).toLocaleTimeString()}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                  <button
                                    type="button"
                                    onClick={() => handleViewDiskLog(folder.channel, file.filename)}
                                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                                  >
                                    <FleetIcons.Eye className="w-3.5 h-3.5" />
                                    <span>{t('superadmin.server_logs.view_log', 'View Log')}</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteSingleDiskFile(folder.channel, file.filename, e)}
                                    disabled={diskActionLoading}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                                    title={t('superadmin.server_logs.delete_file_title', 'Delete file')}
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* LOG INSPECTION MODAL - Clean, Full Mobile Responsive */}
      {/* --------------------------------------------------------------------- */}
      {(activeLogPreview || previewLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-950 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-5xl h-full sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden text-zinc-100">
            {/* Modal Header */}
            <div className="p-3 sm:p-4 bg-zinc-900 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 shrink-0">
                  <FleetIcons.FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-mono text-xs sm:text-sm font-bold text-white break-all">
                      {activeLogPreview?.filename || t('superadmin.server_logs.loading_file', 'Loading file...')}
                    </h3>
                    {activeLogPreview?.channel && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${getChannelBadgeColor(activeLogPreview.channel)}`}>
                        {activeLogPreview.channel}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                    {activeLogPreview?.fileSizeFormatted || '0 B'} • {activeLogPreview?.totalLines || 0} {t('superadmin.server_logs.lines_suffix', 'lines')}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center flex-wrap gap-1.5">
                <input
                  type="text"
                  placeholder={t('superadmin.server_logs.search_lines', 'Search lines...')}
                  value={previewSearch}
                  onChange={(e) => setPreviewSearch(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-zinc-500 outline-none w-32 sm:w-44"
                />

                <button
                  type="button"
                  onClick={() => handleCopyLogContent(activeLogPreview?.rawText)}
                  className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >{t('common.copy', 'Copy')}</button>

                <button
                  type="button"
                  onClick={() => handleDownloadLogFile(activeLogPreview)}
                  className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >{t('common.download', 'Download')}</button>

                {activeLogPreview && (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteSingleDiskFile(activeLogPreview.channel, activeLogPreview.filename, e)}
                    className="px-2 py-1 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Delete
                  </button>
                )}

                <button
                  type="button"
                  onClick={closeLogPreview}
                  className="p-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
                  title={t('common.close', 'Close')}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 font-mono text-[11px] sm:text-xs select-text bg-[#090d16] space-y-1">
              {previewLoading ? (
                <div className="py-20 text-center">
                  <div className="inline-block animate-spin rounded-full h-7 w-7 border-4 border-blue-500 border-t-transparent"></div>
                  <p className="mt-2 text-zinc-400 font-mono text-xs">{t('superadmin.server_logs.loading_log_file', 'Loading log file...')}</p>
                </div>
              ) : filteredPreviewEntries.length === 0 ? (
                <div className="py-20 text-center text-zinc-500 italic">
                  {previewSearch ? t('superadmin.server_logs.no_matching_lines', 'No matching lines found.') : t('superadmin.server_logs.file_empty', 'File is empty.')}
                </div>
              ) : (
                filteredPreviewEntries.map((entry) => (
                  <div
                    key={entry.lineNo}
                    className="flex items-start gap-2 p-1 rounded hover:bg-zinc-900/60 transition-colors"
                  >
                    <span className="text-zinc-600 shrink-0 select-none text-[10px] w-7 text-right">
                      {entry.lineNo}
                    </span>

                    {entry.timestamp && (
                      <span className="text-zinc-500 shrink-0 text-[10px] sm:text-[11px]">
                        [{new Date(entry.timestamp).toLocaleTimeString()}]
                      </span>
                    )}

                    {entry.level && (
                      <span
                        className={`text-[9px] font-bold px-1 rounded uppercase shrink-0 ${
                          entry.level === 'error'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : entry.level === 'warn'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-blue-950 text-blue-400 border border-blue-900'
                        }`}
                      >
                        {entry.level}
                      </span>
                    )}

                    <span className={`flex-1 break-all ${getLogColor(entry.level, activeLogPreview?.channel)}`}>
                      {entry.message || entry.raw}
                      {entry.error && (
                        <span className="block text-rose-400 text-[10px] mt-0.5">
                          {typeof entry.error === 'object' ? JSON.stringify(entry.error) : String(entry.error)}
                        </span>
                      )}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-2.5 sm:p-3 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 font-mono">
              <span>{filteredPreviewEntries.length} {t('superadmin.server_logs.lines_suffix', 'lines')}</span>
              <button
                type="button"
                onClick={closeLogPreview}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-bold cursor-pointer"
              >{t('common.close', 'Close')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveServerLogsPage;
