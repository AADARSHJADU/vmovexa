import 'package:get/get.dart';
import '../controller/display_devices_controller.dart';

class DisplayDevicesBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<DisplayDevicesController>(() => DisplayDevicesController());
  }
}
