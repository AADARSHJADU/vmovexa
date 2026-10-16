import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:vmovexa/app/data/models/fleet_models.dart';
import 'package:vmovexa/app/data/services/fleet_service.dart';
import 'package:vmovexa/app/data/services/http_client_service.dart';

class AddVehicleController extends GetxController {
  final formKey = GlobalKey<FormState>();

  // Mode & Loading state
  final RxBool isEditMode = false.obs;
  String? editVehicleId;
  final RxBool isLoadingData = false.obs;
  final RxBool isSubmitting = false.obs;

  // Text Form Controllers
  final regNoController = TextEditingController();
  final chassisNoController = TextEditingController();
  final modelNoController = TextEditingController();
  final capacityController = TextEditingController(text: '42');
  final sourceController = TextEditingController();
  final destController = TextEditingController();

  // Dropdown Lists & Selections
  final RxList<FleetItemModel> fleetsList = <FleetItemModel>[].obs;
  final RxnString selectedFleetId = RxnString();
  final RxString initialFleetName = ''.obs;

  final RxList<DepotItemModel> depotsList = <DepotItemModel>[].obs;
  final RxnString selectedDepotId = RxnString();
  final RxString initialDepotName = ''.obs;

  final RxList<DriverItemModel> driversList = <DriverItemModel>[].obs;
  final RxnString selectedDriverId = RxnString();
  final RxString initialDriverName = ''.obs;

  final RxList<RouteItemModel> routesList = <RouteItemModel>[].obs;
  final RxnString selectedRouteId = RxnString();
  final RxString initialRouteName = ''.obs;

  final RxList<GpsDeviceItemModel> gpsList = <GpsDeviceItemModel>[].obs;
  final RxnString selectedGpsDeviceId = RxnString();

  // Classification & Fuel types
  final List<String> vehicleTypes = const [
    'Non-Sleeper',
    '24L Sleeper',
    'Mini Bus',
    'AC Bus',
    'Electric Bus',
  ];
  final RxString selectedVehicleType = 'Non-Sleeper'.obs;

  final List<String> fuelTypes = const [
    'electric',
    'diesel',
    'cng',
    'petrol',
  ];
  final RxString selectedFuelType = 'electric'.obs;

  final RxString status = 'active'.obs;

  // Display Screen Configuration Counters (Matching Admin Panel)
  final RxInt leftDisplay = 2.obs;
  final RxInt rightDisplay = 2.obs;
  final RxInt rearDisplay = 1.obs;
  final RxInt emergencyDisplay = 1.obs;

  int get totalDisplays =>
      leftDisplay.value + rightDisplay.value + rearDisplay.value + emergencyDisplay.value;

  void incrementLeft() => leftDisplay.value++;
  void decrementLeft() {
    if (leftDisplay.value > 0) leftDisplay.value--;
  }

  void incrementRight() => rightDisplay.value++;
  void decrementRight() {
    if (rightDisplay.value > 0) rightDisplay.value--;
  }

  void incrementRear() => rearDisplay.value++;
  void decrementRear() {
    if (rearDisplay.value > 0) rearDisplay.value--;
  }

  void incrementEmergency() => emergencyDisplay.value++;
  void decrementEmergency() {
    if (emergencyDisplay.value > 0) emergencyDisplay.value--;
  }

  // Documents Map (keys: 'rc', 'fitness', 'transport_license', 'insurance')
  final RxMap<String, FleetDocumentModel> documentsMap = <String, FleetDocumentModel>{}.obs;
  final RxBool isUploadingDoc = false.obs;

  // Bus Photos
  final RxList<String> busPhotos = <String>[].obs;
  final RxBool isUploadingPhoto = false.obs;

  final ImagePicker _picker = ImagePicker();

  // Field validation errors
  final RxMap<String, String> fieldErrors = <String, String>{}.obs;

  @override
  void onInit() {
    super.onInit();
    loadDropdownsData();
    _handleArguments();
  }

