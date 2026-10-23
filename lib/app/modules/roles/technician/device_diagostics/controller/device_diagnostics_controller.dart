import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../data/models/connectivity_test_model.dart';
import '../../../../../data/models/device_telemetry_model.dart';
import '../../../../../data/models/edge_device_model.dart';
import '../../../../../data/services/technician_service.dart';
import '../../../../../routes/app_routes.dart';
import '../model/diagnostic_check_model.dart';

class DeviceDiagnosticsController extends GetxController {
  TechnicianService get _techService => TechnicianService.to;

  // ---------------- Loading States ----------------
  final RxBool isLoading = false.obs;
  final RxBool isLoadingTelemetry = false.obs;
  final RxBool isRunning = false.obs;
  final RxBool isRebooting = false.obs;
  final RxBool diagnosticsCompleted = false.obs;
  final RxString lastRunTime = '—'.obs;

  // ---------------- Devices & Selected Target ----------------
  final RxList<EdgeDeviceModel> deviceList = <EdgeDeviceModel>[].obs;
  final Rxn<EdgeDeviceModel> selectedDevice = Rxn<EdgeDeviceModel>();

  // ---------------- Telemetry & Tests ----------------
  final Rxn<DeviceTelemetryModel> telemetry = Rxn<DeviceTelemetryModel>();
  final Rxn<ConnectivityTestModel> latestTest = Rxn<ConnectivityTestModel>();
  final RxList<ConnectivityTestModel> testHistory = <ConnectivityTestModel>[].obs;

  // ---------------- Backward Compatibility Fields ----------------
  final RxString deviceId = 'VMX-DISP-001'.obs;
  final RxString deviceType = 'Display Device'.obs;
  final RxString vehicleNumber = 'Bus MH12 AB 1234'.obs;
  final RxList<DiagnosticCheck> checks = <DiagnosticCheck>[].obs;
  final RxBool hasRunOnce = false.obs;
  final Rxn<DateTime> lastRunDateTime = Rxn<DateTime>();

  bool get isOnline => (selectedDevice.value?.status ?? '').toLowerCase() == 'online';

  static const List<String> _monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  String get lastRunText => lastRunTime.value;

  @override
  void onInit() {
    super.onInit();
    _handleRouteArguments();
    loadDevices();
  }

  void _handleRouteArguments() {
    final args = Get.arguments;
    if (args is EdgeDeviceModel) {
      selectedDevice.value = args;
      _syncBackwardCompat(args);
    } else if (args is Map) {
      if (args['device'] is EdgeDeviceModel) {
        selectedDevice.value = args['device'] as EdgeDeviceModel;
        _syncBackwardCompat(args['device'] as EdgeDeviceModel);
      }
      if (args['deviceId'] != null) {
        deviceId.value = args['deviceId'].toString();
      }
      if (args['deviceType'] != null) {
        deviceType.value = args['deviceType'].toString();
      }
      if (args['vehicleNumber'] != null) {
        vehicleNumber.value = args['vehicleNumber'].toString();
      }
    }
  }

  void _syncBackwardCompat(EdgeDeviceModel dev) {
    deviceId.value = dev.displayId;
    deviceType.value = dev.deviceType;
    vehicleNumber.value = dev.vehicleRegistration;
  }

  // ---------------- Load Devices ----------------
  Future<void> loadDevices() async {
    isLoading.value = true;
    try {
      final res = await _techService.getEdgeDevices(page: 1, limit: 100);
      if (res.success && res.data is List<EdgeDeviceModel>) {
        final list = res.data as List<EdgeDeviceModel>;
        deviceList.assignAll(list);

        // If no device was preselected via route arguments, select the first device or match by ID
        if (selectedDevice.value == null && list.isNotEmpty) {
          if (deviceId.value.isNotEmpty) {
            final match = list.firstWhereOrNull(
              (d) => d.boxId == deviceId.value || d.idStr == deviceId.value || d.deviceId == deviceId.value,
            );
            selectedDevice.value = match ?? list.first;
          } else {
            selectedDevice.value = list.first;
          }
        }
      }

      // If we have a selected device, fetch its real telemetry and tests
      if (selectedDevice.value != null) {
        _syncBackwardCompat(selectedDevice.value!);
        await loadTelemetryAndTests(selectedDevice.value!.idStr);
      }
    } catch (e) {
      debugPrint('Error loading devices for diagnostics: $e');
    } finally {
      isLoading.value = false;
    }
  }

