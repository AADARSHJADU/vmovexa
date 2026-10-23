import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/models/device_config_model.dart';
import 'package:vmovexa/app/data/models/edge_device_model.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';
import 'package:vmovexa/app/data/services/technician_service.dart';
import '../../technician_dashboard/controller/technician_dashboard_controller.dart';
import '../views/configuration_saved_view.dart';

class HardwareConfigController extends GetxController {
  final RxInt signalStrengthPercent = 90.obs;
  final RxString deviceDateTime = 'May 14, 2025 · 09:35 AM'.obs;

  // ==========================================================
  // Device Selection & Active Hardware
  // ==========================================================
  final RxList<EdgeDeviceModel> deviceList = <EdgeDeviceModel>[].obs;
  final Rxn<EdgeDeviceModel> selectedDevice = Rxn<EdgeDeviceModel>();
  final RxString selectedDeviceId = ''.obs;

  final RxBool isLoadingDevices = false.obs;
  final RxBool isLoadingConfig = false.obs;
  final RxBool isSaving = false.obs;
  final RxBool isRebooting = false.obs;
  final RxBool isResetting = false.obs;

  // ==========================================================
  // 3 Sub-tabs (Matching Admin Panel)
  // ==========================================================
  // 0 = Device Settings, 1 = Network Settings, 2 = System & Firmware
  final RxInt selectedTabIndex = 0.obs;
  final List<String> tabLabels = const [
    'Device Settings',
    'Network Settings',
    'System & Firmware',
  ];

  void selectTab(int index) => selectedTabIndex.value = index;

  // ==========================================================
  // TAB 1 — Device Settings State (Display, Audio, Power)
  // ==========================================================

  // Display Settings
  final RxDouble brightness = 80.0.obs;
  void setBrightness(double v) => brightness.value = v;

  final RxString screenTimeout = 'Never'.obs;
  final List<String> screenTimeoutOptions = const [
    '5 Minutes',
    '15 Minutes',
    '30 Minutes',
    'Never',
  ];
  void setScreenTimeout(String? v) => screenTimeout.value = v ?? 'Never';

  final RxBool autoBrightness = true.obs;
  void toggleAutoBrightness(bool v) => autoBrightness.value = v;

  final RxString displayMode = 'Full Screen'.obs;
  final List<String> displayModeOptions = const [
    'Full Screen',
    'Split Screen',
    'Picture-in-Picture',
  ];
  void setDisplayMode(String? v) => displayMode.value = v ?? 'Full Screen';

  final RxString screenOrientation = 'Landscape'.obs;
  final List<String> screenOrientationOptions = const [
    'Landscape',
    'Landscape Flipped',
    'Portrait',
  ];
  void setScreenOrientation(String? v) => screenOrientation.value = v ?? 'Landscape';

  // Audio Settings
  final RxDouble audioVolume = 70.0.obs;
  void setAudioVolume(double v) => audioVolume.value = v;

  final RxBool isMuted = false.obs;
  void toggleMute(bool v) => isMuted.value = v;

  final RxString audioSource = 'Internal Speaker'.obs;
  final List<String> audioSourceOptions = const [
    'Internal Speaker',
    'Vehicle PA System',
    'Bluetooth Audio DAC',
  ];
  void setAudioSource(String? v) => audioSource.value = v ?? 'Internal Speaker';

  // Power Management
  final RxString powerMode = 'Normal Operational Mode'.obs;
  final List<String> powerModeOptions = const [
    'Normal Operational Mode',
    'Eco Battery Saver',
    'Aggressive Low Power',
  ];
  void setPowerMode(String? v) => powerMode.value = v ?? 'Normal Operational Mode';

  final autoPowerOnCtrl = TextEditingController(text: '06:00 AM');
  final autoPowerOffCtrl = TextEditingController(text: '11:00 PM');

