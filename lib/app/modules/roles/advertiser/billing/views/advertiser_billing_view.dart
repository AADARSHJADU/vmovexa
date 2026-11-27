import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../theme/app_theme.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../data/models/advertiser_billing_model.dart';
import '../controllers/advertiser_billing_controller.dart';

class AdvertiserBillingView extends GetView<AdvertiserBillingController> {
  const AdvertiserBillingView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(
                children: [
                  const CustomBackButton(),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'billing_and_revenue'.tr,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  Obx(() => IconButton(
                        icon: controller.refreshing.value
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF8B5CF6)),
                              )
                            : const Icon(Icons.refresh_rounded, color: Colors.white, size: 22),
                        onPressed: controller.refreshing.value ? null : () => controller.handleRefresh(),
                        tooltip: 'refresh_list'.tr,
                      )),
                ],
              ),
            ),

            // Main Scrollable Content
            Expanded(
              child: Obx(() {
                if (controller.isLoading.value) {
                  return const Center(
                    child: CircularProgressIndicator(color: Color(0xFF8B5CF6)),
                  );
                }

                return RefreshIndicator(
                  onRefresh: controller.handleRefresh,
                  color: const Color(0xFF8B5CF6),
                  backgroundColor: AppColors.cardBg,
                  child: ListView(
                    physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    children: [
                      // Subtitle & Badge Header
                      _buildHeaderBanner(),
                      const SizedBox(height: 16),

                      // 3 Summary KPI Cards
                      _buildSummaryCards(),
                      const SizedBox(height: 20),

                      // Invoices & Tax Receipts Ledger (with 3 Tabs & Search)
                      _buildInvoicesSection(),
                      const SizedBox(height: 24),

                      // Transaction History Ledger (with Search & Pagination)
                      _buildTransactionsSection(),
                      const SizedBox(height: 28),
                    ],
                  ),
                );
              }),
            ),
          ],
        ),
      ),
    );
  }

  // ==========================================================
  // HEADER BANNER
  // ==========================================================
  Widget _buildHeaderBanner() {
    return Container(
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
            children: [
              Expanded(
                child: Text(
                  'campaign_billing_invoices'.tr,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF3B82F6).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.4)),
                ),
                child: Text(
                  'approved_campaigns_only'.tr,
                  style: const TextStyle(
                    color: Color(0xFF93C5FD),
                    fontSize: 9.5,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            'campaign_billing_desc'.tr,
            style: const TextStyle(
              color: AppColors.textMuted,
              fontSize: 11,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================================
  // TOP 3 KPI SUMMARY CARDS
  // ==========================================================
  Widget _buildSummaryCards() {
    return Column(
      children: [
        Row(
          children: [
            // Card 1: Total Invoices & Bills
            Expanded(
              child: _buildKpiCard(
                title: 'total_invoices_bills'.tr,
                value: '${controller.allInvoicesCount}',
                subtitle: '${controller.invoicePaidCount} ${'paid_tab'.tr} · ${controller.invoicePendingCount} ${'tab_pending'.tr}',
                icon: Icons.check_circle_outline_rounded,
                iconColor: const Color(0xFF3B82F6),
                bgColor: const Color(0xFF3B82F6).withValues(alpha: 0.1),
                borderColor: const Color(0xFF3B82F6).withValues(alpha: 0.3),
              ),
            ),
            const SizedBox(width: 10),

            // Card 2: Payment Pending (Matches BillingPaymentsPage.jsx pendingCampaigns)
            Expanded(
              child: _buildKpiCard(
                title: 'payment_pending_card'.tr,
                value: controller.formatCurrency(controller.pendingTotal),
                subtitle: '${controller.pendingCampaigns.length} ${'pending_clearance'.tr}',
                icon: Icons.credit_card_rounded,
                iconColor: const Color(0xFFF59E0B),
                bgColor: const Color(0xFFF59E0B).withValues(alpha: 0.1),
                borderColor: const Color(0xFFF59E0B).withValues(alpha: 0.3),
                valueColor: const Color(0xFFFBBF24),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),

        // Card 3: Paid & Live on Screens (Matches BillingPaymentsPage.jsx paidCampaigns)
        _buildKpiCard(
          title: 'paid_live_screens'.tr,
          value: controller.formatCurrency(controller.paidTotal),
          subtitle: '${controller.paidCampaigns.length} ${'settled_invoices'.tr}',
          icon: Icons.tv_rounded,
          iconColor: const Color(0xFF10B981),
          bgColor: const Color(0xFF10B981).withValues(alpha: 0.1),
          borderColor: const Color(0xFF10B981).withValues(alpha: 0.3),
          valueColor: const Color(0xFF34D399),
          isFullWidth: true,
        ),
      ],
    );
  }

  Widget _buildKpiCard({
    required String title,
    required String value,
    required String subtitle,
    required IconData icon,
    required Color iconColor,
    required Color bgColor,
    required Color borderColor,
    Color? valueColor,
    bool isFullWidth = false,
  }) {
    return Container(
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
              Expanded(
                child: Text(
                  title.toUpperCase(),
                  style: const TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.4,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: bgColor,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: borderColor),
                ),
                child: Icon(icon, color: iconColor, size: 16),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              color: valueColor ?? Colors.white,
              fontSize: isFullWidth ? 22 : 19,
              fontWeight: FontWeight.bold,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            style: const TextStyle(
              color: AppColors.textMuted,
              fontSize: 10.5,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================================
  // INVOICES & TAX RECEIPTS SECTION (3 Tabs, Search, List, Pagination)
  // ==========================================================
  Widget _buildInvoicesSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Title + Badge
          Row(
            children: [
              Expanded(
                child: Text(
                  'invoices_tax_receipts'.tr,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF3B82F6).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.4)),
                ),
                child: Text(
                  'official_gst_receipts'.tr,
                  style: const TextStyle(
                    color: Color(0xFF93C5FD),
                    fontSize: 9.5,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            'invoices_tax_desc'.tr,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
          ),
          const SizedBox(height: 14),

          // 3 Filter Tabs (All, Pending, Paid)
          _buildInvoiceTabs(),
          const SizedBox(height: 12),

          // Search Input
          Container(
            height: 40,
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.cardBorder),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 10),
            child: Row(
              children: [
                const Icon(Icons.search_rounded, color: AppColors.textMuted, size: 18),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    onChanged: (val) {
                      controller.invoiceSearch.value = val;
                      controller.invoicePage.value = 1;
                    },
                    style: const TextStyle(color: Colors.white, fontSize: 12),
                    decoration: InputDecoration(
                      hintText: 'search_invoices_ph'.tr,
                      hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                      border: InputBorder.none,
                      isDense: true,
                    ),
                  ),
                ),
                Obx(() => controller.invoiceSearch.value.isNotEmpty
                    ? GestureDetector(
                        onTap: () {
                          controller.invoiceSearch.value = '';
                          controller.invoicePage.value = 1;
                        },
                        child: const Icon(Icons.close_rounded, color: AppColors.textMuted, size: 16),
                      )
                    : const SizedBox.shrink()),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Invoices Items List
          Obx(() {
            final list = controller.paginatedInvoices;
            if (list.isEmpty) {
              return Container(
                padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 16),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.5), strokeAlign: BorderSide.strokeAlignInside),
                ),
                child: Column(
                  children: [
                    Icon(Icons.description_outlined, color: Colors.white.withValues(alpha: 0.3), size: 36),
                    const SizedBox(height: 10),
                    Text(
                      'no_matching_invoices_found'.tr,
                      style: const TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'no_invoices_desc'.tr,
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 10.5),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              );
            }

            return Column(
              children: list.map((inv) => _buildInvoiceItemCard(inv)).toList(),
            );
          }),

          const SizedBox(height: 14),

          // Invoices Pagination
          _buildInvoicePagination(),
        ],
      ),
    );
  }

  // The 3 Tabs: All, Pending, Paid (Matches BillingPaymentsPage.jsx)
  Widget _buildInvoiceTabs() {
    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Obx(() {
        final current = controller.selectedInvoiceTab.value;
        return Row(
          children: [
            _buildTabButton(
              label: '${'tab_all'.tr} (${controller.allInvoicesCount})',
              isActive: current == 'all',
              onTap: () => controller.setInvoiceTab('all'),
            ),
            _buildTabButton(
              label: '${'tab_pending'.tr} (${controller.invoicePendingCount})',
              isActive: current == 'pending' || current == 'awaiting',
              activeColor: const Color(0xFFF59E0B),
              onTap: () => controller.setInvoiceTab('pending'),
            ),
            _buildTabButton(
              label: '${'tab_paid'.tr} (${controller.invoicePaidCount})',
              isActive: current == 'paid',
              activeColor: const Color(0xFF10B981),
              onTap: () => controller.setInvoiceTab('paid'),
            ),
          ],
        );
      }),
    );
  }

  Widget _buildTabButton({
    required String label,
    required bool isActive,
    Color? activeColor,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            gradient: isActive ? AppTheme.primaryGradient : null,
            color: isActive ? null : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
            boxShadow: isActive
                ? [
                    BoxShadow(
                      color: const Color(0xFF8B5CF6).withValues(alpha: 0.3),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    )
                  ]
                : null,
          ),
          child: Text(
            label,
            style: TextStyle(
              color: isActive ? Colors.white : AppColors.textMuted,
              fontSize: 10.5,
              fontWeight: isActive ? FontWeight.bold : FontWeight.w600,
            ),
          ),
        ),
      ),
    );
  }

  // Invoice Card Item
  Widget _buildInvoiceItemCard(BillingInvoiceItem inv) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Row: Invoice ID + Status Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                inv.id,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'monospace',
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: inv.isPaid
                      ? const Color(0xFF10B981).withValues(alpha: 0.15)
                      : const Color(0xFFF59E0B).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: inv.isPaid
                        ? const Color(0xFF10B981).withValues(alpha: 0.4)
                        : const Color(0xFFF59E0B).withValues(alpha: 0.4),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      inv.isPaid ? Icons.check_circle_rounded : Icons.pending_rounded,
                      size: 11,
                      color: inv.isPaid ? const Color(0xFF34D399) : const Color(0xFFFBBF24),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      inv.isPaid ? 'status_paid_cleared'.tr : 'status_awaiting_payment'.tr,
                      style: TextStyle(
                        color: inv.isPaid ? const Color(0xFF34D399) : const Color(0xFFFBBF24),
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

          // Campaign Title & Code
          Row(
            children: [
              Expanded(
                child: Text(
                  inv.campaign,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  inv.campaignCode,
                  style: const TextStyle(
                    color: Color(0xFF94A3B8),
                    fontSize: 9.5,
                    fontFamily: 'monospace',
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),

          // Client / Brand
          Text(
            inv.clientBrand,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
          ),
          const Divider(color: Color(0xFF334155), height: 18),

          // Meta Row: Issue Date, Due Date, Total Amount
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('issue_date_label'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
                  const SizedBox(height: 2),
                  Text(inv.date, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w500)),
                  if (inv.dueDate != null) ...[
                    const SizedBox(height: 2),
                    Text('${'due_prefix'.tr} ${inv.dueDate}', style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 9.5)),
                  ],
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text('total_amount'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
                  const SizedBox(height: 2),
                  Text(
                    inv.formattedAmount,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      letterSpacing: -0.3,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Action Buttons: View Details, Tax Invoice, Download PDF
          Row(
            children: [
              // 1. View Details
              Expanded(
                child: OutlinedButton(
                  onPressed: () => controller.openCampaignDetails(inv),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.white,
                    side: const BorderSide(color: Color(0xFF334155)),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.visibility_rounded, size: 13, color: Color(0xFF8B5CF6)),
                      const SizedBox(width: 4),
                      Text('details'.tr, style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 8),

              // 2. Tax Invoice
              Expanded(
                child: OutlinedButton(
                  onPressed: () => _showTaxInvoiceSheet(inv),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.white,
                    side: const BorderSide(color: Color(0xFF334155)),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.receipt_long_rounded, size: 13, color: Color(0xFF3B82F6)),
                      const SizedBox(width: 4),
                      Text('tax_invoice_btn'.tr, style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 8),

              // 3. Download PDF (with Primary Gradient)
              Expanded(
                child: Container(
                  height: 36,
                  decoration: BoxDecoration(
                    gradient: AppTheme.primaryGradient,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: ElevatedButton(
                    onPressed: () => controller.downloadInvoicePdf(inv),
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
                        Text('pdf_btn'.tr, style: const TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // Invoice Pagination
  Widget _buildInvoicePagination() {
    return Obx(() {
      final current = controller.invoicePage.value;
      final total = controller.totalInvoicePages;
      final count = controller.filteredInvoices.length;

      return Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            '${'showing_prefix'.tr} $count ${'invoices_count_suffix'.tr}',
            style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
          ),
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.chevron_left_rounded, color: Colors.white),
                onPressed: current > 1 ? () => controller.prevInvoicePage() : null,
                iconSize: 20,
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
              ),
              Text(
                '${'page_prefix'.tr} $current ${'of_divider'.tr} $total',
                style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600),
              ),
              IconButton(
                icon: const Icon(Icons.chevron_right_rounded, color: Colors.white),
                onPressed: current < total ? () => controller.nextInvoicePage() : null,
                iconSize: 20,
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
              ),
            ],
          ),
        ],
      );
    });
  }

  // ==========================================================
  // TRANSACTION HISTORY SECTION (Search, Table/Card, Pagination)
  // ==========================================================
  Widget _buildTransactionsSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Title + Subtitle
          Text(
            'transaction_history_title'.tr,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 15,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'transaction_history_desc'.tr,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
          ),
          const SizedBox(height: 14),

          // Search + View Mode Row
          Row(
            children: [
              Expanded(
                child: Container(
                  height: 38,
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.cardBorder),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  child: Row(
                    children: [
                      const Icon(Icons.search_rounded, color: AppColors.textMuted, size: 16),
                      const SizedBox(width: 8),
                      Expanded(
                        child: TextField(
                          onChanged: (val) {
                            controller.txSearch.value = val;
                            controller.txPage.value = 1;
                          },
                          style: const TextStyle(color: Colors.white, fontSize: 11),
                          decoration: InputDecoration(
                            hintText: 'search_tx_ph'.tr,
                            hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                            border: InputBorder.none,
                            isDense: true,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 8),

              // View Mode Toggle (Card / Table)
              Obx(() {
                final isCard = controller.txViewMode.value == 'card';
                return Container(
                  height: 38,
                  padding: const EdgeInsets.all(3),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.cardBorder),
                  ),
                  child: Row(
                    children: [
                      GestureDetector(
                        onTap: () => controller.txViewMode.value = 'card',
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: isCard ? const Color(0xFF8B5CF6) : Colors.transparent,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Icon(Icons.grid_view_rounded, size: 16, color: isCard ? Colors.white : AppColors.textMuted),
                        ),
                      ),
                      GestureDetector(
                        onTap: () => controller.txViewMode.value = 'table',
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: !isCard ? const Color(0xFF8B5CF6) : Colors.transparent,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Icon(Icons.view_headline_rounded, size: 16, color: !isCard ? Colors.white : AppColors.textMuted),
                        ),
                      ),
                    ],
                  ),
                );
              }),
            ],
          ),
          const SizedBox(height: 14),

          // Transactions List / Table
          Obx(() {
            final list = controller.paginatedTransactions;
            if (list.isEmpty) {
              return Container(
                padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 16),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.5)),
                ),
                child: Column(
                  children: [
                    Icon(Icons.credit_card_off_rounded, color: Colors.white.withValues(alpha: 0.3), size: 32),
                    const SizedBox(height: 8),
                    Text('no_tx_found'.tr, style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Text('no_tx_desc'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 10), textAlign: TextAlign.center),
                  ],
                ),
              );
            }

            return Column(
              children: list.map((tx) => _buildTransactionItem(tx)).toList(),
            );
          }),

          const SizedBox(height: 14),

          // Transactions Pagination
          _buildTxPagination(),
        ],
      ),
    );
  }

  Widget _buildTransactionItem(AdvertiserTransactionModel tx) {
    final isCredit = tx.isCredit;
    final amountPrefix = isCredit ? '+' : '-';
    final amountColor = isCredit ? const Color(0xFF34D399) : Colors.white;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                tx.code ?? 'TXN-${tx.id ?? '—'}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'monospace',
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                ),
                child: Text(
                  tx.status ?? 'Completed',
                  style: const TextStyle(color: Color(0xFF34D399), fontSize: 9, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            tx.description ?? 'settlement_wire_desc'.tr,
            style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${tx.createdAt?.split('T').first ?? '—'} · ${tx.gatewayRef ?? tx.invoiceCode ?? 'gateway_fallback'.tr}',
                style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
              ),
              Text(
                '$amountPrefix ₹${(tx.amount ?? 0).abs().toStringAsFixed(0)}',
                style: TextStyle(
                  color: amountColor,
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTxPagination() {
    return Obx(() {
      final current = controller.txPage.value;
      final total = controller.totalTxPages;
      final count = controller.filteredTransactions.length;

      return Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            '${'showing_prefix'.tr} $count ${'transactions_count_suffix'.tr}',
            style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
          ),
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.chevron_left_rounded, color: Colors.white),
                onPressed: current > 1 ? () => controller.prevTxPage() : null,
                iconSize: 20,
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
              ),
              Text(
                '${'page_prefix'.tr} $current ${'of_divider'.tr} $total',
                style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600),
              ),
              IconButton(
                icon: const Icon(Icons.chevron_right_rounded, color: Colors.white),
                onPressed: current < total ? () => controller.nextTxPage() : null,
                iconSize: 20,
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
              ),
            ],
          ),
        ],
      );
    });
  }

  // ==========================================================
  // TAX INVOICE OFFICIAL BREAKDOWN BOTTOM SHEET
  // ==========================================================
  void _showTaxInvoiceSheet(BillingInvoiceItem inv) {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Color(0xFF1E293B),
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Sheet Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF8B5CF6).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.receipt_rounded, color: Color(0xFF8B5CF6), size: 22),
                      ),
                      const SizedBox(width: 10),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'official_gst_tax_invoice'.tr,
                            style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                          ),
                          Text(
                            inv.id,
                            style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontFamily: 'monospace'),
                          ),
                        ],
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: Colors.white70),
                    onPressed: () => Get.back(),
                  ),
                ],
              ),
              const Divider(color: Color(0xFF334155), height: 24),

              // Billed To / Campaign
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('billed_to_label'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Text(inv.clientBrand, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Text('${'campaign_prefix'.tr} ', style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
                        Expanded(
                          child: Text(
                            '${inv.campaign} (${inv.campaignCode})',
                            style: const TextStyle(color: Color(0xFF93C5FD), fontSize: 11, fontWeight: FontWeight.w600),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text('${'date_of_issue_prefix'.tr} ${inv.date}', style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Item Breakdown
              Text('charges_breakdown_label'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),

              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: Column(
                  children: [
                    _buildBreakdownRow('media_broadcast_base'.tr, inv.formattedBaseAmount),
                    const SizedBox(height: 8),
                    _buildBreakdownRow('cgst_rate_label'.tr, '₹${(inv.gstAmount / 2).toStringAsFixed(0)}'),
                    const SizedBox(height: 8),
                    _buildBreakdownRow('sgst_rate_label'.tr, '₹${(inv.gstAmount / 2).toStringAsFixed(0)}'),
                    const SizedBox(height: 8),
                    _buildBreakdownRow('total_gst_label'.tr, inv.formattedGstAmount, color: const Color(0xFFFBBF24)),
                    const Divider(color: Color(0xFF334155), height: 20),
                    _buildBreakdownRow('total_payable_amount'.tr, inv.formattedAmount, isBold: true, color: Colors.white, fontSize: 15),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Get.back(),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white70,
                        side: const BorderSide(color: Color(0xFF334155)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: Text('close'.tr),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Container(
                      height: 44,
                      decoration: BoxDecoration(
                        gradient: AppTheme.primaryGradient,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Get.back();
                          controller.downloadInvoicePdf(inv);
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.transparent,
                          shadowColor: Colors.transparent,
                          padding: EdgeInsets.zero,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        icon: const Icon(Icons.download_rounded, color: Colors.white, size: 16),
                        label: Text('download_pdf'.tr, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
      isScrollControlled: true,
    );
  }

  Widget _buildBreakdownRow(String label, String value, {bool isBold = false, Color? color, double fontSize = 12}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(color: AppColors.textMuted, fontSize: fontSize, fontWeight: isBold ? FontWeight.bold : FontWeight.normal)),
        Text(value, style: TextStyle(color: color ?? Colors.white, fontSize: fontSize, fontWeight: isBold ? FontWeight.bold : FontWeight.w600)),
      ],
    );
  }
}

