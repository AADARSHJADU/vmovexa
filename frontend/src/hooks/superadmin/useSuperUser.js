import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectSuperUsers,
  selectSuperUserLoading,
  selectSuperUserPagination,
  fetchUsersThunk,
  createUserThunk,
  updateUserThunk,
  updateUserStatusThunk,
  deleteUserThunk,
  inviteUserThunk,
  fetchUserPermissionsThunk,
  updateUserPermissionsThunk,
} from '../../store/slices/superadmin/userSlice.js';

export const useSuperUser = () => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectSuperUsers);
  const loading = useAppSelector(selectSuperUserLoading);
  const pagination = useAppSelector(selectSuperUserPagination);

  const loadUsers = useCallback((params) => dispatch(fetchUsersThunk(params)).unwrap(), [dispatch]);
  const createUser = useCallback((data) => dispatch(createUserThunk(data)).unwrap(), [dispatch]);
  const updateUser = useCallback((id, data) => dispatch(updateUserThunk({ id, data })).unwrap(), [dispatch]);
  const updateStatus = useCallback((id, status) => dispatch(updateUserStatusThunk({ id, status })).unwrap(), [dispatch]);
  const deleteUser = useCallback((id) => dispatch(deleteUserThunk(id)).unwrap(), [dispatch]);
  const inviteUser = useCallback((data) => dispatch(inviteUserThunk(data)).unwrap(), [dispatch]);
  const getUserPermissions = useCallback((id) => dispatch(fetchUserPermissionsThunk(id)).unwrap(), [dispatch]);
  const updateUserPermissions = useCallback((id, permissions) => dispatch(updateUserPermissionsThunk({ id, permissions })).unwrap(), [dispatch]);

  return {
    users,
    loading,
    pagination,
    loadUsers,
    createUser,
    updateUser,
    updateStatus,
    deleteUser,
    inviteUser,
    getUserPermissions,
    updateUserPermissions,
  };
};

export default useSuperUser;
