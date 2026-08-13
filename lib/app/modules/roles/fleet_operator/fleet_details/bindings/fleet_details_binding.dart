import 'package:get/get.dart';
import '../controllers/fleet_details_controller.dart';

class FleetDetailsBinding extends Bindings {
  @override
  void dependencies() {
    Get.put<FleetDetailsController>(FleetDetailsController());
  }
}
