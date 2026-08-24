import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../auth/login/controllers/login_controller.dart';

class AppNotification {
  final String id;
  final String title;
  final String body;
  final String time;
  final String type; // 'Alerts', 'Maintenance', 'Trips', 'System', 'Updates' or 'Campaigns', 'Payments'
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
    if (LoginController.currentRole == 'Advertisement') {
      notifications.assignAll([
        AppNotification(
          id: 'adv_1',
          title: 'Campaign Approved',
          body: 'Your campaign "Summer Sale 2026" has been approved and is scheduled to go live.',
          time: 'Today, 10:30 AM',
          type: 'Campaigns',
        ),
        AppNotification(
          id: 'adv_2',
          title: 'Campaign is Live',
          body: 'Your campaign "Summer Sale 2026" is now live and running on 1,182 screens.',
          time: 'Today, 09:15 AM',
          type: 'Campaigns',
        ),
        AppNotification(
          id: 'adv_3',
          title: 'Payment Successful',
          body: 'Payment of ₹1,48,750 for campaign CMP-2026-000124 was successful.',
          time: 'Yesterday, 11:22 AM',
          type: 'Payments',
          isUnread: false,
        ),
        AppNotification(
          id: 'adv_4',
          title: 'Invoice Generated',
          body: 'Invoice INV-2026-000124 has been generated for your payment.',
          time: 'Yesterday, 11:23 AM',
          type: 'Payments',
          isUnread: false,
        ),
        AppNotification(
          id: 'adv_5',
          title: 'Budget Alert',
          body: '80% of your campaign budget has been utilized.',
          time: 'This Week, 02:45 PM',
          type: 'System',
        ),
        AppNotification(
          id: 'adv_6',
          title: 'Weekly Report Ready',
          body: 'Your weekly performance report is ready to download.',
          time: 'This Week, 09:00 AM',
          type: 'System',
        ),
        AppNotification(
          id: 'adv_7',
          title: 'Campaign Completed',
          body: 'Your campaign "Spring Collection" has been completed successfully.',
          time: 'Earlier, 06:30 PM',
          type: 'Campaigns',
          isUnread: false,
        ),
      ]);
    } else if (LoginController.currentRole == 'Government') {
      notifications.assignAll([
        AppNotification(
          id: 'gov_1',
          title: 'High Alert: Low Reach Detected',
          body: 'Campaign "Road Safety Awareness" reach dropped by 32% in Bhopal.',
          time: 'Today, 2 mins ago',
          type: 'Alerts',
        ),
        AppNotification(
          id: 'gov_2',
          title: 'Campaign Performance Improved',
          body: '"Monsoon Preparedness" campaign reach increased by 18% compared to yesterday.',
          time: 'Today, 15 mins ago',
          type: 'Updates',
        ),
        AppNotification(
          id: 'gov_3',
          title: 'Weekly Report Ready',
          body: 'Your weekly performance report (12 May - 18 May 2025) is ready to download.',
          time: 'Today, 1 hour ago',
          type: 'Reports',
        ),
        AppNotification(
          id: 'gov_4',
          title: 'New Campaign Approved',
          body: '"Clean City Initiative" campaign has been approved and is now live.',
          time: 'Today, 3 hours ago',
          type: 'Alerts',
          isUnread: false,
        ),
        AppNotification(
          id: 'gov_5',
          title: 'Campaign Scheduled',
          body: '"Dengue Prevention Drive" is scheduled to go live on 22 May 2025.',
          time: 'Today, 5 hours ago',
          type: 'Updates',
          isUnread: false,
        ),
        AppNotification(
          id: 'gov_6',
          title: 'System Maintenance',
          body: 'System maintenance is scheduled on 25 May 2025, 12:00 AM - 2:00 AM.',
          time: 'Yesterday, 12:00 AM',
          type: 'System',
          isUnread: false,
        ),
        AppNotification(
          id: 'gov_7',
          title: 'New User Added',
          body: 'A new user (City Analyst) has been added to your organization.',
          time: 'Earlier, 2 days ago',
          type: 'System',
          isUnread: false,
        ),
      ]);
    }
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
