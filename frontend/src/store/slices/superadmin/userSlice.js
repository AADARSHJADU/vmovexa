import { createSlice } from '@reduxjs/toolkit';
import {
  fetchUsersThunk,
  createUserThunk,
  updateUserThunk,
  updateUserStatusThunk,
  deleteUserThunk,
  inviteUserThunk,
  fetchUserPermissionsThunk,
  updateUserPermissionsThunk,
} from '../../thunks/superadmin/user.thunks.js';

export {
  fetchUsersThunk,
  createUserThunk,
  updateUserThunk,
  updateUserStatusThunk,
  deleteUserThunk,
  inviteUserThunk,
  fetchUserPermissionsThunk,
  updateUserPermissionsThunk,
};

const initialState = {
  users: [],
  pagination: { page: 1, limit: 6, total: 0, totalPages: 1 },
  status: 'idle',
  error: null,
};

const superUserSlice = createSlice({
  name: 'superUser',
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

export default superUserSlice.reducer;
export const selectSuperUsers = (state) => state.superUser.users;
export const selectSuperUserLoading = (state) => state.superUser.status === 'loading';
export const selectSuperUserPagination = (state) => state.superUser.pagination || { page: 1, limit: 6, total: 0, totalPages: 1 };
