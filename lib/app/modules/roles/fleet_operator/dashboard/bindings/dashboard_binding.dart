import 'package:get/get.dart';
import '../controllers/dashboard_controller.dart';

class FleetOpDashboardBinding extends Bindings {
  @override
  void dependencies() {
    Get.put<FleetOpDashboardController>(FleetOpDashboardController());
  }
}
