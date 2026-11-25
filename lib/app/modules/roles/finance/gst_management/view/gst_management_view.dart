import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controller/gst_management_controller.dart';
import '../model/gst_model.dart';

class GSTManagementView extends GetView<GSTManagementController> {
  const GSTManagementView({super.key});

  static const Color kBg = Color(0xFF0D0D15);
  static const Color kCardBg = Color(0xFF151522);
  static const Color kBorderColor = Color(0xFF232336);
  static const Color kInputBg = Color(0xFF1B1B2C);

  @override
  Widget build(BuildContext context) {
    if (!Get.isRegistered<GSTManagementController>()) {
      Get.put(GSTManagementController());
    }

    final currencyFormatter = NumberFormat.currency(
      locale: 'en_IN',
      symbol: '₹',
      decimalDigits: 0,
    );

    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Column(
          children: [
            // Top App Bar with Title, Status & Actions
            _buildAppBar(context),

            // Tab Bar with AppTheme.primaryGradient
            _buildTabBar(),

            // Source of Truth Info Banner
            _buildSourceOfTruthBanner(),

            // Tab Views: 3 Tabs (GST Overview | GSTIN Information | GST Amounts & Breakup)
            Expanded(
              child: Obx(() {
                if (controller.isLoading.value && controller.gstSummary.value == null) {
                  return const Center(
                    child: CircularProgressIndicator(color: Color(0xFF6366F1)),
                  );
                }

                final summary = controller.gstSummary.value ?? GstSummaryModel.empty();

                return TabBarView(
                  controller: controller.tabController,
                  children: [
                    // TAB 1: GST OVERVIEW
                    _buildOverviewTab(summary, currencyFormatter),

                    // TAB 2: GSTIN INFORMATION
                    _buildGstinInformationTab(summary, currencyFormatter),

                    // TAB 3: GST AMOUNTS & BREAKUP
                    _buildAmountsAndBreakupTab(summary, currencyFormatter),
                  ],
                );
              }),
            ),
          ],
        ),
      ),
    );
  }

  // ==========================================
  // TOP APP BAR & PERIOD CONTROLS
  // ==========================================
  Widget _buildAppBar(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      decoration: const BoxDecoration(
        color: Color(0xFF13131F),
        border: Border(bottom: BorderSide(color: Color(0xFF1F1F30), width: 1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Back Button
              IconButton(
                onPressed: () => Get.back(),
                icon: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
                style: IconButton.styleFrom(
                  backgroundColor: const Color(0xFF1C1C2D),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  padding: const EdgeInsets.all(8),
                  minimumSize: const Size(36, 36),
                ),
              ),
              const SizedBox(width: 10),

              // Title & GSTIN Verification Status Badge
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            'gst_governance_title'.tr,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 16.5,
                              fontWeight: FontWeight.w900,
                              letterSpacing: -0.3,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Obx(() {
                          final summary = controller.gstSummary.value;
                          final isConfigured = summary?.verificationStatus == 'configured';
                          return Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                            decoration: BoxDecoration(
                              color: isConfigured
                                  ? const Color(0xFF064E3B).withValues(alpha: 0.5)
                                  : const Color(0xFF78350F).withValues(alpha: 0.5),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(
                                color: isConfigured
                                    ? const Color(0xFF10B981).withValues(alpha: 0.4)
                                    : const Color(0xFFF59E0B).withValues(alpha: 0.4),
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.check_circle_rounded,
                                  size: 11,
                                  color: isConfigured ? const Color(0xFF34D399) : const Color(0xFFFBBF24),
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  isConfigured ? 'gstin_configured'.tr : 'gstin_not_configured'.tr,
                                  style: TextStyle(
                                    color: isConfigured ? const Color(0xFF34D399) : const Color(0xFFFBBF24),
                                    fontSize: 9.5,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          );
                        }),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'subtitle_paid_basis'.tr,
                      style: const TextStyle(color: Colors.white54, fontSize: 10.5),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),

              // Refresh Button
              Obx(() => IconButton(
                    onPressed: controller.isRefreshing.value ? null : controller.handleRefresh,
                    icon: controller.isRefreshing.value
                        ? const SizedBox(
                            width: 14,
                            height: 14,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white70),
                            ),
                          )
                        : const Icon(Icons.refresh_rounded, color: Colors.white70, size: 18),
                    style: IconButton.styleFrom(
                      backgroundColor: const Color(0xFF1C1C2D),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      minimumSize: const Size(36, 36),
                    ),
                    tooltip: 'refresh'.tr,
                  )),
            ],
          ),
          const SizedBox(height: 10),

          // Period Filters Row: Month Picker Button + All Time Pill
          Row(
            children: [
              // Month Selector Pill
              Expanded(
                child: Obx(() {
                  final isAll = controller.isAllTime.value;
                  final ym = controller.periodMonth.value;
                  final displayText = isAll || ym.isEmpty
                      ? 'select_gst_month'.tr
                      : _formatYearMonth(ym);

                  return InkWell(
                    onTap: () => controller.pickMonth(context),
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                      decoration: BoxDecoration(
                        color: kInputBg,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: !isAll ? const Color(0xFF6366F1) : const Color(0xFF28283E),
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.calendar_today_rounded, color: Colors.white70, size: 13),
                              const SizedBox(width: 6),
                              Text(
                                displayText,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          const Icon(Icons.arrow_drop_down_rounded, color: Colors.white54, size: 18),
                        ],
                      ),
                    ),
                  );
                }),
              ),
              const SizedBox(width: 8),

              // All Time Button
              Obx(() {
                final isAll = controller.isAllTime.value;
                return InkWell(
                  onTap: () => controller.setAllTime(),
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                    decoration: BoxDecoration(
                      gradient: isAll ? AppTheme.primaryGradient : null,
                      color: isAll ? null : kInputBg,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: isAll ? Colors.transparent : const Color(0xFF28283E),
                      ),
                    ),
                    child: Text(
                      'all_time'.tr,
                      style: TextStyle(
                        color: isAll ? Colors.white : Colors.white70,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                );
              }),
            ],
          ),
        ],
      ),
    );
  }

  String _formatYearMonth(String ym) {
    try {
      final parts = ym.split('-');
      if (parts.length == 2) {
        final d = DateTime(int.parse(parts[0]), int.parse(parts[1]));
        return DateFormat('MMM yyyy').format(d);
      }
    } catch (_) {}
    return ym;
  }

  // ==========================================
  // SOURCE OF TRUTH BANNER
  // ==========================================
  Widget _buildSourceOfTruthBanner() {
    return Obx(() {
      final summary = controller.gstSummary.value;
      final ym = controller.periodMonth.value;
      final isAll = controller.isAllTime.value;
      final periodText = isAll || ym.isEmpty ? 'all_time'.tr : ym;

      return Container(
        margin: const EdgeInsets.fromLTRB(16, 8, 16, 4),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: const Color(0xFF1E3A8A).withValues(alpha: 0.18),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.3)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                const Icon(Icons.receipt_long_rounded, color: Color(0xFF60A5FA), size: 14),
                const SizedBox(width: 6),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'source_of_truth_banner'.tr,
                      style: const TextStyle(
                        color: Color(0xFF93C5FD),
                        fontSize: 10.5,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      '${'period_label'.tr}: $periodText${summary != null && summary.repairedRecords > 0 ? ' · ${'reconciled_records'.tr} ${summary.repairedRecords}' : ''}',
                      style: const TextStyle(color: Colors.white54, fontSize: 10.5),
                    ),
                  ],
                ),
              ],
            ),

          ],
        ),
      );
    });
  }

  // ==========================================
  // TAB BAR WITH AppTheme.primaryGradient
  // ==========================================
  Widget _buildTabBar() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: const Color(0xFF151522),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorderColor),
      ),
      child: TabBar(
        controller: controller.tabController,
        indicator: BoxDecoration(
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
        indicatorSize: TabBarIndicatorSize.tab,
        dividerColor: Colors.transparent,
        labelColor: Colors.white,
        unselectedLabelColor: Colors.white60,
        labelStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
        unselectedLabelStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
        tabs: [
          Tab(text: 'tab_overview'.tr),
          Tab(text: 'tab_gstin_info'.tr),
          Tab(text: 'tab_breakup'.tr),
        ],
      ),
    );
  }

  // ==========================================
  // TAB 1: GST OVERVIEW
  // ==========================================
  Widget _buildOverviewTab(GstSummaryModel summary, NumberFormat currencyFormatter) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 5 Overview KPI Cards matching Admin Panel 1:1
          LayoutBuilder(builder: (context, constraints) {
            final cardWidth = (constraints.maxWidth - 10) / 2;
            return Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                // 1. Total Taxable Value
                _buildKpiCard(
                  width: cardWidth,
                  title: 'total_taxable_value'.tr,
                  value: currencyFormatter.format(summary.taxableValue),
                  sub: 'billed_outward_sales'.tr,
                  valColor: Colors.white,
                ),
                // 2. CGST
                _buildKpiCard(
                  width: cardWidth,
                  title: 'cgst'.tr,
                  value: currencyFormatter.format(summary.cgst),
                  sub: 'central_gst_accrued'.tr,
                  valColor: const Color(0xFF34D399),
                ),
                // 3. SGST
                _buildKpiCard(
                  width: cardWidth,
                  title: 'sgst'.tr,
                  value: currencyFormatter.format(summary.sgst),
                  sub: 'state_gst_accrued'.tr,
                  valColor: const Color(0xFF60A5FA),
                ),
                // 4. IGST
                _buildKpiCard(
                  width: cardWidth,
                  title: 'igst'.tr,
                  value: currencyFormatter.format(summary.igst),
                  sub: 'integrated_gst_breakdowns'.tr,
                  valColor: const Color(0xFFA78BFA),
                ),
                // 5. GST Compensation Cess
                _buildKpiCard(
                  width: cardWidth,
                  title: 'gst_compensation_cess'.tr,
                  value: currencyFormatter.format(summary.compensationCess),
                  sub: 'statutory_cess_levy'.tr,
                  valColor: const Color(0xFFFBBF24),
                ),
                // 6. Other Statutory Tax
                _buildKpiCard(
                  width: cardWidth,
                  title: 'other_statutory_tax'.tr,
                  value: currencyFormatter.format(summary.otherStatutoryTax),
                  sub: 'other_applicable_taxes'.tr,
                  valColor: const Color(0xFF38BDF8),
                ),
                // 7. Total GST
                _buildKpiCard(
                  width: constraints.maxWidth,
                  title: 'total_gst'.tr,
                  value: currencyFormatter.format(summary.totalGst),
                  sub: 'aggregate_gst_liability'.tr,
                  valColor: const Color(0xFFC084FC),
                ),
              ],
            );
          }),
          const SizedBox(height: 16),

          // Corporate GST Registration Card (Configuration Record)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: kCardBg,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: kBorderColor),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'corp_gst_reg'.tr,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12.5,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                          ),
                        ),
                        Text(
                          'verified_gst_id'.tr,
                          style: const TextStyle(color: Colors.white38, fontSize: 10),
                        ),
                        SizedBox(height: 5,),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1E3A8A).withValues(alpha: 0.4),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.5)),
                          ),
                          child: Text(
                            'configuration_record'.tr,
                            style: const TextStyle(
                              color: Color(0xFF93C5FD),
                              fontSize: 9.5,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),

                  ],
                ),
                const SizedBox(height: 14),

                _buildConfigField('legal_entity_name'.tr, summary.legalName),
                const SizedBox(height: 10),
                _buildConfigField(
                  'gstin_reg'.tr,
                  summary.gstin,
                  isMono: true,
                  highlightColor: const Color(0xFF60A5FA),
                ),
                const SizedBox(height: 10),
                _buildConfigField(
                  'principal_place'.tr,
                  summary.stateCode.isNotEmpty
                      ? '${summary.state} (${'gst_state_code'.tr}: ${summary.stateCode})'
                      : summary.state,
                ),
                const SizedBox(height: 10),
                _buildConfigField('filing_cycle'.tr, summary.filingFrequency),
                const SizedBox(height: 10),
                _buildConfigField('admin_jurisdiction'.tr, summary.jurisdiction),
              ],
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  // ==========================================
  // TAB 2: GSTIN INFORMATION
  // ==========================================
  Widget _buildGstinInformationTab(GstSummaryModel summary, NumberFormat currencyFormatter) {
    final list = summary.customerGstinSummary;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Title & Subtitle matching Admin Panel 1:1
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: kCardBg,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: kBorderColor),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'customer_gstin_filing_summary'.tr,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'customer_gstin_subtitle'.tr,
                  style: const TextStyle(color: Colors.white54, fontSize: 11),
                ),
                const SizedBox(height: 14),

                // Empty state if no records
                if (list.isEmpty)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: kInputBg,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF28283E)),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'no_customer_gstin_records'.tr,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  fontFamily: 'monospace',
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'no_customer_gstin_desc'.tr,
                                style: const TextStyle(color: Colors.white54, fontSize: 11),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFF064E3B).withValues(alpha: 0.5),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                          ),
                          child: Text(
                            'empty_period'.tr,
                            style: const TextStyle(
                              color: Color(0xFF34D399),
                              fontSize: 9.5,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  )
                else
                  // Customer GSTIN List
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: list.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final item = list[index];
                      return Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: kInputBg,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFF28283E)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item.gstin,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 13,
                                      fontWeight: FontWeight.bold,
                                      fontFamily: 'monospace',
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  RichText(
                                    text: TextSpan(
                                      style: const TextStyle(color: Colors.white54, fontSize: 11),
                                      children: [
                                        TextSpan(text: '${'billed_invoices_label'.tr} '),
                                        TextSpan(
                                          text: '${item.invoicesCount} ',
                                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                                        ),
                                        TextSpan(text: '· ${'taxable_value'.tr}: '),
                                        TextSpan(
                                          text: '${currencyFormatter.format(item.taxableAmount)} ',
                                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                                        ),
                                        TextSpan(text: '· ${'total_tax'.tr}: '),
                                        TextSpan(
                                          text: currencyFormatter.format(item.totalTax),
                                          style: const TextStyle(
                                            color: Color(0xFF60A5FA),
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: const Color(0xFF064E3B).withValues(alpha: 0.5),
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                              ),
                              child: Text(
                                item.status.isNotEmpty ? item.status : 'status_recorded'.tr,
                                style: const TextStyle(
                                  color: Color(0xFF34D399),
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
              ],
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  // ==========================================
  // TAB 3: GST AMOUNTS & BREAKUP (5 BOXES + TABLE)
  // ==========================================
  Widget _buildAmountsAndBreakupTab(GstSummaryModel summary, NumberFormat currencyFormatter) {
    final breakup = summary.breakup;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Exact 5 Metric Boxes requested:
          // 1. Total Taxable Value
          // 2. GST Compensation Cess
          // 3. Other Statutory Tax
          // 4. Total GST Liability
          // 5. IGST
          LayoutBuilder(builder: (context, constraints) {
            final cardWidth = (constraints.maxWidth - 10) / 2;
            return Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                // 1. Total Taxable Value
                _buildKpiCard(
                  width: cardWidth,
                  title: 'total_taxable_value'.tr,
                  value: currencyFormatter.format(summary.taxableValue),
                  sub: 'billed_outward_sales'.tr,
                  valColor: Colors.white,
                ),

                // 2. GST Compensation Cess
                _buildKpiCard(
                  width: cardWidth,
                  title: 'gst_compensation_cess'.tr,
                  value: currencyFormatter.format(summary.compensationCess),
                  sub: 'statutory_cess_levy'.tr,
                  valColor: const Color(0xFFFBBF24),
                ),

                // 3. Other Statutory Tax
                _buildKpiCard(
                  width: cardWidth,
                  title: 'other_statutory_tax'.tr,
                  value: currencyFormatter.format(summary.otherStatutoryTax),
                  sub: 'other_applicable_taxes'.tr,
                  valColor: const Color(0xFF60A5FA),
                ),

                // 4. Total GST Liability
                _buildKpiCard(
                  width: cardWidth,
                  title: 'total_gst_liability'.tr,
                  value: currencyFormatter.format(summary.totalGst),
                  sub: 'aggregate_gst_liability'.tr,
                  valColor: const Color(0xFFA78BFA),
                ),

                // 5. IGST
                _buildKpiCard(
                  width: constraints.maxWidth,
                  title: 'igst'.tr,
                  value: currencyFormatter.format(summary.igst),
                  sub: 'integrated_gst_breakdowns'.tr,
                  valColor: const Color(0xFF34D399),
                ),
              ],
            );
          }),
          const SizedBox(height: 16),

          // Detailed Tax Breakup Table / Cards
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: kCardBg,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: kBorderColor),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'headwise_breakup'.tr,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'gst_head_sub'.tr,
                  style: const TextStyle(color: Colors.white54, fontSize: 11),
                ),
                const SizedBox(height: 14),

                if (breakup.isEmpty)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 24),
                    alignment: Alignment.center,
                    child: Text(
                      'no_gst_breakup'.tr,
                      style: const TextStyle(color: Colors.white38, fontSize: 12),
                    ),
                  )
                else
                  // Rows Table Header
                  Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E1E30),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              flex: 3,
                              child: Text(
                                'tax_head'.tr.toUpperCase(),
                                style: const TextStyle(color: Colors.white54, fontSize: 10, fontWeight: FontWeight.bold),
                              ),
                            ),
                            Expanded(
                              flex: 2,
                              child: Text(
                                'rate'.tr.toUpperCase(),
                                style: const TextStyle(color: Colors.white54, fontSize: 10, fontWeight: FontWeight.bold),
                              ),
                            ),
                            Expanded(
                              flex: 3,
                              child: Text(
                                'referenced_taxable_value'.tr.toUpperCase(),
                                style: const TextStyle(color: Colors.white54, fontSize: 10, fontWeight: FontWeight.bold),
                              ),
                            ),
                            Expanded(
                              flex: 3,
                              child: Text(
                                'output_tax'.tr.toUpperCase(),
                                textAlign: TextAlign.right,
                                style: const TextStyle(color: Colors.white54, fontSize: 10, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 6),

                      // Rows Table Items
                      ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: breakup.length,
                        separatorBuilder: (context, index) => const SizedBox(height: 6),
                        itemBuilder: (context, index) {
                          final row = breakup[index];
                          return Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                            decoration: BoxDecoration(
                              color: kInputBg,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: const Color(0xFF28283E)),
                            ),
                            child: Row(
                              children: [
                                Expanded(
                                  flex: 3,
                                  child: Text(
                                    row.taxHead,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 11.5,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                Expanded(
                                  flex: 2,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF1E3A8A).withValues(alpha: 0.3),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(
                                      row.rate,
                                      style: const TextStyle(
                                        color: Color(0xFF93C5FD),
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ),
                                Expanded(
                                  flex: 3,
                                  child: Text(
                                    currencyFormatter.format(row.taxable),
                                    style: const TextStyle(
                                      color: Colors.white70,
                                      fontSize: 11,
                                      fontFamily: 'monospace',
                                    ),
                                  ),
                                ),
                                Expanded(
                                  flex: 3,
                                  child: Text(
                                    currencyFormatter.format(row.amount),
                                    textAlign: TextAlign.right,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 11.5,
                                      fontWeight: FontWeight.bold,
                                      fontFamily: 'monospace',
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ],
                  ),
              ],
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  // ==========================================
  // SHARED KPI & FIELD BUILDERS
  // ==========================================
  Widget _buildKpiCard({
    required double width,
    required String title,
    required String value,
    required String sub,
    required Color valColor,
  }) {
    return Container(
      width: width,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title.toUpperCase(),
            style: const TextStyle(
              color: Colors.white38,
              fontSize: 9,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 5),
          Text(
            value,
            style: TextStyle(
              color: valColor,
              fontSize: 15.5,
              fontWeight: FontWeight.w900,
              fontFamily: 'monospace',
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 3),
          Text(
            sub,
            style: const TextStyle(color: Colors.white54, fontSize: 10),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildConfigField(String label, String value, {bool isMono = false, Color? highlightColor}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: kInputBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF28283E)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: const TextStyle(color: Colors.white38, fontSize: 9, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 3),
          Text(
            value.isNotEmpty ? value : 'not_configured'.tr,
            style: TextStyle(
              color: highlightColor ?? Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.bold,
              fontFamily: isMono ? 'monospace' : null,
            ),
          ),
        ],
      ),
    );
  }
}
