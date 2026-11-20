import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import 'package:vmovexa/app/data/services/auth_service.dart';

class ResetPasswordController extends GetxController {
  final otpController = TextEditingController();
  final passwordController = TextEditingController();
  final confirmPasswordController = TextEditingController();

  final RxBool isPasswordObscured = true.obs;
  final RxBool isConfirmPasswordObscured = true.obs;
  final RxBool isLoading = false.obs;
  final RxBool isResending = false.obs;
  final RxInt resendCooldown = 0.obs;
  Timer? _cooldownTimer;

  // Checklist states
  final RxBool hasAtLeast8Chars = false.obs;
  final RxBool hasUppercase = false.obs;
  final RxBool hasNumber = false.obs;
  final RxBool hasSpecialChar = false.obs;

  String email = '';
  String? devCode;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args is Map) {
      email = (args['email'] ?? args['destination'] ?? '').toString();
      devCode = args['dev_code']?.toString();
    } else if (args is String) {
      email = args.contains('@') ? args : '';
    } else {
      email = '';
    }

    if (devCode != null && devCode!.isNotEmpty) {
      otpController.text = devCode!;
    }

    passwordController.addListener(_validatePassword);
    startResendTimer(60);
  }

  void startResendTimer([int seconds = 60]) {
    _cooldownTimer?.cancel();
    resendCooldown.value = seconds;
    _cooldownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (resendCooldown.value > 0) {
        resendCooldown.value--;
      } else {
        timer.cancel();
      }
    });
  }

  Future<void> resendOtp() async {
    if (resendCooldown.value > 0 || isResending.value) return;

    if (email.isEmpty) {
      Get.snackbar(
        'error'.tr,
        'enter_valid_email'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withValues(alpha: 0.85),
        colorText: Colors.white,
      );
      return;
    }

    isResending.value = true;
    try {
      final response = await AuthService.to.forgotPassword(email);
      if (response.success) {
        if (response.data is Map) {
          final data = response.data as Map;
          final newCode = (data['devCode'] ?? data['code'] ?? data['otp'])?.toString();
          if (newCode != null && newCode.isNotEmpty) {
            otpController.text = newCode;
          }
        }
        Get.snackbar(
          'otp_sent'.tr,
          response.message ?? 'otp_sent_to_email'.trParams({'email': email}),
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );
        startResendTimer(60);
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
      isResending.value = false;
    }
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
    final otp = otpController.text.trim();
    final password = passwordController.text;
    final confirm = confirmPasswordController.text;

    if (otp.length != 6) {
      Get.snackbar(
        'invalid_otp'.tr,
        'enter_six_digit_otp'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withValues(alpha: 0.85),
        colorText: Colors.white,
      );
      return;
    }

    if (!hasAtLeast8Chars.value || !hasUppercase.value || !hasNumber.value || !hasSpecialChar.value) {
      Get.snackbar(
        'weak_password'.tr,
        'password_complexity_req'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withValues(alpha: 0.85),
        colorText: Colors.white,
      );
      return;
    }

    if (password != confirm) {
      Get.snackbar(
        'password_mismatch'.tr,
        'passwords_do_not_match_msg'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withValues(alpha: 0.85),
        colorText: Colors.white,
      );
      return;
    }

    isLoading.value = true;

    try {
      final response = await AuthService.to.resetPassword(
        email: email.isNotEmpty ? email : null,
        code: otp,
        newPassword: password,
      );

      if (response.success) {
        Get.snackbar(
          'password_updated'.tr,
          response.message ?? 'password_reset_success'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );

        // Redirect directly to login screen as requested
        Get.offAllNamed(Routes.LOGIN);
      } else {
        Get.snackbar(
          'reset_failed'.tr,
          response.displayErrorMessage,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.redAccent.withValues(alpha: 0.85),
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar(
        'error'.tr,
        '${'reset_failed'.tr}: ${e.toString()}',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withValues(alpha: 0.85),
        colorText: Colors.white,
      );
    } finally {
      isLoading.value = false;
    }
  }

  @override
  void onClose() {
    otpController.dispose();
    passwordController.dispose();
    confirmPasswordController.dispose();
    _cooldownTimer?.cancel();
    super.onClose();
  }
}
