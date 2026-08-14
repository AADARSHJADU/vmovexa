import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../routes/app_routes.dart';
import '../../login/controllers/login_controller.dart';


class OtpVerifyController extends GetxController {
  final List<TextEditingController> controllers = List.generate(6, (_) => TextEditingController());
  final List<FocusNode> focusNodes = List.generate(6, (_) => FocusNode());

  final RxInt secondsRemaining = 30.obs;
  final RxBool canResend = false.obs;
  Timer? _timer;

  // Destination and role arguments passed from registration
  final String destination = (Get.arguments is Map)
      ? (Get.arguments['destination'] ?? "+91 98765 43210")
      : (Get.arguments ?? "+91 98765 43210");
  final String role = (Get.arguments is Map)
      ? (Get.arguments['role'] ?? 'Fleet Operator')
      : 'Fleet Operator';


  @override
  void onInit() {
    super.onInit();
    startTimer();
  }

  void startTimer() {
    secondsRemaining.value = 30;
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

  void resendOtp() {
    if (canResend.value) {
      startTimer();
      // Clear controllers
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
    }
  }

  void verifyOtp() {
    String otp = controllers.map((c) => c.text).join();
    if (otp.length < 6) {
      Get.snackbar(
        'Invalid OTP',
        'Please enter all 6 digits of the verification code.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withOpacity(0.8),
        colorText: Colors.white,
      );
      return;
    }

    Get.snackbar(
      'Verification Success',
      'Your mobile number has been successfully verified.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
    );

    // Navigate to role-specific dashboard
    LoginController.currentRole = role;
    if (role == 'Fleet Operator') {

       Get.offAllNamed(Routes.FLEET_OP_DASHBOARD);
    } else if (role == 'Advertisement') {
       Get.offAllNamed(Routes.ADVERTISER_DASHBOARD);
    } else {
       Get.offAllNamed(Routes.ROLE_PLACEHOLDER, arguments: role);
    }

  }


  String get formattedTimer {
    int minutes = secondsRemaining.value ~/ 60;
    int seconds = secondsRemaining.value % 60;
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
