import { createAsyncThunk } from '@reduxjs/toolkit';
import { adminRoleService } from '../../../api/services/admin/role.service.js';

export const fetchRolesThunk = createAsyncThunk(
  'admin/role/fetchRoles',
  async (_, { rejectWithValue }) => {
    try { return await adminRoleService.getRoles(); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchRegistryThunk = createAsyncThunk(
  'admin/role/fetchRegistry',
  async (_, { rejectWithValue }) => {
    try { return await adminRoleService.getRegistry(); }
    catch (err) { return rejectWithValue(err); }
  }
);
