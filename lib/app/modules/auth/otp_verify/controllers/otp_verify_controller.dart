import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import 'package:vmovexa/app/modules/auth/login/controllers/login_controller.dart';
import 'package:vmovexa/app/data/services/auth_service.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';

class OtpVerifyController extends GetxController {
  final List<TextEditingController> controllers = List.generate(6, (_) => TextEditingController());
  final List<FocusNode> focusNodes = List.generate(6, (_) => FocusNode());

  final RxInt secondsRemaining = 60.obs;
  final RxBool canResend = false.obs;
  final RxBool isLoading = false.obs;
  Timer? _timer;

  late final String destination;
  late final String role;
  late final bool isSignup;
  late final bool isMfa;
  late final String? mfaToken;
  late final String? phone;
  late final Map<String, dynamic>? registerPayload;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args is Map) {
      destination = (args['destination'] ?? '+91 98765 43210').toString();
      role = (args['role'] ?? 'Fleet Operator').toString();
      isSignup = args['is_signup'] == true;
      isMfa = args['is_mfa'] == true;
      mfaToken = args['mfa_token'] as String?;
      phone = args['phone']?.toString() ?? destination;
      registerPayload = args['register_payload'] is Map<String, dynamic>
          ? args['register_payload'] as Map<String, dynamic>
          : null;
    } else if (args is String) {
      destination = args;
      role = 'Fleet Operator';
      isSignup = false;
      isMfa = false;
      mfaToken = null;
      phone = args;
      registerPayload = null;
    } else {
      destination = '+91 98765 43210';
      role = 'Fleet Operator';
      isSignup = false;
      isMfa = false;
      mfaToken = null;
      phone = destination;
      registerPayload = null;
    }
    print('destination===$destination');
    startTimer();
  }

  void startTimer() {
    secondsRemaining.value = 60;
    canResend.value = false;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (secondsRemaining.value > 0) {
        secondsRemaining.value--;
      } else {
        canResend.value = true;
        _timer?.cancel();
      }
    });
  }

  Future<void> resendOtp() async {
    if (!canResend.value) return;

    try {
      if (isSignup) {
        await AuthService.to.requestSignupOtp(destination);
      } else {
        await AuthService.to.loginPhone(phone: phone ?? destination);
      }

      startTimer();
      for (var c in controllers) {
        c.clear();
      }
      focusNodes[0].requestFocus();

      Get.snackbar(
        'OTP Sent',
        'A new verification code has been sent successfully.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
      );
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to resend OTP: ${e.toString()}',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withOpacity(0.85),
        colorText: Colors.white,
      );
    }
  }

  Future<void> verifyOtp() async {
    final otp = controllers.map((c) => c.text).join();
    if (otp.length < 6) {
      Get.snackbar(
        'Invalid OTP',
        'Please enter all 6 digits of the verification code.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withOpacity(0.85),
        colorText: Colors.white,
      );
      return;
    }

    isLoading.value = true;

    try {
      if (isSignup) {
        // 1. Verify signup OTP
        final verifyRes = await AuthService.to.verifySignupOtp(
          destination: destination,
          otp: otp,
        );

        if (!verifyRes.success) {
          Get.snackbar(
            'Verification Failed',
            verifyRes.displayErrorMessage,
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: Colors.redAccent.withOpacity(0.85),
            colorText: Colors.white,
          );
          return;
        }

        // 2. Submit tenant registration application
        if (registerPayload != null) {
          final regRes = await AuthService.to.register(registerPayload!);
          if (regRes.success) {
            Get.snackbar(
              'Application Submitted',
              regRes.message ?? 'Registration application submitted. Awaiting SuperAdmin verification.',
              snackPosition: SnackPosition.BOTTOM,
              backgroundColor: const Color(0xFF10B981),
              colorText: Colors.white,
              duration: const Duration(seconds: 4),
            );
            Get.offAllNamed(Routes.LOGIN);
            return;
          } else {
            Get.snackbar(
              'Registration Failed',
              regRes.displayErrorMessage,
              snackPosition: SnackPosition.BOTTOM,
              backgroundColor: Colors.redAccent.withOpacity(0.85),
              colorText: Colors.white,
            );
            return;
          }
        } else {
          Get.snackbar(
            'Verified',
            'Mobile verification completed successfully.',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
          );
          Get.offAllNamed(Routes.LOGIN);
        }
      } else {
        // Phone login or MFA verification
        final response = await AuthService.to.verifyOtp(
          phone: phone ?? destination,
          otp: otp,
          mfaToken: mfaToken,
        );

        if (response.success && response.data != null) {
          final user = response.data!.user;
          final resolvedRole = user?.displayRole ?? role;
          LoginController.currentRole = resolvedRole;
          if (Get.isRegistered<StorageService>()) {
            await StorageService.to.setCurrentRole(resolvedRole);
          }

          Get.snackbar(
            'Verification Success',
            response.message ?? 'Welcome to VMOVEXA ($resolvedRole)!',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
          );

          final targetRoute = user?.dashboardRoute ?? Routes.FLEET_OP_DASHBOARD;
          Get.offAllNamed(targetRoute);
        } else {
          Get.snackbar(
            'Verification Failed',
            response.displayErrorMessage,
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: Colors.redAccent.withOpacity(0.85),
            colorText: Colors.white,
          );
        }
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        'Verification failed: ${e.toString()}',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withOpacity(0.85),
        colorText: Colors.white,
      );
    } finally {
      isLoading.value = false;
    }
  }

  String get formattedTimer {
    final minutes = secondsRemaining.value ~/ 60;
    final seconds = secondsRemaining.value % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  @override
  void onClose() {
    _timer?.cancel();
    for (var c in controllers) {
      c.dispose();
    }
    for (var f in focusNodes) {
      f.dispose();
    }
    super.onClose();
  }
}
