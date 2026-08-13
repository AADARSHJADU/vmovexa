import 'package:get/get.dart';
import '../controllers/add_driver_controller.dart';

class AddDriverBinding extends Bindings {
  @override
  void dependencies() {
    Get.put<AddDriverController>(AddDriverController());
  }
}