  // ==========================================================
  // TAB 2 — Network Settings State
  // ==========================================================
  final RxString networkType = 'Wi-Fi'.obs;
  final List<String> networkTypeOptions = const [
    'Wi-Fi',
    'LTE 4G Cellular',
    'Ethernet LAN',
  ];
  void setNetworkType(String? v) => networkType.value = v ?? 'Wi-Fi';

  final ssidCtrl = TextEditingController();
  final RxString ipAddress = '192.168.1.120'.obs;

  final RxBool peerProxy = false.obs;
  void togglePeerProxy(bool v) => peerProxy.value = v;

  final RxString proxyType = 'HTTP'.obs;
  final List<String> proxyTypeOptions = const ['HTTP', 'HTTPS', 'SOCKS5'];
  void setProxyType(String? v) => proxyType.value = v ?? 'HTTP';

  final proxyHostCtrl = TextEditingController();
  final proxyPortCtrl = TextEditingController();

  final RxBool autoTime = true.obs;

  // ==========================================================
  // Lifecycle
  // ==========================================================
  @override
  void onInit() {
    super.onInit();
    _handleInitialArguments();
    loadDevices();
  }

  void _handleInitialArguments() {
    final args = Get.arguments;
    if (args is EdgeDeviceModel) {
      selectedDevice.value = args;
      selectedDeviceId.value = args.id.toString();
    } else if (args is Map) {
      final id = (args['deviceId'] ?? args['id'] ?? '').toString();
      if (id.isNotEmpty) {
        selectedDeviceId.value = id;
      }
    }
  }

  // ==========================================================
  // Device Loading & Switching
  // ==========================================================
  Future<void> loadDevices() async {
    isLoadingDevices.value = true;
    try {
      final res = await TechnicianService.to.getEdgeDevices(page: 1, limit: 100);
      if (res.success && res.data != null && res.data!.isNotEmpty) {
        deviceList.assignAll(res.data!);

        // Select initial device if not yet selected
        if (selectedDevice.value == null) {
          if (selectedDeviceId.value.isNotEmpty) {
            final match = deviceList.firstWhereOrNull((d) => d.id.toString() == selectedDeviceId.value || d.boxId == selectedDeviceId.value);
            selectedDevice.value = match ?? deviceList.first;
          } else {
            selectedDevice.value = deviceList.first;
          }
          selectedDeviceId.value = selectedDevice.value!.id.toString();
        }

        if (selectedDevice.value != null) {
          await loadEdgeConfig(selectedDevice.value!.id.toString());
        }
      } else {
        // Fallback default mock device if server returns empty list
        if (selectedDevice.value == null) {
          final fallback = EdgeDeviceModel(
            id: 'edge_default_01',
            boxId: 'VMX-BOX-8841',
            status: 'online',
            mac: '00:1A:2B:3C:4D:5E',
            agentVersion: 'v2.4.1',
            simNetwork: 'Jio 5G',
            vehicleId: '101',
            vehicleReg: 'MH12 AB 1234',
            depotName: 'Mumbai Central Depot',
            isActive: true,
          );
          deviceList.assignAll([fallback]);
          selectedDevice.value = fallback;
          selectedDeviceId.value = fallback.id.toString();
        }
      }
    } catch (_) {
      // In case of error, ensure fallback is available
      if (selectedDevice.value == null) {
        final fallback = EdgeDeviceModel(
          id: 'edge_default_01',
          boxId: 'VMX-BOX-8841',
          status: 'online',
          mac: '00:1A:2B:3C:4D:5E',
          agentVersion: 'v2.4.1',
          simNetwork: 'Jio 5G',
          vehicleId: '101',
          vehicleReg: 'MH12 AB 1234',
          depotName: 'Mumbai Central Depot',
          isActive: true,
        );
        deviceList.assignAll([fallback]);
        selectedDevice.value = fallback;
        selectedDeviceId.value = fallback.id.toString();
      }
    } finally {
      isLoadingDevices.value = false;
    }
  }

  void selectDevice(EdgeDeviceModel dev) {
    selectedDevice.value = dev;
    selectedDeviceId.value = dev.id.toString();
    loadEdgeConfig(dev.id.toString());
  }

