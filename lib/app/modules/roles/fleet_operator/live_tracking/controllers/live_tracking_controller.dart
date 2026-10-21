import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:get/get.dart';
import 'package:latlong2/latlong.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../../data/models/fleet_models.dart';
import '../../../../../data/models/vehicle_telemetry_model.dart';
import '../../../../../data/services/fleet_service.dart';
import '../../../../../routes/app_routes.dart';
import '../../../../../utils/polyline_decoder.dart';

class LiveTrackingController extends GetxController {
  final FleetService _fleetService = FleetService.to;

  // Vehicles List & Selection
  final RxList<VehicleItemModel> vehicles = <VehicleItemModel>[].obs;
  final Rx<VehicleItemModel?> selectedVehicle = Rx<VehicleItemModel?>(null);
  final RxBool isLoadingVehicles = false.obs;

  // Telemetry Data
  final Rx<VehicleTelemetryModel?> telemetry = Rx<VehicleTelemetryModel?>(null);
  final RxBool isLoadingTelemetry = false.obs;

  // Real-time MQTT Telematics HUD Stream state
  final RxBool isBridgeConnected = true.obs;
  final RxBool hasLiveCoords = false.obs;
  final RxInt packetCount = 0.obs;
  final Rx<DateTime?> lastPacketTime = Rx<DateTime?>(null);

  // Map & Camera Controls
  final MapController mapController = MapController();
  final RxString mapStyle = 'roadmap'.obs; // roadmap, satellite, traffic, terrain
  final RxBool followVehicle = true.obs;
  final RxBool stepsDrawerOpen = false.obs;

  // Current Live Coordinates & Metrics
  final RxDouble markerLat = 23.12142.obs;
  final RxDouble markerLng = 75.78542.obs;
  final RxDouble currentSpeed = 0.0.obs;
  final RxInt currentHeading = 0.obs;
  final RxInt satellitesCount = 12.obs;
  final RxInt batteryLevel = 85.obs;
  final RxList<LatLng> routeWaypoints = <LatLng>[].obs;

  // Real-time ticker timer
  Timer? _telemetryTicker;
  int _waypointIndex = 0;

  // Default fallback center (Indore / Transit Hub)
  static const LatLng defaultTransitCenter = LatLng(23.12142, 75.78542);

  @override
  void onInit() {
    super.onInit();
    _initLiveTracking();
  }

  @override
  void onClose() {
    _telemetryTicker?.cancel();
    super.onClose();
  }

  Future<void> _initLiveTracking() async {
    await fetchVehicles();
    _startLiveTelemetryStream();
  }

  /// 1. Fetch Vehicle Fleet from API
  Future<void> fetchVehicles() async {
    isLoadingVehicles.value = true;
    try {
      final res = await _fleetService.getVehicles(limit: 100);
      if (res.success && res.data != null && res.data!.isNotEmpty) {
        vehicles.assignAll(res.data!);

        // Determine which vehicle to select
        String? targetVehicleId;
        final args = Get.arguments;
        if (args is Map) {
          if (args['vehicleId'] != null) {
            targetVehicleId = args['vehicleId'].toString();
          } else if (args['vehicleName'] != null) {
            final match = vehicles.firstWhereOrNull(
              (v) => v.busNumber.toLowerCase() == args['vehicleName'].toString().toLowerCase(),
            );
            if (match != null) targetVehicleId = match.id;
          }
        } else if (args is VehicleItemModel) {
          targetVehicleId = args.id;
        }

        VehicleItemModel? initialVehicle;
        if (targetVehicleId != null) {
          initialVehicle = vehicles.firstWhereOrNull((v) => v.id.toString() == targetVehicleId);
        }

        // Auto-prioritize vehicle with assigned route or GPS device (matching admin panel logic)
        initialVehicle ??= vehicles.firstWhereOrNull(
              (v) => (v.routeId != null || v.assignedRoute != null || v.gpsDeviceId != null),
            ) ??
            vehicles.first;

        selectVehicle(initialVehicle);
      } else {
        // Fallback default vehicle for demo/offline preview
        final fallback = VehicleItemModel(
          id: 'veh_demo_01',
          registrationNumber: 'MP09-CV-4421',
          model: 'Tata Starbus EV Urban',
          vehicleType: 'Electric Transit Bus',
          fuelType: 'electric',
          status: 'on_route',
          assignedRoute: 'Route 10A: Rajwada ➔ Airport Terminal',
          source: 'Rajwada Junction',
          destination: 'Devi Ahilyabai Airport',
          routeDistanceKm: 14.8,
          routeDurationMin: 35,
          speedKmh: 42.0,
          batterySocPct: 88,
          heading: 142,
          satellites: 14,
          driverPhone: '+91 98765 43210',
          assignedDriverName: 'Rajesh Kumar Verma',
          edgeDeviceBoxId: 'RK3588-SIM-001',
          // Sample route polyline across Indore transit artery
          routePolyline: 'q_lmD_v~xMo@eCeAgCg@eCq@oDuAgFk@uBo@sBs@qB}AqDs@cB',
        );
        vehicles.assignAll([fallback]);
        selectVehicle(fallback);
      }
    } catch (e) {
      debugPrint('Error fetching vehicles: $e');
    } finally {
      isLoadingVehicles.value = false;
    }
  }

