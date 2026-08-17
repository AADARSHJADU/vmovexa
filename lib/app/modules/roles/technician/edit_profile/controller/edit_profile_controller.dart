import 'package:flutter/material.dart';
import 'package:get/get.dart';
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
    profileController = Get.find<ProfileController>();
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

      role.value = currentProfile.role;
      department.value = currentProfile.department;
      reportingManager.value = currentProfile.reportingManager;
      workLocation.value = currentProfile.workLocation;
      joinedDate.value = currentProfile.joinedDate;
      username.value = currentProfile.username.isNotEmpty ? currentProfile.username : 'rahul.sharma';
      techId.value = currentProfile.techId;
      employeeId.value = currentProfile.employeeId;
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

  void saveProfile() {
    if (nameController.text.trim().isEmpty) {
      Get.snackbar(
        'Validation Error',
        'Full Name cannot be empty.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFFF4D4D).withOpacity(0.9),
        colorText: Colors.white,
      );
      return;
    }

    final updatedProfile = TechnicianProfile(
      name: nameController.text.trim(),
      role: role.value,
      techId: techId.value,
      employeeId: employeeId.value,
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

    profileController.profile.value = updatedProfile;

    Get.back();
    Get.snackbar(
      'Profile Updated',
      'Your profile details have been successfully updated.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF2ECC71).withOpacity(0.9),
      colorText: Colors.white,
    );
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