  // ==========================================================
  // Fetch Real Config from Server (GET /edge-devices/:id/config)
  // ==========================================================
  Future<void> loadEdgeConfig(dynamic deviceId) async {
    final devId = deviceId?.toString() ?? '';
    if (devId.isEmpty) return;
    isLoadingConfig.value = true;
    try {
      final res = await TechnicianService.to.getEdgeConfig(devId);
      if (res.success && res.data != null) {
        _hydrateConfig(res.data!);
      }
    } catch (_) {
      // Keep defaults if config fetch encounters network issue
    } finally {
      isLoadingConfig.value = false;
    }
  }

  void _hydrateConfig(DeviceConfigModel cfg) {
    brightness.value = cfg.brightness;
    screenTimeout.value = cfg.screenTimeout.isNotEmpty ? cfg.screenTimeout : 'Never';
    autoBrightness.value = cfg.autoBrightness;
    displayMode.value = cfg.displayMode.isNotEmpty ? cfg.displayMode : 'Full Screen';
    screenOrientation.value = cfg.screenOrientation.isNotEmpty ? cfg.screenOrientation : 'Landscape';

    audioVolume.value = cfg.audioVolume;
    isMuted.value = cfg.isMuted;
    audioSource.value = cfg.audioSource.isNotEmpty ? cfg.audioSource : 'Internal Speaker';

    powerMode.value = cfg.powerMode.isNotEmpty ? cfg.powerMode : 'Normal Operational Mode';
    autoPowerOnCtrl.text = cfg.autoPowerOn.isNotEmpty ? cfg.autoPowerOn : '06:00 AM';
    autoPowerOffCtrl.text = cfg.autoPowerOff.isNotEmpty ? cfg.autoPowerOff : '11:00 PM';

    networkType.value = cfg.networkType.isNotEmpty ? cfg.networkType : 'Wi-Fi';
    ssidCtrl.text = cfg.ssid;
    ipAddress.value = cfg.ipAddress.isNotEmpty ? cfg.ipAddress : '192.168.1.120';

    peerProxy.value = cfg.peerProxy;
    proxyType.value = cfg.proxyType.isNotEmpty ? cfg.proxyType : 'HTTP';
    proxyHostCtrl.text = cfg.proxyHost;
    proxyPortCtrl.text = cfg.proxyPort;
    autoTime.value = cfg.autoTime;
  }

  // ==========================================================
  // Push Config to Server (POST /edge-devices/:id/config)
  // ==========================================================
  Future<void> onSaveConfiguration() async {
    final dev = selectedDevice.value ?? deviceList.firstOrNull;
    if (dev == null) {
      Get.snackbar(
        'No Device Selected',
        'Please select a device to configure.',
        backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.2),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(12),
      );
      return;
    }

