import 'package:flutter/material.dart';
import 'package:get/get.dart';

class AppNotification {
  final String id;
  final String title;
  final String body;
  final String time;
  final String type; // 'Alerts', 'Maintenance', 'Trips', 'System', 'Updates'
  final RxBool isUnread;

  AppNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.time,
    required this.type,
    bool isUnread = true,
  }) : isUnread = isUnread.obs;
}

class NotificationsController extends GetxController {
  final RxString activeFilter = 'All'.obs;
  final RxBool yesterdayExpanded = true.obs;

  final RxList<AppNotification> notifications = <AppNotification>[
    AppNotification(
      id: '1',
      title: 'Maintenance Due Soon',
      body: 'Engine Inspection for MH12AB1234 is due in 500 km.',
      time: '9:30 AM',
      type: 'Maintenance',
    ),
    AppNotification(
      id: '2',
      title: 'Overspeed Alert',
      body: 'MH12AB5678 exceeded speed limit of 60 km/h at 08:45 AM.',
      time: '8:45 AM',
      type: 'Alerts',
    ),
    AppNotification(
      id: '3',
      title: 'Trip Completed',
      body: 'Trip from MG Road to Kempegowda Bus Station completed by MH12AB1234.',
      time: '8:10 AM',
      type: 'Trips',
    ),
    AppNotification(
      id: '4',
      title: 'Low Fuel Alert',
      body: 'Fuel level is low in MH12AB9101. Current level: 12%',
      time: '7:15 AM',
      type: 'Alerts',
      isUnread: false,
    ),
    AppNotification(
      id: '5',
      title: 'Battery Health Check',
      body: 'Battery health check recommended for MH12AB4321.',
      time: 'Yesterday, 6:30 PM',
      type: 'Maintenance',
    ),
    AppNotification(
      id: '6',
      title: 'Route Deviation',
      body: 'MH12AB6789 deviated from the assigned route at 05:20 PM.',
      time: 'Yesterday, 5:20 PM',
      type: 'Alerts',
    ),
    AppNotification(
      id: '7',
      title: 'Trip Report Generated',
      body: 'Trip report for MH12AB1234 on 04 Aug 2026 is ready to download.',
      time: 'Yesterday, 4:45 PM',
      type: 'Trips',
    ),
  ].obs;

  final RxList<AppNotification> filteredNotifications = <AppNotification>[].obs;

  @override
  void onInit() {
    super.onInit();
    filteredNotifications.assignAll(notifications);
    ever(activeFilter, (_) => _filterNotifications());
  }

  void _filterNotifications() {
    String filter = activeFilter.value;
    if (filter == 'All') {
      filteredNotifications.assignAll(notifications);
    } else {
      filteredNotifications.assignAll(notifications.where((n) => n.type == filter).toList());
    }
  }

  int get unreadCount => notifications.where((n) => n.isUnread.value).length;

  void markAllAsRead() {
    for (var n in notifications) {
      n.isUnread.value = false;
    }
    Get.snackbar(
      'Notifications Read',
      'All notifications have been marked as read.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
    );
  }

  void toggleYesterdayExpanded() {
    yesterdayExpanded.value = !yesterdayExpanded.value;
  }
}
