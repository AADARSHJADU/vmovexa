import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/services/finance_service.dart';
import '../model/notification_model.dart';

class FinanceNotificationsController extends GetxController with GetSingleTickerProviderStateMixin {
  // Tabs: 0: All, 1: Unread, 2: Invoices, 3: Payments, 4: Subscriptions
  final RxInt selectedTabIndex = 0.obs;
  final RxString searchQuery = ''.obs;

  final RxList<FinanceNotificationModel> allNotifications = <FinanceNotificationModel>[].obs;
  final RxList<FinanceNotificationModel> filteredNotifications = <FinanceNotificationModel>[].obs;

  final RxBool isLoading = false.obs;
  final RxBool isRefreshing = false.obs;

  final List<String> tabLabels = ['All', 'Unread', 'Invoices', 'Payments', 'Subscriptions'];

  @override
  void onInit() {
    super.onInit();
    loadNotifications();
  }

  Future<void> loadNotifications() async {
    isLoading.value = true;
    try {
      if (Get.isRegistered<FinanceService>()) {
        final res = await FinanceService.to.getNotifications(page: 1, limit: 50);
        if (res.success && res.data != null) {
          final data = res.data;
          List items = [];
          if (data is List) {
            items = data;
          } else if (data is Map) {
            items = (data['rows'] ?? data['items'] ?? data['notifications'] ?? []) as List;
          }

          if (items.isNotEmpty) {
            allNotifications.assignAll(
              items.map((e) => FinanceNotificationModel.fromJson(Map<String, dynamic>.from(e as Map))).toList(),
            );
          } else {
            allNotifications.clear();
          }
        } else {
          allNotifications.clear();
        }
      } else {
        allNotifications.clear();
      }
    } catch (_) {
      allNotifications.clear();
    } finally {
      applyFilters();
      isLoading.value = false;
    }
  }

  void applyFilters() {
    final q = searchQuery.value.toLowerCase().trim();
    final tab = tabLabels[selectedTabIndex.value];

    filteredNotifications.assignAll(
      allNotifications.where((item) {
        final matchesSearch = q.isEmpty ||
            item.title.toLowerCase().contains(q) ||
            item.description.toLowerCase().contains(q);

        if (!matchesSearch) return false;

        switch (tab) {
          case 'All':
            return true;
          case 'Unread':
            return item.isUnread.value;
          case 'Invoices':
            return item.category == 'Invoices';
          case 'Payments':
            return item.category == 'Payments';
          case 'Subscriptions':
            return item.category == 'Subscriptions';
          default:
            return true;
        }
      }).toList(),
    );
  }

  void onTabSelected(int index) {
    selectedTabIndex.value = index;
    applyFilters();
  }

  void onSearchChanged(String query) {
    searchQuery.value = query;
    applyFilters();
  }

  Future<void> onRefresh() async {
    isRefreshing.value = true;
    try {
      await loadNotifications();
    } finally {
      isRefreshing.value = false;
    }
  }

  Future<void> markAsRead(FinanceNotificationModel item) async {
    item.isUnread.value = false;
    applyFilters();
    try {
      if (Get.isRegistered<FinanceService>()) {
        await FinanceService.to.markNotificationRead(item.id);
      }
    } catch (_) {}
  }

  Future<void> markAllAsRead() async {
    for (var n in allNotifications) {
      n.isUnread.value = false;
    }
    applyFilters();
    try {
      if (Get.isRegistered<FinanceService>()) {
        await FinanceService.to.markAllNotificationsRead();
      }
      Get.snackbar(
        'All Marked as Read',
        'All financial notifications have been marked as read.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
        duration: const Duration(seconds: 2),
      );
    } catch (_) {}
  }

  Future<void> deleteNotification(FinanceNotificationModel item) async {
    allNotifications.removeWhere((e) => e.id == item.id);
    applyFilters();
    try {
      if (Get.isRegistered<FinanceService>()) {
        await FinanceService.to.deleteNotification(item.id);
      }
    } catch (_) {}
  }

  int get unreadCount => allNotifications.where((n) => n.isUnread.value).length;

  int getCountForTab(String label) {
    switch (label) {
      case 'All':
        return allNotifications.length;
      case 'Unread':
        return unreadCount;
      case 'Invoices':
        return allNotifications.where((n) => n.category == 'Invoices').length;
      case 'Payments':
        return allNotifications.where((n) => n.category == 'Payments').length;
      case 'Subscriptions':
        return allNotifications.where((n) => n.category == 'Subscriptions').length;
      default:
        return 0;
    }
  }

  void onBackPressed() => Get.back();
}
