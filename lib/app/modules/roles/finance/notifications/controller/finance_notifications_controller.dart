import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../model/notification_model.dart';

class FinanceNotificationsController extends GetxController with GetSingleTickerProviderStateMixin {
  // Tab index (0: All, 1: Unread, 2: Invoices, 3: Payments, 4: Subscriptions)
  final RxInt selectedTabIndex = 0.obs;

  // Selected Type filter for the dropdown
  final RxString selectedTypeFilter = 'All Types'.obs;

  // List of all notifications
  final RxList<FinanceNotificationModel> allNotifications = <FinanceNotificationModel>[].obs;

  // Filtered notifications list based on tab and dropdown filters
  final RxList<FinanceNotificationModel> filteredNotifications = <FinanceNotificationModel>[].obs;

  // Grouped notifications by Date Group (Today, Yesterday, 01 Aug 2026, etc.)
  final RxMap<String, List<FinanceNotificationModel>> groupedNotifications = <String, List<FinanceNotificationModel>>{}.obs;

  late TabController tabController;

  @override
  void onInit() {
    super.onInit();
    tabController = TabController(length: 5, vsync: this);
    tabController.addListener(() {
      selectedTabIndex.value = tabController.index;
      applyFilters();
    });

    loadNotifications();
  }

  @override
  void onClose() {
    tabController.dispose();
    super.onClose();
  }

  void loadNotifications() {
    allNotifications.addAll([
      // TODAY
      FinanceNotificationModel(
        id: '1',
        type: NotificationType.invoice,
        title: 'Invoice Generated',
        description: 'Invoice INV-2026-1045 has been generated for VMOVEXA Advertising Pvt. Ltd.',
        time: '10:30 AM',
        dateGroup: 'Today',
        isUnread: true,
        icon: Icons.description_outlined,
        iconColor: const Color(0xFFA855F7),
        iconBgColor: const Color(0xFFA855F7).withOpacity(0.12),
      ),
      FinanceNotificationModel(
        id: '2',
        type: NotificationType.payment,
        title: 'Payment Received',
        description: 'Payment of ₹2,45,000 received from TransRoute Logistics against invoice INV-2026-1042.',
        time: '09:15 AM',
        dateGroup: 'Today',
        isUnread: true,
        icon: Icons.currency_exchange_outlined,
        iconColor: const Color(0xFF10B981),
        iconBgColor: const Color(0xFF10B981).withOpacity(0.12),
      ),
      FinanceNotificationModel(
        id: '3',
        type: NotificationType.subscription,
        title: 'Subscription Expiring Soon',
        description: 'Urban Fleet Services subscription will expire on 04 Sep 2026.',
        time: '08:45 AM',
        dateGroup: 'Today',
        isUnread: true,
        icon: Icons.access_time_outlined,
        iconColor: const Color(0xFFF59E0B),
        iconBgColor: const Color(0xFFF59E0B).withOpacity(0.12),
      ),
      FinanceNotificationModel(
        id: '4',
        type: NotificationType.payment,
        title: 'Auto Debit Failed',
        description: 'Auto debit failed for CityRide Mobility. Please update payment method.',
        time: '08:20 AM',
        dateGroup: 'Today',
        isUnread: true,
        icon: Icons.credit_card_outlined,
        iconColor: const Color(0xFF3B82F6),
        iconBgColor: const Color(0xFF3B82F6).withOpacity(0.12),
      ),

      // YESTERDAY
      FinanceNotificationModel(
        id: '5',
        type: NotificationType.payment,
        title: 'Payout Completed',
        description: 'Payout of ₹5,60,000 has been completed to your bank account.',
        time: 'Yesterday, 06:30 PM',
        dateGroup: 'Yesterday',
        isUnread: false,
        icon: Icons.download_done_outlined,
        iconColor: const Color(0xFF10B981),
        iconBgColor: const Color(0xFF10B981).withOpacity(0.12),
      ),
      FinanceNotificationModel(
        id: '6',
        type: NotificationType.report,
        title: 'Revenue Report Generated',
        description: 'Revenue report for Aug 2026 is ready to download.',
        time: 'Yesterday, 04:10 PM',
        dateGroup: 'Yesterday',
        isUnread: false,
        icon: Icons.analytics_outlined,
        iconColor: const Color(0xFFA855F7),
        iconBgColor: const Color(0xFFA855F7).withOpacity(0.12),
      ),
      FinanceNotificationModel(
        id: '7',
        type: NotificationType.gst,
        title: 'GST Return Filed',
        description: 'GSTR-1 for Jul 2026 has been filed successfully.',
        time: 'Yesterday, 01:20 PM',
        dateGroup: 'Yesterday',
        isUnread: false,
        icon: Icons.balance_outlined,
        iconColor: const Color(0xFF3B82F6),
        iconBgColor: const Color(0xFF3B82F6).withOpacity(0.12),
      ),

      // 01 AUG 2026
      FinanceNotificationModel(
        id: '8',
        type: NotificationType.payment,
        title: 'Payment Overdue',
        description: 'Payment for FastCargo Express is overdue by 5 days.',
        time: '01 Aug 2026, 11:00 AM',
        dateGroup: '01 Aug 2026',
        isUnread: false,
        icon: Icons.error_outline,
        iconColor: const Color(0xFFF59E0B),
        iconBgColor: const Color(0xFFF59E0B).withOpacity(0.12),
      ),
      FinanceNotificationModel(
        id: '9',
        type: NotificationType.subscription,
        title: 'Subscription Plan Updated',
        description: 'Changes made to Enterprise Plan (Annual).',
        time: '01 Aug 2026, 10:15 AM',
        dateGroup: '01 Aug 2026',
        isUnread: false,
        icon: Icons.description_outlined,
        iconColor: const Color(0xFFA855F7),
        iconBgColor: const Color(0xFFA855F7).withOpacity(0.12),
      ),
    ]);

    applyFilters();
  }

