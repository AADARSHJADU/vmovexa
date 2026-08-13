import 'package:get/get.dart';
import '../../fleet_list/controllers/fleet_list_controller.dart';
import '../../../../../routes/app_routes.dart';

class FleetDetailsController extends GetxController {
  late final Fleet fleet;

  @override
  void onInit() {
    super.onInit();
    // Retrieve the Fleet object passed from the previous list view
    fleet = Get.arguments ?? Fleet(
      id: 'FLT20240521001',
      name: 'City Bus Fleet',
      status: 'Active',
      vehiclesCount: 0,
      driversCount: 0,
      gpsOnlineCount: 0,
      lastUpdated: 'Just Now',
    );
  }

  void goToAddVehicle() {
    Get.toNamed(Routes.ADD_VEHICLE, arguments: fleet);
  }

  void goToAddDriver() {
    Get.toNamed(Routes.ADD_DRIVER);
  }

  void goToAssignGps() {
    Get.toNamed(Routes.ASSIGN_GPS);
  }

  void backToFleetList() {
    Get.back();
  }
}

