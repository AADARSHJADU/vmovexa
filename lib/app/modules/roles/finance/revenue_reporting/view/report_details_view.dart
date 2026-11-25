import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controller/report_details_controller.dart';
import '../model/report_models.dart';

class ReportDetailsView extends GetView<ReportDetailsController> {
  const ReportDetailsView({super.key});

  static const Color kBg = Color(0xFF0D0D18);
  static const Color kCardBg = Color(0xFF151522);
  static const Color kInputBg = Color(0xFF1C1C2D);
  static const Color kBorderColor = Color(0xFF26263B);

  @override
  Widget build(BuildContext context) {
    if (!Get.isRegistered<ReportDetailsController>()) {
      Get.put(ReportDetailsController());
    }

    final currencyFormatter = NumberFormat.currency(
      locale: 'en_IN',
      symbol: '₹',
      decimalDigits: 0,
    );

    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Obx(() {
          if (controller.isLoading.value) {
            return const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF6366F1)),
              ),
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Header with Back to Reports, Titles, Status & Actions
                _buildHeaderBar(context),
                const SizedBox(height: 16),

                // Executive Financial KPI Cards (Top 4 Boxes matching Admin Panel 1:1)
                _buildExecutiveKpis(currencyFormatter),
                const SizedBox(height: 16),

                // Metadata Strip (Period, Generated On, Invoice Count, CGST Ledger Note)
                _buildMetadataStrip(),
                const SizedBox(height: 16),

                // Itemized Transaction Ledger & Invoices Section
                _buildItemizedLedgerSection(currencyFormatter),
                const SizedBox(height: 24),
              ],
            ),
          );
        }),
      ),
    );
  }

  // ==========================================
  // TOP HEADER BAR & CTAS
  // ==========================================
  Widget _buildHeaderBar(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Back to Reports Button
            InkWell(
              onTap: () => Get.back(),
              borderRadius: BorderRadius.circular(10),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                decoration: BoxDecoration(
                  color: kInputBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: kBorderColor),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.arrow_back_rounded,
                      color: Colors.white70,
                      size: 15,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'back_to_reports'.tr,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11.5,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Refresh & Export Excel/CSV Action CTAs
            Column(
              children: [
                IconButton(
                  onPressed: () => controller.fetchDetails(),
                  icon: const Icon(
                    Icons.refresh_rounded,
                    color: Colors.white70,
                    size: 18,
                  ),
                  style: IconButton.styleFrom(
                    backgroundColor: kInputBg,
                    padding: const EdgeInsets.all(7),
                    minimumSize: const Size(34, 34),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                      side: const BorderSide(color: kBorderColor),
                    ),
                  ),
                  tooltip: 'refresh'.tr,
                ),

              ],
            ),
          ],
        ),
        const SizedBox(height: 12),
        Container(
          width: MediaQuery.of(context).size.width,
          height: 45,
          decoration: BoxDecoration(
            gradient: AppTheme.primaryGradient,
            borderRadius: BorderRadius.circular(10),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF6366F1).withValues(alpha: 0.3),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: ElevatedButton.icon(
            onPressed: controller.isDownloading.value
                ? null
                : () => controller.exportCsv(),
            icon: controller.isDownloading.value
                ? const SizedBox(
              width: 14,
              height: 14,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            )
                : const Icon(
              Icons.download_rounded,
              size: 15,
              color: Colors.white,
            ),
            label: Text(
              controller.isDownloading.value
                  ? 'downloading'.tr
                  : 'export_excel_csv'.tr,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 11.5,
                fontWeight: FontWeight.bold,
              ),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.transparent,
              shadowColor: Colors.transparent,
              padding: const EdgeInsets.symmetric(
                horizontal: 12,
                vertical: 8,
              ),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),
        ),
        const SizedBox(height: 12),

        // Report Title, REP ID Badge & Status Badge
        Wrap(
          crossAxisAlignment: WrapCrossAlignment.center,
          spacing: 8,
          runSpacing: 6,
          children: [
            Text(
              controller.reportTitle.value.isNotEmpty
                  ? controller.reportTitle.value
                  : 'financial_reports'.tr,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w900,
                letterSpacing: -0.3,
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
              decoration: BoxDecoration(
                color: const Color(0xFF1E3A8A).withValues(alpha: 0.4),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.5)),
              ),
              child: Text(
                'REP-${controller.reportId.value}',
                style: const TextStyle(
                  color: Color(0xFF93C5FD),
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'monospace',
                ),
              ),
            ),
            _buildStatusBadge(controller.status.value),
          ],
        ),
        const SizedBox(height: 4),

        // Subtitle / Legal period description
        Text(
          '${'itemized_transaction_ledger_desc'.tr} ${controller.periodStr.value}',
          style: const TextStyle(
            color: Colors.white54,
            fontSize: 11.5,
            height: 1.4,
          ),
        ),
      ],
    );
  }

  Widget _buildStatusBadge(String status) {
    Color bg = const Color(0xFF064E3B).withValues(alpha: 0.4);
    Color border = const Color(0xFF10B981).withValues(alpha: 0.5);
    Color text = const Color(0xFF34D399);
    String label = 'ready'.tr;

    final lower = status.toLowerCase();
    if (lower == 'generating') {
      bg = const Color(0xFF78350F).withValues(alpha: 0.4);
      border = const Color(0xFFF59E0B).withValues(alpha: 0.5);
      text = const Color(0xFFFBBF24);
      label = 'generating'.tr;
    } else if (lower == 'failed') {
      bg = const Color(0xFF7F1D1D).withValues(alpha: 0.4);
      border = const Color(0xFFEF4444).withValues(alpha: 0.5);
      text = const Color(0xFFF87171);
      label = 'failed'.tr;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: border),
      ),
      child: Text(
        '● $label',
        style: TextStyle(
          color: text,
          fontSize: 10.5,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  // ==========================================
  // TOP 4 EXECUTIVE FINANCIAL KPI CARDS
  // ==========================================
  Widget _buildExecutiveKpis(NumberFormat currencyFormatter) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final cardWidth = (constraints.maxWidth - 12) / 2;
        return Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            // 1. Gross Invoiced / Billed
            _buildKpiCard(
              width: cardWidth,
              title: 'gross_billed'.tr,
              value: currencyFormatter.format(controller.totalBilled.value),
              subtitle: 'billed_across_ledger'.tr,
              valueColor: Colors.white,
              borderColor: kBorderColor,
              bgHighlight: Colors.transparent,
            ),

            // 2. Realized Collections
            _buildKpiCard(
              width: cardWidth,
              title: 'realized_collections'.tr,
              value: currencyFormatter.format(controller.totalRevenue.value),
              subtitle: 'settled_realized'.tr,
              valueColor: const Color(0xFF34D399),
              borderColor: const Color(0xFF059669).withValues(alpha: 0.4),
              bgHighlight: const Color(0xFF064E3B).withValues(alpha: 0.15),
            ),

            // 3. Total GST Accrued
            _buildKpiCard(
              width: cardWidth,
              title: 'total_gst_accrued'.tr,
              value: currencyFormatter.format(controller.totalTax.value),
              subtitle:
                  'CGST ₹${currencyFormatter.format(controller.cgstTotal.value).replaceAll('₹', '')} · SGST ₹${currencyFormatter.format(controller.sgstTotal.value).replaceAll('₹', '')} · IGST ₹${currencyFormatter.format(controller.igstTotal.value).replaceAll('₹', '')}',
              valueColor: const Color(0xFFFBBF24),
              borderColor: const Color(0xFFD97706).withValues(alpha: 0.4),
              bgHighlight: const Color(0xFF78350F).withValues(alpha: 0.15),
            ),

            // 4. Outstanding Receivables
            _buildKpiCard(
              width: cardWidth,
              title: 'outstanding_receivables'.tr,
              value: currencyFormatter.format(controller.pendingDues.value),
              subtitle: 'unpaid_balance'.tr,
              valueColor: const Color(0xFFF87171),
              borderColor: const Color(0xFFDC2626).withValues(alpha: 0.4),
              bgHighlight: const Color(0xFF7F1D1D).withValues(alpha: 0.15),
            ),
          ],
        );
      },
    );
  }

  Widget _buildKpiCard({
    required double width,
    required String title,
    required String value,
    required String subtitle,
    required Color valueColor,
    required Color borderColor,
    required Color bgHighlight,
  }) {
    return Container(
      width: width,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: bgHighlight != Colors.transparent ? bgHighlight : kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title.toUpperCase(),
            style: const TextStyle(
              color: Colors.white38,
              fontSize: 9.5,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: TextStyle(
              color: valueColor,
              fontSize: 16,
              fontWeight: FontWeight.w900,
              fontFamily: 'monospace',
            ),
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            style: const TextStyle(
              color: Colors.white54,
              fontSize: 10,
              height: 1.3,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // ==========================================
  // METADATA STRIP
  // ==========================================
  Widget _buildMetadataStrip() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            spacing: 20,
            runSpacing: 10,
            children: [
              _buildMetaItem(
                label: 'period_label'.tr,
                value: controller.periodStr.value.isNotEmpty
                    ? controller.periodStr.value
                    : '—',
                valueColor: Colors.white,
              ),
              _buildMetaItem(
                label: 'generated_on'.tr,
                value: controller.generatedDate.value.isNotEmpty
                    ? controller.generatedDate.value
                    : '—',
                valueColor: Colors.white70,
              ),
              _buildMetaItem(
                label: 'invoice_count'.tr,
                value:
                    '${controller.allInvoices.length} ${'transactions'.tr}',
                valueColor: const Color(0xFF60A5FA),
                isBold: true,
              ),
            ],
          ),
          const SizedBox(height: 8),
          const Divider(color: Color(0x14FFFFFF), height: 1),
          const SizedBox(height: 8),
          Text(
            'rule_46_cgst_statutory'.tr,
            style: const TextStyle(
              color: Colors.white38,
              fontSize: 10,
              fontStyle: FontStyle.italic,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetaItem({
    required String label,
    required String value,
    required Color valueColor,
    bool isBold = false,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: const TextStyle(
            color: Colors.white38,
            fontSize: 9,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(
            color: valueColor,
            fontSize: 11.5,
            fontWeight: isBold ? FontWeight.bold : FontWeight.w600,
          ),
        ),
      ],
    );
  }

  // ==========================================
  // ITEMIZED LEDGER & INVOICES SECTION
  // ==========================================
  Widget _buildItemizedLedgerSection(NumberFormat currencyFormatter) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Title & Subtitle
          Text(
            'itemized_ledger_and_invoices'.tr,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            'line_items_breakdown'.tr,
            style: const TextStyle(
              color: Colors.white54,
              fontSize: 11,
            ),
          ),
          const SizedBox(height: 12),

          // Filters: Status Dropdown (Exact 4 options) & Search Bar
          Row(
            children: [
              // Status Filter Dropdown
              Expanded(
                flex: 4,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 0),
                  decoration: BoxDecoration(
                    color: kInputBg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: kBorderColor),
                  ),
                  child: Obx(
                    () => DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: controller.statusFilter.value,
                        dropdownColor: const Color(0xFF1E1E30),
                        isExpanded: true,
                        icon: const Icon(
                          Icons.filter_list_rounded,
                          color: Colors.white54,
                          size: 16,
                        ),
                        items: [
                          DropdownMenuItem(
                            value: 'all',
                            child: Text(
                              'all_statuses'.tr,
                              style: const TextStyle(color: Colors.white, fontSize: 11),
                            ),
                          ),
                          DropdownMenuItem(
                            value: 'paid',
                            child: Text(
                              'paid'.tr,
                              style: const TextStyle(color: Color(0xFF34D399), fontSize: 11),
                            ),
                          ),
                          DropdownMenuItem(
                            value: 'issued',
                            child: Text(
                              'issued_unpaid'.tr,
                              style: const TextStyle(color: Color(0xFFFBBF24), fontSize: 11),
                            ),
                          ),
                          DropdownMenuItem(
                            value: 'overdue',
                            child: Text(
                              'overdue'.tr,
                              style: const TextStyle(color: Color(0xFFF87171), fontSize: 11),
                            ),
                          ),
                        ],
                        onChanged: (val) {
                          if (val != null) {
                            controller.onStatusFilterChanged(val);
                          }
                        },
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),

              // Search Bar
              Expanded(
                flex: 5,
                child: TextField(
                  controller: controller.searchController,
                  onChanged: controller.onSearchChanged,
                  style: const TextStyle(color: Colors.white, fontSize: 11.5),
                  decoration: InputDecoration(
                    hintText: 'search_invoice_ph'.tr,
                    hintStyle: const TextStyle(color: Colors.white38, fontSize: 11),
                    prefixIcon: const Icon(Icons.search_rounded, color: Colors.white38, size: 16),
                    filled: true,
                    fillColor: kInputBg,
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(color: kBorderColor),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(color: kBorderColor),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(color: Color(0xFF6366F1)),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Invoices Items List
          Obx(() {
            final pagedList = controller.pagedInvoices;
            if (pagedList.isEmpty) {
              return Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 28, horizontal: 16),
                decoration: BoxDecoration(
                  color: kInputBg.withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: kBorderColor),
                ),
                child: Column(
                  children: [
                    const Icon(
                      Icons.receipt_long_outlined,
                      color: Colors.white30,
                      size: 32,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'no_matching_transactions'.tr,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: Colors.white54,
                        fontSize: 11.5,
                      ),
                    ),
                  ],
                ),
              );
            }

            return Column(
              children: [
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: pagedList.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final inv = pagedList[index];
                    return _buildInvoiceCard(inv, currencyFormatter);
                  },
                ),
                const SizedBox(height: 14),

                // Pagination Controls
                _buildPaginationControls(),
              ],
            );
          }),
        ],
      ),
    );
  }

  Widget _buildInvoiceCard(LiveInvoiceItem inv, NumberFormat currencyFormatter) {
    Color statusBg = const Color(0xFF064E3B).withValues(alpha: 0.35);
    Color statusBorder = const Color(0xFF10B981).withValues(alpha: 0.5);
    Color statusColor = const Color(0xFF34D399);

    if (inv.status == 'issued') {
      statusBg = const Color(0xFF78350F).withValues(alpha: 0.35);
      statusBorder = const Color(0xFFF59E0B).withValues(alpha: 0.5);
      statusColor = const Color(0xFFFBBF24);
    } else if (inv.status == 'overdue') {
      statusBg = const Color(0xFF7F1D1D).withValues(alpha: 0.35);
      statusBorder = const Color(0xFFEF4444).withValues(alpha: 0.5);
      statusColor = const Color(0xFFF87171);
    }

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF181827),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF26263B)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: Code Badge, Client Name, Payer Type, Status
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E3A8A).withValues(alpha: 0.4),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.5)),
                ),
                child: Text(
                  inv.code,
                  style: const TextStyle(
                    color: Color(0xFF93C5FD),
                    fontSize: 10.5,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      inv.customerName,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12.5,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    Text(
                      inv.formattedPayerType,
                      style: const TextStyle(
                        color: Colors.white38,
                        fontSize: 10,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: statusBg,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: statusBorder),
                ),
                child: Text(
                  inv.formattedStatusLabel.toUpperCase(),
                  style: TextStyle(
                    color: statusColor,
                    fontSize: 9.5,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Details Grid (Category, Dates, Taxable, Tax, Gross Total)
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF131320),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${'category'.tr}:',
                      style: const TextStyle(color: Colors.white38, fontSize: 10.5),
                    ),
                    Text(
                      inv.formattedBillingStream,
                      style: const TextStyle(
                        color: Color(0xFFA5B4FC),
                        fontSize: 10.5,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${'issue_date'.tr} / ${'due_date'.tr}:',
                      style: const TextStyle(color: Colors.white38, fontSize: 10.5),
                    ),
                    Text(
                      '${inv.issuedAt.split('T').first} → ${inv.dueAt.isNotEmpty ? inv.dueAt.split('T').first : '—'}',
                      style: const TextStyle(color: Colors.white70, fontSize: 10.5),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                const Divider(color: Color(0x14FFFFFF), height: 1),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'taxable_subtotal'.tr,
                      style: const TextStyle(color: Colors.white54, fontSize: 10.5),
                    ),
                    Text(
                      currencyFormatter.format(inv.subtotal),
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 11,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 3),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'total_tax'.tr,
                      style: const TextStyle(color: Color(0xFFFBBF24), fontSize: 10.5),
                    ),
                    Text(
                      currencyFormatter.format(inv.taxAmount),
                      style: const TextStyle(
                        color: Color(0xFFFBBF24),
                        fontSize: 11,
                        fontFamily: 'monospace',
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 5),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'gross_total'.tr,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11.5,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      currencyFormatter.format(inv.total),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.w900,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // PAGINATION CONTROLS
  // ==========================================
  Widget _buildPaginationControls() {
    return Obx(() {
      final current = controller.currentPage.value;
      final total = controller.totalPages;

      return Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Previous Page Button
          OutlinedButton.icon(
            onPressed: current > 1
                ? () => controller.onPageChanged(current - 1)
                : null,
            icon: const Icon(Icons.chevron_left_rounded, size: 14),
            label: Text('previous'.tr, style: const TextStyle(fontSize: 11)),
            style: OutlinedButton.styleFrom(
              foregroundColor: Colors.white,
              disabledForegroundColor: Colors.white24,
              side: const BorderSide(color: kBorderColor),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
          ),

          // Page Indicator
          Text(
            '${'page'.tr} $current ${'of'.tr} $total',
            style: const TextStyle(
              color: Colors.white54,
              fontSize: 11,
              fontFamily: 'monospace',
            ),
          ),

          // Next Page Button
          OutlinedButton.icon(
            onPressed: current < total
                ? () => controller.onPageChanged(current + 1)
                : null,
            label: Text('next'.tr, style: const TextStyle(fontSize: 11)),
            icon: const Icon(Icons.chevron_right_rounded, size: 14),
            style: OutlinedButton.styleFrom(
              foregroundColor: Colors.white,
              disabledForegroundColor: Colors.white24,
              side: const BorderSide(color: kBorderColor),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
          ),
        ],
      );
    });
  }
}
