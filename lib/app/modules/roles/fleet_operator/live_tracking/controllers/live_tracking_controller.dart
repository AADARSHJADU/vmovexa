import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../../routes/app_routes.dart';
import '../../../../../data/services/fleet_service.dart';
import '../../../../../data/models/fleet_models.dart';
import '../../../../../data/models/vehicle_telemetry_model.dart';
import '../../../../../utils/polyline_decoder.dart';

class LiveTrackingController extends GetxController {
  // Map Controller
  final MapController mapController = MapController();

  // Vehicle list & Selection
  final RxList<VehicleItemModel> vehiclesList = <VehicleItemModel>[].obs;
  final Rx<VehicleItemModel?> selectedVehicle = Rx<VehicleItemModel?>(null);
  String? vehicleId;

  // Real-time Vehicle Specs
  final RxString vehicleName = ''.obs;
  final RxString modelName = ''.obs;
  final RxString status = 'CONNECTING...'.obs;

  final RxInt speed = 0.obs;
  final RxInt battery = 0.obs;
  final RxString gpsSignal = 'Searching...'.obs;
  final RxString ignition = 'OFF'.obs;
  final RxInt heading = 0.obs;
  final RxInt satellites = 0.obs;

  // Driver Details
  final RxString driverName = 'Unassigned'.obs;
  final RxString driverPhone = ''.obs;

  // Route & Location state
  final Rx<LatLng> currentPosition = Rx<LatLng>(const LatLng(12.9716, 77.5946)); // Default India center
  final RxList<LatLng> routePoints = <LatLng>[].obs;
  final Rx<LatLng?> startPoint = Rx<LatLng?>(null);
  final Rx<LatLng?> endPoint = Rx<LatLng?>(null);
  final RxString sourceLocation = ''.obs;
  final RxString destinationLocation = ''.obs;
  final RxDouble distanceRemainingKm = 0.0.obs;
  final RxInt etaMinutes = 0.obs;
  final RxString lastUpdated = 'Just now'.obs;

  // UI state
  final RxBool isLoading = false.obs;
  final RxBool isSwitchingVehicle = false.obs;
  final RxString mapStyle = 'roadmap'.obs; // 'roadmap', 'satellite', 'dark'
  bool followVehicle = true;

