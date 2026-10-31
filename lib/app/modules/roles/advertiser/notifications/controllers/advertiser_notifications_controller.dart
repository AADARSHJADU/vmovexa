import 'dart:math';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../data/models/notification_model.dart';
import '../../../../../data/services/advertiser_service.dart';

class AdvertiserNotificationItem {
  final String id;
  final String title;
  final String desc;
  final String category; // 'Campaigns' | 'Payments' | 'System'
  final String icon; // 'check' | 'live' | 'payment' | 'invoice' | 'alert' | 'report' | 'complete'
  final String time;
  final RxBool isRead;
  final DateTime? createdAt;

  AdvertiserNotificationItem({
    required this.id,
    required this.title,
    required this.desc,
    required this.category,
    required this.icon,
    required this.time,
    bool isRead = false,
    this.createdAt,
  }) : isRead = isRead.obs;
}

class AdvertiserNotificationsController extends GetxController {
  final AdvertiserService _service = AdvertiserService.to;

  // Master observable lists
  final RxList<AdvertiserNotificationItem> allNotifications = <AdvertiserNotificationItem>[].obs;
  final RxBool isLoading = false.obs;

  // Filter Tabs: 'All' | 'Campaigns' | 'Payments' | 'System'
  final RxString activeTab = 'All'.obs;

  // Search state
  final RxString searchQuery = ''.obs;

  // Pagination state (Admin panel defaults: 6 items per page)
  final RxInt currentPage = 1.obs;
  final int pageSize = 6;

  @override
  void onInit() {
    super.onInit();
    loadNotifications();
  }

  // --- Dynamic Tab Counts ---
  int get allCount => allNotifications.length;
  int get unreadCount => allNotifications.where((n) => !n.isRead.value).length;
  int get campaignsCount => allNotifications.where((n) => n.category == 'Campaigns').length;
  int get paymentsCount => allNotifications.where((n) => n.category == 'Payments').length;
  int get systemCount => allNotifications.where((n) => n.category == 'System').length;

  // --- Filtered and Paginated Items ---
  List<AdvertiserNotificationItem> get filteredNotifications {
    final q = searchQuery.value.toLowerCase().trim();
    final tab = activeTab.value;

    return allNotifications.where((n) {
      final matchesTab = tab == 'All' || n.category == tab;
      final matchesSearch = q.isEmpty ||
          n.title.toLowerCase().contains(q) ||
          n.desc.toLowerCase().contains(q);
      return matchesTab && matchesSearch;
    }).toList();
  }

  int get totalPages => max(1, (filteredNotifications.length / pageSize).ceil());

  List<AdvertiserNotificationItem> get paginatedNotifications {
    final filtered = filteredNotifications;
    final startIndex = (currentPage.value - 1) * pageSize;
    if (startIndex >= filtered.length) return [];
    final endIndex = min(startIndex + pageSize, filtered.length);
    return filtered.sublist(startIndex, endIndex);
  }

  void setTab(String tab) {
    activeTab.value = tab;
    currentPage.value = 1;
  }

  void onSearchChanged(String query) {
    searchQuery.value = query;
    currentPage.value = 1;
  }

  void clearSearch() {
    searchQuery.value = '';
    currentPage.value = 1;
  }

  void goToPage(int page) {
    if (page >= 1 && page <= totalPages) {
      currentPage.value = page;
    }
  }

  void nextPage() {
    if (currentPage.value < totalPages) {
      currentPage.value++;
    }
  }

  void prevPage() {
    if (currentPage.value > 1) {
      currentPage.value--;
    }
  }

  /// Load from GET /api/v1/notifications
  Future<void> loadNotifications() async {
    try {
      isLoading.value = true;
      final res = await _service.getNotifications(page: 1, limit: 50);

      if (res.success && res.data != null && res.data!.isNotEmpty) {
        final items = res.data!.map((n) => _mapFromApiModel(n)).toList();
        allNotifications.assignAll(items);
      } else {
        // Fallback demo items if backend user has 0 notifications yet
        allNotifications.assignAll(_getDefaultDemoNotifications());
      }
    } catch (e) {
      debugPrint('[AdvertiserNotifications] Error loading: $e');
      if (allNotifications.isEmpty) {
        allNotifications.assignAll(_getDefaultDemoNotifications());
      }
    } finally {
      isLoading.value = false;
      // Adjust current page if needed
      if (currentPage.value > totalPages) {
        currentPage.value = totalPages;
      }
    }
  }

  /// Mark single notification as read: POST /api/v1/notifications/:id/read
  Future<void> markAsRead(AdvertiserNotificationItem item) async {
    if (item.isRead.value) return;
    item.isRead.value = true;

    try {
      await _service.markNotificationRead(item.id);
    } catch (e) {
      debugPrint('[AdvertiserNotifications] Error marking read: $e');
    }
  }

