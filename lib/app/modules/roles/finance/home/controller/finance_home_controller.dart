import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/services/finance_service.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';
import '../../finance_dashboard/controller/finance_dashboard_controller.dart';
import '../../../../../routes/app_routes.dart';
import '../../invoice/model/invoice_model.dart';
import '../../subscriptions/model/subscription_model.dart';
import '../models/finance_home_models.dart';

class FinanceHomeController extends GetxController {
  // ---------------- Header ----------------
  final RxString userName = 'Finance Officer'.obs;
  final RxInt notificationCount = 1.obs;
  final RxString userInitial = 'F'.obs;

  // ---------------- Loading ----------------
  final RxBool isLoading = false.obs;

  // ---------------- 4 Primary KPIs (Mirroring React Admin Panel) ----------------
  final RxString totalRevenueStr = '₹0'.obs;
  final RxString totalInvoicesStr = '0'.obs;
  final RxString totalPaymentsStr = '₹0'.obs;
  final RxString pendingInvoicesStr = '0'.obs;

  // Legacy list for backwards compatibility
  final RxList<FinancialStat> financialStats = <FinancialStat>[].obs;
  final RxList<FinanceQuickAction> quickActions = <FinanceQuickAction>[].obs;
  final RxList<KeyInsight> keyInsights = <KeyInsight>[].obs;

  // ---------------- Recent Invoices & Active Subscriptions ----------------
  final RxList<InvoiceModel> recentInvoices = <InvoiceModel>[].obs;
  final RxList<Subscription> activeSubscriptions = <Subscription>[].obs;

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

  Future<void> fetchDashboardData() async {
    isLoading.value = true;
    try {
      // 1. Fetch KPIs from real API
      final kpiRes = await FinanceService.to.getKpis();
      if (kpiRes.success && kpiRes.data != null && kpiRes.data!.isNotEmpty) {
        _populateKpis(kpiRes.data!);
      } else {
        totalRevenueStr.value = '₹0';
        totalInvoicesStr.value = '0';
        totalPaymentsStr.value = '₹0';
        pendingInvoicesStr.value = '0';
      }

      // 2. Fetch Recent Invoices from real API
      final invRes = await FinanceService.to.getInvoices(limit: 3);
      if (invRes.success && invRes.data != null) {
        dynamic items = invRes.data;
        if (items is Map && items.containsKey('rows')) {
          items = items['rows'];
        } else if (items is Map && items.containsKey('items')) {
          items = items['items'];
        }
        if (items is List && items.isNotEmpty) {
          recentInvoices.assignAll(
            items.take(3).map((e) => InvoiceModel.fromJson(Map<String, dynamic>.from(e as Map))).toList(),
          );
        } else {
          recentInvoices.clear();
        }
      } else {
        recentInvoices.clear();
      }

      // 3. Fetch Active Subscriptions from real API
      final subRes = await FinanceService.to.getSubscriptions();
      if (subRes.success && subRes.data != null) {
        dynamic items = subRes.data;
        if (items is Map && items.containsKey('rows')) {
          items = items['rows'];
        } else if (items is Map && items.containsKey('items')) {
          items = items['items'];
        }
        if (items is List && items.isNotEmpty) {
          activeSubscriptions.assignAll(
            items.take(3).map((e) => Subscription.fromJson(Map<String, dynamic>.from(e as Map))).toList(),
          );
        } else {
          activeSubscriptions.clear();
        }
      } else {
        activeSubscriptions.clear();
      }
    } catch (e) {
      recentInvoices.clear();
      activeSubscriptions.clear();
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> onRefresh() async => fetchDashboardData();

  String _formatCurrency(num amount) {
    if (amount >= 10000000) {
      return '₹${(amount / 10000000).toStringAsFixed(2)} Cr';
    } else if (amount >= 100000) {
      return '₹${(amount / 100000).toStringAsFixed(2)} L';
    } else {
      return '₹${amount.toStringAsFixed(0)}';
    }
  }

  void _populateKpis(Map<String, dynamic> data) {
    final totalRev = double.tryParse((data['total_revenue'] ?? data['totalRevenue'] ?? data['total_revenue_ytd'] ?? 0).toString().replaceAll(',', '')) ?? 0.0;
    final totalInv = double.tryParse((data['total_invoices'] ?? data['totalInvoices'] ?? 0).toString().replaceAll(',', '')) ?? 0.0;
    final totalPay = double.tryParse((data['total_payments'] ?? data['totalPayments'] ?? 0).toString().replaceAll(',', '')) ?? 0.0;
    final pendingInv = double.tryParse((data['pending_invoices'] ?? data['pendingInvoices'] ?? data['overdue_invoices_count'] ?? data['outstanding_invoices_count'] ?? 0).toString().replaceAll(',', '')) ?? 0.0;

    totalRevenueStr.value = _formatCurrency(totalRev);
    totalInvoicesStr.value = totalInv.toInt().toString();
    totalPaymentsStr.value = _formatCurrency(totalPay);
    pendingInvoicesStr.value = pendingInv.toInt().toString();
  }

  // ---------------- User Navigation Actions ----------------
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
