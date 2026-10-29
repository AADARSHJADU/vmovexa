import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/models/government_models.dart';
import 'package:vmovexa/app/data/services/government_service.dart';
import '../../../../../routes/app_routes.dart';

class LiveTrackingController extends GetxController {
  GovernmentService get _govService {
    if (Get.isRegistered<GovernmentService>()) {
      return Get.find<GovernmentService>();
    }
    return Get.put(GovernmentService());
  }

  // Live state observables
  final RxBool isLoading = true.obs;
  final RxBool isRefreshing = false.obs;
  final Rx<LiveTrackingDataModel> trackingData = LiveTrackingDataModel().obs;
  final RxList<LiveTrackingVehicle> vehicles = <LiveTrackingVehicle>[].obs;
  final RxList<LiveTrackingVehicle> filteredVehicles = <LiveTrackingVehicle>[].obs;
  final RxList<TrackingRouteModel> routes = <TrackingRouteModel>[].obs;

  // Filters & controls
  final RxString selectedRouteId = 'all'.obs;
  final RxString selectedStatus = 'All'.obs; // 'All', 'Broadcasting', 'Standby', 'Offline'
  final RxString searchQuery = ''.obs;
  final Rx<LiveTrackingVehicle?> selectedVehicle = Rx<LiveTrackingVehicle?>(null);
  final RxInt zoomLevel = 13.obs;
  final RxString mapType = 'roadmap'.obs; // 'roadmap', 'satellite'
  final RxString staticMapUrl = ''.obs;

  // Search text editing controller
  final TextEditingController searchController = TextEditingController();

  // Backward compatibility fields for legacy references
  final RxString vehicleName = ''.obs;
  final RxString modelName = 'Transit Bus'.obs;
  final RxString status = 'Online'.obs;
  final RxInt speed = 0.obs;
  final RxInt battery = 88.obs;
  final RxString gpsSignal = 'Strong'.obs;
  final RxString ignition = 'ON'.obs;
  final RxString driverName = 'Transit Operator'.obs;
  final RxString driverPhone = '+91 98765 43210'.obs;

