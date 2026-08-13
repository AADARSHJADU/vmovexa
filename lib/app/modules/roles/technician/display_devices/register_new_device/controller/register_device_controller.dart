import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../model/vehicle_details_model.dart';
import '../view/configuration_view.dart';
import '../view/vehicle_assignment_view.dart';

class RegisterDeviceController extends GetxController {
  // ---------------- Stepper ----------------
  final RxInt currentStep = 1.obs; // 1 = Device Details, 2 = Vehicle Assignment, 3 = Configuration, 4 = Review & Save
  final List<String> stepLabels = const [
    'Device Details',
    'Vehicle Assignment',
    'Configuration',
    'Review & Save',
  ];

  // ---------------- Text controllers (Step 1: Device Information) ----------------
  final deviceIdCtrl = TextEditingController();
  final deviceNameCtrl = TextEditingController();
  final hardwareModelCtrl = TextEditingController();
  final notesCtrl = TextEditingController();

  static const int deviceIdMaxLen = 50;
  static const int deviceNameMaxLen = 50;
  static const int notesMaxLen = 200;

  final RxInt deviceIdLen = 0.obs;
  final RxInt deviceNameLen = 0.obs;
  final RxInt notesLen = 0.obs;

  // ---------------- Dropdown selections ----------------
  final RxString deviceType = ''.obs;
  final List<String> deviceTypeOptions = const [
    'LED Display',
    'LCD Display',
    'Digital Signage Board',
    'GPS-Integrated Display',
  ];

  final RxString screenSize = ''.obs;
  final List<String> screenSizeOptions = const ['15"', '19"', '22"', '32"', '43"'];

  final RxString resolution = ''.obs;
  final List<String> resolutionOptions = const ['1280x720', '1920x1080', '2560x1440', '3840x2160'];

  final RxString orientation = ''.obs;
  final List<String> orientationOptions = const ['Landscape', 'Portrait'];

  final RxString locationDepot = ''.obs;
  final List<String> locationDepotOptions = const [
    'Mumbai Central Depot',
    'Andheri Depot',
    'Thane Depot',
    'Borivali Depot',
    'Kurla Depot',
    'Navi Mumbai Depot',
  ];

  // ---------------- Validation errors ----------------
  final RxnString deviceIdError = RxnString();
  final RxnString deviceNameError = RxnString();
  final RxnString deviceTypeError = RxnString();
  final RxnString locationDepotError = RxnString();

  final RxBool isSaving = false.obs;

  // ==========================================================
  // STEP 2 — Vehicle Assignment
  // ==========================================================

  // Device summary shown at top of step 2 (pulled from step 1 entries)
  String get registeredDeviceId =>
      deviceIdCtrl.text.trim().isEmpty ? 'VMX-DP-1001' : deviceIdCtrl.text.trim();
  String get registeredDeviceName =>
      deviceNameCtrl.text.trim().isEmpty ? 'Display Device' : deviceNameCtrl.text.trim();
  String get registeredSerialNo => 'Serial No: VMXDP1001A2345';
  final RxBool isDeviceOnline = true.obs;

  final RxString organization = ''.obs;
  final List<String> organizationOptions = const [
    'VMOVEXA City Bus Service',
    'VMOVEXA Metro Feeder',
    'VMOVEXA Intercity',
  ];

  final RxString selectedVehicle = ''.obs;
  final List<String> vehicleOptions = const [
    'Bus MH12 AB 1234',
    'Bus MH12 AB 5678',
    'Bus MH12 AB 9101',
  ];

  // Mock vehicle detail lookup keyed by vehicle number
  final Map<String, VehicleDetails> _vehicleDetailsMap = {
    'Bus MH12 AB 1234': VehicleDetails(
      name: 'Bus MH12 AB 1234',
      status: 'Active',
      vehicleType: 'Bus',
      depotLocation: 'Mumbai Central Depot',
      capacity: '52 Seats',
      driver: 'Ramesh Patil',
      route: 'Route 101 (Andheri ↔ CST)',
      imageAsset: '',
    ),
    'Bus MH12 AB 5678': VehicleDetails(
      name: 'Bus MH12 AB 5678',
      status: 'Active',
      vehicleType: 'Bus',
      depotLocation: 'Andheri Depot',
      capacity: '45 Seats',
      driver: 'Suresh Yadav',
      route: 'Route 212 (Borivali ↔ Bandra)',
      imageAsset: '',
    ),
    'Bus MH12 AB 9101': VehicleDetails(
      name: 'Bus MH12 AB 9101',
      status: 'In Maintenance',
      vehicleType: 'Bus',
      depotLocation: 'Thane Depot',
      capacity: '52 Seats',
      driver: 'Unassigned',
      route: 'Route 305 (Thane ↔ Kalyan)',
      imageAsset: '',
    ),
  };

  final Rxn<VehicleDetails> selectedVehicleDetails = Rxn<VehicleDetails>();

