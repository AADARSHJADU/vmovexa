import { createSlice } from '@reduxjs/toolkit';
import {
  fetchRolesThunk,
  createRoleThunk,
  updateRoleThunk,
  deleteRoleThunk,
  updateRolePermissionsThunk,
  fetchPermissionsThunk,
  fetchPermissionModulesThunk,
} from '../../thunks/superadmin/role.thunks.js';

export {
  fetchRolesThunk,
  createRoleThunk,
  updateRoleThunk,
  deleteRoleThunk,
  updateRolePermissionsThunk,
  fetchPermissionsThunk,
  fetchPermissionModulesThunk,
};

const initialState = {
  roles: [],
  permissions: [],
  permissionModules: {},
  status: 'idle',
  error: null,
};

const superRoleSlice = createSlice({
  name: 'superRole',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRolesThunk.pending,    (state) => { state.status = 'loading'; })
      .addCase(fetchRolesThunk.fulfilled,  (state, action) => {
        state.status = 'succeeded';
        state.roles = Array.isArray(action.payload) ? action.payload
          : (action.payload?.rows || action.payload?.items || []);
      })
      .addCase(fetchRolesThunk.rejected,   (state) => { state.status = 'failed'; })
      .addCase(createRoleThunk.fulfilled,  (state, action) => {
        if (action.payload?.id) state.roles = [...state.roles, action.payload];
      })
      .addCase(updateRoleThunk.fulfilled,  (state, action) => {
        if (action.payload?.id) {
          state.roles = state.roles.map((r) => r.id === action.payload.id ? { ...r, ...action.payload } : r);
        }
      })
      .addCase(deleteRoleThunk.fulfilled,  (state, action) => {
        state.roles = state.roles.filter((r) => r.id !== action.payload);
      })
      .addCase(updateRolePermissionsThunk.fulfilled, (state, action) => {
        if (action.payload?.id) {
          state.roles = state.roles.map((r) => r.id === action.payload.id ? action.payload : r);
        }
      })
      .addCase(fetchPermissionsThunk.fulfilled, (state, action) => {
        state.permissions = Array.isArray(action.payload) ? action.payload
          : (action.payload?.rows || action.payload?.items || []);
      })
      .addCase(fetchPermissionModulesThunk.fulfilled, (state, action) => {
        state.permissionModules = action.payload || {};
      });
  },
});

export default superRoleSlice.reducer;
export const selectSuperRoles          = (state) => state.superRole.roles;
export const selectSuperPermissions    = (state) => state.superRole.permissions;
export const selectSuperPermModules    = (state) => state.superRole.permissionModules;
export const selectSuperRoleStatus     = (state) => state.superRole.status;
