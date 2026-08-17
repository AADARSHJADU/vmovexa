import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/driver/home/controller/driver_home_controller.dart';

import '../controller/driver_dashboard_controller.dart';


class DriverDashboardBindings extends Bindings {
  @override
  void dependencies() {
    Get.put<DriverDashboardController>(DriverDashboardController());
    Get.lazyPut<DriverHomeController>(() => DriverHomeController());
    // Get.lazyPut<DisplayDevicesController>(() => DisplayDevicesController());
    // Get.lazyPut<DeviceDiagnosticsController>(() => DeviceDiagnosticsController());
    // Get.lazyPut<AlertsController>(() => AlertsController());
    // Get.lazyPut<ProfileController>(() => ProfileController());
  }
}