  /// 2. Select a vehicle and load its route geometry & telemetry
  Future<void> selectVehicle(VehicleItemModel vehicle) async {
    selectedVehicle.value = vehicle;
    _waypointIndex = 0;

    // Decode Route Polyline
    final List<LatLng> decoded = [];
    if (vehicle.routePolyline != null && vehicle.routePolyline!.isNotEmpty) {
      decoded.addAll(decodePolyline(vehicle.routePolyline));
    }

    // Default route geometry fallback if polyline not available in DB
    if (decoded.length < 2) {
      final baseLat = vehicle.startLatitude ?? 22.7196;
      final baseLng = vehicle.startLongitude ?? 75.8577;
      decoded.addAll([
        LatLng(baseLat, baseLng),
        LatLng(baseLat + 0.008, baseLng + 0.006),
        LatLng(baseLat + 0.015, baseLng + 0.012),
        LatLng(baseLat + 0.022, baseLng + 0.020),
        LatLng(baseLat + 0.030, baseLng + 0.032),
      ]);
    }

    routeWaypoints.assignAll(decoded);

    // Initial Coordinates
    if (decoded.isNotEmpty) {
      markerLat.value = decoded.first.latitude;
      markerLng.value = decoded.first.longitude;
    } else {
      markerLat.value = vehicle.startLatitude ?? defaultTransitCenter.latitude;
      markerLng.value = vehicle.startLongitude ?? defaultTransitCenter.longitude;
    }

    currentSpeed.value = vehicle.speedKmh ?? 38.0;
    currentHeading.value = vehicle.heading ?? 125;
    satellitesCount.value = vehicle.satellites ?? 12;
    batteryLevel.value = vehicle.batterySocPct ?? 85;
    hasLiveCoords.value = true;
    lastPacketTime.value = DateTime.now();

    // Pan map to vehicle position
    WidgetsBinding.instance.addPostFrameCallback((_) {
      recenterMap();
    });

    // Load Telemetry from API
    await loadTelemetry(vehicle.id);
  }

  /// 3. Load Telemetry for Vehicle from API
  Future<void> loadTelemetry(String vehicleId) async {
    isLoadingTelemetry.value = true;
    try {
      final res = await _fleetService.getVehicleTelemetry(vehicleId);
      if (res.success && res.data != null) {
        telemetry.value = res.data;
        final t = res.data!;
        if (t.latitude != null && t.longitude != null) {
          markerLat.value = t.latitude!;
          markerLng.value = t.longitude!;
          hasLiveCoords.value = true;
        }
        if (t.speedKmh != null) currentSpeed.value = t.speedKmh!;
        if (t.heading != null) currentHeading.value = t.heading!;
        if (t.satellites != null) satellitesCount.value = t.satellites!;
        if (t.batterySocPct != null) batteryLevel.value = t.batterySocPct!;
        lastPacketTime.value = DateTime.now();

        // If telemetry contains historical positions, use them as path
        if (t.positions.length > 1) {
          final pts = t.positions.map((p) => LatLng(p.lat, p.lng)).toList();
          routeWaypoints.assignAll(pts);
        }
      }
    } catch (e) {
      debugPrint('Error loading telemetry for $vehicleId: $e');
    } finally {
      isLoadingTelemetry.value = false;
    }
  }

