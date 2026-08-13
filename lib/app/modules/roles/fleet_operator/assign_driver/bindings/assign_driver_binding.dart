import 'package:get/get.dart';
import '../controllers/assign_driver_controller.dart';

class AssignDriverBinding extends Bindings {
  @override
  void dependencies() {
    Get.put<AssignDriverController>(AssignDriverController());
  }
}
