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
        'invalid_credentials'.tr,
        'enter_valid_email'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withValues(alpha: 0.85),
        colorText: Colors.white,
      );
      return;
    }

    isLoading.value = true;

    try {
      final response = await AuthService.to.forgotPassword(email);

      if (response.success) {
        Get.snackbar(
          'otp_sent'.tr,
          response.message ?? 'otp_sent_to_email'.trParams({'email': email}),
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );

        // Navigate to OTP Verification Screen passing email
        Get.toNamed(Routes.OTP_VERIFY, arguments: {
          'destination': email,
          'email': email,
          'is_forgot_password': true,
        });
      } else {
        Get.snackbar(
          'request_failed'.tr,
          response.displayErrorMessage,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.redAccent.withValues(alpha: 0.85),
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar(
        'error'.tr,
        e.toString(),
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withValues(alpha: 0.85),
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
