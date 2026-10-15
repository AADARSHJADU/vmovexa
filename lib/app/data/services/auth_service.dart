import 'package:get/get.dart';
import '../constants/api_constants.dart';
import '../models/api_response_model.dart';
import '../models/auth_response_model.dart';
import '../models/user_model.dart';
import 'http_client_service.dart';
import 'storage_service.dart';

class AuthService extends GetxService {
  static AuthService get to => Get.find<AuthService>();

  HttpClientService get _http => HttpClientService.to;
  StorageService get _storage => StorageService.to;

  /// 1.1 POST /auth/login-email
  Future<ApiResponseModel<AuthResponseModel>> loginEmail({
    required String email,
    required String password,
  }) async {
    final response = await _http.post<AuthResponseModel>(
      ApiConstants.loginEmail,
      body: {
        'email': email.trim().toLowerCase(),
        'password': password,
      },
      requiresAuth: false,
      create: (data) => AuthResponseModel.fromJson(
        data is Map ? Map<String, dynamic>.from(data) : {},
      ),
    );

    if (response.success && response.data != null) {
      final authData = response.data!;
      // If tokens are returned directly (no MFA challenge)
      if (authData.accessToken != null) {
        await _storage.saveAuthData(
          accessToken: authData.accessToken!,
          refreshToken: authData.refreshToken ?? '',
          user: authData.user,
        );
      } else if (authData.user != null) {
        await _storage.saveUser(authData.user!);
      }
    }

    return response;
  }

  /// 1.2 POST /auth/login-phone
  Future<ApiResponseModel<AuthResponseModel>> loginPhone({
    required String phone,
  }) async {
    return _http.post<AuthResponseModel>(
      ApiConstants.loginPhone,
      body: {'phone': phone.trim()},
      requiresAuth: false,
      create: (data) => AuthResponseModel.fromJson(
        data is Map ? Map<String, dynamic>.from(data) : {},
      ),
    );
  }

  /// 1.3 POST /auth/verify-otp
  Future<ApiResponseModel<AuthResponseModel>> verifyOtp({
    required String phone,
    required String otp,
    String? mfaToken,
  }) async {
    final body = <String, dynamic>{
      'phone': phone.trim(),
      'otp': otp.trim(),
    };
    if (mfaToken != null && mfaToken.isNotEmpty) {
      body['mfa_token'] = mfaToken;
    }

    final response = await _http.post<AuthResponseModel>(
      ApiConstants.verifyOtp,
      body: body,
      requiresAuth: false,
      create: (data) => AuthResponseModel.fromJson(
        data is Map ? Map<String, dynamic>.from(data) : {},
      ),
    );

    if (response.success && response.data != null) {
      final authData = response.data!;
      if (authData.accessToken != null) {
        await _storage.saveAuthData(
          accessToken: authData.accessToken!,
          refreshToken: authData.refreshToken ?? '',
          user: authData.user,
        );
      } else if (authData.user != null) {
        await _storage.saveUser(authData.user!);
      }
    }

    return response;
  }

  /// 1.4 POST /auth/register
  Future<ApiResponseModel<AuthResponseModel>> register(
    Map<String, dynamic> registrationData,
  ) async {
    return _http.post<AuthResponseModel>(
      ApiConstants.register,
      body: registrationData,
      requiresAuth: false,
      create: (data) => AuthResponseModel.fromJson(
        data is Map ? Map<String, dynamic>.from(data) : {},
      ),
    );
  }

  /// POST /auth/request-signup-otp
  Future<ApiResponseModel<Map<String, dynamic>>> requestSignupOtp(
    String destination,
  ) async {
    final isEmail = destination.contains('@');
    final body = isEmail ? {'email': destination.trim()} : {'phone': destination.trim()};

    return _http.post<Map<String, dynamic>>(
      ApiConstants.requestSignupOtp,
      body: body,
      requiresAuth: false,
      create: (data) => data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{},
    );
  }

  /// POST /auth/verify-signup-otp
  Future<ApiResponseModel<Map<String, dynamic>>> verifySignupOtp({
    required String destination,
    required String otp,
  }) async {
    final isEmail = destination.contains('@');
    final body = {
      if (isEmail) 'email': destination.trim() else 'phone': destination.trim(),
      'otp': otp.trim(),
    };

    return _http.post<Map<String, dynamic>>(
      ApiConstants.verifySignupOtp,
      body: body,
      requiresAuth: false,
      create: (data) => data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{},
    );
  }

  /// 1.5 POST /auth/refresh
  Future<ApiResponseModel<AuthResponseModel>> refreshToken(
    String refreshToken,
  ) async {
    final response = await _http.post<AuthResponseModel>(
      ApiConstants.refreshToken,
      body: {'refresh_token': refreshToken},
      requiresAuth: false,
      create: (data) => AuthResponseModel.fromJson(
        data is Map ? Map<String, dynamic>.from(data) : {},
      ),
    );

    if (response.success && response.data != null) {
      final authData = response.data!;
      if (authData.accessToken != null && authData.refreshToken != null) {
        await _storage.saveTokens(
          accessToken: authData.accessToken!,
          refreshToken: authData.refreshToken!,
        );
      }
    }

    return response;
  }

