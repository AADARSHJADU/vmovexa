import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import 'package:vmovexa/app/data/services/auth_service.dart';

class ResetPasswordController extends GetxController {
  final passwordController = TextEditingController();
  final confirmPasswordController = TextEditingController();

  final RxBool isPasswordObscured = true.obs;
  final RxBool isConfirmPasswordObscured = true.obs;
  final RxBool isLoading = false.obs;

  // Checklist states
  final RxBool hasAtLeast8Chars = false.obs;
  final RxBool hasUppercase = false.obs;
  final RxBool hasNumber = false.obs;
  final RxBool hasSpecialChar = false.obs;

  late final String resetToken;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args is Map) {
      resetToken = (args['token'] ?? '').toString();
    } else if (args is String) {
      resetToken = args;
    } else {
      resetToken = '';
    }
    passwordController.addListener(_validatePassword);
  }

  void togglePasswordVisibility() {
    isPasswordObscured.value = !isPasswordObscured.value;
  }

  void toggleConfirmPasswordVisibility() {
    isConfirmPasswordObscured.value = !isConfirmPasswordObscured.value;
  }

  void _validatePassword() {
    final val = passwordController.text;
    hasAtLeast8Chars.value = val.length >= 8;
    hasUppercase.value = val.contains(RegExp(r'[A-Z]'));
    hasNumber.value = val.contains(RegExp(r'[0-9]'));
    hasSpecialChar.value = val.contains(RegExp(r'[!@#$%^&*(),.?":{}|<>]'));
  }

  Future<void> updatePassword() async {
    final password = passwordController.text;
    final confirm = confirmPasswordController.text;

    if (!hasAtLeast8Chars.value || !hasUppercase.value || !hasNumber.value || !hasSpecialChar.value) {
      Get.snackbar(
        'Weak Password',
        'Please satisfy all password complexity requirements.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withOpacity(0.85),
        colorText: Colors.white,
      );
      return;
    }

    if (password != confirm) {
      Get.snackbar(
        'Mismatch Passwords',
        'New password and confirm password fields must match.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withOpacity(0.85),
        colorText: Colors.white,
      );
      return;
    }

    isLoading.value = true;

    try {
      final response = await AuthService.to.resetPassword(
        token: resetToken,
        password: password,
      );

      if (response.success) {
        Get.snackbar(
          'Password Updated',
          response.message ?? 'Your password has been successfully reset.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );

        // Navigate to Password Updated Success View
        Get.offAllNamed(Routes.PASSWORD_UPDATED);
      } else {
        Get.snackbar(
          'Reset Failed',
          response.displayErrorMessage,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.redAccent.withOpacity(0.85),
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        'Could not update password: ${e.toString()}',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withOpacity(0.85),
        colorText: Colors.white,
      );
    } finally {
      isLoading.value = false;
    }
  }

  @override
  void onClose() {
    passwordController.dispose();
    confirmPasswordController.dispose();
    super.onClose();
  }
}