  void _handleArguments() {
    final args = Get.arguments;
    if (args == null) return;

    if (args is VehicleItemModel) {
      isEditMode.value = true;
      editVehicleId = args.id;
      _populateFromVehicleModel(args);
      _loadVehicleDetails(args.id);
    } else if (args is Map) {
      final mapArgs = Map<String, dynamic>.from(args);
      if (mapArgs['id'] != null || mapArgs['vehicleId'] != null) {
        isEditMode.value = true;
        editVehicleId = (mapArgs['id'] ?? mapArgs['vehicleId']).toString();
        if (mapArgs['vehicle'] is VehicleItemModel) {
          _populateFromVehicleModel(mapArgs['vehicle'] as VehicleItemModel);
        }
        _loadVehicleDetails(editVehicleId!);
      } else if (mapArgs['fleet_id'] != null) {
        // Pre-select fleet when creating from fleet details
        selectedFleetId.value = mapArgs['fleet_id']?.toString();
      }
    } else if (args is String && args.isNotEmpty) {
      isEditMode.value = true;
      editVehicleId = args;
      _loadVehicleDetails(args);
    }
  }

  Future<void> loadDropdownsData() async {
    isLoadingData.value = true;
    try {
      await Future.wait([
        _loadFleets(),
        _loadDepots(),
        _loadDrivers(),
        _loadRoutes(),
        _loadGpsDevices(),
      ]);
    } catch (e) {
      debugPrint('Error loading vehicle form options: $e');
    } finally {
      isLoadingData.value = false;
    }
  }

  Future<void> _loadFleets() async {
    try {
      final res = await FleetService.to.getFleets(limit: 100);
      if (res.success && res.data != null) {
        fleetsList.assignAll(res.data!);
        if (!isEditMode.value && selectedFleetId.value == null && fleetsList.isNotEmpty) {
          selectedFleetId.value = fleetsList.first.id.toString();
        }
      }
    } catch (_) {}
  }

  Future<void> _loadDepots() async {
    try {
      final res = await FleetService.to.getDepots(limit: 100);
      if (res.success && res.data != null) {
        depotsList.assignAll(res.data!);
        if (!isEditMode.value && selectedDepotId.value == null && depotsList.isNotEmpty) {
          selectedDepotId.value = depotsList.first.id.toString();
        }
      }
    } catch (_) {}
  }

  Future<void> _loadDrivers() async {
    try {
      final res = await FleetService.to.getDrivers(limit: 100);
      if (res.success && res.data != null) {
        driversList.assignAll(res.data!);
      }
    } catch (_) {}
  }

  Future<void> _loadRoutes() async {
    try {
      final res = await FleetService.to.getRoutes(limit: 100);
      if (res.success && res.data != null) {
        routesList.assignAll(res.data!);
      }
    } catch (_) {}
  }

  Future<void> _loadGpsDevices() async {
    try {
      final res = await FleetService.to.getGpsDevicesList(limit: 100);
      if (res.success && res.data != null) {
        gpsList.assignAll(res.data!);
      }
    } catch (_) {}
  }

  Future<void> _loadVehicleDetails(String id) async {
    try {
      final res = await FleetService.to.getVehicle(id);
      if (res.success && res.data != null) {
        final data = res.data is Map ? Map<String, dynamic>.from(res.data as Map) : <String, dynamic>{};
        _populateFromMap(data);
      }
    } catch (e) {
      debugPrint('Error loading single vehicle details: $e');
    }
  }

