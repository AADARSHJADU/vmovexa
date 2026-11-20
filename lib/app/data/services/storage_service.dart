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
  static const String _keyLanguageCode = 'vmovexa_language_code';
  static const String _keyCountryCode = 'vmovexa_country_code';

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

  // Language persistence
  Future<void> saveLanguage(String languageCode, String countryCode) async {
    await _prefs.setString(_keyLanguageCode, languageCode);
    await _prefs.setString(_keyCountryCode, countryCode);
  }

  String getLanguageCode() {
    return _prefs.getString(_keyLanguageCode) ?? 'en';
  }

  String getCountryCode() {
    return _prefs.getString(_keyCountryCode) ?? 'US';
  }

  static const String _keyCampaignDraft = 'vmovexa_draft_campaign';

  // Save campaign draft
  Future<void> saveCampaignDraft(Map<String, dynamic> data) async {
    await _prefs.setString(_keyCampaignDraft, jsonEncode(data));
  }

  // Get campaign draft
  Map<String, dynamic>? getCampaignDraft() {
    final raw = _prefs.getString(_keyCampaignDraft);
    if (raw != null && raw.isNotEmpty) {
      try {
        return jsonDecode(raw) as Map<String, dynamic>;
      } catch (_) {}
    }
    return null;
  }

  // Has campaign draft
  bool hasCampaignDraft() {
    final raw = _prefs.getString(_keyCampaignDraft);
    return raw != null && raw.isNotEmpty;
  }

  // Clear campaign draft
  Future<void> clearCampaignDraft() async {
    await _prefs.remove(_keyCampaignDraft);
  }

  static const String _keyGovCampaignDraft = 'vmovexa_draft_gov_campaign';

  // Save government campaign draft
  Future<void> saveGovCampaignDraft(Map<String, dynamic> data) async {
    await _prefs.setString(_keyGovCampaignDraft, jsonEncode(data));
  }

  // Get government campaign draft
  Map<String, dynamic>? getGovCampaignDraft() {
    final raw = _prefs.getString(_keyGovCampaignDraft);
    if (raw != null && raw.isNotEmpty) {
      try {
        return jsonDecode(raw) as Map<String, dynamic>;
      } catch (_) {}
    }
    return null;
  }

  // Has government campaign draft
  bool hasGovCampaignDraft() {
    final raw = _prefs.getString(_keyGovCampaignDraft);
    return raw != null && raw.isNotEmpty;
  }

  // Clear government campaign draft
  Future<void> clearGovCampaignDraft() async {
    await _prefs.remove(_keyGovCampaignDraft);
  }

  // Clear session on logout
  Future<void> clearAuth() async {
    await _prefs.remove(_keyAccessToken);
    await _prefs.remove(_keyRefreshToken);
    await _prefs.remove(_keyUser);
    await _prefs.remove(_keyRole);
  }
}
