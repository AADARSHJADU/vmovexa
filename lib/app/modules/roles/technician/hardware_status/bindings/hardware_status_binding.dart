import 'package:get/get.dart';
import '../controller/hardware_status_controller.dart';

class HardwareStatusBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<HardwareStatusController>(() => HardwareStatusController());
  }
}
