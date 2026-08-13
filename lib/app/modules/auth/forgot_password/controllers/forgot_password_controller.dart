import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../routes/app_routes.dart';

class ForgotPasswordController extends GetxController {
  final emailController = TextEditingController();

  void sendResetLink() {
    String email = emailController.text.trim();
    if (email.isEmpty || !GetUtils.isEmail(email)) {
      Get.snackbar(
        'Invalid Email',
        'Please enter a valid registered email address.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withOpacity(0.8),
        colorText: Colors.white,
      );
      return;
    }

    Get.snackbar(
      'Reset Link Sent',
      'A password reset link has been sent to $email.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
    );

    // Navigate to Reset Password Screen
    Get.toNamed(Routes.RESET_PASSWORD, arguments: email);
  }

  void backToLogin() {
    Get.offNamed(Routes.LOGIN);
  }

  @override
  void onClose() {
    emailController.dispose();
    super.onClose();
  }
}
