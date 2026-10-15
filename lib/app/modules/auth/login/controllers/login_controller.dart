import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import 'package:vmovexa/app/data/services/auth_service.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';

class LoginController extends GetxController {
  static String currentRole = 'Fleet Operator';

  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  final RxBool isPasswordObscured = true.obs;
  final RxBool isLoading = false.obs;

  void togglePasswordVisibility() {
    isPasswordObscured.value = !isPasswordObscured.value;
  }

  Future<void> login() async {
    final email = emailController.text.trim();
    final password = passwordController.text;

    if (email.isEmpty) {
      Get.snackbar(
        'Validation Error',
        'Please enter your business email.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withOpacity(0.85),
        colorText: Colors.white,
      );
      return;
    }

    if (!GetUtils.isEmail(email)) {
      Get.snackbar(
        'Validation Error',
        'Please enter a valid email address.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withOpacity(0.85),
        colorText: Colors.white,
      );
      return;
    }

    if (password.isEmpty) {
      Get.snackbar(
        'Validation Error',
        'Please enter your password.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withOpacity(0.85),
        colorText: Colors.white,
      );
      return;
    }

    isLoading.value = true;

    try {
      final response = await AuthService.to.loginEmail(
        email: email,
        password: password,
      );

      if (response.success && response.data != null) {
        final authData = response.data!;

        // Handle MFA Challenge
        if (authData.mfaRequired) {
          Get.snackbar(
            'MFA Verification',
            response.message ?? 'OTP verification code sent.',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF6366F1),
            colorText: Colors.white,
          );

          Get.toNamed(
            Routes.OTP_VERIFY,
            arguments: {
              'destination': authData.phoneMasked ?? email,
              'mfa_token': authData.mfaToken,
              'is_mfa': true,
              'phone': authData.phoneMasked ?? '',
              'role': 'Fleet Operator',
            },
          );
          return;
        }

        // Direct Login Success
        final user = authData.user;
        final resolvedRole = user?.displayRole ?? 'Fleet Operator';
        print('resolvedRole===$resolvedRole');
        currentRole = resolvedRole;
        if (Get.isRegistered<StorageService>()) {
          await StorageService.to.setCurrentRole(resolvedRole);
        }

        Get.snackbar(
          'Login Successful',
          response.message ?? 'Welcome back to VMOVEXA ($resolvedRole)!',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );

        final targetRoute = user?.dashboardRoute ?? Routes.FLEET_OP_DASHBOARD;
        print('targetRoute===$targetRoute');
        Get.offAllNamed(targetRoute);
      } else {
        debugPrint('api error====${response.displayErrorMessage}');
        Get.snackbar(
          'Login Failed',
          response.displayErrorMessage,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.redAccent.withOpacity(0.85),
          colorText: Colors.white,
        );
      }
    } catch (e) {
      debugPrint('api error====${e.toString()}');
      Get.snackbar(
        'Error',
        'An unexpected error occurred: ${e.toString()}',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withOpacity(0.85),
        colorText: Colors.white,
      );
    } finally {
      isLoading.value = false;
    }
  }

  // Google OAuth Login
  Future<void> loginWithGoogle(String idToken) async {
    isLoading.value = true;
    try {
      final response = await AuthService.to.googleLogin(idToken);
      if (response.success && response.data != null) {
        final user = response.data!.user;
        final resolvedRole = user?.displayRole ?? 'Fleet Operator';
        currentRole = resolvedRole;
        Get.offAllNamed(user?.dashboardRoute ?? Routes.FLEET_OP_DASHBOARD);
      } else {
        Get.snackbar(
          'Google Login Failed',
          response.displayErrorMessage,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.redAccent.withOpacity(0.85),
          colorText: Colors.white,
        );
      }
    } finally {
      isLoading.value = false;
    }
  }

  void goToRegister() {
    Get.toNamed(Routes.REGISTER);
  }

  void goToForgotPassword() {
    Get.toNamed(Routes.FORGOT_PASSWORD);
  }

  @override
  void onClose() {
    emailController.dispose();
    passwordController.dispose();
    super.onClose();
  }
}
