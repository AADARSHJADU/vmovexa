import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../routes/app_routes.dart';

class VehicleDetailsController extends GetxController {
  final RxString vehicleName = 'MH12AB1234'.obs;
  final RxString fleetName = 'City Bus Fleet'.obs;
  final RxString modelName = 'Volvo 8400 Electric'.obs;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args is Map) {
      if (args['vehicleName'] != null) vehicleName.value = args['vehicleName'];
      if (args['fleetName'] != null) fleetName.value = args['fleetName'];
    }
  }

  void startLiveTracking() {
    Get.toNamed(Routes.LIVE_TRACKING, arguments: {
      'vehicleName': vehicleName.value,
      'fleetName': fleetName.value,
    });
  }

  void editVehicle() {
    Get.snackbar(
      'Edit Vehicle',
      'Vehicle modification form is currently being loaded.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF6366F1),
      colorText: Colors.white,
    );
  }

  void callDriver() {
    Get.snackbar(
      'Calling Driver',
      'Dialing driver Rajesh Kumar (+91 98765 43210)...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF6366F1),
      colorText: Colors.white,
    );
  }
}
