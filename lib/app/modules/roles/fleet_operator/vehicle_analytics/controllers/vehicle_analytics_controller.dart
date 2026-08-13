import 'package:flutter/material.dart';
import 'package:get/get.dart';

class VehicleAnalyticsController extends GetxController {
  final String vehicleName = 'MH12AB1234';
  final String modelName = 'Volvo 8400 Electric';
  final String fleetName = 'City Bus Fleet';
  
  final int performanceScore = 92;
  final String performanceText = 'Excellent';

  final String totalDistance = '12,480 km';
  final int totalTrips = 186;
  final String runningHours = '248h 35m';
  final String avgSpeed = '38 km/h';

  void downloadReport() {
    Get.snackbar(
      'Download Report',
      'Preparing analytics report for $vehicleName...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
    );
  }
}
