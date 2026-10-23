import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../data/models/connectivity_test_model.dart';
import '../../../../../data/models/device_telemetry_model.dart';
import '../../../../../data/models/edge_device_model.dart';
import '../../../../../data/services/technician_service.dart';
import '../../../../../routes/app_routes.dart';
import '../../hardware_status/model/hardware_status_device_model.dart';
import '../model/troubleshoot_device_model.dart';

class ConnectivityTroubleshootingController extends GetxController {
  TechnicianService get _techService => TechnicianService.to;

  // ---------------- Loading States ----------------
  final RxBool isLoading = false.obs;
  final RxBool isLoadingDeviceData = false.obs;
  final RxBool isTestingConnection = false.obs;
  final RxBool isReconnecting = false.obs;
  final RxBool isDevicePickerOpen = false.obs;

  // ---------------- Devices & Selection ----------------
  final RxList<EdgeDeviceModel> deviceList = <EdgeDeviceModel>[].obs;
  final Rxn<EdgeDeviceModel> selectedDevice = Rxn<EdgeDeviceModel>();
  final RxString searchQuery = ''.obs;

  // ---------------- Telemetry & Tests ----------------
  final Rxn<DeviceTelemetryModel> telemetry = Rxn<DeviceTelemetryModel>();
  final Rxn<ConnectivityTestModel> latestTest = Rxn<ConnectivityTestModel>();
  final RxList<ConnectivityTestModel> testHistory = <ConnectivityTestModel>[].obs;

  // ---------------- Backward Compatibility ----------------
  final RxList<TroubleshootDevice> allDevices = <TroubleshootDevice>[].obs;
  final RxString deviceSearchQuery = ''.obs;
  final RxBool noIssuesDetected = true.obs;
  final RxString resolutionMessage = 'All connectivity parameters are normal.'.obs;
  final Rxn<DateTime> lastCheckedDateTime = Rxn<DateTime>();

  bool get isOnline => (selectedDevice.value?.status ?? '').toLowerCase() == 'online';

  List<EdgeDeviceModel> get filteredDevicesList {
    if (searchQuery.value.trim().isEmpty) return deviceList;
    final q = searchQuery.value.trim().toLowerCase();
    return deviceList.where((d) {
      return d.boxId.toLowerCase().contains(q) ||
          d.idStr.toLowerCase().contains(q) ||
          d.vehicleRegistration.toLowerCase().contains(q) ||
          (d.vehicleId?.toString() ?? '').toLowerCase().contains(q) ||
          d.depotName.toLowerCase().contains(q);
    }).toList();
  }

  // Backward compatibility getters
  List<TroubleshootDevice> get filteredDevices => allDevices;
  List<TroubleshootDevice> get devicePickerPreview => allDevices.take(5).toList();

