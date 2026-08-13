import 'package:flutter/material.dart';
import 'package:get/get.dart';

class TripDetailsController extends GetxController {
  late final String vehicleName;
  late final String driverName;
  final String tripId = 'TRIP-20260805-001';

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    vehicleName = (args is Map) ? (args['vehicleName'] ?? 'MH12AB1234') : 'MH12AB1234';
    driverName = (args is Map) ? (args['driverName'] ?? 'Rajesh Kumar') : 'Rajesh Kumar';
  }

  void callDriver() {
    Get.snackbar(
      'Calling Driver',
      'Dialing $driverName...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF6366F1),
      colorText: Colors.white,
    );
  }

  void navigate() {
    Get.snackbar(
      'Navigation Launcher',
      'Opening navigation maps path for $vehicleName...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF6366F1),
      colorText: Colors.white,
    );
  }

  void sendAlert() {
    Get.snackbar(
      'Alert Dispatched',
      'Alert notification has been successfully pushed to the vehicle.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: Colors.orangeAccent,
      colorText: Colors.white,
    );
  }

  void downloadReport() {
    Get.snackbar(
      'Downloading Report',
      'Exporting trip sheet and telemetry logs for $tripId...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
    );
  }

  void completeTrip() {
    Get.back();
    Get.snackbar(
      'Trip Completed',
      'Trip $tripId has been marked as completed successfully.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
    );
  }
}
