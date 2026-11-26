import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/services/finance_service.dart';
import 'package:vmovexa/app/data/services/http_client_service.dart';
import 'package:vmovexa/app/modules/roles/finance/subscriptions/controller/manage_subscription_controller.dart';
import 'package:vmovexa/app/modules/roles/finance/subscriptions/view/manage_subscription_view.dart';
import 'package:vmovexa/app/modules/roles/finance/subscriptions/onboard_tenant/controller/onboard_tenant_controller.dart';
import 'package:vmovexa/app/modules/roles/finance/subscriptions/onboard_tenant/view/onboard_tenant_view.dart';
import 'package:vmovexa/app/routes/app_routes.dart';

import '../model/subscription_model.dart';

class SubscriptionsController extends GetxController {
  // ---------------- Loading States ----------------
  final RxBool isLoading = false.obs;
  final RxBool isRefreshing = false.obs;
  final RxBool isActionLoading = false.obs;

  // ---------------- Search ----------------
  final TextEditingController searchController = TextEditingController();
  final RxString searchQuery = ''.obs;
  Timer? _debounceTimer;

  void onSearchChanged(String value) {
    searchQuery.value = value;
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 350), () {
      fetchSubscriptions();
    });
  }

  void clearSearch() {
    searchController.clear();
    searchQuery.value = '';
    fetchSubscriptions();
  }

  // ---------------- 5 Status Tabs (Exact Admin Panel Parity) ----------------
  // 'all', 'payment_pending', 'active', 'pending_approval', 'suspended'
  final RxString activeTab = 'all'.obs;

  void selectTab(String key) {
    activeTab.value = key;
    if (key == 'payment_pending') {
      selectedPaymentStatus.value = 'all';
    }
    fetchSubscriptions();
  }

  // ---------------- Filter Toolbar (Right Side of Search) ----------------
  // Payment Status: 'all', 'payment_pending', 'paid'
  final RxString selectedPaymentStatus = 'all'.obs;

  // Plan Filter: 'all', or plan ID from /billing/plans
  final RxString selectedPlan = 'all'.obs;
  final RxList<TenantPlanItem> plansList = <TenantPlanItem>[].obs;

  // Sort By: 'newest', 'oldest', 'name_asc', 'name_desc', 'buses_desc', 'buses_asc'
  final RxString sortBy = 'newest'.obs;

  // ---------------- Tab Counts (from backend counts or list) ----------------
  final RxInt countAll = 0.obs;
  final RxInt countPaymentPending = 0.obs;
  final RxInt countActive = 0.obs;
  final RxInt countPending = 0.obs;
  final RxInt countSuspended = 0.obs;

  bool get hasActiveFilters =>
      activeTab.value != 'all' ||
      selectedPaymentStatus.value != 'all' ||
      selectedPlan.value != 'all' ||
      sortBy.value != 'newest' ||
      searchQuery.value.trim().isNotEmpty;

  bool get hasExtraFilters =>
      selectedPaymentStatus.value != 'all' ||
      selectedPlan.value != 'all' ||
      sortBy.value != 'newest';

  void handleResetFilters() {
    activeTab.value = 'all';
    selectedPaymentStatus.value = 'all';
    selectedPlan.value = 'all';
    sortBy.value = 'newest';
    searchController.clear();
    searchQuery.value = '';
    fetchSubscriptions();
  }

  // ---------------- Subscriptions / Tenants List ----------------
  final RxList<Subscription> allSubscriptions = <Subscription>[].obs;

  List<Subscription> get filteredSubscriptions {
    var list = allSubscriptions.toList();

    // Client-side fallback search filter if query provided
    final q = searchQuery.value.trim().toLowerCase();
    if (q.isNotEmpty) {
      list = list.where((s) {
        return s.companyName.toLowerCase().contains(q) ||
            s.subscriptionCode.toLowerCase().contains(q) ||
            s.city.toLowerCase().contains(q) ||
            s.state.toLowerCase().contains(q) ||
            s.adminName.toLowerCase().contains(q) ||
            s.adminEmail.toLowerCase().contains(q);
      }).toList();
    }

    // Client-side fallback tab filter
    if (activeTab.value == 'payment_pending') {
      list = list.where((s) => s.paymentStatus == 'payment_pending' || s.status == SubscriptionStatus.paymentPending).toList();
    } else if (activeTab.value == 'active') {
      list = list.where((s) => s.status == SubscriptionStatus.active).toList();
    } else if (activeTab.value == 'pending_approval') {
      list = list.where((s) => s.status == SubscriptionStatus.pendingApproval || s.status == SubscriptionStatus.approved).toList();
    } else if (activeTab.value == 'suspended') {
      list = list.where((s) => s.status == SubscriptionStatus.suspended || s.status == SubscriptionStatus.inactive).toList();
    }

    // Client-side fallback payment status filter
    if (selectedPaymentStatus.value == 'payment_pending') {
      list = list.where((s) => s.paymentStatus == 'payment_pending').toList();
    } else if (selectedPaymentStatus.value == 'paid') {
      list = list.where((s) => s.paymentStatus == 'paid').toList();
    }

    // Client-side fallback plan filter
    if (selectedPlan.value != 'all') {
      list = list.where((s) => s.planId == selectedPlan.value || s.planName.toLowerCase().contains(selectedPlan.value.toLowerCase())).toList();
    }

    // Client-side sorting fallback
    switch (sortBy.value) {
      case 'oldest':
        // Oldest first
        break;
      case 'name_asc':
        list.sort((a, b) => a.companyName.toLowerCase().compareTo(b.companyName.toLowerCase()));
        break;
      case 'name_desc':
        list.sort((a, b) => b.companyName.toLowerCase().compareTo(a.companyName.toLowerCase()));
        break;
      case 'buses_desc':
        list.sort((a, b) => b.busesCount.compareTo(a.busesCount));
        break;
      case 'buses_asc':
        list.sort((a, b) => a.busesCount.compareTo(b.busesCount));
        break;
      case 'newest':
      default:
        // Default newest
        break;
    }

    return list;
  }

  @override
  void onInit() {
    super.onInit();
    fetchPlans();
    fetchSubscriptions();
  }

  @override
  void onClose() {
    _debounceTimer?.cancel();
    searchController.dispose();
    super.onClose();
  }

  // ---------------- Fetch Dynamic Plans ----------------
  Future<void> fetchPlans() async {
    try {
      final res = await HttpClientService.to.get<dynamic>(
        ApiConstants.billingPlans,
        requiresAuth: true,
      );
      if (res.success && res.data != null) {
        dynamic raw = res.data;
        if (raw is Map && raw.containsKey('data')) raw = raw['data'];
        if (raw is List) {
          final list = raw
              .map((it) => TenantPlanItem.fromJson(Map<String, dynamic>.from(it as Map)))
              .toList();
          plansList.assignAll(list);
        }
      }
    } catch (_) {}
  }

  // ---------------- Fetch Organizations / Subscriptions ----------------
  Future<void> fetchSubscriptions() async {
    isLoading.value = true;
    try {
      final Map<String, dynamic> params = {
        'page': 1,
        'limit': 50,
      };

      if (searchQuery.value.trim().isNotEmpty) {
        params['search'] = searchQuery.value.trim();
      }

      String? statusParam;
      if (activeTab.value == 'pending_approval') {
        statusParam = 'pending_approval';
      } else if (activeTab.value == 'active') {
        statusParam = 'active';
      } else if (activeTab.value == 'suspended') {
        statusParam = 'suspended';
      }
      if (statusParam != null) {
        params['status'] = statusParam;
      }

      String? paymentParam;
      if (selectedPaymentStatus.value != 'all') {
        paymentParam = selectedPaymentStatus.value;
      } else if (activeTab.value == 'payment_pending') {
        paymentParam = 'payment_pending';
      }
      if (paymentParam != null) {
        params['payment_status'] = paymentParam;
      }

      if (selectedPlan.value != 'all') {
        params['plan_id'] = selectedPlan.value;
      }

      if (sortBy.value != 'newest') {
        params['sortBy'] = sortBy.value;
      }

      // Fetch organizations matching Admin Panel
      var res = await HttpClientService.to.get<dynamic>(
        ApiConstants.organizations,
        queryParams: params,
        requiresAuth: true,
      );

      // Fallback to finance/subscriptions if organizations endpoint fails
      if (!res.success || res.data == null) {
        res = await HttpClientService.to.get<dynamic>(
          ApiConstants.financeSubscriptions,
          queryParams: params,
          requiresAuth: true,
        );
      }

      List<Subscription> list = [];
      if (res.success && res.data != null) {
        dynamic items = res.data;
        dynamic countsMap;

        if (items is Map) {
          if (items.containsKey('counts')) countsMap = items['counts'];
          if (items.containsKey('pagination') && items['pagination'] is Map && items['pagination'].containsKey('counts')) {
            countsMap = items['pagination']['counts'];
          }

          if (items.containsKey('rows')) {
            items = items['rows'];
          } else if (items.containsKey('items')) {
            items = items['items'];
          } else if (items.containsKey('organizations')) {
            items = items['organizations'];
          } else if (items.containsKey('data')) {
            items = items['data'];
          }
        }

        if (items is List) {
          list = items
              .map((it) => Subscription.fromJson(Map<String, dynamic>.from(it as Map)))
              .toList();
        }

        // Parse backend counts if available
        if (countsMap is Map) {
          countAll.value = int.tryParse(countsMap['all']?.toString() ?? '') ?? list.length;
          countPaymentPending.value = int.tryParse(countsMap['payment_pending']?.toString() ?? countsMap['paymentPending']?.toString() ?? '') ?? 0;
          countActive.value = int.tryParse(countsMap['active']?.toString() ?? '') ?? 0;
          countPending.value = int.tryParse(countsMap['pending']?.toString() ?? countsMap['pending_approval']?.toString() ?? '') ?? 0;
          countSuspended.value = int.tryParse(countsMap['suspended']?.toString() ?? '') ?? 0;
        } else {
          // Fallback counts computation
          _updateCountsFromList(list);
        }
      } else {
        _updateCountsFromList(list);
      }

      allSubscriptions.assignAll(list);
    } catch (_) {
      allSubscriptions.clear();
    } finally {
      isLoading.value = false;
      isRefreshing.value = false;
    }
  }

  void _updateCountsFromList(List<Subscription> list) {
    if (activeTab.value == 'all' && selectedPaymentStatus.value == 'all' && selectedPlan.value == 'all' && searchQuery.value.isEmpty) {
      countAll.value = list.length;
      countPaymentPending.value = list.where((s) => s.paymentStatus == 'payment_pending' || s.status == SubscriptionStatus.paymentPending).length;
      countActive.value = list.where((s) => s.status == SubscriptionStatus.active).length;
      countPending.value = list.where((s) => s.status == SubscriptionStatus.pendingApproval || s.status == SubscriptionStatus.approved).length;
      countSuspended.value = list.where((s) => s.status == SubscriptionStatus.suspended || s.status == SubscriptionStatus.inactive).length;
    }
  }

  Future<void> onRefresh() async {
    isRefreshing.value = true;
    await fetchPlans();
    await fetchSubscriptions();
  }

  // ---------------- Actions ----------------
  void onOnboardTenant() {
    Get.toNamed(Routes.FINANCE_ONBOARD_TENANT);
  }

  void onManageSubscription(Subscription sub) {
    Get.delete<ManageSubscriptionController>();
    Get.put(ManageSubscriptionController(subscription: sub));
    Get.to(() => const ManageSubscriptionView());
  }

  Future<void> onEditTenant(Subscription sub) async {
    final onboardCtrl = Get.isRegistered<OnboardTenantController>()
        ? Get.find<OnboardTenantController>()
        : Get.put(OnboardTenantController());
    onboardCtrl.initForEdit(sub);
    final updated = await Get.to(() => const OnboardTenantView());
    if (updated == true) {
      fetchSubscriptions();
    }
  }

  Future<void> approveTenant(String id) async {
    isActionLoading.value = true;
    try {
      final res = await FinanceService.to.approveOrganization(id);
      if (res.success) {
        Get.snackbar(
          'tenant_approved_success'.tr,
          'tenant_approved_success'.tr,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
        fetchSubscriptions();
      } else {
        Get.snackbar(
          'approval_failed'.tr,
          (res.message != null && res.message!.isNotEmpty) ? res.message! : 'tenant_approval_failed'.tr,
          backgroundColor: Colors.redAccent,
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (e) {
      Get.snackbar('error'.tr, e.toString(), backgroundColor: Colors.redAccent, colorText: Colors.white);
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
          nextStatus == 'active' ? 'tenant_activated'.tr : 'tenant_suspended'.tr,
          '${'org_status_updated'.tr} ($nextStatus)',
          backgroundColor: nextStatus == 'active' ? const Color(0xFF10B981) : Colors.orangeAccent,
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
        fetchSubscriptions();
      } else {
        Get.snackbar(
          'failed'.tr,
          (res.message != null && res.message!.isNotEmpty) ? res.message! : 'could_not_update_status'.tr,
          backgroundColor: Colors.redAccent,
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (e) {
      Get.snackbar('error'.tr, e.toString(), backgroundColor: Colors.redAccent, colorText: Colors.white);
    } finally {
      isActionLoading.value = false;
    }
  }
}
