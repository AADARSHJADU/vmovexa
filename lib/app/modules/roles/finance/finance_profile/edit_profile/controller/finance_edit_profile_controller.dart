import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:vmovexa/app/data/services/auth_service.dart';
import 'package:vmovexa/app/data/services/http_client_service.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';
import 'package:vmovexa/app/modules/roles/finance/finance_profile/profile/controller/finance_profile_controller.dart';

class FinanceEditProfileController extends GetxController {
  // Form controllers mirroring Admin Panel FinanceOfficerAccountSettingsPage
  final fullNameController = TextEditingController();
  final emailController = TextEditingController();
  final phoneController = TextEditingController();
  final badgeIdController = TextEditingController();

  final companyNameController = TextEditingController();
  final branchController = TextEditingController();
  final addressController = TextEditingController();

  // Avatar state
  final RxString avatarUrl = ''.obs;
  final RxBool isUploadingPhoto = false.obs;
  final RxBool isSaving = false.obs;

  // Language & Regional preferences
  final RxString selectedLanguage = 'en'.obs;
  final RxString selectedTimezone = 'Asia/Kolkata'.obs;

  final List<Map<String, String>> languages = [
    {'code': 'en', 'name': 'English (Default)'},
    {'code': 'hi', 'name': 'हिंदी (Hindi)'},
    {'code': 'kn', 'name': 'ಕನ್ನಡ (Kannada)'},
    {'code': 'mr', 'name': 'मराठी (Marathi)'},
    {'code': 'ta', 'name': 'தமிழ் (Tamil)'},
    {'code': 'te', 'name': 'తెలుగు (Telugu)'},
    {'code': 'bn', 'name': 'বাংলা (Bengali)'},
    {'code': 'gu', 'name': 'ગુજરાતી (Gujarati)'},
  ];

  final List<Map<String, String>> timezones = [
    {'code': 'Asia/Kolkata', 'name': 'Asia/Kolkata (IST +05:30)'},
    {'code': 'UTC', 'name': 'UTC (Universal Time Coordinated)'},
    {'code': 'Asia/Dubai', 'name': 'Asia/Dubai (GST +04:00)'},
    {'code': 'Asia/Singapore', 'name': 'Asia/Singapore (SGT +08:00)'},
  ];

  @override
  void onInit() {
    super.onInit();
    loadCurrentUserData();
  }

  void loadCurrentUserData() {
    try {
      if (Get.isRegistered<StorageService>()) {
        final user = StorageService.to.getUser();
        if (user != null) {
          fullNameController.text = user.name ?? '';
          emailController.text = user.email ?? '';
          phoneController.text = user.phone ?? '';
          badgeIdController.text = user.enrollmentNo ?? user.code ?? (user.id != null ? 'FIN-${user.id}' : 'FIN-101');
          companyNameController.text = user.companyName ?? user.organization?.name ?? 'VMOVEXA Private Limited';
          branchController.text = user.branch ?? 'Corporate Finance & Accounts Wing';
          addressController.text = user.officeAddress ?? user.organization?.officeAddress ?? '101, Business Hub, Bandra Kurla Complex, Mumbai, Maharashtra - 400051';

          avatarUrl.value = user.avatarUrl ?? '';

          if (user.language != null && user.language!.isNotEmpty) {
            selectedLanguage.value = _normalizeLanguageCode(user.language!);
          }
          if (user.timezone != null && user.timezone!.isNotEmpty) {
            selectedTimezone.value = _normalizeTimezoneCode(user.timezone!);
          }
        }
      }
    } catch (_) {}
  }

  String _normalizeLanguageCode(String raw) {
    final lower = raw.trim().toLowerCase();
    for (final lang in languages) {
      if (lang['code']?.toLowerCase() == lower) {
        return lang['code']!;
      }
    }
    if (lower.contains('eng')) return 'en';
    if (lower.contains('hin')) return 'hi';
    if (lower.contains('kan')) return 'kn';
    if (lower.contains('mar')) return 'mr';
    if (lower.contains('tam')) return 'ta';
    if (lower.contains('tel')) return 'te';
    if (lower.contains('ben') || lower.contains('bang')) return 'bn';
    if (lower.contains('guj')) return 'gu';

    for (final lang in languages) {
      if ((lang['name'] ?? '').toLowerCase().contains(lower)) {
        return lang['code']!;
      }
    }
    return 'en';
  }

