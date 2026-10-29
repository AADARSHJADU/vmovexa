import { createSlice } from '@reduxjs/toolkit';
import {
  fetchServerStatusThunk,
  fetchLiveLogsThunk,
  triggerCronJobThunk,
  deleteLiveLogsThunk,
  fetchDiskLogsThunk,
  readDiskLogThunk,
  deleteDiskLogsThunk,
} from '../thunks/systemLog.thunks';

const initialState = {
  serverStatus: {
    status: 'ONLINE',
    uptimeFormatted: '0h 0m 0s',
    nodeVersion: 'v20',
    pid: 0,
    memory: { heapUsedMb: '0', heapTotalMb: '0', heapUsagePct: '0' },
    cronJobs: [],
  },
  liveLogs: [],
  statusLoading: false,
  logsLoading: false,
  triggerLoading: false,
  deleteLoading: false,
  // Disk logs storage state
  diskLogsData: {
    folders: [],
    totalStorageBytes: 0,
    totalStorageFormatted: '0 B',
    totalFilesCount: 0,
  },
  diskLogsLoading: false,
  activeLogPreview: null,
  previewLoading: false,
  diskActionLoading: false,
  error: null,
};

const systemLogSlice = createSlice({
  name: 'systemLogs',
  initialState,
  reducers: {
    clearLogs: (state) => {
      state.liveLogs = [];
    },
    clearActiveLogPreview: (state) => {
      state.activeLogPreview = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Server Status
      .addCase(fetchServerStatusThunk.pending, (state) => {
        state.statusLoading = true;
      })
      .addCase(fetchServerStatusThunk.fulfilled, (state, action) => {
        state.statusLoading = false;
        state.serverStatus = action.payload || state.serverStatus;
      })
      .addCase(fetchServerStatusThunk.rejected, (state, action) => {
        state.statusLoading = false;
        state.error = action.payload?.message;
      })

      // Live Logs
      .addCase(fetchLiveLogsThunk.pending, (state) => {
        state.logsLoading = true;
      })
      .addCase(fetchLiveLogsThunk.fulfilled, (state, action) => {
        state.logsLoading = false;
        state.liveLogs = action.payload || [];
      })
      .addCase(fetchLiveLogsThunk.rejected, (state, action) => {
        state.logsLoading = false;
        state.error = action.payload?.message;
      })

      // Trigger Cron
      .addCase(triggerCronJobThunk.pending, (state) => {
        state.triggerLoading = true;
      })
      .addCase(triggerCronJobThunk.fulfilled, (state) => {
        state.triggerLoading = false;
      })
      .addCase(triggerCronJobThunk.rejected, (state) => {
        state.triggerLoading = false;
      })

      // Delete Live Logs
      .addCase(deleteLiveLogsThunk.pending, (state) => {
        state.deleteLoading = true;
      })
      .addCase(deleteLiveLogsThunk.fulfilled, (state, action) => {
        state.deleteLoading = false;
        const params = action.payload?.params || {};
        if (params.all || !params.ids || params.ids.length === 0) {
          state.liveLogs = [];
        } else {
          const idSet = new Set(params.ids.map(String));
          state.liveLogs = state.liveLogs.filter((l) => !idSet.has(String(l.id)));
        }
      })
      .addCase(deleteLiveLogsThunk.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload?.message;
      })

      // Fetch Disk Logs
      .addCase(fetchDiskLogsThunk.pending, (state) => {
        state.diskLogsLoading = true;
      })
      .addCase(fetchDiskLogsThunk.fulfilled, (state, action) => {
        state.diskLogsLoading = false;
        state.diskLogsData = action.payload || state.diskLogsData;
      })
      .addCase(fetchDiskLogsThunk.rejected, (state, action) => {
        state.diskLogsLoading = false;
        state.error = action.payload?.message;
      })

      // Read Disk Log File Preview
      .addCase(readDiskLogThunk.pending, (state) => {
        state.previewLoading = true;
      })
      .addCase(readDiskLogThunk.fulfilled, (state, action) => {
        state.previewLoading = false;
        state.activeLogPreview = action.payload || null;
      })
      .addCase(readDiskLogThunk.rejected, (state, action) => {
        state.previewLoading = false;
        state.error = action.payload?.message;
      })

      // Delete Disk Logs
      .addCase(deleteDiskLogsThunk.pending, (state) => {
        state.diskActionLoading = true;
      })
      .addCase(deleteDiskLogsThunk.fulfilled, (state) => {
        state.diskActionLoading = false;
      })
      .addCase(deleteDiskLogsThunk.rejected, (state, action) => {
        state.diskActionLoading = false;
        state.error = action.payload?.message;
      });
  },
});

export const { clearLogs, clearActiveLogPreview } = systemLogSlice.actions;

export const selectServerStatus = (state) => state.systemLogs.serverStatus;
export const selectLiveLogs = (state) => state.systemLogs.liveLogs;
export const selectSystemLogsLoading = (state) => state.systemLogs.logsLoading;
export const selectCronTriggerLoading = (state) => state.systemLogs.triggerLoading;
export const selectDeleteLogsLoading = (state) => state.systemLogs.deleteLoading;

export const selectDiskLogsData = (state) => state.systemLogs.diskLogsData;
export const selectDiskLogsLoading = (state) => state.systemLogs.diskLogsLoading;
export const selectActiveLogPreview = (state) => state.systemLogs.activeLogPreview;
export const selectPreviewLoading = (state) => state.systemLogs.previewLoading;
export const selectDiskActionLoading = (state) => state.systemLogs.diskActionLoading;

export default systemLogSlice.reducer;
