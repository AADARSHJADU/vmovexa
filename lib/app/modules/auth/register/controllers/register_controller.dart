import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/routes/app_routes.dart';

class RegisterController extends GetxController {
  final fullNameController = TextEditingController();
  final orgNameController = TextEditingController();
  final emailController = TextEditingController();
  final mobileController = TextEditingController();
  final passwordController = TextEditingController();

  final RxString selectedOperator = 'Fleet Operator'.obs;
  final RxBool isPasswordObscured = true.obs;
  final RxBool isTermsAgreed = true.obs;

  final List<String> operatorTypes = [
    'Fleet Operator',
    'Advertisement',
    /*'Government',
    'Finance',
    'Technician',
    'Driver',*/
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

  void registerAccount() {
    if (!isTermsAgreed.value) {
      Get.snackbar(
        'Terms Required',
        'Please agree to the Terms & Privacy Policy to proceed.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withOpacity(0.8),
        colorText: Colors.white,
      );
      return;
    }

    String destinationVal = mobileController.text.isNotEmpty
        ? mobileController.text
        : emailController.text.isNotEmpty
            ? emailController.text
            : "+91 98765 43210";

    Get.toNamed(
      Routes.OTP_VERIFY,
      arguments: {
        'destination': destinationVal,
        'role': selectedOperator.value,
      },
    );
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
