import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/models/activity_log_model.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/widgets/custom_back_button.dart';
import '../controllers/activity_logs_controller.dart';

class ActivityLogsView extends GetView<ActivityLogsController> {
  const ActivityLogsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top App Bar with Title, Subtitle, Refresh & Export CSV
            _buildTopAppBar(context),

            // Scrollable Body
            Expanded(
              child: RefreshIndicator(
                color: const Color(0xFF06B6D4),
                backgroundColor: AppColors.cardBg,
                onRefresh: () => controller.loadLogs(),
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // 1. 4 KPI Stats Cards Strip
                      _buildKpiStatsStrip(),

                      const SizedBox(height: 16),

                      // 2. Toolbar: Search Bar + View Mode Toggle
                      _buildSearchAndModeToolbar(),

                      const SizedBox(height: 12),

                      // 3. Dropdown Filter Bar + Reset
                      _buildFiltersBar(),

                      const SizedBox(height: 16),

                      // 4. Data Section: Table Mode or Card List Mode
                      Obx(() {
                        if (controller.isLoading.value) {
                          return _buildLoadingState();
                        }
                        if (controller.paginatedLogs.isEmpty) {
                          return _buildEmptyState();
                        }
                        if (controller.viewMode.value == 'table') {
                          return _buildTableView();
                        } else {
                          return _buildCardListView();
                        }
                      }),

                      const SizedBox(height: 16),

                      // 5. Global Pagination Strip ("Showing X - Y of Z entries")
                      _buildPaginationStrip(),

                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
      // Details Modal Overlay
      bottomSheet: Obx(() {
        final log = controller.selectedLog.value;
        if (log == null) return const SizedBox.shrink();
        return _buildLogDetailsBottomSheet(log);
      }),
    );
  }

