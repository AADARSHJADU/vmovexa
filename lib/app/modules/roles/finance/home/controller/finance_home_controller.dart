import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/services/finance_service.dart';
import 'package:vmovexa/app/data/services/http_client_service.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';
import '../../finance_dashboard/controller/finance_dashboard_controller.dart';
import '../../../../../routes/app_routes.dart';
import '../models/finance_home_models.dart';

class FinanceHomeController extends GetxController {
  // ---------------- Header ----------------
  final RxString userName = 'Finance Officer'.obs;
  final RxString userInitial = 'F'.obs;

  // ---------------- Loading & Refresh ----------------
  final RxBool isLoading = false.obs;
  final RxBool isRefreshing = false.obs;

  // ---------------- Period Filter ('all', 'month', 'quarter', 'year') ----------------
  final RxString selectedPeriod = 'all'.obs;

  // ---------------- Primary KPIs & Breakdown ----------------
  final Rx<FinanceKpiModel> kpis = const FinanceKpiModel().obs;

  // Legacy string proxies for backwards compatibility
  final RxString totalRevenueStr = '₹0'.obs;
  final RxString totalInvoicesStr = '0'.obs;
  final RxString totalPaymentsStr = '₹0'.obs;
  final RxString pendingInvoicesStr = '0'.obs;

  // ---------------- Recent Invoices & Active Subscriptions ----------------
  final RxList<FinanceDashboardInvoiceItem> recentInvoices = <FinanceDashboardInvoiceItem>[].obs;
  final RxList<FinanceDashboardSubscriptionItem> activeSubscriptions = <FinanceDashboardSubscriptionItem>[].obs;

  @override
  void onInit() {
    super.onInit();
    _loadUserHeader();
    fetchDashboardData();
  }

  void _loadUserHeader() {
    try {
      if (Get.isRegistered<StorageService>()) {
        final user = StorageService.to.getUser();
        if (user != null) {
          final uName = user.name ?? '';
          if (uName.isNotEmpty) {
            userName.value = uName;
            userInitial.value = uName[0].toUpperCase();
          }
        }
      }
    } catch (_) {}
  }

  Map<String, dynamic> _getPeriodParams(String period) {
    if (period == 'all') return {};
    final now = DateTime.now();
    final endDate = '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
    DateTime start;
    if (period == 'month') {
      start = DateTime(now.year, now.month, 1);
    } else if (period == 'quarter') {
      final startMonth = ((now.month - 1) ~/ 3) * 3 + 1;
      start = DateTime(now.year, startMonth, 1);
    } else {
      start = DateTime(now.year, 1, 1);
    }
    final startDate = '${start.year}-${start.month.toString().padLeft(2, '0')}-${start.day.toString().padLeft(2, '0')}';
    return {'startDate': startDate, 'endDate': endDate};
  }

  void onPeriodChanged(String period) {
    if (selectedPeriod.value == period) return;
    selectedPeriod.value = period;
    fetchDashboardData();
  }

