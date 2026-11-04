import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'package:vmovexa/app/data/services/driver_service.dart';
import '../model/driver_notification_model.dart';

class NotificationsDriverController extends GetxController {
  DriverService get _driverService => DriverService.to;

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
      final res = await _driverService.getNotifications(page: 1, limit: 30);
      if (res.success && res.data != null && res.data!.isNotEmpty) {
        final list = res.data!.map((item) {
          final catStr = (item['type'] ?? item['category'] ?? '').toString().toLowerCase();
          NotificationCategory category = NotificationCategory.update;
          IconData icon = Icons.info_outline;

          if (catStr.contains('alert') || catStr.contains('warning') || catStr.contains('danger')) {
            category = NotificationCategory.alert;
            icon = Icons.warning_amber_rounded;
          } else if (catStr.contains('system')) {
            category = NotificationCategory.system;
            icon = Icons.directions_bus_filled_outlined;
          }

          return DriverNotification(
            id: item['id']?.toString() ?? 'notif_${DateTime.now().millisecondsSinceEpoch}',
            title: item['title']?.toString() ?? 'Notification',
            message: item['message']?.toString() ?? (item['body']?.toString() ?? ''),
            timeAgo: item['time_ago']?.toString() ?? (item['created_at'] != null ? _formatDate(item['created_at'].toString()) : 'Recently'),
            icon: icon,
            category: category,
            isRead: item['is_read'] == true || item['read'] == true,
          );
        }).toList();

        allNotifications.assignAll(list);
      } else {
        allNotifications.clear();
      }
    } catch (e) {
      debugPrint('NotificationsDriverController fetch error: $e');
      allNotifications.clear();
    } finally {
      isLoading.value = false;
    }
  }

  String _formatDate(String raw) {
    try {
      final dt = DateTime.parse(raw).toLocal();
      final diff = DateTime.now().difference(dt);
      if (diff.inMinutes < 60) {
        return '${diff.inMinutes} min ago';
      } else if (diff.inHours < 24) {
        return '${diff.inHours} hr ago';
      }
      return '${diff.inDays} days ago';
    } catch (_) {
      return 'Recently';
    }
  }

  Future<void> onRefresh() async {
    await fetchNotifications();
  }

  // ---------------- Actions ----------------
  void onNotificationTap(DriverNotification notification) {
    notification.isRead = true;
    allNotifications.refresh();
  }

  void onOpenFilterSheet() {}

  void onManagePushSettings() {
    Get.toNamed('/notification-settings');
  }

  void onBackPressed() => Get.back();
}
