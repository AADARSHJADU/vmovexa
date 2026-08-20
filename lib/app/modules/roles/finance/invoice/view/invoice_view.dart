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

  // ---------------- App Bar ----------------
  Widget _buildAppBar() {
    return Row(
      children: [
        IconButton(
          onPressed: () => Get.back(),
          icon: const Icon(Icons.menu, color: AppColors.textPrimary),
        ),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Invoices',
                style: GoogleFonts.raleway(
                  color: AppColors.textPrimary,
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                ),
              ),
              Text(
                'View and manage all invoices',
                style: GoogleFonts.raleway(
                  color: AppColors.textSecondary,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
        IconButton(
          onPressed: () {},
          icon: const Icon(Icons.search, color: AppColors.accentPurple),
        ),
        IconButton(
          onPressed: controller.onFilterTap,
          icon: const Icon(Icons.tune, color: AppColors.accentPurple),
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
                'Invoice Summary',
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
                    label: 'Total Invoices',
                    value: '${s.totalInvoices}',
                  ),
                ),
                Expanded(
                  child: SummaryStatCard(
                    icon: Icons.check_circle,
                    iconColor: AppColors.accentGreen,
                    label: 'Paid Invoices',
                    value: '${s.paidCount}',
                    amountLabel: '₹${_formatCompact(s.paidAmount)}',
                    amountColor: AppColors.accentGreen,
                  ),
                ),
                Expanded(
                  child: SummaryStatCard(
                    icon: Icons.access_time_rounded,
                    iconColor: const Color(0xFFF59E0B),
                    label: 'Pending Invoices',
                    value: '${s.pendingCount}',
                    amountLabel: '₹${_formatCompact(s.pendingAmount)}',
                    amountColor: const Color(0xFFF59E0B),
                  ),
                ),
                Expanded(
                  child: SummaryStatCard(
                    icon: Icons.cancel,
                    iconColor: const Color(0xFFEF4444),
                    label: 'Overdue Invoices',
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
              'All Invoices (${controller.filteredInvoices.length})',
              style: GoogleFonts.raleway(
                color: AppColors.textPrimary,
                fontSize: 15,
                fontWeight: FontWeight.w700,
              ),
            )),
        const Spacer(),
        Container(
          height: 40,
          decoration: BoxDecoration(
            gradient: AppTheme.primaryGradient,
            borderRadius: BorderRadius.circular(10),
          ),
          child: ElevatedButton.icon(
            onPressed: controller.onGenerateInvoice,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.transparent,
              shadowColor: Colors.transparent,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              elevation: 0,
            ),
            icon: const Icon(Icons.add_circle_outline, size: 16),
            label: Text(
              'Generate Invoice',
              style: GoogleFonts.raleway(
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ),
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
          hintText: 'Search by invoice ID, company or amount...',
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
          Expanded(flex: 3, child: Text('Invoice ID', style: style)),
          Expanded(flex: 2, child: Text('Invoice Date', style: style)),
          Expanded(flex: 2, child: Text('Amount', style: style)),
          Expanded(flex: 2, child: Text('Status', style: style)),
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
              'No invoices found',
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
                'Previous',
                style: GoogleFonts.raleway(fontSize: 12),
              ),
              style: TextButton.styleFrom(
                foregroundColor: controller.currentPage.value > 1
                    ? AppColors.textSecondary
                    : AppColors.textMuted,
              ),
            ),
            Text(
              'Page ${controller.currentPage.value} of ${controller.totalPages.value}',
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
                  Text('Next', style: GoogleFonts.raleway(fontSize: 12,color: AppColors.accentPurple)),
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
