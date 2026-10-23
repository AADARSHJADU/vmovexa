import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/models/fleet_models.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';
import 'package:vmovexa/app/data/services/technician_service.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import '../view/gps_installation_success_view.dart';

class GpsInstallationController extends GetxController {
  // ==========================================================
  // Vehicle Selection
  // ==========================================================
  final RxList<VehicleItemModel> vehicleList = <VehicleItemModel>[].obs;
  final RxBool isLoadingVehicles = false.obs;
  final Rxn<VehicleItemModel> selectedVehicle = Rxn<VehicleItemModel>();
  final RxString selectedVehicleId = ''.obs;
  final RxnString vehicleError = RxnString();

  // ==========================================================
  // GPS Telematics Box ID & Input
  // ==========================================================
  final gpsDeviceIdCtrl = TextEditingController();
  final RxnString gpsDeviceIdError = RxnString();

  // ==========================================================
  // 3 Hardware Parameters (Matching Admin Panel)
  // ==========================================================
  final RxString mountingPosition = 'Under Dashboard Harness'.obs;
  final List<String> mountingOptions = const [
    'Under Dashboard Harness',
    'Front Windshield Header',
    'Roof Antenna Magnetic Mount',
  ];

  final RxString powerWire = 'Continuous 24V + ACC Ignition Sense'.obs;
  final List<String> powerOptions = const [
    'Continuous 24V + ACC Ignition Sense',
    'CAN-bus J1939 Connector',
    'OBD-II Port Interface',
  ];

  final RxString simCardProvider = 'Airtel M2M Corporate SIM (eSIM)'.obs;
  final List<String> simOptions = const [
    'Airtel M2M Corporate SIM (eSIM)',
    'Jio Enterprise IoT SIM',
    'Vodafone Idea M2M Multi-Carrier',
  ];

  // ==========================================================
  // Installation & Success State
  // ==========================================================
  final RxBool isInstalling = false.obs;
  final Rxn<DateTime> assignedOnDateTime = Rxn<DateTime>();
  final RxString assignedByLabel = 'Technician'.obs;

  final RxString installedBusNumber = ''.obs;
  final RxString installedDepot = ''.obs;
  final RxString installedGpsId = ''.obs;
  final RxString installedVehicleType = ''.obs;

  static const List<String> _monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  String get assignedOnText {
    final dt = assignedOnDateTime.value ?? DateTime.now();
    final month = _monthNames[dt.month - 1];
    final hour12 = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
    final minute = dt.minute.toString().padLeft(2, '0');
    final period = dt.hour >= 12 ? 'PM' : 'AM';
    return '$month ${dt.day}, ${dt.year} · ${hour12.toString().padLeft(2, '0')}:$minute $period';
  }

  // Compatibility getter for view
  String get selectedVehicleDepot =>
      selectedVehicle.value?.depotName ??
      (selectedVehicle.value?.depotId != null ? 'Depot #${selectedVehicle.value!.depotId}' : '—');

  // ==========================================================
  // Lifecycle
  // ==========================================================
  @override
  void onInit() {
    super.onInit();
    _initLoggedInUser();
    _handleArguments();
    loadVehicles();
  }

  void _initLoggedInUser() {
    if (Get.isRegistered<StorageService>()) {
      final user = StorageService.to.getUser();
      if (user?.name != null && user!.name!.isNotEmpty) {
        assignedByLabel.value = user.name!;
      }
    }
  }

  void _handleArguments() {
    final args = Get.arguments;
    if (args is VehicleItemModel) {
      selectedVehicle.value = args;
      selectedVehicleId.value = args.id;
    } else if (args is Map) {
      final id = (args['vehicleId'] ?? args['id'] ?? '').toString();
      if (id.isNotEmpty) {
        selectedVehicleId.value = id;
      }
      final gps = (args['gpsDeviceId'] ?? args['code'] ?? '').toString();
      if (gps.isNotEmpty) {
        gpsDeviceIdCtrl.text = gps;
      }
    }
  }

  // ==========================================================
  // Vehicles Loading & Selection
  // ==========================================================
  Future<void> loadVehicles() async {
    isLoadingVehicles.value = true;
    try {
      final res = await TechnicianService.to.getVehicles(page: 1, limit: 100);
      if (res.success && res.data != null && res.data!.isNotEmpty) {
        vehicleList.assignAll(res.data!);

        // Hydrate selection
        if (selectedVehicleId.value.isNotEmpty) {
          final match = vehicleList.firstWhereOrNull((v) => v.id == selectedVehicleId.value);
          selectedVehicle.value = match ?? vehicleList.first;
        } else {
          selectedVehicle.value = vehicleList.first;
          selectedVehicleId.value = vehicleList.first.id;
        }
      } else {
        // Fallback default vehicles matching admin panel mock data
        if (vehicleList.isEmpty) {
          final fallback = _mockVehicles();
          vehicleList.assignAll(fallback);
          selectedVehicle.value = fallback.first;
          selectedVehicleId.value = fallback.first.id;
        }
      }
    } catch (_) {
      if (vehicleList.isEmpty) {
        final fallback = _mockVehicles();
        vehicleList.assignAll(fallback);
        selectedVehicle.value = fallback.first;
        selectedVehicleId.value = fallback.first.id;
      }
    } finally {
      isLoadingVehicles.value = false;
    }
  }

  void setSelectedVehicle(String? value) {
    if (value == null) return;
    selectedVehicleId.value = value;
    final match = vehicleList.firstWhereOrNull((v) => v.id == value);
    if (match != null) {
      selectedVehicle.value = match;
      vehicleError.value = null;
    }
  }

