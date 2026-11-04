import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/models/api_response_model.dart';
import 'package:vmovexa/app/data/models/government_models.dart';
import 'package:vmovexa/app/data/models/user_model.dart';
import 'package:vmovexa/app/data/services/auth_service.dart';
import 'package:vmovexa/app/data/services/government_service.dart';
import 'package:vmovexa/app/data/services/http_client_service.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';

class GovernmentProfileController extends GetxController {
  final AuthService _authService = AuthService.to;
  GovernmentService get _govService => GovernmentService.to;

  final Rx<UserModel?> user = Rx<UserModel?>(null);
  final RxInt selectedNavIndex = 0.obs;

  // 3 Dynamic Stats matching Web
  final RxInt campaignsCount = 0.obs;
  final RxInt broadcastsCount = 0.obs;
  final RxInt monitoredUnitsCount = 0.obs;

  // Loading States
  final RxBool isLoadingStats = false.obs;
  final RxBool isUploadingPhoto = false.obs;
  final RxString customAvatar = ''.obs;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args is Map && args.containsKey('tab')) {
      selectedNavIndex.value = args['tab'];
    }
    loadProfileData();
  }

  /// Load user details and fresh agency stats
  Future<void> loadProfileData() async {
    // 1. Initial cached user from StorageService
    if (Get.isRegistered<StorageService>()) {
      user.value = StorageService.to.getUser();
    } else {
      user.value = _authService.currentUser;
    }

    if (user.value?.avatarUrl != null && user.value!.avatarUrl!.isNotEmpty) {
      customAvatar.value = ApiConstants.resolveFileUrl(user.value!.avatarUrl!);
    }

    // 2. Refresh both user profile from /auth/me and agency statistics
    await Future.wait([
      _fetchFreshUser(),
      loadStats(),
    ]);
  }

  Future<void> _fetchFreshUser() async {
    try {
      final res = await _authService.getMe();
      if (res.success && res.data != null) {
        user.value = res.data;
        if (user.value?.avatarUrl != null && user.value!.avatarUrl!.isNotEmpty) {
          customAvatar.value = ApiConstants.resolveFileUrl(user.value!.avatarUrl!);
        }
      }
    } catch (e) {
      debugPrint('Error syncing user profile: $e');
    }
  }

  /// Load the 3 core metrics: Campaigns, Emergency Broadcasts, and Monitored Fleet Units
  Future<void> loadStats() async {
    try {
      isLoadingStats.value = true;

      final results = await Future.wait([
        _govService.getAgencyAnalytics().catchError((_) => null as dynamic),
        _govService.getCampaigns(ownerType: 'government').catchError((_) => null as dynamic),
        _govService.getEmergencyBroadcasts().catchError((_) => null as dynamic),
        _govService.getLiveTracking().catchError((_) => null as dynamic),
      ]);

      final analyticsRes = results[0] as ApiResponseModel<GovAnalyticsModel>?;
      final campaignsRes = results[1] as ApiResponseModel<List<GovCampaignModel>>?;
      final broadcastsRes = results[2] as ApiResponseModel<List<EmergencyBroadcastModel>>?;
      final trackingRes = results[3] as ApiResponseModel<LiveTrackingDataModel>?;

      // 1. Campaigns Count
      if (campaignsRes?.success == true && campaignsRes?.data != null) {
        campaignsCount.value = campaignsRes!.data!.length;
      } else if (analyticsRes?.success == true && analyticsRes?.data != null) {
        campaignsCount.value = analyticsRes!.data!.totalCampaigns;
      }

      // 2. Broadcasts Count
      if (broadcastsRes?.success == true && broadcastsRes?.data != null) {
        broadcastsCount.value = broadcastsRes!.data!.length;
      } else if (analyticsRes?.success == true && analyticsRes?.data != null) {
        broadcastsCount.value = analyticsRes!.data!.emergencyBroadcasts;
      }

      // 3. Monitored Units
      if (analyticsRes?.success == true && analyticsRes?.data != null) {
        final a = analyticsRes!.data!;
        if (a.monitoredBuses > 0 || a.totalVehicles > 0) {
          monitoredUnitsCount.value = a.monitoredBuses > 0 ? a.monitoredBuses : a.totalVehicles;
        }
      } else if (trackingRes?.success == true && trackingRes?.data != null) {
        final t = trackingRes!.data!;
        monitoredUnitsCount.value = t.total > 0 ? t.total : t.vehicles.length;
      }
    } catch (e) {
      debugPrint('Error fetching government stats: $e');
    } finally {
      isLoadingStats.value = false;
    }
  }

  // Officer Getters
  String get officerName {
    final u = user.value ?? _authService.currentUser;
    return (u?.name != null && u!.name!.isNotEmpty) ? u.name! : 'Government Official';
  }

  String get officerRole {
    final u = user.value ?? _authService.currentUser;
    if (u?.role != null && u!.role!.isNotEmpty) {
      final r = u.role!.toUpperCase().replaceAll('_', ' ');
      if (r.contains('GOVERN') || r.contains('AUTHORITY')) {
        return 'PUBLIC TRANSIT AUTHORITY';
      }
      return r;
    }
    return 'PUBLIC TRANSIT AUTHORITY';
  }

  String get officerOrg {
    final u = user.value ?? _authService.currentUser;
    return u?.organization?.name ??
        u?.companyName ??
        u?.organizationName ??
        'State Public Transit Department';
  }

  String get officerId {
    final u = user.value ?? _authService.currentUser;
    if (u?.enrollmentNo != null && u!.enrollmentNo!.isNotEmpty) {
      return u.enrollmentNo!;
    }
    if (u?.code != null && u!.code!.isNotEmpty) {
      return u.code!;
    }
    if (u?.id != null && u!.id!.isNotEmpty) {
      final sub = u.id!.substring(0, u.id!.length > 6 ? 6 : u.id!.length).toUpperCase();
      return 'GOV-$sub';
    }
    return 'GOV-OFFICER-01';
  }

  String get officerEmail {
    final u = user.value ?? _authService.currentUser;
    return (u?.email != null && u!.email!.isNotEmpty) ? u.email! : 'authority@gov.in';
  }

  String get officerPhone {
    final u = user.value ?? _authService.currentUser;
    return (u?.phone != null && u!.phone!.isNotEmpty) ? u.phone! : 'Public Transit Desk';
  }

  String get avatarUrl {
    if (customAvatar.value.isNotEmpty) return customAvatar.value;
    final u = user.value ?? _authService.currentUser;
    if (u?.avatarUrl != null && u!.avatarUrl!.isNotEmpty) {
      return ApiConstants.resolveFileUrl(u.avatarUrl!);
    }
    return '';
  }

  void onNavItemTapped(int index) {
    selectedNavIndex.value = index;
  }

  /// Change officer profile avatar with Camera / Gallery selection sheet
  void changePhoto() {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 22),
        decoration: const BoxDecoration(
          color: Color(0xFF1E293B),
          borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Update Officer Avatar',
                  style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, color: Colors.white70, size: 20),
                  onPressed: () => Get.back(),
                ),
              ],
            ),
            const SizedBox(height: 4),
            const Text(
              'Select photo source to update your official authority credentials:',
              style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
            ),
            const SizedBox(height: 18),
            ListTile(
              leading: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0x263B82F6),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.camera_alt_rounded, color: Color(0xFF3B82F6), size: 22),
              ),
              title: const Text('Take Photo with Camera', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
              subtitle: const Text('Capture new photo instantly', style: TextStyle(color: Color(0xFF64748B), fontSize: 11)),
              trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFF64748B), size: 20),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              onTap: () {
                Get.back();
                _pickAndUploadAvatar(ImageSource.camera);
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
              title: const Text('Choose from Device Gallery', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
              subtitle: const Text('Pick image from your gallery', style: TextStyle(color: Color(0xFF64748B), fontSize: 11)),
              trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFF64748B), size: 20),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              onTap: () {
                Get.back();
                _pickAndUploadAvatar(ImageSource.gallery);
              },
            ),
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

      isUploadingPhoto.value = true;
      Get.snackbar(
        'Uploading Avatar',
        'Uploading officer credentials photo...',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF6366F1),
        colorText: Colors.white,
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
          final resolved = ApiConstants.resolveFileUrl(rawUrl);
          customAvatar.value = resolved;

          // Update backend
          await _authService.updateMe({'avatar_url': rawUrl});

          // Update local storage
          final currentUser = StorageService.to.getUser();
          if (currentUser != null) {
            final updated = currentUser.copyWith(avatarUrl: resolved);
            await StorageService.to.saveUser(updated);
            user.value = updated;
          }

          Get.snackbar(
            'Success',
            'Officer avatar updated successfully!',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
            icon: const Icon(Icons.check_circle_rounded, color: Colors.white),
          );
        }
      } else {
        Get.snackbar(
          'Upload Failed',
          res.message ?? 'Unable to upload photo to server.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Upload Error',
        'Could not complete photo upload: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
      );
    } finally {
      isUploadingPhoto.value = false;
    }
  }

  /// Confirmation bottom sheet before logging out
  void confirmLogout(BuildContext context) {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Color(0xFF1E293B),
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: const Color(0xFFEF4444).withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.logout_rounded,
                color: Color(0xFFEF4444),
                size: 28,
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Logout Account',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Are you sure you want to end your administrative government officer session?',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Color(0xFF94A3B8),
                fontSize: 13,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Get.back(),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0xFF334155)),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Cancel', style: TextStyle(color: Colors.white70)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      Get.back();
                      logout();
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFEF4444),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Logout', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
      isScrollControlled: true,
    );
  }

  Future<void> logout() async {
    await _authService.logout();
  }
}
