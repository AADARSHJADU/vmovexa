import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../routes/app_routes.dart';
import '../../add_gps/controllers/add_gps_controller.dart';

class AssignGpsController extends GetxController {
  final searchController = TextEditingController();
  final RxString selectedTab = 'Available'.obs;
  final RxString searchPattern = ''.obs;

  late final String driverName;

  // Selected device
  final Rxn<GpsModel> selectedGps = Rxn<GpsModel>();

  // GPS Device database list
  final RxList<GpsModel> gpsDevices = <GpsModel>[
    GpsModel(
      id: 'GPS-TRK-00123',
      model: 'Teltonika FMB920',
      simNo: '8991101200001234567',
      battery: '85%',
      signal: 'Strong',
      status: 'Available',
    ),
    GpsModel(
      id: 'GPS-TRK-00124',
      model: 'Teltonika FMB920',
      simNo: '8991101200001234568',
      battery: '78%',
      signal: 'Strong',
      status: 'Available',
    ),
    GpsModel(
      id: 'GPS-TRK-00125',
      model: 'Queclink GV57',
      simNo: '8991101200001234569',
      battery: '65%',
      signal: 'Medium',
      status: 'Available',
    ),
    GpsModel(
      id: 'GPS-TRK-00126',
      model: 'Teltonika FMB125',
      simNo: '8991101200001234570',
      battery: '92%',
      signal: 'Strong',
      status: 'Available',
    ),
  ].obs;

  final RxList<GpsModel> filteredDevices = <GpsModel>[].obs;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    driverName = (args is Map) ? (args['driverName'] ?? 'Rajesh Kumar') : 'Rajesh Kumar';

    filteredDevices.assignAll(gpsDevices);
    searchController.addListener(() {
      searchPattern.value = searchController.text.trim();
      _filterDevices();
    });
  }

  void _filterDevices() {
    String query = searchPattern.value.toLowerCase();
    List<GpsModel> results = gpsDevices.where((g) {
      return g.id.toLowerCase().contains(query) ||
          g.model.toLowerCase().contains(query) ||
          g.simNo.toLowerCase().contains(query);
    }).toList();
    filteredDevices.assignAll(results);
  }

  void selectGps(GpsModel device) {
    selectedGps.value = device;
  }

  void goToAddGps() async {
    final newGpsObj = await Get.toNamed(Routes.ADD_GPS);
    if (newGpsObj != null && newGpsObj is GpsModel) {
      gpsDevices.insert(0, newGpsObj);
      selectedGps.value = newGpsObj;
      _filterDevices();
    }
  }

  void confirmAssignment() {
    if (selectedGps.value == null) {
      Get.snackbar(
        'Selection Required',
        'Please select a GPS device by clicking "Assign" on their card, or connect a new device.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withOpacity(0.8),
        colorText: Colors.white,
      );
      return;
    }

    Get.toNamed(Routes.SETUP_COMPLETE, arguments: {
      'fleetName': 'City Bus Fleet',
      'vehicleName': 'MH12AB1234',
      'driverName': driverName,
      'gpsName': selectedGps.value!.id,
    });
  }

  @override
  void onClose() {
    searchController.dispose();
    super.onClose();
  }
}
