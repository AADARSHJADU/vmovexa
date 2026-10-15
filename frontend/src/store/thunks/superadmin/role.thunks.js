import { createAsyncThunk } from '@reduxjs/toolkit';
import { superRoleService } from '../../../api/services/superadmin/role.service.js';

export const fetchRolesThunk = createAsyncThunk(
  'superadmin/role/fetchRoles',
  async (_, { rejectWithValue }) => {
    try { return await superRoleService.getRoles(); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const createRoleThunk = createAsyncThunk(
  'superadmin/role/createRole',
  async (data, { rejectWithValue }) => {
    try { return await superRoleService.createRole(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const deleteRoleThunk = createAsyncThunk(
  'superadmin/role/deleteRole',
  async (id, { rejectWithValue }) => {
    try { await superRoleService.deleteRole(id); return id; }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateRoleThunk = createAsyncThunk(
  'superadmin/role/updateRole',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await superRoleService.updateRole(id, data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateRolePermissionsThunk = createAsyncThunk(
  'superadmin/role/updatePermissions',
  async ({ id, permissionIds }, { rejectWithValue }) => {
    try { return await superRoleService.updateRolePermissions(id, permissionIds); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchPermissionsThunk = createAsyncThunk(
  'superadmin/role/fetchPermissions',
  async (_, { rejectWithValue }) => {
    try { return await superRoleService.getPermissions(); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchPermissionModulesThunk = createAsyncThunk(
  'superadmin/role/fetchPermissionModules',
  async (_, { rejectWithValue }) => {
    try { return await superRoleService.getPermissionModules(); }
    catch (err) { return rejectWithValue(err); }
  }
);
