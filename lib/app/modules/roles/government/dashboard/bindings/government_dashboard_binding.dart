import 'package:get/get.dart';
import '../../goverment_profile/controller/goverment_profile_controller.dart';
import '../controllers/government_dashboard_controller.dart';

class GovernmentDashboardBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<GovernmentDashboardController>(
      () => GovernmentDashboardController(),
    );
    Get.lazyPut<GovernmentProfileController>(
      () => GovernmentProfileController(),
    );
  }
}
