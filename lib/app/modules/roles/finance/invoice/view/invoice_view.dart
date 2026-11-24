import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:vmovexa/app/modules/roles/finance/invoice/controller/invoice_controller.dart';
import 'package:vmovexa/app/modules/roles/finance/invoice/model/invoice_model.dart';
import 'package:vmovexa/app/modules/roles/finance/invoice/view/invoice_list_item.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/theme/app_theme.dart';

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
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
              children: [
                _buildHeader(),
                const SizedBox(height: 16),
                _buildStatusTabs(),
                const SizedBox(height: 12),
                _buildSearchBar(),
                const SizedBox(height: 16),
                _buildListHeader(),
                const SizedBox(height: 10),
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

  // ---------------- Header (Exact Parity with InvoicesListPage.jsx) ----------------
  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              'finance_portal_breadcrumb'.tr,
              style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
            ),
            const SizedBox(width: 4),
            const Text(
              '›',
              style: TextStyle(color: AppColors.textMuted, fontSize: 12),
            ),
            const SizedBox(width: 4),
            Text(
              'tax_invoices'.tr,
              style: const TextStyle(
                color: Color(0xFF60A5FA),
                fontSize: 11,
                fontWeight: FontWeight.w600,
              ),
            ),
            const Spacer(),
            Obx(() => IconButton(
                  onPressed: controller.isRefreshing.value ? null : controller.refreshInvoices,
                  icon: controller.isRefreshing.value
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white70),
                        )
                      : const Icon(Icons.refresh, color: Colors.white70, size: 18),
                  tooltip: 'refresh_invoices'.tr,
                )),
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

  // ---------------- Status Filter Tabs (All, Paid, Pending, Overdue) ----------------
  Widget _buildStatusTabs() {
    return Obx(() {
      final tabs = [
        {'id': 'all', 'label': 'all_tab'.tr, 'count': controller.totalCount.value},
        {'id': 'paid', 'label': 'paid_tab'.tr, 'count': controller.paidCount.value},
        {'id': 'pending', 'label': 'pending_tab'.tr, 'count': controller.pendingCount.value},
        {'id': 'overdue', 'label': 'overdue_tab'.tr, 'count': controller.overdueCount.value},
      ];

      return SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: tabs.map((tab) {
            final tabId = tab['id'] as String;
            final label = tab['label'] as String;
            final count = tab['count'] as int;
            final isSelected = controller.selectedTab.value == tabId;

            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: GestureDetector(
                onTap: () => controller.onTabChanged(tabId),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
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
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        label,
                        style: GoogleFonts.raleway(
                          color: isSelected ? Colors.white : AppColors.textSecondary,
                          fontSize: 12,
                          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? Colors.white.withValues(alpha: 0.25)
                              : const Color(0x33FFFFFF),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          '$count',
                          style: TextStyle(
                            color: isSelected ? Colors.white : AppColors.textMuted,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      );
    });
  }

  // ---------------- Search Bar ----------------
  Widget _buildSearchBar() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.inputBg,
        borderRadius: BorderRadius.circular(12),
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
            fontSize: 12.5,
          ),
          prefixIcon: const Icon(Icons.search, color: AppColors.textMuted, size: 18),
          suffixIcon: Obx(() {
            if (controller.searchQuery.value.isNotEmpty) {
              return IconButton(
                onPressed: () {
                  controller.searchController.clear();
                  controller.onSearchChanged('');
                },
                icon: const Icon(Icons.clear, color: AppColors.textMuted, size: 16),
              );
            }
            return const SizedBox.shrink();
          }),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 12, horizontal: 12),
        ),
      ),
    );
  }

  // ---------------- List Header ----------------
  Widget _buildListHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Obx(() => Text(
              '${'invoices_count_title'.tr} (${controller.filteredInvoices.length})',
              style: GoogleFonts.raleway(
                color: AppColors.textPrimary,
                fontSize: 14,
                fontWeight: FontWeight.w700,
              ),
            )),
      ],
    );
  }

  // ---------------- Invoice List / Empty State ----------------
  Widget _buildInvoiceList() {
    return Obx(() {
      final items = controller.pagedInvoices;
      if (items.isEmpty) {
        return Container(
          padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.receipt_long_outlined, size: 42, color: AppColors.textMuted),
              const SizedBox(height: 10),
              Text(
                'no_invoices_found'.tr,
                style: GoogleFonts.raleway(
                  color: AppColors.textPrimary,
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'no_invoices_sub'.tr,
                textAlign: TextAlign.center,
                style: GoogleFonts.raleway(
                  color: AppColors.textMuted,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        );
      }

      return Column(
        children: items.map((InvoiceModel inv) {
          return InvoiceListItem(
            invoice: inv,
            onTap: () => controller.onInvoiceTap(inv),
            onDownloadPdf: () => controller.downloadInvoicePdf(inv),
          );
        }).toList(),
      );
    });
  }

  // ---------------- Pagination ----------------
  Widget _buildPagination() {
    return Obx(() {
      if (controller.totalPages.value <= 1) return const SizedBox.shrink();

      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
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
                    ? const Color(0xFF60A5FA)
                    : AppColors.textMuted,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('next'.tr, style: GoogleFonts.raleway(fontSize: 12)),
                  const SizedBox(width: 2),
                  const Icon(Icons.chevron_right, size: 16),
                ],
              ),
            ),
          ],
        ),
      );
    });
  }
}
