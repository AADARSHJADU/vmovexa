import 'package:get/get.dart';
import '../controller/device_diagnostics_controller.dart';

class DeviceDiagnosticsBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<DeviceDiagnosticsController>(() => DeviceDiagnosticsController());
  }
}
