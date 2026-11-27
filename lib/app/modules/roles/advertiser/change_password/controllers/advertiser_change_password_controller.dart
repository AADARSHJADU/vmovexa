import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../data/services/auth_service.dart';

class AdvertiserChangePasswordController extends GetxController {
  final currentPasswordController = TextEditingController();
  final newPasswordController = TextEditingController();
  final confirmPasswordController = TextEditingController();

  final RxBool currentObscure = true.obs;
  final RxBool newObscure = true.obs;
  final RxBool confirmObscure = true.obs;

  final RxInt passedCount = 0.obs;
  final RxString strengthText = 'Weak'.obs;
  final Rx<Color> strengthColor = const Color(0xFFEF4444).obs;

  final RxBool hasMinLength = false.obs;
  final RxBool hasUppercase = false.obs;
  final RxBool hasNumber = false.obs;
  final RxBool hasSpecial = false.obs;

  final RxBool isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    newPasswordController.addListener(_evaluateStrength);
  }

  void _evaluateStrength() {
    final text = newPasswordController.text;
    hasMinLength.value = text.length >= 8;
    hasUppercase.value = text.contains(RegExp(r'[A-Z]'));
    hasNumber.value = text.contains(RegExp(r'[0-9]'));
    hasSpecial.value = text.contains(RegExp(r'[!@#$%^&*(),.?":{}|<>]'));

    int count = 0;
    if (hasMinLength.value) count++;
    if (hasUppercase.value) count++;
    if (hasNumber.value) count++;
    if (hasSpecial.value) count++;

    passedCount.value = count;

    if (count <= 1) {
      strengthText.value = 'password_strength_weak'.tr;
      strengthColor.value = const Color(0xFFEF4444);
    } else if (count <= 3) {
      strengthText.value = 'password_strength_medium'.tr;
      strengthColor.value = const Color(0xFFF59E0B);
    } else {
      strengthText.value = 'password_strength_strong'.tr;
      strengthColor.value = const Color(0xFF10B981);
    }
  }

  Future<void> updatePassword() async {
    final currentPass = currentPasswordController.text.trim();
    final newPass = newPasswordController.text.trim();
    final confirmPass = confirmPasswordController.text.trim();

    if (currentPass.isEmpty) {
      Get.snackbar('required_field'.tr,
        'enter_current_password_msg'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.orangeAccent,
        colorText: Colors.white,
        margin: const EdgeInsets.all(16),
        borderRadius: 10,
      );
      return;
    }

    if (newPass.isEmpty) {
      Get.snackbar('required_field'.tr,
        'enter_new_secure_pwd_msg'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.orangeAccent,
        colorText: Colors.white,
        margin: const EdgeInsets.all(16),
        borderRadius: 10,
      );
      return;
    }

    if (newPass != confirmPass) {
      Get.snackbar('password_mismatch'.tr,
        'password_mismatch_msg'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
        margin: const EdgeInsets.all(16),
        borderRadius: 10,
      );
      return;
    }

    if (!hasMinLength.value || !hasUppercase.value || !hasNumber.value || !hasSpecial.value) {
      Get.snackbar('security_criteria_required'.tr,
        'password_criteria_msg'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFF59E0B),
        colorText: Colors.white,
        margin: const EdgeInsets.all(16),
        borderRadius: 10,
      );
      return;
    }

    try {
      isLoading.value = true;
      final res = await AuthService.to.changePassword(
        currentPassword: currentPass,
        newPassword: newPass,
      );

      if (res.success) {
        Get.snackbar(
          'password_updated'.tr,
          res.message ?? 'advertiser_password_updated_success'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          icon: const Icon(Icons.check_circle_rounded, color: Colors.white),
          margin: const EdgeInsets.all(16),
          borderRadius: 10,
        );
        await Future.delayed(const Duration(milliseconds: 700));
        Get.back();
      } else {
        Get.snackbar(
          'update_failed'.tr,
          res.message ?? 'advertiser_password_update_failed'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
          icon: const Icon(Icons.error_outline_rounded, color: Colors.white),
          margin: const EdgeInsets.all(16),
          borderRadius: 10,
        );
      }
    } catch (e) {
      Get.snackbar(
        'error_title'.tr,
        '${'server_connection_error_msg'.tr}: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
        margin: const EdgeInsets.all(16),
        borderRadius: 10,
      );
    } finally {
      isLoading.value = false;
    }
  }

  @override
  void onClose() {
    currentPasswordController.dispose();
    newPasswordController.dispose();
    confirmPasswordController.dispose();
    super.onClose();
  }
}