  String _normalizeTimezoneCode(String raw) {
    final trimmed = raw.trim();
    for (final tz in timezones) {
      if (tz['code'] == trimmed) return tz['code']!;
    }
    final lower = trimmed.toLowerCase();
    for (final tz in timezones) {
      if (tz['code']!.toLowerCase() == lower) return tz['code']!;
    }
    if (lower.contains('kolkata') || lower.contains('calcutta') || lower.contains('ist')) {
      return 'Asia/Kolkata';
    }
    if (lower.contains('utc') || lower.contains('gmt')) {
      return 'UTC';
    }
    if (lower.contains('dubai') || lower.contains('gst')) {
      return 'Asia/Dubai';
    }
    if (lower.contains('singapore') || lower.contains('sgt')) {
      return 'Asia/Singapore';
    }
    return 'Asia/Kolkata';
  }

  /// Select photo source via BottomSheet (Camera / Gallery)
  void openPhotoSourcePicker() {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 22),
        decoration: const BoxDecoration(
          color: Color(0xFF15151F),
          borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
          border: Border(top: BorderSide(color: Color(0x33B042FF), width: 1.5)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Change Profile Photo',
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
              'Select photo source for your Finance Officer avatar:',
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
                'Capture fresh image instantly',
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
                  color: const Color(0x266366F1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.photo_library_rounded, color: Color(0xFF6366F1), size: 22),
              ),
              title: const Text(
                'Choose from Gallery',
                style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
              ),
              subtitle: const Text(
                'Pick an existing photo from library',
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

  /// Upload chosen image to POST /uploads with purpose 'avatar'
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
        'Uploading profile photo to server...',
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
          avatarUrl.value = rawUrl;

          // Sync directly via PATCH /auth/me for instant save
          if (Get.isRegistered<AuthService>()) {
            await AuthService.to.updateMe({
              'avatar_url': rawUrl,
              'avatarUrl': rawUrl,
            });
          }

          // Trigger profile controller refresh
          if (Get.isRegistered<FinanceProfileController>()) {
            Get.find<FinanceProfileController>().fetchProfileData();
          }

          Get.snackbar(
            'Success',
            'Profile picture uploaded successfully.',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
          );
        }
      } else {
        Get.snackbar(
          'Upload Failed',
          res.message ?? 'Failed to upload photo.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Upload Error',
        'Error uploading photo: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
      );
    } finally {
      isUploadingPhoto.value = false;
    }
  }

  void removePhoto() {
    avatarUrl.value = '';
    Get.snackbar(
      'Photo Removed',
      'Click "Save Changes" to apply removal on server.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF6366F1),
      colorText: Colors.white,
    );
  }

  /// Save profile changes via PATCH /auth/me
  Future<void> saveProfile() async {
    final name = fullNameController.text.trim();
    if (name.isEmpty) {
      Get.snackbar(
        'Validation Error',
        'Officer Full Name is required.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
      );
      return;
    }

    final email = emailController.text.trim();
    if (email.isEmpty) {
      Get.snackbar(
        'Validation Error',
        'Corporate Finance Email is required.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
      );
      return;
    }

    isSaving.value = true;
    try {
      final Map<String, dynamic> payload = {
        'name': name,
        'email': email,
        'phone': phoneController.text.trim(),
        'company_name': companyNameController.text.trim(),
        'companyName': companyNameController.text.trim(),
        'branch': branchController.text.trim(),
        'office_address': addressController.text.trim(),
        'address': addressController.text.trim(),
        'language': selectedLanguage.value,
        'timezone': selectedTimezone.value,
        'timeZone': selectedTimezone.value,
      };

      if (avatarUrl.value.isNotEmpty) {
        payload['avatar_url'] = avatarUrl.value;
        payload['avatarUrl'] = avatarUrl.value;
      } else {
        payload['avatar_url'] = null;
        payload['avatarUrl'] = null;
      }

      if (Get.isRegistered<AuthService>()) {
        final res = await AuthService.to.updateMe(payload);
        if (res.success) {
          // Refresh profile controller
          if (Get.isRegistered<FinanceProfileController>()) {
            Get.find<FinanceProfileController>().fetchProfileData();
          }

          Get.back(result: true);
          Get.snackbar(
            'Success',
            'Finance profile updated successfully!',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
          );
        } else {
          Get.snackbar(
            'Update Failed',
            res.message ?? 'Could not update profile.',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFFEF4444),
            colorText: Colors.white,
          );
        }
      } else {
        Get.back(result: true);
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to save profile: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
      );
    } finally {
      isSaving.value = false;
    }
  }

  void onBackPressed() => Get.back();

  @override
  void onClose() {
    fullNameController.dispose();
    emailController.dispose();
    phoneController.dispose();
    badgeIdController.dispose();
    companyNameController.dispose();
    branchController.dispose();
    addressController.dispose();
    super.onClose();
  }
}