  /// Mark all notifications as read: POST /api/v1/notifications/read-all
  Future<void> markAllAsRead() async {
    for (var n in allNotifications) {
      n.isRead.value = true;
    }

    try {
      final res = await _service.markAllNotificationsRead();
      if (res.success) {
        Get.snackbar(
          'Updated',
          'All notifications marked as read',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          duration: const Duration(seconds: 2),
          margin: const EdgeInsets.all(16),
          borderRadius: 10,
        );
      }
    } catch (e) {
      debugPrint('[AdvertiserNotifications] Error markAllRead: $e');
    }
  }

  /// Delete single notification: DELETE /api/v1/notifications/:id
  Future<void> deleteItem(AdvertiserNotificationItem item) async {
    allNotifications.remove(item);
    if (currentPage.value > totalPages) {
      currentPage.value = max(1, totalPages);
    }

    try {
      await _service.deleteNotification(item.id);
      Get.snackbar(
        'Dismissed',
        'Notification removed',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF334155),
        colorText: Colors.white,
        duration: const Duration(seconds: 2),
        margin: const EdgeInsets.all(16),
        borderRadius: 10,
      );
    } catch (e) {
      debugPrint('[AdvertiserNotifications] Error delete: $e');
    }
  }

  AdvertiserNotificationItem _mapFromApiModel(AppNotificationModel n) {
    final cat = _inferCategory(n.title, n.body, n.type);
    final iconType = _inferIconType(n.title, n.body, n.severity);

    return AdvertiserNotificationItem(
      id: n.id,
      title: n.title,
      desc: n.body,
      category: cat,
      icon: iconType,
      time: n.formattedTime,
      isRead: n.isRead.value,
    );
  }

  String _inferCategory(String title, String body, String type) {
    final t = '$title $body $type'.toLowerCase();
    if (t.contains('campaign') ||
        t.contains('creative') ||
        t.contains('slot') ||
        t.contains('broadcast') ||
        t.contains('flight') ||
        t.contains('playback')) {
      return 'Campaigns';
    }
    if (t.contains('payment') ||
        t.contains('invoice') ||
        t.contains('wallet') ||
        t.contains('gst') ||
        t.contains('billing') ||
        t.contains('deposit') ||
        t.contains('deduction')) {
      return 'Payments';
    }
    return 'System';
  }

  String _inferIconType(String title, String body, String severity) {
    final t = '$title $body $severity'.toLowerCase();
    if (t.contains('live') || t.contains('broadcasting')) return 'live';
    if (t.contains('approved') || t.contains('verified')) return 'check';
    if (t.contains('payment') || t.contains('wallet')) return 'payment';
    if (t.contains('invoice') || t.contains('tax') || t.contains('gst')) return 'invoice';
    if (t.contains('report') || t.contains('audit') || t.contains('analytics')) return 'report';
    if (t.contains('completed') || t.contains('concluded')) return 'complete';
    return 'alert';
  }

  List<AdvertiserNotificationItem> _getDefaultDemoNotifications() {
    return [
      AdvertiserNotificationItem(
        id: 'NOTIF-001',
        title: 'Campaign Creative Approved',
        desc: 'Your 16:9 creative asset for "Metro Festive Flash 2026" has been verified and scheduled.',
        category: 'Campaigns',
        icon: 'check',
        time: 'Just now',
        isRead: false,
      ),
      AdvertiserNotificationItem(
        id: 'NOTIF-002',
        title: 'Campaign Live On Transit Displays',
        desc: '32 buses on Corridor 4 have synchronized creative playback with active GPS telemetry.',
        category: 'Campaigns',
        icon: 'live',
        time: '2 hours ago',
        isRead: false,
      ),
      AdvertiserNotificationItem(
        id: 'NOTIF-003',
        title: 'Tax Invoice Generated',
        desc: 'GST tax invoice #INV-ADV-2026-0014 for ₹12,500 is ready for PDF download.',
        category: 'Payments',
        icon: 'invoice',
        time: 'Yesterday',
        isRead: true,
      ),
      AdvertiserNotificationItem(
        id: 'NOTIF-004',
        title: 'Proof-of-Play Audit Ready',
        desc: 'Daily impression delivery report with 14,280 passenger impressions compiled.',
        category: 'Campaigns',
        icon: 'report',
        time: 'Yesterday',
        isRead: true,
      ),
      AdvertiserNotificationItem(
        id: 'NOTIF-005',
        title: 'Wallet Auto-Debit Cleared',
        desc: 'Daily campaign flight charge of ₹2,500 successfully deducted from advertiser balance.',
        category: 'Payments',
        icon: 'payment',
        time: '2 days ago',
        isRead: true,
      ),
      AdvertiserNotificationItem(
        id: 'NOTIF-006',
        title: 'System Security Verification',
        desc: 'Your advertiser account security preferences were updated successfully.',
        category: 'System',
        icon: 'alert',
        time: '3 days ago',
        isRead: true,
      ),
    ];
  }
}

