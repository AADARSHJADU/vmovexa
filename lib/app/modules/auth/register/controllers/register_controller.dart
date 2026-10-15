import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import 'package:vmovexa/app/data/services/auth_service.dart';

class RegisterController extends GetxController {
  final fullNameController = TextEditingController();
  final orgNameController = TextEditingController();
  final emailController = TextEditingController();
  final mobileController = TextEditingController();
  final passwordController = TextEditingController();

  final RxString selectedOperator = 'Fleet Operator'.obs;
  final RxBool isPasswordObscured = true.obs;
  final RxBool isTermsAgreed = true.obs;
  final RxBool isLoading = false.obs;

  final List<String> operatorTypes = [
    'Fleet Operator',
    'Advertisement',
    'Government',
    'Finance',
    'Technician',
    'Driver',
  ];

  void togglePasswordVisibility() {
    isPasswordObscured.value = !isPasswordObscured.value;
  }

  void toggleTerms(bool? value) {
    isTermsAgreed.value = value ?? false;
  }

  void setSelectedOperator(String? value) {
    if (value != null) {
      selectedOperator.value = value;
    }
  }

  String _mapBusinessType(String role) {
    switch (role) {
      case 'Fleet Operator':
        return 'fleet_operator';
      case 'Advertisement':
        return 'advertiser';
      case 'Government':
        return 'government';
      case 'Finance':
        return 'finance';
      case 'Technician':
        return 'technician';
      case 'Driver':
        return 'driver';
      default:
        return 'fleet_operator';
    }
  }

  Future<void> registerAccount() async {
    final fullName = fullNameController.text.trim();
    final orgName = orgNameController.text.trim();
    final email = emailController.text.trim().toLowerCase();
    final phone = mobileController.text.trim();
    final password = passwordController.text;

    if (fullName.isEmpty) {
      Get.snackbar(
        'Validation Error',
        'Please enter your full name.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withOpacity(0.85),
        colorText: Colors.white,
      );
      return;
    }

    if (orgName.isEmpty) {
      Get.snackbar(
        'Validation Error',
        'Please enter your organization name.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withOpacity(0.85),
        colorText: Colors.white,
      );
      return;
    }

    if (email.isEmpty || !GetUtils.isEmail(email)) {
      Get.snackbar(
        'Validation Error',
        'Please enter a valid business email address.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withOpacity(0.85),
        colorText: Colors.white,
      );
      return;
    }

    if (phone.isEmpty || phone.length < 10) {
      Get.snackbar(
        'Validation Error',
        'Please enter a valid 10-digit mobile number.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withOpacity(0.85),
        colorText: Colors.white,
      );
      return;
    }

    if (password.length < 6) {
      Get.snackbar(
        'Validation Error',
        'Password must be at least 6 characters.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withOpacity(0.85),
        colorText: Colors.white,
      );
      return;
    }

    if (!isTermsAgreed.value) {
      Get.snackbar(
        'Terms Required',
        'Please agree to the Terms & Privacy Policy to proceed.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withOpacity(0.85),
        colorText: Colors.white,
      );
      return;
    }

    final destinationVal = email;
    // final destinationVal = phone.isNotEmpty ? phone : email;

    isLoading.value = true;

    try {
      // Request signup OTP
      final otpResponse = await AuthService.to.requestSignupOtp(destinationVal);

      final registerPayload = {
        'organization_name': orgName,
        'business_type': _mapBusinessType(selectedOperator.value),
        'contact_name': fullName,
        'email': email,
        'phone': phone,
        'password': password,
      };

      Get.snackbar(
        'Verification Code Sent',
        otpResponse.message ?? 'OTP sent to $destinationVal for account verification.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
      );

      // Get.toNamed(
      //   Routes.OTP_VERIFY,
      //   arguments: {
      //     'destination': destinationVal,
      //     'role': selectedOperator.value,
      //     'is_signup': true,
      //     'register_payload': registerPayload,
      //   },
      // );
    } catch (e) {
      Get.snackbar(
        'Error',
        'Could not initiate registration: ${e.toString()}',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withOpacity(0.85),
        colorText: Colors.white,
      );
    } finally {
      isLoading.value = false;
    }
  }

  void goToLogin() {
    Get.toNamed(Routes.LOGIN);
  }

  @override
  void onClose() {
    fullNameController.dispose();
    orgNameController.dispose();
    emailController.dispose();
    mobileController.dispose();
    passwordController.dispose();
    super.onClose();
  }
}
