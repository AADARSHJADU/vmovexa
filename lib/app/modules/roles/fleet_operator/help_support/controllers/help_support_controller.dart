import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../routes/app_routes.dart';

class HelpSupportController extends GetxController {
  final String email = 'support@vmovexa.com';
  final String phone = '+91 98765 43210';

  void goToSupportHistory() {
    Get.toNamed(Routes.SUPPORT_HISTORY);
  }

  void openEmail() {
    Get.snackbar(
      'Email Support',
      'Opening email composer for $email...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF6366F1),
      colorText: Colors.white,
    );
  }

  void openCall() {
    Get.snackbar(
      'Call Support',
      'Dialing support hotline $phone...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
    );
  }

  void openWhatsapp() {
    Get.snackbar(
      'WhatsApp Support',
      'Opening WhatsApp chat support for $phone...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
    );
  }
}