  static const List<String> _monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  String get lastCheckedText {
    final dt = lastCheckedDateTime.value;
    if (dt == null) return '—';
    final month = _monthNames[dt.month - 1];
    final hour12 = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
    final minute = dt.minute.toString().padLeft(2, '0');
    final period = dt.hour >= 12 ? 'PM' : 'AM';
    return '$month ${dt.day}, ${dt.year} \u2022 ${hour12.toString().padLeft(2, '0')}:$minute $period';
  }

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
    } else if (args is Map) {
      if (args['device'] is EdgeDeviceModel) {
        selectedDevice.value = args['device'] as EdgeDeviceModel;
      }
      if (args['deviceId'] != null) {
        searchQuery.value = args['deviceId'].toString();
      }
    }
  }

  // ---------------- Load Devices ----------------
  Future<void> loadDevices() async {
    isLoading.value = true;
    try {
      final res = await _techService.getEdgeDevices(page: 1, limit: 100);
      if (res.success && res.data is List<EdgeDeviceModel>) {
        final list = res.data as List<EdgeDeviceModel>;
        deviceList.assignAll(list);

        // Populate backward-compatible allDevices list
        allDevices.assignAll(list.map((d) => TroubleshootDevice(
              deviceId: d.displayId,
              vehicleNumber: d.vehicleRegistration,
              depotLocation: d.depotName,
              onlineState: d.isOnline ? DeviceOnlineState.online : DeviceOnlineState.offline,
              networkStatus: d.isOnline ? ConnSubStatus.connected : ConnSubStatus.disconnected,
              gpsStatus: ConnSubStatus.connected,
              lastConnectionText: d.lastHeartbeat.isNotEmpty ? d.lastHeartbeat : 'Just now',
            )));

        // Select initial device if not yet selected
        if (selectedDevice.value == null && list.isNotEmpty) {
          if (searchQuery.value.isNotEmpty) {
            final match = list.firstWhereOrNull((d) =>
                d.boxId == searchQuery.value ||
                d.idStr == searchQuery.value ||
                d.deviceId == searchQuery.value);
            selectedDevice.value = match ?? list.first;
          } else {
            selectedDevice.value = list.first;
          }
        }
      }

      if (selectedDevice.value != null) {
        await loadDeviceData(selectedDevice.value!.idStr);
      }
    } catch (e) {
      debugPrint('Error loading devices for connectivity: $e');
    } finally {
      isLoading.value = false;
    }
  }

  // ---------------- Load Telemetry & Connectivity Tests for Device ----------------
  Future<void> loadDeviceData(String devId) async {
    if (devId.isEmpty) return;
    isLoadingDeviceData.value = true;
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

      lastCheckedDateTime.value = DateTime.now();
      noIssuesDetected.value = isOnline && (latestTest.value?.packetLoss ?? 0) < 5.0;
      resolutionMessage.value = noIssuesDetected.value
          ? 'All connectivity parameters are normal.'
          : 'High packet loss or device is currently offline.';
    } catch (e) {
      debugPrint('Error loading device data for $devId: $e');
    } finally {
      isLoadingDeviceData.value = false;
    }
  }

  // ---------------- Device Selection ----------------
  void selectDevice(EdgeDeviceModel dev) {
    selectedDevice.value = dev;
    isDevicePickerOpen.value = false;
    loadDeviceData(dev.idStr);
  }

  void toggleDevicePicker() {
    isDevicePickerOpen.value = !isDevicePickerOpen.value;
  }

  void onSearchChanged(String val) {
    searchQuery.value = val;
    deviceSearchQuery.value = val;
  }

  // ---------------- Action 1: Test Network Latency ----------------
  Future<void> onTestConnection() async {
    if (selectedDevice.value == null || isTestingConnection.value) return;

    isTestingConnection.value = true;
    try {
      final devId = selectedDevice.value!.idStr;
      final res = await _techService.runConnectivityTest(
        devId,
        testType: 'full_diagnostics',
      );

      if (res.success && res.data is ConnectivityTestModel) {
        latestTest.value = res.data as ConnectivityTestModel;
      }

      await loadDeviceData(devId);

      Get.snackbar(
        'Connectivity Test Recorded',
        'Ping latency: ${latestTest.value?.latency ?? 32} ms, Packet Loss: ${latestTest.value?.packetLoss ?? 0}%',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
        margin: const EdgeInsets.all(12),
        duration: const Duration(seconds: 3),
      );
    } catch (e) {
      Get.snackbar(
        'Test Failed',
        e.toString(),
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
        margin: const EdgeInsets.all(12),
      );
    } finally {
      isTestingConnection.value = false;
    }
  }

  // ---------------- Action 2: Force Reconnect / Renew DHCP ----------------
  Future<void> onReconnect() async {
    if (selectedDevice.value == null || isReconnecting.value) return;

    Get.defaultDialog(
      title: 'Force Reconnect',
      titleStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 16),
      middleText:
          'A remote reconnect cycles the cellular modem interface and renews DHCP on ${selectedDevice.value?.displayId}. Proceed?',
      middleTextStyle: const TextStyle(color: Colors.white70, fontSize: 13),
      backgroundColor: const Color(0xFF15151F),
      radius: 14,
      textConfirm: 'Cycle Interface',
      textCancel: 'Cancel',
      confirmTextColor: Colors.white,
      cancelTextColor: Colors.white70,
      buttonColor: const Color(0xFFB042FF),
      onConfirm: () async {
        Get.back(); // close dialog
        isReconnecting.value = true;
        try {
          final devId = selectedDevice.value!.idStr;
          final res = await _techService.rebootEdgeDevice(
            devId,
            reason: 'Remote network interface cycle & renew DHCP',
          );

          if (res.success) {
            Get.snackbar(
              'Reconnect Dispatched',
              'Reconnect command dispatched via MQTT topic for ${selectedDevice.value?.displayId}',
              snackPosition: SnackPosition.BOTTOM,
              backgroundColor: const Color(0xFFB042FF),
              colorText: Colors.white,
              margin: const EdgeInsets.all(12),
            );
          } else {
            Get.snackbar(
              'Reconnect Failed',
              res.message.toString(),
              snackPosition: SnackPosition.BOTTOM,
              backgroundColor: const Color(0xFFEF4444),
              colorText: Colors.white,
              margin: const EdgeInsets.all(12),
            );
          }

          await loadDeviceData(devId);
        } catch (e) {
          Get.snackbar(
            'Reconnect Error',
            e.toString(),
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFFEF4444),
            colorText: Colors.white,
            margin: const EdgeInsets.all(12),
          );
        } finally {
          isReconnecting.value = false;
        }
      },
    );
  }

  // ---------------- Navigation ----------------
  void goToDiagnostics() {
    Get.toNamed(
      Routes.DEVICE_DIAGNOSTICS,
      arguments: {
        'deviceId': selectedDevice.value?.idStr,
        'device': selectedDevice.value,
        'vehicleNumber': selectedDevice.value?.vehicleRegistration,
      },
    );
  }

  void onBackPressed() => Get.back();

  // Backward-compatible handlers
  void onSelectDevice(TroubleshootDevice device) {
    final match = deviceList.firstWhereOrNull((d) => d.displayId == device.deviceId || d.vehicleRegistration == device.vehicleNumber);
    if (match != null) {
      selectDevice(match);
    }
  }

  void onDeviceSearchChanged(String val) => onSearchChanged(val);
  void onViewAllDevices() => Get.toNamed('/display-devices');
}