  List<VehicleItemModel> _mockVehicles() {
    return [
      VehicleItemModel(
        id: '1',
        registrationNumber: 'MH12 AB 1234',
        vehicleType: 'Tata Starbus Ultra AC',
        depotName: 'Mumbai Central Depot',
        depotId: '1',
        fleetId: '1',
        vin: 'VMX-VIN-901',
      ),
      VehicleItemModel(
        id: '2',
        registrationNumber: 'MH12 AB 5678',
        vehicleType: 'Ashok Leyland Electric',
        depotName: 'Andheri Depot',
        depotId: '2',
        fleetId: '1',
        vin: 'VMX-VIN-902',
      ),
      VehicleItemModel(
        id: '3',
        registrationNumber: 'MH12 AB 9101',
        vehicleType: 'Volvo B11R Multi-Axle',
        depotName: 'Thane Depot',
        depotId: '3',
        fleetId: '1',
        vin: 'VMX-VIN-903',
      ),
    ];
  }

  // ==========================================================
  // QR Code Scanner / Prompt Modal (Matching Admin Panel)
  // ==========================================================
  Future<void> onScanQr() async {
    final textCtrl = TextEditingController(text: gpsDeviceIdCtrl.text);

    final scanned = await Get.dialog<String>(
      AlertDialog(
        backgroundColor: const Color(0xFF15151F),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.qr_code_scanner, color: Color(0xFF6366F1), size: 20),
            SizedBox(width: 8),
            Text(
              'Scan / Enter GPS Serial',
              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Scan or type the GPS unit serial / QR code printed on the hardware label:',
              style: TextStyle(color: Colors.white70, fontSize: 12.5),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: textCtrl,
              autofocus: true,
              style: const TextStyle(color: Colors.white, fontFamily: 'monospace', fontWeight: FontWeight.w700),
              decoration: InputDecoration(
                hintText: 'e.g. GPS-MX-00123',
                hintStyle: const TextStyle(color: Colors.white30, fontSize: 13),
                filled: true,
                fillColor: const Color(0xFF1B1B27),
                prefixIcon: const Icon(Icons.qr_code, color: Colors.white38, size: 18),
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: Color(0xFF6366F1), width: 1.5),
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF6366F1),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () => Get.back(result: textCtrl.text.trim()),
            child: const Text('Apply Code'),
          ),
        ],
      ),
    );

    if (scanned != null && scanned.trim().isNotEmpty) {
      gpsDeviceIdCtrl.text = scanned.trim();
      gpsDeviceIdError.value = null;
    }
  }

  // ==========================================================
  // Form Validation & Submission
  // ==========================================================
  bool _validate() {
    bool isValid = true;

    if (selectedVehicle.value == null) {
      vehicleError.value = 'Select a vehicle first';
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
        backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.2),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(12),
      );
      return;
    }

    final veh = selectedVehicle.value!;
    final gpsDeviceId = gpsDeviceIdCtrl.text.trim();

    isInstalling.value = true;
    try {
      // 1. Register GPS Device
      final gpsPayload = <String, dynamic>{
        'code': gpsDeviceId,
        'type': 'external',
        'sim': simCardProvider.value,
        'serialNumber': gpsDeviceId,
        'mountingPosition': mountingPosition.value,
        'powerWire': powerWire.value,
        'simProvider': simCardProvider.value,
        'vehicleId': veh.id,
        if (veh.fleetId != null) 'organizationId': veh.fleetId,
      };

      final regRes = await TechnicianService.to.registerGpsDevice(gpsPayload);

      // Extract generated/assigned ID if returned by server
      dynamic gpsId = gpsDeviceId;
      if (regRes.data is Map) {
        gpsId = regRes.data['id'] ?? regRes.data['gps_id'] ?? regRes.data['device_id'] ?? gpsDeviceId;
      }

      // 2. Bind GPS device to vehicle
      final currentUserId = Get.isRegistered<StorageService>() ? StorageService.to.getUser()?.id : null;
      await TechnicianService.to.assignGpsToVehicle(
        gpsId,
        vehicleId: veh.id,
        mountLocation: mountingPosition.value,
        technicianId: currentUserId?.toString(),
      );

      // 3. Hydrate Success View state
      installedBusNumber.value = veh.registrationNumber;
      installedDepot.value = veh.depotName ?? (veh.depotId != null ? 'Depot #${veh.depotId}' : '—');
      installedVehicleType.value = veh.vehicleType;
      installedGpsId.value = gpsDeviceId;
      assignedOnDateTime.value = DateTime.now();

      Get.snackbar(
        'GPS Unit Registered',
        'GPS device $gpsDeviceId has been assigned to ${veh.registrationNumber}.',
        backgroundColor: const Color(0xFF10B981).withValues(alpha: 0.2),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(12),
      );

      Get.off(() => const GpsInstallationSuccessView());
    } catch (e) {
      debugPrint('GPS install error: $e');
      Get.snackbar(
        'Installation Error',
        e.toString(),
        backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.2),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(12),
      );
    } finally {
      isInstalling.value = false;
    }
  }

  // ==========================================================
  // Post-Success Navigation
  // ==========================================================
  void onViewHardwareStatus() {
    Get.offNamed(Routes.HARDWARE_STATUS);
  }

  void onGoToDashboard() {
    Get.until((route) => route.isFirst);
  }

  void onBackPressed() => Get.back();

  @override
  void onClose() {
    gpsDeviceIdCtrl.dispose();
    super.onClose();
  }
}