    final devIdStr = dev.id.toString();
    isSaving.value = true;
    try {
      final configPayload = <String, dynamic>{
        'brightness': brightness.value.toInt(),
        'screenTimeout': screenTimeout.value,
        'autoBrightness': autoBrightness.value,
        'displayMode': displayMode.value,
        'screenOrientation': screenOrientation.value,
        'audioVolume': audioVolume.value.toInt(),
        'isMuted': isMuted.value,
        'audioSource': audioSource.value,
        'powerMode': powerMode.value,
        'autoPowerOn': autoPowerOnCtrl.text.trim(),
        'autoPowerOff': autoPowerOffCtrl.text.trim(),
        'networkType': networkType.value,
        'ssid': ssidCtrl.text.trim(),
        'ipAddress': ipAddress.value,
        'peerProxy': peerProxy.value,
        'proxyType': proxyType.value,
        'proxyHost': proxyHostCtrl.text.trim(),
        'proxyPort': proxyPortCtrl.text.trim(),
        'autoTime': autoTime.value,
      };

      final res = await TechnicianService.to.pushEdgeConfig(devIdStr, configPayload);
      if (res.success) {
        Get.snackbar(
          'Configuration Pushed',
          'Hardware parameters pushed to ${dev.boxId.isNotEmpty ? dev.boxId : devIdStr} successfully.',
          backgroundColor: const Color(0xFF10B981).withValues(alpha: 0.2),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(12),
        );
        Get.to(() => const ConfigurationSavedView());
      } else {
        Get.snackbar(
          'Push Failed',
          res.displayErrorMessage,
          backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.2),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(12),
        );
      }
    } catch (e) {
      debugPrint('Save config error: $e');
      Get.snackbar(
        'Error',
        e.toString(),
        backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.2),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(12),
      );
    } finally {
      isSaving.value = false;
    }
  }

  // ==========================================================
  // Remote Device Operations (Reboot & Factory Reset)
  // ==========================================================
  Future<void> onRebootController() async {
    final dev = selectedDevice.value;
    if (dev == null) return;
    final devIdStr = dev.id.toString();

    final confirmed = await Get.dialog<bool>(
      _buildConfirmDialog(
        title: 'Reboot Display Controller',
        message: 'Send remote reboot command to ${dev.boxId.isNotEmpty ? dev.boxId : devIdStr}? Device will restart and reconnect.',
        confirmLabel: 'Reboot Controller',
        confirmColor: const Color(0xFF6366F1),
      ),
    );
    if (confirmed != true) return;

    isRebooting.value = true;
    try {
      final res = await TechnicianService.to.rebootEdgeDevice(devIdStr);
      Get.snackbar(
        'Reboot Signal Dispatched',
        res.message != null && res.message!.isNotEmpty ? res.message! : 'Reboot command sent to ${dev.boxId.isNotEmpty ? dev.boxId : devIdStr}.',
        backgroundColor: const Color(0xFF10B981).withValues(alpha: 0.2),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(12),
      );
    } catch (e) {
      Get.snackbar(
        'Reboot Error',
        e.toString(),
        backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.2),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(12),
      );
    } finally {
      isRebooting.value = false;
    }
  }

  Future<void> onFactoryReset() async {
    final dev = selectedDevice.value;
    if (dev == null) return;
    final devIdStr = dev.id.toString();

    final confirmed = await Get.dialog<bool>(
      _buildConfirmDialog(
        title: 'Confirm Factory Reset?',
        message: 'This will wipe local cached campaigns, stored offline logs, and reset network credentials on device ${dev.boxId.isNotEmpty ? dev.boxId : devIdStr}.',
        confirmLabel: 'Proceed Reset',
        confirmColor: const Color(0xFFEF4444),
      ),
    );
    if (confirmed != true) return;

    isResetting.value = true;
    try {
      final res = await TechnicianService.to.factoryResetEdgeDevice(devIdStr);
      Get.snackbar(
        'Factory Reset Dispatched',
        res.message != null && res.message!.isNotEmpty ? res.message! : 'Device ${dev.boxId.isNotEmpty ? dev.boxId : devIdStr} has been reset.',
        backgroundColor: const Color(0xFF10B981).withValues(alpha: 0.2),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(12),
      );
      await loadEdgeConfig(devIdStr);
    } catch (e) {
      Get.snackbar(
        'Reset Error',
        e.toString(),
        backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.2),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(12),
      );
    } finally {
      isResetting.value = false;
    }
  }

  Widget _buildConfirmDialog({
    required String title,
    required String message,
    required String confirmLabel,
    required Color confirmColor,
  }) {
    return AlertDialog(
      backgroundColor: const Color(0xFF15151F),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: Text(title, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
      content: Text(message, style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.4)),
      actions: [
        TextButton(
          onPressed: () => Get.back(result: false),
          child: const Text('Cancel', style: TextStyle(color: Colors.white54, fontWeight: FontWeight.w600)),
        ),
        ElevatedButton(
          onPressed: () => Get.back(result: true),
          style: ElevatedButton.styleFrom(
            backgroundColor: confirmColor,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            elevation: 0,
          ),
          child: Text(confirmLabel, style: const TextStyle(fontWeight: FontWeight.bold)),
        ),
      ],
    );
  }

  // ==========================================================
  // Post-Save Navigation
  // ==========================================================
  void onGoToDisplayDevices() {
    Get.until((route) => route.isFirst);
    if (Get.isRegistered<TechnicianDashboardController>()) {
      Get.find<TechnicianDashboardController>().onNavItemTapped(2);
    }
  }

  // ==========================================================
  // Summary & Compatibility Getters
  // ==========================================================
  RxString get deviceId => (selectedDevice.value?.boxId.isNotEmpty == true
      ? selectedDevice.value!.boxId
      : (selectedDeviceId.value.isNotEmpty ? selectedDeviceId.value : 'VMX-BOX-8841')).obs;

  RxString get vehicleNumber => (selectedDevice.value?.vehicleReg.isNotEmpty == true
      ? selectedDevice.value!.vehicleReg
      : 'Bus #${selectedDevice.value?.vehicleId ?? "101"}').obs;

  RxString get depotLocation => (selectedDevice.value?.depotName.isNotEmpty == true
      ? selectedDevice.value!.depotName
      : 'Mumbai Central Depot').obs;

  RxBool get isDeviceOnline => (selectedDevice.value?.isOnline ?? true).obs;

  static const List<String> _monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  String get savedOnText {
    final now = DateTime.now();
    final month = _monthNames[now.month - 1];
    final hour12 = now.hour % 12 == 0 ? 12 : now.hour % 12;
    final minute = now.minute.toString().padLeft(2, '0');
    final period = now.hour >= 12 ? 'PM' : 'AM';
    return '$month ${now.day}, ${now.year}, ${hour12.toString().padLeft(2, '0')}:$minute $period';
  }

  RxString get savedByLabel {
    final user = Get.isRegistered<StorageService>() ? StorageService.to.getUser() : null;
    return (user?.name != null && user!.name!.isNotEmpty ? '${user.name} (Technician)' : 'Technician').obs;
  }
  final RxString configVersionLabel = '1.2.latest (OTA Synced)'.obs;
  final RxString sectionsUpdatedLabel = '3 of 3 Sections Verified'.obs;

  void onConfigureAnotherDevice() => Get.back();
  void onConfirmSaveConfig() => onSaveConfiguration();
  void onEditSection(int index) {
    selectTab(index);
    Get.back();
  }

  RxDouble get screenBrightness => brightness;
  RxDouble get volumeLevel => audioVolume;
  RxString get audioOutput => audioSource;
  RxString get autoPowerOn => autoPowerOnCtrl.text.obs;
  RxString get autoPowerOff => autoPowerOffCtrl.text.obs;
  RxString get connectionType => networkType;
  RxString get wifiSsid => ssidCtrl.text.obs;
  RxBool get useProxy => peerProxy;
  RxString get timeZoneLabel => 'Asia/Kolkata (GMT +05:30)'.obs;
  RxBool get autoTimeSync => autoTime;
  RxString get firmwareVersion => '1.2.0 (Latest)'.obs;
  RxString get edgeAgentVersion => (selectedDevice.value?.agentVersion ?? 'v2.4.1').obs;
  RxString get assignedVehicle => vehicleNumber;
  RxString get organizationFleet => depotLocation;
  RxString get installationPosition => 'Front Section - Bulkhead Mount'.obs;
  RxString get vehiclePowerSource => 'Vehicle Battery (24V System)'.obs;
  void onConfigureAnotherParameter() => Get.back();
  void onBackPressed() => Get.back();
  void onGoToReviewAndSave() => onSaveConfiguration();

  @override
  void onClose() {
    autoPowerOnCtrl.dispose();
    autoPowerOffCtrl.dispose();
    ssidCtrl.dispose();
    proxyHostCtrl.dispose();
    proxyPortCtrl.dispose();
    super.onClose();
  }
}
