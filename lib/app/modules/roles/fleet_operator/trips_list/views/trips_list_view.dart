import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../data/models/trip_models.dart';
import '../controllers/trips_list_controller.dart';

class TripsListView extends GetView<TripsListController> {
  const TripsListView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top Navigation & Action Bar
            _buildTopAppBar(),

            // Scrollable Content
            Expanded(
              child: RefreshIndicator(
                color: const Color(0xFF6366F1),
                backgroundColor: AppColors.cardBg,
                onRefresh: () => controller.fetchTrips(),
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header Card with Live Radar shortcut
                      _buildHeaderBanner(),
                      const SizedBox(height: 16),

                      // 4 Top KPI Metric Cards
                      _buildKpiMetricsGrid(),
                      const SizedBox(height: 16),

                      // Search and Filter Tabs
                      _buildSearchAndFilterTabs(),
                      const SizedBox(height: 16),

                      // Trips List
                      _buildTripsList(),
                      const SizedBox(height: 20),

                      // Pagination Controls
                      _buildPaginationFooter(),
                      const SizedBox(height: 30),
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

  Widget _buildTopAppBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const CustomBackButton(),
          const Text(
            'Trips & Daily Schedules',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white, size: 22),
            onPressed: () => controller.fetchTrips(),
            tooltip: 'Refresh Trips',
          ),
        ],
      ),
    );
  }

  Widget _buildHeaderBanner() {
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
            children: [
              Expanded(
                child: Row(
                  children: [
                    const Text(
                      'Trips & Voyages Dispatch',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -0.3,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Obx(() => Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1E3A8A).withOpacity(0.35),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFF3B82F6).withOpacity(0.4)),
                          ),
                          child: Text(
                            '${controller.totalItems.value} Recorded',
                            style: const TextStyle(
                              color: Color(0xFF60A5FA),
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        )),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          const Text(
            'Live voyage telematics, origin-to-destination corridors, stops completed, and speed logs.',
            style: TextStyle(
              color: AppColors.textSecondary,
              fontSize: 11,
              height: 1.3,
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: controller.openLiveRadar,
                  icon: Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                    ),
                  ),
                  label: const Text(
                    'Live Tracking Radar',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF059669),
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
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

  Widget _buildKpiMetricsGrid() {
    return Obx(() {
      return GridView.count(
        crossAxisCount: 2,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        mainAxisSpacing: 10,
        crossAxisSpacing: 10,
        childAspectRatio: 1.7,
        children: [
          _buildKpiCard(
            title: 'TOTAL ACTIVE RECORDS',
            value: '${controller.totalRecordedCount} Trips',
            subtitle: 'Assigned & tracked',
            icon: Icons.directions_bus_rounded,
            iconColor: const Color(0xFF3B82F6),
            valColor: Colors.white,
          ),
          _buildKpiCard(
            title: 'IN PROGRESS',
            value: '${controller.inProgressCount} Moving',
            subtitle: 'Live GNSS streaming',
            icon: Icons.speed_rounded,
            iconColor: const Color(0xFF10B981),
            valColor: const Color(0xFF10B981),
          ),
          _buildKpiCard(
            title: 'COMPLETED',
            value: '${controller.completedCount} Logged',
            subtitle: '100% verified log',
            icon: Icons.check_circle_outline_rounded,
            iconColor: const Color(0xFF3B82F6),
            valColor: const Color(0xFF3B82F6),
          ),
          _buildKpiCard(
            title: 'SCHEDULED',
            value: '${controller.scheduledCount} Upcoming',
            subtitle: 'Queued dispatch',
            icon: Icons.access_time_rounded,
            iconColor: const Color(0xFFF59E0B),
            valColor: const Color(0xFFF59E0B),
          ),
        ],
      );
    });
  }

  Widget _buildKpiCard({
    required String title,
    required String value,
    required String subtitle,
    required IconData icon,
    required Color iconColor,
    required Color valColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.12),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: iconColor.withOpacity(0.2)),
            ),
            child: Icon(icon, color: iconColor, size: 20),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 8.5,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.4,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: TextStyle(
                    color: valColor,
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  subtitle,
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 9,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchAndFilterTabs() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          // Search TextField
          Container(
            height: 42,
            decoration: BoxDecoration(
              color: AppColors.inputBg,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.inputBorder),
            ),
            child: TextField(
              controller: controller.searchController,
              style: const TextStyle(color: Colors.white, fontSize: 12),
              decoration: InputDecoration(
                hintText: 'Search Trip, Origin, Destination...',
                hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                prefixIcon: const Icon(Icons.search_rounded, color: AppColors.textMuted, size: 18),
                suffixIcon: Obx(() => controller.searchQuery.value.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.close_rounded, color: AppColors.textMuted, size: 16),
                        onPressed: () {
                          controller.searchController.clear();
                        },
                      )
                    : const SizedBox.shrink()),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
          ),
          const SizedBox(height: 10),

          // 4 Status Tabs
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildFilterTab('All', 'All Trips'),
                const SizedBox(width: 8),
                _buildFilterTab('in_progress', 'In Progress'),
                const SizedBox(width: 8),
                _buildFilterTab('completed', 'Completed'),
                const SizedBox(width: 8),
                _buildFilterTab('scheduled', 'Scheduled'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterTab(String id, String label) {
    return Obx(() {
      final isSelected = controller.activeTab.value == id;
      return GestureDetector(
        onTap: () => controller.setActiveTab(id),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF2563EB) : const Color(0xFF1E212D),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: isSelected ? const Color(0xFF3B82F6) : AppColors.cardBorder,
            ),
          ),
          child: Text(
            label,
            style: TextStyle(
              color: isSelected ? Colors.white : AppColors.textSecondary,
              fontSize: 11,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            ),
          ),
        ),
      );
    });
  }

  Widget _buildTripsList() {
    return Obx(() {
      if (controller.isLoading.value) {
        return Container(
          padding: const EdgeInsets.symmetric(vertical: 40),
          alignment: Alignment.center,
          child: const Column(
            children: [
              CircularProgressIndicator(color: Color(0xFF3B82F6)),
              SizedBox(height: 12),
              Text(
                'Fetching active dispatch records...',
                style: TextStyle(color: AppColors.textSecondary, fontSize: 11),
              ),
            ],
          ),
        );
      }

      if (controller.trips.isEmpty) {
        return Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.directions_bus_outlined, size: 44, color: AppColors.textMuted),
              const SizedBox(height: 10),
              const Text(
                'No Trips Dispatched',
                style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              const Text(
                'No trip records found matching your active filter.',
                style: TextStyle(color: AppColors.textSecondary, fontSize: 11),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 14),
              OutlinedButton(
                onPressed: () {
                  controller.searchController.clear();
                  controller.setActiveTab('All');
                },
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Color(0xFF3B82F6)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: const Text('Reset Filter', style: TextStyle(color: Color(0xFF3B82F6), fontSize: 11)),
              ),
            ],
          ),
        );
      }

      return ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: controller.trips.length,
        separatorBuilder: (context, index) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final trip = controller.trips[index];
          return _buildTripCard(trip);
        },
      );
    });
  }

  Widget _buildTripCard(TripItemModel trip) {
    final vehicleNumber = trip.vehicle?.busNumber ?? 'Unassigned Bus';
    final driverName = trip.driver?.name ?? 'Unassigned Driver';
    final progress = trip.progressPercent;

    return GestureDetector(
      onTap: () => controller.openTripDetails(trip),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row: Code, Bus Number & Status Badge
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            trip.code,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'monospace',
                            ),
                          ),
                          const SizedBox(width: 6),
                          const Text('•', style: TextStyle(color: AppColors.textMuted)),
                          const SizedBox(width: 6),
                          Text(
                            vehicleNumber,
                            style: const TextStyle(
                              color: Color(0xFF60A5FA),
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'monospace',
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${trip.vehicle?.vehicleType ?? 'Transit Vehicle'}${trip.vehicle?.model.isNotEmpty == true ? ' — ${trip.vehicle!.model}' : ''}',
                        style: const TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 10.5,
                        ),
                      ),
                    ],
                  ),
                ),
                _buildStatusPill(trip.status),
              ],
            ),
            const SizedBox(height: 12),

            // Route Waypoints Box
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF0B0D14),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Column(
                children: [
                  // Origin
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.gps_fixed_rounded, color: Color(0xFF10B981), size: 14),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              trip.origin,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              trip.startedAt != null ? 'Started: ${_formatTime(trip.startedAt!)}' : 'Started: Scheduled',
                              style: const TextStyle(
                                color: AppColors.textMuted,
                                fontSize: 9.5,
                                fontFamily: 'monospace',
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  // Dashed connector
                  Padding(
                    padding: const EdgeInsets.only(left: 6),
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: Container(
                        width: 1.5,
                        height: 14,
                        color: AppColors.cardBorder,
                      ),
                    ),
                  ),

                  // Destination
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.location_on_rounded, color: Color(0xFF3B82F6), size: 14),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              trip.destination,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              trip.endedAt != null
                                  ? 'Ended: ${_formatTime(trip.endedAt!)}'
                                  : 'ETA: ${trip.eta}',
                              style: const TextStyle(
                                color: AppColors.textMuted,
                                fontSize: 9.5,
                                fontFamily: 'monospace',
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Progress Bar
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Progress: $progress% (${trip.coveredKm.toStringAsFixed(1)} / ${trip.distanceKm.toStringAsFixed(1)} km)',
                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 10),
                ),
                Text(
                  'ETA: ${trip.eta}',
                  style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 6),
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: LinearProgressIndicator(
                value: (progress / 100.0).clamp(0.0, 1.0),
                backgroundColor: const Color(0xFF1E212D),
                valueColor: AlwaysStoppedAnimation<Color>(
                  trip.status == 'in_progress'
                      ? const Color(0xFF10B981)
                      : (trip.status == 'completed' ? const Color(0xFF3B82F6) : const Color(0xFFF59E0B)),
                ),
                minHeight: 6,
              ),
            ),
            const SizedBox(height: 12),

            // 3 Metric Pills (Driver, Avg Speed, Live Speed)
            Row(
              children: [
                Expanded(
                  child: _buildMetricPill(
                    'DRIVER',
                    driverName,
                    isHighlight: false,
                  ),
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: _buildMetricPill(
                    'AVG SPEED',
                    trip.avgSpeed != null ? '${trip.avgSpeed!.toStringAsFixed(0)} km/h' : '—',
                    isHighlight: false,
                  ),
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: _buildMetricPill(
                    'LIVE SPEED',
                    trip.currentSpeed != null
                        ? '${trip.currentSpeed!.toStringAsFixed(0)} km/h'
                        : (trip.status == 'completed' ? '0 km/h' : '—'),
                    isHighlight: trip.status == 'in_progress',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Divider & Footer Action
            Container(height: 1, color: AppColors.cardBorder),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.gps_fixed_rounded, size: 12, color: AppColors.textMuted),
                    const SizedBox(width: 4),
                    Text(
                      trip.punctualityStatus,
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 10),
                    ),
                  ],
                ),
                Row(
                  children: const [
                    Text(
                      'View Voyage Specs',
                      style: TextStyle(
                        color: Color(0xFF60A5FA),
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(width: 4),
                    Icon(Icons.arrow_forward_rounded, color: Color(0xFF60A5FA), size: 14),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricPill(String title, String val, {bool isHighlight = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 6),
      decoration: BoxDecoration(
        color: const Color(0xFF0E1118),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        children: [
          Text(
            title,
            style: const TextStyle(
              color: AppColors.textMuted,
              fontSize: 8,
              fontWeight: FontWeight.bold,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 2),
          Text(
            val,
            style: TextStyle(
              color: isHighlight ? const Color(0xFF10B981) : Colors.white,
              fontSize: 11,
              fontWeight: FontWeight.bold,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildStatusPill(String status) {
    Color bg;
    Color border;
    Color text;
    String label;
    bool showPulse = false;

    switch (status) {
      case 'in_progress':
        bg = const Color(0xFF064E3B).withOpacity(0.3);
        border = const Color(0xFF059669);
        text = const Color(0xFF34D399);
        label = 'In Progress';
        showPulse = true;
        break;
      case 'completed':
        bg = const Color(0xFF1E3A8A).withOpacity(0.3);
        border = const Color(0xFF2563EB);
        text = const Color(0xFF60A5FA);
        label = 'Completed';
        break;
      case 'scheduled':
      default:
        bg = const Color(0xFF78350F).withOpacity(0.3);
        border = const Color(0xFFD97706);
        text = const Color(0xFFFBBF24);
        label = 'Scheduled';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: border.withOpacity(0.6)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showPulse) ...[
            Container(
              width: 5,
              height: 5,
              decoration: BoxDecoration(
                color: text,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 5),
          ],
          Text(
            label,
            style: TextStyle(
              color: text,
              fontSize: 9.5,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaginationFooter() {
    return Obx(() {
      if (controller.trips.isEmpty) return const SizedBox.shrink();

      return Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'Page ${controller.currentPage.value} of ${controller.totalPages.value}',
            style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
          ),
          Row(
            children: [
              IconButton(
                onPressed: controller.currentPage.value > 1
                    ? () => controller.goToPage(controller.currentPage.value - 1)
                    : null,
                icon: const Icon(Icons.chevron_left_rounded),
                color: Colors.white,
                disabledColor: AppColors.textMuted,
              ),
              IconButton(
                onPressed: controller.currentPage.value < controller.totalPages.value
                    ? () => controller.goToPage(controller.currentPage.value + 1)
                    : null,
                icon: const Icon(Icons.chevron_right_rounded),
                color: Colors.white,
                disabledColor: AppColors.textMuted,
              ),
            ],
          ),
        ],
      );
    });
  }

  String _formatTime(String raw) {
    try {
      final dt = DateTime.parse(raw).toLocal();
      final hour = dt.hour > 12 ? dt.hour - 12 : (dt.hour == 0 ? 12 : dt.hour);
      final amPm = dt.hour >= 12 ? 'PM' : 'AM';
      final min = dt.minute.toString().padLeft(2, '0');
      return '$hour:$min $amPm';
    } catch (_) {
      return raw;
    }
  }
}