  void _populateFromVehicleModel(VehicleItemModel v) {
    regNoController.text = v.registrationNumber;
    chassisNoController.text = v.vin;
    modelNoController.text = v.model;
    capacityController.text = v.capacity.toString();
    sourceController.text = v.source ?? '';
    destController.text = v.destination ?? '';

    if (vehicleTypes.contains(v.vehicleType)) {
      selectedVehicleType.value = v.vehicleType;
    }
    if (fuelTypes.contains(v.fuelType.toLowerCase())) {
      selectedFuelType.value = v.fuelType.toLowerCase();
    }
    status.value = v.status;

    if (v.fleetName != null && v.fleetName!.isNotEmpty) initialFleetName.value = v.fleetName!;
    if (v.depotName != null && v.depotName!.isNotEmpty) initialDepotName.value = v.depotName!;
    if (v.assignedDriverName != null && v.assignedDriverName!.isNotEmpty) initialDriverName.value = v.assignedDriverName!;
    if (v.assignedRoute != null && v.assignedRoute!.isNotEmpty) initialRouteName.value = v.assignedRoute!;

    if (v.fleetId != null) selectedFleetId.value = v.fleetId.toString();
    if (v.depotId != null) selectedDepotId.value = v.depotId.toString();
    if (v.assignedDriverId != null) selectedDriverId.value = v.assignedDriverId.toString();
    if (v.routeId != null) selectedRouteId.value = v.routeId.toString();
    if (v.gpsDeviceId != null) selectedGpsDeviceId.value = v.gpsDeviceId.toString();

    leftDisplay.value = v.leftDisplays;
    rightDisplay.value = v.rightDisplays;
    rearDisplay.value = v.rearDisplays;
    emergencyDisplay.value = v.emergencyDisplays;

    for (final doc in v.documents) {
      final cat = doc.category.toLowerCase();
      if (cat.contains('rc')) {
        documentsMap['rc'] = doc;
      } else if (cat.contains('fitness')) {
        documentsMap['fitness'] = doc;
      } else if (cat.contains('transport') || cat.contains('license')) {
        documentsMap['transport_license'] = doc;
      } else if (cat.contains('insurance')) {
        documentsMap['insurance'] = doc;
      }
    }

    if (v.photos.isNotEmpty) {
      busPhotos.assignAll(v.photos);
    }
  }

  void _populateFromMap(Map<String, dynamic> data) {
    regNoController.text = (data['bus_number'] ?? data['registration_number'] ?? data['registrationNumber'] ?? '').toString();
    chassisNoController.text = (data['vin'] ?? data['chassis_number'] ?? data['chassisNumber'] ?? '').toString();
    modelNoController.text = (data['model'] ?? '').toString();
    capacityController.text = (data['capacity'] ?? '42').toString();
    sourceController.text = (data['source'] ?? '').toString();
    destController.text = (data['destination'] ?? '').toString();

    final vt = data['vehicle_type'] ?? data['vehicleType'];
    if (vt != null && vehicleTypes.contains(vt.toString())) {
      selectedVehicleType.value = vt.toString();
    }

    final ft = (data['fuel_type'] ?? data['fuelType'] ?? '').toString().toLowerCase();
    if (fuelTypes.contains(ft)) {
      selectedFuelType.value = ft;
    }

    final st = data['status']?.toString();
    if (st != null && st.isNotEmpty) {
      status.value = st;
    }

    final fName = data['fleet_name'] ?? data['fleet']?['name'];
    if (fName != null) initialFleetName.value = fName.toString();
    final dName = data['depot_name'] ?? data['depot']?['name'];
    if (dName != null) initialDepotName.value = dName.toString();
    final drvName = data['assigned_driver_name'] ?? data['driver']?['name'];
    if (drvName != null) initialDriverName.value = drvName.toString();
    final rName = data['assigned_route'] ?? data['route']?['name'];
    if (rName != null) initialRouteName.value = rName.toString();

    final fId = data['fleet_id'] ?? data['fleetId'] ?? data['fleet']?['id'];
    if (fId != null) selectedFleetId.value = fId.toString();

    final dId = data['depot_id'] ?? data['depotId'] ?? data['depot']?['id'];
    if (dId != null) selectedDepotId.value = dId.toString();

    final drvId = data['assigned_driver_id'] ?? data['driver_id'] ?? data['driver']?['id'];
    if (drvId != null) selectedDriverId.value = drvId.toString();

    final rId = data['route_id'] ?? data['routeId'] ?? data['route']?['id'];
    if (rId != null) selectedRouteId.value = rId.toString();

    final gpsId = data['gps_device_id'] ?? data['edge_device_id'] ?? data['gpsDevice']?['serial_number'];
    if (gpsId != null) selectedGpsDeviceId.value = gpsId.toString();

    // Display Layout
    if (data['display_layout'] is Map) {
      final layout = Map<String, dynamic>.from(data['display_layout'] as Map);
      leftDisplay.value = int.tryParse(layout['left_side']?.toString() ?? '2') ?? 2;
      rightDisplay.value = int.tryParse(layout['right_side']?.toString() ?? '2') ?? 2;
      rearDisplay.value = int.tryParse(layout['rear']?.toString() ?? '1') ?? 1;
      emergencyDisplay.value = int.tryParse(layout['emergency_exit']?.toString() ?? '1') ?? 1;
    } else if (data['displays_count'] != null) {
      final total = int.tryParse(data['displays_count'].toString()) ?? 6;
      final perSide = total > 0 ? (total ~/ 3).clamp(1, 10) : 2;
      leftDisplay.value = perSide;
      rightDisplay.value = perSide;
      rearDisplay.value = 1;
      emergencyDisplay.value = (total - (perSide * 2) - 1).clamp(0, 10);
    }

    // Documents
    if (data['documents'] is List) {
      for (final docRaw in (data['documents'] as List)) {
        if (docRaw is Map) {
          final doc = FleetDocumentModel.fromJson(Map<String, dynamic>.from(docRaw));
          final docType = (docRaw['doc_type'] ?? doc.category).toString().toLowerCase();
          if (docType.contains('rc')) {
            documentsMap['rc'] = doc;
          } else if (docType.contains('fitness')) {
            documentsMap['fitness'] = doc;
          } else if (docType.contains('transport') || docType.contains('license')) {
            documentsMap['transport_license'] = doc;
          } else if (docType.contains('insurance')) {
            documentsMap['insurance'] = doc;
          }
        }
      }
    }

    // Bus Photos
    if (data['photos'] is List) {
      busPhotos.assignAll((data['photos'] as List).map((p) => p.toString()));
    } else if (data['bus_images'] is List) {
      busPhotos.assignAll((data['bus_images'] as List).map((p) => p.toString()));
    }
  }