  /// 4. Real-time Live MQTT Stream Simulator & Position Tracker
  void _startLiveTelemetryStream() {
    _telemetryTicker?.cancel();
    _telemetryTicker = Timer.periodic(const Duration(seconds: 3), (timer) {
      packetCount.value += 1;
      lastPacketTime.value = DateTime.now();
      isBridgeConnected.value = true;

      // Advance position smoothly along route waypoints (simulating live bus movement)
      if (routeWaypoints.isNotEmpty) {
        _waypointIndex = (_waypointIndex + 1) % routeWaypoints.length;
        final nextPos = routeWaypoints[_waypointIndex];
        
        // Calculate bearing/heading towards next point
        if (_waypointIndex > 0) {
          final prevPos = routeWaypoints[_waypointIndex - 1];
          final dLat = nextPos.latitude - prevPos.latitude;
          final dLng = nextPos.longitude - prevPos.longitude;
          final angle = (dLng != 0 || dLat != 0)
              ? (angleFromCoordinate(prevPos.latitude, prevPos.longitude, nextPos.latitude, nextPos.longitude))
              : currentHeading.value;
          currentHeading.value = angle.round() % 360;
        }

        markerLat.value = nextPos.latitude;
        markerLng.value = nextPos.longitude;
        hasLiveCoords.value = true;

        // Dynamic cruising speed variance
        final baseSpeed = selectedVehicle.value?.speedKmh ?? 35.0;
        currentSpeed.value = (baseSpeed + ((packetCount.value % 5) - 2) * 2.5).clamp(20.0, 65.0);

        // Auto-follow vehicle if enabled
        if (followVehicle.value) {
          try {
            mapController.move(LatLng(markerLat.value, markerLng.value), mapController.camera.zoom);
          } catch (_) {}
        }
      }
    });
  }

  /// Calculate compass heading between two coordinates
  double angleFromCoordinate(double lat1, double long1, double lat2, double long2) {
    final dLon = (long2 - long1) * (math.pi / 180.0);
    final lat1Rad = lat1 * (math.pi / 180.0);
    final lat2Rad = lat2 * (math.pi / 180.0);

    final y = math.sin(dLon) * math.cos(lat2Rad);
    final x = math.cos(lat1Rad) * math.sin(lat2Rad) -
        math.sin(lat1Rad) * math.cos(lat2Rad) * math.cos(dLon);
    final brng = math.atan2(y, x);
    return ((brng * (180.0 / math.pi)) + 360) % 360;
  }

  /// Map Tile Layer Resolver matching Google Maps tiles in Admin Panel
  String getTileUrl() {
    switch (mapStyle.value) {
      case 'satellite':
        return 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
      case 'traffic':
        return 'https://mt1.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}';
      case 'terrain':
        return 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}';
      case 'roadmap':
      default:
        return 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
    }
  }

  void cycleMapStyle() {
    if (mapStyle.value == 'roadmap') {
      mapStyle.value = 'satellite';
    } else if (mapStyle.value == 'satellite') {
      mapStyle.value = 'traffic';
    } else if (mapStyle.value == 'traffic') {
      mapStyle.value = 'terrain';
    } else {
      mapStyle.value = 'roadmap';
    }
  }

  void toggleFollowVehicle() {
    followVehicle.value = !followVehicle.value;
    if (followVehicle.value) {
      recenterMap();
    }
  }

  void toggleStepsDrawer() {
    stepsDrawerOpen.value = !stepsDrawerOpen.value;
  }

  void zoomIn() {
    try {
      final currentZoom = mapController.camera.zoom;
      mapController.move(mapController.camera.center, currentZoom + 1);
    } catch (_) {}
  }

  void zoomOut() {
    try {
      final currentZoom = mapController.camera.zoom;
      mapController.move(mapController.camera.center, currentZoom - 1);
    } catch (_) {}
  }

  void recenterMap() {
    try {
      final target = LatLng(markerLat.value, markerLng.value);
      mapController.move(target, 14.5);
    } catch (_) {}
  }

  /// 5. Call Driver using direct dialer
  Future<void> callDriver() async {
    final phone = selectedVehicle.value?.driverPhone ?? '+919876543210';
    final cleanPhone = phone.replaceAll(RegExp(r'[^0-9+]'), '');
    final uri = Uri.parse('tel:$cleanPhone');

    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      } else {
        Get.snackbar(
          'Dialing Driver',
          'Driver contact: $phone',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF6366F1),
          colorText: Colors.white,
        );
      }
    } catch (_) {
      Get.snackbar(
        'Driver Contact',
        'Calling ${selectedVehicle.value?.assignedDriverName ?? 'Driver'}: $phone',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF6366F1),
        colorText: Colors.white,
      );
    }
  }

  void exitToTrips() {
    Get.toNamed(Routes.FLEET_TRIPS);
  }
}
