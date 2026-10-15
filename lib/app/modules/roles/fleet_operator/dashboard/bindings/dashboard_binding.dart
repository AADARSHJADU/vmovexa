import 'package:get/get.dart';
import '../controllers/dashboard_controller.dart';
import '../../fleet_list/controllers/fleet_list_controller.dart';
import '../../vehicle_list/views/vehicle_list_view.dart';
import '../../driver_staff/views/driver_staff_view.dart';
import '../../profile/controllers/profile_controller.dart';

class FleetOpDashboardBinding extends Bindings {
  @override
  void dependencies() {
    Get.put<FleetOpDashboardController>(FleetOpDashboardController());
    Get.lazyPut<FleetListController>(() => FleetListController(), fenix: true);
    Get.lazyPut<VehicleListController>(() => VehicleListController(), fenix: true);
    Get.lazyPut<DriverStaffController>(() => DriverStaffController(), fenix: true);
    Get.lazyPut<FleetOpProfileController>(() => FleetOpProfileController(), fenix: true);
  }
}
