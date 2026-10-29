import 'package:vmovexa/app/widgets/custom_button.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../data/models/trip_models.dart';
import '../controllers/trip_details_controller.dart';

class TripDetailsView extends GetView<TripDetailsController> {
  const TripDetailsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top Navigation & Action Bar
            _buildTopAppBar(),

            // Content Body
            Expanded(
              child: Obx(() {
                if (controller.isLoading.value && controller.trip.value == null) {
                  return const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CircularProgressIndicator(color: Color(0xFF3B82F6)),
                        SizedBox(height: 12),
                        Text(
                          'Loading voyage telemetry & dispatch data...',
                          style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
                        ),
                      ],
                    ),
                  );
                }

                final trip = controller.trip.value;
                if (trip == null) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.info_outline_rounded, color: AppColors.textMuted, size: 48),
                          const SizedBox(height: 12),
                          const Text(
                            'Trip record not found or inaccessible.',
                            style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 16),
                          CustomButton(
                            text: 'Return to Trips',
                            onTap: controller.returnToTrips,
                            width: 160,
                            height: 42,
                          ),
                        ],
                      ),
                    ),
                  );
                }

                final totalDist = trip.distanceKm;
                final covDist = trip.coveredKm;
                final remDist = (totalDist - covDist).clamp(0.0, 9999.0);
                final progress = trip.progressPercent;
                final vehiclePlate = trip.vehicle?.busNumber ?? '—';
                final driver = trip.driver;

                return SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header Banner
                      _buildHeaderBanner(trip),
                      const SizedBox(height: 16),

                      // 1. Route Summary & Coverage Card
                      _buildRouteSummaryCard(trip, totalDist, covDist, remDist, progress),
                      const SizedBox(height: 16),

                      // 2. Live Statistics (6 Metric Gauges)
                      _buildLiveStatsGauges(trip, vehiclePlate),
                      const SizedBox(height: 16),

                      // 3. Waypoint Timeline
                      _buildWaypointTimelineCard(trip, covDist, progress),
                      const SizedBox(height: 16),

                      // 4. Assigned Driver Card
                      _buildDriverInfoCard(driver),
                      const SizedBox(height: 16),

                      // 5. Vehicle Telematics Card
                      _buildVehicleTelematicsCard(trip, vehiclePlate),
                      const SizedBox(height: 20),

                      // 6. Bottom Action Bar
                      _buildBottomActionBar(trip),
                      const SizedBox(height: 30),
                    ],
                  ),
                );
              }),
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
            'Trip Dispatch Details',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white, size: 22),
            onPressed: () => controller.fetchTripDetails(),
            tooltip: 'Refresh Specs',
          ),
        ],
      ),
    );
  }

  Widget _buildHeaderBanner(TripItemModel trip) {
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
                    Text(
                      trip.code,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        fontFamily: 'monospace',
                      ),
                    ),
                    const SizedBox(width: 8),
                    _buildStatusPill(trip.status),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          const Text(
            'Live waypoint tracking, speed analytics, stops completed, and telemetry logs.',
            style: TextStyle(
              color: AppColors.textSecondary,
              fontSize: 11,
              height: 1.3,
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              // Copy Trip ID Button
              Expanded(
                child: Obx(() => OutlinedButton.icon(
                      onPressed: controller.copyTripId,
                      icon: Icon(
                        controller.isCopied.value ? Icons.check_rounded : Icons.copy_rounded,
                        size: 14,
                        color: controller.isCopied.value ? const Color(0xFF10B981) : Colors.white,
                      ),
                      label: Text(
                        controller.isCopied.value ? 'Copied!' : trip.code,
                        style: TextStyle(
                          color: controller.isCopied.value ? const Color(0xFF10B981) : Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'monospace',
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(
                          color: controller.isCopied.value ? const Color(0xFF10B981) : AppColors.cardBorder,
                        ),
                        backgroundColor: const Color(0xFF141824),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    )),
              ),
              const SizedBox(width: 10),

              // Live Radar Button
              Expanded(
                child: Container(
                  height: 46,
                  decoration: BoxDecoration(
                    gradient: AppTheme.primaryGradient,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.gradientPink.withValues(alpha: 0.25),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: ElevatedButton.icon(
                    onPressed: controller.openLiveRadar,
                    icon: const Icon(Icons.radar_rounded, size: 16, color: Colors.white),
                    label: const Text(
                      'Live Radar',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      shadowColor: Colors.transparent,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
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

  Widget _buildRouteSummaryCard(
    TripItemModel trip,
    double totalDist,
    double covDist,
    double remDist,
    int progress,
  ) {
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
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: Color(0xFF3B82F6),
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              const Text(
                'ROUTE SUMMARY & COVERAGE',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 11.5,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Origin and Destination Corridor
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF0B0D14),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.cardBorder),
            ),
            child: Column(
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.gps_fixed_rounded, color: Color(0xFF10B981), size: 14),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Origin: ${trip.origin}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 6),
                  child: Row(
                    children: [
                      Container(width: 1.5, height: 12, color: AppColors.cardBorder),
                      const SizedBox(width: 10),
                      const Icon(Icons.arrow_downward_rounded, size: 12, color: AppColors.textMuted),
                    ],
                  ),
                ),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.location_on_rounded, color: Color(0xFF3B82F6), size: 14),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Dest: ${trip.destination}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // 4 Stats (Total, Covered, Remaining, ETA)
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 8,
            crossAxisSpacing: 8,
            childAspectRatio: 2.2,
            children: [
              _buildMiniMetric('TOTAL DISTANCE', '${totalDist.toStringAsFixed(1)} km', Colors.white),
              _buildMiniMetric('COVERED', '${covDist.toStringAsFixed(1)} km ($progress%)', const Color(0xFF60A5FA)),
              _buildMiniMetric('REMAINING', '${remDist.toStringAsFixed(1)} km', const Color(0xFFFBBF24)),
              _buildMiniMetric('ETA', trip.eta, const Color(0xFF34D399)),
            ],
          ),
          const SizedBox(height: 14),

          // Progress Bar with Gradient
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Progress: $progress% Completed',
                style: const TextStyle(color: AppColors.textSecondary, fontSize: 10),
              ),
              Text(
                '${covDist.toStringAsFixed(1)} km of ${totalDist.toStringAsFixed(1)} km',
                style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
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
              minHeight: 8,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMiniMetric(String title, String val, Color valColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF0E1118),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            title,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 8, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 2),
          Text(
            val,
            style: TextStyle(color: valColor, fontSize: 11, fontWeight: FontWeight.bold),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildLiveStatsGauges(TripItemModel trip, String vehiclePlate) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Live Statistics Gauges',
          style: TextStyle(
            color: Colors.white,
            fontSize: 13,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 10),
        GridView.count(
          crossAxisCount: 3,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 8,
          crossAxisSpacing: 8,
          childAspectRatio: 1.15,
          children: [
            _buildGaugeCard(
              icon: Icons.speed_rounded,
              title: 'CURRENT SPEED',
              value: trip.currentSpeed != null
                  ? '${trip.currentSpeed!.toStringAsFixed(0)} km/h'
                  : (trip.status == 'completed' ? '0 km/h' : '—'),
              valColor: Colors.white,
            ),
            _buildGaugeCard(
              icon: Icons.bar_chart_rounded,
              title: 'AVERAGE SPEED',
              value: trip.avgSpeed != null ? '${trip.avgSpeed!.toStringAsFixed(0)} km/h' : '—',
              valColor: Colors.white,
            ),
            _buildGaugeCard(
              icon: Icons.timer_outlined,
              title: 'PUNCTUALITY',
              value: trip.punctualityStatus,
              valColor: const Color(0xFF60A5FA),
            ),
            _buildGaugeCard(
              icon: Icons.access_time_rounded,
              title: 'STARTED AT',
              value: trip.startedAt != null ? _formatTime(trip.startedAt!) : '—',
              valColor: Colors.white,
            ),
            _buildGaugeCard(
              icon: Icons.directions_bus_rounded,
              title: 'ASSIGNED BUS',
              value: vehiclePlate,
              valColor: const Color(0xFF60A5FA),
            ),
            _buildGaugeCard(
              icon: Icons.gps_fixed_rounded,
              title: 'GPS STATUS',
              value: (trip.vehicle?.gpsStatus ?? 'CONNECTED').toUpperCase(),
              valColor: const Color(0xFF10B981),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildGaugeCard({
    required IconData icon,
    required String title,
    required String value,
    required Color valColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 18, color: AppColors.textSecondary),
          const SizedBox(height: 4),
          Text(
            title,
            style: const TextStyle(
              color: AppColors.textMuted,
              fontSize: 7.5,
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: TextStyle(
              color: valColor,
              fontSize: 10.5,
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildWaypointTimelineCard(TripItemModel trip, double covDist, int progress) {
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
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: Color(0xFF8B5CF6),
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              const Text(
                'TRIP WAYPOINT TIMELINE',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 11.5,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          const Text(
            'Chronological station checkpoints and voyage status.',
            style: TextStyle(color: AppColors.textSecondary, fontSize: 10.5),
          ),
          const SizedBox(height: 16),

          // Waypoint 1: Origin
          _buildTimelineItem(
            time: trip.startedAt != null ? _formatTime(trip.startedAt!) : '08:00 AM',
            statusBadge: 'Departed',
            badgeBg: const Color(0xFF064E3B).withOpacity(0.3),
            badgeColor: const Color(0xFF34D399),
            title: 'Origin — ${trip.origin}',
            subtitle: 'Trip initiated and passenger transit log enabled.',
            icon: Icons.check_circle_rounded,
            iconColor: const Color(0xFF10B981),
            showLine: true,
          ),

          // Waypoint 2: Mid-way
          _buildTimelineItem(
            time: '$progress% En Route',
            statusBadge: 'Waypoint',
            badgeBg: const Color(0xFF1E212D),
            badgeColor: AppColors.textSecondary,
            title: 'Corridor Segment Tracking',
            subtitle: 'Covered ${covDist.toStringAsFixed(1)} km • Speed: ${trip.currentSpeed?.toStringAsFixed(0) ?? trip.avgSpeed?.toStringAsFixed(0) ?? '35'} km/h',
            icon: trip.status == 'completed' || progress >= 50 ? Icons.check_circle_rounded : Icons.radio_button_checked_rounded,
            iconColor: trip.status == 'completed' || progress >= 50 ? const Color(0xFF10B981) : const Color(0xFF3B82F6),
            showLine: true,
          ),

          // Waypoint 3: Destination
          _buildTimelineItem(
            time: trip.endedAt != null
                ? _formatTime(trip.endedAt!)
                : (trip.eta.isNotEmpty ? trip.eta : 'Scheduled Arrival'),
            statusBadge: trip.status == 'completed' ? 'Arrived & Concluded' : 'Terminal Arrival',
            badgeBg: trip.status == 'completed'
                ? const Color(0xFF064E3B).withOpacity(0.3)
                : const Color(0xFF1E212D),
            badgeColor: trip.status == 'completed' ? const Color(0xFF34D399) : AppColors.textSecondary,
            title: 'Destination — ${trip.destination}',
            subtitle: 'Final corridor destination platform.',
            icon: trip.status == 'completed' ? Icons.check_circle_rounded : Icons.location_on_rounded,
            iconColor: trip.status == 'completed' ? const Color(0xFF10B981) : AppColors.textMuted,
            showLine: false,
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineItem({
    required String time,
    required String statusBadge,
    required Color badgeBg,
    required Color badgeColor,
    required String title,
    required String subtitle,
    required IconData icon,
    required Color iconColor,
    required bool showLine,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Icon(icon, color: iconColor, size: 18),
            if (showLine)
              Container(
                width: 1.5,
                height: 38,
                color: AppColors.cardBorder,
              ),
          ],
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    time,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace',
                    ),
                  ),
                  const SizedBox(width: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                    decoration: BoxDecoration(
                      color: badgeBg,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      statusBadge,
                      style: TextStyle(
                        color: badgeColor,
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 2),
              Text(
                title,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 11.5,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                subtitle,
                style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 10,
                ),
              ),
              if (showLine) const SizedBox(height: 10),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDriverInfoCard(TripDriverInfo? driver) {
    final driverName = driver?.name ?? 'No Driver Assigned';
    final initial = driverName.isNotEmpty ? driverName[0].toUpperCase() : 'D';

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
          const Text(
            'ASSIGNED DRIVER',
            style: TextStyle(
              color: Colors.white,
              fontSize: 11.5,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              CircleAvatar(
                radius: 20,
                backgroundColor: const Color(0xFF1E3A8A).withOpacity(0.5),
                child: Text(
                  initial,
                  style: const TextStyle(
                    color: Color(0xFF60A5FA),
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      driverName,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      driver?.phone ?? 'No phone recorded',
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                    ),
                    Text(
                      driver?.badgeId.isNotEmpty == true ? driver!.badgeId : 'DL Validated',
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
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: controller.callDriver,
              icon: const Icon(Icons.call_rounded, size: 15, color: Colors.white),
              label: Text(
                'Call Driver (${driverName.split(' ')[0]})',
                style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1F2937),
                elevation: 0,
                padding: const EdgeInsets.symmetric(vertical: 10),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                  side: const BorderSide(color: AppColors.cardBorder),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVehicleTelematicsCard(TripItemModel trip, String vehiclePlate) {
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
          const Text(
            'VEHICLE TELEMATICS',
            style: TextStyle(
              color: Colors.white,
              fontSize: 11.5,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 12),
          _buildTelematicsRow('Vehicle Number:', vehiclePlate, isMono: true, isHighlight: true),
          _buildTelematicsRow('Vehicle Type:', trip.vehicle?.vehicleType ?? 'Transit Bus'),
          _buildTelematicsRow('Model:', trip.vehicle?.model ?? 'Commercial Transit'),
          _buildTelematicsRow('GPS Tracker:', trip.vehicle?.gpsDeviceId ?? 'Active Onboard', isMono: true),
          _buildTelematicsRow('Fuel / Propelled:', trip.vehicle?.fuelType ?? 'Electric / Diesel'),
          _buildTelematicsRow(
            'Ignition State:',
            trip.status == 'completed' ? 'OFF' : 'ON',
            valColor: trip.status == 'completed' ? AppColors.textMuted : const Color(0xFFF59E0B),
          ),
        ],
      ),
    );
  }

  Widget _buildTelematicsRow(
    String label,
    String value, {
    bool isMono = false,
    bool isHighlight = false,
    Color? valColor,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
          ),
          Text(
            value,
            style: TextStyle(
              color: valColor ?? (isHighlight ? const Color(0xFF60A5FA) : Colors.white),
              fontSize: 11,
              fontWeight: FontWeight.bold,
              fontFamily: isMono ? 'monospace' : null,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomActionBar(TripItemModel trip) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          // Complete Trip button or Concluded Badge
          if (trip.status != 'completed')
            Obx(() => SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: controller.isEnding.value ? null : controller.completeTrip,
                    icon: controller.isEnding.value
                        ? const SizedBox(
                            width: 14,
                            height: 14,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Icon(Icons.check_circle_outline_rounded, size: 16, color: Colors.white),
                    label: Text(
                      controller.isEnding.value ? 'Completing Voyage...' : 'Complete Trip & Log Voyage',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2563EB),
                      disabledBackgroundColor: const Color(0xFF1D4ED8).withOpacity(0.5),
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ))
          else
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(
                color: const Color(0xFF064E3B).withOpacity(0.3),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF059669).withOpacity(0.5)),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.check_circle_rounded, color: Color(0xFF34D399), size: 16),
                  SizedBox(width: 8),
                  Text(
                    'Trip Concluded & Archived',
                    style: TextStyle(
                      color: Color(0xFF34D399),
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          const SizedBox(height: 10),

          // Return to Trips Button
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: controller.returnToTrips,
              icon: const Icon(Icons.arrow_back_rounded, size: 15, color: Colors.white),
              label: const Text(
                'View Full Trip History',
                style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
              ),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.cardBorder),
                backgroundColor: const Color(0xFF141824),
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
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
