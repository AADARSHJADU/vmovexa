import 'dart:io';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../../data/constants/api_constants.dart';
import '../../../../../data/models/fleet_models.dart';
import '../../../../../data/models/gps_device_model.dart';
import '../../../../../data/services/fleet_service.dart';
import '../../../../../data/services/http_client_service.dart';

// Alias for backwards compatibility if needed
typedef GpsModel = GpsDeviceModel;

class AddGpsController extends GetxController {
  final formKey = GlobalKey<FormState>();

  final RxBool isEditMode = false.obs;
  final RxBool isLoading = false.obs;
  final RxBool isSubmitting = false.obs;
  late final String deviceId;

  // Controllers
  final codeController = TextEditingController();
  final imeiController = TextEditingController();
  final serialNoController = TextEditingController();
  final aliasController = TextEditingController();
  final simNoController = TextEditingController();
  final networkController = TextEditingController();
  final batteryController = TextEditingController();
  final firmwareController = TextEditingController();
  final dateController = TextEditingController();
  final notesController = TextEditingController();

  // Selections
  final RxString selectedType = 'external'.obs;
  final RxString selectedVendor = 'Teltonika'.obs;
  final RxString selectedModel = 'Teltonika FMB920'.obs;
  final RxString selectedProvider = 'Jio'.obs;
  final RxString selectedNetworkType = '4G LTE-M'.obs;
  final RxString selectedMountingPosition = 'Behind Driver Dashboard'.obs;
  final RxString selectedPowerWire = 'Direct Battery Constant (+12V/24V)'.obs;
  final RxString status = 'available'.obs;
  final Rxn<String> selectedVehicleId = Rxn<String>();

  // Available options matching Web Admin
  final List<String> vendors = ['Teltonika', 'Concox', 'Queclink', 'Coban'];
  final List<String> models = [
    'Teltonika FMB920',
    'Queclink GV57',
    'Teltonika FMB125',
    'Coban GPS303',
  ];
  final List<String> providers = ['Jio', 'Airtel', 'Vodafone Idea', 'BSNL', 'International'];
  final List<String> networkTypes = ['4G LTE-M', '4G NB-IoT', '2G/GPRS Legacy', '5G NR'];
  final List<String> mountingPositions = [
    'Behind Driver Dashboard',
    'Under Glove Compartment',
    'Under Front Bumper',
    'Roof Box',
  ];
  final List<String> powerWires = [
    'Direct Battery Constant (+12V/24V)',
    'Switched Ignition ACC',
    'OBD-II Port Passthrough',
    'Solar Trickle Charger',
  ];

  // Vehicles list for dropdown
  final RxList<VehicleItemModel> vehiclesList = <VehicleItemModel>[].obs;

