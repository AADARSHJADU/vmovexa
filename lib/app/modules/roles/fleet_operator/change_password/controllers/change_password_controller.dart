import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../routes/app_routes.dart';

class ChangePasswordController extends GetxController {
  final currentPasswordController = TextEditingController();
  final newPasswordController = TextEditingController();
  final confirmPasswordController = TextEditingController();

  final RxBool currentObscure = true.obs;
  final RxBool newObscure = true.obs;
  final RxBool confirmObscure = true.obs;

  final RxInt passwordStrength = 0.obs; // 0 to 4
  final RxString strengthText = 'Weak'.obs;

  final RxBool hasMinLength = false.obs;
  final RxBool hasUppercase = false.obs;
  final RxBool hasNumber = false.obs;
  final RxBool hasSpecialChar = false.obs;

  @override
  void onInit() {
    super.onInit();
    newPasswordController.addListener(_validatePassword);
  }

  void _validatePassword() {
    String text = newPasswordController.text;
    
    hasMinLength.value = text.length >= 8;
    hasUppercase.value = text.contains(RegExp(r'[A-Z]'));
    hasNumber.value = text.contains(RegExp(r'[0-9]'));
    hasSpecialChar.value = text.contains(RegExp(r'[!@#$%^&*(),.?":{}|<>]'));

    int score = 0;
    if (hasMinLength.value) score++;
    if (hasUppercase.value) score++;
    if (hasNumber.value) score++;
    if (hasSpecialChar.value) score++;

    passwordStrength.value = score;

    if (score <= 1) {
      strengthText.value = 'Weak';
    } else if (score == 2) {
      strengthText.value = 'Fair';
    } else if (score == 3) {
      strengthText.value = 'Good';
    } else {
      strengthText.value = 'Strong';
    }
  }

  void updatePassword() {
    if (passwordStrength.value < 4) {
      Get.snackbar(
        'Password Weak',
        'Please fulfill all password requirements before saving.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.orangeAccent,
        colorText: Colors.white,
      );
      return;
    }
    
    if (newPasswordController.text != confirmPasswordController.text) {
      Get.snackbar(
        'Mismatch',
        'New password and confirm password do not match.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withOpacity(0.8),
        colorText: Colors.white,
      );
      return;
    }

    Get.toNamed(Routes.PASSWORD_UPDATED);
  }

  void cancel() {
    Get.back();
  }

  @override
  void onClose() {
    currentPasswordController.dispose();
    newPasswordController.dispose();
    confirmPasswordController.dispose();
    super.onClose();
  }
}
