import { createSlice } from '@reduxjs/toolkit';
import { 
  fetchSuperAdminKpisThunk, 
  fetchAdminKpisThunk, 
  fetchLiveSummaryThunk, 
  fetchSystemHealthThunk 
} from '../thunks/dashboard.thunks.js';

export { 
  fetchSuperAdminKpisThunk, 
  fetchAdminKpisThunk, 
  fetchLiveSummaryThunk, 
  fetchSystemHealthThunk 
};

const initialState = {
  superAdminKpis: null,
  adminKpis: null,
  liveSummary: null,
  systemHealth: null,
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Super Admin KPIs
      .addCase(fetchSuperAdminKpisThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchSuperAdminKpisThunk.fulfilled, (state, action) => { 
        state.status = 'succeeded'; 
        state.superAdminKpis = action.payload; 
      })
      .addCase(fetchSuperAdminKpisThunk.rejected, (state, action) => { 
        state.status = 'failed'; 
        state.error = action.payload; 
      })
      
      // Admin KPIs
      .addCase(fetchAdminKpisThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchAdminKpisThunk.fulfilled, (state, action) => { 
        state.status = 'succeeded'; 
        state.adminKpis = action.payload; 
      })
      .addCase(fetchAdminKpisThunk.rejected, (state, action) => { 
        state.status = 'failed'; 
        state.error = action.payload; 
      })

      // Live Summary
      .addCase(fetchLiveSummaryThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchLiveSummaryThunk.fulfilled, (state, action) => { 
        state.status = 'succeeded'; 
        state.liveSummary = action.payload; 
      })
      .addCase(fetchLiveSummaryThunk.rejected, (state, action) => { 
        state.status = 'failed'; 
        state.error = action.payload; 
      })

      // System Health
      .addCase(fetchSystemHealthThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchSystemHealthThunk.fulfilled, (state, action) => { 
        state.status = 'succeeded'; 
        state.systemHealth = action.payload; 
      })
      .addCase(fetchSystemHealthThunk.rejected, (state, action) => { 
        state.status = 'failed'; 
        state.error = action.payload; 
      });
  },
});

export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;

// Selectors
export const selectSuperAdminKpis = (state) => state.dashboard.superAdminKpis;
export const selectAdminKpis = (state) => state.dashboard.adminKpis;
export const selectLiveSummary = (state) => state.dashboard.liveSummary;
export const selectSystemHealth = (state) => state.dashboard.systemHealth;
export const selectDashboardStatus = (state) => state.dashboard.status;
export const selectDashboardError = (state) => state.dashboard.error;
export const selectDashboardLoading = (state) => state.dashboard.status === 'loading';
