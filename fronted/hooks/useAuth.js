/**
 * useAuth.js — the ONLY auth surface components should touch.
 * Wraps dispatch(thunks) + selectors. Components never import thunks/services directly.
 */
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  loginThunk, verifyLoginOtpThunk, loginWithGoogleThunk, registerThunk, registerWithGoogleThunk, loginWithZohoThunk, loginWithAppleThunk, loginWithFirebaseAppleThunk, registerWithAppleThunk, resubmitRegistrationThunk, requestSignupOtpThunk, verifySignupOtpThunk, forgotPasswordThunk, resetPasswordThunk, changePasswordThunk, fetchMeThunk, updateMeThunk, completeOrganizationProfileThunk, logoutThunk, clearAuthError,
  selectUser, selectRole, selectPermissions, selectIsAuthenticated,
  selectAuthStatus, selectAuthError, selectBootstrapped,
} from '../store/slices/authSlice';
import { storage } from '../utils/storage';
import { WILDCARD_PERMISSION, toPortalKeys } from '../constants/roles';
import { impersonationService } from '../api/services/superadmin/impersonation.service';

export function useAuth() {
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectUser);
  const role = useAppSelector(selectRole);
  const permissions = useAppSelector(selectPermissions);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);
  const bootstrapped = useAppSelector(selectBootstrapped);

  // Thunks return a promise; unwrap() throws on rejection so callers can try/catch.
  const login = useCallback((email, password) => dispatch(loginThunk({ email, password })).unwrap(), [dispatch]);
  const verifyLoginOtp = useCallback((payload) => dispatch(verifyLoginOtpThunk(payload)).unwrap(), [dispatch]);
  const loginWithGoogle = useCallback((idToken) => dispatch(loginWithGoogleThunk(idToken)).unwrap(), [dispatch]);
  const register = useCallback((payload) => dispatch(registerThunk(payload)).unwrap(), [dispatch]);
  const registerWithGoogle = useCallback((payload) => dispatch(registerWithGoogleThunk(payload)).unwrap(), [dispatch]);
  const loginWithZoho = useCallback((payload) => dispatch(loginWithZohoThunk(payload)).unwrap(), [dispatch]);
  const loginWithApple = useCallback((payload) => dispatch(loginWithAppleThunk(payload)).unwrap(), [dispatch]);
  const loginWithFirebaseApple = useCallback((idToken) => dispatch(loginWithFirebaseAppleThunk(idToken)).unwrap(), [dispatch]);
  const registerWithApple = useCallback((payload) => dispatch(registerWithAppleThunk(payload)).unwrap(), [dispatch]);
  const resubmitRegistration = useCallback((payload) => dispatch(resubmitRegistrationThunk(payload)).unwrap(), [dispatch]);
  const requestSignupOtp = useCallback(({ name, email }) => dispatch(requestSignupOtpThunk({ name, email })).unwrap(), [dispatch]);
  const verifySignupOtp = useCallback((payload) => dispatch(verifySignupOtpThunk(payload)).unwrap(), [dispatch]);
  const forgotPassword = useCallback((email) => dispatch(forgotPasswordThunk(email)).unwrap(), [dispatch]);
  const resetPassword = useCallback((payload) => dispatch(resetPasswordThunk(payload)).unwrap(), [dispatch]);
  const changePassword = useCallback((payload) => dispatch(changePasswordThunk(payload)).unwrap(), [dispatch]);
  const loadSession = useCallback(() => dispatch(fetchMeThunk()).unwrap(), [dispatch]);
  const logout = useCallback(() => dispatch(logoutThunk()).unwrap(), [dispatch]);
  const updateProfile = useCallback((patch) => dispatch(updateMeThunk(patch)).unwrap(), [dispatch]);
  const completeOrganizationProfile = useCallback((payload) => dispatch(completeOrganizationProfileThunk(payload)).unwrap(), [dispatch]);
  const clearError = useCallback(() => dispatch(clearAuthError()), [dispatch]);

  // Exact-match RBAC: only Super Admin ('*') bypasses. No role-name guessing.
  // perm: a full key ('fleet.vehicles.view') or an array (any-of).
  const hasPermission = useCallback(
    (perm) => {
      const userPerms = Array.isArray(permissions) ? permissions : [];
      if (userPerms.includes(WILDCARD_PERMISSION)) return true;
      if (Array.isArray(perm)) return perm.some((p) => userPerms.includes(p));
      return userPerms.includes(perm);
    },
    [permissions]
  );
  // Portal-relative check: can('vehicles.view') -> <my portal>.vehicles.view (admin: devices->edge_devices).
  const can = useCallback((rel) => hasPermission(toPortalKeys(typeof user?.role === 'string' ? user.role : user?.role?.code, rel)), [hasPermission, user]);
  const impersonateTenant = useCallback(async (orgId, reason) => {
    const res = await impersonationService.impersonateTenant(orgId, reason);
    storage.startImpersonation(res.impersonationToken, {
      id: res.target?.id,
      name: res.target?.name,
      email: res.target?.email,
      role: res.target?.role,
      tenantName: res.target?.organization?.name,
      tenantId: orgId,
    });
    await dispatch(fetchMeThunk()).unwrap();
    return res;
  }, [dispatch]);

  const impersonateUser = useCallback(async (userId, reason) => {
    const res = await impersonationService.impersonateUser(userId, reason);
    storage.startImpersonation(res.impersonationToken, {
      id: res.target?.id,
      name: res.target?.name,
      email: res.target?.email,
      role: res.target?.role,
    });
    await dispatch(fetchMeThunk()).unwrap();
    return res;
  }, [dispatch]);

  const impersonateAdvertiser = useCallback(async (advId, reason) => {
    const res = await impersonationService.impersonateAdvertiser(advId, reason);
    storage.startImpersonation(res.impersonationToken, {
      id: res.target?.id,
      name: res.target?.name,
      email: res.target?.email,
      role: res.target?.role,
      advertiserName: res.target?.advertiser?.name || res.target?.advertiser?.company_name,
      advertiserId: advId,
    });
    await dispatch(fetchMeThunk()).unwrap();
    return res;
  }, [dispatch]);

  const stopImpersonation = useCallback(async () => {
    try {
      await impersonationService.stopImpersonation();
    } catch {
      /* ignore */
    }
    storage.stopImpersonation();
    await dispatch(fetchMeThunk()).unwrap();
  }, [dispatch]);

  return {
    user, role, permissions, isAuthenticated, status, error, bootstrapped,
    isSuperAdmin: Array.isArray(permissions) && permissions.includes(WILDCARD_PERMISSION),
    isLoading: status === 'loading',
    isImpersonating: storage.isImpersonating(),
    impersonationTarget: storage.getImpersonationTarget(),
    login, verifyLoginOtp, loginWithGoogle, register, registerWithGoogle, loginWithZoho, loginWithApple, loginWithFirebaseApple, registerWithApple, resubmitRegistration, requestSignupOtp, verifySignupOtp, forgotPassword, resetPassword, changePassword, loadSession, fetchMe: loadSession, logout, updateProfile, completeOrganizationProfile, clearError, hasPermission, can,
    impersonateTenant, impersonateAdvertiser, impersonateUser, stopImpersonation,
  };
}

export default useAuth;
