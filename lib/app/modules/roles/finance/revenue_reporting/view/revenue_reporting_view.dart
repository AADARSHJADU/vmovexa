import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controller/revenue_reporting_controller.dart';
import '../model/report_models.dart';

class RevenueReportingView extends GetView<RevenueReportingController> {
  const RevenueReportingView({super.key});

  static const Color kBg = Color(0xFF0D0D15);
  static const Color kCardBg = Color(0xFF151522);
  static const Color kBorderColor = Color(0xFF232336);
  static const Color kInputBg = Color(0xFF1B1B2C);

  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat.currency(
      locale: 'en_IN',
      symbol: '₹',
      decimalDigits: 0,
    );

    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Obx(() {
          if (controller.isLoading.value &&
              controller.archiveReports.isEmpty &&
              controller.liveInvoices.isEmpty) {
            return const Center(
              child: CircularProgressIndicator(color: Color(0xFF3B82F6)),
            );
          }

          return Column(
            children: [
              _buildTopHeader(),
              Expanded(
                child: RefreshIndicator(
                  color: const Color(0xFF3B82F6),
                  backgroundColor: const Color(0xFF1B1B28),
                  onRefresh: controller.onRefresh,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 14,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // 1. LIVE PERIOD FINANCIAL KPI STRIP (4 BOXES)
                        _build4LiveKpiCards(currencyFormatter),
                        const SizedBox(height: 16),

                        // 2. SIMPLE GENERATION & FILTER STUDIO (Filter By Period + Category + Compile CSV)
                        _buildFilterStudioCard(context),
                        const SizedBox(height: 20),

                        // 3. WORKSPACE TABS & REGISTRY (Live Revenue Ledger | Compiled Reports)
                        _buildWorkspaceTabsAndRegistry(currencyFormatter),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          );
        }),
      ),
    );
  }

