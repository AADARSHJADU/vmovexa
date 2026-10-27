import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/services/finance_service.dart';
import 'package:vmovexa/app/modules/roles/finance/subscriptions/controller/manage_subscription_controller.dart';
import 'package:vmovexa/app/modules/roles/finance/subscriptions/view/manage_subscription_view.dart';
import 'package:vmovexa/app/routes/app_routes.dart';

import '../model/subscription_model.dart';

class SubscriptionsController extends GetxController {
  // ---------------- Loading ----------------
  final RxBool isLoading = false.obs;
  final RxBool isActionLoading = false.obs;

  // ---------------- Search ----------------
  final RxString searchQuery = ''.obs;
  void onSearchChanged(String value) => searchQuery.value = value;

  // ---------------- Filter tabs ----------------
  // 0=All, 1=Active, 2=Payment Pending, 3=Pending Approval, 4=Suspended
  final RxInt selectedFilterIndex = 0.obs;
  final List<String> filterLabels = const [
    'All',
    'Active',
    'Payment Pending',
    'Pending Approval',
    'Suspended',
  ];

  void selectFilter(int index) {
    selectedFilterIndex.value = index;
    fetchSubscriptions();
  }

  // ---------------- Subscriptions / Tenants ----------------
  final RxList<Subscription> allSubscriptions = <Subscription>[].obs;

  List<Subscription> get filteredSubscriptions {
    var list = allSubscriptions.toList();

    if (searchQuery.value.trim().isNotEmpty) {
      final q = searchQuery.value.trim().toLowerCase();
      list = list.where((s) {
        return s.companyName.toLowerCase().contains(q) ||
            s.city.toLowerCase().contains(q) ||
            s.state.toLowerCase().contains(q) ||
            s.adminEmail.toLowerCase().contains(q);
      }).toList();
    }

    switch (selectedFilterIndex.value) {
      case 1:
        return list.where((s) => s.status == SubscriptionStatus.active).toList();
      case 2:
        return list.where((s) => s.status == SubscriptionStatus.paymentPending).toList();
      case 3:
        return list.where((s) => s.status == SubscriptionStatus.pendingApproval).toList();
      case 4:
        return list.where((s) => s.status == SubscriptionStatus.suspended || s.status == SubscriptionStatus.inactive).toList();
      default:
        return list;
    }
  }

  int get totalCount => allSubscriptions.length;
  int get activeCount => allSubscriptions.where((s) => s.status == SubscriptionStatus.active).length;
  int get paymentPendingCount => allSubscriptions.where((s) => s.status == SubscriptionStatus.paymentPending).length;
  int get pendingApprovalCount => allSubscriptions.where((s) => s.status == SubscriptionStatus.pendingApproval).length;
  int get suspendedCount => allSubscriptions.where((s) => s.status == SubscriptionStatus.suspended || s.status == SubscriptionStatus.inactive).length;

  @override
  void onInit() {
    super.onInit();
    fetchSubscriptions();
  }

  String? _getStatusParam() {
    switch (selectedFilterIndex.value) {
      case 1:
        return 'active';
      case 2:
        return 'payment_pending';
      case 3:
        return 'pending_approval';
      case 4:
        return 'suspended';
      default:
        return null;
    }
  }

  Future<void> fetchSubscriptions() async {
    isLoading.value = true;
    try {
      final statusParam = _getStatusParam();
      // Try /organizations first as in admin panel
      var res = await FinanceService.to.getOrganizations(
        search: searchQuery.value.trim().isEmpty ? null : searchQuery.value.trim(),
        status: statusParam,
      );

      // Fallback to /finance/subscriptions if /organizations returns empty or fails
      if (!res.success || res.data == null) {
        res = await FinanceService.to.getSubscriptions(
          search: searchQuery.value.trim().isEmpty ? null : searchQuery.value.trim(),
          status: statusParam,
        );
      }

      List<Subscription> list = [];
      if (res.success && res.data != null) {
        dynamic items = res.data;
        if (items is Map && items.containsKey('rows')) {
          items = items['rows'];
        } else if (items is Map && items.containsKey('items')) {
          items = items['items'];
        } else if (items is Map && items.containsKey('organizations')) {
          items = items['organizations'];
        }

        if (items is List && items.isNotEmpty) {
          list = items
              .map((it) => Subscription.fromJson(Map<String, dynamic>.from(it as Map)))
              .toList();
        }
      }

      allSubscriptions.assignAll(list);
    } catch (_) {
      allSubscriptions.clear();
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> onRefresh() async => fetchSubscriptions();

  // ---------------- Actions ----------------
  void onOnboardTenant() {
    Get.toNamed(Routes.FINANCE_ONBOARD_TENANT);
  }

  void onManageSubscription(Subscription sub) {
    Get.delete<ManageSubscriptionController>();
    Get.put(ManageSubscriptionController(subscription: sub));
    Get.to(() => const ManageSubscriptionView());
  }

  Future<void> approveTenant(String id) async {
    isActionLoading.value = true;
    try {
      final res = await FinanceService.to.approveOrganization(id);
      if (res.success) {
        Get.snackbar(
          'Tenant Approved',
          'Tenant onboarding has been approved successfully!',
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
        fetchSubscriptions();
      } else {
        Get.snackbar(
          'Approval Failed',
          (res.message != null && res.message!.isNotEmpty) ? res.message! : 'Could not approve tenant',
          backgroundColor: Colors.redAccent,
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (e) {
      Get.snackbar('Error', e.toString(), backgroundColor: Colors.redAccent, colorText: Colors.white);
    } finally {
      isActionLoading.value = false;
    }
  }

  Future<void> toggleSuspendTenant(String id, String currentStatus) async {
    final nextStatus = currentStatus.toLowerCase() == 'suspended' ? 'active' : 'suspended';
    isActionLoading.value = true;
    try {
      final res = await FinanceService.to.updateOrganizationStatus(id, nextStatus);
      if (res.success) {
        Get.snackbar(
          nextStatus == 'active' ? 'Tenant Activated' : 'Tenant Suspended',
          'Organization status updated to $nextStatus',
          backgroundColor: nextStatus == 'active' ? const Color(0xFF10B981) : Colors.orangeAccent,
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
        fetchSubscriptions();
      } else {
        Get.snackbar(
          'Failed',
          (res.message != null && res.message!.isNotEmpty) ? res.message! : 'Could not update status',
          backgroundColor: Colors.redAccent,
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (e) {
      Get.snackbar('Error', e.toString(), backgroundColor: Colors.redAccent, colorText: Colors.white);
    } finally {
      isActionLoading.value = false;
    }
  }
}
