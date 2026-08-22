import 'package:get/get.dart';
import '../../../../../routes/app_routes.dart';

class SetupCompleteController extends GetxController {
  late final String fleetName;
  late final String vehicleName;
  late final String driverName;
  late final String gpsName;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    fleetName = (args is Map) ? (args['fleetName'] ?? 'City Bus Fleet') : 'City Bus Fleet';
    vehicleName = (args is Map) ? (args['vehicleName'] ?? 'MH12AB1234') : 'MH12AB1234';
    driverName = (args is Map) ? (args['driverName'] ?? 'Rajesh Kumar') : 'Rajesh Kumar';
    gpsName = (args is Map) ? (args['gpsName'] ?? 'GPS-TRK-00123') : 'GPS-TRK-00123';
  }

  void viewVehicleDetails() {
    Get.offAllNamed(Routes.FLEET_OP_DASHBOARD);
    Get.toNamed(Routes.VEHICLE_DETAILS, arguments: {
      'vehicleName': vehicleName,
      'fleetName': fleetName,
    });
  }

  void backToFleet() {
    Get.offAllNamed(Routes.FLEET_OP_DASHBOARD);
  }
}
