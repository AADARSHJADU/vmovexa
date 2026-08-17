import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../hardware_status/model/hardware_status_device_model.dart';
import '../model/troubleshoot_device_model.dart';
// import '../model/hardware_status_device_model.dart' show DeviceOnlineState;

class ConnectivityTroubleshootingController extends GetxController {
  // ---------------- Device picker ----------------
  final RxBool isDevicePickerOpen = false.obs;
  final RxString deviceSearchQuery = ''.obs;

  final RxList<TroubleshootDevice> allDevices = <TroubleshootDevice>[].obs;

  List<TroubleshootDevice> get filteredDevices {
    if (deviceSearchQuery.value.trim().isEmpty) return allDevices;
    final q = deviceSearchQuery.value.trim().toLowerCase();
    return allDevices
        .where((d) => d.vehicleNumber.toLowerCase().contains(q) || d.deviceId.toLowerCase().contains(q))
        .toList();
  }

  // Show at most 5 in the dropdown, with a "View All Devices" link below
  List<TroubleshootDevice> get devicePickerPreview => filteredDevices.take(5).toList();

  // ---------------- Selected device ----------------
  final Rxn<TroubleshootDevice> selectedDevice = Rxn<TroubleshootDevice>();

  void toggleDevicePicker() => isDevicePickerOpen.value = !isDevicePickerOpen.value;

  void onDeviceSearchChanged(String value) => deviceSearchQuery.value = value;

  void onSelectDevice(TroubleshootDevice device) {
    selectedDevice.value = device;
    isDevicePickerOpen.value = false;
    deviceSearchQuery.value = '';
    _resetResolutionStatus();
  }

  void onViewAllDevices() {
    Get.toNamed('/display-devices');
  }

  // ---------------- Resolution / status ----------------
  final RxBool noIssuesDetected = true.obs;
  final RxString resolutionMessage = 'All connectivity parameters are normal.'.obs;
  final Rxn<DateTime> lastCheckedDateTime = Rxn<DateTime>();

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

  void _resetResolutionStatus() {
    noIssuesDetected.value = true;
    resolutionMessage.value = 'All connectivity parameters are normal.';
    lastCheckedDateTime.value = DateTime(2025, 5, 14, 10, 30);
  }

  // ---------------- Troubleshooting actions ----------------
  final RxBool isTestingConnection = false.obs;
  final RxBool isReconnecting = false.obs;

  Future<void> onTestConnection() async {
    if (selectedDevice.value == null) {
      Get.snackbar('No Device Selected', 'Please select a device to troubleshoot',
          backgroundColor: const Color(0xFF15151F), colorText: Colors.white, snackPosition: SnackPosition.BOTTOM);
      return;
    }
    isTestingConnection.value = true;
    try {
      // TODO: replace with real connectivity test API
      await Future.delayed(const Duration(seconds: 1, milliseconds: 200));
      noIssuesDetected.value = true;
      resolutionMessage.value = 'All connectivity parameters are normal.';
      lastCheckedDateTime.value = DateTime.now();
    } finally {
      isTestingConnection.value = false;
    }
  }

  Future<void> onReconnect() async {
    if (selectedDevice.value == null) {
      Get.snackbar('No Device Selected', 'Please select a device to troubleshoot',
          backgroundColor: const Color(0xFF15151F), colorText: Colors.white, snackPosition: SnackPosition.BOTTOM);
      return;
    }
    isReconnecting.value = true;
    try {
      // TODO: replace with real reconnect API call to device + network + GPS
      await Future.delayed(const Duration(seconds: 1, milliseconds: 500));
      noIssuesDetected.value = true;
      resolutionMessage.value = 'Device successfully reconnected. All parameters are normal.';
      lastCheckedDateTime.value = DateTime.now();
    } finally {
      isReconnecting.value = false;
    }
  }

  void onBackPressed() => Get.back();

  @override
  void onInit() {
    super.onInit();
    _loadDevices();

    final args = Get.arguments;
    if (args is Map && args['deviceId'] != null) {
      final match = allDevices.firstWhereOrNull((d) => d.deviceId == args['deviceId']);
      if (match != null) onSelectDevice(match);
    } else {
      // Default to the first device pre-selected, matching the second screenshot state
      if (allDevices.isNotEmpty) onSelectDevice(allDevices.first);
    }
  }

  void _loadDevices() {
    allDevices.assignAll([
      TroubleshootDevice(
        deviceId: 'VMX-DISP-001',
        vehicleNumber: 'Bus MH12 AB 1234',
        depotLocation: 'Mumbai Central Depot',
        onlineState: DeviceOnlineState.online,
        networkStatus: ConnSubStatus.connected,
        gpsStatus: ConnSubStatus.connected,
        lastConnectionText: 'May 14, 2025 \u2022 10:30 AM',
      ),
      TroubleshootDevice(
        deviceId: 'VMX-DISP-002',
        vehicleNumber: 'Bus MH12 AC 5678',
        depotLocation: 'Mumbai Central Depot',
        onlineState: DeviceOnlineState.online,
        networkStatus: ConnSubStatus.connected,
        gpsStatus: ConnSubStatus.connected,
        lastConnectionText: 'May 14, 2025 \u2022 10:15 AM',
      ),
      TroubleshootDevice(
        deviceId: 'VMX-DISP-003',
        vehicleNumber: 'Bus MH12 AD 9101',
        depotLocation: 'Mumbai West Depot',
        onlineState: DeviceOnlineState.offline,
        networkStatus: ConnSubStatus.disconnected,
        gpsStatus: ConnSubStatus.disconnected,
        lastConnectionText: 'May 14, 2025 \u2022 08:05 AM',
      ),
      TroubleshootDevice(
        deviceId: 'VMX-DISP-004',
        vehicleNumber: 'Bus MH12 AE 2468',
        depotLocation: 'Mumbai West Depot',
        onlineState: DeviceOnlineState.online,
        networkStatus: ConnSubStatus.connected,
        gpsStatus: ConnSubStatus.connected,
        lastConnectionText: 'May 14, 2025 \u2022 10:28 AM',
      ),
      TroubleshootDevice(
        deviceId: 'VMX-DISP-005',
        vehicleNumber: 'Bus MH12 AF 1357',
        depotLocation: 'Mumbai Central Depot',
        onlineState: DeviceOnlineState.offline,
        networkStatus: ConnSubStatus.disconnected,
        gpsStatus: ConnSubStatus.disconnected,
        lastConnectionText: 'May 14, 2025 \u2022 07:40 AM',
      ),
    ]);
  }
}
