import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/advertiser_reports_controller.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../theme/app_colors.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import 'package:vmovexa/app/data/models/advertiser_report_model.dart';

class AdvertiserReportsView extends GetView<AdvertiserReportsController> {
  const AdvertiserReportsView({super.key});

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
                      'campaign_reports_title'.tr,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 17,
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
                        tooltip: 'refresh_reports_tooltip'.tr,
                      )),
                ],
              ),
            ),

            // Main Content Area
            Expanded(
              child: AdvertiserReportsContent(controller: controller),
            ),
          ],
        ),
      ),
    );
  }
}

/// Unified reusable widget for Campaign Reports
class AdvertiserReportsContent extends StatelessWidget {
  final AdvertiserReportsController controller;

  const AdvertiserReportsContent({super.key, required this.controller});

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      if (controller.isLoading.value && controller.reports.isEmpty) {
        return const Center(
          child: CircularProgressIndicator(color: Color(0xFF8B5CF6)),
        );
      }

      return RefreshIndicator(
        onRefresh: controller.handleRefresh,
        color: const Color(0xFF8B5CF6),
        backgroundColor: const Color(0xFF1E293B),
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Action Header (Export CSV with AppTheme.primaryGradient)
              _buildTopActionHeader(),
              const SizedBox(height: 14),

              // Report Customization Card (Target Campaign + Start Date & End Date Calendars)
              _buildCustomizationCard(context),
              const SizedBox(height: 14),

              // Active Scope Financial & Performance Snapshot
              _buildScopeFinancialSnapshot(),
              const SizedBox(height: 16),

              // Generated Reports Archive (Search + EXACTLY 3 Tabs: All, PDF, CSV + Single Download HTML Button)
              _buildReportsArchiveSection(),
              const SizedBox(height: 32),
            ],
          ),
        ),
      );
    });
  }

  // ==========================================================
  // TOP ACTIONS (EXPORT CSV WITH PRIMARY GRADIENT)
  // ==========================================================
  Widget _buildTopActionHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'campaign_reports_desc'.tr,
          style: const TextStyle(
            color: Colors.white60,
            fontSize: 11.5,
            height: 1.4,
          ),
        ),
        const SizedBox(height: 12),
        // Export CSV Primary Action Button
        GestureDetector(
          onTap: controller.isGenerating.value ? null : () => controller.handleExportCsv(),
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 12),
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF8B5CF6).withValues(alpha: 0.35),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                controller.isGenerating.value
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Icon(Icons.description_outlined, color: Colors.white, size: 18),
                const SizedBox(width: 8),
                Text(
                  controller.isGenerating.value ? 'exporting_text'.tr : 'export_csv'.tr,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ==========================================================
  // REPORT CUSTOMIZATION CARD (TARGET CAMPAIGN + CALENDAR PICKERS)
  // ==========================================================
  Widget _buildCustomizationCard(BuildContext context) {
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
              Row(
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF8B5CF6).withValues(alpha: 0.3)),
                    ),
                    child: const Icon(Icons.tune_rounded, color: Color(0xFFC084FC), size: 16),
                  ),
                  const SizedBox(width: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'report_customization_hdr'.tr,
                        style: const TextStyle(
                          color: Colors.white54,
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                        ),
                      ),
                      Text(
                        'select_audit_parameters_sub'.tr,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      SizedBox(height: 5),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.cardBorder),
                        ),
                        child: Text(
                          '${controller.totalCampaignsCount} ${'campaigns_in_portfolio'.tr}',
                          style: const TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ],
              ),

            ],
          ),
          const SizedBox(height: 14),

          // Target Campaign: Dropdown
          Text(
            'target_campaign_label'.tr,
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 11,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 6),
          GestureDetector(
            onTap: () => _openCampaignPickerSheet(),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      controller.activeCampaign != null
                          ? '${controller.activeCampaign!.displayTitle} — [${controller.activeCampaign!.displayCode}] (${controller.activeCampaign!.status.toUpperCase()})'
                          : 'all_campaigns_dropdown'.tr,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white54, size: 20),
                ],
              ),
            ),
          ),
          const SizedBox(height: 14),

          // Start Date & End Date Calendar Row
          Row(
            children: [
              // Start Date Picker Field
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'start_date_label'.tr,
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 6),
                    GestureDetector(
                      onTap: () => _pickStartDate(context),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F172A),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: controller.startDate.value != null
                                ? const Color(0xFF8B5CF6)
                                : AppColors.cardBorder,
                          ),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.calendar_today_rounded, color: Color(0xFF38BDF8), size: 14),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                controller.formattedStartDate.isNotEmpty
                                    ? controller.formattedStartDate
                                    : 'select_start_date'.tr,
                                style: TextStyle(
                                  color: controller.formattedStartDate.isNotEmpty
                                      ? Colors.white
                                      : Colors.white38,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            if (controller.startDate.value != null)
                              GestureDetector(
                                onTap: () => controller.setStartDate(null),
                                child: const Icon(Icons.close_rounded, color: Colors.white54, size: 14),
                              ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              // End Date Picker Field
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'end_date_label'.tr,
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 6),
                    GestureDetector(
                      onTap: () => _pickEndDate(context),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F172A),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: controller.endDate.value != null
                                ? const Color(0xFF8B5CF6)
                                : AppColors.cardBorder,
                          ),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.calendar_today_rounded, color: Color(0xFF38BDF8), size: 14),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                controller.formattedEndDate.isNotEmpty
                                    ? controller.formattedEndDate
                                    : 'select_end_date'.tr,
                                style: TextStyle(
                                  color: controller.formattedEndDate.isNotEmpty
                                      ? Colors.white
                                      : Colors.white38,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            if (controller.endDate.value != null)
                              GestureDetector(
                                onTap: () => controller.setEndDate(null),
                                child: const Icon(Icons.close_rounded, color: Colors.white54, size: 14),
                              ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Future<void> _pickStartDate(BuildContext context) async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: controller.startDate.value ?? now,
      firstDate: DateTime(2020),
      lastDate: DateTime(2035),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.dark(
              primary: Color(0xFF8B5CF6),
              surface: Color(0xFF1E293B),
              onSurface: Colors.white,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      controller.setStartDate(picked);
    }
  }

  Future<void> _pickEndDate(BuildContext context) async {
    final first = controller.startDate.value ?? DateTime(2020);
    final initial = (controller.endDate.value != null && controller.endDate.value!.isAfter(first))
        ? controller.endDate.value!
        : (controller.startDate.value ?? DateTime.now());

    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: first,
      lastDate: DateTime(2035),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.dark(
              primary: Color(0xFF8B5CF6),
              surface: Color(0xFF1E293B),
              onSurface: Colors.white,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      controller.setEndDate(picked);
    }
  }

  void _openCampaignPickerSheet() {
    Get.bottomSheet(
      Container(
        constraints: BoxConstraints(maxHeight: Get.height * 0.75),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
        decoration: const BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          border: Border(top: BorderSide(color: AppColors.cardBorder, width: 1.2)),
        ),
        child: SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'select_campaign_report_lbl'.tr,
                    style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: Colors.white70),
                    onPressed: () => Get.back(),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Flexible(
                child: ListView(
                  shrinkWrap: true,
                  physics: const BouncingScrollPhysics(),
                  children: [
                    _buildPickerItem(
                      title: 'all_campaigns_dropdown'.tr,
                      subtitle: 'combines_all_campaigns_desc'.tr,
                      isSelected: controller.selectedCampaignId.value.isEmpty,
                      onTap: () {
                        controller.selectedCampaignId.value = '';
                        Get.back();
                      },
                    ),
                    const Divider(color: AppColors.cardBorder, height: 16),
                    ...controller.campaigns.map((c) {
                      final isSelected = controller.selectedCampaignId.value == c.id;
                      return _buildPickerItem(
                        title: c.displayTitle,
                        subtitle: 'Status: ${c.status.toUpperCase()} • Budget: ${c.formattedBudget}',
                        isSelected: isSelected,
                        onTap: () {
                          controller.selectedCampaignId.value = c.id;
                          Get.back();
                        },
                      );
                    }),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
      isScrollControlled: true,
    );
  }

  Widget _buildPickerItem({
    required String title,
    required String subtitle,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF1E293B) : const Color(0xFF0F172A),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? const Color(0xFF8B5CF6) : AppColors.cardBorder,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: TextStyle(
                color: isSelected ? const Color(0xFFC084FC) : Colors.white,
                fontSize: 12.5,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 2),
            Text(subtitle, style: const TextStyle(color: Colors.white54, fontSize: 10)),
          ],
        ),
      ),
    );
  }

  // ==========================================================
  // ACTIVE SCOPE FINANCIAL & PERFORMANCE SNAPSHOT
  // ==========================================================
  Widget _buildScopeFinancialSnapshot() {
    final active = controller.activeCampaign;

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
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'active_scope_snapshot_lbl'.tr,
                    style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'summary_metrics_desc'.tr,
                    style: const TextStyle(color: Colors.white54, fontSize: 10),
                  ),
                  const SizedBox(height: 2),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: AppColors.cardBorder),
                    ),
                    child: Text(
                      active != null ? active.displayCode : 'ALL-CAMPAIGNS',
                      style: const TextStyle(
                        color: Color(0xFF38BDF8),
                        fontFamily: 'monospace',
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),

            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildSnapshotPill(
                  label: 'TOTAL MANAGED',
                  value: '₹${controller.totalBudgetAmount.toStringAsFixed(0)}',
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildSnapshotPill(
                  label: 'AMOUNT SPENT',
                  value: '₹${controller.totalSpentAmount.toStringAsFixed(0)}',
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildSnapshotPill(
                  label: 'DELIVERED',
                  value: controller.totalImpressionsCount.toString(),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSnapshotPill({required String label, required String value}) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Colors.white38, fontSize: 8, fontWeight: FontWeight.bold)),
          const SizedBox(height: 3),
          Text(
            value,
            style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w900),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // ==========================================================
  // GENERATED REPORTS ARCHIVE (EXACTLY 3 TABS: ALL, PDF, CSV)
  // SINGLE DOWNLOAD HTML BUTTON ON RIGHT SIDE
  // ==========================================================
  Widget _buildReportsArchiveSection() {
    final reports = controller.paginatedReports;

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
          // Header with count badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'generated_reports_archive_hdr'.tr,
                style: const TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.bold),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Text(
                  '${controller.filteredReports.length} ${'records_count_label'.tr}',
                  style: const TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 2),
          Text(
            'generated_campaign_reports_archive_sub'.tr,
            style: const TextStyle(color: Colors.white54, fontSize: 10.5),
          ),
          const SizedBox(height: 12),

          // Format Filter Tabs - EXACTLY 3 TABS: All, PDF, CSV (with AppTheme.primaryGradient on active)
          _buildFormatFilterTabs(),
          const SizedBox(height: 12),

          // Search Input
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.cardBorder),
            ),
            child: Row(
              children: [
                const Icon(Icons.search_rounded, color: Colors.white38, size: 18),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    onChanged: controller.setReportSearch,
                    style: const TextStyle(color: Colors.white, fontSize: 12),
                    decoration: InputDecoration(
                      hintText: 'search_report_title_id_hint'.tr,
                      hintStyle: const TextStyle(color: Colors.white38, fontSize: 11),
                      border: InputBorder.none,
                      isDense: true,
                      contentPadding: const EdgeInsets.symmetric(vertical: 10),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Reports List
          if (reports.isEmpty)
            _buildEmptyArchivePlaceholder()
          else
            ...reports.map((rep) => _buildReportItemCard(rep)),

          // Pagination Controls
          if (controller.totalPages > 1) ...[
            const SizedBox(height: 12),
            _buildPaginationControls(),
          ],
        ],
      ),
    );
  }

  /// Exactly 3 tabs: all, pdf, csv
  Widget _buildFormatFilterTabs() {
    final formats = [
      {'key': 'all', 'label': 'format_all_tab'.tr},
      {'key': 'pdf', 'label': 'format_pdf_tab'.tr},
      {'key': 'csv', 'label': 'format_csv_tab'.tr},
    ];

    return Row(
      children: formats.map((fmt) {
        final key = fmt['key'] as String;
        final isSelected = controller.formatFilter.value == key;

        return Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 3),
            child: GestureDetector(
              onTap: () => controller.setFormatFilter(key),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(vertical: 8),
                decoration: BoxDecoration(
                  gradient: isSelected ? AppTheme.primaryGradient : null,
                  color: isSelected ? null : const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(10),
                  border: isSelected ? null : Border.all(color: AppColors.cardBorder),
                  boxShadow: isSelected
                      ? [
                          BoxShadow(
                            color: const Color(0xFF8B5CF6).withValues(alpha: 0.35),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ]
                      : null,
                ),
                child: Center(
                  child: Text(
                    fmt['label'] as String,
                    style: TextStyle(
                      color: isSelected ? Colors.white : Colors.white60,
                      fontSize: 11,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  /// Archive Card with Single "Download HTML" button on the right side
  Widget _buildReportItemCard(AdvertiserReportModel rep) {
    Color formatBadgeColor = const Color(0xFF8B5CF6);
    if (rep.format == 'PDF' || rep.format == 'HTML') {
      formatBadgeColor = const Color(0xFFF43F5E);
    } else if (rep.format == 'CSV') {
      formatBadgeColor = const Color(0xFF38BDF8);
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    Flexible(
                      child: Text(
                        rep.title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12.5,
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: formatBadgeColor.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: formatBadgeColor.withValues(alpha: 0.4)),
                      ),
                      child: Text(
                        rep.format == 'PDF' ? 'HTML' : rep.format,
                        style: TextStyle(
                          color: formatBadgeColor,
                          fontFamily: 'monospace',
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.circle, color: Color(0xFF10B981), size: 5),
                    const SizedBox(width: 4),
                    Text(
                      'ready_status_badge'.tr,
                      style: const TextStyle(color: Color(0xFF34D399), fontSize: 8.5, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Expanded(
                child: Text(
                  '${'compiled_at_prefix'.tr} ${rep.generatedOn} · #${rep.id}',
                  style: const TextStyle(color: Colors.white54, fontSize: 10),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),

              // Single "Download HTML" Button on right side
              GestureDetector(
                onTap: () => controller.handleDownloadHtml(rep),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFF38BDF8).withValues(alpha: 0.5)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.download_rounded, color: Color(0xFF38BDF8), size: 14),
                      const SizedBox(width: 5),
                      Text(
                        'download_html_btn'.tr,
                        style: const TextStyle(
                          color: Color(0xFF38BDF8),
                          fontSize: 10.5,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPaginationControls() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          '${'page'.tr} ${controller.currentPage.value} ${'of'.tr} ${controller.totalPages}',
          style: const TextStyle(color: Colors.white54, fontSize: 11),
        ),
        Row(
          children: [
            GestureDetector(
              onTap: controller.currentPage.value > 1
                  ? () => controller.currentPage.value--
                  : null,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: controller.currentPage.value > 1
                      ? const Color(0xFF1E293B)
                      : const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Text(
                  'prev_btn'.tr,
                  style: TextStyle(
                    color: controller.currentPage.value > 1 ? Colors.white : Colors.white24,
                    fontSize: 10.5,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            GestureDetector(
              onTap: controller.currentPage.value < controller.totalPages
                  ? () => controller.currentPage.value++
                  : null,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  gradient: controller.currentPage.value < controller.totalPages
                      ? AppTheme.primaryGradient
                      : null,
                  color: controller.currentPage.value < controller.totalPages
                      ? null
                      : const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(8),
                  border: controller.currentPage.value < controller.totalPages
                      ? null
                      : Border.all(color: AppColors.cardBorder),
                  boxShadow: controller.currentPage.value < controller.totalPages
                      ? [
                          BoxShadow(
                            color: const Color(0xFF8B5CF6).withValues(alpha: 0.25),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ]
                      : null,
                ),
                child: Text(
                  'next'.tr,
                  style: TextStyle(
                    color: controller.currentPage.value < controller.totalPages
                        ? Colors.white
                        : Colors.white24,
                    fontSize: 10.5,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildEmptyArchivePlaceholder() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 24),
      alignment: Alignment.center,
      child: Column(
        children: [
          const Icon(Icons.description_outlined, color: Colors.white24, size: 36),
          const SizedBox(height: 8),
          Text(
            'no_reports_found_title'.tr,
            style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            controller.reportSearch.value.isNotEmpty
                ? 'no_reports_search_sub'.tr
                : 'no_reports_generate_sub'.tr,
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.white38, fontSize: 10.5),
          ),
        ],
      ),
    );
  }
}
