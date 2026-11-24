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
  bool fromDetails = false;

  int get availableCount => drivers.where((d) => d.isAvailable).length;
  int get assignedCount => drivers.where((d) => d.isAssigned).length;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    vehicleName = (args is Map) ? (args['vehicleName'] ?? 'MH12AB1234') : 'MH12AB1234';
    fleetName = (args is Map) ? (args['fleetName'] ?? 'City Bus Fleet') : 'City Bus Fleet';
    vehicleType = (args is Map) ? (args['vehicleType'] ?? 'Bus') : 'Bus';
    vehicleId = (args is Map) ? args['vehicleId'] : null;
    fromDetails = (args is Map) ? (args['fromDetails'] == true) : false;

    searchController.addListener(() {
      searchPattern.value = searchController.text.trim();
      _filterDrivers();
    });

    ever(selectedTab, (_) => _filterDrivers());

    fetchDrivers();
  }

  Future<void> fetchDrivers() async {
    isLoading.value = true;
    try {
      if (Get.isRegistered<FleetService>()) {
        final res = await FleetService.to.getDrivers(limit: 100);
        if (res.success && res.data != null && res.data!.isNotEmpty) {
          final mapped = res.data!.map((d) {
            final isAssigned = (d.assignedBusId != null &&
                    d.assignedBusId!.trim().isNotEmpty &&
                    d.assignedBusId != '0') ||
                (d.assignedVehicleReg != null && d.assignedVehicleReg!.trim().isNotEmpty) ||
                d.status.toLowerCase() == 'assigned';
            return DriverModel(
              id: d.id,
              name: d.name.isNotEmpty ? d.name : 'Driver #${d.id}',
              empId: d.empId.isNotEmpty ? d.empId : 'EMP-${d.id}',
              dlNo: d.licenseNumber.isNotEmpty ? d.licenseNumber : 'N/A',
              dlExpiry: d.dlExpiry.isNotEmpty ? d.dlExpiry : 'N/A',
              status: isAssigned
                  ? 'Assigned'
                  : (d.status.isNotEmpty
                      ? d.status
                      : (d.documentsVerified ? 'Available' : 'Pending Verification')),
              avatarUrl: d.avatarUrl,
              phone: d.phone,
              assignedBusId: d.assignedBusId,
              assignedVehicleReg: d.assignedVehicleReg,
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
          id: '1',
          name: 'Rajesh Kumar',
          empId: 'EMP00123',
          dlNo: 'DL12345678',
          dlExpiry: '15 Dec 2025',
          status: 'Available',
        ),
        DriverModel(
          id: '2',
          name: 'Priya Sharma',
          empId: 'EMP00124',
          dlNo: 'DL87654321',
          dlExpiry: '20 Jan 2026',
          status: 'Available',
        ),
        DriverModel(
          id: '3',
          name: 'Amit Verma',
          empId: 'EMP00125',
          dlNo: 'DL56781234',
          dlExpiry: '10 Aug 2026',
          status: 'Assigned',
          assignedBusId: '5',
          assignedVehicleReg: 'MH12AB1234',
        ),
      ]);
      _filterDrivers();
    }
  }

  void _filterDrivers() {
    final query = searchPattern.value.toLowerCase().trim();
    final isAvailableTab = selectedTab.value == 'Available';

    final tabList = drivers.where((d) {
      if (isAvailableTab) {
        return d.isAvailable;
      } else {
        return d.isAssigned;
      }
    }).toList();

    if (query.isEmpty) {
      filteredDrivers.assignAll(tabList);
    } else {
      filteredDrivers.assignAll(tabList.where((d) {
        return d.name.toLowerCase().contains(query) ||
            d.empId.toLowerCase().contains(query) ||
            d.dlNo.toLowerCase().contains(query) ||
            (d.phone != null && d.phone!.toLowerCase().contains(query));
      }).toList());
    }
  }

  void switchTab(String tab) {
    selectedTab.value = tab;
    _filterDrivers();
    selectedTab.refresh();
    filteredDrivers.refresh();
    update();
  }

  void selectDriver(DriverModel driver) {
    if (isDriverSelected(driver)) {
      selectedDriver.value = null;
    } else {
      selectedDriver.value = driver;
    }
    selectedDriver.refresh();
    filteredDrivers.refresh();
    update();
  }

  bool isDriverSelected(DriverModel driver) {
    final current = selectedDriver.value;
    if (current == null) return false;
    if (driver.id != null &&
        driver.id!.isNotEmpty &&
        current.id != null &&
        current.id!.isNotEmpty) {
      return driver.id == current.id;
    }
    if (driver.empId.isNotEmpty && current.empId.isNotEmpty) {
      return driver.empId == current.empId;
    }
    return driver.name == current.name;
  }

  void goToAddDriver() async {
    final result = await Get.toNamed(Routes.ADD_DRIVER, arguments: {
      'vehicleName': vehicleName,
      'fleetName': fleetName,
      'vehicleType': vehicleType,
      'vehicleId': vehicleId,
    });
    if (result == true || result != null) {
      await fetchDrivers();
    }
  }

  void skipForNow() {
    if (fromDetails || Get.previousRoute == Routes.VEHICLE_DETAILS) {
      Get.back();
      return;
    }
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
        'selection_required'.tr,
        'select_driver_required_msg'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withValues(alpha: 0.8),
        colorText: Colors.white,
      );
      return;
    }

    final driver = selectedDriver.value!;
    final driverId = (driver.id != null && driver.id!.isNotEmpty)
        ? driver.id!
        : (driver.empId.isNotEmpty ? driver.empId : driver.name);

    if (vehicleId != null && Get.isRegistered<FleetService>()) {
      isSubmitting.value = true;
      try {
        final res = await FleetService.to.assignDriverToVehicle(vehicleId.toString(), driverId);
        if (res.success) {
          Get.snackbar(
            'success'.tr,
            'Driver ${driver.name} assigned successfully',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF10B981).withValues(alpha: 0.9),
            colorText: Colors.white,
          );
        } else {
          Get.snackbar(
            'error'.tr,
            (res.message != null && res.message!.isNotEmpty) ? res.message! : 'Failed to assign driver',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: Colors.redAccent.withValues(alpha: 0.8),
            colorText: Colors.white,
          );
        }
      } catch (e) {
        Get.snackbar(
          'error'.tr,
          'Failed to assign driver: $e',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.redAccent.withValues(alpha: 0.8),
          colorText: Colors.white,
        );
      } finally {
        isSubmitting.value = false;
      }
    }

    if (fromDetails || Get.previousRoute == Routes.VEHICLE_DETAILS) {
      Get.back(result: true);
      return;
    }

    Get.toNamed(Routes.ASSIGN_GPS, arguments: {
      'vehicleName': vehicleName,
      'fleetName': fleetName,
      'vehicleType': vehicleType,
      'vehicleId': vehicleId,
      'driverName': driver.name,
      'driverId': driverId,
    });
  }

  @override
  void onClose() {
    searchController.dispose();
    super.onClose();
  }
}
