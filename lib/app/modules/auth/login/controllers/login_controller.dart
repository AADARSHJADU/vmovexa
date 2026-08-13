import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/routes/app_routes.dart';

class LoginController extends GetxController {
  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  final RxBool isPasswordObscured = true.obs;

  void togglePasswordVisibility() {
    isPasswordObscured.value = !isPasswordObscured.value;
  }

  void login() {
    String email = emailController.text.toLowerCase().trim();
    String role = 'Fleet Operator';
    
    if (email.contains('advertisement')) {
      role = 'Advertisement';
    } else if (email.contains('government')) {
      role = 'Government';
    } else if (email.contains('finance')) {
      role = 'Finance';
    } else if (email.contains('technical')) {
      role = 'Technical';
    } else if (email.contains('driver')) {
      role = 'Driver';
    }

    Get.snackbar(
      'Login Successful',
      'Welcome back to VMOVEXA ($role)!',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
    );
    
    if (role == 'Fleet Operator') {
      Get.offAllNamed(Routes.FLEET_OP_DASHBOARD);
    } else {
      Get.offAllNamed(Routes.ROLE_PLACEHOLDER, arguments: role);
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
