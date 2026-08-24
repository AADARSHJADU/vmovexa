import 'package:get/get.dart';
import '../controllers/advertiser_dashboard_controller.dart';

class AdvertiserDashboardBinding extends Bindings {
  @override
  void dependencies() {
    Get.put<AdvertiserDashboardController>(AdvertiserDashboardController());
  }
}
