import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../routes/app_routes.dart';
import '../../../../../data/services/fleet_service.dart';

class LiveTrackingController extends GetxController {
  final RxString vehicleName = ''.obs;
  final RxString modelName = ''.obs;
  final RxString status = 'Connecting...'.obs;

  final RxInt speed = 0.obs;
  final RxInt battery = 0.obs;
  final RxString gpsSignal = 'Searching...'.obs;
  final RxString ignition = 'OFF'.obs;

  final RxString driverName = 'Unassigned'.obs;
  final RxString driverPhone = ''.obs;
  final RxBool isLoading = false.obs;
  String? vehicleId;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args is Map) {
      if (args['vehicleId'] != null) vehicleId = args['vehicleId'].toString();
      if (args['vehicleName'] != null) vehicleName.value = args['vehicleName'];
      if (args['driverName'] != null) driverName.value = args['driverName'];
    }
    loadLiveTrackingData();
  }

  Future<void> loadLiveTrackingData() async {
    isLoading.value = true;
    try {
      if (vehicleId != null && vehicleId!.isNotEmpty) {
        final res = await FleetService.to.getVehicle(vehicleId!);
        if (res.success && res.data != null) {
          final v = res.data!;
          vehicleName.value = v.registrationNumber;
          modelName.value = [v.make, v.model].where((s) => s.isNotEmpty).join(' ');
          status.value = v.status.toUpperCase();
          speed.value = (v.speedKmh ?? 0).toInt();
          battery.value = v.batterySocPct ?? 0;
          driverName.value = v.assignedDriverName ?? 'Unassigned';
          driverPhone.value = v.driverPhone ?? '';
          gpsSignal.value = v.gpsDeviceId != null ? 'Connected' : 'No GPS';
          ignition.value = v.status.toLowerCase() == 'on_route' ? 'ON' : 'OFF';
          return;
        }
      }

      // Fetch on-route or active vehicles from backend
      final vRes = await FleetService.to.getVehicles(limit: 50);
      if (vRes.success && vRes.data != null && vRes.data!.isNotEmpty) {
        final activeV = vRes.data!.firstWhereOrNull((v) => v.status.toLowerCase() == 'on_route') ?? vRes.data!.first;
        vehicleId = activeV.id;
        vehicleName.value = activeV.registrationNumber;
        modelName.value = [activeV.make, activeV.model].where((s) => s.isNotEmpty).join(' ');
        status.value = activeV.status.toUpperCase();
        speed.value = (activeV.speedKmh ?? 0).toInt();
        battery.value = activeV.batterySocPct ?? 0;
        driverName.value = activeV.assignedDriverName ?? 'Unassigned';
        driverPhone.value = activeV.driverPhone ?? '';
        gpsSignal.value = activeV.gpsDeviceId != null ? 'Connected' : 'No GPS';
        ignition.value = activeV.status.toLowerCase() == 'on_route' ? 'ON' : 'OFF';
      } else {
        vehicleName.value = 'No Active Vehicle';
        modelName.value = 'No live tracking stream available';
        status.value = 'OFFLINE';
        speed.value = 0;
        battery.value = 0;
        gpsSignal.value = 'No Signal';
        ignition.value = 'OFF';
        driverName.value = 'None';
      }
    } catch (_) {
      status.value = 'OFFLINE';
    } finally {
      isLoading.value = false;
    }
  }

  void callDriver() {
    if (driverPhone.value.isEmpty) {
      Get.snackbar(
        'driver_unavailable_title'.tr,
        'no_phone_driver_msg'.trParams({'name': driverName.value}),
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF1E293B),
        colorText: Colors.white,
      );
      return;
    }
    Get.snackbar(
      'calling_driver_title'.tr,
      'Dialing ${driverName.value} at ${driverPhone.value}...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF6366F1),
      colorText: Colors.white,
    );
  }

  void endTracking() {
    Get.back();
    Get.snackbar(
      'tracking_stopped_title'.tr,
      'live_tracking_ended_msg'.trParams({'veh': vehicleName.value}),
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: Colors.redAccent.withValues(alpha: 0.8),
      colorText: Colors.white,
    );
  }

  void goToTripDetails() {
    Get.toNamed(Routes.TRIP_DETAILS, arguments: {
      'vehicleName': vehicleName.value,
      'driverName': driverName.value,
    });
  }
}
