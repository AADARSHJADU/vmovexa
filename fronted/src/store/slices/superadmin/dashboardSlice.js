import { createSlice } from '@reduxjs/toolkit';
import { 
  fetchSuperAdminKpisThunk, 
  fetchLiveSummaryThunk, 
  fetchSystemHealthThunk,
  fetchLiveTrackingThunk,
  fetchTrackingRoutesThunk,
} from '../../thunks/superadmin/dashboard.thunks.js';

export { 
  fetchSuperAdminKpisThunk, 
  fetchLiveSummaryThunk, 
  fetchSystemHealthThunk,
  fetchLiveTrackingThunk,
  fetchTrackingRoutesThunk,
};

const initialState = {
  superAdminKpis: null,
  liveSummary: null,
  systemHealth: null,
  liveTracking: null,
  trackingRoutes: [],
  status: 'idle',
  error: null,
};

const superDashboardSlice = createSlice({
  name: 'superDashboard',
  initialState,
  reducers: {
    clearSuperDashboardError(state) { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuperAdminKpisThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchSuperAdminKpisThunk.fulfilled, (state, action) => { 
        state.status = 'succeeded'; 
        const payload = action.payload || {};
        state.superAdminKpis = {
          totalTenants: payload.totalTenants ?? payload.tenants?.total ?? 0,
          activeTenants: payload.activeTenants ?? payload.tenants?.active ?? 0,
          totalBusesMonitored: payload.totalBusesMonitored ?? 0,
          activeEdgeBoxes: payload.activeEdgeBoxes ?? payload.devices?.online ?? 0,
          offlineEdgeBoxes: payload.offlineEdgeBoxes ?? payload.devices?.offline ?? 0,
          centralTechniciansCount: payload.centralTechniciansCount ?? 0,
          activeCampaigns: payload.activeCampaigns ?? 0,
          monthlyGmvRevenue: payload.monthlyGmvRevenue != null ? payload.monthlyGmvRevenue : (payload.mrr ?? 0),
          ...payload,
        }; 
      })
      .addCase(fetchSuperAdminKpisThunk.rejected, (state, action) => { 
        state.status = 'failed'; 
        state.error = action.payload; 
      })
      .addCase(fetchLiveSummaryThunk.fulfilled, (state, action) => { 
        state.liveSummary = action.payload; 
      })
      .addCase(fetchLiveTrackingThunk.fulfilled, (state, action) => {
        state.liveTracking = action.payload;
      })
      .addCase(fetchTrackingRoutesThunk.fulfilled, (state, action) => {
        state.trackingRoutes = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchSystemHealthThunk.fulfilled, (state, action) => { 
        const payload = action.payload || {};
        const mqttBroker = payload.mqttBroker || (payload.mqtt ? {
          status: payload.mqtt.status === 'connected' ? 'Healthy / Connected' : 'Disconnected',
          activeSockets: payload.mqtt.activeSockets ?? null,
          msgRateIn: payload.mqtt.msgRateIn ?? null,
          msgRateOut: payload.mqtt.msgRateOut ?? null,
          latency: payload.mqtt.latency ?? null,
        } : {
          status: 'Disconnected',
          activeSockets: null,
          msgRateIn: null,
          msgRateOut: null,
          latency: null,
        });

        const liveMqttFeed = payload.liveMqttFeed || (payload.recentTelemetry ? payload.recentTelemetry.map((t) => ({
          topic: `vehicle/device-${t.edge_device_id || t.id}/telemetry`,
          payload: JSON.stringify({ lat: t.lat, lng: t.lng, spd: t.speed, sat: t.satellites }),
          time: t.created_at ? new Date(t.created_at).toLocaleTimeString() : 'Just now',
        })) : []);

        const googleApis = Array.isArray(payload.googleApis) ? payload.googleApis : (payload.googleApis?.apis || []);

        state.systemHealth = {
          ...payload,
          mqttBroker,
          liveMqttFeed,
          googleApis,
        }; 
      });
  },
});

export const { clearSuperDashboardError } = superDashboardSlice.actions;
export default superDashboardSlice.reducer;

export const selectSuperAdminKpis = (state) => state.superDashboard.superAdminKpis;
export const selectLiveSummary = (state) => state.superDashboard.liveSummary;
export const selectSystemHealth = (state) => state.superDashboard.systemHealth;
export const selectLiveTracking = (state) => state.superDashboard.liveTracking;
export const selectTrackingRoutes = (state) => state.superDashboard.trackingRoutes;
export const selectSuperDashboardLoading = (state) => state.superDashboard.status === 'loading';

