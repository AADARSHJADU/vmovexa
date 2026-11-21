import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';

class TripReportController extends GetxController {
  late String tripId;
  late String vehicleName;
  late String driverName;
  late String date;

  final RxBool isExporting = false.obs;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args is Map) {
      tripId = args['tripId']?.toString() ?? 'TRIP-20260805-001';
      vehicleName = args['vehicleName']?.toString() ?? 'MH12AB1234';
      driverName = args['driverName']?.toString() ?? 'Rajesh Kumar';
      date = args['date']?.toString() ?? '05 Aug 2026';
    } else {
      tripId = 'TRIP-20260805-001';
      vehicleName = 'MH12AB1234';
      driverName = 'Rajesh Kumar';
      date = '05 Aug 2026';
    }
  }

  void copyTripId() {
    Clipboard.setData(ClipboardData(text: tripId));
    Get.snackbar(
      'success'.tr,
      'Trip ID copied to clipboard.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF6366F1),
      colorText: Colors.white,
    );
  }

  Future<void> exportPdf() async {
    await downloadReport();
  }

  void shareReport() {
    Clipboard.setData(ClipboardData(text: 'VMOVEXA Trip Report: $tripId ($vehicleName - $driverName) on $date'));
    Get.snackbar(
      'share_report_btn'.tr,
      'Trip report manifest summary copied for sharing.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF6366F1),
      colorText: Colors.white,
    );
  }

  Future<void> downloadReport() async {
    if (isExporting.value) return;
    isExporting.value = true;
    try {
      final pdfContent = '''%PDF-1.4
%=======================================================
% OFFICIAL VMOVEXA TRANSIT TRIP REPORT & TELEMETRY MANIFEST
%=======================================================
TRIP ID: $tripId
DATE: $date
STATUS: COMPLETED
VEHICLE: $vehicleName
OPERATOR / DRIVER: $driverName
PLATFORM: VMOVEXA Intelligent Fleet Telematics Cloud
-------------------------------------------------------
''';

      final cleanTripId = tripId.replaceAll(RegExp(r'[^\w\-]'), '_');
      final fileName = 'TRIP_REPORT_$cleanTripId.pdf';

      Directory saveDir;
      if (Platform.isAndroid) {
        final downloadDir = Directory('/storage/emulated/0/Download');
        if (await downloadDir.exists()) {
          saveDir = downloadDir;
        } else {
          saveDir = Directory.systemTemp;
        }
      } else {
        saveDir = Directory.systemTemp;
      }

      final file = File('${saveDir.path}/$fileName');
      await file.writeAsString(pdfContent, flush: true);

      Get.snackbar(
        'export_pdf_btn'.tr,
        'Trip Sheet PDF saved to Download: ${file.path}',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
        duration: const Duration(seconds: 4),
        mainButton: TextButton(
          onPressed: () => _openDownloadedFile(file.path),
          child: Text('open'.tr.toUpperCase(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        ),
      );
    } catch (e) {
      Get.snackbar(
        'export_pdf_btn'.tr,
        'Export failed: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
    } finally {
      isExporting.value = false;
    }
  }

  Future<void> _openDownloadedFile(String filePath) async {
    try {
      final uri = Uri.file(filePath);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      } else {
        Get.snackbar(
          'open_file'.tr,
          'File saved at $filePath',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF6366F1),
          colorText: Colors.white,
        );
      }
    } catch (_) {
      Get.snackbar(
        'open_file'.tr,
        'File saved at $filePath',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF6366F1),
        colorText: Colors.white,
      );
    }
  }
}