  // ---------------- Load Telemetry & Past Tests ----------------
  Future<void> loadTelemetryAndTests(String devId) async {
    if (devId.isEmpty) return;
    isLoadingTelemetry.value = true;
    try {
      final results = await Future.wait([
        _techService.getDeviceTelemetry(devId),
        _techService.getConnectivityTests(devId),
      ]);

      final teleRes = results[0];
      final testRes = results[1];

      if (teleRes.success && teleRes.data is DeviceTelemetryModel) {
        telemetry.value = teleRes.data as DeviceTelemetryModel;
      } else {
        // Fallback default telemetry values matching TechDiagnosticsPage
        telemetry.value = DeviceTelemetryModel(
          deviceId: devId,
          status: isOnline ? 'online' : 'offline',
          cellularNetwork: selectedDevice.value?.simNetwork ?? '4G LTE',
          activeScreensCount: 2,
          mqttConnected: isOnline,
        );
      }

      if (testRes.success && testRes.data is List<ConnectivityTestModel>) {
        final tests = testRes.data as List<ConnectivityTestModel>;
        testHistory.assignAll(tests);
        if (tests.isNotEmpty) {
          latestTest.value = tests.first;
        } else {
          latestTest.value = ConnectivityTestModel(status: isOnline ? 'healthy' : 'offline');
        }
      } else {
        latestTest.value = ConnectivityTestModel(status: isOnline ? 'healthy' : 'offline');
      }
    } catch (e) {
      debugPrint('Error loading telemetry for $devId: $e');
    } finally {
      isLoadingTelemetry.value = false;
    }
  }

  // ---------------- Switch Selected Device ----------------
  void selectDevice(EdgeDeviceModel dev) {
    selectedDevice.value = dev;
    _syncBackwardCompat(dev);
    diagnosticsCompleted.value = false;
    loadTelemetryAndTests(dev.idStr);
  }

  // ---------------- Run Live Subsystem Diagnostics Sequence ----------------
  Future<void> onRunDiagnosticsPressed() async {
    if (selectedDevice.value == null || isRunning.value) return;

    isRunning.value = true;
    try {
      final devId = selectedDevice.value!.idStr;
      final res = await _techService.runConnectivityTest(
        devId,
        testType: 'full_diagnostics',
      );

      if (res.success && res.data is ConnectivityTestModel) {
        latestTest.value = res.data as ConnectivityTestModel;
      }

      // Re-fetch telemetry & connectivity
      await loadTelemetryAndTests(devId);

      diagnosticsCompleted.value = true;
      hasRunOnce.value = true;
      final now = DateTime.now();
      lastRunDateTime.value = now;
      final month = _monthNames[now.month - 1];
      final hour12 = now.hour % 12 == 0 ? 12 : now.hour % 12;
      final minute = now.minute.toString().padLeft(2, '0');
      final period = now.hour >= 12 ? 'PM' : 'AM';
      lastRunTime.value = '$month ${now.day}, ${now.year} \u2022 ${hour12.toString().padLeft(2, '0')}:$minute $period';

      Get.snackbar(
        'Diagnostics Complete',
        'Subsystem self-test executed successfully for ${selectedDevice.value?.displayId}',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
        margin: const EdgeInsets.all(12),
        duration: const Duration(seconds: 3),
      );
    } catch (e) {
      Get.snackbar(
        'Diagnostics Error',
        e.toString(),
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
        margin: const EdgeInsets.all(12),
      );
    } finally {
      isRunning.value = false;
    }
  }

  // ---------------- Reboot Device Action ----------------
  Future<void> onRebootPressed() async {
    if (selectedDevice.value == null || isRebooting.value) return;

    Get.defaultDialog(
      title: 'Reboot Device',
      titleStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 16),
      middleText: 'Are you sure you want to send a remote reboot signal to ${selectedDevice.value?.displayId}?',
      middleTextStyle: const TextStyle(color: Colors.white70, fontSize: 13),
      backgroundColor: const Color(0xFF15151F),
      radius: 14,
      textConfirm: 'Reboot Now',
      textCancel: 'Cancel',
      confirmTextColor: Colors.white,
      cancelTextColor: Colors.white70,
      buttonColor: const Color(0xFFEF4444),
      onConfirm: () async {
        Get.back(); // close dialog
        isRebooting.value = true;
        try {
          final res = await _techService.rebootEdgeDevice(
            selectedDevice.value!.idStr,
            reason: 'Technician diagnostics self-test manual reboot request',
          );
          if (res.success) {
            Get.snackbar(
              'Reboot Dispatched',
              'Reboot signal dispatched via MQTT topic for ${selectedDevice.value?.displayId}',
              snackPosition: SnackPosition.BOTTOM,
              backgroundColor: const Color(0xFFB042FF),
              colorText: Colors.white,
              margin: const EdgeInsets.all(12),
            );
          } else {
            Get.snackbar(
              'Reboot Failed',
              res.message.toString(),
              snackPosition: SnackPosition.BOTTOM,
              backgroundColor: const Color(0xFFEF4444),
              colorText: Colors.white,
              margin: const EdgeInsets.all(12),
            );
          }
        } catch (e) {
          Get.snackbar(
            'Reboot Error',
            e.toString(),
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFFEF4444),
            colorText: Colors.white,
            margin: const EdgeInsets.all(12),
          );
        } finally {
          isRebooting.value = false;
        }
      },
    );
  }

  // ---------------- Navigation ----------------
  void goToConnectivity() {
    Get.toNamed(
      Routes.CONNECTIVITY_TROUBLESHOOTING,
      arguments: {
        'deviceId': selectedDevice.value?.idStr,
        'device': selectedDevice.value,
        'vehicleNumber': selectedDevice.value?.vehicleRegistration,
      },
    );
  }

  void onBackPressed() => Get.back();
}