  String? _initialVehicleNameArg;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args is Map) {
      if (args['vehicleName'] != null) {
        _initialVehicleNameArg = args['vehicleName'].toString();
        vehicleName.value = _initialVehicleNameArg!;
      }
      if (args['driverName'] != null) {
        driverName.value = args['driverName'].toString();
      }
    }
    loadTrackingData();
    loadRoutes();
  }

  @override
  void onClose() {
    searchController.dispose();
    super.onClose();
  }

  Future<void> loadTrackingData({bool showIndicator = true}) async {
    if (showIndicator) isLoading.value = true;
    try {
      final routeParam = selectedRouteId.value == 'all' ? null : selectedRouteId.value;
      final res = await _govService.getLiveTracking(routeId: routeParam);
      if (res.isSuccess && res.data != null) {
        trackingData.value = res.data!;
        vehicles.value = res.data!.vehicles;
      } else {
        vehicles.value = [];
      }
      _applyFilter();

      // If initial vehicle was provided in arguments, try to match it
      if (_initialVehicleNameArg != null && _initialVehicleNameArg!.isNotEmpty) {
        final matched = vehicles.firstWhereOrNull(
          (v) => v.busNumber.toLowerCase() == _initialVehicleNameArg!.toLowerCase() ||
              v.id.toLowerCase() == _initialVehicleNameArg!.toLowerCase(),
        );
        if (matched != null) {
          selectVehicle(matched);
          return;
        }
      }

      // If current selection is still in filtered list keep it, otherwise pick first
      if (selectedVehicle.value == null || !filteredVehicles.contains(selectedVehicle.value)) {
        if (filteredVehicles.isNotEmpty) {
          selectVehicle(filteredVehicles.first);
        } else if (vehicles.isNotEmpty) {
          selectVehicle(vehicles.first);
        }
      } else {
        _syncCompatibility(selectedVehicle.value!);
        _updateMapUrl();
      }
    } catch (e) {
      Get.snackbar('Notice', 'Failed to fetch live vehicle tracking: $e', snackPosition: SnackPosition.BOTTOM);
    } finally {
      isLoading.value = false;
      isRefreshing.value = false;
    }
  }

  Future<void> loadRoutes() async {
    try {
      final res = await _govService.getTrackingRoutes();
      if (res.isSuccess && res.data != null) {
        routes.value = res.data!;
      }
    } catch (_) {}
  }

  void _applyFilter() {
    final q = searchQuery.value.trim().toLowerCase();
    final statusFilter = selectedStatus.value;

    final list = vehicles.where((v) {
      final matchStatus = statusFilter == 'All' ||
          v.screenStatus.toLowerCase() == statusFilter.toLowerCase();

      final matchSearch = q.isEmpty ||
          v.busNumber.toLowerCase().contains(q) ||
          v.id.toLowerCase().contains(q) ||
          v.displayDriver.toLowerCase().contains(q) ||
          v.displayRoute.toLowerCase().contains(q);

      return matchStatus && matchSearch;
    }).toList();

    filteredVehicles.value = list;
  }

  void selectVehicle(LiveTrackingVehicle v) {
    selectedVehicle.value = v;
    _syncCompatibility(v);
    _updateMapUrl();
  }

  void _syncCompatibility(LiveTrackingVehicle v) {
    vehicleName.value = v.busNumber;
    modelName.value = v.displayRoute;
    status.value = v.screenStatus;
    speed.value = (v.speed ?? 0).toInt();
    driverName.value = v.displayDriver;
  }

  void changeRoute(String routeId) {
    selectedRouteId.value = routeId;
    loadTrackingData();
  }

  void changeStatus(String status) {
    selectedStatus.value = status;
    _applyFilter();
    if (filteredVehicles.isNotEmpty && (selectedVehicle.value == null || !filteredVehicles.contains(selectedVehicle.value))) {
      selectVehicle(filteredVehicles.first);
    } else {
      _updateMapUrl();
    }
  }

  void onSearchChanged(String query) {
    searchQuery.value = query;
    _applyFilter();
    _updateMapUrl();
  }

  void zoomIn() {
    if (zoomLevel.value < 18) {
      zoomLevel.value++;
      _updateMapUrl();
    }
  }

  void zoomOut() {
    if (zoomLevel.value > 8) {
      zoomLevel.value--;
      _updateMapUrl();
    }
  }

  void toggleMapType() {
    mapType.value = mapType.value == 'roadmap' ? 'satellite' : 'roadmap';
    _updateMapUrl();
  }

  void recenterMap() {
    zoomLevel.value = 13;
    _updateMapUrl();
  }

  void _updateMapUrl() {
    final vList = filteredVehicles.where((v) => v.lat != null && v.lng != null).toList();
    final current = selectedVehicle.value;

    final centerLat = current?.lat ?? (vList.isNotEmpty ? vList.first.lat : 23.2599);
    final centerLng = current?.lng ?? (vList.isNotEmpty ? vList.first.lng : 77.4126);

    final markers = <GoogleMapMarker>[];
    for (final v in vList.take(25)) {
      final isCurrent = current != null && v.id == current.id;
      final color = isCurrent
          ? 'blue'
          : (v.screenStatus == 'Broadcasting' ? 'green' : (v.screenStatus == 'Standby' ? 'orange' : 'gray'));
      final label = isCurrent
          ? 'S'
          : (v.busNumber.isNotEmpty ? v.busNumber.substring(0, 1).toUpperCase() : 'B');

      markers.add(
        GoogleMapMarker(
          lat: v.lat!,
          lng: v.lng!,
          color: color,
          label: label,
        ),
      );
    }

    staticMapUrl.value = ApiConstants.buildGoogleStaticMapUrl(
      centerLat: centerLat,
      centerLng: centerLng,
      zoom: zoomLevel.value,
      width: 700,
      height: 480,
      mapType: mapType.value,
      markers: markers,
    );
  }

  Future<void> refreshTracking() async {
    isRefreshing.value = true;
    await loadTrackingData(showIndicator: false);
  }

  void callDriver() {
    final name = selectedVehicle.value?.displayDriver ?? driverName.value;
    Get.snackbar(
      'Calling Driver',
      'Connecting to $name...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF6366F1),
      colorText: Colors.white,
    );
  }

  void endTracking() {
    Get.back();
  }

  void goToTripDetails() {
    Get.toNamed(Routes.TRIP_DETAILS, arguments: {
      'vehicleName': selectedVehicle.value?.busNumber ?? vehicleName.value,
      'driverName': selectedVehicle.value?.displayDriver ?? driverName.value,
      'route': selectedVehicle.value?.displayRoute,
    });
  }
}
