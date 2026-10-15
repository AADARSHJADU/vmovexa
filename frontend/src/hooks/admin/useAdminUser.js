import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectAdminUsers,
  selectAdminUserPagination,
  selectAdminUserLoading,
  fetchUsersThunk,
  createUserThunk,
  updateUserStatusThunk,
  deleteUserThunk,
  fetchUserPermissionsThunk,
  updateUserPermissionsThunk,
} from '../../store/slices/admin/userSlice.js';

export const useAdminUser = () => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectAdminUsers);
  const pagination = useAppSelector(selectAdminUserPagination);
  const loading = useAppSelector(selectAdminUserLoading);

  const loadUsers = useCallback((params) => dispatch(fetchUsersThunk(params)).unwrap(), [dispatch]);
  const createUser = useCallback((data) => dispatch(createUserThunk(data)).unwrap(), [dispatch]);
  const updateStatus = useCallback((id, status) => dispatch(updateUserStatusThunk({ id, status })).unwrap(), [dispatch]);
  const deleteUser = useCallback((id) => dispatch(deleteUserThunk(id)).unwrap(), [dispatch]);
  const getUserPermissions = useCallback((id) => dispatch(fetchUserPermissionsThunk(id)).unwrap(), [dispatch]);
  const updateUserPermissions = useCallback((id, permissions) => dispatch(updateUserPermissionsThunk({ id, permissions })).unwrap(), [dispatch]);

  return { users, pagination, loading, loadUsers, createUser, updateStatus, deleteUser, getUserPermissions, updateUserPermissions };
};

export default useAdminUser;
