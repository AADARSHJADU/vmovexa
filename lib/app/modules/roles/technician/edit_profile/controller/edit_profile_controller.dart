import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/services/auth_service.dart';
import 'package:vmovexa/app/data/services/http_client_service.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';
import '../../profile/controller/profile_controller.dart';
import '../../profile/model/profile_model.dart';
import '../../../../../routes/app_routes.dart';

class EditProfileController extends GetxController {
  late final ProfileController profileController;

  // Controllers for editable fields
  final nameController = TextEditingController();
  final emailController = TextEditingController();
  final phoneController = TextEditingController();
  final dobController = TextEditingController();
  final genderController = TextEditingController();
  final addressController = TextEditingController();

  // Avatar and Loading Observables
  final avatarUrl = ''.obs;
  final isUploadingPhoto = false.obs;
  final isSaving = false.obs;

  // Read-only values
  var role = ''.obs;
  var department = ''.obs;
  var reportingManager = ''.obs;
  var workLocation = ''.obs;
  var joinedDate = ''.obs;
  var username = ''.obs;
  var techId = ''.obs;
  var employeeId = ''.obs;

  @override
  void onInit() {
    super.onInit();
    profileController = Get.isRegistered<ProfileController>()
        ? Get.find<ProfileController>()
        : Get.put(ProfileController());
    loadCurrentProfile();
  }

  void loadCurrentProfile() {
    final currentProfile = profileController.profile.value;
    if (currentProfile != null) {
      nameController.text = currentProfile.name;
      emailController.text = currentProfile.email;
      phoneController.text = currentProfile.phoneNumber;
      dobController.text = currentProfile.dateOfBirth;
      genderController.text = currentProfile.gender;
      addressController.text = currentProfile.address;

      avatarUrl.value = currentProfile.profilePicture ?? '';
      role.value = currentProfile.role;
      department.value = currentProfile.department;
      reportingManager.value = currentProfile.reportingManager;
      workLocation.value = currentProfile.workLocation;
      joinedDate.value = currentProfile.joinedDate;
      username.value = currentProfile.username.isNotEmpty ? currentProfile.username : 'rahul.sharma';
      techId.value = currentProfile.techId;
      employeeId.value = currentProfile.employeeId;
    } else if (Get.isRegistered<StorageService>()) {
      final cached = StorageService.to.getUser();
      if (cached != null) {
        nameController.text = cached.name ?? '';
        emailController.text = cached.email ?? '';
        phoneController.text = cached.phone ?? '';
        addressController.text = cached.officeAddress ?? cached.branch ?? '';
        avatarUrl.value = cached.avatarUrl ?? '';
        role.value = cached.role ?? 'Senior Technician';
        techId.value = cached.code ?? cached.id ?? 'TECH-0078';
        employeeId.value = cached.enrollmentNo ?? cached.code ?? 'EMP-1456';
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
              'Select photo source to update your avatar:',
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
          avatarUrl.value = resolved;

          // Immediately sync with backend PATCH /auth/me
          if (Get.isRegistered<AuthService>()) {
            await AuthService.to.updateMe({'avatar_url': rawUrl});
          }

          // Update profileController state
          if (profileController.profile.value != null) {
            profileController.profile.value =
                profileController.profile.value!.copyWith(profilePicture: resolved);
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

  void selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime(1990, 5, 15),
      firstDate: DateTime(1950),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.dark(
              primary: Color(0xFFB042FF),
              onPrimary: Colors.white,
              surface: Color(0xFF15151F),
              onSurface: Colors.white,
            ),
            dialogBackgroundColor: const Color(0xFF0B0B14),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      final months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      dobController.text = "${picked.day} ${months[picked.month - 1]} ${picked.year}";
    }
  }

  Future<void> saveProfile() async {
    final fullName = nameController.text.trim();
    if (fullName.isEmpty) {
      Get.snackbar(
        'Validation Error',
        'Full Name cannot be empty.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFFF4D4D).withOpacity(0.9),
        colorText: Colors.white,
      );
      return;
    }

    isSaving.value = true;

    final updatedProfile = TechnicianProfile(
      name: fullName,
      role: role.value,
      techId: techId.value,
      employeeId: employeeId.value,
      profilePicture: avatarUrl.value.isNotEmpty ? avatarUrl.value : null,
      email: emailController.text.trim(),
      phoneNumber: phoneController.text.trim(),
      dateOfBirth: dobController.text.trim(),
      gender: genderController.text.trim(),
      address: addressController.text.trim(),
      department: department.value,
      reportingManager: reportingManager.value,
      workLocation: workLocation.value,
      joinedDate: joinedDate.value,
      username: username.value,
    );

    try {
      // Call PATCH /auth/me API
      if (Get.isRegistered<AuthService>()) {
        final Map<String, dynamic> updatePayload = {
          'name': fullName,
          'email': emailController.text.trim(),
          'phone': phoneController.text.trim(),
          'office_address': addressController.text.trim(),
        };
        if (avatarUrl.value.isNotEmpty) {
          updatePayload['avatar_url'] = avatarUrl.value;
        }

        final res = await AuthService.to.updateMe(updatePayload);
        if (res.success && res.data != null) {
          profileController.profile.value = TechnicianProfile.fromUserModel(res.data!);
        } else {
          profileController.profile.value = updatedProfile;
        }
      } else {
        profileController.profile.value = updatedProfile;
      }

      Get.back(result: true);
      Get.snackbar(
        'Profile Updated',
        'Your profile details have been successfully updated.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF2ECC71).withOpacity(0.9),
        colorText: Colors.white,
      );
    } catch (e) {
      // Fallback local update if network issues occur
      profileController.profile.value = updatedProfile;
      Get.back(result: true);
      Get.snackbar(
        'Profile Updated',
        'Updated locally. Sync with server failed: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFF39C12).withOpacity(0.9),
        colorText: Colors.white,
      );
    } finally {
      isSaving.value = false;
    }
  }

  void changePassword() {
    Get.toNamed(Routes.CHANGE_PASSWORD);
  }

  void onBackPressed() {
    Get.back();
  }

  @override
  void onClose() {
    nameController.dispose();
    emailController.dispose();
    phoneController.dispose();
    dobController.dispose();
    genderController.dispose();
    addressController.dispose();
    super.onClose();
  }
}
