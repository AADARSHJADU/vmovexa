import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../routes/app_routes.dart';

class AccountSettingsController extends GetxController {
  final RxString fullName = 'Rohan Mehta'.obs;
  final RxString email = 'rohan.mehta@vmovexa.com'.obs;
  final RxString phone = '+91 98765 43210'.obs;
  final RxString employeeId = 'OP987654'.obs;
  final RxString role = 'Fleet Operator'.obs;

  final RxString companyName = 'VMOVEXA Transport Solutions'.obs;
  final RxString branch = 'Bengaluru Head Office'.obs;
  final RxString officeAddress = 'No. 12, 2nd Floor, Outer Ring Road, Indiranagar, Bengaluru - 560038, Karnataka, India'.obs;

  final RxString language = 'English (India)'.obs;
  final RxString timezone = '(GMT +05:30) Asia/Kolkata'.obs;

  void saveChanges() {
    Get.back();
    Get.snackbar(
      'Settings Saved',
      'Account settings updated successfully.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
    );
  }

  void cancel() {
    Get.back();
  }

  void changePhoto() {
    Get.snackbar(
      'Change Photo',
      'Opening camera / gallery settings...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF6366F1),
      colorText: Colors.white,
    );
  }

  void goToChangePassword() {
    Get.toNamed(Routes.CHANGE_PASSWORD);
  }
}
