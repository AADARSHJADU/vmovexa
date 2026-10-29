import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../data/services/fleet_service.dart';
import '../../../../../routes/app_routes.dart';
import '../../add_driver/controllers/add_driver_controller.dart';

class AssignDriverController extends GetxController {
  final searchController = TextEditingController();
  final RxString selectedTab = 'Available'.obs;
  final RxString searchPattern = ''.obs;
  final RxBool isLoading = false.obs;
  final RxBool isSubmitting = false.obs;

  // Selected driver
  final Rxn<DriverModel> selectedDriver = Rxn<DriverModel>();

  // Driver database list
  final RxList<DriverModel> drivers = <DriverModel>[].obs;
  final RxList<DriverModel> filteredDrivers = <DriverModel>[].obs;

  late final String vehicleName;
  late final String fleetName;
  late final String vehicleType;
  dynamic vehicleId;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    vehicleName = (args is Map) ? (args['vehicleName'] ?? 'MH12AB1234') : 'MH12AB1234';
    fleetName = (args is Map) ? (args['fleetName'] ?? 'City Bus Fleet') : 'City Bus Fleet';
    vehicleType = (args is Map) ? (args['vehicleType'] ?? 'Bus') : 'Bus';
    vehicleId = (args is Map) ? args['vehicleId'] : null;

    searchController.addListener(() {
      searchPattern.value = searchController.text.trim();
      _filterDrivers();
    });

    fetchDrivers();
  }

  Future<void> fetchDrivers() async {
    isLoading.value = true;
    try {
      if (Get.isRegistered<FleetService>()) {
        final res = await FleetService.to.getDrivers(limit: 100);
        if (res.success && res.data != null && res.data!.isNotEmpty) {
          final mapped = res.data!.map((d) {
            return DriverModel(
              name: d.name.isNotEmpty ? d.name : 'Driver #${d.id}',
              empId: d.empId.isNotEmpty ? d.empId : 'EMP-${d.id}',
              dlNo: d.licenseNumber.isNotEmpty ? d.licenseNumber : 'N/A',
              dlExpiry: d.dlExpiry.isNotEmpty ? d.dlExpiry : 'N/A',
              status: d.documentsVerified ? 'Available' : 'Pending Verification',
            );
          }).toList();
          drivers.assignAll(mapped);
          _filterDrivers();
          return;
        }
      }
    } catch (_) {} finally {
      isLoading.value = false;
    }

    // Fallback seed if no drivers in backend
    if (drivers.isEmpty) {
      drivers.assignAll([
        DriverModel(
          name: 'Rajesh Kumar',
          empId: 'EMP00123',
          dlNo: 'DL12345678',
          dlExpiry: '15 Dec 2025',
          status: 'Available',
        ),
        DriverModel(
          name: 'Priya Sharma',
          empId: 'EMP00124',
          dlNo: 'DL87654321',
          dlExpiry: '20 Jan 2026',
          status: 'Available',
        ),
      ]);
      _filterDrivers();
    }
  }

  void _filterDrivers() {
    String query = searchPattern.value.toLowerCase();
    List<DriverModel> results = drivers.where((d) {
      return d.name.toLowerCase().contains(query) ||
          d.empId.toLowerCase().contains(query) ||
          d.dlNo.toLowerCase().contains(query);
    }).toList();
    filteredDrivers.assignAll(results);
  }

  void selectDriver(DriverModel driver) {
    selectedDriver.value = driver;
  }

  void goToAddDriver() async {
    final newDriverObj = await Get.toNamed(Routes.ADD_DRIVER, arguments: {
      'vehicleName': vehicleName,
      'fleetName': fleetName,
      'vehicleType': vehicleType,
      'vehicleId': vehicleId,
    });
    if (newDriverObj != null && newDriverObj is DriverModel) {
      drivers.insert(0, newDriverObj);
      selectedDriver.value = newDriverObj;
      _filterDrivers();
    }
  }

  void skipForNow() {
    Get.toNamed(Routes.ASSIGN_GPS, arguments: {
      'vehicleName': vehicleName,
      'fleetName': fleetName,
      'vehicleType': vehicleType,
      'vehicleId': vehicleId,
      'driverName': 'None Assigned',
    });
  }

  Future<void> confirmAssignment() async {
    if (selectedDriver.value == null) {
      Get.snackbar(
        'Selection Required',
        'Please select a driver by clicking "Assign" on their card, or click "Skip for Now".',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withValues(alpha: 0.8),
        colorText: Colors.white,
      );
      return;
    }

    if (vehicleId != null && Get.isRegistered<FleetService>()) {
      isSubmitting.value = true;
      try {
        final dName = selectedDriver.value!.name;
        await FleetService.to.assignDriverToVehicle(vehicleId.toString(), dName);
      } catch (_) {} finally {
        isSubmitting.value = false;
      }
    }

    Get.toNamed(Routes.ASSIGN_GPS, arguments: {
      'vehicleName': vehicleName,
      'fleetName': fleetName,
      'vehicleType': vehicleType,
      'vehicleId': vehicleId,
      'driverName': selectedDriver.value!.name,
    });
  }

  @override
  void onClose() {
    searchController.dispose();
    super.onClose();
  }
}
