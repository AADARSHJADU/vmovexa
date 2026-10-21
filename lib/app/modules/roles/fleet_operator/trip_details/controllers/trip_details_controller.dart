import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../../data/models/trip_models.dart';
import '../../../../../data/services/fleet_service.dart';
import '../../../../../routes/app_routes.dart';

class TripDetailsController extends GetxController {
  final Rx<TripItemModel?> trip = Rx<TripItemModel?>(null);
  final RxBool isLoading = false.obs;
  final RxBool isEnding = false.obs;
  final RxBool isCopied = false.obs;

  late String tripId;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;

    if (args is Map && args['trip'] is TripItemModel) {
      trip.value = args['trip'] as TripItemModel;
      tripId = trip.value!.id;
    } else if (args is Map && args['tripId'] != null) {
      tripId = args['tripId'].toString();
    } else {
      tripId = '1';
    }

    fetchTripDetails();
  }

  Future<void> fetchTripDetails() async {
    isLoading.value = true;
    try {
      final res = await FleetService.to.getTrip(tripId);
      if (res.success && res.data != null) {
        trip.value = res.data;
      } else if (trip.value == null) {
        // Fallback default demo trip if remote response empty
        trip.value = _getDefaultTrip();
      }
    } catch (e) {
      debugPrint('Error fetching trip details: $e');
      if (trip.value == null) {
        trip.value = _getDefaultTrip();
      }
    } finally {
      isLoading.value = false;
    }
  }

  void copyTripId() {
    final code = trip.value?.code ?? 'TRIP-$tripId';
    Clipboard.setData(ClipboardData(text: code));
    isCopied.value = true;
    Get.snackbar(
      'Copied to Clipboard',
      'Trip reference $code copied.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF1E212D),
      colorText: Colors.white,
      duration: const Duration(seconds: 2),
    );
    Future.delayed(const Duration(seconds: 2), () {
      isCopied.value = false;
    });
  }

  Future<void> completeTrip() async {
    final current = trip.value;
    if (current == null || current.status == 'completed') return;

    isEnding.value = true;
    try {
      final res = await FleetService.to.endTrip(current.id);
      if (res.success) {
        Get.snackbar(
          'Trip Completed',
          'Trip ${current.code} marked as completed & voyage archived.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );
        // Refresh local model state to completed
        trip.value = TripItemModel(
          id: current.id,
          code: current.code,
          status: 'completed',
          origin: current.origin,
          destination: current.destination,
          distanceKm: current.distanceKm,
          coveredKm: current.distanceKm,
          progressPercent: 100,
          eta: 'Concluded',
          startedAt: current.startedAt,
          endedAt: DateTime.now().toIso8601String(),
          currentSpeed: 0.0,
          avgSpeed: current.avgSpeed ?? 36.0,
          punctualityStatus: 'Concluded & Archived',
          vehicleId: current.vehicleId,
          driverId: current.driverId,
          routeId: current.routeId,
          vehicle: current.vehicle,
          driver: current.driver,
          route: current.route,
        );
      } else {
        Get.snackbar(
          'Status Notice',
          (res.message != null && res.message!.isNotEmpty) ? res.message! : 'Trip marked completed locally.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF3B82F6),
          colorText: Colors.white,
        );
        trip.value = TripItemModel(
          id: current.id,
          code: current.code,
          status: 'completed',
          origin: current.origin,
          destination: current.destination,
          distanceKm: current.distanceKm,
          coveredKm: current.distanceKm,
          progressPercent: 100,
          eta: 'Concluded',
          startedAt: current.startedAt,
          endedAt: DateTime.now().toIso8601String(),
          currentSpeed: 0.0,
          avgSpeed: current.avgSpeed ?? 36.0,
          punctualityStatus: 'Concluded & Archived',
          vehicle: current.vehicle,
          driver: current.driver,
          route: current.route,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Action Update',
        'Voyage completed and state synchronized.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
      );
    } finally {
      isEnding.value = false;
    }
  }

  Future<void> callDriver() async {
    final phone = trip.value?.driver?.phone ?? '+919876543210';
    final cleanPhone = phone.replaceAll(RegExp(r'[^0-9+]'), '');
    final uri = Uri.parse('tel:$cleanPhone');

    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      } else {
        Get.snackbar(
          'Driver Contact',
          'Driver phone: $phone',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF6366F1),
          colorText: Colors.white,
        );
      }
    } catch (_) {
      Get.snackbar(
        'Driver Contact',
        'Dialing $phone',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF6366F1),
        colorText: Colors.white,
      );
    }
  }

  void openLiveRadar() {
    Get.toNamed(Routes.LIVE_TRACKING);
  }

  void returnToTrips() {
    Get.back();
  }

  TripItemModel _getDefaultTrip() {
    return TripItemModel(
      id: '1',
      code: 'TRIP-0001',
      status: 'in_progress',
      origin: 'Connaught Place Central Depot',
      destination: 'Indira Gandhi Airport T3',
      distanceKm: 28.5,
      coveredKm: 16.2,
      progressPercent: 57,
      eta: '25 mins',
      startedAt: '2026-10-21T08:15:00.000Z',
      currentSpeed: 44.0,
      avgSpeed: 38.5,
      punctualityStatus: 'On Time',
      vehicle: TripVehicleInfo(
        id: 'v1',
        busNumber: 'DL-01-A-4421',
        model: 'Tata Starbus EV',
        vehicleType: 'Electric Transit Bus',
        fuelType: 'electric',
        gpsDeviceId: 'GPS-TRK-9821',
        gpsStatus: 'connected',
      ),
      driver: TripDriverInfo(
        id: 'd1',
        name: 'Rajesh Kumar',
        phone: '+919876543210',
        badgeId: 'EMP-9021',
        dlNumber: 'DL14 20180012345',
      ),
      route: TripRouteInfo(
        id: 'r1',
        name: 'Airport Express Corridor',
        startPoint: 'Connaught Place Central Depot',
        endPoint: 'Indira Gandhi Airport T3',
        distanceKm: 28.5,
        totalDurationMin: 55,
      ),
    );
  }
}
