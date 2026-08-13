import 'package:flutter/material.dart';
import 'package:get/get.dart';

class NotificationSettingsController extends GetxController {
  final RxBool pushNotifications = true.obs;
  
  final RxBool vehicleAlerts = true.obs;
  final RxBool tripUpdates = true.obs;
  final RxBool maintenanceReminders = true.obs;
  final RxBool systemNotifications = true.obs;
  final RxBool securityAlerts = true.obs;

  final RxString pushChannelStatus = 'Enabled'.obs;
  final RxString emailChannelStatus = 'Enabled'.obs;
  final RxString smsChannelStatus = 'Disabled'.obs;

  void savePreferences() {
    Get.back();
    Get.snackbar(
      'Preferences Saved',
      'Notification alert configurations have been updated.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
    );
  }
}
