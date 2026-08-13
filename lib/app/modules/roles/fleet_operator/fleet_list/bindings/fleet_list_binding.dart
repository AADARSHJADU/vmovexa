import 'package:get/get.dart';
import '../controllers/fleet_list_controller.dart';

class FleetListBinding extends Bindings {
  @override
  void dependencies() {
    Get.put<FleetListController>(FleetListController());
  }
}
