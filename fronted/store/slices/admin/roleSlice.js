import { createSlice } from '@reduxjs/toolkit';
import { fetchRolesThunk, fetchRegistryThunk } from '../../thunks/admin/role.thunks.js';

export { fetchRolesThunk, fetchRegistryThunk };

const initialState = {
  roles: [],
  registry: null,
  status: 'idle',
  error: null,
};

const adminRoleSlice = createSlice({
  name: 'adminRole',
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
      .addCase(fetchRegistryThunk.fulfilled, (state, action) => {
        state.registry = action.payload || null;
      });
  },
});

export default adminRoleSlice.reducer;

export const selectAdminRoles = (state) => state.adminRole.roles;
export const selectAdminRegistry = (state) => state.adminRole.registry;
