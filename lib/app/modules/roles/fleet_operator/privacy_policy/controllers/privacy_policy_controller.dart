import 'package:flutter/material.dart';
import 'package:get/get.dart';

class PrivacyPolicyController extends GetxController {
  final RxInt expandedIndex = (-1).obs;

  void toggleIndex(int index) {
    if (expandedIndex.value == index) {
      expandedIndex.value = -1;
    } else {
      expandedIndex.value = index;
    }
  }

  void openQuestionsMail() {
    Get.snackbar(
      'Questions Support',
      'Opening email composer to support@vmovexa.com...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF6366F1),
      colorText: Colors.white,
    );
  }
}