  // Telemetry Polling Timer
  Timer? _telemetryTimer;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args is Map) {
      if (args['vehicleId'] != null) vehicleId = args['vehicleId'].toString();
      if (args['vehicleName'] != null) vehicleName.value = args['vehicleName'];
      if (args['driverName'] != null) driverName.value = args['driverName'];
    }
    initLiveTracking();
    // Poll telemetry every 6 seconds for dynamic live updates
    _telemetryTimer = Timer.periodic(const Duration(seconds: 6), (_) {
      _pollLiveTelemetry();
    });
  }

  @override
  void onClose() {
    _telemetryTimer?.cancel();
    mapController.dispose();
    super.onClose();
  }

  /// Initial load of fleet vehicles and the selected vehicle
  Future<void> initLiveTracking() async {
    isLoading.value = true;
    try {
      final vRes = await FleetService.to.getVehicles(limit: 50);
      if (vRes.success && vRes.data != null && vRes.data!.isNotEmpty) {
        // Exclude pending_approval vehicles to match web frontend telematics
        final activeVehicles = vRes.data!.where((v) {
          final s = v.status.trim().toLowerCase();
          return s != 'pending' && s != 'pending_approval';
        }).toList();

        vehiclesList.assignAll(activeVehicles.isNotEmpty ? activeVehicles : vRes.data!);

        VehicleItemModel? target;
        if (vehicleId != null && vehicleId!.isNotEmpty) {
          target = vehiclesList.firstWhereOrNull((v) => v.id == vehicleId);
        }

        // Prioritize on_route or active vehicle if none specified
        target ??= vehiclesList.firstWhereOrNull(
                (v) => v.status.toLowerCase() == 'on_route' || v.status.toLowerCase() == 'active') ??
            vehiclesList.first;

        await selectVehicle(target, recenter: true);
      } else {
        _setEmptyState();
      }
    } catch (_) {
      _setEmptyState();
    } finally {
      isLoading.value = false;
    }
  }

  /// Select and track a specific vehicle
  Future<void> selectVehicle(VehicleItemModel v, {bool recenter = true}) async {
    isSwitchingVehicle.value = true;
    selectedVehicle.value = v;
    vehicleId = v.id;

    vehicleName.value = v.registrationNumber;
    modelName.value = [v.make, v.model].where((s) => s.isNotEmpty).join(' ');
    status.value = v.status.toUpperCase();
    speed.value = (v.speedKmh ?? 0).toInt();
    battery.value = v.batterySocPct ?? 0;
    driverName.value = v.assignedDriverName ?? 'Unassigned';
    driverPhone.value = v.driverPhone ?? '';
    gpsSignal.value = v.gpsDeviceId != null ? 'Connected' : 'No GPS';
    ignition.value = v.status.toLowerCase() == 'on_route' ? 'ON' : 'OFF';
    heading.value = v.heading ?? 0;
    satellites.value = v.satellites ?? 0;

    sourceLocation.value = v.source?.isNotEmpty == true
        ? v.source!
        : (v.depotName?.isNotEmpty == true ? v.depotName! : 'Depot / Origin Terminal');
    destinationLocation.value = v.destination?.isNotEmpty == true ? v.destination! : 'End Station / Destination';
    distanceRemainingKm.value = v.routeDistanceKm ?? 0.0;
    etaMinutes.value = v.routeDurationMin ?? 0;

    // Decode Route polyline
    routePoints.clear();
    startPoint.value = null;
    endPoint.value = null;

    if (v.routePolyline != null && v.routePolyline!.trim().isNotEmpty) {
      final decoded = decodePolyline(v.routePolyline);
      if (decoded.isNotEmpty) {
        routePoints.assignAll(decoded);
        startPoint.value = decoded.first;
        endPoint.value = decoded.last;
      }
    }

    // Set initial position
    if (v.startLatitude != null && v.startLongitude != null && v.startLatitude != 0.0) {
      currentPosition.value = LatLng(v.startLatitude!, v.startLongitude!);
    } else if (routePoints.isNotEmpty) {
      currentPosition.value = routePoints.first;
    }

    // Fetch full vehicle details & latest telemetry
    await _fetchVehicleDetailsAndTelemetry(v.id, recenter: recenter);
    isSwitchingVehicle.value = false;
  }

  Future<void> _fetchVehicleDetailsAndTelemetry(String vId, {bool recenter = false}) async {
    try {
      final telemetryRes = await FleetService.to.getVehicleTelemetry(vId);
      if (telemetryRes.success && telemetryRes.data != null) {
        _applyTelemetry(telemetryRes.data!, recenter: recenter);
      } else if (recenter) {
        recenterMap();
      }
    } catch (_) {
      if (recenter) recenterMap();
    }
  }

  /// Polled periodically every few seconds
  Future<void> _pollLiveTelemetry() async {
    if (vehicleId == null || vehicleId!.isEmpty) return;
    try {
      final res = await FleetService.to.getVehicleTelemetry(vehicleId!);
      if (res.success && res.data != null) {
        _applyTelemetry(res.data!, recenter: followVehicle);
      }
    } catch (_) {}
  }

  void _applyTelemetry(VehicleTelemetryModel t, {bool recenter = false}) {
    if (t.latitude != null && t.longitude != null && t.latitude != 0.0 && t.longitude != 0.0) {
      currentPosition.value = LatLng(t.latitude!, t.longitude!);
    } else if (t.positions.isNotEmpty) {
      final latest = t.positions.first;
      currentPosition.value = LatLng(latest.lat, latest.lng);
    }

    if (t.speedKmh != null) speed.value = t.speedKmh!.toInt();
    if (t.batterySocPct != null) battery.value = t.batterySocPct!;
    ignition.value = t.ignitionStatus.toUpperCase();
    if (t.heading != null) heading.value = t.heading!;
    if (t.satellites != null) satellites.value = t.satellites!;
    gpsSignal.value = (t.satellites ?? 0) > 4 ? 'Strong' : 'Active';

    // Format updated time
    final now = DateTime.now();
    lastUpdated.value = '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}:${now.second.toString().padLeft(2, '0')}';

    if (recenter) {
      _safeMove(currentPosition.value, null);
    }
  }

  void _safeMove(LatLng point, double? zoom) {
    try {
      final targetZoom = zoom ?? mapController.camera.zoom;
      mapController.move(point, targetZoom);
    } catch (_) {
      try {
        mapController.move(point, zoom ?? 15.0);
      } catch (_) {}
    }
  }

  void _setEmptyState() {
    vehicleName.value = 'No Active Vehicle';
    modelName.value = 'No live tracking stream available';
    status.value = 'OFFLINE';
    speed.value = 0;
    battery.value = 0;
    gpsSignal.value = 'No Signal';
    ignition.value = 'OFF';
    driverName.value = 'None';
    sourceLocation.value = 'N/A';
    destinationLocation.value = 'N/A';
    distanceRemainingKm.value = 0.0;
    etaMinutes.value = 0;
  }

  // ==================== MAP CONTROLS ====================

  void setMapStyle(String style) {
    mapStyle.value = style;
  }

  void recenterMap() {
    followVehicle = true;
    try {
      mapController.move(currentPosition.value, 15.0);
    } catch (_) {}
  }

  void zoomIn() {
    try {
      final currentZoom = mapController.camera.zoom;
      mapController.move(mapController.camera.center, (currentZoom + 1).clamp(3.0, 19.0));
    } catch (_) {}
  }

  void zoomOut() {
    try {
      final currentZoom = mapController.camera.zoom;
      mapController.move(mapController.camera.center, (currentZoom - 1).clamp(3.0, 19.0));
    } catch (_) {}
  }

  void fitRouteBounds() {
    followVehicle = false;
    if (routePoints.isEmpty) {
      recenterMap();
      return;
    }
    try {
      double minLat = routePoints.first.latitude;
      double maxLat = routePoints.first.latitude;
      double minLng = routePoints.first.longitude;
      double maxLng = routePoints.first.longitude;

      for (final p in routePoints) {
        if (p.latitude < minLat) minLat = p.latitude;
        if (p.latitude > maxLat) maxLat = p.latitude;
        if (p.longitude < minLng) minLng = p.longitude;
        if (p.longitude > maxLng) maxLng = p.longitude;
      }

      final centerLat = (minLat + maxLat) / 2;
      final centerLng = (minLng + maxLng) / 2;
      mapController.move(LatLng(centerLat, centerLng), 12.0);
    } catch (_) {}
  }

  // ==================== ACTIONS ====================

  Future<void> callDriver() async {
    final phone = driverPhone.value.trim();
    if (phone.isEmpty) {
      Get.snackbar(
        'driver_unavailable_title'.tr,
        'no_phone_driver_msg'.trParams({'name': driverName.value}),
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF1E293B),
        colorText: Colors.white,
      );
      return;
    }

    final uri = Uri.parse('tel:$phone');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      } else {
        Get.snackbar(
          'Phone Call',
          'Dialing $phone',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF6366F1),
          colorText: Colors.white,
        );
      }
    } catch (_) {
      Get.snackbar(
        'Phone Call',
        'Dialing $phone',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF6366F1),
        colorText: Colors.white,
      );
    }
  }

  Future<void> launchNavigation() async {
    final lat = currentPosition.value.latitude;
    final lng = currentPosition.value.longitude;
    final url = Uri.parse('https://www.google.com/maps/dir/?api=1&destination=$lat,$lng');
    try {
      if (await canLaunchUrl(url)) {
        await launchUrl(url, mode: LaunchMode.externalApplication);
      } else {
        Get.snackbar('Navigation', 'Google Maps opening for $lat, $lng');
      }
    } catch (_) {}
  }

  void goToTripDetails() {
    Get.toNamed(Routes.TRIP_DETAILS, arguments: {
      'vehicleName': vehicleName.value,
      'driverName': driverName.value,
      'vehicleId': vehicleId,
      'source': sourceLocation.value,
      'destination': destinationLocation.value,
    });
  }

  void goToTripHistory() {
    Get.toNamed(Routes.FLEET_TRIPS, arguments: {
      'vehicleId': vehicleId,
      'vehicleName': vehicleName.value,
    });
  }

  void reportEmergency() {
    Get.toNamed(Routes.FLEET_REPORT_INCIDENT, arguments: {
      'vehicleId': vehicleId,
      'vehicleName': vehicleName.value,
    });
  }

  void endTracking() {
    _telemetryTimer?.cancel();
    Get.back();
    Get.snackbar(
      'tracking_stopped_title'.tr,
      'live_tracking_ended_msg'.trParams({'veh': vehicleName.value}),
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: Colors.redAccent.withValues(alpha: 0.8),
      colorText: Colors.white,
    );
  }
}
