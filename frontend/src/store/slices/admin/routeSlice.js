import { createSlice } from '@reduxjs/toolkit';
import {
  fetchRoutesThunk,
  fetchRouteDetailsThunk,
  createRouteThunk,
  updateRouteThunk,
  deleteRouteThunk,
  approveRouteThunk,
  rejectRouteThunk,
  assignVehicleRouteThunk,
  fetchRouteVehiclesThunk,
  approveAssignmentThunk,
  rejectAssignmentThunk,
  deleteAssignmentThunk,
} from '../../thunks/admin/route.thunks.js';

export {
  fetchRoutesThunk,
  fetchRouteDetailsThunk,
  createRouteThunk,
  updateRouteThunk,
  deleteRouteThunk,
  approveRouteThunk,
  rejectRouteThunk,
  assignVehicleRouteThunk,
  fetchRouteVehiclesThunk,
  approveAssignmentThunk,
  rejectAssignmentThunk,
  deleteAssignmentThunk,
};

const initialState = {
  routes: [],
  selectedRoute: null,
  routeVehicles: [],
  pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  status: 'idle',
  error: null,
};

const routeSlice = createSlice({
  name: 'route',
  initialState,
  reducers: {
    clearSelectedRoute: (state) => {
      state.selectedRoute = null;
      state.routeVehicles = [];
    },
    setSelectedRoute: (state, action) => {
      state.selectedRoute = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchRoutes
      .addCase(fetchRoutesThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchRoutesThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload && action.payload.rows) {
          state.routes = action.payload.rows;
          state.pagination = action.payload.meta || state.pagination;
        } else if (Array.isArray(action.payload)) {
          state.routes = action.payload;
        } else {
          state.routes = [];
        }
      })
      .addCase(fetchRoutesThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch routes';
      })

      // fetchRouteDetails
      .addCase(fetchRouteDetailsThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchRouteDetailsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedRoute = action.payload;
      })
      .addCase(fetchRouteDetailsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch route details';
      })

      // createRoute
      .addCase(createRouteThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.routes.unshift(action.payload);
        }
      })

      // updateRoute
      .addCase(updateRouteThunk.fulfilled, (state, action) => {
        if (action.payload) {
          const idx = state.routes.findIndex((r) => r.id === action.payload.id);
          if (idx !== -1) state.routes[idx] = { ...state.routes[idx], ...action.payload };
          if (state.selectedRoute && state.selectedRoute.id === action.payload.id) {
            state.selectedRoute = { ...state.selectedRoute, ...action.payload };
          }
        }
      })

      // deleteRoute
      .addCase(deleteRouteThunk.fulfilled, (state, action) => {
        state.routes = state.routes.filter((r) => r.id !== action.payload);
        if (state.selectedRoute && state.selectedRoute.id === action.payload) {
          state.selectedRoute = null;
        }
      })

      // approveRoute
      .addCase(approveRouteThunk.fulfilled, (state, action) => {
        if (action.payload) {
          const idx = state.routes.findIndex((r) => r.id === action.payload.id);
          if (idx !== -1) state.routes[idx] = { ...state.routes[idx], ...action.payload, status: 'active' };
          if (state.selectedRoute && state.selectedRoute.id === action.payload.id) {
            state.selectedRoute = { ...state.selectedRoute, ...action.payload, status: 'active' };
          }
        }
      })

      // rejectRoute
      .addCase(rejectRouteThunk.fulfilled, (state, action) => {
        if (action.payload) {
          const idx = state.routes.findIndex((r) => r.id === action.payload.id);
          if (idx !== -1) state.routes[idx] = { ...state.routes[idx], ...action.payload, status: 'rejected' };
          if (state.selectedRoute && state.selectedRoute.id === action.payload.id) {
            state.selectedRoute = { ...state.selectedRoute, ...action.payload, status: 'rejected' };
          }
        }
      })

      // fetchRouteVehicles
      .addCase(fetchRouteVehiclesThunk.fulfilled, (state, action) => {
        state.routeVehicles = Array.isArray(action.payload) ? action.payload : [];
      })

      // assignVehicleRoute
      .addCase(assignVehicleRouteThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.routeVehicles.unshift(action.payload);
        }
      })

      // approveAssignment
      .addCase(approveAssignmentThunk.fulfilled, (state, action) => {
        if (action.payload) {
          const idx = state.routeVehicles.findIndex((a) => a.id === action.payload.id);
          if (idx !== -1) state.routeVehicles[idx] = { ...state.routeVehicles[idx], ...action.payload, status: 'active' };
        }
      })

      // rejectAssignment
      .addCase(rejectAssignmentThunk.fulfilled, (state, action) => {
        if (action.payload) {
          const idx = state.routeVehicles.findIndex((a) => a.id === action.payload.id);
          if (idx !== -1) state.routeVehicles[idx] = { ...state.routeVehicles[idx], ...action.payload, status: 'rejected' };
        }
      })

      // deleteAssignment
      .addCase(deleteAssignmentThunk.fulfilled, (state, action) => {
        state.routeVehicles = state.routeVehicles.filter((a) => a.id !== action.payload);
      });
  },
});

export const { clearSelectedRoute, setSelectedRoute } = routeSlice.actions;
export default routeSlice.reducer;

export const selectAdminRoutes = (state) => (state.adminRoute || state.route)?.routes || [];
export const selectSelectedRoute = (state) => (state.adminRoute || state.route)?.selectedRoute || null;
export const selectRouteVehicles = (state) => (state.adminRoute || state.route)?.routeVehicles || [];
export const selectAdminRouteLoading = (state) => (state.adminRoute || state.route)?.status === 'loading';
export const selectAdminRoutePagination = (state) => (state.adminRoute || state.route)?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
export const selectAdminRouteError = (state) => (state.adminRoute || state.route)?.error || null;
