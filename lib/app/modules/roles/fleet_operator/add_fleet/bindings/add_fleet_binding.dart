import 'package:get/get.dart';
import '../controllers/add_fleet_controller.dart';

class AddFleetBinding extends Bindings {
  @override
  void dependencies() {
    Get.put<AddFleetController>(AddFleetController());
  }
}
