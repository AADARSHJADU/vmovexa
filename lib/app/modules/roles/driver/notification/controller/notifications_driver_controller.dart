import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/models/driver_models.dart';
import 'package:vmovexa/app/data/services/driver_service.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import '../model/driver_notification_model.dart';

class NotificationsDriverController extends GetxController {
  DriverService get _driverService => DriverService.to;

  // ---------------- Loading ----------------
  final RxBool isLoading = false.obs;

  // ---------------- Tabs (Admin Panel: All, Unread, Critical, Warning, Info) ----------------
  final RxString activeTab = 'All'.obs;
  final RxString searchQuery = ''.obs;
  final TextEditingController searchController = TextEditingController();

  // Backwards compatibility for legacy selectedTabIndex (0=All, 1=Unread, 2=Critical, 3=Warning, 4=Info)
  final RxInt selectedTabIndex = 0.obs;

  // ---------------- Notifications List ----------------
  final RxList<DriverNotification> allNotifications = <DriverNotification>[].obs;

  // ---------------- Counts ----------------
  int get countAll => allNotifications.length;
  int get countUnread => allNotifications.where((n) => !n.isRead.value).length;
  int get countCritical => allNotifications.where((n) => n.isCritical).length;
  int get countWarning => allNotifications.where((n) => n.isWarning).length;
  int get countInfo => allNotifications.where((n) => n.isInfo).length;

  int get unreadCount => countUnread;

  // ---------------- Filtered Notifications ----------------
  List<DriverNotification> get filteredNotifications {
    final query = searchQuery.value.trim().toLowerCase();
    final tab = activeTab.value;

    return allNotifications.where((n) {
      // 1. Tab filtering
      bool tabMatch = true;
      if (tab == 'Unread') {
        tabMatch = !n.isRead.value;
      } else if (tab == 'Critical') {
        tabMatch = n.isCritical;
      } else if (tab == 'Warning') {
        tabMatch = n.isWarning;
      } else if (tab == 'Info') {
        tabMatch = n.isInfo;
      }

      if (!tabMatch) return false;

      // 2. Search query filtering
      if (query.isEmpty) return true;

      return n.title.toLowerCase().contains(query) ||
          n.message.toLowerCase().contains(query) ||
          n.type.toLowerCase().contains(query);
    }).toList();
  }

  // ---------------- Push Notification Banner State ----------------
  final RxBool isPushEnabled = false.obs;

  @override
  void onInit() {
    super.onInit();
    fetchNotifications();
  }

  Future<void> fetchNotifications() async {
    isLoading.value = true;
    try {
      final res = await _driverService.getNotifications(page: 1, limit: 50);
      if (res.success && res.data != null && res.data!.isNotEmpty) {
        final list = res.data!.map((item) => DriverNotification.fromJson(item)).toList();
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

  Future<void> onRefresh() async => fetchNotifications();

  void selectTab(String tab) {
    activeTab.value = tab;
    // Map to legacy index if needed
    if (tab == 'All') {
      selectedTabIndex.value = 0;
    } else if (tab == 'Unread') {
      selectedTabIndex.value = 1;
    } else if (tab == 'Critical') {
      selectedTabIndex.value = 2;
    } else if (tab == 'Warning') {
      selectedTabIndex.value = 3;
    } else {
      selectedTabIndex.value = 4;
    }
  }

  void selectTabIndex(int index) {
    selectedTabIndex.value = index;
    switch (index) {
      case 0:
        activeTab.value = 'All';
        break;
      case 1:
        activeTab.value = 'Unread';
        break;
      case 2:
        activeTab.value = 'Critical';
        break;
      case 3:
        activeTab.value = 'Warning';
        break;
      case 4:
      default:
        activeTab.value = 'Info';
        break;
    }
  }

  void onSearchChanged(String query) {
    searchQuery.value = query;
  }

  void clearSearch() {
    searchController.clear();
    searchQuery.value = '';
  }

  void confirmClearAll() {
    Get.dialog(
      AlertDialog(
        backgroundColor: const Color(0xFF15151F),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          'clear_all'.tr,
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
        ),
        content: Text(
          'clear_all_notifications_confirm'.tr,
          style: const TextStyle(color: Colors.white70, fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: Text('cancel'.tr, style: const TextStyle(color: Colors.white54)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFE74C3C),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () {
              Get.back();
              clearAll();
            },
            child: Text(
              'clear_all'.tr,
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }

  void onOpenFilterSheet() {
    // Show quick filter sheet
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Color(0xFF15151F),
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(2)),
              ),
            ),
            const SizedBox(height: 16),
            Text('filter'.tr, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 14),
            ...['All', 'Unread', 'Critical', 'Warning', 'Info'].map((tab) => ListTile(
                  dense: true,
                  title: Text(
                    tab == 'All'
                        ? 'all_tab'.tr
                        : tab == 'Unread'
                            ? 'unread'.tr
                            : tab == 'Critical'
                                ? 'critical'.tr
                                : tab == 'Warning'
                                    ? 'warning'.tr
                                    : 'info'.tr,
                    style: const TextStyle(color: Colors.white),
                  ),
                  trailing: activeTab.value == tab ? const Icon(Icons.check, color: Color(0xFF1C68FD)) : null,
                  onTap: () {
                    selectTab(tab);
                    Get.back();
                  },
                )),
          ],
        ),
      ),
      backgroundColor: Colors.transparent,
    );
  }

