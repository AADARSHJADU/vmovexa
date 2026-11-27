import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../../data/constants/api_constants.dart';
import '../../../../../data/models/user_model.dart';
import '../../../../../data/services/auth_service.dart';
import '../../../../../data/services/advertiser_service.dart';
import '../../../../../data/services/http_client_service.dart';
import '../../../../../data/services/storage_service.dart';
import '../../../../../routes/app_routes.dart';

class AdvertiserProfileController extends GetxController {
  final AuthService _authService = AuthService.to;
  final AdvertiserService _advService = AdvertiserService.to;
  final HttpClientService _http = HttpClientService.to;
  final ImagePicker _picker = ImagePicker();

  // Loading States
  final RxBool isLoading = false.obs;
  final RxBool isSaving = false.obs;
  final RxBool uploadingPhoto = false.obs;

  // User Profile Reactive Data
  final Rx<UserModel?> user = Rx<UserModel?>(null);
  final RxString displayName = ''.obs;
  final RxString displayRole = 'COMMERCIAL ADVERTISER'.obs;
  final RxString orgName = ''.obs;
  final RxString advId = ''.obs;
  final RxString avatarUrl = ''.obs;
  final RxString email = ''.obs;
  final RxString phone = ''.obs;
  final RxString branch = ''.obs;
  final RxString address = ''.obs;
  final RxString language = 'en'.obs;
  final RxString timeZone = 'Asia/Kolkata'.obs;

  // Selected Local Image (for preview before uploading)
  final Rx<File?> selectedImageFile = Rx<File?>(null);

  // 3 Hero Stat Pills (Matches AdvertiserProfilePage.jsx)
  final RxInt campaignCount = 0.obs;
  final RxInt activeCampaigns = 0.obs;
  final RxString walletBalance = '₹0'.obs;

  // Form Controllers for Edit Profile
  late final TextEditingController nameController;
  late final TextEditingController emailController;
  late final TextEditingController phoneController;
  late final TextEditingController companyController;
  late final TextEditingController branchController;
  late final TextEditingController addressController;

  @override
  void onInit() {
    super.onInit();
    nameController = TextEditingController();
    emailController = TextEditingController();
    phoneController = TextEditingController();
    companyController = TextEditingController();
    branchController = TextEditingController();
    addressController = TextEditingController();

    _loadFromLocalSession();
    loadProfileData();
  }

  @override
  void onClose() {
    nameController.dispose();
    emailController.dispose();
    phoneController.dispose();
    companyController.dispose();
    branchController.dispose();
    addressController.dispose();
    super.onClose();
  }

  /// Populate initial values from local StorageService
  void _loadFromLocalSession() {
    final u = StorageService.to.getUser();
    if (u != null) {
      _applyUserData(u);
    }
  }

  void _applyUserData(UserModel u) {
    user.value = u;
    displayName.value = u.name ?? 'Advertiser';
    displayRole.value = u.role ?? 'COMMERCIAL ADVERTISER';

    final advMap = u.advertiser;
    final cName = (u.companyName != null && u.companyName!.isNotEmpty)
        ? u.companyName!
        : (advMap?['company_name']?.toString() ?? advMap?['name']?.toString() ?? u.organizationName ?? '—');
    orgName.value = cName;

    advId.value = u.code ?? (advMap?['code']?.toString() ?? (u.id != null ? 'ADV-${u.id}' : 'ADV-001'));
    avatarUrl.value = u.avatarUrl ?? '';
    email.value = u.email ?? '';
    phone.value = u.phone ?? '';

    final branchVal = (u.branch != null && u.branch!.isNotEmpty)
        ? u.branch!
        : (advMap?['branch']?.toString() ?? advMap?['city']?.toString() ?? 'Regional Advertising Desk');
    branch.value = branchVal;

    final addrVal = (u.officeAddress != null && u.officeAddress!.isNotEmpty)
        ? u.officeAddress!
        : (advMap?['address']?.toString() ?? advMap?['office_address']?.toString() ?? '');
    address.value = addrVal;

    language.value = u.language ?? 'en';
    timeZone.value = u.timezone ?? 'Asia/Kolkata';

    // Populate controllers for Edit Profile
    nameController.text = u.name ?? '';
    emailController.text = u.email ?? '';
    phoneController.text = u.phone ?? '';
    companyController.text = (cName != '—') ? cName : '';
    branchController.text = branchVal;
    addressController.text = addrVal;
  }