  void applyFilters() {
    List<FinanceNotificationModel> temp = List.from(allNotifications);

    // 1. Tab Filter
    switch (selectedTabIndex.value) {
      case 1: // Unread
        temp = temp.where((element) => element.isUnread.value).toList();
        break;
      case 2: // Invoices
        temp = temp.where((element) => element.type == NotificationType.invoice).toList();
        break;
      case 3: // Payments
        temp = temp.where((element) => element.type == NotificationType.payment).toList();
        break;
      case 4: // Subscriptions
        temp = temp.where((element) => element.type == NotificationType.subscription).toList();
        break;
      case 0:
      default:
        // 'All' - no filter
        break;
    }

    // 2. Dropdown Filter
    if (selectedTypeFilter.value != 'All Types') {
      if (selectedTypeFilter.value == 'Invoices Only') {
        temp = temp.where((element) => element.type == NotificationType.invoice).toList();
      } else if (selectedTypeFilter.value == 'Payments Only') {
        temp = temp.where((element) => element.type == NotificationType.payment).toList();
      } else if (selectedTypeFilter.value == 'Subscriptions Only') {
        temp = temp.where((element) => element.type == NotificationType.subscription).toList();
      }
    }

    filteredNotifications.assignAll(temp);
    groupNotificationsByDate();
  }

  void groupNotificationsByDate() {
    final Map<String, List<FinanceNotificationModel>> groups = {};
    for (var item in filteredNotifications) {
      if (!groups.containsKey(item.dateGroup)) {
        groups[item.dateGroup] = [];
      }
      groups[item.dateGroup]!.add(item);
    }
    groupedNotifications.assignAll(groups);
  }

  // Count methods for tab badges
  int getCountForAll() => allNotifications.length;
  int getCountForUnread() => allNotifications.where((e) => e.isUnread.value).length;
  int getCountForInvoices() => allNotifications.where((e) => e.type == NotificationType.invoice).length;
  int getCountForPayments() => allNotifications.where((e) => e.type == NotificationType.payment).length;
  int getCountForSubscriptions() => allNotifications.where((e) => e.type == NotificationType.subscription).length;

  // Actions
  void markAllAsRead() {
    for (var notification in allNotifications) {
      notification.isUnread.value = false;
    }
    applyFilters();
    // Get.snackbar(
    //   'Notifications Read',
    //   'All notifications marked as read',
    //   snackPosition: SnackPosition.BOTTOM,
    //   backgroundColor: const Color(0xFF10B981),
    //   colorText: Colors.white,
    // );
  }

  void markAsRead(String id) {
    final item = allNotifications.firstWhereOrNull((e) => e.id == id);
    if (item != null) {
      item.isUnread.value = false;
      applyFilters();
    }
  }

  void filterDropdownTapped() {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(16),
        decoration: const BoxDecoration(
          color: Color(0xFF10121A),
          borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Select Type',
              style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            ListTile(
              title: const Text('All Types', style: TextStyle(color: Colors.white)),
              onTap: () {
                selectedTypeFilter.value = 'All Types';
                applyFilters();
                Get.back();
              },
            ),
            ListTile(
              title: const Text('Invoices Only', style: TextStyle(color: Colors.white)),
              onTap: () {
                selectedTypeFilter.value = 'Invoices Only';
                applyFilters();
                Get.back();
              },
            ),
            ListTile(
              title: const Text('Payments Only', style: TextStyle(color: Colors.white)),
              onTap: () {
                selectedTypeFilter.value = 'Payments Only';
                applyFilters();
                Get.back();
              },
            ),
            ListTile(
              title: const Text('Subscriptions Only', style: TextStyle(color: Colors.white)),
              onTap: () {
                selectedTypeFilter.value = 'Subscriptions Only';
                applyFilters();
                Get.back();
              },
            ),
          ],
        ),
      ),
    );
  }

  void showFilterWizard() {
    // Get.snackbar(
    //   'Advanced Filters',
    //   'Opening advanced filter wizard...',
    //   snackPosition: SnackPosition.BOTTOM,
    //   backgroundColor: const Color(0xFF10121A),
    //   colorText: Colors.white,
    // );
  }

  void goToSettings() {
    // Get.snackbar(
    //   'Notification Settings',
    //   'Redirecting to notification preferences...',
    //   snackPosition: SnackPosition.BOTTOM,
    //   backgroundColor: const Color(0xFF10121A),
    //   colorText: Colors.white,
    // );
  }

  void toggleSidebar() {
    // Get.snackbar(
    //   'Menu',
    //   'Toggle navigation drawer',
    //   snackPosition: SnackPosition.BOTTOM,
    //   backgroundColor: const Color(0xFF10121A),
    //   colorText: Colors.white,
    // );
  }
}
