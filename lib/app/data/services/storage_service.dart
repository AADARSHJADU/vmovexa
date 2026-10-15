import 'dart:convert';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';

class StorageService extends GetxService {
  static StorageService get to => Get.find<StorageService>();

  late SharedPreferences _prefs;

  static const String _keyAccessToken = 'vmovexa_access_token';
  static const String _keyRefreshToken = 'vmovexa_refresh_token';
  static const String _keyUser = 'vmovexa_user';
  static const String _keyRole = 'vmovexa_current_role';

  Future<StorageService> init() async {
    _prefs = await SharedPreferences.getInstance();
    return this;
  }

  // Save access & refresh tokens
  Future<void> saveTokens({required String accessToken, required String refreshToken}) async {
    await _prefs.setString(_keyAccessToken, accessToken);
    await _prefs.setString(_keyRefreshToken, refreshToken);
  }

  // Save entire auth session
  Future<void> saveAuthData({
    required String accessToken,
    required String refreshToken,
    UserModel? user,
  }) async {
    await saveTokens(accessToken: accessToken, refreshToken: refreshToken);
    if (user != null) {
      await saveUser(user);
    }
  }

  // Save user profile
  Future<void> saveUser(UserModel user) async {
    await _prefs.setString(_keyUser, jsonEncode(user.toJson()));
    if (user.role != null) {
      await _prefs.setString(_keyRole, user.displayRole);
    }
  }

  // Retrieve access token
  String? getAccessToken() {
    return _prefs.getString(_keyAccessToken);
  }

  // Retrieve refresh token
  String? getRefreshToken() {
    return _prefs.getString(_keyRefreshToken);
  }

  // Retrieve user model
  UserModel? getUser() {
    final userJson = _prefs.getString(_keyUser);
    if (userJson != null) {
      try {
        return UserModel.fromJson(jsonDecode(userJson) as Map<String, dynamic>);
      } catch (_) {}
    }
    return null;
  }

  // Retrieve current active role
  String? getCurrentRole() {
    return _prefs.getString(_keyRole);
  }

  Future<void> setCurrentRole(String role) async {
    await _prefs.setString(_keyRole, role);
  }

  // Check if session exists
  bool isLoggedIn() {
    final token = getAccessToken();
    return token != null && token.isNotEmpty;
  }

  // Clear session on logout
  Future<void> clearAuth() async {
    await _prefs.remove(_keyAccessToken);
    await _prefs.remove(_keyRefreshToken);
    await _prefs.remove(_keyUser);
    await _prefs.remove(_keyRole);
  }
}
