import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../routes/app_routes.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../widgets/custom_button.dart';
import '../../invoice/model/invoice_model.dart';
import '../../subscriptions/model/subscription_model.dart';
import '../controller/finance_home_controller.dart';

class FinanceHomeView extends GetView<FinanceHomeController> {
  const FinanceHomeView({super.key});

  static const Color kPrimaryBlue = Color(0xFF2563EB);
  static const Color kPrimaryIndigo = Color(0xFF6366F1);
  static const Color kDarkCardBg = Color(0xFF1E293B);
  static const Color kBorderColor = Color(0xFF334155);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Obx(
          () => controller.isLoading.value && controller.recentInvoices.isEmpty
              ? const Center(
                  child: CircularProgressIndicator(color: kPrimaryIndigo),
                )
              : RefreshIndicator(
                  color: kPrimaryIndigo,
                  backgroundColor: kDarkCardBg,
                  onRefresh: controller.onRefresh,
                  child: ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    children: [
                      _buildTopGreetingHeader(context),
                      const SizedBox(height: 20),
                      _build4PrimaryKpiCards(),
                      const SizedBox(height: 20),
                      _buildQuickShortcuts(),
                      const SizedBox(height: 20),
                      _buildRecentInvoicesCard(),
                      const SizedBox(height: 16),
                      _buildActiveSubscriptionsCard(),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
        ),
      ),
    );
  }

  // 1. Top Greeting Header (Mirroring React Admin Panel Header)
  Widget _buildTopGreetingHeader(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            // Hamburger Menu Icon
            InkWell(
              onTap: controller.onMenuTap,
              borderRadius: BorderRadius.circular(10),
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: kDarkCardBg,
                  borderRadius: BorderRadius.circular(10),
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
                      'Welcome, ${controller.userName.value}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -0.3,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const Text(
                    'Overview of your revenue, invoices, and payments',
                    style: TextStyle(
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
            // Refresh Button
            IconButton(
              onPressed: controller.onRefresh,
              icon: const Icon(Icons.refresh, color: Colors.white70, size: 20),
              tooltip: 'Refresh metrics',
              style: IconButton.styleFrom(
                backgroundColor: kDarkCardBg,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                  side: const BorderSide(color: kBorderColor),
                ),
              ),
            ),
          ],
        ),
        // const SizedBox(height: 12),
        // // Create Invoice Action Button (Blue CTA)
        // CustomButton(
        //   height: 40,
        //   text:  'Create Invoice',
        //   prefixIcon: const Icon(Icons.add, size: 18, color: Colors.white),
        //   isGradient: true,
        //   onTap:  () => controller.onCreateInvoiceTap(),
        // ),
        // SizedBox(
        //   width: double.infinity,
        //   child: ElevatedButton.icon(
        //     onPressed: controller.onCreateInvoiceTap,
        //     icon: const Icon(Icons.add, size: 18, color: Colors.white),
        //     label: const Text(
        //       'Create Invoice',
        //       style: TextStyle(
        //         color: Colors.white,
        //         fontSize: 13,
        //         fontWeight: FontWeight.bold,
        //       ),
        //     ),
        //     style: ElevatedButton.styleFrom(
        //       backgroundColor: kPrimaryBlue,
        //       padding: const EdgeInsets.symmetric(vertical: 11),
        //       shape: RoundedRectangleBorder(
        //         borderRadius: BorderRadius.circular(12),
        //       ),
        //       elevation: 0,
        //     ),
        //   ),
        // ),
      ],
    );
  }

  // 2. 4 Primary KPI Cards (Mirroring React Admin Panel KPI Grid)
  Widget _build4PrimaryKpiCards() {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: Obx(
                () => _buildKpiCard(
                  title: 'TOTAL REVENUE',
                  value: controller.totalRevenueStr.value,
                  subtitle: 'Total earnings',
                  icon: Icons.check_circle_outline,
                  accentColor: const Color(0xFF10B981), // Emerald
                  onTap: () => controller.navigateToTab(2),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Obx(
                () => _buildKpiCard(
                  title: 'TOTAL INVOICES',
                  value: controller.totalInvoicesStr.value,
                  subtitle: 'All issued bills',
                  icon: Icons.receipt_long_outlined,
                  accentColor: const Color(0xFF3B82F6), // Blue
                  onTap: () => controller.navigateToTab(1),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: Obx(
                () => _buildKpiCard(
                  title: 'TOTAL PAYMENTS',
                  value: controller.totalPaymentsStr.value,
                  subtitle: 'Completed payments',
                  icon: Icons.bar_chart_outlined,
                  accentColor: const Color(0xFF818CF8), // Indigo
                  onTap: () => controller.navigateToTab(2),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Obx(
                () => _buildKpiCard(
                  title: 'PENDING INVOICES',
                  value: controller.pendingInvoicesStr.value,
                  subtitle: 'Unpaid invoices',
                  icon: Icons.warning_amber_rounded,
                  accentColor: const Color(0xFFF59E0B), // Amber
                  onTap: () => controller.navigateToTab(1),
                ),
              ),
            ),
          ],
        ),
      ],
    );
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
                      color: accentColor.withValues(alpha: 0.9),
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.8,
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
                Text(
                  subtitle,
                  style: const TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 10.5,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Text(
                  '→',
                  style: TextStyle(
                    color: accentColor,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // 3. Quick Navigation Shortcuts (Invoices, Invoice Design, Payments, Reports)
  Widget _buildQuickShortcuts() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Quick Shortcuts',
          style: TextStyle(
            color: Colors.white,
            fontSize: 13,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: _buildShortcutButton(
                title: 'Invoices',
                subtitle: 'Manage bills',
                icon: Icons.receipt_long_outlined,
                color: const Color(0xFF3B82F6),
                onTap: () => controller.navigateToTab(1),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildShortcutButton(
                title: 'Invoice Design',
                subtitle: 'Templates',
                icon: Icons.design_services_outlined,
                color: const Color(0xFF818CF8),
                onTap: () => controller.onCreateInvoiceTap(),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: _buildShortcutButton(
                title: 'Payments',
                subtitle: 'Settled ledger',
                icon: Icons.payments_outlined,
                color: const Color(0xFF10B981),
                onTap: () => controller.navigateToTab(2),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildShortcutButton(
                title: 'Reports',
                subtitle: 'Revenue insights',
                icon: Icons.bar_chart_outlined,
                color: const Color(0xFFA855F7),
                onTap: () => Get.toNamed(Routes.REVENUE_REPORTING),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildShortcutButton({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
        decoration: BoxDecoration(
          color: kDarkCardBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: kBorderColor),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(7),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: color, size: 16),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11.5,
                      fontWeight: FontWeight.w700,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      color: AppColors.textMuted,
                      fontSize: 9.5,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // 4. Recent Invoices Card (Mirroring React Admin Panel Recent Invoices Grid)
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
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Recent Invoices',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.5,
                    ),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'Latest bills and their payment status',
                    style: TextStyle(
                      color: AppColors.textMuted,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
              TextButton(
                onPressed: () => controller.navigateToTab(1),
                child: const Text(
                  'View All →',
                  style: TextStyle(
                    color: Color(0xFF60A5FA),
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
          const Divider(color: kBorderColor, height: 20),
          Obx(() {
            if (controller.recentInvoices.isEmpty) {
              return const Padding(
                padding: EdgeInsets.symmetric(vertical: 20),
                child: Center(
                  child: Text(
                    'No invoices found',
                    style: TextStyle(color: AppColors.textMuted, fontSize: 12),
                  ),
                ),
              );
            }
            return Column(
              children: controller.recentInvoices.map((inv) {
                final statusStr = inv.status.label;
                final statusColor = inv.status.color;
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
                                  inv.id,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                    fontFamily: 'monospace',
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    inv.company,
                                    style: const TextStyle(
                                      color: Colors.white70,
                                      fontSize: 12,
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
                              'Issued: ${inv.invoiceDate.day.toString().padLeft(2, '0')}/${inv.invoiceDate.month.toString().padLeft(2, '0')}/${inv.invoiceDate.year}',
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
                            '₹${inv.amount.toStringAsFixed(0)}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12.5,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: statusColor.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(color: statusColor.withValues(alpha: 0.4)),
                            ),
                            child: Text(
                              statusStr,
                              style: TextStyle(
                                color: statusColor,
                                fontSize: 9.5,
                                fontWeight: FontWeight.w700,
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
          const SizedBox(height: 8),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () => controller.navigateToTab(1),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: kBorderColor),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                padding: const EdgeInsets.symmetric(vertical: 10),
              ),
              child: const Text(
                'View All Invoices →',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // 5. Active Subscriptions Card (Mirroring React Admin Panel Subscriptions Grid)
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
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Active Subscriptions',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.5,
                    ),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'Active client subscription plans',
                    style: TextStyle(
                      color: AppColors.textMuted,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
              TextButton(
                onPressed: () => controller.navigateToTab(3),
                child: const Text(
                  'View All →',
                  style: TextStyle(
                    color: Color(0xFF60A5FA),
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
          const Divider(color: kBorderColor, height: 20),
          Obx(() {
            if (controller.activeSubscriptions.isEmpty) {
              return const Padding(
                padding: EdgeInsets.symmetric(vertical: 20),
                child: Center(
                  child: Text(
                    'No subscriptions found',
                    style: TextStyle(color: AppColors.textMuted, fontSize: 12),
                  ),
                ),
              );
            }
            return Column(
              children: controller.activeSubscriptions.map((sub) {
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
                                    sub.companyName,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w700,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF6366F1).withValues(alpha: 0.2),
                                    borderRadius: BorderRadius.circular(4),
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
                              'Cycle: ${sub.dateRangeText}',
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
                            '${sub.userCount} buses',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFF10B981).withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                            ),
                            child: Text(
                              sub.status.label,
                              style: const TextStyle(
                                color: Color(0xFF34D399),
                                fontSize: 9.5,
                                fontWeight: FontWeight.w700,
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
          const SizedBox(height: 8),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () => controller.navigateToTab(3),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: kBorderColor),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                padding: const EdgeInsets.symmetric(vertical: 10),
              ),
              child: const Text(
                'View All Subscriptions →',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
