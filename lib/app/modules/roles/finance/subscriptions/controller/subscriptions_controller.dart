import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/finance/subscriptions/controller/manage_subscription_controller.dart';
import 'package:vmovexa/app/modules/roles/finance/subscriptions/view/manage_subscription_view.dart';

import '../model/subscription_model.dart';

class SubscriptionsController extends GetxController {
  // ---------------- Header ----------------
  final RxInt notificationCount = 1.obs;
  final RxString userInitial = 'F'.obs;

  // ---------------- Loading ----------------
  final RxBool isLoading = false.obs;

  // ---------------- Search ----------------
  final RxString searchQuery = ''.obs;
  void onSearchChanged(String value) => searchQuery.value = value;

  // ---------------- Filter tabs ----------------
  final RxInt selectedFilterIndex = 0.obs; // 0=All, 1=Active, 2=Expiring Soon, 3=Inactive
  void selectFilter(int index) => selectedFilterIndex.value = index;

  // ---------------- Subscriptions ----------------
  final RxList<Subscription> allSubscriptions = <Subscription>[].obs;

  List<Subscription> get filteredSubscriptions {
    var list = allSubscriptions.toList();

    if (searchQuery.value.trim().isNotEmpty) {
      final q = searchQuery.value.trim().toLowerCase();
      list = list.where((s) => s.companyName.toLowerCase().contains(q)).toList();
    }

    switch (selectedFilterIndex.value) {
      case 1:
        return list.where((s) => s.status == SubscriptionStatus.active).toList();
      case 2:
        return list.where((s) => s.status == SubscriptionStatus.expiringSoon).toList();
      case 3:
        return list.where((s) => s.status == SubscriptionStatus.inactive).toList();
      default:
        return list;
    }
  }

  int get totalCount => allSubscriptions.length;
  int get activeCount => allSubscriptions.where((s) => s.status == SubscriptionStatus.active).length;
  int get expiringSoonCount => allSubscriptions.where((s) => s.status == SubscriptionStatus.expiringSoon).length;
  int get inactiveCount => allSubscriptions.where((s) => s.status == SubscriptionStatus.inactive).length;

  @override
  void onInit() {
    super.onInit();
    fetchSubscriptions();
  }

  Future<void> fetchSubscriptions() async {
    isLoading.value = true;
    try {
      // TODO: replace with real API/repository call
      allSubscriptions.assignAll(_mockSubscriptions());
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> onRefresh() async => fetchSubscriptions();

  // ---------------- Actions ----------------
  void onMenuTap() {
    // TODO: open drawer / navigation menu
  }

  void onNotificationTap() => Get.toNamed('/notifications');

  void onProfileTap() => Get.toNamed('/profile');

  void onOpenFilterSheet() {
    // TODO: hook up an advanced filter bottom sheet
  }

  void onContactSupport() => Get.toNamed('/help-support');

  void onSubscriptionTap(Subscription subscription) {
    Get.delete<ManageSubscriptionController>(force: true);
    Get.put(ManageSubscriptionController(subscription: subscription));
    Get.to(() => const ManageSubscriptionView());
  }

  // ---------------- Mock data ----------------
  List<Subscription> _mockSubscriptions() {
    return [
      Subscription(
        id: 'sub_1',
        subscriptionCode: 'SUB-2026-00024',
        companyName: 'VMOVEXA Advertising Pvt. Ltd.',
        initials: 'VM',
        avatarColor: const Color(0xFFB042FF),
        planName: 'Enterprise Plan',
        status: SubscriptionStatus.active,
        dateRangeText: '01 Jul 2026 - 30 Jun 2027',
        userCount: 50,
      ),
      Subscription(
        id: 'sub_2',
        subscriptionCode: 'SUB-2026-00031',
        companyName: 'TransRoute Logistics',
        initials: 'TR',
        avatarColor: const Color(0xFF3F7BF5),
        planName: 'Business Plan',
        status: SubscriptionStatus.active,
        dateRangeText: '15 Aug 2026 - 14 Aug 2027',
        userCount: 22,
      ),
      Subscription(
        id: 'sub_3',
        subscriptionCode: 'SUB-2026-00040',
        companyName: 'QuickMove Solutions',
        initials: 'QU',
        avatarColor: const Color(0xFFCC6E1F),
        planName: 'Basic Plan',
        status: SubscriptionStatus.active,
        dateRangeText: '10 May 2026 - 09 May 2027',
        userCount: 8,
      ),
      Subscription(
        id: 'sub_4',
        subscriptionCode: 'SUB-2025-00512',
        companyName: 'Urban Fleet Services',
        initials: 'UR',
        avatarColor: const Color(0xFF2E7D4F),
        planName: 'Enterprise Plan',
        status: SubscriptionStatus.expiringSoon,
        dateRangeText: '05 Sep 2026 - 04 Sep 2027',
        userCount: 41,
      ),
      Subscription(
        id: 'sub_5',
        subscriptionCode: 'SUB-2025-00477',
        companyName: 'CityRide Mobility',
        initials: 'CI',
        avatarColor: const Color(0xFF6C3FA6),
        planName: 'Business Plan',
        status: SubscriptionStatus.expiringSoon,
        dateRangeText: '20 Aug 2026 - 19 Aug 2027',
        userCount: 19,
      ),
      Subscription(
        id: 'sub_6',
        subscriptionCode: 'SUB-2025-00201',
        companyName: 'FastCargo Express',
        initials: 'FA',
        avatarColor: const Color(0xFFB35A1F),
        planName: 'Basic Plan',
        status: SubscriptionStatus.inactive,
        dateRangeText: '12 Feb 2026 - 11 Feb 2027',
        userCount: 5,
      ),
    ];
  }
}
