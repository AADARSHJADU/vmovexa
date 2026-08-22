import 'package:get/get.dart';
import '../controllers/government_dashboard_controller.dart';

class GovernmentDashboardBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<GovernmentDashboardController>(
      () => GovernmentDashboardController(),
    );
  }
}
