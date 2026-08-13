import 'package:get/get.dart';
import '../controllers/assign_gps_controller.dart';

class AssignGpsBinding extends Bindings {
  @override
  void dependencies() {
    Get.put<AssignGpsController>(AssignGpsController());
  }
}
