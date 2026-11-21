import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:flutter_map/flutter_map.dart';
import '../controllers/live_tracking_controller.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../widgets/custom_button.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../data/models/fleet_models.dart';

class LiveTrackingView extends GetView<LiveTrackingController> {
  const LiveTrackingView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Stack(
          children: [
            // 1. Real Interactive Map View (Google Maps Raster / Satellite / Dark)
            Positioned.fill(
              child: _buildRealMapView(),
            ),

            // 2. Top Header Bar Overlay
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                color: AppColors.background.withValues(alpha: 0.92),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const CustomBackButton(),
                    Column(
                      children: [
                        Text(
                          'live_tracking'.tr,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              width: 6,
                              height: 6,
                              decoration: const BoxDecoration(
                                color: Color(0xFF10B981),
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              'live'.tr,
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
                    Row(
                      children: [
                        IconButton(
                          icon: const Icon(Icons.search_rounded, color: Colors.white, size: 24),
                          tooltip: 'Search & Switch Vehicle',
                          onPressed: () => _showVehiclePickerSheet(context),
                        ),
                        IconButton(
                          icon: const Icon(Icons.swap_horiz_rounded, color: Colors.white, size: 24),
                          tooltip: 'Select Vehicle',
                          onPressed: () => _showVehiclePickerSheet(context),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            // 3. Floating Top Left Vehicle Specs Card
            Positioned(
              top: 70,
              left: 16,
              child: _buildFloatingVehicleCard(context),
            ),

            // 4. Map Style Selector Toggle Pill (Top-Right)
            Positioned(
              top: 70,
              right: 16,
              child: _buildMapStyleToggle(),
            ),

            // 5. Right Map Controls (+ / - / Target / Route)
            Positioned(
              top: 130,
              right: 16,
              child: _buildMapControlsPanel(),
            ),

            // 6. Bottom Drawer Panel (Slide up with dynamic stats & trip details)
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: _buildBottomDrawer(context),
            ),

            // 7. Loading / Switching Indicator
            Positioned(
              top: 130,
              left: 0,
              right: 0,
              child: Obx(() {
                if (!controller.isLoading.value && !controller.isSwitchingVehicle.value) {
                  return const SizedBox.shrink();
                }
                return Center(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A).withValues(alpha: 0.95),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFF38BDF8).withValues(alpha: 0.4)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        SizedBox(
                          width: 14,
                          height: 14,
                          child: CircularProgressIndicator(color: Color(0xFF38BDF8), strokeWidth: 2),
                        ),
                        SizedBox(width: 10),
                        Text(
                          'Connecting Realtime GPS Stream...',
                          style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                );
              }),
            ),
          ],
        ),
      ),
    );
  }

  // ==================== REAL INTERACTIVE MAP ====================

  Widget _buildRealMapView() {
    return Obx(() {
      final style = controller.mapStyle.value;
      String tileUrl;
      switch (style) {
        case 'satellite':
          tileUrl = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
          break;
        case 'dark':
          tileUrl = 'https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png';
          break;
        case 'roadmap':
        default:
          tileUrl = 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
          break;
      }

      final center = controller.currentPosition.value;
      final points = controller.routePoints;
      final start = controller.startPoint.value;
      final end = controller.endPoint.value;

      return FlutterMap(
        mapController: controller.mapController,
        options: MapOptions(
          initialCenter: center,
          initialZoom: 15.0,
          minZoom: 3.0,
          maxZoom: 19.0,
          onPositionChanged: (pos, hasGesture) {
            if (hasGesture) {
              controller.followVehicle = false;
            }
          },
        ),
        children: [
          // Google Maps Tile Layer
          TileLayer(
            urlTemplate: tileUrl,
            userAgentPackageName: 'com.vmovexa.app',
            maxZoom: 20,
          ),

          // Route Polyline Layer
          if (points.isNotEmpty)
            PolylineLayer(
              polylines: [
                // Outer glow shadow
                Polyline(
                  points: points,
                  color: const Color(0xFF2563EB).withValues(alpha: 0.35),
                  strokeWidth: 9.0,
                  strokeCap: StrokeCap.round,
                  strokeJoin: StrokeJoin.round,
                ),
                // Crisp vibrant blue polyline
                Polyline(
                  points: points,
                  color: const Color(0xFF3B82F6),
                  strokeWidth: 4.5,
                  strokeCap: StrokeCap.round,
                  strokeJoin: StrokeJoin.round,
                ),
              ],
            ),

          // Markers Layer: Start, End & Vehicle Realtime Position
          MarkerLayer(
            markers: [
              // Origin Marker (Green 'A')
              if (start != null)
                Marker(
                  point: start,
                  width: 36,
                  height: 36,
                  child: Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 2),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.4),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: const Center(
                      child: Text(
                        'A',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                    ),
                  ),
                ),

              // Destination Marker (Red 'B')
              if (end != null)
                Marker(
                  point: end,
                  width: 36,
                  height: 36,
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.redAccent,
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 2),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.4),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: const Center(
                      child: Text(
                        'B',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                    ),
                  ),
                ),

              // Live Moving Vehicle Marker with Heading & Pulsing Ring
              Marker(
                point: center,
                width: 58,
                height: 58,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    // Outer Pulsing Telemetry Glow
                    Container(
                      width: 54,
                      height: 54,
                      decoration: BoxDecoration(
                        color: const Color(0xFF38BDF8).withValues(alpha: 0.25),
                        shape: BoxShape.circle,
                      ),
                    ),
                    // Inner Circle Ring
                    Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        shape: BoxShape.circle,
                        border: Border.all(color: const Color(0xFF38BDF8), width: 2.5),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF38BDF8).withValues(alpha: 0.5),
                            blurRadius: 8,
                            spreadRadius: 1,
                          ),
                        ],
                      ),
                      child: Center(
                        child: Transform.rotate(
                          angle: (controller.heading.value * 3.1415926535 / 180),
                          child: const Icon(
                            Icons.navigation_rounded,
                            color: Color(0xFF38BDF8),
                            size: 24,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      );
    });
  }

  // ==================== MAP STYLE TOGGLE ====================

  Widget _buildMapStyleToggle() {
    return Obx(() {
      final current = controller.mapStyle.value;
      return Container(
        padding: const EdgeInsets.all(3),
        decoration: BoxDecoration(
          color: const Color(0xFF0F172A).withValues(alpha: 0.92),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.3),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildStyleButton('Map', 'roadmap', current == 'roadmap'),
            _buildStyleButton('Sat', 'satellite', current == 'satellite'),
            _buildStyleButton('Dark', 'dark', current == 'dark'),
          ],
        ),
      );
    });
  }

  Widget _buildStyleButton(String label, String style, bool isSelected) {
    return GestureDetector(
      onTap: () => controller.setMapStyle(style),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF2563EB) : Colors.transparent,
          borderRadius: BorderRadius.circular(7),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : const Color(0xFF94A3B8),
            fontSize: 10,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
          ),
        ),
      ),
    );
  }

  // ==================== FLOATING VEHICLE CARD ====================

  Widget _buildFloatingVehicleCard(BuildContext context) {
    return Obx(() {
      return GestureDetector(
        onTap: () => _showVehiclePickerSheet(context),
        child: Container(
          width: 205,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.background.withValues(alpha: 0.95),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.cardBorder, width: 1.2),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.35),
                blurRadius: 8,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Row(
            children: [
              // Bus image panel thumbnail representation
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: const Color(0xFF3B82F6).withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(6.0),
                  child: Image.asset(
                    'assets/images/bus1.png',
                    errorBuilder: (_, _, _) => const Icon(Icons.directions_bus_rounded, color: Color(0xFF38BDF8), size: 24),
                  ),
                ),
              ),
              const SizedBox(width: 10),

              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            controller.vehicleName.value.isEmpty ? 'Loading...' : controller.vehicleName.value,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(width: 4),
                        Container(
                          width: 6,
                          height: 6,
                          decoration: BoxDecoration(
                            color: controller.status.value == 'ON_ROUTE' || controller.status.value == 'ACTIVE'
                                ? const Color(0xFF10B981)
                                : Colors.amber,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 2),

                    Text(
                      controller.modelName.value.isEmpty ? 'Fleet vehicle' : controller.modelName.value,
                      style: const TextStyle(
                        color: AppColors.textMuted,
                        fontSize: 10,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),

                    const SizedBox(height: 4),

                    Row(
                      children: [
                        Expanded(
                          child: Row(
                            children: [
                              SvgPicture.asset(
                                'assets/icons/speed_m.svg',
                                width: 10,
                                height: 10,
                                errorBuilder: (_, _, _) => const Icon(Icons.speed, color: Colors.white, size: 10),
                              ),
                              const SizedBox(width: 3),
                              Flexible(
                                child: Text(
                                  '${controller.speed.value} km/h',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 9.5,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        GestureDetector(
                          onTap: controller.callDriver,
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              color: const Color(0xFF10B981).withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Icon(Icons.phone, color: Color(0xFF10B981), size: 12),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
    });
  }

  // ==================== MAP CONTROLS PANEL ====================

  Widget _buildMapControlsPanel() {
    return Column(
      children: [
        // Recenter to live vehicle
        GestureDetector(
          onTap: controller.recenterMap,
          child: Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: AppColors.background.withValues(alpha: 0.92),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.cardBorder, width: 1.2),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.3),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: const Icon(Icons.my_location_rounded, color: Color(0xFF38BDF8), size: 20),
          ),
        ),
        const SizedBox(height: 10),

        // Fit entire route overview
        GestureDetector(
          onTap: controller.fitRouteBounds,
          child: Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: AppColors.background.withValues(alpha: 0.92),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.cardBorder, width: 1.2),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.3),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: const Icon(Icons.alt_route_rounded, color: Colors.white, size: 20),
          ),
        ),
        const SizedBox(height: 10),

        // Zoom In / Out Panel
        Container(
          decoration: BoxDecoration(
            color: AppColors.background.withValues(alpha: 0.92),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColors.cardBorder, width: 1.2),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.3),
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            children: [
              GestureDetector(
                onTap: controller.zoomIn,
                child: Container(
                  width: 42,
                  height: 42,
                  alignment: Alignment.center,
                  child: const Icon(Icons.add, color: Colors.white, size: 20),
                ),
              ),
              Container(width: 24, height: 1, color: AppColors.cardBorder),
              GestureDetector(
                onTap: controller.zoomOut,
                child: Container(
                  width: 42,
                  height: 42,
                  alignment: Alignment.center,
                  child: const Icon(Icons.remove, color: Colors.white, size: 20),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ==================== BOTTOM DRAWER PANEL ====================

  Widget _buildBottomDrawer(BuildContext context) {
    return Container(
      width: double.infinity,
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.52,
      ),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        border: const Border(top: BorderSide(color: AppColors.cardBorder, width: 1.5)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.4),
            blurRadius: 12,
            offset: const Offset(0, -3),
          ),
        ],
      ),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
          // Drag handle
          Center(
            child: Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.cardBorder,
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),
          const SizedBox(height: 14),

          // Current Trip panel header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.alt_route_rounded, color: Color(0xFF6366F1), size: 18),
                  const SizedBox(width: 8),
                  Text(
                    'current_trip'.tr,
                    style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              OutlinedButton.icon(
                onPressed: controller.fitRouteBounds,
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.cardBorder),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                ),
                icon: const Icon(Icons.map_outlined, color: Colors.white, size: 13),
                label: Text('view_route'.tr, style: const TextStyle(color: Colors.white, fontSize: 11)),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Dynamic Trip Path Stepper
          Obx(() {
            return Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.background,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.cardBorder, width: 1),
                    ),
                    child: Row(
                      children: [
                        // Vertical Dot Timeline indicator
                        Column(
                          children: [
                            Container(
                              width: 8,
                              height: 8,
                              decoration: const BoxDecoration(color: Color(0xFF3B82F6), shape: BoxShape.circle),
                            ),
                            Container(width: 1.5, height: 20, color: AppColors.cardBorder),
                            Container(
                              width: 8,
                              height: 8,
                              decoration: const BoxDecoration(color: Colors.redAccent, shape: BoxShape.circle),
                            ),
                          ],
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                controller.sourceLocation.value.isEmpty
                                    ? 'Depot Origin'
                                    : controller.sourceLocation.value,
                                style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 12),
                              Text(
                                controller.destinationLocation.value.isEmpty
                                    ? 'Destination Station'
                                    : controller.destinationLocation.value,
                                style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                // Remaining specs details
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${controller.distanceRemainingKm.value > 0 ? controller.distanceRemainingKm.value.toStringAsFixed(1) : "0.0"} km',
                      style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                    Text('distance_remaining'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 9)),
                    const SizedBox(height: 8),
                    Text(
                      '${controller.etaMinutes.value > 0 ? controller.etaMinutes.value : "15"} mins',
                      style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                    Text('eta_label'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 9)),
                  ],
                ),
              ],
            );
          }),
          const SizedBox(height: 10),

          // Last GPS update tag line
          Obx(() {
            return Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Last GPS ping: ${controller.lastUpdated.value}',
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                ),
                IconButton(
                  icon: const Icon(Icons.sync_rounded, color: Color(0xFF10B981), size: 16),
                  tooltip: 'Refresh Telemetry',
                  onPressed: controller.initLiveTracking,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            );
          }),
          const SizedBox(height: 14),

          // Realtime Stats Row: Speed, Battery, Signal, Ignition
          Obx(() {
            return Row(
              children: [
                Expanded(
                  child: _buildRealtimeStatCard(
                    '${controller.speed.value} km/h',
                    'current_speed_stat'.tr,
                    const Icon(Icons.speed, color: Color(0xFF38BDF8), size: 18),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildRealtimeStatCard(
                    '${controller.battery.value}%',
                    'battery_stat'.tr,
                    Icon(
                      Icons.battery_charging_full_rounded,
                      color: controller.battery.value > 20 ? const Color(0xFF10B981) : Colors.redAccent,
                      size: 18,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildRealtimeStatCard(
                    controller.gpsSignal.value,
                    'gps_signal_stat'.tr,
                    const Icon(Icons.cell_tower_rounded, color: Color(0xFF6366F1), size: 18),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildRealtimeStatCard(
                    controller.ignition.value,
                    'ignition_status_stat'.tr,
                    Icon(
                      Icons.power_settings_new_rounded,
                      color: controller.ignition.value == 'ON' ? const Color(0xFF10B981) : Colors.grey,
                      size: 18,
                    ),
                  ),
                ),
              ],
            );
          }),
          const SizedBox(height: 18),

          // Quick actions title
          Row(
            children: [
              const Icon(Icons.bolt_rounded, color: Colors.purpleAccent, size: 16),
              const SizedBox(width: 6),
              Text(
                'quick_actions_title'.tr,
                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Quick Actions Grid Row
          Row(
            children: [
              Expanded(
                child: _buildQuickActionItem(
                  'call_driver_action'.tr,
                  const Icon(Icons.phone_in_talk_rounded, color: Color(0xFF10B981), size: 18),
                  controller.callDriver,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildQuickActionItem(
                  'navigate_btn'.tr,
                  const Icon(Icons.navigation_rounded, color: Color(0xFF38BDF8), size: 18),
                  controller.launchNavigation,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildQuickActionItem(
                  'trip_history_btn'.tr,
                  const Icon(Icons.history_rounded, color: Color(0xFF6366F1), size: 18),
                  controller.goToTripHistory,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildQuickActionItem(
                  'emergency_alert_action'.tr,
                  const Icon(Icons.warning_amber_rounded, color: Colors.redAccent, size: 18),
                  controller.reportEmergency,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Footer actions: View details, End tracking
          Row(
            children: [
              Expanded(
                child: CustomButton(
                  text: 'view_trip_details_btn'.tr,
                  isGradient: true,
                  onTap: controller.goToTripDetails,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: OutlinedButton(
                  onPressed: controller.endTracking,
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Colors.redAccent),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.stop_rounded, color: Colors.redAccent, size: 18),
                      const SizedBox(width: 6),
                      Text(
                        'end_tracking_btn'.tr,
                        style: const TextStyle(color: Colors.redAccent, fontSize: 13, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
        ],
      ),
    ),
  );
}

  Widget _buildRealtimeStatCard(String value, String label, Widget icon) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.cardBorder, width: 1),
      ),
      child: Column(
        children: [
          icon,
          const SizedBox(height: 6),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 11,
              fontWeight: FontWeight.bold,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(
              color: AppColors.textMuted,
              fontSize: 8,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionItem(String title, Widget icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 65,
        decoration: BoxDecoration(
          color: AppColors.background,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.cardBorder, width: 1),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            icon,
            const SizedBox(height: 6),
            Text(
              title,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 8,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  // ==================== VEHICLE SWITCHER MODAL SHEET ====================

  void _showVehiclePickerSheet(BuildContext context) {
    final searchCtrl = TextEditingController();
    final RxList<VehicleItemModel> filtered = RxList<VehicleItemModel>(controller.vehiclesList);

    Get.bottomSheet(
      Container(
        height: MediaQuery.of(context).size.height * 0.65,
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
        decoration: const BoxDecoration(
          color: Color(0xFF0F172A),
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          border: Border(top: BorderSide(color: Color(0xFF334155), width: 1.5)),
        ),
        child: Column(
          children: [
            // Handle
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: const Color(0xFF475569),
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            const SizedBox(height: 14),

            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.directions_bus_rounded, color: Color(0xFF38BDF8), size: 20),
                    const SizedBox(width: 8),
                    const Text(
                      'Fleet Vehicle Radar',
                      style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                Obx(() => Text(
                      '${filtered.length} Vehicles',
                      style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                    )),
              ],
            ),
            const SizedBox(height: 12),

            // Search Input
            TextField(
              controller: searchCtrl,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              onChanged: (q) {
                if (q.trim().isEmpty) {
                  filtered.assignAll(controller.vehiclesList);
                } else {
                  final query = q.toLowerCase().trim();
                  filtered.assignAll(
                    controller.vehiclesList.where((v) {
                      return v.registrationNumber.toLowerCase().contains(query) ||
                          v.make.toLowerCase().contains(query) ||
                          v.model.toLowerCase().contains(query) ||
                          (v.assignedDriverName ?? '').toLowerCase().contains(query);
                    }).toList(),
                  );
                }
              },
              decoration: InputDecoration(
                hintText: 'Search by bus reg no, driver, or make...',
                hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
                prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFF94A3B8), size: 18),
                filled: true,
                fillColor: const Color(0xFF1E293B),
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFF334155)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFF334155)),
                ),
              ),
            ),
            const SizedBox(height: 12),

            // Vehicle List
            Expanded(
              child: Obx(() {
                if (filtered.isEmpty) {
                  return const Center(
                    child: Text(
                      'No matching vehicles found',
                      style: TextStyle(color: Color(0xFF64748B), fontSize: 13),
                    ),
                  );
                }

                return ListView.separated(
                  itemCount: filtered.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 8),
                  itemBuilder: (ctx, i) {
                    final v = filtered[i];
                    final isSelected = controller.vehicleId == v.id;
                    final isOnline = v.status.toLowerCase() == 'on_route' || v.status.toLowerCase() == 'active';

                    return InkWell(
                      onTap: () {
                        Get.back();
                        controller.selectVehicle(v, recenter: true);
                      },
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? const Color(0xFF2563EB).withValues(alpha: 0.15)
                              : const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isSelected ? const Color(0xFF3B82F6) : const Color(0xFF334155),
                            width: isSelected ? 1.5 : 1,
                          ),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 38,
                              height: 38,
                              decoration: BoxDecoration(
                                color: isOnline
                                    ? const Color(0xFF10B981).withValues(alpha: 0.15)
                                    : const Color(0xFF475569).withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Icon(
                                Icons.directions_bus_rounded,
                                color: isOnline ? const Color(0xFF10B981) : const Color(0xFF94A3B8),
                                size: 20,
                              ),
                            ),
                            const SizedBox(width: 12),

                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Text(
                                          v.registrationNumber,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 13,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 6,
                                          vertical: 2,
                                        ),
                                        decoration: BoxDecoration(
                                          color: isOnline
                                              ? const Color(0xFF10B981).withValues(alpha: 0.15)
                                              : Colors.amber.withValues(alpha: 0.15),
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: Text(
                                          v.status.toUpperCase(),
                                          maxLines: 1,
                                          style: TextStyle(
                                            color: isOnline
                                                ? const Color(0xFF10B981)
                                                : Colors.amber,
                                            fontSize: 8.5,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    '${v.make} ${v.model} • Driver: ${v.assignedDriverName ?? "Unassigned"}',
                                    style: const TextStyle(
                                      color: Color(0xFF94A3B8),
                                      fontSize: 10,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                            if (isSelected)
                              const Icon(Icons.check_circle_rounded, color: Color(0xFF38BDF8), size: 20)
                            else
                              const Icon(Icons.chevron_right_rounded, color: Color(0xFF64748B), size: 18),
                          ],
                        ),
                      ),
                    );
                  },
                );
              }),
            ),
          ],
        ),
      ),
      isScrollControlled: true,
    );
  }
}
