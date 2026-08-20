import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../models/finance_home_models.dart';

class FinanceHomeController extends GetxController {
  // ---------------- Header ----------------
  final RxString userName = 'Finance User'.obs;
  final RxInt notificationCount = 1.obs;
  final RxString userInitial = 'F'.obs;

  // ---------------- Loading ----------------
  final RxBool isLoading = false.obs;

  // ---------------- Date range ----------------
  final RxString dateRangeText = '01 Aug 2026 - 07 Aug 2026'.obs;

  // ---------------- Financial Overview ----------------
  final RxList<FinancialStat> financialStats = <FinancialStat>[].obs;

  // ---------------- Quick Actions ----------------
  final RxList<FinanceQuickAction> quickActions = <FinanceQuickAction>[].obs;

  // ---------------- Key Insights ----------------
  final RxList<KeyInsight> keyInsights = <KeyInsight>[].obs;

  @override
  void onInit() {
    super.onInit();
    fetchDashboardData();
  }

  Future<void> fetchDashboardData() async {
    isLoading.value = true;
    try {
      // TODO: replace with real API/repository calls
      _loadFinancialStats();
      _loadQuickActions();
      _loadKeyInsights();
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> onRefresh() async => fetchDashboardData();

  void _loadFinancialStats() {
    financialStats.assignAll([
      FinancialStat(
        label: 'Total Revenue',
        value: '\u20b948,75,000',
        trendPercent: 12.6,
        isPositive: true,
        icon: Icons.account_balance_wallet_outlined,
        color: const Color(0xFFB042FF),
      ),
      FinancialStat(
        label: 'Total Invoices',
        value: '156',
        trendPercent: 8.3,
        isPositive: true,
        icon: Icons.description_outlined,
        color: const Color(0xFF3F7BF5),
      ),
      FinancialStat(
        label: 'Total Payments',
        value: '\u20b942,10,000',
        trendPercent: 10.2,
        isPositive: true,
        icon: Icons.account_balance_outlined,
        color: const Color(0xFF2ECC71),
      ),
      FinancialStat(
        label: 'Pending Amount',
        value: '\u20b96,65,000',
        trendPercent: 5.4,
        isPositive: false,
        icon: Icons.access_time,
        color: const Color(0xFFFFA726),
      ),
    ]);
  }

  void _loadQuickActions() {
    quickActions.assignAll([
      FinanceQuickAction(
        title: 'Manage Subscriptions',
        subtitle: 'View and manage all subscriptions',
        icon: Icons.calendar_month_outlined,
        color: const Color(0xFFB042FF),
        route: '/subscriptions',
      ),
      FinanceQuickAction(
        title: 'Generate Invoices',
        subtitle: 'Create and manage invoices',
        icon: Icons.receipt_long_outlined,
        color: const Color(0xFF3F7BF5),
        route: '/invoices/create',
      ),
      FinanceQuickAction(
        title: 'Monitor Payments',
        subtitle: 'Track and monitor payments',
        icon: Icons.payments_outlined,
        color: const Color(0xFF2ECC71),
        route: '/payments',
      ),
      FinanceQuickAction(
        title: 'Revenue Reporting',
        subtitle: 'View revenue reports and analytics',
        icon: Icons.bar_chart_outlined,
        color: const Color(0xFFFFA726),
        route: '/revenue-reports',
      ),
      FinanceQuickAction(
        title: 'GST Management',
        subtitle: 'Manage GST filings and returns',
        icon: Icons.request_quote_outlined,
        color: const Color(0xFF2EC4C4),
        route: '/gst-management',
      ),
      FinanceQuickAction(
        title: 'Financial Reconciliation',
        subtitle: 'Reconcile transactions and accounts',
        icon: Icons.balance_outlined,
        color: const Color(0xFFE0507A),
        route: '/reconciliation',
      ),
    ]);
  }

  void _loadKeyInsights() {
    keyInsights.assignAll([
      KeyInsight(
        title: 'Revenue this month',
        subtitle: 'vs last month',
        value: '\u20b91,95,00,000',
        trendPercent: 15.7,
        isPositive: true,
        icon: Icons.trending_up,
        color: const Color(0xFFB042FF),
      ),
      KeyInsight(
        title: 'Invoices this month',
        subtitle: 'vs last month',
        value: '452',
        trendPercent: 11.4,
        isPositive: true,
        icon: Icons.description_outlined,
        color: const Color(0xFF3F7BF5),
      ),
      KeyInsight(
        title: 'Payments received',
        subtitle: 'vs last month',
        value: '\u20b91,80,25,000',
        trendPercent: 13.2,
        isPositive: true,
        icon: Icons.credit_card_outlined,
        color: const Color(0xFF2ECC71),
      ),
      KeyInsight(
        title: 'Outstanding amount',
        subtitle: 'vs last month',
        value: '\u20b96,65,000',
        trendPercent: 5.4,
        isPositive: false,
        icon: Icons.error_outline,
        color: const Color(0xFFFFA726),
      ),
    ]);
  }

  // ---------------- Actions ----------------
  void onMenuTap() {
    // TODO: open drawer / navigation menu
  }

  void onDateRangeTap() {
    // TODO: open a date-range picker and update dateRangeText
  }

  void onOverviewInfoTap() {
    // TODO: show a tooltip/sheet explaining the Financial Overview metrics
  }

  void onNotificationTap() {
    Get.toNamed('/notifications');
  }

  void onProfileTap() {
    Get.toNamed('/profile');
  }

  void onQuickActionTap(FinanceQuickAction action) {
    Get.toNamed(action.route);
  }

  void onInsightTap(KeyInsight insight) {
    // TODO: navigate to the relevant detailed report screen
  }

  void onViewAllInsights() {
    Get.toNamed('/revenue-reports');
  }
}
