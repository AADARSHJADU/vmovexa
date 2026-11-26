import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import '../../../../../routes/app_routes.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../theme/app_theme.dart';
import '../controller/finance_home_controller.dart';

class FinanceHomeView extends GetView<FinanceHomeController> {
  const FinanceHomeView({super.key});

  static const Color kDarkCardBg = Color(0xFF1E293B);
  static const Color kBorderColor = Color(0xFF334155);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Obx(
          () => controller.isLoading.value && controller.recentInvoices.isEmpty && controller.kpis.value.totalRevenue == 0
              ? const Center(
                  child: CircularProgressIndicator(
                    color: AppTheme.gradientBlue,
                  ),
                )
              : RefreshIndicator(
                  color: AppTheme.gradientBlue,
                  backgroundColor: kDarkCardBg,
                  onRefresh: controller.onRefresh,
                  child: ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    physics: const AlwaysScrollableScrollPhysics(),
                    children: [
                      _buildTopGreetingHeader(context),
                      const SizedBox(height: 16),
                      _buildPeriodFilterRow(),
                      const SizedBox(height: 18),
                      _build4PrimaryKpiCards(),
                      const SizedBox(height: 18),
                      _buildRevenueBySourceCard(),
                      const SizedBox(height: 18),
                      _buildSavedTaxBreakdownCard(),
                      const SizedBox(height: 18),
                      _buildRecentInvoicesCard(),
                      const SizedBox(height: 18),
                      _buildActiveSubscriptionsCard(),
                      const SizedBox(height: 28),
                    ],
                  ),
                ),
        ),
      ),
    );
  }

  // ==========================================================
  // 1. Top Greeting Header (Welcome, User + Actions)
  // ==========================================================
  Widget _buildTopGreetingHeader(BuildContext context) {
    return Row(
      children: [
        // Hamburger Menu Icon with subtle gradient glow
        InkWell(
          onTap: controller.onMenuTap,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.all(9),
            decoration: BoxDecoration(
              color: kDarkCardBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: kBorderColor),
            ),
            child: const Icon(Icons.menu, color: Colors.white, size: 22),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Obx(
                () => Text(
                  '${'welcome_comma'.tr}${controller.userName.value}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 17,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.3,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                'overview_revenue_sub'.tr,
                style: const TextStyle(
                  color: AppColors.textMuted,
                  fontSize: 11.5,
                  fontWeight: FontWeight.w500,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
        const SizedBox(width: 8),
        // Refresh Action Button with AppTheme.primaryGradient glow
        Obx(
          () => InkWell(
            onTap: controller.isRefreshing.value ? null : controller.onRefresh,
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: const EdgeInsets.all(9),
              decoration: BoxDecoration(
                color: kDarkCardBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: kBorderColor),
              ),
              child: controller.isRefreshing.value
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: AppTheme.gradientPink,
                      ),
                    )
                  : const Icon(Icons.refresh, color: Colors.white, size: 20),
            ),
          ),
        ),
      ],
    );
  }

  // ==========================================================
  // 2. Period Filter Pills (All time, This month, This quarter, This year)
  // ==========================================================
  Widget _buildPeriodFilterRow() {
    final periods = [
      {'key': 'all', 'label': 'all_time'.tr},
      {'key': 'month', 'label': 'this_month'.tr},
      {'key': 'quarter', 'label': 'this_quarter'.tr},
      {'key': 'year', 'label': 'this_year'.tr},
    ];

    return Obx(() {
      final current = controller.selectedPeriod.value;
      return SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        child: Row(
          children: periods.map((p) {
            final isSelected = current == p['key'];
            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: InkWell(
                onTap: () => controller.onPeriodChanged(p['key']!),
                borderRadius: BorderRadius.circular(20),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                  decoration: BoxDecoration(
                    gradient: isSelected ? AppTheme.primaryGradient : null,
                    color: isSelected ? null : kDarkCardBg,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: isSelected ? Colors.transparent : kBorderColor,
                    ),
                    boxShadow: isSelected
                        ? [
                            BoxShadow(
                              color: AppTheme.gradientBlue.withValues(alpha: 0.35),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ]
                        : null,
                  ),
                  child: Text(
                    p['label']!,
                    style: TextStyle(
                      color: isSelected ? Colors.white : AppColors.textMuted,
                      fontSize: 11.5,
                      fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      );
    });
  }

  // ==========================================================
  // 3. 4 Primary KPI Cards (Exact Mirror of FinanceDashboardPage.jsx)
  // ==========================================================
  Widget _build4PrimaryKpiCards() {
    return Obx(() {
      final k = controller.kpis.value;
      return Column(
        children: [
          Row(
            children: [
              // Card 1: Collected Revenue
              Expanded(
                child: _buildKpiCard(
                  title: 'collected_revenue'.tr,
                  value: controller.formatCurrency(k.totalRevenue),
                  subtitle: '${'base'.tr} ${controller.formatCurrency(k.baseRevenue)} + ${'tax_plus'.tr} ${controller.formatCurrency(k.taxCollected)}',
                  icon: Icons.check_circle_outline,
                  accentColor: const Color(0xFF10B981),
                  onTap: () => controller.navigateToTab(2), // Payments tab
                ),
              ),
              const SizedBox(width: 12),
              // Card 2: Total Invoices
              Expanded(
                child: _buildKpiCard(
                  title: 'total_invoices_label'.tr,
                  value: controller.formatNumber(k.totalInvoices),
                  subtitle: '${controller.formatNumber(k.paidInvoices)} ${'paid_invoices_count'.tr}',
                  icon: Icons.receipt_long_outlined,
                  accentColor: const Color(0xFF3B82F6),
                  onTap: () => controller.navigateToTab(1), // Invoices tab
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              // Card 3: Successful Payments
              Expanded(
                child: _buildKpiCard(
                  title: 'successful_payments'.tr,
                  value: controller.formatCurrency(k.totalPayments),
                  subtitle: '${controller.formatNumber(k.successfulPayments)} ${'ledger_entries_count'.tr}',
                  icon: Icons.bar_chart_outlined,
                  accentColor: const Color(0xFF818CF8),
                  onTap: () => controller.navigateToTab(2), // Payments tab
                ),
              ),
              const SizedBox(width: 12),
              // Card 4: Outstanding Receivables
              Expanded(
                child: _buildKpiCard(
                  title: 'outstanding_receivables'.tr,
                  value: controller.formatCurrency(k.pendingAmount),
                  subtitle: '${controller.formatNumber(k.pendingInvoices)} ${'pending_dot'.tr} ${controller.formatNumber(k.overdueInvoices)} ${'overdue_suffix'.tr}',
                  icon: Icons.warning_amber_rounded,
                  accentColor: const Color(0xFFF59E0B),
                  onTap: () => controller.navigateToTab(1), // Invoices tab
                ),
              ),
            ],
          ),
        ],
      );
    });
  }

  Widget _buildKpiCard({
    required String title,
    required String value,
    required String subtitle,
    required IconData icon,
    required Color accentColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: kDarkCardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: kBorderColor),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    title,
                    style: TextStyle(
                      color: accentColor.withValues(alpha: 0.95),
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.6,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: accentColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: accentColor.withValues(alpha: 0.3),
                    ),
                  ),
                  child: Icon(icon, color: accentColor, size: 16),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              value,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w900,
                letterSpacing: -0.5,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 6),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    subtitle,
                    style: const TextStyle(
                      color: AppColors.textMuted,
                      fontSize: 10,
                      fontWeight: FontWeight.w500,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Icon(
                  Icons.arrow_forward_rounded,
                  color: accentColor,
                  size: 14,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // ==========================================================
  // 4. Revenue by Source Card (Exact Mirror of FinanceDashboardPage.jsx)
  // ==========================================================
  Widget _buildRevenueBySourceCard() {
    return Obx(() {
      final k = controller.kpis.value;
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: kDarkCardBg,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: kBorderColor),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'revenue_by_source'.tr,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.3,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'revenue_by_source_sub'.tr,
                        style: const TextStyle(
                          color: AppColors.textMuted,
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ),
                ShaderMask(
                  shaderCallback: (bounds) => AppTheme.primaryGradient.createShader(bounds),
                  child: const Icon(
                    Icons.pie_chart_outline_rounded,
                    color: Colors.white,
                    size: 20,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: _buildBreakdownTile(
                    label: 'advertising_campaigns'.tr,
                    amount: controller.formatCurrency(k.advertisingRevenue),
                    accentColor: const Color(0xFF3B82F6),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildBreakdownTile(
                    label: 'government_psa'.tr,
                    amount: controller.formatCurrency(k.governmentRevenue),
                    accentColor: const Color(0xFF8B5CF6),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: _buildBreakdownTile(
                    label: 'subscriptions_revenue'.tr,
                    amount: controller.formatCurrency(k.subscriptionRevenue),
                    accentColor: const Color(0xFF10B981),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildBreakdownTile(
                    label: 'other_revenue'.tr,
                    amount: controller.formatCurrency(k.otherRevenue),
                    accentColor: const Color(0xFF94A3B8),
                  ),
                ),
              ],
            ),
          ],
        ),
      );
    });
  }

  Widget _buildBreakdownTile({
    required String label,
    required String amount,
    required Color accentColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: accentColor.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: accentColor.withValues(alpha: 0.25),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              color: accentColor.withValues(alpha: 0.9),
              fontSize: 9.5,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.3,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 6),
          Text(
            amount,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.w900,
              fontFamily: 'monospace',
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // ==========================================================
  // 5. Saved Tax Breakdown Card (Exact Mirror of FinanceDashboardPage.jsx)
  // ==========================================================
  Widget _buildSavedTaxBreakdownCard() {
    return Obx(() {
      final k = controller.kpis.value;
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: kDarkCardBg,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: kBorderColor),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'saved_tax_breakdown'.tr,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.3,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'saved_tax_breakdown_sub'.tr,
                        style: const TextStyle(
                          color: AppColors.textMuted,
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ),
                InkWell(
                  onTap: () => Get.toNamed(Routes.GST_MANAGEMENT),
                  borderRadius: BorderRadius.circular(8),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                    child: ShaderMask(
                      shaderCallback: (bounds) => AppTheme.primaryGradient.createShader(bounds),
                      child: Text(
                        'gst_ledger_arrow'.tr,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11.5,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            _buildTaxRow('base_revenue_label'.tr, controller.formatCurrency(k.baseRevenue)),
            const SizedBox(height: 8),
            _buildTaxRow('CGST', controller.formatCurrency(k.cgst)),
            const SizedBox(height: 8),
            _buildTaxRow('SGST', controller.formatCurrency(k.sgst)),
            const SizedBox(height: 8),
            _buildTaxRow('IGST', controller.formatCurrency(k.igst)),
            const Divider(color: kBorderColor, height: 18),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'total_collected'.tr,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                Text(
                  controller.formatCurrency(k.totalRevenue),
                  style: const TextStyle(
                    color: Color(0xFF34D399),
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                    fontFamily: 'monospace',
                  ),
                ),
              ],
            ),
          ],
        ),
      );
    });
  }

  Widget _buildTaxRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: AppColors.textMuted,
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 12.5,
            fontWeight: FontWeight.w700,
            fontFamily: 'monospace',
          ),
        ),
      ],
    );
  }

  // ==========================================================
  // 6. Recent Invoices Card (Top 5 Real Invoices from Backend)
  // ==========================================================
  Widget _buildRecentInvoicesCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: kDarkCardBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: kBorderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'recent_invoices'.tr,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.3,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'latest_bills_sub'.tr,
                      style: const TextStyle(
                        color: AppColors.textMuted,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
              InkWell(
                onTap: () => controller.navigateToTab(1),
                borderRadius: BorderRadius.circular(8),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                  child: ShaderMask(
                    shaderCallback: (bounds) => AppTheme.primaryGradient.createShader(bounds),
                    child: Text(
                      'view_all_arrow'.tr,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11.5,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const Divider(color: kBorderColor, height: 20),
          Obx(() {
            if (controller.recentInvoices.isEmpty) {
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 20),
                child: Center(
                  child: Text(
                    'no_invoices_generated'.tr,
                    style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                  ),
                ),
              );
            }
            return Column(
              children: controller.recentInvoices.map((inv) {
                final isPaid = inv.status == 'paid';
                final isOverdue = inv.status == 'overdue';
                final statusBg = isPaid
                    ? const Color(0x2610B981)
                    : isOverdue
                        ? const Color(0x26EF4444)
                        : const Color(0x26F59E0B);
                final statusColor = isPaid
                    ? const Color(0xFF34D399)
                    : isOverdue
                        ? const Color(0xFFF87171)
                        : const Color(0xFFFBBF24);
                final statusLabel = isPaid
                    ? 'paid'.tr
                    : isOverdue
                        ? 'overdue'.tr
                        : 'unpaid'.tr;

                final dateStr = inv.issuedAt != null
                    ? DateFormat('dd MMM yyyy').format(inv.issuedAt!)
                    : '—';

                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  inv.code,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 11.5,
                                    fontWeight: FontWeight.w800,
                                    fontFamily: 'monospace',
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    inv.customerName,
                                    style: const TextStyle(
                                      color: Colors.white70,
                                      fontSize: 11.5,
                                      fontWeight: FontWeight.w600,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 3),
                            Text(
                              '${'issued_colon'.tr}$dateStr',
                              style: const TextStyle(
                                color: AppColors.textMuted,
                                fontSize: 10.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            controller.formatCurrency(inv.total),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12.5,
                              fontWeight: FontWeight.w900,
                              fontFamily: 'monospace',
                            ),
                          ),
                          const SizedBox(height: 3),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                            decoration: BoxDecoration(
                              color: statusBg,
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(color: statusColor.withValues(alpha: 0.35)),
                            ),
                            child: Text(
                              statusLabel,
                              style: TextStyle(
                                color: statusColor,
                                fontSize: 9.5,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              }).toList(),
            );
          }),
          const SizedBox(height: 10),
          // View All Button with primaryGradient accent
          InkWell(
            onTap: () => controller.navigateToTab(1),
            borderRadius: BorderRadius.circular(12),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 10),
              decoration: BoxDecoration(
                color: kDarkCardBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.gradientBlue.withValues(alpha: 0.4)),
              ),
              child: Center(
                child: ShaderMask(
                  shaderCallback: (bounds) => AppTheme.primaryGradient.createShader(bounds),
                  child: Text(
                    'view_all_invoices_arrow'.tr,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================================
  // 7. Active Subscriptions Card (Top 5 Active Client Subscriptions)
  // ==========================================================
  Widget _buildActiveSubscriptionsCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: kDarkCardBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: kBorderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'active_subscriptions'.tr,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.3,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'active_client_plans_sub'.tr,
                      style: const TextStyle(
                        color: AppColors.textMuted,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
              InkWell(
                onTap: () => controller.navigateToTab(3),
                borderRadius: BorderRadius.circular(8),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                  child: ShaderMask(
                    shaderCallback: (bounds) => AppTheme.primaryGradient.createShader(bounds),
                    child: Text(
                      'view_all_arrow'.tr,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11.5,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const Divider(color: kBorderColor, height: 20),
          Obx(() {
            if (controller.activeSubscriptions.isEmpty) {
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 20),
                child: Center(
                  child: Text(
                    'no_active_subscriptions'.tr,
                    style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                  ),
                ),
              );
            }
            return Column(
              children: controller.activeSubscriptions.map((sub) {
                final cycleDisplay = sub.billingCycle.isNotEmpty
                    ? sub.billingCycle.capitalizeFirst ?? sub.billingCycle
                    : 'monthly_cycle'.tr;

                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    sub.organizationName,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w800,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF6366F1).withValues(alpha: 0.18),
                                    borderRadius: BorderRadius.circular(4),
                                    border: Border.all(color: const Color(0xFF6366F1).withValues(alpha: 0.35)),
                                  ),
                                  child: Text(
                                    sub.planName,
                                    style: const TextStyle(
                                      color: Color(0xFFA5B4FC),
                                      fontSize: 9.5,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 3),
                            Text(
                              '${'cycle_colon'.tr}$cycleDisplay',
                              style: const TextStyle(
                                color: AppColors.textMuted,
                                fontSize: 10.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            controller.formatCurrency(sub.amount),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12.5,
                              fontWeight: FontWeight.w900,
                              fontFamily: 'monospace',
                            ),
                          ),
                          const SizedBox(height: 3),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0x2610B981),
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                            ),
                            child: Text(
                              sub.status.capitalizeFirst ?? 'Active',
                              style: const TextStyle(
                                color: Color(0xFF34D399),
                                fontSize: 9.5,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              }).toList(),
            );
          }),
          const SizedBox(height: 10),
          // View All Button with primaryGradient accent
          InkWell(
            onTap: () => controller.navigateToTab(3),
            borderRadius: BorderRadius.circular(12),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 10),
              decoration: BoxDecoration(
                color: kDarkCardBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.gradientPink.withValues(alpha: 0.4)),
              ),
              child: Center(
                child: ShaderMask(
                  shaderCallback: (bounds) => AppTheme.primaryGradient.createShader(bounds),
                  child: Text(
                    'view_all_subscriptions_arrow'.tr,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
