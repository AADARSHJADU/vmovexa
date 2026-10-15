import { createAsyncThunk } from '@reduxjs/toolkit';
import { adminUserService } from '../../../api/services/admin/user.service.js';

export const fetchUsersThunk = createAsyncThunk(
  'admin/user/fetchUsers',
  async (params, { rejectWithValue }) => {
    try { return await adminUserService.getUsers(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const createUserThunk = createAsyncThunk(
  'admin/user/createUser',
  async (data, { rejectWithValue }) => {
    try { return await adminUserService.createUser(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateUserStatusThunk = createAsyncThunk(
  'admin/user/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try { return await adminUserService.updateStatus(id, status); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const deleteUserThunk = createAsyncThunk(
  'admin/user/deleteUser',
  async (id, { rejectWithValue }) => {
    try { await adminUserService.deleteUser(id); return id; }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchUserPermissionsThunk = createAsyncThunk(
  'admin/user/fetchPermissions',
  async (id, { rejectWithValue }) => {
    try { return await adminUserService.getUserPermissions(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateUserPermissionsThunk = createAsyncThunk(
  'admin/user/updatePermissions',
  async ({ id, permissions }, { rejectWithValue }) => {
    try { return await adminUserService.updateUserPermissions(id, permissions); }
    catch (err) { return rejectWithValue(err); }
  }
);