  final RxString installationPosition = ''.obs;
  final List<String> installationPositionOptions = const [
    'Front Section - Left Side',
    'Front Section - Right Side',
    'Middle Section',
    'Rear Section',
  ];

  final RxString powerSource = ''.obs;
  final List<String> powerSourceOptions = const [
    'Vehicle Battery',
    'External Power Bank',
    'Solar Panel',
  ];

  final vehicleNotesCtrl = TextEditingController();
  final RxInt vehicleNotesLen = 0.obs;

  final RxnString organizationError = RxnString();
  final RxnString vehicleError = RxnString();

  void setOrganization(String? value) {
    organization.value = value ?? '';
    if (value != null) organizationError.value = null;
  }

  void setSelectedVehicle(String? value) {
    selectedVehicle.value = value ?? '';
    selectedVehicleDetails.value =
        value != null ? _vehicleDetailsMap[value] : null;
    if (value != null) vehicleError.value = null;
  }

  void setInstallationPosition(String? value) => installationPosition.value = value ?? '';
  void setPowerSource(String? value) => powerSource.value = value ?? '';

  bool _validateStep2() {
    bool isValid = true;

    if (organization.value.isEmpty) {
      organizationError.value = 'Please select an organization / fleet';
      isValid = false;
    } else {
      organizationError.value = null;
    }

    if (selectedVehicle.value.isEmpty) {
      vehicleError.value = 'Please select a vehicle';
      isValid = false;
    } else {
      vehicleError.value = null;
    }

    return isValid;
  }

  void onStep2BackPressed() {
    currentStep.value = 1;
    Get.back();
  }

