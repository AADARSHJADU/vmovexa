import { createAsyncThunk } from '@reduxjs/toolkit';
import { superUserService } from '../../../api/services/superadmin/user.service.js';

export const fetchUsersThunk = createAsyncThunk(
  'superadmin/user/fetchUsers',
  async (params, { rejectWithValue }) => {
    try { return await superUserService.getUsers(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const createUserThunk = createAsyncThunk(
  'superadmin/user/createUser',
  async (data, { rejectWithValue }) => {
    try { return await superUserService.createUser(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateUserThunk = createAsyncThunk(
  'superadmin/user/updateUser',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await superUserService.updateUser(id, data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateUserStatusThunk = createAsyncThunk(
  'superadmin/user/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try { return await superUserService.updateStatus(id, status); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const deleteUserThunk = createAsyncThunk(
  'superadmin/user/deleteUser',
  async (id, { rejectWithValue }) => {
    try { return await superUserService.deleteUser(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const inviteUserThunk = createAsyncThunk(
  'superadmin/user/inviteUser',
  async (data, { rejectWithValue }) => {
    try { return await superUserService.inviteUser(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchUserPermissionsThunk = createAsyncThunk(
  'superadmin/user/fetchPermissions',
  async (id, { rejectWithValue }) => {
    try { return await superUserService.getUserPermissions(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateUserPermissionsThunk = createAsyncThunk(
  'superadmin/user/updatePermissions',
  async ({ id, permissions: denied }, { rejectWithValue }) => {
    try { return await superUserService.updateUserPermissions(id, denied); }
    catch (err) { return rejectWithValue(err); }
  }
);

// Back to the role's default permissions (removes every revoke).
export const resetUserPermissionsThunk = createAsyncThunk(
  'superadmin/user/resetPermissions',
  async (id, { rejectWithValue }) => {
    try { return await superUserService.resetUserPermissions(id); }
    catch (err) { return rejectWithValue(err); }
  }
);
