import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:vmovexa/app/modules/roles/driver/profile/model/driver_document.dart';

import 'package:vmovexa/app/routes/app_routes.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/models/driver_models.dart';
import 'package:vmovexa/app/data/models/user_model.dart';
import 'package:vmovexa/app/data/services/auth_service.dart';
import 'package:vmovexa/app/data/services/driver_service.dart';
import 'package:vmovexa/app/data/services/http_client_service.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';
import 'package:vmovexa/app/modules/roles/driver/home/controller/driver_home_controller.dart';
import 'package:vmovexa/app/modules/roles/fleet_operator/account_settings/controllers/account_settings_controller.dart';

class DriverProfileController extends GetxController {
  DriverService get _driverService => DriverService.to;

  // ==========================================================
  // Identity
  // ==========================================================
  final RxString fullName = 'Driver'.obs;
  final RxString roleLabel = 'Commercial Driver'.obs;
  final RxString companyName = 'VMOVEXA Transit'.obs;
  final RxString driverId = '--'.obs;
  final RxString phone = '--'.obs;
  final RxString email = '--'.obs;
  final RxString licenseNumber = '--'.obs;
  final RxString licenseExpiry = '--'.obs;
  final RxString assignedVehicleText = 'Not Assigned'.obs;
  final RxString dutyStatus = 'off_duty'.obs;
  final RxString avatarUrl = ''.obs;
  final RxBool isUploadingAvatar = false.obs;

  // ==========================================================
  // Stats (Routes / Schedules / Notifications / Documents)
  // ==========================================================
  final RxInt routesCount = 0.obs;
  final RxInt schedulesCount = 0.obs;
  final RxInt notificationsCount = 0.obs;
  final RxInt documentsCount = 0.obs;

  // ==========================================================
  // Documents
  // ==========================================================
  final RxList<DriverDocument> documents = <DriverDocument>[].obs;
  final RxList<DriverDocumentItem> rawDocuments = <DriverDocumentItem>[].obs;

