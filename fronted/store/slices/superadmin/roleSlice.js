import { createSlice } from '@reduxjs/toolkit';
import {
  fetchRolesThunk,
  updateRolePermissionsThunk,
  fetchRegistryThunk,
} from '../../thunks/superadmin/role.thunks.js';

export { fetchRolesThunk, updateRolePermissionsThunk, fetchRegistryThunk };

const initialState = {
  roles: [],
  registry: null,
  status: 'idle',
  error: null,
};

const superRoleSlice = createSlice({
  name: 'superRole',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRolesThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchRolesThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.roles = Array.isArray(action.payload) ? action.payload : (action.payload?.rows || []);
      })
      .addCase(fetchRolesThunk.rejected, (state) => { state.status = 'failed'; })
      .addCase(updateRolePermissionsThunk.fulfilled, (state, action) => {
        if (action.payload?.id) {
          state.roles = state.roles.map((r) => (r.id === action.payload.id ? action.payload : r));
        }
      })
      .addCase(fetchRegistryThunk.fulfilled, (state, action) => {
        state.registry = action.payload || null;
      });
  },
});

export default superRoleSlice.reducer;

export const selectSuperRoles = (state) => state.superRole.roles;
export const selectSuperRegistry = (state) => state.superRole.registry;
export const selectSuperRoleStatus = (state) => state.superRole.status;
