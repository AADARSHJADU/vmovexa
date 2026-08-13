import 'package:get/get.dart';
import '../controllers/add_gps_controller.dart';

class AddGpsBinding extends Bindings {
  @override
  void dependencies() {
    Get.put<AddGpsController>(AddGpsController());
  }
}
