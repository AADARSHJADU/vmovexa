import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../view/gps_installation_success_view.dart';

enum GpsInstallationStatus { notInstalled, installed }

class GpsInstallationController extends GetxController {
  // ---------------- Vehicle selection ----------------
  final RxString selectedVehicle = ''.obs;
  final List<String> vehicleOptions = const [
    'Bus MH12 AB 1234',
    'Bus MH12 AB 5678',
    'Bus MH12 AB 9101',
  ];

  // Mock depot lookup per vehicle, used on the success screen
  final Map<String, String> _vehicleDepotMap = {
    'Bus MH12 AB 1234': 'Mumbai Central Depot',
    'Bus MH12 AB 5678': 'Andheri Depot',
    'Bus MH12 AB 9101': 'Thane Depot',
  };

  String get selectedVehicleDepot => _vehicleDepotMap[selectedVehicle.value] ?? '';

  final RxnString vehicleError = RxnString();

  void setSelectedVehicle(String? value) {
    selectedVehicle.value = value ?? '';
    if (value != null) vehicleError.value = null;
  }

  // ---------------- GPS Device ID ----------------
  final gpsDeviceIdCtrl = TextEditingController();
  final RxnString gpsDeviceIdError = RxnString();

  // ---------------- Installation status ----------------
  final Rx<GpsInstallationStatus> installationStatus = GpsInstallationStatus.notInstalled.obs;

  bool get isInstalled => installationStatus.value == GpsInstallationStatus.installed;

  // ---------------- Saving / result ----------------
  final RxBool isInstalling = false.obs;
  final Rxn<DateTime> assignedOnDateTime = Rxn<DateTime>();
  final RxString assignedByLabel = 'Admin User'.obs;

  static const List<String> _monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  String get assignedOnText {
    final dt = assignedOnDateTime.value;
    if (dt == null) return '—';
    final month = _monthNames[dt.month - 1];
    final hour12 = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
    final minute = dt.minute.toString().padLeft(2, '0');
    final period = dt.hour >= 12 ? 'PM' : 'AM';
    return '$month ${dt.day}, ${dt.year}, ${hour12.toString().padLeft(2, '0')}:$minute $period';
  }

  // ---------------- Actions ----------------
  void onScanQr() {
    // TODO: integrate QR scanner package and auto-fill gpsDeviceIdCtrl.text
  }

  void onBackPressed() => Get.back();

  bool _validate() {
    bool isValid = true;

    if (selectedVehicle.value.isEmpty) {
      vehicleError.value = 'Please select a vehicle';
      isValid = false;
    } else {
      vehicleError.value = null;
    }

    if (gpsDeviceIdCtrl.text.trim().isEmpty) {
      gpsDeviceIdError.value = 'Please enter or scan a GPS device ID';
      isValid = false;
    } else {
      gpsDeviceIdError.value = null;
    }

    return isValid;
  }

  Future<void> onInstallAssignPressed() async {
    if (!_validate()) {
      Get.snackbar(
        'Missing Information',
        'Please select a vehicle and enter a GPS device ID',
        backgroundColor: const Color(0xFF15151F),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }

    isInstalling.value = true;
    try {
      // TODO: replace with real API call to assign/install the GPS device
      await Future.delayed(const Duration(seconds: 1));
      installationStatus.value = GpsInstallationStatus.installed;
      assignedOnDateTime.value = DateTime.now();
      Get.off(() => const GpsInstallationSuccessView());
    } finally {
      isInstalling.value = false;
    }
  }

  // ---------------- Post-success navigation ----------------
  void onViewGpsInstallations() {
    Get.until((route) => route.isFirst);
    Get.toNamed('/gps-installations');
  }

  void onGoToDashboard() {
    Get.until((route) => route.isFirst);
  }

  @override
  void onClose() {
    gpsDeviceIdCtrl.dispose();
    super.onClose();
  }
}
