import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/models/user_model.dart';
import 'package:vmovexa/app/data/services/auth_service.dart';
import 'package:vmovexa/app/data/services/http_client_service.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';
import 'package:vmovexa/app/modules/roles/fleet_operator/profile/controllers/profile_controller.dart';
import 'package:vmovexa/app/modules/roles/fleet_operator/dashboard/controllers/dashboard_controller.dart';

class AccountSettingsController extends GetxController {
  final RxString fullName = ''.obs;
  final RxString email = ''.obs;
  final RxString phone = ''.obs;
  final RxString employeeId = ''.obs;
  final RxString role = ''.obs;

  final RxString companyName = ''.obs;
  final RxString branch = 'Bengaluru Head Office'.obs;
  final RxString officeAddress = ''.obs;

  final RxString language = 'English (India)'.obs;
  final RxString timezone = 'Asia/Kolkata (GMT+05:30)'.obs;
  final RxString avatarUrl = ''.obs;

  final RxBool isLoading = false.obs;
  final RxBool isSaving = false.obs;
  final RxBool isUploadingPhoto = false.obs;

  @override
  void onInit() {
    super.onInit();
    loadUserData();
  }

  /// Load user details from local cache first, then sync with GET /auth/me
  Future<void> loadUserData() async {
    if (Get.isRegistered<StorageService>()) {
      final user = StorageService.to.getUser();
      if (user != null) {
        _populateFields(user);
      }
    }

    try {
      isLoading.value = true;
      if (Get.isRegistered<AuthService>()) {
        final res = await AuthService.to.getMe();
        if (res.success && res.data != null) {
          _populateFields(res.data!);
        }
      }
    } catch (e) {
      debugPrint('Error fetching account data: $e');
    } finally {
      isLoading.value = false;
    }
  }

  void _populateFields(UserModel user) {
    fullName.value = user.name ?? '';
    email.value = user.email ?? '';
    phone.value = user.phone ?? '';
    employeeId.value = user.enrollmentNo ?? user.code ?? (user.id != null ? 'OP-${user.id}' : 'OP-987654');
    role.value = user.displayRole;

    if (user.companyName != null && user.companyName!.isNotEmpty) {
      companyName.value = user.companyName!;
    } else if (user.organization?.name != null && user.organization!.name!.isNotEmpty) {
      companyName.value = user.organization!.name!;
    } else if (user.organizationName != null && user.organizationName!.isNotEmpty) {
      companyName.value = user.organizationName!;
    } else {
      companyName.value = 'VMOVEXA Transport Solutions';
    }

    if (user.branch != null && user.branch!.isNotEmpty) {
      branch.value = user.branch!;
    }
    if (user.officeAddress != null && user.officeAddress!.isNotEmpty) {
      officeAddress.value = user.officeAddress!;
    } else if (user.organization?.officeAddress != null && user.organization!.officeAddress!.isNotEmpty) {
      officeAddress.value = user.organization!.officeAddress!;
    }
    if (user.language != null && user.language!.isNotEmpty) {
      language.value = user.language!;
    }
    if (user.timezone != null && user.timezone!.isNotEmpty) {
      timezone.value = user.timezone!;
    }
    if (user.avatarUrl != null && user.avatarUrl!.isNotEmpty) {
      avatarUrl.value = ApiConstants.resolveFileUrl(user.avatarUrl);
    }
  }

