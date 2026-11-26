import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/models/driver_models.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controller/driver_completed_trips_controller.dart';

class DriverCompletedTripsView extends GetView<DriverCompletedTripsController> {
  const DriverCompletedTripsView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kBorder = Color(0x14FFFFFF);
  static const Color kGreen = Color(0xFF10B981);
  static const Color kBlue = Color(0xFF3B82F6);
  static const Color kPurple = Color(0xFF8B5CF6);
  static const Color kAmber = Color(0xFFF59E0B);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Obx(() {
          return RefreshIndicator(
            color: AppTheme.gradientBlue,
            backgroundColor: kCardBg,
            onRefresh: controller.onRefresh,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 30),
              physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
              children: [
                // 1. Header Bar
                _buildHeaderBar(context),
                const SizedBox(height: 16),

                // 2. 4-KPI Metric Summary Cards
                _buildKpiGrid(),
                const SizedBox(height: 16),

                // 3. Filter Tabs (All Time, Today, Past 7 Days) & Search Bar
                _buildFilterSearchBar(),
                const SizedBox(height: 14),

                // 4. Trips Content List
                if (controller.isLoading.value)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 40),
                    child: Center(child: CircularProgressIndicator(color: AppColors.accentPurple)),
                  )
                else if (controller.trips.isEmpty)
                  _buildEmptyState()
                else
                  _buildTripsList(),
              ],
            ),
          );
        }),
      ),
    );
  }

  // =========================================================================
  // 1. Header Bar
  // =========================================================================
  Widget _buildHeaderBar(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            InkWell(
              onTap: () => Get.back(),
              borderRadius: BorderRadius.circular(10),
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: kCardBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: kBorder),
                ),
                child: const Icon(Icons.arrow_back, color: Colors.white, size: 18),
              ),
            ),
            const SizedBox(width: 8),

            // Quick Active Corridor Cockpit Button with primaryGradient
            InkWell(
              onTap: controller.navigateToActiveCockpit,
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.accentPurple.withValues(alpha: 0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.speed, color: Colors.white, size: 14),
                    const SizedBox(width: 6),
                    Text(
                      'active_cockpit_btn'.tr,
                      style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(width: 4),
                    const Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 13),
                  ],
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),

        // Title and Completed Count Badge
        Row(
          children: [
            Expanded(
              child: Text(
                'completed_trips_log'.tr,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 19,
                  fontWeight: FontWeight.w900,
                  letterSpacing: -0.3,
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: kGreen.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: kGreen.withValues(alpha: 0.4)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.check_circle, color: kGreen, size: 12),
                  const SizedBox(width: 4),
                  Text(
                    '${controller.totalCompleted.value} ${'common.completed'.tr}',
                    style: const TextStyle(color: kGreen, fontSize: 10, fontWeight: FontWeight.w800),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          'completed_trips_sub'.tr,
          style: const TextStyle(color: Colors.white54, fontSize: 11, height: 1.35),
        ),
      ],
    );
  }

  // =========================================================================
  // 2. 4-KPI Metric Summary Cards
  // =========================================================================
  Widget _buildKpiGrid() {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _buildMetricCard(
                title: 'stat_completed_trips'.tr,
                value: '${controller.totalCompleted.value}',
                subtext: 'verified_telemetry'.tr,
                icon: Icons.check_circle_rounded,
                iconColor: kGreen,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildMetricCard(
                title: 'stat_total_distance'.tr,
                value: '${controller.totalDistanceStr} km',
                subtext: 'accumulated_km_sub'.tr,
                icon: Icons.route_rounded,
                iconColor: kBlue,
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: _buildMetricCard(
                title: 'stat_road_duration'.tr,
                value: controller.totalHoursStr,
                subtext: 'total_voyage_runtime'.tr,
                icon: Icons.access_time_filled_rounded,
                iconColor: AppTheme.gradientPink,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildMetricCard(
                title: 'stat_driver_status'.tr,
                value: controller.driverStatus,
                subtext: controller.driverName,
                icon: Icons.person_rounded,
                iconColor: kAmber,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildMetricCard({
    required String title,
    required String value,
    required String subtext,
    required IconData icon,
    required Color iconColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorder),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.25),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
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
                    color: Colors.white38,
                    fontSize: 9.5,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.4,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: iconColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, color: iconColor, size: 15),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w900,
              letterSpacing: -0.2,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          Text(
            subtext,
            style: TextStyle(
              color: iconColor.withValues(alpha: 0.9),
              fontSize: 9.5,
              fontWeight: FontWeight.w600,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // =========================================================================
  // 3. Filter Tabs & Search Controls Bar
  // =========================================================================
  Widget _buildFilterSearchBar() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        children: [
          // Filter Tabs (All Time, Today, Past 7 Days)
          Container(
            padding: const EdgeInsets.all(3),
            decoration: BoxDecoration(
              color: kFieldBg,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                _buildFilterTabItem('all', 'filter_all_time'.tr),
                _buildFilterTabItem('today', 'filter_today'.tr),
                _buildFilterTabItem('week', 'filter_past_7_days'.tr),
              ],
            ),
          ),
          const SizedBox(height: 10),
          const Divider(color: Colors.white10, height: 1),
          const SizedBox(height: 10),

          // Search Field
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10),
            decoration: BoxDecoration(
              color: kFieldBg,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.white12),
            ),
            child: TextField(
              controller: controller.searchController,
              onChanged: controller.onSearchChanged,
              style: const TextStyle(color: Colors.white, fontSize: 12),
              decoration: InputDecoration(
                icon: const Icon(Icons.search, color: Colors.white38, size: 17),
                hintText: 'search_trips_input_ph'.tr,
                hintStyle: const TextStyle(color: Colors.white38, fontSize: 11.5),
                border: InputBorder.none,
                isDense: true,
                contentPadding: const EdgeInsets.symmetric(vertical: 10),
                suffixIcon: controller.searchQuery.value.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, color: Colors.white54, size: 16),
                        onPressed: controller.clearSearch,
                      )
                    : null,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterTabItem(String key, String title) {
    final isSelected = controller.timeFilter.value == key;

    return Expanded(
      child: GestureDetector(
        onTap: () => controller.setTimeFilter(key),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            gradient: isSelected ? AppTheme.primaryGradient : null,
            borderRadius: BorderRadius.circular(9),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: AppColors.accentPurple.withValues(alpha: 0.35),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : null,
          ),
          child: Text(
            title,
            style: TextStyle(
              color: isSelected ? Colors.white : Colors.white60,
              fontSize: 11,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
            ),
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }

  // =========================================================================
  // 4. Trips Content Area
  // =========================================================================
  Widget _buildTripsList() {
    return Column(
      children: [
        ...controller.trips.map((trip) => _buildTripCard(trip)),
        const SizedBox(height: 12),
        _buildPaginationBar(),
      ],
    );
  }

  Widget _buildTripCard(DriverTripItem trip) {
    final dateStr = _formatDate(trip.startedAt);
    final startTimeStr = _formatTime(trip.startedAt);
    final endTimeStr = _formatTime(trip.endedAt);
    final durationStr = trip.duration ?? _computeDuration(trip.startedAt, trip.endedAt);
    final distanceStr = (trip.coveredKm != null &&
            trip.coveredKm.toString() != '0.00' &&
            trip.coveredKm.toString() != '0')
        ? trip.coveredKm
        : (trip.distanceKm ?? '—');

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.25),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Row 1: Trip Code & Date + Completed Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    trip.tripCode ?? 'TRIP-${trip.id ?? "—"}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.w900,
                      fontFamily: 'monospace',
                    ),
                  ),
                  const SizedBox(height: 1),
                  Text(
                    dateStr,
                    style: const TextStyle(color: Colors.white38, fontSize: 10),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: kGreen.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: kGreen.withValues(alpha: 0.4)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.check_circle, color: kGreen, size: 11),
                    const SizedBox(width: 4),
                    Text(
                      'common.completed'.tr,
                      style: const TextStyle(color: kGreen, fontSize: 9.5, fontWeight: FontWeight.w800),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 10),
          const Divider(color: Colors.white10, height: 1),
          const SizedBox(height: 10),

          // Row 2: Bus Number & Model
          Row(
            children: [
              const Icon(Icons.directions_bus_rounded, color: kBlue, size: 15),
              const SizedBox(width: 6),
              Text(
                trip.busNumber ?? '—',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                  fontFamily: 'monospace',
                ),
              ),
              if (trip.vehicleModel != null && trip.vehicleModel!.isNotEmpty) ...[
                const SizedBox(width: 6),
                Text(
                  '· ${trip.vehicleModel}',
                  style: const TextStyle(color: Colors.white54, fontSize: 11),
                ),
              ],
            ],
          ),

          const SizedBox(height: 4),

          // Corridor Route Name
          Text(
            trip.routeName ?? '${trip.origin ?? "—"} ➔ ${trip.destination ?? "—"}',
            style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.bold),
          ),
          if (trip.origin != null && trip.destination != null) ...[
            const SizedBox(height: 2),
            Text(
              '${trip.origin} ➔ ${trip.destination}',
              style: const TextStyle(color: Colors.white38, fontSize: 10.5),
            ),
          ],

          const SizedBox(height: 10),

          // Row 3: Timings, Duration, Distance & Summary Button
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '$startTimeStr – $endTimeStr',
                    style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                  ),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      Text(
                        '${'runtime_label'.tr}: $durationStr',
                        style: const TextStyle(color: kGreen, fontSize: 10.5, fontWeight: FontWeight.w700),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        '· $distanceStr km',
                        style: const TextStyle(color: Colors.white54, fontSize: 10.5, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ],
              ),

              // Summary Button
              InkWell(
                onTap: () => _showTripDetailsDialog(trip),
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: kFieldBg,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: kBorder),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.visibility_outlined, color: kBlue, size: 13),
                      const SizedBox(width: 4),
                      Text(
                        'view_summary_btn'.tr,
                        style: const TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold),
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

  // =========================================================================
  // 5. Empty State
  // =========================================================================
  Widget _buildEmptyState() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        children: [
          const Icon(Icons.history_toggle_off_rounded, color: Colors.white30, size: 44),
          const SizedBox(height: 12),
          Text(
            'no_completed_trips_found'.tr,
            style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 6),
          Text(
            controller.searchQuery.value.isNotEmpty
                ? '${'no_completed_trips_search'.tr} "${controller.searchQuery.value}".'
                : 'no_completed_trips_desc'.tr,
            style: const TextStyle(color: Colors.white54, fontSize: 11, height: 1.4),
            textAlign: TextAlign.center,
          ),
          if (controller.searchQuery.value.isNotEmpty) ...[
            const SizedBox(height: 14),
            TextButton(
              onPressed: controller.clearSearch,
              child: Text(
                'driver_routes.clear_search'.tr,
                style: const TextStyle(color: kBlue, fontSize: 12, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ],
      ),
    );
  }

  // =========================================================================
  // 6. Pagination Bar
  // =========================================================================
  Widget _buildPaginationBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: kBorder),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          InkWell(
            onTap: controller.currentPage.value > 1
                ? () => controller.changePage(controller.currentPage.value - 1)
                : null,
            borderRadius: BorderRadius.circular(8),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: controller.currentPage.value > 1 ? kFieldBg : Colors.white10,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text('previous'.tr, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
            ),
          ),
          Text(
            '${'gov_billing.page'.tr} ${controller.currentPage.value} ${'gov_billing.of'.tr} ${controller.totalPages.value}',
            style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold),
          ),
          InkWell(
            onTap: controller.currentPage.value < controller.totalPages.value
                ? () => controller.changePage(controller.currentPage.value + 1)
                : null,
            borderRadius: BorderRadius.circular(8),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: controller.currentPage.value < controller.totalPages.value ? kFieldBg : Colors.white10,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text('next'.tr, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  // =========================================================================
  // 7. Completed Trip Details Dialog
  // =========================================================================
  void _showTripDetailsDialog(DriverTripItem trip) {
    controller.openTripDetails(trip);
    Get.dialog(
      Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
        child: SingleChildScrollView(
          child: _buildTripDetailsModal(trip),
        ),
      ),
    ).then((_) {
      controller.closeTripDetails();
    });
  }

  Widget _buildTripDetailsModal(DriverTripItem trip) {
    final displayDistance = (trip.coveredKm != null &&
            trip.coveredKm.toString() != '0.00' &&
            trip.coveredKm.toString() != '0')
        ? '${trip.coveredKm} km'
        : (trip.distanceKm != null ? '${trip.distanceKm} km' : '—');

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFF1B1B2A),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFF1C68FD).withValues(alpha: 0.4)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.6),
            blurRadius: 20,
            offset: const Offset(0, 6),
          ),
        ],
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
                    padding: const EdgeInsets.all(7),
                    decoration: BoxDecoration(
                      gradient: AppTheme.primaryGradient,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.route, color: Colors.white, size: 16),
                  ),
                  const SizedBox(width: 8),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        trip.tripCode ?? 'TRIP-${trip.id ?? "—"}',
                        style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w900, fontFamily: 'monospace'),
                      ),
                      Text(
                        'trip_summary_dialog_title'.tr,
                        style: const TextStyle(color: Colors.white54, fontSize: 10),
                      ),
                    ],
                  ),
                ],
              ),
              InkWell(
                onTap: () {
                  controller.closeTripDetails();
                  if (Get.isDialogOpen == true) Get.back();
                },
                borderRadius: BorderRadius.circular(8),
                child: const Padding(
                  padding: EdgeInsets.all(4),
                  child: Icon(Icons.close, color: Colors.white60, size: 20),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(color: Colors.white10, height: 1),
          const SizedBox(height: 12),

          // Corridor Route Box
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: kFieldBg,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.white10),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'corridor_route_label'.tr.toUpperCase(),
                  style: const TextStyle(color: Colors.white38, fontSize: 9.5, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 3),
                Text(
                  trip.routeName ?? '${trip.origin ?? "—"} ➔ ${trip.destination ?? "—"}',
                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                ),
                if (trip.origin != null && trip.destination != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    '${trip.origin} ➔ ${trip.destination}',
                    style: const TextStyle(color: Colors.white54, fontSize: 10.5),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 10),

          // 2-Col Grid: Assigned Bus & Distance Covered
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: kFieldBg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('assigned_bus_label'.tr.toUpperCase(), style: const TextStyle(color: Colors.white38, fontSize: 9.5, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 3),
                      Text(trip.busNumber ?? '—', style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, fontFamily: 'monospace')),
                      if (trip.vehicleModel != null)
                        Text(trip.vehicleModel!, style: const TextStyle(color: Colors.white54, fontSize: 9.5)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: kFieldBg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('distance_covered_label'.tr.toUpperCase(), style: const TextStyle(color: Colors.white38, fontSize: 9.5, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 3),
                      Text(displayDistance, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, fontFamily: 'monospace')),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // 3-Col Grid: Departure, Arrival, Run Time
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: kFieldBg,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.white10),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    children: [
                      Text('departure_label'.tr.toUpperCase(), style: const TextStyle(color: Colors.white38, fontSize: 9.5, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 3),
                      Text(_formatTime(trip.startedAt), style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold, fontFamily: 'monospace')),
                    ],
                  ),
                ),
                Container(width: 1, height: 26, color: Colors.white10),
                Expanded(
                  child: Column(
                    children: [
                      Text('arrival_label'.tr.toUpperCase(), style: const TextStyle(color: Colors.white38, fontSize: 9.5, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 3),
                      Text(_formatTime(trip.endedAt), style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold, fontFamily: 'monospace')),
                    ],
                  ),
                ),
                Container(width: 1, height: 26, color: Colors.white10),
                Expanded(
                  child: Column(
                    children: [
                      Text('runtime_label'.tr.toUpperCase(), style: const TextStyle(color: Colors.white38, fontSize: 9.5, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 3),
                      Text(
                        trip.duration ?? _computeDuration(trip.startedAt, trip.endedAt),
                        style: const TextStyle(color: kGreen, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 14),
          Align(
            alignment: Alignment.centerRight,
            child: InkWell(
              onTap: () {
                controller.closeTripDetails();
                if (Get.isDialogOpen == true) Get.back();
              },
              borderRadius: BorderRadius.circular(8),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: kFieldBg,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: kBorder),
                ),
                child: Text('close_btn'.tr, style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // =========================================================================
  // Helpers
  // =========================================================================
  String _formatDate(String? raw) {
    if (raw == null || raw.isEmpty) return '—';
    try {
      final dt = DateTime.parse(raw).toLocal();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return '${dt.day.toString().padLeft(2, '0')} ${months[dt.month - 1]} ${dt.year}';
    } catch (_) {
      return raw;
    }
  }

  String _formatTime(String? raw) {
    if (raw == null || raw.isEmpty) return '—';
    try {
      final dt = DateTime.parse(raw).toLocal();
      final hour12 = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
      final minute = dt.minute.toString().padLeft(2, '0');
      final period = dt.hour >= 12 ? 'PM' : 'AM';
      return '$hour12:$minute $period';
    } catch (_) {
      return raw;
    }
  }

  String _computeDuration(String? startRaw, String? endRaw) {
    if (startRaw == null || endRaw == null) return '—';
    try {
      final s = DateTime.parse(startRaw).toLocal();
      final e = DateTime.parse(endRaw).toLocal();
      final diff = e.difference(s);
      if (diff.isNegative) return '—';
      final h = diff.inHours;
      final m = diff.inMinutes % 60;
      if (h > 0) return '${h}h ${m}m';
      if (m > 0) return '$m ${'mins_suffix'.tr}';
      return '${diff.inSeconds % 60}s';
    } catch (_) {
      return '—';
    }
  }
}
