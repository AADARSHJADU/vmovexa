import { createSlice } from '@reduxjs/toolkit';
import {
  fetchNotificationLogsThunk,
  fetchNotificationLogStatsThunk,
  retryNotificationLogThunk,
} from '../thunks/notificationLog.thunks';

const initialState = {
  logs: [],
  totalItems: 0,
  currentPage: 1,
  totalPages: 1,
  pageSize: 20,
  stats: {
    total: 0,
    delivered: 0,
    failed: 0,
    rejected: 0,
    pending: 0,
    deliveryRate: 100,
  },
  loading: false,
  statsLoading: false,
  retryLoading: false,
  error: null,
};

const notificationLogSlice = createSlice({
  name: 'notificationLogs',
  initialState,
  reducers: {
    addIncomingNotificationLog: (state, action) => {
      const incoming = action.payload;
      if (!incoming || !incoming.id) return;

      const existingIndex = state.logs.findIndex((l) => l.id === incoming.id);
      if (existingIndex !== -1) {
        state.logs[existingIndex] = { ...state.logs[existingIndex], ...incoming };
        return;
      }

      state.logs.unshift({ ...incoming, isRealtimeNew: true });
      if (state.logs.length > (state.pageSize || 20)) {
        state.logs.pop();
      }
      state.totalItems = (state.totalItems || 0) + 1;

      if (state.stats) {
        state.stats.total = (state.stats.total || 0) + 1;
        const st = incoming.status;
        if (st === 'delivered' || st === 'sent') {
          state.stats.delivered = (state.stats.delivered || 0) + 1;
        } else if (st === 'failed') {
          state.stats.failed = (state.stats.failed || 0) + 1;
        } else if (st === 'rejected') {
          state.stats.rejected = (state.stats.rejected || 0) + 1;
        } else {
          state.stats.pending = (state.stats.pending || 0) + 1;
        }
        if (state.stats.total > 0) {
          state.stats.deliveryRate = parseFloat(((state.stats.delivered / state.stats.total) * 100).toFixed(1));
        }
      }
    },

    updateNotificationLogItem: (state, action) => {
      const incoming = action.payload;
      if (!incoming || !incoming.id) return;
      const index = state.logs.findIndex((l) => l.id === incoming.id);
      if (index !== -1) {
        const oldStatus = state.logs[index].status;
        state.logs[index] = { ...state.logs[index], ...incoming, isRealtimeUpdated: true };

        if (state.stats && oldStatus !== incoming.status) {
          if (oldStatus === 'failed' && (incoming.status === 'delivered' || incoming.status === 'sent')) {
            state.stats.failed = Math.max(0, (state.stats.failed || 0) - 1);
            state.stats.delivered = (state.stats.delivered || 0) + 1;
            state.stats.deliveryRate = parseFloat(((state.stats.delivered / state.stats.total) * 100).toFixed(1));
          }
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Logs
      .addCase(fetchNotificationLogsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotificationLogsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload?.logs || [];
        state.totalItems = action.payload?.totalItems || 0;
        state.currentPage = action.payload?.currentPage || 1;
        state.totalPages = action.payload?.totalPages || 1;
        state.pageSize = action.payload?.pageSize || 20;
      })
      .addCase(fetchNotificationLogsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load notification logs';
      })

      // Fetch Stats
      .addCase(fetchNotificationLogStatsThunk.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchNotificationLogStatsThunk.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload || state.stats;
      })
      .addCase(fetchNotificationLogStatsThunk.rejected, (state) => {
        state.statsLoading = false;
      })

      // Retry
      .addCase(retryNotificationLogThunk.pending, (state) => {
        state.retryLoading = true;
      })
      .addCase(retryNotificationLogThunk.fulfilled, (state) => {
        state.retryLoading = false;
      })
      .addCase(retryNotificationLogThunk.rejected, (state) => {
        state.retryLoading = false;
      });
  },
});

export const { addIncomingNotificationLog, updateNotificationLogItem } = notificationLogSlice.actions;

export const selectNotificationLogs = (state) => state.notificationLogs.logs;
export const selectNotificationLogsPagination = (state) => ({
  totalItems: state.notificationLogs.totalItems,
  currentPage: state.notificationLogs.currentPage,
  totalPages: state.notificationLogs.totalPages,
  pageSize: state.notificationLogs.pageSize,
});
export const selectNotificationLogStats = (state) => state.notificationLogs.stats;
export const selectNotificationLogsLoading = (state) => state.notificationLogs.loading;

export default notificationLogSlice.reducer;