  Future<void> fetchDashboardData() async {
    isLoading.value = true;
    try {
      final periodParams = _getPeriodParams(selectedPeriod.value);

      // 1. Fetch KPIs with period params matching Admin Panel
      final kpiRes = await HttpClientService.to.get<Map<String, dynamic>>(
        ApiConstants.financeKpis,
        queryParams: periodParams.isNotEmpty ? periodParams : null,
        requiresAuth: true,
        create: (data) => data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{},
      );

      if (kpiRes.success && kpiRes.data != null && kpiRes.data!.isNotEmpty) {
        final raw = kpiRes.data!;
        final kpiMap = raw['kpis'] is Map
            ? Map<String, dynamic>.from(raw['kpis'] as Map)
            : raw['data'] is Map
                ? Map<String, dynamic>.from(raw['data'] as Map)
                : raw['summary'] is Map
                    ? Map<String, dynamic>.from(raw['summary'] as Map)
                    : raw;
        final parsed = FinanceKpiModel.fromJson(kpiMap);
        kpis.value = parsed;
        totalRevenueStr.value = formatCurrency(parsed.totalRevenue);
        totalInvoicesStr.value = formatNumber(parsed.totalInvoices);
        totalPaymentsStr.value = formatCurrency(parsed.totalPayments);
        pendingInvoicesStr.value = formatNumber(parsed.pendingInvoices);
      } else {
        kpis.value = const FinanceKpiModel();
        totalRevenueStr.value = '₹0';
        totalInvoicesStr.value = '0';
        totalPaymentsStr.value = '₹0';
        pendingInvoicesStr.value = '0';
      }

      // 2. Fetch Recent Invoices (limit: 5 matching Admin Panel)
      final invRes = await FinanceService.to.getInvoices(limit: 5, page: 1);
      if (invRes.success && invRes.data != null) {
        dynamic items = invRes.data;
        if (items is Map && items.containsKey('rows')) {
          items = items['rows'];
        } else if (items is Map && items.containsKey('items')) {
          items = items['items'];
        }
        if (items is List && items.isNotEmpty) {
          recentInvoices.assignAll(
            items.take(5).map((e) => FinanceDashboardInvoiceItem.fromJson(Map<String, dynamic>.from(e as Map))).toList(),
          );
        } else {
          recentInvoices.clear();
        }
      } else {
        recentInvoices.clear();
      }

      // 3. Fetch Active Subscriptions (limit: 5, status: 'active' matching Admin Panel)
      final subRes = await FinanceService.to.getSubscriptions(limit: 5, page: 1, status: 'active');
      if (subRes.success && subRes.data != null) {
        dynamic items = subRes.data;
        if (items is Map && items.containsKey('rows')) {
          items = items['rows'];
        } else if (items is Map && items.containsKey('items')) {
          items = items['items'];
        }
        if (items is List && items.isNotEmpty) {
          activeSubscriptions.assignAll(
            items.take(5).map((e) => FinanceDashboardSubscriptionItem.fromJson(Map<String, dynamic>.from(e as Map))).toList(),
          );
        } else {
          activeSubscriptions.clear();
        }
      } else {
        activeSubscriptions.clear();
      }
    } catch (_) {
      // In case of error, preserve existing or clear gracefully
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> onRefresh() async {
    isRefreshing.value = true;
    try {
      await fetchDashboardData();
      Get.snackbar(
        'dashboard_refreshed'.tr,
        'metrics_updated_desc'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF1E293B),
        colorText: Colors.white,
        duration: const Duration(seconds: 2),
      );
    } catch (_) {
      Get.snackbar(
        'error'.tr,
        'dashboard_refresh_failed'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF7F1D1D),
        colorText: Colors.white,
        duration: const Duration(seconds: 2),
      );
    } finally {
      isRefreshing.value = false;
    }
  }

  String formatCurrency(num amount) {
    try {
      return NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0).format(amount);
    } catch (_) {
      return '₹${amount.toStringAsFixed(0)}';
    }
  }

  String formatNumber(num count) {
    try {
      return NumberFormat.decimalPattern('en_IN').format(count);
    } catch (_) {
      return count.toString();
    }
  }

  // ---------------- Navigation Actions ----------------
  void onMenuTap() {
    if (Get.isRegistered<FinanceDashboardController>()) {
      Get.find<FinanceDashboardController>().openDrawer();
    }
  }

  void onCreateInvoiceTap() {
    Get.toNamed(Routes.GENERATE_INVOICE);
  }

  void onNotificationTap() {
    Get.toNamed(Routes.FINANCE_NOTIFICATIONS);
  }

  void navigateToTab(int index) {
    if (Get.isRegistered<FinanceDashboardController>()) {
      Get.find<FinanceDashboardController>().onNavItemTapped(index);
    }
  }
}
