import 'package:get/get.dart';
import '../../alert_notification/controller/alerts_controller.dart';
import '../../device_diagostics/controller/device_diagnostics_controller.dart';
import '../../display_devices/controller/display_devices_controller.dart';
import '../../hardware_configuration/controllers/hardware_config_controller.dart';
import '../../home/controller/home_controller.dart';
import '../../profile/controller/profile_controller.dart';
import '../../work_orders/controller/tech_work_orders_controller.dart';
import '../controller/technician_dashboard_controller.dart';

class TechnicianDashboardBindings extends Bindings {
  @override
  void dependencies() {
    Get.put<TechnicianDashboardController>(TechnicianDashboardController());
    Get.lazyPut<HomeController>(() => HomeController());
    Get.lazyPut<TechWorkOrdersController>(() => TechWorkOrdersController());
    Get.lazyPut<DisplayDevicesController>(() => DisplayDevicesController());
    Get.lazyPut<HardwareConfigController>(() => HardwareConfigController());
    Get.lazyPut<DeviceDiagnosticsController>(() => DeviceDiagnosticsController());
    Get.lazyPut<AlertsController>(() => AlertsController());
    Get.lazyPut<ProfileController>(() => ProfileController());
  }
}
