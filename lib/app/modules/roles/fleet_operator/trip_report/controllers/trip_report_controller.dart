import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';

class TripReportController extends GetxController {
  final String tripId = 'TRIP-20260805-001';
  final String vehicleName = 'MH12AB1234';
  final String driverName = 'Rajesh Kumar';
  final String date = '05 Aug 2026';

  void copyTripId() {
    Clipboard.setData(ClipboardData(text: tripId));
    Get.snackbar(
      'Copied',
      'Trip ID copied to clipboard.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF6366F1),
      colorText: Colors.white,
    );
  }

  void exportPdf() {
    Get.snackbar(
      'Export PDF',
      'Generating PDF layout for trip sheet...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
    );
  }

  void shareReport() {
    Get.snackbar(
      'Share Report',
      'Opening system share panel for trip $tripId...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF6366F1),
      colorText: Colors.white,
    );
  }

  void downloadReport() {
    Get.snackbar(
      'Downloading',
      'Downloading trip telemetry report logs...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
    );
  }
}