  void onRouteChanged(dynamic routeId) {
    selectedRouteId.value = routeId;
    if (routeId == null) return;

    final matched = routesList.firstWhereOrNull((r) => r.id.toString() == routeId.toString());
    if (matched != null) {
      if (matched.origin.isNotEmpty) sourceController.text = matched.origin;
      if (matched.destination.isNotEmpty) destController.text = matched.destination;
      fieldErrors.remove('source');
      fieldErrors.remove('destination');
    }
  }

  // ---------------- Documents & Photos Upload ----------------
  Future<void> pickAndUploadDocument(String docType, ImageSource source) async {
    try {
      final XFile? file = await _picker.pickImage(source: source, imageQuality: 85);
      if (file == null) return;

      isUploadingDoc.value = true;
      Get.snackbar(
        'Uploading',
        'Uploading $docType document...',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF1E2235),
        colorText: Colors.white,
      );

      final res = await HttpClientService.to.uploadFile(
        filePath: file.path,
        purpose: 'vehicle_document',
      );

      if (res.success && res.data != null) {
        final uploadedUrl = res.data?['url'] ?? res.data?['file_url'] ?? res.data?['filePath'] ?? '';
        final doc = FleetDocumentModel(
          name: file.name,
          category: _formatDocTypeTitle(docType),
          purpose: docType,
          url: uploadedUrl.toString(),
          localPath: file.path,
          uploadedAt: DateTime.now().toIso8601String(),
        );

        documentsMap[docType] = doc;
        Get.snackbar(
          'Uploaded',
          '${_formatDocTypeTitle(docType)} uploaded successfully!',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );
      } else {
        Get.snackbar(
          'Upload Failed',
          res.message ?? 'Failed to upload document',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.redAccent,
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar('Error', 'Upload error: $e', snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.redAccent, colorText: Colors.white);
    } finally {
      isUploadingDoc.value = false;
    }
  }

  void removeDocument(String docType) {
    documentsMap.remove(docType);
  }

  Future<void> pickAndUploadBusPhoto(ImageSource source) async {
    try {
      final XFile? file = await _picker.pickImage(source: source, imageQuality: 85);
      if (file == null) return;

      isUploadingPhoto.value = true;
      final res = await HttpClientService.to.uploadFile(
        filePath: file.path,
        purpose: 'vehicle_photo',
      );

      if (res.success && res.data != null) {
        final uploadedUrl = res.data?['url'] ?? res.data?['file_url'] ?? res.data?['filePath'] ?? '';
        busPhotos.add(uploadedUrl.toString());
        Get.snackbar(
          'Photo Added',
          'Bus photo attached successfully!',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );
      } else {
        Get.snackbar('Upload Failed', res.message ?? 'Failed to upload bus photo', snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.redAccent, colorText: Colors.white);
      }
    } catch (e) {
      Get.snackbar('Error', 'Error uploading photo: $e', snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.redAccent, colorText: Colors.white);
    } finally {
      isUploadingPhoto.value = false;
    }
  }

  void removeBusPhoto(int index) {
    if (index >= 0 && index < busPhotos.length) {
      busPhotos.removeAt(index);
    }
  }

  String _formatDocTypeTitle(String docType) {
    switch (docType) {
      case 'rc':
        return 'Registration Certificate (RC)';
      case 'fitness':
        return 'Fitness Certificate';
      case 'transport_license':
        return 'Commercial Transport License';
      case 'insurance':
        return 'Insurance Policy Paper';
      default:
        return docType.toUpperCase();
    }
  }

  // ---------------- Validation & Submission ----------------
  bool validateForm() {
    fieldErrors.clear();

    final plate = regNoController.text.trim();
    if (plate.isEmpty) {
      fieldErrors['plate'] = 'Registration Plate Number is required';
    } else if (plate.length < 5) {
      fieldErrors['plate'] = 'Registration plate must be at least 5 characters (e.g. MP09-CV-9821)';
    }

    final vin = chassisNoController.text.trim();
    if (vin.isEmpty) {
      fieldErrors['vin'] = 'Chassis / VIN number is required';
    } else if (vin.length < 6) {
      fieldErrors['vin'] = 'Chassis / VIN number must be at least 6 characters';
    }

    final model = modelNoController.text.trim();
    if (model.isEmpty) {
      fieldErrors['model'] = 'Vehicle Model is required (e.g. Starbus Ultra EV)';
    }

    final capacity = int.tryParse(capacityController.text.trim());
    if (capacity == null || capacity < 1 || capacity > 150) {
      fieldErrors['capacity'] = 'Capacity must be a valid number of seats (1 - 150)';
    }

    if (selectedDepotId.value == null && depotsList.isNotEmpty) {
      fieldErrors['depotId'] = 'Please select an assigned home depot';
    }

    if (sourceController.text.trim().isEmpty) {
      fieldErrors['source'] = 'Source station is required';
    }

    if (destController.text.trim().isEmpty) {
      fieldErrors['destination'] = 'Destination terminal is required';
    }

    if (fieldErrors.isNotEmpty) {
      Get.snackbar(
        'Validation Required',
        'Please complete the highlighted mandatory fields before proceeding.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withValues(alpha: 0.9),
        colorText: Colors.white,
      );
      return false;
    }

    return true;
  }

  Future<void> submitVehicle() async {
    if (!validateForm()) return;

    isSubmitting.value = true;

    try {
      final docsPayload = documentsMap.entries.map((e) {
        return {
          'doc_type': e.key,
          'category': e.value.category,
          'file_url': e.value.url,
          'name': e.value.name,
          'approval_status': 'pending',
        };
      }).toList();

      final matchedRoute = routesList.firstWhereOrNull((r) => r.id.toString() == selectedRouteId.value?.toString());

      final payload = {
        'bus_number': regNoController.text.trim(),
        'registration_number': regNoController.text.trim(),
        'vin': chassisNoController.text.trim(),
        'chassis_number': chassisNoController.text.trim(),
        'model': modelNoController.text.trim(),
        'vehicle_type': selectedVehicleType.value,
        'capacity': capacityController.text.trim(),
        'fuel_type': selectedFuelType.value,
        if (selectedFleetId.value != null && selectedFleetId.value!.isNotEmpty) ...{
          'fleet_id': int.tryParse(selectedFleetId.value!) ?? selectedFleetId.value,
          'fleetId': int.tryParse(selectedFleetId.value!) ?? selectedFleetId.value,
        },
        if (selectedDepotId.value != null && selectedDepotId.value!.isNotEmpty) ...{
          'depot_id': int.tryParse(selectedDepotId.value!) ?? selectedDepotId.value,
          'depotId': int.tryParse(selectedDepotId.value!) ?? selectedDepotId.value,
        },
        if (selectedDriverId.value != null && selectedDriverId.value!.isNotEmpty) ...{
          'assigned_driver_id': int.tryParse(selectedDriverId.value!) ?? selectedDriverId.value,
          'driver_id': int.tryParse(selectedDriverId.value!) ?? selectedDriverId.value,
        },
        if (selectedRouteId.value != null && selectedRouteId.value!.isNotEmpty) ...{
          'route_id': int.tryParse(selectedRouteId.value!) ?? selectedRouteId.value,
        },
        'assigned_route': matchedRoute?.name ?? sourceController.text.trim(),
        'source': sourceController.text.trim(),
        'destination': destController.text.trim(),
        'displays_count': totalDisplays,
        'display_layout': {
          'left_side': leftDisplay.value,
          'right_side': rightDisplay.value,
          'rear': rearDisplay.value,
          'emergency_exit': emergencyDisplay.value,
          'total': totalDisplays,
        },
        if (selectedGpsDeviceId.value != null) ...{
          'gps_device_id': selectedGpsDeviceId.value,
          'edge_device_id': selectedGpsDeviceId.value,
        },
        'status': status.value,
        'documents': docsPayload,
        'photos': busPhotos.toList(),
        'bus_images': busPhotos.toList(),
      };

      if (isEditMode.value && editVehicleId != null) {
        final res = await FleetService.to.updateVehicle(editVehicleId!, payload);
        if (res.success) {
          // If GPS Device changed
          if (selectedGpsDeviceId.value != null && selectedGpsDeviceId.value!.isNotEmpty) {
            try {
              await FleetService.to.assignGpsToVehicle(editVehicleId!, selectedGpsDeviceId.value!);
            } catch (_) {}
          }
          // If Driver changed
          if (selectedDriverId.value != null) {
            try {
              await FleetService.to.assignDriverToVehicle(editVehicleId!, selectedDriverId.value!.toString());
            } catch (_) {}
          }

          Get.back(result: true);
          Get.snackbar(
            'Vehicle Updated',
            'Vehicle ${regNoController.text.trim()} updated successfully!',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
          );
        } else {
          Get.snackbar(
            'Update Failed',
            res.message ?? 'Failed to update vehicle',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: Colors.redAccent,
            colorText: Colors.white,
          );
        }
      } else {
        final res = await FleetService.to.addVehicle(payload);
        if (res.success) {
          final newVehicleId = res.data?['id']?.toString();
          if (newVehicleId != null) {
            if (selectedGpsDeviceId.value != null && selectedGpsDeviceId.value!.isNotEmpty) {
              try {
                await FleetService.to.assignGpsToVehicle(newVehicleId, selectedGpsDeviceId.value!);
              } catch (_) {}
            }
            if (selectedDriverId.value != null) {
              try {
                await FleetService.to.assignDriverToVehicle(newVehicleId, selectedDriverId.value!.toString());
              } catch (_) {}
            }
          }

          Get.back(result: true);
          Get.snackbar(
            'Vehicle Registered',
            'Vehicle ${regNoController.text.trim()} successfully registered!',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
          );
        } else {
          Get.snackbar(
            'Registration Failed',
            res.message ?? 'Failed to add vehicle',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: Colors.redAccent,
            colorText: Colors.white,
          );
        }
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        'An unexpected error occurred: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
    } finally {
      isSubmitting.value = false;
    }
  }

  @override
  void onClose() {
    regNoController.dispose();
    chassisNoController.dispose();
    modelNoController.dispose();
    capacityController.dispose();
    sourceController.dispose();
    destController.dispose();
    super.onClose();
  }
}
