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
                  const Expanded(
                    child: Text(
                      'Report & Analytics',
                      style: TextStyle(
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
                        tooltip: 'Refresh Reports',
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

/// Unified reusable widget for Report & Analytics
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
              // Top Action Buttons Header (PDF, XLSX, CSV Exports)
              _buildTopActionHeader(),
              const SizedBox(height: 14),

              // Customization & Filter Card
              _buildCustomizationCard(),
              const SizedBox(height: 14),

              // 4 Summary KPI Cards
              _buildKpiOverviewGrid(),
              const SizedBox(height: 14),

              // Active Scope Financial & Performance Snapshot
              _buildScopeFinancialSnapshot(),
              const SizedBox(height: 16),

              // Generated Reports Archive (Search + 4 Tabs: All, PDF, XLSX, CSV)
              _buildReportsArchiveSection(),
              const SizedBox(height: 32),
            ],
          ),
        ),
      );
    });
  }

  // ==========================================================
  // TOP ACTIONS (PDF, XLSX, CSV DOWNLOADS WITH GRADIENT)
  // ==========================================================
  Widget _buildTopActionHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Export verified DOOH proof-of-play records, GPS-validated screen broadcast logs, budget spend statements, and tax-compliant reconciliation files.',
          style: TextStyle(
            color: Colors.white60,
            fontSize: 11.5,
            height: 1.4,
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            // PDF Button
            Expanded(
              child: _buildExportButton(
                label: 'PDF Report',
                icon: Icons.picture_as_pdf_outlined,
                format: 'pdf',
                gradient: const LinearGradient(
                  colors: [Color(0xFFE11D48), Color(0xFFF43F5E)],
                ),
              ),
            ),
            const SizedBox(width: 8),
            // XLSX Button
            Expanded(
              child: _buildExportButton(
                label: 'Excel (.xlsx)',
                icon: Icons.table_chart_outlined,
                format: 'xlsx',
                gradient: const LinearGradient(
                  colors: [Color(0xFF059669), Color(0xFF10B981)],
                ),
              ),
            ),
            const SizedBox(width: 8),
            // CSV Button
            Expanded(
              child: _buildExportButton(
                label: 'Export CSV',
                icon: Icons.description_outlined,
                format: 'csv',
                gradient: AppTheme.primaryGradient,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildExportButton({
    required String label,
    required IconData icon,
    required String format,
    required LinearGradient gradient,
  }) {
    return GestureDetector(
      onTap: controller.isGenerating.value ? null : () => controller.handleExport(format),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          gradient: gradient,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: gradient.colors.first.withValues(alpha: 0.35),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: Colors.white, size: 14),
            const SizedBox(width: 6),
            Text(
              label,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 11,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ==========================================================
  // CUSTOMIZATION & FILTER CARD
  // ==========================================================
  Widget _buildCustomizationCard() {
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
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'REPORT CUSTOMIZATION',
                        style: TextStyle(
                          color: Colors.white54,
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                        ),
                      ),
                      Text(
                        'Select Audit Parameters',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Text(
                  '${controller.totalCampaignsCount} in Portfolio',
                  style: const TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Campaign Selector Dropdown Trigger
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
                          ? '${controller.activeCampaign!.displayTitle} [${controller.activeCampaign!.displayCode}]'
                          : 'All Campaigns Aggregate Audit',
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
        ],
      ),
    );
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
                  const Text(
                    'Select Campaign for Report',
                    style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
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
                      title: 'All Campaigns Aggregate Audit',
                      subtitle: 'Combines all DOOH campaign broadcasts across all corridors',
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
  // 4 KPI OVERVIEW SUMMARY CARDS
  // ==========================================================
  Widget _buildKpiOverviewGrid() {
    final kpis = [
      {
        'label': 'Total Campaigns',
        'value': controller.totalCampaignsCount.toString(),
        'sub': 'In System Portfolio',
        'icon': Icons.track_changes_rounded,
        'color': const Color(0xFF38BDF8),
      },
      {
        'label': 'Active Campaigns',
        'value': controller.activeCampaignsCount.toString(),
        'sub': 'Approved or Live',
        'icon': Icons.bolt_rounded,
        'color': const Color(0xFFF59E0B),
      },
      {
        'label': 'Total Managed',
        'value': '₹${controller.totalBudgetAmount.toStringAsFixed(0)}',
        'sub': 'All Campaigns Value',
        'icon': Icons.currency_rupee_rounded,
        'color': const Color(0xFF10B981),
      },
      {
        'label': 'Impressions Delivered',
        'value': controller.totalImpressionsCount.toString(),
        'sub': 'GPS-Verified Slots',
        'icon': Icons.tv_rounded,
        'color': const Color(0xFF8B5CF6),
      },
    ];

    return Column(
      children: [
        Row(
          children: [
            Expanded(child: _buildSmallKpiCard(kpis[0])),
            const SizedBox(width: 10),
            Expanded(child: _buildSmallKpiCard(kpis[1])),
          ],
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(child: _buildSmallKpiCard(kpis[2])),
            const SizedBox(width: 10),
            Expanded(child: _buildSmallKpiCard(kpis[3])),
          ],
        ),
      ],
    );
  }

  Widget _buildSmallKpiCard(Map<String, dynamic> item) {
    final color = item['color'] as Color;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                (item['label'] as String).toUpperCase(),
                style: const TextStyle(color: Colors.white54, fontSize: 8.5, fontWeight: FontWeight.bold),
              ),
              Icon(item['icon'] as IconData, color: color, size: 15),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            item['value'] as String,
            style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 2),
          Text(
            item['sub'] as String,
            style: const TextStyle(color: Colors.white38, fontSize: 9),
          ),
        ],
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
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Active Scope Financial Snapshot',
                    style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'Summary metrics compiled into exported reports.',
                    style: TextStyle(color: Colors.white54, fontSize: 10),
                  ),
                ],
              ),

            ],
          ),
          const SizedBox(height: 5),
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
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildSnapshotPill(
                  label: 'TOTAL AMOUNT',
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
      padding: const EdgeInsets.symmetric(vertical: 9, horizontal: 8),
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
  // GENERATED REPORTS ARCHIVE (TABS: ALL, PDF, XLSX, CSV)
  // ==========================================================
  Widget _buildReportsArchiveSection() {
    final reports = controller.paginatedReports;

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
          // Header with count badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Generated Reports Archive',
                style: TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.bold),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Text(
                  '${controller.filteredReports.length} Records',
                  style: const TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 2),
          const Text(
            'Previously compiled proof-of-play audits ready for instant download.',
            style: TextStyle(color: Colors.white54, fontSize: 10.5),
          ),
          const SizedBox(height: 12),

          // Format Filter Tabs (All, PDF, XLSX, CSV) with AppTheme.primaryGradient
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
                    decoration: const InputDecoration(
                      hintText: 'Search by report title or ID...',
                      hintStyle: TextStyle(color: Colors.white38, fontSize: 11),
                      border: InputBorder.none,
                      isDense: true,
                      contentPadding: EdgeInsets.symmetric(vertical: 10),
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

  Widget _buildFormatFilterTabs() {
    final formats = [
      {'key': 'all', 'label': 'All'},
      {'key': 'pdf', 'label': 'PDF'},
      {'key': 'xlsx', 'label': 'XLSX'},
      {'key': 'csv', 'label': 'CSV'},
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
                            color: const Color(0xFF8B5CF6).withValues(alpha: 0.3),
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

  Widget _buildReportItemCard(AdvertiserReportModel rep) {
    Color formatBadgeColor = const Color(0xFF8B5CF6);
    if (rep.format == 'PDF') {
      formatBadgeColor = const Color(0xFFF43F5E);
    } else if (rep.format == 'XLSX') {
      formatBadgeColor = const Color(0xFF10B981);
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
                        rep.format,
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
              SizedBox(width: 5),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.circle, color: Color(0xFF10B981), size: 5),
                    SizedBox(width: 4),
                    Text(
                      'Ready',
                      style: TextStyle(color: Color(0xFF34D399), fontSize: 8.5, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Compiled: ${rep.generatedOn} · #${rep.id}',
                style: const TextStyle(color: Colors.white54, fontSize: 10),
              ),


            ],
          ),
          const SizedBox(height: 6),
          // Download Button
          GestureDetector(
            onTap: () => controller.handleDownloadFile(rep),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.download_rounded, color: Color(0xFF38BDF8), size: 13),
                  const SizedBox(width: 4),
                  Text(
                    'Download ${rep.format}',
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
    );
  }

  Widget _buildPaginationControls() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          'Page ${controller.currentPage.value} of ${controller.totalPages}',
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
                  'Prev',
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
                ),
                child: Text(
                  'Next',
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
          const Text(
            'No reports found in this format',
            style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          const Text(
            'Click PDF Report, Excel (.xlsx), or Export CSV above to compile a fresh report.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.white38, fontSize: 10.5),
          ),
        ],
      ),
    );
  }
}

