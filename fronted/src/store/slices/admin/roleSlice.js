import { createSlice } from '@reduxjs/toolkit';
import {
  fetchRolesThunk,
  createRoleThunk,
  deleteRoleThunk,
  updateRoleThunk,
  fetchPermissionsThunk,
} from '../../thunks/admin/role.thunks.js';

export { fetchRolesThunk, createRoleThunk, deleteRoleThunk, updateRoleThunk, fetchPermissionsThunk };

const initialState = {
  roles: [],
  permissions: [],
  status: 'idle',
  error: null,
};

const adminRoleSlice = createSlice({
  name: 'adminRole',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRolesThunk.pending,   (state) => { state.status = 'loading'; })
      .addCase(fetchRolesThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.roles = Array.isArray(action.payload) ? action.payload
          : (action.payload?.rows || action.payload?.items || []);
      })
      .addCase(fetchRolesThunk.rejected,  (state) => { state.status = 'failed'; })
      .addCase(createRoleThunk.fulfilled, (state, action) => {
        if (action.payload?.id) state.roles = [...state.roles, action.payload];
      })
      .addCase(deleteRoleThunk.fulfilled, (state, action) => {
        state.roles = state.roles.filter((r) => r.id !== action.payload);
      })
      .addCase(updateRoleThunk.fulfilled, (state, action) => {
        if (action.payload?.id) {
          state.roles = state.roles.map((r) => r.id === action.payload.id ? action.payload : r);
        }
      })
      .addCase(fetchPermissionsThunk.fulfilled, (state, action) => {
        state.permissions = Array.isArray(action.payload) ? action.payload
          : (action.payload?.rows || action.payload?.items || []);
      });
  },
});

export default adminRoleSlice.reducer;
export const selectAdminRoles       = (state) => state.adminRole.roles;
export const selectAdminPermissions = (state) => state.adminRole.permissions;
