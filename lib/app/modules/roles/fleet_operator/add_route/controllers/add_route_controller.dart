import 'dart:math';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../data/models/fleet_models.dart';
import '../../../../../data/services/fleet_service.dart';

class StopFormItem {
  final String id;
  final TextEditingController nameController;
  final TextEditingController addressController;
  final TextEditingController latController;
  final TextEditingController lngController;
  final TextEditingController etaController;
  final TextEditingController distanceController;
  final TextEditingController geofenceController;
  final TextEditingController haltReasonController;

  StopFormItem({
    required this.id,
    String name = '',
    String address = '',
    String lat = '',
    String lng = '',
    String eta = '',
    String distance = '',
    String geofence = '50',
    String haltReason = '',
  })  : nameController = TextEditingController(text: name),
        addressController = TextEditingController(text: address),
        latController = TextEditingController(text: lat),
        lngController = TextEditingController(text: lng),
        etaController = TextEditingController(text: eta),
        distanceController = TextEditingController(text: distance),
        geofenceController = TextEditingController(text: geofence),
        haltReasonController = TextEditingController(text: haltReason);

  void dispose() {
    nameController.dispose();
    addressController.dispose();
    latController.dispose();
    lngController.dispose();
    etaController.dispose();
    distanceController.dispose();
    geofenceController.dispose();
    haltReasonController.dispose();
  }
}

class AddRouteController extends GetxController {
  final RxBool isEditMode = false.obs;
  final RxBool isLoading = false.obs;
  final RxBool isComputingRoute = false.obs;
  dynamic editRouteId;

  // Route Identity
  final nameController = TextEditingController();
  final codeController = TextEditingController();
  final RxString status = 'active'.obs;

  // Origin (Start Point)
  final startPointController = TextEditingController();
  final startAddressController = TextEditingController();
  final startLatController = TextEditingController();
  final startLngController = TextEditingController();
  final startCityController = TextEditingController();
  final startStateController = TextEditingController();

  // Destination (End Point)
  final endPointController = TextEditingController();
  final endAddressController = TextEditingController();
  final endLatController = TextEditingController();
  final endLngController = TextEditingController();
  final endCityController = TextEditingController();
  final endStateController = TextEditingController();

  // Coordinates observables for live Map preview
  final RxDouble startLat = 0.0.obs;
  final RxDouble startLng = 0.0.obs;
  final RxDouble endLat = 0.0.obs;
  final RxDouble endLng = 0.0.obs;
  final RxString polyline = ''.obs;

  // Metrics
  final distanceController = TextEditingController();
  final durationController = TextEditingController();

