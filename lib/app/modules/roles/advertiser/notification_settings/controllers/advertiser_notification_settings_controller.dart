import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../data/services/advertiser_service.dart';

class AdvertiserNotificationSettingsController extends GetxController {
  final AdvertiserService _service = AdvertiserService.to;

  // Master switch
  final RxBool masterPush = true.obs;

  // 5 Main Channels
  final RxBool channelInApp = true.obs;
  final RxBool channelPush = true.obs;
  final RxBool channelSms = false.obs;
  final RxBool channelEmail = true.obs;
  final RxBool channelWhatsapp = false.obs;

  final RxBool isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    loadSettings();
  }

  /// Load settings from GET /api/v1/notifications/settings
  Future<void> loadSettings() async {
    try {
      isLoading.value = true;
      final res = await _service.getNotificationSettings();
      if (res.success && res.data != null) {
        final data = res.data is Map ? res.data as Map : {};
        final s = data['settings'] is Map ? data['settings'] as Map : data;

        if (s.containsKey('master_push')) {
          masterPush.value = s['master_push'] == true;
        }
        if (s.containsKey('channel_in_app')) {
          channelInApp.value = s['channel_in_app'] == true;
        }
        if (s.containsKey('channel_push')) {
          channelPush.value = s['channel_push'] == true;
        }
        if (s.containsKey('channel_sms')) {
          channelSms.value = s['channel_sms'] == true;
        }
        if (s.containsKey('channel_email')) {
          channelEmail.value = s['channel_email'] == true;
        }
        if (s.containsKey('channel_whatsapp')) {
          channelWhatsapp.value = s['channel_whatsapp'] == true;
        }
      }
    } catch (e) {
      debugPrint('[NotificationSettings] Error loading: $e');
    } finally {
      isLoading.value = false;
    }
  }

  /// Instant toggle channel preference via PATCH /api/v1/notifications/settings
  Future<void> toggleChannel(String fieldKey, RxBool stateVar) async {
    final prevVal = stateVar.value;
    final newVal = !prevVal;
    stateVar.value = newVal;

    try {
      final res = await _service.updateNotificationSettings({fieldKey: newVal});
      if (res.success) {
        Get.snackbar(
          'Preference Saved',
          'Notification channel updated successfully',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          duration: const Duration(seconds: 2),
          margin: const EdgeInsets.all(16),
          borderRadius: 10,
        );
      } else {
        // Rollback
        stateVar.value = prevVal;
        Get.snackbar(
          'Update Failed',
          res.message ?? 'Failed to update channel preference',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
          margin: const EdgeInsets.all(16),
          borderRadius: 10,
        );
      }
    } catch (e) {
      stateVar.value = prevVal;
      Get.snackbar(
        'Error',
        'Could not sync notification preference: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
        margin: const EdgeInsets.all(16),
        borderRadius: 10,
      );
    }
  }
}

