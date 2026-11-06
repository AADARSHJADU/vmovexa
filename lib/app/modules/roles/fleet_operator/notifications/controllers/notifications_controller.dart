import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/services/fleet_service.dart';

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
  final RxBool isLoading = false.obs;

  final RxList<AppNotification> notifications = <AppNotification>[].obs;
  final RxList<AppNotification> filteredNotifications = <AppNotification>[].obs;

  @override
  void onInit() {
    super.onInit();
    loadNotifications();
    ever(activeFilter, (_) => _filterNotifications());
  }

  Future<void> loadNotifications() async {
    isLoading.value = true;
    try {
      final res = await FleetService.to.getNotifications(page: 1, limit: 100);
      if (res.success && res.data != null && res.data!.isNotEmpty) {
        final list = res.data!.map((n) {
          return AppNotification(
            id: n.id,
            title: n.title,
            body: n.body,
            time: _formatNotificationTime(n.createdAt),
            type: n.type.isNotEmpty ? n.type : 'Alerts',
            isUnread: !n.isRead.value,
          );
        }).toList();
        notifications.assignAll(list);
      } else {
        notifications.clear();
      }
    } catch (e) {
      debugPrint('Error loading notifications: $e');
      notifications.clear();
    } finally {
      _filterNotifications();
      isLoading.value = false;
    }
  }

  String _formatNotificationTime(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return 'Today';
    try {
      final dt = DateTime.parse(dateStr).toLocal();
      final now = DateTime.now();
      final diff = now.difference(dt);

      final hour = dt.hour > 12 ? dt.hour - 12 : (dt.hour == 0 ? 12 : dt.hour);
      final period = dt.hour >= 12 ? 'PM' : 'AM';
      final min = dt.minute.toString().padLeft(2, '0');
      final timePart = '$hour:$min $period';

      if (diff.inDays == 0 && now.day == dt.day) {
        return 'Today, $timePart';
      } else if (diff.inDays <= 1 || (diff.inDays == 0 && now.day != dt.day)) {
        return 'Yesterday, $timePart';
      } else if (diff.inDays < 7) {
        return 'This Week, $timePart';
      } else {
        return 'Earlier, ${dt.day}/${dt.month}/${dt.year}';
      }
    } catch (_) {
      return dateStr;
    }
  }

  void _filterNotifications() {
    String filter = activeFilter.value;
    if (filter == 'All') {
      filteredNotifications.assignAll(notifications);
    } else {
      filteredNotifications.assignAll(notifications.where((n) => n.type.toLowerCase() == filter.toLowerCase()).toList());
    }
  }

  int get unreadCount => notifications.where((n) => n.isUnread.value).length;

  Future<void> markAllAsRead() async {
    for (var n in notifications) {
      n.isUnread.value = false;
    }
    _filterNotifications();
    try {
      await FleetService.to.markAllNotificationsRead();
    } catch (_) {}
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
