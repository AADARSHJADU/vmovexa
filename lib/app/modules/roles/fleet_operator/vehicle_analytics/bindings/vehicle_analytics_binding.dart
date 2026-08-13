import 'package:get/get.dart';
import '../controllers/vehicle_analytics_controller.dart';

class VehicleAnalyticsBinding extends Bindings {
  @override
  void dependencies() {
    Get.put<VehicleAnalyticsController>(VehicleAnalyticsController());
  }
}
