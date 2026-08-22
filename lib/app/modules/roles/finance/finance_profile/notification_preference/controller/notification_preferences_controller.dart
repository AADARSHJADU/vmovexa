import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../model/notification_pref_model.dart';

class NotificationPreferencesController extends GetxController {
  // ---------------- Identity header ----------------
  final RxString fullName = 'Riya Agarwal'.obs;
  final RxString roleLabel = 'Finance Manager'.obs;
  final RxString email = 'riya.agarwal@vmovexa.com'.obs;
  final RxString initials = 'RA'.obs;

  // ---------------- Notification Channels ----------------
  final RxBool emailNotifications = true.obs;
  final RxBool inAppNotifications = true.obs;

  void toggleEmailNotifications(bool v) => emailNotifications.value = v;
  void toggleInAppNotifications(bool v) => inAppNotifications.value = v;

  // ---------------- Notification Types ----------------
  final RxList<NotificationTypePref> notificationTypes = <NotificationTypePref>[].obs;

  // ---------------- Quiet Hours ----------------
  final RxString quietHoursText = '10:00 PM - 07:00 AM'.obs;
  void onQuietHoursTap() {
    // TODO: open a time-range picker and update quietHoursText
  }

  final RxBool isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    fetchPreferences();
  }

  Future<void> fetchPreferences() async {
    isLoading.value = true;
    try {
      // TODO: replace with real API/repository call
      notificationTypes.assignAll(_mockNotificationTypes());
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> onRefresh() async => fetchPreferences();

  void onBackPressed() => Get.back();

  /// Turns every notification type's Email and In-app toggle on.
  void onMarkAllAsRead() {
    for (final type in notificationTypes) {
      type.emailEnabled.value = true;
      type.inAppEnabled.value = true;
    }
  }

  List<NotificationTypePref> _mockNotificationTypes() {
    return [
      NotificationTypePref(
        id: 'invoice',
        icon: Icons.description_outlined,
        color: const Color(0xFFB042FF),
        title: 'Invoice Notifications',
        subtitle: 'Get notified about invoice generation, updates and due dates',
        emailEnabled: true,
        inAppEnabled: true,
      ),
      NotificationTypePref(
        id: 'payment',
        icon: Icons.currency_rupee,
        color: const Color(0xFF2ECC71),
        title: 'Payment Notifications',
        subtitle: 'Get notified about payments received, failed or overdue',
        emailEnabled: true,
        inAppEnabled: true,
      ),
      NotificationTypePref(
        id: 'subscription',
        icon: Icons.access_time,
        color: const Color(0xFFCC6E1F),
        title: 'Subscription Notifications',
        subtitle: 'Get notified about subscription updates, renewals and expirations',
        emailEnabled: true,
        inAppEnabled: true,
      ),
      NotificationTypePref(
        id: 'report',
        icon: Icons.bar_chart_outlined,
        color: const Color(0xFF3F7BF5),
        title: 'Report Notifications',
        subtitle: 'Get notified when financial or revenue reports are ready',
        emailEnabled: false,
        inAppEnabled: true,
      ),
      NotificationTypePref(
        id: 'gst',
        icon: Icons.receipt_long_outlined,
        color: const Color(0xFFE0507A),
        title: 'GST Notifications',
        subtitle: 'Get notified about GST filings, returns and reminders',
        emailEnabled: true,
        inAppEnabled: true,
      ),
      NotificationTypePref(
        id: 'system',
        icon: Icons.balance_outlined,
        color: const Color(0xFF3F7BF5),
        title: 'System Notifications',
        subtitle: 'Important updates, maintenance alerts and system announcements',
        emailEnabled: false,
        inAppEnabled: true,
      ),
      NotificationTypePref(
        id: 'other',
        icon: Icons.chat_bubble_outline,
        color: const Color(0xFF6C7A89),
        title: 'Other Notifications',
        subtitle: 'Receive other updates and announcements',
        emailEnabled: false,
        inAppEnabled: false,
      ),
    ];
  }
}