  /// Fetch full fresh data from APIs (GET /auth/me, GET /campaigns, GET /billing/wallet)
  Future<void> loadProfileData() async {
    isLoading.value = true;
    try {
      try {
        final userRes = await _authService.getMe();
        if (userRes.success && userRes.data != null) {
          var freshUser = userRes.data!;

          // If advertiser fields are still empty, check fallback via getAdvertiserProfile
          final advMap = freshUser.advertiser;
          final advIdVal = advMap?['id']?.toString() ?? freshUser.id;
          if ((freshUser.companyName == null || freshUser.companyName!.isEmpty) && advIdVal != null) {
            try {
              final advProfileRes = await _advService.getAdvertiserProfile(advIdVal);
              if (advProfileRes.success && advProfileRes.data != null && advProfileRes.data!.isNotEmpty) {
                final aData = advProfileRes.data!;
                final mergedAdv = <String, dynamic>{
                  ...?advMap,
                  ...aData,
                };
                freshUser = UserModel.fromJson({
                  ...freshUser.toJson(),
                  'advertiser': mergedAdv,
                  'company_name': aData['company_name'] ?? aData['name'] ?? freshUser.companyName,
                  'branch': aData['branch'] ?? aData['city'] ?? freshUser.branch,
                  'address': aData['address'] ?? freshUser.officeAddress,
                });
              }
            } catch (_) {}
          }

          _applyUserData(freshUser);
          await StorageService.to.saveUser(freshUser);
        }
      } catch (e) {
        debugPrint('[Profile] Error fetching user profile: $e');
      }

      try {
        final campRes = await _advService.getCampaigns(ownerType: 'advertiser', page: 1, limit: 100);
        if (campRes.success && campRes.data != null) {
          final camps = campRes.data!;
          campaignCount.value = camps.length;
          activeCampaigns.value = camps.where((c) {
            final s = c.status.toLowerCase();
            return s == 'active' || s == 'live';
          }).length;
        }
      } catch (e) {
        debugPrint('[Profile] Error fetching campaigns: $e');
      }

      try {
        final walletRes = await _advService.getBillingWallet();
        if (walletRes.success && walletRes.data is Map) {
          final wData = walletRes.data as Map;
          final bal = wData['balance'] ?? wData['wallet_balance'] ?? 0;
          final numVal = bal is num ? bal.toDouble() : (double.tryParse(bal.toString()) ?? 0.0);
          walletBalance.value = '₹${numVal.toStringAsFixed(0).replaceAllMapped(
            RegExp(r'(\d+?)(?=(\d\d)+(\d)(?!\d))'),
                (m) => '${m[1]},',
          )}';
        }
      } catch (e) {
        debugPrint('[Profile] Error fetching wallet: $e');
      }
    } finally {
      isLoading.value = false;
    }
  }

  /// Pick Image from Camera or Gallery
  Future<void> pickImage(ImageSource source) async {
    try {
      final picked = await _picker.pickImage(
        source: source,
        imageQuality: 85,
        maxWidth: 800,
        maxHeight: 800,
      );
      if (picked != null) {
        selectedImageFile.value = File(picked.path);
      }
    } catch (e) {
      Get.snackbar(
        'image_selection_error'.tr,
        '${'could_not_pick_image'.tr}: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
    }
  }

  /// Remove current photo
  void removeAvatar() {
    selectedImageFile.value = null;
    avatarUrl.value = '';
  }

  /// Save Profile Changes (Handles With Image OR Without Image upload)
  Future<void> saveProfile() async {
    isSaving.value = true;
    try {
      String finalAvatarUrl = avatarUrl.value;

      // 1. Upload new image if chosen
      if (selectedImageFile.value != null) {
        uploadingPhoto.value = true;
        try {
          final uploadRes = await _http.uploadFile(
            filePath: selectedImageFile.value!.path,
            purpose: 'avatar',
          );
          if (uploadRes.success && uploadRes.data != null) {
            final data = uploadRes.data!;
            final rawUrl = data['url'] ?? data['file_url'] ?? data['avatar_url'];
            if (rawUrl != null && rawUrl.toString().isNotEmpty) {
              finalAvatarUrl = rawUrl.toString();
            }
          }
        } catch (e) {
          debugPrint('[AdvertiserProfileController] Photo upload error: $e');
        } finally {
          uploadingPhoto.value = false;
        }
      }

      // 2. Prepare payload matching AdvertiserSettingsPage.jsx
      final patchData = <String, dynamic>{
        'name': nameController.text.trim(),
        'email': emailController.text.trim(),
        'phone': phoneController.text.trim(),
        'avatar_url': finalAvatarUrl,
        'company_name': companyController.text.trim(),
        'companyName': companyController.text.trim(),
        'branch': branchController.text.trim(),
        'address': addressController.text.trim(),
        'language': language.value,
        'timezone': timeZone.value,
        'timeZone': timeZone.value,
      };

      // 3. Call PATCH /auth/me
      final response = await _authService.updateMe(patchData);
      if (response.success && response.data != null) {
        final updatedUser = response.data!;
        _applyUserData(updatedUser);
        await StorageService.to.saveUser(updatedUser);
        selectedImageFile.value = null;

        // Also sync to advertiser profile endpoint if ID available
        final advIdVal = updatedUser.advertiser?['id']?.toString() ?? user.value?.advertiser?['id']?.toString();
        if (advIdVal != null && advIdVal.isNotEmpty) {
          try {
            await _advService.updateAdvertiserProfile(advIdVal, {
              'company_name': companyController.text.trim(),
              'companyName': companyController.text.trim(),
              'branch': branchController.text.trim(),
              'address': addressController.text.trim(),
              'name': nameController.text.trim(),
            });
          } catch (_) {}
        }

        Get.snackbar(
          'success'.tr,
          'profile_updated_success_msg'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          duration: const Duration(seconds: 3),
        );

        Get.back();
      } else {
        Get.snackbar(
          'profile_update_failed'.tr,
          response.message ?? 'profile_update_failed'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.redAccent,
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar(
        'error'.tr,
        '${'failed_to_save_profile'.tr}: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
    } finally {
      isSaving.value = false;
    }
  }

  /// Logout confirmation and execution
  void logout() {
    Get.dialog(
      AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('confirm_logout'.tr, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: Text(
          'logout_confirmation_msg'.tr,
          style: const TextStyle(color: Colors.white70, fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: Text('cancel'.tr, style: const TextStyle(color: Colors.white54)),
          ),
          ElevatedButton(
            onPressed: () async {
              Get.back();
              try {
                if (Get.isRegistered<AuthService>()) {
                  _authService.logout();
                }
                if (Get.isRegistered<StorageService>()) {
                  await StorageService.to.clearAuth();
                }
              } catch (_) {}
              Get.offAllNamed(Routes.LOGIN);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.redAccent,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: Text('logout'.tr, style: const TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  String get resolvedAvatarUrl {
    if (avatarUrl.value.isEmpty) return '';
    return ApiConstants.resolveFileUrl(avatarUrl.value);
  }
}