  final RxBool isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    fetchProfile();
  }

  Future<void> fetchProfile() async {
    isLoading.value = true;
    try {
      await Future.wait([
        _loadProfileData(),
        _loadDocumentsData(),
        _loadStatsData(),
      ]);
    } catch (e) {
      debugPrint('DriverProfileController fetch error: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> _loadProfileData() async {
    // 1. Initialise from storage cache so values appear immediately
    if (Get.isRegistered<StorageService>()) {
      final cachedUser = StorageService.to.getUser();
      if (cachedUser != null) {
        if (cachedUser.avatarUrl != null && cachedUser.avatarUrl!.isNotEmpty) {
          avatarUrl.value = cachedUser.avatarUrl!;
        }
        if (cachedUser.name != null && cachedUser.name!.isNotEmpty) {
          fullName.value = cachedUser.name!;
        }
        if (cachedUser.email != null && cachedUser.email!.isNotEmpty) {
          email.value = cachedUser.email!;
        }
        if (cachedUser.phone != null && cachedUser.phone!.isNotEmpty) {
          phone.value = cachedUser.phone!;
        }
      }
    }

    final response = await _driverService.getProfile();
    if (response.success && response.data != null) {
      final p = response.data!;
      fullName.value = p.name ?? fullName.value;
      roleLabel.value = p.licenseType ?? 'Commercial Driver';
      companyName.value = p.organization?.name ?? companyName.value;
      driverId.value = p.id ?? (p.licenseNumber ?? driverId.value);
      phone.value = p.phone ?? phone.value;
      email.value = p.email ?? email.value;
      licenseNumber.value = p.licenseNumber ?? licenseNumber.value;
      licenseExpiry.value = p.licenseExpiry ?? licenseExpiry.value;
      dutyStatus.value = p.dutyStatus ?? dutyStatus.value;
      if (p.assignedVehicle != null) {
        assignedVehicleText.value = p.assignedVehicle!.displayName;
      }
      if (p.avatarUrl != null && p.avatarUrl!.isNotEmpty) {
        avatarUrl.value = p.avatarUrl!;
      }
    }

    // 2. Fetch latest user profile from /auth/me to guarantee fresh avatar_url
    try {
      if (Get.isRegistered<AuthService>()) {
        final meRes = await AuthService.to.getMe();
        if (meRes.success && meRes.data != null) {
          if (meRes.data!.avatarUrl != null && meRes.data!.avatarUrl!.isNotEmpty) {
            avatarUrl.value = meRes.data!.avatarUrl!;
            if (Get.isRegistered<DriverHomeController>()) {
              Get.find<DriverHomeController>().avatarUrl.value = meRes.data!.avatarUrl!;
            }
          }
          if (meRes.data!.name != null && meRes.data!.name!.isNotEmpty) {
            fullName.value = meRes.data!.name!;
          }
        }
      }
    } catch (_) {}
  }

  Future<void> _loadStatsData() async {
    // 1. Trips count
    try {
      final tripsRes = await _driverService.getTrips(page: 1, limit: 1);
      if (tripsRes.success && tripsRes.data != null) {
        routesCount.value = tripsRes.data!.count;
      }
    } catch (_) {}

    // 2. Schedule trips count
    try {
      final schedRes = await _driverService.getTodaySchedule();
      if (schedRes.success && schedRes.data != null) {
        schedulesCount.value = schedRes.data!.upcomingTrips.length + (schedRes.data!.assignedRoute != null ? 1 : 0);
      }
    } catch (_) {}

    // 3. Notifications unread count
    try {
      final notifRes = await _driverService.getNotifications(page: 1, limit: 50);
      if (notifRes.success && notifRes.data != null) {
        notificationsCount.value = notifRes.data!.where((n) => n['is_read'] != true && n['read'] != true).length;
      }
    } catch (_) {}
  }

  Future<void> _loadDocumentsData() async {
    final response = await _driverService.getDocuments();
    if (response.success && response.data != null) {
      rawDocuments.assignAll(response.data!);
      documentsCount.value = response.data!.length;

      final docs = response.data!.map((item) {
        DocumentStatus status;
        String statusLabel = 'Uploaded';
        final s = (item.status ?? '').toLowerCase();
        if (s == 'verified') {
          status = DocumentStatus.verified;
          statusLabel = 'Verified';
        } else if (s == 'rejected') {
          status = DocumentStatus.rejected;
          statusLabel = 'Rejected';
        } else if (s == 'pending' || s == 'under_review') {
          status = DocumentStatus.underReview;
          statusLabel = 'Under Review';
        } else {
          status = DocumentStatus.uploaded;
          statusLabel = 'Uploaded';
        }

        IconData icon = Icons.description_outlined;
        final type = (item.type ?? '').toLowerCase();
        if (type.contains('license')) {
          icon = Icons.badge_outlined;
        } else if (type.contains('insurance')) {
          icon = Icons.shield_outlined;
        } else if (type.contains('medical')) {
          icon = Icons.medical_services_outlined;
        }

        return DriverDocument(
          id: item.id ?? item.type ?? 'doc',
          title: item.typeLabel ?? _capitalize(item.type ?? 'Document'),
          icon: icon,
          status: status,
          statusLabel: statusLabel,
        );
      }).toList();

      documents.assignAll(docs);
    } else {
      documents.clear();
      documentsCount.value = 0;
    }
  }

  String _capitalize(String text) {
    if (text.isEmpty) return text;
    return text[0].toUpperCase() + text.substring(1);
  }

  Future<void> onRefresh() async {
    await fetchProfile();
  }

  // ==========================================================
  // Actions
  // ==========================================================
  void onOpenSettings() {
    Get.toNamed(Routes.ACCOUNT_SETTINGS);
  }

  void onViewCompanyDetails() {
    Get.snackbar(
      companyName.value,
      'Organization: ${companyName.value}',
      backgroundColor: const Color(0xFF15151F),
      colorText: Colors.white,
      snackPosition: SnackPosition.BOTTOM,
    );
  }

  void onChangeAvatar() {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
        decoration: const BoxDecoration(
          color: Color(0xFF15151F),
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          boxShadow: [
            BoxShadow(color: Colors.black54, blurRadius: 20, spreadRadius: 4),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Change Profile Photo',
              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            const Text(
              'Choose photo from camera or gallery to update your profile.',
              style: TextStyle(color: Colors.white54, fontSize: 12),
            ),
            const SizedBox(height: 18),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFF8B5CF6).withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.camera_alt_outlined, color: Color(0xFF8B5CF6), size: 22),
              ),
              title: const Text('Take a photo', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
              subtitle: const Text('Open camera to capture new photo', style: TextStyle(color: Colors.white38, fontSize: 11)),
              onTap: () {
                Get.back();
                _pickAndUploadAvatar(ImageSource.camera);
              },
            ),
            const Divider(color: Color(0x14FFFFFF)),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFF38BDF8).withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.photo_library_outlined, color: Color(0xFF38BDF8), size: 22),
              ),
              title: const Text('Choose from gallery', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
              subtitle: const Text('Select photo from local device files', style: TextStyle(color: Colors.white38, fontSize: 11)),
              onTap: () {
                Get.back();
                _pickAndUploadAvatar(ImageSource.gallery);
              },
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
      isScrollControlled: true,
    );
  }

  Future<void> _pickAndUploadAvatar(ImageSource source) async {
    try {
      final picker = ImagePicker();
      final picked = await picker.pickImage(
        source: source,
        maxWidth: 1024,
        maxHeight: 1024,
        imageQuality: 85,
      );
      if (picked == null) return;

      isUploadingAvatar.value = true;
      Get.snackbar(
        'Uploading Avatar',
        'Uploading your profile photo...',
        backgroundColor: const Color(0xFF6366F1),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        duration: const Duration(seconds: 2),
      );

      final res = await HttpClientService.to.uploadFile(
        filePath: picked.path,
        purpose: 'avatar',
      );

      if (res.success && res.data != null) {
        final rawUrl = res.data!['url']?.toString() ??
            res.data!['file_url']?.toString() ??
            res.data!['avatar_url']?.toString() ??
            res.data!['path']?.toString();

        if (rawUrl != null && rawUrl.isNotEmpty) {
          avatarUrl.value = rawUrl;

          // Update backend profile
          if (Get.isRegistered<AuthService>()) {
            await AuthService.to.updateMe({'avatar_url': rawUrl});
          }

          // Update cached user in storage
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
                avatarUrl: rawUrl,
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

          // Sync with DriverHomeController
          if (Get.isRegistered<DriverHomeController>()) {
            Get.find<DriverHomeController>().avatarUrl.value = rawUrl;
          }

          // Sync with AccountSettingsController if active
          if (Get.isRegistered<AccountSettingsController>()) {
            Get.find<AccountSettingsController>().avatarUrl.value = ApiConstants.resolveFileUrl(rawUrl);
          }

          Get.snackbar(
            'Success',
            'Profile photo updated successfully!',
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
            snackPosition: SnackPosition.BOTTOM,
            icon: const Icon(Icons.check_circle_rounded, color: Colors.white),
          );
        }
      } else {
        Get.snackbar(
          'Upload Failed',
          res.message ?? 'Could not upload photo. Please try again.',
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (e) {
      debugPrint('Error uploading avatar: $e');
      Get.snackbar(
        'Upload Error',
        'An error occurred while uploading photo.',
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isUploadingAvatar.value = false;
    }
  }

  void onStatTap(String label) {
    switch (label) {
      case 'Routes':
        Get.toNamed(Routes.MY_ROUTE);
        break;
      case 'Schedules':
        Get.toNamed(Routes.DRIVER_SCHEDULE);
        break;
      case 'Notifications':
        Get.toNamed(Routes.DRIVER_NOTIFICATION);
        break;
      case 'Documents':
        Get.toNamed(Routes.DRIVER_DOCUMENT);
        break;
    }
  }

  void onPersonalInformationTap() {
    Get.dialog(
      AlertDialog(
        backgroundColor: const Color(0xFF15151F),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        title: const Text('Driver Information', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildInfoRow('Name', fullName.value),
            _buildInfoRow('Phone', phone.value),
            _buildInfoRow('Email', email.value),
            _buildInfoRow('License No', licenseNumber.value),
            _buildInfoRow('License Expiry', licenseExpiry.value),
            _buildInfoRow('Vehicle', assignedVehicleText.value),
            _buildInfoRow('Duty Status', dutyStatus.value.replaceAll('_', ' ').toUpperCase()),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('Close', style: TextStyle(color: Colors.white54)),
          ),
          ElevatedButton(
            onPressed: () {
              Get.back();
              Get.toNamed(Routes.ACCOUNT_SETTINGS);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFB042FF),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text('Edit Profile', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text('$label:', style: const TextStyle(color: Colors.white54, fontSize: 12)),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }

  void onSecurityTap() {
    Get.toNamed(Routes.CHANGE_PASSWORD);
  }

  void onNotificationPreferencesTap() {
    Get.toNamed(Routes.NOTIFICATION_SETTINGS);
  }

  void onDocumentTap(DriverDocument document) {
    Get.toNamed(Routes.DRIVER_DOCUMENT, arguments: {'documentId': document.id});
  }

  void onHelpSupportTap() {
    Get.toNamed(Routes.DRIVER_HELP_SUPPORT);
  }

  void onAboutTap() {
    Get.toNamed(Routes.TERMS_CONDITIONS);
  }

  Future<void> onLogout() async {
    Get.dialog(
      AlertDialog(
        backgroundColor: const Color(0xFF15151F),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        title: const Text('Log Out', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
        content: const Text(
          'Are you sure you want to log out of your driver account?',
          style: TextStyle(color: Colors.white60, fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
          ),
          TextButton(
            onPressed: () async {
              Get.back();
              if (Get.isRegistered<AuthService>()) {
                await AuthService.to.logout();
              }
              Get.offAllNamed(Routes.LOGIN);
            },
            child: const Text('Log Out', style: TextStyle(color: Color(0xFFFF4D4D), fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }
}