  /// Opens bottom sheet dialog to edit a single attribute
  void openEditSheet({
    required String title,
    required String currentVal,
    required ValueChanged<String> onSaved,
    TextInputType keyboardType = TextInputType.text,
  }) {
    final textController = TextEditingController(text: currentVal);

    Get.bottomSheet(
      Container(
        padding: EdgeInsets.only(
          left: 20,
          right: 20,
          top: 20,
          bottom: MediaQuery.of(Get.context!).viewInsets.bottom + 20,
        ),
        decoration: const BoxDecoration(
          color: Color(0xFF1E293B),
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Edit $title',
                  style: const TextStyle(
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
            const SizedBox(height: 12),
            TextField(
              controller: textController,
              keyboardType: keyboardType,
              autofocus: true,
              style: const TextStyle(color: Colors.white, fontSize: 14),
              decoration: InputDecoration(
                filled: true,
                fillColor: const Color(0xFF0F172A),
                hintText: 'Enter $title',
                hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: Color(0xFF334155)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: Color(0xFF334155)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: Color(0xFF6366F1), width: 1.5),
                ),
              ),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Get.back(),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0xFF334155)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: const Text('Cancel', style: TextStyle(color: Colors.white70)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      final val = textController.text.trim();
                      if (val.isNotEmpty) {
                        onSaved(val);
                      }
                      Get.back();
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF6366F1),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: const Text('Apply', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
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

  /// Change profile avatar with Camera / Gallery selection sheet
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
                  'Upload Profile Photo',
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
              'Select photo source to update your fleet operator avatar:',
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
                _pickAndUploadImage(ImageSource.camera);
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
              title: const Text('Choose from Gallery', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
              subtitle: const Text('Pick image from your device photos', style: TextStyle(color: Color(0xFF64748B), fontSize: 11)),
              trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFF64748B), size: 20),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              onTap: () {
                Get.back();
                _pickAndUploadImage(ImageSource.gallery);
              },
            ),
            const SizedBox(height: 8),
            ListTile(
              leading: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0x268B5CF6),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.link_rounded, color: Color(0xFF8B5CF6), size: 22),
              ),
              title: const Text('Enter Image URL', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
              subtitle: const Text('Paste external avatar web link', style: TextStyle(color: Color(0xFF64748B), fontSize: 11)),
              trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFF64748B), size: 20),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              onTap: () {
                Get.back();
                _openManualUrlDialog();
              },
            ),
          ],
        ),
      ),
      isScrollControlled: true,
    );
  }

  /// Pick from camera or gallery and upload via multipart POST /uploads
  Future<void> _pickAndUploadImage(ImageSource source) async {
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
        backgroundColor: const Color(0xFF6366F1),
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
          avatarUrl.value = resolved;

          // Immediately update profile on backend
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
                avatarUrl: resolved,
                role: currentUser.role,
                roleId: currentUser.roleId,
                organizationId: currentUser.organizationId,
                organizationName: currentUser.organizationName,
                status: currentUser.status,
                organization: currentUser.organization,
                permissions: currentUser.permissions,
                branch: branch.value,
                officeAddress: officeAddress.value,
                language: language.value,
                timezone: timezone.value,
                companyName: companyName.value,
              );
              await StorageService.to.saveUser(updated);
            }
          }

          // Refresh profile screen and dashboard drawer controllers
          if (Get.isRegistered<FleetOpProfileController>()) {
            Get.find<FleetOpProfileController>().loadProfileData();
          }
          if (Get.isRegistered<FleetOpDashboardController>()) {
            Get.find<FleetOpDashboardController>().loadUserData();
          }

          Get.snackbar(
            'Success',
            'Profile photo updated successfully!',
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

  void _openManualUrlDialog() {
    final textController = TextEditingController(text: avatarUrl.value);

    Get.dialog(
      Dialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Enter Avatar URL',
                style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 6),
              const Text(
                'Enter image web URL or photo link for your operator avatar:',
                style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
              ),
              const SizedBox(height: 14),
              TextField(
                controller: textController,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  filled: true,
                  fillColor: const Color(0xFF0F172A),
                  hintText: 'https://example.com/avatar.jpg',
                  hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFF334155)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFF6366F1)),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Get.back(),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFF334155)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: const Text('Cancel', style: TextStyle(color: Colors.white)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        final url = textController.text.trim();
                        if (url.isNotEmpty) {
                          avatarUrl.value = ApiConstants.resolveFileUrl(url);
                        }
                        Get.back();
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF6366F1),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: const Text('Update', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
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

  /// Save changes via PATCH /auth/me and persist to local UserModel
  Future<void> saveChanges() async {
    if (isSaving.value) return;

    try {
      isSaving.value = true;

      final patchData = <String, dynamic>{
        'name': fullName.value.trim(),
        'email': email.value.trim(),
        'phone': phone.value.trim(),
        if (avatarUrl.value.isNotEmpty) 'avatar_url': avatarUrl.value.trim(),
        'companyName': companyName.value.trim(),
        'branch': branch.value.trim(),
        'address': officeAddress.value.trim(),
        'office_address': officeAddress.value.trim(),
        'language': language.value.trim(),
        'timeZone': timezone.value.trim(),
        'timezone': timezone.value.trim(),
      };

      if (Get.isRegistered<AuthService>()) {
        final res = await AuthService.to.updateMe(patchData);

        if (res.success) {
          // Construct updated UserModel ensuring all edited fields persist even if backend echoes partial
          final currentUser = StorageService.to.getUser();
          final updatedUser = UserModel(
            id: res.data?.id ?? currentUser?.id,
            code: res.data?.code ?? currentUser?.code,
            enrollmentNo: res.data?.enrollmentNo ?? currentUser?.enrollmentNo,
            name: fullName.value.trim(),
            email: email.value.trim(),
            phone: phone.value.trim(),
            avatarUrl: avatarUrl.value.trim(),
            role: res.data?.role ?? currentUser?.role,
            roleId: res.data?.roleId ?? currentUser?.roleId,
            organizationId: res.data?.organizationId ?? currentUser?.organizationId,
            organizationName: companyName.value.trim(),
            status: res.data?.status ?? currentUser?.status,
            organization: OrganizationModel(
              id: currentUser?.organization?.id,
              name: companyName.value.trim(),
              status: currentUser?.organization?.status,
              plan: currentUser?.organization?.plan,
              officeAddress: officeAddress.value.trim(),
            ),
            permissions: currentUser?.permissions ?? [],
            branch: branch.value.trim(),
            officeAddress: officeAddress.value.trim(),
            language: language.value.trim(),
            timezone: timezone.value.trim(),
            companyName: companyName.value.trim(),
          );

          if (Get.isRegistered<StorageService>()) {
            await StorageService.to.saveUser(updatedUser);
          }

          // Refresh profile screen and dashboard drawer controllers if active
          if (Get.isRegistered<FleetOpProfileController>()) {
            Get.find<FleetOpProfileController>().loadProfileData();
          }
          if (Get.isRegistered<FleetOpDashboardController>()) {
            Get.find<FleetOpDashboardController>().loadUserData();
          }

          Get.snackbar(
            'Profile Updated',
            'Your account changes have been saved successfully.',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
            icon: const Icon(Icons.check_circle_rounded, color: Colors.white),
            margin: const EdgeInsets.all(16),
            borderRadius: 10,
          );

          await Future.delayed(const Duration(milliseconds: 600));
          Get.offAllNamed(Routes.FLEET_OP_DASHBOARD);
        } else {
          Get.snackbar(
            'Update Failed',
            res.message ?? 'Unable to save profile changes.',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFFEF4444),
            colorText: Colors.white,
            icon: const Icon(Icons.error_outline_rounded, color: Colors.white),
            margin: const EdgeInsets.all(16),
            borderRadius: 10,
          );
        }
      } else {
        Get.back();
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to connect to server: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
        margin: const EdgeInsets.all(16),
        borderRadius: 10,
      );
    } finally {
      isSaving.value = false;
    }
  }

  void cancel() {
    Get.back();
  }

  void goToChangePassword() {
    Get.toNamed(Routes.CHANGE_PASSWORD);
  }
}
