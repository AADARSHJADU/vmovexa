import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/models/driver_models.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import 'package:vmovexa/app/widgets/custom_button.dart';
import '../controller/schedule_controller.dart';

class ScheduleView extends GetView<ScheduleController> {
  const ScheduleView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Header with Refresh and Active Corridor CTA
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 0),
              child: _buildHeader(),
            ),
            const SizedBox(height: 12),

            // Main Tab Switcher (Today / Upcoming / All) with AppTheme.primaryGradient
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: _buildTabSwitcher(),
            ),
            const SizedBox(height: 10),

            // Scrollable Content
            Expanded(
              child: RefreshIndicator(
                color: AppTheme.gradientBlue,
                backgroundColor: AppColors.cardBg,
                onRefresh: controller.onRefresh,
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Search and Filter Bar
                      _buildSearchAndFilters(),
                      const SizedBox(height: 14),

                      // KPI Metrics Summary Card
                      _buildKpiSummaryCard(),
                      const SizedBox(height: 16),

                      // Shift Cards List
                      _buildShiftList(),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ---------------- Header ----------------
  Widget _buildHeader() {
    final canPop = Navigator.canPop(Get.context!);
    return Row(
      children: [
        if (canPop) ...[
          IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white, size: 22),
            onPressed: controller.onBackPressed,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
          ),
          const SizedBox(width: 10),
        ],
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'shift_schedule_timetable'.tr,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 17,
                  fontWeight: FontWeight.w900,
                  letterSpacing: -0.2,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                'shift_schedule_sub'.tr,
                style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 11,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
        IconButton(
          icon: const Icon(Icons.refresh_rounded, color: Colors.white, size: 22),
          onPressed: controller.onRefresh,
          tooltip: 'refresh'.tr,
        ),
        const SizedBox(width: 4),
        InkWell(
          onTap: controller.openLiveCockpit,
          borderRadius: BorderRadius.circular(10),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(10),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.gradientBlue.withValues(alpha: 0.25),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.speed_rounded, color: Colors.white, size: 14),
                const SizedBox(width: 4),
                Text(
                  'cockpit'.tr,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 11,
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

  // ---------------- Tab Switcher with Primary Gradient ----------------
  Widget _buildTabSwitcher() {
    return Obx(() {
      final selected = controller.selectedTabIndex.value;
      final tabs = [
        {'index': 0, 'label': '${'todays_shifts_tab'.tr} (${controller.todayCount.value})'},
        {'index': 1, 'label': '${'upcoming_duty_tab'.tr} (${controller.upcomingCount.value})'},
        {'index': 2, 'label': 'all_shifts_tab'.tr},
      ];

      return Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.cardBorder),
        ),
        child: Row(
          children: tabs.map((t) {
            final idx = t['index'] as int;
            final isSelected = selected == idx;
            return Expanded(
              child: InkWell(
                onTap: () => controller.selectTab(idx),
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 9),
                  decoration: BoxDecoration(
                    gradient: isSelected ? AppTheme.primaryGradient : null,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        t['label'] as String,
                        style: TextStyle(
                          color: isSelected ? Colors.white : AppColors.textSecondary,
                          fontSize: 11,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                        ),
                        textAlign: TextAlign.center,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (isSelected) ...[
                        const SizedBox(height: 3),
                        Container(
                          width: 20,
                          height: 2,
                          decoration: BoxDecoration(
                            gradient: AppTheme.primaryGradient,
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ],
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

  // ---------------- Search & Filter Section ----------------
  Widget _buildSearchAndFilters() {
    return Column(
      children: [
        // Search Input
        Container(
          height: 44,
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: TextField(
            controller: controller.searchController,
            style: const TextStyle(color: Colors.white, fontSize: 13),
            decoration: InputDecoration(
              hintText: 'search_shifts_hint'.tr,
              hintStyle: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
              prefixIcon: const Icon(Icons.search_rounded, color: AppColors.textSecondary, size: 18),
              suffixIcon: Obx(() {
                if (controller.searchQuery.value.isEmpty) return const SizedBox.shrink();
                return IconButton(
                  icon: const Icon(Icons.close_rounded, color: AppColors.textSecondary, size: 16),
                  onPressed: () {
                    controller.searchController.clear();
                    controller.searchQuery.value = '';
                  },
                );
              }),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(vertical: 11),
            ),
          ),
        ),
        const SizedBox(height: 10),

        // Shift Type Filters (Horizontal Chips)
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          child: Obx(() {
            final activeType = controller.shiftTypeFilter.value;
            final typeOptions = [
              {'key': 'ALL', 'label': 'all_shift_types'.tr},
              {'key': 'morning', 'label': 'morning_peak'.tr},
              {'key': 'evening', 'label': 'evening_peak'.tr},
              {'key': 'night', 'label': 'night_shuttle'.tr},
            ];

            return Row(
              children: typeOptions.map((opt) {
                final isSelected = activeType == opt['key'];
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: InkWell(
                    onTap: () => controller.setShiftTypeFilter(opt['key']!),
                    borderRadius: BorderRadius.circular(20),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        gradient: isSelected ? AppTheme.primaryGradient : null,
                        color: isSelected ? null : AppColors.cardBg,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: isSelected ? Colors.transparent : AppColors.cardBorder,
                        ),
                      ),
                      child: Text(
                        opt['label']!,
                        style: TextStyle(
                          color: isSelected ? Colors.white : AppColors.textSecondary,
                          fontSize: 11,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            );
          }),
        ),
      ],
    );
  }

  // ---------------- KPI Summary Card ----------------
  Widget _buildKpiSummaryCard() {
    return Obx(() {
      return Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder),
        ),
        child: Row(
          children: [
            Expanded(
              child: _buildMetricCol(
                title: 'shifts'.tr,
                value: '${controller.currentFilteredShifts.length}',
                icon: Icons.event_note_rounded,
                color: const Color(0xFF6366F1),
              ),
            ),
            Container(width: 1, height: 36, color: AppColors.cardBorder),
            Expanded(
              child: _buildMetricCol(
                title: 'corridor_distance'.tr,
                value: '${controller.todayTotalDistanceKm.toStringAsFixed(1)} km',
                icon: Icons.route_outlined,
                color: const Color(0xFF06B6D4),
              ),
            ),
            Container(width: 1, height: 36, color: AppColors.cardBorder),
            Expanded(
              child: _buildMetricCol(
                title: 'timetable_shift'.tr,
                value: controller.todayTotalDuration.value,
                icon: Icons.access_time_rounded,
                color: const Color(0xFF10B981),
              ),
            ),
          ],
        ),
      );
    });
  }

  Widget _buildMetricCol({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Column(
      children: [
        Icon(icon, color: color, size: 16),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 13,
            fontWeight: FontWeight.w900,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        const SizedBox(height: 2),
        Text(
          title,
          style: const TextStyle(
            color: AppColors.textSecondary,
            fontSize: 9.5,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }

  // ---------------- Shift List ----------------
  Widget _buildShiftList() {
    return Obx(() {
      if (controller.isLoading.value) {
        return const Padding(
          padding: EdgeInsets.symmetric(vertical: 40),
          child: Center(
            child: CircularProgressIndicator(
              strokeWidth: 2.5,
              valueColor: AlwaysStoppedAnimation<Color>(AppTheme.gradientBlue),
            ),
          ),
        );
      }

      final shifts = controller.currentFilteredShifts;
      if (shifts.isEmpty) {
        return _buildEmptyState();
      }

      return ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: shifts.length,
        separatorBuilder: (_, _) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final shift = shifts[index];
          return _buildShiftCard(shift);
        },
      );
    });
  }

  Widget _buildEmptyState() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 20),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.05),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.calendar_month_outlined,
              size: 44,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 14),
          Text(
            'no_scheduled_shifts'.tr,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 15,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            controller.searchQuery.value.isNotEmpty
                ? 'no_shifts_matched_filter'.tr
                : 'no_trips_scheduled_today'.tr,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 12,
            ),
          ),
          const SizedBox(height: 18),
          if (controller.searchQuery.value.isNotEmpty)
            CustomButton(
              text: 'clear_all_filters'.tr,
              onTap: controller.clearFilters,
              width: 170,
              height: 40,
            )
          else
            CustomButton(
              text: 'active_corridor_cockpit'.tr,
              prefixIcon: const Icon(Icons.speed_rounded, size: 16, color: Colors.white),
              onTap: controller.openLiveCockpit,
              width: 220,
              height: 42,
            ),
        ],
      ),
    );
  }

  // ---------------- Shift Card Matching Web Admin Panel ----------------
  Widget _buildShiftCard(DriverShiftItem shift) {
    final isCompleted = shift.isCompleted || (shift.status ?? '').toLowerCase() == 'completed';
    final isInTransit = shift.isInTransit || (shift.status ?? '').toLowerCase().contains('transit');

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isInTransit
              ? AppTheme.gradientBlue.withValues(alpha: 0.6)
              : isCompleted
                  ? const Color(0xFF10B981).withValues(alpha: 0.4)
                  : AppColors.cardBorder,
          width: isInTransit ? 1.4 : 1.1,
        ),
        boxShadow: isInTransit
            ? [
                BoxShadow(
                  color: AppTheme.gradientBlue.withValues(alpha: 0.15),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
              ]
            : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row: Route Number, Bus, Slot Code, Date, Shift Type, Status
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF6366F1).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFF6366F1).withValues(alpha: 0.4)),
                ),
                child: Text(
                  shift.routeNumber ?? '—',
                  style: const TextStyle(
                    color: Color(0xFF818CF8),
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(width: 6),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    shift.busNumber ?? '—',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  SizedBox(height: 5,),
                  if (shift.slotCode != null && shift.slotCode!.isNotEmpty) ...[
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF59E0B).withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.3)),
                      ),
                      child: Text(
                        shift.slotCode!,
                        style: const TextStyle(
                          color: Color(0xFFF59E0B),
                          fontSize: 9.5,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ]
                ],
              ),

            ],
          ),
          const SizedBox(height: 8),

          // Date & Shift Type subtitle
          Row(
            children: [
              Text(
                shift.date ?? 'Today',
                style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                ),
              ),
              if (shift.shiftTypeLabel != null && shift.shiftTypeLabel!.isNotEmpty) ...[
                const SizedBox(width: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 1.5),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.05),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    shift.shiftTypeLabel!,
                    style: const TextStyle(
                      color: Color(0xFFFBBF24),
                      fontSize: 9.5,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
              const SizedBox(width: 5),
              _buildStatusPill(isCompleted, isInTransit, shift.status ?? 'Scheduled'),
            ],
          ),
          const SizedBox(height: 10),

          // Corridor Title
          Text(
            shift.routeName ?? '${shift.startDepot ?? 'Depot'} ➔ ${shift.endDepot ?? 'Terminus'}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.w900,
              letterSpacing: -0.2,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 2),
          Text(
            '${shift.startDepot ?? 'Origin'} → ${shift.endDepot ?? 'Destination'}',
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 11,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 12),

          // 4-Item Telemetry Matrix (Web Admin Panel Exact Replica)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.03),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.white.withValues(alpha: 0.06)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: _buildTelemetryCell(
                    label: 'timetable_shift'.tr,
                    value: '${shift.startTime ?? '—'} – ${shift.endTime ?? '—'}',
                    sub: shift.duration != null ? '${'duration'.tr}: ${shift.duration}' : null,
                  ),
                ),
                Container(width: 1, height: 28, color: Colors.white.withValues(alpha: 0.08)),
                Expanded(
                  child: _buildTelemetryCell(
                    label: 'corridor_distance'.tr,
                    value: shift.distance ?? '—',
                    sub: 'commercial_corridor'.tr,
                  ),
                ),
                Container(width: 1, height: 28, color: Colors.white.withValues(alpha: 0.08)),
                Expanded(
                  child: _buildTelemetryCell(
                    label: 'headway_frequency'.tr,
                    value: shift.frequency ?? '15 mins',
                    hasPulse: true,
                  ),
                ),
                Container(width: 1, height: 28, color: Colors.white.withValues(alpha: 0.08)),
                Expanded(
                  child: _buildTelemetryCell(
                    label: 'vehicle_bus'.tr,
                    value: shift.busNumber ?? '—',
                    sub: 'assigned'.tr,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Dual Action Row: "View Details" & "Dispatch / Cockpit"
          Row(
            children: [
              // View Details Button (Outline)
              Expanded(
                child: InkWell(
                  onTap: () => _showShiftDetailsModal(shift),
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    height: 40,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.04),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.cardBorder),
                    ),
                    child: Center(
                      child: Text(
                        'view_shift_details'.tr,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),

              // Primary Action Button (AppTheme.primaryGradient)
              Expanded(
                child: InkWell(
                  onTap: () => controller.onDispatchRoute(shift),
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    height: 40,
                    decoration: BoxDecoration(
                      gradient: isCompleted ? null : AppTheme.primaryGradient,
                      color: isCompleted ? Colors.white.withValues(alpha: 0.08) : null,
                      borderRadius: BorderRadius.circular(10),
                      boxShadow: isCompleted
                          ? null
                          : [
                              BoxShadow(
                                color: AppTheme.gradientBlue.withValues(alpha: 0.25),
                                blurRadius: 6,
                                offset: const Offset(0, 2),
                              ),
                            ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          isCompleted
                              ? Icons.check_circle_outline_rounded
                              : isInTransit
                                  ? Icons.speed_rounded
                                  : Icons.play_arrow_rounded,
                          size: 16,
                          color: Colors.white,
                        ),
                        const SizedBox(width: 5),
                        Text(
                          isCompleted
                              ? 'view_shift_summary'.tr
                              : isInTransit
                                  ? 'open_live_cockpit'.tr
                                  : 'dispatch_this_route'.tr,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
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

  Widget _buildStatusPill(bool isCompleted, bool isInTransit, String status) {
    if (isCompleted) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
        decoration: BoxDecoration(
          color: const Color(0xFF10B981).withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.check_rounded, color: Color(0xFF10B981), size: 12),
            const SizedBox(width: 4),
            Text(
              'completed'.tr,
              style: const TextStyle(
                color: Color(0xFF10B981),
                fontSize: 10,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      );
    } else if (isInTransit) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
        decoration: BoxDecoration(
          color: const Color(0xFF10B981).withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 6,
              height: 6,
              decoration: const BoxDecoration(
                color: Color(0xFF10B981),
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 4),
            Text(
              'live_in_transit'.tr,
              style: const TextStyle(
                color: Color(0xFF10B981),
                fontSize: 10,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
      decoration: BoxDecoration(
        color: const Color(0xFF3B82F6).withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.3)),
      ),
      child: Text(
        'scheduled_ready'.tr,
        style: const TextStyle(
          color: Color(0xFF60A5FA),
          fontSize: 10,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildTelemetryCell({
    required String label,
    required String value,
    String? sub,
    bool hasPulse = false,
  }) {
    return Column(
      children: [
        Text(
          label,
          style: const TextStyle(
            color: AppColors.textSecondary,
            fontSize: 8.5,
            fontWeight: FontWeight.bold,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 2),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            if (hasPulse) ...[
              Container(
                width: 5,
                height: 5,
                decoration: const BoxDecoration(
                  color: Color(0xFF10B981),
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 3),
            ],
            Flexible(
              child: Text(
                value,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 10.5,
                  fontWeight: FontWeight.w800,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
        if (sub != null) ...[
          const SizedBox(height: 1),
          Text(
            sub,
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 8,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
          ),
        ],
      ],
    );
  }

  // ---------------- Shift Details BottomSheet ----------------
  void _showShiftDetailsModal(DriverShiftItem shift) {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Color(0xFF141522),
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          border: Border(top: BorderSide(color: AppColors.cardBorder, width: 1.5)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Handle Bar
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.white24,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Modal Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        shift.routeName ?? 'Corridor Route',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${shift.startDepot ?? 'Depot'} ➔ ${shift.endDepot ?? 'Terminus'}',
                        style: const TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF6366F1).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFF6366F1).withValues(alpha: 0.4)),
                  ),
                  child: Text(
                    shift.routeNumber ?? '—',
                    style: const TextStyle(
                      color: Color(0xFF818CF8),
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(color: AppColors.cardBorder, height: 1),
            const SizedBox(height: 14),

            // Info Grid
            _buildModalRow('date'.tr, shift.date ?? 'Today'),
            _buildModalRow('timetable_shift'.tr, '${shift.startTime ?? '—'} – ${shift.endTime ?? '—'}'),
            _buildModalRow('vehicle_assigned'.tr, shift.busNumber ?? '—'),
            if (shift.slotCode != null) _buildModalRow('slot_code'.tr, shift.slotCode!),
            if (shift.shiftTypeLabel != null) _buildModalRow('shift_type'.tr, shift.shiftTypeLabel!),
            if (shift.distance != null) _buildModalRow('corridor_distance'.tr, shift.distance!),
            _buildModalRow('headway_frequency'.tr, shift.frequency ?? '15 mins'),

            const SizedBox(height: 20),
            CustomButton(
              text: 'dispatch_this_route'.tr,
              prefixIcon: const Icon(Icons.speed_rounded, size: 16, color: Colors.white),
              onTap: () {
                Get.back();
                controller.onDispatchRoute(shift);
              },
            ),
            const SizedBox(height: 10),
          ],
        ),
      ),
      isScrollControlled: true,
    );
  }

  Widget _buildModalRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
