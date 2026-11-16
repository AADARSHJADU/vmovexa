import { createAsyncThunk } from '@reduxjs/toolkit';
import { superRoleService } from '../../../api/services/superadmin/role.service.js';

export const fetchRolesThunk = createAsyncThunk(
  'superadmin/role/fetchRoles',
  async (_, { rejectWithValue }) => {
    try { return await superRoleService.getRoles(); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateRolePermissionsThunk = createAsyncThunk(
  'superadmin/role/updatePermissions',
  async ({ id, permissions }, { rejectWithValue }) => {
    try { return await superRoleService.updateRolePermissions(id, permissions); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchRegistryThunk = createAsyncThunk(
  'superadmin/role/fetchRegistry',
  async (_, { rejectWithValue }) => {
    try { return await superRoleService.getRegistry(); }
    catch (err) { return rejectWithValue(err); }
  }
);
