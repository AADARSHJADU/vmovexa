import 'package:get/get.dart';
import '../controllers/emergency_incidents_controller.dart';

class EmergencyIncidentsBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<EmergencyIncidentsController>(() => EmergencyIncidentsController());
  }
}
