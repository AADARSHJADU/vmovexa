import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../widgets/custom_button.dart';
import '../controllers/trip_details_controller.dart';
import 'package:vmovexa/app/data/models/trip_details_model.dart';

class TripDetailsView extends GetView<TripDetailsController> {
  const TripDetailsView({super.key});

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
                    'Loading voyage telemetry & dispatch data...',
                    style: TextStyle(color: AppColors.textMuted, fontSize: 13),
                  ),
                ],
              ),
            );
          }

          final trip = controller.trip.value;

          return Column(
            children: [
              // 1. Top Bar
              _buildTopBar(context),

              // 2. Main Scrollable Content
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  physics: const BouncingScrollPhysics(),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Top Split Card (Info & Google Static Map)
                      _buildTopSplitCard(trip),
                      const SizedBox(height: 20),

                      // Route Summary Section
                      _buildSectionHeader('Route Summary & Coverage'),
                      const SizedBox(height: 12),
                      _buildRouteSummaryPanel(trip),
                      const SizedBox(height: 20),

                      // Live Statistics Section
                      _buildSectionHeader('Live Statistics & Gauges'),
                      const SizedBox(height: 12),
                      _buildLiveStatsGrid(trip),
                      const SizedBox(height: 20),

                      // Columns: Timeline & Driver/Vehicle specs
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Left Column: Waypoints Timeline
                          Expanded(
                            flex: 11,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildSubHeader('Trip Waypoints Timeline'),
                                const SizedBox(height: 12),
                                _buildTimelinePanel(trip),
                              ],
                            ),
                          ),
                          const SizedBox(width: 14),
                          // Right Column: Driver & Vehicle specs
                          Expanded(
                            flex: 12,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildSubHeader('Driver Information'),
                                const SizedBox(height: 12),
                                _buildDriverInfoCard(trip),
                                const SizedBox(height: 18),
                                _buildSubHeader('Vehicle Information'),
                                const SizedBox(height: 12),
                                _buildVehicleInfoCard(trip),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // Quick Actions Section
                      _buildSectionHeader('Quick Actions'),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(child: _buildQuickActionItem('Call Driver', Icons.call_outlined, const Color(0xFF10B981), controller.callDriver)),
                          const SizedBox(width: 8),
                          Expanded(child: _buildQuickActionItem('Navigate', Icons.navigation_outlined, const Color(0xFF3B82F6), controller.navigate)),
                          const SizedBox(width: 8),
                          Expanded(child: _buildQuickActionItem('Send Alert', Icons.warning_amber_rounded, Colors.orangeAccent, controller.sendAlert)),
                          const SizedBox(width: 8),
                          Expanded(child: _buildQuickActionItem('Export Manifest', Icons.download_rounded, const Color(0xFF8B5CF6), controller.downloadReport)),
                        ],
                      ),
                      const SizedBox(height: 32),

                      // Complete Trip button
                      Obx(() => CustomButton(
                            text: controller.isCompleting.value ? 'Marking Completed...' : 'Complete Trip',
                            onTap: controller.isCompleting.value ? () {} : controller.completeTrip,
                            isGradient: true,
                          )),
                      const SizedBox(height: 12),
                      CustomButton(
                        text: 'Recenter Live Radar',
                        isOutlined: true,
                        onTap: () => Get.back(),
                      ),
                      const SizedBox(height: 20),
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

  Widget _buildTopBar(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        border: Border(bottom: BorderSide(color: AppColors.cardBorder, width: 1)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const CustomBackButton(),
          const Text(
            'Trip Dispatch Details',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          IconButton(
            icon: const Icon(Icons.sync_rounded, color: Color(0xFF10B981), size: 20),
            tooltip: 'Reload Telemetry',
            onPressed: controller.loadTripDetails,
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: const TextStyle(
        color: Colors.white,
        fontSize: 14,
        fontWeight: FontWeight.bold,
      ),
    );
  }

  Widget _buildSubHeader(String title) {
    return Text(
      title,
      style: const TextStyle(
        color: Colors.white,
        fontSize: 12,
        fontWeight: FontWeight.bold,
      ),
    );
  }

  // Top Split Card with Google Static Map
  Widget _buildTopSplitCard(TripDetailsModel trip) {
    return Container(
      height: 150,
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        children: [
          // Left Info Panel
          Expanded(
            flex: 13,
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: trip.statusColor.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: trip.statusColor, width: 0.8),
                    ),
                    child: Text(
                      trip.displayStatus,
                      style: TextStyle(
                        color: trip.statusColor,
                        fontSize: 9.5,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),

                  GestureDetector(
                    onTap: controller.copyTripId,
                    child: Row(
                      children: [
                        Flexible(
                          child: Text(
                            trip.code,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 6),
                        const Icon(Icons.copy_rounded, color: AppColors.textMuted, size: 13),
                      ],
                    ),
                  ),

                  Row(
                    children: [
                      const Icon(Icons.directions_bus_rounded, color: Color(0xFF3B82F6), size: 14),
                      const SizedBox(width: 6),
                      Flexible(
                        child: Text(
                          trip.vehicleName,
                          style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),

                  Row(
                    children: [
                      const Icon(Icons.person_outline_rounded, color: Color(0xFF10B981), size: 14),
                      const SizedBox(width: 6),
                      Flexible(
                        child: Text(
                          trip.driverName,
                          style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      GestureDetector(
                        onTap: controller.callDriver,
                        child: const Icon(Icons.phone_rounded, color: Color(0xFF10B981), size: 12),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Divider vertical line
          Container(width: 1, height: double.infinity, color: AppColors.cardBorder),

          // Right Google Static Map
          Expanded(
            flex: 11,
            child: ClipRRect(
              borderRadius: const BorderRadius.only(topRight: Radius.circular(16), bottomRight: Radius.circular(16)),
              child: controller.staticMapUrl.value.isNotEmpty
                  ? Image.network(
                      controller.staticMapUrl.value,
                      fit: BoxFit.cover,
                      errorBuilder: (ctx, err, stack) => _buildMapFallback(),
                      loadingBuilder: (ctx, child, progress) {
                        if (progress == null) return child;
                        return const Center(child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF3B82F6)));
                      },
                    )
                  : _buildMapFallback(),
            ),
          ),
        ],
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
            Icon(Icons.map_outlined, color: AppColors.textMuted, size: 24),
            SizedBox(height: 4),
            Text('Transit Route Map', style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
          ],
        ),
      ),
    );
  }

  // Route Summary Panel with Waypoints & Progress
  Widget _buildRouteSummaryPanel(TripDetailsModel trip) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Vertical path stepper
              Column(
                children: [
                  Container(width: 10, height: 10, decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle)),
                  Container(width: 1.5, height: 38, color: AppColors.cardBorder),
                  const Icon(Icons.location_on_rounded, color: Colors.redAccent, size: 18),
                ],
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Origin Point', style: TextStyle(color: AppColors.textMuted, fontSize: 9)),
                    const SizedBox(height: 2),
                    Text(trip.origin, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                    Text(trip.displayStartTime, style: const TextStyle(color: AppColors.textSecondary, fontSize: 10)),
                    const SizedBox(height: 14),
                    const Text('Destination', style: TextStyle(color: AppColors.textMuted, fontSize: 9)),
                    const SizedBox(height: 2),
                    Text(trip.destination, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                    Text('ETA ${trip.eta}', style: const TextStyle(color: Color(0xFF3B82F6), fontSize: 10, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              // Route statistics specs details
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildRouteStatText('${trip.totalDistance.toStringAsFixed(1)} km', 'Total Distance'),
                  const SizedBox(height: 10),
                  _buildRouteStatText('${trip.coveredDistance.toStringAsFixed(1)} km (${trip.progressPercent}%)', 'Covered', color: const Color(0xFF3B82F6)),
                  const SizedBox(height: 10),
                  _buildRouteStatText('${trip.remainingDistance.toStringAsFixed(1)} km', 'Remaining', color: Colors.orangeAccent),
                  const SizedBox(height: 10),
                  _buildRouteStatText(trip.eta, 'Est. Time', color: const Color(0xFF10B981)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 14),
          // Progress bar
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Transit Progress: ${trip.progressPercent}%', style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
                  Text('${trip.coveredDistance.toStringAsFixed(1)} of ${trip.totalDistance.toStringAsFixed(1)} km', style: const TextStyle(color: AppColors.textSecondary, fontSize: 10)),
                ],
              ),
              const SizedBox(height: 6),
              ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: LinearProgressIndicator(
                  value: (trip.progressPercent / 100).clamp(0.0, 1.0),
                  backgroundColor: AppColors.background,
                  valueColor: AlwaysStoppedAnimation<Color>(trip.statusColor),
                  minHeight: 6,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRouteStatText(String value, String label, {Color color = Colors.white}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(value, style: TextStyle(color: color, fontSize: 11.5, fontWeight: FontWeight.bold)),
        Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
      ],
    );
  }

  // Live Statistics 6-Card Grid
  Widget _buildLiveStatsGrid(TripDetailsModel trip) {
    return GridView.count(
      crossAxisCount: 3,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 10,
      crossAxisSpacing: 10,
      childAspectRatio: 1.25,
      children: [
        _buildStatCounter('${trip.currentSpeed.toStringAsFixed(0)} km/h', 'Current Speed', Icons.speed_rounded, const Color(0xFF3B82F6)),
        _buildStatCounter('${trip.avgSpeed.toStringAsFixed(0)} km/h', 'Average Speed', Icons.speed_rounded, const Color(0xFF10B981)),
        _buildStatCounter('${trip.maxSpeed.toStringAsFixed(0)} km/h', 'Max Speed', Icons.speed_rounded, Colors.redAccent),
        _buildStatCounter(trip.punctuality, 'Punctuality', Icons.timer_outlined, Colors.orangeAccent),
        _buildStatCounter(trip.displayStartTime, 'Departure', Icons.departure_board_rounded, Colors.amber),
        _buildStatCounter(trip.gpsStatus, 'GPS Status', Icons.signal_cellular_alt_rounded, const Color(0xFF8B5CF6)),
      ],
    );
  }

  Widget _buildStatCounter(String value, String label, IconData icon, Color iconColor) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(icon, color: iconColor, size: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
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
        ],
      ),
    );
  }

  // Dynamic Waypoint Timeline Panel
  Widget _buildTimelinePanel(TripDetailsModel trip) {
    final waypoints = trip.waypoints;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: waypoints.asMap().entries.map((entry) {
          final idx = entry.key;
          final wp = entry.value;
          final isLast = idx == waypoints.length - 1;
          return _buildTimelineStep(
            wp.time,
            wp.title,
            wp.subtitle,
            !isLast,
            isCompleted: wp.isCompleted,
            isActive: wp.isActive,
            isLast: wp.isLast || isLast,
          );
        }).toList(),
      ),
    );
  }

  Widget _buildTimelineStep(
    String time,
    String title,
    String subtitle,
    bool showLine, {
    bool isCompleted = false,
    bool isActive = false,
    bool isLast = false,
  }) {
    Color pointColor = isCompleted
        ? const Color(0xFF10B981)
        : (isActive ? const Color(0xFF3B82F6) : (isLast ? Colors.redAccent : AppColors.textMuted));

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 10,
              height: 10,
              decoration: BoxDecoration(
                color: pointColor,
                shape: BoxShape.circle,
                boxShadow: isActive
                    ? [
                        BoxShadow(
                          color: const Color(0xFF3B82F6).withValues(alpha: 0.5),
                          blurRadius: 6,
                          spreadRadius: 2,
                        ),
                      ]
                    : null,
              ),
            ),
            if (showLine)
              Container(
                width: 1.5,
                height: 44,
                color: isCompleted ? const Color(0xFF10B981) : AppColors.cardBorder,
              ),
          ],
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Flexible(
                    child: Text(
                      title,
                      style: TextStyle(
                        color: isActive ? const Color(0xFF3B82F6) : Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    time,
                    style: const TextStyle(color: AppColors.textMuted, fontSize: 9),
                  ),
                ],
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: const TextStyle(color: AppColors.textSecondary, fontSize: 9.5),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 14),
            ],
          ),
        ),
      ],
    );
  }

  // Driver Information Card
  Widget _buildDriverInfoCard(TripDetailsModel trip) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: const BoxDecoration(
                  color: Color(0xFF1E293B),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.person, color: Color(0xFF10B981), size: 20),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(trip.driverName, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 2),
                    Text(trip.driverLicense, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('★ ${trip.driverRating}', style: const TextStyle(color: Colors.amber, fontSize: 11, fontWeight: FontWeight.bold)),
              Text('${trip.driverTripsCount} Trips Logged', style: const TextStyle(color: AppColors.textSecondary, fontSize: 10)),
            ],
          ),
          const SizedBox(height: 8),
          GestureDetector(
            onTap: controller.callDriver,
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 6),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: const Color(0xFF10B981).withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFF10B981), width: 0.8),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.phone_rounded, color: Color(0xFF10B981), size: 12),
                  const SizedBox(width: 6),
                  Text('Call: ${trip.driverPhone}', style: const TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Vehicle Information Card
  Widget _buildVehicleInfoCard(TripDetailsModel trip) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(trip.vehicleName, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFF3B82F6).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(trip.fuelType, style: const TextStyle(color: Color(0xFF3B82F6), fontSize: 8.5, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(trip.vehicleModel, style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('GPS Telemetry', style: TextStyle(color: AppColors.textMuted, fontSize: 9)),
              Text(
                trip.lat != null ? '${trip.lat!.toStringAsFixed(3)}, ${trip.lng!.toStringAsFixed(3)}' : 'Connected',
                style: const TextStyle(color: Color(0xFF10B981), fontSize: 9.5, fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionItem(String title, IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 64,
        padding: const EdgeInsets.all(6),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.cardBorder, width: 1),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 18),
            const SizedBox(height: 4),
            Text(
              title,
              style: const TextStyle(color: Colors.white, fontSize: 8.5, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