  // ==========================================
  // TOP APP BAR
  // ==========================================
  Widget _buildTopHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: Color(0xFF13131F),
        border: Border(bottom: BorderSide(color: Color(0xFF1F1F30), width: 1)),
      ),
      child: Row(
        children: [
          IconButton(
            onPressed: () => Get.back(),
            icon: const Icon(
              Icons.arrow_back_rounded,
              color: Colors.white,
              size: 20,
            ),
            style: IconButton.styleFrom(
              backgroundColor: const Color(0xFF1C1C2D),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              padding: const EdgeInsets.all(8),
              minimumSize: const Size(36, 36),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'financial_reports_and_ledgers'.tr,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 17,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.3,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  'financial_reports_sub'.tr,
                  style: const TextStyle(color: Colors.white54, fontSize: 10.5),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: controller.onRefresh,
            icon: const Icon(
              Icons.refresh_rounded,
              color: Colors.white70,
              size: 18,
            ),
            style: IconButton.styleFrom(
              backgroundColor: const Color(0xFF1C1C2D),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              minimumSize: const Size(36, 36),
            ),
            tooltip: 'refresh'.tr,
          ),
          const SizedBox(width: 6),
          TextButton(
            onPressed: () => Get.toNamed(Routes.GST_MANAGEMENT),
            style: TextButton.styleFrom(
              backgroundColor: const Color(0xFF1C1C2D),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
              minimumSize: Size.zero,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            child: const Text(
              'GST →',
              style: TextStyle(
                color: Color(0xFF60A5FA),
                fontSize: 11,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // SECTION 1: 4 LIVE KPI CARDS (Matching Admin Panel)
  // ==========================================
  Widget _build4LiveKpiCards(NumberFormat currencyFormatter) {
    return Obx(() {
      final isLoading = controller.summaryLoading.value;

      String realizedSub = 'settled_and_realized'.tr;
      if (controller.selectedReportType.value == 'subscription_revenue') {
        realizedSub =
            '${controller.activeSubs.value} ${'active_subscriptions'.tr}';
      } else if (controller.selectedReportType.value == 'revenue_summary') {
        realizedSub =
            'Subs ${currencyFormatter.format(controller.subRevenue.value)} · Ads ${currencyFormatter.format(controller.campaignRevenue.value)}';
      }

      final gstBreakdownSub =
          'CGST ${currencyFormatter.format(controller.cgstTotal.value)} · SGST ${currencyFormatter.format(controller.sgstTotal.value)}';

      return GridView.count(
        crossAxisCount: 2,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        childAspectRatio: 1.35,
        children: [
          // 1. GROSS INVOICED
          _buildKpiCard(
            icon: Icons.receipt_long_rounded,
            iconColor: const Color(0xFF818CF8),
            borderColor: const Color(0xFF312E81).withValues(alpha: 0.5),
            label: 'gross_invoiced'.tr.toUpperCase(),
            value: isLoading
                ? '...'
                : currencyFormatter.format(controller.totalBilled.value),
            sub: '${controller.invoiceCount.value} ${'invoices_in_period'.tr}',
          ),
          // 2. REALIZED COLLECTIONS
          _buildKpiCard(
            icon: Icons.payments_rounded,
            iconColor: const Color(0xFF34D399),
            borderColor: const Color(0xFF064E3B).withValues(alpha: 0.5),
            label: 'realized_collections'.tr.toUpperCase(),
            value: isLoading
                ? '...'
                : currencyFormatter.format(controller.totalRevenue.value),
            sub: realizedSub,
          ),
          // 3. TOTAL GST ACCRUED
          _buildKpiCard(
            icon: Icons.account_balance_rounded,
            iconColor: const Color(0xFFFBBF24),
            borderColor: const Color(0xFF78350F).withValues(alpha: 0.5),
            label: 'total_gst_accrued'.tr.toUpperCase(),
            value: isLoading
                ? '...'
                : currencyFormatter.format(controller.taxTotal.value),
            sub: gstBreakdownSub,
          ),
          // 4. OUTSTANDING RECEIVABLES
          _buildKpiCard(
            icon: Icons.warning_amber_rounded,
            iconColor: const Color(0xFFF87171),
            borderColor: const Color(0xFF7F1D1D).withValues(alpha: 0.5),
            label: 'outstanding_receivables'.tr.toUpperCase(),
            value: isLoading
                ? '...'
                : currencyFormatter.format(controller.pendingDues.value),
            sub: 'unpaid_balance'.tr,
          ),
        ],
      );
    });
  }

  Widget _buildKpiCard({
    required IconData icon,
    required Color iconColor,
    required Color borderColor,
    required String label,
    required String value,
    required String sub,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(5),
                decoration: BoxDecoration(
                  color: iconColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, color: iconColor, size: 14),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  label,
                  style: const TextStyle(
                    color: Colors.white54,
                    fontSize: 9.5,
                    fontWeight: FontWeight.bold,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w900,
              fontFamily: 'monospace',
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          Text(
            sub,
            style: const TextStyle(color: Colors.white38, fontSize: 9.5),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // ==========================================
  // SECTION 2: FILTER BY PERIOD & COMPILE STUDIO
  // ==========================================
  Widget _buildFilterStudioCard(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: kBorderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Filter By Period Header
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: const Color(0xFF3B82F6).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.calendar_month_rounded,
                  color: Color(0xFF60A5FA),
                  size: 16,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'filter_by_period'.tr.toUpperCase(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.8,
                      ),
                    ),
                    Text(
                      'select_reporting_period_desc'.tr,
                      style: const TextStyle(
                        color: Colors.white38,
                        fontSize: 10,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // 5 Period Presets (Matching Admin Panel)
          Wrap(
            spacing: 8,
            runSpacing: 6,
            children: [
              _buildPresetChip('preset_this_month'.tr, 'this_month'),
              _buildPresetChip('preset_last_30'.tr, 'last_30'),
              _buildPresetChip('preset_this_quarter'.tr, 'this_quarter'),
              _buildPresetChip('preset_this_year'.tr, 'this_year'),
              _buildPresetChip('preset_all_time'.tr, 'all'),
            ],
          ),
          const SizedBox(height: 14),

          // From & To Date selectors
          Row(
            children: [
              Expanded(
                child: InkWell(
                  onTap: () => controller.pickCustomDateRange(context),
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: kInputBg,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF28283E)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'from_date'.tr.toUpperCase(),
                          style: const TextStyle(
                            color: Colors.white38,
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Obx(
                          () => Text(
                            controller.startDate.value,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'monospace',
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: InkWell(
                  onTap: () => controller.pickCustomDateRange(context),
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: kInputBg,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF28283E)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'to_date'.tr.toUpperCase(),
                          style: const TextStyle(
                            color: Colors.white38,
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Obx(
                          () => Text(
                            controller.endDate.value,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'monospace',
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Report Category Dropdown
          Text(
            'report_category'.tr,
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 11,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
            decoration: BoxDecoration(
              color: kInputBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF28283E)),
            ),
            child: Obx(
              () => DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: controller.selectedReportType.value,
                  dropdownColor: const Color(0xFF1E1E30),
                  isExpanded: true,
                  icon: const Icon(
                    Icons.keyboard_arrow_down_rounded,
                    color: Colors.white70,
                  ),
                  items: controller.reportTypes.map((rt) {
                    return DropdownMenuItem<String>(
                      value: rt.id,
                      child: Row(
                        children: [
                          Icon(rt.icon, size: 16, color: rt.color),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              rt.labelKey.tr,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) {
                      controller.selectedReportType.value = val;
                      controller.loadReportSummary();
                    }
                  },
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Compile & Export CSV Button (Gradient)
          Obx(
            () => Container(
              width: double.infinity,
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.gradientPink.withValues(alpha: 0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: ElevatedButton.icon(
                onPressed: controller.isGenerating.value
                    ? null
                    : () => controller.onGenerateReport(),
                icon: controller.isGenerating.value
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : const Icon(
                        Icons.download_rounded,
                        size: 18,
                        color: Colors.white,
                      ),
                label: Text(
                  controller.isGenerating.value
                      ? 'compiling_report'.tr
                      : 'compile_export_csv'.tr,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  padding: const EdgeInsets.symmetric(vertical: 13),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPresetChip(String label, String id) {
    return Obx(() {
      final isSelected = controller.activePreset.value == id;
      return InkWell(
        onTap: () => controller.applyPreset(id),
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
          decoration: BoxDecoration(
            gradient: isSelected ? AppTheme.primaryGradient : null,
            color: isSelected ? null : const Color(0xFF1C1C2D),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: isSelected ? Colors.transparent : const Color(0xFF28283E),
            ),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: AppTheme.gradientPink.withValues(alpha: 0.3),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : null,
          ),
          child: Text(
            label,
            style: TextStyle(
              color: isSelected ? Colors.white : Colors.white70,
              fontSize: 11,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            ),
          ),
        ),
      );
    });
  }

  // ==========================================
  // SECTION 3: WORKSPACE TABS & REGISTRY
  // ==========================================
  Widget _buildWorkspaceTabsAndRegistry(NumberFormat currencyFormatter) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: kBorderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 2 Switcher Tabs (Live Revenue Ledger | Compiled Reports)
          Obx(() {
            final isLedger = controller.activeTab.value == 'ledger';
            final liveCount = controller.liveInvoices.length;
            final archiveCount = controller.archiveReports.length;

            return Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: const Color(0xFF131320),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: InkWell(
                      onTap: () => controller.activeTab.value = 'ledger',
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        decoration: BoxDecoration(
                          gradient: isLedger ? AppTheme.primaryGradient : null,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              'live_revenue_ledger_tab'.tr,
                              style: TextStyle(
                                color: isLedger ? Colors.white : Colors.white60,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 6,
                                vertical: 1,
                              ),
                              decoration: BoxDecoration(
                                color: isLedger
                                    ? Colors.white.withValues(alpha: 0.25)
                                    : const Color(0xFF222236),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                '$liveCount',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 4),
                  Expanded(
                    child: InkWell(
                      onTap: () => controller.activeTab.value = 'archive',
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        decoration: BoxDecoration(
                          gradient: !isLedger ? AppTheme.primaryGradient : null,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              'compiled_reports_tab'.tr,
                              style: TextStyle(
                                color: !isLedger
                                    ? Colors.white
                                    : Colors.white60,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 6,
                                vertical: 1,
                              ),
                              decoration: BoxDecoration(
                                color: !isLedger
                                    ? Colors.white.withValues(alpha: 0.25)
                                    : const Color(0xFF222236),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                '$archiveCount',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          }),
          const SizedBox(height: 8),

          // Workspace Tab Description
          Obx(
            () => Text(
              controller.activeTab.value == 'ledger'
                  ? 'live_ledger_desc'.tr
                  : 'compiled_archive_desc'.tr,
              style: const TextStyle(color: Colors.white38, fontSize: 10.5),
            ),
          ),
          const SizedBox(height: 14),

          // TAB CONTENT
          Obx(() {
            if (controller.activeTab.value == 'ledger') {
              return _buildTab1LiveLedgerView(currencyFormatter);
            } else {
              return _buildTab2CompiledArchiveView(currencyFormatter);
            }
          }),
        ],
      ),
    );
  }

  // ==========================================
  // TAB 1: LIVE REVENUE LEDGER
  // ==========================================
  Widget _buildTab1LiveLedgerView(NumberFormat currencyFormatter) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Controls Row: Status Filter & Search
        Row(
          children: [
            // Status Dropdown
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 0),
              decoration: BoxDecoration(
                color: kInputBg,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF28283E)),
              ),
              child: Obx(
                () => DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: controller.ledgerStatusFilter.value,
                    dropdownColor: const Color(0xFF1E1E30),
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
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                          ),
                        ),
                      ),
                      DropdownMenuItem(
                        value: 'paid',
                        child: Text(
                          'paid'.tr,
                          style: const TextStyle(
                            color: Color(0xFF34D399),
                            fontSize: 11,
                          ),
                        ),
                      ),
                      DropdownMenuItem(
                        value: 'issued',
                        child: Text(
                          'unpaid'.tr,
                          style: const TextStyle(
                            color: Color(0xFFFBBF24),
                            fontSize: 11,
                          ),
                        ),
                      ),
                      DropdownMenuItem(
                        value: 'overdue',
                        child: Text(
                          'overdue'.tr,
                          style: const TextStyle(
                            color: Color(0xFFF87171),
                            fontSize: 11,
                          ),
                        ),
                      ),
                      DropdownMenuItem(
                        value: 'draft',
                        child: Text(
                          'draft'.tr,
                          style: const TextStyle(
                            color: Colors.white60,
                            fontSize: 11,
                          ),
                        ),
                      ),
                    ],
                    onChanged: (val) {
                      if (val != null) {
                        controller.ledgerStatusFilter.value = val;
                        controller.ledgerPage.value = 1;
                      }
                    },
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            // Search Input
            Expanded(
              child: TextField(
                controller: controller.ledgerSearchController,
                onChanged: (val) {
                  controller.ledgerSearch.value = val;
                  controller.ledgerPage.value = 1;
                },
                style: const TextStyle(color: Colors.white, fontSize: 11.5),
                decoration: InputDecoration(
                  hintText: 'search_invoice_or_client'.tr,
                  hintStyle: const TextStyle(
                    color: Colors.white38,
                    fontSize: 11,
                  ),
                  prefixIcon: const Icon(
                    Icons.search_rounded,
                    color: Colors.white38,
                    size: 16,
                  ),
                  filled: true,
                  fillColor: kInputBg,
                  isDense: true,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 9,
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFF28283E)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFF28283E)),
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),

        // Live Invoices List
        Obx(() {
          if (controller.summaryLoading.value) {
            return const Padding(
              padding: EdgeInsets.symmetric(vertical: 24),
              child: Center(
                child: CircularProgressIndicator(color: Color(0xFF3B82F6)),
              ),
            );
          }

          final list = controller.pagedLiveInvoices;
          if (list.isEmpty) {
            return Container(
              padding: const EdgeInsets.symmetric(vertical: 36),
              alignment: Alignment.center,
              child: Text(
                'no_live_records_found'.tr,
                style: const TextStyle(color: Colors.white38, fontSize: 12),
                textAlign: TextAlign.center,
              ),
            );
          }

          return Column(
            children: [
              ...list.map(
                (inv) => _buildLiveInvoiceCard(inv, currencyFormatter),
              ),
              const SizedBox(height: 10),
              _buildPaginationControls(
                currentPage: controller.ledgerPage.value,
                totalPages: controller.ledgerTotalPages,
                totalItems: controller.filteredLiveInvoices.length,
                onPrev: () {
                  if (controller.ledgerPage.value > 1) {
                    controller.ledgerPage.value--;
                  }
                },
                onNext: () {
                  if (controller.ledgerPage.value < controller.ledgerTotalPages) {
                    controller.ledgerPage.value++;
                  }
                },
              ),
            ],
          );
        }),
      ],
    );
  }

  Widget _buildLiveInvoiceCard(
    LiveInvoiceItem inv,
    NumberFormat currencyFormatter,
  ) {
    Color statusColor = const Color(0xFFFBBF24);
    if (inv.status == 'paid') statusColor = const Color(0xFF34D399);
    if (inv.status == 'overdue') statusColor = const Color(0xFFF87171);

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF181827),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF26263B)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF3B82F6).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.description_outlined,
                  color: Color(0xFF60A5FA),
                  size: 18,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      inv.customerName,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        Text(
                          inv.code,
                          style: const TextStyle(
                            color: Color(0xFF93C5FD),
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'monospace',
                          ),
                        )
                      ],
                    ),
                    const SizedBox(width: 6),
                    Text(
                      inv.formattedPayerType,
                      style: const TextStyle(
                        color: Colors.white54,
                        fontSize: 10.5,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: statusColor.withValues(alpha: 0.4)),
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
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
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
                      'category'.tr,
                      style: const TextStyle(
                        color: Colors.white38,
                        fontSize: 10.5,
                      ),
                    ),
                    Text(
                      inv.formattedBillingStream,
                      style: const TextStyle(
                        color: Color(0xFFA5B4FC),
                        fontSize: 10.5,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'issue_date'.tr,
                      style: const TextStyle(
                        color: Colors.white38,
                        fontSize: 10.5,
                      ),
                    ),
                    Text(
                      inv.issuedAt.isEmpty ? '—' : inv.issuedAt,
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 10.5,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'taxable_subtotal'.tr,
                      style: const TextStyle(
                        color: Colors.white38,
                        fontSize: 10.5,
                      ),
                    ),
                    Text(
                      '${currencyFormatter.format(inv.subtotal)} + GST ${currencyFormatter.format(inv.taxAmount)}',
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 10,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ],
                ),
                const Divider(color: Color(0xFF222234), height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'gross_total'.tr,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11,
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
  // TAB 2: COMPILED REPORTS ARCHIVE
  // ==========================================
  Widget _buildTab2CompiledArchiveView(NumberFormat currencyFormatter) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Controls Row: Category Filter & Newest/Oldest Sort
        Row(
          children: [
            // Category Filter Dropdown
            Expanded(
              flex: 3,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 0),
                decoration: BoxDecoration(
                  color: kInputBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF28283E)),
                ),
                child: Obx(
                  () => DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: controller.selectedCategoryFilter.value,
                      dropdownColor: const Color(0xFF1E1E30),
                      isExpanded: true,
                      icon: const Icon(
                        Icons.category_outlined,
                        color: Colors.white54,
                        size: 16,
                      ),
                      items: [
                        DropdownMenuItem(
                          value: 'all',
                          child: Text(
                            'all_categories'.tr,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                            ),
                          ),
                        ),
                        DropdownMenuItem(
                          value: 'revenue_summary',
                          child: Text(
                            'finance_report_type_all_revenue'.tr,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                            ),
                          ),
                        ),
                      ],
                      onChanged: (val) {
                        if (val != null) {
                          controller.selectedCategoryFilter.value = val;
                          controller.archivePage.value = 1;
                        }
                      },
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            // Newest / Oldest Sort Dropdown
            Expanded(
              flex: 2,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 0),
                decoration: BoxDecoration(
                  color: kInputBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF28283E)),
                ),
                child: Obx(
                  () => DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: controller.archiveSort.value,
                      dropdownColor: const Color(0xFF1E1E30),
                      isExpanded: true,
                      icon: const Icon(
                        Icons.sort_rounded,
                        color: Colors.white54,
                        size: 16,
                      ),
                      items: [
                        DropdownMenuItem(
                          value: 'newest',
                          child: Text(
                            'newest_first'.tr,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                            ),
                          ),
                        ),
                        DropdownMenuItem(
                          value: 'oldest',
                          child: Text(
                            'oldest_first'.tr,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                            ),
                          ),
                        ),
                        DropdownMenuItem(
                          value: 'amount_high',
                          child: Text(
                            'highest_amount'.tr,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                            ),
                          ),
                        ),
                        DropdownMenuItem(
                          value: 'amount_low',
                          child: Text(
                            'lowest_amount'.tr,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                            ),
                          ),
                        ),
                        DropdownMenuItem(
                          value: 'title',
                          child: Text(
                            'name_az'.tr,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                            ),
                          ),
                        ),
                      ],
                      onChanged: (val) {
                        if (val != null) {
                          controller.archiveSort.value = val;
                          controller.archivePage.value = 1;
                        }
                      },
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),

        // Search Archive input
        TextField(
          controller: controller.archiveSearchController,
          onChanged: (val) {
            controller.archiveSearch.value = val;
            controller.archivePage.value = 1;
          },
          style: const TextStyle(color: Colors.white, fontSize: 11.5),
          decoration: InputDecoration(
            hintText: 'search_archive_reports'.tr,
            hintStyle: const TextStyle(color: Colors.white38, fontSize: 11),
            prefixIcon: const Icon(
              Icons.search_rounded,
              color: Colors.white38,
              size: 16,
            ),
            filled: true,
            fillColor: kInputBg,
            isDense: true,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 10,
              vertical: 9,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFF28283E)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFF28283E)),
            ),
          ),
        ),
        const SizedBox(height: 14),

        // Archive Reports List
        Obx(() {
          final list = controller.pagedArchiveReports;
          if (list.isEmpty) {
            return Container(
              padding: const EdgeInsets.symmetric(vertical: 36),
              alignment: Alignment.center,
              child: Text(
                'no_compiled_reports_found'.tr,
                style: const TextStyle(color: Colors.white38, fontSize: 12),
                textAlign: TextAlign.center,
              ),
            );
          }

          return Column(
            children: [
              ...list.map(
                (rep) => _buildArchiveReportTile(rep, currencyFormatter),
              ),
              const SizedBox(height: 10),
              _buildPaginationControls(
                currentPage: controller.archivePage.value,
                totalPages: controller.archiveTotalPages,
                totalItems: controller.filteredArchiveReports.length,
                onPrev: () {
                  if (controller.archivePage.value > 1) {
                    controller.archivePage.value--;
                  }
                },
                onNext: () {
                  if (controller.archivePage.value < controller.archiveTotalPages) {
                    controller.archivePage.value++;
                  }
                },
              ),
            ],
          );
        }),
      ],
    );
  }

  Widget _buildArchiveReportTile(
    RecentReport rep,
    NumberFormat currencyFormatter,
  ) {
    return InkWell(
      onTap: () => controller.openReportDetails(rep),
      borderRadius: BorderRadius.circular(14),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFF181827),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFF26263B)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF3B82F6).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.table_view_rounded,
                    color: Color(0xFF60A5FA),
                    size: 18,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        rep.title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 3),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 1,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(
                                0xFF1E3A8A,
                              ).withValues(alpha: 0.4),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              rep.id.startsWith('REP') ? rep.id : 'REP-${rep.id}',
                              style: const TextStyle(
                                color: Color(0xFF93C5FD),
                                fontSize: 9.5,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'monospace',
                              ),
                            ),
                          ),
                          if (rep.badge.isNotEmpty) ...[
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 6,
                                vertical: 1,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFF232338),
                                borderRadius: BorderRadius.circular(4),
                                border: Border.all(
                                  color: const Color(0xFF33334D),
                                ),
                              ),
                              child: Text(
                                _getBadgeTranslated(rep.badge),
                                style: const TextStyle(
                                  color: Color(0xFFA5B4FC),
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                          const SizedBox(width: 6),
                          Text(
                            rep.dateText,
                            style: const TextStyle(
                              color: Colors.white38,
                              fontSize: 10.5,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 6),
                const Icon(
                  Icons.arrow_forward_ios_rounded,
                  color: Colors.white30,
                  size: 13,
                ),
              ],
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
              decoration: BoxDecoration(
                color: const Color(0xFF131320),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Text(
                        '${'period'.tr}: ',
                        style: const TextStyle(
                          color: Colors.white38,
                          fontSize: 10.5,
                        ),
                      ),
                      Text(
                        rep.period,
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 10.5,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  if (rep.totalBilled > 0)
                    Text(
                      currencyFormatter.format(rep.totalBilled),
                      style: const TextStyle(
                        color: Color(0xFF34D399),
                        fontSize: 10.5,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'monospace',
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 10),
            // Action Buttons: Excel / CSV Download & Delete
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                // Excel / CSV Download CTA
                Container(
                  decoration: BoxDecoration(
                    gradient: AppTheme.primaryGradient,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: ElevatedButton.icon(
                    onPressed: () => controller.downloadCompiledReport(rep),
                    icon: const Icon(
                      Icons.download_rounded,
                      size: 14,
                      color: Colors.white,
                    ),
                    label: Text(
                      'export_excel_csv'.tr,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      shadowColor: Colors.transparent,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 6,
                      ),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  ),
                ),
                // const SizedBox(width: 8),
                // IconButton(
                //   onPressed: () => controller.confirmDeleteReport(rep),
                //   icon: const Icon(
                //     Icons.delete_outline_rounded,
                //     color: Color(0xFFEF4444),
                //     size: 16,
                //   ),
                //   style: IconButton.styleFrom(
                //     backgroundColor: const Color(
                //       0xFF7F1D1D,
                //     ).withValues(alpha: 0.2),
                //     padding: const EdgeInsets.all(6),
                //     minimumSize: const Size(28, 28),
                //     tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                //     shape: RoundedRectangleBorder(
                //       borderRadius: BorderRadius.circular(8),
                //     ),
                //   ),
                //   tooltip: 'delete_report'.tr,
                // ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // ==========================================
  // SHARED PAGINATION CONTROLS
  // ==========================================
  Widget _buildPaginationControls({
    required int currentPage,
    required int totalPages,
    required int totalItems,
    required VoidCallback onPrev,
    required VoidCallback onNext,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          '${'total'.tr}: $totalItems',
          style: const TextStyle(color: Colors.white38, fontSize: 11),
        ),
        Row(
          children: [
            IconButton(
              onPressed: currentPage > 1 ? onPrev : null,
              icon: const Icon(Icons.chevron_left_rounded, size: 18),
              style: IconButton.styleFrom(
                backgroundColor: const Color(0xFF181827),
                disabledBackgroundColor: const Color(0xFF131320),
                foregroundColor: Colors.white,
                disabledForegroundColor: Colors.white24,
                padding: const EdgeInsets.all(4),
                minimumSize: const Size(28, 28),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(6),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              '$currentPage / $totalPages',
              style: const TextStyle(
                color: Colors.white70,
                fontSize: 11,
                fontWeight: FontWeight.bold,
                fontFamily: 'monospace',
              ),
            ),
            const SizedBox(width: 8),
            IconButton(
              onPressed: currentPage < totalPages ? onNext : null,
              icon: const Icon(Icons.chevron_right_rounded, size: 18),
              style: IconButton.styleFrom(
                backgroundColor: const Color(0xFF181827),
                disabledBackgroundColor: const Color(0xFF131320),
                foregroundColor: Colors.white,
                disabledForegroundColor: Colors.white24,
                padding: const EdgeInsets.all(4),
                minimumSize: const Size(28, 28),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(6),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  String _getBadgeTranslated(String badge) {
    switch (badge) {
      case 'All Revenue':
        return 'badge_all_revenue'.tr;
      case 'Subscription':
        return 'badge_subscription'.tr;
      case 'Ad Spend':
        return 'badge_ad_spend'.tr;
      case 'Government':
        return 'badge_government'.tr;
      default:
        return badge;
    }
  }
}