  Future<void> onStep2NextPressed() async {
    if (!_validateStep2()) {
      Get.snackbar(
        'Missing Information',
        'Please fill all required fields marked with *',
        backgroundColor: const Color(0xFF15151F),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }
    currentStep.value = 3;
    Get.to(() => const ConfigurationView());
  }

  // ==========================================================
  // STEP 3 — Configuration
  // ==========================================================

  // ---- Display Settings ----
  final RxDouble screenBrightness = 70.0.obs;
  final RxDouble volumeLevel = 60.0.obs;

  final RxString displayOrientation = 'Landscape'.obs;
  final List<String> displayOrientationOptions = const ['Landscape', 'Portrait'];

  final RxString screenTimeout = '5 Minutes'.obs;
  final List<String> screenTimeoutOptions = const [
    '1 Minute',
    '5 Minutes',
    '10 Minutes',
    '30 Minutes',
    'Never',
  ];

  // ---- Connectivity Settings ----
  final RxString networkType = 'Wi-Fi'.obs;
  final List<String> networkTypeOptions = const ['Wi-Fi', 'Ethernet', '4G / LTE'];

  final wifiSsidCtrl = TextEditingController(text: 'VMOVEXA_Network');
  final wifiPasswordCtrl = TextEditingController();
  final RxBool isWifiPasswordVisible = false.obs;

  // ---- Content & Playback Settings ----
  final RxBool autoPlayOnBoot = true.obs;
  final RxBool loopContent = true.obs;

  final RxString defaultContentSource = 'VMOVEXA CMS'.obs;
  final List<String> defaultContentSourceOptions = const [
    'VMOVEXA CMS',
    'Local Storage',
    'Custom URL',
  ];

  final RxString contentUpdateFrequency = 'Every 6 Hours'.obs;
  final List<String> contentUpdateFrequencyOptions = const [
    'Every 1 Hour',
    'Every 6 Hours',
    'Every 12 Hours',
    'Daily',
  ];

  final RxBool syncTimeWithServer = true.obs;

  // ---- System & Maintenance ----
  final RxBool remoteMonitoring = true.obs;
  final RxBool enableAlerts = true.obs;

  final RxString rebootSchedule = 'Daily at 03:00 AM'.obs;
  final List<String> rebootScheduleOptions = const [
    'Never',
    'Daily at 03:00 AM',
    'Weekly (Sunday 03:00 AM)',
  ];

  final RxString timeZone = '(GMT +05:30) Asia/Kolkata'.obs;
  final List<String> timeZoneOptions = const [
    '(GMT +05:30) Asia/Kolkata',
    '(GMT +00:00) UTC',
    '(GMT -05:00) America/New_York',
  ];

  final configNotesCtrl = TextEditingController();
  final RxInt configNotesLen = 0.obs;

  final RxnString ssidError = RxnString();
  final RxnString wifiPasswordError = RxnString();

  void setScreenBrightness(double value) => screenBrightness.value = value;
  void setVolumeLevel(double value) => volumeLevel.value = value;
  void setDisplayOrientation(String? value) => displayOrientation.value = value ?? '';
  void setScreenTimeout(String? value) => screenTimeout.value = value ?? '';

  void setNetworkType(String? value) {
    networkType.value = value ?? '';
    ssidError.value = null;
    wifiPasswordError.value = null;
  }

  void toggleWifiPasswordVisibility() =>
      isWifiPasswordVisible.value = !isWifiPasswordVisible.value;

  void toggleAutoPlayOnBoot(bool value) => autoPlayOnBoot.value = value;
  void toggleLoopContent(bool value) => loopContent.value = value;
  void setDefaultContentSource(String? value) => defaultContentSource.value = value ?? '';
  void setContentUpdateFrequency(String? value) => contentUpdateFrequency.value = value ?? '';
  void toggleSyncTimeWithServer(bool value) => syncTimeWithServer.value = value;

  void toggleRemoteMonitoring(bool value) => remoteMonitoring.value = value;
  void toggleEnableAlerts(bool value) => enableAlerts.value = value;
  void setRebootSchedule(String? value) => rebootSchedule.value = value ?? '';
  void setTimeZone(String? value) => timeZone.value = value ?? '';

  bool _validateStep3() {
    bool isValid = true;

    if (networkType.value == 'Wi-Fi') {
      if (wifiSsidCtrl.text.trim().isEmpty) {
        ssidError.value = 'Wi-Fi network name is required';
        isValid = false;
      } else {
        ssidError.value = null;
      }

      if (wifiPasswordCtrl.text.trim().isEmpty) {
        wifiPasswordError.value = 'Wi-Fi password is required';
        isValid = false;
      } else {
        wifiPasswordError.value = null;
      }
    }

    return isValid;
  }

  void onStep3BackPressed() {
    currentStep.value = 2;
    Get.back();
  }

  Future<void> onStep3NextPressed() async {
    if (!_validateStep3()) {
      Get.snackbar(
        'Missing Information',
        'Please fill all required fields marked with *',
        backgroundColor: const Color(0xFF15151F),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }
    currentStep.value = 4;
    // TODO: Get.to(() => const ReviewAndSaveView());
  }

  @override
  void onInit() {
    super.onInit();
    deviceIdCtrl.addListener(() {
      deviceIdLen.value = deviceIdCtrl.text.length;
    });
    deviceNameCtrl.addListener(() {
      deviceNameLen.value = deviceNameCtrl.text.length;
    });
    notesCtrl.addListener(() {
      notesLen.value = notesCtrl.text.length;
    });
    vehicleNotesCtrl.addListener(() {
      vehicleNotesLen.value = vehicleNotesCtrl.text.length;
    });
    configNotesCtrl.addListener(() {
      configNotesLen.value = configNotesCtrl.text.length;
    });
  }

  @override
  void onClose() {
    deviceIdCtrl.dispose();
    deviceNameCtrl.dispose();
    hardwareModelCtrl.dispose();
    notesCtrl.dispose();
    vehicleNotesCtrl.dispose();
    wifiSsidCtrl.dispose();
    wifiPasswordCtrl.dispose();
    configNotesCtrl.dispose();
    super.onClose();
  }

  // ---------------- Dropdown setters ----------------
  void setDeviceType(String? value) {
    deviceType.value = value ?? '';
    if (value != null) deviceTypeError.value = null;
  }

  void setScreenSize(String? value) => screenSize.value = value ?? '';
  void setResolution(String? value) => resolution.value = value ?? '';
  void setOrientation(String? value) => orientation.value = value ?? '';

  void setLocationDepot(String? value) {
    locationDepot.value = value ?? '';
    if (value != null) locationDepotError.value = null;
  }

  // ---------------- Validation ----------------
  bool _validateStep1() {
    bool isValid = true;

    if (deviceIdCtrl.text.trim().isEmpty) {
      deviceIdError.value = 'Device ID is required';
      isValid = false;
    } else {
      deviceIdError.value = null;
    }

    if (deviceNameCtrl.text.trim().isEmpty) {
      deviceNameError.value = 'Device name is required';
      isValid = false;
    } else {
      deviceNameError.value = null;
    }

    if (deviceType.value.isEmpty) {
      deviceTypeError.value = 'Please select a device type';
      isValid = false;
    } else {
      deviceTypeError.value = null;
    }

    if (locationDepot.value.isEmpty) {
      locationDepotError.value = 'Please select a location/depot';
      isValid = false;
    } else {
      locationDepotError.value = null;
    }

    return isValid;
  }

  // ---------------- Actions ----------------
  void onScanQr() {
    // TODO: integrate QR scanner (mobile_scanner / qr_code_scanner) and
    // auto-fill deviceIdCtrl.text with the scanned value.
  }

  void onBackPressed() => Get.back();

  Future<void> onNextPressed() async {
    if (currentStep.value == 1) {
      if (!_validateStep1()) {
        Get.snackbar(
          'Missing Information',
          'Please fill all required fields marked with *',
          backgroundColor: const Color(0xFF15151F),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
        return;
      }
      currentStep.value = 2;
      Get.to(() => const VehicleAssignmentView());
      return;
    }
    // handle further steps similarly...
  }

  void goToStep(int step) {
    if (step < currentStep.value) {
      currentStep.value = step; // allow going back to a previously completed step
    }
  }
}
