import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import 'package:vmovexa/app/data/services/auth_service.dart';

class ChangePasswordController extends GetxController {
  final currentPasswordController = TextEditingController();
  final newPasswordController = TextEditingController();
  final confirmPasswordController = TextEditingController();

  final RxBool currentObscure = true.obs;
  final RxBool newObscure = true.obs;
  final RxBool confirmObscure = true.obs;

  final RxInt passwordStrength = 0.obs; // 0 to 4
  final RxString strengthText = 'strength_weak'.tr.obs;

  final RxBool hasMinLength = false.obs;
  final RxBool hasUppercase = false.obs;
  final RxBool hasNumber = false.obs;
  final RxBool hasSpecialChar = false.obs;

  final RxBool isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    newPasswordController.addListener(_validatePassword);
  }

  void _validatePassword() {
    String text = newPasswordController.text;

    hasMinLength.value = text.length >= 8;
    hasUppercase.value = text.contains(RegExp(r'[A-Z]'));
    hasNumber.value = text.contains(RegExp(r'[0-9]'));
    hasSpecialChar.value = text.contains(RegExp(r'[!@#$%^&*(),.?":{}|<>]'));

    int score = 0;
    if (hasMinLength.value) score++;
    if (hasUppercase.value) score++;
    if (hasNumber.value) score++;
    if (hasSpecialChar.value) score++;

    passwordStrength.value = score;

    if (score <= 1) {
      strengthText.value = 'strength_weak'.tr;
    } else if (score == 2) {
      strengthText.value = 'strength_fair'.tr;
    } else if (score == 3) {
      strengthText.value = 'strength_good'.tr;
    } else {
      strengthText.value = 'strength_strong'.tr;
    }
  }

  Future<void> updatePassword() async {
    final currentPass = currentPasswordController.text.trim();
    final newPass = newPasswordController.text.trim();
    final confirmPass = confirmPasswordController.text.trim();

    if (currentPass.isEmpty) {
      Get.snackbar(
        'error'.tr,
        'enter_current_password_msg'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.orangeAccent,
        colorText: Colors.white,
        margin: const EdgeInsets.all(16),
        borderRadius: 10,
      );
      return;
    }

    if (passwordStrength.value < 3) {
      Get.snackbar(
        'error'.tr,
        'password_too_weak_msg'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.orangeAccent,
        colorText: Colors.white,
        margin: const EdgeInsets.all(16),
        borderRadius: 10,
      );
      return;
    }

    if (newPass != confirmPass) {
      Get.snackbar(
        'error'.tr,
        'passwords_do_not_match_msg'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
        margin: const EdgeInsets.all(16),
        borderRadius: 10,
      );
      return;
    }

    try {
      isLoading.value = true;

      if (Get.isRegistered<AuthService>()) {
        final res = await AuthService.to.changePassword(
          currentPassword: currentPass,
          newPassword: newPass,
        );

        if (res.success) {
          Get.snackbar(
            'success'.tr,
            res.message ?? 'Password updated successfully.',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
            icon: const Icon(Icons.check_circle_rounded, color: Colors.white),
            margin: const EdgeInsets.all(16),
            borderRadius: 10,
          );
          await Future.delayed(const Duration(milliseconds: 600));
          Get.toNamed(Routes.PASSWORD_UPDATED);
        } else {
          Get.snackbar(
            'error'.tr,
            res.message ?? 'Failed to update password. Please check your current password.',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFFEF4444),
            colorText: Colors.white,
            icon: const Icon(Icons.error_outline_rounded, color: Colors.white),
            margin: const EdgeInsets.all(16),
            borderRadius: 10,
          );
        }
      } else {
        Get.toNamed(Routes.PASSWORD_UPDATED);
      }
    } catch (e) {
      Get.snackbar(
        'error'.tr,
        'Server connection error: $e',
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

  void cancel() {
    Get.back();
  }

  @override
  void onClose() {
    currentPasswordController.dispose();
    newPasswordController.dispose();
    confirmPasswordController.dispose();
    super.onClose();
  }
}
