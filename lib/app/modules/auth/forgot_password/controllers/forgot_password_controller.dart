import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import 'package:vmovexa/app/data/services/auth_service.dart';

class ForgotPasswordController extends GetxController {
  final emailController = TextEditingController();
  final RxBool isLoading = false.obs;

  Future<void> sendResetLink() async {
    final email = emailController.text.trim();
    if (email.isEmpty || !GetUtils.isEmail(email)) {
      Get.snackbar(
        'Invalid Email',
        'Please enter a valid registered email address.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withOpacity(0.85),
        colorText: Colors.white,
      );
      return;
    }

    isLoading.value = true;

    try {
      final response = await AuthService.to.forgotPassword(email);

      if (response.success) {
        Get.snackbar(
          'Reset Link Sent',
          response.message ?? 'A password reset instructions email has been sent to $email.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );

        // Navigate to Reset Password Screen passing email
        Get.toNamed(Routes.RESET_PASSWORD, arguments: email);
      } else {
        Get.snackbar(
          'Request Failed',
          response.displayErrorMessage,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.redAccent.withOpacity(0.85),
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        'Could not send reset link: ${e.toString()}',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withOpacity(0.85),
        colorText: Colors.white,
      );
    } finally {
      isLoading.value = false;
    }
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
