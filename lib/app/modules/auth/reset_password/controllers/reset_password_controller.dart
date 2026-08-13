import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../routes/app_routes.dart';

class ResetPasswordController extends GetxController {
  final passwordController = TextEditingController();
  final confirmPasswordController = TextEditingController();

  final RxBool isPasswordObscured = true.obs;
  final RxBool isConfirmPasswordObscured = true.obs;

  // Checklist states
  final RxBool hasAtLeast8Chars = false.obs;
  final RxBool hasUppercase = false.obs;
  final RxBool hasNumber = false.obs;
  final RxBool hasSpecialChar = false.obs;

  @override
  void onInit() {
    super.onInit();
    passwordController.addListener(_validatePassword);
  }

  void togglePasswordVisibility() {
    isPasswordObscured.value = !isPasswordObscured.value;
  }

  void toggleConfirmPasswordVisibility() {
    isConfirmPasswordObscured.value = !isConfirmPasswordObscured.value;
  }

  void _validatePassword() {
    String val = passwordController.text;
    
    hasAtLeast8Chars.value = val.length >= 8;
    hasUppercase.value = val.contains(RegExp(r'[A-Z]'));
    hasNumber.value = val.contains(RegExp(r'[0-9]'));
    hasSpecialChar.value = val.contains(RegExp(r'[!@#$%^&*(),.?":{}|<>]'));
  }

  void updatePassword() {
    String password = passwordController.text;
    String confirm = confirmPasswordController.text;

    if (!hasAtLeast8Chars.value || !hasUppercase.value || !hasNumber.value || !hasSpecialChar.value) {
      Get.snackbar(
        'Weak Password',
        'Please satisfy all password requirements.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withOpacity(0.8),
        colorText: Colors.white,
      );
      return;
    }

    if (password != confirm) {
      Get.snackbar(
        'Mismatch Passwords',
        'New password and confirm password fields must match.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withOpacity(0.8),
        colorText: Colors.white,
      );
      return;
    }

    Get.snackbar(
      'Password Updated',
      'Your password has been successfully reset.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
    );

    // Navigate to Password Updated Success View
    Get.offAllNamed(Routes.PASSWORD_UPDATED);
  }

  @override
  void onClose() {
    passwordController.dispose();
    confirmPasswordController.dispose();
    super.onClose();
  }
}
