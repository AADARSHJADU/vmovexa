import 'package:flutter/material.dart';
import 'package:get/get.dart';

class TermsConditionsController extends GetxController {
  final RxInt expandedIndex = (-1).obs;

  void toggleIndex(int index) {
    if (expandedIndex.value == index) {
      expandedIndex.value = -1;
    } else {
      expandedIndex.value = index;
    }
  }

  void openHelpMail() {
    Get.snackbar(
      'Terms Support',
      'Opening email composer to support@vmovexa.com...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF6366F1),
      colorText: Colors.white,
    );
  }

  void agreeTerms() {
    Get.back();
    Get.snackbar(
      'Terms Accepted',
      'Thank you for accepting VMOVEXA terms and conditions.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
    );
  }
}
