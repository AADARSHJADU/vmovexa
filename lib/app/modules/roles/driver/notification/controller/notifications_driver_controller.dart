import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../model/driver_notification_model.dart';

class NotificationsDriverController extends GetxController {
  // ---------------- Loading ----------------
  final RxBool isLoading = false.obs;

  // ---------------- Tabs ----------------
  final RxInt selectedTabIndex = 0.obs; // 0=All, 1=Alerts, 2=Updates, 3=System
  void selectTab(int index) => selectedTabIndex.value = index;

  // ---------------- Notifications ----------------
  final RxList<DriverNotification> allNotifications = <DriverNotification>[].obs;

  List<DriverNotification> get filteredNotifications {
    switch (selectedTabIndex.value) {
      case 1:
        return allNotifications.where((n) => n.category == NotificationCategory.alert).toList();
      case 2:
        return allNotifications.where((n) => n.category == NotificationCategory.update).toList();
      case 3:
        return allNotifications.where((n) => n.category == NotificationCategory.system).toList();
      default:
        return allNotifications;
    }
  }

  int get unreadCount => allNotifications.where((n) => !n.isRead).length;

  // ---------------- Push notification banner ----------------
  final RxBool isPushEnabled = false.obs;

  @override
  void onInit() {
    super.onInit();
    fetchNotifications();
  }

  Future<void> fetchNotifications() async {
    isLoading.value = true;
    try {
      // TODO: replace with real API/repository call
      allNotifications.assignAll(_mockNotifications());
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> onRefresh() async {
    await fetchNotifications();
  }

  // ---------------- Actions ----------------
  void onNotificationTap(DriverNotification notification) {
    notification.isRead = true;
    allNotifications.refresh();
    // TODO: navigate to the relevant screen based on notification.category/type
  }

  void onOpenFilterSheet() {
    // TODO: hook up an advanced filter bottom sheet
  }

  void onManagePushSettings() {
    Get.toNamed('/notification-settings');
  }

  void onBackPressed() => Get.back();

  // ---------------- Mock data ----------------
  List<DriverNotification> _mockNotifications() {
    return [
      DriverNotification(
        id: 'n1',
        title: 'Traffic congestion on Western Express Highway.',
        message: 'Expect minor delays on your route.',
        timeAgo: '10 min ago',
        icon: Icons.warning_amber_rounded,
        category: NotificationCategory.alert,
        isRead: false,
      ),
      DriverNotification(
        id: 'n2',
        title: 'Diversion on SV Road due to road work.',
        message: 'Follow alternate route via Link Road.',
        timeAgo: '25 min ago',
        icon: Icons.campaign_outlined,
        category: NotificationCategory.update,
        isRead: false,
      ),
      DriverNotification(
        id: 'n3',
        title: 'Schedule update for Route MH12A.',
        message: 'Return trip timing has been updated.',
        timeAgo: '1 hr ago',
        icon: Icons.calendar_today_outlined,
        category: NotificationCategory.update,
        isRead: false,
      ),
      DriverNotification(
        id: 'n4',
        title: 'Vehicle inspection completed successfully.',
        message: 'Your vehicle is cleared for today\'s operations.',
        timeAgo: '1 hr ago',
        icon: Icons.directions_bus_filled_outlined,
        category: NotificationCategory.system,
        isRead: false,
      ),
      DriverNotification(
        id: 'n5',
        title: 'Low fuel alert.',
        message: 'Fuel level is below 15%. Please refuel at earliest.',
        timeAgo: '2 hr ago',
        icon: Icons.local_gas_station_outlined,
        category: NotificationCategory.alert,
        isRead: false,
      ),
      DriverNotification(
        id: 'n6',
        title: 'Road conditions update.',
        message: 'Heavy traffic reported near Andheri Depot.',
        timeAgo: '3 hr ago',
        icon: Icons.alt_route_outlined,
        category: NotificationCategory.update,
        isRead: true,
      ),
      DriverNotification(
        id: 'n7',
        title: 'New routes assigned.',
        message: 'You have been assigned new routes for tomorrow.',
        timeAgo: '5 hr ago',
        icon: Icons.info_outline,
        category: NotificationCategory.system,
        isRead: true,
      ),
    ];
  }
}
