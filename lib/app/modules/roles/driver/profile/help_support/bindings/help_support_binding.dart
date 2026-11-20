import 'package:get/get.dart';
import '../controller/driver_help_support_controller.dart';

class DriverHelpSupportBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<DriverHelpSupportController>(() => DriverHelpSupportController());
  }
}
