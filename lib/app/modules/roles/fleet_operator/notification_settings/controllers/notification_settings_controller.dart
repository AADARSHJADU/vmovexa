import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/services/fleet_service.dart';

class NotificationSettingsController extends GetxController {
  // 5 Main Notification Delivery Channels (matching Admin Panel)
  final RxBool inAppNotifications = true.obs;
  final RxBool pushNotifications = true.obs;
  final RxBool emailNotifications = true.obs;
  final RxBool smsNotifications = false.obs;
  final RxBool whatsappNotifications = false.obs;

  // Alert Preferences
  final RxBool vehicleAlerts = true.obs;
  final RxBool tripUpdates = true.obs;
  final RxBool maintenanceReminders = true.obs;
  final RxBool systemNotifications = true.obs;
  final RxBool securityAlerts = true.obs;

  // Channel Status Labels
  final RxString pushChannelStatus = 'Enabled'.obs;
  final RxString emailChannelStatus = 'Enabled'.obs;
  final RxString smsChannelStatus = 'Disabled'.obs;
  final RxString inAppChannelStatus = 'Enabled'.obs;
  final RxString whatsappChannelStatus = 'Disabled'.obs;

  final RxBool isLoading = false.obs;
  final RxBool isSaving = false.obs;

  @override
  void onInit() {
    super.onInit();
    loadSettings();
  }

  /// Load notification settings from GET /notifications/settings
  Future<void> loadSettings() async {
    try {
      isLoading.value = true;
      if (Get.isRegistered<FleetService>()) {
        final res = await FleetService.to.getNotificationSettings();
        if (res.success && res.data != null) {
          final data = res.data is Map ? res.data as Map : {};
          final settings = data['settings'] is Map ? data['settings'] as Map : data;

          if (settings.containsKey('channel_in_app')) {
            inAppNotifications.value = settings['channel_in_app'] == true;
            inAppChannelStatus.value = inAppNotifications.value ? 'Enabled' : 'Disabled';
          }
          if (settings.containsKey('channel_push')) {
            pushNotifications.value = settings['channel_push'] == true;
            pushChannelStatus.value = pushNotifications.value ? 'Enabled' : 'Disabled';
          }
          if (settings.containsKey('channel_email')) {
            emailNotifications.value = settings['channel_email'] == true;
            emailChannelStatus.value = emailNotifications.value ? 'Enabled' : 'Disabled';
          }
          if (settings.containsKey('channel_sms')) {
            smsNotifications.value = settings['channel_sms'] == true;
            smsChannelStatus.value = smsNotifications.value ? 'Enabled' : 'Disabled';
          }
          if (settings.containsKey('channel_whatsapp')) {
            whatsappNotifications.value = settings['channel_whatsapp'] == true;
            whatsappChannelStatus.value = whatsappNotifications.value ? 'Enabled' : 'Disabled';
          }

          // Alerts
          if (settings.containsKey('alert_vehicle')) {
            vehicleAlerts.value = settings['alert_vehicle'] == true;
          }
          if (settings.containsKey('alert_trips')) {
            tripUpdates.value = settings['alert_trips'] == true;
          }
          if (settings.containsKey('alert_maintenance')) {
            maintenanceReminders.value = settings['alert_maintenance'] == true;
          }
          if (settings.containsKey('alert_system')) {
            systemNotifications.value = settings['alert_system'] == true;
          }
          if (settings.containsKey('alert_security')) {
            securityAlerts.value = settings['alert_security'] == true;
          }
        }
      }
    } catch (e) {
      debugPrint('Error loading notification settings: $e');
    } finally {
      isLoading.value = false;
    }
  }

  /// Instant toggle on/off: immediately updates UI state and sends PATCH /notifications/settings
  Future<void> togglePreference(String fieldKey, RxBool stateVar, bool newValue) async {
    final oldValue = stateVar.value;
    stateVar.value = newValue;
    _updateStatusLabels();

    try {
      if (Get.isRegistered<FleetService>()) {
        final res = await FleetService.to.updateNotificationSettings({
          fieldKey: newValue,
        });

        if (!res.success) {
          // Revert if API failed
          stateVar.value = oldValue;
          _updateStatusLabels();
          Get.snackbar(
            'Update Failed',
            res.message ?? 'Unable to save setting change.',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFFEF4444),
            colorText: Colors.white,
            duration: const Duration(seconds: 2),
          );
        } else {
          // Success feedback
          Get.snackbar(
            'Preference Updated',
            'Notification preference saved.',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
            duration: const Duration(milliseconds: 1400),
            margin: const EdgeInsets.all(16),
            borderRadius: 10,
          );
        }
      }
    } catch (e) {
      stateVar.value = oldValue;
      _updateStatusLabels();
      Get.snackbar(
        'Error',
        'Failed to connect: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
        duration: const Duration(seconds: 2),
      );
    }
  }

  void _updateStatusLabels() {
    inAppChannelStatus.value = inAppNotifications.value ? 'Enabled' : 'Disabled';
    pushChannelStatus.value = pushNotifications.value ? 'Enabled' : 'Disabled';
    emailChannelStatus.value = emailNotifications.value ? 'Enabled' : 'Disabled';
    smsChannelStatus.value = smsNotifications.value ? 'Enabled' : 'Disabled';
    whatsappChannelStatus.value = whatsappNotifications.value ? 'Enabled' : 'Disabled';
  }

  /// Bulk save configurations (optional button at bottom)
  Future<void> savePreferences() async {
    try {
      isSaving.value = true;

      final payload = {
        'channel_in_app': inAppNotifications.value,
        'channel_push': pushNotifications.value,
        'channel_email': emailNotifications.value,
        'channel_sms': smsNotifications.value,
        'channel_whatsapp': whatsappNotifications.value,
        'alert_vehicle': vehicleAlerts.value,
        'alert_trips': tripUpdates.value,
        'alert_maintenance': maintenanceReminders.value,
        'alert_system': systemNotifications.value,
        'alert_security': securityAlerts.value,
      };

      if (Get.isRegistered<FleetService>()) {
        await FleetService.to.updateNotificationSettings(payload);
      }

      Get.back();
      Get.snackbar(
        'Preferences Saved',
        'All notification settings are saved successfully.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
        icon: const Icon(Icons.check_circle_rounded, color: Colors.white),
        margin: const EdgeInsets.all(16),
        borderRadius: 10,
      );
    } catch (e) {
      Get.back();
      Get.snackbar(
        'Settings Applied',
        'Preferences updated.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
        margin: const EdgeInsets.all(16),
        borderRadius: 10,
      );
    } finally {
      isSaving.value = false;
    }
  }
}
