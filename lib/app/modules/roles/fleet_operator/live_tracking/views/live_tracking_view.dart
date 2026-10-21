import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:get/get.dart';
import 'package:latlong2/latlong.dart';
import '../controllers/live_tracking_controller.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../widgets/custom_back_button.dart';

class LiveTrackingView extends GetView<LiveTrackingController> {
  const LiveTrackingView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Obx(() {
          final vehicle = controller.selectedVehicle.value;
          final originLabel = vehicle?.source?.isNotEmpty == true
              ? vehicle!.source!
              : 'Depot / Origin';
          final destinationLabel = vehicle?.destination?.isNotEmpty == true
              ? vehicle!.destination!
              : 'Destination Terminal';

          return SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. Top Header & Navigation Bar
                _buildHeaderBar(context),
                const SizedBox(height: 12),

                // 2. Vehicle Selector & Socket Bridge Controls
                _buildVehicleAndBridgeControls(context),
                const SizedBox(height: 12),

                // 3. Live MQTT Stream Telemetry HUD Banner
                _buildLiveTelemetryBanner(),
                const SizedBox(height: 14),

                // 4. Interactive Google Maps Viewport with Floating HUDs
                _buildInteractiveMapViewport(context, originLabel, destinationLabel),
                const SizedBox(height: 16),

                // 5. Bottom 4 Telemetry Sensor Diagnostics Cards
                _buildSensorDiagnosticsGrid(),
                const SizedBox(height: 24),
              ],
            ),
          );
        }),
      ),
    );
  }

  // ==========================================
  // 1. TOP HEADER & NAVIGATION BAR
  // ==========================================
  Widget _buildHeaderBar(BuildContext context) {
    return Row(
      children: [
        const CustomBackButton(),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Flexible(
                    child: Text(
                      'Live GPS Tracking',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -0.3,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withOpacity(0.18),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF10B981).withOpacity(0.4)),
                    ),
                    child: const Text(
                      'MQTT Telemetry',
                      style: TextStyle(
                        color: Color(0xFF34D399),
                        fontSize: 9.5,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 2),
              const Text(
                'Real-time low-latency GPS telematics and geospatial transit monitoring',
                style: TextStyle(
                  color: AppColors.textMuted,
                  fontSize: 11,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
        const SizedBox(width: 8),
        // Quick Exit to Trips button in header
        InkWell(
          onTap: controller.exitToTrips,
          borderRadius: BorderRadius.circular(10),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFF475569)),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.directions_outlined, color: Color(0xFF38BDF8), size: 14),
                SizedBox(width: 4),
                Text(
                  'Trips',
                  style: TextStyle(
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

  // ==========================================
  // 2. VEHICLE SELECTOR & BRIDGE CONTROLS
  // ==========================================
  Widget _buildVehicleAndBridgeControls(BuildContext context) {
    final vehicle = controller.selectedVehicle.value;
    final isConnected = controller.isBridgeConnected.value;
    final autoFollow = controller.followVehicle.value;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Vehicle Dropdown Selector Button
          InkWell(
            onTap: () => _showVehicleSelectorSheet(context),
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.directions_bus_rounded, color: Color(0xFF38BDF8), size: 18),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          vehicle?.busNumber ?? 'Select Transit Vehicle',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          '${vehicle?.model ?? 'Transit Bus'} • ${vehicle?.assignedRoute ?? 'Route Unassigned'}',
                          style: const TextStyle(color: AppColors.textMuted, fontSize: 10.5),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Icon(Icons.unfold_more_rounded, color: Colors.white70, size: 18),
                ],
              ),
            ),
          ),
          const SizedBox(height: 10),

          // Bridge Connected Pill & Auto-Follow Button
          Row(
            children: [
              // Bridge Connected Indicator
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  decoration: BoxDecoration(
                    color: isConnected
                        ? const Color(0xFF064E3B).withOpacity(0.4)
                        : const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: isConnected ? const Color(0xFF059669) : const Color(0xFF475569),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 7,
                        height: 7,
                        decoration: BoxDecoration(
                          color: isConnected ? const Color(0xFF10B981) : Colors.grey,
                          shape: BoxShape.circle,
                          boxShadow: isConnected
                              ? [
                                  BoxShadow(
                                    color: const Color(0xFF10B981).withOpacity(0.6),
                                    blurRadius: 6,
                                    spreadRadius: 2,
                                  ),
                                ]
                              : null,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        isConnected ? 'Bridge Connected' : 'Bridge Offline',
                        style: TextStyle(
                          color: isConnected ? const Color(0xFF34D399) : Colors.white70,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 8),

              // Auto-Follow Toggle Button
              InkWell(
                onTap: controller.toggleFollowVehicle,
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: autoFollow
                        ? const Color(0xFF1E3A8A).withOpacity(0.5)
                        : const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: autoFollow ? const Color(0xFF3B82F6) : const Color(0xFF475569),
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.gps_fixed_rounded,
                        size: 14,
                        color: autoFollow ? const Color(0xFF60A5FA) : Colors.white70,
                      ),
                      const SizedBox(width: 5),
                      Text(
                        'Auto-Follow: ${autoFollow ? 'ON' : 'OFF'}',
                        style: TextStyle(
                          color: autoFollow ? const Color(0xFF93C5FD) : Colors.white70,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
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

  // ==========================================
  // 3. LIVE MQTT STREAM TELEMETRY HUD BANNER
  // ==========================================
  Widget _buildLiveTelemetryBanner() {
    final vehicle = controller.selectedVehicle.value;
    final hasCoords = controller.hasLiveCoords.value;
    final packets = controller.packetCount.value;
    final lastTime = controller.lastPacketTime.value;
    final timeStr = lastTime != null
        ? '${lastTime.hour.toString().padLeft(2, '0')}:${lastTime.minute.toString().padLeft(2, '0')}:${lastTime.second.toString().padLeft(2, '0')}'
        : '—';

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF1E293B), width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 7,
                height: 7,
                decoration: BoxDecoration(
                  color: hasCoords ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 6),
              Text(
                hasCoords ? 'MQTT Stream Active' : 'Awaiting Live Pings (Showing Last Fix)',
                style: TextStyle(
                  color: hasCoords ? const Color(0xFF34D399) : const Color(0xFFFBBF24),
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const Spacer(),
              Text(
                'Packets: $packets',
                style: const TextStyle(
                  color: Color(0xFF34D399),
                  fontSize: 10.5,
                  fontWeight: FontWeight.w900,
                  fontFamily: 'monospace',
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Expanded(
                child: Text(
                  'Topic: vehicle/${vehicle?.busNumber ?? 'GPS-TRK'}/location',
                  style: const TextStyle(
                    color: Color(0xFF38BDF8),
                    fontSize: 10,
                    fontFamily: 'monospace',
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                'Ping: $timeStr',
                style: const TextStyle(color: Colors.white70, fontSize: 10),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            'Coordinates: ${controller.markerLat.value.toStringAsFixed(5)}, ${controller.markerLng.value.toStringAsFixed(5)}',
            style: const TextStyle(
              color: Color(0xFFFCD34D),
              fontSize: 10,
              fontWeight: FontWeight.bold,
              fontFamily: 'monospace',
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // 4. INTERACTIVE GOOGLE MAPS VIEWPORT
  // ==========================================
  Widget _buildInteractiveMapViewport(
    BuildContext context,
    String originLabel,
    String destinationLabel,
  ) {
    final vehicle = controller.selectedVehicle.value;
    final waypoints = controller.routeWaypoints;
    final busLabel = vehicle?.busNumber ?? 'Vehicle';
    final currentPos = LatLng(controller.markerLat.value, controller.markerLng.value);

    return Container(
      height: 480,
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.cardBorder, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.35),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        children: [
          // FlutterMap Engine with Google Maps Raster Tiles
          FlutterMap(
            mapController: controller.mapController,
            options: MapOptions(
              initialCenter: currentPos,
              initialZoom: 14.5,
              interactionOptions: const InteractionOptions(
                flags: InteractiveFlag.all,
              ),
            ),
            children: [
              // Google Maps Tile Layer
              TileLayer(
                urlTemplate: controller.getTileUrl(),
                subdomains: const ['mt0', 'mt1', 'mt2', 'mt3'],
                userAgentPackageName: 'com.vmovexa.app',
                maxZoom: 20,
              ),

              // Route Polyline (Dual-stroke matching admin panel)
              if (waypoints.length > 1) ...[
                // Outer Blue Border Line
                PolylineLayer(
                  polylines: [
                    Polyline(
                      points: waypoints,
                      strokeWidth: 8.0,
                      color: const Color(0xFF1A73E8).withOpacity(0.85),
                      strokeCap: StrokeCap.round,
                      strokeJoin: StrokeJoin.round,
                    ),
                  ],
                ),
                // Inner Bright Blue Line
                PolylineLayer(
                  polylines: [
                    Polyline(
                      points: waypoints,
                      strokeWidth: 5.0,
                      color: const Color(0xFF4285F4),
                      strokeCap: StrokeCap.round,
                      strokeJoin: StrokeJoin.round,
                    ),
                  ],
                ),
              ],

              // Pins & Puck Markers Layer
              MarkerLayer(
                markers: [
                  // Origin / Start Pin Marker
                  if (waypoints.isNotEmpty)
                    Marker(
                      point: waypoints.first,
                      width: 32,
                      height: 32,
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          Container(
                            width: 28,
                            height: 28,
                            decoration: BoxDecoration(
                              color: const Color(0xFF188038).withOpacity(0.3),
                              shape: BoxShape.circle,
                            ),
                          ),
                          Container(
                            width: 14,
                            height: 14,
                            decoration: BoxDecoration(
                              color: const Color(0xFF188038),
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 2.5),
                              boxShadow: const [
                                BoxShadow(color: Colors.black38, blurRadius: 4),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),

                  // Destination Pin Marker
                  if (waypoints.length > 1)
                    Marker(
                      point: waypoints.last,
                      width: 26,
                      height: 34,
                      alignment: Alignment.topCenter,
                      child: const Icon(
                        Icons.location_on_rounded,
                        color: Color(0xFFEA4335),
                        size: 32,
                        shadows: [
                          Shadow(color: Colors.black45, blurRadius: 6),
                        ],
                      ),
                    ),

                  // Live Vehicle GPS Puck Marker (Blue rotating puck + tag)
                  Marker(
                    point: currentPos,
                    width: 70,
                    height: 70,
                    child: Stack(
                      alignment: Alignment.center,
                      clipBehavior: Clip.none,
                      children: [
                        // Radar Pulse Ring
                        Container(
                          width: 50,
                          height: 50,
                          decoration: BoxDecoration(
                            color: const Color(0xFF2563EB).withOpacity(0.25),
                            shape: BoxShape.circle,
                          ),
                        ),
                        // Rotating Puck Body
                        Transform.rotate(
                          angle: controller.currentHeading.value * (math.pi / 180.0),
                          child: Container(
                            width: 28,
                            height: 28,
                            decoration: BoxDecoration(
                              color: const Color(0xFF1D4ED8),
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 2.5),
                              boxShadow: const [
                                BoxShadow(
                                  color: Colors.black45,
                                  blurRadius: 6,
                                  offset: Offset(0, 3),
                                ),
                              ],
                            ),
                            alignment: Alignment.center,
                            child: const Text(
                              '▲',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 13,
                                fontWeight: FontWeight.w900,
                                height: 1.0,
                              ),
                            ),
                          ),
                        ),
                        // Top Floating Bus Number Tag
                        Positioned(
                          top: -4,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                            decoration: BoxDecoration(
                              color: const Color(0xFF0F172A),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: const Color(0xFF38BDF8).withOpacity(0.5)),
                              boxShadow: const [
                                BoxShadow(color: Colors.black45, blurRadius: 4),
                              ],
                            ),
                            child: Text(
                              busLabel,
                              style: const TextStyle(
                                color: Color(0xFF38BDF8),
                                fontSize: 8.5,
                                fontWeight: FontWeight.w900,
                                fontFamily: 'monospace',
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
          ),

          // ==========================================
          // FLOATING OVERLAY 1: Route & Navigation HUD (Top Left)
          // ==========================================
          Positioned(
            top: 10,
            left: 10,
            right: 70,
            child: Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFF0F9D58).withOpacity(0.95),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF34D399).withOpacity(0.5)),
                boxShadow: const [
                  BoxShadow(color: Colors.black38, blurRadius: 10, offset: Offset(0, 4)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.explore_rounded, color: Colors.white, size: 18),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              controller.currentSpeed.value > 0
                                  ? '${controller.currentSpeed.value.round()} km/h'
                                  : 'En Route',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 14,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                            Text(
                              'From: $originLabel',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              'To: $destinationLabel',
                              style: const TextStyle(
                                color: Color(0xFFD1FAE5),
                                fontSize: 9.5,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      InkWell(
                        onTap: controller.toggleStepsDrawer,
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.18),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Icon(
                            controller.stepsDrawerOpen.value
                                ? Icons.keyboard_arrow_up_rounded
                                : Icons.keyboard_arrow_down_rounded,
                            color: Colors.white,
                            size: 18,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.only(top: 5),
                    decoration: BoxDecoration(
                      border: Border(
                        top: BorderSide(color: Colors.white.withOpacity(0.25)),
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'HEADING: ${controller.currentHeading.value}°',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'monospace',
                          ),
                        ),
                        Text(
                          'GNSS: ${controller.satellitesCount.value} SATS',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ==========================================
          // FLOATING OVERLAY 2: Map Controls & Layer Selector (Top Right)
          // ==========================================
          Positioned(
            top: 10,
            right: 10,
            child: Column(
              children: [
                // Recenter Target Button
                _buildMapFloatingButton(
                  icon: Icons.my_location_rounded,
                  color: const Color(0xFF38BDF8),
                  onTap: controller.recenterMap,
                  tooltip: 'Recenter on Bus',
                ),
                const SizedBox(height: 8),

                // Map Style Switcher (Roadmap, Satellite, Traffic, Terrain)
                _buildMapFloatingButton(
                  icon: Icons.layers_rounded,
                  color: controller.mapStyle.value != 'roadmap'
                      ? const Color(0xFFF59E0B)
                      : Colors.white,
                  onTap: controller.cycleMapStyle,
                  tooltip: 'Switch Map Layer',
                ),
                const SizedBox(height: 8),

                // Zoom Controls Group
                Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A).withOpacity(0.92),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF334155)),
                    boxShadow: const [
                      BoxShadow(color: Colors.black38, blurRadius: 6),
                    ],
                  ),
                  child: Column(
                    children: [
                      InkWell(
                        onTap: controller.zoomIn,
                        child: const Padding(
                          padding: EdgeInsets.all(8),
                          child: Icon(Icons.add, color: Colors.white, size: 18),
                        ),
                      ),
                      Container(height: 1, width: 22, color: const Color(0xFF334155)),
                      InkWell(
                        onTap: controller.zoomOut,
                        child: const Padding(
                          padding: EdgeInsets.all(8),
                          child: Icon(Icons.remove, color: Colors.white, size: 18),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // ==========================================
          // FLOATING OVERLAY 3: Speedometer Gauge (Bottom Left)
          // ==========================================
          Positioned(
            bottom: 110,
            left: 12,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A).withOpacity(0.92),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFF334155)),
                boxShadow: const [
                  BoxShadow(color: Colors.black38, blurRadius: 6),
                ],
              ),
              child: Row(
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Text(
                        '${controller.currentSpeed.value.round()}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          fontFamily: 'monospace',
                          height: 1.0,
                        ),
                      ),
                      const Text(
                        'KM/H',
                        style: TextStyle(
                          color: AppColors.textMuted,
                          fontSize: 7.5,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: const Color(0xFF475569)),
                      color: const Color(0xFF1E293B),
                    ),
                    child: const Text(
                      'GNSS',
                      style: TextStyle(
                        color: Color(0xFF38BDF8),
                        fontSize: 7.5,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ==========================================
          // FLOATING OVERLAY 4: Route Details Drawer
          // ==========================================
          if (controller.stepsDrawerOpen.value)
            Positioned(
              top: 96,
              left: 10,
              right: 10,
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A).withOpacity(0.96),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF334155)),
                  boxShadow: const [
                    BoxShadow(color: Colors.black54, blurRadius: 14),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'ASSIGNED ROUTE INFORMATION',
                          style: TextStyle(
                            color: Color(0xFF38BDF8),
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 0.5,
                          ),
                        ),
                        InkWell(
                          onTap: controller.toggleStepsDrawer,
                          child: const Icon(Icons.close_rounded, color: Colors.white70, size: 16),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    _buildDrawerInfoRow(
                      'Route Name',
                      vehicle?.assignedRoute ?? 'Unassigned',
                    ),
                    _buildDrawerInfoRow('Origin', originLabel),
                    _buildDrawerInfoRow('Destination', destinationLabel),
                    if (vehicle?.routeDistanceKm != null)
                      _buildDrawerInfoRow(
                        'Total Distance',
                        '${vehicle!.routeDistanceKm} km',
                      ),
                    if (waypoints.isNotEmpty)
                      _buildDrawerInfoRow(
                        'Road Path Geometry',
                        '${waypoints.length} GIS Points',
                      ),
                  ],
                ),
              ),
            ),

          // ==========================================
          // FLOATING OVERLAY 5: Bottom Navigation Status Bar
          // ==========================================
          Positioned(
            bottom: 8,
            left: 8,
            right: 8,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A).withOpacity(0.95),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF334155)),
                boxShadow: const [
                  BoxShadow(color: Colors.black45, blurRadius: 10, offset: Offset(0, 4)),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Row 1: Trip Specs & Driver Pill
                  Row(
                    children: [
                      // Trip Specs
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  vehicle?.routeDistanceKm != null
                                      ? '${vehicle!.routeDistanceKm} km'
                                      : 'Active Route',
                                  style: const TextStyle(
                                    color: Color(0xFF34D399),
                                    fontSize: 15,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),

                              ],
                            ),
                            if (vehicle?.routeDurationMin != null) ...[
                              const SizedBox(width: 4),
                              Text(
                                '• ${vehicle!.routeDurationMin} min est.',
                                style: const TextStyle(
                                  color: Colors.white70,
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                            Text(
                              'Bus: ${vehicle?.busNumber ?? 'N/A'} • ${vehicle?.vehicleType ?? 'Transit'}',
                              style: const TextStyle(
                                color: AppColors.textMuted,
                                fontSize: 9.5,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),

                      // Driver Pill
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFF334155)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.person_outline_rounded, color: Colors.white70, size: 14),
                            const SizedBox(width: 4),
                            Text(
                              vehicle?.assignedDriverName ?? 'Driver Unassigned',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Row 2: Quick Action Buttons (Call Driver, Focus Bus, Exit to Trips)
                  Row(
                    children: [
                      // Driver Call Button
                      Expanded(
                        child: InkWell(
                          onTap: controller.callDriver,
                          borderRadius: BorderRadius.circular(10),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 7),
                            decoration: BoxDecoration(
                              color: const Color(0xFF1E293B),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: const Color(0xFF475569)),
                            ),
                            child: const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.phone_rounded, color: Color(0xFF34D399), size: 13),
                                SizedBox(width: 4),
                                Text(
                                  'Call Driver',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 6),

                      // Focus Bus Button
                      Expanded(
                        child: InkWell(
                          onTap: controller.recenterMap,
                          borderRadius: BorderRadius.circular(10),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 7),
                            decoration: BoxDecoration(
                              color: const Color(0xFF1E3A8A).withOpacity(0.6),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: const Color(0xFF3B82F6)),
                            ),
                            child: const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.my_location_rounded, color: Color(0xFF60A5FA), size: 13),
                                SizedBox(width: 4),
                                Text(
                                  'Focus Bus',
                                  style: TextStyle(
                                    color: Color(0xFF93C5FD),
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 6),

                      // Exit to Trips Button (Matching Admin Panel)
                      Expanded(
                        child: InkWell(
                          onTap: controller.exitToTrips,
                          borderRadius: BorderRadius.circular(10),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 7),
                            decoration: BoxDecoration(
                              color: const Color(0xFF0F172A),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: const Color(0xFF64748B)),
                            ),
                            child: const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.logout_rounded, color: Colors.white70, size: 13),
                                SizedBox(width: 4),
                                Text(
                                  'Exit to Trips',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 10.5,
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
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMapFloatingButton({
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
    required String tooltip,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        width: 38,
        height: 38,
        decoration: BoxDecoration(
          color: const Color(0xFF0F172A).withOpacity(0.92),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFF334155)),
          boxShadow: const [
            BoxShadow(color: Colors.black38, blurRadius: 6),
          ],
        ),
        child: Icon(icon, color: color, size: 18),
      ),
    );
  }

  Widget _buildDrawerInfoRow(String label, String value) {
    return Container(
      margin: const EdgeInsets.only(bottom: 5),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
          ),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 10,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // 5. BOTTOM 4 SENSOR DIAGNOSTICS CARDS
  // ==========================================
  Widget _buildSensorDiagnosticsGrid() {
    final vehicle = controller.selectedVehicle.value;
    final speed = controller.currentSpeed.value.round();
    final battery = controller.batteryLevel.value;
    final satellites = controller.satellitesCount.value;
    final heading = controller.currentHeading.value;
    final boxId = vehicle?.edgeDeviceBoxId ?? 'RK3588-SIM-001';

    return Column(
      children: [
        Row(
          children: [
            // Card 1: GNSS Live Speed
            Expanded(
              child: _buildDiagnosticCard(
                icon: Icons.speed_rounded,
                iconColor: const Color(0xFF10B981),
                bgColor: const Color(0xFF064E3B).withOpacity(0.3),
                title: 'GNSS LIVE SPEED',
                value: '$speed km/h',
                subtitle: 'Streaming via MQTT',
                subtitleColor: const Color(0xFF34D399),
              ),
            ),
            const SizedBox(width: 10),
            // Card 2: Battery Level
            Expanded(
              child: _buildDiagnosticCard(
                icon: Icons.battery_charging_full_rounded,
                iconColor: const Color(0xFF3B82F6),
                bgColor: const Color(0xFF1E3A8A).withOpacity(0.3),
                title: 'BATTERY LEVEL',
                value: '$battery%',
                subtitle: (vehicle?.fuelType ?? 'ELECTRIC PACK').toUpperCase(),
                subtitleColor: const Color(0xFF60A5FA),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            // Card 3: IoT Telematics
            Expanded(
              child: _buildDiagnosticCard(
                icon: Icons.satellite_alt_rounded,
                iconColor: const Color(0xFF38BDF8),
                bgColor: const Color(0xFF0C4A6E).withOpacity(0.3),
                title: 'IOT TELEMATICS',
                value: '$satellites Sats',
                subtitle: 'Box: $boxId',
                subtitleColor: AppColors.textMuted,
              ),
            ),
            const SizedBox(width: 10),
            // Card 4: Heading & Motion
            Expanded(
              child: _buildDiagnosticCard(
                icon: Icons.navigation_rounded,
                iconColor: const Color(0xFFF59E0B),
                bgColor: const Color(0xFF78350F).withOpacity(0.3),
                title: 'HEADING & MOTION',
                value: heading > 0 ? '$heading°' : 'Stationary',
                subtitle: vehicle?.status == 'on_route'
                    ? 'Status: On Route'
                    : 'Status: In Depot',
                subtitleColor: const Color(0xFFFBBF24),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildDiagnosticCard({
    required IconData icon,
    required Color iconColor,
    required Color bgColor,
    required String title,
    required String value,
    required String subtitle,
    required Color subtitleColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: bgColor,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: iconColor.withOpacity(0.3)),
            ),
            child: Icon(icon, color: iconColor, size: 18),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 8.5,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 1),
                Text(
                  value,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                Text(
                  subtitle,
                  style: TextStyle(
                    color: subtitleColor,
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
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

  // ==========================================
  // VEHICLE SELECTOR MODAL BOTTOM SHEET
  // ==========================================
  void _showVehicleSelectorSheet(BuildContext context) {
    Get.bottomSheet(
      Container(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(context).size.height * 0.7,
        ),
        padding: const EdgeInsets.all(16),
        decoration: const BoxDecoration(
          color: Color(0xFF0F172A),
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          border: Border(top: BorderSide(color: Color(0xFF334155), width: 1.5)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Select Transit Vehicle',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, color: Colors.white70),
                  onPressed: () => Get.back(),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Expanded(
              child: Obx(() {
                final list = controller.vehicles;
                if (list.isEmpty) {
                  return const Center(
                    child: Text(
                      'No fleet vehicles available',
                      style: TextStyle(color: AppColors.textMuted),
                    ),
                  );
                }

                return ListView.separated(
                  itemCount: list.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 8),
                  itemBuilder: (context, index) {
                    final v = list[index];
                    final isSelected = controller.selectedVehicle.value?.id == v.id;

                    return InkWell(
                      onTap: () {
                        controller.selectVehicle(v);
                        Get.back();
                      },
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? const Color(0xFF1E3A8A).withOpacity(0.4)
                              : const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isSelected ? const Color(0xFF3B82F6) : const Color(0xFF334155),
                          ),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 36,
                              height: 36,
                              decoration: BoxDecoration(
                                color: const Color(0xFF38BDF8).withOpacity(0.15),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Icon(
                                Icons.directions_bus_rounded,
                                color: Color(0xFF38BDF8),
                                size: 18,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    v.busNumber,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 13,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text(
                                    '${v.model} • ${v.assignedRoute ?? 'No Route'}',
                                    style: const TextStyle(
                                      color: AppColors.textMuted,
                                      fontSize: 10.5,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            if (isSelected)
                              const Icon(
                                Icons.check_circle_rounded,
                                color: Color(0xFF3B82F6),
                                size: 20,
                              ),
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