  /// 1.6 GET /auth/me
  Future<ApiResponseModel<UserModel>> getMe() async {
    final response = await _http.get<UserModel>(
      ApiConstants.me,
      requiresAuth: true,
      create: (data) => UserModel.fromJson(
        data is Map ? Map<String, dynamic>.from(data) : {},
      ),
    );

    if (response.success && response.data != null) {
      await _storage.saveUser(response.data!);
    }

    return response;
  }

  /// PATCH /auth/me
  Future<ApiResponseModel<UserModel>> updateMe(
    Map<String, dynamic> updateData,
  ) async {
    final response = await _http.patch<UserModel>(
      ApiConstants.me,
      body: updateData,
      requiresAuth: true,
      create: (data) => UserModel.fromJson(
        data is Map ? Map<String, dynamic>.from(data) : {},
      ),
    );

    if (response.success && response.data != null) {
      await _storage.saveUser(response.data!);
    }

    return response;
  }

  /// 1.7 POST /auth/change-password
  Future<ApiResponseModel<dynamic>> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    return _http.post(
      ApiConstants.changePassword,
      body: {
        'current_password': currentPassword,
        'new_password': newPassword,
      },
      requiresAuth: true,
    );
  }

  /// POST /auth/forgot-password
  Future<ApiResponseModel<dynamic>> forgotPassword(String email) async {
    return _http.post(
      ApiConstants.forgotPassword,
      body: {'email': email.trim().toLowerCase()},
      requiresAuth: false,
    );
  }

  /// POST /auth/reset-password
  Future<ApiResponseModel<dynamic>> resetPassword({
    required String token,
    required String password,
  }) async {
    return _http.post(
      ApiConstants.resetPassword,
      body: {
        'token': token.trim(),
        'password': password,
      },
      requiresAuth: false,
    );
  }

  /// POST /auth/complete-organization-profile
  Future<ApiResponseModel<dynamic>> completeOrganizationProfile(
    Map<String, dynamic> data,
  ) async {
    return _http.post(
      ApiConstants.completeOrgProfile,
      body: data,
      requiresAuth: true,
    );
  }

  /// POST /auth/logout
  Future<ApiResponseModel<dynamic>> logout() async {
    try {
      await _http.post(
        ApiConstants.logout,
        requiresAuth: true,
      );
    } catch (_) {
      // Invalidate locally regardless of network response
    } finally {
      await _storage.clearAuth();
    }
    return ApiResponseModel(success: true, message: 'Logged out successfully');
  }

  /// Social Google Login (Firebase ID Token)
  Future<ApiResponseModel<AuthResponseModel>> googleLogin(String idToken) async {
    final response = await _http.post<AuthResponseModel>(
      ApiConstants.googleLogin,
      body: {'idToken': idToken},
      requiresAuth: false,
      create: (data) => AuthResponseModel.fromJson(
        data is Map ? Map<String, dynamic>.from(data) : {},
      ),
    );

    if (response.success && response.data != null) {
      final authData = response.data!;
      if (authData.accessToken != null) {
        await _storage.saveAuthData(
          accessToken: authData.accessToken!,
          refreshToken: authData.refreshToken ?? '',
          user: authData.user,
        );
      }
    }

    return response;
  }

  /// Social Zoho Auth URL
  Future<ApiResponseModel<Map<String, dynamic>>> getZohoAuthUrl({String? redirectUri}) async {
    return _http.get<Map<String, dynamic>>(
      ApiConstants.zohoUrl,
      queryParams: redirectUri != null ? {'redirectUri': redirectUri} : null,
      requiresAuth: false,
      create: (data) => data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{},
    );
  }

  /// Social Zoho Exchange
  Future<ApiResponseModel<AuthResponseModel>> zohoExchange({
    required String code,
    String mode = 'login',
    String? redirectUri,
  }) async {
    final response = await _http.post<AuthResponseModel>(
      ApiConstants.zohoAuth,
      body: {
        'code': code,
        'mode': mode,
        if (redirectUri != null) 'redirectUri': redirectUri,
      },
      requiresAuth: false,
      create: (data) => AuthResponseModel.fromJson(
        data is Map ? Map<String, dynamic>.from(data) : {},
      ),
    );

    if (response.success && response.data != null) {
      final authData = response.data!;
      if (authData.accessToken != null && authData.refreshToken != null) {
        await _storage.saveAuthData(
          accessToken: authData.accessToken!,
          refreshToken: authData.refreshToken!,
          user: authData.user,
        );
      }
    }

    return response;
  }
}