  // --- Top App Bar ---
  Widget _buildTopAppBar(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 10, 16, 12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        border: Border(bottom: BorderSide(color: AppColors.cardBorder)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const CustomBackButton(),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: const [
                        Text(
                          'AUDIT TRAIL',
                          style: TextStyle(
                            color: Color(0xFF06B6D4),
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1.1,
                          ),
                        ),
                        // Text(
                        //   ' • TEAM & STAFF',
                        //   style: TextStyle(
                        //     color: Colors.white38,
                        //     fontSize: 10,
                        //     fontWeight: FontWeight.bold,
                        //     letterSpacing: 0.8,
                        //   ),
                        // ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    const Text(
                      'Activity Logs',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -0.3,
                      ),
                    ),
                  ],
                ),
              ),

              // Refresh Button
              Obx(() => IconButton(
                    icon: controller.isLoading.value
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF06B6D4)),
                          )
                        : const Icon(Icons.refresh_rounded, color: Colors.white70, size: 20),
                    onPressed: controller.isLoading.value ? null : () => controller.loadLogs(),
                    tooltip: 'Refresh Logs',
                  )),

              const SizedBox(width: 4),

              // Export CSV Button (Matching Admin Panel)
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF06B6D4),
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  elevation: 0,
                ),
                icon: const Icon(Icons.download_rounded, size: 15, color: Colors.black),
                label: const Text(
                  'Export CSV',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900),
                ),
                onPressed: () => controller.handleExportCSV(),
              ),
            ],
          ),
          const Padding(
            padding: EdgeInsets.only(left: 48, top: 2),
            child: Text(
              'View team activity logs, user actions, and system events',
              style: TextStyle(color: Colors.white54, fontSize: 11),
            ),
          ),
        ],
      ),
    );
  }

  // --- 1. 4 KPI Stats Cards Strip ---
  Widget _buildKpiStatsStrip() {
    return Obx(() {
      return Row(
        children: [
          // Total Events
          Expanded(
            child: _buildKpiCard(
              title: 'TOTAL EVENTS',
              count: controller.totalItems.toString(),
              color: Colors.white,
              bgColor: Colors.white.withValues(alpha: 0.05),
              borderColor: AppColors.cardBorder,
            ),
          ),
          const SizedBox(width: 8),

          // Info Logs
          Expanded(
            child: _buildKpiCard(
              title: 'INFO LOGS',
              count: controller.infoCount.toString(),
              color: const Color(0xFF38BDF8),
              bgColor: const Color(0xFF0284C7).withValues(alpha: 0.12),
              borderColor: const Color(0xFF0284C7).withValues(alpha: 0.3),
            ),
          ),
          const SizedBox(width: 8),

          // Warnings
          Expanded(
            child: _buildKpiCard(
              title: 'WARNINGS',
              count: controller.warningCount.toString(),
              color: const Color(0xFFFBBF24),
              bgColor: const Color(0xFFD97706).withValues(alpha: 0.12),
              borderColor: const Color(0xFFD97706).withValues(alpha: 0.3),
            ),
          ),
          const SizedBox(width: 8),

          // Critical Events
          Expanded(
            child: _buildKpiCard(
              title: 'CRITICAL',
              count: controller.criticalCount.toString(),
              color: const Color(0xFFF87171),
              bgColor: const Color(0xFFDC2626).withValues(alpha: 0.12),
              borderColor: const Color(0xFFDC2626).withValues(alpha: 0.3),
            ),
          ),
        ],
      );
    });
  }

  Widget _buildKpiCard({
    required String title,
    required String count,
    required Color color,
    required Color bgColor,
    required Color borderColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: color.withValues(alpha: 0.8),
              fontSize: 9,
              fontWeight: FontWeight.w900,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            count,
            style: TextStyle(
              color: color,
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }

  // --- 2. Toolbar: Search Bar + View Mode Toggle ---
  Widget _buildSearchAndModeToolbar() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Row(
        children: [
          // Search Field
          Expanded(
            child: Container(
              height: 40,
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Row(
                children: [
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 10),
                    child: Icon(Icons.search_rounded, color: Colors.white38, size: 18),
                  ),
                  Expanded(
                    child: TextField(
                      style: const TextStyle(color: Colors.white, fontSize: 12),
                      decoration: const InputDecoration(
                        hintText: 'Search logs by user, action, category...',
                        hintStyle: TextStyle(color: Colors.white38, fontSize: 11),
                        border: InputBorder.none,
                        isDense: true,
                        contentPadding: EdgeInsets.zero,
                      ),
                      onChanged: controller.onSearchChanged,
                    ),
                  ),
                  Obx(() {
                    if (controller.searchQuery.value.isEmpty) return const SizedBox.shrink();
                    return IconButton(
                      icon: const Icon(Icons.close_rounded, color: Colors.white54, size: 16),
                      onPressed: controller.clearSearch,
                    );
                  }),
                ],
              ),
            ),
          ),

          const SizedBox(width: 10),

          // View Mode Switcher: Table vs Cards
          Obx(() {
            final isTable = controller.viewMode.value == 'table';
            return Container(
              height: 40,
              padding: const EdgeInsets.all(3),
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Row(
                children: [
                  // Table Mode Icon Button
                  GestureDetector(
                    onTap: () => controller.viewMode.value = 'table',
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: isTable ? const Color(0xFF06B6D4) : Colors.transparent,
                        borderRadius: BorderRadius.circular(7),
                      ),
                      child: Icon(
                        Icons.table_chart_rounded,
                        size: 16,
                        color: isTable ? Colors.black : Colors.white60,
                      ),
                    ),
                  ),
                  // Card Mode Icon Button
                  GestureDetector(
                    onTap: () => controller.viewMode.value = 'list',
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: !isTable ? const Color(0xFF06B6D4) : Colors.transparent,
                        borderRadius: BorderRadius.circular(7),
                      ),
                      child: Icon(
                        Icons.view_agenda_rounded,
                        size: 16,
                        color: !isTable ? Colors.black : Colors.white60,
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

  // --- 3. Dropdown Filters Bar ---
  Widget _buildFiltersBar() {
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
              const Text(
                'FILTER CONTROLS',
                style: TextStyle(
                  color: Colors.white38,
                  fontSize: 10,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 0.8,
                ),
              ),
              GestureDetector(
                onTap: controller.resetFilters,
                child: Row(
                  children: const [
                    Icon(Icons.restart_alt_rounded, color: Color(0xFF06B6D4), size: 14),
                    SizedBox(width: 4),
                    Text(
                      'Reset Filters',
                      style: TextStyle(
                        color: Color(0xFF06B6D4),
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Horizontal scrollable filter pills / dropdowns
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                // Category Filter
                Obx(() => _buildFilterDropdown<String>(
                      label: 'Category',
                      value: controller.categoryFilter.value,
                      items: controller.categoryOptions.isEmpty
                          ? ['All']
                          : controller.categoryOptions,
                      onChanged: (val) {
                        if (val != null) {
                          controller.categoryFilter.value = val;
                          controller.currentPage.value = 1;
                        }
                      },
                    )),
                const SizedBox(width: 8),

                // Severity Filter
                Obx(() => _buildFilterDropdown<String>(
                      label: 'Severity',
                      value: controller.severityFilter.value,
                      items: controller.severityOptions,
                      onChanged: (val) {
                        if (val != null) {
                          controller.severityFilter.value = val;
                          controller.currentPage.value = 1;
                        }
                      },
                    )),
                const SizedBox(width: 8),

                // Action / Event Filter
                Obx(() => _buildFilterDropdown<String>(
                      label: 'Action',
                      value: controller.eventFilter.value,
                      items: controller.eventOptions.isEmpty
                          ? ['All']
                          : controller.eventOptions,
                      onChanged: (val) {
                        if (val != null) {
                          controller.eventFilter.value = val;
                          controller.currentPage.value = 1;
                        }
                      },
                    )),
                const SizedBox(width: 8),

                // Date Range Filter
                Obx(() => _buildFilterDropdown<String>(
                      label: 'Date',
                      value: controller.dateRangeFilter.value,
                      items: controller.dateOptions,
                      itemLabels: {
                        'ALL': 'All Time',
                        'TODAY': 'Today',
                        '7DAYS': 'Past 7 Days',
                        '30DAYS': 'Past 30 Days',
                      },
                      onChanged: (val) {
                        if (val != null) {
                          controller.dateRangeFilter.value = val;
                          controller.currentPage.value = 1;
                        }
                      },
                    )),
                const SizedBox(width: 8),

                // Sort Order Filter
                Obx(() => _buildFilterDropdown<String>(
                      label: 'Sort',
                      value: '${controller.sortBy.value}:${controller.sortOrder.value}',
                      items: const [
                        'created_at:DESC',
                        'created_at:ASC',
                        'id:DESC',
                        'id:ASC',
                        'severity:DESC',
                      ],
                      itemLabels: {
                        'created_at:DESC': 'Newest First',
                        'created_at:ASC': 'Oldest First',
                        'id:DESC': 'ID: High to Low',
                        'id:ASC': 'ID: Low to High',
                        'severity:DESC': 'Severity: Critical First',
                      },
                      onChanged: (val) {
                        if (val != null) {
                          final parts = val.split(':');
                          controller.sortBy.value = parts[0];
                          controller.sortOrder.value = parts[1];
                          controller.currentPage.value = 1;
                        }
                      },
                    )),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterDropdown<T>({
    required String label,
    required T value,
    required List<T> items,
    Map<T, String>? itemLabels,
    required ValueChanged<T?> onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            '$label: ',
            style: const TextStyle(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.bold),
          ),
          DropdownButton<T>(
            value: items.contains(value) ? value : items.first,
            underline: const SizedBox.shrink(),
            isDense: true,
            dropdownColor: const Color(0xFF161922),
            style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
            icon: const Icon(Icons.arrow_drop_down, color: Color(0xFF06B6D4), size: 18),
            items: items.map((item) {
              final text = itemLabels?[item] ?? item.toString();
              return DropdownMenuItem<T>(
                value: item,
                child: Text(text),
              );
            }).toList(),
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }

  // --- 4. Table Mode View ---
  Widget _buildTableView() {
    final logs = controller.paginatedLogs;

    return Container(
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: DataTable(
          headingRowHeight: 40,
          dataRowMinHeight: 52,
          dataRowMaxHeight: 56,
          horizontalMargin: 14,
          columnSpacing: 18,
          headingRowColor: WidgetStateProperty.all(Colors.white.withValues(alpha: 0.03)),
          columns: const [
            DataColumn(
              label: Text(
                'ID & LEVEL',
                style: TextStyle(color: Colors.white54, fontSize: 10, fontWeight: FontWeight.w900),
              ),
            ),
            DataColumn(
              label: Text(
                'CATEGORY',
                style: TextStyle(color: Colors.white54, fontSize: 10, fontWeight: FontWeight.w900),
              ),
            ),
            DataColumn(
              label: Text(
                'ACTION',
                style: TextStyle(color: Colors.white54, fontSize: 10, fontWeight: FontWeight.w900),
              ),
            ),
            DataColumn(
              label: Text(
                'USER / ACTOR',
                style: TextStyle(color: Colors.white54, fontSize: 10, fontWeight: FontWeight.w900),
              ),
            ),
            DataColumn(
              label: Text(
                'TIME',
                style: TextStyle(color: Colors.white54, fontSize: 10, fontWeight: FontWeight.w900),
              ),
            ),
            DataColumn(
              label: Text(
                'DETAILS',
                style: TextStyle(color: Colors.white54, fontSize: 10, fontWeight: FontWeight.w900),
              ),
            ),
          ],
          rows: logs.map((log) {
            return DataRow(
              cells: [
                // ID & Level
                DataCell(
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        '#${log.id}',
                        style: const TextStyle(
                          color: Color(0xFF38BDF8),
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'monospace',
                        ),
                      ),
                      const SizedBox(width: 6),
                      _buildSeverityBadge(log.severity),
                    ],
                  ),
                ),

                // Category
                DataCell(
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.05),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: Colors.white12),
                    ),
                    child: Text(
                      log.category,
                      style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),

                // Action
                DataCell(
                  ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 180),
                    child: Text(
                      log.action,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w600),
                    ),
                  ),
                ),

                // User / Actor
                DataCell(
                  Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        log.actorName,
                        style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                      if (log.actorRole.isNotEmpty)
                        Text(
                          log.actorRole,
                          style: const TextStyle(color: Colors.white38, fontSize: 9.5),
                        ),
                    ],
                  ),
                ),

                // Time
                DataCell(
                  Text(
                    log.formattedTime,
                    style: const TextStyle(
                      color: Colors.white54,
                      fontSize: 10.5,
                      fontFamily: 'monospace',
                    ),
                  ),
                ),

                // Inspect Action
                DataCell(
                  TextButton.icon(
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    icon: const Icon(Icons.arrow_forward_rounded, size: 12, color: Color(0xFF06B6D4)),
                    label: const Text(
                      'Inspect',
                      style: TextStyle(color: Color(0xFF06B6D4), fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                    onPressed: () => controller.openLogDetails(log),
                  ),
                ),
              ],
            );
          }).toList(),
        ),
      ),
    );
  }

  // --- 4. Card / List Mode View ---
  Widget _buildCardListView() {
    final logs = controller.paginatedLogs;

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: logs.length,
      separatorBuilder: (_, _) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        final log = logs[index];

        return InkWell(
          onTap: () => controller.openLogDetails(log),
          borderRadius: BorderRadius.circular(14),
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.cardBg,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.cardBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Row: ID, Severity, Category, Time
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0284C7).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: const Color(0xFF0284C7).withValues(alpha: 0.3)),
                      ),
                      child: Text(
                        '#${log.id}',
                        style: const TextStyle(
                          color: Color(0xFF38BDF8),
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'monospace',
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),
                    _buildSeverityBadge(log.severity),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.05),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        log.category,
                        style: const TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const Spacer(),
                    Text(
                      log.formattedTime,
                      style: const TextStyle(
                        color: Colors.white38,
                        fontSize: 10,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Action Title
                Text(
                  log.action,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                if (log.description.isNotEmpty && log.description != log.action) ...[
                  const SizedBox(height: 4),
                  Text(
                    log.description,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(color: Colors.grey.shade400, fontSize: 11),
                  ),
                ],
                const SizedBox(height: 10),

                // Bottom Footer: Actor & Inspect Link
                Container(
                  padding: const EdgeInsets.only(top: 8),
                  decoration: const BoxDecoration(
                    border: Border(top: BorderSide(color: Colors.white10)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.person_outline_rounded, size: 14, color: Colors.white38),
                          const SizedBox(width: 4),
                          Text(
                            log.actorName,
                            style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600),
                          ),
                          if (log.actorRole.isNotEmpty) ...[
                            Text(
                              ' (${log.actorRole})',
                              style: const TextStyle(color: Colors.white38, fontSize: 10),
                            ),
                          ],
                        ],
                      ),
                      Row(
                        children: const [
                          Text(
                            'Inspect Payload',
                            style: TextStyle(color: Color(0xFF06B6D4), fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                          SizedBox(width: 2),
                          Icon(Icons.arrow_forward_rounded, size: 12, color: Color(0xFF06B6D4)),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  // --- Severity Badge Helper ---
  Widget _buildSeverityBadge(String severity) {
    Color bg;
    Color border;
    Color text;

    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        bg = const Color(0xFFDC2626).withValues(alpha: 0.15);
        border = const Color(0xFFDC2626).withValues(alpha: 0.4);
        text = const Color(0xFFF87171);
        break;
      case 'WARNING':
        bg = const Color(0xFFD97706).withValues(alpha: 0.15);
        border = const Color(0xFFD97706).withValues(alpha: 0.4);
        text = const Color(0xFFFBBF24);
        break;
      default:
        bg = const Color(0xFF0284C7).withValues(alpha: 0.15);
        border = const Color(0xFF0284C7).withValues(alpha: 0.4);
        text = const Color(0xFF38BDF8);
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: border),
      ),
      child: Text(
        severity.toUpperCase(),
        style: TextStyle(color: text, fontSize: 9.5, fontWeight: FontWeight.w900),
      ),
    );
  }

  // --- 5. Global Pagination Strip ("next page ke count show ho rhe hai") ---
  Widget _buildPaginationStrip() {
    return Obx(() {
      final curPage = controller.currentPage.value;
      final tPages = controller.totalPages;

      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder),
        ),
        child: Column(
          children: [
            // Top Row: Showing count & Rows per page
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // "Showing 1 - 10 of 48 entries"
                Text(
                  controller.paginationRangeText,
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),

                // Rows per page selector
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text(
                      'Per Page: ',
                      style: TextStyle(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                    DropdownButton<int>(
                      value: controller.pageSize.value,
                      underline: const SizedBox.shrink(),
                      isDense: true,
                      dropdownColor: const Color(0xFF161922),
                      style: const TextStyle(color: Color(0xFF06B6D4), fontSize: 11, fontWeight: FontWeight.bold),
                      icon: const Icon(Icons.arrow_drop_down, color: Color(0xFF06B6D4), size: 16),
                      items: controller.pageSizeOptions.map((sz) {
                        return DropdownMenuItem<int>(
                          value: sz,
                          child: Text('$sz'),
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) controller.changePageSize(val);
                      },
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 10),

            // Bottom Row: Navigation Buttons + Page Number Pills
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Previous Button
                IconButton(
                  icon: const Icon(Icons.chevron_left_rounded, size: 20),
                  color: controller.canPrev ? const Color(0xFF06B6D4) : Colors.white24,
                  onPressed: controller.canPrev ? controller.prevPage : null,
                  tooltip: 'Previous Page',
                ),

                const SizedBox(width: 4),

                // Page Pills: Up to 5 visible page numbers
                ...List.generate(tPages, (index) {
                  final p = index + 1;
                  // Only show reasonable window around currentPage
                  if (tPages > 5 && (p < curPage - 2 || p > curPage + 2)) {
                    if (p == 1 || p == tPages) {
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 2),
                        child: Text('.', style: TextStyle(color: Colors.white38)),
                      );
                    }
                    return const SizedBox.shrink();
                  }

                  final isSelected = p == curPage;
                  return GestureDetector(
                    onTap: () => controller.goToPage(p),
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 3),
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: isSelected ? const Color(0xFF06B6D4) : Colors.white.withValues(alpha: 0.05),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: isSelected ? const Color(0xFF06B6D4) : Colors.white12,
                        ),
                      ),
                      child: Text(
                        '$p',
                        style: TextStyle(
                          color: isSelected ? Colors.black : Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  );
                }),

                const SizedBox(width: 4),

                // Next Button
                IconButton(
                  icon: const Icon(Icons.chevron_right_rounded, size: 20),
                  color: controller.canNext ? const Color(0xFF06B6D4) : Colors.white24,
                  onPressed: controller.canNext ? controller.nextPage : null,
                  tooltip: 'Next Page',
                ),
              ],
            ),
          ],
        ),
      );
    });
  }

  // --- Inspect Log Details BottomSheet / Modal ---
  Widget _buildLogDetailsBottomSheet(ActivityLogModel log) {
    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(Get.context!).size.height * 0.82,
      ),
      padding: const EdgeInsets.all(20),
      decoration: const BoxDecoration(
        color: Color(0xFF10121A),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        border: Border(top: BorderSide(color: Color(0xFF06B6D4), width: 1.5)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with #ID and Close
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0284C7).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: const Color(0xFF0284C7).withValues(alpha: 0.3)),
                    ),
                    child: Text(
                      '#${log.id}',
                      style: const TextStyle(
                        color: Color(0xFF38BDF8),
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  const Text(
                    'Log Details & Payload',
                    style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.close_rounded, color: Colors.grey, size: 20),
                onPressed: () => controller.selectedLog.value = null,
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Scrollable Content
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Action & Event Banner
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.05),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.cardBorder),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'ACTION & EVENT',
                              style: TextStyle(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                            _buildSeverityBadge(log.severity),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          log.action,
                          style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                        ),
                        if (log.description.isNotEmpty && log.description != log.action) ...[
                          const SizedBox(height: 4),
                          Text(
                            log.description,
                            style: TextStyle(color: Colors.grey.shade400, fontSize: 11),
                          ),
                        ],
                        const SizedBox(height: 6),
                        Text(
                          'Recorded At: ${log.formattedTime}',
                          style: const TextStyle(color: Color(0xFF06B6D4), fontSize: 10.5, fontFamily: 'monospace'),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),

                  // User Actor & Category Cards Grid
                  Row(
                    children: [
                      // Actor Card
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.05),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: AppColors.cardBorder),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'USER / ACTOR',
                                style: TextStyle(color: Colors.white38, fontSize: 9.5, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                log.actorName,
                                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                              ),
                              if (log.actorEmail.isNotEmpty)
                                Text(
                                  log.actorEmail,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(color: Colors.grey.shade500, fontSize: 10),
                                ),
                              if (log.actorRole.isNotEmpty)
                                Text(
                                  'Role: ${log.actorRole}',
                                  style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 10, fontWeight: FontWeight.w600),
                                ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),

                      // Category & IP Card
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.05),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: AppColors.cardBorder),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'CATEGORY & IP',
                                style: TextStyle(color: Colors.white38, fontSize: 9.5, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                log.category,
                                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                              ),
                              Text(
                                'IP: ${log.ipAddress}',
                                style: const TextStyle(color: Colors.white60, fontSize: 10, fontFamily: 'monospace'),
                              ),
                              Text(
                                'Event: ${log.event}',
                                style: const TextStyle(color: Color(0xFF06B6D4), fontSize: 10, fontWeight: FontWeight.w600),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Raw Payload Header & Copy Button
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'RAW PAYLOAD DATA',
                        style: TextStyle(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.w900),
                      ),
                      TextButton.icon(
                        style: TextButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                        icon: const Icon(Icons.copy_rounded, size: 12, color: Color(0xFF06B6D4)),
                        label: const Text(
                          'Copy Data',
                          style: TextStyle(color: Color(0xFF06B6D4), fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                        onPressed: () => controller.copyLogPayload(log),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),

                  // Formatted Code Block
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.7),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.white12),
                    ),
                    child: SelectableText(
                      log.rawJsonString,
                      style: const TextStyle(
                        color: Color(0xFF67E8F9),
                        fontSize: 10.5,
                        fontFamily: 'monospace',
                        height: 1.4,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),

          // Bottom Close Action
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white.withValues(alpha: 0.1),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
              onPressed: () => controller.selectedLog.value = null,
              child: const Text('Close', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  // --- Empty & Loading States ---
  Widget _buildEmptyState() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        children: [
          const Icon(Icons.list_alt_rounded, size: 48, color: Colors.white24),
          const SizedBox(height: 12),
          const Text(
            'No Activity Logs Found',
            style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          const Text(
            'No activity events match your search query or selected filters.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.white38, fontSize: 11),
          ),
          const SizedBox(height: 14),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF06B6D4),
              foregroundColor: Colors.black,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: controller.resetFilters,
            child: const Text('Reset Filters', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingState() {
    return Container(
      height: 200,
      alignment: Alignment.center,
      child: const CircularProgressIndicator(color: Color(0xFF06B6D4)),
    );
  }
}
