import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:vmovexa/app/modules/roles/finance/invoice/controller/invoice_controller.dart';
import 'package:vmovexa/app/modules/roles/finance/invoice/model/invoice_model.dart';
import 'package:vmovexa/app/modules/roles/finance/invoice/view/invoice_list_item.dart';
import 'package:vmovexa/app/modules/roles/finance/invoice/view/summary_stat_card.dart';
import 'package:vmovexa/app/theme/app_theme.dart';

import '../../../../../theme/app_colors.dart';


class InvoiceView extends GetView<InvoiceController> {
  const InvoiceView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Obx(() {
          if (controller.isLoading.value) {
            return const Center(
              child: CircularProgressIndicator(color: AppColors.primaryButtonBlue),
            );
          }
          return RefreshIndicator(
            color: AppColors.primaryButtonBlue,
            backgroundColor: AppColors.cardBg,
            onRefresh: controller.refreshInvoices,
    
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
              children: [
                _buildAppBar(),
                const SizedBox(height: 16),
                _buildSummaryCard(context),
                const SizedBox(height: 16),
                _buildInvoiceListHeader(context),
                const SizedBox(height: 12),
                _buildSearchBar(),
                const SizedBox(height: 12),
                _buildStatusTabs(),
                const SizedBox(height: 16),
                _buildTableHeader(),
                _buildInvoiceList(),
                const SizedBox(height: 12),
                _buildPagination(),
              ],
            ),
          );
        }),
      ),
    );
  }

  // ---------------- App Bar (Mirroring InvoicesListPage.jsx) ----------------
  Widget _buildAppBar() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              'finance_portal_breadcrumb'.tr,
              style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
            ),
            Text(
              'tax_invoices'.tr,
              style: const TextStyle(
                color: Color(0xFF60A5FA),
                fontSize: 11,
                fontWeight: FontWeight.w600,
              ),
            ),
            const Spacer(),
            IconButton(
              onPressed: controller.refreshInvoices,
              icon: const Icon(Icons.refresh, color: Colors.white70, size: 18),
              tooltip: 'refresh_invoices'.tr,
            ),
          ],
        ),
        const SizedBox(height: 2),
        Text(
          'tax_invoices_billing'.tr,
          style: GoogleFonts.raleway(
            color: AppColors.textPrimary,
            fontSize: 20,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.3,
          ),
        ),
        const SizedBox(height: 3),
        Text(
          'issue_gst_invoices_sub'.tr,
          style: GoogleFonts.raleway(
            color: AppColors.textSecondary,
            fontSize: 11.5,
          ),
        ),
      ],
    );
  }

  // ---------------- Summary Card ----------------
  Widget _buildSummaryCard(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'invoice_summary'.tr,
                style: GoogleFonts.raleway(
                  color: AppColors.textPrimary,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(width: 6),
              const Icon(Icons.info_outline, color: AppColors.textMuted, size: 14),
              const Spacer(),
            ],
          ),
          const SizedBox(height: 12),
          InkWell(
            onTap: () => controller.pickDateRange(context),
            borderRadius: BorderRadius.circular(8),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.inputBg,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.inputBorder),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.calendar_today_outlined,
                      color: AppColors.textSecondary, size: 14),
                  const SizedBox(width: 8),
                  Obx(() => Text(
                        controller.dateRangeLabel,
                        style: GoogleFonts.raleway(
                          color: AppColors.textPrimary,
                          fontSize: 12,
                        ),
                      )),
                  const SizedBox(width: 8),
                  const Icon(Icons.keyboard_arrow_down,
                      color: AppColors.textSecondary, size: 16),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          Obx(() {
            final s = controller.summary.value;
            return Row(
              children: [
                Expanded(
                  child: SummaryStatCard(
                    icon: Icons.description_outlined,
                    iconColor: AppColors.primaryButtonBlue,
                    label: 'total_invoices'.tr,
                    value: '${s.totalInvoices}',
                  ),
                ),
                Expanded(
                  child: SummaryStatCard(
                    icon: Icons.check_circle,
                    iconColor: AppColors.accentGreen,
                    label: 'paid_invoices'.tr,
                    value: '${s.paidCount}',
                    amountLabel: '₹${_formatCompact(s.paidAmount)}',
                    amountColor: AppColors.accentGreen,
                  ),
                ),
                Expanded(
                  child: SummaryStatCard(
                    icon: Icons.access_time_rounded,
                    iconColor: const Color(0xFFF59E0B),
                    label: 'pending_invoices'.tr,
                    value: '${s.pendingCount}',
                    amountLabel: '₹${_formatCompact(s.pendingAmount)}',
                    amountColor: const Color(0xFFF59E0B),
                  ),
                ),
                Expanded(
                  child: SummaryStatCard(
                    icon: Icons.cancel,
                    iconColor: const Color(0xFFEF4444),
                    label: 'overdue_invoices'.tr,
                    value: '${s.overdueCount}',
                    amountLabel: '₹${_formatCompact(s.overdueAmount)}',
                    amountColor: const Color(0xFFEF4444),
                  ),
                ),
              ],
            );
          }),
        ],
      ),
    );
  }

  String _formatCompact(double amount) {
    final s = amount.toStringAsFixed(0);
    final buffer = StringBuffer();
    final digits = s.split('').reversed.toList();
    for (int i = 0; i < digits.length; i++) {
      buffer.write(digits[i]);
      final pos = i + 1;
      if (pos == 3 || (pos > 3 && (pos - 3) % 2 == 0)) {
        if (i != digits.length - 1) buffer.write(',');
      }
    }
    return buffer.toString().split('').reversed.join();
  }

  // ---------------- List Header ----------------
  Widget _buildInvoiceListHeader(BuildContext context) {
    return Row(
      children: [
        Obx(() => Text(
              '${'all_invoices'.tr} (${controller.filteredInvoices.length})',
              style: GoogleFonts.raleway(
                color: AppColors.textPrimary,
                fontSize: 15,
                fontWeight: FontWeight.w700,
              ),
            )),
      ],
    );
  }

  // ---------------- Search ----------------
  Widget _buildSearchBar() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.inputBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.inputBorder),
      ),
      child: TextField(
        controller: controller.searchController,
        onChanged: controller.onSearchChanged,
        style: GoogleFonts.raleway(color: AppColors.textPrimary, fontSize: 13),
        decoration: InputDecoration(
          hintText: 'search_invoices_hint'.tr,
          hintStyle: GoogleFonts.raleway(
            color: AppColors.textMuted,
            fontSize: 13,
          ),
          prefixIcon: const Icon(Icons.search, color: AppColors.textMuted, size: 18),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 14),
        ),
      ),
    );
  }

  // ---------------- Status Tabs ----------------
  Widget _buildStatusTabs() {
    final tabs = [
      {'key': 'All', 'label': 'all_tab'.tr},
      {'key': 'Paid', 'label': 'paid_tab'.tr},
      {'key': 'Pending', 'label': 'pending_tab'.tr},
      {'key': 'Overdue', 'label': 'overdue_tab'.tr},
    ];
    return Obx(() {
      return SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: tabs.map((tab) {
            final tabKey = tab['key']!;
            final tabLabel = tab['label']!;
            final isSelected = controller.selectedStatusTab.value == tabKey;
            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: GestureDetector(
                onTap: () => controller.selectedStatusTab.value = tabKey,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
                  decoration: BoxDecoration(
                    gradient: isSelected ? AppTheme.primaryGradient : null,
                    color: isSelected ? null : AppColors.cardBg,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: isSelected ? Colors.transparent : AppColors.cardBorder,
                    ),
                    boxShadow: isSelected
                        ? [
                            BoxShadow(
                              color: AppTheme.gradientPink.withValues(alpha: 0.3),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ]
                        : null,
                  ),
                  child: Text(
                    tabLabel,
                    style: GoogleFonts.raleway(
                      color: isSelected ? Colors.white : AppColors.textSecondary,
                      fontSize: 12,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
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

  // ---------------- Table Header ----------------
  Widget _buildTableHeader() {
    TextStyle style = GoogleFonts.raleway(
      color: AppColors.textMuted,
      fontSize: 11,
      fontWeight: FontWeight.w600,
    );
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: Row(
        children: [
          const SizedBox(width: 48),
          Expanded(flex: 3, child: Text('invoice_id_col'.tr, style: style)),
          Expanded(flex: 2, child: Text('invoice_date_col'.tr, style: style)),
          Expanded(flex: 2, child: Text('amount_col'.tr, style: style)),
          Expanded(flex: 2, child: Text('status_col'.tr, style: style)),
          const SizedBox(width: 18),
        ],
      ),
    );
  }

  // ---------------- Invoice List ----------------
  Widget _buildInvoiceList() {
    return Obx(() {
      final items = controller.pagedInvoices;
      if (items.isEmpty) {
        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 32),
          child: Center(
            child: Text(
              'no_invoices_found'.tr,
              style: GoogleFonts.raleway(color: AppColors.textMuted),
            ),
          ),
        );
      }
      return Column(
        children: items
            .map((InvoiceModel inv) => InvoiceListItem(
                  invoice: inv,
                  onTap: () => controller.onInvoiceTap(inv),
                ))
            .toList(),
      );
    });
  }

  // ---------------- Pagination ----------------
  Widget _buildPagination() {
    return Obx(() {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            TextButton.icon(
              onPressed: controller.currentPage.value > 1
                  ? controller.previousPage
                  : null,
              icon: const Icon(Icons.chevron_left, size: 16),
              label: Text(
                'previous'.tr,
                style: GoogleFonts.raleway(fontSize: 12),
              ),
              style: TextButton.styleFrom(
                foregroundColor: controller.currentPage.value > 1
                    ? AppColors.textSecondary
                    : AppColors.textMuted,
              ),
            ),
            Text(
              '${'page_x_of_y'.tr} ${controller.currentPage.value} ${'of'.tr} ${controller.totalPages.value}',
              style: GoogleFonts.raleway(
                color: AppColors.textSecondary,
                fontSize: 12,
              ),
            ),
            TextButton(
              onPressed: controller.currentPage.value < controller.totalPages.value
                  ? controller.nextPage
                  : null,
              style: TextButton.styleFrom(
                foregroundColor: controller.currentPage.value < controller.totalPages.value
                    ? AppColors.textLink
                    : AppColors.textMuted,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('next'.tr, style: GoogleFonts.raleway(fontSize: 12,color: AppColors.accentPurple)),
                  const SizedBox(width: 2),
                  const Icon(Icons.chevron_right, size: 16,color: AppColors.accentPurple),
                ],
              ),
            ),
          ],
        ),
      );
    });
  }
}
