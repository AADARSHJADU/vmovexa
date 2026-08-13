import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../routes/app_routes.dart';
import '../../add_driver/controllers/add_driver_controller.dart';

class AssignDriverController extends GetxController {
  final searchController = TextEditingController();
  final RxString selectedTab = 'Available'.obs;
  final RxString searchPattern = ''.obs;

  // Selected driver
  final Rxn<DriverModel> selectedDriver = Rxn<DriverModel>();

  // Driver database list
  final RxList<DriverModel> drivers = <DriverModel>[
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
    DriverModel(
      name: 'Amit Verma',
      empId: 'EMP00125',
      dlNo: 'DL11223344',
      dlExpiry: '10 Mar 2026',
      status: 'Available',
    ),
    DriverModel(
      name: 'Sandeep Singh',
      empId: 'EMP00126',
      dlNo: 'DL44332211',
      dlExpiry: '05 Feb 2026',
      status: 'Available',
    ),
  ].obs;

  final RxList<DriverModel> filteredDrivers = <DriverModel>[].obs;

  @override
  void onInit() {
    super.onInit();
    filteredDrivers.assignAll(drivers);
    searchController.addListener(() {
      searchPattern.value = searchController.text.trim();
      _filterDrivers();
    });
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
    final newDriverObj = await Get.toNamed(Routes.ADD_DRIVER);
    if (newDriverObj != null && newDriverObj is DriverModel) {
      drivers.insert(0, newDriverObj);
      selectedDriver.value = newDriverObj;
      _filterDrivers();
    }
  }

  void skipForNow() {
    Get.toNamed(Routes.ASSIGN_GPS, arguments: {
      'driverName': 'None Assigned',
    });
  }

  void confirmAssignment() {
    if (selectedDriver.value == null) {
      Get.snackbar(
        'Selection Required',
        'Please select a driver by clicking "Assign" on their card, or click "Skip for Now".',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withOpacity(0.8),
        colorText: Colors.white,
      );
      return;
    }

    Get.toNamed(Routes.ASSIGN_GPS, arguments: {
      'driverName': selectedDriver.value!.name,
    });
  }

  @override
  void onClose() {
    searchController.dispose();
    super.onClose();
  }
}