  // Stops List
  final RxList<StopFormItem> stops = <StopFormItem>[].obs;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args != null && args is RouteItemModel) {
      isEditMode.value = true;
      editRouteId = args.id;
      _populateFromRoute(args);
    } else if (args != null && args is Map) {
      isEditMode.value = true;
      editRouteId = args['id'];
      _populateFromMap(Map<String, dynamic>.from(args));
    } else {
      isEditMode.value = false;
      final rand = 1000 + Random().nextInt(9000);
      codeController.text = 'RTE-$rand';
    }
  }

  @override
  void onClose() {
    nameController.dispose();
    codeController.dispose();
    startPointController.dispose();
    startAddressController.dispose();
    startLatController.dispose();
    startLngController.dispose();
    startCityController.dispose();
    startStateController.dispose();
    endPointController.dispose();
    endAddressController.dispose();
    endLatController.dispose();
    endLngController.dispose();
    endCityController.dispose();
    endStateController.dispose();
    distanceController.dispose();
    durationController.dispose();

    for (final s in stops) {
      s.dispose();
    }
    super.onClose();
  }

  void _populateFromRoute(RouteItemModel route) {
    nameController.text = route.name;
    codeController.text = route.code;
    status.value = route.status.isNotEmpty ? route.status : 'active';

    startPointController.text = route.startPoint;
    startAddressController.text = route.startFullAddress ?? '';
    startLatController.text = route.startLatitude != null ? route.startLatitude.toString() : '';
    startLngController.text = route.startLongitude != null ? route.startLongitude.toString() : '';
    startCityController.text = route.startCity ?? '';
    startStateController.text = route.startState ?? '';

    endPointController.text = route.endPoint;
    endAddressController.text = route.endFullAddress ?? '';
    endLatController.text = route.endLatitude != null ? route.endLatitude.toString() : '';
    endLngController.text = route.endLongitude != null ? route.endLongitude.toString() : '';
    endCityController.text = route.endCity ?? '';
    endStateController.text = route.endState ?? '';

    startLat.value = route.startLatitude ?? 0.0;
    startLng.value = route.startLongitude ?? 0.0;
    endLat.value = route.endLatitude ?? 0.0;
    endLng.value = route.endLongitude ?? 0.0;
    polyline.value = route.polyline ?? '';

    distanceController.text = route.totalDistanceKm > 0 ? route.totalDistanceKm.toString() : '';
    durationController.text = route.totalDurationMin > 0 ? route.totalDurationMin.toString() : '';

    stops.clear();
    for (final s in route.stops) {
      stops.add(
        StopFormItem(
          id: s.id.toString(),
          name: s.name,
          address: s.fullAddress.isNotEmpty ? s.fullAddress : s.address,
          lat: s.latitude != null ? s.latitude.toString() : '',
          lng: s.longitude != null ? s.longitude.toString() : '',
          eta: s.eta,
          distance: s.distanceKm > 0 ? s.distanceKm.toString() : '',
          geofence: s.geofenceRadius.toString(),
          haltReason: s.haltReason,
        ),
      );
    }
  }

  void _populateFromMap(Map<String, dynamic> data) {
    nameController.text = (data['name'] ?? '').toString();
    codeController.text = (data['code'] ?? '').toString();
    status.value = (data['status'] ?? 'active').toString();

    startPointController.text = (data['start_point'] ?? data['origin'] ?? '').toString();
    startAddressController.text = (data['start_full_address'] ?? '').toString();
    startLatController.text = data['start_latitude'] != null ? data['start_latitude'].toString() : '';
    startLngController.text = data['start_longitude'] != null ? data['start_longitude'].toString() : '';
    startCityController.text = (data['start_city'] ?? '').toString();
    startStateController.text = (data['start_state'] ?? '').toString();

    endPointController.text = (data['end_point'] ?? data['destination'] ?? '').toString();
    endAddressController.text = (data['end_full_address'] ?? '').toString();
    endLatController.text = data['end_latitude'] != null ? data['end_latitude'].toString() : '';
    endLngController.text = data['end_longitude'] != null ? data['end_longitude'].toString() : '';
    endCityController.text = (data['end_city'] ?? '').toString();
    endStateController.text = (data['end_state'] ?? '').toString();

    startLat.value = double.tryParse(startLatController.text.trim()) ?? 0.0;
    startLng.value = double.tryParse(startLngController.text.trim()) ?? 0.0;
    endLat.value = double.tryParse(endLatController.text.trim()) ?? 0.0;
    endLng.value = double.tryParse(endLngController.text.trim()) ?? 0.0;
    polyline.value = (data['polyline'] ?? '').toString();

    distanceController.text = data['distance_km'] != null ? data['distance_km'].toString() : '';
    durationController.text = data['total_duration_min'] != null ? data['total_duration_min'].toString() : '';

    stops.clear();
    if (data['stops'] is List) {
      for (final s in data['stops']) {
        if (s is Map) {
          stops.add(
            StopFormItem(
              id: (s['id'] ?? 'temp-${DateTime.now().millisecondsSinceEpoch}').toString(),
              name: (s['name'] ?? '').toString(),
              address: (s['full_address'] ?? s['address'] ?? '').toString(),
              lat: s['latitude'] != null ? s['latitude'].toString() : '',
              lng: s['longitude'] != null ? s['longitude'].toString() : '',
              eta: (s['eta'] ?? '').toString(),
              distance: s['distance_km'] != null ? s['distance_km'].toString() : '',
              geofence: (s['geofence_radius'] ?? '50').toString(),
              haltReason: (s['halt_reason'] ?? '').toString(),
            ),
          );
        }
      }
    }
  }

  void addStop() {
    stops.add(
      StopFormItem(
        id: 'stop-${DateTime.now().millisecondsSinceEpoch}-${stops.length + 1}',
        name: '',
        address: '',
        geofence: '50',
      ),
    );
  }

  void removeStop(int index) {
    if (index >= 0 && index < stops.length) {
      final item = stops.removeAt(index);
      item.dispose();
      // Recalculate route path when a stop is removed
      if (startLat.value != 0 && endLat.value != 0) {
        computeGoogleDrivingRoute(isManual: false);
      }
    }
  }

  // --- GOOGLE PLACES SELECTION HANDLERS ---
  void onOriginPlaceSelected(GooglePlaceItemModel place) {
    startPointController.text = place.name;
    startAddressController.text = place.formattedAddress;
    if (place.latitude != null) {
      startLatController.text = place.latitude.toString();
      startLat.value = place.latitude!;
    }
    if (place.longitude != null) {
      startLngController.text = place.longitude.toString();
      startLng.value = place.longitude!;
    }
    if (place.city != null) startCityController.text = place.city!;
    if (place.state != null) startStateController.text = place.state!;

    if (endLatController.text.isNotEmpty && endLngController.text.isNotEmpty) {
      computeGoogleDrivingRoute(isManual: false);
    }
  }

  void onDestinationPlaceSelected(GooglePlaceItemModel place) {
    endPointController.text = place.name;
    endAddressController.text = place.formattedAddress;
    if (place.latitude != null) {
      endLatController.text = place.latitude.toString();
      endLat.value = place.latitude!;
    }
    if (place.longitude != null) {
      endLngController.text = place.longitude.toString();
      endLng.value = place.longitude!;
    }
    if (place.city != null) endCityController.text = place.city!;
    if (place.state != null) endStateController.text = place.state!;

    if (startLatController.text.isNotEmpty && startLngController.text.isNotEmpty) {
      computeGoogleDrivingRoute(isManual: false);
    }
  }

  void onStopPlaceSelected(int index, GooglePlaceItemModel place) {
    if (index >= 0 && index < stops.length) {
      final s = stops[index];
      s.nameController.text = place.name;
      s.addressController.text = place.formattedAddress;
      if (place.latitude != null) s.latController.text = place.latitude.toString();
      if (place.longitude != null) s.lngController.text = place.longitude.toString();

      if (startLatController.text.isNotEmpty && endLatController.text.isNotEmpty) {
        computeGoogleDrivingRoute(isManual: false);
      }
    }
  }

  // --- GOOGLE ROUTES DRIVING PATH COMPUTATION ---
  Future<void> computeGoogleDrivingRoute({bool isManual = true}) async {
    final sLat = double.tryParse(startLatController.text.trim());
    final sLng = double.tryParse(startLngController.text.trim());
    final eLat = double.tryParse(endLatController.text.trim());
    final eLng = double.tryParse(endLngController.text.trim());

    if (sLat == null || sLng == null || eLat == null || eLng == null) {
      if (isManual) {
        Get.snackbar(
          'Coordinates Needed',
          'Please select or enter valid GPS coordinates for both Origin and Destination.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.amber,
          colorText: Colors.black,
        );
      }
      return;
    }

    startLat.value = sLat;
    startLng.value = sLng;
    endLat.value = eLat;
    endLng.value = eLng;

    isComputingRoute.value = true;
    try {
      final List<Map<String, double>> intermediates = [];
      for (final s in stops) {
        final stLat = double.tryParse(s.latController.text.trim());
        final stLng = double.tryParse(s.lngController.text.trim());
        if (stLat != null && stLng != null) {
          intermediates.add({'lat': stLat, 'lng': stLng});
        }
      }

      final res = await FleetService.to.computeGoogleRoute(
        startLat: sLat,
        startLng: sLng,
        endLat: eLat,
        endLng: eLng,
        intermediates: intermediates,
      );

      if (res.success && res.data != null) {
        final data = res.data!;
        distanceController.text = data.distanceKm.toString();
        durationController.text = data.durationMinutes.toString();
        polyline.value = data.polyline;

        // If Google Routes returned leg details, update intermediate stops' distance & ETA
        if (data.legs.isNotEmpty) {
          double accumulatedKm = 0;
          int accumulatedMins = 0;
          for (int i = 0; i < stops.length; i++) {
            if (i < data.legs.length) {
              final leg = data.legs[i];
              double legKm = 0.0;
              int legMins = 0;
              if (leg is Map) {
                if (leg['distanceMeters'] != null) {
                  legKm = (double.tryParse(leg['distanceMeters'].toString()) ?? 0.0) / 1000.0;
                }
                if (leg['staticDuration'] != null) {
                  final durSec = int.tryParse(leg['staticDuration'].toString().replaceAll('s', '')) ?? 0;
                  legMins = (durSec / 60).round();
                }
              }
              accumulatedKm += legKm;
              accumulatedMins += legMins;

              if (stops[i].distanceController.text.isEmpty || isManual) {
                stops[i].distanceController.text = accumulatedKm.toStringAsFixed(1);
              }
              if (stops[i].etaController.text.isEmpty || isManual) {
                stops[i].etaController.text = '+$accumulatedMins mins';
              }
            }
          }
        }

        if (isManual) {
          Get.snackbar(
            'Google Routes Computed',
            'Driving corridor: ${data.distanceKm} km, ~${data.durationMinutes} mins travel time.',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
          );
        }
      } else {
        if (isManual) autoEstimateMetrics();
      }
    } catch (e) {
      if (isManual) autoEstimateMetrics();
    } finally {
      isComputingRoute.value = false;
    }
  }

  void autoEstimateMetrics() {
    final sLat = double.tryParse(startLatController.text.trim());
    final sLng = double.tryParse(startLngController.text.trim());
    final eLat = double.tryParse(endLatController.text.trim());
    final eLng = double.tryParse(endLngController.text.trim());

    if (sLat == null || sLng == null || eLat == null || eLng == null) {
      Get.snackbar(
        'Coordinates Needed',
        'Please enter valid Latitude & Longitude for both Origin and Destination first.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.amber,
        colorText: Colors.black,
      );
      return;
    }

    startLat.value = sLat;
    startLng.value = sLng;
    endLat.value = eLat;
    endLng.value = eLng;

    double totalKm = 0;
    double lastLat = sLat;
    double lastLng = sLng;

    for (int i = 0; i < stops.length; i++) {
      final st = stops[i];
      final stLat = double.tryParse(st.latController.text.trim());
      final stLng = double.tryParse(st.lngController.text.trim());
      if (stLat != null && stLng != null) {
        final legKm = _haversineDistance(lastLat, lastLng, stLat, stLng) * 1.35;
        totalKm += legKm;
        lastLat = stLat;
        lastLng = stLng;

        if (st.distanceController.text.isEmpty) {
          st.distanceController.text = totalKm.toStringAsFixed(1);
        }
        if (st.etaController.text.isEmpty) {
          final estMins = (totalKm / 25.0 * 60.0).round();
          st.etaController.text = '+$estMins mins';
        }
      }
    }

    final finalLeg = _haversineDistance(lastLat, lastLng, eLat, eLng) * 1.35;
    totalKm += finalLeg;

    final estTotalMins = (totalKm / 25.0 * 60.0).round() + (stops.length * 2);

    distanceController.text = totalKm.toStringAsFixed(1);
    durationController.text = estTotalMins.toString();

    Get.snackbar(
      'Estimated Route Metrics',
      'Corridor distance: ${totalKm.toStringAsFixed(1)} km, ~$estTotalMins mins travel time.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
    );
  }

  double _haversineDistance(double lat1, double lon1, double lat2, double lon2) {
    const p = 0.017453292519943295;
    final a = 0.5 - cos((lat2 - lat1) * p) / 2 + cos(lat1 * p) * cos(lat2 * p) * (1 - cos((lon2 - lon1) * p)) / 2;
    return 12742 * asin(sqrt(a));
  }

  List<Map<String, dynamic>> get currentStopsCoordinates {
    final list = <Map<String, dynamic>>[];
    for (final s in stops) {
      final stLat = double.tryParse(s.latController.text.trim());
      final stLng = double.tryParse(s.lngController.text.trim());
      if (stLat != null && stLng != null) {
        list.add({
          'latitude': stLat,
          'longitude': stLng,
          'name': s.nameController.text.trim(),
        });
      }
    }
    return list;
  }

  Future<void> saveRoute() async {
    final name = nameController.text.trim();
    final sPoint = startPointController.text.trim();
    final ePoint = endPointController.text.trim();

    if (name.isEmpty) {
      Get.snackbar('Validation Error', 'Route name is required',
          snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.redAccent, colorText: Colors.white);
      return;
    }
    if (sPoint.isEmpty) {
      Get.snackbar('Validation Error', 'Origin station name is required',
          snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.redAccent, colorText: Colors.white);
      return;
    }
    if (ePoint.isEmpty) {
      Get.snackbar('Validation Error', 'Destination station name is required',
          snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.redAccent, colorText: Colors.white);
      return;
    }

    isLoading.value = true;
    try {
      final sLat = double.tryParse(startLatController.text.trim());
      final sLng = double.tryParse(startLngController.text.trim());
      final eLat = double.tryParse(endLatController.text.trim());
      final eLng = double.tryParse(endLngController.text.trim());
      final distKm = double.tryParse(distanceController.text.trim());
      final durMin = int.tryParse(durationController.text.trim());

      final List<Map<String, dynamic>> stopsPayload = [];
      for (int i = 0; i < stops.length; i++) {
        final s = stops[i];
        final stopName = s.nameController.text.trim();
        final stopLat = double.tryParse(s.latController.text.trim());
        final stopLng = double.tryParse(s.lngController.text.trim());
        final stopDist = double.tryParse(s.distanceController.text.trim());
        final stopGeofence = int.tryParse(s.geofenceController.text.trim()) ?? 50;

        stopsPayload.add({
          'name': stopName.isNotEmpty ? stopName : 'Waypoint ${i + 1}',
          'address': s.addressController.text.trim().isNotEmpty ? s.addressController.text.trim() : null,
          'full_address': s.addressController.text.trim().isNotEmpty ? s.addressController.text.trim() : null,
          'type': 'waypoint',
          'sequence': i + 1,
          'latitude': ?stopLat,
          'longitude': ?stopLng,
          'distance_km': ?stopDist,
          'geofence_radius': stopGeofence,
          'eta': s.etaController.text.trim().isNotEmpty ? s.etaController.text.trim() : null,
          'halt_reason': s.haltReasonController.text.trim().isNotEmpty ? s.haltReasonController.text.trim() : null,
        });
      }

      final payload = <String, dynamic>{
        'name': name,
        'code': codeController.text.trim().isNotEmpty ? codeController.text.trim() : 'RTE-${Random().nextInt(9000) + 1000}',
        'start_point': sPoint,
        'start_full_address': startAddressController.text.trim().isNotEmpty ? startAddressController.text.trim() : sPoint,
        'start_city': startCityController.text.trim().isNotEmpty ? startCityController.text.trim() : null,
        'start_state': startStateController.text.trim().isNotEmpty ? startStateController.text.trim() : null,
        'start_latitude': ?sLat,
        'start_longitude': ?sLng,
        'end_point': ePoint,
        'end_full_address': endAddressController.text.trim().isNotEmpty ? endAddressController.text.trim() : ePoint,
        'end_city': endCityController.text.trim().isNotEmpty ? endCityController.text.trim() : null,
        'end_state': endStateController.text.trim().isNotEmpty ? endStateController.text.trim() : null,
        'end_latitude': ?eLat,
        'end_longitude': ?eLng,
        'distance_km': ?distKm,
        'total_distance_km': ?distKm,
        'total_duration_min': durMin ?? 0,
        if (polyline.value.isNotEmpty) 'polyline': polyline.value,
        'status': status.value,
        'stops': stopsPayload,
      };

      if (isEditMode.value && editRouteId != null) {
        final res = await FleetService.to.updateRoute(editRouteId.toString(), payload);
        if (res.success) {
          Get.back(result: true);
          Get.snackbar(
            'Route Updated',
            'Transit Route "$name" was successfully updated.',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
          );
        } else {
          Get.snackbar(
            'Update Failed',
            res.message ?? 'Failed to update route',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: Colors.redAccent,
            colorText: Colors.white,
          );
        }
      } else {
        final res = await FleetService.to.addRoute(payload);
        if (res.success) {
          Get.back(result: true);
          Get.snackbar(
            'Route Created',
            'Transit Route "$name" has been created and registered.',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
          );
        } else {
          Get.snackbar(
            'Create Failed',
            res.message ?? 'Failed to create route',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: Colors.redAccent,
            colorText: Colors.white,
          );
        }
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        e.toString(),
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
    } finally {
      isLoading.value = false;
    }
  }
}
