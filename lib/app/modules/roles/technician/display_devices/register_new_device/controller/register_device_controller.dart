import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../model/vehicle_details_model.dart';
import '../view/configuration_view.dart';
import '../view/register_device_view.dart';
import '../view/registration_success_view.dart';
import '../view/review_and_save_view.dart';
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
    Get.to(() => const ReviewAndSaveView());
  }

  // ==========================================================
  // STEP 4 — Review & Save
  // ==========================================================

  String get reviewNotesText =>
      notesCtrl.text.trim().isEmpty ? 'No notes added' : notesCtrl.text.trim();

  /// Wizard nav stack from here: Step1 (base) -> Step2 -> Step3 -> Step4 (this screen).
  /// So popping N times lands back on the target step's view.
  void editDeviceDetails() {
    currentStep.value = 1;
    Get.close(3);
  }

  void editVehicleAssignment() {
    currentStep.value = 2;
    Get.close(2);
  }

  void editConfiguration() {
    currentStep.value = 3;
    Get.close(1);
  }

  void onStep4BackPressed() {
    currentStep.value = 3;
    Get.back();
  }

  Future<void> onSaveDevicePressed() async {
    isSaving.value = true;
    try {
      // TODO: replace with real API call to persist the device
      await Future.delayed(const Duration(seconds: 1));
      registeredOnDateTime.value = DateTime.now();
      Get.off(() => const RegistrationSuccessView());
    } finally {
      isSaving.value = false;
    }
  }

  // ==========================================================
  // Registration Success screen
  // ==========================================================

  final Rxn<DateTime> registeredOnDateTime = Rxn<DateTime>();

  static const List<String> _monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  String get registeredOnText {
    final dt = registeredOnDateTime.value;
    if (dt == null) return '—';
    final month = _monthNames[dt.month - 1];
    final hour12 = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
    final minute = dt.minute.toString().padLeft(2, '0');
    final period = dt.hour >= 12 ? 'PM' : 'AM';
    return '$month ${dt.day}, ${dt.year}, ${hour12.toString().padLeft(2, '0')}:$minute $period';
  }

  /// Friendly label for the device type shown on the success card.
  String get registeredDeviceTypeLabel =>
      deviceType.value.isEmpty ? 'Passenger Display' : deviceType.value;

  String get registeredVehicleDepot => selectedVehicleDetails.value?.depotLocation ?? '';

  void onGoToDisplayDevices() {
    Get.until((route) => route.isFirst);
    Get.toNamed('/display-devices');
  }

  /// Clears every field so the wizard is fresh, then restarts at Step 1.
  void resetWizard() {
    currentStep.value = 1;

    deviceIdCtrl.clear();
    deviceNameCtrl.clear();
    hardwareModelCtrl.clear();
    notesCtrl.clear();
    deviceType.value = '';
    screenSize.value = '';
    resolution.value = '';
    orientation.value = '';
    locationDepot.value = '';
    deviceIdError.value = null;
    deviceNameError.value = null;
    deviceTypeError.value = null;
    locationDepotError.value = null;

    organization.value = '';
    selectedVehicle.value = '';
    selectedVehicleDetails.value = null;
    installationPosition.value = '';
    powerSource.value = '';
    vehicleNotesCtrl.clear();
    organizationError.value = null;
    vehicleError.value = null;

    screenBrightness.value = 70.0;
    volumeLevel.value = 60.0;
    displayOrientation.value = 'Landscape';
    screenTimeout.value = '5 Minutes';
    networkType.value = 'Wi-Fi';
    wifiSsidCtrl.text = 'VMOVEXA_Network';
    wifiPasswordCtrl.clear();
    isWifiPasswordVisible.value = false;
    autoPlayOnBoot.value = true;
    loopContent.value = true;
    defaultContentSource.value = 'VMOVEXA CMS';
    contentUpdateFrequency.value = 'Every 6 Hours';
    syncTimeWithServer.value = true;
    remoteMonitoring.value = true;
    enableAlerts.value = true;
    rebootSchedule.value = 'Daily at 03:00 AM';
    timeZone.value = '(GMT +05:30) Asia/Kolkata';
    configNotesCtrl.clear();
    ssidError.value = null;
    wifiPasswordError.value = null;

    registeredOnDateTime.value = null;
  }

  void onRegisterAnotherDevice() {
    resetWizard();
    Get.until((route) => route.isFirst);
    Get.to(() => const RegisterDeviceView());
  }

  // ==========================================================
  // STEP 4 — Review & Save
  // ==========================================================

  /// Pops [times] routes off the stack — used by "Edit" links to jump
  /// back to an earlier step in the wizard.
  void _popSteps(int times) {
    for (int i = 0; i < times; i++) {
      Get.back();
    }
  }

  // void editDeviceDetails() {
  //   currentStep.value = 1;
  //   _popSteps(3); // Step4 -> Step3 -> Step2 -> Step1
  // }
  //
  // void editVehicleAssignment() {
  //   currentStep.value = 2;
  //   _popSteps(2); // Step4 -> Step3 -> Step2
  // }
  //
  // void editConfiguration() {
  //   currentStep.value = 3;
  //   _popSteps(1); // Step4 -> Step3
  // }

  void editNotes() => editConfiguration();

  // ---- Review getters (pull data entered across steps 1–3) ----
  String get reviewDeviceId => deviceIdCtrl.text.trim().isEmpty ? '—' : deviceIdCtrl.text.trim();
  String get reviewSerialNo => registeredSerialNo.replaceFirst('Serial No: ', '');
  String get reviewDeviceName => deviceNameCtrl.text.trim().isEmpty ? '—' : deviceNameCtrl.text.trim();
  String get reviewDeviceType => deviceType.value.isEmpty ? '—' : deviceType.value;
  String get reviewHardwareModel =>
      hardwareModelCtrl.text.trim().isEmpty ? '—' : hardwareModelCtrl.text.trim();
  String get reviewScreenSize => screenSize.value.isEmpty ? '—' : screenSize.value;
  String get reviewOrientationStep1 => orientation.value.isEmpty ? '—' : orientation.value;

  String get reviewOrganization => organization.value.isEmpty ? '—' : organization.value;
  String get reviewVehicle => selectedVehicle.value.isEmpty ? '—' : selectedVehicle.value;
  String get reviewVehicleType => selectedVehicleDetails.value?.vehicleType ?? '—';
  String get reviewDepotLocation => selectedVehicleDetails.value?.depotLocation ?? '—';
  String get reviewVehicleStatus => selectedVehicleDetails.value?.status ?? '—';

  String get reviewScreenBrightness => '${screenBrightness.value.round()}%';
  String get reviewVolumeLevel => '${volumeLevel.value.round()}%';
  String get reviewDisplayOrientation => displayOrientation.value;
  String get reviewScreenTimeout => screenTimeout.value;
  String get reviewNetworkType => networkType.value;
  String get reviewWifiSsid => wifiSsidCtrl.text.trim().isEmpty ? '—' : wifiSsidCtrl.text.trim();
  String get reviewContentSource => defaultContentSource.value;
  String get reviewAutoPlay => autoPlayOnBoot.value ? 'Enabled' : 'Disabled';

  String get reviewFinalNotes {
    final combined = [configNotesCtrl.text.trim(), notesCtrl.text.trim(), vehicleNotesCtrl.text.trim()]
        .where((n) => n.isNotEmpty)
        .join(' | ');
    return combined.isEmpty ? 'No notes added' : combined;
  }

  Future<void> onSaveDevice() async {
    isSaving.value = true;
    try {
      // TODO: replace with real API call that submits the full payload:
      // deviceId, deviceName, deviceType, hardwareModel, screenSize,
      // orientation, organization, selectedVehicle, configuration fields, notes.
      await Future.delayed(const Duration(seconds: 1));

      Get.snackbar(
        'Device Registered',
        '$reviewDeviceId has been registered and assigned to $reviewVehicle.',
        backgroundColor: const Color(0xFF15151F),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );

      // Return all the way back to the Display Devices list.
      Get.until((route) => route.settings.name == '/display-devices' || route.isFirst);
    } finally {
      isSaving.value = false;
    }
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
