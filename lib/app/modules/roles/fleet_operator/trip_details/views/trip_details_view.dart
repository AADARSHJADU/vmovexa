import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/trip_details_controller.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../widgets/custom_button.dart';
import '../../../../../theme/app_colors.dart';

class TripDetailsView extends GetView<TripDetailsController> {
  const TripDetailsView({super.key});

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
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const CustomBackButton(),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'trip_details_title'.tr,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
                  const SizedBox(width: 40),
                ],
              ),
            ),

            Expanded(
              child: Obx(() {
                if (controller.isLoading.value && controller.trip.value == null) {
                  return const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CircularProgressIndicator(
                          color: Color(0xFF3B82F6),
                          strokeWidth: 3,
                        ),
                        SizedBox(height: 16),
                        Text(
                          'Loading trip telemetry...',
                          style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                        ),
                      ],
                    ),
                  );
                }

                if (!controller.isLoading.value &&
                    controller.trip.value == null &&
                    controller.tripId == '—') {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.info_outline_rounded, color: AppColors.textMuted, size: 48),
                          const SizedBox(height: 14),
                          const Text(
                            'Trip Details Not Found',
                            style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'The requested trip could not be loaded or is unavailable.',
                            textAlign: TextAlign.center,
                            style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
                          ),
                          const SizedBox(height: 20),
                          CustomButton(
                            text: 'Back',
                            width: 140,
                            height: 42,
                            onTap: () => Get.back(),
                          ),
                        ],
                      ),
                    ),
                  );
                }

                return SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Top Split Card (Info & Mini Map)
                      _buildTopSplitCard(),
                      const SizedBox(height: 24),

                      // Route Summary Section
                      _buildSectionHeader('route_overview'.tr),
                      const SizedBox(height: 14),
                      _buildRouteSummaryPanel(),
                      const SizedBox(height: 24),

                      // Live Statistics Section
                      _buildSectionHeader('live_telematics'.tr),
                      const SizedBox(height: 14),
                      _buildLiveStatsGrid(),
                      const SizedBox(height: 24),

                      // Columns: Timeline & Driver/Vehicle specs
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Left Column: Waypoint Timeline
                          Expanded(
                            flex: 11,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildSubHeader('trip_details_title'.tr),
                                const SizedBox(height: 14),
                                _buildTimelinePanel(),
                              ],
                            ),
                          ),
                          const SizedBox(width: 16),
                          // Right Column: Driver & Vehicle specs
                          Expanded(
                            flex: 12,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildSubHeader('driver_information'.tr),
                                const SizedBox(height: 12),
                                _buildDriverInfoCard(),
                                const SizedBox(height: 20),
                                _buildSubHeader('vehicle_information'.tr),
                                const SizedBox(height: 12),
                                _buildVehicleInfoCard(),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 28),

                      // Quick Actions Section
                      _buildSectionHeader('quick_actions'.tr),
                      const SizedBox(height: 14),
                      Row(
                        children: [
                          Expanded(
                            child: _buildQuickActionItem(
                              'call'.tr,
                              Icons.call_outlined,
                              const Color(0xFF10B981),
                              controller.callDriver,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: _buildQuickActionItem(
                              'navigation'.tr,
                              Icons.navigation_outlined,
                              const Color(0xFF3B82F6),
                              controller.navigate,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: _buildQuickActionItem(
                              'alert'.tr,
                              Icons.warning_amber_rounded,
                              Colors.orangeAccent,
                              controller.sendAlert,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: _buildQuickActionItem(
                              'export_pdf_btn'.tr,
                              Icons.download_rounded,
                              const Color(0xFF8B5CF6),
                              controller.downloadReport,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 36),

                      // Complete Trip Action Button
                      if (controller.status == 'completed')
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          decoration: BoxDecoration(
                            color: const Color(0xFF10B981).withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: const Color(0xFF10B981).withValues(alpha: 0.4),
                              width: 1.2,
                            ),
                          ),
                          child: const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 20),
                              SizedBox(width: 8),
                              Text(
                                'Trip Concluded & Archived',
                                style: TextStyle(
                                  color: Color(0xFF10B981),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                ),
                              ),
                            ],
                          ),
                        )
                      else
                        CustomButton(
                          text: controller.isEnding.value
                              ? 'Completing Voyage...'
                              : 'Complete Trip & Log Voyage',
                          isLoading: controller.isEnding.value,
                          onTap: controller.completeTrip,
                          isGradient: true,
                        ),
                      const SizedBox(height: 24),
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

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: const TextStyle(
        color: Colors.white,
        fontSize: 15,
        fontWeight: FontWeight.bold,
      ),
    );
  }

  Widget _buildSubHeader(String title) {
    return Text(
      title,
      style: const TextStyle(
        color: Colors.white,
        fontSize: 13,
        fontWeight: FontWeight.bold,
      ),
    );
  }

  Widget _buildTopSplitCard() {
    Color statusColor;
    String statusLabel;

    switch (controller.status) {
      case 'in_progress':
      case 'active':
        statusColor = const Color(0xFF10B981);
        statusLabel = 'active'.tr;
        break;
      case 'completed':
        statusColor = const Color(0xFF3B82F6);
        statusLabel = 'completed'.tr;
        break;
      default:
        statusColor = const Color(0xFFF59E0B);
        statusLabel = controller.status.toUpperCase();
    }

    return Container(
      height: 140,
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
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: statusColor.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: statusColor.withValues(alpha: 0.3), width: 1),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 6,
                          height: 6,
                          decoration: BoxDecoration(
                            color: statusColor,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 5),
                        Text(
                          statusLabel,
                          style: TextStyle(
                            color: statusColor,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Trip ID & Copy
                  InkWell(
                    onTap: controller.copyTripId,
                    borderRadius: BorderRadius.circular(6),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Flexible(
                          child: Text(
                            'Trip ID: ${controller.tripId}',
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
                        Icon(
                          controller.copied.value ? Icons.check_rounded : Icons.copy_rounded,
                          color: controller.copied.value ? const Color(0xFF10B981) : AppColors.textMuted,
                          size: 14,
                        ),
                      ],
                    ),
                  ),

                  // Assigned Bus
                  Row(
                    children: [
                      const Icon(
                        Icons.directions_bus_rounded,
                        color: Color(0xFF3B82F6),
                        size: 15,
                      ),
                      const SizedBox(width: 8),
                      Flexible(
                        child: Text(
                          controller.vehicleName,
                          style: const TextStyle(
                            color: AppColors.textSecondary,
                            fontSize: 12,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),

                  // Driver Name & Call
                  Row(
                    children: [
                      const Icon(
                        Icons.person_outline_rounded,
                        color: Color(0xFF10B981),
                        size: 15,
                      ),
                      const SizedBox(width: 8),
                      Flexible(
                        child: Text(
                          controller.driverName,
                          style: const TextStyle(
                            color: AppColors.textSecondary,
                            fontSize: 12,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (controller.driverPhone != '—') ...[
                        const SizedBox(width: 8),
                        GestureDetector(
                          onTap: controller.callDriver,
                          child: const Icon(
                            Icons.phone_rounded,
                            color: Color(0xFF10B981),
                            size: 13,
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Divider vertical line
          Container(width: 1.2, height: double.infinity, color: AppColors.cardBorder),

          // Right Mini Map View Layout representation
          Expanded(
            flex: 11,
            child: Container(
              decoration: const BoxDecoration(
                borderRadius: BorderRadius.only(
                  topRight: Radius.circular(16),
                  bottomRight: Radius.circular(16),
                ),
                color: Color(0xFF0F172A),
              ),
              child: CustomPaint(
                painter: MiniMapPainter(),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRouteSummaryPanel() {
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
              // Route path + origin/destination details
              Expanded(
                child: IntrinsicHeight(
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Vertical path stepper
                      SizedBox(
                        width: 10,
                        child: Column(
                          children: [
                            Container(
                              width: 10,
                              height: 10,
                              decoration: const BoxDecoration(
                                color: Color(0xFF8B5CF6),
                                shape: BoxShape.circle,
                              ),
                            ),
                            Expanded(
                              child: Container(
                                width: 1.5,
                                color: AppColors.cardBorder,
                              ),
                            ),
                            const Icon(
                              Icons.location_on_rounded,
                              color: Colors.redAccent,
                              size: 18,
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(width: 14),

                      // Origin and destination details
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'origin_station_name'.tr,
                              style: const TextStyle(
                                color: AppColors.textMuted,
                                fontSize: 9,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              controller.origin,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              controller.originTime,
                              style: const TextStyle(
                                color: AppColors.textSecondary,
                                fontSize: 10,
                              ),
                            ),

                            const SizedBox(height: 16),

                            Text(
                              'dest_terminal_req'.tr.replaceAll('*', '').trim(),
                              style: const TextStyle(
                                color: AppColors.textMuted,
                                fontSize: 9,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              controller.destination,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              controller.destinationTime,
                              style: const TextStyle(
                                color: AppColors.textSecondary,
                                fontSize: 10,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(width: 10),

              // Route statistics
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildRouteStatText(
                    controller.totalDistanceStr,
                    'total_distance'.tr,
                  ),
                  const SizedBox(height: 12),
                  _buildRouteStatText(
                    controller.coveredDistanceStr,
                    'total_distance'.tr,
                    color: const Color(0xFF3B82F6),
                  ),
                  const SizedBox(height: 12),
                  _buildRouteStatText(
                    controller.remainingDistanceStr,
                    'total_distance'.tr,
                    color: Colors.amber,
                  ),
                  const SizedBox(height: 12),
                  _buildRouteStatText(
                    controller.etaStr,
                    'duration'.tr,
                    color: const Color(0xFF10B981),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Progress Bar
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Progress: ${controller.progressPercent}% Completed',
                    style: const TextStyle(color: AppColors.textSecondary, fontSize: 10),
                  ),
                  Text(
                    '${controller.coveredDistance.toStringAsFixed(1)} km of ${controller.totalDistance > 0 ? controller.totalDistance.toStringAsFixed(1) : '—'} km',
                    style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: LinearProgressIndicator(
                  value: (controller.progressPercent / 100).clamp(0.0, 1.0),
                  minHeight: 6,
                  backgroundColor: const Color(0xFF1E293B),
                  valueColor: AlwaysStoppedAnimation<Color>(
                    controller.status == 'completed'
                        ? const Color(0xFF10B981)
                        : const Color(0xFF3B82F6),
                  ),
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
        Text(value, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.bold)),
        Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 9)),
      ],
    );
  }

  Widget _buildLiveStatsGrid() {
    return GridView.count(
      crossAxisCount: 3,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 10,
      crossAxisSpacing: 10,
      childAspectRatio: 1.25,
      children: [
        _buildStatCounter(
          controller.currentSpeedStr,
          'speed'.tr,
          Icons.speed_rounded,
          const Color(0xFF3B82F6),
        ),
        _buildStatCounter(
          controller.avgSpeedStr,
          'average_speed'.tr,
          Icons.bar_chart_rounded,
          const Color(0xFF10B981),
        ),
        _buildStatCounter(
          controller.punctualityStatus,
          'punctuality'.tr,
          Icons.schedule_rounded,
          Colors.orangeAccent,
        ),
        _buildStatCounter(
          controller.originTime,
          'start_time'.tr,
          Icons.access_time_rounded,
          Colors.amber,
        ),
        _buildStatCounter(
          controller.vehicleName,
          'vehicle'.tr,
          Icons.directions_bus_rounded,
          const Color(0xFF6366F1),
        ),
        _buildStatCounter(
          controller.gpsStatus,
          'gps'.tr,
          Icons.gps_fixed_rounded,
          const Color(0xFF8B5CF6),
        ),
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
                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
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

  // Dynamic 3-stage waypoint timeline derived from actual trip status & telemetry
  Widget _buildTimelinePanel() {
    final isCompleted = controller.status == 'completed';
    final isInProgress = controller.status == 'in_progress' || controller.status == 'active';

    final originSubtitle = controller.origin != '—' ? controller.origin : 'Dispatch Terminal';
    final destSubtitle = controller.destination != '—' ? controller.destination : 'Final Depot';

    final midSubtitle = controller.coveredDistance > 0
        ? 'Covered ${controller.coveredDistance.toStringAsFixed(1)} km • Speed: ${controller.currentSpeedStr}'
        : 'Live corridor telemetry';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          // Waypoint 1: Origin
          _buildTimelineStep(
            controller.originTime,
            'Trip Initiated',
            originSubtitle,
            true,
            isFirst: true,
            isPassed: isInProgress || isCompleted,
          ),
          // Waypoint 2: Mid-way Status
          _buildTimelineStep(
            '${controller.progressPercent}% En Route',
            'Corridor Checkpoint',
            midSubtitle,
            true,
            isActive: isInProgress,
            isPassed: isCompleted || controller.progressPercent >= 50,
          ),
          // Waypoint 3: Destination
          _buildTimelineStep(
            controller.destinationTime,
            isCompleted ? 'Arrived & Concluded' : 'Terminal Arrival',
            destSubtitle,
            false,
            isLast: true,
            isPassed: isCompleted,
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineStep(
    String time,
    String title,
    String subtitle,
    bool showLine, {
    bool isFirst = false,
    bool isLast = false,
    bool isActive = false,
    bool isPassed = false,
  }) {
    Color pointColor;
    if (isPassed) {
      pointColor = const Color(0xFF10B981); // Emerald
    } else if (isActive) {
      pointColor = const Color(0xFF3B82F6); // Blue pulse
    } else if (isLast) {
      pointColor = Colors.redAccent;
    } else {
      pointColor = AppColors.textMuted;
    }

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                color: pointColor,
                shape: BoxShape.circle,
                boxShadow: isActive
                    ? [
                        BoxShadow(
                          color: const Color(0xFF3B82F6).withValues(alpha: 0.5),
                          blurRadius: 6,
                          spreadRadius: 2,
                        )
                      ]
                    : null,
              ),
              child: isPassed
                  ? const Icon(Icons.check_rounded, color: Colors.white, size: 8)
                  : null,
            ),
            if (showLine)
              Container(
                width: 1.5,
                height: 52,
                color: isPassed ? const Color(0xFF10B981) : AppColors.cardBorder,
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
                  Flexible(
                    child: Text(
                      title,
                      style: TextStyle(
                        color: isActive
                            ? const Color(0xFF3B82F6)
                            : (isPassed ? const Color(0xFF10B981) : Colors.white),
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Flexible(
                    child: Text(
                      time,
                      style: const TextStyle(
                        color: AppColors.textMuted,
                        fontSize: 10,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      textAlign: TextAlign.end,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 10,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDriverInfoCard() {
    final initial = controller.driverName.isNotEmpty && controller.driverName != 'No Driver Assigned'
        ? controller.driverName[0].toUpperCase()
        : 'D';

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: const BoxDecoration(
              color: Color(0xFF8B5CF6),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                initial,
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  controller.driverName,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                InkWell(
                  onTap: controller.callDriver,
                  child: Row(
                    children: [
                      const Icon(Icons.phone_rounded, color: Color(0xFF10B981), size: 11),
                      const SizedBox(width: 4),
                      Flexible(
                        child: Text(
                          controller.driverPhone,
                          style: const TextStyle(
                            color: AppColors.textSecondary,
                            fontSize: 10,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  controller.driverLicense,
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

  Widget _buildVehicleInfoCard() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          _buildInfoTextRow('vehicle'.tr, controller.vehicleName),
          _buildInfoTextRow('fleet'.tr, controller.fleetName),
          _buildInfoTextRow('classification_label'.tr, controller.vehicleModel),
          _buildInfoTextRow('gps'.tr, controller.gpsCode),
          _buildInfoTextRow('fuel_battery'.tr, controller.batteryFuel, suffixColor: const Color(0xFF10B981)),
          _buildInfoTextRow(
            'status'.tr,
            controller.status == 'completed' ? 'OFF' : 'ON',
            suffixColor: controller.status == 'completed' ? Colors.redAccent : const Color(0xFF10B981),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoTextRow(
    String label,
    String value, {
    Color suffixColor = Colors.white,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Expanded(
            child: Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                color: AppColors.textMuted,
                fontSize: 10,
              ),
            ),
          ),
          const SizedBox(width: 8),
          Flexible(
            child: Text(
              value,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.end,
              style: TextStyle(
                color: suffixColor,
                fontSize: 10,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionItem(String title, IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 60,
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 16),
            const SizedBox(height: 6),
            Text(
              title,
              style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class MiniMapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final linePaint = Paint()
      ..color = const Color(0xFF1E293B)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    canvas.drawLine(Offset(0, size.height * 0.3), Offset(size.width, size.height * 0.35), linePaint);
    canvas.drawLine(Offset(0, size.height * 0.7), Offset(size.width, size.height * 0.65), linePaint);
    canvas.drawLine(Offset(size.width * 0.5, 0), Offset(size.width * 0.45, size.height), linePaint);

    final routePaint = Paint()
      ..color = const Color(0xFF8B5CF6)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5
      ..strokeCap = StrokeCap.round;

    final routePath = Path()
      ..moveTo(size.width * 0.1, size.height * 0.8)
      ..quadraticBezierTo(size.width * 0.4, size.height * 0.7, size.width * 0.5, size.height * 0.4)
      ..lineTo(size.width * 0.9, size.height * 0.2);

    canvas.drawPath(routePath, routePaint);

    // Points
    canvas.drawCircle(Offset(size.width * 0.1, size.height * 0.8), 4, Paint()..color = const Color(0xFF8B5CF6));
    canvas.drawCircle(Offset(size.width * 0.9, size.height * 0.2), 5, Paint()..color = Colors.redAccent);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
