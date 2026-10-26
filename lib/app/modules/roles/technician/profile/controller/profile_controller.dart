import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/models/user_model.dart';
import 'package:vmovexa/app/data/services/auth_service.dart';
import 'package:vmovexa/app/data/services/http_client_service.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';
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
      profile.value = TechnicianProfile(
        name: 'Rahul Sharma',
        role: 'Senior Technician',
        techId: 'TECH-0078',
        employeeId: 'EMP-1456',
        email: 'rahul.sharma@vmovexa.com',
        phoneNumber: '+91 98765 43210',
        dateOfBirth: '15 May 1990',
        gender: 'Male',
        address: 'Bandra East, Mumbai, Maharashtra - 400051',
        department: 'Field Operations',
        reportingManager: 'Amit Verma',
        workLocation: 'Mumbai Zone',
        joinedDate: '10 Jan 2022',
        username: 'rahul.sharma',
      );
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
        'Uploading Avatar',
        'Uploading image to server...',
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
            'Success',
            'Profile picture updated successfully.',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF2ECC71).withOpacity(0.9),
            colorText: Colors.white,
          );
        }
      } else {
        Get.snackbar(
          'Upload Failed',
          res.message ?? 'Failed to upload photo.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFFFF4D4D).withOpacity(0.9),
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Upload Error',
        'An error occurred while uploading: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFFF4D4D).withOpacity(0.9),
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

  void goToDeviceSessions() {
    Get.snackbar(
      'Device Sessions',
      'Manage active sessions functionality is coming soon.',
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

  void logout() {
    // if (Get.isRegistered<TechnicianDashboardController>()) {
    //   Get.find<TechnicianDashboardController>().logout();
    // } else {
      Get.offAllNamed(Routes.LOGIN);
    // }
  }
}
