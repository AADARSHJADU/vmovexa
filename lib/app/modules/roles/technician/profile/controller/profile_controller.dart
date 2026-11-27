import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/models/user_model.dart';
import 'package:vmovexa/app/data/services/auth_service.dart';
import 'package:vmovexa/app/data/services/http_client_service.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../model/profile_model.dart';
import '../../technician_dashboard/controller/technician_dashboard_controller.dart';
import '../../../../../routes/app_routes.dart';

class ProfileController extends GetxController {
  final profile = Rxn<TechnicianProfile>();
  final isLoading = false.obs;
  final isUploadingPhoto = false.obs;
  final isDarkMode = true.obs;
  final selectedLanguage = 'English'.obs;

  @override
  void onInit() {
    super.onInit();
    loadProfileData();
  }

  Future<void> loadProfileData({bool showLoader = true}) async {
    // 1. Immediately populate from local cache if available for instant display
    if (Get.isRegistered<StorageService>()) {
      final cachedUser = StorageService.to.getUser();
      if (cachedUser != null) {
        profile.value = TechnicianProfile.fromUserModel(cachedUser);
      }
    }

    if (profile.value == null && showLoader) {
      isLoading.value = true;
    }

    // 2. Fetch live data from backend GET /auth/me
    try {
      if (Get.isRegistered<AuthService>()) {
        final res = await AuthService.to.getMe();
        if (res.success && res.data != null) {
          profile.value = TechnicianProfile.fromUserModel(res.data!);
        }
      }
    } catch (e) {
      debugPrint('Failed to load technician profile from API: $e');
    } finally {
      isLoading.value = false;
    }

    // Fallback if still null
    if (profile.value == null) {
      final cachedUser = Get.isRegistered<StorageService>() ? StorageService.to.getUser() : null;
      if (cachedUser != null) {
        profile.value = TechnicianProfile.fromUserModel(cachedUser);
      } else {
        profile.value = TechnicianProfile(
          name: 'Technician',
          role: 'Central Field Technician',
          techId: 'TECH-001',
          employeeId: 'EMP-001',
          email: '',
          phoneNumber: '',
          dateOfBirth: '',
          gender: '',
          address: '',
          department: 'Field Operations',
          reportingManager: 'Operations Lead',
          workLocation: 'Central Depot',
          joinedDate: '',
          username: 'technician',
        );
      }
    }
  }

