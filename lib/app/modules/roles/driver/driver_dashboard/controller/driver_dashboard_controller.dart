import 'package:get/get.dart';
import '../../../../../routes/app_routes.dart';

class DriverDashboardController extends GetxController {
  final RxInt selectedNavIndex = 0.obs;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args is Map && args.containsKey('tab')) {
      selectedNavIndex.value = args['tab'];
    }
  }

  void onNavItemTapped(int index) {

    selectedNavIndex.value = index;
  }

  void goToFleetList() {
    Get.toNamed(Routes.FLEET_LIST);
  }

  void goToLiveTracking() {
    Get.toNamed(Routes.LIVE_TRACKING);
  }

  void goToReports() {
    selectedNavIndex.value = 2;
  }

  void goToVehicles() {
    Get.toNamed(Routes.ADD_VEHICLE);
  }

  void goToDrivers() {
    Get.toNamed(Routes.ADD_DRIVER);
  }

  void goToGpsDevices() {
    Get.toNamed(Routes.ADD_GPS);
  }

  void logout() {
    Get.offAllNamed(Routes.LOGIN);
  }
}


