import { createSlice } from '@reduxjs/toolkit';
import {
  fetchUsersThunk,
  createUserThunk,
  updateUserStatusThunk,
  deleteUserThunk,
  fetchUserPermissionsThunk,
  updateUserPermissionsThunk,
} from '../../thunks/admin/user.thunks.js';

export {
  fetchUsersThunk,
  createUserThunk,
  updateUserStatusThunk,
  deleteUserThunk,
  fetchUserPermissionsThunk,
  updateUserPermissionsThunk,
};

const initialState = {
  users: [],
  pagination: { page: 1, limit: 6, total: 0, totalPages: 1 },
  status: 'idle',
  error: null,
};

const adminUserSlice = createSlice({
  name: 'adminUser',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchUsersThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload && action.payload.rows) {
          state.users = action.payload.rows;
          state.pagination = action.payload.meta || state.pagination;
        } else if (Array.isArray(action.payload)) {
          state.users = action.payload;
        } else {
          state.users = [];
        }
      })
      .addCase(fetchUsersThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default adminUserSlice.reducer;
export const selectAdminUsers = (state) => state.adminUser.users;
export const selectAdminUserLoading = (state) => state.adminUser.status === 'loading';
export const selectAdminUserPagination = (state) => state.adminUser.pagination || { page: 1, limit: 6, total: 0, totalPages: 1 };
