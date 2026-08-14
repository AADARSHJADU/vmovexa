import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../views/configuration_saved_view.dart';
import '../views/review_saved_config_view.dart';

class HardwareConfigController extends GetxController {
  // ==========================================================
  // Device summary header (passed in via route argument / API)
  // ==========================================================
  final RxString deviceId = 'VMX-DP-1001'.obs;
  final RxString vehicleNumber = 'Bus MH12 AB 1234'.obs;
  final RxString depotLocation = 'Mumbai Central Depot'.obs;
  final RxBool isDeviceOnline = true.obs;

  // ==========================================================
  // Tabs
  // ==========================================================
  final RxInt selectedTabIndex = 0.obs; // 0 = Display, 1 = Network, 2 = System
  final List<String> tabLabels = const ['Display Settings', 'Network Settings', 'System Settings'];

  void selectTab(int index) => selectedTabIndex.value = index;

  final RxBool isSaving = false.obs;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args is Map) {
      deviceId.value = args['deviceId'] ?? deviceId.value;
      vehicleNumber.value = args['vehicleNumber'] ?? vehicleNumber.value;
      depotLocation.value = args['depotLocation'] ?? depotLocation.value;
      isDeviceOnline.value = args['isOnline'] ?? isDeviceOnline.value;
    }
  }

  // ==========================================================
  // TAB 1 — Display Settings
  // ==========================================================
  final RxDouble screenBrightness = 80.0.obs;
  void setScreenBrightness(double v) => screenBrightness.value = v;

  final RxString screenTimeout = '5 Minutes'.obs;
  final List<String> screenTimeoutOptions = const [
    '1 Minute', '5 Minutes', '10 Minutes', '30 Minutes', 'Never',
  ];
  void setScreenTimeout(String? v) => screenTimeout.value = v ?? '';

  final RxBool autoBrightness = true.obs;
  void toggleAutoBrightness(bool v) => autoBrightness.value = v;

  final RxString screenOrientation = 'Landscape'.obs;
  final List<String> screenOrientationOptions = const ['Landscape', 'Portrait'];
  void setScreenOrientation(String? v) => screenOrientation.value = v ?? '';

  final RxString displayMode = 'Full Screen'.obs;
  final List<String> displayModeOptions = const ['Full Screen', 'Windowed', 'Split Screen'];
  void setDisplayMode(String? v) => displayMode.value = v ?? '';

  final RxDouble volumeLevel = 70.0.obs;
  void setVolumeLevel(double v) => volumeLevel.value = v;

  final RxBool isMuted = false.obs;
  void toggleMute(bool v) => isMuted.value = v;

  final RxString audioOutput = 'Internal Speaker'.obs;
  final List<String> audioOutputOptions = const ['Internal Speaker', 'External Speaker', 'Bluetooth', 'HDMI Audio'];
  void setAudioOutput(String? v) => audioOutput.value = v ?? '';

  final RxString powerMode = 'Normal'.obs;
  final List<String> powerModeOptions = const ['Normal', 'Power Saver', 'High Performance'];
  void setPowerMode(String? v) => powerMode.value = v ?? '';

  final RxString autoPowerOn = '06:00 AM'.obs;
  final List<String> timeOptions = const [
    '05:00 AM', '05:30 AM', '06:00 AM', '06:30 AM', '07:00 AM',
    '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM',
  ];
  void setAutoPowerOn(String? v) => autoPowerOn.value = v ?? '';

  final RxString autoPowerOff = '11:00 PM'.obs;
  void setAutoPowerOff(String? v) => autoPowerOff.value = v ?? '';

  // ==========================================================
  // TAB 2 — Network Settings
  // ==========================================================
  final RxBool isNetworkConnected = true.obs;
  final RxBool isTestingConnection = false.obs;

  final RxString connectionType = 'Wi-Fi'.obs;
  final List<String> connectionTypeOptions = const ['Wi-Fi', 'Ethernet', '4G / LTE'];
  void setConnectionType(String? v) => connectionType.value = v ?? '';

  final RxString wifiSsid = 'VMOVEXA_NET'.obs;
  final RxString ipAddress = '192.168.1.120'.obs;
  final RxString subnetMask = '255.255.255.0'.obs;
  final RxString gateway = '192.168.1.1'.obs;
  final RxString dnsServer = '8.8.8.8'.obs;
  final RxInt signalStrengthPercent = 90.obs;
  final RxString macAddress = '00:1A:2B:3C:4D:5E'.obs;
  final RxString lastConnected = 'Today, 09:35 AM'.obs;

  final RxBool useProxy = false.obs;
  void toggleUseProxy(bool v) => useProxy.value = v;

  final RxString proxyType = ''.obs;
  final List<String> proxyTypeOptions = const ['HTTP', 'HTTPS', 'SOCKS5'];
  void setProxyType(String? v) => proxyType.value = v ?? '';

  final proxyAddressCtrl = TextEditingController();
  final proxyPortCtrl = TextEditingController();

  Future<void> onRunConnectionTest() async {
    isTestingConnection.value = true;
    try {
      // TODO: replace with real connectivity ping to the device
      await Future.delayed(const Duration(seconds: 1, milliseconds: 200));
      Get.snackbar(
        'Connection Test',
        'Device is reachable and communicating with the server.',
        backgroundColor: const Color(0xFF15151F),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isTestingConnection.value = false;
    }
  }

  void onWifiNetworkTap() {
    // TODO: open Wi-Fi network picker / change-network flow
  }

  // ==========================================================
  // TAB 3 — System Settings
  // ==========================================================
  final RxString hardwareModel = 'VMOVEXA Display Pro 10"'.obs;
  final RxString serialNumber = 'VMXDP1001A2345'.obs;
  final RxString firmwareVersion = '1.2.0'.obs;
  final RxBool isFirmwareUpToDate = true.obs;
  final RxString edgeAgentVersion = '2.3.1'.obs;
  final RxBool isEdgeAgentUpToDate = true.obs;
  final RxString osVersion = 'Android 11'.obs;
  final RxBool isOsUpToDate = true.obs;
  final RxString uptime = '2 days, 14 hrs, 32 mins'.obs;
  final RxString deviceStatus = 'Healthy'.obs;

  final RxString deviceDateTime = 'May 14, 2025 · 09:35 AM'.obs;
  final RxString timeZoneLabel = 'Asia/Kolkata (GMT +05:30)'.obs;
  final RxBool autoTimeSync = true.obs;
  void toggleAutoTimeSync(bool v) => autoTimeSync.value = v;

  void onDeviceDateTimeTap() {
    // TODO: open a date/time picker
  }

  void onTimeZoneTap() {
    // TODO: open a time-zone picker
  }

  final RxBool isRestarting = false.obs;
  final RxBool isClearingCache = false.obs;

  Future<void> onRestartDevice() async {
    final confirmed = await Get.dialog<bool>(
      _confirmDialog(
        title: 'Restart Device',
        message: 'The device will restart and briefly go offline. Continue?',
        confirmLabel: 'Restart',
        confirmColor: const Color(0xFF3F7BF5),
      ),
    );
    if (confirmed != true) return;

    isRestarting.value = true;
    try {
      // TODO: call restart API
      await Future.delayed(const Duration(seconds: 1));
      Get.snackbar('Restarting', 'Restart command sent to ${deviceId.value}.',
          backgroundColor: const Color(0xFF15151F), colorText: Colors.white, snackPosition: SnackPosition.BOTTOM);
    } finally {
      isRestarting.value = false;
    }
  }

  Future<void> onClearCache() async {
    isClearingCache.value = true;
    try {
      // TODO: call clear-cache API
      await Future.delayed(const Duration(milliseconds: 800));
      Get.snackbar('Cache Cleared', 'Local cache and temporary files removed.',
          backgroundColor: const Color(0xFF15151F), colorText: Colors.white, snackPosition: SnackPosition.BOTTOM);
    } finally {
      isClearingCache.value = false;
    }
  }

  Future<void> onFactoryReset() async {
    final confirmed = await Get.dialog<bool>(
      _confirmDialog(
        title: 'Factory Reset',
        message:
        'This will erase all settings and content on this device and restore factory defaults. This cannot be undone.',
        confirmLabel: 'Reset',
        confirmColor: const Color(0xFFFF4D4D),
      ),
    );
    if (confirmed != true) return;
    // TODO: call factory-reset API
    Get.snackbar('Factory Reset Initiated', '${deviceId.value} will reset to factory settings.',
        backgroundColor: const Color(0xFF15151F), colorText: Colors.white, snackPosition: SnackPosition.BOTTOM);
  }

  Widget _confirmDialog({
    required String title,
    required String message,
    required String confirmLabel,
    required Color confirmColor,
  }) {
    return AlertDialog(
      backgroundColor: const Color(0xFF15151F),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      title: Text(title, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
      content: Text(message, style: const TextStyle(color: Colors.white60, fontSize: 13)),
      actions: [
        TextButton(
          onPressed: () => Get.back(result: false),
          child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
        ),
        TextButton(
          onPressed: () => Get.back(result: true),
          child: Text(confirmLabel, style: TextStyle(color: confirmColor, fontWeight: FontWeight.w700)),
        ),
      ],
    );
  }

  // ==========================================================
  // Assigned Vehicle (read-only context shown on the Review screen)
  // ==========================================================
  final RxString assignedVehicle = 'Bus MH12 AB 1234'.obs;
  final RxString organizationFleet = 'VMOVEXA City Bus Service'.obs;
  final RxString installationPosition = 'Front Section - Left Side'.obs;
  final RxString vehiclePowerSource = 'Vehicle Battery'.obs;

  // ==========================================================
  // Save / Back / Review flow
  // ==========================================================

  /// Both the top "Save Config" shortcut and the bottom "Save Configuration"
  /// button take the technician to the Review & Save screen first.
  void onGoToReviewAndSave() {
    Get.to(() => const ReviewAndSaveConfigView());
  }

  void onBackPressed() => Get.back();

  final Rxn<DateTime> savedOnDateTime = Rxn<DateTime>();
  final RxString savedByLabel = 'Ramesh Patil (Technician)'.obs;
  final RxString configVersionLabel = '1.2 (Latest)'.obs;
  final RxString sectionsUpdatedLabel = '6 of 6'.obs;

  static const List<String> _monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  String get savedOnText {
    final dt = savedOnDateTime.value;
    if (dt == null) return '—';
    final month = _monthNames[dt.month - 1];
    final hour12 = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
    final minute = dt.minute.toString().padLeft(2, '0');
    final period = dt.hour >= 12 ? 'PM' : 'AM';
    return '$month ${dt.day}, ${dt.year}, ${hour12.toString().padLeft(2, '0')}:$minute $period';
  }

  /// Called from the Review & Save screen — this is th0e *actual* save.
  Future<void> onConfirmSaveConfig() async {
    isSaving.value = true;
    try {
      await Future.delayed(const Duration(seconds: 1));
      savedOnDateTime.value = DateTime.now();
      Get.off(() => const ConfigurationSavedView());
    } finally {
      isSaving.value = false;
    }
  }

  void onEditSection(int tabIndex) {
    selectTab(tabIndex);
    Get.back(); // return to HardwareConfigurationView, landing on the chosen tab
  }

  void onGoToDisplayDevices() {
    Get.until((route) => route.isFirst);
    Get.toNamed('/display-devices');
  }

  void onConfigureAnotherDevice() {
    Get.until((route) => route.isFirst);
    Get.toNamed('/display-devices');
  }

  @override
  void onClose() {
    proxyAddressCtrl.dispose();
    proxyPortCtrl.dispose();
    super.onClose();
  }
}
// class HardwareConfigController extends GetxController {
//   // ==========================================================
//   // Device summary header (passed in via route argument / API)
//   // ==========================================================
//   final RxString deviceId = 'VMX-DP-1001'.obs;
//   final RxString vehicleNumber = 'Bus MH12 AB 1234'.obs;
//   final RxString depotLocation = 'Mumbai Central Depot'.obs;
//   final RxBool isDeviceOnline = true.obs;
//
//   // ==========================================================
//   // Tabs
//   // ==========================================================
//   final RxInt selectedTabIndex = 0.obs; // 0 = Display, 1 = Network, 2 = System
//   final List<String> tabLabels = const ['Display Settings', 'Network Settings', 'System Settings'];
//
//   void selectTab(int index) => selectedTabIndex.value = index;
//
//   final RxBool isSaving = false.obs;
//
//   @override
//   void onInit() {
//     super.onInit();
//     final args = Get.arguments;
//     if (args is Map) {
//       deviceId.value = args['deviceId'] ?? deviceId.value;
//       vehicleNumber.value = args['vehicleNumber'] ?? vehicleNumber.value;
//       depotLocation.value = args['depotLocation'] ?? depotLocation.value;
//       isDeviceOnline.value = args['isOnline'] ?? isDeviceOnline.value;
//     }
//   }
//
//   // ==========================================================
//   // TAB 1 — Display Settings
//   // ==========================================================
//   final RxDouble screenBrightness = 80.0.obs;
//   void setScreenBrightness(double v) => screenBrightness.value = v;
//
//   final RxString screenTimeout = '5 Minutes'.obs;
//   final List<String> screenTimeoutOptions = const [
//     '1 Minute', '5 Minutes', '10 Minutes', '30 Minutes', 'Never',
//   ];
//   void setScreenTimeout(String? v) => screenTimeout.value = v ?? '';
//
//   final RxBool autoBrightness = true.obs;
//   void toggleAutoBrightness(bool v) => autoBrightness.value = v;
//
//   final RxString screenOrientation = 'Landscape'.obs;
//   final List<String> screenOrientationOptions = const ['Landscape', 'Portrait'];
//   void setScreenOrientation(String? v) => screenOrientation.value = v ?? '';
//
//   final RxString displayMode = 'Full Screen'.obs;
//   final List<String> displayModeOptions = const ['Full Screen', 'Windowed', 'Split Screen'];
//   void setDisplayMode(String? v) => displayMode.value = v ?? '';
//
//   final RxDouble volumeLevel = 70.0.obs;
//   void setVolumeLevel(double v) => volumeLevel.value = v;
//
//   final RxBool isMuted = false.obs;
//   void toggleMute(bool v) => isMuted.value = v;
//
//   final RxString audioOutput = 'Internal Speaker'.obs;
//   final List<String> audioOutputOptions = const ['Internal Speaker', 'External Speaker', 'Bluetooth', 'HDMI Audio'];
//   void setAudioOutput(String? v) => audioOutput.value = v ?? '';
//
//   final RxString powerMode = 'Normal'.obs;
//   final List<String> powerModeOptions = const ['Normal', 'Power Saver', 'High Performance'];
//   void setPowerMode(String? v) => powerMode.value = v ?? '';
//
//   final RxString autoPowerOn = '06:00 AM'.obs;
//   final List<String> timeOptions = const [
//     '05:00 AM', '05:30 AM', '06:00 AM', '06:30 AM', '07:00 AM',
//     '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM',
//   ];
//   void setAutoPowerOn(String? v) => autoPowerOn.value = v ?? '';
//
//   final RxString autoPowerOff = '11:00 PM'.obs;
//   void setAutoPowerOff(String? v) => autoPowerOff.value = v ?? '';
//
//   // ==========================================================
//   // TAB 2 — Network Settings
//   // ==========================================================
//   final RxBool isNetworkConnected = true.obs;
//   final RxBool isTestingConnection = false.obs;
//
//   final RxString connectionType = 'Wi-Fi'.obs;
//   final List<String> connectionTypeOptions = const ['Wi-Fi', 'Ethernet', '4G / LTE'];
//   void setConnectionType(String? v) => connectionType.value = v ?? '';
//
//   final RxString wifiSsid = 'VMOVEXA_NET'.obs;
//   final RxString ipAddress = '192.168.1.120'.obs;
//   final RxString subnetMask = '255.255.255.0'.obs;
//   final RxString gateway = '192.168.1.1'.obs;
//   final RxString dnsServer = '8.8.8.8'.obs;
//   final RxInt signalStrengthPercent = 90.obs;
//   final RxString macAddress = '00:1A:2B:3C:4D:5E'.obs;
//   final RxString lastConnected = 'Today, 09:35 AM'.obs;
//
//   final RxBool useProxy = false.obs;
//   void toggleUseProxy(bool v) => useProxy.value = v;
//
//   final RxString proxyType = ''.obs;
//   final List<String> proxyTypeOptions = const ['HTTP', 'HTTPS', 'SOCKS5'];
//   void setProxyType(String? v) => proxyType.value = v ?? '';
//
//   final proxyAddressCtrl = TextEditingController();
//   final proxyPortCtrl = TextEditingController();
//
//   Future<void> onRunConnectionTest() async {
//     isTestingConnection.value = true;
//     try {
//       // TODO: replace with real connectivity ping to the device
//       await Future.delayed(const Duration(seconds: 1, milliseconds: 200));
//       Get.snackbar(
//         'Connection Test',
//         'Device is reachable and communicating with the server.',
//         backgroundColor: const Color(0xFF15151F),
//         colorText: Colors.white,
//         snackPosition: SnackPosition.BOTTOM,
//       );
//     } finally {
//       isTestingConnection.value = false;
//     }
//   }
//
//   void onWifiNetworkTap() {
//     // TODO: open Wi-Fi network picker / change-network flow
//   }
//
//   // ==========================================================
//   // TAB 3 — System Settings
//   // ==========================================================
//   final RxString hardwareModel = 'VMOVEXA Display Pro 10"'.obs;
//   final RxString serialNumber = 'VMXDP1001A2345'.obs;
//   final RxString firmwareVersion = '1.2.0'.obs;
//   final RxBool isFirmwareUpToDate = true.obs;
//   final RxString edgeAgentVersion = '2.3.1'.obs;
//   final RxBool isEdgeAgentUpToDate = true.obs;
//   final RxString osVersion = 'Android 11'.obs;
//   final RxBool isOsUpToDate = true.obs;
//   final RxString uptime = '2 days, 14 hrs, 32 mins'.obs;
//   final RxString deviceStatus = 'Healthy'.obs;
//
//   final RxString deviceDateTime = 'May 14, 2025 · 09:35 AM'.obs;
//   final RxString timeZoneLabel = 'Asia/Kolkata (GMT +05:30)'.obs;
//   final RxBool autoTimeSync = true.obs;
//   void toggleAutoTimeSync(bool v) => autoTimeSync.value = v;
//
//   void onDeviceDateTimeTap() {
//     // TODO: open a date/time picker
//   }
//
//   void onTimeZoneTap() {
//     // TODO: open a time-zone picker
//   }
//
//   final RxBool isRestarting = false.obs;
//   final RxBool isClearingCache = false.obs;
//
//   Future<void> onRestartDevice() async {
//     final confirmed = await Get.dialog<bool>(
//       _confirmDialog(
//         title: 'Restart Device',
//         message: 'The device will restart and briefly go offline. Continue?',
//         confirmLabel: 'Restart',
//         confirmColor: const Color(0xFF3F7BF5),
//       ),
//     );
//     if (confirmed != true) return;
//
//     isRestarting.value = true;
//     try {
//       // TODO: call restart API
//       await Future.delayed(const Duration(seconds: 1));
//       Get.snackbar('Restarting', 'Restart command sent to ${deviceId.value}.',
//           backgroundColor: const Color(0xFF15151F), colorText: Colors.white, snackPosition: SnackPosition.BOTTOM);
//     } finally {
//       isRestarting.value = false;
//     }
//   }
//
//   Future<void> onClearCache() async {
//     isClearingCache.value = true;
//     try {
//       // TODO: call clear-cache API
//       await Future.delayed(const Duration(milliseconds: 800));
//       Get.snackbar('Cache Cleared', 'Local cache and temporary files removed.',
//           backgroundColor: const Color(0xFF15151F), colorText: Colors.white, snackPosition: SnackPosition.BOTTOM);
//     } finally {
//       isClearingCache.value = false;
//     }
//   }
//
//   Future<void> onFactoryReset() async {
//     final confirmed = await Get.dialog<bool>(
//       _confirmDialog(
//         title: 'Factory Reset',
//         message:
//             'This will erase all settings and content on this device and restore factory defaults. This cannot be undone.',
//         confirmLabel: 'Reset',
//         confirmColor: const Color(0xFFFF4D4D),
//       ),
//     );
//     if (confirmed != true) return;
//     // TODO: call factory-reset API
//     Get.snackbar('Factory Reset Initiated', '${deviceId.value} will reset to factory settings.',
//         backgroundColor: const Color(0xFF15151F), colorText: Colors.white, snackPosition: SnackPosition.BOTTOM);
//   }
//
//   Widget _confirmDialog({
//     required String title,
//     required String message,
//     required String confirmLabel,
//     required Color confirmColor,
//   }) {
//     return AlertDialog(
//       backgroundColor: const Color(0xFF15151F),
//       shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
//       title: Text(title, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
//       content: Text(message, style: const TextStyle(color: Colors.white60, fontSize: 13)),
//       actions: [
//         TextButton(
//           onPressed: () => Get.back(result: false),
//           child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
//         ),
//         TextButton(
//           onPressed: () => Get.back(result: true),
//           child: Text(confirmLabel, style: TextStyle(color: confirmColor, fontWeight: FontWeight.w700)),
//         ),
//       ],
//     );
//   }
//
//   // ==========================================================
//   // Save / Back
//   // ==========================================================
//   Future<void> onSaveConfig() async {
//     isSaving.value = true;
//     try {
//       // TODO: persist all tab settings via API
//       await Future.delayed(const Duration(seconds: 1));
//       Get.snackbar(
//         'Configuration Saved',
//         'Hardware settings for ${deviceId.value} have been updated.',
//         backgroundColor: const Color(0xFF15151F),
//         colorText: Colors.white,
//         snackPosition: SnackPosition.BOTTOM,
//       );
//     } finally {
//       isSaving.value = false;
//     }
//   }
//
//   void onBackPressed() => Get.back();
//
//   @override
//   void onClose() {
//     proxyAddressCtrl.dispose();
//     proxyPortCtrl.dispose();
//     super.onClose();
//   }
// }
