import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../widgets/custom_button.dart';
import '../controllers/live_tracking_controller.dart';
import 'package:vmovexa/app/data/models/government_models.dart';

class LiveTrackingView extends GetView<LiveTrackingController> {
  const LiveTrackingView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Obx(() {
          if (controller.isLoading.value) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(color: Color(0xFF3B82F6)),
                  SizedBox(height: 16),
                  Text(
                    'Connecting to Live Transit GPS Network...',
                    style: TextStyle(color: AppColors.textMuted, fontSize: 13),
                  ),
                ],
              ),
            );
          }

          final stats = controller.trackingData.value;
          final current = controller.selectedVehicle.value;

          return Column(
            children: [
              // 1. Top Header Bar
              _buildHeader(context, stats),

              // 2. Main Scrollable Content
              Expanded(
                child: SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Route Selector & Status Filter Chips
                      _buildFilterSection(stats),

                      // Google Maps Display with Floating Telemetry HUD
                      _buildMapSection(current),

                      // Vehicle List Carousel
                      _buildVehicleListSection(),

                      // Selected Vehicle Detailed Telemetry Card
                      if (current != null) _buildSelectedVehicleTelemetryCard(current),

                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
            ],
          );
        }),
      ),
    );
  }

  // Header with live radar indicator
  Widget _buildHeader(BuildContext context, LiveTrackingDataModel stats) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        border: Border(bottom: BorderSide(color: AppColors.cardBorder, width: 1)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const CustomBackButton(),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const Text(
                  'Transit Live Telemetry',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 3),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 7,
                      height: 7,
                      decoration: const BoxDecoration(
                        color: Color(0xFF10B981),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      '${stats.withGps} GPS Online • ${stats.broadcasting} Broadcasting',
                      style: const TextStyle(
                        color: Color(0xFF10B981),
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Row(
            children: [
              // Map Style Toggle
              IconButton(
                icon: Icon(
                  controller.mapType.value == 'roadmap' ? Icons.satellite_alt_rounded : Icons.map_rounded,
                  color: Colors.white70,
                  size: 20,
                ),
                tooltip: 'Toggle Satellite / Roadmap',
                onPressed: controller.toggleMapType,
              ),
              // Refresh Button
              IconButton(
                icon: controller.isRefreshing.value
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF10B981)),
                      )
                    : const Icon(Icons.sync_rounded, color: Color(0xFF10B981), size: 22),
                tooltip: 'Refresh Telemetry',
                onPressed: controller.refreshTracking,
              ),
            ],
          ),
        ],
      ),
    );
  }

  // Filter Bar (Route Dropdown + Status Pills + Search)
  Widget _buildFilterSection(LiveTrackingDataModel stats) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Transit Route Dropdown
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: AppColors.cardBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.cardBorder, width: 1),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: controller.selectedRouteId.value,
                isExpanded: true,
                dropdownColor: const Color(0xFF1E293B),
                icon: const Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white70),
                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                items: [
                  DropdownMenuItem(
                    value: 'all',
                    child: Text('All Transit Routes (${stats.total} Buses)'),
                  ),
                  ...controller.routes.map(
                    (r) => DropdownMenuItem(
                      value: r.id,
                      child: Text('${r.name} ${r.code != null ? "(${r.code})" : ""}'),
                    ),
                  ),
                ],
                onChanged: (val) {
                  if (val != null) controller.changeRoute(val);
                },
              ),
            ),
          ),

          const SizedBox(height: 12),

          // Search Input
          Container(
            height: 42,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: AppColors.cardBg,
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
                    onChanged: controller.onSearchChanged,
                    style: const TextStyle(color: Colors.white, fontSize: 12),
                    decoration: const InputDecoration(
                      hintText: 'Search bus #, driver name, route...',
                      hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 12),
                      border: InputBorder.none,
                      isDense: true,
                    ),
                  ),
                ),
                if (controller.searchQuery.value.isNotEmpty)
                  GestureDetector(
                    onTap: () {
                      controller.searchController.clear();
                      controller.onSearchChanged('');
                    },
                    child: const Icon(Icons.close_rounded, color: AppColors.textMuted, size: 16),
                  ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // Filter chips: All, Broadcasting, Standby, Offline
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildStatusChip('All', stats.total, const Color(0xFF3B82F6)),
                const SizedBox(width: 8),
                _buildStatusChip('Broadcasting', stats.broadcasting, const Color(0xFF10B981)),
                const SizedBox(width: 8),
                _buildStatusChip('Standby', stats.standby, const Color(0xFFF59E0B)),
                const SizedBox(width: 8),
                _buildStatusChip('Offline', stats.offline, const Color(0xFF64748B)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusChip(String status, int count, Color accent) {
    final isSelected = controller.selectedStatus.value.toLowerCase() == status.toLowerCase();
    return GestureDetector(
      onTap: () => controller.changeStatus(status),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? accent.withValues(alpha: 0.18) : AppColors.cardBg,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? accent : AppColors.cardBorder,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 6,
              height: 6,
              decoration: BoxDecoration(color: accent, shape: BoxShape.circle),
            ),
            const SizedBox(width: 6),
            Text(
              status,
              style: TextStyle(
                color: isSelected ? Colors.white : AppColors.textSecondary,
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
            const SizedBox(width: 4),
            Text(
              '($count)',
              style: TextStyle(
                color: isSelected ? accent : AppColors.textMuted,
                fontSize: 10,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Interactive Google Maps Section
  Widget _buildMapSection(LiveTrackingVehicle? current) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      height: 310,
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.4),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Stack(
          children: [
            // Google Map Static Image
            Positioned.fill(
              child: controller.staticMapUrl.value.isNotEmpty
                  ? Image.network(
                      controller.staticMapUrl.value,
                      fit: BoxFit.cover,
                      errorBuilder: (ctx, err, stack) => _buildMapFallback(),
                      loadingBuilder: (ctx, child, progress) {
                        if (progress == null) return child;
                        return _buildMapLoading();
                      },
                    )
                  : _buildMapFallback(),
            ),

            // Top-left HUD Card with Selected Bus Info
            if (current != null)
              Positioned(
                top: 12,
                left: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A).withValues(alpha: 0.92),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.cardBorder, width: 1),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: const Color(0xFF3B82F6).withValues(alpha: 0.2),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.directions_bus_filled_rounded, color: Color(0xFF3B82F6), size: 16),
                      ),
                      const SizedBox(width: 8),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                current.busNumber,
                                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                                decoration: BoxDecoration(
                                  color: current.statusColor.withValues(alpha: 0.2),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  current.screenStatus,
                                  style: TextStyle(color: current.statusColor, fontSize: 9, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${current.displaySpeed} • ${current.displayRoute}',
                            style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

            // Floating Map Controls (Zoom In, Zoom Out, Recenter)
            Positioned(
              right: 12,
              bottom: 12,
              child: Column(
                children: [
                  _buildMapIconButton(Icons.add, controller.zoomIn),
                  const SizedBox(height: 8),
                  _buildMapIconButton(Icons.remove, controller.zoomOut),
                  const SizedBox(height: 8),
                  _buildMapIconButton(Icons.my_location_rounded, controller.recenterMap),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMapIconButton(IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          color: const Color(0xFF0F172A).withValues(alpha: 0.9),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.cardBorder, width: 1),
        ),
        child: Icon(icon, color: Colors.white, size: 18),
      ),
    );
  }

  Widget _buildMapFallback() {
    return Container(
      color: const Color(0xFF0F172A),
      child: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.map_outlined, color: AppColors.textMuted, size: 36),
            SizedBox(height: 8),
            Text('Transit Network Telemetry Map', style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
          ],
        ),
      ),
    );
  }

  Widget _buildMapLoading() {
    return Container(
      color: const Color(0xFF0F172A),
      child: const Center(
        child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF3B82F6)),
      ),
    );
  }

  // Vehicle Cards Horizontal Carousel
  Widget _buildVehicleListSection() {
    final list = controller.filteredVehicles;
    return Container(
      margin: const EdgeInsets.only(top: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Active Transit Vehicles (${list.length})',
                  style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                const Text('Tap to view telemetry', style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
              ],
            ),
          ),
          const SizedBox(height: 10),
          if (list.isEmpty)
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.cardBorder, width: 1),
              ),
              child: const Center(
                child: Text('No vehicles match the selected criteria', style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
              ),
            )
          else
            SizedBox(
              height: 105,
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                scrollDirection: Axis.horizontal,
                physics: const BouncingScrollPhysics(),
                itemCount: list.length,
                itemBuilder: (ctx, index) {
                  final v = list[index];
                  final isSelected = controller.selectedVehicle.value?.id == v.id;
                  return GestureDetector(
                    onTap: () => controller.selectVehicle(v),
                    child: Container(
                      width: 175,
                      margin: const EdgeInsets.only(right: 10),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.cardBg,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSelected ? const Color(0xFF3B82F6) : AppColors.cardBorder,
                          width: isSelected ? 1.8 : 1,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(
                                  v.busNumber,
                                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              Container(
                                width: 8,
                                height: 8,
                                decoration: BoxDecoration(color: v.statusColor, shape: BoxShape.circle),
                              ),
                            ],
                          ),
                          Text(
                            v.displayRoute,
                            style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                v.displaySpeed,
                                style: const TextStyle(color: Color(0xFF3B82F6), fontSize: 11, fontWeight: FontWeight.bold),
                              ),
                              Text(
                                v.screenStatus,
                                style: TextStyle(color: v.statusColor, fontSize: 9.5, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
        ],
      ),
    );
  }

  // Selected Vehicle Telemetry Details
  Widget _buildSelectedVehicleTelemetryCard(LiveTrackingVehicle current) {
    return Container(
      margin: const EdgeInsets.only(left: 16, right: 16, top: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header of Selected Vehicle
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    current.busNumber,
                    style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    current.displayRoute,
                    style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: current.statusColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: current.statusColor, width: 1),
                ),
                child: Text(
                  current.screenStatus.toUpperCase(),
                  style: TextStyle(color: current.statusColor, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // 4-item Telemetry Grid (Speed, Driver, GPS Coordinates, Last Sync)
          Row(
            children: [
              Expanded(
                child: _buildTelemetryMetric(
                  'Current Speed',
                  current.displaySpeed,
                  Icons.speed_rounded,
                  const Color(0xFF3B82F6),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildTelemetryMetric(
                  'Transit Operator',
                  current.displayDriver,
                  Icons.person_outline_rounded,
                  const Color(0xFF10B981),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: _buildTelemetryMetric(
                  'GPS Coordinates',
                  current.lat != null ? '${current.lat!.toStringAsFixed(4)}, ${current.lng!.toStringAsFixed(4)}' : 'No GPS Fix',
                  Icons.gps_fixed_rounded,
                  const Color(0xFF8B5CF6),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildTelemetryMetric(
                  'Status Indicator',
                  current.screenStatus,
                  Icons.tv_rounded,
                  current.statusColor,
                ),
              ),
            ],
          ),

          const SizedBox(height: 18),

          // Actions
          Row(
            children: [
              Expanded(
                child: CustomButton(
                  text: 'View Trip Details',
                  isGradient: true,
                  onTap: controller.goToTripDetails,
                ),
              ),
              const SizedBox(width: 10),
              GestureDetector(
                onTap: controller.callDriver,
                child: Container(
                  height: 48,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFF10B981), width: 1),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.phone_rounded, color: Color(0xFF10B981), size: 18),
                      SizedBox(width: 6),
                      Text('Call', style: TextStyle(color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.bold)),
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

  Widget _buildTelemetryMetric(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.cardBorder, width: 1),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Icon(icon, color: color, size: 16),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  value,
                  style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  label,
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 9),
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
}

// Custom Painter preserved for backward compatibility
class TrackingMapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final linePaint = Paint()
      ..color = const Color(0xFF1E293B)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    canvas.drawLine(Offset(0, size.height * 0.2), Offset(size.width, size.height * 0.22), linePaint);
    canvas.drawLine(Offset(0, size.height * 0.45), Offset(size.width, size.height * 0.38), linePaint);
    canvas.drawLine(Offset(0, size.height * 0.7), Offset(size.width, size.height * 0.75), linePaint);

    final routePaint = Paint()
      ..color = const Color(0xFF3B82F6)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.5
      ..strokeCap = StrokeCap.round;

    final routePath = Path()
      ..moveTo(size.width * 0.2, size.height * 0.7)
      ..quadraticBezierTo(size.width * 0.4, size.height * 0.6, size.width * 0.5, size.height * 0.45)
      ..quadraticBezierTo(size.width * 0.6, size.height * 0.3, size.width * 0.8, size.height * 0.25);

    canvas.drawPath(routePath, routePaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
