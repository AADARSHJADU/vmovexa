import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controllers/gov_compliance_reports_controller.dart';

class GovComplianceReportsView extends GetView<GovComplianceReportsController> {
  const GovComplianceReportsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.cardBg,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
          onPressed: () => Get.back(),
        ),
        title: Text(
          'gov_reports.compliance_reports'.tr,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          Obx(() {
            final isRef = controller.isRefreshing.value;
            return IconButton(
              icon: isRef
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Icon(Icons.refresh_rounded, color: Colors.white, size: 22),
              onPressed: isRef ? null : () => controller.handleRefresh(),
            );
          }),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: AppColors.cardBorder, height: 1),
        ),
      ),
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(
            child: CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF3B82F6)),
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () => controller.handleRefresh(),
          color: const Color(0xFF3B82F6),
          backgroundColor: AppColors.cardBg,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. Header Banner
                _buildHeaderBanner(context),
                const SizedBox(height: 16),

                // 2. Performance Trend Daily Bar Chart
                _buildPerformanceTrendSection(),
                const SizedBox(height: 16),

                // 3. Search and View Mode Toggle
                _buildSearchAndControlsRow(),
                const SizedBox(height: 14),

                // 4. Reports List (Card or Table)
                _buildReportsContent(context),
                const SizedBox(height: 16),

                // 5. Pagination
                _buildPaginationSection(),
                const SizedBox(height: 24),
              ],
            ),
          ),
        );
      }),
    );
  }

  // 1. Header Banner
  Widget _buildHeaderBanner(BuildContext context) {
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
          // Breadcrumb
          Text(
            '${'nav_government'.tr} / ${'gov_reports.breadcrumb'.tr}',
            style: const TextStyle(
              color: AppColors.textMuted,
              fontSize: 10.5,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 6),

          // Title & Subtitle
          Text(
            'gov_reports.title'.tr,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
              letterSpacing: -0.3,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'gov_reports.subtitle'.tr,
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 11,
              height: 1.3,
            ),
          ),
          const SizedBox(height: 14),

          // Filter Controls Row
          Wrap(
            spacing: 8,
            runSpacing: 8,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              // Category Filter Dropdown
              Obx(() {
                final selectedCat = controller.selectedCategory.value;
                final categories = controller.availableCategories;

                return Container(
                  height: 38,
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  decoration: BoxDecoration(
                    color: Colors.black26,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.cardBorder, width: 1),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: selectedCat,
                      dropdownColor: AppColors.cardBg,
                      icon: const Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white70, size: 18),
                      style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                      items: [
                        DropdownMenuItem<String>(
                          value: 'all',
                          child: Text('activity.all_categories'.tr),
                        ),
                        ...categories.map((cat) => DropdownMenuItem<String>(
                          value: cat,
                          child: Text(cat),
                        )),
                      ],
                      onChanged: (val) {
                        if (val != null) controller.onCategoryChanged(val);
                      },
                    ),
                  ),
                );
              }),

              // Date Range Filter Dropdown
              Obx(() {
                final range = controller.dateRange.value;

                return Container(
                  height: 38,
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  decoration: BoxDecoration(
                    color: Colors.black26,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.cardBorder, width: 1),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: range,
                      dropdownColor: AppColors.cardBg,
                      icon: const Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white70, size: 18),
                      style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                      items: [
                        DropdownMenuItem<String>(
                          value: '7days',
                          child: Text('gov_analytics.last_7_days'.tr),
                        ),
                        DropdownMenuItem<String>(
                          value: '30days',
                          child: Text('gov_analytics.last_30_days'.tr),
                        ),
                        DropdownMenuItem<String>(
                          value: 'month',
                          child: Text('gov_analytics.current_month'.tr),
                        ),
                        DropdownMenuItem<String>(
                          value: 'lastmonth',
                          child: Text('gov_analytics.last_month'.tr),
                        ),
                      ],
                      onChanged: (val) {
                        if (val != null) controller.onDateRangeChanged(val);
                      },
                    ),
                  ),
                );
              }),

              // Export Report CTA Button with AppTheme.primaryGradient
              Obx(() {
                final isExp = controller.isExporting.value;
                return Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: isExp ? null : () => controller.showExportOptionsSheet(context),
                    borderRadius: BorderRadius.circular(10),
                    child: Ink(
                      decoration: BoxDecoration(
                        gradient: AppTheme.primaryGradient,
                        borderRadius: BorderRadius.circular(10),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF3B82F6).withValues(alpha: 0.35),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Container(
                        height: 38,
                        padding: const EdgeInsets.symmetric(horizontal: 14),
                        alignment: Alignment.center,
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (isExp)
                              const SizedBox(
                                width: 14,
                                height: 14,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                              )
                            else
                              const Icon(Icons.file_download_outlined, color: Colors.white, size: 17),
                            const SizedBox(width: 6),
                            Text(
                              'gov_reports.export_report'.tr,
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
                  ),
                );
              }),
            ],
          ),
        ],
      ),
    );
  }

  // 2. Performance Trend Section (DOOH Playback Telemetry)
  Widget _buildPerformanceTrendSection() {
    return Obx(() {
      final daysTrend = controller.daysTrend;
      final maxDayCount = controller.maxDayCount;
      final totalPlays = controller.totalPlaysInWindow;

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
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'gov_reports.perf_trend'.tr,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.4,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        '${'gov_reports.perf_trend_sub'.tr} — $totalPlays ${'gov_reports.broadcast_plays_verified'.tr}',
                        style: const TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 10,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),

                // Status Pill
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: totalPlays > 0
                        ? const Color(0xFF10B981).withValues(alpha: 0.15)
                        : Colors.black26,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: totalPlays > 0
                          ? const Color(0xFF10B981).withValues(alpha: 0.3)
                          : AppColors.cardBorder,
                      width: 1,
                    ),
                  ),
                  child: Text(
                    totalPlays > 0
                        ? 'gov_reports.verified_telemetry'.tr
                        : 'gov_reports.waiting_telemetry'.tr,
                    style: TextStyle(
                      color: totalPlays > 0 ? const Color(0xFF34D399) : AppColors.textMuted,
                      fontSize: 9.5,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Daily Bars
            if (daysTrend.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 16),
                decoration: BoxDecoration(
                  color: Colors.black12,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.5)),
                ),
                child: Text(
                  'gov_reports.no_playback_loops'.tr,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                ),
              )
            else
              Container(
                height: 160,
                padding: const EdgeInsets.fromLTRB(10, 16, 10, 8),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A).withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: LayoutBuilder(
                  builder: (context, constraints) {
                    final chartHeight = constraints.maxHeight - 28;
                    return SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      physics: const BouncingScrollPhysics(),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: daysTrend.map((d) {
                          final count = (d['count'] as num?)?.toDouble() ?? 0.0;
                          final double heightFactor = maxDayCount > 0
                              ? (count / maxDayCount).clamp(0.06, 1.0)
                              : 0.06;
                          final barHeight = chartHeight * heightFactor;
                          final dayLabel = d['day']?.toString() ?? '';

                          return Container(
                            width: 38,
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                Text(
                                  count > 0 ? (count >= 1000 ? '${(count / 1000).toStringAsFixed(1)}k' : '${count.toInt()}') : '—',
                                  style: TextStyle(
                                    color: count > 0 ? const Color(0xFF60A5FA) : AppColors.textMuted,
                                    fontSize: 8,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Container(
                                  width: 22,
                                  height: barHeight,
                                  decoration: BoxDecoration(
                                    gradient: count > 0 ? AppTheme.primaryGradient : null,
                                    color: count > 0 ? null : const Color(0xFF334155),
                                    borderRadius: const BorderRadius.vertical(top: Radius.circular(5)),
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  dayLabel,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    color: AppColors.textMuted,
                                    fontSize: 8.5,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
                    );
                  },
                ),
              ),
          ],
        ),
      );
    });
  }

  // 3. Search and View Mode Controls Row
  Widget _buildSearchAndControlsRow() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        children: [
          // Search Field
          Expanded(
            child: Container(
              height: 40,
              padding: const EdgeInsets.symmetric(horizontal: 10),
              decoration: BoxDecoration(
                color: Colors.black26,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.cardBorder, width: 1),
              ),
              child: Row(
                children: [
                  const Icon(Icons.search_rounded, color: AppColors.textMuted, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: controller.searchController,
                      style: const TextStyle(color: Colors.white, fontSize: 11.5),
                      decoration: InputDecoration(
                        hintText: 'gov_reports.search_ph'.tr,
                        hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                        border: InputBorder.none,
                        isDense: true,
                        contentPadding: EdgeInsets.zero,
                      ),
                    ),
                  ),
                  Obx(() {
                    if (controller.searchQuery.value.isNotEmpty) {
                      return GestureDetector(
                        onTap: () => controller.searchController.clear(),
                        child: const Icon(Icons.close_rounded, color: AppColors.textMuted, size: 16),
                      );
                    }
                    return const SizedBox.shrink();
                  }),
                ],
              ),
            ),
          ),
          const SizedBox(width: 10),

          // View Mode Toggle
          Obx(() {
            final vm = controller.viewMode.value;
            return Container(
              padding: const EdgeInsets.all(2),
              decoration: BoxDecoration(
                color: Colors.black26,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  GestureDetector(
                    onTap: () => controller.viewMode.value = 'card',
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: vm == 'card' ? const Color(0xFF3B82F6) : Colors.transparent,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Icon(
                        Icons.grid_view_rounded,
                        size: 16,
                        color: vm == 'card' ? Colors.white : AppColors.textMuted,
                      ),
                    ),
                  ),
                  GestureDetector(
                    onTap: () => controller.viewMode.value = 'table',
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: vm == 'table' ? const Color(0xFF3B82F6) : Colors.transparent,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Icon(
                        Icons.table_rows_rounded,
                        size: 16,
                        color: vm == 'table' ? Colors.white : AppColors.textMuted,
                      ),
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  // 4. Reports Content (Card View vs Table View)
  Widget _buildReportsContent(BuildContext context) {
    return Obx(() {
      final list = controller.paginatedReports;
      final vm = controller.viewMode.value;

      if (list.isEmpty) {
        return Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 16),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder, width: 1.2),
          ),
          child: Column(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: Colors.black26,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: const Icon(Icons.search_off_rounded, color: AppColors.textMuted, size: 24),
              ),
              const SizedBox(height: 12),
              Text(
                'gov_reports.no_reports'.tr,
                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text(
                'gov_reports.no_reports_desc'.tr,
                textAlign: TextAlign.center,
                style: const TextStyle(color: AppColors.textSecondary, fontSize: 10),
              ),
            ],
          ),
        );
      }

      if (vm == 'card') {
        return Column(
          children: list.map((item) => _buildReportCard(item)).toList(),
        );
      }

      // Table View
      return Container(
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
        ),
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          child: DataTable(
            horizontalMargin: 12,
            columnSpacing: 18,
            headingRowHeight: 40,
            dataRowMinHeight: 48,
            dataRowMaxHeight: 52,
            border: TableBorder(
              horizontalInside: BorderSide(color: AppColors.cardBorder.withValues(alpha: 0.4), width: 1),
            ),
            columns: [
              DataColumn(label: Text('gov_reports.rank_campaign'.tr.toUpperCase(), style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5, fontWeight: FontWeight.bold))),
              DataColumn(label: Text('gov_reports.total_scans'.tr.toUpperCase(), style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5, fontWeight: FontWeight.bold))),
              DataColumn(label: Text('gov_reports.unique_scanners'.tr.toUpperCase(), style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5, fontWeight: FontWeight.bold))),
              DataColumn(label: Text('gov_reports.scan_rate'.tr.toUpperCase(), style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5, fontWeight: FontWeight.bold))),
              DataColumn(label: Text('gov_reports.avg_day'.tr.toUpperCase(), style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5, fontWeight: FontWeight.bold))),
              DataColumn(label: Text('gov_reports.primary_location'.tr.toUpperCase(), style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5, fontWeight: FontWeight.bold))),
              DataColumn(label: Text('common.status'.tr.toUpperCase(), style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5, fontWeight: FontWeight.bold))),
            ],
            rows: list.map((item) {
              return DataRow(
                onSelectChanged: (_) {
                  if (item['rawId'] != null) {
                    Get.toNamed(Routes.GOV_CAMPAIGN_DETAILS, arguments: {'campaignId': item['rawId']});
                  }
                },
                cells: [
                  DataCell(
                    ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 160),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item['name']?.toString() ?? '',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${item['category']} · ${item['id']}',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(color: AppColors.textMuted, fontSize: 9),
                          ),
                        ],
                      ),
                    ),
                  ),
                  DataCell(Text('${item['qrScans']}', style: const TextStyle(color: Color(0xFF3B82F6), fontSize: 11, fontWeight: FontWeight.bold))),
                  DataCell(Text('${item['unique']}', style: const TextStyle(color: Colors.white, fontSize: 11))),
                  DataCell(Text('${item['rate']}', style: const TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.bold))),
                  DataCell(Text('${item['avgPerDay']}', style: const TextStyle(color: Colors.white, fontSize: 11))),
                  DataCell(Text(item['location']?.toString() ?? '', style: const TextStyle(color: AppColors.textSecondary, fontSize: 10))),
                  DataCell(_buildStatusBadge(item['rawStatus']?.toString() ?? '')),
                ],
              );
            }).toList(),
          ),
        ),
      );
    });
  }

  Widget _buildReportCard(Map<String, dynamic> item) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: InkWell(
        onTap: () {
          if (item['rawId'] != null) {
            Get.toNamed(Routes.GOV_CAMPAIGN_DETAILS, arguments: {'campaignId': item['rawId']});
          }
        },
        borderRadius: BorderRadius.circular(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row: Category tag, Code, Title, Status
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFF3B82F6).withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.3)),
                            ),
                            child: Text(
                              item['category']?.toString() ?? '',
                              style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 9, fontWeight: FontWeight.bold),
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            item['id']?.toString() ?? '',
                            style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5, fontFamily: 'monospace'),
                          ),
                        ],
                      ),
                      const SizedBox(height: 5),
                      Text(
                        item['name']?.toString() ?? '',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                _buildStatusBadge(item['rawStatus']?.toString() ?? ''),
              ],
            ),
            const SizedBox(height: 12),

            // 4 Metric Pills (2x2 Grid)
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              mainAxisSpacing: 6,
              crossAxisSpacing: 6,
              childAspectRatio: 2.3,
              children: [
                _buildMetricPill('gov_reports.total_scans'.tr, '${item['qrScans']}', const Color(0xFF3B82F6)),
                _buildMetricPill('gov_reports.unique_scanners'.tr, '${item['unique']}', Colors.white),
                _buildMetricPill('gov_reports.scan_rate'.tr, item['rate']?.toString() ?? '0%', const Color(0xFF10B981)),
                _buildMetricPill('gov_reports.avg_day'.tr, '${item['avgPerDay']}', Colors.white),
              ],
            ),
            const SizedBox(height: 12),

            // Footer: Location + Verified Telemetry
            Container(
              padding: const EdgeInsets.only(top: 8),
              decoration: const BoxDecoration(
                border: Border(top: BorderSide(color: AppColors.cardBorder, width: 0.8)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Row(
                      children: [
                        const Icon(Icons.location_on_outlined, color: AppColors.textMuted, size: 14),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            item['location']?.toString() ?? '',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(color: AppColors.textSecondary, fontSize: 10),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'driver.trips.verified_telemetry'.tr,
                    style: const TextStyle(color: Color(0xFF3B82F6), fontSize: 9.5, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricPill(String label, String value, Color valueColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.black26,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.cardBorder, width: 0.8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            label.toUpperCase(),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: TextStyle(color: valueColor, fontSize: 12, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color bg;
    Color border;
    Color textColor;
    String label = status;

    if (status == 'live' || status == 'active') {
      bg = const Color(0xFF10B981).withValues(alpha: 0.15);
      border = const Color(0xFF10B981).withValues(alpha: 0.4);
      textColor = const Color(0xFF34D399);
      label = 'common.live'.tr;
    } else if (status == 'completed') {
      bg = const Color(0xFF3B82F6).withValues(alpha: 0.15);
      border = const Color(0xFF3B82F6).withValues(alpha: 0.4);
      textColor = const Color(0xFF60A5FA);
      label = 'common.completed'.tr;
    } else if (status == 'pending_approval' || status == 'scheduled' || status == 'draft') {
      bg = const Color(0xFFF59E0B).withValues(alpha: 0.15);
      border = const Color(0xFFF59E0B).withValues(alpha: 0.4);
      textColor = const Color(0xFFFBBF24);
      label = 'pending'.tr;
    } else {
      bg = const Color(0xFF64748B).withValues(alpha: 0.15);
      border = const Color(0xFF64748B).withValues(alpha: 0.4);
      textColor = const Color(0xFF94A3B8);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: border, width: 1),
      ),
      child: Text(
        label.toUpperCase(),
        style: TextStyle(
          color: textColor,
          fontSize: 8.5,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  // 5. Pagination Section
  Widget _buildPaginationSection() {
    return Obx(() {
      final totalP = controller.totalPages;
      final currentP = controller.currentPage.value;
      final total = controller.totalItems;

      if (total <= 6) return const SizedBox.shrink();

      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder, width: 1),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '${'gov_reports.page'.tr} $currentP ${'gov_reports.of'.tr} $totalP ($total items)',
              style: const TextStyle(color: AppColors.textSecondary, fontSize: 10.5, fontWeight: FontWeight.w600),
            ),
            Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.chevron_left_rounded, color: Colors.white, size: 22),
                  onPressed: currentP > 1 ? () => controller.currentPage.value-- : null,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
                const SizedBox(width: 14),
                IconButton(
                  icon: const Icon(Icons.chevron_right_rounded, color: Colors.white, size: 22),
                  onPressed: currentP < totalP ? () => controller.currentPage.value++ : null,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
          ],
        ),
      );
    });
  }
}
