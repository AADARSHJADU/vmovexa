import 'package:get/get.dart';
import '../controllers/hardware_config_controller.dart';

class HardwareConfigBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<HardwareConfigController>(() => HardwareConfigController());
  }
}
