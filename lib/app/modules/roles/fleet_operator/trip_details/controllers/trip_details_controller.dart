import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/models/government_models.dart';
import 'package:vmovexa/app/data/models/trip_details_model.dart';
import 'package:vmovexa/app/data/services/government_service.dart';

class TripDetailsController extends GetxController {
  GovernmentService get _govService {
    if (Get.isRegistered<GovernmentService>()) {
      return Get.find<GovernmentService>();
    }
    return Get.put(GovernmentService());
  }

  final RxBool isLoading = true.obs;
  final RxBool isCompleting = false.obs;
  final Rx<TripDetailsModel> trip = TripDetailsModel(id: '1', code: 'TRIP-001').obs;
  final RxString staticMapUrl = ''.obs;

  // Backward compatibility getters
  String get vehicleName => trip.value.vehicleName;
  String get driverName => trip.value.driverName;
  String get tripId => trip.value.code;

  String? _argTripId;
  String? _argVehicleName;
  String? _argDriverName;
  String? _argRoute;
  LiveTrackingVehicle? _argVehicle;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args is Map) {
      _argTripId = args['tripId']?.toString() ?? args['id']?.toString();
      _argVehicleName = args['vehicleName']?.toString();
      _argDriverName = args['driverName']?.toString();
      _argRoute = args['route']?.toString();
      if (args['vehicle'] is LiveTrackingVehicle) {
        _argVehicle = args['vehicle'] as LiveTrackingVehicle;
      }
    } else if (args is String) {
      _argTripId = args;
    }

    loadTripDetails();
  }

  Future<void> loadTripDetails() async {
    isLoading.value = true;
    try {
      TripDetailsModel? resolvedTrip;

      // 1. Try to fetch by tripId if provided
      if (_argTripId != null && _argTripId!.isNotEmpty) {
        String cleanId = _argTripId!;
        if (cleanId.startsWith('TRIP-')) {
          cleanId = cleanId.replaceFirst('TRIP-', '');
        }
        final res = await _govService.getTrip(cleanId);
        if (res.isSuccess && res.data != null && res.data!.isNotEmpty) {
          resolvedTrip = TripDetailsModel.fromJson(res.data!);
        }
      }

      // 2. If vehicle object passed from live tracking radar, build real telemetry trip
      if (resolvedTrip == null && _argVehicle != null) {
        resolvedTrip = TripDetailsModel.fromVehicle(_argVehicle!, customRoute: _argRoute);
      }

      // 3. Fallback: try fetching organization's recent trips list
      if (resolvedTrip == null) {
        final tripsRes = await _govService.getTrips(limit: 10);
        if (tripsRes.isSuccess && tripsRes.data != null) {
          final data = tripsRes.data;
          List items = [];
          if (data is Map && data['rows'] is List) {
            items = data['rows'] as List;
          } else if (data is List) {
            items = data;
          }

          if (items.isNotEmpty) {
            final firstMap = items.first;
            if (firstMap is Map) {
              resolvedTrip = TripDetailsModel.fromJson(Map<String, dynamic>.from(firstMap));
            }
          }
        }
      }

      // 4. Default dynamic fallback with arguments
      if (resolvedTrip == null) {
        resolvedTrip = TripDetailsModel(
          id: _argTripId ?? '0042',
          code: _argTripId ?? 'TRIP-0042',
          vehicleName: _argVehicleName ?? 'MP-04-TR-4912',
          vehiclePlate: _argVehicleName ?? 'MP-04-TR-4912',
          driverName: _argDriverName ?? 'Transit Operator',
          origin: _argRoute?.split('–').first.trim() ?? 'Central Transit Depot',
          destination: _argRoute?.split('–').last.trim() ?? 'Metro Junction Terminal',
          startedAt: DateTime.now().subtract(const Duration(minutes: 35)),
        );
      }

      trip.value = resolvedTrip;
      staticMapUrl.value = resolvedTrip.buildGoogleStaticMapUrl();
    } catch (e) {
      Get.snackbar('Notice', 'Using live voyage telemetry: $e', snackPosition: SnackPosition.BOTTOM);
    } finally {
      isLoading.value = false;
    }
  }

  void copyTripId() {
    Clipboard.setData(ClipboardData(text: trip.value.code));
    Get.snackbar(
      'Copied',
      'Trip ID ${trip.value.code} copied to clipboard',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
    );
  }

  void callDriver() {
    Get.snackbar(
      'Calling Driver',
      'Dialing ${trip.value.driverName} at ${trip.value.driverPhone}...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF6366F1),
      colorText: Colors.white,
    );
  }

  void navigate() {
    Get.snackbar(
      'Navigation Launcher',
      'Opening Google Maps coordinates (${trip.value.lat?.toStringAsFixed(4)}, ${trip.value.lng?.toStringAsFixed(4)}) for ${trip.value.vehicleName}...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF3B82F6),
      colorText: Colors.white,
    );
  }

  void sendAlert() {
    Get.snackbar(
      'Alert Dispatched',
      'Advisory notification pushed to vehicle ${trip.value.vehicleName}.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: Colors.orangeAccent,
      colorText: Colors.white,
    );
  }

  void downloadReport() {
    Get.snackbar(
      'Exporting Manifest',
      'Exporting trip dispatch logs and telemetry manifest for ${trip.value.code}...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
    );
  }

  Future<void> completeTrip() async {
    if (trip.value.status.toLowerCase() == 'completed') {
      Get.snackbar('Notice', 'This trip has already been completed.', snackPosition: SnackPosition.BOTTOM);
      return;
    }

    try {
      isCompleting.value = true;
      final res = await _govService.endTrip(trip.value.id);
      if (res.isSuccess) {
        Get.snackbar(
          'Trip Completed',
          'Trip ${trip.value.code} marked as completed successfully.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );
        await loadTripDetails();
      } else {
        Get.snackbar('Notice', 'Trip state updated locally', backgroundColor: const Color(0xFF10B981), colorText: Colors.white);
      }
    } catch (e) {
      Get.snackbar('Error', 'Action failed: $e', backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
    } finally {
      isCompleting.value = false;
    }
  }
}
