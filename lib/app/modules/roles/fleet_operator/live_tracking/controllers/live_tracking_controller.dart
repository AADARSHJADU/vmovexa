import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../routes/app_routes.dart';

class LiveTrackingController extends GetxController {
  final RxString vehicleName = 'MH12AB1234'.obs;
  final RxString modelName = 'Volvo 8400 Electric'.obs;
  final RxString status = 'Online'.obs;

  final RxInt speed = 42.obs;
  final RxInt battery = 92.obs;
  final RxString gpsSignal = 'Strong'.obs;
  final RxString ignition = 'ON'.obs;

  final RxString driverName = 'Rajesh Kumar'.obs;
  final RxString driverPhone = '+91 98765 43210'.obs;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args is Map) {
      if (args['vehicleName'] != null) vehicleName.value = args['vehicleName'];
      if (args['driverName'] != null) driverName.value = args['driverName'];
    }
  }

  void callDriver() {
    Get.snackbar(
      'Calling Driver',
      'Dialing ${driverName.value} at ${driverPhone.value}...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF6366F1),
      colorText: Colors.white,
    );
  }

  void endTracking() {
    Get.back();
    Get.snackbar(
      'Tracking Stopped',
      'Live tracking for vehicle ${vehicleName.value} has been ended.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: Colors.redAccent.withOpacity(0.8),
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