  /// Change profile avatar with Camera / Gallery selection sheet
  void changePhoto() {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 22),
        decoration: const BoxDecoration(
          color: Color(0xFF15151F),
          borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
          border: Border(top: BorderSide(color: Color(0x24B042FF), width: 1.5)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Upload Profile Photo',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, color: Colors.white70, size: 20),
                  onPressed: () => Get.back(),
                ),
              ],
            ),
            const SizedBox(height: 4),
            const Text(
              'Select photo source to update your technician avatar:',
              style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
            ),
            const SizedBox(height: 18),
            ListTile(
              leading: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0x26B042FF),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.camera_alt_rounded, color: Color(0xFFB042FF), size: 22),
              ),
              title: const Text(
                'Take Photo with Camera',
                style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
              ),
              subtitle: const Text(
                'Capture new photo instantly',
                style: TextStyle(color: Color(0xFF64748B), fontSize: 11),
              ),
              trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFF64748B), size: 20),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              onTap: () {
                Get.back();
                pickAndUploadImage(ImageSource.camera);
              },
            ),
            const SizedBox(height: 8),
            ListTile(
              leading: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0x2610B981),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.photo_library_rounded, color: Color(0xFF10B981), size: 22),
              ),
              title: const Text(
                'Choose from Gallery',
                style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
              ),
              subtitle: const Text(
                'Pick image from your device photos',
                style: TextStyle(color: Color(0xFF64748B), fontSize: 11),
              ),
              trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFF64748B), size: 20),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              onTap: () {
                Get.back();
                pickAndUploadImage(ImageSource.gallery);
              },
            ),
          ],
        ),
      ),
      isScrollControlled: true,
    );
  }

  /// Pick from camera or gallery and upload via multipart POST /uploads
  Future<void> pickAndUploadImage(ImageSource source) async {
    try {
      final picker = ImagePicker();
      final pickedFile = await picker.pickImage(
        source: source,
        maxWidth: 1024,
        maxHeight: 1024,
        imageQuality: 85,
      );

      if (pickedFile == null) return;

      isUploadingPhoto.value = true;
      Get.snackbar(
        'uploading_photo'.tr,
        'uploading_doc_msg'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFB042FF),
        colorText: Colors.white,
        duration: const Duration(seconds: 2),
      );

      final res = await HttpClientService.to.uploadFile(
        filePath: pickedFile.path,
        purpose: 'avatar',
      );

      if (res.success && res.data != null) {
        final rawUrl = res.data!['url']?.toString() ??
            res.data!['file_url']?.toString() ??
            res.data!['avatar_url']?.toString() ??
            res.data!['path']?.toString();

        if (rawUrl != null && rawUrl.isNotEmpty) {
          final resolved = ApiConstants.resolveFileUrl(rawUrl);

          // 1. Immediately update profile on backend PATCH /auth/me
          if (Get.isRegistered<AuthService>()) {
            await AuthService.to.updateMe({'avatar_url': rawUrl});
          }

          // 2. Update local state
          if (profile.value != null) {
            profile.value = profile.value!.copyWith(profilePicture: resolved);
          }

          // 3. Update cached user in storage
          if (Get.isRegistered<StorageService>()) {
            final currentUser = StorageService.to.getUser();
            if (currentUser != null) {
              final updated = UserModel(
                id: currentUser.id,
                code: currentUser.code,
                enrollmentNo: currentUser.enrollmentNo,
                name: currentUser.name,
                email: currentUser.email,
                phone: currentUser.phone,
                avatarUrl: resolved,
                role: currentUser.role,
                roleId: currentUser.roleId,
                organizationId: currentUser.organizationId,
                organizationName: currentUser.organizationName,
                status: currentUser.status,
                organization: currentUser.organization,
                permissions: currentUser.permissions,
                branch: currentUser.branch,
                officeAddress: currentUser.officeAddress,
                language: currentUser.language,
                timezone: currentUser.timezone,
                companyName: currentUser.companyName,
              );
              await StorageService.to.saveUser(updated);
            }
          }

          Get.snackbar(
            'success'.tr,
            'photo_uploaded_successfully'.tr,
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF2ECC71).withValues(alpha: 0.9),
            colorText: Colors.white,
          );
        }
      } else {
        Get.snackbar(
          'upload_failed'.tr,
          res.message ?? 'Failed to upload photo.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFFFF4D4D).withValues(alpha: 0.9),
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar(
        'upload_error'.tr,
        'An error occurred while uploading: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFFF4D4D).withValues(alpha: 0.9),
        colorText: Colors.white,
      );
    } finally {
      isUploadingPhoto.value = false;
    }
  }

  void editProfile() async {
    final result = await Get.toNamed(Routes.TECHNICIAN_EDIT_PROFILE);
    if (result == true) {
      loadProfileData(showLoader: false);
    }
  }

  void changePassword() {
    Get.toNamed(Routes.CHANGE_PASSWORD);
  }

  void goToNotificationSettings() {
    Get.toNamed(Routes.NOTIFICATION_SETTINGS);
  }

  void goToPrivacyPolicy() {
    Get.toNamed(Routes.PRIVACY_POLICY, arguments: {'role': 'ROLE-CENTRAL-TECH'});
  }

  void goToTermsConditions() {
    Get.toNamed(Routes.TERMS_CONDITIONS, arguments: {'role': 'ROLE-CENTRAL-TECH'});
  }

  void goToHelpSupport() {
    Get.toNamed(Routes.TECHNICIAN_HELP_SUPPORT);
  }

  void goToDeviceSessions() {
    Get.snackbar(
      'device_sessions'.tr,
      'manage_sessions_coming_soon'.tr,
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF15151F),
      colorText: Colors.white,
    );
  }

  void changeLanguage() {
    // Toggle between English and Hindi as a demonstration
    if (selectedLanguage.value == 'English') {
      selectedLanguage.value = 'Hindi';
      Get.updateLocale(const Locale('hi', 'IN'));
    } else {
      selectedLanguage.value = 'English';
      Get.updateLocale(const Locale('en', 'US'));
    }
  }

  void toggleDarkMode(bool value) {
    isDarkMode.value = value;
    Get.changeThemeMode(value ? ThemeMode.dark : ThemeMode.light);
  }

  void onBackPressed() {
    if (Get.isRegistered<TechnicianDashboardController>()) {
      Get.find<TechnicianDashboardController>().selectedNavIndex.value = 0;
    } else {
      Get.back();
    }
  }

  void confirmLogout() {
    if (Get.isRegistered<TechnicianDashboardController>()) {
      Get.find<TechnicianDashboardController>().confirmLogout();
    } else {
      Get.dialog(
        Dialog(
          backgroundColor: const Color(0xFF15151F),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: BorderSide(color: Colors.white.withValues(alpha: 0.08)),
          ),
          child: Padding(
            padding: const EdgeInsets.all(22),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    color: const Color(0xFFEF4444).withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                  ),
                  child: const Center(
                    child: Icon(Icons.logout_rounded, color: Color(0xFFEF4444), size: 26),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'confirm_logout'.tr,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'logout_technician_confirm_msg'.tr,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13, height: 1.4),
                ),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Get.back(),
                        style: OutlinedButton.styleFrom(
                          side: BorderSide(color: Colors.white.withValues(alpha: 0.15)),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        child: Text('cancel'.tr, style: const TextStyle(color: Colors.white70, fontWeight: FontWeight.w600)),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: GestureDetector(
                        onTap: () async {
                          Get.back();
                          await logout();
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            gradient: AppTheme.primaryGradient,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Center(
                            child: Text(
                              'log_out'.tr,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      );
    }
  }

  Future<void> logout() async {
    try {
      if (Get.isRegistered<AuthService>()) {
        await AuthService.to.logout();
      }
    } catch (_) {}
    Get.offAllNamed(Routes.LOGIN);
  }
}
