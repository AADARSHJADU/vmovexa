import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/services/finance_service.dart';

class NotificationPreferencesController extends GetxController {
  // 5 Master Delivery Channels matching Admin Panel FinanceNotificationSettingsPage
  final RxBool channelInApp = true.obs;
  final RxBool channelPush = true.obs;
  final RxBool channelSms = false.obs;
  final RxBool channelEmail = true.obs;
  final RxBool channelWhatsapp = false.obs;

  final RxBool isLoading = false.obs;
  final RxBool isUpdating = false.obs;

  @override
  void onInit() {
    super.onInit();
    fetchPreferences();
  }

  Future<void> fetchPreferences() async {
    isLoading.value = true;
    try {
      if (Get.isRegistered<FinanceService>()) {
        final res = await FinanceService.to.getNotificationSettings();
        if (res.success && res.data != null) {
          final data = res.data is Map ? (res.data['settings'] ?? res.data) as Map : {};
          channelInApp.value = data['channel_in_app'] == true;
          channelPush.value = data['channel_push'] == true;
          channelSms.value = data['channel_sms'] == true;
          channelEmail.value = data['channel_email'] == true;
          channelWhatsapp.value = data['channel_whatsapp'] == true;
        }
      }
    } catch (_) {
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> onRefresh() async => fetchPreferences();

  Future<void> toggleChannel(String field, bool currentValue) async {
    final nextVal = !currentValue;

    // Optimistic UI update
    _setChannelValue(field, nextVal);

    try {
      if (Get.isRegistered<FinanceService>()) {
        final res = await FinanceService.to.updateNotificationSettings({field: nextVal});
        if (res.success) {
          Get.snackbar(
            'Preference Updated',
            'Notification channel setting has been saved.',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
            duration: const Duration(seconds: 2),
          );
        } else {
          // Revert on failure
          _setChannelValue(field, currentValue);
          Get.snackbar(
            'Error',
            res.message ?? 'Failed to update setting.',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFFEF4444),
            colorText: Colors.white,
          );
        }
      }
    } catch (e) {
      _setChannelValue(field, currentValue);
      Get.snackbar(
        'Error',
        'Could not update preference: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
      );
    }
  }

  void _setChannelValue(String field, bool val) {
    switch (field) {
      case 'channel_in_app':
        channelInApp.value = val;
        break;
      case 'channel_push':
        channelPush.value = val;
        break;
      case 'channel_sms':
        channelSms.value = val;
        break;
      case 'channel_email':
        channelEmail.value = val;
        break;
      case 'channel_whatsapp':
        channelWhatsapp.value = val;
        break;
    }
  }

  void onBackPressed() => Get.back();
}