  // ---------------- Mark As Read ----------------
  Future<void> markAsRead(DriverNotification notification) async {
    if (!notification.isRead.value) {
      notification.isRead.value = true;
      try {
        await _driverService.markNotificationRead(notification.id);
      } catch (e) {
        debugPrint('Error marking notification read: $e');
      }
    }
  }

  // ---------------- Mark All Read ----------------
  Future<void> markAllAsRead() async {
    for (var n in allNotifications) {
      n.isRead.value = true;
    }
    try {
      await _driverService.markAllNotificationsRead();
      Get.snackbar(
        'notifications'.tr,
        'all_notifications_marked_read'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF2ECC71),
        colorText: Colors.white,
        duration: const Duration(seconds: 2),
      );
    } catch (e) {
      debugPrint('Error marking all notifications read: $e');
    }
  }

  // ---------------- Delete Notification ----------------
  Future<void> deleteNotification(DriverNotification notification) async {
    allNotifications.remove(notification);
    try {
      await _driverService.deleteNotification(notification.id);
    } catch (e) {
      debugPrint('Error deleting notification: $e');
    }
  }

  // ---------------- Clear All Notifications ----------------
  Future<void> clearAll() async {
    allNotifications.clear();
    try {
      await _driverService.clearAllNotifications();
      Get.snackbar(
        'notifications'.tr,
        'all_notifications_cleared'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF2ECC71),
        colorText: Colors.white,
      );
    } catch (e) {
      debugPrint('Error clearing notifications: $e');
    }
  }

  // =========================================================================
  // Smart Tap-to-Navigate Routing Engine
  // =========================================================================
  void onNotificationTap(DriverNotification notification) {
    // 1. Mark as read immediately
    markAsRead(notification);

    final actionUrl = (notification.actionUrl ?? '').toLowerCase();
    final entityType = (notification.entityType ?? '').toLowerCase();
    final title = notification.title.toLowerCase();
    final message = notification.message.toLowerCase();
    final entityId = notification.entityId;

    // 2. Schedule & Shifts Navigation
    if (actionUrl.contains('schedule') ||
        entityType == 'shift' ||
        entityType == 'schedule' ||
        title.contains('shift') ||
        title.contains('schedule') ||
        title.contains('timetable') ||
        message.contains('shift assigned') ||
        message.contains('shift confirmed') ||
        message.contains('schedule update')) {
      Get.toNamed(Routes.DRIVER_SCHEDULE);
      return;
    }

    // 3. Active Route / Navigation / Corridor
    if (actionUrl.contains('route') ||
        entityType == 'route' ||
        entityType == 'trip' ||
        title.contains('route') ||
        title.contains('corridor') ||
        title.contains('bus assigned') ||
        message.contains('assigned to route') ||
        message.contains('corridor dispatch')) {
      Get.toNamed(Routes.MY_ROUTE);
      return;
    }

    // 4. Incident / Breakdown / Accident Navigation
    if (actionUrl.contains('incident') ||
        entityType == 'incident' ||
        title.contains('incident') ||
        title.contains('accident') ||
        title.contains('breakdown') ||
        message.contains('incident report') ||
        message.contains('road incident')) {
      if (entityId != null && entityId.isNotEmpty) {
        Get.toNamed(
          Routes.DRIVER_INCIDENT_DETAILS,
          arguments: DriverIncidentItem(
            id: entityId,
            incidentType: notification.title,
            description: notification.message,
            severity: notification.severity,
          ),
        );
      } else {
        Get.toNamed(Routes.DRIVER_INCIDENTS_LIST);
      }
      return;
    }

    // 5. Work Order / Technician Malfunction
    if (actionUrl.contains('work-order') ||
        actionUrl.contains('work_order') ||
        entityType == 'work_order' ||
        title.contains('technician') ||
        title.contains('work order') ||
        title.contains('defect') ||
        title.contains('repair') ||
        message.contains('technician assigned') ||
        message.contains('work order')) {
      if (entityId != null && entityId.isNotEmpty) {
        Get.toNamed(
          Routes.DRIVER_WORK_ORDER_DETAILS,
          arguments: {'orderId': entityId},
        );
      } else {
        Get.toNamed(Routes.DRIVER_WORK_ORDERS);
      }
      return;
    }

    // 6. Support Ticket / Helpdesk Navigation
    if (actionUrl.contains('ticket') ||
        actionUrl.contains('support') ||
        entityType == 'ticket' ||
        title.contains('ticket') ||
        title.contains('support') ||
        title.contains('helpdesk') ||
        message.contains('support ticket')) {
      if (entityId != null && entityId.isNotEmpty) {
        Get.toNamed(
          Routes.DRIVER_SUPPORT_TICKET_DETAILS,
          arguments: entityId,
        );
      } else {
        Get.toNamed(Routes.DRIVER_SUPPORT_HISTORY);
      }
      return;
    }

    // 7. Documents / KYC / License Expiry Navigation
    if (actionUrl.contains('document') ||
        entityType == 'document' ||
        title.contains('document') ||
        title.contains('license') ||
        title.contains('kyc') ||
        title.contains('expiry') ||
        message.contains('license verification') ||
        message.contains('document expiring')) {
      Get.toNamed(Routes.DRIVER_DOCUMENT);
      return;
    }

    // 8. Emergency SOS / Control Room Navigation
    if (title.contains('emergency sos') ||
        title.contains('control room') ||
        message.contains('emergency assistance')) {
      Get.toNamed(Routes.DRIVER_HELP_SUPPORT);
      return;
    }

    // 9. Profile Navigation
    if (actionUrl.contains('profile') || entityType == 'profile') {
      Get.toNamed(Routes.DRIVER_PROFILE);
      return;
    }

    // 10. Fallback: Show Notification Detail Bottom Sheet
    _showNotificationDetailSheet(notification);
  }

  void _showNotificationDetailSheet(DriverNotification notification) {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Color(0xFF15151F),
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.white24,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: notification.severityBgColor,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(notification.icon, color: notification.severityColor, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        notification.title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14.5,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        notification.timeAgo,
                        style: const TextStyle(color: Colors.white38, fontSize: 11),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Text(
              notification.message,
              style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.4),
            ),
            const SizedBox(height: 20),
            GestureDetector(
              onTap: () => Get.back(),
              child: Container(
                width: double.infinity,
                height: 42,
                decoration: BoxDecoration(
                  color: const Color(0xFF1B1B27),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.white12),
                ),
                child: Center(
                  child: Text(
                    'close'.tr,
                    style: const TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
    );
  }

  void onManagePushSettings() {
    Get.toNamed('/notification-settings');
  }

  void onBackPressed() => Get.back();

  @override
  void onClose() {
    searchController.dispose();
    super.onClose();
  }
}