  // Image Upload
  final Rxn<File> selectedImageFile = Rxn<File>();
  final RxString imageUrl = ''.obs;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args is Map && args['id'] != null) {
      isEditMode.value = true;
      deviceId = args['id'].toString();
    } else {
      isEditMode.value = false;
      deviceId = '';
      // Generate default code
      codeController.text = 'GPS-TRK-${10000 + Random().nextInt(90000)}';
      batteryController.text = '1200 mAh';
      firmwareController.text = 'v3.2.14-PROD';
      networkController.text = 'Jio 4G IoT';
      dateController.text = DateTime.now().toIso8601String().split('T')[0];
    }

    // Preselect vehicle if passed in arguments
    if (args is Map && args['vehicleId'] != null) {
      selectedVehicleId.value = args['vehicleId'].toString();
      status.value = 'assigned';
    }

    _loadVehicles();

    if (isEditMode.value) {
      if (args is Map && args['device'] is GpsDeviceModel) {
        _populateFieldsFromDevice(args['device'] as GpsDeviceModel);
      } else {
        _fetchDeviceDetails();
      }
    }
  }

  Future<void> _loadVehicles() async {
    try {
      final res = await FleetService.to.getVehicles(limit: 100);
      if (res.success && res.data != null) {
        vehiclesList.assignAll(res.data!);
      }
    } catch (e) {
      debugPrint('Error loading vehicles: $e');
    }
  }

  Future<void> _fetchDeviceDetails() async {
    isLoading.value = true;
    try {
      final res = await FleetService.to.getGpsDevice(deviceId);
      if (res.success && res.data != null) {
        _populateFieldsFromDevice(res.data!);
      }
    } catch (e) {
      debugPrint('Error fetching GPS details: $e');
    } finally {
      isLoading.value = false;
    }
  }

  void _populateFieldsFromDevice(GpsDeviceModel d) {
    codeController.text = d.code;
    imeiController.text = d.imei;
    serialNoController.text = d.serialNumber;
    aliasController.text = d.aliasName;
    simNoController.text = d.sim;
    networkController.text = d.network;
    batteryController.text = d.batteryCapacity;
    firmwareController.text = d.firmware;
    notesController.text = d.notes;
    imageUrl.value = d.imageUrl;
    status.value = d.status;

    if (d.installedAt != null && d.installedAt!.isNotEmpty) {
      dateController.text = d.installedAt!.split('T')[0];
    }

    if (vendors.contains(d.vendor)) selectedVendor.value = d.vendor;
    if (models.contains(d.model)) selectedModel.value = d.model;
    if (providers.contains(d.simProvider)) selectedProvider.value = d.simProvider;
    if (networkTypes.contains(d.networkType)) selectedNetworkType.value = d.networkType;
    if (mountingPositions.contains(d.mountingPosition)) selectedMountingPosition.value = d.mountingPosition;
    if (powerWires.contains(d.powerWire)) selectedPowerWire.value = d.powerWire;

    if (d.vehicleId != null && d.vehicleId.toString().isNotEmpty) {
      selectedVehicleId.value = d.vehicleId.toString();
    }
  }

  void selectDate(BuildContext context) async {
    DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime(2035),
    );
    if (picked != null) {
      dateController.text = picked.toIso8601String().split('T')[0];
    }
  }

  void scanImeiCode() {
    // Generate/scan valid 15-digit simulated IMEI
    final randomDigits = List.generate(15, (_) => Random().nextInt(10)).join();
    imeiController.text = randomDigits;
    if (serialNoController.text.isEmpty) {
      serialNoController.text = 'SN-${randomDigits.substring(7)}';
    }
    Get.snackbar(
      'IMEI Captured',
      'Captured 15-digit IMEI code: $randomDigits',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
    );
  }

  Future<void> pickImage(ImageSource source) async {
    try {
      final picker = ImagePicker();
      final picked = await picker.pickImage(source: source, maxWidth: 1024, maxHeight: 1024, imageQuality: 85);
      if (picked != null) {
        selectedImageFile.value = File(picked.path);
        // Upload immediately
        _uploadImage(File(picked.path));
      }
    } catch (e) {
      Get.snackbar('Image Error', 'Failed to pick image: $e');
    }
  }

  Future<void> _uploadImage(File file) async {
    try {
      final res = await HttpClientService.to.uploadFile(
        filePath: file.path,
        endpoint: ApiConstants.uploads,
        fileField: 'file',
        purpose: 'gps_device',
      );
      if (res.success && res.data != null) {
        final url = res.data!['url'] ?? res.data!['path'] ?? res.data!['file_url'];
        if (url != null) {
          imageUrl.value = url.toString();
          Get.snackbar(
            'Photo Uploaded',
            'Hardware photo uploaded successfully',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
          );
        }
      }
    } catch (e) {
      debugPrint('Upload failed: $e');
    }
  }

  Future<void> submitForm() async {
    if (imeiController.text.trim().isEmpty) {
      Get.snackbar(
        'Required Field Missing',
        'Please enter or scan the 15-digit GPS IMEI code.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
      return;
    }

    isSubmitting.value = true;
    try {
      final payload = <String, dynamic>{
        'code': codeController.text.trim().isNotEmpty
            ? codeController.text.trim()
            : 'GPS-TRK-${10000 + Random().nextInt(90000)}',
        'imei': imeiController.text.trim(),
        'type': selectedType.value,
        'vendor': selectedVendor.value,
        'model': selectedModel.value,
        'serial_number': serialNoController.text.trim(),
        'alias_name': aliasController.text.trim(),
        'sim': simNoController.text.trim(),
        'sim_provider': selectedProvider.value,
        'network': networkController.text.trim().isNotEmpty
            ? networkController.text.trim()
            : '${selectedProvider.value} 4G IoT',
        'network_type': selectedNetworkType.value,
        'battery_capacity': batteryController.text.trim().isNotEmpty ? batteryController.text.trim() : '1200 mAh',
        'firmware': firmwareController.text.trim().isNotEmpty ? firmwareController.text.trim() : 'v3.2.14-PROD',
        'mounting_position': selectedMountingPosition.value,
        'power_wire': selectedPowerWire.value,
        'installation_date': dateController.text.trim(),
        'notes': notesController.text.trim(),
        'image_url': imageUrl.value,
        'status': selectedVehicleId.value != null ? 'assigned' : status.value,
        if (selectedVehicleId.value != null) 'vehicle_id': selectedVehicleId.value,
      };

      if (isEditMode.value) {
        final res = await FleetService.to.updateGpsDevice(deviceId, payload);
        if (res.success) {
          Get.back(result: true);
          Get.snackbar(
            'Updated',
            'GPS Device configuration updated successfully!',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
          );
        } else {
          Get.snackbar(
            'Error',
            res.message ?? 'Failed to update GPS device',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: Colors.redAccent,
            colorText: Colors.white,
          );
        }
      } else {
        final res = await FleetService.to.createGpsDevice(payload);
        if (res.success) {
          Get.back(result: true);
          Get.snackbar(
            'Registered',
            'GPS Device registered successfully!',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
          );
        } else {
          Get.snackbar(
            'Error',
            res.message ?? 'Failed to register GPS device',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: Colors.redAccent,
            colorText: Colors.white,
          );
        }
      }
    } catch (e) {
      Get.snackbar('Error', 'Submission failed: $e');
    } finally {
      isSubmitting.value = false;
    }
  }

  @override
  void onClose() {
    codeController.dispose();
    imeiController.dispose();
    serialNoController.dispose();
    aliasController.dispose();
    simNoController.dispose();
    networkController.dispose();
    batteryController.dispose();
    firmwareController.dispose();
    dateController.dispose();
    notesController.dispose();
    super.onClose();
  }
}
