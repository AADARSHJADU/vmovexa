// lib/app/modules/roles/government/billing_invoices/views/gov_billing_invoices_view.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import 'package:vmovexa/app/widgets/custom_back_button.dart';
import '../controllers/gov_billing_invoices_controller.dart';
import '../models/gov_billing_models.dart';

class GovBillingInvoicesView extends GetView<GovBillingInvoicesController> {
  const GovBillingInvoicesView({super.key});

  @override
  Widget build(BuildContext context) {
    final c = Get.isRegistered<GovBillingInvoicesController>()
        ? Get.find<GovBillingInvoicesController>()
        : Get.put(GovBillingInvoicesController());

    final currencyFormat = NumberFormat('#,##,###', 'en_IN');

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top App Bar
            _buildTopAppBar(context, c),

            // Main Content Area
            Expanded(
              child: Obx(() {
                if (c.isLoading.value) {
                  return const Center(
                    child: CircularProgressIndicator(color: Color(0xFF3B82F6)),
                  );
                }

                return RefreshIndicator(
                  onRefresh: c.refreshData,
                  color: const Color(0xFF3B82F6),
                  backgroundColor: const Color(0xFF1E293B),
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Top 2 KPI Summary Boxes
                        _buildTopKpiBoxes(c, currencyFormat),
                        const SizedBox(height: 18),

                        // Section: Department Invoices & Clearance Receipts
                        _buildInvoicesSection(context, c),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                );
              }),
            ),
          ],
        ),
      ),
    );
  }

  /// Top App Bar
  Widget _buildTopAppBar(BuildContext context, GovBillingInvoicesController c) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: const BoxDecoration(
        color: AppColors.background,
        border: Border(bottom: BorderSide(color: Color(0xFF1E293B), width: 1)),
      ),
      child: Row(
        children: [
          const CustomBackButton(),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'gov_billing.title'.tr,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'gov_billing.dept_invoices_receipts'.tr,
                  style: const TextStyle(
                    color: Color(0xFF94A3B8),
                    fontSize: 11,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white70, size: 20),
            onPressed: c.refreshData,
            tooltip: 'refresh_content'.tr,
          ),
        ],
      ),
    );
  }

  /// Top 2 KPI Summary Boxes:
  /// 1. Total Invoices & Sanctions
  /// 2. Paid & Disbursed
  Widget _buildTopKpiBoxes(GovBillingInvoicesController c, NumberFormat currencyFormat) {
    return Obx(() {
      final totalInvoices = c.allInvoicesCount;
      final paidInvoices = c.invoicePaidCount;
      final pendingInvoices = c.invoicePendingCount;
      final paidTotal = c.paidTotal;

      return Row(
        children: [
          // Box 1: Total Invoices & Sanctions
          Expanded(
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.cardBorder, width: 1.2),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Flexible(
                        child: Text(
                          'gov_billing.total_sanctions'.tr.toUpperCase(),
                          style: const TextStyle(
                            color: Color(0xFF94A3B8),
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.3,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: const Color(0x1F3B82F6),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0x4D3B82F6)),
                        ),
                        child: const Icon(Icons.check_circle_outline_rounded, color: Color(0xFF60A5FA), size: 16),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '$totalInvoices',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '$paidInvoices ${'gov_billing.tab_paid'.tr} · $pendingInvoices ${'gov_billing.tab_pending'.tr}',
                    style: const TextStyle(
                      color: Color(0xFF94A3B8),
                      fontSize: 10,
                      fontWeight: FontWeight.w500,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 12),

          // Box 2: Paid & Disbursed
          Expanded(
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.cardBorder, width: 1.2),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Flexible(
                        child: Text(
                          'gov_billing.paid_disbursed'.tr.toUpperCase(),
                          style: const TextStyle(
                            color: Color(0xFF94A3B8),
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.3,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: const Color(0x1F10B981),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0x4D10B981)),
                        ),
                        child: const Icon(Icons.payments_outlined, color: Color(0xFF34D399), size: 16),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '₹ ${currencyFormat.format(paidTotal)}',
                    style: const TextStyle(
                      color: Color(0xFF34D399),
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '$paidInvoices ${'gov_billing.settled_invoices'.tr}',
                    style: const TextStyle(
                      color: Color(0xFF94A3B8),
                      fontSize: 10,
                      fontWeight: FontWeight.w500,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ),
        ],
      );
    });
  }

  /// Section: Department Invoices & Clearance Receipts
  Widget _buildInvoicesSection(BuildContext context, GovBillingInvoicesController c) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Header with Title and GST Badge
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            'gov_billing.dept_invoices_receipts'.tr,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 13.5,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.2,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0x1F3B82F6),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: const Color(0x4D3B82F6)),
                          ),
                          child: Text(
                            'gov_billing.official_gst_receipts'.tr,
                            style: const TextStyle(
                              color: Color(0xFF60A5FA),
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'gov_billing.receipts_subtitle'.tr,
                      style: const TextStyle(
                        color: Color(0xFF94A3B8),
                        fontSize: 10.5,
                        height: 1.3,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // 3 Filter Tabs: All, Pending, Paid (styled with primaryGradient when selected)
          Obx(() {
            final activeTab = c.selectedInvoiceTab.value;
            final tabs = [
              {'id': 'all', 'label': '${'gov_billing.tab_all'.tr} (${c.allInvoicesCount})'},
              {'id': 'pending', 'label': '${'gov_billing.tab_pending'.tr} (${c.invoicePendingCount})'},
              {'id': 'paid', 'label': '${'gov_billing.tab_paid'.tr} (${c.invoicePaidCount})'},
            ];

            return Row(
              children: tabs.map((tab) {
                final isSelected = activeTab == tab['id'];
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 3),
                    child: GestureDetector(
                      onTap: () => c.setInvoiceTab(tab['id']!),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        decoration: BoxDecoration(
                          gradient: isSelected ? AppTheme.primaryGradient : null,
                          color: isSelected ? null : const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: isSelected ? Colors.transparent : const Color(0xFF334155),
                          ),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          tab['label']!,
                          style: TextStyle(
                            color: isSelected ? Colors.white : const Color(0xFF94A3B8),
                            fontSize: 11,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            );
          }),
          const SizedBox(height: 12),

          // Search Bar
          Container(
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF334155)),
            ),
            child: TextField(
              controller: c.searchController,
              style: const TextStyle(color: Colors.white, fontSize: 12),
              decoration: InputDecoration(
                prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFF64748B), size: 18),
                hintText: 'gov_billing.search_ph'.tr,
                hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 11),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 11),
                suffixIcon: Obx(
                  () => c.invoiceSearch.value.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear_rounded, color: Colors.white54, size: 16),
                          onPressed: () {
                            c.searchController.clear();
                            c.invoiceSearch.value = '';
                          },
                        )
                      : const SizedBox.shrink(),
                ),
              ),
            ),
          ),
          const SizedBox(height: 14),

          // Invoice Cards List
          Obx(() {
            final invoices = c.paginatedInvoices;

            if (invoices.isEmpty) {
              return Container(
                padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 16),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B).withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFF334155), style: BorderStyle.solid),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.receipt_long_outlined, color: Color(0xFF64748B), size: 36),
                    const SizedBox(height: 10),
                    Text(
                      'gov_billing.no_invoices_found'.tr,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'gov_billing.no_invoices_desc'.tr,
                      style: const TextStyle(
                        color: Color(0xFF94A3B8),
                        fontSize: 10.5,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              );
            }

            return ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: invoices.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (ctx, idx) {
                final inv = invoices[idx];
                return _buildInvoiceCard(context, c, inv);
              },
            );
          }),
          const SizedBox(height: 14),

          // Bottom Pagination Bar
          _buildPaginationBar(c),
        ],
      ),
    );
  }

  /// Individual Invoice Card
  Widget _buildInvoiceCard(
      BuildContext context, GovBillingInvoicesController c, GovBillingInvoiceItem inv) {
    final currencyFormat = (inv.amount % 1 == 0)
        ? NumberFormat('#,##,###', 'en_IN')
        : NumberFormat('#,##,###.00', 'en_IN');
    final isPending = !inv.isPaid;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF334155), width: 1.1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Row: Invoice ID & Status Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    inv.id,
                    style: const TextStyle(
                      color: Color(0xFF60A5FA),
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace',
                    ),
                  ),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      inv.campaignCode,
                      style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 9.5),
                    ),
                  ),
                ],
              ),

              // Status Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: isPending
                      ? const Color(0x1FF59E0B)
                      : const Color(0x1F10B981),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: isPending
                        ? const Color(0x4DF59E0B)
                        : const Color(0x4D10B981),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (!isPending) ...[
                      const Icon(Icons.check_rounded, color: Color(0xFF34D399), size: 12),
                      const SizedBox(width: 3),
                    ] else ...[
                      const Icon(Icons.hourglass_empty_rounded, color: Color(0xFFFBBF24), size: 11),
                      const SizedBox(width: 3),
                    ],
                    Text(
                      isPending ? 'gov_billing.awaiting_payment'.tr : 'gov_billing.paid_cleared'.tr,
                      style: TextStyle(
                        color: isPending ? const Color(0xFFFBBF24) : const Color(0xFF34D399),
                        fontSize: 9.5,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Campaign Name
          Text(
            inv.campaign,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 13,
              fontWeight: FontWeight.bold,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),

          // Department Tag
          Row(
            children: [
              const Icon(Icons.account_balance_outlined, color: Color(0xFF94A3B8), size: 12),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  inv.clientBrand,
                  style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10.5),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Dates and Amount Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    inv.date,
                    style: const TextStyle(color: Color(0xFF64748B), fontSize: 10),
                  ),
                  if (inv.dueDate != null)
                    Text(
                      '${'gov_billing.due_label'.tr} ${inv.dueDate}',
                      style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 9.5),
                    ),
                ],
              ),
              Text(
                '₹ ${currencyFormat.format(inv.amount)}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14.5,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Action Buttons: Detail, Tax Invoice, Download PDF
          Row(
            children: [
              // 1. Detail Button
              Expanded(
                child: OutlinedButton(
                  onPressed: () => c.openCampaignDetails(inv),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.white,
                    side: const BorderSide(color: Color(0xFF334155)),
                    backgroundColor: const Color(0xFF0F172A),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.visibility_rounded, size: 13, color: Color(0xFF8B5CF6)),
                      const SizedBox(width: 4),
                      Text(
                        'gov_billing.action_details'.tr,
                        style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 8),

              // 2. Tax Invoice Button (opens via url_launcher)
              Expanded(
                child: OutlinedButton(
                  onPressed: () => c.openTaxInvoiceUrl(inv),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.white,
                    side: const BorderSide(color: Color(0xFF334155)),
                    backgroundColor: const Color(0xFF0F172A),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.receipt_long_rounded, size: 13, color: Color(0xFF3B82F6)),
                      const SizedBox(width: 4),
                      Text(
                        'gov_billing.action_tax_invoice'.tr,
                        style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 8),


            ],
          ),
          SizedBox(height: 12),
          // 3. Download PDF (with primaryGradient)
          Container(
            height: 36,
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(8),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF2563EB).withValues(alpha: 0.3),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: ElevatedButton(
              onPressed: () => c.downloadInvoicePdf(inv),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.transparent,
                shadowColor: Colors.transparent,
                padding: EdgeInsets.zero,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.download_rounded, size: 13, color: Colors.white),
                  const SizedBox(width: 4),
                  Text(
                    'gov_billing.action_download_pdf'.tr,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 10.5,
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Bottom Pagination Bar
  Widget _buildPaginationBar(GovBillingInvoicesController c) {
    return Obx(() {
      final current = c.invoicePage.value;
      final total = c.totalInvoicePages;
      final start = c.paginationStartIndex;
      final end = c.paginationEndIndex;
      final totalItems = c.filteredInvoices.length;

      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: const Color(0xFF334155)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '$start-$end ${'gov_billing.of'.tr} $totalItems',
              style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10.5),
            ),
            Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.chevron_left_rounded, color: Colors.white),
                  onPressed: current > 1 ? () => c.prevInvoicePage() : null,
                  iconSize: 20,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                ),
                Text(
                  '${'gov_billing.page'.tr} $current / $total',
                  style: const TextStyle(color: Colors.white70, fontSize: 10.5, fontWeight: FontWeight.bold),
                ),
                IconButton(
                  icon: const Icon(Icons.chevron_right_rounded, color: Colors.white),
                  onPressed: current < total ? () => c.nextInvoicePage() : null,
                  iconSize: 20,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                ),
              ],
            ),
          ],
        ),
      );
    });
  }
}
