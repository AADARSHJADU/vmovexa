import { createAsyncThunk } from '@reduxjs/toolkit';
import { adminRoleService } from '../../../api/services/admin/role.service.js';

export const fetchRolesThunk = createAsyncThunk(
  'admin/role/fetchRoles',
  async (_, { rejectWithValue }) => {
    try { return await adminRoleService.getRoles(); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const createRoleThunk = createAsyncThunk(
  'admin/role/createRole',
  async (data, { rejectWithValue }) => {
    try { return await adminRoleService.createRole(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const deleteRoleThunk = createAsyncThunk(
  'admin/role/deleteRole',
  async (id, { rejectWithValue }) => {
    try { await adminRoleService.deleteRole(id); return id; }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateRoleThunk = createAsyncThunk(
  'admin/role/updateRole',
  async ({ id, permissionIds }, { rejectWithValue }) => {
    try { return await adminRoleService.updateRolePermissions(id, permissionIds); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchPermissionsThunk = createAsyncThunk(
  'admin/role/fetchPermissions',
  async (_, { rejectWithValue }) => {
    try { return await adminRoleService.getPermissions(); }
    catch (err) { return rejectWithValue(err); }
  }
);
